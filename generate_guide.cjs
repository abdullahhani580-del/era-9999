const fs = require("fs");
const { execSync } = require("child_process");

// Helper to escape XML
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Wrap Arabic text into lines
function wrapArabicText(text, maxChars = 34) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxChars) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

const screens = [
  {
    id: 1,
    title: "١. الصفحة الرئيسية وبطاقة التحفيز",
    subtitle: "Hero Section & Motivation Card",
    badge: "نقطة البداية",
    badgeColor: "#38bdf8",
    file: "public/assets/aistudio/Screenshot_20261031_135943_com_android_chrome_ChromeTabbedActivity_cd2b1574.jpg",
    callouts: [
      {
        num: "١",
        label: "بطاقة التحفيز اليومية",
        desc: "رسائل تشجيعية متجددة (الملك المصري 👑) لبث روح الحماس والإيجابية للالتزام بالمذاكرة.",
        pointerY: 0.16
      },
      {
        num: "٢",
        label: "العنوان التوجيهي وفلسفة المنظم",
        desc: "يوضح للطالب طريقة عمل الموقع: ترتيب ساعات اليوم تلقائياً مع فترات راحة مريحة.",
        pointerY: 0.28
      },
      {
        num: "٣",
        label: "أزرار الانطلاق السريع",
        desc: "زر «تحديد وقت المذاكرة ↓» للانتقال الفوري، وزر «+ إضافة مادة جديدة» لإدخال الدروس.",
        pointerY: 0.40
      },
      {
        num: "٤",
        label: "شبكة الخطوات الأربعة الإرشادية",
        desc: "أدلة سريعة (01 وقت المذاكرة، 02 المواد، 03 الترتيب، 04 حفظ الجدول كصورة).",
        pointerY: 0.55
      }
    ]
  },
  {
    id: 2,
    title: "٢. تحديد وقت المذاكرة المتاح اليوم",
    subtitle: "Study Window & Hours Calculator",
    badge: "تحديد الوقت",
    badgeColor: "#60a5fa",
    file: "public/assets/aistudio/Screenshot_20261031_135946_com_android_chrome_ChromeTabbedActivity_a45b262b.jpg",
    callouts: [
      {
        num: "١",
        label: "حقل وقت بداية المذاكرة",
        desc: "اختيار ساعة البداية بالضبط (مثل 03:45 م) بالساعات والدقائق ونظام صباحاً ومساءً.",
        pointerY: 0.36
      },
      {
        num: "٢",
        label: "حقل وقت نهاية المذاكرة",
        desc: "تحديد وقت ختام المذاكرة لليوم (مثل 10:00 م) لمنع التسويف والالتزام بالجدول.",
        pointerY: 0.46
      },
      {
        num: "٣",
        label: "حساب الوقت الإجمالي تلقائياً",
        desc: "يحسب النظام فوراً فارق الوقت الصافي (6 ساعات و 15 دقيقة) لتوزيع المواد بناءً عليه.",
        pointerY: 0.28
      },
      {
        num: "٤",
        label: "تأكيد واستمرار للخطوة التالية",
        desc: "الانتقال المباشر لقسم المواد مع حفظ النطاق الزمني المحدد في السحابة.",
        pointerY: 0.60
      }
    ]
  },
  {
    id: 3,
    title: "٣. قائمة المواد والدروس وإدارتها",
    subtitle: "Subjects Manifest & Priority Tags",
    badge: "إدارة المهام",
    badgeColor: "#f59e0b",
    file: "public/assets/aistudio/Screenshot_20261031_135950_com_android_chrome_ChromeTabbedActivity_e0c840b4.jpg",
    callouts: [
      {
        num: "١",
        label: "زر إضافة مادة جديدة (+)",
        desc: "زر بارز في الأعلى لفتح نافذة إدخال مادة جديدة وتحديد مدتها ونوعها وأولويتها.",
        pointerY: 0.17
      },
      {
        num: "٢",
        label: "وسم الأولوية الذكي",
        desc: "شارة ملونة (عالية جداً / متوسطة / منخفضة) لتوجيه خوارزمية الترتيب وتقديم الأهم.",
        pointerY: 0.30
      },
      {
        num: "٣",
        label: "تمييز نوع المحتوى ومدته",
        desc: "فيديوهات ودروس بالساعات (01:00:00 / 02:00:00) أو حل تدريبات بالأسئلة (4 سؤال • 45 د).",
        pointerY: 0.42
      },
      {
        num: "٤",
        label: "أزرار التحكم (تعديل، حذف، أسهم)",
        desc: "أيقونة القلم للتعديل، وسلة المهملات للحذف، والأسهم لتغيير تسلسل المواد يدوياً.",
        pointerY: 0.52
      }
    ]
  },
  {
    id: 4,
    title: "٤. إنشاء الجدول ولوحة الإحصائيات",
    subtitle: "Schedule Generation & 4 Key Metrics",
    badge: "الجدولة الذكية",
    badgeColor: "#a855f7",
    file: "public/assets/aistudio/Screenshot_20261031_135954_com_android_chrome_ChromeTabbedActivity_4a025d3b.jpg",
    callouts: [
      {
        num: "١",
        label: "زر إنشاء جدول المذاكرة المتدرج",
        desc: "الزر الأساسي: يوزع المواد تلقائياً مع فترات راحة مريحة بدون أي إرهاق ذهني.",
        pointerY: 0.14
      },
      {
        num: "٢",
        label: "أزرار التحكم الأربعة بالجدول",
        desc: "«بدء المذاكرة ▶» (للمؤقت)، «ملء الشاشة ⤢»، «إنشاء الجدول كصورة 📥»، و«إعادة ترتيب ↻».",
        pointerY: 0.35
      },
      {
        num: "٣",
        label: "بطاقات وقت المذاكرة ووقت الراحة",
        desc: "إحصائية صافي وقت المذاكرة (3 ساعات و 45 دقيقة) وإجمالي وقت الراحة (55 دقيقة).",
        pointerY: 0.47
      },
      {
        num: "٤",
        label: "نسبة الإنجاز وعدد الجلسات",
        desc: "عداد الجلسات (4 جلسات) مع شريط نسبة الإنجاز والتقدم الفعلي (%25 1/4).",
        pointerY: 0.57
      }
    ]
  },
  {
    id: 5,
    title: "٥. الخط الزمني وفواصل الراحة الذكية",
    subtitle: "Interactive Timeline & Pomodoro Breaks",
    badge: "الخط الزمني",
    badgeColor: "#10b981",
    file: "public/assets/aistudio/Screenshot_20261031_140001_com_android_chrome_ChromeTabbedActivity_3489b8b8.jpg",
    callouts: [
      {
        num: "١",
        label: "بطاقات جلسات المذاكرة المجدولة",
        desc: "توضح توقيت كل جلسة بدقة (مثل 5:05 م إلى 5:50 م)، اسم المادة، والمدة.",
        pointerY: 0.36
      },
      {
        num: "٢",
        label: "زر بدء الجلسة المباشر (▶)",
        desc: "زر تشغيل مباشر داخل كل مادة يفتح مؤقت التركيز المخصص فوراً بنقرة واحدة.",
        pointerY: 0.39
      },
      {
        num: "٣",
        label: "فواصل استراحة بومودورو الذكية",
        desc: "بطاقات خضراء فاصلة بين المواد (استراحة 15 د أو 20 د) لتجديد النشاط والتركيز.",
        pointerY: 0.48
      },
      {
        num: "٤",
        label: "دوائر تتبع ومطابقة الإنجاز",
        desc: "تتغير حالة الدائرة واللون تلقائياً عند إتمام الجلسة لتوثيق تقدم الطالب فورياً.",
        pointerY: 0.62
      }
    ]
  },
  {
    id: 6,
    title: "٦. مؤقت جلسة التركيز (حل التدريبات)",
    subtitle: "Focus Session Timer & Question Tracker",
    badge: "وضع التركيز",
    badgeColor: "#06b6d4",
    file: "public/assets/aistudio/Screenshot_20261031_140007_com_android_chrome_ChromeTabbedActivity_8c6a32ae.jpg",
    callouts: [
      {
        num: "١",
        label: "حلقة المؤقت التنازلي الدائرية",
        desc: "عداد رقمي كبير (45:00) مع شريط تقدم دائري يساعد على الانضباط والتركيز الكامل.",
        pointerY: 0.44
      },
      {
        num: "٢",
        label: "تتبع الأسئلة والتدريبات",
        desc: "عرض تفاصيل المهمة (عربي - تعبير: حل 4 سؤال) وحساب الوقت المخصص للحل.",
        pointerY: 0.25
      },
      {
        num: "٣",
        label: "أزرار التحكم في وقت الجلسة",
        desc: "زر التشغيل والإيقاف المؤقت، زر إضافة +5 دقائق عند الحاجة، وزر إعادة الوقت.",
        pointerY: 0.54
      },
      {
        num: "٤",
        label: "زر «تم إنهاء الجلسة» وحفظ التقدم",
        desc: "زر نهائي لاعتماد الجلسة ناجحة، وتسجيلها في الإحصائيات وفتح شاشة الاستراحة.",
        pointerY: 0.60
      }
    ]
  },
  {
    id: 7,
    title: "٧. شاشة الاستراحة وألعاب الترويق",
    subtitle: "Break Time Timer & Relax Arcade",
    badge: "وقت الترويق",
    badgeColor: "#34d399",
    file: "public/assets/aistudio/Screenshot_20261031_140011_com_android_chrome_ChromeTabbedActivity_12c12b17.jpg",
    callouts: [
      {
        num: "١",
        label: "مؤقت الاستراحة الأخضر المهدئ",
        desc: "عداد تنازلي مريح للعين (15:00) مصمم علمياً لتهدئة الدماغ بعد جلسة التركيز.",
        pointerY: 0.44
      },
      {
        num: "٢",
        label: "رسالة التنشيط الذهني (Neural Recharge)",
        desc: "توصيات فورية بالراحة، شرب الماء، والتنفس العميق لاستعادة الطاقة والنشاط.",
        pointerY: 0.27
      },
      {
        num: "٣",
        label: "زر «🎮 العب لعبة الترويق» (Break Arcade)",
        desc: "يفتح ألعاباً ترفيهية خفيفة وسريعة (Tic-Tac-Toe, Simon, Memory) تنعش الدماغ وتزيل الملل.",
        pointerY: 0.62
      },
      {
        num: "٤",
        label: "خيارات التحكم في مدة الاستراحة",
        desc: "إمكانية إضافة +5 دقائق للاستراحة أو إنهائها مبكراً لبدء الجلسة التالية مباشرة.",
        pointerY: 0.54
      }
    ]
  },
  {
    id: 8,
    title: "٨. الإعدادات وحفظ السحاب بحساب Google",
    subtitle: "Settings, Cloud Sync & Preferences",
    badge: "خيارات التطبيق",
    badgeColor: "#ec4899",
    file: "public/assets/aistudio/Screenshot_20261031_135939_com_android_chrome_ChromeTabbedActivity_615bb0e9.jpg",
    callouts: [
      {
        num: "١",
        label: "بطاقة الحساب والمزامنة السحابية",
        desc: "تخزين تلقائي بحساب Google (Abdullah Hani) مع شارة خضراء «حفظ البيانات مفعل».",
        pointerY: 0.25
      },
      {
        num: "٢",
        label: "اختيار لغة التطبيق (العربية)",
        desc: "دعم لغوي متكامل للواجهات مع ضبط اتجاه النصوص والقوائم من اليمين إلى اليسار.",
        pointerY: 0.36
      },
      {
        num: "٣",
        label: "مفتاح النمط الداكن (Dark Mode)",
        desc: "زر تبديل بين النمط الليلي المريح للعين والنمط النهاري لحماية البصر أثناء المذاكرة.",
        pointerY: 0.41
      },
      {
        num: "٤",
        label: "الدعم الفني ولوحة المطور (ADMIN)",
        desc: "قنوات تواصل مباشر للمساعدة، وزر خاص بلوحة تحكم المشرف لإدارة وتطوير النظام.",
        pointerY: 0.49
      }
    ]
  }
];

