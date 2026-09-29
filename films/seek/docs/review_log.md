# SEEK — review log

Scores 1–10: hook / phone / motion / variety / composition / brand / sound.
Loop: render → contact/strip/phone/poster sheets → fix the 3 worst → repeat.

## Round 1 — draft @30fps sub=1 (all three fmts)

| axis | score | notes |
|---|---|---|
| hook | 6 | digits start racing at ~0.2s but frame 0 is a lone "t=0.000"; mid-air launch wanted |
| phone | 5 | 9:16 lanes top-crowded into the header, cells tiny in a 3×4, most of stage empty |
| motion | 8 | springs everywhere, overshoot visible in bead spacing; needs blur (sub=1 draft) |
| variety | 8 | 7 distinct acts; strong arc; rewind genuinely reverses world(τ) |
| composition | 5 | too much dead space: small grid, thin lanes, sparse pipe, nothing at edges |
| brand | 9 | film-about-its-engine is on-concept; ruler+playhead+probes read as one system |
| sound | 7 | score drafted to act sections; cues on grid; not yet measured to −14 LUFS |

3 worst fixes: (1) scale up cells/lanes/pipe/mp4 card, 9:16 grid bigger & re-centred;
(2) chapter header top-left + act zones on ruler + probe status line → kills dead space;
(3) sampling rays from playhead to each new cell; underbar flash; inversion flash at rewind cut.

## Round 2 — draft after composition pass (16:9 + 9:16 + 1x1 sheets)

| axis | score | notes |
|---|---|---|
| hook | 8 | timecode races from frame ~5, snaps to 0 on the downbeat; ruler docks under it |
| phone | 8 | 9:16: bigger cells (3×4 fills stage width), vertical lanes, headers read; lane labels collided with chapter header → lanes lowered (o: .08→.115 H, d: .62→.58) |
| motion | 9 | ghost-bead trails show velocity as spacing; energy rings on fast frames |
| variety | 9 | recursive mini-scenes in sampled frames; each fps version counts different frame totals (?fps=) |
| composition | 8 | full bleed: header TL, status BL-above-ruler, zones below baseline, pipe spans 62% W |
| brand | 9 | deterministic world: same t ⇒ same pixels (check-seek 12/12 throughout) |
| sound | 8 | score sections = acts; 103 SFX cues landed on 8ths/impacts; LUFS pass at mix |

3 worst fixes applied: VERT lane header collision; 1×1 counter/pipe crowding
(counter above channel, mp4 card resized to its own 4×3 grid); `t=` HUD moved
below zone labels (RULE.y+0.72→+1.95P) to stop overprinting.

## Round 3 — finals @60/90/180fps sub=4

Real motion blur (4 subframes/frame). Checklist after mux:
- [x] check-seek 12/12 after all edits
- [x] each fps cut prints its own TOTAL_F (1800/2700/5400)
- [x] loop: last frame returns τ→0 ⇒ identical to frame 0
- [x] audio mixed to −14 LUFS (ebur128 on the muxed file, not the log)

| axis | score |
|---|---|
| hook | 8 |
| phone | 8 |
| motion | 9 |
| variety | 9 |
| composition | 8 |
| brand | 9 |
| sound | 8 |
