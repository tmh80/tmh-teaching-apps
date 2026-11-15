/* Adapt Lab art prototype: the predator cast.
   Every predator in the sim's PRED_BANK and INVADERS (Adapt-Lab.html lines 1020-1056) can be drawn:
     const spec = Rig.predSpec(entry);   // entry = {id, name, kind, col, size, ...}
     Rig.draw(ctx, spec, pose);          // draw at about spec.sizeK times the scale of a medium animal
   Each `kind` gets a trait set, goes through Rig.specOf like any other animal, and is then tinted with the entry's colour.
   Two predators need shapes the shared rigs do not have, so they are registered here as their own plans:
   'shark' (tall dorsal fin, long upper tail lobe, underslung mouth) and 'lion' (a four-legged rig with a mane). */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,fill,ell,tube,leaf,mix}=R,A=R.A;
R.PRED_BANK={
 tundra:[
  {id:'afox',name:'Arctic fox',kind:'canid',col:'#8e959c',mode:'chase',sense:'smell',act:'both',size:35,prey:[0,30],w:.7},
  {id:'owl',name:'Snowy owl',kind:'owl',col:'#cfd3d6',mode:'air',sense:'sight',act:'both',size:42,prey:[0,35],w:.8},
  {id:'wolf',name:'Wolf pack',kind:'wolf',col:'#55595e',mode:'chase',sense:'smell',act:'both',size:70,pack:true,prey:[40,100],w:.5}],
 desert:[
  {id:'hawk',name:'Red-tailed hawk',kind:'raptor',col:'#7a4a2a',mode:'air',sense:'sight',act:'day',size:30,prey:[0,25],w:.6},
  {id:'coyote',name:'Coyote',kind:'canid',col:'#a07a4f',mode:'chase',sense:'smell',act:'night',size:45,prey:[5,45],w:.5},
  {id:'puma',name:'Puma',kind:'cat',col:'#b0895a',mode:'ambush',sense:'sight',act:'crep',size:65,prey:[25,85],w:.4},
  {id:'rattler',name:'Rattlesnake',kind:'snake',col:'#9a7f52',mode:'ambush',sense:'heat',act:'night',size:25,prey:[0,10],w:.7}],
 forest:[
  {id:'goshawk',name:'Goshawk',kind:'raptor',col:'#5a5a62',mode:'air',sense:'sight',act:'day',size:30,prey:[0,28],w:.6},
  {id:'towl',name:'Tawny owl',kind:'owl',col:'#8a6440',mode:'air',sense:'sight',act:'night',size:25,prey:[0,18],w:.7},
  {id:'rfox',name:'Red fox',kind:'canid',col:'#c0602a',mode:'chase',sense:'smell',act:'both',size:40,prey:[0,30],w:.5},
  {id:'fwolf',name:'Wolf pack',kind:'wolf',col:'#5d5a55',mode:'chase',sense:'smell',act:'both',size:70,pack:true,prey:[45,100],w:.4},
  {id:'lynx',name:'Lynx',kind:'cat',col:'#a88a62',mode:'ambush',sense:'sight',act:'crep',size:55,prey:[15,50],w:.6}],
 grassland:[
  {id:'eagle',name:'Martial eagle',kind:'raptor',col:'#4a3a30',mode:'air',sense:'sight',act:'day',size:40,prey:[0,35],w:.5},
  {id:'cheetah',name:'Cheetah',kind:'cat',col:'#d0a64a',mode:'chase',sense:'sight',act:'day',size:60,prey:[15,60],w:.6},
  {id:'lion',name:'Lion pride',kind:'lion',col:'#b88a48',mode:'ambush',sense:'sight',act:'night',size:85,pack:true,prey:[35,100],w:.5},
  {id:'hyena',name:'Hyena clan',kind:'canid',col:'#8a7a5a',mode:'chase',sense:'smell',act:'night',size:60,pack:true,prey:[15,85],w:.5}],
 ocean:[
  {id:'shark',name:'Shark',kind:'shark',col:'#5d6f7d',mode:'water',sense:'smell',act:'both',size:90,prey:[15,100],w:.5},
  {id:'seal',name:'Seal',kind:'seal',col:'#4c535a',mode:'chase',sense:'sight',act:'day',size:70,prey:[3,40],w:.6},
  {id:'gannet',name:'Gannet',kind:'seabird',col:'#f2f2ee',mode:'air',sense:'sight',act:'day',size:35,prey:[0,20],w:.7}],
 freshwater:[
  {id:'pike',name:'Pike',kind:'bigfish',col:'#5f7a48',mode:'ambush',sense:'sight',act:'day',size:40,prey:[0,30],w:.6},
  {id:'heron',name:'Grey heron',kind:'heron',col:'#8c939a',mode:'ambush',sense:'sight',act:'day',size:45,prey:[0,25],w:.6},
  {id:'otter',name:'Otter',kind:'seal',col:'#5a4532',mode:'chase',sense:'smell',act:'night',size:45,prey:[3,35],w:.5}]
};
R.INVADERS={
 tundra:{id:'rfoxN',name:'Red fox (moving north)',kind:'canid',col:'#c0602a',mode:'chase',sense:'smell',act:'both',size:40,prey:[0,30],w:.4,inv:true},
 desert:{id:'cat',name:'Feral cat',kind:'cat',col:'#6b6b6b',mode:'ambush',sense:'sight',act:'night',size:30,prey:[0,20],w:.6,inv:true},
 forest:{id:'cat',name:'Feral cat',kind:'cat',col:'#6b6b6b',mode:'ambush',sense:'sight',act:'night',size:30,prey:[0,20],w:.6,inv:true},
 grassland:{id:'dogs',name:'Feral dog pack',kind:'wolf',col:'#6a5a48',mode:'chase',sense:'smell',act:'both',size:50,pack:true,prey:[10,70],w:.5,inv:true},
 ocean:{id:'lionfish',name:'Lionfish',kind:'bigfish',col:'#b0503a',mode:'ambush',sense:'sight',act:'both',size:20,prey:[0,15],w:.6,inv:true},
 freshwater:{id:'snakehead',name:'Snakehead fish',kind:'bigfish',col:'#4a5a3a',mode:'ambush',sense:'sight',act:'both',size:45,prey:[0,35],w:.6,inv:true}};

