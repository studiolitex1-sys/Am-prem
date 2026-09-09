import https from 'https';

const YAPPI_HOST = 'am.yappi.my.id';
const SATRIAM_SEND = 'https://satriam.satriadeveloperz.workers.dev/api/satriam/send-link';
const SATRIAM_VERIFY = 'https://satriam.satriadeveloperz.workers.dev/api/satriam/verify-link';

export type ValzzProviderId = 'valzz_v1' | 'valzz_v2' | 'valzz_auto';

export interface ProviderOption {
  id: ValzzProviderId;
  name: string;
  badge: string;
  description: string;
  isPro?: boolean;
}

export const VALZZ_PROVIDERS: ProviderOption[] = [
  {
    id: 'valzz_auto',
    name: 'Valzz Smart Engine (Auto-Route)',
    badge: 'RECOMMENDED',
    description: 'Rute otomatis tercepat & paling stabil dengan multi-node fallback',
  },
  {
    id: 'valzz_v1',
    name: 'Valzz Cloud Core v1',
    badge: 'FAST CLOUD',
    description: 'Server utama Valzz direct cloud worker dengan latensi rendah',
  },
  {
    id: 'valzz_v2',
    name: 'Valzz Turbo Pro v2',
    badge: 'PRO ENGINE',
    description: 'Server khusus Pro dengan sistem enkripsi session cookie',
    isPro: true,
  },
];

function httpsRequest(options: https.RequestOptions, data: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ statusCode: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error('Request timeout ke server Valzz Provider'));
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// === Valzz Engine 2 (Cookie + Yappi Proxy) ===
export async function getValzzEngine2Cookie(): Promise<string> {
  try {
    const options: https.RequestOptions = {
      hostname: YAPPI_HOST,
      path: '/api/cookie',
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        Accept: 'application/json',
      },
    };
    const res = await httpsRequest(options);
    if (res?.data?.ok && res?.data?.cookie) {
      return res.data.cookie;
    }
    if (res?.data?.cookie) {
      return res.data.cookie;
    }
    throw new Error(res?.data?.error || 'Gagal inisialisasi sesi cookie Valzz Provider');
  } catch (err: any) {
    throw new Error(err?.message || 'Gagal menghubungkan sesi ke Valzz Provider');
  }
}

export async function sendValzzEngine2(
  email: string,
  cookie: string
): Promise<{ success: boolean; message: string; cookie: string }> {
  try {
    const options: https.RequestOptions = {
      hostname: YAPPI_HOST,
      path: '/api/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: `https://${YAPPI_HOST}`,
        Referer: `https://${YAPPI_HOST}/`,
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
      },
    };
    const res = await httpsRequest(options, { email, cookie });
    if (res?.data?.ok || res?.data?.success) {
      return {
        success: true,
        message: 'Magic link terkirim via Valzz Turbo Pro v2!',
        cookie,
      };
    }
    throw new Error(res?.data?.error || res?.data?.message || 'Gagal mengirim link via Valzz Turbo Pro');
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function verifyValzzEngine2(
  email: string,
  link: string,
  cookie?: string
): Promise<{ success: boolean; userData?: any; message: string }> {
  try {
    let activeCookie = cookie;
    if (!activeCookie) {
      activeCookie = await getValzzEngine2Cookie().catch(() => '');
    }

    const options: https.RequestOptions = {
      hostname: YAPPI_HOST,
      path: '/api/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: `https://${YAPPI_HOST}`,
        Referer: `https://${YAPPI_HOST}/`,
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
      },
    };
    const res = await httpsRequest(options, { email, link, cookie: activeCookie });
    if (res?.data?.ok || res?.data?.success) {
      return {
        success: true,
        userData: res.data?.data?.user || res.data?.user || null,
        message: 'Aktivasi Pro berhasil via Valzz Turbo Pro v2!',
      };
    }
    throw new Error(res?.data?.error || res?.data?.message || 'Verifikasi gagal pada Valzz Turbo Pro');
  } catch (err: any) {
    throw new Error(err.message);
  }
}

// === Valzz Engine 1 (Direct Worker) ===
export async function sendValzzEngine1(
  email: string
): Promise<{ success: boolean; message: string; data?: any }> {
  const response = await fetch(SATRIAM_SEND, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Valzz-Provider-Engine/2.0',
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  const data = await response.json().catch(() => null);
  if (data?.success || response.ok) {
    return {
      success: true,
      message: data?.message || 'Magic link berhasil dikirim ke inbox email!',
      data,
    };
  }
  throw new Error(data?.message || data?.error || 'Gagal mengirim magic link via Valzz Core Server.');
}

export async function verifyValzzEngine1(
  email: string,
  magicLink: string
): Promise<{ success: boolean; message: string; data?: any }> {
  const response = await fetch(SATRIAM_VERIFY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Valzz-Provider-Engine/2.0',
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      magicLink: magicLink.trim(),
    }),
  });

  const data = await response.json().catch(() => null);
  if (data?.success || response.ok) {
    return {
      success: true,
      message: data?.message || 'Status Alight Motion Pro Berhasil Diaktifkan!',
      data,
    };
  }
  throw new Error(data?.message || data?.error || 'Gagal memverifikasi tautan pada server Valzz.');
}

