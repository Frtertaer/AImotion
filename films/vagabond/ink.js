// Ink primitives for the sumi-e anime look. All pure functions of time/seed.
import { clamp, lerp, rng } from '../../lib/motion.js';

export const PAPER = '#e9e2cf';
export const INK = '#171410';
export const INK_SOFT = '#2b2620';
export const BLOOD = '#a8322a';
export const EMBER = '#d97b2f';
export const MOON = '#f4efe0';

// --- strokes ----------------------------------------------------------------

// Tapered brush stroke between two points, bowed by ctrl point.
// w0 = base width, w1 = tip width.
export function stroke(g, x0, y0, cx, cy, x1, y1, w0, w1, col = INK, alpha = 1) {
  const steps = 14;
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = col;
  g.beginPath();
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = bez(x0, cx, x1, p), y = bez(y0, cy, y1, p);
    const wdt = lerp(w0, w1, p) / 2;
    const dx = bezD(x0, cx, x1, p), dy = bezD(y0, cy, y1, p);
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    if (i === 0) g.moveTo(x + nx * wdt, y + ny * wdt);
    else g.lineTo(x + nx * wdt, y + ny * wdt);
  }
  for (let i = steps; i >= 0; i--) {
    const p = i / steps;
    const x = bez(x0, cx, x1, p), y = bez(y0, cy, y1, p);
    const wdt = lerp(w0, w1, p) / 2;
    const dx = bezD(x0, cx, x1, p), dy = bezD(y0, cy, y1, p);
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    g.lineTo(x - nx * wdt, y - ny * wdt);
  }
  g.closePath(); g.fill();
  g.restore();
}
const bez = (a, c, b, p) => (1 - p) * (1 - p) * a + 2 * (1 - p) * p * c + p * p * b;
const bezD = (a, c, b, p) => 2 * (1 - p) * (c - a) + 2 * p * (b - c);

// Straight tapered stroke shorthand.
export const line = (g, x0, y0, x1, y1, w0, w1, col, alpha) =>
  stroke(g, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2, x1, y1, w0, w1, col, alpha);

// Dry-brush blob (head/hair mass), edge irregular via seeded wobble.
export function blob(g, x, y, r, seed = 1, col = INK, alpha = 1, squash = 1) {
  const R = rng(seed);
  g.save(); g.globalAlpha = alpha; g.fillStyle = col;
  g.beginPath();
  for (let i = 0; i <= 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rr = r * (0.86 + R() * 0.28);
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * squash;
    i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
  }
  g.closePath(); g.fill(); g.restore();
}

// Ink splatter burst: droplets + arcs radiating from a point.
export function splat(g, x, y, r, seed, t01, col = INK, alpha = 0.9) {
  const R = rng(seed);
  g.save(); g.fillStyle = col;
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2, d = r * R() * t01;
    const s = r * 0.02 + R() * r * 0.045 * (1 - t01 * 0.5);
    g.globalAlpha = alpha * (1 - t01 * 0.6) * (0.4 + R() * 0.6);
    g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, s, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

// --- environment ------------------------------------------------------------

// Washi paper ground with seeded fiber noise + vignette. Draw once per frame (cheap).
export function paper(g, W, H, tint = PAPER, vig = 0.34, grain = 0.05) {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  const R = rng(99);
  g.globalAlpha = grain; g.fillStyle = INK;
  for (let i = 0; i < 900; i++) {
    const x = R() * W, y = R() * H;
    g.fillRect(x, y, R() * 2.2, R() * 1.1);
  }
  g.globalAlpha = 1;
  const grad = g.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95);
  grad.addColorStop(0, 'rgba(23,20,16,0)');
  grad.addColorStop(1, `rgba(23,20,16,${vig})`);
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
}