/* ---------- shark ---------- */
function drawShark(c,s,po){
  po=po||{};const col=s.col,t=po.t||0,ph=po.phase!=null?po.phase:t*.8;const L=s.L,D=s.D,wag=Math.sin(ph*TAU);
  c.save();c.rotate(wag*.025);
  const prof=[.1,.2,.38,.62,.84,.98,1,.9,.68,.36],sp=[],w=[];
  for(let i=0;i<10;i++){const u=i/9;sp.push([lerp(-L*.42,L*.5,u),Math.sin(ph*TAU-u*2.4)*D*.09*(1-u)*(1-u)-(u>.8?(u-.8)*D*.35:0)]);w.push(D*prof[i])}
  const tx=sp[0][0],ty=sp[0][1];
  c.save();c.translate(tx+L*.03,ty);c.rotate(wag*.28);c.scale(.74+.26*Math.cos(ph*TAU),1); // tail: long upper lobe
  fill(c,col.fin,p=>{p.moveTo(L*.02,-D*.06);p.quadraticCurveTo(-L*.08,-D*.4,-L*.2,-D*.98);p.quadraticCurveTo(-L*.13,-D*.2,-L*.1,0);p.quadraticCurveTo(-L*.12,D*.2,-L*.15,D*.5);p.quadraticCurveTo(-L*.05,D*.26,L*.02,D*.06);p.closePath()});c.restore();
  // fins behind the body: far pectoral, pelvic, second dorsal
  fill(c,col.shade,p=>leaf(p,L*.14,D*.3,L*.2,D*.2,1.9));
  fill(c,col.fin,p=>{p.moveTo(-L*.2,-D*.2);p.lineTo(-L*.29,-D*.5);p.lineTo(-L*.3,-D*.14);p.closePath();p.moveTo(-L*.14,D*.24);p.lineTo(-L*.24,D*.5);p.lineTo(-L*.25,D*.18);p.closePath()});
  // tall first dorsal fin
  fill(c,col.fin,p=>{p.moveTo(L*.12,-D*.42);p.quadraticCurveTo(L*.04,-D*.9,-L*.06,-D*1.22);p.quadraticCurveTo(-L*.045,-D*.72,-L*.1,-D*.4);p.closePath()});
  const body=new Path2D();tube(body,sp,w);c.fillStyle=col.base;c.fill(body);
  c.save();c.clip(body);fill(c,col.belly,p=>tube(p,sp.map((q,i)=>[q[0],q[1]+w[i]*.72]),w));c.restore();
  // gill slits, mouth, eye
  c.strokeStyle=col.shade;c.lineWidth=L*.009;c.lineCap='round';for(let i=0;i<4;i++){const x=L*(.2+.028*i);c.beginPath();c.moveTo(x,-D*.2);c.quadraticCurveTo(x-L*.012,0,x,D*.16);c.stroke()}
  const nose=sp[9];c.strokeStyle=col.dark;c.lineWidth=L*.011;c.beginPath();c.moveTo(nose[0]-L*.015,nose[1]+D*.2);c.quadraticCurveTo(nose[0]-L*.06,nose[1]+D*.42,nose[0]-L*.15,nose[1]+D*.4);c.stroke();
  fill(c,'#ffffff',p=>{for(let i=0;i<4;i++){const x=nose[0]-L*(.045+.025*i),y=nose[1]+D*(.33+.025*i);p.moveTo(x,y);p.lineTo(x-L*.012,y+D*.11);p.lineTo(x-L*.022,y+D*.015);p.closePath()}});
  fill(c,col.dark,p=>ell(p,nose[0]-L*.09,nose[1]-D*.02,D*.07,D*.07));
  // near pectoral fin
  c.save();c.translate(L*.16,D*.3);c.rotate(Math.sin(t*1.5)*.08);fill(c,col.fin,p=>{p.moveTo(L*.03,-D*.04);p.quadraticCurveTo(-L*.06,D*.3,-L*.2,D*.62);p.quadraticCurveTo(-L*.1,D*.14,-L*.08,-D*.02);p.closePath()});c.restore();
  c.restore();
}
R.register('shark',{test:()=>false,spec:()=>({}),draw:drawShark,size:s=>({len:s.L*1.12,height:s.D*3,swims:true,dx:-s.L*.04})});

