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

**Depolama kararı:** Zeynep hosted bir veritabanı istedi. **Upstash Redis** seçildi (REST API, tek URL + token, şema/migration yok — basit bir "görülen id'ler kümesi + sonuç kaydı" ihtiyacı için Supabase'in tam bir Postgres'inden daha hafif). `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` gerekiyor.

**Kota güvenliği:** Kendi sayacımızı tutmak yerine SerpApi'nin kendi `https://serpapi.com/account.json?api_key=...` uç noktası kullanılıyor (`total_searches_left` alanı) — bu çağrı kota TÜKETMİYOR (test edildi), taramadan önce gerçek kalan miktar sorgulanıp güvenlik payı (20) düşülerek o an taranabilecek anahtar kelime sayısı hesaplanıyor. 28 anahtar kelimelik listenin tamamını haftalık taramak (~28 sorgu/hafta, ayda ~112) zaten 250 sorgu/ay kotasının çok altında — pratikte erteleme mekanizması sadece bir güvenlik ağı, normal koşulda hiç tetiklenmemeli.

### Akış (uçtan uca)
1. **Tarama (GitHub Actions, haftalık, tarayıcı kapalıyken bile çalışır):** `.github/workflows/discover-programs.yml`, `server.js`'teki `CRON_SECRET` korumalı `POST /api/discover/scan` uç noktasını tetikler. Sunucu her anahtar kelime için SerpApi'de arama yapar, sonuçları (başlık/link/özet) Upstash'te `discover:seen` kümesiyle karşılaştırır — daha önce görülmeyen (link'in kısa hash'i id olarak kullanılıyor) her sonuç `discover:items` hash'ine **`özetlenmedi` değil `filtrelenmedi`** durumuyla kaydedilir. **Profil filtresi bu aşamada UYGULANMAZ.**
2. **Gecikmeli profil filtresi (Aşama 12'deki desenin aynısı):** Uygulama Ollama'nın erişilebilir olduğu bir cihazda açıldığında, `AppState.tsx` bekleyen tüm `filtrelenmedi` sonuçları (`GET /api/discover/pending`) çeker, her birini yerel modele "bu ilan kullanıcının profiliyle (Mekatronik Mühendisliği öğrencisi, Marmara Üniversitesi; ilgi alanları: gömülü sistemler, kontrol sistemleri, OpenCV, TensorFlow Lite, Linux, İHA/drone) alakalı mı" diye sorar (`classifyProgramRelevance`, `src/lib/ollama.ts`). Maden/inşaat/kimya gibi tamamen alakasız dallar elenir (`rejected`), kalanlar `relevant` olarak işaretlenir (`POST /api/discover/mark-filtered`, tek bir istekte toplu gönderilir).
3. **Telegram bildirimi (anlık DEĞİL, filtreleme tamamlanınca):** `mark-filtered` uç noktası, yeni `relevant` işaretlenen sonuçları tek bir toplu mesajda (başlık + kısa açıklama + link, listelenmiş) Telegram'a gönderir — birden fazla ayrı mesaj yerine tek mesaj (spam olmasın diye).
4. **Uygulama içi görünüm:** Home sayfasında yeni bir "Keşfedilen Programlar" kartı, `relevant` (ve henüz gizlenmemiş) sonuçları listeler; her birinin yanında "gizle" aksiyonu var (`POST /api/discover/dismiss`).

- [x] SerpApi ile önceden tanımlanmış anahtar kelime listesiyle (Zeynep'ten alındı — hackathon'lar, TÜBİTAK lisans/öğrenci programları, Teknofest yeni kategoriler, staj/mühendislik ilanları; 4 kategori, 28 anahtar kelime, bkz. `server.js` → `DISCOVER_KEYWORDS`) periyodik (haftalık) tarama
- [x] Bulunan sonuçlar Upstash Redis'te saklanıyor; daha önce görülenler (`discover:seen` kümesi, link hash'i) tekrar gösterilmiyor
- [x] Kota sınırına yaklaşınca (SerpApi `account.json` üzerinden gerçek zamanlı kontrol) tarama erken durup kalan anahtar kelimeler bir sonraki periyoda kalıyor
- [x] Profil filtresi Aşama 12'deki gecikmeli kuyruk mantığıyla uygulanıyor — tarama anında DEĞİL, uygulama Ollama'nın erişilebilir olduğu bir cihazda açıldığında; sadece profille alakalı olanlar kullanıcıya gösteriliyor/Telegram'a gidiyor
- [x] Yeni + alakalı bulunan sonuçlar için Telegram'a tek bir toplu mesaj gönderiliyor (ayrı ayrı spam mesaj değil)
- [ ] İleride değerlendirilecek: anahtar kelimelerin kullanıcı içeriğinden otomatik çıkarılması (şimdilik kapsam dışı)

