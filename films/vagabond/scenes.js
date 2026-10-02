// Scene library + shot map. Every shot = a reusable composition (ground, sky,
// fx, cast of figures with timed actions) driven by local time lt in [0,dur].
import { clamp, lerp, spring, track, rng, FEEL } from '../../lib/motion.js';
import * as I from './ink.js';
import { fig } from './puppet.js';

const { INK, PAPER, INK_SOFT, BLOOD, EMBER, MOON } = I;

// ---------- skies ----------
const SKIES = {
  dusk:   { top: '#4a4238', low: '#8a7a5e', sun: null },
  grey:   { top: '#57534a', low: '#948a72', sun: null },
  night:  { top: '#14130f', low: '#2e2b23', moon: true },
  dawn:   { top: '#3a352a', low: '#c9a060', sun: 'low' },
  fireglow:{ top: '#1c130c', low: '#8a4a18', embers: true },
  paper:  { top: PAPER, low: PAPER, sun: null },
};

export function sky(g, W, H, kind, t, moonX = W * 0.72, moonR = 90) {
  const s = SKIES[kind] || SKIES.grey;
  const grad = g.createLinearGradient(0, 0, 0, H * 0.72);
  grad.addColorStop(0, s.top); grad.addColorStop(1, s.low);
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  if (s.moon) {
    I.moon(g, moonX, H * 0.24, moonR, 0.6);
    const R = rng(31); g.fillStyle = 'rgba(244,239,224,0.7)';
    for (let i = 0; i < 40; i++) { g.globalAlpha = 0.2 + R() * 0.5; g.fillRect(R() * W, R() * H * 0.5, 1.6, 1.6); }
    g.globalAlpha = 1;
  }
  if (s.sun === 'low') {
    const grad2 = g.createRadialGradient(W * 0.3, H * 0.7, 0, W * 0.3, H * 0.7, W * 0.5);
    grad2.addColorStop(0, 'rgba(230,180,100,0.5)'); grad2.addColorStop(1, 'rgba(230,180,100,0)');
    g.fillStyle = grad2; g.fillRect(0, 0, W, H);
  }
  // horizon mist band — ink wash dissolve into ground
  const mist = g.createLinearGradient(0, H * 0.5, 0, H * 0.68);
  mist.addColorStop(0, 'rgba(220,212,190,0)');
  mist.addColorStop(0.6, 'rgba(220,212,190,0.14)');
  mist.addColorStop(1, 'rgba(220,212,190,0)');
  g.fillStyle = mist; g.fillRect(0, H * 0.5, W, H * 0.2);
  // top darkness — sky ink wash
  const top = g.createLinearGradient(0, 0, 0, H * 0.3);
  top.addColorStop(0, 'rgba(10,9,7,0.35)'); top.addColorStop(1, 'rgba(10,9,7,0)');
  g.fillStyle = top; g.fillRect(0, 0, W, H * 0.3);
}

