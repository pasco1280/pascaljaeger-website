import * as THREE from 'three';

export const SPEED = 7;

/* Karibik statt Hamburger Hafen: helles, klares Tuerkis statt dunklem Muendungs-Gruen. */
export const PALETTE = {
  fogDeep: new THREE.Color('#0C4F49'),
  fogSurface: new THREE.Color('#3FCFC0'),
  tealLow: new THREE.Color('#2E8C7F'),
  ice: new THREE.Color('#AED9E4'),
  chalk: new THREE.Color('#F4EFE2'),
  hot: new THREE.Color('#C77E52')
};

/* Kamera nach dem George-&-Jonathan-Prinzip: sie folgt dem Playhead durch den Raum,
   Maus-Drag orbitet frei um den Noten-Strom (alle Seiten), Mausrad zoomt. */
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  const scene = new THREE.Scene();
  const fog = new THREE.FogExp2(PALETTE.fogSurface.clone(), 0.011);
  scene.fog = fog;
  scene.background = fog.color;

  const camera = new THREE.PerspectiveCamera(64, 1, 0.1, 500);
  scene.add(camera);

  /* Frei drehbare Orbit-Kamera: Ziehen dreht unbegrenzt in alle Richtungen
     (auch ganz nach hinten, dann fliegen die Spuren auf einen zu), Loslassen
     behält Schwung. Die Mausposition gibt nur noch ein feines Parallax.
     Wheel und Pinch zoomen. Der Raum gleitet ruhig auf gerader Schiene. */
  const orbit = { theta: 0, phi: 1.15, r: 17, sTheta: 0, sPhi: 1.15, vt: 0, vp: 0 };
  const idle = { x: 0, y: 0, tx: 0, ty: 0 };
  const pointers = new Map();
  let lastMove = 0, pinchD = 0;
  const clampPhi = v => Math.max(0.08, Math.min(3.06, v));

  canvas.style.cursor = 'grab';
  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    if (pointers.size === 1) {
      orbit.vt = 0; orbit.vp = 0;
      lastMove = performance.now();
      canvas.style.cursor = 'grabbing';
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchD = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });
  canvas.addEventListener('pointermove', e => {
    const p = pointers.get(e.pointerId);
    if (!p) {
      if (e.pointerType === 'mouse') {
        idle.tx = (e.clientX / window.innerWidth - 0.5) * 0.22;
        idle.ty = (e.clientY / window.innerHeight - 0.5) * 0.15;
      }
      return;
    }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchD > 0) orbit.r = Math.max(6, Math.min(46, orbit.r * pinchD / d));
      pinchD = d;
      return;
    }
    const now = performance.now(), ms = Math.max(8, now - lastMove);
    lastMove = now;
    const dT = dx * -0.0042, dP = dy * -0.0034;
    orbit.theta += dT;
    orbit.phi = clampPhi(orbit.phi + dP);
    orbit.vt = dT / ms * 1000;
    orbit.vp = dP / ms * 1000;
  });
  const release = e => {
    pointers.delete(e.pointerId);
    if (!pointers.size) canvas.style.cursor = 'grab';
    pinchD = 0;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    orbit.r = Math.max(6, Math.min(46, orbit.r * (1 + e.deltaY * 0.0012)));
  }, { passive: false });

  const target = new THREE.Vector3();

  function update(t, dive, beat, dt) {
    if (!pointers.size) {
      orbit.theta += orbit.vt * dt;
      orbit.phi = clampPhi(orbit.phi + orbit.vp * dt);
      const dec = Math.pow(0.12, dt);
      orbit.vt *= dec; orbit.vp *= dec;
    }
    const k = Math.min(1, dt * 11);
    orbit.sTheta += (orbit.theta - orbit.sTheta) * k;
    orbit.sPhi += (orbit.phi - orbit.sPhi) * k;
    const ki = Math.min(1, dt * 2.5);
    idle.x += (idle.tx - idle.x) * ki;
    idle.y += (idle.ty - idle.y) * ki;

    const th = orbit.sTheta + idle.x;
    const ph = clampPhi(orbit.sPhi + idle.y);

    target.set(0, dive.y, -t * SPEED);
    const sp = Math.sin(ph), cp = Math.cos(ph);
    camera.position.set(
      target.x + orbit.r * sp * Math.sin(th),
      Math.max(-8, target.y + orbit.r * cp),
      target.z + orbit.r * sp * Math.cos(th)
    );
    camera.lookAt(target.x, target.y, target.z - 8);
  }

  function resize(dpr) {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  return { renderer, scene, camera, fog, update, resize };
}
