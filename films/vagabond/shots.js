// Shot director: composes sky+ground+fx+cast+action for each plan shot.
// A cast member: {who, at:[[t,[fx,fy]],...], s, facing, hair, prop, cloak,
//                 act:[[t,'pose',{opts}],...], track speed}
// fx = fraction of W; fy = fraction of ground-to-bottom (0=horizon,1=bottom).
import { clamp, lerp, spring, track, rng, FEEL } from '../../lib/motion.js';
import * as I from './ink.js';
import { fig } from './puppet.js';
import { sky, grounds, frameEdges, caption } from './scenes.js';

const CAST = {
  takezo:    { hair: 'topknot', cloak: true,  s: 1.0, band: '#a8322a' },
  matahachi: { hair: 'band',    cloak: false, s: 0.97 },
  soldier:   { hair: 'helmet',  cloak: false, s: 1.05, prop: 'spear', propAngle: 1.35 },
  tsujikaze: { hair: 'none',    cloak: true,  s: 1.45 },
  woman:     { hair: 'woman',   cloak: false, s: 0.92 },
  osugi:     { hair: 'woman',   cloak: false, s: 0.85 },
  villager:  { hair: 'none',    cloak: false, s: 0.95 },
  boy:       { hair: 'none',    cloak: false, s: 0.7 },
  old:       { hair: 'none',    cloak: true,  s: 0.9 },
};

function posOf(c, lt) {
  const xs = c.at.map(k => [k[0], k[1][0]]);
  const ys = c.at.map(k => [k[0], k[1][1]]);
  return { x: track(lt, xs, c.glide || FEEL.base), y: track(lt, ys, c.glide || FEEL.base) };
}
function poseOf(c, lt) {
  const a = c.act || [[0, c.pose || 'stand', {}]];
  let cur = a[0], prev = null;
  for (const k of a) { if (lt >= k[0]) { prev = cur; cur = k; } }
  const since = lt - cur[0];
  let ph = lt * (c.rate ?? 0.6);
  // for transitional poses (swing/rise/fall/recoil...) ph = progress
  const trans = ['swing','rise','fall','recoil','reach','point','lunge'];
  if (trans.includes(cur[1])) ph = clamp(since / (cur[2]?.dur ?? 0.7));
  return { pose: cur[1], ph, opts: cur[2] || {} };
}

