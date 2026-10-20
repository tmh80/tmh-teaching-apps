/* ===== TODDLE SET-UP (every virtual lab has this) =====
   Change LAB_INFO for each lab. grade 6 -> MYP Year 1 criteria and bands only; grade 7/8 -> MYP Year 3 criteria and 1-8 levels. */
const LAB_INFO={title:'Paper Plane Lab',grade:'6',file:'Paper-Plane-Lab-offline.html',lessons:2,
  topic:'a fair test with virtual paper planes, choosing one thing to change about the plane or how it is thrown and measuring how far it flies or how long it stays in the air'};
const MYP_CRIT={
  1:{B:['Outline an appropriate problem or research question to be tested by a scientific investigation','Outline a testable prediction using scientific reasoning','Outline how to manipulate the variables, and outline how data will be collected','Design scientific investigations'],
     C:['Present collected and transformed data','Interpret data and outline results using scientific reasoning','Discuss the validity of a prediction based on the outcome of the scientific investigation','Discuss the validity of the method','Describe improvements or extensions to the method']},
  3:{B:['Describe a problem or question to be tested by a scientific investigation','Outline a testable hypothesis and explain it using scientific reasoning','Describe how to manipulate the variables, and describe how sufficient, relevant data will be collected','Design scientific investigations'],
     C:['Present collected and transformed data','Interpret data and describe results using scientific reasoning','Discuss the validity of a hypothesis based on the outcome of the scientific investigation','Discuss the validity of the method','Describe improvements or extensions to the method']}};
function toddlePrompt(){
  const g6=LAB_INFO.grade==='6',yr=g6?1:3,C=MYP_CRIT[yr],rn=['i','ii','iii','iv','v'];
  const caps=g6?['Developing: highest band Developing','Proficient: highest band Proficient','Mastering: highest band Mastering','Einstein (extra challenge): highest band Mastering']
               :['Developing: levels 3–4 at most','Proficient: levels 5–6 at most','Mastering: levels 7–8 at most','Einstein (extra challenge): level 8 at most'];
  return`Create a formative assessment for my Grade ${LAB_INFO.grade} MYP Sciences class.

TASK
Title: ${LAB_INFO.title}: virtual lab report
What students do: ${LAB_INFO.title} is an offline virtual lab (the attached file ${LAB_INFO.file}). Students run ${LAB_INFO.topic}. The lab takes them step by step through Observe, Question, Hypothesis, Plan, Test, Results, Analysis and Evaluation. It takes about ${LAB_INFO.lessons} lessons and can be run by a cover teacher.
What students hand in: two PDFs saved from the lab.
1. Lab report: the student's own work only.
2. Feedback sheet: the lab's automatic checks, a "What to check" list, their results compared with the real values, and behind-the-scenes data from their test.
Student instructions should be short, at a Grade ${LAB_INFO.grade} reading level: open the file, type your name and class, choose a challenge level, work through every step, then save both PDFs and upload them here.

ASSESSMENT CRITERIA (MYP Sciences, Year ${yr})
Criterion B: Inquiring and designing
${C.B.map((t,i)=>`  ${rn[i]}. ${t}`).join('\n')}
Criterion C: Processing and evaluating
${C.C.map((t,i)=>`  ${rn[i]}. ${t}`).join('\n')}
${g6?'Report each criterion as a band only (Beginning, Developing, Proficient, Mastering). Do not show numbers out of 8.':'Report each criterion as an MYP level from 1 to 8.'}

MARKING METHOD
- Students choose a challenge level at the start. It is printed in the top-right header of every page of both PDFs. Their grade for each criterion cannot go above the cap for that level:
${caps.map(t=>`  - ${t}`).join('\n')}
- Mark the lab report against each strand using best-fit judgement, then apply the cap.
- Use the feedback sheet to check the data: pink cells show measurements or averages that are not accurate, and "What to check" lists things to look at. The lab's checks look at structure and data use; confirm the science yourself.
- An unfinished or wrong answer is allowed in the report; it simply earns a lower level.

FEEDBACK FORMAT (to the student, in simple words)
Good job!

Keep it up
- (2 to 4 simple positives about what the student did well)

Try this
- (2 to 4 actions, each starting with a verb and naming the part of the report)

This is formative: no final grade goes to the gradebook unless I choose to.`}
function toddleHTML(){
  return`<h3>Set it up on Toddle</h3>
  <ol><li>On Toddle, create a new <b>formative assessment</b> for the class and choose to make it with the <b>AI</b> task helper.</li>
  <li>Copy the prompt below and paste it into the AI helper. Check what it builds and change anything you like.</li>
  <li>Attach <b>${LAB_INFO.file}</b> to the task so students can download it.</li>
  <li>Set the hand-in to <b>file upload</b>, so students can upload their two PDFs.</li>
  <li>Assign it to the class.</li></ol>
  <p class="note">Button names on Toddle may differ a little. The prompt uses MYP Year ${LAB_INFO.grade==='6'?'1':'3'} Criteria B and C and the challenge-level caps below.</p>
  <textarea id="toddlePrompt" readonly rows="12" style="width:100%;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap">${esc(toddlePrompt())}</textarea>
  <div style="display:flex;gap:8px;align-items:center;margin-top:6px"><button class="btn primary sm" onclick="(function(b){const t=document.getElementById('toddlePrompt');t.focus();t.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}if(navigator.clipboard){navigator.clipboard.writeText(t.value).then(()=>{b.textContent='✓ Copied'},()=>{b.textContent=ok?'✓ Copied':'Selected: press Ctrl+C'})}else b.textContent=ok?'✓ Copied':'Selected: press Ctrl+C'})(this)">📋 Copy the prompt</button></div>`}
