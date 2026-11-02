import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, X, ArrowRight, ArrowLeft, Flame, Zap, Coffee, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleSlot } from '../types/schedule';
import { useLanguage } from '../context/LanguageContext';
import { EgyptianQuote, getSmartEgyptianQuote } from '../data/egyptianQuotes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  completedSlot?: ScheduleSlot | null;
  nextSlot?: ScheduleSlot | null;
  isAllFinished?: boolean;
  onStartNextSession?: () => void;
  hasNextSession?: boolean;
}

export const EgyptianMotivationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isDark,
  completedSlot,
  nextSlot,
  isAllFinished = false,
  onStartNextSession,
  hasNextSession = false,
}) => {
  const { dir } = useLanguage();
  const [currentQuote, setCurrentQuote] = useState<EgyptianQuote | null>(null);

  // Determine category and retrieve unrepeated smart quote
  useEffect(() => {
    if (isOpen) {
      let category: 'all_finished' | 'break_entry' | 'break_exit' | 'study_continue' = 'study_continue';

      if (isAllFinished) {
        category = 'all_finished';
      } else if (completedSlot?.type === 'study' && nextSlot?.type === 'break') {
        category = 'break_entry';
      } else if (completedSlot?.type === 'break') {
        category = 'break_exit';
      } else {
        category = 'study_continue';
      }

      const quote = getSmartEgyptianQuote(category);
      setCurrentQuote(quote);

      try {
        const particleCount = isAllFinished ? 100 : 55;
        confetti({
          particleCount,
          spread: isAllFinished ? 100 : 75,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen, completedSlot?.id, completedSlot?.type, nextSlot?.type, isAllFinished]);

  if (!isOpen || !currentQuote) return null;

  const handleAction = () => {
    onClose();
    if (!isAllFinished && hasNextSession && onStartNextSession) {
      onStartNextSession();
    }
  };

  const getButtonText = () => {
    if (isAllFinished) {
      return 'تم بحمد الله.. فخورين بيك يا بطل! 🎓';
    }
    if (completedSlot?.type === 'study' && nextSlot?.type === 'break') {
      return 'ادخل على البريك وروّق جمجمتك ☕';
    }
    if (completedSlot?.type === 'break') {
      return 'يلا نرجع للمذاكرة بقلب ميت 🦁';
    }
    return 'يلا ندخل على اللي بعده يا فنان 🚀';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      dir={dir}
    >
      <div
        className={`w-full max-w-md rounded-[32px] border p-5 sm:p-7 flex flex-col items-center text-center relative shadow-2xl transition-all animate-scale-up ${
          isDark
            ? 'bg-[#090d1a] border-cyan-500/30 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.3)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Icon & Badge */}
        <div className="relative mb-3 mt-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-cyan-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full rounded-2xl bg-[#080c16] flex items-center justify-center">
              {isAllFinished ? (
                <GraduationCap className="w-8 h-8 text-amber-400 animate-bounce" />
              ) : completedSlot?.type === 'study' && nextSlot?.type === 'break' ? (
                <Coffee className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 animate-bounce" />
              ) : (
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-bounce" />
              )}
            </div>
          </div>
          <div className="absolute -bottom-1.5 -end-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Motivational Badge */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Sparkles className="w-3 h-3" />
            <span>{currentQuote.badge}</span>
          </span>
        </div>

        {/* Finished Subject Indicator */}
        {completedSlot && (
          <div className="mb-2 text-xs text-slate-400 truncate max-w-full px-2">
            <span>تم إنهاء: </span>
            <strong className="text-cyan-400 font-bold">
              {completedSlot.title}
              {completedSlot.subtitle ? ` (${completedSlot.subtitle})` : ''}
            </strong>
          </div>
        )}

        {/* Egyptian Main Title */}
        <h2 className="text-xl sm:text-2xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300">
          {currentQuote.title}
        </h2>

        {/* Egyptian Quote Card */}
        <div
          className={`w-full p-4 sm:p-5 rounded-2xl border my-2 text-start relative transition-all ${
            isDark
              ? 'bg-slate-900/80 border-white/10 text-slate-200'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          <p className="text-xs sm:text-sm leading-relaxed font-semibold">
            "{currentQuote.quote}"
          </p>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-cyan-400">
              {currentQuote.punchline}
            </p>
          </div>
        </div>

        {/* Single Focused Continuation Action Button */}
        <div className="w-full mt-4">
          <button
            type="button"
            onClick={handleAction}
            className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-emerald-400 via-cyan-500 to-sky-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>{getButtonText()}</span>
            {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
