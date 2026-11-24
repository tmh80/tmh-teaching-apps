import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

/* ── Constants ── */
const DEFAULT_ACTIONS = ["Think","Share","Read","Explain","Paraphrase","Discuss","Write","Reflect","Review","Listen"];
const COLORS = [
  {fill:"rgba(66,133,244,0.24)",wave:"rgba(66,133,244,0.14)",text:"#2e6bce",bg:"#eaf1fc"},
  {fill:"rgba(106,189,123,0.24)",wave:"rgba(106,189,123,0.14)",text:"#3a8a4e",bg:"#edf7ef"},
  {fill:"rgba(234,170,60,0.24)",wave:"rgba(234,170,60,0.14)",text:"#b8850a",bg:"#fdf5e6"},
  {fill:"rgba(180,120,220,0.24)",wave:"rgba(180,120,220,0.14)",text:"#7b4fa0",bg:"#f5eefa"},
  {fill:"rgba(240,100,100,0.24)",wave:"rgba(240,100,100,0.14)",text:"#c44",bg:"#fdeeed"},
  {fill:"rgba(80,180,200,0.24)",wave:"rgba(80,180,200,0.14)",text:"#2a8a9a",bg:"#e8f6f8"},
];
const FIN = {fill:"rgba(235,87,87,0.2)",wave:"rgba(235,87,87,0.12)",text:"#eb5757",bg:"#fff5f5"};
const TIME_PRESETS = [
  {label:"30s",seconds:30},{label:"1m",seconds:60},{label:"2m",seconds:120},
  {label:"5m",seconds:300},{label:"10m",seconds:600},{label:"30m",seconds:1800},
];
/* Quick-start lengths: the − / + chips in the ⚡ Quick menu step through these. */
const QUICK_STEPS = [30,60,90,120,180,300,420,600,900,1200,1800];
const DEFAULT_QUICK_SECS = 120;
const DEFAULT_TEMPLATES = [
  {name:"Think & Share",builtin:true,segments:[{task:"Think",minutes:2,seconds:0},{task:"Share",minutes:3,seconds:0}]},
  {name:"Read & Explain",builtin:true,segments:[{task:"Read",minutes:3,seconds:0},{task:"Explain",minutes:4,seconds:0},{task:"Reflect",minutes:2,seconds:0}]},
  {name:"Pomodoro",builtin:true,segments:[{task:"Work",minutes:25,seconds:0},{task:"Rest",minutes:5,seconds:0}],repeatMode:"count",repeatCount:4},
];

/* ── Sample class (shown on first launch only; not persisted until user edits) ── */
const SAMPLE_CLASS = {
  id:"demo-10a",isDemo:true,name:"Year 10A",
  students:[
    {id:"d1",name:"Oliver Chen",gender:"M",grade:"10",ls:false,eal:true,coldCallExcluded:false},
    {id:"d2",name:"Amelia Patel",gender:"F",grade:"10",ls:false,eal:true,coldCallExcluded:false},
    {id:"d3",name:"Jack Harrison",gender:"M",grade:"10",ls:true,eal:false,coldCallExcluded:true},
    {id:"d4",name:"Sophie Williams",gender:"F",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d5",name:"Mohammed Al-Rashid",gender:"M",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d6",name:"Isla Thompson",gender:"F",grade:"10",ls:true,eal:false,coldCallExcluded:true},
    {id:"d7",name:"Ethan Clarke",gender:"M",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d8",name:"Chloe Robinson",gender:"F",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d9",name:"Lucas Martinez",gender:"M",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d10",name:"Freya Anderson",gender:"F",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d11",name:"Harry Wilson",gender:"M",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d12",name:"Mia Taylor",gender:"F",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d13",name:"Noah Sharma",gender:"M",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d14",name:"Grace Humphreys",gender:"F",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d15",name:"Liam O'Brien",gender:"M",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d16",name:"Evie Johnston",gender:"F",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d17",name:"Samuel Wright",gender:"M",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d18",name:"Poppy Davies",gender:"F",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d19",name:"Alfie Nguyen",gender:"M",grade:"10",ls:false,eal:false,coldCallExcluded:false},
    {id:"d20",name:"Lily Cooper",gender:"F",grade:"10",ls:false,eal:false,coldCallExcluded:false},
  ]
};

/* ── Roster parsing ── */
function parseBool(v){if(!v)return false;const s=v.trim().toLowerCase();return["yes","true","1","y","✓","✔","x"].includes(s);}
function normalizeGender(v){if(!v)return"";const s=v.trim().toLowerCase();if(["m","male","boy"].includes(s))return"M";if(["f","female","girl"].includes(s))return"F";return v.trim().charAt(0).toUpperCase()||"";}
function parseRoster(text){
  if(!text.trim())return[];
  const lines=text.trim().split("\n").filter(l=>l.trim());
  const first=lines[0].toLowerCase();
  const skip=first.includes("name")||first.includes("gender")||first.includes("student");
  const data=skip?lines.slice(1):lines;
  return data.map((line,i)=>{
    const cols=line.split(/\t|,/);
    const name=(cols[0]||"").replace(/^"|"$/g,"").trim();
    const gender=normalizeGender((cols[1]||"").replace(/^"|"$/g,"").trim());
    const grade=(cols[2]||"").replace(/^"|"$/g,"").trim().replace(/\D/g,"").slice(0,2);
    const ls=parseBool((cols[3]||"").replace(/^"|"$/g,"").trim());
    const eal=parseBool((cols[4]||"").replace(/^"|"$/g,"").trim());
    return{id:`imp-${Date.now()}-${i}`,name,gender,grade,ls,eal,coldCallExcluded:false};
  }).filter(s=>s.name);
}

function fmt(s){if(s<0)s=0;const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;if(h>0)return`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;}

/* Tracks an element's own rendered width via ResizeObserver, so a panel can
   adapt its layout to the space it actually has — whether that space shrank
   because the teacher dragged a column divider or resized the app window. */
function useElementWidth(ref){
  const[width,setWidth]=useState(0);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const ro=new ResizeObserver(entries=>{for(const entry of entries)setWidth(entry.contentRect.width);});
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return()=>ro.disconnect();
  },[ref]);
  return width;
}

/* ── Audio ──
   Each timer style has its own voice, set from the Timer panel (audio.style):
   • liquid    — the original bright chimes and beeps
   • hourglass — soft, slow bells and a singing-bowl strike; water-drop ticks
   • blocks    — quiet 8-bit blips through a low-pass filter, so it's retro
                 without being shrill */
const audio={
  ctx:null,style:'liquid',getCtx(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();return this.ctx;},
  /* One note: short attack, exponential decay, optional low-pass and pitch glide */
  note(f,at,{dur=0.35,gain=0.2,type="sine",attack=0.005,lp=null,glideTo=null}={}){
    const c=this.getCtx(),t=c.currentTime+at;
    const o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);
    if(glideTo)o.frequency.exponentialRampToValueAtTime(glideTo,t+dur*0.6);
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(gain,t+attack);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    let out=o.connect(g);
    if(lp){const fl=c.createBiquadFilter();fl.type="lowpass";fl.frequency.value=lp;out=out.connect(fl);}
    out.connect(c.destination);o.start(t);o.stop(t+dur+0.05);
  },
  bell(f,at,dur,gain){this.note(f,at,{dur,gain,attack:0.03});this.note(f*2,at,{dur:dur*0.55,gain:gain*0.22,attack:0.03});},
  blip(f,at,dur,gain=0.07){this.note(f,at,{dur,gain,type:"square",attack:0.004,lp:2600});},
  ding(){try{
    if(this.style==='hourglass'){[392.00,493.88,587.33].forEach((f,i)=>this.bell(f,i*0.16,1.9,0.1));return;}
    if(this.style==='blocks'){this.blip(523.25,0,0.09);this.blip(783.99,0.08,0.15);return;}
    const c=this.getCtx();[523.25,659.25,783.99].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="triangle";o.frequency.setValueAtTime(f,c.currentTime+i*0.12);g.gain.setValueAtTime(0.2,c.currentTime+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.12+0.35);o.connect(g).connect(c.destination);o.start(c.currentTime+i*0.12);o.stop(c.currentTime+i*0.12+0.4);});
  }catch(e){}},
  alarm:{id:null,ts:new Set()},
  alarmGap(){return this.style==='hourglass'?3500:this.style==='blocks'?1800:1400;},
  startAlarm(id){this.alarm.ts.add(id);if(this.alarm.id)return;this.beep();this.alarm.id=setInterval(()=>this.beep(),this.alarmGap());},
  stopAlarm(id){this.alarm.ts.delete(id);if(this.alarm.ts.size===0&&this.alarm.id){clearInterval(this.alarm.id);this.alarm.id=null;}},
  beep(){try{
    if(this.style==='hourglass'){ // a singing-bowl strike, then a softer fifth above
      this.note(293.66,0,{dur:3.4,gain:0.2,attack:0.02});this.note(293.66*2.71,0,{dur:1.8,gain:0.04,attack:0.02});
      this.note(440,0.55,{dur:2.8,gain:0.11,attack:0.03});return;
    }
    if(this.style==='blocks'){ // a short rising "level complete" jingle
      [523.25,659.25,783.99,1046.5].forEach((f,i)=>this.blip(f,i*0.09,i===3?0.26:0.09,0.07));return;
    }
    const c=this.getCtx();[784,988,784].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(f,c.currentTime+i*0.15);g.gain.setValueAtTime(0.25,c.currentTime+i*0.15);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.15+0.25);o.connect(g).connect(c.destination);o.start(c.currentTime+i*0.15);o.stop(c.currentTime+i*0.15+0.3);});
  }catch(e){}},
  /* Station rotation: a rising "time to move" phrase, in the timer's style (a touch longer than ding) */
  chime(){try{
    if(this.style==='hourglass'){[329.63,440,554.37,659.25].forEach((f,i)=>this.bell(f,i*0.18,2.2,0.1));return;}
    if(this.style==='blocks'){[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.blip(f,i*0.09,i===3?0.3:0.09,0.07));return;}
    [523.25,659.25,783.99,1046.5].forEach((f,i)=>this.note(f,i*0.13,{dur:0.5,gain:0.2,type:"triangle"}));
  }catch(e){}},
  oneShot(){this.beep();},
  tick(){try{
    if(this.style==='hourglass'){this.note(740,0,{dur:0.22,gain:0.07,attack:0.01,glideTo:520});return;} // soft water drop
    if(this.style==='blocks'){this.blip(880,0,0.05,0.045);return;}
    const c=this.getCtx();const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(1000,c.currentTime);g.gain.setValueAtTime(0.15,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.1);o.connect(g).connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+0.12);
  }catch(e){}},
  finalTick(){try{
    if(this.style==='hourglass'){this.bell(587.33,0,1.0,0.1);return;}
    if(this.style==='blocks'){this.blip(1318.5,0,0.09,0.055);return;}
    const c=this.getCtx();const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(1400,c.currentTime);g.gain.setValueAtTime(0.2,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.15);o.connect(g).connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+0.18);
  }catch(e){}}
};

/* ── Storage ── */
async function load(k,d){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):d;}catch{return d;}}
async function save(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch(e){}}

/* ── Automatic backups ──
   A safety net for Tom's real data: a snapshot of every saved key, in the same
   shape as Settings > Export backup (plus a "reason"). Kept in its own real
   localStorage key, NOT inside 'classboard-storage', so a backup is never part
   of the data it backs up and a restore can't wipe the backups. In Electron it
   is also written as a file in Documents (see main.js). Must never throw. */
const AUTO_BACKUP_KEY='classpanels-auto-backups';
const AUTO_BACKUP_KEEP=10;
function readAutoBackups(){ // newest first
  try{const a=JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY)||'[]');return Array.isArray(a)?a.filter(b=>b&&b.data&&typeof b.data==='object'):[];}catch(e){return[];}
}
/* Later phases call autoBackup('before <migration>') before they touch saved data. Resolves true if a backup was made. */
export async function autoBackup(reason){
  try{
    const{keys}=await window.storage.list();
    if(!keys.length)return false; // nothing saved yet, nothing to protect
    const data={};
    for(const k of keys){const r=await window.storage.get(k);if(r)data[k]=r.value;}
    const when=new Date();
    const entry={app:'ClassPanels',format:1,exportedAt:when.toISOString(),reason:reason||'manual',data};
    const list=[entry,...readAutoBackups()].slice(0,AUTO_BACKUP_KEEP);
    for(;;){ // if the browser's storage is full, let the oldest copies go rather than lose the newest
      try{localStorage.setItem(AUTO_BACKUP_KEY,JSON.stringify(list));break;}
      catch(e){if(list.length<=1)throw e;list.pop();}
    }
    try{ // Electron only: also a plain file Tom can find in Finder
      if(window.electronAPI?.writeBackup){
        const p=n=>String(n).padStart(2,'0');
        const name=`ClassPanels-auto-${when.getFullYear()}-${p(when.getMonth()+1)}-${p(when.getDate())}-${p(when.getHours())}${p(when.getMinutes())}.json`;
        Promise.resolve(window.electronAPI.writeBackup(name,JSON.stringify(entry))).catch(()=>{});
      }
    }catch(e){}
    return true;
  }catch(e){return false;}
}
/* At launch: one backup per calendar day. Only an earlier *launch* backup counts:
   a migration's "before …" backup made a moment ago (Phase 5) must not stand in for it. */
async function autoBackupIfNewDay(){
  try{
    const today=new Date().toLocaleDateString('sv');
    const newest=readAutoBackups().find(b=>b.reason==='launch');
    if(newest&&new Date(newest.exportedAt).toLocaleDateString('sv')===today)return false;
    return await autoBackup('launch');
  }catch(e){return false;}
}

/* ── Paraphrase helpers ── */
function isPara(s){return s.task.toLowerCase().includes("paraphrase");}
function getLeadParas(segs){const i=segs.findIndex(s=>!isPara(s));if(i<=0)return{lead:[],rest:segs};return{lead:segs.slice(0,i),rest:segs.slice(i)};}
function getEffSegs(t){
  if(!t.paraphraseMode)return t.segments;
  const{lead,rest}=getLeadParas(t.segments);
  if(!lead.length)return t.segments;
  const r=t.repeatInfo;if(!r)return t.segments;
  if(r.current===1)return rest;
  if(!r.infinite&&r.current===r.total)return[...t.segments,...lead];
  return t.segments;
}
function fmtLen(secs){const m=Math.floor(secs/60),s=secs%60;return m&&s?`${m}m ${s}s`:m?`${m}m`:`${s}s`;}
function stepLen(cur,dir){return dir>0?(QUICK_STEPS.find(x=>x>cur)||QUICK_STEPS[QUICK_STEPS.length-1]):([...QUICK_STEPS].reverse().find(x=>x<cur)||QUICK_STEPS[0]);}
/* Drag-to-combine: the target's segments, then the dragged timer's. The target
   keeps its id (so it keeps its place and selection). Paraphrase mode only
   looks at *leading* paraphrase segments, so it is kept from the target and
   dropped from the dragged timer (its paraphrase steps are now mid-timeline and
   just run as normal steps). The dragged timer's own repeat is dropped; the
   repeat popover sets the new one. Parts keep their own repeat for Split. */
/* A combined timer remembers its parts (in order) so Split can rebuild the originals.
   Combining something already combined just flattens the parts. */
function partOf(t){return t.parts&&t.parts.length>1?t.parts:[{name:t.name,segments:t.segments.map(x=>({...x})),repeat:t.repeatInfo?(t.repeatInfo.infinite?{infinite:true}:{total:t.repeatInfo.total}):null,paraphraseMode:!!t.paraphraseMode}];}
function combineTimers(t,d){
  const ri=t.repeatInfo;
  // paraphrase "final round" view has extra segments appended after the target's own,
  // so a saved position inside it would no longer line up: restart cleanly instead.
  const paraFinal=t.paraphraseMode&&ri&&!ri.infinite&&ri.current>1&&ri.current===ri.total;
  const keep=t.running&&!paraFinal;
  return{...t,parts:[...partOf(t),...partOf(d)],name:`${t.name} → ${d.name}`,segments:[...t.segments.map(x=>({...x})),...d.segments.map(x=>({...x}))],paraphraseMode:!!t.paraphraseMode,
    running:keep,currentSegIdx:keep?t.currentSegIdx:0,segElapsed:keep?t.segElapsed:0,
    repeatInfo:ri?{...ri,current:keep?ri.current:1}:null};
}
function shouldShowPara(segs){return segs.length>0&&isPara(segs[0])&&segs.some(s=>!isPara(s));}

/* ── Liquid Circle ── */
function Liquid({progress,size=180,finished,running,colorIdx=0}){
  const ref=useRef(null),anim=useRef(null),pRef=useRef(progress),smooth=useRef(progress);
  useEffect(()=>{pRef.current=progress;},[progress]);
  const col=finished?FIN:COLORS[colorIdx%COLORS.length];
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d"),dpr=window.devicePixelRatio||1;
    cv.width=size*dpr;cv.height=size*dpr;ctx.scale(dpr,dpr);
    const cx=size/2,cy=size/2,r=size/2-3;let t=0;
    const draw=()=>{
      smooth.current+=(pRef.current-smooth.current)*0.06;
      const p=Math.max(0,Math.min(1,smooth.current));
      t+=running?0.035:0.012;
      ctx.clearRect(0,0,size,size);
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=finished?"#fff5f5":"#f3f5f8";ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
      const wt=cy+r-p*2*r;
      ctx.beginPath();for(let x=0;x<=size;x+=2){const y=wt+Math.sin((x/size)*Math.PI*2.5+t*1.1+1)*(running?5:2.5)+Math.sin((x/size)*Math.PI*4.2+t*0.6)*(running?3:1.5)+Math.sin((x/size)*Math.PI*1.2+t*1.7+3)*(running?2:1);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      ctx.lineTo(size,size);ctx.lineTo(0,size);ctx.closePath();ctx.fillStyle=col.wave;ctx.fill();
      ctx.beginPath();for(let x=0;x<=size;x+=2){const y=wt+Math.sin((x/size)*Math.PI*3+t*1.6)*(running?6:3)+Math.sin((x/size)*Math.PI*1.8+t*0.8+2)*(running?3.5:1.8)+Math.cos((x/size)*Math.PI*5+t*2.2)*(running?1.5:0.7);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      ctx.lineTo(size,size);ctx.lineTo(0,size);ctx.closePath();ctx.fillStyle=col.fill;ctx.fill();
      ctx.restore();
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=finished?"rgba(235,87,87,0.25)":"rgba(0,0,0,0.07)";ctx.lineWidth=1.5;ctx.stroke();
      anim.current=requestAnimationFrame(draw);
    };draw();
    return()=>{if(anim.current)cancelAnimationFrame(anim.current);};
  },[size,finished,running,col]);
  return <canvas ref={ref} width={size} height={size} style={{width:size,height:size,borderRadius:"50%"}}/>;
}

/* ── Timer looks ──────────────────────────────────────────────────────────
   Three ways to show the same countdown: the original Liquid circle, an
   Hourglass (sand drains from the top bulb to the bottom), and a retro
   Blocks console (pixel digits + a block meter that drains like an old
   arcade health bar). Picked in Settings; all share one set of props. */
const hexA=(hex,a)=>{
  if(hex.length===4)hex="#"+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
  const n=parseInt(hex.slice(1),16);
  return`rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
};

function Hourglass({progress,size=180,finished,running,colorIdx=0}){
  const ref=useRef(null),anim=useRef(null),pRef=useRef(progress),smooth=useRef(progress);
  useEffect(()=>{pRef.current=progress;},[progress]);
  const col=finished?FIN:COLORS[colorIdx%COLORS.length];
  const W=Math.round(size*0.78),H=Math.round(size*1.1);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d"),dpr=window.devicePixelRatio||1;
    cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const cx=W/2,plateH=Math.max(6,H*0.07),yTop=plateH+2,yBot=H-plateH-2,mid=(yTop+yBot)/2;
    const hw=W*0.36,neck=Math.max(1.6,W*0.028),bulb=mid-yTop;
    const sandStrong=hexA(col.text,0.62),sandSurface=hexA(col.text,0.85);
    let t=0;
    const glass=()=>{
      ctx.beginPath();
      ctx.moveTo(cx-hw,yTop);ctx.lineTo(cx+hw,yTop);
      ctx.bezierCurveTo(cx+hw,yTop+bulb*0.55,cx+neck,mid-bulb*0.35,cx+neck,mid);
      ctx.bezierCurveTo(cx+neck,mid+bulb*0.35,cx+hw,yBot-bulb*0.55,cx+hw,yBot);
      ctx.lineTo(cx-hw,yBot);
      ctx.bezierCurveTo(cx-hw,yBot-bulb*0.55,cx-neck,mid+bulb*0.35,cx-neck,mid);
      ctx.bezierCurveTo(cx-neck,mid-bulb*0.35,cx-hw,yTop+bulb*0.55,cx-hw,yTop);
      ctx.closePath();
    };
    const plate=(y)=>{
      const x=cx-W*0.48,w=W*0.96,r=Math.min(5,plateH/2);
      const g=ctx.createLinearGradient(0,y,0,y+plateH);g.addColorStop(0,"#e6c9a8");g.addColorStop(1,"#c9a276");
      ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+plateH,r);ctx.arcTo(x+w,y+plateH,x,y+plateH,r);ctx.arcTo(x,y+plateH,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
      ctx.fillStyle=g;ctx.fill();ctx.strokeStyle="rgba(120,85,55,0.6)";ctx.lineWidth=1;ctx.stroke();
      ctx.strokeStyle="rgba(255,250,240,0.45)";ctx.beginPath();ctx.moveTo(x+4,y+plateH*0.35);ctx.lineTo(x+w-4,y+plateH*0.35);ctx.stroke();
    };
    const draw=()=>{
      smooth.current+=(pRef.current-smooth.current)*0.08;
      const p=Math.max(0,Math.min(1,smooth.current)),q=1-p;
      t+=0.06;
      ctx.clearRect(0,0,W,H);
      // wooden posts behind the glass
      ctx.fillStyle="rgba(150,110,70,0.8)";
      ctx.fillRect(cx-W*0.44-1.5,plateH,3,H-plateH*2);ctx.fillRect(cx+W*0.44-1.5,plateH,3,H-plateH*2);
      // glass body
      glass();ctx.fillStyle=finished?"#fff5f5":"#f3f5f8";ctx.fill();
      ctx.save();glass();ctx.clip();
      // sand left in the top bulb (funnels toward the middle while running)
      if(p>0.004){
        const yS=mid-(mid-yTop-2)*p,dip=running?Math.min(9,bulb*0.09):0;
        ctx.beginPath();ctx.moveTo(cx-hw-2,yS);ctx.quadraticCurveTo(cx,yS+dip*2,cx+hw+2,yS);
        ctx.lineTo(cx+hw+2,mid+2);ctx.lineTo(cx-hw-2,mid+2);ctx.closePath();
        ctx.fillStyle=sandStrong;ctx.fill();
        ctx.beginPath();ctx.moveTo(cx-hw-2,yS);ctx.quadraticCurveTo(cx,yS+dip*2,cx+hw+2,yS);
        ctx.strokeStyle=sandSurface;ctx.lineWidth=1.5;ctx.stroke();
      }
      // pile in the bottom bulb, peaked in the middle
      const hB=(yBot-mid-2)*q*0.95,sY=yBot-hB,peak=running&&p>0.004?Math.min(bulb*0.16,hB*0.7):Math.min(bulb*0.05,hB*0.35);
      if(hB>0.5){
        ctx.beginPath();ctx.moveTo(cx-hw-2,yBot+2);ctx.lineTo(cx-hw-2,sY);
        ctx.quadraticCurveTo(cx-hw*0.35,sY,cx,sY-peak);ctx.quadraticCurveTo(cx+hw*0.35,sY,cx+hw+2,sY);
        ctx.lineTo(cx+hw+2,yBot+2);ctx.closePath();ctx.fillStyle=sandStrong;ctx.fill();
        ctx.beginPath();ctx.moveTo(cx-hw-2,sY);ctx.quadraticCurveTo(cx-hw*0.35,sY,cx,sY-peak);ctx.quadraticCurveTo(cx+hw*0.35,sY,cx+hw+2,sY);
        ctx.strokeStyle=sandSurface;ctx.lineWidth=1.5;ctx.stroke();
      }
      // falling stream
      if(running&&p>0.004&&q<0.995){
        ctx.strokeStyle=sandSurface;ctx.lineWidth=Math.max(1.3,neck*0.75);ctx.lineCap="butt";
        ctx.setLineDash([2.5,2.5]);ctx.lineDashOffset=-t*18;
        ctx.beginPath();ctx.moveTo(cx,mid-neck*2);ctx.lineTo(cx,sY-peak);ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
      // glass outline + highlights
      glass();ctx.strokeStyle=finished?"rgba(235,87,87,0.45)":"rgba(90,110,130,0.5)";ctx.lineWidth=1.5;ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,0.8)";ctx.lineWidth=2.2;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(cx-hw*0.78,yTop+bulb*0.14);ctx.quadraticCurveTo(cx-hw*0.9,yTop+bulb*0.55,cx-neck*3.2,mid-bulb*0.16);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx-hw*0.7,yBot-bulb*0.22);ctx.quadraticCurveTo(cx-hw*0.82,yBot-bulb*0.5,cx-neck*3.4,mid+bulb*0.2);ctx.stroke();
      plate(0);plate(H-plateH);
      anim.current=requestAnimationFrame(draw);
    };draw();
    return()=>{if(anim.current)cancelAnimationFrame(anim.current);};
  },[size,finished,running,col]);
  return <canvas ref={ref} width={W} height={H} style={{width:W,height:H}}/>;
}

/* 5×7 pixel font for the retro style (digits and the colon) */
const PIXEL_FONT={
  "0":["01110","10001","10011","10101","11001","10001","01110"],
  "1":["00100","01100","00100","00100","00100","00100","01110"],
  "2":["01110","10001","00001","00010","00100","01000","11111"],
  "3":["11110","00001","00001","01110","00001","00001","11110"],
  "4":["00010","00110","01010","10010","11111","00010","00010"],
  "5":["11111","10000","11110","00001","00001","10001","01110"],
  "6":["00110","01000","10000","11110","10001","10001","01110"],
  "7":["11111","00001","00010","00100","01000","01000","01000"],
  "8":["01110","10001","10001","01110","10001","10001","01110"],
  "9":["01110","10001","10001","01111","00001","00010","01100"],
  ":":["0","0","1","0","1","0","0"],
};
const NEON=["#5aa0ff","#5fe08a","#ffc04d","#c58bff","#ff7a7a","#4fd8e8"];
const NEON_FIN="#ff5c5c";

function PixelTime({text,color}){
  const cells=[];let x=0;
  [...text].forEach((ch,gi)=>{
    const g=PIXEL_FONT[ch]||PIXEL_FONT["0"];
    g.forEach((row,r)=>[...row].forEach((bit,c)=>{
      cells.push(<rect key={`${gi}-${r}-${c}`} x={x+c+0.07} y={r+0.07} width={0.86} height={0.86} fill={bit==="1"?color:"rgba(255,255,255,0.07)"}/>);
    }));
    x+=g[0].length+1;
  });
  return <svg viewBox={`0 0 ${x-1} 7`} style={{width:"100%",height:"auto",display:"block"}} shapeRendering="crispEdges">{cells}</svg>;
}

/* Retro console: pixel digits over a block meter. Blocks drain column by
   column from the right (each column from the top down); the block about to
   go out blinks while running, and everything flashes red when time's nearly
   up or done. `small` shrinks the chrome for the Settings preview. */
function RetroBlocks({time,progress,finished,urgent,running,colorIdx=0,width="100%",small=false}){
  const cols=12,rows=4,total=cols*rows;
  const done=!!finished;
  const hot=done||!!urgent;
  const lit=hot?NEON_FIN:NEON[colorIdx%NEON.length];
  const litCount=done?total:Math.max(0,Math.min(total,Math.ceil(progress*total-1e-6)));
  const cells=[];
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
    const k=j*rows+(rows-1-i);
    const on=k<litCount;
    const flash=hot&&(on||done)&&(running||done);
    const pulse=on&&!hot&&running&&k===litCount-1;
    cells.push(<div key={`${i}-${j}`} style={{aspectRatio:"1",background:on?lit:"rgba(255,255,255,0.07)",boxShadow:on?`inset ${small?1:2}px ${small?1:2}px 0 rgba(255,255,255,0.4), inset -${small?1:2}px -${small?1:2}px 0 rgba(0,0,0,0.32)`:"inset 1px 1px 0 rgba(0,0,0,0.25)",borderRadius:"1px",animation:flash?"blockBlink 0.8s steps(1) infinite":pulse?"blockBlink 1s steps(1) infinite":"none"}}/>);
  }
  return(
    <div style={{width,maxWidth:"100%",boxSizing:"border-box",padding:small?"7px 8px 8px":"12px 14px 14px",borderRadius:small?"8px":"12px",background:"#1b2030",border:`${small?2:3}px solid #0d1017`,boxShadow:"inset 0 0 0 2px #3a4258, 0 4px 14px rgba(0,0,0,0.22)",position:"relative",display:"flex",flexDirection:"column",gap:small?"6px":"12px"}}>
      <div style={{width:"84%",margin:"0 auto",filter:small?"none":`drop-shadow(0 0 4px ${hexA(lit,0.45)})`}}><PixelTime text={time} color={lit}/></div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:small?"1.5px":"3px"}}>{cells}</div>
      <div aria-hidden="true" style={{position:"absolute",inset:0,borderRadius:"inherit",pointerEvents:"none",background:"repeating-linear-gradient(0deg,rgba(255,255,255,0.035) 0px,rgba(255,255,255,0.035) 1px,transparent 1px,transparent 3px)"}}/>
    </div>
  );
}

/* Liquid or Hourglass, by the chosen style */
function TimerViz({timerStyle,...p}){return timerStyle==='hourglass'?<Hourglass {...p}/>:<Liquid {...p}/>;}

/* ── Segment bar ── */
function SegBar({segments,currentIdx,segElapsed,totalDuration}){
  return(
    <div style={{width:"100%",display:"flex",borderRadius:"4px",overflow:"hidden",height:"5px",gap:"2px"}}>
      {segments.map((seg,i)=>{const d=seg.minutes*60+seg.seconds;const pct=(d/totalDuration)*100;const c=COLORS[i%COLORS.length];
        let fill=0;if(i<currentIdx)fill=100;else if(i===currentIdx)fill=d>0?(segElapsed/d)*100:0;
        return(<div key={i} style={{width:`${pct}%`,background:"rgba(0,0,0,0.04)",borderRadius:"3px",overflow:"hidden"}}><div style={{height:"100%",width:`${fill}%`,background:c.text,opacity:0.45,transition:"width 0.5s ease"}}/></div>);
      })}
    </div>
  );
}

/* ── Timer Card ── */
function TimerCard({timer,onDelete,onToggle,onReset,onSelect,onDisplay,onRepeat,onSplit,isSelected,continuousAlarm,compact,timerStyle}){
  const eff=getEffSegs(timer);
  const{currentSegIdx:ci,segElapsed:se,running,finished,repeatInfo:ri}=timer;
  const seg=eff[ci]||eff[0];
  const segDur=seg.minutes*60+seg.seconds;
  const segRem=Math.max(0,segDur-se);
  const totalDur=eff.reduce((a,s)=>a+s.minutes*60+s.seconds,0);
  const prog=segDur>0?segRem/segDur:0;
  const urgent=!finished&&running&&segRem<=10&&segRem>0;
  const col=finished?FIN:urgent?FIN:COLORS[ci%COLORS.length];
  const repLabel=ri?(ri.infinite?`∞ ${ri.current}`:`${ri.current}/${ri.total}`):null;
  const uniqueTasks=[];
  eff.forEach((s,i)=>{if(i===0||s.task!==eff[i-1].task)uniqueTasks.push({task:s.task,startIdx:i,count:1});else uniqueTasks[uniqueTasks.length-1].count++;});
  return(
    <div className="cp-light" onClick={()=>onSelect(timer.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:compact?"7px":"10px",padding:compact?"16px 16px 14px":"24px 24px 20px",borderRadius:"22px",cursor:"pointer",background:finished?"linear-gradient(145deg,#fff5f5,#fff9f9)":"#ffffff",border:isSelected?"2px solid #2e6bce":finished?"1px solid rgba(235,87,87,0.18)":"1px solid rgba(0,0,0,0.05)",boxShadow:isSelected?"0 0 0 3px rgba(66,133,244,0.12)":finished?"0 4px 24px rgba(235,87,87,0.08)":"0 2px 20px rgba(0,0,0,0.04)",animation:finished&&continuousAlarm?"shake 0.4s ease-in-out infinite":"none",position:"relative",width:compact?"100%":"280px",maxWidth:compact?"230px":"280px",transition:"border 0.2s, box-shadow 0.2s",}}>
      {isSelected&&!finished&&<div style={{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",fontSize:"9px",fontWeight:700,color:"#fff",background:"#2e6bce",padding:"2px 10px",borderRadius:"8px",letterSpacing:"1px",textTransform:"uppercase"}}>Current</div>}
      <button className="cpb cpb-ghost" onClick={e=>{e.stopPropagation();onDelete(timer.id);}} style={{position:"absolute",top:"10px",right:"12px",background:"none",border:"none",color:"rgba(0,0,0,0.15)",fontSize:"18px",cursor:"pointer",padding:"4px 8px",borderRadius:"6px",lineHeight:1,}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.15)"}>×</button>
      <span style={{fontSize:"10.5px",letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.24)",fontWeight:600}}>{timer.name}{repLabel?` (${repLabel})`:""}</span>
      {timer.paraphraseMode&&ri&&(ri.current===1?<div style={{padding:"4px 10px",borderRadius:"8px",background:"#fdf5e6",border:"1px solid rgba(234,170,60,0.2)",fontSize:"10.5px",fontWeight:600,color:"#8a6d20"}}>Paraphrase skipped (first round)</div>:(!ri.infinite&&ri.current===ri.total)?<div style={{padding:"4px 10px",borderRadius:"8px",background:"#fdf5e6",border:"1px solid rgba(234,170,60,0.2)",fontSize:"10.5px",fontWeight:600,color:"#8a6d20"}}>Extra paraphrase (final round)</div>:null)}
      <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 16px",borderRadius:"20px",background:col.bg,transition:"background 0.4s"}}><span style={{fontSize:"17px",fontWeight:600,color:col.text,transition:"color 0.4s"}}>{finished?"Done!":seg.task}</span></div>
      {/* The countdown number is the one thing that must stay legible at any
          panel width, so its font-size never shrinks in compact mode. */}
      {timerStyle==='blocks'?(
        <RetroBlocks time={fmt(segRem)} progress={finished?0:prog} finished={finished} urgent={urgent} running={running} colorIdx={ci}/>
      ):(<>
        <div style={{fontSize:"34px",fontWeight:300,color:(finished||urgent)?"#eb5757":"#1a1a2e",letterSpacing:"2px",fontVariantNumeric:"tabular-nums"}}>{fmt(segRem)}</div>
        <TimerViz timerStyle={timerStyle} progress={finished?0:prog} size={compact?120:180} finished={finished||urgent} running={running} colorIdx={ci}/>
      </>)}
      {eff.length>1&&<SegBar segments={eff} currentIdx={ci} segElapsed={se} totalDuration={totalDur}/>}
      {eff.length>1&&!finished&&(
        <div style={{display:"flex",gap:"4px",flexWrap:"wrap",justifyContent:"center"}}>
          {uniqueTasks.map((u,i)=>{const active=ci>=u.startIdx&&ci<u.startIdx+u.count;const done=ci>=u.startIdx+u.count;const c=COLORS[u.startIdx%COLORS.length];return <span key={i} style={{fontSize:"11px",fontWeight:active?700:500,padding:"3px 9px",borderRadius:"12px",color:done?"rgba(0,0,0,0.2)":active?c.text:"rgba(0,0,0,0.3)",background:active?c.bg:"transparent",textDecoration:done?"line-through":"none"}}>{u.task}{u.count>1?` ×${u.count}`:""}</span>;})}
        </div>
      )}
      <div style={{display:"flex",gap:compact?"6px":"10px",marginTop:"4px",flexWrap:"wrap",justifyContent:"center"}}>
        <button className={`cpb${finished?" cpb-danger":running?"":" cpb-primary"}`} onClick={e=>{e.stopPropagation();onToggle(timer.id);}} style={{fontSize:"13px",fontWeight:600,padding:compact?"8px 16px":"9px 26px",borderRadius:"10px",border:"none",cursor:"pointer",background:finished?"#eb5757":running?"rgba(0,0,0,0.05)":"#1a1a2e",color:finished?"#fff":running?"#555":"#fff",}}>{finished?"Dismiss":running?"Pause":"Start"}</button>
        {!finished&&<button className="cpb" onClick={e=>{e.stopPropagation();onReset(timer.id);}} style={{fontSize:"13px",fontWeight:600,padding:compact?"8px 12px":"9px 18px",borderRadius:"10px",cursor:"pointer",background:"none",border:"1px solid rgba(0,0,0,0.07)",color:"rgba(0,0,0,0.3)",}} onMouseEnter={e=>{e.target.style.borderColor="rgba(0,0,0,0.18)";e.target.style.color="rgba(0,0,0,0.55)";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(0,0,0,0.07)";e.target.style.color="rgba(0,0,0,0.3)";}}>Reset</button>}
        {!finished&&<button className="cpb" onClick={e=>{e.stopPropagation();onDisplay(timer.id);}} title="Projector view" style={{fontSize:"15px",fontWeight:600,padding:compact?"8px 10px":"9px 12px",borderRadius:"10px",cursor:"pointer",background:"none",border:"1px solid rgba(0,0,0,0.07)",color:"rgba(0,0,0,0.25)",lineHeight:1,}} onMouseEnter={e=>{e.target.style.borderColor="rgba(66,133,244,0.3)";e.target.style.color="#2e6bce";e.target.style.background="#eaf1fc";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(0,0,0,0.07)";e.target.style.color="rgba(0,0,0,0.25)";e.target.style.background="none";}}>⛶</button>}
        {!finished&&onSplit&&timer.parts&&timer.parts.length>1&&<button className="cpb" onClick={e=>{e.stopPropagation();onSplit(timer.id);}} title="Split back into the separate timers" style={{fontSize:"13px",fontWeight:600,padding:compact?"8px 10px":"9px 12px",borderRadius:"10px",cursor:"pointer",background:"none",border:"1px solid rgba(0,0,0,0.07)",color:"rgba(0,0,0,0.4)",lineHeight:1,}}>✂ Split</button>}
        {/* Repeat: Once / × N / ∞ Loop. onMouseDown is stopped so the popover's outside-click closer doesn't fight this toggle. */}
        {!finished&&onRepeat&&<button className={`cpb${ri?" on":""}`} onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onRepeat(timer.id);}} title={ri?(ri.infinite?"Repeat: looping continuously. Click to change":`Repeat: ${ri.total} times. Click to change`):"Repeat: once. Click to repeat or loop this timer"} style={{fontSize:"13px",fontWeight:600,padding:compact?"8px 10px":"9px 12px",borderRadius:"10px",cursor:"pointer",background:ri?"#eaf1fc":"none",border:ri?"1px solid rgba(66,133,244,0.3)":"1px solid rgba(0,0,0,0.07)",color:ri?"#2e6bce":"rgba(0,0,0,0.25)",lineHeight:1,}}>{"↻"}{ri?(ri.infinite?" ∞":` ×${ri.total}`):""}</button>}
      </div>
    </div>
  );
}

/* ── Display Mode ── */
function DisplayMode({timer,onToggle,onReset,onExit,continuousAlarm,coldCallStudent,onDismissColdCall,timerStyle,rotationStrip}){
  const eff=getEffSegs(timer);
  const{currentSegIdx:ci,segElapsed:se,running,finished,repeatInfo:ri}=timer;
  const seg=eff[ci]||eff[0];
  const segDur=seg.minutes*60+seg.seconds;
  const segRem=Math.max(0,segDur-se);
  const totalDur=eff.reduce((a,s)=>a+s.minutes*60+s.seconds,0);
  const totalElapsed=eff.slice(0,ci).reduce((a,s)=>a+s.minutes*60+s.seconds,0)+se;
  const prog=segDur>0?segRem/segDur:0;
  const urgent=!finished&&running&&segRem<=10&&segRem>0;
  const col=finished?FIN:urgent?FIN:COLORS[ci%COLORS.length];
  const repLabel=ri?(ri.infinite?`Loop ${ri.current}`:`Round ${ri.current} of ${ri.total}`):null;
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onExit();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onExit]);

  return(
    <div className="no-drag cp-onboard" style={{position:"fixed",inset:0,zIndex:200,background:"linear-gradient(180deg,var(--board-bg-top) 0%,var(--board-bg-bottom) 100%)",display:"flex",flexDirection:"column",fontFamily:"'Source Sans 3',sans-serif",overflow:"hidden",}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px 0"}}>
        <button className="cpb" onClick={onExit} style={{fontSize:"13px",fontWeight:600,padding:"8px 16px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.4)",cursor:"pointer",}} onMouseEnter={e=>e.target.style.color="rgba(0,0,0,0.7)"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.4)"}>← Exit Display</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"13px",fontWeight:600,letterSpacing:"3px",textTransform:"uppercase",color:"var(--board-label)"}}>{timer.name}</div>
          {repLabel&&<div style={{fontSize:"11px",color:"var(--board-muted)",marginTop:"2px"}}>{repLabel}</div>}
        </div>
        <div style={{width:"120px"}}/>
      </div>
      <div style={{padding:"20px 24px 0",width:"100%"}}>
        <div style={{display:"flex",width:"100%",height:"48px",borderRadius:"10px",overflow:"hidden",gap:"3px"}}>
          {eff.map((s,i)=>{
            const d=s.minutes*60+s.seconds;const pct=(d/totalDur)*100;const c=COLORS[i%COLORS.length];const active=i===ci;const done=i<ci;
            let fillPct=0;if(done)fillPct=100;else if(active)fillPct=d>0?(se/d)*100:0;
            return(
              <div key={i} style={{width:`${pct}%`,minWidth:"40px",position:"relative",background:"rgba(0,0,0,0.04)",borderRadius:"8px",overflow:"hidden",transition:"all 0.3s"}}>
                <div style={{position:"absolute",inset:0,width:`${fillPct}%`,background:active?c.bg:done?"rgba(0,0,0,0.06)":"transparent",transition:"width 0.5s ease"}}/>
                <div style={{position:"relative",zIndex:1,height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 8px"}}>
                  <div style={{fontSize:active?"15px":"13px",fontWeight:active?700:500,color:done?"rgba(0,0,0,0.25)":active?c.text:"rgba(0,0,0,0.35)",transition:"all 0.3s",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"}}>{s.task}</div>
                  <div style={{fontSize:"10px",fontWeight:500,color:done?"rgba(0,0,0,0.15)":"rgba(0,0,0,0.2)",marginTop:"1px"}}>{fmt(d)}</div>
                </div>
                {active&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"3px",background:c.text,borderRadius:"2px"}}/>}
              </div>
            );
          })}
        </div>
        <div style={{width:"100%",height:"3px",borderRadius:"2px",background:"rgba(0,0,0,0.04)",marginTop:"8px",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${totalDur>0?(totalElapsed/totalDur)*100:0}%`,background:"rgba(0,0,0,0.12)",borderRadius:"2px",transition:"width 0.5s ease"}}/>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",padding:"0 24px",position:"relative"}}>
        {timer.paraphraseMode&&ri&&(ri.current===1||(!ri.infinite&&ri.current===ri.total))&&(
          <div style={{padding:"6px 20px",borderRadius:"12px",background:"#fdf5e6",border:"1px solid rgba(234,170,60,0.2)",fontSize:"14px",fontWeight:600,color:"#8a6d20"}}>{ri.current===1?"Paraphrase skipped — first round":"Extra paraphrase — final round"}</div>
        )}
        <div style={{fontSize:"clamp(28px, 5vw, 48px)",fontWeight:700,color:finished?FIN.text:col.text,padding:"8px 32px",borderRadius:"20px",background:col.bg,transition:"all 0.4s",letterSpacing:"1px",}}>{finished?"Done!":seg.task}</div>
        {timerStyle==='blocks'?(
          <RetroBlocks width={`min(86vw, ${Math.round((typeof window!=="undefined"?window.innerHeight:800)*0.72)}px)`} time={fmt(segRem)} progress={finished?0:prog} finished={finished} urgent={urgent} running={running} colorIdx={ci}/>
        ):(<>
          <div style={{fontSize:"clamp(80px, 18vw, 180px)",fontWeight:300,color:(finished||urgent)?"#eb5757":"#1a1a2e",letterSpacing:"4px",fontVariantNumeric:"tabular-nums",lineHeight:1,}}>{fmt(segRem)}</div>
          <TimerViz timerStyle={timerStyle} progress={finished?0:prog} size={Math.min(280,typeof window!=="undefined"?window.innerHeight*0.25:200)} finished={finished||urgent} running={running} colorIdx={ci}/>
        </>)}
        {!finished&&ci<eff.length-1&&(
          <div style={{fontSize:"16px",color:"rgba(0,0,0,0.25)",fontWeight:500}}>Next: <span style={{color:"rgba(0,0,0,0.4)",fontWeight:600}}>{eff[ci+1].task}</span> ({fmt(eff[ci+1].minutes*60+eff[ci+1].seconds)})</div>
        )}
        {rotationStrip&&<RotationStrip strip={rotationStrip} moving={!finished&&seg.task===ROT_MOVE}/>}

        {/* Cold call overlay — appears within display mode */}
        {coldCallStudent&&(
          <div className="cp-light" style={{position:"absolute",inset:0,background:"rgba(248,249,251,0.93)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,animation:"coldCallReveal 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
            <div style={{textAlign:"center",padding:"40px 60px"}}>
              <div style={{fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"20px",fontWeight:600}}>Cold Call</div>
              <div style={{fontSize:"clamp(48px,10vw,96px)",fontWeight:700,color:"#1a1a2e",lineHeight:1.1}}>{coldCallStudent.name}</div>
              <button className="cpb" onClick={onDismissColdCall} style={{marginTop:"32px",fontSize:"14px",fontWeight:600,padding:"10px 28px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer"}}>Dismiss</button>
            </div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:"12px",justifyContent:"center",padding:"0 24px 32px"}}>
        <button className={`cpb${finished?" cpb-danger":running?"":" cpb-primary"}`} onClick={()=>onToggle(timer.id)} style={{fontSize:"18px",fontWeight:600,padding:"14px 48px",borderRadius:"14px",border:"none",cursor:"pointer",background:finished?"#eb5757":running?"rgba(0,0,0,0.06)":"#1a1a2e",color:finished?"#fff":running?"#555":"#fff",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",}}>{finished?"Dismiss":running?"Pause":"Start"}</button>
        {!finished&&<button className="cpb" onClick={()=>onReset(timer.id)} style={{fontSize:"18px",fontWeight:600,padding:"14px 32px",borderRadius:"14px",cursor:"pointer",background:"none",border:"1px solid rgba(0,0,0,0.08)",color:"rgba(0,0,0,0.3)",}} onMouseEnter={e=>{e.target.style.borderColor="rgba(0,0,0,0.2)";e.target.style.color="rgba(0,0,0,0.55)";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(0,0,0,0.08)";e.target.style.color="rgba(0,0,0,0.3)";}}>Reset</button>}
      </div>
      {finished&&continuousAlarm&&<div style={{position:"absolute",inset:0,border:"6px solid rgba(235,87,87,0.3)",borderRadius:0,pointerEvents:"none",animation:"pulse-border 1.5s ease-in-out infinite"}}/>}
    </div>
  );
}

/* ── Manage Actions ── */
function ManageTasksModal({actions,onSave,onClose}){
  const[items,setItems]=useState([...actions]);const[newTask,setNewTask]=useState("");const[draggingIdx,setDraggingIdx]=useState(null);
  const inp={padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:500,outline:"none",fontFamily:"'Source Sans 3',sans-serif"};
  const hds=(e,i)=>{setDraggingIdx(i);e.dataTransfer.effectAllowed="move";};
  const hdo=(e,ti)=>{e.preventDefault();if(draggingIdx===null||draggingIdx===ti){setDraggingIdx(null);return;}setItems(p=>{const a=[...p];const[it]=a.splice(draggingIdx,1);a.splice(ti,0,it);return a;});setDraggingIdx(null);};
  return(
    <div className="cp-pop" style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"400px",maxHeight:"85vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}><h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage Tasks</h2><button className="cpb cpb-ghost" onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button></div>
      <p style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"16px",lineHeight:1.5}}>Task chips you can click or drag into the timer builder — e.g. "Practical" then "Clean up" for a science lesson. Drag to reorder.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px",overflowY:"auto",maxHeight:"320px",paddingRight:"2px"}}>
        {items.map((a,i)=>(
          <div key={i} draggable onDragStart={e=>hds(e,i)} onDragOver={e=>e.preventDefault()} onDrop={e=>hdo(e,i)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",borderRadius:"10px",background:draggingIdx===i?"rgba(0,0,0,0.04)":"#fafbfc",border:"1px solid rgba(0,0,0,0.04)",opacity:draggingIdx===i?0.4:1,cursor:"grab",flexShrink:0}}>
            <span style={{color:"rgba(0,0,0,0.15)",fontSize:"14px",userSelect:"none"}}>⠿</span>
            <input value={a} onChange={e=>{const n=[...items];n[i]=e.target.value;setItems(n);}} style={{...inp,flex:1,minWidth:0}} onClick={e=>e.stopPropagation()}/>
            <button className="cpb cpb-ghost" onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(0,0,0,0.15)",cursor:"pointer",fontSize:"16px",lineHeight:1}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.15)"}>×</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:"6px",marginBottom:"18px",flexShrink:0}}>
        <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newTask.trim()){setItems([...items,newTask.trim()]);setNewTask("");}}} placeholder="New task…" style={{...inp,flex:1}}/>
        <button className="cpb cpb-primary" onClick={()=>{if(newTask.trim()){setItems([...items,newTask.trim()]);setNewTask("");}}} style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,cursor:"pointer"}}>Add</button>
      </div>
      <button className="cpb cpb-primary" onClick={()=>{onSave(items.filter(a=>a.trim()));onClose();}} style={{width:"100%",padding:"12px",borderRadius:"12px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",flexShrink:0}}>Save</button>
    </div>
  );
}

/* ── Manage Templates — same shape as ManageTasksModal, for saved timer
   templates. Built-ins are listed underneath as reference only (they're not
   user-editable, so there's nothing to manage about them). ── */
function ManageTemplatesModal({templates,onSave,onClose}){
  const[items,setItems]=useState([...templates]);const[draggingIdx,setDraggingIdx]=useState(null);
  const inp={padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:500,outline:"none",fontFamily:"'Source Sans 3',sans-serif"};
  const hds=(e,i)=>{setDraggingIdx(i);e.dataTransfer.effectAllowed="move";};
  const hdo=(e,ti)=>{e.preventDefault();if(draggingIdx===null||draggingIdx===ti){setDraggingIdx(null);return;}setItems(p=>{const a=[...p];const[it]=a.splice(draggingIdx,1);a.splice(ti,0,it);return a;});setDraggingIdx(null);};
  const summarize=t=>t.segments.map(s=>{const m=parseInt(s.minutes)||0,sec=parseInt(s.seconds)||0;return `${s.task} ${m?`${m}m`:''}${sec?`${sec}s`:''}`.trim();}).join(' → ');
  return(
    <div className="cp-pop" style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"440px",maxHeight:"85vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}><h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage Templates</h2><button className="cpb cpb-ghost" onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button></div>
      <p style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"16px",lineHeight:1.5}}>Multi-step timers you've saved from the builder. Rename, reorder, or delete them here.</p>
      {items.length===0?(
        <div style={{padding:"20px 0",textAlign:"center",color:"rgba(0,0,0,0.25)",fontSize:"12.5px",fontStyle:"italic"}}>No saved templates yet — build a timer and hit "Save Template".</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px",overflowY:"auto",maxHeight:"280px",paddingRight:"2px"}}>
          {items.map((t,i)=>(
            <div key={i} draggable onDragStart={e=>hds(e,i)} onDragOver={e=>e.preventDefault()} onDrop={e=>hdo(e,i)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",borderRadius:"10px",background:draggingIdx===i?"rgba(0,0,0,0.04)":"#fafbfc",border:"1px solid rgba(0,0,0,0.04)",opacity:draggingIdx===i?0.4:1,cursor:"grab",flexShrink:0}}>
              <span style={{color:"rgba(0,0,0,0.15)",fontSize:"14px",userSelect:"none"}}>⠿</span>
              <div style={{flex:1,minWidth:0}}>
                <input value={t.name} onChange={e=>{const n=[...items];n[i]={...n[i],name:e.target.value};setItems(n);}} style={{...inp,width:"100%",boxSizing:"border-box",marginBottom:"3px"}} onClick={e=>e.stopPropagation()}/>
                <div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{summarize(t)}</div>
              </div>
              <button className="cpb cpb-ghost" onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(0,0,0,0.15)",cursor:"pointer",fontSize:"16px",lineHeight:1,flexShrink:0}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.15)"}>×</button>
            </div>
          ))}
        </div>
      )}
      {DEFAULT_TEMPLATES.length>0&&(
        <div style={{marginBottom:"18px",flexShrink:0}}>
          <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"6px"}}>Built-in (always available)</div>
          <div style={{display:"flex",flexDirection:"column",gap:"4px",overflowY:"auto",maxHeight:"96px"}}>
            {DEFAULT_TEMPLATES.map((t,i)=>(
              <div key={i} style={{padding:"6px 10px",borderRadius:"8px",background:"rgba(0,0,0,0.02)",fontSize:"11.5px",color:"rgba(0,0,0,0.4)"}}>
                <span style={{fontWeight:600}}>{t.name}</span> — {summarize(t)}
              </div>
            ))}
          </div>
        </div>
      )}
      <button className="cpb cpb-primary" onClick={()=>{onSave(items);onClose();}} style={{width:"100%",padding:"12px",borderRadius:"12px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",flexShrink:0}}>Save</button>
    </div>
  );
}

/* ── Builder Panel ── */
function BuilderPanel({onAdd,onClose,savedTemplates,onSaveTemplate,onDeleteTemplate,actions,onManageTasks,onManageTemplates}){
  const[segments,setSegments]=useState([]);const[timerName,setTimerName]=useState("");const[repeatMode,setRepeatMode]=useState("none");const[repeatCount,setRepeatCount]=useState(3);const[dragOver,setDragOver]=useState(false);const[draggingIdx,setDraggingIdx]=useState(null);const[customTask,setCustomTask]=useState("");const[showSaveConfirm,setShowSaveConfirm]=useState(false);const[paraMode,setParaMode]=useState(false);
  const allTemplates=[...DEFAULT_TEMPLATES,...savedTemplates];
  useEffect(()=>{const s=shouldShowPara(segments);setParaMode(s);if(s&&repeatMode==="none"){setRepeatMode("count");setRepeatCount(3);}},[segments]);
  const dragStart=(e,task)=>{e.dataTransfer.setData("chip",task);e.dataTransfer.effectAllowed="copy";};
  const reorderStart=(e,i)=>{setDraggingIdx(i);e.dataTransfer.setData("reorder",String(i));e.dataTransfer.effectAllowed="move";};
  const drop=(e)=>{e.preventDefault();setDragOver(false);const d=e.dataTransfer.getData("chip");if(d)setSegments(p=>[...p,{task:d,minutes:2,seconds:0}]);setDraggingIdx(null);};
  const reorderDrop=(e,ti)=>{e.preventDefault();const cd=e.dataTransfer.getData("chip"),rd=e.dataTransfer.getData("reorder");
    if(cd){e.stopPropagation();setDragOver(false);setSegments(p=>{const a=[...p];a.splice(ti+1,0,{task:cd,minutes:2,seconds:0});return a;});setDraggingIdx(null);return;}
    if(rd){e.stopPropagation();const fi=parseInt(rd);if(isNaN(fi)||fi===ti){setDraggingIdx(null);return;}setSegments(p=>{const a=[...p];const[it]=a.splice(fi,1);a.splice(ti,0,it);return a;});setDraggingIdx(null);}
  };
  const updateSeg=(i,f,v)=>setSegments(p=>p.map((s,j)=>j===i?{...s,[f]:v}:s));
  const removeSeg=i=>setSegments(p=>p.filter((_,j)=>j!==i));
  const loadTpl=t=>{setSegments(t.segments.map(s=>({...s})));setTimerName(t.name);if(t.repeatMode)setRepeatMode(t.repeatMode);if(t.repeatCount)setRepeatCount(t.repeatCount);};
  const handleCreate=()=>{const v=segments.filter(s=>(parseInt(s.minutes)||0)+(parseInt(s.seconds)||0)>0).map(s=>({task:s.task,minutes:parseInt(s.minutes)||0,seconds:parseInt(s.seconds)||0}));if(!v.length)return;const name=timerName.trim()||v.map(s=>s.task).join(" → ");const repeat=repeatMode==="none"?null:repeatMode==="infinite"?{infinite:true}:{total:parseInt(repeatCount)||1};onAdd(name,v,repeat,paraMode&&shouldShowPara(v));onClose();};
  const handleSave=()=>{const v=segments.filter(s=>(parseInt(s.minutes)||0)+(parseInt(s.seconds)||0)>0).map(s=>({task:s.task,minutes:parseInt(s.minutes)||0,seconds:parseInt(s.seconds)||0}));if(!v.length)return;onSaveTemplate({name:timerName.trim()||v.map(s=>s.task).join(" → "),segments:v,paraphraseMode:paraMode,repeatMode,repeatCount:parseInt(repeatCount)||1});setShowSaveConfirm(true);setTimeout(()=>setShowSaveConfirm(false),2000);};
  const totalSec=segments.reduce((a,s)=>a+(parseInt(s.minutes)||0)*60+(parseInt(s.seconds)||0),0);
  const inp={padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:500,outline:"none",fontFamily:"'Source Sans 3',sans-serif"};
  const lbl={fontSize:"9.5px",fontWeight:600,color:"rgba(0,0,0,0.28)",letterSpacing:"1px",textTransform:"uppercase",textAlign:"center"};
  return(
    <div className="cp-pop" style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"520px",maxHeight:"90vh",overflowY:"auto",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}><h2 style={{margin:0,fontSize:"16px",fontWeight:700}}>Build a Timer</h2><button className="cpb cpb-ghost" onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button></div>
      <div style={{marginBottom:"18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <div style={{...lbl,textAlign:"left",fontSize:"11px",letterSpacing:"1.5px"}}>Templates</div>
          <button className="cpb cpb-ghost cpb-link" onClick={onManageTemplates} title="Rename or delete your saved templates" style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:0}}>📁 Manage templates</button>
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",maxHeight:"106px",overflowY:"auto",paddingRight:"2px"}}>
          {allTemplates.map((t,i)=>(<div key={i} style={{position:"relative",display:"inline-flex"}}><button className="cpb" onClick={()=>loadTpl(t)} title={`Load "${t.name}" into the timeline below`} style={{padding:"7px 14px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.06)",background:t.builtin?"#fafbfc":"#f0f4ff",cursor:"pointer",fontSize:"12.5px",fontWeight:600,color:t.builtin?"rgba(0,0,0,0.5)":"#2e6bce",paddingRight:t.builtin?"14px":"28px"}}>{t.name}</button>{!t.builtin&&<button className="cpb cpb-ghost" onClick={e=>{e.stopPropagation();onDeleteTemplate(i-DEFAULT_TEMPLATES.length);}} title={`Delete the "${t.name}" template`} style={{position:"absolute",right:"4px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(0,0,0,0.2)",cursor:"pointer",fontSize:"13px",lineHeight:1}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.2)"}>×</button>}</div>))}
        </div>
      </div>
      <div style={{marginBottom:"18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <div style={{...lbl,textAlign:"left",fontSize:"11px",letterSpacing:"1.5px"}}>Click or drag tasks into timeline</div>
          <button className="cpb cpb-ghost cpb-link" onClick={onManageTasks} title="Add, rename or delete your saved tasks" style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:0}}>🗂 Manage tasks</button>
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",maxHeight:"106px",overflowY:"auto",paddingRight:"2px"}}>
          {actions.map((task,i)=>{const c=COLORS[i%COLORS.length];return(<div className="cpo" key={task+i} draggable onDragStart={e=>dragStart(e,task)} onClick={()=>setSegments(p=>[...p,{task,minutes:2,seconds:0}])} title={`Add "${task}" as the next step in the timeline (or drag it in)`} style={{padding:"6px 14px",borderRadius:"14px",cursor:"pointer",background:c.bg,fontSize:"12.5px",fontWeight:600,color:c.text,userSelect:"none",transition:"transform 0.15s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>{task}</div>);})}
        </div>
        <div style={{display:"flex",gap:"6px",marginTop:"8px"}}>
          <input value={customTask} onChange={e=>setCustomTask(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&customTask.trim()){setSegments(p=>[...p,{task:customTask.trim(),minutes:2,seconds:0}]);setCustomTask("");}}} placeholder="Custom task…" style={{...inp,flex:1}}/>
          <button className="cpb cpb-dashed" onClick={()=>{if(customTask.trim()){setSegments(p=>[...p,{task:customTask.trim(),minutes:2,seconds:0}]);setCustomTask("");}}} title="Add this as a one-off step, without saving it to your task list" style={{padding:"7px 14px",borderRadius:"8px",border:"1px dashed rgba(0,0,0,0.15)",background:"none",cursor:"pointer",fontSize:"12px",fontWeight:600,color:"rgba(0,0,0,0.35)"}}>+ Add</button>
        </div>
      </div>
      <input value={timerName} onChange={e=>setTimerName(e.target.value)} placeholder="Timer name (optional)" style={{...inp,width:"100%",marginBottom:"14px",boxSizing:"border-box"}}/>
      <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={drop} style={{minHeight:segments.length===0?"100px":"auto",border:`2px dashed ${dragOver?"rgba(66,133,244,0.4)":"rgba(0,0,0,0.08)"}`,borderRadius:"14px",padding:"12px",background:dragOver?"rgba(66,133,244,0.03)":"rgba(0,0,0,0.015)",marginBottom:"14px",display:"flex",flexDirection:"column",gap:"6px"}}>
        {segments.length===0&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"76px",color:"rgba(0,0,0,0.2)",fontSize:"13px",fontStyle:"italic"}}>Drop tasks here to build your timeline</div>}
        {segments.length>0&&(<div style={{display:"flex",alignItems:"center",gap:"10px",padding:"0 12px 2px"}}><span style={{width:"14px"}}/><span style={{...lbl,flex:1,textAlign:"left"}}>Task</span><span style={{...lbl,width:"42px"}}>Min</span><span style={{width:"8px"}}/><span style={{...lbl,width:"42px"}}>Sec</span><span style={{width:"22px"}}/></div>)}
        {segments.map((seg,i)=>{const c=COLORS[i%COLORS.length];return(<div key={i} draggable onDragStart={e=>reorderStart(e,i)} onDragOver={e=>e.preventDefault()} onDrop={e=>reorderDrop(e,i)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"10px",background:draggingIdx===i?"rgba(0,0,0,0.04)":"#fff",border:"1px solid rgba(0,0,0,0.05)",opacity:draggingIdx===i?0.4:1,cursor:"grab"}}><span style={{color:"rgba(0,0,0,0.15)",fontSize:"14px",cursor:"grab",userSelect:"none"}}>⠿</span><input value={seg.task} onChange={e=>updateSeg(i,"task",e.target.value)} style={{...inp,flex:1,minWidth:0,border:"none",background:"transparent",padding:"4px 0",fontWeight:600,color:c.text}}/><input type="number" value={seg.minutes} onChange={e=>updateSeg(i,"minutes",e.target.value)} min="0" style={{...inp,width:"42px",textAlign:"center",padding:"5px 4px"}}/><span style={{color:"rgba(0,0,0,0.15)",fontWeight:300}}>:</span><input type="number" value={seg.seconds} onChange={e=>updateSeg(i,"seconds",e.target.value)} min="0" max="59" style={{...inp,width:"42px",textAlign:"center",padding:"5px 4px"}}/><button className="cpb cpb-ghost" onClick={()=>removeSeg(i)} style={{background:"none",border:"none",color:"rgba(0,0,0,0.15)",cursor:"pointer",fontSize:"16px",padding:"2px 6px",lineHeight:1,flexShrink:0}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.15)"}>×</button></div>);})}
      </div>
      {segments.length>0&&<div style={{textAlign:"right",fontSize:"12px",color:"rgba(0,0,0,0.3)",marginBottom:"14px",fontWeight:600}}>Total: {fmt(totalSec)}</div>}
      {shouldShowPara(segments)&&(<div style={{padding:"12px 14px",borderRadius:"10px",background:"linear-gradient(135deg,#fdf5e6,#fef9f0)",border:"1px solid rgba(234,170,60,0.25)",marginBottom:"14px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px",marginBottom:paraMode?"6px":0}}><span style={{fontSize:"12.5px",fontWeight:700,color:"#8a6d20"}}>Paraphrase mode</span><button className="cp-swbtn" onClick={()=>setParaMode(!paraMode)} title="Paraphrase mode on or off"><CPSwitch on={paraMode}/></button></div>{paraMode&&<div style={{fontSize:"11.5px",color:"#8a6d20",lineHeight:1.5,opacity:0.85}}>First round skips the paraphrase. Last round adds an extra one. Set repetitions = number of students.</div>}</div>)}
      <div style={{marginBottom:"20px"}}>
        <div style={{...lbl,textAlign:"left",marginBottom:"8px",fontSize:"11px",letterSpacing:"1.5px"}}>Repeat</div>
        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
          {[["none","Once","Run through the timeline a single time"],["count","Repeat","Run through the timeline a set number of times"],["infinite","Loop ∞","Keep looping the timeline until you stop it"]].map(([v,l,help])=>(<button className={`cpb${repeatMode===v?" on":""}`} key={v} onClick={()=>setRepeatMode(v)} title={help} style={{padding:"7px 14px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:600,background:repeatMode===v?"#1a1a2e":"rgba(0,0,0,0.04)",color:repeatMode===v?"#fff":"rgba(0,0,0,0.4)"}}>{l}</button>))}
          {repeatMode==="count"&&<><input type="number" value={repeatCount} onChange={e=>setRepeatCount(e.target.value)} min="1" style={{...inp,width:"50px",textAlign:"center",marginLeft:"4px"}}/>{paraMode&&<span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)"}}>students</span>}</>}
        </div>
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <button className={`cpb cpb-primary${!segments.length?" is-off":""}`} onClick={handleCreate} disabled={!segments.length} title="Create this timer and start it running now" style={{flex:1,padding:"13px",borderRadius:"12px",border:"none",background:!segments.length?"rgba(0,0,0,0.06)":"#1a1a2e",color:!segments.length?"rgba(0,0,0,0.2)":"#fff",fontSize:"14px",fontWeight:600,cursor:!segments.length?"default":"pointer"}}>Start Timer</button>
        <button className={`cpb${showSaveConfirm?" cpb-mint":""}`} onClick={handleSave} disabled={!segments.length} title="Save this timeline as a reusable template, without starting it" style={{padding:"13px 18px",borderRadius:"12px",border:!segments.length?"1px solid rgba(0,0,0,0.04)":"1px solid rgba(0,0,0,0.1)",background:showSaveConfirm?"#edf7ef":"#fff",color:showSaveConfirm?"#3a8a4e":!segments.length?"rgba(0,0,0,0.15)":"rgba(0,0,0,0.5)",fontSize:"13px",fontWeight:600,cursor:!segments.length?"default":"pointer",whiteSpace:"nowrap"}}>{showSaveConfirm?"✓ Saved!":"Save Template"}</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CLASS CHIPS — one-click class switching in the banner
   ══════════════════════════════════════════════════════════ */
const CHIP_PALETTE=["#b2efc4","#9ccaf9","#d2f5fb","#ffd98a","#ffb3a1"]; // the app icon's mint, sky, cyan, sunny, coral
const CHIP_INK="#2b2118";
function ClassChips({classes,activeClassId,onSetActiveClass,measureRef}){
  const ownRef=useRef(null);const rowRef=measureRef||ownRef;
  /* Mouse wheel scrolls the row sideways (the scrollbar is hidden). Native
     listener because React's onWheel is passive and can't preventDefault. */
  useEffect(()=>{
    const el=rowRef.current;if(!el)return;
    const onWheel=e=>{
      if(el.scrollWidth<=el.clientWidth)return;
      e.preventDefault();
      el.scrollLeft+=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
    };
    el.addEventListener("wheel",onWheel,{passive:false});
    return()=>el.removeEventListener("wheel",onWheel);
  },[]);
  /* Keep the active chip visible. Done by hand with scrollLeft because
     scrollIntoView can also scroll the page vertically. */
  useEffect(()=>{
    const el=rowRef.current;if(!el)return;
    const chip=[...el.children].find(c=>c.dataset.classId===activeClassId);
    if(!chip)return;
    const l=chip.offsetLeft,r=l+chip.offsetWidth;
    if(l<el.scrollLeft)el.scrollLeft=Math.max(0,l-6);
    else if(r>el.scrollLeft+el.clientWidth)el.scrollLeft=r-el.clientWidth+6;
  },[activeClassId,classes.length]);
  return(
    <div ref={rowRef} className="no-drag cp-chips" style={{display:"flex",alignItems:"center",gap:"6px",flex:"1 1 0",minWidth:0,overflowX:"auto",overflowY:"hidden",scrollbarWidth:"none",padding:"3px 4px"}}>
      {classes.map((c,i)=>{
        const active=c.id===activeClassId;
        const colour=c.color||c.colour||CHIP_PALETTE[i%CHIP_PALETTE.length];
        const n=c.students.length;
        return(
          <button key={c.id} data-class-id={c.id} onClick={()=>{if(!active)onSetActiveClass(c.id);}}
            title={`${active?"Current class":"Switch to"} ${c.name} (${n} student${n!==1?"s":""})${i<9?` — Alt+${i+1}`:""}`}
            style={{flexShrink:0,display:"flex",alignItems:"center",gap:"6px",maxWidth:"170px",padding:"4px 12px",borderRadius:"999px",border:`1.6px solid ${active?CHIP_INK:"rgba(43,33,24,0.45)"}`,background:active?colour:"transparent",color:CHIP_INK,fontSize:"12.5px",fontWeight:active?700:600,fontFamily:"'Source Sans 3',sans-serif",cursor:active?"default":"pointer",boxShadow:active?"1.5px 2px 0 rgba(43,33,24,0.55)":"none",transition:"background 0.12s"}}
            onMouseEnter={e=>{if(!active)e.currentTarget.style.background=colour+"99";}}
            onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}
          >
            {!active&&<span style={{width:"8px",height:"8px",borderRadius:"50%",background:colour,border:`1px solid ${CHIP_INK}`,flexShrink:0}}/>}
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DOTS MENU
   ══════════════════════════════════════════════════════════ */
function DotsMenu({classes,activeClassId,onSetActiveClass,onNewClass,onManageClass,onDeleteClass,showList=true}){
  const[open,setOpen]=useState(false);
  const[confirmDeleteId,setConfirmDeleteId]=useState(null);
  const ref=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setConfirmDeleteId(null);}};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);
  useEffect(()=>{if(!open)setConfirmDeleteId(null);},[open]);
  const activeClass=classes.find(c=>c.id===activeClassId);
  const menuItem={display:"flex",alignItems:"center",gap:"8px",width:"100%",textAlign:"left",padding:"9px 16px",background:"none",border:"none",cursor:"pointer",fontSize:"13px",color:"#1a1a2e",fontFamily:"'Source Sans 3',sans-serif",fontWeight:400,};
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button className={`cpb cpb-tab${open?" on":""}`} onClick={()=>setOpen(o=>!o)} style={{background:open?"rgba(255,255,255,0.3)":"none",border:"1px solid rgba(74,49,28,0.22)",borderRadius:"6px",padding:"4px 9px",cursor:"pointer",color:open?"rgba(74,49,28,0.9)":"rgba(74,49,28,0.65)",fontSize:"16px",lineHeight:1,fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(74,49,28,0.4)";e.currentTarget.style.color="rgba(74,49,28,0.9)";}} onMouseLeave={e=>{if(!open){e.currentTarget.style.borderColor="rgba(74,49,28,0.22)";e.currentTarget.style.color="rgba(74,49,28,0.65)";}}} title="Classes: switch class, add a new class, manage or delete this one">Classes{showList&&activeClass?<span style={{fontWeight:700,maxWidth:"160px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"inline-block",verticalAlign:"bottom"}}>: {activeClass.name}</span>:null} <span style={{fontSize:"9px"}}>▾</span></button>
      {open&&(
        <div className="cp-pop" style={{position:"absolute",left:0,top:"calc(100% + 6px)",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"14px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:"230px",zIndex:400,overflow:"hidden",animation:"fadeIn 0.15s ease"}}>
          {/* Active class header */}
          <div style={{padding:"14px 16px 10px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"3px"}}>Active class</div>
            <div style={{fontSize:"15px",fontWeight:700,color:"#1a1a2e"}}>{activeClass?.name||"No class"}</div>
            {activeClass?.isDemo&&<div style={{fontSize:"10.5px",color:"#b8850a",marginTop:"2px",fontWeight:500}}>Demo data — click Manage class to replace</div>}
            {activeClass&&!activeClass.isDemo&&<div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.3)",marginTop:"2px"}}>{activeClass.students.length} student{activeClass.students.length!==1?"s":""}</div>}
          </div>
          {/* When the window is too narrow for the class buttons, the classes are listed here instead */}
          {showList&&classes.length>1&&(
            <div style={{padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.06)",maxHeight:"50vh",overflowY:"auto"}}>
              {classes.map((c,i)=>{
                const active=c.id===activeClassId;
                const colour=c.color||c.colour||CHIP_PALETTE[i%CHIP_PALETTE.length];
                return(
                  <button key={c.id} className={`cpb cpb-item${active?" on":""}`} onClick={()=>{if(!active)onSetActiveClass(c.id);setOpen(false);}} title={`${active?"Current class":"Switch to"} ${c.name}${i<9?` (Alt+${i+1})`:""}`} style={{...menuItem,fontWeight:active?700:400}}>
                    <span style={{width:"10px",height:"10px",borderRadius:"50%",background:colour,border:`1px solid ${CHIP_INK}`,flexShrink:0}}/>
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
                    {active&&<span style={{fontSize:"11px"}}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
            <button className="cpb cpb-item" onClick={()=>{onNewClass();setOpen(false);}} title="Add a new class with its own roster" style={{...menuItem,color:"rgba(0,0,0,0.55)",}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span style={{fontSize:"15px",lineHeight:1}}>+</span><span>New class</span>
            </button>
          </div>
          {/* Manage */}
          <div style={{padding:"6px 0"}}>
            <button className="cpb cpb-item" onClick={()=>{onManageClass();setOpen(false);}} style={{...menuItem,fontWeight:600}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span>Manage class</span><span style={{marginLeft:"auto",color:"rgba(0,0,0,0.25)",fontSize:"12px"}}>→</span>
            </button>
            {activeClass&&(confirmDeleteId===activeClass.id?(
              <div style={{padding:"8px 16px",background:"#fdeeed"}}>
                <div style={{fontSize:"12px",color:"#c44",fontWeight:600,marginBottom:"7px",lineHeight:1.4}}>Delete "{activeClass.name}"? This removes its roster, seating and checklist.</div>
                <div style={{display:"flex",gap:"6px"}}>
                  <button className="cpb cpb-danger" onClick={()=>{onDeleteClass(activeClass.id);setConfirmDeleteId(null);setOpen(false);}} style={{flex:1,padding:"6px 0",borderRadius:"7px",border:"none",background:"#eb5757",color:"#fff",fontSize:"11.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Delete</button>
                  <button className="cpb" onClick={()=>setConfirmDeleteId(null)} style={{flex:1,padding:"6px 0",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"11.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Cancel</button>
                </div>
              </div>
            ):(
              <button className="cpb cpb-item cpb-bad" onClick={()=>setConfirmDeleteId(activeClass.id)} title={`Delete ${activeClass.name} and its seating, groups and checklist`} style={{...menuItem,color:"#c44"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(235,87,87,0.07)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <span>Delete this class…</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MANAGE CLASS MODAL
   ══════════════════════════════════════════════════════════ */
function ManageClassModal({classToEdit,onSave,onClose}){
  const[name,setName]=useState(classToEdit.name);
  const[students,setStudents]=useState(classToEdit.students.map(s=>({...s,tags:s.tags||[]})));
  const[importText,setImportText]=useState("");
  const[importFeedback,setImportFeedback]=useState("");
  const[editingId,setEditingId]=useState(null);
  const[editForm,setEditForm]=useState(null);
  const[confirmDeleteId,setConfirmDeleteId]=useState(null);
  const[addForm,setAddForm]=useState({name:"",gender:"M",grade:"",ls:false,eal:false,coldCallExcluded:false,tags:[]});
  const[avTags,setAvTags]=useState(classToEdit.availableTags||DEFAULT_SEAT_TAGS);
  const[phMode,setPhMode]=useState('combined'); // 'combined' | 'separate' — shared vs independent pairing history
  const[groupsHistoryCount,setGroupsHistoryCount]=useState(0);
  const[seatingHistoryCount,setSeatingHistoryCount]=useState(0);
  const[historyClearing,setHistoryClearing]=useState(null); // null | 'groups' | 'seating' | 'both'
  const inp={padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:500,outline:"none",fontFamily:"'Source Sans 3',sans-serif"};
  const lbl={fontSize:"9.5px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.28)",marginBottom:"8px"};

  /* Merge seating-panel tags so they stay in sync; also load the pairing
     history mode + counts (combined store, or the two independent ones,
     depending on which mode is currently set). */
  const loadHistoryCounts=useCallback(mode=>{
    if(mode==='separate'){
      load(phKey(classToEdit.id,'separate','groups'),{}).then(ph=>setGroupsHistoryCount(Object.keys(ph||{}).length));
      load(phKey(classToEdit.id,'separate','seating'),{}).then(ph=>setSeatingHistoryCount(Object.keys(ph||{}).length));
    } else {
      load(phKey(classToEdit.id,'combined'),{}).then(ph=>{
        const n=Object.keys(ph||{}).length;
        setGroupsHistoryCount(n);setSeatingHistoryCount(n);
      });
    }
  },[classToEdit.id]);
  useEffect(()=>{
    load(`sl-${classToEdit.id}`,null).then(layout=>{
      if(layout?.tags?.length){
        setAvTags(prev=>[...new Set([...prev,...layout.tags])]);
      }
    });
    load(`ph-mode-${classToEdit.id}`,'combined').then(m=>{
      const mode=m==='separate'?'separate':'combined';
      setPhMode(mode);
      loadHistoryCounts(mode);
    });
  },[classToEdit.id,loadHistoryCounts]);

  /* Pairing history — "who's already worked with whom" — drives Smart shuffle
     in both Groups and Manage Seating. Clearing it here (rather than only
     from the Groups tab) covers the case where a teacher just wants a clean
     slate for the term without hunting for it. Switching combined/separate
     doesn't merge or migrate anything — it just changes which store gets
     read/written from now on, so nothing already recorded is lost. */
  const togglePhMode=()=>{
    const next=phMode==='combined'?'separate':'combined';
    setPhMode(next);
    save(`ph-mode-${classToEdit.id}`,next);
    loadHistoryCounts(next);
  };
  const clearPairingHistory=target=>{
    if(phMode==='separate'){
      if(target==='groups'||target==='both')save(phKey(classToEdit.id,'separate','groups'),{});
      if(target==='seating'||target==='both')save(phKey(classToEdit.id,'separate','seating'),{});
    } else {
      save(phKey(classToEdit.id,'combined'),{});
    }
    loadHistoryCounts(phMode);
    setHistoryClearing(null);
  };

  const MAX_STUDENTS=200;

  const handleImport=()=>{
    const parsed=parseRoster(importText);
    if(!parsed.length){setImportFeedback("⚠ Couldn't parse any students — check format");setTimeout(()=>setImportFeedback(""),3000);return;}
    const trimmed=parsed.slice(0,MAX_STUDENTS);
    setStudents(trimmed);setImportText("");
    setImportFeedback(`✓ ${trimmed.length} students imported${parsed.length>MAX_STUDENTS?` (capped at ${MAX_STUDENTS})`:""}`)
    setTimeout(()=>setImportFeedback(""),3000);
    setEditingId(null);setEditForm(null);
  };
  const handleAdd=()=>{
    if(!addForm.name.trim()||students.length>=MAX_STUDENTS)return;
    setStudents(p=>[...p,{id:`s-${Date.now()}-${Math.random()}`,name:addForm.name.trim(),gender:addForm.gender,grade:addForm.grade||"",ls:addForm.ls,eal:addForm.eal,coldCallExcluded:addForm.coldCallExcluded||false,tags:addForm.tags||[]}]);
    setAddForm(p=>({...p,name:"",ls:false,eal:false,coldCallExcluded:false,tags:[]}));
  };
  const handleDelete=id=>{setStudents(p=>p.filter(s=>s.id!==id));if(editingId===id){setEditingId(null);setEditForm(null);}};
  const handleEditStart=s=>{setEditingId(s.id);setEditForm({...s,tags:s.tags||[]});};
  const handleEditSave=()=>{if(!editForm)return;setStudents(p=>p.map(s=>s.id===editForm.id?{...editForm}:s));setEditingId(null);setEditForm(null);};
  /* "Save class" must capture whatever's mid-edit in the roster row, even if
     the teacher never clicked that row's own "Done" — otherwise clicking
     Save just silently drops the edit, since setStudents() inside
     handleEditSave() wouldn't be reflected in `students` until the next
     render, which is too late for the onSave(...) call right below it. */
  const handleSave=()=>{
    const finalStudents=editingId&&editForm?students.map(s=>s.id===editForm.id?{...editForm}:s):students;
    if(editingId){setStudents(finalStudents);setEditingId(null);setEditForm(null);}
    onSave({...classToEdit,name:name.trim()||"Untitled class",students:finalStudents,availableTags:avTags,isDemo:false});
  };

  const tagBtn=(active,label,onClick,activeStyle)=>(<button className="cpo" onClick={onClick} style={{padding:"5px 10px",borderRadius:"7px",border:`1px solid ${active?activeStyle.border:"rgba(0,0,0,0.08)"}`,background:active?activeStyle.bg:"#fff",color:active?activeStyle.text:"rgba(0,0,0,0.35)",fontSize:"11px",fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>);

  /* Tag toggle for student (adds/removes from tags array) */
  const toggleStudentTag=(form,setForm,tag)=>{
    setForm(p=>({...p,tags:p.tags.includes(tag)?p.tags.filter(t=>t!==tag):[...p.tags,tag]}));
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"20px",fontFamily:"'Source Sans 3',sans-serif"}}>
      <div className="cp-pop" style={{background:"#fff",borderRadius:"22px",padding:"0",boxShadow:"0 8px 60px rgba(0,0,0,0.15)",width:"100%",maxWidth:"600px",maxHeight:"88vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.25s ease",overflow:"hidden"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 28px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
          <h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage class</h2>
          <button className="cpb cpb-ghost" onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1,padding:"4px 8px"}}>×</button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"20px 28px"}}>

          {/* Class name */}
          <div style={{marginBottom:"20px"}}>
            <div style={lbl}>Class name</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Year 10A" style={{...inp,width:"100%",fontSize:"15px",fontWeight:600,boxSizing:"border-box"}}/>
          </div>

          {/* Demo banner */}
          {classToEdit.isDemo&&(
            <div style={{padding:"10px 14px",borderRadius:"10px",background:"#fdf5e6",border:"1px solid rgba(234,170,60,0.3)",marginBottom:"20px",fontSize:"12px",color:"#8a6d20",fontWeight:500,lineHeight:1.5}}>
              This is demo data. Import your class roster below or add students manually. Saving will replace the demo.
            </div>
          )}

          {/* Import */}
          <div style={{marginBottom:"24px",padding:"14px 16px",background:"rgba(0,0,0,0.02)",borderRadius:"12px",border:"1px solid rgba(0,0,0,0.05)"}}>
            <div style={lbl}>Import from spreadsheet</div>
            <textarea value={importText} onChange={e=>setImportText(e.target.value)} rows={4} placeholder={"Paste Name, Gender, Grade, LS, EAL — one row per student (header row optional)\nOliver Chen\tM\t10\tno\tyes\nAmelia Patel\tF\t10\tno\tyes"} style={{...inp,width:"100%",resize:"vertical",lineHeight:1.55,fontSize:"12px",fontFamily:"monospace",boxSizing:"border-box",marginBottom:"8px"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <button className={`cpb${importText.trim()?" on":""}`} onClick={handleImport} disabled={!importText.trim()} style={{padding:"7px 16px",borderRadius:"8px",border:"none",background:importText.trim()?"#1a1a2e":"rgba(0,0,0,0.06)",color:importText.trim()?"#fff":"rgba(0,0,0,0.2)",fontSize:"12px",fontWeight:600,cursor:importText.trim()?"pointer":"default"}}>Import — replaces roster</button>
              {importFeedback&&<span style={{fontSize:"12px",color:importFeedback.startsWith("⚠")?"#c44":"#3a8a4e",fontWeight:600}}>{importFeedback}</span>}
            </div>
          </div>

          {/* Roster */}
          <div style={{marginBottom:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <div style={{...lbl,margin:0}}>Roster ({students.length}/{MAX_STUDENTS})</div>
            </div>
            <div style={{maxHeight:"280px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"3px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.06)",padding:"6px"}}>
              {students.length===0&&<div style={{padding:"28px",textAlign:"center",color:"rgba(0,0,0,0.2)",fontSize:"13px",fontStyle:"italic"}}>No students yet</div>}
              {students.map(s=>(
                confirmDeleteId===s.id?(
                  <div key={s.id} style={{padding:"9px 10px",borderRadius:"9px",background:"#fdeeed",border:"1px solid rgba(200,60,60,0.25)"}}>
                    <div style={{fontSize:"12px",color:"#c44",fontWeight:600,marginBottom:"7px",lineHeight:1.4}}>Remove {s.name}? This also clears them from the seating plan and the checklist.</div>
                    <div style={{display:"flex",gap:"6px"}}>
                      <button className="cpb cpb-danger" onClick={()=>{handleDelete(s.id);setConfirmDeleteId(null);}} style={{flex:1,padding:"6px 0",borderRadius:"7px",border:"none",background:"#eb5757",color:"#fff",fontSize:"11.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Remove</button>
                      <button className="cpb" onClick={()=>setConfirmDeleteId(null)} style={{flex:1,padding:"6px 0",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"11.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Cancel</button>
                    </div>
                  </div>
                ):editingId===s.id?(
                  <div key={s.id} style={{display:"flex",gap:"5px",alignItems:"flex-start",padding:"10px",borderRadius:"9px",background:"#eaf1fc",border:"1px solid rgba(66,133,244,0.2)",flexWrap:"wrap"}}>
                    <div style={{display:"flex",gap:"5px",flexWrap:"wrap",width:"100%",marginBottom:"6px"}}>
                      <input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} style={{...inp,flex:1,minWidth:"130px",padding:"5px 8px",fontSize:"12px"}}/>
                      <select value={editForm.gender} onChange={e=>setEditForm(p=>({...p,gender:e.target.value}))} style={{...inp,padding:"5px 4px",fontSize:"12px",width:"52px"}}>
                        <option value="M">M</option><option value="F">F</option><option value="">—</option>
                      </select>
                      <input value={editForm.grade||""} onChange={e=>setEditForm(p=>({...p,grade:e.target.value.replace(/\D/g,"").slice(0,2)}))} maxLength={2} placeholder="Gr" style={{...inp,width:"38px",padding:"5px 4px",fontSize:"12px",textAlign:"center"}}/>
                    </div>
                    <div style={{display:"flex",gap:"4px",flexWrap:"wrap",width:"100%",alignItems:"center"}}>
                      {tagBtn(editForm.coldCallExcluded,"No CC",()=>setEditForm(p=>({...p,coldCallExcluded:!p.coldCallExcluded})),{bg:"#fdeeed",text:"#c44",border:"rgba(220,80,80,0.3)"})}
                      <span style={{fontSize:"10px",color:"rgba(0,0,0,0.3)",padding:"0 4px"}}>Tags:</span>
                      {avTags.map((tag,i)=>{const tc=stCol(tag);const has=(editForm.tags||[]).includes(tag);return(
                        <button className="cpo" key={tag} onClick={()=>toggleStudentTag(editForm,setEditForm,tag)} style={{padding:"3px 8px",borderRadius:"6px",border:`1px solid ${has?tc.t:"rgba(0,0,0,0.08)"}`,background:has?tc.b:"#fff",color:has?tc.t:"rgba(0,0,0,0.4)",fontSize:"10px",fontWeight:700,cursor:"pointer"}}>{tag}</button>
                      );})}
                      <button className="cpb cpb-primary" onClick={handleEditSave} style={{marginLeft:"auto",padding:"5px 12px",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"11px",fontWeight:600,cursor:"pointer"}}>Done</button>
                    </div>
                  </div>
                ):(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 10px",borderRadius:"9px",background:"#fff",border:"1px solid rgba(0,0,0,0.04)"}}>
                    <span style={{fontSize:"13px",fontWeight:500,color:"#1a1a2e",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginRight:"2px"}}>{s.name}</span>
                    {s.gender&&<span style={{fontSize:"10px",fontWeight:600,padding:"1px 5px",borderRadius:"5px",background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)",flexShrink:0}}>{s.gender}</span>}
                    {s.grade&&<span style={{fontSize:"10px",fontWeight:600,padding:"1px 5px",borderRadius:"5px",background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)",flexShrink:0}}>{s.grade}</span>}
                    {/* Student tags — right-aligned, coloured like seating plan */}
                    <div style={{display:"flex",gap:"3px",flexWrap:"wrap",flex:1,justifyContent:"flex-end",alignItems:"center"}}>
                      {(s.tags||[]).map((tag,i)=>{const tc=stCol(tag);return(
                        <span key={tag} style={{fontSize:"9.5px",fontWeight:700,padding:"1px 6px",borderRadius:"5px",background:tc.b,color:tc.t,flexShrink:0}}>{tag}</span>
                      );})}
                      {s.coldCallExcluded&&<span style={{fontSize:"9.5px",fontWeight:700,padding:"1px 6px",borderRadius:"5px",background:"#fdeeed",color:"#c44",flexShrink:0}}>No CC</span>}
                    </div>
                    <button className="cpb cpb-ghost" onClick={()=>handleEditStart(s)} style={{background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"14px",padding:"2px 5px",lineHeight:1,flexShrink:0}} onMouseEnter={e=>e.target.style.color="rgba(0,0,0,0.6)"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.25)"} title="Edit">✎</button>
                    <button className="cpb cpb-ghost cpb-bad" onClick={()=>setConfirmDeleteId(s.id)} style={{background:"none",border:"none",color:"rgba(200,60,60,0.45)",cursor:"pointer",fontSize:"18px",padding:"2px 5px",lineHeight:1,flexShrink:0,fontWeight:300}} onMouseEnter={e=>e.target.style.color="rgba(200,60,60,1)"} onMouseLeave={e=>e.target.style.color="rgba(200,60,60,0.45)"} title="Remove">×</button>
                  </div>
                )
              ))}
            </div>
            {students.length>=MAX_STUDENTS&&<div style={{fontSize:"11px",color:"#b8850a",marginTop:"6px",fontWeight:500}}>Maximum {MAX_STUDENTS} students reached.</div>}
          </div>

          {/* Add student */}
          <div style={{padding:"14px 16px",borderRadius:"12px",background:"rgba(0,0,0,0.02)",border:"1px solid rgba(0,0,0,0.05)"}}>
            <div style={lbl}>Add student</div>
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap",alignItems:"center",marginBottom:"8px"}}>
              <input value={addForm.name} onChange={e=>setAddForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleAdd()} placeholder="Full name" style={{...inp,flex:1,minWidth:"130px"}}/>
              <select value={addForm.gender} onChange={e=>setAddForm(p=>({...p,gender:e.target.value}))} style={{...inp,width:"60px",padding:"7px 4px"}}>
                <option value="M">M</option><option value="F">F</option><option value="">—</option>
              </select>
              <input value={addForm.grade||""} onChange={e=>setAddForm(p=>({...p,grade:e.target.value.replace(/\D/g,"").slice(0,2)}))} maxLength={2} placeholder="Gr" style={{...inp,width:"42px",textAlign:"center"}}/>
              {tagBtn(addForm.coldCallExcluded,"No CC",()=>setAddForm(p=>({...p,coldCallExcluded:!p.coldCallExcluded})),{bg:"#fdeeed",text:"#c44",border:"rgba(220,80,80,0.3)"})}
            </div>
            <div style={{display:"flex",gap:"4px",flexWrap:"wrap",alignItems:"center",marginBottom:"8px"}}>
              <span style={{fontSize:"10px",color:"rgba(0,0,0,0.3)",marginRight:"2px"}}>Tags:</span>
              {avTags.map((tag,i)=>{const tc=stCol(tag);const has=(addForm.tags||[]).includes(tag);return(
                <button className="cpo" key={tag} onClick={()=>toggleStudentTag(addForm,setAddForm,tag)} style={{padding:"3px 8px",borderRadius:"6px",border:`1px solid ${has?tc.t:"rgba(0,0,0,0.08)"}`,background:has?tc.b:"#fff",color:has?tc.t:"rgba(0,0,0,0.4)",fontSize:"10px",fontWeight:700,cursor:"pointer"}}>{tag}</button>
              );})}
            </div>
            <button className={`cpb cpb-primary${students.length>=MAX_STUDENTS?" is-off":""}`} onClick={handleAdd} disabled={students.length>=MAX_STUDENTS} style={{padding:"7px 16px",borderRadius:"8px",border:"none",background:students.length>=MAX_STUDENTS?"rgba(0,0,0,0.06)":"#1a1a2e",color:students.length>=MAX_STUDENTS?"rgba(0,0,0,0.2)":"#fff",fontSize:"12px",fontWeight:600,cursor:students.length>=MAX_STUDENTS?"default":"pointer"}}>+ Add student</button>
          </div>

          {/* Pairing history — feeds Smart shuffle in Groups and in Manage
              Seating; can be one shared record or two independent ones. */}
          <div style={{marginTop:"20px",padding:"14px 16px",borderRadius:"12px",background:"rgba(0,0,0,0.02)",border:"1px solid rgba(0,0,0,0.05)"}}>
            <div style={lbl}>Pairing history</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px",marginBottom:"12px"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:"12px",fontWeight:600,color:"#1a1a2e"}}>Share between Groups &amp; Seating</div>
                <div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.35)",marginTop:"2px",lineHeight:1.4}}>
                  {phMode==='combined'?'Smart shuffle in both places avoids the same past pairings.':'Groups and Seating each remember their own pairings, separately.'}
                </div>
              </div>
              <button className="cp-swbtn" onClick={togglePhMode}><CPSwitch on={phMode==='combined'}/></button>
            </div>

            {phMode==='combined'?(
              historyClearing==='both'?(
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"11.5px",fontWeight:600,color:"#c44"}}>Clear all {groupsHistoryCount} recorded pairings?</span>
                  <button className="cpb cpb-ghost cpb-bad" onClick={()=>clearPairingHistory('both')} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0}}>Yes, clear</button>
                  <button className="cpb cpb-ghost" onClick={()=>setHistoryClearing(null)} style={{fontSize:"10.5px",fontWeight:600,color:"rgba(0,0,0,0.4)",background:"none",border:"none",cursor:"pointer",padding:0}}>Cancel</button>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
                  <span style={{fontSize:"11.5px",color:"rgba(0,0,0,0.4)"}}>{groupsHistoryCount>0?`${groupsHistoryCount} recorded pairings`:'No pairings recorded yet'}</span>
                  {groupsHistoryCount>0&&<button className="cpb cpb-ghost cpb-bad" onClick={()=>setHistoryClearing('both')} style={{fontSize:"11px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Clear history…</button>}
                </div>
              )
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {[{key:'groups',label:'Groups',count:groupsHistoryCount},{key:'seating',label:'Seating',count:seatingHistoryCount}].map(row=>(
                  <div key={row.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
                    <span style={{fontSize:"11.5px",color:"rgba(0,0,0,0.45)"}}>{row.label}: {row.count>0?`${row.count} pairings`:'none yet'}</span>
                    {row.count>0&&(historyClearing===row.key?(
                      <span style={{display:"flex",gap:"6px"}}>
                        <button className="cpb cpb-ghost cpb-bad" onClick={()=>clearPairingHistory(row.key)} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0}}>Yes, clear</button>
                        <button className="cpb cpb-ghost" onClick={()=>setHistoryClearing(null)} style={{fontSize:"10.5px",fontWeight:600,color:"rgba(0,0,0,0.4)",background:"none",border:"none",cursor:"pointer",padding:0}}>Cancel</button>
                      </span>
                    ):(
                      <button className="cpb cpb-ghost cpb-bad" onClick={()=>setHistoryClearing(row.key)} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Clear…</button>
                    ))}
                  </div>
                ))}
                {(groupsHistoryCount>0||seatingHistoryCount>0)&&(
                  historyClearing==='both'?(
                    <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"6px",borderTop:"1px solid rgba(0,0,0,0.06)"}}>
                      <span style={{fontSize:"11px",fontWeight:600,color:"#c44"}}>Clear both?</span>
                      <button className="cpb cpb-ghost cpb-bad" onClick={()=>clearPairingHistory('both')} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0}}>Yes, clear both</button>
                      <button className="cpb cpb-ghost" onClick={()=>setHistoryClearing(null)} style={{fontSize:"10.5px",fontWeight:600,color:"rgba(0,0,0,0.4)",background:"none",border:"none",cursor:"pointer",padding:0}}>Cancel</button>
                    </div>
                  ):(
                    <button className="cpb cpb-ghost cpb-bad" onClick={()=>setHistoryClearing('both')} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline",alignSelf:"flex-start",marginTop:"2px"}}>Clear both…</button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",padding:"16px 28px",borderTop:"1px solid rgba(0,0,0,0.06)"}}>
          <button className="cpb" onClick={onClose} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button className="cpb cpb-primary" onClick={handleSave} style={{padding:"10px 24px",borderRadius:"10px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>Save class</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TIMER PANEL
   ══════════════════════════════════════════════════════════ */
/* A segment's length in test runs: window.__cpTickMs makes a "second" shorter. Nothing sets it in the app. */
const timerTickMs=()=>{try{const v=Number(window.__cpTickMs);return v>=5?v:1000;}catch(e){return 1000;}};
/* Props for the station rotation (Phase 7), all optional:
   onSegmentEnd(timerId,segIdx,segTask,info) fires once each time a timer finishes a segment (info.finished: it was the last one);
   onTimersChange([{id,running,finished,currentSegIdx}]) says which timers exist;
   apiRef.current={addTimer} lets other panels create a timer without clicking (addTimer returns the new id; the 6th argument takes {id,select});
   rotationStrip shows "Red → Station 3 …" on that timer's projector view. */
function TimerPanel({onStatusChange,activeClass,coldCallStudent,onColdCall,onDismissColdCall,timerStyle,onSegmentEnd,onTimersChange,apiRef,rotationStrip}){
  const[timers,setTimers]=useState([]);const[selectedId,setSelectedId]=useState(null);const[showBuilder,setShowBuilder]=useState(false);const[showActions,setShowActions]=useState(false);const[showTemplatesManager,setShowTemplatesManager]=useState(false);const[continuousAlarm,setContinuousAlarm]=useState(true);const[countdownBeeps,setCountdownBeeps]=useState(true);const[savedTemplates,setSavedTemplates]=useState([]);const[actions,setActions]=useState(DEFAULT_ACTIONS);const[customMin,setCustomMin]=useState("");const[customSec,setCustomSec]=useState("");const[displayMode,setDisplayMode]=useState(false);
  const[optionsOpen,setOptionsOpen]=useState(false); // narrow-view "⋯ More" dropdown
  const[quickOpen,setQuickOpen]=useState(false);const[quickSecs,setQuickSecs]=useState({}); // ⚡ Quick menu + remembered length per action
  const[dragId,setDragId]=useState(null);const[overId,setOverId]=useState(null); // drag-to-combine
  const[repeatFor,setRepeatFor]=useState(null); // which card has the repeat popover open

  /* Narrow-view ("side banner") layout: collapse timer building/type-selection
     controls behind a dropdown so the countdown numbers stay the star of the
     show, but keep the quick +time buttons directly reachable. */
  const containerRef=useRef(null);
  const panelWidth=useElementWidth(containerRef);
  const compact=panelWidth>0&&panelWidth<380;
  useEffect(()=>{if(!compact)setOptionsOpen(false);},[compact]);

  useEffect(()=>{load("saved-templates",[]).then(t=>setSavedTemplates(t));load("actions",DEFAULT_ACTIONS).then(a=>{if(a&&a.length)setActions(a);});load("quick-lengths",{}).then(q=>{if(q&&typeof q==="object")setQuickSecs(q);});},[]);
  useEffect(()=>{if(!repeatFor)return;const h=()=>setRepeatFor(null);document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[repeatFor]);
  useEffect(()=>{if(!quickOpen)return;const h=()=>setQuickOpen(false);document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[quickOpen]);
  useEffect(()=>{
    if(!optionsOpen)return;
    const h=()=>setOptionsOpen(false);
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[optionsOpen]);
  const saveTpl=useCallback(t=>{setSavedTemplates(p=>{const n=[...p,t];save("saved-templates",n);return n;});},[]);
  const delTpl=useCallback(i=>{setSavedTemplates(p=>{const n=p.filter((_,j)=>j!==i);save("saved-templates",n);return n;});},[]);
  const saveActions=a=>{setActions(a);save("actions",a);};
  const saveTemplatesList=useCallback(list=>{setSavedTemplates(list);save("saved-templates",list);},[]);

  const addTimer=useCallback((name,segments,repeat,paraMode=false,autoStart=false,opts)=>{
    const id=opts?.id??(Date.now()+Math.random());
    setTimers(p=>[...p,{id,name,segments,running:!!autoStart,finished:false,currentSegIdx:0,segElapsed:0,repeatInfo:repeat?{...repeat,current:1}:null,paraphraseMode:paraMode}]);
    setSelectedId(prev=>opts?.select?id:(prev||id));
    return id;
  },[]);
  useEffect(()=>{if(apiRef)apiRef.current={addTimer};return()=>{if(apiRef)apiRef.current=null;};},[apiRef,addTimer]);

  const currentTimer=timers.find(t=>t.id===selectedId&&!t.finished)||timers.find(t=>!t.finished);
  const currentId=currentTimer?.id||null;

  /* ── BUG FIX: extend the ACTIVE segment, not the last one ── */
  const addToCurrent=useCallback((minutes,seconds)=>{
    setTimers(p=>{
      const ct=p.find(t=>t.id===currentId&&!t.finished);if(!ct)return p;
      const activeIdx=ct.currentSegIdx;const activeSeg=ct.segments[activeIdx];if(!activeSeg)return p;
      const newTotal=(activeSeg.minutes*60+activeSeg.seconds)+(minutes*60+seconds);
      return p.map(t=>t.id===ct.id?{...t,segments:t.segments.map((s,i)=>i===activeIdx?{...s,minutes:Math.floor(newTotal/60),seconds:newTotal%60}:s)}:t);
    });
    audio.ding();
  },[currentId]);

  const deleteTimer=useCallback(id=>{audio.stopAlarm(id);setTimers(p=>p.filter(t=>t.id!==id));if(selectedId===id)setSelectedId(null);},[selectedId]);
  const toggleTimer=useCallback(id=>{setTimers(p=>p.map(t=>{if(t.id!==id)return t;if(t.finished){audio.stopAlarm(id);return null;}return{...t,running:!t.running};}).filter(Boolean));},[]);
  const resetTimer=useCallback(id=>{audio.stopAlarm(id);setTimers(p=>p.map(t=>t.id===id?{...t,running:false,finished:false,currentSegIdx:0,segElapsed:0,repeatInfo:t.repeatInfo?{...t.repeatInfo,current:1}:null}:t));},[]);
  const startAll=useCallback(()=>{setTimers(p=>p.map(t=>t.finished?t:{...t,running:true}));},[]);

  /* ⚡ Quick: one click starts a single-step timer for a saved action (or a saved template). */
  const quickLen=task=>quickSecs[task]||DEFAULT_QUICK_SECS;
  const nudgeQuick=(task,dir)=>{const n={...quickSecs,[task]:stepLen(quickLen(task),dir)};setQuickSecs(n);save("quick-lengths",n);};
  const quickStart=task=>{const secs=quickLen(task);addTimer(task,[{task,minutes:Math.floor(secs/60),seconds:secs%60}],null,false,true);setQuickOpen(false);};
  const quickStartTpl=t=>{const segs=t.segments.map(x=>({...x}));const rep=t.repeatMode==="infinite"?{infinite:true}:t.repeatMode==="count"?{total:parseInt(t.repeatCount)||1}:null;addTimer(t.name,segs,rep,!!t.paraphraseMode&&shouldShowPara(segs),true);setQuickOpen(false);};

  /* Combine: drop `fromId` onto `toId` (parts are remembered so Split can undo it at any time). */
  const combineInto=(toId,fromId)=>{
    const t=timers.find(x=>x.id===toId),d=timers.find(x=>x.id===fromId);
    if(!t||!d||t.id===d.id||t.finished||d.finished)return;
    audio.stopAlarm(fromId);
    setTimers(p=>{const tt=p.find(x=>x.id===toId),dd=p.find(x=>x.id===fromId);if(!tt||!dd)return p;const c=combineTimers(tt,dd);return p.filter(x=>x.id!==fromId).map(x=>x.id===toId?c:x);});
    setSelectedId(s=>s===fromId?toId:s);
    setRepeatFor(toId); // straight away offer Once / × N / ∞
  };
  /* Split: put the original timers back in the combined card's place, each reset and paused.
     If it was running, the part that was in progress becomes the selected one. */
  const splitTimer=id=>{
    const c=timers.find(x=>x.id===id);if(!c||!c.parts||c.parts.length<2)return;
    audio.stopAlarm(id);
    const eff=getEffSegs(c);
    // paraphrase first round hides the leading paraphrase steps, so shift the index back to the full list
    const full=Math.min(c.currentSegIdx+(c.segments.length-Math.min(eff.length,c.segments.length)),c.segments.length-1);
    let acc=0,active=0;c.parts.forEach((pt,i)=>{if(full>=acc)active=i;acc+=pt.segments.length;});
    const stamp=Date.now()+Math.random();
    const made=c.parts.map((pt,i)=>({id:stamp+i/1000,name:pt.name,segments:pt.segments.map(x=>({...x})),running:false,finished:false,currentSegIdx:0,segElapsed:0,repeatInfo:pt.repeat?{...pt.repeat,current:1}:null,paraphraseMode:!!pt.paraphraseMode}));
    setTimers(p=>{const i=p.findIndex(x=>x.id===id);if(i<0)return p;const a=[...p];a.splice(i,1,...made);return a;});
    if(c.running)setSelectedId(made[active].id);else if(selectedId===id)setSelectedId(made[0].id);
    setRepeatFor(null);
  };
  /* Repeat popover: mode "once" | "count" | "loop". Keeps the current round number (capped to the new total). */
  const setRepeat=(id,mode,n)=>setTimers(p=>p.map(t=>{
    if(t.id!==id)return t;const cur=t.repeatInfo?t.repeatInfo.current:1;
    const ri=mode==="once"?null:mode==="loop"?{infinite:true,current:cur}:{total:Math.max(2,n),current:Math.min(cur,Math.max(2,n))};
    return{...t,repeatInfo:ri};
  }));

  const handlePresetNew=(label,secs)=>addTimer(label,[{task:"Timer",minutes:Math.floor(secs/60),seconds:secs%60}],null,false);
  const handlePresetAdd=(secs)=>{if(currentId)addToCurrent(Math.floor(secs/60),secs%60);else handlePresetNew(TIME_PRESETS.find(p=>p.seconds===secs)?.label||"Timer",secs);};
  const handleCustomGo=()=>{const m=parseInt(customMin)||0,s=parseInt(customSec)||0;if(m*60+s<=0)return;const label=m>0&&s>0?`${m}m ${s}s`:m>0?`${m}m`:`${s}s`;addTimer(label,[{task:"Timer",minutes:m,seconds:s}],null,false);setCustomMin("");setCustomSec("");};
  const handleCustomAdd=()=>{const m=parseInt(customMin)||0,s=parseInt(customSec)||0;if(m*60+s<=0)return;if(currentId)addToCurrent(m,s);else handleCustomGo();setCustomMin("");setCustomSec("");};

  /* Tick */
  useEffect(()=>{
    const interval=setInterval(()=>{
      setTimers(p=>p.map(t=>{
        if(!t.running||t.finished)return t;
        const eff=getEffSegs(t);const seg=eff[t.currentSegIdx];
        if(!seg)return{...t,finished:true,running:false};
        const segDur=seg.minutes*60+seg.seconds;
        let el=t.segElapsed+1,idx=t.currentSegIdx,fin=false,rep=t.repeatInfo;
        const rem=segDur-el;
        if(countdownBeeps&&rem>=0&&rem<5){rem===0?audio.finalTick():audio.tick();}
        if(el>=segDur){if(idx<eff.length-1){idx++;el=0;audio.ding();}else{if(rep&&(rep.infinite||rep.current<rep.total)){rep={...rep,current:rep.current+1};idx=0;el=0;audio.ding();}else{fin=true;if(continuousAlarm)audio.startAlarm(t.id);else audio.oneShot();}}}
        return{...t,currentSegIdx:idx,segElapsed:el,finished:fin,repeatInfo:rep};
      }));
    },timerTickMs());
    return()=>clearInterval(interval);
  },[continuousAlarm,countdownBeeps]);

  /* Tell the station rotation when a segment ends. Worked out by comparing each timer with how it looked
     on the last render, so the tick above is untouched: a segment ended if the timer moved on to a later
     segment, wrapped to its next round, or finished. A reset, combine or split is never mistaken for one. */
  const onSegEndRef=useRef(onSegmentEnd);onSegEndRef.current=onSegmentEnd;
  const onTimersRef=useRef(onTimersChange);onTimersRef.current=onTimersChange;
  const segSnap=useRef(new Map());
  useEffect(()=>{
    const prev=segSnap.current,next=new Map(),ends=[];
    timers.forEach(t=>{
      const rep=t.repeatInfo?t.repeatInfo.current:1,eff=getEffSegs(t);
      const cur={idx:t.currentSegIdx,rep,fin:!!t.finished,tasks:eff.map(x=>x.task)};
      const p=prev.get(t.id);
      if(p&&!p.fin){
        if(rep===p.rep&&t.finished)ends.push([t.id,p.idx,p.tasks[p.idx],{finished:true}]);
        else if(rep===p.rep&&t.currentSegIdx>p.idx)for(let j=p.idx;j<t.currentSegIdx;j++)ends.push([t.id,j,p.tasks[j],{finished:false}]);
        else if(rep===p.rep+1)ends.push([t.id,p.idx,p.tasks[p.idx],{finished:false}]);
      }
      next.set(t.id,cur);
    });
    segSnap.current=next;
    if(onSegEndRef.current)ends.forEach(e=>onSegEndRef.current(...e));
  },[timers]);
  useEffect(()=>{onTimersRef.current?.(timers.map(t=>({id:t.id,running:t.running,finished:t.finished,currentSegIdx:t.currentSegIdx})));},[timers]);

  /* Report running status to tab badge */
  useEffect(()=>{
    const running=timers.some(t=>t.running&&!t.finished);
    const ct=timers.find(t=>t.id===currentId)||timers.find(t=>!t.finished);
    if(running&&ct&&!ct.finished){const eff=getEffSegs(ct);const seg=eff[ct.currentSegIdx];if(seg){const rem=Math.max(0,(seg.minutes*60+seg.seconds)-ct.segElapsed);onStatusChange?.({running:true,timeDisplay:fmt(rem)});return;}}
    onStatusChange?.({running:false,timeDisplay:null});
  },[timers,currentId]);

  useEffect(()=>{audio.style=timerStyle||'liquid';},[timerStyle]);
  const hasTimers=timers.length>0;
  const hasColdCall=activeClass&&activeClass.students.length>0;
  const inp={padding:"6px 4px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:500,textAlign:"center",outline:"none",fontFamily:"'Source Sans 3',sans-serif",width:"40px"};
  const switchBtn=(on,onClick,help)=>(
    <button className="cp-swbtn" role="switch" aria-checked={on} onClick={onClick} title={help}><CPSwitch on={on}/></button>
  );
  const quickMenu=(
    <div onMouseDown={e=>e.stopPropagation()} style={{position:"relative"}}>
      <button className="cpb cpb-sunny" onClick={()=>{setQuickOpen(o=>!o);setOptionsOpen(false);}} title="Quick start: pick an action (Think, Share…) and a timer starts straight away" style={{fontSize:compact?"12.5px":"13.5px",fontWeight:600,padding:compact?"8px 12px":"10px 20px",borderRadius:compact?"10px":"11px",border:"1px solid rgba(234,170,60,0.4)",background:quickOpen?"#fdf5e6":"#fff",color:"#8a6d20",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>⚡ Quick</button>
      {quickOpen&&(
        <div className="cp-pop" style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:70,width:"262px",maxWidth:"calc(100vw - 24px)",maxHeight:"60vh",overflowY:"auto",background:"#fff",borderRadius:"12px",boxShadow:"0 4px 24px rgba(0,0,0,0.15)",border:"1px solid rgba(0,0,0,0.08)",padding:"8px",display:"flex",flexDirection:"column",gap:"3px",fontFamily:"'Source Sans 3',sans-serif",textAlign:"left"}}>
          <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)",padding:"2px 6px"}}>Actions</div>
          {actions.map((task,i)=>{const c=COLORS[i%COLORS.length];const chip={width:"24px",height:"24px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:0,fontFamily:"'Source Sans 3',sans-serif"};return(
            <div key={task+i} style={{display:"flex",alignItems:"center",gap:"4px"}}>
              <button className="cpo" onClick={()=>quickStart(task)} title={`Start a ${fmtLen(quickLen(task))} "${task}" timer now`} style={{flex:1,minWidth:0,textAlign:"left",padding:"7px 10px",borderRadius:"9px",border:"none",background:c.bg,color:c.text,fontSize:"13px",fontWeight:600,cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}>▶ {task}</button>
              <button className="cpb" onClick={()=>nudgeQuick(task,-1)} title={`Shorter default length for ${task}`} style={chip}>−</button>
              <span style={{minWidth:"40px",textAlign:"center",fontSize:"12px",fontWeight:600,color:"rgba(0,0,0,0.55)",fontVariantNumeric:"tabular-nums"}} title={`Default length for ${task} (remembered)`}>{fmtLen(quickLen(task))}</span>
              <button className="cpb" onClick={()=>nudgeQuick(task,1)} title={`Longer default length for ${task}`} style={chip}>+</button>
            </div>);})}
          <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)",padding:"8px 6px 2px",borderTop:"1px solid rgba(0,0,0,0.06)",marginTop:"4px"}}>Templates</div>
          {[...DEFAULT_TEMPLATES,...savedTemplates].map((t,i)=>{const tot=t.segments.reduce((a,x)=>a+(x.minutes||0)*60+(x.seconds||0),0);return(
            <button className="cpb cpb-item" key={t.name+i} onClick={()=>quickStartTpl(t)} title={`Start the "${t.name}" template now: ${t.segments.map(x=>x.task).join(" → ")}`} style={{display:"flex",justifyContent:"space-between",gap:"8px",alignItems:"center",textAlign:"left",padding:"7px 10px",borderRadius:"9px",border:"1px solid rgba(0,0,0,0.06)",background:"#fafbfc",color:"#1a1a2e",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>▶ {t.name}</span><span style={{fontSize:"11.5px",fontWeight:500,color:"rgba(0,0,0,0.4)",flexShrink:0}}>{fmtLen(tot)}{t.repeatMode==="count"?` ×${t.repeatCount}`:t.repeatMode==="infinite"?" ∞":""}</span></button>);})}
        </div>
      )}
    </div>
  );
  const customTimeRow=(
    <div style={{display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>
      <input type="number" value={customMin} onChange={e=>setCustomMin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCustomGo()} placeholder="m" min="0" style={inp} onFocus={e=>e.target.style.borderColor="rgba(0,0,0,0.2)"} onBlur={e=>e.target.style.borderColor="rgba(0,0,0,0.08)"}/>
      <span style={{color:"rgba(0,0,0,0.15)",fontSize:"14px",fontWeight:300}}>:</span>
      <input type="number" value={customSec} onChange={e=>setCustomSec(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCustomGo()} placeholder="s" min="0" max="59" style={inp} onFocus={e=>e.target.style.borderColor="rgba(0,0,0,0.2)"} onBlur={e=>e.target.style.borderColor="rgba(0,0,0,0.08)"}/>
      <button className="cpb cpb-primary" onClick={handleCustomGo} title="Start a fresh timer for this custom time" style={{fontSize:"12px",fontWeight:600,padding:"6px 16px",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer"}}>Go</button>
      {currentId&&<button className="cpb cpb-sky" onClick={handleCustomAdd} title="Add this custom time to the current timer" style={{fontSize:"12px",fontWeight:600,padding:"6px 12px",borderRadius:"7px",border:"1px solid rgba(66,133,244,0.3)",background:"#eaf1fc",color:"#2e6bce",cursor:"pointer"}}>+ Add</button>}
    </div>
  );
  const COMPACT_PRESET_LABELS=["30s","1m","5m","10m"];

  return(
    <div ref={containerRef} style={{minHeight:"100%",background:"linear-gradient(180deg,var(--board-bg-top) 0%,var(--board-bg-bottom) 100%)",color:"var(--board-heading)",fontFamily:"'Source Sans 3',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",padding:compact?"16px 12px 60px":"20px 20px 80px"}}>
      {/* Panel header */}
      <div className="no-drag" style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",maxWidth:"960px",marginBottom:compact?"14px":"20px",position:"relative",zIndex:51}}>
        <h1 style={{fontSize:"13px",fontWeight:600,letterSpacing:"5px",textTransform:"uppercase",color:"var(--board-label)",margin:0,textAlign:"center"}}>Timer</h1>
      </div>

      {/* Cold call reveal card */}
      {coldCallStudent&&(
        <div style={{width:"100%",maxWidth:"440px",background:"#1a1a2e",borderRadius:"18px",padding:"24px 28px",textAlign:"center",marginBottom:"20px",position:"relative",animation:"coldCallReveal 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <button className="cpb cpb-ghost" onClick={onDismissColdCall} style={{position:"absolute",top:"10px",right:"14px",background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"20px",lineHeight:1}} onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.7)"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>×</button>
          <div style={{fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:"10px",fontWeight:700}}>Cold Call</div>
          <div style={{fontSize:"clamp(22px,4vw,32px)",fontWeight:700,color:"#fff",lineHeight:1.2}}>{coldCallStudent.name}</div>
        </div>
      )}

      {compact?(
        <>
          {/* Compact controls: only Cold Call stays on the surface — everything
              about building/configuring a timer lives behind "⋯ More" so the
              narrow banner is mostly just the running timer's numbers. */}
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px",position:"relative"}}>
            {quickMenu}
            {hasColdCall&&(
              <button className={`cpb${coldCallStudent?" on":""}`} onClick={onColdCall} title={`Pick from ${activeClass.name} (${activeClass.students.length} students)`} style={{fontSize:"12.5px",fontWeight:600,padding:"8px 14px",borderRadius:"10px",border:"1px solid rgba(26,26,46,0.12)",background:coldCallStudent?"#eaf1fc":"#fff",color:coldCallStudent?"#2e6bce":"rgba(0,0,0,0.45)",cursor:"pointer"}}>🎲 Cold Call</button>
            )}
            <button className={`cpb${optionsOpen?" on":""}`} onClick={()=>{setOptionsOpen(o=>!o);setQuickOpen(false);}} title="More timer options: alarm, countdown, build a timer, custom time" style={{fontSize:"12.5px",fontWeight:600,padding:"8px 12px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.1)",background:optionsOpen?"#f0f1f4":"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer"}}>⋯ More</button>
            {optionsOpen&&(
              <div className="cp-pop" onMouseDown={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:60,background:"#fff",borderRadius:"12px",boxShadow:"0 4px 24px rgba(0,0,0,0.15)",border:"1px solid rgba(0,0,0,0.08)",padding:"12px",display:"flex",flexDirection:"column",gap:"10px",minWidth:"210px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontWeight:500}}>🔊 Alarm</span>
                  {switchBtn(continuousAlarm,()=>setContinuousAlarm(!continuousAlarm),"Keep the alarm sounding until you dismiss it, instead of one beep")}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontWeight:500}}>🔔 Countdown</span>
                  {switchBtn(countdownBeeps,()=>setCountdownBeeps(!countdownBeeps),"Tick in the last 5 seconds of each segment")}
                </div>
                <button className="cpb cpb-primary" onClick={()=>{setShowBuilder(true);setOptionsOpen(false);}} title="Build a custom multi-step timer with named tasks" style={{fontSize:"13px",fontWeight:600,padding:"9px 0",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",width:"100%"}}>+ Build Timer</button>
                {hasTimers&&timers.filter(t=>!t.finished).length>1&&(<button className="cpb" onClick={()=>{startAll();setOptionsOpen(false);}} title="Start every timer that isn't already running" style={{fontSize:"12px",fontWeight:600,padding:"7px 0",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer",width:"100%"}}>Start All</button>)}
                <div style={{borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:"10px"}}>{customTimeRow}</div>
              </div>
            )}
          </div>

          {/* Quick +time — always reachable, reduced to the most-used presets */}
          <div style={{maxWidth:"320px",width:"100%",marginBottom:"20px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px",justifyContent:"center"}}>
              {TIME_PRESETS.filter(p=>COMPACT_PRESET_LABELS.includes(p.label)).map(p=>(
                <button className={`cpb${currentId?" on":""}`} key={p.label} onClick={()=>handlePresetAdd(p.seconds)} title={currentId?"Add to current timer":"Create new timer"} style={{fontSize:"12px",fontWeight:600,padding:"7px 11px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.07)",background:currentId?"#eaf1fc":"#fff",color:currentId?"#2e6bce":"rgba(0,0,0,0.45)",cursor:"pointer"}}>+{p.label}</button>
              ))}
            </div>
          </div>
        </>
      ):(
        <>
          {/* Controls */}
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px",flexWrap:"wrap",justifyContent:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontWeight:500}}>🔊 Alarm</span>
              {switchBtn(continuousAlarm,()=>setContinuousAlarm(!continuousAlarm),"Keep the alarm sounding until you dismiss it, instead of one beep")}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontWeight:500}}>🔔 Countdown</span>
              {switchBtn(countdownBeeps,()=>setCountdownBeeps(!countdownBeeps),"Tick in the last 5 seconds of each segment")}
            </div>
            {quickMenu}
            <button className="cpb cpb-primary" onClick={()=>setShowBuilder(true)} title="Build a custom multi-step timer with named tasks" style={{fontSize:"13.5px",fontWeight:600,padding:"10px 24px",borderRadius:"11px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",boxShadow:"0 2px 10px rgba(26,26,46,0.15)"}} onMouseEnter={e=>e.target.style.background="#2a2a4e"} onMouseLeave={e=>e.target.style.background="#1a1a2e"}>+ Build Timer</button>
            {hasTimers&&timers.filter(t=>!t.finished).length>1&&(<button className="cpb" onClick={startAll} title="Start every timer that isn't already running" style={{fontSize:"12px",fontWeight:600,padding:"8px 16px",borderRadius:"9px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer"}} onMouseEnter={e=>{e.target.style.background="#f0f1f4";}} onMouseLeave={e=>{e.target.style.background="#fff";}}>Start All</button>)}
            {/* Cold Call button — only shows when class has students */}
            {hasColdCall&&(
              <button className={`cpb${coldCallStudent?" on":""}`} onClick={onColdCall} title={`Pick from ${activeClass.name} (${activeClass.students.length} students)`} style={{fontSize:"13px",fontWeight:600,padding:"9px 18px",borderRadius:"11px",border:"1px solid rgba(26,26,46,0.12)",background:coldCallStudent?"#eaf1fc":"#fff",color:coldCallStudent?"#2e6bce":"rgba(0,0,0,0.45)",cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="#eaf1fc";e.currentTarget.style.color="#2e6bce";}} onMouseLeave={e=>{e.currentTarget.style.background=coldCallStudent?"#eaf1fc":"#fff";e.currentTarget.style.color=coldCallStudent?"#2e6bce":"rgba(0,0,0,0.45)";}}>🎲 Cold Call</button>
            )}
          </div>

          {/* Time presets */}
          <div style={{maxWidth:"600px",width:"100%",marginBottom:"12px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px",justifyContent:"center"}}>
              {TIME_PRESETS.map(p=>(<div key={p.label} style={{display:"flex"}}><button className="cpb" onClick={()=>handlePresetNew(p.label,p.seconds)} title={`Start a fresh ${p.label} timer`} style={{fontSize:"12.5px",fontWeight:600,padding:"7px 14px",borderRadius:"8px 0 0 8px",border:"1px solid rgba(0,0,0,0.06)",borderRight:"none",background:"#fff",color:"rgba(0,0,0,0.45)",cursor:"pointer"}} onMouseEnter={e=>{e.target.style.background="#f0f1f4";}} onMouseLeave={e=>{e.target.style.background="#fff";}}>{p.label}</button><button className={`cpb${currentId?" on":""}`} onClick={()=>handlePresetAdd(p.seconds)} title={currentId?"Add to current timer":"Create new timer"} style={{fontSize:"14px",fontWeight:500,padding:"0 8px",borderRadius:"0 8px 8px 0",border:"1px solid rgba(0,0,0,0.06)",background:currentId?"#eaf1fc":"#f8f8fa",color:currentId?"#2e6bce":"rgba(0,0,0,0.25)",cursor:"pointer"}} onMouseEnter={e=>{e.target.style.background=currentId?"#d4e4fb":"#eef0f4";}} onMouseLeave={e=>{e.target.style.background=currentId?"#eaf1fc":"#f8f8fa";}}>+</button></div>))}
            </div>
          </div>

          {/* Custom time input */}
          <div style={{marginBottom:"36px"}}>{customTimeRow}</div>
        </>
      )}

      {/* Modals */}
      {showBuilder&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px"}} onClick={e=>{if(e.target===e.currentTarget)setShowBuilder(false);}}><BuilderPanel onAdd={addTimer} onClose={()=>setShowBuilder(false)} savedTemplates={savedTemplates} onSaveTemplate={saveTpl} onDeleteTemplate={delTpl} actions={actions} onManageTasks={()=>setShowActions(true)} onManageTemplates={()=>setShowTemplatesManager(true)}/></div>}
      {showActions&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px"}} onClick={e=>{if(e.target===e.currentTarget)setShowActions(false);}}><ManageTasksModal actions={actions} onSave={saveActions} onClose={()=>setShowActions(false)}/></div>}
      {showTemplatesManager&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px"}} onClick={e=>{if(e.target===e.currentTarget)setShowTemplatesManager(false);}}><ManageTemplatesModal templates={savedTemplates} onSave={saveTemplatesList} onClose={()=>setShowTemplatesManager(false)}/></div>}

      {/* Timer cards */}
      {!hasTimers?(
        <div style={{color:"var(--board-muted)",fontSize:"14px",fontStyle:"italic",marginTop:"40px"}}>tap ⚡ Quick, pick a time or build a timer to get started</div>
      ):(
        <div style={{display:"flex",flexWrap:"wrap",gap:compact?"14px":"20px",justifyContent:"center",maxWidth:"960px"}}>
          {timers.map((t,i)=>{
            const canDrop=dragId!=null&&dragId!==t.id&&!t.finished;
            const ri=t.repeatInfo;const mode=!ri?"once":ri.infinite?"loop":"count";const n=ri&&!ri.infinite?ri.total:3;
            const modeBtn=(on)=>({fontSize:"12px",fontWeight:600,padding:"7px 10px",borderRadius:"8px",border:on?"1px solid rgba(66,133,244,0.4)":"1px solid rgba(0,0,0,0.08)",background:on?"#eaf1fc":"#fff",color:on?"#2e6bce":"rgba(0,0,0,0.5)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"});
            return(
            /* HTML5 drag (same as the builder chips). A real drag never fires the card's click, so it can't select/start it. */
            <div key={t.id} data-timer-card draggable={!t.finished} title={t.finished?undefined:"Drag this timer onto another to combine them"}
              onDragStart={e=>{e.dataTransfer.setData("text/plain","cp-timer");e.dataTransfer.effectAllowed="move";setDragId(t.id);setRepeatFor(null);}}
              onDragEnd={()=>{setDragId(null);setOverId(null);}}
              onDragOver={e=>{if(!canDrop)return;e.preventDefault();e.dataTransfer.dropEffect="move";if(overId!==t.id)setOverId(t.id);}}
              onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget)&&overId===t.id)setOverId(null);}}
              onDrop={e=>{if(!canDrop)return;e.preventDefault();const from=dragId;setDragId(null);setOverId(null);combineInto(t.id,from);}}
              style={{position:"relative",opacity:dragId===t.id?0.45:1,animation:`fadeIn 0.4s ease ${i*0.05}s both`}}>
              <TimerCard timer={t} onDelete={deleteTimer} onToggle={toggleTimer} onReset={resetTimer} onSelect={setSelectedId} onDisplay={id=>{setSelectedId(id);setDisplayMode(true);}} onRepeat={id=>setRepeatFor(r=>r===id?null:id)} onSplit={splitTimer} isSelected={t.id===currentId} continuousAlarm={continuousAlarm} compact={compact} timerStyle={timerStyle}/>
              {canDrop&&overId===t.id&&<div title="Drop to combine" style={{position:"absolute",inset:0,borderRadius:"22px",border:"2px dashed #2e6bce",background:"rgba(66,133,244,0.12)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:30}}><span style={{background:"#2e6bce",color:"#fff",fontWeight:700,fontSize:"14px",padding:"6px 16px",borderRadius:"14px"}}>Combine</span></div>}
              {repeatFor===t.id&&!t.finished&&(
                <div className="cp-pop" onMouseDown={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% - 8px)",left:"50%",transform:"translateX(-50%)",zIndex:40,width:"236px",background:"#fff",borderRadius:"12px",boxShadow:"0 4px 24px rgba(0,0,0,0.18)",border:"1px solid rgba(0,0,0,0.08)",padding:"10px",display:"flex",flexDirection:"column",gap:"8px",fontFamily:"'Source Sans 3',sans-serif"}}>
                  <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)"}}>Repeat</div>
                  <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                    <button className={`cpb${mode==="once"?" on":""}`} onClick={()=>setRepeat(t.id,"once")} title="Run through the timeline a single time" style={modeBtn(mode==="once")}>Once</button>
                    <button className={`cpb${mode==="count"?" on":""}`} onClick={()=>setRepeat(t.id,"count",n)} title="Run through the timeline a set number of times" style={modeBtn(mode==="count")}>× N times</button>
                    <button className={`cpb${mode==="loop"?" on":""}`} onClick={()=>setRepeat(t.id,"loop")} title="Keep looping the timeline until you stop it" style={modeBtn(mode==="loop")}>∞ Loop</button>
                  </div>
                  {mode==="count"&&<div style={{display:"flex",alignItems:"center",gap:"8px",justifyContent:"center"}}>
                    <button className="cpb" onClick={()=>setRepeat(t.id,"count",n-1)} title="One fewer round" style={{...modeBtn(false),padding:"4px 10px"}}>−</button>
                    <span title="Number of rounds" style={{fontSize:"14px",fontWeight:700,minWidth:"56px",textAlign:"center"}}>{n} times</span>
                    <button className="cpb" onClick={()=>setRepeat(t.id,"count",n+1)} title="One more round" style={{...modeBtn(false),padding:"4px 10px"}}>+</button>
                  </div>}
                  <button className="cpb cpb-primary" onClick={()=>setRepeatFor(null)} title="Close this repeat box" style={{fontSize:"12px",fontWeight:600,padding:"6px 0",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Done</button>
                </div>
              )}
            </div>);})}
        </div>
      )}

      {/* Display mode */}
      {displayMode&&currentTimer&&(
        <DisplayMode timer={currentTimer} onToggle={id=>{toggleTimer(id);if(currentTimer.finished)setDisplayMode(false);}} onReset={resetTimer} onExit={()=>setDisplayMode(false)} continuousAlarm={continuousAlarm} coldCallStudent={coldCallStudent} onDismissColdCall={onDismissColdCall} timerStyle={timerStyle} rotationStrip={rotationStrip&&rotationStrip.timerId===currentTimer.id?rotationStrip:null}/>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SEATING PANEL — 5a: room editor
   ══════════════════════════════════════════════════════════ */

/* ── Seat/group constants & helpers ── */
const SW=114,SH=52,SGR=8;
const SETUP_BAR=42; // height of the class-setup tab strip above the Manage Seating floor (Phase 5)
const GROUP_PAD=8,GROUP_BAR_H=22; // group boundary padding + tab-bar height, shared with the off-screen drag clamp

/* ══════════════════════════════════════════════════════════
   ICON-STYLE DRAWING KIT — coloured-pencil hatching, dark ink outlines, warm
   wood and mint / sky / cyan, matching the app icon. Pure inline SVG + CSS (no
   images, fonts or network). Seats, tables and room items are all drawn from
   these pieces so Phase 3's new table shapes can reuse them:
     <InkDefs/>        once per canvas — the hatch patterns the others refer to
     <TableSurface/>   any polygon or rect as hatched wood + ink outline + shadow
     <Chair/>          a rounded chair that can face any direction
     <NameTag/>        cream paper tag, fixed tilt per seat id
     <SeatArt/>        the drawing under one seat (chair + bit of table)
     <RoomItemArt/>    desk / board / door pictures
   Colours are CSS variables (CP_THEME_CSS) so the blackboard theme can swap
   ink to chalk-white and mute the fills without touching any component.
   ══════════════════════════════════════════════════════════ */
const CP_THEME_CSS=`
[data-theme]{--cp-ink:#2b2118;--cp-wood:#cc9d74;--cp-wood2:#a8704a;--cp-hatch-light:rgba(255,248,236,0.6);--cp-hatch-dark:rgba(110,70,40,0.13);--cp-shadow:rgba(60,40,20,0.17);--cp-paper:#fffaf0;--cp-tag-ink:#2b2118;--cp-tag-text:#1a1208;--cp-floor:#f3f8f6;--cp-floor-line:rgba(43,33,24,0.075);--cp-chair-0:#b2efc4;--cp-chair-1:#9ccaf9;--cp-chair-2:#d2f5fb;--cp-chair-3:#ffd98a;--cp-chair-4:#ffb3a1;--cp-board-fill:#f8fcfb;--cp-sky:#9ccaf9;--cp-mint:#b2efc4;--cp-cyan:#d2f5fb;--cp-coral:#ffb3a1;--cp-sel:#2e6bce;--cp-sel-glow:rgba(66,133,244,0.28);--cp-sel-fill:rgba(255,255,255,0.3);--cp-bench:#bfd3d6;--cp-join:#2fa36b;--cp-wall:#d9cdb8;--cp-wall-hatch:rgba(43,33,24,0.36);--cp-window:#cdeefa;--cp-table-mint:#a8e8bd;--cp-table-sky:#9ccaf9;--cp-table-cyan:#a9e6f2;--cp-table-sunny:#ffd98a;--cp-table-coral:#ffae9a;--cp-table-lilac:#cdb6ee;--cp-table-red:#e7746f;--cp-table-blue:#6f9be0;--cp-table-green:#6cbc7c;--cp-table-gold:#e0b13f;--cp-table-pink:#ee8fb8;--cp-tchair-mint:color-mix(in srgb,var(--cp-table-mint) 76%,#2b2118);--cp-tchair-sky:color-mix(in srgb,var(--cp-table-sky) 76%,#2b2118);--cp-tchair-cyan:color-mix(in srgb,var(--cp-table-cyan) 76%,#2b2118);--cp-tchair-sunny:color-mix(in srgb,var(--cp-table-sunny) 76%,#2b2118);--cp-tchair-coral:color-mix(in srgb,var(--cp-table-coral) 76%,#2b2118);--cp-tchair-lilac:color-mix(in srgb,var(--cp-table-lilac) 76%,#2b2118);--cp-tchair-red:color-mix(in srgb,var(--cp-table-red) 76%,#2b2118);--cp-tchair-blue:color-mix(in srgb,var(--cp-table-blue) 76%,#2b2118);--cp-tchair-green:color-mix(in srgb,var(--cp-table-green) 76%,#2b2118);--cp-tchair-gold:color-mix(in srgb,var(--cp-table-gold) 76%,#2b2118);--cp-tchair-pink:color-mix(in srgb,var(--cp-table-pink) 76%,#2b2118);}
[data-theme="blackboard"]{--cp-ink:#efe9d8;--cp-wood:#8d6a4a;--cp-wood2:#765635;--cp-hatch-light:rgba(255,255,255,0.13);--cp-hatch-dark:rgba(0,0,0,0.2);--cp-shadow:rgba(0,0,0,0.38);--cp-paper:#f0e8d2;--cp-floor:#173323;--cp-floor-line:rgba(255,255,255,0.075);--cp-chair-0:#6fb08a;--cp-chair-1:#6f9bc8;--cp-chair-2:#80b6c0;--cp-chair-3:#cdac62;--cp-chair-4:#cc8e7e;--cp-board-fill:#264434;--cp-sky:#6f9bc8;--cp-mint:#6fb08a;--cp-cyan:#80b6c0;--cp-coral:#cc8e7e;--cp-sel:#7fb0ff;--cp-sel-glow:rgba(127,176,255,0.32);--cp-sel-fill:rgba(127,176,255,0.2);--cp-bench:#5d7b80;--cp-join:#7fe0a8;--cp-wall:#5b8470;--cp-wall-hatch:rgba(239,233,216,0.34);--cp-window:#4f8aa0;--cp-table-mint:#5f9f7a;--cp-table-sky:#5f8dbd;--cp-table-cyan:#6fa9b6;--cp-table-sunny:#d0b66e;--cp-table-coral:#bf7f70;--cp-table-lilac:#9a82bd;--cp-table-red:#b5605a;--cp-table-blue:#5578b5;--cp-table-green:#4f9460;--cp-table-gold:#a8862a;--cp-table-pink:#b8678d;--cp-tchair-mint:color-mix(in srgb,var(--cp-table-mint) 78%,#000);--cp-tchair-sky:color-mix(in srgb,var(--cp-table-sky) 78%,#000);--cp-tchair-cyan:color-mix(in srgb,var(--cp-table-cyan) 78%,#000);--cp-tchair-sunny:color-mix(in srgb,var(--cp-table-sunny) 78%,#000);--cp-tchair-coral:color-mix(in srgb,var(--cp-table-coral) 78%,#000);--cp-tchair-lilac:color-mix(in srgb,var(--cp-table-lilac) 78%,#000);--cp-tchair-red:color-mix(in srgb,var(--cp-table-red) 78%,#000);--cp-tchair-blue:color-mix(in srgb,var(--cp-table-blue) 78%,#000);--cp-tchair-green:color-mix(in srgb,var(--cp-table-green) 78%,#000);--cp-tchair-gold:color-mix(in srgb,var(--cp-table-gold) 78%,#000);--cp-tchair-pink:color-mix(in srgb,var(--cp-table-pink) 78%,#000);}
`;
/* ══════════════════════════════════════════════════════════
   BUTTON KIT (Phase 2b) — every button, toggle, menu and field in the
   same hand-drawn style as the class chips: pill or rounded-rect, ink
   outline, pastel fills, a small offset "pencil" shadow on hover, and a
   1px press. A handful of shared classes (injected with CP_THEME_CSS)
   rather than a style object per button, so they can't drift apart.

   Use:  className={cpc("primary")}            solid main action (Go, Save, Randomise)
         className={cpc("mint")}               positive / confirm
         className={cpc("sky")} / "sunny"      informational / highlight
         className={cpc("danger")}             destructive confirm (coral fill)
         className={cpc("warn")}               delete trigger: cream, coral text, coral on hover
         className={cpc()}                     secondary: cream + ink outline
         className={cpc("ghost")}              small icon button (× − + ⟳)
         className={cpc("tab",on)}             tab / chip: pill, filled when `on`
         className={cpc("item",on)}            row inside a menu
         className={cpc("dashed")}             "+ add" style
         className={cpc("",on)}                toggle-like tool button, sky when `on`
   or    <CPButton variant="primary" on={x} …/>, <CPSwitch on/> for a toggle
   knob (put it inside a button), and className="cp-pop" for popovers/modals.

   The classes set colour, border and shadow with !important so they win over
   the old inline styles; layout (padding, size, radius) is still inline.
   Blackboard: the kit stays cream-and-ink on the light panels and popovers,
   and flips to chalk on the dark board (.cp-onboard, the Timer panel).
   ══════════════════════════════════════════════════════════ */
const CP_BUTTON_CSS=`
[data-theme],.cp-pop,.cp-light{--cpb-ink:#2b2118;--cpb-fg:#2b2118;--cpb-bg:#fffaf0;--cpb-hover:#ffeec8;--cpb-line:rgba(43,33,24,0.42);--cpb-shadow:rgba(43,33,24,0.55);--cpb-prim:#2b2118;--cpb-prim-fg:#fff6e2;--cpb-prim-hover:#4d3828;--cpb-mint:#b2efc4;--cpb-sky:#9ccaf9;--cpb-sunny:#ffd98a;--cpb-coral:#ffb3a1;--cpb-cyan:#d2f5fb;--cpb-off:#e8dcc4;--cpb-bad:#b3392a;--cpb-link:#2858b0;--cpb-field:#fffdf6;--cpb-pop-shadow:rgba(43,33,24,0.2);}
[data-theme="blackboard"] .cp-onboard{--cpb-ink:#efe9d8;--cpb-fg:#f3efe0;--cpb-bg:#264b39;--cpb-hover:#31604a;--cpb-line:rgba(239,233,216,0.42);--cpb-shadow:rgba(0,0,0,0.5);--cpb-prim:#efe9d8;--cpb-prim-fg:#14281d;--cpb-prim-hover:#fffaf0;--cpb-mint:#6fb08a;--cpb-sky:#6f9bc8;--cpb-sunny:#cdac62;--cpb-coral:#cc8e7e;--cpb-cyan:#80b6c0;--cpb-off:#3a5a49;--cpb-bad:#f0a595;--cpb-link:#a9cdf5;--cpb-field:#1d3a2c;}
.cp-pop,.cp-light{--board-heading:#1a1a2e;--board-label:rgba(0,0,0,0.25);--board-muted:rgba(0,0,0,0.2);--board-border:rgba(0,0,0,0.08);--board-wash:rgba(0,0,0,0.025);--board-flat:#f0f2f5;--board-dot:#c8cad2;}
.cpb{--f:var(--cpb-bg);--fh:var(--cpb-hover);--t:var(--cpb-fg);background:var(--f) !important;color:var(--t) !important;border:1.5px solid var(--cpb-ink) !important;box-shadow:none !important;font-family:'Source Sans 3',sans-serif;cursor:pointer;transition:background 0.12s,box-shadow 0.12s,transform 0.06s,border-color 0.12s;}
.cpb:hover:not(:disabled){background:var(--fh) !important;box-shadow:1.5px 2px 0 var(--cpb-shadow) !important;}
.cpb:active:not(:disabled){transform:translateY(1px);box-shadow:0.5px 1px 0 var(--cpb-shadow) !important;}
.cpb:focus-visible{outline:2.5px solid var(--cp-sel,#2e6bce);outline-offset:2px;}
.cpb:disabled,.cpb.is-off{opacity:0.42;cursor:default;box-shadow:none !important;transform:none;}
.cpb-primary{--f:var(--cpb-prim);--fh:var(--cpb-prim-hover);--t:var(--cpb-prim-fg);}
.cpb-mint{--f:var(--cpb-mint);--fh:color-mix(in srgb,var(--cpb-mint) 72%,#fff);}
.cpb-sky{--f:var(--cpb-sky);--fh:color-mix(in srgb,var(--cpb-sky) 72%,#fff);}
.cpb-sunny{--f:var(--cpb-sunny);--fh:color-mix(in srgb,var(--cpb-sunny) 72%,#fff);}
.cpb-cyan{--f:var(--cpb-cyan);--fh:color-mix(in srgb,var(--cpb-cyan) 72%,#fff);}
.cpb-danger{--f:var(--cpb-coral);--fh:color-mix(in srgb,var(--cpb-coral) 72%,#fff);}
.cpb-mint,.cpb-sky,.cpb-sunny,.cpb-cyan,.cpb-danger{--t:#2b2118;}
[data-theme="blackboard"] .cp-onboard .cpb-mint,[data-theme="blackboard"] .cp-onboard .cpb-sky,[data-theme="blackboard"] .cp-onboard .cpb-sunny,[data-theme="blackboard"] .cp-onboard .cpb-cyan,[data-theme="blackboard"] .cp-onboard .cpb-danger{--t:#10201a;}
.cpb.on{--f:var(--cpb-sky);--fh:color-mix(in srgb,var(--cpb-sky) 78%,#fff);--t:#2b2118;box-shadow:1.5px 2px 0 var(--cpb-shadow) !important;font-weight:700;}
[data-theme="blackboard"] .cp-onboard .cpb.on{--t:#10201a;}
.cpb.on-mint{--f:var(--cpb-mint);--fh:color-mix(in srgb,var(--cpb-mint) 78%,#fff);}
.cpb-ghost{--f:transparent;--fh:color-mix(in srgb,var(--cpb-sunny) 38%,transparent);--t:color-mix(in srgb,var(--cpb-fg) 72%,transparent);border-color:transparent !important;}
.cpb-ghost:hover:not(:disabled){border-color:var(--cpb-ink) !important;color:var(--cpb-fg) !important;}
.cpb-ghost.on{--f:var(--cpb-sky);border-color:var(--cpb-ink) !important;}
.cpb-bad{--t:var(--cpb-bad);}
.cpb-warn{--t:var(--cpb-bad);--fh:color-mix(in srgb,var(--cpb-coral) 60%,var(--cpb-bg));}
.cpb-ghost.cpb-bad:hover:not(:disabled){color:var(--cpb-bad) !important;}
.cpb-link{--t:var(--cpb-link);}
.cpb-dashed{--f:transparent;border-style:dashed !important;border-color:var(--cpb-line) !important;}
.cpb-dashed:hover:not(:disabled){border-color:var(--cpb-ink) !important;}
.cpb-tab{--f:transparent;--fh:color-mix(in srgb,var(--tab-fill,var(--cpb-mint)) 55%,transparent);border-width:1.6px !important;border-color:var(--cpb-line) !important;border-radius:999px !important;font-weight:600;}
.cpb-tab:hover:not(:disabled){border-color:var(--cpb-ink) !important;box-shadow:none !important;}
.cpb-tab.on{--f:var(--tab-fill,var(--cpb-mint));--fh:var(--tab-fill,var(--cpb-mint));--t:#2b2118;border-color:var(--cpb-ink) !important;box-shadow:1.5px 2px 0 var(--cpb-shadow) !important;font-weight:700;}
.cpb-item{--f:transparent;--fh:color-mix(in srgb,var(--cpb-sunny) 42%,transparent);border-color:transparent !important;border-width:1.5px !important;}
.cpb-item:hover:not(:disabled){border-color:var(--cpb-line) !important;box-shadow:none !important;}
.cpb-item.on{--f:color-mix(in srgb,var(--cpb-sky) 55%,transparent);box-shadow:none !important;}
.cpb-item.on-mint{--f:color-mix(in srgb,var(--cpb-mint) 55%,transparent);}
.cpb-wide{width:100%;}
/* own-colour buttons (tag chips, quick actions): fill and text stay as the inline colours, the kit adds outline + pencil shadow */
.cpo{border:1.5px solid var(--cpb-ink) !important;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:box-shadow 0.12s,transform 0.06s,filter 0.12s;}
.cpo:hover:not(:disabled){box-shadow:1.5px 2px 0 var(--cpb-shadow);filter:brightness(0.97);}
.cpo:active:not(:disabled){transform:translateY(1px);box-shadow:none;}
.cpo:focus-visible{outline:2.5px solid var(--cp-sel,#2e6bce);outline-offset:2px;}
.cpb-card{--f:var(--cpb-bg);border-radius:12px;}
.cpb-card.on{box-shadow:2.5px 3px 0 var(--cpb-shadow) !important;outline:3px solid var(--cpb-sky);outline-offset:1px;font-weight:inherit;}
.cp-sw{display:inline-block;position:relative;flex-shrink:0;width:38px;height:22px;border-radius:999px;border:1.5px solid var(--cpb-ink,#2b2118);background:var(--cpb-off,#e8dcc4);transition:background 0.15s;vertical-align:middle;}
.cp-sw::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--cpb-bg,#fffaf0);border:1.5px solid var(--cpb-ink,#2b2118);box-shadow:0.5px 1px 0 var(--cpb-shadow,rgba(43,33,24,0.5));transition:left 0.15s;}
.cp-sw.on{background:var(--cpb-mint,#b2efc4);}
.cp-sw.on::after{left:18px;}
.cp-sw.sm{width:30px;height:18px;}
.cp-sw.sm::after{width:10px;height:10px;top:2px;left:2px;}
.cp-sw.sm.on::after{left:14px;}
.cp-swbtn{background:none;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center;border-radius:999px;font-family:inherit;}
.cp-swbtn:focus-visible{outline:2.5px solid var(--cp-sel,#2e6bce);outline-offset:2px;}
.cp-swbtn:hover .cp-sw{box-shadow:1.5px 2px 0 var(--cpb-shadow,rgba(43,33,24,0.5));}
.cp-pop{background:var(--cpb-bg) !important;border:1.5px solid #2b2118 !important;box-shadow:3px 4px 0 var(--cpb-pop-shadow) !important;}
.cp-toast{background:#2b2118 !important;color:#fff6e2 !important;border:1.5px solid #2b2118 !important;box-shadow:2px 3px 0 rgba(43,33,24,0.3) !important;}
input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not(.cp-raw):not([style*="border-style: none"]),select:not(.cp-raw):not([style*="border-style: none"]),textarea:not(.cp-raw):not([style*="border-style: none"]){border:1.5px solid var(--cpb-ink,#2b2118) !important;background-color:var(--cpb-field,#fffdf6) !important;color:var(--cpb-fg,#2b2118);transition:box-shadow 0.12s,border-color 0.12s;}
input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not(.cp-raw):not([style*="border-style: none"]):focus,select:not(.cp-raw):not([style*="border-style: none"]):focus,textarea:not(.cp-raw):not([style*="border-style: none"]):focus{box-shadow:2px 2px 0 var(--cp-sky,#9ccaf9) !important;outline:none;}
input[type=checkbox],input[type=radio]{accent-color:#2b2118;}
`;
/* class names for the kit: cpc("primary"), cpc("tab",isActive), cpc("",isOn) … */
const cpc=(variant="",on=false,extra="")=>["cpb",variant&&`cpb-${variant}`,on&&"on",extra].filter(Boolean).join(" ");
function CPButton({variant="",on=false,className="",type="button",...rest}){return <button type={type} className={cpc(variant,on,className)} {...rest}/>;}
/* A toggle knob to drop inside a <button className="cp-swbtn"> (or any button row). Mint when on. */
const CPSwitch=({on,small=false})=><span className={`cp-sw${small?" sm":""}${on?" on":""}`} aria-hidden="true"/>;
/* ── Table colours (Phase 3c) ──
   `color` is a palette key stored on the thing that owns the table: a group
   (groups[].color) for any cluster of seats or joined pieces, a lone single-seat
   piece (pieces[].color), or a lone legacy desk (seats[].color). No colour = wood.
   The theme maps the key to --cp-table-<key> (and a deeper --cp-tchair-<key> for
   "match chairs to table colour"), so whiteboard and blackboard stay in step. */
const TABLE_COLORS=[['wood','Wood'],['mint','mint'],['sky','sky'],['cyan','cyan'],['sunny','sunny'],['coral','coral'],['lilac','lilac'],['red','red'],['blue','blue'],['green','green'],['gold','gold'],['pink','pink']];
const TABLE_COLOR_KEYS=new Set(TABLE_COLORS.map(c=>c[0]).filter(k=>k!=='wood'));
const tableFill=key=>key&&TABLE_COLOR_KEYS.has(key)?`var(--cp-table-${key})`:"var(--cp-wood)";
const tableChairFill=key=>key&&TABLE_COLOR_KEYS.has(key)?`var(--cp-tchair-${key})`:null;
/* The Groups panel's colours in its own order (blue, green, gold, purple, red, cyan),
   as table-colour keys: Phase 6 uses this to colour a table like the group seated at it. */
/* (GROUP_COLOR_KEYS and groupColorKey now live in the geometry block, beside the seating function that uses them.)
   The colour key of the table a seat sits at: its group's, else its piece's, else its own (a lone legacy desk). */
const seatTableColor=(seat,groupById,pieceById)=>seat?(seat.groupId?groupById?.get(seat.groupId)?.color:seat.pieceId?pieceById?.get(seat.pieceId)?.color:seat.color):undefined;
/* Chair fill for a seat: its table's deeper shade when "match chairs" is on and the table is coloured, else the rotating palette. */
const matchedChair=(on,key,fallback)=>(on&&tableChairFill(key))||fallback;
const INK="var(--cp-ink)";
const INK_W=1.6; // outline weight in canvas px
const CHAIR_COUNT=5;
const chairColor=i=>`var(--cp-chair-${((i%CHAIR_COUNT)+CHAIR_COUNT)%CHAIR_COUNT})`;
/* tagTilt/chair colours use hashStr (defined with the seat tags below) so they never jitter. */
const tagTilt=id=>[-1.5,-0.75,0,0.75,1.5][hashStr(id)%5];
/* One chair colour per table (group); a lone desk gets one from its id. */
const chairIndexMap=(seatsIn,groupsIn)=>{
  const m={};
  (groupsIn||[]).forEach((g,gi)=>g.seatIds.forEach(id=>{m[id]=gi;}));
  (seatsIn||[]).forEach(s=>{if(m[s.id]===undefined)m[s.id]=hashStr(s.id);});
  return m;
};
/* Pale tile floor for the canvas background. */
const floorStyle=(step=32)=>({backgroundColor:"var(--cp-floor)",backgroundImage:"linear-gradient(var(--cp-floor-line) 1px,transparent 1px),linear-gradient(90deg,var(--cp-floor-line) 1px,transparent 1px)",backgroundSize:`${step}px ${step}px`});

/* The same hatched-wood look as TableSurface, as plain CSS, for cards whose size
   flows with their content (the Groups cards) so no SVG measuring is needed. */
const hatchedWoodCss=()=>({
  background:"repeating-linear-gradient(122deg,var(--cp-hatch-light) 0 1.1px,transparent 1.1px 8px),repeating-linear-gradient(122deg,transparent 0 5px,var(--cp-hatch-dark) 5px 5.9px,transparent 5.9px 8px),var(--cp-wood)",
  border:`${INK_W}px solid var(--cp-ink)`,boxShadow:"2.5px 3.5px 0 var(--cp-shadow)",
});

/* Render once per canvas: the pencil-hatch patterns. Two sets of diagonal
   strokes — pale "scratches" and sparse dark ones — like the icon's shading. */
const InkDefs=()=>(
  <svg width="0" height="0" style={{position:"absolute",pointerEvents:"none"}} aria-hidden="true" focusable="false">
    <defs>
      <pattern id="cp-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(32)">
        <line x1="0" y1="2" x2="8" y2="2" style={{stroke:"var(--cp-hatch-light)",strokeWidth:1.1}}/>
        <line x1="0" y1="6" x2="8" y2="6" style={{stroke:"var(--cp-hatch-dark)",strokeWidth:0.9}}/>
      </pattern>
      <pattern id="cp-hatch-wall" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <line x1="0" y1="3" x2="6" y2="3" style={{stroke:"var(--cp-wall-hatch)",strokeWidth:1.5}}/>
      </pattern>
      <pattern id="cp-hatch-x" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-45)">
        <line x1="0" y1="3" x2="6" y2="3" style={{stroke:"#d9534f",strokeWidth:1.3,opacity:0.7}}/>
      </pattern>
    </defs>
  </svg>
);

const rotPts=(pts,rot,c)=>{
  if(!rot)return pts;
  const a=rot*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
  return pts.map(([x,y])=>[c[0]+(x-c[0])*co-(y-c[1])*si,c[1]+(x-c[0])*si+(y-c[1])*co]);
};
/* A table top. Give either `points` ([[x,y],…] in canvas px) or `rect` ({x,y,w,h});
   `rot` turns it (degrees) about its centre. The SVG sizes itself to the shape, so
   it can be dropped into any position:absolute parent. One cheap offset copy is
   the shadow (no SVG filters, so 30+ seats still drag smoothly). */
const TableSurface=({points,rect,rot=0,fill="var(--cp-wood)",radius=10,shadow=true,selected=false,dashed=false,faded=false})=>{
  const base=points||(rect?[[rect.x,rect.y],[rect.x+rect.w,rect.y],[rect.x+rect.w,rect.y+rect.h],[rect.x,rect.y+rect.h]]:[]);
  if(!base.length)return null;
  const c=[base.reduce((a,p)=>a+p[0],0)/base.length,base.reduce((a,p)=>a+p[1],0)/base.length];
  const useRect=!points&&rect;
  const pts=rotPts(base,rot,c);
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const bx=Math.min(...xs),by=Math.min(...ys),bw=Math.max(...xs)-bx,bh=Math.max(...ys)-by;
  const M=8;
  const rt=rot?`rotate(${rot} ${c[0]} ${c[1]})`:"";
  const shapeProps=useRect
    ?{x:rect.x,y:rect.y,width:rect.w,height:rect.h,rx:radius}
    :{points:pts.map(p=>p.join(",")).join(" ")};
  const Shape=useRect?"rect":"polygon";
  return(
    <svg data-cp="table" width={bw+M*2} height={bh+M*2} style={{position:"absolute",left:bx-M,top:by-M,overflow:"visible",pointerEvents:"none",opacity:faded?0.55:1}} aria-hidden="true">
      <g transform={`translate(${M-bx},${M-by})`}>
        {shadow&&<Shape {...shapeProps} transform={`translate(2.5 3.5) ${useRect?rt:""}`} style={{fill:"var(--cp-shadow)"}}/>}
        {selected&&<Shape {...shapeProps} transform={useRect?rt:undefined} style={{fill:"none",stroke:"var(--cp-sel-glow)",strokeWidth:9,strokeLinejoin:"round"}}/>}
        <Shape {...shapeProps} transform={useRect?rt:undefined} style={{fill}}/>
        <Shape {...shapeProps} transform={useRect?rt:undefined} style={{fill:"url(#cp-hatch)"}}/>
        <Shape {...shapeProps} transform={useRect?rt:undefined} style={{fill:"none",stroke:selected?"var(--cp-sel)":INK,strokeWidth:selected?2.4:INK_W,strokeLinejoin:"round",strokeDasharray:dashed?"5 3":undefined}}/>
      </g>
    </svg>
  );
};

/* A chair seen from above: a cushion and a thicker backrest. (x,y) is its centre;
   `facing` is the direction the sitter faces in degrees — 0 faces up (towards a
   table above), 90 faces right, and so on. `empty` draws it hollow and dashed. */
const Chair=({x,y,facing=0,color=0,empty=false,dim=false,w=38,h=18})=>{
  const fill=typeof color==="number"?chairColor(color):color;
  const S=Math.max(w,h)+8,hc=S/2,cush=h*0.66,back=h-cush;
  // empty: a pale ghost chair, so it still reads as a chair when only its back shows
  const st=empty?{fill:"var(--cp-floor)",fillOpacity:0.75,stroke:INK,strokeWidth:INK_W,strokeDasharray:"3 2.5"}:{fill,stroke:INK,strokeWidth:INK_W};
  return(
    <svg data-cp="chair" width={S} height={S} style={{position:"absolute",left:x-hc,top:y-hc,overflow:"visible",pointerEvents:"none",opacity:dim?0.45:1}} aria-hidden="true">
      <g transform={`rotate(${facing} ${hc} ${hc}) translate(${hc-w/2} ${hc-h/2})`}>
        <rect x={0.5} y={cush} width={w-1} height={back} rx={3} style={st}/>
        {!empty&&<rect x={0.5} y={cush} width={w-1} height={back} rx={3} style={{fill:"rgba(43,33,24,0.22)"}}/>}
        <rect x={0.5} y={0.5} width={w-1} height={cush+0.5} rx={5.5} style={st}/>
        {!empty&&<rect x={0.5} y={0.5} width={w-1} height={cush+0.5} rx={5.5} style={{fill:"url(#cp-hatch)",opacity:0.7}}/>}
      </g>
    </svg>
  );
};

/* A standing spot for a lab bench: a little rounded floor mat with a pair of
   footprints, in the chair colour, just outside the bench edge. Same arguments
   as Chair (x,y is its centre; `facing` turns it so it lies along the edge). */
const StandingSpot=({x,y,facing=0,color=0,empty=false,dim=false,w=34,h=14})=>{
  const fill=typeof color==="number"?chairColor(color):color;
  const S=Math.max(w,h)+8,hc=S/2;
  const st=empty?{fill:"none",stroke:INK,strokeWidth:INK_W,strokeDasharray:"3 2.5"}:{fill,stroke:INK,strokeWidth:INK_W};
  return(
    <svg data-cp="spot" width={S} height={S} style={{position:"absolute",left:x-hc,top:y-hc,overflow:"visible",pointerEvents:"none",opacity:dim?0.45:1}} aria-hidden="true">
      <g transform={`rotate(${facing} ${hc} ${hc}) translate(${hc-w/2} ${hc-h/2})`}>
        <rect x={0.5} y={0.5} width={w-1} height={h-1} rx={h/2-0.5} style={st}/>
        {!empty&&<rect x={0.5} y={0.5} width={w-1} height={h-1} rx={h/2-0.5} style={{fill:"url(#cp-hatch)",opacity:0.7}}/>}
        {[w/2-6,w/2+6].map(cx=><ellipse key={cx} cx={cx} cy={h/2} rx={2.6} ry={4} style={{fill:"var(--cp-ink)",opacity:empty?0.25:0.4}}/>)}
      </g>
    </svg>
  );
};

/* Cream paper name tag with an ink border and a small fixed tilt. Names clamp to
   two lines and end in "…" rather than overflowing. Children (a lock button,
   say) are positioned by the caller; `pad` keeps the text clear of them. */
const NameTag=({name,tilt=0,w,h=26,fontSize=12,pad=6,warn=false,locked=false,onClick,onMouseDown,title,cursor="default",children})=>(
  <div onClick={onClick} onMouseDown={onMouseDown} title={title||name}
    style={{width:w,height:h,boxSizing:"border-box",padding:`0 ${pad}px 0 6px`,display:"flex",alignItems:"center",justifyContent:"center",
      background:"var(--cp-paper)",border:`1.5px solid ${warn?"#c0392b":"var(--cp-tag-ink)"}`,borderRadius:4,
      boxShadow:"1.5px 2px 0 var(--cp-shadow)",transform:`rotate(${tilt}deg)`,cursor,userSelect:"none",position:"relative"}}>
    <span style={{fontSize,fontWeight:700,lineHeight:1.1,textAlign:"center",color:locked?"#1f4fa3":warn?"#b0291b":"var(--cp-tag-text)",
      display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",wordBreak:"break-word",fontFamily:"'Source Sans 3',sans-serif"}}>{name}</span>
    {children}
  </div>
);

/* The drawing on top of one seat's chair: either its own little table (a lone
   desk) or, in a shared table, a faint seam around the seat's patch of it. The
   chairs themselves are LegacyChairs, drawn first so they sit under the table.
   state: "ok" | "unused" | "unavailable". */
const SeatArt=({w=SW,h=SH,state="ok",standalone=false,selected=false,color})=>{
  const dim=state==="unused",bad=state==="unavailable";
  return(
    <>
      {standalone&&<TableSurface rect={{x:1,y:1,w:w-2,h:h-2}} radius={8} selected={selected} fill={bad?"var(--cp-coral)":tableFill(color)} dashed={dim} faded={dim}/>}
      {!standalone&&(
        <svg width={w} height={h} style={{position:"absolute",left:0,top:0,overflow:"visible",pointerEvents:"none"}} aria-hidden="true">
          <rect x={2} y={2} width={w-4} height={h-4} rx={6} style={{fill:dim?"var(--cp-floor)":bad?"url(#cp-hatch-x)":"none",fillOpacity:dim?0.5:1,stroke:"var(--cp-ink)",strokeOpacity:0.3,strokeWidth:1.2,strokeDasharray:"3 3"}}/>
        </svg>
      )}
      {standalone&&bad&&<svg width={w} height={h} style={{position:"absolute",left:0,top:0,pointerEvents:"none"}} aria-hidden="true"><rect x={2} y={2} width={w-4} height={h-4} rx={7} style={{fill:"url(#cp-hatch-x)"}}/></svg>}
    </>
  );
};

/* Chairs for plain seat groups and lone desks (seats without a table piece).
   Rendered BEFORE every table top so each chair is tucked under its table with
   only its back showing, like a floor plan. `pos` is {seatId:{x,y}} (live while
   dragging); a group's table is the seat area plus GROUP_PAD, a lone desk's is
   its own seat box. */
const LegacyChairs=({seats,groups,pos,chairMap,hideUnused=false,chairMatch=false})=>{
  const out=[];
  const sById=new Map(seats.map(s=>[s.id,s]));
  const grouped=new Set();
  const add=(items,rect,tcol,flip)=>{
    legacyChairs(items.map(s=>({id:s.id,...pos[s.id]})),rect,flip).forEach(c=>{
      const s=sById.get(c.id);
      if(hideUnused&&!s.used)return;
      const bad=!!s.unavailable;
      out.push(<Chair key={`lc-${c.id}`} x={c.x} y={c.y} facing={c.facing} color={bad?"var(--cp-coral)":matchedChair(chairMatch,tcol,chairMap?.[c.id]??0)} empty={bad||!s.studentId||!s.used} dim={!s.used}/>);
    });
  };
  (groups||[]).forEach(g=>{
    const items=g.seatIds.map(id=>sById.get(id)).filter(s=>s&&!s.pieceId&&pos[s.id]);
    if(!items.length||g.seatIds.some(id=>sById.get(id)?.pieceId))return; // a piece table draws its own chairs
    g.seatIds.forEach(id=>grouped.add(id));
    const xs=items.map(s=>pos[s.id].x),ys=items.map(s=>pos[s.id].y);
    const x0=Math.min(...xs),y0=Math.min(...ys);
    add(items,{x:x0-GROUP_PAD,y:y0-GROUP_PAD,w:Math.max(...xs)-x0+SW+GROUP_PAD*2,h:Math.max(...ys)-y0+SH+GROUP_PAD*2},g.color,!!g.flipChairs);
  });
  seats.forEach(s=>{
    if(s.pieceId||grouped.has(s.id)||!pos[s.id])return;
    add([s],{x:pos[s.id].x+1,y:pos[s.id].y+1,w:SW-2,h:SH-2},s.color,!!s.flipChairs); // the lone desk's own table (see SeatArt)
  });
  return <>{out}</>;
};

/* Little pictures for the room items. Drawn to the box they're given (w×h), so a
   rotated desk or board just passes its swapped size. */
const RoomItemArt=({type,w,h,label,fontSize=10.5,color,dashed,arrow})=>{
  const horiz=w>=h;
  const tag=(txt,cx,cy)=>{
    const tw=Math.min((horiz?w:h)-12,txt.length*fontSize*0.62+12);
    return(
      <g transform={`translate(${cx} ${cy})`}>
        <rect x={-tw/2} y={-(fontSize+6)/2} width={tw} height={fontSize+6} rx={3} style={{fill:"var(--cp-paper)",stroke:"var(--cp-tag-ink)",strokeWidth:1.3}}/>
        <text x={0} y={fontSize*0.36} textAnchor="middle" style={{fontSize,fontWeight:800,fill:"var(--cp-tag-text)",letterSpacing:"0.4px",fontFamily:"'Source Sans 3',sans-serif",textTransform:"uppercase"}}>{txt}</text>
      </g>
    );
  };
  const wrap=kids=>(<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:"absolute",left:0,top:0,overflow:"visible",pointerEvents:"none"}} aria-hidden="true">{kids}</svg>);
  if(type==="desk"){
    /* the books and globe scale with the desk (a small desk gets small ones, a big desk bigger), the desk itself stretches */
    const k=Math.max(0.6,Math.min(2,horiz?Math.min(w/114,h/52):Math.min(w/52,h/114))),W=w/k,H=h/k;
    const gr=Math.min(H*0.2,W*0.16,10),gcx=horiz?W-gr-14:W/2,gcy=horiz?gr+8:H-gr-30;
    const bx=horiz?10:W/2-14,by=horiz?7:8;
    return wrap(<>
      <rect x={3} y={4} width={w-4} height={h-4} rx={6} style={{fill:"var(--cp-shadow)"}}/>
      <rect x={1} y={1} width={w-4} height={h-4} rx={6} style={{fill:"var(--cp-wood)"}}/>
      <rect x={1} y={1} width={w-4} height={h-4} rx={6} style={{fill:"url(#cp-hatch)"}}/>
      <rect x={1} y={1} width={w-4} height={h-4} rx={6} style={{fill:"none",stroke:INK,strokeWidth:INK_W}}/>
      <g transform={`scale(${k})`}>
      {/* books, like the icon: two stacked with coloured spines */}
      <rect x={bx} y={by+8} width={26} height={8} rx={1.5} style={{fill:"#e9efc9",stroke:INK,strokeWidth:1.3}}/>
      <rect x={bx} y={by+8} width={5} height={8} rx={1.5} style={{fill:"#2f7a6b",stroke:INK,strokeWidth:1.1}}/>
      <rect x={bx+3} y={by} width={24} height={8} rx={1.5} style={{fill:"#f6f1cf",stroke:INK,strokeWidth:1.3}}/>
      <rect x={bx+3} y={by} width={5} height={8} rx={1.5} style={{fill:"#f08a24",stroke:INK,strokeWidth:1.1}}/>
      {/* globe */}
      <circle cx={gcx} cy={gcy} r={gr} style={{fill:"var(--cp-sky)",stroke:INK,strokeWidth:1.4}}/>
      <path d={`M${gcx-gr*0.6} ${gcy-gr*0.2} q${gr*0.4} ${-gr*0.7} ${gr*0.8} ${-gr*0.3} q${-gr*0.1} ${gr*0.7} ${-gr*0.5} ${gr*0.9} z`} style={{fill:"var(--cp-mint)",stroke:INK,strokeWidth:0.8}}/>
      <path d={`M${gcx+gr*0.2} ${gcy+gr*0.1} q${gr*0.5} ${-gr*0.1} ${gr*0.5} ${gr*0.4} q${-gr*0.3} ${gr*0.4} ${-gr*0.5} ${gr*0.1} z`} style={{fill:"var(--cp-mint)",stroke:INK,strokeWidth:0.8}}/>
      <circle cx={gcx} cy={gcy} r={gr} style={{fill:"url(#cp-hatch)"}}/>
      <path d={`M${gcx-gr*0.7} ${gcy+gr*1.15} h${gr*1.4}`} style={{stroke:INK,strokeWidth:2,strokeLinecap:"round"}}/>
      </g>
      {label&&tag(label,w/2,h-11)}
    </>);
  }
  if(type==="board"){
    const txt={fontSize,fontWeight:800,letterSpacing:"2px",fill:INK,fontFamily:"'Source Sans 3',sans-serif",textTransform:"uppercase"};
    return wrap(<>
      <rect x={2} y={4} width={w-2} height={h-2} rx={4} style={{fill:"var(--cp-shadow)"}}/>
      <rect x={0.8} y={0.8} width={w-3} height={h-3} rx={4} style={{fill:"var(--cp-board-fill)",stroke:INK,strokeWidth:INK_W+0.4}}/>
      <rect x={4} y={4} width={w-10} height={h-10} rx={2} style={{fill:"url(#cp-hatch)",opacity:0.55}}/>
      {horiz&&<>
        <path d={`M${w*0.08} ${h*0.4} q6 -7 12 0 t12 0 t12 0`} style={{fill:"none",stroke:"var(--cp-sky)",strokeWidth:2,strokeLinecap:"round"}}/>
        <path d={`M${w*0.78} ${h*0.4} h${w*0.12}`} style={{stroke:"var(--cp-coral)",strokeWidth:2,strokeLinecap:"round"}}/>
      </>}
      <rect x={w*0.12} y={h-4.5} width={w*0.76} height={3.5} rx={1.5} style={{fill:"var(--cp-wood2)",stroke:INK,strokeWidth:1}}/>
      {horiz
        ?<text x={w/2} y={h/2+fontSize*0.3} textAnchor="middle" style={txt}>{label||"Board"}</text>
        :<text transform={`translate(${w/2} ${h/2}) rotate(90)`} y={fontSize*0.3} textAnchor="middle" style={txt}>{label||"Board"}</text>}
    </>);
  }
  if(type==="door"){
    return wrap(<>
      {/* swing area, then the door slab and a thick ink wall stub, like a floor plan */}
      <path d="M 58 6 A 52 52 0 0 1 6 58 L 6 6 Z" style={{fill:"var(--cp-cyan)",fillOpacity:0.75}}/>
      <path d="M 58 6 A 52 52 0 0 1 6 58 L 6 6 Z" style={{fill:"url(#cp-hatch)"}}/>
      <path d="M 58 6 A 52 52 0 0 1 6 58" style={{fill:"none",stroke:INK,strokeWidth:1.3,strokeDasharray:"4 3"}}/>
      <rect x={6} y={3} width={52} height={6} rx={2} style={{fill:"var(--cp-wood)",stroke:INK,strokeWidth:INK_W}}/>
      <rect x={6} y={3} width={52} height={6} rx={2} style={{fill:"url(#cp-hatch)"}}/>
      <circle cx={52} cy={6} r={1.4} style={{fill:INK}}/>
      <line x1={6} y1={2} x2={6} y2={60} style={{stroke:INK,strokeWidth:5,strokeLinecap:"round"}}/>
    </>);
  }
  return moreItemArt(type,w,h,label,fontSize,{color,dashed,arrow});
};

/* The rest of the catalogue, in the same icon style: ink outlines, pencil hatching,
   mint / sky / coral from the theme, and the usual safety colours (green for
   first aid and eyewash, red for fire and emergency stop, yellow for hazards).
   Each picture is drawn to the box it is given, so resizing never distorts the ink. */
const SAFE_GREEN="#2fa36b",SAFE_RED="#d8402f",SAFE_YELLOW="#f4c430",SAFE_ORANGE="#f08a24";
const BOOK_COLOURS=["#e0766a","#f4c430","#5aa0e0","#6ec28a","#b98ad9","#f08a24","#e9efc9"];
const moreItemArt=(type,w,h,label,fontSize,opt={})=>{
  const wrap=kids=>(<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:"absolute",left:0,top:0,overflow:"visible",pointerEvents:"none"}} aria-hidden="true">{kids}</svg>);
  const ln=(o={})=>({fill:"none",stroke:INK,strokeWidth:1.3,strokeLinejoin:"round",strokeLinecap:"round",...o});
  /* a flat slab: soft shadow, colour, pencil hatching, ink outline */
  const slab=(fill,rx=4,x=1,y=1,ww=w-3,hh=h-3)=>(<>
    <rect x={x+1.5} y={y+2.5} width={ww} height={hh} rx={rx} style={{fill:"var(--cp-shadow)"}}/>
    <rect x={x} y={y} width={ww} height={hh} rx={rx} style={{fill}}/>
    <rect x={x} y={y} width={ww} height={hh} rx={rx} style={{fill:"url(#cp-hatch)"}}/>
    <rect x={x} y={y} width={ww} height={hh} rx={rx} style={{fill:"none",stroke:INK,strokeWidth:INK_W}}/>
  </>);
  const ell=(fill,extra)=>(<>
    <ellipse cx={w/2+1.5} cy={h/2+2.5} rx={w/2-2} ry={h/2-2} style={{fill:"var(--cp-shadow)"}}/>
    <ellipse cx={w/2} cy={h/2} rx={w/2-2} ry={h/2-2} style={{fill}}/>
    <ellipse cx={w/2} cy={h/2} rx={w/2-2} ry={h/2-2} style={{fill:"url(#cp-hatch)"}}/>
    <ellipse cx={w/2} cy={h/2} rx={w/2-2} ry={h/2-2} style={{fill:"none",stroke:INK,strokeWidth:INK_W,...extra}}/>
  </>);
  /* a safety sign: coloured square with a white (or ink) picture, scaled to the box */
  const s=Math.min(w,h)/32;
  const sign=(fill,glyph)=>wrap(<>
    {slab(fill,6)}
    <g transform={`translate(${(w-3)/2+1} ${(h-3)/2+1}) scale(${s})`}>{glyph}</g>
  </>);
  const WH={fill:"#fff",stroke:"rgba(43,33,24,0.45)",strokeWidth:0.9,strokeLinejoin:"round"};
  const WL={fill:"none",stroke:"#fff",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};

  if(type==="eyewash")return sign(SAFE_GREEN,<>
    <path d="M-11 -3 Q0 -13 11 -3 Q0 7 -11 -3Z" style={WH}/>
    <circle cx={0} cy={-3} r={3.6} style={{fill:"#1c6b46"}}/><circle cx={-1} cy={-4} r={1} style={{fill:"#fff"}}/>
    <path d="M-7 9 q-1.5 3 0 5 M0 9 q-1.5 3 0 5 M7 9 q-1.5 3 0 5" style={WL}/>
  </>);
  if(type==="shower")return sign(SAFE_GREEN,<>
    <path d="M0 -13 V-9 M0 -13 H7" style={WL}/>
    <path d="M-10 -3 a10 6 0 0 1 20 0Z" style={WH}/>
    <path d="M-6 2 l-1.5 4 M0 2 l-1.5 4 M6 2 l-1.5 4 M-3 8 l-1.5 4 M3 8 l-1.5 4" style={{...WL,strokeWidth:1.8}}/>
  </>);
  if(type==="firstaid")return sign(SAFE_GREEN,<>
    <rect x={-3.8} y={-11} width={7.6} height={22} rx={1.5} style={WH}/><rect x={-11} y={-3.8} width={22} height={7.6} rx={1.5} style={WH}/>
  </>);
  if(type==="extinguisher")return sign(SAFE_RED,<>
    <rect x={-5.5} y={-3} width={11} height={16} rx={3.2} style={WH}/>
    <rect x={-5.5} y={3} width={11} height={4.5} style={{fill:SAFE_RED,opacity:0.85}}/>
    <rect x={-2.2} y={-7} width={4.4} height={4.5} style={WH}/>
    <path d="M-6 -9.5 H4 L7 -6.5" style={WL}/>
    <path d="M5.5 -6 q8 0 8 9" style={{...WL,strokeWidth:1.7}}/>
  </>);
  if(type==="blanket")return sign(SAFE_RED,<>
    <path d="M-3 -9 V-12.5 H3 V-9" style={{...WL,strokeWidth:1.7}}/>
    <rect x={-9} y={-9} width={18} height={19} rx={2.5} style={WH}/>
    <path d="M-9 -2 H9 M-9 4 H9" style={{...ln({stroke:SAFE_RED,strokeWidth:1.4})}}/>
  </>);
  if(type==="gas")return sign(SAFE_YELLOW,<>
    <path d="M0 -14 q5 4.5 3.6 8 a3.6 3.6 0 0 1 -7.2 0 q0 -3.5 3.6 -8Z" style={{fill:SAFE_RED,stroke:INK,strokeWidth:1.1}}/>
    <circle cx={0} cy={5} r={7} style={ln({strokeWidth:2.2})}/>
    <path d="M-7 5 H7 M0 -2 V12" style={ln({strokeWidth:1.6})}/><circle cx={0} cy={5} r={2} style={{fill:INK}}/>
  </>);
  if(type==="estop")return sign(SAFE_YELLOW,<>
    <circle cx={0} cy={0} r={12.5} style={ln({strokeWidth:1.2,opacity:0.55})}/>
    <circle cx={0} cy={0} r={9.5} style={{fill:SAFE_RED,stroke:INK,strokeWidth:1.7}}/>
    <path d="M-5.5 -3 a6.5 6.5 0 0 1 6.5 -4.2" style={{...WL,opacity:0.75,strokeWidth:1.8}}/>
  </>);
  if(type==="isolator")return sign("#5c6770",<>
    <path d="M3 -12 L-7 2 H-1 L-4 12 L8 -3 H2 Z" style={{fill:SAFE_YELLOW,stroke:INK,strokeWidth:1.2,strokeLinejoin:"round"}}/>
  </>);
  if(type==="bin"||type==="recycling"||type==="glassbin"){
    const rec=type==="recycling",gl=type==="glassbin";
    const b=Math.min(w,h)/2,cx=w/2,cy=h/2;
    return wrap(<>
      {ell(rec?SAFE_GREEN:gl?SAFE_ORANGE:"#c3ccd0")}
      <ellipse cx={cx} cy={cy} rx={w/2-6} ry={h/2-6} style={{fill:rec?"#27895a":gl?"#d9731a":"#a3afb5",stroke:INK,strokeWidth:1.1}}/>
      {!rec&&!gl&&<path d={`M${cx-b*0.35} ${cy} h${b*0.7}`} style={ln({strokeWidth:1.6})}/>}
      {rec&&<g transform={`translate(${cx} ${cy}) scale(${b/16})`}>{[0,120,240].map(a=>(
        <g key={a} transform={`rotate(${a})`}><path d="M-1.3 -7.4 A7.5 7.5 0 0 1 6.5 -3.75" style={{...WL,strokeWidth:2.2}}/><path d="M8.1 -1 L8.9 -5.3 L4.2 -2.4Z" style={{fill:"#fff"}}/></g>
      ))}</g>}
      {gl&&<g transform={`translate(${cx} ${cy}) scale(${b/16})`}>
        <path d="M-7 -3 L-1 -8 L1 -1Z" style={{fill:"var(--cp-cyan)",stroke:INK,strokeWidth:1.1,strokeLinejoin:"round"}}/>
        <path d="M2 -2 L8 -5 L6 3Z" style={{fill:"var(--cp-cyan)",stroke:INK,strokeWidth:1.1,strokeLinejoin:"round"}}/>
        <path d="M-5 3 L1 1 L-1 8Z" style={{fill:"var(--cp-cyan)",stroke:INK,strokeWidth:1.1,strokeLinejoin:"round"}}/>
      </g>}
    </>);
  }
  if(type==="plant"){
    const b=Math.min(w,h)/2,cx=w/2,cy=h/2;
    return wrap(<>
      <circle cx={cx+1.5} cy={cy+2.5} r={b-1.5} style={{fill:"var(--cp-shadow)"}}/>
      <circle cx={cx} cy={cy} r={b-1.5} style={{fill:"#d98b5f",stroke:INK,strokeWidth:INK_W}}/>
      <circle cx={cx} cy={cy} r={b*0.78} style={{fill:"#8a5a3a",stroke:INK,strokeWidth:1}}/>
      {[0,60,120,180,240,300].map(a=><ellipse key={a} cx={cx} cy={cy-b*0.42} rx={b*0.23} ry={b*0.46} transform={`rotate(${a+15} ${cx} ${cy})`} style={{fill:a%120===0?"#5fbf7a":"#79d08f",stroke:INK,strokeWidth:1.1}}/>)}
      <circle cx={cx} cy={cy} r={b*0.17} style={{fill:"#3f9a5c",stroke:INK,strokeWidth:1}}/>
    </>);
  }
  if(type==="rug"){
    const ticks=[];
    if(w>=h)for(let y=6;y<h-6;y+=6){ticks.push(<path key={`l${y}`} d={`M1 ${y} h-4 M${w-2} ${y} h4`} style={ln({strokeWidth:1,opacity:0.6})}/>);}
    else for(let x=6;x<w-6;x+=6){ticks.push(<path key={`t${x}`} d={`M${x} 1 v-4 M${x} ${h-2} v4`} style={ln({strokeWidth:1,opacity:0.6})}/>);}
    return wrap(<>{ticks}{slab("var(--cp-coral)",8)}
      <rect x={7} y={7} width={w-17} height={h-17} rx={4} style={ln({strokeDasharray:"4 3",opacity:0.55})}/>
      <rect x={14} y={14} width={Math.max(2,w-31)} height={Math.max(2,h-31)} rx={3} style={{fill:"var(--cp-cyan)",fillOpacity:0.7,stroke:INK,strokeWidth:1,strokeOpacity:0.5}}/>
    </>);
  }
  if(type==="sofa"){
    const n=w>=110?3:2,arm=Math.min(14,w*0.12),back=Math.min(16,h*0.3),cw=(w-3-arm*2)/n;
    return wrap(<>
      {slab("var(--cp-sky)",9)}
      <rect x={1+arm} y={1} width={w-3-arm*2} height={back} rx={5} style={{fill:"var(--cp-sky)",stroke:INK,strokeWidth:1.3}}/>
      {Array.from({length:n},(_,i)=><rect key={i} x={1+arm+i*cw+1.5} y={back+1.5} width={cw-3} height={h-3-back-4} rx={5} style={{fill:"var(--cp-cyan)",stroke:INK,strokeWidth:1.3}}/>)}
      <rect x={1} y={1} width={arm} height={h-3} rx={5} style={{fill:"var(--cp-sky)",stroke:INK,strokeWidth:1.4}}/>
      <rect x={w-3-arm+1} y={1} width={arm} height={h-3} rx={5} style={{fill:"var(--cp-sky)",stroke:INK,strokeWidth:1.4}}/>
      <rect x={1} y={1} width={arm} height={h-3} rx={5} style={{fill:"url(#cp-hatch)"}}/><rect x={w-3-arm+1} y={1} width={arm} height={h-3} rx={5} style={{fill:"url(#cp-hatch)"}}/>
    </>);
  }
  if(type==="bookshelf"){
    const spines=[];let x=5,i=0;
    while(x<w-9){const sw=4+((i*5)%4),sh=h-10-((i*3)%4);spines.push(<rect key={i} x={x} y={h-6-sh} width={sw} height={sh} rx={1} style={{fill:BOOK_COLOURS[i%BOOK_COLOURS.length],stroke:INK,strokeWidth:1}}/>);x+=sw+0.8;i++;}
    return wrap(<>{slab("var(--cp-wood)",3)}<rect x={3.5} y={3.5} width={w-8} height={h-8} rx={2} style={{fill:"var(--cp-wood2)",stroke:INK,strokeWidth:1,fillOpacity:0.85}}/>{spines}</>);
  }
  if(type==="cupboard"||type==="goggles"||type==="chemstore"){
    const chem=type==="chemstore",gg=type==="goggles";
    const fill=chem?SAFE_YELLOW:gg?"#e9f0f1":"var(--cp-wood)";
    return wrap(<>{slab(fill,3)}
      <path d={`M${w/2-1} 3 V${h-4}`} style={ln()}/>
      {!gg&&!chem&&<><circle cx={w/2-6} cy={h/2} r={1.9} style={{fill:INK}}/><circle cx={w/2+4} cy={h/2} r={1.9} style={{fill:INK}}/></>}
      {chem&&<>
        <path d={`M${w*0.27} ${h/2-10} L${w*0.27+10} ${h/2} L${w*0.27} ${h/2+10} L${w*0.27-10} ${h/2}Z`} style={{fill:"#fff",stroke:SAFE_RED,strokeWidth:2.2,strokeLinejoin:"round"}}/>
        <path d={`M${w*0.27} ${h/2-5} q3 3 2 5 a2 2 0 0 1 -4 0 q0 -2 2 -5Z`} style={{fill:INK}}/>
        <path d={`M${w*0.73} ${h/2-10} L${w*0.73+10} ${h/2} L${w*0.73} ${h/2+10} L${w*0.73-10} ${h/2}Z`} style={{fill:"#fff",stroke:SAFE_RED,strokeWidth:2.2,strokeLinejoin:"round"}}/>
        <path d={`M${w*0.73-4} ${h/2-3} l8 6 M${w*0.73+4} ${h/2-3} l-8 6`} style={ln({strokeWidth:1.6})}/>
      </>}
      {gg&&[w*0.27,w*0.73].map((cx,i)=><g key={i}>
        <path d={`M${cx-12} ${h/2} H${cx-8} M${cx+8} ${h/2} H${cx+12}`} style={ln({strokeWidth:1.6})}/>
        <circle cx={cx-4} cy={h/2} r={Math.min(5.5,h*0.2)} style={{fill:"var(--cp-cyan)",stroke:INK,strokeWidth:1.3}}/><circle cx={cx+4} cy={h/2} r={Math.min(5.5,h*0.2)} style={{fill:"var(--cp-cyan)",stroke:INK,strokeWidth:1.3}}/>
      </g>)}
    </>);
  }
  if(type==="filing"){
    const tall=h>=w,n=3,gap=(tall?h:w)/n;
    return wrap(<>{slab("#bcc7cc",3)}
      {Array.from({length:n},(_,i)=>tall
        ?<g key={i}><rect x={4} y={3+i*gap} width={w-11} height={gap-4} rx={2} style={{fill:"#cfd8dc",stroke:INK,strokeWidth:1.1}}/><path d={`M${w/2-6} ${3+i*gap+gap/2-2} h10`} style={ln({strokeWidth:1.8})}/></g>
        :<g key={i}><rect x={3+i*gap} y={4} width={gap-4} height={h-11} rx={2} style={{fill:"#cfd8dc",stroke:INK,strokeWidth:1.1}}/><path d={`M${3+i*gap+gap/2-2} ${h/2-5} v10`} style={ln({strokeWidth:1.8})}/></g>)}
    </>);
  }
  if(type==="computer"){
    const mw=w*0.5,mx=(w-3-mw)/2+1;
    return wrap(<>{slab("var(--cp-wood)",5)}
      <rect x={mx} y={5} width={mw} height={h*0.38} rx={2} style={{fill:"#394b59",stroke:INK,strokeWidth:1.3}}/>
      <rect x={mx+2.5} y={7.5} width={mw-5} height={h*0.38-5} rx={1} style={{fill:"var(--cp-sky)"}}/>
      <rect x={w/2-5} y={5+h*0.38} width={7} height={3.5} style={{fill:"#394b59",stroke:INK,strokeWidth:1}}/>
      <rect x={mx} y={h*0.62} width={mw} height={h*0.17} rx={2} style={{fill:"#fffaf0",stroke:INK,strokeWidth:1.2}}/>
      <circle cx={mx+mw+8} cy={h*0.7} r={3} style={{fill:"#fffaf0",stroke:INK,strokeWidth:1.1}}/>
    </>);
  }
  if(type==="printer")return wrap(<>
    <rect x={w*0.2} y={1} width={w*0.6} height={10} rx={1.5} style={{fill:"#fff",stroke:INK,strokeWidth:1.2}}/>
    <path d={`M${w*0.3} 5 h${w*0.4}`} style={ln({strokeWidth:1,opacity:0.5})}/>
    {slab("#d5dde0",5,1,8,w-3,h-11)}
    <rect x={w*0.18} y={h-18} width={w*0.64} height={7} rx={1.5} style={{fill:"#fff",stroke:INK,strokeWidth:1.1}}/>
    <rect x={w-16} y={14} width={8} height={4} rx={1} style={{fill:"var(--cp-sky)",stroke:INK,strokeWidth:1}}/><circle cx={10} cy={16} r={1.8} style={{fill:SAFE_GREEN,stroke:INK,strokeWidth:0.8}}/>
  </>);
  if(type==="tv")return wrap(<>
    <rect x={2.5} y={3.5} width={w-3} height={h-3} rx={3} style={{fill:"var(--cp-shadow)"}}/>
    <rect x={1} y={1} width={w-3} height={h-3} rx={3} style={{fill:"#2f3b46",stroke:INK,strokeWidth:INK_W}}/>
    <rect x={4} y={4} width={w-9} height={h-9} rx={1.5} style={{fill:"var(--cp-sky)"}}/>
    <path d={`M${w*0.2} ${h-6} L${w*0.35} 4 M${w*0.32} ${h-6} L${w*0.47} 4`} style={{stroke:"#fff",strokeWidth:2,opacity:0.5}}/>
    <rect x={4} y={4} width={w-9} height={h-9} rx={1.5} style={{fill:"url(#cp-hatch)"}}/>
  </>);
  if(type==="screen")return wrap(<>
    <rect x={2} y={3.5} width={w-2} height={h-3} rx={1.5} style={{fill:"var(--cp-shadow)"}}/>
    <rect x={1} y={5} width={w-3} height={h-6} rx={1.5} style={{fill:"var(--cp-board-fill)",stroke:INK,strokeWidth:INK_W}}/>
    <rect x={1} y={5} width={w-3} height={h-6} rx={1.5} style={{fill:"url(#cp-hatch)",opacity:0.5}}/>
    <rect x={0} y={0.5} width={w-1} height={5.5} rx={2.7} style={{fill:"#7b8790",stroke:INK,strokeWidth:1.4}}/>
    <circle cx={w/2} cy={h-2} r={1.8} style={{fill:"#7b8790",stroke:INK,strokeWidth:1}}/>
  </>);
  if(type==="hooks"){
    const n=Math.max(2,Math.floor(w/18)),gap=(w-3)/n;
    return wrap(<>{slab("var(--cp-wood)",3)}
      {Array.from({length:n},(_,i)=>{const cx=1+gap*(i+0.5);return <g key={i}><circle cx={cx} cy={h/2} r={Math.min(3.4,h*0.24)} style={{fill:i%2?"#ffd98a":BOOK_COLOURS[i%BOOK_COLOURS.length],stroke:INK,strokeWidth:1.1}}/></g>;})}
    </>);
  }
  if(type==="sink"){
    const two=w>=96,bw=two?(w-3-22)/2:w-3-16,bx=two?[8,14+bw]:[8];
    return wrap(<>{slab("#e7eef0",5)}
      {bx.map((x,i)=><g key={i}><rect x={x} y={h*0.3} width={bw} height={h*0.56} rx={4} style={{fill:"var(--cp-sky)",stroke:INK,strokeWidth:1.3}}/><rect x={x} y={h*0.3} width={bw} height={h*0.56} rx={4} style={{fill:"url(#cp-hatch)"}}/><circle cx={x+bw/2} cy={h*0.6} r={1.8} style={{fill:INK}}/></g>)}
      <circle cx={w/2} cy={h*0.15+1} r={3} style={{fill:"#b8c3c8",stroke:INK,strokeWidth:1.2}}/>
      <path d={`M${w/2} ${h*0.15+3} v${h*0.14}`} style={ln({strokeWidth:2.4,stroke:"#8b979d"})}/>
    </>);
  }
  if(type==="demo"){
    const fx=w*0.2,bx=w*0.42,tx=w*0.64;
    return wrap(<>{slab("var(--cp-bench)",5)}
      <g transform={`translate(${fx} ${h/2+3})`}>
        <path d="M-3 -17 V-8 L-10 6 H10 L3 -8 V-17Z" style={{fill:"#fff",fillOpacity:0.85,stroke:INK,strokeWidth:1.3,strokeLinejoin:"round"}}/>
        <path d="M-7.5 0 H7.5 L10 6 H-10Z" style={{fill:SAFE_GREEN,stroke:INK,strokeWidth:1,strokeLinejoin:"round"}}/>
      </g>
      <g transform={`translate(${bx} ${h/2})`}>
        <rect x={-7} y={-10} width={14} height={18} rx={1.5} style={{fill:"#fff",fillOpacity:0.85,stroke:INK,strokeWidth:1.3}}/>
        <rect x={-7} y={-2} width={14} height={10} rx={1.5} style={{fill:"var(--cp-sky)",stroke:INK,strokeWidth:1}}/>
      </g>
      {[0,1,2].map(i=><g key={i} transform={`translate(${tx+i*9} ${h/2})`}><rect x={-3} y={-10} width={6} height={17} rx={3} style={{fill:"#fff",fillOpacity:0.85,stroke:INK,strokeWidth:1.1}}/><rect x={-3} y={0} width={6} height={7} rx={3} style={{fill:["#e0766a","#f4c430","#6ec28a"][i],stroke:INK,strokeWidth:1}}/></g>)}
    </>);
  }
  if(type==="fume"){
    return wrap(<>{slab("#cdd6da",4)}
      <rect x={6} y={6} width={w-15} height={h-20} rx={2} style={{fill:"var(--cp-cyan)",stroke:INK,strokeWidth:1.4}}/>
      <path d={`M${w*0.18} ${h-16} L${w*0.34} 8 M${w*0.3} ${h-16} L${w*0.46} 8`} style={{stroke:"#fff",strokeWidth:2.2,opacity:0.7}}/>
      <path d={`M6 ${h*0.4} H${w-9}`} style={ln({strokeWidth:1.6})}/><rect x={w/2-8} y={h*0.4-2.5} width={14} height={5} rx={2.5} style={{fill:"#cdd6da",stroke:INK,strokeWidth:1.2}}/>
      <rect x={4} y={h-11} width={w-11} height={6} rx={1.5} style={{fill:SAFE_YELLOW,stroke:INK,strokeWidth:1.2}}/>
      <path d={Array.from({length:Math.floor((w-14)/9)},(_,i)=>`M${8+i*9} ${h-5.5} l5 -5`).join(" ")} style={ln({strokeWidth:1.3})}/>
    </>);
  }
  if(type==="prepdoor"){
    const sw=w-12,sh=h-12;
    return wrap(<>
      <path d={`M ${6+sw} 6 A ${sw} ${sh} 0 0 1 6 ${6+sh} L 6 6 Z`} style={{fill:"var(--cp-cyan)",fillOpacity:0.75}}/>
      <path d={`M ${6+sw} 6 A ${sw} ${sh} 0 0 1 6 ${6+sh} L 6 6 Z`} style={{fill:"url(#cp-hatch)"}}/>
      <path d={`M ${6+sw} 6 A ${sw} ${sh} 0 0 1 6 ${6+sh}`} style={ln({strokeDasharray:"4 3"})}/>
      <rect x={6} y={3} width={sw} height={6} rx={2} style={{fill:"var(--cp-wood)",stroke:INK,strokeWidth:INK_W}}/>
      <rect x={6} y={3} width={sw} height={6} rx={2} style={{fill:"url(#cp-hatch)"}}/>
      <circle cx={6+sw-6} cy={6} r={1.4} style={{fill:INK}}/>
      <line x1={6} y1={2} x2={6} y2={h-4} style={{stroke:INK,strokeWidth:5,strokeLinecap:"round"}}/>
    </>);
  }
  if(type==="window"){
    const panes=Math.max(1,Math.round(Math.max(w,h)/56));
    return wrap(<>
      <rect x={2} y={3.5} width={w-2} height={h-2} rx={3} style={{fill:"var(--cp-shadow)"}}/>
      <rect x={0.8} y={0.8} width={w-3} height={h-3} rx={3} style={{fill:"var(--cp-sky)",stroke:INK,strokeWidth:INK_W+0.4}}/>
      <rect x={0.8} y={0.8} width={w-3} height={h-3} rx={3} style={{fill:"url(#cp-hatch)",opacity:0.6}}/>
      {Array.from({length:panes-1},(_,i)=>{const t=(i+1)/panes;return w>=h?<line key={i} x1={w*t} y1={2} x2={w*t} y2={h-3} style={{stroke:INK,strokeWidth:1.3}}/>:<line key={i} x1={2} y1={h*t} x2={w-3} y2={h*t} style={{stroke:INK,strokeWidth:1.3}}/>;})}
      {w>=h
        ?Array.from({length:panes},(_,i)=>{const x0=w*i/panes+4;return <path key={i} d={`M${x0+6} ${h-5} L${x0+14} 4 M${x0+13} ${h-5} L${x0+19} 4`} style={{stroke:"#fff",strokeWidth:2,opacity:0.7,strokeLinecap:"round"}}/>;})
        :Array.from({length:panes},(_,i)=>{const y0=h*i/panes+4;return <path key={i} d={`M4 ${y0+14} L${w-5} ${y0+7} M4 ${y0+20} L${w-5} ${y0+13}`} style={{stroke:"#fff",strokeWidth:2,opacity:0.7,strokeLinecap:"round"}}/>;})}
      {label&&<g transform={`translate(${w/2} ${h/2})`}><rect x={-(label.length*fontSize*0.3+7)} y={-(fontSize+4)/2} width={label.length*fontSize*0.6+14} height={fontSize+4} rx={3} style={{fill:"var(--cp-paper)",stroke:"var(--cp-tag-ink)",strokeWidth:1.1}}/><text x={0} y={fontSize*0.36} textAnchor="middle" style={{fontSize,fontWeight:800,fill:"var(--cp-tag-text)",fontFamily:"'Source Sans 3',sans-serif"}}>{label}</text></g>}
    </>);
  }
  if(type==="area"){
    const fill=AREA_COLOURS[opt.color]||AREA_COLOURS.mint,tw=label?Math.min(w-16,label.length*fontSize*0.62+14):0;
    return wrap(<>
      <rect x={1} y={1} width={w-3} height={h-3} rx={9} style={{fill,fillOpacity:0.42}}/>
      <rect x={1} y={1} width={w-3} height={h-3} rx={9} style={{fill:"url(#cp-hatch)",opacity:0.8}}/>
      <rect x={1} y={1} width={w-3} height={h-3} rx={9} style={{fill:"none",stroke:INK,strokeWidth:INK_W,strokeDasharray:"9 5",strokeLinecap:"round"}}/>
      {label&&<g transform="translate(9 9)"><rect x={0} y={0} width={tw} height={fontSize+8} rx={4} style={{fill:"var(--cp-paper)",stroke:"var(--cp-tag-ink)",strokeWidth:1.3}}/><text x={7} y={fontSize*0.9+3.5} style={{fontSize,fontWeight:800,fill:"var(--cp-tag-text)",fontFamily:"'Source Sans 3',sans-serif"}}>{label}</text></g>}
    </>);
  }
  if(type==="line"){
    const col=opt.color&&AREA_COLOURS[opt.color]?AREA_COLOURS[opt.color]:INK,cy=h/2,hl=Math.min(14,w*0.3);
    return wrap(<>
      <line x1={3} y1={cy} x2={opt.arrow?w-hl:w-3} y2={cy} style={{stroke:col,strokeWidth:opt.color&&opt.color!=="ink"?4.2:3.2,strokeLinecap:"round",strokeDasharray:opt.dashed?"9 7":undefined}}/>
      {opt.arrow&&<polygon points={`${w-2},${cy} ${w-hl-2},${cy-hl*0.55} ${w-hl-2},${cy+hl*0.55}`} style={{fill:col,stroke:INK,strokeWidth:1.2,strokeLinejoin:"round"}}/>}
    </>);
  }
  if(type==="box"){
    const fs=Math.min(fontSize*1.15,h*0.4);
    return wrap(<>
      <rect x={1} y={1} width={w-3} height={h-3} rx={6} style={{fill:"var(--cp-sky)",fillOpacity:0.5}}/>
      <rect x={1} y={1} width={w-3} height={h-3} rx={6} style={{fill:"url(#cp-hatch)"}}/>
      <rect x={1} y={1} width={w-3} height={h-3} rx={6} style={{fill:"none",stroke:INK,strokeWidth:INK_W,strokeDasharray:"7 4"}}/>
      {label&&<text x={(w-3)/2+1} y={(h-3)/2+1+fs*0.34} textAnchor="middle" style={{fontSize:fs,fontWeight:800,fill:INK,fontFamily:"'Source Sans 3',sans-serif"}}>{label}</text>}
    </>);
  }
  if(type==="text"){
    const txt=label||"Label",fs=Math.max(9,Math.min(20,h*0.5,(w-14)/Math.max(3,txt.length*0.56)));
    return wrap(<>
      <rect x={2.5} y={3.5} width={w-3} height={h-3} rx={4} style={{fill:"var(--cp-shadow)"}}/>
      <rect x={1} y={1} width={w-3} height={h-3} rx={4} style={{fill:"var(--cp-paper)",stroke:"var(--cp-tag-ink)",strokeWidth:1.6}}/>
      <text x={(w-3)/2+1} y={(h-3)/2+1+fs*0.35} textAnchor="middle" style={{fontSize:fs,fontWeight:800,fill:"var(--cp-tag-text)",fontFamily:"'Source Sans 3',sans-serif"}}>{txt}</text>
    </>);
  }
  if(type==="arrow"){
    const cy=h/2,sh=h*0.46,hl=Math.min(h*0.95,w*0.42);
    const pts=`1,${cy-sh/2} ${w-hl},${cy-sh/2} ${w-hl},1 ${w-2},${cy} ${w-hl},${h-2} ${w-hl},${cy+sh/2} 1,${cy+sh/2}`;
    return wrap(<>
      <polygon points={pts} transform="translate(1.5 2.5)" style={{fill:"var(--cp-shadow)"}}/>
      <polygon points={pts} style={{fill:"#ffd98a"}}/><polygon points={pts} style={{fill:"url(#cp-hatch)"}}/>
      <polygon points={pts} style={{fill:"none",stroke:INK,strokeWidth:INK_W,strokeLinejoin:"round"}}/>
    </>);
  }
  return null;
};

/* A small drawing of an item for the catalogue (it scales the real art down to fit) */
const ItemThumb=({type,size=48})=>{
  const t=ROOM_ITEM_TYPES[type];if(!t)return null;
  const k=Math.min(size/t.w,size/t.h,type==="board"||type==="screen"?1:1.6);
  return(
    <div data-theme="whiteboard" style={{width:size,height:size,position:"relative",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"visible"}}>
      <div style={{position:"relative",width:t.w*k,height:t.h*k}}>
        <div style={{position:"absolute",left:0,top:0,width:t.w,height:t.h,transform:`scale(${k})`,transformOrigin:"top left"}}>
          <RoomItemArt type={type} w={t.w} h={t.h} label={type==="text"?"Aa":undefined} fontSize={11}/>
        </div>
      </div>
    </div>
  );
};

/* A numbered station badge (and its name, if it has one) */
const StationBadge=({x,y,station})=>(
  <div title={`Station ${station.n}${station.name?` — ${station.name}`:""}`} style={{position:"absolute",left:x,top:y,zIndex:8,display:"flex",alignItems:"center",pointerEvents:"none",fontFamily:"'Source Sans 3',sans-serif",transform:"translate(-6px,-9px)"}}>
    <span style={{minWidth:22,height:22,boxSizing:"border-box",padding:"0 5px",borderRadius:11,background:"#ffd98a",border:"2px solid var(--cp-tag-ink)",color:"#1a1208",fontSize:13,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"1.5px 2px 0 var(--cp-shadow)"}}>{station.n}</span>
    {station.name&&<span style={{marginLeft:-6,paddingLeft:9,paddingRight:6,height:18,borderRadius:"0 9px 9px 0",background:"var(--cp-paper)",border:"1.5px solid var(--cp-tag-ink)",color:"var(--cp-tag-text)",fontSize:11.5,fontWeight:800,display:"flex",alignItems:"center",whiteSpace:"nowrap",boxShadow:"1.5px 2px 0 var(--cp-shadow)"}}>{station.name}</span>}
  </div>
);
/* Badges for every flagged item and table. Used by the editor and the class Seating view. */
const StationBadges=({items,pieces})=>(
  <>
    {(items||[]).filter(i=>i.station).map(i=>{const b=itemBounds(i);return <StationBadge key={`sb-${i.id}`} x={b.x} y={b.y} station={i.station}/>;})}
    {(pieces||[]).filter(p=>p.station).map(p=>{
      const w=pieceToWorld(p),xs=w.poly.map(q=>q[0]),ys=w.poly.map(q=>q[1]);
      return <StationBadge key={`sb-${p.id}`} x={Math.min(...xs)+4} y={Math.min(...ys)-14} station={p.station}/>; // just above the table edge, so it never covers a name tag
    })}
  </>
);

/* A paper label under an item, always level however the item is turned */
const ItemTag=({text,cx,top,fs=12})=>(
  <div style={{position:"absolute",left:cx,top,transform:"translateX(-50%)",zIndex:5,pointerEvents:"none",maxWidth:170,padding:"1px 7px",borderRadius:4,background:"var(--cp-paper)",border:"1.4px solid var(--cp-tag-ink)",boxShadow:"1.5px 2px 0 var(--cp-shadow)",color:"var(--cp-tag-text)",fontSize:fs,fontWeight:700,lineHeight:1.25,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:"'Source Sans 3',sans-serif"}}>{text}</div>
);
/* Items whose label is part of the drawing (so no separate paper tag) */
const ITEM_INLINE_LABEL=new Set(["desk","board","box","text","window","area"]);

/* One room item on the map. The same component draws it in the editor (with
   mouse handlers) and in the class Seating view (without), so they can't drift apart. */
const RoomItemView=({item,selected=false,onMouseDown,onClick,onDoubleClick,title,cursor,fontScale=1})=>{
  const g=itemGeom(item),b=itemBounds(item);
  const inline=ITEM_INLINE_LABEL.has(item.type);
  const vert=g.legacy&&g.w<g.h;
  const artLabel=inline?(item.label??(item.type==="desk"?(vert?"Desk":"Teacher's Desk"):item.type==="board"?"Board":undefined)):undefined;
  const tagText=inline?null:(item.label??(g.legacy&&item.type==="door"?"Door":null));
  const live=!!(onMouseDown||onClick);
  const isArea=item.type==="area";
  const handlers={onMouseDown,onClick,onDoubleClick,title};
  return(
    <>
      <div {...(isArea?{}:handlers)}
        style={{position:"absolute",left:g.x,top:g.y,width:g.w,height:g.h,transform:g.rot?`rotate(${g.rot}deg)`:undefined,transformOrigin:g.origin==="tl"?"top left":"center",cursor:cursor||"default",userSelect:"none",pointerEvents:live&&!isArea?"auto":"none"}}>
        {selected&&<div style={{position:"absolute",inset:-4,borderRadius:8,border:"2.5px solid var(--cp-sel)",boxShadow:"0 0 0 4px var(--cp-sel-glow)",pointerEvents:"none"}}/>}
        <RoomItemArt type={item.type} w={g.w} h={g.h} label={artLabel} fontSize={(item.type==="board"?11:12)*fontScale} color={item.color} dashed={item.dashed} arrow={item.arrow}/>
        {/* a big area must not swallow clicks meant for the floor or for tables inside it, so only its edge strip is grabbable */}
        {isArea&&live&&[{left:0,top:0,right:0,height:14},{left:0,bottom:0,right:0,height:10},{left:0,top:0,bottom:0,width:10},{right:0,top:0,bottom:0,width:10}].map((st,i)=>(
          <div key={i} {...handlers} style={{position:"absolute",...st,pointerEvents:"auto",cursor:cursor||"grab"}}/>
        ))}
      </div>
      {tagText&&<ItemTag text={tagText} cx={b.x+b.w/2} top={b.y+b.h+4} fs={12*fontScale}/>}
    </>
  );
};

/* Walls and openings, drawn as one picture: thick ink-outlined lines with pencil
   hatching (outlines first, then fills, so corners join cleanly), a gap in the
   wall for each door with its swing, and a glazed strip for each window. With
   `edit` set it also adds the invisible hit areas and end handles for Edit room. */
const WallsLayer=({walls,openings,selWallId,selOpeningId,draft,edit})=>{
  const ws=walls||[],byId=new Map(ws.map(w=>[w.id,w]));
  const T=WALL_T;
  const ops=(openings||[]).map(o=>{const w=byId.get(o.wallId);return w?{o,w,f:openingFrame(w,o)}:null;}).filter(Boolean);
  if(!ws.length&&!draft)return null;
  const line=(w,st,extra)=><line key={w.id+(extra||"")} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} style={st}/>;
  const swingPath=(r,s)=>`M ${r} 0 A ${r} ${r} 0 0 ${s===-1?0:1} 0 ${s*r}`;
  /* a door leaf of width r hinged at the origin, opened to the side s */
  const leaf=(r,s)=>(
    <g>
      <path d={`M 0 0 L ${r} 0 A ${r} ${r} 0 0 ${s===-1?0:1} 0 ${s*r} Z`} style={{fill:"var(--cp-cyan)",fillOpacity:0.7}}/>
      <path d={`M 0 0 L ${r} 0 A ${r} ${r} 0 0 ${s===-1?0:1} 0 ${s*r} Z`} style={{fill:"url(#cp-hatch)"}}/>
      <path d={swingPath(r,s)} style={{fill:"none",stroke:INK,strokeWidth:1.2,strokeDasharray:"4 3"}}/>
      <rect x={-2.5} y={s===1?0:-r} width={5} height={r} rx={1.5} style={{fill:"var(--cp-wood)",stroke:INK,strokeWidth:1.5}}/>
      <rect x={-2.5} y={s===1?0:-r} width={5} height={r} rx={1.5} style={{fill:"url(#cp-hatch)"}}/>
    </g>
  );
  return(
    <svg width="1" height="1" style={{position:"absolute",left:0,top:0,overflow:"visible",pointerEvents:"none",zIndex:0}} aria-hidden={edit?undefined:"true"}>
      {ws.map(w=>w.id===selWallId&&line(w,{stroke:"var(--cp-sel-glow)",strokeWidth:T+14,strokeLinecap:"round"},"g"))}
      {ws.map(w=>line(w,{stroke:w.id===selWallId?"var(--cp-sel)":INK,strokeWidth:T+(w.id===selWallId?4.4:3.2),strokeLinecap:"square"},"o"))}
      {ws.map(w=>line(w,{stroke:"var(--cp-wall)",strokeWidth:T,strokeLinecap:"square"},"f"))}
      {ws.map(w=>line(w,{stroke:"url(#cp-hatch-wall)",strokeWidth:T,strokeLinecap:"square"},"h"))}
      {ops.map(({o,f})=>{
        const r=o.width||56,s=o.swing===-1?-1:1,sel=o.id===selOpeningId;
        const jamb=x=><line key={x} x1={x} y1={-T/2-1.5} x2={x} y2={T/2+1.5} style={{stroke:INK,strokeWidth:2.6,strokeLinecap:"butt"}}/>;
        return(
          <g key={o.id} transform={`translate(${f.c[0]} ${f.c[1]}) rotate(${f.ang})`}>
            {sel&&<rect x={-r/2-5} y={-T/2-6} width={r+10} height={T+12} rx={5} style={{fill:"none",stroke:"var(--cp-sel)",strokeWidth:2.4}}/>}
            {sel&&<rect x={-r/2-5} y={-T/2-6} width={r+10} height={T+12} rx={5} style={{fill:"none",stroke:"var(--cp-sel-glow)",strokeWidth:8}}/>}
            {o.type==="window"?(
              <>
                <rect x={-r/2} y={-T/2} width={r} height={T} style={{fill:"var(--cp-window)",stroke:INK,strokeWidth:1.6}}/>
                <rect x={-r/2} y={-T/2} width={r} height={T} style={{fill:"url(#cp-hatch)"}}/>
                <line x1={-r/2} y1={0} x2={r/2} y2={0} style={{stroke:INK,strokeWidth:1.1}}/>
                {jamb(-r/2)}{jamb(r/2)}
              </>
            ):(
              <>
                <rect x={-r/2} y={-T/2-2} width={r} height={T+4} style={{fill:"var(--cp-floor)"}}/>
                {jamb(-r/2)}{jamb(r/2)}
                {o.type==="double-door"
                  ?<><g transform={`translate(${-r/2} 0)`}>{leaf(r/2,s)}</g><g transform={`translate(${r/2} 0) scale(-1 1)`}>{leaf(r/2,s)}</g></>
                  :<g transform={o.flip?`translate(${r/2} 0) scale(-1 1)`:`translate(${-r/2} 0)`}>{leaf(r,s)}</g>}
              </>
            )}
          </g>
        );
      })}
      {draft&&<line x1={draft.x1} y1={draft.y1} x2={draft.x2} y2={draft.y2} style={draft.line?{stroke:"var(--cp-sel)",strokeWidth:3.2,strokeLinecap:"round",opacity:0.7,strokeDasharray:"6 5"}:{stroke:"var(--cp-sel)",strokeWidth:T,strokeLinecap:"square",opacity:0.55}}/>}
      {edit&&ws.map(w=><line key={`hit-${w.id}`} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} onMouseDown={e=>edit.onWallMD(e,w.id)} onClick={e=>e.stopPropagation()}
        title="Click to select this wall, drag to move it. Drag its end dots to stretch it." style={{stroke:"transparent",strokeWidth:T+10,pointerEvents:"stroke",cursor:"move"}}/>)}
      {edit&&ops.map(({o,f})=>(
        <rect key={`oh-${o.id}`} x={-(o.width||56)/2} y={-T/2-5} width={o.width||56} height={T+10} transform={`translate(${f.c[0]} ${f.c[1]}) rotate(${f.ang})`}
          onMouseDown={e=>edit.onOpeningMD(e,o.id)} onClick={e=>e.stopPropagation()}
          title={`${OPENING_TYPES[o.type]?.name||"Opening"} — click to select, drag along the wall to slide it`} style={{fill:"transparent",pointerEvents:"all",cursor:"grab"}}/>
      ))}
      {edit&&ws.filter(w=>w.id===selWallId).map(w=>[[w.x1,w.y1,"a"],[w.x2,w.y2,"b"]].map(([x,y,end])=>(
        <circle key={`end-${w.id}-${end}`} cx={x} cy={y} r={7} onMouseDown={e=>edit.onEndMD(e,w.id,end)} onClick={e=>e.stopPropagation()}
          title="Drag to move this end of the wall (corners that meet here move together)" style={{fill:"#fff",stroke:"var(--cp-sel)",strokeWidth:2.4,pointerEvents:"all",cursor:"crosshair"}}/>
      )))}
    </svg>
  );
};

/* Table pieces (shapes that can rotate and join — see the geometry block below):
   chairs tucked under each seat's edge (back showing), facing in, then one continuous table
   top per cluster of joined pieces. A cluster's outlines all go in one SVG,
   ink first at double width and wood on top, so where two pieces meet the
   wood covers the seam and only a very faint dotted line is left. Used by both
   Manage Seating and the class Seating view, so the two can't drift apart.
   seatByKey maps "pieceId:slot" → seat (for chair colour / empty / unused). */
const isWorkstationPiece=p=>(p.roles||[]).includes('workstation')&&!(p.roles||[]).includes('desk');
const PieceTables=({pieces,joins,slots,seatByKey,chairMap,selectedIds,hideUnused=false,snapLine=null,groups,chairMatch=false})=>{
  if(!pieces?.length)return null;
  const W=new Map(pieces.map(p=>[p.id,pieceToWorld(p)]));
  const groupById=new Map((groups||[]).map(g=>[g.id,g])),pieceById=new Map(pieces.map(p=>[p.id,p]));
  /* a cluster's colour: its group's (one cluster = one group); a lone piece with no group has its own */
  const colorOfPieces=ids=>{
    const s=slots.filter(q=>ids.includes(q.pieceId)).map(q=>seatByKey?.get(q.key)).find(x=>x?.groupId&&groupById.has(x.groupId));
    return s?groupById.get(s.groupId).color:ids.map(id=>pieceById.get(id)?.color).find(Boolean);
  };
  const sel=selectedIds||new Set();
  const shape=(w,props,key)=>w.circle
    ?<circle key={key} cx={w.center[0]} cy={w.center[1]} r={w.circle} {...props}/>
    :<polygon key={key} points={w.poly.map(p=>p.join(",")).join(" ")} {...props}/>;
  return(
    <>
      {slots.filter(s=>s.state==='on').map(s=>{
        const seat=seatByKey?.get(s.key);
        if(hideUnused&&seat&&!seat.used)return null;
        const bad=!!seat?.unavailable;
        const Mark=s.standing?StandingSpot:Chair; // lab benches: people stand, so a floor mat instead of a chair
        return <Mark key={`ch-${s.key}`} x={s.chair.x} y={s.chair.y} facing={s.chair.facing}
          color={bad?"var(--cp-coral)":matchedChair(chairMatch,seatTableColor(seat,groupById,pieceById),chairMap?.[seat?.id]??0)} empty={!bad&&(!seat?.studentId||!seat?.used)} dim={!!seat&&!seat.used}/>;
      })}
      <svg width="1" height="1" style={{position:"absolute",left:0,top:0,overflow:"visible",pointerEvents:"none"}} aria-hidden="true">
        {clustersFromJoins(pieces,joins).map(ids=>{
          const ws=ids.map(id=>W.get(id));
          const isSel=ids.some(id=>sel.has(id));
          const tcol=colorOfPieces(ids);
          const seams=(joins||[]).filter(j=>ids.includes(j.a)&&ids.includes(j.b)).map(j=>{
            const ea=W.get(j.a)?.edges[j.ea],eb=W.get(j.b)?.edges[j.eb];if(!ea||!eb)return null;
            const[u0,u1]=pgOverlap(ea,eb);
            return[[ea.a[0]+ea.dir[0]*u0,ea.a[1]+ea.dir[1]*u0],[ea.a[0]+ea.dir[0]*u1,ea.a[1]+ea.dir[1]*u1]];
          }).filter(Boolean);
          return(
            <g key={ids[0]}>
              {ws.map(w=>shape(w,{transform:"translate(2.5 3.5)",style:{fill:"var(--cp-shadow)"}},`sh${w.id}`))}
              {isSel&&ws.map(w=>shape(w,{style:{fill:"none",stroke:"var(--cp-sel-glow)",strokeWidth:12,strokeLinejoin:"round"}},`gl${w.id}`))}
              {ws.map(w=>shape(w,{style:{fill:"none",stroke:isSel&&sel.has(w.id)?"var(--cp-sel)":INK,strokeWidth:(isSel&&sel.has(w.id)?2.4:INK_W)*2,strokeLinejoin:"round"}},`ol${w.id}`))}
              {ws.map(w=>shape(w,{style:{fill:tcol&&TABLE_COLOR_KEYS.has(tcol)?tableFill(tcol):isWorkstationPiece(w.piece)?"var(--cp-bench)":"var(--cp-wood)"}},`fl${w.id}`))}
              {ws.map(w=>shape(w,{style:{fill:"url(#cp-hatch)"}},`ht${w.id}`))}
              {seams.map(([a,b],i)=><line key={`sm${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} style={{stroke:INK,strokeOpacity:0.16,strokeWidth:1.2,strokeDasharray:"1.5 4",strokeLinecap:"round"}}/>)}
              {ws.filter(w=>w.piece.label).map(w=>{
                /* seat tags sit along the seated side, so the label goes to the other half of the table where it stays readable */
                const mine=slots.filter(q=>q.pieceId===w.id&&q.state==='on'&&q.tag?.mode==='table');
                const an=mine.length?[mine.reduce((a,q)=>a+q.n[0],0)/mine.length,mine.reduce((a,q)=>a+q.n[1],0)/mine.length]:[0,0];
                const off=Math.hypot(an[0],an[1])>0.6?-17:0;
                return <text key={`lb${w.id}`} x={w.center[0]+an[0]*off} y={w.center[1]+an[1]*off+4} textAnchor="middle" style={{fontSize:11,fontWeight:800,letterSpacing:"1.5px",textTransform:"uppercase",fill:INK,fillOpacity:0.55,fontFamily:"'Source Sans 3',sans-serif"}}>{w.piece.label}</text>;
              })}
            </g>
          );
        })}
        {/* While dragging: where the table will join, as a bright line */}
        {snapLine&&<line x1={snapLine[0][0]} y1={snapLine[0][1]} x2={snapLine[1][0]} y2={snapLine[1][1]} style={{stroke:"var(--cp-join)",strokeWidth:6,strokeLinecap:"round",opacity:0.9}}/>}
      </svg>
    </>
  );
};

/* Tiny drawing of a shape or ready-made combo for the menus — the same geometry
   as the real thing, scaled down, with chairs as little rounded blocks. */
const pieceThumbCache=new Map();
const PieceThumb=({kind,seatCount,size=44})=>{
  const ck=`${kind}:${seatCount||''}`;
  if(!pieceThumbCache.has(ck)){
    let n=0;const set=buildPieceSet(kind,()=>`t${n++}`,{seatCount});
    const slots=slotsForLayout(set.pieces,set.joins).filter(s=>s.state==='on');
    const ws=set.pieces.map(pieceToWorld);
    const pts=[...ws.flatMap(w=>w.poly),...slots.map(s=>[s.chair.x,s.chair.y])];
    const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
    pieceThumbCache.set(ck,{ws,slots,box:[Math.min(...xs)-14,Math.min(...ys)-14,Math.max(...xs)-Math.min(...xs)+28,Math.max(...ys)-Math.min(...ys)+28]});
  }
  const{ws,slots,box}=pieceThumbCache.get(ck);
  const sc=Math.max(box[2],box[3])/size; // world px per thumbnail px, so ink stays a constant weight
  return(
    <svg width={size} height={size} viewBox={box.join(" ")} style={{flexShrink:0,overflow:"visible"}} aria-hidden="true">
      {slots.map(s=><rect key={s.key} x={-12} y={-7} width={24} height={14} rx={4} transform={`translate(${s.chair.x} ${s.chair.y}) rotate(${s.chair.facing})`} style={{fill:"var(--cp-chair-1)",stroke:"#2b2118",strokeWidth:1.2*sc}}/>)}
      {ws.map(w=>w.circle
        ?<circle key={w.id} cx={w.center[0]} cy={w.center[1]} r={w.circle} style={{fill:isWorkstationPiece(w.piece)?"#bfd3d6":"#cc9d74",stroke:"#2b2118",strokeWidth:1.3*sc}}/>
        :<polygon key={w.id} points={w.poly.map(p=>p.join(",")).join(" ")} style={{fill:isWorkstationPiece(w.piece)?"#bfd3d6":"#cc9d74",stroke:"#2b2118",strokeWidth:1.3*sc,strokeLinejoin:"round"}}/>)}
    </svg>
  );
};

/* The seating canvas used to always be at least 960×680 data-pixels, even for a
   two-table room — which is often bigger than the panel showing it, so centering
   (whether by scroll position or by flexbox) had no effect: the oversized empty
   canvas was what got "centered", not the actual desks. Sizing it to the real
   content (with a sensible floor) fixes that at the source. */
const canvasContentSize=(seatsIn,roomItemsIn,piecesIn,slotsIn,wallsIn)=>{
  // table pieces reach past their seat boxes (chairs, table corners), so count their drawn bounds too
  const pb=piecesIn?.length?piecesBounds(piecesIn,slotsIn):null;
  const wb=wallsBounds(wallsIn);
  const ib=(roomItemsIn||[]).map(itemBounds);
  const xs=[0,...(seatsIn||[]).map(s=>s.x+SW),...ib.map(b=>b.x+Math.max(b.w,90)),...(pb?[pb.x+pb.w]:[]),...(wb?[wb.x+wb.w]:[])];
  const ys=[0,...(seatsIn||[]).map(s=>s.y+SH),...ib.map(b=>b.y+b.h+30),...(pb?[pb.y+pb.h]:[]),...(wb?[wb.y+wb.h]:[])];
  return{w:Math.max(400,Math.max(...xs)+40),h:Math.max(300,Math.max(...ys)+40)};
};
/* Keep-apart/keep-together rules now hold a studentIds list (2 or more) rather
   than a fixed aId/bId pair, so a rule can cover a whole known-disruptive group
   at once instead of needing every pairwise combination spelled out. Old saved
   rules are still {aId,bId} on disk — read through this everywhere instead of
   the raw fields, and only ever write the new studentIds shape. */
const ruleStudentIds=r=>r.studentIds||[r.aId,r.bId].filter(Boolean);

/* Pairing history ("who's already worked/sat with whom", used by Smart
   shuffle) can be tracked as one store shared between Groups and Manage
   Seating, or as two independent stores — a per-class choice. Combined is
   the storage key this app always used before the split existed, so it
   stays the default and needs no migration. */
const phKey=(classId,mode,source)=>mode==='separate'?`ph-${source}-${classId}`:`ph-${classId}`;

/* Shared by the group generator and by rehydrating a saved grouping (whose
   rules or roster may have moved on since it was generated) — recomputes a
   fresh, accurate conflicts list rather than trusting stale saved text. */
const checkGroupConflicts=(groups,rules,students,names)=>{
  const out=[];
  const apartRules=(rules||[]).filter(r=>r.type==='apart');
  const togetherRules=(rules||[]).filter(r=>r.type==='together');
  groups.forEach((g,gi)=>{
    const ids=new Set(g.map(s=>s.id));
    apartRules.forEach(r=>{
      const ruleIds=ruleStudentIds(r);
      const clashing=ruleIds.filter(id=>ids.has(id)).map(id=>students.find(s=>s.id===id)).filter(Boolean);
      if(clashing.length>=2)out.push(`Keep apart: ${clashing.map(s=>s.name).join(', ')} are all in ${(names&&names[gi])||`Group ${gi+1}`}`);
    });
  });
  togetherRules.forEach(r=>{
    const ruleIds=ruleStudentIds(r);
    const named=ruleIds.map(id=>students.find(s=>s.id===id)).filter(Boolean);
    if(named.length<2)return;
    const found=groups.some(g=>{const ids=new Set(g.map(s=>s.id));return ruleIds.every(id=>ids.has(id));});
    if(!found)out.push(`Keep together: ${named.map(s=>s.name).join(', ')} are in different groups`);
  });
  return out;
};

/* Reusable keep-apart/keep-together rule list + builder — used by both the
   Manage Seating "Classroom rules" panel and the Groups panel's own custom
   rules, so the two stay visually and behaviourally identical. */
function RuleEditor({rules,onChange,students,title="Keep apart / together"}){
  const[newRule,setNewRule]=useState({type:'apart',studentIds:[]});
  return(
    <div>
      {title&&<div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase",marginBottom:"8px"}}>{title}</div>}
      {rules.length===0&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.25)",fontStyle:"italic",marginBottom:"8px"}}>No rules yet</div>}
      <div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"10px"}}>
        {rules.map(r=>{
          const named=ruleStudentIds(r).map(id=>students.find(s=>s.id===id)).filter(Boolean);
          if(named.length<2)return null;
          return(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 7px",borderRadius:"7px",background:r.type==='apart'?"#fdeeed":"#edf7ef",border:`1px solid ${r.type==='apart'?"rgba(200,60,60,0.15)":"rgba(58,138,78,0.15)"}`}}>
              <span style={{fontSize:"9px",fontWeight:700,color:r.type==='apart'?"#c44":"#3a8a4e",letterSpacing:"0.5px",textTransform:"uppercase",flexShrink:0}}>{r.type==='apart'?'↔':'↕'}</span>
              <span style={{fontSize:"10px",flex:1,color:"#1a1a2e",lineHeight:1.3,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={named.map(s=>s.name).join(', ')}>{named.map(s=>s.name.split(' ')[0]).join(', ')}</span>
              <button className="cpb cpb-ghost" onClick={()=>onChange(rules.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",color:"rgba(0,0,0,0.2)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"0 2px",flexShrink:0}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.2)"}>×</button>
            </div>
          );
        })}
      </div>

      {/* Add rule — pick a type, then add as many students as belong to it
          (e.g. four known-disruptive students to keep apart from each
          other), not just a fixed pair */}
      {students.length>=2&&(
        <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
          <div style={{display:"flex",gap:"3px"}}>
            {['apart','together'].map(t=>(
              <button className={`cpb${newRule.type===t?" on":""}`} key={t} onClick={()=>setNewRule(p=>({...p,type:t}))} style={{flex:1,padding:"4px 0",borderRadius:"6px",border:"none",cursor:"pointer",fontSize:"9.5px",fontWeight:700,background:newRule.type===t?(t==='apart'?"#fdeeed":"#edf7ef"):"rgba(0,0,0,0.04)",color:newRule.type===t?(t==='apart'?"#c44":"#3a8a4e"):"rgba(0,0,0,0.35)",fontFamily:"'Source Sans 3',sans-serif"}}>
                {t==='apart'?'Keep apart':'Keep together'}
              </button>
            ))}
          </div>
          {newRule.studentIds.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:"3px"}}>
              {newRule.studentIds.map(id=>{
                const st=students.find(s=>s.id===id);if(!st)return null;
                return(
                  <span key={id} style={{display:"flex",alignItems:"center",gap:"3px",fontSize:"10px",fontWeight:600,padding:"2px 3px 2px 7px",borderRadius:"9px",background:newRule.type==='apart'?"#fdeeed":"#edf7ef",color:newRule.type==='apart'?"#c44":"#3a8a4e"}}>
                    {st.name.split(' ')[0]}
                    <button className="cpb cpb-ghost" onClick={()=>setNewRule(p=>({...p,studentIds:p.studentIds.filter(x=>x!==id)}))} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",fontSize:"12px",lineHeight:1,padding:"0 2px",opacity:0.6}}>×</button>
                  </span>
                );
              })}
            </div>
          )}
          <select value="" onChange={e=>{const id=e.target.value;if(id)setNewRule(p=>({...p,studentIds:[...p.studentIds,id]}));}} style={{padding:"4px 6px",borderRadius:"6px",border:"1px solid rgba(0,0,0,0.09)",fontSize:"11px",fontFamily:"'Source Sans 3',sans-serif",background:"#fff",color:"#1a1a2e",outline:"none"}}>
            <option value="">{newRule.studentIds.length?'+ Add another…':'+ Add a student…'}</option>
            {students.filter(s=>!newRule.studentIds.includes(s.id)).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className={`cpb cpb-primary${newRule.studentIds.length<2?" is-off":""}`} onClick={()=>{
            if(newRule.studentIds.length<2)return;
            onChange([...rules,{id:sUid(),type:newRule.type,studentIds:newRule.studentIds}]);
            setNewRule(p=>({...p,studentIds:[]}));
          }} disabled={newRule.studentIds.length<2} style={{padding:"5px",borderRadius:"6px",border:"none",background:newRule.studentIds.length<2?"rgba(0,0,0,0.06)":"#1a1a2e",color:newRule.studentIds.length<2?"rgba(0,0,0,0.25)":"#fff",fontSize:"11px",fontWeight:600,cursor:newRule.studentIds.length<2?"default":"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>
            + Add rule{newRule.studentIds.length>=2?` (${newRule.studentIds.length})`:''}
          </button>
        </div>
      )}
    </div>
  );
}

const sSnap=v=>Math.round(v/SGR)*SGR;
const sUid=()=>Math.random().toString(36).slice(2,9);
const MONTH_ABBR=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
/* "24 Nov", for a setup made from Groups */
const fmtSetupDate=ts=>{const d=new Date(ts);return `${d.getDate()} ${MONTH_ABBR[d.getMonth()][0]+MONTH_ABBR[d.getMonth()].slice(1).toLowerCase()}`;};
const fmtArrangementDate=ts=>{
  const d=new Date(ts);
  return `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
};

/* Popovers that live inside a scrolling sidebar get visually clipped at that
   sidebar's edge — overflow-y:auto forces overflow-x to clip too, per the CSS
   spec, even though only the vertical axis was meant to scroll. Rendering the
   popover through a portal into <body>, fixed at the trigger's on-screen
   position, sidesteps that entirely so it can float freely over the canvas. */
function useAnchoredMenu(){
  const[pos,setPos]=useState(null); // null = closed; {left,top|bottom,maxHeight} = open, viewport coords
  const anchorRef=useRef(null);
  const menuRef=useRef(null);
  const toggle=()=>{
    if(pos){setPos(null);return;}
    const el=anchorRef.current;
    if(!el)return;
    const r=el.getBoundingClientRect();
    const margin=10;
    const spaceBelow=window.innerHeight-r.bottom-margin;
    const spaceAbove=r.top-margin;
    // Open downward if there's reasonable room, or more room than above;
    // otherwise flip upward — either way capped so it never runs off-screen
    // with no way to reach the rest (a fixed-position popover doesn't scroll
    // with the page, so it has to fit the viewport on its own).
    if(spaceBelow>=160||spaceBelow>=spaceAbove){
      setPos({left:r.left,top:r.bottom+4,maxHeight:Math.max(120,spaceBelow-4)});
    } else {
      setPos({left:r.left,bottom:window.innerHeight-r.top+4,maxHeight:Math.max(120,spaceAbove-4)});
    }
  };
  useEffect(()=>{
    if(!pos)return;
    const away=e=>{
      if(anchorRef.current?.contains(e.target))return;
      if(menuRef.current?.contains(e.target))return;
      setPos(null);
    };
    const dismiss=()=>setPos(null);
    // scrolling inside the popover itself (a long list) must not close it — only the page moving underneath it does
    const onScroll=e=>{if(menuRef.current&&e&&e.target instanceof Node&&menuRef.current.contains(e.target))return;setPos(null);};
    document.addEventListener("mousedown",away);
    window.addEventListener("scroll",onScroll,true);
    window.addEventListener("resize",dismiss);
    return()=>{document.removeEventListener("mousedown",away);window.removeEventListener("scroll",onScroll,true);window.removeEventListener("resize",dismiss);};
  },[pos]);
  return{pos,anchorRef,menuRef,toggle,close:()=>setPos(null)};
}
/* Default group name: next unused number, so groups are "1","2","3"… until renamed */
const nextGroupLabel=existingGroups=>{
  const nums=(existingGroups||[]).map(g=>parseInt(g.label)).filter(n=>!isNaN(n));
  return String(nums.length?Math.max(...nums)+1:1);
};
const sLayout=(n,orientation='H')=>{
  if(n===1)return[{c:0,r:0}];
  if(orientation==='V')return Array.from({length:n},(_,i)=>({c:0,r:i}));
  if(n===2)return[{c:0,r:0},{c:1,r:0}];
  if(n===3)return[{c:0,r:0},{c:1,r:0},{c:2,r:0}];
  return Array.from({length:n},(_,i)=>({c:i%2,r:Math.floor(i/2)}));
};
const detectOrientation=posArr=>{
  if(posArr.length<2)return'H';
  const xs=posArr.map(p=>p.x),ys=posArr.map(p=>p.y);
  const spanX=Math.max(...xs)-Math.min(...xs);
  const spanY=Math.max(...ys)-Math.min(...ys);
  return spanY>spanX?'V':'H';
};
// All seats store absolute x,y — groups just track membership
const sPosMap=(seats,_groups,dd)=>{
  const p={};
  const wholeIds=dd&&!dd.singleSeat?dd.ids:new Set();
  seats.forEach(s=>{
    let x=s.x,y=s.y;
    if(dd){
      if(dd.singleSeat===s.id||wholeIds.has(s.id)){x+=dd.dx;y+=dd.dy;}
    }
    p[s.id]={x,y};
  });
  return p;
};
// Group bounding box from actual seat positions
const gBoundsFromSeats=(g,seats)=>{
  const gs=g.seatIds.map(id=>seats.find(s=>s.id===id)).filter(Boolean);
  if(!gs.length)return{x:0,y:0,w:SW,h:SH};
  const minX=Math.min(...gs.map(s=>s.x)),minY=Math.min(...gs.map(s=>s.y));
  const maxX=Math.max(...gs.map(s=>s.x)),maxY=Math.max(...gs.map(s=>s.y));
  return{x:minX,y:minY,w:maxX-minX+SW,h:maxY-minY+SH};
};
/* Self-heal a loaded (seats, groups) pair: drop group membership that points at
   seats that don't exist or have already been claimed by an earlier group,
   dissolve any group that drops below 2 valid members, and rebuild every
   seat's groupId strictly from the cleaned-up groups — the groups array is
   treated as the source of truth, not whatever a seat's own field says.
   This exists because a seat and its group can drift out of sync (a past bug,
   now fixed, could do this) and once that's saved, it stays broken forever
   without a repair pass like this on every load. */
const repairSeatGroups=(seatsIn,groupsIn)=>{
  const seatIds=new Set(seatsIn.map(s=>s.id));
  const seen=new Set();
  const cleanedGroups=[];
  (groupsIn||[]).forEach(g=>{
    const validMembers=(g.seatIds||[]).filter(id=>seatIds.has(id)&&!seen.has(id));
    if(validMembers.length>=2){
      validMembers.forEach(id=>seen.add(id));
      cleanedGroups.push({...g,seatIds:validMembers});
    }
  });
  const groupOf={};
  cleanedGroups.forEach(g=>g.seatIds.forEach(id=>{groupOf[id]=g.id;}));
  const repairedSeats=seatsIn.map(s=>{
    const trueGroupId=groupOf[s.id]||null;
    return s.groupId===trueGroupId?s:{...s,groupId:trueGroupId};
  });
  return{seats:repairedSeats,groups:cleanedGroups};
};

/* @geometry-begin ════════════════════════════════════════════════════════
   TABLE PIECES — pure geometry for table shapes, rotation, snapping and joins.
   No JSX and no references to anything outside this block, so
   tests/geometry.test.js can lift it out of this file and run it in plain node.

   A piece is {id, shape, x, y, rot, roles, seatsOff?, seatsOn?, seatCount?, label?}:
   (x,y) is where its local origin (the shape's centre) sits on the canvas and
   rot turns it clockwise in degrees. Seats are still the thing the randomiser
   and rules read — pieces just *generate* them (syncPieceSeats), each one
   tagged with its pieceId and slot number so who sits there survives any move,
   rotate, join or split.
   ════════════════════════════════════════════════════════════════════════ */
const PG={
  SEAT_W:114,SEAT_H:52,   // the notional seat box every seat still has (must match SW/SH)
  CHAIR_OFF:-1,           // chair centre sits this far INSIDE the edge: it's tucked under the table, only its back sticks out
  CHAIR_OUT:8,            // ...so this much of the chair shows beyond the table edge
  STAND_OFF:11,           // a standing spot (lab bench) is a floor mat just outside the edge, not tucked under
  GROUP_PAD:8,            // table top round a plain seat group (must match GROUP_PAD)
  SNAP_DIST:18,SNAP_ANGLE:12,
  JOIN_MARGIN:12,         // a slot this close to a joined stretch of edge hides too (its chair would hit the other table)
};
const pgR=v=>Math.round(v*100)/100;
/* Lab benches ('Use for: Workstation' only) have standing spots, not chairs: students stand to do practical work. */
const pgStanding=p=>{const r=p?.roles||[];return r.length===1&&r[0]==='workstation';};
const pgNorm=a=>{a=((a%360)+360)%360;return a>180?a-360:a;};   // → (-180,180]
const pgNorm360=a=>pgR(((a%360)+360)%360);
const pgSub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const pgDot=(a,b)=>a[0]*b[0]+a[1]*b[1];
const pgLen=a=>Math.hypot(a[0],a[1]);
const pgMid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
const pgAng=d=>Math.atan2(d[1],d[0])*180/Math.PI;
const pgRot=(p,deg,c=[0,0])=>{
  const r=deg*Math.PI/180,co=Math.cos(r),si=Math.sin(r),dx=p[0]-c[0],dy=p[1]-c[1];
  return[c[0]+dx*co-dy*si,c[1]+dx*si+dy*co];
};
const pgInPoly=(pt,poly)=>{
  let ins=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const[xi,yi]=poly[i],[xj,yj]=poly[j];
    if(((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))ins=!ins;
  }
  return ins;
};

/* Outlines are listed clockwise on screen, so edge i runs poly[i]→poly[i+1]
   and its outward normal is (dy,-dx). Rect edges: 0 top, 1 right, 2 bottom, 3 left. */
const pgRect=(w,h)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
const pgAlong=(edge,n,on=true)=>Array.from({length:n},(_,i)=>({edge,t:(i+0.5)/n,on}));
const TRAP_H=Math.sqrt(90*90-45*45); // ≈77.94: long base 180, short base 90, 60° base angles, slanted sides 90
/* Slot numbers are saved with each seat, so never reorder a shape's slots —
   only add new ones on the end. `on:false` slots exist but start switched off. */
const SHAPES={
  single:{name:'Single desk',w:104,h:64,poly:pgRect(104,64),slots:[{edge:2,t:0.5,on:true},{edge:0,t:0.5,on:false}],roles:['desk']},
  pair:{name:'Pair desk',w:200,h:64,poly:pgRect(200,64),slots:[...pgAlong(2,2),...pgAlong(0,2,false)],roles:['desk']},
  long4:{name:'Long table',w:208,h:96,poly:pgRect(208,96),slots:[...pgAlong(0,2),...pgAlong(2,2),{edge:1,t:0.5,on:false},{edge:3,t:0.5,on:false}],roles:['desk']},
  long6:{name:'Long table of 6',w:296,h:96,poly:pgRect(296,96),slots:[...pgAlong(0,3),...pgAlong(2,3),{edge:1,t:0.5,on:false},{edge:3,t:0.5,on:false}],roles:['desk']},
  trap:{name:'Trapezoid',w:180,h:TRAP_H,poly:[[-45,-TRAP_H/2],[45,-TRAP_H/2],[90,TRAP_H/2],[-90,TRAP_H/2]],
    slots:[{edge:0,t:0.5,on:true},{edge:1,t:0.5,on:true},{edge:2,t:0.5,on:true},{edge:3,t:0.5,on:true}],roles:['desk']},
  round:{name:'Round table',w:150,h:150,circle:75,seats:4,roles:['desk']},
  bench:{name:'Lab bench',w:320,h:80,poly:pgRect(320,80),slots:[...pgAlong(2,4),...pgAlong(0,4,false)],roles:['workstation']},
};

const shapeDef=(shape,piece)=>{
  const s=SHAPES[shape]||SHAPES.single;
  if(s.circle){
    // a round table has no straight edges, so it never snaps; seats spread evenly from the bottom
    const n=Math.max(3,Math.min(8,piece?.seatCount||s.seats));
    const poly=Array.from({length:48},(_,i)=>{const a=i/48*2*Math.PI;return[s.circle*Math.cos(a),s.circle*Math.sin(a)];});
    return{...s,key:shape,poly,edges:[],slots:Array.from({length:n},(_,i)=>({idx:i,angle:90+i*360/n,on:true}))};
  }
  const edges=s.poly.map((a,i)=>{const b=s.poly[(i+1)%s.poly.length];return{i,a,b,len:pgLen(pgSub(b,a))};});
  return{...s,key:shape,edges,slots:s.slots.map((sl,i)=>({...sl,idx:i}))};
};

/* A piece in canvas coordinates: outline, edges (with direction and outward
   normal) and each slot's point on the edge plus its outward normal. */
const pieceToWorld=piece=>{
  const d=shapeDef(piece.shape,piece);
  const rot=piece.rot||0,c=[piece.x,piece.y];
  const W=p=>{const r=pgRot(p,rot);return[r[0]+c[0],r[1]+c[1]];};
  const poly=d.poly.map(W);
  const edges=d.edges.map(e=>{
    const a=W(e.a),b=W(e.b),v=pgSub(b,a),L=pgLen(v)||1,dir=[v[0]/L,v[1]/L];
    return{i:e.i,a,b,len:e.len,dir,n:[dir[1],-dir[0]]};
  });
  const slots=d.slots.map(sl=>{
    if(sl.angle!=null){
      const a=(sl.angle+rot)*Math.PI/180,n=[Math.cos(a),Math.sin(a)];
      return{idx:sl.idx,on:sl.on,edge:-1,p:[c[0]+n[0]*d.circle,c[1]+n[1]*d.circle],n};
    }
    const e=edges[sl.edge];
    return{idx:sl.idx,on:sl.on,edge:sl.edge,t:sl.t,p:[e.a[0]+(e.b[0]-e.a[0])*sl.t,e.a[1]+(e.b[1]-e.a[1])*sl.t],n:e.n};
  });
  return{id:piece.id,piece,def:d,center:c,rot,poly,edges,slots,circle:d.circle||0};
};
const pgInside=(pt,w)=>w.circle?pgLen(pgSub(pt,w.center))<=w.circle:pgInPoly(pt,w.poly);

/* Stretch [u0,u1] of edge e (measured from e.a) that edge f covers. */
const pgOverlap=(e,f)=>{
  const ua=pgDot(pgSub(f.a,e.a),e.dir),ub=pgDot(pgSub(f.b,e.a),e.dir);
  return[Math.max(0,Math.min(ua,ub)),Math.min(e.len,Math.max(ua,ub))];
};
/* Do two edges touch: anti-parallel, on the same line and overlapping? */
const pgTouch=(e,f,tolDist=2,tolAng=1.5)=>{
  if(Math.abs(pgNorm(pgAng(e.dir)-pgAng([-f.dir[0],-f.dir[1]])))>tolAng)return false;
  if(Math.abs(pgDot(pgSub(e.a,f.a),f.n))>tolDist||Math.abs(pgDot(pgSub(e.b,f.a),f.n))>tolDist)return false;
  const[u0,u1]=pgOverlap(e,f);
  return u1-u0>8;
};

/* Every touching edge pair between `moving` pieces and `others` (or between all
   pieces when others is omitted) — used after a snap to catch every contact,
   e.g. a piece dropped into a gap that touches two tables at once. */
const detectJoins=(moving,others)=>{
  const A=moving.map(pieceToWorld),B=others?others.map(pieceToWorld):A;
  const out=[],seen=new Set();
  A.forEach(m=>B.forEach(o=>{
    if(m.id===o.id)return;
    m.edges.forEach(e=>o.edges.forEach(f=>{
      if(!pgTouch(e,f))return;
      const k=[`${m.id}:${e.i}`,`${o.id}:${f.i}`].sort().join('|');
      if(seen.has(k))return;seen.add(k);
      out.push({a:m.id,ea:e.i,b:o.id,eb:f.i});
    }));
  }));
  return out;
};

/* Connected pieces → clusters (arrays of piece ids, in piece order). */
const clustersFromJoins=(pieces,joins)=>{
  const parent={};pieces.forEach(p=>{parent[p.id]=p.id;});
  const find=x=>parent[x]===x?x:(parent[x]=find(parent[x]));
  (joins||[]).forEach(j=>{if(parent[j.a]!=null&&parent[j.b]!=null)parent[find(j.a)]=find(j.b);});
  const byRoot=new Map();
  pieces.forEach(p=>{const r=find(p.id);if(!byRoot.has(r))byRoot.set(r,[]);byRoot.get(r).push(p.id);});
  return[...byRoot.values()];
};

/* Move/rotate some pieces rigidly: rotate by drot about pivot, then shift. */
const transformPieces=(pieces,ids,{dx=0,dy=0,drot=0,pivot=[0,0]}={})=>{
  const set=new Set(ids);
  return pieces.map(p=>{
    if(!set.has(p.id))return p;
    const c=drot?pgRot([p.x,p.y],drot,pivot):[p.x,p.y];
    return{...p,x:pgR(c[0]+dx),y:pgR(c[1]+dy),rot:pgNorm360((p.rot||0)+drot)};
  });
};
const piecesCentre=pieces=>{
  const ws=pieces.map(pieceToWorld),pts=ws.flatMap(w=>w.poly);
  if(!pts.length)return[0,0];
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  return[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2];
};

/* Turn and slide `mp` so its edge ei lies on tp's edge ej, facing it.
   mode: 'center' (midpoints meet), 'start' / 'end' (flush with tp's edge start / end). */
const alignPieceToEdge=(mp,ei,tp,ej,mode='center')=>{
  const T=pieceToWorld(tp).edges[ej],M0=pieceToWorld(mp).edges[ei];
  const drot=pgNorm(pgAng([-T.dir[0],-T.dir[1]])-pgAng(M0.dir));
  const r1=transformPieces([mp],[mp.id],{drot,pivot:[mp.x,mp.y]})[0];
  const M=pieceToWorld(r1).edges[ei];
  const[from,to]=mode==='start'?[M.b,T.a]:mode==='end'?[M.a,T.b]:[pgMid(M.a,M.b),pgMid(T.a,T.b)];
  return{...r1,x:pgR(r1.x+to[0]-from[0]),y:pgR(r1.y+to[1]-from[1])};
};

/* Snapping while dragging. `moving` is one piece or a cluster (array); the
   result rotates it by drot about pivot and then shifts it by (dx,dy) so one of
   its edges lies exactly on a nearby edge of `others`: equal edges centre on
   each other, unequal ones sit flush with the nearer end. null = no snap. */
const findSnap=(moving,others)=>{
  const mv=[].concat(moving);
  if(!mv.length||!others?.length)return null;
  const pivot=piecesCentre(mv);
  const MW=mv.map(pieceToWorld),OW=others.map(pieceToWorld);
  let best=null;
  MW.forEach(m=>m.edges.forEach(e1=>OW.forEach(o=>o.edges.forEach(e2=>{
    const drot=pgNorm(pgAng([-e2.dir[0],-e2.dir[1]])-pgAng(e1.dir));
    if(Math.abs(drot)>PG.SNAP_ANGLE)return;
    const a1=pgRot(e1.a,drot,pivot),b1=pgRot(e1.b,drot,pivot);
    const s=pgDot(pgSub(pgMid(a1,b1),e2.a),e2.n);
    if(Math.abs(s)>PG.SNAP_DIST)return;
    const ua=pgDot(pgSub(a1,e2.a),e2.dir),ub=pgDot(pgSub(b1,e2.a),e2.dir);
    const lo=Math.min(ua,ub),hi=Math.max(ua,ub);
    if(Math.min(hi,e2.len)-Math.max(lo,0)<4)return;
    let shift;
    if(Math.abs(e1.len-e2.len)<3)shift=e2.len/2-(lo+hi)/2;
    else{const s1=-lo,s2=e2.len-hi;shift=Math.abs(s1)<=Math.abs(s2)?s1:s2;}
    const dx=-s*e2.n[0]+shift*e2.dir[0],dy=-s*e2.n[1]+shift*e2.dir[1];
    // the moving piece has to end up on the outside of the edge, not on top of the table
    const mc=pgRot(m.center,drot,pivot);
    if(pgDot(pgSub([mc[0]+dx,mc[1]+dy],e2.a),e2.n)<=0)return;
    const score=Math.abs(s)+Math.abs(shift)*0.35+Math.abs(drot)*0.8;
    if(best&&score>=best.score)return;
    const l0=Math.max(lo+shift,0),l1=Math.min(hi+shift,e2.len);
    best={score,dx,dy,drot,line:[[e2.a[0]+e2.dir[0]*l0,e2.a[1]+e2.dir[1]*l0],[e2.a[0]+e2.dir[0]*l1,e2.a[1]+e2.dir[1]*l1]]};
  }))));
  if(!best)return null;
  const moved=transformPieces(mv,mv.map(p=>p.id),{dx:best.dx,dy:best.dy,drot:best.drot,pivot});
  // reject a snap that would drop the piece on top of another table
  const MW2=moved.map(pieceToWorld);
  if(MW2.some(m=>OW.some(o=>pgInside(m.center,o)||pgInside(o.center,m))))return null;
  return{dx:pgR(best.dx),dy:pgR(best.dy),drot:pgR(best.drot),pivot,joins:detectJoins(moved,others),line:best.line};
};

/* Name tags stay horizontal whatever the rotation. Each table (cluster) tries
   to fit every tag on the table top just inside its edge — wide tags first,
   then narrow two-line ones — and if they won't all fit without overlapping,
   the whole table puts its tags on the chairs instead, so one table never
   mixes the two looks. */
const TAG_SIZES=[{w:92,h:26,font:12},{w:66,h:32,font:11}];
const CHAIR_TAG={w:84,h:26,font:11.5};
const pgPlaceTags=(slots,worlds)=>{
  if(!slots.length)return;
  const inside=pt=>worlds.some(w=>pgInside(pt,w));
  const fits=(c,w,h)=>{
    const m=3,x0=c[0]-w/2-m,x1=c[0]+w/2+m,y0=c[1]-h/2-m,y1=c[1]+h/2+m;
    return[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[c[0],y0],[c[0],y1],[x0,c[1]],[x1,c[1]]].every(inside);
  };
  const clash=(a,b)=>Math.abs(a.x-b.x)*2<a.w+b.w+8&&Math.abs(a.y-b.y)*2<a.h+b.h+8;
  for(const sz of TAG_SIZES){
    const placed=[];
    for(const s of slots){
      const sup=sz.w/2*Math.abs(s.n[0])+sz.h/2*Math.abs(s.n[1]);
      let got=null;
      for(let d=sup+4;d<=sup+60&&!got;d+=2){
        const c=[s.p[0]-s.n[0]*d,s.p[1]-s.n[1]*d],r={x:c[0],y:c[1],w:sz.w,h:sz.h};
        if(fits(c,sz.w,sz.h)&&placed.every(q=>!clash(q,r)))got=r;
      }
      if(!got)break;
      placed.push(got);
    }
    if(placed.length===slots.length){
      slots.forEach((s,i)=>{const r=placed[i];s.tag={x:pgR(r.x),y:pgR(r.y),w:sz.w,h:sz.h,font:sz.font,mode:'table'};});
      return;
    }
  }
  slots.forEach(s=>{
    const sup=CHAIR_TAG.w/2*Math.abs(s.n[0])+CHAIR_TAG.h/2*Math.abs(s.n[1]);
    const d=(s.reach||PG.CHAIR_OUT)+sup+2; // just clear of the chair's back (or the standing mat)
    s.tag={x:pgR(s.p[0]+s.n[0]*d),y:pgR(s.p[1]+s.n[1]*d),w:CHAIR_TAG.w,h:CHAIR_TAG.h,font:CHAIR_TAG.font,mode:'chair'};
  });
};

/* Every slot of every piece with its state:
     'on'     — a seat (gets a chair and a name tag)
     'off'    — switched off (default off, or in seatsOff); can be switched on
     'joined' — on an edge that's joined to another table, so it can't be used
   A per-piece seatsOff always wins; seatsOn switches on a default-off slot. */
const slotsForLayout=(pieces,joins)=>{
  const W=new Map((pieces||[]).map(p=>[p.id,pieceToWorld(p)]));
  const cover=new Map();
  const addCover=(pid,ei,iv)=>{if(iv[1]-iv[0]<4)return;const k=`${pid}:${ei}`;cover.set(k,[...(cover.get(k)||[]),iv]);};
  (joins||[]).forEach(j=>{
    const A=W.get(j.a),B=W.get(j.b);if(!A||!B)return;
    const ea=A.edges[j.ea],eb=B.edges[j.eb];if(!ea||!eb)return;
    addCover(j.a,j.ea,pgOverlap(ea,eb));addCover(j.b,j.eb,pgOverlap(eb,ea));
  });
  const out=[];
  (pieces||[]).forEach(p=>{
    const w=W.get(p.id),off=new Set(p.seatsOff||[]),on=new Set(p.seatsOn||[]);
    w.slots.forEach(sl=>{
      let state=sl.on||on.has(sl.idx)?'on':'off';
      if(off.has(sl.idx))state='off';
      if(sl.edge>=0){
        const u=sl.t*w.edges[sl.edge].len;
        if((cover.get(`${p.id}:${sl.edge}`)||[]).some(([u0,u1])=>u>=u0-PG.JOIN_MARGIN&&u<=u1+PG.JOIN_MARGIN))state='joined';
      }
      const facing=pgR(Math.atan2(-sl.n[0],sl.n[1])*180/Math.PI); // Chair: 0 = sitter faces up
      const standing=pgStanding(p),dist=standing?PG.STAND_OFF:PG.CHAIR_OFF;
      out.push({key:`${p.id}:${sl.idx}`,pieceId:p.id,slot:sl.idx,state,p:sl.p,n:sl.n,standing,
        reach:standing?PG.STAND_OFF+8:PG.CHAIR_OUT, // how far past the table edge the chair or mat shows
        chair:{x:pgR(sl.p[0]+sl.n[0]*dist),y:pgR(sl.p[1]+sl.n[1]*dist),facing}});
    });
  });
  clustersFromJoins(pieces||[],joins).forEach(ids=>{
    const set=new Set(ids);
    pgPlaceTags(out.filter(s=>set.has(s.pieceId)&&s.state==='on'),ids.map(id=>W.get(id)));
  });
  return out;
};

/* Canvas-space bounds of some pieces, including their chairs and tags. */
const piecesBounds=(pieces,slots)=>{
  const ids=new Set(pieces.map(p=>p.id));
  const pts=pieces.flatMap(p=>pieceToWorld(p).poly);
  (slots||slotsForLayout(pieces,[])).filter(s=>ids.has(s.pieceId)&&s.state==='on').forEach(s=>{
    pts.push([s.chair.x-14,s.chair.y-14],[s.chair.x+14,s.chair.y+14]);
    if(s.tag)pts.push([s.tag.x-s.tag.w/2,s.tag.y-s.tag.h/2],[s.tag.x+s.tag.w/2,s.tag.y+s.tag.h/2]);
  });
  if(!pts.length)return null;
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
};

/* Rebuild the seats (and table groups) that pieces make. Seats without a
   pieceId are left exactly as they are. A piece seat keeps its id, student,
   tags, tag rule, lock and used/unavailable flags by pieceId:slot; only its x/y
   (a 114×52 box centred on its name tag) and groupId are recomputed. Each
   cluster of joined pieces with 2+ seats is one group: an existing group is
   reused (id and label) where the cluster's seats were already in it, so
   joining merges groups and separating splits them. Students whose seat
   disappears are returned in `bumped`, so the caller can say so — they're
   never silently lost (they just show up in the unplaced list again). */
const syncPieceSeats=({seats=[],groups=[],pieces=[],joins=[]},{uid,nextLabel})=>{
  const slots=slotsForLayout(pieces,joins).filter(s=>s.state==='on');
  const slotByKey=new Map(slots.map(s=>[s.key,s]));
  const bumped=[];
  const box=s=>({x:Math.round(s.tag.x-PG.SEAT_W/2),y:Math.round(s.tag.y-PG.SEAT_H/2)});
  const kept=new Set();
  let nextSeats=[];
  seats.forEach(s=>{
    if(!s.pieceId){nextSeats.push(s);return;}
    const key=`${s.pieceId}:${s.slot}`,sl=slotByKey.get(key);
    if(!sl||kept.has(key)){if(s.studentId)bumped.push(s.studentId);return;}
    kept.add(key);
    nextSeats.push({...s,...box(sl)});
  });
  slots.forEach(sl=>{
    if(kept.has(sl.key))return;
    nextSeats.push({id:uid(),groupId:null,...box(sl),tags:[],tagRule:'OR',studentId:null,locked:false,used:true,pieceId:sl.pieceId,slot:sl.slot});
  });
  const seatIdByKey=new Map(nextSeats.filter(s=>s.pieceId).map(s=>[`${s.pieceId}:${s.slot}`,s.id]));
  const pieceSeatIds=new Set(seatIdByKey.values());
  // plain groups lose any piece seats (a table's seats belong to its cluster)
  const plain=groups.map(g=>({...g,seatIds:g.seatIds.filter(id=>!pieceSeatIds.has(id))})).filter(g=>g.seatIds.length>=2);
  const used=new Set(plain.map(g=>g.id));
  const outGroups=[...plain];
  // biggest cluster first, so when a table splits the larger half keeps the old group (and its colour)
  const seatCountOfCluster=ids=>slots.filter(s=>ids.includes(s.pieceId)).length;
  clustersFromJoins(pieces,joins).map((ids,i)=>({ids,i,n:seatCountOfCluster(ids)})).sort((a,b)=>b.n-a.n||a.i-b.i).map(x=>x.ids).forEach(ids=>{
    const set=new Set(ids);
    const members=slots.filter(s=>set.has(s.pieceId)).map(s=>seatIdByKey.get(s.key)).filter(Boolean);
    if(members.length<2)return;
    const mem=new Set(members);
    const prev=groups.filter(g=>!used.has(g.id)).map(g=>({g,n:g.seatIds.filter(id=>mem.has(id)).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n)[0];
    const pcol=pieces.find(p=>set.has(p.id)&&p.color)?.color; // a new table takes the colour a piece already had
    const g=prev?{...prev.g,seatIds:members}:{id:uid(),seatIds:members,label:nextLabel([...outGroups,...groups]),...(pcol?{color:pcol}:{})};
    used.add(g.id);outGroups.push(g);
  });
  const groupOf={};outGroups.forEach(g=>g.seatIds.forEach(id=>{groupOf[id]=g.id;}));
  nextSeats=nextSeats.map(s=>{const gid=groupOf[s.id]||null;return s.groupId===gid?s:{...s,groupId:gid};});
  // keep the original group order where possible, so colours and labels don't shuffle
  const order=new Map(groups.map((g,i)=>[g.id,i]));
  outGroups.sort((a,b)=>(order.has(a.id)?order.get(a.id):1e9)-(order.has(b.id)?order.get(b.id):1e9));
  return{seats:nextSeats,groups:outGroups,bumped};
};

/* Reading order: top row first, left to right (rows within `tol` px count as one row). */
const readingOrder=(items,xy,tol=24)=>{
  const arr=items.map(it=>({it,p:xy(it)})).sort((a,b)=>a.p[1]-b.p[1]);
  const rows=[];
  arr.forEach(e=>{const r=rows[rows.length-1];if(r&&Math.abs(e.p[1]-r[0].p[1])<=tol)r.push(e);else rows.push([e]);});
  return rows.flatMap(r=>r.sort((a,b)=>a.p[0]-b.p[0]).map(e=>e.it));
};

/* New pieces and ready-made combos, built around the origin. */
const newPiece=(shape,uid,extra={})=>({id:uid(),shape,x:0,y:0,rot:0,roles:[...(SHAPES[shape]?.roles||['desk'])],seatsOff:[],...(shape==='round'?{seatCount:SHAPES.round.seats}:{}),...extra});
const pgRow=(shapes,uid)=>{
  const pieces=[newPiece(shapes[0],uid)],joins=[];
  for(let i=1;i<shapes.length;i++){
    const prev=pieces[i-1],p=alignPieceToEdge(newPiece(shapes[i],uid),3,prev,1);
    pieces.push(p);joins.push({a:prev.id,ea:1,b:p.id,eb:3});
  }
  return{pieces,joins};
};
const PIECE_COMBOS={
  hexagon:{name:'Hexagon',hint:'2 trapezoids, 6 seats',build:uid=>{
    const a=newPiece('trap',uid),b=alignPieceToEdge(newPiece('trap',uid,{rot:180}),2,a,2);
    return{pieces:[a,b],joins:[{a:a.id,ea:2,b:b.id,eb:2}]};
  }},
  long8:{name:'Long table of 8',hint:'2 long tables',build:uid=>pgRow(['long4','long4'],uid)},
  horseshoe:{name:'Horseshoe',hint:'a U of 3 long tables, 9 seats round the outside',build:uid=>{
    // three long tables of 6: one along the bottom and one standing up at each
    // end, opening upwards (towards the board). Everyone sits round the outside
    // and the inside is left open, like a real horseshoe — the inside seats can
    // be switched on with Edit seats. (Three trapezoids — a half hexagonal ring
    // — were tried first, but the inside of that ring is too tight to be useful.)
    const base=newPiece('long6',uid);
    const l=alignPieceToEdge(newPiece('long6',uid),1,base,0,'start'),r=alignPieceToEdge(newPiece('long6',uid),3,base,0,'end');
    const pieces=[l,base,r],joins=[{a:l.id,ea:1,b:base.id,eb:0},{a:r.id,ea:3,b:base.id,eb:0}];
    const inner=slotsForLayout(pieces,joins).filter(s=>s.state==='on'&&(s.pieceId===base.id?s.n[1]<-0.5:s.n[0]*(base.x-s.p[0])>0));
    return{pieces:pieces.map(p=>({...p,seatsOff:inner.filter(s=>s.pieceId===p.id).map(s=>s.slot)})),joins};
  }},
  long10:{name:'Long table of 10',hint:'long 6 + long 4',build:uid=>pgRow(['long6','long4'],uid)},
  long12:{name:'Long table of 12',hint:'2 long tables of 6',build:uid=>pgRow(['long6','long6'],uid)},
};
/* Build a shape or combo; `opts.seatCount` sets a round table's seats. */
const buildPieceSet=(kind,uid,opts={})=>{
  if(PIECE_COMBOS[kind])return PIECE_COMBOS[kind].build(uid);
  if(/^row\d+$/.test(kind))return pgRow(Array.from({length:+kind.slice(3)},()=>'long6'),uid);
  return{pieces:[newPiece(kind,uid,opts.seatCount?{seatCount:opts.seatCount}:{})],joins:[]};
};
/* Shift a built set so its drawn bounds (chairs and tags too) start at (x,y). */
const placePieceSet=(set,x,y)=>{
  const b=piecesBounds(set.pieces,slotsForLayout(set.pieces,set.joins));
  if(!b)return set;
  return{...set,pieces:transformPieces(set.pieces,set.pieces.map(p=>p.id),{dx:x-b.x,dy:y-b.y})};
};
const seatCountOf=set=>slotsForLayout(set.pieces,set.joins).filter(s=>s.state==='on').length;

/* "Convert to table" choices for n seats: anything that seats n with at most
   two spare seats; very big groups get a row of long tables. */
const CONVERT_KINDS=[
  {kind:'single'},{kind:'pair'},{kind:'trap'},{kind:'long4'},{kind:'round',seatCount:4},{kind:'round',seatCount:5},
  {kind:'bench'},{kind:'long6'},{kind:'round',seatCount:6},{kind:'hexagon'},{kind:'long8'},{kind:'horseshoe'},{kind:'long10'},{kind:'long12'},
];
const convertOptions=n=>{
  const fake=(()=>{let i=0;return()=>`c${i++}`;})();
  const out=CONVERT_KINDS.map(o=>({...o,seats:seatCountOf(buildPieceSet(o.kind,fake,o))})).filter(o=>o.seats>=n&&o.seats<=n+2);
  if(!out.length){const k=Math.ceil(n/6);out.push({kind:`row${k}`,seats:6*k});}
  return out;
};

/* Chairs for plain (pre-table) seat groups. The table top covers the whole seat
   area and each chair is tucked under one outer edge, like a floor plan.
   `items` are seat boxes {id,x,y} (top-left of a 114×52 box); `rect` is the table top.
   Which edge: a single row → below; a single column → left; two columns (3+ rows)
   → the outer side; otherwise the top row goes above and the bottom row below, and a
   middle row uses the left/right end. A seat with no free edge (the middle of a big
   block) gets no chair: it would be fully under the table and invisible anyway. */
const pgBands=(vals,tol=24)=>{
  const bands=[];
  [...vals].sort((a,b)=>a-b).forEach(v=>{const b=bands[bands.length-1];if(b&&v-b.max<=tol)b.max=v;else bands.push({min:v,max:v});});
  return bands;
};
const legacyChairs=(items,rect,flip=false)=>{ // flip: Tom's ⇅ Flip chairs, puts every chair on the opposite side
  const rows=pgBands(items.map(i=>i.y)),cols=pgBands(items.map(i=>i.x));
  const nR=rows.length,nC=cols.length;
  const idx=(bands,v)=>bands.findIndex(b=>v>=b.min-1e-6&&v<=b.max+1e-6);
  const out=[];
  items.forEach(it=>{
    const r=idx(rows,it.y),c=idx(cols,it.x);
    let side;
    if(items.length===1||nR===1)side='B';
    else if(nC===1)side='L';
    else if(nC===2&&nR>=3)side=c===0?'L':'R';
    else if(r===0)side='T';
    else if(r===nR-1)side='B';
    else if(c===0)side='L';
    else if(c===nC-1)side='R';
    else side=null;
    if(!side)return;
    if(flip)side={T:'B',B:'T',L:'R',R:'L'}[side];
    const o=PG.CHAIR_OFF,cx=it.x+PG.SEAT_W/2,cy=it.y+PG.SEAT_H/2;
    const hx=Math.max(rect.x+14,Math.min(rect.x+rect.w-14,cx)),hy=Math.max(rect.y+14,Math.min(rect.y+rect.h-14,cy));
    // centre = edge + outward normal × CHAIR_OFF (negative, so tucked in); facing 0 = sitter faces up
    if(side==='B')out.push({id:it.id,x:pgR(hx),y:pgR(rect.y+rect.h+o),facing:0,side});
    else if(side==='T')out.push({id:it.id,x:pgR(hx),y:pgR(rect.y-o),facing:180,side});
    else if(side==='L')out.push({id:it.id,x:pgR(rect.x-o),y:pgR(hy),facing:90,side});
    else out.push({id:it.id,x:pgR(rect.x+rect.w+o),y:pgR(hy),facing:270,side});
  });
  return out;
};

/* ── Room shell (Phase 4): walls, openings (doors/windows that sit on a wall),
   the item catalogue's data, and the room library's pure helpers. Still no JSX
   and no outside references. ───────────────────────────────────────────────

   A wall is {id,x1,y1,x2,y2}. An opening is {id,type,wallId,t,width,flip,swing}:
   t (0–1) is where its middle sits along the wall, flip puts the hinge at the
   other end, swing (1 or -1) picks which side the door opens to. A room item is
   {id,type,x,y,w?,h?,rot?,label?,fixed?,station?}: (x,y) is the top-left of the
   box *before* it is turned, and it turns about its middle. The three original
   items (desk, board, door) have no w/h/rot — they keep their old fixed sizes and
   `rotation`, and are only converted if Tom resizes or turns them. */
const WALL_T=12,WALL_GRID=8,WALL_JOIN=14;
const wallLen=w=>Math.hypot(w.x2-w.x1,w.y2-w.y1);
const wallDir=w=>{const L=wallLen(w)||1;return[(w.x2-w.x1)/L,(w.y2-w.y1)/L];};
const wallPointAt=(w,t)=>[w.x1+(w.x2-w.x1)*t,w.y1+(w.y2-w.y1)*t];
/* The nearest point of a wall to pt: {t (0–1 along it), dist, p} */
const closestOnWall=(w,pt)=>{
  const L=wallLen(w);
  if(!L)return{t:0,dist:Math.hypot(pt[0]-w.x1,pt[1]-w.y1),p:[w.x1,w.y1]};
  const d=wallDir(w),u=Math.max(0,Math.min(L,(pt[0]-w.x1)*d[0]+(pt[1]-w.y1)*d[1]));
  const p=[w.x1+d[0]*u,w.y1+d[1]*u];
  return{t:u/L,dist:Math.hypot(pt[0]-p[0],pt[1]-p[1]),p};
};
const nearestWall=(walls,pt,reach=36)=>{
  let best=null;
  (walls||[]).forEach(w=>{const c=closestOnWall(w,pt);if(c.dist<=reach&&(!best||c.dist<best.dist))best={wall:w,...c};});
  return best;
};
/* An opening can't poke out past the end of its wall (a wall shorter than it centres it) */
const clampOpeningT=(w,width,t)=>{const L=wallLen(w);if(L<=width)return 0.5;const h=width/2/L;return pgR(Math.max(h,Math.min(1-h,t)));};
/* Where a dropped / dragged opening lands: the nearest wall within reach, and its spot on it */
const openingAtPoint=(walls,pt,width,reach=36)=>{
  const n=nearestWall(walls,pt,reach);
  return n?{wallId:n.wall.id,t:clampOpeningT(n.wall,width,n.t)}:null;
};
/* The opening in canvas space: centre, direction along the wall, its normal, the wall's angle, both ends */
const openingFrame=(w,op)=>{
  const d=wallDir(w),c=wallPointAt(w,op.t),h=(op.width||56)/2;
  return{c,dir:d,n:[-d[1],d[0]],ang:pgR(pgAng(d)),a:[c[0]-d[0]*h,c[1]-d[1]*h],b:[c[0]+d[0]*h,c[1]+d[1]*h]};
};
const OPENING_TYPES={door:{name:'Door',width:56},'double-door':{name:'Double door',width:104},window:{name:'Window',width:80}};
/* A point the cursor is at → where a wall end goes. Ends first snap onto a nearby
   wall end (so corners join exactly); otherwise they snap to the 8 px grid and,
   when there is an anchor (the wall's other end), to 0°, 45° or 90° from it. */
const wallSnapPoint=(raw,walls,o={})=>{
  const grid=o.grid||WALL_GRID,reach=o.reach??WALL_JOIN;
  let best=null;
  (walls||[]).forEach(w=>{
    if(w.id===o.ignoreId)return;
    [[w.x1,w.y1],[w.x2,w.y2]].forEach(q=>{const d=Math.hypot(raw[0]-q[0],raw[1]-q[1]);if(d<=reach&&(!best||d<best.d))best={d,q};});
  });
  if(best)return{p:[best.q[0],best.q[1]],joined:true};
  let p=[Math.round(raw[0]/grid)*grid,Math.round(raw[1]/grid)*grid];
  if(o.anchor){
    const dx=raw[0]-o.anchor[0],dy=raw[1]-o.anchor[1],a=Math.round(Math.atan2(dy,dx)/(Math.PI/4));
    if(a%2===0){ // straight along one axis: the other coordinate stays put
      if(Math.abs(Math.cos(a*Math.PI/4))>0.5)p=[Math.round(raw[0]/grid)*grid,o.anchor[1]];
      else p=[o.anchor[0],Math.round(raw[1]/grid)*grid];
    }else{
      const d=Math.round((Math.abs(dx)+Math.abs(dy))/2/grid)*grid;
      p=[o.anchor[0]+Math.sign(dx)*d,o.anchor[1]+Math.sign(dy)*d];
    }
  }
  return{p,joined:false};
};
/* Four walls round a box, clockwise from the top left, on the 8 px grid */
const rectRoomWalls=(b,uid)=>{
  const g=WALL_GRID,x1=Math.max(g,Math.floor(b.x/g)*g),y1=Math.max(g,Math.floor(b.y/g)*g),x2=Math.ceil((b.x+b.w)/g)*g,y2=Math.ceil((b.y+b.h)/g)*g;
  return[{id:uid(),x1,y1,x2,y2:y1},{id:uid(),x1:x2,y1,x2,y2},{id:uid(),x1:x2,y1:y2,x2:x1,y2},{id:uid(),x1,y1:y2,x2:x1,y2:y1}];
};
const wallsBounds=walls=>{
  if(!walls?.length)return null;
  const xs=walls.flatMap(w=>[w.x1,w.x2]),ys=walls.flatMap(w=>[w.y1,w.y2]);
  return{x:Math.min(...xs)-WALL_T,y:Math.min(...ys)-WALL_T,w:Math.max(...xs)-Math.min(...xs)+WALL_T*2,h:Math.max(...ys)-Math.min(...ys)+WALL_T*2};
};

/* The item catalogue: size (before turning), whether it is normally part of the
   room itself (fixed), and the words the search looks at. Order is the order shown. */
const ROOM_ITEM_TYPES={
  desk:{name:"Teacher's desk",w:128,h:56,fixed:false,kw:'teacher table'},
  board:{name:'Whiteboard',w:256,h:32,fixed:true,kw:'board blackboard'},
  window:{name:'Window',w:160,h:24,fixed:true,kw:'glass light'},
  area:{name:'Area',w:192,h:128,fixed:false,kw:'zone corner region space quiet reading practical'},
  line:{name:'Line',w:128,h:16,fixed:false,kw:'boundary walkway route fire exit path divider'},
  screen:{name:'Projector screen',w:192,h:16,fixed:true,kw:'projector screen'},
  tv:{name:'TV',w:80,h:24,fixed:true,kw:'tv television display monitor'},
  bookshelf:{name:'Bookshelf',w:128,h:32,fixed:false,kw:'books shelf library'},
  cupboard:{name:'Cupboard',w:80,h:40,fixed:true,kw:'storage cabinet'},
  filing:{name:'Filing cabinet',w:40,h:48,fixed:false,kw:'files drawers cabinet'},
  bin:{name:'Bin',w:32,h:32,fixed:false,kw:'rubbish trash waste'},
  recycling:{name:'Recycling',w:32,h:32,fixed:false,kw:'recycle bin paper'},
  computer:{name:'Computer station',w:72,h:48,fixed:false,kw:'pc computer desk laptop'},
  printer:{name:'Printer',w:48,h:40,fixed:false,kw:'copier'},
  sofa:{name:'Sofa / reading corner',w:128,h:56,fixed:false,kw:'couch reading corner'},
  rug:{name:'Rug',w:128,h:96,fixed:false,kw:'carpet mat'},
  plant:{name:'Plant',w:32,h:32,fixed:false,kw:'pot tree'},
  hooks:{name:'Coat hooks',w:96,h:16,fixed:true,kw:'coats bags'},
  sink:{name:'Sink',w:64,h:40,fixed:true,kw:'tap basin wash water'},
  demo:{name:'Demo bench',w:192,h:56,fixed:true,kw:'teacher bench demonstration'},
  fume:{name:'Fume cupboard',w:88,h:48,fixed:true,kw:'fume hood extraction'},
  eyewash:{name:'Eyewash station',w:32,h:32,fixed:true,kw:'eye wash safety'},
  shower:{name:'Safety shower',w:32,h:32,fixed:true,kw:'emergency shower safety'},
  blanket:{name:'Fire blanket',w:32,h:32,fixed:true,kw:'fire safety'},
  extinguisher:{name:'Fire extinguisher',w:32,h:32,fixed:true,kw:'fire safety'},
  firstaid:{name:'First-aid kit',w:32,h:32,fixed:true,kw:'first aid medical safety'},
  gas:{name:'Gas shut-off',w:32,h:32,fixed:true,kw:'gas valve safety tap'},
  estop:{name:'Emergency stop',w:32,h:32,fixed:true,kw:'stop button safety e-stop'},
  chemstore:{name:'Chemical store',w:72,h:40,fixed:true,kw:'chemicals cabinet flammable'},
  prepdoor:{name:'Prep-room door',w:64,h:64,fixed:true,kw:'preparation room technician door'},
  goggles:{name:'Goggles cabinet',w:64,h:32,fixed:true,kw:'safety glasses eye protection'},
  glassbin:{name:'Broken-glass bin',w:32,h:32,fixed:false,kw:'sharps glass bin'},
  isolator:{name:'Power isolator',w:32,h:32,fixed:true,kw:'electricity power switch safety'},
  box:{name:'Box',w:96,h:64,fixed:false,kw:'rectangle shape zone area'},
  text:{name:'Text label',w:128,h:32,fixed:false,kw:'words note sign'},
  arrow:{name:'Arrow',w:96,h:24,fixed:false,kw:'direction pointer'},
};
const ROOM_ITEM_SECTIONS=[
  {id:'zones',name:'Zones and lines',types:['area','line']},
  {id:'classroom',name:'Classroom',types:['desk','board','window','screen','tv','bookshelf','cupboard','filing','bin','recycling','computer','printer','sofa','rug','plant','hooks','sink']},
  {id:'lab',name:'Science lab',types:['demo','sink','fume','eyewash','shower','blanket','extinguisher','firstaid','gas','estop','chemstore','prepdoor','goggles','glassbin','isolator']},
  {id:'free',name:'Free shapes',types:['box','text','arrow']},
];
/* the original three: their sizes, from before items had w/h */
const LEGACY_ITEM_SIZE={desk:[114,52],board:[260,36],door:[64,64]};
const itemGeom=it=>{
  const legacy=!!LEGACY_ITEM_SIZE[it.type]&&it.w==null&&it.h==null&&it.rot==null;
  if(legacy){
    const[bw,bh]=LEGACY_ITEM_SIZE[it.type],r=(((it.rotation||0)%360)+360)%360;
    if(it.type==='door')return{x:it.x,y:it.y,w:bw,h:bh,rot:r,origin:'tl',legacy:true}; // the old door turned about its top-left corner
    const vert=r===90||r===270; // the old desk and board were redrawn on their side, not turned
    return{x:it.x,y:it.y,w:vert?bh:bw,h:vert?bw:bh,rot:0,origin:'c',legacy:true};
  }
  const t=ROOM_ITEM_TYPES[it.type]||{};
  return{x:it.x,y:it.y,w:it.w??t.w??64,h:it.h??t.h??40,rot:it.rot??it.rotation??0,origin:'c',legacy:false};
};
const itemPivot=g=>g.origin==='tl'?[g.x,g.y]:[g.x+g.w/2,g.y+g.h/2];
const itemCorners=g=>{
  const pv=itemPivot(g);
  return[[g.x,g.y],[g.x+g.w,g.y],[g.x+g.w,g.y+g.h],[g.x,g.y+g.h]].map(p=>pgRot(p,g.rot,pv));
};
const itemCentre=g=>pgRot([g.x+g.w/2,g.y+g.h/2],g.rot,itemPivot(g));
/* Bounding box of the item as it looks on the canvas (turned) */
const itemBounds=it=>{
  const cs=itemCorners(itemGeom(it)),xs=cs.map(p=>p[0]),ys=cs.map(p=>p[1]);
  return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
};
/* An original item becomes a normal one (w, h, rot) with the same look and place */
const upgradeLegacyItem=it=>{
  const g=itemGeom(it);
  if(!g.legacy)return it;
  const[bw,bh]=LEGACY_ITEM_SIZE[it.type];
  if(it.type==='door'){
    const c=pgRot([it.x+bw/2,it.y+bh/2],g.rot,[it.x,it.y]);
    return{...it,x:pgR(c[0]-bw/2),y:pgR(c[1]-bh/2),w:bw,h:bh,rot:g.rot,rotation:g.rot};
  }
  const q=(((it.rotation||0)%360)+360)%360,r=q===90||q===270?q:0;
  return{...it,x:pgR(g.x+g.w/2-bw/2),y:pgR(g.y+g.h/2-bh/2),w:bw,h:bh,rot:r,rotation:r};
};
const newRoomItem=(type,uid,x=80,y=80)=>{
  const t=ROOM_ITEM_TYPES[type];
  const label=type==='text'?'Label':(type==='line'||type==='window')?'':t.name;
  return{id:uid(),type,x,y,w:t.w,h:t.h,rot:0,rotation:0,label,fixed:!!t.fixed,...(type==='area'?{color:'mint'}:{})};
};
/* A line item from two points (a click-drag): it is a thin box as long as the line, turned to match */
const lineItemFromPoints=(a,b,uid)=>{
  const L=Math.max(8,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1]))),ang=Math.round(Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI*100)/100,c=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const rot=((ang%360)+360)%360;
  return{id:uid(),type:'line',x:pgR(c[0]-L/2),y:pgR(c[1]-8),w:L,h:16,rot,rotation:rot,label:'',fixed:false};
};
/* A window item dropped on a wall turns to lie along it and sits centred on it */
const snapItemToWall=(it,walls,reach=30)=>{
  const g=itemGeom(it),c=itemCentre(g),n=nearestWall(walls,c,reach);
  if(!n)return null;
  const d=wallDir(n.wall);let rot=pgAng(d);rot=((rot%360)+360)%360;if(rot>=180)rot-=180; // along the wall, never upside down
  return{...it,rot:pgR(rot),rotation:pgR(rot),x:pgR(n.p[0]-g.w/2),y:pgR(n.p[1]-g.h/2)};
};
const AREA_COLOURS={mint:'var(--cp-mint)',sky:'var(--cp-sky)',cyan:'var(--cp-cyan)',sunny:'#ffd98a',coral:'var(--cp-coral)'};
/* Next free station number across items and tables */
const nextStationNumber=(items,pieces)=>{
  const ns=[...(items||[]),...(pieces||[])].map(o=>o.station?.n).filter(n=>Number.isFinite(n));
  return ns.length?Math.max(...ns)+1:1;
};

/* ── Room library helpers (the ta-rooms key) ──
   A room is {id,name,shell:{walls,openings,items},layouts:[{id,name,pieces,joins,seats,groups,items}]}.
   The *shell* is the part of a class's room that never moves (walls, openings
   and fixed items); a *layout* is the movable furniture, with blank seats.
   Everything works on the saved class object (sl-<class>). */
const cloneJ=v=>JSON.parse(JSON.stringify(v));
const extractShell=lo=>({
  walls:cloneJ(lo.walls||[]),openings:cloneJ(lo.openings||[]),
  items:cloneJ((lo.roomItems||[]).filter(i=>i.fixed)),
});
const extractLayout=lo=>({
  pieces:cloneJ(lo.pieces||[]),joins:cloneJ(lo.joins||[]),
  seats:cloneJ(lo.seats||[]).map(s=>({...s,studentId:null,locked:false})),
  groups:cloneJ(lo.groups||[]),
  items:cloneJ((lo.roomItems||[]).filter(i=>!i.fixed)),
});
/* The class object with the room's shell swapped in. Walls, openings and fixed
   items come from the room; the class's furniture, seats, students, rules and
   everything else are left exactly as they were. */
const applyRoomShell=(lo,room)=>{
  const sh=room?.shell||{};
  const out={...lo,roomItems:[...cloneJ(sh.items||[]),...(lo.roomItems||[]).filter(i=>!i.fixed)]};
  if(sh.walls?.length)out.walls=cloneJ(sh.walls);else delete out.walls;
  if(sh.openings?.length)out.openings=cloneJ(sh.openings);else delete out.openings;
  return out;
};
const sameShell=(lo,room)=>JSON.stringify(extractShell(lo))===JSON.stringify({walls:room?.shell?.walls||[],openings:room?.shell?.openings||[],items:room?.shell?.items||[]});
/* A saved layout with fresh ids everywhere (so two classes never share a seat id),
   no students, pieces/joins/groups/seats remapped together. */
const instantiateLayout=(layout,uid)=>{
  const pm={},sm={},gm={};
  (layout.pieces||[]).forEach(p=>{pm[p.id]=uid();});
  (layout.seats||[]).forEach(s=>{sm[s.id]=uid();});
  (layout.groups||[]).forEach(g=>{gm[g.id]=uid();});
  return{
    pieces:(layout.pieces||[]).map(p=>({...cloneJ(p),id:pm[p.id]})),
    joins:(layout.joins||[]).filter(j=>pm[j.a]&&pm[j.b]).map(j=>({...j,a:pm[j.a],b:pm[j.b]})),
    seats:(layout.seats||[]).map(s=>({...cloneJ(s),id:sm[s.id],groupId:s.groupId?(gm[s.groupId]||null):null,studentId:null,locked:false,...(s.pieceId?{pieceId:pm[s.pieceId]||s.pieceId}:{})})),
    groups:(layout.groups||[]).map(g=>({...cloneJ(g),id:gm[g.id],seatIds:g.seatIds.map(id=>sm[id]).filter(Boolean)})),
    items:(layout.items||[]).map(i=>({...cloneJ(i),id:uid()})),
  };
};
/* The first time Tom saves to the library, his old "Saved layouts" come along as a
   room called "My saved layouts" (one layout each, no shell). The old key is never
   touched, and doing it twice changes nothing. */
const migrateLegacyLayouts=(rooms,legacy)=>{
  if(!legacy?.length||rooms.some(r=>r.legacy))return rooms;
  return[...rooms,{id:'room-legacy',name:'My saved layouts',legacy:true,shell:{walls:[],openings:[],items:[]},
    layouts:legacy.map(l=>({id:l.id,name:l.name,createdAt:l.createdAt||0,pieces:cloneJ(l.pieces||[]),joins:cloneJ(l.joins||[]),seats:cloneJ(l.seats||[]),groups:cloneJ(l.groups||[]),items:cloneJ(l.roomItems||[])}))}];
};

/* ── Class setups (Phase 5): "Regular", "Lab", "Lab partners"… ──
   setups-<class> = {activeId, list:[{id,name,icon,use,offPieces,createdAt}]}.
   Regular has the fixed id 'regular' and is stored in sl-<class> exactly as
   before (so main still reads it); every other setup lives in sl-<class>~<id>.
   Found by id, never by list position, so reordering tabs never moves data. */
const REGULAR_SETUP='regular';
const SETUP_ICONS=['🪑','🧪','👥','🚀','⭐','🔬','📚'];
const SETUP_USES={desk:['desk'],workstation:['workstation'],both:['desk','workstation']};
const setupSlKey=(classId,setupId)=>!setupId||setupId===REGULAR_SETUP?`sl-${classId}`:`sl-${classId}~${setupId}`;
/* Regular uses both, so a migrated class generates exactly as it did before */
const regularSetup=(now=0)=>({id:REGULAR_SETUP,name:'Regular',icon:'🪑',use:['desk','workstation'],offPieces:[],createdAt:now});
const defaultSetups=(now=0)=>({activeId:REGULAR_SETUP,list:[regularSetup(now)]});
const useForName=name=>/lab/i.test(name||'')?['workstation']:['desk'];
const useKey=use=>{const u=use||[];return u.includes('desk')&&u.includes('workstation')?'both':u.includes('workstation')?'workstation':'desk';};
/* Whatever is on disk, made safe to use: Regular always there, a valid active id, valid fields */
const normalizeSetups=raw=>{
  const list=(Array.isArray(raw?.list)?raw.list:[]).filter(s=>s&&typeof s.id==='string').map(s=>({
    ...s,name:typeof s.name==='string'&&s.name.trim()?s.name:(s.id===REGULAR_SETUP?'Regular':'Setup'),icon:s.icon||'🪑',
    use:SETUP_USES[useKey(s.use)].slice(),offPieces:Array.isArray(s.offPieces)?s.offPieces:[],
  }));
  if(!list.some(s=>s.id===REGULAR_SETUP))list.unshift(regularSetup(0));
  const activeId=list.some(s=>s.id===raw?.activeId)?raw.activeId:REGULAR_SETUP;
  return{...(raw&&typeof raw==='object'?raw:{}),activeId,list};
};
/* Is this seat somewhere this setup generates into? Its table's roles must match the
   setup's "use for" (plain old desks count as tables), the table mustn't be switched
   off for this setup, and the seat itself must be in use and available. Worked out
   when generating and drawing; never written into the seat (its `used` flag is shared
   by meaning with other setups and the old app). */
const seatUsableIn=(seat,pieceById,setup)=>{
  if(!seat||!seat.used||seat.unavailable)return false;
  if(!setup)return true;
  const use=setup.use&&setup.use.length?setup.use:['desk','workstation'];
  const piece=seat.pieceId?pieceById.get(seat.pieceId):null;
  if(piece&&(setup.offPieces||[]).includes(piece.id))return false;
  const roles=piece&&piece.roles&&piece.roles.length?piece.roles:['desk'];
  return roles.some(r=>use.includes(r));
};
const usableSeatIds=(lo,setup)=>{
  const pm=new Map((lo?.pieces||[]).map(p=>[p.id,p]));
  return new Set((lo?.seats||[]).filter(s=>seatUsableIn(s,pm,setup)).map(s=>s.id));
};
const usableSeats=(lo,setup)=>{const ids=usableSeatIds(lo,setup);return(lo?.seats||[]).filter(s=>ids.has(s.id));};
/* Pieces this setup can't use (drawn faded): wrong role, or switched off here */
const unusablePieceIds=(pieces,setup)=>{
  if(!setup)return new Set();
  const use=setup.use&&setup.use.length?setup.use:['desk','workstation'];
  return new Set((pieces||[]).filter(p=>(setup.offPieces||[]).includes(p.id)||!(p.roles&&p.roles.length?p.roles:['desk']).some(r=>use.includes(r))).map(p=>p.id));
};
/* The seats the engine may fill, as copies: an unusable seat is marked unavailable
   (the flag the engine already skips). restoreSeatFlags puts the real flags back. */
const seatsForSetup=(lo,setup)=>{
  const ids=usableSeatIds(lo,setup);
  return(lo?.seats||[]).map(s=>!s.used||s.unavailable||ids.has(s.id)?s:{...s,unavailable:true});
};
const restoreSeatFlags=(nextSeats,origSeats)=>{
  const orig=new Map((origSeats||[]).map(s=>[s.id,s]));
  return nextSeats.map(s=>{
    const o=orig.get(s.id);if(!o)return s;
    const out={...s};if('unavailable' in o)out.unavailable=o.unavailable;else delete out.unavailable;
    return out;
  });
};
/* Spread students across tables instead of filling seats in list order (which left
   the newest tables empty). `fillable` is the seats that may still be filled, each
   with a table key; `occupied` and `capacity` count per table. One seat at a time
   goes to the table that is least full for its size, so 10 students at four tables
   of 4 sit 3,3,2,2 rather than 4,4,2,0. Ties are broken by `rnd` so different
   tables get the spare seats each time. Returns the seats to fill, in order. */
const pickSpreadSeats=(fillable,tableOf,occupied,capacity,n,rnd=Math.random)=>{
  const byTable=new Map();
  fillable.forEach(s=>{const k=tableOf(s);if(!byTable.has(k))byTable.set(k,[]);byTable.get(k).push(s);});
  const tie=new Map([...byTable.keys()].map(k=>[k,rnd()]));
  const occ=new Map([...byTable.keys()].map(k=>[k,occupied.get(k)||0]));
  const out=[];
  while(out.length<n){
    let best=null,bestR=Infinity;
    for(const[k,list]of byTable){
      if(!list.length)continue;
      const cap=Math.max(1,capacity.get(k)||list.length),r=occ.get(k)/cap;
      if(r<bestR-1e-9||(Math.abs(r-bestR)<=1e-9&&tie.get(k)<tie.get(best))){best=k;bestR=r;}
    }
    if(best===null)break;
    out.push(byTable.get(best).shift());occ.set(best,occ.get(best)+1);
  }
  return out;
};
/* ta-trash: a deleted setup's seating is kept 30 days, then dropped (on launch) */
const TRASH_DAYS=30;
const purgeTrashList=(list,now,days=TRASH_DAYS)=>(Array.isArray(list)?list:[]).filter(t=>t&&Number.isFinite(t.deletedAt)&&now-t.deletedAt<days*86400000);

/* ── Seat groups into a setup (Phase 6, ROOMS_PLAN section 10) ──
   Pure: takes a setup's layout ({seats,groups,pieces}), the setup (for its usable
   furniture) and the Groups panel's result, and returns the layout with students
   seated and tables coloured. Nothing here touches storage, and it never sees
   Regular: the caller only ever hands it the target setup's own layout.
   groups: [{name, ids:[studentId…], colorIndex}] (colorIndex picks the table colour
   via groupColorKey, so it matches the Groups panel); ungroupedIds: spread over what's left.
   Each group goes to ONE cluster (a table, or joined tables): the smallest that holds it
   whole, biggest groups first. With more groups than clusters, a group shares the
   cluster with the least room left that still fits it. A group too big for any single
   cluster splits across neighbouring clusters (nearest by centre). Locked students stay
   where they are. Keep-apart rules are respected where possible and reported when not. */
const GROUP_COLOR_KEYS=['blue','green','gold','lilac','red','cyan'];
const groupColorKey=i=>GROUP_COLOR_KEYS[((i%GROUP_COLOR_KEYS.length)+GROUP_COLOR_KEYS.length)%GROUP_COLOR_KEYS.length];
const placeGroupsInSetup=({layout,setup,groups=[],ungroupedIds=[],rules=[],clearLabels=false,rnd=Math.random})=>{
  const seatsIn=layout?.seats||[],piecesIn=layout?.pieces||[],gIn=layout?.groups||[];
  const pieceById=new Map(piecesIn.map(p=>[p.id,p]));
  const usable=usableSeatIds(layout,setup);
  const isLocked=s=>!!(s.used&&s.locked&&s.studentId);
  const lockedIds=new Set(seatsIn.filter(isLocked).map(s=>s.studentId));
  const seen=new Set();
  const gl=groups.map((g,i)=>({index:i,name:g.name||`Group ${i+1}`,colorIndex:g.colorIndex==null?i:g.colorIndex,ids:(g.ids||[]).filter(id=>{if(lockedIds.has(id)||seen.has(id))return false;seen.add(id);return true;})}));
  const rest=(ungroupedIds||[]).filter(id=>{if(lockedIds.has(id)||seen.has(id))return false;seen.add(id);return true;});
  const apart=new Map();
  (rules||[]).filter(r=>r&&r.type==='apart').forEach(r=>{
    const ids=r.studentIds||[r.aId,r.bId].filter(Boolean);
    ids.forEach(a=>ids.forEach(b=>{if(a!==b){if(!apart.has(a))apart.set(a,new Set());apart.get(a).add(b);}}));
  });
  const ckey=s=>s.groupId||`__solo_${s.id}`;
  const ctr=s=>[s.x+PG.SEAT_W/2,s.y+PG.SEAT_H/2];
  const edgeOf=s=>{const p=pieceById.get(s.pieceId),sl=p&&SHAPES[p.shape]&&SHAPES[p.shape].slots[s.slot];return sl?`${p.id}:${sl.edge}`:null;};
  const cost=(a,b)=>{const pa=ctr(a),pb=ctr(b),ea=edgeOf(a),eb=edgeOf(b);return Math.hypot(pa[0]-pb[0],pa[1]-pb[1])+(ea&&eb&&ea!==eb?80:0);};
  // clusters of seats that are free to fill in this setup
  const map=new Map();
  seatsIn.filter(s=>usable.has(s.id)&&!isLocked(s)).forEach(s=>{
    const k=ckey(s);
    if(!map.has(k))map.set(k,{key:k,groupId:s.groupId||null,all:[],seats:[],taken:[],tally:new Map()});
    const c=map.get(k);c.all.push(s);c.seats.push(s);
  });
  const centre=c=>{const xs=c.all.map(ctr);return[xs.reduce((a,p)=>a+p[0],0)/xs.length,xs.reduce((a,p)=>a+p[1],0)/xs.length];};
  const clusters=readingOrder([...map.values()],centre);
  clusters.forEach((c,i)=>{c.order=i;[c.cx,c.cy]=centre(c);c.cap=c.all.length;});
  const seatOf=new Map(); // seat id -> student id
  const clusterOfSeat=new Map();clusters.forEach(c=>c.all.forEach(s=>clusterOfSeat.set(s.id,c)));
  /* n seats from a cluster, as compact as possible: from each starting seat grow by the
     cheapest neighbour (the same side of a bench or table counts as closer) */
  const compact=(avail,n)=>{
    if(n>=avail.length)return avail.slice();
    let best=null,bestCost=Infinity;
    avail.forEach(seed=>{
      const pick=[seed];let total=0;
      while(pick.length<n){
        let bs=null,bc=Infinity;
        avail.forEach(s=>{if(pick.includes(s))return;const c=pick.reduce((a,p)=>a+cost(p,s),0);if(c<bc-1e-9){bc=c;bs=s;}});
        total+=bc;pick.push(bs);
      }
      if(total<bestCost-1e-9){bestCost=total;best=pick;}
    });
    return best;
  };
  const clash=(c,ids)=>ids.some(a=>c.taken.some(b=>apart.get(a)?.has(b)));
  const put=(g,c,ids)=>{
    const chosen=compact(c.seats,ids.length);
    chosen.forEach((s,i)=>{seatOf.set(s.id,ids[i]);c.taken.push(ids[i]);});
    c.seats=c.seats.filter(s=>!chosen.includes(s));
    c.tally.set(g.index,(c.tally.get(g.index)||0)+chosen.length);
    return chosen;
  };
  const results=[],unplaced=[];
  [...gl].filter(g=>g.ids.length).sort((a,b)=>b.ids.length-a.ids.length||a.index-b.index).forEach(g=>{
    const n=g.ids.length,res={index:g.index,name:g.name,count:n,tables:[],seatIds:[],split:false,shared:false};
    const fits=clusters.filter(c=>c.seats.length>=n);
    const bySize=(a,b)=>a.seats.length-b.seats.length||a.order-b.order;
    const fresh=fits.filter(c=>!c.taken.length).sort(bySize)[0];
    const sharing=fits.filter(c=>c.taken.length&&!clash(c,g.ids)).sort(bySize)[0];
    const whole=fresh||sharing;
    if(whole){
      res.shared=!!whole.taken.length;
      res.tables.push(whole.key);res.seatIds.push(...put(g,whole,g.ids).map(s=>s.id));
    }else{
      // too big for any one cluster: the one with most room first, then the nearest neighbours
      const left=[...g.ids],used=[];
      while(left.length){
        const pool=clusters.filter(c=>c.seats.length>0&&!used.includes(c));
        if(!pool.length)break;
        let next;
        if(!used.length)next=pool.sort((a,b)=>b.seats.length-a.seats.length||a.taken.length-b.taken.length||a.order-b.order)[0];
        else{
          const mx=used.reduce((a,c)=>a+c.cx,0)/used.length,my=used.reduce((a,c)=>a+c.cy,0)/used.length;
          const d=c=>Math.hypot(c.cx-mx,c.cy-my);
          next=pool.sort((a,b)=>d(a)-d(b)||a.taken.length-b.taken.length||b.seats.length-a.seats.length||a.order-b.order)[0];
        }
        used.push(next);
        // who goes to this table: keep-apart pairs in the group are kept on different tables where possible
        const take=Math.min(next.seats.length,left.length),ids=[];
        for(const id of left){if(ids.length>=take)break;if(!ids.some(x=>apart.get(id)?.has(x)))ids.push(id);}
        for(const id of left){if(ids.length>=take)break;if(!ids.includes(id))ids.push(id);}
        ids.forEach(id=>left.splice(left.indexOf(id),1));
        res.tables.push(next.key);res.seatIds.push(...put(g,next,ids).map(s=>s.id));
      }
      res.split=res.tables.length>1;
      res.count=n-left.length;
      unplaced.push(...left);
    }
    results.push(res);
  });
  // everyone not in a group: spread over the seats still free (tables with the most room first)
  const free=clusters.flatMap(c=>c.seats);
  const occ=new Map(clusters.map(c=>[c.key,c.taken.length])),cap=new Map(clusters.map(c=>[c.key,c.cap]));
  const left2=pickSpreadSeats(free,ckey,occ,cap,Math.min(rest.length,free.length),rnd);
  rest.forEach(id=>{
    if(!left2.length){unplaced.push(id);return;}
    let k=left2.findIndex(s=>!clash(clusterOfSeat.get(s.id),[id]));
    if(k<0)k=0;
    const s=left2.splice(k,1)[0],c=clusterOfSeat.get(s.id);
    seatOf.set(s.id,id);c.taken.push(id);
  });
  // who ended up at a table with someone they must be kept apart from
  const conflicts=[];
  clusters.forEach(c=>{
    const ids=c.taken;
    for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)if(apart.get(ids[i])?.has(ids[j]))conflicts.push({aId:ids[i],bId:ids[j]});
  });
  // everyone cleared except locked students, then the placements
  const seatsNext=seatsIn.map(s=>isLocked(s)?s:{...s,studentId:seatOf.get(s.id)||null,locked:false});
  // table colours and names: each table takes the group with the most seats at it
  const winner=c=>{let best=null;c.tally.forEach((n,gi)=>{if(!best||n>best.n||(n===best.n&&gi<best.gi))best={n,gi};});return best&&gl[best.gi];};
  const byGroupId=new Map(clusters.filter(c=>c.groupId).map(c=>[c.groupId,c]));
  const groupsNext=gIn.map(g=>{
    const c=byGroupId.get(g.id);if(!c)return g;
    const w=winner(c),{color:_c,...base}=g;
    return w?{...base,color:groupColorKey(w.colorIndex),label:w.name}:base;
  });
  const labelled=new Map(),loneColour=new Map();
  clusters.forEach(c=>{
    const w=winner(c);
    const ps=[...new Set(c.all.map(s=>s.pieceId).filter(Boolean))].map(id=>pieceById.get(id)).filter(Boolean);
    if(c.groupId&&w){const first=readingOrder(ps,p=>[p.x,p.y])[0];if(first)labelled.set(first.id,w.name);}
    if(!c.groupId)ps.forEach(p=>loneColour.set(p.id,w?groupColorKey(w.colorIndex):null));
  });
  const generated=new Set(clusters.flatMap(c=>c.all.map(s=>s.pieceId)).filter(Boolean));
  const piecesNext=piecesIn.map(p=>{
    let q=p;
    if(labelled.has(p.id))q={...q,label:labelled.get(p.id).slice(0,24)};
    else if(clearLabels&&q.label&&generated.has(p.id)){const{label:_l,...r}=q;q=r;}
    if(loneColour.has(p.id)){const k=loneColour.get(p.id),{color:_c,...r}=q;q=k?{...r,color:k}:r;}
    return q;
  });
  // a lone legacy desk (no table piece) is coloured on the seat itself
  const seatsOut=seatsNext.map(s=>{
    const c=clusterOfSeat.get(s.id);
    if(!c||c.groupId||s.pieceId)return s;
    const w=winner(c),{color:_c,...r}=s;
    return w?{...r,color:groupColorKey(w.colorIndex)}:r;
  });
  return{
    seats:seatsOut,groups:groupsNext,pieces:piecesNext,
    placed:results.sort((a,b)=>a.index-b.index), // one per group seated: {index,name,count,tables:[clusterKey…],seatIds,split,shared}
    unplaced,                                    // student ids that got no seat
    conflicts,                                   // [{aId,bId}] keep-apart pairs sharing a table
    lockedKept:lockedIds.size,                   // students left in their locked seats
  };
};

const PIECE_GEOMETRY={PG,placeGroupsInSetup,GROUP_COLOR_KEYS,groupColorKey,legacyChairs,REGULAR_SETUP,SETUP_ICONS,SETUP_USES,setupSlKey,regularSetup,defaultSetups,useForName,useKey,normalizeSetups,seatUsableIn,usableSeatIds,usableSeats,unusablePieceIds,seatsForSetup,restoreSeatFlags,pickSpreadSeats,purgeTrashList,TRASH_DAYS,pgStanding,SHAPES,TRAP_H,shapeDef,pieceToWorld,detectJoins,clustersFromJoins,transformPieces,piecesCentre,alignPieceToEdge,findSnap,slotsForLayout,piecesBounds,syncPieceSeats,readingOrder,newPiece,PIECE_COMBOS,buildPieceSet,placePieceSet,seatCountOf,convertOptions,pgInPoly,
  WALL_T,WALL_GRID,WALL_JOIN,wallLen,wallDir,wallPointAt,closestOnWall,nearestWall,clampOpeningT,openingAtPoint,openingFrame,OPENING_TYPES,wallSnapPoint,rectRoomWalls,wallsBounds,
  ROOM_ITEM_TYPES,ROOM_ITEM_SECTIONS,LEGACY_ITEM_SIZE,itemGeom,itemPivot,itemCorners,itemCentre,itemBounds,upgradeLegacyItem,newRoomItem,nextStationNumber,
  extractShell,extractLayout,applyRoomShell,sameShell,instantiateLayout,migrateLegacyLayouts,lineItemFromPoints,snapItemToWall,AREA_COLOURS};
/* @geometry-end */

/* @rotation-begin ═══ Station rotation (Phase 7): pure helpers, no JSX, so tests/geometry.test.js can run them ═══
   A rotation is an overlay on a setup: groups[g] sits at stationOrder[stationFor(g,step,n,direction)].
   Nobody's seat is ever written. rot-<class> = {setupId,stationOrder,groups:[{name,color,studentIds}],step,
   direction:'forward'|'alternate',timerId,minutes,changeover,loop,labels}. */
const ROT_MOVE='Move!'; // the changeover segment's name; the rotation recognises it by this
/* Which station (index into stationOrder) group g is at after `step` moves. Forwards: (g+s) mod n.
   "Alternate directions": every second group (1, 3, 5…) goes backwards, (g−s) mod n. With an odd number of
   stations a forwards and a backwards group do meet at one station now and then (two groups, one station). */
const stationFor=(g,step,n,direction)=>{
  if(!(n>0))return -1;
  const back=direction==='alternate'&&g%2===1;
  return((((g+(back?-step:step))%n)+n)%n);
};
/* For every station, the groups there at this step: [[groupIdx…] per station]. Stations nobody is at stay empty. */
const stationOccupancy=(groupCount,step,n,direction)=>{
  const occ=Array.from({length:Math.max(0,n)},()=>[]);
  for(let g=0;g<groupCount&&n>0;g++)occ[stationFor(g,step,n,direction)].push(g);
  return occ;
};
const stationLabel=st=>`Station ${st.n}${st.name?` · ${st.name}`:''}`;
/* The timer's segments: one work segment per station, with a "Move!" changeover between each (and after the last when
   looping, so the lap joins up). minutes may be fractional (2.5 = 2 min 30 s); changeover is seconds (0 = none). */
const buildRotationSegments=(labels,{minutes=5,changeover=0,loop=false}={})=>{
  const work=Math.max(1,Math.round((Number(minutes)||0)*60)),mv=Math.max(0,Math.round(Number(changeover)||0));
  const segs=[];
  labels.forEach((label,i)=>{
    segs.push({task:label,minutes:Math.floor(work/60),seconds:work%60});
    if(mv>0&&(i<labels.length-1||loop))segs.push({task:ROT_MOVE,minutes:Math.floor(mv/60),seconds:mv%60});
  });
  return segs;
};
/* A setup's stations, in the saved order (new ones last, by number). Items and tables flagged with `station`. */
const orderStations=(items,pieces,order)=>{
  const all=[
    ...(items||[]).filter(i=>i&&i.station).map(i=>({id:i.id,kind:'item',n:Number.isFinite(i.station.n)?i.station.n:0,name:i.station.name||''})),
    ...(pieces||[]).filter(p=>p&&p.station).map(p=>({id:p.id,kind:'piece',n:Number.isFinite(p.station.n)?p.station.n:0,name:p.station.name||''})),
  ].sort((a,b)=>(a.n-b.n)||(a.id<b.id?-1:a.id>b.id?1:0));
  const pos=new Map((order||[]).map((id,i)=>[id,i]));
  return[...all.filter(s=>pos.has(s.id)).sort((a,b)=>pos.get(a.id)-pos.get(b.id)),...all.filter(s=>!pos.has(s.id))];
};
const defaultGroupName=(name,i)=>(name&&String(name).trim())||`Group ${i+1}`;
/* Where each group goes at a step: [{gi,group,station:index}] */
const rotationAt=(rot,step)=>(rot.groups||[]).map((group,gi)=>({gi,group,station:stationFor(gi,step,(rot.stationOrder||[]).length,rot.direction)}));
/* A saved rot-<class> that is whole enough to use (anything else is ignored) */
const validRotation=r=>r&&typeof r==='object'&&Array.isArray(r.stationOrder)&&r.stationOrder.length>0&&Array.isArray(r.groups)&&Number.isFinite(r.step)&&r.step>=0
  ?{...r,direction:r.direction==='alternate'?'alternate':'forward',loop:!!r.loop,labels:Array.isArray(r.labels)?r.labels:[]}:null;
/* @rotation-end */

// Tag colours. Custom tags used to get whatever COLORS[i] fell out of
// their position in whichever list happened to be rendering them — so the
// same tag could show up a different colour on the seat map than in the
// tag chip list, since one iterates all seats and the other iterates
// avTags. Hashing the tag's own name instead makes the colour depend only
// on the tag, so it's identical everywhere it's ever drawn. Manage Tags
// (see ManageSeatTagsModal) can still override this per class.
const SEAT_TAG_COLS={LS:{t:'#b8850a',b:'#fdf5e6'},EAL:{t:'#2e6bce',b:'#eaf1fc'},Front:{t:'#3a8a4e',b:'#edf7ef'},Girl:{t:'#c44',b:'#fdeeed'},Boy:{t:'#2e6bce',b:'#eaf1fc'}};
const hashStr=s=>{let h=0;const t=String(s);for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))>>>0;return h;};
const stCol=tag=>SEAT_TAG_COLS[tag]||{t:COLORS[hashStr(tag)%COLORS.length].text,b:COLORS[hashStr(tag)%COLORS.length].bg};
const DEFAULT_SEAT_TAGS=['LS','EAL'];

/* ── Checklist — a student × item grid that replaced the old Flags panel ──
   Category colours for items; they're also the dot colours next to names in
   the Seating/Groups views. Red is last on purpose: in the grid red means
   "overdue", so it shouldn't be anyone's default category. The old Red/Amber/
   Blue/Green/Purple labels are kept so migrated flags keep their colour. */
const CHECK_COLOURS=[
  {label:'Blue',  bg:'#eaf1fc',border:'rgba(46,107,206,0.25)',text:'#2e6bce'},
  {label:'Green', bg:'#edf7ef',border:'rgba(58,138,78,0.25)',text:'#3a8a4e'},
  {label:'Amber', bg:'#fdf5e6',border:'rgba(234,170,60,0.25)',text:'#b8850a'},
  {label:'Purple',bg:'#f3eefb',border:'rgba(120,80,180,0.25)',text:'#7850b4'},
  {label:'Teal',  bg:'#e8f6f8',border:'rgba(42,138,154,0.25)',text:'#2a8a9a'},
  {label:'Pink',  bg:'#fce9f1',border:'rgba(200,70,125,0.25)',text:'#c0457a'},
  {label:'Grey',  bg:'#f0f1f4',border:'rgba(0,0,0,0.15)',text:'#6b7280'},
  {label:'Red',   bg:'#fdeeed',border:'rgba(200,60,60,0.25)',text:'#c44'},
];
const CHECK_NONE={label:'',bg:'#f6f7f9',border:'rgba(0,0,0,0.12)',text:'#9aa0ac'}; // uncategorised item
const checkColour=label=>CHECK_COLOURS.find(c=>c.label===label)||CHECK_NONE;
const CHECK_STATUSES=[
  {id:'none',     label:'Not submitted', short:'',  bg:'#fff',    text:'rgba(0,0,0,0.25)'},
  {id:'done',     label:'Done',          short:'✓', bg:'#edf7ef', text:'#3a8a4e'},
  {id:'late',     label:'Submitted late',short:'L', bg:'#fdf5e6', text:'#b8850a'},
  {id:'resubmit', label:'Resubmit',      short:'↻', bg:'#f3eefb', text:'#7850b4'},
  {id:'notdone', label:'Not done',      short:'✗', bg:'#f7cfcb', text:'#a82a22'}, // an explicit mark, stronger red than the pale "overdue" tint
  {id:'na',       label:'Not applicable',short:'–', bg:'#f0f1f4', text:'rgba(0,0,0,0.35)'},
];
const CHECK_CYCLE=['none','done','late','resubmit','notdone','na'];
const checkStatus=id=>CHECK_STATUSES.find(s=>s.id===id)||CHECK_STATUSES[0];
const OVERDUE={bg:'#fdeeed',text:'#c44',border:'rgba(200,60,60,0.35)'};
const EMPTY_CHECKLIST={version:1,columns:[],cells:{}};

/* Due date + time → a Date, built from local parts. (new Date('YYYY-MM-DD')
   parses as UTC, which would shift the deadline by the timezone offset.)
   A date with no time means "end of that day". */
const dueDateTime=col=>{
  if(!col?.due)return null;
  const[y,m,d]=col.due.split('-').map(Number);
  const[hh,mm]=col.dueTime?col.dueTime.split(':').map(Number):[23,59];
  const dt=new Date(y,m-1,d,hh,mm,col.dueTime?0:59);
  return isNaN(dt.getTime())?null:dt;
};
const CHECK_DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CHECK_MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDue=col=>{
  const d=dueDateTime(col);if(!d)return'';
  return`${CHECK_DAYS[d.getDay()]} ${d.getDate()} ${CHECK_MONTHS[d.getMonth()]}${col.dueTime?` · ${col.dueTime}`:''}`;
};
/* An entry with status 'none' (only there to carry a note) counts as blank. */
const cellStatus=(data,colId,studentId)=>data?.cells?.[colId]?.[studentId]?.status||'none';
/* Overdue is derived, never stored — a blank cell on a column that's past due. */
const isOverdue=(col,status,now)=>{
  if(status!=='none')return false;
  const dt=dueDateTime(col);
  return !!dt&&now>dt.getTime();
};
const isFlagged=(col,status,now)=>{
  if(!col.flag||!(col.flagIf||[]).includes(status))return false;
  if(status==='none'&&col.flagOnlyOverdue&&!isOverdue(col,status,now))return false;
  return true;
};
/* One student's items worth acting on, in column order. `onlyFlagged` is what
   the dots use; the name-click popups also list overdue items that aren't flagged. */
const checklistItemsForStudent=(data,studentId,now,onlyFlagged)=>{
  const out=[];
  (data?.columns||[]).forEach(col=>{
    const status=cellStatus(data,col.id,studentId);
    const overdue=isOverdue(col,status,now);
    const flagged=isFlagged(col,status,now);
    if(flagged||(!onlyFlagged&&(overdue||status==='notdone')))out.push({colId:col.id,name:col.name,colour:col.colour,status,overdue,flagged});
  });
  return out;
};
const flagsForStudent=(data,studentId,now)=>checklistItemsForStudent(data,studentId,now,true);
/* Write one cell, keeping the saved data sparse: a blank cell with no note has no entry. */
const withCell=(data,colId,studentId,patch)=>{
  const nx={status:'none',...(data.cells?.[colId]?.[studentId]||{}),...patch};
  if(!nx.note)delete nx.note;
  const colCells={...(data.cells?.[colId]||{})};
  if(nx.status==='none'&&!nx.note)delete colCells[studentId];else colCells[studentId]=nx;
  return{...data,cells:{...data.cells,[colId]:colCells}};
};

/* Old flags → checklist columns. Each flag becomes a flagged "not submitted"
   column; students who had it stay blank (so they stay flagged), and everyone
   else is marked N/A so they don't. flags-<classId> itself is left untouched. */
const migrateFlagsToChecklist=(oldFlags,students)=>{
  const columns=[],cells={};
  oldFlags.forEach(f=>{
    const id=`c-${f.id}`;
    columns.push({id,name:f.name,colour:f.colour||null,due:null,dueTime:null,flag:true,flagIf:['none'],flagOnlyOverdue:false});
    cells[id]={};
    students.forEach(st=>{
      const entry=(f.students||[]).find(e=>e.id===st.id);
      if(!entry)cells[id][st.id]={status:'na'};
      else if(entry.note)cells[id][st.id]={status:'none',note:entry.note};
    });
  });
  return{version:1,columns,cells};
};
/* Checklist row order — display only, the roster itself is never reordered. Names are "First Last", so the last name is the final word. */
const CHECK_SORTS=[{id:'roster',label:'Roster order'},{id:'first',label:'First name'},{id:'last',label:'Last name'},{id:'grade',label:'Grade'}];
const nameParts=n=>{const w=(n||'').trim().split(/\s+/);return{first:w[0]||'',last:w.length>1?w[w.length-1]:''};};
const cmpText=(a,b)=>a.localeCompare(b,undefined,{sensitivity:'base',numeric:true});
function sortStudents(students,key){
  if(key==='roster'||!CHECK_SORTS.some(s=>s.id===key))return students;
  const byLast=(a,b)=>{const x=nameParts(a.name),y=nameParts(b.name);return cmpText(x.last,y.last)||cmpText(x.first,y.first);};
  const cmp={
    first:(a,b)=>cmpText(nameParts(a.name).first,nameParts(b.name).first)||byLast(a,b),
    last:byLast,
    grade:(a,b)=>{const x=parseInt(a.grade),y=parseInt(b.grade);const xn=isNaN(x),yn=isNaN(y);if(xn!==yn)return xn?1:-1;return(x-y)||byLast(a,b);}, // blank grades go last
  }[key];
  return[...students].sort(cmp);
}
/* Loads a class's checklist, running the one-time flags migration if it has none yet. */
async function loadChecklist(classId,students){
  const cur=await load(`checklist-${classId}`,null);
  if(cur)return{...EMPTY_CHECKLIST,...cur};
  const old=await load(`flags-${classId}`,null);
  if(old&&old.length){
    const mig=migrateFlagsToChecklist(old,students);
    save(`checklist-${classId}`,mig);
    return mig;
  }
  return EMPTY_CHECKLIST;
}

/* Little dots next to a student's name for their flagged checklist items.
   Overdue ones get a red ring; the tooltip lists what each dot is. */
function FlagDots({flags,scale=1,size=10,max=3,onClick}){
  if(!flags||!flags.length)return null;
  const shown=flags.slice(0,max),extra=flags.length-shown.length;
  const tip=flags.map(f=>`${f.name} — ${f.overdue?'overdue':checkStatus(f.status).label.toLowerCase()}`).join('\n');
  return(
    <span title={tip} onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:2*scale,flexShrink:0,cursor:onClick?"pointer":"default"}}>
      {shown.map(f=>(
        <span key={f.colId} style={{display:"inline-block",width:size*scale,height:size*scale,borderRadius:"50%",background:checkColour(f.colour).text,boxShadow:f.overdue?`0 0 0 ${1.5*scale}px #fff, 0 0 0 ${3*scale}px #c44`:"0 1px 3px rgba(0,0,0,0.2)",margin:f.overdue?2*scale:0}}/>
      ))}
      {extra>0&&<span style={{fontSize:Math.max(8,size*0.9)*scale,fontWeight:700,color:"rgba(0,0,0,0.5)",lineHeight:1}}>+{extra}</span>}
    </span>
  );
}

/* The name-click popups' replacement for the old Flags section: this
   student's outstanding items (flagged or overdue) with a status dropdown. */
function StudentChecklistSection({studentId,checklist,now,onChange,onOpen}){
  const items=checklistItemsForStudent(checklist,studentId,now,false);
  return(
    <div>
      <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)",marginBottom:"4px"}}>Checklist</div>
      {items.length===0?(
        <div style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontStyle:"italic",marginBottom:"5px"}}>Nothing outstanding</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"6px"}}>
          {items.map(it=>(
            <div key={it.colId} style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <span style={{width:"8px",height:"8px",borderRadius:"50%",background:checkColour(it.colour).text,flexShrink:0,boxShadow:it.overdue?"0 0 0 1.5px #fff, 0 0 0 3px #c44":"none",margin:it.overdue?"2px":0}}/>
              <span title={it.overdue?`${it.name} — overdue`:it.name} style={{fontSize:"12px",fontWeight:600,color:(it.overdue||it.status==='notdone')?"#c44":"#1a1a2e",flex:1,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.name}</span>
              <select value={it.status} onChange={e=>onChange?.(withCell(checklist,it.colId,studentId,{status:e.target.value}))} title={`Set this student's status for "${it.name}"`}
                style={{width:"104px",padding:"3px 4px",borderRadius:"6px",border:"1px solid rgba(0,0,0,0.09)",fontSize:"10.5px",fontFamily:"'Source Sans 3',sans-serif",background:"#fff",color:"#1a1a2e",outline:"none"}}>
                {CHECK_STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
      <button className="cpb cpb-dashed" onClick={onOpen} title="Open the Checklist tab at this student" style={{width:"100%",padding:"5px 0",borderRadius:"6px",border:"1px dashed rgba(0,0,0,0.15)",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Open in Checklist →</button>
    </div>
  );
}

/* ── Grade/gender "smart" tags — auto-derived from the student's real grade/gender
   fields instead of a manually-assigned tag. Same matching mechanics as custom
   tags (seat.tags is still just an array of strings); never written to the student. ── */
const GENDER_TAG_MAP={Girl:'F',Boy:'M'};
const isSmartTag=t=>t.startsWith('Grade ')||Object.prototype.hasOwnProperty.call(GENDER_TAG_MAP,t);
const gradeSmartTags=students=>[...new Set((students||[]).map(s=>s.grade).filter(Boolean))]
  .sort((a,b)=>parseInt(a)-parseInt(b)).map(g=>`Grade ${g}`);

/* Returns true if student's tags satisfy seat's tag rule */
const studentSatisfiesTag=(student,tag)=>{
  if(tag.startsWith('Grade '))return(student?.grade||'')===tag.slice(6).trim();
  if(GENDER_TAG_MAP[tag])return(student?.gender||'')===GENDER_TAG_MAP[tag];
  return(student?.tags||[]).includes(tag);
};
const studentMatchesSeat=(student,seat)=>{
  if(!seat||!seat.tags||!seat.tags.length)return true; // untagged seat: anyone fits
  return(seat.tagRule==='AND')
    ?seat.tags.every(t=>studentSatisfiesTag(student,t))
    :seat.tags.some(t=>studentSatisfiesTag(student,t));
};

/* ── Reseating a set of students into a different set of seats — used both
   when switching to a different room layout, and when a saved arrangement
   doesn't match the current room. "Clusters" are seats sharing a groupId
   (i.e. a multi-seat table), or a lone used seat on its own. Bigger clusters
   are placed first, into the smallest target cluster that can still hold
   them whole; a cluster too big for anywhere is split across clusters
   (biggest available first) rather than left entirely unplaced, and whatever
   still doesn't fit anywhere is simply left out — it reappears in the
   unplaced list on the left, since nothing else assigns it a seat. ── */
const clusterByGroup=seatsArr=>{
  const map=new Map();
  seatsArr.forEach(s=>{
    const key=s.groupId||`__solo_${s.id}`;
    if(!map.has(key))map.set(key,[]);
    map.get(key).push(s.id);
  });
  return[...map.values()];
};
const bestFitReseat=(oldSeats,targetSeats)=>{
  const oldClusters=clusterByGroup((oldSeats||[]).filter(s=>s.used&&s.studentId))
    .map(seatIds=>seatIds.map(id=>oldSeats.find(s=>s.id===id).studentId))
    .sort((a,b)=>b.length-a.length);
  const buckets=clusterByGroup((targetSeats||[]).filter(s=>s.used))
    .map(seatIds=>({remaining:[...seatIds]}));
  const assignment={};
  oldClusters.forEach(cluster=>{
    let left=[...cluster];
    while(left.length>0){
      const avail=buckets.filter(b=>b.remaining.length>0);
      if(!avail.length)break;
      const exact=avail.filter(b=>b.remaining.length>=left.length).sort((a,b)=>a.remaining.length-b.remaining.length)[0];
      const choice=exact||avail.sort((a,b)=>b.remaining.length-a.remaining.length)[0];
      const take=Math.min(choice.remaining.length,left.length);
      for(let i=0;i<take;i++)assignment[choice.remaining.shift()]=left.shift();
    }
  });
  return targetSeats.map(s=>assignment[s.id]?{...s,studentId:assignment[s.id],locked:false}:s);
};
/* The saved sl-<class> object. pieces/joins are only written once a room has
   table pieces, so a room without any keeps exactly the shape it always had. */
const slLayoutObj=(s,g,t,ri,rl,pc,jn,ex)=>{
  const o={seats:s,groups:g,tags:t,roomItems:ri,rules:rl||[]};
  if(pc?.length){o.pieces=pc;o.joins=jn||[];}
  /* Room builder (Phase 4): walls, openings and the link to a library room are
     written only once they exist, so an old room keeps exactly its old shape. */
  if(ex?.walls?.length)o.walls=ex.walls;
  if(ex?.openings?.length)o.openings=ex.openings;
  if(ex?.room)o.room=ex.room;
  return o;
};
/* A room with walls is usually bigger than the panel showing it, so open it zoomed
   out just far enough to see all of it (never bigger than 100%, never below 40%). */
const fitZoomFor=(el,lay)=>{
  if(!el||!lay?.walls?.length)return 1;
  const sz=canvasContentSize(lay.seats||[],lay.roomItems||[],lay.pieces||[],slotsForLayout(lay.pieces||[],lay.joins||[]),lay.walls);
  return Math.max(0.4,Math.min(1,+((el.clientWidth-24)/sz.w).toFixed(2),+((el.clientHeight-24)/sz.h).toFixed(2)));
};
/* What counts as "the shell" of a room (walls, openings, fixed items) — compared
   to tell whether an edit touched it, which is what a linked room asks about. */
const shellSig=(walls,openings,items)=>JSON.stringify([walls||[],openings||[],(items||[]).filter(i=>i.fixed)]);
/* ta-rooms: the room library (see ROOMS_PLAN section 4). The first write of a
   session takes an automatic backup, and the first save ever brings the old
   "Saved layouts" in as a room called "My saved layouts" (the old key stays). */
let roomsBackedUp=false;
async function loadRooms(){const r=await load('ta-rooms',[]);return Array.isArray(r)?r:[];}
async function saveRooms(rooms){
  if(!roomsBackedUp){roomsBackedUp=true;await autoBackup('before room library');}
  const legacy=await load('ta-saved-layouts',[]);
  const next=migrateLegacyLayouts(rooms,legacy);
  await save('ta-rooms',next);
  return next;
}
/* A class that is linked to a library room picks up the room's current shell
   (walls, openings, fixed items) whenever it loads — never its furniture or students.
   A class that said "just this class" (shellLocal) keeps its own. Saves only if something changed. */
async function syncClassWithRoom(classId,layout,key){ // key: the setup's own sl- key (Phase 5); each setup has its own room link
  const link=layout?.room;
  if(!layout||!link?.roomId||link.shellLocal)return layout;
  const room=(await loadRooms()).find(r=>r.id===link.roomId);
  if(!room||sameShell(layout,room))return layout;
  if(!roomsBackedUp){roomsBackedUp=true;await autoBackup('before room library');}
  const next=applyRoomShell(layout,room);
  await save(key||`sl-${classId}`,next);
  return next;
}

/* ── Class setups: storage (Phase 5, see ROOMS_PLAN section 9) ──
   setups-<class> lists the setups; Regular's seating stays in sl-<class>, the
   others in sl-<class>~<id>. Seat tags (the class's tag list) and keep-apart /
   together rules are class-level: they live only in sl-<class>, and a setup's
   own key keeps them empty. */
const SETUPS_EVENT='cp-setups-changed';
const notifySetups=classId=>{try{window.dispatchEvent(new CustomEvent(SETUPS_EVENT,{detail:{classId}}));}catch(e){}};
const hasKey=async k=>!!(await window.storage.get(k));
/* The first launch with setups: back up once, give every class a "Regular" setup
   (using tables AND workstations, so generation is exactly as before), and leave
   sl-<class> alone (main only reads that, so rolling back still works). cp-schema
   becomes 2 only once every class has its entry. Safe to run again, or after a
   crash halfway: classes that already have an entry are skipped. */
async function migrateSetups(){
  try{
    if((await load('cp-schema',0))>=2)return true;
    const classes=await load('ta-classes',[]);
    const ids=(Array.isArray(classes)?classes:[]).map(c=>c&&c.id).filter(Boolean);
    const missing=[];
    for(const id of ids)if(!(await hasKey(`setups-${id}`)))missing.push(id);
    if(missing.length){
      await autoBackup('before setups');
      const now=Date.now();
      for(const id of missing)if(!(await hasKey(`setups-${id}`)))await window.storage.set(`setups-${id}`,JSON.stringify(defaultSetups(now)));
    }
    for(const id of ids)if(!(await hasKey(`setups-${id}`)))return false;
    await window.storage.set('cp-schema',JSON.stringify(2));
    return true;
  }catch(e){return false;}
}
let setupsMigration=null;
const ensureSetupsMigrated=()=>setupsMigration||(setupsMigration=migrateSetups());
/* A class's setups (Regular only, in memory, if it has none saved yet) */
async function loadSetups(classId){
  await ensureSetupsMigrated();
  return normalizeSetups(await load(`setups-${classId}`,null));
}
async function saveSetups(classId,data){await save(`setups-${classId}`,normalizeSetups(data));}
export async function loadSetupLayout(classId,setupId){return load(setupSlKey(classId,setupId),null);}
/* A setup's seating. For a setup other than Regular the class-level tags and
   rules are left out (they stay in sl-<class>); Regular keeps the ones already
   saved when the object doesn't bring its own. */
const stripClassLevel=obj=>({...obj,tags:[],rules:[]});
export async function saveSetupLayout(classId,setupId,obj){
  if(!setupId||setupId===REGULAR_SETUP){
    const cur=await load(`sl-${classId}`,null);
    await save(`sl-${classId}`,{...obj,tags:obj.tags??cur?.tags??[],rules:obj.rules??cur?.rules??[]});
  }else await save(setupSlKey(classId,setupId),stripClassLevel(obj));
}
/* Class-level tags and rules, written into sl-<class> without touching its seating */
async function saveClassLevel(classId,{tags,rules}){
  const cur=await load(`sl-${classId}`,null);
  const base=cur||{seats:[],groups:[],tags:[],roomItems:[],rules:[]};
  if(JSON.stringify(base.tags||[])===JSON.stringify(tags||[])&&JSON.stringify(base.rules||[])===JSON.stringify(rules||[]))return;
  await save(`sl-${classId}`,{...base,tags:tags||[],rules:rules||[]});
}
/* Phase 6/7 hook: which seats a setup generates into — usableSeats(layoutObj,setup) (pure, in the geometry block) */
export{usableSeats};
/* The furniture a new setup starts from: a copy of a layout (students optional), a
   room layout from the library, or an empty room. */
async function startingLayout({fromLayout,withStudents,fromRoom}){
  if(fromLayout){
    const c=cloneJ(fromLayout);
    if(!withStudents)c.seats=(c.seats||[]).map(s=>({...s,studentId:null,locked:false}));
    return stripClassLevel(c);
  }
  if(fromRoom?.roomId){
    const room=(await loadRooms()).find(r=>r.id===fromRoom.roomId);
    const layout=room&&(room.layouts.find(l=>l.id===fromRoom.layoutId)||room.layouts[0]);
    if(layout){
      const inst=instantiateLayout(layout,sUid);
      const sh=room.legacy?{}:cloneJ(room.shell||{});
      return slLayoutObj(inst.seats,inst.groups,[],[...(sh.items||[]),...inst.items],[],inst.pieces,inst.joins,
        room.legacy?{}:{walls:sh.walls||[],openings:sh.openings||[],room:{roomId:room.id,layoutId:layout.id}});
    }
  }
  return slLayoutObj([],[],[],[],[]);
}
/* Phase 6/7 hook: make a setup in code. Returns the new setup. With activate:true
   it also becomes the class's active setup. Open panels hear about it (SETUPS_EVENT). */
export async function createSetup(classId,{name,icon,use,fromLayout,withStudents=false,fromRoom,offPieces,activate=false,extra}={}){
  const cur=await loadSetups(classId);
  const setup={id:`su${sUid()}`,name:(name||'').trim()||'New setup',icon:icon||'🪑',use:SETUP_USES[useKey(use||useForName(name))].slice(),offPieces:fromLayout&&Array.isArray(offPieces)?[...offPieces]:[],createdAt:Date.now(),...(extra||{})};
  // the seating first, then the list: a crash in between leaves an unused key, never a tab with no seating
  await save(setupSlKey(classId,setup.id),await startingLayout({fromLayout,withStudents,fromRoom}));
  await saveSetups(classId,{...cur,list:[...cur.list,setup],...(activate?{activeId:setup.id}:{})});
  notifySetups(classId);
  return setup;
}
/* Delete a setup (never Regular). Its seating goes to ta-trash first and the key is
   removed only once that copy is safely saved; the trash keeps it 30 days. */
async function deleteSetup(classId,setupId){
  if(!setupId||setupId===REGULAR_SETUP)return false;
  const key=setupSlKey(classId,setupId);
  const cur=await loadSetups(classId);
  const raw=await window.storage.get(key);
  if(raw){
    const entry={key,value:JSON.parse(raw.value),deletedAt:Date.now(),classId,setup:cur.list.find(s=>s.id===setupId)||null};
    const trash=await load('ta-trash',[]);
    await window.storage.set('ta-trash',JSON.stringify([...(Array.isArray(trash)?trash:[]),entry]));
    const check=await load('ta-trash',[]);
    if(!Array.isArray(check)||!check.some(t=>t.key===key&&t.deletedAt===entry.deletedAt))return false; // the copy didn't stick: keep the original
  }
  await saveSetups(classId,{...cur,activeId:cur.activeId===setupId?REGULAR_SETUP:cur.activeId,list:cur.list.filter(s=>s.id!==setupId)});
  if(raw)await window.storage.delete(key);
  notifySetups(classId);
  return true;
}
/* ── Seat the Groups panel's groups into a setup (Phase 6, ROOMS_PLAN section 10) ──
   `target` is {setupId} (replace that setup's seating) or {name,icon,use,from} for a new
   setup, where `from` is {kind:'current'} (the active setup's room and furniture),
   {kind:'setup',setupId} or {kind:'room',roomId,layoutId}. Regular is never a target and
   is never written: the only seating keys saved are the target's own (sl-<class>~<id>).
   The target becomes the active setup. Returns what happened, for the summary. */
async function seatGroupsIntoSetup(classId,{target,groups,ungroupedIds}){
  const cur=await loadSetups(classId);
  const classObj=await load(`sl-${classId}`,null);
  const rules=classObj?.rules||[];
  const fromGroups={at:Date.now(),names:groups.map((g,i)=>g.name||`Group ${i+1}`)};
  const withLayout=(lo,res)=>({...lo,seats:res.seats,groups:res.groups,...(lo.pieces?{pieces:res.pieces}:{})});
  if(target.setupId){
    if(target.setupId===REGULAR_SETUP)throw new Error('Regular is never changed by Seat these groups');
    const setup=cur.list.find(x=>x.id===target.setupId);
    const lo=setup&&await loadSetupLayout(classId,setup.id);
    if(!lo)throw new Error('That setup has no seating to replace');
    const res=placeGroupsInSetup({layout:lo,setup,groups,ungroupedIds,rules,clearLabels:!!setup.fromGroups});
    await saveSetupLayout(classId,setup.id,withLayout(lo,res));
    await saveSetups(classId,{...cur,activeId:setup.id,list:cur.list.map(x=>x.id===setup.id?{...x,fromGroups}:x)});
    notifySetups(classId);
    return{setup,res,created:false};
  }
  const from=target.from||{kind:'current'};
  const srcSetup=from.kind==='setup'?cur.list.find(x=>x.id===from.setupId):from.kind==='current'?cur.list.find(x=>x.id===cur.activeId):null;
  const srcLayout=srcSetup?await loadSetupLayout(classId,srcSetup.id):null;
  const base=await startingLayout({fromLayout:srcLayout||undefined,withStudents:false,fromRoom:from.kind==='room'?{roomId:from.roomId,layoutId:from.layoutId}:undefined});
  const offPieces=srcLayout&&srcSetup?srcSetup.offPieces||[]:[];
  const use=SETUP_USES[useKey(target.use||useForName(target.name))].slice();
  const res=placeGroupsInSetup({layout:base,setup:{use,offPieces},groups,ungroupedIds,rules});
  const setup=await createSetup(classId,{name:target.name,icon:target.icon,use,fromLayout:withLayout(base,res),withStudents:true,offPieces,activate:true,extra:{fromGroups}});
  return{setup,res,created:true};
}
/* On launch: anything in the trash for more than 30 days goes for good */
async function purgeTrash(now=Date.now()){
  try{
    const t=await load('ta-trash',null);if(!Array.isArray(t))return;
    const kept=purgeTrashList(t,now);
    if(kept.length!==t.length)await save('ta-trash',kept);
  }catch(e){}
}
/* Structural fingerprint used to detect "has the room layout changed since
   the last save/load" — deliberately ignores who's sitting where. */
const roomStructureKey=(seatsArr,groupsArr,roomItemsArr,piecesArr,joinsArr)=>JSON.stringify({
  seats:(seatsArr||[]).map(s=>({id:s.id,groupId:s.groupId,x:s.x,y:s.y,tags:s.tags,tagRule:s.tagRule,used:s.used,unavailable:s.unavailable})),
  groups:(groupsArr||[]).map(g=>({id:g.id,seatIds:g.seatIds,label:g.label})),
  roomItems:roomItemsArr||[],
  pieces:piecesArr||[],joins:joinsArr||[],
});
/* Id-independent room shape — two rooms built separately (e.g. a saved
   arrangement vs. the current layout) never share seat ids, so comparing by
   position is how we tell whether they're really the same physical room. */
const roomShapeSignature=(seatsArr,roomItemsArr,piecesArr)=>JSON.stringify({
  seats:(seatsArr||[]).filter(s=>s.used).map(s=>`${s.x},${s.y}`).sort(),
  roomItems:(roomItemsArr||[]).map(r=>`${r.type}:${r.x},${r.y}`).sort(),
  pieces:(piecesArr||[]).map(p=>`${p.shape}:${p.x},${p.y},${p.rot||0}`).sort(),
});
/* Who's sitting where, for detecting unconfirmed seating changes */
const seatingSignature=seatsArr=>JSON.stringify((seatsArr||[]).filter(s=>s.studentId).map(s=>[s.id,s.studentId]).sort((a,b)=>a[0]<b[0]?-1:1));

/* ── Randomise a room — one implementation shared by Manage Seating's
   Randomize button and the Seating tab's Randomise, so both honour exactly
   the same seat tags, keep-apart/together rules, and Smart shuffle / tag-rule
   options. Pure: takes the room and returns the new seats plus any rules the
   best attempt still couldn't satisfy. ── */
const LEGACY_SEAT_TAGS=new Set(['Front','Board','Window','Door']);
const randomizeSeating=({students,seats,rules,smartShuffle,hardTagRules,pairingHistory})=>{
  const studentById=id=>students.find(s=>s.id===id);
  const usedSeats=seats.filter(s=>s.used&&!s.unavailable);
  /* Anyone locked into an in-use seat stays put, even one this setup doesn't generate
     into (it is passed in marked unavailable) — so they're never dealt a second seat too. */
  const lockedIds=new Set(seats.filter(s=>s.used&&s.locked&&s.studentId).map(s=>s.studentId));
  const freeSeats=usedSeats.filter(s=>!s.locked);
  /* Tables, for spreading students out: a group of seats is one table, a lone seat its own */
  const tableOf=s=>s.groupId||`__solo_${s.id}`;
  const capacity=new Map();
  usedSeats.forEach(s=>capacity.set(tableOf(s),(capacity.get(tableOf(s))||0)+1));
  const lockedOcc=new Map();
  usedSeats.filter(s=>s.locked&&s.studentId).forEach(s=>lockedOcc.set(tableOf(s),(lockedOcc.get(tableOf(s))||0)+1));
  const pool=students.filter(s=>!lockedIds.has(s.id));
  const taggedSeats=freeSeats.filter(s=>s.tags.length>0);
  const untaggedSeats=freeSeats.filter(s=>!s.tags.length);
  /* A together-rule can't be judged fairly if one of its students isn't even
     part of this round (locked into a seat elsewhere) — skip those rather
     than flag them as broken. */
  const applicableRules=rules.filter(r=>r.type!=='together'||ruleStudentIds(r).every(id=>pool.some(s=>s.id===id)));

  const tryAssign=shuffled=>{
    const p=[...shuffled];
    const assign={};
    const unmatchedTagged=[];
    for(const seat of taggedSeats){
      const idx=p.findIndex(st=>studentMatchesSeat(st,seat));
      if(idx>=0){assign[seat.id]=p[idx].id;p.splice(idx,1);}
      else unmatchedTagged.push(seat);
    }
    /* Everyone left goes to an untagged seat (and, in best-fit mode, a tagged seat nobody
       matched), spread evenly over the tables rather than in list order, so with spare
       seats no table is left empty while another is full. */
    const occ=new Map(lockedOcc);
    Object.keys(assign).forEach(id=>{const s=taggedSeats.find(x=>x.id===id);if(s)occ.set(tableOf(s),(occ.get(tableOf(s))||0)+1);});
    const fillable=hardTagRules?untaggedSeats:[...untaggedSeats,...unmatchedTagged];
    for(const seat of pickSpreadSeats(fillable,tableOf,occ,capacity,p.length))assign[seat.id]=p.shift().id;
    return assign;
  };

  const seatGroupId={};seats.forEach(s=>{if(s.groupId)seatGroupId[s.id]=s.groupId;});

  const scoreAssign=assign=>{
    if(!smartShuffle)return 0;
    const groupStudents={};
    Object.entries(assign).forEach(([seatId,sid])=>{
      const gid=seatGroupId[seatId]||seatId;
      if(!groupStudents[gid])groupStudents[gid]=[];
      groupStudents[gid].push(sid);
    });
    let score=0;
    Object.values(groupStudents).forEach(sids=>{
      for(let i=0;i<sids.length;i++)for(let j=i+1;j<sids.length;j++){
        score+=(pairingHistory||{})[[sids[i],sids[j]].sort().join('-')]||0;
      }
    });
    return score;
  };

  const conflictsFor=assign=>{
    const seatGroupStudents={};
    seats.forEach(s=>{const gid=seatGroupId[s.id]||s.id;if(!seatGroupStudents[gid])seatGroupStudents[gid]=[];if(assign[s.id])seatGroupStudents[gid].push(assign[s.id]);});
    const groupedStudents=Object.values(seatGroupStudents).map(ids=>ids.map(studentById).filter(Boolean));
    return checkGroupConflicts(groupedStudents,applicableRules,students);
  };

  const MAX=smartShuffle?40:120;
  let bestAssign=null,bestScore=Infinity,bestConflictCount=Infinity;
  for(let i=0;i<MAX;i++){
    const assign=tryAssign(fisherYates(pool));
    const conflicts=conflictsFor(assign);
    if(conflicts.length===0){
      const score=scoreAssign(assign);
      if(!smartShuffle){bestAssign=assign;bestConflictCount=0;break;}
      if(score<bestScore){bestScore=score;bestAssign=assign;bestConflictCount=0;}
    } else if(conflicts.length<bestConflictCount){
      bestConflictCount=conflicts.length;bestAssign=assign;
    }
  }

  const nextSeats=seats.map(s=>{
    if(!s.used)return{...s,studentId:null};
    if(s.locked&&s.studentId)return s;
    return{...s,studentId:bestAssign?.[s.id]||null};
  });
  /* Who ended up clustered with whom — fed into the pairing history so Smart
     shuffle has something to avoid next time. */
  let nextHistory=pairingHistory||{};
  if(bestAssign){
    const clusters={};
    seats.forEach(s=>{const gid=seatGroupId[s.id]||s.id;if(!clusters[gid])clusters[gid]=[];if(bestAssign[s.id])clusters[gid].push(bestAssign[s.id]);});
    nextHistory={...nextHistory};
    Object.values(clusters).forEach(sids=>{
      for(let i=0;i<sids.length;i++)for(let j=i+1;j<sids.length;j++){
        const key=[sids[i],sids[j]].sort().join('-');
        nextHistory[key]=(nextHistory[key]||0)+1;
      }
    });
  }
  return{nextSeats,conflicts:bestAssign?conflictsFor(bestAssign):[],nextHistory,placed:!!bestAssign};
};

/* ── Layout card with inline delete confirmation ── */
function LayoutCard({layout,onLoad,onDelete}){
  const[confirming,setConfirming]=useState(false);
  return(
    <div style={{borderRadius:"8px",background:"#fff",border:`1px solid ${confirming?"rgba(220,60,60,0.25)":"rgba(0,0,0,0.07)"}`,overflow:"hidden",transition:"border 0.15s"}}>
      {!confirming?(
        <div style={{display:"flex",alignItems:"center",gap:"2px",padding:"5px 5px 5px 8px"}}>
          <span style={{flex:1,minWidth:0,fontSize:"11px",color:"#1a1a2e",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={layout.name}>{layout.name}</span>
          <button className="cpb cpb-ghost cpb-link" onClick={onLoad} title={`Load "${layout.name}"`}
            style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"4px 6px",flexShrink:0,borderRadius:"5px"}}
            onMouseEnter={e=>e.currentTarget.style.background="#eaf1fc"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}
          >⤓</button>
          {onDelete&&<button className="cpb cpb-ghost" onClick={()=>setConfirming(true)} title={`Delete "${layout.name}"`}
            style={{background:"none",border:"none",color:"rgba(0,0,0,0.18)",cursor:"pointer",fontSize:"15px",lineHeight:1,padding:"4px 6px",flexShrink:0,borderRadius:"5px"}}
            onMouseEnter={e=>e.target.style.color="#eb5757"}
            onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.18)"}
          >×</button>}
        </div>
      ):(
        <div style={{padding:"8px 10px"}}>
          <div style={{fontSize:"11px",fontWeight:600,color:"#c44",marginBottom:"6px",lineHeight:1.4}}>Delete "{layout.name}"?</div>
          <div style={{display:"flex",gap:"4px"}}>
            <button className="cpb cpb-danger" onClick={onDelete}
              style={{flex:1,padding:"5px 0",borderRadius:"6px",border:"none",background:"#eb5757",color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.background="#c44"}
              onMouseLeave={e=>e.currentTarget.style.background="#eb5757"}
            >Delete</button>
            <button className="cpb" onClick={()=>setConfirming(false)}
              style={{flex:1,padding:"5px 0",borderRadius:"6px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"11px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── The item catalogue popover: a search box and small drawings, grouped
   Classroom / Science lab / Free shapes (same style as the Add table menu) ── */
function ItemCatalogBody({onAddItem,onAddBench,btnS,menuHead}){
  const[q,setQ]=useState('');
  const needle=q.trim().toLowerCase();
  const match=t=>!needle||`${ROOM_ITEM_TYPES[t].name} ${ROOM_ITEM_TYPES[t].kw}`.toLowerCase().includes(needle);
  const benchMatch=!needle||'lab bench seats workstation table'.includes(needle);
  const secs=ROOM_ITEM_SECTIONS.map(sec=>({...sec,types:sec.types.filter(match)})).filter(sec=>sec.types.length||(sec.id==='lab'&&benchMatch));
  const tile={...btnS,padding:"6px 2px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",minWidth:0};
  const hov={onMouseEnter:e=>e.currentTarget.style.background="#f0f1f4",onMouseLeave:e=>e.currentTarget.style.background="#fff"};
  return(
    <div>
      <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search: sink, eyewash, bin…" title="Search the catalogue by name"
        style={{width:"100%",boxSizing:"border-box",padding:"6px 9px",borderRadius:"7px",border:"1px solid rgba(66,133,244,0.4)",background:"#fff",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",marginBottom:"8px"}}/>
      {secs.length===0&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontStyle:"italic",padding:"6px 2px"}}>Nothing matches "{q}"</div>}
      {secs.map(sec=>(
        <div key={sec.id} style={{marginBottom:"8px"}}>
          <div style={menuHead}>{sec.name}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"4px"}}>
            {sec.id==="lab"&&benchMatch&&(
              <button className="cpb" onClick={onAddBench} title="Add item: a lab bench with seats (a table piece you can seat students at, used for lab setups)" style={tile} {...hov}>
                <PieceThumb kind="bench" size={44}/><span style={{fontSize:"9.5px",color:"rgba(0,0,0,0.55)",lineHeight:1.1,textAlign:"center"}}>Lab bench (seats)</span>
              </button>
            )}
            {sec.types.map(t=>(
              <button className="cpb" key={t} onClick={()=>onAddItem(t)} title={`Add item: ${ROOM_ITEM_TYPES[t].name}${ROOM_ITEM_TYPES[t].fixed?" (part of the room)":""}`} style={tile} {...hov}>
                <ItemThumb type={t} size={44}/><span style={{fontSize:"9.5px",color:"rgba(0,0,0,0.55)",lineHeight:1.1,textAlign:"center"}}>{ROOM_ITEM_TYPES[t].name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── The Rooms popover: the room library (ta-rooms). A room is a shell (walls,
   doors, windows, fixed items) plus saved layouts of its movable furniture.
   Old "Saved layouts" show under "My saved layouts" until the first save moves
   them into the library. ── */
function RoomsPopover({rooms,legacy,link,onSaveNew,onSaveLayout,onUse,onRename,onDuplicate,onDelete,onDeleteLayout,onLoadLegacy,onShare,onAdopt,btnS,menuHead}){
  const[mode,setMode]=useState(null);           // 'new' | 'save'
  const[name,setName]=useState('');
  const[pickRoom,setPickRoom]=useState(null);   // room chosen under "Save layout to room"
  const[confirm,setConfirm]=useState(null);     // {kind,roomId,layoutId?,name?}
  const[renaming,setRenaming]=useState(null);
  const[openRooms,setOpenRooms]=useState(()=>new Set(link?[link.roomId]:[]));
  const linked=link?rooms.find(r=>r.id===link.roomId):null;
  const linkedLayout=linked?.layouts.find(l=>l.id===link?.layoutId);
  const real=rooms.filter(r=>!r.legacy);
  const inp={padding:"6px 8px",borderRadius:"7px",border:"1px solid rgba(66,133,244,0.4)",background:"#fff",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",width:"100%",boxSizing:"border-box"};
  const small={...btnS,fontSize:"10.5px",padding:"4px 7px"};
  const hov={onMouseEnter:e=>e.currentTarget.style.background="#f0f1f4",onMouseLeave:e=>e.currentTarget.style.background="#fff"};
  const toggleOpen=id=>setOpenRooms(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const nameRow=(placeholder,onGo)=>(
    <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
      <input value={name} onChange={e=>setName(e.target.value)} autoFocus placeholder={placeholder} title={placeholder}
        onKeyDown={e=>{if(e.key==='Enter'&&name.trim()){onGo(name);setName('');setMode(null);setPickRoom(null);}if(e.key==='Escape'){setMode(null);setPickRoom(null);}}} style={inp}/>
      <div style={{display:"flex",gap:"4px"}}>
        <button className="cpb cpb-primary" onClick={()=>{if(name.trim()){onGo(name);setName('');setMode(null);setPickRoom(null);}}} title="Save with this name" style={{...btnS,flex:1,background:"#1a1a2e",color:"#fff",border:"none",fontSize:"11px",padding:"5px 0"}}>Save</button>
        <button className="cpb" onClick={()=>{setMode(null);setPickRoom(null);}} title="Cancel" style={{...btnS,fontSize:"11px",padding:"5px 8px"}} {...hov}>Cancel</button>
      </div>
    </div>
  );
  const ask=(text,yes,yesLabel="Yes")=>(
    <div style={{padding:"7px 8px",borderRadius:"8px",background:"#fdf6e8",border:"1px solid rgba(200,150,40,0.3)"}}>
      <div style={{fontSize:"11px",fontWeight:600,color:"#7a5a10",lineHeight:1.4,marginBottom:"6px"}}>{text}</div>
      <div style={{display:"flex",gap:"4px"}}>
        <button className="cpb cpb-primary" onClick={()=>{yes();setConfirm(null);}} title={yesLabel} style={{...btnS,flex:1,background:"#1a1a2e",color:"#fff",border:"none",fontSize:"11px",padding:"5px 0"}}>{yesLabel}</button>
        <button className="cpb" onClick={()=>setConfirm(null)} title="Cancel" style={{...btnS,flex:1,fontSize:"11px",padding:"5px 0"}} {...hov}>Cancel</button>
      </div>
    </div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
      {/* where this class is now */}
      <div style={{fontSize:"11px",color:"rgba(0,0,0,0.5)",lineHeight:1.4,padding:"2px 2px 0"}}>
        {linked?<>This class uses <b style={{color:"#1a1a2e"}}>{linked.name}</b>{linkedLayout?<> · layout <b style={{color:"#1a1a2e"}}>{linkedLayout.name}</b></>:null}</>:"This class isn't using a saved room yet."}
      </div>
      {linked&&link.shellLocal&&(
        <div style={{padding:"7px 8px",borderRadius:"8px",background:"#eaf1fc",border:"1px solid rgba(66,133,244,0.2)",fontSize:"10.5px",color:"#2e4f85",lineHeight:1.4}}>
          This class has its own walls and fixed items.
          <div style={{display:"flex",gap:"4px",marginTop:"5px"}}>
            <button className="cpb" onClick={onShare} title={`Save this class's walls, doors and fixed items into ${linked.name}, so every class that uses it gets them`} style={{...small,flex:1}} {...hov}>Update {linked.name} for every class</button>
          </div>
          <button className="cpb" onClick={onAdopt} title={`Throw away this class's own walls and use ${linked.name}'s again`} style={{...small,width:"100%",marginTop:"4px"}} {...hov}>Use {linked.name}'s shape again</button>
        </div>
      )}

      {/* save */}
      {mode==='new'?nameRow("Room name, e.g. Lab 204",n=>onSaveNew(n)):(
        <button className="cpb" onClick={()=>{setName('');setMode('new');}} title="Save the walls, doors and fixed items of this room, plus the current furniture as its first layout, under a name like Lab 204" style={{...btnS,fontSize:"11.5px",textAlign:"left"}} {...hov}>💾 Save as new room…</button>
      )}
      {real.length>0&&(mode==='save'?(
        <div style={{display:"flex",flexDirection:"column",gap:"4px",padding:"6px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)"}}>
          <div style={menuHead}>Save layout to…</div>
          {!pickRoom?real.map(r=>(
            <button className="cpb" key={r.id} onClick={()=>setPickRoom(r.id)} title={`Save this furniture as a layout of ${r.name}`} style={{...btnS,fontSize:"11.5px",textAlign:"left",display:"flex",justifyContent:"space-between"}} {...hov}><span>{r.name}</span><span>▸</span></button>
          )):(()=>{
            const r=real.find(x=>x.id===pickRoom);if(!r)return null;
            return(
              <>
                <div style={{fontSize:"11px",fontWeight:700,color:"#1a1a2e"}}>{r.name}</div>
                {confirm?.kind==='update'?ask(`Replace layout "${confirm.name}" with the furniture as it is now?`,()=>{onSaveLayout(r.id,confirm.layoutId,null);setMode(null);setPickRoom(null);},"Replace"):(
                  <>
                    {r.layouts.map(l=>(
                      <button className="cpb" key={l.id} onClick={()=>setConfirm({kind:'update',roomId:r.id,layoutId:l.id,name:l.name})} title={`Update layout "${l.name}" with the furniture as it is now (asks first)`} style={{...btnS,fontSize:"11px",textAlign:"left"}} {...hov}>↻ Update "{l.name}"</button>
                    ))}
                    {nameRow("New layout name, e.g. Clusters",n=>onSaveLayout(r.id,null,n))}
                  </>
                )}
              </>
            );
          })()}
        </div>
      ):(
        <button className="cpb" onClick={()=>{setMode('save');setPickRoom(null);setConfirm(null);}} title="Save the furniture as it is now as another layout of a room you've saved (a new layout, or update one)" style={{...btnS,fontSize:"11.5px",textAlign:"left",display:"flex",justifyContent:"space-between"}} {...hov}><span>📐 Save layout to room</span><span>▸</span></button>
      ))}

      {/* the library */}
      {rooms.length>0&&<div style={menuHead}>Rooms</div>}
      {rooms.map(r=>{
        const isOpen=openRooms.has(r.id),isLinked=link?.roomId===r.id;
        return(
          <div key={r.id} style={{borderRadius:"9px",border:`1px solid ${isLinked?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:isLinked?"#f6f9fe":"#fff",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 5px 5px 8px"}}>
              <button className="cpb cpb-ghost" onClick={()=>toggleOpen(r.id)} title="Show or hide this room's layouts" style={{background:"none",border:"none",cursor:"pointer",fontSize:"9px",color:"rgba(0,0,0,0.4)",padding:"2px"}}>{isOpen?"▼":"▶"}</button>
              {renaming===r.id?(
                <input autoFocus defaultValue={r.name} onBlur={e=>{onRename(r.id,e.target.value);setRenaming(null);}} onKeyDown={e=>{if(e.key==='Enter')e.target.blur();if(e.key==='Escape'){e.target.value=r.name;e.target.blur();}}} title="Type the new name, then press Enter" style={{...inp,flex:1,padding:"3px 6px"}}/>
              ):(
                <span style={{flex:1,minWidth:0,fontSize:"12px",fontWeight:700,color:"#1a1a2e",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.name}>{r.legacy?"📁":"🏫"} {r.name}<span style={{fontWeight:500,color:"rgba(0,0,0,0.35)"}}> · {r.layouts.length}</span></span>
              )}
            </div>
            {isOpen&&(
              <div style={{padding:"0 6px 7px",display:"flex",flexDirection:"column",gap:"3px"}}>
                {r.layouts.map(l=>(
                  <div key={l.id} style={{display:"flex",alignItems:"center",gap:"2px",padding:"2px 2px 2px 6px",borderRadius:"6px",background:isLinked&&link.layoutId===l.id?"#eaf1fc":"rgba(0,0,0,0.025)"}}>
                    <span style={{flex:1,minWidth:0,fontSize:"11px",fontWeight:600,color:"#1a1a2e",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={l.name}>{l.name}</span>
                    <button className="cpb cpb-ghost cpb-link" onClick={()=>setConfirm({kind:'use',roomId:r.id,layoutId:l.id,name:l.name})} title={`Use layout "${l.name}": ${r.legacy?"its furniture":"the room's walls and fixed items plus this furniture"} replace this class's room. Students are reseated.`} style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"3px 5px"}}>⤓</button>
                    <button className="cpb cpb-ghost" onClick={()=>setConfirm({kind:'deleteLayout',roomId:r.id,layoutId:l.id,name:l.name})} title={`Delete layout "${l.name}"`} style={{background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"3px 5px"}}>×</button>
                  </div>
                ))}
                {confirm&&confirm.roomId===r.id&&confirm.kind==='use'&&ask(`Replace this class's ${r.legacy?"furniture":"room"} with ${r.legacy?"":`${r.name} · `}${confirm.name}? Students are reseated as closely as their groups allow. Undo brings it back.`,()=>{const lay=r.layouts.find(l=>l.id===confirm.layoutId);if(lay)onUse(r,lay);},"Use it")}
                {confirm&&confirm.roomId===r.id&&confirm.kind==='deleteLayout'&&ask(`Delete layout "${confirm.name}"?`,()=>onDeleteLayout(r.id,confirm.layoutId),"Delete")}
                {confirm&&confirm.roomId===r.id&&confirm.kind==='deleteRoom'&&ask(`Delete ${r.name} and all its layouts? Classes keep their own copy of the room.`,()=>onDelete(r.id),"Delete")}
                {confirm&&confirm.roomId===r.id&&confirm.kind==='useRoom'&&ask(`Replace this class's room with ${r.name}${(r.layouts.find(l=>l.id===link?.layoutId)||r.layouts[0])?` · ${(r.layouts.find(l=>l.id===link?.layoutId)||r.layouts[0]).name}`:""}? Students are reseated. Undo brings it back.`,()=>{const lay=r.layouts.find(l=>l.id===link?.layoutId)||r.layouts[0];if(lay)onUse(r,lay);},"Use it")}
                <div style={{display:"flex",gap:"3px",flexWrap:"wrap",marginTop:"2px"}}>
                  {r.layouts.length>0&&<button className="cpb cpb-primary" onClick={()=>setConfirm({kind:'useRoom',roomId:r.id})} title={r.legacy?"Load the first of these layouts":`Use ${r.name}: load its walls, doors and fixed items with its ${isLinked?"current":"first"} layout`} style={{...small,background:"#1a1a2e",color:"#fff",border:"none"}}>Use room</button>}
                  <button className="cpb" onClick={()=>setRenaming(r.id)} title="Rename this room" style={small} {...hov}>Rename</button>
                  <button className="cpb" onClick={()=>onDuplicate(r.id)} title="Make a copy of this room with all its layouts" style={small} {...hov}>Duplicate</button>
                  <button className="cpb cpb-warn" onClick={()=>setConfirm({kind:'deleteRoom',roomId:r.id})} title="Delete this room from the library (asks first)" style={{...small,color:"#c44"}} {...hov}>Delete</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {rooms.length===0&&legacy.length===0&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontStyle:"italic",padding:"2px"}}>No saved rooms yet. Build the room, then Save as new room.</div>}

      {/* the old Saved layouts, until the first save brings them into the library */}
      {legacy.length>0&&(
        <div>
          <div style={menuHead}>My saved layouts</div>
          <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
            {legacy.map(l=><LayoutCard key={l.id} layout={l} onLoad={()=>onLoadLegacy(l)}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* "Mark as station": a numbered badge on the map for an item or a table (a station-rotation setup uses these) */
function StationEditor({station,onToggle,onSet,btnS}){
  const f={padding:"5px 7px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",boxSizing:"border-box"};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
      <button className={`cpb${station?" on":""}`} onClick={onToggle} title={station?"Take this off the station list":"Mark this as a station: it gets a numbered badge on the map, used for station rotations"}
        style={{...btnS,background:station?"#fff6dc":"#fff",color:station?"#8a6200":"rgba(0,0,0,0.5)",border:`1px solid ${station?"rgba(200,150,20,0.4)":"rgba(0,0,0,0.08)"}`}}>{station?`★ Station ${station.n}`:"☆ Mark as station"}</button>
      {station&&(
        <div style={{display:"flex",gap:"4px"}}>
          <input key={`n${station.n}`} type="number" min={1} max={99} defaultValue={station.n} title="Station number" style={{...f,width:"46px"}}
            onBlur={e=>{const n=Math.max(1,Math.min(99,parseInt(e.target.value)||station.n));if(n!==station.n)onSet({n});}} onKeyDown={e=>{if(e.key==='Enter')e.target.blur();e.stopPropagation();}}/>
          <input key={`s${station.name||''}`} defaultValue={station.name||''} maxLength={24} placeholder="Name, e.g. Circuits" title="An optional name for this station" style={{...f,flex:1,minWidth:0}}
            onBlur={e=>{if(e.target.value!==(station.name||''))onSet({name:e.target.value.slice(0,24)});}} onKeyDown={e=>{if(e.key==='Enter')e.target.blur();e.stopPropagation();}}/>
        </div>
      )}
    </div>
  );
}

/* ── Manage groups: rename any group from one place, not just the selected one ── */
/* ══════════════════════════════════════════════════════════
   CLASS SETUPS (Phase 5) — the tab row, its ⋯ menu, the New setup
   dialog, and the faded look of furniture a setup doesn't use.
   ══════════════════════════════════════════════════════════ */
const USE_LABELS=[['desk','Tables'],['workstation','Workstations'],['both','Both']];
const useHelp=k=>k==='desk'?'Generate into tables only (lab benches are left free)':k==='workstation'?'Generate into workstations only, e.g. lab benches':'Generate into tables and workstations';
const setupUseText=s=>({desk:'tables',workstation:'workstations',both:'tables and workstations'})[useKey(s?.use)];
/* Tables / Workstations / Both, as one segmented control */
function SetupUsePicker({value,onChange,small=false}){
  return(
    <div style={{display:"flex",gap:"4px"}}>
      {USE_LABELS.map(([k,lbl])=>(
        <button key={k} className={cpc("",value===k)} onClick={()=>onChange(k)} title={useHelp(k)}
          style={{flex:1,padding:small?"4px 0":"6px 0",borderRadius:"8px",fontSize:small?"11px":"12px",fontWeight:value===k?700:600}}>{lbl}</button>
      ))}
    </div>
  );
}
/* The tab row: one click switches setup. With `manage` (Manage Seating) each tab
   has a ⋯ menu, tabs drag to reorder, and ＋ adds a setup. */
function SetupTabs({setups,onSwitch,manage=false,onNew,onReorder,renderMenu,extra}){
  const[dragId,setDragId]=useState(null);
  const[overId,setOverId]=useState(null);
  const[menu,setMenu]=useState(null); // {id,left,top}
  const menuRef=useRef(null);
  useEffect(()=>{
    if(!menu)return;
    const away=e=>{if(menuRef.current?.contains(e.target)||e.target.closest?.('[data-setup-menu-btn]'))return;setMenu(null);};
    const esc=e=>{if(e.key==='Escape')setMenu(null);};
    document.addEventListener('mousedown',away);window.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('mousedown',away);window.removeEventListener('keydown',esc);};
  },[menu]);
  if(!setups)return null;
  const drop=targetId=>{if(dragId&&dragId!==targetId)onReorder?.(dragId,targetId);setDragId(null);setOverId(null);};
  return(
    <div role="tablist" aria-label="Class setups" style={{display:"flex",alignItems:"center",gap:"6px",minWidth:0}}>
      {setups.list.map(s=>{
        const on=s.id===setups.activeId;
        return(
          <div key={s.id} draggable={manage} data-setup-tab={s.id}
            onDragStart={e=>{if(!manage)return;setDragId(s.id);try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',s.id);}catch(err){}}}
            onDragOver={e=>{if(!dragId)return;e.preventDefault();if(overId!==s.id)setOverId(s.id);}}
            onDragLeave={()=>{if(overId===s.id)setOverId(null);}}
            onDrop={e=>{e.preventDefault();drop(s.id);}}
            onDragEnd={()=>{setDragId(null);setOverId(null);}}
            style={{display:"flex",alignItems:"center",flexShrink:0,borderRadius:"999px",opacity:dragId===s.id?0.45:1,
              boxShadow:overId===s.id&&dragId!==s.id?"-3px 0 0 var(--cp-sel)":"none"}}>
            <button role="tab" aria-selected={on} data-setup={s.name} className={cpc("tab",on)} onClick={()=>{if(!on)onSwitch(s.id);}}
              title={`${on?'Showing':'Switch to'} ${s.name}: its own seating, generated into ${setupUseText(s)}${s.fromGroups?`. Made from Groups on ${fmtSetupDate(s.fromGroups.at)}`:''}${manage?'. Drag to reorder':''}`}
              style={{display:"flex",alignItems:"center",gap:"5px",padding:manage?"4px 4px 4px 11px":"4px 12px",fontSize:"12.5px",whiteSpace:"nowrap","--tab-fill":"var(--cpb-sunny)",cursor:on?"default":"pointer"}}>
              <span aria-hidden="true">{s.icon}</span><span style={{maxWidth:"150px",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</span>
              {manage&&(
                <span data-setup-menu-btn role="button" tabIndex={0} aria-label={`More for ${s.name}`}
                  title={`${s.name}: rename, change icon, use for, duplicate${s.id===REGULAR_SETUP?'':', delete'}`}
                  onClick={e=>{e.stopPropagation();if(menu?.id===s.id){setMenu(null);return;}const r=e.currentTarget.getBoundingClientRect();setMenu({id:s.id,left:Math.min(r.left,window.innerWidth-250),top:r.bottom+6});}}
                  onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.click();}}}
                  style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"20px",height:"20px",borderRadius:"50%",fontSize:"13px",fontWeight:800,lineHeight:1,marginLeft:"2px",
                    background:menu?.id===s.id?"rgba(43,33,24,0.14)":"transparent",color:"rgba(43,33,24,0.6)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(43,33,24,0.12)"} onMouseLeave={e=>e.currentTarget.style.background=menu?.id===s.id?"rgba(43,33,24,0.14)":"transparent"}>⋯</span>
              )}
            </button>
          </div>
        );
      })}
      {manage&&<button className={cpc("dashed")} onClick={onNew} title="New class setup, e.g. Lab or Lab partners: its own seating that never changes Regular's"
        style={{flexShrink:0,padding:"4px 11px",borderRadius:"999px",fontSize:"13px",fontWeight:800,lineHeight:1.2}}>＋</button>}
      {extra}
      {menu&&renderMenu&&createPortal(
        <div ref={menuRef} className="cp-pop" style={{position:"fixed",left:menu.left,top:menu.top,zIndex:520,borderRadius:"10px",padding:"8px",width:"236px",fontFamily:"'Source Sans 3',sans-serif"}}>
          {renderMenu(setups.list.find(x=>x.id===menu.id),()=>setMenu(null))}
        </div>,
        document.body
      )}
    </div>
  );
}
/* What's inside a tab's ⋯ menu */
function SetupMenuBody({setup,canDelete,onRename,onIcon,onUse,onDuplicate,onDelete,onClose}){
  const[name,setName]=useState(setup?.name||'');
  const[asking,setAsking]=useState(false);
  if(!setup)return null;
  const head={fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.35)",margin:"8px 2px 4px"};
  const commitName=()=>{const v=name.trim();if(v&&v!==setup.name)onRename(v);};
  return(
    <div onMouseDown={e=>e.stopPropagation()}>
      <div style={{...head,marginTop:"2px"}}>Rename</div>
      <input value={name} maxLength={28} onChange={e=>setName(e.target.value)} onBlur={commitName}
        onKeyDown={e=>{if(e.key==='Enter'){commitName();onClose();}e.stopPropagation();}} title="The setup's name on its tab"
        style={{width:"100%",boxSizing:"border-box",padding:"6px 8px",borderRadius:"7px",fontSize:"12.5px",fontWeight:600,fontFamily:"'Source Sans 3',sans-serif",outline:"none"}}/>
      <div style={head}>Icon</div>
      <div style={{display:"flex",gap:"3px",flexWrap:"wrap"}}>
        {SETUP_ICONS.map(ic=><button key={ic} className={cpc("ghost",setup.icon===ic)} onClick={()=>onIcon(ic)} title={`Use ${ic} as the icon`} style={{width:"28px",height:"28px",borderRadius:"7px",fontSize:"15px",padding:0,lineHeight:1}}>{ic}</button>)}
      </div>
      <div style={head}>Use for seating</div>
      <SetupUsePicker value={useKey(setup.use)} onChange={k=>onUse(k)} small/>
      <div style={{height:"1px",background:"rgba(0,0,0,0.08)",margin:"10px 0 6px"}}/>
      <button className={cpc("item")} onClick={()=>{onDuplicate();onClose();}} title="Make a copy of this setup, seating and all" style={{width:"100%",textAlign:"left",padding:"6px 8px",borderRadius:"7px",fontSize:"12.5px",fontWeight:600}}>⧉ Duplicate</button>
      {canDelete&&(!asking?(
        <button className={cpc("item")} onClick={()=>setAsking(true)} title="Delete this setup (it asks first)" style={{width:"100%",textAlign:"left",padding:"6px 8px",borderRadius:"7px",fontSize:"12.5px",fontWeight:600,color:"var(--cpb-bad)"}}>🗑 Delete…</button>
      ):(
        <div style={{marginTop:"4px",padding:"8px",borderRadius:"8px",background:"#fdeeed",border:"1px solid rgba(200,60,60,0.2)"}}>
          <div style={{fontSize:"11.5px",color:"#a33",fontWeight:600,lineHeight:1.4,marginBottom:"6px"}}>Delete "{setup.name}"? Its seating is kept in the trash for 30 days. Regular is not touched.</div>
          <div style={{display:"flex",gap:"4px"}}>
            <button className={cpc("danger")} onClick={()=>{onDelete();onClose();}} title={`Yes, delete ${setup.name}`} style={{flex:1,padding:"5px 0",borderRadius:"7px",fontSize:"12px",fontWeight:700}}>Delete</button>
            <button className={cpc()} onClick={()=>setAsking(false)} title="Keep this setup" style={{flex:1,padding:"5px 0",borderRadius:"7px",fontSize:"12px",fontWeight:600}}>Cancel</button>
          </div>
        </div>
      ))}
      {!canDelete&&<div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.4)",padding:"4px 8px",lineHeight:1.35}}>Regular can be renamed but not deleted.</div>}
    </div>
  );
}
/* New setup: name + icon, what it starts from, and which furniture it seats students at */
function NewSetupDialog({current,rooms,onCreate,onClose}){
  const[name,setName]=useState('');
  const[icon,setIcon]=useState('🧪');
  const[from,setFrom]=useState('copy'); // 'copy' | 'copy-students' | 'room' | 'empty'
  const roomChoices=(rooms||[]).flatMap(r=>(r.layouts||[]).map(l=>({roomId:r.id,layoutId:l.id,label:`${r.name} · ${l.name}`})));
  const[roomPick,setRoomPick]=useState(roomChoices[0]?`${roomChoices[0].roomId}|${roomChoices[0].layoutId}`:'');
  const[use,setUse]=useState(null); // null = follow the name ("lab" → Workstations)
  const useNow=use||useKey(useForName(name));
  const[busy,setBusy]=useState(false);
  const opt=(k,label,help,disabled=false)=>(
    <button className={cpc("item",from===k)} disabled={disabled} onClick={()=>setFrom(k)} title={help}
      style={{width:"100%",textAlign:"left",padding:"7px 9px",borderRadius:"8px",fontSize:"12.5px",fontWeight:from===k?700:600,display:"flex",alignItems:"center",gap:"8px"}}>
      <span style={{width:"14px",height:"14px",borderRadius:"50%",border:"1.5px solid #2b2118",background:from===k?"#2b2118":"transparent",boxShadow:"inset 0 0 0 2.5px var(--cpb-bg)",flexShrink:0}}/>{label}
    </button>
  );
  const create=async()=>{
    if(busy)return;setBusy(true);
    const[roomId,layoutId]=roomPick.split('|');
    await onCreate({name:name.trim()||'New setup',icon,use:SETUP_USES[useNow],
      ...(from==='copy'||from==='copy-students'?{copy:true,withStudents:from==='copy-students'}:{}),
      ...(from==='room'&&roomId?{fromRoom:{roomId,layoutId}}:{})});
  };
  const head={fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.35)",margin:"12px 2px 5px"};
  return createPortal(
    <div onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(20,14,8,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Sans 3',sans-serif"}}>
      <div className="cp-pop" role="dialog" aria-label="New class setup" style={{width:"372px",maxWidth:"calc(100vw - 32px)",maxHeight:"calc(100vh - 40px)",overflowY:"auto",borderRadius:"14px",padding:"16px 18px"}}>
        <div style={{fontSize:"16px",fontWeight:800,color:"#2b2118"}}>New class setup</div>
        <div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.5)",marginTop:"2px",lineHeight:1.4}}>Its own seating, e.g. for lab partners or a project. Switching tabs never changes another setup's seating.</div>
        <div style={head}>Name and icon</div>
        <input autoFocus value={name} maxLength={28} placeholder="e.g. Lab, Lab partners, Rocket project" title="The name on the setup's tab"
          onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')create();if(e.key==='Escape')onClose();e.stopPropagation();}}
          style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:"8px",fontSize:"13.5px",fontWeight:600,fontFamily:"'Source Sans 3',sans-serif",outline:"none"}}/>
        <div style={{display:"flex",gap:"4px",marginTop:"7px"}}>
          {SETUP_ICONS.map(ic=><button key={ic} className={cpc("",icon===ic)} onClick={()=>setIcon(ic)} title={`Use ${ic} as the icon`} style={{width:"34px",height:"32px",borderRadius:"8px",fontSize:"16px",padding:0,lineHeight:1}}>{ic}</button>)}
        </div>
        <div style={head}>Start from</div>
        <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
          {opt('copy',`A copy of ${current?.icon||''} ${current?.name||'this setup'}: room and furniture, no students`,'Same room and tables, everyone unseated, ready to generate')}
          {opt('copy-students',`A copy of ${current?.name||'this setup'} with students in their seats`,'Same room, tables and seating')}
          {opt('room','A room layout from 🏫 Rooms',roomChoices.length?'Use a room and one of its saved layouts':'Save a room in 🏫 Rooms first',!roomChoices.length)}
          {from==='room'&&roomChoices.length>0&&(
            <select value={roomPick} onChange={e=>setRoomPick(e.target.value)} title="Which room and layout" style={{margin:"2px 0 4px 30px",padding:"5px 8px",borderRadius:"7px",fontSize:"12.5px",fontFamily:"'Source Sans 3',sans-serif"}}>
              {roomChoices.map(c=><option key={`${c.roomId}|${c.layoutId}`} value={`${c.roomId}|${c.layoutId}`}>{c.label}</option>)}
            </select>
          )}
          {opt('empty','An empty room','No furniture yet: add tables or benches yourself')}
        </div>
        <div style={head}>Use for seating</div>
        <SetupUsePicker value={useNow} onChange={setUse}/>
        <div style={{fontSize:"11px",color:"rgba(0,0,0,0.45)",marginTop:"5px",lineHeight:1.35}}>Randomize only seats students at {({desk:'tables (lab benches stay free)',workstation:'workstations such as lab benches',both:'tables and workstations'})[useNow]}. A table set to "Both" counts for either.</div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:"6px",marginTop:"16px"}}>
          <button className={cpc()} onClick={onClose} title="Don't make a new setup" style={{padding:"8px 14px",borderRadius:"9px",fontSize:"12.5px",fontWeight:600}}>Cancel</button>
          <button className={cpc("primary")} onClick={create} disabled={busy} title="Make the setup and switch to it" style={{padding:"8px 16px",borderRadius:"9px",fontSize:"12.5px",fontWeight:700}}>Create setup</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
/* Furniture this setup doesn't use: a pale wash and a light hatch over the table and
   its chairs (the drawing underneath is left alone). Students already sitting there
   stay put; generating just doesn't put anyone new there. */
const UnusedFurniture=({pieces,slots,offIds,setupName,hint=false})=>{
  if(!offIds?.size)return null;
  const ps=(pieces||[]).filter(p=>offIds.has(p.id));
  if(!ps.length)return null;
  const wash={fill:"var(--cp-floor)",fillOpacity:0.5};
  return(
    <svg width="1" height="1" style={{position:"absolute",left:0,top:0,overflow:"visible",pointerEvents:"none",zIndex:1}}>
      <defs>
        <pattern id="cp-hatch-off" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(-38)">
          <line x1="0" y1="3.5" x2="7" y2="3.5" style={{stroke:"var(--cp-ink)",strokeOpacity:0.32,strokeWidth:1.1}}/>
        </pattern>
      </defs>
      {ps.map(p=>{
        const w=pieceToWorld(p);
        const shape=(st,key)=>w.circle?<circle key={key} cx={w.center[0]} cy={w.center[1]} r={w.circle+1} style={st}/>:<polygon key={key} points={w.poly.map(q=>q.join(",")).join(" ")} style={{...st,strokeLinejoin:"round"}}/>;
        return(
          <g key={p.id} data-cp="unused" style={{pointerEvents:hint?"all":"none"}}>
            {hint&&<title>{`Not used in ${setupName}`}</title>}
            {(slots||[]).filter(sl=>sl.pieceId===p.id&&sl.state==='on').map(sl=><circle key={sl.key} cx={sl.chair.x} cy={sl.chair.y} r={15} style={wash}/>)}
            {shape({...wash,stroke:"var(--cp-floor)",strokeWidth:3},'w')}
            {shape({fill:"url(#cp-hatch-off)"},'h')}
          </g>
        );
      })}
    </svg>
  );
};

function ManageGroupsModal({groups,onRename,onDelete,onClose,isTable}){
  const inp={padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:500,outline:"none",fontFamily:"'Source Sans 3',sans-serif"};
  const[confirmDelete,setConfirmDelete]=useState(null); // groupId pending a second click
  return(
    <div className="cp-pop" style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"360px",maxHeight:"80vh",overflowY:"auto",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage table groups</h2>
        <button className="cpb cpb-ghost" onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button>
      </div>
      {groups.length===0?(
        <p style={{fontSize:"12.5px",color:"rgba(0,0,0,0.35)",lineHeight:1.6,margin:0}}>No table groups yet — group seats together on the canvas first, then come back here to name or delete them.</p>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {groups.map(g=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <input defaultValue={g.label||''} onBlur={e=>onRename(g.id,e.target.value)} onKeyDown={e=>{if(e.key==='Enter')e.target.blur();}} placeholder="Table group name" style={{...inp,flex:1,minWidth:0}}/>
              <span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",flexShrink:0}}>{g.seatIds.length} seat{g.seatIds.length!==1?'s':''}</span>
              {isTable?.(g)?(
                /* a table made of pieces is a group because it's one table — split it on the canvas instead */
                <span title="This group is a table. To split it, pick the table on the canvas and use Separate, or Alt-drag a piece off" style={{flexShrink:0,fontSize:"11px",color:"rgba(0,0,0,0.3)",fontWeight:600,padding:"6px 2px"}}>table</span>
              ):confirmDelete===g.id?(
                <button className="cpb cpb-danger" onClick={()=>{onDelete(g.id);setConfirmDelete(null);}} title="Click again to confirm — seats stay, they just won't be grouped together anymore"
                  style={{flexShrink:0,padding:"6px 9px",borderRadius:"7px",border:"1px solid rgba(200,60,60,0.3)",background:"#fdeeed",color:"#c44",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                >Confirm?</button>
              ):(
                <button className="cpb cpb-ghost cpb-bad" onClick={()=>setConfirmDelete(g.id)} title="Delete this group — seats stay, they just won't be grouped together anymore"
                  style={{flexShrink:0,background:"none",border:"none",color:"rgba(0,0,0,0.3)",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:"6px 2px",fontFamily:"'Source Sans 3',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.color="#eb5757"} onMouseLeave={e=>e.currentTarget.style.color="rgba(0,0,0,0.3)"}
                >Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Manage Tags — recolour or delete any tag in play for this class,
   including "orphan" tags that ended up on a seat without being in the
   class's own tag list (e.g. carried in from a different class's saved
   layout). Colours are per-class and override stCol's hashed default
   everywhere a tag is drawn (seat map, chip list, toggle buttons, Applied
   summary). ── */
function ManageSeatTagsModal({avTags,orphanTags,colorFor,onSetColor,onDelete,onAdd,matchCountFor,students,onToggleStudent,onClose}){
  const allTags=[...avTags.map(t=>({name:t,orphan:false})),...orphanTags.map(t=>({name:t,orphan:true}))];
  const[expanded,setExpanded]=useState(null); // tag name whose student checklist is open
  const[studentFilter,setStudentFilter]=useState(''); // type-to-filter by name — helps in big classes
  const[newTag,setNewTag]=useState('');
  const handleAdd=()=>{
    const t=newTag.trim();
    if(!t||avTags.includes(t))return;
    onAdd(t);
    setNewTag('');
    setExpanded(t); // jump straight to assigning students — the whole point of adding it here
    setStudentFilter('');
  };
  return(
    <div className="cp-pop" style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"420px",maxHeight:"85vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}><h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage Tags</h2><button className="cpb cpb-ghost" onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button></div>
      <p style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"14px",lineHeight:1.5}}>Add a tag, pick its colour, and choose which students have it — it'll match everywhere: the seat map, the tag list, and per-seat toggles. Tags marked "not in this class's list" ended up on a seat without being added here (often from a loaded layout); delete them if they're not relevant, or leave them — there's no harm keeping a tag around for reuse later.</p>
      <div style={{display:"flex",gap:"4px",marginBottom:"16px"}}>
        <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()} placeholder="New tag…" style={{flex:1,padding:"7px 9px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.09)",background:"#f8f9fb",fontSize:"12.5px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e"}}/>
        <button className="cpb cpb-primary" onClick={handleAdd} style={{padding:"7px 14px",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>+ Add</button>
      </div>
      {allTags.length===0?(
        <div style={{padding:"20px 0",textAlign:"center",color:"rgba(0,0,0,0.25)",fontSize:"12.5px",fontStyle:"italic"}}>No tags yet — add one above.</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"8px",overflowY:"auto",maxHeight:"360px",paddingRight:"2px"}}>
          {allTags.map(({name,orphan})=>{
            const tc=colorFor(name);
            const matchCount=matchCountFor(name);
            const isOpen=expanded===name;
            return(
              <div key={name} style={{padding:"9px 10px",borderRadius:"10px",background:"#fafbfc",border:"1px solid rgba(0,0,0,0.05)",flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}>
                  <span style={{fontSize:"11px",fontWeight:700,padding:"3px 9px",borderRadius:"6px",background:tc.b,color:tc.t}}>{name}</span>
                  {orphan&&<span style={{fontSize:"9px",color:"rgba(0,0,0,0.35)",fontWeight:600}}>not in this class's list</span>}
                  {!orphan&&matchCount===0&&<span style={{fontSize:"9px",color:"#c44",fontWeight:700}}>⚠ 0 students</span>}
                  <button className="cpb cpb-ghost cpb-bad" onClick={()=>onDelete(name)} title={`Delete "${name}" — removes it from every seat and every student`} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:0}}
                    onMouseEnter={e=>e.currentTarget.style.color="#eb5757"} onMouseLeave={e=>e.currentTarget.style.color="rgba(0,0,0,0.25)"}
                  >Delete</button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"8px"}}>
                  {COLORS.map((c,idx)=>{
                    const active=colorFor(name).t===c.text;
                    return(
                      <button key={idx} onClick={()=>onSetColor(name,idx)} title={active?"Current colour":"Use this colour"} style={{width:"18px",height:"18px",borderRadius:"50%",background:c.bg,border:active?`2px solid ${c.text}`:"1.5px solid rgba(0,0,0,0.08)",cursor:"pointer",padding:0}}/>
                    );
                  })}
                </div>
                <button className="cpb cpb-ghost cpb-link" onClick={()=>{setExpanded(isOpen?null:name);setStudentFilter('');}} style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"10.5px",fontWeight:700,padding:0}}>
                  {isOpen?'▾':'▸'} Students ({matchCount})
                </button>
                {isOpen&&(()=>{
                  const list=students||[];
                  const filtered=studentFilter.trim()
                    ?list.filter(s=>s.name.toLowerCase().includes(studentFilter.trim().toLowerCase()))
                    :list;
                  return(
                  <div style={{marginTop:"7px",borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:"6px"}}>
                    {list.length>3&&(
                      <input value={studentFilter} onChange={e=>setStudentFilter(e.target.value)} autoFocus
                        placeholder="🔍 Type a name to filter…"
                        style={{width:"100%",padding:"5px 8px",borderRadius:"6px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",fontSize:"11px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",boxSizing:"border-box",marginBottom:"5px"}}
                      />
                    )}
                    <div style={{display:"flex",flexDirection:"column",gap:"2px",maxHeight:"160px",overflowY:"auto",paddingRight:"2px"}}>
                    {list.length===0&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontStyle:"italic"}}>No students in this class.</div>}
                    {list.length>0&&filtered.length===0&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontStyle:"italic"}}>No match for "{studentFilter}"</div>}
                    {filtered.map(s=>{
                      const has=(s.tags||[]).includes(name);
                      return(
                        <label key={s.id} style={{display:"flex",alignItems:"center",gap:"7px",fontSize:"11.5px",color:"#1a1a2e",padding:"3px 2px",cursor:"pointer"}}>
                          <input type="checkbox" checked={has} onChange={()=>onToggleStudent(s.id,name,has)} style={{cursor:"pointer"}}/>
                          {s.name}
                        </label>
                      );
                    })}
                    </div>
                  </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
      <button className="cpb cpb-primary" onClick={onClose} style={{width:"100%",padding:"12px",borderRadius:"12px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",marginTop:"16px",flexShrink:0}}>Done</button>
    </div>
  );
}

/* "Match chairs to table colour": per class, kept under its own key (cp-chairmatch-<classId>) so it
   needs no change to the saved layout. The editor and the class Seating view share it through an event. */
function useChairsMatch(classId){
  const[on,setOn]=useState(false);
  useEffect(()=>{
    setOn(false);if(!classId)return;
    let live=true;
    load(`cp-chairmatch-${classId}`,false).then(v=>{if(live)setOn(!!v);});
    const h=e=>{if(e.detail?.classId===classId)setOn(!!e.detail.on);};
    window.addEventListener('cp-chairmatch',h);
    return()=>{live=false;window.removeEventListener('cp-chairmatch',h);};
  },[classId]);
  const set=useCallback(v=>{setOn(v);if(!classId)return;save(`cp-chairmatch-${classId}`,v);window.dispatchEvent(new CustomEvent('cp-chairmatch',{detail:{classId,on:v}}));},[classId]);
  return[on,set];
}
function ManageSeatingPanel({activeClass,setups,onChangeSetups,checklist,onChangeChecklist,flagsByStudent,now,showFlags,onSetShowFlags,onGoToChecklist,onUpdateStudentTags,rotation,onStartRotation}){
  /* Class setups (Phase 5): which setup is showing and where its seating is saved.
     slKey stays null until this class's setups have loaded, and nothing loads or saves till then. */
  const setup=setups?setups.list.find(x=>x.id===setups.activeId)||null:null;
  const setupId=setup?.id||null;
  const isRegular=!setupId||setupId===REGULAR_SETUP;
  const slKey=activeClass?.id&&setups?setupSlKey(activeClass.id,setupId):null;
  const classLevelRef=useRef(null); // the class's tags+rules as loaded, so a setup only writes them back to sl-<class> when they really changed
  const pendingSaveRef=useRef(null); // {key,obj,regular,classId} waiting for the 400 ms save delay
  const[seats,setSeats]=useState([]);
  const[groups,setGroups]=useState([]);
  const[roomItems,setRoomItems]=useState([]);
  /* Table pieces (shapes that rotate and snap together) and the edges joining
     them. Optional and additive: seats made by a piece carry pieceId+slot,
     every other seat is drawn and behaves exactly as before. */
  const[pieces,setPieces]=useState([]);
  const[joins,setJoins]=useState([]);
  const[selPieces,setSelPieces]=useState(new Set()); // pieces picked on the canvas (a whole cluster, or one with Alt)
  const[focusPiece,setFocusPiece]=useState(null);    // the piece actually clicked, for Separate / seats / label
  const[pieceDrag,setPieceDrag]=useState(null);      // {ids, steps:[transform…], snap} while moving/rotating
  const[editSeats,setEditSeats]=useState(false);     // click chairs to switch seats on/off
  const[pieceDeleteAsk,setPieceDeleteAsk]=useState(false);
  const[notice,setNotice]=useState(null);            // short message, e.g. who went back to the student list
  const noticeTimer=useRef(null);
  const[selRoomId,setSelRoomId]=useState(null);
  /* Room builder (Phase 4). walls/openings/roomLink are part of the saved class
     layout (optional fields); the rest is just what's happening on screen. */
  const[walls,setWalls]=useState([]);               // [{id,x1,y1,x2,y2}]
  const[openings,setOpenings]=useState([]);         // [{id,type,wallId,t,width,flip,swing}]
  const[roomLink,setRoomLink]=useState(null);       // {roomId,layoutId,shellLocal?} when this class uses a library room
  const[roomMode,setRoomMode]=useState(false);      // "Edit room": walls/openings/items editable, tables dimmed
  const[selWall,setSelWall]=useState(null);
  const[selOpening,setSelOpening]=useState(null);
  const[wallDraft,setWallDraft]=useState(null);     // the wall being drawn: {x1,y1,x2,y2}
  const[openingDrag,setOpeningDrag]=useState(null);  // a door/window being carried from the palette: {type,x,y,hit}
  const[rooms,setRooms]=useState([]);               // the room library (ta-rooms)
  const[shellAsk,setShellAsk]=useState(false);       // "Update <room> for every class?" is showing
  const shellAnswerRef=useRef(null);                 // 'yes' once Tom agreed for this class; later shell edits then follow along
  const shellEditRef=useRef(null);
  const roomRef=useRef({});                          // what the canvas mouse-down handler needs (it is built once per zoom level)
  const[showCatalog,setShowCatalog]=useState(false);
  const[drawTool,setDrawTool]=useState('wall');       // what dragging on the floor draws in Edit room: 'wall' | 'line'
  const[avTags,setAvTags]=useState(DEFAULT_SEAT_TAGS);
  const[rules,setRules]=useState([]);   // [{id,type:'apart'|'together',aId,bId}]
  const[savedLayouts,setSavedLayouts]=useState([]);
  const[showSaveLayout,setShowSaveLayout]=useState(false);
  const[seatHistory,setSeatHistory]=useState([]);   // last 10 confirmed seating arrangements for this class
  const[layoutName,setLayoutName]=useState('');
  const[showLoadLayout,setShowLoadLayout]=useState(false);
  const[showManageGroups,setShowManageGroups]=useState(false);
  const[rulesOpen,setRulesOpen]=useState(false); // "Classroom rules" — remembers open/closed across visits
  /* Left column is dense — these collapse into single-button popovers instead
     of always-visible grids/lists/toggles, so the sidebar reads calmer. Each
     popover floats via a portal (see useAnchoredMenu) so it can spill out
     over the seating canvas instead of being clipped at the sidebar's edge. */
  const addTableMenu=useAnchoredMenu();
  const roomMenu=useAnchoredMenu(); // the item catalogue
  const randomizeOptionsMenu=useAnchoredMenu();
  const layoutsMenu=useAnchoredMenu();
  const arrangementsMenu=useAnchoredMenu();
  const stationsMenu=useAnchoredMenu(); // 🔄 Stations (Phase 7)
  const[startRot,setStartRot]=useState(null); // the groups chosen in Stations, while the Start rotation dialog is open
  const convertMenu=useAnchoredMenu();
  /* Undo — one committed-state stack per class, session-only. doSave (below)
     pushes the state that was current just before each change. */
  const undoStackRef=useRef([]);
  const lastCommittedRef=useRef(null);
  const[canUndo,setCanUndo]=useState(false);
  /* Dirty-tracking for the "you haven't saved/recorded this yet" prompts —
     baselines reset whenever the room structure or seating is explicitly
     saved/loaded/confirmed, and compared against on the next load attempt. */
  const roomBaselineRef=useRef(null);
  const seatingBaselineRef=useRef(null);
  const[pendingLayoutLoad,setPendingLayoutLoad]=useState(null); // {template,layoutDirty,seatingDirty}
  const[pendingArrangementLoad,setPendingArrangementLoad]=useState(null); // {entry,mismatched,seatingDirty}
  useEffect(()=>{load('classroom-rules-open',false).then(v=>setRulesOpen(!!v));},[]);
  const toggleRulesOpen=()=>{const next=!rulesOpen;setRulesOpen(next);save('classroom-rules-open',next);};
  const[nameClick,setNameClick]=useState(null); // {studentId, name, x, y} — click a seated student's name for their tags + outstanding checklist items
  const closeNameClick=()=>setNameClick(null);
  const toggleStudentTagHere=(studentId,tag,has)=>{
    const student=activeClass?.students.find(s=>s.id===studentId);if(!student)return;
    const nextTags=has?(student.tags||[]).filter(t=>t!==tag):[...(student.tags||[]),tag];
    onUpdateStudentTags?.(activeClass.id,studentId,nextTags);
  };
  useEffect(()=>{
    if(!nameClick)return;
    const h=()=>closeNameClick();
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[nameClick]);
  const[tagColors,setTagColors]=useState({});   // {tagName: index into COLORS} — per-class custom overrides
  const[showManageTags,setShowManageTags]=useState(false);
  const[sel,setSel]=useState(new Set());
  const[selType,setSelType]=useState('group');
  const[dd,setDd]=useState(null);
  const[tagConfirm,setTagConfirm]=useState(null);
  const[groupMergeChoice,setGroupMergeChoice]=useState(null); // {seatIds, groupIds, tidy} — set when "Group" spans 2+ existing groups, or touches none while other groups exist to offer joining
  const[newGroupMergeName,setNewGroupMergeName]=useState('');
  const[smartShuffle,setSmartShuffle]=useState(false);
  const[chairsMatch,setChairsMatch]=useChairsMatch(activeClass?.id);
  const[hardTagRules,setHardTagRules]=useState(true); // true = seat stays empty rather than break a tag rule; false = fill every seat, breaking tag rules if needed
  const[randomizeConflicts,setRandomizeConflicts]=useState(null); // apart/together rules the last Randomize couldn't satisfy; null = hasn't run yet
  useEffect(()=>{load('seating-rand-opts',{}).then(o=>{if(o?.smartShuffle!=null)setSmartShuffle(!!o.smartShuffle);if(o?.hardTagRules!=null)setHardTagRules(!!o.hardTagRules);});},[]); // shared with the Seating tab's Randomise
  const[seatPairingHistory,setSeatPairingHistory]=useState({});
  const[phMode,setPhMode]=useState('combined'); // 'combined' | 'separate' — set in Manage Class
  const[zoom,setZoom]=useState(1); // trackpad pinch-to-zoom on the canvas; 1 = 100%
  const ZOOM_MIN=0.4,ZOOM_MAX=2.2;
  const canvasRef=useRef(null);
  const innerCanvasRef=useRef(null); // the zoomed content div itself — see toCanvasCoords
  const saveTimer=useRef(null);

  /* Screen (clientX/Y) → data-space canvas coordinates. Measured off the inner
     content div's own bounding rect rather than the outer scroll container's,
     because the content is flex-centered within that container whenever it's
     smaller than the panel — so "container left edge + scrollLeft" is no longer
     the content's origin. The inner rect already reflects wherever the browser
     actually put it (centered or not, scrolled or not, zoomed or not). */
  const toCanvasCoords=(clientX,clientY)=>{
    const el=innerCanvasRef.current;
    if(!el)return{x:0,y:0};
    const r=el.getBoundingClientRect();
    return{x:(clientX-r.left)/zoom,y:(clientY-r.top)/zoom};
  };

  /* ── Center canvas on content ── */
  const centerCanvas=useCallback((s,ri,pc)=>{
    const canvas=canvasRef.current;
    if(!canvas||!s.length)return;
    const pb=pc?.length?piecesBounds(pc,slotsForLayout(pc,[])):null;
    const allItems=[...s.filter(x=>x.x!==undefined).map(x=>({x:x.x,y:x.y,w:SW,h:SH})),...(ri||[]).map(r=>({x:r.x,y:r.y,w:SW,h:SH})),...(pb?[pb]:[])];
    if(!allItems.length)return;
    const minX=Math.min(...allItems.map(i=>i.x));
    const minY=Math.min(...allItems.map(i=>i.y));
    const maxX=Math.max(...allItems.map(i=>i.x+i.w));
    const maxY=Math.max(...allItems.map(i=>i.y+i.h));
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    canvas.scrollLeft=Math.max(0,cx-canvas.clientWidth/2);
    canvas.scrollTop=Math.max(0,cy-canvas.clientHeight/2);
  },[]);

  /* Opening this panel (or switching to it) can grow the Electron window to fit —
     main.js animates that resize, which can still be in flight well after a fixed
     delay. A one-shot timeout was measuring the window's OLD, narrower width, which
     is why centering looked like it was stuck on the left. Center once the seats
     have actually painted (double rAF), then again whenever the window finishes
     resizing, for as long as a resize could plausibly still be running. */
  const centerCanvasWhenReady=useCallback((s,ri,pc)=>{
    let raf1=requestAnimationFrame(()=>{raf1=requestAnimationFrame(()=>centerCanvas(s,ri,pc));});
    const recenter=()=>centerCanvas(s,ri,pc);
    window.addEventListener('resize',recenter);
    const stop=setTimeout(()=>window.removeEventListener('resize',recenter),700);
    return()=>{cancelAnimationFrame(raf1);window.removeEventListener('resize',recenter);clearTimeout(stop);};
  },[centerCanvas]);

  const DEPRECATED_TAGS=new Set(['Front','Board','Window','Door']);
  /* Write a setup's seating. Regular: sl-<class> as always. Any other setup: its own
     key without tags/rules, which go to sl-<class> only if they were changed here. */
  const persistLayout=useCallback(({key,obj,regular,classId})=>{
    if(regular)return save(key,obj);
    const cl=JSON.stringify([obj.tags||[],obj.rules||[]]);
    const jobs=[save(key,stripClassLevel(obj))];
    if(classLevelRef.current!==cl){classLevelRef.current=cl;jobs.push(saveClassLevel(classId,{tags:obj.tags,rules:obj.rules}));}
    return Promise.all(jobs);
  },[]);
  const flushPendingSave=useCallback(()=>{
    if(saveTimer.current){clearTimeout(saveTimer.current);saveTimer.current=null;}
    const p=pendingSaveRef.current;pendingSaveRef.current=null;
    return p?persistLayout(p):Promise.resolve();
  },[persistLayout]);
  /* ── Load layout from storage per class and setup ── */
  useEffect(()=>{
    if(!activeClass?.id||!slKey)return;
    let alive=true;
    setZoom(1);
    setRandomizeConflicts(null);
    undoStackRef.current=[];setCanUndo(false);lastCommittedRef.current=null;
    let cleanupCenter=()=>{};
    load(`ph-mode-${activeClass.id}`,'combined').then(m=>{
      const mode=m==='separate'?'separate':'combined';
      setPhMode(mode);
      load(phKey(activeClass.id,mode,'seating'),{}).then(ph=>setSeatPairingHistory(ph||{}));
    });
    load(`sh-${activeClass.id}`,[]).then(h=>setSeatHistory(h||[]));
    load(`tag-colors-${activeClass.id}`,{}).then(tc=>setTagColors(tc||{}));
    shellAnswerRef.current=null;setShellAsk(false);setRoomMode(false);setSelWall(null);setSelOpening(null);
    loadRooms().then(setRooms);
    const classId=activeClass.id,key=slKey,regular=isRegular;
    /* an edit still waiting to be saved goes to the setup it was made in, before the next one loads */
    flushPendingSave().then(()=>Promise.all([
      load(key,null).then(l0=>syncClassWithRoom(classId,l0,key)),
      regular?null:load(`sl-${classId}`,null), // tags and rules are the class's, kept with Regular
    ])).then(([l1,classObj])=>{
      if(!alive)return;
      // another setup shows its own furniture but the class's tags and rules
      const layout=l1&&!regular?{...l1,tags:classObj?.tags||[],rules:classObj?.rules||[]}:(!l1&&!regular&&classObj?{seats:[],groups:[],roomItems:[],tags:classObj.tags||[],rules:classObj.rules||[]}:l1);
      if(layout){
        const rawSeats=(layout.seats||[]).map(s=>({...s,tags:(s.tags||[]).filter(t=>!DEPRECATED_TAGS.has(t))}));
        const loadedPieces=layout.pieces||[],loadedJoins=layout.joins||[];
        let{seats:loadedSeats,groups:loadedGroups}=repairSeatGroups(rawSeats,layout.groups||[]);
        // tables: make sure their seats match the pieces (heals a half-written save; a no-op normally)
        if(loadedPieces.length)({seats:loadedSeats,groups:loadedGroups}=syncPieceSeats({seats:loadedSeats,groups:loadedGroups,pieces:loadedPieces,joins:loadedJoins},{uid:sUid,nextLabel:nextGroupLabel}));
        const loadedRI=layout.roomItems||[];
        setSeats(loadedSeats);
        setGroups(loadedGroups);
        setRoomItems(loadedRI);
        setPieces(loadedPieces);setJoins(loadedJoins);
        setWalls(layout.walls||[]);setOpenings(layout.openings||[]);setRoomLink(layout.room||null);
        setRules(layout.rules||[]);
        if(layout.tags?.length){
          const cleaned=layout.tags.filter(t=>!DEPRECATED_TAGS.has(t));
          setAvTags(cleaned.length?cleaned:DEFAULT_SEAT_TAGS);
        }
        // If the saved layout had drifted (a past bug could do this), persist the
        // repair immediately so the corruption doesn't keep coming back on load.
        if(l1&&(JSON.stringify(loadedGroups)!==JSON.stringify(layout.groups||[])||(loadedPieces.length&&JSON.stringify(loadedSeats)!==JSON.stringify(rawSeats)))){
          const fixed=slLayoutObj(loadedSeats,loadedGroups,layout.tags,loadedRI,layout.rules,loadedPieces,loadedJoins,{walls:layout.walls,openings:layout.openings,room:layout.room});
          save(key,regular?fixed:stripClassLevel(fixed));
        }
        cleanupCenter=centerCanvasWhenReady(loadedSeats,loadedRI,loadedPieces);
        if(layout.walls?.length)requestAnimationFrame(()=>requestAnimationFrame(()=>setZoom(fitZoomFor(canvasRef.current,layout))));
        lastCommittedRef.current={seats:loadedSeats,groups:loadedGroups,tags:layout.tags?.length?layout.tags.filter(t=>!DEPRECATED_TAGS.has(t)):DEFAULT_SEAT_TAGS,roomItems:loadedRI,rules:layout.rules||[],pieces:loadedPieces,joins:loadedJoins,walls:layout.walls||[],openings:layout.openings||[],room:layout.room||null};
        classLevelRef.current=JSON.stringify([lastCommittedRef.current.tags,lastCommittedRef.current.rules]);
        roomBaselineRef.current=roomStructureKey(loadedSeats,loadedGroups,loadedRI,loadedPieces,loadedJoins);
        seatingBaselineRef.current=seatingSignature(loadedSeats);
      } else {
        setSeats([]);setGroups([]);setRoomItems([]);setRules([]);setPieces([]);setJoins([]);setWalls([]);setOpenings([]);setRoomLink(null);
        lastCommittedRef.current={seats:[],groups:[],tags:DEFAULT_SEAT_TAGS,roomItems:[],rules:[],pieces:[],joins:[],walls:[],openings:[],room:null};
        classLevelRef.current=JSON.stringify([DEFAULT_SEAT_TAGS,[]]);
        roomBaselineRef.current=roomStructureKey([],[],[]);
        seatingBaselineRef.current=seatingSignature([]);
      }
      setSel(new Set());setSelRoomId(null);setSelPieces(new Set());setPieceDrag(null);setEditSeats(false);setNotice(null);
    });
    return()=>{alive=false;cleanupCenter();};
  },[activeClass?.id,slKey]);
  /* leaving the panel: save anything still waiting */
  useEffect(()=>()=>{flushPendingSave();},[flushPendingSave]);

  /* ── Debounced save (also the one chokepoint every edit flows through, so
     it doubles as where we snapshot undo history) ── */
  /* pc/jn (pieces, joins) are optional: the many edits that don't touch table
     pieces leave them out, and the last committed pieces are carried forward —
     so no save path can quietly drop them. */
  const doSave=useCallback((s,g,t,ri,rl,pc,jn,ex)=>{
    if(!activeClass?.id||!slKey)return;
    const prevC=lastCommittedRef.current;
    const pcs=pc??prevC?.pieces??[],jns=jn??prevC?.joins??[];
    /* walls / openings / room link ride along the same way: `ex` is optional and
       whatever it leaves out is carried forward from the last committed state */
    const wls=ex?.walls??prevC?.walls??[],ops=ex?.openings??prevC?.openings??[];
    const room=ex&&'room' in ex?ex.room:(prevC?.room??null);
    if(prevC){
      undoStackRef.current=[...undoStackRef.current,prevC].slice(-20);
      setCanUndo(true);
    }
    lastCommittedRef.current={seats:s,groups:g,tags:t,roomItems:ri,rules:rl||[],pieces:pcs,joins:jns,walls:wls,openings:ops,room};
    const obj=slLayoutObj(s,g,t,ri,rl,pcs,jns,{walls:wls,openings:ops,room});
    if(saveTimer.current)clearTimeout(saveTimer.current);
    pendingSaveRef.current={key:slKey,obj,regular:isRegular,classId:activeClass.id};
    saveTimer.current=setTimeout(()=>{saveTimer.current=null;const p=pendingSaveRef.current;pendingSaveRef.current=null;if(p)persistLayout(p);},400);
    // editing the shared part of a room that other classes use → offer to update it for them
    if(prevC&&room&&!ex?.quiet&&shellSig(prevC.walls,prevC.openings,prevC.roomItems)!==shellSig(wls,ops,ri))shellEditRef.current?.(obj);
  },[activeClass?.id,slKey,isRegular,persistLayout]);

  const handleUndo=useCallback(()=>{
    const stack=undoStackRef.current;
    if(!stack.length||!activeClass?.id)return;
    const prev=stack[stack.length-1];
    undoStackRef.current=stack.slice(0,-1);
    setCanUndo(undoStackRef.current.length>0);
    lastCommittedRef.current=prev;
    setSeats(prev.seats);setGroups(prev.groups);setAvTags(prev.tags?.length?prev.tags:DEFAULT_SEAT_TAGS);setRoomItems(prev.roomItems);setRules(prev.rules||[]);
    setPieces(prev.pieces||[]);setJoins(prev.joins||[]);setWalls(prev.walls||[]);setOpenings(prev.openings||[]);setRoomLink(prev.room||null);
    setSel(new Set());setSelRoomId(null);setSelPieces(new Set());setPieceDrag(null);setSelWall(null);setSelOpening(null);
    if(saveTimer.current)clearTimeout(saveTimer.current);
    pendingSaveRef.current=null;
    persistLayout({key:slKey,obj:slLayoutObj(prev.seats,prev.groups,prev.tags,prev.roomItems,prev.rules,prev.pieces,prev.joins,{walls:prev.walls,openings:prev.openings,room:prev.room}),regular:isRegular,classId:activeClass.id});
  },[activeClass?.id,slKey,isRegular,persistLayout]);

  /* Self-heal against a student who's been removed from the roster (deleted, or
     dropped by re-importing a shorter list) — clears them out of any seat they
     were still sitting in. Runs off the roster itself, not just on class-switch,
     so it also catches the case where this panel was already open behind the
     "Manage class" dialog when the deletion happened. */
  useEffect(()=>{
    if(!activeClass)return;
    const validIds=new Set((activeClass.students||[]).map(s=>s.id));
    setSeats(prev=>{
      const next=prev.map(s=>s.studentId&&!validIds.has(s.studentId)?{...s,studentId:null,locked:false}:s);
      if(next.some((s,i)=>s!==prev[i]))doSave(next,groups,avTags,roomItems,rules);
      return next;
    });
  },[activeClass?.students]);

  /* ── Load saved layout templates ── */
  useEffect(()=>{load('ta-saved-layouts',[]).then(l=>setSavedLayouts(l||[]));},[]); // eslint-disable-line

  /* ── Save current layout as a named template ── */
  const saveLayout=useCallback((name)=>{
    // Strip student assignments — template is structure only
    const templateSeats=seats.map(s=>({...s,studentId:null,locked:false}));
    const template={id:sUid(),name:name.trim(),seats:templateSeats,groups,roomItems,createdAt:Date.now()};
    if(pieces.length){template.pieces=pieces;template.joins=joins;}
    const next=[...savedLayouts,template];
    setSavedLayouts(next);
    save('ta-saved-layouts',next);
    roomBaselineRef.current=roomStructureKey(seats,groups,roomItems,pieces,joins);
  },[seats,groups,roomItems,pieces,joins,savedLayouts]);

  /* ── Load a saved layout template into current class, re-seating whoever
     was already placed as closely as their old groups allow ── */
  const loadLayout=useCallback((template)=>{
    // Re-ID everything so seats are unique to this class instance. Tags on
    // the template's seats are kept as-is (reusing tags across classes is
    // useful, e.g. a "front row" convention) — if one doesn't belong here,
    // it's still fully manageable afterwards via 🎨 Manage in the Tags
    // section (recolour, or delete it and it comes off every seat).
    const idMap={},pieceMap={};
    (template.pieces||[]).forEach(p=>{pieceMap[p.id]=sUid();});
    const newPieces=(template.pieces||[]).map(p=>({...p,id:pieceMap[p.id]}));
    const newJoins=(template.joins||[]).filter(j=>pieceMap[j.a]&&pieceMap[j.b]).map(j=>({...j,a:pieceMap[j.a],b:pieceMap[j.b]}));
    const blankSeats=template.seats.map(s=>{const nid=sUid();idMap[s.id]=nid;return{...s,id:nid,studentId:null,locked:false,...(s.pieceId?{pieceId:pieceMap[s.pieceId]||s.pieceId}:{})};});
    const newGroups=template.groups.map(g=>({...g,id:sUid(),seatIds:g.seatIds.map(id=>idMap[id]||id)}));
    /* the room's own fixed items (sinks, boards…) stay; an old saved layout only brings its furniture */
    const newRI=[...roomItems.filter(r=>r.fixed),...(template.roomItems||[]).filter(r=>!r.fixed).map(r=>({...r,id:sUid()}))];
    const newSeats=bestFitReseat(seats,blankSeats);
    setSeats(newSeats);setGroups(newGroups);setRoomItems(newRI);setPieces(newPieces);setJoins(newJoins);
    setSel(new Set());setSelPieces(new Set());setShowLoadLayout(false);
    doSave(newSeats,newGroups,avTags,newRI,rules,newPieces,newJoins);
    roomBaselineRef.current=roomStructureKey(newSeats,newGroups,newRI,newPieces,newJoins);
    seatingBaselineRef.current=seatingSignature(newSeats);
  },[seats,roomItems,avTags,rules,doSave]);

  /* ── Ask first if the current room or seating hasn't been saved/recorded
     yet, so switching layouts can't silently throw either away ── */
  const requestLoadLayout=useCallback((template)=>{
    const layoutDirty=roomBaselineRef.current!==roomStructureKey(seats,groups,roomItems,pieces,joins);
    const seatingDirty=seatingBaselineRef.current!==seatingSignature(seats);
    if(layoutDirty||seatingDirty)setPendingLayoutLoad({template,layoutDirty,seatingDirty});
    else loadLayout(template);
  },[seats,groups,roomItems,pieces,joins,loadLayout]);

  /* ── Delete a saved layout ── */
  const deleteLayout=useCallback((id)=>{
    const next=savedLayouts.filter(l=>l.id!==id);
    setSavedLayouts(next);save('ta-saved-layouts',next);
  },[savedLayouts]);

  /* ── Confirm seating: snapshot who's sitting where right now into a running
     history (newest first, capped at 10) — unlike Saved layouts, this keeps
     the actual student assignments, so it's a record of past arrangements
     rather than a reusable blank template. ── */
  const confirmSeating=useCallback(()=>{
    if(!activeClass?.id)return;
    const entry={id:sUid(),name:fmtArrangementDate(Date.now()),createdAt:Date.now(),seats,groups,roomItems};
    if(pieces.length){entry.pieces=pieces;entry.joins=joins;}
    if(!isRegular)entry.setupId=setupId; // old entries have none and count as Regular's
    setSeatHistory(prev=>{
      // the last 10 per setup, so a busy Lab never pushes Regular's history out
      const sid=e=>e.setupId||REGULAR_SETUP,mine=sid(entry);
      let n=0;const next=[entry,...prev].filter(e=>sid(e)!==mine||++n<=10);
      save(`sh-${activeClass.id}`,next);
      return next;
    });
    seatingBaselineRef.current=seatingSignature(seats);
  },[activeClass?.id,seats,groups,roomItems,pieces,joins,isRegular,setupId]);

  /* ── Restore a past arrangement from history. When it was made for a
     different room (bestFit=true), the current room's furniture is left
     alone and the arrangement's students are fitted into it instead of
     replacing it wholesale. ── */
  const restoreArrangement=useCallback((entry,{bestFit=false}={})=>{
    if(bestFit){
      const blankSeats=seats.map(s=>({...s,studentId:null,locked:false}));
      const newSeats=bestFitReseat(entry.seats,blankSeats);
      setSeats(newSeats);
      setSel(new Set());
      doSave(newSeats,groups,avTags,roomItems,rules);
      seatingBaselineRef.current=seatingSignature(newSeats);
    } else {
      const newSeats=entry.seats.map(s=>({...s}));
      const newGroups=entry.groups.map(g=>({...g,seatIds:[...g.seatIds]}));
      // walls, openings and the room's fixed items always stay as they are now: an arrangement brings only its furniture
      const newRI=[...roomItems.filter(r=>r.fixed),...(entry.roomItems||[]).filter(r=>!r.fixed).map(r=>({...r}))];
      // an arrangement from before tables had pieces simply has none
      const newPieces=(entry.pieces||[]).map(p=>({...p})),newJoins=(entry.joins||[]).map(j=>({...j}));
      setSeats(newSeats);setGroups(newGroups);setRoomItems(newRI);setPieces(newPieces);setJoins(newJoins);
      setSel(new Set());setSelPieces(new Set());
      doSave(newSeats,newGroups,avTags,newRI,rules,newPieces,newJoins);
      roomBaselineRef.current=roomStructureKey(newSeats,newGroups,newRI,newPieces,newJoins);
      seatingBaselineRef.current=seatingSignature(newSeats);
    }
  },[seats,groups,roomItems,avTags,rules,doSave]);

  /* ── Ask first if there's a room-shape mismatch (offer a best-fit reseat)
     or unrecorded current seating, before restoring an old arrangement ── */
  const requestRestoreArrangement=useCallback((entry)=>{
    const mismatched=roomShapeSignature(seats,roomItems,pieces)!==roomShapeSignature(entry.seats,entry.roomItems,entry.pieces);
    const seatingDirty=seatingBaselineRef.current!==seatingSignature(seats);
    if(mismatched||seatingDirty)setPendingArrangementLoad({entry,mismatched,seatingDirty});
    else restoreArrangement(entry);
  },[seats,roomItems,pieces,restoreArrangement]);

  /* ── Delete a history entry ── */
  const deleteArrangement=useCallback((id)=>{
    if(!activeClass?.id)return;
    const next=seatHistory.filter(h=>h.id!==id);
    setSeatHistory(next);save(`sh-${activeClass.id}`,next);
  },[activeClass?.id,seatHistory]);

  /* ── Display labels for history entries: "SEP 2", or "SEP 2 (1)"/"(2)" when
     more than one was confirmed the same day, numbered by confirm order ── */
  /* Previous arrangements of the setup that's showing (entries from before setups are Regular's) */
  const setupHistory=useMemo(()=>seatHistory.filter(h=>(h.setupId||REGULAR_SETUP)===(setupId||REGULAR_SETUP)),[seatHistory,setupId]);
  const arrangementLabels=useMemo(()=>{
    const byDay={};
    setupHistory.forEach((h,i)=>{
      const d=new Date(h.createdAt);
      const key=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (byDay[key]=byDay[key]||[]).push(i);
    });
    const labels={};
    Object.values(byDay).forEach(idxs=>{
      const sorted=[...idxs].sort((a,b)=>setupHistory[a].createdAt-setupHistory[b].createdAt);
      const multiple=sorted.length>1;
      sorted.forEach((idx,pos)=>{
        const base=fmtArrangementDate(setupHistory[idx].createdAt);
        labels[setupHistory[idx].id]=multiple?`${base} (${pos+1})`:base;
      });
    });
    return labels;
  },[setupHistory]);

  /* ── Table pieces as they look right now, including mid-drag / mid-rotate ── */
  const livePieces=useMemo(()=>pieceDrag?pieceDrag.steps.reduce((ps,st)=>transformPieces(ps,pieceDrag.ids,st),pieces):pieces,[pieces,pieceDrag]);
  const liveSlots=useMemo(()=>slotsForLayout(livePieces,joins),[livePieces,joins]);
  const liveSlotByKey=useMemo(()=>new Map(liveSlots.map(s=>[s.key,s])),[liveSlots]);
  const seatByKey=useMemo(()=>new Map(seats.filter(s=>s.pieceId).map(s=>[`${s.pieceId}:${s.slot}`,s])),[seats]);

  /* ── Computed seat positions (includes live drag) ── */
  const pos=useMemo(()=>{
    const p=sPosMap(seats,groups,dd);
    // a table's seats ride along with it while it's dragged or turned
    if(pieceDrag)seats.forEach(s=>{
      if(!s.pieceId)return;
      const sl=liveSlotByKey.get(`${s.pieceId}:${s.slot}`);
      if(sl?.tag)p[s.id]={x:Math.round(sl.tag.x-SW/2),y:Math.round(sl.tag.y-SH/2)};
    });
    return p;
  },[seats,groups,dd,pieceDrag,liveSlotByKey]);
  const canvasSize=useMemo(()=>canvasContentSize(seats,roomItems,livePieces,liveSlots,walls),[seats,roomItems,livePieces,liveSlots,walls]);

  /* The pieces picked on the canvas — only while the seat selection is still
     exactly those pieces' seats (clicking a seat or the floor moves on from it). */
  const activeSelPieces=useMemo(()=>{
    const ids=[...selPieces].filter(id=>pieces.some(p=>p.id===id));
    if(!ids.length)return[];
    const set=new Set(ids);
    const mine=seats.filter(s=>set.has(s.pieceId)).map(s=>s.id);
    if(mine.length!==sel.size||mine.some(id=>!sel.has(id)))return[];
    return ids;
  },[selPieces,pieces,seats,sel]);

  const[rubberBand,setRubberBand]=useState(null);

  /* Clamp a whole-group drag delta so no member — or the group's own boundary
     box and tab bar, which sit outside the seats themselves — goes off-screen
     (x or y below 0). Clamps the shared delta, not each seat separately, so the
     group can't be pulled apart or misaligned when it hits the edge. */
  const clampGroupDelta=(dragIds,dx,dy)=>{
    const groupSeats=seats.filter(s=>dragIds.has(s.id));
    if(!groupSeats.length)return{dx,dy};
    const minDx=Math.max(...groupSeats.map(s=>GROUP_PAD+PG.CHAIR_OUT-s.x)); // left chairs stick out too
    const minDy=Math.max(...groupSeats.map(s=>GROUP_PAD+PG.CHAIR_OUT+GROUP_BAR_H-s.y));
    return{dx:Math.max(dx,minDx),dy:Math.max(dy,minDy)};
  };

  /* ── Add preset table: n=1 → ungrouped seat; n>1 → group with absolute positions ── */
  const addTable=(n,orientation='H')=>{
    const offset=sSnap(((groups.length+seats.filter(s=>!s.groupId).length)*22)%320);
    if(n===1){
      const ns={id:sUid(),groupId:null,x:60+offset,y:60+offset,tags:[],tagRule:'OR',studentId:null,locked:false,used:true};
      const nextS=[...seats,ns];
      setSeats(nextS);doSave(nextS,groups,avTags,roomItems,rules);
    } else {
      const gid=sUid();
      const lay=sLayout(n,orientation);
      const ns=lay.map(l=>({id:sUid(),groupId:gid,x:60+offset+l.c*SW,y:60+offset+l.r*SH,tags:[],tagRule:'OR',studentId:null,locked:false,used:true}));
      const ng={id:gid,seatIds:ns.map(s=>s.id),label:nextGroupLabel(groups)};
      const nextS=[...seats,...ns],nextG=[...groups,ng];
      setSeats(nextS);setGroups(nextG);doSave(nextS,nextG,avTags,roomItems,rules);
    }
  };

  /* ══ Table pieces: add, drag + snap, rotate, join, separate, seats on/off ══ */
  const showNotice=msg=>{
    setNotice(msg);
    if(noticeTimer.current)clearTimeout(noticeTimer.current);
    noticeTimer.current=setTimeout(()=>setNotice(null),7000);
  };
  const clusterOfPiece=(pid,pcs=pieces,jns=joins)=>clustersFromJoins(pcs,jns).find(c=>c.includes(pid))||[pid];
  const cleanJoins=(pcs,jns)=>{
    const ids=new Set(pcs.map(p=>p.id)),seen=new Set();
    return jns.filter(j=>{
      if(!ids.has(j.a)||!ids.has(j.b)||j.a===j.b)return false;
      const k=[`${j.a}:${j.ea}`,`${j.b}:${j.eb}`].sort().join('|');
      if(seen.has(k))return false;seen.add(k);return true;
    });
  };
  /* Keep moved/turned pieces on the canvas (nothing can be reached above or left of 0,0) */
  const keepOnCanvas=(pcs,ids,jns)=>{
    const set=new Set(ids),moved=pcs.filter(p=>set.has(p.id));
    const b=piecesBounds(moved,slotsForLayout(moved,jns.filter(j=>set.has(j.a)&&set.has(j.b))));
    if(!b||(b.x>=4&&b.y>=4))return pcs;
    return transformPieces(pcs,ids,{dx:Math.max(0,Math.ceil(4-b.x)),dy:Math.max(0,Math.ceil(4-b.y))});
  };
  /* Every table-piece change ends here: rebuild the seats and groups the pieces
     make (students keep their seat by pieceId:slot), save it as ONE undo step,
     and say who — if anyone — lost their seat and went back to the list. */
  const commitPieces=(pc,jn,base={})=>{
    const cj=cleanJoins(pc,jn);
    const r=syncPieceSeats({seats:base.seats||seats,groups:base.groups||groups,pieces:pc,joins:cj},{uid:sUid,nextLabel:nextGroupLabel});
    let rs=r.seats,rg=r.groups;
    if(base.after)({seats:rs,groups:rg}=base.after(rs,rg));
    /* in a joined table the group owns the colour, so a piece's own colour is dropped (a split piece then starts as Wood) */
    const joined=new Set(clustersFromJoins(pc,cj).filter(c=>c.length>1).flat());
    if(pc.some(p=>p.color&&joined.has(p.id)))pc=pc.map(p=>{if(!(p.color&&joined.has(p.id)))return p;const{color:_c,...q}=p;return q;});
    setPieces(pc);setJoins(cj);setSeats(rs);setGroups(rg);
    doSave(rs,rg,avTags,roomItems,rules,pc,cj);
    const names=r.bumped.map(id=>studentById(id)?.name).filter(Boolean);
    if(names.length){
      const who=names.length===1?names[0]:`${names.slice(0,-1).join(', ')} and ${names[names.length-1]}`;
      showNotice(`${who} went back to the student list — ${names.length===1?'that seat is':'those seats are'} no longer there.`);
    }
    return{seats:rs,groups:rg,pieces:pc,joins:cj};
  };
  const selectPieces=(ids,focus,seatsArr=seats)=>{
    const set=new Set(ids);
    const seatIds=seatsArr.filter(s=>set.has(s.pieceId)).map(s=>s.id);
    setSelPieces(set);setFocusPiece(focus??ids[0]);setPieceDeleteAsk(false);
    setSel(new Set(seatIds));setSelType(seatIds.length>1?'group':'seat');setSelRoomId(null);setTagConfirm(null);
  };

  /* First free spot (top-left first) for a new table, so it never lands on another */
  const freeSpotFor=set=>{
    const b=piecesBounds(set.pieces,slotsForLayout(set.pieces,set.joins));
    const boxes=[
      ...seats.filter(s=>!s.pieceId).map(s=>({x:s.x,y:s.y,w:SW,h:SH})),
      ...roomItems.map(r=>{const v=r.rotation===90||r.rotation===270;return r.type==='board'?{x:r.x,y:r.y,w:v?36:260,h:v?260:36}:{x:r.x,y:r.y,w:r.type==='door'?64:(v?SH:SW),h:r.type==='door'?64:(v?SW:SH)};}),
      ...clustersFromJoins(pieces,joins).map(c=>piecesBounds(pieces.filter(p=>c.includes(p.id)),liveSlots)).filter(Boolean),
    ];
    const M=20;
    for(let y=40;y<3000;y+=24)for(let x=40;x<1300;x+=24){
      if(boxes.every(o=>x+b.w+M<=o.x||o.x+o.w+M<=x||y+b.h+M<=o.y||o.y+o.h+M<=y))return[x,y];
    }
    return[40,40];
  };
  const addPieceSet=(kind,opts={})=>{
    const built=buildPieceSet(kind,sUid,opts);
    const[x,y]=freeSpotFor(built);
    const set=placePieceSet(built,x,y);
    const r=commitPieces([...pieces,...set.pieces],[...joins,...set.joins]);
    selectPieces(set.pieces.map(p=>p.id),set.pieces[0].id,r.seats);
    setEditSeats(false);
  };

  /* Drag a table: the whole joined cluster moves; Alt (Option) pulls just this
     piece off and turns snapping off. Near another table's edge it snaps — a
     bright line shows where — and the join is made on mouse-up. */
  const handlePieceMD=(e,pid)=>{
    if(e.button!==0)return;
    e.stopPropagation();e.preventDefault();
    if(e.shiftKey||e.metaKey||e.ctrlKey)return;
    const alone=e.altKey;
    const ids=alone?[pid]:clusterOfPiece(pid);
    selectPieces(ids,pid);setEditSeats(false);
    const moving=pieces.filter(p=>ids.includes(p.id)),others=pieces.filter(p=>!ids.includes(p.id));
    const b0=piecesBounds(moving,liveSlots);
    const sx=e.clientX,sy=e.clientY;let moved=false;
    const compute=ev=>{
      let dx=sSnap((ev.clientX-sx)/zoom),dy=sSnap((ev.clientY-sy)/zoom);
      if(b0){dx=Math.max(dx,Math.ceil(4-b0.x));dy=Math.max(dy,Math.ceil(4-b0.y));}
      const steps=[{dx,dy}];let snap=null;
      if(!ev.altKey&&others.length){
        snap=findSnap(transformPieces(moving,ids,{dx,dy}),others);
        if(snap)steps.push({dx:snap.dx,dy:snap.dy,drot:snap.drot,pivot:snap.pivot});
      }
      return{ids,steps,snap};
    };
    const mm=ev=>{
      if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<4)return;
      moved=true;setPieceDrag(compute(ev));
    };
    const mu=ev=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      setPieceDrag(null);
      if(!moved)return;
      const d=compute(ev);
      const next=d.steps.reduce((ps,st)=>transformPieces(ps,ids,st),pieces);
      let nj=alone?joins.filter(j=>j.a!==pid&&j.b!==pid):joins;
      if(d.snap)nj=[...nj,...d.snap.joins];
      const r=commitPieces(next,nj);
      selectPieces(clusterOfPiece(pid,r.pieces,r.joins),pid,r.seats);
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };

  /* Turn pieces about their middle. A piece turned on its own (picked with Alt)
     comes away from the rest of its table, since its edges no longer meet. */
  const rotatePiecesBy=(ids,deg)=>{
    if(!ids.length||!deg)return;
    const set=new Set(ids);
    const pivot=piecesCentre(pieces.filter(p=>set.has(p.id)));
    const nj=joins.filter(j=>set.has(j.a)===set.has(j.b));
    const next=keepOnCanvas(transformPieces(pieces,ids,{drot:deg,pivot}),ids,nj);
    const r=commitPieces(next,nj);
    selectPieces(ids,focusPiece,r.seats);
  };
  const handleRotateMD=(e,ids)=>{
    if(e.button!==0)return;
    e.stopPropagation();e.preventDefault();
    const pivot=piecesCentre(pieces.filter(p=>ids.includes(p.id)));
    const ang=ev=>{const c=toCanvasCoords(ev.clientX,ev.clientY);return Math.atan2(c.y-pivot[1],c.x-pivot[0])*180/Math.PI;};
    const a0=ang(e);
    // 15° steps, or free with Shift
    const step=ev=>{const d=pgNorm(ang(ev)-a0);return ev.shiftKey?Math.round(d):Math.round(d/15)*15;};
    const mm=ev=>setPieceDrag({ids,steps:[{drot:step(ev),pivot}],snap:null,rotating:true});
    const mu=ev=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      setPieceDrag(null);
      rotatePiecesBy(ids,step(ev));
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };

  /* Pull one piece out of its table, nudged a little way off so it's clearly apart */
  const separatePiece=pid=>{
    const cl=clusterOfPiece(pid);if(cl.length<2)return;
    const me=pieces.find(p=>p.id===pid);
    // straight away from the middle of the rest (pieces' own centres: a turned shape's bounding box is lopsided)
    const rest=pieces.filter(p=>cl.includes(p.id)&&p.id!==pid);
    const rc=[rest.reduce((a,p)=>a+p.x,0)/rest.length,rest.reduce((a,p)=>a+p.y,0)/rest.length];
    let v=[me.x-rc[0],me.y-rc[1]];const L=Math.hypot(v[0],v[1]);v=L?[v[0]/L,v[1]/L]:[0,1];
    const nj=joins.filter(j=>j.a!==pid&&j.b!==pid);
    // far enough apart that the two newly freed chairs don't bump into each other
    const next=keepOnCanvas(transformPieces(pieces,[pid],{dx:Math.round(v[0]*64),dy:Math.round(v[1]*64)}),[pid],nj);
    const r=commitPieces(next,nj);
    selectPieces([pid],pid,r.seats);
  };

  const deletePieces=ids=>{
    const set=new Set(ids);
    commitPieces(pieces.filter(p=>!set.has(p.id)),joins.filter(j=>!set.has(j.a)&&!set.has(j.b)));
    setSelPieces(new Set());setSel(new Set());setPieceDeleteAsk(false);setEditSeats(false);
  };
  // asks first only when somebody is sitting at it
  const requestDeletePieces=ids=>{
    if(seats.some(s=>ids.includes(s.pieceId)&&s.studentId))setPieceDeleteAsk(true);
    else deletePieces(ids);
  };

  /* Switch one of a piece's seats on or off (seatsOff wins; seatsOn turns on a
     seat that starts off, like a long table's ends or a bench's back) */
  const toggleSlot=(pid,idx)=>{
    const p=pieces.find(x=>x.id===pid);if(!p)return;
    const def=shapeDef(p.shape,p).slots[idx];if(!def)return;
    const off=new Set(p.seatsOff||[]),on=new Set(p.seatsOn||[]);
    const isOn=(def.on||on.has(idx))&&!off.has(idx);
    if(isOn){off.add(idx);on.delete(idx);}
    else{off.delete(idx);if(!def.on)on.add(idx);}
    const np={...p,seatsOff:[...off].sort((a,b)=>a-b)};
    if(on.size)np.seatsOn=[...on].sort((a,b)=>a-b);else delete np.seatsOn;
    const r=commitPieces(pieces.map(x=>x.id===pid?np:x),joins);
    selectPieces([...selPieces],focusPiece,r.seats);
  };
  /* ── Table colour (Phase 3c): which tables are picked, and recolouring them.
     A seat in a group colours that group (a whole cluster / joined table is one group); a seat
     of a lone one-seat piece colours the piece; a lone legacy desk colours the seat itself. ── */
  const colourTargets=()=>{
    const gids=new Set(),pids=new Set(),sids=new Set();
    const mine=activeSelPieces.length?seats.filter(s=>activeSelPieces.includes(s.pieceId)):Array.from(sel).map(id=>seats.find(s=>s.id===id)).filter(Boolean);
    mine.forEach(s=>{if(s.groupId)gids.add(s.groupId);else if(s.pieceId)pids.add(s.pieceId);else sids.add(s.id);});
    activeSelPieces.forEach(id=>{if(!seats.some(s=>s.pieceId===id&&s.groupId))pids.add(id);});
    return{gids,pids,sids,any:gids.size+pids.size+sids.size>0};
  };
  const currentTableColor=()=>{
    const t=colourTargets();
    const keys=[...[...t.gids].map(id=>groups.find(g=>g.id===id)?.color),...[...t.pids].map(id=>pieces.find(p=>p.id===id)?.color),...[...t.sids].map(id=>seats.find(s=>s.id===id)?.color)].map(k=>k||'wood');
    return keys.length&&keys.every(k=>k===keys[0])?keys[0]:null;
  };
  const setTableColor=key=>{
    const t=colourTargets();if(!t.any)return;
    const put=o=>{const{color:_c,...q}=o;return key==='wood'?q:{...q,color:key};};
    const nextG=groups.map(g=>t.gids.has(g.id)?put(g):g);
    const inGroup=new Set(groups.filter(g=>t.gids.has(g.id)).flatMap(g=>g.seatIds));
    const nextP=pieces.map(p=>t.pids.has(p.id)?put(p):(p.color&&seats.some(s=>s.pieceId===p.id&&inGroup.has(s.id))?(({color:_c,...q})=>q)(p):p));
    const nextS=seats.map(s=>t.sids.has(s.id)?put(s):s);
    setGroups(nextG);setPieces(nextP);setSeats(nextS);
    doSave(nextS,nextG,avTags,roomItems,rules,nextP,joins);
  };

  const updatePieces=(ids,fn)=>{
    const r=commitPieces(pieces.map(p=>ids.includes(p.id)?fn(p):p),joins);
    selectPieces(ids,focusPiece,r.seats);
  };

  /* "Convert to table": swap a plain group (or lone seat) for real table pieces
     at the same spot, moving everyone across in the same reading order (top row
     first, left to right) along with their seat's tags, lock and flags. One
     undo step puts it all back. */
  const convertTargetIds=(()=>{
    if(activeSelPieces.length)return null;
    const ss=Array.from(sel).map(id=>seats.find(s=>s.id===id)).filter(Boolean);
    if(!ss.length||ss.some(s=>s.pieceId))return null;
    if(ss.length===1&&!ss[0].groupId)return[ss[0].id];
    const gid=ss[0].groupId,g=groups.find(x=>x.id===gid);
    if(selType==='group'&&g&&ss.every(s=>s.groupId===gid)&&g.seatIds.every(id=>sel.has(id)))return[...g.seatIds];
    return null;
  })();
  const convertTo=opt=>{
    const ids=convertTargetIds;if(!ids)return;
    const idSet=new Set(ids);
    const old=readingOrder(ids.map(id=>seats.find(s=>s.id===id)).filter(Boolean),s=>[s.x,s.y]);
    const oldGroup=groups.find(g=>g.seatIds.some(id=>idSet.has(id))&&g.seatIds.every(id=>idSet.has(id)));
    // centred where the old desks were
    const built=buildPieceSet(opt.kind,sUid,opt),bb=piecesBounds(built.pieces,slotsForLayout(built.pieces,built.joins));
    const cx=(Math.min(...old.map(s=>s.x))+Math.max(...old.map(s=>s.x))+SW)/2,cy=(Math.min(...old.map(s=>s.y))+Math.max(...old.map(s=>s.y))+SH)/2;
    const set=placePieceSet(built,Math.max(8,Math.round(cx-bb.w/2)),Math.max(8,Math.round(cy-bb.h/2)));
    const newIds=new Set(set.pieces.map(p=>p.id));
    const oldIdx=oldGroup?groups.indexOf(oldGroup):-1;
    const baseSeats=seats.filter(s=>!idSet.has(s.id));
    const baseGroups=groups.filter(g=>g!==oldGroup).map(g=>({...g,seatIds:g.seatIds.filter(id=>!idSet.has(id))}));
    const r=commitPieces([...pieces,...set.pieces],[...joins,...set.joins],{seats:baseSeats,groups:baseGroups,after:(rs,rg)=>{
      const fresh=readingOrder(rs.filter(s=>newIds.has(s.pieceId)),s=>[s.x,s.y]);
      const carry={};
      fresh.forEach((s,i)=>{const o=old[i];if(o)carry[s.id]={studentId:o.studentId||null,locked:!!(o.locked&&o.studentId),tags:o.tags||[],tagRule:o.tagRule||'OR',used:o.used!==false,...(o.unavailable?{unavailable:true}:{})};});
      const seats2=rs.map(s=>carry[s.id]?{...s,...carry[s.id]}:s);
      // the new table keeps the old group's name and place in the list (so no chair colours shift)
      const gid=seats2.find(s=>newIds.has(s.pieceId)&&s.groupId)?.groupId;
      let groups2=rg;
      if(oldGroup&&gid){
        const ng={...rg.find(g=>g.id===gid),label:oldGroup.label};
        groups2=rg.filter(g=>g.id!==gid);
        groups2.splice(Math.min(oldIdx,groups2.length),0,ng);
      }
      return repairSeatGroups(seats2,groups2);
    }});
    selectPieces(clusterOfPiece(set.pieces[0].id,r.pieces,r.joins),set.pieces[0].id,r.seats);
    convertMenu.close();
  };

  /* ── Click: always selects the individual seat. The whole group is selected
     only via its tab (handleGroupTabClick) — see the group boundary box below. ── */
  const handleSeatClick=(e,sid)=>{
    const multi=e.shiftKey||e.metaKey||e.ctrlKey;
    if(multi){setSel(p=>{const n=new Set(p);n.has(sid)?n.delete(sid):n.add(sid);return n;});}
    else setSel(new Set([sid]));
    setSelType('seat');
  };

  /* ── Mouse-down on a group's tab bar → select the whole group, and drag it
     if the mouse moves (a plain click without movement just selects) ── */
  const handleGroupTabMD=(e,groupId)=>{
    if(e.button!==0)return;
    e.stopPropagation();e.preventDefault();
    const g=groups.find(x=>x.id===groupId);if(!g)return;
    const dragIds=new Set(g.seatIds);
    setSel(dragIds);setSelType('group');
    const sx=e.clientX,sy=e.clientY;
    const mm=e2=>{
      const rawDx=sSnap((e2.clientX-sx)/zoom),rawDy=sSnap((e2.clientY-sy)/zoom);
      const{dx,dy}=clampGroupDelta(dragIds,rawDx,rawDy);
      setDd({ids:dragIds,dx,dy});
    };
    const mu=e2=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      const rawDx=sSnap((e2.clientX-sx)/zoom),rawDy=sSnap((e2.clientY-sy)/zoom);
      const{dx,dy}=clampGroupDelta(dragIds,rawDx,rawDy);
      const nextS=seats.map(x=>dragIds.has(x.id)?{...x,x:x.x+dx,y:x.y+dy}:x);
      setSeats(nextS);setDd(null);doSave(nextS,groups,avTags,roomItems,rules);
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };

  /* ── Mouse-down on a seat's drag tab: move the whole group if the group is
     actively selected (via its tab) and this seat belongs to it; otherwise
     select and move just this one seat, even if it happens to be grouped. ── */
  const handleSeatMD=(e,sid)=>{
    if(e.button!==0)return;
    e.stopPropagation();
    if(e.shiftKey||e.metaKey||e.ctrlKey){e.preventDefault();return;}
    e.preventDefault();
    const s=seats.find(x=>x.id===sid);if(!s)return;

    const firstSelId=selType==='group'?Array.from(sel)[0]:null;
    const activeGroupId=firstSelId?seats.find(x=>x.id===firstSelId)?.groupId:null;
    const dragWholeGroup=activeGroupId&&s.groupId===activeGroupId;

    if(dragWholeGroup){
      const dragIds=sel;
      const sx=e.clientX,sy=e.clientY;
      const mm=e2=>{
        const rawDx=sSnap((e2.clientX-sx)/zoom),rawDy=sSnap((e2.clientY-sy)/zoom);
        const{dx,dy}=clampGroupDelta(dragIds,rawDx,rawDy);
        setDd({ids:dragIds,dx,dy});
      };
      const mu=e2=>{
        window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
        const rawDx=sSnap((e2.clientX-sx)/zoom),rawDy=sSnap((e2.clientY-sy)/zoom);
        const{dx,dy}=clampGroupDelta(dragIds,rawDx,rawDy);
        const nextS=seats.map(x=>dragIds.has(x.id)?{...x,x:x.x+dx,y:x.y+dy}:x);
        setSeats(nextS);setDd(null);doSave(nextS,groups,avTags,roomItems,rules);
      };
      window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
      return;
    }

    // Individual drag — select this seat and move just it (it stays in its group, if any)
    setSel(new Set([sid]));setSelType('seat');
    const sx=e.clientX,sy=e.clientY;
    const mm=e2=>{const dx=sSnap((e2.clientX-sx)/zoom),dy=sSnap((e2.clientY-sy)/zoom);setDd({ids:new Set([sid]),dx,dy,singleSeat:sid});};
    const mu=e2=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      const dx=sSnap((e2.clientX-sx)/zoom),dy=sSnap((e2.clientY-sy)/zoom);
      const nextS=seats.map(x=>x.id===sid?{...x,x:Math.max(0,x.x+dx),y:Math.max(0,x.y+dy)}:x);
      setSeats(nextS);setDd(null);doSave(nextS,groups,avTags,roomItems,rules);
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };

  /* ── Canvas mouse-down: rubber-band selection or plain click to clear ── */
  const handleCanvasMD=useCallback(e=>{
    if(e.button!==0)return;
    e.preventDefault();
    if(!canvasRef.current)return;
    const{x:x1,y:y1}=toCanvasCoords(e.clientX,e.clientY);
    const rr=roomRef.current;
    if(rr.roomMode){ // Edit room: dragging on the floor draws a wall (snapped to the grid, 0/45/90° and nearby wall ends)
      const a=document.activeElement;if(a&&a.tagName==='INPUT')a.blur();
      const isLine=rr.tool==='line',snapWalls=isLine?[]:rr.walls;
      const s0=wallSnapPoint([x1,y1],snapWalls).p;let draft=null;
      const mm2=e2=>{
        const c=toCanvasCoords(e2.clientX,e2.clientY);
        if(!draft&&Math.hypot(c.x-x1,c.y-y1)<6)return;
        const en=wallSnapPoint([c.x,c.y],snapWalls,{anchor:s0}).p;
        draft={x1:s0[0],y1:s0[1],x2:Math.max(0,en[0]),y2:Math.max(0,en[1]),line:isLine};setWallDraft(draft);
      };
      const mu2=()=>{
        window.removeEventListener('mousemove',mm2);window.removeEventListener('mouseup',mu2);setWallDraft(null);
        if(draft&&Math.hypot(draft.x2-draft.x1,draft.y2-draft.y1)>=16){if(isLine)rr.addLine(draft);else rr.addWall(draft);}else rr.clearSel();
      };
      window.addEventListener('mousemove',mm2);window.addEventListener('mouseup',mu2);
      return;
    }
    let moved=false;
    const mm=e2=>{
      const{x:x2,y:y2}=toCanvasCoords(e2.clientX,e2.clientY);
      if(!moved&&(Math.abs(x2-x1)>4||Math.abs(y2-y1)>4))moved=true;
      if(moved)setRubberBand({x1,y1,x2,y2});
    };
    const mu=e2=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      if(moved){
        const{x:x2,y:y2}=toCanvasCoords(e2.clientX,e2.clientY);
        const rx=Math.min(x1,x2),ry=Math.min(y1,y2),rw=Math.abs(x2-x1),rh=Math.abs(y2-y1);
        const inBand=new Set();
        // capture current pos snapshot from ref to avoid stale closure
        Object.entries(posRef.current).forEach(([id,p])=>{
          if(p.x+SW>rx&&p.x<rx+rw&&p.y+SH>ry&&p.y<ry+rh)inBand.add(id);
        });
        setSel(inBand);setSelType('seat');
      } else {
        setSel(new Set());setSelRoomId(null);setTagConfirm(null);setSelPieces(new Set());setEditSeats(false);setSelWall(null);setSelOpening(null);
      }
      setRubberBand(null);
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  },[zoom]);

  /* Keep a ref to latest pos so the rubber-band mouseup isn't stale ── */
  const posRef=useRef(pos);
  useEffect(()=>{posRef.current=pos;},[pos]);

  /* ── Trackpad pinch-to-zoom ── Chromium reports a trackpad pinch as a wheel
     event with ctrlKey set, so that's the signal we zoom on. A plain two-finger
     swipe (no ctrlKey) is left alone — it already pans, because the canvas
     scrolls natively. Registered as a non-passive listener so preventDefault()
     can actually stop the browser's own page-zoom gesture. */
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const onWheel=e=>{
      if(!e.ctrlKey)return;
      e.preventDefault();
      setZoom(z=>Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,z*(1-e.deltaY*0.01))));
    };
    canvas.addEventListener('wheel',onWheel,{passive:false});
    return()=>canvas.removeEventListener('wheel',onWheel);
  },[]);

  /* ── Keyboard shortcuts ── */
  const kbRef=useRef({});
  useEffect(()=>{
    const h=e=>{
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
      if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();kbRef.current.handleDelete();}
      else if((e.key==='['||e.key===']')&&!e.metaKey&&!e.ctrlKey){kbRef.current.rotateSel?.(e.key===']'?15:-15);}
      else if(!e.metaKey&&!e.ctrlKey&&!e.altKey){
        if(e.key==='1')kbRef.current.addTable(1);
        else if(e.key==='2')kbRef.current.addTable(2);
        else if(e.key==='3')kbRef.current.addTable(3);
        else if(e.key==='4')kbRef.current.addTable(4);
      }
    };
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[]);
  /* Pull each of these seats out of whatever group it's currently in (dissolving
     that group if it'd drop below 2 members) — a building block shared by every
     "put these seats in a (different) group" action below. Doesn't touch where
     the seats end up; that's the caller's job. */
  /* A group made from lone coloured desks starts in the first one's colour; the desks' own colour then moves to the group. */
  const seedGroupColor=seatIds=>seats.find(s=>seatIds.includes(s.id)&&s.color)?.color;
  const dropSeatColor=x=>{if(!x.color)return x;const{color:_c,...q}=x;return q;};
  const detachSeatsFromGroups=(seatIds)=>{
    let nextG=groups,nextS=seats;
    seatIds.forEach(seatId=>{
      const seat=nextS.find(s=>s.id===seatId);
      const oldGroupId=seat?.groupId;
      if(!oldGroupId)return;
      const oldG=nextG.find(g=>g.id===oldGroupId);
      const remaining=(oldG?.seatIds||[]).filter(id=>id!==seatId);
      if(remaining.length<2){
        nextG=nextG.filter(g=>g.id!==oldGroupId);
        if(remaining.length===1)nextS=nextS.map(x=>x.id===remaining[0]?{...x,groupId:null}:x);
      } else {
        nextG=nextG.map(g=>g.id===oldGroupId?{...g,seatIds:remaining}:g);
      }
    });
    return{nextS,nextG};
  };

  /* ── Add one or more seats to an existing group — no repositioning; grouping
     is a logical/bounding-box thing, not a layout action. Seats already in the
     target group are left alone: detaching them first would (for a 2-seat
     group) dissolve the very group we're about to add them back into. ── */
  const addSeatsToGroup=(seatIds,groupId)=>{
    const toMove=seatIds.filter(id=>seats.find(s=>s.id===id)?.groupId!==groupId);
    const{nextS,nextG}=detachSeatsFromGroups(toMove);
    const finalG=nextG.map(g=>g.id===groupId?{...g,seatIds:[...new Set([...g.seatIds,...toMove])]}:g);
    const finalS=nextS.map(x=>toMove.includes(x.id)?{...dropSeatColor(x),groupId}:x);
    setSeats(finalS);setGroups(finalG);
    setSel(new Set(finalG.find(g=>g.id===groupId)?.seatIds||[]));setSelType('group');
    doSave(finalS,finalG,avTags,roomItems,rules);
  };

  /* ── Create a brand-new group from these seats, without repositioning them ── */
  const createGroupFromSeats=(seatIds,name)=>{
    const{nextS,nextG}=detachSeatsFromGroups(seatIds);
    const newGid=sUid();
    const label=(name||'').trim().slice(0,20)||nextGroupLabel(nextG);
    const col=seedGroupColor(seatIds);
    const finalG=[...nextG,{id:newGid,seatIds:[...seatIds],label,...(col?{color:col}:{})}];
    const finalS=nextS.map(x=>seatIds.includes(x.id)?{...dropSeatColor(x),groupId:newGid}:x);
    setSeats(finalS);setGroups(finalG);setSel(new Set(seatIds));setSelType('group');
    doSave(finalS,finalG,avTags,roomItems,rules);
  };

  /* ── Same, but also arranges the seats into a tidy new-table layout first —
     used when none of the selected seats were grouped, since a fresh layout
     actually makes sense there (unlike merging seats already placed). ── */
  const createGroupFromSeatsTidy=(seatIds,name)=>{
    const curPos={...pos};
    const selPositions=seatIds.map(id=>curPos[id]).filter(Boolean);
    if(!selPositions.length){createGroupFromSeats(seatIds,name);return;}
    const minX=Math.min(...selPositions.map(p=>p.x));
    const minY=Math.min(...selPositions.map(p=>p.y));
    const orientation=detectOrientation(selPositions);
    const lay=sLayout(seatIds.length,orientation);
    const posMap={};seatIds.forEach((id,i)=>{posMap[id]={x:sSnap(minX+lay[i].c*SW),y:sSnap(minY+lay[i].r*SH)};});
    const{nextS,nextG}=detachSeatsFromGroups(seatIds);
    const newGid=sUid();
    const label=(name||'').trim().slice(0,20)||nextGroupLabel(nextG);
    const col=seedGroupColor(seatIds);
    const finalG=[...nextG,{id:newGid,seatIds:[...seatIds],label,...(col?{color:col}:{})}];
    const finalS=nextS.map(x=>seatIds.includes(x.id)?{...dropSeatColor(x),groupId:newGid,x:posMap[x.id]?.x??x.x,y:posMap[x.id]?.y??x.y}:x);
    setSeats(finalS);setGroups(finalG);setSel(new Set(seatIds));setSelType('group');
    doSave(finalS,finalG,avTags,roomItems,rules);
  };

  /* ── "Group" button: if the selection spans two or more EXISTING groups, ask
     which one should win (or offer a new one) instead of silently picking for
     the teacher. If exactly one group is touched it's unambiguous — fold into
     it. Otherwise none of the selected seats were grouped yet: if there's at
     least one existing group they might mean to join, ask (new table vs. add
     to one of them); if there are no groups at all, there's nothing to choose
     between, so just arrange them into a tidy new table. ── */
  const handleGroup=()=>{
    if(sel.size<2)return;
    const sa=Array.from(sel);
    const touchedGroupIds=[...new Set(sa.map(id=>seats.find(s=>s.id===id)?.groupId).filter(Boolean))];
    if(touchedGroupIds.length>=2){
      setGroupMergeChoice({seatIds:sa,groupIds:touchedGroupIds,tidy:false});
      return;
    }
    if(touchedGroupIds.length===1){
      addSeatsToGroup(sa,touchedGroupIds[0]);
      return;
    }
    if(groups.length>0){
      setGroupMergeChoice({seatIds:sa,groupIds:groups.map(g=>g.id),tidy:true});
      return;
    }
    createGroupFromSeatsTidy(sa,'');
  };

  /* ── Ungroup: seats keep their current absolute positions, groupId cleared ── */
  const handleUngroup=()=>{
    if(!sel.size)return;
    const sa=Array.from(sel);
    const affG=new Set(sa.map(id=>seats.find(s=>s.id===id)?.groupId).filter(Boolean));
    const remByG={};groups.forEach(g=>{if(affG.has(g.id))remByG[g.id]=g.seatIds.filter(id=>!sel.has(id));});
    const orphans=new Set(Object.values(remByG).filter(r=>r.length===1).flatMap(r=>r));
    const toUngroup=new Set([...sa.filter(id=>seats.find(s=>s.id===id)?.groupId),...orphans]);
    const nextS=seats.map(s=>toUngroup.has(s.id)?{...s,groupId:null}:s);
    const nextG=groups.filter(g=>!affG.has(g.id)||(remByG[g.id]?.length>=2)).map(g=>affG.has(g.id)?{...g,seatIds:remByG[g.id]}:g);
    setSeats(nextS);setGroups(nextG);setSel(new Set(toUngroup));setSelType('seat');doSave(nextS,nextG,avTags,roomItems,rules);
  };

  /* ── ⇅ Flip chairs on plain desk groups and lone desks: chairs move to the
     opposite side of the table (stored as flipChairs on the group or desk) ── */
  const handleFlipChairs=()=>{
    const ss=Array.from(sel).map(id=>seats.find(s=>s.id===id)).filter(s=>s&&!s.pieceId);
    if(!ss.length)return;
    const gIds=new Set(ss.map(s=>s.groupId).filter(Boolean));
    const lone=new Set(ss.filter(s=>!s.groupId).map(s=>s.id));
    const nextG=groups.map(g=>gIds.has(g.id)?{...g,flipChairs:!g.flipChairs}:g);
    const nextS=seats.map(s=>lone.has(s.id)?{...s,flipChairs:!s.flipChairs}:s);
    setSeats(nextS);setGroups(nextG);doSave(nextS,nextG,avTags,roomItems,rules);
  };

  /* ── Remove one seat from a group (the "−" overlay) — dissolves the group if
     it'd drop to 1 seat, same convention as handleUngroup ── */
  const removeSeatFromGroup=(seatId,groupId)=>{
    const g=groups.find(x=>x.id===groupId);if(!g)return;
    const remaining=g.seatIds.filter(id=>id!==seatId);
    let nextG,nextS;
    if(remaining.length<2){
      nextG=groups.filter(x=>x.id!==groupId);
      nextS=seats.map(x=>(x.id===seatId||remaining.includes(x.id))?{...x,groupId:null}:x);
      setSel(new Set([seatId]));setSelType('seat');
    } else {
      nextG=groups.map(x=>x.id===groupId?{...x,seatIds:remaining}:x);
      nextS=seats.map(x=>x.id===seatId?{...x,groupId:null}:x);
      setSel(new Set(remaining));setSelType('group');
    }
    setSeats(nextS);setGroups(nextG);
    doSave(nextS,nextG,avTags,roomItems,rules);
  };

  /* ── Rename a group from the Manage table groups dialog ── */
  const renameGroup=(groupId,name)=>{
    const nextG=groups.map(g=>g.id===groupId?{...g,label:name.trim().slice(0,20)}:g);
    setGroups(nextG);doSave(seats,nextG,avTags,roomItems,rules);
  };

  /* ── Delete a group from the Manage table groups dialog — dissolves the
     grouping (same as selecting its seats and hitting Ungroup); the desks
     themselves stay on the seating chart, just no longer combined into one
     table. ── */
  const deleteGroup=groupId=>{
    const g=groups.find(x=>x.id===groupId);
    if(!g)return;
    const memberIds=new Set(g.seatIds);
    const nextS=seats.map(s=>memberIds.has(s.id)?{...s,groupId:null}:s);
    const nextG=groups.filter(x=>x.id!==groupId);
    setSeats(nextS);setGroups(nextG);
    if(Array.from(sel).some(id=>memberIds.has(id))){setSel(new Set());setSelType('seat');}
    doSave(nextS,nextG,avTags,roomItems,rules);
  };

  /* ── Delete selected seats AND selected room item ── */
  const handleDelete=()=>{
    // a picked wall or door/window goes first (they can only be picked in Edit room)
    if(selOpening){commitWalls(walls,openings.filter(o=>o.id!==selOpening));setSelOpening(null);return;}
    if(selWall){commitWalls(walls.filter(w=>w.id!==selWall),openings.filter(o=>o.wallId!==selWall));setSelWall(null);return;}
    // a picked table is deleted as a whole (asking first if anyone sits there)
    if(activeSelPieces.length&&!selRoomId){requestDeletePieces(activeSelPieces);return;}
    let didSomething=false;
    let nextS=seats,nextG=groups,nextRI=roomItems;
    // a seat that's part of a table is switched off rather than removed — the table still has that place
    const offSlots=Array.from(sel).map(id=>seats.find(s=>s.id===id)).filter(s=>s?.pieceId);
    if(offSlots.length){
      const nextP=pieces.map(p=>{
        const mine=offSlots.filter(s=>s.pieceId===p.id).map(s=>s.slot);
        return mine.length?{...p,seatsOff:[...new Set([...(p.seatsOff||[]),...mine])].sort((a,b)=>a-b),seatsOn:(p.seatsOn||[]).filter(i=>!mine.includes(i))}:p;
      });
      const rest=new Set(Array.from(sel).filter(id=>!offSlots.some(s=>s.id===id)));
      if(selRoomId){nextRI=roomItems.filter(r=>r.id!==selRoomId);setRoomItems(nextRI);setSelRoomId(null);}
      // any plain seats picked along with them are removed as usual
      const plainS=seats.filter(s=>!rest.has(s.id));
      const plainG=groups.map(g=>({...g,seatIds:g.seatIds.filter(id=>!rest.has(id))}));
      const r=syncPieceSeats({seats:plainS,groups:plainG,pieces:nextP,joins},{uid:sUid,nextLabel:nextGroupLabel});
      const rep=repairSeatGroups(r.seats,r.groups);
      setPieces(nextP);setSeats(rep.seats);setGroups(rep.groups);setSel(new Set());
      doSave(rep.seats,rep.groups,avTags,nextRI,rules,nextP,joins);
      const names=r.bumped.map(id=>studentById(id)?.name).filter(Boolean);
      if(names.length)showNotice(`${names.join(', ')} went back to the student list.`);
      return;
    }
    if(selRoomId){
      nextRI=roomItems.filter(r=>r.id!==selRoomId);
      setRoomItems(nextRI);setSelRoomId(null);didSomething=true;
    }
    if(sel.size){
      const curPos={...pos};
      const affG=new Set(Array.from(sel).map(id=>seats.find(s=>s.id===id)?.groupId).filter(Boolean));
      const remByG={};nextG.forEach(g=>{if(affG.has(g.id))remByG[g.id]=g.seatIds.filter(id=>!sel.has(id));});
      const orphans=new Set(Object.values(remByG).filter(r=>r.length===1).flatMap(r=>r));
      nextS=nextS.filter(s=>!sel.has(s.id)).map(s=>{
        if(orphans.has(s.id)){const p=curPos[s.id]||{x:60,y:60};return{...s,groupId:null,x:sSnap(p.x),y:sSnap(p.y)};}
        return s;
      });
      nextG=nextG.filter(g=>!affG.has(g.id)||(remByG[g.id]?.length>=2)).map(g=>affG.has(g.id)?{...g,seatIds:remByG[g.id]}:g);
      setSeats(nextS);setGroups(nextG);setSel(new Set());didSomething=true;
    }
    if(didSomething)doSave(nextS,nextG,avTags,nextRI,rules);
  };

  /* ══ Room builder (Phase 4): items, walls, openings and the room library ══ */
  const blurInput=()=>{const a=document.activeElement;if(a&&a.tagName==='INPUT')a.blur();}; // a mouse-down that calls preventDefault would otherwise leave a text box focused
  const commitRoom=(nextRI,ex)=>{setRoomItems(nextRI);doSave(seats,groups,avTags,nextRI,rules,undefined,undefined,ex);};
  const commitWalls=(nextWalls,nextOpenings)=>{
    setWalls(nextWalls);setOpenings(nextOpenings);
    doSave(seats,groups,avTags,cRI(),rules,undefined,undefined,{walls:nextWalls,openings:nextOpenings});
  };
  /* the latest committed state — a mouse-up can land after another edit (a label typed in the side panel just lost focus), so never build from a render-time snapshot */
  const cRI=()=>lastCommittedRef.current?.roomItems||roomItems,cWalls=()=>lastCommittedRef.current?.walls||walls,cOps=()=>lastCommittedRef.current?.openings||openings;
  const viewCentre=()=>{const el=canvasRef.current;if(!el)return{x:240,y:200};const r=el.getBoundingClientRect();return toCanvasCoords(r.left+r.width/2,r.top+r.height/2);};
  const selectItem=id=>{blurInput();setSelRoomId(id);setSel(new Set());setSelPieces(new Set());setSelWall(null);setSelOpening(null);setTagConfirm(null);};
  const selItem=selRoomId?roomItems.find(r=>r.id===selRoomId):null;

  /* ── Add a catalogue item in the middle of what's on screen ── */
  const addRoomItem=type=>{
    if(!ROOM_ITEM_TYPES[type]){ // the original freestanding door
      const offset=sSnap((roomItems.length*32)%240);
      commitRoom([...roomItems,{id:sUid(),type,x:80+offset,y:80+offset,rotation:0}]);
      return;
    }
    const t=ROOM_ITEM_TYPES[type],c=viewCentre(),k=(roomItems.length%6)*16;
    const it=newRoomItem(type,sUid,Math.max(8,sSnap(c.x-t.w/2+k)),Math.max(8,sSnap(c.y-t.h/2+k)));
    commitRoom([...roomItems,it]);selectItem(it.id);
    if(it.fixed&&!roomMode)showNotice(`${t.name} is marked as part of the room (fixed). You can change that in the selection panel.`);
  };
  /* An original item (desk/board/door) is converted to a normal one the first time it is resized or turned */
  const patchItem=(id,fn,upgrade=false)=>commitRoom(roomItems.map(r=>r.id===id?fn(upgrade?upgradeLegacyItem(r):r):r));
  const rotateRoomItem=(id,deg)=>patchItem(id,r=>{const q=(((r.rot||0)+deg)%360+360)%360;return{...r,rot:q,rotation:q};},true);
  const setItemLabel=(id,text)=>patchItem(id,r=>({...r,label:(text||'').trim().slice(0,40)}));
  const toggleItemFixed=id=>patchItem(id,r=>({...r,fixed:!r.fixed}));
  const toggleItemStation=id=>patchItem(id,r=>{const q={...r};if(q.station)delete q.station;else q.station={n:nextStationNumber(roomItems,pieces),name:''};return q;});
  const setItemStation=(id,patch)=>patchItem(id,r=>({...r,station:{...r.station,...patch}}));
  const togglePieceStation=pid=>updatePieces([pid],p=>{const q={...p};if(q.station)delete q.station;else q.station={n:nextStationNumber(roomItems,pieces),name:''};return q;});
  const setPieceStation=(pid,patch)=>updatePieces([pid],p=>({...p,station:{...p.station,...patch}}));
  /* 🔄 Stations: this setup's stations in their saved order. The order is saved on the setup (stations.order). */
  const stationList=orderStations(roomItems,pieces,setup?.stations?.order);
  const renameStation=(st,name)=>st.kind==='piece'?setPieceStation(st.id,{name}):setItemStation(st.id,{name});
  const reorderStations=ids=>{if(setupId)patchSetup(setupId,x=>({...x,stations:{...(x.stations||{}),order:ids}}));};
  const rotationHere=!!rotation;
  const[editingLabel,setEditingLabel]=useState(null); // item id whose label is being typed on the canvas

  /* ── Drag a room item ── */
  const handleRoomItemMD=(e,id)=>{
    if(e.button!==0)return;
    e.stopPropagation();
    if(e.shiftKey||e.metaKey||e.ctrlKey){e.preventDefault();return;}
    e.preventDefault();
    selectItem(id);
    const item=roomItems.find(r=>r.id===id);if(!item)return;
    const sx=e.clientX,sy=e.clientY;
    let cx=item.x,cy=item.y,moved=false;
    const mm=e2=>{
      if(!moved&&Math.hypot(e2.clientX-sx,e2.clientY-sy)<3)return;
      moved=true;
      cx=sSnap(Math.max(0,item.x+(e2.clientX-sx)/zoom));
      cy=sSnap(Math.max(0,item.y+(e2.clientY-sy)/zoom));
      setRoomItems(p=>p.map(r=>r.id===id?{...r,x:cx,y:cy}:r));
    };
    const mu=()=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      if(!moved)return;
      let moved1={...item,x:cx,y:cy};
      if(item.type==='window'){const sn=snapItemToWall(moved1,cWalls());if(sn)moved1=sn;} // a window dropped on a wall lies along it
      commitRoom(cRI().map(r=>r.id===id?moved1:r));
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };

  /* ── Resize an item by one of its 8 handles. Works in the item's own turned frame,
     so a tilted item stretches along its own edges and the opposite edge stays put. ── */
  const handleItemResizeMD=(e,id,hx,hy)=>{
    if(e.button!==0)return;
    e.stopPropagation();e.preventDefault();
    const it0=upgradeLegacyItem(roomItems.find(r=>r.id===id));
    const g=itemGeom(it0),c=itemCentre(g),th=g.rot*Math.PI/180,co=Math.cos(th),si=Math.sin(th);
    const MIN=16;let live=null;
    const compute=ev=>{
      const p=toCanvasCoords(ev.clientX,ev.clientY),dx=p.x-c[0],dy=p.y-c[1];
      const P=[dx*co+dy*si,-dx*si+dy*co]; // the pointer in the item's own frame
      let nw=g.w,nh=g.h,lx=0,ly=0;
      if(hx){const ax=-hx*g.w/2;nw=Math.max(MIN,Math.round((P[0]-ax)*hx/8)*8);lx=ax+hx*nw/2;}
      if(hy){const ay=-hy*g.h/2;nh=Math.max(MIN,Math.round((P[1]-ay)*hy/8)*8);ly=ay+hy*nh/2;}
      const wc=[c[0]+lx*co-ly*si,c[1]+lx*si+ly*co];
      return{...it0,w:nw,h:nh,x:Math.max(0,Math.round(wc[0]-nw/2)),y:Math.max(0,Math.round(wc[1]-nh/2))};
    };
    const mm=ev=>{live=compute(ev);setRoomItems(p=>p.map(r=>r.id===id?live:r));};
    const mu=()=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      if(live)commitRoom(cRI().map(r=>r.id===id?live:r));
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };
  /* ── Turn an item with its round handle: 15° steps, or free with Shift (same as tables) ── */
  const handleItemRotateMD=(e,id)=>{
    if(e.button!==0)return;
    e.stopPropagation();e.preventDefault();
    const it0=upgradeLegacyItem(roomItems.find(r=>r.id===id)),g=itemGeom(it0),c=itemCentre(g);
    const ang=ev=>{const p=toCanvasCoords(ev.clientX,ev.clientY);return Math.atan2(p.y-c[1],p.x-c[0])*180/Math.PI;};
    const a0=ang(e);let live=null;
    const rotFor=ev=>{const d=pgNorm(ang(ev)-a0),s=ev.shiftKey?Math.round(d):Math.round(d/15)*15;return(((g.rot+s)%360)+360)%360;};
    const mm=ev=>{const r=rotFor(ev);live={...it0,rot:r,rotation:r};setRoomItems(p=>p.map(x=>x.id===id?live:x));};
    const mu=()=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      if(live)commitRoom(cRI().map(x=>x.id===id?live:x));
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };

  /* ── Walls ── */
  const addWallDraft=d=>{const w={id:sUid(),...d};commitWalls([...walls,w],openings);setSelWall(w.id);setSelOpening(null);setSelRoomId(null);};
  const handleWallMD=(e,id)=>{
    if(e.button!==0)return;
    e.stopPropagation();e.preventDefault();blurInput();
    setSelWall(id);setSelOpening(null);setSelRoomId(null);setSel(new Set());setSelPieces(new Set());
    const w0=walls.find(w=>w.id===id);if(!w0)return;
    const sx=e.clientX,sy=e.clientY,minX=Math.min(w0.x1,w0.x2),minY=Math.min(w0.y1,w0.y2);
    let moved=false,dx=0,dy=0;
    const build=()=>walls.map(w=>w.id===id?{...w,x1:w0.x1+dx,y1:w0.y1+dy,x2:w0.x2+dx,y2:w0.y2+dy}:w);
    const mm=ev=>{
      if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<4)return;
      moved=true;dx=Math.max(-minX,sSnap((ev.clientX-sx)/zoom));dy=Math.max(-minY,sSnap((ev.clientY-sy)/zoom));
      setWalls(build());
    };
    const mu=()=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      if(moved)commitWalls(build(),cOps());
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };
  /* Drag one end of a wall. Any other wall ending at the same corner comes with it, so a room's corners stay closed. */
  const handleWallEndMD=(e,id,end)=>{
    if(e.button!==0)return;
    e.stopPropagation();e.preventDefault();
    const w0=walls.find(w=>w.id===id);if(!w0)return;
    const mine=end==='a'?[w0.x1,w0.y1]:[w0.x2,w0.y2],anchor=end==='a'?[w0.x2,w0.y2]:[w0.x1,w0.y1];
    const same=(x,y)=>Math.abs(x-mine[0])<0.5&&Math.abs(y-mine[1])<0.5;
    const others=walls.filter(w=>w.id!==id&&!same(w.x1,w.y1)&&!same(w.x2,w.y2));
    const build=p=>walls.map(w=>{
      if(w.id===id)return end==='a'?{...w,x1:p[0],y1:p[1]}:{...w,x2:p[0],y2:p[1]};
      let q=w;
      if(same(w.x1,w.y1))q={...q,x1:p[0],y1:p[1]};
      if(same(w.x2,w.y2))q={...q,x2:p[0],y2:p[1]};
      return q;
    });
    let cur=null;
    const mm=ev=>{
      const c=toCanvasCoords(ev.clientX,ev.clientY),sn=wallSnapPoint([c.x,c.y],others,{anchor});
      const p=[Math.max(0,sn.p[0]),Math.max(0,sn.p[1])];
      if(Math.hypot(p[0]-anchor[0],p[1]-anchor[1])<8)return; // never collapse a wall to nothing
      cur=build(p);setWalls(cur);
    };
    const mu=()=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      if(!cur)return;
      commitWalls(cur,cOps().map(o=>{const w=cur.find(x=>x.id===o.wallId);return w?{...o,t:clampOpeningT(w,o.width,o.t)}:o;}));
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };
  /* "Rectangle room": four walls round whatever is already on the canvas, with a margin */
  const addRectRoom=()=>{
    const bs=[];
    seats.filter(s=>!s.pieceId).forEach(s=>{const p=pos[s.id]||s;bs.push({x:p.x,y:p.y-GROUP_BAR_H,w:SW,h:SH+GROUP_BAR_H});});
    const pb=livePieces.length?piecesBounds(livePieces,liveSlots):null;if(pb)bs.push({x:pb.x,y:pb.y-26,w:pb.w,h:pb.h+26});
    roomItems.forEach(r=>{const b=itemBounds(r);bs.push({x:b.x,y:b.y,w:b.w,h:b.h+26});});
    const M=48;
    const box=bs.length
      ?{x:Math.min(...bs.map(b=>b.x))-M,y:Math.min(...bs.map(b=>b.y))-M,w:Math.max(...bs.map(b=>b.x+b.w))-Math.min(...bs.map(b=>b.x))+M*2,h:Math.max(...bs.map(b=>b.y+b.h))-Math.min(...bs.map(b=>b.y))+M*2}
      :{x:48,y:48,w:704,h:480};
    const nw=rectRoomWalls(box,sUid);
    commitWalls([...walls,...nw],openings);setSelWall(nw[0].id);setSelOpening(null);
  };

  /* ── Doors and windows on walls ── */
  const freeT=(wall,width)=>{
    const L=wallLen(wall),taken=openings.filter(o=>o.wallId===wall.id);
    for(const t0 of[0.5,0.25,0.75,0.125,0.875,0.375,0.625]){const t=clampOpeningT(wall,width,t0);if(taken.every(o=>Math.abs(o.t-t)*L>(o.width+width)/2+4))return t;}
    return clampOpeningT(wall,width,0.5);
  };
  const addOpening=(type,where)=>{
    const width=OPENING_TYPES[type].width;
    let hit=where;
    if(!hit){
      const w=walls.find(x=>x.id===selWall)||[...walls].sort((a,b)=>wallLen(b)-wallLen(a))[0];
      if(!w){showNotice('Draw a wall first, then drop doors and windows onto it.');return;}
      hit={wallId:w.id,t:freeT(w,width)};
    }
    const op={id:sUid(),type,wallId:hit.wallId,t:hit.t,width,flip:false,swing:1};
    commitWalls(walls,[...openings,op]);setSelOpening(op.id);setSelWall(null);setSelRoomId(null);
  };
  /* Carry a door or window from the palette to a wall: click = put it on the selected wall (or the longest) */
  const startOpeningDrag=(e,type)=>{
    if(e.button!==0)return;
    e.preventDefault();
    const width=OPENING_TYPES[type].width,sx=e.clientX,sy=e.clientY;
    let moved=false,hit=null;
    const mm=ev=>{
      if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<5)return;
      moved=true;
      const c=toCanvasCoords(ev.clientX,ev.clientY);
      hit=openingAtPoint(walls,[c.x,c.y],width,44);
      setOpeningDrag({type,cx:ev.clientX,cy:ev.clientY,hit});
    };
    const mu=()=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      setOpeningDrag(null);
      if(!moved){addOpening(type,null);return;}
      if(hit)addOpening(type,hit);else showNotice('Drop it on a wall to put a door or window there.');
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };
  /* Slide an opening along its wall (or onto another wall) */
  const handleOpeningMD=(e,id)=>{
    if(e.button!==0)return;
    e.stopPropagation();e.preventDefault();blurInput();
    setSelOpening(id);setSelWall(null);setSelRoomId(null);setSel(new Set());setSelPieces(new Set());
    const op0=openings.find(o=>o.id===id);if(!op0)return;
    const sx=e.clientX,sy=e.clientY;let moved=false,cur=openings;
    const mm=ev=>{
      if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<3)return;
      const c=toCanvasCoords(ev.clientX,ev.clientY),hit=openingAtPoint(walls,[c.x,c.y],op0.width,60);
      if(!hit)return;
      moved=true;cur=openings.map(o=>o.id===id?{...o,...hit}:o);setOpenings(cur);
    };
    const mu=()=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      if(moved)commitWalls(cWalls(),cur);
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };
  const patchOpening=(id,fn)=>commitWalls(walls,openings.map(o=>o.id===id?fn(o):o));

  /* ── Room library (ta-rooms) ── */
  const curLayoutObj=()=>slLayoutObj(seats,groups,avTags,roomItems,rules,pieces,joins,{walls,openings,room:roomLink});
  const persistRooms=async fn=>{ // always from what is on disk now, so another class's change is never overwritten
    const saved=await saveRooms(fn(await loadRooms()));
    setRooms(saved);return saved;
  };
  const linkClass=link=>{setRoomLink(link);doSave(seats,groups,avTags,roomItems,rules,undefined,undefined,{room:link,quiet:true});};
  const linkTo=(room,layoutId)=>{ // a class whose own shell differs from the room's keeps it (shellLocal) until Tom shares it
    const same=sameShell(curLayoutObj(),room);
    linkClass({roomId:room.id,layoutId,...(same?{}:{shellLocal:true})});
  };
  const saveAsNewRoom=async name=>{
    const lo=curLayoutObj(),room={id:sUid(),name:name.trim()||'New room',shell:extractShell(lo),layouts:[{id:sUid(),name:'Layout 1',createdAt:Date.now(),...extractLayout(lo)}]};
    await persistRooms(cur=>[...cur,room]);
    linkClass({roomId:room.id,layoutId:room.layouts[0].id});
    shellAnswerRef.current=null;
  };
  const saveLayoutToRoom=async(roomId,layoutId,name)=>{
    const lay=extractLayout(curLayoutObj());let outRoom=null,outLid=layoutId;
    await persistRooms(cur=>cur.map(r=>{
      if(r.id!==roomId)return r;
      const layouts=layoutId?r.layouts.map(l=>l.id===layoutId?{...l,...lay}:l):[...r.layouts,{id:(outLid=sUid()),name:(name||'').trim()||`Layout ${r.layouts.length+1}`,createdAt:Date.now(),...lay}];
      outRoom={...r,layouts};return outRoom;
    }));
    if(outRoom&&!outRoom.legacy)linkTo(outRoom,outLid);
  };
  /* Use a room: its shell and one layout replace this class's room; students are reseated as closely as their old groups allow */
  const useRoomLayout=(room,layout)=>{
    const inst=instantiateLayout(layout,sUid);
    const newSeats=bestFitReseat(seats,inst.seats);
    let newRI,ex;
    if(room.legacy){newRI=[...roomItems.filter(r=>r.fixed),...inst.items];ex={quiet:true};} // old saved layouts are furniture only
    else{
      const sh=cloneJ(room.shell||{});
      newRI=[...(sh.items||[]),...inst.items];
      ex={walls:sh.walls||[],openings:sh.openings||[],room:{roomId:room.id,layoutId:layout.id},quiet:true};
      setWalls(ex.walls);setOpenings(ex.openings);setRoomLink(ex.room);
    }
    setSeats(newSeats);setGroups(inst.groups);setRoomItems(newRI);setPieces(inst.pieces);setJoins(inst.joins);
    setSel(new Set());setSelPieces(new Set());setSelRoomId(null);setSelWall(null);setSelOpening(null);
    shellAnswerRef.current=null;setShellAsk(false);
    doSave(newSeats,inst.groups,avTags,newRI,rules,inst.pieces,inst.joins,ex);
    roomBaselineRef.current=roomStructureKey(newSeats,inst.groups,newRI,inst.pieces,inst.joins);
    seatingBaselineRef.current=seatingSignature(newSeats);
  };
  const renameRoom=(id,name)=>persistRooms(cur=>cur.map(r=>r.id===id?{...r,name:name.trim()||r.name}:r));
  const duplicateRoom=id=>persistRooms(cur=>{
    const r=cur.find(x=>x.id===id);if(!r)return cur;
    return[...cur,{...cloneJ(r),id:sUid(),name:`${r.name} copy`,legacy:undefined,layouts:r.layouts.map(l=>({...cloneJ(l),id:sUid()}))}];
  });
  const deleteRoom=id=>{
    persistRooms(cur=>cur.filter(r=>r.id!==id));
    if(roomLink?.roomId===id)linkClass(null);
  };
  const deleteRoomLayout=(roomId,layoutId)=>persistRooms(cur=>cur.map(r=>r.id===roomId?{...r,layouts:r.layouts.filter(l=>l.id!==layoutId)}:r));
  /* Share this class's shell with the library room (and so every class that uses it) */
  const pushShell=async(obj,keepGoing)=>{
    const link=obj.room;if(!link)return;
    await persistRooms(cur=>cur.map(r=>r.id===link.roomId?{...r,shell:extractShell(obj)}:r));
    if(link.shellLocal){linkClass({roomId:link.roomId,layoutId:link.layoutId});}
    if(keepGoing)shellAnswerRef.current='yes';
  };
  const committedObj=()=>{const c=lastCommittedRef.current||{};return slLayoutObj(c.seats||[],c.groups||[],c.tags,c.roomItems||[],c.rules,c.pieces,c.joins,{walls:c.walls,openings:c.openings,room:c.room});};
  const pushTimer=useRef(null);
  shellEditRef.current=obj=>{ // called from doSave when the shell of a linked room was edited
    const link=obj.room;if(!link||link.shellLocal)return;
    if(shellAnswerRef.current==='yes'){
      if(pushTimer.current)clearTimeout(pushTimer.current);
      pushTimer.current=setTimeout(()=>pushShell(committedObj(),true),500);
    }else setShellAsk(true);
  };
  const adoptSharedShell=()=>{ // drop this class's own shape and take the library room's again
    const room=rooms.find(r=>r.id===roomLink?.roomId);if(!room)return;
    const next=applyRoomShell(curLayoutObj(),room);
    setWalls(next.walls||[]);setOpenings(next.openings||[]);setRoomItems(next.roomItems);
    const link={roomId:roomLink.roomId,layoutId:roomLink.layoutId};setRoomLink(link);
    doSave(seats,groups,avTags,next.roomItems,rules,undefined,undefined,{walls:next.walls||[],openings:next.openings||[],room:link,quiet:true});
  };
  const addLineDraft=d=>{const it=lineItemFromPoints([d.x1,d.y1],[d.x2,d.y2],sUid);commitRoom([...roomItems,it]);selectItem(it.id);};
  roomRef.current={roomMode,walls,tool:drawTool,addLine:addLineDraft,addWall:addWallDraft,clearSel:()=>{setSelWall(null);setSelOpening(null);setSelRoomId(null);setSel(new Set());setSelPieces(new Set());}};

  /* ── Class setups (Phase 5): switch, add, rename, reorder, duplicate, delete ── */
  const[showNewSetup,setShowNewSetup]=useState(false);
  const clearSelection=()=>{setSel(new Set());setSelRoomId(null);setTagConfirm(null);setSelPieces(new Set());setEditSeats(false);setSelWall(null);setSelOpening(null);};
  const switchSetup=id=>{if(setups&&id!==setups.activeId)onChangeSetups?.({...setups,activeId:id});}; // the load effect saves any waiting edit first
  const patchSetup=(id,fn)=>{if(setups)onChangeSetups?.({...setups,list:setups.list.map(x=>x.id===id?fn(x):x)});};
  const reorderSetups=(fromId,toId)=>{
    if(!setups)return;
    const list=[...setups.list],a=list.findIndex(x=>x.id===fromId),b=list.findIndex(x=>x.id===toId);
    if(a<0||b<0)return;
    const[m]=list.splice(a,1);list.splice(b,0,m); // dropped on a tab to its right: lands after it; to its left: before it
    onChangeSetups?.({...setups,list});
  };
  const createNewSetup=async({name,icon,use,copy,withStudents,fromRoom})=>{
    if(!activeClass?.id)return;
    await flushPendingSave();
    await createSetup(activeClass.id,{name,icon,use,fromLayout:copy?curLayoutObj():undefined,withStudents,fromRoom,activate:true});
    setShowNewSetup(false);
  };
  const duplicateSetup=async s=>{
    if(!activeClass?.id||!s)return;
    await flushPendingSave();
    const lo=s.id===setupId?curLayoutObj():await loadSetupLayout(activeClass.id,s.id);
    await createSetup(activeClass.id,{name:`${s.name} copy`.slice(0,28),icon:s.icon,use:s.use,fromLayout:lo||slLayoutObj([],[],[],[],[]),withStudents:true,offPieces:s.offPieces,activate:true});
  };
  const removeSetup=async s=>{
    if(!activeClass?.id||!s||s.id===REGULAR_SETUP)return;
    if(s.id===setupId)await flushPendingSave(); // its latest seating goes into the trash too
    await deleteSetup(activeClass.id,s.id);
  };
  /* Furniture this setup uses (worked out, never saved into the seats) */
  const usableIds=useMemo(()=>usableSeatIds({seats,pieces},setup),[seats,pieces,setup]);
  const offPieceIds=useMemo(()=>unusablePieceIds(pieces,setup),[pieces,setup]);
  const notUsedHere=useMemo(()=>new Set(seats.filter(s=>s.used&&!s.unavailable&&!usableIds.has(s.id)).map(s=>s.id)),[seats,usableIds]); // in use, but not by this setup
  const groupNotUsedHere=g=>{const live=g.seatIds.filter(id=>seats.find(x=>x.id===id&&x.used&&!x.unavailable));return live.length>0&&live.every(id=>notUsedHere.has(id));};
  const strandedCount=seats.filter(s=>s.studentId&&notUsedHere.has(s.id)).length;
  const toggleOffPieces=(ids,turnOff)=>{
    if(!setup)return;
    patchSetup(setup.id,x=>{const cur=new Set(x.offPieces||[]);ids.forEach(id=>turnOff?cur.add(id):cur.delete(id));return{...x,offPieces:[...cur]};});
  };

  /* ── Tag helpers ── */
  const applyTagToSeats=(sids,tag)=>{
    const nextS=seats.map(s=>{
      if(!sids.includes(s.id))return s;
      const has=s.tags.includes(tag);
      return{...s,tags:has?s.tags.filter(t=>t!==tag):[...s.tags,tag]};
    });
    setSeats(nextS);doSave(nextS,groups,avTags,roomItems,rules);
  };

  /* ══ 5b: student assignment ══ */
  const[studentDrag,setStudentDrag]=useState(null); // {studentId, fromSeatId:null|id, ghostX, ghostY}
  const[conflictDialog,setConflictDialog]=useState(null); // {incomingId, targetSeatId}

  /* Students not yet placed in any seat */
  const placedIds=useMemo(()=>new Set(seats.map(s=>s.studentId).filter(Boolean)),[seats]);
  const unplaced=useMemo(()=>(activeClass?.students||[]).filter(s=>!placedIds.has(s.id)),[activeClass,placedIds]);
  const studentById=useCallback(id=>(activeClass?.students||[]).find(s=>s.id===id),[activeClass]);

  /* ── Assign student to seat, optionally clearing their old seat ── */
  const assignStudent=(studentId, toSeatId, fromSeatId=null)=>{
    setSeats(prev=>{
      let next=[...prev];
      if(fromSeatId)next=next.map(s=>s.id===fromSeatId?{...s,studentId:null,locked:false}:s);
      next=next.map(s=>s.id===toSeatId?{...s,studentId}:s);
      doSave(next,groups,avTags,roomItems,rules);
      return next;
    });
  };

  /* ── Swap two seated students ── */
  const swapStudents=(seatA, seatB)=>{
    setSeats(prev=>{
      const a=prev.find(s=>s.id===seatA),b=prev.find(s=>s.id===seatB);
      if(!a||!b)return prev;
      const next=prev.map(s=>{
        if(s.id===seatA)return{...s,studentId:b.studentId,locked:false};
        if(s.id===seatB)return{...s,studentId:a.studentId,locked:false};
        return s;
      });
      doSave(next,groups,avTags,roomItems,rules);
      return next;
    });
  };

  /* ── Remove student from seat → back to unplaced ── */
  const removeFromSeat=seatId=>{
    setSeats(prev=>{
      const next=prev.map(s=>s.id===seatId?{...s,studentId:null,locked:false}:s);
      doSave(next,groups,avTags,roomItems,rules);
      return next;
    });
  };

  /* ── Toggle seat lock ── */
  const toggleLock=seatId=>{
    setSeats(prev=>{
      const next=prev.map(s=>s.id===seatId&&s.studentId?{...s,locked:!s.locked}:s);
      doSave(next,groups,avTags,roomItems,rules);
      return next;
    });
  };

  /* ── Toggle seat unavailable (single seat or whole group) ── */
  const toggleUnavailable=()=>{
    const ids=Array.from(sel);
    if(!ids.length)return;
    // If group selected, expand to all group seats
    const allIds=new Set(ids);
    if(selType==='group'){ids.forEach(id=>{const s=seats.find(x=>x.id===id);if(s?.groupId){const g=groups.find(x=>x.id===s.groupId);g?.seatIds.forEach(sid=>allIds.add(sid));}});}
    const anyAvailable=Array.from(allIds).some(id=>!seats.find(s=>s.id===id)?.unavailable);
    const nextS=seats.map(s=>allIds.has(s.id)?{...s,unavailable:anyAvailable,studentId:anyAvailable?null:s.studentId,locked:anyAvailable?false:s.locked}:s);
    setSeats(nextS);doSave(nextS,groups,avTags,roomItems,rules);
  };

  /* ── Randomize — respects tag matching, keep-apart/together rules, optional smart shuffle.
     The algorithm itself lives in randomizeSeating (shared with the Seating tab). ── */
  const randomize=()=>{
    /* only the furniture this setup uses is filled (unusable seats go in marked unavailable, on copies) */
    const res=randomizeSeating({students:activeClass?.students||[],seats:seatsForSetup({seats,pieces},setup),rules,smartShuffle,hardTagRules,pairingHistory:seatPairingHistory});
    res.nextSeats=restoreSeatFlags(res.nextSeats,seats);
    setSeats(res.nextSeats);doSave(res.nextSeats,groups,avTags,roomItems,rules);
    setRandomizeConflicts(res.placed?res.conflicts:[]);
    /* Committing an arrangement by placing it on the seats is the moment to
       record who ended up together — there's no separate "finalise" step. */
    if(res.placed&&activeClass?.id){
      setSeatPairingHistory(res.nextHistory);
      save(phKey(activeClass.id,phMode,'seating'),res.nextHistory);
    }
  };

  /* ── Start dragging a student (from sidebar chip or from a seat) ── */
  const startStudentDrag=(e, studentId, fromSeatId=null)=>{
    if(e.button!==0)return;
    e.preventDefault();e.stopPropagation();
    // Deselect seats so seat-drag doesn't interfere
    setSel(new Set());
    setStudentDrag({studentId,fromSeatId,ghostX:e.clientX,ghostY:e.clientY});
    const mm=e2=>{setStudentDrag(p=>p?{...p,ghostX:e2.clientX,ghostY:e2.clientY}:null);};
    const mu=e2=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      const canvas=canvasRef.current;
      const cr=canvas?.getBoundingClientRect();
      // Drop on left column → remove from seat
      if(fromSeatId&&cr&&e2.clientX<cr.left){
        removeFromSeat(fromSeatId);setStudentDrag(null);return;
      }
      if(cr){
        const{x:mx,y:my}=toCanvasCoords(e2.clientX,e2.clientY);
        // Use latest posRef
        const targetSeatId=Object.entries(posRef.current).find(([id,p])=>{
          const seat=seats.find(s=>s.id===id);
          if(!seat?.used)return false;
          // a table seat's drop target is its name tag (round tables pack tags closer than a seat box)
          const t=seat.pieceId?liveSlotByKey.get(`${seat.pieceId}:${seat.slot}`)?.tag:null;
          if(t)return Math.abs(mx-t.x)<=t.w/2+8&&Math.abs(my-t.y)<=t.h/2+8;
          return mx>=p.x&&mx<=p.x+SW&&my>=p.y&&my<=p.y+SH;
        })?.[0];
        if(targetSeatId&&targetSeatId!==fromSeatId){
          const targetSeat=seats.find(s=>s.id===targetSeatId);
          if(targetSeat?.unavailable){
            // Can't drop on unavailable seat — silently ignore
          } else if(targetSeat?.studentId){
            // Occupied — show conflict dialog
            setConflictDialog({incomingId:studentId,fromSeatId,targetSeatId});
          } else {
            assignStudent(studentId,targetSeatId,fromSeatId);
          }
        }
      }
      setStudentDrag(null);
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };
  const handleTagToggle=tag=>{
    const sa=Array.from(sel);
    if(selType==='group'&&sa.length>1)setTagConfirm({tag,sids:sa});
    else applyTagToSeats(sa,tag);
  };
  const addAvTag=name=>{
    const t=(name||'').trim();
    if(!t||avTags.includes(t))return;
    const nt=[...avTags,t];setAvTags(nt);doSave(seats,groups,nt,roomItems,rules);
  };
  const removeAvTag=t=>{
    const nt=avTags.filter(x=>x!==t);setAvTags(nt);
    const nextS=seats.map(s=>({...s,tags:s.tags.filter(x=>x!==t)}));
    setSeats(nextS);doSave(nextS,groups,nt,roomItems,rules);
    if(tagColors[t]!=null){const{[t]:_,...rest}=tagColors;setTagColors(rest);if(activeClass?.id)save(`tag-colors-${activeClass.id}`,rest);}
    (activeClass?.students||[]).forEach(s=>{
      if((s.tags||[]).includes(t))onUpdateStudentTags?.(activeClass.id,s.id,s.tags.filter(x=>x!==t));
    });
  };
  /* Custom colour per tag, overriding stCol's hashed default — lets two
     visually-similar tags be told apart, or a tag matched to a house
     colour etc. Shared by the seat map, the Tags chip list, the per-seat
     toggle buttons and the Applied summary, so a change here shows up
     everywhere at once. */
  const colorFor=useCallback(tag=>{
    const idx=tagColors[tag];
    if(idx!=null){const c=COLORS[idx%COLORS.length];return{t:c.text,b:c.bg};}
    return stCol(tag);
  },[tagColors]);
  const setTagColor=(tag,idx)=>{
    const next={...tagColors,[tag]:idx};
    setTagColors(next);
    if(activeClass?.id)save(`tag-colors-${activeClass.id}`,next);
  };
  /* Tags that ended up on a seat without (or no longer) being in this
     class's own tag list — e.g. loaded in from a different class's saved
     layout. They still need to be manageable (recoloured or deleted)
     rather than stuck. */
  const orphanTags=useMemo(()=>{
    const set=new Set();
    seats.forEach(s=>(s.tags||[]).forEach(t=>{if(!avTags.includes(t)&&!DEPRECATED_TAGS.has(t))set.add(t);}));
    return[...set];
  },[seats,avTags]);

  /* ── Derived selection info ── */
  const selSeats=Array.from(sel).map(id=>seats.find(s=>s.id===id)).filter(Boolean);
  const isGrpSel=selType==='group'&&selSeats.length>1;
  const commonTags=avTags.filter(t=>selSeats.length>0&&selSeats.every(s=>s.tags.includes(t)));
  /* Grade/gender smart tags — computed from the roster, not hand-assigned */
  const smartTags=[...gradeSmartTags(activeClass?.students),'Girl','Boy'];
  const commonSmartTags=smartTags.filter(t=>selSeats.length>0&&selSeats.every(s=>s.tags.includes(t)));
  const anyGrouped=selSeats.some(s=>s.groupId);
  // For single-seat-in-group selection: show dotted border on group-mates
  const singleSeatGroupMates=useMemo(()=>{
    if(sel.size===1&&selType==='seat'){
      const sid=Array.from(sel)[0];
      const s=seats.find(x=>x.id===sid);
      if(s?.groupId){
        const g=groups.find(x=>x.id===s.groupId);
        return new Set(g?g.seatIds.filter(id=>id!==sid):[]);
      }
    }
    return new Set();
  },[sel,selType,seats,groups]);

  /* The group currently selected via its tab — drives the per-seat +/− overlay */
  const activeGroupId=useMemo(()=>{
    if(selType==='group'&&sel.size){
      const firstId=Array.from(sel)[0];
      return seats.find(x=>x.id===firstId)?.groupId||null;
    }
    return null;
  },[sel,selType,seats]);

  /* A table made of pieces manages its own seats, so no +/- add-to-group buttons for it */
  const activeGroupIsTable=!!activeGroupId&&seats.some(s=>s.groupId===activeGroupId&&s.pieceId);

  /* Keep kbRef fresh on every render — must be after all handlers are defined */
  kbRef.current={handleDelete,addTable,addRoomItem,randomize,rotateSel:deg=>{if(activeSelPieces.length)rotatePiecesBy(activeSelPieces,deg);else if(selRoomId)rotateRoomItem(selRoomId,deg);}};

  const itemEl=item=>(
    <RoomItemView key={item.id} item={item} selected={selRoomId===item.id} cursor="grab"
      onMouseDown={e=>handleRoomItemMD(e,item.id)}
      onClick={e=>{e.stopPropagation();selectItem(item.id);}}
      onDoubleClick={e=>{e.stopPropagation();selectItem(item.id);setEditingLabel(item.id);}}
      title={`${ROOM_ITEM_TYPES[item.type]?.name||'Door'}${item.label?` "${item.label}"`:''} — drag to move, double-click to name it. Del removes it.`}/>
  );
  const menuHead={fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)",margin:"2px 2px 5px"};
  const btnS={padding:"7px 10px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.12s"};

  return(
    <div style={{display:"flex",height:"100%",fontFamily:"'Source Sans 3',sans-serif",overflow:"hidden"}}>

      {/* ── Left column ── */}
      <div style={{width:"188px",flexShrink:0,padding:"12px 10px",display:"flex",flexDirection:"column",gap:"14px",overflowY:"auto",background:"#fafbfc",borderRight:"1px solid rgba(0,0,0,0.06)"}}>

        {/* Randomize + Smart shuffle */}
        {activeClass&&seats.some(s=>s.used)&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            <button className="cpb cpb-primary" onClick={randomize} title="Randomly seat students into the used seats, respecting seat tags and keep-apart/together rules" style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",letterSpacing:"0.3px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"}
              onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
            >🎲 Randomize</button>
            <button className="cpb cpb-mint" onClick={confirmSeating} title="Save who's sitting where right now to Previous Arrangements" style={{width:"100%",padding:"8px",borderRadius:"9px",border:"1px solid rgba(46,142,88,0.3)",background:"#eefaf1",color:"#2e8e58",fontSize:"12px",fontWeight:700,cursor:"pointer",letterSpacing:"0.2px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#dff3e5"}
              onMouseLeave={e=>e.currentTarget.style.background="#eefaf1"}
            >✓ Confirm seating</button>
            <div ref={randomizeOptionsMenu.anchorRef} style={{position:"relative"}}>
              <button className={`cpb${randomizeOptionsMenu.pos?" on":""}`} onClick={randomizeOptionsMenu.toggle} title="Options for how Randomize fills seats" style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${randomizeOptionsMenu.pos?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:randomizeOptionsMenu.pos?"#eaf1fc":"transparent",cursor:"pointer",fontSize:"11px",fontWeight:600,color:"rgba(0,0,0,0.5)",fontFamily:"'Source Sans 3',sans-serif"}}>
                <span>⚙ Randomize options</span>
                <span style={{fontSize:"9px"}}>▾</span>
              </button>
            </div>
            {randomizeOptionsMenu.pos&&createPortal(
              <div className="cp-pop" ref={randomizeOptionsMenu.menuRef} style={{position:"fixed",left:randomizeOptionsMenu.pos.left,...(randomizeOptionsMenu.pos.top!=null?{top:randomizeOptionsMenu.pos.top}:{bottom:randomizeOptionsMenu.pos.bottom}),maxHeight:randomizeOptionsMenu.pos.maxHeight,overflowY:"auto",zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",minWidth:"210px",display:"flex",flexDirection:"column",gap:"4px",fontFamily:"'Source Sans 3',sans-serif"}}>
                <button className="cpb" onClick={()=>{const n=!smartShuffle;setSmartShuffle(n);save('seating-rand-opts',{smartShuffle:n,hardTagRules});}} title="Avoid reseating students next to someone they've already sat beside recently" style={{width:"100%",display:"flex",alignItems:"center",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${smartShuffle?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:smartShuffle?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start"}}>
                  <CPSwitch on={smartShuffle} small/>
                  <span style={{fontSize:"11px",fontWeight:600,color:smartShuffle?"#2e6bce":"rgba(0,0,0,0.4)"}}>Smart shuffle</span>
                </button>
                <button className="cpb" onClick={()=>{const n=!hardTagRules;setHardTagRules(n);save('seating-rand-opts',{smartShuffle,hardTagRules:n});}} title={hardTagRules?"Seats with a tag (e.g. Front, EAL) stay empty rather than seat a student who doesn't match":"Every seat gets filled — tag rules get broken if there aren't enough matching students"}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${!hardTagRules?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:!hardTagRules?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start"}}>
                  <CPSwitch on={!hardTagRules} small/>
                  <span style={{fontSize:"11px",fontWeight:600,color:!hardTagRules?"#2e6bce":"rgba(0,0,0,0.4)"}}>{hardTagRules?"Hard tag rules":"Best fit (fill every seat)"}</span>
                </button>
                <button className="cpb" onClick={()=>setChairsMatch(!chairsMatch)} title="Chairs at a coloured table use a slightly deeper shade of the table's colour (instead of the rotating chair colours). Plain wood tables keep the usual chairs" data-cp-chairmatch
                  style={{width:"100%",display:"flex",alignItems:"center",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${chairsMatch?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:chairsMatch?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start"}}>
                  <CPSwitch on={chairsMatch} small/>
                  <span style={{fontSize:"11px",fontWeight:600,color:chairsMatch?"#2e6bce":"rgba(0,0,0,0.4)"}}>Match chairs to table colour</span>
                </button>
              </div>,
              document.body
            )}

            {/* Randomize can't always satisfy every keep-apart/together rule at
                once (e.g. two rules that pull the same student in opposite
                directions) — say so plainly instead of silently seating a
                conflicting arrangement, same as the Groups tab does. */}
            {randomizeConflicts&&randomizeConflicts.length>0&&(
              <div style={{padding:"9px 10px",borderRadius:"9px",background:"#fdeeed",border:"1px solid rgba(220,60,60,0.18)",display:"flex",flexDirection:"column",gap:"4px"}}>
                <div style={{fontSize:"9px",fontWeight:700,color:"#c44",letterSpacing:"0.5px",textTransform:"uppercase"}}>Rule conflicts ({randomizeConflicts.length})</div>
                {randomizeConflicts.map((c,i)=>(
                  <div key={i} style={{fontSize:"10.5px",fontWeight:500,color:"#a33",lineHeight:1.4}}>· {c}</div>
                ))}
                <div style={{fontSize:"9.5px",color:"rgba(180,40,40,0.6)",marginTop:"2px"}}>Best possible seating shown — drag students to fix by hand if needed.</div>
              </div>
            )}
          </div>
        )}

        {/* Display — whether flagged checklist items show as dots by names in the
            Seating tab (same setting as the 🚩 toggle in that tab's header) */}
        {activeClass&&(
          <button className="cpb" onClick={()=>onSetShowFlags?.(!showFlags)} title="Show a 🚩 dot next to students with flagged checklist items in the Seating tab (the Seating tab's own 🚩 toggle is the same setting)" style={{width:"100%",display:"flex",alignItems:"center",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${showFlags?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:showFlags?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start",fontFamily:"'Source Sans 3',sans-serif"}}>
            <CPSwitch on={showFlags} small/>
            <span style={{fontSize:"11px",fontWeight:600,color:showFlags?"#2e6bce":"rgba(0,0,0,0.4)"}}>🚩 Show flags</span>
          </button>
        )}

        {/* Student list */}
        {activeClass&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase"}}>
              Students
              {unplaced.length>0&&<span style={{marginLeft:"6px",fontSize:"9px",fontWeight:700,color:"#2e6bce",background:"#eaf1fc",padding:"1px 5px",borderRadius:"5px"}}>{unplaced.length}</span>}
            </div>
            {!activeClass.students.length&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.25)",fontStyle:"italic"}}>No students in class</div>}
            <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
              {unplaced.map(st=>{
                const stFlags=flagsByStudent?.get(st.id)||[];
                return(
                <div key={st.id} onMouseDown={e=>startStudentDrag(e,st.id,null)}
                  style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 8px",borderRadius:"7px",background:"#fff",border:"1px solid rgba(0,0,0,0.07)",fontSize:"12px",fontWeight:500,color:"#1a1a2e",cursor:"grab",userSelect:"none"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#eaf1fc";e.currentTarget.style.borderColor="rgba(66,133,244,0.2)";e.currentTarget.style.color="#2e6bce";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor="rgba(0,0,0,0.07)";e.currentTarget.style.color="#1a1a2e";}}
                >
                  <span style={{flex:1,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{st.name}</span>
                  {st.gender&&<span style={{fontSize:"9px",fontWeight:700,padding:"1px 5px",borderRadius:"5px",background:"rgba(0,0,0,0.05)",color:"rgba(0,0,0,0.4)",flexShrink:0}}>{st.gender}</span>}
                  {st.grade&&<span style={{fontSize:"9px",fontWeight:700,padding:"1px 5px",borderRadius:"5px",background:"rgba(0,0,0,0.05)",color:"rgba(0,0,0,0.4)",flexShrink:0}}>{st.grade}</span>}
                  <FlagDots flags={stFlags} size={7}/>
                </div>
                );
              })}
              {unplaced.length===0&&activeClass.students.length>0&&(
                <div style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontStyle:"italic",padding:"4px 0"}}>All seated ✓</div>
              )}
            </div>
          </div>
        )}

        {/* Edit room: walls, doors and windows, and the room's fixed items. Tables are dimmed while it's on. */}
        {activeClass&&(()=>{
          const wObj=roomMode&&selWall?walls.find(w=>w.id===selWall):null;
          const oObj=roomMode&&selOpening?openings.find(o=>o.id===selOpening):null;
          const oWall=oObj?walls.find(w=>w.id===oObj.wallId):null;
          const sec={fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)"};
          const seg=on=>({flex:1,padding:"5px 0",border:"none",cursor:"pointer",fontSize:"10px",fontWeight:700,background:on?"#1a1a2e":"#fff",color:on?"#fff":"rgba(0,0,0,0.45)",fontFamily:"'Source Sans 3',sans-serif"});
          return(
            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              <button className={`cpb${roomMode?" on":""}`} onClick={()=>{const n=!roomMode;setRoomMode(n);setSelWall(null);setSelOpening(null);setWallDraft(null);if(n){setSel(new Set());setSelPieces(new Set());}}}
                title="Edit room: draw walls, doors and windows, and arrange the room's fixed items. Tables are dimmed while this is on, so they can't be moved by accident."
                style={{...btnS,width:"100%",textAlign:"left",display:"flex",justifyContent:"space-between",background:roomMode?"#eaf1fc":"#fff",color:roomMode?"#2e6bce":"rgba(0,0,0,0.5)",border:`1px solid ${roomMode?"rgba(66,133,244,0.4)":"rgba(0,0,0,0.08)"}`}}>
                <span>🧱 Edit room</span>{roomMode&&<span style={{fontSize:"10px"}}>✓ on</span>}
              </button>
              {roomMode&&(
                <div style={{padding:"8px",borderRadius:"9px",background:"#f4f8fe",border:"1px solid rgba(66,133,244,0.2)",display:"flex",flexDirection:"column",gap:"6px"}}>
                  <div style={{display:"flex",borderRadius:"7px",overflow:"hidden",border:"1px solid rgba(0,0,0,0.08)"}}>
                    <button className={`cpb${drawTool==='wall'?" on":""}`} onClick={()=>setDrawTool('wall')} title="Dragging on the floor draws a wall" style={seg(drawTool==='wall')}>Draw walls</button>
                    <button className={`cpb${drawTool==='line'?" on":""}`} onClick={()=>setDrawTool('line')} title="Dragging on the floor draws a free line (a boundary, walkway or fire exit route)" style={seg(drawTool==='line')}>Draw lines</button>
                  </div>
                  <div style={{fontSize:"10.5px",color:"#2e4f85",lineHeight:1.4}}>{drawTool==='line'?"Drag on the floor to draw a line. It snaps to the grid and to 0°, 45° and 90°.":"Drag on the floor to draw a wall (it snaps to the grid and to 0°, 45° and 90°). Drag a door or window onto a wall."}</div>
                  <button className="cpb" onClick={addRectRoom} title="Draw four walls round everything that's on the canvas now, with a margin" style={{...btnS,fontSize:"11.5px",textAlign:"left"}}>▭ Rectangle room</button>
                  <div style={sec}>Doors &amp; windows</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px"}}>
                    {Object.entries(OPENING_TYPES).map(([k,o])=>(
                      <button className="cpb" key={k} onMouseDown={e=>startOpeningDrag(e,k)} title={`${o.name}: drag it onto a wall (or click to put it on the selected wall)`}
                        style={{...btnS,padding:"6px 2px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",cursor:"grab"}}>
                        <svg width="38" height="26" viewBox="0 0 38 26" aria-hidden="true">
                          <rect x="0" y="9" width="38" height="8" style={{fill:"#d9cdb8",stroke:"#2b2118",strokeWidth:1.2}}/>
                          {k==="window"
                            ?<><rect x="9" y="9" width="20" height="8" style={{fill:"#cdeefa",stroke:"#2b2118",strokeWidth:1.3}}/><line x1="9" y1="13" x2="29" y2="13" style={{stroke:"#2b2118",strokeWidth:1}}/></>
                            :<><rect x="9" y="8" width="20" height="10" style={{fill:"#f3f8f6"}}/><line x1="9" y1="7" x2="9" y2="19" style={{stroke:"#2b2118",strokeWidth:2}}/><line x1="29" y1="7" x2="29" y2="19" style={{stroke:"#2b2118",strokeWidth:2}}/>
                              {k==="door"?<path d="M9 18 L9 25 A14 14 0 0 0 23 18" style={{fill:"rgba(210,245,251,0.8)",stroke:"#2b2118",strokeWidth:1,strokeDasharray:"2 2"}}/>:<><path d="M9 18 L9 25 A7 7 0 0 0 16 18" style={{fill:"rgba(210,245,251,0.8)",stroke:"#2b2118",strokeWidth:1,strokeDasharray:"2 2"}}/><path d="M29 18 L29 25 A7 7 0 0 1 22 18" style={{fill:"rgba(210,245,251,0.8)",stroke:"#2b2118",strokeWidth:1,strokeDasharray:"2 2"}}/></>}</>}
                        </svg>
                        <span style={{fontSize:"9.5px",color:"rgba(0,0,0,0.5)",lineHeight:1.1}}>{k==="double-door"?"Double":o.name}</span>
                      </button>
                    ))}
                  </div>
                  {wObj&&(
                    <div style={{display:"flex",flexDirection:"column",gap:"4px",paddingTop:"4px",borderTop:"1px solid rgba(66,133,244,0.15)"}}>
                      <div style={{fontSize:"12px",fontWeight:700,color:"#1a1a2e"}}>Wall <span style={{fontWeight:500,color:"rgba(0,0,0,0.4)"}}>· {Math.round(wallLen(wObj))} px · {openings.filter(o=>o.wallId===wObj.id).length} opening{openings.filter(o=>o.wallId===wObj.id).length===1?"":"s"}</span></div>
                      <div style={{fontSize:"10px",color:"rgba(0,0,0,0.4)",lineHeight:1.35}}>Drag it to move it, or drag its end dots to stretch it.</div>
                      <button className="cpb cpb-warn" onClick={handleDelete} title="Remove this wall (and any door or window on it). Key: Delete" style={{...btnS,color:"#c44",border:"1px solid rgba(200,60,60,0.15)"}}>Delete wall</button>
                    </div>
                  )}
                  {oObj&&(
                    <div style={{display:"flex",flexDirection:"column",gap:"4px",paddingTop:"4px",borderTop:"1px solid rgba(66,133,244,0.15)"}}>
                      <div style={{fontSize:"12px",fontWeight:700,color:"#1a1a2e"}}>{OPENING_TYPES[oObj.type]?.name}</div>
                      <div style={{display:"flex",borderRadius:"7px",overflow:"hidden",border:"1px solid rgba(0,0,0,0.08)"}}>
                        {Object.entries(OPENING_TYPES).map(([k,o])=>(
                          <button className={`cpb${oObj.type===k?" on":""}`} key={k} onClick={()=>patchOpening(oObj.id,x=>({...x,type:k,width:oWall?Math.min(o.width,Math.max(32,wallLen(oWall)-8)):o.width,t:oWall?clampOpeningT(oWall,o.width,x.t):x.t}))} title={`Make this a ${o.name.toLowerCase()}`} style={seg(oObj.type===k)}>{k==="double-door"?"Double":o.name}</button>
                        ))}
                      </div>
                      {oObj.type!=="window"&&(
                        <div style={{display:"flex",gap:"4px"}}>
                          {oObj.type==="door"&&<button className="cpb" onClick={()=>patchOpening(oObj.id,x=>({...x,flip:!x.flip}))} title="Move the hinge to the other end of the door" style={{...btnS,flex:1,padding:"6px 0"}}>⇆ Flip</button>}
                          <button className="cpb" onClick={()=>patchOpening(oObj.id,x=>({...x,swing:x.swing===-1?1:-1}))} title="Make the door open to the other side of the wall" style={{...btnS,flex:1,padding:"6px 0"}}>⇅ Swing</button>
                        </div>
                      )}
                      <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                        <span style={{fontSize:"10.5px",color:"rgba(0,0,0,0.4)",fontWeight:600,flex:1}}>Width {oObj.width}</span>
                        <button className="cpb" onClick={()=>patchOpening(oObj.id,x=>{const w=Math.max(32,x.width-8);return{...x,width:w,t:oWall?clampOpeningT(oWall,w,x.t):x.t};})} title="Make it narrower" style={{...btnS,padding:"4px 10px"}}>−</button>
                        <button className="cpb" onClick={()=>patchOpening(oObj.id,x=>{const w=Math.min(oWall?Math.max(32,wallLen(oWall)-8):160,x.width+8);return{...x,width:w,t:oWall?clampOpeningT(oWall,w,x.t):x.t};})} title="Make it wider" style={{...btnS,padding:"4px 10px"}}>+</button>
                      </div>
                      <button className="cpb cpb-warn" onClick={handleDelete} title="Remove this door or window. Key: Delete" style={{...btnS,color:"#c44",border:"1px solid rgba(200,60,60,0.15)"}}>Delete {OPENING_TYPES[oObj.type]?.name.toLowerCase()}</button>
                    </div>
                  )}
                  <button className="cpb cpb-primary" onClick={()=>{setRoomMode(false);setSelWall(null);setSelOpening(null);}} title="Finish editing the room" style={{...btnS,background:"#1a1a2e",color:"#fff",border:"none",fontSize:"11.5px"}}>Done</button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Add table presets — tucked into a popover so the six presets don't
            sit permanently expanded, taking up a third of a narrow sidebar */}
        <div ref={addTableMenu.anchorRef} style={{position:"relative"}}>
          <button className={`cpb${addTableMenu.pos?" on":""}`} onClick={addTableMenu.toggle} title="Add a new desk or table to the room" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:addTableMenu.pos?"#f0f1f4":"#fff"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
            onMouseLeave={e=>e.currentTarget.style.background=addTableMenu.pos?"#f0f1f4":"#fff"}
          ><span>+ Add table</span><span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span></button>
          {groups.length>0&&(
            <button className="cpb" onClick={()=>setShowManageGroups(true)} style={{...btnS,marginTop:"6px",fontSize:"11px",width:"100%",textAlign:"left"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >🏷 Manage table groups…</button>
          )}
        </div>
        {addTableMenu.pos&&createPortal(
          <div className="cp-pop" ref={addTableMenu.menuRef} style={{position:"fixed",left:addTableMenu.pos.left,...(addTableMenu.pos.top!=null?{top:addTableMenu.pos.top}:{bottom:addTableMenu.pos.bottom}),maxHeight:addTableMenu.pos.maxHeight,overflowY:"auto",zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"276px",fontFamily:"'Source Sans 3',sans-serif"}}>
            {/* Table shapes: they rotate, and snap together edge to edge */}
            <div style={menuHead}>Tables</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px",marginBottom:"10px"}}>
              {[
                {kind:'single',label:'Single desk',tip:'One desk, one seat'},
                {kind:'pair',label:'Pair',tip:'A desk for two'},
                {kind:'long4',label:'Long table',tip:'Long table: 2 seats on each long side (the ends can be switched on too)'},
                {kind:'long6',label:'Long of 6',tip:'Long table: 3 seats on each long side'},
                {kind:'trap',label:'Trapezoid',tip:'Trapezoid: one seat on each side. Two joined long side to long side make a hexagon'},
                {kind:'round',label:'Round',tip:'Round table for 4 (5 or 6 from its menu once added)'},
                {kind:'bench',label:'Lab bench',tip:'Lab bench (a workstation): 4 standing places on one side, the back can be switched on'},
              ].map(o=>(
                <button className="cpb" key={o.kind} onClick={()=>{addPieceSet(o.kind);addTableMenu.close();}} title={`Add: ${o.tip}`} style={{...btnS,padding:"7px 3px 5px",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                ><PieceThumb kind={o.kind} size={42}/><span style={{fontSize:"10px",color:"rgba(0,0,0,0.5)",lineHeight:1.1}}>{o.label}</span></button>
              ))}
            </div>
            <div style={menuHead}>Ready-made</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px"}}>
              {['hexagon','long8','horseshoe'].map(k=>(
                <button className="cpb" key={k} onClick={()=>{addPieceSet(k);addTableMenu.close();}} title={`Add: ${PIECE_COMBOS[k].name} (${PIECE_COMBOS[k].hint}), already joined`} style={{...btnS,padding:"7px 3px 5px",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                ><PieceThumb kind={k} size={46}/><span style={{fontSize:"10px",color:"rgba(0,0,0,0.5)",lineHeight:1.1,textAlign:"center"}}>{PIECE_COMBOS[k].name}</span></button>
              ))}
            </div>
          </div>,
          document.body
        )}

        {/* Room items: the catalogue (searchable, with small drawings) — same popover style as Add table */}
        <div ref={roomMenu.anchorRef} style={{position:"relative"}}>
          <button className={`cpb${roomMenu.pos?" on":""}`} onClick={roomMenu.toggle} title="Add a classroom or science-lab item to the room (sink, fume cupboard, eyewash, bin, board…) and give it a label" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:roomMenu.pos?"#f0f1f4":"#fff"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
            onMouseLeave={e=>e.currentTarget.style.background=roomMenu.pos?"#f0f1f4":"#fff"}
          ><span>+ Room items</span><span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span></button>
        </div>
        {roomMenu.pos&&createPortal(
          <div className="cp-pop" ref={roomMenu.menuRef} style={{position:"fixed",left:roomMenu.pos.left,...(roomMenu.pos.top!=null?{top:roomMenu.pos.top}:{bottom:roomMenu.pos.bottom}),maxHeight:Math.min(580,roomMenu.pos.maxHeight),overflowY:"auto",zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"324px",fontFamily:"'Source Sans 3',sans-serif"}}>
            <ItemCatalogBody onAddItem={t=>{addRoomItem(t);roomMenu.close();}} onAddBench={()=>{addPieceSet('bench');roomMenu.close();}} btnS={btnS} menuHead={menuHead}/>
          </div>,
          document.body
        )}
        {(sel.size>0||activeSelPieces.length>0)&&(
          <div>
            <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase",marginBottom:"8px"}}>
              {activeSelPieces.length?'Selected table':`Selected (${sel.size})`}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
              {activeSelPieces.length>0&&(()=>{
                /* ── Piece menu: rotate, seats on/off, roles, label, separate, delete ── */
                const selP=pieces.filter(p=>activeSelPieces.includes(p.id));
                const focus=selP.find(p=>p.id===focusPiece)||selP[0];
                const nSeats=seats.filter(s=>activeSelPieces.includes(s.pieceId)).length;
                const cl=clusterOfPiece(focus.id);
                const roleOf=r=>(r||[]).includes('workstation')?((r||[]).includes('desk')?'both':'workstation'):'desk';
                const curRole=roleOf(focus.roles);
                const seatedHere=seats.filter(s=>activeSelPieces.includes(s.pieceId)&&s.studentId).length;
                // lab benches have standing spots, not chairs, so say "place" rather than "seat" for them
                const stand=selP.length>0&&selP.every(pgStanding),placeWord=stand?'place':'seat';
                const seg=(on)=>({flex:1,padding:"5px 0",border:"none",cursor:"pointer",fontSize:"10.5px",fontWeight:700,background:on?"#1a1a2e":"#fff",color:on?"#fff":"rgba(0,0,0,0.45)",fontFamily:"'Source Sans 3',sans-serif"});
                return(
                  <>
                    <div style={{fontSize:"12.5px",fontWeight:700,color:"#1a1a2e",lineHeight:1.3}}>
                      {selP.length===1?SHAPES[focus.shape]?.name:`${selP.length} pieces joined`}
                      <span style={{fontWeight:500,color:"rgba(0,0,0,0.4)"}}> · {nSeats} {placeWord}{nSeats!==1?'s':''}</span>
                    </div>
                    <div style={{display:"flex",gap:"4px"}}>
                      <button className="cpb" onClick={()=>rotatePiecesBy(activeSelPieces,-15)} title="Turn 15° anticlockwise (key: [ )" style={{...btnS,flex:1,padding:"6px 0"}}>↺ 15°</button>
                      <button className="cpb" onClick={()=>rotatePiecesBy(activeSelPieces,90)} title="Turn a quarter turn clockwise" style={{...btnS,flex:1.3,padding:"6px 0",color:"#1a1a2e"}}>⟳ 90°</button>
                      <button className="cpb" onClick={()=>rotatePiecesBy(activeSelPieces,15)} title="Turn 15° clockwise (key: ] )" style={{...btnS,flex:1,padding:"6px 0"}}>↻ 15°</button>
                    </div>
                    <button className="cpb" onClick={()=>rotatePiecesBy(activeSelPieces,180)} title="Flip the table round so the chairs are on the other side" style={btnS}>⇅ Flip</button>
                    <button className={`cpb${editSeats?" on":""}`} onClick={()=>setEditSeats(v=>!v)} title={stand?"Click the standing spots round the bench to switch places on or off, e.g. the back of a lab bench":"Click the chairs round the table to switch seats on or off, e.g. the ends of a long table or the back of a lab bench"}
                      style={{...btnS,background:editSeats?"#eaf1fc":"#fff",color:editSeats?"#2e6bce":"rgba(0,0,0,0.5)",border:`1px solid ${editSeats?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`}}>{editSeats?`✓ Done editing ${placeWord}s`:`✎ Edit ${placeWord}s…`}</button>
                    {focus.shape==='round'&&(
                      <div title="How many seats round this table" style={{display:"flex",alignItems:"center",gap:"6px"}}>
                        <span style={{fontSize:"10.5px",color:"rgba(0,0,0,0.4)",fontWeight:600}}>Seats</span>
                        <div style={{display:"flex",flex:1,borderRadius:"7px",overflow:"hidden",border:"1px solid rgba(0,0,0,0.08)"}}>
                          {[4,5,6].map(n=><button className={`cpb${(focus.seatCount||4)===n?" on":""}`} key={n} onClick={()=>updatePieces([focus.id],p=>({...p,seatCount:n,seatsOff:(p.seatsOff||[]).filter(i=>i<n)}))} title={`${n} seats round this table`} style={seg((focus.seatCount||4)===n)}>{n}</button>)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",margin:"4px 0 4px"}}>Use for</div>
                      <div style={{display:"flex",borderRadius:"7px",overflow:"hidden",border:"1px solid rgba(0,0,0,0.08)"}}>
                        {[['desk','Table',['desk']],['workstation','Workstation',['workstation']],['both','Both',['desk','workstation']]].map(([k,lbl,roles])=>(
                          <button className={`cpb${curRole===k?" on":""}`} key={k} onClick={()=>updatePieces(activeSelPieces,p=>({...p,roles}))} title={k==='desk'?"An everyday table (used by regular seating)":k==='workstation'?"A lab workstation (used by lab seating). Students stand at it, so it shows standing spots instead of chairs":"Counts as both a table and a workstation"} style={seg(curRole===k)}>{lbl}</button>
                        ))}
                      </div>
                    </div>
                    {/* Class setups (Phase 5): leave this table out of generating in the setup that's showing */}
                    {/* shown once the class has a second setup (or this table is already off), so a one-setup class's bar stays short */}
                    {setup&&((setups?.list.length||0)>1||activeSelPieces.some(id=>(setup.offPieces||[]).includes(id)))&&(()=>{
                      const off=activeSelPieces.every(id=>(setup.offPieces||[]).includes(id));
                      const roleOk=selP.some(p=>(p.roles?.length?p.roles:['desk']).some(r=>(setup.use||[]).includes(r)));
                      return(
                        <div>
                          <button className="cpb" onClick={()=>toggleOffPieces(activeSelPieces,!off)} title={off?`Use this table again when generating in ${setup.name}`:`Leave this table out when generating in ${setup.name} (other setups are not changed)`}
                            style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"6px",padding:"5px 8px 5px 10px"}}>
                            <span style={{textAlign:"left",lineHeight:1.2}}>Use in {setup.icon} {setup.name}</span><CPSwitch on={!off} small/>
                          </button>
                          {!off&&!roleOk&&<div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.45)",lineHeight:1.35,marginTop:"3px"}}>{setup.name} seats students at {setupUseText(setup)} only, so this one stays free. Change "Use for" above to include it.</div>}
                        </div>
                      );
                    })()}
                    <input value={focus.label||''} maxLength={24} placeholder="Label on the table…" title="A label written on the table top, e.g. Bench A"
                      onChange={e=>{const v=e.target.value.slice(0,24);updatePieces([focus.id],p=>{const q={...p};if(v)q.label=v;else delete q.label;return q;});}}
                      style={{padding:"6px 8px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",width:"100%",boxSizing:"border-box"}}/>
                    <StationEditor station={focus.station} onToggle={()=>togglePieceStation(focus.id)} onSet={p=>setPieceStation(focus.id,p)} btnS={btnS}/>
                    {cl.length>1&&(
                      <button className="cpb" onClick={()=>separatePiece(focus.id)} title="Pull this piece away from the table it's joined to (or Alt-drag it)" style={btnS}>✂ Separate this piece</button>
                    )}
                    {!pieceDeleteAsk?(
                      <button className="cpb cpb-warn" onClick={()=>requestDeletePieces(activeSelPieces)} title="Remove this table from the room" style={{...btnS,color:"#c44",border:"1px solid rgba(200,60,60,0.15)"}}>Delete table</button>
                    ):(
                      <div style={{padding:"8px",borderRadius:"8px",background:"#fdeeed",border:"1px solid rgba(200,60,60,0.2)"}}>
                        <div style={{fontSize:"11px",color:"#a33",fontWeight:600,lineHeight:1.4,marginBottom:"6px"}}>{seatedHere} student{seatedHere!==1?'s':''} will go back to the student list. Delete this table?</div>
                        <div style={{display:"flex",gap:"4px"}}>
                          <button className="cpb cpb-danger" onClick={()=>deletePieces(activeSelPieces)} title="Yes, delete the table" style={{...btnS,flex:1,background:"#eb5757",color:"#fff",border:"none",padding:"5px 0"}}>Delete</button>
                          <button className="cpb" onClick={()=>setPieceDeleteAsk(false)} title="Keep the table" style={{...btnS,flex:1,padding:"5px 0"}}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              {(()=>{
                /* ── Table colour: a row of swatches whenever a table is picked (a group via its tab, a table piece, or a seat that has a table) ── */
                if(!colourTargets().any)return null;
                const cur=currentTableColor();
                return(
                  <div data-cp-colour-picker>
                    <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",margin:"4px 0 5px"}}>Table colour</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                      {TABLE_COLORS.map(([k,name])=>{
                        const on=cur===k;
                        return(
                          <button key={k} className="cpo" data-cp-colour={k} aria-pressed={on} onClick={()=>setTableColor(k)}
                            title={k==='wood'?"Back to plain wood (the default)":`Colour this table ${name}`}
                            style={{width:23,height:23,padding:0,borderRadius:7,background:tableFill(k),boxShadow:on?"0 0 0 2.5px var(--cp-sel)":"none",transform:on?"scale(1.08)":"none",position:"relative",overflow:"hidden"}}>
                            <span aria-hidden="true" style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(122deg,var(--cp-hatch-light) 0 1px,transparent 1px 5px)"}}/>
                            {on&&<span aria-hidden="true" style={{position:"relative",fontSize:12,fontWeight:900,color:"#2b2118",lineHeight:1}}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {/* Plain desks → a real table shape */}
              {convertTargetIds&&(
                <div ref={convertMenu.anchorRef}>
                  <button className={`cpb${convertMenu.pos?" on":""}`} onClick={convertMenu.toggle} title="Swap these desks for a table shape (long table, trapezoid, hexagon…). Everyone moves across in the same order, and Undo puts it back"
                    style={{...btnS,width:"100%",display:"flex",justifyContent:"space-between",background:convertMenu.pos?"#eaf1fc":"#fff",color:"#2e6bce",border:"1px solid rgba(66,133,244,0.25)"}}>
                    <span>Convert to table</span><span>▸</span>
                  </button>
                </div>
              )}
              {convertTargetIds&&convertMenu.pos&&createPortal(
                <div className="cp-pop" ref={convertMenu.menuRef} style={{position:"fixed",left:convertMenu.pos.left+190,...(convertMenu.pos.top!=null?{top:convertMenu.pos.top-34}:{bottom:convertMenu.pos.bottom}),maxHeight:convertMenu.pos.maxHeight,overflowY:"auto",zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"210px",display:"flex",flexDirection:"column",gap:"4px",fontFamily:"'Source Sans 3',sans-serif"}}>
                  <div style={menuHead}>{convertTargetIds.length} seat{convertTargetIds.length!==1?'s':''} → which table?</div>
                  {convertOptions(convertTargetIds.length).map(o=>{
                    const name=o.kind==='round'?`Round table (${o.seatCount})`:SHAPES[o.kind]?.name||PIECE_COMBOS[o.kind]?.name||`Row of ${o.kind.slice(3)} long tables`;
                    return(
                      <button className="cpb" key={o.kind+(o.seatCount||'')} onClick={()=>convertTo(o)} title={`Make this a ${name.toLowerCase()} with ${o.seats} seats`} style={{...btnS,display:"flex",alignItems:"center",gap:"8px",padding:"5px 8px",textAlign:"left"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                        onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                        <PieceThumb kind={o.kind} seatCount={o.seatCount} size={34}/>
                        <span style={{flex:1,fontSize:"11.5px",color:"#1a1a2e"}}>{name}</span>
                        <span style={{fontSize:"10px",color:"rgba(0,0,0,0.35)"}}>{o.seats}</span>
                      </button>
                    );
                  })}
                </div>,
                document.body
              )}
              {sel.size>=2&&!selSeats.some(s=>s.pieceId)&&(
                <button className="cpb cpb-sky" onClick={handleGroup} title="Combine the selected desks into one table group" style={{...btnS,background:"#eaf1fc",color:"#2e6bce",border:"1px solid rgba(66,133,244,0.2)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#d4e4fb"}
                  onMouseLeave={e=>e.currentTarget.style.background="#eaf1fc"}
                >Group</button>
              )}
              {anyGrouped&&!selSeats.some(s=>s.pieceId)&&(
                <button className="cpb" onClick={handleUngroup} title="Dissolve the table group — seats stay where they are" style={btnS}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >Ungroup</button>
              )}
              {selSeats.length>0&&!selSeats.some(s=>s.pieceId)&&(
                <button className="cpb" onClick={handleFlipChairs} title="Put the chairs on the other side of this table" style={btnS}>⇅ Flip chairs</button>
              )}
              {!isGrpSel&&selSeats.length===1&&(
                <button className="cpb" onClick={()=>{const s=selSeats[0];const nextS=seats.map(x=>x.id===s.id?{...x,used:!x.used}:x);setSeats(nextS);doSave(nextS,groups,avTags,roomItems,rules);}} title={selSeats[0].used?"Take this seat out of use — it won't be filled by Randomize":"Put this seat back into use"} style={btnS}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >{selSeats[0].used?'Mark unused':'Mark used'}</button>
              )}
              {sel.size>=1&&(()=>{
                const ids=Array.from(sel);
                const allIds=new Set(ids);
                if(selType==='group'){ids.forEach(id=>{const s=seats.find(x=>x.id===id);if(s?.groupId){const g=groups.find(x=>x.id===s.groupId);g?.seatIds.forEach(sid=>allIds.add(sid));}});}
                const anyUnavailable=Array.from(allIds).some(id=>seats.find(s=>s.id===id)?.unavailable);
                const allUnavailable=Array.from(allIds).every(id=>seats.find(s=>s.id===id)?.unavailable);
                return(
                  <button className={`cpb${allUnavailable?" cpb-danger":""}`} onClick={toggleUnavailable}
                    style={{...btnS,background:allUnavailable?"#fdeeed":"#fff",color:allUnavailable?"#c44":"rgba(0,0,0,0.5)",border:allUnavailable?"1px solid rgba(200,60,60,0.2)":"1px solid rgba(0,0,0,0.08)"}}
                    onMouseEnter={e=>e.currentTarget.style.background=allUnavailable?"#f9dede":"#f0f1f4"}
                    onMouseLeave={e=>e.currentTarget.style.background=allUnavailable?"#fdeeed":"#fff"}
                    title={isGrpSel?"Toggle unavailable for whole group":"Toggle unavailable"}
                  >{allUnavailable?'✓ Unavailable':anyUnavailable?'Unavailable (partial)':'Mark unavailable'}</button>
                );
              })()}
              {!activeSelPieces.length&&(
                <button className="cpb cpb-warn" onClick={handleDelete} title={selSeats.some(s=>s.pieceId)?"Switch the selected seat(s) off — the table keeps that place, and Edit seats can switch it back on":"Remove the selected seat(s) or room item from the room entirely"} style={{...btnS,color:"#c44",border:"1px solid rgba(200,60,60,0.15)"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#fdeeed";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="#fff";}}
                >{selSeats.length&&selSeats.every(s=>s.pieceId)?'Switch seat off':'Delete'}</button>
              )}
            </div>
          </div>
        )}

        {/* The picked room item: label, turn, fixed, station, delete. Size is by the handles on the map. */}
        {selItem&&(()=>{
          const t=ROOM_ITEM_TYPES[selItem.type],g=itemGeom(selItem);
          const shown=selItem.label??t?.name??'';
          return(
            <div>
              <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase",marginBottom:"8px"}}>Selected item</div>
              <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                <div style={{fontSize:"12.5px",fontWeight:700,color:"#1a1a2e",lineHeight:1.3}}>{t?.name||'Door'}<span style={{fontWeight:500,color:"rgba(0,0,0,0.4)"}}> · {Math.round(g.w)}×{Math.round(g.h)}</span></div>
                <input key={`${selItem.id}:${shown}`} defaultValue={shown} maxLength={40} placeholder="Label…" title="The name shown on the map in a little paper tag, e.g. Sink A. Leave it empty for no label. (You can also double-click the item.)"
                  onBlur={e=>{if(e.target.value!==shown)setItemLabel(selItem.id,e.target.value);}}
                  onKeyDown={e=>{if(e.key==='Enter')e.target.blur();e.stopPropagation();}}
                  style={{padding:"6px 8px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",width:"100%",boxSizing:"border-box"}}/>
                <div style={{display:"flex",gap:"4px"}}>
                  <button className="cpb" onClick={()=>rotateRoomItem(selItem.id,-15)} title="Turn 15° anticlockwise (key: [ )" style={{...btnS,flex:1,padding:"6px 0"}}>↺ 15°</button>
                  <button className="cpb" onClick={()=>rotateRoomItem(selItem.id,90)} title="Turn a quarter turn clockwise" style={{...btnS,flex:1.3,padding:"6px 0",color:"#1a1a2e"}}>⟳ 90°</button>
                  <button className="cpb" onClick={()=>rotateRoomItem(selItem.id,15)} title="Turn 15° clockwise (key: ] )" style={{...btnS,flex:1,padding:"6px 0"}}>↻ 15°</button>
                </div>
                {(selItem.type==='area'||selItem.type==='line')&&(
                  <div title="Colour from the icon palette" style={{display:"flex",gap:"5px",alignItems:"center"}}>
                    <span style={{fontSize:"10.5px",color:"rgba(0,0,0,0.4)",fontWeight:600,marginRight:"2px"}}>Colour</span>
                    {(selItem.type==='line'?['ink',...Object.keys(AREA_COLOURS)]:Object.keys(AREA_COLOURS)).map(c=>(
                      <button key={c} onClick={()=>patchItem(selItem.id,r=>({...r,color:c}))} title={`Make it ${c}`}
                        style={{width:"20px",height:"20px",borderRadius:"50%",padding:0,cursor:"pointer",background:c==='ink'?"#2b2118":AREA_COLOURS[c].replace(/var\(--cp-(\w+)\)/,(m,n)=>({mint:"#b2efc4",sky:"#9ccaf9",cyan:"#d2f5fb",coral:"#ffb3a1"}[n])),border:(selItem.color||(selItem.type==='area'?'mint':'ink'))===c?"2.5px solid #2e6bce":"1.5px solid rgba(0,0,0,0.35)"}}/>
                    ))}
                  </div>
                )}
                {selItem.type==='line'&&(
                  <div style={{display:"flex",gap:"4px"}}>
                    <button className={`cpb${selItem.dashed?" on":""}`} onClick={()=>patchItem(selItem.id,r=>({...r,dashed:!r.dashed}))} title="Switch between a solid and a dashed line" style={{...btnS,flex:1,padding:"6px 0",background:selItem.dashed?"#eaf1fc":"#fff",color:selItem.dashed?"#2e6bce":"rgba(0,0,0,0.5)"}}>┄ Dashed</button>
                    <button className={`cpb${selItem.arrow?" on":""}`} onClick={()=>patchItem(selItem.id,r=>({...r,arrow:!r.arrow}))} title="Add or remove an arrow head at the end of the line" style={{...btnS,flex:1,padding:"6px 0",background:selItem.arrow?"#eaf1fc":"#fff",color:selItem.arrow?"#2e6bce":"rgba(0,0,0,0.5)"}}>→ Arrow</button>
                  </div>
                )}
                <label title="Fixed items are part of the room itself (sinks, fume cupboards, boards). They are saved with the room and stay put when you load a different layout of it." style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11.5px",fontWeight:600,color:"rgba(0,0,0,0.55)",cursor:"pointer"}}>
                  <input type="checkbox" checked={!!selItem.fixed} onChange={()=>toggleItemFixed(selItem.id)}/> Fixed — part of the room
                </label>
                <StationEditor station={selItem.station} onToggle={()=>toggleItemStation(selItem.id)} onSet={p=>setItemStation(selItem.id,p)} btnS={btnS}/>
                <button className="cpb cpb-warn" onClick={handleDelete} title="Remove this item from the room. Key: Delete" style={{...btnS,color:"#c44",border:"1px solid rgba(200,60,60,0.15)"}}>Delete</button>
              </div>
            </div>
          );
        })()}

        {/* Rooms — the room library: a room is its walls, doors, windows and fixed items, plus saved layouts
            of its movable furniture. Tucked into a popover like the others. */}
        <div style={{borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:"14px"}}>
          <div ref={layoutsMenu.anchorRef} style={{position:"relative"}}>
            <button className={`cpb${layoutsMenu.pos?" on":""}`} onClick={()=>{loadRooms().then(setRooms);layoutsMenu.toggle();}} title="Rooms: save this room (walls, doors, fixed items) and several layouts of its furniture, then use them for any class" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:layoutsMenu.pos?"#f0f1f4":"#fff"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background=layoutsMenu.pos?"#f0f1f4":"#fff"}
            >
              <span>🏫 Rooms{rooms.filter(r=>!r.legacy).length>0?` (${rooms.filter(r=>!r.legacy).length})`:''}</span>
              <span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span>
            </button>
          </div>
        </div>
        {layoutsMenu.pos&&createPortal(
          <div className="cp-pop" ref={layoutsMenu.menuRef} style={{position:"fixed",left:layoutsMenu.pos.left,...(layoutsMenu.pos.top!=null?{top:layoutsMenu.pos.top}:{bottom:layoutsMenu.pos.bottom}),zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"292px",maxHeight:Math.min(560,layoutsMenu.pos.maxHeight),overflowY:"auto",fontFamily:"'Source Sans 3',sans-serif"}}>
            <RoomsPopover rooms={rooms} legacy={rooms.some(r=>r.legacy)?[]:savedLayouts} link={roomLink} btnS={btnS} menuHead={menuHead}
              onSaveNew={saveAsNewRoom} onSaveLayout={saveLayoutToRoom}
              onUse={(room,layout)=>{useRoomLayout(room,layout);layoutsMenu.close();}}
              onRename={renameRoom} onDuplicate={duplicateRoom} onDelete={deleteRoom} onDeleteLayout={deleteRoomLayout}
              onLoadLegacy={l=>{requestLoadLayout(l);layoutsMenu.close();}}
              onShare={()=>pushShell(committedObj(),true)} onAdopt={adoptSharedShell}/>
          </div>,
          document.body
        )}

        {/* Stations (Phase 7): this setup's stations in order, and which groups rotate round them. Collapsed until opened. */}
        <div>
          <div ref={stationsMenu.anchorRef} style={{position:"relative"}}>
            <button className={`cpb${stationsMenu.pos?" on":""}`} onClick={stationsMenu.toggle} title="Stations: put groups at the stations in this room and rotate them with a timer" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:stationsMenu.pos?"#f0f1f4":"#fff"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background=stationsMenu.pos?"#f0f1f4":"#fff"}
            >
              <span>🔄 Stations{stationList.length>0?` (${stationList.length})`:''}</span>
              <span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span>
            </button>
          </div>
        </div>
        {stationsMenu.pos&&createPortal(
          <div className="cp-pop" ref={stationsMenu.menuRef} style={(()=>{
            /* longer than the other popovers, so it opens beside the button (not under it) and as tall as the window allows */
            const r=stationsMenu.anchorRef.current?.getBoundingClientRect();
            const top=Math.max(10,Math.min(r?r.top:10,window.innerHeight-600));
            return{position:"fixed",left:(r?r.right:stationsMenu.pos.left)+8,top,zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"300px",maxHeight:window.innerHeight-top-10,overflowY:"auto"};
          })()}>
            <StationsPopover classId={activeClass?.id} students={activeClass?.students||[]} stations={stationList} setupName={setup?.name||'Regular'} running={rotationHere} btnS={btnS} menuHead={menuHead}
              onReorder={reorderStations} onRename={renameStation}
              onStart={groupsPicked=>{setStartRot({groups:groupsPicked});stationsMenu.close();}}/>
          </div>,
          document.body
        )}
        {startRot&&<RotationStartDialog stationCount={stationList.length} groups={startRot.groups} onClose={()=>setStartRot(null)}
          onStart={cfg=>{
            onStartRotation?.({...cfg,setupId:setupId||REGULAR_SETUP,stations:stationList.map(s=>({id:s.id,label:stationLabel(s)}))});
            setStartRot(null);
            showNotice(`Rotation started. Its timer is in the Timer tab${cfg.autoStart?' and already running':', paused until you press Start'}.`);
          }}/>}

        {/* Previous arrangements — auto history of confirmed seatings, last 10,
            also tucked into a popover */}
        <div>
          <div ref={arrangementsMenu.anchorRef} style={{position:"relative"}}>
            <button className={`cpb${arrangementsMenu.pos?" on":""}`} onClick={arrangementsMenu.toggle} title="Restore who was sitting where from an earlier confirmed seating" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:arrangementsMenu.pos?"#f0f1f4":"#fff"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background=arrangementsMenu.pos?"#f0f1f4":"#fff"}
            >
              <span>🕐 Previous arrangements{setupHistory.length>0?` (${setupHistory.length})`:''}</span>
              <span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span>
            </button>
          </div>
        </div>
        {arrangementsMenu.pos&&createPortal(
          <div className="cp-pop" ref={arrangementsMenu.menuRef} style={{position:"fixed",left:arrangementsMenu.pos.left,...(arrangementsMenu.pos.top!=null?{top:arrangementsMenu.pos.top}:{bottom:arrangementsMenu.pos.bottom}),zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"216px",maxHeight:Math.min(360,arrangementsMenu.pos.maxHeight),overflowY:"auto",display:"flex",flexDirection:"column",gap:"4px",fontFamily:"'Source Sans 3',sans-serif"}}>
            {setupHistory.length===0&&(
              <div style={{fontSize:"11px",color:"rgba(0,0,0,0.22)",fontStyle:"italic"}}>Hit "Confirm seating" above to start keeping a history</div>
            )}
            {setupHistory.map(h=>(
              <LayoutCard key={h.id} layout={{...h,name:arrangementLabels[h.id]}} onLoad={()=>{requestRestoreArrangement(h);arrangementsMenu.close();}} onDelete={()=>deleteArrangement(h.id)}/>
            ))}
          </div>,
          document.body
        )}

        {/* Remove all students */}
        <button className="cpb" onClick={()=>{const nextS=seats.map(s=>({...s,studentId:null,locked:false}));setSeats(nextS);doSave(nextS,groups,avTags,roomItems,rules);}}
          title="Empty every seat, unlock everything — the room layout itself is untouched" style={{...btnS,width:"100%",marginTop:"auto",color:"rgba(0,0,0,0.35)",fontSize:"11px"}}
          onMouseEnter={e=>{e.currentTarget.style.color="#c44";e.currentTarget.style.borderColor="rgba(200,60,60,0.2)";}}
          onMouseLeave={e=>{e.currentTarget.style.color="rgba(0,0,0,0.35)";e.currentTarget.style.borderColor="rgba(0,0,0,0.08)";}}
        >Remove all students</button>
      </div>

      {/* ── Canvas ── */}
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
      {/* Class setups (Phase 5): a tab per setup above the floor — always shown here, with ＋,
          so the feature can be found. Clicking the empty part of the strip deselects, like the floor. */}
      <div onMouseDown={e=>{if(e.target===e.currentTarget)clearSelection();}}
        style={{position:"absolute",left:0,right:0,top:0,height:SETUP_BAR,boxSizing:"border-box",zIndex:61,display:"flex",alignItems:"center",gap:"10px",padding:"0 12px",background:"#fafbfc",borderBottom:"1px solid rgba(0,0,0,0.07)"}}>
        <SetupTabs setups={setups} manage onSwitch={switchSetup} onNew={()=>{loadRooms().then(setRooms);setShowNewSetup(true);}} onReorder={reorderSetups}
          renderMenu={(s,close)=>(
            <SetupMenuBody key={s?.id} setup={s} canDelete={s?.id!==REGULAR_SETUP} onClose={close}
              onRename={v=>patchSetup(s.id,x=>({...x,name:v}))} onIcon={ic=>patchSetup(s.id,x=>({...x,icon:ic}))}
              onUse={k=>patchSetup(s.id,x=>({...x,use:SETUP_USES[k].slice()}))}
              onDuplicate={()=>duplicateSetup(s)} onDelete={()=>removeSetup(s)}/>
          )}/>
        {strandedCount>0&&setup&&(
          <span title={`Randomize won't seat anyone new there, and moves them when it runs. Furniture ${setup.name} doesn't use looks faded.`}
            style={{flexShrink:0,marginLeft:"auto",fontSize:"11.5px",fontWeight:700,color:"#7a5a12",background:"#fdf3d6",border:"1.5px solid rgba(184,133,10,0.45)",borderRadius:"999px",padding:"3px 10px",whiteSpace:"nowrap"}}>
            ⚠ {strandedCount} student{strandedCount!==1?'s are':' is'} at furniture not used in {setup.name}
          </span>
        )}
      </div>
      {showNewSetup&&<NewSetupDialog current={setup} rooms={rooms} onCreate={createNewSetup} onClose={()=>setShowNewSetup(false)}/>}
      <div ref={canvasRef} onMouseDown={handleCanvasMD}
        style={{position:"absolute",left:0,right:0,top:SETUP_BAR,bottom:0,overflow:"auto",
          // Scroll-position centering (below) only helps once content is bigger
          // than the viewport — when it's smaller, there's nothing to scroll, so
          // it just sits at the top-left. Flex-centering the single content div
          // handles that case directly; "safe" keeps it from clipping content
          // against the top-left edge once it *does* overflow.
          display:"flex",justifyContent:"safe center",alignItems:"safe center",
          ...floorStyle(),cursor:"default"
        }}
      >
        {/* Min-size inner so canvas is always scrollable — CSS zoom scales it (and
            keeps scrollWidth/scrollHeight correct) without touching any of the
            seat/group coordinates below, which all stay in unscaled data pixels */}
        <div ref={innerCanvasRef} style={{minWidth:canvasSize.w+"px",minHeight:canvasSize.h+"px",position:"relative",zoom,flexShrink:0}}>

          {/* Rubber-band selection rectangle */}
          {rubberBand&&(()=>{
            const rx=Math.min(rubberBand.x1,rubberBand.x2),ry=Math.min(rubberBand.y1,rubberBand.y2);
            const rw=Math.abs(rubberBand.x2-rubberBand.x1),rh=Math.abs(rubberBand.y2-rubberBand.y1);
            return <div style={{position:"absolute",left:rx,top:ry,width:rw,height:rh,border:"1.5px solid rgba(66,133,244,0.55)",background:"rgba(66,133,244,0.07)",borderRadius:"3px",pointerEvents:"none",zIndex:50}}/>;
          })()}

          {/* Hatch patterns used by every table, chair and room item below */}
          <InkDefs/>

          {/* Zones (areas) go underneath everything, tables included */}
          {roomItems.filter(i=>i.type==='area').map(itemEl)}
          {/* ── Room shell: walls, doors and windows. Only pickable in Edit room, so they can't be nudged by accident. ── */}
          <WallsLayer walls={walls}
            openings={openingDrag?.hit?[...openings,{id:'ghost',type:openingDrag.type,width:OPENING_TYPES[openingDrag.type].width,flip:false,swing:1,...openingDrag.hit}]:openings}
            selWallId={roomMode?selWall:null} selOpeningId={roomMode?selOpening:null} draft={wallDraft}
            edit={roomMode?{onWallMD:handleWallMD,onOpeningMD:handleOpeningMD,onEndMD:handleWallEndMD}:null}/>

          {/* ── Room items (the catalogue): always movable; labels, size and turning from the selection ── */}
          {roomItems.filter(i=>i.type!=='area').map(itemEl)}
          {/* Resize handles and the turn handle for the picked item, in its own (turned) frame */}
          {selItem&&!editingLabel&&(()=>{
            const g=itemGeom(selItem),small=g.w<56||g.h<56;
            const hs=small?[[1,1],[-1,-1],[1,-1],[-1,1]]:[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
            const cur=(hx,hy)=>hx&&hy?(hx*hy>0?"nwse-resize":"nesw-resize"):hx?"ew-resize":"ns-resize";
            return(
              <div style={{position:"absolute",left:g.x,top:g.y,width:g.w,height:g.h,transform:g.rot?`rotate(${g.rot}deg)`:undefined,transformOrigin:g.origin==="tl"?"top left":"center",pointerEvents:"none",zIndex:9}}>
                {hs.map(([hx,hy])=>(
                  <div key={`${hx},${hy}`} onMouseDown={e=>handleItemResizeMD(e,selItem.id,hx,hy)} onClick={e=>e.stopPropagation()} title="Drag to resize"
                    style={{position:"absolute",left:(hx+1)*g.w/2-5,top:(hy+1)*g.h/2-5,width:10,height:10,boxSizing:"border-box",background:"#fff",border:"2px solid var(--cp-sel)",borderRadius:2,pointerEvents:"auto",cursor:cur(hx,hy)}}/>
                ))}
                <svg width="1" height="1" style={{position:"absolute",left:g.w/2,top:0,overflow:"visible"}} aria-hidden="true"><line x1={0} y1={0} x2={0} y2={-20} style={{stroke:"var(--cp-sel)",strokeWidth:1.5,strokeDasharray:"3 2"}}/></svg>
                <button onMouseDown={e=>handleItemRotateMD(e,selItem.id)} onClick={e=>e.stopPropagation()} title="Drag to turn this item (snaps to 15°; hold Shift to turn freely). Keys: [ and ]"
                  style={{position:"absolute",left:g.w/2-12,top:-44,width:24,height:24,borderRadius:"50%",border:"2px solid var(--cp-sel)",background:"var(--cp-paper)",color:"var(--cp-sel)",fontSize:14,fontWeight:800,lineHeight:1,padding:0,cursor:"crosshair",pointerEvents:"auto",boxShadow:"0 0 0 4px var(--cp-sel-glow)",display:"flex",alignItems:"center",justifyContent:"center"}}>⟳</button>
              </div>
            );
          })()}
          {/* Double-click an item to type its label right on the map */}
          {editingLabel&&(()=>{
            const it=roomItems.find(r=>r.id===editingLabel);if(!it)return null;
            const b=itemBounds(it);
            return(
              <input autoFocus defaultValue={it.label??(ROOM_ITEM_TYPES[it.type]?.name||'')} maxLength={40} title="Type a label, then press Enter. Leave it empty for no label." placeholder="Label…"
                onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}
                onFocus={e=>e.target.select()}
                onBlur={e=>{if(e.target.dataset.cancel!=='1')setItemLabel(it.id,e.target.value);setEditingLabel(null);}}
                onKeyDown={e=>{if(e.key==='Enter')e.target.blur();else if(e.key==='Escape'){e.target.dataset.cancel='1';e.target.blur();}e.stopPropagation();}}
                style={{position:"absolute",left:b.x+b.w/2,top:b.y+b.h/2-14,transform:"translateX(-50%)",zIndex:30,width:150,boxSizing:"border-box",padding:"5px 8px",borderRadius:7,border:"2px solid var(--cp-sel)",background:"#fff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",boxShadow:"0 3px 12px rgba(0,0,0,0.2)"}}/>
            );
          })()}

          {/* Everything below is the furniture. In Edit room it is dimmed and can't be picked. */}
          <div style={{position:"absolute",left:0,top:0,right:0,bottom:0,opacity:roomMode?0.38:1,pointerEvents:roomMode?"none":undefined,transition:"opacity 0.15s"}}>

          {/* ── Table pieces: chairs round the outside, one table top per joined cluster ── */}
          {livePieces.length>0&&(()=>{
            const chairMap=chairIndexMap(seats,groups);
            const selIds=new Set(activeSelPieces);
            const clusters=clustersFromJoins(livePieces,joins);
            const groupOfSeat={};groups.forEach((g,gi)=>g.seatIds.forEach(id=>{groupOfSeat[id]={g,gi};}));
            const selB=activeSelPieces.length?piecesBounds(livePieces.filter(p=>selIds.has(p.id)),liveSlots):null;
            return(
              <>
                <PieceTables pieces={livePieces} joins={joins} slots={liveSlots} seatByKey={seatByKey} chairMap={chairMap} selectedIds={selIds} snapLine={pieceDrag?.snap?.line} groups={groups} chairMatch={chairsMatch}/>
                <UnusedFurniture pieces={livePieces} slots={liveSlots} offIds={offPieceIds} setupName={setup?.name}/>
                {/* Invisible hit areas over each table top: click to pick the table, drag to move it */}
                <svg width="1" height="1" style={{position:"absolute",left:0,top:0,overflow:"visible",pointerEvents:"none",zIndex:1}}>
                  {!roomMode&&livePieces.map(p=>{
                    const w=pieceToWorld(p);
                    const hit={onMouseDown:e=>handlePieceMD(e,p.id),onClick:e=>e.stopPropagation(),title:"Drag to move this table (it snaps onto other tables' edges). Alt-drag pulls one piece off, or moves it without snapping."+(offPieceIds.has(p.id)?` Not used in ${setup?.name}.`:""),style:{fill:"transparent",pointerEvents:"all",cursor:pieceDrag?"grabbing":"grab"}};
                    return w.circle?<circle key={p.id} cx={w.center[0]} cy={w.center[1]} r={w.circle} {...hit}/>:<polygon key={p.id} points={w.poly.map(q=>q.join(",")).join(" ")} {...hit}/>;
                  })}
                </svg>
                {/* A small paper tab with the table's group name, above each table of 2+ seats */}
                {clusters.map(ids=>{
                  if(pieceDrag&&ids.some(id=>pieceDrag.ids.includes(id)))return null; // tucked away while it's moving
                  const seatId=seats.find(s=>ids.includes(s.pieceId)&&groupOfSeat[s.id])?.id;
                  if(!seatId)return null;
                  const{g,gi}=groupOfSeat[seatId];
                  const b=piecesBounds(livePieces.filter(p=>ids.includes(p.id)),liveSlots);if(!b)return null;
                  const isSel=ids.some(id=>selIds.has(id));
                  return(
                    <button key={`tab-${ids[0]}`} onMouseDown={e=>handlePieceMD(e,ids[0])} onClick={e=>e.stopPropagation()} title="Select or drag this table"
                      style={{position:"absolute",left:b.x+b.w/2,top:b.y-24,transform:"translateX(-50%)",zIndex:3,height:20,display:"flex",alignItems:"center",gap:5,padding:"0 9px",borderRadius:"8px 8px 3px 3px",
                        background:isSel?"var(--cp-sel)":"var(--cp-paper)",border:`1.5px solid ${isSel?"var(--cp-sel)":"var(--cp-tag-ink)"}`,boxShadow:"1.5px 2px 0 var(--cp-shadow)",cursor:"grab",fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap"}}>
                      <span style={{width:9,height:9,borderRadius:3,background:chairColor(gi),border:"1.5px solid var(--cp-tag-ink)",flexShrink:0}}/>
                      <span style={{fontSize:"11px",fontWeight:800,lineHeight:1,color:isSel?"#fff":"var(--cp-tag-text)",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{g.label||String(gi+1)}</span>
                    </button>
                  );
                })}
                {/* Rotate handle on the picked table: drag round (15° steps, Shift = free) */}
                {selB&&(!pieceDrag||pieceDrag.rotating)&&(
                  <>
                    <svg width="1" height="1" style={{position:"absolute",left:0,top:0,overflow:"visible",pointerEvents:"none",zIndex:3}} aria-hidden="true">
                      <line x1={selB.x+selB.w} y1={selB.y} x2={selB.x+selB.w+14} y2={selB.y-14} style={{stroke:"var(--cp-sel)",strokeWidth:1.5,strokeDasharray:"3 2"}}/>
                    </svg>
                    <button onMouseDown={e=>handleRotateMD(e,activeSelPieces)} onClick={e=>e.stopPropagation()} title="Drag to rotate this table (snaps to 15°; hold Shift to turn freely). Keys: [ and ]"
                      style={{position:"absolute",left:selB.x+selB.w+14-13,top:selB.y-14-13,width:26,height:26,borderRadius:"50%",zIndex:4,border:"2px solid var(--cp-sel)",background:"var(--cp-paper)",color:"var(--cp-sel)",fontSize:"15px",fontWeight:800,lineHeight:1,padding:0,cursor:"crosshair",boxShadow:"0 0 0 4px var(--cp-sel-glow)",display:"flex",alignItems:"center",justifyContent:"center"}}>⟳</button>
                    {pieceDrag?.rotating&&<div style={{position:"absolute",left:selB.x+selB.w+20,top:selB.y-44,zIndex:4,fontSize:"11px",fontWeight:800,color:"#fff",background:"var(--cp-sel)",borderRadius:5,padding:"1px 6px",pointerEvents:"none"}}>{Math.round(pieceDrag.steps[0].drot)}°</div>}
                  </>
                )}
                {/* "Edit seats": every place round the picked table, click to switch it on/off */}
                {editSeats&&activeSelPieces.length>0&&!pieceDrag&&liveSlots.filter(sl=>selIds.has(sl.pieceId)&&sl.state!=='joined').map(sl=>{
                  const on=sl.state==='on';
                  return(
                    <button key={`es-${sl.key}`} onClick={e=>{e.stopPropagation();toggleSlot(sl.pieceId,sl.slot);}} onMouseDown={e=>e.stopPropagation()}
                      title={sl.standing?(on?"Switch this place off (whoever stands here goes back to the student list)":"Switch a place on here"):(on?"Switch this seat off (whoever sits here goes back to the student list)":"Switch a seat on here")}
                      style={{position:"absolute",left:sl.p[0]+sl.n[0]*(sl.standing?20:14)-15,top:sl.p[1]+sl.n[1]*(sl.standing?20:14)-15,width:30,height:30,borderRadius:"50%",zIndex:7,padding:0,cursor:"pointer",
                        border:`2px ${on?"solid":"dashed"} var(--cp-sel)`,background:on?"var(--cp-sel)":"rgba(255,255,255,0.75)",color:on?"#fff":"var(--cp-sel)",fontSize:"15px",fontWeight:800,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>{on?"✓":"+"}</button>
                  );
                })}
              </>
            );
          })()}

          {/* Group = one shared table top under its seats, plus a folder-style tab.
              The tab is a full-width bar sitting on top of the group — always
              visible and always clickable, so it doubles as "here's a group" and
              "click here to select the whole thing." Three states: neutral
              (unrelated to current selection), soft (an individual member is
              selected — the rest of the table gets a dashed halo), full (the
              group itself is selected via its tab — blue outline + glow). */}
          {/* Chairs first, so every table top below covers them and only their backs show */}
          <LegacyChairs seats={seats} groups={groups} pos={pos} chairMap={chairIndexMap(seats,groups)} chairMatch={chairsMatch}/>
          {groups.map((g,gi)=>{
            // a table made of pieces draws itself (above); this is for plain seat groups
            if(g.seatIds.some(id=>seats.find(x=>x.id===id)?.pieceId))return null;
            const liveSeatPositions=g.seatIds.map(id=>{
              const s=seats.find(x=>x.id===id);if(!s)return null;
              let x=s.x,y=s.y;
              if(dd&&!dd.singleSeat&&dd.ids.has(id)){x+=dd.dx;y+=dd.dy;}
              else if(dd?.singleSeat===id){x+=dd.dx;y+=dd.dy;}
              return{...s,x,y};
            }).filter(Boolean);
            if(!liveSeatPositions.length)return null;
            const isFull=selType==='group'&&g.seatIds.some(id=>sel.has(id));
            const isSoft=!isFull&&selType==='seat'&&sel.size===1&&g.seatIds.includes(Array.from(sel)[0]);
            const gb=gBoundsFromSeats(g,liveSeatPositions);
            const PAD=GROUP_PAD,BAR_H=GROUP_BAR_H;
            return(
              <div key={`gb-${g.id}`}>
                <TableSurface rect={{x:gb.x-PAD,y:gb.y-PAD,w:gb.w+PAD*2,h:gb.h+PAD*2}} radius={12} selected={isFull} fill={tableFill(g.color)} faded={groupNotUsedHere(g)}/>
                {isSoft&&<div style={{position:"absolute",left:gb.x-PAD-4,top:gb.y-PAD-4,width:gb.w+PAD*2+8,height:gb.h+PAD*2+8,borderRadius:15,border:"2px dashed var(--cp-sel)",opacity:0.75,pointerEvents:"none"}}/>}
                {/* Tab bar — click to select the whole group, drag to move it */}
                <button onMouseDown={e=>handleGroupTabMD(e,g.id)} title="Select or drag the whole group" style={{
                  position:"absolute",left:gb.x-PAD,top:gb.y-PAD-BAR_H-PG.CHAIR_OUT, // lifted above the top-row chairs
                  width:gb.w+PAD*2,height:BAR_H,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
                  borderRadius:"10px 10px 0 0",
                  background:isFull?"var(--cp-sel)":"var(--cp-paper)",
                  border:`1.5px solid ${isFull||isSoft?"var(--cp-sel)":"var(--cp-tag-ink)"}`,borderBottom:"none",
                  cursor:"grab",fontFamily:"'Source Sans 3',sans-serif",padding:0,
                }}>
                  <span style={{width:10,height:10,borderRadius:3,background:chairColor(gi),border:"1.5px solid var(--cp-tag-ink)",flexShrink:0}}/>
                  <span style={{fontSize:"11px",fontWeight:800,letterSpacing:"0.3px",lineHeight:1,color:isFull?"#fff":"var(--cp-tag-text)",maxWidth:"70%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.label||String(gi+1)}</span>
                </button>
              </div>
            );
          })}

          {/* Seats: a chair tucked against a bit of table, with a paper name tag.
              A seat in a group has no table of its own (the group's table is
              drawn above); a lone seat gets a small one. */}
          {(()=>{
            const chairMap=chairIndexMap(seats,groups);
            const grouped=new Set(groups.flatMap(g=>g.seatIds));
            return seats.map(s=>{
              const p=pos[s.id];if(!p)return null;
              const isSel=sel.has(s.id);
              const isGroupMate=singleSeatGroupMates.has(s.id);
              const cleanTags=s.tags.filter(t=>!DEPRECATED_TAGS.has(t));
              const inActiveGroup=activeGroupId&&s.groupId===activeGroupId;
              const isLifted=!!dd&&(dd.singleSeat?dd.singleSeat===s.id:dd.ids.has(s.id));
              const state=s.unavailable?"unavailable":!s.used?"unused":"ok";
              const st=s.studentId?studentById(s.studentId):null;
              const mismatch=!!st&&cleanTags.length>0&&!studentMatchesSeat(st,s);
              if(s.pieceId){
                /* A table piece's seat: just its name tag (horizontal, wherever the
                   table points) — the chair and table top are drawn by PieceTables. */
                const t=liveSlotByKey.get(`${s.pieceId}:${s.slot}`)?.tag;if(!t)return null;
                return(
                  <div key={s.id} onClick={e=>{e.stopPropagation();handleSeatClick(e,s.id);}} onMouseDown={e=>e.stopPropagation()}
                    style={{position:"absolute",left:t.x-t.w/2,top:t.y-t.h/2,width:t.w,height:t.h,userSelect:"none",zIndex:isSel?6:2}}>
                    {/* ring only for a seat picked on its own — a picked table already lights up its outline */}
                    {isSel&&!activeSelPieces.length&&<div style={{position:"absolute",inset:-4,borderRadius:8,border:"2.5px solid var(--cp-sel)",boxShadow:"0 0 0 4px var(--cp-sel-glow)",pointerEvents:"none"}}/>}
                    {st?(
                      <>
                        <NameTag name={st.name} tilt={tagTilt(s.id)} w={t.w} h={t.h} fontSize={t.font} pad={15} warn={mismatch} locked={s.locked}
                          title={mismatch?`${st.name} doesn't match this seat's tag rule`:st.name} cursor={s.locked?"default":"grab"}
                          onMouseDown={e=>{e.stopPropagation();!s.locked&&startStudentDrag(e,s.studentId,s.id);}}
                          onClick={e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}}/>
                        {mismatch&&<div title={`${st.name} doesn't match this seat's tag rule`} style={{position:"absolute",top:"-6px",right:"12px",zIndex:3,fontSize:"9px",lineHeight:1,background:"#eb5757",color:"#fff",borderRadius:"50%",width:"13px",height:"13px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,border:"1px solid #fff"}}>!</div>}
                        <button onClick={e=>{e.stopPropagation();toggleLock(s.id);}} onMouseDown={e=>e.stopPropagation()} title={s.locked?"Unlock":"Lock student here"}
                          style={{position:"absolute",top:"50%",transform:"translateY(-50%)",right:"1px",background:"none",border:"none",cursor:"pointer",fontSize:"10px",opacity:s.locked?1:0.45,padding:"1px",lineHeight:1,zIndex:2}}>{s.locked?"🔒":"🔓"}</button>
                        {!s.locked&&<button onClick={e=>{e.stopPropagation();removeFromSeat(s.id);}} onMouseDown={e=>e.stopPropagation()} title="Remove this student from the seat"
                          style={{position:"absolute",top:"-7px",left:"-7px",background:"rgba(255,250,240,0.9)",border:"1.5px solid rgba(200,50,50,0.4)",borderRadius:"50%",cursor:"pointer",fontSize:"11px",color:"rgba(200,50,50,0.65)",padding:0,lineHeight:1,zIndex:2,width:"15px",height:"15px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>}
                      </>
                    ):(
                      <div title={s.unavailable?"This seat is unavailable":!s.used?"This seat is out of use":"Empty seat — drag a student here, or click to select it"}
                        style={{width:"100%",height:"100%",boxSizing:"border-box",borderRadius:4,border:"1.5px dashed var(--cp-tag-ink)",background:"rgba(255,250,240,0.6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10.5px",fontWeight:700,fontStyle:"italic",color:s.unavailable?"#a02a22":"var(--cp-tag-text)",opacity:s.unavailable||!s.used?0.9:0.7,fontFamily:"'Source Sans 3',sans-serif",cursor:"pointer"}}>
                        {s.unavailable?"unavailable":!s.used?"unused":"empty"}
                      </div>
                    )}
                    {cleanTags.length>0&&(
                      <div style={{position:"absolute",top:-5,right:st?14:4,display:"flex",gap:2,zIndex:3,pointerEvents:"none"}}>
                        {cleanTags.map(tg=>{const tc=colorFor(tg);return <div key={tg} style={{width:8,height:8,borderRadius:"50%",background:tc.t,border:"1px solid var(--cp-tag-ink)"}}/>;})}
                      </div>
                    )}
                  </div>
                );
              }
              return(
                <div key={s.id}
                  onClick={e=>{e.stopPropagation();handleSeatClick(e,s.id);}}
                  onMouseDown={e=>e.stopPropagation()} // prevent canvas clearing selection
                  style={{
                    position:"absolute",left:p.x,top:p.y,width:SW,height:SH,
                    userSelect:"none",cursor:"default",
                    // A dragged seat lifts a little so it's obvious what you're holding
                    transform:isLifted?"translateY(-3px) scale(1.04)":"none",transition:isLifted?"none":"transform 0.12s",
                    zIndex:isLifted?30:isSel?5:1,
                    opacity:notUsedHere.has(s.id)?0.5:1, // a desk this setup doesn't use (Phase 5)
                  }}
                >
                  <SeatArt state={state} standalone={!grouped.has(s.id)} selected={isSel} color={s.color}/>
                  {isSel&&(selType==='group'
                    ?<div style={{position:"absolute",inset:1,borderRadius:7,border:"1.5px solid var(--cp-sel)",background:"var(--cp-sel-fill)",pointerEvents:"none"}}/>
                    :<div style={{position:"absolute",inset:-3,borderRadius:10,border:"2.5px solid var(--cp-sel)",boxShadow:"0 0 0 4px var(--cp-sel-glow)",background:"var(--cp-sel-fill)",pointerEvents:"none"}}/>)}
                  {isGroupMate&&!isSel&&<div style={{position:"absolute",inset:-2,borderRadius:9,border:"2px dashed var(--cp-sel)",opacity:0.8,pointerEvents:"none"}}/>}
                  {/* Add/remove-from-active-group toggle — only while a group tab is selected */}
                  {activeGroupId&&!activeGroupIsTable&&(
                    <button
                      onClick={e=>{e.stopPropagation();inActiveGroup?removeSeatFromGroup(s.id,activeGroupId):addSeatsToGroup([s.id],activeGroupId);}}
                      onMouseDown={e=>e.stopPropagation()}
                      title={inActiveGroup?"Remove from group":"Add to group"}
                      style={{position:"absolute",top:"-7px",right:"-7px",zIndex:6,width:"16px",height:"16px",borderRadius:"50%",
                        border:"1.5px solid #fff",cursor:"pointer",fontSize:"11px",fontWeight:800,lineHeight:1,padding:0,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        background:inActiveGroup?"#eb5757":"#2e6bce",color:"#fff",
                        boxShadow:"0 1px 4px rgba(0,0,0,0.25)",
                      }}
                    >{inActiveGroup?"−":"+"}</button>
                  )}
                  {/* Drag strip — grab anywhere along the table edge to move the desk */}
                  <div onMouseDown={e=>handleSeatMD(e,s.id)} title="Drag to move this desk" style={{
                    position:"absolute",left:0,top:0,width:SW,height:13,
                    display:"flex",alignItems:"center",justifyContent:"flex-end",
                    padding:"0 6px",cursor:"grab",
                  }}>
                    {/* Tag dots (colour indicator only) + drag dots */}
                    <div style={{display:"flex",alignItems:"center",gap:"3px",flexShrink:0}}>
                      {cleanTags.map(t=>{const tc=colorFor(t);return(
                        <div key={t} title={t} style={{width:"8px",height:"8px",borderRadius:"50%",background:tc.t,border:"1px solid var(--cp-tag-ink)",flexShrink:0}}/>
                      );})}
                      <div style={{display:"flex",gap:"2px",marginLeft:cleanTags.length?"2px":"0"}}>
                        {[0,1,2].map(i=><div key={i} style={{width:"3px",height:"3px",borderRadius:"50%",background:INK,opacity:0.55}}/>)}
                      </div>
                    </div>
                  </div>

                  {/* Name tag (or a dashed placeholder when nobody is sitting here) */}
                  <div style={{position:"absolute",left:5,top:13,width:SW-10,height:26}}>
                    {st?(
                      <>
                        <NameTag name={st.name} tilt={tagTilt(s.id)} w={SW-10} h={26} fontSize={12} pad={18} warn={mismatch} locked={s.locked}
                          title={mismatch?`${st.name} doesn't match this seat's tag rule`:st.name}
                          cursor={s.locked?"default":"grab"}
                          // Name — click for tags/flags, drag to move
                          onMouseDown={e=>{e.stopPropagation();!s.locked&&startStudentDrag(e,s.studentId,s.id);}}
                          onClick={e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}}
                        />
                        {/* Tag mismatch warning */}
                        {mismatch&&(
                          <div title={`${st.name} doesn't match this seat's tag rule`} style={{position:"absolute",top:"-5px",right:"16px",zIndex:3,fontSize:"9px",lineHeight:1,background:"#eb5757",color:"#fff",borderRadius:"50%",width:"13px",height:"13px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,cursor:"default",border:"1px solid #fff"}}>!</div>
                        )}
                        {/* Lock icon — only when student is present */}
                        <button onClick={e=>{e.stopPropagation();toggleLock(s.id);}}
                          title={s.locked?"Unlock":"Lock student here"}
                          style={{position:"absolute",top:"50%",transform:"translateY(-50%)",right:"3px",background:"none",border:"none",cursor:"pointer",fontSize:"11px",opacity:s.locked?1:0.45,padding:"1px",lineHeight:1,zIndex:2}}
                          onMouseEnter={e=>{e.currentTarget.style.opacity="1";}}
                          onMouseLeave={e=>{e.currentTarget.style.opacity=s.locked?"1":"0.45";}}
                        >{s.locked?"🔒":"🔓"}</button>
                        {/* × remove */}
                        {!s.locked&&(
                          <button onClick={e=>{e.stopPropagation();removeFromSeat(s.id);}}
                            title="Remove this student from the seat" style={{position:"absolute",top:"-6px",left:"-6px",background:"rgba(255,250,240,0.85)",border:"1.5px solid rgba(200,50,50,0.4)",borderRadius:"50%",cursor:"pointer",fontSize:"12px",color:"rgba(200,50,50,0.6)",padding:"0",lineHeight:1,zIndex:2,width:"16px",height:"16px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}
                            onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,60,60,0.95)";e.currentTarget.style.color="#fff";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,250,240,0.85)";e.currentTarget.style.color="rgba(200,50,50,0.6)";}}
                          >×</button>
                        )}
                      </>
                    ):(
                      <div style={{width:"100%",height:"100%",boxSizing:"border-box",borderRadius:4,border:"1.5px dashed var(--cp-tag-ink)",background:"rgba(255,250,240,0.6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,fontStyle:"italic",color:s.unavailable?"#a02a22":"var(--cp-tag-text)",opacity:s.unavailable||!s.used?0.9:0.75,fontFamily:"'Source Sans 3',sans-serif"}}>
                        {s.unavailable?"unavailable":!s.used?"unused":"empty"}
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}

          </div>
          <StationBadges items={roomItems} pieces={livePieces}/>

          {/* Empty state */}
          {seats.length===0&&walls.length===0&&roomItems.length===0&&(
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"14px",pointerEvents:"none"}}>
              <div style={{fontSize:"44px",opacity:0.12}}>🪑</div>
              <div style={{fontSize:"13px",color:"rgba(0,0,0,0.2)",textAlign:"center",lineHeight:1.8,fontWeight:500}}>
                Add a table from the left<br/>to start building your room
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom control — pinch-to-zoom on the trackpad works anywhere on the canvas;
          these buttons are here for anyone who'd rather click than pinch. Sits
          outside the scrolling/zoomed content so it never moves or scales itself. */}
      <div style={{position:"absolute",bottom:"14px",right:"14px",zIndex:60,display:"flex",alignItems:"center",gap:"2px",background:"#fff",borderRadius:"10px",padding:"4px",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)"}}>
        <button className="cpb cpb-ghost" onClick={()=>setZoom(z=>Math.max(ZOOM_MIN,+(z-0.15).toFixed(2)))} title="Zoom out" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
        <button className="cpb cpb-ghost" onClick={()=>setZoom(1)} title="Reset zoom" style={{minWidth:"38px",padding:"0 4px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{Math.round(zoom*100)}%</button>
        <button className="cpb cpb-ghost" onClick={()=>setZoom(z=>Math.min(ZOOM_MAX,+(z+0.15).toFixed(2)))} title="Zoom in" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
      </div>

      {/* A linked room's shell was edited: offer to update it for every class that uses it */}
      {shellAsk&&roomLink&&(()=>{
        const rm=rooms.find(r=>r.id===roomLink.roomId);
        return(
          <div className="cp-pop" role="dialog" style={{position:"absolute",top:SETUP_BAR+12,left:"50%",transform:"translateX(-50%)",zIndex:62,maxWidth:"min(640px,86%)",display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap",justifyContent:"center",padding:"9px 14px",borderRadius:"12px",background:"#fff",border:"1px solid rgba(66,133,244,0.35)",boxShadow:"0 6px 24px rgba(0,0,0,0.18)",fontFamily:"'Source Sans 3',sans-serif",fontSize:"12.5px",color:"#1a1a2e",fontWeight:600}}>
            <span>Update <b>{rm?.name||'this room'}</b> for every class that uses it?</span>
            <button className="cpb cpb-primary" onClick={()=>{setShellAsk(false);pushShell(committedObj(),true);}} title="Save these walls, doors and fixed items into the room. Other classes that use it pick them up the next time they open. Their furniture and students are never touched." style={{padding:"6px 12px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Yes, update</button>
            <button className="cpb" onClick={()=>{setShellAsk(false);linkClass({...roomLink,shellLocal:true});}} title="Keep these changes in this class only. You can still share them later from Rooms." style={{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.12)",background:"#fff",color:"rgba(0,0,0,0.6)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Just this class</button>
          </div>
        );
      })()}
      {openingDrag&&<div style={{position:"fixed",left:openingDrag.cx+14,top:openingDrag.cy+14,zIndex:700,pointerEvents:"none",padding:"3px 9px",borderRadius:"6px",background:openingDrag.hit?"#1a1a2e":"#8a8a95",color:"#fff",fontSize:"11px",fontWeight:700,fontFamily:"'Source Sans 3',sans-serif"}}>{OPENING_TYPES[openingDrag.type].name}{openingDrag.hit?"":" — drop on a wall"}</div>}

      {/* Short notices, e.g. who went back to the student list when a join hid their seat */}
      {notice&&(
        <div className="cp-toast" role="status" style={{position:"absolute",bottom:"14px",left:"50%",transform:"translateX(-50%)",zIndex:61,maxWidth:"min(560px,70%)",display:"flex",alignItems:"center",gap:"10px",padding:"8px 10px 8px 14px",borderRadius:"10px",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,lineHeight:1.4,boxShadow:"0 4px 18px rgba(0,0,0,0.25)",fontFamily:"'Source Sans 3',sans-serif"}}>
          <span>{notice}</span>
          <button className="cpb cpb-ghost" onClick={()=>setNotice(null)} title="Dismiss" style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:"15px",lineHeight:1,padding:"0 2px"}}>×</button>
        </div>
      )}

      {/* Undo — reverts the last change to seats/groups/room items/rules.
          Session-only history, one step back per click. */}
      {canUndo&&(
        <button className="cpb" onClick={handleUndo} title="Undo the last change" style={{position:"absolute",bottom:"14px",left:"14px",zIndex:60,display:"flex",alignItems:"center",gap:"6px",padding:"7px 12px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.06)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"12px",fontWeight:600,cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",fontFamily:"'Source Sans 3',sans-serif"}}
          onMouseEnter={e=>{e.currentTarget.style.background="#f0f1f4";e.currentTarget.style.color="rgba(0,0,0,0.7)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="rgba(0,0,0,0.5)";}}
        >↺ Undo</button>
      )}
      </div>

      {/* ── Right column: classroom-wide rules (collapsible), then per-seat tags ── */}
      <div style={{width:"176px",flexShrink:0,padding:"16px 12px",display:"flex",flexDirection:"column",gap:"16px",overflowY:"auto",background:"#fafbfc",borderLeft:"1px solid rgba(0,0,0,0.06)"}}>

        {/* Classroom rules — tags and keep-apart/together rules apply to the
            whole class when randomising, not to whichever seat happens to be
            selected, so they live here rather than behind a seat click.
            Collapsed by default; remembers whether you left it open. */}
        <div>
          <button className="cpb cpb-ghost" onClick={toggleRulesOpen} title="Tags and keep-apart/together rules — used by Randomize for this class" style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"2px",background:"none",border:"none",cursor:"pointer"}}>
            <span style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.4)",textTransform:"uppercase"}}>📋 Classroom rules</span>
            <span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>{rulesOpen?'▲':'▼'}</span>
          </button>
          {rulesOpen&&(
            <div style={{display:"flex",flexDirection:"column",gap:"16px",paddingTop:"10px"}}>
              {/* Manage tags */}
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                  <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase"}}>Tags</div>
                  <button className="cpb cpb-ghost cpb-link" onClick={()=>setShowManageTags(true)} title="Add, recolour or delete tags, and choose which students have each one" style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"10.5px",fontWeight:700,padding:0}}>🎨 Manage</button>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                  {avTags.length===0&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.25)",fontStyle:"italic"}}>No tags yet — add one via 🎨 Manage</div>}
                  {avTags.map((t,i)=>{
                    const tc=colorFor(t);
                    const matchCount=(activeClass?.students||[]).filter(s=>(s.tags||[]).includes(t)).length;
                    return(
                    <div key={t} title={matchCount===0?`No students have this tag yet — a seat tagged "${t}" will stay empty until you add students to it via 🎨 Manage`:`${matchCount} student${matchCount!==1?'s':''} tagged "${t}"`} style={{display:"flex",alignItems:"center",gap:"2px",padding:"2px 8px",borderRadius:"10px",background:tc.b,border:`1px solid ${tc.t}33`}}>
                      <span style={{fontSize:"10px",fontWeight:700,color:tc.t}}>{t}</span>
                      {matchCount===0&&<span style={{fontSize:"9px",color:"#c44",fontWeight:700}}>⚠ 0 students</span>}
                    </div>
                  );})}
                </div>
              </div>

              {/* Seating rules */}
              <RuleEditor rules={rules} onChange={nr=>{setRules(nr);doSave(seats,groups,avTags,roomItems,nr);}} students={activeClass?.students||[]}/>
            </div>
          )}
        </div>

        {sel.size===0?(
          <div style={{color:"rgba(0,0,0,0.18)",fontSize:"12px",textAlign:"center",marginTop:"20px",lineHeight:1.8}}>
            Click a seat to<br/>apply tags
          </div>
        ):(
          <>
            <div>
              <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase",marginBottom:"6px"}}>
                {isGrpSel?`Group · ${sel.size} seats`:'Seat tags'}
              </div>

              {/* Group label input */}
              {isGrpSel&&(()=>{
                const gid=selSeats[0]?.groupId;
                const g=groups.find(x=>x.id===gid);
                if(!g)return null;
                return(
                  <div style={{marginBottom:"10px"}}>
                    <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"4px"}}>Group name</div>
                    <input
                      value={g.label||''}
                      onChange={e=>{
                        const v=e.target.value.slice(0,20);
                        const nextG=groups.map(x=>x.id===gid?{...x,label:v}:x);
                        setGroups(nextG);doSave(seats,nextG,avTags,roomItems,rules);
                      }}
                      maxLength={20}
                      placeholder="e.g. Table A"
                      style={{width:"100%",padding:"6px 8px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",fontSize:"14px",fontWeight:700,outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",textAlign:"center",letterSpacing:"0.3px",boxSizing:"border-box"}}
                    />
                    <div style={{fontSize:"9px",color:"rgba(0,0,0,0.25)",marginTop:"4px",textAlign:"center"}}>Shown on the group's tab on the canvas</div>
                  </div>
                );
              })()}

              {/* Group warning */}
              {isGrpSel&&!tagConfirm&&(
                <div style={{fontSize:"10.5px",color:"#8a6d20",lineHeight:1.5,padding:"7px 9px",borderRadius:"7px",background:"#fdf5e6",marginBottom:"8px"}}>
                  Tags will apply to the whole group.
                </div>
              )}

              {/* Tag confirm dialog */}
              {tagConfirm&&(
                <div style={{padding:"10px",borderRadius:"9px",background:"#fdf5e6",border:"1px solid rgba(234,170,60,0.3)",marginBottom:"8px"}}>
                  <div style={{fontSize:"11px",color:"#8a6d20",marginBottom:"8px",fontWeight:600,lineHeight:1.4}}>
                    Apply "{tagConfirm.tag}" to all {tagConfirm.sids.length} seats?
                  </div>
                  <div style={{display:"flex",gap:"4px"}}>
                    <button className="cpb cpb-primary" onClick={()=>{applyTagToSeats(tagConfirm.sids,tagConfirm.tag);setTagConfirm(null);}} style={{...btnS,flex:1,background:"#1a1a2e",color:"#fff",border:"none",fontSize:"11px",padding:"5px 0"}}>Yes</button>
                    <button className="cpb" onClick={()=>setTagConfirm(null)} style={{...btnS,flex:1,fontSize:"11px",padding:"5px 0"}}>No</button>
                  </div>
                </div>
              )}

              {/* Applied tags summary — chips showing what's actually on the selected seat(s) */}
              {(()=>{
                const appliedTags=!isGrpSel&&selSeats.length===1
                  ?selSeats[0].tags.filter(t=>!DEPRECATED_TAGS.has(t))
                  :commonTags.filter(t=>!DEPRECATED_TAGS.has(t));
                if(!appliedTags.length)return null;
                const seat=selSeats[0];
                const rule=!isGrpSel&&selSeats.length===1?(seat.tagRule||'OR'):null;
                return(
                  <div style={{marginBottom:"10px",padding:"8px 10px",borderRadius:"8px",background:"rgba(0,0,0,0.02)",border:"1px solid rgba(0,0,0,0.05)"}}>
                    <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"6px"}}>
                      Applied{rule?` · ${rule}`:''} — click to remove
                    </div>
                    <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                      {appliedTags.map((t,i)=>{const tc=colorFor(t);return(
                        <button className="cpo" key={t} onClick={()=>handleTagToggle(t)} title={`Remove "${t}"${avTags.includes(t)?'':' — not in this class\'s tag list, e.g. left over from a loaded layout'}`} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",fontWeight:700,padding:"3px 6px 3px 9px",borderRadius:"6px",background:tc.b,color:tc.t,border:"none",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                          onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                        >{t}<span style={{fontSize:"12px",lineHeight:1}}>×</span></button>
                      );})}
                    </div>
                  </div>
                );
              })()}

              {/* Tag toggle buttons — includes any orphan tags (present on a
                  seat but not in this class's own tag list, e.g. left over
                  from a loaded layout) so they stay toggleable everywhere,
                  not just removable via the Applied summary. */}
              <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
                {[...avTags,...orphanTags].map((tag,i)=>{
                  const tc=colorFor(tag);
                  const isOrphan=!avTags.includes(tag);
                  const has=commonTags.includes(tag)||(isOrphan&&selSeats.length>0&&selSeats.every(s=>s.tags.includes(tag)));
                  const partial=!has&&selSeats.some(s=>s.tags.includes(tag));
                  const matchCount=(activeClass?.students||[]).filter(s=>(s.tags||[]).includes(tag)).length;
                  return(
                    <button className="cpo" key={tag} onClick={()=>handleTagToggle(tag)} title={isOrphan?`"${tag}" isn't in this class's tag list (e.g. from a loaded layout) — still toggleable, or delete it from 🎨 Manage above`:matchCount===0?`No students have this tag — this seat will stay empty (or Randomize will need "Best fit" to fill it)`:`Toggle "${tag}" on this seat — only students with this tag can be placed here`} style={{
                      display:"flex",alignItems:"center",gap:"7px",padding:"7px 9px",borderRadius:"8px",
                      border:`1.5px solid ${has?tc.t:"rgba(0,0,0,0.07)"}`,
                      background:has?tc.b:partial?"rgba(0,0,0,0.02)":"#fff",
                      color:has?tc.t:partial?"rgba(0,0,0,0.45)":"rgba(0,0,0,0.5)",
                      cursor:"pointer",textAlign:"left",fontSize:"12px",fontWeight:has?700:500,
                      fontFamily:"'Source Sans 3',sans-serif",width:"100%",transition:"all 0.12s",
                    }}
                      onMouseEnter={e=>{if(!has)e.currentTarget.style.borderColor=tc.t;}}
                      onMouseLeave={e=>{if(!has)e.currentTarget.style.borderColor="rgba(0,0,0,0.07)";}}
                    >
                      <span style={{width:"9px",height:"9px",borderRadius:"50%",flexShrink:0,display:"inline-block",background:has?tc.t:partial?"rgba(0,0,0,0.15)":"rgba(0,0,0,0.08)",border:`1.5px solid ${has?tc.t:"rgba(0,0,0,0.1)"}`}}/>
                      <span style={{flex:1}}>{tag}</span>
                      {isOrphan&&<span style={{fontSize:"8px",color:"rgba(0,0,0,0.3)",fontWeight:600}}>not in list</span>}
                      {!isOrphan&&matchCount===0&&<span style={{fontSize:"8px",color:"#c44",fontWeight:700}}>⚠ 0 students</span>}
                      {partial&&<span style={{fontSize:"8px",color:"rgba(0,0,0,0.25)",fontWeight:600}}>partial</span>}
                    </button>
                  );
                })}
              </div>

              {/* Auto tags — grade & gender, read straight from the roster so there's nothing to assign by hand */}
              <div style={{marginTop:"10px"}}>
                <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"6px"}}>Auto tags · grade &amp; gender</div>
                <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
                  {smartTags.map((tag,i)=>{
                    const tc=colorFor(tag);
                    const has=commonSmartTags.includes(tag);
                    const partial=!has&&selSeats.some(s=>s.tags.includes(tag));
                    return(
                      <button className="cpo" key={tag} onClick={()=>handleTagToggle(tag)} style={{
                        display:"flex",alignItems:"center",gap:"7px",padding:"7px 9px",borderRadius:"8px",
                        border:`1.5px solid ${has?tc.t:"rgba(0,0,0,0.07)"}`,
                        background:has?tc.b:partial?"rgba(0,0,0,0.02)":"#fff",
                        color:has?tc.t:partial?"rgba(0,0,0,0.45)":"rgba(0,0,0,0.5)",
                        cursor:"pointer",textAlign:"left",fontSize:"12px",fontWeight:has?700:500,
                        fontFamily:"'Source Sans 3',sans-serif",width:"100%",transition:"all 0.12s",
                      }}
                        onMouseEnter={e=>{if(!has)e.currentTarget.style.borderColor=tc.t;}}
                        onMouseLeave={e=>{if(!has)e.currentTarget.style.borderColor="rgba(0,0,0,0.07)";}}
                      >
                        <span style={{width:"9px",height:"9px",borderRadius:"50%",flexShrink:0,display:"inline-block",background:has?tc.t:partial?"rgba(0,0,0,0.15)":"rgba(0,0,0,0.08)",border:`1.5px solid ${has?tc.t:"rgba(0,0,0,0.1)"}`}}/>
                        <span style={{flex:1}}>{tag}</span>
                        {partial&&<span style={{fontSize:"8px",color:"rgba(0,0,0,0.25)",fontWeight:600}}>partial</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{fontSize:"9.5px",color:"rgba(0,0,0,0.28)",marginTop:"5px",lineHeight:1.5}}>Matches students by their actual grade/gender — nothing to tag on the student.</div>
              </div>

              {/* AND / OR rule toggle — only shown when exactly one seat with tags is selected */}
              {!isGrpSel&&selSeats.length===1&&selSeats[0].tags.length>0&&(
                <div style={{marginTop:"10px"}}>
                  <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase",marginBottom:"6px"}}>Tag rule</div>
                  <div style={{display:"flex",borderRadius:"7px",overflow:"hidden",border:"1px solid rgba(0,0,0,0.08)"}}>
                    {['OR','AND'].map(v=>{
                      const cur=selSeats[0].tagRule||'OR';
                      const active=cur===v;
                      return(
                        <button className={`cpb${active?" on":""}`} key={v} onClick={()=>{
                          const nextS=seats.map(s=>sel.has(s.id)?{...s,tagRule:v}:s);
                          setSeats(nextS);doSave(nextS,groups,avTags,roomItems,rules);
                        }} style={{flex:1,padding:"6px 0",border:"none",cursor:"pointer",fontSize:"11px",fontWeight:700,background:active?"#1a1a2e":"#fff",color:active?"#fff":"rgba(0,0,0,0.4)",fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}}>
                          {v}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{fontSize:"9.5px",color:"rgba(0,0,0,0.3)",marginTop:"5px",lineHeight:1.5}}>
                    {(selSeats[0].tagRule||'OR')==='OR'
                      ?'Student needs any one tag'
                      :'Student needs all tags'}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Manage groups dialog ── */}
      {showManageGroups&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px"}} onClick={e=>{if(e.target===e.currentTarget)setShowManageGroups(false);}}>
          <ManageGroupsModal groups={groups} onRename={renameGroup} onDelete={deleteGroup} isTable={g=>g.seatIds.some(id=>seats.find(s=>s.id===id)?.pieceId)} onClose={()=>setShowManageGroups(false)}/>
        </div>
      )}

      {/* ── Name-click popup — their tags, plus their outstanding checklist items ── */}
      {nameClick&&(()=>{
        const student=activeClass?.students.find(s=>s.id===nameClick.studentId);
        const studentTags=student?.tags||[];
        const addableTags=avTags.filter(t=>!studentTags.includes(t));
        return(
          <div className="cp-pop"
            onMouseDown={e=>e.stopPropagation()}
            style={{position:"fixed",left:nameClick.x,top:nameClick.y+6,transform:"translateX(-50%)",zIndex:500,background:"#fff",borderRadius:"10px",boxShadow:"0 4px 20px rgba(0,0,0,0.18)",border:"1px solid rgba(0,0,0,0.08)",padding:"9px 11px",minWidth:"160px",maxWidth:"230px",fontFamily:"'Source Sans 3',sans-serif"}}
          >
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}>
              <span style={{fontSize:"12.5px",fontWeight:700,color:"#1a1a2e",flex:1}}>{nameClick.name}</span>
              <button className="cpb cpb-ghost" onClick={closeNameClick} title="Close" style={{background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"0 2px"}}>×</button>
            </div>

            {/* Tags */}
            <div style={{marginBottom:"9px"}}>
              <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)",marginBottom:"4px"}}>Tags</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:studentTags.length?"5px":0}}>
                {studentTags.length===0&&<span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontStyle:"italic"}}>No tags</span>}
                {studentTags.map(t=>{
                  const tc=colorFor(t);
                  return(
                    <span key={t} style={{display:"flex",alignItems:"center",gap:"2px",fontSize:"10px",fontWeight:700,padding:"2px 3px 2px 7px",borderRadius:"9px",background:tc.b,color:tc.t}}>
                      {t}
                      <button className="cpb cpb-ghost" onClick={()=>toggleStudentTagHere(nameClick.studentId,t,true)} title={`Remove "${t}" from ${nameClick.name.split(' ')[0]}`} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",fontSize:"12px",lineHeight:1,padding:"0 2px",opacity:0.6}}>×</button>
                    </span>
                  );
                })}
              </div>
              {addableTags.length>0&&(
                <select value="" onChange={e=>{if(e.target.value)toggleStudentTagHere(nameClick.studentId,e.target.value,false);}} title="Add a tag to this student" style={{width:"100%",padding:"4px 6px",borderRadius:"6px",border:"1px solid rgba(0,0,0,0.09)",fontSize:"10.5px",fontFamily:"'Source Sans 3',sans-serif",background:"#fff",color:"#1a1a2e",outline:"none"}}>
                  <option value="">+ Add tag…</option>
                  {addableTags.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>

            {/* Checklist — this student's outstanding items */}
            <StudentChecklistSection studentId={nameClick.studentId} checklist={checklist} now={now} onChange={onChangeChecklist} onOpen={()=>{onGoToChecklist?.({studentId:nameClick.studentId});closeNameClick();}}/>
          </div>
        );
      })()}

      {/* ── Student drag ghost ── */}
      {studentDrag&&(()=>{
        const st=studentById(studentDrag.studentId);
        return st?(
          <div className="cp-toast" style={{position:"fixed",left:studentDrag.ghostX+12,top:studentDrag.ghostY-16,zIndex:500,pointerEvents:"none",padding:"5px 12px",borderRadius:"8px",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.25)",whiteSpace:"nowrap"}}>
            {st.name}
          </div>
        ):null;
      })()}

      {/* ── Group merge choice — shown when "Group" spans 2+ existing groups,
         or when grouping fresh (ungrouped) seats while other table groups
         already exist, so the teacher can add to one instead of always
         getting a brand-new table ── */}
      {groupMergeChoice&&(()=>{
        const candidates=groupMergeChoice.groupIds.map(gid=>groups.find(g=>g.id===gid)).filter(Boolean);
        const isTidy=groupMergeChoice.tidy;
        const closeDialog=()=>{setGroupMergeChoice(null);setNewGroupMergeName('');};
        const makeNew=()=>{
          (isTidy?createGroupFromSeatsTidy:createGroupFromSeats)(groupMergeChoice.seatIds,newGroupMergeName);
          closeDialog();
        };
        return(
          <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.2)"}} onClick={closeDialog}>
            <div className="cp-pop" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxWidth:"320px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
              <div style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",marginBottom:"4px"}}>{isTidy?'Group these desks together':'These desks belong to different groups.'}</div>
              <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"18px"}}>{isTidy?'Make a new table group, or add them to one that already exists?':'Which group should they join?'}</div>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px"}}>
                {candidates.map(g=>(
                  <button className="cpb" key={g.id} onClick={()=>{addSeatsToGroup(groupMergeChoice.seatIds,g.id);closeDialog();}}
                    style={{padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.08)",background:"#fafbfc",color:"#1a1a2e",fontSize:"13px",fontWeight:600,cursor:"pointer",textAlign:"left"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                    onMouseLeave={e=>e.currentTarget.style.background="#fafbfc"}
                  >👥 {g.label||'Group'}</button>
                ))}
              </div>
              <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"6px"}}>Or make a new group</div>
              <div style={{display:"flex",gap:"6px",marginBottom:"14px"}}>
                <input value={newGroupMergeName} onChange={e=>setNewGroupMergeName(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')makeNew();}}
                  placeholder="New group name…" autoFocus
                  style={{flex:1,minWidth:0,padding:"8px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.09)",fontSize:"12.5px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e"}}/>
                <button className="cpb cpb-primary" onClick={makeNew}
                  style={{padding:"8px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:600,cursor:"pointer",flexShrink:0}}>Create</button>
              </div>
              <button className="cpb" onClick={closeDialog} style={{width:"100%",padding:"8px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.06)",background:"#fafbfc",color:"rgba(0,0,0,0.4)",fontSize:"12px",fontWeight:600,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        );
      })()}

      {/* ── Conflict dialog ── */}
      {conflictDialog&&(()=>{
        const incoming=studentById(conflictDialog.incomingId);
        const targetSeat=seats.find(s=>s.id===conflictDialog.targetSeatId);
        const seated=targetSeat?.studentId?studentById(targetSeat.studentId):null;
        if(!incoming||!seated)return null;
        return(
          <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.2)"}} onClick={()=>setConflictDialog(null)}>
            <div className="cp-pop" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxWidth:"320px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
              <div style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",marginBottom:"6px"}}>{seated.name} is already seated here.</div>
              <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"20px"}}>What would you like to do?</div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                <button className="cpb cpb-primary" onClick={()=>{
                  if(conflictDialog.fromSeatId)swapStudents(conflictDialog.fromSeatId,conflictDialog.targetSeatId);
                  else assignStudent(incoming.id,conflictDialog.targetSeatId,null);
                  setConflictDialog(null);
                }} style={{padding:"10px 16px",borderRadius:"10px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"13px",fontWeight:600,cursor:"pointer",textAlign:"left"}}>
                  Swap {incoming.name} with {seated.name}
                </button>
                <button className="cpb" onClick={()=>{
                  removeFromSeat(conflictDialog.targetSeatId);
                  setTimeout(()=>assignStudent(incoming.id,conflictDialog.targetSeatId,conflictDialog.fromSeatId),0);
                  setConflictDialog(null);
                }} style={{padding:"10px 16px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:600,cursor:"pointer",textAlign:"left"}}>
                  Move {seated.name} back to unplaced
                </button>
                <button className="cpb" onClick={()=>setConflictDialog(null)}
                  style={{padding:"10px 16px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.06)",background:"#fafbfc",color:"rgba(0,0,0,0.4)",fontSize:"13px",fontWeight:500,cursor:"pointer",textAlign:"left"}}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Confirm before switching room layout — offers to save the
          current room and/or record current seating first, since loading a
          different layout replaces the room structure and re-seats students
          into it. ── */}
      {pendingLayoutLoad&&(
        <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.2)"}} onClick={()=>{setPendingLayoutLoad(null);setShowSaveLayout(false);}}>
          <div className="cp-pop" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxWidth:"340px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
            <div style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",marginBottom:"6px"}}>Load "{pendingLayoutLoad.template.name}"?</div>
            <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"16px",lineHeight:1.5}}>
              {pendingLayoutLoad.layoutDirty&&pendingLayoutLoad.seatingDirty?"Your current room layout and seating haven't been saved."
                :pendingLayoutLoad.layoutDirty?"Your current room layout hasn't been saved."
                :"Your current seating hasn't been recorded."}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"14px"}}>
              {pendingLayoutLoad.layoutDirty&&(!showSaveLayout?(
                <button className="cpb" onClick={()=>{setLayoutName('');setShowSaveLayout(true);}} style={{padding:"9px 12px",borderRadius:"9px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#1a1a2e",fontSize:"12.5px",fontWeight:600,cursor:"pointer",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >💾 Save current layout first</button>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                  <input value={layoutName} onChange={e=>setLayoutName(e.target.value)} autoFocus placeholder="Layout name…"
                    onKeyDown={e=>{if(e.key==='Enter'&&layoutName.trim()){saveLayout(layoutName);setShowSaveLayout(false);setPendingLayoutLoad(p=>({...p,layoutDirty:false}));}}}
                    style={{padding:"7px 9px",borderRadius:"7px",border:"1px solid rgba(66,133,244,0.4)",background:"#fff",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e"}}/>
                  <button className="cpb cpb-primary" onClick={()=>{if(layoutName.trim()){saveLayout(layoutName);setShowSaveLayout(false);setPendingLayoutLoad(p=>({...p,layoutDirty:false}));}}}
                    style={{padding:"7px 0",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"11.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
                  >Save layout</button>
                </div>
              ))}
              {pendingLayoutLoad.seatingDirty&&(
                <button className="cpb cpb-mint" onClick={()=>{confirmSeating();setPendingLayoutLoad(p=>({...p,seatingDirty:false}));}} style={{padding:"9px 12px",borderRadius:"9px",border:"1px solid rgba(46,142,88,0.3)",background:"#eefaf1",color:"#2e8e58",fontSize:"12.5px",fontWeight:700,cursor:"pointer",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#dff3e5"} onMouseLeave={e=>e.currentTarget.style.background="#eefaf1"}
                >✓ Record current seating first</button>
              )}
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button className="cpb cpb-primary" onClick={()=>{loadLayout(pendingLayoutLoad.template);setPendingLayoutLoad(null);setShowSaveLayout(false);}}
                style={{flex:1,padding:"9px 0",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
              >{pendingLayoutLoad.layoutDirty||pendingLayoutLoad.seatingDirty?"Load anyway":`Load "${pendingLayoutLoad.template.name}"`}</button>
              <button className="cpb" onClick={()=>{setPendingLayoutLoad(null);setShowSaveLayout(false);}}
                style={{flex:1,padding:"9px 0",borderRadius:"9px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm before restoring a past arrangement — warns (with a
          best-fit offer) when it was made for a different room, and offers
          to record current seating first if that hasn't happened yet. ── */}
      {pendingArrangementLoad&&(
        <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.2)"}} onClick={()=>setPendingArrangementLoad(null)}>
          <div className="cp-pop" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxWidth:"340px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
            <div style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",marginBottom:"6px"}}>Load "{arrangementLabels[pendingArrangementLoad.entry.id]||pendingArrangementLoad.entry.name}"?</div>
            <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"14px",lineHeight:1.5}}>
              {pendingArrangementLoad.mismatched&&<div>This arrangement was made for a different room layout. I'll fit it into your current layout as closely as possible — groups stay together where there's room, and anyone who doesn't fit is left unplaced on the left.</div>}
              {pendingArrangementLoad.seatingDirty&&<div style={{marginTop:pendingArrangementLoad.mismatched?"8px":0}}>Your current seating hasn't been recorded.</div>}
            </div>
            {pendingArrangementLoad.seatingDirty&&(
              <button className="cpb cpb-mint" onClick={()=>{confirmSeating();setPendingArrangementLoad(p=>({...p,seatingDirty:false}));}} style={{width:"100%",padding:"9px 12px",borderRadius:"9px",border:"1px solid rgba(46,142,88,0.3)",background:"#eefaf1",color:"#2e8e58",fontSize:"12.5px",fontWeight:700,cursor:"pointer",textAlign:"left",marginBottom:"14px",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#dff3e5"} onMouseLeave={e=>e.currentTarget.style.background="#eefaf1"}
              >✓ Record current seating first</button>
            )}
            <div style={{display:"flex",gap:"8px"}}>
              <button className="cpb cpb-primary" onClick={()=>{restoreArrangement(pendingArrangementLoad.entry,{bestFit:pendingArrangementLoad.mismatched});setPendingArrangementLoad(null);}}
                style={{flex:1,padding:"9px 0",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
              >{pendingArrangementLoad.mismatched?"Best-fit & load":"Load anyway"}</button>
              <button className="cpb" onClick={()=>setPendingArrangementLoad(null)}
                style={{flex:1,padding:"9px 0",borderRadius:"9px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showManageTags&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px"}} onClick={e=>{if(e.target===e.currentTarget)setShowManageTags(false);}}>
          <ManageSeatTagsModal
            avTags={avTags}
            orphanTags={orphanTags}
            colorFor={colorFor}
            onSetColor={setTagColor}
            onDelete={removeAvTag}
            onAdd={addAvTag}
            matchCountFor={t=>(activeClass?.students||[]).filter(s=>(s.tags||[]).includes(t)).length}
            students={activeClass?.students||[]}
            onToggleStudent={toggleStudentTagHere}
            onClose={()=>setShowManageTags(false)}
          />
        </div>
      )}
    </div>
  );
}

/* ── Groups Panel placeholder ── */
/* ══════════════════════════════════════════════════════════
   STUDENT SEATING PANEL — clean read-only view, no tags
   ══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   STATION ROTATION (Phase 7): the screens
   The pure rules (stationFor, the timer's segments, ordering) are in the @rotation block above.
   A rotation is only an overlay on a setup: it never writes a seat.
   ══════════════════════════════════════════════════════════ */
const rotColour=color=>COLORS.find(c=>c.text===color)||COLORS[0];
const rotStationLabel=(rot,k)=>rot.labels[k]||`Station ${k+1}`;
/* Top-left corner of a station's badge on the map (an item's box, or a table's bounds) */
const stationAnchor=(items,pieces,id)=>{
  const it=(items||[]).find(i=>i.id===id);
  if(it){const b=itemBounds(it);return{x:b.x,y:b.y};}
  const p=(pieces||[]).find(q=>q.id===id);
  if(p){const w=pieceToWorld(p);return{x:Math.min(...w.poly.map(q=>q[0]))+4,y:Math.min(...w.poly.map(q=>q[1]))-14};} // same spot as its StationBadge
  return null;
};
/* [{name,color,label}] for every group at a step: what the Rotate! card, the strip and the Next line show */
const rotationItems=(rot,step)=>rotationAt(rot,step).map(a=>({name:defaultGroupName(a.group.name,a.gi),color:a.group.color,label:rotStationLabel(rot,a.station)}));

/* On the room map: each station's current group(s), a colour chip beside the station's badge */
const StationOverlay=({rot,items,pieces,students})=>{
  if(!rot)return null;
  const occ=stationOccupancy(rot.groups.length,rot.step,rot.stationOrder.length,rot.direction);
  const nameOf=new Map((students||[]).map(s=>[s.id,s.name]));
  return(
    <>
      {rot.stationOrder.map((sid,k)=>{
        const a=stationAnchor(items,pieces,sid);
        if(!a||!occ[k].length)return null;
        const below=a.y<120; // near the top of the map the chip goes under the badge instead of above it
        return(
          <div key={`ro-${sid}`} data-station-groups={sid} style={{position:"absolute",left:a.x,top:a.y,zIndex:9,pointerEvents:"none",transform:below?"translate(-6px,18px)":"translate(-6px,calc(-100% - 14px))",display:"flex",flexDirection:"column",gap:3,width:"max-content",maxWidth:190,fontFamily:"'Source Sans 3',sans-serif"}}>
            {occ[k].map(gi=>{
              const g=rot.groups[gi],c=rotColour(g.color);
              const names=(g.studentIds||[]).map(id=>nameOf.get(id)).filter(Boolean);
              return(
                <div key={gi} data-rot-group={defaultGroupName(g.name,gi)} style={{background:c.bg,border:`2px solid ${c.text}`,borderRadius:10,padding:"2px 8px 3px",boxShadow:"1.5px 2px 0 var(--cp-shadow)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:800,color:c.text,letterSpacing:0.3}}><span style={{width:9,height:9,borderRadius:"50%",background:c.text,flexShrink:0}}/>{defaultGroupName(g.name,gi)}</div>
                  <div style={{fontSize:10.5,fontWeight:600,color:"#1a1a2e",lineHeight:1.25}}>{names.slice(0,6).join(", ")}{names.length>6?` +${names.length-6}`:""}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

/* "Next: Blue → Station 4 · Red → Station 1": a slim line for the class Seating view */
const RotationNextLine=({rot})=>{
  if(!rot)return null;
  const n=rot.stationOrder.length,last=!rot.loop&&rot.step>=n-1;
  return(
    <div data-rotation-next style={{padding:"6px 16px",borderBottom:"1px solid rgba(0,0,0,0.06)",background:"#fffbea",display:"flex",alignItems:"center",flexWrap:"wrap",gap:"4px 12px",flexShrink:0,fontFamily:"'Source Sans 3',sans-serif",fontSize:"12.5px",color:"#5c4a12"}}>
      <b title="A station rotation is running on this setup">🔄 Step {(rot.step%n)+1} of {n}{rot.loop?` · lap ${Math.floor(rot.step/n)+1}`:""}</b>
      {last?<span style={{fontWeight:600}}>Last station: no more moves</span>:<>
        <b style={{color:"rgba(0,0,0,0.45)"}}>Next:</b>
        {rotationItems(rot,rot.step+1).map((it,i)=>{const c=rotColour(it.color);return <span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,fontWeight:700,color:"#1a1a2e"}}><span style={{width:9,height:9,borderRadius:"50%",background:c.text}}/>{it.name} → {it.label}</span>;})}
      </>}
    </div>
  );
};

/* Under the projector timer: where every group is now (or is moving to) */
function RotationStrip({strip,moving}){
  return(
    <div data-rotation-strip style={{display:"flex",flexWrap:"wrap",gap:"6px 8px",justifyContent:"center",alignItems:"center",maxWidth:"92vw",fontFamily:"'Source Sans 3',sans-serif"}}>
      <span style={{fontSize:"14px",fontWeight:700,color:"rgba(0,0,0,0.45)",marginRight:2}}>{moving?"Move to:":"Now:"}</span>
      {strip.items.map((it,i)=>{const c=rotColour(it.color);return(
        <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:"14px",background:c.bg,border:`2px solid ${c.text}`,color:"#1a1a2e",fontSize:"15px",fontWeight:700,boxShadow:moving?`0 0 0 3px ${hexA(c.text,0.25)}`:"none"}}>
          <span style={{width:10,height:10,borderRadius:"50%",background:c.text}}/>{it.name} → {it.label}
        </span>);})}
    </div>
  );
}

/* The big full-screen "Rotate!" over everything (the projector views included). Closes itself, or on a click. */
const RotateCard=({items,onClose})=>createPortal(
  <div data-rotate-card onClick={onClose} title="Click to close" style={{position:"fixed",inset:0,zIndex:700,background:"rgba(20,14,8,0.86)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"4vh",padding:"24px",fontFamily:"'Source Sans 3',sans-serif",animation:"coldCallReveal 0.35s cubic-bezier(0.34,1.56,0.64,1)",cursor:"pointer"}}>
    <div style={{fontSize:"clamp(56px,12vw,150px)",fontWeight:800,color:"#fff",letterSpacing:"2px",lineHeight:1}}>Rotate! ↻</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:"12px 16px",justifyContent:"center",maxWidth:"92vw"}}>
      {items.map((it,i)=>{const c=rotColour(it.color);return(
        <div key={i} style={{background:c.bg,border:`4px solid ${c.text}`,borderRadius:"18px",padding:"8px 20px",fontSize:"clamp(18px,3vw,38px)",fontWeight:800,color:"#1a1a2e",whiteSpace:"nowrap"}}><span style={{color:c.text}}>{it.name}</span> → {it.label}</div>);})}
    </div>
    <div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)"}}>click anywhere to close</div>
  </div>,document.body);

/* Floating controls while a rotation runs (teacher-facing, bottom middle). Rotate and Back never touch the timer. */
function RotationBar({rot,setupName,timerState,onRotate,onBack,onEnd}){
  const[ask,setAsk]=useState(false);
  const n=rot.stationOrder.length;
  return(
    <div data-rotation-bar className="cp-pop" style={{position:"fixed",left:"50%",bottom:"58px",transform:"translateX(-50%)",zIndex:450,display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px",borderRadius:"14px",fontFamily:"'Source Sans 3',sans-serif",maxWidth:"calc(100vw - 24px)",flexWrap:"wrap",justifyContent:"center"}}>
      {ask?(<>
        <span style={{fontSize:"12.5px",fontWeight:700,color:"#2b2118"}}>End the rotation? The setup and the timer stay.</span>
        <button className="cpb cpb-bad" onClick={()=>{setAsk(false);onEnd();}} title="Yes, stop the station rotation" style={{padding:"6px 12px",borderRadius:"9px",fontSize:"12.5px",fontWeight:700}}>End it</button>
        <button className="cpb" onClick={()=>setAsk(false)} title="No, keep rotating" style={{padding:"6px 12px",borderRadius:"9px",fontSize:"12.5px",fontWeight:600}}>Keep going</button>
      </>):(<>
        <span title={`Station rotation${setupName?` in ${setupName}`:""}`} style={{fontSize:"12.5px",fontWeight:800,color:"#2b2118",whiteSpace:"nowrap"}}>🔄 Step {(rot.step%n)+1} of {n}</span>
        {timerState==="missing"&&<span title="The timer that was moving the groups is gone. Use Rotate to move them yourself." style={{fontSize:"11.5px",fontWeight:700,color:"#7a5a12",background:"#fdf3d6",border:"1.5px solid rgba(184,133,10,0.45)",borderRadius:"999px",padding:"2px 9px"}}>timer not running</span>}
        {timerState==="done"&&<span title="The timer has finished its lap" style={{fontSize:"11.5px",fontWeight:700,color:"#7a5a12",background:"#fdf3d6",border:"1.5px solid rgba(184,133,10,0.45)",borderRadius:"999px",padding:"2px 9px"}}>timer finished</span>}
        <button className={cpc()} onClick={onBack} disabled={rot.step<=0} title="Move every group back to where it was before the last move (the timer is not touched)" style={{padding:"6px 11px",borderRadius:"9px",fontSize:"12.5px",fontWeight:600}}>← Back</button>
        <button className={cpc("primary")} onClick={onRotate} title="Move every group on to its next station now (the timer is not touched)" style={{padding:"6px 14px",borderRadius:"9px",fontSize:"12.5px",fontWeight:700}}>Rotate ↻</button>
        <button className={cpc()} onClick={()=>setAsk(true)} title="Stop the station rotation (asks first). The setup and the timer stay." style={{padding:"6px 11px",borderRadius:"9px",fontSize:"12.5px",fontWeight:600}}>End rotation</button>
      </>)}
    </div>
  );
}

/* "Start rotation": minutes, changeover, direction, laps. Opens from the Stations popover. */
function RotationStartDialog({stationCount,groups,onStart,onClose}){
  const[minutes,setMinutes]=useState('5');
  const[changeover,setChangeover]=useState('30');
  const[direction,setDirection]=useState('forward');
  const[loop,setLoop]=useState(false);
  const mins=Math.min(60,Math.max(0.5,parseFloat(minutes)||5));
  const chg=Math.min(180,Math.max(0,Math.round(parseFloat(changeover)||0)));
  const total=stationCount*mins*60+chg*(loop?stationCount:Math.max(0,stationCount-1));
  const head={fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.35)",margin:"12px 2px 5px"};
  const num={width:"64px",padding:"6px 8px",borderRadius:"8px",fontSize:"13.5px",fontWeight:700,fontFamily:"'Source Sans 3',sans-serif",textAlign:"center"};
  const seg=(on,label,help,fn)=><button className={cpc("",on)} onClick={fn} title={help} style={{flex:1,padding:"7px 8px",borderRadius:"8px",fontSize:"12.5px",fontWeight:on?700:600}}>{label}</button>;
  const go=autoStart=>onStart({groups,direction,minutes:mins,changeover:chg,loop,autoStart});
  return createPortal(
    <div onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(20,14,8,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Sans 3',sans-serif"}}>
      <div className="cp-pop" role="dialog" aria-label="Start rotation" style={{width:"392px",maxWidth:"calc(100vw - 32px)",maxHeight:"calc(100vh - 40px)",overflowY:"auto",borderRadius:"14px",padding:"16px 18px"}}>
        <div style={{fontSize:"16px",fontWeight:800,color:"#2b2118"}}>Start rotation</div>
        <div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.5)",marginTop:"2px",lineHeight:1.4}}>{groups.length} group{groups.length!==1?"s":""} across {stationCount} stations. This makes a timer with a step for each station. When a step ends, every group moves on.</div>
        <div style={head}>Time</div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",fontSize:"12.5px",color:"rgba(0,0,0,0.6)",fontWeight:600}}>
          <label style={{display:"flex",alignItems:"center",gap:"6px"}} title="How long each group spends at a station">
            <input type="number" min="0.5" max="60" step="0.5" value={minutes} onChange={e=>setMinutes(e.target.value)} onKeyDown={e=>e.stopPropagation()} aria-label="Minutes per station" style={num}/>minutes per station
          </label>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginTop:"7px",fontSize:"12.5px",color:"rgba(0,0,0,0.6)",fontWeight:600}}>
          <label style={{display:"flex",alignItems:"center",gap:"6px"}} title="Time to walk to the next station, shown on the timer as a Move! step. 0 turns it off; up to 3 minutes (180 s).">
            <input type="number" min="0" max="180" step="5" value={changeover} onChange={e=>setChangeover(e.target.value)} onKeyDown={e=>e.stopPropagation()} aria-label="Changeover seconds" style={num}/>seconds to move
          </label>
          <span style={{fontSize:"11px",color:"rgba(0,0,0,0.4)"}}>{chg>0?"a \"Move!\" step between stations (0–180 s)":"no Move! step"}</span>
        </div>
        <div style={head}>Direction</div>
        <div style={{display:"flex",gap:"4px"}}>
          {seg(direction==='forward',"Forwards for everyone","Every group goes 1 → 2 → 3 …",()=>setDirection('forward'))}
          {seg(direction==='alternate',"Alternate directions","Every second group goes backwards: 3 → 2 → 1 …",()=>setDirection('alternate'))}
        </div>
        {direction==='alternate'&&stationCount%2===1&&groups.length>1&&<div style={{fontSize:"11px",color:"#7a5a12",marginTop:"5px",lineHeight:1.35}}>With an odd number of stations ({stationCount}), two groups will sometimes land on the same station. An even number works best.</div>}
        <div style={head}>Rounds</div>
        <div style={{display:"flex",gap:"4px"}}>
          {seg(!loop,"One full lap","Each group visits every station once, then the timer finishes",()=>setLoop(false))}
          {seg(loop,"Loop","Keep going round until you end the rotation",()=>setLoop(true))}
        </div>
        <div data-rotation-summary style={{fontSize:"12px",color:"rgba(0,0,0,0.55)",marginTop:"12px",lineHeight:1.45,padding:"7px 9px",borderRadius:"8px",background:"rgba(0,0,0,0.04)"}}>
          {stationCount} stations × {fmtLen(Math.round(mins*60))}{chg>0?` + ${loop?stationCount:Math.max(0,stationCount-1)} moves of ${fmtLen(chg)}`:""} = <b>{loop?`${fmtLen(Math.round(total))} a lap`:fmtLen(Math.round(total))}</b>
          {groups.length<stationCount&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.45)"}}>Fewer groups than stations: some stations stay empty each round.</div>}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:"6px",marginTop:"16px",flexWrap:"wrap"}}>
          <button className={cpc()} onClick={onClose} title="Don't start a rotation" style={{padding:"8px 14px",borderRadius:"9px",fontSize:"12.5px",fontWeight:600}}>Cancel</button>
          <button className={cpc()} onClick={()=>go(false)} title="Make the timer but leave it paused: press Start on it when you're ready" style={{padding:"8px 14px",borderRadius:"9px",fontSize:"12.5px",fontWeight:600}}>Create paused</button>
          <button className={cpc("primary")} onClick={()=>go(true)} title="Make the timer and start it now" style={{padding:"8px 16px",borderRadius:"9px",fontSize:"12.5px",fontWeight:700}}>▶ Start now</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* The Stations popover in Manage Seating: this setup's stations in order (drag to reorder, rename), and
   which groups take part. Start rotation opens the dialog above. */
function StationsPopover({classId,students,stations,setupName,running,onReorder,onRename,onStart,btnS,menuHead}){
  const[sources,setSources]=useState(null);   // [{id,label,groups:[{idx,name,studentIds}]}]
  const[srcId,setSrcId]=useState(null);
  const[picked,setPicked]=useState(null);     // Set of group positions taking part
  const[dragIdx,setDragIdx]=useState(null);
  const n=stations.length;
  useEffect(()=>{
    let alive=true;
    Promise.all([load(`gp-${classId}`,null),load(`gg-${classId}`,[])]).then(([gp,gg])=>{
      if(!alive)return;
      const known=new Set((students||[]).map(s=>s.id));
      /* same as the Groups panel: empty groups drop out, and colour/default name follow the position that is left */
      const mk=(idLists,names)=>(idLists||[]).map((ids,i)=>({ids:(ids||[]).filter(id=>known.has(id)),name:(names||[])[i]||''})).filter(g=>g.ids.length>0).map((g,i)=>({idx:i,name:defaultGroupName(g.name,i),studentIds:g.ids}));
      const list=[];
      const cur=mk(gp?.resultGroupIds,gp?.groupNames);
      if(cur.length)list.push({id:'current',label:'Last generated groups',groups:cur});
      (Array.isArray(gg)?gg:[]).forEach(g=>{const gs=mk(g.groupIds,g.names);if(gs.length)list.push({id:g.id,label:`Saved: ${g.name}`,groups:gs});});
      setSources(list);setSrcId(list[0]?.id||null);
    });
    return()=>{alive=false;};
  },[classId]);
  const src=sources?.find(s=>s.id===srcId)||null;
  /* more groups than stations: start with the first few ticked, and let Tom choose */
  useEffect(()=>{if(src)setPicked(new Set(src.groups.slice(0,Math.max(1,n)).map(g=>g.idx)));},[srcId,sources,n]);
  const chosen=src&&picked?src.groups.filter(g=>picked.has(g.idx)):[];
  const tooMany=chosen.length>n;
  const canStart=!running&&n>=2&&chosen.length>=1&&!tooMany;
  const nameOf=new Map((students||[]).map(s=>[s.id,s.name]));
  const toggle=idx=>setPicked(p=>{const q=new Set(p);q.has(idx)?q.delete(idx):q.add(idx);return q;});
  const drop=to=>{
    if(dragIdx===null||dragIdx===to){setDragIdx(null);return;}
    const ids=stations.map(s=>s.id);const[m]=ids.splice(dragIdx,1);ids.splice(to,0,m);
    setDragIdx(null);onReorder(ids);
  };
  const field={padding:"4px 7px",borderRadius:"7px",fontSize:"12px",fontWeight:600,fontFamily:"'Source Sans 3',sans-serif",minWidth:0};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
      <div style={{fontSize:"11px",color:"rgba(0,0,0,0.5)",lineHeight:1.4,padding:"2px 2px 0"}}>Stations in <b style={{color:"#1a1a2e"}}>{setupName}</b>, in the order groups visit them.</div>
      <div>
        <div style={menuHead}>Stations{n?` (${n})`:""}</div>
        {n===0&&<div data-stations-empty style={{fontSize:"11.5px",color:"rgba(0,0,0,0.5)",lineHeight:1.45,padding:"8px 9px",borderRadius:"8px",background:"rgba(0,0,0,0.04)"}}>No stations here yet. To make one, select a bench, table or item on the map, then press <b>★ Mark as station</b> in its selection bar. Give each a number and a name, then come back.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
          {stations.map((st,i)=>(
            <div key={st.id} data-station-row={st.id} draggable onDragStart={e=>{e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain","cp-station");setDragIdx(i);}} onDragEnd={()=>setDragIdx(null)}
              onDragOver={e=>{if(dragIdx!==null)e.preventDefault();}} onDrop={e=>{e.preventDefault();drop(i);}}
              title="Drag to change the order groups visit the stations" style={{display:"flex",alignItems:"center",gap:"6px",padding:"4px 6px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:dragIdx===i?"#f0f1f4":"#fff",opacity:dragIdx===i?0.5:1,cursor:"grab"}}>
              <span aria-hidden="true" style={{color:"rgba(0,0,0,0.3)",fontSize:"12px",letterSpacing:"-2px"}}>⋮⋮</span>
              <span style={{minWidth:"22px",height:"22px",boxSizing:"border-box",padding:"0 5px",borderRadius:"11px",background:"#ffd98a",border:"2px solid #2b2118",color:"#1a1208",fontSize:"12px",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{st.n}</span>
              <input key={`${st.id}${st.name}`} defaultValue={st.name} maxLength={24} placeholder="Name, e.g. Circuits" title={`Rename station ${st.n} (shown on the map and the timer)`} aria-label={`Name of station ${st.n}`}
                onBlur={e=>{if(e.target.value!==st.name)onRename(st,e.target.value.slice(0,24));}} onKeyDown={e=>{if(e.key==='Enter')e.target.blur();e.stopPropagation();}} onMouseDown={e=>e.stopPropagation()} draggable={false} style={{...field,flex:1}}/>
              <span title={st.kind==='piece'?"A table or bench":"A room item"} style={{fontSize:"11px",color:"rgba(0,0,0,0.35)"}}>{st.kind==='piece'?"▭":"◆"}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={menuHead}>Groups taking part</div>
        {sources&&sources.length===0&&<div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.5)",lineHeight:1.45,padding:"8px 9px",borderRadius:"8px",background:"rgba(0,0,0,0.04)"}}>No groups yet. Make some in Manage Groups (press Generate) and they will show up here. Saved groupings work too.</div>}
        {src&&<>
          <select value={srcId} onChange={e=>setSrcId(e.target.value)} title="Which groups to rotate: the last ones you generated, or a saved grouping" style={{...field,width:"100%",marginBottom:"5px"}}>
            {sources.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
            {src.groups.map(g=>{const c=COLORS[g.idx%COLORS.length];const on=picked?.has(g.idx);return(
              <label key={g.idx} data-group-pick={g.name} title={`${g.name}: ${g.studentIds.map(id=>nameOf.get(id)).join(", ")}`} style={{display:"flex",alignItems:"center",gap:"7px",padding:"4px 8px",borderRadius:"8px",background:on?c.bg:"#fff",border:`1.5px solid ${on?c.text:"rgba(0,0,0,0.08)"}`,cursor:"pointer",opacity:on?1:0.65}}>
                <input type="checkbox" checked={!!on} onChange={()=>toggle(g.idx)} style={{margin:0}}/>
                <span style={{width:"10px",height:"10px",borderRadius:"50%",background:c.text,flexShrink:0}}/>
                <span style={{fontSize:"12px",fontWeight:800,color:c.text,whiteSpace:"nowrap"}}>{g.name}</span>
                <span style={{fontSize:"10.5px",color:"rgba(0,0,0,0.5)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,minWidth:0}}>{g.studentIds.map(id=>(nameOf.get(id)||"").split(" ")[0]).join(", ")}</span>
              </label>);})}
          </div>
          {tooMany&&<div data-groups-warning style={{fontSize:"11.5px",fontWeight:600,color:"#7a5a12",background:"#fdf3d6",border:"1.5px solid rgba(184,133,10,0.45)",borderRadius:"8px",padding:"6px 8px",marginTop:"5px",lineHeight:1.4}}>⚠ {chosen.length} groups but only {n} station{n!==1?"s":""}. Untick {chosen.length-n} group{chosen.length-n!==1?"s":""} to choose who takes part.</div>}
          {!tooMany&&n>0&&chosen.length>0&&chosen.length<n&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.45)",marginTop:"5px",lineHeight:1.35}}>{chosen.length} group{chosen.length!==1?"s":""}, {n} stations: {n-chosen.length} station{n-chosen.length!==1?"s":""} sit{n-chosen.length===1?"s":""} empty each round, which is fine.</div>}
        </>}
      </div>
      {running
        ?<div data-rotation-running style={{fontSize:"11.5px",fontWeight:600,color:"#7a5a12",background:"#fdf3d6",border:"1.5px solid rgba(184,133,10,0.45)",borderRadius:"8px",padding:"6px 8px",lineHeight:1.4}}>A rotation is running (see the bar at the bottom). End it there to start a new one.</div>
        :<>
          {n===1&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.45)"}}>A rotation needs at least 2 stations.</div>}
          <button className={`cpb cpb-primary${canStart?"":" is-off"}`} disabled={!canStart} onClick={()=>onStart(chosen.map(g=>({name:g.name,color:COLORS[g.idx%COLORS.length].text,studentIds:g.studentIds})))} title={canStart?"Choose the timing and start rotating the groups round the stations":"Needs 2 or more stations and some groups (no more groups than stations)"} style={{...btnS,width:"100%",fontWeight:700}}>🔄 Start rotation…</button>
        </>}
    </div>
  );
}

function StudentSeatingPanel({activeClass,setups,seatRev,onChangeSetups,checklist,onChangeChecklist,flagsByStudent,now,showFlags,onSetShowFlags,onGoToChecklist,rotation}){
  const[chairsMatch]=useChairsMatch(activeClass?.id);
  /* Class setups (Phase 5): the same active setup as Manage Seating (it lives in TeacherApp) */
  const setup=setups?setups.list.find(x=>x.id===setups.activeId)||null:null;
  const isRegular=!setup||setup.id===REGULAR_SETUP;
  const slKey=activeClass?.id&&setups?setupSlKey(activeClass.id,setup?.id):null;
  const[classRules,setClassRules]=useState([]); // keep-apart/together rules are the class's (kept in sl-<class>), whichever setup is showing
  const[layout,setLayout]=useState(null);
  const[displayMode,setDisplayMode]=useState(false);
  const[nameClick,setNameClick]=useState(null); // {studentId, name, x, y} — opened by clicking either the name or a flag dot
  const[zoom,setZoom]=useState(1); // trackpad pinch-to-zoom on the canvas; 1 = 100%
  const[displayZoom,setDisplayZoom]=useState(1); // separate zoom for the full-screen projector view
  const ZOOM_MIN=0.4,ZOOM_MAX=2.2;
  const[conflicts,setConflicts]=useState([]); // rules the last Randomise couldn't satisfy
  const[canUndoRandom,setCanUndoRandom]=useState(false);
  const[randomising,setRandomising]=useState(false);
  const prevSeatsRef=useRef(null);

  /* showFlags lives in TeacherApp so this header toggle and Manage Seating's
     "Show flags" toggle are the same setting and can't disagree. */
  const toggleShowFlags=()=>onSetShowFlags?.(!showFlags);

  const closeNameClick=()=>setNameClick(null);

  /* Close the name-click popup on an outside click */
  useEffect(()=>{
    if(!nameClick)return;
    const h=()=>closeNameClick();
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[nameClick]);

  const scrollRef=useRef(null);
  const displayScrollRef=useRef(null);

  /* Trackpad pinch-to-zoom — Chromium reports a trackpad pinch as a wheel
     event with ctrlKey set, so that's the signal to zoom on. A plain
     two-finger swipe (no ctrlKey) is left alone and pans normally, since the
     canvas already scrolls natively in all directions. Non-passive so
     preventDefault() can stop the browser's own page-zoom gesture. */
  useEffect(()=>{
    const el=scrollRef.current;if(!el)return;
    const onWheel=e=>{if(!e.ctrlKey)return;e.preventDefault();setZoom(z=>Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,z*(1-e.deltaY*0.01))));};
    el.addEventListener('wheel',onWheel,{passive:false});
    return()=>el.removeEventListener('wheel',onWheel);
    // scrollRef's div only mounts once a layout with seats/room items has
    // loaded (it's conditionally rendered), so this must re-run once that
    // happens — a mount-only [] effect would attach to a still-null ref.
  },[layout]);
  useEffect(()=>{
    if(!displayMode)return;
    const el=displayScrollRef.current;if(!el)return;
    const onWheel=e=>{if(!e.ctrlKey)return;e.preventDefault();setDisplayZoom(z=>Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,z*(1-e.deltaY*0.01))));};
    el.addEventListener('wheel',onWheel,{passive:false});
    return()=>el.removeEventListener('wheel',onWheel);
  },[displayMode]);

  /* Self-heal against a student removed from the roster, same as the teacher's
     seating editor — this view has no save of its own, so it just needs to stop
     showing them; storage is already cleaned up on the class-save side. */
  useEffect(()=>{
    if(!activeClass||!layout)return;
    const validIds=new Set((activeClass.students||[]).map(s=>s.id));
    setLayout(prev=>{
      if(!prev)return prev;
      const nextSeats=(prev.seats||[]).map(s=>s.studentId&&!validIds.has(s.studentId)?{...s,studentId:null,locked:false}:s);
      return nextSeats.some((s,i)=>s!==prev.seats[i])?{...prev,seats:nextSeats}:prev;
    });
  },[activeClass?.students]);

  /* Randomise from here — same engine as Manage Seating's Randomize (seat tags,
     keep-apart/together rules, plus whatever Smart shuffle / tag-rule options
     were last set there), then saved straight back to the room. */
  const randomise=async()=>{
    if(!layout||!activeClass?.id||randomising)return;
    setRandomising(true);
    const[m,opts]=await Promise.all([load(`ph-mode-${activeClass.id}`,'combined'),load('seating-rand-opts',{})]);
    const mode=m==='separate'?'separate':'combined';
    const history=await load(phKey(activeClass.id,mode,'seating'),{});
    const seatsIn=(layout.seats||[]).map(s=>({...s,tags:(s.tags||[]).filter(t=>!LEGACY_SEAT_TAGS.has(t))}));
    // only the furniture this setup uses is filled; the rules are the class's
    const res=randomizeSeating({students:activeClass.students||[],seats:seatsForSetup({seats:seatsIn,pieces:layout.pieces},setup),rules:(isRegular?layout.rules:classRules)||[],smartShuffle:!!opts?.smartShuffle,hardTagRules:opts?.hardTagRules!==false,pairingHistory:history});
    prevSeatsRef.current=layout.seats;setCanUndoRandom(true);
    const next={...layout,seats:restoreSeatFlags(res.nextSeats,seatsIn)};
    setLayout(next);save(slKey,next); // this setup's own key only
    setConflicts(res.placed?res.conflicts:[]);
    if(res.placed)save(phKey(activeClass.id,mode,'seating'),res.nextHistory);
    setRandomising(false);
  };
  const undoRandomise=()=>{
    if(!prevSeatsRef.current||!layout||!activeClass?.id)return;
    const next={...layout,seats:prevSeatsRef.current};
    prevSeatsRef.current=null;setCanUndoRandom(false);setConflicts([]);
    setLayout(next);save(slKey,next);
  };

  const centerScroll=(ref,seats,roomItems,pieces)=>{
    const el=ref.current;if(!el||!seats.length)return;
    const pb=pieces?.length?piecesBounds(pieces,slotsForLayout(pieces,[])):null;
    const allItems=[...seats.filter(s=>s.x!==undefined).map(s=>({x:s.x,y:s.y,w:SW,h:SH})),...(roomItems||[]).map(r=>({x:r.x,y:r.y,w:SW,h:SH})),...(pb?[pb]:[])];
    if(!allItems.length)return;
    const minX=Math.min(...allItems.map(i=>i.x));
    const minY=Math.min(...allItems.map(i=>i.y));
    const maxX=Math.max(...allItems.map(i=>i.x+i.w));
    const maxY=Math.max(...allItems.map(i=>i.y+i.h));
    el.scrollLeft=Math.max(0,(minX+maxX)/2-el.clientWidth/2);
    el.scrollTop=Math.max(0,(minY+maxY)/2-el.clientHeight/2);
  };

  /* Same race as the teacher's seating editor: opening this tab can grow the
     Electron window (main.js animates the resize), so a fixed delay can measure
     the window's old, narrower width — which is why this looked "stuck" on the
     left. Center after the seats paint, then again once the window actually
     finishes resizing. */
  const centerScrollWhenReady=(ref,seats,roomItems,pieces)=>{
    let raf1=requestAnimationFrame(()=>{raf1=requestAnimationFrame(()=>centerScroll(ref,seats,roomItems,pieces));});
    const recenter=()=>centerScroll(ref,seats,roomItems,pieces);
    window.addEventListener('resize',recenter);
    const stop=setTimeout(()=>window.removeEventListener('resize',recenter),700);
    return()=>{cancelAnimationFrame(raf1);window.removeEventListener('resize',recenter);clearTimeout(stop);};
  };

  useEffect(()=>{
    if(!activeClass?.id||!slKey)return;
    let alive=true;
    setZoom(1);
    setConflicts([]);prevSeatsRef.current=null;setCanUndoRandom(false);
    let cleanupCenter=()=>{};
    const classId=activeClass.id,key=slKey;
    if(isRegular)setClassRules([]);else load(`sl-${classId}`,null).then(c=>{if(alive)setClassRules(c?.rules||[]);});
    load(key,null).then(l0=>syncClassWithRoom(classId,l0,key)).then(l=>{
      if(!alive)return;
      if(l){
        const{seats:repairedSeats,groups:repairedGroups}=repairSeatGroups(l.seats||[],l.groups||[]);
        l={...l,seats:repairedSeats,groups:repairedGroups};
      }
      const loaded=l||{seats:[],groups:[],roomItems:[]};
      setLayout(loaded);
      cleanupCenter=centerScrollWhenReady(scrollRef,loaded.seats||[],loaded.roomItems||[],loaded.pieces||[]);
      if(loaded.walls?.length)requestAnimationFrame(()=>requestAnimationFrame(()=>setZoom(fitZoomFor(scrollRef.current,loaded))));
    });
    return()=>{alive=false;cleanupCenter();};
  },[activeClass?.id,slKey,seatRev]);

  useEffect(()=>{
    if(!displayMode)return;
    const h=e=>{if(e.key==='Escape')setDisplayMode(false);};
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[displayMode]);

  /* Center the full-screen projector view once it opens (and its own window/fullscreen
     transition has settled) — same fix as the regular seating view above. */
  useEffect(()=>{
    if(!displayMode||!layout)return;
    setDisplayZoom(1);
    if(layout.walls?.length)requestAnimationFrame(()=>requestAnimationFrame(()=>setDisplayZoom(fitZoomFor(displayScrollRef.current,layout))));
    return centerScrollWhenReady(displayScrollRef,layout.seats||[],layout.roomItems||[],layout.pieces||[]);
  },[displayMode,layout]);

  if(!activeClass)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontFamily:"'Source Sans 3',sans-serif",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))"}}>No class selected</div>
  );
  if(!layout)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))",color:"var(--board-muted)",fontSize:"13px",fontFamily:"'Source Sans 3',sans-serif"}}>Loading…</div>
  );

  const{seats=[],groups=[],roomItems=[],pieces=[],joins=[],walls=[],openings=[]}=layout;
  const pos=sPosMap(seats,groups,null);
  const studentById=id=>(activeClass?.students||[]).find(s=>s.id===id);
  const hasLayout=seats.length>0||roomItems.length>0||pieces.length>0||walls.length>0;
  // table pieces: the same geometry and drawing as Manage Seating, read-only here
  const pieceSlots=slotsForLayout(pieces,joins);
  const pieceSlotByKey=new Map(pieceSlots.map(sl=>[sl.key,sl]));
  const pieceSeatByKey=new Map(seats.filter(s=>s.pieceId).map(s=>[`${s.pieceId}:${s.slot}`,s]));
  const canvasSize=canvasContentSize(seats,roomItems,pieces,pieceSlots,walls);
  /* furniture this setup doesn't use is drawn faded (worked out here, never saved) */
  const usableIds=usableSeatIds({seats,pieces},setup);
  const notUsedHere=new Set(seats.filter(s=>s.used&&!s.unavailable&&!usableIds.has(s.id)).map(s=>s.id));
  const offPieceIds=unusablePieceIds(pieces,setup);
  const manySetups=(setups?.list.length||0)>1;
  /* a station rotation (Phase 7) is drawn over its own setup only, and never touches a seat */
  const rotHere=rotation&&rotation.setupId===(setup?.id||REGULAR_SETUP)?rotation:null;

  const RoomCanvas=({scale=1,interactive=true})=>{
    const chairMap=chairIndexMap(seats,groups);
    const grouped=new Set(groups.flatMap(g=>g.seatIds));
    return(
    <div style={{position:"relative",minWidth:canvasSize.w*scale,minHeight:canvasSize.h*scale,flexShrink:0}}>
     {/* Everything is laid out in unscaled canvas px; `scale` is applied with CSS zoom (callers pass 1) */}
     <div style={{position:"absolute",left:0,top:0,zoom:scale}}>
      <InkDefs/>
      {/* The room: walls, doors and windows, then the labelled items — the same drawing as the editor, read-only */}
      {roomItems.filter(i=>i.type==='area').map(item=><RoomItemView key={item.id} item={item} fontScale={1.08}/>)}
      <WallsLayer walls={walls} openings={openings}/>
      {roomItems.filter(i=>i.type!=='area').map(item=><RoomItemView key={item.id} item={item} fontScale={1.08}/>)}

      {/* Table pieces: chairs round the outside and one table top per joined cluster */}
      <PieceTables pieces={pieces} joins={joins} slots={pieceSlots} seatByKey={pieceSeatByKey} chairMap={chairMap} hideUnused groups={groups} chairMatch={chairsMatch}/>
      <UnusedFurniture pieces={pieces} slots={pieceSlots} offIds={offPieceIds} setupName={setup?.name} hint={interactive}/>

      {/* Chairs first, so the table tops below cover them and only their backs show */}
      <LegacyChairs seats={seats} groups={groups} pos={pos} chairMap={chairMap} hideUnused chairMatch={chairsMatch}/>
      {/* One shared table top under each group's seats */}
      {groups.map(g=>{
        if(g.seatIds.some(id=>seats.find(x=>x.id===id)?.pieceId))return null; // a piece table draws itself
        const gb=gBoundsFromSeats(g,seats);
        const live=g.seatIds.filter(id=>seats.some(x=>x.id===id&&x.used&&!x.unavailable));
        return <TableSurface key={`gb-${g.id}`} rect={{x:gb.x-GROUP_PAD,y:gb.y-GROUP_PAD,w:gb.w+GROUP_PAD*2,h:gb.h+GROUP_PAD*2}} radius={12} fill={tableFill(g.color)} faded={live.length>0&&live.every(id=>notUsedHere.has(id))}/>;
      })}

      {/* Seats — chair + paper name tag, no controls */}
      {seats.map(s=>{
        const p=pos[s.id];if(!p||!s.used)return null;
        const st=s.studentId?studentById(s.studentId):null;
        const studentFlags=st?(flagsByStudent?.get(st.id)||[]):[];
        if(s.pieceId){
          // a table seat: its name tag sits where the table puts it (the chair is already drawn)
          const t=pieceSlotByKey.get(`${s.pieceId}:${s.slot}`)?.tag;
          if(!t||!st)return null;
          return(
            <div key={s.id} style={{position:"absolute",left:t.x-t.w/2,top:t.y-t.h/2,width:t.w,height:t.h,zIndex:2}}>
              <NameTag name={st.name} tilt={tagTilt(s.id)} w={t.w} h={t.h} fontSize={t.font+0.5} pad={5}
                cursor={interactive?"pointer":"default"} title={st.name}
                onClick={interactive?e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}:undefined}/>
              {showFlags&&studentFlags.length>0&&(
                <div className="flag-indicator" style={{position:"absolute",top:-6,right:-6,zIndex:10}}>
                  <FlagDots flags={studentFlags} scale={1} onClick={interactive?e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}:undefined}/>
                </div>
              )}
            </div>
          );
        }
        return(
          <div key={s.id} style={{position:"absolute",left:p.x,top:p.y,width:SW,height:SH,opacity:notUsedHere.has(s.id)?0.5:1}} title={notUsedHere.has(s.id)&&interactive?`Not used in ${setup?.name}`:undefined}>
            <SeatArt state="ok" standalone={!grouped.has(s.id)} color={s.color}/>
            {st&&(
              <div style={{position:"absolute",left:5,top:6,width:SW-10,height:30}}>
                <NameTag name={st.name} tilt={tagTilt(s.id)} w={SW-10} h={30} fontSize={13} pad={6}
                  cursor={interactive?"pointer":"default"}
                  title={st.name}
                  onClick={interactive?e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}:undefined}/>
              </div>
            )}
            {/* Flag indicators */}
            {showFlags&&studentFlags.length>0&&(
              <div className="flag-indicator" style={{position:"absolute",top:-4,right:-4,zIndex:10}}>
                <FlagDots flags={studentFlags} scale={1} onClick={interactive?e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}:undefined}/>
              </div>
            )}
          </div>
        );
      })}
      <StationBadges items={roomItems} pieces={pieces}/>
      <StationOverlay rot={rotHere} items={roomItems} pieces={pieces} students={activeClass?.students}/>
     </div>
    </div>
    );
  };

  const Header=({onDisplayClick})=>(
    <div style={{padding:"12px 18px 10px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",background:"#fff",flexShrink:0}}>
      <div>
        <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",fontFamily:"'Source Sans 3',sans-serif"}}>Seating</div>
        <div style={{fontSize:"15px",fontWeight:700,color:"#1a1a2e",marginTop:"1px",fontFamily:"'Source Sans 3',sans-serif"}}>{activeClass.name}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end",gap:"8px"}}>
        {hasLayout&&canUndoRandom&&<button className="cpb" onClick={undoRandomise} title="Put everyone back where they were before the last Randomise" style={{fontSize:"12px",fontWeight:600,padding:"7px 11px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"none",color:"rgba(0,0,0,0.45)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>↺ Undo</button>}
        {hasLayout&&<button className="cpb cpb-primary" onClick={randomise} title="Shuffle everyone into new seats, using the seat tags, keep-apart/together rules and Randomize options from Manage Seating" style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12.5px",fontWeight:700,padding:"7px 13px",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>🎲 Randomise</button>}
        <button className="cpb" onClick={toggleShowFlags} title={showFlags?"Hide flags in this view (e.g. before projecting)":"Show flags in this view"}
          style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.07)",background:"none",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
        >
          <span style={{fontSize:"11px",fontWeight:600,color:"rgba(0,0,0,0.4)"}}>🚩 Flags</span>
          <CPSwitch on={showFlags} small/>
        </button>
        {hasLayout&&(
          <button className="cpb" onClick={onDisplayClick} title="Full screen (projector view)" style={{fontSize:"14px",fontWeight:600,padding:"7px 12px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.07)",background:"none",color:"rgba(0,0,0,0.3)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#eaf1fc";e.currentTarget.style.color="#2e6bce";e.currentTarget.style.borderColor="rgba(66,133,244,0.3)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(0,0,0,0.3)";e.currentTarget.style.borderColor="rgba(0,0,0,0.07)";}}
          >⛶</button>
        )}
      </div>
    </div>
  );

  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))",fontFamily:"'Source Sans 3',sans-serif",overflow:"hidden"}}>
      <Header onDisplayClick={()=>setDisplayMode(true)}/>
      {/* Class setups (Phase 5): a slim tab row, only once the class has more than one setup */}
      {manySetups&&(
        <div style={{padding:"6px 14px",borderBottom:"1px solid rgba(0,0,0,0.06)",background:"#fff",flexShrink:0,overflowX:"auto",scrollbarWidth:"none"}}>
          <SetupTabs setups={setups} onSwitch={id=>onChangeSetups?.({...setups,activeId:id})}/>
        </div>
      )}

      <RotationNextLine rot={rotHere}/>

      {conflicts.length>0&&(
        <div style={{margin:"10px 14px 0",padding:"9px 10px",borderRadius:"9px",background:"#fdeeed",border:"1px solid rgba(220,60,60,0.18)",display:"flex",flexDirection:"column",gap:"4px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:"9px",fontWeight:700,color:"#c44",letterSpacing:"0.5px",textTransform:"uppercase"}}>Rule conflicts ({conflicts.length})</div>
            <button className="cpb cpb-ghost cpb-bad" onClick={()=>setConflicts([])} title="Dismiss" style={{background:"none",border:"none",color:"rgba(180,40,40,0.5)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:0}}>×</button>
          </div>
          {conflicts.map((c,i)=>(<div key={i} style={{fontSize:"10.5px",fontWeight:500,color:"#a33",lineHeight:1.4}}>· {c}</div>))}
          <div style={{fontSize:"9.5px",color:"rgba(180,40,40,0.6)",marginTop:"2px"}}>Best possible seating shown — adjust in Manage Seating if needed.</div>
        </div>
      )}

      {/* Name-click popup — opened the same way whether you click the student's
          name or one of their flag dots, so there's only one place their checklist
          gets managed from. Checklist only: tags stay out of this view on purpose, since
          this is the "student view" seating pane (can end up on a projector)
          and shouldn't surface LS/EAL/etc labels the way Manage Seating can. */}
      {nameClick&&(()=>{
        return(
          <div className="cp-pop"
            onMouseDown={e=>e.stopPropagation()}
            style={{position:"fixed",left:nameClick.x,top:nameClick.y+6,transform:"translateX(-50%)",zIndex:500,background:"#fff",borderRadius:"10px",boxShadow:"0 4px 20px rgba(0,0,0,0.18)",border:"1px solid rgba(0,0,0,0.08)",padding:"9px 11px",minWidth:"200px",maxWidth:"260px",fontFamily:"'Source Sans 3',sans-serif"}}
          >
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}>
              <span style={{fontSize:"12.5px",fontWeight:700,color:"#1a1a2e",flex:1}}>{nameClick.name}</span>
              <button className="cpb cpb-ghost" onClick={closeNameClick} style={{background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"0 2px"}}>×</button>
            </div>

            {/* Checklist — this student's outstanding items */}
            <StudentChecklistSection studentId={nameClick.studentId} checklist={checklist} now={now} onChange={onChangeChecklist} onOpen={()=>{onGoToChecklist?.({studentId:nameClick.studentId});closeNameClick();}}/>
          </div>
        );
      })()}

      {!hasLayout?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic"}}>
          <div style={{fontSize:"36px",opacity:0.15}}>🪑</div>No seating arrangement set up yet
        </div>
      ):(
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          <div ref={scrollRef} style={{position:"absolute",inset:0,overflow:"auto",display:"flex",justifyContent:"safe center",alignItems:"safe center",...floorStyle()}}>
            <div style={{zoom}}><RoomCanvas scale={1}/></div>
          </div>

          {/* Zoom control — pinch-to-zoom on the trackpad works anywhere on the
              canvas; these buttons are here for anyone who'd rather click. */}
          <div style={{position:"absolute",bottom:"14px",right:"14px",zIndex:60,display:"flex",alignItems:"center",gap:"2px",background:"#fff",borderRadius:"10px",padding:"4px",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)"}}>
            <button className="cpb cpb-ghost" onClick={()=>setZoom(z=>Math.max(ZOOM_MIN,+(z-0.15).toFixed(2)))} title="Zoom out" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
            <button className="cpb cpb-ghost" onClick={()=>setZoom(1)} title="Reset zoom" style={{minWidth:"38px",padding:"0 4px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{Math.round(zoom*100)}%</button>
            <button className="cpb cpb-ghost" onClick={()=>setZoom(z=>Math.min(ZOOM_MAX,+(z+0.15).toFixed(2)))} title="Zoom in" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
          </div>
        </div>
      )}

      {/* Display mode — full-screen projection view */}
      {displayMode&&(
        <div className="no-drag" style={{position:"fixed",inset:0,zIndex:400,background:"var(--board-flat)",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Source Sans 3',sans-serif"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",background:"#fff",borderBottom:"1px solid rgba(0,0,0,0.06)",flexShrink:0}}>
            <button className="cpb" onClick={()=>setDisplayMode(false)} style={{fontSize:"13px",fontWeight:600,padding:"7px 14px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.4)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>← Exit</button>
            <div style={{fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>{activeClass.name}{manySetups&&setup?<span style={{fontWeight:600,color:"rgba(0,0,0,0.45)"}}> · {setup.icon} {setup.name}</span>:null}</div>
            <div style={{minWidth:"100px",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"8px"}}>
              {conflicts.length>0&&<span title={conflicts.join("\n")} style={{fontSize:"11px",fontWeight:700,color:"#c44",background:"#fdeeed",padding:"4px 8px",borderRadius:"7px"}}>⚠ {conflicts.length} rule conflict{conflicts.length!==1?'s':''}</span>}
              {canUndoRandom&&<button className="cpb" onClick={undoRandomise} title="Put everyone back where they were before the last Randomise" style={{fontSize:"12px",fontWeight:600,padding:"7px 11px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"none",color:"rgba(0,0,0,0.45)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>↺ Undo</button>}
              <button className="cpb cpb-primary" onClick={randomise} title="Shuffle everyone into new seats, using the seat tags, keep-apart/together rules and Randomize options from Manage Seating" style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12.5px",fontWeight:700,padding:"7px 13px",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>🎲 Randomise</button>
            </div>
          </div>
          <RotationNextLine rot={rotHere}/>
          <div style={{flex:1,position:"relative",overflow:"hidden"}}>
            <div ref={displayScrollRef} style={{position:"absolute",inset:0,overflow:"auto",display:"flex",justifyContent:"safe center",alignItems:"safe center",...floorStyle()}}
            >
              <div style={{zoom:displayZoom}}><RoomCanvas scale={1} interactive={false}/></div>
            </div>

            <div style={{position:"absolute",bottom:"14px",right:"14px",zIndex:60,display:"flex",alignItems:"center",gap:"2px",background:"#fff",borderRadius:"10px",padding:"4px",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)"}}>
              <button className="cpb cpb-ghost" onClick={()=>setDisplayZoom(z=>Math.max(ZOOM_MIN,+(z-0.15).toFixed(2)))} title="Zoom out" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
              <button className="cpb cpb-ghost" onClick={()=>setDisplayZoom(1)} title="Reset zoom" style={{minWidth:"38px",padding:"0 4px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{Math.round(displayZoom*100)}%</button>
              <button className="cpb cpb-ghost" onClick={()=>setDisplayZoom(z=>Math.min(ZOOM_MAX,+(z+0.15).toFixed(2)))} title="Zoom in" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Group generator algorithm ── */
function fisherYates(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function calcSizes(n,numGroups){
  const base=Math.floor(n/numGroups),extra=n%numGroups;
  return Array.from({length:numGroups},(_,i)=>i<extra?base+1:base).filter(s=>s>0);
}

function scoreGrouping(groups,pairingHistory){
  let score=0;
  groups.forEach(g=>{
    for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++){
      const key=[g[i].id,g[j].id].sort().join('-');
      score+=pairingHistory[key]||0;
    }
  });
  return score;
}

function runGroupGenerator(students,targetSize,numGroupsFixed,rules,fairness,pairingHistory){
  const n=students.length;if(!n)return{groups:[],conflicts:[]};
  const numGroups=numGroupsFixed||Math.max(1,Math.ceil(n/Math.max(1,targetSize)));
  const sizes=calcSizes(n,Math.min(numGroups,n));
  const checkConflicts=groups=>checkGroupConflicts(groups,rules,students);

  const assign=pool=>{
    const groups=sizes.map(()=>[]);let idx=0;
    sizes.forEach((sz,gi)=>{for(let k=0;k<sz&&idx<pool.length;k++,idx++)groups[gi].push(pool[idx]);});
    return groups;
  };

  const MAX=fairness?40:120;
  let best=null,bestConflicts=null,bestScore=Infinity;

  for(let attempt=0;attempt<MAX;attempt++){
    const pool=fisherYates(students);
    const groups=assign(pool);
    const conflicts=checkConflicts(groups);
    const score=scoreGrouping(groups,pairingHistory);

    if(conflicts.length===0){
      if(!fairness)return{groups,conflicts:[]};
      if(score<bestScore){bestScore=score;best=groups;bestConflicts=[];}
    } else if(best===null||(conflicts.length<(bestConflicts?.length||Infinity))){
      best=groups;bestConflicts=conflicts;bestScore=score;
    }
  }
  return{groups:best||[],conflicts:bestConflicts||[]};
}

/* Re-deal everyone into the groups that are already on screen — same number of
   groups (empty ones included, so names line up), nobody pulled out of
   "Ungrouped". Used by Randomise in Manage Groups and on the Groups tab, as
   opposed to "Create new groups", which builds a different set from the
   size/count settings. */
const redealGroups=({students,groupCount,ungroupedIds,rules,fairness,pairingHistory})=>{
  const keepOut=new Set(ungroupedIds||[]);
  const pool=students.filter(s=>!keepOut.has(s.id));
  const poolIds=new Set(pool.map(s=>s.id));
  /* a keep-together rule can't be judged if one of its students is sitting out */
  const applicable=(rules||[]).filter(r=>r.type!=='together'||ruleStudentIds(r).every(id=>poolIds.has(id)));
  const count=Math.max(1,Math.min(groupCount||1,pool.length||1));
  const res=runGroupGenerator(pool,null,count,applicable,fairness,pairingHistory||{});
  const groups=[...res.groups];
  while(groups.length<(groupCount||0))groups.push([]);
  return{groups,ungrouped:students.filter(s=>keepOut.has(s.id)),conflicts:res.conflicts};
};

/* Place only the students who aren't in a group yet, leaving everyone already
   placed exactly where they are. Each waiting student goes to one of the
   currently smallest groups (so empty/short groups fill first), and the
   best of many random attempts wins — fewest rule conflicts, then (with Smart
   shuffle) the fewest repeated pairings. */
const fillRemainingGroups=({groups,waiting,rules,fairness,pairingHistory,students})=>{
  const placedIds=new Set(groups.flat().map(s=>s.id));
  const poolIds=new Set([...placedIds,...waiting.map(s=>s.id)]);
  const applicable=(rules||[]).filter(r=>r.type!=='together'||ruleStudentIds(r).every(id=>poolIds.has(id)));
  if(!groups.length||!waiting.length)return{groups,conflicts:checkGroupConflicts(groups,applicable,students)};
  const MAX=fairness?40:120;
  let best=null,bestConflicts=null,bestScore=Infinity;
  for(let a=0;a<MAX;a++){
    const gs=groups.map(g=>[...g]);
    fisherYates(waiting).forEach(st=>{
      const min=Math.min(...gs.map(g=>g.length));
      const cands=gs.map((_,i)=>i).filter(i=>gs[i].length===min);
      gs[cands[Math.floor(Math.random()*cands.length)]].push(st);
    });
    const conflicts=checkGroupConflicts(gs,applicable,students);
    const score=scoreGrouping(gs,pairingHistory||{});
    if(!best||conflicts.length<bestConflicts.length||(conflicts.length===bestConflicts.length&&fairness&&score<bestScore)){best=gs;bestConflicts=conflicts;bestScore=score;}
    if(conflicts.length===0&&!fairness)break;
  }
  return{groups:best,conflicts:bestConflicts};
};

/* ── GroupCard ── */
/* ── 🪑 Seat these groups ▸ (Phase 6) ──
   A self-contained block: the button and its menu, the New-setup dialog, the "replace this
   setup's seating?" question, and the summary card. Used by Manage Groups and the Groups tab.
   `groups` is [{name, ids, colorIndex}] and `ungroupedIds` everyone not in a group (see
   seatGroupsIntoSetup / placeGroupsInSetup). Regular is never offered: it is the seating
   the class goes back to. */
function SeatGroupsDialog({groups,current,setups,rooms,onCreate,onClose}){
  const pairs=groups.length>0&&groups.every(g=>g.ids.length===2);
  const[name,setName]=useState(pairs?'Lab partners':`Groups ${fmtSetupDate(Date.now())}`);
  const[icon,setIcon]=useState('👥');
  const roomChoices=(rooms||[]).flatMap(r=>(r.layouts||[]).map(l=>({value:`room|${r.id}|${l.id}`,label:`${r.name} · ${l.name}`})));
  const others=(setups?.list||[]).filter(x=>x.id!==current?.id);
  const[room,setRoom]=useState('current');
  const[roomPick,setRoomPick]=useState(roomChoices[0]?.value||'');
  const[otherPick,setOtherPick]=useState(others[0]?.id||'');
  const[use,setUse]=useState(null); // null = follows the name ("lab" → Workstations)
  const useNow=use||useKey(useForName(name));
  const[busy,setBusy]=useState(false);
  const opt=(k,label,help,disabled=false)=>(
    <button className={cpc("item",room===k)} disabled={disabled} onClick={()=>setRoom(k)} title={help}
      style={{width:"100%",textAlign:"left",padding:"7px 9px",borderRadius:"8px",fontSize:"12.5px",fontWeight:room===k?700:600,display:"flex",alignItems:"center",gap:"8px"}}>
      <span style={{width:"14px",height:"14px",borderRadius:"50%",border:"1.5px solid #2b2118",background:room===k?"#2b2118":"transparent",boxShadow:"inset 0 0 0 2.5px var(--cpb-bg)",flexShrink:0}}/>{label}
    </button>
  );
  const create=async()=>{
    if(busy||!name.trim())return;setBusy(true);
    const from=room==='room'&&roomPick?{kind:'room',roomId:roomPick.split('|')[1],layoutId:roomPick.split('|')[2]}
      :room==='setup'&&otherPick?{kind:'setup',setupId:otherPick}:{kind:'current'};
    await onCreate({name:name.trim(),icon,use:SETUP_USES[useNow],from});
  };
  const head={fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.35)",margin:"12px 2px 5px"};
  const selectS={margin:"2px 0 4px 30px",padding:"5px 8px",borderRadius:"7px",fontSize:"12.5px",fontFamily:"'Source Sans 3',sans-serif"};
  return createPortal(
    <div onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(20,14,8,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Sans 3',sans-serif"}}>
      <div className="cp-pop" role="dialog" aria-label="Seat these groups in a new setup" style={{width:"380px",maxWidth:"calc(100vw - 32px)",maxHeight:"calc(100vh - 40px)",overflowY:"auto",borderRadius:"14px",padding:"16px 18px"}}>
        <div style={{fontSize:"16px",fontWeight:800,color:"#2b2118"}}>🪑 Seat these groups in a new setup</div>
        <div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.5)",marginTop:"2px",lineHeight:1.4}}>{groups.length} group{groups.length!==1?"s":""} go onto tables, each table coloured like its group. Your Regular seating is not changed: switch back to it any time.</div>
        <div style={head}>Name and icon</div>
        <input autoFocus value={name} maxLength={28} placeholder="e.g. Lab partners" title="The name on the setup's tab"
          onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')create();if(e.key==='Escape')onClose();e.stopPropagation();}}
          style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:"8px",fontSize:"13.5px",fontWeight:600,fontFamily:"'Source Sans 3',sans-serif",outline:"none"}}/>
        <div style={{display:"flex",gap:"4px",marginTop:"7px"}}>
          {SETUP_ICONS.map(ic=><button key={ic} className={cpc("",icon===ic)} onClick={()=>setIcon(ic)} title={`Use ${ic} as the icon`} style={{width:"34px",height:"32px",borderRadius:"8px",fontSize:"16px",padding:0,lineHeight:1}}>{ic}</button>)}
        </div>
        <div style={head}>Room</div>
        <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
          {opt('current',`The current room and furniture (${current?.icon||''} ${current?.name||'this setup'}), no students`,'Same room and tables as the setup you are on now')}
          {opt('room','A room layout from 🏫 Rooms',roomChoices.length?'Use a room and one of its saved layouts':'Save a room in 🏫 Rooms first',!roomChoices.length)}
          {room==='room'&&roomChoices.length>0&&(
            <select value={roomPick} onChange={e=>setRoomPick(e.target.value)} title="Which room and layout" style={selectS}>
              {roomChoices.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          )}
          {opt('setup','Another setup\'s furniture',others.length?'Use the room and furniture of one of your other setups':'You have no other setup yet',!others.length)}
          {room==='setup'&&others.length>0&&(
            <select value={otherPick} onChange={e=>setOtherPick(e.target.value)} title="Which setup's furniture" style={selectS}>
              {others.map(x=><option key={x.id} value={x.id}>{x.icon} {x.name}</option>)}
            </select>
          )}
        </div>
        <div style={head}>Use</div>
        <SetupUsePicker value={useNow} onChange={setUse}/>
        <div style={{fontSize:"11px",color:"rgba(0,0,0,0.45)",marginTop:"5px",lineHeight:1.35}}>Groups are seated at {({desk:'tables (lab benches stay free)',workstation:'workstations such as lab benches',both:'tables and workstations'})[useNow]}.</div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:"6px",marginTop:"16px"}}>
          <button className={cpc()} onClick={onClose} title="Don't seat the groups" style={{padding:"8px 14px",borderRadius:"9px",fontSize:"12.5px",fontWeight:600}}>Cancel</button>
          <button className={cpc("primary")} onClick={create} disabled={busy||!name.trim()} title="Make the setup, seat the groups in it and switch to it" style={{padding:"8px 16px",borderRadius:"9px",fontSize:"12.5px",fontWeight:700}}>Seat the groups</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
function SeatGroupsButton({classId,students,groups,ungroupedIds,onGoToSetup,compact=false,inline=false}){
  const menu=useAnchoredMenu();
  const[setups,setSetups]=useState(null);
  const[rooms,setRooms]=useState([]);
  const[asking,setAsking]=useState(null); // a setup waiting for "Replace the seating?" yes/no
  const[dialog,setDialog]=useState(false);
  const[busy,setBusy]=useState(false);
  const[summary,setSummary]=useState(null);
  const seatable=groups.filter(g=>g.ids.length>0);
  const nameOf=id=>students.find(s=>s.id===id)?.name||'someone';
  const open=()=>{
    if(!menu.pos){setAsking(null);loadSetups(classId).then(setSetups);loadRooms().then(setRooms);}
    menu.toggle();
  };
  const current=setups?setups.list.find(x=>x.id===setups.activeId):null;
  const noun=s=>useKey(s?.use)==='workstation'?'bench':'table';
  const plural=s=>noun(s)==='bench'?'benches':'tables';
  const summarise=({setup,res,created})=>{
    const n=noun(setup),lines=[];
    const splits=res.placed.filter(p=>p.split);
    splits.forEach(p=>lines.push(`${p.name} was split across ${p.tables.length} ${plural(setup)}`));
    const shared=res.placed.filter(p=>p.shared).length;
    if(shared)lines.push(`${shared} group${shared!==1?'s':''} share a ${n} with another group (not enough free ${plural(setup)})`);
    if(res.unplaced.length)lines.push(`${res.unplaced.length} student${res.unplaced.length!==1?'s':''} not placed (no free seat): ${res.unplaced.map(nameOf).join(', ')}`);
    if(res.conflicts.length)lines.push(`Keep-apart rule not possible for ${res.conflicts.map(c=>`${nameOf(c.aId)} and ${nameOf(c.bId)}`).join('; ')}`);
    if(res.lockedKept)lines.push(`${res.lockedKept} locked seat${res.lockedKept!==1?'s':''} left alone`);
    setSummary({setupName:setup.name,icon:setup.icon,count:res.placed.length,lines,replaced:!created});
  };
  const run=async target=>{
    if(busy)return;setBusy(true);
    try{
      const out=await seatGroupsIntoSetup(classId,{target,groups:seatable,ungroupedIds});
      setDialog(false);menu.close();setAsking(null);summarise(out);
    }catch(e){
      setDialog(false);menu.close();setAsking(null);
      setSummary({setupName:'',icon:'',count:0,lines:[`Could not seat the groups: ${e.message}`],failed:true});
    }
    setBusy(false);
  };
  const itemS={width:"100%",textAlign:"left",padding:"7px 9px",borderRadius:"8px",fontSize:"12.5px",fontWeight:600,display:"flex",alignItems:"center",gap:"7px"};
  const head={fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.35)",margin:"8px 4px 4px"};
  const others=setups?setups.list.filter(x=>x.id!==REGULAR_SETUP):[];
  const card=summary&&(
    <div role="status" aria-label="Seat groups summary" className="cp-pop" style={inline?{flexBasis:"100%",borderRadius:"12px",padding:"11px 14px",fontFamily:"'Source Sans 3',sans-serif"}:{position:"fixed",left:"50%",bottom:"22px",transform:"translateX(-50%)",zIndex:650,width:"420px",maxWidth:"calc(100vw - 32px)",borderRadius:"14px",padding:"13px 16px",fontFamily:"'Source Sans 3',sans-serif"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
        <div style={{flex:1,minWidth:0}}>
          {summary.failed?<div style={{fontSize:"13px",fontWeight:700,color:"var(--cpb-bad)"}}>{summary.lines[0]}</div>:(<>
            <div style={{fontSize:"13.5px",fontWeight:800,color:"#2b2118",lineHeight:1.35}}>{summary.count} group{summary.count!==1?'s':''} seated in <i>{summary.icon} {summary.setupName}</i>.</div>
            {summary.lines.map((l,i)=><div key={i} style={{fontSize:"12px",color:"rgba(0,0,0,0.62)",marginTop:"3px",lineHeight:1.4}}>{l}.</div>)}
            <div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.45)",marginTop:"4px"}}>Regular is not changed.</div>
          </>)}
        </div>
        <button className={cpc("ghost")} onClick={()=>setSummary(null)} title="Close this message" aria-label="Close" style={{fontSize:"17px",lineHeight:1,padding:"0 4px",borderRadius:"6px"}}>×</button>
      </div>
      {!summary.failed&&onGoToSetup&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:"9px"}}>
        <button className={cpc("primary")} onClick={()=>{setSummary(null);onGoToSetup();}} title={`Open the ${summary.setupName} seating`} style={{padding:"6px 14px",borderRadius:"9px",fontSize:"12.5px",fontWeight:700}}>Go to setup</button>
      </div>}
    </div>
  );
  return(<>
    <div ref={menu.anchorRef} data-seat-groups style={{display:"inline-block",position:"relative"}}>
      <button className={cpc("",!!menu.pos)} onClick={open} disabled={!seatable.length}
        title={seatable.length?"Put these groups at tables in a seating setup, each table coloured like its group. Your Regular seating is not changed.":"Make some groups first"}
        style={{display:"flex",alignItems:"center",gap:"5px",fontSize:compact?"12px":"12.5px",fontWeight:700,padding:compact?"7px 11px":"7px 13px",borderRadius:"9px",whiteSpace:"nowrap"}}>🪑 Seat these groups ▸</button>
      {menu.pos&&createPortal(
        <div className="cp-pop" ref={menu.menuRef} role="menu" aria-label="Seat these groups" style={{position:"fixed",left:Math.min(menu.pos.left,window.innerWidth-276),...(menu.pos.top!=null?{top:menu.pos.top}:{bottom:menu.pos.bottom}),maxHeight:menu.pos.maxHeight,overflowY:"auto",zIndex:500,width:"264px",borderRadius:"12px",padding:"8px",fontFamily:"'Source Sans 3',sans-serif"}}>
          {asking?(
            <div style={{padding:"4px"}}>
              <div style={{fontSize:"12.5px",fontWeight:700,color:"#2b2118",lineHeight:1.4}}>Replace the seating in {asking.name} with these {seatable.length} group{seatable.length!==1?'s':''}?</div>
              <div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.55)",lineHeight:1.4,margin:"4px 0 8px"}}>Regular is not changed.</div>
              <div style={{display:"flex",gap:"5px"}}>
                <button className={cpc("primary")} disabled={busy} onClick={()=>run({setupId:asking.id})} title={`Yes, replace the seating in ${asking.name}`} style={{flex:1,padding:"6px 0",borderRadius:"8px",fontSize:"12px",fontWeight:700}}>Replace</button>
                <button className={cpc()} onClick={()=>setAsking(null)} title="Go back" style={{flex:1,padding:"6px 0",borderRadius:"8px",fontSize:"12px",fontWeight:600}}>Cancel</button>
              </div>
            </div>
          ):(<>
            <div style={{...head,marginTop:"2px"}}>Seat the groups in…</div>
            <button className={cpc("item")} role="menuitem" onClick={()=>{menu.close();setDialog(true);}} title="Make a new setup tab for these groups (Regular stays as it is)" style={itemS}>＋ New setup…</button>
            {others.length>0&&<div style={head}>An existing setup (replaces its seating)</div>}
            {others.map(x=>(
              <button key={x.id} className={cpc("item")} role="menuitem" onClick={()=>setAsking(x)} title={`Replace the seating in ${x.name} with these groups (it asks first)`} style={itemS}>
                <span aria-hidden="true">{x.icon}</span><span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.name}</span>{x.fromGroups&&<span style={{fontSize:"10px",color:"rgba(0,0,0,0.4)"}}>from Groups</span>}
              </button>
            ))}
            <div style={{height:"1px",background:"rgba(0,0,0,0.08)",margin:"7px 0 4px"}}/>
            <div data-seat-regular title="Regular can't be a target: it is the seating your class goes back to, so it is never replaced. Make a new setup instead." style={{...itemS,cursor:"not-allowed",opacity:0.5,fontWeight:600}}>
              <span aria-hidden="true">🪑</span><span style={{flex:1}}>Regular</span><span style={{fontSize:"10px"}}>never changed</span>
            </div>
          </>)}
        </div>,
        document.body
      )}
      {dialog&&<SeatGroupsDialog groups={seatable} current={current} setups={setups} rooms={rooms} onCreate={t=>run(t)} onClose={()=>setDialog(false)}/>}
    </div>
    {summary&&(inline?card:createPortal(card,document.body))}
  </>);
}

function GroupCard({group,index,vertical,onStudentMouseDown,draggingId,isDragOver,dragOverInsert,name,onRename,onRemove,flagsByStudent}){
  const col=COLORS[index%COLORS.length];
  const insertAt=dragOverInsert&&dragOverInsert.bucket===index?dragOverInsert.index:null;
  return(
    <div data-group-card data-group-idx={index} style={{borderRadius:"16px",background:col.bg,border:isDragOver?`2px solid ${col.text}`:`1px solid ${col.text}28`,padding:"14px 16px",...(vertical?{width:"100%"}:{minWidth:`${Math.max(160,(name||"").length*14+36)}px`,flex:"0 0 auto"}),display:"flex",flexDirection:"column",gap:"6px",animation:"fadeIn 0.3s ease both",transition:"border-color 0.1s"}}>
      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
      <input value={name||""} onChange={e=>onRename(index,e.target.value)} onFocus={e=>e.target.select()} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")e.target.blur();}} maxLength={24} placeholder={`Group ${index+1}`} title="Click and type to name this group" spellCheck={false}
        style={{flex:1,minWidth:0,boxSizing:"border-box",fontSize:"13px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:col.text,background:"transparent",border:"none",borderBottom:`1px dashed ${col.text}55`,borderRadius:0,padding:"0 0 2px",marginBottom:"2px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",cursor:"text"}}
        onMouseEnter={e=>e.currentTarget.style.borderBottomColor=col.text} onMouseLeave={e=>{if(document.activeElement!==e.currentTarget)e.currentTarget.style.borderBottomColor=`${col.text}55`;}} onBlur={e=>e.currentTarget.style.borderBottomColor=`${col.text}55`}
      />
      {onRemove&&<button className="cpb cpb-ghost" onClick={()=>onRemove(index)} title={group.length?"Delete this group — its students go back to Ungrouped":"Delete this empty group"} style={{background:"none",border:"none",color:col.text,opacity:0.5,cursor:"pointer",fontSize:"15px",lineHeight:1,padding:"0 2px"}} onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.color="#c44";}} onMouseLeave={e=>{e.currentTarget.style.opacity="0.5";e.currentTarget.style.color=col.text;}}>×</button>}
      </div>
      {group.map((s,ri)=>{
        const insertBefore=insertAt===ri;
        const insertAfter=insertAt===ri+1&&ri===group.length-1;
        return(
          <div key={s.id} data-student-row data-student-id={s.id} data-row-index={ri} onMouseDown={e=>onStudentMouseDown(s.id,index,e)}
            style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:600,color:"#1a1a2e",padding:"4px 9px",borderRadius:"8px",background:"rgba(255,255,255,0.75)",lineHeight:1.3,cursor:"grab",userSelect:"none",opacity:draggingId===s.id?0.35:1,
              boxShadow:insertBefore?`0 -2.5px 0 0 ${col.text}`:insertAfter?`0 2.5px 0 0 ${col.text}`:"none"}}
          ><span style={{flex:1,minWidth:0}}>{s.name}</span><FlagDots flags={flagsByStudent?.get(s.id)} size={8}/></div>
        );
      })}
      {group.length===0&&<div style={{fontSize:"11px",color:col.text,opacity:0.55,fontStyle:"italic",padding:"4px 2px",borderRadius:"6px",outline:insertAt===0?`2px solid ${col.text}`:"none"}}>Drop a student here</div>}
    </div>
  );
}

/* ── Manage Groups Panel — teacher editor: settings, rules, drag-to-edit ── */
function ManageGroupsPanel({activeClass,guardRef,flagsByStudent,showFlags,onSetShowFlags,onGoToSeating}){
  const[mode,setMode]=useState('size');
  const[sizeVal,setSizeVal]=useState('3');
  const[countVal,setCountVal]=useState('4');
  const[fairness,setFairness]=useState(false);
  const[result,setResult]=useState(null);
  const[prevResult,setPrevResult]=useState(null); // what the groups looked like before the last Randomise, for Undo
  const[closePrompt,setClosePrompt]=useState(null); // {proceed} — asking whether to finalise before leaving
  const[prevNames,setPrevNames]=useState(null); // names as they were before "Reset group names", for Undo
  const[groupNames,setGroupNames]=useState([]); // custom group names by position; '' / missing = "Group N"
  const[pairingHistory,setPairingHistory]=useState({});
  const[phMode,setPhMode]=useState('combined'); // 'combined' | 'separate' — set in Manage Class
  const[seatingRules,setSeatingRules]=useState([]);   // read-only, from Manage Seating's Classroom rules — only used to feed the Import button
  const[groupRules,setGroupRules]=useState([]);       // the actual rules grouping uses — a single editable list, optionally imported from Manage Seating
  const[finalised,setFinalised]=useState(false);
  const[historyClearing,setHistoryClearing]=useState(false);
  const loadedForRef=useRef(null); // which class the panel state currently belongs to
  const[loaded,setLoaded]=useState(false); // guards the save-effect until the initial load has landed
  const[savedGroupings,setSavedGroupings]=useState([]); // named, archived arrangements — e.g. "Persuasive Essay Groups"
  const[showSaveGrouping,setShowSaveGrouping]=useState(false);
  const[groupingName,setGroupingName]=useState('');
  const containerRef=useRef(null);
  const currentGroupsRef=useRef(null); // top of the Current groups section
  const panelWidth=useElementWidth(containerRef);
  /* Zoom for the group cards. Unlike the seating map this is a flowing layout,
     so CSS zoom makes the cards bigger/smaller AND lets them re-wrap into more
     or fewer columns — the width available to them is the panel width / zoom. */
  const GZOOM_MIN=0.6,GZOOM_MAX=2;
  const[gzoom,setGzoom]=useState(()=>{try{const z=parseFloat(localStorage.getItem('groups-zoom'));return z>=GZOOM_MIN&&z<=GZOOM_MAX?z:1;}catch(e){return 1;}});
  const setGzoomClamped=fn=>setGzoom(z=>{const nz=Math.min(GZOOM_MAX,Math.max(GZOOM_MIN,+(typeof fn==='function'?fn(z):fn).toFixed(2)));try{localStorage.setItem('groups-zoom',String(nz));}catch(e){}return nz;});
  const bodyRef=useRef(null);
  // Below this, showing groups side-by-side stops being readable — list them
  // one per row instead. Measured in zoomed layout px.
  const vertical=panelWidth>0&&panelWidth/gzoom<420;

  const students=activeClass?.students||[];
  const rules=groupRules;
  /* Trackpad pinch-to-zoom (Chromium reports a pinch as a ctrlKey wheel event);
     a plain two-finger swipe still scrolls. Non-passive so preventDefault can
     stop the browser's own page zoom. Re-attached when the body first appears. */
  const hasBody=!!activeClass&&students.length>0;
  useEffect(()=>{
    const el=bodyRef.current;
    if(!el)return;
    const onWheel=e=>{if(!e.ctrlKey)return;e.preventDefault();setGzoomClamped(z=>z*(1-e.deltaY*0.01));};
    el.addEventListener('wheel',onWheel,{passive:false});
    return()=>el.removeEventListener('wheel',onWheel);
  },[hasBody]);
  /* What "Import from Manage Seating" would actually add — used both to show
     a count on the button and to disable it once there's nothing new. */
  const ruleSig=r=>`${r.type}:${ruleStudentIds(r).slice().sort().join(',')}`;
  const importableRules=useMemo(()=>{
    const have=new Set(groupRules.map(ruleSig));
    return seatingRules.filter(r=>!have.has(ruleSig(r)));
  },[groupRules,seatingRules]);

  /* Load everything for this class: pairing history, the seating rules (for
     reference/reuse), and this panel's own saved state — mode, custom rules,
     and the last-generated groups, so closing and reopening the tab doesn't
     mean starting over. */
  useEffect(()=>{
    if(!activeClass?.id)return;
    setResult(null);setPrevResult(null);setPrevNames(null);setGroupNames([]);setFinalised(false);setHistoryClearing(false);setLoaded(false);
    const classAtLoad=activeClass;
    load(`ph-mode-${classAtLoad.id}`,'combined').then(m=>{
      const mode=m==='separate'?'separate':'combined';
      setPhMode(mode);
      return Promise.all([
        load(phKey(classAtLoad.id,mode,'groups'),{}),
        load(`sl-${classAtLoad.id}`,null),
        load(`gp-${classAtLoad.id}`,null),
        load(`gg-${classAtLoad.id}`,[]),
      ]);
    }).then(([ph,layout,gp,gg])=>{
      setPairingHistory(ph||{});
      setSavedGroupings(gg||[]);
      const seatRules=(layout?.rules||[]).filter(r=>r.type==='apart'||r.type==='together');
      setSeatingRules(seatRules);
      if(gp){
        setMode(gp.mode==='count'?'count':'size');
        setSizeVal(gp.sizeVal||'3');
        setCountVal(gp.countVal||'4');
        setFairness(!!gp.fairness);
        /* Migrate old data: the seating/custom toggle is gone in favour of one
           editable list. Whatever was actually in effect before (either the
           saved custom rules, or a live read of Manage Seating's rules under
           the old "seating" default) becomes that list's starting point, so
           nobody's effective rules silently vanish when this loads. */
        const migratedRules=gp.groupRules?gp.groupRules:gp.ruleSource==='custom'?(gp.customRules||[]):seatRules;
        setGroupRules(migratedRules);
        setFinalised(!!gp.finalised);
        setGroupNames(gp.groupNames||[]);
        if(gp.resultGroupIds?.length){
          const rehydratedGroups=gp.resultGroupIds.map(ids=>ids.map(id=>classAtLoad.students.find(s=>s.id===id)).filter(Boolean));
          const rehydratedUngrouped=(gp.ungroupedIds||[]).map(id=>classAtLoad.students.find(s=>s.id===id)).filter(Boolean);
          setResult({groups:rehydratedGroups,ungrouped:rehydratedUngrouped,conflicts:checkGroupConflicts(rehydratedGroups,migratedRules,classAtLoad.students)});
        }
      } else {
        setMode('size');setSizeVal('3');setCountVal('4');setFairness(false);setGroupRules([]);setFinalised(false);
      }
      loadedForRef.current=classAtLoad.id;setLoaded(true);
    });
  },[activeClass?.id]);

  /* Persist this panel's state so it survives closing and reopening the tab. */
  useEffect(()=>{
    /* On a class switch this effect runs with the OLD class's state before the
       reload lands; loadedForRef stops it overwriting the new class's saved settings. */
    if(!activeClass?.id||!loaded||loadedForRef.current!==activeClass.id)return;
    save(`gp-${activeClass.id}`,{
      mode,sizeVal,countVal,fairness,groupRules,finalised,groupNames,
      resultGroupIds:result?result.groups.map(g=>g.map(s=>s.id)):null,
      ungroupedIds:result?(result.ungrouped||[]).map(s=>s.id):[],
    });
  },[activeClass?.id,loaded,mode,sizeVal,countVal,fairness,groupRules,finalised,groupNames,result]);

  /* Students who aren't in any group and haven't been sat out by hand */
  const waiting=useMemo(()=>{
    if(!result)return[];
    const placed=new Set(result.groups.flat().map(s=>s.id));
    const out=new Set((result.ungrouped||[]).map(s=>s.id));
    return students.filter(s=>!placed.has(s.id)&&!out.has(s.id));
  },[result,students]);
  /* Leaving this panel with groups that haven't been finalised: the app asks
     here first (see withGroupsGuard in TeacherApp). Nothing to ask when there's
     nothing worth finalising. */
  const needsFinalise=!!result&&!finalised&&result.groups.some(g=>g.length>0);
  useEffect(()=>{
    if(!guardRef)return;
    guardRef.current=proceed=>{if(!needsFinalise)return false;setClosePrompt({proceed});return true;};
    return()=>{guardRef.current=null;};
  },[guardRef,needsFinalise]);
  const renameGroup=(i,v)=>{setPrevNames(null);setGroupNames(p=>{const a=[...p];a[i]=v;return a;});};
  /* Randomise the groups already on screen: same groups and names, new line-up */
  const handleRedeal=()=>{
    if(!result||!n)return;
    const res=redealGroups({students,groupCount:result.groups.length,ungroupedIds:(result.ungrouped||[]).map(s=>s.id),rules,fairness,pairingHistory});
    setPrevResult({result,finalised});
    setResult({groups:res.groups,ungrouped:res.ungrouped,conflicts:res.conflicts});
    setFinalised(false);
  };
  /* Randomise remaining: deal in only the students still waiting in Ungrouped */
  const handleFillRest=()=>{
    if(!result||!waiting.length||!result.groups.length)return;
    const res=fillRemainingGroups({groups:result.groups,waiting,rules,fairness,pairingHistory,students});
    setPrevResult({result,finalised});
    setResult({groups:res.groups,ungrouped:result.ungrouped||[],conflicts:res.conflicts});
    setFinalised(false);
  };
  const undoRedeal=()=>{
    if(!prevResult)return;
    setResult(prevResult.result);setFinalised(prevResult.finalised);setPrevResult(null);
  };
  /* Add an empty group to the working result (fill it by dragging), or delete any group */
  const addGroup=()=>{
    if(!result)return;
    const idx=result.groups.length;
    setResult({...result,groups:[...result.groups,[]]});
    setGroupNames(p=>{const a=Array.from({length:idx},(_,j)=>p[j]||'');a[idx]='';return a;});
    setFinalised(false);
  };
  /* Delete a group, empty or not. Its students aren't added to "sitting out" —
     they simply stop being in any group, so they land in Ungrouped as waiting
     and the next Randomise remaining will deal them back in. */
  const removeGroup=i=>{
    setResult(prev=>prev?{...prev,groups:prev.groups.filter((_,j)=>j!==i)}:prev);
    setGroupNames(p=>p.filter((_,j)=>j!==i));
    setFinalised(false);
  };
  /* Conflict messages are worked out here so they use the group names as typed. */
  const conflicts=useMemo(()=>result?checkGroupConflicts(result.groups,rules,students,groupNames):[],[result,rules,students,groupNames]);

  /* Self-heal against a student removed from the roster while this panel is
     already open — same pattern as the seating/checklist panels. Empty groups are
     kept (not dropped) since a group can legitimately end up empty once you
     can drag every student out of it by hand. */
  useEffect(()=>{
    if(!activeClass)return;
    const ids=new Set((activeClass.students||[]).map(s=>s.id));
    setGroupRules(prev=>{
      const next=prev.filter(r=>ruleStudentIds(r).filter(id=>ids.has(id)).length>=2);
      return next.length!==prev.length?next:prev;
    });
    setResult(prev=>{
      if(!prev)return prev;
      const ng=prev.groups.map(g=>g.filter(s=>ids.has(s.id)));
      const nu=(prev.ungrouped||[]).filter(s=>ids.has(s.id));
      const changed=nu.length!==(prev.ungrouped||[]).length||ng.some((g,i)=>g.length!==prev.groups[i]?.length);
      return changed?{groups:ng,ungrouped:nu,conflicts:checkGroupConflicts(ng,rules,activeClass.students||[])}:prev;
    });
  },[activeClass?.students]);

  const n=students.length;
  const previewNumGroups=useMemo(()=>{
    if(!n)return 0;
    if(mode==='count')return Math.max(1,Math.min(n,parseInt(countVal)||4));
    const sz=Math.max(2,parseInt(sizeVal)||3);
    return Math.max(1,Math.ceil(n/sz));
  },[n,mode,sizeVal,countVal]);
  const previewSizes=useMemo(()=>n>0?calcSizes(n,Math.min(previewNumGroups,n)):[],[n,previewNumGroups]);
  const previewLabel=useMemo(()=>{
    if(!previewSizes.length)return'';
    const min=Math.min(...previewSizes),max=Math.max(...previewSizes);
    if(min===max)return`${previewNumGroups} groups of ${min}`;
    return`${previewNumGroups} groups (${min}–${max} students)`;
  },[previewSizes,previewNumGroups]);

  const historyPairCount=Object.keys(pairingHistory).length;

  const[inputError,setInputError]=useState('');

  const handleGenerate=()=>{
    if(!n)return;
    let targetSize=null,numGroupsFixed=null;
    if(mode==='size'){
      const sz=parseInt(sizeVal);
      if(!sz||sz<2){setInputError('Group size must be at least 2.');return;}
      targetSize=Math.min(n,sz);
    } else {
      const cnt=parseInt(countVal);
      if(!cnt||cnt<1){setInputError('0 groups isn\'t possible — enter at least 1.');return;}
      numGroupsFixed=Math.min(n,cnt);
    }
    setInputError('');
    const res=runGroupGenerator(students,targetSize,numGroupsFixed,rules,fairness,pairingHistory);
    setResult({...res,ungrouped:[]});setFinalised(false);setPrevResult(null);setPrevNames(null);
    // the new groups appear above this card — scroll them into view so the change is obvious
    setTimeout(()=>currentGroupsRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),60);
  };

  const handleFinalise=()=>{
    if(!result||!activeClass?.id||finalised)return;
    const newPH={...pairingHistory};
    result.groups.forEach(group=>{
      for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
        const key=[group[i].id,group[j].id].sort().join('-');
        newPH[key]=(newPH[key]||0)+1;
      }
    });
    setPairingHistory(newPH);
    save(phKey(activeClass.id,phMode,'groups'),newPH);
    setFinalised(true);
  };

  const handleClearHistory=()=>{
    if(!activeClass?.id)return;
    setPairingHistory({});
    save(phKey(activeClass.id,phMode,'groups'),{});
    setHistoryClearing(false);
  };

  /* ── Named, archived grouping arrangements — "who was in what group for
     the persuasive essay project", kept separate from the one working
     result above so old arrangements never get overwritten by a regenerate ── */
  const saveGrouping=name=>{
    if(!result||!activeClass?.id)return;
    const entry={id:sUid(),name:name.trim(),groupIds:result.groups.map(g=>g.map(s=>s.id)),names:result.groups.map((_,i)=>groupNames[i]||''),createdAt:Date.now()};
    const next=[...savedGroupings,entry];
    setSavedGroupings(next);
    save(`gg-${activeClass.id}`,next);
  };
  const loadGrouping=g=>{
    const pairs=g.groupIds.map((ids,i)=>({members:ids.map(id=>students.find(s=>s.id===id)).filter(Boolean),name:(g.names||[])[i]||''})).filter(p=>p.members.length>0);
    const rehydrated=pairs.map(p=>p.members);
    setGroupNames(pairs.map(p=>p.name));setPrevResult(null);
    setResult({groups:rehydrated,ungrouped:[],conflicts:checkGroupConflicts(rehydrated,rules,students)});
    setFinalised(false);
  };
  const deleteGrouping=id=>{
    if(!activeClass?.id)return;
    const next=savedGroupings.filter(g=>g.id!==id);
    setSavedGroupings(next);
    save(`gg-${activeClass.id}`,next);
  };

  /* ── Manual drag-and-drop editing of the current result ──
     Dropping a student between two others inserts them there and shifts
     everyone from that point down — no swapping. Dropping in the empty space
     below a group's last row (or into an empty group) appends them at the
     end. Where exactly "between" is gets read off which half of the hovered
     row the cursor is in. */
  const[groupDrag,setGroupDrag]=useState(null); // {studentId, name, fromIdx, x, y}
  const[dragOverIdx,setDragOverIdx]=useState(null); // group index or 'ungrouped' the cursor is currently over
  const[dragOverInsert,setDragOverInsert]=useState(null); // {bucket, index} — exact insertion point within that card

  const bucketOf=(res,idx)=>idx==='ungrouped'?(res.ungrouped||[]):(res.groups[idx]||[]);

  const moveStudent=(studentId,fromIdx,toIdx,insertIndex)=>{
    if(fromIdx===toIdx)return;
    setResult(prev=>{
      if(!prev)return prev;
      const groups=prev.groups.map(g=>[...g]);
      const ungrouped=[...(prev.ungrouped||[])];
      const bucket=idx=>idx==='ungrouped'?ungrouped:groups[idx];
      const fromBucket=bucket(fromIdx),toBucket=bucket(toIdx);
      if(!fromBucket||!toBucket)return prev;
      const fi=fromBucket.findIndex(s=>s.id===studentId);
      let student;
      if(fi===-1){
        // someone shown in Ungrouped just because they aren't in any group yet
        if(fromIdx!=='ungrouped')return prev;
        student=students.find(s=>s.id===studentId);
        if(!student)return prev;
      } else {
        student=fromBucket[fi];
        fromBucket.splice(fi,1);
      }
      const at=Math.max(0,Math.min(insertIndex??toBucket.length,toBucket.length));
      toBucket.splice(at,0,student);
      return{groups,ungrouped,conflicts:checkGroupConflicts(groups,rules,students)};
    });
    setFinalised(false);
  };

  const startGroupDrag=(studentId,name,fromIdx,e)=>{
    if(e.button!==0)return;
    e.preventDefault();e.stopPropagation();
    setGroupDrag({studentId,name,fromIdx,x:e.clientX,y:e.clientY});
    const readTarget=e2=>{
      const el=document.elementFromPoint(e2.clientX,e2.clientY);
      const card=el?.closest('[data-group-card]');
      if(!card)return null;
      const bucket=card.dataset.groupIdx==='ungrouped'?'ungrouped':parseInt(card.dataset.groupIdx,10);
      const row=el.closest('[data-student-row]');
      if(row){
        const ri=parseInt(row.dataset.rowIndex,10);
        const rect=row.getBoundingClientRect();
        const index=e2.clientY>rect.top+rect.height/2?ri+1:ri;
        return{bucket,index};
      }
      return{bucket,index:bucketOf(result,bucket).length};
    };
    const mm=e2=>{
      setGroupDrag(p=>p?{...p,x:e2.clientX,y:e2.clientY}:null);
      const target=readTarget(e2);
      setDragOverIdx(target?target.bucket:null);
      setDragOverInsert(target);
    };
    const mu=e2=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      const target=readTarget(e2);
      if(target)moveStudent(studentId,fromIdx,target.bucket,target.index);
      setGroupDrag(null);setDragOverIdx(null);setDragOverInsert(null);
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };

  /* Pull in whatever Manage Seating rules aren't already here — additive and
     repeatable, never overwrites or duplicates what's already in the list. */
  const importFromSeating=()=>{
    if(!importableRules.length)return;
    setGroupRules([...groupRules,...importableRules.map(r=>({...r,id:sUid()}))]);
  };

  const inp={padding:"6px 8px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",fontSize:"14px",fontWeight:600,color:"#1a1a2e",outline:"none",fontFamily:"'Source Sans 3',sans-serif",textAlign:"center"};
  const tog=(on,label,onClick,help)=>(
    <button className="cpb cpb-ghost" onClick={onClick} title={help} style={{display:"flex",alignItems:"center",gap:"8px",background:"none",border:"none",cursor:"pointer",padding:0}}>
      <CPSwitch on={on}/>
      <span style={{fontSize:"12px",fontWeight:600,color:on?"#1a1a2e":"rgba(0,0,0,0.4)"}}>{label}</span>
    </button>
  );

  if(!activeClass){
    return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100%",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",fontFamily:"'Source Sans 3',sans-serif",gap:"10px"}}><div style={{fontSize:"36px",opacity:0.2}}>👥</div>No class selected</div>);
  }
  if(!n){
    return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100%",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",fontFamily:"'Source Sans 3',sans-serif",gap:"10px"}}><div style={{fontSize:"36px",opacity:0.2}}>👥</div>Add students to {activeClass.name} first</div>);
  }

  return(
    <div ref={containerRef} style={{height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))",fontFamily:"'Source Sans 3',sans-serif",overflow:"hidden"}}>

      {/* Panel header */}
      <div style={{padding:"12px 18px 10px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fff",flexShrink:0}}>
        <div>
          <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)"}}>Groups</div>
          <div style={{fontSize:"15px",fontWeight:700,color:"#1a1a2e",marginTop:"1px"}}>{activeClass.name}</div>
        </div>
        <div style={{fontSize:"11px",color:"rgba(0,0,0,0.25)",fontWeight:500}}>{n} students</div>
      </div>

      {/* Scrollable body */}
      <div ref={bodyRef} style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>

        {/* Results */}
        {result&&(
          <div ref={currentGroupsRef} style={{display:"flex",flexDirection:"column",gap:"12px",margin:"16px 16px 0",scrollMarginTop:"8px"}}>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"10px"}}>
              <div>
                <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.45)"}}>Current groups</div>
                <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginTop:"3px",lineHeight:1.5}}>Your working groups — rename them, add a group, drag students between them, then finalise.</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                {prevNames?(
                  <button className="cpb cpb-sky" onClick={()=>{setGroupNames(prevNames);setPrevNames(null);}} title="Bring back the group names you just cleared" style={{fontSize:"11.5px",fontWeight:600,padding:"6px 10px",borderRadius:"8px",border:"1px solid rgba(46,107,206,0.3)",background:"#eaf1fc",color:"#2e6bce",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}>↺ Undo name reset</button>
                ):groupNames.some(Boolean)&&(
                  <button className="cpb" onClick={()=>{setPrevNames(groupNames);setGroupNames([]);}} title="Clear every custom group name, back to Group 1, Group 2… (you can undo it straight after)" style={{fontSize:"11.5px",fontWeight:600,padding:"6px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}>Reset group names</button>
                )}
                {prevResult&&<button className="cpb" onClick={undoRedeal} title="Put everyone back where they were before the last Randomise" style={{fontSize:"12px",fontWeight:600,padding:"7px 11px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>↺ Undo</button>}
                <button className="cpb cpb-primary" onClick={handleFillRest} disabled={!(waiting.length>0&&result.groups.length>0)} title={waiting.length?`Deal the ${waiting.length} student${waiting.length!==1?"s":""} still in Ungrouped into the groups you have now. Everyone already in a group stays exactly where they are. Fills the smallest groups first, using your rules and Smart shuffle.`:"Everyone is already in a group — nobody left to place."} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12.5px",fontWeight:700,padding:"8px 14px",borderRadius:"9px",border:"none",background:(waiting.length>0&&result.groups.length>0)?"#1a1a2e":"rgba(0,0,0,0.08)",color:(waiting.length>0&&result.groups.length>0)?"#fff":"rgba(0,0,0,0.3)",cursor:(waiting.length>0&&result.groups.length>0)?"pointer":"default",fontFamily:"'Source Sans 3',sans-serif"}}
                  onMouseEnter={e=>{if(waiting.length>0&&result.groups.length>0)e.currentTarget.style.background="#2a2a4e";}} onMouseLeave={e=>{if(waiting.length>0&&result.groups.length>0)e.currentTarget.style.background="#1a1a2e";}}
                >🎲 Randomise remaining{waiting.length?` · ${waiting.length}`:""}</button>
                <button className="cpb" onClick={handleRedeal} title="Shuffle everyone again into the groups you have now — students already placed move too. Same groups and names; anyone sitting out stays out. Use Undo to go back." style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12.5px",fontWeight:700,padding:"7px 13px",borderRadius:"9px",border:"2px solid #1a1a2e",background:"#fff",color:"#1a1a2e",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >🔄 Randomise all</button>
              </div>
            </div>
            {conflicts.length>0&&(
              <div style={{padding:"12px 16px",borderRadius:"12px",background:"#fdeeed",border:"1px solid rgba(220,60,60,0.18)",display:"flex",flexDirection:"column",gap:"5px"}}>
                <div style={{fontSize:"11px",fontWeight:700,color:"#c44",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"2px"}}>Rule conflicts ({conflicts.length})</div>
                {conflicts.map((c,i)=>(
                  <div key={i} style={{fontSize:"12px",fontWeight:500,color:"#a33",lineHeight:1.4}}>· {c}</div>
                ))}
                <div style={{fontSize:"11px",color:"rgba(180,40,40,0.6)",marginTop:"4px"}}>Best possible grouping shown — drag to fix in Manage Seating if needed.</div>
              </div>
            )}

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
              <div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.3)",fontWeight:500}}>Drag a student's name and drop them between two others to insert them there — everyone below shifts down. Drop into Ungrouped to leave them out.</div>
              {/* Zoom — pinch on the trackpad works anywhere in this panel. The cards re-flow into more or fewer columns as the size changes. */}
              <div style={{display:"flex",alignItems:"center",gap:"2px",flexShrink:0,background:"#fff",border:"1px solid rgba(0,0,0,0.08)",borderRadius:"8px",padding:"2px"}}>
                <button className="cpb cpb-ghost" onClick={()=>setGzoomClamped(z=>z-0.1)} title="Zoom out — smaller cards, more columns" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
                <button className="cpb cpb-ghost" onClick={()=>setGzoomClamped(1)} title="Reset zoom" style={{minWidth:"38px",padding:"0 4px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{Math.round(gzoom*100)}%</button>
                <button className="cpb cpb-ghost" onClick={()=>setGzoomClamped(z=>z+0.1)} title="Zoom in — bigger cards, fewer columns" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
              </div>
            </div>

            <div style={{zoom:gzoom,display:"flex",flexDirection:"column",gap:"12px"}}>
            <div style={vertical?{display:"flex",flexDirection:"column",gap:"10px"}:{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              {result.groups.map((group,i)=>(
                <GroupCard key={i} group={group} index={i} vertical={vertical} name={groupNames[i]} onRename={renameGroup} onRemove={removeGroup} flagsByStudent={showFlags?flagsByStudent:null}
                  onStudentMouseDown={(sid,idx,e)=>{const st=group.find(s=>s.id===sid);startGroupDrag(sid,st?.name||'',idx,e);}}
                  draggingId={groupDrag?.studentId} isDragOver={dragOverIdx===i} dragOverInsert={dragOverInsert}
                />
              ))}
              <button className="cpb cpb-dashed" onClick={addGroup} title="Add another group — it starts empty; drag students into it" style={{...(vertical?{width:"100%",minHeight:"54px"}:{minWidth:"110px",flex:"0 0 auto"}),borderRadius:"16px",border:"2px dashed rgba(0,0,0,0.16)",background:"rgba(255,255,255,0.4)",color:"rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2px",padding:"10px",fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#2e6bce";e.currentTarget.style.color="#2e6bce";e.currentTarget.style.background="#eaf1fc";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,0,0,0.16)";e.currentTarget.style.color="rgba(0,0,0,0.4)";e.currentTarget.style.background="rgba(255,255,255,0.4)";}}
              ><span style={{fontSize:"26px",lineHeight:1,fontWeight:300}}>+</span><span style={{fontSize:"10.5px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>Add group</span></button>
            </div>

            {/* Ungrouped — everyone who isn't in a group yet lands here, so a
                fresh set of empty groups starts with the whole class waiting.
                Anyone dragged here BY HAND from a group is "sitting out"
                (e.g. a long-term absence): Randomise leaves them where they
                are, whereas the not-yet-placed students get dealt in. */}
            {(()=>{
              const sittingOut=result.ungrouped||[];
              const placed=new Set(result.groups.flat().map(s=>s.id));
              const out=new Set(sittingOut.map(s=>s.id));
              const waiting=students.filter(s=>!placed.has(s.id)&&!out.has(s.id));
              const rows=[...sittingOut.map(s=>({s,out:true})),...waiting.map(s=>({s,out:false}))];
              const insertAt=dragOverInsert&&dragOverInsert.bucket==='ungrouped'?dragOverInsert.index:null;
              return(
                <div data-group-card data-group-idx="ungrouped" style={{borderRadius:"16px",background:"rgba(0,0,0,0.025)",border:dragOverIdx==='ungrouped'?"2px solid rgba(0,0,0,0.3)":"1px dashed rgba(0,0,0,0.15)",padding:"14px 16px",display:"flex",flexDirection:"column",gap:"8px",transition:"border-color 0.1s"}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:"8px",flexWrap:"wrap"}}>
                    <div style={{fontSize:"13px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.4)"}}>Ungrouped{rows.length?` · ${rows.length}`:""}</div>
                    <div style={{fontSize:"11px",color:"rgba(0,0,0,0.3)"}}>Students not in a group yet. Drag one here from a group to sit them out of Randomise.</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:vertical?"1fr":"repeat(auto-fill,minmax(150px,1fr))",gap:"6px"}}>
                    {rows.map(({s,out:isOut},ri)=>{
                      const insertBefore=insertAt===ri;
                      const insertAfter=insertAt===ri+1&&ri===rows.length-1;
                      return(
                        <div key={s.id} data-student-row data-student-id={s.id} data-row-index={ri} onMouseDown={e=>startGroupDrag(s.id,s.name,'ungrouped',e)}
                          title={isOut?"Sitting out — Randomise leaves them here. Drag into a group to include them.":"Not in a group yet — Randomise will place them."}
                          style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",padding:"4px 9px",borderRadius:"8px",background:isOut?"rgba(255,255,255,0.45)":"rgba(255,255,255,0.85)",border:isOut?"1px dashed rgba(0,0,0,0.2)":"1px solid transparent",lineHeight:1.3,cursor:"grab",userSelect:"none",opacity:groupDrag?.studentId===s.id?0.35:1,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"6px",
                            boxShadow:insertBefore?"0 -2.5px 0 0 rgba(0,0,0,0.35)":insertAfter?"0 2.5px 0 0 rgba(0,0,0,0.35)":"none"}}
                        ><span>{s.name}</span>{isOut&&<span style={{fontSize:"9px",fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.35)"}}>out</span>}</div>
                      );
                    })}
                  </div>
                  {rows.length===0&&<div style={{fontSize:"11px",color:"rgba(0,0,0,0.25)",fontStyle:"italic"}}>Everyone is in a group.</div>}
                </div>
              );
            })()}
            </div>

            {/* Save this arrangement — a named, permanent snapshot separate from
                the one working result above, so regenerating never loses it */}
            {!showSaveGrouping?(
              <button className="cpb cpb-dashed" onClick={()=>{setGroupingName('');setShowSaveGrouping(true);}}
                title="Save this exact grouping under a name, separate from the working result above" style={{fontSize:"11.5px",fontWeight:600,padding:"7px 12px",borderRadius:"8px",border:"1px dashed rgba(0,0,0,0.15)",background:"none",color:"rgba(0,0,0,0.4)",cursor:"pointer",alignSelf:"flex-start",fontFamily:"'Source Sans 3',sans-serif"}}
              >💾 Save this arrangement…</button>
            ):(
              <div style={{display:"flex",gap:"6px"}}>
                <input value={groupingName} onChange={e=>setGroupingName(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&groupingName.trim()){saveGrouping(groupingName);setShowSaveGrouping(false);}if(e.key==='Escape')setShowSaveGrouping(false);}}
                  autoFocus placeholder="e.g. Persuasive Essay Groups"
                  style={{flex:1,minWidth:0,padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(66,133,244,0.4)",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e"}}
                />
                <button className="cpb cpb-primary" onClick={()=>{if(groupingName.trim()){saveGrouping(groupingName);setShowSaveGrouping(false);}}}
                  style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,cursor:"pointer",flexShrink:0}}
                >Save</button>
                <button className="cpb" onClick={()=>setShowSaveGrouping(false)}
                  style={{padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"12px",fontWeight:600,cursor:"pointer",flexShrink:0}}
                >Cancel</button>
              </div>
            )}

            <div style={{display:"flex",gap:"8px",alignItems:"center",paddingTop:"4px",flexWrap:"wrap"}}>
              {!finalised?(
                <button className="cpb cpb-primary" onClick={handleFinalise}
                  style={{fontSize:"12px",fontWeight:700,padding:"9px 20px",borderRadius:"10px",border:"none",background:"#2e6bce",color:"#fff",cursor:"pointer",boxShadow:"0 1px 6px rgba(46,107,206,0.35)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#1a55b8"}
                  onMouseLeave={e=>e.currentTarget.style.background="#2e6bce"}
                  title="Records these pairings for smart shuffle"
                >Finalise groups</button>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:"7px",padding:"9px 16px",borderRadius:"10px",background:"#edf7ef",border:"1px solid rgba(58,138,78,0.2)"}}>
                  <span style={{fontSize:"14px"}}>✓</span>
                  <span style={{fontSize:"12px",fontWeight:700,color:"#3a8a4e"}}>Pairing history updated</span>
                </div>
              )}
              <div style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontWeight:500,flex:1,lineHeight:1.4}}>
                {finalised?"New groups will use the updated history.":"Finalise to record pairings for smart shuffle."}
              </div>
            </div>
            {/* Seat these groups (Phase 6): its own block, so the stations work can sit beside it */}
            <div data-seat-groups-block style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",padding:"10px 12px",borderRadius:"12px",background:"rgba(255,255,255,0.55)",border:"1px dashed rgba(0,0,0,0.14)"}}>
              <SeatGroupsButton classId={activeClass.id} students={students} inline onGoToSetup={()=>onGoToSeating?.()}
                groups={result.groups.map((g,i)=>({name:groupNames[i]||`Group ${i+1}`,colorIndex:i,ids:g.map(s=>s.id)}))}
                ungroupedIds={(()=>{const inG=new Set(result.groups.flat().map(s=>s.id));return students.filter(s=>!inG.has(s.id)).map(s=>s.id);})()}/>
              <div style={{fontSize:"11px",color:"rgba(0,0,0,0.4)",fontWeight:500,flex:1,minWidth:"180px",lineHeight:1.4}}>Put these groups at tables in a seating setup, e.g. lab partners. Your Regular seating is not changed.</div>
            </div>
          </div>
        )}

        {/* Controls card */}
        <div style={{margin:"16px",borderRadius:"16px",background:"#fff",border:"1px solid rgba(0,0,0,0.06)",padding:"18px 20px",display:"flex",flexDirection:"column",gap:"14px",boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>

          <div>
            <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#2e6bce"}}>New groups</div>
            <div style={{fontSize:"12px",color:"rgba(0,0,0,0.45)",marginTop:"3px",lineHeight:1.5}}>{result?"Set up a brand-new system of groups here. Creating it replaces the groups you have now (shown above).":"Choose how to split the class, then create the groups."}</div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:panelWidth>=640?"minmax(0,1fr) minmax(0,1fr)":"minmax(0,1fr)",gap:"16px 22px",alignItems:"stretch"}}>
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          {/* Mode rows */}
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            <div onClick={()=>setMode('size')} title="Fix how many students per group — the number of groups follows from the class size" style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",borderRadius:"10px",border:mode==='size'?"1.5px solid #2e6bce":"1px solid rgba(0,0,0,0.08)",background:mode==='size'?"#eaf1fc":"#fafafa",cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{width:"16px",height:"16px",borderRadius:"50%",border:mode==='size'?"5px solid #2e6bce":"2px solid rgba(0,0,0,0.2)",flexShrink:0,transition:"border 0.15s"}}/>
              <span style={{fontSize:"13px",fontWeight:600,color:mode==='size'?"#1a1a2e":"rgba(0,0,0,0.5)"}}>Groups of</span>
              <input type="number" min="2" max={n} value={sizeVal}
                onChange={e=>{setSizeVal(e.target.value);setInputError('');}}
                onClick={e=>{e.stopPropagation();setMode('size');}}
                style={{...inp,width:"48px",opacity:mode==='size'?1:0.4}}
                onFocus={e=>{setMode('size');e.target.style.borderColor="rgba(66,133,244,0.5)";}}
                onBlur={e=>e.target.style.borderColor="rgba(0,0,0,0.1)"}
              />
              <span style={{fontSize:"13px",fontWeight:600,color:mode==='size'?"#1a1a2e":"rgba(0,0,0,0.5)"}}>students</span>
            </div>
            <div onClick={()=>setMode('count')} title="Fix how many groups to make — group sizes follow from the class size" style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",borderRadius:"10px",border:mode==='count'?"1.5px solid #2e6bce":"1px solid rgba(0,0,0,0.08)",background:mode==='count'?"#eaf1fc":"#fafafa",cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{width:"16px",height:"16px",borderRadius:"50%",border:mode==='count'?"5px solid #2e6bce":"2px solid rgba(0,0,0,0.2)",flexShrink:0,transition:"border 0.15s"}}/>
              <span style={{fontSize:"13px",fontWeight:600,color:mode==='count'?"#1a1a2e":"rgba(0,0,0,0.5)"}}>Make</span>
              <input type="number" min="1" max={n} value={countVal}
                onChange={e=>{setCountVal(e.target.value);setInputError('');}}
                onClick={e=>{e.stopPropagation();setMode('count');}}
                style={{...inp,width:"48px",opacity:mode==='count'?1:0.4}}
                onFocus={e=>{setMode('count');e.target.style.borderColor="rgba(66,133,244,0.5)";}}
                onBlur={e=>e.target.style.borderColor="rgba(0,0,0,0.1)"}
              />
              <span style={{fontSize:"13px",fontWeight:600,color:mode==='count'?"#1a1a2e":"rgba(0,0,0,0.5)"}}>groups</span>
            </div>
          </div>

          {/* Preview */}
          <div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.35)",fontWeight:500,textAlign:"center"}}>→ {previewLabel}</div>

          {/* Fairness */}
          <div style={{display:"flex",flexDirection:"column",gap:"10px",padding:"10px 14px",borderRadius:"10px",background:"#fafafa",border:"1px solid rgba(0,0,0,0.06)"}}>
            {tog(fairness,"Smart shuffle",()=>setFairness(f=>!f),"Avoid repeating the same pairings from recent groupings")}
            {tog(showFlags,"Show flags",()=>onSetShowFlags?.(!showFlags),"Show 🚩 next to students with flagged checklist items in the Groups tab and in these group cards")}
          </div>

          {fairness&&(
            <div style={{padding:"10px 14px",borderRadius:"10px",background:"#fdf5e6",border:"1px solid rgba(234,170,60,0.2)",fontSize:"11.5px",color:"#8a6d20",fontWeight:500,lineHeight:1.55}}>
              Picks the grouping where students have worked together the least — based on {historyPairCount>0?`${historyPairCount} recorded pairings`:"recorded pairings (none yet)"}. Finalise groups after each lesson to build the history.
              {historyPairCount>0&&(
                <div style={{marginTop:"8px"}}>
                  {!historyClearing?(
                    <button className="cpb cpb-ghost" onClick={()=>setHistoryClearing(true)} style={{fontSize:"10.5px",fontWeight:700,color:"#b8850a",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Clear history…</button>
                  ):(
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <span style={{fontSize:"10.5px",fontWeight:700}}>Clear all history?</span>
                      <button className="cpb cpb-ghost cpb-bad" onClick={handleClearHistory} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0}}>Yes, clear</button>
                      <button className="cpb cpb-ghost" onClick={()=>setHistoryClearing(false)} style={{fontSize:"10.5px",fontWeight:600,color:"rgba(0,0,0,0.4)",background:"none",border:"none",cursor:"pointer",padding:0}}>Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

            </div>
            <div style={{display:"flex",flexDirection:"column"}}>
          {/* Keep apart / together — one editable list. Rules can be built here
              directly, or pulled in from Manage Seating with one click; either
              way, every rule shown is removable right from this list. */}
          <div style={{flex:1,padding:"12px 14px",borderRadius:"10px",background:"#fafafa",border:"1px solid rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:"9px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}}>
              <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase"}}>Keep apart / together</div>
              <button className={`cpb${importableRules.length?" on":""}`} onClick={importFromSeating} disabled={!importableRules.length}
                title={importableRules.length?`Copy ${importableRules.length} rule${importableRules.length!==1?'s':''} from Manage Seating`:"Manage Seating has no rules you haven't already imported"}
                style={{fontSize:"10.5px",fontWeight:700,color:importableRules.length?"#2e6bce":"rgba(0,0,0,0.25)",background:importableRules.length?"#eaf1fc":"rgba(0,0,0,0.03)",border:`1px solid ${importableRules.length?"rgba(46,107,206,0.25)":"rgba(0,0,0,0.06)"}`,borderRadius:"7px",padding:"4px 9px",cursor:importableRules.length?"pointer":"default",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}
              >⬇ Import from Manage Seating{importableRules.length?` (${importableRules.length})`:''}</button>
            </div>
            <RuleEditor rules={groupRules} onChange={setGroupRules} students={students} title=""/>
          </div>

            </div>
          </div>

          {inputError&&(
            <div style={{fontSize:"12px",fontWeight:600,color:"#c44",padding:"8px 12px",borderRadius:"8px",background:"#fdeeed",border:"1px solid rgba(220,60,60,0.18)"}}>{inputError}</div>
          )}

          <button className="cpb cpb-primary" onClick={handleGenerate}
            title={result?"Throw away the current groups and build a brand-new set from the settings and rules above":"Build groups from the settings and rules above"} style={{fontSize:"14px",fontWeight:700,padding:"12px 28px",borderRadius:"12px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",width:"100%",boxShadow:"0 2px 10px rgba(26,26,46,0.15)"}}
            onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"}
            onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
          ><span style={{display:"block"}}>{result?"Create new groups":"Create groups"}</span>{result&&<span style={{display:"block",fontSize:"11px",fontWeight:500,opacity:0.7,marginTop:"2px"}}>Replaces the groups above</span>}</button>
        </div>

        {/* Saved groupings — named archive, independent of the current result,
            so past arrangements ("Persuasive Essay Groups") stay reachable */}
        {savedGroupings.length>0&&(
          <div style={{margin:"0 16px 16px",padding:"14px 16px",borderRadius:"12px",background:"#fff",border:"1px solid rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:"6px",boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase",marginBottom:"2px"}}>📁 Saved groupings</div>
            <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
              {savedGroupings.map(g=>(
                <LayoutCard key={g.id} layout={g} onLoad={()=>loadGrouping(g)} onDelete={()=>deleteGrouping(g.id)}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drag ghost — follows the cursor while moving a student between groups */}
      {groupDrag&&(
        <div className="cp-toast" style={{position:"fixed",left:groupDrag.x+12,top:groupDrag.y+8,zIndex:600,pointerEvents:"none",padding:"5px 12px",borderRadius:"8px",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
          {groupDrag.name}
        </div>
      )}
      {closePrompt&&(
        <div style={{position:"fixed",inset:0,zIndex:650,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.25)",backdropFilter:"blur(3px)"}} onClick={()=>setClosePrompt(null)}>
          <div className="cp-pop" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.2)",maxWidth:"360px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
            <div style={{fontSize:"14px",fontWeight:700,color:"#1a1a2e",marginBottom:"6px"}}>Finalise these groups before you go?</div>
            <div style={{fontSize:"12.5px",color:"rgba(0,0,0,0.45)",lineHeight:1.55,marginBottom:"18px"}}>These groups haven't been finalised yet. Finalising records who worked together, so Smart shuffle can avoid repeating the same pairings next time.</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              <button className="cpb cpb-primary" onClick={()=>{const go=closePrompt.proceed;handleFinalise();setClosePrompt(null);setTimeout(go,80);}} title="Record these pairings, then close" style={{padding:"10px 16px",borderRadius:"10px",border:"none",background:"#2e6bce",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Finalise &amp; close</button>
              <button className="cpb" onClick={()=>{const go=closePrompt.proceed;setClosePrompt(null);go();}} title="Leave without recording these pairings — the groups themselves are still saved" style={{padding:"10px 16px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Close without finalising</button>
              <button className="cpb cpb-ghost" onClick={()=>setClosePrompt(null)} title="Go back to the groups" style={{padding:"8px 16px",borderRadius:"10px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Stay here</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STUDENT GROUPS PANEL — the "Groups" tab: display-only, for the class to
   see. Just says what the groups are, offers a Randomise button that reuses
   whatever settings/rules were last configured in Manage Groups, and a
   full-screen view for projecting. No settings or rules shown here at all —
   those live in Manage Groups.
   ══════════════════════════════════════════════════════════ */
/* − 100% + zoom control shared by the Groups views. Zoom here is CSS zoom on a
   flowing layout, so cards re-wrap into more/fewer columns as it changes. */
const VZOOM_MIN=0.6,VZOOM_MAX=2.2;
const clampVZoom=z=>Math.min(VZOOM_MAX,Math.max(VZOOM_MIN,+z.toFixed(2)));
function ZoomControl({zoom,onChange}){
  const b={width:"26px",height:"26px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.5)",fontSize:"16px",fontWeight:600,cursor:"pointer",lineHeight:1};
  const hov={onMouseEnter:e=>e.currentTarget.style.background="#f0f1f4",onMouseLeave:e=>e.currentTarget.style.background="none"};
  return(
    <div style={{display:"flex",alignItems:"center",gap:"2px",flexShrink:0,background:"#fff",border:"1px solid rgba(0,0,0,0.08)",borderRadius:"8px",padding:"2px"}}>
      <button className="cpb" onClick={()=>onChange(clampVZoom(zoom-0.1))} title="Zoom out — smaller cards, more columns" style={b} {...hov}>−</button>
      <button className="cpb" onClick={()=>onChange(1)} title="Reset zoom" style={{...b,width:"auto",minWidth:"42px",padding:"0 4px",fontSize:"11.5px",fontWeight:700,color:"rgba(0,0,0,0.45)"}} {...hov}>{Math.round(zoom*100)}%</button>
      <button className="cpb" onClick={()=>onChange(clampVZoom(zoom+0.1))} title="Zoom in — bigger cards, fewer columns" style={b} {...hov}>+</button>
    </div>
  );
}
/* Trackpad pinch (a ctrlKey wheel event in Chromium) zooms the element in `ref`;
   a plain two-finger swipe still scrolls. `active` re-attaches when it mounts. */
const usePinchZoom=(ref,setZoom,active)=>{
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
    const onWheel=e=>{if(!e.ctrlKey)return;e.preventDefault();setZoom(z=>clampVZoom(z*(1-e.deltaY*0.01)));};
    el.addEventListener('wheel',onWheel,{passive:false});
    return()=>el.removeEventListener('wheel',onWheel);
  },[active]);
};

function StudentGroupsPanel({activeClass,flagsByStudent,showFlags,onGoToSeating}){
  const[gp,setGp]=useState(null); // raw saved Manage Groups state — settings, rules, last result
  const[displayMode,setDisplayMode]=useState(false);
  const containerRef=useRef(null);
  const panelWidth=useElementWidth(containerRef);
  const[zoom,setZoom]=useState(()=>{try{const z=parseFloat(localStorage.getItem('groups-view-zoom'));return z>=VZOOM_MIN&&z<=VZOOM_MAX?z:1;}catch(e){return 1;}});
  const[displayZoom,setDisplayZoom]=useState(1); // separate zoom for the full-screen projector view
  const setZoomSaved=setZoom; // accepts a value or an updater, so the pinch listener never reads a stale zoom
  useEffect(()=>{try{localStorage.setItem('groups-view-zoom',String(zoom));}catch(e){}},[zoom]);
  const bodyRef=useRef(null),displayBodyRef=useRef(null);
  const vertical=panelWidth>0&&panelWidth/zoom<420;

  const students=activeClass?.students||[];
  usePinchZoom(bodyRef,setZoomSaved,!!activeClass&&students.length>0);
  usePinchZoom(displayBodyRef,setDisplayZoom,displayMode);

  useEffect(()=>{
    if(!activeClass?.id)return;
    setGp(null);setDisplayMode(false);setDisplayZoom(1);
    load(`gp-${activeClass.id}`,null).then(setGp);
  },[activeClass?.id]);

  useEffect(()=>{
    if(!displayMode)return;
    const h=e=>{if(e.key==='Escape')setDisplayMode(false);};
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[displayMode]);

  const rehydrated=useMemo(()=>{
    if(!gp)return{groups:[],names:[],ungrouped:[]};
    const pairs=(gp.resultGroupIds||[]).map((ids,i)=>({members:ids.map(id=>students.find(s=>s.id===id)).filter(Boolean),name:(gp.groupNames||[])[i]||''})).filter(p=>p.members.length>0);
    const ungrouped=(gp.ungroupedIds||[]).map(id=>students.find(s=>s.id===id)).filter(Boolean);
    return{groups:pairs.map(p=>p.members),names:pairs.map(p=>p.name),ungrouped};
  },[gp,students]);

  const hasGroups=rehydrated.groups.length>0;

  /* Randomise reuses whatever's already configured in Manage Groups — mode,
     size/count, Smart shuffle, and the rules list — without showing any of
     it here. There's no separate "finalise" step in this view, so a click
     both generates and records pairing history in one go. */
  const randomize=()=>{
    if(!activeClass?.id||!students.length)return;
    const mode=gp?.mode==='count'?'count':'size';
    const sizeVal=gp?.sizeVal||'3';
    const countVal=gp?.countVal||'4';
    const fairness=!!gp?.fairness;
    const groupRules=gp?.groupRules||[];
    let targetSize=null,numGroupsFixed=null;
    if(mode==='size')targetSize=Math.min(students.length,Math.max(2,parseInt(sizeVal)||3));
    else numGroupsFixed=Math.min(students.length,Math.max(1,parseInt(countVal)||4));

    load(`ph-mode-${activeClass.id}`,'combined').then(m=>{
      const phMode=m==='separate'?'separate':'combined';
      return load(phKey(activeClass.id,phMode,'groups'),{}).then(ph=>({phMode,ph}));
    }).then(({phMode,ph})=>{
      const redeal=!!gp?.resultGroupIds?.length;
      const res=redeal
        ?redealGroups({students,groupCount:gp.resultGroupIds.length,ungroupedIds:gp.ungroupedIds,rules:groupRules,fairness,pairingHistory:ph})
        :runGroupGenerator(students,targetSize,numGroupsFixed,groupRules,fairness,ph);
      const newPH={...ph};
      res.groups.forEach(group=>{
        for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
          const key=[group[i].id,group[j].id].sort().join('-');
          newPH[key]=(newPH[key]||0)+1;
        }
      });
      save(phKey(activeClass.id,phMode,'groups'),newPH);
      const nextGp={mode,sizeVal,countVal,fairness,groupRules,finalised:true,groupNames:gp?.groupNames||[],resultGroupIds:res.groups.map(g=>g.map(s=>s.id)),ungroupedIds:(res.ungrouped||[]).map(s=>s.id)};
      save(`gp-${activeClass.id}`,nextGp);
      setGp(nextGp);
    });
  };

  if(!activeClass)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontFamily:"'Source Sans 3',sans-serif",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))"}}>No class selected</div>
  );
  if(!students.length)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"10px",fontFamily:"'Source Sans 3',sans-serif",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))"}}>
      <div style={{fontSize:"36px",opacity:0.2}}>👥</div>Add students to {activeClass.name} first
    </div>
  );

  /* A group is a hatched table with its members' paper name tags on it and a
     chair tucked in per student — same drawing language as the seating view. */
  const GroupBlock=({group,i,big})=>{
    const col=COLORS[i%COLORS.length];
    return(
      <div style={{...(big?{minWidth:"180px"}:vertical?{width:"100%"}:{minWidth:"148px",flex:"0 0 auto"})}}>
        <div style={{...hatchedWoodCss(),borderRadius:big?"18px":"14px",padding:big?"16px 18px":"11px 12px",display:"flex",flexDirection:"column",gap:big?"8px":"6px"}}>
          <div style={{alignSelf:"flex-start",fontSize:big?"16px":"13px",fontWeight:800,letterSpacing:"1.2px",textTransform:"uppercase",color:col.text,background:col.bg,border:"1.5px solid var(--cp-tag-ink)",borderRadius:"5px",padding:big?"2px 10px":"1px 8px",transform:"rotate(-1deg)",lineHeight:1.35}}>{rehydrated.names[i]||`Group ${i+1}`}</div>
          {group.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:big?"8px":"6px",fontSize:big?"19px":"13px",fontWeight:700,color:"var(--cp-tag-text)",padding:big?"6px 12px":"4px 9px",borderRadius:"5px",background:"var(--cp-paper)",border:"1.5px solid var(--cp-tag-ink)",boxShadow:"1.5px 2px 0 var(--cp-shadow)",transform:`rotate(${tagTilt(s.id)}deg)`,lineHeight:1.3}}><span style={{flex:1,minWidth:0,overflowWrap:"anywhere"}}>{s.name}</span>{showFlags&&<FlagDots flags={flagsByStudent?.get(s.id)} size={big?12:8}/>}</div>
          ))}
        </div>
        {/* One chair per student (up to 8), tucked against the table edge */}
        <div style={{display:"flex",justifyContent:"center",gap:big?"8px":"6px",marginTop:"-3px",position:"relative"}}>
          {group.slice(0,8).map((s,k)=><span key={s.id} style={{width:big?30:24,height:big?18:14,borderRadius:"3px 3px 8px 8px",background:chairColor(i),border:"1.5px solid var(--cp-ink)",boxShadow:"inset 0 -4px 0 rgba(43,33,24,0.2)"}}/>)}
        </div>
      </div>
    );
  };

  return(
    <div ref={containerRef} style={{height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))",fontFamily:"'Source Sans 3',sans-serif",overflow:"hidden"}}>
      <div style={{padding:"12px 18px 10px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fff",flexShrink:0}}>
        <div>
          <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)"}}>Groups</div>
          <div style={{fontSize:"15px",fontWeight:700,color:"#1a1a2e",marginTop:"1px"}}>{activeClass.name}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          {hasGroups&&<ZoomControl zoom={zoom} onChange={setZoomSaved}/>}
          {hasGroups&&<SeatGroupsButton classId={activeClass.id} students={students} compact onGoToSetup={()=>onGoToSeating?.()}
            groups={rehydrated.groups.map((g,i)=>({name:rehydrated.names[i]||`Group ${i+1}`,colorIndex:i,ids:g.map(s=>s.id)}))}
            ungroupedIds={students.filter(s=>!rehydrated.groups.some(g=>g.some(m=>m.id===s.id))).map(s=>s.id)}/>}
          <button className="cpb cpb-primary" onClick={randomize} title="Shuffle students into new groups, using whatever mode/size/rules are set up in Manage Groups" style={{fontSize:"12.5px",fontWeight:700,padding:"8px 16px",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
          >🎲 Randomise</button>
          {hasGroups&&(
            <button className="cpb" onClick={()=>setDisplayMode(true)} title="Full screen (projector view)" style={{fontSize:"14px",fontWeight:600,padding:"7px 12px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.07)",background:"none",color:"rgba(0,0,0,0.3)",cursor:"pointer"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#eaf1fc";e.currentTarget.style.color="#2e6bce";e.currentTarget.style.borderColor="rgba(66,133,244,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(0,0,0,0.3)";e.currentTarget.style.borderColor="rgba(0,0,0,0.07)";}}
            >⛶</button>
          )}
        </div>
      </div>

      <div ref={bodyRef} style={{flex:1,overflow:"auto",padding:"16px"}}>
        {!hasGroups?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"10px",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic"}}>
            <div style={{fontSize:"36px",opacity:0.15}}>👥</div>No groups yet — hit Randomise to make some
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"12px",zoom}}>
            <div style={vertical?{display:"flex",flexDirection:"column",gap:"10px"}:{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              {rehydrated.groups.map((group,i)=><GroupBlock key={i} group={group} i={i}/>)}
            </div>
            {rehydrated.ungrouped.length>0&&(
              <div style={{borderRadius:"16px",background:"var(--board-wash)",border:"1px dashed var(--board-border)",padding:"14px 16px",display:"flex",flexDirection:"column",gap:"6px"}}>
                <div style={{fontSize:"13px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--board-label)"}}>Not in a group</div>
                {rehydrated.ungrouped.map(s=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:700,color:"var(--cp-tag-text)",padding:"4px 9px",borderRadius:"5px",background:"var(--cp-paper)",border:"1.5px dashed var(--cp-tag-ink)",lineHeight:1.3}}><span style={{flex:1,minWidth:0}}>{s.name}</span>{showFlags&&<FlagDots flags={flagsByStudent?.get(s.id)} size={8}/>}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-screen projection view */}
      {displayMode&&(
        <div className="no-drag" style={{position:"fixed",inset:0,zIndex:400,background:"var(--board-flat)",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Source Sans 3',sans-serif"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",background:"#fff",borderBottom:"1px solid rgba(0,0,0,0.06)",flexShrink:0}}>
            <button className="cpb" onClick={()=>setDisplayMode(false)} style={{fontSize:"13px",fontWeight:600,padding:"7px 14px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.4)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>← Exit</button>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>{activeClass.name}</div>
              <ZoomControl zoom={displayZoom} onChange={setDisplayZoom}/>
            </div>
            <button className="cpb cpb-primary" onClick={randomize} title="Shuffle students into new groups, using whatever mode/size/rules are set up in Manage Groups" style={{fontSize:"13px",fontWeight:700,padding:"7px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
            >🎲 Randomise</button>
          </div>
          <div ref={displayBodyRef} style={{flex:1,overflow:"auto",padding:"32px",display:"flex",alignItems:"flex-start",justifyContent:"center"}}>
            {hasGroups?(
              <div style={{display:"flex",flexWrap:"wrap",gap:"18px",justifyContent:"center",maxWidth:"1200px",zoom:displayZoom}}>
                {rehydrated.groups.map((group,i)=><GroupBlock key={i} group={group} i={i} big/>)}
              </div>
            ):(
              <div style={{color:"var(--board-muted)",fontSize:"14px",fontStyle:"italic",marginTop:"60px"}}>No groups yet — hit Randomise</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CHECKLIST PANEL — student × item grid: who's done what, who owes what
   ══════════════════════════════════════════════════════════ */
const CK_NAME_W=170,CK_COL_W=84,CK_ROW_H=30,CK_ADD_W=34;
const ckInputStyle={width:"100%",padding:"6px 8px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.12)",fontSize:"12.5px",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e",outline:"none",background:"#fff"};
const ckLabelStyle={fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)",marginBottom:"4px"};
const ckSmallBtn={padding:"6px 8px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.55)",fontSize:"11.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",textAlign:"left"};

/* Edit one item (column): name, colour, due, flag, bulk actions, delete. A
   popover through a portal so the grid's scroll container can't clip it. */
function ChecklistColumnEditor({col,x,y,categories,onChangeCategories,onUpdate,onBulk,onDelete,boxRef}){
  const labelOf=colour=>(categories||[]).find(c=>c.colour===colour)?.label||'';
  const[nameDraft,setNameDraft]=useState(col.name);
  const[labelDraft,setLabelDraft]=useState(labelOf(col.colour));
  const[confirmDel,setConfirmDel]=useState(false);
  /* Name and category label are typed into local drafts and committed on blur/
     Enter/close, so each keystroke doesn't re-render and re-save the whole app. */
  const commitName=()=>{const n=nameDraft.trim();if(n&&n!==col.name)onUpdate({name:n});};
  const commitLabel=()=>{
    if(!col.colour)return;
    const t=labelDraft.trim();
    if(t===labelOf(col.colour))return;
    const rest=(categories||[]).filter(c=>c.colour!==col.colour);
    onChangeCategories(t?[...rest,{colour:col.colour,label:t}]:rest);
  };
  const commitRef=useRef(null);
  commitRef.current=()=>{commitName();commitLabel();};
  useEffect(()=>()=>commitRef.current(),[]);

  const flagIf=col.flagIf?.length?col.flagIf:['none'];
  const toggleFlagIf=id=>{
    const next=flagIf.includes(id)?flagIf.filter(s=>s!==id):[...flagIf,id];
    if(!next.length){onUpdate({flag:false,flagIf:['none'],flagOnlyOverdue:false});return;} // nothing left to flag on = flag off
    onUpdate({flagIf:next,...(next.includes('none')?{}:{flagOnlyOverdue:false})});
  };
  const left=Math.max(8,Math.min(x,window.innerWidth-292));
  const top=Math.min(y+4,Math.max(8,window.innerHeight-470));
  const field=(label,children)=>(<div><div style={ckLabelStyle}>{label}</div>{children}</div>);

  return createPortal(
    <div className="cp-pop" ref={boxRef} onMouseDown={e=>e.stopPropagation()} style={{position:"fixed",left,top,width:"276px",maxHeight:window.innerHeight-top-8,overflowY:"auto",zIndex:600,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"12px",boxShadow:"0 8px 28px rgba(0,0,0,0.16)",padding:"12px 14px",display:"flex",flexDirection:"column",gap:"11px",fontFamily:"'Source Sans 3',sans-serif"}}>
      {field("Name",
        <input value={nameDraft} onChange={e=>setNameDraft(e.target.value)} onBlur={commitName} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}} onFocus={e=>e.target.select()} autoFocus placeholder="Item name…" title="Name of this work or task" style={ckInputStyle}/>
      )}

      {field("Category colour",
        <>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
            <button onClick={()=>{commitLabel();onUpdate({colour:null});setLabelDraft('');}} title="No category" style={{width:"18px",height:"18px",borderRadius:"50%",border:!col.colour?"2px solid #1a1a2e":"2px dashed rgba(0,0,0,0.25)",background:"#fff",cursor:"pointer",padding:0}}/>
            {CHECK_COLOURS.map(c=>(
              <button key={c.label} onClick={()=>{commitLabel();onUpdate({colour:c.label});setLabelDraft(labelOf(c.label));}} title={labelOf(c.label)?`${c.label} — ${labelOf(c.label)}`:c.label}
                style={{width:"18px",height:"18px",borderRadius:"50%",background:c.text,border:col.colour===c.label?"2px solid #1a1a2e":"2px solid transparent",boxShadow:col.colour===c.label?"0 0 0 1px #fff inset":"none",cursor:"pointer",padding:0}}/>
            ))}
          </div>
          {col.colour&&(
            <input value={labelDraft} onChange={e=>setLabelDraft(e.target.value)} onBlur={commitLabel} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}} placeholder={`What does ${col.colour} mean? (e.g. Homework)`} title="Name this colour — the meaning is shared by every item and class, and shows in the legend" style={{...ckInputStyle,marginTop:"7px",fontSize:"11.5px"}}/>
          )}
        </>
      )}

      {field("Due",
        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
          <input type="date" value={col.due||''} onChange={e=>{const v=e.target.value||null;onUpdate(v?{due:v}:{due:null,dueTime:null,flagOnlyOverdue:false});}} title="Due date (optional) — blank cells turn red once it has passed" style={{...ckInputStyle,flex:1,minWidth:0,padding:"5px 6px",fontSize:"11.5px"}}/>
          <input type="time" value={col.dueTime||''} disabled={!col.due} onChange={e=>onUpdate({dueTime:e.target.value||null})} title={col.due?"Due time (optional) — with no time, the item is due at the end of that day":"Pick a due date first"} style={{...ckInputStyle,width:"82px",padding:"5px 6px",fontSize:"11.5px",opacity:col.due?1:0.4}}/>
          {col.due&&<button className="cpb cpb-ghost" onClick={()=>onUpdate({due:null,dueTime:null,flagOnlyOverdue:false})} title="Remove the due date" style={{background:"none",border:"none",color:"rgba(0,0,0,0.35)",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:"0 2px"}}>Clear</button>}
        </div>
      )}

      <div>
        <button className="cpb" onClick={()=>onUpdate(col.flag?{flag:false}:{flag:true,flagIf})} title={col.flag?"Stop showing a 🚩 dot by student names for this item":"Show a 🚩 dot by the name of any student who hasn't sorted this item, on the Seating chart (and in Groups, if 'Show flags' is on there). Choose below which statuses count."}
          style={{width:"100%",display:"flex",alignItems:"center",gap:"8px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${col.flag?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:col.flag?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start",fontFamily:"'Source Sans 3',sans-serif"}}>
          <CPSwitch on={col.flag} small/>
          <span style={{fontSize:"11.5px",fontWeight:600,color:col.flag?"#2e6bce":"rgba(0,0,0,0.45)"}}>🚩 Flag on Seating Chart</span>
        </button>
        <div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.4)",lineHeight:1.4,margin:"5px 2px 0"}}>{col.flag?"A coloured dot shows by the student's name in Seating when their status matches:":"Put a 🚩 dot by students' names on the seating chart when they haven't handed this in."}</div>
        {col.flag&&(
          <div style={{margin:"8px 0 0 4px"}}>
            <div style={ckLabelStyle}>Flag if…</div>
            {CHECK_STATUSES.map(s=>(
              <div key={s.id}>
                <label title={`Flag students whose status for this item is "${s.label}"`} style={{display:"flex",alignItems:"center",gap:"7px",fontSize:"12px",color:"#1a1a2e",cursor:"pointer",padding:"2px 0"}}>
                  <input type="checkbox" checked={flagIf.includes(s.id)} onChange={()=>toggleFlagIf(s.id)} style={{accentColor:"#2e6bce",cursor:"pointer",width:"13px",height:"13px"}}/>
                  {s.label}
                </label>
                {s.id==='none'&&flagIf.includes('none')&&(
                  <label title={col.due?"Only flag blank cells once the due time has passed":"Set a due date to use this"} style={{display:"flex",alignItems:"center",gap:"7px",fontSize:"11.5px",color:col.due?"rgba(0,0,0,0.6)":"rgba(0,0,0,0.25)",cursor:col.due?"pointer":"default",padding:"1px 0 3px 20px"}}>
                    <input type="checkbox" checked={!!col.flagOnlyOverdue&&!!col.due} disabled={!col.due} onChange={e=>onUpdate({flagOnlyOverdue:e.target.checked})} style={{accentColor:"#2e6bce",cursor:col.due?"pointer":"default",width:"12px",height:"12px"}}/>
                    Only once overdue
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
        <button className="cpb" onClick={()=>onBulk('done')} title="Set every blank cell in this item to Done (cells that already have a status are left alone)" style={ckSmallBtn}>Mark all blank as Done</button>
        <button className="cpb" onClick={()=>onBulk('na')} title="Set every blank cell in this item to Not applicable (cells that already have a status are left alone)" style={ckSmallBtn}>Mark all blank as N/A</button>
      </div>

      {!confirmDel?(
        <button className="cpb cpb-warn" onClick={()=>setConfirmDel(true)} title="Delete this item and everyone's status for it" style={{...ckSmallBtn,color:"#c44",borderColor:"rgba(200,60,60,0.25)",textAlign:"center"}}>Delete item</button>
      ):(
        <div>
          <div style={{fontSize:"12px",color:"#c44",fontWeight:600,marginBottom:"7px",lineHeight:1.4}}>Delete "{col.name}"? This removes everyone's status for it.</div>
          <div style={{display:"flex",gap:"6px"}}>
            <button className="cpb cpb-danger" onClick={onDelete} title="Yes, delete this item" style={{flex:1,padding:"6px",borderRadius:"7px",border:"none",background:"#c44",color:"#fff",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Delete</button>
            <button className="cpb" onClick={()=>setConfirmDel(false)} title="Keep this item" style={{...ckSmallBtn,flex:1,textAlign:"center"}}>Cancel</button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

function ChecklistPanel({activeClass,classes,data,onChange,onCopyItems,categories,onChangeCategories,now,focus,onFocusHandled}){
  const[cellMenu,setCellMenu]=useState(null);   // {colId, studentId, x, y}
  const[noteDraft,setNoteDraft]=useState(null); // text while the cell menu's note input is open, else null
  const[colEditor,setColEditor]=useState(null); // {colId, x, y}
  const[pendingOpenCol,setPendingOpenCol]=useState(null); // a just-added item whose editor opens once its header has rendered
  const[dragColId,setDragColId]=useState(null);
  const[dropIdx,setDropIdx]=useState(null);     // insertion index (0..columns.length) while a header is being dragged
  const[editingLegend,setEditingLegend]=useState(null); // {colour, text}
  const[hl,setHl]=useState(null);               // {studentId, colId|null} — brief highlight after "Open in Checklist"
  const[selecting,setSelecting]=useState(false);  // "Select" mode: headers become tick-boxes so items can be copied to other classes
  const[selected,setSelected]=useState([]);       // ids of the ticked items
  const[copyMenu,setCopyMenu]=useState(null);     // {x, y} while the "Copy to class" popover is open
  const[copyTargets,setCopyTargets]=useState([]); // ids of the classes ticked in that popover
  const[copyDue,setCopyDue]=useState(true);       // keep due dates on the copies?
  const[notice,setNotice]=useState(null);         // short "Copied …" confirmation
  const[sortKey,setSortKey]=useState('roster');   // how the student rows are ordered (shared across classes)
  const cellMenuRef=useRef(null);
  const colEditorRef=useRef(null);
  const copyMenuRef=useRef(null);

  const students=activeClass?.students||[];
  const columns=data?.columns||[];
  const rows=sortStudents(students,sortKey);
  const labelOf=colour=>(categories||[]).find(c=>c.colour===colour)?.label||'';

  /* Close either popover on an outside click or Escape, like the other menus */
  useEffect(()=>{
    if(!cellMenu)return;
    const away=e=>{if(cellMenuRef.current?.contains(e.target)||e.target.closest?.('[data-help-btn]'))return;setCellMenu(null);setNoteDraft(null);}; // the ❓ button is exempt so help mode can explain the menu
    const esc=e=>{if(e.key==='Escape'){setCellMenu(null);setNoteDraft(null);}};
    document.addEventListener('mousedown',away);document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('mousedown',away);document.removeEventListener('keydown',esc);};
  },[cellMenu]);
  useEffect(()=>{
    if(!colEditor)return;
    const away=e=>{if(colEditorRef.current?.contains(e.target)||e.target.closest?.('[data-help-btn]'))return;setColEditor(null);}; // the ❓ button is exempt so help mode can explain the editor
    const esc=e=>{if(e.key==='Escape')setColEditor(null);};
    document.addEventListener('mousedown',away);document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('mousedown',away);document.removeEventListener('keydown',esc);};
  },[colEditor]);

  useEffect(()=>{
    if(!copyMenu)return;
    const away=e=>{if(copyMenuRef.current?.contains(e.target)||e.target.closest?.('[data-help-btn],[data-ck-copy-btn]'))return;setCopyMenu(null);}; // the Copy button toggles itself; ❓ is exempt for help mode
    const esc=e=>{if(e.key==='Escape')setCopyMenu(null);};
    document.addEventListener('mousedown',away);document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('mousedown',away);document.removeEventListener('keydown',esc);};
  },[copyMenu]);
  /* Selections belong to one class's items, so leave Select mode when the class changes */
  useEffect(()=>{setSelecting(false);setSelected([]);setCopyMenu(null);setCopyTargets([]);},[activeClass?.id]);
  useEffect(()=>{load('checklist-sort','roster').then(v=>{if(CHECK_SORTS.some(x=>x.id===v))setSortKey(v);});},[]);
  const changeSort=v=>{setSortKey(v);save('checklist-sort',v);};
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(null),5000);return()=>clearTimeout(t);},[notice]);

  /* "Open in Checklist" from a seating popup: scroll to that student (and item) and flash it */
  useEffect(()=>{
    if(!focus)return;
    setHl({studentId:focus.studentId,colId:focus.colId||null});
    setTimeout(()=>document.getElementById(focus.colId?`ck-cell-${focus.colId}-${focus.studentId}`:`ck-row-${focus.studentId}`)?.scrollIntoView({behavior:'smooth',block:'center',inline:'center'}),80);
    setTimeout(()=>setHl(null),1500);
    onFocusHandled?.();
  },[focus]);

  /* A new item opens its editor straight away, anchored under its header */
  useEffect(()=>{
    if(!pendingOpenCol)return;
    const el=document.getElementById(`ck-th-${pendingOpenCol}`);
    if(!el)return;
    el.scrollIntoView({block:'nearest',inline:'nearest'});
    const r=el.getBoundingClientRect();
    setColEditor({colId:pendingOpenCol,x:r.left,y:r.bottom});
    setPendingOpenCol(null);
  },[pendingOpenCol,columns.length]);

  const updateCol=(id,patch)=>onChange(d=>({...d,columns:d.columns.map(c=>c.id===id?{...c,...patch}:c)}));
  const addColumn=()=>{
    const id=`c-${Date.now()}`;
    onChange(d=>({...d,columns:[...d.columns,{id,name:'New item',colour:null,due:null,dueTime:null,flag:false,flagIf:['none'],flagOnlyOverdue:false}]}));
    setCellMenu(null);setPendingOpenCol(id);
  };
  const deleteCol=id=>{
    onChange(d=>{const cells={...d.cells};delete cells[id];return{...d,columns:d.columns.filter(c=>c.id!==id),cells};});
    setColEditor(null);
  };
  const bulkMark=(colId,status)=>onChange(d=>{
    let n=d;
    students.forEach(st=>{if(cellStatus(n,colId,st.id)==='none')n=withCell(n,colId,st.id,{status});});
    return n;
  });
  const cycleCell=(colId,studentId)=>{
    const next=CHECK_CYCLE[(CHECK_CYCLE.indexOf(cellStatus(data,colId,studentId))+1)%CHECK_CYCLE.length];
    onChange(d=>withCell(d,colId,studentId,{status:next}));
  };
  const setStatus=(colId,studentId,status)=>{onChange(d=>withCell(d,colId,studentId,{status}));setCellMenu(null);setNoteDraft(null);};
  const saveNote=(colId,studentId,note)=>{onChange(d=>withCell(d,colId,studentId,{note}));setCellMenu(null);setNoteDraft(null);};
  const openCellMenu=(colId,studentId,x,y)=>{
    setColEditor(null);
    setNoteDraft(null);
    setCellMenu({colId,studentId,x,y});
  };
  const moveColumn=(fromId,toIdx)=>onChange(d=>{
    const cols=[...d.columns];
    const from=cols.findIndex(c=>c.id===fromId);
    if(from<0)return d;
    const[m]=cols.splice(from,1);
    cols.splice(toIdx>from?toIdx-1:toIdx,0,m);
    return{...d,columns:cols};
  });
  const toggleSelecting=()=>{
    setColEditor(null);setCellMenu(null);setCopyMenu(null);
    if(selecting)setSelected([]);
    setSelecting(!selecting);
  };
  const toggleSelected=id=>setSelected(sel=>sel.includes(id)?sel.filter(x=>x!==id):[...sel,id]);
  const otherClasses=(classes||[]).filter(c=>c.id!==activeClass?.id&&!c.isDemo);
  const doCopy=async()=>{
    const ids=columns.filter(c=>selected.includes(c.id)).map(c=>c.id); // keep grid order, not tick order
    const targets=otherClasses.filter(c=>copyTargets.includes(c.id));
    if(!ids.length||!targets.length)return;
    await onCopyItems(ids,targets.map(c=>c.id),copyDue);
    setNotice(`Copied ${ids.length} item${ids.length===1?'':'s'} to ${targets.map(c=>c.name).join(', ')}`);
    setCopyMenu(null);setCopyTargets([]);setSelected([]);setSelecting(false);
  };
  const setLabel=(colour,text)=>{
    const rest=(categories||[]).filter(c=>c.colour!==colour);
    onChangeCategories(text.trim()?[...rest,{colour,label:text.trim()}]:rest);
  };

  if(!activeClass)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontFamily:"'Source Sans 3',sans-serif",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))"}}>No class selected</div>
  );

  /* "Owes" = flagged items; with no flagged items anywhere, blank cells that are overdue or have no due date */
  const anyFlagged=columns.some(c=>c.flag);
  const owedBy=st=>columns.filter(col=>{
    const status=cellStatus(data,col.id,st.id);
    return anyFlagged?isFlagged(col,status,now):(status==='notdone'||(status==='none'&&(!col.due||isOverdue(col,status,now))));
  }).map(c=>c.name);
  const usedColours=new Set(columns.map(c=>c.colour).filter(Boolean));
  const legendColours=CHECK_COLOURS.filter(c=>usedColours.has(c.label)||labelOf(c.label));
  const fromIdx=dragColId?columns.findIndex(c=>c.id===dragColId):-1;
  const dropValid=dragColId!=null&&dropIdx!=null&&dropIdx!==fromIdx&&dropIdx!==fromIdx+1;
  const menuCol=cellMenu?columns.find(c=>c.id===cellMenu.colId):null;
  const menuStudent=cellMenu?students.find(s=>s.id===cellMenu.studentId):null;
  const editorCol=colEditor?columns.find(c=>c.id===colEditor.colId):null;

  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))",fontFamily:"'Source Sans 3',sans-serif",overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"12px 18px 10px",borderBottom:"1px solid rgba(0,0,0,0.06)",background:"#fff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}}>
        <div>
          <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)"}}>Checklist</div>
          <div style={{fontSize:"15px",fontWeight:700,color:"#1a1a2e",marginTop:"1px"}}>{activeClass.name}</div>
        </div>
        <div style={{display:"flex",gap:"6px"}}>
          <button className={`cpb${selecting?" on":""}`} onClick={toggleSelecting} disabled={!columns.length} title={selecting?"Stop selecting items":"Select items to copy to your other classes"} style={{padding:"7px 14px",borderRadius:"8px",border:`1px solid ${selecting?"#2e6bce":"rgba(0,0,0,0.15)"}`,background:selecting?"#eef3fc":"#fff",color:selecting?"#2e6bce":"#1a1a2e",fontSize:"13px",fontWeight:600,cursor:columns.length?"pointer":"default",opacity:columns.length?1:0.4,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap"}}>{selecting?"Done":"Select"}</button>
          <button className="cpb cpb-primary" onClick={addColumn} title="Add a new item (a piece of work or task) as a column" style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap"}}>+ Add item</button>
        </div>
      </div>

      {/* Select-mode bar — tick items in the grid, then copy them to other classes */}
      {selecting&&(
        <div style={{padding:"7px 16px",borderBottom:"1px solid rgba(0,0,0,0.06)",background:"#f4f7fd",flexShrink:0,display:"flex",alignItems:"center",gap:"10px",fontSize:"12px",color:"#1a1a2e"}}>
          <span style={{fontWeight:600}}>{selected.length?`${selected.length} selected`:"Tick the items you want to copy"}</span>
          <button className="cpb" onClick={()=>setSelected(columns.map(c=>c.id))} title="Tick every item" style={ckSmallBtn}>Select all</button>
          {selected.length>0&&<button className="cpb" onClick={()=>setSelected([])} title="Untick everything" style={ckSmallBtn}>Clear</button>}
          <button className="cpb cpb-primary" data-ck-copy-btn disabled={!selected.length||!otherClasses.length}
            onClick={e=>{if(copyMenu){setCopyMenu(null);return;}const r=e.currentTarget.getBoundingClientRect();setCopyMenu({x:r.right,y:r.bottom+4});}}
            title={!otherClasses.length?"You need another class to copy to":!selected.length?"Tick at least one item first":"Choose which classes to copy the ticked items to"}
            style={{marginLeft:"auto",padding:"5px 12px",borderRadius:"7px",border:"none",background:"#2e6bce",color:"#fff",fontSize:"12px",fontWeight:600,cursor:(selected.length&&otherClasses.length)?"pointer":"default",opacity:(selected.length&&otherClasses.length)?1:0.4,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap"}}>Copy to class… ▾</button>
        </div>
      )}
      {notice&&<div style={{padding:"6px 16px",borderBottom:"1px solid rgba(0,0,0,0.06)",background:"#eaf6ee",color:"#3a8a4e",fontSize:"12px",fontWeight:600,flexShrink:0}}>✓ {notice}</div>}

      {/* Legend — what each category colour means; click a chip to rename it */}
      <div style={{padding:"7px 16px",borderBottom:"1px solid rgba(0,0,0,0.06)",background:"#fff",flexShrink:0,display:"flex",flexWrap:"wrap",alignItems:"center",gap:"6px"}}>
        {legendColours.length===0&&<span style={{fontSize:"11px",color:"rgba(0,0,0,0.35)",fontStyle:"italic"}}>Colour-code items by category: pick a colour in an item's editor, then name it here.</span>}
        {legendColours.map(c=>{
          const editing=editingLegend?.colour===c.label;
          const commit=()=>{setLabel(c.label,editingLegend.text);setEditingLegend(null);};
          return(
            <div key={c.label} style={{display:"flex",alignItems:"center",gap:"5px",padding:"2px 9px 2px 7px",borderRadius:"10px",background:c.bg,border:`1px solid ${c.border}`}}>
              <span style={{width:"8px",height:"8px",borderRadius:"50%",background:c.text,flexShrink:0}}/>
              {editing?(
                <input value={editingLegend.text} onChange={e=>setEditingLegend({colour:c.label,text:e.target.value})} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape'){setEditingLegend(null);}}} autoFocus placeholder="Label…" title={`Name what ${c.label} means`} style={{width:"90px",border:"none",background:"transparent",outline:"none",fontSize:"11.5px",fontWeight:600,color:c.text,fontFamily:"'Source Sans 3',sans-serif",padding:0}}/>
              ):(
                <span onClick={()=>setEditingLegend({colour:c.label,text:labelOf(c.label)})} title={`Click to rename this ${c.label} category (shared across all classes)`} style={{fontSize:"11.5px",fontWeight:600,color:labelOf(c.label)?c.text:"rgba(0,0,0,0.35)",fontStyle:labelOf(c.label)?"normal":"italic",cursor:"text"}}>{labelOf(c.label)||'Add label'}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{flex:1,overflow:"auto",position:"relative"}}>
        {!students.length?(
          <div style={{textAlign:"center",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",marginTop:"40px"}}>Add students to {activeClass.name} first</div>
        ):columns.length===0?(
          <div style={{textAlign:"center",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",marginTop:"40px"}}>No checklist items yet — add one above</div>
        ):(
          <table style={{borderCollapse:"separate",borderSpacing:0,tableLayout:"fixed",width:CK_NAME_W+columns.length*CK_COL_W+CK_ADD_W}}>
            <thead>
              <tr>
                <th style={{position:"sticky",left:0,top:0,zIndex:5,width:CK_NAME_W,minWidth:CK_NAME_W,background:"#fff",borderBottom:"1px solid rgba(0,0,0,0.08)",borderRight:"1px solid rgba(0,0,0,0.08)",padding:"8px 10px",textAlign:"left",verticalAlign:"bottom",fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)"}}>
                  <select value={sortKey} onChange={e=>changeSort(e.target.value)} title="Order the students by roster order, first name, last name or grade" style={{width:"100%",padding:"3px 2px",borderRadius:"6px",border:"1px solid rgba(0,0,0,0.12)",background:"#fff",fontSize:"11px",fontWeight:600,color:"rgba(0,0,0,0.6)",fontFamily:"'Source Sans 3',sans-serif",textTransform:"none",letterSpacing:0,cursor:"pointer"}}>
                    {CHECK_SORTS.map(o=><option key={o.id} value={o.id}>{o.id==='roster'?'Student · roster order':`Student · by ${o.label.toLowerCase()}`}</option>)}
                  </select>
                </th>
                {columns.map((col,i)=>{
                  const cc=checkColour(col.colour);
                  const dt=dueDateTime(col);
                  const pastDue=!!dt&&now>dt.getTime();
                  const barL=dropValid&&dropIdx===i,barR=dropValid&&dropIdx===columns.length&&i===columns.length-1;
                  return(
                    <th key={col.id} id={`ck-th-${col.id}`} className={i===columns.length-1?"ck-th-last":undefined} draggable={!selecting}
                      onMouseDown={e=>e.stopPropagation()}
                      onClick={e=>{
                        if(selecting){toggleSelected(col.id);return;}
                        if(colEditor?.colId===col.id){setColEditor(null);return;}
                        const r=e.currentTarget.getBoundingClientRect();
                        setCellMenu(null);setColEditor({colId:col.id,x:r.left,y:r.bottom});
                      }}
                      onDragStart={e=>{e.dataTransfer.setData('text/plain',col.id);e.dataTransfer.effectAllowed='move';setDragColId(col.id);setColEditor(null);setCellMenu(null);}}
                      onDragOver={e=>{
                        if(dragColId==null)return;
                        e.preventDefault();e.dataTransfer.dropEffect='move';
                        const r=e.currentTarget.getBoundingClientRect();
                        const idx=e.clientX<r.left+r.width/2?i:i+1;
                        if(idx!==dropIdx)setDropIdx(idx);
                      }}
                      onDrop={e=>{e.preventDefault();if(dragColId!=null&&dropIdx!=null)moveColumn(dragColId,dropIdx);setDragColId(null);setDropIdx(null);}}
                      onDragEnd={()=>{setDragColId(null);setDropIdx(null);}}
                      title={selecting?`${selected.includes(col.id)?"Untick":"Tick"} "${col.name}" to copy it to another class`:`${col.name}${col.flag?" (flagged)":""} — click to edit, drag to reorder`}
                      style={{position:"sticky",top:0,zIndex:3,width:CK_COL_W,minWidth:CK_COL_W,padding:0,verticalAlign:"top",background:selecting&&selected.includes(col.id)?"#eef3fc":"#fff",borderBottom:"1px solid rgba(0,0,0,0.08)",borderRight:"1px solid rgba(0,0,0,0.06)",cursor:selecting?"pointer":"grab",userSelect:"none",opacity:dragColId===col.id?0.4:1,boxShadow:barL?"inset 2.5px 0 0 #2e6bce":barR?"inset -2.5px 0 0 #2e6bce":"none"}}>
                      <div style={{height:"4px",background:col.colour?cc.text:"rgba(0,0,0,0.08)"}}/>
                      <div style={{padding:"5px 6px 6px",textAlign:"left",position:"relative"}}>
                        {selecting&&<span style={{position:"absolute",top:"5px",right:"5px",width:"14px",height:"14px",borderRadius:"4px",border:`1.5px solid ${selected.includes(col.id)?"#2e6bce":"rgba(0,0,0,0.3)"}`,background:selected.includes(col.id)?"#2e6bce":"#fff",color:"#fff",fontSize:"10px",lineHeight:"12px",textAlign:"center",fontWeight:700}}>{selected.includes(col.id)?"✓":""}</span>}
                        <div style={{fontSize:"11.5px",fontWeight:700,color:"#1a1a2e",lineHeight:1.25,paddingRight:selecting?"16px":0,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",wordBreak:"break-word"}}>{col.flag&&<span title="Flagged on the Seating chart — a dot shows by the names of students who match">🚩 </span>}{col.name}</div>
                        {col.due&&<div style={{fontSize:"9.5px",fontWeight:600,color:pastDue?"#c44":"rgba(0,0,0,0.4)",marginTop:"2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fmtDue(col)}</div>}
                      </div>
                    </th>
                  );
                })}
                {/* A "+" that appears when you hover the last column, for adding the next one right where it will go */}
                <th className="ck-add-th" style={{position:"sticky",top:0,zIndex:3,width:CK_ADD_W,minWidth:CK_ADD_W,padding:0,background:"transparent",borderBottom:"1px solid rgba(0,0,0,0.08)"}}>
                  <button className="ck-add" onClick={addColumn} title="Add a new item as the next column" style={{display:"block",margin:"8px auto 0",width:"22px",height:"22px",borderRadius:"50%",border:"1px dashed rgba(0,0,0,0.3)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"15px",lineHeight:1,cursor:"pointer",padding:0}}>+</button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(st=>{
                const owed=owedBy(st);
                const rowHl=hl?.studentId===st.id;
                return(
                  <tr key={st.id} id={`ck-row-${st.id}`}>
                    <td style={{position:"sticky",left:0,zIndex:2,height:CK_ROW_H,padding:"0 10px",background:rowHl?"#fff3c4":"#fff",borderRight:"1px solid rgba(0,0,0,0.08)",borderBottom:"1px solid rgba(0,0,0,0.06)",transition:"background 0.3s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                        <span style={{flex:1,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontSize:"12.5px",fontWeight:600,color:"#1a1a2e"}} title={st.name}>{st.name}</span>
                        {owed.length>0&&<span title={`Owes ${owed.length}: ${owed.join(', ')}`} style={{fontSize:"10px",fontWeight:700,padding:"1px 7px",borderRadius:"8px",background:"#fdeeed",color:"#c44",flexShrink:0}}>{owed.length}</span>}
                      </div>
                    </td>
                    {columns.map(col=>{
                      const status=cellStatus(data,col.id,st.id);
                      const entry=data.cells?.[col.id]?.[st.id];
                      const s=checkStatus(status);
                      const overdue=isOverdue(col,status,now);
                      const cellHl=hl?.studentId===st.id&&hl?.colId===col.id;
                      return(
                        <td key={col.id} id={`ck-cell-${col.id}-${st.id}`} style={{padding:0,height:CK_ROW_H,borderRight:"1px solid rgba(0,0,0,0.06)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
                          <div className="ck-cell"
                            onClick={()=>cycleCell(col.id,st.id)}
                            onContextMenu={e=>{e.preventDefault();openCellMenu(col.id,st.id,e.clientX,e.clientY);}}
                            title={`${st.name} — ${col.name}: ${overdue?"Overdue (not submitted)":s.label}${entry?.note?`\nNote: ${entry.note}`:""}\nClick to change, right-click for more`}
                            style={{position:"relative",height:CK_ROW_H,display:"flex",alignItems:"center",justifyContent:"center",background:overdue?OVERDUE.bg:s.bg,color:overdue?OVERDUE.text:s.text,boxShadow:overdue?`inset 0 0 0 1px ${OVERDUE.border}`:"none",outline:cellHl?"2px solid #2e6bce":"none",outlineOffset:"-2px",fontSize:"13px",fontWeight:700,cursor:"pointer",userSelect:"none"}}>
                            {overdue?"!":s.short}
                            {entry?.note&&<span style={{position:"absolute",top:"3px",right:"3px",width:"5px",height:"5px",borderRadius:"50%",background:"#2e6bce"}}/>}
                            <button className="ck-caret" onClick={e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();openCellMenu(col.id,st.id,r.left,r.bottom+2);}} title="Set a status directly or add a note"
                              style={{position:"absolute",bottom:0,right:0,background:"none",border:"none",padding:"0 3px",fontSize:"9px",lineHeight:1,color:"rgba(0,0,0,0.45)",cursor:"pointer"}}>▾</button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td style={{position:"sticky",left:0,bottom:0,zIndex:2,padding:"5px 10px",background:"#fff",borderRight:"1px solid rgba(0,0,0,0.08)",borderTop:"1px solid rgba(0,0,0,0.08)",fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.3)"}}>Sorted</td>
                {columns.map(col=>{
                  const n=students.filter(st=>['done','late','na'].includes(cellStatus(data,col.id,st.id))).length;
                  return <td key={col.id} title={`${n} of ${students.length} students are Done, Late or N/A for "${col.name}"`} style={{position:"sticky",bottom:0,zIndex:1,padding:"5px 6px",background:"#fff",borderRight:"1px solid rgba(0,0,0,0.06)",borderTop:"1px solid rgba(0,0,0,0.08)",fontSize:"10.5px",fontWeight:600,color:n===students.length?"#3a8a4e":"rgba(0,0,0,0.4)",textAlign:"center"}}>{n}/{students.length} ✓</td>;
                })}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Cell menu — set any status directly, or add a note */}
      {cellMenu&&menuCol&&menuStudent&&createPortal(
        <div className="cp-pop" ref={cellMenuRef} onMouseDown={e=>e.stopPropagation()} style={{position:"fixed",left:Math.max(8,Math.min(cellMenu.x,window.innerWidth-224)),top:Math.max(8,Math.min(cellMenu.y,window.innerHeight-320)),zIndex:600,width:"208px",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.16)",padding:"8px",display:"flex",flexDirection:"column",gap:"2px",fontFamily:"'Source Sans 3',sans-serif"}}>
          <div style={{fontSize:"10.5px",fontWeight:700,color:"rgba(0,0,0,0.4)",padding:"2px 6px 5px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={`${menuStudent.name} — ${menuCol.name}`}>{menuStudent.name} · {menuCol.name}</div>
          {noteDraft===null?(
            <>
              {CHECK_STATUSES.map(s=>{
                const cur=cellStatus(data,menuCol.id,menuStudent.id)===s.id;
                return(
                  <button className={`cpb cpb-item${cur?" on":""}`} key={s.id} onClick={()=>setStatus(menuCol.id,menuStudent.id,s.id)} title={`Set to ${s.label}`}
                    style={{display:"flex",alignItems:"center",gap:"8px",padding:"5px 6px",borderRadius:"7px",border:"none",background:cur?"#f0f1f4":"transparent",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",textAlign:"left"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background=cur?"#f0f1f4":"transparent"}>
                    <span style={{width:"22px",height:"18px",borderRadius:"5px",background:s.bg,border:"1px solid rgba(0,0,0,0.08)",color:s.text,fontSize:"11px",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.short}</span>
                    <span style={{flex:1,fontSize:"12px",fontWeight:cur?700:500,color:"#1a1a2e"}}>{s.label}</span>
                    {cur&&<span style={{fontSize:"11px",color:"#2e6bce"}}>✓</span>}
                  </button>
                );
              })}
              <div style={{height:"1px",background:"rgba(0,0,0,0.07)",margin:"3px 0"}}/>
              <button className="cpb cpb-item" onClick={()=>setNoteDraft(data.cells?.[menuCol.id]?.[menuStudent.id]?.note||'')} title="Attach a short note to this cell" style={{padding:"5px 6px",borderRadius:"7px",border:"none",background:"transparent",cursor:"pointer",fontSize:"12px",fontWeight:600,color:"rgba(0,0,0,0.55)",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >{data.cells?.[menuCol.id]?.[menuStudent.id]?.note?"Edit note…":"Add note…"}</button>
            </>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"6px",padding:"2px 4px 4px"}}>
              <input value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveNote(menuCol.id,menuStudent.id,noteDraft.trim());}} autoFocus placeholder="Note…" title="A short note for this student on this item" style={ckInputStyle}/>
              <div style={{display:"flex",gap:"6px"}}>
                <button className="cpb cpb-primary" onClick={()=>saveNote(menuCol.id,menuStudent.id,noteDraft.trim())} title="Save the note" style={{flex:1,padding:"5px",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"11.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Save</button>
                <button className="cpb" onClick={()=>setNoteDraft(null)} title="Go back without saving" style={{...ckSmallBtn,flex:1,textAlign:"center",padding:"5px"}}>Back</button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Copy-to-class popover */}
      {copyMenu&&createPortal(
        <div className="cp-pop" ref={copyMenuRef} onMouseDown={e=>e.stopPropagation()} style={{position:"fixed",left:Math.max(8,Math.min(copyMenu.x-232,window.innerWidth-240)),top:Math.min(copyMenu.y,window.innerHeight-300),zIndex:600,width:"232px",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.16)",padding:"10px",display:"flex",flexDirection:"column",gap:"6px",fontFamily:"'Source Sans 3',sans-serif"}}>
          <div style={{fontSize:"10.5px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(0,0,0,0.35)"}}>Copy to…</div>
          <div style={{maxHeight:"180px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"2px"}}>
            {otherClasses.map(c=>(
              <label key={c.id} title={`Add the ticked items to ${c.name}'s checklist`} style={{display:"flex",alignItems:"center",gap:"8px",padding:"4px 4px",borderRadius:"6px",cursor:"pointer",fontSize:"12.5px",color:"#1a1a2e"}}>
                <input type="checkbox" checked={copyTargets.includes(c.id)} onChange={()=>setCopyTargets(t=>t.includes(c.id)?t.filter(x=>x!==c.id):[...t,c.id])}/>
                <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
              </label>
            ))}
          </div>
          <label title="Untick to copy the items without their due dates and times" style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 4px 4px",fontSize:"12px",color:"rgba(0,0,0,0.6)",cursor:"pointer",borderTop:"1px solid rgba(0,0,0,0.07)"}}>
            <input type="checkbox" checked={copyDue} onChange={()=>setCopyDue(v=>!v)}/>Keep due dates
          </label>
          <div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.4)",lineHeight:1.35,padding:"0 4px"}}>Copies the item name, colour and flag settings, added as new columns at the end. Students' marks aren't copied.</div>
          <button className="cpb cpb-primary" onClick={doCopy} disabled={!copyTargets.length} title="Copy the ticked items to the chosen classes" style={{padding:"7px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:600,cursor:copyTargets.length?"pointer":"default",opacity:copyTargets.length?1:0.4,fontFamily:"'Source Sans 3',sans-serif"}}>Copy {selected.length} item{selected.length===1?'':'s'}{copyTargets.length?` to ${copyTargets.length} class${copyTargets.length===1?'':'es'}`:''}</button>
        </div>,
        document.body
      )}

      {/* Item editor */}
      {colEditor&&editorCol&&(
        <ChecklistColumnEditor key={editorCol.id} col={editorCol} x={colEditor.x} y={colEditor.y} categories={categories} onChangeCategories={onChangeCategories} boxRef={colEditorRef}
          onUpdate={patch=>updateCol(editorCol.id,patch)} onBulk={status=>bulkMark(editorCol.id,status)} onDelete={()=>deleteCol(editorCol.id)}/>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB STRIP
   ══════════════════════════════════════════════════════════ */
/* ── Settings — currently just the board colour (whiteboard/blackboard),
   which theme's the Timer, Seating and Groups screens via CSS variables set
   on the app root (see TeacherApp's data-theme attribute). ── */
function SettingsModal({theme,onSetTheme,timerStyle,onSetTimerStyle,onClose}){
  const[dataMsg,setDataMsg]=useState(null);       // {ok, text} after an export or a failed import
  const[pendingImport,setPendingImport]=useState(null); // {name, data, classNames} waiting for "Replace" to be confirmed
  const fileRef=useRef(null);
  const[autoBackups]=useState(()=>readAutoBackups()); // newest first
  /* Everything the app saves (classes, seating, groups, checklists, settings) goes into one JSON file, so it can move between computers */
  const exportData=async()=>{
    try{
      const{keys}=await window.storage.list();
      const data={};
      for(const k of keys){const r=await window.storage.get(k);if(r)data[k]=r.value;}
      const blob=new Blob([JSON.stringify({app:'ClassPanels',format:1,exportedAt:new Date().toISOString(),data})],{type:'application/json'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);a.download=`ClassPanels-backup-${new Date().toLocaleDateString('sv')}.json`;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),2000);
      setDataMsg({ok:true,text:`Backup saved (${keys.length} items). It has your students' names, so keep it private.`});
    }catch(e){setDataMsg({ok:false,text:"Couldn't make the backup."});}
  };
  const pickImport=async e=>{
    const f=e.target.files?.[0];e.target.value='';
    if(!f)return;
    try{
      const obj=JSON.parse(await f.text());
      if(obj?.app!=='ClassPanels'||!obj.data||typeof obj.data!=='object')throw new Error('not a backup');
      let classNames=[];
      try{classNames=JSON.parse(obj.data['ta-classes']||'[]').map(c=>c.name);}catch(err){}
      setDataMsg(null);setPendingImport({name:f.name,data:obj.data,classNames});
    }catch(err){setPendingImport(null);setDataMsg({ok:false,text:"That file isn't a ClassPanels backup."});}
  };
  const confirmImport=async()=>{
    try{
      await autoBackup('before restore'); // one more safety net, on top of the recovery copy below
      // keep a recovery copy of what's here now, in case the wrong file was picked
      try{localStorage.setItem('classboard-storage-before-import',localStorage.getItem('classboard-storage')||'');}catch(err){}
      const{keys}=await window.storage.list();
      for(const k of keys)await window.storage.delete(k);
      for(const[k,v]of Object.entries(pendingImport.data))await window.storage.set(k,v);
      window.location.reload(); // the app reads its saved data on start
    }catch(e){setPendingImport(null);setDataMsg({ok:false,text:"The restore didn't finish."});}
  };
  /* Restore from an automatic backup goes through the same confirm-then-replace step as an imported file */
  const fmtBackupTime=iso=>{try{return new Date(iso).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}catch(e){return'?';}};
  const pickAutoBackup=b=>{
    let classNames=[];
    try{classNames=JSON.parse(b.data['ta-classes']||'[]').map(c=>c.name);}catch(err){}
    setDataMsg(null);setPendingImport({name:`automatic backup from ${fmtBackupTime(b.exportedAt)}`,data:b.data,classNames});
  };
  const options=[
    {id:'whiteboard',label:'Whiteboard',bg:'linear-gradient(180deg,#f8f9fb,#eef1f5)',text:'#1a1a2e'},
    {id:'blackboard',label:'Blackboard',bg:'linear-gradient(180deg,#1c3829,#0f2418)',text:'#eef3e8'},
  ];
  return(
    <div style={{position:"fixed",inset:0,zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div className="cp-pop" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"18px",padding:"24px 26px",boxShadow:"0 8px 48px rgba(0,0,0,0.2)",width:"90%",maxWidth:"380px",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"18px"}}>
          <h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Settings</h2>
          <button className="cpb cpb-ghost" onClick={onClose} style={{background:"none",border:"none",fontSize:"20px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.3)",textTransform:"uppercase",marginBottom:"10px"}}>Board colour</div>
        <div style={{display:"flex",gap:"10px"}}>
          {options.map(opt=>{
            const active=theme===opt.id;
            return(
              <button className={`cpb cpb-card${active?" on":""}`} key={opt.id} onClick={()=>onSetTheme(opt.id)} style={{flex:1,padding:0,borderRadius:"12px",border:active?"2px solid #2e6bce":"2px solid rgba(0,0,0,0.08)",cursor:"pointer",overflow:"hidden",background:"#fff",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}>
                <div style={{height:"56px",background:opt.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:"12px",fontWeight:700,color:opt.text}}>Aa</span>
                </div>
                <div style={{padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:"12px",fontWeight:700,color:"#1a1a2e"}}>{opt.label}</span>
                  {active&&<span style={{fontSize:"11px",color:"#2e6bce"}}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{fontSize:"11px",color:"rgba(0,0,0,0.35)",marginTop:"12px",lineHeight:1.5}}>Changes how the Timer, Seating and Groups screens look — handy for matching whatever you're projecting onto.</div>
        <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.3)",textTransform:"uppercase",margin:"22px 0 10px"}}>Timer style</div>
        <div style={{display:"flex",gap:"10px"}}>
          {[
            {id:'liquid',label:'Liquid',help:"The original — a circle that drains like water",preview:<Liquid progress={0.6} size={56} running colorIdx={0}/>},
            {id:'hourglass',label:'Hourglass',help:"Sand runs from the top bulb to the bottom",preview:<Hourglass progress={0.6} size={50} running colorIdx={2}/>},
            {id:'blocks',label:'Retro blocks',help:"Pixel digits and a block meter that drains like an old arcade game",preview:<RetroBlocks small time="05:00" progress={0.6} running colorIdx={1}/>},
          ].map(opt=>{
            const active=timerStyle===opt.id;
            return(
              <button className={`cpb cpb-card${active?" on":""}`} key={opt.id} onClick={()=>{audio.style=opt.id;audio.ding();onSetTimerStyle(opt.id);}} title={opt.help} style={{flex:1,minWidth:0,padding:0,borderRadius:"12px",border:active?"2px solid #2e6bce":"2px solid rgba(0,0,0,0.08)",cursor:"pointer",overflow:"hidden",background:"#fff",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}>
                <div style={{height:"84px",background:"#f8f9fb",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px",pointerEvents:"none"}}>{opt.preview}</div>
                <div style={{padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"4px"}}>
                  <span style={{fontSize:"11.5px",fontWeight:700,color:"#1a1a2e",whiteSpace:"nowrap"}}>{opt.label}</span>
                  {active&&<span style={{fontSize:"11px",color:"#2e6bce"}}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{fontSize:"11px",color:"rgba(0,0,0,0.35)",marginTop:"12px",lineHeight:1.5}}>How running timers are drawn — on the Timer panel and in full-screen projector view. Each style has its own sounds; picking one plays a sample.</div>
        <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.3)",textTransform:"uppercase",margin:"22px 0 10px"}}>Your data</div>
        <div style={{display:"flex",gap:"10px"}}>
          <button className="cpb" onClick={exportData} title="Save all your classes, students, seating, groups and checklists to a backup file" style={{flex:1,padding:"9px 8px",borderRadius:"10px",border:"2px solid rgba(0,0,0,0.08)",background:"#fff",cursor:"pointer",fontSize:"12px",fontWeight:700,color:"#1a1a2e",fontFamily:"'Source Sans 3',sans-serif"}}>⬇ Export backup</button>
          <button className="cpb" onClick={()=>fileRef.current?.click()} title="Load a backup file made with Export backup — it replaces what is on this computer" style={{flex:1,padding:"9px 8px",borderRadius:"10px",border:"2px solid rgba(0,0,0,0.08)",background:"#fff",cursor:"pointer",fontSize:"12px",fontWeight:700,color:"#1a1a2e",fontFamily:"'Source Sans 3',sans-serif"}}>⬆ Import backup</button>
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={pickImport} style={{display:"none"}}/>
        </div>
        {dataMsg&&<div style={{fontSize:"11.5px",marginTop:"10px",lineHeight:1.5,color:dataMsg.ok?"#3a8a4e":"#c44",fontWeight:600}}>{dataMsg.text}</div>}
        {pendingImport&&(
          <div style={{marginTop:"10px",padding:"10px 12px",borderRadius:"10px",background:"#fdf5e6",border:"1px solid rgba(184,133,10,0.3)"}}>
            <div style={{fontSize:"12px",fontWeight:700,color:"#1a1a2e",lineHeight:1.45}}>Replace everything on this computer with "{pendingImport.name}"?</div>
            <div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.55)",marginTop:"3px",lineHeight:1.45}}>{pendingImport.classNames.length?`It has ${pendingImport.classNames.length} class${pendingImport.classNames.length===1?'':'es'}: ${pendingImport.classNames.join(', ')}.`:"It has no classes."} Your current classes and checklists will be swapped for these.</div>
            <div style={{display:"flex",gap:"8px",marginTop:"9px"}}>
              <button className="cpb cpb-primary" onClick={confirmImport} title="Replace the data on this computer with the backup" style={{flex:1,padding:"7px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Replace</button>
              <button className="cpb" onClick={()=>setPendingImport(null)} title="Keep what's here and do nothing" style={{flex:1,padding:"7px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.12)",background:"#fff",color:"rgba(0,0,0,0.6)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{fontSize:"11px",color:"rgba(0,0,0,0.35)",marginTop:"12px",lineHeight:1.5}}>Move your classes between computers: export here, then import on the other one. Import replaces what's there.</div>
        <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.3)",textTransform:"uppercase",margin:"22px 0 10px"}}>Automatic backups</div>
        {autoBackups.length===0
          ?<div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.45)",lineHeight:1.5}}>None yet. One is made each day the app is opened.</div>
          :<div title="Backups the app made by itself, newest first" style={{maxHeight:"132px",overflowY:"auto",border:"1px solid rgba(0,0,0,0.08)",borderRadius:"10px"}}>
            {autoBackups.map((b,i)=>(
              <div key={b.exportedAt+i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 10px",borderTop:i?"1px solid rgba(0,0,0,0.06)":"none"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"12px",fontWeight:700,color:"#1a1a2e"}}>{fmtBackupTime(b.exportedAt)}</div>
                  <div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.45)"}}>{b.reason}</div>
                </div>
                <button className="cpb" onClick={()=>pickAutoBackup(b)} title={`Go back to how everything was on ${fmtBackupTime(b.exportedAt)} (you'll be asked to confirm first)`} style={{padding:"5px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.12)",background:"#fff",cursor:"pointer",fontSize:"11.5px",fontWeight:700,color:"#1a1a2e",fontFamily:"'Source Sans 3',sans-serif"}}>Restore</button>
              </div>
            ))}
          </div>}
        <div style={{fontSize:"11px",color:"rgba(0,0,0,0.35)",marginTop:"10px",lineHeight:1.5}}>The app keeps the last {AUTO_BACKUP_KEEP} of these. {window.electronAPI?.writeBackup?'Copies are also saved as files in Documents \u25B8 ClassPanels Backups on this Mac.':'In the Mac app they are also saved as files in Documents \u25B8 ClassPanels Backups.'}</div>
      </div>
    </div>
  );
}

/* ── Help mode overlay — while active, hovering any element that carries a
   native "title" (nearly everything already does, from all the tooltips
   built up over time) shows it as a proper pop-out box instead of the slow
   native browser tooltip. The title attribute is stashed on the element
   while hovered so the two don't show at once, and restored on mouse-out.
   Pure hover layer: it never intercepts clicks, so normal navigation still
   works underneath it. ── */
function HelpOverlay({active}){
  const[hover,setHover]=useState(null); // {text, rect, el}
  useEffect(()=>{
    if(!active)return;
    const restore=el=>{
      if(el.dataset.helpTitle!=null){el.setAttribute('title',el.dataset.helpTitle);delete el.dataset.helpTitle;}
    };
    const onOver=e=>{
      const el=e.target.closest?.('[title]');
      if(!el)return;
      const text=el.getAttribute('title');
      if(!text)return;
      el.dataset.helpTitle=text;
      el.removeAttribute('title');
      setHover({text,rect:el.getBoundingClientRect(),el});
    };
    const onOut=e=>{
      const el=e.target.closest?.('[data-help-title]');
      if(!el)return;
      restore(el);
      setHover(h=>h&&h.el===el?null:h);
    };
    document.addEventListener('mouseover',onOver,true);
    document.addEventListener('mouseout',onOut,true);
    return()=>{
      document.removeEventListener('mouseover',onOver,true);
      document.removeEventListener('mouseout',onOut,true);
      document.querySelectorAll('[data-help-title]').forEach(restore);
      setHover(null);
    };
  },[active]);

  if(!active)return null;
  return(
    <>
      <div className="cp-toast" style={{position:"fixed",left:"50%",bottom:"16px",transform:"translateX(-50%)",zIndex:900,background:"#1a1a2e",color:"#fff",padding:"7px 16px",borderRadius:"20px",fontSize:"12px",fontWeight:600,fontFamily:"'Source Sans 3',sans-serif",boxShadow:"0 6px 24px rgba(0,0,0,0.28)",pointerEvents:"none",whiteSpace:"nowrap"}}>
        ❓ Help mode — hover to learn, double-click anywhere (or the ❓) to exit
      </div>
      {hover&&(()=>{
        const{rect,text}=hover;
        const maxW=260;
        const left=Math.max(maxW/2+10,Math.min(window.innerWidth-maxW/2-10,rect.left+rect.width/2));
        const spaceBelow=window.innerHeight-rect.bottom;
        const above=spaceBelow<90&&rect.top>90;
        const top=above?rect.top-8:rect.bottom+8;
        return(
          <div className="cp-pop" style={{position:"fixed",left,top,transform:`translate(-50%, ${above?'-100%':'0'})`,zIndex:901,maxWidth:maxW+"px",background:"#fff",color:"#1a1a2e",padding:"10px 13px",borderRadius:"10px",boxShadow:"0 8px 32px rgba(0,0,0,0.22)",border:"1px solid rgba(0,0,0,0.08)",fontSize:"12.5px",lineHeight:1.5,fontFamily:"'Source Sans 3',sans-serif",pointerEvents:"none",animation:"fadeIn 0.12s ease"}}>
            {text}
          </div>
        );
      })()}
    </>
  );
}

function TabStrip({openPanels,onToggle,onTabClickFromManageSeating,timerStatus,classes,activeClassId,onSetActiveClass,onNewClass,onManageClass,onDeleteClass,manageSeatingOpen,onToggleManageSeating,manageGroupsOpen,onToggleManageGroups,onOpenSettings,helpMode,onToggleHelp}){
  const tabs=[
    {id:"timer",label:"Timer",icon:"⏱",fill:"var(--cp-chair-3)",help:"Quick countdown timers, or build a custom multi-step one with named tasks, alarms and cold call."},
    {id:"seating",label:"Seating",icon:"🪑",fill:"var(--cp-chair-1)",help:"See and adjust who's sitting where right now."},
    {id:"groups",label:"Groups",icon:"👥",fill:"var(--cp-chair-0)",help:"Randomly build student groups/teams, with rules for who should (or shouldn't) end up together."},
    {id:"checklist",label:"Checklist",icon:"✅",fill:"var(--cp-chair-4)",help:"A grid of work and tasks — who's done what, who's late, who owes what."},
  ];
  const anyManageOpen=manageSeatingOpen||manageGroupsOpen;

  /* Manage Seating / Manage Groups always show as the compact "🗂 ▾" dropdown
     now rather than full-size solid blue/green buttons — those clashed with
     the pastel banner, and the dropdown's colour-coding lives in its menu
     items instead (see below) without needing width-based show/hide logic
     (which also had a real bug: it under-counted the room the gear+"···"
     cluster was already using, so the full buttons could overlap the tabs
     at some widths instead of collapsing). */
  const[overflowOpen,setOverflowOpen]=useState(false);
  const overflowRef=useRef(null);
  useEffect(()=>{
    if(!overflowOpen)return;
    const h=e=>{if(overflowRef.current&&!overflowRef.current.contains(e.target))setOverflowOpen(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[overflowOpen]);

  /* Same trick for the tab buttons themselves — at narrow widths they used to
     just overflow the center strip and visually overlap the right-side
     buttons. Collapse them into a single "Panels" dropdown once they don't
     fit, so nothing ever overlaps. */
  const tabsOuterRef=useRef(null);
  const tabsMeasureRef=useRef(null);
  const[tabsCollapsed,setTabsCollapsed]=useState(false);
  const[tabsMenuOpen,setTabsMenuOpen]=useState(false);
  const tabsMenuRef=useRef(null);
  useEffect(()=>{
    const outer=tabsOuterRef.current,measure=tabsMeasureRef.current;
    if(!outer||!measure)return;
    const check=()=>setTabsCollapsed(measure.scrollWidth>outer.clientWidth+1);
    check();
    const ro=new ResizeObserver(check);
    ro.observe(outer);ro.observe(measure);
    document.fonts?.ready?.then(check);
    return()=>ro.disconnect();
  },[]);
  useEffect(()=>{
    if(!tabsMenuOpen)return;
    const h=e=>{if(tabsMenuRef.current&&!tabsMenuRef.current.contains(e.target))setTabsMenuOpen(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[tabsMenuOpen]);

  /* Class buttons: shown only when all of them fit. While shown, remember the width
     they need; once folded into the Classes menu, bring them back when the space
     reaches that width again. (No hidden copy, so nothing invisible to trip over.) */
  const chipsOuterRef=useRef(null);
  const chipsRowRef=useRef(null);
  const chipsNeedRef=useRef(0);
  const[chipsCollapsed,setChipsCollapsed]=useState(false);
  const classesSig=classes.map(c=>c.id+c.name).join('|');
  useEffect(()=>{setChipsCollapsed(false);},[classesSig]); // classes changed: show and re-measure
  useEffect(()=>{
    const outer=chipsOuterRef.current;if(!outer)return;
    const check=()=>{
      const row=chipsRowRef.current;
      if(row){ // showing: fold away if they no longer fit
        chipsNeedRef.current=row.scrollWidth;
        if(row.scrollWidth>row.clientWidth+1)setChipsCollapsed(true);
      }else if(chipsNeedRef.current&&outer.clientWidth>=chipsNeedRef.current+1)setChipsCollapsed(false);
    };
    check();
    const ro=new ResizeObserver(check);
    ro.observe(outer);
    document.fonts?.ready?.then(check);
    return()=>ro.disconnect();
  },[chipsCollapsed,classesSig]);

  const renderTabButton=tab=>{
    const isOpen=!anyManageOpen&&openPanels[tab.id];
    const showBadge=tab.id==="timer"&&!isOpen&&timerStatus?.running;
    return(
      <button key={tab.id} className={`no-drag ${cpc("tab",isOpen)}`} onClick={()=>{if(anyManageOpen)onTabClickFromManageSeating(tab.id);else onToggle(tab.id);}} title={tab.help} style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 13px",fontSize:"12.5px",whiteSpace:"nowrap",flexShrink:0,"--tab-fill":tab.fill}}
      >
        <span style={{fontSize:"13px"}}>{tab.icon}</span>
        <span>{tab.label}</span>
        {showBadge&&<span style={{fontSize:"10px",fontWeight:700,color:"#2b2118",background:"#fffaf0",border:"1px solid #2b2118",padding:"0 6px",borderRadius:"999px",fontVariantNumeric:"tabular-nums",marginLeft:"2px"}}>{timerStatus.timeDisplay}</span>}
      </button>
    );
  };

  return(
    <div className="drag-bar" style={{display:"flex",alignItems:"center",height:"50px",padding:"0 12px",background:"repeating-linear-gradient(115deg,rgba(255,250,240,0.4) 0px,rgba(255,250,240,0.4) 1px,transparent 1px,transparent 5px),linear-gradient(180deg,#e0c1a0,#d1a97e)",borderBottom:"1px solid rgba(120,85,55,0.22)",flexShrink:0,zIndex:100,position:"relative"}}>
      <div style={{width:"72px",flexShrink:0}}/>
      {/* Chips and tabs each get an equal share (flex 1 1 0, minWidth 0), so neither can push into the other or the right-hand cluster; the tabs already collapse to "Panels" when their share is too small. */}
      {/* Classes ▾ always; the class buttons beside it only when every one fits, otherwise they're listed in the menu */}
      <div className="no-drag" style={{flexShrink:0,marginRight:"6px"}}><DotsMenu classes={classes} activeClassId={activeClassId} onSetActiveClass={onSetActiveClass} onNewClass={onNewClass} onManageClass={onManageClass} onDeleteClass={onDeleteClass} showList={chipsCollapsed}/></div>
      <div ref={chipsOuterRef} style={{flex:"1 1 0",minWidth:0,display:"flex",alignItems:"center",position:"relative",overflow:"hidden"}}>
        {!chipsCollapsed&&<ClassChips classes={classes} activeClassId={activeClassId} onSetActiveClass={onSetActiveClass} measureRef={chipsRowRef}/>}
      </div>
      <div ref={tabsOuterRef} style={{display:"flex",gap:"3px",flex:"1 1 0",minWidth:0,justifyContent:"center",alignItems:"center",position:"relative"}}>
        {/* Hidden always-full-size copy, purely to measure whether all four
            tabs would fit — never shown, never interactive. */}
        <div ref={tabsMeasureRef} aria-hidden="true" style={{position:"absolute",top:0,left:"50%",visibility:"hidden",pointerEvents:"none",display:"flex",gap:"3px",alignItems:"center",whiteSpace:"nowrap"}}>
          {tabs.map(renderTabButton)}
        </div>
        {tabsCollapsed?(
          <div ref={tabsMenuRef} className="no-drag" style={{position:"relative"}}>
            <button className={`cpb cpb-tab${tabsMenuOpen?" on":""}`} onClick={()=>setTabsMenuOpen(o=>!o)} title="Show panels" style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"8px",border:"1px solid rgba(74,49,28,0.2)",background:tabsMenuOpen?"rgba(255,255,255,0.3)":"transparent",color:"rgba(74,49,28,0.75)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
              onMouseEnter={e=>{if(!tabsMenuOpen)e.currentTarget.style.background="rgba(255,255,255,0.3)";}}
              onMouseLeave={e=>{if(!tabsMenuOpen)e.currentTarget.style.background="transparent";}}
            >
              <span>☰ Panels</span>
              {timerStatus?.running&&!openPanels.timer&&!anyManageOpen&&<span style={{fontSize:"9px",fontWeight:700,color:"#2b2118",background:"#fffaf0",border:"1px solid #2b2118",padding:"0 5px",borderRadius:"999px",fontVariantNumeric:"tabular-nums"}}>{timerStatus.timeDisplay}</span>}
              <span style={{fontSize:"9px"}}>▾</span>
            </button>
            {tabsMenuOpen&&(
              <div className="cp-pop" style={{position:"absolute",left:"50%",transform:"translateX(-50%)",top:"calc(100% + 6px)",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"12px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:"170px",zIndex:400,overflow:"hidden",animation:"fadeIn 0.15s ease",padding:"6px"}}>
                {tabs.map(tab=>{
                  const isOpen=!anyManageOpen&&openPanels[tab.id];
                  const showBadge=tab.id==="timer"&&!isOpen&&timerStatus?.running;
                  return(
                    <button className={`cpb cpb-item${isOpen?" on":""}`} key={tab.id} onClick={()=>{if(anyManageOpen)onTabClickFromManageSeating(tab.id);else onToggle(tab.id);}} title={tab.help} style={{display:"flex",alignItems:"center",gap:"7px",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:"8px",border:"none",background:isOpen?"rgba(46,107,206,0.1)":"none",color:"#1a1a2e",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                      onMouseEnter={e=>e.currentTarget.style.background=isOpen?"rgba(46,107,206,0.15)":"rgba(0,0,0,0.05)"}
                      onMouseLeave={e=>e.currentTarget.style.background=isOpen?"rgba(46,107,206,0.1)":"none"}
                    >
                      <span style={{fontSize:"13px"}}>{tab.icon}</span>
                      <span style={{flex:1}}>{tab.label}</span>
                      {isOpen&&<span style={{fontSize:"11px",color:"#2e6bce"}}>✓</span>}
                      {showBadge&&<span style={{fontSize:"9px",fontWeight:700,color:"#2b2118",background:"#fffaf0",border:"1px solid #2b2118",padding:"0 5px",borderRadius:"999px",fontVariantNumeric:"tabular-nums"}}>{timerStatus.timeDisplay}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ):tabs.map(renderTabButton)}
      </div>
      <div style={{width:"auto",minWidth:0,display:"flex",gap:"6px",justifyContent:"flex-end",alignItems:"center",flexShrink:1,position:"relative"}}>
        <div ref={overflowRef} className="no-drag" style={{position:"relative"}}>
          <button className={`cpb cpb-tab${overflowOpen?" on":""}`} onClick={()=>setOverflowOpen(o=>!o)} title="Manage seating & groups" style={{display:"flex",alignItems:"center",gap:"3px",padding:"5px 10px",borderRadius:"8px",border:"1px solid rgba(74,49,28,0.2)",background:overflowOpen?"rgba(255,255,255,0.3)":"transparent",color:"rgba(74,49,28,0.75)",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
            onMouseEnter={e=>{if(!overflowOpen)e.currentTarget.style.background="rgba(255,255,255,0.3)";}}
            onMouseLeave={e=>{if(!overflowOpen)e.currentTarget.style.background="transparent";}}
          >🗂 <span style={{fontSize:"9px"}}>▾</span></button>
          {overflowOpen&&(
            <div className="cp-pop" style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"12px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:"190px",zIndex:400,overflow:"hidden",animation:"fadeIn 0.15s ease",padding:"6px"}}>
              <button className={`cpb cpb-item${manageSeatingOpen?" on":""}`} onClick={()=>{onToggleManageSeating();setOverflowOpen(false);}} title="Full room editor — build the layout, tag seats, save layouts, run randomised seating" style={{display:"flex",alignItems:"center",gap:"7px",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:"8px",border:"none",background:manageSeatingOpen?"rgba(46,107,206,0.1)":"none",color:"#1a1a2e",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(46,107,206,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.background=manageSeatingOpen?"rgba(46,107,206,0.1)":"none"}
              >🗂 Manage Seating</button>
              <button className={`cpb cpb-item${manageGroupsOpen?" on-mint on":""}`} onClick={()=>{onToggleManageGroups();setOverflowOpen(false);}} title="Build random student groups/teams — settings, fairness rules, drag-to-fix" style={{display:"flex",alignItems:"center",gap:"7px",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:"8px",border:"none",background:manageGroupsOpen?"rgba(58,138,78,0.1)":"none",color:"#1a1a2e",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(58,138,78,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.background=manageGroupsOpen?"rgba(58,138,78,0.1)":"none"}
              >🗂 Manage Groups</button>
            </div>
          )}
        </div>
        <button className="no-drag cpb cpb-tab" onClick={onOpenSettings} title="Settings — whiteboard/blackboard theme" style={{background:"none",border:"1px solid rgba(74,49,28,0.22)",borderRadius:"6px",padding:"4px 9px",cursor:"pointer",color:"rgba(74,49,28,0.65)",fontSize:"15px",lineHeight:1,fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(74,49,28,0.4)";e.currentTarget.style.color="rgba(74,49,28,0.9)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(74,49,28,0.22)";e.currentTarget.style.color="rgba(74,49,28,0.65)";}}
        >⚙</button>
        <button className={`no-drag cpb cpb-tab${helpMode?" on":""}`} data-help-btn onClick={onToggleHelp} title={helpMode?"You are here! Click again or double click to leave help mode.":"Turn on help mode — hover anything to see what it does"} style={{background:helpMode?"#2e6bce":"none",border:`1px solid ${helpMode?"#2e6bce":"rgba(74,49,28,0.22)"}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer",color:helpMode?"#fff":"rgba(74,49,28,0.65)",fontSize:"15px",fontWeight:700,lineHeight:1,fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}}
          onMouseEnter={e=>{if(!helpMode){e.currentTarget.style.borderColor="rgba(74,49,28,0.4)";e.currentTarget.style.color="rgba(74,49,28,0.9)";}}}
          onMouseLeave={e=>{if(!helpMode){e.currentTarget.style.borderColor="rgba(74,49,28,0.22)";e.currentTarget.style.color="rgba(74,49,28,0.65)";}}}
        >❓</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT APP
   ══════════════════════════════════════════════════════════ */
export default function TeacherApp(){
  const[openPanels,setOpenPanels]=useState({timer:true,seating:false,groups:false,checklist:false});
  const[manageSeatingOpen,setManageSeatingOpen]=useState(false);
  const[manageGroupsOpen,setManageGroupsOpen]=useState(false);
  const groupsGuardRef=useRef(null); // Manage Groups registers its "finalise before you go?" check here
  const withGroupsGuard=useCallback(proceed=>{if(groupsGuardRef.current&&groupsGuardRef.current(proceed))return;proceed();},[]);
  const[timerStatus,setTimerStatus]=useState({running:false,timeDisplay:null});
  const[classes,setClasses]=useState([SAMPLE_CLASS]);
  const[activeClassId,setActiveClassId]=useState(SAMPLE_CLASS.id);
  const[coldCallStudent,setColdCallStudent]=useState(null);
  const[editingClass,setEditingClass]=useState(null);
  const[showSettings,setShowSettings]=useState(false);
  const[theme,setTheme]=useState('whiteboard'); // 'whiteboard' | 'blackboard' — themes the Timer/Seating/Groups screens
  useEffect(()=>{load('ta-theme','whiteboard').then(setTheme);},[]);
  const handleSetTheme=useCallback(next=>{setTheme(next);save('ta-theme',next);},[]);
  const[timerStyle,setTimerStyle]=useState('liquid'); // 'liquid' | 'hourglass' | 'blocks' — how timers are drawn
  useEffect(()=>{load('ta-timer-style','liquid').then(v=>setTimerStyle(['liquid','hourglass','blocks'].includes(v)?v:'liquid'));},[]);
  const handleSetTimerStyle=useCallback(next=>{setTimerStyle(next);save('ta-timer-style',next);},[]);

  /* ── Help mode — hover anything to see what it does, in a "title"
     attribute most buttons already carry. Clicking still works normally
     (the overlay never intercepts clicks), so a teacher can click through
     into a panel and keep hovering around in there. Double-clicking
     anywhere — not just the Help button — exits, on top of the normal
     toggle-the-button-off route. ── */
  const[helpMode,setHelpMode]=useState(false);
  useEffect(()=>{
    if(!helpMode)return;
    const exitOnDblClick=()=>setHelpMode(false);
    document.addEventListener('dblclick',exitOnDblClick,true);
    return()=>document.removeEventListener('dblclick',exitOnDblClick,true);
  },[helpMode]);

  /* Checklist state lives here (not in the Checklist panel) so the Seating and
     Groups views can show flag dots from it without polling storage. Edits go
     through updateChecklist, which also saves. */
  const[checklist,setChecklist]=useState(EMPTY_CHECKLIST);
  const checklistRef=useRef(EMPTY_CHECKLIST); // latest value, so back-to-back edits in one handler don't clobber each other
  const[checkCategories,setCheckCategories]=useState([]); // [{colour,label}] — what each category colour means, shared by every class
  const[showFlagsSeating,setShowFlagsSeating]=useState(true);
  const[showFlagsGroups,setShowFlagsGroups]=useState(false);
  const[now,setNow]=useState(()=>Date.now());
  useEffect(()=>{ // so blank cells turn red when a due time passes while the app is open
    const tick=()=>setNow(Date.now());
    const t=setInterval(tick,60000);
    window.addEventListener('focus',tick);
    return()=>{clearInterval(t);window.removeEventListener('focus',tick);};
  },[]);
  useEffect(()=>{
    load('checklist-categories',[]).then(v=>setCheckCategories(Array.isArray(v)?v:[]));
    load('seating-show-flags',true).then(v=>setShowFlagsSeating(v!==false));
    load('groups-show-flags',false).then(v=>setShowFlagsGroups(v===true));
  },[]);
  const updateCheckCategories=useCallback(next=>{setCheckCategories(next);save('checklist-categories',next);},[]);
  const handleSetShowFlagsSeating=useCallback(v=>{setShowFlagsSeating(v);save('seating-show-flags',v);},[]);
  const handleSetShowFlagsGroups=useCallback(v=>{setShowFlagsGroups(v);save('groups-show-flags',v);},[]);
  /* Accepts the next checklist, or a function from the latest checklist to the next */
  const updateChecklist=useCallback(nextOrFn=>{
    const next=typeof nextOrFn==='function'?nextOrFn(checklistRef.current):nextOrFn;
    checklistRef.current=next;
    setChecklist(next);
    if(activeClassId)save(`checklist-${activeClassId}`,next);
  },[activeClassId]);

  /* Snapshot everything once a day, as early as possible (before this session changes anything) */
  /* Setups (Phase 5) first, which backs up before it migrates, then the daily backup and a trash clear-out */
  useEffect(()=>{ensureSetupsMigrated().then(()=>autoBackupIfNewDay()).then(()=>purgeTrash());},[]);

  /* Load persisted classes; fall back to sample class on first launch */
  useEffect(()=>{
    Promise.all([load("ta-classes",null),load("ta-active-class",null)]).then(([saved,savedId])=>{
      if(saved&&saved.length>0){
        setClasses(saved);
        const id=saved.find(c=>c.id===savedId)?savedId:saved[0].id;
        setActiveClassId(id);
      }
      // else: keep SAMPLE_CLASS (already in state)
    });
  },[]);

  const persistClasses=useCallback((cls,activeId)=>{
    const toSave=cls.filter(c=>!c.isDemo);
    if(toSave.length>0){save("ta-classes",toSave);save("ta-active-class",activeId);}
  },[]);

  /* Update one student's tags from wherever they're edited (Manage class, or
     the seating views' click-a-name popover) */
  const updateStudentTags=useCallback((classId,studentId,tags)=>{
    setClasses(prev=>{
      const next=prev.map(c=>c.id===classId?{...c,students:c.students.map(s=>s.id===studentId?{...s,tags}:s)}:c);
      persistClasses(next,activeClassId);
      return next;
    });
  },[activeClassId,persistClasses]);

  const activeClass=classes.find(c=>c.id===activeClassId)||null;

  /* Class setups (Phase 5): the active class's setups-<class>, held here so Manage
     Seating and the class Seating view always show the same setup. Tagged with its
     class id, so while another class's setups are still loading neither panel uses them. */
  const[setupsState,setSetupsState]=useState(null); // {classId, data, rev} (rev counts reloads, so the class Seating view re-reads a setup whose seating was replaced under it)
  useEffect(()=>{
    if(!activeClassId)return;
    let cancelled=false;
    const reload=()=>loadSetups(activeClassId).then(d=>{if(!cancelled)setSetupsState(p=>({classId:activeClassId,data:d,rev:(p?.rev||0)+1}));});
    reload();
    const onChanged=e=>{if(e.detail?.classId===activeClassId)reload();}; // createSetup / deleteSetup, also from Phase 6 code
    window.addEventListener(SETUPS_EVENT,onChanged);
    return()=>{cancelled=true;window.removeEventListener(SETUPS_EVENT,onChanged);};
  },[activeClassId]);
  const setups=setupsState?.classId===activeClassId?setupsState.data:null;
  const changeSetups=useCallback(next=>{
    const n=normalizeSetups(next);
    setSetupsState(p=>({classId:activeClassId,data:n,rev:p?.rev||0}));
    saveSetups(activeClassId,n);
  },[activeClassId]);

  /* ── Station rotation (Phase 7): rot-<class>, its link to a timer, and the moves ──
     A rotation is an overlay on a setup. Moving the groups only changes `step` in rot-<class>; seat data is never written.
     The linked timer's WORK segment ending moves everyone on (the Move! changeover that follows is the time to walk);
     the last station of a one-lap rotation doesn't, since the timer is simply Done. */
  const timerApiRef=useRef(null);                 // TimerPanel hands us addTimer through this
  const[timerList,setTimerList]=useState(null);   // [{id,running,finished}] reported by TimerPanel (null until it has)
  const[rotState,setRotState]=useState(null);     // {classId,data}
  const[rotCard,setRotCard]=useState(null);       // {key,items}: the big "Rotate!" card
  const rot=rotState?.classId===activeClassId?rotState.data:null;
  const rotRef=useRef(null);rotRef.current=rot;
  useEffect(()=>{
    if(!activeClassId)return;
    let cancelled=false;setRotCard(null);
    load(`rot-${activeClassId}`,null).then(d=>{if(!cancelled)setRotState({classId:activeClassId,data:validRotation(d)});});
    return()=>{cancelled=true;};
  },[activeClassId]);
  useEffect(()=>{if(!rotCard)return;const t=setTimeout(()=>setRotCard(null),4000);return()=>clearTimeout(t);},[rotCard]);
  const commitRot=useCallback(next=>{
    rotRef.current=next;
    setRotState({classId:activeClassId,data:next});
    if(next)save(`rot-${activeClassId}`,next);else window.storage.delete(`rot-${activeClassId}`).catch(()=>{});
  },[activeClassId]);
  /* Move every group on (or back). `announce` plays the chime and shows the Rotate! card. */
  const stepRotation=useCallback((delta,announce)=>{
    const r=rotRef.current;if(!r)return;
    const step=Math.max(0,r.step+delta);if(step===r.step)return;
    const next={...r,step};
    commitRot(next);
    if(announce){audio.chime();setRotCard({key:Date.now(),items:rotationItems(next,step)});}
  },[commitRot]);
  const onTimerSegmentEnd=useCallback((timerId,segIdx,task,info)=>{
    const r=rotRef.current;
    if(!r||r.timerId!==timerId||task===ROT_MOVE)return;
    if(info?.finished&&!r.loop)return;
    stepRotation(1,true);
  },[stepRotation]);
  const startRotation=useCallback(cfg=>{
    const api=timerApiRef.current;if(!api||!activeClassId)return;
    const labels=cfg.stations.map(x=>x.label);
    const timerId=`rot${Date.now().toString(36)}`;
    api.addTimer('Station rotation',buildRotationSegments(labels,cfg),cfg.loop?{infinite:true}:null,false,!!cfg.autoStart,{id:timerId,select:true});
    commitRot({setupId:cfg.setupId,stationOrder:cfg.stations.map(x=>x.id),groups:cfg.groups,step:0,direction:cfg.direction,timerId,minutes:cfg.minutes,changeover:cfg.changeover,loop:!!cfg.loop,labels});
  },[activeClassId,commitRot]);
  const timerState=!rot||timerList===null?null:(t=>!t?'missing':t.finished?'done':'ok')(timerList.find(x=>x.id===rot.timerId));
  const rotationStrip=rot?{timerId:rot.timerId,items:rotationItems(rot,rot.step)}:null;

  /* Load the active class's checklist (migrating its old flags the first time) */
  useEffect(()=>{
    if(!activeClassId)return;
    let cancelled=false;
    checklistRef.current=EMPTY_CHECKLIST;setChecklist(EMPTY_CHECKLIST);
    loadChecklist(activeClassId,activeClass?.students||[]).then(d=>{
      if(cancelled)return;
      checklistRef.current=d;setChecklist(d);
    });
    return()=>{cancelled=true;};
  },[activeClassId]);

  /* Copy items (by id, from the active class) onto the end of other classes' checklists — definitions only, never students' marks */
  const copyChecklistItems=useCallback(async(colIds,targetIds,keepDue)=>{
    const src=checklistRef.current.columns.filter(c=>colIds.includes(c.id));
    for(const tid of targetIds){
      const target=classes.find(c=>c.id===tid);
      const cur=await loadChecklist(tid,target?.students||[]);
      const stamp=Date.now();
      const copies=src.map((c,i)=>({...c,id:`c-${stamp}-${i}-${Math.random().toString(36).slice(2,6)}`,flagIf:[...(c.flagIf||['none'])],...(keepDue?{}:{due:null,dueTime:null})}));
      save(`checklist-${tid}`,{...cur,columns:[...cur.columns,...copies]});
    }
  },[classes]);

  const flagsByStudent=useMemo(()=>{
    const m=new Map();
    (activeClass?.students||[]).forEach(st=>{const f=flagsForStudent(checklist,st.id,now);if(f.length)m.set(st.id,f);});
    return m;
  },[checklist,activeClass,now]);

  /* A student removed from the roster (individually, or by re-importing a
     shorter list) shouldn't linger as a ghost occupant in the seating plan or
     a ghost entry in the checklist — clear them out of both wherever they show up. */
  const cleanupRemovedStudents=useCallback((classId,removedIds)=>{
    const removedSet=new Set(removedIds);
    // every setup's seating, not just Regular's (Phase 5)
    loadSetups(classId).then(su=>su.list.map(x=>setupSlKey(classId,x.id))).then(keys=>keys.forEach(key=>load(key,null).then(layout=>{
      if(!layout)return;
      const nextSeats=(layout.seats||[]).map(s=>removedSet.has(s.studentId)?{...s,studentId:null,locked:false}:s);
      if(nextSeats.some((s,i)=>s!==layout.seats[i]))save(key,{...layout,seats:nextSeats});
    })));
    load(`checklist-${classId}`,null).then(cl=>{
      if(!cl||!cl.cells)return;
      const cells={};
      Object.entries(cl.cells).forEach(([colId,byStudent])=>{
        cells[colId]=Object.fromEntries(Object.entries(byStudent).filter(([sid])=>!removedSet.has(sid)));
      });
      const next={...cl,cells};
      save(`checklist-${classId}`,next);
      if(classId===activeClassId){checklistRef.current=next;setChecklist(next);}
    });
  },[activeClassId]);

  /* Class operations */
  const handleSaveClass=useCallback(updatedClass=>{
    const prevClass=classes.find(c=>c.id===updatedClass.id);
    setClasses(prev=>{
      const idx=prev.findIndex(c=>c.id===updatedClass.id);
      const next=idx>=0?prev.map(c=>c.id===updatedClass.id?updatedClass:c):[...prev.filter(c=>!c.isDemo),updatedClass];
      persistClasses(next,updatedClass.id);
      return next;
    });
    if(prevClass){
      const removedIds=prevClass.students.filter(s=>!updatedClass.students.some(u=>u.id===s.id)).map(s=>s.id);
      if(removedIds.length)cleanupRemovedStudents(updatedClass.id,removedIds);
    }
    setActiveClassId(updatedClass.id);
    setEditingClass(null);
  },[persistClasses,classes,cleanupRemovedStudents]);

  const handleNewClass=useCallback(()=>{
    setEditingClass({id:`cls-${Date.now()}`,name:"New class",isDemo:false,students:[],availableTags:DEFAULT_SEAT_TAGS});
  },[]);

  const handleManageClass=useCallback(()=>{
    if(activeClass)setEditingClass({...activeClass,students:[...activeClass.students]});
  },[activeClass]);

  const handleSetActiveClass=useCallback(id=>{
    setActiveClassId(id);setColdCallStudent(null);
    save("ta-active-class",id);
  },[]);

  /* Alt/Option+1…9 jumps to class 1–9. Uses e.code because on a Mac Option+1
     types "¡" in e.key. Ignored while typing in a field. */
  useEffect(()=>{
    const h=e=>{
      if(!e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.repeat)return;
      const m=/^Digit([1-9])$/.exec(e.code);if(!m)return;
      const t=e.target,tag=t&&t.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT"||(t&&t.isContentEditable))return;
      const c=classes[+m[1]-1];if(!c)return;
      e.preventDefault();
      if(c.id!==activeClassId)handleSetActiveClass(c.id);
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[classes,activeClassId,handleSetActiveClass]);

  /* Delete a class — wipes its roster, seating layout, pairing history and checklist */
  const handleDeleteClass=useCallback(id=>{
    // its setups too: every non-Regular setup's seating, then the list itself
    load(`setups-${id}`,null).then(su=>{(su?.list||[]).filter(x=>x.id!==REGULAR_SETUP).forEach(x=>{try{window.storage?.delete(setupSlKey(id,x.id));}catch(e){}});try{window.storage?.delete(`setups-${id}`);}catch(e){}});
    ['sl-','sh-','ph-','flags-','checklist-','tag-colors-'].forEach(prefix=>{try{window.storage?.delete(`${prefix}${id}`);}catch(e){}});
    const remaining=classes.filter(c=>c.id!==id);
    if(remaining.length===0){
      // Fresh id (not the constant SAMPLE_CLASS.id) so the seating/checklist panels —
      // which only reload when activeClass.id changes — notice this is a new class
      // and don't keep showing the deleted one's leftover layout.
      const freshDemo={...SAMPLE_CLASS,id:`demo-${Date.now()}`};
      setClasses([freshDemo]);
      setActiveClassId(freshDemo.id);
      save("ta-classes",[]);
      save("ta-active-class",freshDemo.id);
    } else {
      const nextActiveId=activeClassId===id?remaining[0].id:activeClassId;
      setClasses(remaining);
      setActiveClassId(nextActiveId);
      persistClasses(remaining,nextActiveId);
    }
    setColdCallStudent(null);
  },[classes,activeClassId,persistClasses]);

  /* Cold call */
  const doColdCall=useCallback(()=>{
    if(!activeClass||!activeClass.students.length)return;
    const eligible=activeClass.students.filter(s=>!s.coldCallExcluded);
    if(!eligible.length)return;
    const idx=Math.floor(Math.random()*eligible.length);
    setColdCallStudent(eligible[idx]);
  },[activeClass]);

  const dismissColdCall=useCallback(()=>setColdCallStudent(null),[]);

  /* Panel toggle — sends resize IPC to Electron */
  const togglePanel=useCallback(panel=>{
    setOpenPanels(prev=>{
      const next={...prev,[panel]:!prev[panel]};
      const count=Object.values(next).filter(Boolean).length;
      window.electronAPI?.resizeForPanels(count);
      return next;
    });
  },[]);

  /* Clicking a top tab while Manage Seating or Manage Groups is open should
     always land you on that tab — never close it, even if it was already
     open underneath. So this force-opens the tab instead of toggling it. */
  const exitManageSeatingToTab=useCallback(panel=>withGroupsGuard(()=>{
    setManageSeatingOpen(false);
    setManageGroupsOpen(false);
    setOpenPanels(prev=>{
      const next={...prev,[panel]:true};
      const count=Object.values(next).filter(Boolean).length;
      window.electronAPI?.resizeForPanels(count);
      return next;
    });
  }),[withGroupsGuard]);
  /* "Go to setup" after Seat these groups: straight to the class Seating tab. No finalise question
     here: the groups are already saved, and Tom is only going to look at the seating. */
  const goToSeatingTab=useCallback(()=>{
    setManageSeatingOpen(false);setManageGroupsOpen(false);
    setOpenPanels(prev=>{const next={...prev,seating:true};window.electronAPI?.resizeForPanels(Object.values(next).filter(Boolean).length);return next;});
  },[]);

  /* "Open in Checklist" from a seating popup: opens (never closes) the Checklist
     tab and tells it which student (and item) to scroll to, via a one-shot
     target it clears itself */
  const[pendingChecklistFocus,setPendingChecklistFocus]=useState(null); // {studentId, colId?}
  const goToChecklist=useCallback(target=>{
    setPendingChecklistFocus(target);
    exitManageSeatingToTab('checklist');
  },[exitManageSeatingToTab]);

  const panelOrder=["timer","seating","groups","checklist"];
  const openList=panelOrder.filter(p=>openPanels[p]);
  const noneOpen=openList.length===0;

  /* Resizable columns: every open panel except the last (rightmost) one gets
     an explicit, drag-adjustable width; the last one always fills whatever
     space is left. Widths aren't persisted across launches — they reset to
     sensible defaults, same as the other view toggles in this app. */
  const PANEL_MIN={timer:200,seating:360,groups:280,checklist:340};
  const PANEL_DEFAULT={timer:440,seating:520,groups:420,checklist:560};
  const[colWidths,setColWidths]=useState({});
  const colWidth=id=>colWidths[id]??PANEL_DEFAULT[id]??360;
  const isLastOpen=id=>openList.length>0&&openList[openList.length-1]===id;
  const startResize=(panelId,e)=>{
    e.preventDefault();
    const startX=e.clientX;
    const startWidth=colWidth(panelId);
    const onMove=e2=>{
      const dx=e2.clientX-startX;
      const min=PANEL_MIN[panelId]||220;
      setColWidths(w=>({...w,[panelId]:Math.max(min,startWidth+dx)}));
    };
    const onUp=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onUp);
  };
  const ResizeHandle=({panelId})=>(
    <div
      className="no-drag"
      onMouseDown={e=>startResize(panelId,e)}
      style={{width:"7px",flexShrink:0,cursor:"col-resize",position:"relative",zIndex:5}}
      onMouseEnter={e=>{e.currentTarget.firstChild.style.background="rgba(46,107,206,0.35)";}}
      onMouseLeave={e=>{e.currentTarget.firstChild.style.background="rgba(0,0,0,0.06)";}}
    >
      <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:"1px",background:"rgba(0,0,0,0.06)",transform:"translateX(-50%)",transition:"background 0.12s"}}/>
    </div>
  );

  return(
    <div data-theme={theme} style={{height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Source Sans 3',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes blockBlink{0%,49%{opacity:1}50%,100%{opacity:0.3}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-border{0%,100%{border-color:rgba(235,87,87,0)}50%{border-color:rgba(235,87,87,0.3)}}
        @keyframes coldCallReveal{from{opacity:0;transform:scale(0.88) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .tag-more:hover .tag-more-tip{display:block !important}
        input::placeholder{color:rgba(0,0,0,0.2)}
        textarea::placeholder{color:rgba(0,0,0,0.2)}
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        .ck-caret{opacity:0}
        .ck-add{opacity:0;transition:opacity 0.12s}
        .ck-th-last:hover + .ck-add-th .ck-add,.ck-add-th:hover .ck-add{opacity:1}
        .ck-cell:hover .ck-caret{opacity:1}
        *{box-sizing:border-box}
        .drag-bar{-webkit-app-region:drag;app-region:drag}
        .no-drag{-webkit-app-region:no-drag;app-region:no-drag}
        .cp-chips::-webkit-scrollbar{display:none}
        ${CP_THEME_CSS}
        ${CP_BUTTON_CSS}
        [data-theme]{--board-bg-top:#f8f9fb;--board-bg-bottom:#eef1f5;--board-side-bg:#fafbfc;--board-heading:#1a1a2e;--board-label:rgba(0,0,0,0.25);--board-muted:rgba(0,0,0,0.2);--board-border:rgba(0,0,0,0.08);--board-wash:rgba(0,0,0,0.025);--board-flat:#f0f2f5;--board-dot:#c8cad2;}
        [data-theme="blackboard"]{--board-bg-top:#1c3829;--board-bg-bottom:#0f2418;--board-side-bg:#173323;--board-heading:#f3f1e7;--board-label:rgba(255,255,255,0.55);--board-muted:rgba(255,255,255,0.32);--board-border:rgba(255,255,255,0.16);--board-wash:rgba(255,255,255,0.05);--board-flat:#173323;--board-dot:rgba(255,255,255,0.18);}
      `}</style>

      <TabStrip openPanels={openPanels} onToggle={togglePanel} onTabClickFromManageSeating={exitManageSeatingToTab} timerStatus={timerStatus} classes={classes} activeClassId={activeClassId} onSetActiveClass={handleSetActiveClass} onNewClass={handleNewClass} onManageClass={handleManageClass} onDeleteClass={handleDeleteClass}
        manageSeatingOpen={manageSeatingOpen} onToggleManageSeating={()=>withGroupsGuard(()=>{setManageGroupsOpen(false);setManageSeatingOpen(o=>{const next=!o;if(next)window.electronAPI?.resizeForPanels('manage');else window.electronAPI?.resizeForPanels(Object.values(openPanels).filter(Boolean).length);return next;});})}
        manageGroupsOpen={manageGroupsOpen} onToggleManageGroups={()=>withGroupsGuard(()=>{setManageSeatingOpen(false);setManageGroupsOpen(o=>{const next=!o;if(next)window.electronAPI?.resizeForPanels('manage');else window.electronAPI?.resizeForPanels(Object.values(openPanels).filter(Boolean).length);return next;});})}
        onOpenSettings={()=>setShowSettings(true)}
        helpMode={helpMode} onToggleHelp={()=>setHelpMode(h=>!h)}
      />
      <HelpOverlay active={helpMode}/>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Manage Seating / Manage Groups — full-width teacher views, hide other panels */}
        {/* Timer panel: always mounted (hidden, not removed), so timers keep running while another tab or Manage Seating is open */}
        <div className="cp-onboard" style={{display:openPanels.timer&&!manageSeatingOpen&&!manageGroupsOpen?"flex":"none",flexDirection:"column",...(isLastOpen("timer")?{flex:1,minWidth:PANEL_MIN.timer}:{width:colWidth("timer"),flexShrink:0}),overflow:"hidden auto"}}>
          <TimerPanel onStatusChange={setTimerStatus} activeClass={activeClass} coldCallStudent={coldCallStudent} onColdCall={doColdCall} onDismissColdCall={dismissColdCall} timerStyle={timerStyle}
            onSegmentEnd={onTimerSegmentEnd} onTimersChange={setTimerList} apiRef={timerApiRef} rotationStrip={rotationStrip}/>
        </div>
        {manageSeatingOpen?(
          <div style={{flex:1,overflow:"hidden"}}>
            <ManageSeatingPanel activeClass={activeClass} setups={setups} onChangeSetups={changeSetups} checklist={checklist} onChangeChecklist={updateChecklist} flagsByStudent={flagsByStudent} now={now} showFlags={showFlagsSeating} onSetShowFlags={handleSetShowFlagsSeating} onGoToChecklist={goToChecklist} onUpdateStudentTags={updateStudentTags} rotation={rot} onStartRotation={startRotation}/>
          </div>
        ):manageGroupsOpen?(
          <div style={{flex:1,overflow:"hidden"}}>
            <ManageGroupsPanel activeClass={activeClass} onGoToSeating={goToSeatingTab} guardRef={groupsGuardRef} flagsByStudent={flagsByStudent} showFlags={showFlagsGroups} onSetShowFlags={handleSetShowFlagsGroups}/>
          </div>
        ):(
          <>
            {openPanels.timer&&!isLastOpen("timer")&&<ResizeHandle panelId="timer"/>}

            {openPanels.seating&&(<div style={{display:"flex",flexDirection:"column",...(isLastOpen("seating")?{flex:1,minWidth:PANEL_MIN.seating}:{width:colWidth("seating"),flexShrink:0}),overflow:"hidden auto"}}><StudentSeatingPanel activeClass={activeClass} setups={setups} seatRev={setupsState?.rev} onChangeSetups={changeSetups} checklist={checklist} onChangeChecklist={updateChecklist} flagsByStudent={flagsByStudent} now={now} showFlags={showFlagsSeating} onSetShowFlags={handleSetShowFlagsSeating} onGoToChecklist={goToChecklist} rotation={rot}/></div>)}
            {openPanels.seating&&!isLastOpen("seating")&&<ResizeHandle panelId="seating"/>}

            {openPanels.groups&&(<div style={{display:"flex",flexDirection:"column",...(isLastOpen("groups")?{flex:1,minWidth:PANEL_MIN.groups}:{width:colWidth("groups"),flexShrink:0}),overflow:"hidden auto"}}><StudentGroupsPanel activeClass={activeClass} onGoToSeating={goToSeatingTab} flagsByStudent={flagsByStudent} showFlags={showFlagsGroups}/></div>)}
            {openPanels.groups&&!isLastOpen("groups")&&<ResizeHandle panelId="groups"/>}

            {openPanels.checklist&&(<div style={{display:"flex",flexDirection:"column",...(isLastOpen("checklist")?{flex:1,minWidth:PANEL_MIN.checklist}:{width:colWidth("checklist"),flexShrink:0}),overflow:"hidden auto"}}><ChecklistPanel activeClass={activeClass} classes={classes} data={checklist} onChange={updateChecklist} onCopyItems={copyChecklistItems} categories={checkCategories} onChangeCategories={updateCheckCategories} now={now} focus={pendingChecklistFocus} onFocusHandled={()=>setPendingChecklistFocus(null)}/></div>)}
            {openPanels.checklist&&!isLastOpen("checklist")&&<ResizeHandle panelId="checklist"/>}

            {noneOpen&&(<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg,var(--board-bg-top) 0%,var(--board-bg-bottom) 100%)",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic"}}>click a tab to open a panel</div>)}
          </>
        )}
      </div>

      {/* Station rotation: Rotate / Back / End while one runs (Manage Seating and the class Seating view), and the big Rotate! card over everything */}
      {rot&&(manageSeatingOpen||(!manageGroupsOpen&&openPanels.seating))&&(
        <RotationBar rot={rot} setupName={setups?.list.find(x=>x.id===rot.setupId)?.name} timerState={timerState} onRotate={()=>stepRotation(1,true)} onBack={()=>stepRotation(-1,false)} onEnd={()=>commitRot(null)}/>
      )}
      {rotCard&&<RotateCard key={rotCard.key} items={rotCard.items} onClose={()=>setRotCard(null)}/>}

      {/* Manage class modal — rendered at root so it covers everything */}
      {editingClass&&(<ManageClassModal classToEdit={editingClass} onSave={handleSaveClass} onClose={()=>setEditingClass(null)}/>)}
      {showSettings&&(<SettingsModal theme={theme} onSetTheme={handleSetTheme} timerStyle={timerStyle} onSetTimerStyle={handleSetTimerStyle} onClose={()=>setShowSettings(false)}/>)}
    </div>
  );
}
