Round 3 — polish pass before shipping. Attached: 9x16 frames t=4, t=12.5,
t=19.5; 16x9 t=11. Same engine contract and FILE output.

The film is close. Remaining liabilities:

1. PORTRAIT GEOMETRY — the hooded figure reads 'blob': face too wide,
   mic arm is a stray line, no plush charm (the source has a Labubu
   hanging on the mic). Rebuild: narrower face (chamfered), shoulders as
   one clean dome, a hanging small blob-charm on the mic line with a
   swinging spring (phase-shifted to the pulse), wire visible.
2. 16x9 ROOM — panel 59% width is too heavy; make it W*.48 and shift the
   chat band so it spans the full right 47% width. Portrait inside must
   not exceed 62% of panel width.
3. BUD VISIBILITY — white bud on paper is nearly invisible: give it a
   very soft dark shadow ellipse under it (a 6% black blur line) and a
   hairline #c9c7c0 outline so the silhouette reads.
4. WHITE-FIELD ENTRANCE — currently a radial wipe; keep it but let the
   wipe leave a thin paper edge-ring on the noise field for ~0.8 s
   (residue of silence), then fade.
5. TYPE POLISH — 'SHUMODAV OFF' should be replaced: the film's real
   closing line is 'NOISE CANCELLED / NOISE RETURNED' — two lines,
   second line fires 1.4 s after the first, then both hold to the
   loop point. Keep cyrillic allowed, latin is fine.
6. Timeline is good — only add T.loopHold if needed for item 5.

Also write the missing ===FILE: films/anc/audio/score.mjs=== — a
deterministic synth that writes a 29 s 48 kHz stereo WAV at
films/anc/out/score.wav (path relative to CWD). Structure: section A
(0-8 s) noisy stream bed — filtered hiss bursts every eighth at 120 BPM
+ irregular chat-pops (use the cues() timing list mentally); section B
(8-14 s) rising inverse sweep (a sine sweeping down while hiss sweeps
up, cancelling feel); section C (14-21.8 s) near silence: only a low
60 Hz hum at -30 dB + sparse sine ping on beats 32/37/41; section D
(21.8-29 s) the noise bed rushes back at double density, final beat
kills to silence at 28.9 s. Use the WAV-writing approach you used for
pulse-circuit's score.

CURRENT index.html:
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
const R=rng(41973);

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
const bg='#0c0a0d',paper='#f4f2ec',blue='#2a52be';
const magenta='#d94f9e';
const chatWords=[
 'идеально','недорого','шумодава 129?','факт','+','хуёво','АЙ ДОНТ',
 'норм','пруф','жиза','10к','АААА','без звука?','ЛУЧШИЙ','неплохо',
 'почему','чё за','андерсент','бля','копейки','ага','лол','работает'
];
const colors=['#f4f2ec','#d94f9e','#f0b13c','#9bd0ff','#c9b4ff','#eee5d8'];
const glyphs=[];
for(let i=0;i<104;i++){
  const lane=i%6;
  glyphs.push({
    s:chatWords[Math.floor(R()*chatWords.length)],
    lane,
    x:.66+R()*.32,
    y:.09+lane*.145+(R()-.5)*.035,
    size:.38+R()*.22,
    speed:.025+R()*.075,
    phase:R()*TAU,
    col:colors[Math.floor(R()*colors.length)],
    wob:R()*2-1,
    emote:i%9===0,
    donation:i%17===0,
    banner:i===31||i===79,
    dim:i%4===0
  });
}
const wave=[];
for(let i=0;i<128;i++)wave.push((R()-.5)*2);

