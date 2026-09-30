You are the card author in a motion-design conveyor. An award jury said the
piece is below the Motion Awards 2025 winner level, and flagged THIS card for a
full redesign.

JURY NOTES:
{WHY}

WHAT SEPARATES WINNERS FROM THIS (the jury repeats these every round — treat
them as the brief, not as hints):
- TRANSFORMATION OVER LAYOUT. Winners don't present a finished card; they show
  a mechanism becoming the message. Compose the card so its elements visibly
  belong to ONE system: the concha ring, the canal aperture, the airflow
  strokes, the footage. If a label/bar/chip doesn't participate in that system,
  it is decoration — cut it.
- NEGATIVE SPACE IS THE LUXURY. At any judge timestamp the card must read as
  1 hero + at most 2 supporting marks on a calm field. Dense = below.
- TYPOGRAPHY IS MADE OF THE MECHANISM. Strokes, apertures, pressure deform —
  the letterforms should look drawn by the same airflow physics the concha
  ring obeys, not set in a font and decorated.
- RESTRAINT IN COLOR. One accent earns its place per card; the rest of the
  palette stays ink/paper unless the beat demands it.

Rewrite the entire card-host block below. It is one overlay card in a 1080×1920
9:16 HyperFrames composition for a Russian stream clip — Bratishkin reviews
AirPods (open fit) over an Apple keynote; the piece's single device is a
"concha ring" mechanism (airflow, open vs vacuum seal) that must generate or
drive every element on the card. Think: what does THIS beat of speech do to a
pressure/airflow system — and make the typography + graphics behave exactly
like that (letters breathe/open, compress/seal, stretch/lock, get sucked in).

CURRENT BLOCK:
```html
{BLOCK}
```

Output ONE ```html block with the new card-host, keeping EXACTLY this shell:
<div class="card-host clip" id="host-{CARD}" data-card-id="{CARD}" data-start="<same>" data-duration="<same>" data-track-index="2" style="left:0;top:0;width:1080px;height:1920px;visibility:hidden;opacity:0;">
  <div class="card" data-card-id="{CARD}">
    <div class="root"> ...your designed content... </div>
  </div>
</div>

STAGE MACHINERY — OFF LIMITS, OUTSIDE YOUR CARD (these now live at stage
level, outside the card-06 block; the shared GSAP timeline drives them by
id — do NOT recreate, duplicate, move, restyle, or reference them in your
block; creating elements with these ids inside your card breaks the film):
- #c06-draw + #c06-glyphs + .c06glyph.c06drawtext paths: the engineered
  monoline verdict word «ПРОПУСКАЕТ», drawn by strokeDashoffset.
- #c06-olet (stage-level svg sibling): the letter «О» as a stroked ring;
  the live footage docks into its counter at 24.9-26.2.
- #c06-link + #c06-linkpath + #c06-piptrail (stage-level svg): the path
  connecting the canal glyph to the verdict word, drawn on at 25.3.
- #c06-pulse / #c06-pulse2 / #c06-wordflow: impact rings on the «О» and the
  airflow line streaming through the completed word after 26.5.
YOUR CARD still owns (keep these inside your block):
- #c06-mouth: circle inside the card's canal glyph where the stage concha ring
  docks. Keep a circle with this id wherever you draw the canal/anatomy glyph.
- .c06z / .c06p: per-char spans on the two title lines (timeline targets
  .c06z:nth-of-type(N) and .c06p:nth-of-type(N) explicitly — keep these exact
  class names, one span per letter, spaces as text nodes).
- .char spans inside #c06-title (timeline staggers them on entrance).
You may restyle anything else freely — these ids/classes are the load-bearing
joints between your card and the film's living mechanism.

THE STROKE-TYPE SYSTEM — SHARED VOCABULARY, DO NOT REMOVE:
The film's key words are engineered monoline Cyrillic glyphs (stroke-width 7,
cap height 140) that self-draw via stroke-dashoffset: «ОТКРЫТОГО ТИПА»
(#c02-word .c02a/.c02b), «НЕ ЗАПЕЧАТАНО» (#c04-word .c04b), «ПРОХОДИТ»
(#c05-word .c05glyph), «ПРОПУСКАЕТ» (#c06-glyphs). If your card contains a
word built from <path> elements with stroke-dashoffset, KEEP it — it is one
family with the finale; you may reposition/scale/recolor it within the card's
composition, never replace it with font text.

Hard rules (the linter enforces them; violations get rolled back):
- All CSS inline or via classes already in the stylesheet: .root .band .panel
  .seal .seallabel .title .kick .detail .quote .lm .li .row .stamp .meterrim
  .meter .cross .budchip .char .c03ch .hollow. You may add small inline styles.
- Text MUST sit on an opaque or ≥.9-alpha background element; WCAG contrast
  4.5:1 small / 3:1 large. No transparent-fill stroked text (checker kills it).
- margin:0 and line-height ≥1.06 on headings; nothing may overlap text.
- No <script>, no external URLs, no emoji; Russian copy only, on-topic.
- Elements you want the GSAP timeline to drive need stable unique ids
  (prefix them c0N-) — the timeline may already reference existing ids:
  renaming ids is allowed only for elements you replace; keep the ids the
  timeline already uses unless the element is gone. Safer: reuse existing ids.
- Palette: ink #0c0a0d paper #f4f2ec accents #2a52be #d94f9e #ff3b5c #f0b13c #4ade80.
- Fonts: "Unbounded" (display), "Inter" (UI), "Caveat" (quote) — prefer the
  first two; the jury wants handwriting OUT.

Design like a title-sequence studio: one strong composition, not a caption.
