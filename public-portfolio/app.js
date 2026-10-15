/* Portfolyo – dil geçişi, proje sekmeleri, beceri kartı, deneyim akordiyonu.
   Tüm içerik burada sabit olarak tanımlı; DOM yalnızca textContent ile doldurulur. */
(function () {
  'use strict';

  var UI = {
    tr: {
      title: 'Hatice Zeynep Demir – Portfolyo',
      docLabel: 'PORTFOLYO · REV. 2026.10',
      role: 'Mekatronik Mühendisliği öğrencisi',
      intro: "Marmara Üniversitesi'nde mekatronik mühendisliği okuyorum. Gömülü sistemler, görüntü işleme ve yapay zekâ destekli yazılım üzerinde projeler geliştiriyorum; uzun vadeli ilgim sağlık teknolojileri ve biyomekatronik.",
      emailBtn: 'E-posta gönder',
      figTitle: 'ŞEKİL 1 — KAPALI ÇEVRİM DENETİM',
      figAlt: 'Kapalı çevrim denetim blok diyagramı: referans, kontrolcü, süreç ve sensör geri beslemesi',
      s1: 'Projeler', s2: 'Deneyim', s3: 'Beceriler', s4label: '4.0 · İLETİŞİM',
      hint1: 'Bir proje seçin', hint2: 'Ayrıntı için satıra tıklayın', hint3: 'Bir beceriye gelin veya dokunun',
      stackKey: 'TEKNİK',
      specLabel: 'BECERİ KARTI',
      applied: 'Uygulamalı', learning: 'Öğreniyor',
      contactTitle: 'Birlikte çalışalım mı?',
      contactText: 'Staj, proje ve araştırma fırsatları için e-posta ile ulaşabilirsiniz.',
      nav: [
        { label: 'Projeler', href: '#projects' }, { label: 'Deneyim', href: '#experience' },
        { label: 'Beceriler', href: '#skills' }, { label: 'İletişim', href: '#contact' }
      ],
      cells: [
        ['ÖĞRENCİ', 'Hatice Zeynep Demir'], ['BÖLÜM', 'Mekatronik Müh.'], ['ÜNİVERSİTE', 'Marmara Üniv.'],
        ['SINIF', '3. sınıf'], ['MEZUNİYET', '2028'], ['DİLLER', 'TR · EN (B1)']
      ],
      groups: ['GÖMÜLÜ SİSTEMLER', 'YAZILIM VE YAPAY ZEKÂ', 'MÜHENDİSLİK ARAÇLARI'],
      keys: ['PROBLEM', 'ÇÖZÜM', 'DURUM']
    },
    en: {
      title: 'Hatice Zeynep Demir – Portfolio',
      docLabel: 'PORTFOLIO · REV. 2026.10',
      role: 'Mechatronics Engineering student',
      intro: 'I study mechatronics engineering at Marmara University. I build projects in embedded systems, computer vision and AI-assisted software, with a long-term interest in health technologies and biomechatronics.',
      emailBtn: 'Send an email',
      figTitle: 'FIG. 1 — CLOSED-LOOP CONTROL',
      figAlt: 'Closed-loop control block diagram: reference, controller, plant and sensor feedback',
      s1: 'Projects', s2: 'Experience', s3: 'Skills', s4label: '4.0 · CONTACT',
      hint1: 'Select a project', hint2: 'Click a row for details', hint3: 'Hover or tap a skill',
      stackKey: 'STACK',
      specLabel: 'SKILL CARD',
      applied: 'Hands-on', learning: 'Learning',
      contactTitle: "Let's work together?",
      contactText: 'For internships, projects and research opportunities, feel free to reach out by email.',
      nav: [
        { label: 'Projects', href: '#projects' }, { label: 'Experience', href: '#experience' },
        { label: 'Skills', href: '#skills' }, { label: 'Contact', href: '#contact' }
      ],
      cells: [
        ['STUDENT', 'Hatice Zeynep Demir'], ['DEPARTMENT', 'Mechatronics Eng.'], ['UNIVERSITY', 'Marmara Univ.'],
        ['YEAR', 'Year 3'], ['GRADUATION', '2028'], ['LANGUAGES', 'TR · EN (B1)']
      ],
      groups: ['EMBEDDED SYSTEMS', 'SOFTWARE AND AI', 'ENGINEERING TOOLS'],
      keys: ['PROBLEM', 'SOLUTION', 'STATUS']
    }
  };

  var PROJECTS = {
    tr: [
      {
        idx: 'P-01', title: 'ZEMA',
        rows: [
          'TEKNOFEST hakem değerlendirme sürecini yönetmek ve desteklemek için bir araç ihtiyacı (T3 Vakfı Yapay Zekâ Creathon, Problem 4).',
          'Hakemlerin değerlendirme sürecini yapay zekâ ile destekleyen bir web uygulaması.',
          'Salt okunur demo olarak yayında; işlem, yükleme ve silme kapalı.'
        ],
        tags: ['Next.js', 'Supabase', 'Gemini API', 'Vercel'],
        links: [
          { label: 'Canlı demo', url: 'https://zema-ai.vercel.app' },
          { label: 'Kaynak kod', url: 'https://github.com/zeynepdemir1/ZEMA-AI' }
        ]
      },
      {
        idx: 'P-02', title: 'ESP32 Model Araç',
        rows: [
          'Engelleri algılayıp hızını denetleyebilen bir model araç platformu.',
          'HC-SR04 ile mesafe ölçümü ve engel algılama mantığı; disk enkoderle hız ayarı.',
          'Geliştirme sürüyor. Planlanan: kamera ile görüntü işleme, sonrasında çoklu araç koordinasyonu.'
        ],
        tags: ['ESP32', 'HC-SR04', 'Enkoder'],
        links: [{ label: 'Kaynak kod', url: 'https://github.com/zeynepdemir1/deneyap-rc-car' }]
      },
      {
        idx: 'P-03', title: 'CNC Dosya Paylaşım Ağı',
        rows: [
          'CNC makinelerine üretim dosyaları USB ile elle taşınıyordu.',
          'Makineler ile ofis bilgisayarları arasında LAN üzerinden SMB dosya paylaşımı.',
          'Staj kapsamında kuruldu (Temmuz 2026).'
        ],
        tags: ['LAN', 'SMB / CIFS', 'CNC'],
        links: []
      }
    ],
    en: [
      {
        idx: 'P-01', title: 'ZEMA',
        rows: [
          'A need for a tool to manage and support the TEKNOFEST referee evaluation process (T3 Foundation AI Creathon, Problem 4).',
          'A web application that supports referees in the evaluation process using AI.',
          'Live as a read-only demo; actions, uploads and deletion are disabled.'
        ],
        tags: ['Next.js', 'Supabase', 'Gemini API', 'Vercel'],
        links: [
          { label: 'Live demo', url: 'https://zema-ai.vercel.app' },
          { label: 'Source code', url: 'https://github.com/zeynepdemir1/ZEMA-AI' }
        ]
      },
      {
        idx: 'P-02', title: 'ESP32 Model Car',
        rows: [
          'A model car platform that can detect obstacles and regulate its own speed.',
          'Distance measurement and obstacle-detection logic with an HC-SR04; speed control with disk encoders.',
          'In development. Planned: camera-based image processing, then multi-vehicle coordination.'
        ],
        tags: ['ESP32', 'HC-SR04', 'Encoder'],
        links: [{ label: 'Source code', url: 'https://github.com/zeynepdemir1/deneyap-rc-car' }]
      },
      {
        idx: 'P-03', title: 'CNC File-Sharing Network',
        rows: [
          'Production files were carried to the CNC machines by hand on USB drives.',
          'SMB file sharing over LAN between the machines and the office PCs.',
          'Set up during my internship (July 2026).'
        ],
        tags: ['LAN', 'SMB / CIFS', 'CNC'],
        links: []
      }
    ]
  };

  var JOBS = {
    tr: [
      { when: 'Temmuz 2026', role: 'Stajyer', org: 'Özdemir Çelik · Kocaeli', desc: 'Satış-projelendirme ve CNC üretim birimlerinde 18 iş günü. AutoCAD, Radan CAM ve ERP ile çalıştım; makineler ile ofis bilgisayarları arasında dosya paylaşım ağı kurdum.' },
      { when: '2. sınıf – günümüz', role: 'Sponsorluk birim başkanı, sonra etkinlik organizasyon birimi', org: 'Mekatronik Mühendisliği Kulübü (MMK)', desc: '4 kişilik sponsorluk ekibini yürüttüm: kulüp takımlarını fuarlarda ve mezun şirketlere tanıttım. Şu an etkinlik organizasyon biriminde görevliyim.' },
      { when: '2025', role: 'Takım kaptanı ve elektronik birim lideri', org: 'TEKNOFEST Model Uydu takımı', desc: 'Elektronik birimde bileşen ve malzeme araştırması yürüttüm.' }
    ],
    en: [
      { when: 'July 2026', role: 'Intern', org: 'Özdemir Çelik · Kocaeli', desc: '18 working days across sales-project planning and CNC production. Worked with AutoCAD, Radan CAM and ERP software; built a file-sharing network between machines and office PCs.' },
      { when: 'Year 2 – present', role: 'Sponsorship unit head, then event organization unit', org: 'Mechatronics Engineering Club (MMK)', desc: 'Led a four-person sponsorship team, pitching club teams to companies at industry fairs and to alumni-founded firms. Now part of the event organization unit.' },
      { when: '2025', role: 'Team captain and electronics unit lead', org: 'TEKNOFEST Model Satellite team', desc: 'Led component and material research for the electronics unit.' }
    ]
  };

  // g: grup, lvl: 'a' uygulamalı / 'l' öğreniyor
  var SKILLS = [
    { id: 'esp32', g: 0, lvl: 'a', tr: ['ESP32', 'Model araç projesinde kullandım; kodu Deneyap Kart üzerine de taşıdım.'], en: ['ESP32', 'Used in my model car project; I also ported the code to a Deneyap board.'] },
    { id: 'c', g: 0, lvl: 'l', tr: ['C', 'Bit operatörleri, işaretçiler ve bellek yönetimini çalışıyorum.'], en: ['C', 'Studying bitwise operators, pointers and memory management.'] },
    { id: 'rtos', g: 0, lvl: 'l', tr: ['RTOS', 'Giriş seviyesinde öğreniyorum.'], en: ['RTOS', 'Learning at an introductory level.'] },
    { id: 'sensors', g: 0, lvl: 'a', tr: ['Sensör entegrasyonu', 'HC-SR04 mesafe sensörü, disk enkoder ve hız sayıcı modülü.'], en: ['Sensor integration', 'HC-SR04 distance sensor, disk encoders and a speed counter module.'] },
    { id: 'python', g: 1, lvl: 'l', tr: ['Python', 'Kurs üzerinden öğreniyorum; hedefim görüntü işleme ve büyük dil modelleri.'], en: ['Python', 'Learning through a course; aiming at image processing and large language models.'] },
    { id: 'opencv', g: 1, lvl: 'a', tr: ['OpenCV', 'Görüntü işleme çalışmalarında uygulamalı deneyim.'], en: ['OpenCV', 'Hands-on experience in image-processing work.'] },
    { id: 'tflite', g: 1, lvl: 'a', tr: ['TensorFlow Lite', 'Uygulamalı deneyim.'], en: ['TensorFlow Lite', 'Hands-on experience.'] },
    { id: 'linux', g: 1, lvl: 'a', tr: ['Linux', 'Ubuntu, ana işletim sistemim ve günlük geliştirme ortamım.'], en: ['Linux', 'Ubuntu is my main operating system and daily development environment.'] },
    { id: 'autocad', g: 2, lvl: 'a', tr: ['AutoCAD', 'Stajda üretim çizimleri hazırladım.'], en: ['AutoCAD', 'Prepared production drawings during my internship.'] },
    { id: 'radan', g: 2, lvl: 'a', tr: ['Radan CAM', 'Stajda kesim yerleşimi (nesting) çalışmalarında kullandım.'], en: ['Radan CAM', 'Used for cutting-layout (nesting) work during my internship.'] },
    { id: 'lan', g: 2, lvl: 'a', tr: ['LAN / SMB ağı', 'CNC makineleri ile ofis bilgisayarları arasında dosya paylaşımı kurdum.'], en: ['LAN / SMB networking', 'Set up file sharing between CNC machines and office PCs.'] }
  ];

  var state = {
    lang: ((navigator.language || 'tr').toLowerCase().indexOf('tr') === 0) ? 'tr' : 'en',
    proj: 0, skill: 'esp32', job: 0
  };
  var tabEls = [], jobEls = [], chipEls = [];

  function $(id) { return document.getElementById(id); }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined) { e.textContent = text; }
    return e;
  }
  function clear(node) { while (node.firstChild) { node.removeChild(node.firstChild); } }
  function ui() { return UI[state.lang]; }

  function buildStatic() {
    var u = ui();
    document.documentElement.lang = state.lang;
    document.title = u.title;
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (n) {
      n.textContent = u[n.getAttribute('data-i18n')];
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-aria]'), function (n) {
      n.setAttribute('aria-label', u[n.getAttribute('data-i18n-aria')]);
    });
    $('lang-tr').setAttribute('aria-pressed', String(state.lang === 'tr'));
    $('lang-en').setAttribute('aria-pressed', String(state.lang === 'en'));

    var nav = $('nav'); clear(nav);
    u.nav.forEach(function (n) {
      var a = h('a', 'navlink', n.label); a.href = n.href; nav.appendChild(a);
    });
    var cells = $('cells'); clear(cells);
    u.cells.forEach(function (c) {
      var d = h('div', 'cell'); d.appendChild(h('dt', null, c[0])); d.appendChild(h('dd', null, c[1])); cells.appendChild(d);
    });
  }

  function buildTabs() {
    var box = $('tabs'); clear(box); tabEls = [];
    PROJECTS[state.lang].forEach(function (p, i) {
      var b = h('button', 'tab'); b.type = 'button';
      b.appendChild(h('span', 'tab-idx mono', p.idx));
      b.appendChild(h('span', 'tab-title', p.title));
      b.addEventListener('click', function () { state.proj = i; updateProject(); });
      box.appendChild(b); tabEls.push(b);
    });
  }

  function updateProject() {
    var p = PROJECTS[state.lang][state.proj], u = ui();
    tabEls.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === state.proj)); });
    $('card-title').textContent = p.title;
    $('card-id').textContent = p.idx;
    var rows = $('card-rows'); clear(rows);
    p.rows.forEach(function (text, i) {
      var r = h('div', 'row'); r.appendChild(h('dt', null, u.keys[i])); r.appendChild(h('dd', null, text)); rows.appendChild(r);
    });
    var stack = h('div', 'row'); stack.appendChild(h('dt', null, u.stackKey));
    var dd = h('dd'); var tags = h('div', 'tagrow');
    p.tags.forEach(function (t) { tags.appendChild(h('span', 'tag', t)); });
    dd.appendChild(tags); stack.appendChild(dd); rows.appendChild(stack);
    var links = $('card-links'); clear(links);
    p.links.forEach(function (l) {
      var a = h('a', null, l.label + ' →'); a.href = l.url; links.appendChild(a);
    });
  }

  function buildJobs() {
    var box = $('jobs'); clear(box); jobEls = [];
    JOBS[state.lang].forEach(function (j, i) {
      var wrap = h('div', 'job');
      var b = h('button', 'jobbtn'); b.type = 'button';
      b.appendChild(h('span', 'job-when', j.when));
      var main = h('span', 'job-main');
      main.appendChild(h('span', 'job-role', j.role));
      main.appendChild(h('span', 'job-org', j.org));
      b.appendChild(main);
      var sign = h('span', 'job-sign'); sign.setAttribute('aria-hidden', 'true'); b.appendChild(sign);
      var desc = h('p', 'jobdesc', j.desc);
      b.addEventListener('click', function () { state.job = (state.job === i) ? -1 : i; updateJobs(); });
      wrap.appendChild(b); wrap.appendChild(desc); box.appendChild(wrap);
      jobEls.push({ btn: b, sign: sign, desc: desc });
    });
  }

  function updateJobs() {
    jobEls.forEach(function (j, i) {
      var open = (i === state.job);
      j.btn.setAttribute('aria-expanded', String(open));
      j.sign.textContent = open ? '−' : '+';
      j.desc.hidden = !open;
    });
  }

  function buildGroups() {
    var box = $('groups'); clear(box); chipEls = [];
    ui().groups.forEach(function (name, gi) {
      var g = h('div', 'group'); g.appendChild(h('h3', null, name));
      var chips = h('div', 'chips');
      SKILLS.forEach(function (s) {
        if (s.g !== gi) { return; }
        var b = h('button', 'chip', s[state.lang][0]); b.type = 'button';
        function pick() { if (state.skill !== s.id) { state.skill = s.id; updateSkill(); } }
        b.addEventListener('click', pick);
        b.addEventListener('mouseenter', pick);
        b.addEventListener('focus', pick);
        chips.appendChild(b); chipEls.push({ id: s.id, el: b });
      });
      g.appendChild(chips); box.appendChild(g);
    });
  }

  function updateSkill() {
    var u = ui(), cur = SKILLS[0];
    SKILLS.forEach(function (s) { if (s.id === state.skill) { cur = s; } });
    chipEls.forEach(function (c) { c.el.setAttribute('aria-pressed', String(c.id === state.skill)); });
    $('spec-name').textContent = cur[state.lang][0];
    $('spec-text').textContent = cur[state.lang][1];
    var badge = $('spec-badge');
    badge.textContent = cur.lvl === 'a' ? u.applied : u.learning;
    badge.className = 'badge' + (cur.lvl === 'a' ? ' is-applied' : '');
  }

  function render() {
    buildStatic(); buildTabs(); updateProject(); buildJobs(); updateJobs(); buildGroups(); updateSkill();
  }

  $('lang-tr').addEventListener('click', function () { state.lang = 'tr'; render(); });
  $('lang-en').addEventListener('click', function () { state.lang = 'en'; render(); });
  render();
})();
