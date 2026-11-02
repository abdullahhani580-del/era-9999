import { ScheduleResult, Priority } from '../types/schedule';
import { formatDurationEng } from './timeUtils';

export interface PosterOptions {
  width: number;
  height: number;
  formatName: string;
}

export const POSTER_SIZES: Record<string, PosterOptions> = {
  story: { width: 1080, height: 1920, formatName: 'Story / Mobile (1080 × 1920)' },
  poster: { width: 1200, height: 1600, formatName: 'Standard Poster (1200 × 1600)' },
};

// Apple iOS Dynamic Priority System
const PRIORITY_COLORS: Record<Priority, { dot: string; glow: string; label: string; text: string }> = {
  very_high: { dot: '#ff453a', glow: 'rgba(255, 69, 58, 0.45)', label: 'CRITICAL', text: '#ff9f9a' },
  high: { dot: '#ff9f0a', glow: 'rgba(255, 159, 10, 0.45)', label: 'HIGH', text: '#ffc875' },
  medium: { dot: '#ffd60a', glow: 'rgba(255, 214, 10, 0.45)', label: 'MEDIUM', text: '#ffea85' },
  low: { dot: '#30d158', glow: 'rgba(48, 209, 88, 0.45)', label: 'NORMAL', text: '#88f3a3' },
};

// 5 Rich Futuristic Apple iOS Aurora Silk Themes (حرفياً من المستقبل)
export interface FuturisticIosTheme {
  name: string;
  bgGradient: [string, string, string]; // Top, Mid, Bottom
  waveColor1: string;
  waveColor2: string;
  waveColor3: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  subtextColor: string;
  badgeCode: string;
}

export const FUTURISTIC_IOS_THEMES: FuturisticIosTheme[] = [
  {
    name: 'Ocean Blue',
    bgGradient: ['#040817', '#081432', '#02050f'],
    waveColor1: 'rgba(0, 240, 255, 0.28)',
    waveColor2: 'rgba(99, 102, 241, 0.24)',
    waveColor3: 'rgba(217, 70, 239, 0.16)',
    cardBg: 'rgba(15, 23, 42, 0.72)',
    cardBorder: 'rgba(255, 255, 255, 0.16)',
    accentColor: '#2997ff',
    subtextColor: '#94a3b8',
    badgeCode: '✦ DAILY SCHEDULE · جدول اليوم',
  },
  {
    name: 'Midnight Sky',
    bgGradient: ['#030514', '#06173d', '#01030d'],
    waveColor1: 'rgba(41, 151, 255, 0.32)',
    waveColor2: 'rgba(52, 199, 89, 0.2)',
    waveColor3: 'rgba(175, 82, 222, 0.22)',
    cardBg: 'rgba(18, 28, 52, 0.75)',
    cardBorder: 'rgba(255, 255, 255, 0.18)',
    accentColor: '#5ac8fa',
    subtextColor: '#a1a1aa',
    badgeCode: '✦ FOCUS PLAN · خطة التركيز',
  },
  {
    name: 'Cobalt Glass',
    bgGradient: ['#020b22', '#052254', '#010719'],
    waveColor1: 'rgba(14, 165, 233, 0.32)',
    waveColor2: 'rgba(29, 78, 216, 0.25)',
    waveColor3: 'rgba(6, 182, 212, 0.2)',
    cardBg: 'rgba(12, 24, 48, 0.75)',
    cardBorder: 'rgba(56, 189, 248, 0.28)',
    accentColor: '#38bdf8',
    subtextColor: '#93c5fd',
    badgeCode: '✦ STUDY TIME · وقت المذاكرة',
  },
  {
    name: 'Purple Glow',
    bgGradient: ['#040a24', '#0a235c', '#020718'],
    waveColor1: 'rgba(168, 85, 247, 0.28)',
    waveColor2: 'rgba(59, 130, 246, 0.28)',
    waveColor3: 'rgba(236, 72, 153, 0.18)',
    cardBg: 'rgba(16, 26, 56, 0.74)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    accentColor: '#a855f7',
    subtextColor: '#cbd5e1',
    badgeCode: '✦ SMART SCHEDULE · الجدول الذكي',
  },
  {
    name: 'Pure Obsidian',
    bgGradient: ['#010410', '#031230', '#000208'],
    waveColor1: 'rgba(45, 212, 191, 0.25)',
    waveColor2: 'rgba(30, 58, 138, 0.35)',
    waveColor3: 'rgba(56, 189, 248, 0.22)',
    cardBg: 'rgba(10, 20, 40, 0.78)',
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    accentColor: '#34d399',
    subtextColor: '#94a3b8',
    badgeCode: '✦ DAY ROUTINE · خطة اليوم',
  },
];

