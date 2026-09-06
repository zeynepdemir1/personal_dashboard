import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { DIARY } from '../../lib/data';

export function Diary() {
  const app = useApp();

  if (!app.unlocked) {
    return (
      <div style={{ minHeight: '74vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, textAlign: 'center' }}>
        <div style={{ width: 34, height: 34, border: `1px solid ${colors.borderStrong}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 7, height: 7, background: colors.inkSoft, borderRadius: '50%' }} />
        </div>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 34, fontWeight: 400, letterSpacing: '-0.015em', color: colors.ink }}>
          Günlük kilitli
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <input
            type="password"
            value={app.pass}
            onChange={(e) => app.setPass(e.target.value)}
            placeholder="••••••••"
            style={{
              width: 260,
              padding: '13px 16px',
              border: `1px solid ${colors.borderStrong}`,
              background: colors.panel,
              fontFamily: fonts.sans,
              fontSize: 14,
              letterSpacing: '0.2em',
              textAlign: 'center',
              outline: 'none',
              color: colors.ink,
            }}
          />
          <div onClick={app.unlock} className="btn-dark" style={{ width: 260, padding: '12px 0', fontSize: 13, textAlign: 'center', cursor: 'pointer', borderRadius: 3 }}>
            Aç
          </div>
          <div style={{ fontFamily: fonts.sans, fontSize: 10.5, color: colors.inkFaint, letterSpacing: '0.06em' }}>
            son giriş · 27 Ağustos, 23:41
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34, maxWidth: '68ch' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, paddingBottom: 14 }}>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 34, fontWeight: 400, color: colors.ink }}>Günlük</h1>
        <span onClick={app.lock} className="hover-underline" style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer', borderBottom: '1px solid transparent', paddingBottom: 1 }}>
          kilitle
        </span>
      </header>
      {DIARY.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 26, borderBottom: '1px solid #F1E4E4' }}>
          <div style={{ fontFamily: fonts.sans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.inkFainter }}>{d.date}</div>
          <p style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17.5, lineHeight: 1.72, textWrap: 'pretty', color: colors.ink }}>{d.text}</p>
        </div>
      ))}
    </div>
  );
}
