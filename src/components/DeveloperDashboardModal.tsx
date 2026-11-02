import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Calendar,
  Layers,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  Radio,
  Mail,
  Trash2,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  LifeBuoy,
  Check,
  Send,
  Megaphone,
  Bell,
} from 'lucide-react';
import { subscribeToAllUsersList, fetchAllUsersList } from '../services/adminService';
import { SyncedUserData } from '../services/userSyncService';
import { useLanguage } from '../context/LanguageContext';
import {
  AppAnnouncement,
  createAnnouncement,
  subscribeToAnnouncements,
  deleteAnnouncement,
} from '../services/announcementsService';
import {
  SupportTicket,
  subscribeToSupportTickets,
  deleteSupportTicket,
  replyToSupportTicket,
} from '../services/supportService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  developerEmail?: string | null;
}

// Check if user is currently online (heartbeat received within last 40 seconds and isOnline !== false)
export function isUserCurrentlyOnline(user: SyncedUserData): boolean {
  if (user.isOnline === false) return false;
  const lastTime = user.lastActiveAt || (user.updatedAt ? new Date(user.updatedAt).getTime() : 0);
  if (!lastTime) return false;
  return Date.now() - lastTime < 40 * 1000;
}

function formatRelativeTime(timestamp?: number | string, lang: 'ar' | 'en' = 'ar'): string {
  if (!timestamp) return lang === 'ar' ? 'غير محدد' : 'Unknown';
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diffSec = Math.floor((Date.now() - time) / 1000);

  if (diffSec < 60) return lang === 'ar' ? 'الآن' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return lang === 'ar' ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
}

