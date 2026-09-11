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

## Aşama 18 — Mobil Görünüm Düzeltmeleri ✅
Zeynep telefonda test ederken 3 görsel hata buldu — hepsi gerçek mobil viewport emülasyonuyla (375-430px) doğrulanıp düzeltildi.

- [x] **Akademik Gelişim'de kart/liste üst üste binmesi:** Aylık özet kartı (`position: sticky`) masaüstündeki iki sütunlu düzen için doğruydu — kart sol sütunda sabit kalırken sağdaki not listesi kayıyordu. Tek sütuna indiğinde (mobil) kart ve liste AYNI sütunda üst üste yığıldığı için sticky, kartın liste kaymasının üstünde asılı kalıp metinlerin iç içe geçmesine yol açıyordu. Düzeltme: `narrow` iken `position: static`'e dönülüyor (`Growth.tsx`).
- [x] **Sidebar içeriği sıkıştırıyordu:** Sidebar `position: sticky` ile flex akışında gerçek yer kaplıyordu — telefon genişliğinde açılınca `main` (flex:1) orantısız daralıyordu. Yeni bir `MOBILE_BREAKPOINT` (640px) eşiğinde sidebar artık `position: fixed` bir overlay/drawer: içeriği hiç itmiyor, üzerine kapanıyor, arkasında karartan bir backdrop var, dışına tıklayınca veya bir sayfaya geçince kendiliğinden kapanıyor (`Sidebar.tsx`, `App.tsx`).
  - Bulunan ek sorun: `sidebarOpen` varsayılanı (`true`) masaüstü içindi — telefonda ilk açılışta tüm ekranı kaplayan bir panelle karşılanmaya yol açıyordu. `loadPersisted()`'da ilk render'da doğrudan hesaplanacak şekilde düzeltildi (bir effect'le SONRADAN kapatmak yerine — bu, açılıp hemen kapanan görünür bir "flaş" yapıyordu).
- [x] **Genel responsive tarama (375-430px, Ana Sayfa/Akademik Gelişim/Bir Şey Öğrendim/Linkler/Takvim + Projeler/Konular/Şiir/Günlük):**
  - Akademik Gelişim'deki filtre pilleri (`Tümü/Kontrol/Gömülü/...`) satırı sarmıyordu, "42 not · 9 ay" ile birlikte 390px'te 33px taşıyordu — `flexWrap: 'wrap'` eklendi.
  - Home'daki haftalık takvim ızgarası (7 gün + saat sütunu) mobilde `1fr` sütunlara sıkışınca her gün ~40px'e düşüp tamamen okunaksız oluyordu — ızgara küçültülmek yerine sabit minimum genişlik (700px) alıyor ve SADECE bu widget yatay kaydırılabilir (`overflowX: auto`); sayfanın geri kalanı yatayda kaymıyor (aylık görünüm zaten mobilde sorunsuzdu, dokunulmadı).
  - iOS Safari, font-size'ı 16px altında olan bir metin alanına odaklanınca sayfayı otomatik yakınlaştırıyor — tasarımın çoğu alanı 12.5-15px kullandığı için `index.css`'e sadece ≤640px'te geçerli, `input/textarea/select` için 16px alt sınırı eklendi (masaüstü tasarım boyutlarına dokunulmadı).
  - **Bulunan ek sorun (ekran görüntüsüyle yakalandı):** Sabit konumlu sidebar-açma düğmesi (üst-sol köşe), dar/telefon genişliklerinde dolgu küçüldükçe sayfanın İLK satırıyla (Ana Sayfa'da tarih başlığı "8 Eylül 2026 · Salı", diğer ekranlarda "← Geri") yatay olarak çakışıp metni kesiyordu. Kalıcı çözüm: tek tek her bileşeni yamalamak yerine, dar genişliklerde `main`'in üst dolgusu düğmenin altını (y:54) temizleyecek kadar artırıldı (`App.tsx`) — düğme artık içeriğin ÜSTÜNDEKİ boş alanda duruyor, hangi ekran olursa olsun.
- Gerçek mobil viewport emülasyonuyla (iPhone 12, 375/390/414/430px) uçtan uca doğrulandı: hiçbir ekranda yatay taşma yok, sidebar drawer açılış/kapanış/otomatik-kapanma çalışıyor, masaüstü davranışı (sidebar sabit sütun, açık varsayılan) etkilenmedi, ekran görüntüleriyle görsel olarak da teyit edildi.

## Aşama 19 — Kullanıcı Deneyimi Düzeltmeleri ✅

### 1. Linkler — "Detayları gör" boştu ✅
- [x] "Detayları gör" artık `app.closeLinkMenu`'yu çağırıp hiçbir şey yapmıyordu — düzeltildi. Menü artık `linkDetailOpen` durumuna geçip kartın tüm alanlarını (kategori, tarih, not, etiketler, URL) gösteren bir detay görünümü açıyor; "Kapat" ayrı bir buton olarak eklendi (`LinkMenu.tsx`, `AppState.tsx` → `LinkMenuData`).

### 2. Keşfedilen Programlar — ayrı sayfa + carousel + gerçek açıklama ✅
- [x] Sol menüye ayrı bir "Keşfedilen Programlar" sayfası eklendi (`Discover.tsx`, `discover` ekranı) — sonuçlar mevcut tarama kategorilerine (hackathon/TÜBİTAK/Teknofest/staj) göre gruplanıp gösteriliyor.
- [x] Son başvuru/geçerlilik tarihi geçmiş sonuçlar otomatik elenir — bu filtre `GET /api/discover/relevant` uç noktasında sunucu tarafında uygulanıyor (aynı `daysLeftReal()` mantığı, gerçek bugünün tarihine göre), yani hem sayfa hem Ana Sayfa widget'ı her zaman güncel; ayrı bir temizleme cron'u gerekmiyor.
- [x] Ana Sayfa widget'ı artık dörderli gruplar halinde, ‹/› oklarıyla gezilebilen bir carousel (`DiscoveredProgramsWidget`, `Home.tsx`) — kategoriye göre değil, tarihe göre sıralı (bilinen son başvuru tarihi olanlar önce, en yakın en üstte; tarihsiz olanlar en sona). Net bir başlığı var: **"Senin İçin Bulduklarımız"** (dedicated sayfanın başlığı — "Keşfedilen Programlar" — ile bilerek farklı, ikisi ayrı yerler).
- [x] Açıklama metni artık ham/kesilmiş URL değil — Ollama'nın ürettiği gerçek, doğal bir cümle. **Teknik detay:** SerpApi'nin snippet'i incelendi (375 gerçek kayıt üzerinde) ve pratikte URL-kesiği sorunu neredeyse yoktu (%0 boş, ~%1 URL-ish), ama Zeynep'in gözlemi doğru bir riski işaret ediyordu — bazı snippet'ler yarım cümle/ellipsis'li. Çözüm: zaten her sonuç için bir Ollama çağrısı yapılıyorken (profil filtresi), AYNI çağrıdan bir açıklama da üretiliyor (bkz. madde altında "Ollama analiz birleştirmesi") — ekstra çağrı maliyeti yok.

### 3. Keşfedilen programlardan takip etme ✅
- [x] Her sonucun yanına "+ Takip et" eklendi (`Discover.tsx` ve Ana Sayfa widget'ında) — tıklanınca `app.followDiscoveredProgram(program)` çağrılıyor: program, Program Takvimi'ne (`extraPrograms`) gerçek bir kayıt olarak ekleniyor (`title`, `date` ← Ollama'nın çıkardığı son başvuru tarihi (yoksa bugün), `note` ← Ollama'nın açıklaması, `link`), kullanıcı elle hiçbir şey girmiyor, sonradan Program Takvimi ekranından düzenlenebilir. Takip edilen sonuç Program Keşfi listesinden de kalkıyor (aynı `dismissProgram` çağrısıyla) — iki yerde tekrar etmesin.

### Ollama analiz birleştirmesi (madde 2 + 3'ün ortak temeli)
`classifyProgramRelevance()` → `analyzeDiscoveredProgram()` oldu (`src/lib/ollama.ts`) — AYNI tek çağrıda üç şey birden çıkarılıyor: profil alakası (EVET/HAYIR), son başvuru tarihi (GG.AA.YYYY veya YOK), kısa açıklama (1 cümle). Format, gerçek Ollama ile 4 test senaryosunda (TÜBİTAK, maden mühendisliği, Baykar/İHA, Teknofest) iteratif olarak doğrulanıp sağlamlaştırıldı — ilk deneme model satırlara "1. satır:" gibi etiketler ekliyordu ve tarihi ay adıyla ("18 Kasım") yazıyordu, prompt'a somut bir örnek yanıt eklenince (few-shot) ikisi de düzeldi. Sonuç: `discover:items` kayıtlarına artık `deadline`/`description` alanları da yazılıyor (`server.js` → `/api/discover/mark-filtered`); Telegram bildirimi de artık ham snippet yerine bu açıklamayı kullanıyor.

### 4. Render uyku ekranı — keep-alive ile tamamen kaldırıldı ✅
- [x] Yeni `.github/workflows/keep-alive.yml` — her 10 dakikada bir (`*/10 * * * *`) siteye hafif bir GET isteği atıyor, Render hiç uykuya girmiyor, markalı "cold start" ekranı hiç görünmüyor. `APP_URL` dışında yeni bir secret gerekmiyor (mevcut secret'ı yeniden kullanıyor); auth middleware'inden geçmesi/401 alması sorun değil, Render'ın "aktivite" sayması için isteğin ulaşması yeterli.

### 5. Program Keşfi sıklığı — durum raporu ✅
- [x] **Zaten haftalık** (`discover-programs.yml` → `cron: '0 6 * * 1'`, her Pazartesi 09:00 TR saati) — herhangi bir değişiklik GEREKMEDİ. Hesap: 28 anahtar kelime × ~4,33 hafta/ay ≈ 121 sorgu/ay, SerpApi'nin 250/ay ücretsiz kotasının sadece ~%48'i — güvenli bir marj var, round-robin/kelime azaltma gerekmiyor. Gerçek durum (kontrol tarihinde): bu ay 56/250 sorgu kullanılmış, 194 kalmış, kota 2026-10-07'de yenileniyor.

### 6. README'deki "merkezi veritabanı değil" açıklaması ✅
- [x] README'ye "hangi veri nerede duruyor" tablosu eklendi: kişisel içerik (notlar/günlük/linkler/vb.) → `localStorage` (tarayıcıya özel); Program Keşfi sonuçları → Upstash Redis (tarayıcı kapalıyken de yazılabilmeli); fotoğraflar → Cloudinary (localStorage'a sığmayacak kadar büyükler). Pratik sonucu da açıkça yazıldı: farklı bir cihaz/tarayıcıdan girilince kişisel içerik karşı tarafta görünmez.
  - **GÜNCELLEME (Aşama 20):** Bu satır artık geçerli değil — kişisel içerik de Upstash Redis'e taşındı, cihazlar arası senkronizasyon artık ÇALIŞIYOR. Bkz. Aşama 20, README güncellendi.

### 7. Çıkış Yap butonu ✅
- [x] `POST /api/logout` eklendi (`server.js`) — oturum çerezini temizler. Profil dropdown'ına "Çıkış yap" eklendi (`Sidebar.tsx`) — tıklanınca bu uç noktayı çağırıp sayfayı yeniden yüklüyor, çerez gidince giriş ekranı geliyor.

### 8. Profil fotoğrafı ✅
- [x] `PersistedState.profilePhoto` eklendi. Profil düzenleme formuna "+ fotoğraf ekle" eklendi (`Sidebar.tsx`) — Home.tsx'teki fotoğraf akışıyla AYNI mekanizma (`compressImage` → `uploadImage` → Cloudinary). Avatar artık fotoğraf varsa onu, yoksa baş harfleri gösteriyor.

### 9. Rastgele değişen arka plan fotoğrafları ✅
- [x] Zeynep'in `resim/` klasörüne koyduğu 12 fotoğraf `public/backgrounds/`'a (temiz dosya adlarıyla) kopyalandı — kaynak `resim/` klasörü olduğu gibi bırakıldı ama commit'e girmiyor (`.gitignore`), sadece kopyalar (`public/backgrounds/`) versiyon kontrolünde.
- [x] Yeni `BackgroundAccent` bileşeni (`src/components/BackgroundAccent.tsx`) — Sidebar'ın nav listesiyle profil kartı arasındaki boş alanda, %18 opaklıkta, küçük (130px) bir dairesel görsel. Sayfa her açıldığında rastgele seçiliyor, 75 saniyede bir yumuşak bir geçişle değişiyor. **Teknik not:** Bunu doğru "arkada" göstermek göründüğünden zor çıktı — sayfanın KÖK seviyesinde `position:fixed` + negatif z-index denendiğinde `body`'nin kendi opak arkaplanının ardında tamamen KAYBOLUYORDU (CSS'in katmanlama sırası: negatif z-index'li konumlanmış öğeler, konumlanmamış (static) kardeşlerin arkaplanından ÖNCE/altta boyanır). Çözüm: görseli Sidebar'ın (`position: sticky`/`fixed`, kendi yığın bağlamını oluşturan) bir ÇOCUĞU olarak, `position: absolute` + negatif z-index ile yerleştirmek — bu durumda negatif z-index sadece Sidebar'ın KENDİ alt ağacı içinde geçerli oluyor, aside'ın arkaplanının önünde ama nav metinlerinin arkasında doğru şekilde duruyor.
- [x] İleride otomatik/AI üretilen görsellere geçiş ayrı bir gelecek aşaması olarak not edildi (bkz. "Gelecek fikirleri" bölümü, en altta).
- [x] **Ek düzeltme (Zeynep'in geri bildirimiyle, iki turda):** İlk sürüm çok silik ve tam daire (border-radius: 50%) duruyordu — dikdörtgene (`borderRadius: 10`) çevrildi, opaklık %18'den %45'e çıkarıldı, ekran görüntüsüyle doğrulanıp gösterildi. İkinci turda Zeynep görseli hâlâ küçük/silik buldu: boyut ~2 katına çıkarıldı (130→168px yükseklik, genişlik en dar sidebar durumuna — 210px tight breakpoint — göre 195px'te sınırlandı, taşma yok), opaklık %45'ten %65'e çıkarıldı; ayrıca görsele tıklanınca da (75 saniyelik otomatik döngüye ek olarak) değişmesi istendi — `onClick` eklendi, `pointerEvents: 'none'` kaldırıldı, `cursor: pointer` + açıklayıcı `title` eklendi. Playwright ile hem boyut/opaklık hem tıklama davranışı doğrulandı.

### Uçtan uca doğrulama (gerçek kimlik bilgileriyle)
Gerçek tarayıcı testiyle doğrulandı: Linkler detay görünümü, Discover sayfası (kategori grupları + Takip et + gizle), Ana Sayfa carousel'i (sayfalama göstergesi), Çıkış Yap (oturum çerezi gerçekten temizleniyor, giriş ekranına dönülüyor), profil fotoğrafı yükleme (gerçek Cloudinary URL'i, avatar'da render ediliyor), arka plan görseli (sidebar içinde, düşük opaklık). `analyzeDiscoveredProgram()`'ın ürettiği `deadline`/`description` alanlarının `mark-filtered`'a doğru gittiği ve `relevant` uç noktasında süresi geçmiş bir test kaydının doğru şekilde elendiği ayrıca doğrulandı.

**Test sırasında oluşan yan etkiler (bilgi amaçlı):** Uçtan uca test bir gerçek (fakat sahte içerikli, "TÜBİTAK 2209-A Test Programı" başlıklı) Telegram bildirimine ve Cloudinary'ye küçük bir test görseli yüklenmesine yol açtı — ikisi de zararsız, ilki dışında hiçbir gerçek üretim verisi etkilenmedi (kontrol edildi: Program Keşfi'ndeki gerçek/mevcut sonuçlarda beklenmeyen bir "gizli" işareti yok).

## Aşama 20 — Merkezi Veri Depolama (localStorage'dan Upstash Redis'e geçiş) ✅

**Sorun:** Kişisel içerik (Akademik Gelişim, Bir Şey Öğrendim, Şiir, Günlük, Yapılacak Projeler, Linkler, Araştırılacak Konular, Program Takvimi, profil) tarayıcının `localStorage`'ında tutuluyordu — cihazlar arası senkronizasyon imkansızdı, telefondan eklenen bir şey bilgisayarda görünmüyordu. Bu, projenin "farklı cihazlardan erişilebilir olsun" hedefiyle çelişiyordu.

### 1. Sunucu tarafı: `/api/state` (GET/PUT) ✅
- [x] `server.js`'e `GET /api/state` ve `PUT /api/state` eklendi — tüm `PersistedState` nesnesi TEK bir Redis anahtarında (`app:state`) opak bir JSON blob olarak saklanıyor (Program Keşfi'yle aynı Upstash veritabanı, farklı anahtar/namespace). Yeni bir `UPSTASH_CONFIGURED` bayrağı eklendi (Program Keşfi'nin `DISCOVER_CONFIGURED`'ından farklı — SerpApi'ye ihtiyaç duymuyor, sadece Upstash'e). Üst sınır: 10 MB (`MAX_STATE_BYTES`).
- [x] Site geneli oturum auth middleware'i (Aşama 17) `/api/state` uç noktalarını otomatik koruyor — route'lar middleware'den SONRA tanımlandığı için ayrı bir yetkilendirme kodu gerekmedi.

### 2. İstemci tarafı: `AppState.tsx` yeniden yazıldı ✅
- [x] Eski senkron `loadPersisted()` (localStorage okuma) yerine: mount'ta `/api/state`'den asenkron yükleme, `stateLoading`/`stateError` durumu (`App.tsx`'te bir "Yükleniyor…" ekranı gösteriyor — gerçek veri gelene kadar boş/varsayılan içeriğin bir an görünüp kaybolması ("flaş") önlendi).
- [x] Kaydetme artık debounce'lı (400ms) bir `PUT /api/state` — `hasLoadedRef` (bir `useRef(false)`) ile korunuyor: ilk yükleme/migration bitmeden kaydetme effect'i TETİKLENMİYOR (yoksa boş varsayılan state, sunucudaki gerçek veriyi sessizce ezebilirdi).
- [x] **Cihazlar arası canlı senkronizasyon:** sekme odak (`focus`) veya görünürlük (`visibilitychange`) kazandığında `/api/state` yeniden çekiliyor ve yerel state değiştiriliyor — sürekli polling YOK, aktif düzenleme sırasında YOK, sadece kullanıcı sekmeye/uygulamaya geri döndüğünde ("pull to refresh").
- [x] **Kabul edilen basitleştirme — "son yazan kazanır" (last-write-wins):** iki cihazdan eşzamanlı değişiklik yapılırsa biri diğerini ezebilir. Tek kullanıcılı bir araç için makul; gerçek bir merge/CRDT mekanizması kapsam dışı bırakıldı.

### 3. Migration (tek seferlik, kayıpsız) ✅
- [x] Uygulama ilk açıldığında: önce `/api/state` sorgulanıyor. Sunucu `exists:false` derse (yani Redis'te henüz kayıt yoksa) VE tarayıcının `localStorage`'ında eski anahtarda (`muhendis-portal-state-v1`) veri varsa, o veri normalize edilip (`normalizeLoadedState()` — hem migration hem normal sunucu-yükleme yolunda ORTAK kullanılan tek fonksiyon) `PUT /api/state` ile Redis'e yazılıyor; yazma BAŞARIYLA onaylandıktan SONRA `localStorage.removeItem(...)` çağrılıyor. Sunucu zaten `exists:true` derse (yani migration daha önce yapılmış), `localStorage`'a hiç dokunulmuyor, tekrar migration denenmiyor.
- [x] Gerçek bir "eski cihaz" senaryosuyla uçtan uca doğrulandı: sahte-gerçekçi bir eski `localStorage` verisiyle (profil, link, şiir alanları dahil) Cihaz A ilk açılışta migration'ı doğru yaptı (localStorage temizlendi, tüm alanlar Redis'te doğru göründü); tamamen ayrı, BOŞ localStorage'lı bir Cihaz B aynı veriyi SADECE Redis'ten doğru şekilde yükledi.

### 4. KRİTİK GÜVENLİK NOKTASI — Günlük şifrelemesi client-side kaldı ✅
- [x] `/api/state` gönderilen/dönen JSON'u hiç yorumlamıyor, opak bir blob olarak saklıyor — Günlük modülünün AES-GCM şifrelemesi (Web Crypto API, Aşama 17) hiçbir şekilde değişmedi: şifreleme/çözme hâlâ SADECE tarayıcıda (`AppState.tsx`, `diaryCrypto.ts`) yapılıyor, sunucuya hiç uğramıyor. `persisted.diaryEntries[].text` alanı, `patch()` çağrılmadan ÖNCE zaten şifrelenmiş haldedir — bu, `persisted`'i opak bir blob olarak taşıyan HERHANGİ bir mekanizma (eski localStorage da, yeni Redis de) tarafından otomatik olarak korunuyor, özel bir kod gerekmedi.
- [x] **Doğrulama (localStorage'a değil, gerçek Redis kaydına bakılarak):** Redis'teki ham `/api/state` yanıtı incelendi — `diaryEntries[].text` alanlarının HİÇBİRİ test metninin düz halini içermiyordu; örnek bir kayıt gerçekten okunamaz bir şifreli metin (`hcl+4ZGr/jrM1t+s+b3PYWGC2u19VzeyXrZEtpePDQPhzdENZd...` gibi) olarak doğrulandı.

### 5. Ek istek — cihazlar arası günlük şifre çözme (salt taşıma) ✅
Zeynep'in ek sorusu: günlük şifrelemesi bir "salt" kullanıyorsa ve bu salt sadece cihazın localStorage'ında tutuluyorsa, farklı bir cihazdan AYNI parolayla açmak mümkün olmayabilirdi — bu da Redis'e taşınmalıydı.
- [x] **Tasarım gereği zaten doğru çıktı:** `DiarySecurity` tipi (`{ enabled, salt, canary }`), `diaryEntries` gibi `PersistedState`'in NORMAL bir alanı — bütün nesneyi TEK blob olarak taşıyan migration/senkronizasyon mekanizması, `salt`'ı da otomatik olarak Redis'e taşıyor, özel bir durum gerekmedi.
- [x] **Gerçek bir testle kanıtlandı** (localStorage'a değil, Redis'e bakılarak): Cihaz A'da bir parola ile bir günlük girişi oluşturuldu → Redis'teki `/api/state` yanıtında `diarySecurity.salt` ve `diarySecurity.canary` mevcuttu → tamamen ayrı, BOŞ localStorage'lı bir Cihaz B (Redis'te `diarySecurity` bulunduğu için normal "kilit açma" ekranını gösterdi, "ilk kurulum" ekranını DEĞİL) AYNI parolayla girişi başarıyla çözüp gösterdi. **Sonuç: cihazdan bağımsız çalışıyor, ek bir düzeltme gerekmedi — sadece doğrulandı.**

### 6. Dokunulmayanlar (istendiği gibi) ✅
- [x] Fotoğraflar (Cloudinary) ve Program Keşfi sonuçları (`discover:items`/`discover:seen`, zaten Redis'te) bu değişiklikten etkilenmedi — ayrı uç noktalar/anahtarlar, hiç değiştirilmedi.

### Uçtan uca doğrulama (tüm modüller, iki ayrı tarayıcı bağlamı/"cihaz" ile)
- Migration testi: eski/sahte `localStorage` verisiyle Cihaz A → Redis'e doğru taşındı, temiz Cihaz B aynı veriyi sadece Redis'ten gördü (profil, link, şiir alanları).
- Günlük + salt cihazlar arası testi: yukarıda madde 5.
- Program Takvimi, Araştırılacak Konular (Merak konuları), Yapılacak Projeler (Proje fikirleri): Cihaz A'da eklendi → Cihaz B'nin TAZE (sıfırdan) yüklemesinde üçü de görüldü.
- **Canlı senkronizasyon testi:** Cihaz B açıkken Cihaz A yeni bir kayıt ekledi; Cihaz B'ye bir `focus`/`visibilitychange` olayı tetiklendiğinde (sekmeye geri dönüş simülasyonu) yeni kayıt sayfayı yenilemeden göründü.
- Test altyapısı notu: yerel test sunucusu ile gerçek (production) site AYNI Upstash kimlik bilgilerini paylaştığı için, testler boyunca `STATE_KEY` geçici olarak `app:state:TESTING-TEMP`'e çevrilip gerçek `app:state` anahtarına hiç dokunulmadı (test öncesi/sonrası `EXISTS` ile doğrulandı); test bitince `STATE_KEY` `app:state`'e geri alındı ve test anahtarı silindi. Yani Zeynep'in gerçek verisi/migration'ı bu testlerden ETKİLENMEDİ — production'a ilk girişinde migration hâlâ ilk kez, beklendiği gibi çalışacak.

### README.md güncellemesi ✅
- [x] "Hangi veri nerede duruyor" tablosu güncellendi: kişisel içerik artık `localStorage` değil, Upstash Redis (`app:state` anahtarı). "Kullanıcının kişisel verisi merkezi bir veritabanında değil" sınırlaması kaldırıldı (artık merkezi). Yeni sınırlama olarak "son yazan kazanır" eşzamanlı düzenleme davranışı eklendi.

## Aşama 21 — Arka Plan Fotoğrafları: Sitenden Doğrudan Yükle/Sil ✅

**Sorun:** Arka plan fotoğrafları (Aşama 19 madde 9) sabit bir kod listesiydi (`BACKGROUND_IMAGES`, `src/lib/backgrounds.ts`) — yeni bir fotoğraf eklemek için: `resim/` klasörüne koy → `public/backgrounds/`'a manuel kopyala+yeniden adlandır → listeye elle satır ekle → commit + push. Zeynep bunun otomatikleşmesini istedi; iki seçenek sunuldu (1: sadece klasör taramasını otomatikleştir, commit/push hâlâ gerekli; 2: tam self-servis, siteden yükle). **Zeynep 2'yi seçti.**

- [x] `PersistedState`'e `backgroundImages: string[]` eklendi (`AppState.tsx`) — Aşama 20'nin genel `/api/state` mekanizmasının bir parçası olarak otomatik olarak Redis'e gidiyor, ayrı bir uç nokta/anahtar GEREKMEDİ. Varsayılan değer eski sabit listenin (`BACKGROUND_IMAGES`) kendisi — mevcut kullanıcılar (Zeynep) için hiçbir şey kaybolmadı, ilk açılışta otomatik bu 12 fotoğrafla başlıyor.
- [x] `BackgroundAccent.tsx`'e iki küçük metin kontrolü eklendi (görselin ALTINDA, normal akışta — görselin kendisi negatif z-index'te olduğu için, bkz. Aşama 19 teknik notu, üstüne tıklanabilir kontrol koymak mümkün değildi): **"+ fotoğraf ekle"** (dosya seç → `compressImage` → `uploadImage` → Cloudinary → dönen URL `app.addBackgroundImage()` ile listeye ekleniyor, PROFİL fotoğrafıyla AYNI mevcut yükleme altyapısı, yeni bir sunucu kodu gerekmedi) ve **"sil"** (o an ekranda görünen fotoğrafı `app.removeBackgroundImage()` ile listeden çıkarıyor).
- [x] **Koruma:** son kalan tek fotoğraf silinemiyor (`removeBackgroundImage`, boş listeye düşme engelleniyor) — aksi halde rotasyonda gösterilecek hiçbir şey kalmazdı; kullanıcıya "Son fotoğraf silinemez" mesajı gösteriliyor.
- [x] Şu an ekranda gösterilen fotoğraf başka bir cihazdan silinirse (Aşama 20'nin canlı senkronizasyonu sayesinde bu da mümkün), bileşen bunu algılayıp otomatik başka bir fotoğrafa geçiyor — kırık görsel kalmıyor.
- [x] `resim/`/`public/backgrounds/`/kod listesine elle dosya ekleme akışı artık GEREKSİZ hâle geldi (isteğe bağlı hâlâ kullanılabilir, ama gerekmiyor) — yeni fotoğraflar tamamen siteden (telefon dahil) ekleniyor/çıkarılıyor, git commit/push YOK, Claude'a haber vermek YOK.

### Uçtan uca doğrulama
Gerçek bir dosya yükleyip Redis'teki `/api/state` kaydı doğrudan okunarak doğrulandı: yükleme öncesi 12 fotoğraf → yükleme sonrası 13 (yeni gerçek bir Cloudinary URL'i listede) → "sil" sonrası 12 → art arda silmelerle 1'e kadar düşürüldü → son fotoğrafı silme denemesi doğru şekilde engellendi ("Son fotoğraf silinemez" mesajı gösterildi, liste 1'de kaldı). Test, gerçek `app:state` anahtarına dokunmadan geçici bir test anahtarıyla yapıldı (bkz. Aşama 20'deki aynı test-güvenliği yöntemi).

## Aşama 22 — Takvim Gezinme ve Program Düzenleme ✅

**Sorunlar (Zeynep'in geri bildirimi):**
1. "Takvimde hafta veya ayları oklarla ilerleyerek görebilmek istiyorum" — Ana Sayfa'daki haftalık/aylık takvim ızgarası tek bir sabit pencereye (31 Ağustos - 30 Eylül 2026) kilitliydi, gezinme yoktu.
2. "Uygulama üzerinden eklediğim takvim notunu silebilmeli ve düzenleyebilmeliyim" — silme zaten vardı, düzenleme yoktu.
3. "Yaklaşan programlara tarih, not, link ekleyemiyorum, eklenen programı silemiyorum düzenleyemiyorum" — Ana Sayfa'nın hızlı program ekleme formu SADECE bir başlık alıyordu; yazılan "tarih" hiç ayrıştırılmıyordu (her zaman `TODAY`'e sabitleniyordu, sessiz bir hataydı), not/link alanı yoktu, silme hiçbir yerde yoktu.
4. "Program Takvimi'nde düzenleyebiliyorum ama kaydet tuşu yok, kaydedip kaydetmediğimi nasıl anlayacağım" — not/link alanları `onBlur` ile sessizce kaydediyordu, görünür bir onay yoktu.

### 1. Takvim ızgarası artık gerçek tarihlerle çalışıyor, oklarla gezilebiliyor ✅
- [x] `dayNotes` anahtarları "ayın kaçı" (1-30, hep Eylül 2026 anlamına geliyordu) yerine tam `YYYY-MM-DD` oldu (`lib/dates.ts` → `toDateKey`/`parseDateKey`/`startOfWeek`/`addDays`/`addMonths`) — aksi halde farklı aylardaki aynı gün numarası (Eylül'ün 5'i / Ekim'in 5'i) çakışırdı.
- [x] Eskiden ayrı bir `AUG31_BLOCKS` sabiti olarak özel işlenen 31 Ağustos, artık `SEED_DAY_NOTES`'un normal bir günü (`2026-08-31`) — özel durum kodu kalktı.
- [x] Ana Sayfa'daki hafta/ay başlığının yanına ‹ › ok düğmeleri ve o anki dönemi gösteren bir etiket eklendi ("7 Eyl – 13 2026" / "Ekim 2026" gibi) — hafta görünümünde ±7 gün, ay görünümünde ±1 ay ilerliyor. Varsayılan başlangıç (1 Eylül 2026 çapa tarihi) eski sabit görünümle BİREBİR aynı, yani mevcut demo veriler hiç kaybolmadı/kaymadı.
- [x] Google Calendar senkronizasyon penceresi (`GCAL_RANGE_START/END`) 2024-2029 arasına genişletildi — .ics zaten tek seferde tam metin çekilip yerelde tarihe göre filtrelendiği için (bkz. Aşama 9) bu EKSTRA bir ağ isteği gerektirmiyor, sadece gezinilen başka aylarda da gerçek Google Calendar etkinlikleri görünsün diye.
- [x] Hafta görünümündeki gün başlıkları da artık (Ay görünümündeki hücreler gibi) tıklanabilir — o günün panelini açıyor (eskiden sadece Ay görünümünde vardı).
- [x] **Migration:** Canlıda zaten eski numaralı anahtarlarla (`1`, `2`, ... `30`) kaydedilmiş gerçek gün notları olabilir — `normalizeLoadedState` bunları sessizce `2026-09-DD`'ye çeviriyor (`normalizeDayNotes()`, Aşama 18'deki `normalizeExtraPrograms` ile aynı desen). Gerçekçi sahte eski veriyle uçtan uca doğrulandı: numaralı anahtar (`"5"`) → `2026-09-05`'e taşındı, eski anahtar kalmadı.

### 2. Gün notu düzenleme (DayPanel) ✅
- [x] Her not satırına silme ikonunun yanına bir kalem (düzenle) ikonu eklendi — tıklanınca satır, saat + metin girişi olan bir düzenleme formuna dönüşüyor, "Kaydet"/"Vazgeç" ile onaylanıyor/iptal ediliyor. Yeni `app.editDayNote(dateKey, id, patch)` action'ı eklendi.
- [x] Panel başlığı artık gerçek tarihi gösteriyor (`formatFullDateTR`, ör. "5 Ekim 2026") — eskiden hep sabit "Eylül 2026" yazıyordu.

### 3. Yaklaşan Programlar: tarih/not/link ile ekleme + silme ✅
- [x] Ana Sayfa'nın "+ Program ekle" formu artık 4 ayrı alan: Başlık, Tarih (`<input type="date">`), Not, Link — eskiden tek bir "Program adı ve tarih…" serbest metin alanıydı ve yazılan tarih HİÇ kullanılmıyordu (gerçek bir sessiz hataydı, her yeni program otomatik bugünün tarihine düşüyordu). Yeni `qProgramDate`/`qProgramNote`/`qProgramLink` state alanları eklendi.
- [x] Her "eklediğim" (extra) yaklaşan program satırına bir silme ikonu eklendi — statik (seed) programlarda görünmüyor, sadece kullanıcının kendi eklediklerinde. Yeni `app.removeExtraProgram(id)` action'ı.

### 4. Program Takvimi: başlık/tarih düzenleme + görünür "Kaydet" onayı + silme ✅
- [x] Genişletilmiş program satırına (sadece "eklediğim" programlarda) Başlık ve Tarih editörleri eklendi — eskiden sadece Not/Link/Dosya düzenlenebiliyordu, başlık statik metindi.
- [x] **`onBlur` ile sessiz kayıt kaldırıldı** — Not/Link/Başlık/Tarih artık bir taslak (`draft`) state'inde tutuluyor, tek bir görünür **"Kaydet"** butonuna basınca hepsi birden kaydediliyor ve yanında 2 saniyeliğine **"✓ Kaydedildi"** onayı beliriyor. Zeynep'in "kaydedip kaydetmediğimi nasıl anlayacağım" sorusuna doğrudan cevap.
- [x] "Programı sil" bağlantısı eklendi (sadece extra programlarda) — Ana Sayfa'daki silme ile aynı `removeExtraProgram` action'ını kullanıyor, iki yerden de silinebiliyor.

### Uçtan uca doğrulama
Gerçek tarayıcı testleriyle doğrulandı: hafta oklarıyla ileri gidince etiket doğru değişiyor ("31 Ağu – 6 Eyl 2026" → "7 Eyl – 13 2026"); ay oklarıyla Eylül'den Ekim'e geçiliyor; Ekim'in 5'i açılınca panel "5 Ekim 2026" gösteriyor ve BOŞ geliyor (Eylül'ün eski verisi sızmıyor — migration'ın doğru çalıştığının kanıtı); bir gün notu eklenip kalemle düzenlenip silinebiliyor; Ana Sayfa'dan başlık+tarih+not+link ile eklenen bir program doğru sırada (gerçek günler kaldı hesabına göre) ve doğru bilgilerle görünüyor, oradan silinebiliyor; Program Takvimi'nde aynı programın başlığı/tarihi/notu/linki düzenlenip Kaydet'e basılınca "✓ Kaydedildi" görünüyor VE Redis'teki `/api/state` kaydı (`extraPrograms[].date` doğru `DD.MM.YYYY` formatında) doğrudan okunarak gerçekten kaydedildiği kanıtlandı; oradan da silinebiliyor. Testler, gerçek `app:state` anahtarına dokunmadan geçici bir test anahtarıyla yapıldı (bkz. Aşama 20/21'deki aynı yöntem); test sonrası gerçek anahtarın (zaten Zeynep'in gerçek kullanımıyla oluşmuş) etkilenmediği doğrulandı.

## Gelecek fikirleri (henüz plana alınmadı, sadece not)
- Arka plan görselleri için otomatik/AI üretilen görsellere geçiş — Aşama 21'de bunun yerine sitenden doğrudan yükleme/silme (self-servis) tercih edildi, bu fikir hâlâ ayrı bir olasılık olarak (ör. hiç fotoğraf eklenmediğinde bir "varsayılan AI seti" gibi) not düşülüyor.
- Anahtar kelimelerin kullanıcı içeriğinden otomatik çıkarılması (bkz. Aşama 11).

---
**Not:** Her aşama bitince Zeynep'e kısa bir özet ver (ne yapıldı, hangi dosyalar değişti), sıradaki aşamaya geçmeden önce onay bekle.

**Not:** Konuştuğumuz her önemli teknik kısıtlama/karar/ileride hatırlanması gereken şey, ortaya çıktığı anda (sorulmadan) ilgili aşamanın altına bir not olarak PLAN.md'ye eklenir.
