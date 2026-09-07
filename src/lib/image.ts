// Fotoğraf yükleme hatasının kök nedeni: ham fotoğraflar (telefon
// kameraları kolayca 3-8 MB üretir) hiç küçültülmeden base64'e çevrilip
// tüm uygulama durumuyla birlikte localStorage'a yazılmaya çalışılıyordu.
// Tarayıcıların localStorage kotası (~5-10 MB) tek bir büyük fotoğrafla
// bile aşılabiliyor; `AppState.tsx`'teki `localStorage.setItem` o zaman
// sessizce başarısız oluyor (try/catch ile yutuluyor) ve fotoğraf hiç
// kalıcı olmuyor — sanki "açılmıyor" gibi görünüyor. Çözüm: kaydetmeden
// önce görseli canvas ile küçültüp yeniden sıkıştırmak.
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;

export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Görsel okunamadı'));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Canvas desteklenmiyorsa ham veriye düş — en azından çalışsın.
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
