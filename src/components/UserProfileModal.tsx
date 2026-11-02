import React, { useState, useMemo } from 'react';
import { X, Check, Sparkles, User, Award, Quote, Search, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  ALL_AVATARS,
  AvatarOption,
  AVATAR_CATEGORIES,
  AvatarCategory,
  getPlayerAvatar,
} from '../types/userProfile';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isDark,
  userProfile,
  onSaveProfile,
}) => {
  const { lang, t, dir } = useLanguage();
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(userProfile.avatarId);
  const [selectedCategory, setSelectedCategory] = useState<AvatarCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userName, setUserName] = useState<string>(userProfile.name);
  const [selectedQuote, setSelectedQuote] = useState<string>(userProfile.quote);
  const [selectedPlayerTitle, setSelectedPlayerTitle] = useState<string>(userProfile.playerTitle);

  const currentSelectedAvatar = getPlayerAvatar(selectedAvatarId);

  const filteredAvatars = useMemo(() => {
    return ALL_AVATARS.filter((avatar) => {
      const matchCategory =
        selectedCategory === 'all' ? true : avatar.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        avatar.playerNameAr.toLowerCase().includes(query) ||
        avatar.name.toLowerCase().includes(query) ||
        avatar.tag.toLowerCase().includes(query) ||
        avatar.teamOrCountry.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleSelectAvatar = (player: AvatarOption) => {
    setSelectedAvatarId(player.id);
    setSelectedQuote(player.quote);
    setSelectedPlayerTitle(player.tag);
  };

  const handleSave = () => {
    const finalUrl = currentSelectedAvatar.imageUrl;
    const finalTitle = currentSelectedAvatar.tag;
    const finalQuote = currentSelectedAvatar.quote;

    const updated: UserProfile = {
      name: userName.trim() || (lang === 'ar' ? 'الكابتن' : 'Captain'),
      avatarId: selectedAvatarId,
      avatarUrl: finalUrl,
      playerTitle: finalTitle,
      quote: finalQuote,
    };

    onSaveProfile(updated);

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2997ff', '#34c759', '#ffd60a', '#ff375f'],
      });
    } catch {
      // Safe fallback
    }

    onClose();
  };

  const currentPreviewUrl = currentSelectedAvatar.imageUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-all animate-fadeIn"
      dir={dir}
    >
      <div
        className={`w-full max-w-2xl max-h-[92vh] sm:rounded-[32px] rounded-t-[32px] border flex flex-col overflow-hidden shadow-2xl transition-all ${
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
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-[#2997ff] hover:opacity-80 transition-opacity cursor-pointer"
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>

          <div className="text-center">
            <h3 className="text-base font-bold tracking-tight">
              {lang === 'ar' ? 'ملصق وصورة الحساب' : 'Contact Photo & Poster'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'ar' ? 'اختر الشخصية أو الصورة الرمزية' : 'Choose your avatar persona'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1 rounded-full font-bold text-xs bg-[#2997ff] text-white hover:bg-[#0071e3] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {lang === 'ar' ? 'تم' : 'Done'}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* iOS Contact Poster Hero Avatar */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-[#2997ff] shadow-[0_8px_25px_rgba(41,151,255,0.35)] relative bg-slate-900">
                <img
                  src={currentPreviewUrl}
                  alt="Selected Profile Avatar"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes(currentSelectedAvatar.fallbackUrl)) {
                      target.src = currentSelectedAvatar.fallbackUrl;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* iOS Camera / Edit Badge */}
              <div className="absolute -bottom-1 -end-1 w-8 h-8 rounded-full bg-[#2997ff] text-white flex items-center justify-center shadow-lg border-2 border-slate-900">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base sm:text-lg flex items-center justify-center gap-1.5">
                <span>{userName || (lang === 'ar' ? 'الكابتن' : 'Captain')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-medium">
                  {selectedPlayerTitle}
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentSelectedAvatar.teamOrCountry}
              </p>
            </div>

            {/* Apple Quote Pill */}
            <div
              className={`max-w-md px-4 py-2 rounded-2xl border text-xs italic flex items-center gap-2 ${
                isDark ? 'bg-slate-900/60 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <Quote className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />
              <span className="truncate">{selectedQuote}</span>
            </div>
          </div>

          {/* iOS Grouped Input: User Name */}
          <div className="space-y-1.5">
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'ar' ? 'الاسم المستعار' : 'NICKNAME'}
            </span>
            <div className={isDark ? 'ios-grouped-list-dark' : 'ios-grouped-list-light'}>
              <div className="ios-grouped-row">
                <span className={`text-sm font-medium shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {lang === 'ar' ? 'الاسم' : 'Name'}
                </span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={30}
                  placeholder={lang === 'ar' ? 'اكتب اسمك أو لقبك هنا' : 'Enter your name'}
                  className={`bg-transparent text-end text-sm font-semibold outline-none w-full ps-4 ${
                    isDark ? 'text-cyan-400 placeholder:text-slate-500' : 'text-sky-800 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* iOS Segmented Category Control & Search Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {lang === 'ar' ? 'مكتبة الصور والملصقات' : 'AVATAR GALLERY'}
              </span>
              <span className="text-xs text-slate-400">
                {filteredAvatars.length} {lang === 'ar' ? 'شخصية' : 'items'}
              </span>
            </div>

            {/* iOS Style Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث عن شخصية أو لاعب أو عالم...' : 'Search avatars...'}
                className={`w-full ps-9 pe-4 py-2 rounded-xl text-xs outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800/80 border border-white/10 text-white focus:border-[#2997ff] placeholder:text-slate-500'
                    : 'bg-slate-200/80 border border-slate-300 text-slate-900 focus:border-[#2997ff] placeholder:text-slate-400'
                }`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5 pointer-events-none" />
            </div>

            {/* Apple iOS Segmented Control Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {AVATAR_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const categoryLabels: Record<string, string> = {
                  all: t.profileFilterAll,
                  football: t.profileFilterFootball,
                  music: t.profileFilterSingers,
                  science: t.profileFilterScientists,
                  philosophy: t.profileFilterPhilosophers,
                };
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#2997ff] text-white shadow-sm'
                        : isDark
                        ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{categoryLabels[cat.id] || cat.labelAr}</span>
                  </button>
                );
              })}
            </div>

            {/* Avatars Grid - iOS Contact Photo circles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
              {filteredAvatars.map((player) => {
                const isSelected = selectedAvatarId === player.id;
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleSelectAvatar(player)}
                    className={`p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer relative group ${
                      isSelected
                        ? isDark
                          ? 'bg-[#2997ff]/15 border-2 border-[#2997ff] shadow-[0_0_15px_rgba(41,151,255,0.3)]'
                          : 'bg-[#2997ff]/10 border-2 border-[#2997ff] shadow-sm'
                        : isDark
                        ? 'bg-slate-900/60 border border-white/8 hover:border-white/20'
                        : 'bg-white border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-slate-900 shadow-md">
                      <img
                        src={player.imageUrl}
                        alt={player.playerNameAr}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes(player.fallbackUrl)) {
                            target.src = player.fallbackUrl;
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#2997ff]/40 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="w-full min-w-0">
                      <strong className="text-xs font-bold block truncate">
                        {lang === 'ar' ? player.playerNameAr : player.name}
                      </strong>
                      <span className="text-[10px] text-[#2997ff] font-medium block truncate">
                        {player.tag}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {player.teamOrCountry}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredAvatars.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                {lang === 'ar'
                  ? 'لا توجد شخصية مطابقة لبحثك في هذا القسم.'
                  : 'No figures found matching your search.'}
              </div>
            )}
          </div>
        </div>

        {/* Apple iOS Footer Bar */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
            isDark ? 'border-white/10 bg-slate-900/60' : 'border-slate-200/80 bg-white/70'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            {t.tasksCancelBtn}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-full font-bold text-xs bg-[#2997ff] text-white hover:bg-[#0071e3] transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{t.profileSaveBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
