import React from 'react';
import {
  X,
  Bell,
  Sparkles,
  MessageCircle,
  Megaphone,
  CheckCheck,
  Calendar,
  Clock,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AppAnnouncement } from '../services/announcementsService';
import { SupportTicket } from '../services/supportService';

export interface NotificationItem {
  id: string;
  type: 'ticket_reply' | 'announcement';
  title: string;
  body: string;
  date: string;
  version?: string;
  isRead: boolean;
  linkAction?: 'support' | 'none';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
}

export const NotificationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isDark,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  const { lang, dir } = useLanguage();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-all animate-fadeIn"
      dir={dir}
    >
      <div
        className={`w-full max-w-lg max-h-[90vh] sm:rounded-[32px] rounded-t-[32px] border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-[#0f172a]/95 border-white/15 text-white shadow-black/95'
            : 'bg-[#f2f2f7]/95 border-slate-300/80 text-slate-900 shadow-2xl'
        } backdrop-blur-2xl`}
      >
        {/* iOS Top Sheet Grabber Handle */}
        <div className="pt-3 pb-1 shrink-0">
          <div className="ios-sheet-handle" />
        </div>

        {/* Apple iOS Notification Center Navigation Bar */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-b shrink-0 ${
            isDark ? 'border-white/10 bg-slate-900/40' : 'border-slate-200/80 bg-white/60'
          }`}
        >
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-xs font-semibold text-[#2997ff] hover:text-[#0071e3] transition-colors cursor-pointer flex items-center gap-1 active:opacity-70"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تعيين كمقروء' : 'Mark all read'}</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              {lang === 'ar' ? 'لا جديد' : 'Up to date'}
            </span>
          )}

          <div className="text-center">
            <h3 className="text-base font-bold tracking-tight">
              {lang === 'ar' ? 'مركز الإشعارات' : 'Notification Center'}
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] text-[#2997ff] font-semibold">
                {unreadCount} {lang === 'ar' ? 'إشعار غير مقروء' : 'unread alerts'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded-full font-bold text-xs bg-[#2997ff] text-white hover:bg-[#0071e3] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {lang === 'ar' ? 'تم' : 'Done'}
          </button>
        </div>

        {/* Notifications Banners Stream (Styled exactly like iOS Lock Screen / Notification Center) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {notifications.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/40 flex items-center justify-center text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-300">
                {lang === 'ar' ? 'لا توجد إشعارات سابقة' : 'No Notifications'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {lang === 'ar'
                  ? 'ستظهر هنا رسائل المطور وأي تحديثات جديدة للتطبيق.'
                  : 'Developer updates and messages will appear here.'}
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isTicketReply = item.type === 'ticket_reply';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectNotification(item)}
                  className={`p-3.5 sm:p-4 rounded-[22px] transition-all cursor-pointer relative group text-start active:scale-[0.99] ${
                    isDark ? 'ios-notification-glass-dark' : 'ios-notification-glass-light'
                  } ${!item.isRead ? 'ring-1 ring-[#2997ff]/50' : ''}`}
                >
                  {/* Apple App Header Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-bold shadow-xs ${
                          isTicketReply
                            ? 'bg-gradient-to-tr from-[#34c759] to-[#30d158]'
                            : 'bg-gradient-to-tr from-[#ff9f0a] to-[#ffd60a]'
                        }`}
                      >
                        {isTicketReply ? (
                          <MessageCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Megaphone className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-xs font-semibold tracking-tight">
                        {isTicketReply
                          ? lang === 'ar'
                            ? 'رسالة من المطور'
                            : 'Developer Reply'
                          : lang === 'ar'
                          ? `تحديث التطبيق ${item.version || ''}`
                          : `App Update ${item.version || ''}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-mono-num">
                        {new Date(item.date).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#2997ff] shadow-[0_0_6px_#2997ff]" />
                      )}
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div className="ps-8 pe-1 space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {item.body}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Apple iOS Footer Bar */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
            isDark ? 'border-white/10 bg-slate-900/60' : 'border-slate-200/80 bg-white/70'
          }`}
        >
          <span className="text-[11px] text-slate-400">
            {lang === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-full font-bold text-xs bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
