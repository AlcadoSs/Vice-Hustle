/* ============================================================
   VICE HUSTLE — game.js · M2 vertical slice
   6 districts · Dirty/Heat/Raid/Launder loop · 3 heist minigames
   The Big Score prestige + Legacy tree · 8 lieutenants · The Vault
   Docs: docs/GDD.md · docs/ART_BIBLE.md
   ============================================================ */
'use strict';

/* ---------------- CONFIG ---------------- */
const SAVE_KEY='vice-hustle-save', SAVE_VER=3;
const TICK_MS=200, HEIST_FIRST_S=180, HEIST_EVERY_S=300, RAID_COOLDOWN_S=25;
const OFFLINE_CAP_S=8*3600, OFFLINE_MIN_S=90;

const DISTRICTS=[
  {id:1,name:'MOTEL STRIP', img:'art/districts/d1-motel-strip.jpg', img2:'art/era2/d1.jpg', vid:'videos/d1-loop.mp4', icon:'🌴', unlock:0,     unlockTxt:''},
  {id:2,name:'NEON BEACH',  img:'art/districts/d2-neon-beach.jpg',  img2:'art/era2/d2.jpg', vid:'videos/d2-loop.mp4', icon:'🏖️', unlock:150e3, unlockTxt:'$150K CLEAN'},
  {id:3,name:'DOWNTOWN',    img:'art/districts/d3-downtown.jpg',    img2:'art/era2/d3.jpg', vid:'videos/d3-loop.mp4', icon:'🌃', unlock:4e6,    unlockTxt:'$4M CLEAN'},
  {id:4,name:'THE DOCKS',   img:'art/districts/d4-docks.jpg',       img2:'art/era2/d4.jpg', vid:'videos/d4-loop.mp4', icon:'⚓', unlock:120e6,  unlockTxt:'$120M CLEAN'},
  {id:5,name:'SWAMP GLADES',img:'art/districts/d5-swamp.jpg',       img2:'art/era2/d5.jpg', vid:'videos/d5-loop.mp4', icon:'🐊', unlock:4e9,    unlockTxt:'$4B CLEAN'},
  {id:6,name:'STAR ISLAND', img:'art/districts/d6-star-island.jpg', img2:'art/era2/d6.jpg', vid:'videos/d6-loop.mp4', icon:'🏝️', unlock:150e9,  unlockTxt:'$150B CLEAN'},
];

const RACKETS=[
  // D1 — Motel Strip
  {id:'cars',   d:1, name:'Boosting Cars',        ic:'art/icons/cars.jpg',    em:'🚗', cost:50,    inc:1,    heat:.05},
  {id:'scams',  d:1, name:'Petty Scams',          ic:'art/icons/scams.jpg',   em:'🃏', cost:600,   inc:8,    heat:.15},
  {id:'boats',  d:1, name:'Cigarette Boat Runs',  ic:'art/icons/boats.jpg',   em:'🚤', cost:7200,  inc:70,   heat:.4},
  {id:'tv',     d:1, name:'Fenced Electronics',   ic:'art/icons/tv.jpg',      em:'📼', cost:87e3,  inc:600,  heat:1.2},
  {id:'motel',  d:1, name:'Palm Court Motel',     ic:'art/icons/motel.jpg',   em:'🏨', cost:6e5,   inc:0, heat:0, lau:10, front:true},
  // D2 — Neon Beach
  {id:'park',   d:2, name:'Beach Parking Racket', ic:'art/icons/park.jpg',    em:'🅿️', cost:1.2e6, inc:8000, heat:2},
  {id:'arcade', d:2, name:'Arcade Skimming',      ic:'art/icons/arcade.jpg',  em:'🕹️', cost:14e6,  inc:95e3, heat:5.5},
  {id:'escort', d:2, name:'Companionship Services',ic:'art/icons/escort.jpg', em:'💋', cost:170e6, inc:1.1e6,heat:15},
  {id:'roids',  d:2, name:'Steroid Imports',      ic:'art/icons/roids.jpg',   em:'💊', cost:2e9,   inc:13e6, heat:40},
  {id:'kiosk',  d:2, name:'Boardwalk Kiosks',     ic:'art/icons/kiosk.jpg',   em:'🛍️', cost:24e9,  inc:0, heat:0, lau:20e3, front:true},
  // D3 — Downtown
  {id:'protect',d:3, name:'Protection Racket',    ic:'art/icons/protect.jpg', em:'🥊', cost:2.8e11, inc:1.5e8,  heat:3},
  {id:'casino', d:3, name:'Underground Casino',   ic:'art/icons/casino.jpg',  em:'🎲', cost:3.3e12, inc:1.8e9,  heat:8},
  {id:'grand',  d:3, name:'High-End Car Theft',   ic:'art/icons/grand.jpg',   em:'🏎️', cost:3.8e13, inc:2.1e10, heat:20},
  {id:'chop',   d:3, name:'Chop Shop 2.0',        ic:'art/icons/chop.jpg',    em:'🔧', cost:4.4e14, inc:2.5e11, heat:55},
  {id:'bail',   d:3, name:'Bail Bonds "Front"',   ic:'art/icons/bail.jpg',    em:'⚖️', cost:5e15,   inc:0, heat:0, lau:4e8, front:true},
  // D4 — The Docks
  {id:'boxes',  d:4, name:'Container "Misplacement"',ic:'art/icons/boxes.jpg',em:'📦', cost:5.2e16, inc:2.9e12, heat:6},
  {id:'union',  d:4, name:'Dockworkers Union',    ic:'art/icons/union.jpg',   em:'🦺', cost:6e17,   inc:3.4e13, heat:16},
  {id:'tunnels',d:4, name:'Smuggling Tunnels',    ic:'art/icons/tunnels.jpg', em:'🕳️', cost:7e18,   inc:3.9e14, heat:40},
  {id:'yachts', d:4, name:'Yacht Charters',       ic:'art/icons/yachts.jpg',  em:'🛥️', cost:8.2e19, inc:4.5e15, heat:110},
  {id:'fish',   d:4, name:'Fish Market Front',    ic:'art/icons/fish.jpg',    em:'🐟', cost:9.5e20, inc:0, heat:0, lau:5e11, front:true},
  // D5 — Swamp Glades
  {id:'shine',  d:5, name:'Moonshine Stills',     ic:'art/icons/shine.jpg',   em:'🌕', cost:1.1e22, inc:5.2e16, heat:12},
  {id:'cargo',  d:5, name:'Buried Cargo Pickup',  ic:'art/icons/cargo.jpg',   em:'🧭', cost:1.3e23, inc:6e17,   heat:30},
  {id:'exotic', d:5, name:'Exotic Animal Trade',  ic:'art/icons/exotic.jpg',  em:'🦎', cost:1.5e24, inc:6.9e18, heat:75},
  {id:'gamble', d:5, name:'Swamp Gambling Den',   ic:'art/icons/gamble.jpg',  em:'🃏', cost:1.75e25,inc:8e19,   heat:200},
  {id:'gator',  d:5, name:'Gator Farm Tourism',   ic:'art/icons/gator.jpg',   em:'🐊', cost:2e26,   inc:0, heat:0, lau:6e14, front:true},
  // D6 — Star Island
  {id:'rap',    d:6, name:'Rap Label',            ic:'art/icons/rap.jpg',     em:'🎙️', cost:2.3e27, inc:9.2e20, heat:25},
  {id:'crypto', d:6, name:'Crypto Exchange',      ic:'art/icons/crypto.jpg',  em:'🪙', cost:2.7e28, inc:1.05e22,heat:60},
  {id:'club',   d:6, name:'Nightclub Empire',     ic:'art/icons/club.jpg',    em:'🪩', cost:3.1e29, inc:1.2e23, heat:150},
  {id:'gallery',d:6, name:'Art Gallery Front',    ic:'art/icons/gallery.jpg', em:'🖼️', cost:3.6e30, inc:0, heat:0, lau:1.4e16, front:true},
  {id:'security',d:6,name:'Private Security Firm',ic:'art/icons/security.jpg',em:'🛡️', cost:4.2e31, inc:1.4e24, heat:0, special:'security'},
];

const UPGRADES=[
  {id:'lawyer', name:'Bent Lawyer',       icon:'⚖️', max:3, costs:[20e3,400e3,8e6], desc:'+0.5/s Heat decay per hire'},
  {id:'scanner',name:'Police Scanner',    icon:'📡', max:1, costs:[60e3],            desc:'10s warning before every raid'},
  {id:'washers',name:'Industrial Washers',icon:'🫧', max:3, costs:[15e3,300e3,6e6], desc:'+50% laundering speed per tier'},
];

const HEISTS=[
  {id:'grab',   d:1, name:"Kasey's Cash House",  kind:'drill', risk:1, vid:'videos/heist-grab.mp4'},
  {id:'motel',  d:1, name:'The Ice Machine Job', kind:'con',   risk:1, vid:'videos/heist-motel.mp4'},
  {id:'vault',  d:2, name:'Arcade Vault',        kind:'drill', risk:2, vid:'videos/heist-vault.mp4'},
  {id:'board',  d:2, name:'Boardwalk Long Con',  kind:'con',   risk:2, vid:'videos/heist-board.mp4'},
  {id:'cage',   d:3, name:'Casino Cage',         kind:'drill', risk:3, vid:'videos/heist-casino.mp4'},
  {id:'tower',  d:3, name:'Tower Getaway',       kind:'boost', risk:2, vid:'videos/heist-tower.mp4'},
  {id:'run',    d:4, name:'Container Run',       kind:'boost', risk:2, vid:'videos/heist-container.mp4'},
  {id:'customs',d:4, name:'Customs Con',         kind:'con',   risk:2, vid:'videos/heist-customs.mp4'},
  {id:'still',  d:5, name:'Still House Score',   kind:'drill', risk:2, vid:'videos/heist-still.mp4'},
  {id:'drop',   d:5, name:'Gator Pit Drop',      kind:'boost', risk:2, vid:'videos/heist-drop.mp4'},
  {id:'safe',   d:6, name:'Mansion Safe',        kind:'drill', risk:3, vid:'videos/heist-safe.mp4'},
  {id:'swap',   d:6, name:'Gallery Swap',        kind:'con',   risk:3, vid:'videos/heist-gallery.mp4'},
];
const RISK_MULT={1:2,2:4,3:8};
const RISK_TXT={1:'★☆☆ EASY ×2',2:'★★☆ MED ×4',3:'★★★ HARD ×8'};
const KIND_TXT={drill:'THE DRILL',boost:'THE BOOST',con:'THE CON'};

const LIEUTS=[
  {id:'ray',   name:'Ray "Chrome" Delgado', role:'Wheelman',    pic:'art/portraits/ray.jpg',   em:'🕶️', unlock:s=>s.stats.heists>=1,          hint:'run your first heist',        fx:'Boost & Con windows +25%'},
  {id:'betty', name:'Miss Betty',           role:'Launder Queen',pic:'art/portraits/betty.jpg',em:'🧺', unlock:s=>(s.r.motel||{n:0}).n>=25,   hint:'own 25 Palm Court Motels',    fx:'Laundering speed +25%'},
  {id:'kmr',   name:'DJ KRM',               role:'103.5 FM Host',pic:'art/portraits/kmr.jpg', em:'🎧', unlock:s=>s.unlocked>=2,             hint:'unlock Neon Beach',           fx:'Heat decay +0.5/s'},
  {id:'sal',   name:'"Suit" Sal Marchetti', role:'Fixer',        pic:'art/portraits/sal.jpg',   em:'🕴️', unlock:s=>s.stats.raids>=1,          hint:'survive a raid',              fx:'First raid each hour: 50% refunded'},
  {id:'rosa',  name:'Capitana Rosa',        role:'Dock Boss',    pic:'art/portraits/rosa.jpg',  em:'⚓', unlock:s=>s.unlocked>=4,             hint:'unlock The Docks',            fx:'Docks rackets +50% income'},
  {id:'ana',   name:'Dr. Ana Peligro',      role:'Wildlife "Vet"',pic:'art/portraits/ana.jpg', em:'🩺', unlock:s=>s.unlocked>=5,             hint:'unlock Swamp Glades',         fx:'Glades rackets +40% income'},
  {id:'tang',  name:'Tangerine Dream',      role:'Art Forger',   pic:'art/portraits/tang.jpg',  em:'🍊', unlock:s=>s.unlocked>=6,             hint:'unlock Star Island',          fx:'Laundering speed +5%'},
  {id:'ghost', name:'The Ghost',            role:'Legend',       pic:'art/portraits/ghost.jpg', em:'👤', unlock:s=>s.respect>=500,           hint:'earn 500 Respect',            fx:'Raids never shut down rackets'},
];

const LEGACY=[
  {id:'empire',  name:'Empire',    icon:'💼', desc:'+25% all income per level',        max:5},
  {id:'laundry', name:'Laundromats',icon:'🫧', desc:'+15% laundering per level',        max:5},
  {id:'whisper', name:'Whisper',   icon:'🤫', desc:'−8% Heat rate per level',          max:5},
  {id:'kick',    name:'Kickstart', icon:'⚡', desc:'Start each empire with +$100K/level', max:5},
];
const LEGACY_COSTS=[1,2,4,8,16];

const QUEENS=[
  {id:'solana',  name:'Solana Vega',      title:'The Bikini Baroness',   pic:'art/queens/solana.jpg',  em:'👑', unlock:s=>s.unlocked>=2,     hint:'unlock Neon Beach',        fx:'Bribes cost half'},
  {id:'camille', name:'Camille St. Croix',title:'Hostess w/ the Mostest',pic:'art/queens/camille.jpg', em:'🍸', unlock:s=>s.unlocked>=3,     hint:'unlock Downtown',           fx:'Heist takes +25%'},
  {id:'roxy',    name:'Roxy Rico',        title:'Street Race Royalty',   pic:'art/queens/roxy.jpg',    em:'🏁', unlock:s=>s.acts.swins>=3,   hint:'win 3 street races',        fx:'Street race pay ×2'},
  {id:'yara',    name:'Yara',             title:'The Gator Whisperer',   pic:'art/queens/yara.jpg',    em:'🐊', unlock:s=>s.acts.gwins>=3,   hint:'win 3 gator races',         fx:'Gator race pay ×1.5'},
  {id:'destiny', name:'Destiny Monroe',   title:'The Diva',              pic:'art/queens/destiny.jpg', em:'🎤', unlock:s=>s.unlocked>=6,     hint:'unlock Star Island',        fx:'Frenzies last twice as long'},
  {id:'vivienne',name:'Vivienne Ashford', title:'The Heiress',           pic:'art/queens/vivienne.jpg',em:'🛥️', unlock:s=>s.respect>=1,      hint:'pull your first Big Score', fx:'Offline earnings +50%'},
];
const RADIO_SUBS=['DJ KRM ON THE BOARDS','SALT IN THE SPEAKERS','CHROME AFTER DARK','HEAVY MACHINERY','BROADCAST FROM THE MIST','ONLY THE FINEST'];
const NIGHT_LINES=[
  'Solana knows a beach bar that forgets faces.',
  'Camille got you the booth with the good champagne.',
  'Roxy took the scenic route. All of them.',
  'Yara introduced you to a gator named Kevin.',
  'Destiny dedicated a song to "a certain somebody."',
  'Vivienne tipped the valet with a Rolex.',
];

