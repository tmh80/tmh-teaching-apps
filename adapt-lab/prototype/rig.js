/* Adapt Lab art prototype: jointed body-plan rigs.
   Style rules (keep these when porting):
   1. Flat fills, no outlines. Parts of one animal share one fill colour, so overlapping shapes merge into one silhouette.
   2. Three tones per animal: base, shade (far-side legs, wing, far ear) and belly (underside). One dark for eyes, nose, hooves.
   3. Every plan is drawn in local units facing right, feet on y = 0, body about 100 units long. The caller translates, scales and flips.
   4. Movement comes from the pose {t, phase, move}: phase advances with distance walked, so feet never slide.
   Each draw function is pure: (ctx, spec, pose). No globals, no DOM. */
(function(root){
"use strict";
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hex(c){const n=parseInt(c.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}
function mix(a,b,t){const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(lerp(v,B[i],t)).toString(16).padStart(2,'0')).join('')}

/* ---------- drawing primitives ---------- */
// smooth closed (or open) curve through points (Catmull-Rom converted to beziers)
function area(pts){let a=0;for(let i=0;i<pts.length;i++){const q=pts[(i+1)%pts.length];a+=pts[i][0]*q[1]-q[0]*pts[i][1]}return a}
function smooth(p,pts,closed=true,T=1){
  if(closed&&area(pts)<0)pts=pts.slice().reverse();
  const n=pts.length;const P=i=>closed?pts[(i%n+n)%n]:pts[clamp(i,0,n-1)];
  p.moveTo(pts[0][0],pts[0][1]);const m=closed?n:n-1;
  for(let i=0;i<m;i++){const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);
    p.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6*T,p1[1]+(p2[1]-p0[1])/6*T,p2[0]-(p3[0]-p1[0])/6*T,p2[1]-(p3[1]-p1[1])/6*T,p2[0],p2[1])}
  if(closed)p.closePath();
}
// variable-width tube along a spine: necks, tails, lizards, snakes, fish
function tube(p,pts,w){
  const n=pts.length,Lf=[],Rt=[];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
    const hw=w[i]/2;Lf.push([pts[i][0]-dy*hw,pts[i][1]+dx*hw]);Rt.push([pts[i][0]+dy*hw,pts[i][1]-dx*hw])}
  smooth(p,Lf.concat(Rt.reverse()),true,1);
  p.moveTo(pts[0][0]+w[0]/2,pts[0][1]);p.arc(pts[0][0],pts[0][1],w[0]/2,0,TAU);
  p.moveTo(pts[n-1][0]+w[n-1]/2,pts[n-1][1]);p.arc(pts[n-1][0],pts[n-1][1],w[n-1]/2,0,TAU);
}
// tapered limb segment with round joints
function seg(p,x1,y1,x2,y2,w1,w2){
  let dx=x2-x1,dy=y2-y1;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
  p.moveTo(x1+dy*w1/2,y1-dx*w1/2);p.lineTo(x2+dy*w2/2,y2-dx*w2/2);p.lineTo(x2-dy*w2/2,y2+dx*w2/2);p.lineTo(x1-dy*w1/2,y1+dx*w1/2);p.closePath();
  p.moveTo(x1+w1/2,y1);p.arc(x1,y1,w1/2,0,TAU);p.moveTo(x2+w2/2,y2);p.arc(x2,y2,w2/2,0,TAU);
}
// two-bone leg: returns the knee. dir -1 bends forward (to +x), +1 bends back
function ik(hx,hy,fx,fy,l1,l2,dir){
  let dx=fx-hx,dy=fy-hy;let d=Math.hypot(dx,dy);d=clamp(d,Math.abs(l1-l2)+.01,l1+l2-.01);
  const a=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));const ang=Math.atan2(dy,dx)+dir*a;
  return[hx+Math.cos(ang)*l1,hy+Math.sin(ang)*l1];
}
function ell(p,x,y,rx,ry,rot){p.moveTo(x+rx*Math.cos(rot||0),y+rx*Math.sin(rot||0));p.ellipse(x,y,rx,ry,rot||0,0,TAU)}
function leaf(p,x,y,len,wid,ang){if(len*wid>0)wid=-wid;const c=Math.cos(ang),s=Math.sin(ang);const tx=x+c*len,ty=y+s*len;const nx=-s*wid,ny=c*wid;
  p.moveTo(x,y);p.quadraticCurveTo(x+c*len*.45+nx,y+s*len*.45+ny,tx,ty);p.quadraticCurveTo(x+c*len*.45-nx,y+s*len*.45-ny,x,y);p.closePath()}
