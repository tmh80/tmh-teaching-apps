/* Adapt Lab model · chance of dying in each season, chance of surviving a year, deadly mismatches
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
const {clamp,n01,BIOMES,getB}=M;
/* ================= hazards ================= */
const fH=x=>Math.pow(clamp((100-x)/100,0,1),1.5);
function seasonHaz(sc,bk,o,sIdx,harshYear){
  const B=getB(bk);const harsh=sIdx===B.hs;const m=harsh?(harshYear?2.5:1.8):.6;const hz={};
  if(sc.kind==='animal'){
    const q=sc.ts[sIdx];const ts=q.s,dir=q.dir;
    const base=(!sc.endo&&!q.dormant&&dir<0)?.6:dir<0?.42:.3;
    const th=(!q.dormant&&!q.away&&ts<=8)?1:base*fH(ts)*(harsh?m:1);
    if(dir<0)hz.cold=th;else if(dir>0)hz.heat=th;else hz.cold=th*.5;
    hz.breath=sc.breath<=40?1:.35*fH(sc.breath);
    hz.pred=.2*fH(sc.pred)*(harshYear&&harsh?1.2:1);
    hz.food=(sc.food<=5&&harsh)?1:.28*fH(sc.food)*m;
    hz.water=(sc.water<=5&&(harsh||B.aquatic||B.dry<.2))?1:.3*fH(sc.water)*(B.dry<.2&&!B.aquatic?.6:m);
    hz.old=.02;
  }else{
    const ts=harsh?sc.tHarshS:sc.tMainS;const th=(harsh&&ts<=5)?1:.3*fH(ts)*(harsh?(harshYear?2.4:1.8):.6);
    if(sc.tdir<0)hz.cold=th;else hz.heat=th;
    const wv=harsh?sc.wHarsh:sc.wMain;
    hz.water=wv<=5?1:.3*fH(wv)*(harsh?(harshYear?1.4:1):.6);
    hz.graze=.22*fH(sc.graze)*(harsh&&!B.cold?1.3:1);
    hz.light=sc.light<=5?1:.2*fH(sc.light);
    hz.old=.012;
  }
  return hz;
}
function yearSurvival(sc,bk,o){let p=1;for(let s=0;s<4;s++){const hz=seasonHaz(sc,bk,o,s,false);let q=1;Object.values(hz).forEach(h=>q*=h>=1?0:1-Math.min(.95,h));p*=q}return p}
function lethalOf(sc,bk,o){
  const B=getB(bk);
  if(sc.kind==='animal'){
    if(sc.breath<=40){const br=o.t.breathe;return{k:'breath',why:B.aquatic?(br==='tubes'?'air tubes cannot take oxygen from water':br==='lungs'?'it cannot swim well enough to keep reaching the surface for air, so it drowns':br==='skinlungs'?(B.salt?'salt water damages thin, moist skin, so it cannot breathe through it':'it cannot get enough oxygen from the water'):'it cannot get enough oxygen'):(br==='gills'?'gills collapse and dry out in air, so it suffocates':br==='tubes'?'air tubes cannot carry enough oxygen into a body this big':'it cannot get enough oxygen')}}
    if(!sc.endo&&sc.activeN===0)return{k:'cold',why:'never warm enough to come out, feed or breed'};
  }else{
    if(sc.aq&&!sc.isAqP)return{k:'water',why:'roots and leaves drown underwater'};
    if(!sc.aq&&sc.isAqP)return{k:'water',why:'a water plant dries out and flops over on land'};
  }
  const L=sc.kind==='animal'?{cold:'too cold to function',heat:'too hot to survive',food:sc.stranded?'it cannot move on land to find food':'cannot find enough food',water:B.aquatic?'cannot cope with the salt balance':'dries out',pred:'eaten'}:{cold:'killed by frost',heat:'scorched',water:B.aquatic?'cannot cope with the salt balance':'dries out',graze:'eaten',light:B.perma?'the summer is too short and cold for it to grow':'not enough light to grow'};
  for(let i=0;i<4;i++){const hz=seasonHaz(sc,bk,o,i,false);for(const k in hz)if(hz[k]>=1)return{k,season:B.seasons[i],why:L[k]}}
  return null;
}
Object.assign(M,{fH,seasonHaz,yearSurvival,lethalOf});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