export function shot(g, W, H, lt, dur, S) {
  const c = camSpec(S.cam, lt, dur);
  g.save(); applyCam(g, W, H, c);

  // painted plate (generated keyframe art) replaces procedural sky+ground; still inside cam transform
  const art = S.art && window.__ART && window.__ART[S.art];
  let y0;
  if (S.g === 'paper' || S.g === 'black') y0 = grounds[S.g](g, W, H);
  else if (art) {
    const o = S.artO || {};
    const iw = art.naturalWidth, ih = art.naturalHeight;
    const sx = (o.x ?? 0) * iw, sy = (o.y ?? 0) * ih, sw = (o.w ?? 1) * iw, sh = (o.h ?? 1) * ih;
    const cr = Math.max(W / sw, H / sh);
    const dw = sw * cr, dh = sh * cr;
    g.drawImage(art, sx, sy, sw, sh, (W - dw) / 2 - (o.dx ?? 0) * dw, (H - dh) / 2 - (o.dy ?? 0) * dh, dw, dh);
    g.fillStyle = 'rgba(23,20,16,0.16)'; g.fillRect(0, 0, W, H); // unifying ink wash over the plate
    y0 = H * (o.horizon ?? 0.55);
  } else {
    y0 = (sky(g, W, H, S.sky, lt, S.moonX == null ? undefined : (S.moonX < 4 ? S.moonX * W : S.moonX), S.moonR), midSilhouette(g, W, H, lt, S), grounds[S.g](g, W, H, lt, S.gOpts || {}));
  }

  // special macro compositions skip the cast loop
  if (S.macro) {
    drawMacro(g, W, H, lt, dur, S); g.restore(); frameEdges(g, W, H);
    if (S.splatAt && lt > S.splatAt[0]) I.splat(g, S.splatAt[1] * W, S.splatAt[2] * H, S.splatAt[3] ?? 160, S.splatAt[4] ?? 9, clamp((lt - S.splatAt[0]) / 0.3), S.splatAt[5] === 'blood' ? I.BLOOD : I.INK);
    if (S.cap) caption(g, W, H, S.cap, lt, dur, { manga: 1, ...(S.capO || {}) });
    return;
  }

  const gY = (fy) => y0 + fy * (H - y0);
  // back-to-front: sort cast by fy (far first)
  const cast = [...S.cast || []].sort((a, b) => (a.at[0][1][1]) - (b.at[0][1][1]));
  for (const m of cast) {
    const P = posOf(m, lt), po = poseOf(m, lt);
    const ch = CAST[m.who] || CAST.takezo;
    const depth = 0.78 + P.y * 0.5; // near bottom = bigger
    const s = (m.s ?? 130) * ch.s * depth * 1.3;
    fig(g, P.x * W, gY(P.y), {
      pose: po.pose, ph: po.ph, s, facing: m.facing ?? 1,
      hair: m.hair || ch.hair, cloak: m.cloak ?? ch.cloak,
      prop: m.prop ?? ch.prop, propAngle: m.propAngle ?? ch.propAngle, propLen: m.propLen,
      band: m.band ?? ch.band,
      alpha: m.alpha, seed: m.seed, ...po.opts,
    });
  }

  // fx overlay layer
  const fx = S.fx || [];
  for (const f of fx) {
    if (f === 'rain') I.rain(g, W, H, lt, S.rainD ?? 0.6, 0.24);
    else if (f === 'fog') { I.fog(g, W, H, H * 0.6, lt, 0.16); I.fog(g, W, H, H * 0.45, lt * 0.7, 0.1); }
    else if (f === 'crows') I.crows(g, W, H * 0.28, lt, 8, 9);
    else if (f === 'embers') { embers(g, W, H, lt); }
    else if (typeof f === 'object' && f.torch) I.torch(g, f.torch[0] * W, f.torch[1] * H, 14, lt, f.torch[2] || 1);
    else if (f === 'smokeFar') { I.smoke(g, W * 0.2, H * 0.5, 80, 300, lt, 21, 0.18); I.smoke(g, W * 0.7, H * 0.52, 90, 320, lt, 23, 0.15); }
    else if (f === 'windStreaks') windStreaks(g, W, H, lt);
  }
  g.restore();
  if (S.splatAt && lt > S.splatAt[0]) I.splat(g, S.splatAt[1] * W, S.splatAt[2] * H, S.splatAt[3] ?? 160, S.splatAt[4] ?? 9, clamp((lt - S.splatAt[0]) / 0.3), S.splatAt[5] === 'blood' ? I.BLOOD : I.INK);
  if (S.clashAt) for (const c of S.clashAt) { const w = lt - c[0]; if (w > 0 && w < 0.4) clashBurst(g, W, H, c[1] * W, c[2] * H, w / 0.4, (c[3] ?? 5) + Math.floor(c[0])); }
  frameEdges(g, W, H);
  if (S.cap) caption(g, W, H, S.cap, lt, dur, { manga: 1, ...(S.capO || {}) });
  // vignette per shot
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 1.0);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(10,9,7,${S.vig ?? 0.3})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

