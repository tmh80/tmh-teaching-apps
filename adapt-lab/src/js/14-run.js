/* Adapt Lab model · the evolving population: seasons, births, deaths by cause, events, predators and food
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
const {clamp,rng,hashStr,n01,gauss,vary,BIOMES,getB,scoresFor,seasonHaz,lethalOf,vulCore,predK,PRED_BANK,INVADERS,isSwimmer}=M;
/* Drawing and page updates are not part of the model. The shell can listen with AdaptModel.runHooks.<name> = run => {...}
   Names: newRun, paused, continued, finished, foodChain, evLog, evGrid. */
const HOOKS=M.runHooks=M.runHooks||{};
function hook(n){if(HOOKS[n])HOOKS[n](RUN)}
const renderFoodChain=()=>hook('foodChain'),renderEvLog=()=>hook('evLog'),renderEvGrid=()=>hook('evGrid');
const performance=globalThis.performance||{now:()=>Date.now()};
const RM=false; // reduced motion only matters to the old animated path
/* ================= EVOLVING RUN ================= */
const YEARS=40,SEASON_SEC=.9,HARSH_YEARS=new Set([4,19,33]);
const EVO_A=['size','insul','fat','ears','legLen','tail','wingSize','finSize','eyes','waterSave','salt'];
const EVO_P=['height','leafSize','wax','rootDepth','rootSpread','stemStore','salt'];
const TLAB={size:'Body size',insul:'Fur or feather thickness',fat:'Amount of fat',ears:'Ear size',legLen:'Leg length',tail:'Tail length',wingSize:'Wing size',finSize:'Fin size',eyes:'Eye size',waterSave:'Water saving',salt:'Salt handling',height:'Height',leafSize:'Leaf size',wax:'Wax on leaves',rootDepth:'Root depth',rootSpread:'Root spread',stemStore:'Water stored in stem'};
function relevantKeys(kind,t,B){
  if(kind==='plant')return EVO_P.filter(k=>(k!=='leafSize'||t.leaf==='broad')&&(k!=='stemStore'||t.store==='water')&&(k!=='salt'||B.aquatic));
  return EVO_A.filter(k=>({insul:t.cov==='fur'||t.cov==='feathers',fat:t.fatWhere!=='none',ears:t.cov==='fur',legLen:t.legs!=='0',wingSize:t.wings!=='none',finSize:t.fins==='fins',waterSave:!B.aquatic,salt:!!B.aquatic})[k]??true);
}
const defaultCfg=()=>({nat:'none',threats:new Set(),actions:new Set(),rand:false,freq:25,planned:[]});
const THREATS={habitat:['Habitat loss','Farms, roads and towns replace wild land, leaving less space and food.'],pollution:['Pollution','Chemicals and plastic poison the land and water.'],climate:['Climate change','Burning fossil fuels warms the planet a little more every year.'],invasive:['Invasive species','People bring in new predators and competitors from other places.'],hunting:['Hunting & collecting','People hunt the biggest animals, or cut down and collect plants.']};
const ACTIONS={protect:['Protected area','A nature reserve: stops most habitat loss and hunting.',4],corridor:['Wildlife corridors','Strips of habitat link wild areas, giving more space.',3],clean:['Pollution laws & clean-up','Cuts most of the pollution.',3],remove:['Remove invasive species','Trap and remove the new predators and competitors.',3],breed:['Captive breeding','Zoos and seed banks release extra young in years 12–25.',4],emissions:['Cut emissions','Slows warming, but only after a delay.',5]};
const BUDGET=10;
const CAUSES_A={pred:['Caught by predators','#c4473a','caught'],cold:['Too cold','#3c7fc0','too cold'],heat:['Overheated','#e08a2c','overheated'],food:['Starved','#8a6a3a','starved'],water:['Dried out or salt stress','#2a9d9b','dried out'],breath:['Could not breathe','#7a5bd3','no air'],fire:['Wildfire','#d2552a','burned'],flood:['Flood','#2f5fb8','swept away'],disease:['Disease','#a0508f','disease'],habitat:['No space left','#d4a21c','no space'],pollution:['Pollution','#6b7a2a','polluted'],hunt:['Hunted by people','#34343c','hunted'],old:['Old age & disease','#8b8f99','old age']};
const CAUSES_P={graze:['Eaten by grazers','#c4473a','eaten'],cold:['Frost damage','#3c7fc0','frost'],heat:['Scorched','#e08a2c','scorched'],water:['Dried out or salt damage','#2a9d9b','dried out'],light:['Shaded or blown down','#6b8f3e','no light'],fire:['Wildfire','#d2552a','burned'],flood:['Flood','#2f5fb8','washed away'],disease:['Disease','#a0508f','disease'],habitat:['No space left','#d4a21c','no space'],pollution:['Pollution','#6b7a2a','polluted'],hunt:['Cut down or collected','#34343c','cut down'],old:['Old age & disease','#8b8f99','old age']};