/* ===== FOR TEACHERS ===== */
function teacherHTML(){
  return`<h2>Paper Plane Lab: for teachers</h2>
  <p><b>Purpose.</b> Students plan and run their own fair test with virtual paper planes and write a full lab report in the format of the department lab report template. It is a formative task: students hand in two PDFs on Toddle. It is designed for two lessons and can be run by a cover teacher.</p>
  ${toddleHTML()}
  <h3>The two lessons</h3>
  <table><tr><th>Lesson 1</th><td>Each student opens the lab on their own computer, types their name and class, and chooses a challenge level. Students who may do the peer review extension together should choose the <b>same</b> variables, values, set-up and plane design. Then: Observe (free throws and observations) → Question → Hypothesis → Plan → Test flights (each student flies their own planes and fills in Table 1 as they go).</td></tr>
  <tr><th>Lesson 2</th><td>Results (observations table and graph) → Analysis (mini-lesson on describing trends or comparing groups, then Q1–Q2) → Evaluation (mini-lesson on fair tests, human vs method error and reliability; a fairness line; sorting errors and improvements; Q3 explains method errors only, Q4 fixes them) → Finish: save the PDF, upload to Toddle, complete the checklist, save the certificate.</td></tr><tr><th>Extensions</th><td>For students who finish early: (1) peer review with a partner who ran the same experiment (compare averages, judge reliability, peer-check each other's report; a virtual partner is available), added to the PDF as an extension section; (2) a new investigation with a different independent variable at a higher challenge level, with its own PDF and certificate. The first report stays downloadable.</td></tr></table>
  <p class="note">After choosing a level, students get a one-minute guided tour (steps, saving, My report, About this step, finishing); the <b>❓ How it works</b> button replays it. Work saves automatically in the browser. If students change computers between lessons, they use <b>Save progress</b> at the end of lesson 1 and <b>Open</b> at the start of lesson 2. Students without a partner can use the virtual partner.</p>
  <h3>Challenge levels and grade caps</h3>
  <table><tr><th>Level</th><th>Support</th><th>Highest grade</th></tr>${LVI.map(k=>`<tr><td><b>${LV[k].n}</b></td><td>${LV[k].help.join('; ')}</td><td>${BANDS[CAP_BAND[k]]}${k==='einstein'?' (extra challenge)':''}</td></tr>`).join('')}</table>
  <p class="note">Students type every answer at every level. Only set-up choices (variables, values, location, launch method, plane design, launch angle and throw speed) and the method step bank are clicked. Safety rules are left out because the test is virtual. The "My report" tab on the right shows everything a student has written so far. The level is locked once a student starts, and it is printed on every page of the PDF.</p>
  <h3>Problems built into the lab (for evaluation)</h3>
  <ul>${Object.values(FLAWS).map(f=>`<li><b>${f.name}.</b> ${f.why}</li>`).join('')}</ul>
  <p class="note">Flying outside gives stronger, gustier wind than inside; the rubber band launcher makes throws much more consistent, but its band slowly loses stretch, so later launches are a little weaker (a method error of its own). During test flights the thrower (or launcher operator) comments on flights that something really affected: Developing and Proficient can add the comment to their notes; Mastering and Einstein see "Hmm, that one was different…", which opens the flight conditions with big effects in red (never the real distance or time). Students never see a distance: they read the tape, estimate the last digit and type it into their table. Launch angle and throw speed are set with sliders in the simulator; if a student changes them partway through, the PDF flags it as an unfair test. After all flights are done, a "Behind the scenes" panel shows the real values, and the PDF appendix lists them for the marker.</p>
  <h3>Marking</h3>
  <p>Students hand in <b>two PDFs</b> on Toddle. The <b>lab report</b> holds only the student's own work, laid out simply so a teacher or an AI marker can read it. The <b>feedback sheet</b> lists every strand of Criteria B and C with what the automatic checks found and a suggested level (never above the challenge level), a "What to check" list, Table 1 compared with the real values, and the behind-the-scenes flight data. The checks look for structure and data use. They cannot judge whether the science is correct, so please confirm each level.</p>
  <p>Students are <b>never told during the lab</b> whether a tape reading or an average is accurate, at any level. The feedback sheet shows it instead: inaccurate readings and averages are pink, and the "What to check" list covers missing units, a trend that does not match the data, missing control variables, human errors explained instead of method errors, and more. Every part of the lab shows a green <b>Done</b> or an amber <b>To do</b>, each page has an "On this page" bar, and before saving a PDF students see a list of anything unfinished with a "Go there" button. Any answer counts as done, even one word, and wrong answers are allowed: a short or wrong answer simply earns a lower level. Leaving a page with unfinished parts shows a warning with "Continue anyway". Only the things the experiment cannot run without (what to change, what to measure, at least 2 groups, where to fly, how to launch) stop a student, and the lab takes them straight to the first missing one. A calculator on the Test flights page helps with averages.</p>
  <h3>ACARA v9 (for planning only)</h3>
  <table><tr><th>Code</th><th>Where</th></tr>
  <tr><td>AC9S6I01</td><td>Research question and IF/THEN/BECAUSE hypothesis</td></tr>
  <tr><td>AC9S6I01</td><td>Observe step: free exploration and observations that lead to a question</td></tr><tr><td>AC9S6I02</td><td>Plan: independent, dependent and control variables; set-up; method; repeat trials</td></tr>
  <tr><td>AC9S6I03</td><td>Reading the tape and estimating the last digit; the stopwatch; recording in a table with units</td></tr>
  <tr><td>AC9S6I04</td><td>Results tables, choosing a bar or scatter graph, describing the pattern</td></tr>
  <tr><td>AC9S6I05</td><td>Compare with a partner (reliability), sources of error, improvements</td></tr>
  <tr><td>AC9S6I06</td><td>The full lab report</td></tr></table>
  <h3>Model limits</h3>
  <p class="note">The flight model is a simplified 2D glide (lift, drag, weight and a gentle pull-up) tuned to give realistic distances of about 3–12 m and flight times of 1–3.5 s. Planes do not turn sideways. Results are realistic in direction, but the exact numbers are a model.</p>`;
}
