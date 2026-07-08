// ---------- Biottle scroll engine ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (y, a, b) => clamp((y - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

// ---------- Lenis smooth scroll ----------
const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ---------- preload bottle frames ----------
const frames = [];
let frameCount = 0, ready = false;
(function preload(){
  let i = 0;
  const MAX = 121; // fixed frame count (b_000..b_120) — avoids a probe 404
  function next(){
    if (i >= MAX){ finish(); return; }
    const img = new Image();
    const idx = i;
    img.onload = () => { frames[idx] = img; i++; if (idx === 0) drawFrame(0); next(); };
    img.onerror = () => finish();
    img.src = `assets/bottle/b_${String(i).padStart(3,'0')}.webp`;
  }
  function finish(){ frameCount = frames.filter(Boolean).length; ready = frameCount > 0; }
  next();
})();

// ---------- canvas setup ----------
const canvas = document.getElementById('bottle');
const ctx = canvas.getContext('2d');
let cw = 0, ch = 0, dpr = 1, lastDrawn = -1;
function sizeCanvas(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false; // layout not ready yet
  cw = r.width; ch = r.height;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  lastDrawn = -1;
  return true;
}
function drawFrame(idx){
  const img = frames[idx];
  if (!img) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  const s = Math.min(cw / img.width, ch / img.height);
  const w = img.width * s, h = img.height * s;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  lastDrawn = idx;
}

// ---------- pointer (mouse rotation in hold) ----------
let mx = 0, mxTarget = 0;
window.addEventListener('pointermove', e => {
  mxTarget = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
});
window.addEventListener('deviceorientation', e => {
  if (e.gamma != null) mxTarget = clamp(e.gamma / 40, -1, 1);
});

// ---------- element anchors ----------
const stage = document.querySelector('.stage');
const shadow = document.querySelector('.stage-shadow');
const glow = document.querySelector('.atmo-glow');
const atmo = document.querySelector('.atmo');
const railFill = document.getElementById('railFill');
const holdHint = document.querySelector('.hold-hint');
const actRise = document.querySelector('.act-rise');
const actHold = document.querySelector('.act-hold');
const actExit = document.querySelector('.act-exit');
const lianaImg = document.querySelector('.liana-img');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lianaReveal = 0;

let A = {};
function measure(){
  const vh = window.innerHeight;
  const holdTop = actHold.offsetTop;
  const holdBot = actHold.offsetTop + actHold.offsetHeight;
  const exitBot = actExit.offsetTop + actExit.offsetHeight;
  A = {
    vh,
    holdTop, holdBot, exitBot,
    riseStart: vh * 0.08,            // bottle starts rising almost immediately (less wait)
    riseEnd:   vh * 1.02,            // centered after ~1 screen (comes up sooner)
    exitStart: holdBot - vh * 0.5,   // bottle begins turning up
    exitEnd:   exitBot - vh * 0.4,
    lianaStart: holdBot - vh * 0.5,  // liana starts exactly when the bottle turns up
    lianaEnd:   exitBot - vh * 0.1,  // fully crept down by the time the bottle is gone
    docMax: document.documentElement.scrollHeight - window.innerHeight,
  };
  A.rotStart = A.riseStart;
  A.rotEnd = A.exitEnd;
  sizeCanvas();
  if (reduceMotion && lianaImg) lianaImg.style.setProperty('--lp', '1');
  // static safety draw so a frame is always visible even if rAF is throttled
  if (ready && cw){ let idx = Math.round(dispFrame) % (frameCount||1); if (idx<0) idx+=frameCount; drawFrame(idx); }
}

// smoothed display values
let dispFrame = 0;

