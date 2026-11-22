/* Adapt Lab art prototype: plants. Same flat three-tone style as rig.js, and it uses rig.js's helpers.
   Local units: the plant stands on y = 0 (the ground line) and grows up (negative y). Roots are drawn BELOW y = 0 when pose.roots is true.
   window.Plants = { draw(c, spec, pose), specOf(traits, seed), sizeOf(spec), zoo, DEF }
   pose: { t, roots, harsh (the harsh season is on), turning (the season before it), waterY (y of the water surface for water plants) }
   Plant traits are Adapt Lab's own (P_SECTIONS / DEF_P in Adapt-Lab.html). */
(function(){
"use strict";
const R=window.Rig,{smooth,tube,leaf,fill,ell,rng,mix,lerp,clamp,TAU}=R;
const DEF={water:'land',form:'shrub',leaf:'broad',store:'none',defence:'none',season:'evergreen',pores:'day',seeds:'wind',seedSize:'small',height:45,leafSize:50,wax:10,rootDepth:20,rootSpread:20,stemStore:70,salt:5};
const P=o=>({...DEF,...o});
// the eight plant presets, copied from Adapt Lab's PRESETS
const zoo={
 'Arctic willow':{home:'tundra',t:P({form:'shrub',leaf:'broad',leafSize:15,height:8,rootDepth:20,rootSpread:90,defence:'bitter',season:'deciduous'})},
 'Saguaro cactus':{home:'desert',t:P({form:'succulent',leaf:'spines',wax:90,rootDepth:20,rootSpread:95,store:'water',stemStore:90,height:90,defence:'thorns',pores:'night',seeds:'animals'})},
 'English oak':{home:'forest',t:P({seedSize:'large',form:'tree',leaf:'broad',leafSize:60,height:92,rootDepth:90,rootSpread:40,defence:'bitter',season:'deciduous',seeds:'animals'})},
 'Bluebell':{home:'forest',t:P({form:'herb',leaf:'ribbon',height:12,rootDepth:20,rootSpread:20,store:'bulb',defence:'bitter',season:'dormant'})},
 'Umbrella acacia':{home:'grassland',t:P({seedSize:'large',form:'tree',leaf:'broad',leafSize:12,wax:70,height:88,rootDepth:95,rootSpread:40,defence:'thorns',season:'deciduous',seeds:'animals'})},
 'Red oat grass':{home:'grassland',t:P({form:'herb',leaf:'ribbon',height:45,rootDepth:35,rootSpread:85,season:'dormant'})},
 'Eelgrass':{home:'ocean',t:P({water:'aquatic',form:'herb',leaf:'ribbon',height:55,rootDepth:25,rootSpread:85,salt:95,seeds:'water'})},
 'Water lily':{home:'freshwater',t:P({seedSize:'large',water:'aquatic',form:'herb',leaf:'broad',leafSize:85,height:70,rootDepth:40,rootSpread:50,store:'bulb',season:'dormant',seeds:'water',salt:5})}
};
function specOf(t,seed){
  const n=k=>(t[k]??50)/100,aq=t.water==='aquatic';
  const H={herb:14+55*n('height'),shrub:18+80*n('height'),tree:55+125*n('height'),succulent:20+120*n('height')}[t.form]*(aq?1.5:1);
  let g=t.form==='succulent'?'#6fa56c':{broad:'#5f9f49',needles:'#3f7f57',ribbon:'#80b04d',spines:'#74a268'}[t.leaf];
  if(t.defence==='bitter')g=mix(g,'#2c4c38',.28);
  g=mix(g,'#a8cdb8',.3*n('wax'));
  return{seed:seed||1,t,form:t.form,leafType:t.leaf,aq,H,ls:n('leafSize'),wax:n('wax'),rd:n('rootDepth'),rs:n('rootSpread'),store:t.store,stemStore:n('stemStore'),
    thorns:t.defence==='thorns',season:t.season,seeds:t.seeds,bigSeeds:t.seedSize==='large',
    col:{leaf:g,leafD:mix(g,'#1c3626',.34),leafL:mix(g,'#eef5c8',.4),wood:'#8d6846',woodD:'#6b4d34',root:'#d2ad80',dark:'#3a2c22',
      autumn:'#dd8f2e',autumnD:'#b7671e',autumnL:'#f3bb58',dead:'#bca676',deadD:'#9c8558',deadL:'#d6c495',bulb:'#f0e1b4',bulbD:'#d3bd85',berry:'#cf4638',fluff:'#fbfbf4',flower:'#6f7fd8',flowerL:'#f4f0fa'}};
}
const rootK=s=>({herb:.8,shrub:1,tree:1.35,succulent:1.1}[s.form]);
function sizeOf(s){const wide={herb:.9,shrub:1.5,tree:.95,succulent:.6}[s.form],k=rootK(s);
  return{h:s.H*1.12,w:Math.max(s.H*wide,(14+70*s.rs)*2*k,40),rootDepth:Math.max(s.store==='bulb'?26:0,(12+75*s.rd)*k),rootW:(14+70*s.rs)*2*k,water:s.aq}}
// which leaves to show: 1 full, 0 bare stems, -1 died back to the ground
function leafState(s,po){
  if(po.harsh){if(s.season==='deciduous')return{amt:0,b:s.col.leaf,d:s.col.leafD,l:s.col.leafL};if(s.season==='dormant')return{amt:-1,b:s.col.dead,d:s.col.deadD,l:s.col.deadL}}
  if(po.turning&&s.season==='deciduous')return{amt:1,b:s.col.autumn,d:s.col.autumnD,l:s.col.autumnL};
  if(po.turning&&s.season==='dormant')return{amt:1,b:s.col.dead,d:s.col.deadD,l:s.col.deadL};
  return{amt:1,b:s.col.leaf,d:s.col.leafD,l:s.col.leafL};
}
/* ---------- roots, bulbs ---------- */
function roots(c,s){
  const col=s.col,k=rootK(s),D=(10+75*s.rd)*k,W=(14+70*s.rs)*k,Rn=rng(s.seed*13+1);
  c.strokeStyle=col.root;c.lineCap='round';
  const nl=4+Math.round(4*s.rs);
  for(let i=0;i<nl;i++){const side=i%2?1:-1,u=.4+.6*((i>>1)+1)/Math.ceil(nl/2),ex=side*W*u,ey=5+D*.2*u+Rn()*3+W*.08*u;
    c.lineWidth=lerp(3.4,1.7,u)*k;c.beginPath();c.moveTo(side*2,1.5);c.quadraticCurveTo(ex*.45,ey*.25+2,ex,ey);c.stroke();
    c.lineWidth=1.1;for(let j=1;j<=2;j++){const f=.4+.25*j,px=ex*f,py=ey*f*f+2;c.beginPath();c.moveTo(px,py);c.lineTo(px+side*3,py+5+Rn()*4);c.stroke()}}
  const pts=[];for(let i=0;i<=5;i++){const u=i/5;pts.push([Math.sin(u*5+s.seed)*2.6*u,1+D*u])}
  fill(c,col.root,p=>tube(p,pts,[5.5,4.4,3.5,2.6,1.8,1].map(v=>v*k)));
  c.lineWidth=1.1;for(let i=1;i<5;i++){const q=pts[i],side=i%2?1:-1;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]+side*(5+5*s.rd),q[1]+5);c.stroke()}
  if(s.store==='bulb'){fill(c,col.bulb,p=>smooth(p,[[0,1],[7,7],[8.5,14],[0,20],[-8.5,14],[-7,7]],true));fill(c,col.bulbD,p=>smooth(p,[[2,6],[6.5,10],[6,16],[1.5,19],[3.5,12]],true))}
}
/* ---------- leaf clusters ---------- */
function clump(c,x,y,r,st,Rn,s){ // a rounded mass of leaves in three tones
  fill(c,st.b,p=>{ell(p,x,y,r,r*.86);for(let i=0;i<6;i++){const a=i/6*TAU+Rn();ell(p,x+Math.cos(a)*r*.72,y+Math.sin(a)*r*.56,r*.52,r*.48)}});
  fill(c,st.d,p=>{ell(p,x+r*.3,y+r*.36,r*.55,r*.36);ell(p,x-r*.28,y+r*.5,r*.4,r*.26)});
  fill(c,st.l,p=>{ell(p,x-r*.32,y-r*.36,r*.46,r*.3);ell(p,x+r*.14,y-r*.56,r*.3,r*.2)});
  if(s.ls>.42){const n=Math.round(lerp(9,6,s.ls)),ll=r*lerp(.38,.8,s.ls);for(let i=0;i<n;i++){const a=i/n*TAU+Rn()*.4;fill(c,i%3===0?st.l:i%3===1?st.b:st.d,p=>leaf(p,x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.6,ll,ll*.36,a))}}
  if(s.wax>.5){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=Math.max(1,r*.05);c.lineCap='round';for(let i=0;i<3;i++){const a=-2.3+i*.5;c.beginPath();c.arc(x,y,r*(.5+.12*i),a,a+.35);c.stroke()}}
}
function seedsOn(c,s,pts,r){
  const Rn=rng(s.seed*7+3),k=s.bigSeeds?1.5:1;
  pts.forEach(q=>{if(Rn()<.35)return;
    if(s.seeds==='animals')fill(c,s.bigSeeds?'#8c5a2b':s.col.berry,p=>ell(p,q[0]+(Rn()-.5)*r,q[1]+(Rn()-.3)*r*.7,r*.13*k,r*.15*k));
    else if(s.seeds==='wind'){const x=q[0]+(Rn()-.5)*r,y=q[1]-r*.2-Rn()*r*.4;fill(c,s.col.fluff,p=>ell(p,x,y,r*.12*k,r*.12*k))}
    else fill(c,'#c9b06a',p=>ell(p,q[0]+(Rn()-.5)*r,q[1]+r*.3,r*.14*k,r*.1*k))});
}
function thornsAlong(c,s,pts,len){c.fillStyle=s.col.dark;pts.forEach((q,i)=>{const side=i%2?1:-1;c.beginPath();c.moveTo(q[0],q[1]-len*.25);c.lineTo(q[0]+side*len,q[1]-len*.5);c.lineTo(q[0],q[1]+len*.25);c.closePath();c.fill()})}
function spikes(c,x,y,r,col,Rn,n){c.strokeStyle=col;c.lineCap='round';c.lineWidth=Math.max(1,r*.09);for(let i=0;i<n;i++){const a=-Math.PI*(.08+.84*(i+.5)/n);c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*r*(.8+.4*Rn()),y+Math.sin(a)*r*(.8+.4*Rn()));c.stroke()}}
/* ---------- the four growth forms ---------- */
function tree(c,s,po,st){
  const col=s.col,H=s.H,t=po.t||0,sw=Math.sin(t*1.1+s.seed)*H*.014,tw=H*.06+4,Rn=rng(s.seed*5+2);
  const umb=s.leafType==='broad'&&s.wax>.5&&s.ls<.3, lt=s.leafType;
  if(lt==='needles'){ // conifer
    fill(c,col.wood,p=>tube(p,[[0,-tw*.6],[0,-H*.3],[sw*.5,-H*.9]],[tw*1.3,tw*.9,tw*.3]));
    if(st.amt>0)for(let i=0;i<4;i++){const u=i/3,y0=-H*(.2+.2*i),y1=y0-H*.34,hw=H*lerp(.3,.13,u)*(.8+.4*s.ls),x=sw*u;
      fill(c,i%2?st.b:st.d,p=>smooth(p,[[x,y1-H*.06],[x+hw*.55,(y0+y1)/2],[x+hw,y0],[x+hw*.4,y0-H*.02],[x,y0+H*.015],[x-hw*.4,y0-H*.02],[x-hw,y0],[x-hw*.55,(y0+y1)/2]],true,.5));
      fill(c,st.l,p=>ell(p,x-hw*.3,(y0+y1)/2,hw*.22,H*.03,-.9))}
    else spikes(c,sw,-H*.6,H*.2,col.woodD,Rn,7);
    return}
  if(lt==='ribbon'){ // palm
    fill(c,col.wood,p=>tube(p,[[0,-tw*.55],[H*.03,-H*.4],[sw+H*.01,-H*.82]],[tw*1.2,tw*.8,tw*.6]));
    c.strokeStyle=col.woodD;c.lineWidth=1.2;for(let i=1;i<7;i++){const y=-H*.11*i;c.beginPath();c.moveTo(-tw*.4+H*.01*i*.3,y);c.lineTo(tw*.4+H*.01*i*.3,y-2);c.stroke()}
    if(st.amt>0)for(let i=0;i<8;i++){const a=-Math.PI*(.04+.92*i/7),len=H*(.34+.1*Rn())*(.8+.4*s.ls),x=sw+H*.01,y=-H*.82,dr=Math.sin(t*1.3+i)*.05;
      fill(c,i%3===0?st.l:i%3===1?st.b:st.d,p=>{const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len*.7+len*.32;p.moveTo(x,y);p.quadraticCurveTo(x+Math.cos(a+dr)*len*.7,y+Math.sin(a)*len*.9-len*.1,ex,ey);p.quadraticCurveTo(x+Math.cos(a+dr)*len*.5,y+Math.sin(a)*len*.6+len*.08,x,y);p.closePath()})}
    if(st.amt>0&&s.seeds==='animals')fill(c,'#8c5a2b',p=>{ell(p,sw-3,-H*.79,3.2,3.6);ell(p,sw+4,-H*.78,3.2,3.6)});
    return}
  // broad-leaved or spiny tree: trunk, branches, canopy
  const top=umb?-H*.62:-H*.48;
  const ends=umb?[[-H*.4,-H*.86],[-H*.14,-H*.9],[H*.14,-H*.9],[H*.4,-H*.86]]:[[-H*.26,-H*.66],[-H*.06,-H*.86],[H*.14,-H*.8],[H*.28,-H*.62]];
  fill(c,col.wood,p=>{p.moveTo(-tw*1.25,0);p.quadraticCurveTo(-tw*.6,-tw*.4,-tw*.5,-H*.14);p.lineTo(tw*.5,-H*.14);p.quadraticCurveTo(tw*.6,-tw*.4,tw*1.25,0);p.closePath();tube(p,[[0,-tw*.7],[0,-H*.22],[sw*.3,top]],[tw*1.25,tw,tw*.8]);ends.forEach((e,i)=>tube(p,[[sw*.3,top+H*.02],[(e[0]*.5)+sw*.5,(top+e[1])/2-H*.02],[e[0]+sw,e[1]]],[tw*.6,tw*.42,tw*.22]))});
  fill(c,col.woodD,p=>tube(p,[[tw*.3,-tw*.4],[tw*.24,-H*.22],[tw*.18+sw*.3,top]],[tw*.5,tw*.34,tw*.24]));
  if(s.thorns)thornsAlong(c,s,[[0,-H*.12],[0,-H*.24],[0,-H*.36]].concat(ends.map(e=>[e[0]*.5+sw*.5,(top+e[1])/2])),tw*.9);
  if(st.amt<=0||lt==='spines'){ // bare twigs
    c.strokeStyle=col.wood;c.lineCap='round';c.lineWidth=Math.max(1.2,tw*.16);ends.forEach((e,i)=>{for(let j=-1;j<=1;j++){c.beginPath();c.moveTo(e[0]+sw,e[1]);c.lineTo(e[0]+sw+j*H*.07+(i-1.5)*H*.02,e[1]-H*.1+Math.abs(j)*H*.03);c.stroke()}});
    if(lt==='spines')ends.forEach(e=>spikes(c,e[0]+sw,e[1],H*.07,col.dark,Rn,6));
    return}
  if(umb){const y=-H*.92;fill(c,st.d,p=>ell(p,sw,y+H*.035,H*.56,H*.075));fill(c,st.b,p=>{ell(p,sw,y,H*.58,H*.085);ell(p,sw-H*.3,y-H*.02,H*.22,H*.07);ell(p,sw+H*.28,y-H*.025,H*.24,H*.07)});fill(c,st.l,p=>{ell(p,sw-H*.2,y-H*.045,H*.26,H*.035);ell(p,sw+H*.22,y-H*.05,H*.16,H*.028)});
    seedsOn(c,s,[[sw-H*.3,y+H*.05],[sw,y+H*.06],[sw+H*.3,y+H*.05]],H*.12);return}
  const cl=[[-H*.25,-H*.68,H*.2],[H*.26,-H*.66,H*.2],[-H*.08,-H*.9,H*.2],[H*.13,-H*.84,H*.21],[0,-H*.7,H*.24]];
  cl.forEach(q=>clump(c,q[0]+sw*(1+Math.abs(q[1])/H),q[1],q[2]*(.85+.3*s.ls),st,Rn,s));
  seedsOn(c,s,cl.map(q=>[q[0]+sw,q[1]]),H*.16);
}
function shrub(c,s,po,st){
  const col=s.col,H=s.H,t=po.t||0,Rn=rng(s.seed*3+9),n=5,span=lerp(1.4,.62,clamp((H-18)/80,0,1)),ends=[];
  for(let i=0;i<n;i++){const a=-Math.PI/2+(i/(n-1)-.5)*2*span,len=H*(.8+.25*Rn())*(Math.abs(i-2)===2?.9:1),sw=Math.sin(t*1.4+i+s.seed)*H*.02;
    const ex=Math.cos(a)*len+sw,ey=Math.sin(a)*len-2;ends.push([ex,ey,a]);
    fill(c,col.wood,p=>tube(p,[[i-2,1],[ex*.45,ey*.55-H*.04],[ex,ey]],[4.2,3,1.6]));
    if(s.thorns)thornsAlong(c,s,[[ex*.25,ey*.3],[ex*.45,ey*.52],[ex*.65,ey*.74]],5.5)}
  if(st.amt<=0){if(st.amt===0){c.strokeStyle=col.wood;c.lineWidth=1.3;c.lineCap='round';ends.forEach(e=>{for(let j=-1;j<=1;j+=2){c.beginPath();c.moveTo(e[0],e[1]);c.lineTo(e[0]+Math.cos(e[2]+j*.5)*H*.16,e[1]+Math.sin(e[2]+j*.5)*H*.16);c.stroke()}})}return}
  const r=Math.max(7,H*.2)*(.8+.5*s.ls);
  ends.forEach((e,i)=>{if(s.leafType==='broad')clump(c,e[0],e[1],r,st,Rn,s);
    else if(s.leafType==='needles'){spikes(c,e[0],e[1]+r*.3,r*1.1,i%2?st.b:st.d,Rn,9)}
    else if(s.leafType==='ribbon'){for(let j=0;j<5;j++)fill(c,j%2?st.b:st.l,p=>leaf(p,e[0],e[1],r*(1.3+.4*Rn()),r*.16,e[2]+(j-2)*.32))}
    else spikes(c,e[0],e[1],r*.7,col.dark,Rn,7)});
  if(s.leafType==='broad'){clump(c,0,-H*.5,r*1.1,st,Rn,s)}
  seedsOn(c,s,ends,r);
}
function herb(c,s,po,st){
  const col=s.col,H=s.H,t=po.t||0,Rn=rng(s.seed*11+4),lt=s.leafType;
  if(st.amt<0){c.fillStyle=col.dead;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*3-1.4,0);c.lineTo(i*4.5+Rn()*2,-5-Rn()*5);c.lineTo(i*3+1.4,0);c.closePath();c.fill()}return}
  if(lt==='ribbon'||lt==='needles'){const n=lt==='needles'?15:11,wd=lt==='needles'?1.1:lerp(2.2,3.6,s.ls);
    for(let i=0;i<n;i++){const u=i/(n-1)-.5,len=H*(.62+.42*Rn())*(1-Math.abs(u)*.5),a=-Math.PI/2+u*1.5+Math.sin(t*1.6+i*.7+s.seed)*.07,bend=u*len*.5;
      fill(c,i%3===0?st.l:i%3===1?st.b:st.d,p=>{const ex=u*8+Math.cos(a)*len+bend*.4,ey=Math.sin(a)*len;p.moveTo(u*8-wd,0);p.quadraticCurveTo(u*8+Math.cos(a)*len*.5-wd*.4,ey*.55,ex,ey);p.quadraticCurveTo(u*8+Math.cos(a)*len*.5+wd,ey*.5,u*8+wd,0);p.closePath()})}
    if(s.store==='bulb'&&st.amt>0){const sw=Math.sin(t*1.2+s.seed)*2;c.strokeStyle=st.d;c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(1,-H*.7,6+sw,-H*1.05);c.stroke();
      for(let i=0;i<4;i++){const x=4+sw*(.5+i*.15)+i*2.2,y=-H*(1.02-i*.09);fill(c,col.flower,p=>smooth(p,[[x,y],[x+3.6,y+1.5],[x+4.4,y+6.5],[x+2.2,y+5.5],[x,y+6.8],[x-.8,y+2]],true))}}
    else if(st.amt>0&&lt==='ribbon'){c.strokeStyle=st.d;c.lineWidth=1.2;[-.25,.2].forEach((u,i)=>{const sw=Math.sin(t*1.5+i)*2.5,x=u*H*.5+sw,y=-H*1.05;c.beginPath();c.moveTo(u*6,0);c.quadraticCurveTo(u*H*.3,-H*.6,x,y);c.stroke();for(let j=0;j<4;j++)fill(c,s.seeds==='wind'?'#d8b469':'#a8843f',p=>leaf(p,x-(j%2?1:-1)*.5,y+j*3.4,H*.13,1.5,-Math.PI/2+(j%2?.7:-.7)))})}
    return}
  if(lt==='broad'){const n=5,r=H*(.34+.4*s.ls);
    for(let i=0;i<n;i++){const u=i/(n-1)-.5,a=-Math.PI/2+u*2.3,len=H*(.5+.15*Rn()),sw=Math.sin(t*1.4+i+s.seed)*.05;const ex=Math.cos(a+sw)*len,ey=Math.sin(a+sw)*len;
      c.strokeStyle=st.d;c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(ex*.3,ey*.7,ex,ey);c.stroke();
      fill(c,i%2?st.b:st.l,p=>leaf(p,ex,ey,r,r*.42,a));c.strokeStyle=st.d;c.lineWidth=.9;c.beginPath();c.moveTo(ex,ey);c.lineTo(ex+Math.cos(a)*r*.8,ey+Math.sin(a)*r*.8);c.stroke()}
    if(st.amt>0){c.strokeStyle=st.d;c.lineWidth=1.5;c.beginPath();c.moveTo(0,0);c.lineTo(Math.sin(t+s.seed)*2,-H*1.02);c.stroke();const fx=Math.sin(t+s.seed)*2,fy=-H*1.05;for(let i=0;i<5;i++)fill(c,col.flowerL,p=>leaf(p,fx,fy,H*.14,H*.05,i/5*TAU));fill(c,'#f0c23a',p=>ell(p,fx,fy,H*.04,H*.04))}
    return}
  // spiny herb: a thistle
  c.strokeStyle=st.d;c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(0,-H*.85);c.stroke();
  for(let i=0;i<4;i++){const y=-H*(.15+.18*i),side=i%2?1:-1;spikes(c,side*H*.08,y,H*.16,st.b,Rn,5)}spikes(c,0,-H*.85,H*.16,col.dark,Rn,7);fill(c,'#b65fb0',p=>ell(p,0,-H*.9,H*.07,H*.06));
}
function succulent(c,s,po,st){
  const col=s.col,H=s.H,lt=s.leafType,Rn=rng(s.seed*17+6);
  const fatK=s.store==='water'?.55+.75*s.stemStore:.5,w=Math.max(7,H*.15)*fatK;
  if(lt==='broad'||lt==='ribbon'){ // fleshy leaves from the base, like an aloe or agave
    const n=7,len=H*.85,wd=(lt==='broad'?.2:.11)*len*(.7+.6*s.ls)*(.7+.5*fatK);
    for(let i=0;i<n;i++){const u=i/(n-1)-.5,a=-Math.PI/2+u*2.1;fill(c,i%3===0?st.l:i%3===1?st.b:st.d,p=>leaf(p,u*6,0,len*(1-Math.abs(u)*.35),wd,a));
      if(s.thorns){const ex=u*6+Math.cos(a)*len*(1-Math.abs(u)*.35),ey=Math.sin(a)*len*(1-Math.abs(u)*.35);fill(c,col.dark,p=>leaf(p,ex,ey,5,1.4,a))}}
    return}
  const body=new Path2D();tube(body,[[0,1],[0,-H*.5],[0,-H+w*.5]],[w*.95,w,w*.92]);
  const arms=H>80?[[-1,-H*.42,H*.26],[1,-H*.55,H*.2]]:H>50?[[1,-H*.45,H*.2]]:[];
  arms.forEach(([side,y,up])=>{const ax=side*(w*.5+H*.13);tube(body,[[side*w*.3,y],[ax,y],[ax,y-up]],[w*.6,w*.62,w*.56])});
  c.fillStyle=st.b;c.fill(body);
  c.save();c.clip(body);fill(c,st.d,p=>{p.rect(w*.16,-H-5,w,H+10)});fill(c,st.l,p=>{p.rect(-w*.42,-H-5,w*.16,H+10)});
  c.strokeStyle=st.d;c.globalAlpha=.55;c.lineWidth=1;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*w*.2,2);c.lineTo(i*w*.2,-H);c.stroke()}c.restore();
  if(lt==='spines'||lt==='needles'||s.thorns){c.strokeStyle=lt==='needles'?st.d:col.dark;c.lineWidth=1;c.lineCap='round';const stepY=lt==='needles'?4:7;
    for(let y=-6;y>-H+w*.3;y-=stepY){[-1,1].forEach(side=>{c.beginPath();c.moveTo(side*w*.48,y);c.lineTo(side*(w*.48+3.6),y-2.2);c.stroke()})}
    arms.forEach(([side,y,up])=>{const ax=side*(w*.5+H*.13);for(let yy=y-4;yy>y-up;yy-=stepY){c.beginPath();c.moveTo(ax+side*w*.3,yy);c.lineTo(ax+side*(w*.3+3.4),yy-2);c.stroke()}})}
  if(s.seeds==='animals')fill(c,col.berry,p=>{ell(p,-w*.2,-H-1,3,3.4);ell(p,w*.22,-H,3,3.4)});
  else fill(c,col.flowerL,p=>{for(let i=0;i<5;i++)leaf(p,0,-H+1,5,2,-Math.PI/2+(i-2)*.5)});
}
function aquatic(c,s,po,st){
  const col=s.col,H=s.H,t=po.t||0,wy=po.waterY!=null?po.waterY:-H,Rn=rng(s.seed*23+8);
  if(st.amt<0)return;
  if(s.leafType==='broad'){ // floating pads on long stems
    const n=4,rx=10+20*s.ls;
    for(let i=0;i<n;i++){const u=i/(n-1)-.5,x=u*H*.95+Math.sin(t*.8+i)*2;
      c.strokeStyle=st.d;c.lineWidth=1.8;c.lineCap='round';c.beginPath();c.moveTo(u*5,0);c.bezierCurveTo(u*10,wy*.4,x-u*14,wy*.75,x,wy+1.5);c.stroke();
      fill(c,i%2?st.b:st.l,p=>{p.moveTo(x,wy);p.ellipse(x,wy,rx,rx*.24,0,.25,TAU-.2);p.closePath()});
      fill(c,st.d,p=>{p.ellipse(x+rx*.2,wy+rx*.07,rx*.6,rx*.1,0,0,TAU)})}
    const fx=H*.12,fy=wy-2;for(let i=0;i<5;i++)fill(c,col.flowerL,p=>leaf(p,fx,fy,rx*.5,rx*.16,-Math.PI/2+(i-2)*.45));fill(c,'#f0c23a',p=>ell(p,fx,fy-1,rx*.1,rx*.08));
    return}
  const n=s.leafType==='ribbon'?9:7,wd=s.leafType==='ribbon'?lerp(3,5.5,s.ls):2.2;
  for(let i=0;i<n;i++){const u=i/(n-1)-.5,len=Math.min(H*(.7+.35*Rn()),-wy+6),pts=[],ws=[];
    for(let j=0;j<=6;j++){const v=j/6;pts.push([u*12+Math.sin(t*1.1+v*3+i*.9)*len*.09*v+u*len*.3*v,-len*v]);ws.push(wd*(1-.55*v))}
    fill(c,i%3===0?st.l:i%3===1?st.b:st.d,p=>tube(p,pts,ws))}
}
function draw(c,s,po){
  po=po||{};const st=leafState(s,po);
  if(po.roots)roots(c,s);
  if(s.aq)return aquatic(c,s,po,st);
  ({tree,shrub,herb,succulent})[s.form](c,s,po,st);
}

