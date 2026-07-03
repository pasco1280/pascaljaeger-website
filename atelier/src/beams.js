import * as THREE from 'three';
import { SPEED } from './scene.js';

/* Der Noten-Strom als Skulptur im Raum (George-&-Jonathan-Prinzip):
   jede Note ein echtes 3D-Röhren-Kabel entlang der Zeitachse (keine Billboards,
   also kein Z-Fighting wenn sich Spuren kreuzen oder berühren). Länge = Dauer,
   Höhe = Pitch, Farbe = Spur. Der Playhead deckt die Note im Moment des Erklingens
   auf, davor ist sie unsichtbar (Zukunft bleibt verschlossen), danach bleibt sie
   als gedimmte Spur sichtbar (Vergangenheit bleibt sichtbar). Alles rechnet der
   Vertex-Shader allein aus uTime — kein CPU-Update. */

/* Index = Stem-Reihenfolge im jeweiligen TRACKS-Eintrag in main.js (jeder Song hat seine
   eigene Liste/Reihenfolge, siehe TRACKS[].midis/labels dort). Hybrid-Palette: dieselben
   Farbfamilien wie der Rest der Seite (sage/hot/plum/chalk aus wrlz.css), Saettigung/
   Helligkeit angehoben damit sie als Lichtquelle glimmen statt als Druckfarbe wirken. */
export const TRACK_COLORS = ['#71CFB1', '#EAC471', '#E24672', '#ED7E3B', '#E56B7F', '#F4EFE4'];

/* Basiswerte weg von x=0/y~9 (Standard-Position der Kamera), sonst schwenkt der neue
   Ausschlag Noten direkt in die Linse. */
const LANES = [
  { x: -4.5, y: 1.6 },
  { x: 4.5, y: 2.4 },
  { x: 2.5, y: 6.4 },
  { x: -3.5, y: 3.6 },
  { x: 8.5, y: 6.0 },
  { x: -6.5, y: 11.5 }
];

const CABLE_SEGMENTS = 6;

const ENV = /* glsl */`
  float envelope(float ph, float dur, float vel) {
    float attack = smoothstep(-0.02, 0.02, ph);
    float rel = 1.0 - smoothstep(dur, dur + 0.9, ph);
    float played = step(dur + 0.4, ph);
    return attack * rel * (1.05 + vel * 1.3) + played * 0.10;
  }
`;

const C_VERT = /* glsl */`
  attribute vec3 aPos;
  attribute vec2 aDim;
  attribute vec3 aColor;
  attribute vec4 aMeta;
  uniform float uTime;
  varying vec3 vColor;
  varying float vInt;
  varying float vCore;
  varying float vNdotV;
  varying float vDepth;
  ${ENV}

  void main() {
    vColor = aColor;
    float env = envelope(uTime - aMeta.x, aMeta.y, aMeta.z);
    vInt = 0.75 + env * 0.7;
    vCore = clamp(env, 0.0, 1.3) * 0.55;

    /* Zukunft bleibt verschlossen: vor dem eigenen Einsatz kollabiert die Geometrie
       zu einem Punkt (nullflächig, wird nicht gerastert) statt sichtbar zu sein. */
    float visible = step(aMeta.x, uTime);
    float radius = aDim.x * (1.0 + env * 0.25);
    vec3 local = vec3(position.x * radius, position.y * radius, position.z * aDim.y) * visible;
    vec3 worldPos = aPos + local;

    vec3 n = normalize(normal);
    vec3 viewDir = normalize(cameraPosition - worldPos);
    vNdotV = max(dot(n, viewDir), 0.0);

    vec4 mv = modelViewMatrix * vec4(worldPos, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const C_FRAG = /* glsl */`
  precision highp float;
  uniform float uFogDensity;
  uniform vec3 uFogColor;
  varying vec3 vColor;
  varying float vInt;
  varying float vCore;
  varying float vNdotV;
  varying float vDepth;

  void main() {
    vec3 col = vColor * vInt * (0.55 + 0.45 * vNdotV);
    col += vec3(1.0) * pow(vNdotV, 9.0) * vCore;
    float fd = uFogDensity * 0.75 * vDepth;
    float f = 1.0 - exp(-fd * fd);
    gl_FragColor = vec4(mix(col, uFogColor, f), 1.0);
  }
