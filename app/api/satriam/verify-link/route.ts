import { NextRequest, NextResponse } from 'next/server';
import { dispatchValzzVerify, ValzzProviderId } from '@/lib/valzzProviders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, magicLink, provider = 'valzz_auto', sessionCookie } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid!' },
        { status: 400 }
      );
    }

    if (!magicLink || typeof magicLink !== 'string' || magicLink.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Magic link tidak boleh kosong!' },
        { status: 400 }
      );
    }

    const result = await dispatchValzzVerify(
      email,
      magicLink,
      provider as ValzzProviderId,
      sessionCookie
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error verify-link:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Terjadi kesalahan sistem saat verifikasi.' },
      { status: 500 }
    );
  }
}
