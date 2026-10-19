/* ===== EVALUATION: fairness line, sorting limitations and improvements, Q3/Q4; plus the two mini-lessons ===== */
function miniScatter(kind,label){
  const pts={pos:[[12,62],[26,55],[40,44],[54,40],[68,26],[82,18]],neg:[[12,18],[26,28],[40,34],[54,46],[68,52],[82,62]],none:[[12,40],[26,24],[40,58],[54,30],[68,50],[82,36]]}[kind];
  const line={pos:'M8 66 L88 14',neg:'M8 14 L88 66',none:'M8 40 L88 40'}[kind];
  return`<figure style="margin:0;text-align:center"><svg viewBox="0 0 96 76" width="150" height="118" role="img" aria-label="${label}"><path d="M6 4 V70 H92" stroke="#14202e" stroke-width="2" fill="none"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="#1b7ea6"/>`).join('')}<path d="${line}" stroke="#c2700c" stroke-width="2" stroke-dasharray="5 4" fill="none"/></svg><figcaption style="font-weight:700">${label}</figcaption></figure>`;
}
function analysisLesson(){
  const num=S.iv&&IVS[S.iv].type==='num';
  if(num)return`<div class="learn"><b class="h">How to describe a scatter graph</b>
    <p style="margin:6px 0">Look at the <b>trend</b>: the overall direction of the points.</p>
    <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">${miniScatter('pos','Positive trend')}${miniScatter('neg','Negative trend')}${miniScatter('none','No trend')}</div>
    <p style="margin:6px 0"><b>Positive:</b> as one goes up, the other goes up. <b>Negative:</b> as one goes up, the other goes down. <b>No trend:</b> no clear pattern.</p>
    <p style="margin:6px 0">Then back it up with <b>numbers from your data</b>, for example: <i>“My graph shows a positive trend. As the ramp height increased from 10 cm to 50 cm, the speed increased from 1.2 m/s to 3.4 m/s.”</i></p></div>`;
  return`<div class="learn"><b class="h">How to describe a bar graph</b>
    <svg viewBox="0 0 200 90" width="300" height="135" role="img" aria-label="Bar graph example" style="display:block;margin:6px auto"><path d="M20 6 V80 H195" stroke="#14202e" stroke-width="2" fill="none"/><rect x="34" y="20" width="34" height="60" fill="#8cc3dc" stroke="#0d4a63"/><rect x="88" y="40" width="34" height="40" fill="#8cc3dc" stroke="#0d4a63"/><rect x="142" y="56" width="34" height="24" fill="#8cc3dc" stroke="#0d4a63"/><path d="M71 20 H176" stroke="#c2700c" stroke-dasharray="4 3"/><path d="M168 22 V54" stroke="#c2700c" stroke-width="2" marker-end="url(#ah)"/><defs><marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#c2700c"/></marker></defs><text x="174" y="42" font-size="9" fill="#c2700c">difference</text></svg>
    <p style="margin:6px 0">Compare the groups. Which had the <b>greatest</b> average? Which had the <b>smallest</b>?</p>
    <p style="margin:6px 0">Work out the <b>difference</b>: bigger number − smaller number.</p>
    <p style="margin:6px 0">For example: <i>“The steel ball rolled furthest (120 cm). The rubber ball rolled the shortest (45 cm). The difference was 75 cm.”</i></p></div>`;
}
function evaluationLesson(){
  return`<div class="learn"><b class="h">Fair tests and errors</b>
    <p style="margin:6px 0">A <b>fair test</b> changes only ONE thing (the independent variable). Everything else stays the same.</p>
    <p style="margin:6px 0">A <b>source of error</b> is anything that made your results less accurate. There are two kinds:</p>
    <ul style="margin:4px 0"><li><b>Human error:</b> a mistake made by the person doing the test. <i>Example: pressing the stopwatch too late.</i></li>
    <li><b>Method error:</b> a problem with how the test was set up, even if you did everything carefully. <i>Example: a breeze from a window pushed some planes.</i></li></ul>
    <p style="margin:6px 0">In your evaluation, <b>focus on method errors</b>. Human errors are slips, and you fix them by being more careful. Method errors are built into how the test was done, so even a very careful scientist gets them. Finding method errors is how scientists improve their experiments.</p>
    <p style="margin:6px 0">Results are <b>reliable</b> if you get similar results when you repeat the test. You can make results more reliable by fixing errors and by doing <b>more trials</b>.</p></div>`;
}

/* ---- fairness line ---- */
function fairHTML(){
  const v=A('fair','');const has=v!=='';
  return`<div style="max-width:760px;margin:10px auto 4px">
    <div class="fairline" data-act="fair" role="slider" aria-label="How fair was your test" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${has?v:50}" tabindex="0">
      ${has?`<span class="fairx" style="left:${v}%">✕</span>`:''}</div>
    <div style="display:flex;justify-content:space-between;font-weight:700;margin-top:6px"><span>Very unfair</span><span>Quite fair</span><span>Very fair</span></div>
    <p class="note" style="text-align:center;margin-top:4px">${has?'Click again to move your ✕.':'Click on the line to mark your ✕.'}</p></div>`;
}
const FAIRF=()=>['I put my ✕ here because ',{k:'a',w:'w3',ph:'what made your test fair or unfair'},'.'];
function fairText(){return isDev()?frameText('fairw',FAIRF()):A('fairw')}
function fairWord(){const v=Number(A('fair','50'));return v<20?'very unfair':v<45?'quite unfair':v<70?'quite fair':v<88?'fair':'very fair'}

/* ---- limitations and improvements cards ---- */
function sortCards(){
  const L=live(),timed=L.some(f=>f.timed!=null&&f.hid&&f.hid.sw!=null)||S.dv==='time',dist=S.dv==='dist',hand=S.launch!=='launcher';
  const c=[];const add=(id,t,cat,when=true)=>{if(when)c.push({id,t,cat})};
  /* human errors are written as obvious personal slips ("Oops…", "by mistake") */
  add('h1','Oops! I was not paying attention and pressed the stopwatch late.','human',timed);
  add('h2','Oops! I misread the tape measure by mistake.','human',dist);
  add('h3','Oops! I typed a number into the wrong box by mistake.','human');
  add('h4','Oops! I moved the angle or speed slider by mistake partway through.','human',unfairFlights().length>0);
  add('h5','Oops! I forgot to write down one flight, so I had to redo it.','human',!timed||!dist);
  add('m1',hand?'Throwing by hand gives a slightly different speed and angle every time.':'Even the launcher fired each plane a little differently.','method');
  add('m2',S.env==='outside'?'The wind kept changing and pushed some planes.':'Moving air from the vent pushed some planes.','method');
  add('m3','Folding by hand means each plane is a little different.','method');
  add('m8','Even a careful person needs about a fifth of a second to react when starting and stopping a stopwatch.','method',timed);
  add('m4','The tape measure only had marks every 10 cm.','method',dist);
  add('m5',S.iv==='design'?'Different designs used different amounts of paper, so their mass was different too.':'Changing the wingspan also changed the mass of the plane.','method',S.iv==='span'||S.iv==='design');
  add('m6','One plane nosedived for no clear reason.','method',L.some(f=>f.hid&&f.hid.dive));
  add('m7','I only did 3 trials for each group.','method');
  add('m9','The rubber band got looser after many launches, so later planes were launched more weakly.','method',!hand&&L.some(f=>f.hid&&f.hid.power<0.96));
  add('i1','Use a rubber band launcher so every launch is the same.','improve',hand);
  add('i2',S.env==='outside'?'Test inside, where there is no wind.':'Close doors and windows and switch off the air conditioning.','improve');
  add('i3','Do more trials for each group and use the average.','improve');
  add('i4','Fold every plane using the same template.','improve');
  add('i5','Use a tape measure with marks every 1 cm.','improve',dist);
  add('i6','Film each flight and time it from the video.','improve',timed);
  add('i7','Use a new rubber band, or check the launch power before each group.','improve',!hand&&L.some(f=>f.hid&&f.hid.power<0.96));
  if(isPro()){add('x1','The planes were different colours.','irrelevant');add('x2','The lab was done on a school day.','irrelevant');add('x3','Make the planes a brighter colour.','irrelevant')}
  return shuf(c,'sortcards');
}
const SORT_CATS=[['human','Human error','a mistake by the person'],['method','Method error','a problem with how the test was set up'],['improve','Improvement','a change to make the test fairer or more reliable'],['irrelevant','Not relevant','does not affect the results']];
const catOK=(card,v)=>Array.isArray(card.cat)?card.cat.includes(v):card.cat===v;
function sortHTML(){
  const cards=sortCards(),cats=SORT_CATS.filter(c=>c[0]!=='irrelevant'||isPro()),chk=A('chk.sort')===1;
  let h=`<div class="tip" style="margin-top:0">${isDev()?'Sort each card: is it a <b>human error</b>, a <b>method error</b> or an <b>improvement</b>?':'Sort each card: is it a <b>human error</b>, a <b>method error</b>, an <b>improvement</b>, or <b>not relevant</b> to your results?'}</div>
   <div class="sortgrid">`+cards.map(cd=>{const v=A('sort.'+cd.id);const mark=chk&&v?(catOK(cd,v)?'<b style="color:var(--good)">✓</b>':'<b style="color:var(--bad)">✗</b>'):'';
     return`<div class="sortcard ${v?'set':''}"><div style="display:flex;gap:8px;justify-content:space-between"><span>${esc(cd.t)}</span>${mark}</div><div class="chips" style="margin-top:6px">${cats.map(c=>`<button class="chip ${v===c[0]?'sel':''}" data-act="sortpick" data-id="${cd.id}" data-k="${c[0]}" title="${esc(c[2])}">${c[1]}</button>`).join('')}</div></div>`}).join('')+`</div>
   <div style="margin-top:8px"><button class="btn sm" data-act="chk" data-id="sort">Check my sorting</button></div>`;
  if(chk){const done=cards.filter(cd=>A('sort.'+cd.id)),right=done.filter(cd=>catOK(cd,A('sort.'+cd.id)));h+=`<div class="fb ${right.length===cards.length?'ok':'mid'}">${right.length} of ${cards.length} sorted correctly.${right.length<cards.length?' Look again at the ones with ✗.':''}</div>`}
  return h;
}
function sortDone(){return sortCards().every(cd=>A('sort.'+cd.id))}
function sortSummary(plain){const cards=sortCards(),g={};cards.forEach(cd=>{const v=A('sort.'+cd.id);if(v)(g[v]=g[v]||[]).push(cd.t+(plain||catOK(cd,v)?'':'  !'))});return g}

BUILD.evaluate=function(){
  const B=newB();B.raw(`<div class="card"><h2>8. Evaluation</h2><p class="lead">How fair was your test? Find the method errors, then decide how to make your test fairer and your results more reliable.</p>`);
  if(!live().length){B.raw(`<div class="fb no">You haven’t recorded any flights yet. Go to <b>Test flights</b> and record your flights first.</div><div class="nav"><button class="btn" data-go="lab">← Test flights</button></div></div>`);return B}
  /* 1. fairness line */
  let fb=`<p style="margin:4px 0"><b>Mark an ✕ on the line to show how fair your test was.</b></p>`+fairHTML();
  fb+=isDev()?frame('fairw',FAIRF()):`<p style="margin:8px 0 2px"><b>Explain where you put your ✕.</b></p>`+ta('fairw','',2);
  B.q('fair','1. How fair was my test?',fb,A('fair','')!==''&&(isDev()?frameDone('fairw',FAIRF()):words(A('fairw'))>=1));
  /* my flight notes */
  {const N=live().filter(f=>(f.note||'').trim());B.raw(`<div class="panel" style="margin:10px 0"><h4>📝 My flight notes</h4>${N.length?`<ul style="margin:4px 0;padding-left:20px">${N.map(f=>`<li><b>Flight ${f.n} (${esc(lvlLabel(S.iv,f.lv))}):</b> ${esc(f.note)}</li>`).join('')}</ul>`:'<p class="note" style="margin:0">You did not write any notes during your flights.</p>'}<p class="note" style="margin:4px 0 0">Use your notes to help you find the method errors.</p></div>`)}
  /* 2. behind the scenes */
  B.raw(S.revealed?revealHTML():`<div class="reveal"><h3>🔍 Behind the scenes</h3><p class="note">The lab secretly recorded what really happened in each flight. ${trialsDone()?'Open it to help you find sources of error.':'It opens when all your flights are done.'}</p><button class="btn primary" data-act="reveal" ${trialsDone()?'':'disabled'}>Show me</button></div>`);
  /* 3. limitations and improvements */
  let sb,sd;
  if(helped()){sb=sortHTML();sd=sortDone()}
  else{
    sb=nudge(['mastering'],'Think about: how you measured (the tape and the stopwatch) · whether every throw was exactly the same · the air around the planes · how the planes were made · how many trials you did.')+
      `<p style="margin:4px 0"><b>List the method errors in your test, and an improvement for each.</b> Leave out human errors (slips you could fix by being more careful).</p>
      <div class="grid2"><div><span class="lbl">Method errors</span>${ta('ev.m','',5)}</div><div><span class="lbl">Improvements</span>${ta('ev.i','',5)}</div></div>`;
    sd=words(A('ev.m'))>=1&&words(A('ev.i'))>=1;
  }
  B.q('sort',helped()?'2. Sort the errors and improvements':'2. Method errors and improvements',sb,sd);
  /* 4. written evaluation */
  ['q3','q4'].forEach((n,i)=>addQ(B,n,i+2));
  B.raw(`<div class="nav"><button class="btn" data-go="conclusion">← Analysis</button><span class="msg"></span><button class="btn primary" data-go="finish">Next: Finish →</button></div></div>`);
  return B;
};
