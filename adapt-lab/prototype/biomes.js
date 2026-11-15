/* Adapt Lab art prototype: biome backdrops.
   Pure drawing: nothing here keeps state between frames. Everything is worked out from opts:
     {biome, season, night, t, event:{id, amount}}
   season is 0–3 and may be fractional: 1.4 is 40% of the way from season 1 to season 2, so the ground never snaps.
   Three calls make a frame, so animals can be drawn in between:
     Biomes.draw(c,w,h,opts)   sky, sun or moon, ridges, ground (or water and sea floor)
     Biomes.deco(c,w,h,opts)   -> [{z, draw()}] scattered details, to depth-sort with the animals
     Biomes.front(c,w,h,opts)  weather, flood water, smoke, foreground fringe, night tint
   Biome ids, season names and harsh seasons match BIOMES in Adapt-Lab.html. */
(function(){
"use strict";
const R=window.Rig,{lerp,clamp,TAU,rng,mix,fill,ell,smooth}=R;
const ids=['tundra','desert','forest','grassland','ocean','freshwater'];
const SNOW='#f4f7f9',SNOW2='#dfe8ef';
const B={
 tundra:{name:'Arctic tundra',seasons:['Spring thaw','Short summer','Autumn','Long winter'],harsh:3,S:[
  {sky:['#8fb6d8','#cfe3ee','#f1f1e8'],ridge:['#9fb6c9','#a9b7a8','#b0b08a'],ground:['#c3c9a4','#a9ad82'],grass:'#b89a5a',fore:'#8f9a7a',snow:.55,fall:['snow',.2],clouds:.4},
  {sky:['#6fa9d8','#bfdcee','#eef2e2'],ridge:['#92aabd','#9aad9a','#a8b482'],ground:['#b3bb7c','#8f9a5c'],grass:'#7f9a48',fore:'#5f7a3c',snow:.05,flowers:.9,clouds:.6},
  {sky:['#9fb4c9','#dcdcd6','#f3e6cf'],ridge:['#a3b1bf','#b4ae9c','#b89f77'],ground:['#c2a56e','#a8854e'],grass:'#b07a3a',fore:'#8a6638',snow:.3,fall:['snow',.3],clouds:.5},
  {sky:['#7f9fc4','#c9d8e6','#eceff2'],ridge:['#a9bccd','#b7bdb4','#b3ab94'],ground:['#b9b3a0','#a39c86'],grass:'#b89a5a',fore:'#9aa3a6',snow:1,fall:['snow',.8],clouds:.2}]},
 desert:{name:'Hot desert',seasons:['Spring','Scorching summer','Autumn','Mild winter'],harsh:1,S:[
  {sky:['#7fb7e0','#cfe6f0','#f6e9c9'],ridge:['#d3a26c','#dcb07a','#e4bf8c'],ground:['#e8c688','#d6a660'],grass:'#8fa052',fore:'#a8793c',snow:0,flowers:.6,shrub:.9},
  {sky:['#e9bd72','#f6dba6','#fff1d2'],ridge:['#dba05e','#e6b26e','#eec483'],ground:['#f1d193','#e2b268'],grass:'#b59a5a',fore:'#b07a34',snow:0,fall:['dust',.5],shimmer:1,shrub:.35},
  {sky:['#8fbfe0','#dbe7e6','#f5e3c3'],ridge:['#d2a26a','#dab078','#e3be8a'],ground:['#e6c385','#d3a35e'],grass:'#a8985a',fore:'#a2743a',snow:0,shrub:.6},
  {sky:['#93b6d6','#d6e1e8','#efe3d0'],ridge:['#c59d72','#cfab80','#d9ba92'],ground:['#dcc091','#c8a26a'],grass:'#96995f',fore:'#94714a',snow:0,shrub:.7,clouds:.3}]},
 forest:{name:'Temperate forest',seasons:['Spring','Summer','Autumn','Cold winter'],harsh:3,trees:true,S:[
  {sky:['#8cc4e8','#d3ecf3','#eef6e3'],ridge:['#9fc296','#7fae72','#639a56'],ground:['#9aa35e','#7c8846'],grass:'#6fa04a',fore:'#3f6a36',leaf:'#8cc45f',leafAmt:.8,snow:0,flowers:.8,fall:['rain',.2],clouds:.5},
  {sky:['#74b4e4','#c6e6f2','#e9f4dc'],ridge:['#7fac80','#5b9458','#447d42'],ground:['#86874a','#6a6f3a'],grass:'#5a8f3e',fore:'#2f5a2c',leaf:'#4f9446',leafAmt:1,snow:0,clouds:.4},
  {sky:['#9cbcd6','#e3dfd0','#f6e3c0'],ridge:['#c2a56a','#c78c48','#b56d34'],ground:['#ad7540','#8d5a32'],grass:'#b08a40',fore:'#6a4a26',leaf:'#dc8a32',leafAmt:.75,snow:0,fall:['leaves',.7],clouds:.5},
  {sky:['#9fb3c9','#d5dde6','#eef0f2'],ridge:['#9aa5b0','#848c94','#70767c'],ground:['#8a7355','#6f5a42'],grass:'#9a8a6a',fore:'#8d98a2',leaf:'#7a6a58',leafAmt:.05,snow:.85,fall:['snow',.5],clouds:.3}]},
 grassland:{name:'Savanna grassland',seasons:['Rains begin','Wet season','Rains end','Long dry season'],harsh:3,S:[
  {sky:['#7fb4e0','#cfe3ee','#f3ecd0'],ridge:['#b4ad7c','#bdb577','#c5be70'],ground:['#cbbf66','#b3a64e'],grass:'#a8b04a',fore:'#6f7a2c',leaf:'#7f9a3c',leafAmt:.7,snow:0,fall:['rain',.25],clouds:.7},
  {sky:['#6f9fcf','#b9d3e6','#e3ecd6'],ridge:['#8faa7a','#8fb066','#93b85a'],ground:['#9dbb55','#7fa043'],grass:'#6f9a34',fore:'#3f6a22',leaf:'#5f8f34',leafAmt:1,snow:0,fall:['rain',.7],clouds:1,flowers:.4},
  {sky:['#8fb9dc','#dbe3d6','#f6e6bc'],ridge:['#bfae78','#cab673','#d0bc6c'],ground:['#d2c063','#bba64c'],grass:'#b8a848',fore:'#7a6f2a',leaf:'#7f8f3c',leafAmt:.8,snow:0,clouds:.4},
  {sky:['#f2b56a','#f8d79a','#fbeccb'],ridge:['#d9a56b','#e0b578','#e9c88d'],ground:['#e6c877','#d2a955'],grass:'#c9a146',fore:'#8a6a2c',leaf:'#8f8a44',leafAmt:.45,snow:0,fall:['dust',.45]}]},
 ocean:{name:'Coastal ocean',seasons:['Spring','Summer','Autumn','Stormy winter'],harsh:3,water:true,S:[
  {water:['#62bcd2','#2f8fb5','#1d5f8f'],floor:['#dccba0','#bfae84'],weed:'#3f8f5a',weedAmt:.8,rays:.7,sway:1,snow:0},
  {water:['#74d0de','#34a2c2','#1f6a9c'],floor:['#e6d6a8','#c9b88c'],weed:'#3f9a52',weedAmt:1,rays:1,sway:.8,snow:0},
  {water:['#5aa9bf','#2f85a6','#1d5a84'],floor:['#d6c59a','#b8a77e'],weed:'#5f8f4a',weedAmt:.75,rays:.5,sway:1.3,snow:0},
  {water:['#6f95a6','#3a6f8c','#22486a'],floor:['#c6ba98','#a89c7c'],weed:'#4f7a52',weedAmt:.5,rays:.15,sway:2.4,snow:0,storm:1}]},
 freshwater:{name:'Lake & river',seasons:['Spring','Summer','Autumn','Icy winter'],harsh:3,water:true,surface:.14,S:[
  {sky:['#8cc4e8','#dff0f2'],water:['#8fcfb6','#4f9f8c','#2f6f66'],floor:['#8a7a5a','#6f6046'],weed:'#4f9a4f',weedAmt:.7,rays:.5,sway:1,lily:.5,bank:'#6fa04a',snow:0},
  {sky:['#74b4e4','#d6eef2'],water:['#9ad8ae','#58a884','#33755f'],floor:['#8f7f5c','#726348'],weed:'#3f8f3f',weedAmt:1,rays:.8,sway:.8,lily:1,bank:'#5a8f3e',snow:0},
  {sky:['#9cbcd6','#f1e2c6'],water:['#a8bf94','#6f9478','#465f52'],floor:['#86704e','#6a5840'],weed:'#8a8a3f',weedAmt:.6,rays:.4,sway:1.2,lily:.3,bank:'#b08a40',leaves:1,snow:0},
  {sky:['#9fb3c9','#e6ecf0'],water:['#b4cdd6','#6f9aa6','#44626e'],floor:['#7c7260','#625a4c'],weed:'#6a7a5a',weedAmt:.3,rays:.25,sway:.6,lily:0,bank:'#9a8a6a',ice:1,snow:.8}]}
};
const NIGHT=['#0a1230','#15214a','#26356a'];
const mixA=(a,b,u)=>a.map((x,i)=>mix(x,b[i],u));
const num=(a,b,k,u)=>lerp(a[k]||0,b[k]||0,u);
/* work out everything the drawing needs for this moment */
function state(o){
  const bk=B[o.biome]?o.biome:'tundra',Bd=B[bk];const se=((o.season||0)%4+4)%4,i0=Math.floor(se),i1=(i0+1)%4,u=se-i0;const a=Bd.S[i0],b=Bd.S[i1];
  const S={bk,water:!!Bd.water,surface:Bd.surface||0,trees:!!Bd.trees,night:clamp(o.night||0,0,1),t:o.t||0,harsh:(i0===Bd.harsh?1-u:0)+(i1===Bd.harsh?u:0)};
  ['sky','ridge','ground','water','floor'].forEach(k=>{if(a[k])S[k]=mixA(a[k],b[k],u)});
  ['grass','fore','leaf','weed','bank'].forEach(k=>{if(a[k])S[k]=mix(a[k],b[k],u)});
  ['snow','leafAmt','flowers','clouds','shimmer','shrub','weedAmt','rays','sway','lily','ice','leaves','storm'].forEach(k=>S[k]=num(a,b,k,u));
  S.falls=[];if(a.fall)S.falls.push([a.fall[0],a.fall[1]*(1-u)]);if(b.fall)S.falls.push([b.fall[0],b.fall[1]*u]);
  const ev=o.event||{},am=clamp(ev.amount||0,0,1);S.fire=0;S.flood=0;S.ash=0;S.dry=0;
  if(am>0){
    if(ev.id==='iceage'){S.snow=Math.max(S.snow,am);S.ice=Math.max(S.ice||0,am);if(S.sky)S.sky=mixA(S.sky,S.sky.length===2?['#8fa9c9','#e6ecf0']:['#8fa9c9','#cfdbe8','#eef2f5'],am*.6);if(S.leafAmt)S.leafAmt*=1-.7*am;S.falls.push(['snow',.7*am]);if(S.water)S.water=mixA(S.water,['#c6dce6','#7fa3b3','#4a6878'],am*.5);S.flowers=0;S.rays*=1-.5*am}
    if(ev.id==='drought'||ev.id==='desert'){const k=ev.id==='desert'?1:.6;S.dry=am*k;
      if(S.ground){S.ground=mixA(S.ground,['#e8c688','#d6a660'],am*k*.85);S.grass=mix(S.grass,'#c2a155',am*.9);S.fore=mix(S.fore,'#a8793c',am*.7)}
      if(S.ridge&&ev.id==='desert')S.ridge=mixA(S.ridge,['#d3a26c','#dcb07a','#e4bf8c'],am*.85);
      if(S.leaf){S.leaf=mix(S.leaf,'#9a8a4a',am*.7);S.leafAmt*=1-.6*am*k}S.snow*=1-am;S.flowers*=1-am;S.falls=S.falls.filter(f=>f[0]!=='rain'&&f[0]!=='snow');S.falls.push(['dust',.55*am]);
      if(S.sky&&S.sky.length===3)S.sky=mixA(S.sky,['#e9bd72','#f6dba6','#fff1d2'],am*.5*k);S.shimmer=Math.max(S.shimmer,am*k);
      if(S.water){S.water=mixA(S.water,['#b7c48a','#869a62','#566646'],am*.5);S.weedAmt*=1-.5*am}}
    if(ev.id==='fire'&&!S.water){S.fire=am;S.ground=mixA(S.ground,['#4a3830','#33261f'],am*.75);S.grass=mix(S.grass,'#2f241e',am*.85);S.fore=mix(S.fore,'#241a15',am*.8);if(S.leaf){S.leaf=mix(S.leaf,'#33261f',am*.8);S.leafAmt*=1-.75*am}
      S.sky=mixA(S.sky,['#5f5350','#b9805a','#f0a04a'],am*.7);S.ridge=mixA(S.ridge,['#6a5248','#5a443a','#4a362e'],am*.6);S.snow*=1-am;S.flowers*=1-am;S.falls=[]}
    if(ev.id==='flood'&&!S.water){S.flood=am;S.sky=mixA(S.sky,['#7f8f9f','#b3bfc8','#d3dade'],am*.7);S.falls=[['rain',.9*am]];S.clouds=Math.max(S.clouds,am)}
    if(ev.id==='volcano'){S.ash=am;if(S.sky)S.sky=mixA(S.sky,S.sky.length===2?['#6d6a66','#b3a89a']:['#6d6a66','#8a8580','#b3a89a'],am*.85);if(S.ground)S.ground=mixA(S.ground,['#9a968f','#827e78'],am*.45);if(S.leafAmt)S.leafAmt*=1-.4*am;S.rays*=1-.8*am;S.falls.push(['ash',.8*am]);if(S.water)S.water=mixA(S.water,['#8a8f8c','#5f6a6a','#3f4a4c'],am*.5)}
  }
  if(S.sky&&S.night>0)S.sky=mixA(S.sky,S.sky.length===2?[NIGHT[0],NIGHT[2]]:NIGHT,S.night*.93);
  if(S.ground){S.groundS=mixA(S.ground,[SNOW,SNOW2],clamp(S.snow*1.15,0,1));S.ridgeS=mixA(S.ridge,['#b9cbdc','#cfdce8','#e4edf2'],S.snow*.85);S.foreS=mix(S.fore,'#b7c6d1',S.snow*.8)}
  return S;
}
const hzOf=h=>h*.44;
const yOf=(z,h)=>lerp(h*.52,h*.95,z),scOf=(z,h)=>lerp(.42,1,z)*h/520;
function ridge(c,w,y,amp,seed,col,rough){c.fillStyle=col;c.beginPath();c.moveTo(0,y+amp*2);
  for(let x=0;x<=w+8;x+=8){const u=x/w*6+seed;let v=.5+.3*Math.sin(u)+.25*Math.sin(u*2.3+1)+.12*Math.sin(u*5.1+2);if(rough)v=.45+.25*Math.sin(u*.9)+.3*Math.abs(Math.sin(u*6.3+seed))+.16*Math.abs(Math.sin(u*14.7))+.06*Math.sin(u*31);c.lineTo(x,y-amp*v)}
  c.lineTo(w+8,9999);c.lineTo(0,9999);c.closePath();c.fill()}
function cloud(c,x,y,s,col){fill(c,col,p=>{ell(p,x,y,60*s,16*s);ell(p,x-30*s,y+4*s,34*s,12*s);ell(p,x+34*s,y+5*s,38*s,12*s);ell(p,x+6*s,y-12*s,30*s,16*s);ell(p,x-18*s,y-7*s,22*s,13*s)})}
/* ---------- backdrop ---------- */
function draw(c,w,h,o){const S=state(o);S.water?drawWater(c,w,h,S):drawLand(c,w,h,S);return S}
function skyBits(c,w,h,S,top,bottom){const t=S.t,n=S.night,hh=bottom-top;
  if(n>.05){const Rn=rng(31);c.fillStyle='#ffffff';for(let i=0;i<70;i++){const x=Rn()*w,y=top+Rn()*hh*.9,r=(.5+Rn())*h/520;c.globalAlpha=n*(.35+.6*Math.abs(Math.sin(t*.7+i*1.7)))*(1-S.ash*.9);c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}c.globalAlpha=1}
  const sx=w*.74,sy=top+hh*.42,mx=w*.24,my=top+hh*.3,dim=1-S.ash*.6;
  if(n<.95){c.globalAlpha=(1-n)*dim;const sg=c.createRadialGradient(sx,sy,0,sx,sy,h*.34);sg.addColorStop(0,'rgba(255,250,225,.75)');sg.addColorStop(1,'rgba(255,250,225,0)');c.fillStyle=sg;c.fillRect(0,top,w,hh);fill(c,S.ash>.3?'#f0b48a':'#fff6dc',p=>ell(p,sx,sy,h*.045,h*.045));c.globalAlpha=1}
  if(n>.05){c.globalAlpha=n*dim;const mg=c.createRadialGradient(mx,my,0,mx,my,h*.22);mg.addColorStop(0,'rgba(210,225,255,.4)');mg.addColorStop(1,'rgba(210,225,255,0)');c.fillStyle=mg;c.fillRect(0,top,w,hh);fill(c,'#eef2fb',p=>ell(p,mx,my,h*.04,h*.04));fill(c,S.sky[0],p=>ell(p,mx+h*.018,my-h*.01,h*.034,h*.034));c.globalAlpha=1}
  if(S.clouds>.05){const col=mix(mix('#ffffff',S.sky[S.sky.length-1],.25),'#3a4468',n*.7);c.globalAlpha=clamp(S.clouds,0,1)*.9;for(let i=0;i<6;i++){const x=((i*.19+.07+t*.006*(1+i%3*.4))%1.3-.15)*w,y=top+hh*(.12+.5*((i*.37)%1));cloud(c,x,y,(.6+.5*((i*.53)%1))*h/520*1.5,col)}c.globalAlpha=1}
}
function drawLand(c,w,h,S){const hz=hzOf(h),t=S.t;
  const g=c.createLinearGradient(0,0,0,hz+h*.05);S.sky.forEach((k,i)=>g.addColorStop(i/(S.sky.length-1),k));c.fillStyle=g;c.fillRect(0,0,w,hz+h*.06);
  skyBits(c,w,h,S,0,hz);
  if(S.fire>0){c.globalAlpha=S.fire*(.75+.2*Math.sin(t*3));const fg=c.createLinearGradient(0,hz-h*.22,0,hz+h*.05);fg.addColorStop(0,'rgba(255,140,40,0)');fg.addColorStop(1,'rgba(255,150,50,.9)');c.fillStyle=fg;c.fillRect(0,hz-h*.22,w,h*.28);c.globalAlpha=1}
  const dk=k=>mix(k,'#141c3c',S.night*.55);
  if(S.trees){ridge(c,w,hz-h*.1,h*.2,1.3,dk(S.ridgeS[0]),true);ridge(c,w,hz-h*.02,h*.15,4.1,dk(S.ridgeS[1]),true);
    const Rn=rng(8),tc=dk(mix(S.ridgeS[2],'#4a3a2c',.55));for(let i=0;i<18;i++){const x=(i+.2+Rn()*.6)/18*w,tw=(4+Rn()*7)*h/520;c.fillStyle=tc;c.fillRect(x-tw/2,hz-h*.34,tw,h*.42)}
    ridge(c,w,hz+h*.035,h*.1,7.7,dk(S.ridgeS[2]),true)}
  else{ridge(c,w,hz-h*.03,h*.11,1.3,dk(S.ridgeS[0]));ridge(c,w,hz,h*.07,4.1,dk(S.ridgeS[1]));ridge(c,w,hz+h*.035,h*.035,7.7,dk(S.ridgeS[2]))}
  const gg=c.createLinearGradient(0,hz+h*.03,0,h);gg.addColorStop(0,S.groundS[0]);gg.addColorStop(1,S.groundS[1]);c.fillStyle=gg;c.fillRect(0,hz+h*.045,w,h);
  // soft ground bands give the flat ground some shape
  c.globalAlpha=.16;const Rn=rng(19);for(let i=0;i<9;i++){const z=Rn(),y=yOf(z,h),s=scOf(z,h);fill(c,i%2?mix(S.groundS[1],'#ffffff',.5):mix(S.groundS[1],'#3a3020',.35),p=>ell(p,Rn()*w,y,(140+160*Rn())*s,(7+6*Rn())*s))}c.globalAlpha=1;
  if(S.shimmer>.1&&S.night<.5){c.globalAlpha=.12*S.shimmer;c.strokeStyle='#ffffff';c.lineWidth=h*.004;for(let i=0;i<5;i++){const y=hz+h*(.05+.012*i);c.beginPath();for(let x=0;x<=w;x+=16)c.lineTo(x,y+Math.sin(x*.03+t*2+i)*h*.004);c.stroke()}c.globalAlpha=1}
}
function drawWater(c,w,h,S){const t=S.t,sf=S.surface*h;
  if(sf>0){const g=c.createLinearGradient(0,0,0,sf);g.addColorStop(0,S.sky[0]);g.addColorStop(1,S.sky[1]);c.fillStyle=g;c.fillRect(0,0,w,sf+2);
    // far bank with reeds and trees seen above the water line
    ridge(c,w,sf-h*.005,h*.05,2.2,mix(mix(S.bank,'#3a5a3a',.35),'#141c3c',S.night*.6),true);
    if(S.snow>.3){c.globalAlpha=S.snow*.8;ridge(c,w,sf+h*.004,h*.022,5.2,'#eef3f6');c.globalAlpha=1}}
  const g=c.createLinearGradient(0,sf,0,h);S.water.forEach((k,i)=>g.addColorStop(i/2,mix(k,'#0a1230',S.night*.5)));c.fillStyle=g;c.fillRect(0,sf,w,h-sf);
  if(S.rays>.05&&S.night<.6){c.save();c.beginPath();c.rect(0,sf,w,h-sf);c.clip();c.globalAlpha=.1*S.rays*(1-S.night);c.fillStyle='#ffffff';for(let i=0;i<6;i++){const x=w*(.08+i*.17)+Math.sin(t*.3+i)*w*.02;c.beginPath();c.moveTo(x,sf);c.lineTo(x+w*.07,sf);c.lineTo(x-w*.05,h);c.lineTo(x-w*.16,h);c.closePath();c.fill()}c.restore()}
  // surface
  if(sf>0){if(S.ice>.05){c.globalAlpha=clamp(S.ice,0,1);fill(c,'#eef4f7',p=>{p.rect(0,sf-h*.012,w,h*.03)});c.fillStyle='#c9dbe4';for(let i=0;i<9;i++){const x=(i*.123+.05)%1*w;c.fillRect(x,sf+h*.018,w*.07,h*.006)}c.strokeStyle='#b7ccd6';c.lineWidth=1;for(let i=0;i<7;i++){const x=(i*.151+.02)%1*w;c.beginPath();c.moveTo(x,sf-h*.01);c.lineTo(x+w*.02,sf+h*.004);c.lineTo(x+w*.012,sf+h*.016);c.stroke()}c.globalAlpha=1}
    c.strokeStyle='rgba(255,255,255,'+(.55*(1-S.ice))+')';c.lineWidth=h*.006;c.beginPath();for(let x=0;x<=w;x+=10)c.lineTo(x,sf+Math.sin(x*.03+t*1.6)*h*.004*(1+S.storm));c.stroke()}
  else{c.globalAlpha=.3+.2*S.storm;c.strokeStyle='#ffffff';c.lineWidth=h*.008;for(let j=0;j<2;j++){c.beginPath();for(let x=0;x<=w;x+=10)c.lineTo(x,h*(.012+.02*j)+Math.sin(x*.02+t*(1.2+S.storm)+j*2)*h*.008*(1+S.storm));c.stroke()}c.globalAlpha=1}
  // far bed and sea floor
  ridge(c,w,h*.86,h*.06,2,mix(mix(S.water[2],S.floor[1],.25),'#0a1230',S.night*.5));
  ridge(c,w,h*.915,h*.045,5,mix(S.floor[0],'#0a1230',S.night*.5));
  c.globalAlpha=.25;const Rn=rng(23);for(let i=0;i<26;i++){fill(c,S.floor[1],p=>ell(p,Rn()*w,h*(.93+Rn()*.06),(4+Rn()*14)*h/520,(1.5+Rn()*3)*h/520))}c.globalAlpha=1;
}
/* ---------- scattered details ---------- */
const CACHE={};
function items(bk){if(CACHE[bk])return CACHE[bk];const Rn=rng(bk.length*131+bk.charCodeAt(1));const L=[];
  const T={tundra:[['snow',.3],['rock',.2],['tuft',.32],['flower',.18]],desert:[['rock',.22],['cactus',.14],['bush',.34],['sandwave',.3]],forest:[['tree',.22],['fern',.34],['mushroom',.1],['log',.07],['rock',.09],['flower',.18]],
    grassland:[['tuft',.62],['acacia',.11],['mound',.08],['rock',.07],['flower',.12]],ocean:[['kelp',.5],['rock',.22],['star',.14],['shell',.14]],freshwater:[['weed',.46],['reed',.2],['rock',.18],['lily',.16]]}[bk];
  const n=bk==='grassland'?60:bk==='forest'?46:48;
  for(let i=0;i<n;i++){let r=Rn(),type=T[0][0];for(const[k,p]of T){if(r<p){type=k;break}r-=p}
    let z=Rn();if(type==='acacia')z=Rn()*.5;if(type==='tree')z=.02+Rn()*.62;if(type==='cactus')z=Rn()*.7;
    L.push({type,x:Rn(),z,r:Rn(),q:Rn(),i})}
  L.sort((a,b)=>a.z-b.z);return CACHE[bk]=L}
function snowCap(c,S,x,y,rx,ry){if(S.snow>.4){c.globalAlpha=clamp((S.snow-.4)*2.5,0,1);fill(c,'#ffffff',p=>ell(p,x,y,rx,ry));c.globalAlpha=1}}
function drawItem(c,d,w,h,S){const t=S.t,land=!S.water,x=d.x*w,y=land?yOf(d.z,h):h*(.92+d.z*.07),s=land?scOf(d.z,h):(.6+.5*d.z)*h/520;const dk=k=>mix(k,'#141c3c',S.night*.5);
  switch(d.type){
  case'snow':{const a=clamp(S.snow*1.6-.05,0,1)*(S.snow>.95?.0:1);if(a<=0||S.snow>.93)break;c.globalAlpha=a;fill(c,'#d5e1ea',p=>ell(p,x,y+3*s,60*s*(.6+d.r),9*s));fill(c,'#ffffff',p=>ell(p,x,y,58*s*(.6+d.r),8*s));c.globalAlpha=1;break}
  case'sandwave':{c.globalAlpha=.5;fill(c,mix(S.groundS[0],'#ffffff',.35),p=>ell(p,x,y,90*s*(.5+d.r),6*s));fill(c,mix(S.groundS[1],'#7a5a30',.3),p=>ell(p,x+8*s,y+5*s,80*s*(.5+d.r),4*s));c.globalAlpha=1;break}
  case'rock':{const k=.7+d.r*.9,col=dk(land?(S.bk==='desert'?'#b98a5c':S.bk==='forest'?'#7c8478':'#7d8a94'):mix('#6f7f86',S.floor[1],.4));
    fill(c,col,p=>smooth(p,[[x-16*s*k,y],[x-11*s*k,y-12*s*k],[x+5*s*k,y-15*s*k],[x+16*s*k,y-5*s*k],[x+15*s*k,y]],true));fill(c,mix(col,'#ffffff',.22),p=>ell(p,x-3*s*k,y-10*s*k,7*s*k,3*s*k));
    if(land)snowCap(c,S,x-1*s*k,y-13*s*k,11*s*k,4*s*k);if(S.bk==='forest'&&S.snow<.4)fill(c,dk(mix(S.grass,'#3f6a36',.4)),p=>ell(p,x-5*s*k,y-13*s*k,7*s*k,2.6*s*k));break}
  case'tuft':{const n=S.bk==='grassland'?4:3,len=(S.bk==='grassland'?34:20)*(1-.35*S.snow)*(1-.3*S.fire);c.strokeStyle=dk(d.r>.5?mix(S.grass,'#3a3010',.18):S.grass);c.lineWidth=(S.bk==='grassland'?2:1.6)*s;c.lineCap='round';
    for(let i=-n;i<=n;i++){c.beginPath();c.moveTo(x+i*3*s,y);c.quadraticCurveTo(x+i*5*s,y-len*.55*s,x+i*(S.bk==='grassland'?9:7)*s+Math.sin(t*1.3+d.x*9)*3*s,y-(len-Math.abs(i)*len*.12)*s);c.stroke()}
    if(S.snow>.6)snowCap(c,S,x,y,14*s,3.5*s);break}
  case'flower':{const a=clamp(S.flowers,0,1)*(1-S.snow);if(a<.08)break;c.globalAlpha=a;const cols=['#f4d04a','#ee7fb0','#ffffff','#b58be0'];for(let i=0;i<5;i++){const fx=x+(i-2)*7*s+Math.sin(d.r*9+i)*4*s,fy=y-(8+((i*7)%5)*2)*s;c.strokeStyle=dk(mix(S.grass,'#3f6a36',.3));c.lineWidth=1.3*s;c.beginPath();c.moveTo(fx,y);c.lineTo(fx,fy);c.stroke();fill(c,dk(cols[(i+d.i)%4]),p=>ell(p,fx,fy,2.8*s,2.8*s))}c.globalAlpha=1;break}
  case'bush':{const a=clamp(S.shrub,0,1),k=.7+d.r*.7;c.strokeStyle=dk('#8a6a44');c.lineWidth=1.8*s;c.lineCap='round';for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(x,y);c.lineTo(x+i*8*s*k,y-(16-Math.abs(i)*3)*s*k);c.stroke()}
    if(a>.15){c.globalAlpha=clamp(a*1.2,0,1);const col=dk(mix('#b0a070',S.grass,a));fill(c,col,p=>{for(let i=-2;i<=2;i++)ell(p,x+i*8*s*k,y-(16-Math.abs(i)*3)*s*k,6*s*k,4.5*s*k)});c.globalAlpha=1}break}
  case'cactus':{const k=.8+d.r*.8,col=dk(mix('#5f8f4e','#8a8f5a',S.dry*.6)),hi=dk('#7fae66'),H=64*s*k,W=13*s*k;
    fill(c,col,p=>{p.roundRect(x-W/2,y-H,W,H,W/2);p.roundRect(x-W*1.9,y-H*.62,W*.8,H*.3,W*.4);p.rect(x-W*1.9+W*.1,y-H*.4,W*1.6,W*.7);p.roundRect(x+W*1.1,y-H*.8,W*.8,H*.34,W*.4);p.rect(x+W*.2,y-H*.56,W*1.5,W*.7)});
    c.strokeStyle=hi;c.lineWidth=1.4*s;c.beginPath();c.moveTo(x-W*.15,y-H*.92);c.lineTo(x-W*.15,y-4*s);c.moveTo(x+W*.2,y-H*.9);c.lineTo(x+W*.2,y-4*s);c.stroke();
    if(S.flowers>.3){fill(c,'#f4a0c0',p=>ell(p,x,y-H,3.5*s*k,2.5*s*k))}break}
  case'mound':{const col=dk(mix('#b98a4a',S.groundS[1],.3));fill(c,col,p=>smooth(p,[[x-15*s,y],[x-8*s,y-26*s],[x+2*s,y-33*s],[x+12*s,y-12*s],[x+16*s,y]],true));fill(c,mix(col,'#ffffff',.2),p=>ell(p,x-4*s,y-20*s,4*s,8*s,.3));break}
  case'acacia':{const th=118*s,tr=dk(mix('#6d4d2a','#2a201a',S.fire*.7)),la=clamp(S.leafAmt,0,1);
    fill(c,tr,p=>{p.moveTo(x-5*s,y);p.lineTo(x-2.5*s,y-th*.68);p.lineTo(x-30*s,y-th*.95);p.lineTo(x-26*s,y-th);p.lineTo(x,y-th*.8);p.lineTo(x+26*s,y-th);p.lineTo(x+31*s,y-th*.95);p.lineTo(x+3.5*s,y-th*.68);p.lineTo(x+6*s,y);p.closePath()});
    if(la>.08){c.globalAlpha=clamp(la*1.4,0,1);fill(c,dk(mix(S.leaf,'#33402a',.25)),p=>ell(p,x,y-th*1.01,68*s*(.7+.3*la),14*s));fill(c,dk(mix(S.leaf,'#d9e08a',.2)),p=>ell(p,x-8*s,y-th*1.07,48*s*(.7+.3*la),8*s));c.globalAlpha=1}break}
  case'tree':{const k=.8+d.r*.7,tw=20*s*k,H=h*1.2,tr=dk(mix(mix('#6a4c34','#8a8f96',d.q*.3),'#241a15',S.fire*.7)),la=clamp(S.leafAmt,0,1);
    fill(c,tr,p=>{p.moveTo(x-tw*.75,y);p.quadraticCurveTo(x-tw*.5,y-30*s,x-tw*.42,y-H);p.lineTo(x+tw*.42,y-H);p.quadraticCurveTo(x+tw*.5,y-30*s,x+tw*.8,y);p.closePath()});
    fill(c,mix(tr,'#000000',.22),p=>{p.moveTo(x+tw*.1,y-H);p.lineTo(x+tw*.42,y-H);p.quadraticCurveTo(x+tw*.5,y-30*s,x+tw*.8,y);p.lineTo(x+tw*.3,y);p.quadraticCurveTo(x+tw*.12,y-40*s,x+tw*.1,y-H);p.closePath()});
    // low branch with a clump of leaves
    const by=y-(150+90*d.q)*s,dir=d.q>.5?1:-1;c.strokeStyle=tr;c.lineWidth=5*s*k;c.lineCap='round';c.beginPath();c.moveTo(x,by+20*s);c.quadraticCurveTo(x+dir*30*s,by+6*s,x+dir*62*s,by-6*s);c.stroke();
    if(la>.08){c.globalAlpha=clamp(la*1.3,0,1);const lc=dk(mix(S.leaf,d.q>.5?'#2f4a2a':'#f0d060',.14));fill(c,lc,p=>{ell(p,x+dir*62*s,by-10*s,34*s,20*s);ell(p,x+dir*38*s,by-18*s,26*s,16*s);ell(p,x+dir*84*s,by-2*s,22*s,14*s)});fill(c,mix(lc,'#ffffff',.14),p=>ell(p,x+dir*56*s,by-20*s,18*s,8*s));c.globalAlpha=1}
    if(S.snow>.4){snowCap(c,S,x+dir*50*s,by-6*s,30*s,4*s);snowCap(c,S,x,y,tw*1.3,4*s)}break}
  case'fern':{const a=1-.75*S.snow,col=dk(mix(S.grass,'#2f5a2c',.35));if(a<.2){snowCap(c,S,x,y,16*s,4*s);break}c.strokeStyle=col;c.lineCap='round';
    for(let i=-2;i<=2;i++){const ex=x+i*13*s*a+Math.sin(t+d.x*8)*2*s,ey=y-(26-Math.abs(i)*6)*s*a;c.lineWidth=1.6*s;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+i*5*s,y-18*s*a,ex,ey);c.stroke();
      c.lineWidth=3.2*s;c.setLineDash([2.2*s,2.6*s]);c.beginPath();c.moveTo(x+i*2*s,y-5*s);c.quadraticCurveTo(x+i*5*s,y-18*s*a,ex,ey);c.stroke();c.setLineDash([])}break}
  case'mushroom':{if(S.snow>.5||S.fire>.4)break;fill(c,dk('#efe6d2'),p=>p.roundRect(x-2*s,y-9*s,4*s,9*s,1.5*s));fill(c,dk(d.r>.5?'#c8553a':'#b98a4a'),p=>{p.moveTo(x-8*s,y-8*s);p.quadraticCurveTo(x,y-20*s,x+8*s,y-8*s);p.closePath()});break}
  case'log':{const col=dk('#7a5a3c');fill(c,col,p=>p.roundRect(x-34*s,y-12*s,68*s,13*s,6*s));fill(c,dk('#c9a878'),p=>ell(p,x+33*s,y-5.5*s,4*s,6.5*s));fill(c,dk('#9a7450'),p=>ell(p,x+33*s,y-5.5*s,2*s,3.4*s));
    if(S.snow<.4)fill(c,dk(mix(S.grass,'#3f6a36',.4)),p=>ell(p,x-8*s,y-12*s,16*s,2.6*s));snowCap(c,S,x,y-12*s,32*s,3.5*s);break}
  case'kelp':case'weed':{const a=clamp(S.weedAmt,0,1);if(d.q>a+.15)break;const len=h*(d.type==='kelp'?.18+.34*d.r:.1+.24*d.r)*(.5+.5*a),sw=S.sway,col=mix(mix(S.weed,d.r>.5?'#2f6a4a':'#6fae5a',.25),'#0a1230',S.night*.5);
    c.strokeStyle=col;c.lineWidth=h*(d.type==='kelp'?.013:.008);c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x,y);const pts=[];
    for(let i=1;i<=7;i++){const px=x+Math.sin(t*.9*Math.sqrt(sw)+d.x*20+i*.7)*len*.06*sw*i/3,py=y-len*i/7;pts.push([px,py]);c.lineTo(px,py)}c.stroke();
    c.fillStyle=col;pts.forEach((q,i)=>{if(i%2===d.i%2)return;const dir=i%4<2?1:-1;c.beginPath();c.ellipse(q[0]+dir*h*.014,q[1],h*(d.type==='kelp'?.02:.014),h*.006,dir*.5,0,TAU);c.fill()});break}
  case'reed':{const top=S.surface*h-h*(.04+.06*d.r),col=mix(mix(S.bank,'#4a6a3a',.4),'#0a1230',S.night*.5);c.strokeStyle=col;c.lineWidth=h*.007;c.lineCap='round';
    for(let i=0;i<3;i++){const bx=x+(i-1)*h*.016,sw=Math.sin(t*.8+d.x*9+i)*h*.008;c.beginPath();c.moveTo(bx,y);c.quadraticCurveTo(bx+sw*.3,(y+top)/2,bx+sw,top+i*h*.02);c.stroke();if(i===1&&S.ice<.6)fill(c,mix('#6a4a30','#0a1230',S.night*.5),p=>p.roundRect(bx+sw-h*.006,top+i*h*.02-h*.02,h*.012,h*.035,h*.006))}break}
  case'lily':{const a=clamp(S.lily,0,1);if(a<.1||S.ice>.5)break;const sy=S.surface*h+h*.004,lx=x+Math.sin(t*.4+d.x*7)*h*.006;c.globalAlpha=a;c.strokeStyle=mix(S.weed,'#2f5a3a',.4);c.lineWidth=h*.004;c.beginPath();c.moveTo(x+h*.02,y);c.quadraticCurveTo(x-h*.03,(y+sy)/2,lx,sy);c.stroke();
    fill(c,mix(mix('#5fa04e',S.bank,.4),'#0a1230',S.night*.5),p=>ell(p,lx,sy,h*(.03+.02*d.r),h*.008));if(d.r>.5&&S.lily>.8)fill(c,'#f6c6d8',p=>{ell(p,lx,sy-h*.012,h*.01,h*.008);ell(p,lx-h*.009,sy-h*.008,h*.007,h*.005);ell(p,lx+h*.009,sy-h*.008,h*.007,h*.005)});c.globalAlpha=1;break}
  case'star':{const col=mix(d.r>.5?'#e8834a':'#c9567a','#0a1230',S.night*.5),r=7*s;c.fillStyle=col;c.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU+d.r,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.6)}c.closePath();c.fill();break}
  case'shell':{const col=mix('#f1e4cf','#0a1230',S.night*.5);fill(c,col,p=>{p.moveTo(x-6*s,y);p.quadraticCurveTo(x,y-11*s,x+6*s,y);p.closePath()});c.strokeStyle=mix('#c9a888','#0a1230',S.night*.5);c.lineWidth=.8*s;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x,y);c.lineTo(x+i*3*s,y-6*s);c.stroke()}break}
  }
}
function deco(c,w,h,o,S){S=S||state(o);return items(S.bk).map(d=>({z:d.z,d,draw(){drawItem(c,d,w,h,S)}}))}
/* ---------- in front of the animals ---------- */
const frac=x=>x-Math.floor(x);
function front(c,w,h,o,S){S=S||state(o);const t=S.t,land=!S.water,k=h/520;
  if(S.flood>0&&land){const y0=lerp(h*1.02,hzOf(h)+h*.1,S.flood);c.globalAlpha=.5;const g=c.createLinearGradient(0,y0,0,h);g.addColorStop(0,'#7fa9cf');g.addColorStop(1,'#4f7fb3');c.fillStyle=g;c.fillRect(0,y0,w,h-y0);c.globalAlpha=.5;c.strokeStyle='#ffffff';c.lineWidth=1.5*k;
    for(let i=0;i<14;i++){const y=y0+(h-y0)*frac(i*.37+.1),x=frac(i*.61+t*.02)*w,L=(30+40*frac(i*.77))*k;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+L/2,y-3*k,x+L,y);c.stroke()}c.globalAlpha=1}
  // weather
  S.falls.forEach(([type,am])=>{if(am<.03)return;const n=Math.round(am*(type==='rain'?110:type==='leaves'?26:80));
    for(let i=0;i<n;i++){const a=frac(i*.6180339),b=frac(i*.7548776+.3),sz=.5+frac(i*.37);
      if(type==='snow'||type==='ash'){const x=frac(a+t*.012*sz+Math.sin(t*.6+i)*.004)*w,y=frac(b+t*(.03+.04*sz))*h;c.fillStyle=type==='snow'?'rgba(255,255,255,.9)':'rgba(90,86,82,.75)';c.beginPath();c.arc(x,y,1.5*sz*k*1.3,0,TAU);c.fill()}
      else if(type==='rain'){const x=frac(a-t*.12)*w*1.1,y=frac(b+t*(1.1+.5*sz))*h;c.strokeStyle='rgba(215,232,246,.5)';c.lineWidth=1.2*k;c.beginPath();c.moveTo(x,y);c.lineTo(x-5*k,y+16*k);c.stroke()}
      else if(type==='dust'){const x=frac(a+t*(.03+.03*sz))*w,y=h*(.4+.6*b)+Math.sin(t+i)*4*k;c.fillStyle='rgba(255,236,190,.42)';c.beginPath();c.arc(x,y,1.3*sz*k*1.4,0,TAU);c.fill()}
      else if(type==='leaves'){const x=frac(a+t*.02+Math.sin(t*.9+i)*.02)*w,y=frac(b+t*(.05+.03*sz))*h;c.save();c.translate(x,y);c.rotate(t*1.5+i);c.fillStyle=['#dc8a32','#c8553a','#e6b84a'][i%3];c.beginPath();c.ellipse(0,0,5*k*sz,2.4*k*sz,0,0,TAU);c.fill();c.restore()}}});
  if(S.water){for(let i=0;i<34;i++){const a=frac(i*.6180339),b=frac(i*.7548776),sz=.5+frac(i*.37);const y=h-frac(b+t*(.03+.03*sz)*(1+S.storm))*(h*(1-S.surface))-2,x=a*w+Math.sin(t+i)*4*k;c.globalAlpha=.35;c.strokeStyle='#ffffff';c.lineWidth=1;c.beginPath();c.arc(x,y,(1.5+sz*2)*k,0,TAU);c.stroke()}c.globalAlpha=1;
    if(S.leaves>.2&&S.surface){for(let i=0;i<9;i++){const x=frac(i*.173+t*.004)*w,y=S.surface*h+1;c.fillStyle=['#dc8a32','#c8553a','#e6b84a'][i%3];c.globalAlpha=S.leaves;c.beginPath();c.ellipse(x,y,6*k,2*k,0,0,TAU);c.fill()}c.globalAlpha=1}}
  if(S.fire>0&&land){for(let i=0;i<7;i++){const x=frac(i*.31+.1)*w+Math.sin(t*.4+i)*20*k,y0=hzOf(h)+h*.05;for(let j=0;j<5;j++){const u=frac(t*.12+j*.2+i*.13);c.globalAlpha=S.fire*.34*(1-u);fill(c,'#4a4442',p=>ell(p,x+u*60*k+Math.sin(u*6+i)*14*k,y0-u*h*.42,(26+70*u)*k,(18+44*u)*k))}}
    for(let i=0;i<40;i++){const u=frac(t*(.2+.2*frac(i*.37))+i*.21);c.globalAlpha=S.fire*(1-u);c.fillStyle=i%2?'#ffb040':'#ff6a2a';c.beginPath();c.arc(frac(i*.618+u*.05)*w,h*(.95-u*.6),1.6*k,0,TAU);c.fill()}c.globalAlpha=1}
  // foreground fringe
  if(land){const Rf=rng(4),col=mix(S.foreS,'#10183a',S.night*.6);c.fillStyle=col;const n=S.bk==='desert'?12:34;
    for(let i=0;i<n;i++){const x=Rf()*w,hh=h*(.05+.1*Rf())*(1-.4*S.snow)*(1-.4*S.fire),sw=Math.sin(t*1.1+i)*h*.006;c.beginPath();c.moveTo(x-h*.006,h);c.quadraticCurveTo(x+sw,h-hh*.6,x+sw*2+h*.01,h-hh);c.quadraticCurveTo(x+sw+h*.004,h-hh*.5,x+h*.008,h);c.closePath();c.fill()}
    if(S.trees){const la=clamp(S.leafAmt,0,1),lc=mix(mix(S.leaf,'#1f3a22',.4),'#10183a',S.night*.6),Rt=rng(12);
      c.strokeStyle=mix('#4a3626','#10183a',S.night*.6);c.lineCap='round';for(let i=0;i<7;i++){const x=(i+.5)/7*w+Rt()*40*k;c.lineWidth=(5+Rt()*4)*k;c.beginPath();c.moveTo(x,-10);c.quadraticCurveTo(x+30*k,20*k,x+(Rt()-.5)*120*k,(40+Rt()*30)*k);c.stroke()}
      if(la>.06){c.globalAlpha=clamp(la*1.3,0,1);c.fillStyle=lc;const Rl=rng(13);for(let i=0;i<26;i++){const x=Rl()*w,r=(34+Rl()*40)*k;c.beginPath();c.ellipse(x,(-6+Rl()*26)*k+Math.sin(t*.7+i)*2*k,r,r*.55,0,0,TAU);c.fill()}c.globalAlpha=1}}}
  else{const col=mix(mix(S.floor[1],'#22323a',.6),'#0a1230',S.night*.5);fill(c,col,p=>{smooth(p,[[-20,h+10],[-10,h*.9],[w*.06,h*.86],[w*.13,h*.93],[w*.16,h+10]],true);smooth(p,[[w*.84,h+10],[w*.88,h*.92],[w*.95,h*.87],[w+10,h*.9],[w+20,h+10]],true)})}
  if(S.ash>0){c.globalAlpha=S.ash*.22;c.fillStyle='#55504c';c.fillRect(0,0,w,h);c.globalAlpha=1}
  if(S.night>0){c.save();c.globalCompositeOperation='multiply';c.fillStyle=mix('#ffffff','#39468a',S.night);c.fillRect(0,0,w,h);c.restore()}
}
const info=id=>({id,name:B[id].name,seasons:B[id].seasons,harsh:B[id].harsh,water:!!B[id].water,surface:B[id].surface||0});
window.Biomes={ids,info,state,draw,deco,front,yOf,scOf,horizon:hzOf};
})();
