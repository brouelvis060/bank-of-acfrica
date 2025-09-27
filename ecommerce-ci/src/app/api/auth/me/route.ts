import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const payload = verifySession(token);
  if (!payload) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, name: true } });
  return NextResponse.json({ user });
}

