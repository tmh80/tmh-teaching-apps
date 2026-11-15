/* Adapt Lab model · how well an animal survives each pressure, and the predators of each biome
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
const {clamp,n01,BIOMES,getB}=M;
/* ================= animal model ================= */
function moveAbility(t,B){
  const sz=n01(t.size),L=n01(t.legLen),legs=+t.legs;
  let land=legs===0?(t.shape==='long'&&t.fins!=='fins'&&t.wings==='none'?.45:.08):legs===2?.55:legs===4?.7:.62;
  land*=legs?(.6+.6*L):1;land*={round:.85,long:.9,tall:1.05,stream:.85}[t.shape];
  if(t.fatWhere==='all')land*=1-.3*n01(t.fat);
  if(t.cov==='exo'&&sz>.4)land*=1-(sz-.4)*1.2;
  if(t.defence==='shell')land*=.55;
  if(t.fins==='fins')land*=.6;
  if(legs===4&&t.posture==='sprawl')land*=.82;
  land=clamp(land,0,1);
  let fly=0;if(t.wings==='fly'){const need=.15+.6*sz+(t.fatWhere==='all'?.15*n01(t.fat):0)+(t.defence==='shell'?.4:0)+(t.cov==='exo'&&sz>.3?.3:0);fly=clamp((n01(t.wingSize)-need)*2.5+.55,0,1)}
  let swim=(t.fins==='fins'?.4+.4*n01(t.finSize):0)+(t.shape==='stream'?.3:0)+(legs&&t.fins!=='fins'?.08:0)+(t.wings!=='none'&&t.cov==='feathers'?.12:0);
  if(t.defence==='shell')swim*=.75;
  swim=clamp(swim,0,1);
  const move=B.aquatic?Math.max(swim,fly*.35):Math.max(land,fly);
  return{land,fly,swim,move};
}
/* ---- predators that live in each biome (open evolution mode) ----
   prey: body-size range (size trait 0–100) it hunts · mode: how it hunts · sense: how it finds prey
   w: share of its diet that could be your species (the rest is other prey) */
