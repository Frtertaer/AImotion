// node render.mjs films/demo [--fps 60] [--sub 4] [--from 0] [--dur <FILM.dur>] [--out films/demo/out/silent.mp4]
// Serves the project over 127.0.0.1 (ES modules do not load from file://), calls
// window.seek(t) for every subframe, pipes PNGs into ffmpeg, blends SUB subframes
// per output frame for motion blur.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { resolve, join, extname, dirname, relative, sep } from 'node:path';

const argv = process.argv.slice(2);
const film = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--'))) || 'films/demo';
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const FPS = Number(opt('fps', 60)), SUB = Number(opt('sub', 4)), FROM = Number(opt('from', 0));
const root = resolve('.');
const filmDir = resolve(film);
const out = resolve(opt('out', join(filmDir, 'out', 'silent.mp4')));
mkdirSync(dirname(out), { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };
const server = createServer(async (req, res) => {
  const p = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (p !== root && !p.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }).end(body); }
  catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const query = opt('query', '');                    // e.g. --query fmt=1x1 (formats from one timeline)
const url = `http://127.0.0.1:${server.address().port}/${relative(root, filmDir).split(sep).join('/')}/index.html${query ? '?' + query : ''}`;

const browser = await chromium.launch();
let ff;
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.READY === true && typeof window.seek === 'function', null, { timeout: 15000 })
    .catch(() => { throw new Error(`page not ready: ${errors.join(' | ') || 'window.READY/seek missing'}`); });
  const FILM = await page.evaluate(async () => { await document.fonts.ready; return window.FILM; });
  const DUR = Number(opt('dur', FILM.dur - FROM));
  await page.setViewportSize({ width: FILM.w, height: FILM.h });

  // Average each group of SUB subframes, keep one frame per group.
  const vf = SUB > 1
    ? `tmix=frames=${SUB},select='not(mod(n+1\\,${SUB}))',setpts=N/${FPS}/TB`
    : `setpts=N/${FPS}/TB`;
  // --alpha: keep transparency (PNG-in-MOV) for overlays that ffmpeg composites onto footage later.
  const ALPHA = argv.includes('--alpha');
  const codec = ALPHA
    ? ['-c:v', 'png', '-pix_fmt', 'rgba']
    : ['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
  ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
    '-vf', vf, '-r', String(FPS), ...codec, out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r, j) => { ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg exit ' + c)))); ff.on('error', j); });
  done.catch(() => {});                       // observed below; avoid unhandled rejection while rendering
  ff.stdin.on('error', () => {});             // EPIPE if ffmpeg dies; surfaced through `done`
  // If ffmpeg exits while we wait for backpressure, fail instead of hanging on 'drain'.
  const drained = () => Promise.race([new Promise((r) => ff.stdin.once('drain', r)), done.then(() => { throw new Error('ffmpeg exited early'); })]);

  const total = Math.round(DUR * FPS * SUB);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const b64 = await page.evaluate((t) => { window.seek(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; },
      FROM + i / (FPS * SUB));
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await drained();
    if (i % (FPS * SUB) === 0) process.stdout.write(`  ${(i / (FPS * SUB)).toFixed(0)}s / ${DUR}s\n`);
  }
  ff.stdin.end();
  await done;
  if (errors.length) console.warn('page errors:', errors);
  console.log(`wrote ${relative(root, out)}  ${total / SUB} frames @ ${FPS}fps, sub=${SUB}, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
} finally {
  if (ff && ff.exitCode === null && !ff.stdin.writableEnded) ff.kill();
  await browser.close();
  server.close();
}
