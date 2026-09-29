export const BPM = 120;
export const BEAT = 60 / BPM;
export const E8 = BEAT / 2;
export const BAR = BEAT * 2;
export const DUR = 29;

export const T = {
  noise: 0,
  carrier: 8,
  crossing: 10,
  field: 14,
  reward: 16,
  silence: 18,
  return: 21.8,
  flood: 23,
  bookend: 27.5,
  end: DUR
};

export function cues() {
  const c = [];
  const add = (t, type, gain = 1) =>
    c.push({t:+t.toFixed(3), type, gain});

  for (let b = 0; b < 16; b++) {
    const t = T.noise + b * E8;
    add(t, b % 4 === 0 ? 'thump' : 'tick', b % 4 === 0 ? .42 : .18);
  }

  add(T.carrier, 'zap', .95);
  add(T.carrier + E8, 'whoosh', .42);

  for (let b = 21; b < 29; b++) {
    add(b * BEAT, 'blip', .24);
  }

  add(T.crossing, 'pop', .72);
  add(T.field, 'land', .72);
  add(T.reward, 'ding', .48);
  add(16.5, 'ding', .16);
  add(19.25, 'tick', .09);
  add(20.5, 'ding', .13);

  add(T.return, 'whoosh', .58);
  for (let b = 45; b < 55; b++) {
    add(b * BEAT, b % 3 === 0 ? 'thump' : 'blip', b % 3 === 0 ? .52 : .22);
  }

  add(T.bookend, 'zap', .62);
  add(28.5, 'pop', .35);
  add(DUR-.4, 'tick', .18);

  return c.sort((a,b)=>a.t-b.t);
}
