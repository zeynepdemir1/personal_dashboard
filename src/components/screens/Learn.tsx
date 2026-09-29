import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useApp } from '../../state/AppState';
import { colors, fonts } from '../../lib/theme';
import { SEED_LEARN_ENTRIES } from '../../lib/learn';
import { compressImage } from '../../lib/image';
import { uploadImage } from '../../lib/upload';

// PLAN.md Aşama 24/25: "Bir Şey Öğrendim" girişlerine kalın/italik/liste
// biçimlendirmesi ve gömülü resim (Cloudinary) eklendi. `document.
// execCommand` deprecated ama tüm masaüstü/mobil Chromium'da (ve bu
// tarayıcı-bazlı, tek-kullanıcılı iç araç bağlamında) hâlâ güvenilir
// çalışıyor — üç basit komut (bold/italic/insertUnorderedList) + resim
// eklemek için ayrı bir zengin metin editörü kütüphanesi eklemek bu
// projenin "sade, bağımlılıksız" tarzına aykırı olurdu.
//
// Aşama 25 madde 1 düzeltmesi: butonlar hiçbir şey yapmıyormuş gibi
// görünüyordu — kök neden, butonların normal <div onClick> olması: bir
// butona TIKLAMADAN ÖNCE tarayıcı `mousedown` anında contentEditable'daki
// seçimi/odağı kaybediyordu, bu yüzden execCommand ya seçili metne değil
// boş bir imlece uygulanıyordu ya da hiç etkisi olmuyordu. Standart zengin
// metin editörü çözümü: her buton için `onMouseDown`'da `preventDefault()`
// — bu, tarayıcının o an editördeki seçimi/odağı DEĞİŞTİRMESİNİ engelliyor,
// `onClick` çalıştığında seçim hâlâ olduğu gibi duruyor. Ayrıca butonlar
// artık `document.queryCommandState(...)` ile gerçek "aktif mi" durumunu
// okuyup görsel olarak vurgulanıyor (standart editör davranışı).
function useActiveFormats(editorRef: React.RefObject<HTMLDivElement | null>) {
  const [active, setActive] = useState({ bold: false, italic: false, ul: false });
  const refresh = () => {
    if (document.activeElement !== editorRef.current) return;
    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      ul: document.queryCommandState('insertUnorderedList'),
    });
  };
  return { active, refresh };
}

function LearnToolbar({
  editorRef,
  active,
  onRefreshActive,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  active: { bold: boolean; italic: boolean; ul: boolean };
  onRefreshActive: () => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const exec = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
    onRefreshActive();
  };

  const openImagePicker = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    imageInputRef.current?.click();
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError(null);
    setUploadingImage(true);
    try {
      const url = await uploadImage(await compressImage(file));
      editorRef.current?.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
      document.execCommand('insertImage', false, url);
    } catch {
      setImageError('Görsel yüklenemedi, tekrar dene.');
    } finally {
      setUploadingImage(false);
    }
  };

  const toolbarBtn = (isActive: boolean): CSSProperties => ({
    padding: '6px 11px',
    border: `1px solid ${isActive ? colors.rose : colors.borderStrong}`,
    borderRadius: 3,
    fontSize: 12.5,
    color: isActive ? colors.rose : colors.inkSoft,
    background: isActive ? colors.chipBg : colors.panel,
    cursor: 'pointer',
  });

  // onMouseDown + preventDefault: buton tıklaması editördeki metin
  // seçimini KAYBETMESİN diye — bkz. dosya başındaki teknik not.
  const preserveSelection = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <div
        onMouseDown={preserveSelection}
        onClick={() => exec('bold')}
        className="btn-outline-hover"
        style={{ ...toolbarBtn(active.bold), fontWeight: 700 }}
      >
        K
      </div>
      <div
        onMouseDown={preserveSelection}
        onClick={() => exec('italic')}
        className="btn-outline-hover"
        style={{ ...toolbarBtn(active.italic), fontStyle: 'italic' }}
      >
        İ
      </div>
      <div
        onMouseDown={preserveSelection}
        onClick={() => exec('insertUnorderedList')}
        className="btn-outline-hover"
        style={toolbarBtn(active.ul)}
      >
        • Liste
      </div>
      <div onMouseDown={preserveSelection} onClick={openImagePicker} className="btn-outline-hover" style={toolbarBtn(false)}>
        {uploadingImage ? 'yükleniyor…' : '🖼 Görsel ekle'}
      </div>
      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
      {imageError && <span style={{ fontSize: 11, color: '#B0554F', alignSelf: 'center' }}>{imageError}</span>}
    </div>
  );
}

