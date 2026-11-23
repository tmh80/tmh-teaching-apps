/* ===== For teachers: lesson plan, notes, Toddle prompt, example data, paper worksheet ===== */
const TODDLE_PROMPT=`Create a workshop task for Grade 6–8 science called "Acceleration Lab" (Day 9, about 45 minutes).
Students roll a cart down a 2 m ramp and on along 2 m of flat floor, time it at the 1, 2, 3 and 4 m marks, and use the attached offline HTML file (Acceleration-Lab-offline.html) to work out the time for each metre, the speed in each metre (1 ÷ time) and the change in speed. The app then works out the acceleration, and students plot it on a graph with negative numbers, explain it with free body diagrams and write a conclusion.
Students hand in: the PDF worksheet the app saves (file upload).
Grade 6 focus: speeding up = positive acceleration, slowing down = negative acceleration; on the flat, gravity can no longer pull the cart forwards and friction slows it down.
Grade 7/8 focus: balanced and unbalanced forces, resultant force, and why the acceleration on the flat is negative.
Feedback format:
Good job!

Keep it up
- (2 to 4 simple positives)

Try this
- (2 to 4 actions, starting with a verb and naming the part of the worksheet)`;
function exampleData(){
  const rnd=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})(),ar=1.0,df=0.6;
  const tR=d=>Math.sqrt(2*d/ar),vb=ar*tR(2),tF=(d)=>{const u=vb;return(u-Math.sqrt(u*u-2*df*d))/df};
  const T={1:tR(1),2:tR(2),3:tR(2)+tF(1),4:tR(2)+tF(2)};
  MS.forEach(k=>{for(let i=0;i<5;i++)S.T[k][i]=(T[k]+(rnd()-.5)*0.08).toFixed(2)});
  MS.forEach(k=>{S.leg[k]=fmt(legCalc(k));S.spd[k]=fmt(r2(spdCalc(k)));S.chg[k]=fmt(r2(chgCalc(k))).replace('−','-')});
  MS.forEach(k=>S.leg[k]=S.leg[k].replace('−','-'));
  Object.assign(S.pred,{ramp:'up',flat:'same'});save();
}
function teacherNotes(){
  const m=document.createElement('div');m.className='modal';
  m.innerHTML=`<div class="box tnotes" role="dialog" aria-modal="true"><div class="navrow" style="margin:0"><h2 style="margin:0">For teachers</h2><button class="btn" id="tclose">Close ✕</button></div>
  <h3>Purpose</h3><p>Students measure how a cart speeds up on a ramp and slows down on the flat. They do the basic maths themselves (time for each metre, speed = 1 ÷ time, change in speed). The app does the harder step (acceleration) and they plot it on a graph that goes below zero. Free body diagrams link the sign of the acceleration to the forces.</p>
  <h3>45-minute plan</h3><table><tr><th>Min</th><th>What happens</th></tr><tr><td>0–5</td><td>Hook: release the cart. Students make their prediction in the app (step 1).</td></tr><tr><td>5–12</td><td>The 3 theory slides: speed, acceleration (+ and −), forces.</td></tr>
  <tr><td>12–22</td><td>Groups collect data (step 2). Way 1: one timer, a new run per mark. Way 2: a timer at every mark, all starting on "GO!" (faster). 1–5 trials can be chosen.</td></tr>
  <tr><td>22–38</td><td>Steps 3–5: tables, graph, forces.</td></tr><tr><td>38–45</td><td>Conclusion, save the PDF, exit question.</td></tr></table>
  <h3>Grades</h3><ul><li><b>Grade 6:</b> formulas show their own numbers (e.g. "= 2.54 − 2.00"), "Suggest numbers" on the graph, model free body diagrams to read, a sentence-frame conclusion.</li><li><b>Grade 7/8:</b> formulas in words, they choose the axis numbers, build both free body diagrams (checked), and write a claim, evidence and reasoning, plus why the metre 2 → 3 value is mixed.</li></ul>
  <h3>Expect this in the results</h3><ul><li>M1 → M2: positive (speeding up on the ramp). There is no "start → metre 1" value on purpose: metre 1 is the only time that depends on the stopwatch starting exactly as the cart is let go, and any start error gets magnified, so it gave silly-big accelerations.</li><li><b>M2 → M3 crosses the bottom of the ramp.</b> It compares the average speed in metre 2 (still on the ramp) with metre 3 (the flat, starting at top speed). It mixes speeding up and slowing down, so it can come out positive <i>or</i> negative. The app tags it "⇄ crosses the bottom of the ramp". It's a good discussion point.</li><li>M3 → M4: negative (friction slows the cart). If it is tiny or positive, the flat may be too smooth. Try carpet or a towel, or a lower ramp.</li><li>Hand timing has about 0.2 s reaction time, and a flat metre takes about 0.4–0.6 s. Averaging trials helps. Phone slow-motion video is an option.</li></ul>
  <h3>The science wording</h3><p>On the flat, gravity still pulls down, but the floor pushes up just as hard, so gravity can no longer pull the cart <i>forwards</i>. Friction (and air resistance) is the only force along the floor, so it is unbalanced and the acceleration is negative.</p>
  <h3>Set it up on Toddle</h3><ol><li>Create a task with Toddle's AI task helper and paste the prompt below.</li><li>Attach <b>${LAB.file}</b>.</li><li>Set the hand-in to <b>file upload</b> (the PDF worksheet), then assign.</li></ol>
  <textarea readonly id="tprompt" style="min-height:150px;font-size:13px">${esc(TODDLE_PROMPT)}</textarea><button class="btn" id="tcopy">📋 Copy the prompt</button>
  <h3>Tools</h3><div class="chips"><button class="btn" id="tblank">🖨 Blank paper worksheet</button><button class="btn" id="tex">Fill in example data (for a demo)</button>
   <button class="btn" id="tg6">View as Grade 6</button><button class="btn" id="tg78">View as Grade 7/8</button><button class="btn" id="treset">Clear all answers</button></div><p class="note" id="tmsg"></p>
  <h3>Standards (for planning)</h3><p class="note">MYP Sciences Criterion A (knowing and understanding) and C (processing and evaluating data). ACARA v9 Year 7: balanced and unbalanced forces and how they change an object's motion (AC9S7U04).</p></div>`;
  document.body.appendChild(m);const close=()=>{m.remove();render()};
  $('#tclose',m).onclick=close;m.onclick=e=>{if(e.target===m)close()};
  $('#tcopy',m).onclick=()=>{const t=$('#tprompt',m);t.select();try{navigator.clipboard.writeText(t.value)}catch(e){document.execCommand('copy')}$('#tmsg',m).textContent='Prompt copied.'};
  $('#tblank',m).onclick=()=>{m.remove();printSheet(true)};
  $('#tex',m).onclick=()=>{exampleData();$('#tmsg',m).textContent='Example data added to Tables 1 and 2.'};
  $('#tg6',m).onclick=()=>{S.grade='6';save();$('#tmsg',m).textContent='Now showing the Grade 6 version.'};
  $('#tg78',m).onclick=()=>{S.grade='78';save();$('#tmsg',m).textContent='Now showing the Grade 7/8 version.'};
  let arm=false;$('#treset',m).onclick=e=>{if(!arm){arm=true;e.target.textContent='Tap again to clear everything';return}const keep={name:S.name,cls:S.cls,grade:S.grade,gnum:S.gnum,teacher:S.teacher};S=Object.assign(blank(),keep);save();$('#tmsg',m).textContent='All answers cleared.'};
}
