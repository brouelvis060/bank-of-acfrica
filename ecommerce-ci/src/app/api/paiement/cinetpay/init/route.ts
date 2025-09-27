import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const amount = Number(body.amount ?? 0);
  const currency = 'XOF';
  const siteId = process.env.CINETPAY_SITE_ID;
  const apiKey = process.env.CINETPAY_API_KEY;

  if (!siteId || !apiKey) {
    return NextResponse.json({
      mode: 'mock',
      message: 'CinetPay non configuré, réponse simulée',
      redirectUrl: '/paiement/mock',
      amount,
      currency,
    });
  }

  // TODO: Implement real CinetPay transaction creation here
  return NextResponse.json({
    mode: 'real',
    message: 'Integration à compléter',
  });
}

