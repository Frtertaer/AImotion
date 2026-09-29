# STYLE GUIDE

## Meaning
Every visible mark must be one of four things:

1. **Rail** — a medium carrying the signal.
2. **Node** — a place where signal energy changes.
3. **Pulse** — the traveling information.
4. **Readout** — a measurement of the circuit, never a caption floating outside it.

## Geometry
- Use only horizontal, vertical, and 45-degree segments.
- Rail width: `0.12P`.
- Node radius: `0.42P`.
- Pulse radius: `0.28P`; active pulse may reach `0.5P`.
- All coordinates derive from `P`, `W`, `H`, and normalized safe-area fractions.
- No frame border, vignette, gradient, glow, or particle field.
- Curves are forbidden except pulse rings and spring overshoot indicators.
- Labels sit beside the rail or inside a chamber; never in corners.

## Motion
- Every event begins on a beat or half-beat.
- Motion uses closed-form springs from `lib/motion.js`.
- Pulse position is a deterministic function of time and path segment.
- Signal brightness represents amplitude.
- Signal width represents bandwidth.
- A chamber changes one measurable property at a time.
- No global fade-in or fade-out.

## Typography
- Display: Liberation Sans Narrow 900.
- UI: JetBrains Mono 500/700.
- Display text is only used for `PULSE`.
- UI text is lowercase technical notation: `in`, `delay`, `split`, `phase`, `out`.
- Text is amber only when describing the currently active signal.

## Impossible crossing
At the crossing, two branches share the same screen-space intersection. The upper branch is drawn first and the lower branch second, with a one-atom interruption in the upper rail. The pulse on the lower branch remains continuous. The resulting frame reads as a signal passing through itself while exact layer order preserves the rules.

## Relayout
- Landscape: circuit axis is horizontal.
- Portrait: circuit axis is vertical.
- Square: circuit becomes a compact orthogonal loop.
- The input and output are always on the primary axis.
- Labels rotate only in portrait.
- The crossing remains visible in all formats.

