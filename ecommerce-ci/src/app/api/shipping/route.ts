import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const cityRaw = String(body.city ?? '').trim();

  if (!cityRaw) {
    return NextResponse.json({ error: 'city is required' }, { status: 400 });
  }

  const cityName = capitalize(cityRaw);

  // Fetch city hints if present (optional)
  const city = await prisma.city.findUnique({ where: { name: cityName } });

  let fee = 3000; // default national
  let tier: 'ABIDJAN' | 'PERI_URBAIN' | 'NATIONAL' = 'NATIONAL';

  if (city?.isAbidjan || cityName.toLowerCase() === 'abidjan') {
    fee = 1500;
    tier = 'ABIDJAN';
  } else if (city?.isPeri || PERI_URBAIN.has(cityName)) {
    fee = 2200;
    tier = 'PERI_URBAIN';
  }

  return NextResponse.json({ fee, tier });
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const PERI_URBAIN = new Set(['Anyama', 'Bingerville', 'Songon']);

