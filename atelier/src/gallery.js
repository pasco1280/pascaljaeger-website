import * as THREE from 'three';
import { SPEED, PALETTE } from './scene.js';
import { glowTexture } from './underwater.js';

/* Werke aus der Atelier-Liste hängen als schwebende Tafeln entlang der Reise.
   Texturen laden erst, wenn die Kamera sich nähert. */

const WORKS = [
  { s: 'flyer/eisenwaren_cover_adamnsampler.jpg', a: 1, big: 1 },
  { s: 'illustrationen/zushi.png', a: 1, big: 1 },
  { s: 'logos/parliament-1.png', a: 1 },
  { s: 'illustrationen/faces.png', a: 1 },
  { s: 'web/akai.jpg', a: 1498 / 891, big: 1 },
  { s: 'logos/loki-front.png', a: 1 },
  { s: 'flyer/forever_young.jpg', a: 422 / 600 },
  { s: 'hntz/branding-exploration.png', a: 997 / 807 },
  { s: 'web/1000kraut.jpg', a: 1498 / 891 },
  { s: 'matchachin/bottle-lifestyle.jpg', a: 800 / 534, big: 1 },
  { s: 'illustrationen/fruits_and_candy_d.png', a: 1 },
  { s: 'web/kyowa.jpg', a: 1498 / 891 },
  { s: 'matchachin/matchachin_hp.png', a: 1395 / 1076 },
  { s: 'illustrationen/cat_over_boat.png', a: 1, big: 1 }
];

export function createWorks(scene, uni, totalDur, camera, canvas, onOpen) {
  const loader = new THREE.TextureLoader();
  const glow = new THREE.MeshBasicMaterial({
    map: glowTexture('rgba(174,217,228,0.85)', 'rgba(174,217,228,0.25)'),
    color: PALETTE.ice, blending: THREE.AdditiveBlending,
    transparent: true, opacity: 0.14, depthWrite: false, fog: false
  });
  const glowGeo = new THREE.PlaneGeometry(1, 1);

  /* Proportional statt fest verdrahtet: die ersten Werke tauchen schon kurz nach dem
     Abtauchen auf, unabhaengig davon wie lang der Track ist (wichtig, sobald ein
     kuerzerer Intro-Beat den 411s-Pride-Tears-Track ersetzt). */
  const t0 = Math.max(4, totalDur * 0.02), t1 = totalDur * 0.92;
  const items = WORKS.map((w, i) => {
    const t = t0 + (i / (WORKS.length - 1)) * (t1 - t0);
    const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const side = i % 2 === 0 ? -1 : 1;

    const h = (w.big ? 8.2 : 6.0);
    const wd = Math.min(13.5, h * w.a);

    const group = new THREE.Group();
    group.position.set(side * (9 + seed * 4), 2.2 + seed * 4.6, -t * SPEED - 14);
    group.lookAt(0, group.position.y * 0.85, group.position.z + 30);
    group.rotation.z += (seed - 0.5) * 0.14;

    const matte = new THREE.Mesh(
      new THREE.PlaneGeometry(wd + 0.5, h + 0.5),
      new THREE.MeshBasicMaterial({ color: PALETTE.chalk, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    matte.position.z = -0.03;
    group.add(matte);

    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false });
    const img = new THREE.Mesh(new THREE.PlaneGeometry(wd, h), mat);
    group.add(img);

    const halo = new THREE.Mesh(glowGeo, glow);
    halo.scale.set(wd * 2.6, h * 2.6, 1);
    halo.position.z = -0.6;
    group.add(halo);

    scene.add(group);
    return { group, img, mat, w, seed, baseY: group.position.y, loading: false, fade: 0 };
  });

  function update(t, camZ, dt) {
    for (const it of items) {
      const ahead = camZ - it.group.position.z;
      if (!it.loading && ahead < 460 && ahead > -60) {
        it.loading = true;
        loader.load('../assets/img/' + it.w.s, tex => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          it.mat.map = tex;
          it.mat.needsUpdate = true;
          it.loaded = true;
        });
      }
      if (it.loaded && it.mat.opacity < 1) it.mat.opacity = Math.min(1, it.mat.opacity + dt * 0.7);
      if (Math.abs(ahead) < 260) {
        it.group.position.y = it.baseY + Math.sin(t * 0.5 + it.seed * 9) * 0.4;
        it.group.rotation.z += Math.sin(t * 0.21 + it.seed * 7) * 0.00035;
      }
    }
  }

  /* Werke anklickbar: eigene Pointer-Erkennung neben der Orbit-Kamera in scene.js,
     unterscheidet Klick von Drag ueber Distanz/Dauer, damit ein Kamera-Schwenk nicht
     versehentlich die Lightbox oeffnet. Handler benannt, damit dispose() sie beim
     Track-Wechsel sauber wieder abmelden kann. */
  let onDown = null, onUp = null;
  if (camera && canvas && onOpen) {
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0, downY = 0, downT = 0;
    onDown = e => { downX = e.clientX; downY = e.clientY; downT = performance.now(); };
    onUp = e => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8 || performance.now() - downT > 600) return;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(items.map(it => it.img), false)[0];
      if (!hit) return;
      const it = items.find(x => x.img === hit.object);
      if (it) onOpen('../assets/img/' + it.w.s, it.w.s);
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
  }

  function dispose() {
    if (onDown) canvas.removeEventListener('pointerdown', onDown);
    if (onUp) canvas.removeEventListener('pointerup', onUp);
    items.forEach(it => {
      scene.remove(it.group);
      it.group.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
      });
    });
  }

  return { update, dispose };
}
