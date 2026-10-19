/* ===== steps: results, compare, conclusion, finish ===== */
const avgTol=()=>S.dv==='dist'?0.6:0.015;
function avgOK(lk){const st=levelStats().find(s=>s.lk===lk);const t=gnum(A('avg.'+String(lk)));return st&&st.m!=null&&!isNaN(t)&&Math.abs(t-st.m)<=avgTol()}
function avgFb(lk){return'';const v=A('avg.'+String(lk));if(!String(v).trim())return'';return avgOK(lk)?'<b style="color:var(--good)">✓</b>':'<b style="color:var(--bad)" title="Check your adding and dividing">✗</b>'}
const fbId=k=>String(k).replace(/\W/g,'_');
function trOK(lk,i){const f=fvals(lk)[i];const t=gnum(A('tr.'+String(lk)+'.'+i));if(!f||isNaN(t))return false;return S.dv==='dist'?Math.abs(t-f.hid.trueDist)<=5:(f.hid.sw!=null?Math.abs(t-f.hid.sw)<=0.011:Math.abs(t-f.hid.trueTime)<=0.4)}
function trFb(lk,i){return'';const v=A('tr.'+String(lk)+'.'+i);if(!String(v).trim())return'';return trOK(lk,i)?'<b style="color:var(--good)">✓</b>':'<b style="color:var(--bad)" title="Check this measurement">✗</b>'}
const valTxt=v=>v==null?'':S.dv==='dist'?String(v):Number(v).toFixed(2);
const T1=()=>['Table 1: The effect of ',{k:'a',ph:'independent variable'},' on ',{k:'b',ph:'dependent variable'}];
function t1Title(){return helped()?frameText('t1',T1()):(A('t1.title')?'Table 1: '+A('t1.title'):'')}
function obsReminder(lk){
  const fs=fvals(lk),tags={};fs.forEach(f=>(f.tags||[]).forEach(t=>tags[t]=(tags[t]||0)+1));
  const notes=fs.map(f=>f.note).filter(Boolean);
  const parts=notes.map(n=>'“'+n+'”');
  return parts.length?`<div class="note">Your flight notes: ${esc(parts.join(' · '))}</div>`:'';
}
BUILD.results=function(){
  const B=newB();B.raw(`<div class="card"><h2>6. Results</h2><p class="lead">Describe what you saw, then make your graph.</p>`);
  if(!S.iv||!live().length){B.raw(`<div class="fb no">You haven’t recorded any flights yet. Go to <b>Test flights</b> and record your flights first.</div>`+`<div class="nav"><button class="btn" data-go="lab">← Test flights</button></div></div>`);return B}
  const c=cx(),st=levelStats();
  /* table 1 (made on the flight screen) */
  let h=`<p class="note" style="margin-bottom:6px">You made this table on the Test flights page. <button class="btn sm" data-go="lab">Edit it there</button></p>`+table1HTML('static');
  const t1done=!!t1Title()&&words(A('t1.ivh'))>0&&words(A('t1.dvh'))>0&&st.every(s=>String(A('avg.'+String(s.lk))).trim()!==''&&[0,1,2].every(i=>String(A('tr.'+String(s.lk)+'.'+i)).trim()!==''));
  B.q('t1','Table 1: your measurements',h,t1done);
  /* table 2 */
  let h2=tip(['developing','proficient'],'Describe what each plane did in words. <b>Do not use numbers.</b> For example: <i>It flew straight, then dipped down at the end.</i>')+
    `<p class="note">Table 2: Qualitative observations (don’t use numbers!)</p><table class="tb"><thead><tr><th class="l" style="width:24%">IV: ${esc(A('t1.ivh'))}</th><th class="l">What I saw</th></tr></thead><tbody>`+
    S.levels.map(lk=>`<tr><td class="l"><b>${esc(rowLabel(lk))}</b></td><td class="l"><input type="text" style="text-align:left" data-bind="obs.${esc(String(lk))}" value="${esc(A('obs.'+String(lk)))}">${obsReminder(lk)}</td></tr>`).join('')+`</tbody></table>`;
  B.q('t2','Table 2: what you saw',h2,S.levels.every(lk=>words(A('obs.'+String(lk)))>=1));
  B.t.graph='Your graph';B.raw(`<section class="q ${graphEval().done?'isdone':''}" data-qid="graph"><h3><span>Your graph</span>${statusPill(graphEval().done)}</h3><div id="graphhost">${graphHTML()}</div></section>`);B.f.graph=graphEval().done;
  B.raw(`<div class="nav"><button class="btn" data-go="lab">← Test flights</button><span class="msg"></span><button class="btn primary" data-go="conclusion">Next: Analysis →</button></div></div>`);
  return B;
};