const MILESTONES=[
  {id:'car1',    name:'Where It All Begins', test:s=>(s.r.cars||{n:0}).n>=1},
  {id:'raid1',   name:'Slipped the Cuffs',   test:s=>s.stats.raids>=1},
  {id:'tf1',     name:'Public Enemy',        test:s=>s.heat>=100},
  {id:'heist1',  name:'First Score',         test:s=>s.stats.heists>=1},
  {id:'queen1',  name:'Charmed',             test:s=>Object.keys(s.queens).length>=1},
  {id:'crew4',   name:'The Outfit',          test:s=>Object.keys(s.lieuts).length>=4},
  {id:'d2',      name:'Beach House',         test:s=>s.unlocked>=2},
  {id:'d3',      name:'Skyline',             test:s=>s.unlocked>=3},
  {id:'clean1m', name:'Seven Figures (Clean)',test:s=>s.stats.clean>=1e6},
  {id:'d4',      name:'Harborlight',         test:s=>s.unlocked>=4},
  {id:'d5',      name:'Swamp Thing',         test:s=>s.unlocked>=5},
  {id:'d6',      name:'Star Struck',         test:s=>s.unlocked>=6},
  {id:'races5',  name:'Green Flag',          test:s=>s.acts.races>=5},
  {id:'vault3',  name:'Triple Threat',       test:s=>Object.keys(s.vault).length>=3},
  {id:'scr10',   name:'Lucky Fingers',       test:s=>s.acts.scratch>=10},
  {id:'big1',    name:'The Big Score',       test:s=>s.respectGranted>=1},
];

const TICKER=[
  'That motel ice machine? Loose change. Check it.',
  'Police report a "completely normal" amount of sirens tonight.',
  'Reminder: the 5-0 reads the tide charts too, friend.',
  'Somewhere out there, a man in white is leaning on a very nice car.',
  'Sunscreen. Sunglasses. Silence. The Palmetto way.',
  'The gators didn\'t see anything. They never do.',
  'You hear that? Exactly. That\'s the sound of no snitches.',
  'Tonight\'s forecast: 80% chance of neon.',
  'If the heat\'s on, the washer\'s slow. Nature is healing.',
  'A word from our sponsor: laundromats. Wash everything.',
  'Lost: one briefcase. Finder keeps it. Seriously. Keep it.',
  'The mayor says crime is down. The mayor is hilarious.',
  'Boardwalk parking is now "flexibly priced".',
  'Downtown penthouse prices are "aggressive", says man selling one.',
  'Customs officials deny the tunnels exist, then ask for directions.',
  'Swamp tour operators report record "catch and release" numbers.',
  'A gallery on Star Island sold a blank canvas. Twice. Same canvas.',
  'Private security: because the city never sleeps, but someone must.',
  'This is DJ KRM, signing off before the sirens sign on.',
  '1986 called. It wants its skyline back.',
];

/* ---------------- STATE ---------------- */
function defaultState(){
  return {
    v:SAVE_VER, dirty:0, clean:0, heat:0, tf:false,
    unlocked:1, active:1, r:{}, up:{lawyer:0,scanner:0,washers:0},
    respect:0, respectGranted:0, spent:{empire:0,laundry:0,whisper:0,kick:0},
    vault:{}, lieuts:{}, lastSal:0, era:1,
    radio:{st:0,muted:true}, acts:{races:0,swins:0,gwins:0,scratch:0,scd:0,gcd:0},
    queens:{}, inspiredUntil:0, nightCd:0, mile:{},
    heistReadyAt:0, frenzy:0, ts:Date.now(),
    stats:{dirty:0,clean:0,raids:0,heists:0},
  };
}
let S=defaultState();
let started=false, mult='1';
let pendingRaidAt=0, lastRaidAt=0, raidTO=0;
let drill=null, drillRAF=0, drillTO=0;
let cardRefs={}, structureKey='';
let tickIdx=0;
const reducedMotion=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- UTILS ---------------- */
const $id=x=>document.getElementById(x);
const now=()=>Date.now();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const UNITS=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
function fmt(n){
  if(!isFinite(n))return'∞';
  if(n<0)return'-'+fmt(-n);
  if(n<1000)return n>=100||n%1===0?String(Math.floor(n)):n.toFixed(1);
  let u=0; while(n>=1000&&u<UNITS.length-1){n/=1000;u++;}
  return (n>=100?n.toFixed(0):n.toFixed(1))+UNITS[u];
}
const $$=n=>'$'+fmt(n);
const mmss=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

function isPaused(){
  return !$id('modal').hidden || !$id('heist-modal').hidden || !$id('raid-overlay').hidden
    || document.body.classList.contains('phone-open');
}
let toastTO=0;
function toast(msg){
  const t=$id('toast'); t.textContent=msg; t.hidden=false;
  clearTimeout(toastTO); toastTO=setTimeout(()=>t.hidden=true,2400);
}
function payToast(x){
  toast('+'+$$(x)+' DIRTY');
  const el=$id('led-dirty');
  if(el){el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');}
}

/* ---------------- GAME MATH ---------------- */
function rs(id){ return S.r[id]||(S.r[id]={n:0,lock:0}); }
function mile(n){ return n>=500?100:n>=100?10:n>=50?4:n>=25?2:1; }
function nextMile(n){ return n>=500?Infinity:n>=100?500:n>=50?100:n>=25?50:25; }
function has(id){ return !!(S.lieuts[id]||S.queens[id]); }
function globalMult(){
  let m=1+.25*S.spent.empire;
  if(S.era===2)m*=5; else if(S.era===3)m*=25;
  if(S.frenzy>now()||S.inspiredUntil>now())m*=2;
  if(S.tf)m*=.75;
  return m;
}
function distMult(d){
  let m=1;
  if(d===4&&has('rosa'))m*=1.5;
  if(d===5&&has('ana'))m*=1.4;
  return m;
}
function racketLive(st){ return st.n>0&&st.lock<=now(); }
function incomeOf(r){ const st=rs(r.id); return racketLive(st)?r.inc*st.n*mile(st.n)*globalMult()*distMult(r.d):0; }
function heatOf(r){ const st=rs(r.id); return racketLive(st)?r.heat*Math.sqrt(st.n):0; }
function washOf(r){
  const st=rs(r.id); if(!racketLive(st))return 0;
  let w=r.lau*st.n*mile(st.n)*(1+.5*S.up.washers)*(1+.15*S.spent.laundry);
  if(has('betty'))w*=1.25;
  if(has('tang'))w*=1.05;
  return w;
}
function districtRackets(d){ return RACKETS.filter(r=>r.d===d); }
function visibleRackets(d){
  const list=districtRackets(d), out=[];
  for(let i=0;i<list.length;i++){
    const st=rs(list[i].id);
    if(i===0||st.n>0||(rs(list[i-1].id).n>=10)) out.push(list[i]);
  }
  return out;
}
function totalIncome(){ let x=0; for(const d of DISTRICTS){ if(d.id>S.unlocked)break; for(const r of visibleRackets(d.id)) x+=r.front?0:incomeOf(r); } return x; }
function totalHeat(){
  let x=0;
  for(const d of DISTRICTS){ if(d.id>S.unlocked)break; for(const r of visibleRackets(d.id)) x+=heatOf(r); }
  x*=Math.pow(.92,S.spent.whisper);              // Whisper legacy
  if(rs('security').n>0)x*=.7;                    // Private Security Firm
  return x;
}
function totalWash(){ let x=0; for(const d of DISTRICTS){ if(d.id>S.unlocked)break; for(const r of visibleRackets(d.id)) if(r.front) x+=washOf(r); } return x; }
function decayRate(){
  let d=.5+.5*S.up.lawyer+S.heat*.025;
  if(has('kmr'))d+=.5;
  return d;
}
function costOf(r,k){ const cur=rs(r.id).n,b=r.cost*Math.pow(1.15,cur); return b*(Math.pow(1.15,k)-1)/.15; }
function bribeCost(){ return Math.max(400,totalIncome()*45)*(has('solana')?.5:1); }
function maxAfford(r,money){ const cur=rs(r.id).n,b=r.cost*Math.pow(1.15,cur); return Math.max(0,Math.floor(Math.log(money*.15/b+1)/Math.log(1.15))); }
function respectGain(){ return Math.max(0,Math.floor(Math.sqrt(S.stats.clean/1e4))-S.respectGranted); }

/* ---------------- SAVE ---------------- */
function save(){
  try{ S.ts=now(); localStorage.setItem(SAVE_KEY,JSON.stringify(S)); }catch(e){}
}
function load(){
  try{
    const raw=localStorage.getItem(SAVE_KEY); if(!raw)return false;
    const d=JSON.parse(raw); if(!d||d.v>SAVE_VER)return false;
    S=Object.assign(defaultState(),d);
    S.up=Object.assign({lawyer:0,scanner:0,washers:0},d.up);
    S.spent=Object.assign({empire:0,laundry:0,whisper:0,kick:0},d.spent);
    S.stats=Object.assign({dirty:0,clean:0,raids:0,heists:0},d.stats);
    S.lieuts=d.lieuts||{}; S.vault=d.vault||{};
    S.radio=Object.assign({st:0,muted:true},d.radio);
    S.acts=Object.assign({races:0,swins:0,gwins:0,scratch:0,scd:0,gcd:0},d.acts);
    S.queens=d.queens||{};
    S.mile=d.mile||{};
    // sanitize: heal saves poisoned by an old Infinity payout (JSON turns Infinity into null)
    for(const k of ['dirty','clean','heat','respect','respectGranted','lastSal','heistReadyAt','frenzy','inspiredUntil','nightCd']){
      const v=S[k];
      if(typeof v!=='number'||!isFinite(v))S[k]=0;
    }
    for(const id in S.r){const st=S.r[id];
      if(!st||typeof st.n!=='number'||!isFinite(st.n))S.r[id]={n:0,lock:0};
      else if(typeof st.lock!=='number'||!isFinite(st.lock))st.lock=0;}
    return true;
  }catch(e){ return false; }
}

/* ---------------- LIEUTENANT CHECK ---------------- */
function checkLieuts(){
  let hired=false;
  for(const l of LIEUTS){
    if(!S.lieuts[l.id]&&l.unlock(S)){
      S.lieuts[l.id]=true; hired=true;
      toast(l.name.toUpperCase()+' JOINED THE CREW — '+l.fx.toUpperCase());
    }
  }
  if(hired&&$id('scr-crew').classList.contains('on'))renderCrewApp();
}

/* ---------------- RENDER ---------------- */
function setBg(d){
  const a=$id('bg-a'),b=$id('bg-b'),v=$id('bg-video');
  // the painted still always renders underneath; the video fades in on top only while actually playing
  const img=S.era===2?d.img2:d.img;
  const target=a.classList.contains('show')?b:a, other=target===a?b:a;
  target.style.backgroundImage=`url("${img}")`;
  target.classList.add('show'); other.classList.remove('show');
  v.pause(); v.classList.remove('show');
  if(S.era===1&&d.vid&&!reducedMotion()){
    v.src=d.vid; v.poster=img;
    v.play().catch(()=>{});
  }
}
function districtOf(id){ return DISTRICTS.find(d=>d.id===id); }

function renderTabs(){
  const nav=$id('district-strip'); nav.innerHTML='';
  for(const d of DISTRICTS){
    const locked=d.id>S.unlocked;
    const b=document.createElement('button');
    b.className='d-tab'+(S.active===d.id?' active':'')+(locked?' locked':'');
    b.innerHTML=`<span class="d-ico">${d.icon}</span>${d.name}${locked?`<small>🔒 ${d.unlockTxt}</small>`:''}`;
    b.onclick=()=>{ if(locked){confirmUnlock(d);} else if(S.active!==d.id){S.active=d.id;applyDistrict();} };
    nav.appendChild(b);
  }
}
function applyDistrict(){
  const d=districtOf(S.active);
  setBg(d); $id('district-title').textContent=d.name;
  if(window.Radio){ Radio.setStation(S.active-1); S.radio.st=Radio.station; updateRadioFace(); }
  renderCardsStructure(); renderTabs();
}

function iconHTML(r,size){
  return `<div class="c-icon" style="${size?`width:${size}px;height:${size}px`:''}">${r.em||''}<img src="${r.ic}" alt="" onerror="this.remove()"></div>`;
}
function cardHTML(r){
  return `<div class="card${r.front?' front':''}" data-id="${r.id}">
    ${iconHTML(r)}
    <div class="c-main">
      <div class="c-name">${r.name}<span class="c-owned"></span></div>
      <div class="c-stats"></div>
      <div class="c-bar"><i></i></div>
    </div>
    <button class="c-buy"></button>
    <div class="lockband" hidden></div>
  </div>`;
}
function renderCardsStructure(){
  const wrap=$id('cards'); const list=visibleRackets(S.active);
  wrap.innerHTML=list.map(cardHTML).join('');
  cardRefs={};
  for(const el of wrap.querySelectorAll('.card')){
    cardRefs[el.dataset.id]={
      el, owned:el.querySelector('.c-owned'), stats:el.querySelector('.c-stats'),
      bar:el.querySelector('.c-bar i'), buy:el.querySelector('.c-buy'), lock:el.querySelector('.lockband'),
    };
  }
  structureKey=structKey();
}
function structKey(){ return S.active+'|'+visibleRackets(S.active).map(r=>r.id).join(','); }

function updateCards(t){
  if(structKey()!==structureKey) renderCardsStructure();
  const list=visibleRackets(S.active);
  for(const r of list){
    const c=cardRefs[r.id]; if(!c)continue;
    const st=rs(r.id);
    c.owned.textContent=st.n?' ×'+st.n:'';
    if(r.front){
      c.stats.innerHTML=st.n?`<span class="wash">WASH +${$$(washOf(r))}/s</span>`:`<span class="wash">WASH +${$$(r.lau*(1+.5*S.up.washers)*(1+.15*S.spent.laundry))}/s each</span>`;
    }else{
      c.stats.innerHTML=st.n
        ?`${$$(incomeOf(r))}/s · <span class="heat-up">+${heatOf(r).toFixed(2)} heat/s</span>`
        :`${$$(r.inc*globalMult()*distMult(r.d))}/s each${r.heat
            ?` · <span class="heat-up">+${r.heat} heat/s</span>`
            :` · <span class="teal">COOLS THE CITY −30%</span>`}`;
    }
    const nm=nextMile(st.n);
    c.bar.style.width=(nm===Infinity?100:clamp(st.n/nm*100,0,100))+'%';
    let k=mult==='max'?Math.max(1,maxAfford(r,S.dirty)):(mult==='10'?10:1);
    const cost=costOf(r,k), can=S.dirty>=cost&&(mult!=='max'||maxAfford(r,S.dirty)>=1);
    c.buy.innerHTML=`BUY ×${k}<b>${$$(cost)}</b>`;
    c.buy.disabled=!can;
    if(st.lock>t){
      c.lock.hidden=false;
      c.lock.innerHTML=`🔒 COLD ${Math.ceil((st.lock-t)/1000)}s`;
    }else c.lock.hidden=true;
  }
}
$id('cards').addEventListener('click',e=>{
  const btn=e.target.closest('.c-buy'); if(!btn||btn.disabled)return;
  const id=btn.closest('.card').dataset.id, r=RACKETS.find(x=>x.id===id);
  let k=mult==='max'?maxAfford(r,S.dirty):(mult==='10'?10:1);
  if(k<1)return;
  const cost=costOf(r,k);
  if(S.dirty<cost){toast('NOT ENOUGH DIRTY CASH');return;}
  S.dirty-=cost; rs(id).n+=k;
  window.Radio&&Radio.sfx.chaChing();
  updateCards(now()); checkLieuts();
});

function renderUpgrades(){
  const box=$id('upgrades'); box.innerHTML='';
  for(const u of UPGRADES){
    const tier=S.up[u.id], maxed=tier>=u.max;
    const row=document.createElement('div'); row.className='up-row';
    row.innerHTML=`<div class="c-icon">${u.icon}</div>
      <div class="up-main"><div class="up-name">${u.name} <span class="tier">${'●'.repeat(tier)}${'○'.repeat(u.max-tier)}</span></div>
      <div class="up-desc">${u.desc}</div></div>
      <button class="up-buy" ${maxed?'disabled':''}>${maxed?'MAX':$$(u.costs[tier])}</button>`;
    row.querySelector('.up-buy').onclick=()=>{
      const t2=S.up[u.id]; if(t2>=u.max)return;
      const c=u.costs[t2]; if(S.clean<c){toast('NOT ENOUGH CLEAN MONEY');return;}
      S.clean-=c; S.up[u.id]++; renderUpgrades(); toast(u.name.toUpperCase()+' SECURED');
    };
    box.appendChild(row);
  }
}

function heatStars(){ return S.heat>=99?5:S.heat>=80?4:S.heat>=60?3:S.heat>=40?2:S.heat>=20?1:0; }
function heatWord(){ return S.heat>=100?'TASK FORCE':S.heat>=70?'WANTED':S.heat>=40?'SUSPICIOUS':'CLEAN AIR'; }

function updateHUD(t){
  const stars=$id('stars');
  if(stars.children.length!==5){stars.innerHTML='<span class="st">★</span>'.repeat(5);}
  const on=heatStars();
  [...stars.children].forEach((s,i)=>{s.className=i<on?'st on':'st';s.setAttribute('aria-hidden',i>=on?'true':'false');});
  $id('heat-fill').style.width=S.heat+'%';
  $id('heat-label').textContent=`HEAT ${Math.round(S.heat)} · ${heatWord()}`;
  $id('tf-badge').hidden=!S.tf;
  const bribe=bribeCost();
  $id('bribe-cost').textContent=$$(bribe);
  $id('btn-bribe').disabled=S.dirty<bribe||S.heat<=0;
}
function updateLedger(){
  $id('led-dirty').textContent=$$(S.dirty);
  $id('led-clean').textContent=$$(S.clean);
  $id('led-income').textContent=$$(totalIncome())+'/s';
  $id('led-wash').textContent=$$(totalWash())+'/s';
  $id('led-respect').textContent=fmt(S.respect)+(respectGain()?` (+${respectGain()})`:'');
  const net=totalHeat()-decayRate();
  const el=$id('led-heat');
  el.textContent=(net>=0?'+':'−')+Math.abs(net).toFixed(1)+'/s';
  el.style.color=net>0?'#ff5d7a':'var(--teal)';
  el.style.textShadow=`0 0 10px ${net>0?'rgba(255,93,122,.7)':'rgba(22,224,189,.7)'}`;
}
function updateHeistBtn(t){
  const b=$id('heist-btn'), ready=t>=S.heistReadyAt&&started;
  b.classList.toggle('ready',ready);
  b.textContent=ready?'HEIST!':'HEIST '+mmss((S.heistReadyAt-t)/1000);
}

/* ---------------- ACTIONS ---------------- */
$id('btn-bribe').onclick=()=>{
  const cost=bribeCost();
  if(S.dirty<cost||S.heat<=0)return;
  S.dirty-=cost; S.heat=clamp(S.heat-20,0,100);
  toast('HANDSHAKE COMPLETE · −20 HEAT');
};
$id('buy-toggle').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  mult=b.dataset.mult;
  [...$id('buy-toggle').children].forEach(x=>x.classList.toggle('on',x===b));
  updateCards(now());
});
$id('btn-upgrades').onclick=()=>{ const u=$id('upgrades'); u.hidden=!u.hidden; if(!u.hidden)renderUpgrades(); };

