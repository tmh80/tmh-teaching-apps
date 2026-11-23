/* ===== shell: header, step bar, conclusion, events, name gate ===== */
/* ---------- Step 5: conclusion ---------- */
const SYN={up:['speeding up','getting faster','accelerating','going faster','faster','speeds up','sped up'],pos:['positive','plus','+','a plus','positive number'],
  down:['slowing down','getting slower','decelerating','going slower','slower','slows down','slowed down'],neg:['negative','minus','-','−','a minus','negative number'],fric:['friction','air resistance','friction and air resistance','rubbing','drag']};
const G6F=[['f1','up'],['f2','pos'],['f3','down'],['f4','neg'],['f5','fric']];
function synOK(v,g){const t=String(v||'').toLowerCase().trim().replace(/[.,!]/g,'').replace(/^(a|an|the)\s+/,'');return SYN[g].includes(t)}
function conKeys(){return isG6()?['f1','f2','f3','f4','f5','pred']:['claim','evid','reason','mix','pred']}
function conInput(k){const ok=S.chk.con&&S.con[k]?synOK(S.con[k],G6F.find(x=>x[0]===k)[1]):null;return`<input type="text" data-bind="con.${k}" value="${esc(S.con[k]||'')}" aria-label="gap ${k}">${ok==null?'':ok?'<span class="mk ok">✓</span>':'<span class="mk no">?</span>'}`}
const G78Q=[['claim','Claim','How did the cart\'s acceleration change from the ramp to the flat?'],['evid','Evidence','Use at least two acceleration numbers from Table 3, with units (m/s²).'],
  ['reason','Reasoning','Explain why, using forces: balanced or unbalanced, the resultant force, gravity and friction.'],
  ['mix','The tricky one','Your "metre 2 → metre 3" value crosses the bottom of the ramp. What did your number show, and why is it a mix of speeding up and slowing down?'],
  ['pred','My prediction','Was your prediction right? What would you tell someone who made the same prediction?']];
function stepConclusion(){
  const pr=PRED_OPTS.reduce((o,[v,l])=>(o[v]=l.toLowerCase(),o),{});
  const predTxt=`You predicted: ramp → <b>${pr[S.pred.ramp]||'?'}</b>, flat → <b>${pr[S.pred.flat]||'?'}</b>.`;
  let body;
  if(isG6())body=`<div class="wtu">Words to use: ${['speeding up','slowing down','positive','negative','friction','gravity'].map(w=>`<span>${w}</span>`).join('')}</div>
   <div class="frame">On the ramp, the cart was ${conInput('f1')}. Its acceleration was a ${conInput('f2')} number.<br>
   On the flat, the cart was ${conInput('f3')}. Its acceleration was a ${conInput('f4')} number.<br>
   On the flat, gravity could not pull the cart forwards any more, and ${conInput('f5')} slowed it down.</div>
   <button class="btn" data-act="chkcon">Check my sentences</button>${S.chk.con?`<span class="note"> ✓ = good. ? = look at your graph and the forces page again.</span>`:''}
   <h3>My prediction</h3><p class="note">${predTxt} Was it right? Why?</p><textarea data-bind="con.pred" placeholder="My prediction was … because …">${esc(S.con.pred||'')}</textarea>`;
  else body=`<div class="wtu">Words to use: ${['positive acceleration','negative acceleration','m/s²','unbalanced','resultant force','gravity','friction','speeds up','slows down'].map(w=>`<span>${w}</span>`).join('')}</div>`+
   G78Q.map(([k,t,p])=>`<h3>${t}</h3><p class="note">${k==='pred'?predTxt+' ':''}${p}</p><textarea data-bind="con.${k}">${esc(S.con[k]||'')}</textarea>`).join('')+
   `<div class="tip" data-live="cl78">${cl78()}</div>`;
  return`<div class="intro">On this page you will <b>write your conclusion</b>. Then go to <b>Worksheet</b> to save your PDF for Toddle.</div>
  <div class="panel"><h2>Conclusion ${stepTodo(5)}</h2>${body}</div>
`;
}
function cl78(){const t=['claim','evid','reason'].map(k=>String(S.con[k]||'').toLowerCase()).join(' ');
  const it=[[/positive|\+/.test(t)&&/negative|minus|−|-\d/.test(t),'uses positive and negative acceleration'],[/\d/.test(t)&&/m\/s(2|²)/.test(t),'gives numbers with the unit m/s²'],[/unbalanced/.test(t),'says the forces are unbalanced'],[/friction/.test(t),'names friction'],[/resultant/.test(t),'uses "resultant force"']];
  return'<b>Did you include…</b><br>'+it.map(([ok,l])=>`${ok?'✅':'⬜'} ${l}`).join('<br>')}

