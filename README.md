# Mühendis Kişisel Gelişim Platformu

Kişisel bir mühendislik gelişim panosu: akademik notlar, "bir şey öğrendim"
girişleri, linkler, günlük, proje fikirleri, program takvimi, şiir ve
araştırılacak konular tek bir yerde.

Bu proje, Claude Design'da hazırlanan bir prototipten (`m-hendis-ki-isel-geli-im-platformu/`
klasöründeki tasarım dosyası) Vite + React + TypeScript ile gerçek bir
uygulamaya dönüştürüldü.

## Geliştirme

```bash
npm install
npm run dev
```

## Derleme

```bash
npm run build
```

## Notlar

- Ekleme/işaretleme gibi tüm değişiklikler tarayıcının `localStorage`'ında
  saklanır — sunucu veya hesap yok, tamamen yerel.
- Ekran geçişleri URL hash'i ile senkronize (`#growth`, `#learn/0` gibi), bu
  yüzden geri/ileri tuşları ve doğrudan bağlantılar çalışır.
