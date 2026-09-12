// "Bir Şey Öğrendim" kayıtlarını tek bir modele indirger: statik tasarım
// verisindeki 6 kayıttan sadece 2'sinin tam metni vardı (ARTICLES), geri
// kalanı yalnızca liste önizlemesinde (ENTRIES) görünüyordu. Burada, aynı
// başlığa sahip Akademik Gelişim notunun (varsa) gövde metnini kullanarak
// hepsini gerçekten açılabilir kayıtlara çeviriyoruz — uydurma içerik yok,
// halihazırda tasarımda var olan metinler yeniden kullanılıyor.
import { ARTICLES, ENTRIES, MONTHS, TODAY } from './data';
import type { Screen } from './types';

export interface LearnEntry {
  id: string;
  date: string;
  len: string;
  title: string;
  teaser: string;
  stamp: string;
  summary?: string;
  body: string[];
  // PLAN.md Aşama 24: kullanıcının kendi eklediği girişler artık zengin
  // metin (kalın/italik/liste + gömülü resim) destekliyor — bu HTML,
  // Learn.tsx'te dangerouslySetInnerHTML ile gösteriliyor. Sadece
  // KULLANICININ KENDİ contentEditable girişinden geliyor (execCommand
  // ile üretiliyor, paste düz metne indirgeniyor — bkz. Learn.tsx), bu
  // yüzden script/olay işleyicisi riski yok. Seed/tasarım girişlerinde
  // yok — onlar hâlâ `body` dizisiyle (düz paragraf) gösteriliyor.
  bodyHtml?: string;
  code?: string;
  body2?: string[];
  tags: string[];
  rel: string;
  relScreen: Screen;
}

function findGrowthNote(title: string) {
  for (const m of MONTHS) {
    const note = m.notes.find((n) => n.title === title);
    if (note) return { note, month: m };
  }
  return null;
}

function relScreenFor(relText: string): Screen {
  return relText.includes('Araştırılacak Konular') ? 'topics' : 'growth';
}

function buildSeedLearnEntries(): LearnEntry[] {
  return ENTRIES.map((e, i) => {
    const article = ARTICLES[i];
    const match = findGrowthNote(e.title);

    if (article) {
      return {
        id: `seed-${i}`,
        date: e.date,
        len: e.len,
        title: e.title,
        teaser: e.teaser,
        stamp: article.stamp,
        summary: article.summary,
        body: article.body,
        code: article.code,
        body2: article.body2,
        tags: article.tags,
        rel: article.rel,
        relScreen: relScreenFor(article.rel),
      };
    }

    const monthLabel = match?.month.name ?? '';
    return {
      id: `seed-${i}`,
      date: e.date,
      len: e.len,
      title: e.title,
      teaser: e.teaser,
      stamp: `${e.date} · ${e.len} okuma`,
      summary: match ? match.note.body : e.teaser,
      body: [e.teaser],
      tags: match ? match.month.tags : [],
      rel: `Bağlantılı: Akademik Gelişim · ${monthLabel}`,
      relScreen: 'growth',
    };
  });
}

export const SEED_LEARN_ENTRIES: LearnEntry[] = buildSeedLearnEntries();

// Araştırılacak Konular listesindeki bazı kayıtlar, tasarımın kendi
// metninde (ör. ARTICLES[0].rel: "...Araştırılacak Konular · 'anti-windup
// yöntemleri'") açıkça bir Bir Şey Öğrendim girişine bağlanıyor. TOPICS
// verisindeki her "giriş yazıldı" etiketinin arkasında gerçek bir giriş
// yok (kaynak tasarımın kendi tutarsızlığı) — burada yalnızca gerçekten
// karşılığı olan eşlemeler var.
const TOPIC_TO_LEARN_TITLE: Record<string, string> = {
  'Anti-windup yöntemleri: clamping mi back-calculation mı?': 'Integral windup’ı motor sürücüde yakaladım',
  'Neden Hann penceresi, neden Hamming değil': 'Pencereleme neden gerekiyor',
};

export function findLearnEntryIndexForTopic(topicTitle: string, learnEntries: LearnEntry[]): number {
  const mappedTitle = TOPIC_TO_LEARN_TITLE[topicTitle];
  if (!mappedTitle) return -1;
  return learnEntries.findIndex((e) => e.title === mappedTitle);
}

// Zengin metin içeriğinden (HTML) düz metin çıkarır — kelime sayısı/okuma
// süresi tahmini, teaser ve Ollama özetleme girdisi için (Ollama'ya HTML
// etiketleriyle karışık bir metin göndermek yanlış kelime sayımına ve
// gürültülü özetlere yol açardı). Blok elemanlarının (div/p/li/br)
// aralarına gerçek satır sonu koyuyoruz — contentEditable'ın ürettiği
// `<div>satır</div><div>satır</div>` yapısı aksi halde tek bir bitişik
// metne dönüşürdü.
export function stripHtml(html: string): string {
  const withBreaks = html.replace(/<\/(div|p|li)>/gi, '$&\n').replace(/<br\s*\/?>/gi, '\n');
  const el = document.createElement('div');
  el.innerHTML = withBreaks;
  return (el.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

export function makeLearnEntry(title: string, bodyHtml: string): LearnEntry {
  const plainText = stripHtml(bodyHtml);
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  const paragraphs = plainText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const body = paragraphs.length ? paragraphs : [plainText];
  const teaser = body[0].length > 200 ? `${body[0].slice(0, 197)}…` : body[0];

  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: TODAY,
    len: `${minutes} dk`,
    title,
    teaser,
    stamp: `${TODAY} · ${minutes} dk okuma`,
    // Yerel model özeti yok — Ollama entegrasyonu (bkz. PLAN.md Aşama 10)
    // gerçek bir özet üretene kadar bu alan boş kalıyor; body[0]'ı "özet"
    // diye tekrar göstermek yanıltıcı olurdu.
    body,
    bodyHtml,
    tags: [],
    rel: `Bağlantılı: Akademik Gelişim · ${MONTHS[0]?.name.split(' ')[0] ?? ''}`,
    relScreen: 'growth',
  };
}
