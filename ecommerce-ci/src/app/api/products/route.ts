import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? '').trim();
  const description = String(body.description ?? '').trim();
  const price = Number(body.price ?? 0);
  const stock = Number(body.stock ?? 0);
  if (!name || !description || !Number.isFinite(price)) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }
  const product = await prisma.product.create({ data: { name, description, price: Math.round(price), stock } });
  return NextResponse.json(product);
}