const PRED_BANK={
 tundra:[
  {id:'afox',name:'Arctic fox',kind:'canid',col:'#8e959c',mode:'chase',sense:'smell',act:'both',size:35,prey:[0,30],w:.7},
  {id:'owl',name:'Snowy owl',kind:'owl',col:'#cfd3d6',mode:'air',sense:'sight',act:'both',size:42,prey:[0,35],w:.8},
  {id:'wolf',name:'Wolf pack',kind:'wolf',col:'#55595e',mode:'chase',sense:'smell',act:'both',size:70,pack:true,prey:[40,100],w:.5}],
 desert:[
  {id:'hawk',name:'Red-tailed hawk',kind:'raptor',col:'#7a4a2a',mode:'air',sense:'sight',act:'day',size:30,prey:[0,25],w:.6},
  {id:'coyote',name:'Coyote',kind:'canid',col:'#a07a4f',mode:'chase',sense:'smell',act:'night',size:45,prey:[5,45],w:.5},
  {id:'puma',name:'Puma',kind:'cat',col:'#b0895a',mode:'ambush',sense:'sight',act:'crep',size:65,prey:[25,85],w:.4},
  {id:'rattler',name:'Rattlesnake',kind:'snake',col:'#9a7f52',mode:'ambush',sense:'heat',act:'night',size:25,prey:[0,10],w:.7}],
 forest:[
  {id:'goshawk',name:'Goshawk',kind:'raptor',col:'#5a5a62',mode:'air',sense:'sight',act:'day',size:30,prey:[0,28],w:.6},
  {id:'towl',name:'Tawny owl',kind:'owl',col:'#8a6440',mode:'air',sense:'sight',act:'night',size:25,prey:[0,18],w:.7},
  {id:'rfox',name:'Red fox',kind:'canid',col:'#c0602a',mode:'chase',sense:'smell',act:'both',size:40,prey:[0,30],w:.5},
  {id:'fwolf',name:'Wolf pack',kind:'wolf',col:'#5d5a55',mode:'chase',sense:'smell',act:'both',size:70,pack:true,prey:[45,100],w:.4},
  {id:'lynx',name:'Lynx',kind:'cat',col:'#a88a62',mode:'ambush',sense:'sight',act:'crep',size:55,prey:[15,50],w:.6}],
 grassland:[
  {id:'eagle',name:'Martial eagle',kind:'raptor',col:'#4a3a30',mode:'air',sense:'sight',act:'day',size:40,prey:[0,35],w:.5},
  {id:'cheetah',name:'Cheetah',kind:'cat',col:'#d0a64a',mode:'chase',sense:'sight',act:'day',size:60,prey:[15,60],w:.6},
  {id:'lion',name:'Lion pride',kind:'lion',col:'#b88a48',mode:'ambush',sense:'sight',act:'night',size:85,pack:true,prey:[35,100],w:.5},
  {id:'hyena',name:'Hyena clan',kind:'canid',col:'#8a7a5a',mode:'chase',sense:'smell',act:'night',size:60,pack:true,prey:[15,85],w:.5}],
 ocean:[
  {id:'shark',name:'Shark',kind:'shark',col:'#5d6f7d',mode:'water',sense:'smell',act:'both',size:90,prey:[15,100],w:.5},
  {id:'seal',name:'Seal',kind:'seal',col:'#4c535a',mode:'chase',sense:'sight',act:'day',size:70,prey:[3,40],w:.6},
  {id:'gannet',name:'Gannet',kind:'seabird',col:'#f2f2ee',mode:'air',sense:'sight',act:'day',size:35,prey:[0,20],w:.7}],
 freshwater:[
  {id:'pike',name:'Pike',kind:'bigfish',col:'#5f7a48',mode:'ambush',sense:'sight',act:'day',size:40,prey:[0,30],w:.6},
  {id:'heron',name:'Grey heron',kind:'heron',col:'#8c939a',mode:'ambush',sense:'sight',act:'day',size:45,prey:[0,25],w:.6},
  {id:'otter',name:'Otter',kind:'seal',col:'#5a4532',mode:'chase',sense:'smell',act:'night',size:45,prey:[3,35],w:.5}]
};
const INVADERS={
 tundra:{id:'rfoxN',name:'Red fox (moving north)',kind:'canid',col:'#c0602a',mode:'chase',sense:'smell',act:'both',size:40,prey:[0,30],w:.4,inv:true},
 desert:{id:'cat',name:'Feral cat',kind:'cat',col:'#6b6b6b',mode:'ambush',sense:'sight',act:'night',size:30,prey:[0,20],w:.6,inv:true},
 forest:{id:'cat',name:'Feral cat',kind:'cat',col:'#6b6b6b',mode:'ambush',sense:'sight',act:'night',size:30,prey:[0,20],w:.6,inv:true},
 grassland:{id:'dogs',name:'Feral dog pack',kind:'wolf',col:'#6a5a48',mode:'chase',sense:'smell',act:'both',size:50,pack:true,prey:[10,70],w:.5,inv:true},
 ocean:{id:'lionfish',name:'Lionfish',kind:'bigfish',col:'#b0503a',mode:'ambush',sense:'sight',act:'both',size:20,prey:[0,15],w:.6,inv:true},
 freshwater:{id:'snakehead',name:'Snakehead fish',kind:'bigfish',col:'#4a5a3a',mode:'ambush',sense:'sight',act:'both',size:45,prey:[0,35],w:.6,inv:true}};
const MODE_W={chase:'chases',ambush:'ambushes',air:'attacks from the air',water:'attacks from below'};
const SENSE_W={sight:'hunts by sight',smell:'hunts by smell',heat:'senses body heat'};
const PRED_BASE=.075;
const PRED_K={tundra:.85,desert:1,forest:1,grassland:.85,ocean:.8,freshwater:1};
const predK=B=>PRED_BASE*(PRED_K[B.id]||1);

