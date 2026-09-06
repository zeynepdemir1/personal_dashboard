import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  SEED_DAY_NOTES,
  TODAY,
  ROSE,
  type DayNote,
  type GrowthNote,
} from '../lib/data';
import { makeLearnEntry, type LearnEntry } from '../lib/learn';
import { deriveTitleFromUrl } from '../lib/url';
import { fetchGoogleCalendarEvents, type GCalEvent, type GCalSyncStatus } from '../lib/googleCalendar';
import { summarizeLearnEntry } from '../lib/ollama';
import { formatMonthDay, referenceToday } from '../lib/dates';
import { VALID_SCREENS, type ExtraLink, type ExtraProject, type ExtraTopic, type Screen, type TopicOverride } from '../lib/types';

// Ana sayfanın haftalık/aylık takvimi sabit bir pencere gösteriyor
// (31 Ağustos - 30 Eylül 2026) — Google Calendar senkronizasyonu da aynı
// pencere için tek seferde çekiliyor, DayPanel ve Home bunu context'ten
// paylaşıyor (ikisi App.tsx altında kardeş bileşen, prop geçirilemiyor).
const GCAL_RANGE_START = new Date(2026, 7, 31);
const GCAL_RANGE_END = new Date(2026, 8, 30, 23, 59, 59);

const STORAGE_KEY = 'muhendis-portal-state-v1';

interface PersistedState {
  extraLinks: ExtraLink[];
  extraTopics: ExtraTopic[];
  extraProjects: ExtraProject[];
  extraPrograms: string[];
  learnEntries: LearnEntry[];
  extraGrowthNotes: GrowthNote[];
  topicOverrides: Record<number, TopicOverride>;
  dayNotes: Record<number, DayNote[]>;
  unlocked: boolean;
  calView: 'week' | 'month';
  sidebarOpen: boolean;
}

function defaultPersisted(): PersistedState {
  return {
    extraLinks: [],
    extraTopics: [],
    extraProjects: [],
    extraPrograms: [],
    learnEntries: [],
    extraGrowthNotes: [],
    topicOverrides: {},
    dayNotes: JSON.parse(JSON.stringify(SEED_DAY_NOTES)),
    unlocked: false,
    calView: 'week',
    sidebarOpen: true,
  };
}

