import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useApp } from '../state/AppState';
import { randomBackground } from '../lib/backgrounds';
import { compressImage } from '../lib/image';
import { uploadImage } from '../lib/upload';
import { colors, fonts } from '../lib/theme';

// PLAN.md Aşama 19 madde 9 / Aşama 21: sade tasarım dilini bozmayacak ama
// artık belirgin görünen bir dekoratif unsur. Sidebar'ın (nav listesiyle
// profil kartı arasındaki boş alanda) bir çocuğu olarak, MUTLAKA
// konumlandırılmış (absolute) render ediliyor — Sidebar'ın kendisi
// `position: sticky` olduğu için kendi yığın (stacking) bağlamını
// oluşturuyor, bu da negatif z-index'in burada (aksine, sayfanın kök
// seviyesinde değil) gerçekten "arkada" göstermesini sağlıyor: aside'ın
// kendi arkaplanının önünde ama nav satırlarının/metinlerinin arkasında
// kalıyor. Sayfa her açıldığında rastgele bir fotoğraf seçiliyor, 75 sn'de
// bir ya da tıklanınca yumuşak bir geçişle değişiyor.
//
// Genişlik en dar sidebar durumuna (tight breakpoint, 210px) göre
// sınırlandı — 195px, o durumda bile aside'ın kendi sınırını taşmıyor.
//
// Aşama 21: fotoğraf listesi artık sabit değil — `app.backgroundImages`
// (PersistedState, Redis'te) üzerinden geliyor, siteden doğrudan
// yükleme/silme ile büyüyüp küçülebiliyor (aşağıdaki "+ fotoğraf ekle"/
// "sil" kontrolleri). Bunlar, görselin KENDİSİ negatif z-index'te olduğu
// için (nav metinlerinin arkasında kalması gerekiyor, tıklanamaz bir alan)
// ayrı, normal akıştaki (z-index: auto) küçük bir metin satırı olarak
// altına ekleniyor — görselle aynı absolute konumda DEĞİLLER.
export function BackgroundAccent() {
  const app = useApp();
  const images = app.backgroundImages;
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const [src, setSrc] = useState(() => randomBackground(images));
  const [visible, setVisible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const changeImage = () => {
    setVisible(false);
    setTimeout(() => {
      setSrc((cur) => randomBackground(imagesRef.current, cur));
      setVisible(true);
    }, 600);
  };

  useEffect(() => {
    const interval = setInterval(changeImage, 75000);
    return () => clearInterval(interval);
  }, []);

  // Şu an gösterilen fotoğraf listeden silinirse (başka bir cihazdan da
  // silinebilir, bkz. Aşama 20 canlı senkronizasyon) hemen başka birine
  // geç — aksi halde kırık bir görsel kalır.
  useEffect(() => {
    if (images.length > 0 && !images.includes(src)) {
      setSrc(randomBackground(images));
    }
  }, [images, src]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(await compressImage(file));
      app.addBackgroundImage(url);
    } catch {
      setError('Yüklenemedi, tekrar dene.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (images.length <= 1) {
      setError('Son fotoğraf silinemez.');
      return;
    }
    setError(null);
    app.removeBackgroundImage(src);
  };

  return (
    <div style={{ position: 'relative' }}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        onClick={changeImage}
        title="Başka bir fotoğraf göster"
        style={{
          position: 'absolute',
          bottom: 130,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 195,
          height: 280,
          borderRadius: 10,
          objectFit: 'cover',
          opacity: visible ? 0.8 : 0,
          filter: 'saturate(0.9)',
          cursor: 'pointer',
          userSelect: 'none',
          zIndex: -1,
          transition: 'opacity 0.6s ease',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily: fonts.sans,
          fontSize: 10.5,
          padding: '4px 0 2px',
        }}
      >
        <span
          onClick={() => !uploading && fileRef.current?.click()}
          className="hover-underline"
          style={{
            cursor: uploading ? 'default' : 'pointer',
            color: uploading ? colors.inkFainter : colors.rose,
            letterSpacing: '0.03em',
          }}
        >
          {uploading ? 'yükleniyor…' : '+ fotoğraf ekle'}
        </span>
        <span style={{ color: colors.border }}>·</span>
        <span
          onClick={handleRemove}
          className="hover-underline"
          style={{ cursor: 'pointer', color: colors.inkFaint, letterSpacing: '0.03em' }}
        >
          sil
        </span>
      </div>
      {error && (
        <div style={{ fontFamily: fonts.sans, fontSize: 10, color: '#B4545A', textAlign: 'center', paddingBottom: 4 }}>
          {error}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
    </div>
  );
}
