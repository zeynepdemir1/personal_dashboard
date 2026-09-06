// Ana sayfadaki istatistik kartlarını gerçek veriden hesaplar (bkz. PLAN.md
// Aşama 2). Sabit metin yerine MONTHS/TOPICS/TODAY tek kaynaklarından türetir.
import { MONTHS, TOPICS } from './data';
import { parseDotDate, referenceToday } from './dates';
import type { TopicOverride } from './types';

const MONTH_ABBR: Record<string, number> = {
  Oca: 0, Şub: 1, Mar: 2, Nis: 3, May: 4, Haz: 5,
  Tem: 6, Ağu: 7, Eyl: 8, Eki: 9, Kas: 10, Ara: 11,
};

function parseAbbrevDate(short: string, year: number): Date | null {
  const [dStr, monAbbr] = short.trim().split(' ');
  const day = parseInt(dStr, 10);
  const month = MONTH_ABBR[monAbbr];
  if (!day || month === undefined) return null;
  return new Date(year, month, day);
}

function growthNoteDates(): Date[] {
  const dates: Date[] = [];
  for (const m of MONTHS) {
    const yearMatch = m.name.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
    for (const n of m.notes) {
      const d = parseAbbrevDate(n.date, year);
      if (d) dates.push(d);
    }
  }
  return dates;
}

function weekStart(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // Pazartesi = 0
  d.setDate(d.getDate() - day);
  return d.getTime();
}

function computeStreakWeeks(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const weekSet = new Set(dates.map(weekStart));
  const maxWeek = Math.max(...weekSet);
  const DAY = 86400000;
  let streak = 0;
  let cursor = maxWeek;
  while (weekSet.has(cursor)) {
    streak++;
    cursor -= 7 * DAY;
  }
  return streak;
}

export interface HomeStats {
  currentMonthLabel: string;
  currentMonthCount: number;
  streakWeeks: number;
  daysSinceLastEntry: number;
}

export function computeHomeStats(extraGrowthNotesCount = 0): HomeStats {
  const referenceDate = referenceToday();
  // Yerel modelle özetlenip Akademik Gelişim'e eklenen yeni notlar hep
  // "bugün" tarihini taşıyor (bkz. AppState.saveLearnEntry) — seri ve
  // "son girişten bu yana" hesaplarına da girsinler diye ekleniyor.
  const dates = [...growthNoteDates(), ...Array(extraGrowthNotesCount).fill(referenceDate)];
  const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : referenceDate;
  const daysSinceLastEntry = Math.round((referenceDate.getTime() - maxDate.getTime()) / 86400000);

  return {
    currentMonthLabel: MONTHS[0]?.name.split(' ')[0] ?? '',
    currentMonthCount: (MONTHS[0]?.count ?? 0) + extraGrowthNotesCount,
    streakWeeks: computeStreakWeeks(dates),
    daysSinceLastEntry,
  };
}

export function computeClosedTopicsThisMonth(
  topicOverrides: Record<number, TopicOverride>,
  extraTopicsCount: number,
): { closed: number; total: number } {
  const referenceDate = referenceToday();
  const refMonth = referenceDate.getMonth();
  const refYear = referenceDate.getFullYear();

  let closed = 0;
  TOPICS.forEach((t, i) => {
    const ov = topicOverrides[i];
    const done = ov ? ov.done : !!t.done;
    const doneDateStr = ov ? ov.date : t.done;
    if (!done || !doneDateStr) return;
    const d = parseDotDate(doneDateStr);
    if (d && d.getMonth() === refMonth && d.getFullYear() === refYear) closed++;
  });

  return { closed, total: TOPICS.length + extraTopicsCount };
}
