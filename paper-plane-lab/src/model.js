/* ===== MODEL: flight physics, IV config, hidden flaws ===== */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(r){let u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}

const CD0BASE=0.07,RHO=1.2,G=9.81,LAUNCH_H=1.6,NMAX=1.25;
const DESIGNS={
  'Dart':        {b:8, L:30,k:.5, CL:.45,dm:.38,wob:1.0},
  'Classic':     {b:10,L:28,k:.5, CL:.55,dm:1.0,wob:1.0},
  'Wide glider': {b:16,L:20,k:.7, CL:.75,dm:2.3,wob:1.0},
  'Stunt plane': {b:14,L:16,k:.6, CL:.40,dm:3.0,wob:1.7},
  'Nakamura lock':{b:9,L:26,k:.55,CL:.50,dm:.50,wob:.8},
  'Hammerhead':  {b:12,L:22,k:.6, CL:.60,dm:1.4,wob:1.1},
  'Delta wing':  {b:14,L:24,k:.5, CL:.50,dm:1.1,wob:1.2}};
const PAPERS={
  'Printer paper':{m:1.0,cl:1.0, dm:1.0, wob:1.0,col:'#f7f7f2',name:'Printer paper (80 gsm)'},
  'Newspaper':    {m:.62,cl:.92,dm:1.45,wob:1.4,col:'#cfcfc9',name:'Newspaper'},
  'Thin card':    {m:2.2,cl:1.0,dm:.85, wob:1.0,col:'#d9b98a',name:'Thin card'},
  'Baking paper': {m:.5, cl:.85,dm:1.9, wob:1.6,col:'#efe6cf',name:'Baking paper'},
  'Tissue paper': {m:.3, cl:.75,dm:2.4, wob:2.0,col:'#fbe3ee',name:'Tissue paper'},
  'Magazine paper':{m:1.3,cl:1.0,dm:.9,  wob:1.0,col:'#e3eaf6',name:'Magazine paper'}};
const TIPS={
  'Folded up':  {cl:.96,dm:1.35,wob:.7},
  'Flat':       {cl:1.0,dm:1.0, wob:1.0},
  'Folded down':{cl:1.04,dm:1.1,wob:1.9},
  'One up, one down':{cl:.9,dm:1.3,wob:2.4}};
const CLIPPOS={'No clip':0,'Nose':1,'Middle':.35,'Tail':-.7};

/* every plane setting; the student changes ONE (the independent variable) */
const DEFAULTS={span:10,clips:1,angle:15,speed:6.5,design:'Classic',paper:'Printer paper',tips:'Flat',clippos:'Nose'};
const IVS={
 span:{type:'num',label:'Wingspan',lower:'wingspan',unit:'cm',vals:[6,8,10,12,14,16],setting:'span'},
 clips:{type:'num',label:'Number of paper clips on the nose',lower:'number of paper clips on the nose',unit:'clips',vals:[0,1,2,3,4,5],setting:'clips'},
 angle:{type:'num',label:'Launch angle',lower:'launch angle',unit:'°',vals:[-10,0,10,20,30,40,50],setting:'angle'},
 speed:{type:'num',label:'Throw speed',lower:'throw speed',unit:'m/s',vals:[3,4,5,6,7,8,9],setting:'speed'},
 design:{type:'cat',label:'Plane design',lower:'plane design',cats:['Dart','Classic','Wide glider','Stunt plane','Nakamura lock','Hammerhead','Delta wing'],setting:'design'},
 paper:{type:'cat',label:'Type of paper',lower:'type of paper',cats:['Printer paper','Newspaper','Thin card','Baking paper','Tissue paper','Magazine paper'],setting:'paper'},
 tips:{type:'cat',label:'Wing tips',lower:'wing tips',cats:['Folded up','Flat','Folded down','One up, one down'],setting:'tips'},
 clippos:{type:'cat',label:'Where the paper clip is',lower:'position of the paper clip',cats:['No clip','Nose','Middle','Tail'],setting:'clippos'}
};
const SETTING_LABEL={span:'Wingspan',clips:'Number of paper clips',angle:'Launch angle',speed:'Throw speed',design:'Plane design',paper:'Type of paper',tips:'Wing tips',clippos:'Position of the paper clip'};
function settingText(k,v){return k==='span'?v+' cm':k==='angle'?v+'°':k==='speed'?v+' m/s':k==='clips'?v+(v==1?' clip':' clips'):String(v)}

/* settings for one plane: control values everywhere except the IV */
function makeSettings(ivKey,ivVal,base){const s=Object.assign({},DEFAULTS,base||{});if(ivKey)s[IVS[ivKey].setting]=ivVal;
  if(ivKey==='clippos'){s.clips=ivVal==='No clip'?0:Math.max(1,s.clips||1)}
  if(ivKey==='span')s.design='Classic';
  return s}

