import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.city.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? '').trim();
  const isAbidjan = Boolean(body.isAbidjan);
  const isPeri = Boolean(body.isPeri);
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  try {
    const city = await prisma.city.create({ data: { name, isAbidjan, isPeri } });
    return NextResponse.json(city);
  } catch (e) {
    return NextResponse.json({ error: 'cannot create city' }, { status: 400 });
  }
}

