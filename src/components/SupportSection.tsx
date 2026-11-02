import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  MessageCircle,
  Lock,
  UserCheck,
  Clock,
  Sparkles,
  Inbox,
} from 'lucide-react';
import {
  SupportType,
  SupportTicket,
  sendUserSupportMessage,
  subscribeToUserTickets,
} from '../services/supportService';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  isDark: boolean;
}

export const SupportSection: React.FC<Props> = ({ isDark }) => {
  const { lang, dir } = useLanguage();
  const { user, signInWithGoogle } = useAuth();

  const [type, setType] = useState<SupportType>('suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User's tickets and developer replies
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setMyTickets([]);
      return;
    }
    const unsub = subscribeToUserTickets(user.uid, (data) => {
      setMyTickets(data);
    });
    return () => unsub();
  }, [user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى تسجيل حسابك عبر Google أولاً لتتمكن من إرسال الرسالة.'
          : 'Please sign in with Google first to send your message.'
      );
      return;
    }

    if (!message.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await sendUserSupportMessage(message, type, user);

    setIsSubmitting(false);
    if (res.success) {
      setSentSuccess(true);
      setMessage('');
    } else {
      setErrorMsg(
        lang === 'ar'
          ? 'تعذر الإرسال حالياً، يرجى المحاولة بعد لحظات.'
          : 'Could not send right now, please try again in a moment.'
      );
    }
  };

  return (
    <div className="space-y-4" dir={dir}>
      {/* iOS Grouped Description Card */}
      <div className={isDark ? 'ios-grouped-list-dark p-4' : 'ios-grouped-list-light p-4'}>
        <div className="flex items-center gap-3">
          <div className="ios-squircle-icon ios-bg-green shrink-0">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold">
              {lang === 'ar' ? 'الدعم الفني ومقترحات التطوير' : 'Technical Support & Inquiries'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {lang === 'ar'
                ? 'لديك اقتراح، فكرة، أو استفسار؟ اكتب رسالتك هنا وستصل للمطور مباشرة للمراجعة والرد.'
                : 'Have an idea or question? Send a message directly to the developer.'}
            </p>
          </div>
        </div>
      </div>

      {/* When User is NOT signed in: Show Google sign-in banner */}
      {!user ? (
        <div
          className={`${
            isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'
          } p-5 text-center space-y-3.5`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-[#2997ff]/15 flex items-center justify-center text-[#2997ff]">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h5 className="font-bold text-sm">
              {lang === 'ar'
                ? 'تسجيل الدخول عبر Google مطلوب أولاً 🔒'
                : 'Google Sign-in Required First 🔒'}
            </h5>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-md mx-auto">
              {lang === 'ar'
                ? 'لإرسال رسالتك أو اقتراحك وضمان إمكانية الرد عليك من قبل المطور، يرجى تسجيل حسابك أولاً.'
                : 'To send a message and receive replies, please sign in with Google first.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs sm:text-sm bg-[#2997ff] text-white hover:bg-[#0071e3] flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all cursor-pointer mx-auto"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#ffffff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {lang === 'ar'
                ? 'تسجيل الدخول عبر Google للمتابعة'
                : 'Sign in with Google to Continue'}
            </span>
          </button>
        </div>
      ) : sentSuccess ? (
        <div
          className={`${
            isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'
          } p-5 text-center space-y-2.5 animate-fadeIn`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <p className="font-bold text-sm text-emerald-400">
            {lang === 'ar'
              ? 'تم استلام رسالتك في الدعم الفني بنجاح! ❤️'
              : 'Message received by support! ❤️'}
          </p>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
            {lang === 'ar'
              ? 'شكراً لتواصلك، نقرأ كل الرسائل ونعمل باستمرار على تطوير تجربة التطبيق.'
              : 'Thank you for reaching out! We read every message and continuously improve the app.'}
          </p>
          <button
            type="button"
            onClick={() => setSentSuccess(false)}
            className="mt-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#2997ff] hover:bg-[#0071e3] transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 animate-fadeIn">
          {/* User ID card in iOS cell style */}
          <div className={isDark ? 'ios-grouped-list-dark p-3.5' : 'ios-grouped-list-light p-3.5'}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate text-slate-400">
                  {lang === 'ar' ? 'إرسال بواسطة:' : 'Sending as:'}{' '}
                  <strong className="text-white font-semibold">
                    {user.displayName || user.email}
                  </strong>
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                {lang === 'ar' ? 'حساب موثق' : 'Verified'}
              </span>
            </div>
          </div>

          {/* iOS Segmented Control for Ticket Type */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              {lang === 'ar' ? 'نوع الرسالة' : 'MESSAGE TYPE'}
            </span>
            <div className="p-1 rounded-2xl bg-black/25 dark:bg-black/40 border border-white/10 grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setType('suggestion')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'suggestion'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'ar' ? 'اقتراح' : 'Idea'}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('inquiry')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'inquiry'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>{lang === 'ar' ? 'استفسار' : 'Question'}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('issue')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'issue'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>{lang === 'ar' ? 'مشكلة' : 'Issue'}</span>
              </button>
            </div>
          </div>

          {/* Textarea inside iOS Grouped Card */}
          <div className={isDark ? 'ios-grouped-list-dark p-3' : 'ios-grouped-list-light p-3'}>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'suggestion'
                  ? lang === 'ar'
                    ? 'اكتب اقتراحك هنا بكل بساطة... (مثال: أقترح إضافة ميزة كذا لأنها ستكون مفيدة)'
                    : 'Type your suggestion here...'
                  : type === 'inquiry'
                  ? lang === 'ar'
                    ? 'اكتب استفسارك هنا بكل سهولة وسيجيبك المطور...'
                    : 'Ask your question here...'
                  : lang === 'ar'
                  ? 'صف المشكلة التي واجهتك هنا للمساعدة في حلها...'
                  : 'Describe the issue you encountered...'
              }
              required
              className="w-full bg-transparent text-xs sm:text-sm placeholder-slate-400 focus:outline-none resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-semibold px-2">{errorMsg}</p>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-[#2997ff] text-white hover:bg-[#0071e3] flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
            <span>
              {isSubmitting
                ? lang === 'ar'
                  ? 'جاري الإرسال...'
                  : 'Sending...'
                : lang === 'ar'
                ? 'إرسال إلى المطور'
                : 'Send to Developer'}
            </span>
          </button>

          {/* User's Messages History & Developer In-App Replies */}
          {myTickets.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                {lang === 'ar' ? 'سجل رسائلك وردود المطور' : 'YOUR MESSAGES & REPLIES'}
              </span>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {myTickets.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border text-xs transition-all ${
                      t.adminReply
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : isDark
                        ? 'bg-slate-900/60 border-white/10'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-[#2997ff]">{t.subject}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString(
                          lang === 'ar' ? 'ar-EG' : 'en-US'
                        )}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                      {t.message}
                    </p>

                    {t.adminReply ? (
                      <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'ar' ? 'رد المطور (عبدالله هاني) 💬:' : 'Developer Reply 💬:'}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-[11px]">
                          {t.adminReply}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 text-[10px] text-amber-400/90 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {lang === 'ar' ? 'قيد مراجعة المطور...' : 'Under developer review...'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
