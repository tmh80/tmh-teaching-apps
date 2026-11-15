/* Adapt Lab art prototype: FROG body plan (wood frog, common frog, tree frog, dart frog, bullfrog).
   What makes a frog a frog in outline: squat body with no neck, eyes on top of the head, folded Z-shaped back legs, a wide mouth.
   Same style rules as rig.js: flat fills, no outlines, base / shade / belly tones. Faces right, feet on y = 0, body about 100 units long.
   Movement: pose.phase drives one hop per cycle (crouch, push, fly with legs stretched, land); pose.move scales it. Idle: breathing throat, blink. */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,fill,ell,smooth,seg,ik,rng,mix}=R;
const n01=(t,k,d)=>(t[k]??d??50)/100;

// hop keyframes: [phase, air, legStretch, tilt, squash, armReach]
const KEYS=[[0,0,0,0,0,0],[.2,0,0,.1,1,0],[.34,.55,1,.4,0,0],[.5,1,1,.08,0,.3],[.66,.6,.55,-.3,0,1],[.8,0,.1,-.28,.25,1],[.9,0,0,-.08,.8,.2],[1,0,0,0,0,0]];
function hop(ph){const p=((ph%1)+1)%1;let i=0;while(i<KEYS.length-2&&p>=KEYS[i+1][0])i++;const a=KEYS[i],b=KEYS[i+1];let u=(p-a[0])/(b[0]-a[0]);u=u*u*(3-2*u);return a.map((v,k)=>lerp(v,b[k],u))}
const ease=u=>{u=clamp(u,0,1);return u*u*(3-2*u)};

