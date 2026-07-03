/* DOM-Zustandsmaschine: surface → diving → under → end. Der eigentliche
   Sink-Effekt läuft in der Szene (Kamera-Y + Fog), hier nur Blur/Farbe/Ripple. */
export function initTransition() {
  const body = document.body;

  function ripple(x, y) {
    for (let i = 0; i < 2; i++) {
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      r.style.animationDelay = i * 160 + 'ms';
      body.appendChild(r);
      setTimeout(() => r.remove(), 1400 + i * 160);
    }
  }

  return {
    dive(x, y) {
      ripple(x, y);
      body.classList.remove('state-surface', 'state-end');
      body.classList.add('state-diving');
      setTimeout(() => {
        body.classList.remove('state-diving');
        body.classList.add('state-under');
      }, 2400);
    },
    end() {
      body.classList.remove('state-under');
      body.classList.add('state-end');
    },
    surface() {
      body.classList.remove('state-diving', 'state-under', 'state-end');
      body.classList.add('state-surface');
    }
  };
}
