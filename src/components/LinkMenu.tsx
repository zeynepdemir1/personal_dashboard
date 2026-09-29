import { useState } from 'react';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../lib/theme';
import { ensureProtocol } from '../lib/url';
import { LINK_KINDS } from '../lib/data';

// PLAN.md Aşama 26: linkler eskiden hiç düzenlenemiyordu (sadece
// görüntüleniyordu) — sadece KULLANICININ KENDİ eklediği linklerde
// (app.linkMenu.id dolu, bkz. AppState.tsx) bir "Düzenle" modu eklendi.
export function LinkMenu() {
  const app = useApp();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [kind, setKind] = useState('Link');

  if (!app.linkMenu) return null;
  const menu = app.linkMenu;

  const goToLink = () => {
    if (menu.url) window.open(ensureProtocol(menu.url), '_blank', 'noopener,noreferrer');
    app.closeLinkMenu();
  };

  const startEdit = () => {
    setTitle(menu.title);
    setUrl(menu.url);
    setNote(menu.note);
    setKind(menu.kind);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!menu.id || !title.trim()) return;
    app.updateExtraLink(menu.id, { title: title.trim(), url: url.trim(), note: note.trim(), kind });
    setEditing(false);
    app.closeLinkMenu();
  };

  const inputStyle = {
    padding: '9px 10px',
    border: `1px solid ${colors.borderStrong}`,
    background: colors.panel,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
    outline: 'none',
    borderRadius: 3,
    width: '100%',
  } as const;

  return (
    <div
      onClick={() => {
        setEditing(false);
        app.closeLinkMenu();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(61,43,46,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        cursor: 'pointer',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.panel,
          borderRadius: 6,
          padding: '22px 24px',
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 12px 40px rgba(61,43,46,0.25)',
        }}
      >
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık…" style={{ ...inputStyle, fontFamily: fonts.serif, fontSize: 15 }} />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL…" style={inputStyle} />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Not…" style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
            <select value={kind} onChange={(e) => setKind(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {LINK_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: fonts.serif, fontSize: 17, color: colors.ink, lineHeight: 1.35 }}>{menu.title}</div>

            {app.linkDetailOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: menu.kindColor }}>
                    {menu.kind}
                  </span>
                  <span style={{ fontFamily: fonts.sans, fontSize: 10, color: colors.inkFaint }}>{menu.date}</span>
                </div>
                {menu.url && (
                  <div style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint, wordBreak: 'break-all' }}>
                    {menu.url}
                  </div>
                )}
                {menu.note && (
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: colors.inkSoft, textWrap: 'pretty' }}>
                    {menu.note}
                  </p>
                )}
                {menu.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {menu.tags.map((t) => (
                      <span key={t} style={{ fontFamily: fonts.sans, fontSize: 10, padding: '3px 7px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {editing ? (
            <>
              <div onClick={saveEdit} className="btn-dark" style={{ padding: '11px 14px', fontSize: 14, textAlign: 'center', cursor: 'pointer', borderRadius: 4 }}>
                Kaydet
              </div>
              <div
                onClick={() => setEditing(false)}
                className="btn-outline-hover"
                style={{ padding: '11px 14px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: 14, textAlign: 'center', cursor: 'pointer', borderRadius: 4 }}
              >
                Vazgeç
              </div>
            </>
          ) : (
            <>
              <div
                onClick={menu.url ? goToLink : undefined}
                className={menu.url ? 'btn-dark' : undefined}
                style={{
                  padding: '11px 14px',
                  fontSize: 14,
                  textAlign: 'center',
                  borderRadius: 4,
                  ...(menu.url ? { cursor: 'pointer' } : { background: colors.borderStrong, color: colors.inkFaint, cursor: 'default' }),
                }}
              >
                Linke git
              </div>
              {!app.linkDetailOpen && (
                <div
                  onClick={app.showLinkDetails}
                  className="btn-outline-hover"
                  style={{ padding: '11px 14px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: 14, textAlign: 'center', cursor: 'pointer', borderRadius: 4 }}
                >
                  Detayları gör
                </div>
              )}
              {menu.id && (
                <div
                  onClick={startEdit}
                  className="btn-outline-hover"
                  style={{ padding: '11px 14px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: 14, textAlign: 'center', cursor: 'pointer', borderRadius: 4 }}
                >
                  Düzenle
                </div>
              )}
              <div
                onClick={app.closeLinkMenu}
                className="btn-outline-hover"
                style={{ padding: '11px 14px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: 14, textAlign: 'center', cursor: 'pointer', borderRadius: 4 }}
              >
                Kapat
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
