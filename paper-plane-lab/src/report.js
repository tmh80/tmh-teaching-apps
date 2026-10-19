/* ===== REPORT: marking suggestions, PDF (canvas pages -> JPEG -> PDF, no libraries), certificate ===== */
const PDF_FONT='system-ui,"Segoe UI","Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif';

/* ---- suggested bands for the marker (then capped by the challenge level) ---- */
function measureOK(){const t=helped()?A('manip.c')+' '+A('manip.d'):A('measure');return hasDV(t)&&/tape|stopwatch|timer|ruler|measur|clock/i.test(t)}
function manipOK(){const t=helped()?A('manip.a')+' '+A('manip.b'):A('manip');return hasIV(t)&&words(t)>=4}
function rubric(){
  const R=[],t=x=>String(x||'');
  /* each check: [ok, what the student did well, what to work on] — written for the student, who also reads this page */
  /* B i */
  {const q=rqText(),fmtOK=/^how\b/i.test(q.trim())&&/\?\s*$/.test(q)&&hasIV(q)&&hasDV(q),extra=words(rqExtra())>=6;
   let b=!q.trim()?-1:fmtOK?(extra?2:1):0;R.push({k:'B i',d:'My research question',ev:[[fmtOK,'Your question uses “How does … affect …?” and names both variables.','Write your question as “How does … affect …?” and name both variables.'],[extra,'You added extra detail about the science.','Add extra detail: what science do you already know about your question?']],b,up:b===2?'that the science in your extra detail is correct':''})}
  /* B ii */
  {const h=hypText(),iv=mentionsIV(h),dv=hasDV(h),ifthen=/\bif\b/i.test(h)&&/\bthen\b/i.test(h),bc=words(hypBecause())>=4;
   let b=!h.trim()?-1:(iv&&dv)?(bc?3:2):(iv||dv)?1:0;R.push({k:'B ii',d:'My hypothesis',ev:[[ifthen&&/because/i.test(h),'You used IF, THEN and BECAUSE.','Use the IF … THEN … BECAUSE … format.'],[iv&&dv,'You named what you changed and what you measured.','Name what you changed and what you measured.'],[bc,'You gave a reason.','Give a science reason after BECAUSE.']],b,up:b===3?'that your reason uses correct science':''})}
  /* B iii */
  {const iv=hasIV(ivTextA()),dv=hasDV(dvTextA()),u=unitOK('iv')&&unitOK('dv'),me=methodList().some(t=>/tape|stopwatch|timer|measur|time the|read/i.test(t))&&methodList().some(t=>IVX[S.iv].kw.test(t.toLowerCase())||/change|set the|next/i.test(t));
   let b=!(ivTextA()+dvTextA()).trim()?-1:(iv&&dv)?(u&&me?3:(u||me)?2:1):(iv||dv)?1:0;R.push({k:'B iii',d:'My variables and units',ev:[[iv&&dv,'You named your independent and dependent variables.','Name your independent and dependent variables.'],[u,'Your units are correct.','Check the units for your variables.'],[me,'Your method says how you changed and measured them.','Say in your method how you change and measure your variables.']],b})}
  /* B iv */
  {const cl=controlsList().filter(c=>words(c.name)>0&&words(c.how)>=2&&!IVX[S.iv].main.test(c.name)).length,uf=unfairFlights();
   let b=cl===0?(controlsList().length?0:-1):cl;R.push({k:'B iv',d:'My control variables',ev:[[cl>=3,'You wrote 3 control variables and how you kept them the same.',`You wrote ${cl} control variable${cl===1?'':'s'} with how you kept ${cl===1?'it':'them'} the same. Aim for 3.`],[!uf.length,'You kept the launch angle and throw speed the same in every flight.',`You changed the ${uf.join(' and ')} between flights, so the test was not fair.`]],b})}
  /* C i */
  {const st=levelStats(),tot=st.length*3,trok=st.reduce((a,s)=>a+[0,1,2].filter(i=>trOK(s.lk,i)).length,0),avok=st.filter(s=>avgOK(s.lk)).length,ttl=!!t1Title(),units=t(A('t1.dvh')).includes(dvUnitTxt()),ge=graphEval();
   const frac=tot?trok/tot:0;let b=trok===0?(live().length?0:-1):frac<0.7?1:(frac===1&&avok===st.length&&ttl&&units&&ge.done&&ge.type)?3:2;
   R.push({k:'C i',d:'My tables and graph',ev:[[trialsDone(),'You did every flight.',`You did ${live().length} of ${flightsExpected()} flights.`],[frac===1,'All your measurements are accurate.',`${tot-trok} of your ${tot} measurements are not accurate. Look for the pink boxes on your feedback sheet.`],[avok===st.length,'All your averages are correct.',`${st.length-avok} average${st.length-avok===1?' is':'s are'} not correct. Check your adding and dividing.`],[ttl&&units,'Your table has a title and units.','Give your table a title and put units in the headings.'],[ge.type&&ge.title&&ge.xl&&ge.yl,'Your graph is the right type, with a title and axis labels.','Check your graph type, title and axis labels.'],[ge.placed===ge.total&&ge.accurate===ge.total,'All your points or bars are in the right place.','Check where your points or bars are on the graph.']].concat(gInit().fit&&IVS[S.iv].type==='num'?[[ge.fitOK&&!(ge.bendy&&!gInit().fit.curve),`Your ${gInit().fit.curve?'curve':'line'} of best fit matches your points well.`,ge.bendy&&!gInit().fit.curve?'Your points make a bend. Try a curve of best fit.':`Move your ${gInit().fit.curve?'curve':'line'} of best fit so it goes through the middle of your points.`]]:[]),b})}
  /* C ii */
  {const q=qText('q1'),u=usesData(q),pat=/positive|negative|no trend|increas|decreas|greatest|smallest|highest|lowest|difference/i.test(q);
   let b=!q.trim()?-1:u>=2&&pat&&words(q)>=20?3:u>=1?2:words(q)>=6?1:0;R.push({k:'C ii',d:'What my data shows (Q1)',ev:[[pat,'You described a pattern in your data.','Describe the pattern: the trend, or which group was highest and lowest.'],[u>=2,`You used ${u} numbers from your results.`,'Use at least two numbers from your results.']],b,up:b===3?'that the pattern you describe matches your data':''})}
  /* C iii */
  {const q=qText('q2'),sup=/support/i.test(q),u=usesData(q),ex=/because|shows|which|so\b/i.test(q);
   let b=!q.trim()?-1:sup?(u>=1?(ex&&u>=2?3:2):1):0;R.push({k:'C iii',d:'Was my hypothesis supported? (Q2)',ev:[[sup,'You said if your hypothesis was supported.','Say if your hypothesis was supported, not supported or partly supported.'],[ex&&u>=2,'You explained it using your data.','Explain your answer using numbers from your data.']],b,up:q.trim()?'that your answer matches your data':''})}
  /* C iv */
  {const q=qText('q3'),f=flawsIn(q),bc=(q.match(/because|so\b|which|this (made|meant|affected)/gi)||[]).length,rel=relText(),two=helped()?q3Chosen().filter(cd=>catOK(cd,'method')).length>=2:flawsIn(q).filter(k=>k!=='control').length>=2;
   let b=!q.trim()?-1:f.length>=2?(bc>=2&&words(q)>=30?3:2):(f.length===1||words(q)>=6)?1:0;R.push({k:'C iv',d:'Method errors (fairness line and Q3)',ev:[[A('fair','')!==''&&words(fairText())>=5,`You rated your test as ${A('fair','')!==''?fairWord():'—'} and said why.`,'Mark your ✕ on the fairness line and say why you put it there.'],[two,'You explained at least two method errors.','Explain at least two method errors (problems with how the test was set up).'],[bc>=2,'You said how the errors changed your results.','Say how each error changed your results.'],...(compareStarted()?[[words(rel)>=10&&usesData(rel)>=1,'Extension: you compared your results with a partner using data.','Extension: compare your results with your partner’s using numbers.']]:[])],b})}
  /* C v */
  {const q=qText('q4'),how=/use|close|repeat|launcher|film|video|same|template|more trials|average|measure|weigh|inside|switch off/i.test(q),why=/because|so that|this would|which would/i.test(q);
   let b=!q.trim()?-1:how?(why?3:2):words(q)>=5?1:0;R.push({k:'C v',d:'Improvements (Q4)',ev:[[how,'You said how to change the method.','Say exactly how you would change the method.'],[why,'You explained why each change would help.','Explain how each change makes the test fairer or the results more reliable.']],b})}
  const cap=CAP_BAND[S.level];R.forEach(r=>{r.capped=r.b>cap;r.final=Math.min(r.b,cap);});
  return R;
}
const bandName=b=>b<0?'Not attempted':BANDS[b];


