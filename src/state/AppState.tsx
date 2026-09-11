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
import { analyzeDiscoveredProgram, pingOllama, summarizeLearnEntry } from '../lib/ollama';
import { dismissProgram, fetchPendingPrograms, fetchRelevantPrograms, markFilteredPrograms, type DiscoveredProgram } from '../lib/discover';
import { formatMonthDay, referenceToday, isoDateToDotDate, toDateKey } from '../lib/dates';
import { DEFAULT_PROFILE_NAME } from '../lib/profile';
import { BACKGROUND_IMAGES } from '../lib/backgrounds';
import { MOBILE_BREAKPOINT } from '../lib/theme';
import {
  VALID_SCREENS,
  type ChecklistItem,
  type DiaryEntryX,
  type DiarySecurity,
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
import { decryptText, deriveDiaryKey, encryptText, makeCanary, randomSalt, verifyCanary } from '../lib/diaryCrypto';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Linkler kartındaki "Linke git / Detayları gör" menüsü için — "Detayları
// gör" eskiden hiçbir şey yapmıyordu (bkz. PLAN.md Aşama 19 madde 1); artık
// kartın tüm alanlarını (kategori, tarih, not, etiketler) gösteren bir
// detay görünümüne açılıyor, bu yüzden menü artık sadece title/url değil
// tüm link kaydını taşıyor.
interface LinkMenuData {
  title: string;
  url: string;
  kind: string;
  kindColor: string;
  date: string;
  note: string;
  tags: string[];
}

// Statik proje/program referansları "static:<index>" ya da "extra:<id>"
// şeklinde kodlanır — Topics.tsx'teki eski "extra${j}" numaraya-gömme
// hilesinden daha okunaklı bir sürümü.
type ProjectKey = { kind: 'static'; index: number } | { kind: 'extra'; id: string };
function parseProjectKey(key: string): ProjectKey {
  if (key.startsWith('extra:')) return { kind: 'extra', id: key.slice(6) };
  return { kind: 'static', index: parseInt(key.slice(7), 10) };
}

// Ana sayfanın haftalık/aylık takvimi PLAN.md Aşama 22'de oklarla
// gezilebilir hale geldi (varsayılan olarak hâlâ 31 Ağustos - 30 Eylül
// 2026'yı gösteriyor, ama kullanıcı başka aylara/haftalara da gidebiliyor)
// — Google Calendar .ics'i zaten TEK SEFERDE tam metin olarak çekilip
// yerelde (parseIcs) tarih aralığına göre filtreleniyor (bkz.
// googleCalendar.ts), yani geniş bir pencere ekstra bir ağ isteği
// GEREKTİRMİYOR. Birkaç yıllık cömert bir pencere, makul bir gezinme
// aralığını (geçmiş/gelecek aylar) kapsar.
const GCAL_RANGE_START = new Date(2024, 0, 1);
const GCAL_RANGE_END = new Date(2029, 11, 31, 23, 59, 59);

const STORAGE_KEY = 'muhendis-portal-state-v1';

interface PersistedState {
  extraLinks: ExtraLink[];
  extraTopics: ExtraTopic[];
  extraProjects: ExtraProject[];
  extraPrograms: ExtraProgram[];
  hiddenPrograms: string[];
  programAttachments: Record<string, ProgramAttachment>;
  learnEntries: LearnEntry[];
  extraGrowthNotes: GrowthNote[];
  topicOverrides: Record<number, TopicOverride>;
  topicLinks: Record<string, RelatedLink[]>;
  projectOverrides: Record<number, ProjectOverride>;
  dayNotes: Record<string, DayNote[]>;
  diaryEntries: DiaryEntryX[];
  diarySecurity: DiarySecurity | null;
  poemEntries: PoemX[];
  calView: 'week' | 'month';
  sidebarOpen: boolean;
  profileName: string;
  profilePhoto: string | null;
  backgroundImages: string[];
}

function defaultPersisted(): PersistedState {
  return {
    extraLinks: [],
    extraTopics: [],
    extraProjects: [],
    extraPrograms: [],
    hiddenPrograms: [],
    programAttachments: {},
    learnEntries: [],
    extraGrowthNotes: [],
    topicOverrides: {},
    topicLinks: {},
    projectOverrides: {},
    dayNotes: JSON.parse(JSON.stringify(SEED_DAY_NOTES)),
    diaryEntries: DIARY.map((d, i) => ({ id: `seed-${i}`, ...d })),
    diarySecurity: null,
    poemEntries: POEMS.map((p, i) => ({ id: `seed-${i}`, ...p })),
    calView: 'week',
    sidebarOpen: true,
    profileName: DEFAULT_PROFILE_NAME,
    profilePhoto: null,
    backgroundImages: [...BACKGROUND_IMAGES],
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

// PLAN.md Aşama 22: dayNotes anahtarları eskiden "ayın kaçı" (1-30, hep
// Eylül 2026 anlamına geliyordu) idi, artık tam YYYY-MM-DD. Canlıda
// (Render) zaten eski numaralı anahtarlarla kaydedilmiş gerçek kullanıcı
// verisi olabilir — bunu sessizce yeni şekle taşıyoruz (numaralı bir
// anahtar görürsek 2026 Eylül'üne ait olduğunu varsayıp dönüştürüyoruz).
function normalizeDayNotes(raw: unknown): Record<string, DayNote[]> {
  if (!raw || typeof raw !== 'object') return JSON.parse(JSON.stringify(SEED_DAY_NOTES));
  const out: Record<string, DayNote[]> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(val)) continue;
    const dateKey = /^\d+$/.test(key) ? `2026-09-${key.padStart(2, '0')}` : key;
    out[dateKey] = val as DayNote[];
  }
  return out;
}

// PLAN.md Aşama 20: kişisel içerik artık localStorage yerine sunucuda
// (Upstash Redis, `/api/state`) tutuluyor — bu fonksiyon, ister sunucudan
// gelsin ister eski localStorage'dan (tek seferlik geçiş, bkz. aşağıdaki
// mount effect'i), HAM/güvenilmez bir JSON nesnesini güvenli bir
// PersistedState'e çeviriyor. Saf bir fonksiyon — kendi başına localStorage/
// ağ erişimi yok, sadece elindeki veriyi normalize ediyor.
function normalizeLoadedState(parsed: unknown, mobile: boolean): PersistedState {
  const base = defaultPersisted();
  if (!parsed || typeof parsed !== 'object') return mobile ? { ...base, sidebarOpen: false } : base;
  const p = parsed as Record<string, unknown>;
  return {
    ...base,
    ...p,
    extraPrograms: normalizeExtraPrograms(p.extraPrograms),
    extraProjects: normalizeExtraProjects(p.extraProjects),
    diaryEntries: Array.isArray(p.diaryEntries) ? (p.diaryEntries as DiaryEntryX[]) : base.diaryEntries,
    diarySecurity:
      p.diarySecurity && typeof p.diarySecurity === 'object' && (p.diarySecurity as DiarySecurity).enabled
        ? (p.diarySecurity as DiarySecurity)
        : null,
    poemEntries: Array.isArray(p.poemEntries) ? (p.poemEntries as PoemX[]) : base.poemEntries,
    dayNotes: p.dayNotes ? normalizeDayNotes(p.dayNotes) : base.dayNotes,
    hiddenPrograms: Array.isArray(p.hiddenPrograms) ? (p.hiddenPrograms as unknown[]).filter((x): x is string => typeof x === 'string') : base.hiddenPrograms,
    profileName: typeof p.profileName === 'string' && p.profileName.trim() ? p.profileName : base.profileName,
    profilePhoto: typeof p.profilePhoto === 'string' ? p.profilePhoto : null,
    backgroundImages:
      Array.isArray(p.backgroundImages) && p.backgroundImages.length > 0
        ? (p.backgroundImages as unknown[]).filter((x): x is string => typeof x === 'string')
        : base.backgroundImages,
    // Telefon genişliğinde sidebar artık tam ekran bir overlay (bkz.
    // Sidebar.tsx, PLAN.md Aşama 18) — kaydedilmiş değer ne olursa olsun,
    // telefonda her zaman kapalı başlar (bir "flaş" olmadan, bkz. mount
    // effect'indeki `stateLoading` kapısı).
    sidebarOpen: mobile ? false : typeof p.sidebarOpen === 'boolean' ? p.sidebarOpen : base.sidebarOpen,
  };
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
  // PLAN.md Aşama 20 — kişisel içerik artık sunucudan (Upstash Redis)
  // asenkron olarak yükleniyor; `stateLoading` true iken `App.tsx` gerçek
  // arayüz yerine kısa bir yükleme ekranı gösteriyor (varsayılan/boş
  // içeriğin bir anlığına görünmesini önlemek için).
  stateLoading: boolean;
  stateError: string | null;

  screen: Screen;
  entry: number | null;
  navigate: (screen: Screen, entry?: number) => void;
  goBack: () => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;

  profileOpen: boolean;
  toggleProfile: () => void;

  profileName: string;
  profilePhoto: string | null;
  setProfilePhoto: (url: string) => void;
  backgroundImages: string[];
  addBackgroundImage: (url: string) => void;
  removeBackgroundImage: (url: string) => void;
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
  lock: () => void;
  diarySecurityEnabled: boolean;
  diaryUnlocking: boolean;
  diaryUnlockError: string | null;
  setupDiaryPassword: (password: string) => void;
  unlockDiaryWithPassword: (password: string) => void;

  addingProgram: boolean;
  qProgram: string;
  setQProgram: (v: string) => void;
  qProgramDate: string;
  setQProgramDate: (v: string) => void;
  qProgramNote: string;
  setQProgramNote: (v: string) => void;
  qProgramLink: string;
  setQProgramLink: (v: string) => void;
  startAddProgram: () => void;
  saveProgram: () => void;

  programAttachments: Record<string, ProgramAttachment>;
  updateProgramAttachment: (title: string, patch: Partial<ProgramAttachment>) => void;
  removeProgramFile: (title: string) => void;
  updateExtraProgram: (id: string, patch: Partial<ExtraProgram>) => void;
  removeExtraProgramFile: (id: string) => void;
  removeExtraProgram: (id: string) => void;
  hiddenPrograms: string[];
  hideStaticProgram: (title: string) => void;

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

  dayNotes: Record<string, DayNote[]>;
  dayPanel: string | null;
  dayPanelInput: string;
  dayPanelTime: string;
  openDayPanel: (dateKey: string) => void;
  closeDayPanel: () => void;
  setDayPanelInput: (v: string) => void;
  setDayPanelTime: (v: string) => void;
  addDayPanelItem: () => void;
  removeDayNote: (dateKey: string, id: string) => void;
  editDayNote: (dateKey: string, id: string, patch: Partial<Pick<DayNote, 'time' | 'end' | 'label'>>) => void;

  linkMenu: LinkMenuData | null;
  openLinkMenu: (link: LinkMenuData) => void;
  closeLinkMenu: () => void;
  linkDetailOpen: boolean;
  showLinkDetails: () => void;

  gcalStatus: GCalSyncStatus;
  gcalEvents: GCalEvent[];

  discoveredPrograms: DiscoveredProgram[];
  dismissDiscoveredProgram: (id: string) => void;
  followDiscoveredProgram: (program: DiscoveredProgram) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedState>(() => defaultPersisted());
  const persistedRef = useRef(persisted);
  persistedRef.current = persisted;

  // İlk yükleme henüz bitmeden kaydetme effect'i tetiklenirse (varsayılan
  // boş state), sunucudaki GERÇEK veriyi bir anlığına ezip geri
  // yazabilirdi — bu bayrak, ilk fetch/geçiş tamamlanana kadar kaydetmeyi
  // engelliyor.
  const hasLoadedRef = useRef(false);
  const [stateLoading, setStateLoading] = useState(true);
  const [stateError, setStateError] = useState<string | null>(null);

  // PLAN.md Aşama 20 — ilk açılışta sunucudan (Upstash) durumu çek. Sunucuda
  // henüz veri yoksa (`exists:false`) ve tarayıcıda ESKİ localStorage
  // verisi varsa, TEK SEFERLİK bir geçiş yapılır: o veri sunucuya
  // yazılır, başarılı olursa localStorage temizlenir. Sunucuda zaten
  // veri VARSA localStorage'a hiç bakılmaz/dokunulmaz — bu, olası bir
  // hatanın gerçek veriyi eski/bayat bir localStorage kopyasıyla
  // ezmesine karşı bilinçli bir güvenlik önlemi.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
      try {
        const res = await fetch('/api/state');
        if (!res.ok) throw new Error(`state fetch ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.exists && data.state) {
          setPersisted(normalizeLoadedState(data.state, mobile));
        } else {
          const legacyRaw = window.localStorage.getItem(STORAGE_KEY);
          if (legacyRaw) {
            let migrated: PersistedState;
            try {
              migrated = normalizeLoadedState(JSON.parse(legacyRaw), mobile);
            } catch {
              migrated = normalizeLoadedState(null, mobile);
            }
            setPersisted(migrated);
            try {
              const putRes = await fetch('/api/state', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(migrated),
              });
              if (putRes.ok) {
                window.localStorage.removeItem(STORAGE_KEY);
                console.info('[AppState] Eski localStorage verisi sunucuya (Upstash Redis) taşındı.');
              } else {
                console.warn('[AppState] Geçiş yazması başarısız — localStorage korunuyor, bir sonraki açılışta tekrar denenecek.');
              }
            } catch (err) {
              console.warn('[AppState] Geçiş yazması başarısız — localStorage korunuyor, bir sonraki açılışta tekrar denenecek:', err);
            }
          } else {
            setPersisted(normalizeLoadedState(null, mobile));
          }
        }
      } catch (err) {
        console.error('[AppState] Sunucudan durum okunamadı:', err);
        if (cancelled) return;
        setStateError('Verileriniz sunucudan yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.');
        // Çevrimdışı/erişilemez durumda en azından eski localStorage
        // kopyası varsa onu göster — hiç veri göstermemekten iyidir.
        const legacyRaw = window.localStorage.getItem(STORAGE_KEY);
        if (legacyRaw) {
          try {
            setPersisted(normalizeLoadedState(JSON.parse(legacyRaw), mobile));
          } catch {
            // yoksay, varsayılanla devam
          }
        }
      } finally {
        if (!cancelled) {
          hasLoadedRef.current = true;
          setStateLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Kaydetme: her değişiklikte sunucuya PUT — küçük bir debounce ile
  // (hızlı art arda değişiklikleri tek isteğe topluyor). İlk yükleme
  // bitmeden ASLA kaydetmiyor (yukarıdaki not).
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const timeout = setTimeout(() => {
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persisted),
      })
        .then((res) => {
          if (!res.ok) console.error('[AppState] Durum sunucuya kaydedilemedi:', res.status);
        })
        .catch((err) => console.error('[AppState] Durum sunucuya kaydedilemedi:', err));
    }, 400);
    return () => clearTimeout(timeout);
  }, [persisted]);

  // Başka bir cihaz/sekmeden yapılan değişiklikleri yakalamak için: bu
  // sekmeye geri dönülünce (odak/görünürlük değişince) sunucudan tazele.
  // Aktif düzenleme sırasında DEĞİL, sadece sekmeye dönüşte — basit ama
  // "telefonda ekledim, bilgisayarda görünüyor mu" senaryosu için yeterli.
  useEffect(() => {
    const refresh = () => {
      if (!hasLoadedRef.current || document.hidden) return;
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      fetch('/api/state')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.exists && data.state) setPersisted(normalizeLoadedState(data.state, mobile));
        })
        .catch(() => {});
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

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
  // yenilenince de kilitli başlar. `diaryKey` (türetilmiş AES anahtarı) ve
  // `diaryDecrypted` (çözülmüş görüntüleme kopyası) da SADECE bellekte —
  // kilitlenince ikisi de atılıyor, şifreli veri persisted'de zaten duruyor.
  const [unlocked, setUnlocked] = useState(false);
  const [diaryKey, setDiaryKey] = useState<CryptoKey | null>(null);
  const [diaryDecrypted, setDiaryDecrypted] = useState<DiaryEntryX[]>([]);
  const [diaryUnlocking, setDiaryUnlocking] = useState(false);
  const [diaryUnlockError, setDiaryUnlockError] = useState<string | null>(null);
  const [pass, setPass] = useState('');
  useEffect(() => {
    if (screen !== 'diary') {
      setUnlocked(false);
      setDiaryKey(null);
      setDiaryDecrypted([]);
      setDiaryUnlockError(null);
      setPass('');
    }
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
  const [addingProgram, setAddingProgram] = useState(false);
  const [qProgram, setQProgram] = useState('');
  const [qProgramDate, setQProgramDate] = useState('');
  const [qProgramNote, setQProgramNote] = useState('');
  const [qProgramLink, setQProgramLink] = useState('');
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
  const [dayPanel, setDayPanel] = useState<string | null>(null);
  const [dayPanelInput, setDayPanelInput] = useState('');
  const [dayPanelTime, setDayPanelTime] = useState('');
  const [linkMenu, setLinkMenu] = useState<LinkMenuData | null>(null);
  const [linkDetailOpen, setLinkDetailOpen] = useState(false);

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
      const results: { id: string; relevant: boolean; deadline: string | null; description: string | null }[] = [];
      for (const item of pending) {
        if (cancelled) return;
        const analysis = await analyzeDiscoveredProgram(item.title, item.snippet);
        if (analysis === null) continue; // belirsiz/başarısız — filtrelenmedi durumunda kalsın, tekrar denenir
        results.push({ id: item.id, relevant: analysis.relevant, deadline: analysis.deadline, description: analysis.description });
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

  // "Takip et" (PLAN.md Aşama 19 madde 3): keşfedilen sonucu, kullanıcı
  // elle tarih/not girmeden, Program Takvimi'ne gerçek bir kayıt olarak
  // ekler (elde varsa Ollama'nın çıkardığı son başvuru tarihiyle, notu da
  // Ollama'nın ürettiği açıklamayla dolduruyor — sonradan elle
  // düzenlenebilir). Takip edilen sonuç Program Keşfi listesinden de
  // kalkar (artık Program Takvimi'nde yaşıyor, iki yerde tekrar etmesin).
  const followDiscoveredProgram = (program: DiscoveredProgram) => {
    patch({
      extraPrograms: [
        ...persistedRef.current.extraPrograms,
        { id: makeId('program'), title: program.title, date: program.deadline || TODAY, note: program.description || '', link: program.link },
      ],
    });
    setDiscoveredPrograms((cur) => cur.filter((p) => p.id !== program.id));
    dismissProgram(program.id);
  };

  const value: AppStateValue = useMemo(
    () => ({
      stateLoading,
      stateError,

      screen,
      entry,
      navigate,
      goBack,

      sidebarOpen: persisted.sidebarOpen,
      toggleSidebar: () => patch({ sidebarOpen: !persistedRef.current.sidebarOpen }),

      profileOpen,
      toggleProfile: () => setProfileOpen((v) => !v),

      profileName: persisted.profileName,
      profilePhoto: persisted.profilePhoto,
      setProfilePhoto: (url: string) => patch({ profilePhoto: url }),
      backgroundImages: persisted.backgroundImages,
      addBackgroundImage: (url: string) =>
        patch({ backgroundImages: [...persistedRef.current.backgroundImages, url] }),
      removeBackgroundImage: (url: string) => {
        const next = persistedRef.current.backgroundImages.filter((u) => u !== url);
        // En az bir fotoğraf her zaman kalmalı — aksi halde rotasyonda
        // gösterilecek hiçbir şey kalmaz.
        if (next.length === 0) return;
        patch({ backgroundImages: next });
      },
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
      lock: () => {
        setUnlocked(false);
        setPass('');
        setDiaryKey(null);
        setDiaryDecrypted([]);
        setDiaryUnlockError(null);
      },
      diarySecurityEnabled: !!persisted.diarySecurity?.enabled,
      diaryUnlocking,
      diaryUnlockError,
      setupDiaryPassword: (password: string) => {
        const v = password.trim();
        if (!v) return;
        setDiaryUnlocking(true);
        setDiaryUnlockError(null);
        (async () => {
          const salt = randomSalt();
          const key = await deriveDiaryKey(v, salt);
          const canary = await makeCanary(key);
          // Bu ana kadar düz metin duran girişleri (Aşama 15'te CRUD
          // eklenmişti ama şifreleme yoktu) şimdi şifreliyoruz — geriye
          // dönük bir taşıma, elle bir migration adımı gerekmiyor.
          const plainEntries = persistedRef.current.diaryEntries;
          const encryptedEntries = await Promise.all(
            plainEntries.map(async (d) => ({ ...d, text: await encryptText(key, d.text) })),
          );
          patch({ diarySecurity: { enabled: true, salt, canary }, diaryEntries: encryptedEntries });
          setDiaryKey(key);
          setDiaryDecrypted(plainEntries);
          setUnlocked(true);
          setDiaryUnlocking(false);
          setPass('');
        })();
      },
      unlockDiaryWithPassword: (password: string) => {
        const v = password.trim();
        const security = persistedRef.current.diarySecurity;
        if (!v || !security) return;
        setDiaryUnlocking(true);
        setDiaryUnlockError(null);
        (async () => {
          const key = await deriveDiaryKey(v, security.salt);
          const ok = await verifyCanary(key, security.canary);
          if (!ok) {
            setDiaryUnlocking(false);
            setDiaryUnlockError('Yanlış parola.');
            return;
          }
          const decrypted = await Promise.all(
            persistedRef.current.diaryEntries.map(async (d) => ({
              ...d,
              text: (await decryptText(key, d.text)) ?? '(çözülemedi)',
            })),
          );
          setDiaryKey(key);
          setDiaryDecrypted(decrypted);
          setUnlocked(true);
          setDiaryUnlocking(false);
          setPass('');
        })();
      },

      addingProgram,
      qProgram,
      setQProgram,
      qProgramDate,
      setQProgramDate,
      qProgramNote,
      setQProgramNote,
      qProgramLink,
      setQProgramLink,
      startAddProgram: () => {
        setAddingProgram(true);
        setQProgramDate(toDateKey(referenceToday()));
      },
      saveProgram: () => {
        const v = qProgram.trim();
        if (!v) return;
        const date = isoDateToDotDate(qProgramDate) || TODAY;
        patch({
          extraPrograms: [
            ...persistedRef.current.extraPrograms,
            {
              id: makeId('program'),
              title: v,
              date,
              note: qProgramNote.trim(),
              link: qProgramLink.trim() || undefined,
            },
          ],
        });
        setQProgram('');
        setQProgramDate('');
        setQProgramNote('');
        setQProgramLink('');
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
      removeExtraProgram: (id: string) => {
        patch({ extraPrograms: persistedRef.current.extraPrograms.filter((x) => x.id !== id) });
      },
      hiddenPrograms: persisted.hiddenPrograms,
      hideStaticProgram: (title: string) => {
        if (persistedRef.current.hiddenPrograms.includes(title)) return;
        patch({ hiddenPrograms: [...persistedRef.current.hiddenPrograms, title] });
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

      // `diaryEntries` burada BİLEREK persisted.diaryEntries değil,
      // `diaryDecrypted` — persisted'deki asıl kayıt her zaman şifreli,
      // sadece kilit açıkken (diaryKey varken) çözülmüş kopyası bellekte
      // tutuluyor ve buradan gösteriliyor.
      diaryEntries: diaryDecrypted,
      addDiaryEntry: (text: string) => {
        const v = text.trim();
        if (!v || !diaryKey) return;
        const id = makeId('diary');
        const key = diaryKey;
        (async () => {
          const encrypted = await encryptText(key, v);
          patch({ diaryEntries: [{ id, date: TODAY, text: encrypted }, ...persistedRef.current.diaryEntries] });
          setDiaryDecrypted((cur) => [{ id, date: TODAY, text: v }, ...cur]);
        })();
      },
      updateDiaryEntry: (id: string, text: string) => {
        const v = text.trim();
        if (!v || !diaryKey) return;
        const key = diaryKey;
        (async () => {
          const encrypted = await encryptText(key, v);
          patch({
            diaryEntries: persistedRef.current.diaryEntries.map((d) => (d.id === id ? { ...d, text: encrypted } : d)),
          });
          setDiaryDecrypted((cur) => cur.map((d) => (d.id === id ? { ...d, text: v } : d)));
        })();
      },
      deleteDiaryEntry: (id: string) => {
        patch({ diaryEntries: persistedRef.current.diaryEntries.filter((d) => d.id !== id) });
        setDiaryDecrypted((cur) => cur.filter((d) => d.id !== id));
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
      openDayPanel: (dateKey: string) => {
        setDayPanel(dateKey);
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
          id: makeId(d),
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
      removeDayNote: (dateKey: string, id: string) => {
        patch({
          dayNotes: {
            ...persistedRef.current.dayNotes,
            [dateKey]: (persistedRef.current.dayNotes[dateKey] || []).filter((x) => x.id !== id),
          },
        });
      },
      editDayNote: (dateKey: string, id: string, p: Partial<Pick<DayNote, 'time' | 'end' | 'label'>>) => {
        patch({
          dayNotes: {
            ...persistedRef.current.dayNotes,
            [dateKey]: (persistedRef.current.dayNotes[dateKey] || []).map((x) => (x.id === id ? { ...x, ...p } : x)),
          },
        });
      },

      linkMenu,
      openLinkMenu: (link: LinkMenuData) => {
        setLinkMenu(link);
        setLinkDetailOpen(false);
      },
      closeLinkMenu: () => {
        setLinkMenu(null);
        setLinkDetailOpen(false);
      },
      linkDetailOpen,
      showLinkDetails: () => setLinkDetailOpen(true),

      gcalStatus,
      gcalEvents,

      discoveredPrograms,
      dismissDiscoveredProgram,
      followDiscoveredProgram,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      stateLoading,
      stateError,
      screen,
      entry,
      persisted,
      profileOpen,
      editingProfile,
      qProfileName,
      width,
      unlocked,
      pass,
      diaryKey,
      diaryDecrypted,
      diaryUnlocking,
      diaryUnlockError,
      addingProgram,
      qProgram,
      qProgramDate,
      qProgramNote,
      qProgramLink,
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
      linkDetailOpen,
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
