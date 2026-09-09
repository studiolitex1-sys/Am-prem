'use client';

import React from 'react';
import { ActivationHistory } from '@/types/portal';
import { History, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';

interface HistoryListProps {
  history: ActivationHistory[];
  onClearHistory: () => void;
}

export default function HistoryList({ history, onClearHistory }: HistoryListProps) {
  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-200">Riwayat Aktivasi Terkini</h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          id="btn-clear-history"
          className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition py-1 px-2 rounded-lg hover:bg-slate-800"
        >
          <Trash2 className="w-3 h-3" />
          <span>Hapus</span>
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
        {history.map((item) => {
          const dateStr = new Date(item.timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const isSuccess = item.status === 'success';

          return (
            <div
              key={item.id}
              className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs gap-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-[220px]">
                      {item.email}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full ${
                        item.type === 'verified'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.type === 'verified' ? 'Pro Aktif' : 'Link Terkirim'}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">{item.message}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-500">{dateStr}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
