// Articulated ink figure. A figure is a ground anchor + a pose dict; every pose
// is a pure function of phase (walk cycle position, attack progress, breath).
import { clamp, lerp } from '../../lib/motion.js';
import { stroke, line, blob, INK, PAPER } from './ink.js';

// ---- skeleton -----------------------------------------------------------
// Figure space: origin at ground under hips, x right, y UP (positive).
// j = {hip, neck, head, sh, elL, elR, haL, haR, knL, knR, ftL, ftR}

const mid = (a, b, push, bend = 1) => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
  return { x: mx - (dy / l) * push * bend, y: my + (dx / l) * push * bend };
};

// two-segment limb: hip->foot with knee bulging `bend` side.
function legJoints(hipX, hipY, footX, footY, bend = 1) {
  const hip = { x: hipX, y: hipY }, ft = { x: footX, y: footY };
  const kn = mid(hip, ft, Math.hypot(footX - hipX, footY - hipY) * 0.18, bend);
  return { kn, ft };
}
function armJoints(sh, hx, hy, bend = -1) {
  const ha = { x: hx, y: hy };
  const el = mid(sh, ha, Math.hypot(hx - sh.x, hy - sh.y) * 0.25, bend);
  return { el, ha };
}

// ---- poses --------------------------------------------------------------
// Each returns joint dict J given (ph, o). o: {s, facing, lean, ...}
// All coords in figure space (y up); scaled by s outside.

function legCycle(ph, amp, lift, spread) {
  const a = Math.sin(ph * Math.PI * 2);
  return { swing: a, liftL: Math.max(0, Math.sin(ph * Math.PI * 2)) * lift, liftR: Math.max(0, -Math.sin(ph * Math.PI * 2)) * lift };
}

