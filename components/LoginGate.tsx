'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  User,
  KeyRound,
  Sparkles,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';
import { ThemeConfig } from '@/types/portal';
import { validateVipAccountInDb } from '@/lib/firestoreService';

interface LoginGateProps {
  onSuccessLogin: (userType: 'vip' | 'free_user', username: string, token?: string) => void;
  onOpenOwnerPV: () => void;
  onOpenOwnerPanel?: () => void;
  theme: ThemeConfig;
}

export default function LoginGate({ onSuccessLogin, onOpenOwnerPV, onOpenOwnerPanel, theme }: LoginGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVIPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await validateVipAccountInDb(username, password);
      if (res.valid) {
        onSuccessLogin('vip', res.username || username, res.token);
      } else {
        setErrorMsg(
          'Kredensial VIP salah! Hubungi WhatsApp Owner 089671409020 untuk mendapatkan akun VIP resmi.'
        );
      }
    } catch {
      setErrorMsg('Gagal memvalidasi kredensial. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterFreeMode = () => {
    onSuccessLogin('free_user', 'Guest Free Member');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-3.5 sm:p-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        id="login-gate-card"
      >
        {/* Top Glow Accent */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: theme.primaryHex, opacity: 0.15 }}
        />

        {/* Branding Title */}
        <div className="text-center space-y-2 mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5" /> Portal Resmi by valzzdev
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
            Valzz Alight Motion Pro
          </h1>
          <p className="text-xs text-slate-400">
            Sistem Pembuatan & Aktivasi Magic Link AM Pro Lifetime
          </p>
        </div>

        {/* VIP Login Form */}
        <form onSubmit={handleVIPLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Username VIP
            </label>
            <div className="relative">
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username VIP..."
                id="input-login-username"
                className="w-full h-11 sm:h-12 px-3.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Password VIP
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password VIP..."
                id="input-login-password"
                className="w-full h-11 sm:h-12 px-3.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition pr-10 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                id="btn-toggle-vip-pw-visibility"
                className="absolute right-3 p-1.5 text-slate-500 hover:text-slate-300 transition"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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
            id="btn-login-vip-submit"
            className="w-full min-h-[46px] py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" /> Masuk Sebagai Member VIP
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 sm:my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-slate-900 px-3 text-slate-500">Atau Pilih Jalur Akses</span>
          </div>
        </div>

        {/* Free Mode & Owner Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleEnterFreeMode}
            id="btn-enter-free-mode"
            className="w-full min-h-[48px] py-2.5 px-3.5 sm:px-4 bg-slate-800/90 hover:bg-slate-700/90 active:scale-[0.98] text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center justify-between transition group shadow-sm"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-100 font-bold text-xs sm:text-sm">Buat Akun Free (Gratis)</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">Lewati Iklan & Cooldown</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* PV Owner Contact Button */}
          <button
            type="button"
            onClick={onOpenOwnerPV}
            id="btn-pv-owner-whatsapp"
            className="w-full min-h-[42px] py-2 px-4 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] text-amber-300 text-xs font-semibold rounded-2xl border border-amber-500/30 flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>PV Owner WhatsApp (089671409020)</span>
          </button>

          {/* Owner Panel Button */}
          {onOpenOwnerPanel && (
            <button
              type="button"
              onClick={onOpenOwnerPanel}
              id="btn-open-owner-panel-login"
              className="w-full min-h-[38px] py-1.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] text-rose-300 text-[11px] font-semibold rounded-2xl border border-rose-500/30 flex items-center justify-center gap-2 transition"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Owner Control Panel</span>
            </button>
          )}
        </div>

        {/* Security badge footer */}
        <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Anti-Scraping Active</span>
          </div>
          <span className="font-mono text-[10px]">by valzzdev</span>
        </div>
      </motion.div>
    </div>
  );
}
