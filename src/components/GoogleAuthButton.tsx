import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, Cloud, CloudCheck, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  isDark: boolean;
  onManualSync?: () => void;
}

export const GoogleAuthButton: React.FC<Props> = ({ isDark, onManualSync }) => {
  const { user, loading, isSyncing, syncSuccess, signInWithGoogle, signOutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsOpen(false);
    } catch {
      // Error handled in AuthContext
    }
  };

  if (loading) {
    return (
      <div className="h-9 sm:h-10 px-3 rounded-xl border border-cyan-500/20 flex items-center gap-2 bg-slate-900/40 text-slate-400 text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        <span className="hidden sm:inline">جاري التحقق...</span>
      </div>
    );
  }

  // User is logged in
  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-9 sm:h-10 px-2 sm:px-3 rounded-xl border flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer group active:scale-95 ${
            isDark
              ? 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-400 text-slate-200 hover:bg-slate-800'
              : 'bg-white border-slate-300 hover:border-cyan-500 text-slate-800 hover:bg-slate-50'
          }`}
          title="حساب Google الخاص بك وحفظ البيانات"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Google User'}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover border border-cyan-400"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="text-xs font-bold max-w-[70px] sm:max-w-[100px] truncate hidden md:inline">
              {user.displayName?.split(' ')[0] || 'حسابي'}
            </span>
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={`absolute left-0 mt-2 w-64 rounded-2xl border p-4 shadow-2xl z-50 transition-all ${
              isDark
                ? 'bg-[#080d1a] border-cyan-500/30 text-white shadow-black/80'
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || ''}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-cyan-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 font-bold text-base flex items-center justify-center">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{user.displayName || 'مستخدم مسجل'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Sync Status Info */}
            <div className="py-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>حفظ البيانات:</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400 text-[11px]">
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : syncSuccess ? (
                    <>
                      <CloudCheck className="w-3.5 h-3.5" />
                      <span>تم الحفظ</span>
                    </>
                  ) : (
                    <>
                      <CloudCheck className="w-3.5 h-3.5" />
                      <span>محفوظ تلقائياً</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                كل تعديل في موادك وجدولك يُحفظ تلقائياً في حسابك لتفتحه من أي موبايل أو كمبيوتر!
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-cyan-500/10 space-y-2">
              {onManualSync && (
                <button
                  type="button"
                  onClick={() => {
                    onManualSync();
                    setIsOpen(false);
                  }}
                  disabled={isSyncing}
                  className="w-full py-1.5 px-3 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>مزامنة فورية الآن</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-1.5 px-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // User is not logged in
  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isSigningIn}
      className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-all cursor-pointer active:scale-95 group shrink-0 ${
        isDark
          ? 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-400 text-slate-200 hover:bg-slate-800 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
          : 'bg-white border-slate-300 hover:border-cyan-500 text-slate-800 hover:bg-slate-50 shadow-xs'
      }`}
      title="سجل دخولك بجوجل لحفظ وتزامن بياناتك عبر العديد من الأجهزة"
    >
      {isSigningIn ? (
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span className="hidden xs:inline">
        {isSigningIn ? 'جاري الاتصال...' : 'دخول Google'}
      </span>
      <Cloud className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
    </button>
  );
};