// Hem "Yeni giriş" hem "Düzenle" formu bu bileşeni kullanıyor —
// `initialHtml` verilirse (düzenleme) editör o içerikle başlıyor,
// verilmezse (yeni giriş) boş başlıyor. İçerik kaydedilene kadar sadece
// DOM'da (editorRef) tutuluyor — React state'ini her tuşta güncellemek
// contentEditable'da imleç sıçramasına yol açar.
function LearnEditorForm({
  editorRef,
  initialHtml,
  title,
  onTitleChange,
  onCancel,
  onSave,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  initialHtml?: string;
  title: string;
  onTitleChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { active, refresh } = useActiveFormats(editorRef);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (initialHtml && editorRef.current) editorRef.current.innerHTML = initialHtml;
  }, [initialHtml, editorRef]);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Panodan gelen HTML'i (başka bir siteden kopyalanmış olabilir) hiç
    // kabul etmiyoruz — sadece düz metin olarak yapıştırıyoruz. Hem
    // güvenlik (script/olay işleyicisi riski yok) hem tutarlı görünüm.
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        background: colors.panel,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderRadius: 4,
      }}
    >
      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Başlık…"
        style={{
          padding: '10px 12px',
          border: `1px solid ${colors.borderStrong}`,
          background: colors.panel,
          fontFamily: fonts.serif,
          fontSize: 18,
          color: colors.ink,
          outline: 'none',
          borderRadius: 3,
        }}
      />

      <LearnToolbar editorRef={editorRef} active={active} onRefreshActive={refresh} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onKeyUp={refresh}
        onMouseUp={refresh}
        onFocus={refresh}
        data-placeholder="Ne öğrendin? Serbestçe yaz…"
        className="learn-editor"
        style={{
          minHeight: 160,
          padding: '10px 12px',
          border: `1px solid ${colors.borderStrong}`,
          background: colors.panel,
          fontFamily: fonts.serif,
          fontSize: 15,
          lineHeight: 1.6,
          color: colors.ink,
          outline: 'none',
          borderRadius: 3,
          overflowY: 'auto',
        }}
      />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <div
          onClick={onCancel}
          className="btn-outline-hover"
          style={{
            padding: '9px 16px',
            border: `1px solid ${colors.borderStrong}`,
            color: colors.inkSoft,
            fontSize: 14,
            cursor: 'pointer',
            borderRadius: 3,
          }}
        >
          Vazgeç
        </div>
        <div onClick={onSave} className="btn-dark" style={{ padding: '9px 16px', fontSize: 14, cursor: 'pointer', borderRadius: 3 }}>
          Kaydet
        </div>
      </div>
    </div>
  );
}

