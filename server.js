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
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET;

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

// Günlük Telegram bildirimi (bkz. PLAN.md Aşama 15, madde 5) — GitHub
// Actions'taki zamanlanmış bir workflow bu uç noktayı her gün tetikler
// (bkz. .github/workflows/daily-telegram-notify.yml). Paylaşımlı bir sır
// (CRON_SECRET) ile korunuyor; doğru başlık olmadan istek 401 alır.
//
// ÖNEMLİ SINIRLAMA: Uygulamanın TÜM kişisel verisi (eklediğin dersler/
// notlar, program eklemeleri) yalnızca tarayıcının localStorage'ında
// yaşıyor — sunucunun buna hiçbir erişimi yok. Bu yüzden bildirim şu an
// SADECE statik "Yaklaşan Programlar" listesindeki (data.ts → PROGRAMS)
// gerçek tarihli hatırlatmaları, GERÇEK bugünün tarihine göre raporluyor.
// Kendi eklediğin ders notların bu bildirime giremiyor — bunun için
// gerçek bir sunucu tarafı veritabanı gerekir (şimdilik kapsam dışı).
const UPCOMING_PROGRAMS = [
  { date: '15.09.2026', title: 'TÜBİTAK 2209-A · 2. dönem son başvuru', note: 'Proje önerisi, bütçe tablosu, danışman onayı' },
  { date: '02.10.2026', title: 'TEKNOFEST takım başvurusu', note: 'Kontrol ve otomasyon kategorisi' },
  { date: '20.11.2026', title: 'IEEE öğrenci sempozyumu · özet', note: '250 kelime özet, poster opsiyonel' },
  { date: '10.01.2027', title: 'TÜBİTAK 2242 lise/lisans yarışması', note: 'Ön kayıt açılışı' },
  { date: '01.03.2027', title: 'Erasmus+ staj başvuru dönemi', note: 'Dil belgesi ve transkript hazır olmalı' },
];

function parseDDMMYYYY(s) {
  const [d, m, y] = s.split('.').map(Number);
  return new Date(y, m - 1, d);
}

function daysLeftReal(dateStr) {
  const target = parseDDMMYYYY(dateStr);
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function buildDailyMessage() {
  const upcoming = UPCOMING_PROGRAMS.map((p) => ({ ...p, left: daysLeftReal(p.date) }))
    .filter((p) => p.left >= 0)
    .sort((a, b) => a.left - b.left);

  const todayStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  const lines = [`📅 ${todayStr}`, ''];

  if (upcoming.length === 0) {
    lines.push('Yaklaşan bir program hatırlatması yok.');
  } else {
    lines.push('Yaklaşan programlar:');
    for (const p of upcoming.slice(0, 5)) {
      const leftText = p.left === 0 ? 'bugün' : `${p.left} gün kaldı`;
      lines.push(`• ${p.title} — ${leftText}\n  ${p.note}`);
    }
  }
  return lines.join('\n');
}

async function sendTelegramMessage(text) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Telegram API ${res.status}`);
}

app.post('/api/notify/daily', express.json(), async (req, res) => {
  if (!CRON_SECRET || req.get('X-Cron-Secret') !== CRON_SECRET) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    res.status(503).json({ error: 'telegram not configured' });
    return;
  }
  try {
    const message = buildDailyMessage();
    await sendTelegramMessage(message);
    res.json({ ok: true });
  } catch (err) {
    console.error('[server] Telegram bildirimi gönderilemedi:', err);
    res.status(502).json({ error: 'telegram send failed' });
  }
});

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