// Rain field: slanted streaks; density 0..1, wind slant.
export function rain(g, W, H, t, density = 0.6, wind = 0.24, seed = 5) {
  const R = rng(seed);
  g.save(); g.strokeStyle = 'rgba(60,62,66,0.5)'; g.lineCap = 'round';
  const n = Math.floor(220 * density);
  g.lineWidth = 1.4;
  for (let i = 0; i < n; i++) {
    const sx = (R() * W * 1.3 - W * 0.15 + t * wind * 900 * (0.6 + R() * 0.8)) % W;
    const sy = (R() * H + t * (900 + R() * 500)) % H;
    const l = 22 + R() * 26;
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - l * wind, sy + l); g.stroke();
  }
  g.restore();
}

// Susuki/wheat grass field: rows of curved blades swaying.
export function grass(g, W, H, yBase, t, seed = 3, amp = 14, rows = 3, col = INK_SOFT) {
  for (let r = 0; r < rows; r++) {
    const R = rng(seed + r * 31);
    const yy = yBase + r * (H - yBase) / rows;
    const n = 60 + r * 30;
    const s = 0.5 + r * 0.45;
    for (let i = 0; i < n; i++) {
      const x = R() * W;
      const h = (26 + R() * 60) * s;
      const sway = Math.sin(t * (0.8 + R() * 0.7) + R() * 9) * amp * s;
      const bow = sway * (0.4 + R() * 0.6);
      stroke(g, x, yy + 4, x + bow * 0.4, yy - h * 0.6, x + bow, yy - h, 2.4 * s, 0.6, col, 0.75);
    }
  }
}

// Full moon with ink-ring halo.
export function moon(g, x, y, r, halo = 0.5) {
  const grad = g.createRadialGradient(x, y, r * 0.4, x, y, r * (2 + halo * 2));
  grad.addColorStop(0, 'rgba(244,239,224,0.95)');
  grad.addColorStop(0.28, 'rgba(244,239,224,0.55)');
  grad.addColorStop(1, 'rgba(244,239,224,0)');
  g.fillStyle = grad; g.beginPath(); g.arc(x, y, r * (2 + halo * 2), 0, Math.PI * 2); g.fill();
  g.fillStyle = MOON; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  const R = rng(17);
  g.fillStyle = 'rgba(200,190,160,0.35)';
  for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + (R() - 0.5) * r * 1.3, y + (R() - 0.5) * r * 1.3, r * (0.05 + R() * 0.11), 0, Math.PI * 2); g.fill(); }
}

// Crows: N birds flapping across a line.
export function crows(g, W, y0, t, seed = 8, n = 9, speed = 60) {
  const R = rng(seed);
  g.save(); g.fillStyle = INK; g.globalAlpha = 0.9;
  for (let i = 0; i < n; i++) {
    const ph = R() * Math.PI * 2;
    const x = (R() * W + t * (speed + R() * 40)) % (W + 200) - 100;
    const y = y0 + Math.sin(t * 1.7 + ph) * 18 + (R() - 0.5) * 90;
    const f = Math.sin(t * 9 + ph) * 0.9;
    const s = 7 + R() * 7;
    g.beginPath();
    g.moveTo(x - s, y + f * s * 0.5);
    g.quadraticCurveTo(x - s * 0.4, y - s * (0.6 + f * 0.4), x, y);
    g.quadraticCurveTo(x + s * 0.4, y - s * (0.6 - f * 0.4), x + s, y + f * s * 0.5);
    g.quadraticCurveTo(x + s * 0.3, y + s * 0.2, x, y + s * 0.25);
    g.quadraticCurveTo(x - s * 0.3, y + s * 0.2, x - s, y + f * s * 0.5);
    g.fill();
  }
  g.restore();
}

