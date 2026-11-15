/* Adapt Lab designer prototype: one screen where a student changes their species.
   Real numbers from AdaptModel (sliced from Adapt-Lab.html), art from Rig, prices from AdaptCost and
   combinations from AdaptCombos when those files exist (small fallbacks with the same interface below). */
(function(){
"use strict";
const M=window.AdaptModel,R=window.Rig;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip=h=>String(h).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();

/* ---------- fallbacks with the agreed interface ---------- */
const PLAN_KEYS=['cov','blood','breathe','legs','wings'];
const FB_CAT={shape:3,fins:3,defence:3,fatWhere:2,posture:2,pattern:1,color:1,diet:1,activity:1,season:1,social:1,escape:1,store:1,care:1,senses:1};
const FB_NUM=['size','insul','fat','ears','legLen','tail','wingSize','finSize','eyes','waterSave','salt'];
const WORD={cov:'Body covering',blood:'Body heat',breathe:'Breathing',legs:'Legs',wings:'Wings',shape:'Body shape',fins:'Fins',defence:'Defence',fatWhere:'Fat store',posture:'Leg posture',pattern:'Pattern',color:'Colour',diet:'Diet',activity:'Active at',season:'Harsh season',social:'Lives',escape:'When hunted',store:'Food storing',care:'Parental care',senses:'Finds food by',
  size:'Body size',insul:'Coat thickness',fat:'Amount of fat',ears:'Ear size',legLen:'Leg length',tail:'Tail length',wingSize:'Wing size',finSize:'Fin size',eyes:'Eye size',waterSave:'Saving water',salt:'Coping with salt'};
const CostFB={BUDGET_PER_ERA:10,
  cost(a,b){const items=[];let total=0;const add=(key,points,why)=>{if(points>0){items.push({key,label:WORD[key]||key,from:a[key],to:b[key],points,why});total+=points}};
    PLAN_KEYS.forEach(k=>{if(a[k]!==b[k])add(k,8,'a new body design')});
    Object.keys(FB_CAT).forEach(k=>{if(a[k]!==b[k])add(k,FB_CAT[k],FB_CAT[k]>=3?'a big body change':'a small change')});
    FB_NUM.forEach(k=>add(k,Math.round(Math.abs((b[k]??0)-(a[k]??0))/10),'1 point for every 10 steps'));
    items.sort((x,y)=>y.points-x.points);return{total,items}},
  optionCost(t,k,v){return this.cost(t,{...t,[k]:v}).total}};
const CombosFB={
  find(t,bk){const B=M.BIOMES[bk]||{},out=[];const add=(id,good,a,b,text,pressure)=>out.push({id,good,a,b,text,pressure,inModel:true});
    if(t.activity==='night'&&t.eyes>=65)add('night-eyes',true,'Active at night','Big eyes','Big eyes gather more light in the dark.','food');
    if(t.activity==='night'&&t.senses==='sight'&&t.eyes<35)add('night-blind',false,'Active at night','Small eyes','It cannot see its food in the dark.','food');
    if(t.escape==='flee'&&t.legs!=='0'&&t.legLen>=65)add('flee-legs',true,'Escapes fast','Long legs','Long legs make a fast runner.','pred');
    if(t.escape==='flee'&&(t.defence==='shell'||(t.fatWhere==='all'&&t.fat>=65)))add('flee-heavy',false,'Escapes fast',t.defence==='shell'?'Heavy shell':'Thick fat','It is too heavy to run.','pred');
    if(t.escape==='hide'&&t.size<=30)add('hide-small',true,'Hides away','Small body','Small animals fit into burrows and cracks.','pred');
    if(t.escape==='hide'&&t.size>=75)add('hide-huge',false,'Hides away','Huge body','Nowhere is big enough to hide.','pred');
    if(t.season==='hibernate'&&t.fatWhere!=='none'&&t.fat>=50)add('hib-fat',true,'Hibernates','Fat store','Fat is the fuel for a long sleep.','food');
    if(t.defence==='poison'&&(t.color==='orange'||t.pattern==='stripes'||t.pattern==='spots'))add('poison-warn',true,'Poison','Bold colours','Predators learn the warning.','pred');
    if((t.cov==='fur'||t.cov==='feathers')&&t.insul>=70&&t.ears<=30&&B.cold)add('coat-ears',true,'Thick coat','Small ears','Less surface for heat to escape.','temp');
    if(t.shape==='stream'&&t.fins==='fins')add('stream-fins',true,'Streamlined','Fins','A smooth shape and paddles work together.','food');
    return out},
  apply(sc){return sc}};
const Cost=(window.AdaptCost&&typeof window.AdaptCost.cost==='function')?window.AdaptCost:CostFB;
const Combos=(window.AdaptCombos&&typeof window.AdaptCombos.find==='function')?window.AdaptCombos:CombosFB;
const BUDGET=Cost.BUDGET_PER_ERA||10;
const safe=(fn,fb)=>{try{return fn()}catch(e){if(!safe.warned){safe.warned=1;console.warn('designer fallback:',e.message)}return fb()}};
// a design that cannot be reached from the ancestor has total = Infinity (for example fur to an insect's exoskeleton)
const costOf=(a,b)=>safe(()=>{const r=Cost.cost(a,b);if(!r||typeof r.total!=='number'||isNaN(r.total)||!Array.isArray(r.items))throw new Error('no price');return r},()=>CostFB.cost(a,b));
// the combos module may take the biome as an id or as the biome object: try the id first
const either=(fn,bk)=>{try{return fn(bk)}catch(e){return fn(M.BIOMES[bk])}};
const combosOf=(t,bk)=>safe(()=>{const r=either(b=>Combos.find(t,b),bk);if(!Array.isArray(r))throw new Error('no combos');return r},()=>CombosFB.find(t,bk));

/* ---------- ancestors: small plain designs that only just survive (50–65% a year), found by a search over the model ---------- */
const ANC={
  tundra:{name:'Tundra ancestor',t:{color:'grey',fatWhere:'all',season:'migrate',size:30,insul:70,ears:30,legLen:40,tail:20}},
  desert:{name:'Desert ancestor',t:{color:'sandy',activity:'crep',season:'migrate',insul:25,ears:55,legLen:40,tail:45,eyes:30,waterSave:55}},
  forest:{name:'Forest ancestor',t:{diet:'both',size:25,insul:45,legLen:40,tail:45}},
  grassland:{name:'Grassland ancestor',t:{season:'hibernate',insul:20,legLen:55,tail:40}},
  ocean:{name:'Ocean ancestor',t:{cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',color:'grey',diet:'both',care:'none',size:20,tail:0,finSize:45,salt:80}},
  freshwater:{name:'River ancestor',t:{cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',color:'sandy',diet:'both',escape:'freeze',care:'none',size:20,insul:50,tail:0,finSize:45}}
};
const BIOME_IDS=['tundra','desert','forest','grassland','ocean','freshwater'];

/* ---------- trait groups: the sim's own sections, plus the fine-tune sliders the old app hid under Advanced ---------- */
const EXTRA_NUM={Moving:[{k:'tail',label:'Tail length',show:()=>true},{k:'wingSize',label:'Wing size',show:t=>t.wings!=='none'},{k:'finSize',label:'Fin size',show:t=>t.fins==='fins'}],
  'Keeping warm, cool and wet':[{k:'fat',label:'Amount of fat',show:t=>t.fatWhere!=='none'}],'Looks & defence':[{k:'eyes',label:'Eye size',show:()=>true}]};
const ENDS={};M.A_SLIDERS.forEach(s=>ENDS[s.k]=s.ends);
const ICON={
  Body:'<ellipse cx="11" cy="14" rx="8" ry="5.5"/><circle cx="18.5" cy="8" r="3"/>',
  Moving:'<path d="M6 20l3-7 4 2 2-6 4 1"/><circle cx="16" cy="5" r="2"/>',
  'Keeping warm, cool and wet':'<path d="M12 3v10"/><circle cx="12" cy="17" r="4"/>',
  'Looks & defence':'<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>',
  Behaviour:'<path d="M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3z"/><path d="M9 21.5h6"/>'};
const SHORT={Body:'Body',Moving:'Moving','Keeping warm, cool and wet':'Warm, cool, wet','Looks & defence':'Looks, defence',Behaviour:'Behaviour'};
const GROUPS=M.A_SECTIONS.map(sec=>({title:sec.title,beh:!!sec.beh,rows:sec.rows.map(r=>({k:r.k,num:!!r.num,opts:r.opts,label:r.label,show:r.show||(()=>true)}))
  .concat((EXTRA_NUM[sec.title]||[]).map(x=>({k:x.k,num:true,label:x.label,show:x.show})))}));
const PRESS=[
  {k:'temp',name:'Body temperature',icon:'<path d="M12 3v10"/><circle cx="12" cy="17" r="4"/>',about:'Too hot or too cold for too long and it cannot live.'},
  {k:'breath',name:'Breathing',icon:'<path d="M3 9h10a3 3 0 1 0-3-3"/><path d="M3 14h14a3 3 0 1 1-3 3"/>',about:'It must get oxygen from the air or the water around it.'},
  {k:'pred',name:'Predators',icon:'<path d="M3 7l3 6 3-5 3 5 3-5 3 5 3-6"/><path d="M4 18h16"/>',about:'Hunters catch the animals that are easiest to find and catch.'},
  {k:'food',name:'Food & energy',icon:'<path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z"/><path d="M5 19l8-8"/>',about:'It must find more energy than its body uses. Every adaptation costs energy.'},
  {k:'water',name:'Water & salt',icon:'<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',about:'It must not dry out, and its body must cope with the salt around it.'}];

/* ---------- state ---------- */
const S={biome:'forest',anc:null,t:null,name:'',tab:0,prev:null,moveUntil:0,rowsSig:''};
function loadBiome(bk){S.biome=bk;S.anc={...M.DEF_A,...ANC[bk].t};S.t={...S.anc};S.name=ANC[bk].name;$('spName').value=S.name;S.prev=null;S.rowsSig='';render(true)}

/* ---------- the model: five yearly survival chances and the overall chance ---------- */
function assess(t,bk){
  const o={kind:'animal',t};let sc=M.scoresFor(o,bk);
  sc=safe(()=>{const r=either(b=>Combos.apply(sc,t,b),bk);return r&&typeof r.pred==='number'&&typeof r.food==='number'?r:sc},()=>sc);
  const D={temp:1,breath:1,pred:1,food:1,water:1};
  for(let s=0;s<4;s++){const hz=M.seasonHaz(sc,bk,o,s,false);for(const hk in hz){const k=(hk==='cold'||hk==='heat')?'temp':hk;if(k in D)D[k]*=hz[hk]>=1?0:1-Math.min(.95,hz[hk])}}
  const lethal=M.lethalOf(sc,bk,o);const year=lethal?0:M.yearSurvival(sc,bk,o);
  const bars={};for(const k in D)bars[k]=Math.round(D[k]*100);
  return{sc,bars,year:Math.round(year*100),lethal};
}
function threatText(a,bk){const B=M.BIOMES[bk];
  if(a.lethal)return'It cannot live here: '+a.lethal.why+'.';
  const worst=PRESS.reduce((m,p)=>a.bars[p.k]<a.bars[m.k]?p:m,PRESS[0]);const harsh=B.seasons[B.hs].toLowerCase();
  const cold=(a.sc.ts||[]).some(x=>x.dir<0&&x.s<90);
  return{temp:cold?`It gets too cold in the ${harsh}.`:`It gets too hot in the ${harsh}.`,breath:'It struggles to get enough oxygen.',pred:`Predators catch it too easily: ${B.preds.toLowerCase()}.`,
    food:`It cannot find enough food, most of all in the ${harsh}.`,water:B.aquatic?'The salt in the water is wrong for its body.':'It loses water faster than it can drink.'}[worst.k];
}

/* ---------- rendering ---------- */
function sizeWord(v){return v<12?'tiny, like a beetle':v<30?'small, like a mouse':v<50?'like a rabbit':v<65?'like a fox':v<80?'like a deer':'huge, like an elephant'}
function renderBiomes(){$('biomes').innerHTML=BIOME_IDS.map(b=>`<button type="button" data-b="${b}" aria-pressed="${b===S.biome}"><i style="background:${M.BIOMES[b].dot}"></i>${esc(M.BIOMES[b].name)}</button>`).join('')}
function renderTabs(cost){
  const per=GROUPS.map(g=>cost.items.filter(it=>g.rows.some(r=>r.k===it.key)).length);
  $('tabs').innerHTML=GROUPS.map((g,i)=>`<button type="button" role="tab" class="${g.beh?'beh':''}" data-tab="${i}" aria-selected="${i===S.tab}"><svg viewBox="0 0 24 24">${ICON[g.title]||ICON.Body}</svg>${esc(SHORT[g.title]||g.title)}${per[i]?`<span class="dot">${per[i]}</span>`:''}</button>`).join('')
    +'<div class="kind"><b style="background:var(--accent)">P</b>body<br><b style="background:var(--beh)">B</b>behaviour</div>';
}
function priceFor(k,v,total){const r=costOf(S.anc,{...S.t,[k]:v});return isFinite(r.total)?r.total-total:Infinity}
function whyFar(k,v){const r=costOf(S.anc,{...S.t,[k]:v});const it=r.items.find(x=>!isFinite(x.points));return(it&&it.why)||'This body design is too different to evolve from your ancestor.'}
function priceHtml(d,total,isCur,isStart){
  if(isCur)return`<span class="price">${isStart?'start':'chosen'}</span>`;
  if(!isFinite(d))return'<span class="price over">too far</span>';
  if(d===0)return'<span class="price free">free</span>';
  if(d<0)return`<span class="price back">${d} back</span>`;
  return`<span class="price${total+d>BUDGET?' over':''}">+${d}</span>`}
function renderOpts(cost,force){
  const g=GROUPS[S.tab],B=M.BIOMES[S.biome],rows=g.rows.filter(r=>r.show(S.t,B));
  const sig=S.tab+'|'+S.biome+'|'+rows.map(r=>r.k).join(',');
  const host=$('opts');
  if(force||sig!==S.rowsSig){S.rowsSig=sig;const st=host.scrollTop;
    host.className='opts'+(g.beh?' beh':'');
    host.innerHTML=`<h2>${esc(g.title)} <em class="${g.beh?'beh':''}">${g.beh?'Behaviours':'Body features'}</em></h2>`+rows.map(r=>{
      const lab=typeof r.label==='function'?r.label():esc(r.label);
      if(r.num){const e=ENDS[r.k]||['Less','More'];
        return`<div class="row" data-row="${r.k}"><div class="lbl">${lab}</div><div class="slide"><input type="range" min="0" max="100" step="5" data-k="${r.k}" aria-label="${esc(strip(lab))}"><input type="number" min="0" max="100" step="5" data-k="${r.k}" aria-label="${esc(strip(lab))} as a number"><span class="price" data-p="${r.k}"></span><div class="ends"><span>${esc(e[0])}</span><span>${esc(e[1])}</span></div></div></div>`}
      const sw=r.k==='color';
      return`<div class="row" data-row="${r.k}"><div class="lbl">${lab}</div><div class="chips">${r.opts.map(([v,l])=>`<button type="button" class="chip${sw?' sw':''}" data-k="${r.k}" data-v="${esc(v)}">${sw?`<i style="background:${(R.PAL[v]||{}).b||'#888'}"></i>`:''}<span>${esc(l)}</span><span class="pw"></span></button>`).join('')}</div></div>`}).join('');
    host.scrollTop=st}
  // refresh pressed states and prices in place (no rebuild, so nothing jumps while a slider is dragged)
  host.querySelectorAll('.chip').forEach(b=>{const k=b.dataset.k,v=b.dataset.v,cur=String(S.t[k])===v;b.setAttribute('aria-pressed',cur);
    const d=cur?0:priceFor(k,v,cost.total);b.dataset.far=isFinite(d)?'':'1';b.querySelector('.pw').innerHTML=priceHtml(d,cost.total,cur,String(S.anc[k])===v)});
  host.querySelectorAll('input[data-k]').forEach(inp=>{if(document.activeElement!==inp||inp.type==='range')inp.value=S.t[inp.dataset.k]});
  host.querySelectorAll('[data-p]').forEach(p=>{const it=cost.items.find(x=>x.key===p.dataset.p);p.textContent=it?'+'+it.points:'free';p.title=it&&it.why?it.why:'';p.className='price'+(it?'':' free')});
}
function renderVitals(a,anc){
  const cls=v=>v>=70?'good':v>=45?'ok':'bad';const d=a.year-anc.year;
  $('headline').innerHTML=`<div class="pct ${cls(a.year)}">${a.year}<small>%</small></div><div class="cap">Chance of surviving a year</div>`+
    `<div class="cmp">Your ancestor: ${anc.year}% ${d?`· <b class="${d>0?'up':'down'}">${d>0?'up':'down'} ${Math.abs(d)}</b>`:''}</div><div class="threat"><span>Biggest threat</span>${esc(threatText(a,S.biome))}</div>`;
  const worst=PRESS.reduce((m,p)=>a.bars[p.k]<a.bars[m.k]?p:m,PRESS[0]).k;
  if(!$('bars').children.length){$('bars').innerHTML=PRESS.map(p=>`<button type="button" class="bar" data-bar="${p.k}"><svg viewBox="0 0 24 24">${p.icon}</svg><span class="nm"><span>${p.name}</span><em></em></span><span class="num"></span><span class="track"><span class="fill"></span><span class="ghost"></span></span></button>`).join('')+'<div class="legend"><i></i>The line shows your ancestor</div>'}
  PRESS.forEach(p=>{const el=$('bars').querySelector(`[data-bar="${p.k}"]`),v=a.bars[p.k];el.className='bar '+cls(v)+(p.k===worst&&v<70?' worst':'');
    el.querySelector('.fill').style.width=v+'%';el.querySelector('.ghost').style.left=`calc(${anc.bars[p.k]}% - 1px)`;el.querySelector('.num').textContent=v;
    if(S.prev&&S.prev.bars[p.k]!==v){const dd=v-S.prev.bars[p.k],em=el.querySelector('em');em.textContent=(dd>0?'+':'−')+Math.abs(dd);em.className='show '+(dd>0?'up':'down');clearTimeout(em._t);em._t=setTimeout(()=>em.classList.remove('show'),1900)}});
  $('mini').innerHTML=`<div class="p ${cls(a.year)}">${a.year}%</div>`+PRESS.map(p=>`<div class="m ${cls(a.bars[p.k])}">${p.name.split(' ')[0]}<i><u style="width:${a.bars[p.k]}%"></u></i></div>`).join('');
}
function renderCombos(list){
  const good=list.filter(c=>c.good),bad=list.filter(c=>!c.good);
  const card=c=>`<div class="combo ${c.good?'good':'bad'}"><b>${esc(c.a)} + ${esc(c.b)}</b>${esc(c.text)}</div>`;
  $('combos').innerHTML=(good.length?`<h3>Works well together</h3>${good.map(card).join('')}`:'')+(bad.length?`<h3>Clashes</h3>${bad.map(card).join('')}`:'')+
    (!list.length?'<h3>Traits that work together</h3><div class="combo none">None yet. Try pairing a behaviour with a body feature that helps it, like night activity and big eyes.</div>':'');
}
const cap=x=>String(x).charAt(0).toUpperCase()+String(x).slice(1);
function valWord(k,v){for(const g of GROUPS)for(const r of g.rows)if(r.k===k&&r.opts&&!r.num){const o=r.opts.find(x=>String(x[0])===String(v));if(o)return o[1]}return String(v)}
function renderDock(cost){
  const far=!isFinite(cost.total),over=far||cost.total>BUDGET,spent=far?BUDGET:cost.total;$('meter').className='meter'+(over?' over':'');
  $('meter').innerHTML=`<div class="txt">This era: <b>${far?'too far':cost.total}</b>${far?'':` of ${BUDGET} points`}${over&&!far?' · too many':''}</div><div class="pips">${Array.from({length:BUDGET},(_,i)=>`<i class="${i<spent?(over?'over':'on'):''}"></i>`).join('')}</div>`;
  $('changes').innerHTML=cost.items.length?cost.items.map(it=>`<button type="button" class="chg" data-undo="${it.key}">${esc(cap(it.label||WORD[it.key]||it.key))} <small>${esc(valWord(it.key,it.from))} → ${esc(valWord(it.key,it.to))}</small><b>${isFinite(it.points)?it.points:'✕'}</b><u>Undo</u></button>`).join(''):'<span class="none">No changes yet. Each change costs evolution points: small steps are cheap, new body designs cost a lot.</span>';
  $('release').setAttribute('aria-disabled',over);$('era').textContent=`Era 1 · ${Math.max(0,BUDGET-spent)} points left`;
}
function renderTags(){
  $('sizeTag').textContent='Size: '+sizeWord(S.t.size);
  const cl=M.classify(S.t);$('likeTag').innerHTML=cl?`Most like a <b>${esc(cl.g.n)}</b>`:'';
  const ch=M.realChecks(S.t);$('checkTag').hidden=!ch.length;$('checkTag').textContent=ch.length?`⚠ ${ch.length} real-world check${ch.length>1?'s':''}`:'';
}
let ANC_A=null,CUR=null;
function render(full){
  const cost=costOf(S.anc,S.t);const a=assess(S.t,S.biome);if(full||!ANC_A)ANC_A=assess(S.anc,S.biome);CUR=a;
  if(full)renderBiomes();
  renderTabs(cost);renderOpts(cost,full);renderVitals(a,ANC_A);renderCombos(combosOf(S.t,S.biome));renderDock(cost);renderTags();
  S.prev=a;SPEC=null;
}
function setTrait(k,v){if(S.t[k]===v)return;S.t={...S.t,[k]:v};S.moveUntil=performance.now()+1500;$('stageHint').classList.add('gone');render(false)}

/* ---------- events ---------- */
$('biomes').addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(b&&b.dataset.b!==S.biome)loadBiome(b.dataset.b)});
$('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;S.tab=+b.dataset.tab;$('opts').scrollTop=0;render(false)});
$('opts').addEventListener('click',e=>{const vt=e.target.closest('.vterm');if(vt){const d=M.VOCAB[vt.dataset.term];if(d)pop(vt,`<b>${esc(d[0])}</b>${esc(d[1])}`);e.stopPropagation();return}
  const c=e.target.closest('.chip');if(!c)return;const k=c.dataset.k;const cur=S.anc[k];
  if(c.dataset.far){pop(c,'<b>Too far to evolve</b>'+esc(whyFar(k,typeof cur==='number'?+c.dataset.v:c.dataset.v)));e.stopPropagation();return}setTrait(k,typeof cur==='number'?+c.dataset.v:c.dataset.v)});
$('opts').addEventListener('input',e=>{const inp=e.target.closest('input[data-k]');if(!inp||inp.type!=='range')return;setTrait(inp.dataset.k,+inp.value)});
$('opts').addEventListener('change',e=>{const inp=e.target.closest('input[data-k]');if(!inp||inp.type!=='number')return;const v=clamp(Math.round(+inp.value||0),0,100);inp.value=v;setTrait(inp.dataset.k,v)});
$('opts').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input[type=number]'))e.target.blur()});
$('changes').addEventListener('click',e=>{const b=e.target.closest('[data-undo]');if(b)setTrait(b.dataset.undo,S.anc[b.dataset.undo])});
$('reset').addEventListener('click',()=>{S.t={...S.anc};S.moveUntil=performance.now()+900;render(false)});
$('bars').addEventListener('click',e=>{const b=e.target.closest('[data-bar]');if(!b)return;const p=PRESS.find(x=>x.k===b.dataset.bar);
  pop(b,`<b>${p.name}: ${CUR.bars[p.k]} out of 100</b>${p.about} The number is its chance of getting through a whole year of this one pressure. Your ancestor scored ${ANC_A.bars[p.k]}.`)});
$('checkTag').addEventListener('click',e=>{pop(e.currentTarget,'<b>Real-world check</b><ul>'+M.realChecks(S.t).map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>')});
$('likeTag').addEventListener('click',e=>{const cl=M.classify(S.t);if(cl)pop(e.currentTarget,`<b>Most like a ${esc(cl.g.n)}</b>`+cl.r.map(([l,ok])=>`${ok?'✓':'✗'} ${esc(l)}`).join(' · '))});
$('sizeTag').addEventListener('click',e=>pop(e.currentTarget,'<b>Body size</b>Big bodies keep heat in and scare off small hunters, but they need more food.'));
$('spName').addEventListener('input',e=>{S.name=e.target.value});
$('release').addEventListener('click',()=>{const cost=costOf(S.anc,S.t);
  if(!isFinite(cost.total)||cost.total>BUDGET){$('meter').classList.remove('shake');void $('meter').offsetWidth;$('meter').classList.add('shake');pop($('meter'),isFinite(cost.total)?`<b>Too many changes</b>You have ${BUDGET} points this era. Undo ${cost.total-BUDGET} point${cost.total-BUDGET>1?'s':''} of changes.`:'<b>Too far to evolve</b>One of your changes cannot evolve from this ancestor. Undo it.');return}
  $('mwin').innerHTML=`<h2>${esc(S.name||'Your species')} is ready</h2><p>Over thousands of years, these changes spread through the population. Next, the living scene shows what happens.</p>`+
    `<div class="sum"><div><b>${CUR.year}%</b>chance of surviving a year</div><div><b>${ANC_A.year}%</b>your ancestor</div><div><b>${cost.total} of ${BUDGET}</b>points spent</div><div><b>${combosOf(S.t,S.biome).filter(c=>c.good).length}</b>traits working together</div></div>`+
    `<button type="button" class="btn" id="mBack">Back to the designer</button>`;$('modal').hidden=false;$('mBack').focus();$('mBack').onclick=()=>{$('modal').hidden=true}});
$('modal').addEventListener('click',e=>{if(e.target===$('modal'))$('modal').hidden=true});
function pop(anchor,html){const p=$('pop');p.innerHTML=html;p.hidden=false;const r=anchor.getBoundingClientRect(),w=Math.min(300,innerWidth-16);p.style.maxWidth=w+'px';
  const ph=p.offsetHeight,pw=p.offsetWidth;let x=clamp(r.left+r.width/2-pw/2,8,innerWidth-pw-8),y=r.bottom+8;if(y+ph>innerHeight-8)y=Math.max(8,r.top-ph-8);p.style.left=x+'px';p.style.top=y+'px';pop.at=performance.now()}
document.addEventListener('click',()=>{if(performance.now()-(pop.at||0)>60)$('pop').hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('pop').hidden=true;$('modal').hidden=true}});

/* ---------- the stage: the animal, alive, in its biome ---------- */
const cv=$('stage'),cx=cv.getContext('2d');let SPEC=null,W=0,H=0,phase=0,mv=0,last=0,biomeOK=!!(window.Biomes&&typeof window.Biomes.draw==='function');
const SKY={tundra:['#8fb6d8','#dcebf2','#f1f5f7','#e2ebf1'],desert:['#f0b46a','#f9dfae','#e8c583','#d8a95e'],forest:['#9fc7d6','#dcebdd','#7fa35b','#56793f'],grassland:['#f2b56a','#fbeccb','#e6c877','#d2a955'],ocean:['#1f6f9c','#57b3c9','#d9c9a0','#cbb88a'],freshwater:['#3f8f8a','#8ec9b6','#b9a779','#a08f62']};
function ownBackdrop(c,w,h,bk,t){const K=SKY[bk],aq=!!M.BIOMES[bk].aquatic,hz=aq?h*.86:h*.6;
  let g=c.createLinearGradient(0,0,0,hz);g.addColorStop(0,K[0]);g.addColorStop(1,K[1]);c.fillStyle=g;c.fillRect(0,0,w,h);
  if(aq){c.save();c.globalAlpha=.08;c.fillStyle='#fff';for(let i=0;i<5;i++){const x=w*(.1+i*.2)+Math.sin(t*.3+i)*w*.02;c.beginPath();c.moveTo(x,0);c.lineTo(x+w*.08,0);c.lineTo(x-w*.06,h);c.lineTo(x-w*.18,h);c.closePath();c.fill()}c.restore()}
  else{const sx=w*.78,sy=hz*.34,sg=c.createRadialGradient(sx,sy,0,sx,sy,h*.4);sg.addColorStop(0,'rgba(255,250,225,.8)');sg.addColorStop(1,'rgba(255,250,225,0)');c.fillStyle=sg;c.fillRect(0,0,w,hz);c.fillStyle='#fff6dc';c.beginPath();c.arc(sx,sy,h*.045,0,7);c.fill();
    [[.11,1.3,.55],[.07,4.1,.3],[.035,7.7,.12]].forEach(([amp,seed,mixT],i)=>{c.fillStyle=R.mix(K[1],K[2],.25+i*.3);c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=10){const u=x/w*6+seed;c.lineTo(x,hz-h*amp*(.5+.3*Math.sin(u)+.25*Math.sin(u*2.3+1))+i*h*.02)}c.lineTo(w,h);c.closePath();c.fill()})}
  g=c.createLinearGradient(0,hz,0,h);g.addColorStop(0,K[2]);g.addColorStop(1,K[3]);c.fillStyle=g;c.fillRect(0,hz+(aq?0:h*.03),w,h)}
function frame(ts){
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;const t=ts/1000;
  const dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;
  if(w&&h){if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}cx.setTransform(dpr,0,0,dpr,0,0);W=w;H=h;
    const B=M.BIOMES[S.biome],aq=!!B.aquatic;
    let drawn=false;if(biomeOK){try{cx.save();window.Biomes.draw(cx,w,h,{biome:S.biome,season:B.hs,night:0,t});cx.restore();drawn=true}catch(e){cx.restore();biomeOK=false;console.warn('Biomes.draw failed, using the simple backdrop:',e.message)}}
    if(!drawn)ownBackdrop(cx,w,h,S.biome,t);
    if(!SPEC)SPEC=safe(()=>R.specOf(S.t,7),()=>R.specOf({...M.DEF_A},7));
    const z=safe(()=>R.sizeOf(SPEC),()=>({len:120,height:100}));const swims=!!z.swims;
    const want=ts<S.moveUntil?1:0;mv=lerp(mv,want,.08);phase+=dt*(.5+.9*mv)*(swims?1:mv>0.02?1:0);
    const grow=lerp(.62,1.12,S.t.size/100);const sc=Math.min(w*.5/z.len,h*.5/z.height)*grow;
    const gx=w*.5+(z.dx||0)*sc,gy=swims&&aq?h*.52+Math.sin(t*.9)*h*.012:h*(aq?.84:.8);
    cx.save();cx.translate(gx,gy);if(!(swims&&aq))R.shadow(cx,sc*z.len*.5,.26);cx.scale(sc,sc);
    try{R.draw(cx,SPEC,{t,phase,move:swims?1:mv,blink:(t%4.3)<.12,tongue:SPEC.tongue&&(t%3)<.3,swim:aq})}catch(e){if(!frame.warned){frame.warned=1;console.warn('draw failed:',e.message)}}
    cx.restore()}
  requestAnimationFrame(frame);
}
window.__designer={S,assess,costOf,combosOf,setTrait,loadBiome,GROUPS,usingCost:Cost!==CostFB,usingCombos:Combos!==CombosFB};
loadBiome('forest');requestAnimationFrame(frame);
})();
