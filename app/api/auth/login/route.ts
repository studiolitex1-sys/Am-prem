import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signSessionToken, verifyOwnerPassword } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
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
    if (cleanUser === 'valzzdev' || cleanUser === 'valzz' || cleanUser === 'owner') {
      if (verifyOwnerPassword(cleanPass)) {
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
    }

    // 2. Check VIP Accounts stored in Firestore Database
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(collection(db, 'vip_accounts'));
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (
          data.user?.toLowerCase().trim() === cleanUser &&
          data.pass?.trim() === cleanPass
        ) {
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

    // 3. Invalid credentials
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