// Torch: flame blob flicker + glow.
export function torch(g, x, y, s, t, seed = 1) {
  const R = rng(seed);
  const fl = 1 + Math.sin(t * 11 + seed * 7) * 0.22 + Math.sin(t * 23 + seed) * 0.1;
  const grad = g.createRadialGradient(x, y, 0, x, y, s * 6);
  grad.addColorStop(0, `rgba(230,140,50,${0.5 * fl})`);
  grad.addColorStop(0.4, `rgba(217,123,47,${0.22 * fl})`);
  grad.addColorStop(1, 'rgba(217,123,47,0)');
  g.fillStyle = grad; g.beginPath(); g.arc(x, y, s * 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = `rgba(240,180,90,${0.9 * fl})`;
  blob(g, x, y - s * 0.4, s * fl, seed * 7 + 3, `rgba(240,180,90,${0.85 * fl})`);
  g.fillStyle = `rgba(250,225,170,${0.9 * fl})`;
  g.beginPath(); g.arc(x, y - s * 0.2, s * 0.4 * fl, 0, Math.PI * 2); g.fill();
  // embers
  for (let i = 0; i < 5; i++) {
    const ex = x + (R() - 0.5) * s * 3, ey = y - s * (0.5 + R() * 2.4) - (t * 30 + R() * 60) % (s * 3);
    g.globalAlpha = 0.5; g.fillStyle = EMBER;
    g.beginPath(); g.arc(ex, ey, 1.6, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}

// Smoke column drifting up.
export function smoke(g, x, y, w, h, t, seed = 4, alpha = 0.14) {
  const R = rng(seed);
  g.save();
  for (let i = 0; i < 8; i++) {
    const p = (i / 8 + (t * 0.06 + R()) % 1) % 1;
    const cx = x + Math.sin(p * 5 + seed) * w * 0.4 + R() * 4;
    const cy = y - p * h;
    const r = w * (0.3 + p * 0.9);
    blob(g, cx, cy, r, seed * 13 + i, `rgba(40,38,34,${alpha * (1 - p)})`);
  }
  g.restore();
}

// Fog band.
export function fog(g, W, H, y, t, alpha = 0.1, h = 120) {
  const grad = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  grad.addColorStop(0, 'rgba(233,226,207,0)');
  grad.addColorStop(0.5, `rgba(233,226,207,${alpha})`);
  grad.addColorStop(1, 'rgba(233,226,207,0)');
  g.fillStyle = grad;
  const off = (t * 14) % W;
  for (let k = -1; k < 2; k++) g.fillRect(off * 0.3 + k * W, y - h / 2, W, h);
  g.fillStyle = grad; g.fillRect(0, y - h / 2, W, h);
}

// Ink wipe overlay: brush strokes sweeping across the screen.
// p 0..1 → strokes traverse x. Returns coverage (for seam logic).
export function inkWipe(g, W, H, p, seed = 11, dir = 1) {
  if (p <= 0 || p >= 1) return;
  const R = rng(seed);
  g.save(); g.fillStyle = INK;
  for (let i = 0; i < 7; i++) {
    const yy = (i + 0.15 + R() * 0.7) * (H / 7);
    const hh = H / 7 * (0.7 + R() * 0.8);
    const head = dir > 0 ? p * (W * 1.2) - R() * W * 0.2 : W - p * (W * 1.2) + R() * W * 0.2;
    const wdt = Math.max(0, head);
    g.globalAlpha = 0.96;
    if (dir > 0) g.fillRect(0, yy - hh / 2, wdt, hh);
    else g.fillRect(W - wdt, yy - hh / 2, wdt, hh);
    // ragged head edge
    for (let j = 0; j < 9; j++) {
      const ex = dir > 0 ? head + R() * 40 : W - wdt - R() * 40;
      blob(g, ex, yy + (R() - 0.5) * hh, 6 + R() * 20, seed * 100 + i * 10 + j, INK, 0.9);
    }
  }
  g.restore();
}

// Giant kanji drawn with rough strokes (for title/graphic shots).
export function kanji(g, ch, x, y, size, col = INK, alpha = 1, font = '"Yuji Syuku", serif') {
  g.save(); g.globalAlpha = alpha; g.fillStyle = col;
  g.font = `${size}px ${font}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(ch, x, y);
  g.restore();
}
