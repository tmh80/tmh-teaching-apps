/* ==========================================================================
   Table maker and graph maker for a student journal (reference copy)
   First built for Tilt Lab (Nov 2026). The graph maker follows the Paper Plane Lab
   graph tool (paper-plane-lab/src/graph.js): drag chips onto the graph, axis numbers,
   line or curve of best fit, green and red rings.

   This file is pasted inside a sim's single script, so it expects the host to provide:
     $(id)             document.getElementById
     esc(text)         HTML escape
     toast(message)    small message at the bottom of the screen
     saveSoon()        debounced save of the student's progress
     RQ                journal state: RQ.tables[], RQ.graphs[], RQ.qs[id].ev[] (evidence ids)
     rqSt(id)          the per-question state (ev = ids of the pieces of evidence chosen)
     rqShot(id)        finds a screenshot by id (screenshots are the third kind of evidence)
     MAXEV             most pieces of evidence per question (5)
     renderRq(keep)    re-draws the journal; NB, NBV  journal open flag and view name
   The journal calls: makerHTML(s), tbAction(d), grAction(d), tbInput(el), rqItem(id),
   evFigHTML(id, n) for the worksheet, cleanTable / cleanGraph when loading saved work.
   The graph window is a fixed full-height dialog with its own styles (.rqgraph, .gmwrap,
   .gmchip ...); copy those rules from tilt-lab/Tilt-Lab-offline.html (search ".rqgraph").
   ========================================================================== */
/* ---------- Table maker and graph maker for the journal (Oct 2026) ----------
   Tables are typed in the journal drawer, so the dashboard stays visible while students read their numbers.
   The graph maker follows the Paper Plane Lab graph tool: choose a type, title and labels, axis numbers, then drag each point or bar onto the graph. */
const MAXT=6,MAXG=6,MAXCOLS=5,MAXROWS=12;
const TB_QUICK=["Date","Place","Planet","Tilt (°)","Latitude (°)","Midday Sun (°)","Daylight (h)","Temperature (°C)"];
const TB_OPEN=new Set();
const nid=p=>p+Date.now().toString(36)+Math.floor(Math.random()*46656).toString(36);
const rqTable=id=>RQ.tables.find(x=>x.id===id);
const rqGraph=id=>RQ.graphs.find(x=>x.id===id);
const rqItem=id=>rqShot(id)||rqTable(id)||rqGraph(id);
const tbName=t=>t.title.trim()||`Table ${RQ.tables.indexOf(t)+1}`;
const grName=g=>g.title.trim()||`Graph ${RQ.graphs.indexOf(g)+1}`;
const gmNum=v=>{const n=parseFloat(String(v==null?"":v).replace(",","."));return isFinite(n)?n:NaN};
function newTable(){return{id:nid("t"),title:"",cols:["","",""],rows:[0,1,2,3].map(()=>["","",""]),cap:""}}
function newGraph(){const t=RQ.tables[RQ.tables.length-1];
  return{id:nid("g"),tid:t?t.id:"",xc:0,yc:1,type:"",title:"",xl:"",yl:"",xmin:"",xmax:"",xstep:"",ymin:"",ymax:"",ystep:"",pts:{},slots:[],bars:{},fit:null,join:false,cap:""}}
function cleanTable(t){if(!t||typeof t!=="object"||!Array.isArray(t.cols)||!Array.isArray(t.rows))return null;
  const nc=Math.max(1,Math.min(MAXCOLS,t.cols.length));
  return{id:String(t.id||nid("t")),title:String(t.title||"").slice(0,60),cols:t.cols.slice(0,nc).map(c=>String(c||"").slice(0,30)),
    rows:t.rows.slice(0,MAXROWS).map(r=>[...Array(nc)].map((_,i)=>String((Array.isArray(r)?r[i]:"")||"").slice(0,24))),cap:String(t.cap||"").slice(0,160)}}
function cleanGraph(g){if(!g||typeof g!=="object")return null;const b=newGraph();
  ["id","tid","type","title","xl","yl","xmin","xmax","xstep","ymin","ymax","ystep","cap"].forEach(k=>{if(g[k]!==undefined)b[k]=String(g[k])});
  b.xc=Math.max(0,Math.min(MAXCOLS-1,+g.xc||0));b.yc=Math.max(0,Math.min(MAXCOLS-1,+g.yc||0));b.join=!!g.join;
  b.pts=g.pts&&typeof g.pts==="object"?g.pts:{};b.slots=Array.isArray(g.slots)?g.slots:[];b.bars=g.bars&&typeof g.bars==="object"?g.bars:{};b.fit=g.fit&&typeof g.fit==="object"?g.fit:null;
  if(b.type!=="scatter"&&b.type!=="bar")b.type="";return b}

/* ===== tables (inside the journal) ===== */
function tableHTML(t,s){
  const on=s.ev.includes(t.id);
  const head=t.cols.map((c,ci)=>`<th><input type="text" maxlength="30" data-tbh="${t.id}" data-c="${ci}" value="${esc(c)}" placeholder="Heading ${ci+1}" aria-label="Column ${ci+1} heading"></th>`).join("");
  const body=t.rows.map((r,ri)=>`<tr>${r.map((v,ci)=>`<td><input type="text" maxlength="24" data-tbc="${t.id}" data-r="${ri}" data-c="${ci}" value="${esc(v)}" aria-label="Row ${ri+1}, column ${ci+1}"></td>`).join("")}</tr>`).join("");
  return `<div class="rqtb ${on?"on":""}" data-tb="${t.id}">
   <input type="text" class="tbtitle" maxlength="60" data-tbtitle="${t.id}" value="${esc(t.title)}" placeholder="Table title, for example: Daylight in Beijing" aria-label="Table title">
   <details data-tbd="${t.id}" ${TB_OPEN.has(t.id)?"open":""}><summary>Quick headings</summary><div class="tbquick">${TB_QUICK.map(h=>`<button type="button" class="mini" data-tbq="${t.id}" data-h="${esc(h)}">${esc(h)}</button>`).join("")}</div></details>
   <div class="tbscroll"><table class="tbe"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
   <div class="tbbtns"><button type="button" class="mini" data-tbadd="${t.id}" data-k="row" ${t.rows.length>=MAXROWS?"disabled":""}>＋ Row</button><button type="button" class="mini" data-tbadd="${t.id}" data-k="col" ${t.cols.length>=MAXCOLS?"disabled":""}>＋ Column</button><button type="button" class="mini" data-tbrm="${t.id}" data-k="row" ${t.rows.length<=1?"disabled":""}>− Row</button><button type="button" class="mini" data-tbrm="${t.id}" data-k="col" ${t.cols.length<=2?"disabled":""}>− Column</button></div>
   <label class="rqevlab"><input type="checkbox" data-shev="${t.id}" ${on?"checked":""}> Use as evidence</label>
   <textarea rows="2" maxlength="160" data-shcap="${t.id}" aria-label="What this table shows" placeholder="What does this table show? Explain it in a sentence or two.">${esc(t.cap)}</textarea>
   <button type="button" class="mini rqdel" data-tbdel="${t.id}">Delete table</button></div>`;
}
function tbRefresh(id){const t=rqTable(id),el=$("nb").querySelector(`[data-tb="${id}"]`);if(!t||!el)return;
  const s=rqSt(RQ.cur);const tmp=document.createElement("div");tmp.innerHTML=tableHTML(t,s);el.replaceWith(tmp.firstElementChild)}
