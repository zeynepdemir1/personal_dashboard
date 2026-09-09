import { useApp } from '../state/AppState';
import { colors, fonts } from '../lib/theme';
import { ensureProtocol } from '../lib/url';

export function LinkMenu() {
  const app = useApp();
  if (!app.linkMenu) return null;

  const goToLink = () => {
    if (app.linkMenu?.url) window.open(ensureProtocol(app.linkMenu.url), '_blank', 'noopener,noreferrer');
    app.closeLinkMenu();
  };

  return (
    <div
      onClick={app.closeLinkMenu}
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
        <div style={{ fontFamily: fonts.serif, fontSize: 17, color: colors.ink, lineHeight: 1.35 }}>
          {app.linkMenu.title}
        </div>

        {app.linkDetailOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: app.linkMenu.kindColor }}>
                {app.linkMenu.kind}
              </span>
              <span style={{ fontFamily: fonts.sans, fontSize: 10, color: colors.inkFaint }}>{app.linkMenu.date}</span>
            </div>
            {app.linkMenu.url && (
              <div style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint, wordBreak: 'break-all' }}>
                {app.linkMenu.url}
              </div>
            )}
            {app.linkMenu.note && (
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: colors.inkSoft, textWrap: 'pretty' }}>
                {app.linkMenu.note}
              </p>
            )}
            {app.linkMenu.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {app.linkMenu.tags.map((t) => (
                  <span key={t} style={{ fontFamily: fonts.sans, fontSize: 10, padding: '3px 7px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            onClick={app.linkMenu.url ? goToLink : undefined}
            className={app.linkMenu.url ? 'btn-dark' : undefined}
            style={{
              padding: '11px 14px',
              fontSize: 13,
              textAlign: 'center',
              borderRadius: 4,
              ...(app.linkMenu.url
                ? { cursor: 'pointer' }
                : { background: colors.borderStrong, color: colors.inkFaint, cursor: 'default' }),
            }}
          >
            Linke git
          </div>
          {!app.linkDetailOpen && (
            <div
              onClick={app.showLinkDetails}
              className="btn-outline-hover"
              style={{
                padding: '11px 14px',
                border: `1px solid ${colors.borderStrong}`,
                color: colors.inkSoft,
                fontSize: 13,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              Detayları gör
            </div>
          )}
          <div
            onClick={app.closeLinkMenu}
            className="btn-outline-hover"
            style={{
              padding: '11px 14px',
              border: `1px solid ${colors.borderStrong}`,
              color: colors.inkSoft,
              fontSize: 13,
              textAlign: 'center',
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            Kapat
          </div>
        </div>
      </div>
    </div>
  );
}
