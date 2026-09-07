import { useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts, pillStyle, dayBlockStyle, gcalBlockStyle, HOUR_ROW_HEIGHT } from '../../lib/theme';
import { LINKS, PROGRAMS, TOPICS, AUG31_BLOCKS, timeToHour } from '../../lib/data';
import { computeHomeStats, computeClosedTopicsThisMonth } from '../../lib/stats';
import { daysLeftUntil, daysLeftColor, formatDaysLeft, formatMonthDay, parseDotDate } from '../../lib/dates';
import { SEED_LEARN_ENTRIES } from '../../lib/learn';
import { eventsOnDate } from '../../lib/googleCalendar';
import { compressImage } from '../../lib/image';
import { uploadImage } from '../../lib/upload';
import { formatHeaderDate, greetingName, greetingWord } from '../../lib/profile';
import { buildProjectViews } from '../../lib/projects';

const HOUR_LABELS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

const DAY_DEFS: { label: string; date: string; dayNum: number | null }[] = [
  { label: 'PZT', date: '31 Ağu', dayNum: null },
  { label: 'SAL', date: '1 Eyl', dayNum: 1 },
  { label: 'ÇAR', date: '2 Eyl', dayNum: 2 },
  { label: 'PER', date: '3 Eyl', dayNum: 3 },
  { label: 'CUM', date: '4 Eyl', dayNum: 4 },
  { label: 'CMT', date: '5 Eyl', dayNum: 5 },
  { label: 'PAZ', date: '6 Eyl', dayNum: 6 },
];

const WEEKDAY_LABELS = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
const START_OFFSET = 1; // 1 Eylül 2026 = Salı → Pazartesi hücresi boş

