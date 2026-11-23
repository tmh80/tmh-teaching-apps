/* ===== Free body diagrams (adapted from Force HQ's builder): the cart on the ramp and on the flat ===== */
const BW=520,BH=400,BCX=260,BCY=200,TH=20*Math.PI/180;
const VEC={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0],dslope:[Math.cos(TH),Math.sin(TH)],uslope:[-Math.cos(TH),-Math.sin(TH)],nout:[Math.sin(TH),-Math.cos(TH)],nin:[-Math.sin(TH),Math.cos(TH)]};
const DIRWORD={up:'straight up',down:'straight down',left:'backwards',right:'forwards',dslope:'down the slope',uslope:'up the slope',nout:'out of the ramp, at right angles to it',nin:'into the ramp'};
const FT={weight:{n:'Weight (gravity)',c:'#1e3a8a'},normal:{n:'Normal force (support)',c:'#0f766e'},friction:{n:'Friction',c:'#b45309'},airres:{n:'Air resistance',c:'#64748b'},forward:{n:'Forward force',c:'#db2777'}};
const SCEN={
  ramp:{t:'On the ramp',dirs:['up','down','left','right','dslope','uslope','nout','nin'],need:{weight:'down',normal:'nout',friction:'uslope'},opt:{airres:'uslope'},tilt:TH},
  flat:{t:'On the flat',dirs:['up','down','left','right'],need:{weight:'down',normal:'up',friction:'left'},opt:{airres:'left'},tilt:0}};
const MODEL={ramp:[['weight','down',150],['normal','nout',140],['friction','uslope',45]],flat:[['weight','down',130],['normal','up',130],['friction','left',70]]};
function sceneArt(s){
  const sc=SCEN[s],deg=sc.tilt*180/Math.PI,gy=BCY+34;
  const ground=s==='ramp'?`<g transform="rotate(${deg} ${BCX} ${BCY})"><rect x="-200" y="${gy}" width="${BW+400}" height="300" fill="#f3e3c3" stroke="#c9a96b" stroke-width="3"/></g>`:`<rect x="0" y="${gy}" width="${BW}" height="${BH}" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3"/>`;
  const cart=`<g transform="rotate(${deg} ${BCX} ${BCY})"><rect x="${BCX-56}" y="${BCY-24}" width="112" height="44" rx="7" fill="#fecdd3" stroke="#be123c" stroke-width="3"/><circle cx="${BCX-32}" cy="${BCY+24}" r="10" fill="#14202e"/><circle cx="${BCX+32}" cy="${BCY+24}" r="10" fill="#14202e"/></g>`;
  const mv=s==='ramp'?`<g opacity=".55"><line x1="40" y1="60" x2="150" y2="100" stroke="#14202e" stroke-width="3" stroke-dasharray="6 5"/><polygon points="160,104 140,104 148,90" fill="#14202e"/><text x="40" y="44" font-size="15" fill="#14202e">moving this way</text></g>`
    :`<g opacity=".55"><line x1="${BW-170}" y1="40" x2="${BW-50}" y2="40" stroke="#14202e" stroke-width="3" stroke-dasharray="6 5"/><polygon points="${BW-38},40 ${BW-54},31 ${BW-54},49" fill="#14202e"/><text x="${BW-170}" y="26" font-size="15" fill="#14202e">moving this way</text></g>`;
  return ground+cart+mv;
}
function arrowSVG(a,off=0){
  /* off: sideways shift so two forces pointing the same way sit side by side instead of on top of each other */
  const [dx,dy]=VEC[a.dir],px=-dy*off,py=dx*off,x1=BCX+px,y1=BCY+py,x2=x1+dx*a.len,y2=y1+dy*a.len,hs=14,c=a.type?FT[a.type].c:'#7a8a92';
  const t=a.type?FT[a.type].n:'Tap to label',tw=t.length*8.4;let anc=dx>.3?'start':dx<-.3?'end':'middle',lx=x2+dx*14,ly;
  /* labels go on the outside of a side-by-side pair, so they never sit on top of each other */
  if(Math.abs(dy)<.5)ly=y2+(off?(py>0?18:-9):-10);
  else if(Math.abs(dx)<=.3&&off){anc=px>0?'start':'end';lx=x2+(px>0?9:-9);ly=y2+dy*10+5}
  else ly=y2+dy*18+4+(off?(py>0?7:-7):0);
  /* keep every label inside the box */
  const lo=anc==='start'?lx:anc==='end'?lx-tw:lx-tw/2;let sh=0;if(lo<6)sh=6-lo;if(lo+tw>BW-6)sh=-(lo+tw-(BW-6));lx+=sh;
  if(Math.abs(sh)>8&&anc!=='middle')ly+=ly>BH-40?-24:22; /* pushed back inside the box: move it clear of the arrow head */
  ly=clamp(ly,18,BH-8);
  return`<g class="farr" data-id="${a.id}"><line x1="${x1}" y1="${y1}" x2="${x2-dx*hs*.7}" y2="${y2-dy*hs*.7}" stroke="${c}" stroke-width="6" stroke-linecap="round" ${a.type?'':'stroke-dasharray="8 6"'}/>
   <polygon points="${x2},${y2} ${x2-dx*hs-dy*hs*.55},${y2-dy*hs+dx*hs*.55} ${x2-dx*hs+dy*hs*.55},${y2-dy*hs-dx*hs*.55}" fill="${c}"/>
   <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="24"/><circle cx="${x2}" cy="${y2}" r="13" fill="transparent" class="ftip"/>
   <text x="${lx}" y="${ly}" text-anchor="${anc}" font-size="15" font-weight="700" fill="${c}" paint-order="stroke" stroke="#fffaf2" stroke-width="4">${esc(t)}</text></g>`;
}
function arrowsSVG(arrows){const by={};arrows.forEach(a=>(by[a.dir]=by[a.dir]||[]).push(a));
  /* longest first, so short arrows are drawn on top; same-direction arrows are spread 22 px apart */
  return arrows.slice().sort((p,q)=>q.len-p.len).map(a=>{const g=by[a.dir],i=g.indexOf(a);return arrowSVG(a,(i-(g.length-1)/2)*22)}).join('')}