function camSpec(cam, lt, dur) {
  const o = cam || {};
  const p = lt / dur, m = o.mode || 'push';
  switch (m) {
    case 'push': return { s: 1 + p * (o.amt ?? 0.08), dx: 0, dy: 0 };
    case 'pull': return { s: 1.12 - p * (o.amt ?? 0.09), dx: 0, dy: 0 };
    case 'pan': return { s: o.s ?? 1.06, dx: (p - 0.5) * (o.amt ?? 110), dy: 0 };
    case 'tilt': return { s: 1.07, dx: 0, dy: (p - 0.5) * (o.amt ?? 46) };
    case 'orbit': { const a = (p - 0.5) * 0.55; return { s: 1.09, dx: Math.sin(a) * (o.amt ?? 70), dy: -10 }; }
    case 'rush': return { s: 1 + p * p * (o.amt ?? 0.5), dx: 0, dy: 0 };
    case 'still': return { s: o.s ?? 1, dx: 0, dy: 0 };
    default: return { s: 1, dx: 0, dy: 0 };
  }
}
function applyCam(g, W, H, c) {
  g.translate(W / 2 + c.dx * -1, H / 2 + c.dy * -1); g.scale(c.s, c.s); g.translate(-W / 2, -H / 2);
}

// far ridge/pine silhouettes + ink clouds fill dead sky
function midSilhouette(g, W, H, t, S) {
  if (S.sky === 'paper') return;
  const night = S.sky === 'night' || S.sky === 'fireglow';
  // slow ink clouds
  const R = rng(61);
  for (let i = 0; i < 5; i++) {
    const cw = 260 + R() * 420, cx = ((R() * W * 1.4 + t * (4 + R() * 7)) % (W * 1.5)) - W * 0.25;
    const cy = H * (0.06 + R() * 0.3);
    I.blob(g, cx, cy, cw * 0.4, 71 + i, night ? 'rgba(20,18,15,0.5)' : 'rgba(60,54,44,0.28)', 1, 0.32);
  }
  // far ridge line just above horizon
  const y0 = H * (S.gOpts?.horizon ?? (S.g === 'ridge' ? 0.7 : 0.55)) - 8;
  if (S.g === 'village' || S.g === 'field' || S.g === 'road' || S.g === 'trench') {
    const R2 = rng(9);
    g.fillStyle = night ? 'rgba(15,13,10,0.55)' : 'rgba(45,40,32,0.4)';
    g.beginPath(); g.moveTo(0, y0);
    for (let x = 0; x <= W; x += 80) g.lineTo(x, y0 - R2() * 26 - Math.sin(x * 0.003 + 2) * 18);
    g.lineTo(W, y0 + 30); g.lineTo(0, y0 + 30); g.fill();
  }
}

export function embers(g, W, H, t, n = 60, seed = 15) {
  const R = rng(seed);
  g.save(); g.fillStyle = I.EMBER;
  for (let i = 0; i < n; i++) {
    const sp = 30 + R() * 90;
    const x = (R() * W + Math.sin(t * 0.7 + i) * 60) % W;
    const y = H - ((t * sp + R() * H * 2) % (H * 1.4));
    g.globalAlpha = 0.25 + R() * 0.6;
    g.beginPath(); g.arc(x, y, 1 + R() * 2.6, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}
function windStreaks(g, W, H, t) {
  const R = rng(77);
  g.save(); g.strokeStyle = 'rgba(233,226,207,0.14)'; g.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const y = R() * H, x = (R() * W + t * (260 + R() * 200)) % (W + 300) - 150;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 60, y - 8, x + 130 + R() * 80, y + 4); g.stroke();
  }
  g.restore();
}

