'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES, LanguageCode, LanguageOption } from '@/lib/i18n';
import { ThemeConfig } from '@/types/portal';

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onSelectLang: (code: LanguageCode) => void;
  theme?: ThemeConfig;
  compact?: boolean;
}

export default function LanguageSelector({
  currentLang,
  onSelectLang,
  theme,
  compact = false,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        id="btn-language-selector"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm backdrop-blur-md ${
          isOpen ? 'ring-2 ring-emerald-500/50' : ''
        }`}
        title="Ganti Bahasa / Switch Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm leading-none">{selectedLanguage.flag}</span>
        {!compact && (
          <span className="font-medium hidden sm:inline">{selectedLanguage.shortName}</span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="dropdown-language-menu"
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
            <span>Pilih Bahasa</span>
            <span className="text-emerald-400 font-mono">i18n</span>
          </div>
          <div className="space-y-0.5">
            {LANGUAGES.map((lang: LanguageOption) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  id={`btn-lang-${lang.code}`}
                  onClick={() => {
                    onSelectLang(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition font-medium text-left ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