function fbdSVG(s,arrows,opts={}){
  return`<svg viewBox="0 0 ${BW} ${BH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Free body diagram: the cart ${SCEN[s].t.toLowerCase()}"><rect width="${BW}" height="${BH}" fill="#fffaf2"/>${sceneArt(s)}
   ${opts.noDot?'':`<circle cx="${BCX}" cy="${BCY}" r="8" fill="#e3a51c" stroke="#14202e" stroke-width="2"/>`}${arrowsSVG(arrows)}</svg>`;
}
const modelArrows=s=>MODEL[s].map(([type,dir,len],i)=>({id:'m'+i,type,dir,len}));
function fbdCheck(s,arrows){
  const sc=SCEN[s],r={items:[]},has=t=>arrows.filter(a=>a.type===t);
  const missing=Object.keys(sc.need).filter(t=>!has(t).length);
  const extra=arrows.filter(a=>!a.type||!(a.type in sc.need||a.type in sc.opt));
  const wrong=Object.keys(sc.need).concat(Object.keys(sc.opt)).filter(t=>has(t).some(a=>a.dir!==(sc.need[t]||sc.opt[t])));
  const L=t=>Math.max(0,...has(t).map(a=>a.len));
  let lenOK=true,lenMsg='';
  if(!missing.length){
    if(s==='flat'&&Math.abs(L('weight')-L('normal'))>Math.max(L('weight'),L('normal'))*.18){lenOK=false;lenMsg='On the flat, the floor holds the cart up exactly as hard as gravity pulls it down. Make the weight and normal force arrows the same length.'}
    else if(s==='ramp'&&L('normal')>=L('weight')){lenOK=false;lenMsg='On a slope, the ramp pushes back a little less than the full weight. Make the normal force arrow a bit shorter than the weight arrow.'}
    else if(L('friction')>=L('weight')*.8){lenOK=false;lenMsg='Friction on a cart with wheels is small. Make the friction arrow clearly shorter than the weight arrow.'}}
  r.items=[['All the forces are there',!missing.length],['No extra forces',!extra.length],['Arrows point the right way',!wrong.length],['Arrow lengths make sense',!missing.length&&lenOK]];
  r.ok=r.items.every(x=>x[1]);
  const fw=extra.find(a=>a.type==='forward');
  r.msg=r.ok?'Every check is green. Great diagram!':
    fw?'Look again at the forward force. Once the cart is moving, nothing is pushing it forwards. It keeps moving on its own, and forces only change its speed.':
    extra.some(a=>!a.type)?'One arrow has no label. Tap it and choose which force it is.':
    missing.length?({weight:'Every object on Earth has weight. Which way does gravity pull?',normal:`What does the ${s==='ramp'?'ramp':'floor'} do? It pushes back on the cart, at right angles to its surface.`,friction:'The wheels and axles rub as the cart moves. Which force always acts against the movement?'})[missing[0]]:
    extra.length?`Is the ${FT[extra[0].type].n.toLowerCase()} really acting on the cart here?`:
    wrong.length?`Check the ${FT[wrong[0]].n.toLowerCase()} arrow. It should point ${DIRWORD[sc.need[wrong[0]]||sc.opt[wrong[0]]]}.`:lenMsg;
  return r;
}
function fbdMount(host,s){
  const st=S.fbd[s];st.arrows=st.arrows||[];let nid=st.arrows.length+1,hist=[];
  host.innerHTML=`<div class="board"></div><div class="chips fck" style="margin-top:6px"></div><div class="fb ffb" hidden></div>
   <div class="navrow" style="margin-top:6px;justify-content:flex-start"><button class="btn go fchk">Check my diagram</button><button class="btn sm fundo">↶ Undo</button><button class="btn sm fclr">Clear</button><button class="btn sm fmodel" ${st.tries?'':'hidden'}>👀 Show me a model diagram</button></div>`;
  const board=$('.board',host),fb=$('.ffb',host);let dr=null,menu=null;
  const draw=()=>{board.innerHTML=fbdSVG(s,st.arrows);const res=st.tries?fbdCheck(s,st.arrows):null;$('.fck',host).innerHTML=(res?res.items:fbdCheck(s,[]).items).map(([t,ok])=>`<span class="ck ${res&&ok?'on':''}">${res&&ok?'✓ ':''}${t}</span>`).join('')};
  const persist=()=>{save();chrome()};
  const toSvg=e=>{const r=board.querySelector('svg').getBoundingClientRect();return{x:(e.clientX-r.left)*BW/r.width,y:(e.clientY-r.top)*BH/r.height}};
  const snap=(dx,dy)=>{let best=null,bv=-2;const L=Math.hypot(dx,dy)||1;SCEN[s].dirs.forEach(d=>{const v=(VEC[d][0]*dx+VEC[d][1]*dy)/L;if(v>bv){bv=v;best=d}});return best};
  const closeMenu=()=>{if(menu){menu.remove();menu=null}};
  const openMenu=a=>{closeMenu();const sv=board.querySelector('svg').getBoundingClientRect(),k=sv.width/BW,[dx,dy]=VEC[a.dir];
    menu=document.createElement('div');menu.className='amenu';
    menu.innerHTML=`<button class="x" aria-label="Close">✕</button><b>Which force is this?</b>${Object.entries(FT).map(([t,v])=>`<button class="chip ${a.type===t?'sel':''}" data-t="${t}" style="text-align:left">${v.n}</button>`).join('')}<button class="btn sm mrem">🗑 Remove arrow</button>`;
    board.appendChild(menu);const mw=240,tx=(BCX+dx*a.len)*k,ty=(BCY+dy*a.len)*k;
    menu.style.left=clamp(tx+(dx<0?-mw-10:10),4,sv.width-mw-4)+'px';menu.style.top=clamp(ty-60,4,Math.max(4,sv.height-menu.offsetHeight-4))+'px';
    $$('[data-t]',menu).forEach(b=>b.onclick=()=>{hist.push(JSON.stringify(st.arrows));a.type=b.dataset.t;closeMenu();draw();persist()});
    $('.mrem',menu).onclick=()=>{hist.push(JSON.stringify(st.arrows));st.arrows=st.arrows.filter(x=>x!==a);closeMenu();draw();persist()};
    $('.x',menu).onclick=closeMenu};
  board.addEventListener('pointerdown',e=>{if(e.target.closest('.amenu'))return;closeMenu();const p=toSvg(e),tip=e.target.closest('.ftip'),hit=e.target.closest('.farr');
    if(tip){dr={mode:'tip',a:st.arrows.find(x=>x.id===tip.parentNode.dataset.id),moved:false};board.setPointerCapture(e.pointerId);return}
    if(hit&&Math.hypot(p.x-BCX,p.y-BCY)>20){dr={mode:'tap',a:st.arrows.find(x=>x.id===hit.dataset.id)};return}
    if(Math.hypot(p.x-BCX,p.y-BCY)<70){dr={mode:'new',a:null};board.setPointerCapture(e.pointerId);e.preventDefault()}});
  board.addEventListener('pointermove',e=>{if(!dr)return;const p=toSvg(e),dx=p.x-BCX,dy=p.y-BCY;
    if(dr.mode==='new'){if(Math.hypot(dx,dy)<10&&!dr.a)return;if(!dr.a){hist.push(JSON.stringify(st.arrows));dr.a={id:'a'+(nid++)+'_'+Date.now()%1e4,dir:'down',len:0,type:''};st.arrows.push(dr.a)}
      dr.a.dir=snap(dx,dy);dr.a.len=clamp(Math.hypot(dx,dy),0,180);draw()}
    else if(dr.mode==='tip'){const [vx,vy]=VEC[dr.a.dir];if(!dr.moved)hist.push(JSON.stringify(st.arrows));dr.moved=true;dr.a.len=clamp(dx*vx+dy*vy,25,180);draw()}});
  const up=()=>{if(!dr)return;const d=dr;dr=null;
    if(d.mode==='new'){if(d.a&&d.a.len<25){st.arrows=st.arrows.filter(x=>x!==d.a);draw()}else if(d.a){draw();openMenu(d.a);persist()}}
    else if(d.mode==='tip'){if(!d.moved)openMenu(d.a);else persist()}else if(d.mode==='tap')openMenu(d.a)};
  board.addEventListener('pointerup',up);board.addEventListener('pointercancel',()=>{dr=null});
  $('.fundo',host).onclick=()=>{if(!hist.length)return;st.arrows=JSON.parse(hist.pop());closeMenu();draw();persist()};
  $('.fclr',host).onclick=()=>{if(!st.arrows.length)return;hist.push(JSON.stringify(st.arrows));st.arrows=[];closeMenu();draw();persist()};
  $('.fchk',host).onclick=()=>{closeMenu();if(!st.arrows.length){fb.hidden=false;fb.className='fb ffb no';fb.textContent='Draw an arrow first: drag outwards from the orange dot.';return}
    st.tries=(st.tries||0)+1;const r=fbdCheck(s,st.arrows);st.passed=st.passed||r.ok;fb.hidden=false;fb.className='fb ffb '+(r.ok?'ok':'mid');fb.textContent=r.msg;$('.fmodel',host).hidden=false;draw();persist()};
  $('.fmodel',host).onclick=()=>popup('popmodel','Model: '+SCEN[s].t,`<div class="board">${fbdSVG(s,modelArrows(s),{noDot:true})}</div><p class="note">Compare it with yours. The leftover force is ${s==='ramp'?'gravity\'s pull down the slope':'friction, pointing backwards'}.</p>`);
  draw();
}
/* ---- the questions under each diagram (both grades) ---- */
const FQ_KEYS=()=>['ramp','flat'].flatMap(s=>['bal','res','acc'].map(q=>s+'.'+q));
function fqDef(s,q){
  const g6=isG6(),ramp=s==='ramp';
  if(q==='bal')return{p:'Are the forces on the cart balanced?',o:[['bal','Balanced'],['unb','Unbalanced']],a:'unb',
    why:ramp?'Unbalanced. Weight pulls straight down, but the ramp only pushes back at an angle, so part of gravity is left over, pulling the cart down the slope.':'Unbalanced. Up and down cancel out (weight = normal force), but nothing cancels friction.'};
  if(q==='res')return{p:g6?'Which way is the leftover force?':'Which way does the resultant force point?',o:[['fwd',ramp?'Forwards (down the slope)':'Forwards'],['back','Backwards'],['none',g6?'No leftover force':'There is no resultant force']],a:ramp?'fwd':'back',
    why:ramp?'Forwards. Gravity pulls the cart down the slope more than friction holds it back.':'Backwards. Gravity can\'t pull the cart forwards on the flat any more, so friction is the only force left along the floor.'};
  return{p:'So the acceleration is…',o:[['pos','Positive (+): speeds up'],['zero','Zero: same speed'],['neg','Negative (−): slows down']],a:ramp?'pos':'neg',
    why:ramp?'Positive. The leftover force points the way the cart moves, so it speeds up.':'Negative. The leftover force points against the movement, so the cart slows down and the acceleration is a minus number.'};
}
function fqHTML(s){return['bal','res','acc'].map(q=>{const d=fqDef(s,q),k=s+'.'+q,v=S.fq[k];
  return`<div class="fq"><p>${d.p}</p><div class="chips">${d.o.map(([val,l])=>`<button class="chip ${v===val?(val===d.a?'right':'wrong'):''}" data-act="fq" data-k="${k}" data-v="${val}">${l}</button>`).join('')}</div>
   ${v?`<div class="fb ${v===d.a?'ok':'no'}">${v===d.a?'✓ '+d.why:'Not quite. Look at the diagram again: which arrows cancel out, and which one is left over? Try another answer.'}</div>`:''}</div>`}).join('')}
