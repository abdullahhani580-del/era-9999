/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowDown, AlertCircle } from 'lucide-react';
import { SubjectTask, ScheduleResult, ScheduleSlot } from './types/schedule';
import { generateQuantumSchedule, sanitizeScheduleResult } from './utils/scheduler';
import { calculateWindowMinutes } from './utils/timeUtils';
import { Header } from './components/Header';
import { FuturisticBackground } from './components/FuturisticBackground';
import { HeroSection } from './components/HeroSection';
import { TaskManifestCard } from './components/TaskManifestCard';
import { ScheduleResultCard } from './components/ScheduleResultCard';
import { PosterModal } from './components/PosterModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { DeveloperDashboardModal } from './components/DeveloperDashboardModal';
import { AuthWelcomeModal } from './components/AuthWelcomeModal';
import { NotificationsModal, NotificationItem } from './components/NotificationsModal';
import { FocusCompanionModal } from './components/FocusCompanionModal';
import { EgyptianMotivationModal } from './components/EgyptianMotivationModal';
import { BreakArcadeModal } from './components/BreakArcadeModal';
import { AppAnnouncement, subscribeToAnnouncements } from './services/announcementsService';
import { SupportTicket, subscribeToUserTickets } from './services/supportService';
import { UserProfile, DEFAULT_USER_PROFILE, getPlayerAvatar } from './types/userProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

const STORAGE_KEYS = {
  THEME: 'era9999_theme_mode',
  START_TIME: 'era9999_start_time',
  END_TIME: 'era9999_end_time',
  TASKS: 'era9999_task_manifest',
  SCHEDULE: 'era9999_current_schedule',
  PROFILE: 'era9999_user_profile',
  READ_NOTIFICATIONS: 'era9999_read_notifications',
};