function fill(c,col,fn){c.fillStyle=col;c.beginPath();fn(c);c.fill()}
function eye(c,x,y,r,o){o=o||{};
  if(o.blink){c.strokeStyle=o.dark||'#1d1a1a';c.lineWidth=r*.45;c.lineCap='round';c.beginPath();c.moveTo(x-r*.8,y);c.quadraticCurveTo(x,y+r*.5,x+r*.8,y);c.stroke();return}
  if(o.ring){fill(c,o.ring,p=>ell(p,x,y,r*1.5,r*1.5))}
  fill(c,o.dark||'#1d1a1a',p=>ell(p,x,y,r,r));
  fill(c,'#ffffff',p=>ell(p,x+r*.32,y-r*.36,r*.33,r*.33));
}
// footfall: returns [dx,dy] of a foot relative to its rest spot
function step(phase,off,stride,lift){
  const p=((phase+off)%1+1)%1,duty=.62;
  if(p<duty)return[stride*(.5-p/duty),0];
  const u=(p-duty)/(1-duty);return[stride*(-.5+(1-Math.cos(u*Math.PI))/2),-Math.sin(u*Math.PI)*lift];
}
function pattern(c,clip,s,box,seed){
  if(!s.pattern||s.pattern==='plain')return;
  c.save();c.clip(clip);const R=rng(seed||11);const[x0,y0,x1,y1]=box;
  if(s.pattern==='spots'){c.fillStyle=s.col.mark;for(let i=0;i<80;i++){const x=lerp(x0,x1,R()),y=lerp(y0,lerp(y0,y1,.8),R()),r=(y1-y0)*(.016+.022*R());c.beginPath();c.ellipse(x,y,r*1.2,r,R()*3,0,TAU);c.fill()}}
  if(s.pattern==='stripes'){c.strokeStyle=s.col.mark;c.lineCap='round';const n=13;for(let i=0;i<n;i++){const x=lerp(x0,x1,(i+.5)/n);c.lineWidth=(x1-x0)/n*(.34+.14*R());c.beginPath();c.moveTo(x+(y1-y0)*.1,y0);c.quadraticCurveTo(x-(y1-y0)*.06,(y0+y1)/2,x+(y1-y0)*.04,y1);c.stroke()}}
  c.restore();
}

