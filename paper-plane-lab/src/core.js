/* ===== CORE: state, levels, content, data helpers ===== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(v,dp=1)=>v==null||isNaN(v)?'':(Math.round(v*Math.pow(10,dp))/Math.pow(10,dp)).toFixed(dp).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');
const words=t=>(String(t||'').trim().match(/\S+/g)||[]).length;

/* ---- challenge levels. Each level is capped at the grade it is named after; Einstein is an extra challenge capped at Mastering. ---- */
const BANDS=['Beginning','Developing','Proficient','Mastering'];
const CAP_BAND={developing:1,proficient:2,mastering:3,einstein:3};
const LV={
 developing:{n:'Developing',col:'#1f8f5f',idx:0,stars:1,
  help:['Sentences with gaps for you to fill in, like the lab report template','Tips on every page','A "Check my answer" button that tells you exactly what to fix'],
  say:'Lots of help'},
 proficient:{n:'Proficient',col:'#1b7ea6',idx:1,stars:2,
  help:['Sentence starters to help you write','Some tips','A "Check my answer" button gives quick feedback'],
  say:'Some help'},
 mastering:{n:'Mastering',col:'#8a3fb8',idx:2,stars:3,
  help:['You write your own answers with very few hints','Use your notebook to remember how to write a hypothesis, make a graph and evaluate a lab','No answer checking'],
  say:'A few hints'},
 einstein:{n:'Einstein',col:'#c98400',idx:3,stars:4,
  help:['An extra challenge to test yourself','No hints and no answer checking','Just you, the lab and what you already know'],
  say:'No help at all'}
};
const LVI=['developing','proficient','mastering','einstein'];
const capText=l=>l==='einstein'?'Highest grade: Mastering (extra challenge)':'Highest grade: '+BANDS[CAP_BAND[l]];
const isL=(...a)=>a.includes(S.level);
const isDev=()=>S.level==='developing',isPro=()=>S.level==='proficient',isMas=()=>S.level==='mastering',isEin=()=>S.level==='einstein';
const helped=()=>isDev()||isPro();   /* levels that get answer checking */
const STEPS=[['observe','Observe'],['question','Question'],['hypothesis','Hypothesis'],['plan','Plan'],['lab','Test flights'],['results','Results'],['conclusion','Analysis'],['evaluate','Evaluation'],['finish','Finish'],['extend','★ Extensions']];

/* ---- state ---- */
const KEY='paperPlaneLab_v1';
function blank(){return{v:1,name:'',cls:'',level:null,started:false,seed:0,step:'start',iv:null,dv:null,levels:[],a:{},tries:{},flights:[],planes:{},fc:0,labLevel:null,graph:null,ck:{},exported:false,created:Date.now(),revealed:false,design:Object.assign({},DEFAULTS),exp:Object.assign({},DEFAULTS,{env:'inside',launch:'hand'}),expN:0,expLog:[],env:null,launch:null,partner:{name:'',mode:'',avgs:{},code:null},peer:{},archive:[],attempt:1,seen:{}}}
let S=blank();
let saveT=null;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}},250)}
function loadSaved(){try{const t=localStorage.getItem(KEY);return t?JSON.parse(t):null}catch(e){return null}}
const A=(k,d='')=>S.a[k]==null?d:S.a[k];
const setA=(k,v)=>{S.a[k]=v;save()};

