// node audio/sfx.mjs films/demo/cues.json films/demo/out/sfx.wav [--dur 6]
// cues.json: [{ "t": 0.5, "type": "click", "gain": 1 }, ...]
// Types: click, pop, thump, whoosh, tick, riser. Deterministic (seeded noise).
import { readFileSync, writeFileSync } from 'node:fs';

const [cueFile, outFile] = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && all[i - 1].startsWith('--')));
if (!cueFile || !outFile) { console.error('usage: node audio/sfx.mjs <cues.json> <out.wav> [--dur seconds]'); process.exit(2); }
const SR = 48000;
const cues = JSON.parse(readFileSync(cueFile, 'utf8'));
const di = process.argv.indexOf('--dur');
const dur = di > 0 ? Number(process.argv[di + 1]) : Math.max(0, ...cues.map((c) => c.t)) + 2;

let seed = 1234567;
const noise = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2147483648) - 1;
const TAU = Math.PI * 2;

// [length in seconds, sample(t) -> [-1, 1]]
const VOICES = {
  click:  [0.04, (t) => Math.sin(TAU * 2200 * t) * Math.exp(-t * 120) * 0.5],
  tick:   [0.02, (t) => noise() * Math.exp(-t * 400) * 0.35],
  pop:    [0.14, (t) => Math.sin(TAU * (500 + 1100 * t) * t) * Math.exp(-t * 32) * 0.45],
  thump:  [0.5,  (t) => Math.sin(TAU * (95 - 55 * t) * t) * Math.exp(-t * 8) * 0.9],
  whoosh: [0.4,  (t) => noise() * Math.sin(Math.PI * Math.min(1, t / 0.4)) * 0.22],
  riser:  [1.0,  (t) => (Math.sin(TAU * (200 + 700 * t * t) * t) * 0.2 + noise() * 0.08) * t],
  // 8-bit voices: square waves, like the pixel world they score
  blip:   [0.14, (t) => sq(t, 520 + 2600 * t) * Math.exp(-t * 14) * 0.22],
  land:   [0.12, (t) => (noise() * 0.5 + sq(t, 110 - 300 * t) * 0.5) * Math.exp(-t * 35) * 0.45],
  zap:    [0.25, (t) => sq(t, [880, 220, 1320, 330, 990][Math.floor(t * 20) % 5]) * (1 - t / 0.25) * 0.2],
  ding:   [0.6,  (t) => (sq(t, 1568) * 0.12 + Math.sin(TAU * 3136 * t) * 0.1) * Math.exp(-t * 6)],
};
function sq(t, f) { return Math.sin(TAU * f * t) >= 0 ? 1 : -1; }

const buf = new Float32Array(Math.ceil(dur * SR));
for (const c of cues) {
  const v = VOICES[c.type];
  if (!v) throw new Error(`unknown cue type "${c.type}" at t=${c.t}`);
  const [len, fn] = v, g = c.gain ?? 1, start = Math.round(c.t * SR);
  for (let i = 0; i < len * SR && start + i < buf.length; i++) buf[start + i] += fn(i / SR) * g;
}

// 16-bit mono PCM WAV
const n = buf.length, b = Buffer.alloc(44 + n * 2);
b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8);
b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
b.write('data', 36); b.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767), 44 + i * 2);
writeFileSync(outFile, b);
console.log(`wrote ${outFile}: ${cues.length} cues, ${dur.toFixed(2)}s`);
