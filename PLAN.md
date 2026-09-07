# Mühendis Gelişim Portalı — Geliştirme Planı

Bu proje, Claude Design'da tasarımı tamamlanmış bir kişisel dashboard/blog uygulamasının koda dökülmesidir. Aşağıdaki aşamaları sırayla uygula, her aşamayı bitirdiğinde ilgili maddeyi işaretle ve kısa bir özet yaz. Bir aşamayı bitirmeden sıradakine geçme.

## Aşama 0 — Kurulum
- [x] İçe aktarılan tasarım dosyalarını (dc.html, support.js) incele, proje yapısını (React/Vite veya vanilla HTML+JS, hangisiyse) belirle
- [x] `package.json` oluştur / gerekli bağımlılıkları kur
- [x] Yerel geliştirme sunucusunu ayağa kaldır, tasarımın tarayıcıda tasarımdakiyle birebir göründüğünü doğrula
- [x] `.gitignore` dosyasını kontrol et (node_modules, .env dahil olduğundan emin ol)

## Aşama 1 — Temel Yapı ve Navigasyon
- [x] Renk paletini (Soft Blush #FFDBDA, Old Rose #DB7F8E, Pale Slate #D5C5C8, Cool Steel #9DA3A4, Taupe Grey #604D53) global tema/CSS değişkenleri olarak tanımla
- [x] Sol menü: numaralar (00, 01...) olmadan, "Akademik" ve "Kişisel" olarak iki gruba ayrılmış şekilde kur
- [x] Sol menü hover/aktif sayfa durumlarını doğru şekilde ayır (hover = daha koyu ton, aktif sayfa = kalıcı hafif vurgu)
- [x] Sol menüyü daraltılabilir (collapse) yap
- [x] Sayfa geçişlerinde "← Geri" butonu ve tarayıcı geri tuşu uyumluluğu (routing/URL yapısı) kur
- [x] Sol altta Profil alanı (isim, avatar, "yerel model çalışıyor" durumu küçük ikincil satır olarak) oluştur

## Aşama 2 — Ana Sayfa
- [x] İstatistik kartları (gelişim notu sayısı, kesintisiz kayıt, kapanan merak konusu, son girişten bu yana geçen süre) — gerçek verilerden hesaplanacak şekilde
- [x] "Son girişler" listesi
- [x] "Yaklaşan Programlar" kartı + "Program ekle" aksiyonu + "Önerilen Programlar" için boş/placeholder alan
- [x] Üç hızlı ekleme kartı: Linkler, Merak Konuları (tıklanabilir checkbox'larla), Proje Fikirleri — üçünde de hızlı ekleme alanı, Merak Konusu ve Proje Fikri kartlarında fotoğraf ekleme
- [x] Ana sayfaya haftalık/aylık takvim entegrasyonu (bkz. Aşama 9)

## Aşama 3 — Akademik Gelişim & Bir Şey Öğrendim
- [x] Akademik Gelişim: aylık gruplanmış, tarih damgalı kayıt listesi + aylık özet kartı
- [x] Bir Şey Öğrendim: serbest metin giriş formu, kayıt listesi
- [x] Her Bir Şey Öğrendim girişinin altında sayfa sonunda tıklanabilir "Bağlantılı: Akademik Gelişim · [ay]" butonu (üstte tekrar eden linkler ve breadcrumb olmadan)
- [x] Modül sayfası başlıklarının altındaki açıklama cümlelerini kaldır (Akademik Gelişim/Bir Şey Öğrendim'de zaten yoktu — Günlük'teki kilit ekranı Aşama 7'de ele alınacak)

## Aşama 4 — Linkler
- [x] Kategori filtreleri (Tümü, GitHub, Ders notu, Makale, Araç, Okunmadı) — klasik/serif veya sade sans-serif font, monospace değil
- [x] Link kartına tıklanınca "Linke git" / "Detayları gör" seçenekli menü

## Aşama 5 — Yapılacak Projeler & Araştırılacak Konular
- [x] Yapılacak Projeler: basit liste/pano
- [x] Araştırılacak Konular: checklist yapısı — not alma tarihi + tamamlanma tarihi görünür, tamamlananlar Bir Şey Öğrendim'e bağlanabilir

## Aşama 6 — Program Takvimi
- [x] Tarih + kısa açıklama ile program kayıtları
- [x] Hatırlatma mantığı (X gün kaldı gösterimi)

## Aşama 7 — Günlük (Kişisel)
- [x] Şifreli giriş ekranı
- [x] Detaylar için ayrıca konuşulacak, şimdilik temel şifreli yapı yeterli

## Aşama 8 — Şiir (Kişisel)
- [x] Şiirlerin listelendiği sade arşiv görünümü

## Aşama 9 — Takvim (Haftalık/Aylık + Google Calendar)
- [x] Haftalık görünüm: saat satırları, ders/etkinlik blokları — ızgara çizgileri bloklardan görünmeyecek, bloklar kendi saat aralığına tam oturacak (taşma yok)
- [x] Aylık görünüm: gün başına küçük gösterge noktaları
- [x] Aylık görünümde bir güne tıklanınca haftalık görünüme geçmesin — bunun yerine gün detay paneli (drawer/modal) açılsın
- [x] Gün panelinde: saat seçici + not/ders metni girme alanı, mevcut kayıtları silme butonu
- [x] Google Calendar senkronizasyonu — **OAuth yerine gizli iCal linkiyle salt-okunur senkronizasyon** (Zeynep'in kararı, Google Cloud'un ön ödeme istemesi üzerine). İki yönlü senkronizasyon bu yöntemle zaten mümkün değil (salt-okunur feed).
- [x] Takvim bileşenini genel olarak daha geniş/ferah bir düzende kur (saat satırı yüksekliği 56px → 64px)

### Google Calendar senkronizasyonu — teknik notlar
- Gizli iCal adresi `.env.local`'de `GCAL_ICS_URL` olarak duruyor (git'e girmiyor, `.gitignore`'da). `.env.example` boş şablon olarak commit'e girebilir.
- **Bu senkronizasyon SADECE `npm run dev` sırasında çalışır** (bkz. Aşama 12'nin altındaki barındırma notu) — CORS yüzünden tarayıcı Google'a doğrudan istek atamıyor, `vite.config.ts`'teki geliştirme sunucusu proxy'si (`/api/calendar.ics`) bunu çözüyor ama bu proxy statik `vite build` çıktısında yok.
- Tekrarlayan etkinlikler (RRULE) `ical.js` ile genişletiliyor, en fazla 500 tekrar/etkinlik ile sınırlı (sonsuz döngü koruması).
- Yerel notlar ve Google etkinlikleri aynı saate denk gelirse (gerçek takvimle test edilince görüldü) haftalık görünümde gün sütunu ikiye bölünüyor (sol: yerel, sağ: Google) — aksi halde metinler üst üste binip okunaksız oluyordu.
- Aylık görünümdeki noktalar ve gün paneli de Google etkinliklerini gösteriyor (paneldekiler salt-okunur, silme butonu yok, "GOOGLE" etiketiyle ayrılıyor).

## Aşama 10 — Yerel AI Entegrasyonu (Ollama)
- [x] Ollama kurulumu için yönergeler / bağlantı katmanı — Zeynep'te zaten kuruluydu (`llama3.1:8b`), bağlantı katmanı kuruldu
- [x] Bir Şey Öğrendim girişleri kaydedildiğinde otomatik özetleme, özetin Akademik Gelişim'e bağlanması
- [x] Sitede AI işlem detaylarını (örn. "yerel modelle özetlendi, saat X") kullanıcıya göstermeyecek şekilde arka planda tut

### Ollama entegrasyonu — teknik notlar
- Google Calendar'daki gibi aynı sebeple (CORS) Ollama'nın yerel API'sine (`http://localhost:11434`) de doğrudan değil, Vite dev-proxy'si (`/api/ollama`) üzerinden gidiyoruz — `OLLAMA_ORIGINS` ayarıyla uğraşmaya gerek kalmadı. Hedef adres `OLLAMA_URL` ortam değişkeniyle değiştirilebilir (varsayılan `http://localhost:11434`).
- **Bu entegrasyon da SADECE `npm run dev` sırasında çalışır** — ama bunun ötesinde, Ollama zaten yalnızca Zeynep'in kendi bilgisayarında çalıştığı için bu özellik doğası gereği hep yerel kalacak: ileride bir yere yayınlansa bile (bkz. Aşama 12) Ollama'ya erişim ancak Ollama'nın çalıştığı makineden mümkün.
- Model sabit `llama3.1:8b` — `src/lib/ollama.ts`'te `MODEL` sabiti. Bir giriş kaydedilince arka planda çağrılıyor (~10-15 sn sürüyor), özet hazır olunca hem girişin kendi "Yerel model özeti" kutusu doluyor hem de Akademik Gelişim'in bu ayki not listesine gerçek bir kayıt olarak ekleniyor (başlık, ay notu sayısı ve istatistikler otomatik güncelleniyor). Ollama kapalıysa veya zaman aşımına uğrarsa sessizce vazgeçiliyor — kullanıcıya hata gösterilmiyor, giriş özetsiz kalıyor.
- Kenar çubuğundaki "Yerel model" durumu (Aşama 1'de arayüzü hazırlanmıştı) artık gerçek bağlantıyı yokluyor (açılışta + 30 sn'de bir) — bağlıysa yeşil "Yerel model çalışıyor", değilse gri "Yerel model bağlı değil".
- ~~llama3.1:8b bazen özet cümlesine gereksiz bir meta-yorum ekliyordu~~ — **düzeltildi**: `system` talimatı sıkılaştırıldı (net kurallar listesi + "meta-yorum ekleme" yasağı) ve bir güvenlik ağı eklendi (`firstSentenceOnly` — model yine de birden fazla cümle dönerse sadece ilkini alır). Gerçek modelle tekrar test edildi, artık tek ve temiz cümle üretiyor.

## Aşama 11 — Program Keşfi (Otomatik Arama)
**API kararı:** Başlangıçta Brave Search API planlanmıştı ama Zeynep araştırdı: Brave Şubat 2026'dan itibaren yeni kayıtlarda kart bilgisi istiyor ve kredi bitince otomatik ücretlendirmeye geçiyor — gerçek bir ücretsiz katmanı kalmadı. Bunun yerine **SerpApi** kullanılıyor: kart istemeden kayıt, ayda otomatik yenilenen 250 ücretsiz sorgu (`SERPAPI_KEY`, bkz. `.env.example`).
- [ ] SerpApi ile önceden tanımlanmış anahtar kelime listesiyle (Zeynep'ten alınacak — TÜBİTAK, Teknofest, hackathon, bootcamp, üniversite yarışmaları vb. örnek kategoriler) periyodik tarama
- [ ] Bulunan sonuçları veritabanında sakla; daha önce görülenleri tekrar gösterme (deduplication)
- [ ] Kota sınırına yaklaşınca taramayı durdur, bir sonraki periyoda (günlük/haftalık) ertele
- [ ] Yerel model (Ollama) yeni sonuçları kullanıcının Akademik Gelişim içeriğiyle eşleştirip önem sırasına göre önersin
- [ ] İleride değerlendirilecek: anahtar kelimelerin kullanıcı içeriğinden otomatik çıkarılması (şimdilik kapsam dışı)

### Açık mimari sorusu — kalıcı depolama
Bu aşama ilk kez gerçek bir "veritabanı" gerektiriyor: tarama periyodik olarak (muhtemelen GitHub Actions ile, Aşama 15'teki Telegram bildirimiyle aynı desen) tarayıcı hiç açık değilken sunucu tarafında tetiklenecek, dedup listesi taramalar arasında kalıcı olmalı. Ama:
- Uygulamanın tüm verisi bugüne kadar sadece tarayıcının `localStorage`'ında — sunucuda hiç veritabanı yok.
- Render'ın ücretsiz planında disk kalıcı değil (bkz. Aşama 16 — bu yüzden fotoğraflar için Cloudinary'e geçildi), yani sonuçları sunucunun kendi diskine yazmak güvenilir değil.
- Ollama'nın önem sırasına göre önerisi sadece Zeynep'in kendi bilgisayarında (Ollama'nın çalıştığı yerde) mümkün — bu yüzden "tarama" (sunucu/bulut tarafı, otomatik) ile "Ollama'nın sıralaması" (yerel, uygulama açıldığında, Aşama 12'deki gecikmeli kuyruk deseniyle aynı mantık) iki ayrı adım olacak.
- Depolama seçeneği Zeynep ile netleştirilecek (ör. ücretsiz kotalı bir hosted veritabanı mı, git deposunu basit bir JSON "veritabanı" olarak mı kullanmak, yoksa kapsamı daraltıp dedup'ı sadece tarayıcı localStorage'ında mı tutmak — bu sonuncusu sadece uygulama o taramadan sonra açılırsa çalışır, arka planda sürekli doğru dedup garantisi vermez).

## Aşama 12 — Gecikmeli Özetleme Kuyruğu ✅
- [x] Her Bir Şey Öğrendim girişine bir durum alanı ekle: `özetlenmedi` / `özetlendi` — ayrı bir alan yerine mevcut `summary` alanının varlığından türetiliyor (persisted `learnEntries` zaten sadece kullanıcı girişlerini tutuyor, seed girişlerin hepsinde `summary` her zaman dolu — bu yüzden ek/yinelenen bir alan gereksiz olurdu); Learn ekranında özet yoksa küçük bir "özetlenmedi" göstergesi çıkıyor
- [x] Ollama'ya erişilemeyen bir cihazdan girildiğinde giriş sadece `özetlenmedi` durumunda kalıyor — hata gösterilmiyor (mevcut sessiz-vazgeçme davranışı zaten böyleydi, bkz. Aşama 10)
- [x] Uygulama, Ollama'nın erişilebilir olduğu bir cihazda açıldığında (bağlantı kontrolü başarılı olduğunda) arka planda otomatik olarak bekleyen tüm `özetlenmedi` durumundaki girişleri sırayla işliyor — `AppState.tsx`'te mount'ta bir kez `pingOllama()` çağrılıyor, başarılıysa özetlenmemiş girişler sırayla (paralel değil) işleniyor
- [x] Mevcut Ollama proxy yapısı bozulmadı — bu sadece "ne zaman tetiklenir" mantığını ekleyen bir katman
- Gerçek Ollama (llama3.1:8b) çalışırken uçtan uca test edildi: localStorage'a elle özetlenmemiş bir giriş eklenip sayfa yenilendiğinde, kuyruk otomatik olarak özeti üretti, Akademik Gelişim'e gerçek bir kayıt ekledi ve arayüzdeki "özetlenmedi" göstergesi kayboldu.

## Aşama 13 — Yayına Alma (Deployment) ✅ (kod tarafı hazır — deploy'u Zeynep kendi hesabıyla yapacak)
- [x] Build/production konfigürasyonunu kontrol et, gerekirse düzelt (`npm run build` sorunsuz çalışsın)
- [x] Ortam değişkenleri (ör. Google Calendar linki) hem yerel geliştirmede (`.env.local`) hem production'da (hosting servisinin ortam değişkenleri paneli) doğru okunacak şekilde kodu ayarla
- [x] Ollama bağlantısı bulunamadığında (production'da, farklı bir cihazdan erişildiğinde) uygulama çökmesin — sadece "Yerel AI şu an kullanılamıyor" gibi zarif bir mesaj göstersin, hata fırlatmasın
- [x] README.md'ye projenin nasıl deploy edileceğine dair kısa bir not ekle
- [x] Barındırma hedefi: Render/Railway (Zeynep kendi hesabıyla deploy edecek)

### Yayına alma — teknik notlar
- Uygulama artık salt statik bir site değil: yeni `server.js` (Express 5) hem derlenmiş `dist/`'i sunuyor hem de Google Calendar'ın gizli iCal adresini sunucu tarafında proxy'liyor. Render/Railway'de **"Web Service" (Node)** olarak deploy edilmeli — salt statik barındırma (GitHub Pages gibi) Google Calendar senkronizasyonunu çalıştırmaz.
- Build: `npm install && npm run build`. Start: `npm start` (→ `node server.js`, `package.json`'a eklendi).
- Ortam değişkeni `GCAL_ICS_URL`, hosting panelinden ayarlanır — kodda hiçbir yerde sabit yazılı değil. Yerel test için `server.js`, `.env.local`'i kendi başına (harici paket olmadan) okuyan küçük bir yükleyiciyle çalışıyor; production'da bu dosya hiç yok, platform zaten `process.env`'i kendisi dolduruyor.
- Ollama için production'da BİLEREK proxy yok (`/api/ollama/*` gerçek 404 döner) — istemci (`useOllamaStatus`) artık sadece `res.ok`'a değil yanıtın gerçekten `{models: [...]}` şeklinde olup olmadığına da bakıyor (SPA fallback'inin yanlışlıkla "bağlı" sanılmasına karşı ek güvenlik). Bağlı değilken "Yerel AI şu an kullanılamıyor" gösteriyor.
- Gerçek Express sunucusuyla yerelde uçtan uca test edildi: statik site 200, `/api/calendar.ics` gerçek takvim verisini döndü, `/api/ollama/*` ve tanımsız `/api/*` yolları 404, bilinmeyen normal yollar `index.html`'e düşüyor (hash routing kullanıldığı için zaten gerekmiyor ama güvenlik ağı olarak duruyor).
- Express 5 kullanılıyor — bare `'*'` joker artık geçersiz, `'/*splat'` gerekiyor (bu proje için düzeltildi, ileride Express güncellenirse akılda tutulmalı).

### Canlı ortam
- Uygulama Render'da canlı: `personal-dashboard-pb7t.onrender.com`.
- Özel domain `zdemir.tech` DNS doğrulama sürecinde.

## Aşama 15 — Yayın Sonrası Düzeltmeler
**Sıra dışı çalışılıyor:** Aşama 11 ve 12'den önce, hemen ele alınacak — Zeynep canlı sitede test ederken bulundu. Bitince onay alınıp **Aşama 12'ye (Gecikmeli Özetleme Kuyruğu)** geçilecek; Aşama 11 (Program Keşfi) ve 14 daha sonraya kalıyor.

### 1. Fotoğraf yükleme hatası
- [x] Proje Fikirleri ve Merak Konuları kartlarına eklenen fotoğrafların açılmama/görüntülenmeme sorununu incele ve düzelt — kök neden: sıkıştırılmamış telefon fotoğrafları localStorage kotasını doldurup `setItem`'ı sessizce başarısız kılıyordu; `compressImage()` (canvas tabanlı, `src/lib/image.ts`) ile çözüldü, ayrıca kota hatasında görselleri çıkarıp yeniden deneyen bir yedek mekanizma eklendi

### 2. Proje Fikirleri detay sayfası
- [x] Her proje fikri kendi sayfasına/görünümüne açılabilsin: başlık, metin, fotoğraf, checklist (alt görevler), durum güncelleme alanı (planlandı/devam ediyor/tamamlandı) — `entry` route state `number | null` oldu (liste/detay ayrımı için), `src/lib/projects.ts`'te görünüm modeli, `Projects.tsx`'te liste+detay ekranı, tarayıcıda test edildi (durum değişimi, checklist ekle/işaretle, not düzenleme, sayfa yenilemede kalıcılık — hepsi doğrulandı)

### 3. Linkler ↔ Merak Konuları bağlantısı
- [x] Bir merak konusuna bir/birden fazla link eklenebilsin (başlığıyla birlikte); konu görünümünde listelensin ve tıklanabilsin

### 4. Yaklaşan Programlar zenginleştirme
- [x] Her programa not, link ve dosya (ör. şartname PDF'i) eklenebilsin — dosya boyutu 3MB ile sınırlandı

### 5. Takvim düzeltmeleri ve Telegram bildirimi
- [x] "+ Not / ders ekle" butonunu çalışır hale getir (gerçekten not/ders eklenebilsin)
- [x] Telegram bot entegrasyonu: günlük olarak o günün programını (dersler, notlar, yaklaşan program hatırlatmaları) Telegram bildirimi olarak gönder — `server.js`'te `/api/notify/daily` (paylaşılan sır ile korunmalı), GitHub Actions ile her gün 08:00 TR saatinde dışarıdan tetikleniyor (`.github/workflows/daily-telegram-notify.yml`); gerçek bot token/chat ID ile uçtan uca test edildi, gerçek bir Telegram mesajı gönderildi
- [x] Google Calendar'a geri yazma (iki yönlü senkronizasyon) YOK — sadece okuma yönü (mevcut iCal) kalacak, bildirimler Telegram üzerinden
- **Önemli kısıtlama:** Sunucunun kullanıcının kişisel localStorage verisine (kendi eklediği gün notları/programları) erişimi yok — bu yüzden Telegram bildirimi sadece statik `PROGRAMS` listesindeki hatırlatmaları raporlayabiliyor, kullanıcının kendi eklediklerini değil. Gerçek çözüm sunucu taraflı bir veri deposu gerektirir; şimdilik bu sınırlamayla yayınlandı.
- **Zeynep'in yapması gerekenler:** (1) Render production ortam değişkenlerine `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `CRON_SECRET`, `GCAL_ICS_URL` eklenmeli (şimdilik sadece `.env.local`'de var). (2) GitHub repo secrets'a (Settings → Secrets and variables → Actions) `CRON_SECRET` ve `APP_URL` eklenmeli, yoksa workflow çalışmaz.

### 6. Şiir ve Günlük CRUD
- [x] Şiir: yeni ekleme, güncelleme, silme
- [x] Günlük: yeni ekleme, güncelleme, silme — **şifreleme/gerçek kimlik doğrulamaya DOKUNULMADI**, ayrı bir bütünsel güvenlik aşamasında ele alınacak, şimdilik sade CRUD yeterli
- [x] Geri tuşuna basınca günlüğün tekrar kilitlenmediği hatası düzeltildi — `unlocked` artık kalıcı değil, ekran `diary`'den çıkınca otomatik kilitleniyor

### 7. Profil ve kimlik bilgileri
- [x] Placeholder isim ("Deniz Arslan") yerine gerçek isim ("Hatice Zeynep Demir") her yerde
- [x] Ana sayfadaki tarih statik kalmış — sadece karşılama başlığı dinamik/güncel tarihi gösteriyor (Zeynep'in tercihiyle: takvim, istatistikler ve Google Calendar senkron aralığı sabit referans tarihte — 31 Ağustos 2026 — kalıyor)
- [x] Profil düzenleme ekranı (kullanıcının adını değiştirebileceği bir arayüz) — **not:** ilerleyen bir aşamada daha da geliştirilebilir (fotoğraf, unvan vb.)
- [x] Çoklu kullanıcı/hesap ekleme özelliğini tamamen kaldırıldı — tek profilli yapıya sadeleştirildi

**Aşama 15 tamamlandı.** Aşama 12'ye (Gecikmeli Özetleme Kuyruğu) geçmeden önce Zeynep'in onayı bekleniyor.

## Aşama 16 — Fotoğraf Depolamasını Sunucu Tarafına Taşı (Cloudinary) ✅
Zeynep'in isteği: Aşama 15'teki `compressImage()` sıkıştırması geçici bir yama; localStorage'ın kendi boyut sınırı (tarayıcıya göre değişse de tipik 5-10MB) fotoğraf sayısı arttıkça yine dolacaktı. Kalıcı çözüm: fotoğrafları Cloudinary'nin ücretsiz katmanında sakla, localStorage'da sadece dönen URL'i tut.

- [x] Cloudinary hesabı + ücretsiz katman kuruldu, kimlik bilgileri paylaşıldı
- [x] `server.js`'e görsel yükleme uç noktası eklendi (`POST /api/upload-image`) — istemciden gelen görseli (yine `compressImage()`'dan geçirilip küçültülmüş halde) sunucu taraflı Cloudinary SDK ile yüklüyor, dönen güvenli (https) URL'i client'a döndürüyor. API secret client'a hiç gönderilmiyor. Gerçek kimlik bilgileriyle uçtan uca test edildi (curl + tarayıcı akışı) — gerçek bir görsel Cloudinary'ye yüklendi ve geri gelen URL doğrulandı.
- [x] Client tarafında topic/proje fotoğraf akışı güncellendi (`Home.tsx`, `Projects.tsx`): `compressImage()` sonrası base64 artık doğrudan `image` alanına yazılmıyor, önce `/api/upload-image`'a gönderiliyor, dönen URL `image` alanına yazılıyor (`src/lib/upload.ts`)
- [x] Sunucuya ulaşılamazsa/yükleme başarısız olursa kullanıcıya inline bir hata mesajı gösteriliyor ("Fotoğraf yüklenemedi, tekrar dene.") — Ollama'daki gibi sessizce yutulmuyor, çünkü burada fotoğrafın hiç kaydedilmediğini kullanıcı bilmeli
- [x] Mevcut (hâlihazırda localStorage'da base64 olarak duran) fotoğraflar geriye dönük taşınmadı — Zeynep onayladı, sadece bundan sonra eklenenler Cloudinary'ye gidiyor
- [x] `CLOUDINARY_*` ortam değişkenleri `.env.example`'a placeholder olarak, `.env.local`'e gerçek değerleriyle eklendi
- [ ] **Zeynep'in yapması gereken:** Render production ortam değişkenlerine de `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` eklenmeli — eklenmezse production'da fotoğraf yükleme 503 ("image storage not configured") döner.
- Program dosya eklerindeki (PDF, Aşama 15 madde 4) aynı localStorage-kota sorunu bilinçli olarak bu aşamanın kapsamı dışında bırakıldı — ayrı bir iş olarak ele alınabilir.

### Teknik notlar
- **Dev/prod paritesi:** Cloudinary yüklemesi basit bir pass-through proxy olamaz (SDK sunucu tarafında imzalama yapıyor), bu yüzden `vite.config.ts`'e de aynı mantığı tekrarlayan küçük bir dev-only middleware eklendi (`uploadImageDevPlugin`) — böylece fotoğraf ekleme `npm run dev` sırasında da çalışıyor, sadece production'da test etmeye gerek yok. server.js ile vite.config.ts arasında küçük bir mantık tekrarı var (kabul edilebilir, iki dosya da zaten dev/prod ayrımını benzer şekilde yönetiyor).
- **Kasıtlı güvenlik kararı:** `/api/upload-image` bir paylaşımlı sır (Telegram uç noktasındaki `CRON_SECRET` gibi) ile korunmuyor — çünkü tarayıcı normal kullanımda doğrudan bu uç noktaya istek atıyor ve istemci JS'ine gömülecek bir sır zaten herkes tarafından okunabilir olurdu, gerçek bir koruma sağlamazdı. Tek koruma: dosya boyutu sınırı (6MB) ve `data:image/` önekinin doğrulanması. Uygulama tek kullanıcılı olduğu ve gizli bir URL'de barındığı için kabul edilebilir bir risk.

## Aşama 14 — Test ve Yayına Hazırlık ✅
- [x] Tüm modüllerde hover/tıklanabilirlik göstergelerinin (pointer cursor) tutarlı çalıştığını doğrula — tüm `onClick` alan elemanlar taranarak iki eksik bulundu ve düzeltildi: `LinkMenu.tsx` ve `DayPanel.tsx`'teki arka plan (backdrop) katmanları tıklanınca paneli kapatıyordu ama imleç normal okdu; artık `cursor: 'pointer'` eklendi
- [x] GitHub'a düzenli commit/push — bu aşamaya kadar her aşama kendi commit'iyle push edildi
- [x] README.md ile projeyi kısaca belgelendir — Cloudinary/Telegram/GitHub Actions eklerini yansıtacak şekilde güncellendi (ortam değişkenleri tablosu genişletildi, "Notlar" bölümüne fotoğraf yükleme ve günlük bildirim akışları eklendi)
- [x] Barındırma (hosting) stratejisi — **Aşama 13'te Render/Railway olarak netleşti**, bu maddenin geri kalanı orada ele alındı

### Barındırma kararını etkileyecek teknik notlar
- **Google Calendar senkronizasyonu (Aşama 9) geliştirmede sadece Vite dev-proxy ile çalışıyordu.** CORS yüzünden tarayıcı Google'ın iCal adresine doğrudan istek atamıyor. Aşama 13'te bunun için gerçek bir production çözümü kuruldu — detaylar Aşama 13'ün altında.

---
**Not:** Her aşama bitince Zeynep'e kısa bir özet ver (ne yapıldı, hangi dosyalar değişti), sıradaki aşamaya geçmeden önce onay bekle.

**Not:** Konuştuğumuz her önemli teknik kısıtlama/karar/ileride hatırlanması gereken şey, ortaya çıktığı anda (sorulmadan) ilgili aşamanın altına bir not olarak PLAN.md'ye eklenir.