function frameLoop(){
  const y = window.scrollY || window.pageYOffset;
  const { vh, holdBot } = A;

  const rise = prog(y, A.riseStart, A.riseEnd);
  const exit = prog(y, A.exitStart, A.exitEnd);
  const N = frameCount || 1;

  // ---- position (below -> center -> above) ----
  let ty, sc, op, glowAmt;
  if (exit > 0){
    const e = smooth(exit);
    ty = -e * 0.98 * vh; sc = 1 - e * 0.18;
    op = 1 - clamp((exit - 0.55) / 0.45); glowAmt = 1 - e;
  } else if (rise < 1){
    const r = 1 - (1 - rise) * (1 - rise);   // ease-out: rises fast, settles softly
    ty = (1 - r) * 0.8 * vh; sc = 0.8 + r * 0.2;
    op = clamp(rise / 0.14); glowAmt = r;
  } else {
    ty = 0; sc = 1; op = 1; glowAmt = 1;
  }

  // ---- rotation: play through the captured turn once, mapped to scroll ----
  // The source clip is NOT a seamless loop (frame N-1 != frame 0), so we never
  // wrap across that seam. Scroll drives the base rotation; the mouse adds spin
  // at center. Everything is CLAMPED to [0, N-1] -> no jump/stutter at the seam.
  const jp = clamp((y - A.rotStart) / ((A.rotEnd - A.rotStart) || 1));
  const base = jp * (N - 1);
  const centered = clamp(Math.min(rise, 1 - exit) * 2.2);          // ~1 during hold, fades at edges
  mx = lerp(mx, mxTarget, 0.09);
  const idle = Math.sin(performance.now() / 3000) * 0.015 * N;     // gentle life so it never looks stuck
  const targetFrame = clamp(base + centered * (mx * 0.36 * N + idle), 0, N - 1);

  // apply stage transform
  stage.style.transform = `translate(-50%,-50%) translate3d(0,${ty.toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
  stage.style.opacity = op.toFixed(3);
  shadow.style.opacity = (op * glowAmt * 0.75).toFixed(3);

  // atmosphere
  glow.style.opacity = (glowAmt * 0.9).toFixed(3);
  glow.style.transform = `translate(-50%,-50%) scale(${(0.85 + glowAmt * 0.25).toFixed(3)})`;
  const g = glowAmt;
  atmo.style.background = `rgb(${Math.round(247 - g*18)},${Math.round(245 - g*8)},${Math.round(239 - g*20)})`;

  holdHint.classList.toggle('show', centered > 0.6 && exit <= 0);

  // rail
  if (railFill) railFill.style.height = (clamp(y / (A.docMax || 1)) * 100).toFixed(1) + '%';

  // right liana is physically pushed down from the top once the bottle turns up
  if (!reduceMotion && lianaImg){
    const lr = smooth(clamp((y - A.lianaStart) / ((A.lianaEnd - A.lianaStart) || 1)));
    lianaReveal = lerp(lianaReveal, lr, 0.2);
    lianaImg.style.setProperty('--lp', lianaReveal.toFixed(4));
  }
  // falling leaves: swell as the bottle turns up, then ease off through the content
  leafEmit = clamp((y - A.exitStart) / (vh * 0.35)) * (1 - clamp((y - A.exitBot) / (vh * 1.3)));

  // self-heal canvas sizing if it was measured before layout
  if (!cw || canvas.width === 0) sizeCanvas();

  // frame render (smoothed, clamped — no seam wrap)
  dispFrame = lerp(dispFrame, targetFrame, 0.14);
  if (ready && cw){
    let idx = Math.round(clamp(dispFrame, 0, N - 1));
    if (idx !== lastDrawn) drawFrame(idx);
  }

  requestAnimationFrame(frameLoop);
}

// ---------- falling leaves (real liana leaf sprites, emit once the bottle turns up) ----------
const leafCanvas = document.querySelector('.leaves');
const lx = leafCanvas.getContext('2d');
let fallLeaves = [];
let leafEmit = 0;
const leafSprites = ['leaf1', 'leaf2', 'leaf3', 'leaf4'].map(n => {
  const im = new Image(); im.src = `assets/leaves/${n}.webp`; return im;
});
function initLeaves(){ leafCanvas.width = window.innerWidth; leafCanvas.height = window.innerHeight; }
function spawnLeaf(){
  fallLeaves.push({
    img: leafSprites[(Math.random() * leafSprites.length) | 0],
    w: 18 + Math.random() * 26,
    x: window.innerWidth * (0.46 + Math.random() * 0.6),   // right-biased, under the liana
    y: -40,
    vy: 0.18 + Math.random() * 0.32,                       // much slower descent
    vx: -(0.05 + Math.random() * 0.22),
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02,
    sway: Math.random() * 6.28, swayAmp: 0.25 + Math.random() * 0.5,
    a: 0.55 + Math.random() * 0.4
  });
}
function leavesLoop(){
  lx.clearRect(0, 0, leafCanvas.width, leafCanvas.height);
  if (leafEmit > 0 && fallLeaves.length < 14 && Math.random() < leafEmit * 0.05) spawnLeaf();
  for (let i = fallLeaves.length - 1; i >= 0; i--){
    const l = fallLeaves[i];
    l.sway += 0.02; l.y += l.vy; l.x += l.vx + Math.sin(l.sway) * l.swayAmp; l.rot += l.vr;
    if (l.y > leafCanvas.height + 50){ fallLeaves.splice(i, 1); continue; }
    const img = l.img;
    if (!img.complete || !img.naturalWidth) continue;
    const h = l.w * (img.naturalHeight / img.naturalWidth);
    lx.save(); lx.translate(l.x, l.y); lx.rotate(l.rot); lx.globalAlpha = l.a;
    lx.drawImage(img, -l.w / 2, -h / 2, l.w, h);
    lx.restore();
  }
  requestAnimationFrame(leavesLoop);
}

// ---------- reveals ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); } });
}, { threshold: 0.25 });
document.querySelectorAll('.reveal, .fact, .layer').forEach(el => io.observe(el));

// ---------- spores ----------
const sc2 = document.querySelector('.spores');
const sx = sc2.getContext('2d');
let spores = [];
function initSpores(){
  sc2.width = window.innerWidth; sc2.height = window.innerHeight;
  const n = Math.min(46, Math.floor(window.innerWidth / 26));
  spores = Array.from({length:n}, () => ({
    x: Math.random()*sc2.width, y: Math.random()*sc2.height,
    r: Math.random()*2+0.6, vy: -(Math.random()*0.25+0.05),
    vx: (Math.random()-0.5)*0.12, a: Math.random()*0.4+0.1
  }));
}
function sporeLoop(){
  sx.clearRect(0,0,sc2.width,sc2.height);
  for (const s of spores){
    s.y += s.vy; s.x += s.vx + Math.sin(s.y/60)*0.08;
    if (s.y < -5){ s.y = sc2.height+5; s.x = Math.random()*sc2.width; }
    sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 7);
    sx.fillStyle = `rgba(111,169,108,${s.a})`; sx.fill();
  }
  requestAnimationFrame(sporeLoop);
}

// nav shrink on scroll
const nav = document.querySelector('.nav');
lenis.on('scroll', ({ scroll }) => {
  nav.style.transform = scroll > 60 ? 'translateY(0)' : 'translateY(0)';
});

// ---------- boot ----------
let booted = false;
function boot(){ if (booted) return; booted = true; measure(); initSpores(); initLeaves(); frameLoop(); sporeLoop(); leavesLoop(); }
window.addEventListener('load', boot);
window.addEventListener('resize', () => { measure(); initSpores(); initLeaves(); });
// re-measure after fonts load (text metrics shift section offsets & canvas box)
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); });
setTimeout(measure, 300);
setTimeout(measure, 1200);
// fallback if load already fired
if (document.readyState === 'complete') boot();
