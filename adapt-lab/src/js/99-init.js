/* Adapt Lab rebuild · first page (model check). Shows survival bars for any real organism in any biome.
   Replaced by the real shell in Session 8. Browser only. */
(function(){
"use strict";
if(typeof document==='undefined')return;
const M=window.AdaptModel,C=window.AdaptCombos;
const BARS=[['temp','Temperature'],['food','Food'],['pred','Predators'],['water','Water'],['breath','Breathing'],['light','Light'],['graze','Grazers']];
const col=v=>v>=70?'var(--good)':v>=40?'var(--accent)':'var(--bad)';
const $=id=>document.getElementById(id);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function fill(){
  Object.entries(M.PRESETS).forEach(([id,p])=>$('pickOrg').add(new Option(p.name+(p.kind==='plant'?' (plant)':''),id)));
  Object.keys(M.BIOMES).forEach(id=>$('pickBiome').add(new Option(M.BIOMES[id].name||cap(id),id)));
  $('pickOrg').value='zebra';$('pickBiome').value='grassland';
}
function show(){
  const id=$('pickOrg').value,bk=$('pickBiome').value,p=M.PRESETS[id];
  const org={kind:p.kind,name:p.name,t:{...(p.kind==='plant'?M.DEF_P:M.DEF_A),...p.t}};
  let s=M.scoresFor(org,bk);if(p.kind==='animal'&&C)s=C.apply(s,org.t,bk);
  const dead=M.lethalOf(s,bk,org),ys=dead?0:M.yearSurvival(s,bk,org);
  $('title').textContent=p.name+' in the '+(M.BIOMES[bk].name||bk).toLowerCase();
  $('year').textContent=Math.round(ys*100)+'%';
  $('bars').innerHTML=BARS.filter(([k])=>typeof s[k]==='number').map(([k,l])=>{const v=Math.round(s[k]);
    return `<div class="bar" data-k="${k}"><span>${l}</span><div class="track"><div class="fill" style="width:${v}%;background:${col(v)}"></div></div><span class="num">${v}</span></div>`}).join('');
  const chips=p.kind==='animal'&&C?C.find(org.t,bk):[];
  $('chips').innerHTML=chips.length?chips.map(c=>`<div class="chip ${c.good?'good':'bad'}"><b>${c.good?'Works well together':'Clashes'}: ${c.a} + ${c.b}</b>${c.text}</div>`).join(''):'<span class="none">No pairs to show for this one.</span>';
}
function init(){fill();show();$('pickOrg').onchange=show;$('pickBiome').onchange=show;
  if(window.__ADAPT_TEST)window.__adapt={M,C,Cost:window.AdaptCost,show,pick:(id,bk)=>{$('pickOrg').value=id;$('pickBiome').value=bk;show()}};}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
