import type { CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { TOPICS } from '../../lib/data';
import { SEED_LEARN_ENTRIES, findLearnEntryIndexForTopic } from '../../lib/learn';

export function Topics() {
  const app = useApp();
  const narrow = app.width < 1180;
  const learnEntries = [...app.learnEntries, ...SEED_LEARN_ENTRIES];

  const gridTopicHead: CSSProperties = narrow
    ? { display: 'none' }
    : {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 100px 100px 150px',
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
        gridTemplateColumns: 'minmax(0, 1fr) 100px 100px 150px',
        gap: 16,
        padding: '15px 6px',
        borderBottom: '1px solid #F1E4E4',
        alignItems: 'center',
      };
  const rowMain: CSSProperties = narrow ? { flex: '1 0 100%' } : {};

  const topics = TOPICS.map((t, i) => {
    const ov = app.topicOverrides[i];
    const done = ov ? ov.done : !!t.done;
    const doneDate = ov ? ov.date : t.done;
    const learnIdx = t.link ? findLearnEntryIndexForTopic(t.title, learnEntries) : -1;
    return {
      title: t.title,
      added: t.added,
      done: doneDate || '—',
      doneColor: done ? colors.inkSoft : colors.placeholderText,
      link: t.link || '',
      openLink: t.link ? () => app.navigate('learn', learnIdx >= 0 ? learnIdx : undefined) : undefined,
      mark: done ? '✓' : '',
      toggle: () => app.toggleTopicAt(i),
      isDone: done,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Araştırılacak Konular
        </h1>
      </header>
      <div style={gridTopicHead}>
        <span>Konu</span>
        <span>Not tarihi</span>
        <span>Kapanış</span>
        <span style={{ textAlign: 'right' }}>Bağlantı</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {topics.map((t, i) => (
          <div key={i} className="hover-row-alt" style={gridTopicRow}>
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
              <span style={{ fontSize: 14.5, lineHeight: 1.45, color: t.isDone ? colors.inkFaint : colors.ink }}>{t.title}</span>
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
          </div>
        ))}
      </div>
    </div>
  );
}