// ---------- grounds ----------
// each returns horizon y. Figures stand on groundY(fracX) for depth.
export const grounds = {
  field(g, W, H, t, o = {}) { // battlefield: bodies, banners, grass
    const y0 = H * (o.horizon ?? 0.55);
    const grad = g.createLinearGradient(0, y0, 0, H);
    grad.addColorStop(0, o.groundCol || '#5c5344'); grad.addColorStop(1, '#2e2a22');
    g.fillStyle = grad; g.fillRect(0, y0, W, H - y0);
    // mud patches
    const Rp = rng(3);
    for (let i = 0; i < 14; i++) I.blob(g, Rp() * W, y0 + Rp() * (H - y0), 40 + Rp() * 90, i * 3, 'rgba(20,17,13,0.35)', 1, 0.25);
    // fallen banners
    const R = rng(o.seed ?? 7);
    for (let i = 0; i < 8; i++) {
      const bx = R() * W, by = y0 + R() * (H - y0) * 0.5;
      const tilt = (R() - 0.5) * 0.8;
      const s = 40 + R() * 50;
      g.save(); g.translate(bx, by); g.rotate(tilt);
      I.line(g, 0, 0, 0, -s * 1.6, 3, 2, '#3d3529');
      g.fillStyle = i % 3 ? INK_SOFT : BLOOD; g.globalAlpha = 0.85;
      g.beginPath(); g.moveTo(0, -s * 1.6); g.lineTo(s * 0.5, -s * 1.5 + Math.sin(t * 2 + i) * 3); g.lineTo(s * 0.4, -s * 1.1); g.lineTo(0, -s * 1.2); g.fill();
      g.restore(); g.globalAlpha = 1;
    }
    // fallen bodies — ink mounds
    for (let i = 0; i < (o.bodies ?? 22); i++) {
      const bx = R() * W, by = y0 + R() * (H - y0) * 0.8;
      const s = 20 + R() * 46;
      I.blob(g, bx, by, s * 0.5, i * 7 + 3, INK, 0.5 + R() * 0.3, 0.4);
      I.line(g, bx - s * 0.4, by, bx + s * 0.6, by - s * 0.15, s * 0.1, s * 0.05, INK, 0.6);
    }
    I.grass(g, W, H, y0 + 10, t, 3, 10, 2, INK_SOFT);
    return y0;
  },
  trench(g, W, H, t, o = {}) { // ditch walls framing view
    const y0 = H * 0.62;
    const grad = g.createLinearGradient(0, y0 - 60, 0, H);
    grad.addColorStop(0, '#4a4034'); grad.addColorStop(1, '#1c1913');
    g.fillStyle = grad; g.fillRect(0, y0, W, H - y0);
    // trench walls: dark masses top & bottom
    I.blob(g, W * 0.15, y0 - 30, 180, 11, 'rgba(23,20,16,0.9)', 1, 0.5);
    I.blob(g, W * 0.85, y0 - 20, 200, 13, 'rgba(23,20,16,0.9)', 1, 0.45);
    I.blob(g, W * 0.5, y0 - 55, 300, 17, 'rgba(23,20,16,0.7)', 1, 0.3);
    // mud texture
    const R = rng(23); g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let i = 0; i < 60; i++) g.fillRect(R() * W, y0 + R() * (H - y0), R() * 40, 2);
    return y0;
  },
  village(g, W, H, t, o = {}) {
    const y0 = H * (o.horizon ?? 0.58);
    const grad = g.createLinearGradient(0, y0, 0, H);
    grad.addColorStop(0, '#665d4a'); grad.addColorStop(1, '#332e24');
    g.fillStyle = grad; g.fillRect(0, y0, W, H - y0);
    // huts: thatched roof triangles on posts
    const R = rng(o.seed ?? 41);
    const n = o.huts ?? 5;
    for (let i = 0; i < n; i++) {
      const hx = R() * W * 0.9 + W * 0.05, hs = 60 + R() * 80;
      const hy = y0 - R() * 40;
      g.fillStyle = 'rgba(30,26,20,0.9)';
      g.beginPath(); g.moveTo(hx - hs, hy); g.lineTo(hx, hy - hs * 0.7); g.lineTo(hx + hs, hy); g.closePath(); g.fill();
      g.fillRect(hx - hs * 0.6, hy, hs * 1.2, hs * 0.7);
      if (o.burn) { I.torch(g, hx, hy - hs * 0.5, hs * 0.2, t, i); I.smoke(g, hx, hy - hs, 60, 260, t, i + 9, 0.2); }
      else if (R() < 0.4) I.smoke(g, hx + hs * 0.3, hy - hs * 0.6, 40, 160, t, i + 5, 0.1);
    }
    return y0;
  },
  road(g, W, H, t, o = {}) {
    const y0 = H * 0.6;
    const grad = g.createLinearGradient(0, y0, 0, H);
    grad.addColorStop(0, '#5a5142'); grad.addColorStop(1, '#2c2820');
    g.fillStyle = grad; g.fillRect(0, y0, W, H - y0);
    // road perspective
    g.fillStyle = 'rgba(200,190,160,0.12)';
    g.beginPath(); g.moveTo(W * 0.44, y0); g.lineTo(W * 0.56, y0); g.lineTo(W * 0.72, H); g.lineTo(W * 0.28, H); g.fill();
    // pines silhouette
    const R = rng(o.seed ?? 13);
    for (let i = 0; i < 10; i++) {
      const px = R() * W, ps = 60 + R() * 120, py = y0 - R() * 30;
      I.blob(g, px, py - ps * 0.6, ps * 0.4, i * 11, 'rgba(23,20,16,0.75)', 1, 1.3);
      I.line(g, px, py, px, py - ps * 0.5, 4, 3, INK, 0.8);
    }
    I.grass(g, W, H, y0 + 6, t, 5, 8, 2, INK_SOFT);
    return y0;
  },
  ridge(g, W, H, t, o = {}) { // mountain ridge line
    const y0 = H * (o.horizon ?? 0.66);
    const R = rng(o.seed ?? 19);
    g.fillStyle = o.col || '#241f18';
    g.beginPath(); g.moveTo(0, y0);
    for (let x = 0; x <= W; x += 60) g.lineTo(x, y0 - R() * 30 - Math.sin(x * 0.004 + 1) * 26);
    g.lineTo(W, H); g.lineTo(0, H); g.fill();
    I.grass(g, W, H, y0, t, 29, 16, 2, INK);
    return y0;
  },
  paper(g, W, H) { I.paper(g, W, H); return H * 0.8; },
  black(g, W, H) { g.fillStyle = '#100e0b'; g.fillRect(0, 0, W, H); return H * 0.75; },
};

