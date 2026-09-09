import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/serverAuth';
import {
  saveVipAccountToDb,
  deleteVipAccountFromDb,
  updateSystemConfigInDb,
  clearAllActivationsFromDb,
  resetPersistentCooldown,
} from '@/lib/firestoreService';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

    const payload = verifySessionToken(token);
    if (!payload || payload.role !== 'owner') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Owner resmi yang dapat melakukan tindakan ini.' },
        { status: 403 }
      );
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'save_vip':
        if (!data?.user || !data?.pass) {
          return NextResponse.json({ success: false, message: 'Data VIP tidak lengkap' }, { status: 400 });
        }
        await saveVipAccountToDb(data);
        return NextResponse.json({ success: true, message: 'Akun VIP berhasil disimpan di database.' });

      case 'delete_vip':
        if (!data?.id) {
          return NextResponse.json({ success: false, message: 'ID akun VIP diperlukan' }, { status: 400 });
        }
        await deleteVipAccountFromDb(data.id);
        return NextResponse.json({ success: true, message: 'Akun VIP berhasil dihapus dari database.' });

      case 'update_config':
        await updateSystemConfigInDb(data);
        return NextResponse.json({ success: true, message: 'Konfigurasi sistem berhasil diperbarui.' });

      case 'clear_activations':
        await clearAllActivationsFromDb();
        return NextResponse.json({ success: true, message: 'Semua riwayat aktivasi dibersihkan.' });

      case 'reset_cooldown':
        if (data?.identifier) {
          await resetPersistentCooldown(data.identifier);
        }
        return NextResponse.json({ success: true, message: 'Cooldown target berhasil direset.' });

      default:
        return NextResponse.json({ success: false, message: 'Aksi tidak dikenali' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Owner action error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses aksi owner.' },
      { status: 500 }
    );
  }
}