function confirmUnlock(d){
  const next=districtRackets(d.id).slice(0,2).map(r=>r.name).join(' & ');
  modal(`UNLOCK ${d.name}?`,
    `<p>New turf, bigger rackets — and a lot more attention.</p>
     <p class="led-line">COST: ${$$(d.unlock)} CLEAN MONEY</p>
     <p class="led-line">YOU HAVE: ${$$(S.clean)}</p>
     <p style="margin-top:8px">First up: <b>${next}</b></p>`,
    [{label:'UNLOCK',cls:'btn-primary',fn:()=>{
        if(S.clean<d.unlock){toast('NOT ENOUGH CLEAN MONEY');return;}
        S.clean-=d.unlock; S.unlocked=d.id; S.active=d.id; applyDistrict(); checkLieuts();
        toast(d.name+' IS OPEN FOR BUSINESS');
     }},
     {label:'NOT YET',cls:'btn-ghost',fn:closeModal}]);
}

/* ---------------- RAIDS ---------------- */
function scheduleRaid(t){
  const warn=S.up.scanner>0;
  pendingRaidAt=t+(warn?10:0.5)*1000;
  if(warn)$id('raid-banner').hidden=false;
}
function raidLogic(dt,t){
  if(pendingRaidAt){
    const remain=(pendingRaidAt-t)/1000;
    if(!$id('raid-banner').hidden)$id('raid-count').textContent=Math.max(0,Math.ceil(remain))+'s';
    if(t>=pendingRaidAt)doRaid(t);
    return;
  }
  if(t-lastRaidAt<RAID_COOLDOWN_S*1000)return;
  if(S.heat>=70&&t-lastRaidAt>=(S.heat>=100?45:45+Math.random()*45)*1000)scheduleRaid(t);
  else if(S.heat>=40&&Math.random()<(S.heat-40)/2500*dt)scheduleRaid(t);
}
function doRaid(t){
  lastRaidAt=t; pendingRaidAt=0; $id('raid-banner').hidden=true;
  const pct=.2+Math.random()*.2; let stolen=S.dirty*pct;
  S.dirty-=stolen; S.stats.raids++;
  // Sal Marchetti: first raid each hour, 50% refunded
  if(has('sal')&&t-S.lastSal>3600e3){ S.dirty+=stolen*.5; S.lastSal=t; toast('SAL MADE A CALL — HALF YOUR CASH CAME BACK'); }
  const pool=RACKETS.filter(r=>r.d<=S.unlocked&&!r.front&&rs(r.id).n>0&&rs(r.id).lock<=t);
  let lockedName='';
  if(pool.length&&!has('ghost')){
    const hit=pool[Math.floor(Math.random()*pool.length)];
    rs(hit.id).lock=t+60000; lockedName=hit.name;
  }
  $id('raid-text').innerHTML=
    `THEY TOOK ${stolen>=1?$$(stolen):'POCKET LINT'}${lockedName?`<br>${lockedName.toUpperCase()} SHUT DOWN 60s`:''}`;
  const ov=$id('raid-overlay'); ov.hidden=false;
  const rv=$id('raid-vid');
  rv.src='videos/raid-sting.mp4'; rv.play().catch(()=>{});
  window.Radio&&Radio.sfx.siren();
  clearTimeout(raidTO); raidTO=setTimeout(()=>{ov.hidden=true; rv.pause();},2600);
  checkLieuts();
}

/* ---------------- HEISTS ---------------- */
$id('heist-btn').onclick=()=>{ if(now()>=S.heistReadyAt)openHeistPick(); else toast('THE CREW ISN\'T READY — '+mmss((S.heistReadyAt-now())/1000)); };

function openHeistPick(){
  if(drill)return;
  const pool=HEISTS.filter(h=>h.d<=S.unlocked);
  const picks=[];
  while(picks.length<Math.min(3,pool.length)){
    const h=pool[Math.floor(Math.random()*pool.length)];
    if(!picks.includes(h))picks.push(h);
  }
  $id('heist-kicker').textContent='THE SCORE';
  $id('heist-name').textContent='PICK YOUR SCORE';
  $id('heist-pick').innerHTML=picks.map(h=>`
    <div class="heist-card" data-h="${h.id}">
      <div class="hc-kind">${KIND_TXT[h.kind]}</div>
      <div class="hc-name">${h.name}</div>
      <div class="hc-risk">${RISK_TXT[h.risk]}</div>
      <div class="hc-take">TAKE ${$$(Math.max(300,totalIncome()*90*RISK_MULT[h.risk]))}</div>
      <div class="hc-d">${districtOf(h.d).name}${S.vault[h.id]?' · ✓ CLEARED':''}</div>
    </div>`).join('');
  $id('heist-pick').hidden=false; $id('heist-play').hidden=true; $id('drill-result').hidden=true;
  $id('heist-modal').hidden=false;
  $id('heist-pick').querySelectorAll('.heist-card').forEach(el=>{
    el.onclick=()=>{ const h=HEISTS.find(x=>x.id===el.dataset.h); startHeist(h); };
  });
}

function startHeist(h){
  clearTimeout(drillTO);
  $id('heist-pick').hidden=true; $id('heist-play').hidden=false; $id('drill-result').hidden=true;
  // intro card: district art + heist name + GO
  const d=districtOf(h.d);
  const poster=S.era===2&&d.img2?d.img2:d.img;
  const base=Math.max(300,totalIncome()*90);
  const take=base*RISK_MULT[h.risk]*(has('camille')?1.25:1);
  $id('heist-kicker').textContent=KIND_TXT[h.kind];
  $id('heist-name').textContent=h.name;
  $id('heist-play').innerHTML=`
    <div class="hs-intro"><img src="${poster}" alt="">
      <div class="hs-line">
        <div class="hs-kind">${KIND_TXT[h.kind]} · ${d.name}</div>
        <div class="hs-name">${h.name} <span class="hs-risk">${'★'.repeat(h.risk)}</span></div>
        <div class="hs-meta">PULL ${$$(take)} DIRTY · CASH UP TO ${$$(take)}</div>
      </div>
    </div>
    <button class="btn-gold" id="hs-go" style="font-size:20px;padding:14px 48px;display:block;margin:6px auto 0">GO</button>`;
  $id('hs-go').onclick=()=>beginHeistGame(h);
}
function beginHeistGame(h){
  const base={hits:0,miss:0,over:false,h,lastRAF:0};
  drill=base;
  if(h.kind==='drill')startDial(h,base);
  else if(h.kind==='boost')startChase(h,base);
  else startCards(h,base);
}

