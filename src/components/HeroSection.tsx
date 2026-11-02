import React from 'react';
import { Terminal, ArrowDown } from 'lucide-react';
import { UserProfile, getPlayerAvatar } from '../types/userProfile';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isDark: boolean;
  userProfile?: UserProfile;
  onOpenProfileModal?: () => void;
}

export const HeroSection: React.FC<Props> = ({
  isDark,
  userProfile,
  onOpenProfileModal,
}) => {
  const { lang, t, dir } = useLanguage();

  const stepsData =
    lang === 'ar'
      ? [
          { step: '01', title: 'وقت المذاكرة', desc: 'حدد بداية ونهاية وقتك المتاح' },
          { step: '02', title: 'المواد والدروس', desc: 'أضف المواد التي تريد مذاكرتها' },
          { step: '03', title: 'ترتيب الأولويات', desc: 'ترتيب المواد بحسب الأهمية' },
          { step: '04', title: 'حفظ الجدول', desc: 'إنشاء الجدول كصورة وحفظه' },
        ]
      : [
          { step: '01', title: 'Time Window', desc: 'Set start & finish hours' },
          { step: '02', title: 'Subjects Manifest', desc: 'Input videos, tasks & types' },
          { step: '03', title: 'Smart Priority', desc: 'Weighted cognitive balance' },
          { step: '04', title: 'Poster Wallpaper', desc: 'Export 1080×1920 wallpaper' },
        ];

  return (
    <section className="relative text-center pt-6 pb-10 sm:pt-10 sm:pb-14 px-4" dir={dir}>
      {/* Motivation Tag */}
      <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold tracking-wide">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>{lang === 'ar' ? 'تنظيم وقت المذاكرة اليومي' : 'Daily Study Planning'}</span>
      </div>

      {/* Football Legend / Character Motivation Banner */}
      {userProfile && (
        <div className="mb-6 flex justify-center w-full max-w-full px-2">
          <button
            type="button"
            onClick={onOpenProfileModal}
            title={t.heroPillTitle}
            className={`w-full max-w-lg sm:max-w-xl md:max-w-2xl inline-flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 pr-3.5 sm:pr-4 rounded-3xl border transition-all cursor-pointer group text-start ${
              isDark
                ? 'glass-bubble-card-dark shadow-[0_0_25px_rgba(6,182,212,0.18)]'
                : 'glass-bubble-card-light shadow-md'
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = getPlayerAvatar(userProfile.avatarId).fallbackUrl;
                  if (!target.src.includes(fallback)) {
                    target.src = fallback;
                  }
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 animate-pulse" />
            </div>

            <div className="text-start flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
                <strong className="text-xs sm:text-sm font-bold text-cyan-400">{userProfile.name}</strong>
                <span className="text-[10px] sm:text-xs opacity-80 font-mono-num font-semibold text-slate-400">
                  {userProfile.playerTitle}
                </span>
              </div>
              <p className={`text-xs sm:text-[13px] italic whitespace-normal leading-relaxed ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                «{userProfile.quote}»
              </p>
            </div>

            <span className="text-xs text-cyan-400 font-bold hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0 self-center">
              <span>{t.changeBtn}</span>
              <span>✨</span>
            </span>
          </button>
        </div>
      )}

      {/* Main Headline */}
      <h1
        className={`text-3xl sm:text-5xl lg:text-6xl font-black font-cyber tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight ${
          isDark
            ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400'
            : 'text-slate-900'
        }`}
      >
        {t.heroHeadline}
      </h1>

      {/* Subtitle / Description */}
      <p
        className={`mt-4 sm:mt-5 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        {t.heroSubheadline}
      </p>

      {/* CTA actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="#time-window"
          className="glass-bubble-btn px-6 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-white/20"
        >
          <span>{t.heroSetTimeBtn}</span>
          <ArrowDown className="w-4 h-4" />
        </a>

        <a
          href="#task-manifest"
          className={`px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-cyan-400/40 hover:text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>{t.heroAddTaskBtn}</span>
        </a>
      </div>

      {/* 4 Steps Micro-Indicators */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-start">
        {stepsData.map((item) => (
          <div
            key={item.step}
            className={`p-3.5 rounded-2xl border text-start transition-all ${
              isDark
                ? 'glass-bubble-card-subtle-dark'
                : 'glass-bubble-card-subtle-light'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono-num text-cyan-400 font-bold mb-1">
              <span>{item.step}</span>
              <Terminal className="w-3 h-3 opacity-60" />
            </div>
            <strong className={`block text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {item.title}
            </strong>
            <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