function generateCard(sc, cardX, cardY, COL_W, ROW_H) {
  const imgB64 = fs.readFileSync(sc.file).toString("base64");

  const phoneW = 860;
  const phoneH = 1910;
  const phoneX = cardX + 40;
  const phoneY = cardY + 180;

  const explX = cardX + phoneW + 65;
  const explW = COL_W - phoneW - 115; // ~820px
  const explY = cardY + 180;

  let calloutsSvg = "";
  sc.callouts.forEach((co, cIdx) => {
    const boxY = explY + (cIdx * 450);
    const boxH = 410;

    const targetY = phoneY + (phoneH * co.pointerY);
    const startX = explX - 10;
    const endX = phoneX + phoneW - 25;

    const wrappedLines = wrapArabicText(co.desc, 32);
    let tspans = "";
    wrappedLines.forEach((line, lIdx) => {
      tspans += `<text x="${explX + explW - 35}" y="${boxY + 145 + (lIdx * 40)}" font-family="Noto Sans Arabic" font-size="24" fill="#cbd5e1" font-weight="normal" text-anchor="end">${escapeXml(line)}</text>`;
    });

    calloutsSvg += `
      <!-- Pointer line & arrow -->
      <g>
        <path d="M ${startX} ${boxY + 60} Q ${(startX + endX)/2} ${boxY + 60}, ${endX} ${targetY}" 
              fill="none" stroke="${sc.badgeColor}" stroke-width="4.5" stroke-dasharray="8,6" opacity="0.9"/>
        <circle cx="${endX}" cy="${targetY}" r="16" fill="${sc.badgeColor}" stroke="#ffffff" stroke-width="3.5"/>
        <text x="${endX}" y="${targetY + 6}" font-family="Noto Sans Arabic" font-size="14" fill="#090d16" font-weight="900" text-anchor="middle">${co.num}</text>
      </g>

      <!-- Explanation Card Box -->
      <g>
        <rect x="${explX}" y="${boxY}" width="${explW}" height="${boxH}" rx="24" fill="#0d1527" stroke="${sc.badgeColor}" stroke-width="2.5"/>
        
        <!-- Header badge -->
        <rect x="${explX + explW - 95}" y="${boxY + 25}" width="65" height="46" rx="14" fill="${sc.badgeColor}"/>
        <text x="${explX + explW - 62}" y="${boxY + 57}" font-family="Noto Sans Arabic" font-size="24" fill="#090d16" font-weight="900" text-anchor="middle">${co.num}</text>
        
        <!-- Title -->
        <text x="${explX + explW - 115}" y="${boxY + 58}" font-family="Noto Sans Arabic" font-size="28" fill="#ffffff" font-weight="bold" text-anchor="end">${escapeXml(co.label)}</text>
        
        <!-- Divider -->
        <line x1="${explX + 30}" y1="${boxY + 95}" x2="${explX + explW - 30}" y2="${boxY + 95}" stroke="#1e293b" stroke-width="2"/>
        
        <!-- Description lines -->
        ${tspans}
      </g>
    `;
  });

  return `
    <g id="card-${sc.id}">
      <rect x="${cardX}" y="${cardY}" width="${COL_W}" height="${ROW_H - 40}" rx="36" fill="#090d1a" stroke="#1e293b" stroke-width="3"/>
      
      <rect x="${cardX}" y="${cardY}" width="${COL_W}" height="140" rx="36" fill="#0d1527"/>
      <rect x="${cardX}" y="${cardY + 100}" width="${COL_W}" height="40" fill="#0d1527"/>
      <line x1="${cardX}" y1="${cardY + 140}" x2="${cardX + COL_W}" y2="${cardY + 140}" stroke="#1e293b" stroke-width="2"/>

      <circle cx="${cardX + COL_W - 75}" cy="${cardY + 70}" r="40" fill="${sc.badgeColor}"/>
      <text x="${cardX + COL_W - 75}" y="${cardY + 84}" font-family="Noto Sans Arabic" font-size="34" fill="#090d16" font-weight="900" text-anchor="middle">${sc.id}</text>

      <text x="${cardX + COL_W - 135}" y="${cardY + 72}" font-family="Noto Sans Arabic" font-size="34" fill="#ffffff" font-weight="bold" text-anchor="end">${escapeXml(sc.title)}</text>
      <text x="${cardX + COL_W - 135}" y="${cardY + 112}" font-family="Noto Sans Arabic" font-size="20" fill="#94a3b8" font-weight="normal" text-anchor="end">${escapeXml(sc.subtitle)}</text>

      <rect x="${cardX + 40}" y="${cardY + 45}" width="200" height="50" rx="25" fill="#1e293b" stroke="${sc.badgeColor}" stroke-width="2"/>
      <text x="${cardX + 140}" y="${cardY + 77}" font-family="Noto Sans Arabic" font-size="21" fill="${sc.badgeColor}" font-weight="bold" text-anchor="middle">${escapeXml(sc.badge)}</text>

      <rect x="${phoneX - 8}" y="${phoneY - 8}" width="${phoneW + 16}" height="${phoneH + 16}" rx="32" fill="#030712" stroke="${sc.badgeColor}" stroke-width="4"/>
      <image href="data:image/jpeg;base64,${imgB64}" x="${phoneX}" y="${phoneY}" width="${phoneW}" height="${phoneH}" preserveAspectRatio="xMidYMid meet"/>

      ${calloutsSvg}
    </g>
  `;
}

