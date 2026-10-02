import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
const root = '.'
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf' };
const srv = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const p = join(root, url === '/' ? 'index.html' : url);
  try { const d = await readFile(p); res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' }); res.end(d); }
  catch { console.log('404', url); res.writeHead(404); res.end(); }
}).listen(8123);
const b = await chromium.launch({ args: ['--no-sandbox'] });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('console', m => console.log('PG:', m.text().slice(0, 200)));
pg.on('pageerror', e => console.log('ERR:', e.message.slice(0, 300)));
await pg.goto('http://127.0.0.1:8123/films/vagabond/index.html');
await pg.waitForFunction('window.READY === true', null, { timeout: 40000 }).catch(() => console.log('READY timeout'));
console.log(await pg.evaluate(() => JSON.stringify({ art: Object.keys(window.__ART || {}), dur: window.FILM && window.FILM.dur })));
await pg.evaluate(() => window.seek(720)); await pg.locator('#c').screenshot({ path: '/tmp/dbg_seek720.png' });
await pg.evaluate(() => window.seek(1036)); await pg.locator('#c').screenshot({ path: '/tmp/dbg_seek1036.png' });
await b.close(); srv.close(); process.exit(0);
// (appended) seek + canvas dump test