export const DeveloperDashboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const { lang, dir } = useLanguage();
  const [users, setUsers] = useState<SyncedUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState<number>(0);

  // Support Tickets & Announcements State
  const [dashboardTab, setDashboardTab] = useState<'users' | 'tickets' | 'announcements'>('users');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(true);
  const [ticketFilter, setTicketFilter] = useState<'all' | 'inquiry' | 'suggestion' | 'issue'>('all');
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  // App Announcements State
  const [announcements, setAnnouncements] = useState<AppAnnouncement[]>([]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnVersion, setNewAnnVersion] = useState('v2.6');
  const [isPostingAnn, setIsPostingAnn] = useState(false);
  const [annSuccessMsg, setAnnSuccessMsg] = useState(false);
  const [deletingAnnId, setDeletingAnnId] = useState<string | null>(null);

  // In-App Reply & Email Copy States
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  const handleSendInAppReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const ok = await replyToSupportTicket(ticketId, replyText);
      if (ok) {
        setReplyingTicketId(null);
        setReplyText('');
      }
    } finally {
      setIsSendingReply(false);
    }
  };

  // 3-second live ticker to recompute presence in real time
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Real-time live listener for all users & support tickets
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setTicketsLoading(true);
    setError(null);

    const unsubscribeUsers = subscribeToAllUsersList(
      (data) => {
        setUsers(data);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to subscribe to users:', err);
        setError(
          lang === 'ar'
            ? 'تعذر الاتصال بقاعدة بيانات المستخدمين. تأكد من أنك مسجل بحساب المطور المعتمد.'
            : 'Failed to connect to users database. Ensure you are signed in with the authorized developer account.'
        );
        setLoading(false);
      }
    );

    const unsubscribeTickets = subscribeToSupportTickets(
      (data) => {
        setTickets(data);
        setTicketsLoading(false);
      },
      (err) => {
        console.error('Failed to subscribe to support tickets:', err);
        setTicketsLoading(false);
      }
    );

    const unsubscribeAnnouncements = subscribeToAnnouncements(
      (data) => {
        setAnnouncements(data);
      },
      (err) => {
        console.error('Failed to subscribe to announcements:', err);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeTickets();
      unsubscribeAnnouncements();
    };
  }, [isOpen, lang]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    setIsPostingAnn(true);
    setAnnSuccessMsg(false);
    try {
      const ok = await createAnnouncement({
        title: newAnnTitle.trim(),
        content: newAnnContent.trim(),
        version: newAnnVersion.trim() || 'v2.6',
      });
      if (ok) {
        setNewAnnTitle('');
        setNewAnnContent('');
        setAnnSuccessMsg(true);
        setTimeout(() => setAnnSuccessMsg(false), 4000);
      }
    } finally {
      setIsPostingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setDeletingAnnId(id);
    try {
      await deleteAnnouncement(id);
    } finally {
      setDeletingAnnId(null);
    }
  };

  const handleDeleteTicket = async (ticketId?: string) => {
    if (!ticketId) return;
    setDeletingTicketId(ticketId);
    try {
      await deleteSupportTicket(ticketId);
    } finally {
      setDeletingTicketId(null);
    }
  };

  if (!isOpen) return null;

  const onlineUsers = users.filter((u) => isUserCurrentlyOnline(u));
  const offlineUsers = users.filter((u) => !isUserCurrentlyOnline(u));

  const filteredUsers = users.filter((u) => {
    if (activeFilter === 'online' && !isUserCurrentlyOnline(u)) return false;
    if (activeFilter === 'offline' && isUserCurrentlyOnline(u)) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.profile?.name?.toLowerCase().includes(q)
    );
  });

  const totalTasks = users.reduce((acc, u) => acc + (u.tasks?.length || 0), 0);
  const totalSchedules = users.filter((u) => u.scheduleResult != null).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-all animate-fadeIn"
      dir={dir}
    >
      <div
        className={`w-full max-w-4xl max-h-[92vh] sm:rounded-[32px] rounded-t-[32px] border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-[#0f172a]/95 border-white/15 text-white shadow-black/90'
            : 'bg-[#f2f2f7]/95 border-slate-300/80 text-slate-900 shadow-2xl'
        } backdrop-blur-2xl`}
      >
        {/* iOS Top Sheet Grabber Handle */}
        <div className="pt-3 pb-1 shrink-0">
          <div className="ios-sheet-handle" />
        </div>

        {/* Apple iOS Navigation Bar Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-3 border-b shrink-0 ${
            isDark ? 'border-white/10 bg-slate-900/40' : 'border-slate-200/80 bg-white/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="ios-squircle-icon ios-bg-amber">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  {lang === 'ar' ? 'لوحة المطور' : 'Developer Admin Dashboard'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{lang === 'ar' ? 'مباشر' : 'LIVE'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'متابعة المستخدمين والرسائل في التطبيق'
                  : 'Live user presence and support telemetry'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300'
            }`}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* iOS Segmented Navigation Control */}
          <div className="p-1 rounded-2xl bg-black/25 dark:bg-black/40 border border-white/10 grid grid-cols-3 gap-1">
            {/* Tab 1: Users */}
            <button
              type="button"
              onClick={() => setDashboardTab('users')}
              className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                dashboardTab === 'users'
                  ? 'bg-white text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-[#2997ff]" />
              <span>{lang === 'ar' ? 'المستخدمين' : 'Users'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {users.length}
              </span>
            </button>

            {/* Tab 2: Tickets */}
            <button
              type="button"
              onClick={() => setDashboardTab('tickets')}
              className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                dashboardTab === 'tickets'
                  ? 'bg-white text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4 shrink-0 text-[#ff9500]" />
              <span>{lang === 'ar' ? 'رسائل الدعم' : 'Support'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {tickets.length}
              </span>
            </button>

            {/* Tab 3: Broadcast */}
            <button
              type="button"
              onClick={() => setDashboardTab('announcements')}
              className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                dashboardTab === 'announcements'
                  ? 'bg-white text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0 text-[#af52de]" />
              <span>{lang === 'ar' ? 'نشر تحديث' : 'Updates'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {announcements.length}
              </span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: USERS                                                 */}
          {/* ============================================================ */}
          {dashboardTab === 'users' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Apple iOS Grouped Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Online Users */}
                <div className={isDark ? 'ios-grouped-list-dark p-3.5' : 'ios-grouped-list-light p-3.5'}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{lang === 'ar' ? 'نشط الآن' : 'Online'}</span>
                    </span>
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <strong className="text-2xl font-extrabold text-emerald-400 font-mono block">
                    {onlineUsers.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {lang === 'ar' ? 'يستخدمون التطبيق' : 'Active users'}
                  </span>
                </div>

                {/* 2. Total Registered */}
                <div className={isDark ? 'ios-grouped-list-dark p-3.5' : 'ios-grouped-list-light p-3.5'}>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'المسجلين' : 'Total'}</span>
                    <Users className="w-3.5 h-3.5 text-[#2997ff]" />
                  </div>
                  <strong className="text-2xl font-bold text-[#2997ff] font-mono block">
                    {users.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Google Accounts</span>
                </div>

                {/* 3. Study Tasks */}
                <div className={isDark ? 'ios-grouped-list-dark p-3.5' : 'ios-grouped-list-light p-3.5'}>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'المواد' : 'Tasks'}</span>
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <strong className="text-2xl font-bold text-amber-400 font-mono block">
                    {totalTasks}
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {lang === 'ar' ? 'مهام مذاكرة' : 'Tasks scheduled'}
                  </span>
                </div>

                {/* 4. Active Schedules */}
                <div className={isDark ? 'ios-grouped-list-dark p-3.5' : 'ios-grouped-list-light p-3.5'}>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'الجداول' : 'Plans'}</span>
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <strong className="text-2xl font-bold text-indigo-400 font-mono block">
                    {totalSchedules}
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {lang === 'ar' ? 'جداول نشطة' : 'Generated plans'}
                  </span>
                </div>
              </div>

              {/* iOS Search Bar & Filter Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-[#2997ff] text-white'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'الكل' : 'All'} ({users.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter('online')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeFilter === 'online'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{lang === 'ar' ? 'نشط الآن' : 'Online'}</span>
                    <span>({onlineUsers.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter('offline')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeFilter === 'offline'
                        ? 'bg-slate-700 text-white'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'غير متصل' : 'Offline'} ({offlineUsers.length})
                  </button>
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'ar' ? 'ابحث بالاسم أو البريد...' : 'Search by name or email...'
                    }
                    className="w-full ps-9 pe-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#2997ff]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Users Grouped List (iOS Table View) */}
              {loading ? (
                <div className="py-14 text-center text-slate-400 text-xs flex flex-col items-center gap-2.5">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#2997ff]" />
                  <span>{lang === 'ar' ? 'جاري المزامنة...' : 'Connecting...'}</span>
                </div>
              ) : error ? (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center">
                  {error}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  {lang === 'ar' ? 'لا يوجد مستخدمون مطابقون.' : 'No users found.'}
                </div>
              ) : (
                <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                  {filteredUsers.map((u, idx) => {
                    const isOnline = isUserCurrentlyOnline(u);
                    const lastActiveText = formatRelativeTime(u.lastActiveAt || u.updatedAt, lang);

                    return (
                      <div
                        key={u.userId || idx}
                        className="ios-grouped-row flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.displayName || 'User'}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full object-cover border border-white/20"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#2997ff] text-white font-bold text-sm flex items-center justify-center">
                                {u.displayName?.charAt(0) || u.email?.charAt(0) || 'U'}
                              </div>
                            )}

                            {isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-sm" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-sm font-semibold truncate">
                                {u.displayName || (lang === 'ar' ? 'مستخدم Google' : 'Google User')}
                              </strong>

                              {isOnline ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                                  {lang === 'ar' ? 'نشط الآن' : 'Active'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lastActiveText}</span>
                                </span>
                              )}

                              {u.profile?.name && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-medium">
                                  {u.profile.name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center text-xs font-mono">
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                            {u.tasks?.length || 0} {lang === 'ar' ? 'مهام' : 'tasks'}
                          </span>

                          {u.scheduleResult ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
                              ✓ {lang === 'ar' ? 'جدول جاهز' : 'Scheduled'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-400">
                              {lang === 'ar' ? 'مسودة' : 'Draft'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: SUPPORT TICKETS                                       */}
          {/* ============================================================ */}
          {dashboardTab === 'tickets' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setTicketFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                    ticketFilter === 'all'
                      ? 'bg-[#ff9500] text-white'
                      : 'bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? 'الكل' : 'All'} ({tickets.length})
                </button>

                <button
                  type="button"
                  onClick={() => setTicketFilter('suggestion')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                    ticketFilter === 'suggestion'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'مقترحات' : 'Ideas'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTicketFilter('inquiry')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                    ticketFilter === 'inquiry'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-500/15 text-blue-400'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'استفسارات' : 'Questions'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTicketFilter('issue')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                    ticketFilter === 'issue'
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'مشاكل' : 'Issues'}</span>
                </button>
              </div>

              {/* Tickets List */}
              {ticketsLoading ? (
                <div className="py-14 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#ff9500]" />
                  <span>{lang === 'ar' ? 'جاري التحميل...' : 'Loading tickets...'}</span>
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-xs">
                  {lang === 'ar' ? 'لا توجد رسائل دعم حالياً.' : 'No tickets received yet.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets
                    .filter((t) => ticketFilter === 'all' || t.type === ticketFilter)
                    .map((ticket) => {
                      const isReplyingThis = replyingTicketId === ticket.id;

                      return (
                        <div
                          key={ticket.id}
                          className={`${
                            isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'
                          } p-4 space-y-3 transition-all`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#2997ff]">
                                {ticket.subject}
                              </span>
                              {ticket.adminReply && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                                  {lang === 'ar' ? 'تم الرد' : 'Replied'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {new Date(ticket.createdAt).toLocaleDateString(
                                lang === 'ar' ? 'ar-EG' : 'en-US'
                              )}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {ticket.message}
                          </p>

                          {ticket.adminReply && (
                            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'ردك للمستخدم:' : 'Your reply:'}</span>
                              </div>
                              <p className="whitespace-pre-wrap">{ticket.adminReply}</p>
                            </div>
                          )}

                          {isReplyingThis && (
                            <div className="p-3 rounded-2xl bg-black/40 border border-[#2997ff]/40 space-y-2">
                              <textarea
                                rows={3}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={
                                  lang === 'ar'
                                    ? 'اكتب ردك المباشر للمستخدم هنا...'
                                    : 'Type your reply here...'
                                }
                                className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none resize-none"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyingTicketId(null);
                                    setReplyText('');
                                  }}
                                  className="px-3 py-1 rounded-full text-xs text-slate-400 hover:text-white"
                                >
                                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  disabled={isSendingReply || !replyText.trim()}
                                  onClick={() => handleSendInAppReply(ticket.id!)}
                                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#2997ff] text-white hover:bg-[#0071e3] disabled:opacity-50"
                                >
                                  {isSendingReply ? '...' : lang === 'ar' ? 'إرسال الرد' : 'Send Reply'}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                            <span className="text-slate-400 truncate">
                              {ticket.senderName} ({ticket.senderEmail || 'No Email'})
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isReplyingThis) {
                                    setReplyingTicketId(null);
                                    setReplyText('');
                                  } else {
                                    setReplyingTicketId(ticket.id || null);
                                    setReplyText(ticket.adminReply || '');
                                  }
                                }}
                                className="px-3 py-1 rounded-full text-xs font-bold bg-[#2997ff]/15 text-[#2997ff] hover:bg-[#2997ff]/25"
                              >
                                {ticket.adminReply ? (lang === 'ar' ? 'تعديل الرد' : 'Edit') : (lang === 'ar' ? 'رد 💬' : 'Reply')}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteTicket(ticket.id)}
                                disabled={deletingTicketId === ticket.id}
                                className="p-1 text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: ANNOUNCEMENTS BROADCAST                               */}
          {/* ============================================================ */}
          {dashboardTab === 'announcements' && (
            <div className="space-y-4 animate-fadeIn">
              <form
                onSubmit={handleCreateAnnouncement}
                className={`${
                  isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'
                } p-4 sm:p-5 space-y-3`}
              >
                <div className="flex items-center gap-2 text-[#af52de] font-bold text-sm">
                  <Megaphone className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'نشر إشعار وتحديث للمستخدمين' : 'Broadcast App Update'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      required
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      placeholder={lang === 'ar' ? 'عنوان التحديث...' : 'Update title...'}
                      className="w-full p-2.5 text-xs rounded-xl border border-white/15 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:border-[#af52de]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newAnnVersion}
                      onChange={(e) => setNewAnnVersion(e.target.value)}
                      placeholder="v2.6"
                      className="w-full p-2.5 text-xs font-mono rounded-xl border border-white/15 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:border-[#af52de]"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  required
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  placeholder={lang === 'ar' ? 'تفاصيل التحديث...' : 'Details...'}
                  className="w-full p-2.5 text-xs rounded-xl border border-white/15 bg-white/5 text-white placeholder-slate-400 focus:outline-none resize-none focus:border-[#af52de]"
                />

                {annSuccessMsg && (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تم النشر بنجاح لجميع المستخدمين!' : 'Broadcasted successfully!'}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isPostingAnn || !newAnnTitle.trim() || !newAnnContent.trim()}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#af52de] text-white hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
                >
                  {isPostingAnn ? '...' : lang === 'ar' ? 'نشر التحديث الآن' : 'Publish Broadcast'}
                </button>
              </form>

              {/* Published Announcements */}
              <div className="space-y-2.5">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`${
                      isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'
                    } p-4 flex items-start justify-between gap-3`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#af52de]/20 text-[#af52de]">
                          {ann.version || 'v2.6'}
                        </span>
                        <strong className="text-xs sm:text-sm font-bold truncate">
                          {ann.title}
                        </strong>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      disabled={deletingAnnId === ann.id}
                      className="p-1 text-rose-400 hover:text-rose-300 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark ? 'border-white/10 bg-slate-900/60 text-slate-400' : 'border-slate-200/80 bg-white/70 text-slate-600'
          }`}
        >
          <span>
            {onlineUsers.length} {lang === 'ar' ? 'نشط الآن' : 'online now'} · {users.length} {lang === 'ar' ? 'مستخدم' : 'users'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-full font-bold text-xs bg-[#2997ff] text-white hover:bg-[#0071e3] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {lang === 'ar' ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
