import { useState } from 'react';
import { useApp } from '../state/AppState';
import { colors, fonts } from '../lib/theme';
import { eventsOnDate } from '../lib/googleCalendar';
import { formatFullDateTR, parseDateKey, isoDateToDotDate } from '../lib/dates';

function formatEventTime(ev: { start: Date; end: Date; allDay: boolean }): string {
  if (ev.allDay) return 'tüm gün';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(ev.start.getHours())}:${pad(ev.start.getMinutes())}`;
}

export function DayPanel() {
  const app = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editLabel, setEditLabel] = useState('');

  if (app.dayPanel == null) return null;
  const dayPanel = app.dayPanel;

  const date = parseDateKey(dayPanel);
  const items = app.dayNotes[dayPanel] || [];
  const gcalItems = eventsOnDate(app.gcalEvents, date.getFullYear(), date.getMonth(), date.getDate());
  // Program Takvimi'ne eklenen programlar burada "canlı bağlı" olarak
  // gösteriliyor — ayrı bir kopya değil, doğrudan app.extraPrograms'tan
  // filtrelenmiş; program düzenlenince/silinince burada da otomatik
  // güncellenir. Bu yüzden bilerek düzenlenemez/silinemez — kaynağı
  // Program Takvimi, oraya yönlendiriliyor (bkz. PLAN.md Aşama 22 ek).
  const programItems = app.extraPrograms.filter((p) => p.date === isoDateToDotDate(dayPanel));

  const openInCalendar = () => {
    app.closeDayPanel();
    app.navigate('calendar');
  };

  const startEdit = (id: string, time: string, label: string) => {
    setEditingId(id);
    setEditTime(time);
    setEditLabel(label);
  };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = () => {
    if (!editingId || !editLabel.trim()) return;
    app.editDayNote(dayPanel, editingId, { time: editTime, label: editLabel.trim() });
    setEditingId(null);
  };

  return (
    <>
      <div
        onClick={app.closeDayPanel}
        style={{ position: 'fixed', inset: 0, background: 'rgba(61,43,46,0.28)', zIndex: 55, cursor: 'pointer' }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 360,
          background: colors.panel,
          boxShadow: '-10px 0 32px rgba(61,43,46,0.18)',
          zIndex: 56,
          padding: '30px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.ink }}>{formatFullDateTR(date)}</div>
          <span
            onClick={app.closeDayPanel}
            className="text-hover-rose"
            style={{ cursor: 'pointer', color: colors.inkFaint, fontSize: 16, padding: 4 }}
          >
            ✕
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it) =>
            editingId === it.id ? (
              <div
                key={it.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '10px 12px',
                  border: `1px solid ${colors.borderStrong}`,
                  borderRadius: 4,
                  background: colors.panelAlt,
                }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    style={{
                      padding: '7px 9px',
                      border: `1px solid ${colors.borderStrong}`,
                      borderRadius: 4,
                      fontSize: 12.5,
                      color: colors.ink,
                      fontFamily: fonts.sans,
                      outline: 'none',
                      width: 104,
                    }}
                  />
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Not içeriği…"
                    style={{
                      flex: 1,
                      padding: '7px 9px',
                      border: `1px solid ${colors.borderStrong}`,
                      borderRadius: 4,
                      fontSize: 13,
                      color: colors.ink,
                      fontFamily: fonts.sans,
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div onClick={saveEdit} className="btn-dark" style={{ padding: '6px 12px', fontSize: 11.5, cursor: 'pointer', borderRadius: 3 }}>
                    Kaydet
                  </div>
                  <div
                    onClick={cancelEdit}
                    className="btn-outline-hover"
                    style={{ padding: '6px 12px', fontSize: 11.5, cursor: 'pointer', borderRadius: 3, border: `1px solid ${colors.borderStrong}`, color: colors.inkSoft }}
                  >
                    Vazgeç
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={it.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 4,
                  background: colors.panelAlt,
                }}
              >
                <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFainter, flex: '0 0 40px' }}>
                  {it.time || 'not'}
                </span>
                <span style={{ fontSize: 13.5, color: colors.ink, lineHeight: 1.4, flex: 1 }}>{it.label}</span>
                <span
                  onClick={() => startEdit(it.id, it.time, it.label)}
                  className="text-hover-rose"
                  style={{ cursor: 'pointer', color: colors.placeholderText, padding: 4, flex: '0 0 auto' }}
                  title="Düzenle"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </span>
                <span
                  onClick={() => app.removeDayNote(dayPanel, it.id)}
                  className="text-hover-red"
                  style={{ cursor: 'pointer', color: colors.placeholderText, padding: 4, flex: '0 0 auto' }}
                  title="Sil"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </span>
              </div>
            ),
          )}
          {gcalItems.map((ev, i) => (
            <div
              key={`gcal-${i}`}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '10px 12px',
                border: `1px dashed ${colors.steel}`,
                borderRadius: 4,
                background: 'rgba(157,163,164,0.1)',
              }}
            >
              <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.inkFainter, flex: '0 0 40px' }}>
                {formatEventTime(ev)}
              </span>
              <span style={{ fontSize: 13.5, color: colors.ink, lineHeight: 1.4, flex: 1 }}>{ev.title}</span>
              <span style={{ fontFamily: fonts.sans, fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase', color: colors.steel, flex: '0 0 auto' }}>
                Google
              </span>
            </div>
          ))}
          {programItems.map((p) => (
            <div
              key={`prog-${p.id}`}
              onClick={openInCalendar}
              className="hover-row-alt"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: '10px 12px',
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: 4,
                background: 'rgba(176,85,79,0.06)',
                cursor: 'pointer',
              }}
              title="Program Takvimi'nde düzenle"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13.5, color: colors.ink, lineHeight: 1.4, flex: 1, fontWeight: 500 }}>{p.title}</span>
                <span style={{ fontFamily: fonts.sans, fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase', color: colors.rose, flex: '0 0 auto' }}>
                  Program
                </span>
              </div>
              {p.note && <span style={{ fontSize: 12, color: colors.inkSoft, lineHeight: 1.4 }}>{p.note}</span>}
              <span style={{ fontSize: 10.5, color: colors.inkFainter }}>Program Takvimi'nde düzenle →</span>
            </div>
          ))}
          {items.length === 0 && gcalItems.length === 0 && programItems.length === 0 && (
            <div style={{ fontSize: 13, color: colors.inkFaint, fontStyle: 'italic' }}>
              Bu güne henüz bir şey eklenmedi.
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 'auto',
            borderTop: `1px solid ${colors.border}`,
            paddingTop: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="time"
              value={app.dayPanelTime}
              onChange={(e) => app.setDayPanelTime(e.target.value)}
              style={{
                padding: '8px 10px',
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: 4,
                fontSize: 12.5,
                color: colors.ink,
                fontFamily: fonts.sans,
                outline: 'none',
                width: 112,
              }}
            />
            <span style={{ fontSize: 10.5, color: colors.inkFaint, lineHeight: 1.4 }}>
              saat girilmezse not olarak eklenir
            </span>
          </div>
          <textarea
            value={app.dayPanelInput}
            onChange={(e) => app.setDayPanelInput(e.target.value)}
            placeholder="Not, yapılacak veya ders ekle…"
            style={{
              resize: 'vertical',
              minHeight: 70,
              padding: '10px 12px',
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: 4,
              fontSize: 13,
              color: colors.ink,
              fontFamily: fonts.sans,
              outline: 'none',
            }}
          />
          <div
            onClick={app.addDayPanelItem}
            className="btn-dark"
            style={{
              padding: '10px 0',
              textAlign: 'center',
              fontSize: 13,
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            Ekle
          </div>
        </div>
      </div>
    </>
  );
}