/* ============ DRILL · VAULT DIAL ============ */
function dialAngle(){
  const m=getComputedStyle($id('dial-needle')).transform;
  if(!m||m==='none')return 0;
  const a=m.match(/matrix\(([-\d.e]+),\s*([-\d.e]+)/);
  if(!a)return 0;
  let deg=Math.atan2(parseFloat(a[2]),parseFloat(a[1]))*180/Math.PI;
  if(deg<0)deg+=360;
  return deg;
}
function wedgePath(cx,cy,r,deg,w){ // wedge centered at deg, width w°
  const p=a=>{const t=(a-90)*Math.PI/180;return (cx+r*Math.cos(t)).toFixed(1)+' '+(cy+r*Math.sin(t)).toFixed(1);};
  return `M ${cx} ${cy} L ${p(deg-w/2)} A ${r} ${r} 0 0 1 ${p(deg+w/2)} Z`;
}
function startDial(h,base){
  const rounds=h.risk===1?5:h.risk===2?6:7;
  const dur=(3.4-h.risk*.5).toFixed(2);
  Object.assign(base,{rounds,wedge:Math.random()*360,ww:48,started:false});
  $id('heist-play').innerHTML=`
    <div id="dial-wrap">
      <svg class="dial" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="100" fill="#0d0718" stroke="#3a2b55" stroke-width="3"/>
        ${Array.from({length:12},(_,i)=>{const a=(i*30-90)*Math.PI/180;
          return `<line class="dticks" x1="${110+86*Math.cos(a)}" y1="${110+86*Math.sin(a)}" x2="${110+96*Math.cos(a)}" y2="${110+96*Math.sin(a)}"/>`;}).join('')}
        <path id="dial-wedge" class="dwedge" d="${wedgePath(110,110,88,base.wedge,base.ww)}"/>
        <circle id="dial-center" cx="110" cy="110" r="26"/>
        <line id="dial-needle" x1="110" y1="110" x2="110" y2="30" stroke="#fff" stroke-width="4" stroke-linecap="round" style="animation-duration:${dur}s"/>
        <circle cx="110" cy="110" r="6" fill="#ffd977"/>
      </svg>
    </div>
    <div id="dial-stats">CLICKS <b class="teal">0</b>/${rounds} · MISSES <b class="red">0</b>/4</div>
    <div id="ct-help"><b style="color:var(--gold)">TAP THE DIAL TO START</b> — then tap when the needle crosses the gold wedge.<br>Crack it in ${rounds} clicks. 4 slips and you're busted.</div>`;
  const wrap=$id('dial-wrap');
  // start on first tap on the dial itself (needle parked at 12); subsequent dial taps are strikes
  const arm=()=>{
    if(!base.over&&!wrap.classList.contains('running')){
      wrap.classList.add('running');
      $id('ct-help').innerHTML='Tap / SPACE when the needle crosses the <span class="gold">gold wedge</span>.';
      window.Radio&&Radio.sfx.blip(660);
    }else if(!base.over)dialStrike();
  };
  wrap.onpointerdown=e=>{e.stopPropagation();arm();};
  drill.dialKey=e=>{if(e.code==='Space'){e.preventDefault();arm();}};
  window.addEventListener('keydown',drill.dialKey);
}
function dialStrike(){
  const d=drill, wrap=$id('dial-wrap');
  let diff=Math.abs(dialAngle()-d.wedge); if(diff>180)diff=360-diff;
  if(diff<=d.ww/2){
    d.hits++;
    d.wedge=Math.random()*360; d.ww=Math.max(30,d.ww-2.5);
    $id('dial-wedge').setAttribute('d',wedgePath(110,110,88,d.wedge,d.ww));
    wrap.classList.remove('hitflash'); void wrap.offsetWidth; wrap.classList.add('hitflash');
    window.Radio&&Radio.sfx.blip(880+d.hits*40);
  }else{
    d.miss++;
    wrap.classList.remove('missflash'); void wrap.offsetWidth; wrap.classList.add('missflash');
    window.Radio&&Radio.sfx.bust();
  }
  $id('dial-stats').innerHTML=`CLICKS <b class="teal">${d.hits}</b>/${d.rounds} · MISSES <b class="red">${d.miss}</b>/4`;
  if(d.miss>=4||d.hits>=d.rounds){
    d.over=true; wrap.classList.remove('running');
    window.removeEventListener('keydown',d.dialKey);
    setTimeout(endHeist,350);
  }
}

/* ============ BOOST · GETAWAY CHASE ============ */
let chaseTO=0;
const BARRIER_SVG='<svg viewBox="0 0 40 26"><rect x="2" y="8" width="36" height="16" rx="2" fill="#1a0b2e" stroke="#ff2e55" stroke-width="2"/><path d="M6 8l7 16M14 8l7 16M22 8l7 16M30 8l7 16" stroke="#ffd977" stroke-width="3"/></svg>';
function startChase(h,base){
  const durMs=(15*(has('ray')?1.25:1))*1000;
  Object.assign(base,{lane:'top',gap:170,dur:durMs,t0:Date.now(),obs:[],nextSpawn:0,scroll:0});
  $id('heist-play').innerHTML=`
    <div id="chase-stage">
      <div class="road"><div class="ch-dashes" id="ch-dashes"></div></div>
      <img id="ch-police" class="ch-car" alt="" style="top:56%;left:5%">
      <img id="ch-you" class="ch-car" alt="" style="top:56%;left:30%">
    </div>
    <div id="chase-stats">CRASHES <b class="red">0</b>/3 · TAP TO WEAVE</div>
    <div id="ct-help">Tap the TOP or BOTTOM half of the strip to switch lanes.<br>Survive ${Math.round(durMs/1000)}s. 3 crashes and they cuff you.</div>`;
  keyedCar('art/cars/player.jpg',u=>{const el=$id('ch-you');if(el)el.src=u||CAR_SIDE('#2a6f68','#16e0bd');});
  keyedCar('art/cars/police.jpg',u=>{const el=$id('ch-police');if(el)el.src=u||CAR_SIDE('#1c1132','#58f7ff');});
  const stage=$id('chase-stage');
  stage.onpointerdown=e=>{
    if(!drill||drill.over)return;
    const r=stage.getBoundingClientRect();
    drill.lane=(e.clientY-r.top)<r.height/2?'top':'bot';
    setChaseLane();
  };
  drill.chaseKey=e=>{if(e.code==='Space'){e.preventDefault();drill.lane=drill.lane==='top'?'bot':'top';setChaseLane();}};
  window.addEventListener('keydown',drill.chaseKey);
  clearInterval(chaseTO);
  chaseTO=setInterval(()=>chaseTick(),50);
}
function setChaseLane(){
  const y=$id('ch-you'),p=$id('ch-police');
  const top=drill.lane==='top';
  if(y)y.style.top=top?'24%':'58%';
  if(p)p.style.top=top===Math.random()<.5?'24%':'58%'; // police mirrors roughly
}
function chaseTick(){
  const d=drill, stage=$id('chase-stage');
  if(!d||d.over||!stage){clearInterval(chaseTO);return;}
  const nowT=Date.now(), dt=.05;
  d.scroll+=dt*60;
  const dashes=$id('ch-dashes'); if(dashes)dashes.style.backgroundPosition=(-(d.scroll*3)%54)+'px 0';
  // spawn
  if(nowT>d.nextSpawn){
    d.nextSpawn=nowT+(950-d.h.risk*120)+Math.random()*400;
    const lane=Math.random()<.5?'top':'bot';
    const el=document.createElement('div');
    el.className='ch-ob'; el.innerHTML=BARRIER_SVG;
    el.style.top=lane==='top'?'20%':'54%'; el.style.left='105%';
    stage.appendChild(el);
    d.obs.push({el,lane,x:105});
  }
  // move
  const spd=(34+d.h.risk*8+((nowT-d.t0)/durMsBase(d))*14);
  for(const ob of d.obs){
    ob.x-=spd*dt;
    ob.el.style.left=ob.x+'%';
    if(ob.lane===d.lane&&ob.x<31&&ob.x>27){          // crash at player x=30
      d.miss++; ob.el.remove(); ob.x=-99;
      stage.classList.remove('crashflash'); void stage.offsetWidth; stage.classList.add('crashflash');
      d.gap=Math.max(40,d.gap-30);
      window.Radio&&Radio.sfx.bust();
      $id('chase-stats').innerHTML=`CRASHES <b class="red">${d.miss}</b>/3 · TAP TO WEAVE`;
      if(d.miss>=3){finishChase(d);return;}
    }else if(ob.x<26&&!ob.passed){ob.passed=true;d.hits++;}
  }
  d.obs=d.obs.filter(o=>o.x>-10&&o.x!==-99);
  // police closes
  d.gap=Math.max(14,d.gap-dt*5);
  const pol=$id('ch-police');
  if(pol)pol.style.left=(30-d.gap/10)+'%';
  if(30-d.gap/10>=28){finishChase(d);return;}       // caught
  if(nowT-d.t0>d.dur)finishChase(d);
}
function durMsBase(d){return d.dur;}
function finishChase(d){
  d.over=true; clearInterval(chaseTO);
  window.removeEventListener('keydown',d.chaseKey);
  setTimeout(endHeist,350);
}

/* ============ CON · CARD TABLE ============ */
const CARD_BACK_SVG='<svg class="ic" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 7l1.2 2.8L16 11l-2.8 1.2L12 15l-1.2-2.8L8 11l2.8-1.2z"/></svg>';
const CARD_GOLD_SVG='<svg viewBox="0 0 24 24"><path d="M12 3l2.4 5.4L20 9l-4 4 1 5.8L12 16l-5 2.8L8 13 4 9l5.6-.6z" fill="#FFC94A" stroke="#fff3cf" stroke-width="1"/></svg>';
function startCards(h,base){
  Object.assign(base,{round:0,money:0,phase:'wait',order:[0,1,2,3]});
  $id('heist-play').innerHTML=`
    <div id="ct-table"></div>
    <div id="ct-stats">ROUNDS <b class="teal">0</b>/3</div>
    <div id="ct-help">Watch the gold card. Track the shuffle. Pick it.</div>`;
  ctRound();
}
function ctRound(){
  const d=drill, tbl=$id('ct-table');
  tbl.innerHTML='';
  d.money=Math.floor(Math.random()*4); d.phase='reveal';
  d.order=[0,1,2,3];
  for(let i=0;i<4;i++){
    const c=document.createElement('div');
    c.className='ct-card'; c.dataset.slot=i;
    c.innerHTML=`<div class="back">${CARD_BACK_SVG}</div><div class="face">${i===d.money?CARD_GOLD_SVG:CARD_BACK_SVG}</div>`;
    c.style.position='relative';
    tbl.appendChild(c);
  }
  const cards=[...tbl.children];
  // flash the gold card
  drillTO=setTimeout(()=>{
    cards[d.money].classList.add('up');
    window.Radio&&Radio.sfx.blip(760);
    drillTO=setTimeout(()=>{
      cards.forEach(c=>c.classList.remove('up'));
      // shuffle: 3 swaps with visual motion
      d.phase='shuffle';
      const slots=[0,1,2,3];
      let swaps=0;
      const doSwap=()=>{
        if(!drill||drill.over)return;
        const a=Math.floor(Math.random()*4), b=Math.floor(Math.random()*4);
        if(a===b){doSwap();return;}
        // animate: swap translateX
        const ca=cards[slots[a]], cb=cards[slots[b]];
        const w=ca.offsetWidth+12;
        const dirA=slots[a]<slots[b]?1:-1;
        ca.style.transform=`translateX(${dirA*w*(slots[b]-slots[a])}px)`;
        cb.style.transform=`translateX(${-dirA*w*(slots[b]-slots[a])}px)`;
        window.Radio&&Radio.sfx.tick();
        [slots[a],slots[b]]=[slots[b],slots[a]];
        drillTO=setTimeout(()=>{
          ca.style.transform=''; cb.style.transform='';
          // reorder DOM to match slots
          tbl.innerHTML=''; slots.forEach(s=>tbl.appendChild(cards[s]));
          if(++swaps<(2+Math.floor(Math.random()*2)))drillTO=setTimeout(doSwap,120);
          else{ d.phase='pick'; d.money=slots.indexOf(d.money); $id('ct-help').textContent='Where did it go? PICK.'; }
        },320);
      };
      drillTO=setTimeout(doSwap,450);
    },1000);
  },600+Math.random()*400);
}
$id('heist-play').addEventListener('click',e=>{
  const c=e.target.closest('.ct-card');
  if(!c||!drill||drill.over||drill.phase!=='pick')return;
  drill.phase='wait';
  const d=drill, tbl=$id('ct-table');
  const picked=+[...tbl.children].indexOf(c);
  const right=picked===d.money;
  c.classList.add(right?'right':'wrong','up');
  tbl.children[d.money].classList.add('up');
  if(right){d.hits++;window.Radio&&Radio.sfx.chaChing();}
  d.round++;
  $id('ct-stats').innerHTML=`ROUNDS <b class="teal">${d.round}</b>/3 · RIGHT <b>${d.hits}</b>`;
  drillTO=setTimeout(()=>{ if(d.round>=3){d.over=true;setTimeout(endHeist,400);} else ctRound(); },1000);
});

function strike(){
  // drill SPACE is handled by drill.dialKey; boost by drill.chaseKey
  if(!drill||drill.over)return;
  if(drill.h.kind==='boost'){ drill.lane=drill.lane==='top'?'bot':'top'; setChaseLane(); }
}
$id('heist-modal').addEventListener('click',e=>{
  if(e.target.closest('#drill-close'))return;
  // drill strikes only fire from the dial itself (wrap.onpointerdown), not stray modal clicks
});

function endHeist(){
  const d=drill; d.over=true; clearTimeout(drillTO); clearInterval(chaseTO);
  if(d.dialKey)window.removeEventListener('keydown',d.dialKey);
  if(d.chaseKey)window.removeEventListener('keydown',d.chaseKey);
  const busted = d.h.kind==='drill'?d.miss>=4 : d.h.kind==='boost'?d.miss>=3 : false;
  let perf;
  if(d.h.kind==='drill'){const ratio=d.hits/(d.rounds||5);perf=ratio>=1?1:ratio>=.6?.7:ratio>=.4?.45:.2;}
  else if(d.h.kind==='boost')perf=d.miss===0?1:d.miss===1?.6:.3;
  else perf=d.hits>=3?1:d.hits===2?.6:d.hits===1?.35:0;
  const base=Math.max(300,totalIncome()*90);
  const pay=busted?0:base*RISK_MULT[d.h.risk]*perf*(has('camille')?1.25:1);
  // theater: gold or red wash
  const wash=document.createElement('div');
  wash.className=busted?'redwash':'goldwash';
  $id('heist-modal').querySelector('.heist-box').appendChild(wash);
  let msg;
  if(busted){
    S.heat=clamp(S.heat+25,0,100);
    msg=`<span style="color:#ff5d7a">BUSTED — the alarm won.</span><br>+25 HEAT · no payday.`;
  }else{
    S.dirty+=pay; S.stats.dirty+=pay; payToast(pay);
    msg=`TAKE: <span class="gold">${$$(pay)}</span> DIRTY`;
    const strong=d.h.kind==='con'?d.hits>=3:d.h.kind==='boost'?d.miss===0:d.hits>=d.rounds;
    if(strong){S.frenzy=now()+(has('destiny')?120000:60000);msg+=`<br><span class="teal">FRENZY ×2 — ${has('destiny')?'120':'60'}s!</span>`;}
    if(perf>=1)msg+='<br><span class="teal">CLEAN GETAWAY.</span>';
    if(d.h.kind==='con'&&d.hits===0){S.heat=clamp(S.heat+10,0,100);msg+='<br>+10 HEAT · they saw your face.';}
  }
  S.stats.heists++;
  let firstClear=false;
  if(!busted&&!S.vault[d.h.id]){ S.vault[d.h.id]=true; firstClear=true; }
  $id('heist-play').innerHTML='';
  const res=$id('drill-result'); res.hidden=false;
  res.innerHTML=`${msg}${firstClear?'<br><span class="gold">✦ SCORE CLEARED — CINEMATIC IN THE VAULT</span>':''}<br><button class="btn btn-primary" id="drill-close" style="margin-top:12px">CASH OUT</button>`;
  res.querySelector('#drill-close').onclick=closeHeist;
  window.Radio&&(busted?Radio.sfx.bust():Radio.sfx.fanfare());
  checkLieuts(); checkQueens();
}
function closeHeist(){
  cancelAnimationFrame(drillRAF); drill=null; clearTimeout(drillTO);
  $id('heist-modal').hidden=true;
  $id('drill-stats').hidden=false; $id('heist-help').hidden=false;
  S.heistReadyAt=now()+HEIST_EVERY_S*1000;
  updateHeistBtn(now());
}
$id('heist-modal').addEventListener('click',e=>{
  if(e.target.closest('#drill-close')||e.target.closest('.heist-card'))return;
  if(e.target.closest('#boost-board')||e.target.closest('#con-board'))return;
  // heist SPACE is handled per-minigame (dialKey/chaseKey); no global strike here
});
window.addEventListener('keydown',e=>{
  if(e.code==='Space'&&!$id('heist-modal').hidden){
    e.preventDefault();
    if(drill&&drill.over)closeHeist();
    // no strike() — each minigame manages its own SPACE input
  }
});

/* ---------------- THE VAULT ---------------- */
$id('btn-vault')&&0; // (menus now live in the Vice Phone)

/* ---------------- CREW ---------------- */
$id('btn-crew')&&0; // (menus now live in the Vice Phone)

/* ---------------- LEGACY / PRESTIGE ---------------- */
$id('btn-legacy')&&0; // (menus now live in the Vice Phone)
function confirmPrestige(gain){
  modal('THE BIG SCORE?',
    `<img class="prestige-art" src="art/keyart/prestige.jpg" alt="" onerror="this.remove()">
     <p>Sunset drive to the Keys. The empire dissolves. The legend doesn't.</p>
     <p class="led-line">GAIN: +${fmt(gain)} RESPECT</p>
     <p class="led-line">KEEP: CREW · VAULT · LEGACY</p>
     <p class="led-line">LOSE: RACKETS · CASH · DISTRICTS · UPGRADES</p>`,
    [{label:'DRIVE INTO THE SUNSET',cls:'btn-primary',fn:doPrestige},
     {label:'NOT YET',cls:'btn-ghost',fn:closeModal}]);
}
function doPrestige(){
  const kick=1e5*S.spent.kick;
  const keep={respect:S.respect+Math.max(0,respectGain()),respectGranted:S.respectGranted+Math.max(0,respectGain()),
              spent:S.spent,vault:S.vault,lieuts:S.lieuts,stats:S.stats,lastSal:S.lastSal,era:S.era};
  S=Object.assign(defaultState(),keep);
  S.dirty=kick;
  S.heistReadyAt=now()+HEIST_FIRST_S*1000;
  applyDistrict(); renderUpgrades(); updateCards(now()); updateHUD(now()); updateLedger();
  closeModal(); checkLieuts();
  toast('THE BIG SCORE PULLED — WELCOME BACK TO THE STRIP');
}

/* ---------------- THE QUEENS ---------------- */
function checkQueens(){
  let joined=false;
  for(const q of QUEENS){
    if(!S.queens[q.id]&&q.unlock(S)){
      S.queens[q.id]=true; joined=true;
      toast(q.name.toUpperCase()+' JOINED YOUR SIDE — '+q.fx.toUpperCase());
      window.Radio&&Radio.sfx.fanfare();
    }
  }
  if(joined&&$id('scr-queens').classList.contains('on'))renderQueensApp();
}
function checkMilestones(){
  let earned=false;
  for(const m of MILESTONES){
    if(!S.mile[m.id]&&m.test(S)){
      S.mile[m.id]=true; earned=true;
      toast('★ MILESTONE — '+m.name.toUpperCase());
      window.Radio&&Radio.sfx.blip(990);
    }
  }
  if(earned&&$id('scr-legacy').classList.contains('on'))renderLegacyApp();
}
$id('btn-queens')&&0; // (menus now live in the Vice Phone)

/* ---------------- RADIO UI ---------------- */
const VOL_ON='<svg class="ic" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>';
const VOL_OFF='<svg class="ic" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>';
function updateRadioFace(){
  if(!window.Radio)return;
  const face=$id('radio'), name=$id('radio-name'), sub=$id('radio-sub');
  face.classList.remove('live'); void face.offsetWidth; face.classList.add('live');
  name.textContent=Radio.STATIONS[Radio.station].name;
  sub.textContent=RADIO_SUBS[Radio.station%RADIO_SUBS.length];
  $id('radio-mute').innerHTML=Radio.muted?VOL_OFF:VOL_ON;
  $id('radio-mute').classList.toggle('muted',Radio.muted);
  $id('pr-mute').innerHTML=Radio.muted?VOL_OFF:VOL_ON;
  $id('pr-mute').classList.toggle('muted',Radio.muted);
  $id('pr-name').textContent=Radio.STATIONS[Radio.station].name.split('·')[0].trim();
  $id('pr-sub').textContent=RADIO_SUBS[Radio.station%RADIO_SUBS.length];
}
function wireRadio(){
  if(!window.Radio)return;
  $id('radio-prev').onclick=()=>{Radio.prev();S.radio.st=Radio.station;updateRadioFace();Radio.sfx.tick();};
  $id('radio-next').onclick=()=>{Radio.next();S.radio.st=Radio.station;updateRadioFace();Radio.sfx.tick();};
  $id('radio-mute').onclick=()=>{S.radio.muted=Radio.toggleMute();updateRadioFace();};
  updateRadioFace();
}

/* ---------------- SIDE HUSTLES ---------------- */
const GATORS=[
  {name:'Bitey', odds:1.8, hue:0},
  {name:'Chompy', odds:2.6, hue:90},
  {name:'El Jefe', odds:4.2, hue:180},
  {name:'Noodle', odds:7,   hue:300},
];
const RACE_CD=60000;
function actStake(){ return Math.max(500,Math.round(totalIncome()*60)); }   // street race
function gatorStake(){ return Math.max(500,Math.round(totalIncome()*90)); }

$id('btn-play')&&0; // (menus now live in the Vice Phone)

/* ============================================================
   SIDE HUSTLES v2 · Night Drag / Swamp Track / The Ticket
   (economy identical: stakes, odds, cooldowns, payouts, EV)
   ============================================================ */

/* ----- STREET RACE · NIGHT DRAG ----- */
let dragR=null, dragRAF=0;
const CAR_SVG=(color,glow)=>`<svg viewBox="0 0 40 18" style="width:44px;height:20px"><path d="M3 13 L8 6 L20 4 L30 6 L38 10 L37 14 L30 13 L27 16 L22 13 L14 13 L11 16 L6 13 Z" fill="${color}" stroke="${glow}" stroke-width="1"/><circle cx="12" cy="6.5" r="2.6" fill="#0d0718" stroke="${glow}"/><circle cx="24" cy="5.5" r="2.6" fill="#0d0718" stroke="${glow}"/></svg>`;
const CAR_SIDE=(body,edge)=>'data:image/svg+xml,'+encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 44"><path d="M4 32 L14 20 L38 12 L74 10 L100 16 L116 26 L114 34 L100 32 L92 38 L84 32 L40 32 L32 38 L24 32 Z" fill="${body}" stroke="${edge}" stroke-width="2"/><circle cx="30" cy="34" r="9" fill="#0d0718" stroke="${edge}" stroke-width="2"/><circle cx="92" cy="34" r="9" fill="#0d0718" stroke="${edge}" stroke-width="2"/><path d="M42 14 L66 12 L66 20 L42 21 Z" fill="#0d0718" opacity=".85"/></svg>`);
const carSprites={};
function keyedCar(src,cb){
  if(carSprites[src]!==undefined){cb(carSprites[src]);return;}
  const img=new Image();
  img.onload=()=>{
    let out=null;
    try{
      const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
      const x=c.getContext('2d');x.drawImage(img,0,0);
      const d=x.getImageData(0,0,c.width,c.height),p=d.data;
      for(let i=0;i<p.length;i+=4){
        const r=p[i],g=p[i+1],b=p[i+2];
        if(g>110&&g>r*1.3&&g>b*1.3)p[i+3]=0;
        else if(g>80&&g>r*1.12&&g>b*1.12)p[i+3]=Math.min(p[i+3],150);
      }
      x.putImageData(d,0,0);
      out=c.toDataURL();
    }catch(e){out=null;}
    carSprites[src]=out;cb(out);
  };
  img.onerror=()=>{carSprites[src]=null;cb(null);};
  img.src=src;
}
function openStreetRace(){
  if(now()<S.acts.scd){toast('THE STRIP NEEDS A BREATH — '+mmss((S.acts.scd-now())/1000));return;}
  const stake=actStake();
  if(S.dirty<stake){toast('NEED '+$$(stake)+' DIRTY TO ENTER');return;}
  S.dirty-=stake; S.acts.races++; S.acts.scd=now()+RACE_CD;
  modal('STREET RACE · NIGHT DRAG',
    `<div id="tree"><i></i><i></i><i></i><i></i></div>
     <div id="tach"><svg viewBox="0 0 230 130">
       <path class="arc" d="M20 115 A95 95 0 0 1 210 115"/>
       <path class="band" d="M195.2 64.2 A95 95 0 0 1 209.1 103.1"/>
       <path class="red" d="M209.1 103.1 A95 95 0 0 1 210 115"/>
       <line id="needle" x1="115" y1="115" x2="115" y2="32" stroke="#fff" stroke-width="3" stroke-linecap="round" transform="rotate(-90 115 115)"/>
       <circle cx="115" cy="115" r="6" fill="#ffd977"/>
     </svg></div>
     <div id="gear-leds">${[1,2,3,4,5].map(g=>`<i class="${g===1?'cur':''}">${g}</i>`).join('')}</div>
     <div id="sv-stage">
       <div class="skyline"></div><div class="palms"></div>
       <div class="road"><div class="sv-dashes"></div></div>
       <span class="sv-board" style="left:14%">60FT</span>
       <span class="sv-board" style="left:38%">330FT</span>
       <span class="sv-board" style="left:54%">1/8 MI</span>
       <div class="sv-fin"></div>
       <span id="sv-tag">FIRST TO THE STRIP · 100 MPH TAKES IT</span>
       <img id="rival-sv" class="sv-car" alt="">
       <img id="you-sv" class="sv-car" alt="">
     </div>
     <div id="race-led">0 MPH</div><div id="race-prompt">WATCH THE TREE…</div>
     <p class="led-line" style="text-align:center">STAKE ${$$(stake)} · WIN ${$$(stake*2*(has('roxy')?2:1))}</p>`,
    [{label:'BAIL',cls:'btn-ghost',fn:()=>{dragR=null;cancelAnimationFrame(dragRAF);closeModal();}}]);
  // painted sprites, chroma-keyed off the green screen; drawn SVG fallback
  keyedCar('art/cars/player.jpg',u=>{const el=$id('you-sv');if(el)el.src=u||CAR_SIDE('#2a6f68','#16e0bd');});
  keyedCar('art/cars/rival.jpg',u=>{const el=$id('rival-sv');if(el)el.src=u||CAR_SIDE('#7a2f55','#ff5d7a');});
  dragR={rpm:0,dir:1,rate:.55,gear:1,mph:0,over:false,last:0,running:false,stage:'tree',stake};
  const tree=$id('tree').children;
  const modalBox=$id('modal-body');
  let tstep=0;
  const treeTO=setTimeout(()=>{ // pre-stage lights
    const seq=setInterval(()=>{
      if(tstep<3){tree[tstep].classList.add('amber');window.Radio&&Radio.sfx.blip(300+tstep*60);tstep++;}
      else{
        clearInterval(seq);tree[3].classList.add('green');window.Radio&&Radio.sfx.blip(880);
        dragR.running=true;dragR.last=performance.now();dragR.stage='run';
        $id('race-prompt').textContent='SHIFT IN THE TEAL BAND — TAP / SPACE';
        $id('tach').classList.add('running');
        setTachSpeed(dragR);
        dragRAF=requestAnimationFrame(dragFrame);
        // watchdog: rAF can be suspended (background tabs / idle renderers) — keep the drag alive
        dragR.watch=setInterval(()=>{
          if(dragR&&!dragR.over&&performance.now()-dragR.last>200)dragFrame(performance.now());
        },120);
      }
    },520);
    dragR.clearSeq=()=>clearInterval(seq);
  },350);
  modalBox.onpointerdown=e=>{ if(dragR&&dragR.stage==='run')shiftDrag(); };
  window.addEventListener('keydown',dragKey,{once:false});
  function dragKey(e){ if(e.code==='Space'&&dragR&&!dragR.over&&dragR.stage==='run'){e.preventDefault();shiftDrag();} }
  dragR.cleanup=()=>{window.removeEventListener('keydown',dragKey);dragR.clearSeq&&dragR.clearSeq();clearTimeout(treeTO);cancelAnimationFrame(dragRAF);if(dragR.watch)clearInterval(dragR.watch);};
}
function needleRpm(){
  const m=getComputedStyle($id('needle')).transform;
  if(!m||m==='none')return 0;
  const a=m.match(/matrix\(([-\d.e]+),\s*([-\d.e]+)/);
  if(!a)return 0;
  const deg=Math.atan2(parseFloat(a[2]),parseFloat(a[1]))*180/Math.PI;
  return Math.max(0,Math.min(100,(deg+90)/1.8));
}
function setTachSpeed(r){
  const dur=200/(r.rate*(1+(r.gear-1)*.28)*100);
  $id('needle').style.animationDuration=dur.toFixed(3)+'s';
}
function dragFrame(ts){
  if(!dragR||dragR.over)return;
  // wall-clock dt (2s cap) so the drag runs at TRUE real-time pace even in throttled renderers
  const dt=Math.min(2,Math.max(0,(ts-dragR.last)/1000)); dragR.last=ts;
  // needle motion is a compositor CSS animation (immune to JS throttling); rpm read live at shifts
  const r=dragR;
  r.rpm=needleRpm();
  r.t=(r.t||0)+dt;
  r.shown=r.shown===undefined?0:r.shown+(r.mph-r.shown)*Math.min(1,dt*4);
  const st=$id('sv-stage');
  if(st){
    const dashes=st.querySelector('.sv-dashes'),palms=st.querySelector('.palms'),sky=st.querySelector('.skyline');
    if(dashes)dashes.style.backgroundPosition=(-(r.shown*3.4)%54)+'px 0';
    if(palms)palms.style.backgroundPosition=(-(r.shown*1.9)%110)+'px 0';
    if(sky)sky.style.backgroundPosition=(-(r.shown*.7)%110)+'px 0';
    const you=$id('you-sv'),riv=$id('rival-sv');
    if(you)you.style.left=(8+Math.min(1,r.shown/140)*89)+'%';
    if(riv)riv.style.left=(8+Math.min(.96,(r.t/8.5)*.76)*89)+'%';
  }
  dragRAF=requestAnimationFrame(dragFrame);
}
function shiftDrag(){
  const r=dragR; if(!r||r.over)return;
  const rpm=needleRpm(); r.rpm=rpm;
  let gain,word,cls;
  if(rpm>=82&&rpm<96){gain=28;word='PERFECT SHIFT!';cls='teal';}
  else if(rpm>=58){gain=19;word='GOOD';cls='';}
  else{gain=6;word='BOGGED…';cls='heat-up';}
  r.mph+=gain; r.rate+=.1;
  $id('race-led').textContent=Math.round(r.mph)+' MPH';
  if(gain===28){const st=$id('sv-stage');if(st){st.classList.remove('boost');void st.offsetWidth;st.classList.add('boost');}}
  $id('race-prompt').innerHTML=`<span class="${cls}">${word}</span>`;
  setTachSpeed({...r,gear:r.gear+1});
  window.Radio&&Radio.sfx.blip(380+r.gear*120);
  const leds=$id('gear-leds').children;
  if(r.gear>=5){endDrag();return;}
  leds[r.gear-1].classList.remove('cur');leds[r.gear-1].classList.add('on');
  leds[r.gear].classList.add('cur');
  r.gear++;
}
function endDrag(){
  const r=dragR;r.over=true;r.cleanup&&r.cleanup();
  const win=r.mph>=100, pay=r.stake*2*(has('roxy')?2:1);
  if(win){S.acts.swins++;S.dirty+=pay;payToast(pay);}
  const st=$id('sv-stage');
  if(st){
    if(win){
      st.classList.add('flashwin');
      const y=$id('you-sv');if(y)y.style.left='80%';
      const rv=$id('rival-sv');if(rv)rv.style.left=(8+Math.min(.96,(r.t/8.5)*.76)*89)+'%';
    }else{
      st.classList.add('shake');
      const rv=$id('rival-sv');if(rv)rv.style.left='82%';
    }
  }
  window.Radio&&(win?Radio.sfx.fanfare():Radio.sfx.bust());
  setTimeout(()=>{
    modal('STREET RACE · RESULT', win
      ? `<div id="race-led">${Math.round(r.mph)} MPH</div>
         <p class="led-line" style="color:var(--teal)">TAKE THE STRIP — ${$$(pay)} DIRTY!</p>`
      : `<div id="race-led">${Math.round(r.mph)} MPH</div>
         <p class="led-line" style="color:#ff5d7a">OUT-DRAGGED. TAILLIGHTS. THE STAKE'S GONE.</p>`,
      [{label:'COLLECT',cls:'btn-primary',fn:()=>{closeModal();checkQueens();updateBadges();refreshHustlesIfOpen();}}]);
  },650);
}

/* ----- GATOR RACE · SWAMP TRACK ----- */
const SCARF_COLORS=['#ff5d5d','#ffd977','#16e0bd','#ff2e88'];
const GATOR_SVG=(scarf)=>`<svg viewBox="0 0 74 30">
  <path fill="#2f7d4f" d="M4 19 q4-9 18-9 h18 q12 0 18 5 l12-4 -7 8 q1 6-7 8 l-5-4 h-5 l-3 5 h-7 l-2-5 h-8 l-3 5 h-7 l-2-5 q-8 0-10-5z"/>
  <circle cx="55" cy="14" r="1.8" fill="#ffd977"/>
  <path d="M58 18 l10 2 -9 2z" fill="#1d5133"/>
  <rect x="26" y="7" width="11" height="5" rx="2.5" fill="${scarf}"/>
</svg>`;
const GATOR_FORM=[3,2,4,1]; // flavor only
function gatorForm(g){ // deterministic per-session quips, no economy meaning
  return Array.from({length:5},(_,k)=>((g*7+k*13)%10)<5?'<i></i>':'<i class="w"></i>').join('');
}
let swampTO=0;
function openGatorRace(){
  if(now()<S.acts.gcd){toast('THE SWAMP NEEDS A BREATH — '+mmss((S.acts.gcd-now())/1000));return;}
  const stake=gatorStake();
  if(S.dirty<stake){toast('NEED '+$$(stake)+' DIRTY TO ENTER');return;}
  modal('GATOR RACES · SWAMP TRACK',
    `<p class="led-line">STAKE ${$$(stake)} · PICK YOUR GATOR</p>
     <div class="g-bets">${GATORS.map((g,i)=>`
       <button class="g-bet" data-i="${i}">
         <span class="n"><span><span class="scarf" style="background:${SCARF_COLORS[i]}"></span>${g.name}</span><span class="odds">×${g.odds}</span></span>
         <span class="form">${gatorForm(GATOR_FORM[i])}</span>
       </button>`).join('')}</div>`,
    [{label:'WALK AWAY',cls:'btn-ghost',fn:closeModal}]);
  $id('modal-body').querySelectorAll('.g-bet').forEach(b=>{
    b.onclick=()=>runSwamp(+b.dataset.i,stake);
  });
}
function runSwamp(pick,stake){
  S.dirty-=stake; S.acts.races++; S.acts.gcd=now()+RACE_CD;
  const lanes=[10,33,56,79];
  modal('GATOR RACES · SWAMP TRACK',
    `<div id="swamp">
       <div id="swamp-cast">THEY'RE OFF!</div>
       ${GATORS.map((g,i)=>`
       <div class="sw-lane" style="top:${lanes[i]}%">
         <span class="tag">${g.name} ×${g.odds}</span>
         <span class="sw-gator ${i===pick?'sw-mine':''}" id="sw-${i}" style="bottom:2px">${GATOR_SVG(SCARF_COLORS[i])}</span>
       </div>`).join('')}
     </div>`,
    []);
  const prog=GATORS.map(()=>0);
  let leader=-1, slow=false;
  clearInterval(swampTO);
  swampTO=setInterval(()=>{
    const step=slow?170:110;
    let done=-1,maxP=0;
    GATORS.forEach((g,i)=>{
      if(prog[i]>=100)return;
      prog[i]+=3.4*Math.pow(1/g.odds,.65)*(0.4+Math.random()*1.2)*(slow?.45:1);
      maxP=Math.max(maxP,prog[i]);
      const el=$id('sw-'+i);
      if(el)el.style.left=Math.min(88,prog[i]*.88)+'%';
    });
    // commentary on lead change
    const front=prog.indexOf(Math.max(...prog));
    if(front!==leader&&prog[front]>12){
      leader=front;
      const quips=['HITS THE FRONT!','SURGES AHEAD!','TAKES THE LEAD!','IS HUNGRY TODAY!'];
      $id('swamp-cast').textContent=GATORS[front].name.toUpperCase()+' '+quips[Math.floor(Math.random()*quips.length)];
    }
    if(!slow&&maxP>80){slow=true;$id('swamp').classList.add('slowmo');$id('swamp-cast').textContent='PHOTO FINISH…';}
    GATORS.forEach((g,i)=>{ if(prog[i]>=100&&done<0)done=i; });
    if(done>=0){
      clearInterval(swampTO);
      const g=GATORS[done], won=pick===done;
      const pay=won?stake*g.odds*(has('yara')?1.5:1):0;
      if(won){S.dirty+=pay;S.acts.gwins++;payToast(pay);}
      window.Radio&&(won?Radio.sfx.fanfare():Radio.sfx.bust());
      setTimeout(()=>modal('GATOR RACES · RESULT', won
        ? `<p class="led-line" style="font-size:26px;color:var(--gold)">${g.name.toUpperCase()} TAKES THE SWAMP!</p>
           <p class="led-line">PAYOUT ${$$(pay)} DIRTY${has('yara')?' · YARA ×1.5':''}</p>`
        : `<p class="led-line" style="font-size:26px;color:#ff5d7a">${g.name.toUpperCase()} TAKES IT.</p>
           <p class="led-line">YOURS WENT FOR A SNACK.</p>`,
        [{label:'BACK TO THE SWAMP',cls:'btn-primary',fn:()=>{closeModal();checkQueens();updateBadges();}}]),700);
    }
  },110);
}

/* ----- SCRATCH CARDS · THE TICKET ----- */
const TKT_SYMS=[
  ['cherry','<circle cx="9" cy="15" r="5" fill="#ff2e55"/><circle cx="17" cy="17" r="5" fill="#c1122f"/><path d="M9 10 Q13 3 19 5 M17 12 Q19 6 19 5" stroke="#16e0bd" stroke-width="2" fill="none"/>'],
  ['lemon','<ellipse cx="12" cy="14" rx="9" ry="6.5" fill="#ffd977"/><path d="M3 14 l-2-1 2-1 M21 14 l2-1-2-1" stroke="#e0a72e" stroke-width="2"/>'],
  ['star','<path d="M12 3l2.4 5.4L20 9l-4 4 1 5.8L12 16l-5 2.8L8 13 4 9l5.6-.6z" fill="#58f7ff"/>'],
  ['bell','<path d="M12 4a6 6 0 0 1 6 6v4l2 2H4l2-2v-4a6 6 0 0 1 6-6z" fill="#ffc94a"/><circle cx="12" cy="19" r="2" fill="#e0a72e"/>'],
  ['diamond','<path d="M12 3l8 8-8 10-8-10z" fill="#16e0bd"/><path d="M4 11h16M12 3v18" stroke="#0d9c85" stroke-width="1"/>'],
  ['seven','<path d="M6 5h12l-7 15" stroke="#ff2e88" stroke-width="3.5" fill="none" stroke-linecap="round"/>'],
  ['palm','<path d="M12 21V10M12 10Q6 8 4 11Q8 9 12 10Q16 6 20 9Q15 8 12 10" stroke="#16e0bd" stroke-width="2.4" fill="none"/><path d="M10 21h4" stroke="#8a6f2f" stroke-width="2.4"/>'],
  ['snake','<path d="M5 18q4-6 8-3t7-6" stroke="#2ee06a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="20" cy="8" r="1.6" fill="#ffd977"/>'],
];
const TKT_WEIGHTS=[13,13,12,12,12,12,12,12];
const TKT_SVG=i=>`<svg viewBox="0 0 24 24" fill="none">${TKT_SYMS[i][1]}</svg>`;
let tkt=null;
function openScratch(){
  const cost=Math.max(500,Math.round(totalIncome()*30));
  if(S.dirty<cost){toast('NEED '+$$(cost)+' DIRTY');return;}
  S.dirty-=cost; S.acts.scratch++;
  const bag=[]; TKT_WEIGHTS.forEach((w,i)=>{for(let k=0;k<w;k++)bag.push(i);});
  const cells=Array.from({length:9},()=>bag[Math.floor(Math.random()*bag.length)]);
  const serial='N'+String(100000+Math.floor(Math.random()*900000));
  modal('SCRATCH · THE TICKET',
    `<div id="ticket">
       <div id="tkt-head"><span class="brand">PALMETTO PALMS LOTTO</span><span class="serial">${serial}</span></div>
       <div id="tkt-grid">${cells.map((c,i)=>`
         <div class="tcell" data-i="${i}">
           <div class="sym">${TKT_SVG(c)}</div>
           <canvas width="92" height="92"></canvas>
         </div>`).join('')}</div>
       <div id="tkt-pay"><span>CARD <b>${$$(cost)}</b></span><span>4 OF A KIND <b>×2.5</b></span><span>5+ <b>×30</b></span></div>
       <div id="tkt-result"></div>
       <div id="confetti"></div>
     </div>`,
    [{label:'REVEAL ALL',cls:'btn-ghost',fn:()=>{},keep:true},
     {label:'TOSS',cls:'btn-ghost',fn:()=>{tkt=null;closeModal();}}]);
  tkt={cells,cost,revealed:0,scratch:{}};
  const gridEl=[...$id('modal-body').querySelectorAll('.tcell')];
  const revealBtn=[...$id('modal-buttons').querySelectorAll('.btn')].find(b=>b.textContent==='REVEAL ALL');
  revealBtn.onclick=()=>gridEl.forEach(cel=>revealCell(cel,true));
  gridEl.forEach(cel=>{
    const cv=cel.querySelector('canvas'),ctx=cv.getContext('2d');
    paintFoil(ctx);
    let strokes=0;
    const scratchAt=e=>{
      const r=cv.getBoundingClientRect();
      const x=(e.clientX-r.left)*(92/r.width),y=(e.clientY-r.top)*(92/r.height);
      ctx.globalCompositeOperation='destination-out';
      ctx.beginPath();ctx.arc(x,y,15,0,7);ctx.fill();
      if(++strokes===7)revealCell(cel,false);
    };
    cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);tkt.down=true;scratchAt(e);});
    cv.addEventListener('pointermove',e=>{if(tkt.down)scratchAt(e);});
    cv.addEventListener('pointerup',()=>{if(tkt)tkt.down=false;});
  });
}
function paintFoil(ctx){
  ctx.globalCompositeOperation='source-over';
  const g=ctx.createLinearGradient(0,0,92,92);
  g.addColorStop(0,'#9aa7c4');g.addColorStop(.5,'#dfe7f5');g.addColorStop(1,'#8a97b5');
  ctx.fillStyle=g;ctx.fillRect(0,0,92,92);
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(10,70);ctx.lineTo(70,10);ctx.stroke();
  ctx.beginPath();ctx.moveTo(30,82);ctx.lineTo(82,30);ctx.stroke();
}
function revealCell(cel,auto){
  if(!tkt||cel.classList.contains('revealed'))return;
  cel.classList.add('revealed','pop');
  window.Radio&&Radio.sfx.tick();
  if(++tkt.revealed===9)finishTicket();
}
function finishTicket(){
  const {cells,cost}=tkt;
  const counts={};cells.forEach(c=>counts[c]=(counts[c]||0)+1);
  let best=0,bsym=-1;
  for(const [s,n] of Object.entries(counts)){if(n>best){best=n;bsym=+s;}}
  const mult=best>=5?30:best===4?2.5:0;
  const pay=cost*mult;
  const cellEls=[...$id('modal-body').querySelectorAll('.tcell')];
  // suspense: winners pulse one by one
  const winners=cellEls.filter((el,i)=>mult>0&&cells[i]===bsym);
  winners.forEach((el,i)=>setTimeout(()=>el.classList.add('winmatch'),400+i*380));
  setTimeout(()=>{
    const res=$id('tkt-result');
    if(pay>0){
      S.dirty+=pay;
      window.Radio&&Radio.sfx.chaChing();
      payToast(pay);
      if(mult>=30){confettiBurst();window.Radio&&Radio.sfx.fanfare();}
      // count-up
      const t0=performance.now();
      const tick=ts=>{
        const k=Math.min(1,(ts-t0)/900);
        if(res)res.innerHTML=`<span class="gold">${best}× ${TKT_SYMS[bsym][0].toUpperCase()} — ${$$(pay*k)} DIRTY!</span>`;
        if(k<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }else{
      res.textContent='NOTHING. THE HOUSE SENDS ITS REGARDS.';
    }
    tkt=null;
  },400+winners.length*380+500);
}
function confettiBurst(){
  const box=$id('confetti');if(!box)return;
  const colors=['#FF2E88','#16E0BD','#FFC94A','#58F7FF'];
  for(let i=0;i<56;i++){
    const p=document.createElement('i');
    p.style.left=Math.random()*100+'%';
    p.style.background=colors[i%4];
    p.style.animationDuration=(1.2+Math.random()*1.4)+'s';
    p.style.animationDelay=(Math.random()*.5)+'s';
    box.appendChild(p);
  }
}

/* ---------------- VICE PHONE ---------------- */
const SVGS={
  lock:'<svg class="ic" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  play:'<svg class="ic" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>',
  star:'<svg class="ic" viewBox="0 0 24 24"><path d="M12 3l2.4 5.4L20 9l-4 4 1 5.8L12 16l-5 2.8L8 13 4 9l5.6-.6z"/></svg>',
};
function showApp(name){
  document.querySelectorAll('#phone .scr').forEach(s=>s.classList.toggle('on',s.id==='scr-'+name));
  $id('scr-home').classList.toggle('on',name==='home');
  if(name!=='vault')stopVaultVideos();
  window.Radio&&Radio.sfx.tick();
  if(name==='queens')renderQueensApp();
  else if(name==='hustles')renderHustlesApp();
  else if(name==='vault')renderVaultApp();
  else if(name==='crew')renderCrewApp();
  else if(name==='legacy')renderLegacyApp();
  else if(name==='settings')renderSettingsApp();
}
function openPhone(app){
  document.body.classList.add('phone-open');
  window.Radio&&Radio.sfx.blip(760);
  showApp(app||'home');
}
function closePhone(){
  document.body.classList.remove('phone-open');
  showApp('home');
}
$id('btn-phone').onclick=()=>{ document.body.classList.contains('phone-open')?closePhone():openPhone(); };
$id('phone-scrim').onclick=closePhone;
document.querySelectorAll('#phone .app').forEach(a=>a.onclick=()=>showApp(a.dataset.app));
document.querySelectorAll('#phone [data-back]').forEach(b=>b.onclick=()=>showApp('home'));
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.body.classList.contains('phone-open')){closePhone();return;}
  if((e.key==='p'||e.key==='P')&&started&&!/INPUT|TEXTAREA/.test(e.target.tagName)){
    document.body.classList.contains('phone-open')?closePhone():openPhone();
  }
});
setInterval(()=>{ // live clock + greet
  const d=new Date();
  $id('p-clock').textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  $id('p-greet').textContent=(S.era===2?'PRESENT DAY':'1986')+' · '+districtOf(S.active).name;
},15000);

