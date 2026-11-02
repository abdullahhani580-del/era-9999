import React, { useState } from 'react';
import { Gamepad2, Rocket, Sparkles } from 'lucide-react';
import { BreakSnakeGame } from './BreakSnakeGame';
import { SpaceShooterGame } from './SpaceShooterGame';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isDark: boolean;
}

export const BreakArcadeSection: React.FC<Props> = ({ isDark }) => {
  const { lang, t, dir } = useLanguage();
  const [activeGame, setActiveGame] = useState<'space' | 'snake'>('space');

  return (
    <div id="arcade-section" className="space-y-4" dir={dir}>
      {/* Top Arcade Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-cyber font-bold text-sm tracking-wide uppercase text-slate-300">
            {t.arcadeTitle}
          </span>
        </div>

        {/* Tab Buttons for Arcade Games */}
        <div
          className={`p-1 rounded-2xl border flex items-center gap-1 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-200/80 border-slate-300'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveGame('space')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeGame === 'space'
                ? isDark
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'bg-indigo-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{t.arcadeShooterTitle}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGame('snake')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeGame === 'snake'
                ? isDark
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold shadow-md'
                  : 'bg-emerald-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{t.arcadeSnakeTitle}</span>
          </button>
        </div>
      </div>

      {/* Render Active Game */}
      <div className="relative">
        {activeGame === 'space' ? (
          <SpaceShooterGame isDark={isDark} />
        ) : (
          <BreakSnakeGame isDark={isDark} />
        )}
      </div>
    </div>
  );
};
