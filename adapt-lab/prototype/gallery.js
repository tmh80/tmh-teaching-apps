/* Adapt Lab art prototype: gallery of every animal in Rig.zoo, and the variation strip. */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,rng,mix,fill,ell,smooth}=R,{fit,blinkAt,label}=window.PU;
const ZOO=R.zoo,A=R.A;
const heightOf=s=>R.sizeOf(s).height;
/* ---------- 1. gallery ---------- */
// every predator in the sim's bank, once each (Session 2 check: all predators draw from their real data)
function predList(){const seen={},out=[];Object.values(R.PRED_BANK||{}).forEach(list=>list.forEach(j=>{if(!seen[j.id]){seen[j.id]=1;out.push(j)}}));
  Object.values(R.INVADERS||{}).forEach(j=>{if(!seen[j.id]){seen[j.id]=1;out.push(j)}});return out}
const PSPEC={};
function gallery(t,id){
  const cv=document.getElementById(id||'gal');if(!cv)return;const preds=id==='predgal'?predList():null;
  const names=preds?preds.map(j=>j.name):Object.keys(ZOO);const narrow=cv.clientWidth<640;const cols=narrow?2:4,rows=Math.ceil(names.length/cols);
  const{c,w,h}=fit(cv,rows/cols*.82);c.clearRect(0,0,w,h);const cw=w/cols,ch=h/rows;
  names.forEach((nm,i)=>{const x0=(i%cols)*cw,y0=Math.floor(i/cols)*ch;const s=preds?(PSPEC[preds[i].id]||(PSPEC[preds[i].id]=R.predSpec(preds[i],i+1))):R.specOf(ZOO[nm],i+1);
    const pad=cw*.045;c.fillStyle=['#e8f0ec','#f3ecdc','#e6eef4','#efe9f1'][(i+Math.floor(i/cols))%4];c.beginPath();c.roundRect(x0+pad,y0+pad,cw-2*pad,ch-2*pad,14);c.fill();
    const zs=R.sizeOf(s),fish=!!zs.swims;const gy=y0+ch*.74,cx=x0+cw*.5;
    const sc=Math.min(cw*.62/zs.len,ch*.6/zs.height);
    c.save();c.beginPath();c.roundRect(x0+pad,y0+pad,cw-2*pad,ch-2*pad,14);c.clip();
    if(!fish){c.fillStyle='rgba(60,80,70,.10)';c.fillRect(x0,gy,cw,ch)}
    c.translate(cx-(s.plan==='lizard'?-sc*14:s.plan==='quad'?sc*8:0)+(zs.dx||0)*sc,fish?y0+ch*.46:gy);
    if(!fish)R.shadow(c,sc*zs.len*.5);c.scale(sc,sc);
    const flyDemo=s.canFly&&((t+i)%9)>5.5;
    R.draw(c,s,{t,phase:t*(s.plan==='insect'?1.6:s.plan==='lizard'?1.2:.95),move:1,blink:blinkAt(t,i),fly:flyDemo?1:0,flap:t*9,tongue:s.tongue&&((t+i)%3)<.35});
    c.restore();label(c,nm,cx,y0+ch-pad-9,Math.max(11,Math.min(14,cw*.075)))});
}
/* ---------- 2. variation and change ---------- */
function variation(t){
  const cv=document.getElementById('vary');const{c,w,h}=fit(cv,cv.clientWidth<640?.5:.3);c.clearRect(0,0,w,h);
  const g=+document.getElementById('gen').value/100;document.getElementById('genLab').textContent='Generation '+Math.round(1+g*99);
  const n=5,cw=w/n;const Rr=rng(77);
  for(let i=0;i<n;i++){const jit=()=>(Rr()-.5)*16;
    const tr=A({color:g>.72?'white':g>.38?'silver':'brown',insul:clamp(30+60*g+jit(),5,98),fat:20+50*g,fatWhere:'all',ears:clamp(80-55*g+jit(),5,98),size:45,legLen:clamp(60-22*g+jit(),10,95),tail:8});
    const s=R.specOf(tr,i+3);const sc=Math.min(cw*.6/s.L,h*.5/heightOf(s));
    c.save();c.translate(cw*(i+.5)-sc*8,h*.8);R.shadow(c,sc*s.L*.6);c.scale(sc,sc);R.draw(c,s,{t:t+i,phase:0,move:0,blink:blinkAt(t,i*3),headDown:i%3===1?.5+.5*Math.sin(t*.8+i):0});c.restore()
    if(i===1||i===3){const y=R.youngOf(s),ys=sc*.55;c.save();c.translate(cw*(i+.5)+sc*s.L*.62,h*.84);R.shadow(c,ys*y.L*.6);c.scale(i===3?-ys:ys,ys);R.draw(c,y,{t:t+i*2,phase:t*1.2,move:i===3?0:.6,blink:blinkAt(t,i*5),lie:i===3?1:0,sleep:i===3});c.restore()}}
  label(c,g<.3?'Warm years: thin brown coats, long ears and long legs lose heat':g<.7?'The climate is cooling: thicker, paler coats are surviving more often':'Ice age: thick white coats, small ears and short legs keep heat in',w/2,h*.13,Math.max(11,Math.min(15,w*.022)),'#24352d',600);
}
let T=0,last=0;const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T+=dt;if(document.getElementById('gal'))gallery(T);if(document.getElementById('predgal'))gallery(T,'predgal');if(document.getElementById('vary'))variation(T);if(!still)requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();