const POSES = {
  stand(ph, o) {
    const bob = Math.sin(ph * Math.PI * 2) * 0.008;
    return base(o, {
      hipY: 0.52 + bob, lean: o.lean ?? 0.03,
      ftL: [-0.07, 0], ftR: [0.09, 0],
      haL: [-0.16, 0.32], haR: [0.17, 0.31],
      kneeBend: 1, elbowBend: -1,
    });
  },
  alert(ph, o) { // guard-ish stance, weight low
    return base(o, {
      hipY: 0.47, lean: o.lean ?? 0.14,
      ftL: [-0.16, 0], ftR: [0.15, 0],
      haL: [-0.1, 0.45], haR: [0.14, 0.42],
    });
  },
  walk(ph, o) {
    const c = legCycle(ph, 1, 0.05, 1);
    return base(o, {
      hipY: 0.5 + Math.abs(Math.cos(ph * Math.PI * 2)) * 0.025,
      lean: o.lean ?? 0.09,
      ftL: [-0.07 + c.swing * 0.13, c.liftL], ftR: [0.09 - c.swing * 0.13, c.liftR],
      haL: [-0.15 - c.swing * 0.09, 0.33], haR: [0.16 + c.swing * 0.09, 0.32],
    });
  },
  run(ph, o) {
    const c = legCycle(ph, 1, 0.09, 1);
    return base(o, {
      hipY: 0.49 + Math.abs(Math.cos(ph * Math.PI * 2)) * 0.045,
      lean: o.lean ?? 0.3,
      ftL: [-0.05 + c.swing * 0.24, c.liftL], ftR: [0.1 - c.swing * 0.24, c.liftR],
      haL: [-0.14 - c.swing * 0.2, 0.36 + c.swing * 0.06], haR: [0.15 + c.swing * 0.2, 0.35 - c.swing * 0.06],
    });
  },
  stagger(ph, o) { // exhausted trudge
    const c = legCycle(ph, 1, 0.06, 1);
    const wob = Math.sin(ph * Math.PI * 2 + 1.2) * 0.05;
    return base(o, {
      hipY: 0.46 + Math.abs(Math.cos(ph * Math.PI * 2)) * 0.02,
      lean: 0.24 + wob,
      ftL: [-0.08 + c.swing * 0.1, c.liftL], ftR: [0.1 - c.swing * 0.1, c.liftR],
      haL: [-0.17, 0.24], haR: [0.18, 0.23],
    });
  },
  crouch(ph, o) {
    return base(o, {
      hipY: 0.33, lean: 0.42,
      ftL: [-0.1, 0], ftR: [0.12, 0],
      knPush: 0.32,
      haL: [-0.12, 0.3], haR: [0.15, 0.3],
    });
  },
  kneel(ph, o) {
    const j = base(o, {
      hipY: 0.3, lean: o.lean ?? 0.12,
      ftL: [-0.16, -0.24], ftR: [0.1, 0],
      haL: [-0.14, 0.26], haR: [0.15, 0.25],
    });
    j.knL = { x: j.ftL.x + 0.02, y: -0.24 }; // knee on ground
    return j;
  },
  sit(ph, o) {
    return base(o, {
      hipY: 0.16, lean: 0.16,
      ftL: [-0.2, -0.14], ftR: [0.2, -0.14],
      knPush: 0.4,
      haL: [-0.13, 0.1], haR: [0.14, 0.09],
    });
  },
  lie(ph, o) { // sprawled on back, head left
    return {
      hip: { x: 0.05, y: 0.06 }, neck: { x: -0.32, y: 0.05 }, head: { x: -0.44, y: 0.055 },
      sh: { x: -0.32, y: 0.05 },
      elL: { x: -0.3, y: 0.16 }, haL: { x: -0.26, y: 0.26 },
      elR: { x: -0.42, y: 0.12 }, haR: { x: -0.5, y: 0.19 },
      knL: { x: 0.3, y: 0.12 }, ftL: { x: 0.5, y: 0.08 },
      knR: { x: 0.24, y: 0.02 }, ftR: { x: 0.44, y: -0.02 },
    };
  },
  rise(ph, o) { // pushing up from ground: 0=flat ->1=standing
    const p = clamp(ph);
    const lieJ = POSES.lie(ph, o);
    const stJ = POSES.stand(0, o);
    const mix = {};
    for (const k of Object.keys(stJ)) {
      mix[k] = { x: lerp(lieJ[k].x, stJ[k].x - 0.1, p), y: lerp(lieJ[k].y, stJ[k].y, p) };
    }
    mix.neck.y = lerp(lieJ.neck.y, stJ.neck.y, p * p);
    mix.haL = { x: lerp(lieJ.haL.x, -0.05, p), y: lerp(lieJ.haL.y, 0.28, p * p) }; // arm pushes
    return mix;
  },
  carry(ph, o) { // carrying friend on back — hands hooked up
    const c = legCycle(ph, 1, 0.05, 1);
    return base(o, {
      hipY: 0.47, lean: 0.34,
      ftL: [-0.08 + c.swing * 0.1, c.liftL], ftR: [0.1 - c.swing * 0.1, c.liftR],
      haL: [-0.02, 0.62], haR: [0.2, 0.6], // arms up behind shoulders
      elbowBend: 1.4,
    });
  },
  gripLow(ph, o) { // bokuto held low-forward
    return base(o, {
      hipY: 0.47, lean: 0.16,
      ftL: [-0.15, 0], ftR: [0.16, 0],
      haL: [0.1, 0.36], haR: [0.22, 0.34], // hands together front
      elbowBend: -0.6,
    });
  },
  swing(ph, o) { // ph 0..1 = overhead raise -> downward smash
    const p = clamp(ph);
    const raise = { haL: [-0.02, 0.78], haR: [0.12, 0.84] };
    const hit = { haL: [0.16, 0.3], haR: [0.4, 0.18] };
    const e = p < 0.45 ? p / 0.45 * 0.15 : 1;                     // hold at top
    const q = p < 0.45 ? p / 0.45 : 1;
    const haL = { x: lerp(raise.haL[0], hit.haL[0], q), y: lerp(raise.haL[1], hit.haL[1], q) };
    const haR = { x: lerp(raise.haR[0], hit.haR[0], q), y: lerp(raise.haR[1], hit.haR[1], q) };
    return base(o, {
      hipY: 0.5 - p * 0.1, lean: -0.1 + p * 0.5,
      ftL: [-0.14, 0], ftR: [0.16 - p * 0.1, 0],
      haL, haR, elbowBend: -0.4,
    });
  },
  lunge(ph, o) {
    const p = clamp(ph);
    return base(o, {
      hipY: 0.44 - p * 0.04, lean: 0.24 + p * 0.4,
      ftL: [-0.2 - p * 0.1, 0], ftR: [0.2 + p * 0.14, 0],
      haL: [0.06 + p * 0.14, 0.4], haR: [0.16 + p * 0.3, 0.38],
      elbowBend: -0.5,
    });
  },
  recoil(ph, o) {
    const p = clamp(ph);
    return base(o, {
      hipY: 0.48 - p * 0.06, lean: -0.15 - p * 0.35,
      ftL: [-0.05 - p * 0.2, 0], ftR: [0.12, 0],
      haL: [-0.2, 0.4 + p * 0.1], haR: [0.22, 0.4 + p * 0.12],
    });
  },
  fall(ph, o) { // collapse forward to knees then flat-ish
    const p = clamp(ph);
    const j = base(o, {
      hipY: lerp(0.46, 0.12, p), lean: lerp(0.05, 0.9, p),
      ftL: [-0.1, -p * 0.2], ftR: [0.1, -p * 0.22],
      haL: [-0.15, lerp(0.3, 0.06, p)], haR: [0.16, lerp(0.29, 0.05, p)],
    });
    if (p > 0.5) j.head = { x: j.neck.x + 0.16, y: j.neck.y + 0.04 };
    return j;
  },
  reach(ph, o) {
    const p = clamp(ph);
    return base(o, {
      hipY: 0.5, lean: 0.05 + p * 0.12,
      ftL: [-0.07, 0], ftR: [0.1, 0],
      haL: [-0.14, 0.3], haR: [0.2 + p * 0.26, 0.45 + p * 0.16],
    });
  },
  point(ph, o) {
    const p = clamp(ph);
    return base(o, {
      hipY: 0.5, lean: 0.1 + p * 0.08,
      ftL: [-0.07, 0], ftR: [0.1, 0],
      haL: [-0.14, 0.3], haR: [0.18 + p * 0.3, 0.4 + p * 0.22],
    });
  },
  embrace(ph, o) { // arms wrapped forward — pairs with another fig
    return base(o, {
      hipY: 0.48, lean: 0.22,
      ftL: [-0.08, 0], ftR: [0.12, 0],
      haL: [0.05, 0.52], haR: [0.16, 0.5],
      elbowBend: 0.9,
    });
  },
  leap(ph, o) { // airborne — feet tucked, arms out
    return base(o, {
      hipY: 0.62, lean: 0.2,
      ftL: [-0.06, 0.3], ftR: [0.14, 0.22],
      knPush: 0.5,
      haL: [-0.3, 0.6], haR: [0.3, 0.62],
    });
  },
  write(ph, o) { // kneel at desk, scribbling arm
    const j = base(o, {
      hipY: 0.28, lean: 0.34,
      ftL: [-0.14, -0.2], ftR: [0.1, 0],
      haL: [-0.12, 0.22], haR: [0.2 + Math.sin(ph * Math.PI * 2 * 3) * 0.03, 0.16],
    });
    j.knL = { x: j.ftL.x, y: -0.2 };
    return j;
  },
  dragBack(ph, o) { // kneeling, arm up being pulled away
    const j = base(o, {
      hipY: 0.26, lean: -0.2,
      ftL: [-0.14, -0.2], ftR: [0.12, -0.02],
      haL: [-0.1, 0.2], haR: [0.24, 0.62],
    });
    j.knL = { x: j.ftL.x, y: -0.2 };
    return j;
  },
  howl(ph, o) { // head thrown back, arms half-raised
    return base(o, {
      hipY: 0.51, lean: -0.12,
      ftL: [-0.12, 0], ftR: [0.14, 0],
      haL: [-0.2, 0.44], haR: [0.24, 0.46],
      headUp: 0.18,
    });
  },
  flatDown(ph, o) { // pressed flat to ground, face up-left — hiding
    return {
      hip: { x: 0.02, y: 0.05 }, neck: { x: -0.36, y: 0.04 }, head: { x: -0.5, y: 0.045 },
      sh: { x: -0.36, y: 0.04 },
      elL: { x: -0.3, y: 0.1 }, haL: { x: -0.2, y: 0.09 },
      elR: { x: -0.44, y: 0.08 }, haR: { x: -0.52, y: 0.07 },
      knL: { x: 0.3, y: 0.07 }, ftL: { x: 0.52, y: 0.03 },
      knR: { x: 0.28, y: 0.02 }, ftR: { x: 0.48, y: -0.01 },
    };
  },
};