// === Unified Smart Dispatcher ===
export async function dispatchValzzSend(
  email: string,
  provider: ValzzProviderId = 'valzz_auto'
): Promise<{
  success: boolean;
  message: string;
  providerUsed: string;
  sessionCookie?: string;
  data?: any;
}> {
  const cleanEmail = email.trim().toLowerCase();

  // If specific v2 requested
  if (provider === 'valzz_v2') {
    try {
      const cookie = await getValzzEngine2Cookie();
      const res = await sendValzzEngine2(cleanEmail, cookie);
      return {
        success: true,
        message: res.message,
        providerUsed: 'Valzz Turbo Pro v2',
        sessionCookie: cookie,
      };
    } catch (err: any) {
      // If user selected v2 explicitly but it failed, attempt smart fallback to v1
      try {
        const fallbackRes = await sendValzzEngine1(cleanEmail);
        return {
          success: true,
          message: 'Magic link terkirim (Dialihkan ke Valzz Cloud Core)',
          providerUsed: 'Valzz Cloud Core v1 (Fallback)',
          data: fallbackRes.data,
        };
      } catch (fallbackErr: any) {
        throw new Error(`Valzz Provider Error: ${err.message}`);
      }
    }
  }

  // If specific v1 requested
  if (provider === 'valzz_v1') {
    const res = await sendValzzEngine1(cleanEmail);
    return {
      success: true,
      message: res.message,
      providerUsed: 'Valzz Cloud Core v1',
      data: res.data,
    };
  }

  // Auto-Route mode: Try v1 first for instant delivery, or fallback to v2
  try {
    const res = await sendValzzEngine1(cleanEmail);
    return {
      success: true,
      message: res.message,
      providerUsed: 'Valzz Smart Engine (Primary Node)',
      data: res.data,
    };
  } catch (err1: any) {
    try {
      const cookie = await getValzzEngine2Cookie();
      const res = await sendValzzEngine2(cleanEmail, cookie);
      return {
        success: true,
        message: res.message,
        providerUsed: 'Valzz Smart Engine (Secondary Turbo Node)',
        sessionCookie: cookie,
      };
    } catch (err2: any) {
      throw new Error(err1.message || err2.message || 'Semua node Valzz Provider sedang sibuk.');
    }
  }
}

export async function dispatchValzzVerify(
  email: string,
  magicLink: string,
  provider: ValzzProviderId = 'valzz_auto',
  sessionCookie?: string
): Promise<{
  success: boolean;
  message: string;
  providerUsed: string;
  userData?: any;
  data?: any;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanLink = magicLink.trim();

  // If specific v2 requested
  if (provider === 'valzz_v2') {
    try {
      const res = await verifyValzzEngine2(cleanEmail, cleanLink, sessionCookie);
      return {
        success: true,
        message: res.message,
        providerUsed: 'Valzz Turbo Pro v2',
        userData: res.userData,
      };
    } catch (err: any) {
      // Try fallback to v1
      try {
        const fallbackRes = await verifyValzzEngine1(cleanEmail, cleanLink);
        return {
          success: true,
          message: 'Verifikasi Pro Berhasil (Valzz Cloud Core)',
          providerUsed: 'Valzz Cloud Core v1 (Fallback)',
          data: fallbackRes.data,
        };
      } catch (fallbackErr: any) {
        throw new Error(`Valzz Provider Error: ${err.message}`);
      }
    }
  }

  // If specific v1 requested
  if (provider === 'valzz_v1') {
    const res = await verifyValzzEngine1(cleanEmail, cleanLink);
    return {
      success: true,
      message: res.message,
      providerUsed: 'Valzz Cloud Core v1',
      data: res.data,
    };
  }

  // Auto-Route mode
  try {
    const res = await verifyValzzEngine1(cleanEmail, cleanLink);
    return {
      success: true,
      message: res.message,
      providerUsed: 'Valzz Smart Engine (Primary Node)',
      data: res.data,
    };
  } catch (err1: any) {
    try {
      const res = await verifyValzzEngine2(cleanEmail, cleanLink, sessionCookie);
      return {
        success: true,
        message: res.message,
        providerUsed: 'Valzz Smart Engine (Secondary Turbo Node)',
        userData: res.userData,
      };
    } catch (err2: any) {
      throw new Error(err1.message || err2.message || 'Verifikasi gagal di seluruh node Valzz Provider.');
    }
  }
}
