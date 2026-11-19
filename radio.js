/* ============================================================
   VICE HUSTLE — radio.js · M3
   WPLM Radio Network: 6 procedural synthwave stations + SFX,
   synthesized live with Web Audio. No audio files.
   Each station: own tempo, chord progression, waveforms, drums.
   ============================================================ */
'use strict';

window.Radio=(()=>{

/* ---------------- stations ---------------- */
// prog = semitone offsets from root, one chord per bar
const STATIONS=[
  {name:'WPLM 103.5 · THE VIBE',   bpm:96,  root:45, prog:[0,8,3,10], pad:'sawtooth', lead:'triangle', arp:2, bass8:true,  drums:'four'},
  {name:'98.7 WAVE BEACH',         bpm:110, root:48, prog:[0,8,3,10], pad:'sawtooth', lead:'square',   arp:2, bass8:true,  drums:'four'},
  {name:'101.1 CHROME CITY',       bpm:120, root:40, prog:[0,5,8,10], pad:'sawtooth', lead:'sawtooth', arp:1, bass16:true, drums:'four'},
  {name:'94.3 DOCK ROCK',          bpm:100, root:43, prog:[0,-2,3,5], pad:'square',   lead:'square',   arp:4, bass8:true,  drums:'half'},
  {name:'96.9 GLADES GHOST',       bpm:80,  root:38, prog:[0,3,7,10], pad:'sawtooth', lead:'sine',     arp:4, bass8:true,  drums:'sparse'},
  {name:'107.7 STAR GOLD',         bpm:124, root:48, prog:[0,5,9,7],  pad:'sawtooth', lead:'triangle', arp:1, bass16:true, drums:'four'},
];

/* ---------------- engine state ---------------- */
let ctx=null, master=null, musicBus=null, sfxBus=null;
let timer=null, step=0, nextT=0, station=0, muted=false, started=false;
let noiseBuf=null;

const STEPS=16;                       // steps per bar
const f=m=>440*Math.pow(2,(m-69)/12);

function ensure(){
  if(ctx)return true;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  ctx=new AC();
  master=ctx.createGain(); master.gain.value=muted?0:.4; master.connect(ctx.destination);
  musicBus=ctx.createGain(); musicBus.gain.value=.8; musicBus.connect(master);
  sfxBus=ctx.createGain(); sfxBus.gain.value=1; sfxBus.connect(master);
  const len=ctx.sampleRate*1;
  noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate);
  const d=noiseBuf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  return true;
}

/* ---------------- voices ---------------- */
function tone(t,freq,dur,vol,type,dest){
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+.01);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(dest||musicBus);
  o.start(t); o.stop(t+dur+.05);
}
function pad(t,freqs,dur){
  for(const fr of freqs){
    for(const det of [-4,4]){
      const o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
      o.type=STATIONS[station].pad; o.frequency.value=fr; o.detune.value=det;
      lp.type='lowpass'; lp.frequency.value=1200; lp.Q.value=.7;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(.045,t+.15);
      g.gain.setValueAtTime(.045,t+dur*.7);
      g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(lp); lp.connect(g); g.connect(musicBus);
      o.start(t); o.stop(t+dur+.1);
    }
  }
}
function kick(t){
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type='sine';
  o.frequency.setValueAtTime(120,t);
  o.frequency.exponentialRampToValueAtTime(42,t+.12);
  g.gain.setValueAtTime(.5,t);
  g.gain.exponentialRampToValueAtTime(.0001,t+.16);
  o.connect(g); g.connect(musicBus);
  o.start(t); o.stop(t+.2);
}
function noiseHit(t,dur,vol,hp){
  const s=ctx.createBufferSource(),g=ctx.createGain(),f1=ctx.createBiquadFilter();
  s.buffer=noiseBuf; f1.type='highpass'; f1.frequency.value=hp;
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f1); f1.connect(g); g.connect(musicBus);
  s.start(t); s.stop(t+dur+.05);
}
const hat=t=>noiseHit(t,.04,.08,7000);
const snare=t=>{noiseHit(t,.14,.22,1800); tone(t,190,.1,.12,'triangle');};

