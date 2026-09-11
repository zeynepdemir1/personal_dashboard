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

export const MONTH_ABBR_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export const MONTH_FULL_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export function formatMonthDay(date: Date): { month: string; day: string } {
  return { month: MONTH_ABBR_TR[date.getMonth()], day: String(date.getDate()).padStart(2, '0') };
}

// PLAN.md Aşama 22: Ana Sayfa'daki takvim ızgarası (hafta/ay) artık
// oklarla gezilebiliyor — bu yüzden hangi hafta/ay gösterildiğini gerçek
// bir Date ile ifade etmek, gün notlarını da (dayNotes) sadece "ayın kaçı"
// (1-30) yerine tam bir tarihle (YYYY-MM-DD) anahtarlamak gerekti; aksi
// halde Eylül'ün 5'i ile Ekim'in 5'i aynı anahtarı paylaşırdı.
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Pazartesi başlangıçlı hafta (uygulamanın geri kalanıyla — PZT,SAL,...,PAZ
// etiketleriyle — tutarlı olsun diye).
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Pazar .. 6 = Cumartesi
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
}

export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function formatFullDateTR(date: Date): string {
  return `${date.getDate()} ${MONTH_FULL_TR[date.getMonth()]} ${date.getFullYear()}`;
}

// <input type="date"> 'YYYY-MM-DD' döndürür; uygulamanın geri kalanı
// (daysLeftUntil, parseDotDate, PROGRAMS seed verisi) 'DD.MM.YYYY' kullanıyor.
export function isoDateToDotDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}.${m}.${y}`;
}

export function dotDateToIsoDate(dot: string): string {
  const [d, m, y] = dot.split('.');
  if (!d || !m || !y) return '';
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
