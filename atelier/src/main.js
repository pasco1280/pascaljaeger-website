import * as THREE from 'three';
import { parseMidi } from './midi.js';
import { createAudio } from './audio.js';
import { createStage, SPEED, PALETTE } from './scene.js';
import { createBeams } from './beams.js';
import { createUnderwater } from './underwater.js';
import { createWorks } from './gallery.js';
import { initTransition } from './transition.js';

/* Zwei Tracks: The Tide ist der Standard (eigens fuer die Unterwasserwelt gemacht),
   Pride Tears ist die optionale Zweitauswahl. Jede Datei = eine Spur = eine Lane/
   Farbe (Reihenfolge = Spur-Index, siehe LANES/TRACK_COLORS in beams.js). */
const TRACKS = [
  {
    id: 'tide',
    title: 'The Tide',
    credit: 'Adamn Sampler',
    audio: '../assets/audio/the-tide.mp3',
    midis: [
      '../assets/audio/the-tide-drums.mid',
      '../assets/audio/the-tide-bass.mid',
      '../assets/audio/the-tide-keyboard.mid',
      '../assets/audio/the-tide-percussion.mid',
      '../assets/audio/the-tide-synth.mid',
      '../assets/audio/the-tide-brass.mid'
    ],
    labels: ['Drums', 'Bass', 'Keyboard', 'Percussion', 'Synth', 'Brass'],
    hudLines: ['MIDI-Strom als Licht. Jede Spur ihre eigene Farbe.', 'Ziehen dreht die Kamera.'],
    minDur: 232,
    defaultOffset: 0
  },
  {
    id: 'pride',
    title: 'Pride Tears',
    credit: 'Adamn Sampler · Beatport Charts 2012',
    audio: '../assets/audio/pride-tears.mp3',
    midis: [
      '../assets/audio/pride-tears-bass.mid',
      '../assets/audio/pride-tears-drums.mid',
      '../assets/audio/pride-tears-other.mid',
      '../assets/audio/pride-tears-vocals.mid'
    ],
    labels: ['Bass', 'Drums', 'Other', 'Vocals'],
    hudLines: ['MIDI-Strom als Licht. Jede Spur ihre eigene Farbe.', 'Ziehen dreht die Kamera.'],
    minDur: 411,
    /* -195ms von Pascal hoerend eingestellt (Onpoint-Mix). */
    defaultOffset: -0.195
  }
];

function loadOffset(track) {
  const v = parseFloat(localStorage.getItem('dive-sync-' + track.id) || '');
  return Number.isFinite(v) ? v : (track.defaultOffset || 0);
}
function loadTrackOffsets(track) {
  try {
    const stored = JSON.parse(localStorage.getItem('dive-track-sync-' + track.id) || 'null');
    if (Array.isArray(stored) && stored.length === track.labels.length) return stored;
  } catch {}
  return track.labels.map(() => 0);
}

const playBtn = document.getElementById('play');
const exitBtn = document.getElementById('exit');
const replayBtn = document.getElementById('replay');
const canvas = document.getElementById('stage');
const creditEl = document.getElementById('credit');
const hudEl = document.getElementById('hud');
const endTitleEl = document.getElementById('end-title');
const endCreditEl = document.getElementById('end-credit');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;
const gl2 = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
const full = gl2 && !reduced && !saveData;

const trans = initTransition();
trans.surface();
if (!full) document.body.classList.add('mode-still');

let currentTrack = TRACKS[0];
let audio = null, trackOffsets = [];
let stage = null, underwater = null, works = null, beamsCtl = null, running = false, raf = 0;
let loadedTrackId = null, loadingTrackId = null, loadingPromise = null;
let diveT = -1, endT = -1, last = 0;
let dpr = Math.min(devicePixelRatio || 1, 1.75);
let frameAcc = 0, frameN = 0;

const uni = {
  time: { value: 0 },
  camZ: { value: 0 },
  camPos: { value: new THREE.Vector3() },
  bass: { value: 0 },
  high: { value: 0 },
  energy: { value: 0 },
  px: { value: dpr },
  fogDensity: { value: 0.016 },
  fogColor: { value: new THREE.Color('#2E7E72') }
};

function handleEnded() {
  endT = performance.now();
  setTimeout(() => {
    trans.end();
    if (running) { cancelAnimationFrame(raf); running = false; }
  }, full ? 6500 : 400);
}

/* Laedt einen Track: Audio immer frisch (eigener AudioContext), die 3D-Szene nur wenn
   sich der Track wirklich aendert (Replay desselben Tracks baut nichts neu). Gepoolt
   ueber loadingPromise, damit ein frueher Vorlade-Aufruf und ein Play-Klick auf denselben
   Track sich nicht doppelt Arbeit machen. */
