// Seed content for the "Mühendis Kişisel Gelişim Platformu" dashboard,
// ported from the Claude Design prototype (Mühendis Gelişim Portalı.dc.html).

export const ROSE = '#DB7F8E';
export const TAUPE = '#604D53';
export const STEEL = '#9DA3A4';

export interface GrowthNote {
  date: string;
  title: string;
  body: string;
  source: string;
  dot: string;
  link: string;
}

export interface GrowthMonth {
  name: string;
  count: number;
  summary: string;
  tags: string[];
  notes: GrowthNote[];
}

export const MONTHS: GrowthMonth[] = [
  {
    name: 'Ağustos 2026',
    count: 14,
    summary:
      'Bu ay ağırlık kontrol tarafındaydı: durum-uzay modellemesini oturttun, PID’de integral windup’ı ilk kez elinle gördün ve gözlemci tasarımına giriş yaptın. İki hafta boyunca aynı konuya dönmüş olman notlarda görünüyor — dağılmadın.',
    tags: ['kontrol sistemleri', 'gömülü', 'sayısal analiz'],
    notes: [
      {
        date: '27 Ağu',
        title: 'Integral windup’ı motor sürücüde yakaladım',
        body: 'Doyuma giren PWM çıkışında integral terim büyümeye devam ediyordu; clamping ekleyince aşım 18%’den 4%’e indi. Anti-windup’ın neden “hile” değil de zorunluluk olduğunu anladım.',
        source: 'Bir Şey Öğrendim',
        dot: ROSE,
        link: 'girişe git',
      },
      {
        date: '22 Ağu',
        title: 'Durum-uzay: A matrisi neyi anlatıyor',
        body: 'Özdeğerlerin gerçel kısmı kararlılığı, sanal kısmı salınımı veriyor. Transfer fonksiyonundan geçiş artık mekanik bir işlem gibi değil.',
        source: 'Bir Şey Öğrendim',
        dot: ROSE,
        link: 'girişe git',
      },
      {
        date: '15 Ağu',
        title: 'STM32’de timer tabanlı örnekleme',
        body: 'delay() ile örnekleme yapmanın kontrol döngüsünü neden bozduğunu ölçtüm. Jitter 3 ms’den 40 µs’ye düştü.',
        source: 'Araştırılacak Konular · kapandı',
        dot: STEEL,
        link: '',
      },
      {
        date: '6 Ağu',
        title: 'Bode diyagramını elle çizmek',
        body: 'Asimptotik yaklaşımla çizince kazanç payı/faz payı sezgisi oturdu. Simülasyona bakmadan tahmin edebiliyorum artık.',
        source: 'Bir Şey Öğrendim',
        dot: ROSE,
        link: 'girişe git',
      },
    ],
  },
  {
    name: 'Temmuz 2026',
    count: 9,
    summary:
      'Staj dönemi. Notların teoriden çok ölçüm ve pratiğe kaydı: osiloskop probu kompanzasyonu, toprak döngüleri, kart üstünde gürültü avı. Az sayıda ama uzun girişler.',
    tags: ['ölçme', 'analog', 'staj'],
    notes: [
      {
        date: '28 Tem',
        title: 'Toprak döngüsü gürültüsünü ilk kez ölçtüm',
        body: 'Tek noktadan topraklama ile 50 Hz bileşen 12 dB düştü. Şemada güzel görünen şeyin kartta neden çalışmadığını gördüm.',
        source: 'Bir Şey Öğrendim',
        dot: ROSE,
        link: 'girişe git',
      },
      {
        date: '19 Tem',
        title: 'Prob kompanzasyonu',
        body: '1 kHz kare dalga ile probu ayarlamayı öğrenmeden yaptığım bütün yükselme süresi ölçümleri yanlıştı.',
        source: 'Bir Şey Öğrendim',
        dot: ROSE,
        link: '',
      },
      {
        date: '9 Tem',
        title: 'LDO ile buck arasındaki seçim',
        body: 'Verim–gürültü ödünleşimi: analog ön uç için LDO, dijital taraf için buck. Sebebini artık cümleyle kurabiliyorum.',
        source: 'Araştırılacak Konular · kapandı',
        dot: STEEL,
        link: '',
      },
    ],
  },
  {
    name: 'Haziran 2026',
    count: 11,
    summary:
      'Final dönemi: sinyaller ve sistemler ağırlıklı. Fourier’i “formül” olarak değil “bakış açısı” olarak yazdığın üç giriş var — dönüm noktası gibi görünüyor.',
    tags: ['sinyaller', 'matematik'],
    notes: [
      {
        date: '24 Haz',
        title: 'Pencereleme neden gerekiyor',
        body: 'Sonlu kayıt = dikdörtgen pencere = spektral sızıntı. Hann pencereyi keyfi bir seçim sanıyordum.',
        source: 'Bir Şey Öğrendim',
        dot: ROSE,
        link: 'girişe git',
      },
      {
        date: '17 Haz',
        title: 'Konvolüsyonun fiziksel anlamı',
        body: 'Dürtü yanıtının kaydırılmış toplamı. Grafik yöntemi ezberden çıktı.',
        source: 'Bir Şey Öğrendim',
        dot: ROSE,
        link: '',
      },
      {
        date: '5 Haz',
        title: 'Örnekleme teoremini yanlış hatırlıyormuşum',
        body: 'Nyquist frekansı ile örnekleme frekansını karıştırıyordum; katlanma (aliasing) demosu ile düzeldi.',
        source: 'Bir Şey Öğrendim',
        dot: ROSE,
        link: '',
      },
    ],
  },
];

