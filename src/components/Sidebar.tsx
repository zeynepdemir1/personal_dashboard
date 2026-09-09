import { useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useApp } from '../state/AppState';
import { colors, fonts, navItemStyle, MOBILE_BREAKPOINT } from '../lib/theme';
import { useOllamaStatus } from '../lib/ollama';
import { initials } from '../lib/profile';
import { compressImage } from '../lib/image';
import { uploadImage } from '../lib/upload';
import { BackgroundAccent } from './BackgroundAccent';
import type { Screen } from '../lib/types';

const ACADEMIC: { key: Screen; label: string }[] = [
  { key: 'growth', label: 'Akademik Gelişim' },
  { key: 'learn', label: 'Bir Şey Öğrendim' },
  { key: 'links', label: 'Linkler' },
  { key: 'projects', label: 'Yapılacak Projeler' },
  { key: 'calendar', label: 'Program Takvimi' },
  { key: 'topics', label: 'Araştırılacak Konular' },
  { key: 'discover', label: 'Keşfedilen Programlar' },
];

const PERSONAL: { key: Screen; label: string }[] = [
  { key: 'diary', label: 'Günlük' },
  { key: 'poems', label: 'Şiir' },
];

export function Sidebar() {
  const app = useApp();
  const mobile = app.width < MOBILE_BREAKPOINT;
  const tight = app.width < 860;
  const ollama = useOllamaStatus();

  const counts: Record<string, string> = {
    growth: '42',
    learn: String(31 + app.learnEntries.length),
    links: String(86 + app.extraLinks.length),
    projects: String(12 + app.extraProjects.length),
    calendar: String(7 + app.extraPrograms.length),
    topics: String(23 + app.extraTopics.length),
    discover: String(app.discoveredPrograms.length),
    diary: '·',
    poems: String(app.poemEntries.length),
  };

  // Telefon genişliğinde sidebar artık flex akışında yer kaplayıp içeriği
  // yana itmiyor (bu, mobilde ekranın geri kalanının orantısız daralmasına
  // yol açıyordu) — bunun yerine içeriğin ÜZERİNE kapanan sabit konumlu bir
  // panel (drawer) + arkasında karartan bir backdrop. Kapalıyken ekran
  // dışına kaydırılıyor (transform), DOM'dan hiç kaldırılmıyor ki geçiş
  // animasyonu çalışsın.
  // Mobilde bir sayfaya geçince drawer kendiliğinden kapanmalı — aksi
  // halde kullanıcı gittiği sayfayı görmek için ayrıca kapatması gerekir.
  const goTo = (screen: Screen) => {
    app.navigate(screen);
    if (mobile) app.toggleSidebar();
  };

  const photoFileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const handleProfilePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);
    try {
      const url = await uploadImage(await compressImage(file));
      app.setProfilePhoto(url);
    } catch {
      setPhotoError('Fotoğraf yüklenemedi, tekrar dene.');
    }
  };

  // Oturum çerezi HttpOnly olduğu için istemci JS'i onu doğrudan silemez
  // — sunucudaki /api/logout'u çağırıp temizletiyoruz, sonra sayfayı
  // yeniden yüklüyoruz (çerez gidince auth middleware'i giriş ekranını
  // gösterecek). Bkz. PLAN.md Aşama 19 madde 7.
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      window.location.reload();
    }
  };

  const mobileWidth = Math.min(Math.round(app.width * 0.8), 280);
  const asideStyle: CSSProperties = mobile
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: mobileWidth,
        borderRight: `1px solid ${colors.border}`,
        padding: '30px 22px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: colors.sidebarBg,
        zIndex: 90,
        boxShadow: app.sidebarOpen ? '10px 0 32px rgba(61,43,46,0.18)' : 'none',
        transform: app.sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
      }
    : app.sidebarOpen
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
        };

  return (
    <>
      {mobile && app.sidebarOpen && (
        <div
          onClick={app.toggleSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(61,43,46,0.32)', zIndex: 80, cursor: 'pointer' }}
        />
      )}
      <aside style={asideStyle}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div
          onClick={() => goTo('home')}
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
            onClick={() => goTo(item.key)}
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
            onClick={() => goTo(item.key)}
            className="nav-hover"
            style={navItemStyle(app.screen === item.key)}
          >
            <span>{item.label}</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFainter }}>{counts[item.key]}</span>
          </div>
        ))}
      </nav>

      {app.sidebarOpen && <BackgroundAccent />}

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
              overflow: 'hidden',
            }}
          >
            {app.profilePhoto ? (
              <img src={app.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials(app.profileName)
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
            <div style={{ fontFamily: fonts.serif, fontSize: 15.5, lineHeight: 1.2 }}>{app.profileName}</div>
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

        {app.profileOpen && !app.editingProfile && (
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
            <span onClick={app.startEditProfile} className="text-hover-rose" style={{ cursor: 'pointer' }}>
              Profili düzenle
            </span>
            <span onClick={handleLogout} className="text-hover-red" style={{ cursor: 'pointer' }}>
              Çıkış yap
            </span>
          </div>
        )}

        {app.editingProfile && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '4px 8px 2px',
            }}
          >
            <input
              value={app.qProfileName}
              onChange={(e) => app.setQProfileName(e.target.value)}
              placeholder="Ad Soyad"
              style={{
                padding: '7px 9px',
                border: `1px solid ${colors.borderStrong}`,
                background: colors.panel,
                fontFamily: fonts.sans,
                fontSize: 12.5,
                color: colors.ink,
                outline: 'none',
                borderRadius: 3,
              }}
            />
            <input ref={photoFileRef} type="file" accept="image/*" hidden onChange={handleProfilePhoto} />
            <span
              onClick={() => photoFileRef.current?.click()}
              className="text-hover-rose"
              style={{ fontSize: 11.5, color: colors.rose, cursor: 'pointer' }}
            >
              {app.profilePhoto ? 'fotoğrafı değiştir' : '+ fotoğraf ekle'}
            </span>
            {photoError && <span style={{ fontSize: 11, color: '#B0554F' }}>{photoError}</span>}
            <div style={{ display: 'flex', gap: 6 }}>
              <div
                onClick={app.cancelEditProfile}
                className="btn-outline-hover"
                style={{ flex: 1, padding: '6px 0', textAlign: 'center', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: 12, cursor: 'pointer', borderRadius: 3 }}
              >
                Vazgeç
              </div>
              <div
                onClick={app.saveProfileName}
                className="btn-dark"
                style={{ flex: 1, padding: '6px 0', textAlign: 'center', fontSize: 12, cursor: 'pointer', borderRadius: 3 }}
              >
                Kaydet
              </div>
            </div>
          </div>
        )}
      </div>
      </aside>
    </>
  );
}