`;

const R_VERT = /* glsl */`
  attribute vec3 aPos;
  attribute vec2 aDim;
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vInt;
  varying float vDepth;

  void main() {
    vUv = uv;
    vColor = aColor;
    vInt = 0.10 + 0.05 * sin(uTime * 0.2 + aSeed * 17.0);
    vec3 toCam = cameraPosition - aPos;
    vec3 side = normalize(vec3(-toCam.z, 0.0, toCam.x));
    vec3 pos = aPos + side * (position.x * 2.0 * aDim.x);
    pos.y += position.y * 2.0 * aDim.y;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const R_FRAG = /* glsl */`
  precision highp float;
  uniform float uFogDensity;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vInt;
  varying float vDepth;

  void main() {
    float x = abs(vUv.x - 0.5) * 2.0;
    float body = pow(max(0.0, 1.0 - x), 1.8);
    float ends = smoothstep(0.0, 0.2, vUv.y) * (1.0 - smoothstep(0.8, 1.0, vUv.y));
    float fogF = exp(-vDepth * uFogDensity * 0.55);
    gl_FragColor = vec4(vColor * (body * ends * vInt * fogF), 1.0);
  }
`;

const S_VERT = /* glsl */`
  attribute vec3 aColor;
  attribute vec4 aMeta;
  uniform float uTime;
  uniform float uPx;
  varying vec3 vColor;
  varying float vA;
  ${ENV}

  void main() {
    vColor = aColor;
    float env = envelope(uTime - aMeta.x, aMeta.y, aMeta.z);
    float visible = step(aMeta.x, uTime);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float d = max(1.0, -mv.z);
    vA = env * 0.55 * visible;
    gl_PointSize = min(70.0, (4.0 + aMeta.z * 15.0) * (1.0 + env * 0.5) * uPx * (46.0 / d)) * visible;
    gl_Position = projectionMatrix * mv;
  }
`;

const S_FRAG = /* glsl */`
  precision highp float;
  varying vec3 vColor;
  varying float vA;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.06, r);
    float core = smoothstep(0.16, 0.0, r);
    gl_FragColor = vec4((vColor + vec3(core * 0.6)) * a * vA, 1.0);
  }
`;

/* Melodische Kontur statt starrer Spur: Position folgt der Bewegung im Sound.
   Pro Spur wird ein gleitender Mittelwert von Tonhoehe und Lautstaerke mitgefuehrt
   (EMA). Weicht eine Note davon ab, wandert sie in genau diese Richtung: hoeher
   als der juengste Verlauf = nach oben, tiefer = nach unten, lauter als der
   juengste Verlauf = zur einen Seite, leiser = zur anderen. So bewegen sich die
   Spuren spuerbar hoch/runter/links/rechts, wenn sich der Sound veraendert,
   und liegen ruhig, wenn er es nicht tut. */
const clamp = (v, m) => Math.max(-m, Math.min(m, v));

export function createLayout() {
  const state = new Map();
  return function layoutNote(n) {
    const lane = LANES[n.track % LANES.length];
    let s = state.get(n.track);
    if (!s) { s = { pitch: n.pitch, vel: n.vel }; state.set(n.track, s); }
    const dPitch = clamp(n.pitch - s.pitch, 9);
    const dVel = clamp(n.vel - s.vel, 0.55);
    s.pitch += (n.pitch - s.pitch) * 0.12;
    s.vel += (n.vel - s.vel) * 0.12;

    const jitterX = Math.sin(n.pitch * 12.9898 + n.track * 3.1) * 0.35;
    const jitterY = Math.cos(n.pitch * 7.233 + n.track * 1.7) * 0.3;

    return {
      x: lane.x + dVel * 6 + jitterX,
      y: lane.y + dPitch * 0.22 + jitterY,
      z: -(n.t + n.dur / 2) * SPEED
    };
  };
}

const hash = i => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function basePlaneInstanced(count) {
  const geo = new THREE.InstancedBufferGeometry();
  const base = new THREE.PlaneGeometry(1, 1);
  geo.index = base.index;
  geo.attributes.position = base.attributes.position;
  geo.attributes.uv = base.attributes.uv;
  geo.instanceCount = count;
  return geo;
}

/* Zylinder mit Radius 1, Halblänge 1, Achse auf Z gedreht (statt Standard-Y) —
   so kann der Vertex-Shader ihn ohne Rotationsmatrix pro Instanz nur skalieren/verschieben. */
function baseCylinderInstanced(count) {
  const geo = new THREE.InstancedBufferGeometry();
  const base = new THREE.CylinderGeometry(1, 1, 2, CABLE_SEGMENTS, 1, false);
  base.rotateX(Math.PI / 2);
  geo.index = base.index;
  geo.attributes.position = base.attributes.position;
  geo.attributes.normal = base.attributes.normal;
  geo.instanceCount = count;
  return geo;
}

export function createBeams(scene, notes, uni, totalDur) {
  const n = notes.length;
  const geo = baseCylinderInstanced(n);
  const pos = new Float32Array(n * 3);
  const dim = new Float32Array(n * 2);
  const color = new Float32Array(n * 3);
  const meta = new Float32Array(n * 4);

  const spotPos = new Float32Array(n * 3);

  const c = new THREE.Color();
  const layoutNote = createLayout();
  notes.forEach((note, i) => {
    const L = layoutNote(note);
    pos.set([L.x, L.y, L.z], i * 3);
    dim.set([0.13 + note.vel * 0.22, Math.max(0.5, note.dur * SPEED * 0.7)], i * 2);
    c.set(TRACK_COLORS[note.track % TRACK_COLORS.length]);
    color.set([c.r, c.g, c.b], i * 3);
    meta.set([note.t, note.dur, Math.max(0.25, note.vel), 0], i * 4);
    spotPos.set([L.x, L.y, -note.t * SPEED], i * 3);
  });

  /* Pro-Spur-Sync-Korrektur: manche Instrumente (v.a. gehaltene Töne) kommen aus der
     KI-Transkription systematisch zu spät. correction > 0 zieht die ganze Spur
     (Position UND Aufleucht-Zeitpunkt zusammen) im Raum nach vorn. */
  function setTrackOffset(trackIndex, correction) {
    let touched = false;
    notes.forEach((note, i) => {
      if (note.track !== trackIndex) return;
      const t = note.t - correction;
      meta[i * 4] = t;
      pos[i * 3 + 2] = -(t + note.dur / 2) * SPEED;
      spotPos[i * 3 + 2] = -t * SPEED;
      touched = true;
    });
    if (!touched) return;
    geo.attributes.aPos.needsUpdate = true;
    geo.attributes.aMeta.needsUpdate = true;
    sGeo.attributes.position.needsUpdate = true;
    sGeo.attributes.aMeta.needsUpdate = true;
  }

  geo.setAttribute('aPos', new THREE.InstancedBufferAttribute(pos, 3));
  geo.setAttribute('aDim', new THREE.InstancedBufferAttribute(dim, 2));
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(color, 3));
  geo.setAttribute('aMeta', new THREE.InstancedBufferAttribute(meta, 4));

  const cableMat = new THREE.ShaderMaterial({
    vertexShader: C_VERT,
    fragmentShader: C_FRAG,
    uniforms: { uTime: uni.time, uFogDensity: uni.fogDensity, uFogColor: uni.fogColor }
  });
  const cables = new THREE.Mesh(geo, cableMat);
  cables.frustumCulled = false;
  scene.add(cables);

  const RAYS = 36;
  const rGeo = basePlaneInstanced(RAYS);
  const rPos = new Float32Array(RAYS * 3);
  const rDim = new Float32Array(RAYS * 2);
  const rColor = new Float32Array(RAYS * 3);
  const rSeed = new Float32Array(RAYS);
  const total = totalDur || (notes.length ? notes[notes.length - 1].t : 400);
  for (let r = 0; r < RAYS; r++) {
    const h1 = hash(r * 3.7 + 9), h2 = hash(r * 7.3 + 5);
    rPos.set([(h2 * 2 - 1) * 24, 12 + h1 * 8, -(r / RAYS) * total * SPEED - h1 * 40], r * 3);
    rDim.set([1.4 + h1 * 2.0, 14 + h2 * 6], r * 2);
    c.lerpColors(new THREE.Color('#2E8C7F'), new THREE.Color('#AED9E4'), h2);
    rColor.set([c.r, c.g, c.b], r * 3);
    rSeed[r] = h2 * 10;
  }
  rGeo.setAttribute('aPos', new THREE.InstancedBufferAttribute(rPos, 3));
  rGeo.setAttribute('aDim', new THREE.InstancedBufferAttribute(rDim, 2));
  rGeo.setAttribute('aColor', new THREE.InstancedBufferAttribute(rColor, 3));
  rGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(rSeed, 1));
  const rays = new THREE.Mesh(rGeo, new THREE.ShaderMaterial({
    vertexShader: R_VERT,
    fragmentShader: R_FRAG,
    uniforms: { uTime: uni.time, uFogDensity: uni.fogDensity },
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  }));
  rays.frustumCulled = false;
  scene.add(rays);

  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(spotPos, 3));
  sGeo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
  sGeo.setAttribute('aMeta', new THREE.BufferAttribute(meta, 4));
  const spots = new THREE.Points(sGeo, new THREE.ShaderMaterial({
    vertexShader: S_VERT,
    fragmentShader: S_FRAG,
    uniforms: { uTime: uni.time, uPx: uni.px },
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  }));
  spots.frustumCulled = false;
  scene.add(spots);

  /* Fuer den Track-Wechsel: eigene Szene-Bestandteile sauber abbauen, bevor der
     naechste Track seine Kabel/Rays/Spots in dieselbe Szene baut. */
  function dispose() {
    scene.remove(cables); geo.dispose(); cableMat.dispose();
    scene.remove(rays); rGeo.dispose(); rays.material.dispose();
    scene.remove(spots); sGeo.dispose(); spots.material.dispose();
  }

  return { mesh: cables, setTrackOffset, dispose };
}
