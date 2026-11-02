export type Language = 'ar' | 'en';

export interface Translations {
  // Navigation & Header
  siteTitle: string;
  siteSubtitle: string;
  navTimeWindow: string;
  navTasks: string;
  navSchedule: string;
  navArcade: string;
  themeDark: string;
  themeLight: string;
  resetAll: string;
  resetConfirm: string;
  settings: string;
  editProfile: string;

  // Hero Section
  heroPillTitle: string;
  heroHeadline: string;
  heroHeadlineHighlight: string;
  heroHeadlineRest: string;
  heroSubheadline: string;
  heroSetTimeBtn: string;
  heroAddTaskBtn: string;
  changeBtn: string;

  // Cloud Sync Banner & Settings
  cloudBannerTitle: string;
  cloudBannerSubtitle: string;
  cloudBannerActiveTitle: string;
  cloudBannerActiveSubtitle: string;
  cloudBannerSignInBtn: string;
  cloudSaved: string;
  cloudSaving: string;
  cloudActive: string;
  cloudGoogleBtn: string;
  cloudGoogleSyncNow: string;
  cloudSignOut: string;
  cloudUserLoggedIn: string;
  cloudSyncDescription: string;

  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  settingsAccountTab: string;
  settingsAppearanceTab: string;
  settingsLanguageTab: string;
  settingsSupportTab: string;
  settingsDataTab: string;
  settingsLanguagePrompt: string;
  settingsThemePrompt: string;
  settingsResetPrompt: string;
  settingsResetBtn: string;
  settingsCloseBtn: string;

  // Support & Feedback
  supportTitle: string;
  supportSubtitle: string;
  supportTypeInquiry: string;
  supportTypeSuggestion: string;
  supportTypeIssue: string;
  supportNameLabel: string;
  supportEmailLabel: string;
  supportSubjectLabel: string;
  supportSubjectPlaceholder: string;
  supportMessageLabel: string;
  supportMessagePlaceholder: string;
  supportSendBtn: string;
  supportSending: string;
  supportSuccessNotice: string;
  supportDirectEmailBtn: string;

  // Time Window Card
  timeWindowTitle: string;
  timeWindowSubtitle: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  timeWindowDuration: string;
  timeWindowOvernight: string;
  timeWindowHours: string;
  timeWindowMinutes: string;

  // Task Manifest Card
  tasksTitle: string;
  tasksSubtitle: string;
  tasksCountBadge: string;
  tasksEmptyState: string;
  tasksEmptyHint: string;
  tasksAddButton: string;
  tasksNamePlaceholder: string;
  tasksTopicPlaceholder: string;
  tasksPriorityLabel: string;
  tasksContentTypeLabel: string;
  tasksDurationLabel: string;
  tasksQuestionsCountLabel: string;
  tasksSaveBtn: string;
  tasksCancelBtn: string;
  tasksDeleteConfirm: string;

  // Priorities
  priorityVeryHigh: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;

  // Content Types
  contentTypeVideo: string;
  contentTypeStudy: string;
  contentTypePractice: string;
  contentTypeRevision: string;

  // Generate Section
  generateBtnText: string;
  generateComputingText: string;
  generateFootnote: string;
  emptyTasksWarning: string;
  shortWindowWarning: string;
  trySampleBtn: string;
  goToTasksBtn: string;

  // Schedule Result Matrix
  scheduleMatrixTitle: string;
  scheduleMatrixSubtitle: string;
  totalStudyLabel: string;
  totalBreakLabel: string;
  completionRateLabel: string;
  timelineLabel: string;
  exportPosterBtn: string;
  extendWindowBtn: string;
  breakSlotTitle: string;
  breakSlotSubtitle: string;
  markCompleted: string;
  markIncomplete: string;
  overflowNoticeTitle: string;
  overflowNoticeDesc: string;

  // Poster Modal
  posterTitle: string;
  posterSubtitle: string;
  posterDownloadJpg: string;
  posterDownloadPng: string;
  posterCloseBtn: string;

  // Arcade Section
  arcadeTitle: string;
  arcadeSubtitle: string;
  arcadeShooterTitle: string;
  arcadeSnakeTitle: string;
  arcadeScoreLabel: string;
  arcadeLevelLabel: string;
  arcadeStartBtn: string;
  arcadeRestartBtn: string;
  arcadeGameOver: string;

