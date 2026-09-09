import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { ActivationHistory } from '@/types/portal';

export interface SystemConfig {
  cooldownDuration: number;
  announcementText: string;
  isAnnouncementActive: boolean;
  serverStatus: string;
  updatedAt?: any;
}

export interface VipAccount {
  id: string;
  user: string;
  pass: string;
  note: string;
  created: string;
}

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  cooldownDuration: 60,
  announcementText:
    '⚡ Info Server: Valzz Magic Link AM Pro Lifetime aktif 24 jam by valzzdev. Bebas watermark & XML 5MB+!',
  isAnnouncementActive: true,
  serverStatus: 'online',
};

// === 1. System Config & Settings ===
export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const db = getFirebaseDb();
    const configDoc = await getDoc(doc(db, 'system', 'config'));
    if (configDoc.exists()) {
      return { ...DEFAULT_SYSTEM_CONFIG, ...(configDoc.data() as SystemConfig) };
    }
    // Initialize if doesn't exist
    await setDoc(doc(db, 'system', 'config'), DEFAULT_SYSTEM_CONFIG);
    return DEFAULT_SYSTEM_CONFIG;
  } catch (err) {
    console.warn('Firestore getSystemConfig fallback:', err);
    return DEFAULT_SYSTEM_CONFIG;
  }
}

export function subscribeSystemConfig(onUpdate: (config: SystemConfig) => void): () => void {
  try {
    const db = getFirebaseDb();
    const unsub = onSnapshot(
      doc(db, 'system', 'config'),
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate({ ...DEFAULT_SYSTEM_CONFIG, ...(snapshot.data() as SystemConfig) });
        } else {
          setDoc(doc(db, 'system', 'config'), DEFAULT_SYSTEM_CONFIG).catch(() => {});
          onUpdate(DEFAULT_SYSTEM_CONFIG);
        }
      },
      (error) => {
        console.warn('Firestore subscribeSystemConfig warning:', error);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('subscribeSystemConfig init error:', err);
    return () => {};
  }
}

export async function updateSystemConfigInDb(updates: Partial<SystemConfig>): Promise<void> {
  try {
    const db = getFirebaseDb();
    await setDoc(
      doc(db, 'system', 'config'),
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to update system config in Firestore:', err);
    throw err;
  }
}

// === 2. Persistent Cooldown Database Management ===
export async function getPersistentCooldown(identifier: string): Promise<number> {
  if (!identifier) return 0;
  try {
    const db = getFirebaseDb();
    const safeKey = encodeURIComponent(identifier.toLowerCase().trim()).replace(/\./g, '_');
    const docRef = doc(db, 'cooldowns', safeKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const expiresAt = Number(data?.expiresAt) || 0;
      const now = Date.now();
      if (expiresAt > now) {
        return expiresAt;
      }
    }
    return 0;
  } catch (err) {
    console.warn('getPersistentCooldown error:', err);
    return 0;
  }
}

export async function setPersistentCooldown(
  identifier: string,
  durationSeconds: number
): Promise<number> {
  if (!identifier || durationSeconds <= 0) return 0;
  const now = Date.now();
  const expiresAt = now + durationSeconds * 1000;
  try {
    const db = getFirebaseDb();
    const safeKey = encodeURIComponent(identifier.toLowerCase().trim()).replace(/\./g, '_');
    const docRef = doc(db, 'cooldowns', safeKey);
    await setDoc(
      docRef,
      {
        identifier,
        durationSeconds,
        startedAt: now,
        expiresAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('setPersistentCooldown error:', err);
  }
  return expiresAt;
}

export async function resetPersistentCooldown(identifier: string): Promise<void> {
  if (!identifier) return;
  try {
    const db = getFirebaseDb();
    const safeKey = encodeURIComponent(identifier.toLowerCase().trim()).replace(/\./g, '_');
    const docRef = doc(db, 'cooldowns', safeKey);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('resetPersistentCooldown error:', err);
  }
}

// === 3. Persistent Activations History ===
export function subscribeActivationHistory(
  onUpdate: (history: ActivationHistory[]) => void
): () => void {
  try {
    const db = getFirebaseDb();
    const q = query(collection(db, 'activations'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: ActivationHistory[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            email: data.email || '',
            type: data.type || 'send_link',
            timestamp: Number(data.timestamp) || Date.now(),
            status: data.status || 'success',
            magicLinkSnippet: data.magicLinkSnippet,
            message: data.message,
          });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('subscribeActivationHistory warning:', error);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('subscribeActivationHistory error:', err);
    return () => {};
  }
}

export async function addActivationToDb(item: ActivationHistory): Promise<void> {
  try {
    const db = getFirebaseDb();
    const docId = item.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await setDoc(doc(db, 'activations', docId), {
      ...item,
      savedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('addActivationToDb error:', err);
  }
}

export async function clearAllActivationsFromDb(): Promise<void> {
  try {
    const db = getFirebaseDb();
    const snap = await getDocs(query(collection(db, 'activations'), limit(100)));
    const promises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (err) {
    console.warn('clearAllActivationsFromDb error:', err);
  }
}

// === 4. Persistent VIP Accounts ===
export function subscribeVipAccounts(onUpdate: (accounts: VipAccount[]) => void): () => void {
  try {
    const db = getFirebaseDb();
    const q = query(collection(db, 'vip_accounts'), orderBy('created', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: VipAccount[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            user: data.user || '',
            pass: data.pass || '',
            note: data.note || '',
            created: data.created || '',
          });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('subscribeVipAccounts warning:', error);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('subscribeVipAccounts error:', err);
    return () => {};
  }
}

export async function saveVipAccountToDb(account: VipAccount): Promise<void> {
  try {
    const db = getFirebaseDb();
    const docId = account.id || Date.now().toString();
    await setDoc(
      doc(db, 'vip_accounts', docId),
      {
        ...account,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('saveVipAccountToDb error:', err);
  }
}

export async function deleteVipAccountFromDb(id: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'vip_accounts', id));
  } catch (err) {
    console.warn('deleteVipAccountFromDb error:', err);
  }
}

export async function validateVipAccountInDb(
  user: string,
  pass: string
): Promise<{ valid: boolean; username: string; token?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.trim(), password: pass.trim() }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { valid: true, username: data.username || user, token: data.token };
    }
    return { valid: false, username: '' };
  } catch (err) {
    console.error('validateVipAccount error:', err);
    return { valid: false, username: '' };
  }
}
