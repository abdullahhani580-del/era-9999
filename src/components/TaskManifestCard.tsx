import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  Video,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Check,
  X,
  FileText,
  Clock,
  Brain,
  AlertCircle,
} from 'lucide-react';
import {
  SubjectTask,
  Priority,
  ContentType,
  QuestionDifficulty,
  QuestionFormat,
  QuestionDifficultyLevel,
} from '../types/schedule';
import {
  parseVideoDurationString,
  calculateWindowMinutes,
  formatDurationArabic,
  formatDurationEng,
} from '../utils/timeUtils';
import { useLanguage } from '../context/LanguageContext';

// Helper to normalize Eastern/Arabic numerals to standard digits and strip non-numeric chars
const normalizeDigits = (val: string): string => {
  return val
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[^0-9]/g, '');
};

interface Props {
  isDark: boolean;
  tasks: SubjectTask[];
  startTime: string;
  endTime: string;
  onStartTimeChange: (val: string) => void;
  onEndTimeChange: (val: string) => void;
  onAddTask: (task: Omit<SubjectTask, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updated: Partial<SubjectTask>) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (newTasks: SubjectTask[]) => void;
}

export const TaskManifestCard: React.FC<Props> = ({
  isDark,
  tasks,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
}) => {
  const { lang, t, dir } = useLanguage();

  const PRIORITY_OPTIONS: { id: Priority; label: string; icon: string; colorClass: string; desc: string }[] = [
    {
      id: 'very_high',
      label: t.priorityVeryHigh,
      icon: '🔴',
      colorClass: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
      desc: lang === 'ar' ? 'توضع بأعلى أولوية في الجدول' : 'Scheduled first with highest focus',
    },
    {
      id: 'high',
      label: t.priorityHigh,
      icon: '🟠',
      colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      desc: lang === 'ar' ? 'تأتي مباشرة بعد المواد الحرجة' : 'Follows critical tasks',
    },
    {
      id: 'medium',
      label: t.priorityMedium,
      icon: '🟡',
      colorClass: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
      desc: lang === 'ar' ? 'جلسات قياسية متوازنة' : 'Balanced standard study block',
    },
    {
      id: 'low',
      label: t.priorityLow,
      icon: '🟢',
      colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      desc: lang === 'ar' ? 'جلسات أخف حسب توفر الوقت' : 'Lighter session if time allows',
    },
  ];

  const CONTENT_TYPES: { id: ContentType; label: string; icon: React.ReactNode }[] = [
    { id: 'video', label: t.contentTypeVideo, icon: <Video className="w-4 h-4 text-cyan-400" /> },
    { id: 'study', label: t.contentTypeStudy, icon: <BookOpen className="w-4 h-4 text-indigo-400" /> },
    { id: 'practice', label: t.contentTypePractice, icon: <HelpCircle className="w-4 h-4 text-emerald-400" /> },
    { id: 'revision', label: t.contentTypeRevision, icon: <RotateCcw className="w-4 h-4 text-amber-400" /> },
  ];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form Fields
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [contentType, setContentType] = useState<ContentType>('video');

  // Video Duration inputs
  const [videoHours, setVideoHours] = useState('01');
  const [videoMinutes, setVideoMinutes] = useState('00');
  const [videoSeconds, setVideoSeconds] = useState('00');

  // Practice Mode Inputs (2 question formats, difficulty level, no minutes displayed)
  const [questionsCountStr, setQuestionsCountStr] = useState('20');
  const [questionFormat, setQuestionFormat] = useState<QuestionFormat>('mcq');
  const [questionDifficultyLevel, setQuestionDifficultyLevel] = useState<QuestionDifficultyLevel>('unspecified');

  // Study & Revision Duration input (Free typing)
  const [targetDurationMinutesStr, setTargetDurationMinutesStr] = useState('60');

  const resetForm = () => {
    setName('');
    setTopic('');
    setPriority('high');
    setContentType('video');
    setVideoHours('01');
    setVideoMinutes('00');
    setVideoSeconds('00');
    setQuestionsCountStr('20');
    setQuestionFormat('mcq');
    setQuestionDifficultyLevel('unspecified');
    setTargetDurationMinutesStr('60');
    setEditingTaskId(null);
    setFormError(null);
  };

  const startEdit = (task: SubjectTask) => {
    setFormError(null);
    setEditingTaskId(task.id);
    setName(task.name);
    setTopic(task.topic || '');
    setPriority(task.priority);
    setContentType(task.contentType);

    if (task.videoDurationFormatted) {
      const parts = task.videoDurationFormatted.split(':');
      if (parts.length === 3) {
        setVideoHours(parts[0]);
        setVideoMinutes(parts[1]);
        setVideoSeconds(parts[2]);
      }
    }

    if (task.questionFormat) {
      setQuestionFormat(task.questionFormat);
    } else {
      setQuestionFormat('mcq');
    }

    if (task.questionDifficultyLevel) {
      setQuestionDifficultyLevel(task.questionDifficultyLevel);
    } else {
      setQuestionDifficultyLevel('unspecified');
    }

    if (task.questionsCount) {
      setQuestionsCountStr(String(task.questionsCount));
    } else {
      setQuestionsCountStr('20');
    }

    if (task.targetDurationMinutes) {
      setTargetDurationMinutesStr(String(task.targetDurationMinutes));
    } else {
      setTargetDurationMinutesStr('60');
    }

    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError(lang === 'ar' ? 'يرجى كتابة اسم المادة أو المقرر' : 'Please enter the subject name');
      return;
    }

    let vDurationFormatted: string | undefined;
    let vMinutes: number | undefined;

    if (contentType === 'video') {
      const h = Math.min(24, Math.max(0, parseInt(videoHours, 10) || 0));
      const m = Math.min(59, Math.max(0, parseInt(videoMinutes, 10) || 0));
      const s = Math.min(59, Math.max(0, parseInt(videoSeconds, 10) || 0));
      const totalSec = h * 3600 + m * 60 + s;
      if (totalSec <= 0) {
        setFormError(lang === 'ar' ? 'يرجى إدخال مدة صالحة للفيديو (دقائق أو ساعات)' : 'Please enter a valid video duration');
        return;
      }
      vDurationFormatted = `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
      vMinutes = Math.max(1, Math.round(totalSec / 60));
    }

    const cleanTaskData: Omit<SubjectTask, 'id' | 'createdAt'> = {
      name: trimmedName,
      priority,
      contentType,
    };

    if (topic.trim()) {
      cleanTaskData.topic = topic.trim();
    }
    if (contentType === 'video' && vDurationFormatted) {
      cleanTaskData.videoDurationFormatted = vDurationFormatted;
      cleanTaskData.videoDurationMinutes = vMinutes;
    }
    if (contentType === 'practice') {
      const parsedQ = parseInt(questionsCountStr, 10);
      if (isNaN(parsedQ) || parsedQ <= 0) {
        setFormError(lang === 'ar' ? 'يرجى إدخال عدد أسئلة صالح (أكبر من صفر)' : 'Please enter questions count > 0');
        return;
      }
      // Safety cap at 500 questions per task to prevent memory/layout overload
      const qCount = Math.min(500, parsedQ);
      cleanTaskData.questionsCount = qCount;
      cleanTaskData.questionFormat = questionFormat;
      cleanTaskData.questionDifficultyLevel = questionDifficultyLevel;
    } else if (contentType !== 'video') {
      const parsedTarget = parseInt(targetDurationMinutesStr, 10);
      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        setFormError(lang === 'ar' ? 'يرجى إدخال مدة صالحة بالدقائق' : 'Please enter valid minutes');
        return;
      }
      cleanTaskData.targetDurationMinutes = Math.min(720, parsedTarget);
    }

    if (editingTaskId) {
      onUpdateTask(editingTaskId, cleanTaskData);
    } else {
      onAddTask(cleanTaskData);
    }

    resetForm();
    setIsFormOpen(false);
  };

  const moveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...tasks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newTasks.length) return;
    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIdx];
    newTasks[targetIdx] = temp;
    onReorderTasks(newTasks);
  };

  const windowMinutes = calculateWindowMinutes(startTime, endTime);
  const formattedDuration =
    lang === 'ar' ? formatDurationArabic(windowMinutes) : formatDurationEng(windowMinutes);

  return (
    <section
      id="task-manifest"
      className={`rounded-3xl transition-all duration-300 p-5 sm:p-7 space-y-6 ${
        isDark ? 'glass-bubble-panel-dark' : 'glass-bubble-panel-light'
      }`}
      dir={dir}
    >
      {/* Unified Section 1: Study Time Window */}
      <div className="pb-5 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                {lang === 'ar' ? 'وقت المذاكرة المتاح اليوم' : 'Daily Available Study Time'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'حدد وقت بداية ونهاية المذاكرة' : 'Set your start and end study hours'}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold font-mono-num self-start sm:self-auto">
            <span>{lang === 'ar' ? 'الوقت الإجمالي:' : 'Total:'}</span>
            <span>{formattedDuration}</span>
          </div>
        </div>

        {/* 2 Time Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Time Box */}
          <div className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
            <div className="flex items-center justify-between mb-1.5 text-xs font-bold">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{lang === 'ar' ? 'بداية المذاكرة:' : 'Start Time:'}</span>
            </div>
            <div className="grid grid-cols-12 gap-1.5 items-center">
              <select
                value={(() => {
                  const parts = startTime.split(':');
                  const h24 = parseInt(parts[0], 10) || 0;
                  return h24 % 12 === 0 ? 12 : h24 % 12;
                })()}
                onChange={(e) => {
                  const newH12 = parseInt(e.target.value, 10);
                  const parts = startTime.split(':');
                  const h24 = parseInt(parts[0], 10) || 0;
                  const m = parseInt(parts[1], 10) || 0;
                  const p = h24 >= 12 ? 'PM' : 'AM';
                  let calcH = newH12 % 12;
                  if (p === 'PM') calcH += 12;
                  onStartTimeChange(`${calcH < 10 ? `0${calcH}` : calcH}:${m < 10 ? `0${m}` : m}`);
                }}
                className={`col-span-5 h-9 px-1 rounded-lg border text-xs font-bold font-mono-num text-center cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white'
                }`}
              >
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>

              <select
                value={parseInt(startTime.split(':')[1] || '0', 10)}
                onChange={(e) => {
                  const newM = parseInt(e.target.value, 10);
                  const parts = startTime.split(':');
                  const h = parts[0] || '18';
                  onStartTimeChange(`${h}:${newM < 10 ? `0${newM}` : newM}`);
                }}
                className={`col-span-4 h-9 px-1 rounded-lg border text-xs font-bold font-mono-num text-center cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white'
                }`}
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m}>{m < 10 ? `0${m}` : m}</option>
                ))}
              </select>

              <div className={`col-span-3 flex h-9 p-0.5 rounded-lg border gap-0.5 ${
                isDark ? 'border-slate-700/60 bg-slate-950/60' : 'border-slate-300 bg-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    const parts = startTime.split(':');
                    const h24 = parseInt(parts[0], 10) || 0;
                    const m = parts[1] || '00';
                    const h12 = h24 % 12;
                    onStartTimeChange(`${h12 < 10 ? `0${h12}` : h12}:${m}`);
                  }}
                  className={`flex-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    (parseInt(startTime.split(':')[0], 10) || 0) < 12
                      ? isDark
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-sky-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'ar' ? 'ص' : 'AM'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const parts = startTime.split(':');
                    const h24 = parseInt(parts[0], 10) || 0;
                    const m = parts[1] || '00';
                    const h12 = (h24 % 12) + 12;
                    onStartTimeChange(`${h12 < 10 ? `0${h12}` : h12}:${m}`);
                  }}
                  className={`flex-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    (parseInt(startTime.split(':')[0], 10) || 0) >= 12
                      ? isDark
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-sky-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'ar' ? 'م' : 'PM'}
                </button>
              </div>
            </div>
          </div>

          {/* End Time Box */}
          <div className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
            <div className="flex items-center justify-between mb-1.5 text-xs font-bold">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{lang === 'ar' ? 'نهاية المذاكرة:' : 'End Time:'}</span>
            </div>
            <div className="grid grid-cols-12 gap-1.5 items-center">
              <select
                value={(() => {
                  const parts = endTime.split(':');
                  const h24 = parseInt(parts[0], 10) || 0;
                  return h24 % 12 === 0 ? 12 : h24 % 12;
                })()}
                onChange={(e) => {
                  const newH12 = parseInt(e.target.value, 10);
                  const parts = endTime.split(':');
                  const h24 = parseInt(parts[0], 10) || 0;
                  const m = parseInt(parts[1], 10) || 0;
                  const p = h24 >= 12 ? 'PM' : 'AM';
                  let calcH = newH12 % 12;
                  if (p === 'PM') calcH += 12;
                  onEndTimeChange(`${calcH < 10 ? `0${calcH}` : calcH}:${m < 10 ? `0${m}` : m}`);
                }}
                className={`col-span-5 h-9 px-1 rounded-lg border text-xs font-bold font-mono-num text-center cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white'
                }`}
              >
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>

              <select
                value={parseInt(endTime.split(':')[1] || '0', 10)}
                onChange={(e) => {
                  const newM = parseInt(e.target.value, 10);
                  const parts = endTime.split(':');
                  const h = parts[0] || '00';
                  onEndTimeChange(`${h}:${newM < 10 ? `0${newM}` : newM}`);
                }}
                className={`col-span-4 h-9 px-1 rounded-lg border text-xs font-bold font-mono-num text-center cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white'
                }`}
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m}>{m < 10 ? `0${m}` : m}</option>
                ))}
              </select>

              <div className={`col-span-3 flex h-9 p-0.5 rounded-lg border gap-0.5 ${
                isDark ? 'border-slate-700/60 bg-slate-950/60' : 'border-slate-300 bg-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    const parts = endTime.split(':');
                    const h24 = parseInt(parts[0], 10) || 0;
                    const m = parts[1] || '00';
                    const h12 = h24 % 12;
                    onEndTimeChange(`${h12 < 10 ? `0${h12}` : h12}:${m}`);
                  }}
                  className={`flex-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    (parseInt(endTime.split(':')[0], 10) || 0) < 12
                      ? isDark
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-sky-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'ar' ? 'ص' : 'AM'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const parts = endTime.split(':');
                    const h24 = parseInt(parts[0], 10) || 0;
                    const m = parts[1] || '00';
                    const h12 = (h24 % 12) + 12;
                    onEndTimeChange(`${h12 < 10 ? `0${h12}` : h12}:${m}`);
                  }}
                  className={`flex-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    (parseInt(endTime.split(':')[0], 10) || 0) >= 12
                      ? isDark
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-sky-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'ar' ? 'م' : 'PM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Section 2: Subjects & Lessons Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isDark
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/30'
                : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-base sm:text-lg font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {lang === 'ar' ? 'المواد والدروس' : 'Subjects & Lessons'}
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono-num font-bold ${
                  isDark ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                }`}
              >
                {tasks.length} {t.tasksCountBadge}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'ar' ? 'أضف المواد التي ترغب في مذاكرتها اليوم' : 'Add subjects you want to study today'}
            </p>
          </div>
        </div>

        {/* Add Subject Button */}
        {!isFormOpen && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ {lang === 'ar' ? 'إضافة مادة' : 'Add Subject'}</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal / Box */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className={`mt-6 p-5 sm:p-6 rounded-3xl border transition-all ${
            isDark
              ? 'glass-bubble-card-dark'
              : 'glass-bubble-card-light'
          }`}
        >
          <div className={`flex items-center justify-between pb-3.5 border-b mb-4.5 ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <h3 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${
              isDark ? 'text-cyan-400' : 'text-sky-700'
            }`}>
              <Sparkles className="w-4.5 h-4.5" />
              <span>{editingTaskId ? (lang === 'ar' ? 'تعديل بيانات المادة' : 'Edit Subject') : (lang === 'ar' ? 'إضافة مادة جديدة' : 'Add New Subject')}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-bold animate-shake bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {lang === 'ar' ? 'اسم المادة أو المقرر *' : 'Subject Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder={t.tasksNamePlaceholder}
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${
                  isDark
                    ? 'glass-bubble-input-dark text-white focus:border-cyan-400 placeholder:text-slate-500'
                    : 'glass-bubble-input-light text-slate-900 focus:border-sky-600 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {lang === 'ar' ? 'الدرس أو الموضوع (اختياري)' : 'Lesson / Topic (Optional)'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.tasksTopicPlaceholder}
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${
                  isDark
                    ? 'glass-bubble-input-dark text-white focus:border-cyan-400 placeholder:text-slate-500'
                    : 'glass-bubble-input-light text-slate-900 focus:border-sky-600 placeholder:text-slate-400'
                }`}
              />
            </div>

            {/* Priority Selector */}
            <div className="md:col-span-2">
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t.tasksPriorityLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id)}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      priority === opt.id
                        ? `${opt.colorClass} border-cyan-400 ring-2 ring-cyan-400/30 font-bold shadow-sm`
                        : isDark
                        ? 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-white/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-bold">{opt.label}</span>
                    <span className="block text-[10px] opacity-75 mt-0.5 truncate">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Selector */}
            <div className="md:col-span-2">
              <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t.tasksContentTypeLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CONTENT_TYPES.map((ct) => {
                  const isSelected = contentType === ct.id;
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => {
                        setContentType(ct.id);
                        if (formError) setFormError(null);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-center sm:justify-start gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'bg-sky-50 border-sky-500 text-sky-950 ring-2 ring-sky-400/30 shadow-sm'
                          : isDark
                          ? 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="shrink-0">{ct.icon}</div>
                      <span className="truncate">{ct.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exclusive Dynamic Section: ONLY shows controls specific to the chosen button */}
            {contentType === 'video' && (
              <div
                className={`md:col-span-2 p-4 sm:p-5 rounded-2xl border transition-all animate-fadeIn ${
                  isDark
                    ? 'bg-cyan-950/20 border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    : 'bg-cyan-50/70 border-cyan-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs sm:text-sm font-bold text-cyan-400 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'ar' ? 'مدة شرح الفيديو (ساعات : دقائق : ثواني):' : 'Video Duration (Hours : Minutes : Seconds):'}</span>
                  </span>
                  {videoHours || videoMinutes ? (
                    <span className="text-xs font-mono-num font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                      {parseInt(videoHours, 10) > 0 ? `${parseInt(videoHours, 10)} س ` : ''}
                      {parseInt(videoMinutes, 10)} د
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2.5 font-mono-num" dir="ltr">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 mb-1 font-sans">{lang === 'ar' ? 'ساعات' : 'Hrs'}</span>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={videoHours}
                      onChange={(e) => setVideoHours(e.target.value)}
                      className={`w-18 px-2 py-2.5 text-center rounded-xl font-bold text-base transition-all focus:outline-none ${
                        isDark
                          ? 'glass-bubble-input-dark text-white focus:border-cyan-400'
                          : 'glass-bubble-input-light text-slate-900 focus:border-cyan-500'
                      }`}
                    />
                  </div>
                  <span className="text-cyan-400 font-bold text-lg mt-4">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 mb-1 font-sans">{lang === 'ar' ? 'دقائق' : 'Min'}</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={videoMinutes}
                      onChange={(e) => setVideoMinutes(e.target.value)}
                      className={`w-18 px-2 py-2.5 text-center rounded-xl font-bold text-base transition-all focus:outline-none ${
                        isDark
                          ? 'glass-bubble-input-dark text-white focus:border-cyan-400'
                          : 'glass-bubble-input-light text-slate-900 focus:border-cyan-500'
                      }`}
                    />
                  </div>
                  <span className="text-cyan-400 font-bold text-lg mt-4">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 mb-1 font-sans">{lang === 'ar' ? 'ثواني' : 'Sec'}</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={videoSeconds}
                      onChange={(e) => setVideoSeconds(e.target.value)}
                      className={`w-18 px-2 py-2.5 text-center rounded-xl font-bold text-base transition-all focus:outline-none ${
                        isDark
                          ? 'glass-bubble-input-dark text-white focus:border-cyan-400'
                          : 'glass-bubble-input-light text-slate-900 focus:border-cyan-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {contentType === 'practice' && (() => {
              const parsedQ = parseInt(questionsCountStr, 10) || 0;

              return (
                <div
                  className={`md:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-4 transition-all animate-fadeIn ${
                    isDark
                      ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      : 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                  }`}
                >
                  {/* 1. حقل كتابة عدد الأسئلة بحرية تامة */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'ar' ? 'عدد الأسئلة والتمارين:' : 'Number of Questions:'}</span>
                      </label>
                      {parsedQ > 0 && (
                        <div className="flex items-center gap-2">
                          {parsedQ > 50 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Brain className="w-3 h-3 text-amber-400" />
                              <span>{lang === 'ar' ? '> 50 سؤال (استراحة مطلوبة)' : '> 50 Qs (Break required)'}</span>
                            </span>
                          )}
                          <span className="text-xs font-bold text-emerald-300 font-mono-num bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                            {parsedQ} {lang === 'ar' ? 'سؤال' : 'questions'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={questionsCountStr}
                        onChange={(e) => {
                          const clean = normalizeDigits(e.target.value);
                          setQuestionsCountStr(clean);
                        }}
                        placeholder={lang === 'ar' ? 'اكتب عدد الأسئلة هنا (مثال: 25 أو 60)' : 'Enter number of questions (e.g. 25 or 60)'}
                        className={`w-full px-4 py-3 rounded-xl font-mono-num font-bold text-base transition-all focus:outline-none placeholder:font-sans placeholder:text-xs placeholder:font-normal ${
                          isDark
                            ? 'glass-bubble-input-dark text-white focus:border-emerald-400 placeholder:text-slate-500'
                            : 'glass-bubble-input-light text-slate-900 focus:border-emerald-500 placeholder:text-slate-400'
                        }`}
                      />
                      <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400/80 pointer-events-none">
                        {lang === 'ar' ? 'سؤال' : 'questions'}
                      </span>
                    </div>
                  </div>

                  {/* 2. نوع الأسئلة: خيارين فقط الاختياري MCQ و المقالي */}
                  <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'ar' ? 'نوع الأسئلة (خيارين فقط):' : 'Question Type (2 Options Only):'}</span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionFormat('mcq');
                          if (formError) setFormError(null);
                        }}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                          questionFormat === 'mcq'
                            ? isDark
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30 font-bold shadow-sm'
                              : 'bg-sky-50 border-sky-500 text-sky-950 ring-2 ring-sky-400/30 font-bold shadow-xs'
                            : isDark
                            ? 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">🔘</span>
                          <strong className="text-xs sm:text-sm font-bold">
                            {lang === 'ar' ? 'الاختياري (MCQ)' : 'Multiple Choice (MCQ)'}
                          </strong>
                        </div>
                        <span className="text-[11px] opacity-75">
                          {lang === 'ar' ? 'اختيار من متعدد' : 'Select from options'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuestionFormat('essay');
                          if (formError) setFormError(null);
                        }}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                          questionFormat === 'essay'
                            ? isDark
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/30 font-bold shadow-sm'
                              : 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/30 font-bold shadow-xs'
                            : isDark
                            ? 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">📝</span>
                          <strong className="text-xs sm:text-sm font-bold">
                            {lang === 'ar' ? 'المقالي' : 'Essay / Written'}
                          </strong>
                        </div>
                        <span className="text-[11px] opacity-75">
                          {lang === 'ar' ? 'إجابات كتابية ومقالية' : 'Written answers & explanations'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 3. مستوى الصعوبة: سهل او متوسط او صعب او يمكن للمستخدم لا يختار المستوى */}
                  <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Brain className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{lang === 'ar' ? 'مستوى الصعوبة (اختياري):' : 'Difficulty Level (Optional):'}</span>
                      </label>
                      <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {lang === 'ar' ? 'يمكنك عدم تحديد المستوى' : 'Can be left unselected'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuestionDifficultyLevel('easy')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          questionDifficultyLevel === 'easy'
                            ? isDark
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/30 font-bold'
                              : 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/30 font-bold'
                            : isDark
                            ? 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block text-xs font-bold">🟢 {lang === 'ar' ? 'سهل' : 'Easy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuestionDifficultyLevel('medium')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          questionDifficultyLevel === 'medium'
                            ? isDark
                              ? 'bg-yellow-500/25 border-yellow-400 text-yellow-200 ring-2 ring-yellow-400/30 font-bold'
                              : 'bg-yellow-100 border-yellow-500 text-yellow-950 ring-2 ring-yellow-400/30 font-bold'
                            : isDark
                            ? 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block text-xs font-bold">🟡 {lang === 'ar' ? 'متوسط' : 'Medium'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuestionDifficultyLevel('hard')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          questionDifficultyLevel === 'hard'
                            ? isDark
                              ? 'bg-rose-500/25 border-rose-400 text-rose-200 ring-2 ring-rose-400/30 font-bold'
                              : 'bg-rose-100 border-rose-500 text-rose-950 ring-2 ring-rose-400/30 font-bold'
                            : isDark
                            ? 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block text-xs font-bold">🔴 {lang === 'ar' ? 'صعب' : 'Hard'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuestionDifficultyLevel('unspecified')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          questionDifficultyLevel === 'unspecified'
                            ? isDark
                              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30 font-bold'
                              : 'bg-sky-100 border-sky-500 text-sky-950 ring-2 ring-sky-400/30 font-bold'
                            : isDark
                            ? 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block text-xs font-bold">⚪ {lang === 'ar' ? 'بدون تحديد' : 'None / Auto'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. تنبيه إذا تجاوز عدد الأسئلة 50 سؤالاً */}
                  {parsedQ > 50 && (
                    <div
                      className={`p-3.5 rounded-2xl border flex flex-col gap-1.5 transition-all animate-fadeIn ${
                        isDark
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 shadow-sm'
                          : 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-amber-400 shrink-0" />
                        <strong className="text-xs sm:text-sm font-bold">
                          {lang === 'ar' ? 'ملاحظة (أكثر من 50 سؤالاً):' : 'Note (> 50 Questions):'}
                        </strong>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">
                        {lang === 'ar'
                          ? `لأن عدد الأسئلة أكثر من 50، سيتم تقسيمها تلقائياً إلى فترات مريحة (كل فترة بحد أقصى 50 سؤال) مع استراحة بينها لراحتك واستعادة نشاطك.`
                          : `Because there are over 50 questions, they will be split into balanced sessions (≤ 50 Qs each) with a break in between so you stay fresh and focused.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {contentType === 'study' && (
              <div
                className={`md:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-2.5 transition-all animate-fadeIn ${
                  isDark
                    ? 'bg-indigo-950/20 border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    : 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'ar' ? 'المدة المخصصة للمذاكرة والشرح (بالدقائق):' : 'Study & Understanding Duration (Minutes):'}</span>
                  </span>
                  {targetDurationMinutesStr && parseInt(targetDurationMinutesStr, 10) > 0 && (
                    <span className="text-xs font-mono-num font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                      {targetDurationMinutesStr} {lang === 'ar' ? 'دقيقة' : 'mins'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={targetDurationMinutesStr}
                    onChange={(e) => setTargetDurationMinutesStr(normalizeDigits(e.target.value))}
                    placeholder={lang === 'ar' ? 'اكتب عدد الدقائق (مثال: 60)' : 'Enter minutes (e.g. 60)'}
                    className={`w-full px-4 py-3 rounded-xl font-mono-num font-bold text-sm transition-all focus:outline-none placeholder:font-sans placeholder:text-xs ${
                      isDark
                        ? 'glass-bubble-input-dark text-white focus:border-indigo-400 placeholder:text-slate-500'
                        : 'glass-bubble-input-light text-slate-900 focus:border-indigo-500 placeholder:text-slate-400'
                    }`}
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400/80 pointer-events-none">
                    {lang === 'ar' ? 'دقيقة' : 'mins'}
                  </span>
                </div>
              </div>
            )}

            {contentType === 'revision' && (
              <div
                className={`md:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-2.5 transition-all animate-fadeIn ${
                  isDark
                    ? 'bg-amber-950/20 border-amber-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    : 'bg-amber-50/70 border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'ar' ? 'المدة المخصصة للمراجعة والتثبيت (بالدقائق):' : 'Active Revision Duration (Minutes):'}</span>
                  </span>
                  {targetDurationMinutesStr && parseInt(targetDurationMinutesStr, 10) > 0 && (
                    <span className="text-xs font-mono-num font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                      {targetDurationMinutesStr} {lang === 'ar' ? 'دقيقة' : 'mins'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={targetDurationMinutesStr}
                    onChange={(e) => setTargetDurationMinutesStr(normalizeDigits(e.target.value))}
                    placeholder={lang === 'ar' ? 'اكتب عدد الدقائق (مثال: 45)' : 'Enter minutes (e.g. 45)'}
                    className={`w-full px-4 py-3 rounded-xl font-mono-num font-bold text-sm transition-all focus:outline-none placeholder:font-sans placeholder:text-xs ${
                      isDark
                        ? 'glass-bubble-input-dark text-white focus:border-amber-400 placeholder:text-slate-500'
                        : 'glass-bubble-input-light text-slate-900 focus:border-amber-500 placeholder:text-slate-400'
                    }`}
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400/80 pointer-events-none">
                    {lang === 'ar' ? 'دقيقة' : 'mins'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={`mt-5 flex items-center justify-end gap-3 pt-3 border-t ${
            isDark ? 'border-slate-700/20' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.tasksCancelBtn}
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 font-bold text-xs sm:text-sm rounded-full transition-all cursor-pointer ${
                isDark
                  ? 'glass-bubble-btn bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 border border-white/40'
                  : 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md hover:from-sky-700 hover:to-cyan-700 active:scale-95'
              }`}
            >
              {t.tasksSaveBtn}
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="mt-6 space-y-3">
        {tasks.length === 0 ? (
          <div
            className={`p-8 rounded-3xl border text-center transition-all ${
              isDark
                ? 'bg-slate-900/30 border-dashed border-white/10 text-slate-400'
                : 'bg-slate-50/80 border-dashed border-slate-300 text-slate-600'
            }`}
          >
            <BookOpen className="w-10 h-10 mx-auto text-cyan-400/70 mb-2" />
            <h4 className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t.tasksEmptyState}</h4>
            <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.tasksEmptyHint}
            </p>
          </div>
        ) : (
          tasks.map((task, index) => {
            const prioMeta = PRIORITY_OPTIONS.find((p) => p.id === task.priority) || PRIORITY_OPTIONS[1];
            return (
              <div
                key={task.id}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                  isDark
                    ? 'glass-bubble-card-dark'
                    : 'glass-bubble-card-light'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveTask(index, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-cyan-500 disabled:opacity-20 cursor-pointer transition-colors"
                      title={lang === 'ar' ? 'تحريك لأعلى' : 'Move up'}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === tasks.length - 1}
                      onClick={() => moveTask(index, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-cyan-500 disabled:opacity-20 cursor-pointer transition-colors"
                      title={lang === 'ar' ? 'تحريك لأسفل' : 'Move down'}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center font-bold font-mono-num text-xs shrink-0 transition-colors ${
                    isDark
                      ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-sky-100 border-sky-300 text-sky-800 shadow-2xs'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className={`text-sm font-bold tracking-tight truncate max-w-[200px] sm:max-w-xs ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {task.name}
                      </strong>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shrink-0 ${prioMeta.colorClass}`}>
                        {prioMeta.label}
                      </span>
                    </div>
                    {task.topic && (
                      <p className={`text-xs mt-0.5 truncate max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {task.topic}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <div className={`text-xs font-mono-num font-semibold px-3.5 py-1.5 rounded-xl border transition-all ${
                    isDark
                      ? 'text-cyan-300 bg-cyan-950/50 border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      : 'text-sky-800 bg-sky-50 border-sky-200 shadow-2xs font-bold'
                  }`}>
                    {task.contentType === 'video'
                      ? `🎬 ${task.videoDurationFormatted || `${task.videoDurationMinutes}m`}`
                      : task.contentType === 'practice' && task.questionsCount
                      ? `❓ ${task.questionsCount} ${lang === 'ar' ? 'سؤال' : 'Q'} · ${
                          task.questionFormat === 'essay'
                            ? lang === 'ar'
                              ? 'مقالي'
                              : 'Essay'
                            : lang === 'ar'
                            ? 'اختياري MCQ'
                            : 'MCQ'
                        }${
                          task.questionDifficultyLevel && task.questionDifficultyLevel !== 'unspecified'
                            ? ` (${
                                task.questionDifficultyLevel === 'easy'
                                  ? lang === 'ar'
                                    ? 'سهل'
                                    : 'Easy'
                                  : task.questionDifficultyLevel === 'medium'
                                  ? lang === 'ar'
                                    ? 'متوسط'
                                    : 'Medium'
                                  : lang === 'ar'
                                  ? 'صعب'
                                  : 'Hard'
                              })`
                            : ''
                        }${
                          task.questionsCount > 50
                            ? lang === 'ar'
                              ? ' 🧠 (مقسمة مع استراحة)'
                              : ' 🧠 (Split with breaks)'
                            : ''
                        }`
                      : `⏱️ ${task.targetDurationMinutes || 60} ${lang === 'ar' ? 'دقيقة' : 'm'}`}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(task)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10' : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
                      }`}
                      title={lang === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {confirmDeleteId === task.id ? (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTask(task.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-sm transition-all"
                        >
                          {lang === 'ar' ? 'تأكيد الحذف' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className={`px-2 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                            isDark
                              ? 'text-slate-400 hover:text-white border-slate-700 hover:bg-slate-800'
                              : 'text-slate-600 hover:text-slate-900 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(task.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={lang === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
