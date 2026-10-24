/* ===== LAB: flight simulator (explore + fair test), stopwatch, tape, results table ===== */
const LAB={state:'idle',raf:0,res:null,tRel:0,tWaitStart:0,delay:0,cam:-1.4,sw:{start:null,stop:null},cell:'',note:'',pend:null,px:0,py:1.6,pa:0};
const SC=96,FLOOR=372,CVW=1280,CVH=470,TAPE_N=960;
const isExplore=()=>S.step==='observe';
const curEnv=()=>isExplore()?S.exp.env:S.env;
const curLaunch=()=>isExplore()?S.exp.launch:S.launch;
function labSettings(lv){return makeSettings(S.iv,lv,S.design)}
function curSettings(){if(isExplore())return makeSettings(null,null,S.exp);if(!S.iv||S.labLevel==null)return null;return labSettings(S.labLevel)}
function labPlane(lv){
  const key=String(lv),s=labSettings(lv);
  if(!S.planes[key]){const idx=S.levels.indexOf(lv),P0=planeParams(s,null);S.planes[key]={fold:foldError(S.seed,idx+1,P0.wob)};save()}
  return planeParams(s,S.planes[key].fold);
}
function nextLabLevel(){const c=S.levels.find(lv=>fvals(lv).length<3);return c===undefined?null:c}
function ensureLabLevel(){if(S.labLevel==null||!S.levels.includes(S.labLevel)){const n=nextLabLevel();S.labLevel=n!=null?n:S.levels[0]}}
const swTimed=()=>(LAB.sw.start!=null&&LAB.sw.stop!=null)?Math.round((LAB.sw.stop-LAB.sw.start)/10)/100:null;

/* ---------- launching ---------- */
function labLaunch(){
  if(LAB.state==='wait'||LAB.state==='flying')return;
  if(isExplore()){
    S.expN++;const s=makeSettings(null,null,S.exp),P0=planeParams(s,null),P=planeParams(s,foldError(S.seed+77,S.expN,P0.wob));
    LAB.res=doLaunch(S.seed+500,S.expN,s,P,S.exp.env,S.exp.launch==='launcher');LAB.pend={explore:true};
  }else{
    if(LAB.state!=='idle'||S.labLevel==null||fvals(S.labLevel).length>=3)return;
    S.fc++;const n=S.fc,lv=S.labLevel,s=labSettings(lv),P=labPlane(lv),power=bandPower(n);
    LAB.res=doLaunch(S.seed,n,power<1?Object.assign({},s,{speed:s.speed*power}):s,P,S.env,S.launch==='launcher');LAB.pend={n,lv,s,P,power};
  }
  LAB.state='wait';LAB.tWaitStart=performance.now();LAB.delay=LAB.res.nz.delay*1000;
  if(timingNeeded())LAB.delay=3000+((LAB.res.nz.delay*1000)%180); /* 3, 2, 1, go, then release within a fraction of a second */
  LAB.sw={start:null,stop:null};LAB.cell='';LAB.note='';LAB.comment=null;LAB.noted=false;LAB.cam=-1.4;LAB.px=0;LAB.py=1.6;LAB.pa=0;
  save();labPanels();
}
function labSkip(){if(LAB.state!=='flying'&&LAB.state!=='wait')return;if(!isExplore()&&S.dv==='time')return;if(LAB.state==='wait')LAB.tRel=performance.now();LAB.sw={start:null,stop:null};labLand(true)}
function labLand(){
  const f=LAB.res.fl;LAB.px=f.landX;LAB.py=0;LAB.cam=Math.max(-1.4,f.landX-9.3);LAB.tLand=LAB.tRel+f.time*1000;
  if(isExplore()){LAB.state='idle';S.expLog=(S.expLog||[]).concat([{n:S.expN,s:Object.assign({},S.exp)}]).slice(-30);save();labPanels();if(typeof softStatus==='function')softStatus();
    const ok=S.expN>=3,b=$('#obsnext'),m=$('#obsmsg');if(b)b.disabled=!ok;if(m)m.textContent=ok?'':`Throw at least 3 planes first (${S.expN} so far).`;return}
  LAB.state='landed';{const r=mulberry32(S.seed+LAB.pend.n*7);LAB.tapeWin=Math.floor((f.landX*100-20-r()*55)/10)*10}
  LAB.noted=false;LAB.comment=throwerComment(hidFor(LAB.pend,LAB.res),LAB.pend.lv);
  LAB.cell='';labPanels();
}
function labAgain(){
  if(isExplore()||!LAB.pend||LAB.pend.explore)return;
  if(LAB.state!=='landed'&&LAB.state!=='flying'&&LAB.state!=='wait')return;
  S.flights.push({n:LAB.pend.n,lv:LAB.pend.lv,gone:true,why:'thrown again by student',hid:hidFor(LAB.pend,LAB.res)});
  LAB.state='idle';LAB.res=null;LAB.pend=null;save();labPanels();goFlight();
}
function hidFor(p,res){
  const sw=LAB.sw;
  return{trueDist:Math.round(res.fl.dist*1000)/10,trueTime:Math.round(res.fl.time*1000)/1000,wind:Math.round(res.wind*1000)/1000,
   vSet:p.s.speed,vAct:Math.round(res.launch.v*100)/100,aSet:p.s.angle,aAct:Math.round(res.launch.angle*10)/10,dive:!!res.nz.out,
   foldCL:Math.round((S.planes[String(p.lv)].fold.cl)*1000)/10,foldCD:Math.round((S.planes[String(p.lv)].fold.cd)*1000)/10,
   mass:Math.round(p.P.mass*10000)/10,power:Math.round((p.power||1)*1000)/1000,sw:swTimed(),startLag:sw.start!=null&&LAB.tRel?Math.round(sw.start-LAB.tRel):null,
   stopLag:sw.stop!=null&&LAB.tLand?Math.round(sw.stop-LAB.tLand):null}
}
/* the value a student should have typed for the flight on screen */
function cellTarget(){if(!LAB.res)return null;return S.dv==='dist'?LAB.res.fl.landX*100:swTimed()}
function cellVal(){const v=parseFloat(LAB.cell);return isFinite(v)?v:null}
function cellOK(){const v=cellVal(),t=cellTarget();if(v==null||t==null)return false;return S.dv==='dist'?Math.abs(v-t)<=5:Math.abs(v-t)<=0.011}
function cellClose(){const v=cellVal(),t=cellTarget();if(v==null||t==null)return false;return S.dv==='dist'?Math.abs(v-t)<=15:Math.abs(v-t)<=0.05}
function recordBlocked(){if(LAB.state!=='landed')return true;if(S.dv==='time'&&swTimed()==null)return true;if(cellVal()==null)return true;return false}
function labRecord(){
  if(recordBlocked())return;
  const p=LAB.pend,trial=fvals(p.lv).length+1,v=cellVal(),sw=swTimed();
  S.flights.push({n:p.n,lv:p.lv,trial,read:S.dv==='dist'?v:null,timed:S.dv==='time'?v:sw,note:LAB.note,comment:LAB.comment,gone:false,hid:hidFor(p,LAB.res)});
  S.a['tr.'+String(p.lv)+'.'+(trial-1)]=String(v);
  LAB.state='idle';LAB.res=null;LAB.pend=null;LAB.cell='';LAB.comment=null;
  if(fvals(S.labLevel).length>=3){const n=nextLabLevel();if(n!=null)S.labLevel=n}
  save();labPanels();updateChrome();goFlight();
}
function labUndo(){
  const L=live();if(!L.length||LAB.state!=='idle')return;
  const f=L[L.length-1];f.gone=true;f.why='removed by student';delete S.a['tr.'+String(f.lv)+'.'+(f.trial-1)];S.labLevel=f.lv;save();labPanels();updateChrome();
}
function labPickLevel(v){if(LAB.state!=='idle')return;S.labLevel=IVS[S.iv].type==='num'?Number(v):v;save();labPanels()}
/* is a launch control (angle/speed) different from earlier recorded flights? */
function ctlDrift(k){if(!S.iv||IVS[S.iv].setting===k)return false;const L=live();if(!L.length)return false;const f=L[0].hid[k==='angle'?'aSet':'vSet'];return S.design[k]!==f}
function unfairFlights(){const L=live();if(L.length<2)return[];const o=[];['angle','speed'].forEach(k=>{if(IVS[S.iv].setting===k)return;const vals=new Set(L.map(f=>f.hid[k==='angle'?'aSet':'vSet']));if(vals.size>1)o.push(k)});return o}

