import React from 'react';
import { CheckCircle2, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const AuthWelcomeModal: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  const { user, signInWithGoogle, isSyncing } = useAuth();
  const { lang, dir } = useLanguage();

  if (!isOpen || user) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // Handled in auth context
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all animate-fadeIn"
      dir={dir}
    >
      <div
        className={`w-full max-w-md rounded-3xl border p-6 sm:p-7 flex flex-col text-center relative overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-[#080d1e] border-cyan-500/40 text-white shadow-[0_0_50px_rgba(6,182,212,0.25)]'
            : 'bg-white border-cyan-300 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Subtle glowing ambient accent */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Title & Welcome Message (No Hourglass) */}
        <h3 className="text-xl sm:text-2xl font-extrabold font-cyber tracking-tight mb-2">
          {lang === 'ar' ? 'مرحباً بك في Era - 9999' : 'Welcome to Era - 9999'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5">
          {lang === 'ar'
            ? 'لتنظيم مذاكرتك ووقتك بسهولة. اختر كيف تحب أن تبدأ:'
            : 'Organize your study time simply and smartly. Choose how to start:'}
        </p>

        {/* Feature Highlights - Simple and Friendly (No Technical Jargon) */}
        <div
          className={`p-3.5 rounded-2xl border text-start space-y-2.5 mb-5 text-xs transition-colors ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'حفظ جدولك وموادك عشان متضيعش منك أبداً'
                : 'Save your schedule and tasks so you never lose them'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'تقدر تفتح جدولك من أي جهاز (موبايل أو كمبيوتر)'
                : 'Open your timetable from any phone or computer'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'اختيار صورتك والشخصية اللي بتشجعك في المذاكرة'
                : 'Choose your favorite avatar and inspiring study hero'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* 1. Primary: Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSyncing}
            className="w-full py-3.5 px-4 rounded-xl font-bold font-cyber text-xs sm:text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>
              {lang === 'ar' ? 'تسجيل الدخول بحساب Google (أفضل لحفظ بياناتك)' : 'Sign in with Google (Recommended)'}
            </span>
          </button>

          {/* 2. Secondary: Continue as Guest Button */}
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>{lang === 'ar' ? 'المتابعة كـ ضيف (بدون تسجيل)' : 'Continue as Guest (Without sign in)'}</span>
            {dir === 'rtl' ? (
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          {lang === 'ar'
            ? 'تقدر تسجل دخولك في أي وقت لاحقاً من زر الإعدادات ⚙️'
            : 'You can sign in anytime later from Settings ⚙️'}
        </p>
      </div>
    </div>
  );
};
