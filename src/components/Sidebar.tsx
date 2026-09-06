import { useApp } from '../state/AppState';
import { colors, fonts, navItemStyle } from '../lib/theme';
import { useOllamaStatus } from '../lib/ollama';
import type { Screen } from '../lib/types';

const ACADEMIC: { key: Screen; label: string }[] = [
  { key: 'growth', label: 'Akademik Gelişim' },
  { key: 'learn', label: 'Bir Şey Öğrendim' },
  { key: 'links', label: 'Linkler' },
  { key: 'projects', label: 'Yapılacak Projeler' },
  { key: 'calendar', label: 'Program Takvimi' },
  { key: 'topics', label: 'Araştırılacak Konular' },
];

const PERSONAL: { key: Screen; label: string; count: string }[] = [
  { key: 'diary', label: 'Günlük', count: '·' },
  { key: 'poems', label: 'Şiir', count: '9' },
];

export function Sidebar() {
  const app = useApp();
  const tight = app.width < 860;
  const ollama = useOllamaStatus();

  const counts: Record<string, string> = {
    growth: '42',
    learn: String(31 + app.learnEntries.length),
    links: String(86 + app.extraLinks.length),
    projects: String(12 + app.extraProjects.length),
    calendar: String(7 + app.extraPrograms.length),
    topics: String(23 + app.extraTopics.length),
  };

  return (
    <aside
      style={
        app.sidebarOpen
          ? {
              width: tight ? 210 : 260,
              flex: `0 0 ${tight ? 210 : 260}px`,
              borderRight: `1px solid ${colors.border}`,
              padding: '30px 22px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              position: 'sticky',
              top: 0,
              height: '100vh',
              background: colors.sidebarBg,
              transition: 'width 0.15s ease',
            }
          : {
              width: 0,
              flex: '0 0 0',
              borderRight: 'none',
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              position: 'sticky',
              top: 0,
              height: '100vh',
              background: colors.sidebarBg,
              transition: 'width 0.15s ease',
            }
      }
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div
          onClick={() => app.navigate('home')}
          className="nav-hover"
          style={navItemStyle(app.screen === 'home')}
        >
          Ana Sayfa
        </div>

        <div
          style={{
            marginTop: 20,
            fontFamily: fonts.sans,
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: colors.inkFaint,
            padding: '0 10px 6px',
          }}
        >
          Akademik
        </div>
        {ACADEMIC.map((item) => (
          <div
            key={item.key}
            onClick={() => app.navigate(item.key)}
            className="nav-hover"
            style={navItemStyle(app.screen === item.key)}
          >
            <span>{item.label}</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFainter }}>
              {counts[item.key]}
            </span>
          </div>
        ))}

        <div
          style={{
            marginTop: 20,
            fontFamily: fonts.sans,
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: colors.inkFaint,
            padding: '0 10px 6px',
          }}
        >
          Kişisel
        </div>
        {PERSONAL.map((item) => (
          <div
            key={item.key}
            onClick={() => app.navigate(item.key)}
            className="nav-hover"
            style={navItemStyle(app.screen === item.key)}
          >
            <span>{item.label}</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFainter }}>{item.count}</span>
          </div>
        ))}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingTop: 22,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div
          onClick={app.toggleProfile}
          className="hover-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            padding: '6px 8px',
            margin: '0 -8px',
            borderRadius: 6,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: colors.inkSoft,
              color: colors.chipBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.serif,
              fontSize: 15,
              flex: '0 0 38px',
            }}
          >
            DA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
            <div style={{ fontFamily: fonts.serif, fontSize: 15.5, lineHeight: 1.2 }}>Deniz Arslan</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: fonts.sans,
                fontSize: 10,
                letterSpacing: '0.04em',
                color: colors.inkFaint,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: ollama.connected ? '#6E9E7E' : colors.steel,
                  flex: '0 0 5px',
                }}
              />
              {ollama.label}
            </div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: colors.inkFaint }}>⋯</span>
        </div>

        {app.profileOpen && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: '4px 8px 2px',
              fontSize: 12.5,
              color: colors.inkSoft,
            }}
          >
            <span className="text-hover-rose" style={{ cursor: 'pointer' }}>
              Profili düzenle
            </span>
            <span className="text-hover-rose" style={{ cursor: 'pointer' }}>
              Hesap ekle
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
