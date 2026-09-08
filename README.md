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

- **Site geneli erişim koruması** (bkz. Güvenlik bölümü): tüm sayfalar ve
  API uç noktaları (GitHub Actions'ın `CRON_SECRET` ile çağırdığı iki uç
  nokta hariç) tek bir paylaşılan parola (`SITE_PASSWORD`) + imzalı bir
  oturum çerezi arkasında. Çoklu kullanıcı/hesap sistemi değil.
- Ekleme/işaretleme gibi tüm değişiklikler tarayıcının `localStorage`'ında
  saklanır — hesap/oturum yok, tek profilli ve tamamen yerel. İstisna:
  fotoğraflar artık Cloudinary'de tutuluyor (aşağıya bakın), localStorage'da
  sadece bunların URL'i duruyor.
- Ekran geçişleri URL hash'i ile senkronize (`#growth`, `#learn/0` gibi), bu
  yüzden geri/ileri tuşları ve doğrudan bağlantılar çalışır.
- Fotoğraf yükleme (Merak Konuları/Proje Fikirleri): istemci görseli önce
  küçültür (`src/lib/image.ts`), sonra `/api/upload-image` üzerinden
  Cloudinary'ye yükler ve dönen kalıcı URL'i kaydeder. Bu uç nokta hem
  `npm run dev` hem production'da çalışır (bkz. `vite.config.ts` ve
  `server.js`) — Cloudinary ortam değişkenleri tanımlı değilse yükleme
  503 ile başarısız olur ve kullanıcıya inline bir hata gösterilir.
- Günlük Telegram bildirimi: `server.js`'teki `/api/notify/daily` uç
  noktası, GitHub Actions'taki zamanlanmış bir workflow (bkz.
  `.github/workflows/daily-telegram-notify.yml`) tarafından her gün
  tetiklenir ve o günkü yaklaşan programları Telegram'a gönderir.
- Program Keşfi (Home > "Keşfedilen programlar"): haftalık bir GitHub
  Actions workflow'u (`discover-programs.yml`) SerpApi ile önceden
  tanımlanmış anahtar kelimeleri tarar, yeni sonuçları Upstash Redis'e
  kaydeder. Profil filtresi (alakasız mühendislik dallarını eleme) o anda
  UYGULANMAZ — uygulama Ollama'nın erişilebilir olduğu bir cihazda
  açıldığında arka planda otomatik olarak yapılır (Aşama 12'deki
  gecikmeli özetleme kuyruğuyla aynı desen); alakalı bulunan yeni sonuçlar
  hem uygulamada listelenir hem de tek bir toplu Telegram mesajıyla
  bildirilir.

## Yayına alma (deployment)

Uygulama statik bir site değil — `server.js` derlenmiş `dist/` klasörünü
sunar VE Google Calendar'ın gizli iCal adresini sunucu tarafında proxy'ler
(CORS yüzünden tarayıcı buna doğrudan istek atamıyor). Bu yüzden Render
veya Railway'de **"Web Service" / "Node" tipinde** bir servis olarak
deploy edilmeli — salt statik site barındırma (ör. GitHub Pages) Google
Calendar senkronizasyonunu çalıştırmaz.

**Build/start komutları:**

```
Build command: npm install && npm run build
Start command: npm start
```

**Ortam değişkenleri** (hosting panelinden eklenir, kod içinde yazılmaz):