function stepForces(){
  const g6=isG6();
  const box=s=>`<div class="panel"><h2>${SCEN[s].t} ${s==='ramp'?'(0 m → 2 m)':'(2 m → 4 m)'}</h2><div class="fbdb">
    <div>${g6?`<div class="board">${fbdSVG(s,modelArrows(s),{noDot:true})}</div>`:`<div id="fbd-${s}"></div>`}</div>
    <div>${g6?`<div class="tip">${s==='ramp'?'<b>Gravity</b> pulls the cart down. The <b>ramp</b> pushes back, but at an angle, so it can\'t cancel all of gravity. <b>Friction</b> is small.':'<b>Gravity</b> pulls down and the <b>floor</b> pushes up just as hard. They cancel. <b>Friction</b> pushes back, and nothing cancels it.'}</div>`:
      `<div class="tip">Drag outwards from the orange dot to draw a force. Then choose its name. <b>Bigger force = longer arrow.</b> Drag an arrow tip to change its length.</div>`}${fqHTML(s)}</div></div></div>`;
  return`<div class="intro">On this page you will use <b>forces</b> to explain your results. ${g6?'Look at each diagram and answer the questions.':'Draw a free body diagram for each part of the track, then answer the questions.'} ${stepTodo(4)}</div>${box('ramp')}${box('flat')}
  <div class="panel"><h2>The big idea</h2><p style="font-size:18px;margin:0">${g6?'On the ramp, <b>gravity pulls the cart forwards</b>, so it speeds up (+). On the flat, gravity <b>can\'t pull it forwards</b> any more. <b>Friction</b> slows it down, so the acceleration is a <b>minus (−)</b> number.':'On the ramp the resultant force points down the slope, so acceleration is <b>positive</b>. On the flat, weight and normal force are balanced, so <b>friction is unbalanced</b>. The resultant force points backwards, so acceleration is <b>negative</b>. (Newton\'s second law: a = F ÷ m, and the sign of a follows the direction of F.)'}</p></div>`;
}