/* ---------- shell ---------- */
function stepHTML(){return[stepPredict,stepTimes,stepMetres,stepAccel,stepForces,stepConclusion,stepSheet][S.step]()}
function render(){
  const app=$('#app');
  app.innerHTML=`<header class="top"><div class="brand"><h1>Acceleration <span>Lab</span></h1><p>Speeding up, slowing down, and the forces behind it</p></div>
   <div class="who">👤 <b>${esc(S.name||'—')}</b>${S.cls?' · '+esc(S.cls):''} · ${S.grade==='6'?'Grade 6':S.grade?'Grade 7/8':''} <button class="btn sm dark" data-act="gate">Change</button></div>
   <div class="tools"><button class="btn sm dark" data-go="6">📄 Worksheet</button><button class="btn sm dark" data-act="teacher">For teachers</button></div></header>
   <nav class="steps" id="stepbar"></nav><main id="main">${stepHTML()}</main>
   <div class="navrow">${S.step>0?`<button class="btn" data-go="${S.step-1}">← Back</button>`:'<span></span>'}${S.step<6?`<button class="btn go" id="nextbtn" data-go="${S.step+1}">Next: ${STEPS[S.step+1].n} →</button>`:''}</div>
   <button class="btn primary calcfab" data-act="calc">🧮 Calculator</button>`;
  chrome();refreshLive();graphBind();
  if(S.step===4&&!isG6())['ramp','flat'].forEach(s=>fbdMount($('#fbd-'+s),s));
  if(S.step===6)renderPreview();
}
function chrome(){
  const bar=$('#stepbar');if(bar)bar.innerHTML=STEPS.map((s,i)=>{const st=stepStatus(i);return`<button class="${i===S.step?'on':''} ${st}" data-go="${i}"><b>${i+1}. ${st==='done'?'✓ Done':st==='part'?'Started':''}</b>${s.i} ${s.n}</button>`}).join('');
  $$('[data-live^="todo:"]').forEach(el=>el.innerHTML=todoPill(+el.dataset.live.split(':')[1]));
  const nb=$('#nextbtn');if(nb)nb.classList.toggle('pulse',stepStatus(S.step)==='done');
}
function liveHTML(key){const [a,b,c]=key.split(':');
  if(a==='avg'){const v=avgT(+b);return v==null?'—':fmt(v)}
  if(a==='mk')return mark(b,+c);if(a==='form')return formHint(b,+c);if(a==='chk2sum')return chk2Sum();
  if(a==='acctable')return accTable();if(a==='cl78')return cl78();if(a==='todo')return todoPill(+b);return''}
function refreshLive(){$$('[data-live]').forEach(el=>{const h=liveHTML(el.dataset.live);if(el.innerHTML!==h)el.innerHTML=h;if(el.classList.contains('val'))el.classList.toggle('empty',h==='—')});chrome()}
function go(i){S.step=clamp(+i,0,6);save();render();scrollTo(0,0)}