function updateBadges(){
  const set=(id,txt,cd)=>{ const b=$id('bdg-'+id); if(!b)return;
    if(txt==null){b.hidden=true;return;} b.hidden=false; b.textContent=txt; b.classList.toggle('cd',!!cd); };
  set('queens', QUEENS.filter(q=>!S.queens[q.id]&&q.unlock(S)).length||null);
  const scd=S.acts.scd-now(), gcd=S.acts.gcd-now(), rcd=Math.max(scd,gcd);
  set('hustles', rcd>0?mmss(rcd/1000):null, true);
  const cleared=Object.keys(S.vault).length;
  set('vault', cleared?cleared+'/12':null);
  set('crew', LIEUTS.filter(l=>!S.lieuts[l.id]&&l.unlock(S)).length||null);
  set('legacy', respectGain()>0?'+'+fmt(respectGain()):null);
  $id('phone-ping').hidden=!(QUEENS.some(q=>!S.queens[q.id]&&q.unlock(S))||respectGain()>0);
}

/* ---- QUEENS app ---- */
function renderQueensApp(){
  $id('queens-sub').textContent=Object.keys(S.queens).length+' / '+QUEENS.length;
  let html='<div class="q-grid">';
  for(const q of QUEENS){
    const mine=!!S.queens[q.id];
    html+=`<div class="q-card ${mine?'mine':'locked'}">
      <div class="q-art"><img src="${q.pic}" alt="" onerror="this.remove()">
        ${mine?'<span class="q-withyou">WITH YOU</span>':`<span class="q-lock">${SVGS.lock}</span>`}</div>
      <div class="q-plate"><div class="q-name">${mine?q.name:'???'}</div>
        <div class="q-title">${q.title.toUpperCase()}</div>
        ${mine?`<span class="q-perk">${q.fx}</span>`:`<span class="q-hint">${q.hint}</span>`}</div>
    </div>`;
  }
  html+='</div>';
  const cost=Math.max(1000,totalIncome()*60);
  const cd=Math.max(0,S.nightCd-now()), inspired=S.inspiredUntil>now();
  const frac=cd>0?cd/600000:0, CIRC=100.5;
  html+=`<div class="night">
    <div class="night-ring" title="Night on the Town cooldown">
      <svg class="ring" viewBox="0 0 40 40"><circle class="bgc" cx="20" cy="20" r="16" fill="none" stroke-width="4"/>
      <circle class="fgc" cx="20" cy="20" r="16" fill="none" stroke-width="4" stroke-dasharray="${CIRC}" stroke-dashoffset="${(CIRC*(1-frac)).toFixed(1)}"/></svg>
      <svg class="mid ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5"/></svg>
    </div>
    <div class="night-main"><div class="night-t">NIGHT ON THE TOWN</div>
      <div class="night-d" id="night-d">${inspired?'INSPIRED ×2 — LIVING IT UP':cd>0?'THE NIGHT NEEDS '+mmss(cd/1000):$$(cost)+' dirty → INSPIRED ×2 income · 60s'}</div></div>
    <button class="btn-gold" id="night-btn" ${inspired||cd>0?'disabled':''}>${inspired?'INSPIRED':cd>0?'WAIT':'TAKE HER OUT'}</button>
  </div>`;
  $id('queens-body').innerHTML=html;
  $id('night-btn').onclick=()=>{
    if(S.inspiredUntil>now()||S.nightCd>now())return;
    if(!Object.keys(S.queens).length){toast('THE QUEENS DON\'T RUN WITH STRANGERS');return;}
    if(S.dirty<cost){toast('NOT ENOUGH DIRTY CASH');return;}
    S.dirty-=cost; S.inspiredUntil=now()+60000; S.nightCd=now()+600000;
    const q=QUEENS.filter(x=>S.queens[x.id]);
    toast(NIGHT_LINES[q.length?Math.floor(Math.random()*q.length):0]);
    window.Radio&&Radio.sfx.fanfare();
    renderQueensApp();
  };
}

