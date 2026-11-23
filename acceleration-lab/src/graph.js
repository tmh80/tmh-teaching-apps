/* ===== Graph maker (from Paper Plane Lab), with negative numbers on the y-axis ===== */
const GW=1000,GH=560,GL=200,GR_=30,GT=62,GB=96;
const gnum=v=>{const n=num(v);return isFinite(n)?n:NaN};
function niceStep(range,target=6){const raw=Math.max(range,1e-6)/target,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p;return(f<1.5?1:f<3?2:f<7?5:10)*p}
function gTicks(min,max,step){const o=[];if(!(step>0)||!(max>min))return o;let n=0;for(let v=min;v<=max+step*1e-6&&n<60;v+=step,n++)o.push(Math.round(v*1e6)/1e6);return o}
function gValid(g){const a=gnum(g.ymin),b=gnum(g.ymax),s=gnum(g.ystep);return b>a&&s>0&&gTicks(a,b,s).length<=40}
function gMap(g){const L=GL,R=GW-GR_,T=GT,B=GH-GB,ymin=gnum(g.ymin),ymax=gnum(g.ymax),n=4;
  return{L,R,T,B,ymin,ymax,n,py:y=>B-(y-ymin)/(ymax-ymin)*(B-T),vy:p=>ymin+(B-p)/(B-T)*(ymax-ymin),slotX:i=>L+(R-L)*(i+.5)/n,slotW:(R-L)/n,
    zero:clamp(0,ymin,ymax)}}
const accVals=()=>MS.map(k=>accel(k));
function gSuggest(){const v=accVals().filter(x=>x!=null);if(!v.length)return;const mn=Math.min(0,...v),mx=Math.max(0,...v),st=niceStep(mx-mn,6);
  const g=S.g;g.ystep=st;g.ymin=Math.round((Math.floor(mn/st)*st-(mn<0?0:0))*1e6)/1e6;g.ymax=Math.round(Math.ceil(mx/st)*st*1e6)/1e6;if(g.ymin===0&&mn===0&&v.some(x=>x<0))g.ymin=-st;save()}
