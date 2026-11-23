/* ===== the worksheet: PDF for Toddle, print, and the blank paper version ===== */
function svgToPng(svg,w,h){return new Promise(res=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);try{res(c.toDataURL('image/png'))}catch(e){res('')}};img.onerror=()=>res('');img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}
function cvURL(draw){const c=document.createElement('canvas');c.width=GW;c.height=GH;draw(c);return c.toDataURL('image/png')}
async function buildSheet(blankMode){
  const B=!!blankMode,v=x=>B?'':esc(x),f=x=>B||x==null||isNaN(x)?'':fmt(x),g6=!B&&isG6();
  const pr=PRED_OPTS.reduce((o,[k,l])=>(o[k]=l,o),{});
  const key=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0">${[['t','Time from start'],['l','Time for one metre'],['v','Speed'],['d','Change in speed'],['a','Acceleration']].map(([c,t])=>`<span style="border:2px solid ${COLS[c]};background:${SOFT[c]};color:${COLS[c]};border-radius:5px;padding:1px 8px;font-weight:700;font-size:11px">${t}</span>`).join('')}</div>`;
  const th=(c,t)=>`<th style="background:${SOFT[c]};color:${COLS[c]};border-bottom:3px solid ${COLS[c]}">${t}</th>`;
  const td=(c,t)=>`<td class="cell" style="color:${COLS[c]};font-weight:700;font-family:var(--font-num)">${t}</td>`;
  const n=B?3:S.trials,zone=k=>`background:${k<=RAMP_END?'#f3e3c3':'#e2e8f0'};text-align:left;font-weight:700`;
  const t1=`<table><tr><th>Distance</th>${[...Array(n)].map((_,i)=>th('t',`Trial ${i+1} (s)`)).join('')}${th('t','Average (s)')}</tr>${MS.map(k=>`<tr><td style="${zone(k)}">${k} m mark ${k<=RAMP_END?'(ramp)':'(flat)'}</td>${[...Array(n)].map((_,i)=>td('t',v(S.T[k][i]))).join('')}${td('t',f(avgT(k)))}</tr>`).join('')}</table>`;
  const t2=`<table><tr><th>Piece of track</th>${th('t','Time from start (s)')}${th('l','① Time for this metre (s)')}${th('v','② Speed (m/s)')}${th('d','③ Change in speed (m/s)')}${th('a','④ Acceleration (m/s²)'+(B?'':' *'))}</tr>
   <tr style="font-size:10px;color:#475569"><td>Formula</td><td>Table 1</td><td>this mark − last mark</td><td>1 ÷ time</td><td>this speed − speed before</td><td>change in speed ÷ time between middles</td></tr>
   ${MS.map(k=>`<tr><td style="${zone(k)}">Metre ${k} (${k-1}→${k} m)</td>${td('t',f(avgT(k)))}${td('l',v(S.leg[k]))}${td('v',v(S.spd[k]))}${td('d',v(S.chg[k]))}${td('a',f(accel(k))+(B||accel(k)==null?'':k===RAMP_END+1?' ⇄':accel(k)>0?' ⬆':' ⬇'))}</tr>`).join('')}</table>
   ${B?'<p style="font-size:10.5px;margin:3px 0">Metre 1: time = time at 1 m; change in speed = speed − 0. ④ Your teacher will help with acceleration: time between middles = half of one metre\'s time + half of the next.</p>':'<p style="font-size:10.5px;margin:3px 0">* Acceleration was worked out by the app from my numbers. ⬆ speeding up · ⬇ slowing down · ⇄ crosses the bottom of the ramp.</p>'}`;
  const gImg=cvURL(c=>drawGraph(c.getContext('2d'),B?{title:'',xl:'',yl:'',ymin:'',ymax:'',ystep:'',bars:{}}:S.g,{blank:B}));
  const vImg=B?'':cvURL(c=>drawSpeedModel(c));
  const fb={};for(const s of ['ramp','flat']){const arr=B?[]:isG6()?modelArrows(s):S.fbd[s].arrows||[];fb[s]=await svgToPng(fbdSVG(s,arr,{noDot:isG6()&&!B}),520,400)}
  const fq=s=>['bal','res','acc'].map(q=>{const d=fqDef(s,q);return`<div style="font-size:11px;margin:2px 0"><b>${d.p}</b> ${d.o.map(([val,l])=>`${!B&&S.fq[s+'.'+q]===val?'☑':'☐'} ${l}`).join('  ')}</div>`}).join('');
  let con;
  if(B||isG6()){const gap=k=>B?'<span style="display:inline-block;width:120px;border-bottom:1px solid #14202e">&nbsp;</span>':`<b style="color:#1e3a8a;text-decoration:underline">${esc(S.con[k]||'     ')}</b>`;
    con=`<p style="line-height:2">On the ramp, the cart was ${gap('f1')}. Its acceleration was a ${gap('f2')} number.<br>On the flat, the cart was ${gap('f3')}. Its acceleration was a ${gap('f4')} number.<br>On the flat, gravity could not pull the cart forwards any more, and ${gap('f5')} slowed it down.</p>
     <b>My prediction was… because…</b><div class="ans">${v(S.con.pred)}</div>`;
    if(B)con+=`<b>Grade 7/8: Claim, evidence, reasoning</b> (use two acceleration numbers and the words unbalanced, resultant force, friction)<div class="ans" style="min-height:90px"></div><b>Grade 7/8: Why is the metre 2 → 3 value a mix?</b><div class="ans"></div>`}
  else con=G78Q.map(([k,t])=>`<b>${t}</b><div class="ans">${esc(S.con[k]||'')}</div>`).join('');
  const hdr=(p)=>`<div class="hdr"><div><h1>Acceleration Lab: Worksheet</h1><div style="font-size:11px;color:#475569">How does a cart speed up on a ramp and slow down on the flat?</div></div>
    <div style="text-align:right;font-size:12px">${B?'Name: ____________________ &nbsp; Class: ______ &nbsp; Grade: ___':`<b>${esc(S.name)}</b> · ${esc(S.cls)} · ${S.grade==='6'?'Grade 6':'Grade '+(S.gnum||'7/8')}<br>${new Date().toLocaleDateString('en-GB')}`}</div></div>`;
  const foot=p=>`<div class="foot">Acceleration Lab · page ${p} of 2</div>`;
  const p1=`<div class="pg ${B?'blank':''}">${hdr(1)}${key}
   <h2>1. My prediction</h2><div>Down the ramp the cart will: ${B?'☐ speed up ☐ stay the same ☐ slow down':'<b>'+esc(pr[S.pred.ramp]||'—')+'</b>'} &nbsp;&nbsp; On the flat it will: ${B?'☐ speed up ☐ stay the same ☐ slow down':'<b>'+esc(pr[S.pred.flat]||'—')+'</b>'}</div>${!B&&S.pred.why?`<div class="ans" style="min-height:0;margin-top:4px">${esc(S.pred.why)}</div>`:''}
   <h2>2. Table 1: Time from the start</h2>${t1}
   <h2>3. Table 2: Each metre on its own</h2>${t2}
   <h2>4. My acceleration graph</h2><img src="${gImg}" style="width:${B?'78%':'86%'};border:1px solid #cbd5e1">
   ${B?'<p style="font-size:10.5px">Choose your y-axis numbers. Leave room <b>below zero</b> for minus numbers. Draw the zero line, then a bar for each change: up from zero for +, down for −.</p>':''}${foot(1)}</div>`;
  const p2=`<div class="pg ${B?'blank':''}">${hdr(2)}
   ${B?'':`<h2>5. Model: speed vs time (made from my numbers)</h2><img src="${vImg}" style="width:70%;border:1px solid #cbd5e1">`}
   <h2>${B?5:6}. Forces on the cart ${g6?'(model diagrams)':''}</h2>${B?'<p style="font-size:10.5px">Draw the forces on the cart from its centre dot. Bigger force = longer arrow. Label each arrow.</p>':''}
   <div class="two"><div><b>On the ramp</b><img src="${fb.ramp}" style="width:100%;border:1px solid #cbd5e1">${fq('ramp')}</div><div><b>On the flat</b><img src="${fb.flat}" style="width:100%;border:1px solid #cbd5e1">${fq('flat')}</div></div>
   <h2>${B?6:7}. Conclusion</h2>${con}${foot(2)}</div>`;
  const host=$('#sheet')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'sheet'}));host.innerHTML=p1+p2;
  await Promise.all($$('#sheet img').map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));
  return host;
}
function b64bytes(u){const b=atob(u.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
/* tiny PDF writer from Paper Plane Lab: one JPEG per page, A4 width, height kept in proportion */
function pdfFromCanvases(cvs,title){
  const enc=new TextEncoder(),parts=[],offs=[];let len=0;const put=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length};
  put('%PDF-1.4\n%\xff\xff\xff\xff\n');const n=cvs.length,obj=(i,body)=>{offs[i]=len;put(`${i} 0 obj\n`);body();put('\nendobj\n')};
  obj(1,()=>put('<< /Type /Catalog /Pages 2 0 R >>'));obj(2,()=>put(`<< /Type /Pages /Count ${n} /Kids [${cvs.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`));
  cvs.forEach((cv,i)=>{const p=3+i*3,W=595.28,H=Math.max(841.89,W*cv.height/cv.width),jpg=b64bytes(cv.toDataURL('image/jpeg',0.9)),cs=`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    obj(p,()=>put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H.toFixed(2)}] /Resources << /XObject << /Im0 ${p+2} 0 R >> >> /Contents ${p+1} 0 R >>`));
    obj(p+1,()=>put(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    obj(p+2,()=>{put(`<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);put(jpg);put('\nendstream')})});
  const info=3+n*3;obj(info,()=>put(`<< /Title (${String(title).replace(/[^\x20-\x7e]/g,'').replace(/[()\\]/g,'')}) /Producer (Acceleration Lab) >>`));
  const xref=len;put(`xref\n0 ${info+1}\n0000000000 65535 f \n`);for(let i=1;i<=info;i++)put(String(offs[i]).padStart(10,'0')+' 00000 n \n');
  put(`trailer\n<< /Size ${info+1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts,{type:'application/pdf'});
}
function unfinished(){return STEPS.map((s,i)=>[s,i]).filter(([s,i])=>stepStatus(i)!=='done')}
async function savePDF(force){
  const left=unfinished();
  if(left.length&&!force){popup('popsave','Before you save',`<p>These parts are not finished yet:</p>${left.map(([s,i])=>`<p>${s.i} <b>${s.n}</b> <button class="btn sm" data-gofix="${i}">Go there</button></p>`).join('')}<div class="navrow"><span></span><button class="btn go" id="saveany">Save anyway</button></div>`);
    $$('[data-gofix]').forEach(b=>b.onclick=()=>{$('#popsave').remove();go(b.dataset.gofix)});$('#saveany').onclick=()=>{$('#popsave').remove();savePDF(true)};return}
  const msg=$('#pdfmsg');if(msg)msg.innerHTML='<div class="fb mid">Making your PDF…</div>';
  try{const host=await buildSheet(false),cvs=[];
    for(const pg of $$('.pg',host))cvs.push(await html2canvas(pg,{scale:1.6,backgroundColor:'#fff',logging:false}));
    const blob=pdfFromCanvases(cvs,'Acceleration Lab - '+S.name),a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=`Acceleration-Lab-${(S.name||'worksheet').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')}.pdf`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
    if(msg)msg.innerHTML='<div class="fb ok">✓ Saved! Look in your Downloads folder, then upload the PDF to Toddle.</div>';
  }catch(e){if(msg)msg.innerHTML='<div class="fb no">The PDF could not be made here. Use 🖨 Print and choose "Save as PDF".</div>';console.error(e)}
}
async function printSheet(blankMode){await buildSheet(blankMode);setTimeout(()=>print(),150)}
