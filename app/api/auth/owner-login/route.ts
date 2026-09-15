import { NextRequest, NextResponse } from 'next/server';
import {
  verifyOwnerPassword,
  signSessionToken,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-client';
    const rateLimitKey = `owner-login:${ip}`;

    const rateStatus = checkLoginRateLimit(rateLimitKey);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan gagal! Panel terkunci demi keamanan. Coba lagi dalam ${rateStatus.remainingSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const { password } = await req.json();

    if (!password || typeof password !== 'string' || !verifyOwnerPassword(password)) {
      recordFailedLogin(rateLimitKey);
      return NextResponse.json(
        { success: false, message: 'Password Owner salah! Akses ditolak.' },
        { status: 401 }
      );
    }

    // Success - reset attempts
    resetLoginAttempts(rateLimitKey);

    const token = signSessionToken({
      username: 'valzzdev (Owner)',
      role: 'owner',
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return NextResponse.json({
      success: true,
      token,
      message: 'Owner session berhasil dibuat.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal autentikasi owner.' },
      { status: 500 }
    );
  }
}
