// score.mjs — SEEK's soundtrack, synthesised in code. Minimal techno at 128 BPM in A minor:
// pitch-drop kick, sub-bass 8ths on Am–F–G, highpassed noise hats, a noise+body snare,
// a pulse arp in the build, a riser into LOCKUP, and a hard cut when the film rewinds.
//   node audio/score.mjs out.wav --dur 30
import fs from 'node:fs';
import { T, BPM, BEAT, E8, BAR, DUR } from '../timeline.js';

const A = process.argv;
const OUT = A[2] && !A[2].startsWith('--') ? A[2] : 'score.wav';
const SR = 44100, N = Math.floor(SR * DUR), L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan) * 0.5; R[i] += v * (1 + pan) * 0.5; } };
let seed = 4242;
const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

// ---------- voices ----------
function kick(t, amp = 1) {
  const s0 = Math.round(t * SR), n = Math.round(0.24 * SR); let ph = 0;
  for (let i = 0; i < n; i++) { const s = i / SR; ph += (46 + 120 * Math.exp(-s * 30)) / SR; add(s0 + i, Math.sin(ph * 2 * Math.PI) * amp * Math.exp(-s * 11)); }
}
function sub(t, dur, midi, amp = 0.5) {
  const f = hz(midi), s0 = Math.round(t * SR), n = Math.round(dur * SR); let ph = 0;
  for (let i = 0; i < n; i++) { const s = i / SR; ph += f / SR; const x = ph % 1; const v = x < 0.5 ? 4 * x - 1 : 3 - 4 * x; const env = Math.min(1, i / 200) * Math.min(1, (n - i) / (SR * 0.09)); add(s0 + i, v * amp * env); }
}
function hat(t, amp = 0.1, open = false) {
  const len = open ? 0.16 : 0.035, s0 = Math.round(t * SR), n = Math.round(len * SR); let prev = 0;
  for (let i = 0; i < n; i++) { const w = noise(), hp = w - prev; prev = w; add(s0 + i, hp * amp * (open ? Math.exp(-i / n * 3) : (1 - i / n)), 0.25); }
}
function snare(t, amp = 0.32) {
  const s0 = Math.round(t * SR), n = Math.round(0.16 * SR);
  for (let i = 0; i < n; i++) { const s = i / SR; add(s0 + i, (noise() * 0.75 + Math.sin(2 * Math.PI * 195 * s) * 0.4) * amp * Math.exp(-s * 20)); }
}
function pulse(t, dur, midi, amp, duty = 0.2, pan = 0, vib = 0) {
  const f = hz(midi), s0 = Math.round(t * SR), n = Math.round(dur * SR); let ph = 0;
  for (let i = 0; i < n; i++) { const s = i / SR; const env = Math.min(1, i / 80) * (s < dur * 0.72 ? 1 : 1 - (s - dur * 0.72) / (dur * 0.28)); ph += f * (1 + vib * Math.sin(s * 30)) / SR; add(s0 + i, ((ph % 1) < duty ? 1 : -1) * amp * env, pan); }
}
function riser(t, dur, amp = 0.2) {
  const s0 = Math.round(t * SR), n = Math.round(dur * SR); let prev = 0;
  for (let i = 0; i < n; i++) { const w = noise(), hp = w - prev; prev = w * 0.6; const u = i / n; add(s0 + i, hp * amp * u * u * 0.5 + Math.sin(2 * Math.PI * (220 + 1400 * u * u) * i / SR) * amp * 0.12 * u); }
}
function impact(t, amp = 0.9) {
  const s0 = Math.round(t * SR), n = Math.round(0.9 * SR); let ph = 0;
  for (let i = 0; i < n; i++) { const s = i / SR; ph += (38 + 60 * Math.exp(-s * 18)) / SR; add(s0 + i, (Math.sin(ph * 2 * Math.PI) * 0.8 + noise() * 0.25 * Math.exp(-s * 9)) * amp * Math.exp(-s * 4.2)); }
}
function chord(t, dur, midis, amp = 0.05) { for (const m of midis) pulse(t, dur, m, amp, 0.45, (m % 3 - 1) * 0.4); }

// ---------- sections (mapped to the film's acts) ----------
const SUB = [45, 45, 41, 43];                    // A A F G roots, one per bar
const ARP = [57, 60, 64, 67, 72, 76, 79, 84];    // Am pent ladder
const bars = [];
for (let b = 0; b < 16; b++) bars.push(b * BAR);

