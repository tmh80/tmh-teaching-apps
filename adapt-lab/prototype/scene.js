/* Adapt Lab art prototype: the living scene. Owns the #scene canvas and builds its own controls into #sceneCtl.
   Backdrops come from biomes.js (window.Biomes). Animals come from rig.js (window.Rig).
   Rules kept here (plan section 4.5):
   - Feet never slide: walking speed is set by step rate, and the step phase advances with the distance covered.
   - Nothing snaps: seasons, night and events all fade in over about a second.
   - Animals keep a personal space, graze, rest, raise young, scatter from a chase and regroup.
   - At most CAP animals are drawn. */
(function(){
"use strict";
const R=window.Rig,BM=window.Biomes,{lerp,clamp,TAU,rng,fill,ell}=R,{fit}=window.PU;
const ZOO=R.zoo,CAP=40;
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* who lives where: first name found in the zoo wins, so missing animals never break the scene */
const CAST={
 tundra:{herd:['Arctic hare'],n:12,pred:['afox','Arctic fox','Wolf'],fly:['Snowy owl'],extra:[]},
 desert:{herd:['Dromedary camel','Fennec fox'],n:7,pred:['coyote','Cheetah','Wolf'],fly:['Red-tailed hawk'],extra:['Thorny devil','Desert locust']},
 forest:{herd:['European rabbit'],n:11,pred:['rfox','Wolf','Arctic fox'],fly:[],extra:['Wood frog','Green lizard']},
 grassland:{herd:['Plains zebra'],n:9,pred:['cheetah','Cheetah'],fly:['Red-tailed hawk'],extra:['Ostrich']},
 ocean:{herd:['Atlantic mackerel'],n:24,pred:['shark','Brown trout'],fly:[],extra:['Harbour seal','Shore crab']},
 freshwater:{herd:['Brown trout'],n:14,pred:['pike','Atlantic mackerel'],fly:[],extra:['Common frog']}
};
const EVENTS=[['none','No event'],['iceage','Ice age'],['drought','Drought'],['fire','Wildfire'],['flood','Flood'],['volcano','Volcanic winter']];
const pick=names=>names.find(n=>ZOO[n]);
const sizeF=sz=>lerp(.28,.56,clamp(sz,0,100)/100);
/* how far the body travels in one full step cycle, in the animal's own units */
function cycleLen(s){return s.plan==='quad'?s.leg:s.plan==='bird'?s.leg*.5/.62:s.plan==='lizard'?s.leg*.9/.62:s.plan==='insect'?s.leg*.6/.62:R.sizeOf(s).len*.45}
function predSpecFor(bk,names){
  const bank=R.PRED_BANK&&R.PRED_BANK[bk];
  for(const n of names){
    if(bank&&R.predSpec){const j=bank.find(x=>x.id===n);if(j){try{const s=R.predSpec(j);if(s&&s.plan)return{s,size:j.size||50,name:j.name}}catch(e){}}}
    if(ZOO[n])return{s:R.specOf(ZOO[n],99),size:ZOO[n].size,name:n};
  }
  const any=Object.keys(ZOO)[0];return{s:R.specOf(ZOO[any],99),size:ZOO[any].size,name:any};
}
let SC=null,T=0;
function vary(tr,Rn){const o={...tr};['ears','legLen','insul','tail','finSize','size'].forEach(k=>{if(k in o)o[k]=clamp(o[k]+(Rn()-.5)*(k==='size'?10:24),0,100)});return o}
function mkAnimal(tr,Rn,i,x,z){const t=vary(tr,Rn);const s=R.specOf(t,i+1);
  return{t,s,sf:sizeF(t.size)*(s.plan==='bird'?.68:1),x,z,tx:x,tz:z,face:Rn()<.5?1:-1,ph:Rn(),mv:0,wait:Rn()*4,hd:0,lie:0,graze:Rn()<.6,rest:false,seed:i,fear:0,dead:0,fade:1,young:false,cad:.95+Rn()*.25}}
function make(bk){
  bk=CAST[bk]?bk:'tundra';const C=CAST[bk],info=BM.info(bk),Rn=rng(bk.length*97+bk.charCodeAt(2)*13+5);
  const hn=pick(C.herd)||Object.keys(ZOO)[0],base=ZOO[hn];const pop=[];
  if(info.water){for(let i=0;i<C.n;i++){const a=mkAnimal(base,Rn,i,Rn(),.15+Rn()*.8);a.y=.12+Rn()*.62;a.vy=0;a.dir=1;a.turn=1;a.lag=Rn()*1.2;pop.push(a)}}
  else{for(let i=0;i<C.n;i++){pop.push(mkAnimal(base,Rn,i,.05+.9*((i+Rn()*.8)/C.n),.12+Rn()*.8))}
    // some adults have a young one at their side
    pop.slice().forEach((p,i)=>{if(i%3===0&&pop.length<CAP)pop.push(mkYoung(p,Rn))})}
  const extras=[];C.extra.forEach((n,k)=>{if(!ZOO[n])return;for(let i=0;i<2;i++){const a=mkAnimal(ZOO[n],Rn,50+k*5+i,Rn(),info.water?.9:.2+Rn()*.75);a.extra=true;a.cad*=.8;a.graze=false;if(info.water){a.y=R.sizeOf(a.s).swims?.2+Rn()*.3:.93;a.dir=1;a.turn=1;a.lag=0;a.floor=!R.sizeOf(a.s).swims}extras.push(a)}});
  const pr=predSpecFor(bk,C.pred);const fl=pick(C.fly);
  let plants=[];try{if(window.Plants&&window.Plants.zoo){const names=Object.keys(window.Plants.zoo).filter(n=>window.Plants.zoo[n].home===bk);names.forEach((n,k)=>{const tr=window.Plants.zoo[n].t,tree=tr.form==='tree';for(let i=0;i<(tree?2:3);i++)plants.push({spec:window.Plants.specOf(tr,k*7+i),x:.05+Rn()*.9,z:info.water?.95:tree?.08+Rn()*.4:.15+Rn()*.8,sc:tree?2.6+Rn()*.6:1.5+Rn()*.5})})}}catch(e){plants=[]}
  const keep=SC||{};
  SC={bk,info,Rn,herdName:hn,base,pop:pop.concat(extras),fx:[],plants,
    pred:{...pr,sf:sizeF(pr.size),state:'away',timer:6,x:-.2,z:.6,y:.5,face:1,ph:0,mv:0,hd:0,target:null,win:false},
    fly:fl?{s:R.specOf(ZOO[fl],5),x:1.2,y:.16}:null,
    season:keep.bk===bk?keep.season:0,seasonT:keep.bk===bk?keep.seasonT:0,seasonClock:0,auto:keep.auto!==false,
    night:keep.night||0,nightT:keep.nightT||0,ev:{id:'none',amount:0,next:'none'},birthClock:8};
  syncCtl();return SC}
function mkYoung(p,Rn){const y={...p,s:R.youngOf(p.s),young:true,parent:p,sf:p.sf*.55,x:clamp(p.x+.02,.02,.98),z:p.z,seed:p.seed+200,wait:0,cad:p.cad*1.5,ph:Rn(),fear:0,hd:0,lie:0,mv:0,graze:false};return y}
/* ---------- land behaviour ---------- */
function freeSpot(p,spread){const Rn=SC.Rn;let best=null,bd=-1;
  for(let k=0;k<6;k++){const x=clamp(p.x+(Rn()-.5)*spread,.04,.96),z=clamp(p.z+(Rn()-.5)*spread*.9,.1,.95);let d=9;
    SC.pop.forEach(q=>{if(q!==p&&!q.dead&&!q.young)d=Math.min(d,Math.hypot(q.tx-x,(q.tz-z)*.6))});if(d>bd){bd=d;best=[x,z]}}
  return best}
// where to run: far from the predator, not past it, not into a corner, not on top of a neighbour
function fleeSpot(p,P){const Rn=SC.Rn;let best=[p.x,p.z],bs=-9;const tp=[P.x-p.x,(P.z-p.z)*.6],tl=Math.hypot(tp[0],tp[1])||1;
  for(let k=0;k<10;k++){const an=Rn()*TAU,r=.16+Rn()*.22;const x=clamp(p.x+Math.cos(an)*r,.04,.96),z=clamp(p.z+Math.sin(an)*r*1.3,.1,.95);
    const dv=[x-p.x,(z-p.z)*.6],dl=Math.hypot(dv[0],dv[1])||1;let sc=Math.min(.34,Math.hypot(x-P.x,(z-P.z)*.6))*2+dl*.5-Math.max(0,(tp[0]*dv[0]+tp[1]*dv[1])/(tl*dl))*.8;
    for(const q of SC.pop)if(q!==p&&!q.dead&&!q.young&&Math.hypot(q.tx-x,(q.tz-z)*.6)<.1)sc-=.35;
    if(sc>bs){bs=sc;best=[x,z]}}
  return best}
function moveTo(p,dt,w,h,cad){const dx=p.tx-p.x,dz=p.tz-p.z,d=Math.hypot(dx,dz*.5);if(d<.008)return true;
  const sc=BM.scOf(p.z,h)*p.sf*2;const spPx=cad*cycleLen(p.s)*sc;const stepN=spPx*dt/w;const ux=dx/d,uz=dz/d;const k=Math.min(1,d/stepN||1);
  p.x+=ux*stepN*k;p.z+=uz*stepN*k*.5;if(Math.abs(ux)>.15)p.face=ux>=0?1:-1;p.mv=lerp(p.mv,1,.18);
  p.ph+=cad*dt*Math.max(.55,Math.abs(ux));return false}
function landStep(dt,w,h){const P=SC.pred,night=SC.night>.6;
  SC.pop.forEach(p=>{
    if(p.dead){p.lie=lerp(p.lie,1,.12);p.mv=lerp(p.mv,0,.2);p.dead+=dt;if(p.dead>2.2)p.fade=Math.max(0,p.fade-dt*.6);return}
    const hunting=P.state==='chase'||P.state==='stalk';const dP=Math.hypot(p.x-P.x,(p.z-P.z)*.6);
    p.fleeClock=(p.fleeClock||0)-dt;if(P.state==='chase'&&dP<(p===P.target?.5:.17)&&!p.extra&&!p.young){if(p.fear<.4||p.fleeClock<0||Math.hypot(p.tx-p.x,(p.tz-p.z)*.5)<.02){const f=fleeSpot(p,P);p.tx=f[0];p.tz=f[1];p.fleeClock=1.1}p.fear=1;p.wait=0;p.rest=false}
    p.fear=Math.max(0,p.fear-dt*.3);
    if(p.young&&p.parent&&!p.parent.dead){const q=p.parent;const gx=clamp(q.x-q.face*.028,.02,.98),gz=clamp(q.z+.015,.1,.96);if(Math.hypot(gx-p.x,gz-p.z)>.02||q.mv>.3){p.tx=gx;p.tz=gz;p.wait=0}p.fear=Math.max(p.fear,q.fear)}
    if(p.wait>0){p.wait-=dt;p.mv=lerp(p.mv,0,.14);p.hd=lerp(p.hd,p.graze&&!p.rest?1:0,.06);p.lie=lerp(p.lie,p.rest?1:0,.05);
      // too close to a neighbour: step away
      if(!p.young&&!p.rest)for(const q of SC.pop){if(q!==p&&!q.dead&&!q.young&&Math.hypot(q.x-p.x,(q.z-p.z)*.6)<.035&&q.seed<p.seed){const s=freeSpot(p,.3);p.tx=s[0];p.tz=s[1];p.wait=0;break}}
    }else{p.hd=lerp(p.hd,0,.18);p.lie=lerp(p.lie,0,.12);if(p.lie>.25){p.mv=lerp(p.mv,0,.2);return}
      const arrived=moveTo(p,dt,w,h,p.cad*(1+2*p.fear));
      if(arrived){p.wait=(p.young?.5:2.5)+SC.Rn()*6;p.graze=!p.extra&&SC.Rn()<.7;p.rest=!p.young&&!hunting&&SC.Rn()<(night?.75:.14);if(p.rest)p.wait+=5;
        if(!p.young){const s=freeSpot(p,p.extra?.25:.45);p.tx=s[0];p.tz=s[1]}}}
  });
  SC.pop=SC.pop.filter(p=>p.fade>0);
  // a birth now and then keeps the herd up
  SC.birthClock-=dt;const adults=SC.pop.filter(p=>!p.young&&!p.extra&&!p.dead);
  if(SC.birthClock<0&&adults.length){SC.birthClock=10+SC.Rn()*8;const herd=SC.pop.filter(p=>!p.extra&&!p.dead);
    if(herd.length<Math.min(CAP-4,CAST[SC.bk].n+6)){const par=adults.filter(a=>!SC.pop.some(y=>y.young&&y.parent===a)&&P.target!==a)[0];if(par){const y=mkYoung(par,SC.Rn);SC.pop.push(y);SC.fx.push({k:'born',a:y,age:0})}}}
  // young grow up when their parent is gone
  SC.pop.forEach(p=>{if(p.young&&(!p.parent||p.parent.dead)&&!p.grow){p.grow=true;p.young=false;p.parent=null;p.s=R.specOf(p.t,p.seed);p.sf=sizeF(p.t.size)*.8;p.wait=1}});
  predStep(dt,w,h);
}
function predStep(dt,w,h){const P=SC.pred;const walk=(tx,tz,cad)=>{const o={x:P.x,z:P.z,tx,tz,face:P.face,ph:P.ph,mv:P.mv,s:P.s,sf:P.sf};const done=moveTo(o,dt,w,h,cad);P.x=o.x;P.z=o.z;P.face=o.face;P.ph=o.ph;P.mv=o.mv;return done};
  P.timer-=dt;
  if(P.state==='away'){P.mv=0;if(P.timer<0)sendPredator()}
  else if(P.state==='stalk'){const q=P.target;if(!q||q.dead||!SC.pop.includes(q)){P.state='leave';return}P.hd=lerp(P.hd,.35,.08);
    walk(q.x,q.z,.55);if(Math.hypot(q.x-P.x,(q.z-P.z)*.6)<.2||P.timer<0){P.state='chase';P.timer=P.win?9:4}}
  else if(P.state==='chase'){const q=P.target;if(!q||q.dead){P.state='leave';return}P.hd=lerp(P.hd,.12,.1);
    const qv=q.cad*3*cycleLen(q.s)*q.sf,cadP=clamp((P.win?1.3:.82)*qv/(cycleLen(P.s)*P.sf),1.4,5.5);walk(q.x,q.z,cadP);const d=Math.hypot(q.x-P.x,(q.z-P.z)*.6);
    if(d<.022&&P.win){q.dead=.01;q.fear=0;SC.fx.push({k:'caught',a:q,age:0});SC.pop.forEach(y=>{if(y.parent===q)y.parent=null});P.state='eat';P.timer=3.2}
    else if(P.timer<0){P.state='leave';P.timer=20}}
  else if(P.state==='eat'){P.mv=lerp(P.mv,0,.2);P.hd=lerp(P.hd,1,.1);if(P.timer<0){P.state='leave';P.timer=20}}
  else if(P.state==='leave'){P.hd=lerp(P.hd,.1,.08);const ex=P.x>.5?1.25:-.25;if(walk(ex,P.z,1)||P.timer<0||P.x>1.2||P.x<-.2){P.state='away';P.timer=14+SC.Rn()*10;P.target=null}}
}
function sendPredator(){const P=SC.pred;if(P.state!=='away'&&P.state!=='leave')return;
  const herd=SC.pop.filter(p=>!p.dead&&!p.extra&&!p.young);if(!herd.length)return;
  if(SC.info.water){P.state='cruise';P.dirX=SC.Rn()<.5?1:-1;P.x=P.dirX>0?-.25:1.25;P.y=.3+SC.Rn()*.35;P.timer=30;return}
  const fromLeft=SC.Rn()<.5;P.x=fromLeft?-.18:1.18;P.z=.3+SC.Rn()*.55;P.face=fromLeft?1:-1;
  P.target=herd.slice().sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[Math.floor(SC.Rn()*Math.min(3,herd.length))];
  P.win=SC.Rn()<.5;P.state='stalk';P.timer=9;P.hd=.3}
/* ---------- water behaviour ---------- */
function waterStep(dt){const P=SC.pred,Rn=SC.Rn;
  SC.schoolClock=(SC.schoolClock||9)-dt;if(SC.schoolClock<0){SC.schoolClock=10+Rn()*8;SC.schoolDir=-(SC.schoolDir||1)}
  const H=SC.schoolDir||1;
  if(P.state==='away'){P.timer-=dt;if(P.timer<0)sendPredator()}
  else{P.x+=P.dirX*dt*(P.dash?.2:.045);P.face=P.dirX;P.dash=SC.pop.some(p=>!p.extra&&Math.abs(p.x-P.x)<.18&&Math.abs(p.y-P.y)<.2);P.y=lerp(P.y,P.aimY||P.y,.01);
    if(P.x>1.3||P.x<-.3){P.state='away';P.timer=12+Rn()*10}}
  const live=P.state!=='away';
  SC.pop.forEach(p=>{
    if(p.dead){p.dead+=dt;p.fade=Math.max(0,p.fade-dt*1.2);return}
    if(p.floor){p.x+=Math.sin(T*.3+p.seed)*dt*.01;p.ph+=dt*.6*Math.abs(Math.sin(T*.3+p.seed));p.mv=Math.abs(Math.sin(T*.3+p.seed));return}
    const dx=p.x-P.x,dy=p.y-P.y,d=Math.hypot(dx,dy*1.3);const scared=live&&d<.2;
    if(scared){p.fear=1;p.dir=dx>=0?1:-1;p.vy+=(dy>=0?1:-1)*dt*.5;if(d<.03&&!p.extra&&P.dash&&!P.fed){p.dead=.01;P.fed=true;SC.fx.push({k:'bubbles',x:p.x,y:p.y,age:0})}}
    else{p.fear=Math.max(0,p.fear-dt*.5);if(p.fear<.3){p.lag-=dt;if(p.dir!==H&&p.lag<0)p.dir=H;if(p.dir===H&&p.lag<-1)p.lag=Rn()*1.2}}
    p.turn=lerp(p.turn,p.dir,.08);
    p.x+=p.dir*dt*(.045+.012*(p.seed%5))*(1+2.2*p.fear)*Math.abs(p.turn)*(p.extra?.5:1);
    p.vy+=(-(p.y-(p.homeY??(p.homeY=p.y)))*.6+Math.sin(T*.8+p.seed)*.05)*dt;p.vy*=.96;p.y=clamp(p.y+p.vy*dt,.08,.86);
    if(p.x>1.12){p.x=-.1}if(p.x<-.12){p.x=1.1}
  });
  if(P.state==='away')P.fed=false;
  SC.pop=SC.pop.filter(p=>p.fade>0);
  SC.birthClock-=dt;if(SC.birthClock<0){SC.birthClock=9;const n=SC.pop.filter(p=>!p.extra).length;if(n<CAST[SC.bk].n){const a=mkAnimal(SC.base,Rn,300+Math.floor(Rn()*900),H>0?-.1:1.1,.2+Rn()*.7);a.y=.15+Rn()*.6;a.vy=0;a.dir=H;a.turn=H;a.lag=Rn();SC.pop.push(a)}}
}
/* ---------- drawing ---------- */
function drawAnimal(c,p,x,y,sc,pose,alpha){c.save();c.globalAlpha=alpha;c.translate(x,y);if(!SC.info.water)R.shadow(c,sc*R.sizeOf(p.s).len*.45,.2*alpha);c.scale(sc*(p.faceX!=null?p.faceX:p.face),sc);try{R.draw(c,p.s,pose)}catch(e){}c.restore()}
function badge(c,x,y,r){c.save();fill(c,'#c4473a',p=>ell(p,x,y,r,r));c.fillStyle='#fff';[[-.42,-.2],[0,-.48],[.42,-.2]].forEach(q=>{c.beginPath();c.arc(x+q[0]*r,y+q[1]*r,r*.17,0,TAU);c.fill()});c.beginPath();c.ellipse(x,y+r*.22,r*.36,r*.28,0,0,TAU);c.fill();c.restore()}
function pill(c,txt,harsh,w){c.save();c.font=`600 ${Math.max(11,Math.min(14,w*.022))}px "Avenir Next","Segoe UI",system-ui,sans-serif`;const tw=c.measureText(txt).width+(harsh?c.measureText('  harsh season').width:0);
  c.fillStyle='rgba(22,36,30,.72)';c.beginPath();c.roundRect(10,10,tw+22,28,14);c.fill();c.textAlign='left';c.textBaseline='middle';c.fillStyle='#fff';c.fillText(txt,21,24.5);if(harsh){c.fillStyle='#ffd27a';c.fillText('  harsh season',21+c.measureText(txt).width,24.5)}c.restore()}
function frame(dt){
  const cv=document.getElementById('scene');if(!cv)return;const{c,w,h}=fit(cv,cv.clientWidth<640?.72:.5);if(!SC)make('tundra');
  // nothing snaps: ease season, night and event
  if(SC.auto&&!still){SC.seasonClock+=dt;if(SC.seasonClock>9){SC.seasonClock=0;SC.seasonT++;syncCtl()}}
  SC.season=still?SC.seasonT:Math.min(SC.seasonT,SC.season+dt*.8);SC.night=still?SC.nightT:SC.night+clamp(SC.nightT-SC.night,-dt*.6,dt*.6);
  const E=SC.ev;if(E.next!==E.id){E.amount=still?0:Math.max(0,E.amount-dt*.7);if(E.amount<=0)E.id=E.next}else if(E.id!=='none')E.amount=still?1:Math.min(1,E.amount+dt*.45);
  const o={biome:SC.bk,season:SC.season,night:SC.night,t:T,event:{id:E.id,amount:E.amount}};
  const water=SC.info.water;if(!still){water?waterStep(dt):landStep(dt,w,h)}
  const S=BM.draw(c,w,h,o);const items=BM.deco(c,w,h,o,S);
  const surf=(SC.info.surface||0)*h,y0=surf+h*.06,y1=h*.9;
  SC.plants.forEach(pl=>items.push({z:pl.z,draw(){try{const k=BM.scOf(pl.z,h)*pl.sc;c.save();c.translate(pl.x*w,water?h*.93:BM.yOf(pl.z,h));c.scale(k,k);window.Plants.draw(c,pl.spec,{t:T,season:Math.round(SC.season)%4,harsh:S.harsh>.5,roots:false});c.restore()}catch(e){SC.plants=[]}}}));
  const sleepy=SC.night>.6;
  SC.pop.forEach(p=>items.push({z:p.z,draw(){
    if(water){const sc=lerp(.5,1,p.z)*h/520*p.sf*2.6;p.faceX=p.floor?1:(Math.abs(p.turn)<.12?(p.turn<0?-.12:.12):p.turn);
      drawAnimal(c,p,p.x*w,p.floor?h*.915:lerp(y0,y1,p.y)+Math.sin(T*1.1+p.seed)*h*.008,sc,{t:T+p.seed,phase:p.floor?p.ph:T*(1.4+1.6*p.fear)+p.seed*.37,move:p.floor?p.mv:1,swim:!p.floor,blink:false},lerp(.6,1,p.z)*p.fade);return}
    const sc=BM.scOf(p.z,h)*p.sf*2;
    drawAnimal(c,p,p.x*w,BM.yOf(p.z,h),sc,{t:T+p.seed,phase:p.ph,move:p.mv,headDown:p.hd,lie:p.lie,sleep:p.dead>0||(p.lie>.6&&sleepy),blink:((T+p.seed*1.7)%4.3)<.12,twitch:p.fear>.6},p.fade)}}));
  const P=SC.pred;if(P.state!=='away')items.push({z:water?.7:P.z,draw(){
    if(water){const sc=h/520*P.sf*3.4;drawAnimal(c,P,P.x*w,lerp(y0,y1,P.y)+Math.sin(T*.5)*h*.02,sc,{t:T,phase:T*(P.dash?2.2:.8),move:1,swim:true},1);return}
    drawAnimal(c,P,P.x*w,BM.yOf(P.z,h),BM.scOf(P.z,h)*P.sf*2,{t:T,phase:P.ph,move:P.mv,headDown:P.hd,blink:((T+3)%4.3)<.12},1)}});
  items.sort((a,b)=>a.z-b.z).forEach(it=>it.draw());
  // small effects: a birth sparkle, a caught badge, bubbles
  SC.fx.forEach(f=>{f.age+=dt;const a=f.a;
    if(f.k==='born'&&a){const x=a.x*w,y=BM.yOf(a.z,h)-BM.scOf(a.z,h)*40,u=f.age/1.6;c.save();c.globalAlpha=clamp(1-u,0,1);c.strokeStyle='#fff6c8';c.lineWidth=2;for(let i=0;i<6;i++){const an=i/6*TAU+f.age,r0=6+u*14,r1=r0+6;c.beginPath();c.moveTo(x+Math.cos(an)*r0,y+Math.sin(an)*r0);c.lineTo(x+Math.cos(an)*r1,y+Math.sin(an)*r1);c.stroke()}c.restore()}
    if(f.k==='caught'&&a){const u=f.age/3.5;c.save();c.globalAlpha=clamp(Math.min(f.age*3,(1-u)*3),0,1);badge(c,a.x*w,BM.yOf(a.z,h)-BM.scOf(a.z,h)*a.sf*2*70-u*10,Math.max(7,h*.022));c.restore()}
    if(f.k==='bubbles'){c.save();c.globalAlpha=clamp(1-f.age/1.5,0,1)*.8;c.strokeStyle='#fff';c.lineWidth=1.2;for(let i=0;i<6;i++){c.beginPath();c.arc(f.x*w+Math.sin(i*2.1)*12,lerp(y0,y1,f.y)-f.age*30-i*5,2+i%3,0,TAU);c.stroke()}c.restore()}});
  SC.fx=SC.fx.filter(f=>f.age<(f.k==='caught'?3.5:1.6));
  const F=SC.fly;if(F&&!water){if(!still)F.x-=dt*.06;if(F.x<-.2){F.x=1.3;F.y=.1+SC.Rn()*.18}const s=h/520*.5;c.save();c.globalAlpha=1-.5*SC.night;c.translate(F.x*w,h*F.y+Math.sin(T*1.3)*h*.02);c.scale(-s,s);try{R.draw(c,F.s,{t:T,fly:1,flap:T*7,move:1})}catch(e){}c.restore()}
  BM.front(c,w,h,o,S);
  const si=((Math.round(SC.season)%4)+4)%4;pill(c,`${SC.info.name} · ${SC.info.seasons[si]}${SC.nightT?' · night':''}`,si===SC.info.harsh,w);
}
/* ---------- controls ---------- */
let ctl={};
function btn(txt,on,press){const b=document.createElement('button');b.textContent=txt;if(press!=null)b.setAttribute('aria-pressed',press);b.addEventListener('click',on);return b}
function buildCtl(){const host=document.getElementById('sceneCtl');if(!host)return;host.textContent='';ctl={biome:{}};
  BM.ids.forEach(id=>{const b=btn(BM.info(id).name,()=>make(id),'false');ctl.biome[id]=b;host.appendChild(b)});
  const br=document.createElement('span');br.style.cssText='flex-basis:100%;height:0';host.appendChild(br);
  ctl.season=btn('Next season',()=>{SC.seasonT++;SC.seasonClock=0;syncCtl()});
  ctl.auto=btn('Seasons change by themselves',()=>{SC.auto=!SC.auto;syncCtl()},'true');
  ctl.night=btn('Night',()=>{SC.nightT=SC.nightT?0:1;syncCtl()},'false');
  ctl.event=btn('Event: none',()=>{const i=EVENTS.findIndex(e=>e[0]===SC.ev.next);SC.ev.next=EVENTS[(i+1)%EVENTS.length][0];syncCtl()});
  ctl.pred=btn('Send in a predator',()=>{if(SC.pred.state==='leave'){SC.pred.state='away'}sendPredator()});
  [ctl.season,ctl.auto,ctl.night,ctl.event,ctl.pred].forEach(b=>host.appendChild(b))}
function syncCtl(){if(!ctl.biome||!SC)return;BM.ids.forEach(id=>ctl.biome[id].setAttribute('aria-pressed',id===SC.bk));
  const nx=((SC.seasonT+1)%4+4)%4;ctl.season.textContent='Next season: '+SC.info.seasons[nx];ctl.auto.setAttribute('aria-pressed',!!SC.auto);ctl.night.setAttribute('aria-pressed',!!SC.nightT);
  ctl.event.textContent='Event: '+EVENTS.find(e=>e[0]===SC.ev.next)[1].toLowerCase().replace('no event','none');ctl.event.setAttribute('aria-pressed',SC.ev.next!=='none')}
let last=0;
function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T+=dt;frame(dt);requestAnimationFrame(loop)}
buildCtl();make('tundra');
window.Scene={make,frame,sendPredator,state:()=>SC,setSeason(n,now){SC.seasonT=n;if(now)SC.season=n;syncCtl()},setNight(n,now){SC.nightT=n;if(now)SC.night=n;syncCtl()},setEvent(id,now){SC.ev.next=id;if(now){SC.ev.id=id;SC.ev.amount=id==='none'?0:1}syncCtl()},setAuto(a){SC.auto=a;syncCtl()},CAST,EVENTS};
window.__proto={setTime:v=>{T=v},makeScene:make,advance(sec){const cv=document.getElementById('scene');for(let i=0;i<sec*30;i++){T+=1/30;const w=cv.clientWidth,h=cv.clientHeight||w*.5;SC.info.water?waterStep(1/30):landStep(1/30,w,h)}}};
requestAnimationFrame(loop);
})();
