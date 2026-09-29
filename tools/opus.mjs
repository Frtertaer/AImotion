#!/usr/bin/env node
// node tools/opus.mjs <prompt.md> [--img a.png b.png ...] [--outdir dir] [--model m]
// Sends prompt (+images) to claude-opus-5 via the Anthropic Messages API,
// prints the reply, and materializes any ===FILE: <relpath>=== ... ===END=== blocks.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

const args = process.argv.slice(2);
const promptFile = args[0];
const oi = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const model = oi('model', 'claude-opus-5');
const outdir = oi('outdir', '.');
const maxTokens = Number(oi('maxtok', 48000));
const imgIdx = args.indexOf('--img');
const imgs = imgIdx >= 0 ? args.slice(imgIdx + 1).filter((a, j, arr) => !arr.slice(0, j).some((b) => b.startsWith('--')) && !a.startsWith('--')) : [];

const KEY = process.env.OPUS_KEY;
if (!KEY) { console.error('OPUS_KEY env var required'); process.exit(2); }
if (!promptFile) { console.error('usage: node tools/opus.mjs <prompt.md> [--img ...]'); process.exit(2); }

const mediaOf = (p) => (p.endsWith('.png') ? 'image/png' : p.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
const msgsIdx = args.indexOf('--msgs');
let messages;
if (msgsIdx >= 0) {
  // multi-turn: JSON array of {role, text, images?[]}
  messages = JSON.parse(readFileSync(args[msgsIdx + 1], 'utf8')).map((m) => ({
    role: m.role,
    content: [
      ...(m.images || []).map((p) => ({ type: 'image', source: { type: 'base64', media_type: mediaOf(p), data: readFileSync(p).toString('base64') } })),
      { type: 'text', text: m.text },
    ],
  }));
} else {
  const content = [{ type: 'text', text: readFileSync(promptFile, 'utf8') }];
  for (const p of imgs) {
    content.push({ type: 'image', source: { type: 'base64', media_type: mediaOf(p), data: readFileSync(p).toString('base64') } });
  }
  messages = [{ role: 'user', content }];
}

const body = { model, max_tokens: maxTokens, messages };
let text = '', res;
for (let attempt = 1; attempt <= 4; attempt++) {
  res = await fetch('https://api.cheat-ai.shop/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  text = await res.text();
  if (res.ok) break;
  if (res.status === 524 || res.status >= 500 || res.status === 429) {
    console.error(`attempt ${attempt}: HTTP ${res.status}, retrying in ${attempt * 15}s`);
    await new Promise((r) => setTimeout(r, attempt * 15000));
    continue;
  }
  break;
}
let data;
try { data = JSON.parse(text); } catch { console.error('non-JSON response:', text.slice(0, 800)); process.exit(1); }
if (data.error) { console.error('API error:', JSON.stringify(data.error).slice(0, 800)); process.exit(1); }

const reply = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
console.log(`\n=== usage: in=${data.usage?.input_tokens} out=${data.usage?.output_tokens} stop=${data.stop_reason} ===\n`);
console.log(reply);

// materialize ===FILE: rel/path=== blocks
const re = /===FILE:\s*([^\s=]+)===\r?\n([\s\S]*?)===END===/g;
let m, n = 0;
while ((m = re.exec(reply))) {
  const rel = normalize(m[1]).replace(/^(\.\.[/\\])+/, '');
  const dest = join(outdir, rel);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, m[2].replace(/\n$/, '') + '\n');
  console.log(`\n>>> wrote ${dest} (${m[2].split('\n').length} lines)`);
  n++;
}
if (!n) console.log('\n(no ===FILE=== blocks found)');
if (data.stop_reason === 'max_tokens') console.error('\nWARNING: truncated at max_tokens — ask model to continue');