export function Learn() {
  const app = useApp();
  const narrow = app.width < 1180;
  const tight = app.width < 860;

  const addEditorRef = useRef<HTMLDivElement>(null);
  const editEditorRef = useRef<HTMLDivElement>(null);
  // PLAN.md Aşama 25 madde 4: kayıtlı bir girişi düzenleme. Sadece
  // kullanıcının kendi eklediği girişlerde (id "user-" ile başlıyor) —
  // seed/tasarım girişleri düzenlenemez.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleSaveNew = () => {
    app.saveLearnEntry(addEditorRef.current?.innerHTML || '');
  };

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };
  const handleSaveEdit = () => {
    if (!editingId) return;
    app.updateLearnEntry(editingId, editTitle, editEditorRef.current?.innerHTML || '');
    setEditingId(null);
    setEditTitle('');
  };

  // PLAN.md Aşama 25 madde 3: örnek/mock girişler kaldırılınca (SEED_LEARN_
  // ENTRIES boş) bu ekran hiç giriş yokken de açılabilmeli — `article`
  // artık `undefined` olabiliyor, aşağıdaki JSX bunu bir boş durum
  // mesajıyla karşılıyor (çökmüyor).
  const entries = [...app.learnEntries, ...SEED_LEARN_ENTRIES];
  const hasEntries = entries.length > 0;
  const activeIndex = hasEntries ? Math.min(app.entry ?? 0, entries.length - 1) : 0;
  const article = hasEntries ? entries[activeIndex] : null;
  const isUserEntry = article ? article.id.startsWith('user-') : false;
  const isEditingThis = article ? editingId === article.id : false;

  const gridLearn: CSSProperties = narrow
    ? { display: 'grid', gridTemplateColumns: '1fr', gap: 34, alignItems: 'start' }
    : { display: 'grid', gridTemplateColumns: '300px minmax(420px, 1fr)', gap: 48, alignItems: 'start' };

  const articleStyle: CSSProperties = {
    border: `1px solid ${colors.border}`,
    background: colors.panel,
    padding: tight ? '26px 24px 30px' : '40px 44px 46px',
    display: 'flex',
    flexDirection: 'column',
    gap: 26,
    minWidth: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
        <h1 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: colors.ink }}>
          Bir Şey Öğrendim
        </h1>
        {!app.addingLearnEntry && (
          <div
            onClick={app.startAddLearnEntry}
            className="btn-dark"
            style={{ padding: '11px 18px', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: 3 }}
          >
            Yeni giriş
          </div>
        )}
      </header>

      {app.addingLearnEntry && (
        <LearnEditorForm
          editorRef={addEditorRef}
          title={app.qLearnTitle}
          onTitleChange={app.setQLearnTitle}
          onCancel={app.cancelAddLearnEntry}
          onSave={handleSaveNew}
        />
      )}

      <div style={gridLearn}>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.border}` }}>
          {entries.map((e, i) => (
            <div
              key={i}
              onClick={() => app.navigate('learn', i)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '16px 14px 17px',
                margin: 0,
                borderBottom: '1px solid #F1E4E4',
                cursor: 'pointer',
                borderLeft: i === activeIndex ? `2px solid ${colors.rose}` : '2px solid transparent',
                paddingLeft: 12,
                background: i === activeIndex ? colors.panelAlt : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: fonts.sans, fontSize: 10.5, color: colors.inkFainter }}>{e.date}</span>
                <span style={{ fontFamily: fonts.sans, fontSize: 10, color: colors.inkFaint }}>{e.len}</span>
              </div>
              <div style={{ fontFamily: fonts.serif, fontSize: 17, lineHeight: 1.35, color: colors.ink }}>{e.title}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: colors.inkSoft }}>{e.teaser}</div>
            </div>
          ))}
        </div>

        {!article ? (
          <div style={{ ...articleStyle, alignItems: 'center', justifyContent: 'center', color: colors.inkFaint, fontFamily: fonts.sans, fontSize: 14 }}>
            Henüz bir giriş yok — "Yeni giriş" ile ilkini ekle.
          </div>
        ) : isEditingThis ? (
          <LearnEditorForm
            editorRef={editEditorRef}
            initialHtml={article.bodyHtml || article.body.map((p) => `<div>${p}</div>`).join('')}
            title={editTitle}
            onTitleChange={setEditTitle}
            onCancel={cancelEdit}
            onSave={handleSaveEdit}
          />
        ) : (
          <article style={articleStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontFamily: fonts.sans, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.inkFainter }}>
                  {article.stamp}
                </div>
                {isUserEntry && (
                  <div style={{ display: 'flex', gap: 12, flex: '0 0 auto' }}>
                    <span
                      onClick={() => startEdit(article.id, article.title)}
                      className="hover-underline"
                      style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.rose, cursor: 'pointer', borderBottom: '1px solid transparent', paddingBottom: 1, whiteSpace: 'nowrap' }}
                    >
                      Düzenle
                    </span>
                    <span
                      onClick={() => {
                        app.removeLearnEntry(article.id);
                        app.navigate('learn', 0);
                      }}
                      className="text-hover-red"
                      style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.placeholderText, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Sil
                    </span>
                  </div>
                )}
              </div>
              <h2 style={{ margin: 0, fontFamily: fonts.serif, fontSize: 32, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.015em', maxWidth: '26ch', color: colors.ink }}>
                {article.title}
              </h2>
            </div>

            {article.summary ? (
              <div style={{ borderLeft: `2px solid ${colors.rose}`, padding: '2px 0 2px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A9464E' }}>
                  Yerel model özeti
                </div>
                <p style={{ margin: 0, fontFamily: fonts.serif, fontSize: 16.5, lineHeight: 1.6, color: colors.ink, textWrap: 'pretty' }}>
                  {article.summary}
                </p>
              </div>
            ) : (
              <div style={{ borderLeft: `2px solid ${colors.borderStrong}`, padding: '2px 0 2px 18px' }}>
                <div style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.inkFaint }}>
                  özetlenmedi · Ollama'ya erişilebilen bir cihazda açılınca otomatik özetlenecek
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: '68ch' }}>
              {article.bodyHtml ? (
                <div className="learn-rich-content" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
              ) : (
                article.body.map((p, i) => (
                  <p key={i} style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17.5, lineHeight: 1.72, color: colors.ink, textWrap: 'pretty' }}>
                    {p}
                  </p>
                ))
              )}
              {article.code && (
                <div style={{ border: `1px solid ${colors.borderStrong}`, background: colors.panelAlt, padding: '18px 20px', fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 1.7, color: '#4A3B3E', whiteSpace: 'pre-wrap' }}>
                  {article.code}
                </div>
              )}
              {article.body2?.map((p, i) => (
                <p key={i} style={{ margin: 0, fontFamily: fonts.serif, fontSize: 17.5, lineHeight: 1.72, color: colors.ink, textWrap: 'pretty' }}>
                  {p}
                </p>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid #F1E4E4', paddingTop: 20, alignItems: 'center' }}>
              {article.tags.map((t) => (
                <span key={t} style={{ fontFamily: fonts.sans, fontSize: 10, letterSpacing: '0.04em', padding: '5px 9px', background: colors.chipBg, color: colors.chipText }}>
                  {t}
                </span>
              ))}
              <span
                onClick={() => app.navigate(article.relScreen)}
                className="chip-hover"
                style={{ marginLeft: 'auto', fontSize: 12, color: colors.rose, cursor: 'pointer', padding: '6px 12px', border: '1px solid #F0BFC0', borderRadius: 4 }}
              >
                {article.rel} →
              </span>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
