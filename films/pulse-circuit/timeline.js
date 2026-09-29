export const BPM = 120;
export const BEAT = 60 / BPM;
export const E8 = BEAT / 2;
export const BAR = BEAT * 2;
export const DUR = 30;

export const T = {
  arm: 0,
  trigger: 4 * BEAT,
  transmit: 4 * BEAT,
  chamber: 16 * BEAT,
  split: 28 * BEAT,
  crossing: 40 * BEAT,
  recombine: 48 * BEAT,
  resolve: 52 * BEAT,
  return: 56 * BEAT,
  bookend: 58 * BEAT,
  end: DUR
};

export function cues() {
  const c = [];
  const add = (t, type, gain = 1) =>
    c.push({ t: +t.toFixed(3), type, gain });
  add(T.trigger, 'zap', .8);
  for (let b = 5; b <= 15; b++) add(b * BEAT, 'tick', .25);
  add(T.chamber, 'thump', .7);
  for (let b = 17; b < 28; b++) add(b * BEAT, 'tick', .22);
  add(T.split, 'pop', .8);
  for (let b = 29; b < 40; b++) add(b * BEAT, 'blip', .22);
  add(T.crossing, 'whoosh', .6);
  for (let b = 41; b < 48; b++) add(b * BEAT, 'tick', .3);
  add(T.recombine, 'land', .9);
  for (let b = 49; b < 56; b++) add(b * BEAT, 'tick', .22);
  add(T.return, 'ding', .7);
  return c.sort((a, b) => a.t - b.t);
}
