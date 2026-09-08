import type { CSSProperties } from 'react';

// Renk değerlerinin tek kaynağı src/index.css'teki :root değişkenleri —
// buradaki adlar sadece bileşenlerden erişimi kolaylaştırıyor.
export const colors = {
  rose: 'var(--color-old-rose)',
  roseHover: 'var(--color-old-rose-hover)',
  taupe: 'var(--color-taupe-grey)',
  taupeHover: 'var(--color-taupe-grey-hover)',
  steel: 'var(--color-cool-steel)',
  bg: 'var(--color-bg)',
  ink: 'var(--color-ink)',
  inkSoft: 'var(--color-taupe-grey)',
  inkFaint: 'var(--color-ink-faint)',
  inkFainter: 'var(--color-ink-fainter)',
  border: 'var(--color-border)',
  borderStrong: 'var(--color-pale-slate)',
  borderFaint: 'var(--color-border-faint)',
  panel: 'var(--color-panel)',
  panelAlt: 'var(--color-panel-alt)',
  sidebarBg: 'var(--color-sidebar-bg)',
  hoverPink: 'var(--color-hover-pink)',
  navHover: 'var(--color-nav-hover)',
  chipBg: 'var(--color-soft-blush)',
  chipText: 'var(--color-chip-text)',
  placeholderText: 'var(--color-placeholder)',
};

export const fonts = {
  serif: "'Newsreader', Georgia, serif",
  sans: "'IBM Plex Sans', Helvetica, sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

// Telefon genişlikleri (~375-430px) için ayrı bir eşik — `tight` (<860)
// hâlâ tablet/dar masaüstü için "yan yana ama dar" davranışını korurken,
// bunun altında sidebar tam ekran bir overlay'e dönüşüyor (bkz.
// App.tsx/Sidebar.tsx, PLAN.md Aşama 18) çünkü içeriği yana itmek bu
// genişlikte kullanılamaz hale geliyordu.
export const MOBILE_BREAKPOINT = 640;

export function pillStyle(active: boolean): CSSProperties {
  return {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    fontWeight: 500,
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: 2,
    background: active ? colors.taupe : 'transparent',
    color: active ? colors.chipBg : colors.inkSoft,
    border: active ? 'none' : `1px solid ${colors.borderStrong}`,
  };
}

export function navItemStyle(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    padding: '8px 10px',
    margin: '0 -10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1.3,
    background: active ? colors.chipBg : 'transparent',
    color: active ? colors.ink : '#4A3B3E',
    fontWeight: active ? 500 : 400,
  };
}

// Haftalık takvimde bir saatlik satırın piksel yüksekliği — Home.tsx'teki
// saat etiketleri, arkaplan çizgileri ve toplam ızgara yüksekliği de bu
// sabitten türetiliyor (tek yerden ayarlanabilsin, daha ferah bir görünüm
// için 56'dan 64'e çıkarıldı — bkz. PLAN.md Aşama 9).
export const HOUR_ROW_HEIGHT = 64;

// Bir gün sütununda hem yerel not hem Google Calendar etkinliği aynı ana
// denk gelebiliyor (gerçek bir takvimle test edince görüldü) — 'split'
// ikisini yan yana yarım genişlikte gösterir, 'full' tek kaynak varken
// tüm genişliği kullanır.
export type BlockColumn = 'full' | 'left' | 'right';

function columnPosition(column: BlockColumn): CSSProperties {
  if (column === 'left') return { left: 0, width: '48%' };
  if (column === 'right') return { right: 0, width: '48%' };
  return { left: 0, right: 0 };
}

export function dayBlockStyle(s: number, e: number, column: BlockColumn = 'full'): CSSProperties {
  const long = e - s >= 1.25;
  return {
    position: 'absolute',
    boxSizing: 'border-box',
    ...columnPosition(column),
    top: (s - 8) * HOUR_ROW_HEIGHT,
    height: (e - s) * HOUR_ROW_HEIGHT - 4,
    padding: '6px 10px',
    borderRadius: 4,
    fontSize: 11.5,
    lineHeight: 1.32,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    zIndex: 1,
    background: long ? colors.chipBg : '#F1E9E9',
    color: long ? colors.chipText : colors.inkSoft,
    border: long ? '1px solid #F0BFC0' : `1px dashed ${colors.borderStrong}`,
  };
}

// Google Calendar'dan senkronize olan bloklar için ayrı stil — yerel
// notlardan (pembe tonlar) görsel olarak ayrılsın diye steel/gri tonunda.
export function gcalBlockStyle(s: number, e: number, column: BlockColumn = 'full'): CSSProperties {
  return {
    position: 'absolute',
    boxSizing: 'border-box',
    ...columnPosition(column),
    top: (s - 8) * HOUR_ROW_HEIGHT,
    height: Math.max((e - s) * HOUR_ROW_HEIGHT - 4, 16),
    padding: '6px 10px',
    borderRadius: 4,
    fontSize: 11.5,
    lineHeight: 1.32,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    zIndex: 1,
    background: 'rgba(157,163,164,0.18)',
    color: colors.inkSoft,
    border: `1px dashed ${colors.steel}`,
  };
}