/* ================= QUADRUPED: hare, fox, wolf, camel, zebra, deer, cat ================= */
function drawQuad(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,mv=po.move||0,ph=po.phase||0,hd=po.headDown||0;
  const L=s.L,D=s.D,leg=s.leg,lw=s.legW;
  const bob=mv*Math.sin(ph*TAU*2)*D*.035+(1-mv)*Math.sin(t*1.7+(s.seed||0))*D*.012;
  const top=-(leg+D)+bob,bot=-leg+bob,cy=(top+bot)/2;
  const hipX=-L*.30,shX=L*.30,jy=cy+D*.14,hh=-jy;
  const stride=leg*.62*mv,lift=leg*.2*mv;
  const l1=hh*.525,l2=hh*.5;
  const LEGS=[{x:hipX-L*.02,off:.5,far:1,hind:1},{x:shX+L*.05,off:.75,far:1,hind:0},{x:hipX-L*.08,off:0,far:0,hind:1},{x:shX-L*.01,off:.25,far:0,hind:0}];
  function drawLeg(g){const[dx,dy]=step(ph,g.off,stride,lift);const fx=g.x+dx+(g.hind?-L*.02:L*.02),fy=dy;
    const k=ik(g.x,jy,fx,fy,l1,l2,g.hind?1:-1);const tone=g.far?col.shade:col.base;
    fill(c,tone,p=>{seg(p,g.x,jy,k[0],k[1],lw*(g.hind?2.3:1.8),lw*1.15);seg(p,k[0],k[1],fx,fy-lw*.35,lw*1.15,lw*.85)});
    if(s.feet==='hoof')fill(c,col.dark,p=>{p.moveTo(fx-lw*.5,fy-lw*.75);p.lineTo(fx+lw*.55,fy-lw*.75);p.lineTo(fx+lw*.8,fy);p.lineTo(fx-lw*.6,fy);p.closePath()});
    else fill(c,g.far?col.shade:col.paw||tone,p=>ell(p,fx+lw*.3,fy-lw*.36,lw*.85,lw*.42))}
  // far legs
  LEGS.filter(g=>g.far).forEach(drawLeg);
  // tail
  const tx=hipX-L*.18,ty=top+D*.34,sw=Math.sin(t*2.2+(s.seed||0))*.25+mv*Math.sin(ph*TAU)*.2;
  if(s.tailType==='stub')fill(c,col.belly,p=>ell(p,tx-D*.05,ty-D*.04,D*.17,D*.16));
  else{const tl=s.tail,droop=s.tailType==='bushy'?.55:1.05;const pts=[];for(let i=0;i<=4;i++){const u=i/4;const a=Math.PI-droop*u*.9+sw*u*.6+(s.tailType==='bushy'?-.25:0);pts.push([tx+Math.cos(a)*tl*u+2,ty-Math.sin(a)*tl*u*.2+tl*u*u*droop*.75])}
    const w=s.tailType==='bushy'?[D*.16,D*.3,D*.36,D*.3,D*.1]:[D*.11,D*.085,D*.07,D*.06,D*.05];
    fill(c,col.base,p=>tube(p,pts,w));
    if(s.tailType==='bushy')fill(c,col.belly,p=>ell(p,pts[4][0],pts[4][1],D*.12,D*.1));
    if(s.tailType==='tuft')fill(c,col.dark,p=>leaf(p,pts[4][0],pts[4][1],D*.3,D*.11,Math.atan2(pts[4][1]-pts[3][1],pts[4][0]-pts[3][0])))}
  // body silhouette
  const fat=s.fat||0,fl=s.fluff||0;
  const body=new Path2D();
  smooth(body,[[hipX-L*.2,cy-D*.05],[hipX-L*.08,top+D*.04],[0,top+D*(.06-.03*fat)],[shX-L*.02,top+D*.02],[shX+L*.16,cy-D*.12],[shX+L*.12,bot-D*.12],[0,bot+D*(.02+.12*fat)],[hipX-L*.08,bot-D*.04]],true,1);
  if(s.hump)ell(body,-L*.04,top+D*.02,L*.2,D*(.2+.3*s.hump));
  if(fl>.5){const r=D*(.07+.1*fl);[[shX+L*.15,cy+D*.06],[shX+L*.12,cy+D*.3],[shX+L*.02,bot-D*.02],[hipX-L*.19,cy+D*.12],[hipX-L*.14,cy+D*.32],[hipX-L*.2,cy-D*.14]].forEach(q=>ell(body,q[0],q[1],r,r))}
  // neck and head
  const wx=shX+L*.06,wy=top+D*.3;const A=lerp(s.neckUp,-.75,hd);const N=s.neck;
  const hx=wx+Math.cos(A)*N+L*.1,hy=wy-Math.sin(A)*N-D*.04+(1-mv)*Math.sin(t*1.7)*.6;
  const hr=s.head,ha=lerp(.1,1.15,hd)+(s.neckUp>.9?.3:0);
  const neck=new Path2D();tube(neck,[[wx-L*.06,wy+D*.12],[(wx+hx)/2-L*.01,(wy+hy)/2+D*.04],[hx-hr*.2,hy+hr*.1]],[D*.62,lerp(D*.5,hr*1.5,.55),hr*1.45]);
  const sl=hr*(.55+s.snout*.9),sx=hx+Math.cos(ha)*(hr*.35+sl*.6),sy=hy+Math.sin(ha)*(hr*.35+sl*.6);
  const head=new Path2D();ell(head,hx,hy,hr,hr*.94);ell(head,sx,sy,sl,hr*(.62-.08*s.snout),ha);
  const ex=hx-hr*.5,ey=hy-hr*.75,ea=-Math.PI/2-.35+(s.earLop||0)+Math.sin(t*3+(s.seed||0)*2)*.04;
  const tw=po.twitch?Math.sin(t*30)*.12:0;
  // far ear
  fill(c,col.shade,p=>leaf(p,ex+hr*.34,ey+hr*.08,s.ear,s.earW,ea+.28+tw));
  if(fl>.5)ell(neck,wx+L*.02,wy+D*.34,D*(.1+.1*fl),D*(.1+.1*fl));
  const all=new Path2D();all.addPath(body);all.addPath(neck);all.addPath(head);
  c.fillStyle=col.base;c.fill(all);
  // belly and markings (clipped to the silhouette)
  c.save();c.clip(all);
  fill(c,col.belly,p=>{ell(p,L*.02,bot+D*.08,L*.62,D*(s.pattern==='counter'?.52:.34));ell(p,sx+sl*.1,sy+hr*.5,sl*1.1,hr*.5,ha)});
  if(s.pattern==='counter')fill(c,col.shade,p=>ell(p,0,top-D*.05,L*.75,D*.3));
  c.restore();
  pattern(c,all,s,[hipX-L*.25,top-D*.2-(s.neckUp>.6?N:0),hx+hr,bot],s.seed);
  if(s.mane)fill(c,col.dark,p=>tube(p,[[wx-L*.04,wy-D*.06],[(wx+hx)/2-L*.05,(wy+hy)/2-D*.12],[hx-hr*.7,hy-hr*.55]],[D*.06,D*.1,D*.07]));
  // near legs
  LEGS.filter(g=>!g.far).forEach(drawLeg);
  // near ear, face
  fill(c,col.base,p=>leaf(p,ex,ey,s.ear,s.earW,ea-tw));
  fill(c,col.earIn,p=>leaf(p,ex+Math.cos(ea)*s.ear*.14,ey+Math.sin(ea)*s.ear*.14,s.ear*.72,s.earW*.5,ea-tw));
  fill(c,col.base,p=>ell(p,ex+hr*.1,ey+hr*.25,hr*.3,hr*.26));
  eye(c,hx+hr*.3+Math.cos(ha)*hr*.1,hy-hr*.16,hr*.2,{blink:po.blink,dark:col.dark});
  const nx=sx+Math.cos(ha)*sl*.86,ny=sy+Math.sin(ha)*sl*.86-hr*.1;
  fill(c,col.nose||col.dark,p=>ell(p,nx,ny,hr*.16,hr*.12,ha));
  if(s.cheek)fill(c,col.cheek,p=>ell(p,hx+hr*.2,hy+hr*.3,hr*.2,hr*.13));
}

