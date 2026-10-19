/* ===== Making progress obvious: what is done, what is not, and exactly what is missing ===== */
const STEP_NAME=k=>(STEPS.find(x=>x[0]===k)||[k,k])[1];
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
function flightsMissing(){if(!S.iv)return['choose what to change on the Question page'];return levelStats().filter(s=>s.n<3).map(s=>`${lvlLabel(S.iv,s.lk)} needs ${plural(3-s.n,'more trial')}`)}
function t1Missing(){const o=[],st=levelStats();if(!t1Title())o.push('a table title');if(!words(A('t1.ivh')))o.push('the IV heading');if(!words(A('t1.dvh')))o.push('the DV heading');
  const mm=st.reduce((a,s)=>a+[0,1,2].filter(i=>!String(A('tr.'+String(s.lk)+'.'+i)).trim()).length,0);if(mm)o.push(plural(mm,'measurement'));
  const ma=st.filter(s=>!String(A('avg.'+String(s.lk))).trim()).length;if(ma)o.push(plural(ma,'average'));return o}
function graphMissing(){const g=gInit(),o=[];if(!g.type)return['choose a type of graph'];if(!String(g.title||'').trim())o.push('a title');if(!String(g.xl||'').trim())o.push('an x-axis label');if(!String(g.yl||'').trim())o.push('a y-axis label');if(!gValid(g))o.push('your axis numbers');
  const e=graphEval();if(e.placed<e.total)o.push(`${plural(e.total-e.placed,g.type==='scatter'?'point':'bar')} to plot`);return o}
/* everything not finished, step by step (used before saving the PDFs) */
function missingAll(){const out=[];
  ['observe','question','hypothesis','plan','lab','results','conclusion','evaluate'].forEach(step=>{
    if(step==='lab'){if(!trialsDone())out.push({step,t:'Your flights',d:flightsMissing().join(' · ')});return}
    let b;try{b=BUILD[step]()}catch(e){return}
    if(!Object.keys(b.f).length){if(['results','conclusion','evaluate'].includes(step))out.push({step,t:'Not started yet',d:'You need to record your flights first.'});return}
    Object.entries(b.f).forEach(([id,ok])=>{if(ok)return;const det=id==='t1'?t1Missing():id==='graph'?graphMissing():[];out.push({step,t:String(b.t[id]||id).replace(/<[^>]+>/g,''),d:det.length?'Still needed: '+det.join(', '):''})})});
  return out}
/* things a later step depends on, said exactly */
function prereqNotes(){const o=[];
  if(['results','conclusion','evaluate'].includes(S.step)&&S.iv&&live().length&&!trialsDone())o.push(['lab',`You still have flights to do: ${flightsMissing().join(' · ')}.`]);
  if(['results','conclusion'].includes(S.step)&&S.iv&&live().length){const ma=levelStats().filter(s=>s.n>=3&&!String(A('avg.'+String(s.lk))).trim());if(ma.length)o.push(['lab',`Your graph and Question 1 use your averages, but ${plural(ma.length,'average')} ${ma.length===1?'is':'are'} missing in Table 1 (${ma.map(s=>lvlLabel(S.iv,s.lk)).join(', ')}).`])}
  if(S.step==='conclusion'&&S.iv&&live().length&&!graphEval().done)o.push(['results',`Question 1 asks about your graph, and your graph is not finished. Still needed: ${graphMissing().join(', ')}.`]);
  return o}
function labPrereqs(){const o=[];
  if(!S.iv)o.push(['question','You haven’t chosen what you will change (your independent variable).']);
  if(!S.dv)o.push(['question','You haven’t chosen what you will measure (your dependent variable).']);
  if(S.iv){if(S.levels.length<2)o.push(['plan',`You have chosen ${plural(S.levels.length,'experimental group')}. You need at least 2 to run your experiment.`]);
    if(!S.env)o.push(['plan','You haven’t chosen where to fly (inside or outside).']);if(!S.launch)o.push(['plan','You haven’t chosen how to launch (by hand or with the launcher).'])}
  return o}
