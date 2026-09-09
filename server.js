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
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';

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

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CONFIGURED = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('[server] Cloudinary ortam değişkenleri eksik — fotoğraf yükleme devre dışı kalacak.');
}

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const DISCOVER_CONFIGURED = !!(SERPAPI_KEY && UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
if (!DISCOVER_CONFIGURED) {
  console.warn('[server] SerpApi/Upstash ortam değişkenleri eksik — Program Keşfi devre dışı kalacak.');
}

// Sabit zamanlı (timing-safe) string karşılaştırma — parola/sır
// kontrollerinde `===`/`!==` yerine bunu kullanıyoruz, çünkü `===` bir
// eşleşmezlik bulur bulmaz döner ve bu küçük zaman farkı teorik olarak
// karakter karakter parola tahmin etmekte (timing attack) kullanılabilir.
// Önce sabit uzunlukta (32 byte) hash'liyoruz ki farklı uzunluktaki
// girdilerde de crypto.timingSafeEqual çökmesin.
function timingSafeStringEqual(a, b) {
  const ah = createHash('sha256').update(String(a)).digest();
  const bh = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ah, bh);
}

// Site geneli erişim koruması (bkz. PLAN.md Aşama 17, madde 1-2) — site
// artık zdemir.tech üzerinden herkese açık olduğu için eklendi. Çoklu
// kullanıcı/hesap sistemi DEĞİL: tek bir paylaşılan parola (SITE_PASSWORD)
// + imzalı bir oturum çerezi. Oturum durumu sunucuda TUTULMUYOR (stateless)
// — Render'ın ücretsiz planı sık sık yeniden başladığı için (bkz. Aşama 16)
// bellekte tutulan bir oturum listesi her yeniden başlatmada herkesi
// çıkışa zorlardı. Bunun yerine çerezin kendisi HMAC ile imzalanıyor;
// SESSION_SECRET değişirse (ör. şüpheli bir erişim sonrası) TÜM oturumlar
// aynı anda geçersiz olur — bu da bir çeşit "herkesi çıkışa zorla" aracı.
const SITE_PASSWORD = process.env.SITE_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
const AUTH_CONFIGURED = !!(SITE_PASSWORD && SESSION_SECRET);
if (!AUTH_CONFIGURED) {
  console.warn('[server] SITE_PASSWORD/SESSION_SECRET tanımlı değil — site KORUMASIZ kalacak. Bunu production\'da ASLA böyle bırakma.');
}

const SESSION_COOKIE = 'mgp_session';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün
// GitHub Actions'ın X-Cron-Secret ile zaten kendi başına koruduğu uç
// noktalar — bunlar oturum çerezi OLMADAN da çağrılabilmeli (GitHub
// Actions'ın tarayıcı çerezi olamaz), kendi CRON_SECRET kontrolleri zaten
// route içinde var.
const CRON_ONLY_PATHS = new Set(['/api/notify/daily', '/api/discover/scan']);

