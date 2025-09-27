import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];
  const city = String(body.city ?? '').trim();
  const commune = body.commune ? String(body.commune).trim() : null;
  const shippingFee = Number(body.shippingFee ?? 0);

  if (!items.length || !city || !Number.isFinite(shippingFee)) {
    return NextResponse.json({ error: 'invalid order' }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i: any) => String(i.productId)) } },
  });

  let subtotal = 0;
  const orderItems = items.map((i: any) => {
    const product = products.find((p) => p.id === i.productId);
    if (!product) throw new Error('product missing');
    const quantity = Math.max(1, Number(i.quantity ?? 1));
    subtotal += product.price * quantity;
    return { productId: product.id, quantity, unitPrice: product.price };
  });

  const amount = subtotal + shippingFee;

  const order = await prisma.order.create({
    data: {
      amount,
      shippingFee,
      city,
      commune: commune ?? undefined,
      items: { createMany: { data: orderItems } },
    },
    include: { items: true },
  });

  return NextResponse.json(order);
}

