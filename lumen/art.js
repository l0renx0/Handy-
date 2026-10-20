// Illustrazioni generative per argomento: linee sottili su gradiente, diverse per ogni scheda.
// Nessuna immagine esterna: niente problemi di diritti e caricamento istantaneo.

function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const W = 400, H = 240;
const svg = (body) =>
  `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">${body}</svg>`;

const PATTERNS = {
  spazio(r) {
    const cx = 250 + r() * 90, cy = 60 + r() * 70;
    let s = "";
    for (let i = 1; i <= 5; i++) {
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${i * 46}" ry="${i * 17}" transform="rotate(${-18 + r() * 8} ${cx} ${cy})" stroke-width="1" opacity="${0.5 - i * 0.07}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${16 + r() * 8}" fill="currentColor" stroke="none" opacity=".85"/>`;
    const a = r() * Math.PI * 2;
    s += `<circle cx="${cx + Math.cos(a) * 138}" cy="${cy + Math.sin(a) * 51}" r="5" fill="currentColor" stroke="none" opacity=".7"/>`;
    for (let i = 0; i < 26; i++) s += `<circle cx="${r() * W}" cy="${r() * H}" r="${r() * 1.3 + 0.4}" fill="currentColor" stroke="none" opacity="${0.25 + r() * 0.45}"/>`;
    return s;
  },
  scienza(r) {
    const cx = 270 + r() * 60, cy = 80 + r() * 50, rot = r() * 60;
    let s = "";
    for (let i = 0; i < 3; i++) s += `<ellipse cx="${cx}" cy="${cy}" rx="120" ry="38" transform="rotate(${rot + i * 60} ${cx} ${cy})" stroke-width="1.2" opacity=".5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="11" fill="currentColor" stroke="none" opacity=".85"/>`;
    for (let i = 0; i < 3; i++) {
      const t = r() * Math.PI * 2, ang = ((rot + i * 60) * Math.PI) / 180;
      const x = 120 * Math.cos(t), y = 38 * Math.sin(t);
      s += `<circle cx="${cx + x * Math.cos(ang) - y * Math.sin(ang)}" cy="${cy + x * Math.sin(ang) + y * Math.cos(ang)}" r="4.5" fill="currentColor" stroke="none" opacity=".75"/>`;
    }
    return s;
  },
  salute(r) {
    const amp = 34 + r() * 10, y0 = 70 + r() * 50, k = 0.028 + r() * 0.01, ph = r() * 6;
    let a = "", b = "", rungs = "";
    for (let x = -10; x <= W + 10; x += 6) {
      const y1 = y0 + Math.sin(x * k + ph) * amp, y2 = y0 - Math.sin(x * k + ph) * amp;
      a += `${x === -10 ? "M" : "L"}${x} ${y1.toFixed(1)}`;
      b += `${x === -10 ? "M" : "L"}${x} ${y2.toFixed(1)}`;
      if (x % 18 === 2) rungs += `<path d="M${x} ${y1.toFixed(1)}L${x} ${y2.toFixed(1)}" stroke-width="1" opacity=".3"/>`;
    }
    return `${rungs}<path d="${a}" stroke-width="2" opacity=".7"/><path d="${b}" stroke-width="2" opacity=".45"/>`;
  },
  storia(r) {
    let s = "";
    const n = 6, w = W / n, base = 190 + r() * 20;
    for (let i = 0; i < n; i++) {
      const x = i * w, top = base - 110 - r() * 20;
      s += `<path d="M${x + 8} ${base}V${top + w / 2}A${w / 2 - 8} ${w / 2 - 8} 0 0 1 ${x + w - 8} ${top + w / 2}V${base}" stroke-width="1.2" opacity="${0.25 + r() * 0.35}"/>`;
    }
    s += `<path d="M0 ${base}H${W}" stroke-width="1.2" opacity=".4"/>`;
    s += `<circle cx="${60 + r() * 280}" cy="${40 + r() * 20}" r="20" fill="currentColor" stroke="none" opacity=".18"/>`;
    return s;
  },
  tecnologia(r) {
    let s = "";
    const step = 40;
    for (let i = 0; i < 16; i++) {
      let x = Math.round((r() * W) / step) * step, y = Math.round((r() * H) / step) * step;
      let d = `M${x} ${y}`;
      for (let j = 0; j < 3; j++) {
        if (r() > 0.5) x += (r() > 0.5 ? 1 : -1) * step * (1 + Math.floor(r() * 2));
        else y += (r() > 0.5 ? 1 : -1) * step;
        d += `L${x} ${y}`;
      }
      s += `<path d="${d}" stroke-width="1.3" opacity="${0.25 + r() * 0.35}"/><circle cx="${x}" cy="${y}" r="3.5" fill="currentColor" stroke="none" opacity=".7"/>`;
    }
    return s;
  },
  natura(r) {
    let s = "";
    const cx = 240 + r() * 120, cy = 40 + r() * 80;
    for (let i = 1; i <= 9; i++) {
      let d = "";
      for (let t = 0; t <= 64; t++) {
        const a = (t / 64) * Math.PI * 2;
        const rad = i * 22 * (1 + 0.12 * Math.sin(a * 3 + i * 0.7) + 0.06 * Math.sin(a * 5 + i));
        d += `${t ? "L" : "M"}${(cx + Math.cos(a) * rad * 1.3).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
      }
      s += `<path d="${d}Z" stroke-width="1.1" opacity="${0.55 - i * 0.045}"/>`;
    }
    return s;
  },
};

export function artFor(topic, seed) {
  const draw = PATTERNS[topic] || PATTERNS.scienza;
  return svg(draw(rng(seed + topic)));
}