  // Profile Modal
  profileModalTitle: string;
  profileModalSubtitle: string;
  profileNameLabel: string;
  profileNamePlaceholder: string;
  profileSelectHeroLabel: string;
  profileFilterAll: string;
  profileFilterFootball: string;
  profileFilterSingers: string;
  profileFilterScientists: string;
  profileFilterPhilosophers: string;
  profileSearchPlaceholder: string;
  profileActiveBadge: string;
  profileSaveBtn: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    siteTitle: 'منظم المذاكرة الذكي',
    siteSubtitle: '',
    navTimeWindow: '⏰ النافذة الزمنية',
    navTasks: '📋 المهام والمواد',
    navSchedule: '✨ جدول المذاكرة',
    navArcade: '🎮 لعبة الاستراحة',
    themeDark: 'داكن 🌙',
    themeLight: 'فاتح ☀️',
    resetAll: 'إعادة ضبط',
    resetConfirm: 'هل أنت متأكد من رغبتك في إعادة ضبط كافة البيانات والمهام؟',
    settings: 'الإعدادات',
    editProfile: 'تعديل صورة الحساب والاسم',

    heroPillTitle: 'شخصيتك المفضلة',
    heroHeadline: '«جدول مذاكرتك المنظم والمريح.»',
    heroHeadlineHighlight: 'المنظم والمريح',
    heroHeadlineRest: 'جدول مذاكرتك',
    heroSubheadline:
      'حدد ساعات يومك وأضف المواد، وسيقوم التطبيق بترتيب أفضل جدول لمذاكرتك مع فترات راحة مناسبة وحفظه كصورة.',
    heroSetTimeBtn: 'تحديد وقت المذاكرة',
    heroAddTaskBtn: '+ إضافة مادة جديدة',
    changeBtn: 'تغيير',

    cloudBannerTitle: 'احفظ جدولك عبر جميع أجهزتك (الموبايل، الكمبيوتر، التابلت)',
    cloudBannerSubtitle:
      'سجّل دخولك بحساب Google بضغطة زر واحدة لتفتح جدولك في أي وقت ومن أي جهاز.',
    cloudBannerActiveTitle: 'حفظ البيانات مفعل تلقائياً!',
    cloudBannerActiveSubtitle: 'مرتبط بحساب Google: يتم حفظ كل تعديل تلقائياً وبأمان.',
    cloudBannerSignInBtn: 'تسجيل الدخول بـ Google',
    cloudSaved: 'تم الحفظ ☁️',
    cloudSaving: 'جاري الحفظ...',
    cloudActive: 'محفوظ على جميع أجهزتك',
    cloudGoogleBtn: 'حساب Google',
    cloudGoogleSyncNow: 'حفظ التغييرات الآن',
    cloudSignOut: 'تسجيل الخروج',
    cloudUserLoggedIn: 'مستخدم مسجل',
    cloudSyncDescription:
      'سجّل دخولك بحساب Google بضغطة واحدة ليتم حفظ جدولك ومهامك تلقائياً والوصول إليها من أي هاتف أو كمبيوتر.',

    settingsTitle: 'الإعدادات ⚙️',
    settingsSubtitle: 'حساب Google، حفظ البيانات، اللغة، ومظهر التطبيق',
    settingsAccountTab: 'حساب Google وحفظ البيانات ☁️',
    settingsAppearanceTab: 'المظهر (داكن / فاتح)',
    settingsLanguageTab: 'اللغة / Language',
    settingsSupportTab: 'تواصل مع المطور والمقترحات',
    settingsDataTab: 'إعادة ضبط البيانات',
    settingsLanguagePrompt: 'اختر لغة التطبيق:',
    settingsThemePrompt: 'اختر المظهر المفضل:',
    settingsResetPrompt: 'مسح كافة المواد والجدول والبدء من جديد:',
    settingsResetBtn: 'مسح كافة البيانات',
    settingsCloseBtn: 'إغلاق',

