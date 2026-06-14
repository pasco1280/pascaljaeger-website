/*
 * wave.js — die Welle.
 * Eine durchgehende horizontale Sinuswelle. Atmet im Idle. Moduliert mit Scroll.
 * Neun Amplituden (Werke) entlang ihres Verlaufs. Hover benennt. Klick öffnet Detail.
 *
 * API:
 *   Wave.init({ svg, works, onSelect })
 *
 * Render-Frame:
 *   Path d wird in jedem Frame neu berechnet aus globaler Phase + Werk-Modulation.
 *   Circles sitzen auf den Werk-Positionen, ihre y-Koordinate folgt der Welle live.
 */
(function (global) {
  'use strict';

  const VB_W = 1000;
  const VB_H = 360;
  const MID  = VB_H / 2;
  const SAMPLES = 280;
  const SIGMA_FACTOR = 0.55;
  const BASE_AMP = 110;
  const BREATH_AMP = 7;

  const REDUCED = global.matchMedia &&
    global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Wave(){}

  Wave.init = function(opts){
    const svg     = opts.svg;
    const works   = opts.works || [];
    const onSelect = opts.onSelect || function(){};
    const ns = 'http://www.w3.org/2000/svg';

    svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Frequenzdiagramm der aktuellen Werke');

    // Layer: glow path (background blur), main path, points
    const glow = document.createElementNS(ns, 'path');
    glow.setAttribute('class', 'wave-glow');
    glow.setAttribute('fill', 'none');
    svg.appendChild(glow);

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('class', 'wave-line');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);

    // Unu — die zweite, dünnere Linie. Konstante Frequenz. Der Grundton.
    const unu = document.createElementNS(ns, 'path');
    unu.setAttribute('class', 'wave-unu');
    unu.setAttribute('fill', 'none');
    svg.appendChild(unu);

    // points
    const points = works.map(function(w, idx){
      const cx = ((idx + 0.5) / works.length) * VB_W;
      const g  = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'wave-point');
      g.setAttribute('data-id', w.id);
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', w.name + ' — ' + w.tagline);

      const halo = document.createElementNS(ns, 'circle');
      halo.setAttribute('r', '14');
      halo.setAttribute('class', 'wave-point-halo');
      g.appendChild(halo);

      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('r', '5');
      dot.setAttribute('class', 'wave-point-dot');
      g.appendChild(dot);

      svg.appendChild(g);

      g.addEventListener('click', function(){ onSelect(w.id); });
      g.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onSelect(w.id); }
      });
      g.addEventListener('mouseenter', function(){ showTip(w, cx); });
      g.addEventListener('focus',      function(){ showTip(w, cx); });
      g.addEventListener('mouseleave', hideTip);
      g.addEventListener('blur',       hideTip);

      return { work: w, group: g, halo: halo, dot: dot, cx: cx };
    });

    // tooltip element (outside svg, positioned absolute over container)
    const tip = document.createElement('div');
    tip.className = 'wave-tip';
    tip.setAttribute('aria-hidden', 'true');
    svg.parentNode.appendChild(tip);

    function showTip(w, cx){
      tip.innerHTML = '<strong>' + w.name + '</strong><span>' + w.tagline + '</span>';
      tip.dataset.visible = 'true';
      tip.dataset.cx = cx;
      positionTip(cx);
    }
    function hideTip(){ tip.dataset.visible = 'false'; }
    function positionTip(cx){
      const rect = svg.getBoundingClientRect();
      const px = (cx / VB_W) * rect.width;
      tip.style.left = px + 'px';
    }

    // state
    let t = 0;
    let lastActivity = performance.now();
    let scrollPhase = 0;
    let targetScrollPhase = 0;

    function onActivity(){ lastActivity = performance.now(); }
    global.addEventListener('mousemove', onActivity, { passive: true });
    global.addEventListener('touchmove', onActivity, { passive: true });

    function onScroll(){
      onActivity();
      const y = global.scrollY || 0;
      const max = Math.max(1, document.documentElement.scrollHeight - global.innerHeight);
      targetScrollPhase = (y / max) * Math.PI * 2;
    }
    global.addEventListener('scroll', onScroll, { passive: true });

    function onResize(){
      points.forEach(function(p){
        if (tip.dataset.visible === 'true' && tip.dataset.cx == p.cx) positionTip(p.cx);
      });
    }
    global.addEventListener('resize', onResize);

    // wave function — y at any x given current t and scrollPhase
    function yAt(x){
      let y = MID;
      const norm = x / VB_W;
      // global slow phase
      const t1 = REDUCED ? 0 : t;
      const t2 = REDUCED ? 0 : t * 0.37;
      // per-work modulation: gaussian envelope around each work center, sine inside
      for (let i = 0; i < works.length; i++){
        const w  = works[i];
        const cx = ((i + 0.5) / works.length) * VB_W;
        const sigma = (VB_W / works.length) * SIGMA_FACTOR;
        const dx = x - cx;
        const env = Math.exp(-(dx * dx) / (2 * sigma * sigma));
        const sign = w.polarity === 'up' ? -1 : 1;
        const intensity = (typeof w.intensity === 'number' ? w.intensity : 0.6);
        const freq = ((w.bpm || 90) / 90) * 1.6;
        const inner = Math.sin(norm * Math.PI * 2 * freq + t1 + i * 0.4);
        y += sign * intensity * BASE_AMP * env * inner;
      }
      // global idle breath layer
      y += BREATH_AMP * Math.sin(norm * Math.PI * 3.2 + t2);
      // scroll phase shift (subtle)
      y += 12 * Math.sin(norm * Math.PI * 1.4 + scrollPhase);
      return y;
    }

    function buildPath(){
      let d = '';
      for (let i = 0; i <= SAMPLES; i++){
        const x = (i / SAMPLES) * VB_W;
        const y = yAt(x);
        d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
      }
      return d;
    }

    function frame(now){
      const dt = 1/60;
      // idle detection
      const idleMs = now - lastActivity;
      const idleFactor = Math.min(1, Math.max(0, (idleMs - 1500) / 1500));
      // advance time
      if (!REDUCED){
        t += dt * (0.6 + 0.5 * idleFactor);
        scrollPhase += (targetScrollPhase - scrollPhase) * 0.06;
      }
      const d = buildPath();
      path.setAttribute('d', d);
      glow.setAttribute('d', d);

      // Unu-Linie: konstante hochfrequente Sinuswelle, kleiner Amplitude, leichter Phasenversatz
      let du = '';
      const unuAmp = 14;
      const unuFreq = 7.2;
      const t3 = REDUCED ? 0 : t * 1.8;
      for (let i = 0; i <= SAMPLES; i++){
        const x = (i / SAMPLES) * VB_W;
        const norm = x / VB_W;
        const y = MID + unuAmp * Math.sin(norm * Math.PI * 2 * unuFreq + t3);
        du += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
      }
      unu.setAttribute('d', du);

      // update points
      for (let i = 0; i < points.length; i++){
        const p = points[i];
        const y = yAt(p.cx);
        p.halo.setAttribute('cx', p.cx);
        p.halo.setAttribute('cy', y);
        p.dot.setAttribute('cx', p.cx);
        p.dot.setAttribute('cy', y);
      }

      // tooltip y follow
      if (tip.dataset.visible === 'true'){
        const cx = parseFloat(tip.dataset.cx);
        const y = yAt(cx);
        const rect = svg.getBoundingClientRect();
        const py = (y / VB_H) * rect.height;
        tip.style.top = (py - 56) + 'px';
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // expose current frequency for sound module
    global.Wave._sample = function(){
      // average amplitude offset from MID at sample positions
      let acc = 0, n = 20;
      for (let i = 0; i < n; i++){
        const x = (i / (n-1)) * VB_W;
        acc += Math.abs(yAt(x) - MID);
      }
      return acc / n / BASE_AMP; // 0..~1
    };

    return {
      focus: function(id){
        const p = points.find(function(p){ return p.work.id === id; });
        if (p) p.group.focus();
      }
    };
  };

  global.Wave = Wave;
})(window);
