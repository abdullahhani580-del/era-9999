import React, { useState } from 'react';
import {
  Download,
  AlertTriangle,
  RotateCcw,
  Coffee,
  Calendar,
  Layers,
  Percent,
  Clock,
  Check,
  Play,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ScheduleResult, Priority, ScheduleSlot } from '../types/schedule';
import { formatDurationArabic, formatDurationEng } from '../utils/timeUtils';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isDark: boolean;
  result: ScheduleResult;
  onOpenPosterModal: () => void;
  onRegenerate: () => void;
  onToggleSlotComplete: (slotId: string) => void;
  onExtendTimeWindow?: (newEndTime24h: string) => void;
  onStartFocusSession?: (slotId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

// Helper to format clean, compact time range
function formatCompactSlotTime(
  startTimeStr: string,
  endTimeStr: string,
  durationMins: number,
  lang: 'ar' | 'en'
) {
  const parse = (str: string) => {
    if (!str) return { time: '', period: '' };
    const parts = str.trim().split(' ');
    const timePart = parts[0] || '';
    const period = parts[1] || '';
    const [hStr, mStr] = timePart.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = mStr || '00';
    return { time: `${h}:${m}`, period };
  };

  const start = parse(startTimeStr);
  const end = parse(endTimeStr);

  const periodLabel = lang === 'ar' ? (end.period === 'AM' ? 'ص' : 'م') : end.period;
  const timeRange = `${start.time} - ${end.time} ${periodLabel}`;
  const durationLabel = lang === 'ar' ? `${durationMins} د` : `${durationMins}m`;

  return { timeRange, durationLabel };
}

function cleanSlotSubtitle(text?: string): string {
  if (!text) return '';
  return text
    .replace(/لتفريغ الذاكرة المؤقتة/g, 'لتستعيد كامل طاقتك ونشاطك')
    .replace(/تفريغ الذاكرة/g, 'تصفية ذهنك')
    .replace(/الذاكرة المؤقتة/g, 'النشاط والتركيز');
}

export const ScheduleResultCard: React.FC<Props> = ({
  isDark,
  result,
  onOpenPosterModal,
  onRegenerate,
  onToggleSlotComplete,
  onExtendTimeWindow,
  onStartFocusSession,
  isFullscreen: externalFullscreen,
  onToggleFullscreen,
}) => {
  const { lang, t, dir } = useLanguage();
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen = externalFullscreen !== undefined ? externalFullscreen : internalFullscreen;

  const handleToggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      setInternalFullscreen(!internalFullscreen);
    }
  };

  const PRIORITY_BADGES: Record<
    Priority,
    { label: string; icon: string; border: string; text: string; bg: string }
  > = {
    very_high: {
      label: t.priorityVeryHigh,
      icon: '🔴',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    high: {
      label: t.priorityHigh,
      icon: '🟠',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    medium: {
      label: t.priorityMedium,
      icon: '🟡',
      border: 'border-yellow-500/40',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    low: {
      label: t.priorityLow,
      icon: '🟢',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  };

  const completedCount = result.slots.filter((s) => s.type === 'study' && s.isCompleted).length;
  const studySlotCount = result.slots.filter((s) => s.type === 'study').length;
  const completionPercentage = studySlotCount > 0 ? Math.round((completedCount / studySlotCount) * 100) : 0;

  const durationStr =
    lang === 'ar'
      ? formatDurationArabic(result.totalAvailableMinutes)
      : formatDurationEng(result.totalAvailableMinutes);
  const studyDurationStr =
    lang === 'ar'
      ? formatDurationArabic(result.totalStudyMinutes)
      : formatDurationEng(result.totalStudyMinutes);
  const breakDurationStr =
    lang === 'ar'
      ? formatDurationArabic(result.totalBreakMinutes)
      : formatDurationEng(result.totalBreakMinutes);

  return (
    <section
      id="schedule-matrix"
      className={`${
        isFullscreen
          ? `fixed inset-0 z-[100] min-h-screen overflow-y-auto overflow-x-hidden p-3.5 sm:p-8 ${
              isDark ? 'bg-[#04060b] text-slate-100' : 'bg-slate-50 text-slate-900'
            }`
          : `rounded-[32px] transition-all duration-300 p-4 sm:p-7 pb-8 sm:pb-12 mb-8 border relative overflow-hidden ${
              isDark
                ? 'glass-bubble-panel-dark border-white/15 shadow-2xl'
                : 'glass-bubble-panel-light border-slate-300/80 shadow-xl'
            }`
      }`}
      dir={dir}
    >
      <div className={isFullscreen ? 'w-full max-w-4xl mx-auto pb-12' : 'w-full'}>
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="min-w-0 max-w-full">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-cyan-400 mb-1 max-w-full">
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                <span>{result.dateFormatted}</span>
              </span>
              <span aria-hidden="true" className="opacity-60 hidden sm:inline">·</span>
              <span className="font-mono-num font-bold shrink-0" dir="ltr">
                {result.startTimeStr} → {result.endTimeStr}
              </span>
              <span aria-hidden="true" className="opacity-60 hidden sm:inline">·</span>
              <span className="text-slate-400 font-medium shrink-0">({durationStr})</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'ar' ? 'جدول المذاكرة' : 'Study Schedule'}
            </h2>
          </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`px-3.5 py-2 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isFullscreen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : isDark
                ? 'bg-slate-800/80 border-white/10 text-slate-200 hover:text-white hover:bg-slate-700'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
            }`}
            title={isFullscreen ? (lang === 'ar' ? 'تصغير الشاشة' : 'Exit Fullscreen') : (lang === 'ar' ? 'تكبير ملء الشاشة' : 'Fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>
              {isFullscreen
                ? (lang === 'ar' ? 'تصغير' : 'Exit')
                : (lang === 'ar' ? 'ملء الشاشة' : 'Fullscreen')}
            </span>
          </button>

          {onStartFocusSession && (
            <button
              type="button"
              onClick={() => {
                const firstPending = result.slots.find((s) => !s.isCompleted) || result.slots[0];
                if (firstPending) onStartFocusSession(firstPending.id);
              }}
              className="px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:brightness-110 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'ar' ? 'بدء المذاكرة' : 'Start Study'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRegenerate}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-slate-800/80 border-white/10 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إعادة ترتيب' : 'Regenerate'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPosterModal}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 bg-cyan-600 text-white hover:bg-cyan-500 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'ar' ? 'إنشاء الجدول كصورة' : 'Save as Image'}</span>
          </button>
        </div>
      </div>

      {/* Overflow Notice */}
      {result.overflowWarning && (
        <div
          className={`my-4 p-4 rounded-2xl border transition-all ${
            isDark
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <strong className="block leading-relaxed">
                {lang === 'ar'
                  ? `تنبيه: الوقت المتاح ضيق! يفضل تمديد وقت المذاكرة حتى ${result.suggestedEndTime12h || result.endTimeStr} لإنهاء جميع المواد.`
                  : `Notice: Time is tight! Extend session until ${result.suggestedEndTime12h || result.endTimeStr} to complete all tasks.`}
              </strong>

              {onExtendTimeWindow && result.suggestedEndTime24h && (
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => onExtendTimeWindow(result.suggestedEndTime24h!)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#ff9f0a] hover:bg-[#ff8500] text-slate-950 transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.extendWindowBtn}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'ar' ? 'وقت المذاكرة' : 'Study Time'}
            </span>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-sky-100 text-sky-700'
            }`}>
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <strong className={`text-lg font-bold font-mono-num block ${
            isDark ? 'text-cyan-400' : 'text-sky-700'
          }`}>
            {studyDurationStr}
          </strong>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'ar' ? 'وقت الراحة' : 'Break Time'}
            </span>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <Coffee className="w-3.5 h-3.5" />
            </div>
          </div>
          <strong className={`text-lg font-bold font-mono-num block ${
            isDark ? 'text-emerald-400' : 'text-emerald-700'
          }`}>
            {breakDurationStr}
          </strong>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'ar' ? 'نسبة الإنجاز' : 'Completion'}
            </span>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
            }`}>
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <strong className={`text-lg font-bold font-mono-num ${
              isDark ? 'text-amber-400' : 'text-amber-700'
            }`}>
              {completionPercentage}%
            </strong>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              ({completedCount}/{studySlotCount})
            </span>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'ar' ? 'عدد الجلسات' : 'Sessions'}
            </span>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <strong className={`text-lg font-bold font-mono-num block ${
            isDark ? 'text-indigo-400' : 'text-indigo-700'
          }`}>
            {studySlotCount} {lang === 'ar' ? 'جلسة' : 'sessions'}
          </strong>
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'ar' ? 'الجدول والمهام' : 'TIMELINE & TASKS'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {result.slots.length} {lang === 'ar' ? 'فترة' : 'slots'}
          </span>
        </div>

        <div className="space-y-2">
          {result.slots.map((slot) => {
            const isBreak = slot.type === 'break';
            const isDone = slot.isCompleted;
            const timeInfo = formatCompactSlotTime(
              slot.startTime,
              slot.endTime,
              slot.durationMinutes,
              lang
            );

            if (isBreak) {
              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isDark
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                      : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs sm:text-sm font-bold block truncate">
                        {slot.title || (lang === 'ar' ? 'وقت استراحة' : 'Break Time')}
                      </strong>
                      <span className={`text-[11px] block truncate ${isDark ? 'text-emerald-300/80' : 'text-emerald-700'}`} title={cleanSlotSubtitle(slot.subtitle)}>
                        {cleanSlotSubtitle(slot.subtitle) || (lang === 'ar' ? 'استراحة لتجديد النشاط والراحة' : 'Smart recharge break')}
                      </span>
                    </div>
                  </div>

                  <div
                    dir="ltr"
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono-num text-xs font-bold shrink-0 self-start sm:self-auto border ${
                      isDark
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-emerald-100/90 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <span>{timeInfo.timeRange}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {timeInfo.durationLabel}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative group ${
                  isDone
                    ? isDark
                      ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-200 opacity-80'
                      : 'bg-sky-50/80 border-sky-300 text-sky-950 opacity-80 shadow-2xs'
                    : isDark
                    ? 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div
                  className={`absolute top-2 bottom-2 start-1.5 w-1 rounded-full ${
                    isDone ? 'bg-emerald-500' : 'bg-cyan-500'
                  }`}
                />

                <div className="flex items-center gap-3 ps-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleSlotComplete(slot.id)}
                    className="cursor-pointer text-cyan-500 shrink-0 active:scale-90 transition-transform"
                    title={isDone ? (lang === 'ar' ? 'غير مكتمل' : 'Mark Incomplete') : (lang === 'ar' ? 'مكتمل' : 'Mark Completed')}
                  >
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400 hover:border-cyan-500 transition-colors" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong
                        className={`text-xs sm:text-sm font-bold ${
                          isDone ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {slot.title}
                      </strong>
                      {slot.priority && (
                        <span
                          className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            PRIORITY_BADGES[slot.priority]?.bg
                          } ${PRIORITY_BADGES[slot.priority]?.text}`}
                        >
                          {PRIORITY_BADGES[slot.priority]?.label}
                        </span>
                      )}
                    </div>
                    {slot.subtitle && (
                      <p className={`text-[11px] sm:text-xs mt-0.5 truncate ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`} title={cleanSlotSubtitle(slot.subtitle)}>
                        {cleanSlotSubtitle(slot.subtitle)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <div
                    dir="ltr"
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono-num text-xs font-bold border ${
                      isDone
                        ? isDark
                          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                          : 'bg-sky-100 border-sky-300 text-sky-800'
                        : isDark
                        ? 'bg-slate-800/80 border-white/10 text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{timeInfo.timeRange}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isDone
                        ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                        : isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {timeInfo.durationLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
};
