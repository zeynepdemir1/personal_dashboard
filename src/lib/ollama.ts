// Ollama'nın yerel HTTP API'sine (varsayılan http://localhost:11434)
// erişim. Google Calendar entegrasyonuyla aynı sebeple (CORS) doğrudan
// değil, bir proxy üzerinden gidiyoruz — geliştirmede Vite dev-proxy
// (bkz. vite.config.ts, /api/ollama), production'da server.js (bkz.
// PLAN.md Aşama 13). Production'da bu proxy KASITLI olarak yok — Ollama
// yalnızca Zeynep'in kendi bilgisayarında çalıştığı için bu özellik
// doğası gereği hep yerel kalacak; production'daki istekler server.js'in
// /api/* için döndürdüğü gerçek 404'e düşer, aşağıdaki kontrol bunu
// düzgün şekilde "bağlı değil" olarak yorumlar (hata fırlatmaz).
import { useEffect, useState } from 'react';

const BASE = '/api/ollama';
const MODEL = 'llama3.1:8b';

export interface OllamaStatus {
  connected: boolean;
  label: string;
}

const DISCONNECTED_LABEL = 'Yerel AI şu an kullanılamıyor';
const CONNECTED_LABEL = 'Yerel AI çalışıyor';

// Sadece res.ok'a değil, yanıtın gerçekten Ollama'nın /api/tags şekline
// (bir `models` dizisi) sahip olmasına da bakıyoruz — production'da
// server.js'in /api/* için 404 dönmesi gerekiyor ama bir gün SPA
// fallback'ine yanlışlıkla düşerse (200 + index.html) bu kontrol onu da
// yakalar; sadece res.ok kullansaydık "bağlı" sanabilirdik.
export async function pingOllama(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return !!data && Array.isArray(data.models);
  } catch {
    return false;
  }
}

// Sidebar'daki durum göstergesi bu hook'u kullanıyor — bağlantıyı sayfa
// açılışında ve ardından periyodik olarak (30 sn) yoklar, böylece Ollama
// sayfa açıkken başlatılsa/durdurulsa bile durum kendiliğinden güncellenir.
export function useOllamaStatus(): OllamaStatus {
  const [status, setStatus] = useState<OllamaStatus>({ connected: false, label: DISCONNECTED_LABEL });

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      pingOllama().then((ok) => {
        if (cancelled) return;
        setStatus(ok ? { connected: true, label: CONNECTED_LABEL } : { connected: false, label: DISCONNECTED_LABEL });
      });
    };
    check();
    const interval = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}

function stripQuotes(s: string): string {
  return s.replace(/^["'“”]+|["'“”]+$/g, '').trim();
}

// llama3.1:8b talimatı çoğu zaman izliyor ama bazen "Bu, ... günlüğünün
// bir özetidir" gibi ekstra bir meta-yorum cümlesi ekliyor. Tek cümle
// istendiği için bu güvenlik ağı ilk cümleden sonrasını atıyor.
function firstSentenceOnly(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : text).trim();
}

// "Bir Şey Öğrendim" girişi kaydedildiğinde arka planda çağrılır (bkz.
// AppState.tsx saveLearnEntry). Başarısız olursa (Ollama kapalı, zaman
// aşımı vb.) sessizce null döner — giriş özet olmadan kalır, kullanıcıya
// hata gösterilmez (PLAN.md Aşama 10: işlem detayları arka planda kalsın).
export async function summarizeLearnEntry(title: string, body: string): Promise<string | null> {
  const system =
    'Sen bir mühendislik öğrencisinin kişisel gelişim günlüğünü özetleyen bir asistansın. ' +
    'Katı kurallar: (1) Yanıtın SADECE TEK bir Türkçe cümle olacak. (2) Birinci ağızdan (ben dili) yaz. ' +
    '(3) Başlığı tekrar etme. (4) "Bu bir özettir", "Bu giriş ... anlatıyor", "Bu girdi ..." gibi ' +
    'META-YORUM veya açıklama EKLEME — doğrudan olayın kendisini özetle. (5) Tırnak işareti kullanma. ' +
    '(6) Yanıt olarak SADECE özet cümlesini döndür, başka hiçbir şey yazma.';
  const prompt = `Başlık: ${title}\n\nMetin:\n${body}`;

  try {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, system, prompt, stream: false }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = typeof data.response === 'string' ? data.response.trim() : '';
    if (!raw) return null;
    return firstSentenceOnly(stripQuotes(raw)) || null;
  } catch {
    return null;
  }
}
