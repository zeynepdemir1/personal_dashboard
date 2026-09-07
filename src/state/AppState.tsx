import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  SEED_DAY_NOTES,
  TODAY,
  ROSE,
  DIARY,
  POEMS,
  type DayNote,
  type GrowthNote,
} from '../lib/data';
import { makeLearnEntry, type LearnEntry } from '../lib/learn';
import { deriveTitleFromUrl } from '../lib/url';
import { fetchGoogleCalendarEvents, type GCalEvent, type GCalSyncStatus } from '../lib/googleCalendar';
import { classifyProgramRelevance, pingOllama, summarizeLearnEntry } from '../lib/ollama';
import { dismissProgram, fetchPendingPrograms, fetchRelevantPrograms, markFilteredPrograms, type DiscoveredProgram } from '../lib/discover';
import { formatMonthDay, referenceToday } from '../lib/dates';
import { DEFAULT_PROFILE_NAME } from '../lib/profile';
import {
  VALID_SCREENS,
  type ChecklistItem,
  type DiaryEntryX,
  type ExtraLink,
  type ExtraProgram,
  type ExtraProject,
  type ExtraTopic,
  type PoemX,
  type ProgramAttachment,
  type ProjectOverride,
  type RelatedLink,
  type Screen,
  type TopicOverride,
} from '../lib/types';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Statik proje/program referansları "static:<index>" ya da "extra:<id>"
// şeklinde kodlanır — Topics.tsx'teki eski "extra${j}" numaraya-gömme
// hilesinden daha okunaklı bir sürümü.
type ProjectKey = { kind: 'static'; index: number } | { kind: 'extra'; id: string };
function parseProjectKey(key: string): ProjectKey {
  if (key.startsWith('extra:')) return { kind: 'extra', id: key.slice(6) };
  return { kind: 'static', index: parseInt(key.slice(7), 10) };
}

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
  extraPrograms: ExtraProgram[];
  programAttachments: Record<string, ProgramAttachment>;
  learnEntries: LearnEntry[];
  extraGrowthNotes: GrowthNote[];
  topicOverrides: Record<number, TopicOverride>;
  topicLinks: Record<string, RelatedLink[]>;
  projectOverrides: Record<number, ProjectOverride>;
  dayNotes: Record<number, DayNote[]>;
  diaryEntries: DiaryEntryX[];
  poemEntries: PoemX[];
  calView: 'week' | 'month';
  sidebarOpen: boolean;
  profileName: string;
}

function defaultPersisted(): PersistedState {
  return {
    extraLinks: [],
    extraTopics: [],
    extraProjects: [],
    extraPrograms: [],
    programAttachments: {},
    learnEntries: [],
    extraGrowthNotes: [],
    topicOverrides: {},
    topicLinks: {},
    projectOverrides: {},
    dayNotes: JSON.parse(JSON.stringify(SEED_DAY_NOTES)),
    diaryEntries: DIARY.map((d, i) => ({ id: `seed-${i}`, ...d })),
    poemEntries: POEMS.map((p, i) => ({ id: `seed-${i}`, ...p })),
    calView: 'week',
    sidebarOpen: true,
    profileName: DEFAULT_PROFILE_NAME,
  };
}

// Canlıda (Render) zaten gerçek kullanıcı verisi var — eski şekildeki
// alanları (extraPrograms bir zamanlar düz string[]'di, extraProjects'te
// id/checklist yoktu) sessizce yeni şekle taşı; aksi halde eski kayıtlar
// render sırasında çökmeye neden olur.
function normalizeExtraPrograms(raw: unknown): ExtraProgram[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    if (typeof item === 'string') {
      return { id: `legacy-${i}`, title: item, date: TODAY, note: '' };
    }
    const p = item as Partial<ExtraProgram>;
    return {
      id: p.id ?? makeId('legacy'),
      title: p.title ?? '',
      date: p.date ?? TODAY,
      note: p.note ?? '',
      link: p.link,
      fileName: p.fileName,
      fileData: p.fileData,
    };
  });
}

function normalizeExtraProjects(raw: unknown): ExtraProject[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const p = item as Partial<ExtraProject>;
    return {
      id: p.id ?? makeId('legacy'),
      title: p.title ?? '',
      state: p.state ?? 'Fikir',
      stateColor: p.stateColor ?? '#8C6B70',
      note: p.note ?? '',
      date: p.date ?? TODAY,
      image: p.image,
      checklist: Array.isArray(p.checklist) ? p.checklist : [],
    };
  });
}

