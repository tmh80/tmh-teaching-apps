/* Adapt Lab art prototype: living biome scene. Owns the #scene canvas and the #sceneCtl controls. */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,rng,mix,fill,ell,smooth}=R,{fit,blinkAt,label}=window.PU;
const ZOO=R.zoo,A=R.A;
const heightOf=s=>R.sizeOf(s).height;
/* ---------- 3. living scene ---------- */
const BIO={
 tundra:{sky:['#8fb6d8','#dcebf2','#f6f3ee'],sun:'#fff6dc',ridge:['#b9cbdc','#cfdce8','#e4edf2'],ground:['#f4f7f9','#e2ebf1'],fore:'#b7c6d1',herd:'Arctic hare',pred:'Arctic fox',flyer:'Snowy owl',n:14,size:.4,psize:.42},
 savanna:{sky:['#f2b56a','#f8d79a','#fbeccb'],sun:'#fff1c2',ridge:['#d9a56b','#e0b578','#e9c88d'],ground:['#e6c877','#d2a955'],fore:'#8a6a2c',herd:'Plains zebra',pred:'Cheetah',flyer:'Red-tailed hawk',n:9,size:.46,psize:.42},
 ocean:{sky:['#1f6f9c','#2f8fb5','#57b3c9'],water:true,herd:'Atlantic mackerel',pred:'Brown trout',n:22,size:.3,psize:.8}
};
let SC=null;
function makeScene(bk){const B=BIO[bk],Rn=rng(bk.length*97+5);const base=ZOO[B.herd];
  const pop=[];for(let i=0;i<B.n;i++){const tr={...base};['ears','legLen','insul','tail','finSize'].forEach(k=>tr[k]=clamp(tr[k]+(Rn()-.5)*26,0,100));
    pop.push({s:R.specOf(tr,i+1),x:.04+.92*((i+Rn()*.8)/B.n),z:.1+Rn()*.85,tx:.05+Rn()*.9,tz:.1+Rn()*.85,face:Rn()<.5?1:-1,ph:Rn(),mv:0,wait:Rn()*5,hd:0,seed:i,fear:0})}
  const deco=[];for(let i=0;i<46;i++)deco.push({x:Rn(),z:Rn(),k:Rn(),r:Rn()});deco.sort((a,b)=>a.z-b.z);
  const flakes=[];for(let i=0;i<70;i++)flakes.push({x:Rn(),y:Rn(),s:.4+Rn(),v:.02+Rn()*.05});
  SC={bk,B,Rn,pop,deco,flakes,pred:{s:R.specOf(ZOO[B.pred],99),x:-.2,z:.6,ph:0,dir:1,wait:3},fly:{s:B.flyer?R.specOf(ZOO[B.flyer],5):null,x:1.2,y:.2}}}
