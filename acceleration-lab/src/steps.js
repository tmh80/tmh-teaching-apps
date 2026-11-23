/* ===== the steps: predict, my times, each metre, acceleration table ===== */
const STEPS=[
  {n:'Predict',i:'🤔'},{n:'My times',i:'⏱'},{n:'Each metre',i:'🧮'},{n:'Acceleration',i:'📈'},{n:'Forces',i:'➡'},{n:'Conclusion',i:'✍'}];
function stepStatus(i){
  const all=(a)=>a.every(Boolean),any=(a)=>a.some(Boolean);let p=[];
  if(i===0)p=[S.pred.ramp,S.pred.flat];
  if(i===1)p=MS.map(k=>avgT(k)!=null);
  if(i===2)p=MS.flatMap(k=>['leg','spd','chg'].map(c=>!isNaN(num(S[c][k]))));
  if(i===3){const e=graphEval();p=[!!S.g.title,!!S.g.xl,!!S.g.yl,e.valid,e.placed===4]}
  if(i===4)p=FQ_KEYS().map(k=>!!S.fq[k]).concat(isG6()?[]:['ramp','flat'].map(s=>(S.fbd[s].arrows||[]).length>=2));
  if(i===5)p=conKeys().map(k=>String(S.con[k]||'').trim()!=='');
  return all(p)?'done':any(p)?'part':'';
}
function todoPill(i){return stepStatus(i)==='done'?'<span class="pill ok">✓ Done</span>':'<span class="pill todo">To do</span>'}
function stepTodo(i){return`<span data-live="todo:${i}">${todoPill(i)}</span>`}

/* a picture of the track: ramp (0-2 m) then flat (2-4 m) */
function trackSVG(w=760){
  const x=m=>40+m*170,y=m=>m<=2?40+(2-m)*0+m*55:150;
  const pts=[[0,40],[2,150],[4,150]].map(([m,yy])=>`${x(m)},${yy}`).join(' ');
  let marks='';for(let m=0;m<=4;m++){const yy=m<=2?40+m*55:150;marks+=`<line x1="${x(m)}" y1="${yy-14}" x2="${x(m)}" y2="${yy+14}" stroke="#14202e" stroke-width="3"/><text x="${x(m)}" y="${yy+34}" text-anchor="middle" font-size="16" font-weight="700" fill="#14202e">${m} m</text>`}
  return`<svg viewBox="0 0 ${x(4)+50} 200" style="width:100%;max-width:${w}px;display:block" role="img" aria-label="The track: a 2 metre ramp, then 2 metres of flat floor, with marks every metre">
   <polygon points="${x(0)},40 ${x(2)},150 ${x(0)},150" fill="#f3e3c3" stroke="#c9a96b"/><rect x="${x(2)}" y="150" width="${x(4)-x(2)}" height="8" fill="#cbd5e1"/>
   <polyline points="${pts}" fill="none" stroke="#14202e" stroke-width="4"/>
   <text x="${x(1)-30}" y="128" font-size="15" font-weight="800" fill="#7a5b23">RAMP</text><text x="${x(3)}" y="185" text-anchor="middle" font-size="15" font-weight="800" fill="#475569">FLAT</text>
   <g transform="translate(${x(0)+6},${28}) rotate(18)"><rect x="0" y="-22" width="44" height="20" rx="4" fill="#be123c"/><circle cx="9" cy="0" r="6" fill="#14202e"/><circle cx="35" cy="0" r="6" fill="#14202e"/></g>${marks}</svg>`;
}

/* ---------- Step 0: predict ---------- */
const PRED_OPTS=[['up','Speed up'],['same','Stay the same speed'],['down','Slow down']];
function stepPredict(){
  const q=(k,txt)=>`<h3>${txt}</h3><div class="chips">${PRED_OPTS.map(([v,l])=>`<button class="chip ${S.pred[k]===v?'sel':''}" data-act="pred" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
  return`<div class="intro">On this page you will <b>predict</b> what the cart does on the ramp and on the flat floor. There are no wrong predictions. You will check yours at the end.</div>
  <div class="panel"><h2>What will the cart do? ${stepTodo(0)}</h2>${trackSVG()}
   ${q('ramp','1. Going down the ramp (0 m to 2 m), the cart will…')}${q('flat','2. On the flat floor (2 m to 4 m), the cart will…')}
   <h3>Why do you think that? <span class="note">(optional)</span></h3><textarea data-bind="pred.why" placeholder="I think this because…">${esc(S.pred.why||'')}</textarea></div>`;
}

