import React, { useState, useEffect } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogOut,
  Globe,
  Sun,
  Moon,
  RotateCcw,
  Check,
  Shield,
  Smartphone,
  Laptop,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isUserAdmin } from '../services/adminService';
import { SupportSection } from './SupportSection';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onResetAll: () => void;
  onManualSync: () => void;
  onOpenDeveloperDashboard?: () => void;
}

type SettingSection = 'menu' | 'language' | 'account' | 'support' | 'appearance' | 'data';

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
  onResetAll,
  onManualSync,
  onOpenDeveloperDashboard,
}) => {
  const { user, isSyncing, syncSuccess, signInWithGoogle, signOutUser } = useAuth();
  const { lang, setLang, t, dir } = useLanguage();
  const [activeSection, setActiveSection] = useState<SettingSection>('menu');
  const [confirmingReset, setConfirmingReset] = useState(false);

  // Reset to menu view whenever modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveSection('menu');
      setConfirmingReset(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ForwardChevron = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const BackChevron = dir === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md transition-all animate-fadeIn"
      dir={dir}
    >
      <div
        className={`w-full max-w-lg max-h-[92vh] sm:rounded-[32px] rounded-t-[32px] border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-[#0f172a]/95 border-white/15 text-white shadow-black/90'
            : 'bg-[#f2f2f7]/95 border-slate-300/80 text-slate-900 shadow-2xl'
        } backdrop-blur-2xl`}
      >
        {/* iOS Top Sheet Grabber Handle */}
        <div className="pt-3 pb-1 shrink-0">
          <div className="ios-sheet-handle" />
        </div>

        {/* Apple iOS Navigation Bar */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-b shrink-0 ${
            isDark ? 'border-white/10 bg-slate-900/40' : 'border-slate-200/80 bg-white/60'
          }`}
        >
          {activeSection !== 'menu' ? (
            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              className="flex items-center gap-1 text-[#2997ff] hover:text-[#0071e3] transition-colors font-medium text-sm cursor-pointer active:opacity-70"
            >
              <BackChevron className="w-5 h-5" />
              <span>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </button>
          ) : (
            <span className="text-xs font-semibold text-slate-400">
              {lang === 'ar' ? 'خيارات التطبيق' : 'Preferences'}
            </span>
          )}

          <h3 className="text-base font-bold tracking-tight text-center">
            {activeSection === 'menu' && (lang === 'ar' ? 'الإعدادات' : 'Settings')}
            {activeSection === 'language' && (lang === 'ar' ? 'اللغة' : 'Language')}
            {activeSection === 'account' && (lang === 'ar' ? 'حساب Google' : 'Google Account')}
            {activeSection === 'support' && (lang === 'ar' ? 'الدعم الفني' : 'Support')}
            {activeSection === 'appearance' && (lang === 'ar' ? 'المظهر' : 'Appearance')}
            {activeSection === 'data' && (lang === 'ar' ? 'مسح البيانات' : 'Reset')}
          </h3>

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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* ============================================================ */}
          {/* 1. MAIN MENU                                                 */}
          {/* ============================================================ */}
          {activeSection === 'menu' && (
            <div className="space-y-4 animate-fadeIn">
              {/* User Profile Card */}
              <button
                type="button"
                onClick={() => setActiveSection('account')}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between gap-3.5 transition-all cursor-pointer text-start active:scale-[0.99] ${
                  isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-full object-cover border border-white/20 shrink-0"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '✦'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base truncate">
                      {user?.displayName || (lang === 'ar' ? 'سجّل دخولك بحساب Google' : 'Sign In with Google')}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {user?.email || (lang === 'ar' ? 'لحفظ جدولك وتعديلاتك تلقائياً' : 'Backup and sync across devices')}
                    </p>
                    {user && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{lang === 'ar' ? 'حفظ البيانات مفعل' : 'Cloud Sync Active'}</span>
                      </span>
                    )}
                  </div>
                </div>
                <ForwardChevron className="w-5 h-5 text-slate-400 shrink-0 opacity-70" />
              </button>

              {/* Group 1: General Preferences */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                  {lang === 'ar' ? 'التفضيلات العامة' : 'GENERAL PREFERENCES'}
                </span>
                <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                  {/* Row: Language */}
                  <button
                    type="button"
                    onClick={() => setActiveSection('language')}
                    className="ios-grouped-row w-full text-start cursor-pointer hover:bg-white/5 active:bg-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="ios-squircle-icon ios-bg-blue">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{t.settingsLanguageTab}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 font-medium">
                        {lang === 'ar' ? 'العربية' : 'English'}
                      </span>
                      <ForwardChevron className="w-4 h-4 text-slate-400 opacity-60" />
                    </div>
                  </button>

                  {/* Row: Dark / Light Mode with iOS Toggle */}
                  <div className="ios-grouped-row">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="ios-squircle-icon ios-bg-indigo">
                        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <span className="font-medium text-sm">
                        {lang === 'ar' ? 'النمط الداكن' : 'Dark Mode'}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isDark}
                      onClick={onToggleTheme}
                      className={`ios-switch transition-all ${isDark ? 'bg-[#34C759]' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span
                        className={`ios-switch-knob block ${
                          isDark ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row: Technical Support & Suggestions */}
                  <button
                    type="button"
                    onClick={() => setActiveSection('support')}
                    className="ios-grouped-row w-full text-start cursor-pointer hover:bg-white/5 active:bg-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="ios-squircle-icon ios-bg-green">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">
                        {lang === 'ar' ? 'الدعم الفني والمقترحات' : 'Support & Inquiries'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                        {lang === 'ar' ? 'متاح' : 'Available'}
                      </span>
                      <ForwardChevron className="w-4 h-4 text-slate-400 opacity-60" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Group 2: Developer Area (Admin only) */}
              {isUserAdmin(user?.email) && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider px-2">
                    {lang === 'ar' ? 'المطور' : 'DEVELOPER'}
                  </span>
                  <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDeveloperDashboard?.();
                      }}
                      className="ios-grouped-row w-full text-start cursor-pointer hover:bg-white/5 active:bg-white/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="ios-squircle-icon ios-bg-amber">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm text-amber-400">
                          {lang === 'ar' ? 'لوحة المطور' : 'Developer Dashboard'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          ADMIN
                        </span>
                        <ForwardChevron className="w-4 h-4 text-amber-400" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Group 3: Data Management */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                  {lang === 'ar' ? 'البيانات' : 'DATA'}
                </span>
                <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                  <button
                    type="button"
                    onClick={() => setActiveSection('data')}
                    className="ios-grouped-row w-full text-start cursor-pointer hover:bg-white/5 active:bg-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="ios-squircle-icon ios-bg-red">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm text-rose-400">
                        {lang === 'ar' ? 'مسح البيانات والبدء من جديد' : 'Reset All Data'}
                      </span>
                    </div>
                    <ForwardChevron className="w-4 h-4 text-slate-400 opacity-60" />
                  </button>
                </div>
              </div>

              {/* Version label */}
              <p className="text-center text-[11px] text-slate-400 pt-1">
                {lang === 'ar' ? 'الإصدار · v2.6' : 'Version · v2.6'}
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. SUBVIEW: LANGUAGE SETTINGS                                */}
          {/* ============================================================ */}
          {activeSection === 'language' && (
            <div className="space-y-4 animate-fadeIn">
              <span className="text-xs text-slate-400 px-2 block">
                {lang === 'ar' ? 'اختر لغة التطبيق المفضلة:' : 'Select preferred application language:'}
              </span>
              <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                <button
                  type="button"
                  onClick={() => setLang('ar')}
                  className="ios-grouped-row w-full text-start cursor-pointer hover:bg-white/5 active:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇪🇬</span>
                    <div>
                      <div className="font-semibold text-sm">العربية</div>
                      <div className="text-xs text-slate-400">اللغة العربية (الافتراضية)</div>
                    </div>
                  </div>
                  {lang === 'ar' && <Check className="w-5 h-5 text-[#2997ff] stroke-[2.5]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className="ios-grouped-row w-full text-start cursor-pointer hover:bg-white/5 active:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇺🇸</span>
                    <div>
                      <div className="font-semibold text-sm">English</div>
                      <div className="text-xs text-slate-400">United States (EN)</div>
                    </div>
                  </div>
                  {lang === 'en' && <Check className="w-5 h-5 text-[#2997ff] stroke-[2.5]" />}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. SUBVIEW: GOOGLE ACCOUNT & CLOUD SYNC                     */}
          {/* ============================================================ */}
          {activeSection === 'account' && (
            <div className="space-y-4 animate-fadeIn">
              {user ? (
                <div className="space-y-4">
                  <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                    <div className="p-4 flex items-center gap-3.5">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'Google'}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full object-cover border border-white/20 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-cyan-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold truncate">
                          {user.displayName || t.cloudUserLoggedIn}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                          <CloudCheck className="w-3.5 h-3.5" />
                          <span>{syncSuccess ? t.cloudSaved : t.cloudActive}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={onManualSync}
                      disabled={isSyncing}
                      className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#2997ff] text-white hover:bg-[#0071e3] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? t.cloudSaving : t.cloudGoogleSyncNow}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => signOutUser()}
                      className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.cloudSignOut}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                    <div className="p-4 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                        <Cloud className="w-6 h-6" />
                      </div>
                      <h4 className="text-center font-bold text-base">
                        {lang === 'ar' ? 'حفظ جدولك تلقائياً' : 'Automatic Cloud Backup'}
                      </h4>
                      <p className="text-xs text-slate-400 text-center leading-relaxed">
                        {t.cloudSyncDescription}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center gap-2.5 shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#0f172a"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#0f172a"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#0f172a"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#0f172a"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{t.cloudBannerSignInBtn}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. SUBVIEW: MESSAGE THE DEVELOPER (SUPPORT & IDEAS)         */}
          {/* ============================================================ */}
          {activeSection === 'support' && (
            <div className="space-y-4 animate-fadeIn">
              <SupportSection isDark={isDark} />
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. SUBVIEW: DATA RESET                                      */}
          {/* ============================================================ */}
          {activeSection === 'data' && (
            <div className="space-y-4 animate-fadeIn">
              <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <RotateCcw className="w-5 h-5" />
                    <h4 className="text-sm font-bold">{t.settingsDataTab}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.settingsResetPrompt}
                  </p>

                  {confirmingReset ? (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 space-y-2.5">
                      <p className="text-xs font-bold text-rose-300">
                        {lang === 'ar'
                          ? 'هل أنت متأكد تماماً؟ سيتم مسح جدول المذاكرة وكافة المواد المسجلة ولن تتمكن من استرجاعها.'
                          : 'Are you sure? All study tasks and active schedule will be permanently cleared.'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onResetAll();
                            setConfirmingReset(false);
                            setActiveSection('menu');
                            onClose();
                          }}
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all"
                        >
                          {lang === 'ar' ? 'نعم، حذف وإعادة ضبط' : 'Yes, Reset All'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingReset(false)}
                          className="py-2 px-3 rounded-lg text-xs font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer transition-all"
                        >
                          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingReset(true)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 text-rose-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t.settingsResetBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Apple iOS Modal Bottom Action */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
            isDark ? 'border-white/10 bg-slate-900/60' : 'border-slate-200/80 bg-white/70'
          }`}
        >
          {activeSection !== 'menu' ? (
            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              className="text-[#2997ff] font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <BackChevron className="w-4 h-4" />
              <span>{lang === 'ar' ? 'رجوع' : 'Back'}</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">
              {lang === 'ar' ? 'منظم المذاكرة الذكي' : 'Study Planner'}
            </span>
          )}

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
