import React from 'react';
import { Cloud, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isDark: boolean;
}

export const CloudSyncBanner: React.FC<Props> = ({ isDark }) => {
  const { user, signInWithGoogle, isSyncing, syncSuccess } = useAuth();
  const { t, dir } = useLanguage();

  if (user) {
    return (
      <div
        className={`w-full max-w-5xl mx-auto mb-6 px-4 py-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-start ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
        dir={dir}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>{t.cloudBannerActiveTitle}</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {t.cloudBannerActiveSubtitle} (<span className="font-semibold">{user.email}</span>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono-num px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
          <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-cyan-400' : 'text-emerald-400'}`} />
          <span>{isSyncing ? t.cloudSaving : syncSuccess ? t.cloudSaved : t.cloudActive}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-5xl mx-auto mb-6 px-4 py-3 sm:py-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-start shadow-sm ${
        isDark
          ? 'bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-blue-950/30 border-cyan-500/30 text-slate-200'
          : 'bg-gradient-to-r from-cyan-50 via-white to-blue-50 border-cyan-200 text-slate-800'
      }`}
      dir={dir}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <span>{t.cloudBannerTitle}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-normal hidden md:inline">
              Cloud
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t.cloudBannerSubtitle}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold font-cyber bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0 active:scale-95"
      >
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#0f172a"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#0f172a"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#0f172a"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#0f172a"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{t.cloudBannerSignInBtn}</span>
      </button>
    </div>
  );
};
