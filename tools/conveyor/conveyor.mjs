#!/usr/bin/env node
// node tools/conveyor/conveyor.mjs <packdir> [--max-rounds 8] [--fps 30] [--no-render]
// The conveyor: render -> extract frames -> Opus judge vs Motion Awards 2025 winners
// -> Opus fixer (find/replace patches) -> hyperframes check (rollback on lint fail)
// -> repeat until OVERALL_VERDICT: surpasses or rounds exhausted.
// Writes judge/fix transcripts + patch log into <packdir>/conveyor/.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const packdir = resolve(args[0]);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const MAX_ROUNDS = Number(opt('max-rounds', 8));
const FPS = opt('fps', '30');
const NO_RENDER = args.includes('--no-render');
const REPO = resolve(join(packdir, '../..'));
const HF = 'hyperframes@0.8.93';
const JUDGE_TIMES = (process.env.JUDGE_TIMES || '2,8.5,13.8,17.5,22,23.7,27.5').split(',');
const conv = join(packdir, 'conveyor');
mkdirSync(conv, { recursive: true });
mkdirSync(join(conv, 'frames'), { recursive: true });

const opus = (promptFile, imgs = [], maxtok = '16000') => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return execFileSync('node', [join(REPO, 'tools/opus.mjs'), promptFile,
        ...(imgs.length ? ['--img', ...imgs] : []), '--outdir', conv, '--maxtok', maxtok],
        { encoding: 'utf8', env: process.env, maxBuffer: 64 << 20 });
    } catch (e) {
      console.log(`opus attempt ${attempt} failed${attempt === 3 ? ' — giving up' : ', retrying in ' + attempt * 30 + 's'}`);
      if (attempt === 3) return '';
      execFileSync('sleep', [String(attempt * 30)]);
    }
  }
  return '';
};
const run = (cmd, a, opts = {}) => {
  try { return { ok: true, out: execFileSync(cmd, a, { encoding: 'utf8', cwd: packdir, ...opts }) }; }
  catch (e) { return { ok: false, out: (e.stdout || '') + (e.stderr || '') }; }
};

const INDEX = join(packdir, 'public/index.html');
const OUT = join(packdir, 'output.mp4');
const AUTHOR_EVERY = Number(opt('author-every', 3)); // re-author the worst card every N rounds
const history = [];
let round = 0, verdict = 'below';
// best-seen retention: the loop is stochastic — keep the highest-scoring
// judged index and restore it at the end if later rounds regressed.
let best = { key: -1, f: -1, round: 0, file: null };

// Extract one card's card-host block from index.html and splice a rewritten one back.
const cardBlock = (src, id) => {
  const re = new RegExp(`<div class="card-host clip" id="host-${id}"[\\s\\S]*?(?=<div class="card-host clip" id="host-card-|<!--STAGE-->|<svg id="c06-|\\s*<script|</body>)`, 'm');
  const m = src.match(re);
  return m ? { re, block: m[0] } : null;
};
const WORST_CARD = (jout) => { const m = jout.match(/REWRITE_CARD:\s*(card-\d+)/); return m ? m[1] : null; };
// stage-level machinery must survive every write: any rewrite/patch that drops
// one of these ids is rolled back exactly like a lint failure.
const STAGE_IDS = ['c06-draw','c06-glyphs','c06-olet','c06-link','c06-linkpath','c06-piptrail','c06-pulse','c06-pulse2','c06-wordflow','c06-return','c02-word','c04-word','c05-word','grandO-ring'];
const stageIdsIntact = (html) => STAGE_IDS.filter(id => !(html.match(new RegExp(`id="${id}"`, 'g')) || []).length === 1);
const CARDS = ['card-01', 'card-02', 'card-03', 'card-04', 'card-05', 'card-06'];
const rewritten = new Set();

