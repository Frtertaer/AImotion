// node tools/pixdiff.mjs films/bit --query fmt=9x16 --pairs 15.99:0,15.84:15.86
// Mean absolute RGB difference (0..255) between frames painted by window.seek, on raw canvas pixels.
// 0 = identical. Use it for loop seams and scene hand-offs.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, relative, sep } from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const film = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--'))) || 'films/demo';
const pairs = opt('pairs', '').split(',').filter(Boolean).map((p) => p.split(':').map(Number));
const root = resolve('.');
const TY = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = createServer(async (req, res) => {
  const p = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (p !== root && !p.startsWith(root + sep)) return res.writeHead(403).end();
  try { res.writeHead(200, { 'content-type': TY[extname(p)] || 'application/octet-stream' }).end(await readFile(p)); }
  catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const q = opt('query', '');
const url = `http://127.0.0.1:${server.address().port}/${relative(root, resolve(film)).split(sep).join('/')}/index.html${q ? '?' + q : ''}`;
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForFunction(() => window.READY === true);
  for (const [a, b] of pairs) {
    const d = await page.evaluate(([a, b]) => {
      const c = document.getElementById('c'), g = c.getContext('2d');
      const px = (t) => { window.seek(t); return g.getImageData(0, 0, c.width, c.height).data; };
      const A = px(a), B = px(b);
      let sum = 0, changed = 0;
      for (let i = 0; i < A.length; i += 4) {
        const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
        sum += d / 3; if (d > 30) changed++;
      }
      return { mean: sum / (A.length / 4), changed };
    }, [a, b]);
    console.log(`${a}s vs ${b}s: mean |diff| = ${d.mean.toFixed(3)}, changed px = ${d.changed}`);
  }
} finally { await browser.close(); server.close(); }