/* ---------- stopwatch ---------- */
function swToggle(){if(LAB.state==='idle')return;const now=performance.now();if(LAB.sw.start==null)LAB.sw.start=now;else if(LAB.sw.stop==null){LAB.sw.stop=now;
    if(!isExplore()&&S.dv==='time'&&!LAB.comment&&LAB.tLand&&LAB.tRel){const lag=(LAB.state==='landed'?now-LAB.tLand:-1),st=LAB.sw.start-LAB.tRel;
      if(LAB.state!=='landed')LAB.comment={t:'I stopped the stopwatch before the plane landed!',k:'timer'};else if(lag>280||st>280)LAB.comment={t:'I think I was a bit slow pressing the stopwatch.',k:'timer'}}}
  labPanels(true)}
function swReset(){LAB.sw={start:null,stop:null};labPanels(true)}
function swText(){const sw=LAB.sw;if(sw.start==null)return'0.00';return Math.max(0,((sw.stop!=null?sw.stop:performance.now())-sw.start)/1000).toFixed(2)}

/* ---------- drawing ---------- */
function planeSprite(c,x,y,ang,col){
  c.save();c.translate(x,y);c.rotate(-ang);c.scale(1.35,1.35);
  c.fillStyle=col||'#f7f7f2';c.strokeStyle='#4a5565';c.lineWidth=1.5;
  c.beginPath();c.moveTo(22,0);c.lineTo(-16,-4);c.lineTo(-10,0);c.lineTo(-16,5);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(22,0);c.lineTo(-10,0);c.stroke();c.restore();
}
function drawSim(){
  const cv=$('#sim');if(!cv)return;const c=cv.getContext('2d'),now=performance.now();
  const sx=x=>(x-LAB.cam)*SC;
  const out=curEnv()==='outside';
  if(out){
    let g=c.createLinearGradient(0,0,0,FLOOR);g.addColorStop(0,'#8ec5ea');g.addColorStop(1,'#dff0fa');c.fillStyle=g;c.fillRect(0,0,CVW,CVH);
    c.fillStyle='rgba(255,255,255,.85)';for(const [cx0,cy0] of [[1.5,70],[6.5,50],[11,90]]){const X=sx(cx0)-LAB.cam*0;c.beginPath();c.ellipse(X,cy0,70,22,0,0,7);c.ellipse(X+50,cy0-12,50,20,0,0,7);c.fill()}
    for(const tx of [4.5,9.8]){const X=sx(tx);c.fillStyle='#7a5532';c.fillRect(X-8,FLOOR-150,16,150);c.fillStyle='#4f9a4a';c.beginPath();c.arc(X,FLOOR-175,58,0,7);c.arc(X-40,FLOOR-140,40,0,7);c.arc(X+40,FLOOR-140,40,0,7);c.fill()}
    c.fillStyle='#6db35e';c.fillRect(0,FLOOR,CVW,CVH-FLOOR);
    c.strokeStyle='rgba(40,90,40,.35)';c.lineWidth=2;for(let i=0;i<CVW;i+=14){c.beginPath();c.moveTo(i,FLOOR+34);c.lineTo(i+3,FLOOR+26);c.stroke()}
  }else{
    let g=c.createLinearGradient(0,0,0,FLOOR);g.addColorStop(0,'#dbe6f0');g.addColorStop(1,'#f1f5f9');c.fillStyle=g;c.fillRect(0,0,CVW,CVH);
    c.fillStyle='#cdb084';c.fillRect(0,FLOOR,CVW,CVH-FLOOR);
    c.strokeStyle='rgba(120,90,50,.25)';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.moveTo(0,FLOOR+40+i*18);c.lineTo(CVW,FLOOR+40+i*18);c.stroke()}
    for(const wx of [3.2,8.6]){const X=sx(wx);c.fillStyle='#bcd8ec';c.fillRect(X,70,2.1*SC,140);c.strokeStyle='#8fa6b8';c.lineWidth=4;c.strokeRect(X,70,2.1*SC,140);c.beginPath();c.moveTo(X+1.05*SC,70);c.lineTo(X+1.05*SC,210);c.moveTo(X,140);c.lineTo(X+2.1*SC,140);c.stroke()}
  }
  /* tape measure */
  const x0=LAB.cam,x1=LAB.cam+CVW/SC;
  c.fillStyle='#f4e08a';c.fillRect(0,FLOOR,CVW,30);c.strokeStyle='#8a7a2a';c.lineWidth=1;c.strokeRect(-1,FLOOR,CVW+2,30);
  c.fillStyle='#4a3f10';c.font='bold 13px system-ui,sans-serif';c.textAlign='center';
  for(let cm=Math.ceil(x0*100/10)*10;cm<=x1*100;cm+=10){
    const X=sx(cm/100),big=cm%100===0,mid=cm%50===0;c.beginPath();c.moveTo(X,FLOOR);c.lineTo(X,FLOOR+(big?18:mid?12:7));c.stroke();
    if(big&&cm>=0)c.fillText(String(cm),X,FLOOR+28);
  }
  c.textAlign='left';c.font='bold 13px system-ui,sans-serif';c.fillText('cm',6,FLOOR+28);
  /* person */
  if(curLaunch()!=='launcher'){const px0=sx(-0.55);c.fillStyle='#51607a';c.beginPath();c.roundRect(px0-16,FLOOR-132,34,96,12);c.fill();
  c.fillStyle='#e9c3a0';c.beginPath();c.arc(px0,FLOOR-150,16,0,7);c.fill();
  c.fillStyle='#2f3b50';c.fillRect(px0-12,FLOOR-40,10,40);c.fillRect(px0+3,FLOOR-40,10,40);
  c.strokeStyle='#e9c3a0';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(px0+8,FLOOR-112);c.lineTo(sx(0)-6,FLOOR-LAUNCH_H*SC+2);c.stroke();c.lineCap='butt';}
  /* air movement clue: a streamer under a vent inside, a flag on a pole outside (nothing on screen explains it) */
  const w=LAB.res?LAB.res.wind:(isExplore()?draftAt(S.seed+500,S.expN+1,curEnv()):draftAt(S.seed,S.fc+1,S.env));
  if(out){
    const fx=sx(-1.0);c.strokeStyle='#5d6670';c.lineWidth=5;c.beginPath();c.moveTo(fx,FLOOR);c.lineTo(fx,FLOOR-250);c.stroke();
    const k=Math.max(-1,Math.min(1,w/1.5)),len=24+Math.abs(k)*58,dir=k>=0?1:-1;
    c.fillStyle='#d6402f';c.beginPath();c.moveTo(fx,FLOOR-250);
    for(let i=0;i<=8;i++){const t=i/8;c.lineTo(fx+dir*len*t,FLOOR-250+Math.sin(now/180+t*5)*4*(0.3+Math.abs(k))+ (1-Math.abs(k))*t*30)}
    for(let i=8;i>=0;i--){const t=i/8;c.lineTo(fx+dir*len*t,FLOOR-218+Math.sin(now/180+t*5)*4*(0.3+Math.abs(k))+(1-Math.abs(k))*t*30-t*10)}
    c.closePath();c.fill();
  }else{
    const vx=sx(-0.1);c.fillStyle='#9aa7b4';c.fillRect(vx-26,0,52,12);c.strokeStyle='#7d8a97';c.lineWidth=1;for(let i=-18;i<=18;i+=9){c.beginPath();c.moveTo(vx+i,2);c.lineTo(vx+i,10);c.stroke()}
    let ax=vx,ay=12;c.strokeStyle='#d6402f';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(ax,ay);
    const base=Math.max(-1,Math.min(1,w/.5))*1.1;
    for(let i=1;i<=6;i++){const a=base*(0.35+i*.12)+Math.sin(now/260+i*.9)*.09*(0.4+Math.abs(w)*3);ax+=Math.sin(a)*13;ay+=Math.cos(a)*13;c.lineTo(ax,ay)}c.stroke();c.lineCap='butt';
  }
  /* launcher */
  if(curLaunch()==='launcher'){const px0=sx(-1.15);c.fillStyle='#51607a';c.beginPath();c.roundRect(px0-16,FLOOR-132,34,96,12);c.fill();c.fillStyle='#e9c3a0';c.beginPath();c.arc(px0,FLOOR-150,16,0,7);c.fill();c.fillStyle='#2f3b50';c.fillRect(px0-12,FLOOR-40,10,40);c.fillRect(px0+3,FLOOR-40,10,40);c.strokeStyle='#e9c3a0';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(px0-14,FLOOR-118);c.lineTo(px0-20,FLOOR-66);c.moveTo(px0+16,FLOOR-118);c.lineTo(px0+22,FLOOR-66);c.stroke();c.lineCap='butt'}
  if(curLaunch()==='launcher'){const X=sx(0);c.fillStyle='#8b6a43';c.fillRect(X-40,FLOOR-LAUNCH_H*SC+10,10,LAUNCH_H*SC-10);c.fillRect(X-60,FLOOR-LAUNCH_H*SC+8,70,10);c.strokeStyle='#c0392b';c.lineWidth=3;c.beginPath();c.moveTo(X-58,FLOOR-LAUNCH_H*SC+6);c.lineTo(X+6,FLOOR-LAUNCH_H*SC+6);c.stroke()}
  /* animate */
  if(LAB.state==='wait'){
    LAB.px=0;LAB.py=1.6;LAB.pa=.26;
    if(now-LAB.tWaitStart>=LAB.delay){LAB.state='flying';LAB.tRel=now;LAB.msg='';labPanels(true)}
  }
  if(LAB.state==='flying'){
    const tt=(now-LAB.tRel)/1000,f=LAB.res.fl,path=f.path;
    if(tt>=f.time){labLand(false)}
    else{let i=Math.min(path.length-2,Math.floor(tt/0.02));const a=path[i],b=path[i+1],u=(tt-a[0])/Math.max(1e-6,(b[0]-a[0]));
      LAB.px=a[1]+(b[1]-a[1])*u;LAB.py=a[2]+(b[2]-a[2])*u;LAB.pa=a[3]+(b[3]-a[3])*u;
      LAB.cam=Math.max(-1.4,LAB.px-9.2)}
  }
  /* plane */
  const cs=curSettings(),col=cs?PAPERS[cs.paper].col:'#f7f7f2';
  if(LAB.state==='idle'&&cs){ /* aim arrow: direction = launch angle, length = throw speed */
    const a=cs.angle*Math.PI/180,L=30+cs.speed*16,X0=sx(0)+10,Y0=FLOOR-LAUNCH_H*SC;
    c.strokeStyle='rgba(194,112,12,.85)';c.lineWidth=4;c.setLineDash([8,6]);c.beginPath();c.moveTo(X0,Y0);c.lineTo(X0+Math.cos(a)*L,Y0-Math.sin(a)*L);c.stroke();c.setLineDash([]);
    c.fillStyle='rgba(194,112,12,.9)';c.beginPath();const hx=X0+Math.cos(a)*L,hy=Y0-Math.sin(a)*L;c.moveTo(hx,hy);c.lineTo(hx-Math.cos(a-.4)*14,hy+Math.sin(a-.4)*14);c.lineTo(hx-Math.cos(a+.4)*14,hy+Math.sin(a+.4)*14);c.fill();
    c.font='bold 15px system-ui,sans-serif';c.textAlign='left';c.fillText(`${cs.angle}° · ${cs.speed} m/s`,hx+8,hy-6)}
  if((LAB.state==='idle'&&!LAB.res)||LAB.state==='wait'){planeSprite(c,sx(0)+4,FLOOR-LAUNCH_H*SC-2,cs?cs.angle*Math.PI/180:.26,col)}
  else{planeSprite(c,sx(LAB.px),FLOOR-LAB.py*SC-2,LAB.pa,col)}
  /* landing marker */
  if(LAB.state==='landed'||(LAB.state==='idle'&&LAB.res)){
    const X=sx(LAB.res.fl.landX);c.fillStyle='#d6402f';c.beginPath();c.moveTo(X,FLOOR+1);c.lineTo(X-7,FLOOR-11);c.lineTo(X+7,FLOOR-11);c.closePath();c.fill()}
  /* message */
  const m=$('#simmsg');if(m){let t='';
    if(LAB.state==='idle')t=isExplore()?(LAB.res?'Change something and throw again!':'Set your throw and press Launch'):S.labLevel==null?'':'Press Launch';
    else if(LAB.state==='wait'){if(timingNeeded()){const rem=LAB.delay-(now-LAB.tWaitStart);t=rem>2180?'3…':rem>1180?'2…':rem>180?'1…':'Go! Press Start'}else t='Get ready…'}
    else if(LAB.state==='flying')t=timingNeeded()?(LAB.sw.start==null?'Press Start!':'Press Stop when it lands!'):'';
    else if(LAB.state==='landed')t=isExplore()?'':swRunning()?'Landed. Stop the stopwatch!':S.dv==='time'?(LAB.sw.stop==null?'Landed. Stop the stopwatch!':'Landed.'):'Landed. Now read the tape.';
    m.textContent=t;m.style.display=t?'':'none'}
}
function drawTape(){
  const cv=$('#tape');if(!cv||LAB.state!=='landed'||!LAB.res)return;const c=cv.getContext('2d');
  const W=cv.width,H=cv.height,pxcm=W/100,x0=LAB.tapeWin;
  c.fillStyle='#e9f0f6';c.fillRect(0,0,W,H);
  c.fillStyle=S.env==='outside'?'#6db35e':'#cdb084';c.fillRect(0,74,W,H-74);
  c.fillStyle='#f4e08a';c.fillRect(0,74,W,46);c.strokeStyle='#8a7a2a';c.lineWidth=1.5;c.strokeRect(0,74,W,46);
  c.fillStyle='#4a3f10';c.font='bold 18px system-ui,sans-serif';c.textAlign='center';
  /* same marks as the big tape: long every 100 cm, medium every 50 cm, short every 10 cm.
     Every 10 cm mark has a number, so there are always several numbers to work out the gaps from. */
  for(let cm=x0;cm<=x0+100;cm+=10){const X=(cm-x0)*pxcm,big=cm%100===0,mid=cm%50===0;c.beginPath();c.moveTo(X,74);c.lineTo(X,74+(big?34:mid?24:14));c.stroke();
    if(X>48&&X<W-30){c.font=(big?'bold 19px ':mid?'bold 17px ':'15px ')+'system-ui,sans-serif';c.fillText(String(cm),X,116)}}
  c.font='bold 18px system-ui,sans-serif';
  c.textAlign='left';c.fillText('cm',6,116);
  const nx=(LAB.res.fl.landX*100-x0)*pxcm;
  c.save();c.translate(nx,72);c.fillStyle='#f7f7f2';c.strokeStyle='#4a5565';c.lineWidth=2;
  c.beginPath();c.moveTo(0,0);c.lineTo(-170,-26);c.lineTo(-160,0);c.closePath();c.fill();c.stroke();
  c.setLineDash([4,4]);c.strokeStyle='#d6402f';c.beginPath();c.moveTo(0,0);c.lineTo(0,120);c.stroke();c.setLineDash([]);c.restore();
}
function labLoop(){LAB.raf=requestAnimationFrame(labLoop);if(!$('#sim')){cancelAnimationFrame(LAB.raf);LAB.raf=0;return}drawSim();const d=$('#swd');if(d)d.textContent=swText()}
function labStart(){if(!LAB.raf)LAB.raf=requestAnimationFrame(labLoop)}
function labStop(){cancelAnimationFrame(LAB.raf);LAB.raf=0}
/* ---------- plane picture (top view) ---------- */
/* fold (optional) = the hidden fold error of a hand-folded plane; it is drawn as small, visible lop-sidedness */
function planeSVG(s,P,fold,opt={}){
  const col=PAPERS[s.paper].col,half=Math.min(92,P.b*5.6),noseY=12,tailY=noseY+Math.min(200,P.L*6.3),tipY=tailY-16,notchY=tailY-44;
  const dark=s.tips==='Folded up'?'#9db3c9':s.tips==='Folded down'?'#d9b7b0':col;
  let aw=0,ct=0,ty=0;if(fold){const cl=Math.max(-16,Math.min(16,fold.cl*320));aw=Math.abs(cl)<5?(cl<0?-5:5):cl;ct=Math.max(-9,Math.min(9,fold.cd*140));ct=Math.abs(ct)<3?(ct<0?-3:3):ct;ty=Math.round(aw*.6)}
  const hl=half-aw,hr=half+aw,nx=110,bx=110+ct;
  let svg=`<svg class="planesvg" viewBox="0 0 220 ${opt.mini?215:230}" role="img" aria-label="Top view of your plane">`;
  svg+=`<path d="M${nx} ${noseY} L${110+hr} ${tipY+ty} L${bx} ${notchY} L${110-hl} ${tipY-ty} Z" fill="${col}" stroke="#4a5565" stroke-width="2"/>`;
  svg+=`<path d="M${nx} ${noseY} L${bx} ${notchY}" stroke="#4a5565" stroke-width="1.5" fill="none"/>`;
  if(fold)svg+=`<path d="M110 ${noseY-4} L110 ${notchY+14}" stroke="#c2700c" stroke-width="1.2" stroke-dasharray="4 4" fill="none"/>`;
  if(s.paper==='Newspaper')for(let i=0;i<6;i++)svg+=`<path d="M${110-half*.5} ${noseY+50+i*10} L${110+half*.5} ${noseY+50+i*10}" stroke="#8a8a85" stroke-width="1.2" opacity=".6"/>`;
  if(s.tips!=='Flat'){const t=12;svg+=`<path d="M${110+half} ${tipY} L${110+half-t} ${tipY-t*1.4} L${110+half-t*1.6} ${tipY+2} Z" fill="${dark}" stroke="#4a5565" stroke-width="1.5"/><path d="M${110-half} ${tipY} L${110-half+t} ${tipY-t*1.4} L${110-half+t*1.6} ${tipY+2} Z" fill="${dark}" stroke="#4a5565" stroke-width="1.5"/>`}
  const n=s.clippos==='No clip'?0:s.clips;const cy=s.clippos==='Nose'?noseY+34:s.clippos==='Middle'?(noseY+notchY)/2:notchY-6;
  for(let i=0;i<Math.min(n,5);i++)svg+=`<rect x="102" y="${cy-i*7}" width="16" height="6" rx="2" fill="#b9c2cc" stroke="#6b7684"/>`;
  if(!opt.mini)svg+=`<text x="110" y="226" text-anchor="middle" font-size="11" fill="#5a6878">wingspan ${P.b} cm</text>`;svg+=`</svg>`;
  return svg;
}


