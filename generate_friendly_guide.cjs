const fs = require("fs");
const { execSync } = require("child_process");

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
    title: "١. الصفحة الرئيسية (البداية)",
    subtitle: "المكان اللي بتبدأ منه يومك الدراسي",
    badge: "الخطوة الأولى",
    badgeColor: "#38bdf8",
    file: "public/assets/aistudio/Screenshot_20261031_143833_com_android_chrome_ChromeTabbedActivity_f2f71b07.jpg",
    callouts: [
      {
        num: "١",
        label: "رسالة تشجيعية يومية (الملك المصري 👑)",
        desc: "كلام تشجيعي لطيف في أول الصفحة يشحن طاقتك ويديك دفعة حماس عشان تبدأ تذاكر وأنت مبسوط.",
        pointerY: 0.17
      },
      {
        num: "٢",
        label: "زر «تحديد وقت المذاكرة ↓»",
        desc: "اضغط هنا عشان ينزلك علطول على خانة الساعات، وتبدأ تختار وقتك الفاضي النهاردة.",
        pointerY: 0.35
      },
      {
        num: "٣",
        label: "زر «+ إضافة مادة جديدة»",
        desc: "لو عايز تضيف درس أو مادة فوراً بتضغط هنا وتكتب اسمها والوقت اللي محتاجه.",
        pointerY: 0.40
      },
      {
        num: "٤",
        label: "الشريط العلوي (الإعدادات والوضع الليلي)",
        desc: "من هنا تقدر تشغل الوضع الليلي عشان يريح عينك، أو تفتح الإعدادات تظبط حسابك.",
        pointerY: 0.08
      }
    ]
  },
  {
    id: 2,
    title: "٢. تحديد وقتك وإضافة المواد",
    subtitle: "اختار ساعات فراغك وسجّل الدروس اللي ناوي تذاكرها",
    badge: "الخطوة الثانية",
    badgeColor: "#60a5fa",
    file: "public/assets/aistudio/Screenshot_20261031_143905_com_android_chrome_ChromeTabbedActivity_9fdb5ac2.jpg",
    callouts: [
      {
        num: "١",
        label: "خانة وقت البداية والنهاية",
        desc: "بتحدد هتبدأ الساعة كام وهتخلص الساعة كام (مثلاً من 3:45 لحد 10:00 مساءً).",
        pointerY: 0.18
      },
      {
        num: "٢",
        label: "حساب إجمالي الساعات تلقائياً",
        desc: "الموقع بيحسبلك لوحده الساعات المتاحة (6 ساعات وربع) عشان تظبط دروسك عليها.",
        pointerY: 0.09
      },
      {
        num: "٣",
        label: "قائمة المواد وأنواعها (فيديو أو تدريبات)",
        desc: "بتكتب اسم المادة وتختار نوعها: لو شرح فيديو بتحدد مدته بالساعات، ولو تدريبات بتكتب عدد الأسئلة.",
        pointerY: 0.44
      },
      {
        num: "٤",
        label: "تعديل المادة وترتيب الأهمية",
        desc: "تقدر تعدل أي مادة بالقلم، أو تحط علامة (عالية جداً) للمادة الصعبة عشان تبدأ بيها أول حاجة.",
        pointerY: 0.52
      }
    ]
  },
  {
    id: 3,
    title: "٣. جدولك الذكي وأرقام يومك",
    subtitle: "بضغطة واحدة جدولك بيترتب بأوقات الراحة وإحصائيات إنجازك",
    badge: "الخطوة الثالثة",
    badgeColor: "#a855f7",
    file: "public/assets/aistudio/Screenshot_20261031_143909_com_android_chrome_ChromeTabbedActivity_5bd9ad8f.jpg",
    callouts: [
      {
        num: "١",
        label: "الزر السحري «✨ إنشاء جدول المذاكرة»",
        desc: "أول ما تضغط عليه، الموقع بيرتبلك يومك تلقائياً ويوزع المواد وبريكات راحة في النص من غير ما تتعب.",
        pointerY: 0.13
      },
      {
        num: "٢",
        label: "أزرار التحكم الأربعة بالجدول",
        desc: "«بدء المذاكرة» لتشغيل المؤقت، «ملء الشاشة» لمنع التشتت، و«إنشاء كصورة» لحفظ الجدول على موبايلك.",
        pointerY: 0.35
      },
      {
        num: "٣",
        label: "ملخص وقت المذاكرة ووقت الراحة",
        desc: "بيقولك بالظبط: هتذاكر 3 ساعات و 45 دقيقة، وهترتاح 55 دقيقة بريكات موزعة ومريحة.",
        pointerY: 0.46
      },
      {
        num: "٤",
        label: "متابعة الإنجاز والدروس المخلصة",
        desc: "بتشوف نسبة شطارتك (25% منجز)، والدرس اللي بتخلصه بتعلم عليه صح بالأخضر عشان تفتخر بإنجازك.",
        pointerY: 0.58
      }
    ]
  },
  {
    id: 4,
    title: "٤. شاشة التركيز ومؤقت المذاكرة",
    subtitle: "المؤقت اللي بيساعدك تركز في الدرس وما تمسكش الموبايل",
    badge: "الخطوة الرابعة",
    badgeColor: "#06b6d4",
    file: "public/assets/aistudio/Screenshot_20261031_143928_com_android_chrome_ChromeTabbedActivity_9e52d2c8.jpg",
    callouts: [
      {
        num: "١",
        label: "عداد الدقائق التنازلي (60:00)",
        desc: "ساعة تركيز واضحة قدامك بتعد تنازلي عشان تحس بقيمة كل دقيقة في درسك وتركز بكل حواسك.",
        pointerY: 0.44
      },
      {
        num: "٢",
        label: "زر التشغيل والإيقاف المؤقت",
        desc: "زرار كبير في النص: تفتحه تبدأ تذاكر، ولو جالك مشوار طارئ توقفه وترجع تكمل عادي.",
        pointerY: 0.61
      },
      {
        num: "٣",
        label: "زر تزويد الوقت (+5 دقائق) والإعادة",
        desc: "لو فاضلك صفحة ومحتاج وقت زيادة تدوس (+5 دقائق)، أو تعيد الوقت لو حبيت تراجع من الأول.",
        pointerY: 0.70
      },
      {
        num: "٤",
        label: "زر «تم إنهاء الجلسة» الأخضر",
        desc: "أول ما تخلص مذاكرة الدرس تضغط عليه، عشان يسجلك إنك نجحت وينقلك فوراً لشاشة البريك.",
        pointerY: 0.76
      }
    ]
  },
  {
    id: 5,
    title: "٥. وقت الاستراحة ولعبة الترويق",
    subtitle: "بريك حقيقي تفصل فيه عن المذاكرة وتفرّغ طاقتك وتنعش مخك",
    badge: "الخطوة الخامسة",
    badgeColor: "#10b981",
    file: "public/assets/aistudio/Screenshot_20261031_143933_com_android_chrome_ChromeTabbedActivity_e74bd043.jpg",
    callouts: [
      {
        num: "١",
        label: "مؤقت البريك الأخضر المريح (20:00)",
        desc: "وقت راحة محسوب علمياً ومناسب لدرس الساعة، تريح فيه عينك وتتنفس بهدوء.",
        pointerY: 0.44
      },
      {
        num: "٢",
        label: "نصائح التنشيط وإراحة العينين",
        desc: "بيفكرك تشرب مية، تبعد عن الشاشة، وتعمل شوية تمارين تنفس خفيفة عشان ترجع بنشاط.",
        pointerY: 0.22
      },
      {
        num: "٣",
        label: "الزر المميز «🎮 العب لعبة في البريك»",
        desc: "ألعاب خفيفة ومسلية جوة الموقع تسلّيك شوية وتنعش دماغك قبل ما ترجع تذاكر تاني.",
        pointerY: 0.78
      },
      {
        num: "٤",
        label: "إنهاء البريك وبدء الدرس اللي بعده",
        desc: "لو شبعت راحة ومتحمس تكمل، اضغط «تم إنهاء الجلسة» عشان تبدأ الدرس التالي علطول.",
        pointerY: 0.73
      }
    ]
  },
  {
    id: 6,
    title: "٦. الإعدادات وحفظ بياناتك",
    subtitle: "حفظ كل شغلك تلقائياً على حسابك وتظبيط الموقع على ذوقك",
    badge: "الخطوة السادسة",
    badgeColor: "#ec4899",
    file: "public/assets/aistudio/Screenshot_20261031_143838_com_android_chrome_ChromeTabbedActivity_edit_2839578089641680_235d3f5b.jpg",
    callouts: [
      {
        num: "١",
        label: "حفظ البيانات التلقائي (السحاب)",
        desc: "كل جدول بتعمله وكل مادة بتتسيف تلقائياً على حسابك (حفظ البيانات مفعل) عشان ما تضيعش أبداً.",
        pointerY: 0.24
      },
      {
        num: "٢",
        label: "زرار الوضع الليلي (النمط الداكن)",
        desc: "زرار بتفتحه يخلي ألوان الشاشة كحلي غامق ومريح للعين بالليل عشان ما تجهدش عينيك.",
        pointerY: 0.40
      },
      {
        num: "٣",
        label: "اللغة والدعم الفني",
        desc: "الموقع بالكامل باللغة العربية البسيطة، وفي زرار للتواصل لو حبيت تقترح فكرة جديدة أو مساعدة.",
        pointerY: 0.46
      },
      {
        num: "٤",
        label: "زر «مسح البيانات والبدء من جديد»",
        desc: "لو حبيت تفضي الجدول القديم وتبدأ يوم دراسي جديد من الصفر بتضغط هنا بسهولة وأمان.",
        pointerY: 0.65
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
      <text x="${cardX + COL_W - 135}" y="${cardY + 112}" font-family="Noto Sans Arabic" font-size="21" fill="#94a3b8" font-weight="normal" text-anchor="end">${escapeXml(sc.subtitle)}</text>

      <rect x="${cardX + 40}" y="${cardY + 45}" width="200" height="50" rx="25" fill="#1e293b" stroke="${sc.badgeColor}" stroke-width="2"/>
      <text x="${cardX + 140}" y="${cardY + 77}" font-family="Noto Sans Arabic" font-size="21" fill="${sc.badgeColor}" font-weight="bold" text-anchor="middle">${escapeXml(sc.badge)}</text>

      <rect x="${phoneX - 8}" y="${phoneY - 8}" width="${phoneW + 16}" height="${phoneH + 16}" rx="32" fill="#030712" stroke="${sc.badgeColor}" stroke-width="4"/>
      <image href="data:image/jpeg;base64,${imgB64}" x="${phoneX}" y="${phoneY}" width="${phoneW}" height="${phoneH}" preserveAspectRatio="xMidYMid meet"/>

      ${calloutsSvg}
    </g>
  `;
}

// 1. Build Single Master Image (All 6 Screens: 3 rows x 2 cols)
console.log("Generating 6-Screen Master Infographic SVG...");
const COL_W = 1840;
const ROW_H = 2150;
const CANVAS_W = 3840;
const CANVAS_H = 430 + (3 * ROW_H) + 180; // 7060px

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

    <rect x="${CANVAS_W / 2 - 250}" y="75" width="500" height="52" rx="26" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="${CANVAS_W / 2}" y="110" font-family="Noto Sans Arabic" font-size="24" fill="#38bdf8" font-weight="bold" text-anchor="middle">✨ الدليل المبسّط لمنظم المذاكرة الذكي</text>

    <text x="${CANVAS_W / 2}" y="195" font-family="Noto Sans Arabic" font-size="52" fill="#ffffff" font-weight="900" text-anchor="middle">إزاي تستخدم موقع المذاكرة الذكي ERA خطوة بخطوة</text>
    
    <text x="${CANVAS_W / 2}" y="255" font-family="Noto Sans Arabic" font-size="26" fill="#94a3b8" font-weight="normal" text-anchor="middle">شرح سهل وبسيط لكل شاشة وزرار في الموقع عشان تذاكر بتركيز وراحة وبدون أي تعقيد</text>
    
    <text x="${CANVAS_W / 2}" y="315" font-family="Noto Sans Arabic" font-size="21" fill="#64748b" font-weight="bold" text-anchor="middle">
      ١. البداية  ⟵  ٢. الساعات والمواد  ⟵  ٣. الجدول الذكي  ⟵  ٤. مؤقت التركيز  ⟵  ٥. وقت البريك واللعب  ⟵  ٦. الإعدادات والحفظ
    </text>
  </g>

  ${masterCardsSvg}

  <g id="footer" transform="translate(0, ${CANVAS_H - 150})">
    <rect x="60" y="0" width="${CANVAS_W - 120}" height="110" rx="28" fill="#0b1329" stroke="#1e293b" stroke-width="2"/>
    <text x="${CANVAS_W / 2}" y="50" font-family="Noto Sans Arabic" font-size="24" fill="#f8fafc" font-weight="bold" text-anchor="middle">موقع المذاكرة الذكي ERA • نظّم وقتك، ذاكر بتركيز، واستمتع بالبريك</text>
    <text x="${CANVAS_W / 2}" y="88" font-family="Noto Sans Arabic" font-size="19" fill="#64748b" text-anchor="middle">حفظ تلقائي لبياناتك على السحاب • متوافق مع الموبايل والكمبيوتر</text>
  </g>
</svg>`;

fs.writeFileSync("friendly_guide.svg", masterSvg);
console.log("SVG written. Converting to high-res JPG via ffmpeg...");
execSync("ffmpeg -y -i friendly_guide.svg -q:v 2 public/assets/era_site_simple_guide.jpg", { stdio: "inherit" });
console.log("Successfully created: public/assets/era_site_simple_guide.jpg");
