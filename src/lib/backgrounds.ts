// PLAN.md Aşama 19 madde 9 / Aşama 21: Zeynep'in seçtiği fotoğraflar önce
// sabit bir set olarak `public/backgrounds/`'a kondu; Aşama 21'de siteden
// doğrudan yükleme/silme eklendiği için bu liste artık sadece İLK
// (varsayılan) set — gerçek liste `PersistedState.backgroundImages`'ta
// (bkz. AppState.tsx), Redis'te tutuluyor ve cihazlar arası senkronize.
export const BACKGROUND_IMAGES = [
  '/backgrounds/bg-1.jpeg',
  '/backgrounds/bg-2.jpeg',
  '/backgrounds/bg-3.jpeg',
  '/backgrounds/bg-4.jpeg',
  '/backgrounds/bg-5.jpeg',
  '/backgrounds/bg-6.jpeg',
  '/backgrounds/bg-7.jpeg',
  '/backgrounds/bg-8.jpeg',
  '/backgrounds/bg-9.jpeg',
  '/backgrounds/bg-10.jpeg',
  '/backgrounds/bg-11.jpeg',
  '/backgrounds/bg-12.jpeg',
];

export function randomBackground(images: string[], exclude?: string): string {
  const source = images.length > 0 ? images : BACKGROUND_IMAGES;
  const pool = exclude ? source.filter((b) => b !== exclude) : source;
  const list = pool.length > 0 ? pool : source;
  return list[Math.floor(Math.random() * list.length)];
}
