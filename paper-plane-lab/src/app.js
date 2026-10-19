/* ===== APP SHELL: render, header, events, modal, files ===== */
function stepState(k){
  if(!S.started)return'';
  if(k==='lab')return trialsDone()?'done':live().length?'part':'';
  if(k==='finish')return S.iv&&certReady()?'done':'';
  if(k==='extend')return'';
  try{const f=flagsOf(k);if(!f.length)return'';return f.every(Boolean)?'done':f.some(Boolean)?'part':''}catch(e){return''}
}
function updateChrome(){
  const lb=$('#lvbadge'),tools=$('#tools'),bar=$('#stepbar');
  if(!S.started){lb.innerHTML='';bar.innerHTML='';tools.innerHTML=`<button class="btn" data-act="teacher">For teachers</button><button class="btn" data-act="openfile">Open a saved file</button>`;return}
  const l=LV[S.level];document.documentElement.style.setProperty('--lv',l.col);
  lb.innerHTML=`<span class="lvbadge" title="Your challenge level is locked">${'★'.repeat(l.stars)} ${esc(l.n)} <small>· ${esc(capText(S.level))}</small></span>`;
  tools.innerHTML=`<span style="align-self:center;font-size:13px;color:#cfd9e6">${esc(S.name)} · ${esc(S.cls)}</span><button class="btn" data-act="savefile" title="Save your progress to a file">💾 Save progress</button><button class="btn" data-act="openfile">Open</button><button class="btn" data-act="tour">❓ How it works</button><button class="btn" data-act="teacher">For teachers</button><button class="btn" data-act="restart">Start over</button>`;
  bar.innerHTML=STEPS.map(([k,t],i)=>{if(k==='extend')return`<button data-go="extend" ${S.step==='extend'||S.step==='compare'?'aria-current="step"':''} style="border-color:var(--accent)">${t}</button>`;const st=stepState(k);return`<button data-go="${k}" class="${st}" ${S.step===k?'aria-current="step"':''}><span class="n">${st==='done'?'✓':i+1}</span>${t}</button>`}).join('');
}
function softStatus(){
  if(!BUILD[S.step])return;let b;try{b=BUILD[S.step]()}catch(e){return}
  Object.entries(b.f).forEach(([id,d])=>{const el=$(`[data-qid="${id}"] .status`);if(el){el.className='status '+(d?'ok':'no');el.textContent=d?'✓ Done':'To do';const sec=el.closest('section');sec.classList.toggle('isdone',d);if(d)sec.classList.remove('missing')}});
  updateChrome();pageSumRefresh();
}
function render(){
  const main=$('#main');
  if(!S.started){main.innerHTML=startHTML();updateChrome();return}
  if(S.step==='start')S.step='observe';
  if(S.step==='lab'){main.innerHTML=labHTML();updateChrome();labPanels();labStart();pageSumRefresh();sheetRefresh();maybeIntro();highlightMissing();return}
  if(S.step==='observe'){main.innerHTML=BUILD.observe().h;updateChrome();labPanels();labStart();mountPageSum();sheetRefresh();maybeIntro();highlightMissing();return}
  labStop();
  main.innerHTML=BUILD[S.step]().h;updateChrome();
  if(S.step==='results')graphBind();
  mountPageSum();
  if(S.step==='compare')drawCmp();
  sheetRefresh();maybeIntro();highlightMissing();
}
function drawCmp(){const cv=$('#cmpcv');if(cv)drawCompare(cv.getContext('2d'),cv.width,cv.height)}
function rerender(){const y=window.scrollY;render();window.scrollTo(0,y)}
let HL=false;
/* after "Go and finish it" on the Finish page: outline every part of that step that is not finished yet */
function highlightMissing(){
  if(!HL)return;const miss=[];
  if(S.step==='lab'){const t=$('#tablepanel');if(t&&(!trialsDone()||t1Missing().length))miss.push(t)}
  $$('#main section.q').forEach(sec=>{if(!sec.querySelector('.status.ok'))miss.push(sec)});
  miss.forEach(m=>{m.classList.add('missing');$$('input[type=text][data-bind],textarea[data-bind]',m).forEach(i=>{if(!i.value.trim())i.classList.add('emptyfield')})});
  const card=$('#main .card');if(card&&!$('#hlmsg')){card.insertAdjacentHTML('afterbegin',`<div class="fb no" id="hlmsg">${miss.length?'<b>Still to finish:</b> the parts outlined in red on this page.':'<b>Nearly there:</b> check this page, then go back to Finish.'} <button class="btn sm" data-go="finish">Back to Finish</button></div>`)}
  if(miss[0])setTimeout(()=>miss[0].scrollIntoView({behavior:'smooth',block:'center'}),120);
}
function go(step,force){if(!force&&!navGuard(step))return;HL=false;const prev=S.step;if(step!==S.step){LAB.state='idle';LAB.res=null;LAB.pend=null}S.step=step;save();
  if(step==='conclusion'&&prev!=='conclusion')setSheet(true);else if(prev==='conclusion'&&step!=='conclusion')setSheet(false);
  render();window.scrollTo(0,0)}