| Değişken                 | Zorunlu mu | Açıklama |
|--------------------------|------------|----------|
| `GCAL_ICS_URL`           | Hayır      | Google Calendar > Ayarlar > (takvim) > "Takvimi entegre et" > "iCal formatındaki gizli adres". Ayarlanmazsa uygulama normal çalışır, sadece takvim senkronizasyonu pasif kalır. |
| `PORT`                   | Hayır      | Çoğu platform bunu otomatik ayarlar; `server.js` `process.env.PORT`'u okur, yoksa `3000`'e düşer. |
| `CLOUDINARY_CLOUD_NAME`  | Hayır*     | Cloudinary Dashboard'dan alınır. Fotoğraf yükleme için gerekli — tanımlı değilse fotoğraf ekleme başarısız olur (uygulamanın geri kalanı etkilenmez). |
| `CLOUDINARY_API_KEY`     | Hayır*     | Cloudinary Dashboard'dan alınır. |
| `CLOUDINARY_API_SECRET`  | Hayır*     | Cloudinary Dashboard'dan alınır — asla istemciye gönderilmez, sadece sunucu tarafında kullanılır. |
| `TELEGRAM_BOT_TOKEN`     | Hayır*     | @BotFather ile oluşturulan bot token'ı. Günlük Telegram bildirimi için gerekli. |
| `TELEGRAM_CHAT_ID`       | Hayır*     | Bildirimin gideceği sohbetin kimliği. |
| `CRON_SECRET`            | Hayır*     | `/api/notify/daily` VE `/api/discover/scan` uç noktalarını dışarıdan (GitHub Actions) tetiklerken kullanılan paylaşılan sır; GitHub repo secrets'a da aynısı eklenmeli. |
| `SERPAPI_KEY`            | Hayır*     | [serpapi.com](https://serpapi.com) — Program Keşfi taraması için. Ayda 250 ücretsiz sorgu. |
| `UPSTASH_REDIS_REST_URL` | Hayır*     | [upstash.com](https://upstash.com) — Program Keşfi'nin kalıcı deposu (Redis, REST API). |
| `UPSTASH_REDIS_REST_TOKEN` | Hayır*   | Upstash Dashboard > REST API'den alınır. |
| `SITE_PASSWORD`          | **Evet**   | Site geneli giriş parolası. Tanımlı değilse (SESSION_SECRET ile birlikte) site tamamen KORUMASIZ kalır. |
| `SESSION_SECRET`         | **Evet**   | Oturum çerezlerini imzalayan sır — `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` ile üretilir. Değiştirilirse tüm oturumlar aynı anda geçersiz olur. |

\* Uygulamanın temel işlevleri için zorunlu değil, ama ilgili özellik
(fotoğraf yükleme / Telegram bildirimi) bu değişkenler olmadan çalışmaz.
`SITE_PASSWORD`/`SESSION_SECRET` ise **zorunlu** — production'da eksik
bırakılmamalı (bkz. Güvenlik bölümü).

Yerel geliştirmede aynı değişken `.env.local` dosyasından okunur (bkz.
`.env.example`) — bu dosya asla commit edilmez.

**Ollama (yerel AI özetleme)** production'da kullanılamaz — Ollama yalnızca
kendi bilgisayarınızda çalışır, bir hosting sunucusundan erişilemez. Bu
beklenen bir durumdur: uygulama bunu zarifçe algılar ("Yerel AI şu an
kullanılamıyor" mesajı gösterir), hata vermez veya çökmez. "Bir Şey
Öğrendim" girişleri özetsiz kalır.

## Güvenlik

- **Site geneli giriş:** Tek paylaşılan parola (`SITE_PASSWORD`) + imzalı,
  stateless bir oturum çerezi (30 gün). Oturum sunucuda saklanmıyor —
  Render sık sık yeniden başladığı için bellekte tutulan bir oturum
  listesi işe yaramaz. `SESSION_SECRET`'ı değiştirmek tüm oturumları aynı
  anda geçersiz kılar (şüpheli bir erişimden sonra "herkesi çıkışa
  zorlamak" için kullanılabilir).
- IP başına 5 başarısız giriş denemesinden sonra 60 saniyelik kilit
  (bellek içi, Render yeniden başlayınca sıfırlanır — tam bir çözüm değil
  ama otomatik parola denemesini pratik olmaktan çıkarır).
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` başlıkları
  her yanıtta gönderiliyor.
- Günlük (Diary) girişleri gerçekten şifreleniyor: AES-GCM, tarayıcıda
  (Web Crypto API), günlük parolasından PBKDF2 (250.000 iterasyon) ile
  türetilen bir anahtarla. Günlük parolası (site parolasından ayrı, ikinci
  bir katman) hiçbir yerde saklanmıyor — sadece kilit açıkken bellekte.
  Şifreli veri hem `localStorage`'da hem (varsa) senkronize edildiği her
  yerde düz metin değil, base64 bir blob olarak duruyor.
- Ortam değişkenlerinin hiçbiri istemciye (tarayıcıya gönderilen koda)
  sızmıyor — hepsi sadece `server.js`/`vite.config.ts` (Node tarafı) içinde
  okunuyor, build çıktısında aranıp doğrulandı.
- Parola/sır karşılaştırmaları (`SITE_PASSWORD`, `CRON_SECRET`, oturum
  imzası) sabit zamanlı (timing-safe) — `===` yerine
  `crypto.timingSafeEqual` kullanılıyor.
