'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AntiBotCaptchaProps {
  onVerified: (token: string) => void;
  isVerified: boolean;
}

export default function AntiBotCaptcha({ onVerified, isVerified }: AntiBotCaptchaProps) {
  const [num1, setNum1] = useState<number>(3);
  const [num2, setNum2] = useState<number>(6);
  const [challengeToken, setChallengeToken] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchServerChallenge = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/challenge');
      const data = await res.json();
      if (data.puzzle) {
        setNum1(data.puzzle.a);
        setNum2(data.puzzle.b);
        setChallengeToken(data.challengeToken);
      }
    } catch {
      // Fallback
      setNum1(Math.floor(Math.random() * 8) + 2);
      setNum2(Math.floor(Math.random() * 8) + 1);
    } finally {
      setIsLoading(false);
      setUserAnswer('');
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!isVerified) {
      fetch('/api/auth/challenge')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.puzzle) {
            setNum1(data.puzzle.a);
            setNum2(data.puzzle.b);
            setChallengeToken(data.challengeToken);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [isVerified]);

  const handleCheck = async () => {
    if (!userAnswer.trim()) {
      setErrorMsg('Masukkan jawaban verifikasi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeToken,
          answer: parseInt(userAnswer.trim(), 10),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onVerified(data.verifiedToken || challengeToken);
        setErrorMsg('');
      } else {
        setErrorMsg(data.message || 'Jawaban verifikasi salah, silakan coba lagi.');
        fetchServerChallenge();
      }
    } catch {
      setErrorMsg('Gagal memverifikasi ke server.');
      fetchServerChallenge();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheck();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-xs font-semibold text-slate-200">Server-Side Anti-Bot & Scrape Shield</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          Valzz HMAC-SHA256 Guard
        </span>
      </div>

      {isVerified ? (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Verifikasi manusia berhasil! Token cryptographic server telah diterbitkan.</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-2 shrink-0">
            <span>Tantangan Server:</span>
            <strong className="text-amber-300 font-bold">{num1} + {num2} = ?</strong>
          </div>

          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Jawaban..."
            id="input-anti-bot-answer"
            className="w-full sm:w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-center"
          />

          <div className="flex gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCheck}
              disabled={isLoading}
              id="btn-anti-bot-verify"
              className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-95 text-xs font-semibold text-slate-950 rounded-lg transition"
            >
              {isLoading ? '...' : 'Verifikasi'}
            </button>
            <button
              type="button"
              onClick={fetchServerChallenge}
              disabled={isLoading}
              id="btn-anti-bot-refresh"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg transition"
              title="Acak soal baru"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}
    </div>
  );
}