    supportTitle: 'الدعم الفني والمقترحات 🎧',
    supportSubtitle:
      'لديك سؤال أو اقتراح أو تواجه مشكلة؟ أرسل رسالتك وسيرد عليك المطور مباشرة هنا في الإشعارات.',
    supportTypeInquiry: 'استفسار ❓',
    supportTypeSuggestion: 'اقتراح وتطوير 💡',
    supportTypeIssue: 'مشكلة تقنية ⚠️',
    supportNameLabel: 'اسمك:',
    supportEmailLabel: 'بريدك الإلكتروني للرد عليك:',
    supportSubjectLabel: 'عنوان الاستفسار أو الاقتراح:',
    supportSubjectPlaceholder: 'مثال: اقتراح إضافة مؤقت تركيز مدمج...',
    supportMessageLabel: 'تفاصيل الرسالة أو الاقتراح:',
    supportMessagePlaceholder: 'اكتب استفسارك أو تفاصيل اقتراحك هنا بكل وضوح...',
    supportSendBtn: 'إرسال الرسالة إلى الدعم الفني',
    supportSending: 'جاري إرسال الرسالة...',
    supportSuccessNotice: 'تم إرسال رسالتك بنجاح إلى الدعم الفني! سيتم الرد عليك في أقرب وقت.',
    supportDirectEmailBtn: 'إرسال مباشر عبر تطبيق الإيميل / Gmail',

    timeWindowTitle: 'الوقت المتاح للمذاكرة اليوم',
    timeWindowSubtitle: 'حدد الوقت الفعلي المتاح لك اليوم من البداية حتى النهاية',
    timeWindowStart: 'وقت بدء المذاكرة',
    timeWindowEnd: 'وقت إنهاء المذاكرة',
    timeWindowDuration: 'إجمالي الساعات المتاحة',
    timeWindowOvernight: 'يمتد إلى اليوم التالي (بعد منتصف الليل)',
    timeWindowHours: 'ساعات',
    timeWindowMinutes: 'دقائق',

    tasksTitle: 'المواد والدروس',
    tasksSubtitle: 'أضف المواد التي ترغب في مذاكرتها اليوم',
    tasksCountBadge: 'مواد مضافة',
    tasksEmptyState: 'لا توجد أي مواد مضافة حالياً!',
    tasksEmptyHint: 'أضف المواد التي تريد إنجازها اليوم للبدء في ترتيب جدولك.',
    tasksAddButton: 'إضافة مادة جديدة',
    tasksNamePlaceholder: 'اسم المادة (مثال: فيزياء، لغة عربية، كيمياء...)',
    tasksTopicPlaceholder: 'الدرس أو الموضوع (مثال: الفصل الثالث)',
    tasksPriorityLabel: 'درجة الأولوية والأهمية',
    tasksContentTypeLabel: 'نوع المحتوى الدراسي',
    tasksDurationLabel: 'مدة المذاكرة أو الفيديو المطلوب',
    tasksQuestionsCountLabel: 'عدد الأسئلة والتمارين',
    tasksSaveBtn: 'حفظ المادة',
    tasksCancelBtn: 'إلغاء',
    tasksDeleteConfirm: 'هل تريد حذف هذه المادة؟',

    priorityVeryHigh: 'عالية جداً 🔴',
    priorityHigh: 'عالية 🟠',
    priorityMedium: 'متوسطة 🟡',
    priorityLow: 'منخفضة 🟢',

    contentTypeVideo: 'فيديو شرح',
    contentTypeStudy: 'مذاكرة وحفظ نظري',
    contentTypePractice: 'حل تدريبات وأسئلة',
    contentTypeRevision: 'مراجعة وتلخيص',

    generateBtnText: '✦ إنشاء جدول المذاكرة',
    generateComputingText: 'جاري ترتيب الجدول...',
    generateFootnote:
      'يتم توزيع أوقات المذاكرة وفترات الراحة تلقائياً وبشكل مريح لتذاكر بتركيز وبدون تعب.',
    emptyTasksWarning:
      'لم تقم بإضافة أي مواد بعد! يرجى إضافة مادة دراسية واحدة على الأقل لإنشاء الجدول.',
    shortWindowWarning:
      'الوقت المحدد قصير جداً (أقل من 30 دقيقة). يرجى زيادة وقت المذاكرة.',
    trySampleBtn: '⚡ تجربة مادة جاهزة (إنجليزي 3 ساعات)',
    goToTasksBtn: '➕ إضافة مادة جديدة',