/* ================= BIRD: owl, hawk, songbird, ostrich, heron, gannet ================= */
function drawBird(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,mv=po.move||0,ph=po.phase||0,fly=po.fly||0;
  const B=s.B,leg=s.leg*(1-fly*.75);
  const bob=mv*(1-fly)*Math.abs(Math.sin(ph*TAU))*B*.05+fly*Math.sin(po.flap||0)*B*.06+(1-mv)*Math.sin(t*1.8)*B*.01;
  const cx=0,cy=-(leg+B*.36)+bob,tilt=lerp(s.tilt,.08,fly);
  const flap=Math.sin(po.flap||t*9);
  const wing=(far)=>{const sxw=cx+B*.1,syw=cy-B*.1;c.save();c.translate(sxw,syw);
    const v=fly>.5?clamp(flap,-1,1):0;const ys=fly>.5?(Math.abs(v)<.18?(v<0?-.18:.18):v):0;
    if(fly>.5){c.scale(1,ys);c.rotate(-.75);const W=s.wing*1.1;fill(c,far?col.shade:col.wing,p=>smooth(p,[[W*.08,0],[W*.42,-W*.45],[W*.3,-W*1.08],[-W*.1,-W*.98],[-W*.38,-W*.7],[-W*.56,-W*.3],[-W*.42,0]],true,1));
      c.strokeStyle=col.shade;c.lineWidth=B*.012;c.globalAlpha=.5;for(let i=1;i<4;i++){c.beginPath();c.moveTo(-W*.05*i,-W*.1);c.lineTo(-W*.1*i+W*.1,-W*(.95-.12*i));c.stroke()}}
    c.restore()};
  if(fly>.5)wing(true);
  // legs
  const legCol=col.leg;c.strokeStyle=legCol;c.lineCap='round';c.lineJoin='round';
  [[.5,1],[0,0]].forEach(([off,far])=>{const hxl=cx-B*.04+(far?B*.07:-B*.03),hyl=cy+B*.2;
    if(fly>.5){c.lineWidth=s.legW;c.beginPath();c.moveTo(hxl,hyl);c.lineTo(hxl-B*.22,hyl+B*.1);c.stroke();return}
    const[dx,dy]=step(ph,off,s.leg*.5*mv,s.leg*.25*mv);const fx=hxl+dx+B*.02,fy=dy;const k=ik(hxl,hyl,fx,fy,(-hyl)*.55,(-hyl)*.52,1);
    c.globalAlpha=far?.75:1;c.lineWidth=s.legW;c.beginPath();c.moveTo(hxl,hyl);c.lineTo(k[0],k[1]);c.lineTo(fx,fy-s.legW*.3);c.stroke();
    c.lineWidth=s.legW*.8;c.beginPath();c.moveTo(fx-B*.07,fy-s.legW*.3);c.lineTo(fx+B*.12,fy-s.legW*.3);c.moveTo(fx,fy-s.legW*.3);c.lineTo(fx+B*.09,fy-s.legW*1.3);c.stroke();c.globalAlpha=1;
    if(s.thigh)fill(c,far?col.shade:col.base,p=>ell(p,hxl,hyl-B*.02,B*.13,B*.2,.2))});
  // body + tail
  c.save();c.translate(cx,cy);c.rotate(-tilt);
  fill(c,col.shade,p=>{p.moveTo(-B*.3,-B*.1);p.lineTo(-B*.52-s.tail,-B*.02);p.quadraticCurveTo(-B*.56-s.tail,B*.1,-B*.5-s.tail,B*.2);p.lineTo(-B*.28,B*.16);p.closePath()});
  const body=new Path2D();smooth(body,[[-B*.5,B*.02],[-B*.22,-B*.27],[B*.2,-B*.31],[B*.48,-B*.08],[B*.4,B*.2],[B*.05,B*.34],[-B*.3,B*.24]],true,1);
  c.fillStyle=col.base;c.fill(body);
  c.save();c.clip(body);fill(c,col.belly,p=>ell(p,B*.16,B*.3,B*.46,B*.3,-.15));
  if(s.pattern==='spots'){const R=rng(s.seed||5);c.fillStyle=col.mark;for(let i=0;i<22;i++){c.beginPath();c.ellipse(lerp(-B*.4,B*.4,R()),lerp(-B*.25,B*.3,R()),B*.035,B*.022,.5,0,TAU);c.fill()}}
  c.restore();
  if(fly<=.5){fill(c,col.wing,p=>smooth(p,[[B*.22,-B*.16],[B*.02,-B*.26],[-B*.36,-B*.14],[-B*.62-s.tail*.4,B*.08],[-B*.3,B*.14],[B*.02,B*.1]],true,1));
    c.strokeStyle=col.shade;c.lineWidth=B*.014;c.lineCap='round';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-B*(.1+.12*i),-B*.04);c.quadraticCurveTo(-B*(.25+.12*i),B*.04,-B*(.36+.1*i),B*.07);c.stroke()}}
  c.restore();
  // neck + head
  const nA=lerp(s.neckUp,.3,fly),N=s.neck;const bx=cx+Math.cos(tilt)*B*.36,by=cy-Math.sin(tilt)*B*.36-B*.04;
  const hx=bx+Math.cos(nA)*N+B*.02,hy=by-Math.sin(nA)*N-B*.04+(1-fly)*mv*Math.sin(ph*TAU*2)*B*.02,hr=s.head;
  if(N>B*.12)fill(c,col.neck||col.base,p=>tube(p,[[bx-B*.06,by+B*.1],[(bx+hx)/2,(by+hy)/2],[hx-hr*.1,hy+hr*.3]],s.thinNeck?[B*.17,hr*1.05,hr*.95]:[B*.3,lerp(B*.22,hr,.6),hr*1.1]));
  fill(c,col.head||col.base,p=>ell(p,hx,hy,hr,hr*.95));
  if(s.face)fill(c,col.belly,p=>ell(p,hx+hr*.22,hy+hr*.05,hr*.72,hr*.78));
  const bl=s.beak;fill(c,col.beak,p=>{if(s.beakType==='hook'){p.moveTo(hx+hr*.7,hy-hr*.12);p.quadraticCurveTo(hx+hr*.9+bl,hy-hr*.1,hx+hr*.8+bl,hy+hr*.5);p.quadraticCurveTo(hx+hr*.8+bl*.5,hy+hr*.3,hx+hr*.6,hy+hr*.3)}
    else{p.moveTo(hx+hr*.78,hy-hr*.22);p.lineTo(hx+hr*.9+bl,hy+hr*.08);p.lineTo(hx+hr*.74,hy+hr*.34)}p.closePath()});
  eye(c,hx+hr*.34,hy-hr*.12,hr*(s.bigEye?.3:.2),{blink:po.blink,ring:s.bigEye?col.eyeRing:null});
  if(fly>.5)wing(false);
}

