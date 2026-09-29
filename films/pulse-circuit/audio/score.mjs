import fs from 'node:fs';
import { T, BPM, BEAT, DUR } from '../timeline.js';

const out='films/pulse-circuit/out/score.wav';
const SR=48000,N=Math.floor(SR*DUR);
const L=new Float32Array(N),R=new Float32Array(N);
const hz=m=>440*Math.pow(2,(m-69)/12);
function add(t,v,p=0){
  const i=Math.floor(t*SR);
  if(i>=0&&i<N){L[i]+=v*(1-p)*.5;R[i]+=v*(1+p)*.5}
}
function tone(t,d,m,a=.2,p=0){
  const f=hz(m),s=Math.floor(t*SR),n=Math.floor(d*SR);
  for(let i=0;i<n&&s+i<N;i++){
    const u=i/SR,e=Math.min(1,i/240)*Math.min(1,(n-i)/(SR*.04));
    add(t+u,Math.sin(2*Math.PI*f*u)*a*e,p);
  }
}
function click(t,a=.2){
  tone(t,.035,88,a);
  tone(t,.018,1000,a*.35,.2);
}
function thump(t,a=.4){
  const s=Math.floor(t*SR),n=Math.floor(.22*SR);
  for(let i=0;i<n&&s+i<N;i++){
    const u=i/SR;
    add(t+u,Math.sin(2*Math.PI*(55+80*Math.exp(-u*24))*u)*a*Math.exp(-u*14));
  }
}
function noise(t,d,a=.05){
  let seed=Math.floor(t*100000)+17;
  const s=Math.floor(t*SR),n=Math.floor(d*SR);
  for(let i=0;i<n&&s+i<N;i++){
    seed=(seed*1664525+1013904223)>>>0;
    const v=((seed/4294967296)*2-1)*(1-i/n)*a;
    add(t+i/SR,v,.25);
  }
}
function pulse(t,d,m,a,p){
  tone(t,d,m,a,p);
  tone(t,d,m+12,a*.18,-p);
}
for(let b=0;b<60;b++){
  const t=b*BEAT;
  if(b===4)thump(t,.8);
  if(b>=4&&b<16){
    click(t,.16);
    pulse(t,.16,52,.08,Math.sin(b)*.35);
  }
  if(b===16)thump(t,.65);
  if(b>=16&&b<28){
    click(t,.18);
    pulse(t,.22,52+(b%3)*5,.1,-.25);
  }
  if(b===28)thump(t,.75);
  if(b>=28&&b<40){
    click(t,.2);
    pulse(t,.14,59+(b%4)*2,.11,.3);
  }
  if(b===40)noise(t,.7,.16);
  if(b>=40&&b<48){
    click(t,.12);
    pulse(t,.1,71+(b%2)*7,.09,b%2?.35:-.35);
  }
  if(b===48)thump(t,.9);
  if(b>=48&&b<56){
    click(t,.18);
    pulse(t,.24,52,.12,0);
  }
  if(b===56)tone(t,.3,76,.35);
}
noise(T.crossing,.8,.08);
tone(T.return,.5,40,.25);
let peak=0;
for(let i=0;i<N;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));
const gain=.86/(peak||1);
const buf=Buffer.alloc(44+N*4);
buf.write('RIFF',0);
buf.writeUInt32LE(36+N*4,4);
buf.write('WAVEfmt ',8);
buf.writeUInt32LE(16,16);
buf.writeUInt16LE(1,20);
buf.writeUInt16LE(2,22);
buf.writeUInt32LE(SR,24);
buf.writeUInt32LE(SR*4,28);
buf.writeUInt16LE(4,32);
buf.writeUInt16LE(16,34);
buf.write('data',36);
buf.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){
  const fade=i>N-SR*.25?(N-i)/(SR*.25):1;
  buf.writeInt16LE(Math.round(Math.tanh(L[i]*gain)*fade*32767),44+i*4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i]*gain)*fade*32767),46+i*4);
}
fs.mkdirSync('films/pulse-circuit/out',{recursive:true});
fs.writeFileSync(out,buf);
console.log(`score ${DUR}s @ ${BPM} BPM -> ${out}`);
