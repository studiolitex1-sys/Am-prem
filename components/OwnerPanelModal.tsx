'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Server,
  Zap,
  Activity,
  UserCheck,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Send,
  Link2,
  Trash2,
  Volume2,
  MessageCircle,
  Clock,
  Sparkles,
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Radio,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ThemeConfig } from '@/types/portal';
import {
  subscribeVipAccounts,
  saveVipAccountToDb,
  deleteVipAccountFromDb,
  VipAccount,
} from '@/lib/firestoreService';

interface OwnerPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  cooldownDuration: number;
  onUpdateCooldownDuration: (seconds: number) => void;
  announcementText: string;
  onUpdateAnnouncement: (text: string) => void;
  isAnnouncementActive: boolean;
  onToggleAnnouncement: (active: boolean) => void;
  onResetUserCooldown: () => void;
}

export default function OwnerPanelModal({
  isOpen,
  onClose,
  theme,
  cooldownDuration,
  onUpdateCooldownDuration,
  announcementText,
  onUpdateAnnouncement,
  isAnnouncementActive,
  onToggleAnnouncement,
  onResetUserCooldown,
}: OwnerPanelModalProps) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && !!sessionStorage.getItem('valzz_owner_token');
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVipPasswords, setShowVipPasswords] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'tools' | 'vip' | 'broadcast' | 'templates'>('status');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Direct bypass test tools
  const [testEmail, setTestEmail] = useState('');
  const [testLink, setTestLink] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Ping test
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'online' | 'error'>('idle');
  const [pingMs, setPingMs] = useState<number | null>(null);

  // VIP Key Generator with Firestore Sync (No hardcoded credentials)
  const [generatedVipList, setGeneratedVipList] = useState<VipAccount[]>([]);
  const [ownerToken, setOwnerToken] = useState<string>(() => {
    try {
      return (typeof window !== 'undefined' && sessionStorage.getItem('valzz_owner_token')) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const unsub = subscribeVipAccounts((accounts) => {
      if (accounts.length > 0) {
        setGeneratedVipList(accounts);
      }
    });
    return () => unsub();
  }, []);

  const [newVipUser, setNewVipUser] = useState('');
  const [newVipPass, setNewVipPass] = useState('');
  const [newVipNote, setNewVipNote] = useState('');

  // Editable announcement draft
  const [draftAnnouncement, setDraftAnnouncement] = useState(announcementText);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsUnlocked(true);
        setOwnerToken(data.token);
        try {
          sessionStorage.setItem('valzz_owner_token', data.token);
        } catch (e) {}
        setPasswordInput('');
      } else {
        setErrorMsg(data.message || 'Password Owner salah! Akses ditolak.');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server autentikasi.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setOwnerToken('');
    try {
      sessionStorage.removeItem('valzz_owner_token');
    } catch (e) {}
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunPingTest = async () => {
    setPingStatus('testing');
    const start = performance.now();
    try {
      const res = await fetch('/api/valzz/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ownerToken ? { Authorization: `Bearer ${ownerToken}` } : {}),
        },
        body: JSON.stringify({ email: 'ping-test@valzzdev.com', authToken: ownerToken }),
      });
      const duration = Math.round(performance.now() - start);
      setPingMs(duration);
      setPingStatus('online');
    } catch (err) {
      setPingStatus('error');
    }
  };

  const handleDirectSendTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      alert('Masukkan email valid untuk uji coba bypass.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/valzz/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ownerToken ? { Authorization: `Bearer ${ownerToken}` } : {}),
        },
        body: JSON.stringify({
          email: testEmail.trim().toLowerCase(),
          authToken: ownerToken,
          isVip: true,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err?.message || 'Gagal bypass send link' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddVipKey = async () => {
    if (!newVipUser.trim() || !newVipPass.trim()) {
      alert('Username dan Password VIP tidak boleh kosong.');
      return;
    }
    const newEntry = {
      id: Date.now().toString(),
      user: newVipUser.trim(),
      pass: newVipPass.trim(),
      note: newVipNote.trim() || 'Custom VIP License',
      created: new Date().toISOString().split('T')[0],
    };
    const updated = [newEntry, ...generatedVipList];
    setGeneratedVipList(updated);
    try {
      await fetch('/api/auth/owner-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ action: 'save_vip', data: newEntry }),
      });
    } catch (e) {}
    setNewVipUser('');
    setNewVipPass('');
    setNewVipNote('');
  };

  const handleDeleteVipKey = async (id: string) => {
    const updated = generatedVipList.filter((k) => k.id !== id);
    setGeneratedVipList(updated);
    try {
      await fetch('/api/auth/owner-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ action: 'delete_vip', data: { id } }),
      });
    } catch (e) {}
  };

  const handleSaveAnnouncement = () => {
    onUpdateAnnouncement(draftAnnouncement);
    alert('Pengumuman siaran berhasil diperbarui!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          id="owner-panel-modal"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">Owner Control Panel</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    valzzdev
                  </span>
                </div>
                <p className="text-xs text-slate-400">Pusat Kendali Server, Cooldown, VIP & Endpoint</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isUnlocked && (
                <button
                  onClick={handleLock}
                  id="btn-lock-owner-panel"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Kunci Panel"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Kunci</span>
                </button>
              )}
              <button
                onClick={onClose}
                id="btn-close-owner-panel"
                className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {!isUnlocked ? (
              /* Password Gate */
              <div className="max-w-md mx-auto py-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-100">Akses Terkunci: Owner Only</h4>
                  <p className="text-xs text-slate-400">
                    Masukkan Password Owner resmi untuk membuka panel kendali administrator.
                  </p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-3">
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan Password Owner..."
                      id="input-owner-password"
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      id="btn-toggle-owner-pw-visibility"
                      className="absolute right-3 p-1.5 text-slate-500 hover:text-slate-300 transition"
                      title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    id="btn-submit-owner-password"
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <Unlock className="w-4 h-4" /> Buka Owner Panel
                  </button>
                </form>

                <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800">
                  Akses Terproteksi Enkripsi • Khusus Developer <strong>valzzdev</strong>
                </div>
              </div>
            ) : (
              /* Unlocked Owner Control Center */
              <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                  <button
                    onClick={() => setActiveTab('status')}
                    id="tab-owner-status"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'status'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" /> Status & Server
                  </button>
                  <button
                    onClick={() => setActiveTab('tools')}
                    id="tab-owner-tools"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'tools'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Bypass Tester & Cooldown
                  </button>
                  <button
                    onClick={() => setActiveTab('vip')}
                    id="tab-owner-vip"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'vip'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> VIP Key Manager
                  </button>
                  <button
                    onClick={() => setActiveTab('broadcast')}
                    id="tab-owner-broadcast"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'broadcast'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Pengumuman Banner
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    id="tab-owner-templates"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'templates'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Template Chat WA
                  </button>
                </div>

                {/* TAB 1: Status & Server Metrics */}
                {activeTab === 'status' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Status Valzz Multi-Cloud
                        </span>
                        <div className="text-sm font-bold text-emerald-400">Valzz Provider: ONLINE</div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          valzz-cloud-provider (Smart Multi-Node)
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-cyan-400" /> Response Ping Test
                        </span>
                        <div className="text-sm font-bold text-cyan-400">
                          {pingMs !== null ? `${pingMs} ms` : 'Belum di-test'}
                        </div>
                        <button
                          onClick={handleRunPingTest}
                          disabled={pingStatus === 'testing'}
                          className="text-[10px] text-slate-400 hover:text-slate-200 underline flex items-center gap-1 mt-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
                          {pingStatus === 'testing' ? 'Testing...' : 'Tes Ping Sekarang'}
                        </button>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-400" /> Cooldown Free User
                        </span>
                        <div className="text-sm font-bold text-amber-400">
                          {cooldownDuration > 0 ? `${cooldownDuration} Detik` : 'Nonaktif (0s)'}
                        </div>
                        <p className="text-[10px] text-slate-500">Bisa diatur di Tab Bypass</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Server className="w-4 h-4 text-rose-400" /> Endpoints Proxy Aktif:
                      </h4>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <span className="text-emerald-400 font-bold mr-2">POST</span>
                            <span className="text-slate-300">/api/valzz/send-link</span>
                          </div>
                          <span className="text-[10px] text-slate-500">Valzz Provider Engine (v1/v2)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <span className="text-cyan-400 font-bold mr-2">POST</span>
                            <span className="text-slate-300">/api/valzz/verify-link</span>
                          </div>
                          <span className="text-[10px] text-slate-500">Valzz Provider Engine (v1/v2)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Bypass Tools & Cooldown Controls */}
                {activeTab === 'tools' && (
                  <div className="space-y-5">
                    {/* Cooldown Settings */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" /> Atur Cooldown Pengguna Free
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Ubah durasi jeda waktu kirim link untuk pengguna gratis
                          </p>
                        </div>
                        <button
                          onClick={onResetUserCooldown}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition"
                        >
                          Hapus Cooldown Saya Sekarang
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {[0, 30, 60, 120, 180].map((sec) => (
                          <button
                            key={sec}
                            onClick={() => onUpdateCooldownDuration(sec)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition ${
                              cooldownDuration === sec
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                            }`}
                          >
                            {sec === 0 ? '0 Detik (Mati)' : `${sec} Detik`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Direct Bypass Tester */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-rose-400" /> Tes Kirim Magic Link (Bypass Iklan & Cooldown)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Kirim link aktivasi langsung ke email target tanpa captcha dan tanpa gateway iklan.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Masukkan email tester..."
                          className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        />
                        <button
                          onClick={handleDirectSendTest}
                          disabled={isTesting}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                        >
                          {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Kirim Link
                        </button>
                      </div>

                      {testResult && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                          <span className="text-emerald-400 font-bold">Respon Server:</span>
                          <pre className="overflow-x-auto text-[10px] text-slate-400 bg-slate-950 p-2 rounded">
                            {JSON.stringify(testResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: VIP Key Manager */}
                {activeTab === 'vip' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-400" /> Tambah Kredensial Akun VIP Baru
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={newVipUser}
                          onChange={(e) => setNewVipUser(e.target.value)}
                          placeholder="Username (contoh: buyer_reza)"
                          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500"
                        />
                        <input
                          type="text"
                          value={newVipPass}
                          onChange={(e) => setNewVipPass(e.target.value)}
                          placeholder="Password (contoh: pass990)"
                          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500"
                        />
                        <input
                          type="text"
                          value={newVipNote}
                          onChange={(e) => setNewVipNote(e.target.value)}
                          placeholder="Catatan / Pembeli"
                          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500"
                        />
                      </div>
                      <button
                        onClick={handleAddVipKey}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Simpan Kredensial VIP
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-300">Daftar Akun VIP Tersimpan:</h4>
                        <button
                          type="button"
                          onClick={() => setShowVipPasswords(!showVipPasswords)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                        >
                          {showVipPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showVipPasswords ? 'Sembunyikan Password' : 'Lihat Password'}</span>
                        </button>
                      </div>

                      {generatedVipList.map((k) => (
                        <div
                          key={k.id}
                          className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-bold text-slate-200">User: {k.user}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-amber-400 font-bold">
                                Pass: {showVipPasswords ? k.pass : '••••••••'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{k.note} • {k.created}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopy(`User: ${k.user}\nPass: ${k.pass}`, k.id)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition"
                              title="Salin Akun"
                            >
                              {copiedId === k.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteVipKey(k.id)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-xs transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: Announcement Banner */}
                {activeTab === 'broadcast' && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-cyan-400" /> Siaran Banner Atas
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tampilkan pesan berjalan / pengumuman penting di bagian atas website
                        </p>
                      </div>
                      <button
                        onClick={() => onToggleAnnouncement(!isAnnouncementActive)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          isAnnouncementActive
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isAnnouncementActive ? 'Aktif (ON)' : 'Nonaktif (OFF)'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Teks Pengumuman:</label>
                      <textarea
                        value={draftAnnouncement}
                        onChange={(e) => setDraftAnnouncement(e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        placeholder="Tulis pengumuman di sini..."
                      />
                      <button
                        onClick={handleSaveAnnouncement}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition"
                      >
                        Simpan & Terapkan Banner
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 5: WhatsApp Chat Templates */}
                {activeTab === 'templates' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-400" /> Template Pesan WhatsApp (089671409020)
                    </h4>

                    {[
                      {
                        title: 'Format Pengiriman Akun VIP ke Pembeli',
                        id: 't1',
                        text: `*VALZZ ALIGHT MOTION PRO - VIP ACCESS*\n\nHalo Kak! Berikut kredensial login akun VIP Anda:\n\n🌐 Portal: valzz-ampro.vercel.app\n👤 Username: [USERNAME]\n🔑 Password: [PASSWORD]\n\n✨ Keuntungan VIP:\n- Tanpa Iklan Sama Sekali\n- Tanpa Cooldown 1 Menit\n- Garansi Penuh Replace\n\nTerima kasih sudah order di *valzzdev*!`,
                      },
                      {
                        title: 'Format Pricelist Akun VIP Alight Motion',
                        id: 't2',
                        text: `*PROMO ALIGHT MOTION PRO LIFETIME - BY VALZZDEV*\n\n🔥 VIP Member Akses:\n- 1 Bulan: Rp 10.000\n- Lifetime / Selamanya: Rp 20.000\n\n⚡ Fitur:\n- No Watermark\n- Support XML 5MB+\n- Export 4K 60FPS\n- Login akun sendiri aman 100%\n\nMinat? Langsung balas chat ini ya!`,
                      },
                      {
                        title: 'Panduan Singkat Mengambil Magic Link',
                        id: 't3',
                        text: `*CARA AMBIL MAGIC LINK ALIGHT MOTION:*\n1. Buka Gmail yang kamu daftarkan.\n2. Buka email dari Alight Creative / Motion.\n3. *TEKAN LAMA* tombol "Sign in to Alight Motion", lalu pilih *Salin URL / Salin Alamat Tautan*.\n4. Tempel link tersebut di website Langkah 2.\n5. Selesai, Pro aktif!`,
                      },
                    ].map((t) => (
                      <div key={t.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{t.title}</span>
                          <button
                            onClick={() => handleCopy(t.text, t.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition"
                          >
                            {copiedId === t.id ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                <Check className="w-3.5 h-3.5" /> Tersalin
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Salin Teks
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-[10px] text-slate-400 whitespace-pre-wrap font-sans bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                          {t.text}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Valzz Alight Motion Pro Panel • <strong>by valzzdev</strong></span>
            <span>Akses: <strong>Restricted Administrator</strong></span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
