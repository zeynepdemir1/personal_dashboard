// Google Calendar'ın gizli iCal link(ler)inden salt-okunur senkronizasyon.
// Birden fazla takvim desteklenir (bkz. PLAN.md Aşama 31) — önce
// `/api/calendars` ile hangi takvimlerin yapılandırılı olduğu (index +
// etiket, ör. "Dersler") öğrenilir, sonra her biri için ayrı bir
// `/api/calendar.ics?cal=<index>` isteği atılır ve sonuçlar birleştirilir.
// Gerçek istekler tarayıcıdan DEĞİL, Vite'ın geliştirme sunucusu
// proxy/middleware'inden (bkz. vite.config.ts) ya da production'da
// server.js'ten gidiyor — bu yüzden gizli adresler hiçbir zaman istemci
// koduna girmiyor. NOT: `npm run dev`/`node server.js` dışında (örn. statik
// `vite build` çıktısı tek başına) sunucu tarafı olmadığı için bu
// senkronizasyon çalışmaz (bkz. PLAN.md Aşama 11 — barındırma kararı).
import ICAL from 'ical.js';

export interface GCalEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  calendarIndex: number;
  calendarLabel: string;
}

export interface GCalSource {
  index: number;
  label: string;
}

export type GCalSyncStatus = 'unconfigured' | 'error' | 'ok';

const MAX_OCCURRENCES_PER_EVENT = 500;

function expandEvent(
  event: InstanceType<typeof ICAL.Event>,
  rangeStart: Date,
  rangeEnd: Date,
  calendarIndex: number,
  calendarLabel: string,
): GCalEvent[] {
  const results: GCalEvent[] = [];
  const title = event.summary || '(başlıksız)';
  const allDay = event.startDate.isDate;

  if (!event.isRecurring()) {
    const start = event.startDate.toJSDate();
    const end = event.endDate.toJSDate();
    if (end >= rangeStart && start <= rangeEnd) results.push({ title, start, end, allDay, calendarIndex, calendarLabel });
    return results;
  }

  const durationMs = event.duration.toSeconds() * 1000;
  const iterator = event.iterator();
  for (let i = 0; i < MAX_OCCURRENCES_PER_EVENT; i++) {
    const next = iterator.next();
    if (!next) break;
    const start = next.toJSDate();
    if (start > rangeEnd) break;
    const end = new Date(start.getTime() + durationMs);
    if (end >= rangeStart) results.push({ title, start, end, allDay, calendarIndex, calendarLabel });
  }
  return results;
}

export function parseIcs(
  icsText: string,
  rangeStart: Date,
  rangeEnd: Date,
  calendarIndex = 1,
  calendarLabel = 'Takvim',
): GCalEvent[] {
  const jcalData = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  const events: GCalEvent[] = [];
  for (const vevent of vevents) {
    try {
      events.push(...expandEvent(new ICAL.Event(vevent), rangeStart, rangeEnd, calendarIndex, calendarLabel));
    } catch {
      // Tek bir bozuk VEVENT tüm senkronizasyonu düşürmesin.
    }
  }
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function eventsOnDate(events: GCalEvent[], year: number, month: number, day: number): GCalEvent[] {
  return events.filter(
    (e) => e.start.getFullYear() === year && e.start.getMonth() === month && e.start.getDate() === day,
  );
}

async function fetchCalendarSources(): Promise<GCalSource[]> {
  try {
    const res = await fetch('/api/calendars');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.calendars) ? data.calendars : [];
  } catch {
    return [];
  }
}

export async function fetchGoogleCalendarEvents(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<{ status: GCalSyncStatus; events: GCalEvent[]; sources: GCalSource[] }> {
  const sources = await fetchCalendarSources();
  if (sources.length === 0) {
    // `/api/calendars` hiç kurulu değil (eski bir sunucu) ya da hiçbir
    // GCAL_ICS_URL tanımlı değil — ikisi de "bağlı değil" demek.
    return { status: 'unconfigured', events: [], sources: [] };
  }

  const results = await Promise.all(
    sources.map(async (source) => {
      try {
        const res = await fetch(`/api/calendar.ics?cal=${source.index}`);
        if (!res.ok) return { ok: false as const, events: [] as GCalEvent[] };
        const text = await res.text();
        if (!text.includes('BEGIN:VCALENDAR')) {
          // Proxy/middleware kurulu değil -> Vite isteği kendi SPA
          // fallback'ine düşürüyor, ICS değil HTML dönüyor.
          return { ok: false as const, events: [] as GCalEvent[] };
        }
        return { ok: true as const, events: parseIcs(text, rangeStart, rangeEnd, source.index, source.label) };
      } catch {
        return { ok: false as const, events: [] as GCalEvent[] };
      }
    }),
  );

  const anyOk = results.some((r) => r.ok);
  if (!anyOk) return { status: 'error', events: [], sources };

  const events = results.flatMap((r) => r.events).sort((a, b) => a.start.getTime() - b.start.getTime());
  return { status: 'ok', events, sources };
}