// 1. Build Single Master Image (All 8 Screens: 3840 x 9200)
console.log("Generating Single Master Infographic SVG...");
const COL_W = 1840;
const ROW_H = 2150;
const CANVAS_W = 3840;
const CANVAS_H = 430 + (4 * ROW_H) + 190;

let masterCardsSvg = "";
screens.forEach((sc, idx) => {
  const isRightCol = (idx % 2 === 0);
  const cardX = isRightCol ? (CANVAS_W - COL_W - 60) : 60;
  const row = Math.floor(idx / 2);
  const cardY = 430 + (row * ROW_H) + 20;
  masterCardsSvg += generateCard(sc, cardX, cardY, COL_W, ROW_H);
});

const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CANVAS_W}" height="${CANVAS_H}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#040711"/>
      <stop offset="50%" stop-color="#080e1e"/>
      <stop offset="100%" stop-color="#03050c"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
  </defs>

  <rect width="${CANVAS_W}" height="${CANVAS_H}" fill="url(#bgGrad)"/>

  <g id="main-header">
    <rect x="60" y="40" width="${CANVAS_W - 120}" height="340" rx="36" fill="#0b1329" stroke="#1e293b" stroke-width="3"/>
    <rect x="60" y="40" width="${CANVAS_W - 120}" height="10" rx="5" fill="url(#headerGrad)"/>

    <rect x="${CANVAS_W / 2 - 220}" y="75" width="440" height="52" rx="26" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="${CANVAS_W / 2}" y="110" font-family="Noto Sans Arabic" font-size="24" fill="#38bdf8" font-weight="bold" text-anchor="middle">✨ الدليل الإرشادي التفاعلي الشامل</text>

    <text x="${CANVAS_W / 2}" y="195" font-family="Noto Sans Arabic" font-size="52" fill="#ffffff" font-weight="900" text-anchor="middle">خريطة وشرح جميع شاشات وأدوات مُنظّم المذاكرة الذكي ERA</text>
    
    <text x="${CANVAS_W / 2}" y="255" font-family="Noto Sans Arabic" font-size="26" fill="#94a3b8" font-weight="normal" text-anchor="middle">شرح تفصيلي لوظيفة كل شاشة، قسم، زر، وأداة من لقطات الشاشة الحقيقية للتطبيق لمساعدة أي طالب على فهم واستخدام الموقع فوراً</text>
    
    <text x="${CANVAS_W / 2}" y="315" font-family="Noto Sans Arabic" font-size="21" fill="#64748b" font-weight="bold" text-anchor="middle">
      ١. الرئيسية  ⟵  ٢. تحديد الوقت  ⟵  ٣. إضافة المواد  ⟵  ٤. إنشاء الجدول  ⟵  ٥. الخط الزمني  ⟵  ٦. مؤقت التركيز  ⟵  ٧. ألعاب الترويق  ⟵  ٨. الإعدادات
    </text>
  </g>

  ${masterCardsSvg}

  <g id="footer" transform="translate(0, ${CANVAS_H - 160})">
    <rect x="60" y="0" width="${CANVAS_W - 120}" height="120" rx="28" fill="#0b1329" stroke="#1e293b" stroke-width="2"/>
    <text x="${CANVAS_W / 2}" y="52" font-family="Noto Sans Arabic" font-size="25" fill="#f8fafc" font-weight="bold" text-anchor="middle">منظّم المذاكرة الذكي ERA • رفيقك الدراسي المثالي للتفوق بدون إجهاد</text>
    <text x="${CANVAS_W / 2}" y="92" font-family="Noto Sans Arabic" font-size="20" fill="#64748b" text-anchor="middle">جميع الحقوق محفوظة للمطور • مزامنة سحابية بحساب Google وتوافق تام مع الهواتف والحواسيب</text>
  </g>
