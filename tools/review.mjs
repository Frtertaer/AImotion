// node tools/review.mjs films/demo/out/final.mp4 [--at 4.2]
// Writes the frames Claude should LOOK at before calling a render done:
//   contact.png  2 frames/sec, 6 across          (overall pacing, dead beats)
//   strip.png    12 consecutive frames around --at (pops, overlaps in fast moves)
//   phone.png    1 frame/sec at 360px wide        (readability on a phone)
//   poster.png   frame at 40% of the duration
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const argv = process.argv.slice(2);
const src = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
if (!src) { console.error('usage: node tools/review.mjs <video.mp4> [--at seconds]'); process.exit(2); }
const i = argv.indexOf('--at');
const dir = dirname(src);
const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).toString());
const at = i >= 0 ? Number(argv[i + 1]) : dur / 2;
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });

const rows = Math.max(1, Math.ceil((dur * 2) / 6));
ff('-i', src, '-vf', `fps=2,scale=270:-1,tile=6x${rows}`, '-frames:v', '1', join(dir, 'contact.png'));
ff('-ss', String(Math.max(0, at - 0.1)), '-i', src, '-vf', 'scale=240:-1,tile=12x1', '-frames:v', '1', join(dir, 'strip.png'));
ff('-i', src, '-vf', `fps=1,scale=360:-1,tile=${Math.min(6, Math.ceil(dur))}x${Math.ceil(dur / 6)}`, '-frames:v', '1', join(dir, 'phone.png'));
ff('-ss', String(dur * 0.4), '-i', src, '-frames:v', '1', join(dir, 'poster.png'));
console.log(`review sheets in ${dir}: contact.png strip.png (at ${at}s) phone.png poster.png`);
