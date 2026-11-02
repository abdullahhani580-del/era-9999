import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  ChevronLeft,
  Gamepad2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleSlot } from '../types/schedule';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  slots: ScheduleSlot[];
  activeSlotId?: string;
  onSlotCompleted: (slotId: string) => void;
  onSessionFinished?: (completedSlot: ScheduleSlot) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onOpenArcadeModal?: () => void;
}

export const FocusCompanionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isDark,
  slots,
  activeSlotId,
  onSlotCompleted,
  onSessionFinished,
  isMinimized,
  onToggleMinimize,
  onOpenArcadeModal,
}) => {
  const { lang, dir } = useLanguage();

  const initialIndex = Math.max(
    0,
    slots.findIndex((s) => s.id === activeSlotId)
  );
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(initialIndex);

  const currentSlot = slots[currentSlotIndex] || slots[0];
  const initialSeconds = (currentSlot?.durationMinutes || 25) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (currentSlot) {
      setSecondsRemaining(currentSlot.durationMinutes * 60);
      setIsRunning(false);
    }
  }, [currentSlotIndex, currentSlot?.id]);

  useEffect(() => {
    if (activeSlotId) {
      const idx = slots.findIndex((s) => s.id === activeSlotId);
      if (idx !== -1 && idx !== currentSlotIndex) {
        setCurrentSlotIndex(idx);
      }
    }
  }, [activeSlotId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            try {
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#06b6d4', '#10b981', '#6366f1'],
              });
            } catch {
              // Ignore
            }
            if (currentSlot) {
              onSlotCompleted(currentSlot.id);
              if (onSessionFinished) {
                onSessionFinished(currentSlot);
              }
            }
            setIsRunning(false);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, currentSlot, onSlotCompleted, onSessionFinished, onClose]);

  const totalSlotSeconds = (currentSlot?.durationMinutes || 25) * 60;
  const progressRatio = totalSlotSeconds > 0 ? (totalSlotSeconds - secondsRemaining) / totalSlotSeconds : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(progressRatio * 100)));

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handleNextSlot = () => {
    if (currentSlotIndex < slots.length - 1) {
      setCurrentSlotIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlot = () => {
    if (currentSlotIndex > 0) {
      setCurrentSlotIndex((prev) => prev - 1);
    }
  };

  const handleAddFiveMinutes = () => {
    setSecondsRemaining((prev) => prev + 300);
  };

  const handleCompleteEarly = () => {
    if (currentSlot) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Ignore
      }
      onSlotCompleted(currentSlot.id);
      setIsRunning(false);
      onClose();
      if (onSessionFinished) {
        onSessionFinished(currentSlot);
      }
    }
  };

  if (!isOpen && !isMinimized) return null;

  // MINIMIZED FLOATING DOCK
  if (isMinimized) {
    return (
      <aside
        aria-label={lang === 'ar' ? 'جلسة المذاكرة الحالية' : 'Active study session'}
        className={`fixed bottom-5 ${
          dir === 'rtl' ? 'left-5' : 'right-5'
        } z-50 transition-all duration-300 animate-slide-up flex items-center gap-3 p-3 px-4 rounded-full border shadow-2xl backdrop-blur-2xl cursor-pointer ${
          isDark
            ? 'bg-[#060811]/95 border-cyan-500/40 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)]'
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-xl'
        }`}
        onClick={onToggleMinimize}
      >
        <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
          <svg className="w-9 h-9 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15"
              className={isDark ? 'stroke-white/10' : 'stroke-slate-200'}
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              className={currentSlot?.type === 'break' ? 'stroke-emerald-400' : 'stroke-cyan-400'}
              strokeWidth="3"
              strokeDasharray={94}
              strokeDashoffset={94 - (94 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute font-mono-num text-[10px] font-black">
            {progressPercent}%
          </span>
        </div>

        <div className="flex flex-col min-w-[120px] max-w-[200px]">
          <span className="text-xs font-bold truncate">
            {currentSlot?.title || (lang === 'ar' ? 'جلسة المذاكرة' : 'Study Session')}
          </span>
          <span className="font-mono-num text-sm font-black text-cyan-400">
            {timeFormatted}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsRunning(!isRunning);
          }}
          className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ms-0.5" />}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMinimize();
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  // STUDY AREA MODAL
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
      dir={dir}
    >
      <div
        className={`w-full max-w-xl rounded-[36px] border p-6 sm:p-10 flex flex-col items-center justify-between relative shadow-2xl transition-all duration-300 ${
          isDark
            ? 'bg-[#060811] border-white/15 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.25)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {currentSlot?.type === 'break'
                ? lang === 'ar' ? 'استراحة' : 'Break'
                : lang === 'ar' ? 'جلسة مذاكرة' : 'Study Session'}
            </span>
            <span className="text-xs text-slate-400 font-mono-num font-bold">
              {currentSlotIndex + 1} / {slots.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-2.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={lang === 'ar' ? 'تصغير' : 'Minimize'}
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={lang === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Task Title & Topic */}
        <div className="text-center mb-6">
          <h2
            id="focus-modal-title"
            className="text-xl sm:text-2xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300"
          >
            {currentSlot?.title}
          </h2>
          {currentSlot?.subtitle && (
            <p className="text-sm text-slate-400 font-medium">
              {currentSlot.subtitle
                .replace(/لتفريغ الذاكرة المؤقتة/g, 'لتستعيد كامل طاقتك ونشاطك')
                .replace(/تفريغ الذاكرة/g, 'تصفية ذهنك')
                .replace(/الذاكرة المؤقتة/g, 'النشاط والتركيز')}
            </p>
          )}
        </div>

        {/* Countdown Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-3 transition-all">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className={isDark ? 'stroke-white/10' : 'stroke-slate-200'}
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className={`transition-all duration-1000 ${
                currentSlot?.type === 'break'
                  ? 'stroke-emerald-400'
                  : 'stroke-cyan-400'
              }`}
              strokeWidth="8"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center select-none">
            <span className="font-mono-num text-5xl sm:text-6xl font-black tracking-tight text-current drop-shadow-sm">
              {timeFormatted}
            </span>
            <span className="text-xs font-bold text-slate-400 mt-2">
              {progressPercent}% {lang === 'ar' ? 'مكتمل' : 'Done'}
            </span>
          </div>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center justify-center gap-4 my-6">
          <button
            type="button"
            disabled={currentSlotIndex === 0}
            onClick={handlePrevSlot}
            className="w-12 h-12 rounded-full border border-white/15 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all active:scale-95"
            title={lang === 'ar' ? 'السابق' : 'Previous'}
          >
            {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-slate-950 shadow-xl transition-all cursor-pointer active:scale-95 ${
              currentSlot?.type === 'break'
                ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_30px_rgba(52,199,89,0.4)]'
                : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 shadow-[0_0_35px_rgba(6,182,212,0.5)]'
            }`}
          >
            {isRunning ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ms-1" />
            )}
          </button>

          <button
            type="button"
            disabled={currentSlotIndex === slots.length - 1}
            onClick={handleNextSlot}
            className="w-12 h-12 rounded-full border border-white/15 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all active:scale-95"
            title={lang === 'ar' ? 'التالي' : 'Next'}
          >
            {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={handleAddFiveMinutes}
            className="px-4 py-2 rounded-full text-xs font-bold border border-white/15 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+5 {lang === 'ar' ? 'دقائق' : 'mins'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSecondsRemaining(totalSlotSeconds);
              setIsRunning(false);
            }}
            className="px-4 py-2 rounded-full text-xs font-bold border border-white/15 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إعادة الوقت' : 'Reset'}</span>
          </button>

          <button
            type="button"
            onClick={handleCompleteEarly}
            className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تم إنهاء الجلسة' : 'Mark Done'}</span>
          </button>

          {onOpenArcadeModal && currentSlot?.type === 'break' && (
            <button
              type="button"
              onClick={onOpenArcadeModal}
              className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'العب لعبة في البريك 🎮' : 'Play Break Game'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