export interface Entry {
  date: string;
  len: string;
  title: string;
  teaser: string;
}

export const ENTRIES: Entry[] = [
  {
    date: '27 Ağu 2026',
    len: '6 dk',
    title: 'Integral windup’ı motor sürücüde yakaladım',
    teaser: 'Doyuma giren çıkış, büyümeye devam eden integral terim ve 18%’lik aşım.',
  },
  {
    date: '22 Ağu 2026',
    len: '11 dk',
    title: 'Durum-uzay: A matrisi neyi anlatıyor',
    teaser: 'Özdeğerler, kararlılık ve transfer fonksiyonuna geri dönüş.',
  },
  {
    date: '15 Ağu 2026',
    len: '4 dk',
    title: 'STM32’de timer tabanlı örnekleme',
    teaser: 'delay() ile kontrol döngüsü kurmanın bedeli: 3 ms jitter.',
  },
  {
    date: '6 Ağu 2026',
    len: '8 dk',
    title: 'Bode diyagramını elle çizmek',
    teaser: 'Asimptotlar, köşe frekansları ve faz payı sezgisi.',
  },
  {
    date: '28 Tem 2026',
    len: '9 dk',
    title: 'Toprak döngüsü gürültüsünü ilk kez ölçtüm',
    teaser: 'Şemada güzel, kartta gürültülü. 50 Hz’in izini sürmek.',
  },
  {
    date: '24 Haz 2026',
    len: '7 dk',
    title: 'Pencereleme neden gerekiyor',
    teaser: 'Spektral sızıntı, dikdörtgen pencere ve Hann.',
  },
];

export interface Article {
  stamp: string;
  title: string;
  summary: string;
  body: string[];
  code: string;
  body2: string[];
  tags: string[];
  rel: string;
}

