import salahAvatar from '../assets/images/salah_cartoon_avatar_1791019879114.jpg';
import messiAvatar from '../assets/images/messi_cartoon_avatar_1791019891679.jpg';
import ronaldoAvatar from '../assets/images/ronaldo_cartoon_avatar_1791019903158.jpg';
import neymarAvatar from '../assets/images/neymar_cartoon_avatar_1791019913270.jpg';
import haalandAvatar from '../assets/images/haaland_cartoon_avatar_1791019924487.jpg';
import mbappeAvatar from '../assets/images/mbappe_cartoon_avatar_1791019934769.jpg';

// Newly generated avatars
import amrDiabAvatar from '../assets/images/amr_diab_avatar_1791025879816.jpg';
import ummKulthumAvatar from '../assets/images/umm_kulthum_avatar_1791025891474.jpg';
import mounirAvatar from '../assets/images/mounir_avatar_1791025903298.jpg';
import zewailAvatar from '../assets/images/zewail_avatar_1791025914329.jpg';
import einsteinAvatar from '../assets/images/einstein_avatar_1791025926071.jpg';
import ibnSinaAvatar from '../assets/images/ibn_sina_avatar_1791025937158.jpg';
import socratesAvatar from '../assets/images/socrates_avatar_1791025948580.jpg';
import zidaneAvatar from '../assets/images/zidane_avatar_1791025961416.jpg';

export type AvatarCategory = 'football' | 'music' | 'science' | 'philosophy';

export interface AvatarCategoryMeta {
  id: AvatarCategory | 'all';
  labelAr: string;
  icon: string;
}

export const AVATAR_CATEGORIES: AvatarCategoryMeta[] = [
  { id: 'all', labelAr: 'الكل', icon: '✨' },
  { id: 'football', labelAr: 'نجوم الكرة', icon: '⚽' },
  { id: 'music', labelAr: 'عمالقة الغناء', icon: '🎤' },
  { id: 'science', labelAr: 'كبار العلماء', icon: '🔬' },
  { id: 'philosophy', labelAr: 'الفلاسفة', icon: '📜' },
];

export interface AvatarOption {
  id: string;
  category: AvatarCategory;
  name: string;
  playerNameAr: string;
  teamOrCountry: string;
  quote: string;
  imageUrl: string;
  fallbackUrl: string;
  accentColor: string;
  tag: string;
}

export type FootballAvatarOption = AvatarOption;

export interface UserProfile {
  name: string;
  avatarId: string;
  avatarUrl: string;
  playerTitle: string;
  quote: string;
}

