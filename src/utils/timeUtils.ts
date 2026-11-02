/**
 * Utility functions for parsing, formatting, and calculating study time intervals.
 */

// Parse "HH:MM" (24h) to minutes from midnight (0 - 1439)
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return ((hours * 60 + minutes) % 1440 + 1440) % 1440;
}

// Convert minutes from midnight (possibly past midnight > 1440) to 12-hour format string (e.g. "06:00 PM")
export function formatMinutesTo12h(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const padH = hours12 < 10 ? `0${hours12}` : `${hours12}`;
  const padM = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${padH}:${padM} ${period}`;
}

// Convert 24h string "18:00" to "06:00 PM"
export function formatTime24to12(time24: string): string {
  const mins = parseTimeToMinutes(time24);
  return formatMinutesTo12h(mins);
}

// Convert minutes from midnight to "HH:MM" 24-hour string
export function formatMinutesTo24h(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const padH = hours24 < 10 ? `0${hours24}` : `${hours24}`;
  const padM = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${padH}:${padM}`;
}

// Calculate the total duration in minutes between start and end (handles past-midnight spanning)
export function calculateWindowMinutes(startTime: string, endTime: string): number {
  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);

  if (endMins > startMins) {
    return endMins - startMins;
  } else if (endMins < startMins) {
    // Spans past midnight (e.g., 22:00 to 02:00 -> 1440 - 1320 + 120 = 240)
    return (1440 - startMins) + endMins;
  } else {
    // Exactly 0 or 24 hours; in scheduling context default to 0 to prevent accidental 24h block
    return 0;
  }
}

// Human-readable Arabic duration string
export function formatDurationArabic(minutes: number): string {
  if (minutes <= 0) return '0 دقيقة';

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours === 0) {
    return `${remainingMins} دقيقة`;
  }

  let hourStr = '';
  if (hours === 1) hourStr = 'ساعة واحدة';
  else if (hours === 2) hourStr = 'ساعتان';
  else if (hours >= 3 && hours <= 10) hourStr = `${hours} ساعات`;
  else hourStr = `${hours} ساعة`;

  if (remainingMins === 0) {
    return hourStr;
  }

  return `${hourStr} و ${remainingMins} دقيقة`;
}

// Short English format: e.g. "4h 10m"
export function formatDurationEng(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours === 0) return `${rem}m`;
  if (rem === 0) return `${hours}h`;
  return `${hours}h ${rem}m`;
}

// Parse flexible video duration string (e.g., "01:35:00", "01:35", "90", "90m", "1h 30m")
export function parseVideoDurationString(input: string): { totalMinutes: number; formatted: string; isValid: boolean } {
  if (!input) return { totalMinutes: 0, formatted: '00:00:00', isValid: false };
  const clean = input.trim();

  // Check standard HH:MM:SS or MM:SS format
  const colonParts = clean.split(':');
  if (colonParts.length === 3) {
    const h = parseInt(colonParts[0], 10);
    const m = parseInt(colonParts[1], 10);
    const s = parseInt(colonParts[2], 10);
    if (!isNaN(h) && !isNaN(m) && !isNaN(s) && h >= 0 && m >= 0 && m < 60 && s >= 0 && s < 60) {
      const totalMinutes = h * 60 + m + (s >= 30 ? 1 : 0);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      return {
        totalMinutes: Math.max(1, totalMinutes),
        formatted: `${pad(h)}:${pad(m)}:${pad(s)}`,
        isValid: true,
      };
    }
  } else if (colonParts.length === 2) {
    const m = parseInt(colonParts[0], 10);
    const s = parseInt(colonParts[1], 10);
    if (!isNaN(m) && !isNaN(s) && m >= 0 && s >= 0 && s < 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      const totalMinutes = m + (s >= 30 ? 1 : 0);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      return {
        totalMinutes: Math.max(1, totalMinutes),
        formatted: `${pad(h)}:${pad(remM)}:${pad(s)}`,
        isValid: true,
      };
    }
  }

  // Plain number of minutes, e.g. "90"
  const rawNum = parseInt(clean, 10);
  if (!isNaN(rawNum) && rawNum > 0) {
    const h = Math.floor(rawNum / 60);
    const m = rawNum % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return {
      totalMinutes: rawNum,
      formatted: `${pad(h)}:${pad(m)}:00`,
      isValid: true,
    };
  }

  return { totalMinutes: 0, formatted: '00:00:00', isValid: false };
}

// Current date formatted in a futuristic format
export function getFuturisticDateFormatted(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('ar-EG', options);
}

export function getEnglishDateFormatted(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return now.toLocaleDateString('en-US', options);
}
