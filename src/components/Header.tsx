import React from 'react';
import { Sun, Moon, Settings as SettingsIcon, Bell } from 'lucide-react';
import { UserProfile, getPlayerAvatar } from '../types/userProfile';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  isDark: boolean;
  onToggleTheme: () => void;
  userProfile: UserProfile;
  onOpenProfileModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenNotificationsModal: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<Props> = ({
  isDark,
  onToggleTheme,
  userProfile,
  onOpenProfileModal,
  onOpenSettingsModal,
  onOpenNotificationsModal,
  unreadNotificationsCount = 0,
}) => {
  const { lang, t, dir } = useLanguage();
  const { user, isSyncing } = useAuth();

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-300 border-b ${
        isDark
          ? 'bg-[#060811]/90 border-white/10 backdrop-blur-2xl'
          : 'bg-white/90 border-slate-200 backdrop-blur-2xl shadow-xs'
      }`}
      dir={dir}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 w-full">
        {/* Header Left Area */}
        <div className="flex items-center gap-2">
        </div>

        {/* Action Controls in One Unified Row */}
        <div className="flex items-center gap-2 sm:gap-2.5 ms-auto shrink-0">
          {/* Notifications Button */}
          <button
            type="button"
            onClick={onOpenNotificationsModal}
            title={lang === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications'}
            className={`relative h-9 px-3 rounded-full border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0 active:scale-95 ${
              isDark
                ? 'bg-slate-900/80 border-white/15 text-amber-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-amber-900 hover:bg-amber-50 shadow-xs'
            }`}
          >
            <Bell
              className={`w-4 h-4 text-amber-400 ${
                unreadNotificationsCount > 0 ? 'animate-bounce' : ''
              }`}
            />
            <span className="text-[11px] sm:text-xs hidden xs:inline">
              {lang === 'ar' ? 'الإشعارات' : 'Alerts'}
            </span>

            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff3b30] text-white font-bold text-[10px] flex items-center justify-center shadow-md">
                {unreadNotificationsCount > 9 ? '+9' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettingsModal}
            title={lang === 'ar' ? 'الإعدادات' : 'Settings'}
            className={`relative h-9 px-3.5 rounded-full border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0 active:scale-95 ${
              isDark
                ? 'bg-slate-900/80 border-white/15 text-slate-200 hover:text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <SettingsIcon className={`w-4 h-4 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-[11px] sm:text-xs">
              {lang === 'ar' ? 'الإعدادات' : 'Settings'}
            </span>

            {user && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#34c759] border-2 border-[#060811] shadow-[0_0_6px_#34c759]" />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme mode"
            title={isDark ? t.themeLight : t.themeDark}
            className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
              isDark
                ? 'bg-slate-900/80 border-white/15 text-cyan-400 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-amber-500 hover:bg-amber-50 shadow-xs'
            }`}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            title={lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
            className={`h-9 px-2 sm:px-3 rounded-full border flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-slate-900/80 border-white/15 hover:border-cyan-400/50 hover:bg-slate-800'
                : 'bg-white border-slate-200 hover:border-cyan-400 shadow-xs'
            }`}
          >
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
              className="w-6 h-6 rounded-full object-cover border border-cyan-400"
            />
            <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[110px] hidden xs:inline">
              {userProfile.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
