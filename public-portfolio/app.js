/* Portfolyo – parçacık motoru, dil geçişi, proje sekmeleri, beceri kartı, deneyim akordiyonu.
   Tüm içerik burada sabit olarak tanımlı; DOM yalnızca textContent ile doldurulur. */
(function () {
  'use strict';

  var UI = {
    tr: {
      title: 'Hatice Zeynep Demir – Portfolyo',
      
      role: 'Mekatronik Mühendisliği öğrencisi',
      intro: "Marmara Üniversitesi'nde mekatronik mühendisliği okuyorum. Gömülü sistemler, görüntü işleme ve yapay zekâ destekli yazılım üzerinde projeler geliştiriyorum; uzun vadeli ilgim sağlık teknolojileri ve biyomekatronik.",
      emailBtn: 'E-posta gönder', navCta: 'İletişim', shapeLabel: 'İLGİ ALANI', shapeAria: 'İlgi alanına göre şekil seç',
      shapes: ['Mekatronik', 'Yapay zekâ', 'Model uydu'],
      s1: 'Projeler', s2: 'Deneyim', s3: 'Beceriler', s4label: '04 · İLETİŞİM',
      hint1: 'Bir proje seçin', hint2: 'Ayrıntı için satıra tıklayın', hint3: 'Bir beceriye gelin veya dokunun',
      stackKey: 'TEKNİK',
      specLabel: 'BECERİ KARTI',
      applied: 'Uygulamalı', learning: 'Öğreniyor',
      contactTitle: 'Birlikte çalışalım mı?',
      contactText: 'Staj, proje ve araştırma fırsatları için e-posta ile ulaşabilirsiniz.',
      nav: [
        { label: 'Projeler', href: '#projects' }, { label: 'Deneyim', href: '#experience' },
        { label: 'Beceriler', href: '#skills' }
      ],
      groups: ['GÖMÜLÜ SİSTEMLER', 'YAZILIM VE YAPAY ZEKÂ', 'MÜHENDİSLİK ARAÇLARI'],
      keys: ['PROBLEM', 'ÇÖZÜM', 'DURUM']
    },
    en: {
      title: 'Hatice Zeynep Demir – Portfolio',
      
      role: 'Mechatronics Engineering student',
      intro: 'I study mechatronics engineering at Marmara University. I build projects in embedded systems, computer vision and AI-assisted software, with a long-term interest in health technologies and biomechatronics.',
      emailBtn: 'Send an email', navCta: 'Contact', shapeLabel: 'FOCUS', shapeAria: 'Pick a shape by focus area',
      shapes: ['Mechatronics', 'AI', 'Model satellite'],
      s1: 'Projects', s2: 'Experience', s3: 'Skills', s4label: '04 · CONTACT',
      hint1: 'Select a project', hint2: 'Click a row for details', hint3: 'Hover or tap a skill',
      stackKey: 'STACK',
      specLabel: 'SKILL CARD',
      applied: 'Hands-on', learning: 'Learning',
      contactTitle: "Let's work together?",
      contactText: 'For internships, projects and research opportunities, feel free to reach out by email.',
      nav: [
        { label: 'Projects', href: '#projects' }, { label: 'Experience', href: '#experience' },
        { label: 'Skills', href: '#skills' }
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

  // Parçacık motoru: dişli → sinir ağı → model uydu arasında şekil değiştirir.
  function startEngine(canvas, initialShape, onAuto) {
          let ctx = null;
      try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
      if (!ctx) { return; }
      const N = 1500;
      const TAU = Math.PI * 2;
      let reduce = false;
      try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }

      let seed = 11;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      const finish = (pts, s) => {
        const out = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          out[i * 3] = pts[i * 3] * s; out[i * 3 + 1] = pts[i * 3 + 1] * s; out[i * 3 + 2] = pts[i * 3 + 2] * s;
        }
        return out;
      };

      const gear = () => {
        const p = [];
        const teeth = 12;
        for (let i = 0; i < N; i++) {
          const u = i / N;
          let x, y, z;
          if (u < 0.62) {
            const th = rnd() * TAU;
            const seg = ((th / TAU) * teeth) % 1;
            const tooth = (seg > 0.12 && seg < 0.46) ? 0.22 : 0;
            const rr = 0.62 + rnd() * (0.36 + tooth);
            x = Math.cos(th) * rr; y = Math.sin(th) * rr; z = (rnd() - 0.5) * 0.34;
          } else if (u < 0.8) {
            const th = rnd() * TAU; const rr = 0.16 + rnd() * 0.14;
            x = Math.cos(th) * rr; y = Math.sin(th) * rr; z = (rnd() - 0.5) * 0.44;
          } else {
            const a = Math.floor(rnd() * 4) * (TAU / 4) + 0.4;
            const t = 0.3 + rnd() * 0.34; const j = (rnd() - 0.5) * 0.1;
            x = Math.cos(a) * t - Math.sin(a) * j; y = Math.sin(a) * t + Math.cos(a) * j; z = (rnd() - 0.5) * 0.2;
          }
          p.push(x, y, z);
        }
        return finish(p, 1.05);
      };

      const net = () => {
        const layers = [4, 6, 6, 3];
        const nodes = [];
        for (let l = 0; l < layers.length; l++) {
          const n = layers[l]; const arr = [];
          for (let k = 0; k < n; k++) {
            const a = (k / n) * TAU + l * 0.5; const r = 0.36 + n * 0.07;
            arr.push([(l / (layers.length - 1) - 0.5) * 2.3, Math.cos(a) * r, Math.sin(a) * r]);
          }
          nodes.push(arr);
        }
        const edges = [];
        for (let l = 0; l < layers.length - 1; l++) {
          for (let a = 0; a < nodes[l].length; a++) {
            for (let b = 0; b < nodes[l + 1].length; b++) { edges.push([nodes[l][a], nodes[l + 1][b]]); }
          }
        }
        const flat = [];
        nodes.forEach((arr) => arr.forEach((q) => flat.push(q)));
        const p = [];
        const nodePts = Math.floor(N * 0.14);
        const edgePts = N - nodePts;
        for (let i = 0; i < edgePts; i++) {
          const e = edges[i % edges.length]; const t = rnd();
          p.push(e[0][0] + (e[1][0] - e[0][0]) * t + (rnd() - 0.5) * 0.02, e[0][1] + (e[1][1] - e[0][1]) * t + (rnd() - 0.5) * 0.02, e[0][2] + (e[1][2] - e[0][2]) * t + (rnd() - 0.5) * 0.02);
        }
        for (let i = 0; i < nodePts; i++) {
          const q = flat[i % flat.length];
          p.push(q[0] + (rnd() - 0.5) * 0.07, q[1] + (rnd() - 0.5) * 0.07, q[2] + (rnd() - 0.5) * 0.07);
        }
        return finish(p, 0.95);
      };

      const sat = () => {
        const p = [];
        for (let i = 0; i < N; i++) {
          const u = i / N;
          let x, y, z;
          if (u < 0.3) {
            const hx = 0.28, hy = 0.28, hz = 0.4; const f = Math.floor(rnd() * 6);
            x = (rnd() * 2 - 1) * hx; y = (rnd() * 2 - 1) * hy; z = (rnd() * 2 - 1) * hz;
            if (f === 0) { x = hx; } else if (f === 1) { x = -hx; } else if (f === 2) { y = hy; } else if (f === 3) { y = -hy; } else if (f === 4) { z = hz; } else { z = -hz; }
          } else if (u < 0.68) {
            const side = rnd() < 0.5 ? -1 : 1;
            x = side * (0.45 + rnd() * 1.0); y = (rnd() * 2 - 1) * 0.3; z = (rnd() - 0.5) * 0.02;
            if (rnd() < 0.5) { x = side * (0.45 + Math.round(rnd() * 10) * 0.1); } else { y = Math.round((rnd() * 2 - 1) * 3) * 0.1; }
          } else if (u < 0.74) {
            x = 0; y = 0.3 + rnd() * 0.55; z = 0;
          } else if (u < 0.8) {
            const th = rnd() * TAU; x = Math.cos(th) * 0.14; y = 0.86 + Math.sin(th) * 0.05; z = Math.sin(th) * 0.14;
          } else {
            const th = rnd() * TAU; const R = 1.7;
            x = Math.cos(th) * R; y = Math.sin(th) * R * Math.sin(0.5); z = Math.sin(th) * R * Math.cos(0.5);
          }
          p.push(x, y, z);
        }
        return finish(p, 0.82);
      };

      const shapes = [gear(), net(), sat()];
      const pos = new Float32Array(N * 3);
      const col = new Uint8Array(N);
      const spd = new Float32Array(N);
      const PAL = ['255,219,218', '219,127,142', '213,197,200', '157,163,164'];
      const WEIGHTS = [0.36, 0.3, 0.2, 0.14];
      for (let i = 0; i < N; i++) {
        pos[i * 3] = (rnd() - 0.5) * 5; pos[i * 3 + 1] = (rnd() - 0.5) * 5; pos[i * 3 + 2] = (rnd() - 0.5) * 5;
        const r = rnd(); let acc = 0; let c = 0;
        for (let k = 0; k < WEIGHTS.length; k++) { acc += WEIGHTS[k]; if (r <= acc) { c = k; break; } }
        col[i] = c; spd[i] = 0.6 + rnd() * 0.9;
      }
      const tris = [];
      for (let i = 0; i < 26; i++) {
        tris.push({ x: rnd(), y: rnd(), s: 5 + rnd() * 11, r: rnd() * TAU, vr: (rnd() - 0.5) * 0.5, vx: (rnd() - 0.5) * 0.012, vy: (rnd() - 0.5) * 0.012, c: Math.floor(rnd() * 4), f: rnd() < 0.3, z: 0.4 + rnd() * 1.2 });
      }

      let cur = initialShape || 0;
      let target = shapes[cur];
      let W = 1, H = 1, dpr = 1;
      let mx = 0, my = 0, smx = 0, smy = 0;
      let raf = 0;
      let lastSwitch = performance.now();
      let lastInteract = -1e9;
      let alive = true;

      const resize = () => {
        const par = canvas.parentNode;
        if (!par) { return; }
        const r = par.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(1, r.width); H = Math.max(1, r.height);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      };
      const onMove = (e) => {
        const r = canvas.getBoundingClientRect();
        mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1));
        my = Math.max(-1, Math.min(1, ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1));
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('resize', resize);
      resize();

      const setShape = (i, auto) => {
        cur = i; target = shapes[i];
        const now = performance.now();
        lastSwitch = now;
        if (!auto) { lastInteract = now; }
        if (reduce) { for (let k = 0; k < N * 3; k++) { pos[k] = target[k]; } }
      };

      const tri = (x, y, s, rot) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.87, s * 0.5); ctx.lineTo(-s * 0.87, s * 0.5); ctx.closePath();
        ctx.restore();
      };

      const frame = (now) => {
        if (!alive) { return; }
        raf = requestAnimationFrame(frame);
        const t = now / 1000;
        if (!reduce && now - lastInteract > 12000 && now - lastSwitch > 5600) {
          const nx = (cur + 1) % shapes.length;
          setShape(nx, true);
          if (onAuto) { onAuto(nx); }
        }
        smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
        const ay = reduce ? 0.5 : t * 0.28 + smx * 0.55;
        const ax = -0.28 + smy * 0.3;
        const cy_ = Math.cos(ay), sy_ = Math.sin(ay), cx_ = Math.cos(ax), sx_ = Math.sin(ax);
        const wide = W > 900;
        const cx = wide ? W * 0.7 : W * 0.5;
        const cy = H * 0.5;
        const scale = Math.min(H * 0.3, W * (wide ? 0.17 : 0.28));
        const k0 = reduce ? 1 : 0.055;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        ctx.lineWidth = 1;
        for (let i = 0; i < tris.length; i++) {
          const q = tris[i];
          if (!reduce) {
            q.x += q.vx * 0.016; q.y += q.vy * 0.016; q.r += q.vr * 0.016;
            if (q.x < -0.05) { q.x = 1.05; } else if (q.x > 1.05) { q.x = -0.05; }
            if (q.y < -0.05) { q.y = 1.05; } else if (q.y > 1.05) { q.y = -0.05; }
          }
          const px = q.x * W - smx * 24 * q.z, py = q.y * H - smy * 24 * q.z;
          tri(px, py, q.s, q.r);
          if (q.f) { ctx.fillStyle = 'rgba(' + PAL[q.c] + ',0.28)'; ctx.fill(); }
          ctx.strokeStyle = 'rgba(' + PAL[q.c] + ',0.55)'; ctx.stroke();
        }

        for (let i = 0; i < N; i++) {
          const j = i * 3;
          const k = k0 * spd[i];
          pos[j] += (target[j] - pos[j]) * k;
          pos[j + 1] += (target[j + 1] - pos[j + 1]) * k;
          pos[j + 2] += (target[j + 2] - pos[j + 2]) * k;
        }

        ctx.globalCompositeOperation = 'lighter';
        for (let c = 0; c < PAL.length; c++) {
          ctx.fillStyle = 'rgb(' + PAL[c] + ')';
          for (let i = 0; i < N; i++) {
            if (col[i] !== c) { continue; }
            const j = i * 3;
            const wob = reduce ? 0 : Math.sin(t * 1.1 + i) * 0.012;
            const x = pos[j] + wob, y = pos[j + 1] + wob, z = pos[j + 2];
            const x1 = x * cy_ + z * sy_;
            const z1 = -x * sy_ + z * cy_;
            const y1 = y * cx_ - z1 * sx_;
            const z2 = y * sx_ + z1 * cx_;
            const pr = 3.4 / (3.4 + z2);
            const sz = 0.8 + 1.7 * pr;
            ctx.globalAlpha = Math.max(0.12, Math.min(0.95, 0.3 + (pr - 0.8) * 1.5));
            ctx.fillRect(cx + x1 * scale * pr - sz / 2, cy + y1 * scale * pr - sz / 2, sz, sz);
          }
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      };
      raf = requestAnimationFrame(frame);

      return {
        setShape: (i) => setShape(i, false),
        destroy: () => {
          alive = false;
          cancelAnimationFrame(raf);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('resize', resize);
        }
      };
  }

  var state = {
    lang: ((navigator.language || 'tr').toLowerCase().indexOf('tr') === 0) ? 'tr' : 'en',
    proj: 0, skill: 'esp32', job: 0, shape: 0
  };
  var engine = null, shapeEls = [];
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
    $('shapebar').setAttribute('aria-label', u.shapeAria);
    $('lang-tr').setAttribute('aria-pressed', String(state.lang === 'tr'));
    $('lang-en').setAttribute('aria-pressed', String(state.lang === 'en'));

    var nav = $('nav'); clear(nav);
    u.nav.forEach(function (n) {
      var a = h('a', 'navlink', n.label); a.href = n.href; nav.appendChild(a);
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


  function buildShapes() {
    var bar = $('shapebar');
    shapeEls.forEach(function (b) { bar.removeChild(b); });
    shapeEls = [];
    ui().shapes.forEach(function (label, i) {
      var b = h('button', 'shapebtn', label); b.type = 'button';
      b.addEventListener('click', function () {
        state.shape = i; updateShapes();
        if (engine) { engine.setShape(i); }
      });
      bar.appendChild(b); shapeEls.push(b);
    });
    updateShapes();
  }
  function updateShapes() {
    shapeEls.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === state.shape)); });
  }

  function render() {
    buildStatic(); buildShapes(); buildTabs(); updateProject(); buildJobs(); updateJobs(); buildGroups(); updateSkill();
  }

  $('lang-tr').addEventListener('click', function () { state.lang = 'tr'; render(); });
  $('lang-en').addEventListener('click', function () { state.lang = 'en'; render(); });
  render();

  var canvas = $('hero-canvas');
  if (canvas) {
    engine = startEngine(canvas, state.shape, function (i) { state.shape = i; updateShapes(); });
  }
})();