/* ================= FISH: mackerel, trout, pike, shark ================= */
function drawFish(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,ph=po.phase!=null?po.phase:t*1.2;
  const L=s.L,D=s.D;const wag=Math.sin(ph*TAU);
  c.save();c.rotate(wag*.035);
  const sp=[],w=[];const prof=[.1,.2,.42,.74,.95,1,.9,.7,.34];
  for(let i=0;i<9;i++){const u=i/8;const x=lerp(-L*.42,L*.46,u);sp.push([x,Math.sin(ph*TAU-u*2.4)*D*.07*(1-u)*(1-u)]);w.push(D*prof[i])}
  // tail fin
  const tx=sp[0][0],ty=sp[0][1];c.save();c.translate(tx+L*.03,ty);c.rotate(wag*.3);c.scale(.72+.28*Math.cos(ph*TAU*1),1);
  fill(c,col.fin,p=>{p.moveTo(0,0);p.quadraticCurveTo(-L*.1,-D*.2,-L*.2,-D*.52*s.tailFin);p.quadraticCurveTo(-L*.12,0,-L*.2,D*.52*s.tailFin);p.quadraticCurveTo(-L*.1,D*.2,0,0);p.closePath()});c.restore();
  // dorsal + anal fins
  fill(c,col.fin,p=>{p.moveTo(L*.12,-D*.42);p.quadraticCurveTo(L*.0,-D*(.5+.5*s.fin),-L*.12,-D*(.42+.42*s.fin));p.quadraticCurveTo(-L*.1,-D*.5,-L*.2,-D*.3);p.closePath();
    p.moveTo(-L*.08,D*.38);p.quadraticCurveTo(-L*.16,D*(.45+.3*s.fin),-L*.24,D*(.36+.2*s.fin));p.lineTo(-L*.24,D*.22);p.closePath()});
  const body=new Path2D();tube(body,sp,w);c.fillStyle=col.base;c.fill(body);
  c.save();c.clip(body);fill(c,col.belly,p=>ell(p,L*.04,D*.42,L*.6,D*.4));
  if(s.pattern==='counter')fill(c,col.shade,p=>ell(p,0,-D*.5,L*.6,D*.3));
  if(s.pattern==='stripes'){c.strokeStyle=col.mark;c.lineWidth=L*.022;c.lineCap='round';for(let i=0;i<9;i++){const x=lerp(-L*.3,L*.22,i/8);c.beginPath();c.moveTo(x,-D*.48);c.quadraticCurveTo(x+L*.03,-D*.25,x-L*.01,-D*.04);c.stroke()}}
  if(s.pattern==='spots'){const R=rng(s.seed||3);c.fillStyle=col.mark;for(let i=0;i<24;i++){c.beginPath();c.arc(lerp(-L*.34,L*.26,R()),lerp(-D*.4,D*.1,R()),D*.04,0,TAU);c.fill()}}
  c.restore();
  // gill, pectoral fin, eye
  c.strokeStyle=col.shade;c.lineWidth=L*.012;c.lineCap='round';c.beginPath();c.arc(L*.18,0,D*.36,-.9,.9);c.stroke();
  c.save();c.translate(L*.14,D*.14);c.rotate(.5+Math.sin(t*4)*.25);fill(c,col.fin,p=>leaf(p,0,0,L*.16*(.6+.6*s.fin),D*.14,2.6));c.restore();
  eye(c,L*.33,-D*.1,D*.1,{ring:'#f4f1e6'});
  c.restore();
}