// ---------- camera ----------
// returns {dx, dy, scale} applied around center for slow drift/push.
function cam(lt, dur, o = {}) {
  const p = lt / dur;
  const mode = o.mode || 'push';
  if (mode === 'push') return { s: 1 + p * (o.amt ?? 0.07), dx: 0, dy: 0 };
  if (mode === 'pull') return { s: 1.1 - p * (o.amt ?? 0.08), dx: 0, dy: 0 };
  if (mode === 'pan') return { s: o.s ?? 1.05, dx: (p - 0.5) * (o.amt ?? 90), dy: 0 };
  if (mode === 'tilt') return { s: 1.06, dx: 0, dy: (p - 0.5) * (o.amt ?? 40) };
  if (mode === 'still') return { s: o.s ?? 1, dx: 0, dy: 0 };
  if (mode === 'orbit') { const a = (p - 0.5) * 0.5; return { s: 1.08, dx: Math.sin(a) * (o.amt ?? 60), dy: Math.cos(a) * 20 - 10 }; }
  return { s: 1, dx: 0, dy: 0 };
}
function applyCam(g, W, H, c) {
  g.translate(W / 2, H / 2); g.scale(c.s, c.s); g.translate(-W / 2 + c.dx, -H / 2 + c.dy);
}

// ---------- composite helpers ----------
// Shot standard: draw(g,W,H,lt,dur,o) — everything below composes into it.

export function frameEdges(g, W, H, lt, dur) {
  // letterbox cinema bars + slight film grain handled by grade pass
  g.fillStyle = '#0b0a08';
  g.fillRect(0, 0, W, H * 0.055); g.fillRect(0, H * 0.945, W, H * 0.055);
}

export function caption(g, W, H, text, lt, dur, o = {}) {
  const a = clamp((lt - (o.tIn ?? dur * 0.15)) / 0.4) * clamp(((o.tOut ?? dur - 0.3) - lt) / 0.4);
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  g.font = `500 ${o.size ?? 34}px "FreeSerif", Georgia, serif`;
  g.textAlign = 'center'; g.fillStyle = 'rgba(233,226,207,0.92)';
  g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 8;
  g.fillText(text, W / 2, H * (o.y ?? 0.86));
  g.restore();
}
