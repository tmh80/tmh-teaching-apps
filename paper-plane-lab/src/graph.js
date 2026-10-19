/* ===== GRAPH MAKER: drag points / categories, choose axes ===== */
const GW=1000,GH=560,GL=200,GR_=34,GT=62,GB=96;
const GR={drag:null,ghost:null};
function gInit(){
  const nl=S.levels.length;
  if(!S.graph||S.graph.sig!==S.iv+'|'+S.dv+'|'+S.levels.join(',')){
    S.graph={sig:S.iv+'|'+S.dv+'|'+S.levels.join(','),title:'',xl:'',yl:'',xmin:'',xmax:'',xstep:'',ymin:'',ymax:'',ystep:'',pts:{},slots:new Array(nl).fill(null),bars:{},fit:null,type:''}
  }
  return S.graph;
}
const gnum=v=>{const n=parseFloat(v);return isFinite(n)?n:NaN};
function plotVals(){ /* what the student plots: their own averages (Developing: the lab's averages) */
  return levelStats().map(s=>{
    const t=gnum(A('avg.'+String(s.lk)));const y=isNaN(t)?null:t;
    return{lk:s.lk,x:IVS[S.iv].type==='num'?Number(s.lk):null,y,m:s.m,label:lvlLabel(S.iv,s.lk)}
  });
}
function niceStep(range,target=6){const raw=range/target,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p;return(f<1.5?1:f<3?2:f<7?5:10)*p}
function gSuggest(){
  const g=gInit(),pv=plotVals().filter(p=>p.y!=null);if(!pv.length)return;
  const ys=pv.map(p=>p.m!=null?p.m:p.y),mn=Math.min(...ys),mx=Math.max(...ys);
  const st=niceStep(mx-0,6);g.ymin=0;g.ystep=st;g.ymax=Math.ceil(mx/st)*st+(Math.ceil(mx/st)*st-mx<st*.15?st:0);
  if(g.type==='scatter'){const xs=S.levels.map(Number),a=Math.min(...xs),b=Math.max(...xs),sx=niceStep(b-a,6);g.xstep=sx;g.xmin=Math.floor((a-sx*.5)/sx)*sx;g.xmax=Math.ceil((b+sx*.5)/sx)*sx}
  save();
}
function gTicks(min,max,step){const o=[];if(!(step>0)||!(max>min))return o;let n=0;for(let v=min;v<=max+step*1e-6&&n<60;v+=step,n++)o.push(Math.round(v*1e6)/1e6);return o}
function gValid(g){
  const isNum=g.type==='scatter',yv=gnum(g.ymax)>gnum(g.ymin)&&gnum(g.ystep)>0&&gTicks(gnum(g.ymin),gnum(g.ymax),gnum(g.ystep)).length<=40;
  const xv=!isNum||(gnum(g.xmax)>gnum(g.xmin)&&gnum(g.xstep)>0&&gTicks(gnum(g.xmin),gnum(g.xmax),gnum(g.xstep)).length<=40);
  return yv&&xv;
}
function wrapText(c,text,maxW){const ws=String(text).split(/\s+/),lines=[];let cur='';ws.forEach(w=>{const t=cur?cur+' '+w:w;if(c.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);return lines}
/* mapping for the current axes */
function gMap(g){
  const isNum=g.type==='scatter',L=GL,R=GW-GR_,T=GT,B=GH-GB;
  const ymin=gnum(g.ymin),ymax=gnum(g.ymax),xmin=gnum(g.xmin),xmax=gnum(g.xmax),n=Math.max(1,S.levels.length);
  return{isNum,L,R,T,B,ymin,ymax,xmin,xmax,n,
   px:x=>L+(x-xmin)/(xmax-xmin)*(R-L),py:y=>B-(y-ymin)/(ymax-ymin)*(B-T),
   vx:p=>xmin+(p-L)/(R-L)*(xmax-xmin),vy:p=>ymin+(B-p)/(B-T)*(ymax-ymin),
   slotX:i=>L+(R-L)*(i+.5)/n,slotW:(R-L)/n};
}
function drawGraph(c,g,o){
  o=o||{};const W=GW,H=GH,valid=gValid(g)&&!!g.type,m=valid?gMap(g):null,isNum=g.type==='scatter';
  c.fillStyle='#fff';c.fillRect(0,0,W,H);c.textBaseline='alphabetic';
  /* title */
  c.fillStyle='#14202e';c.textAlign='center';c.font='bold 26px system-ui,"Segoe UI","PingFang SC",sans-serif';
  if(g.title)c.fillText(g.title,(GL+W-GR_)/2+20,38);else if(o.inter){c.fillStyle='#9aa7b6';c.font='italic 22px system-ui,sans-serif';c.fillText('Graph title',(GL+W-GR_)/2+20,38)}
  const L=GL,R=W-GR_,T=GT,B=H-GB;
  if(!valid){c.fillStyle='#5a6878';c.font='20px system-ui,sans-serif';c.textAlign='center';c.fillText(g.type?'Choose your axis numbers to start the graph.':'Choose a type of graph to start.',(L+R)/2,(T+B)/2);
    c.strokeStyle='#14202e';c.lineWidth=3;c.beginPath();c.moveTo(L,T);c.lineTo(L,B);c.lineTo(R,B);c.stroke();axisLabels(c,g,L,R,T,B);return}
  /* grid + ticks */
  c.font='19px system-ui,sans-serif';c.lineWidth=1;
  gTicks(m.ymin,m.ymax,gnum(g.ystep)).forEach(v=>{const y=m.py(v);c.strokeStyle='#dfe5ec';c.beginPath();c.moveTo(L,y);c.lineTo(R,y);c.stroke();c.fillStyle='#14202e';c.textAlign='right';c.fillText(fmt(v,3),L-10,y+6)});
  if(isNum)gTicks(m.xmin,m.xmax,gnum(g.xstep)).forEach(v=>{const x=m.px(v);c.strokeStyle='#eef1f5';c.beginPath();c.moveTo(x,T);c.lineTo(x,B);c.stroke();c.fillStyle='#14202e';c.textAlign='center';c.fillText(fmt(v,3),x,B+26)});
  c.strokeStyle='#14202e';c.lineWidth=3;c.beginPath();c.moveTo(L,T);c.lineTo(L,B);c.lineTo(R,B);c.stroke();
  axisLabels(c,g,L,R,T,B);
  const pv=plotVals();
  const hint=(t1,t2)=>{c.fillStyle='rgba(194,112,12,.10)';c.fillRect(L+30,(T+B)/2-50,R-L-60,92);c.strokeStyle='#c2700c';c.lineWidth=2;c.setLineDash([8,6]);c.strokeRect(L+30,(T+B)/2-50,R-L-60,92);c.setLineDash([]);c.fillStyle='#8a4f06';c.textAlign='center';c.font='bold 24px system-ui,sans-serif';c.fillText(t1,(L+R)/2,(T+B)/2-12);c.font='19px system-ui,sans-serif';c.fillText(t2,(L+R)/2,(T+B)/2+22)};
  if(o.inter&&isNum&&!Object.keys(g.pts||{}).length)hint('✋ Click and drag each point onto the graph','Hold the mouse down on a blue chip, move it here, then let go.');
  if(o.inter&&!isNum&&!g.slots.some(x=>x!=null))hint('✋ Click and drag each type into a box below','Hold the mouse down on an orange chip, move it to a box, then let go.');
  if(isNum){
    /* line of best fit */
    if(g.fit){const f=g.fit,fy=fitFn(f);c.strokeStyle='#c2700c';c.lineWidth=3;c.setLineDash([10,6]);c.beginPath();
      if(f.curve){const a=Math.min(f.x1,f.x2),b=Math.max(f.x1,f.x2);c.save();c.beginPath();c.rect(L,T,R-L,B-T);c.clip();c.beginPath();for(let i=0;i<=80;i++){const x=a+(b-a)*i/80,X=m.px(x),Y=m.py(fy(x));i?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke();c.restore()}
      else{c.moveTo(m.px(f.x1),m.py(f.y1));c.lineTo(m.px(f.x2),m.py(f.y2));c.stroke()}c.setLineDash([]);
      if(o.inter){[[f.x1,f.y1],[f.x2,f.y2]].concat(f.curve?[[f.xm,f.ym]]:[]).forEach(p=>{c.fillStyle='#fff';c.strokeStyle='#c2700c';c.lineWidth=3;c.beginPath();c.arc(m.px(p[0]),m.py(p[1]),9,0,7);c.fill();c.stroke()})}}
    pv.forEach(p=>{const pt=g.pts[String(p.lk)];if(!pt)return;const X=m.px(pt.x),Y=m.py(pt.y),st=ptState(p,pt,m,o);
      if(st){c.strokeStyle=st==='ok'?'#2e7d4f':'#b3301e';c.lineWidth=4;c.beginPath();c.arc(X,Y,14,0,7);c.stroke()}
      c.fillStyle='#1b7ea6';c.strokeStyle='#0d4a63';c.lineWidth=2;c.beginPath();c.arc(X,Y,8,0,7);c.fill();c.stroke()});
  }else{
    const bw=m.slotW*.5;
    g.slots.forEach((lk,i)=>{const cxp=m.slotX(i);
      if(lk==null){if(o.inter){c.setLineDash([6,5]);c.strokeStyle='#9aa7b6';c.lineWidth=2;c.strokeRect(cxp-m.slotW*.42,B+8,m.slotW*.84,40);c.setLineDash([]);c.fillStyle='#9aa7b6';c.font='16px system-ui,sans-serif';c.textAlign='center';c.fillText('drop a type here',cxp,B+33)}return}
      const h=g.bars[lk],val=h==null?m.ymin:h,y=m.py(Math.max(m.ymin,Math.min(m.ymax,val)));
      c.fillStyle='#8cc3dc';c.strokeStyle='#0d4a63';c.lineWidth=2;c.fillRect(cxp-bw/2,y,bw,B-y);c.strokeRect(cxp-bw/2,y,bw,B-y);
      const p=pv.find(q=>String(q.lk)===String(lk));const st=p?barState(p,val,m,o):null;
      if(o.inter||st){c.fillStyle='#fff';c.strokeStyle=st==='ok'?'#2e7d4f':st==='bad'?'#b3301e':'#c2700c';c.lineWidth=4;c.beginPath();c.arc(cxp,y,o.inter?11:8,0,7);c.fill();c.stroke()}
      c.fillStyle='#14202e';c.font='bold 20px system-ui,sans-serif';c.textAlign='center';
      const lines=wrapText(c,lvlLabel(S.iv,IVS[S.iv].type==='num'?Number(lk):lk),m.slotW*.9);lines.forEach((ln,j)=>c.fillText(ln,cxp,B+28+j*22));
    });
  }
}
function axisLabels(c,g,L,R,T,B){
  c.fillStyle='#14202e';c.font='bold 21px system-ui,"Segoe UI","PingFang SC",sans-serif';
  /* y label: on the left of the axis, written horizontally */
  c.textAlign='left';
  if(g.yl){const lines=wrapText(c,g.yl,L-92);const y0=(T+B)/2-(lines.length-1)*13;lines.forEach((ln,i)=>c.fillText(ln,10,y0+i*26))}
  c.textAlign='center';
  if(g.xl)c.fillText(g.xl,(L+R)/2,GH-16);
}
function ptState(p,pt,m,o){
  if(!o.fb||p.y==null)return null;const tx=p.x,ty=p.y;
  const ok=Math.abs(pt.x-tx)<=(m.xmax-m.xmin)*.035&&Math.abs(pt.y-ty)<=(m.ymax-m.ymin)*.035;return ok?'ok':'bad';
}
function barState(p,val,m,o){if(!o.fb||p.y==null)return null;return Math.abs(val-p.y)<=(m.ymax-m.ymin)*.035?'ok':'bad'}

/* ---- evaluation for the finish list and the marking page ---- */
function graphEval(){
  const g=gInit(),isNum=g.type==='scatter',ivNum=IVS[S.iv].type==='num',pv=plotVals(),r={};
  const T=g.title||'';
  const vsM=T.match(/\bvs\.?(?=\s)|\bversus\b/i);r.title=false;if(vsM){const a=T.slice(0,vsM.index),b=T.slice(vsM.index+vsM[0].length);r.title=hasIV(a)&&hasDV(b)}
  const ut=ivUnitTxt(),dt=dvUnitTxt();
  r.xl=hasIV(g.xl)&&(!ivNum||g.xl.toLowerCase().includes(ut.toLowerCase())||/\(.+\)/.test(g.xl));
  r.yl=hasDV(g.yl)&&(g.yl.toLowerCase().includes(dt.toLowerCase())||/\(.+\)/.test(g.yl));
  r.valid=gValid(g);
  const have=pv.filter(p=>p.y!=null),placed=have.filter(p=>isNum?g.pts[String(p.lk)]:(g.slots.includes(String(p.lk))&&g.bars[String(p.lk)]!=null));
  r.total=pv.length;r.placed=placed.length;
  if(r.valid){const m=gMap(g);
    r.fits=pv.every(p=>p.y==null||(p.y>=m.ymin&&p.y<=m.ymax))&&(!isNum||S.levels.every(v=>Number(v)>=m.xmin&&Number(v)<=m.xmax));
    const span=Math.max(...pv.map(p=>p.m||0))-Math.min(...pv.map(p=>p.m||0));
    r.sensible=(m.ymax-m.ymin)<=Math.max(...pv.map(p=>p.m||0))*3+1;
    let ok=0;placed.forEach(p=>{if(isNum){const pt=g.pts[String(p.lk)];if(Math.abs(pt.x-p.x)<=(m.xmax-m.xmin)*.035&&Math.abs(pt.y-p.y)<=(m.ymax-m.ymin)*.035)ok++}
      else{const h=g.bars[String(p.lk)];if(Math.abs(h-p.y)<=(m.ymax-m.ymin)*.035)ok++}});r.accurate=ok;
  }else{r.fits=false;r.accurate=0;r.sensible=false}
  if(isNum&&g.fit){Object.assign(r,fitEval(g.fit,have.map(p=>[p.x,p.y])))}
  if(isNum){r.fit=!!g.fit;if(g.fit){const xs=have.map(p=>p.x),ys=have.map(p=>p.y),n=xs.length,mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;
      let sxy=0,sxx=0;xs.forEach((x,i)=>{sxy+=(x-mx)*(ys[i]-my);sxx+=(x-mx)*(x-mx)});const slope=sxx?sxy/sxx:0,fs=(g.fit.y2-g.fit.y1)/((g.fit.x2-g.fit.x1)||1e-9);r.fitDir=Math.sign(slope)===Math.sign(fs)||Math.abs(slope)<1e-9}}
  r.type=!!g.type&&(g.type==='scatter')===ivNum;
  r.done=!!g.type&&r.valid&&!!g.title&&!!g.xl&&!!g.yl&&r.placed===r.total&&r.total>0;
  return r;
}

/* ---- dragging ---- */
function dragStart(ev,data,label,cls){
  ev.preventDefault();dragEndNow();
  GR.drag=data;const gh=document.createElement('div');gh.className='ghost dchip '+(cls||'');gh.textContent=label;gh.style.left=ev.clientX+'px';gh.style.top=ev.clientY+'px';document.body.appendChild(gh);GR.ghost=gh;
  window.addEventListener('pointermove',dragMove);window.addEventListener('pointerup',dragEnd,{once:true});
}
function dragMove(ev){if(GR.ghost){GR.ghost.style.left=ev.clientX+'px';GR.ghost.style.top=ev.clientY+'px'}}
function dragEndNow(){window.removeEventListener('pointermove',dragMove);if(GR.ghost){GR.ghost.remove();GR.ghost=null}}
function dragEnd(ev){
  const d=GR.drag;GR.drag=null;dragEndNow();if(!d)return;
  const cv=$('#gcv');if(!cv){return}
  const r=cv.getBoundingClientRect(),inside=ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;
  const g=gInit(),cx_=(ev.clientX-r.left)/r.width*GW,cy_=(ev.clientY-r.top)/r.height*GH;
  if(d.type==='pt'){
    if(inside&&gValid(g)){const m=gMap(g);if(cx_>=m.L-6&&cx_<=m.R+6&&cy_>=m.T-6&&cy_<=m.B+6)putPoint(d.key,m.vx(cx_),m.vy(cy_))}
  }else if(d.type==='cat'){
    if(inside&&gValid(g)){const m=gMap(g);let i=Math.floor((cx_-m.L)/m.slotW);i=Math.max(0,Math.min(m.n-1,i));
      if(cy_>m.B-30||true){const old=g.slots.indexOf(d.key);const prev=g.slots[i];if(old>=0)g.slots[old]=prev;g.slots[i]=d.key}}
    else if(d.from!=null){const old=g.slots.indexOf(d.key);if(old>=0)g.slots[old]=null}
  }
  save();graphRefresh();
}
function putPoint(key,x,y){
  const g=gInit(),m=gMap(g),p=plotVals().find(q=>String(q.lk)===String(key));
  if(isDev()&&p&&p.y!=null){const tx=p.x,ty=p.y;if(Math.abs(x-tx)<=(m.xmax-m.xmin)*.07&&Math.abs(y-ty)<=(m.ymax-m.ymin)*.07){x=tx;y=ty}}
  g.pts[String(key)]={x,y};
}
function setBar(key,y){
  const g=gInit(),m=gMap(g),p=plotVals().find(q=>String(q.lk)===String(key));y=Math.max(m.ymin,Math.min(m.ymax,y));
  if(isDev()&&p&&p.y!=null&&Math.abs(y-p.y)<=(m.ymax-m.ymin)*.07)y=p.y;g.bars[String(key)]=y;
}
function gCanvasDown(ev){
  const cv=$('#gcv'),g=gInit();if(!gValid(g))return;const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*GW,y=(ev.clientY-r.top)/r.height*GH,m=gMap(g);
  const isNum=m.isNum;
  if(isNum){
    if(g.fit){for(const [k,px,py] of [['1',m.px(g.fit.x1),m.py(g.fit.y1)],['2',m.px(g.fit.x2),m.py(g.fit.y2)]].concat(g.fit.curve?[['m',m.px(g.fit.xm),m.py(g.fit.ym)]]:[])){if(Math.hypot(x-px,y-py)<18){GR.cv={kind:'fit',k};cv.setPointerCapture(ev.pointerId);return}}}
    for(const p of plotVals()){const pt=g.pts[String(p.lk)];if(pt&&Math.hypot(x-m.px(pt.x),y-m.py(pt.y))<16){GR.cv={kind:'pt',key:p.lk};cv.setPointerCapture(ev.pointerId);return}}
  }else{
    g.slots.forEach((lk,i)=>{if(lk==null||GR.cv)return;const cxp=m.slotX(i),h=g.bars[lk],val=h==null?m.ymin:h,py=m.py(val);
      if(Math.hypot(x-cxp,y-py)<18){GR.cv={kind:'bar',key:lk};cv.setPointerCapture(ev.pointerId)}
      else if(y>m.B+4&&Math.abs(x-cxp)<m.slotW*.45){dragStart(ev,{type:'cat',key:lk,from:i},lvlLabel(S.iv,IVS[S.iv].type==='num'?Number(lk):lk),'cat')}});
  }
}
function gCanvasMove(ev){
  if(!GR.cv)return;const cv=$('#gcv'),g=gInit(),r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*GW,y=(ev.clientY-r.top)/r.height*GH,m=gMap(g);
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  if(GR.cv.kind==='pt'){const k=GR.cv.key;g.pts[String(k)]={x:cl(m.vx(x),m.xmin,m.xmax),y:cl(m.vy(y),m.ymin,m.ymax)}}
  else if(GR.cv.kind==='bar'){g.bars[String(GR.cv.key)]=cl(m.vy(y),m.ymin,m.ymax)}
  else if(GR.cv.kind==='fit'){const k=GR.cv.k,f=g.fit;f['x'+k]=cl(m.vx(x),m.xmin,m.xmax);f['y'+k]=cl(m.vy(y),m.ymin,m.ymax);
    if(f.curve){const a=Math.min(f.x1,f.x2),b=Math.max(f.x1,f.x2),gap=(m.xmax-m.xmin)*.04;if(k==='m')f.xm=cl(f.xm,a+gap,b-gap);else if(f.xm<=a+gap||f.xm>=b-gap)f.xm=(a+b)/2}}
  gDraw();
}
function gCanvasUp(){
  if(!GR.cv)return;const g=gInit();
  if(GR.cv.kind==='pt'){const p=g.pts[String(GR.cv.key)];if(p)putPoint(GR.cv.key,p.x,p.y)}
  else if(GR.cv.kind==='bar'){setBar(GR.cv.key,g.bars[String(GR.cv.key)])}
  GR.cv=null;save();graphRefresh();
}
function gDraw(){const cv=$('#gcv');if(!cv)return;drawGraph(cv.getContext('2d'),gInit(),{inter:true,fb:isDev()||isPro()})}

/* ---- the graph panel ---- */
function ivIsNum(){return IVS[S.iv].type==='num'}
function graphHTML(){
  const g=gInit(),isNum=g.type==='scatter',c=cx(),pv=plotVals();
  const ttl=`${c.ivName} vs ${c.dv.name}`,xl=ivHeading(),yl=dvHeading();
  let setup=`<div class="q"><h3>Type of graph</h3>${tip(['developing'],'A <b>scatter graph</b> is for numbers you changed (like 6, 8, 10 cm). A <b>bar graph</b> is for types you changed (like different papers).')}
    <div class="chips"><button class="chip ${g.type==='scatter'?'sel':''}" data-act="g:type" data-k="scatter">Scatter graph</button><button class="chip ${g.type==='bar'?'sel':''}" data-act="g:type" data-k="bar">Bar graph</button></div>
    ${g.type==='scatter'&&!c.isNum?'<div class="fb no">A scatter graph needs numbers along the x-axis. The things you tested are types, not numbers.</div>':''}
    ${helped()&&g.type&&(g.type==='scatter')!==c.isNum&&c.isNum?`<div class="fb mid">${isDev()?'You changed a number, so a scatter graph shows the pattern better.':'Check: is your independent variable a number or a type?'}</div>`:''}</div>`;
  if(!g.type){return`<div class="graphwrap"><div>${setup}</div><div><div class="panel"><canvas id="gcv" class="cv" width="${GW}" height="${GH}" style="background:#fff" aria-label="Your graph"></canvas></div></div></div>`}
  if(g.type==='scatter'&&!c.isNum){return`<div class="graphwrap"><div>${setup}</div><div></div></div>`}
  /* title + axis labels */
  setup+=`<div class="q"><h3>Graph title</h3>${tip(['developing'],'Write the title as: <b>independent variable vs dependent variable</b>. For example, a graph about toy cars could be called <i>Ramp height vs Speed of the car</i>.')}${tip(['proficient'],'Write the title as: independent variable vs dependent variable.')}${nudge(['mastering'],'Check your notebook for what every graph needs: a title, labelled axes with units and a sensible scale.')}
      <input type="text" data-bind="g.title" value="${esc(g.title)}" placeholder="${isDev()?'… vs …':''}"></div>
     <div class="q"><h3>Axis labels</h3>${tip(['developing'],'The x-axis (along the bottom) shows what you changed. The y-axis (up the side) shows what you measured. Add the units in brackets, for example <i>Ramp height (cm)</i>.')}${tip(['proficient'],'Include the units in brackets.')}<div class="grid2"><div><span class="lbl">x-axis label (along the bottom)</span><input type="text" data-bind="g.xl" value="${esc(g.xl)}"></div><div><span class="lbl">y-axis label (up the side)</span><input type="text" data-bind="g.yl" value="${esc(g.yl)}"></div></div></div>`;
  /* axis numbers */
  setup+=`<div class="q"><h3>Axis numbers</h3>${isDev()?'<div class="tip">Pick the lowest number, the highest number and the gap between numbers for each axis. All your data must fit on the graph. <button class="btn sm" data-act="g:suggest">Suggest numbers for me</button></div>':isPro()?'<div class="tip">Make the axes big enough to hold all your averages, but not so big that the data is squashed.</div>':''}
   <div class="axrow"><b>y-axis</b><label>lowest<input type="number" data-bind="g.ymin" value="${esc(g.ymin)}"></label><label>highest<input type="number" data-bind="g.ymax" value="${esc(g.ymax)}"></label><label>gap<input type="number" data-bind="g.ystep" value="${esc(g.ystep)}"></label></div>
   ${isNum?`<div class="axrow" style="margin-top:6px"><b>x-axis</b><label>lowest<input type="number" data-bind="g.xmin" value="${esc(g.xmin)}"></label><label>highest<input type="number" data-bind="g.xmax" value="${esc(g.xmax)}"></label><label>gap<input type="number" data-bind="g.xstep" value="${esc(g.xstep)}"></label></div>`:'<p class="note" style="margin-top:6px">The x-axis shows the things you tested. Drag each one into a box under the graph.</p>'}
   <div id="gwarn"></div></div>`;
  /* tray */
  let tray='';
  if(!g.type){tray=''}
  else if(isNum){
    tray=`<div class="q"><h3>Plot your points</h3><div class="tip howdrag"><b>How to plot:</b><ol><li><b>Click and hold</b> a blue chip below.</li><li><b>Drag</b> it onto the graph, to where its x number and y number meet.</li><li><b>Let go</b> to drop the point. You can drag a point on the graph again to move it.</li></ol></div><div class="tray">`+
     pv.map(p=>{const placed=!!g.pts[String(p.lk)],ok=p.y!=null;return`<div class="dchip ${placed?'placed':Object.keys(g.pts).length?'':'wiggle'}" data-chip="${esc(p.lk)}" ${ok?'':'style="opacity:.5"'}><span class="grip" aria-hidden="true">⠿</span>${esc(p.label)} → ${ok?esc(fmt(p.y,dvDp())+' '+dvUnitTxt()):'(write your average in the table first)'}${placed?' ✓':''}</div>`}).join('')+`</div>
     <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">${g.fit?`<button class="btn" data-act="g:nofit">Remove ${g.fit.curve?'curve':'line'} of best fit</button><button class="btn" data-act="${g.fit.curve?'g:fit':'g:curve'}">Change to a ${g.fit.curve?'straight line':'curve'}</button>`:`<button class="btn" data-act="g:fit">Draw a straight line of best fit</button><button class="btn" data-act="g:curve">Draw a curve of best fit</button>`}</div>
     ${isDev()?'<div class="tip" style="margin-top:6px">A line of best fit goes through the middle of your points, with about the same number of points above and below it. Not every point has to touch it. Drag the round ends to move it.<br>If your points make a <b>bend</b>, use a <b>curve of best fit</b>. Drag the middle dot to bend it.</div>':isPro()?'<div class="tip" style="margin-top:6px">Use a straight line if your points follow a straight path, or a curve if they bend. Drag the round dots to move it.</div>':''}</div>`;
  }else{
    const free=S.levels.filter(l=>!g.slots.includes(String(l)));
    tray=`<div class="q"><h3>Build your bar graph</h3><div class="tip howdrag"><b>How to build it:</b><ol><li><b>Click and hold</b> an orange chip, <b>drag</b> it into a box under the graph and <b>let go</b>. You decide the order.</li><li>Then <b>click and drag</b> the round dot at the top of each bar up or down to the height of its average.</li></ol></div>
     <span class="lbl">To place</span><div class="tray" style="flex-direction:row;flex-wrap:wrap;margin:6px 0">${free.length?free.map(l=>`<div class="dchip cat ${g.slots.some(x=>x!=null)?'':'wiggle'}" data-cat="${esc(String(l))}"><span class="grip" aria-hidden="true">⠿</span>${esc(lvlLabel(S.iv,l))}</div>`).join(''):'<span class="note">All placed.</span>'}</div>
     <span class="lbl">Your averages</span><table class="tb" style="margin-top:4px"><tbody>${pv.map(p=>`<tr><td class="l">${esc(p.label)}</td><td>${p.y!=null?esc(fmt(p.y,dvDp())+' '+dvUnitTxt()):'(write your average in the table first)'}</td></tr>`).join('')}</tbody></table></div>`;
  }
  if(helped()){const on=A('chk.graph');tray+=`<div style="margin-top:10px"><button class="btn" data-act="g:check">Check my graph</button></div>`;
    if(on){const e=graphEval(),u=c.isNum?' ('+c.iv.unit+')':'';tray+=fbList([
      {ok:e.title,msg:'Your title is in the right format.',fix:`Your title should be: ${c.ivName} vs ${c.dv.name}.`},
      {ok:e.xl,msg:'Your x-axis label is right.',fix:`The x-axis shows what you changed${c.isNum?', with units':''}: ${c.ivName}${u}.`},
      {ok:e.yl,msg:'Your y-axis label is right.',fix:`The y-axis shows what you measured, with units: ${dvHeading()}.`},
      {ok:e.valid&&e.fits,msg:'All your data fits on your axes.',fix:'Change your axis numbers so every average fits on the graph.'},
      {ok:e.placed===e.total,msg:'All your data is on the graph.',fix:`You have placed ${e.placed} of ${e.total}. Drag the rest onto the graph.`},
      {ok:e.accurate===e.total,msg:'Every point or bar is in the right place.',fix:'Some points or bars are in the wrong place (red ring). Check the numbers on both axes.'}].concat(g.fit&&c.isNum?[{ok:e.fitOK,msg:`Your ${g.fit.curve?'curve':'line'} of best fit goes through the middle of your points.`,fix:e.fitShort?`Make your ${g.fit.curve?'curve':'line'} stretch from your first point to your last point.`:`Move your ${g.fit.curve?'curve':'line'} so it goes through the middle of your points, with about the same number above and below it.`}].concat(e.bendy&&!g.fit.curve?[{ok:false,msg:'your points make a bend, so try a curve of best fit',fix:'Your points make a bend. A curve of best fit would match them better.'}]:[]):[]).map(x=>isDev()?x:{ok:x.ok,msg:x.msg}))}}
  return`<div class="graphwrap"><div>${setup}${tray}</div><div><div class="panel"><canvas id="gcv" class="cv" width="${GW}" height="${GH}" style="background:#fff;cursor:crosshair" aria-label="Your graph"></canvas>
   ${isDev()?'<p class="note" style="margin-top:6px">Green ring = in the right place. Red ring = check your numbers again.</p>':isPro()?'<p class="note" style="margin-top:6px">Green ring = in the right place. Red ring = check again.</p>':''}</div></div></div>`;
}
function graphBind(){
  const cv=$('#gcv');if(!cv)return;
  cv.onpointerdown=gCanvasDown;cv.onpointermove=gCanvasMove;cv.onpointerup=gCanvasUp;cv.onpointercancel=gCanvasUp;
  $$('[data-chip]').forEach(el=>el.onpointerdown=ev=>{const key=el.dataset.chip,k=IVS[S.iv].type==='num'?Number(key):key,p=plotVals().find(q=>String(q.lk)===key);
    if(!p||p.y==null)return;if(!gValid(gInit())){gWarn('Choose your axis numbers first.');return}
    if(el.classList.contains('placed')){delete gInit().pts[key];save();graphRefresh();return}
    dragStart(ev,{type:'pt',key:k},el.textContent.replace('✓','').trim())});
  $$('[data-cat]').forEach(el=>el.onpointerdown=ev=>{if(!gValid(gInit())){gWarn('Choose your axis numbers first.');return}dragStart(ev,{type:'cat',key:el.dataset.cat},el.textContent,'cat')});
  gDraw();
}
function gWarn(t){const w=$('#gwarn');if(w)w.innerHTML=`<div class="fb mid">${esc(t)}</div>`}
function graphRefresh(){
  /* re-render only the graph block, keeping focus out of the way */
  const host=$('#graphhost');if(!host)return;const sy=window.scrollY;host.innerHTML=graphHTML();graphBind();window.scrollTo(0,sy);updateChrome();
  const g=gInit();if(helped()&&gValid(g)){const e=graphEval(),w=[];
    if(!e.fits&&isDev())w.push('Some of your averages do not fit on your axes. Make the highest number bigger.');
    else if(!e.fits&&isPro())w.push('Some of your data is outside your axes.');
    if(w.length)gWarn(w[0])}
}

/* ---- line or curve of best fit ---- */
function fitFn(f){
  if(f.curve&&Math.abs(f.x1-f.xm)>1e-9&&Math.abs(f.x2-f.xm)>1e-9&&Math.abs(f.x1-f.x2)>1e-9){const{x1,y1,xm,ym,x2,y2}=f;
    return x=>y1*(x-xm)*(x-x2)/((x1-xm)*(x1-x2))+ym*(x-x1)*(x-x2)/((xm-x1)*(xm-x2))+y2*(x-x1)*(x-xm)/((x2-x1)*(x2-xm))}
  const k=(f.y2-f.y1)/((f.x2-f.x1)||1e-9);return x=>f.y1+k*(x-f.x1);
}
function lsq(pts,deg){ /* least-squares polynomial (degree 1 or 2); returns rms */
  const n=pts.length,d=deg+1;if(n<=deg)return 0;const M=[...Array(d)].map(()=>Array(d+1).fill(0));
  pts.forEach(([x,y])=>{const p=[1,x,x*x];for(let i=0;i<d;i++){for(let j=0;j<d;j++)M[i][j]+=p[i]*p[j];M[i][d]+=p[i]*y}});
  for(let i=0;i<d;i++){let mx=i;for(let r=i+1;r<d;r++)if(Math.abs(M[r][i])>Math.abs(M[mx][i]))mx=r;[M[i],M[mx]]=[M[mx],M[i]];if(Math.abs(M[i][i])<1e-12)return null;for(let r=0;r<d;r++)if(r!==i){const t=M[r][i]/M[i][i];for(let c=i;c<=d;c++)M[r][c]-=t*M[i][c]}}
  const co=M.map((r,i)=>r[d]/r[i]);return Math.sqrt(pts.reduce((a,[x,y])=>a+(y-(co[0]+co[1]*x+(d>2?co[2]*x*x:0)))**2,0)/n);
}
function fitEval(f,pts){
  if(pts.length<2)return{fitOK:false,bendy:false,fitShort:false};
  const fy=fitFn(f),ys=pts.map(p=>p[1]),xs=pts.map(p=>p[0]),yr=Math.max(Math.max(...ys)-Math.min(...ys),Math.abs(ys.reduce((a,b)=>a+b,0)/ys.length)*.1,1e-6);
  const rms=Math.sqrt(pts.reduce((a,[x,y])=>a+(y-fy(x))**2,0)/pts.length);
  const lin=lsq(pts,1)||0,quad=pts.length>=3?(lsq(pts,2)??lin):lin,best=f.curve?quad:lin;
  const a=Math.min(f.x1,f.x2),b=Math.max(f.x1,f.x2),xr=Math.max(...xs)-Math.min(...xs)||1,cover=(Math.min(b,Math.max(...xs))-Math.max(a,Math.min(...xs)))/xr;
  const fitShort=cover<0.7;
  return{fitOK:!fitShort&&rms<=Math.max(best*1.6,best+0.08*yr),bendy:pts.length>=4&&lin>0.06*yr&&quad<0.5*lin,fitShort,fitRms:rms};
}