/* ---------- lion: the four-legged rig plus a mane ---------- */
function drawLion(c,s,po){
  po=po||{};const q=s.quad,t=po.t||0,mv=po.move||0,ph=po.phase||0,hd=po.headDown||0,L=q.L,D=q.D;
  // head position: the same sums as drawQuad in rig.js
  const bob=mv*Math.sin(ph*TAU*2)*D*.035+(1-mv)*Math.sin(t*1.7+(q.seed||0))*D*.012;
  const top=-(q.leg+D)+bob,wx=L*.36,wy=top+D*.3,Aa=lerp(q.neckUp,-.75,hd);
  const hx=wx+Math.cos(Aa)*q.neck+L*.1,hy=wy-Math.sin(Aa)*q.neck-D*.04+(1-mv)*Math.sin(t*1.7)*.6,hr=q.head;
  const mane=s.maneCol,dark=mix(mane,'#1a120c',.3);
  if(s.mane){fill(c,dark,p=>{ell(p,hx-hr*.3,hy-hr*.05,hr*1.5,hr*1.5);ell(p,hx-hr*1.1,hy+hr*.8,hr*1.25,hr*1.25)})}
  R.draw(c,q,po);
  if(s.mane){fill(c,mane,p=>{ell(p,hx-hr*1.3,hy+hr*.05,hr*.86,hr*.95);ell(p,hx-hr*1.5,hy+hr*.95,hr*.95,hr*1.0);ell(p,hx-hr*.85,hy+hr*1.3,hr*.8,hr*.8);ell(p,hx-hr*.9,hy-hr*.75,hr*.62,hr*.55)});
    fill(c,dark,p=>ell(p,hx-hr*1.75,hy+hr*1.6,hr*.6,hr*.6));
    fill(c,q.col.base,p=>ell(p,hx-hr*.42,hy-hr*.98,hr*.3,hr*.27));fill(c,q.col.earIn,p=>ell(p,hx-hr*.4,hy-hr*.96,hr*.16,hr*.14))}
}
R.register('lion',{test:()=>false,spec:()=>({}),draw:drawLion,size:s=>{const z=R.sizeOf(s.quad);return{len:z.len,height:z.height+s.quad.head*.6}},
  young:s=>({...s,mane:false,young:true,quad:R.youngOf(s.quad)})});

