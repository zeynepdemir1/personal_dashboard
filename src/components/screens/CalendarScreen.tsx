import { useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { PROGRAMS } from '../../lib/data';
import { daysLeftUntil, daysLeftColor, formatDaysLeft } from '../../lib/dates';
import { readFileAsDataUrl, MAX_FILE_BYTES } from '../../lib/file';

interface DisplayProgram {
  key: string;
  date: string;
  title: string;
  baseNote: string;
  note: string;
  link?: string;
  fileName?: string;
  fileData?: string;
  remind: string;
  color: string;
}

export function CalendarScreen() {
  const app = useApp();
  const narrow = app.width < 1180;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingFileKey = useRef<string | null>(null);

  const listGrid: CSSProperties = narrow
    ? { display: 'flex', flexDirection: 'column', gap: 6, padding: '18px 6px', borderBottom: '1px solid #F1E4E4' }
    : { display: 'grid', gridTemplateColumns: '110px minmax(0, 1fr) 140px', gap: 20, padding: '20px 6px', borderBottom: '1px solid #F1E4E4', alignItems: 'baseline' };

  const staticPrograms: DisplayProgram[] = PROGRAMS.map((p) => {
    const att = app.programAttachments[p.title];
    return {
      key: `static:${p.title}`,
      date: p.date,
      title: p.title,
      baseNote: p.note,
      note: att?.note ?? '',
      link: att?.link,
      fileName: att?.fileName,
      fileData: att?.fileData,
      remind: '',
      color: '',
    };
  });
  const extraProgramsList: DisplayProgram[] = app.extraPrograms.map((p) => ({
    key: `extra:${p.id}`,
    date: p.date,
    title: p.title,
    baseNote: 'Ana sayfadan eklendi',
    note: p.note,
    link: p.link,
    fileName: p.fileName,
    fileData: p.fileData,
    remind: '',
    color: '',
  }));

  const programs = [...staticPrograms, ...extraProgramsList].map((p) => {
    const left = daysLeftUntil(p.date);
    return {
      ...p,
      remind: left === null ? '' : formatDaysLeft(left),
      color: left === null ? colors.inkFaint : daysLeftColor(left),
    };
  });

  const saveNote = (p: DisplayProgram, note: string) => {
    if (p.key.startsWith('extra:')) app.updateExtraProgram(p.key.slice(6), { note });
    else app.updateProgramAttachment(p.title, { note });
  };
  const saveLink = (p: DisplayProgram, link: string) => {
    if (p.key.startsWith('extra:')) app.updateExtraProgram(p.key.slice(6), { link });
    else app.updateProgramAttachment(p.title, { link });
  };
  const removeFile = (p: DisplayProgram) => {
    if (p.key.startsWith('extra:')) app.removeExtraProgramFile(p.key.slice(6));
    else app.removeProgramFile(p.title);
  };

  const handleFilePick = (key: string) => {
    setFileError(null);
    pendingFileKey.current = key;
    fileRef.current?.click();
  };
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const key = pendingFileKey.current;
    if (!file || !key) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError(`Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)} MB). En fazla ${MAX_FILE_BYTES / 1024 / 1024} MB olabilir.`);
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    if (key.startsWith('extra:')) app.updateExtraProgram(key.slice(6), { fileName: file.name, fileData: dataUrl });
    else app.updateProgramAttachment(key.slice(7), { fileName: file.name, fileData: dataUrl });
  };

  const inputStyle: CSSProperties = {
    padding: '8px 10px',
    border: `1px solid ${colors.borderStrong}`,
    background: colors.panel,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: colors.ink,
    outline: 'none',
    borderRadius: 3,
    width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Program Takvimi
        </h1>
      </header>
      <input ref={fileRef} type="file" hidden onChange={handleFileChange} />
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.border}` }}>
        {programs.map((p) => {
          const isOpen = expanded === p.key;
          return (
            <div key={p.key} style={{ borderBottom: '1px solid #F1E4E4' }}>
              <div
                onClick={() => setExpanded(isOpen ? null : p.key)}
                className="hover-row-alt"
                style={{ ...listGrid, borderBottom: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontFamily: fonts.sans, fontSize: 11.5, color: colors.ink }}>{p.date}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontFamily: fonts.serif, fontSize: 19, color: colors.ink }}>{p.title}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.6, color: colors.inkSoft }}>{p.baseNote}</span>
                  {(p.note || p.link || p.fileName) && (
                    <span style={{ fontSize: 11, color: colors.rose }}>
                      {[p.note && '📝 not', p.link && '🔗 link', p.fileName && '📎 dosya'].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: p.color, textAlign: 'right' }}>
                  {p.remind}
                </span>
              </div>

              {isOpen && (
                <div style={{ padding: '4px 6px 20px', display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.inkFaint }}>Not</span>
                    <textarea
                      defaultValue={p.note}
                      onBlur={(e) => saveNote(p, e.target.value)}
                      placeholder="Bu program için kişisel not…"
                      style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.inkFaint }}>Link</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        defaultValue={p.link ?? ''}
                        onBlur={(e) => saveLink(p, e.target.value)}
                        placeholder="https://…"
                        style={inputStyle}
                      />
                      {p.link && (
                        <a
                          href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline-hover"
                          style={{ padding: '8px 12px', border: `1px solid ${colors.borderStrong}`, borderRadius: 3, fontSize: 12, color: colors.inkSoft, whiteSpace: 'nowrap' }}
                        >
                          Aç
                        </a>
                      )}
                    </div>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.inkFaint }}>Dosya (ör. şartname PDF'i)</span>
                    {p.fileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={p.fileData} download={p.fileName} style={{ fontSize: 13, color: colors.rose }}>
                          {p.fileName}
                        </a>
                        <span onClick={() => removeFile(p)} className="text-hover-red" style={{ cursor: 'pointer', fontSize: 11, color: colors.placeholderText }}>
                          kaldır
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleFilePick(p.key)}
                        className="btn-outline-hover"
                        style={{ padding: '8px 12px', border: `1px solid ${colors.borderStrong}`, borderRadius: 3, fontSize: 12, color: colors.inkSoft, cursor: 'pointer', width: 'fit-content' }}
                      >
                        Dosya seç…
                      </div>
                    )}
                    {fileError && expanded === p.key && (
                      <span style={{ fontSize: 11, color: '#B0554F' }}>{fileError}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
