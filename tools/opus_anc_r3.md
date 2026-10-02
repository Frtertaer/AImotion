Round 3 — polish pass before shipping. Attached: 9x16 frames t=4, t=12.5,
t=19.5; 16x9 t=11. Same engine contract and FILE output.

The film is close. Remaining liabilities:

1. PORTRAIT GEOMETRY — the hooded figure reads 'blob': face too wide,
   mic arm is a stray line, no plush charm (the source has a Labubu
   hanging on the mic). Rebuild: narrower face (chamfered), shoulders as
   one clean dome, a hanging small blob-charm on the mic line with a
   swinging spring (phase-shifted to the pulse), wire visible.
2. 16x9 ROOM — panel 59% width is too heavy; make it W*.48 and shift the
   chat band so it spans the full right 47% width. Portrait inside must
   not exceed 62% of panel width.
3. BUD VISIBILITY — white bud on paper is nearly invisible: give it a
   very soft dark shadow ellipse under it (a 6% black blur line) and a
   hairline #c9c7c0 outline so the silhouette reads.
4. WHITE-FIELD ENTRANCE — currently a radial wipe; keep it but let the
   wipe leave a thin paper edge-ring on the noise field for ~0.8 s
   (residue of silence), then fade.
5. TYPE POLISH — 'SHUMODAV OFF' should be replaced: the film's real
   closing line is 'NOISE CANCELLED / NOISE RETURNED' — two lines,
   second line fires 1.4 s after the first, then both hold to the
   loop point. Keep cyrillic allowed, latin is fine.
6. Timeline is good — only add T.loopHold if needed for item 5.

Also write the missing ===FILE: films/anc/audio/score.mjs=== — a
deterministic synth that writes a 29 s 48 kHz stereo WAV at
films/anc/out/score.wav (path relative to CWD). Structure: section A
(0-8 s) noisy stream bed — filtered hiss bursts every eighth at 120 BPM
+ irregular chat-pops (use the cues() timing list mentally); section B
(8-14 s) rising inverse sweep (a sine sweeping down while hiss sweeps
up, cancelling feel); section C (14-21.8 s) near silence: only a low
60 Hz hum at -30 dB + sparse sine ping on beats 32/37/41; section D
(21.8-29 s) the noise bed rushes back at double density, final beat
kills to silence at 28.9 s. Use the WAV-writing approach you used for
pulse-circuit's score.