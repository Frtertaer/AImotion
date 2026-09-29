// Single source of timing for BIT: the film reads it to animate, audio/cues reads it for SFX.
// 120 BPM, beat = 0.5 s, 8 bars of 2 s.
export const BPM = 120;
export const BEAT = 60 / BPM;
export const DUR = 16;

export const T = {
  typed: [0.25, 0.5, 0.75], // "bit" typed at the prompt, one key per 8th note
  explode: 1.0,     // on the beat: cursor bursts into pixels
  land: 2.0,        // pixels have assembled; Bit lands
  hello: 2.1,       // terminal prints Bit's greeting
  blink1: 2.6,
  lookL: 3.0,
  lookR: 3.25,
  hop: 3.5,
  run: 4.0,
  jumps: [5.0, 6.0, 7.0],
  jumpLen: 0.8,
  clone: 8.0,
  name: 10.0,
  glitch: 11.5,
  hero: 12.0,
  ding: 13.1,
  lookL2: 13.35,
  lookR2: 13.55,
  blink2: 13.8,
  shrink: 14.0,
  walk: 14.6,
  collapse: 15.3,
  solid: 15.85,     // from here the cursor is drawn exactly like frame 0
};

// SFX cues derived from the picture timeline (~0.02 s ahead of contacts).
export function cues() {
  const c = [];
  const add = (t, type, gain = 1) => c.push({ t: +Math.max(0, t).toFixed(3), type, gain });
  for (const k of T.typed) add(k - 0.01, 'click', 0.7);
  add(T.explode - 0.5, 'riser', 0.6);
  for (let k = 0; k < 9; k++) add(T.explode + 0.05 + k * 0.05, 'pop', 0.35);
  add(T.land - 0.02, 'thump');
  for (let k = 0; k < 8; k++) add(T.hello + k * 0.06, 'tick', 0.3);
  add(T.blink1, 'tick', 0.4);
  add(T.hop, 'blip', 0.8); add(T.hop + T.jumpLen - 0.02, 'land', 0.7);
  for (let k = 0; k < 16; k++) add(T.run + k * 0.25, 'tick', 0.25);           // footsteps / typing
  for (const j of T.jumps) { add(j, 'blip'); add(j + T.jumpLen - 0.02, 'land'); }
  add(T.clone - 0.02, 'thump');
  for (let k = 0; k < 8; k++) add(T.clone + 0.05 + k * 0.08, 'pop', 0.4);
  for (let k = 0; k < 6; k++) add(T.clone + 0.5 + k * 0.25, 'blip', 0.3);
  add(T.name - 0.1, 'whoosh');
  for (let k = 0; k < 6; k++) add(T.name + 0.1 + k * 0.08, 'pop', 0.35);
  add(T.glitch, 'zap');
  add(T.hero - 0.02, 'thump'); add(T.hero + 0.05, 'whoosh', 0.6);
  add(T.ding, 'ding');
  add(T.blink2, 'tick', 0.4);
  add(T.shrink, 'whoosh', 0.6);
  for (let k = 0; k < 3; k++) add(T.walk + 0.1 + k * 0.23, 'tick', 0.45);
  add(T.collapse, 'pop', 0.6);
  add(T.solid - 0.05, 'click');
  return c.sort((a, b) => a.t - b.t);
}