/* ================= LIZARD: thorny devil, gecko, newt ================= */
function drawLizard(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,mv=po.move||0,ph=po.phase||0;
  const L=s.L,D=s.D,h=s.leg*.55+D*.5;
  const sp=[],w=[];const prof=[.08,.2,.34,.52,.86,1,.98,.84,.66,.7,.5];
  for(let i=0;i<11;i++){const u=i/10;const x=lerp(-L*.78,L*.52,u);const wave=Math.sin(ph*TAU+u*5)*D*.1*mv*(u<.45?1.4:.6)+(u<.3?Math.sin(t*1.5+u*4)*D*.12*(.3-u)*3:0);
    sp.push([x,-h+wave+(u<.35?(.35-u)*D*1.1:0)+(u>.85?-(u-.85)*D*.8:0)]);w.push(D*prof[i])}
  const hipI=4,shI=8;const stride=s.leg*.9*mv,lift=s.leg*.3*mv;
  const legs=[{i:hipI,off:.5,far:1,hind:1},{i:shI,off:0,far:1,hind:0},{i:hipI,off:0,far:0,hind:1},{i:shI,off:.5,far:0,hind:0}];
  const drawLeg=g=>{const hxl=sp[g.i][0],hyl=sp[g.i][1]+D*.1;const[dx,dy]=step(ph,g.off,stride,lift);const fx=hxl+dx+(g.hind?-s.leg*.35:s.leg*.5),fy=dy;
    const k=ik(hxl,hyl,fx,fy,s.leg*.62,s.leg*.62,g.hind?-1:1);const tone=g.far?col.shade:col.base;
    fill(c,tone,p=>{seg(p,hxl,hyl,k[0],k[1],s.legW*1.5,s.legW);seg(p,k[0],k[1],fx,fy-s.legW*.3,s.legW,s.legW*.7)});
    c.strokeStyle=tone;c.lineWidth=s.legW*.45;c.lineCap='round';c.beginPath();for(let j=-1;j<=1;j++){c.moveTo(fx,fy-s.legW*.3);c.lineTo(fx+s.legW*1.5,fy-s.legW*(.3+.5*j+.5))}c.stroke()};
  legs.filter(g=>g.far).forEach(drawLeg);
  if(s.spiny){c.fillStyle=col.shade;for(let i=1;i<10;i++){const q=sp[i],r=w[i]*.5;c.beginPath();c.moveTo(q[0]-D*.14,q[1]-r*.8);c.lineTo(q[0]-D*.02,q[1]-r-D*.26);c.lineTo(q[0]+D*.12,q[1]-r*.8);c.closePath();c.fill()}}
  const body=new Path2D();tube(body,sp,w);c.fillStyle=col.base;c.fill(body);
  c.save();c.clip(body);c.fillStyle=col.belly;c.beginPath();const bl=sp.map((q,i)=>[q[0],q[1]+w[i]*.34]);c.moveTo(bl[0][0],bl[0][1]);bl.forEach(q=>c.lineTo(q[0],q[1]));c.lineTo(L,10);c.lineTo(-L,10);c.closePath();c.fill();
  if(s.pattern==='spots'){const R=rng(s.seed||9);c.fillStyle=col.mark;for(let i=0;i<30;i++){const k=1+Math.floor(R()*9),q=sp[k];c.beginPath();c.arc(q[0]+(R()-.5)*L*.12,q[1]-w[k]*.3*R(),D*.07,0,TAU);c.fill()}}
  if(s.pattern==='stripes'){c.strokeStyle=col.mark;c.lineWidth=D*.14;for(let i=1;i<10;i++){const q=sp[i];c.beginPath();c.moveTo(q[0],q[1]-w[i]);c.lineTo(q[0]-D*.1,q[1]+w[i]*.2);c.stroke()}}
  c.restore();
  legs.filter(g=>!g.far).forEach(drawLeg);
  const hq=sp[10],hp=sp[9];
  eye(c,hp[0]+D*.12,hp[1]-D*.16,D*.11,{blink:po.blink,ring:col.eyeRing});
  c.strokeStyle=col.shade;c.lineWidth=D*.035;c.lineCap='round';c.beginPath();c.moveTo(hq[0]+D*.22,hq[1]+D*.04);c.quadraticCurveTo(hq[0],hq[1]+D*.12,hp[0]+D*.05,hp[1]+D*.1);c.stroke();
  if(po.tongue){const tx=hq[0]+D*.25,ty=hq[1]+D*.05;c.strokeStyle='#d6455b';c.lineWidth=D*.04;c.beginPath();c.moveTo(tx,ty);c.lineTo(tx+D*.5,ty+D*.02);c.lineTo(tx+D*.7,ty-D*.1);c.moveTo(tx+D*.5,ty+D*.02);c.lineTo(tx+D*.7,ty+D*.13);c.stroke()}
}

/* ================= INSECT: locust, beetle, ant ================= */
function drawInsect(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,mv=po.move||0,ph=po.phase||0;
  const L=s.L,D=s.D,h=s.leg*.5+D*.5;const bob=mv*Math.sin(ph*TAU*2)*D*.04;
  const thx=L*.12,thy=-h+bob;
  const legs=[];for(let i=0;i<3;i++)for(let far=1;far>=0;far--)legs.push({i,far,off:((i+far)%2)*.5});
  const drawLeg=g=>{const hxl=thx+(1-g.i)*L*.09,hyl=thy+D*.25;const big=g.i===2&&s.jump;const reach=[L*.22,L*.03,-L*.3][g.i]+(g.far?L*.04:0);
    const[dx,dy]=step(ph,g.off,s.leg*.6*mv,s.leg*.3*mv);const fx=hxl+reach+dx,fy=dy;const ll=s.leg*(big?1.05:.66);
    const k=ik(hxl,hyl,fx,fy,ll,ll,g.i===0?-1:1);c.strokeStyle=g.far?col.shade:col.leg;c.lineCap='round';c.lineJoin='round';
    c.lineWidth=s.legW*(big?2.2:1);c.beginPath();c.moveTo(hxl,hyl);c.lineTo(k[0],k[1]);c.stroke();c.lineWidth=s.legW*.8;c.beginPath();c.moveTo(k[0],k[1]);c.lineTo(fx,fy-s.legW*.4);c.lineTo(fx+s.legW*1.6,fy-s.legW*.4);c.stroke()};
  legs.filter(g=>g.far).forEach(drawLeg);
  // abdomen, thorax, head
  const ab=new Path2D();ell(ab,-L*.26,thy+D*.06,L*.36,D*.36,.06);c.fillStyle=col.base;c.fill(ab);
  c.save();c.clip(ab);fill(c,col.belly,p=>ell(p,-L*.26,thy+D*.4,L*.4,D*.26));c.strokeStyle=col.shade;c.lineWidth=D*.035;for(let i=0;i<6;i++){const x=-L*.56+i*L*.1;c.beginPath();c.moveTo(x,thy-D*.4);c.quadraticCurveTo(x+L*.03,thy,x,thy+D*.5);c.stroke()}c.restore();
  fill(c,col.base,p=>ell(p,thx,thy,L*.17,D*.4));fill(c,col.shade,p=>ell(p,thx-L*.02,thy-D*.14,L*.13,D*.22));
  const hx=thx+L*.25,hy=thy-D*.04,hr=D*.34;fill(c,col.base,p=>ell(p,hx,hy,hr,hr*1.05));
  if(s.wings){const fl=po.fly?Math.sin(t*50)*.5:0;c.save();c.translate(thx,thy-D*.3);c.rotate(-.12+(po.fly?-.9+fl:0));c.globalAlpha=.55;fill(c,col.wing,p=>leaf(p,0,0,-L*.78,D*.3,.02));c.globalAlpha=.9;c.strokeStyle=col.shade;c.lineWidth=D*.02;c.beginPath();c.moveTo(0,0);c.lineTo(-L*.72,-D*.02);c.stroke();c.restore();c.globalAlpha=1}
  legs.filter(g=>!g.far).forEach(drawLeg);
  eye(c,hx+hr*.25,hy-hr*.2,hr*.36,{dark:col.dark});
  c.strokeStyle=col.shade;c.lineWidth=D*.035;c.lineCap='round';[0,1].forEach(j=>{const a=Math.sin(t*3+j)*.12;c.beginPath();c.moveTo(hx+hr*.3,hy-hr*.8);c.quadraticCurveTo(hx+hr*(1+j*.5),hy-hr*(2.2+a),hx+hr*(2.4+j*.6),hy-hr*(1.7-j*.5+a));c.stroke()});
}