/* ---- content for the chosen variables ---- */
const IVX={
 span:{main:/span/i,desc:'How wide the wings are (6 to 16 cm).',manip:'trim the wings to a different wingspan (in cm) for each test',
  reasons:['wider wings catch more air, so there is more lift','wider wings make more air resistance, which slows the plane down','wider wings use more paper, so the plane gets heavier'],
  kw:/wing|span|wide|width|narrow|big|large|small/},
 clips:{main:/how many|number of (paper )?clips|amount of clips/i,desc:'How many paper clips are on the nose (0 to 5).',manip:'put a different number of paper clips on the nose for each test',
  reasons:['extra weight on the nose helps the plane keep going','extra weight makes the plane heavier, so it falls faster','weight at the nose keeps the plane pointing forward'],
  kw:/clip|weight|mass|heav|nose/},
 angle:{main:/angle/i,desc:'The angle you launch the plane at (-10° to 50°).',manip:'launch the plane at a different angle (in degrees) for each test',
  reasons:['a higher angle lets the plane climb and glide for longer','a steep angle makes the plane lose speed and stall','pointing down makes the plane hit the floor sooner'],
  kw:/angle|degree|°|steep|upward|tilt|point/},
 speed:{main:/speed|how (fast|hard)/i,desc:'How fast you throw (3 to 9 m/s).',manip:'throw the plane at a different speed (in m/s) for each test',
  reasons:['a faster throw gives the plane more energy','a faster throw means more air resistance','a gentle throw lets the plane glide smoothly'],
  kw:/speed|fast|slow|throw|force|hard|velocity|push|gentle/},
 design:{main:/design|shape of the plane|type of plane/i,desc:'Seven designs, from the Dart to the Delta wing.',manip:'fly a different plane design for each test',
  reasons:['a narrow, pointed plane cuts through the air with less air resistance','wide wings give more lift, so the plane floats for longer','a short, wide plane is not steady and tumbles'],
  kw:/design|shape|dart|glider|stunt|classic|plane type|type of plane|narrow|wide/},
 paper:{main:/type of paper|kind of paper|paper type|material/i,desc:'Six kinds, from tissue paper to thin card.',manip:'make the plane from a different type of paper for each test',
  reasons:['heavier paper carries more momentum, so it keeps going','lighter paper floats for longer','thin, floppy paper bends and makes more air resistance'],
  kw:/paper|card|newspaper|material|baking|printer|heav|light/},
 tips:{main:/tip/i,desc:'Folded up, flat, folded down, or one of each.',manip:'fold the wing tips up, flat or down for each test',
  reasons:['wing tips folded up keep the plane steady','flat wings give the most lift','wing tips folded down make the plane wobble'],
  kw:/tip|fold|wing|flat|up|down/},
 clippos:{main:/position|where the (paper )?clip|place of the clip/i,desc:'No clip, or one clip on the nose, middle or tail.',manip:'put the paper clip in a different place for each test',
  reasons:['weight at the nose keeps the plane pointing forward','weight in the middle changes very little','weight at the tail makes the nose rise and the plane stall'],
  kw:/clip|position|place|nose|tail|middle|where|weight/}
};
const DVX={
 dist:{name:'Distance flown',lower:'distance flown',unit:'cm',phrase:'the distance a paper plane flies',short:'distance',
  how:'measure how far the plane flew with the tape measure, reading where the nose lands to the nearest 10 cm',tool:'tape measure',kw:/distance|far|long way|metre|meter|cm|travel|fly|flies|flew|flown|length/},
 time:{name:'Flight time',lower:'flight time',unit:'s',phrase:'the time a paper plane stays in the air',short:'time',
  how:'time each flight with the stopwatch, pressing Start when the plane is released and Stop when it lands',tool:'stopwatch',kw:/time|second|long|stay|air|flight|duration|hang/}
};
function cx(){const iv=IVS[S.iv],dv=DVX[S.dv],x=IVX[S.iv];return{iv,dv,x,key:S.iv,isNum:iv.type==='num',ivName:iv.label,ivLower:iv.lower}}
function lvlLabel(k,v){const iv=IVS[k];if(iv.type==='cat')return String(v);if(iv.unit==='°')return v+'°';if(iv.unit==='clips')return v+(Number(v)===1?' clip':' clips');return v+' '+iv.unit}
const rowLabel=v=>IVS[S.iv].type==='num'?String(v):String(v);
const ivUnitTxt=()=>{const iv=IVS[S.iv];return iv.type==='num'?iv.unit:''};
const dvUnitTxt=()=>DVX[S.dv].unit;
const dvHeading=()=>DVX[S.dv].name+' ('+dvUnitTxt()+')';
const ivHeading=()=>IVS[S.iv].label+(IVS[S.iv].type==='num'?' ('+IVS[S.iv].unit+')':'');
const evenPick=(arr,n)=>{if(arr.length<=n)return arr.slice();const o=[];for(let i=0;i<n;i++)o.push(arr[Math.round(i*(arr.length-1)/(n-1))]);return o};
const minLevels=()=>3;

/* ---- flight data ---- */
const live=()=>S.flights.filter(f=>!f.gone);
const fvals=lk=>live().filter(f=>f.lv===lk);
const fval=f=>S.dv==='dist'?f.read:f.timed;
function levelStats(){return S.levels.map(lk=>{const vs=fvals(lk).map(fval).filter(v=>v!=null);const m=vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:null;return{lk,vs,m,n:fvals(lk).length}})}
const dvDp=()=>S.dv==='dist'?1:2;
function trialsDone(){if(!S.iv||!S.levels.length)return false;return levelStats().every(s=>s.n>=3)}
const flightsExpected=()=>S.levels.length*3;