function drawFrog(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,mv=po.move||0,seed=s.seed||0;
  const h=hop(po.phase||0),air=h[1]*mv,ext=h[2]*mv,sq=h[4]*mv,reach=h[5]*mv;
  const breathe=Math.sin(t*2.4+seed);
  const B=s.B,tilt=s.tilt+h[3]*mv-sq*.05;
  const px=-30,py=-(s.sit-sq*3.5)-s.hopH*air;           // hip joint in the world
  const ca=Math.cos(-tilt),sa=Math.sin(-tilt);
  const W=(x,y)=>[px+x*ca-y*sa,py+x*sa+y*ca];           // body frame (origin at the hip, x along the back) to world
  const limb=mix(col.base,col.shade,.5);
  const k=ease(air*2.6);                                 // 0 on the ground, 1 once clearly in the air
  const back=Math.PI-.3+tilt*.5;                         // direction the legs trail in when stretched
  const bands=(x1,y1,x2,y2,w)=>{if(s.pattern!=='stripes')return;c.strokeStyle=col.mark;c.lineCap='butt';c.lineWidth=2.6;
    let dx=x2-x1,dy=y2-y1;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;[.32,.62].forEach(u=>{const mx=lerp(x1,x2,u),my=lerp(y1,y2,u),hw=w*.52;c.beginPath();c.moveTo(mx-dy*hw,my+dx*hw);c.lineTo(mx+dy*hw,my-dx*hw);c.stroke()})};
  function toes(x,y,ang,len,tone){c.strokeStyle=tone;c.lineCap='round';c.lineWidth=2.6;c.beginPath();for(let j=-1;j<=1;j++){c.moveTo(x,y);c.lineTo(x+Math.cos(ang+j*.42)*len,Math.min(-1.2,y+Math.sin(ang+j*.42)*len))}c.stroke();
    if(s.pads){c.fillStyle=tone;for(let j=-1;j<=1;j++){c.beginPath();c.arc(x+Math.cos(ang+j*.42)*len,Math.min(-1.6,y+Math.sin(ang+j*.42)*len),2.3,0,TAU);c.fill()}}}
  function hindLeg(far){const o=far?5:0;const hip=W(-2+o,B*.2);
    const rest=[hip[0]-11-o*.4,-3.2],full=s.thigh+s.shin;
    const st=[hip[0]+Math.cos(back)*full*.97,hip[1]+Math.sin(back)*full*.97];
    const ank=[lerp(rest[0],st[0],ext),Math.min(-3.2,lerp(rest[1],st[1],ext))];
    const kn=ik(hip[0],hip[1],ank[0],ank[1],s.thigh,s.shin,-1);
    const tg=[rest[0]+s.foot,-2],ta=[ank[0]+Math.cos(back)*s.foot,ank[1]+Math.sin(back)*s.foot];
    const toe=[lerp(tg[0],ta[0],k),Math.min(-2,lerp(tg[1],ta[1],k))];
    const tone=far?col.shade:limb;
    fill(c,tone,p=>{seg(p,hip[0],hip[1],kn[0],kn[1],s.legW*1.9,s.legW*1.35);seg(p,kn[0],kn[1],ank[0],ank[1],s.legW*1.3,s.legW*.9);seg(p,ank[0],ank[1],toe[0],toe[1],s.legW*.9,s.legW*.55)});
    if(!far){bands(hip[0],hip[1],kn[0],kn[1],s.legW*1.6);bands(kn[0],kn[1],ank[0],ank[1],s.legW*1.1)}
    toes(toe[0],toe[1],Math.atan2(toe[1]-ank[1],toe[0]-ank[0]),s.foot*.32,tone)}
  function frontLeg(far){const o=far?6:0;const sh=W(50+o,B*.5);
    const ground=[sh[0]+5+o*.3,-2],tuck=[sh[0]-7,sh[1]+11],out=[sh[0]+s.arm*1.2,sh[1]+s.arm*1.45];
    const inAir=[lerp(tuck[0],out[0],reach),lerp(tuck[1],out[1],reach)];
    const f=[lerp(ground[0],inAir[0],k),Math.min(-2,lerp(ground[1],inAir[1],k))];
    const el=ik(sh[0],sh[1],f[0],f[1],s.arm,s.arm,1);const tone=far?col.shade:limb;
    fill(c,tone,p=>{seg(p,sh[0],sh[1],el[0],el[1],s.legW*1.25,s.legW*.9);seg(p,el[0],el[1],f[0],f[1],s.legW*.9,s.legW*.6)});
    toes(f[0],f[1],lerp(.15,Math.atan2(f[1]-el[1],f[0]-el[0]),k),s.arm*.42,tone)}
  // far-side legs
  hindLeg(true);frontLeg(true);
  // body, drawn in its own tilted frame
  c.save();c.translate(px,py);c.rotate(-tilt);
  const er=s.eye,ex=57,ey=-B*.86;
  fill(c,col.belly,p=>ell(p,63,B*.42,15,B*.5+breathe*1.6+(s.fat||0)*2));       // throat that pulses as it breathes
  fill(c,col.shade,p=>ell(p,ex+5.5,ey-er*.25,er*1.3,er*1.3));                   // far eye bump
  const body=new Path2D();
  smooth(body,[[-17,2],[-10,-B*.74],[14,-B*1.04],[40,-B*.99],[62,-B*.74],[79,-B*.2],[78,B*.26],[62,B*.72],[30,B*(.97+.25*(s.fat||0))],[2,B*.8]],true,1);
  ell(body,ex,ey,er*1.45,er*1.4);
  if(s.spiny){for(let i=0;i<6;i++){const x=-4+i*9.5,y=-B*(.78+.26*Math.sin((i+1)/7*Math.PI));body.moveTo(x-4,y+3);body.lineTo(x+1,y-7);body.lineTo(x+5,y+3);body.closePath()}}
  c.fillStyle=col.base;c.fill(body);
  c.save();c.clip(body);
  fill(c,col.belly,p=>ell(p,42,B*1.08,54,B*.62));
  fill(c,mix(col.base,col.belly,.4),p=>ell(p,26,-B*.72,22,B*.11,-.03));       // wet shine along the back
  if(s.pattern==='spots'){const Rn=rng(seed*7+3);c.fillStyle=col.mark;for(let i=0;i<13;i++){const x=lerp(-10,60,Rn()),y=-B*lerp(.05,.85,Rn()),r=1.8+2.6*Rn();c.beginPath();c.ellipse(x,y,r*1.25,r,Rn()*3,0,TAU);c.fill()}}
  if(s.pattern==='stripes'){c.strokeStyle=col.mark;c.lineWidth=4.2;c.lineCap='round';for(let i=0;i<5;i++){const x=-4+i*12.5;c.beginPath();c.moveTo(x+3,-B*1.1);c.quadraticCurveTo(x-2,-B*.6,x+2,-B*.12);c.stroke()}}
  if(s.pattern==='counter')fill(c,col.shade,p=>ell(p,28,-B*1.02,54,B*.42));
  c.restore();
  c.strokeStyle=col.shade;c.lineCap='round';c.lineWidth=1.7;
  c.beginPath();c.moveTo(47,-B*.6);c.quadraticCurveTo(20,-B*.72,-9,-B*.4);c.stroke();     // ridge along the back
  fill(c,col.shade,p=>ell(p,45.5,-B*.3,4.4,4.4));                                            // eardrum
  c.lineWidth=1.8;c.beginPath();c.moveTo(79.3,-B*.02);c.quadraticCurveTo(66,B*.2,49,B*.16);c.stroke();   // wide mouth
  fill(c,col.dark,p=>ell(p,74.5,-B*.5,1.3,1.1));
  // eye on top of the head
  if(po.blink){fill(c,col.base,p=>ell(p,ex,ey,er*1.02,er*1.02));c.strokeStyle=col.shade;c.lineWidth=1.7;c.beginPath();c.moveTo(ex-er*.85,ey+er*.1);c.quadraticCurveTo(ex,ey+er*.5,ex+er*.85,ey+er*.1);c.stroke()}
  else{fill(c,s.iris,p=>ell(p,ex,ey,er,er));fill(c,col.dark,p=>ell(p,ex+er*.08,ey,er*.66,er*.44));fill(c,'#ffffff',p=>ell(p,ex+er*.36,ey-er*.4,er*.24,er*.24))}
  c.restore();
  // near-side legs
  frontLeg(false);hindLeg(false);
}