/* ================= colours and trait mapping (uses Adapt Lab's own trait names) ================= */
const PAL={white:{b:'#f1f0ea',d:'#c9cdd0',l:'#ffffff'},sandy:{b:'#d9ad6c',d:'#b0844a',l:'#f1dcb4'},brown:{b:'#8e5f3c',d:'#6a4429',l:'#c79b74'},
  grey:{b:'#8f9597',d:'#6b7173',l:'#c6cbcc'},green:{b:'#7c9a4c',d:'#5b7636',l:'#b8cd8a'},black:{b:'#3e3f47',d:'#2a2b31',l:'#70727d'},
  blue:{b:'#4f86b8',d:'#356591',l:'#a9cde8'},silver:{b:'#b7c3cd',d:'#8d9aa6',l:'#eef3f6'},orange:{b:'#e48a2f',d:'#b96717',l:'#f9c98a'}};
function colours(t){const P=PAL[t.color]||PAL.brown;const light=t.color==='white'||t.color==='silver';
  return{base:P.b,shade:P.d,belly:P.l,dark:'#2a2422',mark:t.pattern==='stripes'&&light?'#2f2c2c':mix(P.d,'#1a1210',.35),earIn:mix(P.l,'#e9a6a0',.5),cheek:'#eea39b',
    fin:mix(P.d,P.b,.4),wing:mix(P.b,P.d,.55),leg:mix(P.d,'#3a2c20',.5),beak:'#e9a53a',eyeRing:'#f2c230',paw:null}}
/* Extra body plans register here from their own files (plan-frog.js and so on):
   Rig.register('frog',{test:t=>bool, spec:(t,seed,col)=>({...}), draw:(c,spec,pose)=>{}, size:spec=>({len,height})})
   Registered plans are checked before the built-in ones, in the order they were registered. */
