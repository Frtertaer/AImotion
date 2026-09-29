// Overlay timeline for stream clip c002 (28.867 s, 1080x1920, 30 fps).
// Every key is pinned to a word from words.json (faster-whisper large-v3, clip-relative seconds).
export const DUR = 28.867;

export const T = {
  // hook question: big on the webcam, then docks small and stays until card C answers it
  titleIn: 0.08, titleDock: 3.4, titleOut: 12.34,
  // A. one gag: needle at TOP on "хорошие наушники", slammed to NORM on "нормальный звук";
  //    "не прям заебись" strikes the TOP tick.
  aIn: 0.25, aGood: 1.13, aNorm: 2.27, aStrike: 4.03, aOut: 5.7,
  // B. why he likes them: "открытого типа", "удобно ... лежат", cut on "Всё."
  bIn: 7.58, bOpen: 9.18, bComfy: 10.76, bOut: 11.94,
  // C. hates in-ear: "ненавижу" stamp, "вакуумки", "прошек"
  cIn: 12.34, cHate: 12.62, cWord: 13.02, cPro: 14.04, cOut: 15.25,
  // D. the ear: "ухо", bud in, "вываливается" (drops out of the card), "широкая",
  //    "раковина" (concha lit green, bud back in, payoff row held to the end of the card)
  dIn: 15.83, dHead: 16.35, dBudIn: 16.9, dFall: 18.27, dWide: 21.72, dConcha: 23.36, dBudBack: 23.7, dOut: 27.0,
  // E. ear tips: "амбушюры", "разные", "менял." — stays to the end
  eIn: 27.0, eTips: [27.44, 27.9, 28.3],
};

// SFX from the picture timeline, a few ms ahead of the visual contact.
export function cues() {
  const c = [];
  const add = (t, type, gain = 1) => c.push({ t: +Math.max(0, t).toFixed(3), type, gain });
  const cardIn = (t) => { add(t - 0.03, 'whoosh', 0.6); add(t + 0.06, 'pop', 0.7); };
  const cardOut = (t) => add(t - 0.02, 'whoosh', 0.45);
  cardIn(T.titleIn); add(T.titleDock, 'whoosh', 0.3); cardOut(T.titleOut);
  cardIn(T.aIn); add(T.aGood, 'blip', 0.7); add(T.aNorm - 0.02, 'thump', 0.9); add(T.aNorm, 'click', 0.8);
  add(T.aStrike + 0.25, 'tick', 0.8); cardOut(T.aOut);
  cardIn(T.bIn); add(T.bOpen, 'ding', 0.7); add(T.bComfy, 'ding', 0.7); add(T.bOut - 0.02, 'thump', 0.6);
  cardIn(T.cIn); add(T.cHate - 0.02, 'thump'); add(T.cHate, 'zap', 0.6); add(T.cWord, 'pop', 0.6); add(T.cPro, 'tick', 0.8); cardOut(T.cOut);
  cardIn(T.dIn); for (let k = 0; k < 6; k++) add(T.dIn + 0.1 + k * 0.12, 'tick', 0.35);
  add(T.dBudIn + 0.05, 'click', 0.8); add(T.dFall, 'whoosh', 0.6); add(T.dFall + FALL_EXIT, 'thump', 0.5);
  add(T.dWide - 0.02, 'pop', 0.7); add(T.dConcha - 0.02, 'pop', 0.7);
  add(T.dBudBack + 0.2, 'click', 0.8); add(T.dBudBack + 0.25, 'ding', 0.8); cardOut(T.dOut);
  cardIn(T.eIn); for (const t of T.eTips) add(t, 'blip', 0.7);
  return c.sort((a, b) => a.t - b.t);
}

// The earbud drops out of the ear and out through the bottom of the card (free fall, clipped).
// FALL.exit = ear-local y where it has left the card. Shared with the picture and the SFX.
export const FALL = { g: 1400, from: 150, exit: 420 };   // ~0.6 s from canal to out of the card
export const FALL_EXIT = Math.sqrt((2 * (FALL.exit - FALL.from)) / FALL.g);