/* ---------- gallery: every preset with the soil cut away to show the roots ---------- */
const ITEMS=Object.keys(zoo).map(n=>({name:n,t:zoo[n].t,home:zoo[n].home})).concat([
  {name:'Short roots',grp:'r',t:P({height:40,rootDepth:20,rootSpread:20})},{name:'Wide roots',grp:'r',t:P({height:40,rootDepth:25,rootSpread:90})},{name:'Deep roots',grp:'r',t:P({height:40,rootDepth:90,rootSpread:30})},{name:'Thorns, thick wax, small leaves',grp:'r',t:P({height:40,defence:'thorns',wax:90,leafSize:15,rootDepth:60,rootSpread:60})},
  {name:'Pine tree (needles)',t:P({form:'tree',leaf:'needles',height:70,rootDepth:50,rootSpread:70})},{name:'Palm (ribbon leaves)',t:P({form:'tree',leaf:'ribbon',height:65,rootDepth:40,rootSpread:60,seeds:'animals'})},{name:'Aloe (fleshy leaves)',t:P({form:'succulent',leaf:'broad',height:30,store:'water',stemStore:80,defence:'thorns',rootSpread:70})},{name:'Small cactus, little water',t:P({form:'succulent',leaf:'spines',height:35,store:'water',stemStore:20,rootSpread:80})},
  {name:'Oak: summer',grp:'o',t:zoo['English oak'].t,pose:{}},{name:'Oak: autumn',grp:'o',t:zoo['English oak'].t,pose:{turning:true}},{name:'Oak: winter (harsh)',grp:'o',t:zoo['English oak'].t,pose:{harsh:true}},{name:'Bluebell: winter (harsh)',t:zoo['Bluebell'].t,pose:{harsh:true}},
  {name:'Red oat grass: dry season',t:zoo['Red oat grass'].t,pose:{turning:true}},{name:'Water lily: winter (harsh)',t:zoo['Water lily'].t,pose:{harsh:true}},{name:'Thistle (spiny herb)',t:P({form:'herb',leaf:'spines',height:60,rootDepth:70,rootSpread:30,defence:'thorns'})},{name:'Daisy (flat-leaf herb)',t:P({form:'herb',leaf:'broad',height:30,leafSize:60,rootDepth:20,rootSpread:50})}
]);
const SKY={tundra:'#e6eef4',desert:'#f6ead2',forest:'#e4efe2',grassland:'#f5eccd',ocean:'#d3e6ef',freshwater:'#d9ebe6'};
function gallery(t){
  const cv=document.getElementById('plantGal');if(!cv)return;
  const dpr=Math.min(2,window.devicePixelRatio||1),W=cv.clientWidth,cols=W<640?2:4,rows=Math.ceil(ITEMS.length/cols),Hh=Math.round(W*rows/cols*.95);
  cv.style.height=Hh+'px';if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(Hh*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(Hh*dpr)}
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,Hh);const cw=W/cols,ch=Hh/rows;
  ITEMS.forEach((it,i)=>{const x0=(i%cols)*cw,y0=Math.floor(i/cols)*ch,pad=cw*.04,s=specOf(it.t,i+2),z=sizeOf(s);
    const bx=x0+pad,by=y0+pad,bw=cw-2*pad,bh=ch-2*pad-18,gy=by+bh*.62;
    c.save();c.beginPath();c.roundRect(bx,by,bw,bh,14);c.clip();
    c.fillStyle=SKY[it.home]||'#e9f0ec';c.fillRect(bx,by,bw,bh);
    const scOf=zz=>Math.min(bh*.57/zz.h,bh*.35/zz.rootDepth,bw*.86/Math.max(zz.w,zz.rootW));
    const sc=it.grp?Math.min(...ITEMS.filter(o=>o.grp===it.grp).map((o,j)=>scOf(sizeOf(specOf(o.t,1))))):scOf(z);
    if(z.water){c.fillStyle='rgba(70,150,190,.3)';c.fillRect(bx,gy-s.H*sc,bw,s.H*sc);c.fillStyle='rgba(255,255,255,.7)';c.fillRect(bx,gy-s.H*sc,bw,1.5)}
    c.fillStyle=z.water?'#cdb98c':'#a9835c';c.fillRect(bx,gy,bw,bh);c.fillStyle=z.water?'#bda774':'#93704c';c.fillRect(bx,gy+bh*.2,bw,bh);
    c.fillStyle=z.water?'#d9c79c':({tundra:'#eef3f6',desert:'#e2c58e',grassland:'#c9b45a'}[it.home]||'#86a85a');c.fillRect(bx,gy-2.5,bw,5);
    c.translate(x0+cw/2,gy);c.scale(sc,sc);
    draw(c,s,{t:t+i,roots:true,waterY:-s.H,...(it.pose||{})});
    c.restore();
    c.font='600 '+Math.max(11,Math.min(14,cw*.07))+'px "Avenir Next","Segoe UI",system-ui,sans-serif';c.textAlign='center';c.fillStyle='#24352d';c.fillText(it.name,x0+cw/2,y0+ch-pad-4)});
}
let T=0,last=0;const still=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T+=dt;gallery(T);if(!still)requestAnimationFrame(frame)}
// names of the preset plants that live in a biome, for scattering into a scene
function forBiome(id){return Object.keys(zoo).filter(n=>zoo[n].home===id)}
window.Plants={draw,specOf,sizeOf,zoo,DEF,forBiome,gallery};
if(typeof document!=='undefined'&&typeof requestAnimationFrame!=='undefined')requestAnimationFrame(frame);
})();