/* ---- events ---- */
const EVENTS={
 drought:{name:'Drought',dur:3,desc:'Very little rain for 3 generations. Water and food run short.',sel:'saving water, eating many foods'},
 desert:{name:'Desertification',perm:true,ramp:3,land:true,desc:'The land slowly dries out and turns into sandy desert. Permanent.',sel:'sandy colour (against hunters that use sight), saving water, coping with heat'},
 iceage:{name:'Ice age',perm:true,ramp:6,desc:'The climate cools by about 9 °C and snow covers the land. Permanent.',sel:'thick fur or fat, a bigger body, white colour on snow'},
 warming:{name:'Climate warms',perm:true,ramp:12,desc:'Temperatures slowly rise by 6 °C over 12 generations. Permanent.',sel:'losing heat, thinner fur, darker colours where the snow melts'},
 heatwave:{name:'Heatwave',dur:1,desc:'One very hot generation: about 8 °C hotter.',sel:'losing heat, being active at night, hiding in burrows'},
 fire:{name:'Wildfire',dur:3,shock:'fire',land:true,desc:'A fire sweeps through. Cover and food take 3 generations to grow back.',sel:'hiding in burrows, escaping fast, flying'},
 flood:{name:'Flood',dur:1,shock:'flood',land:true,desc:'Rivers burst their banks for one generation.',sel:'swimming, flying, climbing'},
 newpred:{name:'New predator arrives',perm:true,desc:'A predator from another place moves in to stay.',sel:'the defence that works against that predator'},
 disease:{name:'Disease outbreak',dur:2,shock:'disease',desc:'A new disease spreads for 2 generations. Groups catch it faster.',sel:'disease resistance (some individuals are naturally resistant)'},
 famine:{name:'Food crash',dur:2,animal:true,desc:'The main food source crashes for 2 generations.',sel:'eating many kinds of food, storing fat, a smaller body'},
 volcano:{name:'Volcanic winter',dur:2,desc:'Ash blocks the sun: about 6 °C colder and plants grow slowly.',sel:'coping with cold, storing food or fat'}
};
const EVENTS_PLANT={newpred:{name:'New grazer arrives',desc:'A grazing animal from another place moves in to stay.',sel:'thorns, bitter taste, growing tall'},disease:{desc:'A plant disease spreads for 2 generations.'},fire:{sel:'bulbs underground, dying back, big seeds'},flood:{sel:'deep roots'}};
function evInfo(id,kind){const e=EVENTS[id];return kind==='plant'&&EVENTS_PLANT[id]?{...e,...EVENTS_PLANT[id]}:e}
function evAllowed(id,kind,B){const e=EVENTS[id];if(e.land&&B.aquatic)return false;if(id==='desert'&&B.id==='desert')return false;if(id==='drought'&&B.salt)return false;if(e.animal&&kind!=='animal')return false;return true}

