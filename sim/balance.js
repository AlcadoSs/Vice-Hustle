/* ============================================================
   VICE HUSTLE — sim/balance.js · balance simulator (Node)
   Pulls RACKETS/DISTRICTS straight from game.js (vm) so numbers
   never drift, mirrors the live formulas, and races playstyles.
   Run: node sim/balance.js
   ============================================================ */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');

/* ---- extract live config from game.js ---- */
const src=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const ctx={}; vm.createContext(ctx);
let code='';
for(const name of ['RACKETS','DISTRICTS']){
  const m=src.match(new RegExp(`const ${name}=\\[[\\s\\S]*?\\n\\];`));
  if(!m)throw new Error('cannot extract '+name+' from game.js');
  code+=m[0]+'\n';
}
vm.runInContext(code+';var __cfg={RACKETS:RACKETS,DISTRICTS:DISTRICTS};',ctx);
const RACKETS=ctx.__cfg.RACKETS, DISTRICTS=ctx.__cfg.DISTRICTS;

/* ---- exact math mirrors (keep in sync with game.js) ---- */
const mile=n=>n>=500?100:n>=100?10:n>=50?4:n>=25?2:1;
const costOf=(r,cur,k)=>r.cost*Math.pow(1.15,cur)*(Math.pow(1.15,k)-1)/.15;
const cost1=(r,cur)=>costOf(r,cur,1);
function visible(unlocked,r){
  const owned=id=>r[id]?r[id].n:0;
  const out=[];
  for(const d of DISTRICTS){
    if(d.id>unlocked)break;
    const list=RACKETS.filter(x=>x.d===d.id);
    for(let i=0;i<list.length;i++){
      const rk=list[i];
      if(i===0||owned(rk.id)>0||owned(list[i-1].id)>=10)out.push(rk);
    }
  }
  return out;
}
function stats(unlocked,r,lieuts){
  let income=0,heat=0,wash=0;
  for(const rk of visible(unlocked,r)){
    const n=r[rk.id]?r[rk.id].n:0;
    if(n===0)continue;
    let dm=1;
    if(rk.d===4&&lieuts.rosa)dm*=1.5;
    if(rk.d===5&&lieuts.ana)dm*=1.4;
    if(!rk.front)income+=rk.inc*n*mile(n)*dm;
    else{
      let w=rk.lau*n*mile(n);
      if(lieuts.betty)w*=1.25;
      wash+=w;
    }
    if(rk.front)continue;
    heat+=rk.heat*Math.sqrt(n);
  }
  if(r.security)heat*=.7;
  return{income,heat,wash};
}