function tbAction(d){
  if(d.tbnew!==undefined){if(RQ.tables.length>=MAXT){toast(`You can keep ${MAXT} tables. Delete one to make another.`);return true}
    const t=newTable();RQ.tables.push(t);saveSoon();renderRq(true);const el=$("nb").querySelector(`[data-tb="${t.id}"]`);if(el){el.scrollIntoView({block:"center"});const i=el.querySelector(".tbtitle");if(i)i.focus()}return true}
  if(d.tbdel){const t=rqTable(d.tbdel);if(!t)return true;
    if(TB_DEL!==d.tbdel){TB_DEL=d.tbdel;toast("Press Delete table again to remove it.");setTimeout(()=>{if(TB_DEL===d.tbdel)TB_DEL=null},3500);return true}
    TB_DEL=null;RQ.tables=RQ.tables.filter(x=>x.id!==d.tbdel);Object.values(RQ.qs).forEach(z=>{z.ev=z.ev.filter(i=>i!==d.tbdel)});saveSoon();renderRq(true);return true}
  if(d.tbadd){const t=rqTable(d.tbadd);if(!t)return true;
    if(d.k==="row"&&t.rows.length<MAXROWS)t.rows.push(t.cols.map(()=>""));
    else if(d.k==="col"&&t.cols.length<MAXCOLS){t.cols.push("");t.rows.forEach(r=>r.push(""))}
    saveSoon();tbRefresh(t.id);return true}
  if(d.tbrm){const t=rqTable(d.tbrm);if(!t)return true;
    const row=d.k==="row",any=row?t.rows[t.rows.length-1].some(v=>v.trim()):(t.cols[t.cols.length-1].trim()||t.rows.some(r=>r[r.length-1].trim()));
    if(any&&TB_RM!==d.tbrm+d.k){TB_RM=d.tbrm+d.k;toast(`The last ${row?"row":"column"} has writing in it. Press the button again to remove it.`);setTimeout(()=>{TB_RM=null},3500);return true}
    TB_RM=null;if(row&&t.rows.length>1)t.rows.pop();else if(!row&&t.cols.length>2){t.cols.pop();t.rows.forEach(r=>r.pop())}
    saveSoon();tbRefresh(t.id);return true}
  if(d.tbq){const t=rqTable(d.tbq);if(!t)return true;
    let i=t.cols.findIndex(c=>!c.trim());
    if(i<0&&t.cols.length<MAXCOLS){t.cols.push("");t.rows.forEach(r=>r.push(""));i=t.cols.length-1}
    if(i<0){toast("All the columns have a heading. Type over one to change it.");return true}
    t.cols[i]=d.h;saveSoon();TB_OPEN.add(t.id);tbRefresh(t.id);return true}
  return false;
}
let TB_DEL=null,TB_RM=null;
function tbInput(t){
  const el=t.dataset;
  if(el.tbtitle){const x=rqTable(el.tbtitle);if(x){x.title=t.value;saveSoon()}return true}
  if(el.tbh){const x=rqTable(el.tbh);if(x){x.cols[+el.c]=t.value;saveSoon()}return true}
  if(el.tbc){const x=rqTable(el.tbc);if(x&&x.rows[+el.r]){x.rows[+el.r][+el.c]=t.value;saveSoon()}return true}
  return false;
}
function graphCardHTML(g,s){
  const on=s.ev.includes(g.id);
  return `<div class="rqgr ${on?"on":""}" data-gr="${g.id}"><img src="${gmImage(g)}" alt="Graph: ${esc(grName(g))}">
   <div class="tbbtns"><button type="button" class="mini" data-gredit="${g.id}">✏️ Edit graph</button></div>
   <label class="rqevlab"><input type="checkbox" data-shev="${g.id}" ${on?"checked":""}> Use as evidence</label>
   <textarea rows="2" maxlength="160" data-shcap="${g.id}" aria-label="What this graph shows" placeholder="What does this graph show? Explain it in a sentence or two.">${esc(g.cap)}</textarea>
   <button type="button" class="mini rqdel" data-grdel="${g.id}">Delete graph</button></div>`;
}
let GR_DEL=null;
function grAction(d){
  if(d.grnew!==undefined){
    if(!RQ.tables.length){toast("Make a table first. A graph is built from the numbers in a table.");return true}
    if(RQ.graphs.length>=MAXG){toast(`You can keep ${MAXG} graphs. Delete one to make another.`);return true}
    const g=newGraph();RQ.graphs.push(g);saveSoon();gmOpen(g.id);return true}
  if(d.gredit){gmOpen(d.gredit);return true}
  if(d.grdel){if(GR_DEL!==d.grdel){GR_DEL=d.grdel;toast("Press Delete graph again to remove it.");setTimeout(()=>{if(GR_DEL===d.grdel)GR_DEL=null},3500);return true}
    GR_DEL=null;RQ.graphs=RQ.graphs.filter(x=>x.id!==d.grdel);Object.values(RQ.qs).forEach(z=>{z.ev=z.ev.filter(i=>i!==d.grdel)});saveSoon();renderRq(true);return true}
  return false;
}
function makerHTML(s){
  return `<section><h4>📊 My tables and graphs</h4><p class="note">Record your numbers in a table, then turn the table into a graph. Tables and graphs can be evidence too. You can use up to ${MAXEV} pieces of evidence in total.</p>
   <div class="nbadd"><button type="button" class="primary" data-tbnew="1">＋ Make a table</button><button type="button" class="primary" data-grnew="1">＋ Make a graph</button></div>
   <div id="rqTb">${RQ.tables.map(t=>tableHTML(t,s)).join("")}</div>
   <div class="rqshots" id="rqGr">${RQ.graphs.map(g=>graphCardHTML(g,s)).join("")}</div>
   ${RQ.tables.length||RQ.graphs.length?"":`<p class="note rqnone">No tables or graphs yet.</p>`}</section>`;
}

