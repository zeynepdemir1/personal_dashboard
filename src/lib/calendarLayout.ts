// Haftalık takvimde bir günde çakışan etkinlikleri (kaynağı ne olursa
// olsun — yerel not, ana takvim, Dersler takvimi, ...) Google Calendar'ın
// yaptığı gibi kümelere ayırıp sütunlara dizen genel algoritma (bkz.
// PLAN.md Aşama 32). Aşama 9'daki eski mantık sadece "yerel not + tek bir
// Google etkinliği" ikilisini 48/48 bölüyordu — ne ikiden fazla çakışmayı
// ne de AYNI kaynaktan gelen (ör. iki Dersler etkinliği) çakışmayı
// destekliyordu; bu da iki ders üst üste binince okunamaz hale geliyordu.
//
// Algoritma: zamana göre sıralı etkinlikleri gez, her etkinliği (varsa)
// önceki etkinliği bitmiş olan bir sütuna yerleştir, yoksa yeni bir sütun
// aç. O ana kadarki en uzak bitiş zamanından SONRA başlayan bir etkinlikle
// karşılaşınca mevcut "küme" kapanır (kümedeki herkese sütun sayısını
// uygula) ve yeni bir küme başlar. Bu, zincirleme çakışmaları (A-B, B-C
// çakışıyor ama A-C çakışmıyor) da doğru şekilde tek kümede toplar — tam
// olarak Google Calendar'ın kullandığı yöntem.
export interface TimeRange {
  s: number;
  e: number;
}

export function layoutOverlappingEvents<T extends TimeRange>(events: T[]): (T & { columnIndex: number; columnCount: number })[] {
  if (events.length === 0) return [];

  const indexed = events.map((ev, i) => ({ ev, i }));
  indexed.sort((a, b) => a.ev.s - b.ev.s || a.ev.e - b.ev.e);

  type Entry = { ev: T; i: number };
  let columns: Entry[][] = [];
  let groupEnd = -Infinity;
  const placed: { entry: Entry; columnIndex: number; columnCount: number }[] = [];

  function flushGroup() {
    if (columns.length === 0) return;
    const columnCount = columns.length;
    columns.forEach((col, columnIndex) => {
      for (const entry of col) {
        placed.push({ entry, columnIndex, columnCount });
      }
    });
    columns = [];
  }

  for (const entry of indexed) {
    if (columns.length > 0 && entry.ev.s >= groupEnd) {
      flushGroup();
      groupEnd = -Infinity;
    }
    let addedTo = -1;
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      if (col[col.length - 1].ev.e <= entry.ev.s) {
        col.push(entry);
        addedTo = c;
        break;
      }
    }
    if (addedTo === -1) columns.push([entry]);
    groupEnd = Math.max(groupEnd, entry.ev.e);
  }
  flushGroup();

  placed.sort((a, b) => a.entry.i - b.entry.i);
  return placed.map(({ entry, columnIndex, columnCount }) => ({ ...entry.ev, columnIndex, columnCount }));
}
