import type { CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { PROJECTS } from '../../lib/data';

export function Projects() {
  const app = useApp();
  const narrow = app.width < 1180;

  const listGrid: CSSProperties = narrow
    ? { display: 'flex', flexDirection: 'column', gap: 6, padding: '18px 6px', borderBottom: '1px solid #F1E4E4' }
    : { display: 'grid', gridTemplateColumns: '110px minmax(0, 1fr) 140px', gap: 20, padding: '20px 6px', borderBottom: '1px solid #F1E4E4', alignItems: 'baseline' };

  const projects = [...app.extraProjects, ...PROJECTS];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Yapılacak Projeler
        </h1>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.border}` }}>
        {projects.map((p, i) => (
          <div key={i} className="hover-row-alt" style={listGrid}>
            <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.stateColor }}>{p.state}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontFamily: fonts.serif, fontSize: 19, color: colors.ink }}>{p.title}</span>
              <span style={{ fontSize: 13, lineHeight: 1.6, color: colors.inkSoft }}>{p.note}</span>
            </div>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint, textAlign: 'right' }}>{p.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
