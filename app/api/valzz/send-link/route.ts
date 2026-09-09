import { NextRequest, NextResponse } from 'next/server';
import { dispatchValzzSend, ValzzProviderId } from '@/lib/valzzProviders';
import {
  getPersistentCooldown,
  setPersistentCooldown,
  getSystemConfig,
} from '@/lib/firestoreService';
import { verifySessionToken, verifyChallengeToken } from '@/lib/serverAuth';

// In-memory rate limiter per IP to prevent rapid scraping/flooding
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 }); // 1 minute window
    return true;
  }
  if (entry.count >= 15) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // 1. Real Server-side Anti-Scraping / Rate Limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Terlalu banyak permintaan (Rate limit exceeded). Silakan tunggu 1 menit sebelum mencoba lagi.',
        },
        { status: 429 }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

    const body = await req.json();
    const { email, provider = 'valzz_auto', deviceId = '', antiBotToken, authToken } = body;

    const tokenToVerify = headerToken || authToken;
    const sessionPayload = verifySessionToken(tokenToVerify);
    const isAuthenticVip = sessionPayload ? (sessionPayload.role === 'vip' || sessionPayload.role === 'owner') : false;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const trackerId = deviceId || ip || cleanEmail;

    // 2. For non-VIP users, enforce Anti-Bot Challenge & Cooldown
    if (!isAuthenticVip) {
      // Check persistent database cooldown for non-VIP users
      const activeCooldownEnd = await getPersistentCooldown(trackerId);
      const emailCooldownEnd = await getPersistentCooldown(cleanEmail);
      const latestCooldown = Math.max(activeCooldownEnd, emailCooldownEnd);
      const now = Date.now();

      if (latestCooldown > now) {
        const remainingSec = Math.ceil((latestCooldown - now) / 1000);
        return NextResponse.json(
          {
            success: false,
            message: `Mohon tunggu cooldown ${remainingSec} detik sebelum mengirim permintaan baru!`,
            cooldownRemaining: remainingSec,
            cooldownEnd: latestCooldown,
          },
          { status: 429 }
        );
      }
    }

    // 3. Dispatch to Valzz Providers (Node auto routing)
    const result = await dispatchValzzSend(cleanEmail, provider as ValzzProviderId);

    // 4. If success and not VIP, record cooldown in persistent database
    if (!isAuthenticVip && result.success) {
      const config = await getSystemConfig();
      const duration = config.cooldownDuration || 60;
      if (duration > 0) {
        await Promise.all([
          setPersistentCooldown(trackerId, duration),
          setPersistentCooldown(cleanEmail, duration),
        ]);
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/valzz/send-link:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Terjadi kesalahan sistem pada Valzz Provider.',
      },
      { status: 500 }
    );
  }
}