/* ---------- trait set for each kind ---------- */
const HUNTER={diet:'meat',care:'lots',escape:'flee',senses:'smell'};
function traitsFor(j){const size=j.size,id=j.id;
  switch(j.kind){
    case'canid':return A({...HUNTER,shape:'long',color:'grey',insul:id==='afox'?90:60,ears:id==='hyena'?22:id==='afox'?18:34,size,legLen:id==='hyena'?62:50,tail:id==='hyena'?35:72,pattern:id==='hyena'?'spots':'plain'});
    case'wolf':return A({...HUNTER,shape:'long',color:'grey',insul:60,ears:28,size,legLen:72,tail:62,social:'herd'});
    case'cat':return A({...HUNTER,senses:'sight',shape:'long',color:'sandy',insul:id==='lynx'?70:15,ears:id==='lynx'?34:15,size,legLen:id==='cheetah'?88:id==='cat'?45:62,tail:id==='lynx'?8:82,pattern:id==='cheetah'||id==='lynx'?'spots':'plain'});
    case'lion':return A({...HUNTER,senses:'sight',shape:'long',color:'sandy',insul:10,ears:12,size,legLen:58,tail:70,social:'herd'});
    case'owl':return A({...HUNTER,senses:'sight',cov:'feathers',legs:'2',legLen:20,wings:'fly',wingSize:85,color:'white',pattern:'spots',insul:90,size,tail:35,eyes:92,activity:'night'});
    case'raptor':return A({...HUNTER,senses:'sight',cov:'feathers',legs:'2',legLen:32,wings:'fly',wingSize:id==='eagle'?95:80,color:'brown',insul:40,size,tail:50,eyes:65});
    case'seabird':return A({...HUNTER,senses:'sight',cov:'feathers',legs:'2',legLen:22,wings:'fly',wingSize:95,color:'white',insul:60,size,tail:42,eyes:55,salt:90});
    case'heron':return A({...HUNTER,senses:'sight',cov:'feathers',shape:'tall',legs:'2',legLen:70,wings:'fly',wingSize:80,color:'grey',insul:35,size,tail:25,eyes:55});
    case'snake':return A({...HUNTER,senses:'tongue',cov:'scales',blood:'cold',shape:'long',legs:'0',color:'sandy',pattern:'spots',defence:'poison',size,tail:40,care:'none',escape:'freeze'});
    case'bigfish':return A({...HUNTER,senses:'sight',cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',finSize:id==='lionfish'?95:50,color:'green',pattern:id==='lionfish'?'stripes':'spots',size,care:'none'});
    case'seal':return id==='otter'?{...R.zoo['Otter']}:{...R.zoo['Harbour seal']};
    default:return A({...HUNTER,shape:'long',color:'grey',size});
  }
}
function tint(col,hexc){const dk='#1b1512';const light=R.hex(hexc).reduce((a,b)=>a+b,0)>600;
  return{...col,base:hexc,shade:mix(hexc,dk,light?.2:.3),belly:mix(hexc,'#ffffff',.55),mark:mix(hexc,'#1a1210',.6),earIn:mix(mix(hexc,'#ffffff',.5),'#e9a6a0',.45),
    fin:mix(hexc,dk,.2),wing:mix(hexc,dk,light?.14:.24),head:hexc,neck:hexc,paw:null}}
const cache={};
function predSpec(j,seed){
  const key=j.id+'|'+j.col+'|'+(seed||0);if(cache[key])return cache[key];
  let s;
  if(j.kind==='shark'){const col=tint(R.colours({color:'grey'}),j.col);s={plan:'shark',seed,L:150,D:36,col:{...col,belly:'#f1f4f5',dark:'#1d2226'}}}
  else{s=R.specOf(traitsFor(j),seed||7);s={...s,col:tint(s.col,j.col)};
    if(s.plan==='quad'){s.cheek=false;
      if(j.kind==='cat'||j.kind==='lion'){s.snout=.3;s.earW=10;s.head*=1.04;s.neckUp=.22;if(j.id==='lynx')s.tailType='stub'}
      if(j.kind==='canid'||j.kind==='wolf'){s.snout=.7;s.earW=9;s.neckUp=.26}
      if(j.id==='hyena'){s.neckUp=.42;s.tailType='tuft'}
      if(j.kind==='lion'){s.tailType='tuft';s.col.belly=mix(j.col,'#ffffff',.4);s={plan:'lion',seed,col:s.col,quad:s,mane:true,maneCol:mix(j.col,'#4a2a12',.62)}}}
    if(s.plan==='bird'){
      if(j.kind==='owl'){s.col.belly=mix(j.col,'#ffffff',.7);s.col.eyeRing='#f2c230'}
      if(j.kind==='raptor'){s.beak=14;s.beakType='hook';s.col.belly=mix(j.col,'#f1dcb4',.55);s.col.beak='#e9b23a'}
      if(j.kind==='seabird'){s.beak=20;s.beakType='cone';s.head*=.95;s.neck=16;s.tilt=.3;s.col.beak='#9fb3c4';s.col.head='#f3dfa6';s.col.wing='#d8dcde';s.col.shade='#3a3d42';s.col.leg='#4a4d52'}
      if(j.kind==='heron'){Object.assign(s,{B:72,tilt:.3,leg:74,legW:3.4,thigh:false,thinNeck:true,neck:50,neckUp:1.05,head:11.5,beak:30,beakType:'cone',canFly:true,tail:10});
        s.col.head='#eef0f1';s.col.neck=mix(j.col,'#ffffff',.5);s.col.leg='#b9a45c';s.col.beak='#e2b23a';s.col.wing=mix(j.col,'#1b1512',.3)}}
    if(s.plan==='fish'){if(j.id==='pike'||j.id==='snakehead'){s.L=132;s.D=27;s.fin=.4;s.tailFin=.85}if(j.id==='lionfish'){s.D=44;s.fin=1;s.tailFin=1.1;s.col.mark='#f6efe6'}s.col.belly=mix(j.col,'#fff6e0',.6)}
    if(s.plan==='snake'){s.col.belly=mix(j.col,'#fff3d2',.6);s.col.eyeRing='#e6b93a'}
    if(s.plan==='seal'){s.col.belly=mix(j.col,'#ffffff',.45)}
  }
  s.pred=true;s.sizeK=lerp(.5,1.45,clamp(j.size/100,0,1));s.pack=!!j.pack;s.kind=j.kind;s.name=j.name;
  return cache[key]=s;
}
R.predSpec=predSpec;R.predTraits=traitsFor;
})();
