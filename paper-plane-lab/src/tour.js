/* ===== Guided tour: shown once after starting, replay with "How it works" ===== */
const TOUR={i:0,steps:[]};
function tourSteps(){
  const l=LV[S.level];
  return[
   {t:'Welcome to the lab! 👋',b:'Here is a quick tour so you know how everything works. It takes about one minute.'},
   {sel:'#stepbar',t:'Your path through the lab',b:'Work through these steps <b>from left to right</b>: Observe → Question → Hypothesis → Plan → Test flights → Results → Analysis → Evaluation → Finish.<br>A <b>✓</b> means a step is done. Click any step to go back to it.'},
   {sel:'#lvbadge',t:'Your challenge level',b:`You are working at the <b>${l.n}</b> level. ${esc(capText(S.level))}. Your level is now locked.`},
   {sel:'[data-act="savefile"]',t:'Saving your work',b:'Your work <b>saves by itself</b> on this computer.<br>Using a different computer next lesson? Click <b>Save progress</b> at the end of the lesson to download a file, then click <b>Open</b> next time to load it.'},
   {sel:'#sheetbtn',t:'My report',b:'Click this tab to see <b>everything you have written so far</b>: your question, hypothesis, data and graph. It opens by itself on the Analysis page. Click the tab again to close it.'},
   {sel:'.aboutbtn',t:'About this step',b:'Each step starts with a pop-up that explains what to do. Click <b>About this step</b> to see it again.'},
   {t:'Help at your level',b:helped()?`Look for the <b>Check my answer</b> buttons and the blue <b>tip boxes</b>. They help you get each part right before you move on.`:isMas()?'You will see a few <b>notebook reminders</b>. There are no answer checks, so use your science notebook to help you.':'There are <b>no hints and no answer checks</b> at the Einstein level. Show what you know!'},
   {sel:'#stepbar button[data-go="finish"]',t:'Finishing',b:'At the end, <b>save your report as a PDF</b> and hand it in on <b>Toddle</b>. Then tick your checklist to unlock your <b>certificate</b>.<br>Finished early? Try the <b>★ Extensions</b>.'},
   {t:'Ready?',b:'Let’s start by <b>observing</b> some paper planes!',last:true}
  ].filter(s=>!s.sel||$(s.sel));
}
function startTour(){TOUR.steps=tourSteps();TOUR.i=0;tourShow()}
function tourEnd(){$$('.tourhole,.tourcard,.tourshade').forEach(e=>e.remove());S.seen=S.seen||{};S.seen.tour=1;save();maybeIntro()}
function tourShow(){
  $$('.tourhole,.tourcard,.tourshade').forEach(e=>e.remove());
  const st=TOUR.steps[TOUR.i];if(!st){tourEnd();return}
  const shade=document.createElement('div');shade.className='tourshade';document.body.appendChild(shade);
  const el=st.sel?$(st.sel):null;
  const card=document.createElement('div');card.className='tourcard';card.setAttribute('role','dialog');card.setAttribute('aria-label',st.t);
  card.innerHTML=`<div class="lbl">Tour · ${TOUR.i+1} of ${TOUR.steps.length}</div><h3>${st.t}</h3><p>${st.b}</p>
    <div style="display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:10px">
     <button class="btn sm" data-act="tour-skip">Skip the tour</button>
     <span>${TOUR.i?'<button class="btn" data-act="tour-back">← Back</button> ':''}<button class="btn primary" data-act="tour-next">${st.last?'Let’s go!':'Next →'}</button></span></div>`;
  document.body.appendChild(card);
  if(el){
    el.scrollIntoView({block:'center',behavior:'instant'});
    const r=el.getBoundingClientRect(),pad=8,hole=document.createElement('div');hole.className='tourhole';
    Object.assign(hole.style,{left:(r.left-pad)+'px',top:(r.top-pad)+'px',width:(r.width+pad*2)+'px',height:(r.height+pad*2)+'px'});document.body.appendChild(hole);
    shade.style.background='transparent';
    const cw=Math.min(440,window.innerWidth-24),ch=card.offsetHeight;
    let top=r.bottom+16;if(top+ch>window.innerHeight-10)top=Math.max(10,r.top-ch-16);
    let left=Math.min(Math.max(12,r.left+r.width/2-cw/2),window.innerWidth-cw-12);
    Object.assign(card.style,{top:top+'px',left:left+'px',width:cw+'px'});
  }else{Object.assign(card.style,{top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:Math.min(480,window.innerWidth-24)+'px'})}
  setTimeout(()=>{const b=card.querySelector('[data-act="tour-next"]');if(b)b.focus()},30);
}
