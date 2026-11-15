/* Adapt Lab model · the sentences that explain each survival bar
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
const {clamp,n01,BIOMES,getB,v,PRED_BANK,MODE_W,SENSE_W,canHunt,foodChain,fcLabel,rootsKey,PAL}=M;
/* ================= notes ================= */
function fmtT(T){return (T<0?'−':'')+Math.abs(Math.round(T))+' °C'}
function tempRange(B){const d=B.temps.map(x=>x[0]);return `${B.aquatic?'water':'days'} ${fmtT(Math.min(...d))} to ${fmtT(Math.max(...d))}`}
function joinL(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
const SIZEW=x=>x<15?'tiny':x<38?'small':x<62?'medium-sized':x<85?'large':'huge';
function animalNotes(t,bk,s){
  const B=getB(bk);const n={};const aq=!!B.aquatic;const when={day:'by day',night:'at night',crep:'at dawn and dusk'}[t.activity];
  const hsName=B.seasons[B.hs].toLowerCase();
  const warmI=B.temps.reduce((bi,x,i,arr)=>x[0]>arr[bi][0]?i:bi,0);
  let tx=aq?`The water is about ${fmtT(s.ts[warmI].T)} in the ${B.seasons[warmI].toLowerCase()} and ${fmtT(s.ts[B.hs].T)} in the ${hsName}. Water steals body heat much faster than air.`:
    `When it is active ${when}, it is about ${fmtT(s.ts[warmI].T)} in the ${B.seasons[warmI].toLowerCase()} and ${fmtT(s.ts[B.hs].T)} in the ${hsName}.`;
  const worst=s.ts.filter(x=>!x.dormant&&!x.away).sort((a,b)=>a.s-b.s)[0];const dir=worst?worst.dir:0;
  if(!s.endo){
    tx+=` It is cold-blooded, so its body is only as warm as its surroundings${!aq&&t.activity!=='night'?', plus a little from basking':''}.`;
    if(aq&&t.breathe==='gills')tx+=' Gill-breathers are used to cold water, as long as it does not freeze solid.';
    const coldS=B.seasons.filter((nm,i)=>!s.ts[i].dormant&&!s.ts[i].away&&s.ts[i].dir<0).map(x=>x.toLowerCase());
    if(coldS.length)tx+=` Below about ${s.lo} °C it is too cold to move, feed or escape: that happens in the ${joinL(coldS)}. Staying active then is deadly. What could it do instead during that season?`;
    else if(dir>0)tx+=' It overheats in the hottest part of the year.';
    if(s.activeN===0)tx+=' It is never warm enough to come out.';
    else if(s.dormN>=2)tx+=` It must hibernate for ${s.dormN} of the 4 seasons.`;
    else if(s.dormN===1)tx+=' Hibernating gets it through the coldest season.';
  }else{
    const cw=t.cov==='fur'?'fur':t.cov==='feathers'?'feathers':null;
    if(dir<0){const bad=[];if(aq&&t.fatWhere!=='all')bad.push('no blubber (wet fur and feathers keep little heat in)');else if(!cw)bad.push(`${t.cov==='exo'?'an exoskeleton':t.cov==='skin'?'bare skin':'scales'}, which keep no heat in`);else if(t.insul<70)bad.push(`thin ${cw}`);
      if(t.cov==='fur'&&t.ears>55)bad.push('large ears');if(t.size<35)bad.push(`a ${SIZEW(t.size)} body that loses heat fast`);tx+=` It loses heat too fast: ${joinL(bad)||'not enough insulation'}.`}
    else if(dir>0){const bad=[];if(cw&&t.insul>40)bad.push(`thick ${cw}`);if(t.fatWhere==='all'&&t.fat>30)bad.push('a fat layer all over');if(t.cov==='fur'&&t.ears<50)bad.push('small ears');if(t.activity==='day')bad.push('being out by day');tx+=` It overheats: ${joinL(bad)||'it cannot lose heat'}.`}
    else tx+=' It is warm-blooded, and its body stays at a steady, safe temperature.';
    if(s.dormN)tx+=' Hibernating lets it skip the harshest season.';
    if(s.awayN&&(s.M.fly>=.5||aq))tx+=' Migrating lets it skip the harshest season.';
    if(t.season==='migrate'&&!s.canMigrate)tx+=' It tries to migrate, but moves too slowly to get away.';
    else if(s.awayN&&s.M.fly<.5&&!aq)tx+=' It can only walk to a slightly milder place, so it still faces the cold or heat.';
  }
  n.temp=tx;
  n.breath=!aq?{lungs:'Lungs take oxygen from the air.',gills:'Gills need water. In air they collapse and dry out, so it suffocates.',
    skinlungs:t.cov!=='skin'?'Skin breathing does not work without moist skin, so it relies on its lungs.':B.pdry>.4?'Breathing through skin needs it to stay moist, which is hard in dry air.':'Damp air keeps its skin moist enough to breathe through.',
    tubes:t.size<=30?'Air tubes carry oxygen straight into its small body.':'Air tubes cannot carry enough oxygen into a body this big.'}[t.breathe]
   :{gills:'Gills take oxygen straight from the water.',lungs:s.M.swim>=.5?'It has lungs, so it must swim up to breathe air. It swims well enough to do this.':'It has lungs, but cannot swim well enough to keep reaching the surface for air.',
    skinlungs:B.salt?'Salt water damages thin, moist skin, so skin breathing fails in the sea.':'It takes some oxygen through its skin and comes up for air.',tubes:'Air tubes cannot take oxygen from water.'}[t.breathe];
  const blend=s.camo>=.9?'blends in well with':s.camo>=.55?'partly blends in with':'stands out against';
  let px=`${cap(t.color)}${t.pattern==='plain'?'':t.pattern==='counter'?' (dark top, pale belly)':' '+t.pattern} colouring ${blend} the ${B.gname}.`;
  if(t.pattern==='counter'&&aq)px+=' Countershading hides it from above and below.';
  if(t.activity==='night')px+=' At night colour matters less.';
  px+=' '+{freeze:s.camo>=.6?'Freezing works because it is hard to see.':'Freezing fails: it is easy to see.',
    flee:s.M.move>=.65?`It is fast enough to ${aq?'swim':s.M.fly>s.M.land?'fly':'run'} away from most predators.`:s.M.move>=.4?'It can escape some predators, but not the fastest.':'It is too slow to escape.',
    hide:aq?'It hides among rocks and weed.':B.burrow>=.8?'It hides in a burrow.':'Frozen ground makes hiding places hard to dig.'}[t.escape];
  if(t.defence==='spines')px+=' Spines make it painful to eat.';
  if(t.defence==='shell')px+=' A hard shell protects it, but makes it slower.';
  if(t.defence==='poison')px+=s.warn?' Warning colours tell predators it is poisonous.':' It is poisonous, but dull colours mean predators only find out after biting.';
  if(s.stranded)px+=' Stranded on land without legs, it cannot get away.';
  if(t.size>=75)px+=' Few predators can tackle something this big.';
  if(t.social==='herd'&&B.herd>=.2)px+=' A group means more eyes watching for danger.';
  if(s.predList&&s.predList.length){const L=[...s.predList].sort((a,b)=>b.v-a.v);
    const fc=foodChain(t,B);
    px+=` <span class="fcl">${fcLabel(fc)}.</span><span class="plist">`+L.map(x=>{const j=x.j;const risk=x.v>=.5?'<b class="hr">its main threat</b>':x.v>=.2?'<b class="mr">some risk</b>':x.v>0?'<b class="lr">low risk</b>':x.young?'<b class="lr">only catches its young</b>':'<b class="lr">cannot catch it</b>';
      const why=x.v>0&&x.v<.5&&x.why.length&&x.why[0][0]>.3?`: ${x.why[0][1]==='too fast'?'it is fast enough to escape':x.why[0][1]==='camouflaged'?'camouflage hides it from a hunter that uses sight':x.why[0][1]}`:x.v>=.5&&j.sense!=='sight'&&s.camo>.6?': camouflage does not fool a nose':'';
      return`<span class="pli"><b>${j.name}</b> <small>(${MODE_W[j.mode]}, ${SENSE_W[j.sense]})</small> · ${risk}${why}</span>`}).join('')+'</span>'}
  n.pred=px;
  let fx=`It eats ${{plants:'plants',meat:'animals',both:'plants and animals'}[t.diet]}.`;
  if(t.diet!=='plants')fx+=s.hunt>=.8?' It is a good hunter.':s.hunt>=.55?' It catches enough prey most of the time.':' It is too slow to catch much prey.';
  if(t.diet==='plants'&&B.plantF<.75)fx+=' Plants are scarce here.';
  if(t.diet!=='plants'&&t.senses==='tongue')fx+=aq?' Tasting with its tongue works poorly underwater.':' It flicks its tongue to taste the air and track prey, even in the dark.';
  else if(t.diet!=='plants'&&t.senses==='smell')fx+=' A keen nose finds food even in the dark.';
  if(t.legs==='4'&&t.posture==='sprawl')fx+=' Sprawling legs keep its belly low, which saves energy but makes it slower.';
  fx+=t.season==='active'?` It must keep feeding through the ${hsName}.`:t.season==='hibernate'?` It saves energy by sleeping through the ${hsName}.`:'';
  if(!s.endo)fx+=s.activeN===0?' It never gets the chance to feed or breed.':s.dormN>=2?` It needs far less food, but only has ${s.activeN} warm season${s.activeN>1?'s':''} to feed.`:' Being cold-blooded, it needs far less food.';
  else if(s.temp<60)fx+=' Keeping warm or cool burns a lot of energy.';
  if(t.fatWhere!=='none'&&t.fat>30)fx+=' Stored fat keeps it going in lean times.';
  if(t.store==='cache')fx+=' Stored food helps in lean times.';
  if(!aq&&B.id==='forest'&&t.size>75)fx+=' A huge animal cannot find enough food among the trees.';
  if(s.stranded)fx+=' On land, with no legs or wings, it can barely move to find food.';
  if(s.cost>.12&&s.costList.length)fx+=` Its ${joinL(s.costList.slice(0,3).map(x=>x[0]))} cost a lot of energy to grow and keep.`;
  n.food=fx;
  let wx;
  if(aq){wx=B.salt?(t.salt>=80?'Its body gets rid of extra salt from sea water.':t.salt>=40?'It copes with some salt, but sea water is too salty for long.':'Its body cannot get rid of salt, so sea water dries it out from inside.')
      :(t.salt>65?'Its body is built for salt water: in fresh water it swells with water.':'Its body is built for fresh water.');
    if(B.salt&&t.cov==='skin')wx+=' Moist skin lets salt in: amphibians cannot live in the sea.'}
  else{wx=B.dry>=.5?'Water is very scarce here.':B.dry>=.25?'Water runs short in the dry season.':'Water is easy to find here.';
    if(t.cov==='skin')wx+=' Moist skin loses water fast.';if(t.cov==='scales'||t.cov==='exo')wx+=` ${t.cov==='scales'?'Scales':'An exoskeleton'} stop water escaping.`;
    if(B.dry>=.25){if(t.waterSave>=70)wx+=' It saves water so well it barely needs to drink.';wx+=t.activity==='day'?' Being active in the heat of the day loses a lot of water.':` Being active ${when} saves water.`}}
  n.water=wx;
  return n;
}
function plantNotes(t,bk,s){
  const B=getB(bk);const n={};const aq=!!B.aquatic;
  let wx='';
  if(aq&&!s.isAqP)wx='A land plant cannot live underwater: its roots and leaves drown.';
  else if(!aq&&s.isAqP)wx='A water plant has no strong stem or waterproof leaves, so on land it flops over and dries out.';
  else if(aq)wx=B.salt?(t.salt>=80?'It copes with salty sea water.':'Salt water dries out its cells.'):(t.salt>70?'It is built for salty water, not fresh water.':'Fresh water suits it.');
  else{
    wx=B.pdry>=.9?'Rain is very rare here.':B.pdry>=.4?'There is little rain in the dry season.':B.perma?'The soil is frozen for most of the year.':'Water is easy to find here.';
    if(B.pdry>=.25){const save=[],lose=[];
      if(t.leaf==='broad'&&t.leafSize>45)lose.push('large leaves');else save.push(t.leaf==='spines'?'spines instead of leaves':t.leaf==='broad'?'small leaves':t.leaf==='needles'?'needle leaves':'narrow leaves');
      if(t.wax>50)save.push('a waxy surface');
      if(t.pores==='night')save.push('pores that open at night');else lose.push('pores open by day');
      if(t.store==='water')save.push('water stored in its stem');
      if(save.length)wx+=` It saves water with ${joinL(save)}.`;
      if(lose.length&&s.water<70)wx+=` It loses water through ${joinL(lose)}.`}
    wx+=t.rootDepth>60?(B.perma?' Deep roots hit the permafrost and cannot grow.':' Deep roots reach water far underground.'):t.rootSpread>60?(B.perma?' Wide, shallow roots avoid the frozen layer below.':' Wide, shallow roots soak up rain quickly.'):' Short roots reach little water.';
  }
  n.water=wx;
  let tx;
  if(aq)tx=B.temps[B.hs][0]<5?'Ice can cover the surface in winter, but the water below stays above freezing.':'The water never freezes or gets too hot.';
  else if(s.tdir<0&&B.frost>0){tx=`Frost hits in the ${B.seasons[B.hs].toLowerCase()}.`;
    tx+=t.season==='evergreen'?(t.leaf==='broad'&&t.leafSize>45?' Large leaves kept all winter get frozen.':' Its leaves face the frost all winter.'):t.season==='deciduous'?' Dropping leaves protects it from frost.':' Dying back keeps it safe underground.';
    if(t.height<25)tx+=' Being low keeps it under a blanket of snow.';if(t.height>75)tx+=' Being tall exposes it to icy wind.';
    if(t.store==='water')tx+=' Water in the stem can freeze and burst it.'}
  else if(B.heatP>0){tx='Strong sun and hot ground.';tx+=t.leaf==='broad'&&t.leafSize>45?' Large leaves overheat.':' Small leaves stay cooler.';if(t.wax>50)tx+=' A waxy surface reflects some heat.';if(t.season==='dormant')tx+=' Dying back avoids the worst heat.'}
  else tx='Temperatures are mild for plants here.';
  n.temp=tx;
  let gx=`${B.grazers} eat plants here.`;
  if(t.defence==='thorns')gx+=' Thorns put most of them off.';if(t.defence==='bitter')gx+=' A bitter taste puts them off.';
  if(t.height>75&&!aq)gx+=B.id==='grassland'?' Most leaves are out of reach, except for giraffes.':' Most leaves are out of reach.';
  if(t.form==='herb')gx+=' It grows back from the base after grazing.';
  if(t.defence==='none'&&t.height<75&&t.form!=='herb')gx+=' Nothing stops grazers eating it.';
  n.graze=gx;
  let lx=aq?'Light fades quickly as water gets deeper.':B.comp>=.8?'Tall trees shade the ground.':'There is plenty of open space and light.';
  if(aq&&t.leaf==='broad'&&t.height>50)lx+=' Floating leaves catch full sunlight at the surface.';
  else if(aq)lx+=t.height>60?' Growing tall brings its leaves closer to the light.':' Short plants on the bottom get little light.';
  else{if(B.comp>=.8)lx+=t.height<30?' Low plants get little light.':t.height>75?' Growing tall reaches the light.':'';
    if(B.id==='forest'&&t.height<30&&t.season!=='evergreen')lx+=' It grows in early spring, before the trees above come into leaf.';
    if(B.perma)lx+=t.form==='tree'&&t.height>40?' The growing season is only a few weeks long, far too short to grow a tree.':' The growing season is only a few weeks long.';
    if(B.wind>=.5&&t.height>40)lx+=' Strong winds can break tall plants.'}
  if(aq&&B.wind>=.5)lx+=t.leaf==='ribbon'?' Ribbon leaves bend with the waves.':' Waves can rip it loose.';
  if(s.cost>.15&&s.costList.length)lx+=` Its ${joinL(s.costList.slice(0,3).map(x=>x[0]))} use energy that could go into growing.`;
  n.light=lx;
  return n;
}

Object.assign(M,{fmtT,tempRange,joinL,cap,SIZEW,animalNotes,plantNotes});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
