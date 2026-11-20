/* Heist interval comparison: 5min vs 2min vs 0 (no cooldown) */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const ctx={}; vm.createContext(ctx);
let code='';
for(const name of ['RACKETS','DISTRICTS']){
  const m=src.match(new RegExp(`const ${name}=\\[[\\s\\S]*?\\n\\];`));
  code+=m[0]+'\n';
}
vm.runInContext(code+';var __cfg={RACKETS:RACKETS,DISTRICTS:DISTRICTS};',ctx);
const RACKETS=ctx.__cfg.RACKETS, DISTRICTS=ctx.__cfg.DISTRICTS;

const mile=n=>n>=500?100:n>=100?10:n>=50?4:n>=25?2:1;
function visible(unlocked,r){
  const owned=id=>r[id]?r[id].n:0;
  const out=[];
  for(const d of DISTRICTS){
    if(d.id>unlocked)break;
    const list=RACKETS.filter(x=>x.d===d.id);
    for(let i=0;i<list.length;i++){
      if(i===0||owned(list[i].id)>0||owned(list[i-1].id)>=10)out.push(list[i]);
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
    else wash+=rk.lau*n*mile(n)*(lieuts.betty?1.25:1);
    if(rk.front)continue;
    heat+=rk.heat*Math.sqrt(n);
  }
  if(r.security)heat*=.7;
  return{income,heat,wash};
}
function simulate(heistInterval,label){
  let unlocked=1,dirty=50,clean=0,heat=0,tf=false;
  const r={},lieuts={};
  let raidLosses=0,raids=0,heistProfit=0,raceProfit=0;
  let lastRaid=-1e9,nextHeist=180,nextRace=0;
  let kmrHired=false,salHired=false;
  let maxIncome=0;
  const unlockTimes={};
  const SIM_H=24,DT=1;
  for(let t=0;t<=SIM_H*3600;t+=DT){
    const st=stats(unlocked,r,lieuts);
    let income=st.income*(tf?.75:1);
    dirty+=income*DT;
    maxIncome=Math.max(maxIncome,st.income);
    const conv=Math.min(st.wash*DT,dirty);
    dirty-=conv;clean+=conv;
    if(unlocked>=2&&!kmrHired){lieuts.kmr=true;kmrHired=true;}
    if(raids>=1&&!salHired){lieuts.sal=true;salHired=true;}
    if(unlocked>=4)lieuts.rosa=true;
    if(unlocked>=5)lieuts.ana=true;
    if(unlocked>=2)lieuts.solana=true;
    if(unlocked>=3)lieuts.camille=true;
    const decay=.5+(lieuts.kmr?.5:0)+heat*.025;
    heat=Math.max(0,Math.min(100,heat+(st.heat-decay)*DT));
    if(heat>=100)tf=true;else if(tf&&heat<50)tf=false;
    // raids
    if(t-lastRaid>25){
      let fire=false;
      if(heat>=100)fire=t-lastRaid>=45;
      else if(heat>=70)fire=t-lastRaid>=45+Math.random()*45;
      else if(heat>=40)fire=Math.random()<(heat-40)/2500*DT;
      if(fire){lastRaid=t;raids++;const st2=dirty*(.2+Math.random()*.2);dirty-=st2;raidLosses+=st2;}
    }
    // HEIST
    if(heistInterval>=0&&t>=nextHeist){
      nextHeist=t+Math.max(heistInterval,10); // min 10s so interval=0 doesn't fire every tick
      const base=Math.max(300,income*90);
      const riskMult=4,perf=.6;
      const bust=Math.random()<.15;
      if(bust){heat=Math.min(100,heat+25);}
      else{
        const pay=base*riskMult*perf*(lieuts.camille?1.25:1);
        dirty+=pay;heistProfit+=pay;
      }
    }
    // side hustles
    if(income>10&&t>=nextRace){
      const stake=Math.max(500,income*60);
      if(dirty>=stake){
        nextRace=t+60;dirty-=stake;
        if(Math.random()<.55){dirty+=stake*2;raceProfit+=stake;}
        else raceProfit-=stake;
      }
    }
    // district unlocks
    while(unlocked<6){
      const d=DISTRICTS.find(x=>x.id===unlocked+1);
      if(clean>=d.unlock){clean-=d.unlock;unlocked++;unlockTimes[d.name]=(t/3600).toFixed(1)+'h';}
      else break;
    }
    // buy: most advanced affordable, but pause to save for fronts
    let saveFor=null,saveCost=0;
    for(const rk of visible(unlocked,r)){
      if(!rk.front)continue;
      const n=r[rk.id]?r[rk.id].n:0;
      if(n<1){saveFor=rk;saveCost=rk.cost*Math.pow(1.15,n);break;}
    }
    if(saveFor&&dirty>=saveCost){
      dirty-=saveCost;
      r[saveFor.id]={n:1,lockUntil:0};
    }else if(!saveFor||dirty<saveCost*.4){
      // normal buying when not saving hard for a front
      let best=null,bc=0;
      for(const rk of visible(unlocked,r)){
        const n=r[rk.id]?r[rk.id].n:0;
        const c=rk.cost*Math.pow(1.15,n);
        if(dirty>=c&&c>bc){bc=c;best=rk;}
      }
      if(best){
        const cur=r[best.id]?r[best.id].n:0;
        dirty-=rk_cost(best,cur);
        r[best.id]={n:cur+1,lockUntil:0};
      }
    }
    // bribes
    if(heat>70){
      const bc2=Math.max(400,income*45)*.5;
      if(dirty>=bc2){dirty-=bc2;heat=Math.max(0,heat-20);}
    }
  }
  function rk_cost(rk,cur){return rk.cost*Math.pow(1.15,cur);}
  const st=stats(unlocked,r,lieuts);
  const totalEarned=heistProfit+raceProfit+st.income*86400;
  return{name:label,unlockTimes,endIncome:st.income,raidLosses,raids,heistProfit,raceProfit,
         endDirty:dirty,endClean:clean,heat,maxIncome,totalEarned};
}
function fmt(n){
  if(n>=1e33)return(n/1e33).toFixed(1)+'Dc';if(n>=1e30)return(n/1e30).toFixed(1)+'No';
  if(n>=1e27)return(n/1e27).toFixed(1)+'Oc';if(n>=1e24)return(n/1e24).toFixed(1)+'Sp';
  if(n>=1e21)return(n/1e21).toFixed(1)+'Sx';if(n>=1e18)return(n/1e18).toFixed(1)+'Qi';
  if(n>=1e15)return(n/1e15).toFixed(1)+'Qa';if(n>=1e12)return(n/1e12).toFixed(1)+'T';
  if(n>=1e9)return(n/1e9).toFixed(1)+'B';if(n>=1e6)return(n/1e6).toFixed(1)+'M';
  if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toFixed(0);
}

console.log('HEIST INTERVAL COMPARISON — 24h GRINDER (balanced + hustles)\n');
const intervals=[
  [300,'5 min (original)'],
  [120,'2 min (new)'],
  [0,'no cooldown'],
];
const results=[];
for(const [iv,label] of intervals){
  const r=simulate(iv,label);
  results.push(r);
}
for(const r of results){
  console.log('━'.repeat(62));
  console.log(`  Heist every: ${r.name}`);
  console.log(`  end income/s : $${fmt(r.endIncome)}`);
  console.log(`  heist profit : $${fmt(r.heistProfit)} (${(r.heistProfit/r.totalEarned*100).toFixed(1)}% of earnings)`);
  console.log(`  race profit  : $${fmt(r.raceProfit)}`);
  console.log(`  unlocks      : ${Object.entries(r.unlockTimes).map(([k,v])=>k.split(' ')[0]+'='+v).join('  ')||'stuck D1'}`);
  console.log(`  dirty / clean: $${fmt(r.endDirty)} / $${fmt(r.endClean)}`);
  console.log(`  raids: ${r.raids} · lost $${fmt(r.raidLosses)} · heat: ${r.heat.toFixed(0)}`);
}
console.log('\n'+'━'.repeat(62));
if(results[0]&&results[1]){
  const ratio=(results[1].endIncome/results[0].endIncome).toFixed(2);
  console.log(`\n  2min vs 5min: income ×${ratio}`);
  console.log(`  heist share: 5min=${(results[0].heistProfit/results[0].totalEarned*100).toFixed(1)}% → 2min=${(results[1].heistProfit/results[1].totalEarned*100).toFixed(1)}%`);
}
if(results[0]&&results[2]){
  console.log(`  no-CD vs 5min: income ×${(results[2].endIncome/results[0].endIncome).toFixed(2)}`);
}
