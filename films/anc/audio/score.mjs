// Deterministic 29 s, 48 kHz stereo score. Run with: node films/anc/audio/score.mjs
// Writes films/anc/out/score.wav relative to the current working directory.
import fs from 'node:fs';
import path from 'node:path';

const SR = 48000;
const DURATION = 29;
const FRAMES = SR * DURATION;
const TAU = Math.PI * 2;
const left = new Float32Array(FRAMES);
const right = new Float32Array(FRAMES);
let seed = 0x51c0ffee;

function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
}
function smooth(a, b, x) {
  const v = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return v * v * (3 - 2 * v);
}
function addAt(time, value, pan = 0) {
  const i = Math.floor(time * SR);
  if (i < 0 || i >= FRAMES) return;
  const l = Math.sqrt((1 - pan) * 0.5);
  const r = Math.sqrt((1 + pan) * 0.5);
  left[i] += value * l;
  right[i] += value * r;
}

// Deterministic chat-pop cues, distributed irregularly in the stream sections.
const pops = [
  [0.73, .13], [1.84, .10], [2.16, .15], [3.62, .12], [4.35, .18],
  [5.91, .11], [6.28, .16], [7.54, .12], [8.73, .13], [9.47, .10],
  [11.16, .15], [12.79, .10], [21.96, .12], [22.31, .15], [22.84, .11],
  [23.62, .16], [24.12, .11], [24.79, .14], [25.36, .12], [26.07, .17],
  [26.48, .12], [27.14, .16], [27.72, .11], [28.35, .14], [28.72, .12]
];

// Filtered noise bed: one-pole low pass, modulated bursts, with deterministic noise.
let lpL = 0, lpR = 0;
for (let i = 0; i < FRAMES; i++) {
  const t = i / SR;
  const nL = random() * 2 - 1;
  const nR = random() * 2 - 1;

  let bed = 0;
  if (t < 8) {
    // Eighth-note pulses at 120 BPM.
    const eighth = (t * 4) % 1;
    const burst = Math.exp(-eighth * 8);
    bed = .15 * burst * smooth(0, .02, t) * (1 - smooth(7.9, 8, t));
  } else if (t >= 8 && t < 14) {
    const x = (t - 8) / 6;
    bed = .13 * smooth(8, 8.35, t) * (1 - smooth(13.7, 14, t));
    // Hiss rises in brightness as the counter-sweep falls.
    const cutoff = .008 + .16 * x;
    lpL += cutoff * (nL - lpL);
    lpR += cutoff * (nR - lpR);
    const sineHz = 880 - 760 * x;
    const inverse = Math.sin(TAU * sineHz * t) * .075 * (1 - smooth(13.65, 14, t));
    left[i] += inverse;
    right[i] += inverse;
  } else if (t >= 21.8 && t < 29) {
    const x = (t - 21.8) * 8; // double-density eighth-note bursts
    const pulse = Math.exp(-((x % 1) * 8));
    bed = .2 * pulse * smooth(21.8, 22.15, t) * (1 - smooth(28.88, 28.9, t));
  }

  if (!(t >= 8 && t < 14)) {
    // Bright, soft-edged filtered hiss.
    const cutoff = t >= 21.8 ? .12 : .045;
    lpL += cutoff * (nL - lpL);
    lpR += cutoff * (nR - lpR);
  }
  left[i] += lpL * bed;
  right[i] += lpR * bed;

  if (t >= 14 && t < 21.8) {
    const hum = Math.sin(TAU * 60 * t) * Math.pow(10, -30 / 20);
    left[i] += hum;
    right[i] += hum;
  }
}

// Sparse sine pings on beats 32, 37, and 41 (120 BPM).
for (const beat of [32, 37, 41]) {
  const start = beat * .5;
  const length = .42;
  for (let j = 0; j < Math.floor(length * SR); j++) {
    const t = start + j / SR;
    if (t >= FRAMES / SR) break;
    const env = Math.exp(-j / (SR * .13));
    const ping = .22 * Math.sin(TAU * 880 * j / SR) * env;
    addAt(t, ping, beat % 2 ? .22 : -.22);
  }
}

// Short, bright chat pops.
for (const [start, gain] of pops) {
  const length = .055;
  for (let j = 0; j < Math.floor(length * SR); j++) {
    const env = Math.exp(-j / (SR * .009));
    const noise = (random() * 2 - 1) * .58;
    const tone = Math.sin(TAU * (680 + (j / SR) * 900) * j / SR) * .42;
    addAt(start + j / SR, (noise + tone) * gain * env, Math.sin(start * 3) * .55);
  }
}

// Hard end-silence, with a short fade into the cut.
for (let i = Math.floor(28.88 * SR); i < FRAMES; i++) {
  const fade = 1 - smooth(28.88 * SR, 28.9 * SR, i);
  left[i] *= fade;
  right[i] *= fade;
}
for (let i = Math.floor(28.9 * SR); i < FRAMES; i++) {
  left[i] = 0;
  right[i] = 0;
}

// PCM16 little-endian WAV.
const dataBytes = FRAMES * 2 * 2;
const wav = Buffer.alloc(44 + dataBytes);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + dataBytes, 4);
wav.write('WAVE', 8);
wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(dataBytes, 40);

for (let i = 0, offset = 44; i < FRAMES; i++) {
  for (const sample of [left[i], right[i]]) {
    const v = Math.max(-1, Math.min(1, sample));
    wav.writeInt16LE(Math.round(v * 32767), offset);
    offset += 2;
  }
}

const output = path.join(process.cwd(), 'films/anc/out/score.wav');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, wav);
console.log(`Wrote ${DURATION}s stereo WAV: ${output}`);