/* ===== the graph maker ===== */
const GMW=1000,GMH=560,GML=200,GMR=34,GMT=62,GMB=96;
const GM={id:null,drag:null,ghost:null,cv:null};
function niceStep(range,target){const raw=range/(target||6),p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p;return(f<1.5?1:f<3?2:f<7?5:10)*p}
function gmRows(g){
  const t=rqTable(g.tid);if(!t)return[];
  return t.rows.map((r,i)=>{const xs=String(r[g.xc]==null?"":r[g.xc]).trim(),ys=String(r[g.yc]==null?"":r[g.yc]).trim(),x=gmNum(xs),y=gmNum(ys);
    return{key:String(i),label:xs,x:isNaN(x)?null:x,y:isNaN(y)?null:y,ok:!isNaN(y)&&(g.type==="bar"?xs!=="":!isNaN(x))}});
}
function gmOk(g){return gmRows(g).filter(r=>r.ok)}
function gmSync(g){const ok=gmOk(g),keys=ok.map(r=>r.key);
  if(g.type==="bar"){let s=(g.slots||[]).map(k=>k!=null&&keys.includes(k)?k:null);
    while(s.length>keys.length&&s[s.length-1]==null)s.pop();
    while(s.length>keys.length){const i=s.indexOf(null);if(i<0)break;s.splice(i,1)}
    while(s.length<keys.length)s.push(null);g.slots=s;Object.keys(g.bars).forEach(k=>{if(!keys.includes(k))delete g.bars[k]})}
  Object.keys(g.pts).forEach(k=>{if(!keys.includes(k))delete g.pts[k]});
}
function gmTicks(min,max,step){const o=[];if(!(step>0)||!(max>min))return o;let n=0;for(let v=min;v<=max+step*1e-6&&n<60;v+=step,n++)o.push(Math.round(v*1e6)/1e6);return o}
function gmValid(g){
  if(!g.type)return false;
  const y=gmNum(g.ymax)>gmNum(g.ymin)&&gmNum(g.ystep)>0&&gmTicks(gmNum(g.ymin),gmNum(g.ymax),gmNum(g.ystep)).length<=40;
  const x=g.type!=="scatter"||(gmNum(g.xmax)>gmNum(g.xmin)&&gmNum(g.xstep)>0&&gmTicks(gmNum(g.xmin),gmNum(g.xmax),gmNum(g.xstep)).length<=40);
  return y&&x;
}
function gmSuggest(g){
  const R=gmOk(g);if(!R.length)return false;
  const ys=R.map(r=>r.y),mx=Math.max(...ys),mn=Math.min(...ys),lo=mn<0?mn:0,st=niceStep((mx-lo)||1,6);
  g.ymin=String(Math.floor(lo/st)*st);let hi=Math.ceil(mx/st)*st;if(hi-mx<st*.15)hi+=st;if(hi<=Math.floor(lo/st)*st)hi=Math.floor(lo/st)*st+st;g.ymax=String(Math.round(hi*1e6)/1e6);g.ystep=String(st);
  if(g.type==="scatter"){const xs=R.map(r=>r.x),a=Math.min(...xs),b=Math.max(...xs),sx=niceStep((b-a)||1,6);g.xstep=String(sx);let x0=Math.floor((a-sx*.5)/sx)*sx;if(a>=0&&x0<0)x0=0;g.xmin=String(x0);g.xmax=String(Math.ceil((b+sx*.5)/sx)*sx)}
  return true;
}
function gmWrap(c,text,maxW){const ws=String(text).split(/\s+/),lines=[];let cur="";ws.forEach(w=>{const t=cur?cur+" "+w:w;if(c.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);return lines}
function gmMap(g){
  const L=GML,R=GMW-GMR,T=GMT,B=GMH-GMB,ymin=gmNum(g.ymin),ymax=gmNum(g.ymax),xmin=gmNum(g.xmin),xmax=gmNum(g.xmax),n=Math.max(1,(g.slots||[]).length);
  return{L,R,T,B,ymin,ymax,xmin,xmax,n,px:x=>L+(x-xmin)/(xmax-xmin)*(R-L),py:y=>B-(y-ymin)/(ymax-ymin)*(B-T),vx:p=>xmin+(p-L)/(R-L)*(xmax-xmin),vy:p=>gmNum(ymin)+(B-p)/(B-T)*(ymax-ymin),slotX:i=>L+(R-L)*(i+.5)/n,slotW:(R-L)/n};
}
function gmFit(f){
  if(f.curve&&Math.abs(f.x1-f.xm)>1e-9&&Math.abs(f.x2-f.xm)>1e-9&&Math.abs(f.x1-f.x2)>1e-9){const{x1,y1,xm,ym,x2,y2}=f;
    return x=>y1*(x-xm)*(x-x2)/((x1-xm)*(x1-x2))+ym*(x-x1)*(x-x2)/((xm-x1)*(xm-x2))+y2*(x-x1)*(x-xm)/((x2-x1)*(x2-xm))}
  const k=(f.y2-f.y1)/((f.x2-f.x1)||1e-9);return x=>f.y1+k*(x-f.x1);
}
const gmFmt=v=>String(Math.round(v*1000)/1000);
function gmAxisLabels(c,g,L,R,T,B){
  c.fillStyle="#14202e";c.font='bold 21px system-ui,"Segoe UI","PingFang SC",sans-serif';c.textAlign="left";
  if(g.yl){const lines=gmWrap(c,g.yl,L-92),y0=(T+B)/2-(lines.length-1)*13;lines.forEach((ln,i)=>c.fillText(ln,10,y0+i*26))}
  c.textAlign="center";if(g.xl)c.fillText(g.xl,(L+R)/2,GMH-16);
}
function gmDrawOn(c,g,o){
  o=o||{};const W=GMW,H=GMH,valid=gmValid(g),m=valid?gmMap(g):null,isNum=g.type==="scatter",L=GML,R=W-GMR,T=GMT,B=H-GMB;
  c.fillStyle="#fff";c.fillRect(0,0,W,H);c.textBaseline="alphabetic";c.textAlign="center";
  if(g.title){let f=26;c.fillStyle="#14202e";c.font=`bold ${f}px system-ui,"Segoe UI","PingFang SC",sans-serif`;while(f>14&&c.measureText(g.title).width>R-L){f--;c.font=`bold ${f}px system-ui,"Segoe UI","PingFang SC",sans-serif`}c.fillText(g.title,(L+R)/2+20,38)}
  else if(o.inter){c.fillStyle="#9aa7b6";c.font="italic 22px system-ui,sans-serif";c.fillText("Graph title",(L+R)/2+20,38)}
  if(!valid){c.fillStyle="#5a6878";c.font="20px system-ui,sans-serif";c.textAlign="center";
    c.fillText(g.type?"Choose your axis numbers to start the graph.":"Choose a type of graph to start.",(L+R)/2,(T+B)/2);
    c.strokeStyle="#14202e";c.lineWidth=3;c.beginPath();c.moveTo(L,T);c.lineTo(L,B);c.lineTo(R,B);c.stroke();gmAxisLabels(c,g,L,R,T,B);return}
  c.font="19px system-ui,sans-serif";c.lineWidth=1;
  gmTicks(m.ymin,m.ymax,gmNum(g.ystep)).forEach(v=>{const y=m.py(v);c.strokeStyle="#dfe5ec";c.beginPath();c.moveTo(L,y);c.lineTo(R,y);c.stroke();c.fillStyle="#14202e";c.textAlign="right";c.fillText(gmFmt(v),L-10,y+6)});
  if(isNum)gmTicks(m.xmin,m.xmax,gmNum(g.xstep)).forEach(v=>{const x=m.px(v);c.strokeStyle="#eef1f5";c.beginPath();c.moveTo(x,T);c.lineTo(x,B);c.stroke();c.fillStyle="#14202e";c.textAlign="center";c.fillText(gmFmt(v),x,B+26)});
  c.strokeStyle="#14202e";c.lineWidth=3;c.beginPath();c.moveTo(L,T);c.lineTo(L,B);c.lineTo(R,B);c.stroke();
  gmAxisLabels(c,g,L,R,T,B);
  const rows=gmOk(g);
  const hint=(t1,t2)=>{c.fillStyle="rgba(194,112,12,.10)";c.fillRect(L+30,(T+B)/2-50,R-L-60,92);c.strokeStyle="#c2700c";c.lineWidth=2;c.setLineDash([8,6]);c.strokeRect(L+30,(T+B)/2-50,R-L-60,92);c.setLineDash([]);c.fillStyle="#8a4f06";c.textAlign="center";c.font="bold 24px system-ui,sans-serif";c.fillText(t1,(L+R)/2,(T+B)/2-12);c.font="19px system-ui,sans-serif";c.fillText(t2,(L+R)/2,(T+B)/2+22)};
  if(o.inter&&isNum&&!Object.keys(g.pts).length)hint("✋ Click and drag each point onto the graph","Hold the mouse down on a blue chip, move it here, then let go.");
  if(o.inter&&!isNum&&!g.slots.some(x=>x!=null))hint("✋ Click and drag each name into a box below","Hold the mouse down on an orange chip, move it to a box, then let go.");
  if(isNum){
    const placed=rows.filter(r=>g.pts[r.key]).map(r=>({r,pt:g.pts[r.key]}));
    if(g.join&&placed.length>1){const s2=placed.slice().sort((a,b)=>a.pt.x-b.pt.x);c.strokeStyle="#1b7ea6";c.lineWidth=3;c.beginPath();s2.forEach((p,i)=>{const X=m.px(p.pt.x),Y=m.py(p.pt.y);i?c.lineTo(X,Y):c.moveTo(X,Y)});c.stroke()}
    if(g.fit){const f=g.fit,fy=gmFit(f);c.strokeStyle="#c2700c";c.lineWidth=3;c.setLineDash([10,6]);c.beginPath();
      if(f.curve){const a=Math.min(f.x1,f.x2),b=Math.max(f.x1,f.x2);c.save();c.beginPath();c.rect(L,T,R-L,B-T);c.clip();c.beginPath();for(let i=0;i<=80;i++){const x=a+(b-a)*i/80,X=m.px(x),Y=m.py(fy(x));i?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke();c.restore()}
      else{c.moveTo(m.px(f.x1),m.py(f.y1));c.lineTo(m.px(f.x2),m.py(f.y2));c.stroke()}c.setLineDash([]);
      if(o.inter){[[f.x1,f.y1],[f.x2,f.y2]].concat(f.curve?[[f.xm,f.ym]]:[]).forEach(p=>{c.fillStyle="#fff";c.strokeStyle="#c2700c";c.lineWidth=3;c.beginPath();c.arc(m.px(p[0]),m.py(p[1]),9,0,7);c.fill();c.stroke()})}}
    placed.forEach(({r,pt})=>{const X=m.px(pt.x),Y=m.py(pt.y);
      if(o.inter){const ok=Math.abs(pt.x-r.x)<=(m.xmax-m.xmin)*.035&&Math.abs(pt.y-r.y)<=(m.ymax-m.ymin)*.035;c.strokeStyle=ok?"#2e7d4f":"#b3301e";c.lineWidth=4;c.beginPath();c.arc(X,Y,14,0,7);c.stroke()}
      c.fillStyle="#1b7ea6";c.strokeStyle="#0d4a63";c.lineWidth=2;c.beginPath();c.arc(X,Y,8,0,7);c.fill();c.stroke()});
  }else{
    const bw=m.slotW*.5;
    g.slots.forEach((key,i)=>{const cxp=m.slotX(i);
      if(key==null){if(o.inter){c.setLineDash([6,5]);c.strokeStyle="#9aa7b6";c.lineWidth=2;c.strokeRect(cxp-m.slotW*.42,B+8,m.slotW*.84,40);c.setLineDash([]);c.fillStyle="#9aa7b6";c.font="16px system-ui,sans-serif";c.textAlign="center";c.fillText("drop a name here",cxp,B+33)}return}
      const h=g.bars[key],val=h==null?m.ymin:h,y=m.py(Math.max(m.ymin,Math.min(m.ymax,val)));
      c.fillStyle="#8cc3dc";c.strokeStyle="#0d4a63";c.lineWidth=2;c.fillRect(cxp-bw/2,y,bw,B-y);c.strokeRect(cxp-bw/2,y,bw,B-y);
      const r=rows.find(q=>q.key===key);
      if(o.inter){const ok=r&&Math.abs(val-r.y)<=(m.ymax-m.ymin)*.035;c.fillStyle="#fff";c.strokeStyle=h==null?"#c2700c":ok?"#2e7d4f":"#b3301e";c.lineWidth=4;c.beginPath();c.arc(cxp,y,11,0,7);c.fill();c.stroke()}
      c.fillStyle="#14202e";c.font="bold 20px system-ui,sans-serif";c.textAlign="center";
      gmWrap(c,r?r.label:"",m.slotW*.9).forEach((ln,j)=>c.fillText(ln,cxp,B+28+j*22));
    });
  }
}
function gmImage(g){
  try{gmSync(g);const c=document.createElement("canvas");c.width=GMW;c.height=GMH;gmDrawOn(c.getContext("2d"),g,{});return c.toDataURL("image/png")}catch(e){return ""}
}
/* what the checklist says about the graph */
function gmEval(g){
  const rows=gmOk(g),r={};
  r.type=!!g.type;r.title=!!g.title.trim();
  r.xl=!!g.xl.trim()&&/\(.+\)/.test(g.xl)||!!g.xl.trim()&&g.type==="bar";
  r.yl=!!g.yl.trim()&&/\(.+\)/.test(g.yl);
  r.valid=gmValid(g);r.total=rows.length;
  r.fits=false;r.placed=0;r.accurate=0;
  if(r.valid){const m=gmMap(g);
    r.fits=rows.every(q=>q.y>=m.ymin&&q.y<=m.ymax&&(g.type!=="scatter"||(q.x>=m.xmin&&q.x<=m.xmax)));
    rows.forEach(q=>{if(g.type==="scatter"){const pt=g.pts[q.key];if(pt){r.placed++;if(Math.abs(pt.x-q.x)<=(m.xmax-m.xmin)*.035&&Math.abs(pt.y-q.y)<=(m.ymax-m.ymin)*.035)r.accurate++}}
      else if(g.slots.includes(q.key)&&g.bars[q.key]!=null){r.placed++;if(Math.abs(g.bars[q.key]-q.y)<=(m.ymax-m.ymin)*.035)r.accurate++}})}
  return r;
}
function gmChecksHTML(g){
  const e=gmEval(g),it=(ok,t)=>`<li class="${ok?"yes":"no"}"><span aria-hidden="true">${ok?"✓":"○"}</span> ${t}</li>`;
  return `<ul class="gmlist">${it(e.type,"A type of graph is chosen")}${it(e.title,"The graph has a title")}${it(e.xl,g.type==="bar"?"The x-axis has a label":"The x-axis label has units in brackets")}${it(e.yl,"The y-axis label has units in brackets")}${it(e.valid&&e.fits&&e.total>0,"All the data fits on the axes")}${it(e.total>0&&e.placed===e.total,`All the data is on the graph (${e.placed} of ${e.total})`)}${it(e.total>0&&e.accurate===e.total,"Every point or bar is in the right place")}</ul>`;
}
function gmChecksUpdate(){const g=rqGraph(GM.id),el=$("gmChecks");if(g&&el)el.innerHTML=gmChecksHTML(g)}
function gmDraw(){const g=rqGraph(GM.id),cv=$("gmcv");if(!g||!cv)return;gmSync(g);gmDrawOn(cv.getContext("2d"),g,{inter:true});gmChecksUpdate()}

/* ----- the graph maker window ----- */
function gmColOpts(t,sel){return t?t.cols.map((c,i)=>`<option value="${i}" ${i===sel?"selected":""}>${esc(c.trim()||"Column "+(i+1))}</option>`).join(""):""}
function gmHTML(g){
  gmSync(g);
  const t=rqTable(g.tid),isNum=g.type==="scatter",rows=gmRows(g).filter(r=>r.ok);
  const xNumeric=t&&t.rows.some(r=>String(r[g.xc]||"").trim())&&t.rows.filter(r=>String(r[g.xc]||"").trim()).every(r=>!isNaN(gmNum(r[g.xc])));
  const tableSel=`<label class="lbl">Table<select data-gb="tid">${t?"":`<option value="">Choose a table</option>`}${RQ.tables.map(x=>`<option value="${x.id}" ${x.id===g.tid?"selected":""}>${esc(tbName(x))}</option>`).join("")}</select></label>
   <div class="gm2"><label class="lbl">x-axis (along the bottom)<select data-gb="xc">${gmColOpts(t,g.xc)}</select></label><label class="lbl">y-axis (up the side)<select data-gb="yc">${gmColOpts(t,g.yc)}</select></label></div>`;
  const type=`<div class="gmtype"><button type="button" class="${isNum?"sel":""}" data-gtype="scatter">Scatter graph</button><button type="button" class="${g.type==="bar"?"sel":""}" data-gtype="bar">Bar graph</button></div>
   <p class="note">Use a <b>scatter graph</b> when the x-axis shows numbers, like tilt in degrees. Use a <b>bar graph</b> when the x-axis shows names, like cities or planets.</p>
   ${isNum&&t&&!xNumeric?`<div class="gmwarn">A scatter graph needs numbers in the x-axis column. This column has words in it. Choose a different column or a bar graph.</div>`:""}`;
  const labels=`<input type="text" maxlength="70" data-gb="title" value="${esc(g.title)}" placeholder="… vs …" aria-label="Graph title">
   <div class="gm2"><label class="lbl">x-axis label<input type="text" maxlength="50" data-gb="xl" value="${esc(g.xl)}" placeholder="for example Tilt (°)"></label><label class="lbl">y-axis label<input type="text" maxlength="50" data-gb="yl" value="${esc(g.yl)}" placeholder="for example Daylight (h)"></label></div>
   <button type="button" class="mini" data-gcols="1">Use my column headings</button>`;
  const axes=g.type?`<div class="gmax"><b>y-axis</b><label>lowest<input type="number" data-gb="ymin" value="${esc(g.ymin)}"></label><label>highest<input type="number" data-gb="ymax" value="${esc(g.ymax)}"></label><label>gap<input type="number" data-gb="ystep" value="${esc(g.ystep)}"></label></div>
   ${isNum?`<div class="gmax"><b>x-axis</b><label>lowest<input type="number" data-gb="xmin" value="${esc(g.xmin)}"></label><label>highest<input type="number" data-gb="xmax" value="${esc(g.xmax)}"></label><label>gap<input type="number" data-gb="xstep" value="${esc(g.xstep)}"></label></div>`:`<p class="note">The x-axis shows the names from your table.</p>`}
   <button type="button" class="mini" data-gsug="1">Suggest numbers for me</button><div id="gmwarn" class="gmwarn" hidden></div>`:`<p class="note">Choose a type of graph first.</p>`;
  let plot="";
  if(!g.type)plot=`<p class="note">Choose a type of graph first.</p>`;
  else if(!rows.length)plot=`<div class="gmwarn">${isNum?"There is no data to plot yet. Fill in numbers in two columns of your table.":"There is no data to plot yet. Fill in names and numbers in two columns of your table."}</div>`;
  else if(isNum){
    plot=`<div class="gmhow"><b>How to plot:</b><ol><li><b>Click and hold</b> a blue chip.</li><li><b>Drag</b> it onto the graph, to where its x number and y number meet.</li><li><b>Let go</b> to drop the point. Drag a point on the graph to move it.</li></ol></div>
     <div class="gmtray">${rows.map(r=>{const placed=!!g.pts[r.key];return `<div class="gmchip ${placed?"placed":Object.keys(g.pts).length?"":"wiggle"}" data-chip="${r.key}"><span class="grip" aria-hidden="true">⠿</span>${esc(r.label)}, ${esc(gmFmt(r.y))}${placed?" ✓":""}</div>`}).join("")}</div>
     <div class="tbbtns">${g.fit?`<button type="button" class="mini" data-gfit="none">Remove ${g.fit.curve?"curve":"line"} of best fit</button><button type="button" class="mini" data-gfit="${g.fit.curve?"line":"curve"}">Change to a ${g.fit.curve?"straight line":"curve"}</button>`:`<button type="button" class="mini" data-gfit="line">Draw a line of best fit</button><button type="button" class="mini" data-gfit="curve">Draw a curve of best fit</button>`}<button type="button" class="mini" data-gjoin="1">${g.join?"Stop joining the points":"Join the points"}</button></div>
     ${g.fit?`<p class="note">Drag the round ends to move the ${g.fit.curve?"curve (the middle dot bends it)":"line"}. It should go through the middle of your points.</p>`:""}`;
  }else{
    const free=rows.filter(r=>!g.slots.includes(r.key));
    plot=`<div class="gmhow"><b>How to build it:</b><ol><li><b>Click and hold</b> an orange chip, <b>drag</b> it into a box under the graph and <b>let go</b>. You choose the order.</li><li>Then <b>drag</b> the round dot at the top of each bar up or down to its height.</li></ol></div>
     <div class="gmtray row">${free.length?free.map(r=>`<div class="gmchip cat ${g.slots.some(x=>x!=null)?"":"wiggle"}" data-chip="${r.key}"><span class="grip" aria-hidden="true">⠿</span>${esc(r.label)}, ${esc(gmFmt(r.y))}</div>`).join(""):`<span class="note">All placed.</span>`}</div>`;
  }
  return `<div class="rqghead"><b>📊 Make a graph</b><span><button type="button" class="primary" data-gdone="1">Done: back to my journal</button></span></div>
   <div class="gmwrap"><div class="gmleft">
    <div class="gmq"><h3>1 · Choose your data</h3>${RQ.tables.length?tableSel:`<p class="note">You have no tables yet. Make a table in your journal first.</p>`}</div>
    <div class="gmq"><h3>2 · Type of graph</h3>${type}</div>
    <div class="gmq"><h3>3 · Title and labels</h3>${labels}</div>
    <div class="gmq"><h3>4 · Axis numbers</h3>${axes}</div>
    <div class="gmq"><h3>5 · Plot your data</h3>${plot}</div>
   </div><div class="gmright"><canvas id="gmcv" width="${GMW}" height="${GMH}" style="background:#fff;cursor:crosshair;touch-action:none" aria-label="Your graph"></canvas>
    <p class="note">A green ring means a point or bar is in the right place. A red ring means check the numbers again.</p>
    <div class="gmq"><h3>Checklist</h3><div id="gmChecks"></div></div></div></div>`;
}
function gmEnsure(){
  let m=$("rqgraph");
  if(m)return m;
  m=document.createElement("div");m.id="rqgraph";m.className="rqgraph";m.hidden=true;m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Make a graph");document.body.appendChild(m);
  m.addEventListener("click",gmClick);m.addEventListener("input",gmInput);m.addEventListener("change",gmChange);m.addEventListener("pointerdown",gmDown);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("rqgraph").hidden){e.stopPropagation();gmClose()}},true);
  return m;
}
function gmOpen(id){
  const g=rqGraph(id);if(!g)return;GM.id=id;const m=gmEnsure();
  if(!rqTable(g.tid)&&RQ.tables.length){g.tid=RQ.tables[RQ.tables.length-1].id}
  m.hidden=false;$("nb").inert=true;gmRender();
  const b=m.querySelector("select");if(b)b.focus();
}
function gmRender(){
  const m=$("rqgraph"),g=rqGraph(GM.id);if(!m||!g)return;
  const sc=m.querySelector(".gmleft"),keep=sc?sc.scrollTop:0,ms=m.scrollTop;
  m.innerHTML=`<div class="rqgbox">${gmHTML(g)}</div>`;
  const l=m.querySelector(".gmleft");if(l)l.scrollTop=keep;m.scrollTop=ms;
  const cv=$("gmcv");if(cv){cv.onpointerdown=gmCvDown;cv.onpointermove=gmCvMove;cv.onpointerup=gmCvUp;cv.onpointercancel=gmCvUp}
  gmDraw();
}
function gmClose(){
  const m=$("rqgraph");if(!m||m.hidden)return;gmDragEnd(true);const g=rqGraph(GM.id);if(g)gmSync(g);
  m.hidden=true;m.innerHTML="";GM.id=null;$("nb").inert=false;saveSoon();if(NB&&NBV==="rq")renderRq(true);
}
function gmWarn(t){const w=$("gmwarn");if(!w)return;w.hidden=false;w.textContent=t}
function gmResetPlot(g){g.pts={};g.slots=[];g.bars={};g.fit=null}
function gmClick(e){
  const b=e.target.closest("button");if(!b)return;const g=rqGraph(GM.id);if(!g)return;const d=b.dataset;
  if(d.gdone!==undefined){gmClose();return}
  if(d.gtype){if(g.type!==d.gtype){g.type=d.gtype;gmResetPlot(g);saveSoon();gmRender()}return}
  if(d.gsug!==undefined){if(gmSuggest(g)){saveSoon();gmRender()}else gmWarn("Fill in your table first, then I can suggest numbers.");return}
  if(d.gcols!==undefined){const t=rqTable(g.tid);if(t){g.xl=t.cols[g.xc]||"";g.yl=t.cols[g.yc]||"";saveSoon();gmRender()}return}
  if(d.gjoin!==undefined){g.join=!g.join;saveSoon();gmRender();return}
  if(d.gfit){
    if(d.gfit==="none"){g.fit=null}
    else if(!gmValid(g)){gmWarn("Choose your axis numbers first.");return}
    else{const m=gmMap(g),R=gmOk(g),my=R.length?R.reduce((a,r)=>a+r.y,0)/R.length:(m.ymin+m.ymax)/2,x1=m.xmin+(m.xmax-m.xmin)*.1,x2=m.xmax-(m.xmax-m.xmin)*.1,old=g.fit;
      if(d.gfit==="curve")g.fit={x1:old?old.x1:x1,y1:old?old.y1:my,x2:old?old.x2:x2,y2:old?old.y2:my,xm:((old?old.x1:x1)+(old?old.x2:x2))/2,ym:old?(old.y1+old.y2)/2:my,curve:true};
      else g.fit={x1:old?old.x1:x1,y1:old?old.y1:my,x2:old?old.x2:x2,y2:old?old.y2:my}}
    saveSoon();gmRender();return}
}
function gmInput(e){
  const t=e.target,k=t.dataset.gb;if(!k||t.tagName==="SELECT")return;const g=rqGraph(GM.id);if(!g)return;
  g[k]=t.value;saveSoon();gmDraw();
}
function gmChange(e){
  const t=e.target,k=t.dataset.gb;if(!k)return;const g=rqGraph(GM.id);if(!g)return;
  if(k==="tid"){g.tid=t.value;g.xc=0;g.yc=Math.min(1,(rqTable(g.tid)||{cols:[0,1]}).cols.length-1);gmResetPlot(g);g.xl="";g.yl=""}
  else if(k==="xc"||k==="yc"){g[k]=+t.value;gmResetPlot(g)}
  else return;
  saveSoon();gmRender();
}
/* dragging chips onto the canvas */
function gmDown(e){
  const chip=e.target.closest("[data-chip]");if(!chip)return;const g=rqGraph(GM.id);if(!g)return;
  const key=chip.dataset.chip,r=gmRows(g).find(q=>q.key===key);if(!r||!r.ok)return;
  if(!gmValid(g)){gmWarn("Choose your axis numbers first.");return}
  if(chip.classList.contains("placed")){delete g.pts[key];saveSoon();gmRender();return}
  e.preventDefault();gmDragStart(e,{type:g.type==="scatter"?"pt":"cat",key},chip.textContent.replace("✓","").replace("⠿","").trim(),g.type==="bar"?"cat":"");
}
function gmDragStart(ev,data,label,cls){
  gmDragEnd(true);GM.drag=data;
  const gh=document.createElement("div");gh.className="gmghost gmchip "+(cls||"");gh.textContent=label;gh.style.left=ev.clientX+"px";gh.style.top=ev.clientY+"px";document.body.appendChild(gh);GM.ghost=gh;
  window.addEventListener("pointermove",gmDragMove);window.addEventListener("pointerup",gmDragEnd,{once:true});
}
function gmDragMove(ev){if(GM.ghost){GM.ghost.style.left=ev.clientX+"px";GM.ghost.style.top=ev.clientY+"px"}}
function gmDragEnd(ev){
  window.removeEventListener("pointermove",gmDragMove);window.removeEventListener("pointerup",gmDragEnd);
  if(GM.ghost){GM.ghost.remove();GM.ghost=null}
  const d=GM.drag;GM.drag=null;if(ev===true||!d)return;
  const cv=$("gmcv"),g=rqGraph(GM.id);if(!cv||!g)return;
  const r=cv.getBoundingClientRect(),inside=ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom,x=(ev.clientX-r.left)/r.width*GMW,y=(ev.clientY-r.top)/r.height*GMH;
  if(inside&&gmValid(g)){const m=gmMap(g);
    if(d.type==="pt"){if(x>=m.L-6&&x<=m.R+6&&y>=m.T-6&&y<=m.B+6)gmPutPoint(g,d.key,m.vx(x),m.vy(y))}
    else{let i=Math.floor((x-m.L)/m.slotW);i=Math.max(0,Math.min(m.n-1,i));const old=g.slots.indexOf(d.key),prev=g.slots[i];if(old>=0)g.slots[old]=prev;g.slots[i]=d.key}}
  saveSoon();gmRender();
}
function gmPutPoint(g,key,x,y){
  const m=gmMap(g),r=gmRows(g).find(q=>q.key===key);
  if(r&&r.ok&&Math.abs(x-r.x)<=(m.xmax-m.xmin)*.07&&Math.abs(y-r.y)<=(m.ymax-m.ymin)*.07){x=r.x;y=r.y}
  g.pts[key]={x,y};
}
function gmSetBar(g,key,y){
  const m=gmMap(g),r=gmRows(g).find(q=>q.key===key);y=Math.max(m.ymin,Math.min(m.ymax,y));
  if(r&&r.ok&&Math.abs(y-r.y)<=(m.ymax-m.ymin)*.07)y=r.y;g.bars[key]=y;
}
/* dragging things that are already on the canvas */
function gmCvDown(ev){
  const cv=$("gmcv"),g=rqGraph(GM.id);if(!g||!gmValid(g))return;
  const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*GMW,y=(ev.clientY-r.top)/r.height*GMH,m=gmMap(g),rows=gmOk(g);
  if(g.type==="scatter"){
    if(g.fit){const hs=[["1",g.fit.x1,g.fit.y1],["2",g.fit.x2,g.fit.y2]].concat(g.fit.curve?[["m",g.fit.xm,g.fit.ym]]:[]);
      for(const [k,fx,fy] of hs){if(Math.hypot(x-m.px(fx),y-m.py(fy))<18){GM.cv={kind:"fit",k};cv.setPointerCapture(ev.pointerId);return}}}
    for(const q of rows){const pt=g.pts[q.key];if(pt&&Math.hypot(x-m.px(pt.x),y-m.py(pt.y))<16){GM.cv={kind:"pt",key:q.key};cv.setPointerCapture(ev.pointerId);return}}
  }else{
    g.slots.forEach((key,i)=>{if(key==null||GM.cv)return;const cxp=m.slotX(i),h=g.bars[key],val=h==null?m.ymin:h,py=m.py(val);
      if(Math.hypot(x-cxp,y-py)<18){GM.cv={kind:"bar",key};cv.setPointerCapture(ev.pointerId)}
      else if(y>m.B+4&&Math.abs(x-cxp)<m.slotW*.45){const q=rows.find(z=>z.key===key);gmDragStart(ev,{type:"cat",key},q?`${q.label}, ${gmFmt(q.y)}`:"","cat")}});
  }
}
function gmCvMove(ev){
  if(!GM.cv)return;const cv=$("gmcv"),g=rqGraph(GM.id);if(!g)return;
  const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*GMW,y=(ev.clientY-r.top)/r.height*GMH,m=gmMap(g),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  if(GM.cv.kind==="pt"){g.pts[GM.cv.key]={x:cl(m.vx(x),m.xmin,m.xmax),y:cl(m.vy(y),m.ymin,m.ymax)}}
  else if(GM.cv.kind==="bar"){g.bars[GM.cv.key]=cl(m.vy(y),m.ymin,m.ymax)}
  else if(GM.cv.kind==="fit"){const k=GM.cv.k,f=g.fit;f["x"+k]=cl(m.vx(x),m.xmin,m.xmax);f["y"+k]=cl(m.vy(y),m.ymin,m.ymax);
    if(f.curve){const a=Math.min(f.x1,f.x2),b=Math.max(f.x1,f.x2),gap=(m.xmax-m.xmin)*.04;if(k==="m")f.xm=cl(f.xm,a+gap,b-gap);else if(f.xm<=a+gap||f.xm>=b-gap)f.xm=(a+b)/2}}
  gmDraw();
}
function gmCvUp(){
  if(!GM.cv)return;const g=rqGraph(GM.id);const k=GM.cv;GM.cv=null;if(!g)return;
  if(k.kind==="pt"){const p=g.pts[k.key];if(p)gmPutPoint(g,k.key,p.x,p.y)}
  else if(k.kind==="bar"){gmSetBar(g,k.key,g.bars[k.key])}
  saveSoon();gmRender();
}