let RUN=null,rafId=null,lastTs=0;const TUNE={g:1,q:.25,bexp:1,lag:4,cap:200,starve:.5,dd:0,h:.2};
function runKey(ORG,biome,tab,CFG){const open=tab!=='cons';return JSON.stringify([ORG.kind,ORG.t,biome,tab==='cons',open?CFG.planned:CFG.nat,[...CFG.threats].sort(),[...CFG.actions].sort()])}
function curGen(){return RUN?Math.floor(Math.max(0,RUN.si)/4):0}
function evActive(si){return RUN.evs.filter(e=>si>=e.s0&&si<e.s1)}
function envFor(year,si){
  const B0=BIOMES[RUN.bk];const B={...B0,temps:B0.temps.map(x=>[...x]),match:{...B0.match}};
  const ramp=(st,len)=>clamp((year-st)/len,0,1);let dT=0,K=1;const hz={pollution:0,hunt:0};const A=RUN.actions,T=RUN.threats;
  B.regrow=1;B.tint=null;B.shock=null;
  if(RUN.open){
    const blend=(a,b,r)=>a*(1-r)+b*r;
    evActive(si).forEach(e=>{const age=(si-e.s0)/4;const r=e.perm?clamp((age+.25)/EVENTS[e.id].ramp,0,1):1;
      if(e.id==='drought'){B.dry=Math.min(1,B.dry+.45);B.pdry=Math.min(1,B.pdry+.5);dT+=2;B.regrow*=.35;B.plantF*=.6;B.preyF*=.75;B.harsh=Math.min(1,B.harsh+.15);B.tint=['#c9a85a',.28]}
      if(e.id==='desert'){const D=BIOMES.desert;B.temps=B.temps.map(([d,n],i)=>[blend(d,D.temps[(i+(B0.hs===1?0:2))%4][0],.7*r),blend(n,D.temps[(i+(B0.hs===1?0:2))%4][1],.7*r)]);
        for(const c in B.match)B.match[c]=blend(B.match[c],D.match[c],r);if(r>.5)B.gname='sand';
        B.dry=blend(B.dry,Math.max(B.dry,.62),r);B.pdry=blend(B.pdry,Math.max(B.pdry,.95),r);B.plantF*=1-.45*r;B.preyF*=1-.3*r;B.cover=blend(B.cover,.12,r);B.open=true;B.regrow*=1-.4*r;B.frost=blend(B.frost,.2,r);B.heatP=blend(B.heatP,1,r);B.tintD=r}
      if(e.id==='iceage'){dT-=9*r;if(!B.aquatic){for(const c in B.match)B.match[c]=blend(B.match[c],BIOMES.tundra.match[c],.85*r);if(r>.5)B.gname='snow and ice';B.tintI=r}
        B.plantF*=1-.35*r;B.preyF*=1-.2*r;B.regrow*=1-.35*r;B.harsh=Math.min(1,B.harsh+.2*r);B.frost=Math.min(1.2,B.frost+.6*r);B.heatP*=1-.8*r}
      if(e.id==='warming'){dT+=6*r;B.heatP=Math.min(1.2,B.heatP+.35*r);B.frost*=1-.5*r}
      if(e.id==='heatwave'){dT+=8;B.heatP=Math.min(1.3,B.heatP+.6);B.tint=['#e8a050',.18]}
      if(e.id==='fire'){const k=age<1?.15:age<2?.45:.75;B.regrow*=k;B.cover*=k;B.plantF*=.5+.5*k;if(age<.5)B.shock='fire';B.tint=age<1?['#3a2a22',.42]:['#6a5a3a',.18*(3-age)]}
      if(e.id==='flood'){if(si===e.s0||si===e.s0+1)B.shock='flood';B.tint=['#4f86c6',.3];B.regrow*=.7}
      if(e.id==='disease')B.shock='disease';
      if(e.id==='famine'){B.regrow*=.3;B.plantF*=.6;B.preyF*=.6}
      if(e.id==='volcano'){dT-=6;B.frost=Math.min(1.2,B.frost+.35);B.heatP*=.5;B.regrow*=.4;B.comp=Math.min(1.4,B.comp+.4);B.tint=['#6d6a66',.3]}
      if(e.id==='newpred'&&RUN.org.kind==='plant')B.graze=Math.min(1.4,B.graze+.4*clamp((age+.25)/3,0,1));
    });
  }else{
  if(!RUN.human&&RUN.nat!=='none'&&year>=15){const r=ramp(15,12);
    if(RUN.nat==='warmer')dT+=6*r;if(RUN.nat==='colder')dT-=6*r;
    if(RUN.nat==='drier'){B.dry=Math.min(1,B.dry+.4*r);B.pdry=Math.min(1,B.pdry+.5*r);B.plantF*=1-.35*r;B.harsh=Math.min(1,B.harsh+.2*r)}
    if(RUN.nat==='predators'){B.pd+=.35*r;B.pn+=.35*r}}
  if(RUN.human&&year>=10){const r=ramp(10,8);
    if(T.has('habitat'))K*=1-.65*r*(A.has('protect')?.35:1)*(A.has('corridor')?.7:1);
    if(A.has('corridor'))K*=1.1;
    if(T.has('pollution'))hz.pollution=.07*r*(B.aquatic?1.6:1)*(A.has('clean')?.2:1);
    if(T.has('climate')){const rate=A.has('emissions')?(year<20?.2:.06):.2;dT+=Math.min(A.has('emissions')?3:6,(year-10)*rate)}
    if(T.has('invasive')){const f=r*(A.has('remove')?.3:1);B.pd+=.3*f;B.pn+=.3*f;B.plantF*=1-.3*f;B.preyF*=1-.3*f;B.graze=Math.min(1.3,B.graze+.3*f)}
    if(T.has('hunting'))hz.hunt=r*(A.has('protect')?.25:1)}}
  if(dT){B.temps=B.temps.map(([d,n])=>B.aquatic?[Math.max(1,d+dT*.7),Math.max(1,n+dT*.7)]:[d+dT,n+dT]);
    if(B.id==='tundra'&&dT>0&&!B.tintD){const f=clamp(dT/5,0,1);const M2={brown:.9,grey:.8,green:.6,sandy:.55,black:.45,white:.2,silver:.45,blue:.2,orange:.1};for(const c in B.match)B.match[c]=B.match[c]*(1-f)+M2[c]*f;if(f>.5)B.gname='bare, snowless ground'}}
  B.dT=dT;B.K=K;B.hz=hz;return B;
}
function scoreInd(p){p.sc=scoresFor({kind:RUN.org.kind,t:p.t},RUN.env)}
const needOf=t=>.55+.9*n01(t.size);
function harshYearOf(y){return RUN.open?(y%14===4):HARSH_YEARS.has(y)}
/* newRun(org, biomeId, {cons, cfg, speed}) starts a run. cons:true is the Conservation mode (40 years, human threats); otherwise the open mode (events, predators, a pause every 50 generations). */
function newRun(ORG,biome,opts){opts=opts||{};const tab=opts.cons?'cons':'run';const CFG={...defaultCfg(),...(opts.cfg||{})};CFG.threats=new Set(CFG.threats);CFG.actions=new Set(CFG.actions);
  const key=runKey(ORG,biome,tab,CFG);const isA=ORG.kind==='animal';const open=tab!=='cons';
  RUN={key,org:JSON.parse(JSON.stringify(ORG)),bk:biome,human:tab==='cons',open,nat:CFG.nat,threats:new Set(CFG.threats),actions:new Set(CFG.actions),
    R:rng(hashStr(key)),t:0,si:-1,pop:[],events:[],effects:[],labels:[],puffs:[],deaths:open?[]:Array.from({length:YEARS},()=>({})),hist:[],traitHist:[],born:0,died:0,
    playing:false,speed:opts.speed||1,done:false,nid:0,Kbase:isA?60:70,ext:null,mig:false,hib:false,
    swim:isA&&isSwimmer(ORG.t,BIOMES[biome]),envYear:-1,envSig:'',
    evs:[],evlog:[],queue:[],planned:open?CFG.planned.map(x=>({...x})):[],stopAt:50,paused:false,rand:CFG.rand,freq:CFG.freq,blockStart:0,fHist:[],pHist:[],F:1,sat:1,satY:[1],preds:[],predLog:[]};
  RUN.keys=EVO_A.concat(EVO_P).filter(k=>k in ORG.t&&(isA?EVO_A:EVO_P).includes(k));
  if(open&&isA){RUN.preds=PRED_BANK[biome].map(j=>({...j,P:1}));
    const rich=ORG.t.diet==='plants'?BIOMES[biome].plantF:ORG.t.diet==='meat'?BIOMES[biome].preyF*.6:(BIOMES[biome].plantF+BIOMES[biome].preyF)/2*.85;
    RUN.rich=clamp(rich,.3,1.2);RUN.Kbase=Math.round(60*RUN.rich/needOf(ORG.t))}
  RUN.env=envFor(0,0);RUN.envSig=envSig(RUN.env);RUN.envYear=0;
  const n0=isA?20:24;for(let i=0;i<n0;i++){const p=spawn(null,vary(ORG.t,RUN.keys,RUN.R,7),true);if(open)p.res=clamp(Math.round(15+gauss(RUN.R)*10),0,100)}
  recordYear();startSeason(0);RUN.hist.push(aliveCount());RUN.fHist.push(100);
  RUN.endHtml=null;RUN.summary=null;hook('newRun');return RUN;
}
function envSig(B){return JSON.stringify([B.temps,B.match,B.pd,B.pn,B.plantF,B.preyF,B.dry,B.graze,B.cover,B.comp,B.frost])}
function aliveCount(){return RUN.pop.filter(p=>!p.dying).length}
function spawn(parent,t,adult){
  const R=RUN.R;let x,y;
  if(parent){x=clamp(parent.x+(R()-.5)*.14,.04,.96);y=clamp(parent.y+(R()-.5)*.12,.05,.95)}else{x=.05+R()*.9;y=.05+R()*.9}
  const ind={id:RUN.nid++,t,x,y,tx:x,ty:y,age:adult?1:0,seed:Math.floor(R()*1e6),flip:R()<.5,res:15};scoreInd(ind);RUN.pop.push(ind);return ind;
}
function childOf(a,b){const R=RUN.R;const t={...(R()<.5?a.t:b.t)};RUN.keys.forEach(k=>{t[k]=clamp(Math.round((a.t[k]+b.t[k])/2+gauss(R)*6),0,100)});
  if(RUN.org.kind==='animal'&&R()<.06){const NB={white:['silver','grey'],silver:['white','grey','blue'],grey:RUN.open?['silver','brown','black','white','sandy']:['silver','brown','black','white'],sandy:['brown','grey','orange'],brown:['sandy','grey','black'],black:['grey','brown'],green:['brown','grey'],blue:['silver','grey','green'],orange:['sandy','brown']};const nb=NB[t.color];t.color=nb[Math.floor(R()*nb.length)]}return t}
