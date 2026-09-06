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
            Detayları gör
          </div>
        </div>
      </div>
    </div>
  );
}