export const ARTICLES: Article[] = [
  {
    stamp: '27 Ağustos 2026 · 23:12 · 6 dk okuma · düzenlendi',
    title: 'Integral windup’ı motor sürücüde yakaladım',
    summary:
      'PWM çıkışı doyuma girdiğinde integral terimin birikmeye devam etmesi, referans değiştiğinde büyük aşıma yol açıyor. Clamping tabanlı anti-windup ile aşım 18%’den 4%’e indi. Kazanım: doyum, kontrolcünün gördüğü dünyayı değiştirir.',
    body: [
      'Sabah laboratuvarda basit bir hız kontrolü kuruyordum: DC motor, enkoder, klasik PID. Simülasyonda kusursuz çalışan katsayılar gerçek kartta referansı her değiştirdiğimde uzun süren bir aşımla cevap veriyordu.',
      'Sorunun kaynağını anlamam yarım günümü aldı. Motor gerilim sınırına dayandığı anda kontrolcü hâlâ “daha fazla ver” diyor, ama sistem veremiyor. Hata sıfırlanmadığı için integral terim şişmeye devam ediyor. Referans düştüğünde bu birikmiş enerji boşalana kadar çıkış tepede kalıyor.',
      'Çözüm beklediğimden basitti: integratörü çıkış sınırlarına göre kelepçelemek.',
    ],
    code: 'if (u > U_MAX) { u = U_MAX; if (e > 0) I -= Ki * e * dt; }\nif (u < U_MIN) { u = U_MIN; if (e < 0) I -= Ki * e * dt; }',
    body2: [
      'Bu satırları eklediğim anda osiloskopta aşım 18%’den 4%’e indi, yerleşme süresi neredeyse yarıya düştü.',
      'Asıl öğrendiğim şey anti-windup değil sanırım: doyum, kontrolcünün modelinde olmayan bir gerçek. Kağıt üzerinde doğru olan bir döngü, aktüatörünün sınırını bilmiyorsa yanlış davranır.',
    ],
    tags: ['kontrol sistemleri', 'PID', 'gömülü', 'laboratuvar'],
    rel: 'Bağlantılı: Araştırılacak Konular · “anti-windup yöntemleri”',
  },
  {
    stamp: '22 Ağustos 2026 · 21:40 · 11 dk okuma',
    title: 'Durum-uzay: A matrisi neyi anlatıyor',
    summary:
      'Durum-uzay gösteriminde A matrisinin özdeğerleri sistemin kararlılığını ve salınım karakterini taşıyor. Transfer fonksiyonu ile geçiş artık ezber değil; her iki gösterimin ne zaman kolaylık sağladığı netleşti.',
    body: [
      'Sinyaller dersinden beri durum-uzay gösterimini “matrislerle yazılmış aynı şey” sanıyordum. Bu hafta neden ayrı bir dil olduğunu anladım.',
      'A matrisinin özdeğerleri, transfer fonksiyonunun kutuplarıyla aynı yerde duruyor. Ama çok girişli–çok çıkışlı bir sistemde transfer fonksiyonu bir matrise dönüşürken, durum-uzay hâlâ tek bir denklem takımı olarak kalıyor.',
    ],
    code: 'x_dot = A x + B u\ny     = C x + D u\neig(A) → kararlılık: Re(λ) < 0',
    body2: [
      'Özdeğerin gerçel kısmı ne kadar solda, o kadar hızlı sönüm; sanal kısmı büyüdükçe salınım artıyor. Kutup yerleştirme fikri buradan doğal olarak çıkıyor.',
    ],
    tags: ['kontrol sistemleri', 'lineer cebir'],
    rel: 'Bağlantılı: Akademik Gelişim · Ağustos 2026',
  },
];

export interface LinkItem {
  kind: string;
  kindColor: string;
  date: string;
  title: string;
  url: string;
  note: string;
  tags: string[];
}

export const LINK_KINDS = ['Link', 'Ders notu', 'GitHub', 'Video', 'Araç', 'Makale', 'Başvuru', 'Blog'] as const;

export const KIND_COLORS: Record<string, string> = {
  Link: TAUPE,
  'Ders notu': ROSE,
  GitHub: TAUPE,
  Video: '#8C6B70',
  Araç: STEEL,
  Makale: ROSE,
  Başvuru: TAUPE,
  Blog: '#8C6B70',
};

