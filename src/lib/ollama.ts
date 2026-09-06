// Ollama'nın yerel HTTP API'sine (varsayılan http://localhost:11434)
// erişim. Google Calendar entegrasyonuyla aynı sebeple (CORS) doğrudan
// değil, Vite'ın geliştirme sunucusu proxy'si üzerinden gidiyoruz
// (bkz. vite.config.ts, /api/ollama) — bu sayede OLLAMA_ORIGINS ayarı
// gerekmiyor. NOT: Ollama zaten yalnızca bu bilgisayarda çalıştığı için
// bu özellik doğası gereği hep yerel kalacak (bkz. PLAN.md Aşama 12).
import { useEffect, useState } from 'react';

const BASE = '/api/ollama';
const MODEL = 'llama3.1:8b';

export interface OllamaStatus {
  connected: boolean;
  label: string;
}

async function pingOllama(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Sidebar'daki durum göstergesi bu hook'u kullanıyor — bağlantıyı sayfa
// açılışında ve ardından periyodik olarak (30 sn) yoklar, böylece Ollama
// sayfa açıkken başlatılsa/durdurulsa bile durum kendiliğinden güncellenir.
export function useOllamaStatus(): OllamaStatus {
  const [status, setStatus] = useState<OllamaStatus>({ connected: false, label: 'Yerel model bağlı değil' });

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      pingOllama().then((ok) => {
        if (cancelled) return;
        setStatus(ok ? { connected: true, label: 'Yerel model çalışıyor' } : { connected: false, label: 'Yerel model bağlı değil' });
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
