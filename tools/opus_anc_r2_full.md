Round 2 critique of your ANC draft. Attached: t=4 and t=10.5 (9x16), t=17
(16x9), and three SOURCE frames showing the real composition
(top=streamer face in dark room, bottom=white keynote card, right=RU chat
column with donation badges).

Scores: conceit 9, white-field payoff 8, noise-field richness 5, source
fidelity 4, cancellation legibility 5, room panel 3.

Keep the concept and structure. Fix, in one rewrite:

1. SOURCE COMPOSITION — the real frame is a STACKED split: the streamer's
   face occupies the top ~55%, the white keynote card the bottom ~45%,
   with the chat column overlaid at the right. Make your room viewport
   reflect THAT: a top-panel portrait crop (geometric two-tone head —
   hooded shoulders + earbud wire + mic), NOT a full-height doodle figure.
   In 9x16 put the room as the upper-left window and let chat own the
   right edge top-to-bottom; in 16x9 room left, chat column right.
2. NOISE DENSITY — triple the glyph count (~90-110), add: small emote
   squares, streaking chat lines (motion-stretched), one scrolling
   "TOP DONATION 10 555 ₽" strip, a second slow lane of dim background
   glyphs at ~40% alpha. Glyphs must flow in 4-6 horizontal lanes that do
   not overlap vertically.
3. CANCELLATION MUST BE SEEN — when the carrier front passes a glyph it
   collapses into the zero line AT the front (not a global fade): each
   glyph gets cancel=clamp((frontX - itsX)/reach). Render the noise wave
   only where not yet cancelled; behind the front the wave is FLAT zero
   line. The anti-wave wraps the front point only.
4. WHITE FIELD — replace the bare black dot with the actual bud: a
   minimal AirPod bud silhouette (white circle + angled stem, 3-4 shapes)
   rotating gently, "5 HOURS" / "ACTIVE NOISE CANCELLATION" type stays.
   Also add a hairline zero-line across the field under the type.
5. END BEAT — at ~21.8s noise floods back: let the LAST chat glyph die
   against the loop point: on the final 0.4s everything stills to the
   noise field's opening frame so the loop is invisible.

Same contract + same FILE output format (index.html + timeline.js).