R.register('frog',{
  test:t=>t.cov==='skin'&&t.legs==='4',
  spec:(t,seed,col)=>{const L=n01(t,'legLen'),fat=t.fatWhere==='all'?n01(t,'fat',30):t.fatWhere==='hump'?n01(t,'fat',30)*.4:0;
    return{L:104,leg:60+60*L,B:17+7*fat,fat,tilt:.4-.12*fat,sit:14+2*L,hopH:26+34*L,thigh:26+20*L,shin:27+22*L,foot:22+12*L,arm:15+5*L,legW:5.4+1.6*fat,
      eye:4.6+5.2*n01(t,'eyes',40),iris:t.color==='orange'||t.color==='blue'?'#2a2422':t.defence==='poison'?'#2a2422':n01(t,'eyes',40)>.85?'#e2482d':col.eyeRing,
      spiny:t.defence==='spines',pads:L>.8}},
  draw:drawFrog,
  size:s=>({len:s.L+s.foot*.5,height:s.sit+s.B*2+s.eye*1.6+34*Math.sin(s.tilt),dx:-6}),
  young:s=>({...s,young:true,thigh:s.thigh*.8,shin:s.shin*.8,foot:s.foot*.85,hopH:s.hopH*.7,eye:s.eye*1.2})
});
const A=R.A;
// trait sets copied from PRESETS in Adapt-Lab.html (wood-frog, common-frog), plus three that show how traits change the picture
R.zoo['Wood frog']=A({care:'none',posture:'sprawl',cov:'skin',blood:'cold',breathe:'skinlungs',legLen:60,tail:0,size:7,diet:'meat',activity:'crep',season:'hibernate',escape:'freeze',eyes:60,waterSave:10});
R.zoo['Common frog']=A({care:'none',posture:'sprawl',cov:'skin',blood:'cold',breathe:'skinlungs',color:'green',pattern:'spots',legLen:70,tail:0,size:8,diet:'meat',activity:'crep',season:'hibernate',escape:'flee',eyes:60,salt:5,waterSave:10});
R.zoo['Tree frog']=A({care:'none',posture:'sprawl',cov:'skin',blood:'cold',breathe:'skinlungs',color:'green',legLen:95,tail:0,size:4,diet:'meat',activity:'night',escape:'flee',eyes:95,waterSave:10});
R.zoo['Poison dart frog']=A({care:'some',posture:'sprawl',cov:'skin',blood:'cold',breathe:'skinlungs',color:'orange',pattern:'spots',defence:'poison',legLen:25,tail:0,size:3,diet:'meat',activity:'day',escape:'freeze',eyes:35,waterSave:10});
R.zoo['Bullfrog']=A({care:'none',posture:'sprawl',cov:'skin',blood:'cold',breathe:'skinlungs',color:'green',pattern:'stripes',fatWhere:'all',fat:85,legLen:50,tail:0,size:14,diet:'meat',activity:'night',escape:'flee',eyes:50,waterSave:10});
})();