/* ---- "!" flags: everything in the report that does not look right. Students are never told during the lab; the PDF shows it. ---- */
const FLAG_SEC={obs:'Observations',rq:'Research question',vars:'Variables',hyp:'Hypothesis',ctl:'Control variables',mat:'Materials',met:'Method',t1:'Table 1',t2:'Table 2',graph:'Graph',q1:'Analysis Q1',q2:'Analysis Q2',fair:'Fairness',sort:'Errors and improvements',q3:'Evaluation Q3',q4:'Evaluation Q4'};
function reportFlags(){
  const F=[],add=(sec,msg)=>F.push({sec,msg});if(!S.iv||!S.dv)return F;
  const c=cx(),st=levelStats(),ml=methodList();
  if(words(obsText())<10)add('obs','The observations are missing or very short.');
  {const q=rqText();if(!q.trim())add('rq','There is no research question.');else{if(!/\?\s*$/.test(q))add('rq','The research question does not end with a question mark.');if(!hasIV(q)||!hasDV(q))add('rq','The research question does not name both variables.')}}
  if(!ivTextA().trim()||!hasIV(ivTextA()))add('vars','The independent variable is missing or does not look right.');
  if(!dvTextA().trim()||!hasDV(dvTextA()))add('vars','The dependent variable is missing or does not look right.');
  if(!unitOK('iv'))add('vars','The unit for the independent variable is missing or wrong'+(c.isNum?` (should be ${c.iv.unit}).`:' (it has no unit).'));
  if(!unitOK('dv'))add('vars',`The unit for the dependent variable is missing or wrong (should be ${dvUnitTxt()}).`);
  {const h=hypText();if(!h.trim())add('hyp','There is no hypothesis.');else{if(!(/\bif\b/i.test(h)&&/\bthen\b/i.test(h)&&/\bbecause\b/i.test(h)))add('hyp','The hypothesis does not use IF, THEN and BECAUSE.');if(!mentionsIV(h)||!hasDV(h))add('hyp','The hypothesis does not name both variables.');if(words(hypBecause())<4)add('hyp','The hypothesis does not give a reason.')}}
  {const cl=controlsList(),good=cl.filter(x=>words(x.name)>0&&words(x.how)>=2);if(good.length<3)add('ctl',`Only ${good.length} of 3 control variables say how they are kept the same.`);
   if(cl.some(x=>IVX[S.iv].main.test(x.name)))add('ctl','A control variable is the same as the independent variable.');
   const uf=unfairFlights();if(uf.length)add('ctl',`The ${uf.join(' and ')} changed between recorded flights, so the test was not fair.`)}
  if(helped()){const sh=matShelf(),ml2=matList();sh.filter(m=>m.need===true&&!ml2.includes(m.id)).forEach(m=>add('mat',`Missing from the materials: ${m.t}.`));sh.filter(m=>m.need===false&&ml2.includes(m.id)).forEach(m=>add('mat',`Not needed for this test: ${m.t}.`));
    if(isPro())ml2.forEach(id=>{const m=sh.find(x=>x.id===id);if(m&&!/\d|one|two|three|four|five|six|a pair/i.test(A('mat.n.'+id)))add('mat',`No amount given for: ${m.t}.`)})}
  else{const mt=materialsText();if(words(mt)<3)add('mat','The materials list is missing or very short.');else{if(!new RegExp(S.dv==='dist'?'tape|ruler|metre stick|meter stick':'stopwatch|timer','i').test(mt))add('mat',`The ${DVX[S.dv].tool} is not in the materials list.`);if(!/\d|\b(one|two|three|four|five|six|a pair)\b/i.test(mt))add('mat','The materials list does not give amounts.')}}
  if(ml.length<3)add('met','The method has fewer than 3 steps.');
  else{if(!ml.some(t=>/\b(3|three)\b|repeat/i.test(t)))add('met','The method does not say to repeat each test (3 trials).');if(!ml.some(t=>/tape|stopwatch|timer|measur|time the|read/i.test(t)))add('met','The method does not say how to measure.')}
  /* Table 1 */
  if(!trialsDone())add('t1',`Only ${live().length} of ${flightsExpected()} flights were done.`);
  if(!t1Title())add('t1','Table 1 has no title.');
  const UREX={cm:/\bcm\b|centim/i,'°':/°|degree/i,'m/s':/m\/s|per second/i,clips:/clip|number/i,s:/\(s\)|\bs\b|sec/i};
  if(!words(A('t1.ivh')))add('t1','The IV heading is missing.');else if(c.isNum&&!UREX[c.iv.unit].test(A('t1.ivh')))add('t1',`The IV heading has no unit (${c.iv.unit}).`);
  if(!words(A('t1.dvh')))add('t1','The DV heading is missing.');else if(!UREX[dvUnitTxt()].test(A('t1.dvh')))add('t1',`The DV heading has no unit (${dvUnitTxt()}).`);
  if(!A('t1.avgu').trim())add('t1','The unit for the averages is missing.');else if(!UREX[dvUnitTxt()].test(A('t1.avgu')))add('t1',`The unit for the averages should be ${dvUnitTxt()}.`);
  {let bad=0,badA=0,missA=0;st.forEach(s=>{[0,1,2].forEach(i=>{if(String(A('tr.'+String(s.lk)+'.'+i)).trim()&&!trOK(s.lk,i))bad++});const av=String(A('avg.'+String(s.lk))).trim();if(s.n>=3&&!av)missA++;else if(av&&!avgOK(s.lk))badA++});
   if(bad)add('t1',`${bad} reading${bad>1?'s do':' does'} not match where the plane landed${S.dv==='time'?' or the stopwatch':''} (see the pink boxes on this sheet).`);
   if(badA)add('t1',`${badA} average${badA>1?'s are':' is'} not correct (see the pink boxes on this sheet).`);if(missA)add('t1',`${missA} average${missA>1?'s are':' is'} missing.`)}
  /* Table 2 */
  {const rows=S.levels.map(lk=>A('obs.'+String(lk)));if(rows.some(r=>words(r)<2))add('t2','Some qualitative observations are missing.');if(rows.some(r=>/\d/.test(r)))add('t2','Table 2 uses numbers. Qualitative observations should use words only.')}
  /* graph */
  {const g=gInit(),e=graphEval();if(!g.type)add('graph','There is no graph.');else{if(!e.type)add('graph',`This should be a ${c.isNum?'scatter':'bar'} graph.`);if(!e.title)add('graph',`The title should be: ${c.ivName} vs ${c.dv.name}.`);if(!e.xl)add('graph','The x-axis label is missing, wrong or has no unit.');if(!e.yl)add('graph','The y-axis label is missing, wrong or has no unit.');
    if(e.valid&&!e.fits)add('graph','Some data does not fit on the axes.');if(e.placed<e.total)add('graph',`Only ${e.placed} of ${e.total} ${c.isNum?'points':'bars'} are on the graph.`);else if(e.accurate<e.total)add('graph',`${e.total-e.accurate} ${c.isNum?'point':'bar'}${e.total-e.accurate>1?'s are':' is'} in the wrong place.`);
    if(c.isNum&&g.fit){const w=g.fit.curve?'curve':'line';if(!e.fitOK)add('graph',e.fitShort?`The ${w} of best fit does not stretch across all the points.`:`The ${w} of best fit does not go through the middle of the points.`);if(e.bendy&&!g.fit.curve)add('graph','The points make a bend, so a curve of best fit would match them better.')}}}
  /* analysis */
  {const q=qText('q1'),tr=trendOf();if(!q.trim())add('q1','Question 1 is not answered.');else{if(usesData(q)<2)add('q1','Question 1 does not use at least two numbers from the results.');
    if(c.isNum){const said=/positive/i.test(q)?'up':/negative/i.test(q)?'down':/\bno\b[^.]*trend|no trend/i.test(q)?'flat':null,real=tr.kind==='up'||tr.kind==='down'?tr.kind:(tr.kind==='flat'||tr.kind==='mixed')?'flat':null;
      if(!said)add('q1','Question 1 does not name the trend (positive, negative or no trend).');else if(real&&said!==real)add('q1',`The trend named does not match the data. The data shows: ${trendSentence(tr)}`)}
    else if(tr.best&&!q.toLowerCase().includes(String(tr.best.lk).toLowerCase().replace(/ (paper|plane)$/,'')))add('q1',`Question 1 does not name the group with the greatest average (${tr.best.lk}).`)}}
  {const q=qText('q2');if(!q.trim())add('q2','Question 2 is not answered.');else{if(!/support/i.test(q))add('q2','Question 2 does not say if the hypothesis was supported.');if(usesData(q)<1)add('q2','Question 2 does not use data.')}}
  /* evaluation */
  if(A('fair','')==='')add('fair','The fairness line has no ✕.');else{if(words(fairText())<5)add('fair','No reason is given for the ✕.');if(Number(A('fair'))>=70&&unfairFlights().length)add('fair',`Rated ${fairWord()}, but the ${unfairFlights().join(' and ')} changed between flights.`)}
  if(helped()){const cards=sortCards(),wrong=cards.filter(cd=>A('sort.'+cd.id)&&!catOK(cd,A('sort.'+cd.id))),miss=cards.filter(cd=>!A('sort.'+cd.id));if(wrong.length)add('sort',`${wrong.length} card${wrong.length>1?'s are':' is'} in the wrong group.`);if(miss.length)add('sort',`${miss.length} card${miss.length>1?'s were':' was'} not sorted.`)}
  else{if(words(A('ev.m'))<3)add('sort','No method errors are listed.');if(words(A('ev.i'))<3)add('sort','No improvements are listed.');if(/\b(careless|misread|pressed .*(late|early)|not paying attention|by mistake|wasted)\b/i.test(A('ev.m')))add('sort','The method errors list includes human errors (slips).')}
  {const q=qText('q3');if(!q.trim())add('q3','Question 3 is not answered.');else{
    if(helped()){const ch=q3Chosen();if(ch.length<2)add('q3','Fewer than two method errors were explained.');const hum=ch.filter(cd=>!catOK(cd,'method'));if(hum.length)add('q3','A human error was explained instead of a method error.');if(ch.some(cd=>words(A('q3.w'+cd.id))<4))add('q3','Not every error says how it changed the results.')}
    else{const fl=flawsIn(q).filter(k=>!['timer','control'].includes(k)||/react/i.test(q));if(fl.length<2)add('q3','Fewer than two method errors were found in Question 3.');if(/\b(careless|not paying attention|by mistake|wasted|human error)\b/i.test(q))add('q3','Question 3 talks about human errors. It should explain method errors.');if(!/because|so\b|which|this (made|meant|affected)/i.test(q))add('q3','Question 3 does not explain how the errors affected the results.')}}}
  {const q=qText('q4');if(!q.trim())add('q4','Question 4 is not answered.');else if(!/fair|reliab|same|similar|accura/i.test(q))add('q4','Question 4 does not say how the changes make the test fairer or more reliable.')}
  return F;
}

