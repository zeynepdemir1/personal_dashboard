// Seed content for the "Mühendis Kişisel Gelişim Platformu" dashboard,
// ported from the Claude Design prototype (Mühendis Gelişim Portalı.dc.html).

export const ROSE = '#DB7F8E';
export const TAUPE = '#604D53';
export const STEEL = '#9DA3A4';

export interface GrowthNote {
  date: string;
  title: string;
  body: string;
  source: string;
  dot: string;
  link: string;
}

export interface GrowthMonth {
  name: string;
  count: number;
  summary: string;
  tags: string[];
  notes: GrowthNote[];
}

// PLAN.md Aşama 25 madde 3: örnek/mock içerik kaldırıldı — uygulama gerçek
// kullanım için boş/temiz bir başlangıç durumunda. Tip/arayüz (GrowthMonth)
// bilerek korundu, sadece içerik boşaltıldı (bkz. Growth.tsx'teki "henüz
// gelişim notu yok" boş durumu ve Sidebar.tsx'teki dinamik sayaçlar).
export const MONTHS: GrowthMonth[] = [];

export interface Entry {
  date: string;
  len: string;
  title: string;
  teaser: string;
}

export const ENTRIES: Entry[] = [];

export interface Article {
  stamp: string;
  title: string;
  summary: string;
  body: string[];
  code: string;
  body2: string[];
  tags: string[];
  rel: string;
}

export const ARTICLES: Article[] = [];

export interface LinkItem {
  kind: string;
  kindColor: string;
  date: string;
  title: string;
  url: string;
  note: string;
  tags: string[];
}

export const LINK_KINDS = ['Link', 'Ders notu', 'GitHub', 'Video', 'Araç', 'Makale', 'Başvuru', 'Blog'] as const;

export const KIND_COLORS: Record<string, string> = {
  Link: TAUPE,
  'Ders notu': ROSE,
  GitHub: TAUPE,
  Video: '#8C6B70',
  Araç: STEEL,
  Makale: ROSE,
  Başvuru: TAUPE,
  Blog: '#8C6B70',
};

export const LINKS: LinkItem[] = [];

export interface Topic {
  title: string;
  added: string;
  done: string;
  link: string;
}

export const TOPICS: Topic[] = [];

export interface ProjectItem {
  state: string;
  stateColor: string;
  title: string;
  note: string;
  date: string;
}

export const PROJECTS: ProjectItem[] = [];

export interface Program {
  date: string;
  title: string;
  note: string;
  remind: string;
  color: string;
}

export const PROGRAMS: Program[] = [];

export interface Poem {
  title: string;
  text: string;
  date: string;
}

export const POEMS: Poem[] = [];

export interface DiaryEntry {
  date: string;
  text: string;
}

export const DIARY: DiaryEntry[] = [];

export interface DayNote {
  id: string;
  time: string;
  end?: string;
  label: string;
}

// PLAN.md Aşama 25 madde 3: örnek takvim notları kaldırıldı — boş bir
// nesne, gerçek kullanıcı notları Redis'te (app.dayNotes) tutuluyor.
export const SEED_DAY_NOTES: Record<string, DayNote[]> = {};

// Uygulamanın "bugün"ü — ana sayfadaki karşılama başlığıyla ("31 Ağustos 2026 ·
// Pazartesi") aynı referans tarih. Yeni eklenen kayıtlar ve istatistik
// hesaplamaları (bkz. stats.ts) bu tek noktadan besleniyor.
export const TODAY = '31.08.2026';

export function timeToHour(t: string): number | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h + (m || 0) / 60;
}
