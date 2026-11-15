/* Adapt Lab model · food webs for each biome and how populations push each other up and down
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
const {clamp,PRESETS,DEF_A,DEF_P,scoresFor,lethalOf,yearSurvival,orgName}=M;
const FWS={
 tundra:[
  {id:'sedge',name:'Cotton grass',lv:1,plant:'grass',t:{height:30}},
  {id:'willow',name:'Arctic willow',lv:1,plant:'arctic-willow'},
  {id:'lemming',name:'Lemming',lv:2,eats:['sedge','willow'],t:{size:8,color:'brown',insul:70,ears:10,legLen:20,tail:5}},
  {id:'hare',name:'Arctic hare',lv:2,eats:['willow','sedge'],pre:'arctic-hare'},
  {id:'caribou',name:'Caribou',lv:2,eats:['sedge','willow'],t:{shape:'tall',size:85,color:'brown',insul:80,legLen:85,tail:10,ears:25}},
  {id:'afox',name:'Arctic fox',lv:3,eats:['lemming','hare'],pre:'arctic-fox'},
  {id:'owl',name:'Snowy owl',lv:3,eats:['lemming','hare'],pre:'snowy-owl'},
  {id:'wolf',name:'Grey wolf',lv:4,eats:['caribou','hare','afox'],t:{shape:'long',size:70,color:'grey',insul:75,legLen:70,tail:60,ears:35,diet:'meat'}}],
 desert:[
  {id:'cactus',name:'Saguaro cactus',lv:1,plant:'saguaro'},
  {id:'dgrass',name:'Desert grass',lv:1,plant:'grass',t:{height:30}},
  {id:'locust',name:'Desert locust',lv:2,eats:['dgrass','cactus'],pre:'locust'},
  {id:'jrabbit',name:'Jackrabbit',lv:2,eats:['dgrass','cactus'],t:{size:22,color:'sandy',ears:95,legLen:70,tail:10,insul:30}},
  {id:'lizard',name:'Desert lizard',lv:3,eats:['locust'],t:{cov:'scales',blood:'cold',shape:'long',color:'sandy',pattern:'spots',size:8,legLen:30,tail:50,diet:'meat',posture:'sprawl',senses:'tongue',eyes:30}},
  {id:'fennec',name:'Fennec fox',lv:3,eats:['locust','jrabbit','lizard'],pre:'fennec'},
  {id:'hawk',name:'Red-tailed hawk',lv:4,eats:['jrabbit','lizard','fennec'],t:{cov:'feathers',legs:'2',legLen:25,wings:'fly',wingSize:85,color:'brown',size:40,tail:40,diet:'meat',eyes:90,insul:40}}],
 forest:[
  {id:'oak',name:'English oak',lv:1,plant:'oak'},
  {id:'bluebell',name:'Bluebell',lv:1,plant:'bluebell'},
  {id:'caterp',name:'Caterpillar',lv:2,eats:['oak'],t:{cov:'exo',blood:'cold',breathe:'tubes',shape:'long',legs:'6',legLen:15,color:'green',size:3,tail:0,eyes:20}},
  {id:'rabbit',name:'Rabbit',lv:2,eats:['bluebell','oak'],pre:'rabbit'},
  {id:'deer',name:'Red deer',lv:2,eats:['oak','bluebell'],t:{shape:'tall',size:75,color:'brown',insul:45,legLen:85,tail:15,ears:55}},
  {id:'frog',name:'Wood frog',lv:3,eats:['caterp'],pre:'wood-frog'},
  {id:'fox',name:'Red fox',lv:3,eats:['rabbit','frog'],t:{shape:'long',color:'orange',size:35,insul:55,legLen:50,tail:70,ears:60,diet:'meat',senses:'smell'}},
  {id:'owl',name:'Tawny owl',lv:3,eats:['rabbit','frog'],t:{cov:'feathers',legs:'2',legLen:20,wings:'fly',wingSize:75,color:'brown',pattern:'spots',size:30,tail:30,diet:'meat',eyes:95,insul:60}},
  {id:'wolf',name:'Grey wolf',lv:4,eats:['deer','fox'],t:{shape:'long',size:70,color:'grey',insul:60,legLen:70,tail:60,ears:35,diet:'meat'}}],
 grassland:[
  {id:'grass',name:'Red oat grass',lv:1,plant:'grass'},
  {id:'acacia',name:'Acacia tree',lv:1,plant:'acacia'},
  {id:'locust',name:'Locust',lv:2,eats:['grass'],pre:'locust'},
  {id:'zebra',name:'Zebra',lv:2,eats:['grass'],pre:'zebra'},
  {id:'gazelle',name:'Gazelle',lv:2,eats:['grass','acacia'],t:{shape:'tall',size:50,color:'sandy',pattern:'counter',insul:15,legLen:90,tail:15,ears:55}},
  {id:'giraffe',name:'Giraffe',lv:2,eats:['acacia'],t:{shape:'tall',size:98,color:'orange',pattern:'spots',insul:10,legLen:98,tail:30,ears:30}},
  {id:'cheetah',name:'Cheetah',lv:3,eats:['gazelle'],t:{shape:'long',size:60,color:'sandy',pattern:'spots',insul:15,legLen:90,tail:75,ears:25,diet:'meat'}},
  {id:'lion',name:'Lion',lv:4,eats:['zebra','gazelle','giraffe'],t:{shape:'long',size:80,color:'sandy',insul:20,legLen:70,tail:60,ears:25,diet:'meat'}}],
 ocean:[
  {id:'phyto',name:'Phytoplankton',lv:1,plankton:'#5fa04a'},
  {id:'kelp',name:'Kelp',lv:1,plant:'eelgrass',t:{height:90}},
  {id:'zoo',name:'Zooplankton',lv:2,eats:['phyto'],plankton:'#d98a6a'},
  {id:'urchin',name:'Sea urchin',lv:2,eats:['kelp'],t:{cov:'exo',blood:'cold',breathe:'gills',shape:'round',legs:'0',defence:'spines',color:'black',size:8,tail:0,eyes:5}},
  {id:'mackerel',name:'Mackerel',lv:3,eats:['zoo'],pre:'mackerel'},
  {id:'crab',name:'Shore crab',lv:3,eats:['urchin','zoo'],pre:'crab'},
  {id:'seal',name:'Harbour seal',lv:4,eats:['mackerel','crab'],pre:'seal'},
  {id:'shark',name:'Shark',lv:4,eats:['seal','mackerel'],t:{cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',finSize:80,color:'grey',pattern:'counter',size:88,tail:0,diet:'meat',eyes:50,salt:95}}],
 freshwater:[
  {id:'algae',name:'Algae',lv:1,plankton:'#4f9a5a'},
  {id:'lily',name:'Water lily',lv:1,plant:'water-lily'},
  {id:'snail',name:'Pond snail',lv:2,eats:['algae','lily'],t:{cov:'skin',blood:'cold',breathe:'skinlungs',shape:'long',legs:'0',defence:'shell',color:'brown',size:4,tail:0,eyes:20}},
  {id:'mayfly',name:'Mayfly larva',lv:2,eats:['algae'],t:{cov:'exo',blood:'cold',breathe:'gills',shape:'long',legs:'6',legLen:30,color:'brown',size:3,tail:40,eyes:30}},
  {id:'trout',name:'Brown trout',lv:3,eats:['mayfly','snail'],pre:'trout'},
  {id:'frog',name:'Common frog',lv:3,eats:['mayfly'],pre:'common-frog'},
  {id:'heron',name:'Grey heron',lv:4,eats:['trout','frog'],t:{cov:'feathers',legs:'2',legLen:98,wings:'fly',wingSize:80,color:'grey',shape:'tall',size:55,tail:25,diet:'meat',eyes:70}},
  {id:'pike',name:'Pike',lv:4,eats:['trout','frog'],t:{cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',finSize:50,color:'green',pattern:'spots',size:55,tail:0,diet:'meat',eyes:60}}]
};
const LVNAME={1:'Producer',2:'Primary consumer',3:'Secondary consumer',4:'Top predator'};
const LVCOL={1:'#3f8f4a',2:'#c9a227',3:'#d9792b',4:'#b8432f'};
function fwTraits(s){if(s.plankton)return null;if(s.plant){const base=PRESETS[s.plant]?PRESETS[s.plant].t:DEF_P;return{...DEF_P,...base,...(s.t||{})}}
  const base=s.pre?PRESETS[s.pre].t:DEF_A;return{...DEF_A,...base,...(s.t||{})}}
/* --- model: generalised Lotka-Volterra, populations as an index (1 = normal) --- */
const FWG=1.5,FWP=.5;
function fwBuild(list,extra){
  const sp=list.map(s=>({...s,eats:[...(s.eats||[])]}));const n0=sp.length;
  if(extra)sp.push({...extra});
  const n=sp.length,idx={};sp.forEach((s,i)=>idx[s.id]=i);
  sp.forEach(s=>{s.foods=s.eats.map(id=>idx[id]).filter(j=>j!=null);s.preds=[];s.bonus=[];s.extraPred=[]});
  sp.forEach((s,i)=>{if(i<n0)s.foods.forEach(j=>sp[j].preds.push(i))});
  if(extra){const me=n-1;sp[me].foods.forEach(j=>sp[j].extraPred.push(me));
    (extra.eatenBy||[]).forEach(id=>{const p=idx[id];if(p!=null){sp[me].preds.push(p);sp[p].bonus.push(me)}})}
  sp.forEach(s=>{s.self=s.lv===1?1:.4;s.b=s.self+(s.preds.length?FWP:0)-(s.lv===1?0:FWG)});
  if(extra)sp[n-1].b+=extra.fit||0;
  return{sp,idx,n0}}