/* ---- modal ---- */
function openModal(html){$('#modalbox').innerHTML=`<button class="btn sm x" data-act="closemodal" aria-label="Close">✕</button>`+html;$('#modal').classList.add('open')}
function closeModal(){if(MODAL_LOCK)return;$('#modal').classList.remove('open')}
let confirmCb=null;
function askConfirm(msg,cb){confirmCb=cb;openModal(`<h2>Are you sure?</h2><p>${esc(msg)}</p><div class="nav" style="border:0"><button class="btn" data-act="closemodal">No, go back</button><button class="btn primary" data-act="confirm-yes">Yes</button></div>`)}

/* ---- files ---- */
/* In the claude.ai viewer, files go through the viewer's save prompt; the offline file uses a normal download link. */
const DLCAP=(window.claude&&typeof window.claude.use==='function')?window.claude.use('downloads').catch(()=>null):Promise.resolve(null);
function download(name,blob){DLCAP.then(dl=>{if(dl)dl.save({filename:name,data:blob}).catch(e=>{if(!e||!['declined','rate_limited'].includes(e.code))plainDownload(name,blob)});else plainDownload(name,blob)})}
function plainDownload(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},3000)}
const safeName=()=>(S.name||'student').replace(/[^\w一-鿿-]+/g,'_');
function saveFile(){download(`PaperPlaneLab_${safeName()}_progress.json`,new Blob([JSON.stringify(S)],{type:'application/json'}))}
function openFile(f){const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||!o.started||!LV[o.level])throw 0;S=Object.assign(blank(),o);save();render();window.scrollTo(0,0)}catch(e){openModal('<h2>That file did not open</h2><p>Choose the progress file you saved from this lab (it ends in .json).</p>')}};r.readAsText(f)}

