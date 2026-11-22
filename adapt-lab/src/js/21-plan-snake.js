/* Adapt Lab art prototype: SNAKE body plan (legless reptile or amphibian).
   Chosen when: scales or moist skin, no legs, no fins.
   Silhouette notes: one long tapering tube, S-curves on the ground, raised head on a curved neck,
   wedge head a little wider than the neck, forked tongue. Rattlesnakes add a segmented rattle on a raised tail tip.
   Local units: faces right, belly on y = 0, about 170 long. The sideways slither is drawn as seen from slightly above,
   so the body weaves a little toward and away from the viewer on the ground. */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,fill,ell,tube,mix}=R;
const sst=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const N=24;
function width(u,s){ // 0 = tail tip, 1 = snout
  let k;
  if(u<.34)k=lerp(.16,1,sst(u/.34));
  else if(u<.74)k=1;
  else if(u<.9)k=lerp(1,.7,sst((u-.74)/.16));
  else if(u<.965)k=lerp(.7,1.02,sst((u-.9)/.065));
  else k=lerp(1.02,.62,sst((u-.965)/.035));
  return s.D*k;
}
function spine(s,po){
  const t=po.t||0,mv=po.move||0,ph=po.phase||0,L=s.L,D=s.D;
  const raise=s.raise*lerp(1,.5,mv)*(po.strike?.35:1);
  const pts=[],w=[];
  for(let i=0;i<N;i++){const u=i/(N-1);
    const x=lerp(-L*.5,L*.44,u)+(u>.72?-sst((u-.72)/.2)*D*.9*(1-mv*.5):0)+(u>.9?(u-.9)/.1*D*1.5:0);
    const env=sst(u/.18)*(1-sst((u-.58)/.2));
    const wave=Math.sin((u*s.waves+ph)*TAU)*D*lerp(.95,1.25,mv)*env+Math.sin(t*.9+u*6)*D*.1*(1-mv)*env;
    const lift=raise*sst((u-.66)/.24)+(u>.9?Math.sin(t*1.3+(s.seed||0))*D*.12*(1-mv):0);
    const tailUp=s.rattle?D*2.2*Math.pow(1-sst(u/.12),1.5):0;
    const ww=width(u,s);pts.push([x,-ww/2-D*.55+wave*.55-lift-tailUp]);w.push(ww)}
  return{pts,w};
}
function drawSnake(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,D=s.D,L=s.L;
  const{pts,w}=spine(s,po);
  // rattle (behind the tail tip)
  if(s.rattle){const a=pts[0],b=pts[2];let dx=a[0]-b[0],dy=a[1]-b[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const sh=Math.sin(t*38)*D*.1*(po.rattle?1:.25);
    for(let i=3;i>=0;i--){const r=D*(.3-.035*i);fill(c,i%2?'#cdb98a':'#e3d3a6',p=>ell(p,a[0]+dx*r*1.25*i-dy*sh*i*.4,a[1]+dy*r*1.25*i+dx*sh*i*.4,r*.8,r,Math.atan2(dy,dx)))}}
  const body=new Path2D();tube(body,pts,w);c.fillStyle=col.base;c.fill(body);
  c.save();c.clip(body);
  // belly: the same tube shifted down
  fill(c,col.belly,p=>tube(p,pts.map((q,i)=>[q[0],q[1]+w[i]*.62]),w));
  if(s.pattern==='counter')fill(c,col.shade,p=>tube(p,pts.map((q,i)=>[q[0],q[1]-w[i]*.62]),w));
  const dir=i=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)];const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;return[dx/d,dy/d]};
  if(s.pattern==='stripes'){c.strokeStyle=col.mark;c.lineCap='butt';for(let i=2;i<N-3;i+=2){const q=pts[i],[dx,dy]=dir(i),hw=w[i]*.7;c.lineWidth=L*.026;c.beginPath();c.moveTo(q[0]+dy*hw,q[1]-dx*hw);c.lineTo(q[0]-dy*hw,q[1]+dx*hw);c.stroke()}
    c.strokeStyle=col.belly;for(let i=3;i<N-3;i+=2){const q=pts[i],[dx,dy]=dir(i),hw=w[i]*.7;c.lineWidth=L*.008;c.beginPath();c.moveTo(q[0]+dy*hw,q[1]-dx*hw);c.lineTo(q[0]-dy*hw,q[1]+dx*hw);c.stroke()}}
  if(s.pattern==='spots'){for(let i=3;i<N-4;i+=2){const q=pts[i],[dx,dy]=dir(i),hl=L*.03,hh=w[i]*.42,cx=q[0]+dy*w[i]*.14,cy=q[1]-dx*w[i]*.14;
      const dia=(k,colr)=>fill(c,colr,p=>{p.moveTo(cx-dx*hl*k,cy-dy*hl*k);p.lineTo(cx+dy*hh*k,cy-dx*hh*k);p.lineTo(cx+dx*hl*k,cy+dy*hl*k);p.lineTo(cx-dy*hh*k,cy+dx*hh*k);p.closePath()});
      dia(1,col.mark);dia(.42,col.base)}}
  c.restore();
  // head details
  const h=pts[N-2],tip=pts[N-1],[hdx,hdy]=dir(N-2),hw=w[N-2];
  R.eye(c,h[0]-hdx*hw*.1+hdy*hw*.16,h[1]-hdy*hw*.1-hdx*hw*.16-hw*.06,hw*.17,{blink:po.blink,ring:col.eyeRing,dark:col.dark});
  c.strokeStyle=col.shade;c.lineWidth=hw*.07;c.lineCap='round';c.beginPath();c.moveTo(tip[0]+hdx*hw*.22,tip[1]+hw*.12);c.quadraticCurveTo(h[0]+hdx*hw*.2,h[1]+hw*.3,h[0]-hdx*hw*.35,h[1]+hw*.2);c.stroke();
  fill(c,col.dark,p=>ell(p,tip[0]+hdx*hw*.12,tip[1]-hw*.1,hw*.045,hw*.035));
  if(po.tongue){const tx=tip[0]+hdx*hw*.3,ty=tip[1]+hw*.1,f=hw*(.9+.25*Math.sin(t*30));c.strokeStyle='#d6455b';c.lineWidth=hw*.09;c.lineJoin='round';c.beginPath();c.moveTo(tx,ty);c.lineTo(tx+f,ty+hw*.05);c.lineTo(tx+f*1.4,ty-hw*.22);c.moveTo(tx+f,ty+hw*.05);c.lineTo(tx+f*1.4,ty+hw*.3);c.stroke()}
}
R.register('snake',{
  test:t=>(t.cov==='scales'||t.cov==='skin')&&t.legs==='0'&&t.fins!=='fins',
  spec:(t,seed,col)=>{const n=k=>(t[k]??50)/100;const fat=t.fatWhere==='all'?n('fat'):0;
    return{L:150+40*n('tail'),D:(13+9*n('size'))*(1+.3*fat)*(t.cov==='skin'?1.12:1),raise:26+10*n('size'),waves:1.6+.6*n('tail'),
      rattle:t.defence==='poison'&&t.pattern==='spots',tongue:true,col:{...col,belly:mix(col.belly,'#fff6dc',.35)}}},
  draw:drawSnake,
  size:s=>({len:s.L*1.02,height:s.raise+s.D*3.2+(s.rattle?s.D*1.2:0),dx:4}),
  young:s=>({...s,young:true,L:s.L*.82,D:s.D*1.1,raise:s.raise*.8})
});
R.zoo['Rattlesnake']=R.A({cov:'scales',blood:'cold',shape:'long',legs:'0',color:'sandy',pattern:'spots',defence:'poison',senses:'tongue',size:25,tail:40,diet:'meat',activity:'night',escape:'freeze'});
R.zoo['Coral snake']=R.A({cov:'scales',blood:'cold',shape:'long',legs:'0',color:'orange',pattern:'stripes',defence:'poison',senses:'tongue',size:10,tail:55,diet:'meat',escape:'hide'});
})();