/* ---------- COMPARE (peer review) ---------- */
function myCode(){
  const o={v:1,n:S.name,iv:S.iv,dv:S.dv,env:S.env,la:S.launch,d:designKeys().reduce((a,k)=>(a[k]=S.design[k],a),{}),lv:S.levels,m:levelStats().map(s=>s.m==null?null:Math.round(s.m*100)/100)};
  return'PPL-'+btoa(unescape(encodeURIComponent(JSON.stringify(o))));
}
function readCode(t){try{const s=String(t).trim().replace(/^PPL-/,'').replace(/\s+/g,'');return JSON.parse(decodeURIComponent(escape(atob(s))))}catch(e){return null}}
function codeDiffs(o){
  const d=[];if(o.iv!==S.iv)d.push(`they changed ${IVS[o.iv]?IVS[o.iv].lower:'something else'}`);if(o.dv!==S.dv)d.push(`they measured ${DVX[o.dv]?DVX[o.dv].lower:'something else'}`);
  if(o.env!==S.env)d.push(`they flew ${o.env==='outside'?'outside':'inside'}`);if(o.la!==S.launch)d.push(`they launched ${o.la==='launcher'?'with a launcher':'by hand'}`);
  Object.keys(o.d||{}).forEach(k=>{if(String(o.d[k])!==String(S.design[k])&&designKeys().includes(k))d.push(`their ${SETTING_LABEL[k].toLowerCase()} was ${settingText(k,o.d[k])}`)});
  return d;
}
function loadCode(){
  const o=readCode(S.partner.codeText||'');
  if(!o||!o.lv){S.partner.err='That code did not work. Check you copied all of it.';return}
  S.partner.err='';S.partner.code=o;if(!S.partner.name)S.partner.name=o.n||'';S.partner.avgs={};
  o.lv.forEach((lk,i)=>{if(S.levels.some(x=>String(x)===String(lk))&&o.m[i]!=null)S.partner.avgs[String(lk)]=o.m[i]});
}
function makeVirtual(){
  const seed2=(S.seed*7+13)%1000003,avgs={},trials={};let n=0;
  S.levels.forEach((lk,i)=>{const s=labSettings(lk),P0=planeParams(s,null),P=planeParams(s,foldError(seed2,i+1,P0.wob));const vs=[];
    for(let k=0;k<3;k++){n++;const r=doLaunch(seed2,n,s,P,S.env,S.launch==='launcher');const rr=mulberry32(seed2+n*31);
      vs.push(S.dv==='dist'?Math.round(r.fl.dist*10)*10:Math.round((r.fl.time+0.05+gauss(rr)*0.12)*100)/100)}
    trials[String(lk)]=vs;avgs[String(lk)]=Math.round(vs.reduce((a,b)=>a+b,0)/3*100)/100});
  S.partner={...S.partner,mode:'virtual',name:'Sam (virtual partner)',avgs,trials,code:null};
}
function cmpRows(){
  return levelStats().map(s=>{const p=gnum(S.partner.avgs[String(s.lk)]);const me=s.m;const has=!isNaN(p)&&me!=null;
    const diff=has?p-me:null,pct=has?Math.abs(diff)/((Math.abs(p)+Math.abs(me))/2||1)*100:null;return{lk:s.lk,me,p:has?p:null,diff,pct,close:has&&pct<=10}});
}
function drawCompare(c,W,H){
  const rows=cmpRows().filter(r=>r.me!=null),isNum=IVS[S.iv].type==='num';
  c.fillStyle='#fff';c.fillRect(0,0,W,H);if(!rows.length)return;
  const L=110,R=W-20,T=40,Bt=H-60,vals=rows.flatMap(r=>[r.me,r.p].filter(v=>v!=null)),mx=Math.max(...vals)*1.12||1,st=niceStep(mx,5),top=Math.ceil(mx/st)*st;
  const py=v=>Bt-v/top*(Bt-T);
  c.font='16px system-ui,sans-serif';c.textAlign='right';c.fillStyle='#14202e';
  for(let v=0;v<=top+1e-9;v+=st){c.strokeStyle='#e3e8ee';c.beginPath();c.moveTo(L,py(v));c.lineTo(R,py(v));c.stroke();c.fillText(fmt(v,2),L-8,py(v)+5)}
  c.strokeStyle='#14202e';c.lineWidth=2;c.beginPath();c.moveTo(L,T);c.lineTo(L,Bt);c.lineTo(R,Bt);c.stroke();c.lineWidth=1;
  c.textAlign='left';c.font='bold 15px system-ui,sans-serif';c.fillText(DVX[S.dv].name+' ('+dvUnitTxt()+')',8,24);
  const n=rows.length,sw=(R-L)/n;
  rows.forEach((r,i)=>{const x=L+sw*(i+.5),bw=sw*.3;
    c.fillStyle='#1b7ea6';c.fillRect(x-bw-2,py(r.me),bw,Bt-py(r.me));
    if(r.p!=null){c.fillStyle='#c2700c';c.fillRect(x+2,py(r.p),bw,Bt-py(r.p))}
    c.fillStyle='#14202e';c.textAlign='center';c.font='15px system-ui,sans-serif';c.fillText(lvlLabel(S.iv,r.lk),x,Bt+22)});
  c.font='bold 15px system-ui,sans-serif';c.textAlign='left';c.fillStyle='#1b7ea6';c.fillRect(W-300,10,14,14);c.fillStyle='#14202e';c.fillText('Me',W-280,22);
  c.fillStyle='#c2700c';c.fillRect(W-230,10,14,14);c.fillStyle='#14202e';c.fillText((S.partner.name||'Partner').slice(0,22),W-210,22);
}
const RELF=()=>['My results were ',{k:'a',ph:'similar to / different from'},' my partner’s results.\nThe biggest difference was at ',{k:'b',ph:'which value or type'},', where my average was ',{k:'c',w:'',ph:'number + unit'},' and my partner’s average was ',{k:'d',w:'',ph:'number + unit'},'.\nThis might be because ',{k:'e',w:'w3'},'.\nSo I think our experiment is ',{k:'f',ph:'reliable / not very reliable'},', because ',{k:'g',w:'w3'},'.'];
function relText(){return isDev()?frameText('rel',RELF()):A('rel')}
const PEER=[['rq','The research question names both variables.'],['hyp','The hypothesis uses IF, THEN and BECAUSE.'],['ctl','There are three control variables, and each says how it is controlled.'],['met','I could repeat the test by following the method.'],['tbl','The results table has a title, units and averages.'],['gr','The graph has a title, axis labels with units and all the data.']];
BUILD.compare=function(){
  const B=newB();B.raw(`<div class="card"><h2>★ Extension: peer review with a partner</h2><p class="lead">Scientists do not trust one set of results on its own. They check that another scientist doing the <b>same experiment</b> gets <b>similar results</b>. If they do, the experiment is <b>reliable</b>.</p>
   <div class="panel" style="margin-bottom:10px"><h4>What you will do</h4><ol style="margin:4px 0;padding-left:20px"><li>Get your partner’s averages (they ran exactly the same test as you).</li><li>The lab puts your averages side by side and works out the <b>% difference</b> for each one.</li><li>Decide whether your experiment is reliable, and explain why your results might be different.</li><li>Swap computers and check each other’s report.</li></ol>
   <p class="note" style="margin-top:6px"><b>Example:</b> you got 600 cm and your partner got 620 cm. The difference is 20 cm, which is about 3%. That is close, so that result is reliable. If you got 600 cm and they got 800 cm (29%), the result is not reliable, and you would look for what was different.</p></div>`);
  if(!live().length){B.raw(`<div class="fb no">You haven’t recorded any flights yet. Go to <b>Test flights</b> and record your flights first.</div><div class="nav"><button class="btn" data-go="lab">← Test flights</button></div></div>`);return B}
  const P=S.partner,mode=P.mode;
  let h=`<div class="grid2"><div><span class="lbl">My results code (give this to your partner)</span><textarea readonly rows="3" style="font-family:var(--font-num);font-size:12px" id="mycode">${esc(myCode())}</textarea><button class="btn sm" data-act="pcopy">Copy my code</button> <span class="note" id="copymsg"></span></div>
    <div><span class="lbl">My partner’s name</span><input type="text" data-bind="p.name" value="${esc(P.name)}" ${mode==='virtual'?'disabled':''}></div></div>
    <p style="margin:10px 0 4px"><b>How will you get your partner’s results?</b></p><div class="cards">
     <button class="ivbtn ${mode==='typed'?'sel':''}" data-act="pmode" data-k="typed"><b>Type them in</b><span>Your partner reads you their averages.</span></button>
     <button class="ivbtn ${mode==='code'?'sel':''}" data-act="pmode" data-k="code"><b>Paste their results code</b><span>Your partner sends you their code.</span></button>
     <button class="ivbtn ${mode==='virtual'?'sel':''}" data-act="pmode" data-k="virtual"><b>No partner today</b><span>Compare with Sam, a virtual partner who ran the same test.</span></button></div>`;
  if(mode==='typed'){
    h+=`<table class="tb" style="max-width:560px"><thead><tr><th class="l">What I changed</th><th>My partner’s average (${esc(dvUnitTxt())})</th></tr></thead><tbody>${S.levels.map(lk=>`<tr><td class="l">${esc(lvlLabel(S.iv,lk))}</td><td><input type="text" inputmode="decimal" data-bind="p.avg.${esc(String(lk))}" value="${esc(P.avgs[String(lk)]==null?'':P.avgs[String(lk)])}"></td></tr>`).join('')}</tbody></table>
     <p style="margin:10px 0 4px"><b>Did your partner use exactly the same plane design and set-up as you?</b></p><div class="chips">${['Yes','No','Not sure'].map(x=>`<button class="chip ${P.same===x?'sel':''}" data-act="psame" data-k="${x}">${x}</button>`).join('')}</div>`;
  }else if(mode==='code'){
    h+=`<span class="lbl">Paste your partner’s code</span><textarea data-bind="p.code" rows="3" style="font-family:var(--font-num);font-size:12px">${esc(P.codeText||'')}</textarea><button class="btn sm" data-act="pload">Load their results</button>${P.err?`<div class="fb no">${esc(P.err)}</div>`:''}`;
    if(P.code){const d=codeDiffs(P.code);h+=d.length?`<div class="fb mid"><b>Not quite the same experiment:</b> ${esc(d.join('; '))}. Keep this in mind when you compare.</div>`:'<div class="fb ok">Your partner ran exactly the same experiment as you.</div>'}
  }else if(mode==='virtual'){h+=`<div class="fb ok">Sam ran the same test as you, with the same plane design and set-up, on a different day.</div>`}
  const rows=cmpRows(),have=rows.filter(r=>r.p!=null);
  B.q('partner','Your partner’s results',h,have.length>=2);
  if(have.length){
    let t=`<table class="tb"><thead><tr><th class="l">What I changed</th><th>My average</th><th>${esc(P.name||'Partner')}’s average</th><th>Difference</th><th>% difference</th></tr></thead><tbody>`+
      rows.map(r=>`<tr><td class="l">${esc(lvlLabel(S.iv,r.lk))}</td><td>${r.me==null?'–':esc(fmt(r.me,dvDp()))}</td><td>${r.p==null?'–':esc(fmt(r.p,dvDp()))}</td><td>${r.diff==null?'–':esc(fmt(Math.abs(r.diff),dvDp()))}</td><td>${r.pct==null?'–':esc(fmt(r.pct,0))+'%'}</td></tr>`).join('')+`</tbody></table>
      <p class="note">% difference = the difference ÷ the average of the two results × 100. ${helped()?'10% or less means the two results are close.':''}</p>
      <canvas id="cmpcv" class="cv" width="1000" height="380" style="background:#fff;margin-top:8px" aria-label="My results and my partner's results side by side"></canvas>`;
    B.q('cmp','Compare the results',t,true);
    let w;
    if(isDev()){w=tip(['developing'],'Look at the % difference column to find the biggest difference. Then think about what was different between your test and your partner’s test.')+frame('rel',RELF())+
      chkBtn('rel',()=>[{ok:usesData(relText())>=2,msg:'You used numbers from the table.',fix:'Copy the two averages for your biggest difference from the table.'},{ok:/reliab/i.test(A('rel.f')),msg:'You said how reliable the experiment is.',fix:'Write "reliable" or "not very reliable" in the gap.'},{ok:words(A('rel.e'))>=4&&words(A('rel.g'))>=4,msg:'You gave reasons.',fix:'Give a reason in each "because" gap.'}]);}
    else{w=tip(['proficient'],'Sentence starters: <i>My results were similar to / different from… · The biggest difference was at… · This might be because… · I think our experiment is reliable / not very reliable because…</i>')+
      nudge(['mastering'],'Check your notebook for what “reliable” means.')+`<p style="margin:4px 0"><b>How reliable is your experiment? Compare your results with your partner’s. Use data.</b></p>`+ta('rel','',5)+
      chkBtn('rel',()=>[{ok:usesData(A('rel'))>=2,msg:'You used numbers from the table.'},{ok:/reliab/i.test(A('rel')),msg:'You said how reliable the experiment is.'},{ok:/because|might|could|due to/i.test(A('rel')),msg:'You gave a reason for the differences.'}])}
    B.q('rel','Is the experiment reliable?',w,isDev()?frameDone('rel',RELF()):words(A('rel'))>=1);
  }
  /* peer check */
  const pe=S.peer;
  const ph=`<div class="tip" style="margin-top:0"><b>Swap computers.</b> Your partner fills this in about <b>your</b> report, then you swap back.${mode==='virtual'?' (No partner today? Ask someone near you.)':''}</div>
    <span class="lbl">Checked by</span><input type="text" data-bind="peer.name" value="${esc(pe.name||'')}" style="max-width:320px">
    <div class="checklist" style="margin-top:8px">${PEER.map(([k,t])=>`<label><input type="checkbox" data-peerck="${k}" ${pe['ck.'+k]?'checked':''}><span>${t}</span></label>`).join('')}</div>
    <div class="grid2" style="margin-top:8px"><div><span class="lbl">One thing done well</span>${`<textarea data-bind="peer.well" rows="2">${esc(pe.well||'')}</textarea>`}</div><div><span class="lbl">One thing to improve</span><textarea data-bind="peer.better" rows="2">${esc(pe.better||'')}</textarea></div></div>`;
  B.q('peer','Peer check (your partner fills this in)',ph,words(pe.name)>=1&&words(pe.well)>=1&&words(pe.better)>=1);
  B.raw(`<div class="fb mid" style="margin-top:12px">When you have finished, go back to <b>Finish</b> and save your report PDF again. The peer review will be added to it.</div><div class="nav"><button class="btn" data-go="extend">← Extensions</button><span class="msg"></span><button class="btn primary" data-go="finish">Go to Finish →</button></div></div>`);
  return B;
};

