import React, { useState } from 'react';
import { X, Gamepad2, Rocket, Sparkles, Trophy, Coffee } from 'lucide-react';
import { BreakSnakeGame } from './BreakSnakeGame';
import { SpaceShooterGame } from './SpaceShooterGame';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const BreakArcadeModal: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  const { lang, t, dir } = useLanguage();
  const [activeGame, setActiveGame] = useState<'space' | 'snake'>('space');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      dir={dir}
    >
      <div
        className={`w-full max-w-2xl rounded-[32px] border p-4 sm:p-6 flex flex-col relative shadow-2xl transition-all animate-scale-up max-h-[95vh] overflow-y-auto ${
          isDark
            ? 'bg-[#070b16] border-purple-500/30 text-slate-100 shadow-[0_0_50px_rgba(168,85,247,0.25)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  {lang === 'ar' ? 'ألعاب الاستراحة والترويق' : 'Break Arcade Games'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  {lang === 'ar' ? 'للتسلية في البريك' : 'Fun in Break'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {lang === 'ar'
                  ? 'افصل جمجمتك 5 دقايق عشان ترجع للمذاكرة بباور 100%'
                  : 'Take a quick 5-minute break to recharge your focus'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className={`p-1 rounded-2xl border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveGame('space')}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeGame === 'space'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Rocket className="w-4 h-4" />
              <span>{lang === 'ar' ? 'معركة الفضاء 🚀' : 'Space Battle'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGame('snake')}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeGame === 'snake'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'لعبة الثعبان 🐍' : 'Snake Classic'}</span>
            </button>
          </div>
        </div>

        {/* Active Game Container */}
        <div className="w-full flex justify-center">
          {activeGame === 'space' ? (
            <SpaceShooterGame isDark={isDark} />
          ) : (
            <BreakSnakeGame isDark={isDark} />
          )}
        </div>
      </div>
    </div>
  );
};
