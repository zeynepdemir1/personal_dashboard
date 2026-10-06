// Birden fazla Google Calendar iCal kaynağını ortam değişkenlerinden okuyan
// paylaşılan mantık — hem `vite.config.ts` (dev proxy) hem `server.js`
// (production) tarafından import ediliyor, böylece ikisi asla birbirinden
// sapmıyor (bkz. PLAN.md Aşama 31).
//
// Kurulum: `GCAL_ICS_URL` her zaman 1. takvim (geriye dönük uyumluluk —
// Zeynep'in zaten kurulu olan tek takvimi hiçbir değişiklik gerektirmiyor).
// 2. ve sonrası için `GCAL_ICS_URL_2`, `GCAL_ICS_URL_3`, ... eklenir;
// her biri için isteğe bağlı bir `GCAL_ICS_URL_<n>_LABEL` ("Dersler" gibi,
// yoksa "Takvim <n>" kullanılır) hangi takvimden geldiğini arayüzde
// ayırt edilebilir kılar. Yeni bir takvim eklemek için tek yapılması
// gereken bir sıradaki numarayla bu iki değişkeni tanımlamak — kodda
// başka hiçbir değişiklik gerekmiyor.
export function getGcalSources(env) {
  const sources = [];
  if (env.GCAL_ICS_URL) {
    sources.push({ index: 1, label: env.GCAL_ICS_URL_1_LABEL || 'Takvim', url: env.GCAL_ICS_URL });
  }
  for (let i = 2; i <= 20; i++) {
    const url = env[`GCAL_ICS_URL_${i}`];
    if (!url) continue;
    const label = env[`GCAL_ICS_URL_${i}_LABEL`] || `Takvim ${i}`;
    sources.push({ index: i, label, url });
  }
  return sources;
}