/* ---------- panels ---------- */
const EXP_KEYS=['design','span','paper','tips','clippos','clips'];
function launchCtlHTML(){
  const ex=isExplore(),busy=LAB.state==='wait'||LAB.state==='flying',cs=curSettings();
  const row=(k,label,min,max,step,unit)=>{
    const lockedIV=!ex&&S.iv&&IVS[S.iv].setting===k,val=lockedIV?(cs?cs[k]:''):(ex?S.exp[k]:S.design[k]);
    const warn=!ex&&helped()&&ctlDrift(k);
    return`<div style="display:grid;grid-template-columns:120px 1fr 90px;gap:10px;align-items:center;margin:4px 0"><b>${label}</b>
      <input type="range" data-launchset="${k}" min="${min}" max="${max}" step="${step}" value="${val}" ${lockedIV||busy?'disabled':''} aria-label="${label}">
      <span class="reading" style="font-size:18px" id="ls-${k}">${val}${unit}</span></div>
      ${lockedIV?`<p class="note" style="margin:0 0 4px 130px">This is what you are testing, so it changes with each ${IVS[S.iv].type==='num'?'value':'type'} you pick.</p>`:''}
      ${warn?`<div class="fb mid">You changed the ${label.toLowerCase()} after you started testing. Change it back to ${live()[0].hid[k==='angle'?'aSet':'vSet']}${unit} to keep your test fair.</div>`:''}`};
  return`<div class="panel"><h4>Your throw</h4>${row('angle','Launch angle',-10,50,5,'°')}${row('speed','Throw speed',3,9,0.5,' m/s')}
    <p class="note" style="margin-top:4px">The dashed arrow shows the direction and strength of your throw.</p></div>`;
}
function simPanelHTML(){
  const st=LAB.state,ex=isExplore(),lv=S.labLevel,dvT=!ex&&S.dv==='time';
  const full=!ex&&lv!=null&&fvals(lv).length>=3;
  return`<div class="panel"><h4>Flight view</h4><div class="simwrap"><canvas id="sim" class="cv" width="${CVW}" height="${CVH}" aria-label="Side view of the paper plane flight"></canvas><div class="simmsg" id="simmsg"></div>${bubbleHTML()}</div>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;align-items:center">
    <button class="btn primary big" data-act="lab:launch" ${(ex?(st==='wait'||st==='flying'):(st!=='idle'||lv==null||full))?'disabled':''}>▶ Launch plane</button>
    ${!dvT?`<button class="btn" data-act="lab:skip" ${st==='wait'||st==='flying'?'':'disabled'}>Skip the animation</button>`:''}
    ${!ex?`<button class="btn" data-act="lab:again" ${st==='landed'||st==='flying'||st==='wait'?'':'disabled'}>${S.launch==='launcher'?'Launch':'Throw'} again (do not record this one)</button>`:''}
    ${full&&st==='idle'?'<span class="note">This one has 3 trials. Pick another in your table.</span>':''}</div>
   ${!ex&&st==='landed'&&!(timingNeeded()&&LAB.sw.stop==null)&&!swRunning()?`<button class="btn primary big gotable" data-act="lab:table">📋 ${S.dv==='dist'?'Read the tape and fill in my table':'Write my time in my table'} ↓</button>`:''}</div>`;
}
function stopwatchHTML(need){
  const can=LAB.state==='wait'||LAB.state==='flying'||LAB.state==='landed',hot=need&&!isExplore()&&can&&LAB.sw.stop==null;
  return`<div class="panel ${hot?'swhot':''}" id="swpanel"><h4>Stopwatch ${need?'(you need this one)':'(optional)'}</h4><div class="stopw"><div class="swd" id="swd">${swText()}</div>
    <button class="btn primary ${hot?'big':''}" data-act="lab:swtoggle" ${can?'':'disabled'}>${LAB.sw.start==null?'▶ Start':LAB.sw.stop==null?'■ Stop':'Stopped'}</button>
    <button class="btn" data-act="lab:swreset" ${can?'':'disabled'}>Reset</button>
    <span class="note">Press <b>Start</b> when the plane leaves the ${S.launch==='launcher'&&!isExplore()?'launcher':'hand'} and <b>Stop</b> when it lands. The space bar works too.</span></div></div>`;
}
function tapeInner(){return`<p class="note" style="margin:0 0 6px">The red dashed line shows where the nose of the plane touched the ground. The numbers on the tape are in cm, with a mark every 10 cm. Read the tape and <b>estimate the last digit</b>.</p><canvas id="tape" class="cv" width="${TAPE_N}" height="128" aria-label="Zoomed tape measure" style="margin-bottom:8px"></canvas>`}
function tapePanelHTML(){
  return`<div class="panel"><h4>Read the tape${S.dv==='time'?' (optional)':''}</h4>
    <p class="note" style="margin-bottom:6px">The red dashed line shows where the nose of the plane touched the ground. The numbers on the tape are in cm, with a mark every 10 cm. Read the tape and <b>estimate the last digit</b>.${S.dv==='dist'?' Type your reading into your results table.':''}</p>
    <canvas id="tape" class="cv" width="${TAPE_N}" height="128" aria-label="Zoomed tape measure"></canvas></div>`;
}
function cellFb(){
  return''; /* students are never told whether a reading is accurate; the final report flags it */
  if(!helped()||LAB.cell.trim()==='')return'';
  if(cellOK())return'<div class="fb ok">That reading looks right.</div>';
  if(!isDev())return'<div class="fb mid">Check your reading again.</div>';
  if(S.dv==='time')return'<div class="fb no">Copy the time from the stopwatch, with both decimal places.</div>';
  return cellClose()?'<div class="fb mid">Close. Count the 10 cm marks after the last number, then estimate how far past the mark the nose is.</div>':'<div class="fb no">Check again. Find the number before the red line, count the 10 cm marks, then estimate the last digit.</div>';
}
/* Table 1: built on the flight screen. mode 'lab' = students type into it; 'static' = read-only copy */
function table1HTML(mode){
  const lab=mode==='lab',c=cx(),st=levelStats();
  let h='';
  if(lab){
    h+=tip(['developing'],'Set up your table before you fly: give it a title and write the headings with units. Then type each measurement into the right box as you go.')+
      tip(['proficient'],'Give your table a title and headings with units. Type each measurement in as you go.')+
      nudge(['mastering'],'Check your notebook for how to set out a results table.');
    h+=helped()?frame('t1',T1()):`<div class="frame">Table 1: ${inp('t1.title','w2')}</div>`;
  }else h+=`<p style="margin:4px 0"><b>${esc(t1Title()||'Table 1: (no title yet)')}</b></p>`;
  const H=k=>lab?inp(k,'',isDev()?'name (units)':''):esc(A(k)||'—');
  h+=`<div style="overflow:auto;margin-top:6px"><table class="tb"><thead><tr><th class="l" rowspan="2">IV: ${H('t1.ivh')}</th><th colspan="3">DV: ${H('t1.dvh')}</th><th rowspan="2">Average<br>(${lab?inp('t1.avgu','',isDev()?'units':''):esc(A('t1.avgu')||'—')})</th></tr><tr><th>Trial 1</th><th>Trial 2</th><th>Trial 3</th></tr></thead><tbody>`;
  st.forEach(s=>{
    const fs=fvals(s.lk),cur=lab&&s.lk===S.labLevel;
    h+=`<tr class="${cur?'cur':''}"><td class="l">${lab?`<button class="chip ${cur?'sel':''}" data-act="lab:level" data-v="${esc(s.lk)}" ${LAB.state!=='idle'?'disabled':''} title="Test this one next">${esc(rowLabel(s.lk))}</button>`:`<b>${esc(rowLabel(s.lk))}</b>`}</td>`;
    for(let i=0;i<3;i++){
      const key='tr.'+String(s.lk)+'.'+i;
      if(fs[i])h+=`<td style="white-space:nowrap">${lab?`<input type="text" inputmode="decimal" data-bind="${esc(key)}" value="${esc(A(key))}" style="width:7.5ch;display:inline-block">`:esc(A(key)||'—')}</td>`;
      else if(lab&&cur&&LAB.state==='landed'&&i===fs.length)h+=`<td style="background:var(--warn-soft)"><input type="text" inputmode="decimal" id="cellin" value="${esc(LAB.cell)}" style="width:7.5ch;border-color:var(--accent);border-width:2px" aria-label="Type this measurement" autocomplete="off"></td>`;
      else h+=`<td><span class="note">${lab&&cur&&i===fs.length?'next':''}</span></td>`;
    }
    const ak='avg.'+String(s.lk);
    h+=`<td style="white-space:nowrap">${lab?(fs.length>=3?`<input type="text" inputmode="decimal" data-bind="${esc(ak)}" value="${esc(A(ak))}" style="width:8ch;display:inline-block">`:'<span class="note">after 3 trials</span>'):esc(A(ak)||'—')}</td></tr>`;
  });
  h+=`</tbody></table></div>`;
  if(lab&&helped()&&st.some(s=>fvals(s.lk).length>=3))h+=`<p class="note" style="margin-top:4px">${isDev()?'Average = add the three trials, then divide by 3. Use the calculator to help.':'Average = add the trials and divide by how many there are.'}</p>`;
  return h;
}
function labPanels(){
  const L=$('#labL'),R=$('#labR');if(!L||!R)return;
  if(isExplore()){L.innerHTML=simPanelHTML()+launchCtlHTML();R.innerHTML=exploreRightHTML();drawSim();return}
  const st=LAB.state,dvT=S.dv==='time';
  let left=simPanelHTML()+launchCtlHTML()+foldStripHTML();
  const s=S.labLevel!=null?labSettings(S.labLevel):null,P=S.labLevel!=null?labPlane(S.labLevel):null;
  let table=`<div class="panel" id="tablepanel" style="border-width:2px"><h4>Table 1: my results</h4>
    ${st==='landed'&&S.dv==='dist'?tapeInner():''}
    ${st==='landed'?`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">${S.dv==='time'?`<span class="swmirror">⏱ Your stopwatch reads <b>${swTimed()==null?'—':swText()} s</b></span>`:'<span></span>'}<button class="btn sm" data-act="lab:flight">⬆ Back to the flight view</button></div>`:''}
    ${st==='landed'?`<div class="fb mid" style="margin-top:0">${isDev()?`Type your ${dvT?'stopwatch time':'tape reading'} into the yellow box in your table.`:`Type your measurement into your table.`}</div>`:''}
    <div class="t1grid"><div style="min-width:0">${table1HTML('lab')}<div id="cellfb">${st==='landed'?cellFb():''}</div>
    ${st==='landed'?`<div style="margin-top:8px"><span class="lbl">My notes about this flight (optional)</span><input type="text" id="labnote" value="${esc(LAB.note)}" placeholder="${helped()?'Click “Add to my notes” when the thrower says something, or write your own.':'Write anything you noticed.'}"></div>
      <div class="decide ${recordBlocked()?'':'ready'}" id="decide"><b>Are you happy with this flight?</b>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><button class="btn good big" id="recbtn" data-act="lab:record" ${recordBlocked()?'disabled':''}>✓ Yes, record it</button><button class="btn big" data-act="lab:again">↺ No, ${S.launch==='launcher'?'launch':'throw'} it again</button></div>
        <p class="note" style="margin:6px 0 0" id="decidehint">${decideHint()}</p></div>`:''}
    ${live().length&&st==='idle'?`<div style="margin-top:8px"><button class="btn sm" data-act="lab:undo">Remove my last flight</button></div>`:''}</div>${calcHTML()}</div></div>`;
  let right=stopwatchHTML(dvT);
  if(s)right+=`<div class="panel"><h4>Your plane</h4><div style="display:grid;grid-template-columns:120px 1fr;gap:10px;align-items:center">${planeSVG(s,P,S.planes[String(S.labLevel)].fold)}
    <dl class="ctl-list">${Object.keys(SETTING_LABEL).filter(k=>!(k==='clips'&&s.clippos==='No clip')).map(k=>{const isIV=IVS[S.iv].setting===k;return`<dt class="${isIV?'iv':''}">${SETTING_LABEL[k]}</dt><dd class="${isIV?'iv':''}">${esc(settingText(k,s[k]))}${isIV?' (testing)':''}</dd>`}).join('')}
    <dt>Mass</dt><dd>⚖ ${fmt(P.mass*1000,1)} g</dd><dt>Where</dt><dd>${S.env==='outside'?'Outside':'Inside'}</dd><dt>Launch</dt><dd>${S.launch==='launcher'?'Launcher':'By hand'}</dd></dl></div></div>`;
  L.innerHTML=left;R.innerHTML=right;const T=$('#labT');if(T)T.innerHTML=table;
  labSumRefresh();const nb=$('#labnext'),msg=$('#labmsg');if(nb){msg.textContent=trialsDone()?'All flights are done. Go to your results.':`${flightsExpected()-live().length} flights to go.`}
  if(st==='landed'){drawTape();const ci=$('#cellin');if(ci){ci.oninput=()=>{LAB.cell=ci.value;$('#cellfb').innerHTML=cellFb();const rb=$('#recbtn');if(rb)rb.disabled=recordBlocked();const dc=$('#decide');if(dc)dc.classList.toggle('ready',!recordBlocked());const dh=$('#decidehint');if(dh)dh.textContent=decideHint()};if(document.activeElement===document.body&&!swRunning()&&(!timingNeeded()||LAB.sw.stop!=null))ci.focus({preventScroll:true})}
    const ln=$('#labnote');if(ln)ln.oninput=()=>{LAB.note=ln.value}}
  drawSim();
}
function exploreRightHTML(){
  const ex=S.exp,busy=LAB.state==='wait'||LAB.state==='flying';
  const opts={design:Object.keys(DESIGNS),span:[6,8,10,12,14,16],paper:Object.keys(PAPERS),tips:Object.keys(TIPS),clippos:['No clip','Nose','Middle','Tail'],clips:[1,2,3,4,5]};
  const rows=EXP_KEYS.filter(k=>!(k==='span'&&ex.design!=='Classic')&&!(k==='clips'&&ex.clippos==='No clip')).map(k=>`<label style="display:grid;grid-template-columns:140px 1fr;gap:8px;align-items:center;margin:4px 0"><span>${SETTING_LABEL[k]}</span><select data-exp="${k}" ${busy?'disabled':''}>${opts[k].map(o=>`<option value="${esc(o)}" ${String(ex[k])===String(o)?'selected':''}>${esc(settingText(k,o))}</option>`).join('')}</select></label>`).join('');
  const b=(act,k,label,cur)=>`<button class="chip ${cur===k?'sel':''}" data-act="${act}" data-k="${k}" ${busy?'disabled':''}>${label}</button>`;
  const s=makeSettings(null,null,ex),P=planeParams(s,null);
  return`<div class="panel"><h4>Your plane</h4><div style="display:grid;grid-template-columns:110px 1fr;gap:10px;align-items:start"><div>${planeSVG(s,P)}<p class="note" style="text-align:center;margin:0">⚖ ${fmt(P.mass*1000,1)} g</p></div><div>${rows}</div></div>
   <p style="margin:8px 0 4px"><b>Where</b></p><div class="chips">${b('exp-env','inside','Inside',ex.env)}${b('exp-env','outside','Outside',ex.env)}</div>
   <p style="margin:8px 0 4px"><b>Launch</b></p><div class="chips">${b('exp-launch','hand','By hand',ex.launch)}${b('exp-launch','launcher','Rubber band launcher',ex.launch)}</div>
   <p class="note" style="margin-top:10px">Throws so far: <b>${S.expN||0}</b>${(S.expN||0)<3?` (do at least 3)`:' ✓'}</p></div>`;
}
function labHTML(){
  const c=S.iv?cx():null;
  {const pr=labPrereqs();if(pr.length)return`<div class="card"><h2>5. Test flights</h2><p class="lead">Before you can fly, you need to finish a few things:</p>${prereqHTML(pr)}</div>`}
  ensureLabLevel();
  return`<div class="card"><h2>5. Test flights</h2>
   <p class="lead">Set your throw, then test each ${c.isNum?'value':'type'} three times. ${S.dv==='time'?'Time each flight with the stopwatch':'Read the tape where the nose of the plane lands'}, and type each measurement into your results table. ${helped()?'When the thrower says something about a flight, click <b>📝 Add to my notes</b>: your notes will help you in your evaluation.':'When the thrower notices something, click it to look behind the scenes, then write your own note: your notes will help you in your evaluation.'}</p>
   <div id="labsum"></div><div class="labgrid"><div class="labcol" id="labL"></div><div class="labcol" id="labR"></div></div>
   <div id="labT" style="margin-top:12px"></div>
   <div class="nav"><button class="btn" data-go="plan">← Plan</button><span class="msg" id="labmsg"></span><button class="btn primary" id="labnext" data-go="results">Go to results →</button></div></div>`;
}

/* close-up of every hand-folded plane: shows that the folds are not perfectly the same */
function foldStripHTML(){
  if(!S.levels.length)return'';
  const items=S.levels.map(lv=>{const s=labSettings(lv),P=labPlane(lv),f=S.planes[String(lv)].fold;return`<figure style="margin:0;text-align:center;width:118px">${planeSVG(s,P,f,{mini:1})}<figcaption class="note" style="line-height:1.3"><b>${esc(lvlLabel(S.iv,lv))}</b><br>⚖ ${fmt(P.mass*1000,1)} g</figcaption></figure>`}).join('');
  return`<div class="panel"><h4>Close-up: your folded planes</h4><p class="note" style="margin:0 0 6px">You folded each plane by hand. Look closely: the wings and the middle fold are not perfectly the same. The dashed line shows where a perfect middle fold would be. ⚖ shows the mass of each plane.</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${items}</div></div>`;
}
/* simple calculator for working out averages */
const CALC_KEYS=['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','(',')','C','⌫','+','='];
function calcHTML(){return`<div class="panel calcpanel"><h4>Calculator</h4><div class="calc"><div class="calcd" id="calcd" aria-live="polite">${esc(LAB.calc||'0')}</div><div class="calck">${CALC_KEYS.map(x=>`<button class="btn ${x==='='?'primary':/[÷×−+()]/.test(x)?'op':''}" data-act="calc" data-k="${x}">${x}</button>`).join('')}</div></div></div>`}
function calcKey(k){
  let t=LAB.calc||'';if(t==='Error')t='';
  if(LAB.calcDone&&/[0-9.(]/.test(k))t='';LAB.calcDone=false;
  if(k==='C')t='';else if(k==='⌫')t=t.slice(0,-1);
  else if(k==='='){const e=t.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');let v=NaN;if(/^[0-9.+\-*/() ]+$/.test(e)){try{v=Function('"use strict";return ('+e+')')()}catch(x){}}t=isFinite(v)?String(Math.round(v*10000)/10000):'Error';LAB.calcDone=true}
  else t+=k;
  LAB.calc=t;const d=$('#calcd');if(d)d.textContent=t||'0';
}

/* ---------- the thrower notices things (only what really happened) ---------- */
function groupMasses(){return S.levels.map(lv=>planeParams(labSettings(lv),null).mass*1000)}
function massVaries(){const m=groupMasses();return m.length>1&&(Math.max(...m)-Math.min(...m))/Math.min(...m)>0.08}
const MASS_NOTE=()=>massVaries()?' <b>Mass</b> is red because the planes do not all have the same mass, so two things changed at once.':'';
function flightSig(h,lv){
  const o={},first=live()[0];
  if(Math.abs(h.wind)>(S.env==='outside'?0.9:0.3))o.wind=true;
  const vExp=h.vSet*(h.power||1);if(Math.abs(h.vAct-vExp)/vExp>0.05)o.speed=true;
  if((h.power||1)<0.96)o.band=true;
  if(Math.abs(h.aAct-h.aSet)>2)o.angle=true;
  if(h.dive)o.dive=true;
  if(Math.abs(h.foldCL)>6)o.fold=true;
  if(massVaries())o.mass=true;
  if(first&&(first.hid.aSet!==h.aSet||first.hid.vSet!==h.vSet))o.ctl=true;
  if(S.dv==='time'&&h.sw!=null&&h.trueTime!=null&&Math.abs(h.sw-h.trueTime)>0.25)o.timer=true;
  return o;
}
function throwerComment(h,lv){
  const vExp=h.vSet*(h.power||1),g=flightSig(h,lv),firstOfPlane=fvals(lv).length===0,launcher=S.launch==='launcher',out=S.env==='outside';
  const prev=live().length?live()[live().length-1]:null;
  if(g.ctl)return{t:'Wait… did I change the launch angle or throw speed?',k:'ctl'};
  if(g.dive)return{t:'Hmm, it suddenly dived. I’m not sure why.',k:'dive'};
  if(launcher&&h.power<0.975&&!live().some(f=>f.comment&&f.comment.k==='band'))return{t:'The rubber band feels a bit looser now…',k:'band'};
  if(launcher&&h.power<0.945&&live().filter(f=>f.comment&&f.comment.k==='band').length===1)return{t:'The rubber band is much looser than it was at the start.',k:'band'};
  if(firstOfPlane&&g.fold)return{t:'This plane is folded a little differently from a perfect copy.',k:'fold'};
  if(firstOfPlane&&prev&&prev.lv!==lv&&Math.abs(h.mass-prev.hid.mass)/prev.hid.mass>0.05)return{t:`This plane feels ${h.mass>prev.hid.mass?'heavier':'lighter'} than the last one.`,k:'mass'};
  if(g.speed||g.angle){if(launcher)return{t:'The launcher fired that one a little differently.',k:'throw'};
    if(g.speed&&(!g.angle||Math.abs(h.vAct-vExp)/vExp>Math.abs(h.aAct-h.aSet)/40))return{t:h.vAct>h.vSet?'Oops, I threw that one harder than I meant to.':'That throw was a bit weak.',k:'throw'};
    return{t:h.aAct>h.aSet?'My arm went a bit high on that throw.':'My arm dipped a bit on that throw.',k:'throw'}}
  if(g.wind)return{t:h.wind>0?(out?'Whoa, a gust carried that one further!':'The air from the vent pushed that one further.'):(out?'The wind held that one back.':'The air from the vent held that one back.'),k:'wind'};
  return null;
}
function bubbleHTML(){
  if(isExplore()||LAB.state!=='landed'||!LAB.comment)return'';
  const who=S.launch==='launcher'?'Launcher operator':'Thrower';
  if(helped())return`<div class="bubble ${S.launch==='launcher'?'op':''}"><span class="who">🙋 ${who}:</span> “${esc(LAB.comment.t)}”<div style="margin-top:6px"><button class="btn sm ${LAB.noted?'':'primary'}" data-act="lab:addnote" ${LAB.noted?'disabled':''}>${LAB.noted?'✓ Added to my notes':'📝 Add to my notes'}</button></div></div>`;
  return`<div class="bubble ${S.launch==='launcher'?'op':''}"><span class="who">🙋 ${who}:</span> <button class="linkbtn" data-act="lab:peek">“Hmm, that one was different…” 🔍</button></div>`;
}
function labAddNote(){if(!LAB.comment||LAB.noted)return;LAB.note=(LAB.note.trim()?LAB.note.trim()+' ':'')+LAB.comment.t;LAB.noted=true;const n=$('#labnote');if(n)n.value=LAB.note;const L=$('#labL');if(L){const b=$('.bubble');if(b)b.outerHTML=bubbleHTML()}}
/* behind-the-scenes conditions for each flight (no real distance or time: that would give away the measurement) */
function peekHTML(){
  const rows=live().map(f=>({f,h:f.hid,cur:false}));
  if(LAB.pend&&LAB.res&&!LAB.pend.explore)rows.push({f:{n:LAB.pend.n,lv:LAB.pend.lv},h:hidFor(LAB.pend,LAB.res),cur:true});
  const red=(on,v)=>`<td style="${on?'background:#fbd9d3;color:#8f1d10;font-weight:700':''}">${v}</td>`;
  return`<h2>🔍 Behind the scenes: flight conditions</h2>
   <p>The lab secretly records the conditions of every flight. <b style="color:#b3301e">Red</b> means it had a big effect on that flight. Use this to write your own note about this flight.</p>
   <div style="overflow:auto"><table><thead><tr><th>Flight</th><th>${IVS[S.iv].type==='num'?'Value':'Type'}</th><th>Launch angle (set → real)</th><th>Throw speed, m/s (set → real)</th><th>${S.env==='outside'?'Wind':'Air movement'} (m/s)</th><th>Fold (extra lift)</th><th>Mass (g)</th>${S.launch==='launcher'?'<th>Launch power</th>':''}<th>Odd flight?</th></tr></thead><tbody>`+
   rows.map(({f,h,cur})=>{const g=flightSig(h,f.lv);return`<tr style="${cur?'outline:3px solid #c2700c':''}"><td>${f.n}${cur?' <b>(this one)</b>':''}</td><td>${esc(lvlLabel(S.iv,f.lv))}</td>${red(g.angle||g.ctl,`${h.aSet}° → ${h.aAct}°`)}${red(g.speed||g.ctl,`${h.vSet} → ${h.vAct}`)}${red(g.wind,(h.wind>0?'+':'')+h.wind.toFixed(2))}${red(g.fold,(h.foldCL>0?'+':'')+fmt(h.foldCL,1)+'%')}${red(g.mass,fmt(h.mass,1))}${S.launch==='launcher'?red(g.band,Math.round((h.power||1)*100)+'%'):''}${red(g.dive,h.dive?'nosedive':'')}</tr>`}).join('')+
   `</tbody></table></div><p class="note">Air movement: + pushed the plane towards the far end, – pushed against it. Fold: + means this plane gets a little more lift than a perfect copy.${MASS_NOTE()}</p>
   <div style="text-align:right"><button class="btn primary" data-act="closemodal">Back to my flight</button></div>`;
}

/* the rubber band slowly loses stretch: launch power falls a little with every launch */
function bandPower(n){return S.launch==='launcher'?Math.max(0.9,1-0.0065*(n-1)):1}

const timingNeeded=()=>!isExplore()&&S.dv==='time';
const swRunning=()=>LAB.sw.start!=null&&LAB.sw.stop==null;
function goFlight(){const l=$('#labL');if(l)l.scrollIntoView({behavior:'smooth',block:'start'})}
function goTable(){if(swRunning())return;const tp=$('#tablepanel');if(tp)tp.scrollIntoView({behavior:'smooth',block:'start'});const ci=$('#cellin');if(ci)setTimeout(()=>ci.focus({preventScroll:true}),400)}
function decideHint(){return(S.dv==='time'&&swTimed()==null?'Use the stopwatch first. ':'')+(cellVal()==null?'Type your measurement into the yellow box first. ':'')+'Throw it again if something went wrong, for example you missed the stopwatch.'}