/* ---- HUSTLES app ---- */
function renderHustlesApp(){
  $id('hustles-sub').textContent=S.acts.races+' RUNS · '+(S.acts.swins+S.acts.gwins)+' WINS';
  const cards=[
    {id:'street',art:'art/hustles/street.jpg',ok:S.unlocked>=2,lock:'DOWNTOWN',name:'STREET RACES',
     d:`Five gears. Nail the shift. ×2${has('roxy')?' · ROXY ×2':''}`,
     cd:S.acts.scd-now(),cdTxt:'60s between runs',
     stats:[['STAKE',$$(actStake())],['WINS',S.acts.swins],['RUNS',S.acts.races]]},
    {id:'gator',art:'art/hustles/gator.jpg',ok:S.unlocked>=5,lock:'SWAMP GLADES',name:'GATOR RACES',
     d:`Four gators, one swamp. ×1.8–×7${has('yara')?' · YARA ×1.5':''}`,
     cd:S.acts.gcd-now(),cdTxt:'60s between bets',
     stats:[['STAKE',$$(gatorStake())],['WINS',S.acts.gwins]]},
    {id:'scratch',art:'art/hustles/scratch.jpg',ok:true,lock:'',name:'SCRATCH CARDS',
     d:'4 of a kind ×2.5 · 5+ ×30',cd:-1,cdTxt:'no cooldown',
     stats:[['CARD',$$(Math.max(500,Math.round(totalIncome()*30)))],['CARDS',S.acts.scratch]]},
  ];
  let html='';
  for(const c of cards){
    const ready=c.ok&&c.cd<=0;
    html+=`<div class="hs-card ${c.ok?'':'locked'}">
      <button class="go" data-go="${c.id}" ${c.ok?'':'disabled'}></button>
      <div class="hs-main">
        <div class="hs-art"><img src="${c.art}" alt="" onerror="this.remove()">
          ${c.ok?'':`<span class="q-lock">${SVGS.lock}</span>`}</div>
        <div class="hs-info">
          <div class="hs-name">${c.name}</div>
          <div class="hs-d">${c.d}</div>
          <div class="h-cd ${ready?'ready':''}" data-cd="${c.id}"><span class="t">${c.ok?(c.cd>0?mmss(c.cd/1000):'READY'):'LOCKED'}</span><span class="r">${c.ok?c.cdTxt:c.lock}</span></div>
        </div>
      </div>
      <div class="h-stats">${c.stats.map(s=>`<span class="h-stat">${s[0]} <b>${s[1]}</b></span>`).join('')}</div>
    </div>`;
  }
  $id('hustles-body').innerHTML=html;
  $id('hustles-body').querySelectorAll('[data-go]').forEach(b=>{
    b.onclick=()=>{ window.Radio&&Radio.sfx.tick();
      if(b.dataset.go==='street')openStreetRace();
      else if(b.dataset.go==='gator')openGatorRace();
      else openScratch();
    };
  });
}
/* live cooldown ticker for the hustles page */
function updateHustlesCd(){
  const scr=$id('scr-hustles');
  if(!scr||!scr.classList.contains('on'))return;
  scr.querySelectorAll('[data-cd]').forEach(el=>{
    if(el.dataset.cd==='scratch')return;
    const until=S.acts[el.dataset.cd==='street'?'scd':'gcd'];
    const left=until-now();
    const t=el.querySelector('.t');
    if(left>0){el.classList.remove('ready');t.textContent=mmss(left/1000);}
    else if(!el.classList.contains('ready')){el.classList.add('ready');t.textContent='READY';}
  });
}
setInterval(updateHustlesCd,1000);
function refreshHustlesIfOpen(){
  const scr=$id('scr-hustles');
  if(scr&&scr.classList.contains('on'))renderHustlesApp();
}

