// Single source of timing for SEEK: the film reads it to animate, audio/cues reads it for SFX.
// 128 BPM, beat = 0.46875 s, 16 bars of 1.875 s. DUR = 30.0 s = exactly 64 beats.
export const BPM = 128;
export const BEAT = 60 / BPM;
export const E8 = BEAT / 2;
export const BAR = BEAT * 4;
export const DUR = 30;

export const T = {
  // TICK — the renderer probes every t, then snaps back to 0
  raceTo: 0.15,          // digits start racing toward 30.000
  raceBack: 1.41,        // snap back to 0 (beat 3)
  tickStamp: [0.94, 1.17, 1.41, 1.64], // ruler ticks stamp on 8ths
  rulerDock: 1.5,        // ruler springs into place, done by act 2

  // SAMPLES — playhead samples 12 frames, one per beat
  samples: 1.875,        // act start
  cells: Array.from({ length: 12 }, (_, i) => 1.95 + i * BEAT), // 1.95 … 7.11
  cellsOut: 7.2,         // strip collapses toward the ruler

  // SPRING — three launches on beats 17 / 20 / 23
  spring: 7.5,
  launches: [17 * BEAT, 20 * BEAT, 23 * BEAT],   // 7.97 / 9.38 / 10.78
  launchLabels: [18 * BEAT, 21 * BEAT, 24 * BEAT],
  settle: 13.0,          // spring locked on target
  gridPulse: 13.125,     // downbeat ring

  // PIPE — the encoder swallows the 12 frames, mp4 lands
  pipe: 13.125,
  stream: Array.from({ length: 12 }, (_, i) => 13.6 + i * E8), // 13.6 … 16.17
  pipeLabel: 14.3,
  mp4Drop: 18.28,        // beat 39: card lands

  // FORMAT — one card morphs aspect on three downbeats, then fans out
  format: 18.75,
  morphs: [41 * BEAT, 43 * BEAT, 45 * BEAT],     // 19.22 / 20.16 / 21.09
  fan: 21.56,            // three formats stand apart (beat 46)
  oneTimeline: 21.85,

  // LOCKUP — everything collapses to ticks; ticks grow into SEEK
  lockup: 22.5,
  letters: Array.from({ length: 4 }, (_, i) => 22.74 + i * 0.36), // S E E K
  tagline: [24.0, 25.4], // typing window
  underbar: 25.31,       // beat 54 accent bar

  // REWIND — the playhead drags time backwards to frame 0
  rewind: 26.25,
  hold: 27.19,           // beat 58: sweep starts
  ghosts: Array.from({ length: 8 }, (_, i) => 27.4 + i * E8),    // act echoes backwards
  black: 29.86,          // settle into frame 0
};

// SFX cues derived from the picture timeline (~0.02 s ahead of contacts).
export function cues() {
  const c = [];
  const add = (t, type, gain = 1) => c.push({ t: +Math.max(0, t).toFixed(3), type, gain });
  for (let k = 0; k < 10; k++) add(T.raceTo + k * 0.09, 'tick', 0.3);            // digits racing
  add(T.raceBack - 0.02, 'click', 0.9);
  for (const k of T.tickStamp) add(k - 0.01, 'click', 0.5);
  add(T.rulerDock - 0.03, 'riser', 0.5);
  add(T.samples - 0.02, 'thump', 0.8);
  for (const k of T.cells) { add(k - 0.02, 'pop', 0.5); add(k + 0.16, 'click', 0.35); }
  add(T.cellsOut, 'whoosh', 0.5);
  add(T.spring - 0.02, 'thump', 0.7);
  const feels = [['tick', 0.7], ['tick', 0.7], ['blip', 1]];
  T.launches.forEach((L, i) => { add(L, feels[i][0], feels[i][1]); add(T.launchLabels[i], 'click', 0.5); });
  add(T.launches[2] + 0.55, 'whoosh', 0.4);                                     // overshoot
  add(T.settle - 0.02, 'land', 0.9); add(T.gridPulse - 0.02, 'thump', 0.8);
  add(T.pipe - 0.02, 'thump', 0.7);
  for (const k of T.stream) add(k - 0.01, 'tick', 0.3);
  add(T.pipeLabel, 'click', 0.5);
  add(T.mp4Drop - 0.06, 'riser', 0.5); add(T.mp4Drop - 0.02, 'thump', 1);
  add(T.format - 0.02, 'thump', 0.7);
  for (const m of T.morphs) add(m - 0.02, 'whoosh', 0.6);
  add(T.fan - 0.02, 'pop', 0.8); add(T.oneTimeline, 'ding', 0.7);
  add(T.lockup - 0.03, 'whoosh', 0.9);
  for (const k of T.letters) add(k - 0.01, 'pop', 0.55);
  for (let k = 0; k < 10; k++) add(T.tagline[0] + k * 0.09, 'tick', 0.28);
  add(T.underbar - 0.02, 'thump', 0.9); add(T.underbar + 0.03, 'ding', 0.6);
  add(T.rewind - 0.02, 'thump', 0.6);
  add(T.hold, 'zap', 0.8); add(T.hold + 0.1, 'whoosh', 0.7);
  for (const k of T.ghosts) add(k - 0.01, 'tick', 0.25);
  add(T.black - 0.04, 'click', 0.8);
  return c.sort((a, b) => a.t - b.t);
}