function base(o, p) {
  const hipY = p.hipY ?? 0.52;
  const hip = { x: 0, y: hipY };
  const lean = p.lean ?? 0;
  const neck = { x: hip.x + lean * 0.28, y: hipY + 0.3 };
  const head = { x: neck.x + lean * 0.08, y: neck.y + 0.12 - (p.headUp ? 0 : 0.02) };
  if (p.headUp) head.y = neck.y + p.headUp;
  const sh = { x: neck.x + lean * 0.05, y: neck.y - 0.02 };
  const L = legJoints(hip.x, hip.y - 0.02, p.ftL[0], p.ftL[1] ?? 0, p.kneeBend ?? 1);
  const R = legJoints(hip.x, hip.y - 0.02, p.ftR[0], p.ftR[1] ?? 0, p.kneeBend ?? 1);
  if (p.knPush) {
    L.kn.x -= 0; L.kn = mid(hip, L.ft, p.knPush, 1);
    R.kn = mid(hip, R.ft, p.knPush, 1);
  }
  const AL = armJoints(sh, p.haL.x !== undefined ? p.haL.x : p.haL[0], p.haL.y !== undefined ? p.haL.y : p.haL[1], p.elbowBend ?? -1);
  const AR = armJoints(sh, p.haR.x !== undefined ? p.haR.x : p.haR[0], p.haR.y !== undefined ? p.haR.y : p.haR[1], p.elbowBend ?? -1);
  return { hip, neck, head, sh, elL: AL.el, haL: AL.ha, elR: AR.el, haR: AR.ha, knL: L.kn, ftL: L.ft, knR: R.kn, ftR: R.ft };
}