</svg>`;

fs.writeFileSync("master_guide.svg", masterSvg);
console.log("Master SVG written. Converting via ffmpeg to public/assets/era_complete_guide_infographic.jpg...");
execSync("ffmpeg -y -i master_guide.svg -q:v 2 public/assets/era_complete_guide_infographic.jpg", { stdio: "inherit" });
console.log("Master Infographic created successfully!");

// 2. Also build Part 1 (Screens 1 to 4)
console.log("Generating Part 1 (Screens 1 to 4)...");
const PART_H = 430 + (2 * ROW_H) + 180;
let part1CardsSvg = "";
screens.slice(0, 4).forEach((sc, idx) => {
  const isRightCol = (idx % 2 === 0);
  const cardX = isRightCol ? (CANVAS_W - COL_W - 60) : 60;
  const row = Math.floor(idx / 2);
  const cardY = 430 + (row * ROW_H) + 20;
  part1CardsSvg += generateCard(sc, cardX, cardY, COL_W, ROW_H);
});

const part1Svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CANVAS_W}" height="${PART_H}">
  <rect width="${CANVAS_W}" height="${PART_H}" fill="#050814"/>
  <g id="p1-header">
    <rect x="60" y="40" width="${CANVAS_W - 120}" height="340" rx="36" fill="#0b1329" stroke="#1e293b" stroke-width="3"/>
    <rect x="${CANVAS_W / 2 - 220}" y="75" width="440" height="52" rx="26" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="${CANVAS_W / 2}" y="110" font-family="Noto Sans Arabic" font-size="24" fill="#38bdf8" font-weight="bold" text-anchor="middle">✨ الجزء الأول: البداية وإعداد الجدول</text>
    <text x="${CANVAS_W / 2}" y="195" font-family="Noto Sans Arabic" font-size="52" fill="#ffffff" font-weight="900" text-anchor="middle">دليل شاشات مُنظّم المذاكرة ERA (١ إلى ٤)</text>
    <text x="${CANVAS_W / 2}" y="255" font-family="Noto Sans Arabic" font-size="26" fill="#94a3b8" font-weight="normal" text-anchor="middle">الرئيسية • تحديد نافذة الوقت • قائمة المواد والأولويات • إنشاء الجدول والإحصائيات الأربعة</text>
  </g>
  ${part1CardsSvg}
  <g id="p1-footer" transform="translate(0, ${PART_H - 150})">
    <rect x="60" y="0" width="${CANVAS_W - 120}" height="110" rx="28" fill="#0b1329" stroke="#1e293b" stroke-width="2"/>
    <text x="${CANVAS_W / 2}" y="65" font-family="Noto Sans Arabic" font-size="24" fill="#38bdf8" font-weight="bold" text-anchor="middle">انتقل إلى الجزء الثاني لمشاهدة شرح الخط الزمني، مؤقت التركيز، وألعاب الترويق</text>
  </g>
</svg>`;
fs.writeFileSync("part1_guide.svg", part1Svg);
execSync("ffmpeg -y -i part1_guide.svg -q:v 2 public/assets/era_guide_part1.jpg", { stdio: "inherit" });
console.log("Part 1 created successfully!");

