export type Screen =
  | 'home'
  | 'growth'
  | 'learn'
  | 'diary'
  | 'links'
  | 'projects'
  | 'calendar'
  | 'poems'
  | 'topics'
  | 'discover';

export const VALID_SCREENS: Screen[] = [
  'home',
  'growth',
  'learn',
  'diary',
  'links',
  'projects',
  'calendar',
  'poems',
  'topics',
  'discover',
];

export interface ExtraLink {
  title: string;
  kind: string;
  kindColor?: string;
  url: string;
  note: string;
  tags: string[];
  date?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ExtraProject {
  id: string;
  title: string;
  state: string;
  stateColor: string;
  note: string;
  date: string;
  image?: string;
  checklist: ChecklistItem[];
}

// Statik (data.ts → PROJECTS) proje fikirlerine sonradan eklenen durum/
// checklist/not/fotoğraf değişiklikleri — dizideki index'e göre anahtarlanır
// (topicOverrides ile aynı desen).
export interface ProjectOverride {
  state?: string;
  stateColor?: string;
  note?: string;
  image?: string;
  checklist?: ChecklistItem[];
}

export interface ExtraTopic {
  title: string;
  image?: string;
}

export interface TopicOverride {
  done: boolean;
  date: string;
}

export interface RelatedLink {
  id: string;
  title: string;
  url: string;
}

export interface ExtraProgram {
  id: string;
  title: string;
  date: string;
  note: string;
  link?: string;
  fileName?: string;
  fileData?: string;
}

// Statik (data.ts → PROGRAMS) programlara sonradan eklenen not/link/dosya —
// başlığa göre anahtarlanır (bu küçük veri setinde başlıklar tekil).
export interface ProgramAttachment {
  note?: string;
  link?: string;
  fileName?: string;
  fileData?: string;
}

// Günlük girişindeki `text`, `diarySecurity` kurulmuşsa DÜZ METİN değil
// AES-GCM ile şifrelenmiş bir blob'un base64'ü olarak saklanır (bkz.
// src/lib/diaryCrypto.ts, PLAN.md Aşama 17 madde 3). Tip düzeyinde hâlâ
// `string` — yorumu (şifreli mi düz mü) `diarySecurity.enabled` belirler.
export interface DiaryEntryX {
  id: string;
  date: string;
  text: string;
}

// Günlük parolası kurulunca oluşturulur. `salt`, anahtar türetmede
// (PBKDF2) kullanılır; `canary`, girilen parolanın doğruluğunu (gerçek
// içeriği çözmeden) test etmek için bilinen bir metnin şifreli hâlidir.
// Günlük parolası KENDİSİ hiçbir yerde saklanmaz — sadece tarayıcıda,
// kilit açıkken, bellekte (CryptoKey olarak) tutulur.
export interface DiarySecurity {
  enabled: boolean;
  salt: string;
  canary: string;
}

export interface PoemX {
  id: string;
  title: string;
  text: string;
  date: string;
}
