import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerPassword, signSessionToken } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!verifyOwnerPassword(password)) {
      return NextResponse.json(
        { success: false, message: 'Password Owner salah! Akses ditolak.' },
        { status: 401 }
      );
    }

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
