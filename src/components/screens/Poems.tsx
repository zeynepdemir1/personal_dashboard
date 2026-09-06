import { colors, fonts } from '../../lib/theme';
import { POEMS } from '../../lib/data';

export function Poems() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: '62ch' }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Şiir
        </h1>
      </header>
      {POEMS.map((p, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 34, borderBottom: '1px solid #F1E4E4' }}>
          <div style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 20, color: colors.ink }}>{p.title}</div>
          <p style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17, lineHeight: 1.9, color: colors.ink, whiteSpace: 'pre-line' }}>{p.text}</p>
          <div style={{ fontFamily: fonts.sans, fontSize: 10.5, color: colors.inkFainter, letterSpacing: '0.08em' }}>{p.date}</div>
        </div>
      ))}
    </div>
  );
}