/* ===== evidence on the worksheet ===== */
function tbWsHTML(t){
  const rows=t.rows.filter(r=>r.some(v=>v.trim())),keep=t.cols.map((c,i)=>c.trim()||rows.some(r=>(r[i]||"").trim()));
  return `<table class="wst rqtw"><caption>${esc(tbName(t))}</caption><thead><tr>${t.cols.map((c,i)=>keep[i]?`<th>${esc(c)}</th>`:"").join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>keep[i]?`<td class="b">${esc(v)}</td>`:"").join("")}</tr>`).join("")}</tbody></table>`;
}
function evFigHTML(id,n){
  const sh=rqShot(id),t=!sh&&rqTable(id),g=!sh&&!t&&rqGraph(id),it=sh||t||g;if(!it)return "";
  const cap=`<figcaption><b>Evidence ${n}.</b> ${it.cap.trim()?esc(it.cap):"<i>No explanation written.</i>"}</figcaption>`;
  if(sh)return `<figure><img src="${sh.img}" alt="Evidence ${n}">${cap}</figure>`;
  if(t)return `<figure class="wide">${tbWsHTML(t)}${cap}</figure>`;
  return `<figure class="wide gfig"><img src="${gmImage(g)}" alt="Evidence ${n}: ${esc(grName(g))}">${cap}</figure>`;
}
