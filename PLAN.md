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
Aşama 10 (özetleme) bittikten sonra ele alınacak.
- [ ] Ücretsiz kotalı bir arama API'si (ör. Brave Search API) ile önceden tanımlanmış anahtar kelime listesiyle (TÜBİTAK, Teknofest, hackathon, bootcamp, üniversite yarışmaları vb.) periyodik tarama
- [ ] Bulunan sonuçları veritabanında sakla; daha önce görülenleri tekrar gösterme (deduplication)
- [ ] Kota sınırına yaklaşınca taramayı durdur, bir sonraki periyoda (günlük/haftalık) ertele
- [ ] Yerel model (Ollama) yeni sonuçları kullanıcının Akademik Gelişim içeriğiyle eşleştirip önem sırasına göre önersin
- [ ] İleride değerlendirilecek: anahtar kelimelerin kullanıcı içeriğinden otomatik çıkarılması (şimdilik kapsam dışı)

## Aşama 12 — Test ve Yayına Hazırlık
- [ ] Tüm modüllerde hover/tıklanabilirlik göstergelerinin (pointer cursor) tutarlı çalıştığını doğrula
- [ ] GitHub'a düzenli commit/push
- [ ] README.md ile projeyi kısaca belgelendir
- [ ] Barındırma (hosting) stratejisi ayrıca konuşulacak (backend gerektiren kısımlar var, sadece GitHub Pages yetmez)

### Barındırma kararını etkileyecek teknik notlar
- **Google Calendar senkronizasyonu (Aşama 9) sadece `npm run dev` sırasında çalışır.** CORS yüzünden tarayıcı Google'ın iCal adresine doğrudan istek atamıyor; şu an bunu Vite'ın geliştirme sunucusu proxy'si (`vite.config.ts` → `/api/calendar.ics`) çözüyor. Bu proxy `vite build` çıktısında YOK — statik bir yere (ör. GitHub Pages) yayınlarsak bu özellik tamamen çalışmaz. Yayına alırken bunun için küçük bir sunucu/serverless fonksiyon (Vercel/Netlify function, Cloudflare Worker vb.) gerekecek — bu fonksiyon gizli iCal adresini ortam değişkeni olarak tutup isteği sunucu tarafında yapacak.

---
**Not:** Her aşama bitince Zeynep'e kısa bir özet ver (ne yapıldı, hangi dosyalar değişti), sıradaki aşamaya geçmeden önce onay bekle.

**Not:** Konuştuğumuz her önemli teknik kısıtlama/karar/ileride hatırlanması gereken şey, ortaya çıktığı anda (sorulmadan) ilgili aşamanın altına bir not olarak PLAN.md'ye eklenir.