/* ---------- CONCLUSION ---------- */
const QF={
 q1:()=>IVS[S.iv].type==='num'?['My graph shows a ',{help:'trend'},{k:'a',w:'',ph:'positive / negative / no'},' trend.\nAs the ',{k:'b',ph:'independent variable'},' increased from ',{k:'c',w:'',ph:'first value'},' to ',{k:'d',w:'',ph:'last value'},',\nthe average ',{k:'f',ph:'dependent variable'},' changed from ',{k:'g',w:'',ph:'number + unit'},' to ',{k:'h',w:'',ph:'number + unit'},'.']
   :[{help:'trend'},'The ',{k:'a',ph:'which group'},' had the greatest average (',{k:'b',w:'',ph:'number + unit'},').\nThe ',{k:'c',ph:'which group'},' had the smallest average (',{k:'d',w:'',ph:'number + unit'},').\nThe difference between them was ',{k:'e',w:'',ph:'bigger − smaller'},'.\nThis shows that ',{k:'f',w:'w3'},'.'],
 q2:()=>['My hypothesis was ',{k:'a',ph:'supported / not supported / partly supported'},'.\nI predicted that ',{k:'b',w:'w3'},'.\nMy data shows that ',{k:'c',w:'w3'},'.'],
 q4:()=>['To fix my first method error, I would ',{k:'a',w:'w3'},'.\nThis would make my test fairer or my results more reliable because ',{k:'b',w:'w3'},'.\nTo fix my second method error, I would ',{k:'c',w:'w3'},'.\nThis would help because ',{k:'d',w:'w3'},'.']
};
const QTXT={q1:'What did you discover? Use your data.',q2:'Was your hypothesis supported by your results? Explain with your data.',q3:'Which method errors affected your results? Explain how each one changed your results. (Explain at least 2!)',q4:'How would you fix these method errors?'};
const QSTEM={q1:()=>IVS[S.iv].type==='num'?'My graph shows a positive / negative / no trend… · As the … increased from … to …, the … changed from … to …':'The … had the greatest average (…) · The … had the smallest (…) · The difference between them was…',q2:()=>'My hypothesis was supported / not supported / partly supported… · I predicted that… · My data shows that…',q3:()=>'One method error was… · This affected my results because…',q4:()=>'To fix my first method error, I would… · This would make my test fairer / my results more reliable because…'};
/* Q3 at Developing and Proficient: pick method errors from the sorted cards, then explain each one */
function q3Picks(){const p=A('q3.pick',[]);return Array.isArray(p)?p:[]}
function q3Chosen(){const cards=sortCards();return q3Picks().map(id=>cards.find(c=>c.id===id)).filter(Boolean)}
function q3HelpedText(){return q3Chosen().map((cd,i)=>`Method error ${i+1}: ${cd.t} This affected my results because ${A('q3.w'+cd.id).trim()||'___'}.`).join('\n')}
function q3HelpedDone(){const ch=q3Chosen();return ch.length>=1&&ch.every(cd=>words(A('q3.w'+cd.id))>=1)}
function qText(n){if(n==='q3'&&helped())return q3HelpedText();return isDev()?frameText(n,QF[n]()):A(n)}
function flawsIn(t){return Object.keys(FLAWS).filter(k=>FLAWS[k].kw.test(t||''))}
function revealHTML(){
  const L=S.flights.filter(f=>f.hid),rec=live();
  const tm=rec.filter(f=>f.timed!=null&&f.hid.trueTime!=null);
  const dev=isDev();
  let h=`<div class="reveal"><h3>🔍 Behind the scenes</h3><p class="note">The lab secretly recorded what really happened in each flight. Use it to evaluate your method.</p>`;
  const RD='background:#fbd9d3;color:#8f1d10;font-weight:700';const rc=(on,v)=>`<td style="${on?RD:''}">${v}</td>`;
  h+=`<div style="overflow:auto"><table class="tb"><thead><tr><th>Flight</th><th>${esc(IVS[S.iv].type==='num'?'Value':'Type')}</th><th>Your reading (cm)</th><th>Real distance (cm)</th><th>Your time (s)</th><th>Real time (s)</th><th>Angle (set → real)</th><th>Throw speed, m/s (set → real)</th><th>${S.env==='outside'?'Wind':'Air movement'} (m/s)</th><th>Fold (extra lift)</th><th>Mass (g)</th>${S.launch==='launcher'?'<th>Launch power</th>':''}<th>Odd flight?</th><th class="l">My note</th></tr></thead><tbody>`+
    L.map(f=>{const h0=f.hid,g=flightSig(h0,f.lv),rd=f.read!=null&&Math.abs(f.read-h0.trueDist)>5,tm=S.dv==='time'&&f.timed!=null&&Math.abs(f.timed-h0.trueTime)>0.25;
      return`<tr style="${f.gone?'opacity:.55':''}"><td>${f.n}${f.gone?' (not used)':''}</td><td>${esc(lvlLabel(S.iv,f.lv))}</td>${rc(rd,f.read!=null?f.read:'–')}<td>${h0.trueDist}</td>${rc(tm,f.timed!=null?Number(f.timed).toFixed(2):'–')}<td>${h0.trueTime.toFixed(2)}</td>${rc(g.angle||g.ctl,`${h0.aSet}° → ${h0.aAct}°`)}${rc(g.speed||g.ctl,`${h0.vSet} → ${h0.vAct}`)}${rc(g.wind,(h0.wind>0?'+':'')+h0.wind.toFixed(2))}${rc(g.fold,h0.foldCL!=null?(h0.foldCL>0?'+':'')+fmt(h0.foldCL,1)+'%':'')}${rc(g.mass,h0.mass!=null?fmt(h0.mass,1):'')}${S.launch==='launcher'?rc(g.band,Math.round((h0.power||1)*100)+'%'):''}${rc(g.dive,h0.dive?'nosedive':'')}<td class="l">${esc(f.note||'')}</td></tr>`}).join('')+`</tbody></table></div>
    <p class="note"><b style="color:#b3301e">Red</b> = this had a big effect on the flight (or your reading was more than 5 cm out). Air movement: + pushed the plane towards the far end, – pushed against it. Fold: + means the plane got a little more lift than a perfect copy.${MASS_NOTE()}</p>`;

  if(dev){
    const ex=flawsHere().map(k=>`<li><b>${FLAWS[k].name}.</b> ${FLAWS[k].why}</li>`).join('');
    h+=`<p style="margin:8px 0 2px"><b>What this means</b></p><ul style="margin:0;padding-left:20px">${ex}</ul>`;
    if(tm.length){const e=tm.map(f=>Math.abs(f.timed-f.hid.trueTime));h+=`<p class="note">Your stopwatch was off by ${fmt(Math.min(...e),2)} s to ${fmt(Math.max(...e),2)} s.</p>`}
  }
  return h+`</div>`;
}
function addQ(B,n,i){
  const c=cx();let body=`<p style="margin:4px 0"><b>${i+1}. ${QTXT[n]}</b></p>`,done;
  if(isDev()){
    if(n==='q3'){q3Helped(B,i);return}
    const extra={q1:c.isNum?'Look at your graph. Is the trend positive, negative or is there no trend? Then copy numbers from Table 1.':'Look at your bar graph. Which group was highest and which was lowest? Work out the difference: bigger − smaller.',q2:'Look back at your hypothesis: '+(hypText()?'“'+esc(hypText())+'”':'(you have not written it yet)')+'.',q4:'Use the improvements you sorted above. Write one fix for each method error you explained in Question 3, and say how it makes the test <b>fairer</b> or the results more <b>reliable</b>.'}[n];
    body+=tip(['developing'],extra)+frame(n,QF[n]())+chkBtn(n,()=>{
      const t=qText(n);
      if(n==='q1')return c.isNum?[{ok:/positive|negative|no trend/i.test(A('q1.a')),msg:'You named the trend.',fix:'Write positive, negative or no in the first gap.'},{ok:usesData(t)>=2,msg:'You used numbers from your results.',fix:'Copy the first and last averages from Table 1, with units.'}]
        :[{ok:usesData(t)>=2,msg:'You used numbers from your results.',fix:'Copy the highest and lowest averages from Table 1, with units.'},{ok:words(A('q1.e'))>=1&&/\d/.test(A('q1.e')),msg:'You worked out the difference.',fix:'Work out the difference: the bigger average − the smaller average.'}];
      if(n==='q2')return[{ok:/support/i.test(A('q2.a')),msg:'You said if your hypothesis was supported.',fix:'Write supported, not supported or partly supported.'},{ok:usesData(t)>=1,msg:'You used data.',fix:'Add a number from your results in the last gap.'}];
      return[{ok:words(A('q4.a'))>=3&&words(A('q4.c'))>=3,msg:'You gave two improvements.',fix:'Write two improvements.'},{ok:/fair|reliab|same|similar/i.test(A('q4.b')+' '+A('q4.d')),msg:'You explained how they make the test fairer or more reliable.',fix:'Use the words fair or reliable in your “because” sentences.'}]});
    done=frameDone(n,QF[n]());
  }else{
    if(n==='q3'&&isPro()){q3Helped(B,i);return}
    const mh={q1:c.isNum?'Think about: is the trend positive, negative or is there no trend? Use numbers from your data.':'Think about: which group was highest and lowest, and the difference between them. Use numbers from your data.',q2:'Check your notebook for how to explain a conclusion using data.',q3:'Think about: problems with how the test was set up (method errors), not slips you made. How did each one change your results?',q4:'Think about: how would each change make your test fairer or your results more reliable?'}[n];
    body+=tip(['proficient'],(n==='q1'?helpBtn('trend')+' ':'')+'Sentence starters: <i>'+QSTEM[n]()+'</i>')+nudge(['mastering'],(n==='q1'?helpBtn('trend')+' ':'')+mh)+ta(n,'',n==='q3'||n==='q4'?6:4)+
     chkBtn(n,()=>{const t=A(n);if(n==='q1')return c.isNum?[{ok:/positive|negative|no trend/i.test(t),msg:'You named the trend.'},{ok:usesData(t)>=2,msg:'You used at least two numbers from your results.'}]:[{ok:/difference|more than|less than|further|longer|higher|lower/i.test(t),msg:'You compared the groups.'},{ok:usesData(t)>=2,msg:'You used at least two numbers from your results.'}];
       if(n==='q2')return[{ok:/support/i.test(t),msg:'You said if your hypothesis was supported.'},{ok:usesData(t)>=1,msg:'You used data.'}];
       return[{ok:words(t)>=15,msg:'You described how to improve the method.'},{ok:/fair|reliab/i.test(t),msg:'You explained how it makes the test fairer or more reliable.'}]});
    done=words(A(n))>=1;
  }
  B.q(n,`Question ${i+1}`,body,done);
}
BUILD.conclusion=function(){
  const B=newB();B.raw(`<div class="card"><h2>7. Analysis</h2><p class="lead">Analyse your data: describe what it shows, using numbers, and decide if your hypothesis was supported.</p>
   <div class="tip">📄 Look at <b>My report</b> on the right to see your data: Table 1 (with your averages) and your graph. Click the <b>My report</b> tab to close or open it.</div>`);
  if(!live().length){B.raw(`<div class="fb no">You haven’t recorded any flights yet. Go to <b>Test flights</b> and record your flights first.</div><div class="nav"><button class="btn" data-go="lab">← Test flights</button></div></div>`);return B}
  ['q1','q2'].forEach((n,i)=>addQ(B,n,i));
  B.raw(`<div class="nav"><button class="btn" data-go="results">← Results</button><span class="msg"></span><button class="btn primary" data-go="evaluate">Next: Evaluation →</button></div></div>`);
  return B;
};

