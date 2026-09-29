# PULSE / CIRCUIT — review log

Critique loop run by `claude-opus-5` (NexoraX proxy, Anthropic Messages API)
driving `tools/opus.mjs`: each round rendered the film, sent the review sheets
to the model, and applied the file it returned. Determinism re-verified with
`check-seek` (12/12) after every edit.

## Round 1 — generation
Model invented the film from the studio context (concept: a single electrical
pulse traversing a rule-bound circuit; the impossible moment is a projected
crossing that holds distinct depth channels). Delivered brief/style/shotlist,
timeline.js (120 BPM), index.html, audio/score.mjs.

Static audit of the generated code found:
- `'right'` passed into a color parameter → `OUT` label invalid.
- `G.split`/`G.cross` indexed as arrays though defined `{x,y}` → NaN → the
  crossing and `split` label never rendered.
- `pulseAt()` parked a duplicate pulse at the output for the whole second half.
- `ticks()` drew beat marks through the circuit midline.
- `?fps=` unused.

## Round 2 — contract violation
Model's first rewrite replaced the seek contract with a live-animation page
(rAF, `performance.now()`, innerWidth sizing). Rejected; regenerated with the
contract restated verbatim. Result: compliant file, but composition sat in a
thin horizontal band — ~70% empty frame, text at 12 px, dust sub-pixel.
Self-scores: motion 3, variety 3, beat sync 3, phone 4.

## Round 3 — scale pass
Everything rescaled up (labels min `P*.55`, cards `P*.62`, chamber/crossing
enlarged); staged orthographic Z panel added; beat stage-flash on rail+nodes;
bookend text unified for the loop. New defect: `safeSpring` called `spring()`
with a made-up 5-arg signature inside try/catch → `panelReveal` ≈ 0 → the
climax panel still never rendered. `safeSpring` deleted; real
`spring(t-15.8, ...FEEL.base)` wired with an explicit fade-out.

## Round 4 — climax fix + polish
Z panel now renders (verified at t=19 full-res). Panel header labels
collided → stacked on two lines; pulse on the branch given the stretched body
+ wake of the rail pulse; 9:16 event card moved under the ruler.

Final state: all axes ≥8 by the model's own scoring; 12/12 deterministic;
three formats re-laid-out from `?fmt`; `?fps=` drives the visible frame
counter so the 60/90/180 fps cuts are per-rate distinct.

Audio: `score.mjs` (Opus-authored synth, beat-sectioned per `T`) + 53 sfx cues
from `cues()`; muxed to −14 LUFS target on every final.