/* ---------------- sequencer ---------------- */
const CHORD_SHAPES={ minor:[0,3,7,12], major:[0,4,7,12], sus:[0,5,7,12] };
const chordType=off=>{
  const m=((off%12)+12)%12;
  return (m===3||m===7||m===8)?CHORD_SHAPES.minor:CHORD_SHAPES.major;
};
function playStep(s,t){
  const st=STATIONS[station];
  const bar=Math.floor(s/STEPS), pos=s%STEPS;
  const chordOff=st.prog[bar%st.prog.length];
  const shape=chordType(chordOff);
  const root=st.root+chordOff;
  const spb=60/st.bpm, sixteenth=spb/4, barDur=spb*4;

  if(pos===0)pad(t,shape.slice(0,3).map(i=>f(root+12+i)),barDur*1.05);

  // bass
  const bassNote=f(root-12);
  if(st.bass16){ if(pos%2===0)tone(t,bassNote,sixteenth*1.6,.16,'square'); }
  else if(pos%4===0)tone(t,bassNote,sixteenth*3,.18,'square');

  // drums
  if(st.drums==='four'){
    if(pos%4===0)kick(t);
    if(pos===4||pos===12)snare(t);
    if(pos%2===1)hat(t);
  }else if(st.drums==='half'){
    if(pos===0||pos===8)kick(t);
    if(pos===8)snare(t);
    if(pos%4===2)hat(t);
  }else{ // sparse
    if(pos===0)kick(t);
    if(pos===12)hat(t);
  }

  // lead arp
  if(st.arp>0&&pos%st.arp===0&&(st.drums!=='sparse'||pos%4===0)){
    const tones=[...shape,shape[1]+12,shape[2]+12];
    const note=root+24+tones[(s/st.arp|0)%tones.length];
    tone(t,f(note),sixteenth*3,st.drums==='sparse'?.06:.05,st.lead);
  }
}
function scheduler(){
  if(!ctx)return;
  const st=STATIONS[station], sixteenth=(60/st.bpm/4);
  while(nextT<ctx.currentTime+.15){
    playStep(step,nextT);
    nextT+=sixteenth; step++;
  }
}
function startMusic(){
  if(!ensure())return;
  if(ctx.state==='suspended')ctx.resume();
  if(timer)return;
  step=0; nextT=ctx.currentTime+.05;
  timer=setInterval(scheduler,25);
  started=true;
}
function stopMusic(){
  clearInterval(timer); timer=null;
}

/* ---------------- SFX ---------------- */
function siren(){
  if(!ensure())return;
  const t=ctx.currentTime;
  for(let i=0;i<3;i++){
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sawtooth';
    o.frequency.setValueAtTime(650,t+i*.55);
    o.frequency.linearRampToValueAtTime(950,t+i*.55+.27);
    o.frequency.linearRampToValueAtTime(650,t+i*.55+.55);
    g.gain.setValueAtTime(.0001,t+i*.55);
    g.gain.linearRampToValueAtTime(.12,t+i*.55+.05);
    g.gain.setValueAtTime(.12,t+i*.55+.45);
    g.gain.exponentialRampToValueAtTime(.0001,t+i*.55+.55);
    o.connect(g); g.connect(sfxBus);
    o.start(t+i*.55); o.stop(t+i*.55+.6);
  }
}
function chaChing(){
  if(!ensure())return;
  const t=ctx.currentTime;
  tone(t,1245,.09,.14,'square',sfxBus);
  tone(t+.09,1661,.22,.14,'square',sfxBus);
  noiseHit(t+.09,.2,.06,5000);
}
function fanfare(){
  if(!ensure())return;
  const t=ctx.currentTime, n=[60,64,67,72,76];
  n.forEach((m,i)=>tone(t+i*.09,f(m),.3,.12,'square',sfxBus));
  tone(t+.45,f(79),.5,.12,'square',sfxBus);
}
function bust(){
  if(!ensure())return;
  const t=ctx.currentTime, n=[55,51,48,43];
  n.forEach((m,i)=>tone(t+i*.12,f(m),.24,.14,'sawtooth',sfxBus));
}
function tickSfx(){
  if(!ensure())return;
  tone(ctx.currentTime,880,.05,.07,'square',sfxBus);
}
function blip(freq){
  if(!ensure())return;
  tone(ctx.currentTime,freq||660,.08,.09,'square',sfxBus);
}

/* ---------------- public API ---------------- */
const api={
  STATIONS,
  get station(){return station;},
  get muted(){return muted;},
  get playing(){return !!timer;},
  init(){ startMusic(); },                       // call on first user gesture
  setStation(i){
    station=(i+STATIONS.length)%STATIONS.length;
    step=0;                                      // restart pattern cleanly
    if(started)startMusic();
    return STATIONS[station].name;
  },
  next(){return this.setStation(station+1);},
  prev(){return this.setStation(station-1);},
  setMuted(m){
    muted=m;
    if(master)master.gain.value=muted?0:.4;
  },
  toggleMute(){this.setMuted(!muted);return muted;},
  sfx:{siren,chaChing,fanfare,bust,tick:tickSfx,blip},
};
return api;
})();