/* ---- VAULT app · TAPE WALL ---- */
function renderVaultApp(){
  const cleared=Object.keys(S.vault).length;
  $id('vault-sub').textContent=cleared+' / '+HEISTS.length;
  let html=`<div class="v-led">FIRST-CLEAR CINEMATICS · <b>${cleared} RECOVERED</b> · TAP A TAPE</div><div class="vt-grid">`;
  for(const h of HEISTS){
    const ok=!!S.vault[h.id];
    const d=districtOf(h.d);
    const poster=S.era===2&&d.img2?d.img2:d.img;
    if(ok){
      html+=`<div class="vt cleared">
        <div class="vart" data-vid="${h.vid}" title="Tap to play">
          <img src="${poster}" alt=""><span class="vplay">${SVGS.play}</span>
        </div>
        <div class="vlabel"><div class="kind">${KIND_TXT[h.kind]}</div><div class="tname">${h.name}</div></div>
        <span class="risk">${'★'.repeat(h.risk)}</span>
      </div>`;
    }else{
      html+=`<div class="vt locked">
        <div class="vart" style="cursor:default"></div>
        <div class="vlabel"><div class="kind">${KIND_TXT[h.kind]}</div><div class="tname">???</div></div>
        <span class="risk">${'★'.repeat(h.risk)}</span>
      </div>`;
    }
  }
  html+='</div>';
  $id('vault-body').innerHTML=html;
  // inline, control-free playback — one tape at a time
  $id('vault-body').querySelectorAll('.vt.cleared .vart').forEach(el=>{
    el.onclick=()=>{
      if(el.classList.contains('live')){ stopVaultVideos(); return; }
      stopVaultVideos();
      const card=el.closest('.vt');
      const v=document.createElement('video');
      v.src=el.dataset.vid; v.muted=true; v.loop=true; v.autoplay=true; v.playsInline=true;
      el.appendChild(v); v.play().catch(()=>{});
      el.classList.add('live'); card.classList.add('playing');
      window.Radio&&Radio.sfx.tick();
    };
  });
}
function stopVaultVideos(){
  document.querySelectorAll('#vault-body video').forEach(v=>{v.pause();v.remove();});
  document.querySelectorAll('#vault-body .vt.playing').forEach(c=>c.classList.remove('playing'));
  document.querySelectorAll('#vault-body .vart').forEach(a=>a.classList.remove('live'));
}

/* ---- CREW app ---- */
function renderCrewApp(){
  const hired=LIEUTS.filter(l=>has(l.id)).length;
  $id('crew-sub').textContent=hired+' / '+LIEUTS.length+' HIRED';
  let html='<div class="q-grid">';
  for(const l of LIEUTS){
    const mine=has(l.id);
    html+=`<div class="cw-card ${mine?'mine':'locked'}">
      <div class="cw-art"><img src="${l.pic}" alt="" onerror="this.remove()">
        ${mine?'<span class="cw-hired">HIRED</span>':`<span class="q-lock">${SVGS.lock}</span>`}</div>
      <div class="cw-plate">
        <div class="cw-name">${mine?l.name:'???'}</div>
        <div class="cw-role">${mine?l.role.toUpperCase():l.hint}</div>
        ${mine?`<div class="cw-fx">${l.em} ${l.fx}</div>`:''}
      </div>
    </div>`;
  }
  html+='</div>';
  $id('crew-body').innerHTML=html;
}