    scheduleMatrixTitle: 'جدول المذاكرة 📊',
    scheduleMatrixSubtitle: 'تم ترتيب أوقات المذاكرة وفترات الراحة لراحتك وتركيزك',
    totalStudyLabel: 'وقت المذاكرة الفعلي',
    totalBreakLabel: 'وقت الاستراحة',
    completionRateLabel: 'نسبة الإنجاز',
    timelineLabel: 'ترتيب اليوم',
    exportPosterBtn: 'إنشاء الجدول كصورة 📱',
    extendWindowBtn: 'إضافة ساعة إضافية ⏰',
    breakSlotTitle: 'استراحة قصيرة',
    breakSlotSubtitle: 'خذ استراحة والعب لعبة سريعة بالأسفل لتجديد نشاطك 🎮',
    markCompleted: 'تم الإنجاز ✓',
    markIncomplete: 'قيد الانتظار',
    overflowNoticeTitle: 'تنبيه: الوقت لا يكفي لكل المواد المضافة',
    overflowNoticeDesc: 'تمت جدولة المواد الأهم أولاً، يمكنك زيادة الوقت أو تقليل ساعات المواد.',

    posterTitle: 'صورة وخلفية الجدول 📱',
    posterSubtitle: 'احفظ جدولك كصورة واضحة لشاشة هاتفك أو كمبيوترك',
    posterDownloadJpg: 'تحميل كصورة JPG',
    posterDownloadPng: 'تحميل كصورة PNG',
    posterCloseBtn: 'إغلاق المعاينة',

    arcadeTitle: 'ألعاب الاستراحة 🎮',
    arcadeSubtitle: 'ألعاب سريعة وبسيطة للاستراحة وتجديد النشاط',
    arcadeShooterTitle: 'لعبة الفضاء',
    arcadeSnakeTitle: 'لعبة الثعبان',
    arcadeScoreLabel: 'النقاط',
    arcadeLevelLabel: 'المستوى',
    arcadeStartBtn: 'ابدأ اللعب الآن',
    arcadeRestartBtn: 'إعادة المحاولة',
    arcadeGameOver: 'انتهت اللعبة!',

