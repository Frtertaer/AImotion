// Engineered monoline Cyrillic alphabet — full set for the canal stroke-type system.
// Grid: cap height 140, baseline y=0, stroke 7, round caps/joins.
// Every letter is one <path> so it self-draws via strokeDashoffset.
// Usage: node tools/anc-glyphs-full.mjs 'WORD' [classPrefix] [stroke] [id]
const SW = 7, CAP = 140, TRACK = 16;

const G = {
  'А': { w: 62, d: `M6 0 L31 -${CAP} L56 0 M14 -${Math.round(CAP * .32)} L48 -${Math.round(CAP * .32)}` },
  'Б': { w: 58, d: `M7 0 L7 -${CAP} L46 -${CAP} M7 -64 C22 -64 36 -52 36 -32 C36 -12 26 0 7 0` },
  'В': { w: 54, d: `M7 0 L7 -${CAP} M7 -${CAP} L30 -${CAP} C46 -${CAP} 50 -${CAP - 12} 50 -${CAP - 20} C50 -${CAP - 38} 46 -${CAP - 48} 30 -${CAP - 48} L7 -${CAP - 48} M7 -64 L32 -64 C48 -64 52 -52 52 -32 C52 -12 48 0 32 0 L7 0` },
  'Г': { w: 52, d: `M7 0 L7 -${CAP} L52 -${CAP}` },
  'Д': { w: 66, d: `M16 0 L28 -${CAP} L38 -${CAP} L50 0 M6 0 L6 -30 L60 -30 L60 0` },
  'Е': { w: 52, d: `M${52 - SW} -${CAP} L7 -${CAP} L7 0 L${52 - SW} 0 M7 -${Math.round(CAP * .5)} L${52 - SW - 8} -${Math.round(CAP * .5)}` },
  'Ё': { w: 52, d: `M${52 - SW} -${CAP} L7 -${CAP} L7 0 L${52 - SW} 0 M7 -${Math.round(CAP * .5)} L${52 - SW - 8} -${Math.round(CAP * .5)} M20 -${CAP - 16} L22 -${CAP - 16} M34 -${CAP - 16} L36 -${CAP - 16}` },
  'Ж': { w: 62, d: `M31 0 L31 -${CAP} M7 0 C20 -35 26 -52 31 -70 C36 -52 42 -35 55 0 M7 -${CAP} C20 -105 26 -88 31 -70 C36 -88 42 -105 55 -${CAP}` },
  'З': { w: 64, d: `M12 -110 C18 -132 26 -140 34 -140 C54 -140 58 -112 58 -94 C58 -78 48 -70 32 -68 C48 -62 58 -52 58 -34 C58 -10 50 0 30 0 C22 0 14 -8 10 -24` },
  'И': { w: 56, d: `M7 0 L7 -${CAP} M7 0 L${56 - SW} -${CAP} M${56 - SW} 0 L${56 - SW} -${CAP}` },
  'Й': { w: 56, d: `M7 0 L7 -${CAP} M7 0 L${56 - SW} -${CAP} M${56 - SW} 0 L${56 - SW} -${CAP} M18 -${CAP - 16} C22 -${CAP - 6} 34 -${CAP - 6} 38 -${CAP - 16}` },
  'К': { w: 52, d: `M7 0 L7 -${CAP} M${52 - SW} -${CAP} L14 -${Math.round(CAP * .5)} L${52 - SW - 2} 0` },
  'Л': { w: 56, d: `M8 0 C8 -50 14 -100 30 -${CAP} L${56 - SW} -${CAP} L${56 - SW} 0` },
  'М': { w: 62, d: `M7 0 L7 -${CAP} L31 0 L${62 - SW} -${CAP} L${62 - SW} 0` },
  'Н': { w: 56, d: `M7 0 L7 -${CAP} M${56 - SW} 0 L${56 - SW} -${CAP} M7 -64 L${56 - SW} -64` },
  'О': { w: 62, d: `M31 -${CAP / 2} m-26 0 a26 ${CAP / 2} 0 1 0 52 0 a26 ${CAP / 2} 0 1 0 -52 0` },
  'П': { w: 62, d: `M7 0 L7 -${CAP} L${62 - SW} -${CAP} L${62 - SW} 0` },
  'Р': { w: 54, d: `M7 0 L7 -${CAP} M7 -${CAP} L30 -${CAP} C46 -${CAP} 50 -${CAP - 12} 50 -${CAP - 20} C50 -${CAP - 40} 46 -${CAP - 52} 30 -${CAP - 52} L7 -${CAP - 52}` },
  'С': { w: 60, d: `M50 -${CAP - 26} C46 -${CAP - 8} 38 -${CAP} 30 -${CAP} C10 -${CAP} 6 -${CAP - 30} 6 -${CAP / 2} C6 -${Math.round(CAP * .15)} 10 0 30 0 C38 0 46 -8 50 -26` },
  'Т': { w: 56, d: `M4 -${CAP} L${56 - SW} -${CAP} M28 -${CAP} L28 0` },
  'У': { w: 56, d: `M7 -${CAP} L31 -${CAP - 76} M${56 - SW} -${CAP} L31 -${CAP - 76} C30 -${CAP - 96} 26 -10 8 ${Math.round(CAP * .18)}` },
  'Ф': { w: 62, d: `M31 0 L31 -${CAP} M31 -100 C14 -100 6 -86 6 -70 C6 -54 14 -40 31 -40 C48 -40 56 -54 56 -70 C56 -86 48 -100 31 -100` },
  'Х': { w: 62, d: `M8 0 L54 -${CAP} M8 -${CAP} L54 0` },
  'Ц': { w: 62, d: `M7 0 L7 -${CAP} M31 0 L31 -${CAP} M55 0 L55 -${CAP} M7 0 L55 0 L55 24` },
  'Ч': { w: 62, d: `M8 -${CAP} C8 -100 14 -86 31 -84 L55 -84 M55 -${CAP} L55 0` },
  'Ш': { w: 62, d: `M7 0 L7 -${CAP} M31 0 L31 -${CAP} M55 0 L55 -${CAP} M7 0 L55 0` },
  'Щ': { w: 66, d: `M7 0 L7 -${CAP} M31 0 L31 -${CAP} M55 0 L55 -${CAP} M7 0 L55 0 L55 24` },
  'Ъ': { w: 64, d: `M7 -${CAP} L30 -${CAP} L30 0 M30 -64 C46 -64 58 -52 58 -32 C58 -12 46 0 30 0` },
  'Ы': { w: 64, d: `M7 0 L7 -${CAP} M7 -64 C22 -64 34 -52 34 -32 C34 -12 22 0 7 0 M58 0 L58 -${CAP}` },
  'Ь': { w: 40, d: `M7 0 L7 -${CAP} M7 -64 C22 -64 34 -52 34 -32 C34 -12 22 0 7 0` },
  'Э': { w: 64, d: `M12 -114 C16 -132 24 -140 32 -140 C52 -140 58 -110 58 -70 C58 -30 52 0 32 0 C24 0 16 -8 12 -26 M18 -70 L54 -70` },
  'Ю': { w: 76, d: `M7 0 L7 -${CAP} M7 -70 L22 -70 M48 -70 m-22 0 a22 70 0 1 0 44 0 a22 70 0 1 0 -44 0` },
  'Я': { w: 56, d: `M${56 - SW} 0 L${56 - SW} -${CAP} M${56 - SW} -${CAP} L26 -${CAP} C10 -${CAP} 6 -${CAP - 12} 6 -${CAP - 20} C6 -${CAP - 40} 10 -${CAP - 52} 26 -${CAP - 52} L${56 - SW} -${CAP - 52} M26 -${CAP - 52} L6 0` },
};

