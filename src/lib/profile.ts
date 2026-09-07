export const DEFAULT_PROFILE_NAME = 'Hatice Zeynep Demir';

// Avatar rozeti: ilk ve son kelimenin baş harfleri ("Hatice Zeynep Demir" -> "HD").
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Karşılama başlığı: soyadı hariç tüm ad ("Hatice Zeynep Demir" -> "Hatice Zeynep").
export function greetingName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? '';
  return parts.slice(0, -1).join(' ');
}

export function greetingWord(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'Günaydın';
  if (h >= 12 && h < 18) return 'İyi günler';
  if (h >= 18 && h < 22) return 'İyi akşamlar';
  return 'İyi geceler';
}

// "7 Eylül 2026 · Pazartesi" — ana sayfadaki tarih satırı için.
export function formatHeaderDate(date: Date): string {
  const formatted = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });
  const parts = formatted.split(' ');
  const weekday = parts.pop();
  return `${parts.join(' ')} · ${weekday}`;
}
