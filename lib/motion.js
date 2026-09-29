// Motion primitives. Every function here is a pure function of time, so
// window.seek(t) can paint any frame without simulating the ones before it.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;

// Closed-form damped spring from 0 to 1, started at t = 0.
// k = stiffness, d = damping (unit mass). Underdamped overshoots, the rest settle.
export function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w = Math.sqrt(k);
  const z = d / (2 * w);
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }
  if (z === 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  // Overdamped: two real roots.
  const s = w * Math.sqrt(z * z - 1);
  const r1 = -z * w + s, r2 = -z * w - s;
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

// Presets: [stiffness, damping].
export const FEEL = {
  snappy: [320, 30],  // buttons, toggles, leading edges
  base: [170, 26],    // cards, containers, camera
  heavy: [90, 20],    // big type, logo lockups
  playful: [220, 14], // mascots, stickers: visible overshoot
};

// A value that is retargeted several times. keys = [[time, value], ...] sorted by time.
// Each change adds its own spring from its own start time, so motion stays continuous
// and the result is still closed-form.
export function track(t, keys, [k, d] = FEEL.base) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  return v;
}

// Stretchy indicator: leading edge stiffer than trailing edge.
export function stretch(t, keys, width) {
  const a = track(t, keys, FEEL.snappy);
  const b = track(t, keys, [140, 22]);
  return { left: Math.min(a, b), right: Math.max(a, b) + width };
}

// Opacity for content inside a morphing container: enters after the morph starts,
// leaves before the next one.
export function swapAlpha(t, tIn, tOut, fade = 0.12) {
  return Math.min(clamp((t - tIn - 0.08) / fade), clamp((tOut - 0.1 - t) / fade));
}

export const loopT = (t, dur) => ((t % dur) + dur) % dur;

// Seeded PRNG (mulberry32). Never use Math.random in a film.
export function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Beat helpers: beats = sorted array of seconds (from beats.json).
export const beatIndex = (t, beats) => {
  let i = -1;
  while (i + 1 < beats.length && beats[i + 1] <= t) i++;
  return i;
};
export const sinceBeat = (t, beats) => {
  const i = beatIndex(t, beats);
  return i < 0 ? Infinity : t - beats[i];
};