function wrapText(c,text,maxW){const ws=String(text).split(/\s+/),lines=[];let cur='';ws.forEach(w=>{const t=cur?cur+' '+w:w;if(c.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);return lines}
const FONT='system-ui,"Segoe UI","PingFang SC",sans-serif';
function axisLabels(c,yl,xl,L,R,T,B){c.fillStyle='#14202e';c.font='bold 21px '+FONT;c.textAlign='left';
  if(yl){const lines=wrapText(c,yl,L-96);const y0=(T+B)/2-(lines.length-1)*13;lines.forEach((ln,i)=>c.fillText(ln,10,y0+i*26))}
  c.textAlign='center';if(xl)c.fillText(xl,(L+R)/2,GH-14)}
function drawGraph(c,g,o){
  o=o||{};const valid=gValid(g),L=GL,R=GW-GR_,T=GT,B=GH-GB;
  c.fillStyle='#fff';c.fillRect(0,0,GW,GH);c.textBaseline='alphabetic';
  c.fillStyle='#14202e';c.textAlign='center';c.font='bold 26px '+FONT;
  if(g.title)c.fillText(g.title,(L+R)/2+20,38);else if(o.inter){c.fillStyle='#9aa7b6';c.font='italic 22px '+FONT;c.fillText('Graph title',(L+R)/2+20,38)}
  if(!valid){c.strokeStyle='#14202e';c.lineWidth=3;c.beginPath();c.moveTo(L,T);c.lineTo(L,B);if(!o.blank)c.lineTo(R,B);c.stroke();
    if(o.blank){/* paper version: an empty grid for students to number themselves, room above and below zero */
      c.strokeStyle='#dfe5ec';c.lineWidth=1;for(let i=0;i<=12;i++){const y=T+(B-T)*i/12;c.beginPath();c.moveTo(L,y);c.lineTo(R,y);c.stroke()}
      for(let i=0;i<4;i++){c.fillStyle='#14202e';c.font='bold 18px '+FONT;c.fillText(aShort(i+1),L+(R-L)*(i+.5)/4,B+28)}}
    else{c.fillStyle='#5a6878';c.font='20px '+FONT;c.fillText('Choose your y-axis numbers to start the graph.',(L+R)/2,(T+B)/2)}
    axisLabels(c,g.yl,g.xl,L,R,T,B);return}
  const m=gMap(g);c.font='19px '+FONT;c.lineWidth=1;
  gTicks(m.ymin,m.ymax,gnum(g.ystep)).forEach(v=>{const y=m.py(v);c.strokeStyle='#dfe5ec';c.beginPath();c.moveTo(L,y);c.lineTo(R,y);c.stroke();c.fillStyle=v<0?'#b3301e':'#14202e';c.textAlign='right';c.fillText(fmt(v,Math.abs(v%1)>1e-6?(Math.abs((v*10)%1)>1e-6?2:1):0),L-10,y+6)});
  c.strokeStyle='#14202e';c.lineWidth=3;c.beginPath();c.moveTo(L,T);c.lineTo(L,B);c.stroke();
  /* the zero line is the bold one: bars go up (speeding up) or down (slowing down) from it */
  const zy=m.py(m.zero);c.lineWidth=3.5;c.beginPath();c.moveTo(L,zy);c.lineTo(R,zy);c.stroke();
  if(m.ymin<0){c.fillStyle='rgba(179,48,30,.05)';c.fillRect(L+2,zy,R-L-2,B-zy)}
  axisLabels(c,g.yl,g.xl,L,R,T,B);
  const bw=m.slotW*.5,av=accVals();
  MS.forEach((k,i)=>{const cx=m.slotX(i),h=g.bars[k],placed=h!=null,val=placed?clamp(h,m.ymin,m.ymax):m.zero,y=m.py(val);
    if(placed){c.fillStyle=val<0?'#fecdd3':'#fda4af';c.strokeStyle='#be123c';c.lineWidth=2;c.fillRect(cx-bw/2,Math.min(y,zy),bw,Math.abs(zy-y));c.strokeRect(cx-bw/2,Math.min(y,zy),bw,Math.abs(zy-y))}
    let st=null;if(o.fb&&placed&&av[i]!=null)st=Math.abs(val-av[i])<=(m.ymax-m.ymin)*.035?'ok':'bad';
    if(o.inter||st){c.fillStyle='#fff';c.strokeStyle=st==='ok'?'#2e7d4f':st==='bad'?'#b3301e':'#be123c';c.lineWidth=4;c.setLineDash(placed?[]:[5,4]);c.beginPath();c.arc(cx,y,o.inter?12:8,0,7);c.fill();c.stroke();c.setLineDash([])}
    c.fillStyle='#14202e';c.font='bold 19px '+FONT;c.textAlign='center';c.fillText(aShort(k),cx,B+28);
    c.font='15px '+FONT;c.fillStyle=k<=RAMP_END?'#7a5b23':k===RAMP_END+1?'#9a6a00':'#475569';c.fillText(k<=RAMP_END?'ramp':k===RAMP_END+1?'ramp → flat':'flat',cx,B+50)});
  if(o.inter&&!Object.keys(g.bars).length){c.fillStyle='rgba(190,18,60,.08)';c.fillRect(L+40,T+10,R-L-80,70);c.fillStyle='#9f1239';c.font='bold 22px '+FONT;c.textAlign='center';c.fillText('✋ Drag each round dot up or down to the right height',(L+R)/2,T+52)}
}
function graphEval(){const g=S.g,r={valid:gValid(g)};r.placed=MS.filter(k=>g.bars[k]!=null).length;const av=accVals();
  if(r.valid){const m=gMap(g);r.fits=av.every(a=>a==null||(a>=m.ymin&&a<=m.ymax));r.acc=MS.filter((k,i)=>g.bars[k]!=null&&av[i]!=null&&Math.abs(g.bars[k]-av[i])<=(m.ymax-m.ymin)*.035).length}else{r.fits=false;r.acc=0}
  r.neg=gnum(g.ymin)<0;r.title=/acc/i.test(g.title);r.yl=/acc/i.test(g.yl)&&/m\s*\/\s*s\s*(2|²|\^2)/i.test(g.yl);r.xl=String(g.xl).trim().length>2;return r}
/* ---- dragging the bar tops ---- */
let GDR=null;
function gPos(ev){const cv=$('#gcv'),r=cv.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width*GW,y:(ev.clientY-r.top)/r.height*GH}}
function gDown(ev){if(!gValid(S.g))return;const p=gPos(ev),m=gMap(S.g);
  MS.forEach((k,i)=>{if(GDR)return;const cx=m.slotX(i),h=S.g.bars[k],y=m.py(h==null?m.zero:clamp(h,m.ymin,m.ymax));if(Math.abs(p.x-cx)<m.slotW*.35&&Math.abs(p.y-y)<30){GDR=k;$('#gcv').setPointerCapture(ev.pointerId);ev.preventDefault()}})}
function gMove(ev){if(GDR==null)return;const m=gMap(S.g),p=gPos(ev);let v=clamp(m.vy(p.y),m.ymin,m.ymax);const st=gnum(S.g.ystep)/10;v=Math.round(v/st)*st;S.g.bars[GDR]=Math.round(v*1e4)/1e4;gDraw()}
function gUp(){if(GDR==null)return;GDR=null;save();gLive()}
function gDraw(){const cv=$('#gcv');if(cv)drawGraph(cv.getContext('2d'),S.g,{inter:true,fb:!!S.chk.graph})}
function graphHTML(){
  const g=S.g,e=graphEval(),av=accVals();
  let h=`<div class="graphwrap"><div>
   <h3>Graph title</h3>${isG6()?'<div class="tip">Write it as: <b>what changes along the bottom vs what you measured</b>, e.g. <i>Part of the track vs acceleration</i>.</div>':''}<input type="text" style="width:100%" data-bind="g.title" data-redraw="1" value="${esc(g.title)}" placeholder="… vs …">
   <h3>Axis labels</h3><div class="grid2"><label class="note">x-axis (along the bottom)<input type="text" data-bind="g.xl" data-redraw="1" value="${esc(g.xl)}"></label><label class="note">y-axis (up the side), with units<input type="text" data-bind="g.yl" data-redraw="1" value="${esc(g.yl)}"></label></div>
   ${isG6()?'<p class="note">The unit of acceleration is m/s². Type it as m/s2 or m/s².</p>':''}
   <h3>y-axis numbers</h3><div class="tip">⚠ Some accelerations can be <b>minus</b> numbers, so your lowest number may need to be <b>below zero</b> (like −1).${isG6()?' <button class="btn sm" data-act="gsuggest">Suggest numbers for me</button>':''}</div>
   <div class="axrow"><label>lowest<input class="n" inputmode="decimal" data-bind="g.ymin" data-redraw="2" value="${esc(g.ymin)}"></label><label>highest<input class="n" inputmode="decimal" data-bind="g.ymax" data-redraw="2" value="${esc(g.ymax)}"></label><label>gap<input class="n" inputmode="decimal" data-bind="g.ystep" data-redraw="2" value="${esc(g.ystep)}"></label></div>
   <h3>Your accelerations</h3><table class="tb"><tbody>${MS.map((k,i)=>`<tr><td class="l">${aLabel(k)}</td><td><span class="val c-a ${av[i]==null?'empty':''}">${av[i]==null?'—':fmt(av[i])+' m/s²'}</span></td></tr>`).join('')}</tbody></table>
   <div style="margin-top:10px"><button class="btn" data-act="gcheck">${S.chk.graph?'✓ Checking is on':'Check my graph'}</button></div><div id="gfb">${gFbHTML()}</div>`;
  return h+`</div><div><canvas id="gcv" class="cv" width="${GW}" height="${GH}" style="cursor:ns-resize" aria-label="Your acceleration graph"></canvas>${S.chk.graph?'<p class="note">Green ring = right height. Red ring = check the number again.</p>':''}</div></div>`;
}
function gFbHTML(){const e=graphEval();let h=e.valid&&!e.fits?'<div class="fb mid">Some of your accelerations don\'t fit. Check your lowest and highest numbers.</div>':'';
  if(S.chk.graph){const it=[[e.title,'Title mentions acceleration'],[e.yl,'y-axis says acceleration with its unit m/s²'],[e.xl,'x-axis has a label'],[e.fits,'All accelerations fit on the axes'],[e.placed===4,'All 4 bars placed'],[e.acc===4,'Every bar is the right height']];
    h+=`<div class="fb ${it.every(x=>x[0])?'ok':'mid'}">${it.map(([ok,t])=>`${ok?'✓':'✗'} ${t}`).join('<br>')}</div>`}return h}
function gLive(){gDraw();const f=$('#gfb');if(f)f.innerHTML=gFbHTML();chrome()}
function graphBind(){const cv=$('#gcv');if(!cv)return;cv.onpointerdown=gDown;cv.onpointermove=gMove;cv.onpointerup=gUp;cv.onpointercancel=gUp;gDraw();drawSpeedModel($('#vcv'))}
function graphRefresh(){const host=$('#graphhost');if(!host)return;const sy=scrollY,a=document.activeElement,bind=a&&a.dataset?a.dataset.bind:null;host.innerHTML=graphHTML();graphBind();scrollTo(0,sy);if(bind){const n=$(`[data-bind="${bind}"]`,host);if(n){n.focus({preventScroll:true});try{n.setSelectionRange(n.value.length,n.value.length)}catch(e){}}}chrome()}

/* ---- the model: speed vs time, drawn from the student's own numbers ---- */
function speedPts(){const pts=[{t:0,v:0}];let t0=0;for(const k of MS){const l=num(S.leg[k]),v=num(S.spd[k]);if(!(l>0)||isNaN(v))break;pts.push({t:t0+l/2,v,k});t0+=l}return{pts,end:t0}}
function drawSpeedModel(cv){
  if(!cv)return;const c=cv.getContext('2d'),{pts,end}=speedPts(),L=GL-60,R=GW-GR_,T=GT,B=GH-GB;
  c.fillStyle='#fff';c.fillRect(0,0,GW,GH);c.fillStyle='#14202e';c.textAlign='center';c.font='bold 26px '+FONT;c.fillText('Speed vs time (model)',(L+R)/2,38);
  if(pts.length<3){c.font='20px '+FONT;c.fillStyle='#5a6878';c.fillText('Fill in Table 2 and your speed graph appears here.',(L+R)/2,(T+B)/2);return}
  const tmax=Math.max(end,0.5),vmax=Math.max(...pts.map(p=>p.v)),ts=niceStep(tmax,6),vs=niceStep(vmax,5),TX=Math.ceil(tmax/ts)*ts,VY=Math.ceil(vmax*1.05/vs)*vs;
  const px=t=>L+t/TX*(R-L),py=v=>B-v/VY*(B-T);
  /* ramp and flat zones: the ramp ends when metre 2 ends */
  const l1=num(S.leg[1]),l2=num(S.leg[2]),rampEnd=l1>0&&l2>0?l1+l2:null;
  if(rampEnd){c.fillStyle='rgba(243,227,195,.6)';c.fillRect(L,T,px(rampEnd)-L,B-T);c.fillStyle='rgba(226,232,240,.6)';c.fillRect(px(rampEnd),T,R-px(rampEnd),B-T);
    c.font='bold 18px '+FONT;c.fillStyle='#7a5b23';c.fillText('RAMP',(L+px(rampEnd))/2,T+24);c.fillStyle='#475569';c.fillText('FLAT',(px(rampEnd)+R)/2,T+24)}
  c.font='18px '+FONT;c.lineWidth=1;
  gTicks(0,VY,vs).forEach(v=>{const y=py(v);c.strokeStyle='#dfe5ec';c.beginPath();c.moveTo(L,y);c.lineTo(R,y);c.stroke();c.fillStyle='#14202e';c.textAlign='right';c.fillText(fmt(v,vs<1?1:0),L-8,y+6)});
  gTicks(0,TX,ts).forEach(t=>{const x=px(t);c.strokeStyle='#eef1f5';c.beginPath();c.moveTo(x,T);c.lineTo(x,B);c.stroke();c.fillStyle='#14202e';c.textAlign='center';c.fillText(fmt(t,ts<1?1:0),x,B+26)});
  c.strokeStyle='#14202e';c.lineWidth=3;c.beginPath();c.moveTo(L,T);c.lineTo(L,B);c.lineTo(R,B);c.stroke();
  c.fillStyle='#14202e';c.font='bold 20px '+FONT;c.textAlign='center';c.fillText('Time from the start (s)',(L+R)/2,GH-20);
  c.save();c.translate(30,(T+B)/2);c.rotate(-Math.PI/2);c.fillText('Speed (m/s)',0,0);c.restore();
  c.strokeStyle=COLS.v;c.lineWidth=4;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(px(p.t),py(p.v)):c.moveTo(px(p.t),py(p.v)));c.stroke();
  pts.forEach(p=>{c.fillStyle=p.k?COLS.v:'#94a3b8';c.beginPath();c.arc(px(p.t),py(p.v),8,0,7);c.fill();if(p.k){c.fillStyle='#14202e';c.font='bold 15px '+FONT;c.fillText('M'+p.k,px(p.t),py(p.v)-14)}});
}
