'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, ExternalLink, Clock, CheckCircle2, AlertTriangle, Play, Flame } from 'lucide-react';
import { ThemeConfig } from '@/types/portal';

interface AdGatewayModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  theme: ThemeConfig;
  stageTitle: string;
  stageSubtitle: string;
}

const SPONSORS = [
  {
    id: 's1',
    sponsor: 'VALZZ SPONSOR',
    title: 'Preset Alight Motion XML & 4K 60FPS Presets Pack',
    description: 'Download 10,000+ efek transisi JJ, shakes, typography cinematic, dan 3D cube camera preset tanpa watermark.',
    tags: ['Preset Viral', 'XML & 5MB', 'No Watermark'],
    rating: '4.9 ★ (8.4k downloads)',
    ctaText: 'Kunjungi Sponsor & Verifikasi',
    duration: 6,
  },
  {
    id: 's2',
    sponsor: 'PARTNER OFFICIAL',
    title: 'Unlock Full Speed 4K Exporting & Cloud Render Server',
    description: 'Akselerasi render grafik Alight Motion dengan kecepatan hingga 120 FPS tanpa lag untuk HP low-end & flagship.',
    tags: ['Ultra 4K', 'GPU Boost', 'No Lag'],
    rating: '5.0 ★ (14.2k active)',
    ctaText: 'Buka Link Sponsor & Tunggu Timer',
    duration: 5,
  },
];

export default function AdGatewayModal({
  isOpen,
  onSuccess,
  onCancel,
  theme,
  stageTitle,
  stageSubtitle,
}: AdGatewayModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [timer, setTimer] = useState<number>(SPONSORS[0].duration);
  const [hasVisited, setHasVisited] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedSteps, setVerifiedSteps] = useState<number[]>([]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const activeSponsor = SPONSORS[currentStep - 1];

  const handleVisitSponsor = () => {
    setHasVisited(true);
    // Simulates opening sponsor portal / preview
    window.open('https://instagram.com', '_blank');
  };

  const handleClose = () => {
    setCurrentStep(1);
    setTimer(SPONSORS[0].duration);
    setHasVisited(false);
    setIsVerifying(false);
    setVerifiedSteps([]);
    onCancel();
  };

  const handleNextStepOrFinish = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (currentStep === 1) {
        setVerifiedSteps((prev) => [...prev, 1]);
        setCurrentStep(2);
        setTimer(SPONSORS[1].duration);
        setHasVisited(false);
      } else {
        setVerifiedSteps((prev) => [...prev, 2]);
        setCurrentStep(1);
        setTimer(SPONSORS[0].duration);
        setHasVisited(false);
        onSuccess();
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.98 }}
          className="relative w-full max-w-xl bg-slate-900 border-t sm:border border-slate-700/60 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          id="ad-gateway-modal"
        >
          {/* Mobile Handle Bar */}
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

          {/* Top Decorative Header */}
          <div className="bg-slate-950/80 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Sponsor Gate {currentStep}/2
                </h3>
                <p className="text-[11px] text-slate-400">Verifikasi Iklan untuk Akses Gratis</p>
              </div>
            </div>

            {/* Stage Indicator Pills */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  currentStep >= 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                }`}
              >
                1 {verifiedSteps.includes(1) ? '✓' : ''}
              </span>
              <span className="text-slate-600">→</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  currentStep === 2 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
                }`}
              >
                2 {verifiedSteps.includes(2) ? '✓' : ''}
              </span>
            </div>
          </div>

          {/* Body Content (Scrollable on small mobile) */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse shrink-0" />
                <span>{stageTitle}</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">{stageSubtitle}</p>
            </div>

            {/* Sponsor Interactive Card */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-700 relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-semibold">{activeSponsor.rating}</span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                  {activeSponsor.sponsor}
                </span>
              </div>

              <h5 className="text-sm sm:text-base font-semibold text-slate-100">{activeSponsor.title}</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{activeSponsor.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeSponsor.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] sm:text-[11px] bg-slate-800/90 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleVisitSponsor}
                  id="btn-visit-sponsor"
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 text-xs font-semibold rounded-xl border border-slate-600/80 flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeSponsor.ctaText}</span>
                </button>
              </div>
            </div>

            {/* Timer & Verification Progress */}
            <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">
                    {timer > 0 ? `Menunggu sponsor (${timer}s)` : 'Sponsor siap diverifikasi!'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    {timer > 0 ? 'Harap jangan tutup jendela ini' : 'Klik tombol lanjutkan di bawah'}
                  </p>
                </div>
              </div>

              {timer > 0 ? (
                <div className="text-right shrink-0">
                  <span className="text-lg sm:text-xl font-mono font-bold text-amber-400">{timer}s</span>
                </div>
              ) : (
                <span className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Siap
                </span>
              )}
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 text-[10px] sm:text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Menyelesaikan langkah sponsor membantu server tetap aktif 24 jam gratis untuk seluruh editor.
              </span>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="bg-slate-950/90 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-auto">
            <button
              type="button"
              onClick={handleClose}
              id="btn-cancel-ad-gateway"
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={timer > 0 || isVerifying}
              onClick={handleNextStepOrFinish}
              id="btn-continue-ad-gateway"
              className={`px-4 sm:px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition active:scale-[0.98] ${
                timer > 0 || isVerifying
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifikasi...</span>
                </>
              ) : currentStep === 1 ? (
                <>Lanjut ke Iklan 2 &rarr;</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Buka Kunci Sekarang
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