/* ---------- Step 1: my times ---------- */
function stepTimes(){
  const n=S.trials;
  const rows=MS.map(k=>`<tr class="${zoneOf(k)}">${k===1||k===3?`<td class="zone" rowspan="2">${k===1?'Ramp':'Flat'}</td>`:''}<td class="l">${k} m mark</td>
    ${[...Array(n)].map((_,i)=>`<td><input class="n c-t" inputmode="decimal" data-bind="T.${k}.${i}" value="${esc(S.T[k][i])}" aria-label="Time to ${k} m, trial ${i+1}"></td>`).join('')}
    <td><span class="val c-t" id="av${k}" data-live="avg:${k}"></span></td></tr>`).join('');
  return`<div class="intro">On this page you will <b>record your stopwatch times</b>. Start timing when the cart is let go. Stop when the front of the cart passes the mark.</div>
  <div class="panel"><h2>How we collect the data</h2>${trackSVG(620)}
   <div class="tip"><b>Way 1:</b> one timer. Do a new run for each mark (1 m, 2 m, 3 m, 4 m).<br><b>Way 2:</b> one timer at each mark. Everyone starts on "GO!" and stops when the cart passes <i>their</i> mark.<br>Either way, every time is measured <b>from the start</b>. Your teacher will tell you which way to use.</div>
   <p class="note">Jobs: 🙌 releaser (lets go, never pushes) · ⏱ timer(s) · 📝 recorder · 👀 checker (watches that the cart starts at 0 m every time).</p></div>
  <div class="panel"><h2>Table 1: Time from the start <button class="qm" data-help="avg" aria-label="Explain">?</button> ${stepTodo(1)}</h2>
   <div class="axrow" style="margin-bottom:8px">How many trials? ${[1,2,3,4,5].map(t=>`<button class="chip ${t===n?'sel':''}" data-act="trials" data-v="${t}">${t}</button>`).join('')}</div>
   <div class="tscroll"><table class="tb"><thead><tr><th></th><th>Distance</th>${[...Array(n)].map((_,i)=>`<th class="c-t">Trial ${i+1}<br>(s)</th>`).join('')}<th class="c-t">Average time<br>(s)</th></tr></thead><tbody>${rows}</tbody></table></div>
   <p class="note">The average is worked out for you. Type times like <b>1.42</b>.</p></div>`;
}

/* ---------- Step 2: each metre on its own (the student's maths) ---------- */
function formHint(kind,k){
  const f=v=>v==null||isNaN(v)?'?':fmt(v),c=(col,t)=>`<i style="color:${COLS[col]}">${t}</i>`;
  if(kind==='leg'){if(k===1)return isG6()?`= ${c('t',f(avgT(1)))}`:`= ${c('t','time at 1 m')}`;
    return isG6()?`= ${c('t',f(avgT(k)))} − ${c('t',f(avgT(k-1)))}`:`= ${c('t',`time at ${k} m`)} − ${c('t',`time at ${k-1} m`)}`}
  if(kind==='spd')return isG6()?`= 1 ÷ ${c('l',f(num(S.leg[k])))}`:`= 1 m ÷ ${c('l','time for metre '+k)}`;
  if(kind==='chg'){if(k===1)return isG6()?`= ${c('v',f(num(S.spd[1])))} − 0`:`= ${c('v','speed 1')} − 0 (started still)`;
    return isG6()?`= ${c('v',f(num(S.spd[k])))} − ${c('v',f(num(S.spd[k-1])))}`:`= ${c('v','speed '+k)} − ${c('v','speed '+(k-1))}`}
}
function mark(kind,k){if(!S.chk.t2)return'';const ok=cellOK(kind,k);return ok==null?'<span class="mk"></span>':ok?'<span class="mk ok">✓</span>':'<span class="mk no">✗</span>'}
function stepMetres(){
  const inp=(kind,k,col,unit)=>`<td><input class="n c-${col}" id="${kind}${k}" inputmode="decimal" data-bind="${kind}.${k}" data-src="${kind}:${k}" value="${esc(S[kind][k])}" aria-label="${kind} metre ${k}"> <span data-live="mk:${kind}:${k}">${mark(kind,k)}</span><span class="form" data-live="form:${kind}:${k}">${formHint(kind,k)}</span></td>`;
  const rows=MS.map(k=>`<tr class="${zoneOf(k)}">${k===1||k===3?`<td class="zone" rowspan="2">${k===1?'Ramp':'Flat'}</td>`:''}<td class="l">Metre ${k}<br><span class="note">${k-1} m → ${k} m</span></td>
    <td><span class="val c-t" id="av${k}" data-live="avg:${k}"></span></td>${inp('leg',k,'l')}${inp('spd',k,'v')}${inp('chg',k,'d')}</tr>`).join('');
  return`<div class="intro">On this page <b>you do the maths</b>. Each column uses numbers from the column before it, and the colours show you which ones. Tap a box to light up the numbers it needs. Press <b>?</b> for help and 🧮 for the calculator. Round to <b>2 decimal places</b>.</div>
  <div class="panel"><h2>Table 2: Each metre on its own ${stepTodo(2)}</h2>
   <div class="key"><span class="k t">Time from the start</span><span class="k l">Time for one metre</span><span class="k v">Speed</span><span class="k d">Change in speed</span></div>
   <div class="tscroll"><table class="tb"><thead><tr><th></th><th>Piece of track</th>
    <th class="c-t">Average time from the start (s)</th>
    <th class="c-l">① Time for this metre (s) <button class="qm" data-help="leg" aria-label="Explain">?</button></th>
    <th class="c-v">② Speed in this metre (m/s) <button class="qm" data-help="spd" aria-label="Explain">?</button></th>
    <th class="c-d">③ Change in speed (m/s) <button class="qm" data-help="chg" aria-label="Explain">?</button></th></tr>
    <tr><th></th><th class="note">Formula</th><th class="note">from Table 1</th><th class="note">this mark − last mark</th><th class="note">1 ÷ time</th><th class="note">this speed − speed before</th></tr></thead><tbody>${rows}</tbody></table></div>
   <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn" data-act="chk2">${S.chk.t2?'✓ Checking is on':'Check my maths'}</button><span class="note" data-live="chk2sum">${chk2Sum()}</span></div></div>`;
}
function chk2Sum(){if(!S.chk.t2)return'Green ✓ = right. Red ✗ = try that one again (press ? for help).';let r=0,w=0;MS.forEach(k=>['leg','spd','chg'].forEach(c=>{const o=cellOK(c,k);if(o===true)r++;if(o===false)w++}));return`${r} right${w?`, ${w} to fix (red ✗)`:''}. Each box is checked with <b>your own</b> numbers from the box before.`}

