import { useState, type CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  border: `1px solid ${colors.borderStrong}`,
  background: colors.panel,
  fontFamily: fonts.serif,
  color: colors.ink,
  outline: 'none',
  borderRadius: 3,
};

export function Poems() {
  const app = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qTitle, setQTitle] = useState('');
  const [qText, setQText] = useState('');

  const startAdd = () => {
    setQTitle('');
    setQText('');
    setEditingId(null);
    setAdding(true);
  };
  const startEdit = (id: string, title: string, text: string) => {
    setQTitle(title);
    setQText(text);
    setEditingId(id);
    setAdding(true);
  };
  const cancel = () => {
    setAdding(false);
    setEditingId(null);
  };
  const save = () => {
    if (editingId) app.updatePoem(editingId, qTitle, qText);
    else app.addPoem(qTitle, qText);
    setAdding(false);
    setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: '62ch' }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Şiir
        </h1>
        {!adding && (
          <div onClick={startAdd} className="btn-dark" style={{ padding: '10px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 3, whiteSpace: 'nowrap' }}>
            Yeni şiir
          </div>
        )}
      </header>

      {adding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${colors.border}`, background: colors.panel, padding: '20px', borderRadius: 4 }}>
          <input value={qTitle} onChange={(e) => setQTitle(e.target.value)} placeholder="Başlık…" style={{ ...inputStyle, fontSize: 18, fontStyle: 'italic' }} />
          <textarea
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Şiir…"
            style={{ ...inputStyle, fontSize: 16, lineHeight: 1.7, minHeight: 140, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <div onClick={cancel} className="btn-outline-hover" style={{ padding: '9px 16px', border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft, fontSize: 13, cursor: 'pointer', borderRadius: 3 }}>
              Vazgeç
            </div>
            <div onClick={save} className="btn-dark" style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 3 }}>
              Kaydet
            </div>
          </div>
        </div>
      )}

      {app.poemEntries.map((p) => (
        <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 34, borderBottom: '1px solid #F1E4E4' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 20, color: colors.ink }}>{p.title}</div>
            <div style={{ display: 'flex', gap: 10, flex: '0 0 auto' }}>
              <span onClick={() => startEdit(p.id, p.title, p.text)} className="text-hover-rose" style={{ fontSize: 11, color: colors.inkFaint, cursor: 'pointer' }}>
                düzenle
              </span>
              <span onClick={() => app.deletePoem(p.id)} className="text-hover-red" style={{ fontSize: 11, color: colors.placeholderText, cursor: 'pointer' }}>
                sil
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17, lineHeight: 1.9, color: colors.ink, whiteSpace: 'pre-line' }}>{p.text}</p>
          <div style={{ fontFamily: fonts.sans, fontSize: 10.5, color: colors.inkFainter, letterSpacing: '0.08em' }}>{p.date}</div>
        </div>
      ))}
    </div>
  );
}