function ensureTrackLoaded(track) {
  if (loadedTrackId === track.id && audio) return Promise.resolve();
  if (loadingTrackId === track.id && loadingPromise) return loadingPromise;

  loadingTrackId = track.id;
  loadingPromise = (async () => {
    if (audio) audio.reset();
    audio = createAudio(track.audio, loadOffset(track));
    audio.onEnded(handleEnded);

    if (!full) { loadedTrackId = track.id; return; }

    trackOffsets = loadTrackOffsets(track);
    const parts = await Promise.all(track.midis.map(async (url, i) => {
      const res = await fetch(url);
      return parseMidi(await res.arrayBuffer(), i);
    }));
    const notes = parts.flatMap(p => p.notes).sort((a, b) => a.t - b.t);
    const totalDur = Math.max(track.minDur || 60, ...parts.map(p => p.duration));

    if (!stage) {
      stage = createStage(canvas);
      stage.resize(dpr);
      window.addEventListener('resize', () => stage.resize(dpr));
    } else {
      beamsCtl.dispose();
      underwater.dispose();
      works.dispose();
    }

    beamsCtl = createBeams(stage.scene, notes, uni, totalDur);
    trackOffsets.forEach((v, i) => { if (v) beamsCtl.setTrackOffset(i, v); });
    underwater = createUnderwater(stage.scene, uni, totalDur);
    works = createWorks(stage.scene, uni, totalDur, stage.camera, canvas, openLightbox);
    loadedTrackId = track.id;

    stage.update(0, { y: 16 }, false, 0.016);
    underwater.update(0, 0);
    stage.renderer.render(stage.scene, stage.camera);
  })();
  return loadingPromise;
}

/* Immer aufrufen, auch ohne WebGL2/bei reduced-motion: die Funktion baut Audio in
   jedem Fall (nur die 3D-Szene wird intern uebersprungen, siehe !full-Zweig oben). */
ensureTrackLoaded(currentTrack).catch(err => {
  console.error('Szene konnte nicht gebaut werden', err);
  document.body.classList.add('mode-still');
});

const easeOut = x => 1 - Math.pow(1 - x, 3);

function frame(now) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000) || 0.016;
  last = now;

  audio.tick(dt);
  const t = audio.time();

  const sinceDive = (performance.now() - diveT) / 1000;
  const dive = { y: 2.2 };
  let fogMix = 1;
  if (diveT > 0 && sinceDive < 6) {
    const k = easeOut(Math.min(1, sinceDive / 6));
    dive.y = 16 - k * 13.8;
    fogMix = k;
  }
  if (endT > 0) {
    const ke = easeOut(Math.min(1, (performance.now() - endT) / 7000));
    dive.y = 2.2 + ke * 15;
    fogMix = 1 - ke;
  }
  stage.fog.color.lerpColors(PALETTE.fogSurface, PALETTE.fogDeep, fogMix);
  stage.fog.density = 0.008 + fogMix * 0.006;
  uni.fogDensity.value = stage.fog.density;
  uni.fogColor.value.copy(stage.fog.color);

  uni.time.value = t;
  uni.bass.value = audio.bands.bass;
  uni.high.value = audio.bands.high;
  uni.energy.value = audio.bands.energy;

  stage.update(t, dive, audio.beat, dt);
  const camZ = -t * SPEED;
  uni.camZ.value = camZ;
  uni.camPos.value.copy(stage.camera.position);

  underwater.update(t, camZ);
  works.update(t, camZ, dt);
  stage.renderer.render(stage.scene, stage.camera);

  frameAcc += dt; frameN++;
  if (frameN === 120) {
    const avg = frameAcc / frameN;
    if (avg > 0.022 && dpr > 1.05) {
      dpr = Math.max(1, dpr - 0.35);
      uni.px.value = dpr;
      stage.resize(dpr);
    }
    frameAcc = 0; frameN = 0;
  }
}

let hudTimer = 0;

/* HUD-Erklaertafel oben links, bleibt mindestens 30s stehen (Pascal: seine Frau
   braucht mehr Erklaerung als die alten Kurz-Einblendungen). Traegt Tracknamen/Credit,
   Inhalt kommt aus dem TRACKS-Eintrag, kein hart codierter Text mehr. */
function renderHud(track) {
  hudEl.innerHTML =
    '<div class="hud-title"><span class="hud-dot"></span>' + track.title + '</div>' +
    '<div>' + track.credit + '</div>' +
    '<div class="hud-sep"></div>' +
    track.hudLines.map(l => '<div>' + l + '</div>').join('');
}
function showHud() {
  clearTimeout(hudTimer);
  document.body.classList.add('hud-on');
  hudTimer = setTimeout(() => document.body.classList.remove('hud-on'), 32000);
}
function hideHud() {
  clearTimeout(hudTimer);
  document.body.classList.remove('hud-on');
}