function loadPersisted(): PersistedState {
  const base = defaultPersisted();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

function parseHash(): { screen: Screen; entry: number } {
  const h = (typeof window !== 'undefined' ? window.location.hash : '').replace('#', '');
  if (!h) return { screen: 'home', entry: 0 };
  const [scr, entryStr] = h.split('/');
  if (VALID_SCREENS.includes(scr as Screen)) {
    return { screen: scr as Screen, entry: entryStr !== undefined ? parseInt(entryStr, 10) || 0 : 0 };
  }
  return { screen: 'home', entry: 0 };
}

export interface AppStateValue {
  screen: Screen;
  entry: number;
  navigate: (screen: Screen, entry?: number) => void;
  goBack: () => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;

  profileOpen: boolean;
  toggleProfile: () => void;

  width: number;

  unlocked: boolean;
  pass: string;
  setPass: (v: string) => void;
  unlock: () => void;
  lock: () => void;

  addingProgram: boolean;
  qProgram: string;
  setQProgram: (v: string) => void;
  startAddProgram: () => void;
  saveProgram: () => void;

  qLink: string;
  setQLink: (v: string) => void;
  addLink: () => void;

  addingLinkForm: boolean;
  qLinkTitle: string;
  setQLinkTitle: (v: string) => void;
  qLinkUrl: string;
  setQLinkUrl: (v: string) => void;
  qLinkNote: string;
  setQLinkNote: (v: string) => void;
  qLinkKind: string;
  setQLinkKind: (v: string) => void;
  startAddLinkForm: () => void;
  cancelAddLinkForm: () => void;
  saveLinkForm: () => void;

  qTopic: string;
  setQTopic: (v: string) => void;
  addTopic: (image?: string) => void;

  qProject: string;
  setQProject: (v: string) => void;
  addProject: (image?: string) => void;

  extraLinks: ExtraLink[];
  extraTopics: ExtraTopic[];
  extraProjects: ExtraProject[];
  extraPrograms: string[];

  learnEntries: LearnEntry[];
  extraGrowthNotes: GrowthNote[];
  addingLearnEntry: boolean;
  qLearnTitle: string;
  setQLearnTitle: (v: string) => void;
  qLearnBody: string;
  setQLearnBody: (v: string) => void;
  startAddLearnEntry: () => void;
  cancelAddLearnEntry: () => void;
  saveLearnEntry: () => void;

  topicOverrides: Record<number, TopicOverride>;
  toggleTopicAt: (i: number) => void;

  calView: 'week' | 'month';
  setCalView: (v: 'week' | 'month') => void;

  dayNotes: Record<number, DayNote[]>;
  dayPanel: number | null;
  dayPanelInput: string;
  dayPanelTime: string;
  openDayPanel: (day: number) => void;
  closeDayPanel: () => void;
  setDayPanelInput: (v: string) => void;
  setDayPanelTime: (v: string) => void;
  addDayPanelItem: () => void;
  removeDayNote: (day: number, id: string) => void;

  linkMenu: { title: string; url: string } | null;
  openLinkMenu: (title: string, url: string) => void;
  closeLinkMenu: () => void;

  gcalStatus: GCalSyncStatus;
  gcalEvents: GCalEvent[];
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedState>(loadPersisted);
  const persistedRef = useRef(persisted);
  persistedRef.current = persisted;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // storage unavailable — persistence is a nice-to-have, not required
    }
  }, [persisted]);

  const patch = (p: Partial<PersistedState>) => setPersisted((s) => ({ ...s, ...p }));

  const [{ screen, entry }, setRoute] = useState(parseHash);
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (nextScreen: Screen, nextEntry?: number) => {
    const nextHash = nextEntry !== undefined ? `${nextScreen}/${nextEntry}` : nextScreen;
    if (window.location.hash.replace('#', '') === nextHash) {
      setRoute({ screen: nextScreen, entry: nextEntry ?? 0 });
    } else {
      window.location.hash = nextHash;
    }
    setRoute({ screen: nextScreen, entry: nextEntry ?? entry });
  };
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else navigate('home');
  };

  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [profileOpen, setProfileOpen] = useState(false);
  const [pass, setPass] = useState('');
  const [addingProgram, setAddingProgram] = useState(false);
  const [qProgram, setQProgram] = useState('');
  const [qLink, setQLink] = useState('');
  const [addingLinkForm, setAddingLinkForm] = useState(false);
  const [qLinkTitle, setQLinkTitle] = useState('');
  const [qLinkUrl, setQLinkUrl] = useState('');
  const [qLinkNote, setQLinkNote] = useState('');
  const [qLinkKind, setQLinkKind] = useState('Link');
  const [qTopic, setQTopic] = useState('');
  const [qProject, setQProject] = useState('');
  const [addingLearnEntry, setAddingLearnEntry] = useState(false);
  const [qLearnTitle, setQLearnTitle] = useState('');
  const [qLearnBody, setQLearnBody] = useState('');
  const [dayPanel, setDayPanel] = useState<number | null>(null);
  const [dayPanelInput, setDayPanelInput] = useState('');
  const [dayPanelTime, setDayPanelTime] = useState('');
  const [linkMenu, setLinkMenu] = useState<{ title: string; url: string } | null>(null);

  const [gcalStatus, setGcalStatus] = useState<GCalSyncStatus>('unconfigured');
  const [gcalEvents, setGcalEvents] = useState<GCalEvent[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchGoogleCalendarEvents(GCAL_RANGE_START, GCAL_RANGE_END).then((res) => {
      if (cancelled) return;
      setGcalStatus(res.status);
      setGcalEvents(res.events);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AppStateValue = useMemo(
    () => ({
      screen,
      entry,
      navigate,
      goBack,

      sidebarOpen: persisted.sidebarOpen,
      toggleSidebar: () => patch({ sidebarOpen: !persistedRef.current.sidebarOpen }),

      profileOpen,
      toggleProfile: () => setProfileOpen((v) => !v),

      width,

      unlocked: persisted.unlocked,
      pass,
      setPass,
      unlock: () => patch({ unlocked: true }),
      lock: () => {
        patch({ unlocked: false });
        setPass('');
      },

      addingProgram,
      qProgram,
      setQProgram,
      startAddProgram: () => setAddingProgram(true),
      saveProgram: () => {
        const v = qProgram.trim();
        if (!v) return;
        patch({ extraPrograms: [...persistedRef.current.extraPrograms, v] });
        setQProgram('');
        setAddingProgram(false);
      },

      qLink,
      setQLink,
      addLink: () => {
        const v = qLink.trim();
        if (!v) return;
        patch({
          extraLinks: [
            { title: v, kind: 'Link', url: '', note: '', tags: [], date: TODAY },
            ...persistedRef.current.extraLinks,
          ],
        });
        setQLink('');
      },

      addingLinkForm,
      qLinkTitle,
      setQLinkTitle,
      qLinkUrl,
      setQLinkUrl,
      qLinkNote,
      setQLinkNote,
      qLinkKind,
      setQLinkKind,
      startAddLinkForm: () => setAddingLinkForm(true),
      cancelAddLinkForm: () => {
        setAddingLinkForm(false);
        setQLinkTitle('');
        setQLinkUrl('');
        setQLinkNote('');
        setQLinkKind('Link');
      },
      saveLinkForm: () => {
        const url = qLinkUrl.trim();
        if (!url) return;
        const title = qLinkTitle.trim() || deriveTitleFromUrl(url);
        patch({
          extraLinks: [
            { title, kind: qLinkKind, url, note: qLinkNote.trim(), tags: [], date: TODAY },
            ...persistedRef.current.extraLinks,
          ],
        });
        setQLinkTitle('');
        setQLinkUrl('');
        setQLinkNote('');
        setQLinkKind('Link');
        setAddingLinkForm(false);
      },

      qTopic,
      setQTopic,
      addTopic: (image?: string) => {
        const v = qTopic.trim();
        if (!v && !image) return;
        patch({
          extraTopics: [
            { title: v || 'Fotoğraf notu', image },
            ...persistedRef.current.extraTopics,
          ],
        });
        setQTopic('');
      },

      qProject,
      setQProject,
      addProject: (image?: string) => {
        const v = qProject.trim();
        if (!v && !image) return;
        patch({
          extraProjects: [
            { title: v || 'Fotoğraf fikri', state: 'Fikir', stateColor: '#8C6B70', note: '', date: TODAY, image },
            ...persistedRef.current.extraProjects,
          ],
        });
        setQProject('');
      },

      extraLinks: persisted.extraLinks,
      extraTopics: persisted.extraTopics,
      extraProjects: persisted.extraProjects,
      extraPrograms: persisted.extraPrograms,

      learnEntries: persisted.learnEntries,
      extraGrowthNotes: persisted.extraGrowthNotes,
      addingLearnEntry,
      qLearnTitle,
      setQLearnTitle,
      qLearnBody,
      setQLearnBody,
      startAddLearnEntry: () => setAddingLearnEntry(true),
      cancelAddLearnEntry: () => {
        setAddingLearnEntry(false);
        setQLearnTitle('');
        setQLearnBody('');
      },
      saveLearnEntry: () => {
        const title = qLearnTitle.trim();
        const body = qLearnBody.trim();
        if (!title || !body) return;
        const entry = makeLearnEntry(title, body);
        patch({ learnEntries: [entry, ...persistedRef.current.learnEntries] });
        setQLearnTitle('');
        setQLearnBody('');
        setAddingLearnEntry(false);
        navigate('learn', 0);

        // Arka planda yerel modelle özetle (PLAN.md Aşama 10) — başarısız
        // olursa sessizce vazgeç, giriş özet olmadan kalır. Hazır olunca
        // hem girişin kendi özetini doldur hem de Akademik Gelişim'in bu
        // ayki not listesine gerçek bir kayıt olarak ekle.
        summarizeLearnEntry(title, body).then((summary) => {
          if (!summary) return;
          setPersisted((s) => ({
            ...s,
            learnEntries: s.learnEntries.map((e) => (e.id === entry.id ? { ...e, summary } : e)),
          }));
          const { day, month } = formatMonthDay(referenceToday());
          const growthNote: GrowthNote = {
            date: `${day} ${month}`,
            title,
            body: summary,
            source: 'Bir Şey Öğrendim',
            dot: ROSE,
            link: 'girişe git',
          };
          setPersisted((s) => ({ ...s, extraGrowthNotes: [growthNote, ...s.extraGrowthNotes] }));
        });
      },

      topicOverrides: persisted.topicOverrides,
      toggleTopicAt: (i: number) => {
        const cur = persistedRef.current.topicOverrides[i];
        const wasDone = cur ? cur.done : false;
        patch({
          topicOverrides: {
            ...persistedRef.current.topicOverrides,
            [i]: { done: !wasDone, date: !wasDone ? TODAY : '' },
          },
        });
      },

      calView: persisted.calView,
      setCalView: (v: 'week' | 'month') => patch({ calView: v }),

      dayNotes: persisted.dayNotes,
      dayPanel,
      dayPanelInput,
      dayPanelTime,
      openDayPanel: (day: number) => {
        setDayPanel(day);
        setDayPanelInput('');
        setDayPanelTime('');
      },
      closeDayPanel: () => setDayPanel(null),
      setDayPanelInput,
      setDayPanelTime,
      addDayPanelItem: () => {
        if (dayPanel == null || !dayPanelInput.trim()) return;
        const d = dayPanel;
        const newItem: DayNote = {
          id: `${d}-${Date.now()}`,
          time: dayPanelTime || '',
          label: dayPanelInput.trim(),
        };
        patch({
          dayNotes: {
            ...persistedRef.current.dayNotes,
            [d]: [...(persistedRef.current.dayNotes[d] || []), newItem],
          },
        });
        setDayPanelInput('');
        setDayPanelTime('');
      },
      removeDayNote: (day: number, id: string) => {
        patch({
          dayNotes: {
            ...persistedRef.current.dayNotes,
            [day]: (persistedRef.current.dayNotes[day] || []).filter((x) => x.id !== id),
          },
        });
      },

      linkMenu,
      openLinkMenu: (title: string, url: string) => setLinkMenu({ title, url }),
      closeLinkMenu: () => setLinkMenu(null),

      gcalStatus,
      gcalEvents,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      screen,
      entry,
      persisted,
      profileOpen,
      width,
      pass,
      addingProgram,
      qProgram,
      qLink,
      addingLinkForm,
      qLinkTitle,
      qLinkUrl,
      qLinkNote,
      qLinkKind,
      qTopic,
      qProject,
      addingLearnEntry,
      qLearnTitle,
      qLearnBody,
      dayPanel,
      dayPanelInput,
      dayPanelTime,
      linkMenu,
      gcalStatus,
      gcalEvents,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used within AppStateProvider');
  return ctx;
}
