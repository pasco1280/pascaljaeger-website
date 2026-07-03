/* ============================================================
   PASCAL JÄGER 4.0 — INTERACTIONS
   Parallax via individuelle translate/rotate-Props (konfliktfrei
   mit Hover-transform). Tilt via transform. Lenis Smooth-Scroll.
   ============================================================ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vh = () => window.innerHeight;

  /* ---------------------------------------------------------
     SMOOTH SCROLL (Lenis) — der ruhige Lauf
     --------------------------------------------------------- */
  let lenis = null;
  if (!reduced && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
  }
  // In-Page-Anker sauber & sanft anfahren
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -10, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------
     PARALLAX (Scroll) — schreibt translate/rotate
     --------------------------------------------------------- */
  const pxNodes = [];
  document.querySelectorAll('[data-px],[data-px-x]').forEach(el => {
    pxNodes.push({
      el,
      y:   parseFloat(el.dataset.px) || 0,
      x:   parseFloat(el.dataset.pxX) || 0,
      base: 0, cur: 0, tgt: 0
    });
  });
  function measurePx() {
    pxNodes.forEach(n => {
      const prev = n.el.style.translate;
      n.el.style.translate = '';
      const r = n.el.getBoundingClientRect();
      n.base = window.scrollY + r.top + r.height / 2;
      n.el.style.translate = prev;
    });
  }

  /* ---------------------------------------------------------
     MOUSE TILT (Tiefe) — schreibt transform
     --------------------------------------------------------- */
  const tiltGroups = [];
  document.querySelectorAll('[data-tilt]').forEach(group => {
    const layers = [...group.querySelectorAll('[data-depth]')].map(el => ({
      el, depth: parseFloat(el.dataset.depth) || 1, x: 0, y: 0, tx: 0, ty: 0
    }));
    const g = { group, layers, mx: 0, my: 0 };
    tiltGroups.push(g);
    if (!isTouch && !reduced) {
      window.addEventListener('mousemove', e => {
        const r = group.getBoundingClientRect();
        g.mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        g.my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }, { passive: true });
    }
  });

  /* ---------------------------------------------------------
     CURSOR SPOTLIGHT (radioaktiv grün)
     --------------------------------------------------------- */
  document.querySelectorAll('[data-spotlight]').forEach(container => {
    const color = container.dataset.spotlight || '#7DDF64';
    if (isTouch || reduced) { container.style.color = color; return; }
    let mx = -9999, my = -9999, cx = -9999, cy = -9999;
    const paint = () => {
      cx = lerp(cx, mx, 0.12); cy = lerp(cy, my, 0.12);
      container.style.backgroundImage =
        `radial-gradient(circle at ${cx}px ${cy}px, ${color} 0%, ${color} 9%, transparent 34%)`;
      requestAnimationFrame(paint);
    };
    container.addEventListener('mousemove', e => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    });
    container.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });
    container.style.webkitTextFillColor = 'transparent';
    container.style.webkitBackgroundClip = 'text';
    container.style.backgroundClip = 'text';
    paint();
  });

  /* ---------------------------------------------------------
     FALLING LETTERS
     --------------------------------------------------------- */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    const chars = [];
    [...text].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.setAttribute('aria-hidden', 'true');
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, opacity';
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
      if (ch !== ' ') chars.push(span);
    });
    return chars;
  }
  document.querySelectorAll('[data-fall]').forEach(el => {
    const chars = splitChars(el);
    if (reduced) { chars.forEach(c => { c.style.opacity = 1; }); el._chars = chars; return; }
    chars.forEach((c, i) => {
      const rot = (Math.random() * 70 - 35);
      c.style.transform = `translateY(-118vh) rotate(${rot}deg)`;
      c.style.opacity = '0';
      c.style.transition = `transform 1s cubic-bezier(.16,1.1,.3,1) ${0.25 + i * 0.06}s, opacity .5s ${0.25 + i * 0.06}s`;
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      chars.forEach(c => { c.style.transform = 'translateY(0) rotate(0)'; c.style.opacity = '1'; });
    }));
    el._chars = chars;
  });
  const scatterEls = [...document.querySelectorAll('[data-fall][data-scatter]')];

  /* ---------------------------------------------------------
     VELOCITY MARQUEE
     --------------------------------------------------------- */
  const marquees = [];
  document.querySelectorAll('.marquee').forEach(m => {
    const track = m.querySelector('.track');
    if (!track) return;
    const baseDir = m.dataset.dir === 'left' ? 1 : -1;
    const first = track.querySelector('.item');
    let guard = 0;
    while (track.scrollWidth < window.innerWidth * 2 && guard < 12) {
      track.appendChild(first.cloneNode(true)); guard++;
    }
    const single = first.getBoundingClientRect().width;
    const mq = { track, pos: 0, single, baseDir, vis: true };
    marquees.push(mq); m._mq = mq;
  });

  /* ---------------------------------------------------------
     SOUND BARS
     --------------------------------------------------------- */
  const barGroups = [];
  document.querySelectorAll('[data-bars]').forEach(container => {
    const count = parseInt(container.dataset.bars) || 28;
    const palette = ['var(--grass)', 'var(--hot)', 'var(--bubble)'];
    const bars = [];
    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'bar';
      b.style.background = i < count * 0.36 ? palette[0] : i < count * 0.64 ? palette[1] : palette[2];
      container.appendChild(b);
      bars.push(b);
    }
    const g = { bars, vis: true };
    barGroups.push(g); container._bg = g;
  });

  // Animationen nur laufen lassen, wenn im Viewport (Performance)
  const visIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.target._mq) e.target._mq.vis = e.isIntersecting;
    if (e.target._bg) e.target._bg.vis = e.isIntersecting;
  }), { rootMargin: '140px' });
  document.querySelectorAll('.marquee, [data-bars]').forEach(el => visIO.observe(el));

  /* ---------------------------------------------------------
     BINARY FLIPPER
     --------------------------------------------------------- */
  const CHARS = '01ABCDEF!?#@%';
  document.querySelectorAll('[data-flip]').forEach(el => {
    if (isTouch || reduced) return;
    const original = el.textContent;
    let running = false, id = null;
    const start = () => {
      if (running) return; running = true;
      const arr = original.split('');
      let frame = 0; const MAX = 9;
      id = setInterval(() => {
        el.textContent = arr.map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < frame / MAX) return ch;
          return CHARS[(Math.random() * CHARS.length) | 0];
        }).join('');
        frame++;
        if (frame > arr.length * MAX) { clearInterval(id); el.textContent = original; running = false; }
      }, 36);
    };
    // Auf die Karte hören, nicht auf das verschachtelte Label
    const host = el.closest('.card') || el;
    host.addEventListener('mouseenter', start);
  });

  /* ---------------------------------------------------------
     REVEAL ON SCROLL
     --------------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, .reveal-line').forEach(el => io.observe(el));

  document.querySelectorAll('[data-reveal-stagger]').forEach(group => {
    const kids = [...group.children];
    const gio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        kids.forEach((k, i) => { k.style.transitionDelay = (i * 0.1) + 's'; k.classList.add('in'); });
        gio.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    gio.observe(group);
  });

  /* ---------------------------------------------------------
     COUNTERS
     --------------------------------------------------------- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        if (reduced) { el.textContent = target.toLocaleString('de-DE') + suffix; return; }
        const dur = 1600; let begin = null;
        const step = (ts) => {
          if (!begin) begin = ts;
          const p = clamp((ts - begin) / dur, 0, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('de-DE') + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    cio.observe(el);
  });

  /* ---------------------------------------------------------
     CUSTOM CURSOR — eleganter Ring, kein Flacker
     --------------------------------------------------------- */
  if (!isTouch && !reduced) {
    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);
    let dx = 0, dy = 0, tx = 0, ty = 0, shown = false;
    window.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; dot.style.opacity = '1'; dx = tx; dy = ty; }
    }, { passive: true });
    const moveDot = () => {
      dx = lerp(dx, tx, 0.2); dy = lerp(dy, ty, 0.2);
      dot.style.transform = `translate3d(${dx}px,${dy}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(moveDot);
    };
    moveDot();
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('big'));
      el.addEventListener('mouseleave', () => dot.classList.remove('big'));
    });
  }

  /* ---------------------------------------------------------
     REEL — gepinnter Hero (SVG, vektorscharf):
     "Pascal" monochrom, jeder Buchstabe fällt anders (scroll-
     gescrubbt, reversibel). Das "s" ist ein Fenster in ein
     3D-Equalizer-Feld (grün, schwarze Linien) mit schwarzem
     Rand und expandiert sauber in den vollen Viewport.
     Die Wellen ruhen; ein Klick lässt sie kurz "atmen".
     --------------------------------------------------------- */
  function initReel() {
    const reel = document.querySelector('.reel');
    if (!reel) return;
    const pin = reel.querySelector('.reel-pin');
    const svg = reel.querySelector('.reel-svg');
    const intro = reel.querySelector('.reel-intro');
    const hint = reel.querySelector('.reel-hint');
    const NS = 'http://www.w3.org/2000/svg';

    // Das s steht im Wort: Ink-Füllung in Ruhe, weicht als Tor dem Portal-Licht
    const sFill = document.createElementNS(NS, 'text'); sFill.textContent = 's';
    sFill.setAttribute('fill', '#1C1B19');
    const sOutline = document.createElementNS(NS, 'text'); sOutline.textContent = 's';
    sOutline.setAttribute('fill', 'none'); sOutline.setAttribute('stroke', '#111');
    sOutline.setAttribute('stroke-width', '3'); sOutline.setAttribute('vector-effect', 'non-scaling-stroke');
    const ref = document.createElementNS(NS, 'text'); ref.textContent = 'Pascal'; ref.setAttribute('opacity', '0');
    svg.appendChild(sFill); svg.appendChild(sOutline); svg.appendChild(ref);

    // Frame-Layer: Stadt als Bühne hinter allem, Strand nur im s-Portal.
    // Das Portal wird als Canvas-Maske geschnitten (destination-in mit der
    // Glyphe selbst): ein CSS-clip auf SVG-Text kollabiert bei camZ > ~40,
    // weil die Transform-Koordinaten die Clip-Rasterung sprengen.
    const cityCv = document.createElement('canvas');  cityCv.className = 'reel-frames';
    const beachCv = document.createElement('canvas'); beachCv.className = 'reel-frames';
    pin.insertBefore(cityCv, svg); pin.insertBefore(beachCv, svg);
    const cityCtx = cityCv.getContext('2d'), beachCtx = beachCv.getContext('2d');

    // 3D-Karton-Buchstaben (HTML, CSS-3D) — Stirnseite ink, Tiefe in Kraftbraun
    const lettersHost = reel.querySelector('.reel-letters');
    const DEPTH_N = 9, DEPTH_STEP = 2.4;
    // Beat-Sync aus dem Take (ffmpeg-Szenenanalyse seqA_take1): die zwei frühen
    // Beben (p 0.14/0.18) sind Vorbeben, die Stadt spürt es zuerst. Die
    // Buchstaben-Aufschläge (Fallmitte) liegen auf den schweren Kollapsen
    // bei p 0.30, 0.40 und 0.47.
    const fallCfg = [
      { i: 1, ch: 'a', s: 0.127, sp: 0.35, dist: 1.10, dx: 18,  rz: 80,  rx: 210, bounce: false },
      { i: 0, ch: 'P', s: 0.140, sp: 0.32, dist: 1.25, dx: -55, rz: -95, rx: 150, bounce: false },
      { i: 4, ch: 'a', s: 0.206, sp: 0.38, dist: 1.00, dx: -18, rz: -70, rx: 280, bounce: true  },
      { i: 3, ch: 'c', s: 0.210, sp: 0.41, dist: 1.32, dx: 30,  rz: 170, rx: 120, bounce: false },
      { i: 5, ch: 'l', s: 0.258, sp: 0.43, dist: 1.05, dx: 64,  rz: -45, rx: 95,  bounce: false },
    ];
    const letters = fallCfg.map(cfg => {
      const el = document.createElement('div'); el.className = 'rl3d';
      for (let k = 0; k < DEPTH_N; k++) {
        const s = document.createElement('span'); s.className = 'ly'; s.textContent = cfg.ch;
        s.style.transform = `translateZ(${(-k * DEPTH_STEP).toFixed(1)}px)`;
        s.style.color = k === 0 ? '#1C1B19' : `hsl(33 38% ${Math.max(33, 57 - k * 3)}%)`;
        el.appendChild(s);
      }
      el.style.transform = 'perspective(720px)';   // schon vor dem ersten Frame flach (ink)
      lettersHost.appendChild(el);
      return Object.assign({}, cfg, { el, cx: 0 });
    });

    let W = 0, H = 0, fontPx = 0, baseY = 0, sX = 0, ax = 0, ay = 0, coverR = 0, rCss = 0, zMax = 40, dpr = 1, lastP = -1, framesDirty = false, freezeP = null;

    /* ---- KULISSENBRUCH: Phase-Map — alles ist reine Funktion von p ---- */
    const PM = {
      stadt:   [0.05, 0.52],   // Frame-Fenster Stadt (davor Frame 0, danach letztes halten)
      tor:     [0.28, 0.42],   // Ink-Füllung des s weicht dem Portal-Licht
      zoom:    [0.42, 0.68],   // Kamerafahrt in das s, camZ 1 → zMax
      release: 0.68,           // Clip-Freigabe: zMax wird in layout() so bestimmt, dass hier Ink-Abdeckung 100 % erreicht ist
      portal:  [0.30, 0.52],   // Strand-Sichtbarkeit im Portal (Alpha 0 → 1)
      strand:  [0.55, 0.78],   // Frame-Fenster Strand (hält danach das letzte Bild)
      maya:    [0.78, 0.985],  // Szene 06: Rauch-Maya läuft über den Sand
      mayaFade: [0.78, 0.815], // weicher Take-Übergang (beide Takes, gleicher Ort, andere Wellen)
      intro:   [0.90, 0.99],   // Title Card erst, wenn Maya sich auflöst
    };
    const GRASS = 'rgba(143,177,166,';   // #8FB1A6, hartkodierte Nahtfarbe
    const SEQ = (window.matchMedia('(orientation: portrait)').matches && window.innerWidth < 820)
      ? { stadt: ['m_stadt/m_stadt_', 60], strand: ['m_strand/m_strand_', 45], maya: ['m_maya/m_maya_', 34], end: 'endbild/endbild_mobil' }
      : { stadt: ['stadt/stadt_', 65],     strand: ['strand/strand_', 50],     maya: ['maya/maya_', 48], end: 'endbild/endbild' };
    const staticHero = reduced ||
      (navigator.connection && navigator.connection.saveData) ||
      window.matchMedia('(prefers-reduced-data: reduce)').matches ||
      new URLSearchParams(location.search).has('endbild');   // QA-Weiche für den statischen Pfad

    // Blobs komplett im Speicher (≤ 3,8 MB), Bitmaps nur im Gleitfenster um das aktuelle Frame
    const DECODE_WIN = 10;
    function makeSeq(pre, n) {
      const bufs = new Array(n), bmps = new Map(), busy = new Set();
      const url = i => `assets/frames/${pre}${String(i + 1).padStart(4, '0')}.avif`;
      const buf = i => bufs[i] || (bufs[i] = fetch(url(i)).then(r => r.blob()));
      function ensure(i) {
        if (i < 0 || i >= n || bmps.has(i) || busy.has(i)) return;
        busy.add(i);
        buf(i).then(b => createImageBitmap(b)).then(bm => {
          bmps.set(i, bm); framesDirty = true;
          if (freezeP != null) repaintFrozen();   // eingefrorene Previews rendern ohne rAF
        }).catch(() => {}).finally(() => busy.delete(i));
      }
      return {
        n,
        prefetch(center) {
          for (let d = 0; d <= DECODE_WIN; d++) { ensure(center + d); ensure(center - d); }
          if (bmps.size > DECODE_WIN * 2 + 6) {
            bmps.forEach((bm, k) => { if (Math.abs(k - center) > DECODE_WIN + 3) { bm.close(); bmps.delete(k); } });
          }
        },
        exact(i) { return bmps.get(i) || null; },
        nearest(i) {
          if (bmps.has(i)) return bmps.get(i);
          for (let d = 1; d < n; d++) {
            if (bmps.has(i - d)) return bmps.get(i - d);
            if (bmps.has(i + d)) return bmps.get(i + d);
          }
          return null;                       // nichts dekodiert → Layer bleibt leer, nie Schwarz
        },
        warm() { let q = Promise.resolve(); for (let i = 0; i < n; i++) { const k = i; q = q.then(() => buf(k)).catch(() => {}); } },
      };
    }
    const citySeq  = makeSeq(SEQ.stadt[0], SEQ.stadt[1]);
    const beachSeq = makeSeq(SEQ.strand[0], SEQ.strand[1]);
    const mayaSeq  = SEQ.maya ? makeSeq(SEQ.maya[0], SEQ.maya[1]) : null;

    const segT = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
    const seqPos = (p, a, b, n) => { const f = segT(p, a, b) * (n - 1); const i = Math.floor(f); return { i, frac: f - i }; };
    function camZAt(p) { return 1 + Math.pow(segT(p, PM.zoom[0], PM.zoom[1]), 2.3) * (zMax - 1); }
    function drawCover(ctx, bm, alpha) {
      const s = Math.max(W / bm.width, H / bm.height);
      const dw = bm.width * s, dh = bm.height * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(bm, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }
    // Frame + Nachbar-Crossfade: vor und zurück pixelidentisch (Prototyp-validiert)
    function drawSeq(ctx, seq, pos, alpha) {
      const a = seq.exact(pos.i) || seq.nearest(pos.i);
      if (!a) return;
      drawCover(ctx, a, alpha);
      if (pos.frac > 0.01) {
        const b = seq.exact(pos.i + 1);
        if (b) drawCover(ctx, b, alpha * pos.frac);
      }
    }

    // Tiefster Punkt des s-Strichs via Distanztransform, als Bruchteil der
    // Ink-Bounding-Box (wird auf die echte SVG-Glyph-Box gemappt → kein Versatz)
    function findInkAnchor() {
      const w = Math.ceil(fontPx * 1.4), h = Math.ceil(fontPx * 1.8);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const cc = c.getContext('2d');
      cc.font = `800 ${fontPx}px 'Jakarta', system-ui, sans-serif`;
      cc.textAlign = 'left'; cc.textBaseline = 'alphabetic';
      cc.fillStyle = '#000'; cc.fillText('s', 0, Math.round(fontPx * 1.3));
      const A = cc.getImageData(0, 0, w, h).data;
      let minX = w, minY = h, maxX = 0, maxY = 0, any = false;
      const INF = 1e6, dt = new Float64Array(w * h), d2 = Math.SQRT2;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const ink = A[(y * w + x) * 4 + 3] > 140;
        dt[y * w + x] = ink ? INF : 0;
        if (ink) { any = true; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (dt[i] === 0) continue; let m = dt[i];
        if (x > 0) m = Math.min(m, dt[i - 1] + 1);
        if (y > 0) m = Math.min(m, dt[i - w] + 1);
        if (x > 0 && y > 0) m = Math.min(m, dt[i - w - 1] + d2);
        if (x < w - 1 && y > 0) m = Math.min(m, dt[i - w + 1] + d2);
        dt[i] = m;
      }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x; if (dt[i] === 0) continue; let m = dt[i];
        if (x < w - 1) m = Math.min(m, dt[i + 1] + 1);
        if (y < h - 1) m = Math.min(m, dt[i + w] + 1);
        if (x < w - 1 && y < h - 1) m = Math.min(m, dt[i + w + 1] + d2);
        if (x > 0 && y < h - 1) m = Math.min(m, dt[i + w - 1] + d2);
        dt[i] = m;
      }
      let bi = -1, bm = -1;
      for (let i = 0; i < w * h; i++) if (dt[i] < INF && dt[i] > bm) { bm = dt[i]; bi = i; }
      if (!any || bi < 0) return null;
      // Raster-px = CSS-px (gleiche Schrift, gleiche Größe): direkt mappen, kein Em-Box-Umweg
      return { bx: bi % w, by: (bi / w) | 0, r: bm };
    }
    const setFont = el => { el.setAttribute('font-family', "'Jakarta', system-ui, sans-serif"); el.setAttribute('font-weight', '800'); el.setAttribute('font-size', fontPx); };

    function layout() {
      W = Math.round(window.innerWidth); H = Math.round(window.innerHeight);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      fontPx = Math.min(W * 0.155, 230);
      [sFill, sOutline, ref].forEach(setFont);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      [cityCv, beachCv].forEach(cv => { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); });
      const total = ref.getComputedTextLength();
      baseY = H / 2 + fontPx * 0.34;
      const x0 = (W - total) / 2;
      ref.setAttribute('x', x0); ref.setAttribute('y', baseY);
      const pos = [];
      for (let i = 0; i < 6; i++) { const st = ref.getStartPositionOfChar(i); const ex = ref.getExtentOfChar(i); pos.push({ x: st.x, cx: st.x + ex.width / 2 }); }
      letters.forEach(l => {
        l.cx = pos[l.i].cx;
        l.el.style.fontSize = fontPx + 'px';
        l.el.style.left = pos[l.i].x.toFixed(1) + 'px';
        l.el.style.top = (baseY - fontPx * 0.80).toFixed(1) + 'px';
        l.el.style.transformOrigin = '50% 46%';
      });
      sX = pos[2].x;
      [sFill, sOutline].forEach(el => { el.setAttribute('x', sX); el.setAttribute('y', baseY); });
      const a = findInkAnchor();
      if (a) {   // Fokus = tiefster Punkt im Buchstaben-Fleisch, exakt in SVG-Koordinaten
        ax = pos[2].x + a.bx;
        ay = baseY + (a.by - Math.round(fontPx * 1.3));
        rCss = Math.max(4, a.r);
      } else {
        const bb = sOutline.getBBox();
        ax = bb.x + bb.width / 2; ay = bb.y + bb.height * 0.55;
        rCss = fontPx * 0.08;
      }
      coverR = Math.hypot(W / 2, H / 2) * 1.06;
      // Ink-Abdeckung rechnerisch: Viewport-Umkreis muss bei PM.release in den
      // Inkreis des Buchstaben-Fleischs passen, erst dann gibt der Clip frei
      zMax = coverR / rCss;
    }

    // "Karton"-Physik: fällt schräg, trifft die Kante, springt gedreht zurück
    function physY(lp) {
      const f = 0.5;
      if (lp < 0.5) { const u = lp / 0.5; return f * u * u; }
      if (lp < 0.72) { const u = (lp - 0.5) / 0.22; return f - 0.16 * Math.sin(u * Math.PI); }
      const u = (lp - 0.72) / 0.28; return f + 1.15 * u * u;
    }
    function physX(lp) { return lp < 0.5 ? lp * 60 : 30 - (lp - 0.5) * 210; }
    function physRot(lp) { return lp < 0.5 ? -lp * 70 : -35 + (lp - 0.5) * 190; }

    // KULISSENBRUCH: Stadt bricht hinter den fallenden Buchstaben, das s bleibt
    // stehen, die Kamera fliegt durch das s auf den Strand (alles Funktion von p).
    function applyScroll(p) {
      const zq = segT(p, PM.zoom[0], PM.zoom[1]);
      const camZ = camZAt(p);
      const dd = Math.min(1, zq / 0.6), de = dd * dd * (3 - 2 * dd);
      const fx = ax + (W / 2 - ax) * de, fy = ay + (H / 2 - ay) * de;   // Fokus driftet in die Bildmitte

      // Stadt UND s zoomen gemeinsam zum Anker im Buchstaben-Fleisch (kein seitliches Wandern)
      const camTf = `translate(${fx.toFixed(1)} ${fy.toFixed(1)}) scale(${camZ.toFixed(3)}) translate(${(-ax).toFixed(1)} ${(-ay).toFixed(1)})`;
      sFill.setAttribute('transform', camTf);
      sOutline.setAttribute('transform', camTf);
      sFill.setAttribute('opacity', (1 - segT(p, PM.tor[0], PM.tor[1])).toFixed(3));   // das Tor öffnet sich
      sOutline.setAttribute('opacity', (1 - segT(p, 0.30, 0.50)).toFixed(3));

      // Stadt-Frames: Kollaps hinter den Buchstaben, ab dem Durchtritt unsichtbar
      cityCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cityCtx.clearRect(0, 0, W, H);
      const cityPos = seqPos(p, PM.stadt[0], PM.stadt[1], citySeq.n);
      if (p < PM.release) {
        cityCtx.setTransform(dpr * camZ, 0, 0, dpr * camZ, dpr * (fx - camZ * ax), dpr * (fy - camZ * ay));
        drawSeq(cityCtx, citySeq, cityPos, 1);
      }

      // Strand: Portal-Licht + Frames in der Glyphe, nach der Freigabe voller Viewport
      beachCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      beachCtx.clearRect(0, 0, W, H);
      beachCtx.globalAlpha = 1; beachCtx.fillStyle = GRASS + '1)'; beachCtx.fillRect(0, 0, W, H);   // Naht-Grundton, nie Schwarz
      const beachPos = seqPos(p, PM.strand[0], PM.strand[1], beachSeq.n);
      const bAlpha = segT(p, PM.portal[0], PM.portal[1]);
      if (bAlpha > 0) drawSeq(beachCtx, beachSeq, beachPos, bAlpha);
      // Szene 06: Maya (eigener Take, gleicher Ort) blendet über den gehaltenen Strand.
      // Deckkraft gedeckelt (nicht bis 1.0): bleibt Erscheinung, nie Vollbild-Zeichentrick.
      const MAYA_MAX = 0.4;
      if (mayaSeq) {
        const mAlpha = segT(p, PM.mayaFade[0], PM.mayaFade[1]) * MAYA_MAX;
        const mayaPos = seqPos(p, PM.maya[0], PM.maya[1], mayaSeq.n);
        if (mAlpha > 0) drawSeq(beachCtx, mayaSeq, mayaPos, mAlpha);
        if (p > 0.6) mayaSeq.prefetch(mayaPos.i);
      }
      if (p < PM.release && bAlpha > 0) {                              // Grass-Gegenlicht vermittelt zur Naht
        const ring = beachCtx.createRadialGradient(fx, fy, Math.min(W, H) * 0.1, fx, fy, Math.hypot(W, H) * 0.55);
        ring.addColorStop(0, GRASS + '0)');
        ring.addColorStop(1, GRASS + (0.55 * (1 - zq)).toFixed(3) + ')');
        beachCtx.globalAlpha = 1; beachCtx.fillStyle = ring; beachCtx.fillRect(0, 0, W, H);
      }
      if (p < PM.release) {   // Portal-Schnitt: die Glyphe selbst maskiert, gleiche Kamera wie Stadt und s
        beachCtx.globalCompositeOperation = 'destination-in';
        beachCtx.setTransform(dpr * camZ, 0, 0, dpr * camZ, dpr * (fx - camZ * ax), dpr * (fy - camZ * ay));
        beachCtx.font = `800 ${fontPx}px 'Jakarta', system-ui, sans-serif`;
        beachCtx.textAlign = 'left'; beachCtx.textBaseline = 'alphabetic';
        beachCtx.fillStyle = '#000';
        beachCtx.fillText('s', sX, baseY);
        beachCtx.globalCompositeOperation = 'source-over';
      }
      citySeq.prefetch(cityPos.i);
      if (p > 0.2) beachSeq.prefetch(beachPos.i);

      // Buchstaben fallen wie 3D-Kartons weg; beim Kippen wird die Karton-Tiefe sichtbar
      letters.forEach(l => {
        const lp = clamp((p - l.s) / l.sp, 0, 1);
        let dx, dy, rz;
        if (l.bounce) { dy = physY(lp) * H; dx = physX(lp); rz = physRot(lp); }
        else { dy = lp * lp * l.dist * H; dx = l.dx * lp; rz = l.rz * lp; }
        const rx = l.rx * (lp * lp * (3 - 2 * lp));        // 3D-Kippen offenbart die Karton-Tiefe
        const op = lp > 0.9 ? clamp(1 - (lp - 0.9) / 0.1, 0, 1) : 1;
        l.el.style.transform = `perspective(720px) translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotateX(${rx.toFixed(1)}deg) rotateZ(${rz.toFixed(1)}deg)`;
        l.el.style.opacity = op.toFixed(3);
      });

      const io = segT(p, PM.intro[0], PM.intro[1]);
      intro.style.opacity = io.toFixed(3);
      intro.style.transform = `translateY(${(20 - 20 * io).toFixed(1)}px)`;
      intro.style.pointerEvents = io > 0.5 ? 'auto' : 'none';
      hint.style.opacity = clamp(0.55 - p * 6, 0, 0.55).toFixed(3);
    }

    function tick() {
      const rect = reel.getBoundingClientRect();
      const dist = reel.offsetHeight - H;
      const p = (freezeP != null) ? freezeP : ((dist > 0) ? clamp(-rect.top / dist, 0, 1) : 0);
      if (p !== lastP || framesDirty) { framesDirty = false; applyScroll(p); lastP = p; }
      requestAnimationFrame(tick);
    }

    function start() {
      if (staticHero) {
        // Vollwertiges statisches Endbild inkl. Title Card (reduced-motion / Save-Data)
        reel.style.height = '100svh';
        const img = document.createElement('img');
        img.className = 'reel-frames reel-endbild'; img.alt = '';
        img.src = `assets/frames/${SEQ.end}.avif`;
        img.onerror = () => { img.onerror = null; img.src = `assets/frames/${SEQ.end}.jpg`; };
        pin.insertBefore(img, svg);
        cityCv.remove(); beachCv.remove();
        lettersHost.style.display = 'none'; svg.style.display = 'none';
        intro.style.opacity = '1'; intro.style.transform = 'none'; intro.style.pointerEvents = 'auto';
        hint.style.opacity = '0';
        return;
      }
      layout();
      window.addEventListener('resize', () => { layout(); lastP = -1; }, { passive: true });
      applyScroll(0);
      requestAnimationFrame(tick);
      beachSeq.prefetch(0);              // Portal-Fenster früh dekodieren (Umschlag ist der kritische Moment)
      citySeq.warm(); beachSeq.warm();   // Blobs im Hintergrund vorziehen, Decode bleibt im Gleitfenster
      if (mayaSeq) mayaSeq.warm();
    }

    // Test-Hook: rendert synchron (Preview pausiert rAF, der Loop allein reicht nicht)
    function repaintFrozen() { if (W > 0 && freezeP != null) { framesDirty = false; lastP = freezeP; applyScroll(freezeP); } }
    window.__reel = {
      setP(p) { freezeP = clamp(p, 0, 1); repaintFrozen(); },
      free() { freezeP = null; lastP = -1; },
      info() {
        return {
          zMax: +zMax.toFixed(2), rCss: +rCss.toFixed(1),
          releaseZ: +camZAt(PM.release).toFixed(2),
          inkCovered: camZAt(PM.release) * rCss >= Math.hypot(W / 2, H / 2),
        };
      },
    };

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else window.addEventListener('load', start);
  }
  initReel();

  /* ---------------------------------------------------------
     KATZEN-PFOTEN — Abdrücke im Sand.
     Anatomisch korrekte Pfote (4 Zehen-Beans + 3-lappiger
     Ballen), per SVG-Emboss-Filter in den Sand gedrückt
     (Innenschatten + heller Rand + Sandkorn, kein Decal),
     als natürliche Spur (Direct-Register) durch die Atempause.
     Klick auf eine Pfote → die Katze flieht.
     --------------------------------------------------------- */
  function initPaws() {
    if (reduced) return;
    const breath = document.querySelector('.breath');
    if (!breath) return;

    const FILTER =
      '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      '<filter id="sandpress" x="-45%" y="-45%" width="190%" height="190%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.075 0.085" numOctaves="4" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceAlpha" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="sh"/>' +
      '<feGaussianBlur in="sh" stdDeviation="3" result="bl"/>' +
      '<feOffset in="bl" dx="3" dy="3.5" result="ou"/>' +
      '<feComposite in="sh" in2="ou" operator="out" result="it"/>' +
      '<feFlood flood-color="#bdb094" result="dc"/>' +
      '<feComposite in="dc" in2="it" operator="in" result="ish"/>' +
      '<feOffset in="sh" dx="-2.5" dy="-3" result="od"/>' +
      '<feComposite in="sh" in2="od" operator="out" result="be0"/>' +
      '<feGaussianBlur in="be0" stdDeviation="1" result="be"/>' +
      '<feFlood flood-color="#fffdf8" result="lc"/>' +
      '<feComposite in="lc" in2="be" operator="in" result="rim"/>' +
      '<feFlood flood-color="#ddd4bf" result="fc"/>' +
      '<feComposite in="fc" in2="sh" operator="in" result="fill"/>' +
      '<feMerge><feMergeNode in="rim"/><feMergeNode in="fill"/><feMergeNode in="ish"/></feMerge>' +
      '</filter></defs></svg>';
    const PAW =
      '<svg viewBox="0 0 100 90" aria-hidden="true"><g filter="url(#sandpress)" fill="#000">' +
      '<path d="M27,55 Q27,46 38,45 Q50,42 62,45 Q73,46 73,55 Q74,66 66,72 Q62,79 56,74 Q50,80 44,74 Q38,79 34,72 Q26,66 27,55 Z"/>' +
      '<ellipse cx="24" cy="30" rx="8.5" ry="11" transform="rotate(-18 24 30)"/>' +
      '<ellipse cx="42" cy="18" rx="8.5" ry="11.5" transform="rotate(-6 42 18)"/>' +
      '<ellipse cx="60" cy="20" rx="8.5" ry="11.5" transform="rotate(6 60 20)"/>' +
      '<ellipse cx="77" cy="33" rx="8" ry="10.5" transform="rotate(18 77 33)"/>' +
      '</g></svg>';

    document.body.insertAdjacentHTML('beforeend', FILTER);
    const layer = document.createElement('div'); layer.className = 'paw-layer';
    breath.appendChild(layer);

    const N = 8, prints = [];
    let fled = false, dirx = 1, diry = 0;
    function build() {
      layer.textContent = ''; prints.length = 0;
      const bw = breath.clientWidth, bh = breath.offsetHeight;
      const x0 = bw * 0.16, x1 = bw * 0.82, y0 = bh * 0.26, y1 = bh * 1.04;
      const dx = x1 - x0, dy = y1 - y0, dl = Math.hypot(dx, dy);
      const ux = dx / dl, uy = dy / dl; dirx = ux; diry = uy;
      const ang = Math.atan2(uy, ux) * 180 / Math.PI + 90;   // Zehen in Laufrichtung
      const pxp = -uy, pyp = ux;                              // senkrecht
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1), side = i % 2 ? 1 : -1;
        const off = side * bw * 0.013;                        // Direct-Register: fast eine Linie
        const cxp = x0 + t * dx + pxp * off, cyp = y0 + t * dy + pyp * off;
        const rot = ang + side * 6, mir = side < 0 ? -1 : 1;  // leicht ausgedreht, abwechselnd gespiegelt
        const el = document.createElement('div'); el.className = 'paw'; el.innerHTML = PAW;
        el.style.left = cxp + 'px'; el.style.top = cyp + 'px';
        el.style.setProperty('--rot', rot + 'deg');
        el.style.setProperty('--mir', mir);
        el.style.clipPath = el.style.webkitClipPath = 'inset(0 0 86% 0)';
        layer.appendChild(el);
        prints.push({ el, docY: breath.offsetTop + cyp, base: `translate(-50%,-50%) rotate(${rot}deg) scaleX(${mir})` });
      }
    }
    // Abrollen, scroll-gescrubbt: Zehen zuerst, dann rollt der Ballen in den Sand
    function reveal() {
      if (fled) {
        if (window.scrollY < breath.offsetTop - vh()) {
          fled = false;
          prints.forEach(p => { p.el.style.transition = ''; p.el.style.transitionDelay = ''; p.el.style.transform = ''; });
        }
        return;
      }
      const trig = window.scrollY + vh() * 0.6, band = vh() * 0.26;
      prints.forEach(p => {
        const d = trig - p.docY;
        let op, clipB;
        if (d < 0) { op = 0; clipB = 86; }
        else if (d < band) { const u = d / band, e = u * u * (3 - 2 * u); op = Math.min(u / 0.22, 1); clipB = 86 * (1 - e); }
        else { op = 1; clipB = 0; }
        p.el.style.opacity = op.toFixed(3);
        p.el.style.clipPath = p.el.style.webkitClipPath = clipB > 0.6 ? `inset(0 0 ${clipB.toFixed(1)}% 0)` : 'none';
      });
    }
    build(); reveal();
    window.addEventListener('scroll', () => requestAnimationFrame(reveal), { passive: true });
    window.addEventListener('resize', () => { build(); reveal(); }, { passive: true });
    window.addEventListener('load', () => { build(); reveal(); });
    window.addEventListener('pointerdown', e => {
      if (fled) return;
      for (const p of prints) {
        if (+p.el.style.opacity < 0.3) continue;
        const r = p.el.getBoundingClientRect();
        if (Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY) < 80) {
          fled = true;
          prints.forEach((q, i) => {
            q.el.style.transition = 'opacity .3s ease, transform .5s cubic-bezier(.3,.7,.25,1)';
            q.el.style.transitionDelay = (i * 0.04) + 's';
            q.el.style.opacity = '0';
            q.el.style.transform = q.base + ` translate(${(dirx * 90).toFixed(0)}px, ${(diry * 90).toFixed(0)}px) scale(1.15)`;
          });
          break;
        }
      }
    });
  }
  // initPaws() ruht: die Abziehbild-Pfoten sind raus. Szene 06 portiert den
  // sandpress-Filter auf den Film-Strand, wenn Maya kommt (Spur entsteht im Hero).

  /* ---------------------------------------------------------
     MAIN RAF LOOP
     --------------------------------------------------------- */
  const flipTop = document.querySelector('.flip-top');
  let lastScroll = window.scrollY;
  let t = 0;
  const remeasure = () => { measurePx(); };
  remeasure();
  window.addEventListener('resize', remeasure, { passive: true });
  window.addEventListener('load', remeasure);

  function frame(ts) {
    if (lenis) lenis.raf(ts);
    t += 0.045;
    const sc = window.scrollY;
    const velocity = sc - lastScroll;
    lastScroll = sc;
    const absV = Math.min(Math.abs(velocity), 80);
    const dir = velocity >= 0 ? 1 : -1;

    if (!reduced) {
      const center = sc + vh() / 2;
      pxNodes.forEach(n => {
        n.tgt = n.base - center;
        n.cur = lerp(n.cur, n.tgt, 0.08);
        const ty = -n.cur * n.y;
        const tx = -n.cur * 0.02 * n.x;
        n.el.style.translate = `${tx.toFixed(2)}px ${ty.toFixed(2)}px`;
      });

      tiltGroups.forEach(g => {
        g.layers.forEach(l => {
          l.tx = g.mx * l.depth * 14; l.ty = g.my * l.depth * 14;
          l.x = lerp(l.x, l.tx, 0.06); l.y = lerp(l.y, l.ty, 0.06);
          l.el.style.transform = `translate3d(${l.x.toFixed(2)}px, ${l.y.toFixed(2)}px, 0)`;
        });
      });

      scatterEls.forEach(el => {
        if (!el._chars) return;
        const r = el.getBoundingClientRect();
        const prog = clamp(-r.top / (vh() * 0.85), 0, 1);
        el._chars.forEach((c, i) => {
          if (prog <= 0) { return; }
          const seed = (i % 7) - 3;
          c.style.transform = `translate(${seed * prog * 55}px, ${prog * 110}px) rotate(${seed * prog * 16}deg)`;
          c.style.opacity = String(1 - prog);
        });
      });

      marquees.forEach(m => {
        if (!m.vis) return;
        const speed = (0.5 + absV * 0.16) * (velocity === 0 ? m.baseDir : dir * m.baseDir);
        m.pos -= speed;
        if (m.pos <= -m.single) m.pos += m.single;
        if (m.pos > 0) m.pos -= m.single;
        m.track.style.transform = `translate3d(${m.pos.toFixed(2)}px,0,0)`;
      });

      const boost = Math.min(absV * 0.9, 46);
      barGroups.forEach(g => {
        if (!g.vis) return;
        g.bars.forEach((b, i) => {
          const wave = Math.sin(t + i * 0.5) * 0.5 + 0.5;
          b.style.height = (4 + wave * (26 + boost)) + 'px';
        });
      });

      // Flip-Schnitt wippt: Diagonale kippt je nach Scroll-Position
      if (flipTop) {
        const r = flipTop.getBoundingClientRect();
        const d = clamp(((r.top + r.height / 2) - vh() / 2) / (vh() * 0.7), -1, 1);
        flipTop.style.setProperty('--flip', (-d * 70).toFixed(1) + 'px');
      }

    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
