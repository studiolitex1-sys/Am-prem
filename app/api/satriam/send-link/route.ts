import { NextRequest, NextResponse } from 'next/server';
import { dispatchValzzSend, ValzzProviderId } from '@/lib/valzzProviders';

const cooldownMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const lastRequest = cooldownMap.get(ip);

    if (lastRequest && now - lastRequest < 60000) {
      const remainingSec = Math.ceil((60000 - (now - lastRequest)) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: `Mohon tunggu cooldown ${remainingSec} detik sebelum mengirim permintaan baru!`,
          cooldownRemaining: remainingSec,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, provider = 'valzz_auto' } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid!' },
        { status: 400 }
      );
    }

    const result = await dispatchValzzSend(email, provider as ValzzProviderId);
    cooldownMap.set(ip, now);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error send-link:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Terjadi kesalahan sistem Valzz Provider.' },
      { status: 500 }
    );
  }
}
