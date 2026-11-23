/* ===== Acceleration Lab: state, helpers, maths, pop-ups, calculator ===== */
const LAB={title:'Acceleration Lab',code:'ACCELERATION',key:'accel-lab-v1',file:'Acceleration-Lab-offline.html'};
const MS=[1,2,3,4],RAMP_END=2; /* metres 1-2 are on the ramp, 3-4 on the flat */
const COLS={t:'#2563eb',l:'#7c3aed',v:'#15803d',d:'#c2410c',a:'#be123c'};
const SOFT={t:'#dbeafe',l:'#ede9fe',v:'#dcfce7',d:'#ffedd5',a:'#ffe4e6'};
let S=blank();
function blank(){const tr=()=>['','','','',''];return{name:'',cls:'',grade:'',teacher:false,step:0,trials:3,
  T:{1:tr(),2:tr(),3:tr(),4:tr()},leg:{1:'',2:'',3:'',4:''},spd:{1:'',2:'',3:'',4:''},chg:{1:'',2:'',3:'',4:''},
  pred:{ramp:'',flat:''},g:{title:'',xl:'',yl:'',ymin:'',ymax:'',ystep:'',bars:{}},
  fbd:{ramp:{arrows:[]},flat:{arrows:[]}},fq:{},con:{},chk:{}}}
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function num(v){if(v==null)return NaN;const s=String(v).trim().replace(/[−–]/g,'-').replace(/,/g,'');if(s===''||!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s))return NaN;return parseFloat(s)}
const r2=v=>Math.round(v*100)/100;
function fmt(v,dp=2){if(v==null||isNaN(v))return '';const s=(Math.abs(v)<5e-9?0:v).toFixed(dp);return s.replace('-','−')}
const isG6=()=>S.grade==='6';
function save(){try{localStorage.setItem(LAB.key,JSON.stringify(S))}catch(e){}}
function load(){try{const t=localStorage.getItem(LAB.key);if(t){const o=JSON.parse(t),b=blank();S=Object.assign(b,o);['T','leg','spd','chg','pred','g','fbd'].forEach(k=>S[k]=Object.assign(b[k],o[k]||{}))}}catch(e){}}
function getPath(p){return p.split('.').reduce((o,k)=>o==null?o:o[k],S)}
function setPath(p,v){const ks=p.split('.'),last=ks.pop();let o=S;ks.forEach(k=>{if(o[k]==null)o[k]={};o=o[k]});o[last]=v}

/* ---- the maths ---- */
function avgT(k){const v=S.T[k].slice(0,S.trials).map(num).filter(x=>!isNaN(x));return v.length?r2(v.reduce((a,b)=>a+b,0)/v.length):null}
function legCalc(k){const a=avgT(k);if(a==null)return null;if(k===1)return a;const b=avgT(k-1);return b==null?null:r2(a-b)}
function spdCalc(k){const l=num(S.leg[k]);return l>0?1/l:null}
function chgCalc(k){const v=num(S.spd[k]);if(isNaN(v))return null;if(k===1)return v;const p=num(S.spd[k-1]);return isNaN(p)?null:v-p}
/* acceleration (done for the student): change in speed ÷ time between the middles of the two metres */
function gapT(k){const l=num(S.leg[k]);if(!(l>0))return null;if(k===1)return l/2;const p=num(S.leg[k-1]);return p>0?(p+l)/2:null}
function accel(k){const d=num(S.chg[k]),g=gapT(k);return isNaN(d)||g==null?null:d/g}
const near=(a,b)=>a!=null&&!isNaN(a)&&b!=null&&Math.abs(a-b)<=Math.max(0.011,Math.abs(b)*0.01);
function cellOK(kind,k){const v=num(S[kind][k]);if(isNaN(v))return null;const want=kind==='leg'?legCalc(k):kind==='spd'?spdCalc(k):chgCalc(k);return want==null?null:near(v,want)}
function zoneOf(k){return k<=RAMP_END?'ramp':'flat'}
function aTag(k){const a=accel(k);if(a==null)return'';if(k===RAMP_END+1)return'<span class="tag mix">⇄ crosses the bottom of the ramp</span>';return a>0.005?'<span class="tag up">⬆ speeding up</span>':a<-0.005?'<span class="tag down">⬇ slowing down</span>':'<span class="tag mix">steady</span>'}
const aLabel=k=>k===1?'Start → metre 1':`Metre ${k-1} → metre ${k}`;
const aShort=k=>k===1?'Start→M1':`M${k-1}→M${k}`;