export const ALL_AVATARS: AvatarOption[] = [
  // ⚽ Football Legends
  {
    id: 'salah',
    category: 'football',
    name: 'Mohamed Salah',
    playerNameAr: 'محمد صلاح',
    teamOrCountry: '🇪🇬 ليفربول / مصر',
    tag: 'الملك المصري 👑',
    quote: 'سجّل أهدافك في المذاكرة بهدوء وتمرير متقن زي ما بنعمل في الأنفيلد!',
    imageUrl: salahAvatar,
    fallbackUrl: '/avatars/salah.jpg',
    accentColor: '#ef4444',
  },
  {
    id: 'messi',
    category: 'football',
    name: 'Lionel Messi',
    playerNameAr: 'ليونيل ميسي',
    teamOrCountry: '🇦🇷 إنتر ميامي / الأرجنتين',
    tag: 'البرغوث الأسطورة 🐐',
    quote: 'المذاكرة مش محتاجة حركات عشوائية، لمسة سحرية وتنظيم وقت توصلك للقمة!',
    imageUrl: messiAvatar,
    fallbackUrl: '/avatars/messi.jpg',
    accentColor: '#38bdf8',
  },
  {
    id: 'ronaldo',
    category: 'football',
    name: 'Cristiano Ronaldo',
    playerNameAr: 'كريستيانو رونالدو',
    teamOrCountry: '🇵🇹 النصر / البرتغال',
    tag: 'الدون CR7 Siuuu! ⚡',
    quote: 'التزام، انضباط، وعمل شاق! كل ما تخلص مادة اصرخ Siuuu وكمل!',
    imageUrl: ronaldoAvatar,
    fallbackUrl: '/avatars/ronaldo.jpg',
    accentColor: '#eab308',
  },
  {
    id: 'zidane',
    category: 'football',
    name: 'Zinedine Zidane',
    playerNameAr: 'زين الدين زيدان',
    teamOrCountry: '🇫🇷 فرنسا / ريال مدريد',
    tag: 'المايسترو زيزو 🪄',
    quote: 'الهدوء والتركيز تحت الضغط هما سر الانتصار في أصعب الامتحانات والبطولات!',
    imageUrl: zidaneAvatar,
    fallbackUrl: '/avatars/zidane.jpg',
    accentColor: '#3b82f6',
  },
  {
    id: 'neymar',
    category: 'football',
    name: 'Neymar Jr',
    playerNameAr: 'نيمار جونيور',
    teamOrCountry: '🇧🇷 الهلال / البرازيل',
    tag: 'السامبا والمراوغات 🪄',
    quote: 'ارقص على التحديات ومتمشيش مع التوتر، استمتع بالمذاكرة واكسب الجولة!',
    imageUrl: neymarAvatar,
    fallbackUrl: '/avatars/neymar.jpg',
    accentColor: '#10b981',
  },
  {
    id: 'haaland',
    category: 'football',
    name: 'Erling Haaland',
    playerNameAr: 'إيرلينج هالاند',
    teamOrCountry: '🇳🇴 مانشستر سيتي / النرويج',
    tag: 'الفايكنج التهديفي 🤖',
    quote: 'أنا هنا عشان ألتهم الأهداف، وأنت هنا عشان تلتهم المنهج في وقت قياسي!',
    imageUrl: haalandAvatar,
    fallbackUrl: '/avatars/haaland.jpg',
    accentColor: '#06b6d4',
  },
  {
    id: 'mbappe',
    category: 'football',
    name: 'Kylian Mbappé',
    playerNameAr: 'كيليان مبابي',
    teamOrCountry: '🇫🇷 ريال مدريد / فرنسا',
    tag: 'سهم السرعة الخارقة 🚀',
    quote: 'انطلق بأقصى سرعة ولا تبطئ حتى تعبر خط النهاية بأعلى الدرجات!',
    imageUrl: mbappeAvatar,
    fallbackUrl: '/avatars/mbappe.jpg',
    accentColor: '#8b5cf6',
  },

  // 🎤 Egyptian Singers & Musical Icons
  {
    id: 'amr_diab',
    category: 'music',
    name: 'Amr Diab',
    playerNameAr: 'عمرو دياب',
    teamOrCountry: '🇪🇬 مصر / أسطورة البوب',
    tag: 'الهضبة 🎶',
    quote: 'تملي معاك في كل خطوة، خلي طاقتك إيجابية وافضل دايماً رقم واحد!',
    imageUrl: amrDiabAvatar,
    fallbackUrl: '/avatars/amr_diab.jpg',
    accentColor: '#f59e0b',
  },
  {
    id: 'umm_kulthum',
    category: 'music',
    name: 'Umm Kulthum',
    playerNameAr: 'أم كلثوم',
    teamOrCountry: '🇪🇬 مصر / التراث الخالد',
    tag: 'كوكب الشرق 🌟',
    quote: 'وما نيل المطالب بالتمني، ولكن تُؤخذ الدنيا غلاباً... اجتهد وتفوّق!',
    imageUrl: ummKulthumAvatar,
    fallbackUrl: '/avatars/umm_kulthum.jpg',
    accentColor: '#10b981',
  },
  {
    id: 'mounir',
    category: 'music',
    name: 'Mohamed Mounir',
    playerNameAr: 'محمد منير',
    teamOrCountry: '🇪🇬 مصر / صوت النوبة',
    tag: 'الكينج منير 👑',
    quote: 'علّي صوتك بالغُنا وبالعلم... اتبع حلمك وعفّر في الطريق لحد ما تنجح!',
    imageUrl: mounirAvatar,
    fallbackUrl: '/avatars/mounir.jpg',
    accentColor: '#ec4899',
  },

  // 🔬 Great Scientists
  {
    id: 'zewail',
    category: 'science',
    name: 'Ahmed Zewail',
    playerNameAr: 'د. أحمد زويل',
    teamOrCountry: '🇪🇬 كيمياء الفيمتو / نوبل',
    tag: 'قاهر الفيمتو ثانية 🔬',
    quote: 'العلم يبدأ بشغف، والنبوغ يأتي من الإصرار على فهم أدق تفاصيل الكون والمستقبل!',
    imageUrl: zewailAvatar,
    fallbackUrl: '/avatars/zewail.jpg',
    accentColor: '#06b6d4',
  },
  {
    id: 'einstein',
    category: 'science',
    name: 'Albert Einstein',
    playerNameAr: 'ألبرت أينشتاين',
    teamOrCountry: '🇩🇪 فيزياء النسبية / نوبل',
    tag: 'عبقري الفيزياء ⚛️',
    quote: 'الخيال أهم من المعرفة، لكن الفضول والمثابرة اليومية هما سر كل إنجاز عظيم!',
    imageUrl: einsteinAvatar,
    fallbackUrl: '/avatars/einstein.jpg',
    accentColor: '#eab308',
  },

  // 📜 Philosophers & Thinkers
  {
    id: 'ibn_sina',
    category: 'philosophy',
    name: 'Ibn Sina (Avicenna)',
    playerNameAr: 'ابن سينا',
    teamOrCountry: '📜 الفلسفة والطب الإسلامي',
    tag: 'الشيخ الرئيس 📜',
    quote: 'الوهم نصف الداء، والاطمئنان نصف الدواء، والعزيمة أول خطوات النجاح والتمكن!',
    imageUrl: ibnSinaAvatar,
    fallbackUrl: '/avatars/ibn_sina.jpg',
    accentColor: '#14b8a6',
  },
  {
    id: 'socrates',
    category: 'philosophy',
    name: 'Socrates',
    playerNameAr: 'سقراط',
    teamOrCountry: '🏛️ الفلسفة الإغريقية القديمة',
    tag: 'أبو الحكمة والفلسفة 🏛️',
    quote: 'الحياة غير المختبرة لا تستحق العيش... اسأل وابحث وتعلّم وتفكّر بلا توقف!',
    imageUrl: socratesAvatar,
    fallbackUrl: '/avatars/socrates.jpg',
    accentColor: '#a855f7',
  },
];

// Backward-compatible alias
export const FOOTBALL_AVATARS: AvatarOption[] = ALL_AVATARS;

export const getPlayerAvatar = (id?: string): AvatarOption => {
  return ALL_AVATARS.find((p) => p.id === id) || ALL_AVATARS[0];
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'الكابتن',
  avatarId: 'salah',
  avatarUrl: ALL_AVATARS[0].imageUrl,
  playerTitle: ALL_AVATARS[0].tag,
  quote: ALL_AVATARS[0].quote,
};
