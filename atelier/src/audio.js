/* Audio-Bus: <audio> streamt die MP3, AnalyserNode liefert Bänder. Die Clock ist
   anker-basiert: currentTime-Updates (~4Hz) definieren eine Gerade über performance.now(),
   avOffset zieht die Ausgabe-Latenz ab, damit Bild und Ton zusammenfallen.
   Live nachstellbar über setOffset (window.__dive). defaultOffset kommt von main.js
   (pro Track unterschiedlich, dort auch persistiert — audio.js kennt keine Tracks). */
export function createAudio(url, defaultOffset = 0) {
  const el = new Audio(url);
  el.preload = 'auto';
  el.crossOrigin = 'anonymous';

  let ctx = null, analyser = null, data = null;
  const bands = { bass: 0, mid: 0, high: 0, energy: 0 };
  let beat = false, prevBass = 0, lastBeat = 0;

  let anchorRaw = 0, anchorPerf = 0, haveAnchor = false, lastRaw = -1;
  let avOffset = defaultOffset;

  function ensureGraph() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaElementSource(el);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.55;
    data = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);
    analyser.connect(ctx.destination);
  }

  function avg(a, b) {
    let s = 0;
    for (let i = a; i < b; i++) s += data[i];
    return s / (b - a) / 255;
  }

  function tick(dt) {
    const raw = el.currentTime;
    const perf = performance.now() / 1000;
    if (el.paused) {
      anchorRaw = raw; anchorPerf = perf; haveAnchor = true;
    } else if (raw !== lastRaw) {
      const predicted = anchorRaw + (perf - anchorPerf);
      if (!haveAnchor || Math.abs(predicted - raw) > 0.25) {
        anchorRaw = raw; anchorPerf = perf; haveAnchor = true;
      } else {
        anchorRaw += (raw - predicted) * 0.1;
      }
    }
    lastRaw = raw;

    if (!analyser || el.paused) { beat = false; return; }
    analyser.getByteFrequencyData(data);
    const b = avg(2, 10), m = avg(10, 64), h = avg(100, 340);
    bands.bass += (b - bands.bass) * (b > bands.bass ? 0.5 : 0.12);
    bands.mid += (m - bands.mid) * (m > bands.mid ? 0.4 : 0.1);
    bands.high += (h - bands.high) * (h > bands.high ? 0.5 : 0.14);
    bands.energy = bands.bass * 0.5 + bands.mid * 0.3 + bands.high * 0.2;

    const now = performance.now();
    beat = (b - prevBass > 0.07 && b > 0.34 && now - lastBeat > 180);
    if (beat) lastBeat = now;
    prevBass = b;
  }

  return {
    el, bands,
    get beat() { return beat; },
    time() {
      if (!haveAnchor) return 0;
      const t = anchorRaw + (el.paused ? 0 : performance.now() / 1000 - anchorPerf);
      return Math.max(0, t - avOffset);
    },
    setOffset(v) { avOffset = v; },
    getOffset: () => avOffset,
    async play() {
      ensureGraph();
      if (ctx.state === 'suspended') await ctx.resume();
      await el.play();
    },
    pause() { el.pause(); },
    reset() { el.pause(); el.currentTime = 0; haveAnchor = false; anchorRaw = 0; lastRaw = -1; },
    tick,
    onEnded(fn) { el.addEventListener('ended', fn); }
  };
}