/* ---------- Step 3: acceleration (worked out by the app from the student's numbers) ---------- */
function accTable(){
  const rows=MS.map(k=>{const a=accel(k),g=gapT(k);return`<tr class="${zoneOf(k)}"><td class="l">${aLabel(k)}</td>
    <td><span class="val c-d ${isNaN(num(S.chg[k]))?'empty':''}">${isNaN(num(S.chg[k]))?'—':fmt(num(S.chg[k]))}</span></td>
    <td><span class="val c-l ${g==null?'empty':''}">${g==null?'—':fmt(g)}</span><span class="form">${k===1?'half of metre 1':`half of metre ${k-1} + half of metre ${k}`}</span></td>
    <td><span class="val c-a ${a==null?'empty':''}" id="acc${k}">${a==null?'—':fmt(a)}</span><br>${aTag(k)}</td></tr>`}).join('');
  return`<div class="tscroll"><table class="tb"><thead><tr><th>Change</th><th class="c-d">Change in speed (m/s)</th><th class="c-l">Time between the middles (s)</th><th class="c-a">④ Acceleration (m/s²) <button class="qm" data-help="acc" aria-label="Explain">?</button></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function stepAccel(){
  const miss=MS.filter(k=>accel(k)==null).length;
  return`<div class="intro">Now <b>we</b> do the tricky maths: the app turns your <span style="color:#fdba74">change in speed</span> into <span style="color:#fda4af">acceleration</span>. <b>Your job:</b> plot it on the graph. Look for <b>minus numbers</b>!</div>
  <div class="panel"><h2>Table 3: Acceleration <span class="note">(worked out for you)</span></h2>
   <div class="formula" style="display:inline-block">acceleration = <span style="color:${COLS.d}">change in speed</span> ÷ <span style="color:${COLS.l}">time it took to change</span></div>
   ${miss?`<div class="fb mid">${miss} acceleration${miss>1?'s are':' is'} missing. Finish Table 2 first. <button class="btn sm" data-go="2">Go to Table 2</button></div>`:''}
   <div data-live="acctable">${accTable()}</div>
   ${isG6()?'':'<p class="note">G7/8: the speed you worked out is the <b>average</b> speed for that metre, which is the speed at the middle of its time. That is why we use the time between the middles.</p>'}</div>
  <div class="panel"><h2>Your graph: acceleration ${stepTodo(3)}</h2><div id="graphhost">${graphHTML()}</div></div>
  <div class="panel"><h2>Model: speed vs time <span class="note">(made for you from your numbers)</span></h2>
   <canvas id="vcv" class="cv" style="max-width:820px" width="${GW}" height="${GH}" aria-label="Speed vs time graph made from your numbers"></canvas>
   <div class="tip">Compare the two graphs. Where the speed line goes <b>up</b>, your acceleration bars are <b>above zero</b>. Where the speed line goes <b>down</b>, the bars are <b>below zero</b>.</div></div>`;
}