function loadPersisted(): PersistedState {
  const base = defaultPersisted();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return {
      ...base,
      ...parsed,
      extraPrograms: normalizeExtraPrograms(parsed.extraPrograms),
      extraProjects: normalizeExtraProjects(parsed.extraProjects),
      diaryEntries: Array.isArray(parsed.diaryEntries) ? parsed.diaryEntries : base.diaryEntries,
      poemEntries: Array.isArray(parsed.poemEntries) ? parsed.poemEntries : base.poemEntries,
      profileName: typeof parsed.profileName === 'string' && parsed.profileName.trim() ? parsed.profileName : base.profileName,
    };
  } catch {
    return base;
  }
}

// entry === null anlamı "hash'te belirtilmemiş" (ör. sadece "#projects") —
// liste görünümü mü yoksa varsayılan bir seçim mi gösterileceği ekrana
// göre değişir (Learn her zaman bir makale gösterir, entry??0 kullanır;
// Projects null'da listeyi, bir sayı geldiğinde detay sayfasını gösterir).
function parseHash(): { screen: Screen; entry: number | null } {
  const h = (typeof window !== 'undefined' ? window.location.hash : '').replace('#', '');
  if (!h) return { screen: 'home', entry: null };
  const [scr, entryStr] = h.split('/');
  if (VALID_SCREENS.includes(scr as Screen)) {
    return { screen: scr as Screen, entry: entryStr !== undefined ? parseInt(entryStr, 10) || 0 : null };
  }
  return { screen: 'home', entry: null };
}

export interface AppStateValue {
  screen: Screen;
  entry: number | null;
  navigate: (screen: Screen, entry?: number) => void;
  goBack: () => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;

  profileOpen: boolean;
  toggleProfile: () => void;

  profileName: string;
  editingProfile: boolean;
  qProfileName: string;
  setQProfileName: (v: string) => void;
  startEditProfile: () => void;
  cancelEditProfile: () => void;
  saveProfileName: () => void;

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

  programAttachments: Record<string, ProgramAttachment>;
  updateProgramAttachment: (title: string, patch: Partial<ProgramAttachment>) => void;
  removeProgramFile: (title: string) => void;
  updateExtraProgram: (id: string, patch: Partial<ExtraProgram>) => void;
  removeExtraProgramFile: (id: string) => void;

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
  extraPrograms: ExtraProgram[];

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

  topicLinks: Record<string, RelatedLink[]>;
  addTopicLink: (topicTitle: string, linkTitle: string, url: string) => void;
  removeTopicLink: (topicTitle: string, linkId: string) => void;

  projectOverrides: Record<number, ProjectOverride>;
  toggleProjectChecklistItem: (key: string, itemId: string) => void;
  addProjectChecklistItem: (key: string, text: string) => void;
  removeProjectChecklistItem: (key: string, itemId: string) => void;
  setProjectState: (key: string, state: string, stateColor: string) => void;
  setProjectNote: (key: string, note: string) => void;
  setProjectImage: (key: string, image: string) => void;

  diaryEntries: DiaryEntryX[];
  addDiaryEntry: (text: string) => void;
  updateDiaryEntry: (id: string, text: string) => void;
  deleteDiaryEntry: (id: string) => void;

  poemEntries: PoemX[];
  addPoem: (title: string, text: string) => void;
  updatePoem: (id: string, title: string, text: string) => void;
  deletePoem: (id: string) => void;

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

  discoveredPrograms: DiscoveredProgram[];
  dismissDiscoveredProgram: (id: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedState>(loadPersisted);
  const persistedRef = useRef(persisted);
  persistedRef.current = persisted;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (err) {
      // localStorage kotası dolduysa (büyük bir görsel yüzünden — artık
      // görseller kaydetmeden önce küçültülüyor ama eski kayıtlarda ham
      // görseller kalmış olabilir) en azından metin verisini kaybetmemek
      // için görselleri çıkarıp bir kez daha dene.
      console.warn('[AppState] localStorage kaydı başarısız, görseller çıkarılıp yeniden denenecek:', err);
      try {
        const stripped: PersistedState = {
          ...persisted,
          extraTopics: persisted.extraTopics.map((t) => ({ ...t, image: undefined })),
          extraProjects: persisted.extraProjects.map((p) => ({ ...p, image: undefined })),
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      } catch (err2) {
        console.error('[AppState] localStorage kaydı görseller çıkarılınca da başarısız oldu:', err2);
      }
    }
  }, [persisted]);

  const patch = (p: Partial<PersistedState>) => setPersisted((s) => ({ ...s, ...p }));