function plen(d) {
  const toks = d.match(/[MLCQAZmlcqaz]|-?[\d.]+/g) || [];
  let x = 0, y = 0, sx = 0, sy = 0, i = 0, len = 0;
  const num = () => parseFloat(toks[i++]);
  const seg = (x0, y0, x1, y1) => { len += Math.hypot(x1 - x0, y1 - y0); };
  while (i < toks.length) {
    const c = toks[i++];
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
        const by = u * u * y + 2 * u * t * y1 + 2 * u * t * t * y2 + t * t * t * y3;
        seg(px, py, bx, by); px = bx; py = by;
      }
      x = x2; y = y2;
    } else if (c === 'A' || c === 'a') {
      const rel = c === 'a';
      const rx = num(), ry = num(); num(); num(); num();
      let nx = num(), ny = num(); if (rel) { nx += x; ny += y; }
      len += Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry))) * .9;
      x = nx; y = ny;
    } else if (c === 'Z' || c === 'z') { seg(x, y, sx, sy); x = sx; y = sy; }
  }
  return Math.ceil(len);
}

export function wordPaths(word, cls, stroke = '#0c0a0d') {
  let cx = 0; const parts = [];
  for (const ch of word) {
    if (ch === ' ' || ch === '·') { cx += 44; continue; }
    const g = G[ch];
    if (!g) { console.error('missing glyph:', ch); cx += 40; continue; }
    const len = plen(g.d);
    parts.push(`<path class="${cls}" data-ch="${ch}" d="${g.d}" transform="translate(${cx} 0)" fill="none" stroke="${stroke}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${len}" stroke-dashoffset="${len}"/>`);
    cx += g.w + TRACK;
  }
  return { svg: parts.join('\n'), width: cx - TRACK };
}

// CLI: emit a positioned svg block
if (process.argv[2]) {
  const [word, cls = 'glyphstroke', stroke = '#0c0a0d'] = [process.argv[2], process.argv[3], process.argv[4]];
  const { svg, width } = wordPaths(word, cls, stroke);
  console.log(`<!-- ${word} width=${width} -->\n${svg}`);
}