/* ---- draggable pop-ups ---- */
function makeDraggable(box,handle){
  let d=null;handle.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=box.getBoundingClientRect();d={dx:e.clientX-r.left,dy:e.clientY-r.top};handle.setPointerCapture(e.pointerId);handle.style.cursor='grabbing'});
  handle.addEventListener('pointermove',e=>{if(!d)return;place(box,e.clientX-d.dx,e.clientY-d.dy)});
  const up=()=>{d=null;handle.style.cursor=''};handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up);
}
function place(box,x,y){const w=box.offsetWidth,h=40;box.style.left=clamp(x,4,Math.max(4,innerWidth-w-4))+'px';box.style.top=clamp(y,4,innerHeight-h)+'px'}
function popup(id,title,html,opts={}){
  let box=document.getElementById(id);
  if(!box){box=document.createElement('div');box.id=id;box.className='pop';document.body.appendChild(box);
    box.innerHTML=`<div class="hd"><span class="grip" aria-hidden="true">⠿</span><span class="ttl"></span><button class="x" aria-label="Close">✕</button></div><div class="bd"></div>`;
    $('.x',box).onclick=()=>{box.remove();if(opts.onClose)opts.onClose()};makeDraggable(box,$('.hd',box));
    const w=Math.min(440,innerWidth*.94);place(box,opts.x!=null?opts.x:innerWidth-w-24,opts.y!=null?opts.y:90)}
  $('.ttl',box).textContent=title;$('.bd',box).innerHTML=html;return box;
}
addEventListener('resize',()=>$$('.pop').forEach(b=>place(b,b.offsetLeft,b.offsetTop)));

/* ---- "?" explanations: simple words, the formula, and the student's own numbers ---- */
const HELP={
  avg:{t:'Average time',c:'t',f:'average = (trial 1 + trial 2 + trial 3) ÷ 3',
    p:['Every person times a little differently, so we do more than one trial.','The app works out the average for you. It is the number you use in the next table.']},
  leg:{t:'Time for one metre on its own',c:'l',f:'time for this metre = time at this mark − time at the last mark',
    p:['The stopwatch kept running from the start, so the time at 3 m includes metres 1, 2 <b>and</b> 3.','To find the time for just one metre, take away the time the cart had already used.','<b>Metre 1 is easy:</b> the cart started at 0 s, so it is just the time at 1 m.']},
  spd:{t:'Speed in each metre',c:'v',f:'speed = distance ÷ time = 1 ÷ time for that metre',
    p:['Speed tells you how many metres the cart moves every second (m/s).','Each piece of track is exactly 1 metre long, so you just do <b>1 ÷ the time</b>.','A <b>smaller</b> time means a <b>bigger</b> speed: the cart was faster.']},
  chg:{t:'Change in speed',c:'d',f:'change in speed = this speed − the speed before',
    p:['This tells you if the cart got faster or slower from one metre to the next.','<b>Plus number (+):</b> it got faster. <b>Minus number (−):</b> it got slower.','<b>Metre 1:</b> the cart started still (0 m/s), so the change is just its speed in metre 1.']},
  acc:{t:'Acceleration (we do this for you)',c:'a',f:'acceleration = change in speed ÷ time it took to change',
    p:['Acceleration is how much the speed changes <b>every second</b>. Its unit is m/s² ("metres per second, every second").','Your speed for a metre is the cart\'s speed in the <b>middle</b> of that metre\'s time.','So the time between two speeds is <b>half</b> of one metre\'s time + <b>half</b> of the next metre\'s time.','<b>+</b> means speeding up. <b>−</b> means slowing down.']}
};
function helpEx(kind,k){
  const f=v=>fmt(v);k=k||3;
  if(kind==='leg'){const a=avgT(k),b=avgT(k-1);return a!=null&&b!=null?`Your metre ${k}: ${f(a)} − ${f(b)} = <b>${f(a-b)} s</b>`:''}
  if(kind==='spd'){const l=num(S.leg[k]);return l>0?`Your metre ${k}: 1 ÷ ${f(l)} = <b>${f(1/l)} m/s</b>`:''}
  if(kind==='chg'){const a=num(S.spd[k]),b=num(S.spd[k-1]);return !isNaN(a)&&!isNaN(b)?`Your metre ${k}: ${f(a)} − ${f(b)} = <b>${f(a-b)} m/s</b>`:''}
  if(kind==='acc'){const d=num(S.chg[k]),l1=num(S.leg[k-1]),l2=num(S.leg[k]);return !isNaN(d)&&l1>0&&l2>0?`${aLabel(k)}:<br>time between the middles = ${f(l1)} ÷ 2 + ${f(l2)} ÷ 2 = ${f((l1+l2)/2)} s<br>acceleration = ${f(d)} ÷ ${f((l1+l2)/2)} = <b>${f(d/((l1+l2)/2))} m/s²</b>`:''}
  return '';
}
function showHelp(kind){const h=HELP[kind],ex=helpEx(kind);
  popup('pophelp','? '+h.t,`<div class="key"><span class="k ${h.c}">${esc(h.t)}</span></div><div class="formula">${esc(h.f)}</div>${h.p.map(x=>`<p>${x}</p>`).join('')}${ex?`<div class="tip">${ex}</div>`:''}`)}