const prereqHTML=list=>list.map(([step,t])=>`<div class="fb no prereq"><span>${esc(t)}</span><button class="btn sm primary" data-act="gofix" data-k="${step}">Go to ${esc(STEP_NAME(step))}</button></div>`).join('');
/* the "On this page" bar */
function pageSumHTML(){
  const secs=$$('#main section.q[data-qid]');let h=prereqHTML(prereqNotes());if(!secs.length)return h;
  const it=secs.map(s=>({id:s.dataset.qid,t:s.querySelector('h3 span').textContent,ok:s.classList.contains('isdone')})),left=it.filter(x=>!x.ok);
  return h+`<div class="pagesum ${left.length?'':'alldone'}"><b>${left.length?`On this page: ${it.length-left.length} of ${it.length} done. Click a part to go to it.`:'✓ Everything on this page is done!'}</b>
    <div class="sumchips">${it.map(x=>`<button class="sumchip ${x.ok?'ok':'todo'}" data-act="jump" data-k="${x.id}">${x.ok?'✓':'○'} ${esc(x.t)}</button>`).join('')}</div></div>`;
}
function labSumHTML(){
  if(!S.iv||!S.levels.length)return'';const L=live().length,N=flightsExpected(),st=levelStats(),av=st.filter(s=>String(A('avg.'+String(s.lk))).trim()).length,hd=words(A('t1.ivh'))>0&&words(A('t1.dvh'))>0,all=L>=N&&!!t1Title()&&hd&&av===st.length;
  const chip=(ok,t)=>`<span class="sumchip ${ok?'ok':'todo'}">${ok?'✓':'○'} ${t}</span>`;
  return`<div class="pagesum ${all?'alldone':''}"><b>${all?'✓ Everything on this page is done!':'On this page:'}</b><div class="sumchips">${chip(!!t1Title(),'Table title')}${chip(hd,'Table headings (IV and DV)')}${chip(L>=N,`Flights: ${L} of ${N}`)}${chip(av===st.length,`Averages: ${av} of ${st.length}`)}</div>${L<N&&L?`<p class="note" style="margin:4px 0 0">${esc(flightsMissing().join(' · '))}</p>`:''}</div>`;
}
function pageSumRefresh(){const h=$('#pagesum');if(h)h.innerHTML=pageSumHTML();const l=$('#labsum');if(l)l.innerHTML=labSumHTML()}
function mountPageSum(){if(['finish','extend','compare','lab'].includes(S.step))return;const card=$('#main .card');if(!card||$('#pagesum'))return;const lead=card.querySelector(':scope > .lead')||card.querySelector(':scope > h2');if(lead)lead.insertAdjacentHTML('afterend','<div id="pagesum"></div>');pageSumRefresh()}
function jumpTo(id){const sec=$(`[data-qid="${id}"]`);if(!sec)return;sec.scrollIntoView({behavior:'smooth',block:'center'});sec.classList.remove('flash');void sec.offsetWidth;sec.classList.add('flash')}
/* check before saving a PDF */
function trySave(kind){
  const m=missingAll();if(!m.length){kind==='fb'?exportFeedback():exportReport();return}
  openModal(`<h2>Before you save: ${plural(m.length,'part')} ${m.length===1?'is':'are'} not finished</h2>
   <p>Your teacher will see anything that is missing. Click <b>Go there</b> to finish it, or save anyway.</p>
   <div class="misslist">${m.map(x=>`<div class="missrow"><div><b>${esc(STEP_NAME(x.step))}:</b> ${esc(x.t)}${x.d?`<div class="note">${esc(x.d)}</div>`:''}</div><button class="btn sm primary" data-act="gofix" data-k="${x.step}">Go there</button></div>`).join('')}</div>
   <div class="nav" style="border:0"><button class="btn" data-act="pdf-anyway" data-k="${kind}">Save anyway</button><button class="btn primary" data-act="closemodal">Go back and finish</button></div>`);
}
function exportFeedback(){
  const m=$('#pdfmsg');if(m)m.textContent='Making your feedback sheet…';
  setTimeout(()=>{try{const pages=buildFeedback(),blob=pdfFromCanvases(pages,'Paper Plane Lab feedback sheet - '+S.name);download(`PaperPlaneLab_${safeName()}_feedback_sheet.pdf`,blob);S.exportedFb=true;save();
      if(m)m.textContent='Feedback sheet saved. Upload it to Toddle with your lab report.';setTimeout(()=>{if(S.step==='finish')rerender()},1500)}
    catch(e){console.error(e);if(m)m.textContent='Sorry, the PDF could not be made: '+e.message}},50);
}
function labSumRefresh(){const l=$('#labsum');if(l)l.innerHTML=labSumHTML()}

