import type { CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts, pillStyle } from '../../lib/theme';
import { MONTHS } from '../../lib/data';
import { SEED_LEARN_ENTRIES } from '../../lib/learn';

export function Growth() {
  const app = useApp();
  const narrow = app.width < 1180;

  const gridGrowth: CSSProperties = narrow
    ? { display: 'grid', gridTemplateColumns: '1fr', gap: 34, alignItems: 'start' }
    : { display: 'grid', gridTemplateColumns: '290px minmax(430px, 1fr)', gap: 48, alignItems: 'start' };

  const filters = ['Tümü', 'Kontrol', 'Gömülü', 'Analog', 'Matematik'];

  const learnEntries = [...app.learnEntries, ...SEED_LEARN_ENTRIES];

  const months = MONTHS.map((m, mi) => {
    // İlk ay (Ağustos) "bu ay" — Bir Şey Öğrendim'e yeni bir giriş
    // kaydedilip yerel modelle özetlendiğinde buraya gerçek bir not
    // olarak ekleniyor (bkz. PLAN.md Aşama 10, AppState.saveLearnEntry).
    const extraNotes = mi === 0 ? app.extraGrowthNotes : [];
    const allNotes = [...extraNotes, ...m.notes];
    return {
      ...m,
      count: m.count + extraNotes.length,
      bars: Array.from({ length: 14 }, (_, i) => {
        const h = 6 + ((i * 7 + m.count * 3) % 26);
        return { h, active: h > 20 };
      }),
      notes: allNotes.map((n) => {
        if (!n.link) return { ...n, open: undefined };
        const idx = learnEntries.findIndex((e) => e.title === n.title);
        return { ...n, open: idx >= 0 ? () => app.navigate('learn', idx) : () => app.navigate('learn') };
      }),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 46 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Akademik Gelişim
        </h1>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: '12px 0' }}>
        {filters.map((f, i) => (
          <div key={f} className="hover-row" style={pillStyle(i === 0)}>
            {f}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontFamily: fonts.sans, fontSize: 11, color: colors.inkSoft, whiteSpace: 'nowrap' }}>42 not · 9 ay</div>
      </div>

      {months.map((m) => (
        <section key={m.name} style={gridGrowth}>
          {/* Sticky sadece masaüstündeki iki sütunlu düzende anlamlı (kart
              sol sütunda sabit kalırken sağdaki uzun not listesi kayar).
              Tek sütuna indiğinde (narrow) kart ve not listesi aynı
              sütunda üst üste yığıldığı için sticky, kartın liste
              kaymasının ÜSTÜNDE asılı kalmasına ve metinlerin iç içe
              geçmesine yol açıyordu — mobilde normal (static) akışa
              dönülüyor. */}
          <div style={{ position: narrow ? 'static' : 'sticky', top: 40, border: `1px solid ${colors.border}`, background: colors.panel, padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: fonts.serif, fontSize: 24, fontWeight: 500, color: colors.ink }}>{m.name}</div>
              <div style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.inkFainter }}>{m.count} not</div>
            </div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 34 }}>
              {m.bars.map((b, i) => (
                <div key={i} style={{ flex: 1, height: b.h, background: b.active ? colors.rose : '#F0DADA' }} />
              ))}
            </div>
            <p style={{ margin: 0, fontFamily: fonts.serif, fontSize: 15.5, lineHeight: 1.62, color: colors.ink, textWrap: 'pretty' }}>{m.summary}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {m.tags.map((t) => (
                <span key={t} style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.04em', padding: '4px 8px', background: colors.chipBg, color: colors.chipText, borderRadius: 2 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${colors.border}`, paddingLeft: 0 }}>
            {m.notes.map((n, i) => (
              <div
                key={i}
                onClick={n.open}
                className={n.open ? 'hover-row-alt' : undefined}
                style={{ display: 'flex', gap: 20, padding: '18px 0 20px 26px', borderBottom: '1px solid #F1E4E4', position: 'relative', cursor: n.open ? 'pointer' : 'default' }}
              >
                <span style={{ position: 'absolute', left: -4, top: 26, width: 7, height: 7, borderRadius: '50%', background: n.dot }} />
                <div style={{ flex: '0 0 74px', fontFamily: fonts.sans, fontSize: 11, color: colors.inkFainter, paddingTop: 3 }}>{n.date}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <div style={{ fontFamily: fonts.serif, fontSize: 18.5, lineHeight: 1.35, color: colors.ink }}>{n.title}</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.65, color: colors.inkSoft, textWrap: 'pretty' }}>{n.body}</div>
                  <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.inkFainter }}>{n.source}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
