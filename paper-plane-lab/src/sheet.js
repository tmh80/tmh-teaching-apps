/* ===== "My report" pop-out sheet: everything written so far, for looking back while analysing ===== */
let sheetT=null;
function setSheet(open){const s=$('#sheet');if(!s)return;s.classList.toggle('open',open);document.body.classList.toggle('sheet-open',open);$('#sheetbtn').setAttribute('aria-expanded',open);$('#sheetbtn').innerHTML=open?'📄 My report ▸':'📄 My report';if(open)sheetRefresh();if(S.step==='lab'||S.step==='observe')setTimeout(()=>{if(typeof labPanels==='function')drawSim()},300)}
function toggleSheet(){setSheet(!$('#sheet').classList.contains('open'))}
function sheetRefreshSoon(){clearTimeout(sheetT);sheetT=setTimeout(sheetRefresh,400)}
function sheetRefresh(){
  const btn=$('#sheetbtn');if(btn)btn.hidden=!S.started;
  const sh=$('#sheet');if(!sh||!sh.classList.contains('open')||!S.started)return;
  const box=(t,v)=>`<h5>${t}</h5>${String(v||'').trim()?`<div class="ans">${esc(v)}</div>`:'<div class="empty">Not written yet.</div>'}`;
  let h=box('Observations',obsText());
  if(S.iv&&S.dv){
    h+=box('Research question',rqText());
    h+=`<h5>Variables</h5><div class="ans">Independent: ${esc(ivTextA()||'—')}\nDependent: ${esc(dvTextA()||'—')}\nControls: ${esc(controlsList().map(c=>c.name+(c.how?' ('+c.how+')':'')).join('; ')||'—')}</div>`;
    h+=box('Hypothesis',hypText());
    if(live().length){h+=`<h5>Table 1</h5>`+table1HTML('static');}
    const g=S.graph;if(g&&g.type&&gValid(g)){try{const cv=document.createElement('canvas');cv.width=GW;cv.height=GH;drawGraph(cv.getContext('2d'),g,{});h+=`<h5>Graph</h5><img alt="My graph" src="${cv.toDataURL('image/png')}">`}catch(e){}}
    ['q1','q2'].forEach((n,i)=>{const t=qText(n);if(t.trim())h+=box(`Analysis ${i+1}`,t)});
    if(A('fair','')!=='')h+=box('How fair was my test?',`I rated it ${fairWord()}. `+fairText());
    ['q3','q4'].forEach((n,i)=>{const t=qText(n);if(t.trim())h+=box(`Evaluation ${i+3}`,t)});
  }
  $('#sheetbody').innerHTML=h;
}