/* ---------- FINISH ---------- */
function flagsOf(step){const b=BUILD[step]();return Object.values(b.f)}
function allDone(step){const f=flagsOf(step);return f.length>0&&f.every(Boolean)}
function finishItems(){
  return[
   ['o','I wrote my observations.','observe',()=>allDone('observe')],
   ['q','My research question and both variables are written.','question',()=>allDone('question')],
   ['h','My hypothesis uses IF, THEN and BECAUSE.','hypothesis',()=>allDone('hypothesis')],
   ['p','My plan has values to test, a set-up, three control variables, materials and a method.','plan',()=>allDone('plan')],
   ['l','I tested every value three times and recorded it in my table.','lab',()=>trialsDone()],
   ['r','My results tables are finished, with averages.','results',()=>{const b=BUILD.results().f;return b.t1&&b.t2}],
   ['g','My graph has a title, axis labels and all my data.','results',()=>graphEval().done],
   ['e','I answered my analysis questions.','conclusion',()=>allDone('conclusion')],
   ['v','I evaluated my test: fairness, errors and improvements.','evaluate',()=>allDone('evaluate')],
   ['s1','I checked my spelling and my units.',null,()=>true],
   ['s2','Everything in this report is my own work.',null,()=>true],
   ['s3','I saved my lab report and my feedback sheet, and handed both in on Toddle.',null,()=>S.exported&&S.exportedFb]
  ];
}
const certReady=()=>finishItems().every(([k,,,ok])=>S.ck[k]&&ok());
BUILD.finish=function(){
  const B=newB(),items=finishItems();
  B.raw(`<div class="card"><h2>9. Finish</h2><p class="lead">Save your report as a PDF and hand it in on Toddle. Then tick off the checklist to earn your certificate.</p>
   <div class="panel" style="margin-bottom:12px"><h4>1. Save two PDFs and hand both in on Toddle</h4><p class="note" style="margin-bottom:8px">Your <b>lab report</b> is your own work. Your <b>feedback sheet</b> shows what the lab checked and what to look at again. Both show your challenge level (<b>${esc(LV[S.level].n)}</b>). You can save them again after making changes.</p>
   <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary big" data-act="pdf">⬇ 1. Save my lab report</button><button class="btn primary big" data-act="pdffb">⬇ 2. Save my feedback sheet</button></div>
   <p style="margin:8px 0 0">${S.exported?'<span class="status ok">✓ Lab report saved</span>':'<span class="status no">Lab report not saved yet</span>'} ${S.exportedFb?'<span class="status ok">✓ Feedback sheet saved</span>':'<span class="status no">Feedback sheet not saved yet</span>'}</p><span class="note" id="pdfmsg"></span></div>
   <div class="panel"><h4>2. Checklist</h4><p class="note">You can tick an item once the lab can see that part is finished.</p><div class="checklist">`+
   items.map(([k,t,step,ok])=>{const can=ok();return`<label class="${can?'':'off'}"><input type="checkbox" data-ck="${k}" ${S.ck[k]&&can?'checked':''} ${can?'':'disabled'}><span>${t}</span>${!can&&step?`<button class="btn sm auto" data-act="gofix" data-k="${step}">Go and finish it</button>`:!can?'<span class="auto note">Save both PDFs first</span>':''}</label>`}).join('')+`</div></div>`);
  const ready=certReady();
  B.raw(`<div class="panel" style="margin-top:12px"><h4>3. Your certificate</h4>${ready?certHTML()+`<div style="margin-top:10px"><button class="btn good big" data-act="cert">⬇ Save my certificate (PDF)</button></div>`:`<p class="note">Tick every item on the checklist to unlock your certificate.</p>`}</div>
   <div class="panel" style="margin-top:12px;border-color:var(--accent)"><h4>Finished early?</h4><p class="note" style="margin-bottom:8px">Try an extension: peer review your experiment with a partner, or run a new investigation at a higher challenge level.</p><button class="btn primary" data-go="extend">★ See the extensions</button></div>
   <div class="nav"><button class="btn" data-go="evaluate">← Evaluation</button><span class="msg"></span></div></div>`);
  B.f.done=ready;return B;
};
function certHTML(){const l=LV[S.level];return`<div class="cert" style="--lv:${l.col}"><div class="lbl">Certificate of completion</div><h2>Paper Plane Lab</h2><p>This certifies that</p><div class="nm">${esc(S.name)}</div><p>completed a full scientific investigation at the</p><p style="font-size:24px;font-weight:800;color:${l.col};margin:4px 0">${'★'.repeat(l.stars)} ${esc(l.n)} level ${'★'.repeat(l.stars)}</p><p class="note">${esc(S.cls)} · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p></div>`}

