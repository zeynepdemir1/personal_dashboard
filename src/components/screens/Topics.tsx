import { useState, type CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { TOPICS } from '../../lib/data';
import { SEED_LEARN_ENTRIES, findLearnEntryIndexForTopic } from '../../lib/learn';

export function Topics() {
  const app = useApp();
  const narrow = app.width < 1180;
  const learnEntries = [...app.learnEntries, ...SEED_LEARN_ENTRIES];
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [qLinkTitle, setQLinkTitle] = useState('');
  const [qLinkUrl, setQLinkUrl] = useState('');

  const gridTopicHead: CSSProperties = narrow
    ? { display: 'none' }
    : {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 100px 100px 150px 26px',
        gap: 16,
        padding: '0 6px 10px',
        borderBottom: `1px solid ${colors.border}`,
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: colors.inkFaint,
      };
  const gridTopicRow: CSSProperties = narrow
    ? { display: 'flex', flexWrap: 'wrap', gap: '8px 16px', padding: '14px 6px', borderBottom: '1px solid #F1E4E4', alignItems: 'center' }
    : {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 100px 100px 150px 26px',
        gap: 16,
        padding: '15px 6px',
        borderBottom: '1px solid #F1E4E4',
        alignItems: 'center',
      };
  const rowMain: CSSProperties = narrow ? { flex: '1 0 100%' } : {};

  // PLAN.md Aşama 25 madde 2: bu sayfa eskiden SADECE sabit (seed) TOPICS
  // listesini gösteriyordu — kullanıcının eklediği konular (app.extraTopics)
  // hiç görünmüyordu, bu sayfada bir "yeni konu ekle" formu da yoktu.
  // Ana Sayfa'daki hızlı ekleme formuyla (aynı app.qTopic/addTopic state'i)
  // ortak, ama silme/işaretleme artık burada da (ve doğru şekilde) çalışıyor.
  const staticTopics = TOPICS.map((t, i) => {
    const ov = app.topicOverrides[i];
    const done = ov ? ov.done : !!t.done;
    const doneDate = ov ? ov.date : t.done;
    const learnIdx = t.link ? findLearnEntryIndexForTopic(t.title, learnEntries) : -1;
    return {
      key: `static:${i}`,
      title: t.title,
      added: t.added,
      done: doneDate || '—',
      doneColor: done ? colors.inkSoft : colors.placeholderText,
      link: t.link || '',
      openLink: t.link ? () => app.navigate('learn', learnIdx >= 0 ? learnIdx : undefined) : undefined,
      mark: done ? '✓' : '',
      toggle: () => app.toggleTopicAt(i),
      remove: undefined as (() => void) | undefined,
      isDone: done,
    };
  });
  const extraTopicsList = app.extraTopics.map((t) => ({
    key: `extra:${t.id}`,
    title: t.title,
    added: t.addedDate,
    done: t.doneDate || '—',
    doneColor: t.done ? colors.inkSoft : colors.placeholderText,
    link: '',
    openLink: undefined as (() => void) | undefined,
    mark: t.done ? '✓' : '',
    toggle: () => app.toggleExtraTopic(t.id),
    remove: () => app.removeExtraTopic(t.id),
    isDone: t.done,
  }));
  const topics = [...extraTopicsList, ...staticTopics];

  const toggleExpand = (key: string) => {
    setExpandedTitle((cur) => (cur === key ? null : key));
    setQLinkTitle('');
    setQLinkUrl('');
  };

  const inputStyle: CSSProperties = {
    padding: '7px 9px',
    border: `1px solid ${colors.borderStrong}`,
    background: colors.panel,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: colors.ink,
    outline: 'none',
    borderRadius: 3,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Araştırılacak Konular
        </h1>
      </header>

      <div style={{ display: 'flex', gap: 8, maxWidth: 480 }}>
        <input
          value={app.qTopic}
          onChange={(e) => app.setQTopic(e.target.value)}
          placeholder="Yeni araştırılacak konu…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <div onClick={() => app.addTopic()} className="btn-dark" style={{ padding: '9px 14px', fontSize: 12.5, cursor: 'pointer', borderRadius: 3, whiteSpace: 'nowrap' }}>
          Ekle
        </div>
      </div>

      <div style={gridTopicHead}>
        <span>Konu</span>
        <span>Not tarihi</span>
        <span>Kapanış</span>
        <span style={{ textAlign: 'right' }}>Bağlantı</span>
        <span />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {topics.map((t) => {
          const relatedLinks = app.topicLinks[t.title] || [];
          const isExpanded = expandedTitle === t.key;
          return (
            <div key={t.key}>
              <div className="hover-row-alt" style={gridTopicRow}>
                <div onClick={t.toggle} style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0, cursor: 'pointer', ...rowMain }}>
                  <span
                    style={{
                      width: 15,
                      height: 15,
                      flex: '0 0 15px',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      background: t.isDone ? colors.inkSoft : undefined,
                      color: t.isDone ? colors.chipBg : undefined,
                      border: t.isDone ? `1px solid ${colors.inkSoft}` : `1px solid ${colors.placeholderText}`,
                    }}
                  >
                    {t.mark}
                  </span>
                  <span style={{ fontSize: 15.5, lineHeight: 1.45, color: t.isDone ? colors.inkFaint : colors.ink }}>{t.title}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(t.key);
                    }}
                    className="text-hover-rose"
                    style={{ fontSize: 10.5, color: relatedLinks.length ? colors.rose : colors.placeholderText, cursor: 'pointer', flex: '0 0 auto' }}
                  >
                    🔗{relatedLinks.length ? ` ${relatedLinks.length}` : ''} {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
                <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkSoft }}>{t.added}</span>
                <span style={{ fontFamily: fonts.sans, fontSize: 11, color: t.doneColor }}>{t.done}</span>
                <span
                  onClick={t.openLink}
                  style={{
                    textAlign: 'right',
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: '0.04em',
                    color: t.link ? colors.rose : colors.placeholderText,
                    cursor: t.link ? 'pointer' : 'default',
                    borderBottom: t.link ? '1px solid rgba(219,127,142,0.35)' : 'none',
                  }}
                >
                  {t.link}
                </span>
                {t.remove ? (
                  <span
                    onClick={t.remove}
                    className="text-hover-red"
                    title="Konuyu sil"
                    style={{ cursor: 'pointer', color: colors.placeholderText, textAlign: 'right', flex: narrow ? '0 0 auto' : undefined }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </span>
                ) : (
                  <span />
                )}
              </div>

              {isExpanded && (
                <div style={{ padding: '4px 6px 18px 33px', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 460 }}>
                  {relatedLinks.map((l) => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, flex: 1 }}>
                        {l.title}
                      </a>
                      <span
                        onClick={() => app.removeTopicLink(t.title, l.id)}
                        className="text-hover-red"
                        style={{ cursor: 'pointer', fontSize: 11, color: colors.placeholderText, flex: '0 0 auto' }}
                      >
                        kaldır
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={qLinkTitle} onChange={(e) => setQLinkTitle(e.target.value)} placeholder="Link başlığı…" style={{ ...inputStyle, flex: 1 }} />
                    <input value={qLinkUrl} onChange={(e) => setQLinkUrl(e.target.value)} placeholder="URL…" style={{ ...inputStyle, flex: 1 }} />
                    <div
                      onClick={() => {
                        app.addTopicLink(t.title, qLinkTitle, qLinkUrl);
                        setQLinkTitle('');
                        setQLinkUrl('');
                      }}
                      className="btn-dark"
                      style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 3, whiteSpace: 'nowrap' }}
                    >
                      Ekle
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
