/* ===== Section introductions: pop up the first time a student opens each step ===== */
let MODAL_LOCK=false;
const INTRO={
 observe:{n:'1',t:'Observe',do:['Throw the paper plane at least <b>3 times</b>.','Change <b>one thing</b> each time (the paper, the wings, the angle…) and watch what happens.','Write down what you noticed, and one thing you <b>wonder</b> about.'],
  learn:['Every investigation starts with an <b>observation</b>: something interesting that you notice.','A good observation says what you changed and what happened.']},
 question:{n:'2',t:'Question',do:['Choose <b>one thing to change</b> and <b>one thing to measure</b>.','Write your research question.','Write your independent and dependent variables.'],
  learn:['The <b>independent variable</b> is the one thing you change on purpose.','The <b>dependent variable</b> is what you measure.','A research question looks like this: <b>How does ____ affect ____?</b>','<b>Units</b> tell us what something is measured in, like cm or seconds. Some variables have no units.']},
 hypothesis:{n:'3',t:'Hypothesis',do:['Predict what will happen in your test.','Explain <b>why</b> you think it will happen.'],
  learn:['A hypothesis uses the <b>IF, THEN, BECAUSE</b> format.','<b>IF</b> = what you change (or which group you test). <b>THEN</b> = what will happen to what you measure. <b>BECAUSE</b> = a science reason.']},
 plan:{n:'4',t:'Plan',do:['Choose your experimental groups: the values or types you will test.','Choose where you fly and how you launch.','Design your plane.','Write your control variables, materials and method.'],
  learn:['<b>Control variables</b> are the things you keep the same in every flight. That makes it a <b>fair test</b>.','You will test each value <b>3 times</b> so one odd flight does not fool you.']},
 lab:{n:'5',t:'Test flights',do:['Give your results table a title and headings <b>before</b> you fly.','Set your launch angle and throw speed, then <b>keep them the same</b>.','Launch, then read the tape (or the stopwatch).','Type each measurement into your table. Do 3 trials for each value.','Work out the averages.',()=>helped()?'<b>The thrower will make qualitative observations</b> about some flights, like “the air pushed that one further”. Click <b>📝 Add to my notes</b> to save them. Your notes will help you in your evaluation.':'<b>The thrower will notice when a flight is different.</b> Click what they say to look behind the scenes, then write your own note about that flight. Your notes will help you in your evaluation.'],
  learn:['The tape has a mark every <b>10 cm</b>. Read to the mark, then <b>estimate the last digit</b>. If the nose is just before 440 cm, you might write 437 cm.','Average = add the trials, then divide by how many there are.']},
 results:{n:'6',t:'Results',do:['Describe what each plane did, in words (Table 2).','Make your graph: choose the type, write a title and axis labels, choose your axis numbers, then plot your averages.'],
  learn:['Qualitative observations use <b>words, not numbers</b>.','The x-axis (along the bottom) shows what you changed. The y-axis (up the side) shows what you measured.','Graph title: <b>independent variable vs dependent variable</b>.']},
 conclusion:{n:'7',t:'Analysis',do:['Look at your data in <b>My report</b> (on the right).','Describe what your data shows, using <b>numbers</b> from your table.','Say if your hypothesis was supported.'],lesson:()=>analysisLesson()},
 evaluate:{n:'8',t:'Evaluation',do:['Mark an ✕ to show how <b>fair</b> your test was.','Sort the errors, then explain the <b>method errors</b>: problems with how your test was set up.','Decide how to make your test fairer and your results more <b>reliable</b>.'],lesson:()=>evaluationLesson()},
 finish:{n:'9',t:'Finish',do:['Save your report as a PDF.','Hand it in on Toddle.','Tick off your checklist to unlock your certificate.']},
 extend:{n:'★',t:'Extensions',do:['<b>Peer review:</b> compare your results with a partner who ran the same test.','<b>New investigation:</b> test a different variable at a higher challenge level.']},
 compare:{n:'★',t:'Peer review',do:['Get your partner’s averages.','Compare them with yours using the % difference.','Decide if your experiment is reliable.','Swap computers and check each other’s report.'],
  learn:['Results are <b>reliable</b> if you get similar results when the test is repeated.','A % difference of 10% or less means two results are close.']}
};
function introHTML(step){
  const it=INTRO[step];if(!it)return'';
  return`<div class="intro"><h2><span class="stepno">${it.n}</span>${it.t}</h2>
   <p style="margin:6px 0 0"><b>On this page you will:</b></p><ul>${it.do.map(x=>`<li>${typeof x==='function'?x():x}</li>`).join('')}</ul>
   ${it.lesson?it.lesson():''}
   ${it.learn&&helped()?`<div class="learn"><b class="h">Remember</b>${it.learn.map(x=>`<p style="margin:6px 0">${x}</p>`).join('')}</div>`:''}
   ${it.learn&&isMas()?`<div class="learn"><b class="h">Your notebook</b><p style="margin:6px 0">Check your notebook if you need a reminder about this step.</p></div>`:''}
   <div style="text-align:right"><button class="btn primary ok" data-act="intro-ok" data-k="${step}">Got it – I understand!</button></div></div>`;
}
function showIntro(step){if(!INTRO[step])return;MODAL_LOCK=true;$('#modalbox').innerHTML=introHTML(step);$('#modal').classList.add('open');setTimeout(()=>{const b=$('#modalbox .ok');if(b)b.focus()},50)}
function introOK(step){MODAL_LOCK=false;S.seen=S.seen||{};S.seen[step]=1;save();$('#modal').classList.remove('open');if(typeof PENDING_MSG!=='undefined'&&PENDING_MSG){const h=PENDING_MSG;PENDING_MSG=null;openModal(h)}}
function maybeIntro(){
  if(!S.started)return;S.seen=S.seen||{};
  const h=$('#main .card h2');if(h&&INTRO[S.step]&&!h.querySelector('.aboutbtn'))h.insertAdjacentHTML('beforeend',`<button class="btn sm aboutbtn" data-act="intro" style="margin-left:auto">ℹ About this step</button>`);
  if(h)h.style.display='flex',h.style.alignItems='center',h.style.gap='10px';
  if(!S.seen.tour){startTour();return}
  if(!S.seen[S.step])showIntro(S.step);
}