function fitness(p){return Math.max(1,(RUN.org.kind==='animal'?p.sc.food:p.sc.light)*(RUN.open?1-.0015*(p.res||0):1))}
function pickParent(alive,tot){let r=RUN.R()*tot;for(const p of alive){r-=fitness(p);if(r<=0)return p}return alive[alive.length-1]}

/* ---- food-chain position and predation (open mode) ---- */
function canHunt(j,size,t){const[lo,hi]=j.prey;let v=size<lo?Math.exp(-(((lo-size)/10)**2)):size>hi?Math.exp(-(((size-hi)/10)**2)):1;
  if(t.diet==='meat'&&(size>j.size*(j.pack?1.25:.9)||t.size>=j.size*.9))v=0;
  if(t.diet==='both'&&size>j.size*(j.pack?1.5:1.2))v=0;return v<.03?0:v}
function predVul(p,j,B){return vulCore(p.t,p.sc,j,B,p.age<1?p.t.size*.5:p.t.size)}
function foodChain(t,bk){const lvl=t.diet==='plants'?2:t.diet==='both'?2.5:3;const BB=getB(bk);const bank=BB.bank||PRED_BANK[BB.id]||[];
  const adult=bank.filter(j=>canHunt(j,t.size,t)>0),young=bank.filter(j=>!canHunt(j,t.size,t)&&canHunt(j,t.size*.5,t)>0);
  const apex=t.diet!=='plants'&&!adult.length;return{lvl:apex?4:lvl,apex,adult,young}}
function fcLabel(fc){return fc.apex?'Apex predator · top of the food chain':{2:'Herbivore · level 2 (primary consumer)',2.5:'Omnivore · level 2–3',3:'Carnivore · level 3 (secondary consumer)'}[fc.lvl]}
function updatePreds(N){const Nrel=Math.min(2.6,N/Math.max(1,RUN.Kbase));const g=curGen();
  RUN.preds.forEach(j=>{const fc=canHunt(j,RUN.org.t.size,RUN.org.t)||canHunt(j,RUN.org.t.size*.5,RUN.org.t)*.5;const w=j.w*Math.min(1,fc*1.2);
    const food=(1-w)+w*Nrel;const was=j.P;
    if(j.P>0)j.P=j.P*Math.exp(.6*(food-j.P));else if(food>.7&&RUN.R()<.08&&!j.gone)j.P=.15;
    if(j.inv&&j.P<1)j.P=Math.min(food,j.P+.15);
    if(j.P<.04&&was>=.04){j.P=0;RUN.predLog.push({g,txt:`The ${j.name.toLowerCase()} died out here: not enough prey left.`});addLog(`${j.name} died out: not enough prey`)}
    else if(j.P>0&&was===0){RUN.predLog.push({g,txt:`The ${j.name.toLowerCase()} came back as prey recovered.`});addLog(`${j.name} returned`)}
    j.P=Math.min(2.5,j.P)})}