OUTPUT FORMAT (critical — the collector only accepts this exact shape):
===FILE: films/anc/index.html===
<full file contents, no markdown fences>
===END===
===FILE: films/anc/timeline.js===
<full file contents>
===END===
Do not use ``` fences anywhere. Print the FILE blocks ONLY.

CURRENT index.html (rewrite it):
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ANC</title>
<style>
html,body{margin:0;background:#0c0a0d;overflow:hidden}
canvas{display:block;width:100vw;height:100vh}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script type="module">
import {clamp,lerp,spring,rng} from '../../lib/motion.js';
import {DUR} from './timeline.js';

const q=new URLSearchParams(location.search);
const fmt=q.get('fmt')||'9x16';
const fps=+(q.get('fps')||60);
const c=document.getElementById('c');
const ctx=c.getContext('2d');
const TAU=Math.PI*2;
const seed=41973;
const R=rng(seed);

let W,H;
if(fmt==='16x9'){W=1920;H=1080}
else if(fmt==='1x1'){W=1080;H=1080}
else{W=1080;H=1920}
c.width=W;c.height=H;
window.FILM={w:W,h:H,dur:DUR};
window.READY=true;

const P=Math.round(Math.min(W,H)/27);
const M=1.4*P;
const mono='"JetBrains Mono","DejaVu Sans Mono",monospace';
const display='"Liberation Sans Narrow","DejaVu Sans",sans-serif';
const bg='#0c0a0d', paper='#f4f2ec', blue='#2a52be';
const chat=['идеально','недорого','шумодава 129?','факт','+','хуёво','АЙ ДОНТ','норм','пруф','жиза','10к','АААА','без звука?','ЛУЧШИЙ'];
const colors=['#f4f2ec','#d94f9e','#f0b13c','#9bd0ff','#f4f2ec'];
const glyphs=[];
for(let i=0;i<34;i++){
  const s=chat[Math.floor(R()*chat.length)];
  glyphs.push({
    s,x:.68+R()*.27,y:-.04+R()*1.13,
    size:.42+.22*R(), speed:.035+.075*R(),
    phase:R()*TAU,col:colors[Math.floor(R()*colors.length)],
    wob:R()*2-1, donation:i%7===0?((i%2)?'10 555 ₽':'5 000 ₽'):null,
    banner:i%11===0
  });
}
const wave=[];
for(let i=0;i<96;i++) wave.push((R()-.5)*2);

function u(a,b,t){return clamp((t-a)/(b-a))}
function sp(a,b,t,k=170,d=26){return spring(clamp((t-a)/(b-a),0,1),k,d)}
function txt(s,x,y,size,font=mono,col='#fff',align='left'){
 ctx.font=`${size}px ${font}`;ctx.fillStyle=col;ctx.textAlign=align;
 ctx.textBaseline='middle';ctx.fillText(s,x,y);
}
function roundRect(x,y,w,h,r,fill,stroke){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);
 if(fill){ctx.fillStyle=fill;ctx.fill()}
 if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}
}
function noiseWave(x,y,w,h,t,amp=1,sign=1){
 ctx.beginPath();
 for(let i=0;i<=w;i+=4){
   const z=i/w;
   const yy=y+h*.5+sign*amp*h*.42*
     (Math.sin(z*TAU*3+t*7)+.45*Math.sin(z*TAU*11-t*5)+.2*Math.sin(z*TAU*23))/1.65;
   if(i===0)ctx.moveTo(x+i,yy);else ctx.lineTo(x+i,yy);
 }
 ctx.stroke();
}
function drawRoom(t){
 const x=M,y=M,w=W*.52,h=H-M*2;
 ctx.save();
 roundRect(x,y,w,h,P*1.3,'#171218','#342437');
 ctx.clip();
 ctx.fillStyle='#120d14';ctx.fillRect(x,y,w,h);
 ctx.fillStyle='#26142e';ctx.fillRect(x+w*.68,y,w*.1,h);
 ctx.fillStyle='#321b42';ctx.fillRect(x+w*.82,y+h*.1,w*.1,h*.72);
 ctx.fillStyle='#5b2c91';ctx.globalAlpha=.45;
 ctx.fillRect(x+w*.78,y+h*.16,w*.025,h*.4);
 ctx.globalAlpha=1;
 // abstract streamer viewport / waveform hash
 ctx.fillStyle='#221b25';ctx.fillRect(x+w*.08,y+h*.18,w*.77,h*.58);
 ctx.fillStyle='#a86e84';ctx.beginPath();
 ctx.arc(x+w*.5,y+h*.42,w*.12,0,TAU);ctx.fill();
 ctx.fillStyle='#d2a7ac';ctx.beginPath();
 ctx.arc(x+w*.5,y+h*.4,w*.075,0,TAU);ctx.fill();
 ctx.strokeStyle='#eee';ctx.lineWidth=Math.max(2,P*.18);
 ctx.beginPath();ctx.moveTo(x+w*.38,y+h*.45);ctx.lineTo(x+w*.3,y+h*.65);ctx.moveTo(x+w*.62,y+h*.45);ctx.lineTo(x+w*.7,y+h*.65);ctx.stroke();
 ctx.strokeStyle='#b988ff';ctx.lineWidth=2;
 noiseWave(x+w*.08,y+h*.78,w*.78,h*.13,t*.8,.8);
 ctx.restore();
 txt('LIVE / 1080×1920',x,y-P*.55,P*.55,mono,'#887a8e');
}
function drawGlyph(g,i,t,cancel){
 const cycle=(t*.16+g.y+g.phase/TAU)%1;
 const yy=M+(cycle*1.16-.08)*H;
 const xx=g.x*W+Math.sin(t*2+g.phase)*P*g.wob;
 const amp=clamp(1-cancel,0,1);
 if(amp<.015)return;
 ctx.save();ctx.globalAlpha=amp;
 const size=P*g.size;
 if(g.donation){
   roundRect(xx-size*.3,yy-size*.7,size*5.4,size*1.4,4,'#f0b13c');
   txt(g.donation,xx,yy,size*.62,mono,'#0c0a0d');
 }else if(g.banner){
   roundRect(xx-size*.3,yy-size*.7,size*6.8,size*1.5,4,'#d94f9e');
   txt('WINLINE NEXTGEN',xx,yy,size*.55,mono,'#0c0a0d');
 }else{
   txt(g.s,xx,yy,size,mono,g.col);
 }
 ctx.restore();
}
function drawChat(t, phase){
 const cancelPhase=clamp((t-8)/7,0,1);
 const returnPhase=clamp((t-21.5)/2.3,0,1);
 for(let i=0;i<glyphs.length;i++){
   let k=0;
   if(t>=8&&t<14) k=clamp((t-8-i*.075)/1.8,0,1);
   if(t>=14&&t<21.7) k=1;
   if(t>=21.7) k=1-returnPhase;
   drawGlyph(glyphs[i],i,t,k);
 }
 // donation/advertising noise bursts
 if(phase<.3){
   for(let j=0;j<5;j++){
     const xx=W*(.71+((j*37)%23)/100);
     const yy=M+((j*131+Math.floor(t*8)*47)%87)/100*(H-2*M);
     ctx.globalAlpha=.25;
     ctx.strokeStyle=j%2?'#d94f9e':'#f0b13c';
     ctx.lineWidth=2;
     ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+P*4,yy);ctx.stroke();
   }
   ctx.globalAlpha=1;
 }
}
function drawCancellation(t){
 const q=sp(8,12.7,t,220,18);
 const x0=W*.18,x1=W*.86,y=H*.49;
 const cx=lerp(W*.18,W*.67,q);
 ctx.save();
 ctx.lineWidth=Math.max(2,P*.1);
 ctx.globalAlpha=.9;
 ctx.strokeStyle='#f4f2ec';
 noiseWave(x0,y,x1-x0,H*.05,t*2.2,1,1);
 ctx.strokeStyle='#d94f9e';
 noiseWave(cx,y,x1-cx,H*.05,t*2.2,1,-1);
 ctx.strokeStyle=blue;
 ctx.lineWidth=Math.max(3,P*.16);
 ctx.beginPath();ctx.arc(cx,y,Math.max(P*.18,P*1.1*(1-q)),0,TAU);ctx.stroke();
 ctx.fillStyle=paper;ctx.beginPath();ctx.arc(cx,y,P*.16,0,TAU);ctx.fill();
 ctx.restore();
}
function drawWhite(t){
 const enter=sp(12.5,16.2,t,90,20);
 const leave=clamp((t-21.8)/1.4,0,1);
 const amount=clamp(enter*(1-leave),0,1);
 if(amount<=0)return;
 ctx.save();
 ctx.fillStyle=paper;
 const r=Math.max(W,H)*1.15*amount;
 ctx.beginPath();ctx.arc(W*.53,H*.5,r,0,TAU);ctx.fill();
 if(t>=14.2&&t<21.8){
   const z=sp(14.2,15.5,t,170,26);
   ctx.globalAlpha=z;
   txt('5 HOURS',W*.5,H*.48,P*4.25,display,blue,'center');
   txt('ACTIVE NOISE CANCELLATION',W*.5,H*.58,P*.82,mono,'#111','center');
   ctx.fillStyle='#111';ctx.beginPath();ctx.arc(W*.5,H*.72,P*.22,0,TAU);ctx.fill();
 }
 ctx.restore();
}
function frameCounter(t){
 if(t>14&&t<21.8)return;
 txt(`${Math.floor(t*fps).toString().padStart(4,'0')}  /  ${fps} FPS`,
   W-M,H-M*.55,P*.48,mono,'#776d7a','right');
}
function paint(t){
 t=clamp(t,0,DUR);
 const noiseIn=clamp(1-t/1.1,0,1);
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 // deterministic scan/hash texture, never white reward
 ctx.globalAlpha=.18;
 for(let i=0;i<18;i++){
   ctx.strokeStyle=i%3===0?'#d94f9e':'#514054';
   ctx.lineWidth=1;
   const yy=(i*97+(t*P*3)%97)%H;
   ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke();
 }
 ctx.globalAlpha=1;
 drawRoom(t);
 drawChat(t,noiseIn);
 if(t>=1.2&&t<8){
   txt('NOISE FIELD',M,H-M*1.35,P*.9,mono,'#d94f9e');
   txt('every signal wants attention',M,H-M*.72,P*.58,mono,'#8d7c91');
 }
 if(t>=8&&t<14)drawCancellation(t);
 drawWhite(t);
 if(t>=21.8){
   ctx.save();ctx.globalAlpha=clamp((t-21.8)/.8,0,1);
   txt('SHUMODAV OFF',M,H-M*1.05,P*1.05,mono,'#f4f2ec');
   ctx.restore();
 }
 frameCounter(t);
}
window.seek=t=>{paint(t);return true};
</script>
</body>
</html>


CURRENT timeline.js:
export const BPM = 120;
export const BEAT = 60 / BPM;
export const E8 = BEAT / 2;
export const BAR = BEAT * 2;
export const DUR = 29;

export const T = {
  noise: 0,
  carrier: 8,
  crossing: 10,
  field: 14,
  reward: 16,
  silence: 18,
  return: 21.8,
  flood: 23,
  bookend: 27.5,
  end: DUR
};

export function cues() {
  const c = [];
  const add = (t, type, gain = 1) =>
    c.push({t:+t.toFixed(3), type, gain});

  // Noisy stream: a filtered-hiss-like burst on every visual glyph.
  for (let b = 0; b < 16; b++) {
    const t = T.noise + b * E8;
    add(t, b % 4 === 0 ? 'thump' : 'tick', b % 4 === 0 ? .42 : .18);
  }

  add(T.carrier, 'zap', .95);
  add(T.carrier + E8, 'whoosh', .42);

  // Phase-cancellation impacts.
  for (let b = 21; b < 29; b++) {
    add(b * BEAT, 'blip', .24);
  }
  add(T.crossing, 'pop', .72);
  add(T.field, 'land', .72);
  add(T.reward, 'ding', .48);

  // Near-silent field: sparse pings and a low sustained-feeling pulse.
  add(16.5, 'ding', .16);
  add(19.25, 'tick', .09);
  add(20.5, 'ding', .13);

  // Reality floods back.
  add(T.return, 'whoosh', .58);
  for (let b = 45; b < 55; b++) {
    add(b * BEAT, b % 3 === 0 ? 'thump' : 'blip', b % 3 === 0 ? .52 : .22);
  }
  add(T.bookend, 'zap', .62);
  add(28.5, 'pop', .35);

  return c.sort((a,b)=>a.t-b.t);
}