    profileModalTitle: 'اختر صورتك الشخصية 🌟',
    profileModalSubtitle: 'شخصيات رياضية وفنية وعلمية تحفيزية',
    profileNameLabel: 'اسمك أو لقبك المفضل داخل التطبيق:',
    profileNamePlaceholder: 'مثال: الكابتن أحمد / صانع الألعاب',
    profileSelectHeroLabel: 'اختر شخصيتك الملهمة المفضلة:',
    profileFilterAll: 'الكل',
    profileFilterFootball: 'نجوم الكرة',
    profileFilterSingers: 'عمالقة الغناء',
    profileFilterScientists: 'كبار العلماء',
    profileFilterPhilosophers: 'الفلاسفة',
    profileSearchPlaceholder: 'ابحث عن شخصية بالاسم أو المجال...',
    profileActiveBadge: 'نشط',
    profileSaveBtn: 'حفظ واختيار الشخصية',
  },
  en: {
    siteTitle: 'Smart Study Planner',
    siteSubtitle: '',
    navTimeWindow: '⏰ Time Window',
    navTasks: '📋 Study Tasks',
    navSchedule: '✨ Study Schedule',
    navArcade: '🎮 Break Arcade',
    themeDark: 'Dark 🌙',
    themeLight: 'Light ☀️',
    resetAll: 'Reset',
    resetConfirm: 'Are you sure you want to reset all data and tasks?',
    settings: 'Settings',
    editProfile: 'Edit Avatar and Name',

    heroPillTitle: 'Your Inspiring Cartoon Avatar',
    heroHeadline: '"This is not just a study plan... It is a futuristic study schedule."',
    heroHeadlineHighlight: 'futuristic study schedule',
    heroHeadlineRest: 'This is not just a study plan...',
    heroSubheadline:
      'Enter your available study window, and our intelligent engine will calibrate your optimal schedule: balancing subject priorities, video durations, and smart micro-breaks with 1920×1080 wallpaper poster export.',
    heroSetTimeBtn: 'Set Study Hours',
    heroAddTaskBtn: '+ Add New Subject',
    changeBtn: 'Change',

    cloudBannerTitle: 'Save your schedule & tasks across all your devices (Phone, Laptop, Tablet)',
    cloudBannerSubtitle:
      'Sign in with Google in one click to access and synchronize your study schedule anytime, anywhere.',
    cloudBannerActiveTitle: 'Multi-Device Cloud Synchronization Active!',
    cloudBannerActiveSubtitle: 'Connected with Google account: Changes are saved and synced automatically.',
    cloudBannerSignInBtn: 'Sign in with Google',
    cloudSaved: 'Cloud Synced ☁️',
    cloudSaving: 'Saving...',
    cloudActive: 'Active Across Devices',
    cloudGoogleBtn: 'Google Account',
    cloudGoogleSyncNow: 'Sync Now',
    cloudSignOut: 'Sign Out',
    cloudUserLoggedIn: 'Signed In User',
    cloudSyncDescription:
      'Every edit in your tasks and schedule is automatically synced to the cloud so you can open it on any phone or laptop.',

    settingsTitle: 'System Settings ⚙️',
    settingsSubtitle: 'Sign in with Google, Automatic Cloud Backup, Language & Theme',
    settingsAccountTab: 'Sign in with Google ☁️',
    settingsAppearanceTab: 'Appearance',
    settingsLanguageTab: 'Language / اللغة',
    settingsSupportTab: 'Support & Inquiries',
    settingsDataTab: 'Data & Security',
    settingsLanguagePrompt: 'Select application interface language:',
    settingsThemePrompt: 'Choose display mode:',
    settingsResetPrompt: 'Reset all tasks and schedule to initial state:',
    settingsResetBtn: 'Full Data Reset',
    settingsCloseBtn: 'Close',

    supportTitle: 'Technical Support & Feedback 🎧',
    supportSubtitle:
      'Have an inquiry, feature suggestion, or technical issue? Send your message and the developer will respond directly inside the app & notifications.',
    supportTypeInquiry: 'Inquiry ❓',
    supportTypeSuggestion: 'Suggestion 💡',
    supportTypeIssue: 'Technical Issue ⚠️',
    supportNameLabel: 'Your Name:',
    supportEmailLabel: 'Your Email for Replies:',
    supportSubjectLabel: 'Subject of Inquiry / Suggestion:',
    supportSubjectPlaceholder: 'e.g. Suggestion for built-in Pomodoro timer...',
    supportMessageLabel: 'Message Details:',
    supportMessagePlaceholder: 'Describe your inquiry or suggestion clearly here...',
    supportSendBtn: 'Send Message to Support',
    supportSending: 'Sending message...',
    supportSuccessNotice: 'Your message has been sent successfully! Our team will get back to you shortly.',
    supportDirectEmailBtn: 'Send directly via Email App / Gmail',

    timeWindowTitle: 'Total Study Time Window',
    timeWindowSubtitle: 'Specify the available study hours today from start to finish',
    timeWindowStart: 'Study Start Time',
    timeWindowEnd: 'Study End Time',
    timeWindowDuration: 'Total Available Hours',
    timeWindowOvernight: 'Extends to next day (past midnight)',
    timeWindowHours: 'hours',
    timeWindowMinutes: 'mins',

    tasksTitle: 'Subjects & Study Tasks Manifest',
    tasksSubtitle: 'Add the subjects you plan to study with their priorities and content types',
    tasksCountBadge: 'tasks added',
    tasksEmptyState: 'No subjects added yet!',
    tasksEmptyHint: 'Add subjects you want to accomplish today to generate your intelligent schedule.',
    tasksAddButton: 'Add New Subject',
    tasksNamePlaceholder: 'Subject Name (e.g. Physics, Math, Chemistry...)',
    tasksTopicPlaceholder: 'Lesson or Topic (e.g. Chapter 3 - Electromagnetism)',
    tasksPriorityLabel: 'Priority & Importance Level',
    tasksContentTypeLabel: 'Study Content Type',
    tasksDurationLabel: 'Required Study Duration or Video Length',
    tasksQuestionsCountLabel: 'Number of Practice Questions',
    tasksSaveBtn: 'Save Subject',
    tasksCancelBtn: 'Cancel',
    tasksDeleteConfirm: 'Do you want to delete this subject?',

    priorityVeryHigh: 'Critical 🔴',
    priorityHigh: 'High 🟠',
    priorityMedium: 'Medium 🟡',
    priorityLow: 'Low 🟢',

    contentTypeVideo: 'Video Lecture (Fixed Length)',
    contentTypeStudy: 'Deep Theoretical Study',
    contentTypePractice: 'Exercises & Problem Solving',
    contentTypeRevision: 'Review & Summary Notes',

    generateBtnText: '✦ Generate Study Schedule',
    generateComputingText: 'Calibrating and engineering time...',
    generateFootnote:
      'Automatic micro-breaks and smart interval distributions are calculated based on advanced Pomodoro science',
    emptyTasksWarning:
      'Subject list is completely empty! Please add at least one subject in the Study Tasks section to generate your schedule.',
    shortWindowWarning:
      'The selected study duration is too short (less than 30 minutes). Please adjust the start or end time.',
    trySampleBtn: '⚡ Try Sample Task (English 3 hours)',
    goToTasksBtn: '➕ Jump to Tasks Section to Add Subject',

    scheduleMatrixTitle: 'Study Schedule 📊',
    scheduleMatrixSubtitle: 'Tasks and refreshment breaks distributed with precision following cognitive science',
    totalStudyLabel: 'Total Pure Study Time',
    totalBreakLabel: 'Total Smart Breaks',
    completionRateLabel: 'Daily Completion Rate',
    timelineLabel: 'Chronological Timeline of Tasks & Breaks',
    exportPosterBtn: 'Export 1920×1080 Poster 🖼️',
    extendWindowBtn: 'Extend Time Window by +1 Hour ⏰',
    breakSlotTitle: 'Refreshment & Energy Recharge',
    breakSlotSubtitle: 'Play the break arcade game below to recharge your mind 🎮',
    markCompleted: 'Completed ✓',
    markIncomplete: 'Pending',
    overflowNoticeTitle: 'Notice: Available time is insufficient for all subjects',
    overflowNoticeDesc: 'Higher priority subjects were scheduled first. You can extend your window or reduce task durations.',

    posterTitle: '1920×1080 High-Res Study Schedule Poster',
    posterSubtitle: 'Download high quality wallpaper for your desktop screen or print as a motivational poster',
    posterDownloadJpg: 'Download as JPG',
    posterDownloadPng: 'Download as PNG',
    posterCloseBtn: 'Close Preview',

    arcadeTitle: 'Break Arcade 🎮',
    arcadeSubtitle: 'Enjoy fun break intervals to clear your mind and recharge neural focus',
    arcadeShooterTitle: 'Space Shooter (50 Levels)',
    arcadeSnakeTitle: 'Cyber Snake Classic',
    arcadeScoreLabel: 'Score',
    arcadeLevelLabel: 'Level',
    arcadeStartBtn: 'Start Playing Now',
    arcadeRestartBtn: 'Retry Game',
    arcadeGameOver: 'Game Over!',

    profileModalTitle: 'Choose Your Inspiring Avatar 🌟',
    profileModalSubtitle: 'Football Legends, Egyptian Music Icons, Great Scientists & Renowned Philosophers',
    profileNameLabel: 'Your in-app display name or title:',
    profileNamePlaceholder: 'e.g. Captain Ahmed / Playmaker',
    profileSelectHeroLabel: 'Choose your inspiring figure:',
    profileFilterAll: 'All',
    profileFilterFootball: 'Football',
    profileFilterSingers: 'Music Icons',
    profileFilterScientists: 'Scientists',
    profileFilterPhilosophers: 'Philosophers',
    profileSearchPlaceholder: 'Search by name or field...',
    profileActiveBadge: 'Active',
    profileSaveBtn: 'Save & Select Avatar',
  },
};