/* ---------- events ---------- */
const SRC={leg:k=>k===1?['#av1']:['#av'+k,'#av'+(k-1)],spd:k=>['#leg'+k],chg:k=>k===1?['#spd1']:['#spd'+k,'#spd'+(k-1)]};
document.addEventListener('focusin',e=>{const s=e.target.dataset&&e.target.dataset.src;if(!s)return;const [kind,k]=s.split(':');$$('.glow').forEach(x=>x.classList.remove('glow'));SRC[kind](+k).forEach(q=>{const n=$(q);if(n)n.classList.add('glow')})});
document.addEventListener('focusout',e=>{if(e.target.dataset&&e.target.dataset.src)$$('.glow').forEach(x=>x.classList.remove('glow'))});
document.addEventListener('input',e=>{const el=e.target,b=el.dataset&&el.dataset.bind;if(!b||!el.closest('#app'))return;setPath(b,el.value);save();
  const r=el.dataset.redraw;if(r){gLive();return}refreshLive()});
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');if(g&&g.closest('#app')){go(g.dataset.go);return}
  const h=e.target.closest('[data-help]');if(h){showHelp(h.dataset.help);return}
  const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
  if(act==='pred'){S.pred[a.dataset.k]=a.dataset.v;save();$('#main').innerHTML=stepHTML();chrome()}
  else if(act==='trials'){S.trials=+a.dataset.v;save();render()}
  else if(act==='chk2'){S.chk.t2=true;save();refreshLive();a.textContent='✓ Checking is on'}
  else if(act==='gsuggest'){gSuggest();graphRefresh()}
  else if(act==='gcheck'){S.chk.graph=true;save();graphRefresh()}
  else if(act==='fq'){S.fq[a.dataset.k]=a.dataset.v;save();const sy=scrollY;render();scrollTo(0,sy)}
  else if(act==='chkcon'){S.chk.con=true;save();const sy=scrollY;render();scrollTo(0,sy)}
  else if(act==='calc')calcOpen();
  else if(act==='gate')gate(true);
  else if(act==='teacher')teacherNotes();
  else if(act==='pdf')savePDF();
  else if(act==='print')printSheet();
});

/* ---------- name gate: nobody gets in without a name (or the teacher code) ---------- */
function gate(change){
  const m=document.createElement('div');m.className='modal';m.id='gate';const gr=S.grade;
  m.innerHTML=`<div class="box gate" role="dialog" aria-modal="true" aria-labelledby="gt"><h2 id="gt">Welcome to Acceleration Lab 🛒</h2>
   <p class="note">Your name goes on your worksheet, so your teacher knows it's yours.</p>
   <label for="gn">Your name</label><input type="text" id="gn" value="${esc(S.teacher?'':S.name)}" autocomplete="off">
   <label for="gc">Your class</label><input type="text" id="gc" value="${esc(S.cls)}" placeholder="e.g. 7B" autocomplete="off">
   <label>Your grade</label><div class="chips">${[['6','Grade 6'],['7','Grade 7'],['8','Grade 8']].map(([v,l])=>`<button class="chip ${(v==='6'?gr==='6':gr==='78'&&S.gnum===v)?'sel':''}" data-g="${v}">${l}</button>`).join('')}</div>
   <div class="err" id="gerr"></div>
   <div class="navrow"><span>${change&&S.name?'<button class="btn" id="gcancel">Cancel</button>':''}</span><button class="btn go" id="gok">Start →</button></div>
   <details style="margin-top:12px"><summary class="note">Teacher?</summary><label for="gt2">Teacher code</label><input type="text" id="gt2" autocomplete="off"></details></div>`;
  document.body.appendChild(m);let pick=gr==='6'?'6':S.gnum||'';
  $$('[data-g]',m).forEach(b=>b.onclick=()=>{pick=b.dataset.g;$$('[data-g]',m).forEach(x=>x.classList.toggle('sel',x===b))});
  const ok=()=>{const code=$('#gt2',m).value.trim().toUpperCase(),n=$('#gn',m).value.trim();
    if(code===LAB.code){S.teacher=true;S.name=n||'Teacher';S.grade=pick==='6'?'6':'78';S.gnum=pick||'7';S.cls=$('#gc',m).value.trim();finish();return}
    if(code&&code!==LAB.code){$('#gerr',m).textContent='That teacher code is not right.';return}
    if(!n){$('#gerr',m).textContent='Please type your name.';$('#gn',m).focus();return}
    if(!pick){$('#gerr',m).textContent='Please choose your grade.';return}
    S.teacher=false;S.name=n;S.cls=$('#gc',m).value.trim();S.grade=pick==='6'?'6':'78';S.gnum=pick;finish()};
  const finish=()=>{save();m.remove();render()};
  $('#gok',m).onclick=ok;m.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT')ok();if(e.key==='Escape'){e.preventDefault();if(change&&S.name)m.remove();else $('#gn',m).focus()}});
  const c=$('#gcancel',m);if(c)c.onclick=()=>m.remove();
  m.addEventListener('click',e=>{if(e.target===m)$('#gn',m).focus()});
  setTimeout(()=>$('#gn',m).focus(),30);
}
function boot(){load();render();if(!S.name||!S.grade)gate(false)}
document.addEventListener('DOMContentLoaded',boot);