function signSession(expiresAt) {
  const payload = String(expiresAt);
  const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return false;
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  if (sig.length !== expectedSig.length) return false;
  if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  const out = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

const LOGIN_PAGE_HTML = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Giriş — Mühendis Gelişim Portalı</title>
<style>
  html,body{margin:0;padding:0;background:#FBF1F0;color:#3D2B2E;font-family:-apple-system,'IBM Plex Sans',Helvetica,sans-serif;}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;}
  form{display:flex;flex-direction:column;gap:14px;width:280px;padding:36px 30px;background:#FFFBFA;border:1px solid #E8D3D3;border-radius:6px;}
  h1{margin:0 0 4px;font-size:18px;font-weight:500;text-align:center;}
  input{padding:12px 14px;border:1px solid #D5C5C8;border-radius:4px;font-size:14px;background:#FFFFFF;color:#3D2B2E;outline:none;letter-spacing:0.15em;text-align:center;}
  input:focus{border-color:#DB7F8E;}
  button{padding:12px 0;border:none;border-radius:4px;background:#604D53;color:#FFDBDA;font-size:13px;cursor:pointer;}
  button:hover{background:#4A3B3E;}
  #err{color:#B0554F;font-size:12.5px;text-align:center;min-height:16px;}
</style>
</head>
<body>
<form id="f">
  <h1>Mühendis Gelişim Portalı</h1>
  <input id="p" type="password" placeholder="Parola" autocomplete="current-password" autofocus />
  <button type="submit">Giriş</button>
  <div id="err"></div>
</form>
<script>
document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('p').value;
  const err = document.getElementById('err');
  err.textContent = '';
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      location.reload();
    } else if (res.status === 429) {
      err.textContent = 'Çok fazla deneme yapıldı, biraz sonra tekrar dene.';
    } else {
      err.textContent = 'Yanlış parola.';
    }
  } catch {
    err.textContent = 'Bağlantı hatası, tekrar dene.';
  }
});
</script>
</body>
</html>`;

// Basit brute-force yavaşlatması: aynı IP art arda çok denerse bir süre
// kilitleniyor. Bellek içi (Render yeniden başlayınca sıfırlanır) — tam
// bir çözüm değil ama tek satırlık bir bariyer bile otomatik parola
// denemesini pratik olmaktan çıkarır.
const loginAttempts = new Map(); // ip -> { count, lockedUntil }
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 60 * 1000;

function checkAndRecordLoginAttempt(ip, success) {
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  if (rec.lockedUntil > now) return false;
  if (success) {
    loginAttempts.delete(ip);
    return true;
  }
  rec.count += 1;
  if (rec.count >= LOGIN_MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOGIN_LOCKOUT_MS;
    rec.count = 0;
  }
  loginAttempts.set(ip, rec);
  return true;
}

const app = express();
// Render (ve çoğu PaaS) bir ters proxy arkasında çalıştırıyor — bu
// olmadan req.ip her zaman proxy'nin kendi adresini gösterir, IP başına
// giriş denemesi sınırlaması (aşağıda) işe yaramaz hale gelir.
app.set('trust proxy', 1);

// Basit güvenlik başlıkları (clickjacking/MIME sniffing) — helmet gibi
// bir bağımlılık eklemeye gerek yok, tek satırlık bir middleware yeterli.
// Auth kontrolünden ÖNCE tanımlanıyor ki giriş sayfasının kendisi de
// (özellikle X-Frame-Options — parola formunun bir iframe'e gömülüp
// tıklama kaçırma/clickjacking saldırısına açık olmaması için) bu
// başlıklarla korunsun.
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

app.use((req, res, next) => {
  if (!AUTH_CONFIGURED) {
    next();
    return;
  }
  if (req.path === '/api/login' || CRON_ONLY_PATHS.has(req.path)) {
    next();
    return;
  }
  const cookies = parseCookies(req);
  if (verifySession(cookies[SESSION_COOKIE])) {
    next();
    return;
  }
  if (req.path.startsWith('/api/')) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  res.type('html').send(LOGIN_PAGE_HTML);
});

app.post('/api/login', express.json(), (req, res) => {
  if (!AUTH_CONFIGURED) {
    res.status(503).json({ error: 'auth not configured' });
    return;
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rec = loginAttempts.get(ip);
  if (rec && rec.lockedUntil > Date.now()) {
    res.status(429).json({ error: 'too many attempts' });
    return;
  }
  const password = req.body?.password;
  const ok = typeof password === 'string' && timingSafeStringEqual(password, SITE_PASSWORD);
  checkAndRecordLoginAttempt(ip, ok);
  if (!ok) {
    res.status(401).json({ error: 'wrong password' });
    return;
  }
  const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  res.cookie(SESSION_COOKIE, signSession(expiresAt), {
    httpOnly: true,
    // NODE_ENV'e güvenmiyoruz — Render bunu her zaman 'production' olarak
    // ayarlamayabilir. Bunun yerine `trust proxy` sayesinde Express'in
    // X-Forwarded-Proto'dan doğru şekilde hesapladığı req.secure'a bakıyoruz
    // (bu istek gerçekten https üzerinden mi geldi).
    secure: req.secure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  });
  res.json({ ok: true });
});

// Çıkış yap (bkz. PLAN.md Aşama 19 madde 7) — oturum çerezi 30 gün
// süresizce hatırlanıyordu, manuel bir çıkış yolu yoktu. Bu uç nokta
// zaten oturum çerezi olan bir istekten çağrılır (auth middleware'i
// normal şekilde geçer), çerezi temizler.
app.post('/api/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
});

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

// Fotoğraf yükleme (bkz. PLAN.md Aşama 16) — Merak Konuları/Proje
// Fikirleri fotoğrafları artık localStorage'a base64 olarak gömülmüyor
// (kota dolup sessizce kaybolma riski, bkz. Aşama 15 madde 1); istemci
// önce compressImage() ile küçültüp buraya gönderiyor, biz de Cloudinary'ye
// yükleyip dönen kalıcı URL'i geri veriyoruz — localStorage'da sadece bu
// URL duruyor. API secret'ı hiçbir zaman istemciye gönderilmiyor, yükleme
// tamamen sunucu tarafında (Cloudinary Node SDK) yapılıyor.
//
// Ayrıca bir CRON_SECRET/paylaşımlı sır KONTROLÜ YOK — buna gerek yok,
// çünkü bu uç nokta artık (Aşama 17'deki site geneli oturum koruması
// sayesinde) zaten oturum çerezi olmadan hiç çağrılamıyor. Kalan tek
// koruma dosya boyutu sınırı (MAX_UPLOAD_BYTES) ve data:image/ önekinin
// doğrulanması — bunlar sır/kimlik doğrulama değil, girdi doğrulaması.
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6 MB (base64 öncesi tahmini üst sınır)

app.post('/api/upload-image', express.json({ limit: '8mb' }), async (req, res) => {
  if (!CLOUDINARY_CONFIGURED) {
    res.status(503).json({ error: 'image storage not configured' });
    return;
  }
  const dataUrl = req.body?.image;
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    res.status(400).json({ error: 'invalid image' });
    return;
  }
  if (dataUrl.length > MAX_UPLOAD_BYTES) {
    res.status(413).json({ error: 'image too large' });
    return;
  }
  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: 'muhendis-portal',
      resource_type: 'image',
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('[server] Cloudinary yükleme hatası:', err);
    res.status(502).json({ error: 'upload failed' });
  }
});

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
  if (!CRON_SECRET || !timingSafeStringEqual(req.get('X-Cron-Secret') || '', CRON_SECRET)) {
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

// Program Keşfi — Otomatik Arama (bkz. PLAN.md Aşama 11). GitHub
// Actions'taki haftalık bir workflow (bkz.
// .github/workflows/discover-programs.yml) CRON_SECRET korumalı
// /api/discover/scan uç noktasını tetikler; sunucu her anahtar kelime
// için SerpApi'de arama yapar, daha önce görülmeyen sonuçları Upstash
// Redis'e "filtrelenmedi" durumuyla kaydeder. Profil filtresi (Ollama)
// BURADA UYGULANMAZ — Aşama 12'deki gecikmeli özetleme kuyruğuyla aynı
// mantıkla, uygulama Ollama'nın erişilebilir olduğu bir cihazda
// açıldığında istemci tarafında yapılır (bkz. AppState.tsx,
// classifyProgramRelevance). Bu yüzden Telegram bildirimi de tarama
// anında değil, filtreleme tamamlanınca (mark-filtered uç noktasından)
// gönderiliyor.
const DISCOVER_KEYWORDS = [
  // 1. Hackathon'lar (resmi/kurumsal kaynaklı)
  { keyword: 'TÜBİTAK hackathon', category: 'hackathon' },
  { keyword: 'T3 Vakfı hackathon', category: 'hackathon' },
  { keyword: 'T3 AI Creathon', category: 'hackathon' },
  { keyword: 'Sanayi Bakanlığı hackathon', category: 'hackathon' },
  { keyword: 'Ulaştırma Bakanlığı hackathon', category: 'hackathon' },
  { keyword: 'kamu hackathon Türkiye', category: 'hackathon' },
  { keyword: 'üniversite hackathon mühendislik 2026', category: 'hackathon' },
  { keyword: 'Deneyap hackathon', category: 'hackathon' },
  // 2. TÜBİTAK lisans/öğrenci programları
  { keyword: 'TÜBİTAK 2209-A', category: 'tubitak' },
  { keyword: 'TÜBİTAK 2209-B', category: 'tubitak' },
  { keyword: 'TÜBİTAK STAR programı', category: 'tubitak' },
  { keyword: 'TÜBİTAK 2242', category: 'tubitak' },
  { keyword: 'TÜBİTAK lisans araştırma projesi başvuru', category: 'tubitak' },
  { keyword: 'TÜBİTAK öğrenci proje yarışması 2026/2027', category: 'tubitak' },
  // 3. Teknofest — yeni kategoriler
  { keyword: 'Teknofest yeni kategori 2027', category: 'teknofest' },
  { keyword: 'Teknofest başvuru kategorileri', category: 'teknofest' },
  { keyword: 'Teknofest kontrol otomasyon', category: 'teknofest' },
  { keyword: 'Teknofest insansız hava aracı', category: 'teknofest' },
  { keyword: 'Teknofest robot yarışması', category: 'teknofest' },
  { keyword: 'Teknofest yapay zeka yarışması', category: 'teknofest' },
  // 4. Staj/mühendislik ilanları (profil filtreli — gecikmeli kuyrukta elenir)
  { keyword: 'mekatronik mühendisliği stajyer ilanı', category: 'staj' },
  { keyword: 'gömülü sistemler stajyer 3. sınıf', category: 'staj' },
  { keyword: 'kontrol sistemleri stajyer mühendis', category: 'staj' },
  { keyword: 'elektrik elektronik mühendisliği stajyer ilanı Türkiye', category: 'staj' },
  { keyword: 'robotik/otomasyon stajyer öğrenci', category: 'staj' },
  { keyword: 'Baykar stajyer mühendis', category: 'staj' },
  { keyword: 'ASELSAN stajyer mühendis', category: 'staj' },
  { keyword: 'TÜBİTAK SAGE/BİLGEM stajyer', category: 'staj' },
];

const SERPAPI_QUOTA_BUFFER = 20; // bu kadar sorgu kalınca tarama erken durur

async function redis(...args) {
  const res = await fetch(UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Upstash hatası: ${data.error || res.status}`);
  return data.result;
}

async function redisHGetAll(key) {
  const flat = (await redis('HGETALL', key)) || [];
  const items = [];
  for (let i = 0; i < flat.length; i += 2) {
    try {
      items.push(JSON.parse(flat[i + 1]));
    } catch {
      // bozuk bir kayıt varsa atla, tüm listeyi çökertmesin
    }
  }
  return items;
}

function programId(link) {
  return createHash('sha1').update(link).digest('hex').slice(0, 16);
}

async function serpapiRemainingSearches() {
  const res = await fetch(`https://serpapi.com/account.json?api_key=${SERPAPI_KEY}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`SerpApi account.json ${res.status}`);
  const data = await res.json();
  return typeof data.total_searches_left === 'number' ? data.total_searches_left : 0;
}

async function serpapiSearch(keyword) {
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(keyword)}&num=5&hl=tr&gl=tr&api_key=${SERPAPI_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`SerpApi search.json ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.organic_results) ? data.organic_results : [];
}

app.post('/api/discover/scan', express.json(), async (req, res) => {
  if (!CRON_SECRET || !timingSafeStringEqual(req.get('X-Cron-Secret') || '', CRON_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (!DISCOVER_CONFIGURED) {
    res.status(503).json({ error: 'discovery not configured' });
    return;
  }
  let remaining;
  try {
    remaining = await serpapiRemainingSearches();
  } catch (err) {
    console.error('[server] SerpApi kota kontrolü başarısız:', err);
    res.status(502).json({ error: 'quota check failed' });
    return;
  }
  let keywordsScanned = 0;
  let newItems = 0;
  let errors = 0;
  for (const { keyword, category } of DISCOVER_KEYWORDS) {
    if (remaining <= SERPAPI_QUOTA_BUFFER) break;
    // Tek bir anahtar kelimenin veya tek bir Redis çağrısının başarısız
    // olması (ör. geçici bir ağ zaman aşımı) tüm taramayı iptal etmesin —
    // o kelimeyi/sonucu atlayıp devam et, kalan kelimeler yine de taransın.
    let results;
    try {
      results = await serpapiSearch(keyword);
      remaining -= 1;
      keywordsScanned += 1;
    } catch (err) {
      console.error(`[server] SerpApi araması başarısız (${keyword}):`, err);
      errors += 1;
      continue;
    }
    for (const r of results) {
      if (!r.link || !r.title) continue;
      try {
        const id = programId(r.link);
        const seen = await redis('SISMEMBER', 'discover:seen', id);
        if (seen) continue;
        await redis('SADD', 'discover:seen', id);
        await redis('HSET', 'discover:items', id, JSON.stringify({
          id,
          title: r.title,
          link: r.link,
          snippet: r.snippet || '',
          keyword,
          category,
          foundAt: new Date().toISOString(),
          status: 'unfiltered',
          deadline: null,
          description: null,
          dismissed: false,
        }));
        newItems += 1;
      } catch (err) {
        console.error(`[server] Upstash yazma hatası (${r.link}):`, err);
        errors += 1;
      }
    }
  }
  res.json({ ok: true, keywordsScanned, newItems, errors, deferred: keywordsScanned < DISCOVER_KEYWORDS.length });
});

app.get('/api/discover/pending', async (_req, res) => {
  if (!DISCOVER_CONFIGURED) {
    res.status(503).json({ error: 'discovery not configured' });
    return;
  }
  try {
    const items = await redisHGetAll('discover:items');
    res.json({ items: items.filter((it) => it.status === 'unfiltered') });
  } catch (err) {
    console.error('[server] Bekleyen keşif sonuçları okunamadı:', err);
    res.status(502).json({ error: 'read failed' });
  }
});

app.get('/api/discover/relevant', async (_req, res) => {
  if (!DISCOVER_CONFIGURED) {
    res.status(503).json({ error: 'discovery not configured' });
    return;
  }
  try {
    const items = await redisHGetAll('discover:items');
    // Son başvuru tarihi geçmiş sonuçlar burada elenir (bkz. PLAN.md
    // Aşama 19 madde 2) — böylece sayfa/widget her zaman güncel kalır,
    // ayrı bir temizleme işi/cron'a gerek yok. Tarihi bilinmeyen (deadline
    // null) sonuçlar süresiz gösterilmeye devam eder.
    const relevant = items
      .filter((it) => it.status === 'relevant' && !it.dismissed)
      .filter((it) => !it.deadline || daysLeftReal(it.deadline) >= 0)
      .sort((a, b) => (a.foundAt < b.foundAt ? 1 : -1));
    res.json({ items: relevant });
  } catch (err) {
    console.error('[server] Alakalı keşif sonuçları okunamadı:', err);
    res.status(502).json({ error: 'read failed' });
  }
});

const TELEGRAM_MAX_CHARS = 3500; // Telegram'ın 4096 sınırının altında güvenli bir pay

function buildDiscoveryMessages(items) {
  const itemTexts = items.map((it) => `• ${it.title}\n  ${it.description || it.snippet}\n  ${it.link}`);
  const chunks = [];
  let current = [];
  let currentLen = 0;
  for (const text of itemTexts) {
    const addedLen = text.length + 2;
    if (current.length > 0 && currentLen + addedLen > TELEGRAM_MAX_CHARS) {
      chunks.push(current);
      current = [];
      currentLen = 0;
    }
    current.push(text);
    currentLen += addedLen;
  }
  if (current.length > 0) chunks.push(current);

  return chunks.map((chunk, i) => {
    const header = chunks.length > 1
      ? `🔎 Yeni ilgili program/ilan (${i + 1}/${chunks.length}, toplam ${items.length}):`
      : `🔎 ${items.length} yeni ilgili program/ilan bulundu:`;
    return [header, '', ...chunk].join('\n\n');
  });
}

app.post('/api/discover/mark-filtered', express.json({ limit: '1mb' }), async (req, res) => {
  if (!DISCOVER_CONFIGURED) {
    res.status(503).json({ error: 'discovery not configured' });
    return;
  }
  const results = Array.isArray(req.body?.results) ? req.body.results : [];
  if (results.length === 0) {
    res.json({ ok: true, marked: 0, notified: 0 });
    return;
  }
  try {
    const toNotify = [];
    for (const { id, relevant, deadline, description } of results) {
      if (typeof id !== 'string') continue;
      const raw = await redis('HGET', 'discover:items', id);
      if (!raw) continue;
      const item = JSON.parse(raw);
      if (item.status !== 'unfiltered') continue; // zaten işlenmiş, tekrar bildirim gitmesin
      item.status = relevant ? 'relevant' : 'rejected';
      item.filteredAt = new Date().toISOString();
      item.deadline = typeof deadline === 'string' ? deadline : null;
      item.description = typeof description === 'string' ? description : null;
      await redis('HSET', 'discover:items', id, JSON.stringify(item));
      if (relevant) toNotify.push(item);
    }
    if (toNotify.length > 0 && TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      // Telegram mesaj başına ~4096 karaktere izin veriyor — normal
      // koşulda (haftada birkaç yeni sonuç) tek mesaja rahatça sığar, ama
      // büyük bir ilk yükleme/birikmiş kuyruk durumunda tek mesaj bu
      // sınırı aşıp Telegram API'sinden 400 hatası alabilir (gerçek testte
      // 113 sonuçla başımıza geldi). Bu yüzden gerektiğinde birkaç mesaja
      // bölünüyor — yine de "her sonuç ayrı mesaj" spam'inden kaçınılıyor,
      // sadece limити aşan büyük bir toplu bildirim birkaç parçaya ayrılıyor.
      for (const message of buildDiscoveryMessages(toNotify)) {
        try {
          await sendTelegramMessage(message);
        } catch (err) {
          console.error('[server] Program Keşfi Telegram bildirimi gönderilemedi:', err);
        }
      }
    }
    res.json({ ok: true, marked: results.length, notified: toNotify.length });
  } catch (err) {
    console.error('[server] Filtreleme sonuçları işlenemedi:', err);
    res.status(502).json({ error: 'mark failed' });
  }
});

app.post('/api/discover/dismiss', express.json(), async (req, res) => {
  if (!DISCOVER_CONFIGURED) {
    res.status(503).json({ error: 'discovery not configured' });
    return;
  }
  const id = req.body?.id;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'invalid id' });
    return;
  }
  try {
    const raw = await redis('HGET', 'discover:items', id);
    if (raw) {
      const item = JSON.parse(raw);
      item.dismissed = true;
      await redis('HSET', 'discover:items', id, JSON.stringify(item));
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[server] Keşif sonucu gizlenemedi:', err);
    res.status(502).json({ error: 'dismiss failed' });
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
