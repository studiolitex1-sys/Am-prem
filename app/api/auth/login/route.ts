import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  signSessionToken,
  verifyOwnerPassword,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-client';
    const rateLimitKey = `login:${ip}`;

    const rateStatus = checkLoginRateLimit(rateLimitKey);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login gagal! Coba lagi dalam ${rateStatus.remainingSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi!' },
        { status: 400 }
      );
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // 1. Check if it's the Owner
    const isOwnerUser = ['valzzdev', 'valzz', 'owner'].includes(cleanUser);

    if (isOwnerUser && verifyOwnerPassword(cleanPass)) {
      resetLoginAttempts(rateLimitKey);
      const token = signSessionToken({
        username: 'valzzdev (Owner)',
        role: 'owner',
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return NextResponse.json({
        success: true,
        token,
        userType: 'vip',
        role: 'owner',
        username: 'valzzdev (Owner)',
      });
    }

    // 2. Built-in fallback VIP accounts (No leaked passwords)
    const fallbackVipAccounts = [
      { user: 'vip', pass: 'valzz_vip_access_2026', name: 'VIP Member' },
      { user: 'valzzvip', pass: 'valzz_member_access_2026', name: 'Valzz VIP' },
    ];

    const matchedFallback = fallbackVipAccounts.find(
      (a) => a.user.toLowerCase() === cleanUser && a.pass === cleanPass
    );

    if (matchedFallback) {
      resetLoginAttempts(rateLimitKey);
      const token = signSessionToken({
        username: matchedFallback.name,
        role: 'vip',
        iat: Date.now(),
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return NextResponse.json({
        success: true,
        token,
        userType: 'vip',
        role: 'vip',
        username: matchedFallback.name,
      });
    }

    // 3. Check VIP Accounts stored in Firestore Database
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(collection(db, 'vip_accounts'));
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (
          data.user?.toLowerCase().trim() === cleanUser &&
          data.pass?.trim() === cleanPass
        ) {
          resetLoginAttempts(rateLimitKey);
          const token = signSessionToken({
            username: data.user,
            role: 'vip',
            iat: Date.now(),
            exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
          });

          return NextResponse.json({
            success: true,
            token,
            userType: 'vip',
            role: 'vip',
            username: data.user,
          });
        }
      }
    } catch (dbErr) {
      console.warn('Firestore VIP check warning:', dbErr);
    }

    // 4. Invalid credentials
    recordFailedLogin(rateLimitKey);
    return NextResponse.json(
      {
        success: false,
        message: 'Kredensial VIP salah! Hubungi WhatsApp Owner 089671409020 untuk mendapatkan lisensi VIP resmi.',
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses autentikasi server.' },
      { status: 500 }
    );
  }
}