function addLog(txt){RUN.evlog.push({g:curGen()+1,txt})}
function triggerEvent(id,si){
  const e=EVENTS[id];const isA=RUN.org.kind==='animal';if(!evAllowed(id,RUN.org.kind,BIOMES[RUN.bk]))return false;
  if(e.perm&&RUN.evs.some(x=>x.id===id&&id!=='newpred'))return false;
  if(!e.perm&&RUN.evs.some(x=>x.id===id&&si<x.s1))return false;
  const ev={id,s0:si,s1:e.perm?Infinity:si+e.dur*4};RUN.evs.push(ev);
  const info=evInfo(id,RUN.org.kind);let txt=info.name;
  if(id==='newpred'&&isA){const base=INVADERS[RUN.bk];const n=RUN.preds.filter(j=>j.inv).length;const j={...base,id:base.id+n,P:.3,name:base.name};RUN.preds.push(j);txt=`New predator: ${j.name}`;renderFoodChain()}
  if(id==='famine')RUN.F*=.25;
  if(id==='fire')RUN.F*=.35;
  if(id==='drought')RUN.F*=.7;
  RUN.evlog.push({g:Math.floor(si/4)+1,txt,id});renderEvLog();if(!RUN.instant)renderEvGrid();
  RUN.banner={txt:info.name,t0:performance.now()};return true}