// Simple deterministic RNG
function createRng(seed: number) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s = 123456789;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export async function renderScheduleToCanvas(
  result: ScheduleResult,
  size: PosterOptions = POSTER_SIZES.story,
  randomSeed?: number,
  userProfile?: { name?: string; playerTitle?: string }
): Promise<HTMLCanvasElement> {
  const { width, height } = size;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Seeded RNG
  const seed = randomSeed !== undefined ? randomSeed : Math.floor(Math.random() * 1000000);
  const rng = createRng(seed);

  // Pick one of the Futuristic Apple iOS Themes
  const themeIndex = Math.floor(rng() * FUTURISTIC_IOS_THEMES.length);
  const theme = FUTURISTIC_IOS_THEMES[themeIndex];

  // 1. Futuristic iOS Deep Cosmic Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width * 0.5, height);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(0.5, theme.bgGradient[1]);
  bgGrad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Futuristic iOS Chromatic Silk Wave 1 (Upper Ambient Ribbon)
  ctx.save();
  const wave1 = ctx.createLinearGradient(0, height * 0.1, width, height * 0.45);
  wave1.addColorStop(0, theme.waveColor1);
  wave1.addColorStop(0.6, theme.waveColor2);
  wave1.addColorStop(1, 'transparent');

  ctx.beginPath();
  const startY1 = height * (0.16 + rng() * 0.08);
  ctx.moveTo(0, startY1);
  const cp1x = width * (0.3 + rng() * 0.15);
  const cp1y = startY1 - 120;
  const cp2x = width * (0.7 + rng() * 0.15);
  const cp2y = startY1 + 160;
  const endY1 = height * (0.35 + rng() * 0.1);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, width, endY1);
  ctx.lineTo(width, height * 0.55);
  ctx.lineTo(0, height * 0.55);
  ctx.closePath();
  ctx.fillStyle = wave1;
  ctx.filter = 'blur(60px)';
  ctx.fill();
  ctx.restore();

  // 3. Futuristic iOS Chromatic Silk Wave 2 (Lower Diagonal Beam)
  ctx.save();
  const wave2 = ctx.createLinearGradient(width, height * 0.5, 0, height);
  wave2.addColorStop(0, theme.waveColor2);
  wave2.addColorStop(0.5, theme.waveColor3);
  wave2.addColorStop(1, 'transparent');

  ctx.beginPath();
  const startY2 = height * (0.55 + rng() * 0.1);
  ctx.moveTo(0, startY2);
  const cp3x = width * 0.4;
  const cp3y = startY2 + 180;
  const cp4x = width * 0.8;
  const cp4y = startY2 - 140;
  ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, width, height * (0.75 + rng() * 0.1));
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = wave2;
  ctx.filter = 'blur(70px)';
  ctx.fill();
  ctx.restore();

  // 4. Subtle Micro Holographic Dot Grid (Apple Precision)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  const gridStep = 48;
  for (let x = 30; x < width; x += gridStep) {
    for (let y = 30; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Padding & Layout Setup
  const padX = 54;
  let curY = 64;

  // 5. Header: Apple iOS Pill Tag & Clock Bar
  ctx.save();
  // Apple Tag Pill
  const pillW = 260;
  const pillH = 34;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  roundRect(ctx, padX, curY, pillW, pillH, 17);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Cairo", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(theme.badgeCode, padX + 18, curY + 22);

  // Time / Date indicator on top right
  ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "SF Pro Text", "JetBrains Mono", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  const dateStr = result.dateFormatted;
  const dateW = ctx.measureText(dateStr).width;
  ctx.fillText(dateStr, width - padX - dateW, curY + 23);
  ctx.restore();

  curY += 56;

  // 6. Main Big Typography (Apple Calendar Style)
  ctx.save();
  ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Cairo", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('STUDY SCHEDULE', padX, curY);

  if (userProfile?.name) {
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Cairo", sans-serif';
    ctx.fillStyle = theme.accentColor;
    const userLabel = `★ ${userProfile.name} · ${userProfile.playerTitle || 'الطالب الذكي'}`;
    const userW = ctx.measureText(userLabel).width;
    ctx.fillText(userLabel, width - padX - userW, curY - 6);
  }
  ctx.restore();

  curY += 32;

  // Session hours bar
  ctx.save();
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Cairo", sans-serif';
  ctx.fillStyle = theme.subtextColor;
  const timeSummary = `${result.startTimeStr} → ${result.endTimeStr}`;
  ctx.fillText(timeSummary, padX, curY);
  ctx.restore();

  curY += 36;

  // 7. Apple iOS Grouped Metric Pill Cards (3 Frosted Glass Pills)
  const metricBoxW = (width - padX * 2 - 32) / 3;
  const metricBoxH = 86;

  const metrics = [
    { label: 'STUDY TIME', val: formatDurationEng(result.totalStudyMinutes), color: '#2997ff' },
    { label: 'BREAK TIME', val: formatDurationEng(result.totalBreakMinutes), color: '#30d158' },
    { label: 'TASKS', val: `${result.taskCount} Sessions`, color: '#ffd60a' },
  ];

  metrics.forEach((m, idx) => {
    const bx = padX + idx * (metricBoxW + 16);
    ctx.save();
    // iOS Frosted Glass container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    roundRect(ctx, bx, curY, metricBoxW, metricBoxH, 22);
    ctx.fill();
    ctx.stroke();

    // Top highlight specular sheen
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + 22, curY + 1);
    ctx.lineTo(bx + metricBoxW - 22, curY + 1);
    ctx.stroke();

    // Label
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "SF Pro Text", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(m.label, bx + 18, curY + 30);

    // Value
    ctx.font = '800 24px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.fillStyle = m.color;
    ctx.fillText(m.val, bx + 18, curY + 64);
    ctx.restore();
  });

  curY += metricBoxH + 36;

  // 8. Apple iOS Timeline Bubble Cards (Slots)
  const availableCardHeight = height - curY - 130;
  const slotCount = result.slots.length;
  const maxSlotH = 105;
  const minSlotH = 65;
  const slotGap = slotCount > 8 ? 10 : 14;
  let slotH = Math.floor((availableCardHeight - (slotCount - 1) * slotGap) / Math.max(1, slotCount));
  slotH = Math.max(minSlotH, Math.min(maxSlotH, slotH));

  const cardW = width - padX * 2;

  result.slots.forEach((slot) => {
    const isBreak = slot.type === 'break';
    const cardY = curY;

    ctx.save();
    if (isBreak) {
      // iOS Break Card (Mindfulness green frosted glass bubble)
      ctx.fillStyle = 'rgba(48, 209, 88, 0.12)';
      ctx.strokeStyle = 'rgba(48, 209, 88, 0.35)';
      ctx.lineWidth = 1;
      roundRect(ctx, padX, cardY, cardW, slotH, 20);
      ctx.fill();
      ctx.stroke();

      // Top specular highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX + 24, cardY + 1);
      ctx.lineTo(padX + cardW - 24, cardY + 1);
      ctx.stroke();

      // Time Range
      ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "JetBrains Mono", monospace';
      ctx.fillStyle = '#88f3a3';
      ctx.fillText(`${slot.startTime} → ${slot.endTime}`, padX + 26, cardY + slotH / 2 + 5);

      // Break title
      ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Cairo", sans-serif';
      ctx.fillStyle = '#ffffff';
      const breakTitle = slot.title || `☕ استراحة ذهنية (${slot.durationMinutes} دقيقة)`;
      ctx.fillText(breakTitle, padX + 280, cardY + slotH / 2 + 5);

      if (slotH >= 85 && slot.subtitle) {
        ctx.font = '400 13px -apple-system, BlinkMacSystemFont, "Cairo", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(slot.subtitle, padX + 560, cardY + slotH / 2 + 5);
      }
    } else {
      // iOS Study Card (Liquid Frosted Glass Card)
      const pColor = slot.priority ? PRIORITY_COLORS[slot.priority] : PRIORITY_COLORS.medium;

      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1;
      roundRect(ctx, padX, cardY, cardW, slotH, 22);
      ctx.fill();
      ctx.stroke();

      // Top specular gloss line (Apple frosted glass feel)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX + 24, cardY + 1);
      ctx.lineTo(padX + cardW - 24, cardY + 1);
      ctx.stroke();

      // iOS Squircle indicator for Priority
      ctx.fillStyle = pColor.dot;
      roundRect(ctx, padX + 16, cardY + 14, 6, slotH - 28, 3);
      ctx.fill();

      // Time
      ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "JetBrains Mono", monospace';
      ctx.fillStyle = '#2997ff';
      ctx.fillText(`${slot.startTime} → ${slot.endTime}`, padX + 38, cardY + (slotH >= 85 ? 36 : slotH / 2 + 5));

      // Dot + Subject Title
      const dotX = padX + 280;
      const dotY = cardY + (slotH >= 85 ? 32 : slotH / 2 + 2);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
      ctx.fillStyle = pColor.dot;
      ctx.fill();

      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Cairo", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(slot.title, dotX + 16, cardY + (slotH >= 85 ? 37 : slotH / 2 + 6));

      // Subtitle
      if (slotH >= 85 && slot.subtitle) {
        ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Cairo", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fillText(slot.subtitle, padX + 38, cardY + 68);
      }

      // Duration Pill on Right
      const durText = `${slot.durationMinutes} min`;
      ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "SF Pro Text", monospace';
      const durWidth = ctx.measureText(durText).width;
      const pillBoxW = durWidth + 24;
      const pillBoxX = padX + cardW - pillBoxW - 18;
      const pillBoxY = cardY + (slotH - 28) / 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      roundRect(ctx, pillBoxX, pillBoxY, pillBoxW, 28, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(durText, pillBoxX + 12, pillBoxY + 18);
    }
    ctx.restore();

    curY += slotH + slotGap;
  });

  // 9. Apple iOS Footer Section (Dock / Capsule Bar)
  const footerY = height - 55;

  ctx.save();
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('✦ SMART STUDY PLANNER', padX, footerY);

  const quote = '“Discipline shapes time into destiny.”';
  ctx.font = 'italic 500 14px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
  ctx.fillStyle = theme.accentColor;
  const quoteW = ctx.measureText(quote).width;
  ctx.fillText(quote, width - padX - quoteW, footerY);
  ctx.restore();

  return canvas;
}

export async function downloadSchedulePoster(
  result: ScheduleResult,
  sizeOption: PosterOptions = POSTER_SIZES.story,
  randomSeed?: number,
  userProfile?: { name?: string; playerTitle?: string }
): Promise<void> {
  const canvas = await renderScheduleToCanvas(result, sizeOption, randomSeed, userProfile);
  const dataUrl = canvas.toDataURL('image/png');

  const link = document.createElement('a');
  const safeDate = result.dateFormatted.replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `Study_Schedule_${safeDate}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper to draw rounded rectangle on 2D context
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