const ALLGOOD=()=>S.level==='einstein'?'**You’ve mastered it. Excellent work!**':'**You’re good. Try the next challenge level.**';
/* ---- canvas document ---- */
function pdfWrap(c,text,maxW){
  const out=[];String(text).split('\n').forEach(par=>{
    if(!par.trim()){out.push('');return}
    const toks=par.match(/[　-鿿＀-￯]|[^\s　-鿿＀-￯]+|\s+/g)||[];let cur='';
    toks.forEach(tk=>{const t=cur+tk;if(c.measureText(t).width<=maxW||!cur.trim()){
        if(c.measureText(t).width>maxW){let piece='';for(const ch of tk){if(c.measureText(cur+piece+ch).width>maxW){out.push((cur+piece).trimEnd());cur='';piece=ch}else piece+=ch}cur+=piece}else cur=t}
      else{out.push(cur.trimEnd());cur=tk.trimStart()}});
    if(cur.trim())out.push(cur.trimEnd())});
  return out;
}
class Doc{
  constructor(land){this.W=land?1754:1240;this.H=land?1240:1754;this.M=80;this.pages=[];this.newPage()}
  newPage(){const cv=document.createElement('canvas');cv.width=this.W;cv.height=this.H;const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,this.W,this.H);c.textBaseline='alphabetic';this.pages.push(cv);this.c=c;this.y=120}
  ensure(h){if(this.y+h>this.H-80)this.newPage()}
  font(sz,w){this.c.font=`${w||'normal'} ${sz}px ${PDF_FONT}`}
  text(s,o={}){const sz=o.sz||22,lh=sz*(o.lh||1.4),x=o.x||this.M,maxW=o.maxW||this.W-2*this.M-(x-this.M);this.font(sz,o.w);
    pdfWrap(this.c,s,maxW).forEach(l=>{this.ensure(lh);this.font(sz,o.w);this.c.fillStyle=o.col||'#14202e';this.c.fillText(l,x,this.y+sz);this.y+=lh});this.y+=o.gap==null?6:o.gap}
  h2(s){this.ensure(200);this.y+=14;this.font(30,'bold');this.c.fillStyle=S_LVCOL();this.c.fillText(s,this.M,this.y+30);this.y+=42;this.c.fillStyle=S_LVCOL();this.c.fillRect(this.M,this.y,this.W-2*this.M,3);this.y+=16}
  h3(s){this.ensure(60);this.y+=6;this.text(s,{sz:23,w:'bold',gap:4})}
  box(label,content,o={}){
    const sz=21,lh=sz*1.4,pad=14,maxW=this.W-2*this.M-2*pad;this.font(sz);const empty=!String(content||'').trim();
    const lines=empty?['(not answered)']:pdfWrap(this.c,content,maxW);
    const tot=lines.length*lh+2*pad+30;if(tot<420&&this.y+tot>this.H-80)this.newPage();
    if(label)this.text(label,{sz:17,w:'bold',col:'#566475',gap:2});
    let i=0;while(i<lines.length){this.ensure(lh+2*pad);const room=Math.max(1,Math.floor((this.H-80-this.y-2*pad)/lh)),chunk=lines.slice(i,i+room),h=chunk.length*lh+2*pad;
      this.c.fillStyle=o.bg||'#f4f7fa';this.c.fillRect(this.M,this.y,this.W-2*this.M,h);this.c.strokeStyle='#d2d9e1';this.c.lineWidth=1.5;this.c.strokeRect(this.M,this.y,this.W-2*this.M,h);
      this.font(sz,empty?'italic':'normal');this.c.fillStyle=empty?'#9aa7b6':'#14202e';chunk.forEach((l,j)=>this.c.fillText(l,this.M+pad,this.y+pad+sz+j*lh));this.y+=h;i+=chunk.length;if(i<lines.length)this.newPage()}
    this.y+=12;
  }
  table(head,rows,widths,o={}){
    const sz=o.sz||19,lh=sz*1.32,pad=8,W=this.W-2*this.M,ws=widths.map(w=>w*W);
    const drawRow=(cells,isHead,fill)=>{this.font(sz,isHead?'bold':'normal');const L=cells.map((t,i)=>pdfWrap(this.c,String(t==null?'':t),ws[i]-2*pad));const h=Math.max(...L.map(l=>l.length))*lh+2*pad;
      if(this.y+h>this.H-80){this.newPage();if(!isHead&&head)drawRow(head,true)}
      let x=this.M;cells.forEach((t,i)=>{this.c.fillStyle=isHead?'#e9eef3':(fill&&fill[i])||'#fff';this.c.fillRect(x,this.y,ws[i],h);this.c.strokeStyle='#b9c4cf';this.c.lineWidth=1.2;this.c.strokeRect(x,this.y,ws[i],h);
        this.font(sz,isHead?'bold':'normal');this.c.fillStyle='#14202e';L[i].forEach((l,j)=>this.c.fillText(l,x+pad,this.y+pad+sz+j*lh));x+=ws[i]});this.y+=h};
    const rowH=cells=>{this.font(sz,'normal');return Math.max(...cells.map((t,i)=>pdfWrap(this.c,String(t==null?'':t),ws[i]-2*pad).length))*lh+2*pad};
    if(head&&rows.length){const need=rowH(head)+rowH(rows[0].cells||rows[0]);if(need<this.H-300&&this.y+need>this.H-80)this.newPage()}
    if(head)drawRow(head,true);rows.forEach(r=>drawRow(r.cells||r,false,r.fill));this.y+=12;
  }
  /* rich text: **bold**, {g}green{/}, {r}red{/}, {m}muted{/}. Returns height; draws only when draw=true */
  rich(text,x,y,maxW,sz,draw,base){
    const c=this.c,lh=sz*1.38,runs=[];let bold=false,col=base||'#14202e';
    String(text).split(/(\*\*|\{[grm]\}|\{\/\})/).forEach(p=>{if(p==='**')bold=!bold;else if(p==='{g}')col='#1f7a45';else if(p==='{r}')col='#b3301e';else if(p==='{m}')col='#566475';else if(p==='{/}')col=base||'#14202e';else if(p)p.split(/(\s+)/).forEach(w=>{if(w)runs.push({w,bold,col})})});
    let cx=0,cy=0;const lines=[[]];
    runs.forEach(r=>{c.font=`${r.bold?'bold':'normal'} ${sz}px ${PDF_FONT}`;const wd=c.measureText(r.w).width;if(/^\s+$/.test(r.w)){if(cx>0){lines[lines.length-1].push({...r,x:cx});cx+=wd}return}
      if(cx+wd>maxW&&cx>0){lines.push([]);cx=0;cy+=lh}lines[lines.length-1].push({...r,x:cx});cx+=wd});
    if(draw)lines.forEach((ln,i)=>ln.forEach(r=>{c.font=`${r.bold?'bold':'normal'} ${sz}px ${PDF_FONT}`;c.fillStyle=r.col;c.fillText(r.w,x+r.x,y+sz+i*lh)}));
    return lines.length*lh;
  }
  flags(F,sec){F.filter(f=>f.sec===sec).forEach(f=>{const sz=18,x=this.M;this.font(sz,'bold');const lines=pdfWrap(this.c,f.msg,this.W-2*this.M-44);this.ensure(lines.length*sz*1.35+8);
    this.c.fillStyle='#b3301e';this.c.beginPath();this.c.arc(x+13,this.y+13,13,0,7);this.c.fill();this.c.fillStyle='#fff';this.c.textAlign='center';this.c.fillText('!',x+13,this.y+20);this.c.textAlign='left';
    this.c.fillStyle='#b3301e';lines.forEach((l,j)=>this.c.fillText(l,x+36,this.y+19+j*sz*1.35));this.y+=lines.length*sz*1.35+8});}
  image(cv,w){const h=cv.height*w/cv.width;this.ensure(h+10);this.c.drawImage(cv,this.M,this.y,w,h);this.c.strokeStyle='#d2d9e1';this.c.strokeRect(this.M,this.y,w,h);this.y+=h+14}
}
const S_LVCOL=()=>LV[S.level].col;
function decorate(d,title){
  const n=d.pages.length,l=LV[S.level];
  d.pages.forEach((cv,i)=>{const c=cv.getContext('2d');
    c.fillStyle='#14202e';c.fillRect(0,0,cv.width,70);c.font=`bold 24px ${PDF_FONT}`;c.fillStyle='#fff';c.textAlign='left';c.fillText(title,d.M,44);
    c.font=`19px ${PDF_FONT}`;c.fillStyle='#cfd9e6';c.fillText(`${S.name} · ${S.cls}`,d.M+c.measureText(title).width*24/19+30,44);
    const tag=`${'★'.repeat(l.stars)} ${l.n.toUpperCase()} · ${capText(S.level)}`;c.font=`bold 19px ${PDF_FONT}`;const tw=c.measureText(tag).width+30;
    c.fillStyle=l.col;c.fillRect(cv.width-d.M-tw,16,tw,38);c.fillStyle='#fff';c.textAlign='center';c.fillText(tag,cv.width-d.M-tw/2,42);
    c.textAlign='center';c.fillStyle='#566475';c.font=`17px ${PDF_FONT}`;c.fillText(`Page ${i+1} of ${n}`,cv.width/2,cv.height-34);c.textAlign='left'});
}
function b64bytes(u){const b=atob(u.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function pdfFromCanvases(cvs,title){
  const enc=new TextEncoder(),parts=[],offs=[];let len=0;const put=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length};
  put('%PDF-1.4\n%\xff\xff\xff\xff\n');const n=cvs.length,obj=(i,body)=>{offs[i]=len;put(`${i} 0 obj\n`);body();put('\nendobj\n')};
  const ptW=c=>c.width>c.height?841.89:595.28,ptH=c=>c.width>c.height?595.28:841.89;
  obj(1,()=>put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>put(`<< /Type /Pages /Count ${n} /Kids [${cvs.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`));
  cvs.forEach((cv,i)=>{const p=3+i*3,W=ptW(cv),H=ptH(cv),jpg=b64bytes(cv.toDataURL('image/jpeg',0.86)),cs=`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    obj(p,()=>put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${p+2} 0 R >> >> /Contents ${p+1} 0 R >>`));
    obj(p+1,()=>put(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    obj(p+2,()=>{put(`<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);put(jpg);put('\nendstream')})});
  const info=3+n*3;obj(info,()=>put(`<< /Title (${String(title).replace(/[^\x20-\x7e]/g,'').replace(/[()\\]/g,'')}) /Producer (Paper Plane Lab) >>`));
  const xref=len;put(`xref\n0 ${info+1}\n0000000000 65535 f \n`);for(let i=1;i<=info;i++)put(String(offs[i]).padStart(10,'0')+' 00000 n \n');
  put(`trailer\n<< /Size ${info+1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts,{type:'application/pdf'});
}

/* ---- the report ---- */
/* the lab report: only the student's own work, laid out simply (easy for a teacher or an AI marker to read) */
function buildReport(){
  const d=new Doc(),c=cx(),l=LV[S.level];
  /* cover + marking page */
  d.text('Paper Plane Investigation: Lab Report'+(S.attempt>1?` (investigation ${S.attempt})`:''),{sz:40,w:'bold',gap:4});
  d.text(`${S.name}   ·   Class ${S.cls}   ·   ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`,{sz:22,col:'#566475',gap:14});
  d.ensure(120);d.c.fillStyle=l.col;d.c.fillRect(d.M,d.y,d.W-2*d.M,100);d.c.fillStyle='#fff';d.font(36,'bold');d.c.fillText(`Challenge level: ${l.n}  ${'★'.repeat(l.stars)}`,d.M+24,d.y+46);d.font(24);d.c.fillText(capText(S.level),d.M+24,d.y+82);d.y+=118;
  d.text(`Changed: ${c.ivName}${c.isNum?' ('+c.iv.unit+')':''}  ·  Measured: ${c.dv.name} (${c.dv.unit})  ·  ${ENV[S.env]||'—'}, ${String(LAUNCH[S.launch]||'—').toLowerCase()}  ·  Tested: ${S.levels.map(v=>lvlLabel(S.iv,v)).join(', ')}`,{sz:19,col:'#566475',gap:10});
  d.text('A separate feedback sheet shows what the lab checked and what to look at again.',{sz:17,col:'#566475'});
  /* report */
  d.y+=10;d.h2('Observations');d.box('',obsText());
  d.h2('Research question and variables');
  d.box('Research question',rqText());d.box(isMas()?'The science idea behind my question':'More detail',rqExtra());
  d.table(['Independent variable (the variable I am changing)','Dependent variable (the variable I am measuring)'],[[ivTextA()||'(not answered)',dvTextA()||'(not answered)']],[.5,.5]);
  d.h2('Hypothesis');d.box('',hypText());
  d.h2('Plan');
  d.text(`Set-up: ${ENV[S.env]||'—'}; ${LAUNCH[S.launch]||'—'}.  Plane design: ${designKeys().map(k=>SETTING_LABEL[k]+' '+settingText(k,S.design[k])).join('; ')}.`,{sz:18,col:'#566475'});
  const cl=controlsList();d.table(['Control variables','How will I control them?'],[0,1,2].map(i=>[`${i+1}. ${cl[i]?cl[i].name:''}`,cl[i]?cl[i].how:'']),[.4,.6]);
  d.box('Materials',materialsText());
  const ml=methodList();d.box('Method',ml.map((s,i)=>`${i+1}. ${s}`).join('\n'));
  d.h2('Results');
  
  d.text(t1Title()||'Table 1: (no title)',{sz:21,w:'bold'});
  const st=levelStats(),PINK='#fbd9d3';
  d.text(`DV (trials 1–3): ${A('t1.dvh')||'(no heading)'}`,{sz:18,w:'bold',col:'#566475',gap:2});
  d.table([`IV: ${A('t1.ivh')||'(no heading)'}`,'Trial 1','Trial 2','Trial 3',`Average (${A('t1.avgu')||'?'})`],
    st.map(s=>[rowLabel(s.lk),...[0,1,2].map(i=>A('tr.'+String(s.lk)+'.'+i)||'—'),A('avg.'+String(s.lk))||'—']),[.28,.16,.16,.16,.24]);
  d.text('Table 2: Qualitative observations',{sz:21,w:'bold'});
  d.table([`IV: ${A('t1.ivh')||''}`,'What I saw'],S.levels.map(lk=>[rowLabel(lk),A('obs.'+String(lk))||'—']),[.28,.72]);
  d.ensure(GH*(d.W-2*d.M)/GW+80);d.h3('Graph');const g=gInit();
  if(g.type&&gValid(g)){const gc=document.createElement('canvas');gc.width=GW;gc.height=GH;drawGraph(gc.getContext('2d'),g,{fb:false});d.image(gc,d.W-2*d.M)}else d.text('(No graph yet.)',{col:'#9aa7b6'});
  d.h2('Analysis');
  ['q1','q2'].forEach((n,i)=>{d.box(`${i+1}. ${QTXT[n]}`,qText(n))});
  d.h2('Evaluation');
  d.text('How fair was my test?',{sz:20,w:'bold'});
  {d.ensure(90);const x0=d.M+40,w=d.W-2*d.M-80,y=d.y+10;const g=d.c.createLinearGradient(x0,0,x0+w,0);g.addColorStop(0,'#d6402f');g.addColorStop(.5,'#f2a93b');g.addColorStop(1,'#2e7d4f');d.c.fillStyle=g;d.c.fillRect(x0,y,w,26);d.c.strokeStyle='#14202e';d.c.lineWidth=2;d.c.strokeRect(x0,y,w,26);
   d.font(17,'bold');d.c.fillStyle='#14202e';d.c.textAlign='left';d.c.fillText('Very unfair',x0,y+52);d.c.textAlign='center';d.c.fillText('Quite fair',x0+w/2,y+52);d.c.textAlign='right';d.c.fillText('Very fair',x0+w,y+52);d.c.textAlign='left';
   if(A('fair','')!==''){const X=x0+w*Number(A('fair'))/100;d.font(40,'bold');d.c.fillStyle='#fff';d.c.strokeStyle='#000';d.c.lineWidth=4;d.c.textAlign='center';d.c.strokeText('✕',X,y+27);d.c.fillText('✕',X,y+27);d.c.textAlign='left'}
   d.y+=76}
  d.box('Why I put my ✕ there',fairText());
  
  if(helped()){const g=sortSummary(true);d.table(['Human errors','Method errors','Improvements'].concat(isPro()?['Not relevant']:[]),[[ (g.human||[]).join('\n')||'—',(g.method||[]).join('\n')||'—',(g.improve||[]).join('\n')||'—'].concat(isPro()?[(g.irrelevant||[]).join('\n')||'—']:[])],isPro()?[.25,.25,.25,.25]:[.33,.34,.33],{sz:16});}
  else d.table(['Method errors','Improvements'],[[A('ev.m')||'—',A('ev.i')||'—']],[.5,.5],{sz:17});
  ['q3','q4'].forEach((n,i)=>{d.box(`${i+3}. ${QTXT[n]}`,qText(n))});
  const rows=cmpRows().filter(r=>r.p!=null);
  if(compareStarted()){d.h2('Extension: peer review with a partner');
  if(rows.length){d.table(['What I changed','My average',`${S.partner.name||'Partner'}’s average`,'% difference'],cmpRows().map(r=>[lvlLabel(S.iv,r.lk),r.me==null?'—':fmt(r.me,dvDp()),r.p==null?'—':fmt(r.p,dvDp()),r.pct==null?'—':fmt(r.pct,0)+'%']),[.31,.23,.23,.23]);
    const cc=document.createElement('canvas');cc.width=1000;cc.height=380;drawCompare(cc.getContext('2d'),1000,380);d.image(cc,d.W-2*d.M)}
  else d.text('(No partner results entered.)',{col:'#9aa7b6'});
  d.box('Is the experiment reliable?',relText());
  d.h3('Peer check'+(S.peer.name?` by ${S.peer.name}`:''));
  d.text(PEER.map(([k,t])=>(S.peer['ck.'+k]?'✓ ':'☐ ')+t).join('\n'),{sz:19});
  d.box('One thing done well',S.peer.well);d.box('One thing to improve',S.peer.better);
  }
  decorate(d,'Paper Plane Lab: lab report');
  return d.pages;
}
/* the feedback sheet: what the lab checked, what to check, and what really happened */
function buildFeedback(){
  const d=new Doc(),c=cx(),l=LV[S.level],R=rubric();
  /* cover + marking page */
  d.text('Paper Plane Investigation: Feedback Sheet'+(S.attempt>1?` (investigation ${S.attempt})`:''),{sz:40,w:'bold',gap:4});
  d.text(`${S.name}   ·   Class ${S.cls}   ·   ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`,{sz:22,col:'#566475',gap:14});
  d.ensure(120);d.c.fillStyle=l.col;d.c.fillRect(d.M,d.y,d.W-2*d.M,100);d.c.fillStyle='#fff';d.font(36,'bold');d.c.fillText(`Challenge level: ${l.n}  ${'★'.repeat(l.stars)}`,d.M+24,d.y+46);d.font(24);d.c.fillText(capText(S.level),d.M+24,d.y+82);d.y+=118;
  d.text(`Changed: ${c.ivName}${c.isNum?' ('+c.iv.unit+')':''}  ·  Measured: ${c.dv.name} (${c.dv.unit})  ·  ${ENV[S.env]||'—'}, ${String(LAUNCH[S.launch]||'—').toLowerCase()}  ·  Tested: ${S.levels.map(v=>lvlLabel(S.iv,v)).join(', ')}`,{sz:19,col:'#566475',gap:10});
  d.ensure(150);d.text('For my teacher',{sz:17,w:'bold',col:'#566475',gap:4});
  const bw=(d.W-2*d.M-30)/3,cap=CAP_BAND[S.level];[['Criterion B',1],['Criterion C',1],['Teacher comment',0]].forEach((x,i)=>{const X=d.M+i*(bw+15);d.c.strokeStyle='#14202e';d.c.lineWidth=2;d.c.strokeRect(X,d.y,bw,104);d.font(19,'bold');d.c.fillStyle='#14202e';d.c.fillText(x[0]+(x[1]?' (circle one)':''),X+12,d.y+26);
    if(x[1]){d.font(16);BANDS.forEach((b,j)=>{const yy=d.y+46+Math.floor(j/2)*28,xx=X+12+(j%2)*(bw/2-6);if(j>cap)return;d.c.fillStyle='#14202e';d.c.fillText('○ '+b,xx,yy)})}});d.y+=116;
  d.h2('How did I do?');
  {const h=d.rich('The lab checked your report. {g}**✓ Green**{/} shows what you did well. {r}**! Red**{/} shows what to work on. The **level** is a first guess: **your teacher** will read your report and decide your final level.',d.M,d.y,d.W-2*d.M,20,false);d.rich('The lab checked your report. {g}**✓ Green**{/} shows what you did well. {r}**! Red**{/} shows what to work on. The **level** is a first guess: **your teacher** will read your report and decide your final level.',d.M,d.y,d.W-2*d.M,20,true);d.y+=h+14}
  const BOLD=/(How does … affect …\?|IF, THEN and BECAUSE|IF … THEN … BECAUSE …|BECAUSE|units|3 control variables|control variables?|title|axis labels|averages?|pink boxes|numbers|two method errors|method errors?|fairer|reliable|every flight|not fair|supported|pattern|reason)/g;
  const bolden=t=>t.replace(BOLD,'**$1**');
  const BCOL=['#b3301e',LV.developing.col,LV.proficient.col,LV.mastering.col];
  R.forEach(r=>{
    const good=r.ev.filter(e=>e[0]).map(e=>bolden(e[1])),todo=r.b<0?['You have not answered this yet.']:r.ev.filter(e=>!e[0]).map(e=>bolden(e[2]));if(r.up)good.push('{m}Your teacher will check '+r.up+'.{/}');
    const W=d.W-2*d.M,cw=(W-60)/2,sz=17,pad=14,hh=44;
    const colH=(items,empty)=>{let h=30;(items.length?items:[empty]).forEach(t=>{h+=d.rich(t,0,0,cw-30,sz,false)+4});return h};
    const H=hh+Math.max(colH(good,'—'),colH(todo,ALLGOOD()))+pad;
    d.ensure(H+10);const y0=d.y,c=d.c,lvc=r.final>=0?BCOL[r.final]:'#8a96a3';
    c.fillStyle='#fff';c.fillRect(d.M,y0,W,H);c.strokeStyle='#c9d2dc';c.lineWidth=1.5;c.strokeRect(d.M,y0,W,H);
    c.fillStyle='#eef2f6';c.fillRect(d.M,y0,W,hh);c.fillStyle=lvc;c.fillRect(d.M,y0,8,H);
    d.font(21,'bold');c.fillStyle='#14202e';c.fillText(r.d,d.M+22,y0+29);const nw=c.measureText(r.d).width;d.font(15);c.fillStyle='#8a96a3';c.fillText(r.k,d.M+32+nw,y0+29);
    const pill='Level so far: '+bandName(r.final);d.font(17,'bold');const pw=c.measureText(pill).width+26;c.fillStyle=lvc;c.beginPath();c.roundRect(d.M+W-pw-12,y0+8,pw,28,14);c.fill();c.fillStyle='#fff';c.fillText(pill,d.M+W-pw+1,y0+28);
    const col=(x,head,hc,items,empty,mark,mc)=>{let y=y0+hh+10;d.font(17,'bold');c.fillStyle=hc;c.fillText(head,x,y+16);c.fillRect(x,y+21,c.measureText(head).width,2);y+=30;
      (items.length?items:[empty]).forEach(t=>{if(items.length){d.font(sz,'bold');c.fillStyle=mc;c.fillText(mark,x,y+sz)}const h=d.rich(t,x+(items.length?24:0),y,cw-30,sz,true,items.length?'#14202e':empty===ALLGOOD()?'#1f7a45':'#8a96a3');y+=h+4})};
    col(d.M+22,'What I did well','#1f7a45',good,'—','✓','#1f7a45');
    if(todo.length){c.fillStyle='#fdf1ef';c.fillRect(d.M+22+cw+16,y0+hh+4,cw+10,H-hh-10)}
    col(d.M+22+cw+26,'What to work on','#b3301e',todo,ALLGOOD(),'!','#b3301e');
    d.y=y0+H+12});
  const FL=reportFlags();d.ensure(220);
  d.h3(FL.length?`What to check (${FL.length})`:'What to check');
  {const t=FL.length?'Check each of these in your lab report.':'{g}**The lab did not find anything to fix. Well done!**{/}';d.y+=d.rich(t,d.M,d.y,d.W-2*d.M,18,true)+8}
  FL.forEach(f=>{const t=`**${FLAG_SEC[f.sec]}:** ${f.msg}`,h=d.rich(t,0,0,d.W-2*d.M-40,17,false);d.ensure(h+6);const c=d.c;c.fillStyle='#b3301e';c.beginPath();c.arc(d.M+12,d.y+12,12,0,7);c.fill();c.fillStyle='#fff';d.font(16,'bold');c.textAlign='center';c.fillText('!',d.M+12,d.y+18);c.textAlign='left';d.rich(t,d.M+34,d.y,d.W-2*d.M-40,17,true);d.y+=h+6});
  /* Table 1 compared with the real values */
  {const st=levelStats(),PINK='#fbd9d3';d.ensure(260);d.h3('My Table 1 compared with the real values');
   d.text('Pink boxes are readings or averages that do not match where the plane really landed, or the correct average.',{sz:17,col:'#566475'});
   d.table([`IV: ${A('t1.ivh')||'(no heading)'}`,'Trial 1','Trial 2','Trial 3',`Average (${A('t1.avgu')||'?'})`],
    st.map(s=>{const tb=[0,1,2].map(i=>String(A('tr.'+String(s.lk)+'.'+i)).trim()!==''&&!trOK(s.lk,i)),av=String(A('avg.'+String(s.lk))).trim(),ab=av!==''&&!avgOK(s.lk);
      return{cells:[rowLabel(s.lk),...[0,1,2].map(i=>(A('tr.'+String(s.lk)+'.'+i)||'—')+(tb[i]?'   !':'')),(av||'—')+(ab?'   !':'')],fill:[null,...tb.map(b=>b?PINK:null),ab?PINK:null]}}),[.28,.16,.16,.16,.24]);}
  /* appendix for the marker */
  d.newPage();d.h2('Behind the scenes: what really happened');
  d.text('The lab secretly recorded what really happened in each flight. “Typed” is what you wrote in your table. “Real” is the true value. Compare them to see how accurate your measurements were.',{sz:17,col:'#566475'});
  d.table(['#','Tested','Typed (cm)','Real (cm)','Typed (s)','Stopwatch (s)','Real (s)','Angle set','Speed set','Air (m/s)','Note'],S.flights.filter(f=>f.hid).map(f=>[f.n,lvlLabel(S.iv,f.lv),f.read!=null?f.read:'—',f.hid.trueDist,f.timed!=null?Number(f.timed).toFixed(2):'—',f.hid.sw!=null?f.hid.sw.toFixed(2):'—',f.hid.trueTime.toFixed(2),f.hid.aSet+'°',f.hid.vSet,(f.hid.wind>0?'+':'')+f.hid.wind.toFixed(2),[f.gone?'not used':'',f.hid.dive?'nosedive':''].filter(Boolean).join(', ')]),[.05,.12,.09,.09,.09,.1,.08,.08,.08,.09,.13],{sz:14});
  d.text('Method errors that were built into this lab: '+flawsHere().map(k=>FLAWS[k].name).join('; ')+'.',{sz:17});
  decorate(d,'Paper Plane Lab: feedback sheet');
  return d.pages;
}
function exportReport(){
  const m=$('#pdfmsg');if(m)m.textContent='Making your PDF…';
  setTimeout(()=>{try{const pages=buildReport(),blob=pdfFromCanvases(pages,'Paper Plane Lab report - '+S.name);download(`PaperPlaneLab_${safeName()}_${LV[S.level].n}.pdf`,blob);S.exported=true;save();
      if(m)m.textContent='Saved. Look in your Downloads folder, then upload the PDF to Toddle.';setTimeout(()=>{if(S.step==='finish')rerender()},1500)}
    catch(e){console.error(e);if(m)m.textContent='Sorry, the PDF could not be made: '+e.message}},50);
}
function drawStar(c,x,y,r,col){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fillStyle=col;c.fill()}
function buildCert(){
  const W=1754,H=1240,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d'),l=LV[S.level];
  c.fillStyle='#fffdf7';c.fillRect(0,0,W,H);c.strokeStyle=l.col;c.lineWidth=18;c.strokeRect(40,40,W-80,H-80);c.lineWidth=4;c.strokeRect(78,78,W-156,H-156);
  c.textAlign='center';c.fillStyle='#566475';c.font=`bold 34px ${PDF_FONT}`;c.fillText('CERTIFICATE OF COMPLETION',W/2,220);
  c.fillStyle=l.col;c.font=`bold 96px ${PDF_FONT}`;c.fillText('Paper Plane Lab',W/2,340);
  c.fillStyle='#14202e';c.font=`36px ${PDF_FONT}`;c.fillText('This certifies that',W/2,450);
  c.font=`bold 92px ${PDF_FONT}`;c.fillText(S.name,W/2,580);c.fillStyle='#c9d2dc';c.fillRect(W/2-480,610,960,4);
  c.fillStyle='#14202e';c.font=`36px ${PDF_FONT}`;c.fillText('completed a full scientific investigation and lab report at the',W/2,700);
  c.fillStyle=l.col;c.font=`bold 64px ${PDF_FONT}`;c.fillText(`${l.n} level`,W/2,800);
  for(let i=0;i<l.stars;i++)drawStar(c,W/2+(i-(l.stars-1)/2)*90,880,34,l.col);
  c.fillStyle='#566475';c.font=`30px ${PDF_FONT}`;c.fillText(`Class ${S.cls}  ·  ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`,W/2,1010);
  c.save();c.translate(1430,1030);c.rotate(-.25);c.fillStyle='#fff';c.strokeStyle='#4a5565';c.lineWidth=4;c.beginPath();c.moveTo(110,0);c.lineTo(-90,-28);c.lineTo(-55,0);c.lineTo(-90,32);c.closePath();c.fill();c.stroke();c.restore();
  return cv;
}
function exportCert(){download(`PaperPlaneLab_${safeName()}_certificate.pdf`,pdfFromCanvases([buildCert()],'Paper Plane Lab certificate - '+S.name))}
