import type { CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts, pillStyle } from '../../lib/theme';
import { LINKS, LINK_KINDS, TODAY } from '../../lib/data';

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

  const links = [...app.extraLinks, ...LINKS].map((l, i) => ({
    id: i < app.extraLinks.length ? app.extraLinks[i].id : undefined,
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

  // PLAN.md Aşama 25 madde 3: eskiden sabit/uydurma sayılardı ("Tümü · 86"
  // gibi) — artık gerçek listeden hesaplanıyor.
  const filters = [
    { label: 'Tümü', count: links.length },
    ...LINK_KINDS.map((k) => ({ label: k, count: links.filter((l) => l.kind === k).length })).filter((f) => f.count > 0),
  ];

  const inputStyle: CSSProperties = {
    padding: '10px 12px',
    border: `1px solid ${colors.borderStrong}`,
    background: colors.panel,
    fontFamily: fonts.sans,
    fontSize: 14,
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
            style={{ padding: '11px 18px', border: `1px solid ${colors.inkSoft}`, color: colors.inkSoft, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: 3 }}
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
              style={{ padding: '9px 16px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: 14, cursor: 'pointer', borderRadius: 3 }}
            >
              Vazgeç
            </div>
            <div onClick={app.saveLinkForm} className="btn-dark" style={{ padding: '9px 16px', fontSize: 14, cursor: 'pointer', borderRadius: 3 }}>
              Kaydet
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: '12px 0', flexWrap: 'wrap' }}>
        {filters.map((f, i) => (
          <div key={f.label} className="hover-row" style={pillStyle(i === 0)}>
            {f.label} · {f.count}
          </div>
        ))}
      </div>

      <div style={gridLinks}>
        {links.map((l, i) => (
          <div key={i} onClick={l.open} className="hover-row-alt" style={{ background: colors.panel, padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', gap: 11, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: l.kindColor }}>{l.kind}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: fonts.sans, fontSize: 10, color: colors.inkFaint }}>{l.date}</span>
                {l.id && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      app.removeExtraLink(l.id!);
                    }}
                    className="text-hover-red"
                    title="Linki sil"
                    style={{ cursor: 'pointer', color: colors.placeholderText }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontFamily: fonts.serif, fontSize: 20, lineHeight: 1.3, color: colors.ink }}>{l.title}</div>
            <div style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: colors.inkSoft, textWrap: 'pretty' }}>{l.note}</p>
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