/* ---- simulation harness ---- */
const SIM_H=24, DT=1; // 24 hours, 1s steps
function simulate(name,policy,log){
  let unlocked=1, dirty=50, clean=0, heat=0, tf=false;
  const r={}, lieuts={};
  let raidLosses=0, raids=0, heistProfit=0, raceProfit=0, scratchProfit=0;
  let lastRaid=-1e9, nextHeist=180, nextRace=0, bribes=0;
  const unlockTimes={};
  let kmrHired=false, salHired=false, tfSeen=false;
  // policy hooks may keep state
  const p=policy();
  for(let t=0;t<=SIM_H*3600;t+=DT){
    const st=stats(unlocked,r,lieuts);
    let income=st.income*(tf?.75:1);
    dirty+=income*DT;
    const conv=Math.min(st.wash*DT,dirty);
    dirty-=conv; clean+=conv;
    // auto lieuts (free, unavoidable)
    if(unlocked>=2&&!kmrHired){lieuts.kmr=true;kmrHired=true;}
    if(raids>=1&&!salHired){lieuts.sal=true;salHired=true;}
    if(unlocked>=4)lieuts.rosa=true;
    if(unlocked>=5)lieuts.ana=true;
    if(unlocked>=2)lieuts.solana=true;   // queen: bribes half
    if(unlocked>=3)lieuts.camille=true;  // queen: heist ×1.25
    // heat
    const decay=.5+(lieuts.kmr?.5:0)+heat*.025;
    heat=Math.max(0,Math.min(100,heat+(st.heat-decay)*DT));
    if(heat>=100)tf=true; else if(tf&&heat<50)tf=false;
    // raids
    if(t-lastRaid>25){
      let fire=false;
      if(heat>=100)fire=true;
      else if(heat>=70)fire=Math.random()<DT/67;
      else if(heat>=40)fire=Math.random()<(heat-40)/2500*DT;
      if(fire){
        lastRaid=t; raids++;
        let stolen=dirty*(.2+Math.random()*.2);
        if(lieuts.sal&&Math.random()<1/20){/* hourly approx: skip */} else dirty-=stolen;
        raidLosses+=stolen;
        const pool=visible(unlocked,r).filter(rk=>!rk.front&&(r[rk.id]?r[rk.id].n:0)>0);
        if(pool.length){
          const lock=pool[(Math.random()*pool.length)|0];
          r[lock.id]=r[lock.id]||{n:0,lockUntil:0};
          if(lieuts.ghost){} else r[lock.id].lockUntil=t+60;
        }
      }
    }
    for(const id in r){if(r[id].lockUntil&&r[id].lockUntil<=t)r[id].lockUntil=0;}
    // heists
    if(p.heists&&t>=nextHeist){
      nextHeist=t+300;
      const base=Math.max(300,income*90);
      const riskMult=4, perf=.6;                 // decent player, picks a MED card
      const bust=Math.random()<.15;
      if(bust){heat=Math.min(100,heat+25);}
      else{
        const pay=base*riskMult*perf*(lieuts.camille?1.25:1);
        dirty+=pay; heistProfit+=pay;
      }
    }
    // side hustles (mirrors post-tune game.js: 60s cooldowns, stake 60s income, ×2.0)
    if(p.races&&income>10&&t>=nextRace){
      const stake=Math.max(500,income*60);
      if(dirty>=stake){
        nextRace=t+60;
        dirty-=stake;
        const win=Math.random()<.55;             // decent shift-timing player
        if(win){const pay=stake*2;dirty+=pay;raceProfit+=pay-stake;}
        else raceProfit-=stake;
      }
    }
    if(p.scratch&&income>10&&Math.random()<DT/120){
      const cost=Math.max(500,income*30);
      if(dirty>=cost){
        dirty-=cost;
        scratchProfit+=scratchEV()*cost-cost;
        dirty+=Math.max(0,scratchEV()*cost);
      }
    }
    // district unlock
    while(unlocked<6){
      const d=DISTRICTS.find(x=>x.id===unlocked+1);
      if(clean>=d.unlock){clean-=d.unlock;unlocked++;unlockTimes[d.name]=(t/60).toFixed(1);}
      else break;
    }
    // purchase policy (≤1 buy/tick)
    const buy=p.decide({t,unlocked,r,dirty,clean,income,heat,stats:st});
    if(buy){
      const cur=r[buy.id]?r[buy.id].n:0;
      const c=cost1(buy,cur);
      if(dirty>=c){dirty-=c;r[buy.id]={n:cur+1,lockUntil:0};}
    }
    // bribes
    if(p.bribeAt&&heat>p.bribeAt){
      const bc=Math.max(400,income*45)*.5;
      if(dirty>=bc){dirty-=bc;heat=Math.max(0,heat-20);bribes++;}
    }
    if(log&&t%(3600)===0&&t>0)log.push({h:t/3600,name,unlocked,income:st.income,heat,dirty,clean,raidLosses});
  }
  const st=stats(unlocked,r,lieuts);
  return{name,unlockTimes,endIncome:st.income,endWash:st.wash,raidLosses,raids,heistProfit,raceProfit,scratchProfit,bribes,
         endDirty:dirty,endClean:clean,heat};
}
function scratchEV(){
  const w=[13,13,12,12,12,12,12,12],N=98;   // mirrors post-tune game.js: 8 symbols, 4→×2.5, 5+→×30
  if(!scratchEV.c){
    let acc=0;const K=2e5;
    for(let q=0;q<K;q++){
      const cnt=new Array(8).fill(0);
      for(let i=0;i<9;i++){let x=Math.random()*N,s=0;while(x>=w[s]){x-=w[s];s++;}cnt[s]++;}
      const best=Math.max(...cnt);
      acc+=best>=5?30:best===4?2.5:0;
    }
    scratchEV.c=acc/K;
  }
  return scratchEV.c;
}