/* ---- LEGACY app · TROPHY WALL ---- */
const TRACK_ICONS={
  empire:'<svg class="ic ticon" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="11" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16"/></svg>',
  laundry:'<svg class="ic ticon" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 10v4M10 12h4"/></svg>',
  whisper:'<svg class="ic ticon" viewBox="0 0 24 24"><path d="M4 14q4-8 8-4t8-4M4 18q4-6 8-3t8-5"/></svg>',
  kick:'<svg class="ic ticon" viewBox="0 0 24 24"><path d="M13 3L5 13h5l-1 8 8-10h-5z"/></svg>',
};
function renderLegacyApp(){
  const gain=respectGain(), can=S.unlocked>=3;
  let html=`<div class="l-led">RESPECT <b>${fmt(S.respect)}</b> · PENDING <b>+${fmt(gain)}</b></div>`;
  html+=`<div class="bigscore"><img src="art/keyart/prestige.jpg" alt="">
    <div class="bs-line"><div class="bs-txt">THE BIG SCORE — retire to the Keys</div>
      <button class="btn-gold" id="retire-btn" ${can&&gain>0?'':'disabled'}>${can?`+${fmt(gain)} RP`:'NEED DOWNTOWN'}</button></div>
  </div>`;
  html+=`<div class="era-row">
    <div class="era-p live"><img src="art/districts/d3-downtown.jpg" alt=""><span class="et">1986 · LIVE</span></div>
    ${S.era>=2
      ?`<div class="era-p live"><img src="art/era2/d3.jpg" alt=""><span class="et gold">TODAY · LIVE</span></div>`
      :`<button class="era-p" data-era="2" ${S.respect<100?'disabled':''}><img src="art/era2/d3.jpg" alt=""><span class="et ${S.respect>=100?'gold':''}">${S.respect>=100?'ENTER · 100 RP':'100 RP'}</span></button>`}
    <div class="era-p locked"><img src="art/era3/skyline.jpg" alt=""><span class="et">2049 · SOON</span></div>
  </div>`;
  html+='<div class="l-grid">';
  for(const t of LEGACY){
    const lvl=S.spent[t.id], maxed=lvl>=t.max, cost=LEGACY_COSTS[lvl];
    html+=`<div class="l-card"><div class="l-name">${TRACK_ICONS[t.id]||SVGS.star} ${t.name}</div>
      <div class="l-pips">${Array.from({length:t.max},(_,i)=>`<i class="${i<lvl?'on':''}"></i>`).join('')}</div>
      <button class="l-buy" data-l="${t.id}" ${maxed||S.respect<cost?'disabled':''}>${maxed?'MAXED':cost+' RP'}</button>
    </div>`;
  }
  html+='</div>';
  html+='<div class="panel-title" style="font-size:14px;margin:12px 0 8px">MILESTONES</div>';
  html+='<div class="mile-grid">'+MILESTONES.map(m=>
    `<span class="mile-t ${S.mile[m.id]?'on':''}">${SVGS.star}${m.name}</span>`).join('')+'</div>';
  $id('legacy-body').innerHTML=html;
  $id('legacy-body').querySelectorAll('[data-l]').forEach(b=>{
    b.onclick=()=>{
      const id=b.dataset.l, t=LEGACY.find(x=>x.id===id), lvl=S.spent[id];
      if(lvl>=t.max)return;
      const cost=LEGACY_COSTS[lvl];
      if(S.respect<cost){toast('NOT ENOUGH RESPECT');return;}
      S.respect-=cost; S.spent[id]++; checkLieuts(); updateBadges(); renderLegacyApp();
      window.Radio&&Radio.sfx.chaChing();
    };
  });
  const eraBtn=$id('legacy-body').querySelector('[data-era]');
  if(eraBtn)eraBtn.onclick=()=>{
    if(S.era>=2||S.respect<100)return;
    S.respect-=100; S.era=2; applyDistrict(); updateLedger(); updateBadges(); save();
    window.Radio&&Radio.sfx.fanfare();
    modal('ERA II — PRESENT DAY',
      `<p>The neon faded. The towers grew glass. Palmetto City, present day.</p>
       <p class="led-line">INCOME ×5 EVERYWHERE · NEW SKYLINE</p>`,
      [{label:'WELCOME TO TODAY',cls:'btn-primary',fn:closeModal}]);
  };
  $id('retire-btn').onclick=()=>{ if(can&&gain>0)confirmPrestige(gain); else toast(can?'NOTHING TO RETIRE ON YET':'UNLOCK DOWNTOWN FIRST'); };
}

/* ---- SETTINGS app ---- */
function renderSettingsApp(){
  $id('settings-body').innerHTML=`
    <p class="s-note">Progress saves automatically in this browser. Station + mute live here too.</p>
    <div class="s-note" style="color:var(--teal)">EXPORT SAVE</div>
    <textarea id="exp" readonly>${JSON.stringify(S)}</textarea>
    <div class="s-note" style="color:var(--teal)">IMPORT SAVE</div>
    <textarea id="imp" placeholder="paste a save string…"></textarea>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn-gold" id="imp-btn" style="flex:1">IMPORT</button>
      <button class="btn btn-ghost" id="wipe-btn" style="flex:1">WIPE SAVE</button>
    </div>`;
  $id('imp-btn').onclick=()=>{
    try{
      const d=JSON.parse($id('imp').value);
      if(!d||d.v>SAVE_VER)throw 0;
      S=Object.assign(defaultState(),d); save(); location.reload();
    }catch(e){toast('THAT SAVE DON\'T ROLL');}
  };
  $id('wipe-btn').onclick=()=>modal('WIPE EVERYTHING?','<p>The empire. Gone. Like it never happened.</p>',
    [{label:'WIPE',cls:'btn-primary',fn:()=>{try{localStorage.removeItem(SAVE_KEY);}catch(e){} location.reload();}},
     {label:'KEEP',cls:'btn-ghost',fn:closeModal}]);
}

/* phone radio strip */
function wirePhoneRadio(){
  if(!window.Radio)return;
  $id('pr-prev').onclick=()=>{Radio.prev();S.radio.st=Radio.station;updateRadioFace();Radio.sfx.tick();};
  $id('pr-next').onclick=()=>{Radio.next();S.radio.st=Radio.station;updateRadioFace();Radio.sfx.tick();};
  $id('pr-mute').onclick=()=>{S.radio.muted=Radio.toggleMute();updateRadioFace();};
}

/* ---------------- MODAL ---------------- */
function modal(title,bodyHTML,buttons){
  $id('modal-title').textContent=title;
  $id('modal-body').innerHTML=bodyHTML;
  const bx=$id('modal-buttons'); bx.innerHTML='';
  for(const b of buttons||[]){
    const el=document.createElement('button');
    el.className='btn '+(b.cls||''); el.textContent=b.label;
    el.onclick=()=>{ if(!b.keep)closeModal(); if(b.fn)b.fn(); };
    bx.appendChild(el);
  }
  $id('modal').hidden=false;
}
function closeModal(){ $id('modal').hidden=true; }

function settingsModal(){} // (settings now live in the Vice Phone)

/* ---------------- INTRO / OFFLINE ---------------- */
function introModal(){
  modal('PALMETTO CITY, 1986',
    `<p>You've got rented shoes, a borrowed Slim Jim, and six blocks of bad decisions ahead of you.</p>
     <p style="margin-top:8px">Hotwire something. Any cash you make <b style="color:var(--pink)">dirty</b> stays
     <b style="color:var(--pink)">dirty</b> until you wash it. The cops are counting.</p>
     <p class="led-line" id="boost-line" style="margin-top:14px">HOTWIRING… <span id="boost-pct">0%</span></p>`,
    []);
  const bx=$id('modal-buttons');
  const b=document.createElement('button');
  b.className='btn btn-primary'; b.id='btn-boost'; b.style.fontSize='20px'; b.textContent='⚡ BOOST';
  bx.appendChild(b);
  let clicks=0;
  b.onclick=()=>{
    if(clicks<10){
      clicks++; S.dirty+=5; S.stats.dirty+=5;
      $id('boost-pct').textContent=(clicks*10)+'%';
      if(clicks===10){b.textContent='HIT THE STRIP →';$id('boost-line').textContent='ENGINE\'S LIVE. GO.';}
    }else{ closeModal(); toast('FIRST RACKET: BOOSTING CARS — $50'); }
  };
}
function offlineCheck(){
  const dt=clamp((now()-S.ts)/1000,0,OFFLINE_CAP_S);
  if(dt<OFFLINE_MIN_S)return;
  const offMult=has('vivienne')?1.5:1;
  const inc=totalIncome()*dt*offMult, wash=Math.min(totalWash()*dt,S.dirty+inc);
  S.dirty+=inc-wash; S.clean+=wash; S.stats.dirty+=inc; S.stats.clean+=wash;
  modal('WHILE YOU WERE GONE',
    `<p class="led-line">TIME AWAY: ${mmss(dt)}</p>
     <p class="led-line">CREWS BROUGHT IN: <span style="color:var(--pink)">${$$(inc)}</span> DIRTY</p>
     <p class="led-line">WASHED: <span class="gold">${$$(wash)}</span> CLEAN</p>
     <p style="margin-top:8px">Your lawyer answered the phone. The heat didn't move.</p>`,
    [{label:'BACK TO WORK',cls:'btn-primary',fn:closeModal}]);
}

/* ---------------- TICK ---------------- */
function sim(dt,t){
  const inc=totalIncome()*dt;
  if(inc>0){ S.dirty+=inc; S.stats.dirty+=inc; }
  const conv=Math.min(totalWash()*dt,S.dirty);
  if(conv>0){ S.dirty-=conv; S.clean+=conv; S.stats.clean+=conv; }
  const net=totalHeat()-decayRate();
  S.heat=clamp(S.heat+net*dt,0,100);
  if(S.heat>=100&&!S.tf){ S.tf=true; toast('TASK FORCE! INCOME −25% UNTIL HEAT < 50'); }
  if(S.tf&&S.heat<50){ S.tf=false; toast('THE TASK FORCE BACKED OFF'); }
  raidLogic(dt,t);
}
const tick={last:0};
setInterval(()=>{
  const t=now(); let dt=(t-(tick.last||t))/1000; tick.last=t;
  dt=clamp(dt,0,5);
  if(started){
    if(!isPaused())sim(dt,t);
    // state checks are pure + idempotent: they run even while the phone pauses the sim,
    // so "joined the crew" moments don't wait for you to close the menu
    checkLieuts(); checkQueens(); checkMilestones();
    updateCards(t); updateHUD(t); updateLedger(); updateHeistBtn(t); updateBadges();
  }
},TICK_MS);
setInterval(()=>{ if(started){ tickIdx=(tickIdx+1)%TICKER.length;
  const el=$id('ticker-text');
  el.style.animation='none'; void el.offsetWidth; el.style.animation='';
  el.textContent='DJ KRM · WPLM 103.5 — '+TICKER[tickIdx];
}},12000);
setInterval(()=>{ if(started)save(); },5000);
window.addEventListener('beforeunload',()=>{ if(started)save(); });

/* ---------------- BOOT ---------------- */
function startGame(cont){
  $id('title-screen').style.display='none';
  $id('game').hidden=false;
  started=true;
  // some browsers gate muted autoplay until a real gesture — retry on first interaction
  $id('game').addEventListener('pointerdown',()=>{ const v=$id('bg-video'); if(v.src&&v.paused)v.play().catch(()=>{}); },{once:false});
  applyDistrict(); renderUpgrades(); updateCards(now()); updateHUD(now()); updateLedger();
  tick.last=now();
  $id('ticker-text').textContent='DJ KRM · WPLM 103.5 — '+TICKER[0];
  if(cont)offlineCheck();
}
function boot(){
  // debug/testing hook (dev only — game never depends on it)
  window.VH={
    get S(){return S}, set S(v){S=v},
    get drill(){return drill},
    scheduleRaid, doRaid, openHeistPick, startHeist, strike, closeHeist, save,
    totalIncome, totalHeat, totalWash, doPrestige,
    checkQueens, openStreetRace, openGatorRace, openScratch, bribeCost,
    get Radio(){return window.Radio;},
  };
  if(reducedMotion()){ $id('title-video').hidden=true; $id('title-poster').hidden=false; }
  // radio: restore prefs, wire UI, start audio on the first real interaction
  if(window.Radio){
    Radio.setMuted(S.radio.muted);
    Radio.setStation(S.radio.st);
    wireRadio(); wirePhoneRadio();
    document.addEventListener('pointerdown',()=>Radio.init(),{once:true});
  }
  // district video: show only while truly playing, fall back to the painted still otherwise
  const bgv=$id('bg-video');
  bgv.addEventListener('playing',()=>bgv.classList.add('show'));
  bgv.addEventListener('pause',()=>bgv.classList.remove('show'));
  bgv.addEventListener('error',()=>bgv.classList.remove('show'));
  const has=load();
  if(has){ $id('btn-continue').hidden=false; $id('btn-wipe').hidden=false; }
  $id('btn-continue').onclick=()=>startGame(true);
  $id('btn-wipe').onclick=()=>modal('WIPE EVERYTHING?','<p>The empire. Gone. Like it never happened.</p>',
    [{label:'WIPE',cls:'btn-primary',fn:()=>{try{localStorage.removeItem(SAVE_KEY);}catch(e){} location.reload();}},
     {label:'KEEP',cls:'btn-ghost',fn:closeModal}]);
  $id('btn-new').onclick=()=>{
    if(has){
      modal('START OVER?','<p>You\'ve got a save on ice. Starting fresh wipes it.</p>',
        [{label:'FRESH START',cls:'btn-primary',fn:()=>{
           S=defaultState(); S.heistReadyAt=now()+HEIST_FIRST_S*1000;
           startGame(false); introModal();
         }},
         {label:'KEEP MY SAVE',cls:'btn-ghost',fn:closeModal}]);
    }else{
      S=defaultState(); S.heistReadyAt=now()+HEIST_FIRST_S*1000;
      startGame(false); introModal();
    }
  };
}
boot();