/* ---- calculator (floating, draggable; can put its answer in the last box you used) ---- */
let CALC='',lastBox=null;
document.addEventListener('focusin',e=>{if(e.target.matches('input.n'))lastBox=e.target});
function calcOpen(){
  const keys=['C','(',')','⌫','7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'];
  const box=popup('popcalc','🧮 Calculator',`<div class="calcd" id="calcd">${esc(CALC||'0')}</div><div class="calc">${keys.map(k=>`<button data-ck="${k}" class="${/[÷×−+()]/.test(k)?'op':k==='='?'eq':''}">${k}</button>`).join('')}</div>
    <button class="btn" id="calcput" style="margin-top:8px;width:100%">↓ Put the answer in the box I was using</button><p class="note" style="margin:6px 0 0">You can also type: x or * for ×, / for ÷.</p>`,{x:innerWidth-330,y:innerHeight-520});
  box.style.width='300px';
  $$('[data-ck]',box).forEach(b=>b.onclick=()=>calcKey(b.dataset.ck));
  $('#calcput',box).onclick=()=>{const v=calcVal();if(lastBox&&v!=null&&document.body.contains(lastBox)){lastBox.value=fmt(v).replace('−','-');lastBox.dispatchEvent(new Event('input',{bubbles:true}));lastBox.dispatchEvent(new Event('change',{bubbles:true}))}};
  box.tabIndex=-1;box.onkeydown=e=>{if(e.target.tagName==='INPUT')return;const m={'*':'×','x':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Escape':'C'};const k=m[e.key]||e.key;if(/^[0-9.+()]$/.test(k)||'×÷−=⌫C'.includes(k)){e.preventDefault();calcKey(k)}};
}
function calcVal(){try{const s=CALC.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');if(!/^[0-9.+\-*/() ]+$/.test(s))return null;const v=Function('return ('+s+')')();return isFinite(v)?v:null}catch(e){return null}}
function calcKey(k){
  if(k==='C')CALC='';else if(k==='⌫')CALC=CALC.slice(0,-1);
  else if(k==='='){const v=calcVal();CALC=v==null?'Error':String(Math.round(v*10000)/10000).replace('-','−')}
  else{if(CALC==='Error')CALC='';CALC+=k}
  const d=$('#calcd');if(d)d.textContent=CALC||'0';
}
