# PULSE / CIRCUIT

## Concept
A single electrical pulse travels through a physical signal network. The image is the signal: rails are transmission lines, nodes are impedance chambers, bends are transformations, and the pulse is the only bright object. Nothing decorative exists outside the logic of transmission.

The film begins and ends with the same dormant circuit and the same pulse at the input. The central impossible moment is a rule-exact “crossing without contact”: two paths occupy the same visual coordinate, but their depth/order channels remain separate, so the pulse passes through its own route without collision. The event is impossible as a flat drawing and exact as a circuit diagram.

## Format behavior
All geometry is generated from `W`, `H`, and atom `P = round(min(W,H)/27)`. Landscape uses a horizontal circuit; portrait uses a vertical circuit; square uses a centered orthogonal circuit. The complete circuit, labels, pulse, and readouts are relaid out inside the safe area. Nothing is cropped.

## Beat map
120 BPM; 0.5 s beat; 1 s bar; 30 s = 60 beats.

- 0–2 s / bars 1–2: dormant input terminal; pulse wakes on beat 4.
- 2–8 s / bars 3–8: pulse travels through straight transmission rails.
- 8–14 s / bars 9–14: impedance chambers compress, delay, and brighten it.
- 14–20 s / bars 15–20: branching network; two copies follow different path lengths.
- 20–24 s / bars 21–24: impossible crossing; paths overlap in projection but retain depth order.
- 24–28 s / bars 25–28: branches recombine into one pulse; circuit resolves.
- 28–30 s / bars 29–30: pulse returns to input; exact bookend.

## Palette
- Background: `#101313`
- Structure: `#33403D`
- Secondary text: `#82918B`
- Signal accent: `#FFB000`
- Signal white: `#FFF4D0`

One accent color only: amber.

## Deliverables
- `index.html`: deterministic canvas film, all three aspect formats.
- `timeline.js`: sole timing source and event cues.
- `audio/score.mjs`: deterministic 48 kHz stereo WAV generator.
- `docs/style_guide.md`: visual rules.
- `docs/shotlist.md`: beat-locked shot specification.

