// Production sunucusu: `dist/` altındaki derlenmiş uygulamayı sunar ve
// Google Calendar'ın gizli iCal linkini sunucu tarafında proxy'ler (bkz.
// PLAN.md Aşama 13). Yerel geliştirmedeki Vite dev-proxy'nin (vite.config.ts)
// production karşılığı budur — istemci kodu (src/lib/googleCalendar.ts,
// src/lib/ollama.ts) hangi ortamda olduğunu bilmez, ikisinde de aynı
// `/api/calendar.ics` ve `/api/ollama/*` yollarına istek atar.
//
// Ollama İÇİN BİLEREK bir proxy YOK: Ollama yalnızca Zeynep'in kendi
// bilgisayarında çalışıyor, production sunucusunun onu görmesi mümkün
// değil. /api/ollama/* burada kasıtlı olarak 404 döner — istemci
// (useOllamaStatus) bunu zaten "bağlı değil" olarak yorumluyor, hata
// fırlatmıyor.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Yerel `node server.js` denemeleri için .env.local'i elle yükle (Node
// prod'da bunu yapmaz, zaten platform ortam değişkenlerini process.env'e
// kendisi koyar). Dosya yoksa (production'da olduğu gibi) sessizce geç —
// zaten var olan process.env değerlerinin üstüne yazmaz.
function loadLocalEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}
loadLocalEnvFile();

const PORT = process.env.PORT || 3000;
const GCAL_ICS_URL = process.env.GCAL_ICS_URL;

const app = express();

if (GCAL_ICS_URL) {
  app.get('/api/calendar.ics', async (_req, res) => {
    try {
      const upstream = await fetch(GCAL_ICS_URL, { signal: AbortSignal.timeout(10000) });
      if (!upstream.ok) {
        res.status(502).end();
        return;
      }
      const text = await upstream.text();
      res.type('text/calendar; charset=utf-8').send(text);
    } catch {
      res.status(502).end();
    }
  });
} else {
  console.warn('[server] GCAL_ICS_URL tanımlı değil — Google Calendar senkronizasyonu devre dışı kalacak.');
}

app.use(express.static(path.join(__dirname, 'dist')));

// Tanımlanmamış /api/* yolları (ör. /api/ollama/*) SPA fallback'ine değil,
// gerçek bir 404'e düşsün — yoksa istemci tarafındaki "res.ok" kontrolleri
// yanlışlıkla index.html'i başarılı bir API yanıtı sanabilir.
app.use('/api', (_req, res) => res.status(404).end());

// Hash tabanlı routing kullanıldığı için (#growth, #learn/0 gibi) gerçek
// bir SPA fallback'e ihtiyaç yok — her yol zaten aynı index.html'i
// yüklüyor — ama doğrudan "/" dışı bir yola gidilirse diye güvenlik ağı.
// NOT: Express 5'te bare '*' artık geçersiz bir rota deseni — path-to-regexp
// v8, adlandırılmış bir joker ister (bkz. Express 5 migration notları).
app.get('/*splat', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Mühendis Gelişim Portalı ${PORT} portunda çalışıyor.`);
});
