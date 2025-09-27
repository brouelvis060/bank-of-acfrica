import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // TODO: Valider la signature et mettre à jour la commande
  return NextResponse.json({ ok: true });
}

