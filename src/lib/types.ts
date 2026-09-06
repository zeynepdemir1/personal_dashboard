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

export interface ExtraProject {
  title: string;
  state: string;
  stateColor: string;
  note: string;
  date: string;
  image?: string;
}

export interface ExtraTopic {
  title: string;
  image?: string;
}

export interface TopicOverride {
  done: boolean;
  date: string;
}
