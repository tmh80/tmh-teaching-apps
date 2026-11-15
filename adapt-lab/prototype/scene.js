/* Adapt Lab art prototype: gallery, variation strip and living biome scene. Uses Rig from rig.js. */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,rng,mix,fill,ell,smooth}=R;
const DEF={cov:'fur',blood:'warm',breathe:'lungs',shape:'round',legs:'4',wings:'none',fins:'none',color:'brown',pattern:'plain',diet:'plants',defence:'none',fatWhere:'none',
  activity:'day',season:'active',social:'solo',escape:'flee',store:'none',care:'some',posture:'upright',senses:'sight',size:35,insul:40,fat:30,ears:45,legLen:45,tail:30,wingSize:55,finSize:50,eyes:40,waterSave:25,salt:5};
const A=o=>({...DEF,...o});
// trait sets copied from Adapt Lab's PRESETS, so this proves the rig works from the sim's real data
const ZOO={
 'Arctic hare':A({color:'white',insul:90,fat:20,fatWhere:'all',ears:70,size:55,legLen:60,tail:8}),
 'Arctic fox':A({shape:'long',color:'white',insul:95,fatWhere:'all',fat:55,ears:22,size:35,legLen:35,tail:75,diet:'meat'}),
 'Fennec fox':A({shape:'long',color:'sandy',insul:40,ears:98,size:18,legLen:35,tail:60,diet:'both'}),
 'Dromedary camel':A({shape:'tall',color:'sandy',insul:30,fatWhere:'hump',fat:70,ears:15,size:92,legLen:95,tail:25}),
 'Plains zebra':A({shape:'tall',color:'white',pattern:'stripes',insul:15,size:85,legLen:70,tail:40,ears:40}),
 'Wolf':A({shape:'long',color:'grey',insul:55,ears:35,size:70,legLen:70,tail:60,diet:'meat'}),
 'European rabbit':A({color:'brown',insul:55,size:25,ears:75,legLen:40,tail:8}),
 'Cheetah':A({shape:'long',color:'sandy',pattern:'spots',insul:15,ears:18,size:60,legLen:85,tail:85,diet:'meat'}),
 'Snowy owl':A({cov:'feathers',legs:'2',legLen:20,wings:'fly',wingSize:85,color:'white',pattern:'spots',insul:92,size:42,tail:35,diet:'meat',eyes:90}),
 'Ostrich':A({cov:'feathers',shape:'tall',legs:'2',legLen:95,wings:'flightless',wingSize:45,color:'black',insul:35,size:85,tail:40,diet:'both',eyes:60}),
 'Red-tailed hawk':A({cov:'feathers',legs:'2',legLen:30,wings:'fly',wingSize:80,color:'brown',size:30,tail:50,diet:'meat',eyes:60}),
 'Atlantic mackerel':A({cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',finSize:60,color:'blue',pattern:'stripes',size:15,tail:0,diet:'meat'}),
 'Brown trout':A({cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',finSize:55,color:'brown',pattern:'spots',size:25,tail:0,diet:'meat'}),
 'Thorny devil':A({cov:'scales',blood:'cold',shape:'long',color:'sandy',pattern:'spots',defence:'spines',size:7,legLen:30,posture:'sprawl',senses:'tongue',tail:40,diet:'meat'}),
 'Green lizard':A({cov:'scales',blood:'cold',shape:'long',color:'green',pattern:'stripes',size:10,legLen:55,posture:'sprawl',tail:60,diet:'meat'}),
 'Desert locust':A({cov:'exo',blood:'cold',breathe:'tubes',shape:'long',legs:'6',legLen:75,wings:'fly',wingSize:70,color:'sandy',size:4,tail:0})
};
function fit(cv,ratio){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth,h=Math.round(w*ratio);cv.style.height=h+'px';if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return{c,w,h}}
function heightOf(s){return s.plan==='quad'?s.leg+s.D+Math.max(0,Math.sin(s.neckUp)*s.neck)+s.head+s.ear*.6:s.plan==='bird'?s.leg+s.B*.8+s.neck+s.head:s.plan==='fish'?s.D*2:s.plan==='lizard'?s.leg+s.D*1.6:s.leg+s.D*2.4}
function blinkAt(t,seed){return((t+seed*1.7)%4.3)<.12}
function label(c,txt,x,y,sz,colr,weight){c.font=`${weight||600} ${sz}px "Avenir Next","Segoe UI",system-ui,sans-serif`;c.textAlign='center';c.fillStyle=colr||'#24352d';c.fillText(txt,x,y)}

/* ---------- 1. gallery ---------- */
function gallery(t){
  const cv=document.getElementById('gal');const names=Object.keys(ZOO);const narrow=cv.clientWidth<640;const cols=narrow?2:4,rows=Math.ceil(names.length/cols);
  const{c,w,h}=fit(cv,rows/cols*.82);c.clearRect(0,0,w,h);const cw=w/cols,ch=h/rows;
  names.forEach((nm,i)=>{const x0=(i%cols)*cw,y0=Math.floor(i/cols)*ch;const s=R.specOf(ZOO[nm],i+1);
    const pad=cw*.045;c.fillStyle=['#e8f0ec','#f3ecdc','#e6eef4','#efe9f1'][(i+Math.floor(i/cols))%4];c.beginPath();c.roundRect(x0+pad,y0+pad,cw-2*pad,ch-2*pad,14);c.fill();
    const fish=s.plan==='fish';const gy=y0+ch*.74,cx=x0+cw*.5;
    const sc=Math.min(cw*.62/(s.plan==='lizard'?150:s.plan==='fish'?120:s.L||s.B*1.5),ch*.6/heightOf(s));
    c.save();c.beginPath();c.roundRect(x0+pad,y0+pad,cw-2*pad,ch-2*pad,14);c.clip();
    if(!fish){c.fillStyle='rgba(60,80,70,.10)';c.fillRect(x0,gy,cw,ch)}
    c.translate(cx-(s.plan==='lizard'?-sc*14:s.plan==='quad'?sc*8:0),fish?y0+ch*.46:gy);
    if(!fish)R.shadow(c,sc*(s.L||s.B)*.62);c.scale(sc,sc);
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
    c.save();c.translate(cw*(i+.5)-sc*8,h*.8);R.shadow(c,sc*s.L*.6);c.scale(sc,sc);R.draw(c,s,{t:t+i,phase:0,move:0,blink:blinkAt(t,i*3),headDown:i%3===1?.5+.5*Math.sin(t*.8+i):0});c.restore()}
  label(c,g<.3?'Warm years: thin brown coats, long ears and long legs lose heat':g<.7?'The climate is cooling: thicker, paler coats are surviving more often':'Ice age: thick white coats, small ears and short legs keep heat in',w/2,h*.13,Math.max(11,Math.min(15,w*.022)),'#24352d',600);
}
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
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T+=dt;gallery(T);variation(T);scene(T,dt);if(!still)requestAnimationFrame(frame)}
document.querySelectorAll('[data-biome]').forEach(b=>b.addEventListener('click',()=>{makeScene(b.dataset.biome);document.querySelectorAll('[data-biome]').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
window.__proto={setTime:v=>{T=v},makeScene};
requestAnimationFrame(frame);
})();