/* what the data shows (used for Developing checks and for the marker's summary) */
function trendOf(){
  const st=levelStats().filter(s=>s.m!=null);if(st.length<2)return{kind:'none'};
  const isNum=IVS[S.iv].type==='num',ys=st.map(s=>s.m),n=ys.length;
  const mx=Math.max(...ys),mn=Math.min(...ys),range=mx-mn,mean=ys.reduce((a,b)=>a+b,0)/n;
  const iMax=ys.indexOf(mx),iMin=ys.indexOf(mn);
  const best=st[iMax],worst=st[iMin];
  if(!isNum){return{kind:range<0.06*mean?'flat':'cat',best,worst,range,st}}
  if(range<0.06*mean)return{kind:'flat',best,worst,range,st};
  {const xs=st.map(s=>Number(s.lk)),mx_=xs.reduce((a,b)=>a+b,0)/n,my_=mean;let sxy=0,sxx=0,syy=0;xs.forEach((x,i)=>{sxy+=(x-mx_)*(ys[i]-my_);sxx+=(x-mx_)**2;syy+=(ys[i]-my_)**2});const r=sxy/Math.sqrt(sxx*syy||1);
   if(r>0.8)return{kind:'up',best,worst,range,st,r};if(r<-0.8)return{kind:'down',best,worst,range,st,r}}
  let up=0,down=0;for(let i=0;i<n-1;i++){const d=ys[i+1]-ys[i];if(d>0.04*range)up++;else if(d<-0.04*range)down++}
  const edge=Math.max(ys[0],ys[n-1]);
  if(iMax>0&&iMax<n-1&&mx-edge>0.3*range)return{kind:'peak',best,worst,range,st};
  const edgeMin=Math.min(ys[0],ys[n-1]);
  if(iMin>0&&iMin<n-1&&edgeMin-mn>0.3*range)return{kind:'dip',best,worst,range,st};
  if(up>0&&up>=down*2&&ys[n-1]>ys[0])return{kind:'up',best,worst,range,st};
  if(down>0&&down>=up*2&&ys[n-1]<ys[0])return{kind:'down',best,worst,range,st};
  return{kind:'mixed',best,worst,range,st};
}
function trendSentence(t){
  const c=cx(),d=c.dv.lower,v=c.ivLower;
  switch(t.kind){
   case'up':return`As the ${v} increased, the ${d} increased.`;
   case'down':return`As the ${v} increased, the ${d} decreased.`;
   case'flat':return`Changing the ${v} made very little difference to the ${d}.`;
   case'peak':return`The ${d} was greatest in the middle (at ${lvlLabel(S.iv,t.best.lk)}) and was smaller at both ends.`;
   case'dip':return`The ${d} was smallest in the middle (at ${lvlLabel(S.iv,t.worst.lk)}) and was greater at both ends.`;
   case'cat':return`${t.best.lk} had the greatest ${d} and ${t.worst.lk} had the smallest.`;
   case'mixed':return`The ${d} went up and down with no clear pattern.`;
  }return'There is not enough data yet.';
}

