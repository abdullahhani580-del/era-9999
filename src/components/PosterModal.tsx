import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Smartphone, Monitor, Check, Loader2, Shuffle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ScheduleResult } from '../types/schedule';
import { UserProfile } from '../types/userProfile';
import {
  POSTER_SIZES,
  PosterOptions,
  renderScheduleToCanvas,
  downloadSchedulePoster,
} from '../utils/posterRenderer';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: ScheduleResult;
  isDark: boolean;
  userProfile?: UserProfile;
}

export const PosterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  result,
  isDark,
  userProfile,
}) => {
  const { lang, t, dir } = useLanguage();
  const [selectedSizeKey, setSelectedSizeKey] = useState<'story' | 'poster'>('story');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [bgSeed, setBgSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSize: PosterOptions = POSTER_SIZES[selectedSizeKey];

  useEffect(() => {
    if (isOpen) {
      setBgSeed(Math.floor(Math.random() * 1000000));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const timer = setTimeout(async () => {
      try {
        const canvas = await renderScheduleToCanvas(result, currentSize, bgSeed, userProfile);
        if (isMounted) {
          setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.88));
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Failed to generate preview canvas:', err);
        if (isMounted) setIsGenerating(false);
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, selectedSizeKey, result, userProfile, bgSeed, currentSize]);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await downloadSchedulePoster(result, currentSize, bgSeed, userProfile);
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (err) {
      console.error('Error downloading poster:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomizeBackground = () => {
    setBgSeed(Math.floor(Math.random() * 1000000));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-all animate-fadeIn"
      dir={dir}
    >
      <div
        ref={containerRef}
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
            <div className="ios-squircle-icon ios-bg-blue">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight">
                {lang === 'ar' ? 'صورة وبوستر الجدول 📱' : 'Schedule Wallpaper & Poster 📱'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'صورة واضحة للجدول تناسب شاشة هاتفك أو للطباعة'
                  : 'HD schedule wallpaper for phone lock screen & print'}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-5 sm:gap-6 items-center justify-center">
          {/* Controls Column (iOS Grouped Style) */}
          <div className="w-full md:w-80 flex flex-col gap-4 order-2 md:order-1">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                {lang === 'ar' ? 'حجم وشكل الصورة' : 'IMAGE DIMENSIONS'}
              </span>
              <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
                {/* Option 1: Mobile Story */}
                <button
                  type="button"
                  onClick={() => setSelectedSizeKey('story')}
                  className="ios-grouped-row w-full text-start cursor-pointer hover:bg-white/5 active:bg-white/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="ios-squircle-icon ios-bg-blue">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <strong className="block text-xs sm:text-sm font-semibold">
                        {lang === 'ar' ? 'شاشة الهاتف (طولية)' : 'Phone (Vertical)'}
                      </strong>
                      <span className="text-[11px] text-slate-400">1080 × 1920 (9:16)</span>
                    </div>
                  </div>
                  {selectedSizeKey === 'story' && (
                    <Check className="w-5 h-5 text-[#2997ff] stroke-[2.5]" />
                  )}
                </button>

                {/* Option 2: Desktop / Wide */}
                <button
                  type="button"
                  onClick={() => setSelectedSizeKey('poster')}
                  className="ios-grouped-row w-full text-start cursor-pointer hover:bg-white/5 active:bg-white/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="ios-squircle-icon ios-bg-indigo">
                      <Monitor className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <strong className="block text-xs sm:text-sm font-semibold">
                        {lang === 'ar' ? 'شاشة الكمبيوتر (عرضية)' : 'Desktop (Horizontal)'}
                      </strong>
                      <span className="text-[11px] text-slate-400">1200 × 1600 (3:4)</span>
                    </div>
                  </div>
                  {selectedSizeKey === 'poster' && (
                    <Check className="w-5 h-5 text-[#2997ff] stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>

            {/* Change Background Button */}
            <button
              type="button"
              onClick={handleRandomizeBackground}
              disabled={isGenerating}
              className={`w-full p-3 rounded-2xl flex items-center justify-center gap-2 font-medium text-xs sm:text-sm transition-all cursor-pointer border active:scale-[0.98] ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-white/10 text-cyan-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-cyan-700 shadow-xs'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تغيير الخلفية 🎨' : 'Change Background 🎨'}</span>
            </button>

            {/* Primary Download Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleDownload}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-[#2997ff] text-white hover:bg-[#0071e3] shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : isDownloaded ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {isDownloaded
                    ? lang === 'ar'
                      ? 'تم حفظ الصورة بنجاح!'
                      : 'Saved to Photos!'
                    : lang === 'ar'
                    ? 'تحميل صورة الجدول'
                    : 'Download Schedule Image'}
                </span>
              </button>
            </div>
          </div>

          {/* Canvas Live Preview Column */}
          <div
            className={`flex-1 flex items-center justify-center w-full min-h-[360px] sm:min-h-[420px] rounded-3xl p-3 sm:p-5 relative overflow-hidden order-1 md:order-2 border ${
              isDark
                ? 'bg-black/50 border-white/10'
                : 'bg-slate-200/50 border-slate-300/80'
            }`}
          >
            {isGenerating && !previewDataUrl && (
              <div className="flex flex-col items-center gap-3 text-[#2997ff]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-semibold">
                  {lang === 'ar' ? 'جاري تجهيز الصورة...' : 'Preparing Image...'}
                </span>
              </div>
            )}

            {previewDataUrl && (
              <div className="relative group max-h-[58vh]">
                <img
                  src={previewDataUrl}
                  alt="Study Schedule Poster Preview"
                  className="max-h-[56vh] max-w-full rounded-2xl shadow-2xl border border-white/20 object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark ? 'border-white/10 bg-slate-900/60 text-slate-400' : 'border-slate-200/80 bg-white/70 text-slate-600'
          }`}
        >
          <span>
            {lang === 'ar' ? 'دقة الصورة عالية وواضحة جداً' : 'High Resolution Ready'}
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