### Teknik notlar
- `/api/discover/scan` (tarama) `CRON_SECRET` ile korunuyor — sunucudan sunucuya (GitHub Actions) çağrılıyor, Telegram uç noktasıyla aynı desen. `/api/discover/pending`, `/api/discover/mark-filtered`, `/api/discover/relevant`, `/api/discover/dismiss` ise `/api/upload-image` ile aynı kasıtlı sınırlamayı taşıyor: bir paylaşımlı sırla korunmuyorlar çünkü tarayıcı bunlara doğrudan istek atıyor ve istemci JS'ine gömülecek bir sır gerçek koruma sağlamazdı. Tek kullanıcılı, gizli bir URL'de barındığı için kabul edilebilir risk.
- Upstash Redis, Supabase yerine seçildi çünkü veri modeli basit (bir id kümesi + küçük JSON kayıtlar) — tam bir Postgres şeması/migration'a gerek yoktu, tek URL + token ile REST üzerinden çalışıyor.
- SerpApi hesabının aylık kullanımını görmek için: `https://serpapi.com/manage-api-key`.
- `/api/discover/scan`, tek bir anahtar kelime araması veya tek bir Upstash yazması başarısız olursa (ör. geçici ağ zaman aşımı) TÜM taramayı iptal etmez — sadece o kelimeyi/sonucu atlayıp devam eder, `errors` sayacında raporlanır. Gerçek bir taramada bu senaryo gerçekten yaşandı (bkz. aşağıdaki doğrulama notu) ve düzeltme sayesinde tarama yine de başarıyla tamamlandı.
- **Bulunan ve düzeltilen bir hata:** İlk uçtan uca testte (aşağıya bakın) Telegram'a 113 öğelik tek bir mesaj gönderilmeye çalışıldı ve Telegram API'si 400 hatasıyla reddetti (mesaj başına ~4096 karakter sınırı aşıldı). Çözüm: `buildDiscoveryMessages()` sonuçları bu sınırın altında kalacak şekilde birden fazla mesaja bölüyor — normal koşulda (haftada birkaç yeni sonuç) yine tek mesaja sığar, sadece anormal büyük bir toplu bildirimde birkaç parçaya ayrılır (spam'den farklı: "her sonuç ayrı mesaj" değil, "sınırı aşan büyük mesaj birkaç parçaya bölünür").

### Uçtan uca doğrulama (gerçek kimlik bilgileriyle, 2026-09-08 gecesi)
Zeynep'in Upstash bilgilerini vermesinin ardından gerçek bir tarama çalıştırılıp tüm zincir doğrulandı:
- **Tarama:** 28 anahtar kelimenin 27'si başarıyla tarandı (1'i SerpApi'de geçici bir zaman aşımına uğradı, `errors` sayacına yansıdı, tarama yine de tamamlandı — yukarıdaki dayanıklılık düzeltmesi sayesinde). 224 yeni (daha önce görülmemiş) sonuç Upstash'e kaydedildi.
- **Profil filtresi:** Gerçek Ollama (llama3.1:8b) ile 223/224 sonuç sınıflandırıldı (1'i belirsiz yanıt verdi, `filtrelenmedi` durumunda bırakıldı — bir sonraki açılışta otomatik tekrar denenecek, tam da tasarlandığı gibi). 113 sonuç `relevant` (alakalı), 110 sonuç `rejected` (alakasız) olarak işaretlendi.
- **Telegram:** Yukarıdaki karakter sınırı hatası bulunup düzeltildikten sonra, 113 alakalı sonuç 10 ayrı mesaja bölünüp başarıyla gönderildi (hepsi gerçek `message_id` ile onaylandı).
- **Uygulama içi görünüm:** Home sayfası 113 öğeyi doğru şekilde listeledi; "gizle" aksiyonu hem arayüzden kaldırdı hem de sunucu tarafında kalıcı olarak işaretledi (tekrar sorgulanınca 112 döndü).
- **Not:** Bu ilk çalıştırmadaki 113/10 mesajlık hacim, test sırasında art arda iki tam tarama çalıştırılıp birikmiş kuyruğun tek seferde temizlenmesinden kaynaklanıyor — normal haftalık işleyişte yeni bulunan alakalı sonuç sayısı çok daha az olacağı için pratikte neredeyse her zaman tek mesaj yeterli olacak.

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
- ~~Kasıtlı güvenlik kararı: `/api/upload-image` bir paylaşımlı sır ile korunmuyordu...~~ — **artık geçerli değil, bkz. Aşama 17.** Aşama 17'deki site geneli oturum koruması sayesinde bu uç nokta (ve diğer tüm `/api/*` uç noktaları, GitHub Actions'ın çağırdıkları hariç) zaten oturum çerezi olmadan hiç çağrılamıyor.

## Aşama 14 — Test ve Yayına Hazırlık ✅
- [x] Tüm modüllerde hover/tıklanabilirlik göstergelerinin (pointer cursor) tutarlı çalıştığını doğrula — tüm `onClick` alan elemanlar taranarak iki eksik bulundu ve düzeltildi: `LinkMenu.tsx` ve `DayPanel.tsx`'teki arka plan (backdrop) katmanları tıklanınca paneli kapatıyordu ama imleç normal okdu; artık `cursor: 'pointer'` eklendi
- [x] GitHub'a düzenli commit/push — bu aşamaya kadar her aşama kendi commit'iyle push edildi
- [x] README.md ile projeyi kısaca belgelendir — Cloudinary/Telegram/GitHub Actions eklerini yansıtacak şekilde güncellendi (ortam değişkenleri tablosu genişletildi, "Notlar" bölümüne fotoğraf yükleme ve günlük bildirim akışları eklendi)
- [x] Barındırma (hosting) stratejisi — **Aşama 13'te Render/Railway olarak netleşti**, bu maddenin geri kalanı orada ele alındı

### Barındırma kararını etkileyecek teknik notlar
- **Google Calendar senkronizasyonu (Aşama 9) geliştirmede sadece Vite dev-proxy ile çalışıyordu.** CORS yüzünden tarayıcı Google'ın iCal adresine doğrudan istek atamıyor. Aşama 13'te bunun için gerçek bir production çözümü kuruldu — detaylar Aşama 13'ün altında.

## Aşama 17 — Güvenlik ✅
**Öncelik/aciliyet notu:** Site artık `zdemir.tech` üzerinden herkese açık — bugüne kadar ertelenen güvenlik konuları (günlük şifrelemesi hariç zaten yoktu) aciliyetli hale geldi. Dört maddenin hepsi tamamlandı ve gerçek testlerle doğrulandı.

### 1. Site geneli erişim koruması ✅
- [x] Tek paylaşılan parola (`SITE_PASSWORD`, çoklu kullanıcı/hesap sistemi DEĞİL) — imzalı, stateless bir oturum çerezi (`mgp_session`, 30 gün, `HttpOnly` + `SameSite=Lax` + isteğin gerçekten https olup olmadığına göre `Secure`) ile hatırlanıyor. Oturum durumu sunucuda TUTULMUYOR (Render sık yeniden başladığı için bellek içi bir oturum listesi işe yaramazdı) — çerezin kendisi `SESSION_SECRET` ile HMAC imzalı; `SESSION_SECRET` değişirse tüm oturumlar aynı anda geçersiz olur.
- [x] Koruma olmadan hiçbir sayfa veya API uç noktası erişilebilir değil (CRON_SECRET korumalı iki uç nokta hariç, aşağıya bakın) — `server.js`'in en başında, tüm route'lardan önce çalışan bir middleware bunu sağlıyor.
- [x] IP başına 5 başarısız giriş denemesinden sonra 60 saniyelik kilit (bellek içi, tam bir çözüm değil ama otomatik deneme yapmayı pratik olmaktan çıkarıyor).
- [x] Temel güvenlik başlıkları (`X-Frame-Options: DENY` — giriş formunun bir iframe'e gömülüp tıklama kaçırmaya açık olmaması için, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`) her yanıtta gönderiliyor.
- Gerçek tarayıcı testiyle doğrulandı: yanlış parola reddediliyor, doğru parola oturum açıyor, sayfa yenilemede oturum kalıyor, 6. yanlış deneme 429 alıyor, güvenlik başlıkları giriş sayfasında da mevcut.

### 2. API uç noktalarının korunması ✅
- [x] `/api/discover/*`, `/api/upload-image`, `/api/calendar.ics` dahil TÜM API uç noktaları artık madde 1'deki oturum çerezi olmadan çağrılamıyor (401 döner) — Cloudinary/SerpApi/Telegram kotasının kimliği doğrulanmamış kişilerce tüketilmesi engellendi.
- [x] `/api/notify/daily` ve `/api/discover/scan` İSTİSNA — bunlar GitHub Actions tarafından `CRON_SECRET` başlığıyla çağrılıyor (tarayıcı çerezi olamazlar), kendi sır kontrolleri zaten vardı ve hâlâ geçerli. Bu iki yolun listesi (`CRON_ONLY_PATHS`) oturum middleware'inde açıkça tanımlı.
- [x] `CRON_SECRET` karşılaştırması da (parola karşılaştırmasıyla tutarlı olsun diye) sabit zamanlı hale getirildi.
- Gerçek testle doğrulandı: oturumsuz `/api/discover/scan` (CRON_SECRET ile) hâlâ 200 dönüyor, oturumsuz diğer her şey 401.

### 3. Günlük modülü gerçek şifreleme ✅
- [x] Günlüğün sahte kilit ekranı gerçek bir korumaya çevrildi: kullanıcının belirlediği bir günlük parolası (site parolasından ayrı, ikinci bir katman) — ilk kurulumda parola + onay istenir, mevcut (Aşama 15'ten kalma düz metin) girişler o anda şifrelenir.
- [x] Şifreleme gerçek: AES-GCM (Web Crypto API, tarayıcıda), anahtar günlük parolasından PBKDF2 (250.000 iterasyon, SHA-256) ile türetiliyor. Parolanın kendisi hiçbir yerde saklanmıyor — doğrulama, bilinen bir metnin ("canary") şifreli hâlini çözmeye çalışarak yapılıyor (yanlış anahtarla AES-GCM'in kimlik doğrulama etiketi uyuşmuyor, güvenilir bir "yanlış parola" sinyali).
- [x] Günlük girişleri `localStorage`'da düz metin değil, şifreli (base64) olarak duruyor — gerçek localStorage içeriği okunarak doğrulandı.
- [x] Kilit açıkken türetilen anahtar ve çözülmüş metinler SADECE bellekte (transient React state) — kilitlenince (manuel "kilitle" veya ekrandan çıkış) ikisi de atılıyor, sayfa yenilemesinde de kaybolur (kalıcı değil, kasıtlı).
- Gerçek tarayıcı testiyle doğrulandı: ilk kurulum, parola uyuşmazlığı hatası, şifreli saklama (ham localStorage kontrolü), yeni giriş ekleme, kilitle/aç döngüsü, yanlış parola reddi, sayfa yenilemesinde tekrar kilitlenme.

### 4. Genel açık taraması ✅
- [x] `import.meta.env`/`process.env` taraması: hiçbir ortam değişkeni/sır `src/` altında (tarayıcıya giden kod) kullanılmıyor; derlenmiş `dist/` bundle'ında da hiçbir sır değeri veya env var adı bulunmuyor (grep ile doğrulandı).
- [x] `dangerouslySetInnerHTML`, `eval`, `new Function` — hiçbiri kullanılmıyor.
- [x] **Bulunan ve düzeltilen küçük bir tutarsızlık:** Home.tsx'teki "Keşfedilen programlar" linkleri (`p.link`, SerpApi'den gelen — düşük risk ama savunma amaçlı), Topics.tsx/CalendarScreen.tsx'teki kullanıcı linklerinin aksine `http` önek kontrolünden geçmiyordu. Tutarlılık için aynı korumayı ekledik (`p.link.startsWith('http') ? p.link : https://${p.link}`).
- [x] `res.cookie(...)`'daki `secure` bayrağı başta `NODE_ENV === 'production'`e bakıyordu — Render'ın bunu her zaman doğru ayarlayacağı garanti değil. `req.secure`'a (Express'in `trust proxy` ile `X-Forwarded-Proto`'dan doğru hesapladığı) bakacak şekilde düzeltildi.
- [x] Redis komutları (Upstash) her zaman ayrı dizi elemanları olarak gönderiliyor, string birleştirme yok — komut enjeksiyonu riski yok.
- [x] `.gitignore`, derlenmiş `dist/` ve `.env.local` dahil tüm sır dosyalarını doğru şekilde dışlıyor — tüm oturum boyunca tekrar tekrar doğrulandı, hiçbir sır commit'e girmedi.
- Rapor edilen ama KASITLI OLARAK değiştirilmeyen (düşük öncelik/kapsam dışı): site geneli oturumdan manuel "çıkış yap" (logout) butonu yok — 30 gün sonra kendiliğinden düşer, `SESSION_SECRET` değiştirilerek elle de zorlanabilir. `Content-Security-Policy` başlığı eklenmedi — Cloudinary/Google Fonts gibi harici kaynaklar kullanıldığı için dikkatli test gerektirir, bu aşamanın kapsamı dışında bırakıldı.

### Zeynep'in yapması gerekenler
- Render production ortam değişkenlerine `SITE_PASSWORD` (kendi belirleyeceği güçlü bir parola) ve `SESSION_SECRET` (rastgele bir sır) eklenmeli — **bunlar olmadan site PRODUCTION'DA KORUMASIZ kalır.**
- `.env.local`'de şu an yer tutucu bir `SITE_PASSWORD` (`degistir-lutfen-2026`) ve test için üretilmiş bir `SESSION_SECRET` var — yerel geliştirmede kullanılabilir ama gerçek/production parolası bambaşka olmalı.
- Günlüğe ilk girişte kendi belirleyeceğin bir günlük parolası istenecek (site parolasından farklı olabilir/olmalı) — bunu unutursan mevcut günlük girişlerine bir daha erişemezsin, arayüzde bu konuda uyarı var.

---
**Not:** Her aşama bitince Zeynep'e kısa bir özet ver (ne yapıldı, hangi dosyalar değişti), sıradaki aşamaya geçmeden önce onay bekle.

**Not:** Konuştuğumuz her önemli teknik kısıtlama/karar/ileride hatırlanması gereken şey, ortaya çıktığı anda (sorulmadan) ilgili aşamanın altına bir not olarak PLAN.md'ye eklenir.
