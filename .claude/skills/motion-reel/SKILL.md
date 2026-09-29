---
name: motion-reel
description: Make a product film, showreel, launch video, animated explainer or motion ad rendered from code in this studio (seek(t) engine + ffmpeg). Use when the user asks for a motion video, reel or launch film in D:\AImotion.
---

# Motion reel

## Collect first (ask for what is missing)
Subject or product + URL, duration, formats (9:16 / 1:1 / 16:9), brand colors + fonts,
a reference (frame, video or image folder), music (file or "synthesize").

## Pipeline
1. `films/<name>/` from a copy of `films/demo/`. Assets into `films/<name>/assets/`.
   From a URL: real screenshots via Playwright, real logo and colors. Never invent product UI.
2. Reference given: extract frames with ffmpeg, write `docs/style_guide.md` (palette hex, type,
   shot lengths, transitions, camera, texture). Take the grammar, never the content.
3. Music: supplied → `audio/beats.py` → `beats.json`. Otherwise plan a BPM and synthesize.
4. `docs/shotlist.md` on the beat grid: every shot with time, camera, text, SFX.
   Show it and wait for OK.
5. Build `index.html` on `lib/motion.js`. Follow CLAUDE.md. `node tools/check-seek.mjs` must be N/N.
6. Review loop (CLAUDE.md), at least 3 rounds, scores logged in `docs/review_log.md`.
7. `render.mjs` → `sfx.mjs` → `mix.mjs` → `review.mjs`. Every requested format from one timeline
   (layout from `FILM.w/h`, not a crop).
8. Deliver `out/final.mp4`, `out/contact.png`, `out/poster.png`, the measured numbers
   (frames, duration, LUFS), and what you would improve next.

## Hard rules
- No Math.random, timers or CSS transitions in render mode.
- Banned looks: corner labels, centered title on gradient, everything fading in.
- API keys live in `.env` and are referenced by name, never pasted into prompts.
