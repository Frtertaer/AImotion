// Engineered monoline Cyrillic "ПРОПУСКАЕТ" for card-06 verdict.
// Grid: cap height 140, baseline y=0, stroke 7, round caps/joins.
// Every letter is one <path> so it can self-draw via strokeDashoffset.
// Letters derive their geometry from the canal chamfer (45° cuts) —
// the same stroke logic that built the canal glyph.

const SW = 7;
const CAP = 140;
const TRACK = 16;

// each glyph: { w, d } — advance width and path data (y up = negative)
const G = {
  'П': { w: 62, d: `M7 0 L7 -${CAP} L${62 - SW} -${CAP} L${62 - SW} 0` },
  'Р': { w: 54, d: `M7 0 L7 -${CAP} M7 -${CAP} L30 -${CAP} C46 -${CAP} 50 -${CAP - 12} 50 -${CAP - 20} C50 -${CAP - 40} 46 -${CAP - 52} 30 -${CAP - 52} L7 -${CAP - 52}` },
  'О': { w: 62, d: `M31 -${CAP / 2} m-26 0 a26 ${CAP / 2} 0 1 0 52 0 a26 ${CAP / 2} 0 1 0 -52 0` },
  'У': { w: 56, d: `M7 -${CAP} L31 -${CAP - 76} M${56 - SW} -${CAP} L31 -${CAP - 76} C30 -${CAP - 96} 26 -10 8 ${Math.round(CAP * 0.18)}` },
  'С': { w: 60, d: `M50 -${CAP - 26} C46 -${CAP - 8} 38 -${CAP} 30 -${CAP} C10 -${CAP} 6 -${CAP - 30} 6 -${CAP / 2} C6 -${Math.round(CAP * 0.15)} 10 0 30 0 C38 0 46 -8 50 -26` },
  'К': { w: 52, d: `M7 0 L7 -${CAP} M${52 - SW} -${CAP} L14 -${Math.round(CAP * 0.5)} L${52 - SW - 2} 0` },
  'А': { w: 62, d: `M6 0 L31 -${CAP} L56 0 M14 -${Math.round(CAP * 0.32)} L48 -${Math.round(CAP * 0.32)}` },
  'Е': { w: 52, d: `M${52 - SW} -${CAP} L7 -${CAP} L7 0 L${52 - SW} 0 M7 -${Math.round(CAP * 0.5)} L${52 - SW - 8} -${Math.round(CAP * 0.5)}` },
  'Т': { w: 56, d: `M4 -${CAP} L${56 - SW} -${CAP} M28 -${CAP} L28 0` },
};

const WORD = 'ПРОПУСКАЕТ';

// path length: L exact, C/Q sampled, A approx (elliptical arcs near-closed here)
function plen(d) {
  const toks = d.match(/[MLCQAZmlcqaz]|-?[\d.]+/g) || [];
  let x = 0, y = 0, sx = 0, sy = 0, i = 0, len = 0;
  const cmd = () => toks[i++];
  const num = () => parseFloat(toks[i++]);
  const seg = (x0, y0, x1, y1) => { len += Math.hypot(x1 - x0, y1 - y0); };
  while (i < toks.length) {
    const c = cmd();
    if (c === 'M' || c === 'L') { const nx = num(), ny = num(); if (c === 'L') seg(x, y, nx, ny); x = nx; y = ny; if (c === 'M') { sx = x; sy = y; } }
    else if (c === 'm' || c === 'l') { const nx = x + num(), ny = y + num(); if (c === 'l') seg(x, y, nx, ny); x = nx; y = ny; if (c === 'm') { sx = x; sy = y; } }
    else if (c === 'C') {
      const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
      let px = x, py = y;
      for (let s = 1; s <= 48; s++) {
        const t = s / 48, u = 1 - t;
        const bx = u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
        const by = u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
        seg(px, py, bx, by); px = bx; py = by;
      }
      x = x3; y = y3;
    } else if (c === 'Q') {
      const x1 = num(), y1 = num(), x2 = num(), y2 = num();
      let px = x, py = y;
      for (let s = 1; s <= 48; s++) {
        const t = s / 48, u = 1 - t;
        const bx = u * u * x + 2 * u * t * x1 + t * t * x2;
        const by = u * u * y + 2 * u * t * y1 + t * t * y2;
        seg(px, py, bx, by); px = bx; py = by;
      }
      x = x2; y = y2;
    } else if (c === 'A' || c === 'a') {
      const rel = c === 'a';
      const rx = num(), ry = num(); num(); num(); num();
      let nx = num(), ny = num(); if (rel) { nx += x; ny += y; }
      len += Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry))) * 0.9;
      x = nx; y = ny;
    } else if (c === 'Z' || c === 'z') { seg(x, y, sx, sy); x = sx; y = sy; }
  }
  return Math.ceil(len);
}

let cx = 0;
const parts = [];
for (const ch of WORD) {
  const g = G[ch];
  const len = plen(g.d);
  parts.push(
    `    <path class="c06glyph c06drawtext" data-ch="${ch}" d="${g.d}" transform="translate(${cx} 0)" fill="none" stroke="#1c1a18" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${len}" stroke-dashoffset="${len}"/>`
  );
  console.log(`${ch}: len=${len}`);
  cx += g.w + TRACK;
}
const total = cx - TRACK;
console.log(`total width ${total}`);
console.log(`<g id="c06-glyphs" transform="translate(${Math.round((1080 - total) / 2)} 0)">`);
console.log(parts.join('\n'));
console.log('</g>');
