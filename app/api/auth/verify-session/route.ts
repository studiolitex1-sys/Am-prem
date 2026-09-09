import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

    if (!token) {
      return NextResponse.json({ valid: false, message: 'No token provided' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ valid: false, message: 'Token invalid or expired' }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      userType: payload.role === 'owner' || payload.role === 'vip' ? 'vip' : 'free_user',
      role: payload.role,
      username: payload.username,
      exp: payload.exp,
    });
  } catch {
    return NextResponse.json({ valid: false, message: 'Verification error' }, { status: 500 });
  }
}