function startSeason(si){
  RUN.si=si;const year=Math.floor(si/4),s=si%4;const R=RUN.R;const o=RUN.org;const isA=o.kind==='animal';
  if(RUN.open){
    if(s===0&&year>0&&RUN.rand&&R()<1/RUN.freq){const ids=Object.keys(EVENTS).filter(id=>evAllowed(id,o.kind,BIOMES[RUN.bk])&&!(EVENTS[id].perm&&id!=='newpred'&&RUN.evs.some(x=>x.id===id)));if(ids.length)triggerEvent(ids[Math.floor(R()*ids.length)],si)}
    RUN.planned.forEach(p=>{if(!p.done&&year>=p.gen-1&&s===0){p.done=true;triggerEvent(p.id,si)}});
    while(RUN.queue.length)triggerEvent(RUN.queue.shift(),si);
  }
  if(RUN.open||year!==RUN.envYear){RUN.envYear=year;const B=envFor(year,si);const sig=envSig(B);RUN.env=B;if(sig!==RUN.envSig){RUN.envSig=sig;RUN.pop.forEach(p=>{if(!p.dying)scoreInd(p)})}}
  const B=RUN.env;const rep=RUN.pop.find(p=>!p.dying);const hy=harshYearOf(year);
  RUN.mig=!!(isA&&rep&&rep.sc.ts[s].away);RUN.hib=!!(isA&&rep&&rep.sc.ts[s].dormant);
  RUN.pop.forEach(p=>{p.age+=.25});
  const K=Math.max(4,Math.round(RUN.Kbase*B.K));RUN.K=K;
  const alive0=RUN.pop.filter(p=>!p.dying);
  const foodModel=RUN.open&&isA;
  // food stock: regrows, gets eaten; shortage = starvation
  let sat=1;
  if(foodModel){const harsh=s===B.hs;const sf=harsh?.25:1.25;const g=TUNE.g*B.regrow;
    RUN.F=clamp(RUN.F+g/4*sf*RUN.F*(1-RUN.F)+.008*B.regrow,0,1);
    const demand=alive0.reduce((a,p)=>a+needOf(p.t)*(p.age<1?.6:1)*(RUN.hib&&p.sc.ts[s].dormant?.25:RUN.mig&&p.sc.ts[s].away?.2:1),0)*TUNE.q/(60*RUN.rich)/4;
    const get=Math.min(demand,RUN.F*TUNE.h);sat=demand>0?clamp(get/demand,0,1):1;RUN.F=clamp(RUN.F-get,0,1);RUN.sat=sat;RUN.satY.push(sat)}
  if(foodModel&&s===0&&year>0)updatePreds(alive0.length);
  if(s===0&&year>0){
    const alive=alive0;const N=alive.length;
    if(RUN.human&&RUN.actions.has('breed')&&year>=12&&year<=25)for(let i=0;i<4;i++)RUN.events.push({time:si+.05+R()*.3,type:'born',captive:true});
    if(N>=2){const cf=isA?{none:3.2,some:2.2,lots:1.5}[o.t.care]:{small:3,large:1.8}[o.t.seedSize];
      const tot=alive.reduce((a,p)=>a+fitness(p),0);const meanF=tot/N;
      let nb;
      if(foodModel){const last=RUN.satY.slice(-TUNE.lag);const fs=last.reduce((a,b)=>a+b,0)/last.length;const cap=TUNE.cap;
        nb=Math.round(N*cf*(meanF/100)*Math.pow(fs,TUNE.bexp)*Math.max(0,1-N/cap)*Math.max(0,1-TUNE.dd*N/RUN.Kbase)*(.85+R()*.3));nb=Math.max(0,Math.min(nb,cap-N))}
      else{const rate=cf*(meanF/100)*Math.max(0,1-N/K);nb=Math.round(N*rate*(.85+R()*.3));nb=Math.max(0,Math.min(nb,K-N))}
      for(let i=0;i<nb;i++){const a=pickParent(alive,tot),b=pickParent(alive,tot);RUN.events.push({time:si+.08+R()*.5,type:'born',a,b})}}
    RUN.satY=RUN.satY.slice(-1);
    if(!foodModel&&N>K){const extra=N-K;const sh=[...alive].sort(()=>R()-.5).slice(0,extra);sh.forEach(p=>RUN.events.push({time:si+.1+R()*.6,type:'die',id:p.id,cause:'habitat'}))}
  }
  const juvM=isA?{none:1.8,some:1.15,lots:.55}[o.t.care]:{small:1.8,large:.75}[o.t.seedSize];
  const usePred=RUN.open&&isA&&RUN.preds.length;
  let escN=0;
  RUN.pop.forEach(p=>{if(p.dying)return;
    const hz=seasonHaz(p.sc,B,null,s,hy);
    let pj=null;
    if(usePred){const away=p.sc.ts[s].away||p.sc.ts[s].dormant;let tot=0;pj=RUN.preds.map(j=>{if(!j.P)return 0;const r=predVul(p,j,B);const x=j.P*predK(B)*r.v*(hy&&s===B.hs?1.2:1)*(away?.3:1);tot+=x;return x});hz.pred=tot;
      if(!RUN.instant&&escN<2&&R()<.06){const k=Math.floor(R()*RUN.preds.length);const j=RUN.preds[k];if(j.P){const r=predVul(p,j,B);if(r.v>0&&r.why&&r.why.length&&r.why[0][0]>.3){escN++;RUN.events.push({time:si+.1+R()*.8,type:'esc',id:p.id,pi:k,why:r.why[0][1]})}}}}
    if(foodModel&&sat<1)hz.food=(hz.food||0)+(1-sat)*TUNE.starve*(1.3-.6*p.sc.food/100)*(needOf(p.t)/1)*(p.age<1?1.3:1);
    if(B.shock==='fire'){if(isA){const M=p.sc.M;hz.fire=.6*(p.t.escape==='hide'?1-.7*B.burrow:1)*(1-.5*M.move)*(M.fly>.5?.3:1)*(RUN.swim?0:1)}
      else hz.fire=.5*(p.t.store==='bulb'?.3:1)*(p.t.season==='dormant'?.5:1)*(p.t.form==='tree'&&n01(p.t.height)>.6?.6:1)*(p.t.seedSize==='large'?.8:1)}
    if(B.shock==='flood'){if(isA){const M=p.sc.M;hz.flood=.45*(1-.85*M.swim)*(M.fly>.5?.2:1)*(p.t.escape==='hide'?1.3:1)}else hz.flood=p.t.water==='aquatic'?0:.3*(1-.5*n01(p.t.rootDepth))}
    if(B.shock==='disease'){const de=evActive(si).find(e=>e.id==='disease');hz.disease=(de&&si-de.s0>=4?.22:.45)*Math.pow(1-(p.res||0)/100,3)*(isA&&p.t.social==='herd'?1.4:1)*(aliveCount()>RUN.Kbase*1.2?1.25:1)}
    if(p.age<1)['pred','cold','heat','food','water','graze'].forEach(k=>{if(hz[k]!=null&&hz[k]<1)hz[k]=Math.min(.95,hz[k]*(k==='pred'&&usePred?Math.min(juvM,1.3):juvM))});
    if(B.hz.pollution)hz.pollution=B.hz.pollution;
    if(B.hz.hunt){const v=isA?.12*clamp((n01(p.t.size)-.25)/.5,0,1.3):.14*n01(p.t.height)*(p.t.form==='tree'||p.t.form==='succulent'?1:.4);if(v>0)hz.hunt=B.hz.hunt*v}
    const keys=Object.keys(hz);const tot=keys.reduce((a,k)=>a+hz[k],0);const lethalK=keys.find(k=>hz[k]>=1);
    const pDie=lethalK?1:1-keys.reduce((a,k)=>a*(1-Math.min(.95,hz[k])),1);
    if(R()<pDie){let r=R()*tot,c=keys[0];for(const k of keys){r-=hz[k];if(r<=0){c=k;break}}if(lethalK)c=lethalK;
      let pi=null;if(c==='pred'&&pj){let q=R()*pj.reduce((a,b)=>a+b,0);for(let i=0;i<pj.length;i++){q-=pj[i];if(q<=0){pi=i;break}}}
      RUN.events.push({time:si+.12+R()*.7,type:'die',id:p.id,cause:c,pi})}});
  RUN.events.sort((a,b)=>a.time-b.time);
}
function fireEvent(ev,instant){
  const C=RUN.org.kind==='animal'?CAUSES_A:CAUSES_P;
  if(ev.type==='born'){
    if(ev.captive){spawn(null,vary(RUN.org.t,RUN.keys,RUN.R,7),false);RUN.born++;return}
    if(!ev.a||!ev.b)return;const c=spawn(ev.a.dying?null:ev.a,childOf(ev.a,ev.b),false);if(RUN.open)c.res=clamp(Math.round(((ev.a.res||0)+(ev.b.res||0))/2+gauss(RUN.R)*6),0,100);RUN.born++;return}
  const p=RUN.pop.find(q=>q.id===ev.id);if(!p||p.dying)return;
  if(ev.type==='esc'){if(instant||RUN.effects.length>=3||RM)return;const j=RUN.preds[ev.pi];if(!j)return;
    RUN.effects.push({type:'atk',j,target:p,t0:performance.now(),fromL:RUN.R()<.5,esc:ev.why,dur:1700});return}
  const year=Math.floor(ev.time/4);if(RUN.open){while(RUN.deaths.length<=year)RUN.deaths.push({})}
  const yi=RUN.open?year:Math.min(YEARS-1,year);RUN.deaths[yi][ev.cause]=(RUN.deaths[yi][ev.cause]||0)+1;RUN.died++;
  if(instant){RUN.pop=RUN.pop.filter(q=>q!==p);return}
  p.dying={cause:ev.cause,t0:performance.now()};
  if(RUN.labels.length<7&&!(RUN.open&&ev.cause==='pred'&&ev.pi!=null))RUN.labels.push({x:p.x,y:p.y,text:C[ev.cause][2],col:C[ev.cause][1],t0:performance.now()});
  if(RUN.open&&ev.cause==='pred'&&ev.pi!=null&&RUN.preds[ev.pi]){
    if(RUN.effects.length<3&&!RUN.mig&&!RM){p.dying.held=true;RUN.effects.push({type:'atk',j:RUN.preds[ev.pi],target:p,t0:performance.now(),fromL:p.x>.5,dur:1700})}
    else if(RUN.labels.length<7)RUN.labels.push({x:p.x,y:p.y,text:C.pred[2],col:C.pred[1],t0:performance.now()})}
  else if((ev.cause==='pred'||ev.cause==='graze')&&!RUN.mig&&RUN.effects.length<3)RUN.effects.push({type:ev.cause,target:p,t0:performance.now(),fromL:p.x>.5,air:RUN.org.kind==='animal'&&!BIOMES[RUN.bk].aquatic&&RUN.org.t.activity!=='night'&&RUN.R()<.6});
}
function recordYear(){const alive=RUN.pop.filter(p=>!p.dying);const m={};RUN.keys.forEach(k=>{m[k]=alive.length?alive.reduce((a,p)=>a+p.t[k],0)/alive.length:null});
  m.res=alive.length?alive.reduce((a,p)=>a+(p.res||0),0)/alive.length:null;
  const cc={};alive.forEach(p=>{cc[p.t.color]=(cc[p.t.color]||0)+1});m._color=cc;m._n=alive.length;RUN.traitHist.push(m);
  if(RUN.open&&RUN.preds.length)RUN.pHist.push(RUN.preds.filter(j=>canHunt(j,RUN.org.t.size,RUN.org.t)||canHunt(j,RUN.org.t.size*.5,RUN.org.t)).reduce((a,j,_,A)=>a+j.P/A.length,0))}
