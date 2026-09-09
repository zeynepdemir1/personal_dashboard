// PLAN.md Aşama 19 madde 9: Zeynep'in kendi seçtiği (Pinterest) fotoğraflar
// — `public/backgrounds/`'a taşındı (kaynak dosyalar `resim/` klasöründe
// duruyordu, dosya adları boşluk/emoji içerdiği için sabit adlarla
// kopyalandı). İleride otomatik/AI üretilen görsellere geçiş ayrı bir
// aşama olarak PLAN.md'ye not edildi — şimdilik bu sabit set kullanılıyor.
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

export function randomBackground(exclude?: string): string {
  const pool = exclude ? BACKGROUND_IMAGES.filter((b) => b !== exclude) : BACKGROUND_IMAGES;
  const list = pool.length > 0 ? pool : BACKGROUND_IMAGES;
  return list[Math.floor(Math.random() * list.length)];
}
