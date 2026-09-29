import { useEffect, useState } from 'react';

// Ollama'nın yerel HTTP API'sine (varsayılan http://localhost:11434)
// erişim.
//
// PLAN.md Aşama 25 madde 5 — kök neden bulundu ve düzeltildi: yerel
// geliştirmede (`npm run dev`) Vite'ın kendi proxy'si (vite.config.ts,
// /api/ollama) üzerinden gidiliyordu; ESKİDEN production'da da AYNI
// göreli `/api/ollama` yolu kullanılıyordu — ama server.js bu yolu
// KASITLI 404'lüyor (Ollama Render'ın sunucusundan hiç görünmüyor,
// sadece Zeynep'in kendi bilgisayarından). Sonuç: Zeynep GERÇEK siteyi
// (zdemir.tech) Ollama'nın çalıştığı bilgisayardan açsa bile, tarayıcı
// isteği zdemir.tech'in kendi sunucusuna (Render) gidiyordu, hiçbir
// zaman tarayıcının kendi makinesindeki Ollama'ya ulaşmıyordu — bu
// davranış Aşama 13'ten beri hep böyleydi (Aşama 20'nin bir regresyonu
// DEĞİL, ama gerçek kök neden buydu).
//
// Düzeltme: production build'de tarayıcı artık Render üzerinden değil,
// DOĞRUDAN localhost'a istek atıyor (Zeynep'in kendi bilgisayarında).
// HTTPS bir sayfadan http://localhost'a istek atmak tarayıcılarda mixed-
// content olarak engellenmiyor (localhost için özel bir istisna var).
//
// PLAN.md Aşama 26 ek düzeltme: Ollama'ya (port 11434) DOĞRUDAN gitmek
// yetmedi — Chrome'un "Private Network Access" kısıtlaması, genel/HTTPS
// bir origin'den (zdemir.tech) özel bir adrese (localhost) giden istekte
// hedefin `Access-Control-Allow-Private-Network: true` header'ıyla cevap
// vermesini şart koşuyor. Ollama bu header'ı hiç göndermiyor (bilinen,
// henüz çözülmemiş bir Ollama eksiği — ollama/ollama#7000), OLLAMA_ORIGINS
// bunu çözmüyor. Bu yüzden istek artık Ollama'nın ÖNÜNE konan küçük bir
// yerel röleye (bkz. ollama-relay.js, proje kökünde) gidiyor — o script
// doğru header'ları ekleyip isteği gerçek Ollama'ya yönlendiriyor. Zeynep'in
// bu röleyi Ollama'yla birlikte çalıştırması gerekiyor (bkz. README).
const BASE = import.meta.env.DEV ? '/api/ollama' : 'http://localhost:11435';
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

// Program Keşfi (PLAN.md Aşama 11) için profil filtresi. GitHub Actions'ta
// tarama sırasında UYGULANMIYOR — sadece burada, uygulama Ollama'nın
// erişilebilir olduğu bir cihazda açıldığında (bkz. AppState.tsx'teki
// gecikmeli kuyruk, Aşama 12'deki desenin aynısı) çağrılıyor. Başarısız
// olursa (Ollama kapalı, zaman aşımı, belirsiz yanıt) null döner — sonuç
// `filtrelenmedi` durumunda kalır, bir sonraki açılışta tekrar denenir.
const PROFILE_DESCRIPTION =
  'Mekatronik Mühendisliği öğrencisi, Marmara Üniversitesi. İlgi alanları: ' +
  'gömülü sistemler, kontrol sistemleri, OpenCV, TensorFlow Lite, Linux, İHA/drone.';

export interface ProgramAnalysis {
  relevant: boolean;
  // DD.MM.YYYY veya null (metinde açık bir son başvuru/tarih bulunamadıysa)
  deadline: string | null;
  // Ollama'nın ürettiği kısa (1 cümle) açıklama — SerpApi'nin ham snippet'i
  // bazen boş/URL parçası/yarım cümle olabildiği için (bkz. PLAN.md Aşama
  // 19 madde 2), zaten her sonuç için bir Ollama çağrısı yapılıyorken aynı
  // yanıttan üretilen bu açıklama gösterimde kullanılıyor.
  description: string | null;
}

// Aynı Ollama çağrısında üç şeyi birden çıkarıyoruz (profil alakası +
// son başvuru tarihi + kısa açıklama) — üç ayrı istek atmak yerine tek
// istek, hem daha hızlı hem de gecikmeli kuyruğun (Aşama 12/17) toplam
// süresini üçe katlamıyor.
export async function analyzeDiscoveredProgram(title: string, snippet: string): Promise<ProgramAnalysis | null> {
  const system =
    `Sen bir öğrencinin profiline göre bulunan program/ilan sonuçlarını değerlendiren bir ` +
    `asistansın. Profil: ${PROFILE_DESCRIPTION}\n\n` +
    'Yanıtın TAM OLARAK 3 satır olacak. HİÇBİR satıra numara, etiket veya "satır" kelimesi ' +
    'ekleme — sadece istenen değerin kendisini yaz.\n\n' +
    'Örnek yanıt formatı (bunu kelimesi kelimesine kopyalama, sadece formatı örnek al):\n' +
    'EVET\n18.11.2025\nÜniversite öğrencilerine yönelik bir araştırma projesi destek programı.\n\n' +
    'Kurallar:\n' +
    '- 1. değer: SADECE "EVET" veya "HAYIR". Genel mühendislik/TÜBİTAK/Teknofest/hackathon ' +
    'programları EVET; maden, inşaat, kimya, tekstil gibi tamamen alakasız dallar HAYIR.\n' +
    '- 2. değer: Metinde açık bir son başvuru/son tarih varsa GG.AA.YYYY formatında SAYILARLA ' +
    'yaz (ay adı değil, sayı — örn. Kasım değil 11). Tarih yoksa SADECE "YOK" yaz.\n' +
    '- 3. değer: Bu program/ilanın ne olduğunu özetleyen TEK bir doğal Türkçe cümle.';
  const prompt = `Başlık: ${title}\nAçıklama: ${snippet}`;

  try {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, system, prompt, stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = typeof data.response === 'string' ? data.response.trim() : '';
    if (!raw) return null;
    const lines = raw.split('\n').map((l: string) => l.trim()).filter(Boolean);
    if (lines.length < 3) return null;

    const relevanceLine = lines[0].toUpperCase();
    let relevant: boolean;
    if (relevanceLine.startsWith('EVET')) relevant = true;
    else if (relevanceLine.startsWith('HAYIR')) relevant = false;
    else return null;

    const deadlineLine = lines[1];
    const dateMatch = deadlineLine.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    const deadline = dateMatch ? `${dateMatch[1].padStart(2, '0')}.${dateMatch[2].padStart(2, '0')}.${dateMatch[3]}` : null;

    const description = firstSentenceOnly(stripQuotes(lines.slice(2).join(' '))) || null;

    return { relevant, deadline, description };
  } catch {
    return null;
  }
}