/* how easy one predator finds it hard to catch: shared by Create (adults, normal numbers) and Run */
function vulCore(t,s,j,B,size){const M=s.M;
  let v=canHunt(j,size,t);if(!v)return{v:0,why:[]};const why=[];const cut=(f,txt)=>{if(f<1&&txt)why.push([1-f,txt]);v*=f};
  const ov=j.act==='both'?1:j.act==='day'?{day:1,crep:.6,night:.25}[t.activity]:j.act==='night'?{day:.25,crep:.6,night:1}[t.activity]:{day:.55,crep:1,night:.55}[t.activity];
  cut(ov,'active at a different time');
  const camo=s.camo;
  if(j.sense==='sight')cut(1-.72*camo,camo>.6?'camouflaged':null);else if(j.sense==='smell')v*=1-.12*camo;else v*=(t.blood==='warm'?1.15:.6);
  if(t.escape==='flee')cut(j.mode==='chase'?1-.6*M.move:j.mode==='ambush'?1-.25*M.move:1-.35*M.move,M.move>.45?(B.aquatic?'swam away fast':'too fast'):null);
  if(t.escape==='hide')cut(j.mode==='air'?.45:j.mode==='chase'?.6:.85,B.aquatic?'hid in cover':'hid in a burrow');
  if(t.escape==='freeze')cut(j.sense==='sight'?(camo>=.6?.55:1.15):1.1,camo>=.6&&j.sense==='sight'?'froze and blended in':null);
  if(t.defence==='spines')cut(j.mode==='air'?.75:.45,'spines');
  if(t.defence==='shell')cut(.45,'hard shell');
  if(t.defence==='poison')cut(s.warn&&j.sense==='sight'?.3:.6,s.warn&&j.sense==='sight'?'warning colours':'tastes poisonous');
  if(t.social==='herd')cut(j.pack?.85:.65,'safety in the group');
  if(M.fly>.5&&j.mode!=='air')cut(.4,'flew away');
  v*=1-.15*n01(t.eyes);
  if(!B.aquatic&&M.land<.15&&M.fly<.2)v*=1.8;
  v*=1.25-.5*(B.cover??.4);
  return{v,why:why.sort((a,b)=>b[0]-a[0])}}
