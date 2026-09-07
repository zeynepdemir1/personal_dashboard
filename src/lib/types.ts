export type Screen =
  | 'home'
  | 'growth'
  | 'learn'
  | 'diary'
  | 'links'
  | 'projects'
  | 'calendar'
  | 'poems'
  | 'topics';

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

export interface DiaryEntryX {
  id: string;
  date: string;
  text: string;
}

export interface PoemX {
  id: string;
  title: string;
  text: string;
  date: string;
}