function maxSeasons(){return RUN.open?RUN.stopAt*4:YEARS*4}
function advance(dSeasons,instant){
  RUN.instant=instant;
  const end=Math.min(maxSeasons(),RUN.t+dSeasons);
  while(RUN.t<end&&!RUN.done){
    const nb=Math.floor(RUN.t)+1;const stop=Math.min(end,nb);
    while(RUN.events.length&&RUN.events[0].time<=stop){const ev=RUN.events.shift();RUN.t=Math.max(RUN.t,ev.time);fireEvent(ev,instant)}
    RUN.t=stop;
    if(RUN.t>=nb){if(instant)RUN.pop=RUN.pop.filter(p=>!p.dying);RUN.hist.push(aliveCount());if(RUN.open&&RUN.org.kind==='animal')RUN.fHist.push(Math.round(RUN.F*100));if(nb%4===0)recordYear();
      const yr=Math.floor((nb-1)/4);
      if(aliveCount()===0&&!(RUN.human&&RUN.actions.has('breed')&&yr<25)){RUN.ext=yr+1;RUN.done=true;break}
      if(!RUN.open&&nb>=YEARS*4){RUN.done=true;break}
      if(RUN.open&&nb>=RUN.stopAt*4){startSeason(nb);RUN.paused=true;break}
      startSeason(nb)}
  }
  RUN.instant=false;
  if(RUN.done)finishRun();else if(RUN.paused)pauseRun();
}
function meanT(){const alive=RUN.pop.filter(p=>!p.dying);if(!alive.length)return null;const t={...RUN.org.t};RUN.keys.forEach(k=>{t[k]=Math.round(alive.reduce((a,p)=>a+p.t[k],0)/alive.length)});
  if(RUN.org.kind==='animal'){const cc={};alive.forEach(p=>{cc[p.t.color]=(cc[p.t.color]||0)+1});t.color=Object.entries(cc).sort((a,b)=>b[1]-a[1])[0][0]}return t}
function causeTotals(from,to){const tot={};RUN.deaths.slice(from,to).forEach(d=>Object.entries(d).forEach(([k,n])=>tot[k]=(tot[k]||0)+n));return tot}
function blockSummary(g0,g1){const C=RUN.org.kind==='animal'?CAUSES_A:CAUSES_P;const tot=causeTotals(g0,g1);
  const main=Object.entries(tot).filter(([k])=>k!=='old').sort((a,b)=>b[1]-a[1]).slice(0,2);
  const H=RUN.hist.slice(g0*4,g1*4+1);const mn=Math.min(...H),mx=Math.max(...H);
  const a=RUN.traitHist[g0]||RUN.traitHist[0],b=RUN.traitHist[Math.min(g1,RUN.traitHist.length-1)];const li=[];
  li.push(`Population: <b>${aliveCount()}</b> now · lowest <b>${mn}</b> · highest <b>${mx}</b>.`);
  if(main.length)li.push(`Main causes of death: ${main.map(([k,n])=>`<b>${C[k][0].toLowerCase()}</b> (${n})`).join(', ')}.`);
  const evs=RUN.evlog.filter(e=>e.g>g0&&e.g<=g1);li.push(evs.length?`Events: ${evs.map(e=>`${e.txt} (gen ${e.g})`).join(' · ')}.`:'No big events this time.');
  if(a&&b){const ch=relevantKeys(RUN.org.kind,RUN.org.t,BIOMES[RUN.bk]).filter(k=>a[k]!=null&&b[k]!=null&&Math.abs(b[k]-a[k])>=5).sort((x,y)=>Math.abs(b[y]-a[y])-Math.abs(b[x]-a[x])).slice(0,3);
    if(ch.length)li.push(`Biggest trait changes: ${ch.map(k=>`${TLAB[k].toLowerCase()} ${b[k]>a[k]?'↑':'↓'} ${Math.round(a[k])}→${Math.round(b[k])}%`).join(', ')}.`);
    if(a.res!=null&&b.res!=null&&Math.abs(b.res-a.res)>=8&&RUN.evs.some(e=>e.id==='disease'&&e.s0<g1*4))li.push(`Disease resistance ${b.res>a.res?'rose':'fell'} from <b>${Math.round(a.res)}%</b> to <b>${Math.round(b.res)}%</b>.`)}
  return li}
