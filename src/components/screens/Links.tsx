import type { CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts, pillStyle } from '../../lib/theme';
import { LINKS, LINK_KINDS, TODAY } from '../../lib/data';

const FILTERS = ['Tümü · 86', 'GitHub · 24', 'Ders notu · 19', 'Makale · 15', 'Araç · 12', 'Okunmadı · 8'];

export function Links() {
  const app = useApp();
  const narrow = app.width < 1180;

  const gridLinks: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${narrow ? 1 : 2}, 1fr)`,
    gap: 1,
    background: colors.borderStrong,
    border: `1px solid ${colors.borderStrong}`,
  };

  const links = [...app.extraLinks, ...LINKS].map((l) => ({
    kind: l.kind || 'Link',
    kindColor: l.kindColor || colors.inkSoft,
    date: l.date || TODAY,
    title: l.title,
    url: l.url || '',
    note: l.note || '',
    tags: l.tags || [],
    open: () =>
      app.openLinkMenu({
        title: l.title,
        url: l.url || '',
        kind: l.kind || 'Link',
        kindColor: l.kindColor || colors.inkSoft,
        date: l.date || TODAY,
        note: l.note || '',
        tags: l.tags || [],
      }),
  }));

  const inputStyle: CSSProperties = {
    padding: '10px 12px',
    border: `1px solid ${colors.borderStrong}`,
    background: colors.panel,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
    outline: 'none',
    borderRadius: 3,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Linkler
        </h1>
        {!app.addingLinkForm && (
          <div
            onClick={app.startAddLinkForm}
            className="btn-outline-invert"
            style={{ padding: '11px 18px', border: `1px solid ${colors.inkSoft}`, color: colors.inkSoft, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: 3 }}
          >
            Link yapıştır
          </div>
        )}
      </header>

      {app.addingLinkForm && (
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
            value={app.qLinkUrl}
            onChange={(e) => app.setQLinkUrl(e.target.value)}
            placeholder="URL…"
            style={inputStyle}
          />
          <input
            value={app.qLinkTitle}
            onChange={(e) => app.setQLinkTitle(e.target.value)}
            placeholder="Başlık (boş bırakılırsa URL'den türetilir)…"
            style={inputStyle}
          />
          <input
            value={app.qLinkNote}
            onChange={(e) => app.setQLinkNote(e.target.value)}
            placeholder="Kısa not…"
            style={inputStyle}
          />
          <select
            value={app.qLinkKind}
            onChange={(e) => app.setQLinkKind(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {LINK_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <div
              onClick={app.cancelAddLinkForm}
              className="btn-outline-hover"
              style={{ padding: '9px 16px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: 13, cursor: 'pointer', borderRadius: 3 }}
            >
              Vazgeç
            </div>
            <div onClick={app.saveLinkForm} className="btn-dark" style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 3 }}>
              Kaydet
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: '12px 0', flexWrap: 'wrap' }}>
        {FILTERS.map((f, i) => (
          <div key={f} className="hover-row" style={pillStyle(i === 0)}>
            {f}
          </div>
        ))}
      </div>

      <div style={gridLinks}>
        {links.map((l, i) => (
          <div key={i} onClick={l.open} className="hover-row-alt" style={{ background: colors.panel, padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', gap: 11, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: l.kindColor }}>{l.kind}</span>
              <span style={{ fontFamily: fonts.sans, fontSize: 10, color: colors.inkFaint }}>{l.date}</span>
            </div>
            <div style={{ fontFamily: fonts.serif, fontSize: 20, lineHeight: 1.3, color: colors.ink }}>{l.title}</div>
            <div style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: colors.inkSoft, textWrap: 'pretty' }}>{l.note}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
              {l.tags.map((t) => (
                <span key={t} style={{ fontFamily: fonts.sans, fontSize: 10, padding: '3px 7px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
