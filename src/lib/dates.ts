// Uygulama genelinde tarih ayrıştırma/hesaplama için tek kaynak.
import { TODAY } from './data';

export function parseDotDate(s: string): Date | null {
  if (!s) return null;
  const [d, m, y] = s.split('.').map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export function referenceToday(): Date {
  return parseDotDate(TODAY) ?? new Date();
}

export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function daysLeftUntil(dateStr: string): number | null {
  const d = parseDotDate(dateStr);
  if (!d) return null;
  return daysBetween(referenceToday(), d);
}

export function formatDaysLeft(daysLeft: number): string {
  if (daysLeft > 0) return `${daysLeft} gün kaldı`;
  if (daysLeft === 0) return 'bugün';
  return `${Math.abs(daysLeft)} gün önce geçti`;
}

// Yaklaşan bir tarihe ne kadar kaldığına göre aciliyet rengi: yakın (<=20 gün)
// vurgulu, orta vadeli (<=90 gün) nötr, uzak/geçmiş sönük.
export function daysLeftColor(daysLeft: number): string {
  if (daysLeft < 0) return '#9DA3A4';
  if (daysLeft <= 20) return '#B0554F';
  if (daysLeft <= 90) return '#8C6B70';
  return '#9DA3A4';
}

const MONTH_ABBR_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export function formatMonthDay(date: Date): { month: string; day: string } {
  return { month: MONTH_ABBR_TR[date.getMonth()], day: String(date.getDate()).padStart(2, '0') };
}
