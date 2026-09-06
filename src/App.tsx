import { AppStateProvider, useApp } from './state/AppState';
import { Sidebar } from './components/Sidebar';
import { DayPanel } from './components/DayPanel';
import { LinkMenu } from './components/LinkMenu';
import { Home } from './components/screens/Home';
import { Growth } from './components/screens/Growth';
import { Learn } from './components/screens/Learn';
import { Diary } from './components/screens/Diary';
import { Links } from './components/screens/Links';
import { Projects } from './components/screens/Projects';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { Poems } from './components/screens/Poems';
import { Topics } from './components/screens/Topics';
import { colors, fonts } from './lib/theme';

const MODULE_LABELS: Record<string, string> = {
  growth: 'Akademik Gelişim',
  learn: 'Bir Şey Öğrendim',
  links: 'Linkler',
  projects: 'Yapılacak Projeler',
  calendar: 'Program Takvimi',
  poems: 'Şiir',
  topics: 'Araştırılacak Konular',
  diary: 'Günlük',
};

function Shell() {
  const app = useApp();
  const tight = app.width < 860;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        minHeight: '100vh',
        background: colors.bg,
        color: colors.ink,
        fontFamily: fonts.sans,
      }}
    >
      <div
        onClick={app.toggleSidebar}
        style={{
          position: 'fixed',
          top: 26,
          left: app.sidebarOpen ? (tight ? 196 : 246) : 14,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: colors.panel,
          border: `1px solid ${colors.borderStrong}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 40,
          color: colors.inkSoft,
          fontSize: 13,
          transition: 'left 0.15s ease',
        }}
      >
        {app.sidebarOpen ? '‹' : '›'}
      </div>

      <Sidebar />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: tight ? '36px 26px 80px' : '56px 56px 96px',
          maxWidth: 1240,
        }}
      >
        {app.screen !== 'home' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 28,
              fontFamily: fonts.sans,
              fontSize: 12.5,
              color: colors.inkSoft,
              flexWrap: 'wrap',
            }}
          >
            <span
              onClick={app.goBack}
              className="hover-row"
              style={{
                cursor: 'pointer',
                color: colors.inkSoft,
                fontWeight: 500,
                padding: '7px 14px',
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: 4,
                background: colors.panel,
              }}
            >
              ← Geri
            </span>
            <span style={{ color: colors.inkFainter }}>{MODULE_LABELS[app.screen]}</span>
          </div>
        )}

        {app.screen === 'home' && <Home />}
        {app.screen === 'growth' && <Growth />}
        {app.screen === 'learn' && <Learn />}
        {app.screen === 'diary' && <Diary />}
        {app.screen === 'links' && <Links />}
        {app.screen === 'projects' && <Projects />}
        {app.screen === 'calendar' && <CalendarScreen />}
        {app.screen === 'poems' && <Poems />}
        {app.screen === 'topics' && <Topics />}
      </main>

      <DayPanel />
      <LinkMenu />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