/* ---------- EXTENSIONS ---------- */
function compareStarted(){return !!(S.partner&&(S.partner.mode||Object.keys(S.partner.avgs||{}).length))||!!(S.peer&&S.peer.name)}
BUILD.extend=function(){
  const B=newB(),idx=LV[S.level].idx,higher=LVI.filter(k=>LV[k].idx>idx),opts=higher.length?higher:['einstein'];
  const used=[S.iv].concat((S.archive||[]).map(a=>a.iv)).filter(Boolean);
  const pick=S.a['x.level']&&opts.includes(S.a['x.level'])?S.a['x.level']:'';
  const cmpDone=(()=>{try{const f=BUILD.compare().f;return f.partner&&f.rel}catch(e){return false}})();
  B.raw(`<div class="card"><h2>★ Extensions</h2><p class="lead">Finished your report? Choose an extension. ${S.exported?'':'<b>Save your report PDF on the Finish page first.</b>'}</p>
   <div class="typecards">
    <div class="typecard" style="cursor:default"><h3>1. Peer review with a partner</h3><p class="note">Compare your results with a partner who ran the same experiment, decide how reliable it is, and check each other's reports.</p>
      <p style="margin:8px 0">${cmpDone?'<span class="status ok">✓ Started</span>':''}</p><button class="btn primary" data-go="compare">Start the peer review →</button></div>
    <div class="typecard" style="cursor:default"><h3>2. A new investigation</h3><p class="note">Run a new test with a <b>different independent variable</b> at a <b>${higher.length?'higher':'the same'} challenge level</b>. Your first report is kept and you can still download it.</p>
      <p style="margin:8px 0 4px"><b>Choose your new level</b></p><div class="chips">${opts.map(k=>`<button class="chip ${pick===k?'sel':''}" data-act="x-level" data-k="${k}" style="${pick===k?`background:${LV[k].col};border-color:${LV[k].col}`:''}">${'★'.repeat(LV[k].stars)} ${LV[k].n}</button>`).join('')}</div>
      ${pick?`<p class="note" style="margin-top:6px">${esc(capText(pick))}. You will not be able to change this level once you start.</p>`:''}
      <p class="note" style="margin-top:6px">You will choose your new variable on the Question page. You cannot choose ${esc(used.map(k=>IVS[k].lower).join(' or '))} again.</p>
      <button class="btn primary" data-act="x-start" style="margin-top:8px" ${pick&&S.exported?'':'disabled'}>Start my new investigation →</button>
      ${!S.exported?'<p class="note" style="margin-top:4px">Save your report PDF first (on the Finish page).</p>':''}</div>
   </div>`);
  if((S.archive||[]).length){B.raw(`<div class="panel" style="margin-top:12px"><h4>My earlier investigations</h4>${S.archive.map((a,i)=>`<div style="display:flex;gap:10px;align-items:center;margin:4px 0"><span>Investigation ${i+1}: ${esc(IVS[a.iv]?IVS[a.iv].label:'?')} (${esc(LV[a.level].n)})</span><button class="btn sm" data-act="x-oldpdf" data-i="${i}">⬇ Download that report</button></div>`).join('')}</div>`)}
  B.raw(`<div class="nav"><button class="btn" data-go="finish">← Finish</button><span class="msg"></span></div></div>`);
  return B;
};
function startNewInvestigation(level){
  const old=JSON.parse(JSON.stringify(S));old.archive=[];
  const keep={name:S.name,cls:S.cls,archive:(S.archive||[]).concat([old]),obs:{},exp:S.exp,expN:S.expN};
  keep.obs.obs=obsText();
  S=blank();S.name=keep.name;S.cls=keep.cls;S.level=level;S.archive=keep.archive;S.attempt=S.archive.length+1;S.started=true;
  S.seed=(Date.now()%90000)+13;S.a=Object.assign({},keep.obs);S.exp=keep.exp;S.expN=keep.expN;S.seen=Object.assign({},old.seen||{});S.step='question';S.date=new Date().toISOString();
  save();render();window.scrollTo(0,0);
}
function exportArchived(i){const cur=S;try{S=Object.assign(blank(),cur.archive[i]);const pages=buildReport(),blob=pdfFromCanvases(pages,'Paper Plane Lab report - '+S.name);download(`PaperPlaneLab_${safeName()}_investigation${i+1}_${LV[S.level].n}.pdf`,blob)}finally{S=cur}}