function animalScores(t,bk){
  const B=getB(bk);const endo=t.blood==='warm';const aq=!!B.aquatic;
  const sz=n01(t.size);const M=moveAbility(t,B);
  const actT=([d,n])=>t.activity==='day'?d:t.activity==='night'?n:(d+n)/2;
  const coverIns=t.cov==='fur'?.1+.85*n01(t.insul):t.cov==='feathers'?.1+.8*n01(t.insul):0;
  const fatIns=t.fatWhere==='all'?.55*n01(t.fat):0;
  const sizeIns=.4*sz-.12;
  const earLoss=t.cov==='fur'?.25*n01(t.ears):0;
  const behIns=(t.social==='herd'?.1:0)+(t.escape==='hide'&&!aq?.15:0);
  let tS,lo=0;
  if(endo){
    let Ic=coverIns+fatIns+sizeIns-earLoss+behIns, Ih=coverIns+fatIns-earLoss;
    if(aq){Ic=.3*coverIns+1.25*fatIns+sizeIns;Ih=Ic}
    tS=T=>{const Te=aq?T-14:T;const ideal=clamp((24-Te)/45,0,1.2);
      const cp=Ic<ideal?(ideal-Ic)*clamp((25-Te)/25,0,1)/.4:0;
      let hp=Ih>ideal?(Ih-ideal)*clamp((Te-14)/20,0,1)/.7:0;hp*=(sz>.6?.8:1)*(aq?.3:1);
      const pen=Math.max(cp,hp);return{s:100-95*clamp(pen,0,1),dir:pen<.08?0:(cp>=hp?-1:1)}};
  }else{
    let hi;
    if(aq){lo=t.breathe==='gills'?1:6;hi=28}
    else{lo={scales:20,exo:12,skin:8,fur:14,feathers:14}[t.cov];hi={scales:42,exo:40,skin:28,fur:34,feathers:34}[t.cov]}
    const bask=aq?0:t.activity==='day'?({scales:8,exo:6,skin:3}[t.cov]??4):t.activity==='crep'?({scales:4,exo:3,skin:1}[t.cov]??2):0;
    tS=T=>{const bodyT=T<lo?Math.min(lo,T+bask):T;let s=100,dir=0;
      if(bodyT<lo){s=bodyT<lo-12?0:100-(lo-bodyT)*7;dir=-1}
      if(bodyT>hi){let p=(bodyT-hi)*6;if(t.escape==='hide')p*=.45;s-=p;dir=1}
      s=clamp(s,0,100);if(s>92)dir=0;return{s,dir}};
  }
  const canMigrate=M.move>=.45;
  const ts=B.temps.map((pair,i)=>{const T=actT(pair);const harsh=i===B.hs;const r=tS(T);
    if(t.season==='migrate'&&harsh&&canMigrate){if(M.fly>=.5||aq)return{s:100,dir:0,T,away:true};const prev=B.temps[(i+3)%4];const m2=tS((actT(prev)+T)/2+(B.hs===1?-3:3));return{...m2,T,away:true}}
    const dorm=t.season==='hibernate'&&(endo?harsh:(harsh||r.dir<0));
    if(dorm){const deep=!aq&&T<-15;return{s:deep?(endo?85:{skin:25,scales:10,exo:45}[t.cov]??20):(endo||aq?100:90),dir:deep?-1:0,T,dormant:true}}
    return{...r,T}});
  const dormN=ts.filter(x=>x.dormant).length, awayN=ts.filter(x=>x.away).length, activeN=4-dormN-awayN;
  let temp=ts.reduce((a,b)=>a+b.s,0)/4;if(!endo&&activeN===0)temp=0;
  // breathing
  let breath;
  if(!aq)breath={lungs:100,gills:0,skinlungs:t.cov==='skin'?100-B.pdry*55*(t.activity==='day'?1:.6):92,tubes:100-Math.max(0,sz-.3)*170}[t.breathe];
  else{breath={gills:100,lungs:M.swim>=.5?100:M.swim>=.25?60:12,skinlungs:B.salt?30:(t.cov==='skin'?85:55),tubes:6}[t.breathe];if(t.breathe==='lungs'&&t.season==='hibernate')breath=Math.min(breath,40)}
  breath=clamp(breath,0,100);
  // predators
  let camo=B.match[t.color];
  if(t.pattern==='counter')camo=Math.min(1,camo+(aq?.3:.08));
  if(t.pattern==='spots'&&(B.id==='forest'||B.id==='grassland'||B.id==='freshwater'))camo=Math.min(1,camo+.1);
  if(t.pattern==='stripes'&&t.social==='herd'&&B.id==='grassland')camo=Math.min(1,camo+.35);
  const warn=t.defence==='poison'&&(t.color==='orange'||t.pattern==='stripes'||t.pattern==='spots');
  let inten,vis;
  if(t.activity==='day'){inten=B.pd;vis=1}else if(t.activity==='night'){inten=B.pn;vis=.5}else{inten=(B.pd+B.pn)/2*.85;vis=.75}
  let dang=inten*(1-.65*camo*vis);
  if(t.escape==='freeze')dang*=camo>=.6?(1-.35*camo):1.12;
  if(t.escape==='flee')dang*=1-.45*M.move*(aq||B.open?1:.75);
  if(t.escape==='hide')dang*=1-(aq?.35*B.cover:.4*B.burrow)-(t.defence==='shell'?.15:0);
  if(t.defence==='spines')dang*=.6;
  if(t.defence==='poison')dang*=warn?.4:.62;
  if(t.defence==='shell')dang*=.55;
  dang*=sz<.5?1+.1*sz:1.05-1.1*(sz-.5);
  if(t.social==='herd')dang*=1-B.herd;
  dang*=1-.12*n01(t.eyes);
  if(t.cov==='fur')dang*=1-.08*n01(t.ears);
  if(t.season==='migrate'&&canMigrate)dang*=1.1;
  if(!aq&&M.land<.15&&M.fly<.2)dang*=1.8;
  if(t.season==='hibernate')dang*=.9;
  if(t.store==='cache')dang*=.97;
  const predOld=100*(1-clamp(dang*1.4,0,1));
  const bank=B.bank||PRED_BANK[B.id]||[];const B0=BIOMES[B.id];const pdR=B0?(B.pd+B.pn)/(B0.pd+B0.pn):1;
  let H=0;const predList=bank.map(j=>{const r=vulCore(t,{camo,warn,M},j,B,t.size);const h=predK(B)*r.v*pdR;H+=h;return{j,v:r.v,why:r.why,h,young:!r.v&&canHunt(j,t.size*.5,t)>0}});
  H*=1-.7*ts.filter(x=>x.away||x.dormant).length/4;
  const pred=bank.length?100*(1-clamp(Math.pow(H/.2,2/3),0,1)):predOld;
  // food
  let h=B.harsh;
  if(t.season==='hibernate')h*=B.temps[B.hs][0]<5?.25:.6;
  if(t.season==='migrate'&&canMigrate)h*=(M.fly>=.5||aq)?.4:.6;
  if(t.store==='cache')h*=.65;
  if(t.fatWhere!=='none')h*=1-.4*n01(t.fat);
  h*=1-.2*sz;
  const senses=Math.max(n01(t.eyes)*(t.activity==='night'?.8:t.activity==='crep'?.6:.4),t.senses==='smell'?.5:t.senses==='tongue'?(aq?.25:.55):0);
  const hunt=clamp(.1+.6*M.move+(.35*senses+(sz>.25?.1:0))*(.4+.6*M.move),0,1.15);
  const stranded=!aq&&M.land<.15&&M.fly<.2;
  const aPl=B.plantF*(1-.45*h), aMe=B.preyF*hunt*(1-.25*h);
  let avail=t.diet==='plants'?aPl:t.diet==='meat'?aMe:Math.max(aPl,aMe)*.9+.15*Math.min(aPl,aMe);
  // energy upkeep of adaptations: costly features only pay off if a pressure needs them
  const CL=[];const addC=(c,name)=>{if(c>.015)CL.push([name,c])};
  if(t.cov==='fur'||t.cov==='feathers')addC(.22*n01(t.insul),`thick ${t.cov}`);
  if(t.fatWhere!=='none')addC(.14*n01(t.fat),t.fatWhere==='hump'?'a fat hump':'a fat layer');
  if(t.cov==='fur')addC(.05*n01(t.ears),'big ears');
  if(t.wings!=='none')addC((t.wings==='fly'?.16:.06)*n01(t.wingSize),'wings');
  if(t.fins==='fins')addC(.07*n01(t.finSize),'fins');
  if(+t.legs)addC(.05*n01(t.legLen),'long legs');
  addC(.08*n01(t.eyes),'big eyes');
  addC({none:0,spines:.1,poison:.16,shell:.18}[t.defence],{spines:'spines',poison:'making poison',shell:'a heavy shell'}[t.defence]||'');
  if(!aq)addC(.1*n01(t.waterSave),'water-saving kidneys');
  addC(.1*Math.abs(n01(t.salt)-(aq&&B.salt?.95:.05))*(aq?.5:1)+(aq?0:.06*n01(t.salt)),'salt glands');
  addC({none:0,some:.05,lots:.13}[t.care],'caring for young');
  CL.forEach(x=>x[1]*=.7);const cost=CL.reduce((a,b)=>a+b[1],0);CL.sort((a,b)=>b[1]-a[1]);
  let need=.75+.35*sz+cost*(endo?.55:.35);
  if(t.legs==='4'&&t.posture==='sprawl')need-=.05;
  if(endo)need+=(100-temp)/100*.35;else need*=.35;
  if(M.fly>.2)need+=.08;
  if(stranded)need+=.3;
  if(t.social==='herd'&&avail<.8)need+=.08;
  if(t.season==='migrate'&&canMigrate)need+=.2*(1-M.move);
  if(t.season==='hibernate'&&endo&&t.fatWhere==='none')need+=.25*(1-sz);
  if(!aq&&B.id==='forest'&&sz>.75)need+=.6*(sz-.75)*4;
  let food=100*clamp(avail/need/.6,0,1);
  if(stranded)food=Math.min(food,4);
  if(!endo){if(activeN===0)food=0;else if(activeN===1)food=Math.min(food,B.cold?20:45)}
  // water & salt
  let water;
  if(!aq){
    let loss={fur:1,feathers:.95,scales:.45,skin:1.9,exo:.5}[t.cov]*{day:1,crep:.7,night:.5}[t.activity];
    if(t.escape==='hide')loss*=.75;
    if(t.cov==='fur')loss*=1-.12*n01(t.ears);
    loss*=1.15-.3*sz;loss*=1-.55*n01(t.waterSave);
    if(t.fatWhere==='hump')loss*=1-.3*n01(t.fat);
    if(t.season!=='active'&&B.hs===1)loss*=.85;
    water=100*(1-clamp(B.dry*loss,0,1));
  }else{
    const s=n01(t.salt);
    water=B.salt?clamp((s-.15)*120,0,100):100-Math.max(0,s-.5)*220;
    if(B.salt&&t.cov==='skin')water*=.4;
    water=clamp(water,0,100);
  }
  return{kind:'animal',cost,costList:CL,stranded,temp,ts,dormN,awayN,activeN,canMigrate,breath,pred,predOld,predList,predH:H,food,water,camo,warn,endo,lo,M,hunt};
}
/* food-chain position: which predators can hunt a body of this size */
function canHunt(j,size,t){const[lo,hi]=j.prey;let v=size<lo?Math.exp(-(((lo-size)/10)**2)):size>hi?Math.exp(-(((size-hi)/10)**2)):1;
  if(t.diet==='meat'&&(size>j.size*(j.pack?1.25:.9)||t.size>=j.size*.9))v=0;
  if(t.diet==='both'&&size>j.size*(j.pack?1.5:1.2))v=0;return v<.03?0:v}
function foodChain(t,bk){const lvl=t.diet==='plants'?2:t.diet==='both'?2.5:3;const BB=getB(bk);const bank=BB.bank||PRED_BANK[BB.id]||[];
  const adult=bank.filter(j=>canHunt(j,t.size,t)>0),young=bank.filter(j=>!canHunt(j,t.size,t)&&canHunt(j,t.size*.5,t)>0);
  const apex=t.diet!=='plants'&&!adult.length;return{lvl:apex?4:lvl,apex,adult,young}}
function fcLabel(fc){return fc.apex?'Apex predator · top of the food chain':{2:'Herbivore · level 2 (primary consumer)',2.5:'Omnivore · level 2–3',3:'Carnivore · level 3 (secondary consumer)'}[fc.lvl]}
function isSwimmer(t,B){return !!B.aquatic&&(t.fins==='fins'||t.shape==='stream'||t.breathe==='gills')}
Object.assign(M,{moveAbility,PRED_BANK,INVADERS,MODE_W,SENSE_W,PRED_BASE,PRED_K,predK,vulCore,animalScores,canHunt,foodChain,fcLabel,isSwimmer});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