/* ---- strategies ---- */
function mostAdvanced(s,skipFronts){
  // real-player idle policy: push the most advanced visible racket you can afford,
  // but pause spending to bank for the district front (the clean-money gate)
  if(!skipFronts){
    for(const rk of visible(s.unlocked,s.r)){
      if(!rk.front)continue;
      const n=s.r[rk.id]?s.r[rk.id].n:0;
      if(n===0){
        const c=cost1(rk,0);
        if(s.dirty>=c)return rk;
        if(s.dirty>c*.45)return null;   // saving up
      }
    }
  }
  let best=null,bc=0;
  for(const rk of visible(s.unlocked,s.r)){
    if(skipFronts&&rk.front)continue;
    const n=s.r[rk.id]?s.r[rk.id].n:0, c=cost1(rk,n);
    if(s.dirty>=c&&c>bc){bc=c;best=rk;}
  }
  return best;
}
const STRATEGIES=[
  {name:'GREEDY (no fronts, no bribes)',mk:()=>({decide:s=>mostAdvanced(s,true)})},
  {name:'BALANCED (fronts incl. + bribes>70)',mk:()=>({decide:s=>mostAdvanced(s,false),bribeAt:70})},
  {name:'LAUNDERER (fronts to 10 first + bribes>50)',mk:()=>({decide:s=>{
     for(const rk of visible(s.unlocked,s.r)){
       if(!rk.front)continue;
       const n=s.r[rk.id]?s.r[rk.id].n:0;
       if(n<10&&s.dirty>=cost1(rk,n))return rk;
     }
     return mostAdvanced(s,false);
   },bribeAt:50})},
  {name:'GRINDER (balanced + heists + races + scratch)',mk:()=>({decide:s=>mostAdvanced(s,false),bribeAt:70,heists:true,races:true,scratch:true})},
];

/* ---- run ---- */
console.log('VICE HUSTLE — 24h active-play balance sim');
console.log('(math mirrored from game.js; config extracted live)\n');
const results=[];
for(const st of STRATEGIES)results.push(simulate(st.name,st.mk));
for(const r of results){
  console.log('━'.repeat(72));
  console.log(r.name);
  console.log('  end income/s : $'+fmt(r.endIncome)+'   wash/s: $'+fmt(r.endWash));
  console.log('  final cash   : dirty $'+fmt(r.endDirty)+' · clean $'+fmt(r.endClean));
  console.log('  unlocks (min): '+Object.entries(r.unlockTimes).map(([k,v])=>k.split(' ')[0]+'='+v).join('  ')||'—');
  console.log('  raids        : '+r.raids+' · lost $'+fmt(r.raidLosses)+' to raids · bribes: '+r.bribes);
  if(r.heistProfit)console.log('  heist profit : $'+fmt(r.heistProfit));
  if(r.raceProfit)console.log('  race profit  : $'+fmt(r.raceProfit));
  if(r.scratchProfit)console.log('  scratch profit: $'+fmt(r.scratchProfit));
  console.log('  heat at end  : '+r.heat.toFixed(1));
}
console.log('\nScratch card EV (exact MC): ×'+scratchEV().toFixed(3)+' per card');
function fmt(n){
  if(n>=1e33)return(n/1e33).toFixed(1)+'Dc';if(n>=1e30)return(n/1e30).toFixed(1)+'No';
  if(n>=1e27)return(n/1e27).toFixed(1)+'Oc';if(n>=1e24)return(n/1e24).toFixed(1)+'Sp';
  if(n>=1e21)return(n/1e21).toFixed(1)+'Sx';if(n>=1e18)return(n/1e18).toFixed(1)+'Qi';
  if(n>=1e15)return(n/1e15).toFixed(1)+'Qa';if(n>=1e12)return(n/1e12).toFixed(1)+'T';
  if(n>=1e9)return(n/1e9).toFixed(1)+'B';if(n>=1e6)return(n/1e6).toFixed(1)+'M';
  if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toFixed(0);
}
module.exports={simulate};