  // Bir Bir Şey Öğrendim girişi özetlenince hem kendi `summary` alanını
  // doldurur hem de Akademik Gelişim'e gerçek bir kayıt ekler — hem
  // saveLearnEntry hem de aşağıdaki gecikmeli özetleme kuyruğu (Aşama 12)
  // bu ortak yolu kullanır.
  const recordLearnSummary = (entryId: string, title: string, summary: string) => {
    setPersisted((s) => ({
      ...s,
      learnEntries: s.learnEntries.map((e) => (e.id === entryId ? { ...e, summary } : e)),
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
  };

  // Aşama 12 — Gecikmeli Özetleme Kuyruğu: bir giriş Ollama'ya
  // erişilemeyen bir cihazda eklenirse `summary` boş kalır (sessiz
  // vazgeçme, bkz. Aşama 10 — kullanıcıya hata gösterilmez, giriş
  // `özetlenmedi` durumunda kalır; durum burada ayrı bir alan yerine
  // `summary`'nin varlığından türetiliyor, çünkü persisted.learnEntries
  // zaten sadece kullanıcı girişlerini tutuyor — seed girişlerin hepsinde
  // `summary` her zaman dolu). Uygulama Ollama'nın erişilebilir olduğu bir
  // cihazda (yeniden) açıldığında, bekleyen tüm özetlenmemiş girişleri
  // burada sırayla (paralel değil — yerel modele aynı anda birden fazla
  // istek göndermemek için) işleriz. Mevcut Ollama proxy'sine dokunulmuyor,
  // sadece "ne zaman tetiklenir" katmanı eklendi.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await pingOllama();
      if (cancelled || !ok) return;
      const pending = persistedRef.current.learnEntries.filter((e) => !e.summary);
      for (const entry of pending) {
        if (cancelled) return;
        const summary = await summarizeLearnEntry(entry.title, entry.body.join('\n\n'));
        if (cancelled || !summary) continue;
        recordLearnSummary(entry.id, entry.title, summary);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [{ screen, entry }, setRoute] = useState(parseHash);
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (nextScreen: Screen, nextEntry?: number) => {
    const nextHash = nextEntry !== undefined ? `${nextScreen}/${nextEntry}` : nextScreen;
    if (window.location.hash.replace('#', '') === nextHash) {
      setRoute({ screen: nextScreen, entry: nextEntry ?? null });
    } else {
      window.location.hash = nextHash;
    }
    setRoute({ screen: nextScreen, entry: nextEntry ?? null });
  };
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else navigate('home');
  };

  // Günlük ekranından çıkınca (Geri tuşu dahil — tarayıcı geri tuşu
  // navigate()'i değil doğrudan hashchange'i tetikliyor, bu yüzden kilit
  // sıfırlama mantığı burada, screen değişimini izleyerek yapılıyor) kilit
  // tekrar kapansın. `unlocked` bilerek persisted değil — sayfa
  // yenilenince de kilitli başlar.
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    if (screen !== 'diary') setUnlocked(false);
  }, [screen]);

  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [profileOpen, setProfileOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [qProfileName, setQProfileName] = useState('');
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

  // Program Keşfi (PLAN.md Aşama 11) — alakalı bulunmuş, henüz gizlenmemiş
  // sonuçlar her açılışta çekiliyor (Home'daki "Keşfedilen Programlar"
  // kartı için).
  const [discoveredPrograms, setDiscoveredPrograms] = useState<DiscoveredProgram[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchRelevantPrograms().then((items) => {
      if (!cancelled) setDiscoveredPrograms(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Aşama 12'deki gecikmeli özetleme kuyruğuyla AYNI mantık: GitHub
  // Actions taraması ham sonuçları "filtrelenmedi" durumunda bırakır
  // (profil filtresi orada UYGULANMAZ — sadece Ollama'nın erişilebilir
  // olduğu bir cihazda mümkün). Burada, Ollama erişilebilirse bekleyen
  // tüm sonuçlar sırayla (paralel değil) sınıflandırılıp tek bir istekte
  // toplu olarak işaretleniyor — Telegram bildirimi de bu noktada
  // (mark-filtered içinde) gönderiliyor, tarama anında değil.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await pingOllama();
      if (cancelled || !ok) return;
      const pending = await fetchPendingPrograms();
      if (cancelled || pending.length === 0) return;
      const results: { id: string; relevant: boolean }[] = [];
      for (const item of pending) {
        if (cancelled) return;
        const relevant = await classifyProgramRelevance(item.title, item.snippet);
        if (relevant === null) continue; // belirsiz/başarısız — filtrelenmedi durumunda kalsın, tekrar denenir
        results.push({ id: item.id, relevant });
      }
      if (cancelled || results.length === 0) return;
      await markFilteredPrograms(results);
      const relevant = await fetchRelevantPrograms();
      if (!cancelled) setDiscoveredPrograms(relevant);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismissDiscoveredProgram = (id: string) => {
    setDiscoveredPrograms((cur) => cur.filter((p) => p.id !== id));
    dismissProgram(id);
  };

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

      profileName: persisted.profileName,
      editingProfile,
      qProfileName,
      setQProfileName,
      startEditProfile: () => {
        setQProfileName(persistedRef.current.profileName);
        setEditingProfile(true);
      },
      cancelEditProfile: () => setEditingProfile(false),
      saveProfileName: () => {
        const v = qProfileName.trim();
        if (!v) return;
        patch({ profileName: v });
        setEditingProfile(false);
      },

      width,

      unlocked,
      pass,
      setPass,
      unlock: () => setUnlocked(true),
      lock: () => {
        setUnlocked(false);
        setPass('');
      },

      addingProgram,
      qProgram,
      setQProgram,
      startAddProgram: () => setAddingProgram(true),
      saveProgram: () => {
        const v = qProgram.trim();
        if (!v) return;
        patch({
          extraPrograms: [...persistedRef.current.extraPrograms, { id: makeId('program'), title: v, date: TODAY, note: '' }],
        });
        setQProgram('');
        setAddingProgram(false);
      },

      programAttachments: persisted.programAttachments,
      updateProgramAttachment: (title: string, p: Partial<ProgramAttachment>) => {
        patch({
          programAttachments: {
            ...persistedRef.current.programAttachments,
            [title]: { ...persistedRef.current.programAttachments[title], ...p },
          },
        });
      },
      removeProgramFile: (title: string) => {
        const cur = persistedRef.current.programAttachments[title];
        if (!cur) return;
        patch({
          programAttachments: {
            ...persistedRef.current.programAttachments,
            [title]: { ...cur, fileName: undefined, fileData: undefined },
          },
        });
      },
      updateExtraProgram: (id: string, p: Partial<ExtraProgram>) => {
        patch({ extraPrograms: persistedRef.current.extraPrograms.map((x) => (x.id === id ? { ...x, ...p } : x)) });
      },
      removeExtraProgramFile: (id: string) => {
        patch({
          extraPrograms: persistedRef.current.extraPrograms.map((x) =>
            x.id === id ? { ...x, fileName: undefined, fileData: undefined } : x,
          ),
        });
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
            {
              id: makeId('project'),
              title: v || 'Fotoğraf fikri',
              state: 'Fikir',
              stateColor: '#8C6B70',
              note: '',
              date: TODAY,
              image,
              checklist: [],
            },
            ...persistedRef.current.extraProjects,
          ],
        });
        setQProject('');
      },

      extraLinks: persisted.extraLinks,
      extraTopics: persisted.extraTopics,
      extraProjects: persisted.extraProjects,
      extraPrograms: persisted.extraPrograms,

      topicLinks: persisted.topicLinks,
      addTopicLink: (topicTitle: string, linkTitle: string, url: string) => {
        const cleanUrl = url.trim();
        if (!cleanUrl) return;
        const newLink: RelatedLink = { id: makeId('tlink'), title: linkTitle.trim() || deriveTitleFromUrl(cleanUrl), url: cleanUrl };
        patch({
          topicLinks: {
            ...persistedRef.current.topicLinks,
            [topicTitle]: [...(persistedRef.current.topicLinks[topicTitle] || []), newLink],
          },
        });
      },
      removeTopicLink: (topicTitle: string, linkId: string) => {
        patch({
          topicLinks: {
            ...persistedRef.current.topicLinks,
            [topicTitle]: (persistedRef.current.topicLinks[topicTitle] || []).filter((l) => l.id !== linkId),
          },
        });
      },

      projectOverrides: persisted.projectOverrides,
      toggleProjectChecklistItem: (key: string, itemId: string) => {
        const ref = parseProjectKey(key);
        if (ref.kind === 'extra') {
          patch({
            extraProjects: persistedRef.current.extraProjects.map((p) =>
              p.id === ref.id
                ? { ...p, checklist: p.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)) }
                : p,
            ),
          });
        } else {
          const cur = persistedRef.current.projectOverrides[ref.index];
          const list = cur?.checklist ?? [];
          patch({
            projectOverrides: {
              ...persistedRef.current.projectOverrides,
              [ref.index]: { ...cur, checklist: list.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)) },
            },
          });
        }
      },
      addProjectChecklistItem: (key: string, text: string) => {
        const v = text.trim();
        if (!v) return;
        const item: ChecklistItem = { id: makeId('task'), text: v, done: false };
        const ref = parseProjectKey(key);
        if (ref.kind === 'extra') {
          patch({
            extraProjects: persistedRef.current.extraProjects.map((p) =>
              p.id === ref.id ? { ...p, checklist: [...p.checklist, item] } : p,
            ),
          });
        } else {
          const cur = persistedRef.current.projectOverrides[ref.index];
          const list = cur?.checklist ?? [];
          patch({
            projectOverrides: {
              ...persistedRef.current.projectOverrides,
              [ref.index]: { ...cur, checklist: [...list, item] },
            },
          });
        }
      },
      removeProjectChecklistItem: (key: string, itemId: string) => {
        const ref = parseProjectKey(key);
        if (ref.kind === 'extra') {
          patch({
            extraProjects: persistedRef.current.extraProjects.map((p) =>
              p.id === ref.id ? { ...p, checklist: p.checklist.filter((c) => c.id !== itemId) } : p,
            ),
          });
        } else {
          const cur = persistedRef.current.projectOverrides[ref.index];
          const list = cur?.checklist ?? [];
          patch({
            projectOverrides: {
              ...persistedRef.current.projectOverrides,
              [ref.index]: { ...cur, checklist: list.filter((c) => c.id !== itemId) },
            },
          });
        }
      },
      setProjectState: (key: string, state: string, stateColor: string) => {
        const ref = parseProjectKey(key);
        if (ref.kind === 'extra') {
          patch({
            extraProjects: persistedRef.current.extraProjects.map((p) => (p.id === ref.id ? { ...p, state, stateColor } : p)),
          });
        } else {
          patch({
            projectOverrides: {
              ...persistedRef.current.projectOverrides,
              [ref.index]: { ...persistedRef.current.projectOverrides[ref.index], state, stateColor },
            },
          });
        }
      },
      setProjectNote: (key: string, note: string) => {
        const ref = parseProjectKey(key);
        if (ref.kind === 'extra') {
          patch({ extraProjects: persistedRef.current.extraProjects.map((p) => (p.id === ref.id ? { ...p, note } : p)) });
        } else {
          patch({
            projectOverrides: {
              ...persistedRef.current.projectOverrides,
              [ref.index]: { ...persistedRef.current.projectOverrides[ref.index], note },
            },
          });
        }
      },
      setProjectImage: (key: string, image: string) => {
        const ref = parseProjectKey(key);
        if (ref.kind === 'extra') {
          patch({ extraProjects: persistedRef.current.extraProjects.map((p) => (p.id === ref.id ? { ...p, image } : p)) });
        } else {
          patch({
            projectOverrides: {
              ...persistedRef.current.projectOverrides,
              [ref.index]: { ...persistedRef.current.projectOverrides[ref.index], image },
            },
          });
        }
      },

      diaryEntries: persisted.diaryEntries,
      addDiaryEntry: (text: string) => {
        const v = text.trim();
        if (!v) return;
        patch({
          diaryEntries: [{ id: makeId('diary'), date: TODAY, text: v }, ...persistedRef.current.diaryEntries],
        });
      },
      updateDiaryEntry: (id: string, text: string) => {
        const v = text.trim();
        if (!v) return;
        patch({
          diaryEntries: persistedRef.current.diaryEntries.map((d) => (d.id === id ? { ...d, text: v } : d)),
        });
      },
      deleteDiaryEntry: (id: string) => {
        patch({ diaryEntries: persistedRef.current.diaryEntries.filter((d) => d.id !== id) });
      },

      poemEntries: persisted.poemEntries,
      addPoem: (title: string, text: string) => {
        const t = title.trim();
        const b = text.trim();
        if (!t || !b) return;
        patch({
          poemEntries: [{ id: makeId('poem'), title: t, text: b, date: TODAY }, ...persistedRef.current.poemEntries],
        });
      },
      updatePoem: (id: string, title: string, text: string) => {
        const t = title.trim();
        const b = text.trim();
        if (!t || !b) return;
        patch({
          poemEntries: persistedRef.current.poemEntries.map((p) => (p.id === id ? { ...p, title: t, text: b } : p)),
        });
      },
      deletePoem: (id: string) => {
        patch({ poemEntries: persistedRef.current.poemEntries.filter((p) => p.id !== id) });
      },

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
          recordLearnSummary(entry.id, title, summary);
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

      discoveredPrograms,
      dismissDiscoveredProgram,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      screen,
      entry,
      persisted,
      profileOpen,
      editingProfile,
      qProfileName,
      width,
      unlocked,
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
      discoveredPrograms,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used within AppStateProvider');
  return ctx;
}
