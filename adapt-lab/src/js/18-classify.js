/* Adapt Lab model · which animal group a design is most like, and real-world checks
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
/* ================= classification & checks ================= */
const GROUPS=[
 {n:'mammal',f:[['Fur',t=>t.cov==='fur'],['Warm-blooded',t=>t.blood==='warm'],['Lungs',t=>t.breathe==='lungs']]},
 {n:'bird',f:[['Feathers',t=>t.cov==='feathers'],['Warm-blooded',t=>t.blood==='warm'],['Lungs',t=>t.breathe==='lungs'],['Wings',t=>t.wings!=='none'],['Two legs',t=>t.legs==='2']]},
 {n:'reptile',f:[['Dry scales',t=>t.cov==='scales'],['Cold-blooded',t=>t.blood==='cold'],['Lungs',t=>t.breathe==='lungs']]},
 {n:'amphibian',f:[['Moist skin',t=>t.cov==='skin'],['Cold-blooded',t=>t.blood==='cold'],['Skin & lungs',t=>t.breathe==='skinlungs']]},
 {n:'fish',f:[['Scales',t=>t.cov==='scales'],['Cold-blooded',t=>t.blood==='cold'],['Gills',t=>t.breathe==='gills'],['Fins',t=>t.fins==='fins']]},
 {n:'insect',f:[['Exoskeleton',t=>t.cov==='exo'],['Cold-blooded',t=>t.blood==='cold'],['Air tubes',t=>t.breathe==='tubes'],['Six legs',t=>t.legs==='6']]},
 {n:'crustacean',f:[['Exoskeleton',t=>t.cov==='exo'],['Cold-blooded',t=>t.blood==='cold'],['Gills',t=>t.breathe==='gills']]}
];
function classify(t){let best=null;GROUPS.forEach(g=>{const r=g.f.map(([l,fn])=>[l,fn(t)]);const sc=r.filter(x=>x[1]).length/r.length;if(!best||sc>best.sc+1e-9)best={g,r,sc}});return best}
function realChecks(t){
  const c=[];
  if(t.senses==='tongue'&&(t.cov==='fur'||t.cov==='feathers'))c.push('Tasting the air with a forked tongue is a reptile feature, seen in snakes and lizards.');
  if(t.posture==='sprawl'&&t.legs==='4'&&(t.cov==='fur'||t.cov==='feathers')&&t.blood==='warm')c.push('Almost all mammals stand with their legs under the body. Sprawling legs are typical of lizards, crocodiles, newts and salamanders.');
  if((t.cov==='fur'||t.cov==='feathers')&&t.blood==='cold')c.push(`No real animal with ${t.cov} is cold-blooded. Fur and feathers only help animals that make their own heat.`);
  if((t.cov==='scales'||t.cov==='skin'||t.cov==='exo')&&t.blood==='warm')c.push(`Almost every real animal with ${t.cov==='skin'?'moist skin':t.cov==='exo'?'an exoskeleton':'scales'} is cold-blooded.`);
  if(t.cov==='feathers'&&t.wings==='none')c.push('Every living animal with feathers has wings, even if it cannot fly.');
  if(t.cov==='exo'&&t.size>40)c.push('Animals with exoskeletons cannot grow this big. The armour gets too heavy, and air tubes cannot supply enough oxygen.');
  if(t.breathe==='tubes'&&t.cov!=='exo')c.push('Air tubes are an insect feature. Insects have exoskeletons.');
  if(t.breathe==='skinlungs'&&t.cov!=='skin')c.push('Skin breathing only works through thin, moist skin.');
  if(t.legs==='6'&&t.cov!=='exo')c.push('Six or more legs is a feature of animals with exoskeletons, like insects, spiders and crabs.');
  if(t.wings==='fly'&&t.size>70)c.push('Very large animals cannot fly. Their wings cannot lift that much weight.');
  else if(t.wings==='fly'&&t.cov==='exo'&&t.size>25)c.push('Flying insects are small. Big, heavy bodies cannot fly on insect wings.');
  if(t.color==='orange'&&t.defence!=='poison')c.push('Bright orange works as a warning colour only if the animal is poisonous. Without poison, it just makes it easy to spot.');
  return c;
}
Object.assign(M,{GROUPS,classify,realChecks});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