// 3. Also build Part 2 (Screens 5 to 8)
console.log("Generating Part 2 (Screens 5 to 8)...");
let part2CardsSvg = "";
screens.slice(4, 8).forEach((sc, idx) => {
  const isRightCol = (idx % 2 === 0);
  const cardX = isRightCol ? (CANVAS_W - COL_W - 60) : 60;
  const row = Math.floor(idx / 2);
  const cardY = 430 + (row * ROW_H) + 20;
  part2CardsSvg += generateCard(sc, cardX, cardY, COL_W, ROW_H);
});

const part2Svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CANVAS_W}" height="${PART_H}">
  <rect width="${CANVAS_W}" height="${PART_H}" fill="#050814"/>
  <g id="p2-header">
    <rect x="60" y="40" width="${CANVAS_W - 120}" height="340" rx="36" fill="#0b1329" stroke="#1e293b" stroke-width="3"/>
    <rect x="${CANVAS_W / 2 - 220}" y="75" width="440" height="52" rx="26" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <text x="${CANVAS_W / 2}" y="110" font-family="Noto Sans Arabic" font-size="24" fill="#10b981" font-weight="bold" text-anchor="middle">✨ الجزء الثاني: التنفيذ والتركيز والترويق</text>
    <text x="${CANVAS_W / 2}" y="195" font-family="Noto Sans Arabic" font-size="52" fill="#ffffff" font-weight="900" text-anchor="middle">دليل شاشات مُنظّم المذاكرة ERA (٥ إلى ٨)</text>
    <text x="${CANVAS_W / 2}" y="255" font-family="Noto Sans Arabic" font-size="26" fill="#94a3b8" font-weight="normal" text-anchor="middle">الخط الزمني وفواصل الراحة • مؤقت جلسة التركيز • مؤقت الاستراحة وألعاب الترويق • الإعدادات وحفظ السحاب</text>
  </g>
  ${part2CardsSvg}
  <g id="p2-footer" transform="translate(0, ${PART_H - 150})">
    <rect x="60" y="0" width="${CANVAS_W - 120}" height="110" rx="28" fill="#0b1329" stroke="#1e293b" stroke-width="2"/>
    <text x="${CANVAS_W / 2}" y="65" font-family="Noto Sans Arabic" font-size="24" fill="#10b981" font-weight="bold" text-anchor="middle">منظّم المذاكرة الذكي ERA • تفوق دراسي بذكاء وتوازن كامل</text>
  </g>
</svg>`;
fs.writeFileSync("part2_guide.svg", part2Svg);
execSync("ffmpeg -y -i part2_guide.svg -q:v 2 public/assets/era_guide_part2.jpg", { stdio: "inherit" });
console.log("Part 2 created successfully!");
