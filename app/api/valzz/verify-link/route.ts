import { NextRequest, NextResponse } from 'next/server';
import { dispatchValzzVerify, ValzzProviderId } from '@/lib/valzzProviders';
import { addActivationToDb } from '@/lib/firestoreService';
import { verifySessionToken } from '@/lib/serverAuth';

// In-memory rate limiter per IP
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }
  if (entry.count >= 20) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak permintaan verifikasi. Silakan tunggu 1 menit.' },
        { status: 429 }
      );
    }

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

    const cleanEmail = email.trim().toLowerCase();
    const result = await dispatchValzzVerify(
      cleanEmail,
      magicLink.trim(),
      provider as ValzzProviderId,
      sessionCookie
    );

    // Save persistent verification record to Firestore database
    if (result.success) {
      await addActivationToDb({
        id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        type: 'verified',
        timestamp: Date.now(),
        status: 'success',
        magicLinkSnippet: magicLink.trim().substring(0, 35) + '...',
        message: result.message || `Pro Active via ${result.providerUsed}`,
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/valzz/verify-link:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Terjadi kesalahan sistem pada Valzz Provider saat verifikasi.',
      },
      { status: 500 }
    );
  }
}