/* ---- the flaws built into the lab ---- */
const FLAWS={
 timer:{name:'Human reaction time on the stopwatch',pick:'My stopwatch times were affected by how quickly I pressed Start and Stop.',
   kw:/timer|stopwatch|react|click|press|human error|slow to|timing/i,
   fix:['Film the flight and time it from the video, or use a timer that starts and stops by itself','Press the buttons harder','Time each flight only once'],fixwhy:'A video or automatic timer removes your reaction time.',
   why:'You cannot press Start and Stop at exactly the right moment. Your reaction time is about a fifth of a second, and it changes each time.'},
 throw:{name:'Every throw was a little different',pick:'Every throw was a little different, even with the same settings.',
   kw:/throw|launch|force|strength|push|inconsisten|different speed|angle varied|not the same speed/i,
   fix:['Use a launcher, such as a rubber band, so every launch has the same speed and angle','Throw as hard as I can every time','Let a different student throw each time'],fixwhy:'A launcher repeats the same push each time.',
   why:'Each throw had a tiny random change in speed and angle, as a real hand would. This is why repeating each test three times matters.'},
 draft:{name:'Moving air pushed the planes',pick:'The air in the room was not still, so something pushed the planes.',
   kw:/draft|wind|air current|fan|air movement|breeze|vent|ribbon|streamer|door|moving air|still air/i,
   fix:['Test inside with doors and windows closed and fans switched off','Test outside on a windy day','Ignore it'],fixwhy:'Still air gives a fair test.',
   why:'Moving air pushed the planes towards or away from the far end, and it kept changing. Inside it was a gentle draft from the vent. Outside it was stronger wind with gusts.'},
 fold:{name:'The planes were not folded identically',pick:'Two planes that should be the same were not folded exactly the same.',
   kw:/fold|identical|same plane|built|shape|crease|made differently|each plane|different plane|not exactly the same/i,
   fix:['Use a template and fold every plane the same way','Fold each plane as quickly as possible','Use a different size of paper each time'],fixwhy:'A template makes each plane closer to identical.',
   why:'Each new plane had a small random fold error, so it flew a little better or worse than a perfect copy.'},
 tape:{name:'Reading the tape needed an estimate',pick:'The tape measure only showed marks every 10 cm, so I had to estimate the last digit.',
   kw:/tape|ruler|measur|nearest|precis|round|10 ?cm|reading|resolution|read the/i,
   fix:['Use a tape measure with marks every 1 cm','Guess the distance by eye','Round to the nearest metre'],fixwhy:'Smaller marks give more precise readings.',
   why:'The tape only had marks every 10 cm, so the last digit of every reading was an estimate. Estimates can be a few centimetres out.'},
 mass:{name:'Changing the variable also changed the mass',pick:'When I changed the variable, the mass of the plane changed too, so two things changed at once.',
   kw:/mass|weight|heavier|lighter|heavy|gram/i,
   fix:['Weigh each plane and keep the mass the same, for example by adding paper clips to the lighter ones','Use a bigger plane','Do not weigh the planes'],fixwhy:'Keeping the mass the same means only one thing changes.',
   why:'A plane with bigger wings uses more paper, so its mass changed as well as its wingspan. That is two variables changing together.'},
 control:{name:'A control variable changed between flights',pick:'I changed the launch angle or throw speed partway through, so it was not a fair test.',
   kw:/changed the (launch )?angle|changed the (throw )?speed|not the same angle|different angle|different speed|moved the slider/i,
   fix:['Set the angle and speed once and do not touch them until every flight is done','Change them whenever I like','Only change them for the best plane'],fixwhy:'Keeping controls the same is what makes it fair.',
   why:'The launch angle or throw speed was changed between recorded flights, so more than one thing changed.'},
 band:{name:'The rubber band lost its stretch',pick:'The launcher got weaker as the rubber band was used more and more.',
   kw:/band|stretch|loose|elastic|launcher (got|was|became) weak|weaker launch|lost (its )?power/i,
   fix:['Use a new rubber band, or check the launch power before each group','Pull the band back further on later launches by guessing','Use the same old band for every test'],fixwhy:'A fresh band gives every plane the same launch.',
   why:'Each launch stretched the rubber band a little, so later planes were launched slightly more weakly. Groups tested later had a small disadvantage.'},
 outlier:{name:'An odd flight (a nosedive)',pick:'One flight did something strange and did not match the others.',
   kw:/outlier|anomal|odd|nosedive|dive|crash|strange|different from the (rest|others)|unusual|did not match/i,
   fix:['Repeat the flight and take more trials, then use the average','Delete every trial','Only use the best flight'],fixwhy:'More trials make one odd flight matter less.',
   why:'Sometimes a plane nosedived for no clear reason. Real planes do this too.'}
};
function flawsHere(){
  const L=live(),o=[];
  if(L.some(f=>f.timed!=null))o.push('timer');
  o.push('throw','draft','fold','tape');
  if(S.iv==='span'||S.iv==='design')o.push('mass');
  if(L.some(f=>f.hid&&f.hid.dive))o.push('outlier');
  if(S.launch==='launcher'&&L.some(f=>f.hid&&f.hid.power<0.96))o.push('band');
  if(typeof unfairFlights==='function'&&unfairFlights().length)o.push('control');
  return o;
}
const FALSE_PICKS=['I used a different tape measure for every flight.','The planes were different colours.','I forgot to write my name on the plane.'];

/* ---- keyword helpers (used by the helpful checks and the marking page) ---- */
const hasIV=t=>IVX[S.iv].kw.test(String(t||'').toLowerCase());
const mentionsIV=t=>hasIV(t)||(IVS[S.iv].type==='cat'&&IVS[S.iv].cats.some(c=>String(t||'').toLowerCase().includes(c.toLowerCase().replace(/ (paper|plane)$/,''))));
const hasDV=t=>DVX[S.dv].kw.test(String(t||'').toLowerCase());
const nums=t=>(String(t||'').match(/-?\d+(\.\d+)?/g)||[]).map(Number);
function usesData(t){
  const vals=new Set();levelStats().forEach(s=>{if(s.m!=null){vals.add(Math.round(s.m));vals.add(Math.round(s.m*10)/10)}s.vs.forEach(v=>vals.add(v))});
  const ns=nums(t);let hit=0;ns.forEach(n=>{for(const v of vals){if(Math.abs(n-v)<=Math.max(.06,Math.abs(v)*.03)){hit++;break}}});return hit;
}
