// Measure every card label against its card's right edge, in the real browser font.
import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
const res = await p.evaluate(() => {
  const g = document.createElement('canvas').getContext('2d');
  const HEAD = (px) => `900 ${px}px "Arial Black", "Segoe UI Black", Arial, sans-serif`;
  const LABEL = (px, w = 700) => `${w} ${px}px "Segoe UI", Arial, sans-serif`;
  const W = 792, rows = [
    ['ЗВУК', HEAD(52), 40], ['НОРМАЛЬНЫЙ', HEAD(52), 200], ['ЗА ЧТО ЛЮБИТ СВОИ:', HEAD(44), 40],
    ['УДОБНО ЛЕЖАТ В УХЕ', HEAD(44), 130], ['ВАКУУМКИ', HEAD(66), 330], ['поэтому без «прошек»', LABEL(36), 332],
    ['МОЁ УХО', HEAD(52), 330], ['ВСЁ ВЫВАЛИВАЕТСЯ', HEAD(34), 330], ['ДЫРКА — ШИРОКАЯ', HEAD(34), 330],
    ['✓ РАКОВИНА ДЕРЖИТ', HEAD(34), 330], ['ПЕРЕПРОБОВАЛ', HEAD(46), 40], ['АМБУШЮРЫ', HEAD(46), 40],
  ];
  return rows.map(([s, f, x]) => { g.font = f; const w = g.measureText(s).width; return `${(x + w <= W - 30) ? 'ok  ' : 'OVER'} ${s}: ends at ${Math.round(x + w)} / ${W - 30}`; });
});
console.log(res.join('\n')); await b.close();