// converging ink/paper speed lines at an impact point — 0.4s window
function clashBurst(g, W, H, x, y, p, seed) {
  const R = rng(seed * 977 + 3);
  const k = p < 0.35 ? p / 0.35 : 1 - (p - 0.35) / 0.65;
  g.save();
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const r0 = (1 - p * 0.65) * (W * 0.26 + R() * W * 0.22);
    const r1 = r0 * (0.1 + R() * 0.3);
    g.strokeStyle = i % 3 ? `rgba(233,226,207,${0.55 * k})` : `rgba(23,20,16,${0.65 * k})`;
    g.lineWidth = 1.5 + R() * 4;
    g.beginPath();
    g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.6);
    g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.6);
    g.stroke();
  }
  if (p < 0.2) { g.fillStyle = `rgba(244,239,224,${(0.2 - p) * 4.2})`; g.beginPath(); g.arc(x, y, 26 + p * 240, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

// ---------- macro inserts ----------
function drawMacro(g, W, H, lt, dur, S) {
  const p = lt / dur;
  if (S.macro === 'eye') {
    // giant ink eye: lid line + iris that snaps open
    const open = S.eyeOpen === false ? 1 : spring(lt - dur * 0.45, 300, 18);
    const cx = W / 2, cy = H * 0.5;
    I.paper(g, W, H, '#3a352c', 0.15, 0.06);
    const ew = W * 0.34, eh = H * 0.16 * (0.15 + open * 0.85);
    g.save();
    g.beginPath();
    g.moveTo(cx - ew, cy); g.quadraticCurveTo(cx, cy - eh * 2.6, cx + ew, cy);
    g.quadraticCurveTo(cx, cy + eh * 2.2, cx - ew, cy);
    g.clip();
    g.fillStyle = '#cfc4a6'; g.fillRect(cx - ew, cy - eh * 3, ew * 2, eh * 6);
    // iris
    const ix = cx + (S.eyeDx ?? 0) * ew;
    I.blob(g, ix, cy, eh * 1.15, 5, I.INK);
    I.blob(g, ix, cy, eh * 0.5, 7, '#0a0806');
    g.fillStyle = 'rgba(240,235,215,0.9)';
    g.beginPath(); g.arc(ix - eh * 0.3, cy - eh * 0.35, eh * 0.18, 0, Math.PI * 2); g.fill();
    g.restore();
    I.line(g, cx - ew * 1.1, cy - eh * 1.1, cx + ew * 1.1, cy - eh * 1.3, 26, 20, I.INK); // brow lid
    I.line(g, cx - ew * 1.05, cy + eh * 1.15, cx + ew * 1.05, cy + eh * 1.05, 18, 14, I.INK, 0.85);
    // iris tremble
    if (open > 0.8) { const tr = Math.sin(lt * 40) * 3; I.blob(g, cx + tr, cy, eh * 0.5, 7, 'rgba(10,8,6,0.6)'); }
  } else if (S.macro === 'hands') {
    // trembling hands gripping wood sword
    I.paper(g, W, H, '#4a4234', 0.2, 0.06);
    const tr = Math.sin(lt * 26) * 4 + Math.sin(lt * 41) * 2;
    const cx = W / 2 + tr, cy = H * 0.62;
    I.line(g, cx - W * 0.3, cy - 40, cx + W * 0.34, cy - 30, 26, 16, '#4a3b28'); // bokuto shaft
    I.blob(g, cx - 60 + tr * 0.4, cy + 20, 52, 21, I.INK, 0.95, 0.8); // fist 1
    I.blob(g, cx + 70 + tr * 0.4, cy + 16, 48, 23, I.INK, 0.95, 0.8); // fist 2
    for (let i = 0; i < 5; i++) I.line(g, cx - 90 + i * 34 + tr * 0.3, cy - 14, cx - 84 + i * 34 + tr * 0.3, cy + 30, 10, 7, '#0f0d0a', 0.9);
    I.splat(g, cx - 30, cy + 60, 60, 31, 1, I.BLOOD, 0.5);
  } else if (S.macro === 'sword') {
    I.paper(g, W, H, '#33302a', 0.25, 0.05);
    const px = W * 0.14, py = H * 0.7;
    const reveal = spring(lt - 0.3, 260, 22);
    g.save(); g.translate(px, py); g.rotate(-0.42 + Math.sin(lt * 0.5) * 0.008);
    const len = W * 0.72;
    I.line(g, 0, 0, len * reveal, 0, 30, 8, '#20232a');
    I.line(g, len * 0.2, -6, len * reveal * 0.98, -4, 5, 2, '#8f939e', 0.8); // edge light
    // travelling glint along the edge — the blade breathes
    const gl = ((lt * 0.5) % 1.4) * len;
    if (reveal > 0.9) { I.line(g, gl - 90, -6.5, gl, -5.5, 8, 3, '#e8e4d2', 0.85); I.blob(g, gl, -5, 7, 3, '#f4efe0', 0.9); }
    I.blob(g, -14, 0, 26, 33, '#1a1611'); // tsuba
    I.line(g, -120, 0, -14, 0, 26, 22, '#2a2118'); // tsuka
    g.restore();
    if (reveal > 0.9) I.splat(g, px + W * 0.4, py - W * 0.17, 90, 37, clamp((lt - 1.1) / 0.4), I.INK, 0.7);
  } else if (S.macro === 'face') {
    // mud-streaked face: big ink head, breathing
    I.paper(g, W, H, '#57503f', 0.3, 0.06);
    const br = 1 + Math.sin(lt * 1.4) * 0.015;
    const cx = W / 2, cy = H * 0.52;
    I.blob(g, cx, cy, H * 0.4 * br, 41, I.INK, 1, 1.15);
    // streaks
    const R = rng(43);
    for (let i = 0; i < 12; i++) {
      const a = R() * Math.PI * 2;
      I.line(g, cx + Math.cos(a) * H * 0.1, cy + Math.sin(a) * H * 0.16, cx + Math.cos(a) * H * 0.42, cy + Math.sin(a) * H * 0.5, 3, 1, 'rgba(233,226,207,0.35)');
    }
    // eyes
    const eo = S.eyeOpen === false ? 0.1 : spring(lt - dur * 0.5, 320, 20);
    for (const sx of [-1, 1]) {
      const ex = cx + sx * H * 0.17, ey = cy - H * 0.04;
      g.fillStyle = '#d8cfb6';
      g.save(); g.translate(ex, ey); g.scale(1, 0.15 + eo * 0.85);
      g.beginPath(); g.ellipse(0, 0, H * 0.065, H * 0.03, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = I.INK; g.beginPath(); g.arc(0, 0, H * 0.017 * (0.4 + eo * 0.6), 0, Math.PI * 2); g.fill();
      g.restore();
    }
    I.line(g, cx - H * 0.25, cy - H * 0.12, cx - H * 0.08, cy - H * 0.1, 14, 8, I.INK);
    I.line(g, cx + H * 0.08, cy - H * 0.1, cx + H * 0.25, cy - H * 0.12, 8, 14, I.INK);
  } else if (S.macro === 'spearTip') {
    I.paper(g, W, H, '#3c372d', 0.3, 0.05);
    const drift = Math.sin(lt * 0.8) * 20;
    g.save(); g.translate(W / 2 + drift, H * 0.2); g.rotate(0.3);
    g.fillStyle = '#c9c2ae';
    g.beginPath(); g.moveTo(0, -H * 0.05); g.lineTo(26, H * 0.1); g.lineTo(0, H * 0.3); g.lineTo(-26, H * 0.1); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.moveTo(0, -H * 0.05); g.lineTo(8, H * 0.1); g.lineTo(0, H * 0.3); g.lineTo(-8, H * 0.1); g.fill();
    g.restore();
    // hidden face below
    I.blob(g, W / 2 - 60, H * 0.78, 60, 47, I.INK, 0.8, 1.1);
    g.fillStyle = '#d8cfb6';
    g.beginPath(); g.ellipse(W / 2 - 78, H * 0.76, 22, 8, -0.1, 0, Math.PI * 2); g.fill();
  } else if (S.macro === 'moon') {
    I.paper(g, W, H, '#181613', 0.1, 0.04);
    I.moon(g, W / 2, H * 0.42, 130, 1.2);
  }
}

export { CAST };
