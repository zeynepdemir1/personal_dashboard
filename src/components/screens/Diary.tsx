import { useState, type CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';

export function Diary() {
  const app = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qText, setQText] = useState('');

  const inputStyle: CSSProperties = {
    padding: '10px 12px',
    border: `1px solid ${colors.borderStrong}`,
    background: colors.panel,
    fontFamily: fonts.serif,
    fontSize: 16,
    lineHeight: 1.7,
    color: colors.ink,
    outline: 'none',
    borderRadius: 3,
    minHeight: 120,
    resize: 'vertical',
  };

  const startAdd = () => {
    setQText('');
    setEditingId(null);
    setAdding(true);
  };
  const startEdit = (id: string, text: string) => {
    setQText(text);
    setEditingId(id);
    setAdding(true);
  };
  const cancel = () => {
    setAdding(false);
    setEditingId(null);
  };
  const save = () => {
    if (editingId) app.updateDiaryEntry(editingId, qText);
    else app.addDiaryEntry(qText);
    setAdding(false);
    setEditingId(null);
  };

  if (!app.unlocked) {
    return (
      <div style={{ minHeight: '74vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, textAlign: 'center' }}>
        <div style={{ width: 34, height: 34, border: `1px solid ${colors.borderStrong}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 7, height: 7, background: colors.inkSoft, borderRadius: '50%' }} />
        </div>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 34, fontWeight: 400, letterSpacing: '-0.015em', color: colors.ink }}>
          Günlük kilitli
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <input
            type="password"
            value={app.pass}
            onChange={(e) => app.setPass(e.target.value)}
            placeholder="••••••••"
            style={{
              width: 260,
              padding: '13px 16px',
              border: `1px solid ${colors.borderStrong}`,
              background: colors.panel,
              fontFamily: fonts.sans,
              fontSize: 14,
              letterSpacing: '0.2em',
              textAlign: 'center',
              outline: 'none',
              color: colors.ink,
            }}
          />
          <div onClick={app.unlock} className="btn-dark" style={{ width: 260, padding: '12px 0', fontSize: 13, textAlign: 'center', cursor: 'pointer', borderRadius: 3 }}>
            Aç
          </div>
          <div style={{ fontFamily: fonts.sans, fontSize: 10.5, color: colors.inkFaint, letterSpacing: '0.06em' }}>
            son giriş · 27 Ağustos, 23:41
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34, maxWidth: '68ch' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, paddingBottom: 14 }}>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 34, fontWeight: 400, color: colors.ink }}>Günlük</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!adding && (
            <span onClick={startAdd} className="hover-underline" style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer', borderBottom: '1px solid transparent', paddingBottom: 1 }}>
              + yeni giriş
            </span>
          )}
          <span onClick={app.lock} className="hover-underline" style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer', borderBottom: '1px solid transparent', paddingBottom: 1 }}>
            kilitle
          </span>
        </div>
      </header>

      {adding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${colors.border}`, background: colors.panel, padding: '20px', borderRadius: 4 }}>
          <textarea value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Bugün ne oldu?" style={inputStyle} />
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

      {app.diaryEntries.map((d) => (
        <div key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 26, borderBottom: '1px solid #F1E4E4' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontFamily: fonts.sans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.inkFainter }}>{d.date}</div>
            <div style={{ display: 'flex', gap: 10, flex: '0 0 auto' }}>
              <span onClick={() => startEdit(d.id, d.text)} className="text-hover-rose" style={{ fontSize: 11, color: colors.inkFaint, cursor: 'pointer' }}>
                düzenle
              </span>
              <span onClick={() => app.deleteDiaryEntry(d.id)} className="text-hover-red" style={{ fontSize: 11, color: colors.placeholderText, cursor: 'pointer' }}>
                sil
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17.5, lineHeight: 1.72, textWrap: 'pretty', color: colors.ink }}>{d.text}</p>
        </div>
      ))}
    </div>
  );
}
