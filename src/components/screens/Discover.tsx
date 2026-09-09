import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import type { DiscoveredProgram } from '../../lib/discover';

const CATEGORY_LABELS: Record<string, string> = {
  hackathon: "Hackathon'lar",
  tubitak: 'TÜBİTAK Programları',
  teknofest: 'Teknofest Kategorileri',
  staj: 'Staj İlanları',
};

const CATEGORY_ORDER = ['hackathon', 'tubitak', 'teknofest', 'staj'];

export function Discover() {
  const app = useApp();
  const narrow = app.width < 1180;

  const groups = new Map<string, DiscoveredProgram[]>();
  for (const p of app.discoveredPrograms) {
    const list = groups.get(p.category) ?? [];
    list.push(p);
    groups.set(p.category, list);
  }
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => groups.has(c)),
    ...[...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Keşfedilen Programlar
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.6, color: colors.inkSoft, maxWidth: '60ch' }}>
          Haftalık otomatik taramanın (SerpApi) bulup profilinle alakalı bulduğu sonuçlar —
          son başvuru tarihi geçmiş olanlar burada otomatik olarak kalkar.
        </p>
      </header>

      {app.discoveredPrograms.length === 0 && (
        <div style={{ fontSize: 13.5, color: colors.inkFaint, fontStyle: 'italic' }}>
          Henüz yeni bir şey bulunamadı — periyodik tarama ve yerel modelin profil filtresi
          tamamlanınca burada listelenecek.
        </div>
      )}

      {orderedCategories.map((category) => {
        const items = groups.get(category) ?? [];
        return (
          <section key={category} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, paddingBottom: 10, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 20, fontWeight: 500, color: colors.ink }}>
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint }}>{items.length}</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: narrow ? '1fr' : 'repeat(2, 1fr)',
                gap: 1,
                background: colors.borderStrong,
                border: `1px solid ${colors.borderStrong}`,
              }}
            >
              {items.map((p) => (
                <DiscoverCard key={p.id} program={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DiscoverCard({ program }: { program: DiscoveredProgram }) {
  const app = useApp();
  const href = program.link.startsWith('http') ? program.link : `https://${program.link}`;

  return (
    <div style={{ background: colors.panel, padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: fonts.serif, fontSize: 17, lineHeight: 1.35 }}>
          {program.title}
        </a>
        {program.deadline && (
          <span style={{ fontFamily: fonts.sans, fontSize: 10, color: colors.rose, whiteSpace: 'nowrap' }}>{program.deadline}</span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: colors.inkSoft }}>
        {program.description || program.snippet}
      </p>
      <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
        <span
          onClick={() => app.followDiscoveredProgram(program)}
          className="text-hover-rose"
          style={{ fontSize: 11.5, color: colors.rose, cursor: 'pointer' }}
        >
          + Takip et
        </span>
        <span
          onClick={() => app.dismissDiscoveredProgram(program.id)}
          className="text-hover-red"
          style={{ fontSize: 11.5, color: colors.placeholderText, cursor: 'pointer' }}
        >
          gizle
        </span>
      </div>
    </div>
  );
}
