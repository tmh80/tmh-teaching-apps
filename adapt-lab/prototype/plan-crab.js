/* Adapt Lab art prototype: CRAB body plan (shore crab, rock crab, ghost crab).
   What makes a crab a crab in outline: a wide flat shell, two claws held up, four walking legs each side, eyes on stalks.
   A crab walks sideways, so when it moves across the screen we see it face-on: the shell is wide and the legs fan out left and right.
   Same style rules as rig.js: flat fills, no outlines, base / shade / belly tones. Feet on y = 0, centred on x = 0.
   Movement: pose.phase drives a sideways scuttle with the legs alternating; pose.move scales it. Idle: claws open and close, eye stalks sway. */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,fill,ell,smooth,seg,ik,leaf,step,rng,mix}=R;
const n01=(t,k,d)=>(t[k]??d??50)/100;

function drawCrab(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,mv=po.move||0,ph=po.phase||0,seed=s.seed||0;
  const W=s.W,Hh=s.Hs;
  const bob=mv*Math.sin(ph*TAU*2)*1.5+(1-mv)*Math.sin(t*1.6+seed)*.5,rock=mv*Math.sin(ph*TAU)*.04;
  const cy=-(s.ride+Hh)+bob;
  const stride=s.leg*.48*mv,lift=s.ride*.55*mv;
  // walking legs: four each side. i = 0 is the inner leg (near foot, low knee), i = 3 the outer leg (far foot, high knee)
  function leg(side,i){const hip=[side*W*(.9-.06*i),cy+Hh*(.5-.1*i)];
    const[dx,dy]=step(ph,((i%2)?.5:0)+(side>0?0:.5),stride,lift);
    const f=[side*(W*.98+s.reach*(.42+.3*i))+dx,dy-.8];
    const l1=s.l1*(.74+.13*i),l2=s.l2*(.74+.14*i);
    const kn=ik(hip[0],hip[1],f[0],f[1],l1,l2,side>0?-1:1);
    fill(c,i>=2?col.shade:s.limb,p=>{seg(p,hip[0],hip[1],kn[0],kn[1],s.legW*1.5,s.legW);seg(p,kn[0],kn[1],f[0],f[1],s.legW,s.legW*.3)})}
  for(let i=3;i>=0;i--){leg(-1,i);leg(1,i)}
  // claws, held up and out. The far-side arm is drawn before the shell so the shell hides its root.
  function claw(side){const sway=Math.sin(t*1.1+seed+side)*.06+(po.twitch?.25:0);
    const sh=[side*W*.78,cy-Hh*.05],k=s.claw;
    const el=[side*(W*1.12+4*k),cy+Hh*.15-sway*8];
    const pm=[side*(W*1.22+7*k),cy-Hh*.95-10*k-sway*14];
    fill(c,s.limb,p=>{seg(p,sh[0],sh[1],el[0],el[1],6.2,5);seg(p,el[0],el[1],pm[0],pm[1],5,6.4*k)});
    const a=-Math.PI/2-side*(.55-sway),open=.34+.2*Math.sin(t*1.5+seed*2+side*1.3)+(po.twitch?.3:0);
    c.save();c.translate(pm[0],pm[1]);c.rotate(a);if(side<0)c.scale(1,-1);
    fill(c,col.base,p=>ell(p,5*k,0,10.5*k,7.6*k));
    fill(c,col.base,p=>{leaf(p,9*k,-2.4*k,16*k,5*k,-open*.5)});
    fill(c,s.limb,p=>{leaf(p,9*k,3*k,13.5*k,3.8*k,open*.5+.12)});
    fill(c,col.belly,p=>{leaf(p,17*k,-2.4*k-Math.sin(open*.5)*8*k,7.5*k,2.2*k,-open*.5)});     // pale tip
    c.restore()}
  // shell
  c.save();c.translate(0,cy);c.rotate(rock);
  // eye stalks first, so the shell covers their roots
  [-1,1].forEach(sd=>{const lean=sd*.2+Math.sin(t*1.3+seed+sd)*.07,len=s.stalk*(po.blink?.45:1);const bx=sd*W*.3,by=-Hh*.88,tx=bx+Math.sin(lean)*len,ty=by-Math.cos(lean)*len;
    c.strokeStyle=s.limb;c.lineCap='round';c.lineWidth=3.1;c.beginPath();c.moveTo(bx,by+3);c.lineTo(tx,ty);c.stroke();
    fill(c,col.dark,p=>ell(p,tx,ty,s.eye,s.eye));fill(c,'#ffffff',p=>ell(p,tx+s.eye*.3,ty-s.eye*.35,s.eye*.3,s.eye*.3))});
  const shell=new Path2D();
  smooth(shell,[[-W,-Hh*.12],[-W*.74,-Hh*.84],[-W*.26,-Hh*1.02],[W*.26,-Hh*1.02],[W*.74,-Hh*.84],[W,-Hh*.12],[W*.8,Hh*.62],[W*.3,Hh*.98],[-W*.3,Hh*.98],[-W*.8,Hh*.62]],true,1);
  // teeth along the front edge of the shell (longer when it has spines)
  const tl=s.spiny?8.5:3.6;[-1,1].forEach(sd=>{for(let i=0;i<3;i++){const u=.42+i*.2,x=sd*W*(.62+.19*i),y=-Hh*(.92-.3*i);shell.moveTo(x-3.4,y+3);shell.lineTo(x+sd*tl*.75,y-tl);shell.lineTo(x+3.4,y+3);shell.closePath()}});
  if(s.spiny){for(let i=-2;i<=2;i++){const x=i*W*.19,y=-Hh*1.0;shell.moveTo(x-3.2,y+3);shell.lineTo(x,y-7.5);shell.lineTo(x+3.2,y+3);shell.closePath()}}
  c.fillStyle=col.base;c.fill(shell);
  c.save();c.clip(shell);
  fill(c,col.belly,p=>ell(p,0,Hh*1.08,W*.9,Hh*.62));                                 // pale underside
  fill(c,mix(col.base,col.belly,.4),p=>ell(p,-W*.24,-Hh*.62,W*.36,Hh*.13,-.06));     // shine on the hard shell
  if(s.pattern==='spots'){const Rn=rng(seed*5+2);c.fillStyle=col.mark;for(let i=0;i<16;i++){const x=lerp(-W*.85,W*.85,Rn()),y=lerp(-Hh*.9,Hh*.25,Rn()),r=1.6+2.4*Rn();c.beginPath();c.ellipse(x,y,r*1.2,r,Rn()*3,0,TAU);c.fill()}}
  if(s.pattern==='stripes'){c.strokeStyle=col.mark;c.lineWidth=3.6;c.lineCap='round';for(let i=-3;i<=3;i++){const x=i*W*.25;c.beginPath();c.moveTo(x*.82,-Hh*1.1);c.quadraticCurveTo(x*1.08,-Hh*.3,x,Hh*.36);c.stroke()}}
  if(s.pattern==='counter')fill(c,col.shade,p=>ell(p,0,-Hh*1.05,W*1.05,Hh*.5));
  if(s.domed){c.strokeStyle=col.shade;c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(-W*.6,-Hh*.38);c.quadraticCurveTo(0,-Hh*.74,W*.6,-Hh*.38);c.stroke();
    c.beginPath();c.moveTo(-W*.34,-Hh*.02);c.quadraticCurveTo(0,-Hh*.24,W*.34,-Hh*.02);c.stroke()}
  c.restore();
  // face: mouth plate between the claws
  fill(c,col.shade,p=>{p.moveTo(-W*.2,Hh*.3);p.quadraticCurveTo(0,Hh*.16,W*.2,Hh*.3);p.lineTo(W*.14,Hh*.7);p.quadraticCurveTo(0,Hh*.8,-W*.14,Hh*.7);p.closePath()});
  c.strokeStyle=col.belly;c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(0,Hh*.3);c.lineTo(0,Hh*.72);c.stroke();
  c.restore();
  claw(-1);claw(1);
}

