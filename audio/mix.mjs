// node audio/mix.mjs <picture.mp4> <out.mp4> <audio1> [audio2 ...] [--lufs -14] [--gains 1,0.5] [--limit 0.25|none]
// Mixes the audio inputs (wav, or any file with an audio stream, e.g. the source clip), normalises
// loudness in two passes (measure, then linear loudnorm) and muxes onto the picture without
// re-encoding video.
//   --gains  per-input linear gain before the mix (SFX under dialogue: e.g. 1,0.35)
//   --limit  peak limiter before loudnorm. Default 0.25 suits sparse percussive SFX;
//            use `none` for dialogue so the voice keeps its dynamics.
import { execFileSync, spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const I = Number(opt('lufs', -14));
const limit = opt('limit', '0.25');
const files = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const [pic, out, ...audio] = files;
if (!pic || !out || !audio.length) {
  console.error('usage: node audio/mix.mjs <picture.mp4> <out.mp4> <a> [b ...] [--lufs -14] [--gains 1,0.5] [--limit 0.25|none]');
  process.exit(2);
}
const gains = opt('gains', '').split(',').filter(Boolean).map(Number);
if (gains.length && gains.length !== audio.length) throw new Error(`--gains has ${gains.length} values for ${audio.length} inputs`);

const inputs = audio.flatMap((a) => ['-i', a]);
// Filter graph for audio inputs starting at ffmpeg input index `base`.
const graph = (base) => {
  const pre = audio.map((_, k) => `[${base + k}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${gains[k] ?? 1}[i${k}]`).join(';');
  const mix = audio.length > 1 ? `${audio.map((_, k) => `[i${k}]`).join('')}amix=inputs=${audio.length}:normalize=0:duration=longest` : '[i0]anull';
  const lim = limit === 'none' ? '' : `,alimiter=limit=${limit}:level=false:attack=1:release=50`;
  return `${pre};${mix}${lim}`;
};

// Pass 1: measure (ffmpeg prints the JSON on stderr).
const m = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...inputs, '-filter_complex',
  `${graph(0)},loudnorm=I=${I}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
const json = (m.stderr.match(/\{[^{}]*"input_i"[^{}]*\}/) || [])[0];
if (!json) throw new Error('loudness measurement failed:\n' + m.stderr.slice(-800));
const s = JSON.parse(json);

// Pass 2: apply measured values, mux (input 0 is the picture, audio starts at 1).
const ln = `loudnorm=I=${I}:TP=-1.5:LRA=11:measured_I=${s.input_i}:measured_TP=${s.input_tp}` +
  `:measured_LRA=${s.input_lra}:measured_thresh=${s.input_thresh}:offset=${s.target_offset}:linear=true,aresample=48000,aformat=channel_layouts=stereo`;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', pic, ...inputs, '-filter_complex', `${graph(1)},${ln}[a]`,
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log(`wrote ${out} (mix measured ${s.input_i} LUFS -> target ${I})`);
