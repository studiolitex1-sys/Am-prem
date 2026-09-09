'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  ShieldCheck,
  Link2,
  Mail,
  Sparkles,
  AlertCircle,
  Award,
  Check,
  ClipboardPaste,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Smartphone,
  Cpu,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeConfig, ActivationHistory } from '@/types/portal';
import { VALZZ_PROVIDERS, ValzzProviderId } from '@/lib/valzzProviders';
import AdGatewayModal from './AdGatewayModal';

interface StepVerifyLinkProps {
  theme: ThemeConfig;
  userType: 'vip' | 'free_user';
  defaultEmail?: string;
  defaultProvider?: ValzzProviderId;
  defaultSessionCookie?: string;
  onAddHistory: (item: ActivationHistory) => void;
}

export default function StepVerifyLink({
  theme,
  userType,
  defaultEmail = '',
  defaultProvider = 'valzz_auto',
  defaultSessionCookie = '',
  onAddHistory,
}: StepVerifyLinkProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [prevDefaultEmail, setPrevDefaultEmail] = useState(defaultEmail);
  const [selectedProvider, setSelectedProvider] = useState<ValzzProviderId>(defaultProvider);
  const [sessionCookie, setSessionCookie] = useState<string>(defaultSessionCookie);
  const [magicLink, setMagicLink] = useState('');
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [showMobileTips, setShowMobileTips] = useState(false);
  const [pasteSuccessNotice, setPasteSuccessNotice] = useState(false);

  // Sync defaultEmail when updated externally
  if (defaultEmail !== prevDefaultEmail) {
    setPrevDefaultEmail(defaultEmail);
    if (!email || email === prevDefaultEmail) {
      setEmail(defaultEmail);
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setMagicLink(text.trim());
          setPasteSuccessNotice(true);
          setTimeout(() => setPasteSuccessNotice(false), 2000);
        } else {
          setErrorMsg('Clipboard kosong. Silakan salin link verifikasi dari email Anda terlebih dahulu.');
        }
      } else {
        setErrorMsg('Fitur paste otomatis tidak didukung browser ini. Silakan tempel manual di kotak teks.');
      }
    } catch {
      setErrorMsg('Izin akses clipboard ditolak. Silakan tempelkan tautan secara manual.');
    }
  };

  const handleStartVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setVerifyResult(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanLink = magicLink.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Alamat email harus diisi dengan benar!');
      return;
    }

    if (!cleanLink || cleanLink.length < 10) {
      setErrorMsg('Magic link dari email tidak boleh kosong dan harus berupa tautan yang valid.');
      return;
    }

    if (userType === 'free_user') {
      setIsAdOpen(true);
    } else {
      executeVerifyLink(cleanEmail, cleanLink);
    }
  };

  const handleAdCompleted = () => {
    setIsAdOpen(false);
    executeVerifyLink(email.trim().toLowerCase(), magicLink.trim());
  };

  const executeVerifyLink = async (targetEmail: string, link: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/valzz/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          magicLink: link,
          provider: selectedProvider,
          sessionCookie: sessionCookie || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || data?.error || 'Gagal memverifikasi magic link.');
      }

      setVerifyResult(data);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      onAddHistory({
        id: `ver_${Date.now()}`,
        email: targetEmail,
        type: 'verified',
        timestamp: Date.now(),
        status: 'success',
        magicLinkSnippet: link.substring(0, 30) + '...',
        message: data.message || `Status Premium Berhasil Diaktifkan via ${data.providerUsed || 'Valzz Provider'}!`,
      });
    } catch (err: any) {
      console.error('Verify error:', err);
      const msg = err?.message || 'Gagal memverifikasi magic link. Pastikan tautan belum kadaluarsa.';
      setErrorMsg(msg);
      onAddHistory({
        id: `ver_err_${Date.now()}`,
        email: targetEmail,
        type: 'verified',
        timestamp: Date.now(),
        status: 'failed',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-xl backdrop-blur-xl space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                LANGKAH 2
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">Verifikasi Magic Link Premium</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tempel tautan Magic Link dari email Anda untuk mengaktifkan status Alight Motion Pro via <strong>Valzz Provider</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMobileTips(!showMobileTips)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/20 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cara Salin di HP</span>
            {showMobileTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Mobile Tutorial */}
        <AnimatePresence>
          {showMobileTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-cyan-950/30 border border-cyan-500/30 p-3.5 rounded-2xl text-xs text-slate-300 space-y-2 overflow-hidden"
            >
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Petunjuk Mudah Salin Link di Aplikasi Gmail (Android & iOS):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 pl-1">
                <li>Buka email dari Alight Motion di Gmail/Mail.</li>
                <li><strong>Tahan (tekan lama)</strong> tombol atau link bertuliskan <em>&quot;Sign in to Alight Creative&quot;</em>.</li>
                <li>Pilih opsi <strong>&quot;Salin alamat link&quot;</strong> (Copy link address).</li>
                <li>Kembali ke sini dan klik tombol <strong>&quot;Tempel Otomatis&quot;</strong> di bawah.</li>
              </ol>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Provider Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Node Verifikator (Valzz Provider)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {VALZZ_PROVIDERS.map((prov) => {
              const isSelected = selectedProvider === prov.id;
              return (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setSelectedProvider(prov.id)}
                  id={`btn-verify-provider-${prov.id}`}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold block truncate text-cyan-400">
                    {prov.badge}
                  </span>
                  <span className="text-[11px] font-bold block truncate text-slate-200 mt-0.5">
                    {prov.id === 'valzz_auto' ? 'Auto Engine' : prov.id === 'valzz_v1' ? 'Cloud v1' : 'Turbo Pro v2'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleStartVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Terdaftar
              </span>
              {defaultEmail && email !== defaultEmail && (
                <button
                  type="button"
                  onClick={() => setEmail(defaultEmail)}
                  className="text-[10px] text-cyan-400 hover:underline"
                >
                  Gunakan {defaultEmail}
                </button>
              )}
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namaemail@gmail.com"
                required
                id="input-verify-email"
                className="w-full h-12 px-4 pr-10 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="absolute right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  title="Hapus"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-slate-400" /> Magic Link dari Email
              </label>

              {/* 1-Tap Paste Button */}
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                id="btn-paste-magic-link"
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <ClipboardPaste className="w-3 h-3 text-cyan-400" />
                <span>Tempel Otomatis</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={magicLink}
                onChange={(e) => setMagicLink(e.target.value)}
                placeholder="Tempel seluruh tautan / URL magic link di sini..."
                required
                id="input-verify-magiclink"
                className="w-full p-3.5 pr-10 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none shadow-inner"
              />
              {magicLink && (
                <button
                  type="button"
                  onClick={() => setMagicLink('')}
                  className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  title="Hapus teks"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {pasteSuccessNotice && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3" /> Magic link berhasil ditempel dari clipboard!
              </p>
            )}
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            id="btn-trigger-verify-link"
            className={`w-full min-h-[48px] py-3 px-4 text-xs sm:text-sm font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98] ${
              isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Memproses Lisensi di Valzz Provider...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>
                  {userType === 'free_user'
                    ? 'Lanjut ke Iklan & Aktifkan Pro'
                    : 'Aktifkan Pro Langsung (VIP Valzz)'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Success Card Result */}
        {verifyResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-950/80 to-slate-950 border-2 border-emerald-500/50 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">STATUS AKTIVASI SUKSES</span>
                <h3 className="text-base sm:text-lg font-black text-slate-100">ALIGHT MOTION PRO AKTIF! 🎉</h3>
                <span className="text-[11px] text-emerald-300 font-mono">
                  Verified via {verifyResult.providerUsed || 'Valzz Provider'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Selamat! Akun <strong>{email}</strong> telah berhasil terhubung dengan lisensi <strong>Alight Motion Pro Lifetime</strong> melalui <strong>Valzz Provider</strong>.
              Buka aplikasi Alight Motion di smartphone Anda sekarang.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">No Watermark</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Preset 5MB+ & XML</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Export 4K 60FPS</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">All Pro Effects</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Ad Gateway Modal */}
      <AdGatewayModal
        isOpen={isAdOpen}
        theme={theme}
        stageTitle="Tahap Verifikasi Iklan Sponsor 2/2"
        stageSubtitle="Selesaikan tayangan sponsor untuk memvalidasi Magic Link dan mengaktifkan lisensi premium via Valzz Provider."
        onSuccess={handleAdCompleted}
        onCancel={() => setIsAdOpen(false)}
      />
    </div>
  );
}