while (round < MAX_ROUNDS && verdict !== 'surpasses') {
  round++;
  console.log(`\n=== ROUND ${round} ===`);
  if (!NO_RENDER) {
    const r = run('npx', ['-y', HF, 'render', 'public', '-o', 'output.mp4', '--fps', FPS], { timeout: 600000 });
    if (!r.ok) { console.error('render failed', r.out.slice(-800)); break; }
    console.log('rendered');
  }
  // frames for the judge
  const frames = JUDGE_TIMES.map((t) => {
    const f = join(conv, 'frames', `r${round}_${t}.png`);
    run('ffmpeg', ['-y', '-loglevel', 'error', '-ss', t, '-i', OUT, '-frames:v', '1', '-vf', 'scale=720:1280', f]);
    return f;
  });
  // judge
  const brief = readFileSync(join(REPO, 'tools/conveyor/judge_prompt.md'), 'utf8')
    .replace('{BENCH}', existsSync(join(REPO, 'docs/benchmark.md')) ? readFileSync(join(REPO, 'docs/benchmark.md'), 'utf8') : '(benchmark unavailable)')
    .replace('{HISTORY}', history.length ? history.map((h) => `R${h.round}: scores ${h.scores} verdict ${h.verdict}${h.errors ? ' lint-broke:' + h.errors : ''}`).join('\n') : '(first round)');
  const jp = join(conv, `judge_r${round}.md`);
  writeFileSync(jp, brief);
  const jout = opus(jp, frames, '8000');
  writeFileSync(join(conv, `judge_r${round}.out.txt`), jout);
  const sm = jout.match(/SCORES:\s*a=(\d+)\s*b=(\d+)\s*c=(\d+)\s*d=(\d+)\s*e=(\d+)\s*f=(\d+)/);
  const vm = jout.match(/OVERALL_VERDICT:\s*(surpasses|ties|below)/i);
  const scores = sm ? sm.slice(1).join('/') : '?';
  verdict = vm ? vm[1].toLowerCase() : 'below';
  history.push({ round, scores, verdict });
  console.log(`scores ${scores} verdict ${verdict}`);
  // snapshot the judged state when it sets a new high (sum, tiebreak f)
  const ax = sm ? sm.slice(1).map(Number) : null;
  const key = ax ? ax.reduce((a, b) => a + b, 0) : -1;
  const vr = ({ surpasses: 3, ties: 2, below: 1 })[verdict] || 0;
  if (ax && (vr > (best.vr || 0) || (vr === (best.vr || 0) && (key > best.key || (key === best.key && ax[5] > best.f))))) {
    best = { key, f: ax[5], vr, round, file: join(conv, `index_best_r${round}.html`) };
    copyFileSync(INDEX, best.file);
    console.log(`new best state (key ${key}, f=${ax[5]})`);
  }
  if (verdict === 'surpasses') break;

  // author stage: every AUTHOR_EVERY rounds, and when the judge names a card,
  // Opus rewrites that card's whole block (small prompt, no 524s).
  let worst = WORST_CARD(jout);
  // rotation: don't let the author churn the same card on a plateau —
  // once a card was rewritten, spread attention to cards the loop ignores.
  if (worst && rewritten.has(worst) && rewritten.size < CARDS.length) {
    worst = CARDS.find((c) => !rewritten.has(c)) || worst;
  }
  if (worst) {
    const src0 = readFileSync(INDEX, 'utf8');
    const cb = cardBlock(src0, worst);
    if (cb) {
      const ap = join(conv, `author_r${round}.md`);
      let apTxt = readFileSync(join(REPO, 'tools/conveyor/author_prompt.md'), 'utf8');
      if (worst !== 'card-06') {
        // the card-06-specific ownership list would mislead other cards —
        // keep the off-limits warning, drop the ownership inventory
        apTxt = apTxt.replace(/YOUR CARD still owns[\s\S]*?You may restyle anything else freely[^\n]*/m,
          'Nothing in this card shares those ids. You may restyle anything else freely');
      }
      writeFileSync(ap, apTxt
        .replace('{CARD}', worst)
        .replace('{WHY}', (jout.match(/WHY:([\s\S]*?)FIXES:/) || [null, ''])[1])
        .replace('{BLOCK}', cb.block));
      const aout = opus(ap, [], '12000');
      writeFileSync(join(conv, `author_r${round}.out.txt`), aout);
      const nm = aout.match(/```html\s*([\s\S]*?)```/);
      if (nm) {
        copyFileSync(INDEX, join(conv, `index_r${round}.bak.html`));
        writeFileSync(INDEX, src0.replace(cb.re, nm[1].trim()));
        const wsrc = readFileSync(INDEX, 'utf8');
        const missing = stageIdsIntact(wsrc);
        const chk0 = missing.length ? { out: 'stage ids lost: ' + missing.join(',') } : run('npx', ['-y', HF, 'check', 'public'], { timeout: 300000 });
        if (!/Check passed/.test(chk0.out)) {
          copyFileSync(join(conv, `index_r${round}.bak.html`), INDEX);
          history[history.length - 1].errors = 'author rewrite lint broke: ' + chk0.out.slice(-300);
          console.log(`author rewrite of ${worst} lint-broke, rolled back`);
        } else {
          rewritten.add(worst);
          console.log(`author rewrote ${worst}`);
          continue; // author applied — render+rejudge next round
        }
      }
    }
  }

  // fixer: plan from judge + current file -> patches
  const plan = (jout.match(/FIXES:([\s\S]*)$/) || [null, jout])[1];
  const fp = join(conv, `fix_r${round}.md`);
  writeFileSync(fp, readFileSync(join(REPO, 'tools/conveyor/fix_prompt.md'), 'utf8')
    .replace('{PLAN}', plan).replace('{FILE}', readFileSync(INDEX, 'utf8')));
  const fout = opus(fp, [], '16000');
  writeFileSync(join(conv, `fix_r${round}.out.txt`), fout);
  const pm = fout.match(/```json\s*([\s\S]*?)```/) || fout.match(/(\[\s*\{[\s\S]*\}\s*\])/);
  let patches = [];
  try { patches = JSON.parse(pm ? pm[1] : '[]'); } catch { console.log('no valid patch json'); }
  copyFileSync(INDEX, join(conv, `index_r${round}.bak.html`));
  let src = readFileSync(INDEX, 'utf8'), applied = 0, failed = [];
  for (const p of patches) {
    const n = src.split(p.find).length - 1;
    if (n === 1) { src = src.replace(p.find, p.replace); applied++; }
    else failed.push(`(${n} matches) ${String(p.find).slice(0, 80)}`);
  }
  writeFileSync(INDEX, src);
  console.log(`patches: ${applied} applied, ${failed.length} failed`);
  if (applied === 0) { copyFileSync(join(conv, `index_r${round}.bak.html`), INDEX); history[history.length - 1].errors = 'all patches missed: ' + failed.join('; ').slice(0, 300); continue; }
  // lint gate + stage-machinery guard
  const missing = stageIdsIntact(readFileSync(INDEX, 'utf8'));
  const chk = missing.length ? { out: 'stage ids lost: ' + missing.join(',') } : run('npx', ['-y', HF, 'check', 'public'], { timeout: 300000 });
  if (!/Check passed/.test(chk.out)) {
    copyFileSync(join(conv, `index_r${round}.bak.html`), INDEX);
    history[history.length - 1].errors = 'lint broke, rolled back: ' + chk.out.slice(-400);
    console.log('lint failed -> rolled back');
  } else {
    if (failed.length) history[history.length - 1].errors = 'missed patches: ' + failed.join('; ').slice(0, 300);
  }
}

// converge on the best-seen state, not wherever the random walk ended
if (verdict !== 'surpasses' && best.file && best.round < round) {
  copyFileSync(best.file, INDEX);
  console.log(`restored best-seen index from round ${best.round} (key ${best.key})`);
}
writeFileSync(join(conv, 'history.json'), JSON.stringify(history, null, 2));
console.log(`\nCONVEYOR DONE: verdict=${verdict} after ${round} rounds`);
process.exit(verdict === 'surpasses' ? 0 : 3);