const EXTRA=[];
function register(name,def){const i=EXTRA.findIndex(e=>e.name===name);const e={name,...def};if(i>=0)EXTRA[i]=e;else EXTRA.push(e)}
function planOf(t){
  for(const e of EXTRA)if(e.test(t))return e.name;
  if(t.cov==='exo')return'insect';
  if(t.fins==='fins'&&t.legs==='0')return'fish';
  if(t.cov==='feathers'||(t.wings!=='none'&&t.legs==='2'))return'bird';
  if((t.cov==='scales'||t.cov==='skin')&&t.legs!=='0')return'lizard';
  return'quad';
}
function specOf(t,seed){
  const n=k=>(t[k]??50)/100,col=colours(t),plan=planOf(t),fat=t.fatWhere==='all'?n('fat'):0;
  const ex=EXTRA.find(e=>e.name===plan);if(ex)return{plan,seed,pattern:t.pattern,col,...ex.spec(t,seed,col)};
  if(plan==='quad'){const sh=t.shape||'round';const base={round:{L:86,D:58,neck:7,neckUp:.6,lg:[13,34]},long:{L:122,D:42,neck:18,neckUp:.3,lg:[18,50]},tall:{L:104,D:54,neck:50,neckUp:1.0,lg:[44,52]},stream:{L:120,D:44,neck:14,neckUp:.2,lg:[16,40]}}[sh];
    const big=n('size')>.6||sh==='tall';
    return{plan,seed,col,pattern:t.pattern,L:base.L,D:base.D*(1+.3*fat+.12*n('insul')),leg:base.lg[0]+base.lg[1]*n('legLen'),legW:lerp(8.5,10.5,n('size')),neck:base.neck*(sh==='tall'?.8+.6*n('legLen'):1),neckUp:base.neckUp,
      head:sh==='tall'?16.5:lerp(25,18,n('size')),snout:sh==='tall'?.75:t.diet==='meat'?.6:t.diet==='both'?.45:.25,ear:7+44*n('ears'),earW:n('ears')>.6?9:8,earLop:0,
      tail:14+70*n('tail'),tailType:n('tail')<.15?'stub':(sh==='long'&&n('insul')>.5?'bushy':sh==='tall'?'tuft':'thin'),
      fluff:n('insul'),fat,hump:t.fatWhere==='hump'?n('fat'):0,feet:big?'hoof':'paw',mane:sh==='tall'&&t.pattern==='stripes',cheek:!big}}
  if(plan==='bird'){const tall=t.shape==='tall';const owl=n('eyes')>.8&&!tall;
    const bare='#d9b6a4';return{plan,seed,col:tall?{...col,head:bare,neck:bare,leg:'#cfa893',beak:'#e3b98a'}:{...col,head:col.base,neck:col.base},pattern:t.pattern,B:tall?100:78,tilt:tall?.06:owl?.75:.42,leg:tall?46+60*n('legLen'):12+34*n('legLen'),legW:tall?5.5:3.2,thigh:tall,thinNeck:tall,
      neck:tall?66:owl?4:12,neckUp:tall?1.2:.9,head:owl?24:tall?12.5:17,beak:owl?7:t.diet==='meat'?13:10,beakType:t.diet==='meat'?'hook':'cone',bigEye:owl,face:owl,
      wing:40+70*n('wingSize'),tail:6+22*n('tail'),canFly:t.wings==='fly'}}
  if(plan==='fish')return{plan,seed,col,pattern:t.pattern,L:120,D:34+16*n('size')+10*fat,tailFin:.7+.5*n('finSize'),fin:n('finSize')};
  if(plan==='lizard')return{plan,seed,col,pattern:t.pattern,L:96,D:t.cov==='skin'?30:24,leg:12+18*n('legLen'),legW:4.6,spiny:t.defence==='spines',tongue:t.senses==='tongue'};
  return{plan,seed,col:{...col,dark:'#241f1c'},pattern:t.pattern,L:92,D:30,leg:16+24*n('legLen'),legW:3.2,jump:n('legLen')>.6,wings:t.wings!=='none'};
}
function draw(c,s,po){const ex=EXTRA.find(e=>e.name===s.plan);if(ex)return ex.draw(c,s,po||{});({quad:drawQuad,bird:drawBird,fish:drawFish,lizard:drawLizard,insect:drawInsect})[s.plan](c,s,po)}
// a young animal of the same species: smaller body, bigger head, shorter legs. The caller also draws it at about 0.55 scale.
function youngOf(s){const ex=EXTRA.find(e=>e.name===s.plan);if(ex&&ex.young)return ex.young(s);const y={...s,young:true};
  if(s.plan==='quad')Object.assign(y,{L:s.L*.82,D:s.D*.9,leg:s.leg*.72,neck:s.neck*.7,head:s.head*1.22,snout:s.snout*.6,ear:s.ear*.85,tail:s.tail*.7,cheek:true,hump:(s.hump||0)*.4,mane:false});
  if(s.plan==='bird')Object.assign(y,{leg:s.leg*.7,neck:s.neck*.6,head:s.head*1.25,wing:s.wing*.6,tail:s.tail*.5,beak:s.beak*.7,canFly:false});
  return y}
// rough size in local units, for fitting an animal into a box: {len, height}
function sizeOf(s){const ex=EXTRA.find(e=>e.name===s.plan);if(ex&&ex.size)return ex.size(s);
  if(s.plan==='quad')return{len:s.L*1.25,height:s.leg+s.D+Math.max(0,Math.sin(s.neckUp)*s.neck)+s.head+s.ear*.6};
  if(s.plan==='bird')return{len:s.B*1.5,height:s.leg+s.B*.8+s.neck+s.head};
  if(s.plan==='fish')return{len:s.L,height:s.D*2,swims:true};
  if(s.plan==='lizard')return{len:150,height:s.leg+s.D*1.6};
  return{len:s.L*1.2,height:s.leg+s.D*2.4}}
/* ---------- the zoo: real animals as Adapt Lab trait sets (copied from the sim's PRESETS and PRED_BANK) ---------- */
const DEF={cov:'fur',blood:'warm',breathe:'lungs',shape:'round',legs:'4',wings:'none',fins:'none',color:'brown',pattern:'plain',diet:'plants',defence:'none',fatWhere:'none',
  activity:'day',season:'active',social:'solo',escape:'flee',store:'none',care:'some',posture:'upright',senses:'sight',size:35,insul:40,fat:30,ears:45,legLen:45,tail:30,wingSize:55,finSize:50,eyes:40,waterSave:25,salt:5};
const A=o=>({...DEF,...o});
// trait sets copied from Adapt Lab's PRESETS, so this proves the rig works from the sim's real data
const zoo={
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
// soft ground shadow, drawn before the animal
function shadow(c,w,alpha){c.save();c.scale(1,.2);const g=c.createRadialGradient(0,0,0,0,0,w);g.addColorStop(0,`rgba(30,25,40,${alpha||.28})`);g.addColorStop(1,'rgba(30,25,40,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,w,0,TAU);c.fill();c.restore()}

root.Rig={draw,specOf,planOf,sizeOf,youngOf,register,colours,shadow,PAL,DEF,A,zoo,smooth,tube,seg,ik,step,ell,leaf,fill,eye,pattern,area,rng,mix,hex,lerp,clamp,TAU};
})(typeof window!=='undefined'?window:globalThis);
