// PLAN.md Aşama 26 madde (Ollama Private Network Access): tarayıcı,
// zdemir.tech (genel/HTTPS bir origin) üzerinden Ollama'ya (localhost,
// yani "özel ağ" adres uzayı) doğrudan bağlanmaya çalıştığında, Chrome
// (ve türevleri — Brave dahil) önce bir "private network" preflight
// isteği atıyor ve hedefin `Access-Control-Allow-Private-Network: true`
// header'ıyla cevap vermesini şart koşuyor. Ollama'nın kendisi bu
// header'ı HİÇ göndermiyor (bilinen, henüz çözülmemiş bir Ollama eksiği
// — bkz. https://github.com/ollama/ollama/issues/7000) — bu yüzden
// OLLAMA_ORIGINS ayarı ne kadar doğru olursa olsun istek Ollama'ya hiç
// ULAŞAMADAN tarayıcı tarafında bloklanıyor.
//
// Bu script Ollama'nın ÖNÜNE, aynı bilgisayarda çalışan, gerekli
// header'ları ekleyen küçük bir yerel yönlendirici (relay) koyuyor:
// tarayıcı → bu script (CORS + Private-Network header'larını ekler) →
// gerçek Ollama (localhost:11434). Ollama'nın kendisi ya da uygulamanın
// geri kalanı hiç değişmiyor — sadece tarayıcı ile Ollama arasına
// giriyor. Bağımlılıksız (sadece Node'un kendi `http` modülü).
//
// Çalıştırma: `node ollama-relay.js` — Ollama zaten çalışıyor olmalı.
// Sürekli çalışması gerekiyor (Ollama gibi) — otomatik başlatmak için
// aşağıdaki systemd servis örneğine bakın (README'de de var).
import http from 'node:http';

const RELAY_PORT = Number(process.env.OLLAMA_RELAY_PORT) || 11435;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const ALLOWED_ORIGIN = process.env.RELAY_ALLOWED_ORIGIN || 'https://zdemir.tech';

const ollamaTarget = new URL(OLLAMA_URL);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  // Sadece izin verilen origin'e (varsayılan: zdemir.tech) yansıt —
  // rastgele bir origin'e * ile açmak yerine somut bir allowlist.
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '3600');
}

const server = http.createServer((req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const proxyReq = http.request(
    {
      hostname: ollamaTarget.hostname,
      port: ollamaTarget.port,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: ollamaTarget.host },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    console.error('[ollama-relay] Ollama\'ya bağlanılamadı:', err.message);
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ollama unreachable' }));
  });

  req.pipe(proxyReq);
});

// Sadece bu bilgisayardan erişilebilir olsun diye 127.0.0.1'e bağlanıyor
// (0.0.0.0 değil) — yerel ağdaki başka cihazlar bu rölenin varlığını
// hiç görmemeli.
server.listen(RELAY_PORT, '127.0.0.1', () => {
  console.log(`[ollama-relay] http://127.0.0.1:${RELAY_PORT} -> ${OLLAMA_URL} (izin verilen origin: ${ALLOWED_ORIGIN})`);
});