export const LINKS: LinkItem[] = [
  {
    kind: 'Ders notu',
    kindColor: ROSE,
    date: '29 Ağu',
    title: 'Feedback Control of Dynamic Systems — çözümlü örnekler',
    url: 'stanford.edu/class/ee264/notes/...',
    note: 'Kutup yerleştirme bölümü derste anlatılandan çok daha net; problem 6.14 sınavda çıkacak tipte.',
    tags: ['kontrol', 'sınav'],
  },
  {
    kind: 'GitHub',
    kindColor: TAUPE,
    date: '26 Ağu',
    title: 'stm32-pid-motor-control',
    url: 'github.com/.../stm32-pid-motor',
    note: 'Anti-windup uygulaması benim yazdığımdan temiz. Timer kesme yapısını buradan kopyaladım.',
    tags: ['gömülü', 'referans kod'],
  },
  {
    kind: 'Video',
    kindColor: '#8C6B70',
    date: '21 Ağu',
    title: 'Why the Kalman filter works — görsel anlatım',
    url: 'youtube.com/watch?v=...',
    note: 'Formülden önce izlenmesi gereken şey. Belirsizliğin iki dağılımın çarpımı olduğu kısım çok iyi.',
    tags: ['tahmin', 'izlendi'],
  },
  {
    kind: 'Araç',
    kindColor: STEEL,
    date: '18 Ağu',
    title: 'Falstad devre simülatörü',
    url: 'falstad.com/circuit/',
    note: 'Hızlı sezgi için. SPICE açmaya değmeyen RC/RL sorularında ilk durak.',
    tags: ['analog', 'simülasyon'],
  },
  {
    kind: 'Makale',
    kindColor: ROSE,
    date: '12 Ağu',
    title: 'A Tutorial on Anti-Windup Schemes',
    url: 'ieeexplore.ieee.org/document/...',
    note: 'Clamping dışında back-calculation da var. Okumayı bitirmedim, bölüm 3’te kaldım.',
    tags: ['kontrol', 'yarım'],
  },
  {
    kind: 'Başvuru',
    kindColor: TAUPE,
    date: '8 Ağu',
    title: 'TÜBİTAK 2209-A başvuru kılavuzu 2026',
    url: 'tubitak.gov.tr/tr/burslar/...',
    note: 'Bütçe kalemleri sayfa 11’de. Danışman onayı için son tarih başvurudan iki hafta önce.',
    tags: ['program', 'acil'],
  },
  {
    kind: 'GitHub',
    kindColor: TAUPE,
    date: '3 Ağu',
    title: 'awesome-embedded-systems',
    url: 'github.com/.../awesome-embedded',
    note: 'Kaynak listesi. RTOS bölümünü staj sonrası taramak için işaretledim.',
    tags: ['gömülü', 'liste'],
  },
  {
    kind: 'Blog',
    kindColor: '#8C6B70',
    date: '30 Tem',
    title: 'Grounding & shielding: pratik kurallar',
    url: 'analog.com/en/resources/...',
    note: 'Stajda öğrendiklerimi doğruladı. Tek nokta topraklama tam olarak nerede işe yaramıyor onu da yazmış.',
    tags: ['analog', 'ölçme'],
  },
];

export interface Topic {
  title: string;
  added: string;
  done: string;
  link: string;
}