const getStored = (key: string) => {
  return localStorage.getItem(key);
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

function MainApp() {
  const { lang, t, dir } = useLanguage();
  const { user, loading, cloudData, syncDataToCloud } = useAuth();

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = getStored(STORAGE_KEYS.THEME);
    return saved !== null ? saved === 'dark' : true;
  });

  // Welcome Auth Modal state (shown directly when user opens app if not signed in)
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    return !sessionStorage.getItem('era9999_welcome_choice_made');
  });

  const handleCloseWelcomeModal = () => {
    sessionStorage.setItem('era9999_welcome_choice_made', 'true');
    setIsWelcomeModalOpen(false);
  };

  // User Profile state (football avatars, singers, scientists, philosophers)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = getStored(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const player = getPlayerAvatar(parsed.avatarId);
        return {
          name: parsed.name || 'الكابتن',
          avatarId: player.id,
          avatarUrl: player.imageUrl,
          playerTitle: player.tag,
          quote: player.quote,
        };
      } catch (e) {
        console.error('Error parsing stored user profile:', e);
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isFocusCompanionOpen, setIsFocusCompanionOpen] = useState(false);
  const [isFocusMinimized, setIsFocusMinimized] = useState(false);
  const [activeFocusSlotId, setActiveFocusSlotId] = useState<string | undefined>(undefined);
  const [isEgyptianMotivationOpen, setIsEgyptianMotivationOpen] = useState(false);
  const [completedSlotForMotivation, setCompletedSlotForMotivation] = useState<ScheduleSlot | null>(null);
  const [isArcadeModalOpen, setIsArcadeModalOpen] = useState(false);

  // Fullscreen state for study schedule table with exact scroll position preservation
  const [isScheduleFullscreen, setIsScheduleFullscreen] = useState(false);
  const preFullscreenScrollPosRef = useRef<number>(0);

  const handleToggleScheduleFullscreen = () => {
    if (!isScheduleFullscreen) {
      // Record exact scroll position before maximizing
      preFullscreenScrollPosRef.current = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScheduleFullscreen(true);
      document.body.style.overflow = 'hidden';
    } else {
      // Exit fullscreen and restore exact scroll position
      setIsScheduleFullscreen(false);
      document.body.style.overflow = '';
      const targetScroll = preFullscreenScrollPosRef.current;

      requestAnimationFrame(() => {
        window.scrollTo({
          top: targetScroll,
          behavior: 'instant',
        });
        setTimeout(() => {
          window.scrollTo({
            top: targetScroll,
            behavior: 'instant',
          });
        }, 50);
      });
    }
  };

  // Notifications & Announcements data
  const [announcements, setAnnouncements] = useState<AppAnnouncement[]>([]);
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = getStored(STORAGE_KEYS.READ_NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Time window state
  const [startTime, setStartTime] = useState<string>(() => {
    return getStored(STORAGE_KEYS.START_TIME) || '18:00';
  });
  const [endTime, setEndTime] = useState<string>(() => {
    return getStored(STORAGE_KEYS.END_TIME) || '00:00';
  });

  // Tasks state
  const [tasks, setTasks] = useState<SubjectTask[]>(() => {
    const saved = getStored(STORAGE_KEYS.TASKS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const userCustomTasks = Array.isArray(parsed)
          ? parsed.filter(
              (t: SubjectTask) =>
                !t.id.startsWith('sample-') &&
                !['Anatomy', 'Biology', 'Physics', 'Chemistry'].includes(t.name)
            )
          : [];
        return userCustomTasks;
      } catch (e) {
        console.error('Error parsing stored tasks:', e);
      }
    }
    return [];
  });

  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(() => {
    const saved = getStored(STORAGE_KEYS.SCHEDULE);
    if (saved) {
      try {
        return sanitizeScheduleResult(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing stored schedule:', e);
      }
    }
    return null;
  });

  const [isPosterModalOpen, setIsPosterModalOpen] = useState<boolean>(false);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track timestamp of local task modifications to prevent stale cloud overwrite race conditions
  const lastLocalTasksUpdateRef = useRef<number>(0);

  // Synchronize Cloud Data to Local State when user is signed in across devices
  useEffect(() => {
    if (!cloudData) return;

    // Guard against overwriting local edits that occurred within the last 6 seconds
    const timeSinceLastLocalEdit = Date.now() - lastLocalTasksUpdateRef.current;
    if (timeSinceLastLocalEdit >= 6000) {
      if (cloudData.tasks && Array.isArray(cloudData.tasks)) {
        // If cloud document has 0 tasks but local device already has tasks, preserve local tasks and push to cloud!
        if (cloudData.tasks.length === 0 && tasks.length > 0) {
          if (user) {
            syncDataToCloud({ tasks });
          }
        } else {
          setTasks(cloudData.tasks);
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(cloudData.tasks));
        }
      }
    }

    if (cloudData.startTime) {
      setStartTime(cloudData.startTime);
      localStorage.setItem(STORAGE_KEYS.START_TIME, cloudData.startTime);
    }

    if (cloudData.endTime) {
      setEndTime(cloudData.endTime);
      localStorage.setItem(STORAGE_KEYS.END_TIME, cloudData.endTime);
    }

    if (cloudData.scheduleResult !== undefined) {
      const sanitized = sanitizeScheduleResult(cloudData.scheduleResult);
      setScheduleResult(sanitized);
      if (sanitized) {
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(sanitized));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
      }
    }

    if (cloudData.profile) {
      const player = getPlayerAvatar(cloudData.profile.avatarId);
      const resolved: UserProfile = {
        name: cloudData.profile.name || (lang === 'ar' ? 'الكابتن' : 'Captain'),
        avatarId: player.id,
        avatarUrl: player.imageUrl,
        playerTitle: player.tag,
        quote: player.quote,
      };
      setUserProfile(resolved);
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(resolved));
    }
  }, [cloudData, lang]);

  // First time signed in: If cloud document has no tasks yet but local device has tasks, push to cloud
  useEffect(() => {
    if (user && cloudData === null && tasks.length > 0) {
      syncDataToCloud({
        profile: userProfile,
        startTime,
        endTime,
        tasks,
        scheduleResult,
      });
    }
  }, [user, cloudData]);

  // Sync theme to localStorage & document class
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Real-time listener for App Announcements & Broadcast Updates
  useEffect(() => {
    const unsubAnn = subscribeToAnnouncements((data) => {
      setAnnouncements(data);
    });
    return () => unsubAnn();
  }, []);

  // Real-time listener for developer replies to current user's tickets
  useEffect(() => {
    if (!user?.uid) {
      setMyTickets([]);
      return;
    }
    const unsubTickets = subscribeToUserTickets(user.uid, (data) => {
      setMyTickets(data);
    });
    return () => unsubTickets();
  }, [user?.uid]);

  // Derived unified notifications list (replies + app announcements)
  const notifications: NotificationItem[] = [
    // 1. Developer Replies to User's Tickets
    ...myTickets
      .filter((t) => !!t.adminReply)
      .map((t) => ({
        id: `reply_${t.id}`,
        type: 'ticket_reply' as const,
        title:
          lang === 'ar'
            ? `رد جديد من المطور على: ${t.subject || 'رسالتك'}`
            : `Developer reply to: ${t.subject || 'Your message'}`,
        body: t.adminReply || '',
        date: t.repliedAt || t.createdAt,
        isRead: readNotificationIds.includes(`reply_${t.id}`),
        linkAction: 'support' as const,
      })),
    // 2. Broadcast App Announcements & System Updates
    ...announcements.map((a) => ({
      id: `ann_${a.id}`,
      type: 'announcement' as const,
      title: a.title,
      body: a.content,
      version: a.version,
      date: a.createdAt,
      isRead: readNotificationIds.includes(`ann_${a.id}`),
      linkAction: 'none' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllNotificationsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    localStorage.setItem(STORAGE_KEYS.READ_NOTIFICATIONS, JSON.stringify(allIds));
  };

  const handleSelectNotification = (item: NotificationItem) => {
    if (!readNotificationIds.includes(item.id)) {
      const updated = [...readNotificationIds, item.id];
      setReadNotificationIds(updated);
      localStorage.setItem(STORAGE_KEYS.READ_NOTIFICATIONS, JSON.stringify(updated));
    }
  };

  // Save time window changes locally and to cloud
  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    localStorage.setItem(STORAGE_KEYS.START_TIME, newStartTime);
    if (user) {
      syncDataToCloud({ startTime: newStartTime });
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    localStorage.setItem(STORAGE_KEYS.END_TIME, newEndTime);
    if (user) {
      syncDataToCloud({ endTime: newEndTime });
    }
  };

  // Add Task
  const handleAddTask = (newTaskData: Omit<SubjectTask, 'id' | 'createdAt'>) => {
    lastLocalTasksUpdateRef.current = Date.now();
    const newTask: SubjectTask = {
      ...newTaskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    setValidationError(null);
    if (user) {
      syncDataToCloud({ tasks: updated });
    }
  };

  // Update Task
  const handleUpdateTask = (id: string, updatedFields: Partial<SubjectTask>) => {
    lastLocalTasksUpdateRef.current = Date.now();
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTasks(updated);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    if (user) {
      syncDataToCloud({ tasks: updated });
    }
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    lastLocalTasksUpdateRef.current = Date.now();
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));

    if (updated.length === 0 && scheduleResult) {
      setScheduleResult(null);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
      if (user) {
        syncDataToCloud({ tasks: [], scheduleResult: null });
      }
    } else if (user) {
      syncDataToCloud({ tasks: updated });
    }
  };

  // Reorder Tasks
  const handleReorderTasks = (reordered: SubjectTask[]) => {
    lastLocalTasksUpdateRef.current = Date.now();
    setTasks(reordered);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(reordered));
    if (user) {
      syncDataToCloud({ tasks: reordered });
    }
  };

  // Generate Quantum Schedule
  const handleGenerate = () => {
    setValidationError(null);

    // 1. Check if user has added any subject tasks
    if (tasks.length === 0) {
      setValidationError(t.emptyTasksWarning);
      const el = document.getElementById('task-manifest');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 2. Check time window
    const totalMinutes = calculateWindowMinutes(startTime, endTime);
    if (totalMinutes < 30) {
      setValidationError(t.shortWindowWarning);
      const el = document.getElementById('time-window');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsComputing(true);

    setTimeout(() => {
      try {
        const result = generateQuantumSchedule(startTime, endTime, tasks);
        setScheduleResult(result);
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(result));

        if (user) {
          syncDataToCloud({
            scheduleResult: result,
            startTime,
            endTime,
            tasks,
          });
        }

        // Micro celebration
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#06b6d4', '#8b5cf6', '#10b981', '#38bdf8'],
          });
        } catch {
          // Safe fallback
        }

        // Smooth scroll to study plan
        setTimeout(() => {
          const el = document.getElementById('schedule-matrix');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } catch (err) {
        console.error('Error generating quantum schedule:', err);
        setValidationError(lang === 'ar' ? 'حدث خطأ غير متوقع أثناء احتساب الجدول.' : 'Unexpected calculation error.');
      } finally {
        setIsComputing(false);
      }
    }, 250);
  };

  // Toggle completion of a slot
  const handleToggleSlotComplete = (slotId: string) => {
    if (!scheduleResult) return;
    const updatedSlots = scheduleResult.slots.map((s) =>
      s.id === slotId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const updatedResult = {
      ...scheduleResult,
      slots: updatedSlots,
    };
    setScheduleResult(updatedResult);
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(updatedResult));
    if (user) {
      syncDataToCloud({ scheduleResult: updatedResult });
    }
  };

  const handleExtendTimeWindow = (newEndTime24h: string) => {
    setEndTime(newEndTime24h);
    localStorage.setItem(STORAGE_KEYS.END_TIME, newEndTime24h);
    const newResult = generateQuantumSchedule(startTime, newEndTime24h, tasks);
    setScheduleResult(newResult);
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(newResult));
    if (user) {
      syncDataToCloud({ endTime: newEndTime24h, scheduleResult: newResult });
    }
  };

  // Reset all
  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    setTasks([]);
    setScheduleResult(null);
    setStartTime('18:00');
    setEndTime('00:00');
    setValidationError(null);
    if (user) {
      syncDataToCloud({
        tasks: [],
        scheduleResult: null,
        startTime: '18:00',
        endTime: '00:00',
      });
    }
  };

  // Save and persist user profile
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    const player = getPlayerAvatar(updatedProfile.avatarId);
    const resolved: UserProfile = {
      name: updatedProfile.name.trim() || (lang === 'ar' ? 'الكابتن' : 'Captain'),
      avatarId: player.id,
      avatarUrl: player.imageUrl,
      playerTitle: player.tag,
      quote: player.quote,
    };
    setUserProfile(resolved);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(resolved));
    if (user) {
      syncDataToCloud({ profile: resolved });
    }
  };

  // Manual Cloud Sync action
  const handleManualSync = () => {
    if (user) {
      syncDataToCloud({
        profile: userProfile,
        startTime,
        endTime,
        tasks,
        scheduleResult,
      });
    }
  };

  // Keyboard listener for Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocusCompanionOpen(false);
        setIsProfileModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsDeveloperModalOpen(false);
        setIsNotificationsModalOpen(false);
        setIsPosterModalOpen(false);
        setIsEgyptianMotivationOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`min-h-screen relative font-sans transition-colors duration-300 ${
        isDark ? 'bg-[#04060b] text-slate-100' : 'bg-[#f5f7fb] text-slate-800'
      }`}
      dir={dir}
    >
      {/* Dynamic Cyber Grid Background */}
      <FuturisticBackground isDark={isDark} />

      {/* Header with Clean Action Bar & Settings in One Place */}
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        userProfile={userProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Main Container */}
      <main className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-10 ${isScheduleFullscreen ? '' : 'relative z-10'}`}>
        {/* Hero Section */}
        <HeroSection
          isDark={isDark}
          userProfile={userProfile}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Global Validation Warning Banner */}
        {validationError && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-lg transition-all animate-shake ${
              isDark
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="text-sm font-semibold">{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-xs font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Part 1: Unified Study Time & Tasks Manifest */}
        <TaskManifestCard
          isDark={isDark}
          tasks={tasks}
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onReorderTasks={handleReorderTasks}
        />

        {/* Big Prominent Generate Button */}
        <div className="py-4 text-center space-y-4">
          {validationError && (
            <div
              className={`max-w-xl mx-auto p-4 rounded-2xl border text-start shadow-xl transition-all animate-shake ${
                isDark
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm">
                  <strong className="block font-bold text-sm mb-1 text-rose-300">
                    {lang === 'ar' ? 'تنبيه: لا يمكن إنشاء الجدول الآن' : 'Notice: Cannot generate schedule yet'}
                  </strong>
                  <p className="leading-relaxed opacity-90">{validationError}</p>

                  {tasks.length === 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-rose-500/20">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('task-manifest');
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 cursor-pointer"
                      >
                        {t.goToTasksBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddTask({
                            name: lang === 'ar' ? 'انجليزي' : 'English',
                            topic: lang === 'ar' ? 'قواعد ومفردات Unit 1' : 'Grammar & Vocab Unit 1',
                            priority: 'high',
                            contentType: 'video',
                            videoDurationFormatted: '03:00:00',
                            videoDurationMinutes: 180,
                          });
                          setValidationError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 cursor-pointer"
                      >
                        {t.trySampleBtn}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={isComputing}
            onClick={handleGenerate}
            className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black font-cyber text-base sm:text-lg flex items-center justify-center gap-3 mx-auto transition-all cursor-pointer select-none ${
              isDark
                ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-slate-950 shadow-[0_0_40px_rgba(6,182,212,0.45)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:brightness-110 active:scale-95'
                : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-xl shadow-sky-600/20 hover:from-sky-700 hover:to-indigo-700 active:scale-95'
            }`}
          >
            <Sparkles className="w-5 h-5 text-current animate-pulse" />
            <span>
              {isComputing ? t.generateComputingText : t.generateBtnText}
            </span>
            <ArrowDown className="w-5 h-5 text-current" />
          </button>
          <p className={`text-xs mt-3 ${isDark ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
            {t.generateFootnote}
          </p>
        </div>

        {/* Part 2: Schedule Result Matrix with Full-Screen capability */}
        {scheduleResult && (
          <ScheduleResultCard
            isDark={isDark}
            result={scheduleResult}
            onOpenPosterModal={() => setIsPosterModalOpen(true)}
            onRegenerate={handleGenerate}
            onToggleSlotComplete={handleToggleSlotComplete}
            onExtendTimeWindow={handleExtendTimeWindow}
            isFullscreen={isScheduleFullscreen}
            onToggleFullscreen={handleToggleScheduleFullscreen}
            onStartFocusSession={(slotId) => {
              setActiveFocusSlotId(slotId);
              setIsFocusCompanionOpen(true);
              setIsFocusMinimized(false);
            }}
          />
        )}
      </main>

      {/* Live Focus Session Companion Modal / Floating Dock with Full-Screen Mode */}
      {scheduleResult && scheduleResult.slots.length > 0 && (
        <FocusCompanionModal
          isOpen={isFocusCompanionOpen}
          isMinimized={isFocusMinimized}
          onClose={() => {
            setIsFocusCompanionOpen(false);
            setIsFocusMinimized(false);
          }}
          onToggleMinimize={() => setIsFocusMinimized(!isFocusMinimized)}
          isDark={isDark}
          slots={scheduleResult.slots}
          activeSlotId={activeFocusSlotId}
          onSlotCompleted={handleToggleSlotComplete}
          onOpenArcadeModal={() => setIsArcadeModalOpen(true)}
          onSessionFinished={(completedSlot) => {
            setCompletedSlotForMotivation(completedSlot);
            setIsEgyptianMotivationOpen(true);
          }}
        />
      )}

      {/* Egyptian Motivational & Encouragement Celebration Modal */}
      {(() => {
        const completedSlotIndex =
          scheduleResult && completedSlotForMotivation
            ? scheduleResult.slots.findIndex((s) => s.id === completedSlotForMotivation.id)
            : -1;
        const nextSlotForMotivation =
          completedSlotIndex !== -1 && scheduleResult && completedSlotIndex < scheduleResult.slots.length - 1
            ? scheduleResult.slots[completedSlotIndex + 1]
            : null;
        const isAllFinishedForMotivation = Boolean(
          scheduleResult &&
            completedSlotForMotivation &&
            (!nextSlotForMotivation ||
              scheduleResult.slots
                .filter((s) => s.type === 'study')
                .every((s) => s.id === completedSlotForMotivation.id || s.isCompleted))
        );

        return (
          <EgyptianMotivationModal
            isOpen={isEgyptianMotivationOpen}
            onClose={() => setIsEgyptianMotivationOpen(false)}
            isDark={isDark}
            completedSlot={completedSlotForMotivation}
            nextSlot={nextSlotForMotivation}
            isAllFinished={isAllFinishedForMotivation}
            hasNextSession={Boolean(nextSlotForMotivation)}
            onStartNextSession={() => {
              if (nextSlotForMotivation) {
                setActiveFocusSlotId(nextSlotForMotivation.id);
                setIsFocusCompanionOpen(true);
                setIsFocusMinimized(false);
              }
            }}
          />
        );
      })()}

      {/* High-Resolution Poster Modal */}
      {scheduleResult && (
        <PosterModal
          isOpen={isPosterModalOpen}
          onClose={() => setIsPosterModalOpen(false)}
          result={scheduleResult}
          isDark={isDark}
          userProfile={userProfile}
        />
      )}

      {/* User Profile & Legends Avatar Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isDark={isDark}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* System Settings Modal (Google, Language, Theme, Reset, Developer) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onResetAll={handleResetAll}
        onManualSync={handleManualSync}
        onOpenDeveloperDashboard={() => setIsDeveloperModalOpen(true)}
      />

      {/* Developer Admin Dashboard Modal */}
      <DeveloperDashboardModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
        isDark={isDark}
        developerEmail={user?.email}
      />

      {/* Separate Notifications & Announcements Center Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        isDark={isDark}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* Direct Welcome Modal on App Launch (Google Sign In or Continue as Guest) */}
      {!loading && !user && isWelcomeModalOpen && (
        <AuthWelcomeModal
          isOpen={isWelcomeModalOpen}
          onClose={handleCloseWelcomeModal}
          isDark={isDark}
        />
      )}

      {/* Break Time Arcade Games Modal (Space Shooter & Snake Classic) */}
      <BreakArcadeModal
        isOpen={isArcadeModalOpen}
        onClose={() => setIsArcadeModalOpen(false)}
        isDark={isDark}
      />

      </div>
  );
}
