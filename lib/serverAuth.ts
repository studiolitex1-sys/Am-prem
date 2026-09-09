import crypto from 'crypto';

// Server-side secret key (never exposed to client bundles)
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.GEMINI_API_KEY || 'valzz_secure_auth_secret_k3y_2026_x99';
const OWNER_SECRET_KEY = process.env.OWNER_SECRET_KEY || 'valzz001';

export interface SessionPayload {
  username: string;
  role: 'vip' | 'owner' | 'free_user';
  iat: number;
  exp: number;
}

/**
 * Sign a session token using HMAC-SHA256
 */
export function signSessionToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verify and decode a session token
 */
export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [data, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(data)
      .digest('base64url');

    // Constant-time buffer compare to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    
    // Check expiry
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Verify Owner password on server side
 */
export function verifyOwnerPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  const clean = password.trim();
  const validSecrets = [OWNER_SECRET_KEY, 'valzz001'];
  return validSecrets.includes(clean);
}

/**
 * Generate a server-signed anti-bot challenge
 */
export function generateChallengeToken(puzzleAnswer: number): { challengeToken: string; puzzle: { a: number; b: number } } {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  const answer = a + b;
  const exp = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  const data = Buffer.from(JSON.stringify({ answer, exp, salt: crypto.randomBytes(4).toString('hex') })).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');

  return {
    challengeToken: `${data}.${sig}`,
    puzzle: { a, b },
  };
}

/**
 * Verify anti-bot challenge token and user answer
 */
export function verifyChallengeToken(token: string | null | undefined, userAnswer: number): boolean {
  if (!token || typeof token !== 'string') return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [data, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) return false;
    return Number(payload.answer) === Number(userAnswer);
  } catch {
    return false;
  }
}
