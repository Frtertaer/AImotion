You are the fixer in a motion-design conveyor. A judge demands these changes:

{PLAN}

Current composition file (HTML with one GSAP timeline; all styling inline):

```html
{FILE}
```

Emit a JSON array of patch objects that implement the plan:
[{"find": "<exact string copied verbatim from the file>", "replace": "<new string>"}, ...]

Rules:
- Every "find" must be a verbatim substring appearing EXACTLY ONCE in the file
  (include enough surrounding context to be unique — the tool counts matches).
- Never animate left/top/width on elements — GSAP x/y/scale/rotation only.
- Never introduce: network URLs, Math.random, Date.now, setTimeout/rAF,
  repeat:-1/yoyo without finite count, async code. Determinism is mandatory.
- Keep WCAG contrast (4.5:1 small text / 3:1 large) — opaque bg or ink text on accent.
- Keep line-height >= 1.06 and margin:0 on headings (layout linter).
- If the plan asks for something impossible under these rules, implement the
  closest legal version; skip what cannot be expressed.
- Prefer fewer, high-leverage patches over many small ones. Max 12 patches.
- HARD BANS: never hide or empty an existing system — no display:none,
  background:transparent !important, or removing .band/.panel/.seal/.kick/
  .detail/.quote/.row/.lm/.li elements. Additions and parameter tweaks only.
- HARD BANS: never replace the whole timeline IIFE or a whole <style> block;
  each "replace" string stays under 60 lines. No AudioContext/tl.call/WebAudio.
- HARD BANS: no transparent-fill text (-webkit-text-stroke hollow, color:transparent
  with stroke) — the checker flags it as invisible text.
- HARD BANS: no letterSpacing/fontSize/layout-property tweens (StaticGuard
  rejects seek-hazard motion) — transform x/y/scale/rotation/opacity,
  strokeDasharray/strokeDashoffset, clipPath, filter only.

Output ONLY the json code block:
```json
[ ... ]
```
