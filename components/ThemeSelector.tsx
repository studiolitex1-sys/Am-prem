'use client';

import React from 'react';
import { THEMES } from '@/lib/theme';
import { ThemeMode, ThemeConfig } from '@/types/portal';
import { Palette } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
}

export default function ThemeSelector({ currentTheme, onSelectTheme }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl backdrop-blur-sm">
      <div className="flex items-center gap-1 text-[11px] text-slate-400 px-2 font-medium">
        <Palette className="w-3.5 h-3.5 text-slate-300" />
        <span className="hidden sm:inline">Tema:</span>
      </div>
      <div className="flex items-center gap-1.5">
        {(Object.keys(THEMES) as ThemeMode[]).map((mode) => {
          const t = THEMES[mode];
          const isSelected = currentTheme.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTheme(t)}
              id={`btn-theme-${t.id}`}
              className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                isSelected ? 'scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-slate-950' : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: t.primaryHex }}
              title={`Pilih tema ${t.name}`}
            />
          );
        })}
      </div>
    </div>
  );
}
