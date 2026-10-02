Round 2 critique of your ANC draft. Attached: t=4 and t=10.5 (9x16), t=17
(16x9), and three SOURCE frames showing the real composition
(top=streamer face in dark room, bottom=white keynote card, right=RU chat
column with donation badges).

Scores: conceit 9, white-field payoff 8, noise-field richness 5, source
fidelity 4, cancellation legibility 5, room panel 3.

Keep the concept and structure. Fix, in one rewrite:

1. SOURCE COMPOSITION — the real frame is a STACKED split: the streamer's
   face occupies the top ~55%, the white keynote card the bottom ~45%,
   with the chat column overlaid at the right. Make your room viewport
   reflect THAT: a top-panel portrait crop (geometric two-tone head —
   hooded shoulders + earbud wire + mic), NOT a full-height doodle figure.
   In 9x16 put the room as the upper-left window and let chat own the
   right edge top-to-bottom; in 16x9 room left, chat column right.
2. NOISE DENSITY — triple the glyph count (~90-110), add: small emote
   squares, streaking chat lines (motion-stretched), one scrolling
   "TOP DONATION 10 555 ₽" strip, a second slow lane of dim background
   glyphs at ~40% alpha. Glyphs must flow in 4-6 horizontal lanes that do
   not overlap vertically.
3. CANCELLATION MUST BE SEEN — when the carrier front passes a glyph it
   collapses into the zero line AT the front (not a global fade): each
   glyph gets cancel=clamp((frontX - itsX)/reach). Render the noise wave
   only where not yet cancelled; behind the front the wave is FLAT zero
   line. The anti-wave wraps the front point only.
4. WHITE FIELD — replace the bare black dot with the actual bud: a
   minimal AirPod bud silhouette (white circle + angled stem, 3-4 shapes)
   rotating gently, "5 HOURS" / "ACTIVE NOISE CANCELLATION" type stays.
   Also add a hairline zero-line across the field under the type.
5. END BEAT — at ~21.8s noise floods back: let the LAST chat glyph die
   against the loop point: on the final 0.4s everything stills to the
   noise field's opening frame so the loop is invisible.

Same contract + same FILE output format (index.html + timeline.js).