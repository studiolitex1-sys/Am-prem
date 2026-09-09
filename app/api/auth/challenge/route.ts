import { NextRequest, NextResponse } from 'next/server';
import { generateChallengeToken, verifyChallengeToken } from '@/lib/serverAuth';

// GET: Generates a new challenge puzzle and server-signed token
export async function GET() {
  const challenge = generateChallengeToken(0);
  return NextResponse.json({
    challengeToken: challenge.challengeToken,
    puzzle: challenge.puzzle,
  });
}

// POST: Validates user solution against the server-signed token
export async function POST(req: NextRequest) {
  try {
    const { challengeToken, answer } = await req.json();
    const isValid = verifyChallengeToken(challengeToken, Number(answer));

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Jawaban verifikasi salah atau challenge telah kadaluarsa!' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verifiedToken: challengeToken,
      message: 'Challenge verifikasi manusia valid.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses challenge' },
      { status: 500 }
    );
  }
}
