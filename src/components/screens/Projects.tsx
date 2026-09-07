import { useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { compressImage } from '../../lib/image';
import { uploadImage } from '../../lib/upload';
import { buildProjectViews, PROJECT_STATE_OPTIONS } from '../../lib/projects';

export function Projects() {
  const app = useApp();
  const narrow = app.width < 1180;
  const views = buildProjectViews(app.extraProjects, app.projectOverrides);

  if (app.entry !== null) {
    const activeIndex = Math.min(app.entry, views.length - 1);
    const view = views[activeIndex];
    if (view) return <ProjectDetail view={view} />;
  }

  const listGrid: CSSProperties = narrow
    ? { display: 'flex', flexDirection: 'column', gap: 6, padding: '18px 6px', borderBottom: '1px solid #F1E4E4' }
    : { display: 'grid', gridTemplateColumns: '110px minmax(0, 1fr) 140px', gap: 20, padding: '20px 6px', borderBottom: '1px solid #F1E4E4', alignItems: 'baseline' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Yapılacak Projeler
        </h1>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.border}` }}>
        {views.map((p, i) => (
          <div key={p.key} onClick={() => app.navigate('projects', i)} className="hover-row-alt" style={{ ...listGrid, cursor: 'pointer' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.stateColor }}>{p.state}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
              <span style={{ fontFamily: fonts.serif, fontSize: 19, color: colors.ink }}>{p.title}</span>
              <span style={{ fontSize: 13, lineHeight: 1.6, color: colors.inkSoft }}>{p.note}</span>
            </div>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint, textAlign: 'right' }}>{p.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDetail({ view }: { view: ReturnType<typeof buildProjectViews>[number] }) {
  const app = useApp();
  const [qNote, setQNote] = useState(view.note);
  const [qTask, setQTask] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const key = view.key;

  const handlePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);
    try {
      const url = await uploadImage(await compressImage(file));
      app.setProjectImage(key, url);
    } catch {
      setPhotoError('Fotoğraf yüklenemedi, tekrar dene.');
    }
  };

  const chipStyle = (active: boolean, color: string): CSSProperties => ({
    padding: '6px 12px',
    borderRadius: 20,
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    border: `1px solid ${active ? color : colors.borderStrong}`,
    background: active ? color : 'transparent',
    color: active ? colors.chipBg : colors.inkSoft,
  });

  const inputStyle: CSSProperties = {
    padding: '10px 12px',
    border: `1px solid ${colors.borderStrong}`,
    background: colors.panel,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    outline: 'none',
    borderRadius: 3,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30, maxWidth: '68ch' }}>
      <div>
        <span onClick={() => app.navigate('projects')} className="hover-underline" style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer' }}>
          ← projelere dön
        </span>
      </div>

      <header style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 34, fontWeight: 400, letterSpacing: '-0.015em', color: colors.ink }}>
          {view.title}
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PROJECT_STATE_OPTIONS.map((opt) => (
            <span key={opt.label} onClick={() => app.setProjectState(key, opt.label, opt.color)} style={chipStyle(view.state === opt.label, opt.color)}>
              {opt.label}
            </span>
          ))}
        </div>
      </header>

      {view.image && (
        <img src={view.image} alt={view.title} style={{ width: '100%', maxWidth: 420, borderRadius: 4, border: `1px solid ${colors.border}` }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
        <span onClick={() => fileRef.current?.click()} className="hover-underline" style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer' }}>
          {view.image ? 'fotoğrafı değiştir' : '+ fotoğraf ekle'}
        </span>
        {photoError && <span style={{ fontSize: 11, color: '#B0554F' }}>{photoError}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.inkFaint }}>Not</div>
        <textarea
          value={qNote}
          onChange={(e) => setQNote(e.target.value)}
          onBlur={() => app.setProjectNote(key, qNote)}
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: fonts.serif, fontSize: 15.5, lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.inkFaint }}>
          Checklist
        </div>
        {view.checklist.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              onClick={() => app.toggleProjectChecklistItem(key, c.id)}
              style={{
                width: 15,
                height: 15,
                flex: '0 0 15px',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                cursor: 'pointer',
                background: c.done ? colors.inkSoft : undefined,
                color: c.done ? colors.chipBg : undefined,
                border: c.done ? `1px solid ${colors.inkSoft}` : `1px solid ${colors.placeholderText}`,
              }}
            >
              {c.done ? '✓' : ''}
            </span>
            <span style={{ flex: 1, fontSize: 14, color: c.done ? colors.inkFaint : colors.ink, textDecoration: c.done ? 'line-through' : 'none' }}>
              {c.text}
            </span>
            <span onClick={() => app.removeProjectChecklistItem(key, c.id)} className="text-hover-red" style={{ fontSize: 11, color: colors.placeholderText, cursor: 'pointer' }}>
              kaldır
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <input
            value={qTask}
            onChange={(e) => setQTask(e.target.value)}
            placeholder="Yeni alt görev…"
            style={{ ...inputStyle, flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                app.addProjectChecklistItem(key, qTask);
                setQTask('');
              }
            }}
          />
          <div
            onClick={() => {
              app.addProjectChecklistItem(key, qTask);
              setQTask('');
            }}
            className="btn-dark"
            style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 3, whiteSpace: 'nowrap' }}
          >
            Ekle
          </div>
        </div>
      </div>
    </div>
  );
}