/* physical parameters from settings, plus hidden build error */
function planeParams(s,fold){
  const d=DESIGNS[s.design],p=PAPERS[s.paper],t=TIPS[s.tips];
  const b=s.design==='Classic'?s.span:d.b;
  const L=d.L,S=d.k*b*L/10000; /* m^2 */
  /* paper mass: more paper = heavier (wingspan is changed by trimming, so mass changes too) */
  const sheet=(3.7+0.13*b)*p.m; /* g */
  const clipN=s.clippos==='No clip'?0:s.clips; const clipG=clipN*0.5; /* each clip ~0.5 g */
  const mass=(sheet+clipG)/1000;
  const cg=(s.clippos==='No clip'?0:s.clips*CLIPPOS[s.clippos]);
  const q=Math.exp(-Math.pow((cg-0.9)/1.4,2)); /* pitch balance: 1 = well balanced */
  const wob=d.wob*p.wob*t.wob*(0.8+0.6*(1-q));
  const CL=d.CL*p.cl*t.cl*(0.3+0.7*q)*(1+(fold?fold.cl:0));
  const CD0=CD0BASE*d.dm*p.dm*t.dm*(1+(fold?fold.cd:0));
  const AR=b*b/10000/S; const k=1/(Math.PI*.7*AR);
  return {b,L,S,mass,CL,CD0,k,q,wob,cg,clipG,sheet,AR};
}

/* Fly one plane. Lift balances weight until the wing stalls (CL cannot go above its maximum).
   Returns the whole path so the screen can animate it. */
function flyPlane(P,launch){
  let x=0,y=LAUNCH_H,th=launch.angle*Math.PI/180;
  let vx=launch.v*Math.cos(th),vy=launch.v*Math.sin(th);
  const W=P.mass*G,dt=0.004,path=[],w=launch.wind;
  let t=0,maxH=y;
  while(t<14){
    if(path.length===0||Math.round(t/dt)%5===0)path.push([t,x,y,Math.atan2(vy,vx)]);
    const ax=vx-w,ay=vy,V=Math.max(.3,Math.hypot(ax,ay)),ex=ax/V,ey=ay/V;
    const q=.5*RHO*V*V*P.S;
    let clMax=P.CL; if(launch.dive&&t<launch.diveT)clMax*=launch.diveF;
    /* lift grows with speed (q) up to a gentle pull-up limit; below the stall speed the plane sinks */
    const Lcap=NMAX*W*Math.max(.35,ex);
    let L=Math.min(q*clMax,Lcap); const cl=L/q;
    const D=q*(P.CD0+P.k*cl*cl);
    const fx=(-D*ex+L*(-ey))/P.mass, fy=(-D*ey+L*ex)/P.mass-G;
    vx+=fx*dt;vy+=fy*dt; const nx=x+vx*dt,ny=y+vy*dt;
    if(ny<=0){const f=y/(y-ny);x=x+(nx-x)*f;t+=dt*f;y=0;path.push([t,x,0,Math.atan2(vy,vx)]);
      const slide=Math.max(0,vx)*(launch.grass?0.012:0.05); return {path,dist:(x+slide),time:t,landX:x+slide,maxH}}
    x=nx;y=ny;t+=dt;if(y>maxH)maxH=y;
  }
  return {path,dist:x,time:t,landX:x,maxH};
}

/* hidden air movement (m/s, + = pushes towards the far end).
   Inside: a slow, gentle draft from a vent. Outside: stronger wind with gusts that change every flight. */
function draftAt(seed,n,env){
  const ph=(seed%97)/97*6.283, ph2=(seed%53)/53*6.283;
  if(env==='outside'){
    const r=mulberry32(seed*17+n*389+3);
    const w=.3+.8*Math.sin(2*Math.PI*n/9+ph)+gauss(r)*.95;
    return Math.max(-1.8,Math.min(2.2,w));
  }
  const w=.30*Math.sin(2*Math.PI*n/11+ph)+.10*Math.sin(2*Math.PI*n/4.3+ph2)+.05;
  return Math.max(-.5,Math.min(.5,w));
}
/* hidden build error for each plane (imperfect folds) */
function foldError(seed,idx,wob){const r=mulberry32(seed*7+idx*131+5);return{cl:gauss(r)*.05*wob,cd:gauss(r)*.08*wob}}
/* hidden launch noise for one launch */
function launchNoise(seed,n,s,P,launcher){
  const r=mulberry32(seed*13+n*977+11),k=launcher?.3:1;
  const vErr=gauss(r)*.035*Math.sqrt(P.wob)*k, aErr=gauss(r)*1.2*Math.sqrt(P.wob)*k;
  const out=r()<(.06+.03*(P.wob-1))*(launcher?.5:1);
  const delay=1.1+r()*1.5; /* random wait before release so timing needs real reactions */
  return {vErr,aErr,out,delay,diveF:.12,diveT:.75};
}
function doLaunch(seed,n,s,P,env,launcher){
  const nz=launchNoise(seed,n,s,P,launcher),wind=draftAt(seed,n,env);
  const launch={v:s.speed*(1+nz.vErr),angle:s.angle+nz.aErr,wind,dive:nz.out,diveF:nz.diveF,diveT:nz.diveT,grass:env==='outside'};
  const fl=flyPlane(P,launch);
  return {fl,nz,wind,launch};
}
if(typeof module!=='undefined')module.exports={IVS,DEFAULTS,makeSettings,planeParams,doLaunch,flyPlane,foldError,draftAt,DESIGNS,PAPERS,mulberry32,gauss};