/* ---- events ---- */
function act(a,el,ev){
  const id=el.dataset.id,k=el.dataset.k;
  switch(a){
   case'pick-level':START.level=k;render();break;
   case'start':doStart();break;
   case'resume':{const o=loadSaved();if(o){S=Object.assign(blank(),o);render();window.scrollTo(0,0)}break}
   case'ivtype':S.a.ivtype=k;save();rerender();break;
   case'iv':setIV(k);break;
   case'dv':setDV(k);break;
   case'levelpick':{const iv=IVS[S.iv],v=iv.type==='num'?Number(el.dataset.v):el.dataset.v;const i=S.levels.indexOf(v);if(i>=0)S.levels.splice(i,1);else S.levels.push(v);
     const order=iv.type==='num'?iv.vals:iv.cats;S.levels.sort((a,b)=>order.indexOf(a)-order.indexOf(b));S.labLevel=null;save();rerender();break}
   case'env':if(!testsStarted()){S.env=k;save();rerender()}break;
   case'launch':if(!testsStarted()){S.launch=k;save();rerender()}break;
   case'mat:add':{const m=matList().slice();if(!m.includes(k))m.push(k);S.a.matsel=m;save();rerender();break}
   case'mat:rm':{S.a.matsel=matList().filter(x=>x!==k);save();rerender();break}
   case'mb:add':{const m=mbList().slice();m.push(k);S.a.mb=m;save();rerender();break}
   case'mb:up':case'mb:dn':{const m=mbList().slice(),i=Number(el.dataset.i),j=a==='mb:up'?i-1:i+1;[m[i],m[j]]=[m[j],m[i]];S.a.mb=m;save();rerender();break}
   case'mb:rm':{const m=mbList().slice();m.splice(Number(el.dataset.i),1);S.a.mb=m;save();rerender();break}
   case'chk':S.a['chk.'+id]=1;save();rerender();break;
   case'reveal':S.revealed=true;save();rerender();break;
   case'pmode':if(k==='virtual')makeVirtual();else{S.partner.mode=k;if(S.partner.name==='Sam (virtual partner)'){S.partner.name='';S.partner.avgs={}}}save();rerender();break;
   case'psame':S.partner.same=k;save();rerender();break;
   case'pload':loadCode();save();rerender();break;
   case'pcopy':{const t=$('#mycode');t.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}if(navigator.clipboard)navigator.clipboard.writeText(t.value).then(()=>{$('#copymsg').textContent='Copied.'}).catch(()=>{});$('#copymsg').textContent=ok?'Copied.':'Select the code and copy it.';break}
   case'g:suggest':gSuggest();graphRefresh();break;
   case'g:fit':{const g=gInit();if(g.fit&&g.fit.curve){g.fit={x1:g.fit.x1,y1:g.fit.y1,x2:g.fit.x2,y2:g.fit.y2};save();graphRefresh();break}if(gValid(g)){const m=gMap(g),pv=plotVals().filter(p=>p.y!=null),my=pv.length?pv.reduce((a,p)=>a+p.y,0)/pv.length:(m.ymin+m.ymax)/2;g.fit={x1:m.xmin+(m.xmax-m.xmin)*.1,y1:my,x2:m.xmax-(m.xmax-m.xmin)*.1,y2:my}}else gWarn('Choose your axis numbers first.');save();graphRefresh();break}
   case'g:nofit':gInit().fit=null;save();graphRefresh();break;
   case'g:curve':{const g=gInit();if(gValid(g)){const m=gMap(g),pv=plotVals().filter(p=>p.y!=null),my=pv.length?pv.reduce((a,p)=>a+p.y,0)/pv.length:(m.ymin+m.ymax)/2,old=g.fit;
     g.fit=old?{x1:old.x1,y1:old.y1,x2:old.x2,y2:old.y2,curve:true,xm:(old.x1+old.x2)/2,ym:(old.y1+old.y2)/2}:{x1:m.xmin+(m.xmax-m.xmin)*.1,y1:my,x2:m.xmax-(m.xmax-m.xmin)*.1,y2:my,curve:true,xm:(m.xmin+m.xmax)/2,ym:my}}else gWarn('Choose your axis numbers first.');save();graphRefresh();break}
   case'g:type':gInit().type=k;save();graphRefresh();break;
   case'g:check':S.a['chk.graph']=1;save();graphRefresh();break;
   case'pdf':trySave('report');break;
   case'pdffb':trySave('fb');break;
   case'pdf-anyway':MODAL_LOCK=false;closeModal();k==='fb'?exportFeedback():exportReport();break;
   case'jump':jumpTo(k);break;
   case'cert':exportCert();break;
   case'savefile':saveFile();break;
   case'openfile':$('#loadfile').click();break;
   case'teacher':openModal(teacherHTML());break;
   case'restart':askConfirm('This deletes everything in this lab on this computer, including your level. Save a progress file first if you might need it.',()=>{try{localStorage.removeItem(KEY)}catch(e){}S=blank();START.name='';START.cls='';START.level=null;render()});break;
   case'closemodal':closeModal();break;
   case'confirm-yes':{closeModal();const cb=confirmCb;confirmCb=null;if(cb)cb();break}
   case'lab:launch':labLaunch();break;
   case'lab:skip':labSkip();break;
   case'lab:again':labAgain();break;
   case'lab:swtoggle':swToggle();break;
   case'lab:swreset':swReset();break;
   case'lab:record':labRecord();break;
   case'lab:undo':askConfirm('Remove your last recorded flight?',labUndo);break;
   case'lab:level':labPickLevel(el.dataset.v);break;
   case'calc':calcKey(k);break;
   case'lab:addnote':labAddNote();break;
   case'lab:peek':openModal(peekHTML());break;
   case'exp-env':S.exp.env=k;save();labPanels();break;
   case'exp-launch':S.exp.launch=k;save();labPanels();break;
   case'sheet':toggleSheet();break;
   case'gofix':MODAL_LOCK=false;closeModal();go(k,true);HL=true;highlightMissing();break;
   case'go-anyway':closeModal();go(k,true);break;
   case'stay-finish':closeModal();HL=true;highlightMissing();break;
   case'intro':showIntro(S.step);break;
   case'fair':{const r=el.getBoundingClientRect(),x=ev&&ev.clientX!=null?ev.clientX:r.left+r.width/2;S.a.fair=Math.round(Math.max(0,Math.min(100,(x-r.left)/r.width*100)));save();rerender();break}
   case'sortpick':S.a['sort.'+id]=k;if(k!=='method')S.a['q3.pick']=q3Picks().filter(x=>x!==id);save();rerender();break;
   case'q3pick':{const p=q3Picks().slice(),i=p.indexOf(id);if(i>=0)p.splice(i,1);else p.push(id);S.a['q3.pick']=p;save();rerender();break}
   case'help':openModal(`<div class="intro"><h2>${IVS[S.iv]&&IVS[S.iv].type==='num'?'Positive, negative or no trend?':'Comparing groups'}</h2>${analysisLesson()}<div style="text-align:right"><button class="btn primary" data-act="closemodal">Got it</button></div></div>`);break;
   case'tour':startTour();break;
   case'tour-next':TOUR.i++;tourShow();break;
   case'tour-back':TOUR.i=Math.max(0,TOUR.i-1);tourShow();break;
   case'tour-skip':tourEnd();break;
   case'intro-ok':introOK(k);break;
   case'x-level':S.a['x.level']=k;save();rerender();break;
   case'x-start':{const lv=S.a['x.level'];if(lv&&S.exported)askConfirm(`Start a new investigation at the ${LV[lv].n} level? Your first report is kept, and you can download it from the Extensions page.`,()=>startNewInvestigation(lv));break}
   case'x-oldpdf':exportArchived(Number(el.dataset.i));break;
  }
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act],[data-go]');if(!t||t.disabled)return;
  if(t.dataset.go){e.preventDefault();go(t.dataset.go);return}
  act(t.dataset.act,t,e);
});
function bindValue(el){
  const key=el.dataset.bind,v=el.value;
  if(key.startsWith('start.')){START[key.slice(6)]=v;const b=$('[data-act="start"]'),m=$('.nav .msg');if(b)b.disabled=!(START.name.trim()&&START.cls.trim()&&START.level);if(m)m.textContent=!START.name.trim()?'Type your name to begin.':!START.cls.trim()?'Type your class to begin.':!START.level?'Choose a challenge level.':'Ready? Your level will be locked.';return}
  if(key.startsWith('g.')){gInit()[key.slice(2)]=v;save();gDraw();softStatus();return}
  if(key==='p.name'){S.partner.name=v;save();return}
  if(key==='p.code'){S.partner.codeText=v;save();return}
  if(key.startsWith('p.avg.')){S.partner.avgs[key.slice(6)]=v;save();return}
  if(key.startsWith('peer.')){S.peer[key.slice(5)]=v;save();softStatus();return}
  setA(key,v);sheetRefreshSoon();if(String(v).trim())el.classList.remove('emptyfield');
  if(key.startsWith('tr.')){const m=key.match(/^tr\.(.*)\.(\d)$/);if(m){const real=S.levels.find(x=>String(x)===m[1]);const f=fvals(real)[Number(m[2])],nv=parseFloat(v);if(f&&isFinite(nv)){if(S.dv==='dist')f.read=nv;else f.timed=nv;save()}}}
  softStatus();
}
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.bind&&el.tagName!=='SELECT')bindValue(el);
  if(el.dataset&&el.dataset.launchset){const k=el.dataset.launchset,v=Number(el.value);(isExplore()?S.exp:S.design)[k]=v;const l=$('#ls-'+k);if(l)l.textContent=v+(k==='angle'?'°':' m/s');save()}});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.bind&&el.tagName==='SELECT'){bindValue(el);if(S.step!=='results')rerender();else graphRefresh();return}
  if(el.dataset.bind&&S.step==='compare'&&el.dataset.bind.startsWith('p.avg.')){rerender();return}
  if(el.dataset.exp){const k=el.dataset.exp,num=['span','clips'].includes(k);S.exp[k]=num?Number(el.value):el.value;save();labPanels();return}
  if(el.dataset.launchset){labPanels();save();return}
  if(el.dataset.design){const k=el.dataset.design,num=['span','clips','angle','speed'].includes(k);S.design[k]=num?Number(el.value):el.value;S.planes={};save();rerender();return}
  if(el.dataset.ck){S.ck[el.dataset.ck]=el.checked;save();rerender();return}
  if(el.dataset.peerck){S.peer['ck.'+el.dataset.peerck]=el.checked;save();return}
  if(el.id==='loadfile'&&el.files[0]){openFile(el.files[0]);el.value=''}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&$('#modal').classList.contains('open')){closeModal();return}
  if((S.step==='lab'||S.step==='observe')&&(e.code==='Space'||e.key===' ')){const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT|BUTTON/.test(a.tagName))return;e.preventDefault();swToggle()}
});
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

window.addEventListener('resize',()=>{if($('.tourcard'))tourShow()});
/* ---- boot ---- */
(function boot(){const o=loadSaved();if(o&&o.started&&LV[o.level]){START.name=o.name;START.cls=o.cls}render();if(S.started&&S.step==='conclusion')setSheet(true)})();