function ridge(c,w,y,amp,seed,col){c.fillStyle=col;c.beginPath();c.moveTo(0,y+amp*2);for(let x=0;x<=w;x+=8){const u=x/w*6+seed;c.lineTo(x,y-amp*(.5+.5*Math.sin(u)*.6+.25*Math.sin(u*2.3+1)+.15*Math.sin(u*5.1+2)))}c.lineTo(w,y+amp*2);c.lineTo(w,9999);c.lineTo(0,9999);c.closePath();c.fill()}
function backdrop(c,w,h,t){const B=SC.B,hz=h*.44;
  const g=c.createLinearGradient(0,0,0,B.water?h:hz);B.sky.forEach((k,i)=>g.addColorStop(i/(B.sky.length-1),k));c.fillStyle=g;c.fillRect(0,0,w,h);
  if(B.water){ // light rays, sea floor, kelp
    c.save();c.globalAlpha=.09;c.fillStyle='#ffffff';for(let i=0;i<6;i++){const x=w*(.08+i*.17)+Math.sin(t*.3+i)*w*.02;c.beginPath();c.moveTo(x,0);c.lineTo(x+w*.07,0);c.lineTo(x-w*.05,h);c.lineTo(x-w*.16,h);c.closePath();c.fill()}c.restore();
    ridge(c,w,h*.86,h*.05,2,'#2a7f9c');ridge(c,w,h*.92,h*.04,5,'#d9c9a0');
    SC.deco.forEach(d=>{if(d.k<.55)return;const x=d.x*w,y=h*(.9+d.z*.08),len=h*(.16+.3*d.r);c.strokeStyle=d.r>.5?'#3f8f5a':'#2f7a55';c.lineWidth=h*.012;c.lineCap='round';c.beginPath();c.moveTo(x,y);
      for(let i=1;i<=6;i++)c.lineTo(x+Math.sin(t*.9+d.x*20+i*.7)*len*.07*i/3,y-len*i/6);c.stroke()});
    return}
  const sx=w*.74,sy=hz*.42;const sg=c.createRadialGradient(sx,sy,0,sx,sy,h*.34);sg.addColorStop(0,'rgba(255,250,225,.75)');sg.addColorStop(1,'rgba(255,250,225,0)');c.fillStyle=sg;c.fillRect(0,0,w,hz);fill(c,B.sun,p=>ell(p,sx,sy,h*.045,h*.045));
  ridge(c,w,hz-h*.03,h*.11,1.3,B.ridge[0]);ridge(c,w,hz+h*.0,h*.07,4.1,B.ridge[1]);ridge(c,w,hz+h*.035,h*.035,7.7,B.ridge[2]);
  const gg=c.createLinearGradient(0,hz+h*.03,0,h);gg.addColorStop(0,B.ground[0]);gg.addColorStop(1,B.ground[1]);c.fillStyle=gg;c.fillRect(0,hz+h*.045,w,h);
}
const yOf=(z,h)=>lerp(h*.52,h*.95,z),scOf=(z,h)=>lerp(.42,1,z)*h/520;
function decoItem(c,d,w,h,t){const B=SC.B,x=d.x*w,y=yOf(d.z,h),s=scOf(d.z,h);
  if(SC.bk==='tundra'){if(d.k<.4){fill(c,'#d5e1ea',p=>ell(p,x,y+3*s,60*s*(.6+d.r),9*s));fill(c,'#ffffff',p=>ell(p,x,y,58*s*(.6+d.r),8*s))}
    else if(d.k<.6){fill(c,'#7d8a94',p=>smooth(p,[[x-16*s,y],[x-10*s,y-13*s],[x+6*s,y-15*s],[x+16*s,y-4*s],[x+14*s,y]],true));fill(c,'#ffffff',p=>ell(p,x-1*s,y-13*s,10*s,3.5*s))}
    else if(d.k<.8){c.strokeStyle='#b89a5a';c.lineWidth=1.6*s;c.lineCap='round';for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(x+i*2*s,y);c.quadraticCurveTo(x+i*4*s,y-12*s,x+i*7*s+Math.sin(t+d.x*9)*2*s,y-(20-Math.abs(i)*3)*s);c.stroke()}}}
  else{if(d.k<.62){c.strokeStyle=d.r>.5?'#b5892f':'#c9a146';c.lineWidth=2*s;c.lineCap='round';for(let i=-4;i<=4;i++){c.beginPath();c.moveTo(x+i*3*s,y);c.quadraticCurveTo(x+i*5*s,y-18*s,x+i*9*s+Math.sin(t*1.3+d.x*9)*3*s,y-(34-Math.abs(i)*4)*s);c.stroke()}}
    else if(d.k<.72&&d.z<.5){const th=110*s;fill(c,'#6d4d2a',p=>{p.moveTo(x-4*s,y);p.lineTo(x-2*s,y-th*.7);p.lineTo(x-26*s,y-th*.95);p.lineTo(x-22*s,y-th);p.lineTo(x,y-th*.8);p.lineTo(x+24*s,y-th);p.lineTo(x+28*s,y-th*.95);p.lineTo(x+3*s,y-th*.7);p.lineTo(x+5*s,y);p.closePath()});
      fill(c,'#6f8a3c',p=>ell(p,x,y-th*1.02,62*s,13*s));fill(c,'#89a44b',p=>ell(p,x-8*s,y-th*1.07,44*s,8*s))}
    else if(d.k<.8){fill(c,'#b98a4a',p=>smooth(p,[[x-14*s,y],[x-7*s,y-24*s],[x+3*s,y-30*s],[x+13*s,y-10*s],[x+15*s,y]],true))}}
}
function scene(t,dt){
  const cv=document.getElementById('scene');const{c,w,h}=fit(cv,cv.clientWidth<640?.72:.5);if(!SC)makeScene('tundra');const B=SC.B;
  backdrop(c,w,h,t);
  if(B.water){ // school of fish
    const P=SC.pred;P.x+=dt*.035;if(P.x>1.25)P.x=-.25;
    SC.pop.forEach((p,i)=>{p.x+=dt*(.05+.02*(i%5))*(1+p.fear);if(p.x>1.1){p.x=-.1;p.z=.15+((i*37)%70)/100}
      const d=Math.abs(p.x-P.x-.1);p.fear=lerp(p.fear,d<.14?2.5:0,.05)});
    const all=SC.pop.map(p=>({p,z:p.z})).concat([{pr:1,z:.62}]).sort((a,b)=>a.z-b.z);
    all.forEach(o=>{if(o.pr){const s=h/520*B.psize*2.6;c.save();c.translate(P.x*w,h*.5+Math.sin(t*.5)*h*.04);c.scale(s,s);R.draw(c,P.s,{t,phase:t*.9});c.restore();return}
      const p=o.p,s=lerp(.5,1,p.z)*h/520*B.size*2.4;c.save();c.globalAlpha=lerp(.55,1,p.z);c.translate(p.x*w,h*(.16+p.z*.62)+Math.sin(t*1.1+p.seed)*h*.02);c.scale(s,s);R.draw(c,p.s,{t,phase:t*(1.5+p.fear)+p.seed*.37});c.restore()});
    SC.flakes.forEach(f=>{f.y-=dt*f.v*1.2;if(f.y<0)f.y=1;c.globalAlpha=.35;c.strokeStyle='#ffffff';c.lineWidth=1;c.beginPath();c.arc(f.x*w+Math.sin(t+f.y*20)*4,f.y*h,1.5+f.s*2,0,TAU);c.stroke()});c.globalAlpha=1;return}
  // predator crosses the scene now and then
  const P=SC.pred;if(P.wait>0){P.wait-=dt}else{const v=.085*dt;P.x+=v*P.dir;P.ph+=v*w/(P.s.leg*.62*1.25*scOf(P.z,h)*B.psize*2);if(P.x>1.25||P.x<-.25){P.dir*=-1;P.wait=7;P.z=.35+.5*((t*7)%1)}}
  SC.pop.forEach(p=>{const near=Math.abs(p.x-P.x)<.09&&Math.abs(p.z-P.z)<.25&&P.wait<=0;
    if(near&&p.fear<.5){p.fear=1;p.tx=clamp(p.x+(p.x>P.x?.2:-.2)*(.6+SC.Rn()),.03,.97);p.tz=clamp(p.z+(p.z>P.z?.3:-.3)*SC.Rn(),.1,.95);p.wait=0}
    p.fear=Math.max(0,p.fear-dt*.35);
    if(p.wait>0){p.wait-=dt;p.mv=lerp(p.mv,0,.12);p.hd=lerp(p.hd,p.graze?1:0,.05)}
    else{const dx=p.tx-p.x,dz=p.tz-p.z,d=Math.hypot(dx,dz*.5);p.hd=lerp(p.hd,0,.15);
      if(d<.012){p.wait=2+SC.Rn()*6;p.graze=SC.Rn()<.65;p.tx=clamp(p.x+(SC.Rn()-.5)*.5,.04,.96);p.tz=clamp(p.z+(SC.Rn()-.5)*.4,.1,.95)}
      else{const sp=(.035+.11*p.fear)*dt;const ux=dx/d,uz=dz/d;p.x+=ux*sp;p.z+=uz*sp*.5;p.face=ux>=0?1:-1;p.mv=lerp(p.mv,1,.15);
        const sc=scOf(p.z,h)*B.size*2;p.ph+=Math.abs(ux)*sp*w/(p.s.leg*.62*1.25*sc)+Math.abs(uz)*sp*.6}}});
  const items=SC.deco.map(d=>({d,z:d.z})).concat(SC.pop.map(p=>({p,z:p.z})),[{pr:1,z:P.z}]).sort((a,b)=>a.z-b.z);
  items.forEach(o=>{
    if(o.d){decoItem(c,o.d,w,h,t);return}
    const q=o.pr?P:o.p,sc=scOf(q.z,h)*(o.pr?B.psize:B.size)*2,x=q.x*w,y=yOf(q.z,h);
    c.save();c.translate(x,y);R.shadow(c,sc*q.s.L*.6,.22);c.scale(sc*(o.pr?q.dir:q.face),sc);
    if(o.pr)R.draw(c,q.s,{t,phase:q.ph,move:q.wait>0?0:1,blink:blinkAt(t,9),headDown:.25});
    else R.draw(c,q.s,{t:t+q.seed,phase:q.ph,move:q.mv,headDown:q.hd,blink:blinkAt(t,q.seed),twitch:q.fear>.6});
    c.restore()});
  // flyer
  const F=SC.fly;if(F.s){F.x-=dt*.07;if(F.x<-.2){F.x=1.3;F.y=.1+((t*3)%1)*.2}const s=h/520*.55;c.save();c.translate(F.x*w,h*F.y+Math.sin(t*1.3)*h*.02);c.scale(-s,s);R.draw(c,F.s,{t,fly:1,flap:t*7,move:1});c.restore()}
  // weather and foreground
  c.fillStyle=SC.bk==='tundra'?'rgba(255,255,255,.85)':'rgba(255,240,200,.5)';SC.flakes.forEach(f=>{f.y+=dt*f.v*(SC.bk==='tundra'?1:.15);f.x+=dt*.012*f.s;if(f.y>1)f.y=0;if(f.x>1)f.x=0;c.beginPath();c.arc(f.x*w,f.y*h,(SC.bk==='tundra'?1.1:.8)*f.s*h/420*1.6,0,TAU);c.fill()});
  c.fillStyle=B.fore;const Rf=rng(4);for(let i=0;i<34;i++){const x=Rf()*w,hh=h*(.05+.1*Rf()),sw=Math.sin(t*1.1+i)*h*.006;c.beginPath();c.moveTo(x-h*.006,h);c.quadraticCurveTo(x+sw,h-hh*.6,x+sw*2+h*.01,h-hh);c.quadraticCurveTo(x+sw+h*.004,h-hh*.5,x+h*.008,h);c.closePath();c.fill()}
}
let last=0,T=0;const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T+=dt;scene(T,dt);if(!still)requestAnimationFrame(frame)}
document.querySelectorAll('[data-biome]').forEach(b=>b.addEventListener('click',()=>{makeScene(b.dataset.biome);document.querySelectorAll('[data-biome]').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
window.__proto={setTime:v=>{T=v},makeScene};
requestAnimationFrame(frame);
})();