function q3Helped(B,i){
  const cards=sortCards(),mine=cards.filter(cd=>A('sort.'+cd.id)==='method'),picks=q3Picks();
  let body=`<p style="margin:4px 0"><b>${i+1}. ${QTXT.q3}</b></p>`+
    tip(['developing','proficient'],`Choose <b>at least two method errors</b> from your sorting, then explain how each one changed your results. Leave out human errors (slips like pressing the stopwatch late): you can fix those just by being more careful.`);
  body+=mine.length?`<span class="lbl">My method errors (click to choose)</span><div class="chips" style="flex-direction:column;align-items:stretch">${mine.map(cd=>`<button class="chip ${picks.includes(cd.id)?'sel':''}" style="text-align:left;border-radius:10px" data-act="q3pick" data-id="${cd.id}">${picks.includes(cd.id)?'✓ ':''}${esc(cd.t)}</button>`).join('')}</div>`
    :`<div class="fb mid">Sort your cards above first. Put the method errors in the <b>Method error</b> group, then choose them here.</div>`;
  q3Chosen().forEach((cd,j)=>{body+=`<div class="panel" style="margin-top:8px"><b>Method error ${j+1}:</b> ${esc(cd.t)}<div class="frame bl">This affected my results because ${inp('q3.w'+cd.id,'w3',isDev()?'how did it change your measurements?':'')}.</div></div>`});
  body+=chkBtn('q3',()=>{const ch=q3Chosen();return[{ok:ch.length>=2,msg:'You chose at least two method errors.',fix:'Click at least two of your method errors.'},{ok:ch.length>0&&ch.every(cd=>words(A('q3.w'+cd.id))>=4),msg:'You explained how each error changed your results.',fix:'Finish every “because” sentence. Say if it made the plane go further, shorter or different each time.'}]});
  B.q('q3',`Question ${i+1}`,body,q3HelpedDone());
}
