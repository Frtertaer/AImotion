// node tools/check-seek.mjs films/demo [--samples 12]
// Proves the render contract on raw pixels (no encoder in the way):
//   1. a frame painted after seeking through every earlier frame
//   2. the same frame painted in a fresh page with one seek
// must hash the same. Any carried state (timers, accumulators, Math.random) fails it.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, extname, relative, sep } from 'node:path';

const argv = process.argv.slice(2);
const film = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--'))) || 'films/demo';
const si = argv.indexOf('--samples');
const N = si >= 0 ? Number(argv[si + 1]) : 12;
const root = resolve('.');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const p = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (p !== root && !p.startsWith(root + sep)) return res.writeHead(403).end();
  try { res.writeHead(200, { 'content-type': T[extname(p)] || 'application/octet-stream' }).end(await readFile(p)); }
  catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const qi = argv.indexOf('--query');
const url = `http://127.0.0.1:${server.address().port}/${relative(root, resolve(film)).split(sep).join('/')}/index.html` +
  (qi >= 0 ? '?' + argv[qi + 1] : '');

const browser = await chromium.launch();
const open = async () => {
  const p = await browser.newPage();
  await p.goto(url);
  await p.waitForFunction(() => window.READY === true);
  await p.evaluate(() => document.fonts.ready);
  return p;
};
const shot = (p, t) => p.evaluate((t) => { window.seek(t); return document.getElementById('c').toDataURL('image/png'); }, t)
  .then((u) => createHash('md5').update(u).digest('hex'));

try {
  const seqPage = await open();
  const dur = await seqPage.evaluate(() => window.FILM.dur);
  const fps = 30, total = Math.floor(dur * fps);
  const want = new Set(Array.from({ length: N }, (_, k) => Math.floor(((k + 0.5) * total) / N)));
  const seq = new Map();
  for (let i = 0; i < total; i++) { const h = await shot(seqPage, i / fps); if (want.has(i)) seq.set(i, h); }

  let bad = 0;
  for (const i of want) {
    const p = await open();
    const h = await shot(p, i / fps);
    await p.close();
    if (h !== seq.get(i)) { bad++; console.log(`MISMATCH frame ${i} (t=${(i / fps).toFixed(3)}s)`); }
  }
  console.log(`seek check: ${want.size - bad}/${want.size} sampled frames identical (sequential vs isolated)`);
  process.exitCode = bad ? 1 : 0;
} finally {
  await browser.close();
  server.close();
}
