# AImotion studio — engine contract & reference

You are building a film for a code-driven motion-design studio. A film is a single
`index.html` (ES module, canvas `id="c"`) plus a `timeline.js` (the only source of
timing) plus docs. A headless renderer walks `t` from 0 to `dur`, calls
`window.seek(t)` per (sub)frame, pipes PNGs to ffmpeg.

## Hard contract (violating any = broken render)
- `window.FILM = { w, h, dur }`, `window.seek(t)` paints frame `t` and returns true,
  `window.READY = true` when fonts/assets are loaded.
- seek(t) is a PURE function of t: identical t ⇒ identical pixels. No Math.random
  (use `rng(seed)`), no setTimeout/rAF/CSS transitions, no state carried between
  seeks, no Date/performance.now.
- Format param: `?fmt=16x9|9x16|1x1` re-lays out EVERYTHING from W,H — never crop.
  `const P = Math.round(Math.min(W,H)/27)` is the design atom; M = 1.4P margins.
- Optional `?fps=` param makes the film know its own frame rate (nice: readouts).
- ES modules load over http (the renderer serves the dir) — no file://.
- System/local fonts only. Available: "JetBrains Mono" (any weight),
  "Liberation Sans Narrow" (900 is a great display face), DejaVu family.
- Banned looks: centered title on a gradient, everything fading in, corner labels
  or frame borders, glow on UI, stock particle explosions.
- One display font + one UI font + one accent color. New event every 2–4 s,
  hook in the first 2 s. Motion = springs, not easing curves.
- Audio: timeline.js must `export function cues()` returning
  `[{t, type, gain}, ...]` with types: click pop thump whoosh tick riser blip
  land zap ding. A score synth module is optional but welcome
  (node audio/score.mjs writes a 48kHz stereo WAV, deterministic).

## lib/motion.js API (import from '../../lib/motion.js')
- `clamp(x,a=0,b=1)`, `lerp(a,b,u)`
- `spring(t, k=170, d=26)` — closed-form damped spring 0→1 with overshoot
- `FEEL = { snappy:[320,30], base:[170,26], heavy:[90,20], playful:[220,14] }`
- `track(t, [[t0,v0],[t1,v1],...], [k,d])` — additive retargeting spring for
  multi-target values (call it EVERY frame; it integrates keys into a value)
- `rng(seed)` — mulberry32 deterministic PRNG
- `loopT(t, d)`, `beatIndex(t, beat)`, `sinceBeat(t, beat)`, `stretch`,
  `swapAlpha(t, a, b)`

## Renderer commands
```
node render.mjs films/<name> [--fps 60] [--sub 4] [--from 0] [--dur N] [--query 'fmt=9x16&fps=90'] [--out out.mp4]
node tools/check-seek.mjs films/<name>     # must print N/N identical
node tools/review.mjs <out.mp4> [--at T]   # contact/strip/phone/poster sheets
node audio/sfx.mjs <cues.json> <out.wav> --dur N
node audio/mix.mjs <pic.mp4> <out.mp4> <wav...> --lufs -14
```

## Reference film: SEEK (previous deliverable — do NOT copy its concept)
SEEK visualized its own renderer: a playhead on a film-time ruler, sampled frame
thumbnails, a linear/ease/spring race with ghost-bead trails, an image2pipe
stream, aspect-morphing cards, a SEEK lockup, then a real τ-reversal rewind.
Files below = its actual source (for conventions only).
