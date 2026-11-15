/* Adapt Lab model · how well a plant survives each pressure
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
const {clamp,n01,BIOMES,getB,animalScores}=M;
/* ================= plant model ================= */
function plantScores(t,bk){
  const B=getB(bk);const aq=!!B.aquatic;const form=t.form;
  const H=n01(t.height),LS=n01(t.leafSize),W=n01(t.wax),RD=n01(t.rootDepth),RS=n01(t.rootSpread);
  const leafA={spines:.12,needles:.35,broad:.3+.7*LS,ribbon:.5}[t.leaf];
  const hot=B.hs===1||B.id==='grassland';
  const isAqP=t.water==='aquatic';
  let wMain,wHarsh;
  if(!aq){
    if(isAqP){wMain=wHarsh=0}
    else{
      const Tr=leafA*(1-.45*W)*(t.pores==='night'?.45:1)*(.85+.3*H);
      const rootF=.35+.9*RD*(B.perma?.15:1)+(B.pdry>.6?.6:.35)*RS+(t.store==='water'?.5*n01(t.stemStore):t.store==='bulb'?.1:0);
      const sf={evergreen:1,deciduous:.6,dormant:.35}[t.season];
      const sM=B.pdry*Tr/rootF, sH=B.pdry*(hot?1.6:1)*Tr*(hot?sf:1)/rootF;
      wMain=100*(1-clamp(sM*.9,0,1));wHarsh=100*(1-clamp(sH*.9,0,1));
      if(B.perma&&RD>.6){wMain=Math.max(0,wMain-20);wHarsh=Math.max(0,wHarsh-20)}
    }
  }else{
    if(!isAqP){wMain=wHarsh=0}
    else{const s=n01(t.salt);const v=B.salt?clamp((s-.15)*120,0,100):100-Math.max(0,s-.5)*220;wMain=wHarsh=clamp(v,0,100)}
  }
  const vul={spines:.4,needles:.25,broad:.4+.6*LS,ribbon:.6}[t.leaf];
  let frost=1.5*B.frost*vul*(1-.15*W)*{evergreen:1,deciduous:.3,dormant:.15}[t.season]*(.6+.65*H)*(t.store==='water'?1+.8*n01(t.stemStore):t.store==='bulb'?.7:1);
  if(aq)frost*=.5;
  const heatL={spines:.3,needles:.5,broad:.45+.55*LS,ribbon:.55}[t.leaf];
  const heat=B.heatP*(B.hs===1&&t.leaf==='broad'?1.35:1)*heatL*(1-.3*W)*(t.pores==='night'?1.15:1)*(t.season==='dormant'?.5:1)*(H<.25?1.15:1);
  const tHarshS=100*(1-clamp(Math.max(frost,heat),0,1)), tMainS=100*(1-clamp(Math.max(frost*.25,heat*.6),0,1));
  const tdir=frost>=heat?-1:1;
  let pal={none:1,thorns:.45,bitter:.5}[t.defence]*{spines:.35,needles:.6,broad:.8+.3*LS,ribbon:.85}[t.leaf];
  pal*=aq?1-.3*H:1-(B.id==='grassland'?.35:.55)*H*(form==='tree'?1:.7);
  if(t.season==='dormant')pal*=.7;if(form==='herb')pal*=.6;if(t.store==='bulb')pal*=.85;
  const graze=100*(1-clamp(B.graze*pal*1.1,0,1));
  let get=(.35+.65*H)*{spines:.55,needles:.8,broad:.75+.3*LS,ribbon:.85}[t.leaf]*(t.pores==='night'?.85:1);
  if(aq&&t.leaf==='broad'&&H>.5)get+=.2;
  if(B.id==='forest'&&H<.3&&t.season!=='evergreen')get+=.3;
  let ls=B.comp*(1-clamp(get,0,1));
  if(aq)ls+=B.wind*H*(1-.6*RS)*(t.leaf==='ribbon'?.4:1);
  else ls+=B.wind*.6*H*(form==='tree'?1:.7);
  if(!aq&&RD<.3&&H>.7)ls+=.15;
  if(B.perma)ls+=(t.season==='evergreen'?.2:.3)+(form==='tree'&&H>.4?.6:0);
  const CL=[];const addC=(c,name)=>{if(c>.015)CL.push([name,c])};
  addC(.1*W,'wax');addC({none:0,thorns:.08,bitter:.07}[t.defence],t.defence==='thorns'?'thorns':'bitter chemicals');
  if(t.store==='water')addC(.1*n01(t.stemStore),'a water-filled stem');if(t.store==='bulb')addC(.05,'a bulb');
  addC(.07*RD+.04*RS,'big roots');addC(.06*H,'height');addC(t.seedSize==='large'?.08:0,'big seeds');
  if(aq)addC(.08*Math.abs(n01(t.salt)-(B.salt?.95:.05)),'salt handling');
  const cost=CL.reduce((a,b)=>a+b[1],0);CL.sort((a,b)=>b[1]-a[1]);
  const light=100*(1-clamp(ls+.45*cost,0,1));
  return{kind:'plant',cost,costList:CL,water:(wMain+wHarsh)/2,wMain,wHarsh,temp:(tMainS+tHarshS)/2,tMainS,tHarshS,tdir,graze,light,isAqP,aq};
}
function scoresFor(o,bk){return o.kind==='animal'?animalScores(o.t,bk):plantScores(o.t,bk)}
Object.assign(M,{plantScores,scoresFor});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
