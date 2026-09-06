import type { CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { PROGRAMS, TODAY } from '../../lib/data';
import { daysLeftUntil, daysLeftColor, formatDaysLeft } from '../../lib/dates';

export function CalendarScreen() {
  const app = useApp();
  const narrow = app.width < 1180;

  const listGrid: CSSProperties = narrow
    ? { display: 'flex', flexDirection: 'column', gap: 6, padding: '18px 6px', borderBottom: '1px solid #F1E4E4' }
    : { display: 'grid', gridTemplateColumns: '110px minmax(0, 1fr) 140px', gap: 20, padding: '20px 6px', borderBottom: '1px solid #F1E4E4', alignItems: 'baseline' };

  const programs = [
    ...PROGRAMS,
    ...app.extraPrograms.map((p) => ({ date: TODAY, title: p, note: 'Ana sayfadan eklendi' })),
  ].map((p) => {
    const left = daysLeftUntil(p.date);
    return {
      ...p,
      remind: left === null ? '' : formatDaysLeft(left),
      color: left === null ? colors.inkFaint : daysLeftColor(left),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Program Takvimi
        </h1>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.border}` }}>
        {programs.map((p, i) => (
          <div key={i} className="hover-row-alt" style={listGrid}>
            <span style={{ fontFamily: fonts.sans, fontSize: 11.5, color: colors.ink }}>{p.date}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontFamily: fonts.serif, fontSize: 19, color: colors.ink }}>{p.title}</span>
              <span style={{ fontSize: 13, lineHeight: 1.6, color: colors.inkSoft }}>{p.note}</span>
            </div>
            <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: p.color, textAlign: 'right' }}>{p.remind}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
