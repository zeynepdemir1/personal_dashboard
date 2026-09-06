import type { CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { SEED_LEARN_ENTRIES } from '../../lib/learn';

export function Learn() {
  const app = useApp();
  const narrow = app.width < 1180;
  const tight = app.width < 860;

  const entries = [...app.learnEntries, ...SEED_LEARN_ENTRIES];
  const activeIndex = Math.min(app.entry, entries.length - 1);
  const article = entries[activeIndex];

  const gridLearn: CSSProperties = narrow
    ? { display: 'grid', gridTemplateColumns: '1fr', gap: 34, alignItems: 'start' }
    : { display: 'grid', gridTemplateColumns: '300px minmax(420px, 1fr)', gap: 48, alignItems: 'start' };

  const articleStyle: CSSProperties = {
    border: `1px solid ${colors.border}`,
    background: colors.panel,
    padding: tight ? '26px 24px 30px' : '40px 44px 46px',
    display: 'flex',
    flexDirection: 'column',
    gap: 26,
    minWidth: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Bir Şey Öğrendim
        </h1>
        {!app.addingLearnEntry && (
          <div
            onClick={app.startAddLearnEntry}
            className="btn-dark"
            style={{ padding: '11px 18px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: 3 }}
          >
            Yeni giriş
          </div>
        )}
      </header>

      {app.addingLearnEntry && (
        <div
          style={{
            border: `1px solid ${colors.border}`,
            background: colors.panel,
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            borderRadius: 4,
          }}
        >
          <input
            value={app.qLearnTitle}
            onChange={(e) => app.setQLearnTitle(e.target.value)}
            placeholder="Başlık…"
            style={{
              padding: '10px 12px',
              border: `1px solid ${colors.borderStrong}`,
              background: colors.panel,
              fontFamily: fonts.serif,
              fontSize: 18,
              color: colors.ink,
              outline: 'none',
              borderRadius: 3,
            }}
          />
          <textarea
            value={app.qLearnBody}
            onChange={(e) => app.setQLearnBody(e.target.value)}
            placeholder="Ne öğrendin? Serbestçe yaz…"
            style={{
              minHeight: 160,
              padding: '10px 12px',
              border: `1px solid ${colors.borderStrong}`,
              background: colors.panel,
              fontFamily: fonts.serif,
              fontSize: 15,
              lineHeight: 1.6,
              color: colors.ink,
              outline: 'none',
              borderRadius: 3,
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <div
              onClick={app.cancelAddLearnEntry}
              className="btn-outline-hover"
              style={{
                padding: '9px 16px',
                border: `1px solid ${colors.borderStrong}`,
                color: colors.inkSoft,
                fontSize: 13,
                cursor: 'pointer',
                borderRadius: 3,
              }}
            >
              Vazgeç
            </div>
            <div
              onClick={app.saveLearnEntry}
              className="btn-dark"
              style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 3 }}
            >
              Kaydet
            </div>
          </div>
        </div>
      )}

      <div style={gridLearn}>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.border}` }}>
          {entries.map((e, i) => (
            <div
              key={i}
              onClick={() => app.navigate('learn', i)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '16px 14px 17px',
                margin: 0,
                borderBottom: '1px solid #F1E4E4',
                cursor: 'pointer',
                borderLeft: i === activeIndex ? `2px solid ${colors.rose}` : '2px solid transparent',
                paddingLeft: 12,
                background: i === activeIndex ? colors.panelAlt : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: fonts.sans, fontSize: 10.5, color: colors.inkFainter }}>{e.date}</span>
                <span style={{ fontFamily: fonts.sans, fontSize: 10, color: colors.inkFaint }}>{e.len}</span>
              </div>
              <div style={{ fontFamily: fonts.serif, fontSize: 17, lineHeight: 1.35, color: colors.ink }}>{e.title}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: colors.inkSoft }}>{e.teaser}</div>
            </div>
          ))}
        </div>

        <article style={articleStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: fonts.sans, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.inkFainter }}>
              {article.stamp}
            </div>
            <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 32, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.015em', maxWidth: '26ch', color: colors.ink }}>
              {article.title}
            </h2>
          </div>

          {article.summary && (
            <div style={{ borderLeft: `2px solid ${colors.rose}`, padding: '2px 0 2px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A9464E' }}>
                Yerel model özeti
              </div>
              <p style={{ margin: 0, fontFamily: fonts.serif, fontSize: 16.5, lineHeight: 1.6, color: colors.ink, textWrap: 'pretty' }}>
                {article.summary}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: '68ch' }}>
            {article.body.map((p, i) => (
              <p key={i} style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17.5, lineHeight: 1.72, color: colors.ink, textWrap: 'pretty' }}>
                {p}
              </p>
            ))}
            {article.code && (
              <div style={{ border: `1px solid ${colors.borderStrong}`, background: colors.panelAlt, padding: '18px 20px', fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 1.7, color: '#4A3B3E', whiteSpace: 'pre-wrap' }}>
                {article.code}
              </div>
            )}
            {article.body2?.map((p, i) => (
              <p key={i} style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17.5, lineHeight: 1.72, color: colors.ink, textWrap: 'pretty' }}>
                {p}
              </p>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid #F1E4E4', paddingTop: 20, alignItems: 'center' }}>
            {article.tags.map((t) => (
              <span key={t} style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.04em', padding: '5px 9px', background: colors.chipBg, color: colors.chipText }}>
                {t}
              </span>
            ))}
            <span
              onClick={() => app.navigate(article.relScreen)}
              className="chip-hover"
              style={{ marginLeft: 'auto', fontSize: 12, color: colors.rose, cursor: 'pointer', padding: '6px 12px', border: '1px solid #F0BFC0', borderRadius: 4 }}
            >
              {article.rel} →
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}