/* ---- moving between steps: only the experiment's essentials can stop a student; everything else is a warning ---- */
const ORDER=()=>STEPS.map(x=>x[0]);
const stepIdx=k=>ORDER().indexOf(k==='compare'?'extend':k);
function essentialsFor(step){
  const i=stepIdx(step),o=[];if(step==='extend')return o;
  if(i>stepIdx('question')){if(!S.iv)o.push(['question','choose what you will change (your independent variable)']);if(!S.dv)o.push(['question','choose what you will measure (your dependent variable)'])}
  if(i>=stepIdx('lab')&&S.iv){if(S.levels.length<2)o.push(['plan',`choose at least 2 experimental groups to test (you have ${S.levels.length})`]);if(!S.env)o.push(['plan','choose where to fly (inside or outside)']);if(!S.launch)o.push(['plan','choose how to launch (by hand or with the launcher)'])}
  return o}
function missingFor(step){
  if(step==='lab')return trialsDone()?[]:[{t:'Your flights',d:flightsMissing().join(' · ')}];
  let b;try{b=BUILD[step]()}catch(e){return[]}
  const o=Object.entries(b.f).filter(([,ok])=>!ok).map(([id])=>{const det=id==='t1'?t1Missing():id==='graph'?graphMissing():[];return{t:String(b.t[id]||id).replace(/<[^>]+>/g,''),d:det.length?'Still needed: '+det.join(', '):''}});
  if(step==='observe'&&(S.expN||0)<3)o.unshift({t:'Throw at least 3 planes',d:`You have thrown ${S.expN||0}.`});
  return o}
function navGuard(step){
  if(!S.started||step===S.step)return true;
  const ess=essentialsFor(step);
  if(ess.length){const first=ess[0][0];go(first,true);HL=true;highlightMissing();
    showAfterIntro(`<h2>You need this to run your experiment</h2><p>Before you can go to <b>${esc(STEP_NAME(step==='compare'?'extend':step))}</b>, you still need to:</p><ul>${ess.map(e=>`<li><b>${esc(e[1])}</b></li>`).join('')}</ul><p>We have brought you to the <b>${esc(STEP_NAME(first))}</b> page. The parts to finish are outlined in red.</p><div style="text-align:right"><button class="btn primary" data-act="closemodal">OK</button></div>`);
    return false}
  if(stepIdx(step)>stepIdx(S.step)&&!['finish','extend','compare','start'].includes(S.step)){
    const left=missingFor(S.step);
    if(left.length){openModal(`<h2>You haven’t finished this page</h2><p>These parts of <b>${esc(STEP_NAME(S.step))}</b> are not done yet:</p><div class="misslist">${left.map(x=>`<div class="missrow"><div><b>${esc(x.t)}</b>${x.d?`<div class="note">${esc(x.d)}</div>`:''}</div></div>`).join('')}</div><p class="note">You can come back to them later. Anything unfinished will show in your report.</p>
      <div class="nav" style="border:0"><button class="btn" data-act="go-anyway" data-k="${step}">Continue anyway →</button><button class="btn primary" data-act="stay-finish">Go back and finish</button></div>`);return false}}
  return true}

/* if a step's intro pop-up is showing, show this message straight after it */
let PENDING_MSG=null;
function showAfterIntro(html){if(MODAL_LOCK)PENDING_MSG=html;else openModal(html)}