export function Home() {
  const app = useApp();
  const w = app.width;
  const narrow = w < 1180;
  const tight = w < 860;
  // Sadece karşılama başlığı gerçek/dinamik tarihi gösteriyor — takvim
  // ızgarası, istatistik hesapları ve Google Calendar aralığı bilerek
  // sabit referans tarihte kalıyor (Zeynep'in kararı, bkz. PLAN.md Aşama 15).
  const now = new Date();

  const gridHome: CSSProperties = narrow
    ? { display: 'grid', gridTemplateColumns: '1fr', gap: 48 }
    : { display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 56 };
  const gridThree: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${w < 900 ? 1 : 3}, 1fr)`,
    gap: 20,
  };
  const gridStats: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${tight ? 2 : 4}, 1fr)`,
    gap: 1,
    background: colors.borderStrong,
    border: `1px solid ${colors.borderStrong}`,
  };

  const homeStats = computeHomeStats(app.extraGrowthNotes.length);
  const { closed: closedTopicsThisMonth, total: totalTopics } = computeClosedTopicsThisMonth(
    app.topicOverrides,
    app.extraTopics.length,
  );

  const stats = [
    {
      value: String(homeStats.currentMonthCount),
      label: `Gelişim notu (${homeStats.currentMonthLabel})`,
      sub: 'Akademik Gelişim’e bu ay eklenen kayıt sayısı',
    },
    { value: String(homeStats.streakWeeks), label: 'Kesintisiz kayıt', sub: 'Art arda en az bir kayıt eklenen hafta sayısı' },
    { value: `${closedTopicsThisMonth}/${totalTopics}`, label: 'Kapanan merak konusu', sub: 'Bu ay tamamlananlar' },
    { value: `${homeStats.daysSinceLastEntry} gün`, label: 'Son girişten bu yana', sub: '' },
  ];

  const learnEntries = [...app.learnEntries, ...SEED_LEARN_ENTRIES];
  const recent = learnEntries.slice(0, 4).map((e, i) => ({
    date: e.date.replace(' 2026', ''),
    title: e.title,
    summary: e.teaser,
    open: () => app.navigate('learn', i),
  }));

  // Program Takvimi ile aynı tek kaynak (PROGRAMS) — burada ayrıca
  // kopyalanmış bir liste yok, sadece en yakın 3 tanesi gösteriliyor.
  const allPrograms = [
    ...PROGRAMS,
    ...app.extraPrograms.map((p) => ({ date: p.date, title: p.title, note: p.note || 'Ana sayfadan eklendi' })),
  ];
  const upcoming = allPrograms
    .map((p) => ({ ...p, daysLeft: daysLeftUntil(p.date) }))
    .filter((p): p is typeof p & { daysLeft: number } => p.daysLeft !== null && p.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3)
    .map((p) => {
      const { month, day } = formatMonthDay(parseDotDate(p.date)!);
      return {
        month,
        day,
        title: p.title,
        note: p.note,
        left: formatDaysLeft(p.daysLeft),
        color: daysLeftColor(p.daysLeft),
      };
    });

  const allTopics = TOPICS.map((t, i) => {
    const ov = app.topicOverrides[i];
    const done = ov ? ov.done : !!t.done;
    return { title: t.title, image: undefined as string | undefined, i, done };
  });
  const extraTopicsList = app.extraTopics.map((t, j) => ({
    title: t.title,
    image: t.image,
    i: `extra${j}` as unknown as number,
    done: false,
  }));
  const openTopics = [...extraTopicsList, ...allTopics.filter((t) => !t.done)]
    .slice(0, 6)
    .map((t) => ({
      title: t.title,
      image: t.image,
      toggle: typeof t.i === 'number' ? () => app.toggleTopicAt(t.i as number) : () => {},
    }));

  const homeLinks = [...app.extraLinks, ...LINKS].slice(0, 3).map((l) => ({
    title: l.title,
    kind: l.kind || 'Link',
    open: () => app.openLinkMenu(l.title, l.url),
  }));
  const homeProjectViews = buildProjectViews(app.extraProjects, app.projectOverrides);
  const homeProjects = homeProjectViews.slice(0, 3);

  const topicFileRef = useRef<HTMLInputElement>(null);
  const projectFileRef = useRef<HTMLInputElement>(null);
  const [topicPhotoError, setTopicPhotoError] = useState<string | null>(null);
  const [projectPhotoError, setProjectPhotoError] = useState<string | null>(null);

  const handleTopicPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setTopicPhotoError(null);
    try {
      const url = await uploadImage(await compressImage(file));
      app.addTopic(url);
    } catch {
      setTopicPhotoError('Fotoğraf yüklenemedi, tekrar dene.');
    }
  };
  const handleProjectPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProjectPhotoError(null);
    try {
      const url = await uploadImage(await compressImage(file));
      app.addProject(url);
    } catch {
      setProjectPhotoError('Fotoğraf yüklenemedi, tekrar dene.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.inkFainter }}>
          {formatHeaderDate(now)}
        </div>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 46, lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.02em', maxWidth: '20ch', color: colors.ink }}>
          {greetingWord(now)}, {greetingName(app.profileName)}.
        </h1>
        <p style={{ margin: 0, maxWidth: '54ch', fontSize: 15, lineHeight: 1.65, color: colors.inkSoft, textWrap: 'pretty' }}>
          {homeStats.currentMonthLabel} ayında{' '}
          <em style={{ fontFamily: fonts.serif, fontStyle: 'italic', color: colors.ink }}>
            {homeStats.currentMonthCount} gelişim notu
          </em>{' '}
          yazdın, {closedTopicsThisMonth} araştırma konusunu kapattın ve iki yeni proje fikri biriktirdin. Son yazın{' '}
          {homeStats.daysSinceLastEntry} gün önceydi.
        </p>
      </header>

      <section style={gridStats}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', gap: 6, backgroundColor: '#FDEEEE' }}>
            <div style={{ fontFamily: fonts.serif, fontSize: 32, lineHeight: 1, fontWeight: 400, color: colors.ink }}>{s.value}</div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: colors.inkSoft, lineHeight: 1.4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: colors.inkFaint, lineHeight: 1.45 }}>{s.sub}</div>
          </div>
        ))}
      </section>

      <section style={gridHome}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, paddingBottom: 10 }}>
            <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 19, fontWeight: 500, color: colors.ink }}>Son girişler</h2>
            <span onClick={() => app.navigate('learn')} className="hover-underline" style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer', letterSpacing: '0.04em', borderBottom: '1px solid transparent', paddingBottom: 1 }}>
              tümü →
            </span>
          </div>
          {recent.map((r, i) => (
            <div key={i} onClick={r.open} className="hover-row" style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '14px 14px 15px', margin: '0 -14px', cursor: 'pointer', borderRadius: 3 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFainter, flex: '0 0 60px' }}>{r.date}</span>
                <span style={{ fontFamily: fonts.serif, fontSize: 18, lineHeight: 1.3, color: colors.ink }}>{r.title}</span>
              </div>
              <div style={{ paddingLeft: 72, fontSize: 13, lineHeight: 1.6, color: colors.inkSoft, textWrap: 'pretty' }}>{r.summary}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, paddingBottom: 10 }}>
            <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 19, fontWeight: 500, color: colors.ink }}>Yaklaşan programlar</h2>
            <span onClick={app.startAddProgram} className="hover-underline" style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer', letterSpacing: '0.04em', borderBottom: '1px solid transparent', paddingBottom: 1 }}>
              + Program ekle
            </span>
          </div>
          {upcoming.map((u, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 46px', textAlign: 'center', border: `1px solid ${colors.border}`, padding: '6px 0 7px', background: colors.panel }}>
                <div style={{ fontFamily: fonts.sans, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.inkFainter }}>{u.month}</div>
                <div style={{ fontFamily: fonts.serif, fontSize: 20, lineHeight: 1.1, color: colors.ink }}>{u.day}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: colors.ink }}>{u.title}</div>
                <div style={{ fontSize: 12, color: colors.inkSoft, lineHeight: 1.5 }}>{u.note}</div>
                <div style={{ fontFamily: fonts.sans, fontSize: 10, color: u.color, letterSpacing: '0.06em' }}>{u.left}</div>
              </div>
            </div>
          ))}

          {app.addingProgram && (
            <div style={{ display: 'flex', gap: 8, paddingTop: 6 }}>
              <input
                value={app.qProgram}
                onChange={(e) => app.setQProgram(e.target.value)}
                placeholder="Program adı ve tarih…"
                style={{ flex: 1, padding: '9px 11px', border: `1px solid ${colors.borderStrong}`, background: colors.panel, fontSize: 13, color: colors.ink, outline: 'none', borderRadius: 3 }}
              />
              <div onClick={app.saveProgram} className="btn-dark" style={{ padding: '9px 14px', fontSize: 12.5, cursor: 'pointer', borderRadius: 3, whiteSpace: 'nowrap' }}>
                Ekle
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8, paddingTop: 16, borderTop: `1px dashed ${colors.borderStrong}` }}>
            <div style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.inkFaint }}>
              Keşfedilen programlar
            </div>
            {app.discoveredPrograms.length === 0 ? (
              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: colors.inkFaint, fontStyle: 'italic' }}>
                Henüz yeni bir şey bulunamadı — periyodik tarama ve yerel modelin profil
                filtresi tamamlanınca burada listelenecek.
              </div>
            ) : (
              app.discoveredPrograms.map((p) => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 10, borderBottom: '1px solid #F1E4E4' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, lineHeight: 1.4 }}>
                      {p.title}
                    </a>
                    <span
                      onClick={() => app.dismissDiscoveredProgram(p.id)}
                      className="text-hover-red"
                      style={{ fontSize: 10.5, color: colors.placeholderText, cursor: 'pointer', flex: '0 0 auto' }}
                    >
                      gizle
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: colors.inkSoft, lineHeight: 1.55 }}>{p.snippet}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section style={gridThree}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, border: `1px solid ${colors.border}`, background: colors.panel, padding: '20px 20px 18px', borderRadius: 4 }}>
          <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17, fontWeight: 500, color: colors.ink }}>Linkler</h2>
          {homeLinks.map((l, i) => (
            <div key={i} onClick={l.open} className="hover-row" style={{ display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer', padding: '6px 8px', margin: '0 -8px', borderRadius: 3 }}>
              <span style={{ fontSize: 13, color: colors.ink, lineHeight: 1.35 }}>{l.title}</span>
              <span style={{ fontFamily: fonts.sans, fontSize: 10, color: colors.inkFainter }}>{l.kind}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <input
              value={app.qLink}
              onChange={(e) => app.setQLink(e.target.value)}
              placeholder="Link yapıştır…"
              style={{ flex: 1, padding: '8px 10px', border: `1px solid ${colors.borderStrong}`, background: '#FFFFFF', fontSize: 12.5, color: colors.ink, outline: 'none', borderRadius: 3 }}
            />
            <div onClick={app.addLink} className="btn-dark" style={{ padding: '8px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
              Ekle
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, border: `1px solid ${colors.border}`, background: colors.panel, padding: '20px 20px 18px', borderRadius: 4 }}>
          <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17, fontWeight: 500, color: colors.ink }}>Merak konuları</h2>
          {openTopics.map((t, i) => (
            <div key={i} onClick={t.toggle} className="hover-row" style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: colors.ink, cursor: 'pointer', padding: '3px 6px', margin: '0 -6px', borderRadius: 3 }}>
              <span style={{ width: 14, height: 14, border: `1px solid ${colors.placeholderText}`, borderRadius: 3, flex: '0 0 14px', alignSelf: 'flex-start', marginTop: 3 }} />
              {t.image && (
                <img
                  src={t.image}
                  alt=""
                  style={{ width: 24, height: 24, flex: '0 0 24px', borderRadius: 3, objectFit: 'cover' }}
                />
              )}
              <span style={{ lineHeight: 1.5 }}>{t.title}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <input
              value={app.qTopic}
              onChange={(e) => app.setQTopic(e.target.value)}
              placeholder="Yeni merak konusu…"
              style={{ flex: 1, padding: '8px 10px', border: `1px solid ${colors.borderStrong}`, background: '#FFFFFF', fontSize: 12.5, color: colors.ink, outline: 'none', borderRadius: 3 }}
            />
            <input ref={topicFileRef} type="file" accept="image/*" hidden onChange={handleTopicPhoto} />
            <div
              onClick={() => topicFileRef.current?.click()}
              className="hover-row"
              title="Fotoğraf ekle"
              style={{ width: 32, flex: '0 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.borderStrong}`, borderRadius: 3, cursor: 'pointer', color: colors.inkSoft }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="M21 16l-5-5-4 4-3-3-5 5" />
              </svg>
            </div>
            <div onClick={() => app.addTopic()} className="btn-dark" style={{ padding: '8px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
              Ekle
            </div>
          </div>
          {topicPhotoError && <span style={{ fontSize: 11, color: '#B0554F' }}>{topicPhotoError}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, border: `1px solid ${colors.border}`, background: colors.panel, padding: '20px 20px 18px', borderRadius: 4 }}>
          <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17, fontWeight: 500, color: colors.ink }}>Proje fikirleri</h2>
          {homeProjects.map((p) => (
            <div
              key={p.key}
              onClick={() => app.navigate('projects', homeProjectViews.indexOf(p))}
              className="hover-row-alt"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '3px 0', cursor: 'pointer', borderRadius: 3 }}
            >
              {p.image && (
                <img
                  src={p.image}
                  alt=""
                  style={{ width: 28, height: 28, flex: '0 0 28px', borderRadius: 3, objectFit: 'cover' }}
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 13, color: colors.ink, lineHeight: 1.4 }}>{p.title}</span>
                <span style={{ fontFamily: fonts.sans, fontSize: 10, color: p.stateColor }}>{p.state}</span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <input
              value={app.qProject}
              onChange={(e) => app.setQProject(e.target.value)}
              placeholder="Yeni proje fikri…"
              style={{ flex: 1, padding: '8px 10px', border: `1px solid ${colors.borderStrong}`, background: '#FFFFFF', fontSize: 12.5, color: colors.ink, outline: 'none', borderRadius: 3 }}
            />
            <input ref={projectFileRef} type="file" accept="image/*" hidden onChange={handleProjectPhoto} />
            <div
              onClick={() => projectFileRef.current?.click()}
              className="hover-row"
              title="Fotoğraf ekle"
              style={{ width: 32, flex: '0 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.borderStrong}`, borderRadius: 3, cursor: 'pointer', color: colors.inkSoft }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="M21 16l-5-5-4 4-3-3-5 5" />
              </svg>
            </div>
            <div onClick={() => app.addProject()} className="btn-dark" style={{ padding: '8px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
              Ekle
            </div>
          </div>
          {projectPhotoError && <span style={{ fontSize: 11, color: '#B0554F' }}>{projectPhotoError}</span>}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, paddingBottom: 10, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 19, fontWeight: 500, color: colors.ink }}>
              {app.calView === 'week' ? 'Haftalık program' : 'Aylık program'}
            </h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={pillStyle(app.calView === 'week')} onClick={() => app.setCalView('week')}>Haftalık</div>
              <div style={pillStyle(app.calView === 'month')} onClick={() => app.setCalView('month')}>Aylık</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: fonts.sans, fontSize: 10.5, color: colors.inkFaint }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: app.gcalStatus === 'ok' ? '#6E9E7E' : app.gcalStatus === 'error' ? '#B0554F' : colors.steel,
                }}
              />
              {app.gcalStatus === 'ok'
                ? 'Google Calendar ile senkronize'
                : app.gcalStatus === 'error'
                  ? 'Google Calendar senkronizasyonu başarısız'
                  : 'Google Calendar bağlı değil'}
            </span>
            <span
              onClick={() => {
                const realDay = now.getDate();
                app.openDayPanel(realDay >= 1 && realDay <= 30 ? realDay : 1);
              }}
              className="hover-underline"
              style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer', borderBottom: '1px solid transparent', paddingBottom: 1 }}
            >
              + Not / ders ekle
            </span>
          </div>
        </div>

        {app.calView === 'week' ? <WeekView /> : <MonthView />}
      </section>
    </div>
  );
}

function WeekView() {
  const app = useApp();
  const weekDays = DAY_DEFS.map((d) => {
    const rawBlocks =
      d.dayNum === null
        ? AUG31_BLOCKS
        : (app.dayNotes[d.dayNum] || [])
            .filter((it) => it.time)
            .map((it) => ({
              s: timeToHour(it.time) as number,
              e: it.end ? (timeToHour(it.end) as number) : (timeToHour(it.time) as number) + 1,
              label: it.label,
            }));

    const [year, month, day] = d.dayNum === null ? [2026, 7, 31] : [2026, 8, d.dayNum];
    const gcalBlocks = eventsOnDate(app.gcalEvents, year, month, day)
      .filter((ev) => !ev.allDay)
      .map((ev) => ({
        s: ev.start.getHours() + ev.start.getMinutes() / 60,
        e: ev.end.getHours() + ev.end.getMinutes() / 60,
        label: ev.title,
      }))
      .filter((b) => b.s >= 8 && b.e <= 21);

    return { ...d, blocks: rawBlocks, gcalBlocks };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '58px 1fr', gap: 0, border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 4, overflow: 'hidden', transition: 'opacity 0.15s ease' }}>
      <div />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${colors.border}` }}>
        {weekDays.map((d, i) => (
          <div key={i} style={{ padding: '16px 8px', textAlign: 'center', borderLeft: '1px solid #EEDFDF' }}>
            <div style={{ fontFamily: fonts.sans, fontSize: 10.5, letterSpacing: '0.08em', color: colors.inkFaint }}>{d.label}</div>
            <div style={{ fontFamily: fonts.serif, fontSize: 17, color: colors.ink, marginTop: 2 }}>{d.date}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {HOUR_LABELS.map((h) => (
          <div key={h} style={{ height: HOUR_ROW_HEIGHT, fontFamily: fonts.sans, fontSize: 10.5, color: colors.inkFainter, textAlign: 'right', paddingRight: 8, transform: 'translateY(-7px)' }}>
            {h}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          position: 'relative',
          backgroundImage: `repeating-linear-gradient(to bottom, #EEDFDF 0, #EEDFDF 1px, transparent 1px, transparent ${HOUR_ROW_HEIGHT}px)`,
          height: HOUR_ROW_HEIGHT * 12,
        }}
      >
        {weekDays.map((d, i) => {
          const split = d.blocks.length > 0 && d.gcalBlocks.length > 0;
          return (
            <div key={i} style={{ position: 'relative', borderLeft: '1px solid #EEDFDF' }}>
              {d.blocks.map((b, j) => (
                <div key={j} style={dayBlockStyle(b.s, b.e, split ? 'left' : 'full')}>
                  {b.label}
                </div>
              ))}
              {d.gcalBlocks.map((b, j) => (
                <div key={`g${j}`} style={gcalBlockStyle(b.s, b.e, split ? 'right' : 'full')}>
                  {b.label}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView() {
  const app = useApp();
  const monthCells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - START_OFFSET + 1;
    const valid = dayNum >= 1 && dayNum <= 30;
    const localCount = valid ? (app.dayNotes[dayNum] || []).length : 0;
    const gcalCount = valid ? eventsOnDate(app.gcalEvents, 2026, 8, dayNum).length : 0;
    return {
      day: valid ? dayNum : '',
      localDots: Array.from({ length: Math.min(localCount, 4) }),
      gcalDots: Array.from({ length: Math.min(gcalCount, 4 - Math.min(localCount, 4)) }),
      open: valid ? () => app.openDayPanel(dayNum) : undefined,
      valid,
    };
  });

  return (
    <div style={{ border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 4, overflow: 'hidden', transition: 'opacity 0.15s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${colors.border}` }}>
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} style={{ padding: '9px 6px', textAlign: 'center', fontFamily: fonts.sans, fontSize: 10.5, letterSpacing: '0.06em', color: colors.inkFaint }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {monthCells.map((c, i) => (
          <div
            key={i}
            onClick={c.open}
            className={c.valid ? 'hover-row-alt' : undefined}
            style={{
              minHeight: 110,
              padding: '14px 14px',
              borderLeft: '1px solid #EEDFDF',
              borderTop: '1px solid #EEDFDF',
              cursor: c.valid ? 'pointer' : 'default',
              background: c.valid ? undefined : colors.bg,
            }}
          >
            {c.day !== '' && (
              <>
                <span style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.ink }}>{c.day}</span>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {c.localDots.map((_, j) => (
                    <span key={`l${j}`} style={{ width: 5, height: 5, borderRadius: '50%', background: colors.rose }} />
                  ))}
                  {c.gcalDots.map((_, j) => (
                    <span key={`g${j}`} style={{ width: 5, height: 5, borderRadius: '50%', background: colors.steel }} />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
