return;


(() => {
  function waveDataUrl({ amp = 2, periods = 3, w = 220, h = 12, stroke = "rgba(0,0,0,0.28)" } = {}) {
    const mid = Math.round(h / 2);
    const step = w / (periods * 4);
    let d = `M 0 ${mid}`;

    for (let x = 0; x <= w; x += step) {
      const phase = (x / step) % 4;
      const y = phase === 1 ? mid - amp : phase === 3 ? mid + amp : mid;
      d += ` L ${Math.round(x)} ${Math.round(y)}`;
    }

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <path d="${d}" fill="none" stroke="${stroke}" stroke-width="1" stroke-linecap="round"/>
      </svg>`;

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  const waveBg = waveDataUrl();

  document.querySelectorAll(".wave-link").forEach(el => {
    const on = () => el.style.setProperty("--wave-bg", waveBg);
    const off = () => el.style.removeProperty("--wave-bg");

    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
  });
})();