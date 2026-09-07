// Program Keşfi (PLAN.md Aşama 11) istemci tarafı yardımcıları. Sunucudaki
// /api/discover/* uç noktalarıyla konuşur — Upstash Redis kimlik bilgileri
// hiçbir zaman istemciye ulaşmaz. Bu uç noktalar tanımlı değilse (Cloudinary
// gibi) sessizce boş sonuç döner, uygulamayı çökertmez.
export interface DiscoveredProgram {
  id: string;
  title: string;
  link: string;
  snippet: string;
  keyword: string;
  category: string;
  foundAt: string;
}

export async function fetchPendingPrograms(): Promise<DiscoveredProgram[]> {
  try {
    const res = await fetch('/api/discover/pending');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function fetchRelevantPrograms(): Promise<DiscoveredProgram[]> {
  try {
    const res = await fetch('/api/discover/relevant');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function markFilteredPrograms(results: { id: string; relevant: boolean }[]): Promise<void> {
  if (results.length === 0) return;
  try {
    await fetch('/api/discover/mark-filtered', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results }),
    });
  } catch {
    // sessizce vazgeç — sonuçlar `filtrelenmedi` durumunda kalır, bir
    // sonraki açılışta tekrar denenir
  }
}

export async function dismissProgram(id: string): Promise<void> {
  try {
    await fetch('/api/discover/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch {
    // sessizce vazgeç
  }
}
