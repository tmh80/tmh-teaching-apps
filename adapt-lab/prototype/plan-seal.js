/* Adapt Lab art prototype: SEA MAMMAL body plan (seal, sea lion, otter).
   Chosen when: fur and fins or flippers.
   Silhouette notes: one smooth torpedo with no neck, round head with a short whiskered muzzle and big dark eyes,
   paddle fore flipper low on the chest, two hind flippers fanned at the tail. Thick with blubber when fat is high.
   Otters (long tail trait) are thinner, with a thick tapering tail and small paws.
   Two poses. Swimming (default): origin at the body centre, body undulates, flippers paddle.
   Hauled out (pose.land = true): belly on y = 0, chest and head raised. */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,fill,ell,tube,leaf,mix}=R;
const sst=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const PROF=[.2,.34,.52,.72,.9,1,1,.94,.82,.68,.58];
function drawSeal(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,ph=po.phase!=null?po.phase:t*.8,land=!!po.land,mv=po.move==null?1:po.move;
  const L=s.L,D=s.D,n=PROF.length,sp=[],w=[];
  for(let i=0;i<n;i++){const u=i/(n-1),ww=D*PROF[i]*(i<3?s.rear:1);w.push(ww);const x=lerp(-L*.46,L*.36,u);
    if(land){const hump=mv*Math.max(0,Math.sin(ph*TAU))*D*.22*Math.sin(u*Math.PI);
      sp.push([x-sst((u-.5)/.5)*D*.35,-ww/2-D*.95*sst((u-.42)/.55)-hump-(u<.12?(.12-u)/.12*D*.28:0)])}
    else sp.push([x,Math.sin(ph*TAU-u*2.6)*D*.13*(1-u)*(1-u)*(.4+.6*mv)+Math.sin(ph*TAU-1)*D*.03])}
  const head=sp[n-1],hr=D*.36*s.headK,ha=land?-.1:.08;
  const hx=head[0]+hr*.55,hy=head[1]-(land?hr*.25:hr*.05)+(land?Math.sin(t*1.2+(s.seed||0))*D*.03:0);
  const mz=hr*(.62+.25*s.snout),mx=hx+Math.cos(ha)*hr*.78,my=hy+Math.sin(ha)*hr*.78+hr*.16;
  const tail=sp[0],td=[sp[0][0]-sp[1][0],sp[0][1]-sp[1][1]],ta=Math.atan2(td[1],td[0]);
  const flap=Math.sin(ph*TAU*(land?0:1))*(land?0:1);
  // far flippers (shade)
  const fl=L*.2*(.65+.6*s.fin),sx=sp[6][0],sy=sp[6][1]+w[6]*.3;
  const foreA=land?1.15:2.1+Math.sin(ph*TAU+1.2)*.5*mv;
  fill(c,col.shade,p=>leaf(p,sx+L*.05,sy-D*.02,fl*.9,fl*.26,land?.95:foreA+.5));
  if(s.otter){ // thick tapering tail, then small hind paws
    const tp=[];for(let i=0;i<=5;i++){const u=i/5;tp.push([tail[0]+Math.cos(ta)*s.tail*u,tail[1]+Math.sin(ta)*s.tail*u+Math.sin(ph*TAU-2.2-u*1.6)*D*.22*u*(land?0:1)+(land?D*.1*u:0)])}
    fill(c,col.base,p=>tube(p,tp,[w[0]*.95,w[0]*.82,w[0]*.66,w[0]*.5,w[0]*.34,w[0]*.16]));
    fill(c,col.shade,p=>leaf(p,sp[1][0],sp[1][1]+w[1]*.35,fl*.6,fl*.2,land?1.3:2.5+flap*.3));
  }else{
    fill(c,col.shade,p=>leaf(p,tail[0]+Math.cos(ta)*D*.02,tail[1],fl*1.05,fl*.3,ta-.42-flap*.22));
  }
  // body and head
  const body=new Path2D();tube(body,sp,w);ell(body,hx,hy,hr,hr*.95);ell(body,mx,my,mz,mz*.74,ha);
  if(s.fat>.5&&!s.otter)ell(body,sp[7][0],sp[7][1]+w[7]*.08,D*.3,D*.46);
  c.fillStyle=col.base;c.fill(body);
  c.save();c.clip(body);
  fill(c,col.belly,p=>{tube(p,sp.map((q,i)=>[q[0],q[1]+w[i]*.62]),w);ell(p,mx-mz*.1,my+mz*.55,mz*1.5,mz*.7,ha)});
  if(s.pattern==='counter')fill(c,col.shade,p=>tube(p,sp.map((q,i)=>[q[0],q[1]-w[i]*.66]),w));
  c.restore();
  R.pattern(c,body,s,[sp[0][0],Math.min(sp[5][1],head[1])-D*.6,hx-hr*.2,Math.max(sp[5][1],sp[2][1])+D*.25],s.seed);
  // near flippers
  if(!s.otter)fill(c,col.fin,p=>leaf(p,tail[0]+Math.cos(ta)*D*.02,tail[1]+D*.02,fl*1.1,fl*.32,ta+.36+flap*.22));
  else fill(c,col.fin,p=>leaf(p,sp[1][0]+L*.02,sp[1][1]+w[1]*.38,fl*.62,fl*.2,land?1.2:2.7-flap*.3));
  fill(c,col.fin,p=>leaf(p,sx,sy,fl,fl*.3,foreA));
  // face
  if(s.ear>.12)fill(c,col.shade,p=>ell(p,hx-hr*.5,hy-hr*.62,hr*.2,hr*.17));
  R.eye(c,hx+hr*.3,hy-hr*.2,hr*.22,{blink:po.blink,dark:col.dark});
  const nx=mx+Math.cos(ha)*mz*.8,ny=my+Math.sin(ha)*mz*.8-mz*.28;
  fill(c,col.dark,p=>ell(p,nx,ny,hr*.15,hr*.11,ha));
  c.strokeStyle=mix(col.belly,'#ffffff',.6);c.lineWidth=hr*.045;c.lineCap='round';c.globalAlpha=.9;
  for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(mx+mz*.25,my+mz*.12);c.quadraticCurveTo(mx+mz*.9,my+mz*(.3+.28*i),mx+mz*1.55,my+mz*(.38+.5*i)+Math.sin(t*2+i)*hr*.03);c.stroke()}
  c.globalAlpha=1;
  c.strokeStyle=col.shade;c.lineWidth=hr*.06;c.beginPath();c.moveTo(nx-hr*.02,ny+hr*.12);c.quadraticCurveTo(mx+mz*.2,my+mz*.5,mx-mz*.3,my+mz*.38);c.stroke();
}
R.register('seal',{
  test:t=>t.cov==='fur'&&t.fins==='fins',
  spec:(t,seed,col)=>{const n=k=>(t[k]??50)/100;const fat=t.fatWhere==='all'?n('fat'):0;const otter=n('tail')>.3;
    return{L:otter?138:128,D:(otter?27:36)*(1+.34*fat+.08*n('insul')),rear:otter?1:.92,fat,fin:n('finSize'),otter,tail:otter?30+50*n('tail'):0,
      headK:otter?1.12:.92,snout:t.diet==='plants'?.2:.5,ear:n('ears'),cheek:false}},
  draw:drawSeal,
  size:s=>({len:(s.L+s.tail*.8)*1.02,height:s.D*2.5,swims:true,dx:s.otter?s.tail*.3:0}),
  young:s=>({...s,young:true,L:s.L*.84,headK:s.headK*1.22,snout:s.snout*.6,tail:s.tail*.8})
});
R.zoo['Harbour seal']=R.A({care:'lots',shape:'stream',legs:'0',fins:'fins',finSize:70,color:'grey',pattern:'spots',insul:40,fatWhere:'all',fat:90,ears:5,size:70,tail:10,diet:'meat',social:'herd',eyes:85,salt:90});
R.zoo['Otter']=R.A({care:'lots',shape:'long',legs:'4',fins:'fins',finSize:35,color:'brown',insul:80,fatWhere:'none',ears:20,size:40,tail:80,diet:'meat',eyes:55,salt:10});
})();
