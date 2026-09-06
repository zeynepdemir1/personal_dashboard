// Google Calendar'ın gizli iCal linkinden salt-okunur senkronizasyon.
// Gerçek istek tarayıcıdan DEĞİL, Vite'ın geliştirme sunucusu proxy'sinden
// gidiyor (bkz. vite.config.ts) — bu yüzden gizli adres hiçbir zaman
// istemci koduna girmiyor, sadece `/api/calendar.ics` (aynı origin) çağrılıyor.
// NOT: Bu proxy sadece `npm run dev` sırasında var; statik `vite build`
// çıktısında sunucu tarafı olmadığı için bu senkronizasyon çalışmaz
// (bkz. PLAN.md Aşama 11 — barındırma kararı).
import ICAL from 'ical.js';

export interface GCalEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

export type GCalSyncStatus = 'unconfigured' | 'error' | 'ok';

const MAX_OCCURRENCES_PER_EVENT = 500;

function expandEvent(event: InstanceType<typeof ICAL.Event>, rangeStart: Date, rangeEnd: Date): GCalEvent[] {
  const results: GCalEvent[] = [];
  const title = event.summary || '(başlıksız)';
  const allDay = event.startDate.isDate;

  if (!event.isRecurring()) {
    const start = event.startDate.toJSDate();
    const end = event.endDate.toJSDate();
    if (end >= rangeStart && start <= rangeEnd) results.push({ title, start, end, allDay });
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
    if (end >= rangeStart) results.push({ title, start, end, allDay });
  }
  return results;
}

export function parseIcs(icsText: string, rangeStart: Date, rangeEnd: Date): GCalEvent[] {
  const jcalData = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  const events: GCalEvent[] = [];
  for (const vevent of vevents) {
    try {
      events.push(...expandEvent(new ICAL.Event(vevent), rangeStart, rangeEnd));
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

export async function fetchGoogleCalendarEvents(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<{ status: GCalSyncStatus; events: GCalEvent[] }> {
  try {
    const res = await fetch('/api/calendar.ics');
    if (!res.ok) return { status: 'error', events: [] };
    const text = await res.text();
    if (!text.includes('BEGIN:VCALENDAR')) {
      // Proxy kurulu değil (GCAL_ICS_URL yok) -> Vite isteği kendi SPA
      // fallback'ine düşürüyor, ICS değil HTML dönüyor.
      return { status: 'unconfigured', events: [] };
    }
    return { status: 'ok', events: parseIcs(text, rangeStart, rangeEnd) };
  } catch {
    return { status: 'error', events: [] };
  }
}
