import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cityName = searchParams.get('city');
  if (!cityName) {
    const data = await prisma.commune.findMany({ include: { city: true } });
    return NextResponse.json(data);
  }
  const city = await prisma.city.findUnique({ where: { name: cityName } });
  if (!city) return NextResponse.json([]);
  const data = await prisma.commune.findMany({ where: { cityId: city.id } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? '').trim();
  const cityName = String(body.city ?? '').trim();
  if (!name || !cityName) return NextResponse.json({ error: 'name and city required' }, { status: 400 });
  const city = await prisma.city.findUnique({ where: { name: cityName } });
  if (!city) return NextResponse.json({ error: 'city not found' }, { status: 404 });
  try {
    const commune = await prisma.commune.create({ data: { name, cityId: city.id } });
    return NextResponse.json(commune);
  } catch (e) {
    return NextResponse.json({ error: 'cannot create commune' }, { status: 400 });
  }
}