export const TOPICS: Topic[] = [
  { title: 'Anti-windup yöntemleri: clamping mi back-calculation mı?', added: '14.08.2026', done: '27.08.2026', link: 'giriş yazıldı' },
  { title: 'Enkoder çözünürlüğü hız gürültüsünü nasıl etkiliyor', added: '19.08.2026', done: '', link: '' },
  { title: 'Neden Hann penceresi, neden Hamming değil', added: '20.06.2026', done: '24.06.2026', link: 'giriş yazıldı' },
  { title: 'LDO vs buck: analog ön uçta hangisi', added: '02.07.2026', done: '', link: '' },
  { title: 'Kalman filtresinde R ve Q nasıl seçiliyor', added: '21.08.2026', done: '', link: '' },
  { title: 'PCB’de dönüş akımı yolunu takip etmek', added: '25.08.2026', done: '', link: '' },
  { title: 'Timer kesmesi ile DMA arasındaki seçim', added: '11.08.2026', done: '', link: '' },
];

export interface ProjectItem {
  state: string;
  stateColor: string;
  title: string;
  note: string;
  date: string;
}

export const PROJECTS: ProjectItem[] = [
  { state: 'Başlanacak', stateColor: ROSE, title: 'Enkoderli DC motor hız kontrol kartı', note: 'Kendi PCB’si, STM32G4, anti-windup’lı PID. Ağustos notlarının doğal devamı.', date: '26.08.2026' },
  { state: 'Devam', stateColor: '#B0554F', title: 'Osiloskop verisi için Python analiz aracı', note: 'CSV → FFT → pencereleme karşılaştırması. Haziran girişleriyle bağlı.', date: '14.08.2026' },
  { state: 'Fikir', stateColor: '#8C6B70', title: 'Ev içi sıcaklık haritası (Kalman’lı)', note: 'Beş sensör, tek merkez. R ve Q seçimini öğrenmeden başlanamaz.', date: '21.08.2026' },
  { state: 'Fikir', stateColor: '#8C6B70', title: 'Ders notlarını yerel modelle indeksleyen arama', note: 'PDF + el yazısı taramaları. Bu sitenin arama katmanı olabilir.', date: '11.08.2026' },
  { state: 'Beklemede', stateColor: STEEL, title: 'Analog ön uç: düşük gürültülü ölçüm kartı', note: 'Staj notları hazır, bütçe yok. 2209-A kabul olursa açılır.', date: '30.07.2026' },
];

export interface Program {
  date: string;
  title: string;
  note: string;
  remind: string;
  color: string;
}

export const PROGRAMS: Program[] = [
  { date: '15.09.2026', title: 'TÜBİTAK 2209-A · 2. dönem son başvuru', note: 'Proje önerisi, bütçe tablosu, danışman onayı', remind: '3 gün önce hatırlat', color: '#B0554F' },
  { date: '02.10.2026', title: 'TEKNOFEST takım başvurusu', note: 'Kontrol ve otomasyon kategorisi', remind: '1 hafta önce', color: '#8C6B70' },
  { date: '20.11.2026', title: 'IEEE öğrenci sempozyumu · özet', note: '250 kelime özet, poster opsiyonel', remind: '2 hafta önce', color: '#8C6B70' },
  { date: '10.01.2027', title: 'TÜBİTAK 2242 lise/lisans yarışması', note: 'Ön kayıt açılışı', remind: 'takipte', color: STEEL },
  { date: '01.03.2027', title: 'Erasmus+ staj başvuru dönemi', note: 'Dil belgesi ve transkript hazır olmalı', remind: '1 ay önce', color: STEEL },
];

export interface Poem {
  title: string;
  text: string;
  date: string;
}

export const POEMS: Poem[] = [
  { title: 'gece laboratuvarı', text: 'lehim dumanı ve saat üç\nbir direnç yanıyor sessizce\nkimse duymuyor\nama ben duyuyorum', date: '27.08.2026' },
  { title: 'ölçüm', text: 'her şeyin bir hata payı var dediler\nsevmenin de mi\ndedim\ncevap vermediler', date: '12.08.2026' },
  { title: 'kararlılık', text: 'kutuplar solda kalsın\nyeter', date: '24.06.2026' },
];

export interface DiaryEntry {
  date: string;
  text: string;
}

