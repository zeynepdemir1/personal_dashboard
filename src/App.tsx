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
import { Discover } from './components/screens/Discover';
import { colors, fonts, MOBILE_BREAKPOINT } from './lib/theme';

const MODULE_LABELS: Record<string, string> = {
  growth: 'Akademik Gelişim',
  learn: 'Bir Şey Öğrendim',
  links: 'Linkler',
  projects: 'Yapılacak Projeler',
  calendar: 'Program Takvimi',
  poems: 'Şiir',
  topics: 'Araştırılacak Konular',
  diary: 'Günlük',
  discover: 'Keşfedilen Programlar',
};

function Shell() {
  const app = useApp();
  const mobile = app.width < MOBILE_BREAKPOINT;
  const tight = app.width < 860;
  // Sidebar.tsx'teki drawer genişliğiyle aynı hesap — mobilde sidebar artık
  // bir overlay olduğu için (bkz. Sidebar.tsx) bu düğme onun kenarına
  // oturmalı, açıkken içeriği yana itmiyor.
  const mobileDrawerWidth = Math.min(Math.round(app.width * 0.8), 280);
  const toggleLeft = mobile
    ? app.sidebarOpen
      ? mobileDrawerWidth - 14
      : 14
    : app.sidebarOpen
      ? (tight ? 196 : 246)
      : 14;

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
          left: toggleLeft,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: colors.panel,
          border: `1px solid ${colors.borderStrong}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 95,
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
          // Sabit konumlu sidebar-açma düğmesi (top:26, height:28 — yani
          // y:26-54 arasını kaplıyor) dar/telefon genişliklerinde, dolgu
          // küçüldükçe sayfanın ilk satırıyla (Ana Sayfa'da tarih başlığı,
          // diğer ekranlarda "← Geri") YATAY olarak çakışıyordu. Kalıcı
          // çözüm: dar genişliklerde üst dolguyu düğmenin altını temizleyecek
          // kadar artırmak — böylece düğme içeriğin ÜSTÜNDEKİ boş alanda
          // durur, hangi ekran/bileşen olursa olsun (tek tek yama gerekmez).
          padding: mobile ? '70px 18px 72px' : tight ? '70px 26px 80px' : '56px 56px 96px',
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
        {app.screen === 'discover' && <Discover />}
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
