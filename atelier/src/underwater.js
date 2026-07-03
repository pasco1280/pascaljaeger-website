import * as THREE from 'three';
import { SPEED, PALETTE } from './scene.js';

/* Plankton-Partikel (GPU-gewrappt um die Kamera), Kaustik-Boden, Sonnen-Glows. */

const P_VERT = /* glsl */`
  attribute float aSeed;
  uniform float uTime;
  uniform float uCamZ;
  uniform float uBass;
  uniform float uHigh;
  uniform float uPx;
  varying float vA;

  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.22 + fract(aSeed * 7.1) * 0.35), 32.0) - 11.0;
    p.x += sin(uTime * 0.2 + aSeed * 31.0) * 0.9;
    float span = 260.0;
    p.z = mod(p.z - uCamZ, span) - span + 34.0 + uCamZ;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = max(1.0, -mv.z);
    float tw = 0.72 + 0.28 * sin(uTime * (2.0 + fract(aSeed * 13.0) * 3.0) + aSeed * 91.0);
    float sparkle = step(0.82, fract(aSeed * 3.7)) * uHigh * 0.8 * (0.5 + 0.5 * sin(uTime * 9.0 + aSeed * 71.0));
    vA = (0.22 + uBass * 0.08 + sparkle) * tw * smoothstep(230.0, 150.0, d);
    gl_PointSize = (1.1 + fract(aSeed * 5.3) * 2.4) * uPx * (150.0 / d);
    gl_Position = projectionMatrix * mv;
  }
`;

const P_FRAG = /* glsl */`
  precision highp float;
  uniform vec3 uColor;
  varying float vA;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, r);
    gl_FragColor = vec4(uColor * a * vA, 1.0);
  }
`;

const C_VERT = /* glsl */`
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/* Sandiger Boden: warmer Sand als Basis, Kaustik-Lichtnetz als Modulation darueber
   (kein reines Additiv-auf-Schwarz mehr, echte deckende Bodenflaeche). */
const C_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uBass;
  uniform vec3 uCam;
  uniform vec3 uSandDeep;
  uniform vec3 uSandLight;
  uniform vec3 uGlow;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec3 vWorld;

  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }
  float vor(vec2 p) {
    vec2 n = floor(p), f = fract(p);
    float md = 1.0;
    for (int j = -1; j <= 1; j++)
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        md = min(md, length(g + hash2(n + g) - f));
      }
    return md;
  }
  float grain(vec2 p) {
    return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
  }

  void main() {
    vec2 P = vWorld.xz * 0.14;
    float t = uTime * 0.5;
    float v1 = clamp(1.0 - vor(P + vec2(t * 0.30, t * 0.18)), 0.0, 1.0);
    float v2 = clamp(1.0 - vor(P * 1.6 + vec2(-t * 0.24, t * 0.34)), 0.0, 1.0);
    float ca = min(pow(v1, 4.0) * pow(v2, 2.0) * 1.9, 1.4);

    float ripple = 0.5 + 0.5 * sin(vWorld.x * 0.06 + 0.7) * cos(vWorld.z * 0.05 - 0.4);
    float speck = grain(floor(vWorld.xz * 2.2)) * 0.08;
    vec3 sand = mix(uSandDeep, uSandLight, ripple * 0.6 + 0.2) + speck;

    vec3 col = sand * (0.62 + ca * 0.55) + uGlow * ca * 0.5 * (0.7 + uBass * 0.5);

    float d = length(vWorld.xz - uCam.xz);
    float f = 1.0 - exp(-uFogDensity * d * 0.85);
    gl_FragColor = vec4(mix(col, uFogColor, clamp(f, 0.0, 1.0)), 1.0);
  }
`;

export function glowTexture(inner, outer) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.45, outer);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createUnderwater(scene, uni, totalDur) {
  const N = 1400;
  const posArr = new Float32Array(N * 3);
  const seedArr = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    posArr[i * 3] = (Math.random() * 2 - 1) * 42;
    posArr[i * 3 + 1] = Math.random() * 32 - 11;
    posArr[i * 3 + 2] = -Math.random() * 260;
    seedArr[i] = Math.random() * 10;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seedArr, 1));
  const pMat = new THREE.ShaderMaterial({
    vertexShader: P_VERT,
    fragmentShader: P_FRAG,
    uniforms: {
      uTime: uni.time, uCamZ: uni.camZ, uBass: uni.bass, uHigh: uni.high,
      uPx: uni.px, uColor: { value: PALETTE.ice.clone().lerp(PALETTE.chalk, 0.35) }
    },
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
  const points = new THREE.Points(pGeo, pMat);
  points.frustumCulled = false;
  scene.add(points);

  const cGeo = new THREE.PlaneGeometry(520, 380);
  const cMat = new THREE.ShaderMaterial({
    vertexShader: C_VERT,
    fragmentShader: C_FRAG,
    uniforms: {
      uTime: uni.time, uBass: uni.bass, uCam: uni.camPos,
      uFogColor: uni.fogColor, uFogDensity: uni.fogDensity,
      uSandDeep: { value: new THREE.Color('#7D6547') },
      uSandLight: { value: new THREE.Color('#E4D3A8') },
      uGlow: { value: new THREE.Color('#CFF3EA') }
    }
  });
  const floor = new THREE.Mesh(cGeo, cMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -9.5;
  scene.add(floor);

  const warm = glowTexture('rgba(255,233,196,0.9)', 'rgba(199,126,82,0.4)');
  const sunStart = new THREE.Sprite(new THREE.SpriteMaterial({
    map: warm, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  sunStart.scale.setScalar(150);
  sunStart.position.set(0, 58, 70);
  scene.add(sunStart);

  const sunEnd = new THREE.Sprite(new THREE.SpriteMaterial({
    map: warm, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0
  }));
  sunEnd.scale.setScalar(190);
  const endZ = -(totalDur + 26) * SPEED;
  sunEnd.position.set(0, 46, endZ);
  scene.add(sunEnd);

  function update(t, camZ) {
    floor.position.z = camZ - 130;
    const away = Math.min(1, -camZ / 800);
    sunStart.material.opacity = 0.9 - away * 0.72;
    const finale = Math.min(1, Math.max(0, (t - (totalDur - 45)) / 45));
    sunEnd.material.opacity = finale * 0.95;
  }

  function dispose() {
    scene.remove(points); pGeo.dispose(); pMat.dispose();
    scene.remove(floor); cGeo.dispose(); cMat.dispose();
    scene.remove(sunStart); scene.remove(sunEnd);
    sunStart.material.dispose(); sunEnd.material.dispose(); warm.dispose();
  }

  return { update, dispose };
}