function fwGrowth(W,N,i){const s=W.sp[i];let g=s.b-s.self*N[i];
  if(s.foods.length){const k=s.foods.length,kav=s.foods.filter(j=>N[j]>0).length;const c=FWG/(.5*k+.5*Math.max(1,kav));s.foods.forEach(j=>g+=c*N[j])}
  s.bonus.forEach(j=>g+=.5*FWG/Math.max(1,s.foods.length)*N[j]);
  if(s.preds.length){const m=s.preds.length;s.preds.forEach(p=>g-=FWP/m*N[p])}
  s.extraPred.forEach(p=>g-=FWP/Math.max(1,s.preds.length)*.6*N[p]);
  return g}
function fwStep(W,N,rem,dt){const M=N.slice();for(let i=0;i<N.length;i++){if(N[i]<=0||rem[i]){M[i]=0;continue}M[i]=Math.min(4,N[i]*Math.exp(fwGrowth(W,N,i)*dt));if(M[i]<1e-3)M[i]=0}return M}
/* --- state --- */
/* fwMe(org, biomeId) builds the food-web entry for a student's own organism. */
function fwMe(o,bk){const sc=scoresFor(o,bk);const ys=lethalOf(sc,bk,o)?0:yearSurvival(sc,bk,o);const fit=clamp(1.6*(ys-.55),-1.2,.6);
  const list=FWS[bk];const ids=l=>list.filter(s=>s.lv===l).map(s=>s.id);
  let lv,eats,by;
  if(o.kind==='plant'){lv=1;eats=[];by=ids(2)}
  else if(o.t.diet==='plants'){lv=2;eats=ids(1);by=[...ids(3),...ids(4)]}
  else if(o.t.diet==='meat'){if(o.t.size>=80){lv=4;eats=[...ids(2),...ids(3)];by=[]}else{lv=3;eats=ids(2);by=ids(4)}}
  else{lv=3;eats=[...ids(1),...ids(2)];by=ids(4)}
  return{id:'me',me:true,name:orgName(o),lv,eats,eatenBy:by,fit,ys,t:JSON.parse(JSON.stringify(o.t)),kindMe:o.kind}}
/* A food web you can run without a page: newWeb(biomeId, org?) then web.advance(years), web.toggleRemove(id). */
function newWeb(bk,org){const extra=org?fwMe(org,bk):null;const W=fwBuild(FWS[bk],extra);
  const web={bk,W,N:W.sp.map(s=>s.me?.3:1),rem:W.sp.map(()=>false),year:0,hist:[],
    record(){const v={};W.sp.forEach((s,i)=>v[s.id]=web.N[i]);web.hist.push({y:web.year,v})},
    advance(years){const steps=Math.round(years/.05);for(let k=0;k<steps;k++){web.N=fwStep(W,web.N,web.rem,.05);web.year=+(web.year+.05).toFixed(2);if(Math.abs(web.year*4-Math.round(web.year*4))<1e-6)web.record()}return web},
    toggleRemove(id){const i=W.idx[id];if(i==null)return web;if(web.rem[i]||web.N[i]===0){web.rem[i]=false;web.N[i]=.3}else{web.rem[i]=true;web.N[i]=0}return web}};
  web.record();return web}

Object.assign(M,{FWS,LVNAME,LVCOL,fwTraits,FWG,FWP,fwBuild,fwGrowth,fwStep,fwMe,newWeb});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
