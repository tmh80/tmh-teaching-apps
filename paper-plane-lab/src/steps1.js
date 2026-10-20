/* ===== WORKSHEET ENGINE + steps: start, question, hypothesis, plan ===== */
const BUILD={};
const START={name:'',cls:'',level:null};
function shuf(arr,key){const r=mulberry32(((S.seed||1)*31+[...String(key)].reduce((a,c)=>(a*33+c.charCodeAt(0))|0,7))>>>0);const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const tip=(lv,h)=>lv.includes(S.level)?`<div class="tip">${h}</div>`:'';
const nudge=(lv,h)=>lv.includes(S.level)?`<div class="nudge">📓 ${h}</div>`:'';
const ta=(id,ph,rows=3)=>`<textarea data-bind="${id}" rows="${rows}" placeholder="${esc(ph||'')}">${esc(A(id))}</textarea>`;
const inp=(id,cls,ph)=>`<input type="text" class="inl ${cls||''}" data-bind="${id}" value="${esc(A(id))}" placeholder="${esc(ph||'')}">`;
const sel=(id,opts,ph='choose…')=>`<select class="inl" data-bind="${id}"><option value="">${ph}</option>${opts.map(o=>`<option ${A(id)===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
function newB(){const f={},t={};return{h:'',f,t,q(id,title,body,done){f[id]=!!done;t[id]=title;this.h+=`<section class="q ${done?'isdone':''}" data-qid="${id}"><h3><span>${title}</span>${statusPill(done)}</h3>${body}</section>`},raw(h){this.h+=h}}}
const statusPill=done=>`<span class="status ${done?'ok':'no'}">${done?'✓ Done':'To do'}</span>`;
function fbList(list){return list.map(x=>`<div class="fb ${x.ok?'ok':'mid'}">${x.ok?'✓':'•'} ${esc(x.ok?x.msg:(x.fix||'Not yet: '+x.msg.charAt(0).toLowerCase()+x.msg.slice(1)))}</div>`).join('')}
/* "Check my answer": Developing and Proficient only. Developing gets a specific "what to fix" line. */
function chkBtn(id,list){if(!helped())return'';const on=A('chk.'+id);const L=on?list().map(x=>isDev()?x:{ok:x.ok,msg:x.msg}):[];return`<div style="margin:6px 0"><button class="btn sm" data-act="chk" data-id="${id}">Check my answer</button></div>${on?fbList(L):''}`}

/* sentence frames with typed gaps (like the lab report template) */
/* a part can be: a string, a gap {k,w,ph}, or a help button {help:'trend'} */
const helpBtn=k=>`<button class="helpq" data-act="help" data-k="${k}" title="What does this mean?" aria-label="Help">?</button>`;
function frame(id,parts){return`<div class="frame bl">${parts.map(p=>typeof p==='string'?esc(p).replace(/\n/g,'<br>'):p.help?helpBtn(p.help)+' ':inp(id+'.'+p.k,p.w||'w2',isDev()?p.ph:'')).join('')}</div>`}
const gapsOf=parts=>parts.filter(p=>typeof p!=='string'&&p.k!=null);
function frameDone(id,parts){return gapsOf(parts).every(p=>words(A(id+'.'+p.k))>=1)}
function frameText(id,parts){parts=parts.filter(p=>typeof p==='string'||p.k!=null);if(!gapsOf(parts).length)return parts.join('').replace(/\n/g,' ');if(!gapsOf(parts).some(p=>A(id+'.'+p.k).trim()))return'';return parts.map(p=>typeof p==='string'?p:(A(id+'.'+p.k).trim()||'___')).join('').replace(/\n/g,' ').replace(/\s+/g,' ').trim()}
const FR={
 rq:()=>['How does ',{k:'a',ph:'what you change'},' affect ',{k:'b',ph:'what you measure'},'?'],
 hypD:()=>IVS[S.iv].type==='num'?['If I ',{k:'a',w:'',ph:'increase / decrease'},' the ',{k:'b',ph:'what you change'},',\nthen the ',{k:'c',ph:'what you measure'},' will ',{k:'d',ph:'what will happen'},',\nbecause ',{k:'e',w:'w3',ph:'the science reason'},'.']
   :['If I throw a plane with ',{k:'b',w:'w2',ph:'one of your experimental groups'},',\nthen the ',{k:'c',ph:'what you measure'},' will be ',{k:'d',ph:'the greatest / the smallest'},' of all my groups,\nbecause ',{k:'e',w:'w3',ph:'the science reason'},'.'],
 hypP:()=>['If ',{k:'a',w:'w3'},',\nthen ',{k:'b',w:'w3'},',\nbecause ',{k:'c',w:'w3'},'.'],
 manip:()=>['I will change the ',{k:'a',ph:'independent variable'},' by ',{k:'b',w:'w3',ph:'how you will change it'},'.\nI will measure the ',{k:'c',ph:'dependent variable'},' using ',{k:'d',ph:'the measuring tool'},'.']
};

/* ---------- texts used in the report ---------- */
function rqText(){if(helped())return frameText('rq',FR.rq());return A('rq')}
function rqExtra(){return A('rq.x')}
function hypText(){if(isDev())return frameText('hyp',FR.hypD());if(isPro())return frameText('hyp',FR.hypP());return A('hyp')}
function hypBecause(){if(isDev())return A('hyp.e');if(isPro())return A('hyp.c');const m=A('hyp').match(/because(.*)$/i);return m?m[1]:''}
function ivTextA(){const u=A('iv.u').trim();return A('iv.t')+(u&&!/^none$/i.test(u)?' ('+u+')':'')}
function dvTextA(){const u=A('dv.u').trim();return A('dv.t')+(u&&!/^none$/i.test(u)?' ('+u+')':'')}
function unitOK(w){const u=A(w+'.u').trim().toLowerCase().replace(/[()]/g,'');if(w==='dv')return S.dv==='dist'?/^(cm|centimet(er|re)s?|m|metres?|meters?)$/.test(u):/^(s|secs?|seconds?)$/.test(u);const iv=IVS[S.iv];if(iv.type==='cat')return/^(none|no units?|n\/a|-)$/.test(u);const want={cm:/^(cm|centimet(er|re)s?)$/,clips:/^(clips?|paper ?clips?|none|number)$/,'°':/^(°|degrees?|deg)$/,'m/s':/^(m\/s|metres? per second|meters? per second)$/}[iv.unit];return want?want.test(u):false}
function manipText(){if(helped()){const t=frameText('manip',FR.manip());return t}return[A('manip'),A('measure')].filter(x=>x.trim()).join(' ')}
const ctlKeys=()=>Object.keys(SETTING_LABEL).filter(k=>k!==IVS[S.iv].setting&&!(S.iv==='clippos'&&k==='clips'));
function controlsList(){const o=[];for(let i=0;i<3;i++){const n=A('ctl.n'+i).trim(),h=A('ctl.h'+i).trim();if(n||h)o.push({name:n,how:h})}return o}
function matShelf(){
  const n=Math.max(3,S.levels.length),dist=S.dv==='dist',d=S.design||DEFAULTS,iv=S.iv,o=[];
  const add=(id,t,amt,need)=>o.push({id,t,amt,need});
  if(iv==='paper')add('paper','Paper: one sheet of each type I am testing',`${n} sheets`,true);else add('paper',`${PAPERS[d.paper]?d.paper:'Printer paper'}`,`${n} sheets (one plane for each group)`,true);
  if(iv==='clips'||iv==='clippos'||(d.clippos!=='No clip'))add('clips','Paper clips',iv==='clips'?'15 clips':`${n} clips`,true);
  add('tape','Tape measure (10 m)','1',dist);add('stop','Stopwatch','1',!dist);
  if(S.launch==='launcher')add('launch','Rubber band launcher','1',true);
  if(iv==='span')add('ruler','Ruler (30 cm)','1',true);
  if(iv==='span')add('scis','Scissors','1 pair',true);
  add('calc','Calculator (for averages)','1',true);add('scale','Digital scale (to weigh each plane)','1','opt');
  add('therm','Thermometer','1',false);add('glue','Glue stick','1',false);add('magn','Magnifying glass','1',false);add('cyl','Measuring cylinder','1',false);
  if(dist)add('stop2','Stopwatch','1',false);else add('tape2','Tape measure (10 m)','1',false);
  return shuf(o.filter(m=>m.id!=='stop2'&&m.id!=='tape2'||true).filter((m,i,a)=>!(m.id==='stop'&&!m.need)&&!(m.id==='tape'&&!m.need)),'matshelf');
}
function matList(){return Array.isArray(A('matsel'))?A('matsel'):[]}
function materialsText(){if(helped())return matList().map(id=>{const m=matShelf().find(x=>x.id===id);return m?m.t+': '+(isPro()?(A('mat.n.'+id)||'?'):m.amt):''}).filter(Boolean).join('\n');return A('mat')}
const MB={
 m1:()=>['Set the ',{k:'a',ph:'independent variable'},` to the first ${IVS[S.iv].type==='num'?'value':'type'} I am testing.`],
 m3:()=>['Launch the plane ',{k:'a',ph:'how'},' from behind the start line.'],
 m4:()=>S.dv==='dist'?['Measure the distance from the start line to the ',{k:'a',ph:'which part of the plane'},' using a ',{k:'b',ph:'measuring tool'},', and estimate the last digit.']:['Time the flight with a ',{k:'a',ph:'measuring tool'},' from when the plane is released until it ',{k:'b',ph:'what happens'},'.'],
 m5:()=>['Record the result in my ',{k:'a',ph:'where'},'.'],
 m6:()=>['Repeat steps 2 to 4 until I have ',{k:'a',w:'',ph:'how many'},' trials.'],
 m7:()=>['Change the ',{k:'a',ph:'independent variable'},` to the next ${IVS[S.iv].type==='num'?'value':'type'} and repeat steps 2 to 5.`],
 d1:()=>['Throw the plane as hard as I can and keep only the best flight.'],
 d2:()=>['Change two settings at the same time to save time.'],
 d3:()=>['Fold a new plane from a different type of paper for every trial.']
};
/* Only hands-on steps someone could follow to run the test. No "keep everything the same" (that belongs in control variables) and no "work out the average" (that is data processing, not method). */
const MB_ORDER=['m1','m3','m4','m5','m6','m7'];
function mbList(){return Array.isArray(A('mb'))?A('mb').filter(k=>MB[k]):[]}
function mbDev(k){const c=cx(),g=c.isNum?'value':'group';return{
 m1:`Set the ${c.ivLower} to the first ${g} I am testing.`,
 m3:`Launch the plane ${S.launch==='launcher'?'with the launcher':'by hand'} from behind the start line.`,
 m4:S.dv==='dist'?'Measure the distance from the start line to the nose of the plane with the tape measure, and estimate the last digit.':'Time the flight with the stopwatch, from when the plane is released until it lands.',
 m5:'Record the result in my results table.',m6:'Repeat steps 2 to 4 until I have 3 trials.',
 m7:`Change the ${c.ivLower} to the next ${g} and repeat steps 2 to 5.`,
 d1:'Throw the plane as hard as I can and keep only the best flight.',d2:'Change two settings at the same time to save time.',d3:'Fold a new plane from a different type of paper for every trial.'}[k]}
function methodBankHTML(){
  const mine=mbList(),bank=shuf(Object.keys(MB),'mb').filter(k=>!mine.includes(k));
  const show=(k)=>isDev()?esc(mbDev(k)):MB[k]().map(p=>typeof p==='string'?esc(p):'____').join('');
  return`<div class="grid2"><div><span class="lbl">Step bank</span><div class="opts">${bank.map(k=>`<button class="opt" data-act="mb:add" data-k="${k}"><span class="mark">+</span><span class="t">${show(k)}</span></button>`).join('')||'<p class="note">All steps used.</p>'}</div></div>
   <div><span class="lbl">My method</span>${mine.length?`<div class="rows">${mine.map((k,i)=>`<div class="panel" style="padding:8px 10px"><div style="display:flex;gap:6px;align-items:flex-start"><b style="padding-top:8px">${i+1}.</b><div style="flex:1;padding-top:6px">${isDev()?esc(mbDev(k)):frame('mb.'+k,MB[k]())}</div>
     <div style="display:flex;gap:3px;align-items:flex-start"><button class="btn sm" data-act="mb:up" data-i="${i}" ${i?'':'disabled'} aria-label="Move up">▲</button><button class="btn sm" data-act="mb:dn" data-i="${i}" ${i<mine.length-1?'':'disabled'} aria-label="Move down">▼</button><button class="btn sm" data-act="mb:rm" data-i="${i}" aria-label="Remove">✕</button></div></div></div>`).join('')}</div>`:'<p class="note">Click a step in the bank to add it here.</p>'}</div></div>`;
}
function methodList(){if(isDev())return mbList().map(mbDev);if(helped())return mbList().map(k=>frameText('mb.'+k,MB[k]())).filter(Boolean);const o=[];for(let i=0;i<7;i++){const t=A('met.'+i).trim();if(t)o.push(t)}return o}
function safetyList(){const o=[];for(let i=0;i<3;i++){const t=A('saf.'+i).trim();if(t)o.push(t)}return o}
function obsText(){if(isDev())return['obs1','obs2','obs3'].map(n=>frameText(n,OBSF[n]())).filter(Boolean).join(' ');return A('obs')}
const OBSF={obs1:()=>['When I changed the ',{k:'a',ph:'what you changed'},', the plane ',{k:'b',w:'w3',ph:'what it did'},'.'],obs2:()=>['When I changed the ',{k:'a',ph:'what you changed'},', the plane ',{k:'b',w:'w3',ph:'what it did'},'.'],obs3:()=>['I wonder if ',{k:'a',w:'w3',ph:'a question you could test'},'']};
const SCI_STEPS=[['Observe','Notice something interesting.'],['Question','Ask a question you can test.'],['Hypothesis','Predict what will happen, and why.'],['Plan','Decide what to change, measure and keep the same.'],['Test','Collect your data carefully.'],['Results','Organise your data in a table and a graph.'],['Analysis','Explain what your data shows.'],['Evaluation','Decide how fair your test was and how to improve it.']];
BUILD.observe=function(){
  const B=newB();
  B.raw(`<div class="card"><h2>1. Observe</h2><p class="lead">Every investigation starts with an <b>observation</b>: noticing something interesting. Before you plan a test, play with the paper plane. Change things, throw it, and watch what happens.</p>
   <p class="lbl" style="margin:6px 0">The steps you will follow today</p><div class="chips" style="margin-bottom:12px">${SCI_STEPS.map((x,i)=>`<span class="chip" style="cursor:default;${i===0?'background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700':''}" title="${esc(x[1])}">${i+1}. ${x[0]}</span>`).join('')}</div>
   <div class="labgrid"><div class="labcol" id="labL"></div><div class="labcol" id="labR"></div></div>`);
  let body,done;
  if(isDev()){body=tip(['developing'],'Change ONE thing at a time, then throw. Look at how far it goes and how it flies. Then fill in the gaps.')+frame('obs1',OBSF.obs1())+frame('obs2',OBSF.obs2())+frame('obs3',OBSF.obs3());done=frameDone('obs1',OBSF.obs1())&&frameDone('obs2',OBSF.obs2())&&frameDone('obs3',OBSF.obs3())}
  else{body=tip(['proficient'],'Sentence starters: <i>I noticed that… · When I changed the…, the plane… · I wonder if…</i>')+nudge(['mastering'],'Check your notebook: what makes a good scientific observation?')+`<p style="margin:4px 0"><b>Write at least two observations and one thing you wonder about.</b></p>`+ta('obs','',4);done=words(A('obs'))>=1}
  B.q('obs','My observations',body,done&&(S.expN||0)>=3);
  const ready=(S.expN||0)>=3;
  B.raw(`<div class="nav"><span class="msg" id="obsmsg">${ready?'':'Try to throw at least 3 planes first.'}</span><button class="btn primary" id="obsnext" data-go="question">I'm ready: write my question →</button></div></div>`);
  return B;
};
const ENV={inside:'Inside the sports hall',outside:'Outside on the field'},LAUNCH={hand:'By hand',launcher:'With a rubber band launcher'};

/* ---------- START ---------- */
function startHTML(){
  const saved=loadSaved();
  const cont=saved&&saved.started&&saved.name&&LV[saved.level]?`<div class="card" style="border-color:var(--accent)"><h3>Welcome back, ${esc(saved.name)}</h3><p class="note">You have a saved lab at the <b>${esc(LV[saved.level].n)}</b> level. Pick up where you left off.</p>
   <button class="btn primary" data-act="resume">Continue my lab</button></div>`:'';
  const cards=LVI.map(k=>{const l=LV[k];return`<button class="lvcard ${START.level===k?'sel':''}" style="--c:${l.col}" data-act="pick-level" data-k="${k}"><h3>${l.n} <span class="stars">${'★'.repeat(l.stars)}${'☆'.repeat(4-l.stars)}</span></h3><b style="font-size:13px">${l.say}</b><ul>${l.help.map(x=>`<li>${x}</li>`).join('')}</ul><div class="cap">${capText(k)}</div></button>`}).join('');
  return`${cont}<div class="card"><h2>Welcome to the Paper Plane Lab! ✈️</h2>
   <p class="lead" style="font-size:19px;color:var(--ink)">During this learning experience, you'll be reviewing the <b>scientific method</b> by investigating what makes a paper plane fly further or for longer. You will observe, ask a question, make a hypothesis, plan a fair test, collect data, make a graph and evaluate your experiment.</p>
   <p class="lead">At the end you save your lab report as a PDF and hand it in on Toddle. If you finish early, there are extension activities.</p>
   <div class="grid2" style="max-width:640px"><label><span class="lbl">Your name</span><input type="text" data-bind="start.name" value="${esc(START.name)}" placeholder="First and last name"></label>
   <label><span class="lbl">Your class</span><input type="text" data-bind="start.cls" value="${esc(START.cls)}" placeholder="For example 6A"></label></div>
   <h3 style="margin-top:18px">Choose your challenge level</h3>
   <div class="nudge" style="background:var(--accent-soft);border-color:var(--accent)"><b>Your grade is capped at the level you choose.</b> If you choose Developing, the highest grade you can get is Developing. If you choose Proficient, it is Proficient, and so on. <b>Einstein</b> is an extra challenge: it is graded like Mastering, but with no help at all. Your level is locked once you start, so choose carefully.</div>
   <div class="levels">${cards}</div>
   <div class="nav"><span class="msg">${!START.name.trim()?'Type your name to begin.':!START.cls.trim()?'Type your class to begin.':!START.level?'Choose a challenge level.':'Ready? Your level will be locked.'}</span>
   <button class="btn primary big" data-act="start" ${START.name.trim()&&START.cls.trim()&&START.level?'':'disabled'}>Start the lab →</button></div></div>`;
}
function doStart(){
  S=blank();S.name=START.name.trim();S.cls=START.cls.trim();S.level=START.level;S.seed=(Date.now()%90000)+7+[...S.name].reduce((a,c)=>a+c.charCodeAt(0),0)%997;S.started=true;S.step='observe';S.date=new Date().toISOString();
  save();render();window.scrollTo(0,0);
}

/* ---------- QUESTION ---------- */
function clearTests(){S.levels=[];S.flights=[];S.planes={};S.fc=0;S.labLevel=null;S.graph=null;S.revealed=false;Object.keys(S.a).forEach(x=>{if(x.startsWith('avg.')||x.startsWith('obs.'))delete S.a[x]});S.partner.avgs={};S.partner.code=null}
function setIV(k){
  if(S.iv===k)return;
  const doIt=()=>{S.iv=k;clearTests();S.a.ivtype=IVS[k].type;S.design=Object.assign({},DEFAULTS);if(k==='span')S.design.design='Classic';save();render()};
  if(S.iv&&live().length)askConfirm('Changing your independent variable will clear your test flights. Change it?',doIt);else doIt();
}
function setDV(k){
  if(S.dv===k)return;
  const doIt=()=>{S.dv=k;S.graph=null;Object.keys(S.a).forEach(x=>{if(x.startsWith('avg.'))delete S.a[x]});S.partner.avgs={};S.partner.code=null;save();render()};
  if(S.dv&&live().length)askConfirm('Changing what you measure will clear your averages, graph and partner results. Change it?',doIt);else doIt();
}
function chooserHTML(){
  const used=(S.archive||[]).map(a=>a.iv);
  let h=`<div class="tip" style="margin-top:0">Planning to do the peer review extension with a partner? You must both choose the <b>same</b> things on this page and on the Plan page, so you run the same experiment.</div>
   <p style="margin:8px 0 4px"><b>1. What will you change?</b> Choose ONE thing.</p>
   <div class="cards">`+Object.keys(IVS).map(k=>`<button class="ivbtn ${S.iv===k?'sel':''}" data-act="iv" data-k="${k}" ${used.includes(k)?'disabled title="You tested this in your first investigation"':''}><b>${esc(IVS[k].label)}</b><span>${used.includes(k)?'You tested this already.':esc(IVX[k].desc)}</span></button>`).join('')+`</div>`;
  h+=`<p style="margin:12px 0 4px"><b>2. What will you measure?</b> Choose ONE thing.</p><div class="cards">`+
   ['dist','time'].map(k=>`<button class="ivbtn ${S.dv===k?'sel':''}" data-act="dv" data-k="${k}"><b>${DVX[k].name}</b><span>${k==='dist'?'How far the plane flies. You read a tape measure.':'How long the plane stays in the air. You use a stopwatch.'}</span></button>`).join('')+`</div>`;
  return h;
}
BUILD.question=function(){
  const B=newB();B.raw(`<div class="card"><h2>2. Question</h2><p class="lead">Choose what you will change and what you will measure. Then write your research question and name your variables.</p>`);
  B.q('choose','Choose your variables',chooserHTML(),!!(S.iv&&S.dv));
  if(S.iv&&S.dv){
    const c=cx();let body='',done=false;
    if(helped()){
      body=(A('obs3.a')?tip(['developing'],'You wondered: <i>“I wonder if '+esc(A('obs3.a'))+'”</i> A research question turns a wondering like this into something you can test.'):'')+tip(['developing'],'A research question names the variable you <b>change</b> and the variable you <b>measure</b>. Fill in the gaps with the names of your two variables.')+
        tip(['proficient'],'Use the names of your two variables.')+frame('rq',FR.rq())+
        `<p style="margin:10px 0 2px"><b>Add one more sentence that gives detail about your question.</b> ${isDev()?'(For example, what do you already know about this?)':''}</p>`+ta('rq.x','',2)+
        chkBtn('rq',()=>[{ok:hasIV(A('rq.a')),msg:'The first gap names your independent variable.',fix:`The first gap should be the variable you change: the ${c.ivLower}.`},
          {ok:hasDV(A('rq.b')),msg:'The second gap names your dependent variable.',fix:`The second gap should be the variable you measure: the ${c.dv.lower}.`},
          {ok:words(A('rq.x'))>=6,msg:'You added a sentence of detail.',fix:'Add a sentence of at least 6 words, for example something you already know about paper planes.'}]);
      done=frameDone('rq',FR.rq());
    }else{
      body=nudge(['mastering'],'Look in your notebook for how to write a research question, and add the science idea behind it.')+
        `<span class="lbl">Research question</span>${ta('rq','',2)}<span class="lbl" style="display:block;margin-top:6px">${isMas()?'The science idea behind my question':'More detail (optional)'}</span>${ta('rq.x','',2)}`;
      done=words(A('rq'))>=1;
    }
    B.q('rq','Research question',body,done);
    const b2=tip(['developing'],'Write the name of each variable. Then write its <b>units</b> in the units box, for example <i>°C</i> for temperature. Some variables do not have units: if so, write <i>none</i>.')+tip(['proficient'],'Write each variable and its units. If a variable has no units, write <i>none</i>.')+
      `<div class="grid2"><div><span class="lbl">Independent variable (the variable I am changing)</span><input type="text" data-bind="iv.t" value="${esc(A('iv.t'))}"><span class="lbl" style="display:block;margin-top:6px">Units (if any)</span><input type="text" data-bind="iv.u" value="${esc(A('iv.u'))}" style="max-width:220px"></div>
       <div><span class="lbl">Dependent variable (the variable I am measuring)</span><input type="text" data-bind="dv.t" value="${esc(A('dv.t'))}"><span class="lbl" style="display:block;margin-top:6px">Units (if any)</span><input type="text" data-bind="dv.u" value="${esc(A('dv.u'))}" style="max-width:220px"></div></div>`+
      chkBtn('ivdv',()=>[{ok:hasIV(A('iv.t')),msg:'Your independent variable matches what you chose.',fix:`Your independent variable is the one you change: the ${c.ivLower}.`},
        {ok:unitOK('iv'),msg:'The units for your independent variable are right.',fix:c.isNum?`What is the ${c.ivLower} measured in? Look at the values you can choose.`:`The ${c.ivLower} is a type, not a number, so it has no units. Write none.`},
        {ok:hasDV(A('dv.t')),msg:'Your dependent variable matches what you chose.',fix:`Your dependent variable is the one you measure: the ${c.dv.lower}.`},
        {ok:unitOK('dv'),msg:'The units for your dependent variable are right.',fix:S.dv==='dist'?'Distance is measured with a tape measure. Which units are on the tape?':'Time is measured with a stopwatch. Which units does it show?'}]);
    B.q('ivdv','Independent and dependent variable',b2,words(A('iv.t'))>=1&&words(A('dv.t'))>=1);
  }
  B.raw(`<div class="nav"><button class="btn" data-go="observe">← Observe</button><span class="msg"></span><button class="btn primary" data-go="hypothesis">Next: Hypothesis →</button></div></div>`);
  return B;
};

/* ---------- HYPOTHESIS ---------- */
BUILD.hypothesis=function(){
  const B=newB();B.raw(`<div class="card"><h2>3. Hypothesis</h2><p class="lead">A hypothesis is a prediction you can test. Use the <b>IF, THEN, BECAUSE</b> format.</p>`);
  if(!S.iv||!S.dv){B.raw(`<div class="fb mid">Choose your variables on the Question page first.</div><div class="nav"><button class="btn" data-go="question">← Question</button></div></div>`);return B}
  const c=cx();let body='',done=false;
  if(isDev()){
    body=tip(['developing'],(c.isNum?`<b>IF</b> says what you will change.`:`<b>IF</b> says which experimental group you think will do best (or worst).`)+` <b>THEN</b> says what you think will happen to what you measure. <b>BECAUSE</b> gives the science reason.<br>Useful science words: <i>lift, air resistance, weight, gravity, energy, speed, balance</i>.`)+frame('hyp',FR.hypD())+
     chkBtn('hyp',()=>[{ok:mentionsIV(A('hyp.b')),msg:c.isNum?'The IF part names your independent variable.':'The IF part names one of your experimental groups.',fix:c.isNum?`After "If I … the", write the variable you change: ${c.ivLower}.`:`After "If I throw a plane with", write one of your experimental groups, for example ${S.levels[0]!=null?lvlLabel(S.iv,S.levels[0]):c.iv.cats[0]}.`},
       {ok:hasDV(A('hyp.c')),msg:'The THEN part names your dependent variable.',fix:`After "then the", write the variable you measure: ${c.dv.lower}.`},
       {ok:words(A('hyp.d'))>=1,msg:'You said what will happen.',fix:c.isNum?'Say what will happen, for example "get bigger" or "get smaller".':'Say if it will be the greatest or the smallest.'},
       {ok:words(A('hyp.e'))>=5,msg:'You gave a science reason.',fix:'Write a reason of at least 5 words. Use one of the useful science words.'}]);
    done=frameDone('hyp',FR.hypD());
  }else if(isPro()){
    body=tip(['proficient'],c.isNum?'<b>IF</b> you change something, <b>THEN</b> say what will happen to what you measure, <b>BECAUSE</b> give a science reason.':'<b>IF</b> you throw a plane from one of your groups, <b>THEN</b> say how it will compare with the others, <b>BECAUSE</b> give a science reason.')+frame('hyp',FR.hypP())+
     chkBtn('hyp',()=>[{ok:hasIV(A('hyp.a')),msg:'The IF part names your independent variable.'},{ok:hasDV(A('hyp.b')),msg:'The THEN part names your dependent variable.'},{ok:words(A('hyp.c'))>=5,msg:'The BECAUSE part gives a reason (at least 5 words).'}]);
    done=frameDone('hyp',FR.hypP());
  }else{
    body=nudge(['mastering'],'Check your notebook for the hypothesis format and what a probable reason looks like.')+ta('hyp','',4);done=words(A('hyp'))>=1;
  }
  B.q('hyp','My hypothesis',body,done);
  B.raw(`<div class="nav"><button class="btn" data-go="question">← Question</button><span class="msg"></span><button class="btn primary" data-go="plan">Next: Plan →</button></div></div>`);
  return B;
};

/* ---------- PLAN ---------- */
const testsStarted=()=>live().length>0;
function lvlPickerHTML(){
  const iv=IVS[S.iv],vals=iv.type==='num'?iv.vals:iv.cats,n=minLevels();
  return`<p class="note" style="margin-bottom:6px">Each one you choose is an <b>experimental group</b>. Choose at least <b>${n}</b>. Each group gets three trials.</p>
   <div class="chips">${vals.map(v=>`<button class="chip ${S.levels.includes(v)?'sel':''}" data-act="levelpick" data-v="${esc(v)}" ${S.flights.some(f=>f.lv===v&&!f.gone)?'disabled title="You already have flights for this one"':''}>${esc(lvlLabel(S.iv,v))}</button>`).join('')}</div>
   <p class="note" style="margin-top:6px">${S.levels.length} chosen ${S.levels.length>=n?'✓':`(need ${n})`} · ${S.levels.length*3} flights</p>`;
}
const DESIGN_OPTS={design:Object.keys(DESIGNS),span:[6,8,10,12,14,16],paper:Object.keys(PAPERS),tips:Object.keys(TIPS),clippos:['No clip','Nose','Middle','Tail'],clips:[1,2,3,4,5],angle:[-10,-5,0,5,10,15,20,25,30,35,40,45,50],speed:[3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9]};
function designKeys(ui){
  const ivs=IVS[S.iv].setting,d=S.design;
  return['design','span','paper','tips','clippos','clips'].concat(ui?[]:['angle','speed']).filter(k=>{
    if(k===ivs)return false;
    if(k==='span'&&d.design!=='Classic')return false;
    if(k==='clips'&&(S.iv==='clippos'||d.clippos==='No clip'))return false;
    return true});
}
function designerHTML(){
  const lock=testsStarted(),iv=IVS[S.iv],shown=S.levels[0]!=null?S.levels[0]:(iv.type==='num'?iv.vals[0]:iv.cats[0]);
  const s=makeSettings(S.iv,shown,S.design),P=planeParams(s,null);
  const rows=designKeys(true).map(k=>{let opts=DESIGN_OPTS[k];if(k==='design'&&S.iv==='span')opts=['Classic'];if(k==='clippos'&&S.iv==='clips')opts=opts.filter(o=>o!=='No clip');
    return`<label style="display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:center;margin:4px 0"><span>${SETTING_LABEL[k]}</span><select data-design="${k}" ${lock?'disabled':''}>${opts.map(o=>`<option value="${esc(o)}" ${String(S.design[k])===String(o)?'selected':''}>${esc(settingText(k,o))}</option>`).join('')}</select></label>`}).join('');
  return`<div class="grid2"><div>${rows}
    <p class="note" style="margin-top:6px"><b style="color:var(--accent)">${esc(iv.label)}</b> is not here because it is the one thing you will change.${S.design.design!=='Classic'&&S.iv!=='span'&&S.iv!=='design'?' The wingspan is set by the design.':''}</p>
    ${lock?'<div class="fb mid">Your design is locked because you have started testing. Everything here must stay the same in every flight.</div>':''}</div>
    <div class="panel" style="text-align:center">${planeSVG(s,P)}<p class="note">Picture: your plane with ${esc(lvlLabel(S.iv,shown))}</p>${S.levels.length?`<p style="margin:6px 0 0;font-size:15px">⚖ <b>Mass of each plane:</b> ${S.levels.map(lv=>`${esc(lvlLabel(S.iv,lv))}: ${fmt(planeParams(makeSettings(S.iv,lv,S.design),null).mass*1000,1)} g`).join(' · ')}</p><p class="note" style="margin:2px 0 0">${new Set(S.levels.map(lv=>fmt(planeParams(makeSettings(S.iv,lv,S.design),null).mass*1000,1))).size===1?'Every plane has the same mass, so mass is one of your control variables.':'The mass is not the same for every plane. Think about how this could affect your test.'}</p>`:''}</div></div>`;
}
function setupHTML(){
  const lock=testsStarted();
  const b=(act,k,label,desc,cur)=>`<button class="ivbtn ${cur===k?'sel':''}" data-act="${act}" data-k="${k}" ${lock?'disabled':''}><b>${label}</b><span>${desc}</span></button>`;
  return`<p style="margin:4px 0"><b>Where will you fly your planes?</b></p><div class="cards">${b('env','inside',ENV.inside,'A big indoor space with a tape measure on the floor.',S.env)}${b('env','outside',ENV.outside,'The school field with a tape measure on the grass.',S.env)}</div>
   <p style="margin:8px 0 4px"><b>How will you launch them?</b></p><div class="cards">${b('launch','hand',LAUNCH.hand,'You throw each plane yourself.',S.launch)}${b('launch','launcher',LAUNCH.launcher,'A stretched rubber band fires each plane.',S.launch)}</div>
   ${tip(['developing','proficient'],'Think about which choices will make your test fairer.')}
   ${lock?'<div class="fb mid">Your set-up is locked because you have started testing.</div>':''}`;
}
BUILD.plan=function(){
  const B=newB();B.raw(`<div class="card"><h2>4. Plan</h2><p class="lead">Set up your test, design your plane, then plan it so that someone else could repeat it.</p>`);
  if(!S.iv||!S.dv){B.raw(`<div class="fb mid">Choose your variables on the Question page first.</div><div class="nav"><button class="btn" data-go="question">← Question</button></div></div>`);return B}
  const c=cx();
  B.q('levels',`Choose your experimental groups (the ${esc(c.ivLower)} you will test)`,lvlPickerHTML(),S.levels.length>=minLevels());
  B.q('setup','Set up your test',setupHTML(),!!(S.env&&S.launch));
  B.q('design','Design your plane',`<p class="note" style="margin-bottom:6px">Choose how your plane is built. These settings will stay the same in every flight. You will set the launch angle and throw speed in the simulator.</p>`+designerHTML(),!!(S.env&&S.launch));
  /* controls */
  const cb=tip(['developing'],'Look at your plane design and your set-up above. Everything you chose there must stay the same in every flight. Choose three of them.')+
   tip(['proficient'],'Choose three things that stay the same in every flight, and say how you will keep each one the same.')+
   nudge(['mastering'],'Check your notebook: what makes a test fair?')+
   `<div class="rowi two" style="font-weight:700;font-size:13px"><span></span><span>CONTROL VARIABLES</span><span>HOW WILL I CONTROL THEM?</span></div><div class="rows">`+[0,1,2].map(i=>`<div class="rowi two"><span class="no">${i+1}.</span><input type="text" data-bind="ctl.n${i}" value="${esc(A('ctl.n'+i))}" ${isDev()?'placeholder="The …"':''}><input type="text" data-bind="ctl.h${i}" value="${esc(A('ctl.h'+i))}" ${isDev()?'placeholder="I will keep it … by …"':''}></div>`).join('')+`</div>`+
   chkBtn('ctl',()=>{const known=[...Object.values(SETTING_LABEL),'where','place','location','inside','outside','launch','throw','person','same plane','wind','air'].map(x=>x.toLowerCase().split(' ')[0]);
     const named=[0,1,2].map(i=>A('ctl.n'+i).toLowerCase());
     return[{ok:named.every(n=>words(n)>0),msg:'You listed three control variables.',fix:'Write three control variables, one in each row.'},
      {ok:!named.some(n=>IVX[S.iv].main.test(n)),msg:'Your independent variable is not in the list.',fix:`The ${c.ivLower} is what you change, so it cannot be a control variable.`},
      {ok:named.filter(n=>known.some(k=>n.includes(k))).length>=3,msg:'All three are things from your design or set-up.',fix:'Use things you chose in your plane design or set-up, such as the type of paper or where you fly.'},
      {ok:[0,1,2].every(i=>words(A('ctl.h'+i))>=3),msg:'You said how to control each one.',fix:'For each one, say how you will keep it the same, for example "I will use the same … for every flight".'}]});
  B.q('ctl','Control variables',cb+doneWhen('all three rows have a control variable <b>and</b> how you will control it'),[0,1,2].every(i=>words(A('ctl.n'+i))>0&&words(A('ctl.h'+i))>0));
  /* materials */
  let mt,mdn;
  if(helped()){
    const mine=matList();
    mt=tip(['developing'],'Click each thing you need to move it onto your materials list. Leave out anything you do not need.')+tip(['proficient'],'Click each thing you need, then write how many you need. Leave out anything you do not need.')+
     `<div class="grid2"><div><span class="lbl">Equipment shelf</span><div class="opts">${matShelf().filter(m=>!mine.includes(m.id)).map(m=>`<button class="opt" data-act="mat:add" data-k="${m.id}"><span class="mark">+</span><span class="t">${esc(isDev()?m.t+': '+m.amt:m.t)}</span></button>`).join('')||'<p class="note">The shelf is empty.</p>'}</div></div>
      <div><span class="lbl">My materials</span>${mine.length?`<div class="opts">${mine.map(id=>{const m=matShelf().find(x=>x.id===id);if(!m)return'';return`<div class="opt" style="cursor:default;align-items:center"><span class="t" style="flex:1">${esc(m.t)}${isDev()?': '+esc(m.amt):''}</span>${isPro()?`<input type="text" class="inl" data-bind="mat.n.${m.id}" value="${esc(A('mat.n.'+m.id))}" placeholder="how many?" style="min-width:9ch;width:11ch">`:''}<button class="btn sm" data-act="mat:rm" data-k="${m.id}" aria-label="Remove">✕</button></div>`}).join('')}</div>`:'<p class="note">Click things on the shelf to add them here.</p>'}</div></div>`+
     chkBtn('mat',()=>{const need=matShelf().filter(m=>m.need===true).map(m=>m.id),opt=matShelf().filter(m=>m.need==='opt').map(m=>m.id),extra=mine.filter(id=>!need.includes(id)&&!opt.includes(id)),miss=need.filter(id=>!mine.includes(id));
       return[{ok:!miss.length,msg:'You have everything you need.',fix:`You are missing ${miss.length} thing${miss.length===1?'':'s'}. Think about what you need to build, launch and measure.`},{ok:!extra.length,msg:'You left out things you do not need.',fix:'Take out the things you do not need for this test.'}].concat(isPro()?[{ok:mine.every(id=>words(A('mat.n.'+id))>=1),msg:'You wrote how many of each.',fix:'Write how many you need of each thing.'}]:[])});
    mdn=mine.length>=4&&(!isPro()||mine.every(id=>words(A('mat.n.'+id))>=1));
  }else{mt=nudge(['mastering'],'Check your notebook: a materials list says what you need and <b>how many</b> (amounts).')+`<p class="note" style="margin:0 0 4px">Write each item and how many you need, one on each line.</p>`+ta('mat','',4);mdn=matLinesDone()}
  B.q('mat','Materials',mt+doneWhen(isDev()?'you have at least 4 things on your list':'you have at least 4 things, each with an amount (how many)'),mdn);
  /* method */
  let me,mde;
  if(helped()){
    me=tip(['developing'],'Click the steps you need to add them to your method. Some steps would make the test <b>unfair</b>, so leave them out. Use the arrows to put your steps in order.')+tip(['proficient'],'Pick the steps you need, put them in order and fill in the gaps. Leave out any step that would make the test unfair.')+methodBankHTML()+
     chkBtn('met',()=>{const m=mbList(),pos=k=>m.indexOf(k),bad=m.filter(k=>k[0]==='d'),miss=MB_ORDER.filter(k=>!m.includes(k));
       const ordered=['m3','m4','m5','m6','m7'].every((k,i,a)=>i===0||pos(a[i-1])<pos(k))&&pos('m1')<pos('m3');
       return[{ok:!bad.length,msg:'You left out the steps that make the test unfair.',fix:'Take out any step that changes more than one thing or only keeps the best flight.'},
        {ok:!miss.length,msg:'You have every step you need.',fix:`You are missing ${miss.length} step${miss.length===1?'':'s'}. Look in the bank again.`},
        {ok:!miss.length&&ordered,msg:'Your steps are in a sensible order.',fix:'Check the order: set up, launch, measure, record, repeat, then change to the next group.'},
        ...(isDev()?[]:[{ok:m.every(k=>frameDone('mb.'+k,MB[k]())),msg:'You filled in every gap.',fix:'Fill in every gap in your steps.'}]),
        {ok:isDev()||!m.includes('m6')||/\b3\b|three/i.test(A('mb.m6.a')),msg:'You repeat each test the right number of times.',fix:'How many trials does each value get? Check step "Repeat steps 2 to 4".'}]});
    mde=mbList().length>=4&&(isDev()||mbList().every(k=>frameDone('mb.'+k,MB[k]())));
  }else{
    me=nudge(['mastering'],'Check your notebook for what makes a method easy to repeat.')+`<div class="rows">`+[0,1,2,3,4,5,6].map(i=>`<div class="rowi"><span class="no">${i+1}.</span><input type="text" data-bind="met.${i}" value="${esc(A('met.'+i))}"></div>`).join('')+`</div>`;
    mde=methodList().length>=4;
  }
  B.q('met','Method',me+doneWhen(isPro()?'you have at least 4 steps and every gap is filled in':'you have at least 4 steps'),mde);
  const ready=S.levels.length>=2&&S.env&&S.launch;
  B.raw(`<div class="nav"><button class="btn" data-go="hypothesis">← Hypothesis</button><span class="msg">${ready?'':'You need at least 2 experimental groups, a place to fly and a launch method before you fly.'}</span><button class="btn primary" data-go="lab">Next: Test flights →</button></div></div>`);
  return B;
};

/* typed materials list (Mastering, Einstein): done when there are at least 4 lines and every line gives an amount */
function matLinesDone(){const L=A('mat').split('\n').map(t=>t.trim()).filter(Boolean);return L.length>=4&&L.every(t=>/\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|a pair|pair|a|an)\b/i.test(t))}
const doneWhen=t=>`<p class="note donewhen">✓ This part turns green when ${t}.</p>`;