// ---- renderer -----------------------------------------------------------
// o: { pose, ph, s(px height), facing (+1|-1), ink, hair:'topknot'|'band'|'helmet'|'woman'|'none',
//      prop:'bokuto'|'katana'|'spear'|'none', propAngle, propLen, cloak, alpha, hipProp }
export function fig(g, x, y, o) {
  const s = o.s ?? 100;
  const f = o.facing ?? 1;
  const ink = o.ink ?? INK;
  const ph = o.ph ?? 0;
  const J = (POSES[o.pose] || POSES.stand)(ph, o);
  const P = (j) => ({ x: x + j.x * s * f, y: y - j.y * s });
  const hip = P(J.hip), neck = P(J.neck), head = P(J.head), sh = P(J.sh);
  const elL = P(J.elL), haL = P(J.haL), elR = P(J.elR), haR = P(J.haR);
  const knL = P(J.knL), ftL = P(J.ftL), knR = P(J.knR), ftR = P(J.ftR);

  g.save();
  if (o.alpha !== undefined) g.globalAlpha = o.alpha;

  // shadow
  g.fillStyle = 'rgba(23,20,16,0.25)';
  g.beginPath(); g.ellipse(x, y + s * 0.02, s * 0.24, s * 0.035, 0, 0, Math.PI * 2); g.fill();

  const w = (v) => v * s;
  // far limbs (dimmer)
  const dim = 'rgba(23,20,16,0.55)';
  stroke(g, hip.x, hip.y, knL.x, knL.y, ftL.x, ftL.y, w(0.085), w(0.035), dim);
  stroke(g, sh.x, sh.y, elL.x, elL.y, haL.x, haL.y, w(0.07), w(0.03), dim);
  // torso — thick brush stroke
  stroke(g, hip.x, hip.y, (hip.x + neck.x) / 2, (hip.y + neck.y) / 2 - s * 0.02, neck.x, neck.y, w(0.24), w(0.13), ink);
  // cloak flaps (haori): two loose strokes from shoulders
  if (o.cloak) {
    const fl = Math.sin(ph * Math.PI * 2 * 0.6 + (o.seed || 0)) * s * 0.05;
    stroke(g, sh.x, sh.y, sh.x - f * s * 0.16 + fl, sh.y + s * 0.3, sh.x - f * s * 0.2 + fl * 1.6, sh.y + s * 0.5, w(0.09), w(0.02), ink, 0.75);
    stroke(g, sh.x, sh.y - s * 0.02, sh.x - f * s * 0.1 + fl * 0.5, sh.y + s * 0.34, sh.x - f * s * 0.06 + fl, sh.y + s * 0.56, w(0.07), w(0.015), ink, 0.6);
  }
  // head
  const hr = s * 0.078;
  blob(g, head.x, head.y, hr, (o.seed || 3) * 17 + 5, ink);
  // neck dab
  line(g, neck.x, neck.y, head.x, head.y + hr * 0.6, s * 0.05, s * 0.04, ink);
  // hair variants
  if (o.hair === 'topknot') {
    stroke(g, head.x, head.y - hr * 0.7, head.x + f * s * 0.02, head.y - hr * 1.6, head.x + f * s * 0.05, head.y - hr * 2.0, s * 0.02, s * 0.008, ink);
    stroke(g, head.x - f * hr * 0.6, head.y - hr * 0.4, head.x - f * hr * 1.1, head.y - hr * 0.2, head.x - f * hr * 1.4, head.y + hr * 0.5, s * 0.03, s * 0.006, ink, 0.9); // stray lock
  } else if (o.hair === 'band') {
    line(g, head.x - f * hr * 0.9, head.y - hr * 0.15, head.x + f * hr * 0.9, head.y - hr * 0.25, s * 0.028, s * 0.028, PAPER, 0.95);
    stroke(g, head.x - f * hr * 0.8, head.y - hr * 0.3, head.x - f * hr * 1.5, head.y - hr * 0.7, head.x - f * hr * 1.9, head.y - hr * 1.1, s * 0.014, s * 0.004, PAPER, 0.8); // band tails
  } else if (o.hair === 'helmet') {
    g.fillStyle = ink;
    g.beginPath(); g.arc(head.x, head.y - hr * 0.15, hr * 1.15, Math.PI, 0); g.fill();
    line(g, head.x - f * hr * 1.6, head.y - hr * 0.1, head.x + f * hr * 1.6, head.y - hr * 0.25, s * 0.03, s * 0.03, ink); // jingasa brim
  } else if (o.hair === 'woman') {
    stroke(g, head.x, head.y - hr * 0.5, head.x - f * hr * 0.9, head.y + hr * 0.6, head.x - f * hr * 1.3, head.y + hr * 1.8, s * 0.045, s * 0.01, ink, 0.95);
  }
  // near limbs
  stroke(g, hip.x, hip.y, knR.x, knR.y, ftR.x, ftR.y, w(0.09), w(0.038), ink);
  stroke(g, sh.x, sh.y, elR.x, elR.y, haR.x, haR.y, w(0.075), w(0.032), ink);
  // hand dabs
  blob(g, haL.x, haL.y, s * 0.025, 7, ink);
  blob(g, haR.x, haR.y, s * 0.025, 9, ink);

  // prop in right hand
  if (o.prop && o.prop !== 'none') {
    const a = (o.propAngle ?? -0.5) * f;
    const len = (o.propLen ?? 0.55) * s;
    const px = haR.x + Math.cos(a) * len * f * 0 + Math.sin(0) * 0; // base
    const ex = haR.x + f * Math.cos(Math.abs(a)) * len * (a >= 0 ? 1 : -1) * 0 + f * Math.sin(a) * 0; // unused
    // simpler: extend along angle a (radians, facing-relative)
    const ex2 = haR.x + Math.cos(a) * len;
    const ey2 = haR.y - Math.sin(a) * len;
    if (o.prop === 'bokuto' || o.prop === 'katana') {
      line(g, haR.x, haR.y, ex2, ey2, s * 0.02, s * 0.008, o.prop === 'katana' ? '#3a3a40' : '#4a3b28');
      if (o.prop === 'katana') line(g, haR.x, haR.y, haR.x + Math.cos(a) * s * 0.08, haR.y - Math.sin(a) * s * 0.08, s * 0.03, s * 0.03, '#222');
    } else if (o.prop === 'spear') {
      line(g, haR.x - Math.cos(a) * len * 0.3, haR.y + Math.sin(a) * len * 0.3, ex2, ey2, s * 0.016, s * 0.012, '#3d3529');
      blob(g, ex2, ey2, s * 0.02, 3, '#c9c2ae');
    }
  }
  g.restore();
}

export { POSES };
