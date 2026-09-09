'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  Mail,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  X,
  Smartphone,
  Cpu,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ThemeConfig, ActivationHistory } from '@/types/portal';
import { VALZZ_PROVIDERS, ValzzProviderId } from '@/lib/valzzProviders';
import { getPersistentDeviceId } from '@/lib/device';
import AntiBotCaptcha from './AntiBotCaptcha';
import AdGatewayModal from './AdGatewayModal';

interface StepSendLinkProps {
  theme: ThemeConfig;
  userType: 'vip' | 'free_user';
  authToken?: string;
  onLinkSentSuccess: (email: string, provider?: ValzzProviderId, sessionCookie?: string) => void;
  onAddHistory: (item: ActivationHistory) => void;
  cooldownEnd: number;
  setCooldownEnd: (time: number) => void;
  customCooldownDuration?: number;
}

export default function StepSendLink({
  theme,
  userType,
  authToken,
  onLinkSentSuccess,
  onAddHistory,
  cooldownEnd,
  setCooldownEnd,
  customCooldownDuration = 60,
}: StepSendLinkProps) {
  const [email, setEmail] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ValzzProviderId>('valzz_auto');
  const [antiBotToken, setAntiBotToken] = useState<string>('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState<boolean>(userType === 'vip');
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0);

  // Cooldown countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (cooldownEnd > now) {
        setRemainingCooldown(Math.ceil((cooldownEnd - now) / 1000));
      } else {
        setRemainingCooldown(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const handleStartProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessData(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Masukkan alamat email yang valid dan aktif (contoh: kamu@gmail.com)');
      return;
    }

    if (userType === 'free_user' && !isCaptchaVerified) {
      setErrorMsg('Harap selesaikan verifikasi Anti-Bot terlebih dahulu!');
      return;
    }

    if (remainingCooldown > 0 && userType === 'free_user') {
      setErrorMsg(`Sistem dalam cooldown! Tunggu ${remainingCooldown} detik lagi.`);
      return;
    }

    // If free user, open Staged Ad Gateway (1-2 ads requirement)
    if (userType === 'free_user') {
      setIsAdOpen(true);
    } else {
      executeSendLink(cleanEmail);
    }
  };

  const handleAdGatewayCompleted = () => {
    setIsAdOpen(false);
    executeSendLink(email.trim().toLowerCase());
  };

  const executeSendLink = async (targetEmail: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const devId = getPersistentDeviceId();
      const res = await fetch('/api/valzz/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          email: targetEmail,
          provider: selectedProvider,
          antiBotToken: antiBotToken,
          deviceId: devId,
          authToken: authToken,
          isVip: userType === 'vip',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data?.cooldownEnd) {
          setCooldownEnd(data.cooldownEnd);
        }
        throw new Error(data?.message || data?.error || 'Gagal mengirim magic link ke email.');
      }

      // Success
      setSuccessData(data);

      if (userType === 'free_user' && customCooldownDuration > 0) {
        const nextCooldown = data?.cooldownEnd || Date.now() + customCooldownDuration * 1000;
        setCooldownEnd(nextCooldown);
      }

      onAddHistory({
        id: `send_${Date.now()}`,
        email: targetEmail,
        type: 'send_link',
        timestamp: Date.now(),
        status: 'success',
        message: data.message || `Magic link terkirim via ${data.providerUsed || 'Valzz Provider'}!`,
      });

      onLinkSentSuccess(targetEmail, selectedProvider, data?.sessionCookie);
    } catch (err: any) {
      console.error('Send link error:', err);
      const msg = err?.message || 'Terjadi gangguan jaringan saat mengirim magic link.';
      setErrorMsg(msg);
      onAddHistory({
        id: `send_err_${Date.now()}`,
        email: targetEmail,
        type: 'send_link',
        timestamp: Date.now(),
        status: 'failed',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openMailApp = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-xl backdrop-blur-xl space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                LANGKAH 1
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">Kirim Magic Link Registrasi</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Link aktivasi resmi dikirim otomatis ke inbox email Anda melalui <strong>Valzz Provider</strong>.
            </p>
          </div>

          {userType === 'free_user' && (
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-300">
                Cooldown: <strong className="text-amber-400 font-mono">{remainingCooldown}s</strong>
              </span>
            </div>
          )}
        </div>

        {/* Valzz Provider Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pilih Node Server (Valzz Provider)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {VALZZ_PROVIDERS.map((prov) => {
              const isSelected = selectedProvider === prov.id;
              return (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setSelectedProvider(prov.id)}
                  id={`btn-provider-${prov.id}`}
                  className={`p-3 rounded-2xl border text-left transition relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/30 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {prov.badge}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{prov.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {prov.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleStartProcess} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Alamat Email Alight Motion
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-normal">Pastikan email aktif</span>
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
                placeholder="contoh: namaemail@gmail.com"
                required
                id="input-send-email"
                className="w-full h-12 px-4 pr-10 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
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

          {/* Anti Bot Section for Free Mode */}
          {userType === 'free_user' && (
            <AntiBotCaptcha
              isVerified={isCaptchaVerified}
              onVerified={(token) => {
                setIsCaptchaVerified(true);
                setAntiBotToken(token);
              }}
            />
          )}

          {/* Information regarding 1-2 ads requirement */}
          {userType === 'free_user' && (
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Mode Free:</strong> Melewati 2 tahap sponsor singkat (1-2 iklan) sebelum
                link register dikirim. Bebas iklan & unlimited via <strong>VIP Owner</strong>.
              </span>
            </div>
          )}

          {/* Error message */}
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || (remainingCooldown > 0 && userType === 'free_user')}
            id="btn-trigger-send-link"
            className={`w-full min-h-[48px] py-3 px-4 text-xs sm:text-sm font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98] ${
              isLoading || (remainingCooldown > 0 && userType === 'free_user')
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menghubungi Valzz Provider Engine...</span>
              </>
            ) : remainingCooldown > 0 && userType === 'free_user' ? (
              <>
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Tunggu Cooldown ({remainingCooldown}s)</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {userType === 'free_user'
                    ? 'Lanjut ke Iklan & Kirim Link'
                    : 'Kirim Magic Link Langsung (VIP Valzz)'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Success Alert Banner & Mobile Quick Actions */}
        {successData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl space-y-3"
          >
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Magic Link Berhasil Dikirim ke {email}!</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Buka aplikasi Gmail/Email di HP Anda, cari pesan verifikasi dari <strong>Alight Motion</strong>, lalu
              salin tautan dari tombol verifikasi untuk ditempelkan ke <strong className="text-emerald-400">Langkah 2</strong>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={openMailApp}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buka Aplikasi Gmail / Email</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Staged Ad Gateway Modal */}
      <AdGatewayModal
        isOpen={isAdOpen}
        theme={theme}
        stageTitle="Tahap Verifikasi Iklan Sponsor 1/2"
        stageSubtitle="Selesaikan tayangan sponsor untuk membuka antrian pengiriman Magic Link Valzz Provider gratis."
        onSuccess={handleAdGatewayCompleted}
        onCancel={() => setIsAdOpen(false)}
      />
    </div>
  );
}