export const DIARY: DiaryEntry[] = [
  { date: '27 Ağustos 2026 · 23:41', text: 'Bugün laboratuvarda tek başıma kaldığım üç saat, dönem boyunca dinlediğim bütün derslerden daha çok şey öğretti. Bir şeyin neden çalışmadığını bulmanın verdiği tat başka.' },
  { date: '19 Ağustos 2026 · 00:12', text: 'Bölümü seçerken ne yaptığımı bilmiyordum, şimdi de tam bildiğimi söyleyemem. Ama artık merak ettiğim şeyler var ve bu yeterli geliyor.' },
  { date: '3 Ağustos 2026 · 22:05', text: 'Stajın son günü. Kart üzerinde bir şeyi ölçerek anlamanın, kitapta okuyarak anlamaktan farklı bir sinir yolunu kullandığını düşünüyorum.' },
];

export interface DayNote {
  id: string;
  time: string;
  end?: string;
  label: string;
}

export const SEED_DAY_NOTES: Record<number, DayNote[]> = {
  1: [
    { id: '1-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' },
    { id: '1-1', time: '16:00', end: '17:00', label: 'TÜBİTAK bütçe tablosu' },
  ],
  2: [
    { id: '2-0', time: '09:00', end: '10:30', label: 'Kontrol Sistemleri dersi' },
    { id: '2-1', time: '13:00', end: '15:00', label: 'Proje toplantısı' },
  ],
  3: [{ id: '3-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' }],
  4: [{ id: '4-0', time: '11:00', end: '12:30', label: 'Sayısal Analiz dersi' }],
  5: [{ id: '5-0', time: '18:00', end: '19:00', label: 'Şiir yazma zamanı' }],
  6: [],
  8: [{ id: '8-0', time: '09:00', end: '10:30', label: 'Kontrol Sistemleri dersi' }],
  9: [{ id: '9-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' }],
  10: [{ id: '10-0', time: '09:00', end: '10:30', label: 'Kontrol Sistemleri dersi' }],
  11: [{ id: '11-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' }],
  15: [
    { id: '15-0', time: '', label: 'TÜBİTAK 2209-A son başvuru' },
    { id: '15-1', time: '09:00', end: '10:30', label: 'Kontrol Sistemleri dersi' },
    { id: '15-2', time: '13:00', end: '15:00', label: 'Proje toplantısı' },
  ],
  16: [{ id: '16-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' }],
  17: [{ id: '17-0', time: '09:00', end: '10:30', label: 'Kontrol Sistemleri dersi' }],
  18: [{ id: '18-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' }],
  22: [{ id: '22-0', time: '09:00', end: '10:30', label: 'Kontrol Sistemleri dersi' }],
  23: [
    { id: '23-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' },
    { id: '23-1', time: '16:00', end: '17:00', label: 'TEKNOFEST takım toplantısı' },
  ],
  24: [{ id: '24-0', time: '09:00', end: '10:30', label: 'Kontrol Sistemleri dersi' }],
  25: [{ id: '25-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' }],
  29: [{ id: '29-0', time: '09:00', end: '10:30', label: 'Kontrol Sistemleri dersi' }],
  30: [{ id: '30-0', time: '10:00', end: '12:00', label: 'Sinyaller ve Sistemler Lab' }],
};

export const AUG31_BLOCKS = [
  { s: 9, e: 10.5, label: 'Kontrol Sistemleri dersi' },
  { s: 14, e: 14.5, label: 'Kütüphane rezervasyonu' },
];

// Uygulamanın "bugün"ü — ana sayfadaki karşılama başlığıyla ("31 Ağustos 2026 ·
// Pazartesi") aynı referans tarih. Yeni eklenen kayıtlar ve istatistik
// hesaplamaları (bkz. stats.ts) bu tek noktadan besleniyor.
export const TODAY = '31.08.2026';

export function timeToHour(t: string): number | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h + (m || 0) / 60;
}