const lightboxEl = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
function openLightbox(src, label) {
  lightboxImg.src = src;
  lightboxImg.alt = label || '';
  document.body.classList.add('lightbox-on');
}
function closeLightbox() {
  document.body.classList.remove('lightbox-on');
}
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl) closeLightbox(); });

/* Track-Auswahl auf dem Play-Screen: The Tide ist vorausgewaehlt, ein Klick auf die
   andere Option laedt sie schon im Hintergrund vor (kein Warten beim Eintauchen). */
const trackButtons = [...document.querySelectorAll('.track-opt')];
trackButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const track = TRACKS.find(t => t.id === btn.dataset.track);
    if (!track || track === currentTrack) return;
    currentTrack = track;
    trackButtons.forEach(b => b.classList.toggle('is-active', b === btn));
    creditEl.textContent = track.title + ' · ' + track.credit;
    playBtn.setAttribute('aria-label', 'Eintauchen: ' + track.title + ' abspielen');
    ensureTrackLoaded(track).catch(err => console.error('Track konnte nicht geladen werden', err));
  });
});

async function startDive(e) {
  playBtn.disabled = true;
  try {
    await ensureTrackLoaded(currentTrack);
    await audio.play();
  } catch (err) {
    playBtn.disabled = false;
    return;
  }
  renderHud(currentTrack);
  endTitleEl.textContent = currentTrack.title;
  endCreditEl.textContent = currentTrack.credit;
  trans.dive(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  diveT = performance.now();
  endT = -1;
  if (full) showHud();
  if (full && stage && !running) {
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}

function stopAll() {
  if (audio) audio.reset();
  if (running) { cancelAnimationFrame(raf); running = false; }
  diveT = -1; endT = -1;
  hideHud();
  closeLightbox();
  playBtn.disabled = false;
  trans.surface();
}

playBtn.addEventListener('click', startDive);
exitBtn.addEventListener('click', stopAll);
replayBtn.addEventListener('click', e => {
  document.body.classList.remove('state-end');
  if (audio) audio.reset();
  playBtn.disabled = false;
  startDive(e);
});
const syncEl = document.getElementById('sync');
let syncT = 0, selectedTrack = -1;

function showSync(label, ms) {
  syncEl.textContent = label + ' ' + Math.round(ms) + ' ms';
  syncEl.style.opacity = 1;
  clearTimeout(syncT);
  syncT = setTimeout(() => { syncEl.style.opacity = 0; }, 1600);
}

/* Sync-Feintuning während der Fahrt (nur im state-under):
   Ziffer 0 = Master (Bild/Ton gesamt), 1-N = einzelne Spur wählen (je nach Track 4 oder
   6 Spuren). Pfeil hoch = früher, Pfeil runter = später, 5 ms Schritte, pro Track+Spur
   gespeichert. */
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.body.classList.contains('lightbox-on')) { closeLightbox(); return; }
    if (!document.body.classList.contains('state-surface')) stopAll();
  }
  if (!document.body.classList.contains('state-under')) return;

  if (/^[0-9]$/.test(e.key)) {
    const n = +e.key;
    if (n === 0) selectedTrack = -1;
    else if (n <= currentTrack.labels.length) selectedTrack = n - 1;
    else return;
    const label = selectedTrack === -1 ? 'Master' : currentTrack.labels[selectedTrack];
    const ms = (selectedTrack === -1 ? audio.getOffset() : trackOffsets[selectedTrack]) * 1000;
    showSync(label, ms);
    return;
  }

  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const earlier = e.key === 'ArrowUp';
    if (selectedTrack === -1) {
      const v = audio.getOffset() + (earlier ? -0.005 : 0.005);
      audio.setOffset(v);
      try { localStorage.setItem('dive-sync-' + currentTrack.id, String(v)); } catch {}
      showSync('Master', v * 1000);
    } else if (beamsCtl) {
      const v = +(trackOffsets[selectedTrack] + (earlier ? 0.005 : -0.005)).toFixed(4);
      trackOffsets[selectedTrack] = v;
      beamsCtl.setTrackOffset(selectedTrack, v);
      try { localStorage.setItem('dive-track-sync-' + currentTrack.id, JSON.stringify(trackOffsets)); } catch {}
      showSync(currentTrack.labels[selectedTrack], v * 1000);
    }
  }
});

window.__dive = {
  uni,
  seek: s => { audio.el.currentTime = s; },
  time: () => audio.time(),
  stage: () => stage,
  get el() { return audio.el; },
  setOffset: v => audio.setOffset(v),
  getOffset: () => audio.getOffset(),
  step: () => frame(performance.now()),
  trackOffsets: () => trackOffsets,
  beamsCtl: () => beamsCtl,
  worksCtl: () => works,
  currentTrack: () => currentTrack.id,
  THREE
};
