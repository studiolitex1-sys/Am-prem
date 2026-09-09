'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  Crown,
  MessageCircle,
  HelpCircle,
  Send,
  Link2,
  LogOut,
  Flame,
  Radio,
  Sliders,
  Volume2,
  Database,
} from 'lucide-react';
import AntiScrapeShield from '@/components/AntiScrapeShield';
import LoginGate from '@/components/LoginGate';
import ThemeSelector from '@/components/ThemeSelector';
import LanguageSelector from '@/components/LanguageSelector';
import StepSendLink from '@/components/StepSendLink';
import StepVerifyLink from '@/components/StepVerifyLink';
import OwnerContactModal from '@/components/OwnerContactModal';
import OwnerPanelModal from '@/components/OwnerPanelModal';
import HistoryList from '@/components/HistoryList';
import ThreeBackground from '@/components/ThreeBackground';
import { THEMES } from '@/lib/theme';
import { ThemeConfig, ActivationHistory } from '@/types/portal';
import { ValzzProviderId } from '@/lib/valzzProviders';
import { useStorageItem, notifyStoreChange } from '@/lib/storage';
import { getPersistentDeviceId } from '@/lib/device';
import { LanguageCode, getTranslation } from '@/lib/i18n';
import {
  getPersistentCooldown,
  setPersistentCooldown,
  resetPersistentCooldown,
  subscribeSystemConfig,
  updateSystemConfigInDb,
  subscribeActivationHistory,
  addActivationToDb,
  clearAllActivationsFromDb,
} from '@/lib/firestoreService';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'send' | 'verify'>('send');
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState<boolean>(false);
  const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState<boolean>(false);
  const [lastSentEmail, setLastSentEmail] = useState<string>('');
  const [lastSentProvider, setLastSentProvider] = useState<ValzzProviderId>('valzz_auto');
  const [lastSessionCookie, setLastSessionCookie] = useState<string>('');
  const [firestoreHistory, setFirestoreHistory] = useState<ActivationHistory[]>([]);

  // Reactive external store hooks
  const authRaw = useStorageItem('valzz_auth', '');
  const themeRaw = useStorageItem('valzz_theme', 'emerald');
  const langRaw = useStorageItem('valzz_lang', 'id');
  const cooldownDurationRaw = useStorageItem('valzz_cooldown_duration', '60');
  const cooldownEndRaw = useStorageItem('valzz_cooldown', '0');
  const announcementRaw = useStorageItem(
    'valzz_announcement',
    '⚡ Info Server: Valzz Magic Link AM Pro Lifetime aktif 24 jam by valzzdev. Bebas watermark & XML 5MB+!'
  );
  const announcementActiveRaw = useStorageItem('valzz_announcement_active', 'true');
  const historyRaw = useStorageItem('valzz_history', '[]');

  // Derived reactive states
  const currentLang: LanguageCode = (langRaw as LanguageCode) || 'id';
  const t = (key: string, fallback?: string) => getTranslation(currentLang, key, fallback);

  const authData = useMemo(() => {
    try {
      return authRaw ? JSON.parse(authRaw) : null;
    } catch {
      return null;
    }
  }, [authRaw]);

  const isAuthenticated = !!authData;
  const userType: 'vip' | 'free_user' = authData?.userType || 'free_user';
  const username: string = authData?.username || '';
  const currentTheme: ThemeConfig = (THEMES as any)[themeRaw] || THEMES.emerald;
  const cooldownDuration: number = parseInt(cooldownDurationRaw, 10) || 60;
  const [cooldownEnd, setCooldownEndState] = useState<number>(() => {
    const local = parseInt(cooldownEndRaw, 10) || 0;
    return local > Date.now() ? local : 0;
  });

  const announcementText: string = announcementRaw;
  const isAnnouncementActive: boolean = announcementActiveRaw === 'true';

  // 1. Synchronize Persistent Database Cooldown across Relogs & Refreshes
  useEffect(() => {
    const syncCooldownWithDatabase = async () => {
      const devId = getPersistentDeviceId();
      const localEnd = parseInt(localStorage.getItem('valzz_cooldown') || '0', 10);
      const dbCooldownEnd = await getPersistentCooldown(devId);
      const activeEnd = Math.max(localEnd, dbCooldownEnd);

      if (activeEnd > Date.now()) {
        setCooldownEndState(activeEnd);
        try {
          localStorage.setItem('valzz_cooldown', activeEnd.toString());
          notifyStoreChange();
        } catch {}
      } else if (localEnd > 0 && localEnd <= Date.now()) {
        setCooldownEndState(0);
        try {
          localStorage.removeItem('valzz_cooldown');
          notifyStoreChange();
        } catch {}
      }
    };

    syncCooldownWithDatabase();
  }, [isAuthenticated]);

  // 2. Real-time Firestore Subscriptions for Config & History
  useEffect(() => {
    const unsubConfig = subscribeSystemConfig((cfg) => {
      try {
        if (cfg.cooldownDuration) {
          localStorage.setItem('valzz_cooldown_duration', cfg.cooldownDuration.toString());
        }
        if (cfg.announcementText) {
          localStorage.setItem('valzz_announcement', cfg.announcementText);
        }
        localStorage.setItem('valzz_announcement_active', cfg.isAnnouncementActive ? 'true' : 'false');
        notifyStoreChange();
      } catch {}
    });

    const unsubHistory = subscribeActivationHistory((items) => {
      setFirestoreHistory(items);
    });

    return () => {
      unsubConfig();
      unsubHistory();
    };
  }, []);

  const history: ActivationHistory[] = useMemo(() => {
    if (firestoreHistory.length > 0) return firestoreHistory;
    try {
      return historyRaw ? JSON.parse(historyRaw) : [];
    } catch {
      return [];
    }
  }, [firestoreHistory, historyRaw]);

  const handleLoginSuccess = async (type: 'vip' | 'free_user', user: string, token?: string) => {
    try {
      localStorage.setItem('valzz_auth', JSON.stringify({ userType: type, username: user, token }));
      notifyStoreChange();
    } catch {}
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('valzz_auth');
      notifyStoreChange();
    } catch {}
  };

  const handleThemeChange = (themeId: string) => {
    try {
      localStorage.setItem('valzz_theme', themeId);
      notifyStoreChange();
    } catch {}
  };

  const handleLanguageChange = (langCode: LanguageCode) => {
    try {
      localStorage.setItem('valzz_lang', langCode);
      notifyStoreChange();
    } catch {}
  };

  const handleSetCooldown = async (targetTimestamp: number) => {
    setCooldownEndState(targetTimestamp);
    try {
      localStorage.setItem('valzz_cooldown', targetTimestamp.toString());
      notifyStoreChange();
      const devId = getPersistentDeviceId();
      await setPersistentCooldown(devId, targetTimestamp);
    } catch {}
  };

  const handleResetUserCooldown = async () => {
    setCooldownEndState(0);
    try {
      localStorage.removeItem('valzz_cooldown');
      notifyStoreChange();
      const devId = getPersistentDeviceId();
      await resetPersistentCooldown(devId);
    } catch {}
  };

  const handleUpdateCooldownDuration = async (seconds: number) => {
    try {
      localStorage.setItem('valzz_cooldown_duration', seconds.toString());
      notifyStoreChange();
      await updateSystemConfigInDb({ cooldownDuration: seconds });
    } catch {}
  };

  const handleUpdateAnnouncement = async (text: string) => {
    try {
      localStorage.setItem('valzz_announcement', text);
      notifyStoreChange();
      await updateSystemConfigInDb({ announcementText: text });
    } catch {}
  };

  const handleToggleAnnouncement = async (active: boolean) => {
    try {
      localStorage.setItem('valzz_announcement_active', active ? 'true' : 'false');
      notifyStoreChange();
      await updateSystemConfigInDb({ isAnnouncementActive: active });
    } catch {}
  };

  const handleAddHistory = async (item: ActivationHistory) => {
    try {
      const current = historyRaw ? JSON.parse(historyRaw) : [];
      const updated = [item, ...current].slice(0, 30);
      localStorage.setItem('valzz_history', JSON.stringify(updated));
      notifyStoreChange();
      await addActivationToDb(item);
    } catch {}
  };

  const handleClearHistory = async () => {
    try {
      localStorage.setItem('valzz_history', '[]');
      notifyStoreChange();
      await clearAllActivationsFromDb();
    } catch {}
  };

  const handleLinkSentSuccess = (
    email: string,
    provider: ValzzProviderId = 'valzz_auto',
    cookie?: string
  ) => {
    setLastSentEmail(email);
    setLastSentProvider(provider);
    if (cookie) setLastSessionCookie(cookie);

    // Auto shift to verify tab after brief delay for smooth UX
    setTimeout(() => {
      setActiveTab('verify');
    }, 1500);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <AntiScrapeShield />
      <ThreeBackground themeColor={currentTheme.primaryHex} />

      {!isAuthenticated ? (
        <LoginGate
          theme={currentTheme}
          currentLang={currentLang}
          onSelectLang={handleLanguageChange}
          onSuccessLogin={handleLoginSuccess}
          onOpenOwnerPV={() => setIsOwnerModalOpen(true)}
          onOpenOwnerPanel={() => setIsOwnerPanelOpen(true)}
        />
      ) : (
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-5 sm:space-y-6">
          {/* Global Top Announcement Ticker */}
          {isAnnouncementActive && announcementText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-950/70 border border-emerald-500/30 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-200 backdrop-blur-md shadow-lg shadow-emerald-950/40"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                <span className="truncate">{announcementText}</span>
              </div>
              <span className="shrink-0 text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                by valzzdev
              </span>
            </motion.div>
          )}

          {/* Top Bar Header */}
          <header className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-slate-950 shadow-lg"
                style={{ backgroundColor: currentTheme.primaryHex }}
              >
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-100">
                    {t('appTitle', 'Valzz Alight Motion Pro Free')}
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {t('byValzz', 'by valzzdev')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{t('engineOnline', 'Valzz Engine Pro • Online (v2.5)')}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Database className="w-3 h-3" /> {t('firestoreActive', 'Firestore Active')}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Tools: Language + Theme & PV Owner & Status & Owner Panel */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {/* Language Switcher Button */}
              <LanguageSelector
                currentLang={currentLang}
                onSelectLang={handleLanguageChange}
                theme={currentTheme}
              />

              {/* Theme Switcher Button */}
              <ThemeSelector currentTheme={currentTheme} onSelectTheme={handleThemeChange} />

              <button
                onClick={() => setIsOwnerPanelOpen(true)}
                id="btn-header-owner-panel"
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Buka Owner Control Panel"
              >
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                <span>{t('ownerPanel', 'Owner Panel')}</span>
              </button>

              <button
                onClick={() => setIsOwnerModalOpen(true)}
                id="btn-header-pv-owner"
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t('pvOwnerVip', 'PV Owner VIP')}</span>
              </button>

              <button
                onClick={handleLogout}
                id="btn-logout"
                title={t('logout', 'Keluar / Ganti Akun')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Account Status Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 px-5 py-3 rounded-2xl">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-slate-400">{t('yourMode', 'Mode Anda')}:</span>
              {userType === 'vip' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> {t('vipMember', 'VIP Private Member')} ({username})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> {t('freeMember', 'Free Member')} ({cooldownDuration}s)
                </span>
              )}
            </div>

            {userType === 'free_user' && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('upgradePromo', 'Mau bebas iklan & tanpa cooldown? Hubungi WhatsApp')} <strong>089671409020</strong></span>
              </div>
            )}
          </div>

          {/* Tab Navigation Steps */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('send')}
              id="tab-step-1"
              className={`p-4 rounded-2xl border text-left transition relative overflow-hidden cursor-pointer ${
                activeTab === 'send'
                  ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10 text-slate-100'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Step 01
                </span>
                <Send className={`w-4 h-4 ${activeTab === 'send' ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-2">
                {t('tabStep1Title', '1. Kirim Magic Link')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {t('tabStep1Desc', 'Kirim tautan aktivasi via Valzz Provider')}
              </p>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              id="tab-step-2"
              className={`p-4 rounded-2xl border text-left transition relative overflow-hidden cursor-pointer ${
                activeTab === 'verify'
                  ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10 text-slate-100'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Step 02
                </span>
                <Link2 className={`w-4 h-4 ${activeTab === 'verify' ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-2">
                {t('tabStep2Title', '2. Verifikasi Premium')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {t('tabStep2Desc', 'Tempel tautan email & aktifkan Pro')}
              </p>
            </button>
          </div>

          {/* Active Step Panel */}
          <div className="min-h-[400px]">
            {activeTab === 'send' ? (
              <StepSendLink
                theme={currentTheme}
                userType={userType}
                authToken={authData?.token}
                onLinkSentSuccess={handleLinkSentSuccess}
                onAddHistory={handleAddHistory}
                cooldownEnd={cooldownEnd}
                setCooldownEnd={handleSetCooldown}
                customCooldownDuration={cooldownDuration}
              />
            ) : (
              <StepVerifyLink
                theme={currentTheme}
                userType={userType}
                defaultEmail={lastSentEmail}
                defaultProvider={lastSentProvider}
                defaultSessionCookie={lastSessionCookie}
                onAddHistory={handleAddHistory}
              />
            )}
          </div>

          {/* History Log */}
          <HistoryList history={history} onClearHistory={handleClearHistory} />

          {/* Tutorial / Panduan Alight Motion Pro Section */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>
                {currentLang === 'id'
                  ? 'Panduan Lengkap Aktivasi Alight Motion Pro Free (Valzz Provider)'
                  : 'Complete Guide: Alight Motion Pro Free Activation (Valzz Engine)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="font-semibold text-slate-100">
                  {currentLang === 'id' ? 'Kirim Link ke Email' : 'Send Link to Email'}
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {currentLang === 'id'
                    ? 'Masukkan email yang terhubung dengan akun Alight Motion Anda. Pilih server Valzz Provider, klik kirim dan selesaikan 2 tahap iklan sponsor.'
                    : 'Enter the email connected to your Alight Motion account. Choose Valzz Provider, click send and complete the sponsored gateway.'}
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="font-semibold text-slate-100">
                  {currentLang === 'id' ? 'Buka Inbox Email' : 'Open Email Inbox'}
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {currentLang === 'id'
                    ? 'Buka Gmail atau Email Anda. Cari pesan verifikasi dari Alight Motion. Tekan lama tombol "Sign In" lalu salin alamat URL-nya (Magic Link).'
                    : 'Open your Gmail/Email. Find the Alight Motion verification email. Long press "Sign In" button and copy its URL link.'}
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="font-semibold text-slate-100">
                  {currentLang === 'id' ? 'Tempel & Aktifkan Pro' : 'Paste & Activate Pro'}
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {currentLang === 'id'
                    ? 'Kembali ke web ini di Langkah 2, tempel tautan Magic Link, lalu klik aktifkan. Status Pro akan langsung aktif tanpa watermark.'
                    : 'Return to Step 2, paste the copied Magic Link, and click activate. Lifetime Pro will be instantly enabled with zero watermark.'}
                </p>
              </div>
            </div>
          </section>

          {/* Footer Branding & WhatsApp Contact */}
          <footer className="pt-6 pb-8 border-t border-slate-800/80 text-center space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
              <span>{t('appTitle', 'Valzz Alight Motion Pro Free')}</span>
              <span>•</span>
              <span>Author & Developer: <strong>Lenz👾 / valzzdev</strong></span>
              <span>•</span>
              <a
                href="https://wa.me/6289671409020"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WA: 089671409020
              </a>
              <span>•</span>
              <button
                onClick={() => setIsOwnerPanelOpen(true)}
                id="btn-footer-owner-panel"
                className="text-rose-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" /> {t('ownerPanel', 'Owner Panel')}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Sistem Valzz Provider terintegrasi Multi-Node Cloud, Firebase Database & Anti-Bot Shield by <strong>valzzdev</strong>. Cocok untuk semua versi Alight Motion Android & iOS.
            </p>
          </footer>
        </div>
      )}

      {/* Owner WhatsApp PV Modal */}
      <OwnerContactModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
      />

      {/* Owner Control Panel Modal (Password: valzz001) */}
      <OwnerPanelModal
        isOpen={isOwnerPanelOpen}
        onClose={() => setIsOwnerPanelOpen(false)}
        theme={currentTheme}
        cooldownDuration={cooldownDuration}
        onUpdateCooldownDuration={handleUpdateCooldownDuration}
        announcementText={announcementText}
        onUpdateAnnouncement={handleUpdateAnnouncement}
        isAnnouncementActive={isAnnouncementActive}
        onToggleAnnouncement={handleToggleAnnouncement}
        onResetUserCooldown={handleResetUserCooldown}
      />
    </main>
  );
}
