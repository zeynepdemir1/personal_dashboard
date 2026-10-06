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

// Google Calendar'dan senkronize olan bloklar için ayrı renk — yerel
// notlardan (pembe tonlar) görsel olarak ayrılsın diye steel/gri tonunda.
// Birden fazla takvim bağlandığında (bkz. PLAN.md Aşama 31) hangi
// etkinliğin hangi takvimden geldiği, `calendarIndex`'e göre seçilen bu
// paletle (sınır rengi) ayırt edilebiliyor — 1. takvim (ana takvim) eskisi
// gibi steel/gri, 2. takvim (ör. "Dersler") taupe, sonrası ikisi arasında
// döner. Yeni bir renk eklemeksizin (CSS değişkeni gerektirmeden) sadece
// zaten var olan iki renk arasında dönerek büyümeye açık bırakılıyor. Bu
// fonksiyon hâlâ kaynağa göre (çakışma YOKKEN) renklendirme ve ay
// görünümündeki noktalar/üstteki etiket için kullanılıyor.
const GCAL_PALETTE: { bg: string; border: string }[] = [
  { bg: 'rgba(157,163,164,0.18)', border: colors.steel },
  { bg: 'rgba(96,77,83,0.16)', border: colors.taupe },
];

export function gcalColorForIndex(calendarIndex: number): { bg: string; border: string } {
  return GCAL_PALETTE[(calendarIndex - 1) % GCAL_PALETTE.length];
}

// Haftalık takvimde bir günde İKİ YA DA DAHA FAZLA etkinlik aynı saate
// denk geldiğinde (kaynağı ne olursa olsun — bkz. PLAN.md Aşama 32,
// calendarLayout.ts) her biri mevcut 5 renkli paletten (Soft Blush, Old
// Rose, Pale Slate, Cool Steel, Taupe Grey) FARKLI bir ton alır, böylece
// hangi kutunun hangi etkinliğe ait olduğu "kaynağa göre renk"ten
// bağımsız olarak da ayırt edilebilir. Sütun sayısı 5'i geçerse (çok
// nadir) baştan döner.
const OVERLAP_PALETTE: { bg: string; border: string; text: string }[] = [
  { bg: colors.chipBg, border: colors.rose, text: colors.chipText },
  { bg: 'rgba(219,127,142,0.24)', border: colors.rose, text: colors.ink },
  { bg: 'rgba(213,197,200,0.5)', border: colors.borderStrong, text: colors.ink },
  { bg: 'rgba(157,163,164,0.22)', border: colors.steel, text: colors.inkSoft },
  { bg: 'rgba(96,77,83,0.2)', border: colors.taupe, text: colors.inkSoft },
];

function overlapColorForColumn(columnIndex: number): { bg: string; border: string; text: string } {
  return OVERLAP_PALETTE[columnIndex % OVERLAP_PALETTE.length];
}

// Haftalık takvimdeki TEK bir blok kaynağı: yerel bir not/ders (süresine
// göre "uzun"/"kısa" iki tonu vardı) ya da bir Google Calendar etkinliği
// (hangi takvimden geldiğine göre renkli).
export type WeekBlockSource = { kind: 'local'; long: boolean } | { kind: 'gcal'; calendarIndex: number };

// Bir günde çakışan TÜM etkinlikler (kaynağı ne olursa olsun) artık tek
// bir genel sütun yerleşimi paylaşıyor (bkz. calendarLayout.ts). Çakışma
// yoksa (columnCount === 1) her kaynak kendi eski rengini korur; çakışma
// varsa (columnCount > 1) kaynağa bakılmaksızın sütun sırasına göre
// OVERLAP_PALETTE'ten bir ton atanır — aynı kümedeki hiçbir iki etkinlik
// aynı rengi almaz.
export function weekBlockStyle(
  s: number,
  e: number,
  columnIndex: number,
  columnCount: number,
  source: WeekBlockSource,
): CSSProperties {
  let background: string;
  let color: string;
  let border: string;

  if (columnCount > 1) {
    const p = overlapColorForColumn(columnIndex);
    background = p.bg;
    color = p.text;
    border = `1px solid ${p.border}`;
  } else if (source.kind === 'local') {
    background = source.long ? colors.chipBg : '#F1E9E9';
    color = source.long ? colors.chipText : colors.inkSoft;
    border = source.long ? '1px solid #F0BFC0' : `1px dashed ${colors.borderStrong}`;
  } else {
    const p = gcalColorForIndex(source.calendarIndex);
    background = p.bg;
    color = colors.inkSoft;
    border = `1px dashed ${p.border}`;
  }

  return {
    position: 'absolute',
    boxSizing: 'border-box',
    left: `calc(${(columnIndex / columnCount) * 100}% + ${columnIndex > 0 ? 2 : 0}px)`,
    width: `calc(${(1 / columnCount) * 100}% - 2px)`,
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
    background,
    color,
    border,
  };
}