// TICK (bar 0): ticks only
for (let b = 0; b < 1; b++) for (let q = 0; q < 4; q++) hat(bars[b] + q * BEAT + E8, 0.05);
// SAMPLES (bars 1–3): kick on beats + sub enters on roots
for (let b = 1; b < 4; b++) {
  for (let q = 0; q < 4; q++) { kick(bars[b] + q * BEAT, 0.75); hat(bars[b] + q * BEAT + E8, 0.08); }
  sub(bars[b], BAR * 0.95, SUB[b % 4] - 12, 0.5);
}
// SPRING (bars 4–6): kick + sub 8ths, sparse hats
for (let b = 4; b < 7; b++) {
  for (let q = 0; q < 4; q++) { kick(bars[b] + q * BEAT, 0.8); hat(bars[b] + q * BEAT + E8, 0.1); }
  for (let e = 0; e < 8; e++) sub(bars[b] + e * E8, E8 * 0.8, SUB[b % 4] - 12 + (e % 4 === 3 ? 12 : 0), 0.42);
}
// PIPE (bars 7–9): full drive — kick 4, 16th hats, snare 2&4, bass 16ths
for (let b = 7; b < 10; b++) {
  for (let q = 0; q < 4; q++) kick(bars[b] + q * BEAT, 0.9);
  for (let k = 0; k < 16; k++) hat(bars[b] + k * E8 / 2, k % 4 === 2 ? 0.12 : 0.055, k === 14);
  snare(bars[b] + BEAT, 0.3); snare(bars[b] + 3 * BEAT, 0.3);
  for (let k = 0; k < 16; k++) sub(bars[b] + k * E8 / 2, E8 * 0.4, SUB[b % 4] - 12 + (k % 8 === 6 ? 7 : 0), 0.3);
}
// FORMAT (bars 10–11): half-time — kick on 1&3, long subs, open hats
for (let b = 10; b < 12; b++) {
  kick(bars[b], 0.85); kick(bars[b] + 2 * BEAT, 0.85); snare(bars[b] + 2 * BEAT, 0.22);
  sub(bars[b], BAR * 0.9, SUB[b % 4] - 12, 0.5);
  for (let k = 0; k < 8; k++) hat(bars[b] + k * E8 + E8 / 2, 0.07, k % 2 === 1);
}
// LOCKUP (bars 12–13): riser in, impact + chord stack, beat keeps pushing
riser(T.lockup - BAR * 0.5, BAR * 0.5, 0.22);
impact(T.lockup + BAR, 0.8); chord(T.lockup + BAR, BAR * 0.9, [57, 60, 64, 67, 72], 0.05);
for (let b = 12; b < 14; b++) {
  for (let q = 0; q < 4; q++) kick(bars[b] + q * BEAT, 0.85);
  for (let k = 0; k < 16; k++) { const m = ARP[(k + b * 3) % ARP.length]; pulse(bars[b] + k * E8 / 2, E8 * 0.4, m, 0.045, 0.18, (k % 2 ? 0.35 : -0.35), 0.004); }
  sub(bars[b], BAR * 0.95, SUB[b % 4] - 12, 0.5);
  snare(bars[b] + BEAT, 0.25); snare(bars[b] + 3 * BEAT, 0.25);
}
// REWIND (bars 14–15): kick+sub run until the tape cuts, then a low rumble tail
for (let b = 14; b < 16; b++) {
  for (let q = 0; q < 4; q++) { if (bars[b] + q * BEAT >= T.hold) break; kick(bars[b] + q * BEAT, 0.8); }
  sub(bars[b], Math.min(BAR, Math.max(0, T.hold - bars[b])), SUB[b % 4] - 12, 0.45);
}
impact(T.hold, 0.55);                            // tape-stop hit at the cut
sub(T.hold, DUR - T.hold - 0.4, 33, 0.3);        // low A rumble under the rewind
for (let b = 14; b < 16; b++) for (let k = 0; k < 16; k++) { const t = bars[b] + k * E8 / 2; if (t > T.hold + 0.15 && t < DUR - 0.3) hat(t, 0.02); }

// ---------- print ----------
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / (pk || 1), buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt16LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const f = i > N - SR * 0.4 ? (N - i) / (SR * 0.4) : 1; buf.writeInt16LE(Math.round(Math.tanh(L[i] * g) * f * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] * g) * f * 32767), 46 + i * 4); }
fs.writeFileSync(OUT, buf);
console.log(`score ${DUR}s @ ${BPM} BPM → ${OUT}`);
