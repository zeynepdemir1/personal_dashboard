import { useEffect, useState } from 'react';
import { randomBackground } from '../lib/backgrounds';

// PLAN.md Aşama 19 madde 9: sade tasarım dilini bozmayacak, dikkat
// dağıtmayan bir dekoratif unsur. Sidebar'ın (nav listesiyle profil kartı
// arasındaki boş alanda) bir çocuğu olarak, MUTLAKA konumlandırılmış
// (absolute) render ediliyor — Sidebar'ın kendisi `position: sticky`
// olduğu için kendi yığın (stacking) bağlamını oluşturuyor, bu da negatif
// z-index'in burada (aksine, sayfanın kök seviyesinde değil) gerçekten
// "arkada" göstermesini sağlıyor: aside'ın kendi arkaplanının önünde ama
// nav satırlarının/metinlerinin arkasında kalıyor. Sayfa her açıldığında
// rastgele bir fotoğraf seçiliyor, üstüne belirli bir aralıkla (75 sn)
// yumuşak bir geçişle değişiyor. `pointerEvents: 'none'` sayesinde hiçbir
// tıklamayı/etkileşimi engellemiyor.
export function BackgroundAccent() {
  const [src, setSrc] = useState(() => randomBackground());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSrc((cur) => randomBackground(cur));
        setVisible(true);
      }, 600);
    }, 75000);
    return () => clearInterval(interval);
  }, []);

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: 150,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 130,
        height: 130,
        borderRadius: '50%',
        objectFit: 'cover',
        opacity: visible ? 0.18 : 0,
        filter: 'saturate(0.85)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: -1,
        transition: 'opacity 0.6s ease',
      }}
    />
  );
}
