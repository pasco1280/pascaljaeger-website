/* Minimaler Standard-MIDI-Parser: liefert Noten in absoluten Sekunden (Tempo-Map aufgelöst),
   pro Note die Spur. forceTrack setzt alle Noten der Datei auf eine feste Spur (Stem-Betrieb,
   eine Datei = eine Spur). Ohne forceTrack: hat die Datei nur eine bespielte Spur, wird sie
   nach Registern in drei Pseudo-Spuren gesplittet. */
export function parseMidi(buf, forceTrack) {
  const d = new DataView(buf);
  let p = 0;
  const str = n => { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(d.getUint8(p++)); return s; };
  const u32 = () => { const v = d.getUint32(p); p += 4; return v; };
  const u16 = () => { const v = d.getUint16(p); p += 2; return v; };
  const u8 = () => d.getUint8(p++);
  const vlq = () => { let v = 0, b; do { b = u8(); v = (v << 7) | (b & 0x7f); } while (b & 0x80); return v; };

  if (str(4) !== 'MThd') throw new Error('kein MIDI');
  const hlen = u32(); u16(); const ntracks = u16(); const division = u16();
  p = 8 + hlen;

  const tempos = [{ tick: 0, usPerQ: 500000 }];
  const raw = [];
  const trackHasNotes = [];

  for (let t = 0; t < ntracks; t++) {
    if (str(4) !== 'MTrk') throw new Error('kein MTrk');
    const end = p + u32();
    let tick = 0, running = 0, any = false;
    const open = new Map();
    while (p < end) {
      tick += vlq();
      let status = u8();
      if (status < 0x80) { p--; status = running; } else running = status;
      const type = status & 0xf0, ch = status & 0x0f;
      if (status === 0xff) {
        const meta = u8(), mlen = vlq(), mp = p;
        if (meta === 0x51) tempos.push({ tick, usPerQ: (d.getUint8(mp) << 16) | (d.getUint8(mp + 1) << 8) | d.getUint8(mp + 2) });
        p = mp + mlen;
      } else if (status === 0xf0 || status === 0xf7) { p += vlq(); }
      else if (type === 0x90 || type === 0x80) {
        const pitch = u8(), vel = u8();
        const k = pitch + '_' + ch;
        if (type === 0x90 && vel > 0) { open.set(k, { tick, pitch, vel, track: t, ch }); any = true; }
        else { const o = open.get(k); if (o) { raw.push({ ...o, endTick: tick }); open.delete(k); } }
      } else if (type === 0xc0 || type === 0xd0) { u8(); }
      else { u8(); u8(); }
    }
    trackHasNotes.push(any);
  }

  tempos.sort((a, b) => a.tick - b.tick);
  const tick2sec = tick => {
    let sec = 0, last = tempos[0];
    for (let i = 1; i < tempos.length; i++) {
      if (tempos[i].tick >= tick) break;
      sec += (tempos[i].tick - last.tick) * last.usPerQ / division / 1e6;
      last = tempos[i];
    }
    return sec + (tick - last.tick) * last.usPerQ / division / 1e6;
  };

  raw.sort((a, b) => a.tick - b.tick);
  let maxVel = 1;
  for (const n of raw) maxVel = Math.max(maxVel, n.vel);

  const activeTracks = [...new Set(raw.map(n => n.track * 16 + n.ch))];
  const single = activeTracks.length <= 1;
  const laneOf = n => {
    if (forceTrack != null) return forceTrack;
    if (!single) return activeTracks.indexOf(n.track * 16 + n.ch);
    return n.pitch <= 45 ? 0 : n.pitch <= 70 ? 1 : 2;
  };

  const notes = raw.map(n => {
    const t0 = tick2sec(n.tick);
    return {
      t: t0,
      dur: Math.max(0.05, tick2sec(n.endTick) - t0),
      pitch: n.pitch,
      vel: n.vel / maxVel,
      track: laneOf(n)
    };
  });
  const nTracks = forceTrack != null ? 1 : (single ? 3 : activeTracks.length);
  const duration = raw.length ? Math.max(...raw.map(n => tick2sec(n.endTick))) : 0;
  return { notes, nTracks, duration };
}
