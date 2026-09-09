'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Crown, ShieldAlert, Sparkles, X, Check, ArrowRight } from 'lucide-react';

interface OwnerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OwnerContactModal({ isOpen, onClose }: OwnerContactModalProps) {
  if (!isOpen) return null;

  const phone = '089671409020';
  const whatsappUrl = `https://wa.me/6289671409020?text=${encodeURIComponent(
    'Halo Valzz Official, saya mau order akun VIP Alight Motion Pro Private (Tanpa Iklan, No Cooldown, Full Garansi).'
  )}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.98 }}
          className="relative w-full max-w-md bg-slate-900 border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden max-h-[92vh] flex flex-col"
          id="owner-contact-modal"
        >
          {/* Mobile pull handle */}
          <div className="w-12 h-1.5 bg-amber-500/30 rounded-full mx-auto mt-2.5 sm:hidden" />

          {/* Header */}
          <div className="bg-gradient-to-r from-amber-950/80 to-slate-950 px-5 sm:px-6 py-4 sm:py-5 border-b border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
                  VIP Direct Owner <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-amber-400/90 font-mono">valzzdev • 089671409020</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              id="btn-close-owner-modal"
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-xs text-amber-200/90 leading-relaxed">
              Ingin akses instan <strong>Alight Motion Pro VIP Lifetime</strong> tanpa iklan, tanpa cooldown
              dan support XML 5MB+ unlimited dengan garansi penuh?
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Tanpa Iklan Sama Sekali (Direct Premium)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Private Akun Email Sendiri / Email Ready</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Export 4K 60FPS + Font & Effect Terbuka</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Proses Cepat via WhatsApp Official</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">WhatsApp Resmi Owner</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">{phone}</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold">
                Online Fast Respon
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-950/90 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 flex flex-col gap-2 mt-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-whatsapp-owner-direct"
              className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp Owner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              id="btn-cancel-owner-direct"
              className="text-xs text-slate-400 hover:text-slate-200 py-1 text-center transition"
            >
              Lanjutkan Versi Free Gratis
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
