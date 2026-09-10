import { useEffect, useState } from 'react';
import { randomBackground } from '../lib/backgrounds';

// PLAN.md Aşama 19 madde 9: sade tasarım dilini bozmayacak ama artık
// belirgin görünen bir dekoratif unsur. Sidebar'ın (nav listesiyle profil
// kartı arasındaki boş alanda) bir çocuğu olarak, MUTLAKA konumlandırılmış
// (absolute) render ediliyor — Sidebar'ın kendisi `position: sticky`
// olduğu için kendi yığın (stacking) bağlamını oluşturuyor, bu da negatif
// z-index'in burada (aksine, sayfanın kök seviyesinde değil) gerçekten
// "arkada" göstermesini sağlıyor: aside'ın kendi arkaplanının önünde ama
// nav satırlarının/metinlerinin arkasında kalıyor. Sayfa her açıldığında
// rastgele bir fotoğraf seçiliyor, 75 sn'de bir ya da tıklanınca (Zeynep'in
// isteği) yumuşak bir geçişle değişiyor.
//
// Genişlik en dar sidebar durumuna (tight breakpoint, 210px) göre
// sınırlandı — 195px, o durumda bile aside'ın kendi sınırını taşmıyor
// (ortalanmış, 210px'in içine güvenle sığıyor); daha geniş sidebar'larda
// (260/280px) fazladan boşluk kalıyor, bu kasıtlı (taşma riski yok).
export function BackgroundAccent() {
  const [src, setSrc] = useState(() => randomBackground());
  const [visible, setVisible] = useState(true);

  const changeImage = () => {
    setVisible(false);
    setTimeout(() => {
      setSrc((cur) => randomBackground(cur));
      setVisible(true);
    }, 600);
  };

  useEffect(() => {
    const interval = setInterval(changeImage, 75000);
    return () => clearInterval(interval);
  }, []);

  return (
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
        height: 168,
        borderRadius: 10,
        objectFit: 'cover',
        opacity: visible ? 0.65 : 0,
        filter: 'saturate(0.9)',
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: -1,
        transition: 'opacity 0.6s ease',
      }}
    />
  );
}