function u(a,b,t){return clamp((t-a)/(b-a),0,1)}
function sp(a,b,t,k=170,d=26){return spring(clamp((t-a)/(b-a),0,1),k,d)}
function txt(s,x,y,size,font=mono,col='#fff',align='left'){
  ctx.font=`${Math.round(size*2)/2}px ${font}`;
  ctx.fillStyle=col;
  ctx.textAlign=align;
  ctx.textBaseline='middle';
  ctx.fillText(s,x,y);
}
function roundRect(x,y,w,h,r,fill,stroke){
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}
}
function waveY(x,y,amp,t,phase=0){
  const z=x/W;
  return y+amp*(
    Math.sin(z*TAU*3+t*6+phase)+
    .42*Math.sin(z*TAU*11-t*4+phase)+
    .18*Math.sin(z*TAU*23+t*2)
  )/1.6;
}
function laneY(g,t){
  return M+(g.y+Math.sin(t*.7+g.phase)*.004)*H;
}
function glyphX(g,t){
  return g.x*W+Math.sin(t*1.6+g.phase)*P*g.wob;
}
function drawRoom(t){
  let x=M,y=M,w,h;
  if(fmt==='16x9'){
    w=W*.59;h=H-M*2;
  }else{
    x=M;y=M;w=W*.58;h=H*.55;
  }
  ctx.save();
  roundRect(x,y,w,h,P*1.2,'#171218','#342437');
  ctx.clip();
  ctx.fillStyle='#110d13';ctx.fillRect(x,y,w,h);

  const topH=h*.55;
  ctx.fillStyle='#18151a';ctx.fillRect(x,y,w,topH);
  ctx.fillStyle='#26142e';ctx.fillRect(x+w*.72,y,w*.13,topH);
  ctx.fillStyle='#321b42';ctx.fillRect(x+w*.84,y+topH*.12,w*.08,topH*.72);
  ctx.globalAlpha=.33;
  ctx.fillStyle='#a86e84';ctx.fillRect(x+w*.08,y+topH*.17,w*.15,topH*.47);
  ctx.fillStyle='#5b2c91';ctx.fillRect(x+w*.78,y+topH*.13,w*.035,topH*.55);
  ctx.globalAlpha=1;

  // Geometric two-tone portrait crop: hooded shoulders, head, earbud wire and mic.
  ctx.fillStyle='#241d2b';
  ctx.beginPath();
  ctx.moveTo(x+w*.12,y+topH);
  ctx.quadraticCurveTo(x+w*.18,y+topH*.62,x+w*.31,y+topH*.53);
  ctx.lineTo(x+w*.69,y+topH*.53);
  ctx.quadraticCurveTo(x+w*.84,y+topH*.64,x+w*.91,y+topH);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#6f526d';
  ctx.beginPath();
  ctx.moveTo(x+w*.28,y+topH*.68);
  ctx.quadraticCurveTo(x+w*.28,y+topH*.19,x+w*.51,y+topH*.13);
  ctx.quadraticCurveTo(x+w*.76,y+topH*.2,x+w*.73,y+topH*.67);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#d2a7ac';
  ctx.beginPath();
  ctx.moveTo(x+w*.37,y+topH*.28);
  ctx.quadraticCurveTo(x+w*.51,y+topH*.17,x+w*.64,y+topH*.3);
  ctx.lineTo(x+w*.61,y+topH*.57);
  ctx.quadraticCurveTo(x+w*.49,y+topH*.69,x+w*.38,y+topH*.55);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#34273a';
  ctx.beginPath();
  ctx.moveTo(x+w*.34,y+topH*.31);
  ctx.quadraticCurveTo(x+w*.5,y+topH*.07,x+w*.68,y+topH*.3);
  ctx.lineTo(x+w*.63,y+topH*.27);
  ctx.lineTo(x+w*.39,y+topH*.3);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='#eee';ctx.lineWidth=Math.max(2,P*.11);
  ctx.beginPath();
  ctx.moveTo(x+w*.39,y+topH*.47);
  ctx.lineTo(x+w*.39,y+topH*.99);
  ctx.quadraticCurveTo(x+w*.42,y+topH*1.03,x+w*.46,y+topH*.98);
  ctx.stroke();
  ctx.fillStyle='#24202b';
  ctx.beginPath();ctx.arc(x+w*.69,y+topH*.68,P*.18,0,TAU);ctx.fill();
  ctx.strokeStyle='#9570bd';ctx.lineWidth=Math.max(2,P*.08);
  ctx.beginPath();ctx.moveTo(x+w*.67,y+topH*.61);ctx.lineTo(x+w*.72,y+topH*.8);ctx.stroke();

  // Actual stacked white keynote card.
  ctx.fillStyle='#f1efea';ctx.fillRect(x,y+topH,w,h-topH);
  ctx.fillStyle='#d8d5cf';ctx.fillRect(x,y+topH,w,P*.08);
  ctx.fillStyle='#202027';
  ctx.fillRect(x+w*.08,y+topH+(h-topH)*.2,w*.42,P*.08);
  ctx.fillRect(x+w*.08,y+topH+(h-topH)*.31,w*.28,P*.045);
  ctx.fillStyle=blue;
  ctx.fillRect(x+w*.08,y+topH+(h-topH)*.48,w*.2,P*.045);
  ctx.restore();

  txt(fmt==='16x9'?'LIVE / SOURCE STACK':'LIVE / STACKED SOURCE',
    x,y-P*.55,P*.55,mono,'#887a8e');
}
function drawEmote(x,y,s,col){
  roundRect(x-s*.55,y-s*.55,s*1.1,s*1.1,Math.max(2,s*.12),col);
  ctx.fillStyle='#171218';
  ctx.beginPath();ctx.arc(x-s*.18,y-s*.08,s*.09,0,TAU);ctx.arc(x+s*.18,y-s*.08,s*.09,0,TAU);ctx.fill();
  ctx.strokeStyle='#171218';ctx.lineWidth=Math.max(1,s*.06);
  ctx.beginPath();ctx.arc(x,y+s*.08,s*.25,0,Math.PI);ctx.stroke();
}
function drawGlyph(g,t,cancel,frontX){
  const yy=laneY(g,t);
  const xx=glyphX(g,t);
  const amount=clamp(1-cancel,0,1);
  if(amount<.01)return;
  ctx.save();
  ctx.globalAlpha=amount*(g.dim?.4:1);
  const size=P*g.size;
  const streak=size*(2.5+g.speed*18);
  ctx.strokeStyle=g.col;ctx.lineWidth=Math.max(1,P*.045);
  ctx.beginPath();
  ctx.moveTo(xx-streak,yy);ctx.lineTo(xx-size*.65,yy);ctx.stroke();

  if(g.emote){
    drawEmote(xx,yy,size,g.col);
  }else if(g.donation){
    roundRect(xx-size*.35,yy-size*.72,size*6.2,size*1.45,4,'#f0b13c');
    txt('10 555 ₽',xx,yy,size*.61,mono,'#0c0a0d');
  }else if(g.banner){
    roundRect(xx-size*.35,yy-size*.72,size*7.6,size*1.45,4,magenta);
    txt('WINLINE NEXTGEN',xx,yy,size*.55,mono,'#0c0a0d');
  }else{
    txt(g.s,xx,yy,size,mono,g.col);
  }
  ctx.restore();
}
function drawChat(t){
  const front=clamp((t-8)/5.4,0,1);
  const frontX=lerp(W*.67,W*.99,front);
  const reach=W*.16;
  for(let i=0;i<glyphs.length;i++){
    const gx=glyphX(glyphs[i],t);
    const cancel=clamp((frontX-gx)/reach,0,1);
    drawGlyph(glyphs[i],t,cancel,frontX);
  }

  // Two slower, dim background lanes.
  ctx.save();
  ctx.globalAlpha=.4;
  ctx.strokeStyle='#8d7c91';
  ctx.lineWidth=Math.max(1,P*.035);
  for(let j=0;j<18;j++){
    const lane=j%2?1:4;
    const yy=M+(.09+lane*.145)*H;
    const xx=((j*137+t*W*.035)%(W*.44))+W*.58;
    ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+P*(2+j%5),yy);ctx.stroke();
    if(j%4===0)txt(['чат','...','РУБ','live'][j%4],xx+P,yy,P*.28,mono,'#9b8ea0');
  }
  ctx.restore();

  const stripX=(W*.57-(t*.045*W)%(W*.55));
  ctx.save();
  ctx.globalAlpha=.9;
  roundRect(stripX,M+H*.79,W*.47,P*1.05,2,'#f0b13c');
  txt('TOP DONATION 10 555 ₽',stripX+P*.4,M+H*.79+P*.52,P*.46,mono,'#0c0a0d');
  ctx.restore();

  // Thin streaking chat activity.
  ctx.save();
  ctx.globalAlpha=.45;
  for(let i=0;i<9;i++){
    const yy=M+H*(.13+i*.095);
    const xx=W*(.62+((i*19)%23)/100);
    ctx.strokeStyle=i%2?magenta:'#9bd0ff';
    ctx.lineWidth=Math.max(1,P*.05);
    ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+P*(3+i%4),yy);ctx.stroke();
  }
  ctx.restore();
}
function drawNoiseWave(t){
  const q=sp(8,13.2,t,190,22);
  const x0=W*.16;
  const x1=W*.9;
  const front=lerp(x0,W*.72,q);
  const y=H*.48;
  const amp=H*.045;
  ctx.save();
  ctx.lineWidth=Math.max(2,P*.09);
  ctx.strokeStyle='#f4f2ec';
  ctx.beginPath();
  for(let x=x0;x<=x1;x+=4){
    const active=x<=front;
    const yy=active?waveY(x,y,amp,t*1.8):y;
    if(x===x0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
  }
  ctx.stroke();

  // Anti-wave wraps only around the moving front point.
  ctx.strokeStyle=magenta;
  ctx.beginPath();
  for(let a=-Math.PI;a<=Math.PI;a+=.08){
    const rr=P*(.55+q*.85);
    const px=front+Math.cos(a)*rr;
    const py=y+Math.sin(a)*rr*.42;
    if(px>x0&&px<x1) {
      if(a===-Math.PI)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
  }
  ctx.stroke();

  ctx.strokeStyle=blue;
  ctx.lineWidth=Math.max(3,P*.14);
  ctx.beginPath();ctx.arc(front,y,P*(.45+1.1*(1-q)),0,TAU);ctx.stroke();
  ctx.fillStyle=paper;ctx.beginPath();ctx.arc(front,y,P*.16,0,TAU);ctx.fill();

  ctx.strokeStyle='#82738e';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
  ctx.restore();
}
function drawBud(cx,cy,scale,rot){
  ctx.save();
  ctx.translate(cx,cy);ctx.rotate(rot);
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(0,-scale*.18,scale*.42,0,TAU);ctx.fill();
  ctx.beginPath();
  ctx.moveTo(scale*.22,scale*.08);
  ctx.quadraticCurveTo(scale*.35,scale*.22,scale*.23,scale*.78);
  ctx.quadraticCurveTo(scale*.18,scale*.94,scale*.02,scale*.82);
  ctx.lineTo(-scale*.02,scale*.2);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#d7d7d4';
  ctx.beginPath();ctx.ellipse(scale*.08,-scale*.22,scale*.2,scale*.1,-.2,0,TAU);ctx.fill();
  ctx.fillStyle='#929298';
  ctx.beginPath();ctx.ellipse(scale*.17,scale*.74,scale*.08,scale*.035,0,0,TAU);ctx.fill();
  ctx.restore();
}
function drawWhite(t){
  const enter=sp(12.8,16.1,t,100,22);
  const leave=clamp((t-21.8)/1.1,0,1);
  const amount=clamp(enter*(1-leave),0,1);
  if(amount<=0)return;
  ctx.save();
  ctx.fillStyle=paper;
  const r=Math.max(W,H)*1.2*amount;
  ctx.beginPath();ctx.arc(W*.53,H*.5,r,0,TAU);ctx.fill();
  if(t>=14.1&&t<21.8){
    const z=sp(14.1,15.3,t,170,26);
    ctx.globalAlpha=z;
    txt('5 HOURS',W*.5,H*.4,P*4.1,display,blue,'center');
    txt('ACTIVE NOISE CANCELLATION',W*.5,H*.5,P*.78,mono,'#111','center');
    ctx.strokeStyle='#111';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(W*.19,H*.61);ctx.lineTo(W*.81,H*.61);ctx.stroke();
    drawBud(W*.5,H*.73,P*1.18,Math.sin(t*.7)*.12);
  }
  ctx.restore();
}
function frameCounter(t){
  if(t>14&&t<21.8)return;
  txt(`${Math.floor(t*fps).toString().padStart(4,'0')}  /  ${fps} FPS`,
    W-M,H-M*.55,P*.48,mono,'#776d7a','right');
}
function paint(t,loopFrame=false){
  t=clamp(t,0,DUR);
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.14;
  for(let i=0;i<22;i++){
    ctx.strokeStyle=i%3===0?magenta:'#514054';
    ctx.lineWidth=1;
    const yy=(i*97+(t*P*3)%97)%H;
    ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke();
  }
  ctx.globalAlpha=1;

  drawRoom(t);
  drawChat(t);

  if(t>=1.2&&t<8){
    txt('NOISE FIELD',M,H-M*1.35,P*.9,mono,magenta);
    txt('every signal wants attention',M,H-M*.72,P*.58,mono,'#8d7c91');
  }
  if(t>=8&&t<14)drawNoiseWave(t);
  drawWhite(t);

  if(t>=21.8&&!loopFrame){
    ctx.save();
    ctx.globalAlpha=clamp((t-21.8)/.8,0,1);
    txt('SHUMODAV OFF',M,H-M*1.05,P*1.05,mono,paper);
    ctx.restore();
  }
  if(!loopFrame)frameCounter(t);
}
window.seek=t=>{
  if(t>=DUR-.4)paint(.18,true);
  else paint(t);
  return true;
};
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

  for (let b = 0; b < 16; b++) {
    const t = T.noise + b * E8;
    add(t, b % 4 === 0 ? 'thump' : 'tick', b % 4 === 0 ? .42 : .18);
  }

  add(T.carrier, 'zap', .95);
  add(T.carrier + E8, 'whoosh', .42);

  for (let b = 21; b < 29; b++) {
    add(b * BEAT, 'blip', .24);
  }

  add(T.crossing, 'pop', .72);
  add(T.field, 'land', .72);
  add(T.reward, 'ding', .48);
  add(16.5, 'ding', .16);
  add(19.25, 'tick', .09);
  add(20.5, 'ding', .13);

  add(T.return, 'whoosh', .58);
  for (let b = 45; b < 55; b++) {
    add(b * BEAT, b % 3 === 0 ? 'thump' : 'blip', b % 3 === 0 ? .52 : .22);
  }

  add(T.bookend, 'zap', .62);
  add(28.5, 'pop', .35);
  add(DUR-.4, 'loop-lock', .18);

  return c.sort((a,b)=>a.t-b.t);
}