function pauseRun(){RUN.mig=false;RUN.hib=false;const g0=RUN.blockStart,g1=RUN.stopAt;RUN.summary={g0,g1,lines:blockSummary(g0,g1)};hook('paused')}
function contRun(){if(!RUN||RUN.done)return;RUN.paused=false;RUN.blockStart=RUN.stopAt;RUN.stopAt+=50;RUN.summary=null;hook('continued')}
function finishRun(){RUN.mig=false;RUN.hib=false;
  const C=RUN.org.kind==='animal'?CAUSES_A:CAUSES_P;const tot=causeTotals(0);
  const main=Object.entries(tot).filter(([k])=>k!=='old').sort((a,b)=>b[1]-a[1])[0];const n=aliveCount();
  const L0=(()=>{try{return lethalOf(scoresFor(RUN.org,RUN.bk),RUN.bk,RUN.org)}catch(e){return null}})();
  const lastEv=RUN.open&&RUN.ext?RUN.evlog.filter(e=>e.id&&e.g>=RUN.ext-4).pop():null;
  RUN.endHtml=RUN.ext&&L0&&RUN.ext<=1?`<b>Extinct in ${RUN.open?'generation':'year'} 1.</b> It could not survive here at all: ${L0.why}${L0.season?' in the '+L0.season.toLowerCase():''}. Evolution needs survivors: when every individual dies straight away, nobody is left to pass on better traits.`:
   RUN.ext?`<b>Extinct in ${RUN.open?'generation':'year'} ${RUN.ext}.</b> ${main?`The main cause of death was ${C[main[0]][0].toLowerCase()}.`:''} ${lastEv?`The <b>${lastEv.txt.toLowerCase()}</b> struck just before. No individual had the traits to cope, and selection can only work on variation that is already there.`:'The population could not adapt fast enough.'}`:
    `<b>After ${YEARS} ${RUN.human?'years':'generations'}: ${n} alive</b> (started with ${RUN.org.kind==='animal'?20:24}). ${main?`Main cause of death: ${C[main[0]][0].toLowerCase()}.`:''}`;
  hook('finished');
}
function topChanged(n){if(!RUN||RUN.traitHist.length<2)return relevantKeys(RUN.org.kind,RUN.org.t,BIOMES[RUN.bk]).slice(0,n);
  const a=RUN.traitHist[0],b=[...RUN.traitHist].reverse().find(m=>Object.values(m).some(v=>v!=null&&typeof v==='number'))||a;
  return relevantKeys(RUN.org.kind,RUN.org.t,BIOMES[RUN.bk]).filter(k=>b[k]!=null).sort((x,y)=>Math.abs(b[y]-a[y])-Math.abs(b[x]-a[x])).slice(0,n)}
function changeYear(){return RUN.human?10:RUN.open?null:RUN.nat!=='none'?15:null}
function spent(actions){return [...actions].reduce((a,k)=>a+ACTIONS[k][2],0)}
/* skipAhead() is the old "Skip" button: run to the next pause (open mode) or to the end (Conservation mode), with no animation. */
function skipAhead(){if(!RUN||RUN.done)return RUN;if(RUN.paused){RUN.paused=false;RUN.blockStart=RUN.stopAt;RUN.stopAt+=50;RUN.summary=null}advance(RUN.open?(RUN.stopAt*4-RUN.t):YEARS*4,true);RUN.pop=RUN.pop.filter(p=>!p.dying);RUN.effects=[];return RUN}
/* runGenerations(n) advances n whole generations with no animation (1 generation = 4 seasons). */
function runGenerations(n){if(!RUN||RUN.done)return RUN;advance(n*4,true);RUN.pop=RUN.pop.filter(p=>!p.dying);RUN.effects=[];return RUN}
function queueEvent(id){if(RUN&&RUN.open&&!RUN.done)RUN.queue.push(id)}
const getRun=()=>RUN,setRun=r=>{RUN=r};

Object.assign(M,{YEARS,SEASON_SEC,HARSH_YEARS,EVO_A,EVO_P,TLAB,relevantKeys,defaultCfg,THREATS,ACTIONS,BUDGET,CAUSES_A,CAUSES_P,EVENTS,EVENTS_PLANT,evInfo,evAllowed,TUNE,runKey,curGen,evActive,envFor,needOf,newRun,aliveCount,fitness,predVul,updatePreds,triggerEvent,startSeason,fireEvent,recordYear,advance,meanT,causeTotals,blockSummary,contRun,topChanged,changeYear,spent,skipAhead,runGenerations,queueEvent,getRun,setRun});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
