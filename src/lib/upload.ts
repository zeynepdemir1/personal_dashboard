// Fotoğrafları sunucu üzerinden Cloudinary'ye yükler (bkz. PLAN.md
// Aşama 16). compressImage()'ın ürettiği data URL burada base64 olarak
// localStorage'a gömülmek yerine kalıcı bir Cloudinary URL'ine
// dönüştürülüyor. Ollama'daki sessiz-vazgeçme davranışının aksine burada
// hata fırlatılıyor — fotoğraf hiç kaydedilmediyse kullanıcı bunu bilmeli.
export async function uploadImage(dataUrl: string): Promise<string> {
  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl }),
  });
  if (!res.ok) throw new Error(`Fotoğraf yüklenemedi (${res.status})`);
  const data = await res.json().catch(() => null);
  if (!data?.url) throw new Error('Fotoğraf yüklenemedi');
  return data.url as string;
}