R.register('crab',{
  test:t=>t.cov==='exo'&&(t.breathe==='gills'||t.defence==='shell'),
  spec:(t,seed,col)=>{const L=n01(t,'legLen'),fat=t.fatWhere==='all'?n01(t,'fat',30):0,domed=t.defence==='shell';
    return{L:150,leg:26+16*L,W:35+4*fat,Hs:14.5+(domed?4.5:0)+4*fat,ride:9+17*L,reach:16+24*L,l1:17+12*L,l2:21+17*L,legW:4.6,
      claw:.78+(t.diet==='meat'?.5:t.diet==='both'?.28:.06)+(t.defence==='none'?.1:0),stalk:5+11*n01(t,'eyes',40),eye:2.9+2.4*n01(t,'eyes',40),
      spiny:t.defence==='spines',domed,limb:mix(col.base,col.shade,.45)}},
  draw:drawCrab,
  size:s=>({len:2*(s.W*1.22+7*s.claw)+26+s.reach*1.5,height:s.ride+s.Hs*2+18*s.claw+12,dx:0}),
  young:s=>({...s,young:true,claw:s.claw*.75,eye:s.eye*1.25,stalk:s.stalk*1.1})
});
const A=R.A;
// 'Shore crab' is copied from PRESETS in Adapt-Lab.html (crab); the other two show how traits change the picture
R.zoo['Shore crab']=A({care:'none',cov:'exo',blood:'cold',breathe:'gills',shape:'round',legs:'6',legLen:40,color:'green',defence:'shell',size:12,tail:0,diet:'both',activity:'night',escape:'hide',eyes:30,salt:85});
R.zoo['Red rock crab']=A({care:'none',cov:'exo',blood:'cold',breathe:'gills',shape:'round',legs:'6',legLen:62,color:'orange',pattern:'spots',defence:'spines',size:14,tail:0,diet:'meat',activity:'day',escape:'flee',eyes:55,salt:90});
R.zoo['Ghost crab']=A({care:'none',cov:'exo',blood:'cold',breathe:'gills',shape:'round',legs:'6',legLen:92,color:'sandy',defence:'none',size:8,tail:0,diet:'both',activity:'night',escape:'flee',eyes:95,salt:80});
})();
