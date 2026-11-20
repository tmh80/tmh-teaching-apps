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
/* At launch: one backup per calendar day */
async function autoBackupIfNewDay(){
  try{
    const today=new Date().toLocaleDateString('sv');
    const newest=readAutoBackups()[0];
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
function TimerCard({timer,onDelete,onToggle,onReset,onSelect,onDisplay,isSelected,continuousAlarm,compact,timerStyle}){
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
    <div onClick={()=>onSelect(timer.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:compact?"7px":"10px",padding:compact?"16px 16px 14px":"24px 24px 20px",borderRadius:"22px",cursor:"pointer",background:finished?"linear-gradient(145deg,#fff5f5,#fff9f9)":"#ffffff",border:isSelected?"2px solid #2e6bce":finished?"1px solid rgba(235,87,87,0.18)":"1px solid rgba(0,0,0,0.05)",boxShadow:isSelected?"0 0 0 3px rgba(66,133,244,0.12)":finished?"0 4px 24px rgba(235,87,87,0.08)":"0 2px 20px rgba(0,0,0,0.04)",animation:finished&&continuousAlarm?"shake 0.4s ease-in-out infinite":"none",position:"relative",width:compact?"100%":"280px",maxWidth:compact?"230px":"280px",transition:"border 0.2s, box-shadow 0.2s",}}>
      {isSelected&&!finished&&<div style={{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",fontSize:"9px",fontWeight:700,color:"#fff",background:"#2e6bce",padding:"2px 10px",borderRadius:"8px",letterSpacing:"1px",textTransform:"uppercase"}}>Current</div>}
      <button onClick={e=>{e.stopPropagation();onDelete(timer.id);}} style={{position:"absolute",top:"10px",right:"12px",background:"none",border:"none",color:"rgba(0,0,0,0.15)",fontSize:"18px",cursor:"pointer",padding:"4px 8px",borderRadius:"6px",lineHeight:1,}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.15)"}>×</button>
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
        <button onClick={e=>{e.stopPropagation();onToggle(timer.id);}} style={{fontSize:"13px",fontWeight:600,padding:compact?"8px 16px":"9px 26px",borderRadius:"10px",border:"none",cursor:"pointer",background:finished?"#eb5757":running?"rgba(0,0,0,0.05)":"#1a1a2e",color:finished?"#fff":running?"#555":"#fff",}}>{finished?"Dismiss":running?"Pause":"Start"}</button>
        {!finished&&<button onClick={e=>{e.stopPropagation();onReset(timer.id);}} style={{fontSize:"13px",fontWeight:600,padding:compact?"8px 12px":"9px 18px",borderRadius:"10px",cursor:"pointer",background:"none",border:"1px solid rgba(0,0,0,0.07)",color:"rgba(0,0,0,0.3)",}} onMouseEnter={e=>{e.target.style.borderColor="rgba(0,0,0,0.18)";e.target.style.color="rgba(0,0,0,0.55)";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(0,0,0,0.07)";e.target.style.color="rgba(0,0,0,0.3)";}}>Reset</button>}
        {!finished&&<button onClick={e=>{e.stopPropagation();onDisplay(timer.id);}} title="Projector view" style={{fontSize:"15px",fontWeight:600,padding:compact?"8px 10px":"9px 12px",borderRadius:"10px",cursor:"pointer",background:"none",border:"1px solid rgba(0,0,0,0.07)",color:"rgba(0,0,0,0.25)",lineHeight:1,}} onMouseEnter={e=>{e.target.style.borderColor="rgba(66,133,244,0.3)";e.target.style.color="#2e6bce";e.target.style.background="#eaf1fc";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(0,0,0,0.07)";e.target.style.color="rgba(0,0,0,0.25)";e.target.style.background="none";}}>⛶</button>}
      </div>
    </div>
  );
}

/* ── Display Mode ── */
function DisplayMode({timer,onToggle,onReset,onExit,continuousAlarm,coldCallStudent,onDismissColdCall,timerStyle}){
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
    <div className="no-drag" style={{position:"fixed",inset:0,zIndex:200,background:"linear-gradient(180deg,var(--board-bg-top) 0%,var(--board-bg-bottom) 100%)",display:"flex",flexDirection:"column",fontFamily:"'Source Sans 3',sans-serif",overflow:"hidden",}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px 0"}}>
        <button onClick={onExit} style={{fontSize:"13px",fontWeight:600,padding:"8px 16px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.4)",cursor:"pointer",}} onMouseEnter={e=>e.target.style.color="rgba(0,0,0,0.7)"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.4)"}>← Exit Display</button>
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

        {/* Cold call overlay — appears within display mode */}
        {coldCallStudent&&(
          <div style={{position:"absolute",inset:0,background:"rgba(248,249,251,0.93)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,animation:"coldCallReveal 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
            <div style={{textAlign:"center",padding:"40px 60px"}}>
              <div style={{fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"20px",fontWeight:600}}>Cold Call</div>
              <div style={{fontSize:"clamp(48px,10vw,96px)",fontWeight:700,color:"#1a1a2e",lineHeight:1.1}}>{coldCallStudent.name}</div>
              <button onClick={onDismissColdCall} style={{marginTop:"32px",fontSize:"14px",fontWeight:600,padding:"10px 28px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer"}}>Dismiss</button>
            </div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:"12px",justifyContent:"center",padding:"0 24px 32px"}}>
        <button onClick={()=>onToggle(timer.id)} style={{fontSize:"18px",fontWeight:600,padding:"14px 48px",borderRadius:"14px",border:"none",cursor:"pointer",background:finished?"#eb5757":running?"rgba(0,0,0,0.06)":"#1a1a2e",color:finished?"#fff":running?"#555":"#fff",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",}}>{finished?"Dismiss":running?"Pause":"Start"}</button>
        {!finished&&<button onClick={()=>onReset(timer.id)} style={{fontSize:"18px",fontWeight:600,padding:"14px 32px",borderRadius:"14px",cursor:"pointer",background:"none",border:"1px solid rgba(0,0,0,0.08)",color:"rgba(0,0,0,0.3)",}} onMouseEnter={e=>{e.target.style.borderColor="rgba(0,0,0,0.2)";e.target.style.color="rgba(0,0,0,0.55)";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(0,0,0,0.08)";e.target.style.color="rgba(0,0,0,0.3)";}}>Reset</button>}
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
    <div style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"400px",maxHeight:"85vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}><h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage Tasks</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button></div>
      <p style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"16px",lineHeight:1.5}}>Task chips you can click or drag into the timer builder — e.g. "Practical" then "Clean up" for a science lesson. Drag to reorder.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px",overflowY:"auto",maxHeight:"320px",paddingRight:"2px"}}>
        {items.map((a,i)=>(
          <div key={i} draggable onDragStart={e=>hds(e,i)} onDragOver={e=>e.preventDefault()} onDrop={e=>hdo(e,i)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",borderRadius:"10px",background:draggingIdx===i?"rgba(0,0,0,0.04)":"#fafbfc",border:"1px solid rgba(0,0,0,0.04)",opacity:draggingIdx===i?0.4:1,cursor:"grab",flexShrink:0}}>
            <span style={{color:"rgba(0,0,0,0.15)",fontSize:"14px",userSelect:"none"}}>⠿</span>
            <input value={a} onChange={e=>{const n=[...items];n[i]=e.target.value;setItems(n);}} style={{...inp,flex:1,minWidth:0}} onClick={e=>e.stopPropagation()}/>
            <button onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(0,0,0,0.15)",cursor:"pointer",fontSize:"16px",lineHeight:1}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.15)"}>×</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:"6px",marginBottom:"18px",flexShrink:0}}>
        <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newTask.trim()){setItems([...items,newTask.trim()]);setNewTask("");}}} placeholder="New task…" style={{...inp,flex:1}}/>
        <button onClick={()=>{if(newTask.trim()){setItems([...items,newTask.trim()]);setNewTask("");}}} style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,cursor:"pointer"}}>Add</button>
      </div>
      <button onClick={()=>{onSave(items.filter(a=>a.trim()));onClose();}} style={{width:"100%",padding:"12px",borderRadius:"12px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",flexShrink:0}}>Save</button>
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
    <div style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"440px",maxHeight:"85vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}><h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage Templates</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button></div>
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
              <button onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(0,0,0,0.15)",cursor:"pointer",fontSize:"16px",lineHeight:1,flexShrink:0}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.15)"}>×</button>
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
      <button onClick={()=>{onSave(items);onClose();}} style={{width:"100%",padding:"12px",borderRadius:"12px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",flexShrink:0}}>Save</button>
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
    <div style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"520px",maxHeight:"90vh",overflowY:"auto",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}><h2 style={{margin:0,fontSize:"16px",fontWeight:700}}>Build a Timer</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button></div>
      <div style={{marginBottom:"18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <div style={{...lbl,textAlign:"left",fontSize:"11px",letterSpacing:"1.5px"}}>Templates</div>
          <button onClick={onManageTemplates} title="Rename or delete your saved templates" style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:0}}>📁 Manage templates</button>
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",maxHeight:"106px",overflowY:"auto",paddingRight:"2px"}}>
          {allTemplates.map((t,i)=>(<div key={i} style={{position:"relative",display:"inline-flex"}}><button onClick={()=>loadTpl(t)} title={`Load "${t.name}" into the timeline below`} style={{padding:"7px 14px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.06)",background:t.builtin?"#fafbfc":"#f0f4ff",cursor:"pointer",fontSize:"12.5px",fontWeight:600,color:t.builtin?"rgba(0,0,0,0.5)":"#2e6bce",paddingRight:t.builtin?"14px":"28px"}}>{t.name}</button>{!t.builtin&&<button onClick={e=>{e.stopPropagation();onDeleteTemplate(i-DEFAULT_TEMPLATES.length);}} title={`Delete the "${t.name}" template`} style={{position:"absolute",right:"4px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(0,0,0,0.2)",cursor:"pointer",fontSize:"13px",lineHeight:1}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.2)"}>×</button>}</div>))}
        </div>
      </div>
      <div style={{marginBottom:"18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <div style={{...lbl,textAlign:"left",fontSize:"11px",letterSpacing:"1.5px"}}>Click or drag tasks into timeline</div>
          <button onClick={onManageTasks} title="Add, rename or delete your saved tasks" style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:0}}>🗂 Manage tasks</button>
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",maxHeight:"106px",overflowY:"auto",paddingRight:"2px"}}>
          {actions.map((task,i)=>{const c=COLORS[i%COLORS.length];return(<div key={task+i} draggable onDragStart={e=>dragStart(e,task)} onClick={()=>setSegments(p=>[...p,{task,minutes:2,seconds:0}])} title={`Add "${task}" as the next step in the timeline (or drag it in)`} style={{padding:"6px 14px",borderRadius:"14px",cursor:"pointer",background:c.bg,fontSize:"12.5px",fontWeight:600,color:c.text,userSelect:"none",transition:"transform 0.15s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>{task}</div>);})}
        </div>
        <div style={{display:"flex",gap:"6px",marginTop:"8px"}}>
          <input value={customTask} onChange={e=>setCustomTask(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&customTask.trim()){setSegments(p=>[...p,{task:customTask.trim(),minutes:2,seconds:0}]);setCustomTask("");}}} placeholder="Custom task…" style={{...inp,flex:1}}/>
          <button onClick={()=>{if(customTask.trim()){setSegments(p=>[...p,{task:customTask.trim(),minutes:2,seconds:0}]);setCustomTask("");}}} title="Add this as a one-off step, without saving it to your task list" style={{padding:"7px 14px",borderRadius:"8px",border:"1px dashed rgba(0,0,0,0.15)",background:"none",cursor:"pointer",fontSize:"12px",fontWeight:600,color:"rgba(0,0,0,0.35)"}}>+ Add</button>
        </div>
      </div>
      <input value={timerName} onChange={e=>setTimerName(e.target.value)} placeholder="Timer name (optional)" style={{...inp,width:"100%",marginBottom:"14px",boxSizing:"border-box"}}/>
      <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={drop} style={{minHeight:segments.length===0?"100px":"auto",border:`2px dashed ${dragOver?"rgba(66,133,244,0.4)":"rgba(0,0,0,0.08)"}`,borderRadius:"14px",padding:"12px",background:dragOver?"rgba(66,133,244,0.03)":"rgba(0,0,0,0.015)",marginBottom:"14px",display:"flex",flexDirection:"column",gap:"6px"}}>
        {segments.length===0&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"76px",color:"rgba(0,0,0,0.2)",fontSize:"13px",fontStyle:"italic"}}>Drop tasks here to build your timeline</div>}
        {segments.length>0&&(<div style={{display:"flex",alignItems:"center",gap:"10px",padding:"0 12px 2px"}}><span style={{width:"14px"}}/><span style={{...lbl,flex:1,textAlign:"left"}}>Task</span><span style={{...lbl,width:"42px"}}>Min</span><span style={{width:"8px"}}/><span style={{...lbl,width:"42px"}}>Sec</span><span style={{width:"22px"}}/></div>)}
        {segments.map((seg,i)=>{const c=COLORS[i%COLORS.length];return(<div key={i} draggable onDragStart={e=>reorderStart(e,i)} onDragOver={e=>e.preventDefault()} onDrop={e=>reorderDrop(e,i)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"10px",background:draggingIdx===i?"rgba(0,0,0,0.04)":"#fff",border:"1px solid rgba(0,0,0,0.05)",opacity:draggingIdx===i?0.4:1,cursor:"grab"}}><span style={{color:"rgba(0,0,0,0.15)",fontSize:"14px",cursor:"grab",userSelect:"none"}}>⠿</span><input value={seg.task} onChange={e=>updateSeg(i,"task",e.target.value)} style={{...inp,flex:1,minWidth:0,border:"none",background:"transparent",padding:"4px 0",fontWeight:600,color:c.text}}/><input type="number" value={seg.minutes} onChange={e=>updateSeg(i,"minutes",e.target.value)} min="0" style={{...inp,width:"42px",textAlign:"center",padding:"5px 4px"}}/><span style={{color:"rgba(0,0,0,0.15)",fontWeight:300}}>:</span><input type="number" value={seg.seconds} onChange={e=>updateSeg(i,"seconds",e.target.value)} min="0" max="59" style={{...inp,width:"42px",textAlign:"center",padding:"5px 4px"}}/><button onClick={()=>removeSeg(i)} style={{background:"none",border:"none",color:"rgba(0,0,0,0.15)",cursor:"pointer",fontSize:"16px",padding:"2px 6px",lineHeight:1,flexShrink:0}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.15)"}>×</button></div>);})}
      </div>
      {segments.length>0&&<div style={{textAlign:"right",fontSize:"12px",color:"rgba(0,0,0,0.3)",marginBottom:"14px",fontWeight:600}}>Total: {fmt(totalSec)}</div>}
      {shouldShowPara(segments)&&(<div style={{padding:"12px 14px",borderRadius:"10px",background:"linear-gradient(135deg,#fdf5e6,#fef9f0)",border:"1px solid rgba(234,170,60,0.25)",marginBottom:"14px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px",marginBottom:paraMode?"6px":0}}><span style={{fontSize:"12.5px",fontWeight:700,color:"#8a6d20"}}>Paraphrase mode</span><button onClick={()=>setParaMode(!paraMode)} style={{width:"40px",height:"22px",borderRadius:"11px",border:"none",background:paraMode?"#b8850a":"rgba(0,0,0,0.1)",cursor:"pointer",position:"relative",padding:0}}><div style={{width:"18px",height:"18px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:paraMode?"20px":"2px",transition:"left 0.25s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/></button></div>{paraMode&&<div style={{fontSize:"11.5px",color:"#8a6d20",lineHeight:1.5,opacity:0.85}}>First round skips the paraphrase. Last round adds an extra one. Set repetitions = number of students.</div>}</div>)}
      <div style={{marginBottom:"20px"}}>
        <div style={{...lbl,textAlign:"left",marginBottom:"8px",fontSize:"11px",letterSpacing:"1.5px"}}>Repeat</div>
        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
          {[["none","Once","Run through the timeline a single time"],["count","Repeat","Run through the timeline a set number of times"],["infinite","Loop ∞","Keep looping the timeline until you stop it"]].map(([v,l,help])=>(<button key={v} onClick={()=>setRepeatMode(v)} title={help} style={{padding:"7px 14px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:600,background:repeatMode===v?"#1a1a2e":"rgba(0,0,0,0.04)",color:repeatMode===v?"#fff":"rgba(0,0,0,0.4)"}}>{l}</button>))}
          {repeatMode==="count"&&<><input type="number" value={repeatCount} onChange={e=>setRepeatCount(e.target.value)} min="1" style={{...inp,width:"50px",textAlign:"center",marginLeft:"4px"}}/>{paraMode&&<span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)"}}>students</span>}</>}
        </div>
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={handleCreate} disabled={!segments.length} title="Create this timer and start it running now" style={{flex:1,padding:"13px",borderRadius:"12px",border:"none",background:!segments.length?"rgba(0,0,0,0.06)":"#1a1a2e",color:!segments.length?"rgba(0,0,0,0.2)":"#fff",fontSize:"14px",fontWeight:600,cursor:!segments.length?"default":"pointer"}}>Start Timer</button>
        <button onClick={handleSave} disabled={!segments.length} title="Save this timeline as a reusable template, without starting it" style={{padding:"13px 18px",borderRadius:"12px",border:!segments.length?"1px solid rgba(0,0,0,0.04)":"1px solid rgba(0,0,0,0.1)",background:showSaveConfirm?"#edf7ef":"#fff",color:showSaveConfirm?"#3a8a4e":!segments.length?"rgba(0,0,0,0.15)":"rgba(0,0,0,0.5)",fontSize:"13px",fontWeight:600,cursor:!segments.length?"default":"pointer",whiteSpace:"nowrap"}}>{showSaveConfirm?"✓ Saved!":"Save Template"}</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DOTS MENU
   ══════════════════════════════════════════════════════════ */
function DotsMenu({classes,activeClassId,onSetActiveClass,onNewClass,onManageClass,onDeleteClass}){
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
      <button onClick={()=>setOpen(o=>!o)} style={{background:open?"rgba(255,255,255,0.3)":"none",border:"1px solid rgba(74,49,28,0.22)",borderRadius:"6px",padding:"4px 9px",cursor:"pointer",color:open?"rgba(74,49,28,0.9)":"rgba(74,49,28,0.65)",fontSize:"16px",lineHeight:1,fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(74,49,28,0.4)";e.currentTarget.style.color="rgba(74,49,28,0.9)";}} onMouseLeave={e=>{if(!open){e.currentTarget.style.borderColor="rgba(74,49,28,0.22)";e.currentTarget.style.color="rgba(74,49,28,0.65)";}}} title="Class settings">⋯</button>
      {open&&(
        <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"14px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:"230px",zIndex:400,overflow:"hidden",animation:"fadeIn 0.15s ease"}}>
          {/* Active class header */}
          <div style={{padding:"14px 16px 10px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",marginBottom:"3px"}}>Active class</div>
            <div style={{fontSize:"15px",fontWeight:700,color:"#1a1a2e"}}>{activeClass?.name||"No class"}</div>
            {activeClass?.isDemo&&<div style={{fontSize:"10.5px",color:"#b8850a",marginTop:"2px",fontWeight:500}}>Demo data — click Manage class to replace</div>}
            {activeClass&&!activeClass.isDemo&&<div style={{fontSize:"10.5px",color:"rgba(0,0,0,0.3)",marginTop:"2px"}}>{activeClass.students.length} student{activeClass.students.length!==1?"s":""}</div>}
          </div>
          {/* Class list */}
          <div style={{padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
            {classes.map(c=>(
              confirmDeleteId===c.id?(
                <div key={c.id} style={{padding:"8px 16px",background:"#fdeeed"}}>
                  <div style={{fontSize:"12px",color:"#c44",fontWeight:600,marginBottom:"7px",lineHeight:1.4}}>Delete "{c.name}"? This removes its roster, seating and checklist.</div>
                  <div style={{display:"flex",gap:"6px"}}>
                    <button onClick={()=>{onDeleteClass(c.id);setConfirmDeleteId(null);setOpen(false);}} style={{flex:1,padding:"6px 0",borderRadius:"7px",border:"none",background:"#eb5757",color:"#fff",fontSize:"11.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Delete</button>
                    <button onClick={()=>setConfirmDeleteId(null)} style={{flex:1,padding:"6px 0",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"11.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Cancel</button>
                  </div>
                </div>
              ):(
                <div key={c.id} style={{display:"flex",alignItems:"center",background:c.id===activeClassId?"#eaf1fc":"none"}}
                  onMouseEnter={e=>{if(c.id!==activeClassId)e.currentTarget.style.background="rgba(0,0,0,0.03)";}}
                  onMouseLeave={e=>{if(c.id!==activeClassId)e.currentTarget.style.background="none";}}
                >
                  <button onClick={()=>{onSetActiveClass(c.id);setOpen(false);}} style={{...menuItem,background:"none",color:c.id===activeClassId?"#2e6bce":"#1a1a2e",fontWeight:c.id===activeClassId?600:400,flex:1,minWidth:0}}>
                    <span style={{fontSize:"8px",color:c.id===activeClassId?"#2e6bce":"rgba(0,0,0,0.2)"}}>●</span>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
                    {c.isDemo&&<span style={{fontSize:"9px",color:"#b8850a",fontWeight:600,marginLeft:"auto",flexShrink:0}}>demo</span>}
                  </button>
                  <button onClick={()=>setConfirmDeleteId(c.id)} title="Delete class" style={{background:"none",border:"none",color:"rgba(0,0,0,0.18)",cursor:"pointer",fontSize:"14px",padding:"6px 12px",lineHeight:1,flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.color="#eb5757"} onMouseLeave={e=>e.currentTarget.style.color="rgba(0,0,0,0.18)"}>×</button>
                </div>
              )
            ))}
            <button onClick={()=>{onNewClass();setOpen(false);}} style={{...menuItem,color:"rgba(0,0,0,0.4)",}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span style={{fontSize:"15px",lineHeight:1}}>+</span><span>New class</span>
            </button>
          </div>
          {/* Manage */}
          <div style={{padding:"6px 0"}}>
            <button onClick={()=>{onManageClass();setOpen(false);}} style={{...menuItem,fontWeight:600}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span>Manage class</span><span style={{marginLeft:"auto",color:"rgba(0,0,0,0.25)",fontSize:"12px"}}>→</span>
            </button>
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

  const tagBtn=(active,label,onClick,activeStyle)=>(<button onClick={onClick} style={{padding:"5px 10px",borderRadius:"7px",border:`1px solid ${active?activeStyle.border:"rgba(0,0,0,0.08)"}`,background:active?activeStyle.bg:"#fff",color:active?activeStyle.text:"rgba(0,0,0,0.35)",fontSize:"11px",fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>);

  /* Tag toggle for student (adds/removes from tags array) */
  const toggleStudentTag=(form,setForm,tag)=>{
    setForm(p=>({...p,tags:p.tags.includes(tag)?p.tags.filter(t=>t!==tag):[...p.tags,tag]}));
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"20px",fontFamily:"'Source Sans 3',sans-serif"}}>
      <div style={{background:"#fff",borderRadius:"22px",padding:"0",boxShadow:"0 8px 60px rgba(0,0,0,0.15)",width:"100%",maxWidth:"600px",maxHeight:"88vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.25s ease",overflow:"hidden"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 28px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
          <h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage class</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1,padding:"4px 8px"}}>×</button>
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
              <button onClick={handleImport} disabled={!importText.trim()} style={{padding:"7px 16px",borderRadius:"8px",border:"none",background:importText.trim()?"#1a1a2e":"rgba(0,0,0,0.06)",color:importText.trim()?"#fff":"rgba(0,0,0,0.2)",fontSize:"12px",fontWeight:600,cursor:importText.trim()?"pointer":"default"}}>Import — replaces roster</button>
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
                      <button onClick={()=>{handleDelete(s.id);setConfirmDeleteId(null);}} style={{flex:1,padding:"6px 0",borderRadius:"7px",border:"none",background:"#eb5757",color:"#fff",fontSize:"11.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Remove</button>
                      <button onClick={()=>setConfirmDeleteId(null)} style={{flex:1,padding:"6px 0",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"11.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Cancel</button>
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
                        <button key={tag} onClick={()=>toggleStudentTag(editForm,setEditForm,tag)} style={{padding:"3px 8px",borderRadius:"6px",border:`1px solid ${has?tc.t:"rgba(0,0,0,0.08)"}`,background:has?tc.b:"#fff",color:has?tc.t:"rgba(0,0,0,0.4)",fontSize:"10px",fontWeight:700,cursor:"pointer"}}>{tag}</button>
                      );})}
                      <button onClick={handleEditSave} style={{marginLeft:"auto",padding:"5px 12px",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"11px",fontWeight:600,cursor:"pointer"}}>Done</button>
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
                    <button onClick={()=>handleEditStart(s)} style={{background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"14px",padding:"2px 5px",lineHeight:1,flexShrink:0}} onMouseEnter={e=>e.target.style.color="rgba(0,0,0,0.6)"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.25)"} title="Edit">✎</button>
                    <button onClick={()=>setConfirmDeleteId(s.id)} style={{background:"none",border:"none",color:"rgba(200,60,60,0.45)",cursor:"pointer",fontSize:"18px",padding:"2px 5px",lineHeight:1,flexShrink:0,fontWeight:300}} onMouseEnter={e=>e.target.style.color="rgba(200,60,60,1)"} onMouseLeave={e=>e.target.style.color="rgba(200,60,60,0.45)"} title="Remove">×</button>
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
                <button key={tag} onClick={()=>toggleStudentTag(addForm,setAddForm,tag)} style={{padding:"3px 8px",borderRadius:"6px",border:`1px solid ${has?tc.t:"rgba(0,0,0,0.08)"}`,background:has?tc.b:"#fff",color:has?tc.t:"rgba(0,0,0,0.4)",fontSize:"10px",fontWeight:700,cursor:"pointer"}}>{tag}</button>
              );})}
            </div>
            <button onClick={handleAdd} disabled={students.length>=MAX_STUDENTS} style={{padding:"7px 16px",borderRadius:"8px",border:"none",background:students.length>=MAX_STUDENTS?"rgba(0,0,0,0.06)":"#1a1a2e",color:students.length>=MAX_STUDENTS?"rgba(0,0,0,0.2)":"#fff",fontSize:"12px",fontWeight:600,cursor:students.length>=MAX_STUDENTS?"default":"pointer"}}>+ Add student</button>
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
              <button onClick={togglePhMode} style={{width:"34px",height:"18px",borderRadius:"9px",border:"none",background:phMode==='combined'?"#1a1a2e":"rgba(0,0,0,0.15)",cursor:"pointer",position:"relative",flexShrink:0,padding:0}}>
                <div style={{width:"14px",height:"14px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:phMode==='combined'?"18px":"2px",transition:"left 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/>
              </button>
            </div>

            {phMode==='combined'?(
              historyClearing==='both'?(
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"11.5px",fontWeight:600,color:"#c44"}}>Clear all {groupsHistoryCount} recorded pairings?</span>
                  <button onClick={()=>clearPairingHistory('both')} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0}}>Yes, clear</button>
                  <button onClick={()=>setHistoryClearing(null)} style={{fontSize:"10.5px",fontWeight:600,color:"rgba(0,0,0,0.4)",background:"none",border:"none",cursor:"pointer",padding:0}}>Cancel</button>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
                  <span style={{fontSize:"11.5px",color:"rgba(0,0,0,0.4)"}}>{groupsHistoryCount>0?`${groupsHistoryCount} recorded pairings`:'No pairings recorded yet'}</span>
                  {groupsHistoryCount>0&&<button onClick={()=>setHistoryClearing('both')} style={{fontSize:"11px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Clear history…</button>}
                </div>
              )
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {[{key:'groups',label:'Groups',count:groupsHistoryCount},{key:'seating',label:'Seating',count:seatingHistoryCount}].map(row=>(
                  <div key={row.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
                    <span style={{fontSize:"11.5px",color:"rgba(0,0,0,0.45)"}}>{row.label}: {row.count>0?`${row.count} pairings`:'none yet'}</span>
                    {row.count>0&&(historyClearing===row.key?(
                      <span style={{display:"flex",gap:"6px"}}>
                        <button onClick={()=>clearPairingHistory(row.key)} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0}}>Yes, clear</button>
                        <button onClick={()=>setHistoryClearing(null)} style={{fontSize:"10.5px",fontWeight:600,color:"rgba(0,0,0,0.4)",background:"none",border:"none",cursor:"pointer",padding:0}}>Cancel</button>
                      </span>
                    ):(
                      <button onClick={()=>setHistoryClearing(row.key)} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Clear…</button>
                    ))}
                  </div>
                ))}
                {(groupsHistoryCount>0||seatingHistoryCount>0)&&(
                  historyClearing==='both'?(
                    <div style={{display:"flex",alignItems:"center",gap:"8px",paddingTop:"6px",borderTop:"1px solid rgba(0,0,0,0.06)"}}>
                      <span style={{fontSize:"11px",fontWeight:600,color:"#c44"}}>Clear both?</span>
                      <button onClick={()=>clearPairingHistory('both')} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0}}>Yes, clear both</button>
                      <button onClick={()=>setHistoryClearing(null)} style={{fontSize:"10.5px",fontWeight:600,color:"rgba(0,0,0,0.4)",background:"none",border:"none",cursor:"pointer",padding:0}}>Cancel</button>
                    </div>
                  ):(
                    <button onClick={()=>setHistoryClearing('both')} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline",alignSelf:"flex-start",marginTop:"2px"}}>Clear both…</button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",padding:"16px 28px",borderTop:"1px solid rgba(0,0,0,0.06)"}}>
          <button onClick={onClose} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button onClick={handleSave} style={{padding:"10px 24px",borderRadius:"10px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>Save class</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TIMER PANEL
   ══════════════════════════════════════════════════════════ */
function TimerPanel({onStatusChange,activeClass,coldCallStudent,onColdCall,onDismissColdCall,timerStyle}){
  const[timers,setTimers]=useState([]);const[selectedId,setSelectedId]=useState(null);const[showBuilder,setShowBuilder]=useState(false);const[showActions,setShowActions]=useState(false);const[showTemplatesManager,setShowTemplatesManager]=useState(false);const[continuousAlarm,setContinuousAlarm]=useState(true);const[countdownBeeps,setCountdownBeeps]=useState(true);const[savedTemplates,setSavedTemplates]=useState([]);const[actions,setActions]=useState(DEFAULT_ACTIONS);const[customMin,setCustomMin]=useState("");const[customSec,setCustomSec]=useState("");const[displayMode,setDisplayMode]=useState(false);
  const[optionsOpen,setOptionsOpen]=useState(false); // narrow-view "⋯ More" dropdown

  /* Narrow-view ("side banner") layout: collapse timer building/type-selection
     controls behind a dropdown so the countdown numbers stay the star of the
     show, but keep the quick +time buttons directly reachable. */
  const containerRef=useRef(null);
  const panelWidth=useElementWidth(containerRef);
  const compact=panelWidth>0&&panelWidth<380;
  useEffect(()=>{if(!compact)setOptionsOpen(false);},[compact]);

  useEffect(()=>{load("saved-templates",[]).then(t=>setSavedTemplates(t));load("actions",DEFAULT_ACTIONS).then(a=>{if(a&&a.length)setActions(a);});},[]);
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

  const addTimer=useCallback((name,segments,repeat,paraMode=false)=>{
    const id=Date.now()+Math.random();
    setTimers(p=>[...p,{id,name,segments,running:false,finished:false,currentSegIdx:0,segElapsed:0,repeatInfo:repeat?{...repeat,current:1}:null,paraphraseMode:paraMode}]);
    setSelectedId(prev=>prev||id);
  },[]);

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
    },1000);
    return()=>clearInterval(interval);
  },[continuousAlarm,countdownBeeps]);

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
    <button onClick={onClick} title={help} style={{width:"36px",height:"20px",borderRadius:"10px",border:"none",background:on?"#1a1a2e":"rgba(0,0,0,0.1)",cursor:"pointer",position:"relative",padding:0,flexShrink:0}}><div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:on?"18px":"2px",transition:"left 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/></button>
  );
  const customTimeRow=(
    <div style={{display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>
      <input type="number" value={customMin} onChange={e=>setCustomMin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCustomGo()} placeholder="m" min="0" style={inp} onFocus={e=>e.target.style.borderColor="rgba(0,0,0,0.2)"} onBlur={e=>e.target.style.borderColor="rgba(0,0,0,0.08)"}/>
      <span style={{color:"rgba(0,0,0,0.15)",fontSize:"14px",fontWeight:300}}>:</span>
      <input type="number" value={customSec} onChange={e=>setCustomSec(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCustomGo()} placeholder="s" min="0" max="59" style={inp} onFocus={e=>e.target.style.borderColor="rgba(0,0,0,0.2)"} onBlur={e=>e.target.style.borderColor="rgba(0,0,0,0.08)"}/>
      <button onClick={handleCustomGo} title="Start a fresh timer for this custom time" style={{fontSize:"12px",fontWeight:600,padding:"6px 16px",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer"}}>Go</button>
      {currentId&&<button onClick={handleCustomAdd} title="Add this custom time to the current timer" style={{fontSize:"12px",fontWeight:600,padding:"6px 12px",borderRadius:"7px",border:"1px solid rgba(66,133,244,0.3)",background:"#eaf1fc",color:"#2e6bce",cursor:"pointer"}}>+ Add</button>}
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
          <button onClick={onDismissColdCall} style={{position:"absolute",top:"10px",right:"14px",background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"20px",lineHeight:1}} onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.7)"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>×</button>
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
            {hasColdCall&&(
              <button onClick={onColdCall} title={`Pick from ${activeClass.name} (${activeClass.students.length} students)`} style={{fontSize:"12.5px",fontWeight:600,padding:"8px 14px",borderRadius:"10px",border:"1px solid rgba(26,26,46,0.12)",background:coldCallStudent?"#eaf1fc":"#fff",color:coldCallStudent?"#2e6bce":"rgba(0,0,0,0.45)",cursor:"pointer"}}>🎲 Cold Call</button>
            )}
            <button onClick={()=>setOptionsOpen(o=>!o)} style={{fontSize:"12.5px",fontWeight:600,padding:"8px 12px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.1)",background:optionsOpen?"#f0f1f4":"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer"}}>⋯ More</button>
            {optionsOpen&&(
              <div onMouseDown={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:60,background:"#fff",borderRadius:"12px",boxShadow:"0 4px 24px rgba(0,0,0,0.15)",border:"1px solid rgba(0,0,0,0.08)",padding:"12px",display:"flex",flexDirection:"column",gap:"10px",minWidth:"210px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontWeight:500}}>🔊 Alarm</span>
                  {switchBtn(continuousAlarm,()=>setContinuousAlarm(!continuousAlarm),"Keep the alarm sounding until you dismiss it, instead of one beep")}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",fontWeight:500}}>🔔 Countdown</span>
                  {switchBtn(countdownBeeps,()=>setCountdownBeeps(!countdownBeeps),"Tick in the last 5 seconds of each segment")}
                </div>
                <button onClick={()=>{setShowBuilder(true);setOptionsOpen(false);}} title="Build a custom multi-step timer with named tasks" style={{fontSize:"13px",fontWeight:600,padding:"9px 0",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",width:"100%"}}>+ Build Timer</button>
                {hasTimers&&timers.filter(t=>!t.finished).length>1&&(<button onClick={()=>{startAll();setOptionsOpen(false);}} title="Start every timer that isn't already running" style={{fontSize:"12px",fontWeight:600,padding:"7px 0",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer",width:"100%"}}>Start All</button>)}
                <div style={{borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:"10px"}}>{customTimeRow}</div>
              </div>
            )}
          </div>

          {/* Quick +time — always reachable, reduced to the most-used presets */}
          <div style={{maxWidth:"320px",width:"100%",marginBottom:"20px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px",justifyContent:"center"}}>
              {TIME_PRESETS.filter(p=>COMPACT_PRESET_LABELS.includes(p.label)).map(p=>(
                <button key={p.label} onClick={()=>handlePresetAdd(p.seconds)} title={currentId?"Add to current timer":"Create new timer"} style={{fontSize:"12px",fontWeight:600,padding:"7px 11px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.07)",background:currentId?"#eaf1fc":"#fff",color:currentId?"#2e6bce":"rgba(0,0,0,0.45)",cursor:"pointer"}}>+{p.label}</button>
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
            <button onClick={()=>setShowBuilder(true)} title="Build a custom multi-step timer with named tasks" style={{fontSize:"13.5px",fontWeight:600,padding:"10px 24px",borderRadius:"11px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",boxShadow:"0 2px 10px rgba(26,26,46,0.15)"}} onMouseEnter={e=>e.target.style.background="#2a2a4e"} onMouseLeave={e=>e.target.style.background="#1a1a2e"}>+ Build Timer</button>
            {hasTimers&&timers.filter(t=>!t.finished).length>1&&(<button onClick={startAll} title="Start every timer that isn't already running" style={{fontSize:"12px",fontWeight:600,padding:"8px 16px",borderRadius:"9px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer"}} onMouseEnter={e=>{e.target.style.background="#f0f1f4";}} onMouseLeave={e=>{e.target.style.background="#fff";}}>Start All</button>)}
            {/* Cold Call button — only shows when class has students */}
            {hasColdCall&&(
              <button onClick={onColdCall} title={`Pick from ${activeClass.name} (${activeClass.students.length} students)`} style={{fontSize:"13px",fontWeight:600,padding:"9px 18px",borderRadius:"11px",border:"1px solid rgba(26,26,46,0.12)",background:coldCallStudent?"#eaf1fc":"#fff",color:coldCallStudent?"#2e6bce":"rgba(0,0,0,0.45)",cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="#eaf1fc";e.currentTarget.style.color="#2e6bce";}} onMouseLeave={e=>{e.currentTarget.style.background=coldCallStudent?"#eaf1fc":"#fff";e.currentTarget.style.color=coldCallStudent?"#2e6bce":"rgba(0,0,0,0.45)";}}>🎲 Cold Call</button>
            )}
          </div>

          {/* Time presets */}
          <div style={{maxWidth:"600px",width:"100%",marginBottom:"12px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px",justifyContent:"center"}}>
              {TIME_PRESETS.map(p=>(<div key={p.label} style={{display:"flex"}}><button onClick={()=>handlePresetNew(p.label,p.seconds)} title={`Start a fresh ${p.label} timer`} style={{fontSize:"12.5px",fontWeight:600,padding:"7px 14px",borderRadius:"8px 0 0 8px",border:"1px solid rgba(0,0,0,0.06)",borderRight:"none",background:"#fff",color:"rgba(0,0,0,0.45)",cursor:"pointer"}} onMouseEnter={e=>{e.target.style.background="#f0f1f4";}} onMouseLeave={e=>{e.target.style.background="#fff";}}>{p.label}</button><button onClick={()=>handlePresetAdd(p.seconds)} title={currentId?"Add to current timer":"Create new timer"} style={{fontSize:"14px",fontWeight:500,padding:"0 8px",borderRadius:"0 8px 8px 0",border:"1px solid rgba(0,0,0,0.06)",background:currentId?"#eaf1fc":"#f8f8fa",color:currentId?"#2e6bce":"rgba(0,0,0,0.25)",cursor:"pointer"}} onMouseEnter={e=>{e.target.style.background=currentId?"#d4e4fb":"#eef0f4";}} onMouseLeave={e=>{e.target.style.background=currentId?"#eaf1fc":"#f8f8fa";}}>+</button></div>))}
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
        <div style={{color:"var(--board-muted)",fontSize:"14px",fontStyle:"italic",marginTop:"40px"}}>tap a time or build a timer to get started</div>
      ):(
        <div style={{display:"flex",flexWrap:"wrap",gap:compact?"14px":"20px",justifyContent:"center",maxWidth:"960px"}}>
          {timers.map((t,i)=>(<div key={t.id} style={{animation:`fadeIn 0.4s ease ${i*0.05}s both`}}><TimerCard timer={t} onDelete={deleteTimer} onToggle={toggleTimer} onReset={resetTimer} onSelect={setSelectedId} onDisplay={id=>{setSelectedId(id);setDisplayMode(true);}} isSelected={t.id===currentId} continuousAlarm={continuousAlarm} compact={compact} timerStyle={timerStyle}/></div>))}
        </div>
      )}

      {/* Display mode */}
      {displayMode&&currentTimer&&(
        <DisplayMode timer={currentTimer} onToggle={id=>{toggleTimer(id);if(currentTimer.finished)setDisplayMode(false);}} onReset={resetTimer} onExit={()=>setDisplayMode(false)} continuousAlarm={continuousAlarm} coldCallStudent={coldCallStudent} onDismissColdCall={onDismissColdCall} timerStyle={timerStyle}/>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SEATING PANEL — 5a: room editor
   ══════════════════════════════════════════════════════════ */

/* ── Seat/group constants & helpers ── */
const SW=114,SH=52,SGR=8;
const GROUP_PAD=8,GROUP_BAR_H=22; // group boundary padding + tab-bar height, shared with the off-screen drag clamp

/* Desk wood — same grain + tan gradient as the top banner, so tables read as
   part of the same wooden theme. Layered as a background so a selection tint
   can be stacked on top without losing the texture. */
const WOOD_GRAIN="repeating-linear-gradient(115deg,rgba(255,250,240,0.4) 0px,rgba(255,250,240,0.4) 1px,transparent 1px,transparent 5px)";
const WOOD_FILL="linear-gradient(180deg,#e0c1a0,#d1a97e)";
const WOOD_PALE="linear-gradient(180deg,#efe0cc,#e6d2b8)";
const WOOD_BORDER="rgba(120,85,55,0.38)";
const WOOD_INK="#3b2813";
const woodBg=(tint)=>`${tint?`linear-gradient(${tint},${tint}),`:""}${WOOD_GRAIN},${WOOD_FILL}`;

/* The seating canvas used to always be at least 960×680 data-pixels, even for a
   two-table room — which is often bigger than the panel showing it, so centering
   (whether by scroll position or by flexbox) had no effect: the oversized empty
   canvas was what got "centered", not the actual desks. Sizing it to the real
   content (with a sensible floor) fixes that at the source. */
const canvasContentSize=(seatsIn,roomItemsIn)=>{
  const xs=[0,...(seatsIn||[]).map(s=>s.x+SW),...(roomItemsIn||[]).map(r=>r.x+260)];
  const ys=[0,...(seatsIn||[]).map(s=>s.y+SH),...(roomItemsIn||[]).map(r=>r.y+80)];
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
              <button onClick={()=>onChange(rules.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",color:"rgba(0,0,0,0.2)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"0 2px",flexShrink:0}} onMouseEnter={e=>e.target.style.color="#eb5757"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.2)"}>×</button>
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
              <button key={t} onClick={()=>setNewRule(p=>({...p,type:t}))} style={{flex:1,padding:"4px 0",borderRadius:"6px",border:"none",cursor:"pointer",fontSize:"9.5px",fontWeight:700,background:newRule.type===t?(t==='apart'?"#fdeeed":"#edf7ef"):"rgba(0,0,0,0.04)",color:newRule.type===t?(t==='apart'?"#c44":"#3a8a4e"):"rgba(0,0,0,0.35)",fontFamily:"'Source Sans 3',sans-serif"}}>
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
                    <button onClick={()=>setNewRule(p=>({...p,studentIds:p.studentIds.filter(x=>x!==id)}))} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",fontSize:"12px",lineHeight:1,padding:"0 2px",opacity:0.6}}>×</button>
                  </span>
                );
              })}
            </div>
          )}
          <select value="" onChange={e=>{const id=e.target.value;if(id)setNewRule(p=>({...p,studentIds:[...p.studentIds,id]}));}} style={{padding:"4px 6px",borderRadius:"6px",border:"1px solid rgba(0,0,0,0.09)",fontSize:"11px",fontFamily:"'Source Sans 3',sans-serif",background:"#fff",color:"#1a1a2e",outline:"none"}}>
            <option value="">{newRule.studentIds.length?'+ Add another…':'+ Add a student…'}</option>
            {students.filter(s=>!newRule.studentIds.includes(s.id)).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={()=>{
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
    document.addEventListener("mousedown",away);
    window.addEventListener("scroll",dismiss,true);
    window.addEventListener("resize",dismiss);
    return()=>{document.removeEventListener("mousedown",away);window.removeEventListener("scroll",dismiss,true);window.removeEventListener("resize",dismiss);};
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

// Tag colours. Custom tags used to get whatever COLORS[i] fell out of
// their position in whichever list happened to be rendering them — so the
// same tag could show up a different colour on the seat map than in the
// tag chip list, since one iterates all seats and the other iterates
// avTags. Hashing the tag's own name instead makes the colour depend only
// on the tag, so it's identical everywhere it's ever drawn. Manage Tags
// (see ManageSeatTagsModal) can still override this per class.
const SEAT_TAG_COLS={LS:{t:'#b8850a',b:'#fdf5e6'},EAL:{t:'#2e6bce',b:'#eaf1fc'},Front:{t:'#3a8a4e',b:'#edf7ef'},Girl:{t:'#c44',b:'#fdeeed'},Boy:{t:'#2e6bce',b:'#eaf1fc'}};
const hashStr=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;};
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
      <button onClick={onOpen} title="Open the Checklist tab at this student" style={{width:"100%",padding:"5px 0",borderRadius:"6px",border:"1px dashed rgba(0,0,0,0.15)",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Open in Checklist →</button>
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
/* Structural fingerprint used to detect "has the room layout changed since
   the last save/load" — deliberately ignores who's sitting where. */
const roomStructureKey=(seatsArr,groupsArr,roomItemsArr)=>JSON.stringify({
  seats:(seatsArr||[]).map(s=>({id:s.id,groupId:s.groupId,x:s.x,y:s.y,tags:s.tags,tagRule:s.tagRule,used:s.used,unavailable:s.unavailable})),
  groups:(groupsArr||[]).map(g=>({id:g.id,seatIds:g.seatIds,label:g.label})),
  roomItems:roomItemsArr||[],
});
/* Id-independent room shape — two rooms built separately (e.g. a saved
   arrangement vs. the current layout) never share seat ids, so comparing by
   position is how we tell whether they're really the same physical room. */
const roomShapeSignature=(seatsArr,roomItemsArr)=>JSON.stringify({
  seats:(seatsArr||[]).filter(s=>s.used).map(s=>`${s.x},${s.y}`).sort(),
  roomItems:(roomItemsArr||[]).map(r=>`${r.type}:${r.x},${r.y}`).sort(),
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
  const lockedIds=new Set(usedSeats.filter(s=>s.locked&&s.studentId).map(s=>s.studentId));
  const freeSeats=usedSeats.filter(s=>!s.locked);
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
    for(const seat of untaggedSeats){if(!p.length)break;assign[seat.id]=p.shift().id;}
    // Best-fit mode: fill a tagged seat with whoever's left rather than leave it empty.
    if(!hardTagRules)for(const seat of unmatchedTagged){if(!p.length)break;assign[seat.id]=p.shift().id;}
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
          <button onClick={onLoad} title={`Load "${layout.name}"`}
            style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"4px 6px",flexShrink:0,borderRadius:"5px"}}
            onMouseEnter={e=>e.currentTarget.style.background="#eaf1fc"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}
          >⤓</button>
          <button onClick={()=>setConfirming(true)} title={`Delete "${layout.name}"`}
            style={{background:"none",border:"none",color:"rgba(0,0,0,0.18)",cursor:"pointer",fontSize:"15px",lineHeight:1,padding:"4px 6px",flexShrink:0,borderRadius:"5px"}}
            onMouseEnter={e=>e.target.style.color="#eb5757"}
            onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.18)"}
          >×</button>
        </div>
      ):(
        <div style={{padding:"8px 10px"}}>
          <div style={{fontSize:"11px",fontWeight:600,color:"#c44",marginBottom:"6px",lineHeight:1.4}}>Delete "{layout.name}"?</div>
          <div style={{display:"flex",gap:"4px"}}>
            <button onClick={onDelete}
              style={{flex:1,padding:"5px 0",borderRadius:"6px",border:"none",background:"#eb5757",color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.background="#c44"}
              onMouseLeave={e=>e.currentTarget.style.background="#eb5757"}
            >Delete</button>
            <button onClick={()=>setConfirming(false)}
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

/* ── Manage groups: rename any group from one place, not just the selected one ── */
function ManageGroupsModal({groups,onRename,onDelete,onClose}){
  const inp={padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.09)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:500,outline:"none",fontFamily:"'Source Sans 3',sans-serif"};
  const[confirmDelete,setConfirmDelete]=useState(null); // groupId pending a second click
  return(
    <div style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"360px",maxHeight:"80vh",overflowY:"auto",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage table groups</h2>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button>
      </div>
      {groups.length===0?(
        <p style={{fontSize:"12.5px",color:"rgba(0,0,0,0.35)",lineHeight:1.6,margin:0}}>No table groups yet — group seats together on the canvas first, then come back here to name or delete them.</p>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {groups.map(g=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <input defaultValue={g.label||''} onBlur={e=>onRename(g.id,e.target.value)} onKeyDown={e=>{if(e.key==='Enter')e.target.blur();}} placeholder="Table group name" style={{...inp,flex:1,minWidth:0}}/>
              <span style={{fontSize:"11px",color:"rgba(0,0,0,0.3)",flexShrink:0}}>{g.seatIds.length} seat{g.seatIds.length!==1?'s':''}</span>
              {confirmDelete===g.id?(
                <button onClick={()=>{onDelete(g.id);setConfirmDelete(null);}} title="Click again to confirm — seats stay, they just won't be grouped together anymore"
                  style={{flexShrink:0,padding:"6px 9px",borderRadius:"7px",border:"1px solid rgba(200,60,60,0.3)",background:"#fdeeed",color:"#c44",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                >Confirm?</button>
              ):(
                <button onClick={()=>setConfirmDelete(g.id)} title="Delete this group — seats stay, they just won't be grouped together anymore"
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
    <div style={{background:"#fff",borderRadius:"22px",padding:"28px",boxShadow:"0 8px 60px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)",width:"100%",maxWidth:"420px",maxHeight:"85vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}><h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Manage Tags</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:"22px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button></div>
      <p style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"14px",lineHeight:1.5}}>Add a tag, pick its colour, and choose which students have it — it'll match everywhere: the seat map, the tag list, and per-seat toggles. Tags marked "not in this class's list" ended up on a seat without being added here (often from a loaded layout); delete them if they're not relevant, or leave them — there's no harm keeping a tag around for reuse later.</p>
      <div style={{display:"flex",gap:"4px",marginBottom:"16px"}}>
        <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()} placeholder="New tag…" style={{flex:1,padding:"7px 9px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.09)",background:"#f8f9fb",fontSize:"12.5px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e"}}/>
        <button onClick={handleAdd} style={{padding:"7px 14px",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>+ Add</button>
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
                  <button onClick={()=>onDelete(name)} title={`Delete "${name}" — removes it from every seat and every student`} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:0}}
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
                <button onClick={()=>{setExpanded(isOpen?null:name);setStudentFilter('');}} style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"10.5px",fontWeight:700,padding:0}}>
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
      <button onClick={onClose} style={{width:"100%",padding:"12px",borderRadius:"12px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",marginTop:"16px",flexShrink:0}}>Done</button>
    </div>
  );
}

function ManageSeatingPanel({activeClass,checklist,onChangeChecklist,flagsByStudent,now,showFlags,onSetShowFlags,onGoToChecklist,onUpdateStudentTags}){
  const[seats,setSeats]=useState([]);
  const[groups,setGroups]=useState([]);
  const[roomItems,setRoomItems]=useState([]);
  const[selRoomId,setSelRoomId]=useState(null);
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
  const roomMenu=useAnchoredMenu();
  const randomizeOptionsMenu=useAnchoredMenu();
  const layoutsMenu=useAnchoredMenu();
  const arrangementsMenu=useAnchoredMenu();
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
  const centerCanvas=useCallback((s,ri)=>{
    const canvas=canvasRef.current;
    if(!canvas||!s.length)return;
    const allItems=[...s.filter(x=>x.x!==undefined).map(x=>({x:x.x,y:x.y,w:SW,h:SH})),...(ri||[]).map(r=>({x:r.x,y:r.y,w:SW,h:SH}))];
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
  const centerCanvasWhenReady=useCallback((s,ri)=>{
    let raf1=requestAnimationFrame(()=>{raf1=requestAnimationFrame(()=>centerCanvas(s,ri));});
    const recenter=()=>centerCanvas(s,ri);
    window.addEventListener('resize',recenter);
    const stop=setTimeout(()=>window.removeEventListener('resize',recenter),700);
    return()=>{cancelAnimationFrame(raf1);window.removeEventListener('resize',recenter);clearTimeout(stop);};
  },[centerCanvas]);

  const DEPRECATED_TAGS=new Set(['Front','Board','Window','Door']);
  /* ── Load layout from storage per class ── */
  useEffect(()=>{
    if(!activeClass?.id)return;
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
    load(`sl-${activeClass.id}`,null).then(layout=>{
      if(layout){
        const rawSeats=(layout.seats||[]).map(s=>({...s,tags:(s.tags||[]).filter(t=>!DEPRECATED_TAGS.has(t))}));
        const{seats:loadedSeats,groups:loadedGroups}=repairSeatGroups(rawSeats,layout.groups||[]);
        const loadedRI=layout.roomItems||[];
        setSeats(loadedSeats);
        setGroups(loadedGroups);
        setRoomItems(loadedRI);
        setRules(layout.rules||[]);
        if(layout.tags?.length){
          const cleaned=layout.tags.filter(t=>!DEPRECATED_TAGS.has(t));
          setAvTags(cleaned.length?cleaned:DEFAULT_SEAT_TAGS);
        }
        // If the saved layout had drifted (a past bug could do this), persist the
        // repair immediately so the corruption doesn't keep coming back on load.
        if(JSON.stringify(loadedGroups)!==JSON.stringify(layout.groups||[])){
          save(`sl-${activeClass.id}`,{seats:loadedSeats,groups:loadedGroups,tags:layout.tags,roomItems:loadedRI,rules:layout.rules||[]});
        }
        cleanupCenter=centerCanvasWhenReady(loadedSeats,loadedRI);
        lastCommittedRef.current={seats:loadedSeats,groups:loadedGroups,tags:layout.tags?.length?layout.tags.filter(t=>!DEPRECATED_TAGS.has(t)):DEFAULT_SEAT_TAGS,roomItems:loadedRI,rules:layout.rules||[]};
        roomBaselineRef.current=roomStructureKey(loadedSeats,loadedGroups,loadedRI);
        seatingBaselineRef.current=seatingSignature(loadedSeats);
      } else {
        setSeats([]);setGroups([]);setRoomItems([]);setRules([]);
        lastCommittedRef.current={seats:[],groups:[],tags:DEFAULT_SEAT_TAGS,roomItems:[],rules:[]};
        roomBaselineRef.current=roomStructureKey([],[],[]);
        seatingBaselineRef.current=seatingSignature([]);
      }
      setSel(new Set());setSelRoomId(null);
    });
    return()=>cleanupCenter();
  },[activeClass?.id]);

  /* ── Debounced save (also the one chokepoint every edit flows through, so
     it doubles as where we snapshot undo history) ── */
  const doSave=useCallback((s,g,t,ri,rl)=>{
    if(!activeClass?.id)return;
    if(lastCommittedRef.current){
      undoStackRef.current=[...undoStackRef.current,lastCommittedRef.current].slice(-20);
      setCanUndo(true);
    }
    lastCommittedRef.current={seats:s,groups:g,tags:t,roomItems:ri,rules:rl||[]};
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>save(`sl-${activeClass.id}`,{seats:s,groups:g,tags:t,roomItems:ri,rules:rl||[]}),400);
  },[activeClass?.id]);

  const handleUndo=useCallback(()=>{
    const stack=undoStackRef.current;
    if(!stack.length||!activeClass?.id)return;
    const prev=stack[stack.length-1];
    undoStackRef.current=stack.slice(0,-1);
    setCanUndo(undoStackRef.current.length>0);
    lastCommittedRef.current=prev;
    setSeats(prev.seats);setGroups(prev.groups);setAvTags(prev.tags?.length?prev.tags:DEFAULT_SEAT_TAGS);setRoomItems(prev.roomItems);setRules(prev.rules||[]);
    setSel(new Set());setSelRoomId(null);
    if(saveTimer.current)clearTimeout(saveTimer.current);
    save(`sl-${activeClass.id}`,{seats:prev.seats,groups:prev.groups,tags:prev.tags,roomItems:prev.roomItems,rules:prev.rules||[]});
  },[activeClass?.id]);

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
    const next=[...savedLayouts,template];
    setSavedLayouts(next);
    save('ta-saved-layouts',next);
    roomBaselineRef.current=roomStructureKey(seats,groups,roomItems);
  },[seats,groups,roomItems,savedLayouts]);

  /* ── Load a saved layout template into current class, re-seating whoever
     was already placed as closely as their old groups allow ── */
  const loadLayout=useCallback((template)=>{
    // Re-ID everything so seats are unique to this class instance. Tags on
    // the template's seats are kept as-is (reusing tags across classes is
    // useful, e.g. a "front row" convention) — if one doesn't belong here,
    // it's still fully manageable afterwards via 🎨 Manage in the Tags
    // section (recolour, or delete it and it comes off every seat).
    const idMap={};
    const blankSeats=template.seats.map(s=>{const nid=sUid();idMap[s.id]=nid;return{...s,id:nid,studentId:null,locked:false};});
    const newGroups=template.groups.map(g=>({...g,id:sUid(),seatIds:g.seatIds.map(id=>idMap[id]||id)}));
    const newRI=template.roomItems.map(r=>({...r,id:sUid()}));
    const newSeats=bestFitReseat(seats,blankSeats);
    setSeats(newSeats);setGroups(newGroups);setRoomItems(newRI);
    setSel(new Set());setShowLoadLayout(false);
    doSave(newSeats,newGroups,avTags,newRI,rules);
    roomBaselineRef.current=roomStructureKey(newSeats,newGroups,newRI);
    seatingBaselineRef.current=seatingSignature(newSeats);
  },[seats,avTags,rules,doSave]);

  /* ── Ask first if the current room or seating hasn't been saved/recorded
     yet, so switching layouts can't silently throw either away ── */
  const requestLoadLayout=useCallback((template)=>{
    const layoutDirty=roomBaselineRef.current!==roomStructureKey(seats,groups,roomItems);
    const seatingDirty=seatingBaselineRef.current!==seatingSignature(seats);
    if(layoutDirty||seatingDirty)setPendingLayoutLoad({template,layoutDirty,seatingDirty});
    else loadLayout(template);
  },[seats,groups,roomItems,loadLayout]);

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
    setSeatHistory(prev=>{
      const next=[entry,...prev].slice(0,10);
      save(`sh-${activeClass.id}`,next);
      return next;
    });
    seatingBaselineRef.current=seatingSignature(seats);
  },[activeClass?.id,seats,groups,roomItems]);

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
      const newRI=entry.roomItems.map(r=>({...r}));
      setSeats(newSeats);setGroups(newGroups);setRoomItems(newRI);
      setSel(new Set());
      doSave(newSeats,newGroups,avTags,newRI,rules);
      roomBaselineRef.current=roomStructureKey(newSeats,newGroups,newRI);
      seatingBaselineRef.current=seatingSignature(newSeats);
    }
  },[seats,groups,roomItems,avTags,rules,doSave]);

  /* ── Ask first if there's a room-shape mismatch (offer a best-fit reseat)
     or unrecorded current seating, before restoring an old arrangement ── */
  const requestRestoreArrangement=useCallback((entry)=>{
    const mismatched=roomShapeSignature(seats,roomItems)!==roomShapeSignature(entry.seats,entry.roomItems);
    const seatingDirty=seatingBaselineRef.current!==seatingSignature(seats);
    if(mismatched||seatingDirty)setPendingArrangementLoad({entry,mismatched,seatingDirty});
    else restoreArrangement(entry);
  },[seats,roomItems,restoreArrangement]);

  /* ── Delete a history entry ── */
  const deleteArrangement=useCallback((id)=>{
    if(!activeClass?.id)return;
    const next=seatHistory.filter(h=>h.id!==id);
    setSeatHistory(next);save(`sh-${activeClass.id}`,next);
  },[activeClass?.id,seatHistory]);

  /* ── Display labels for history entries: "SEP 2", or "SEP 2 (1)"/"(2)" when
     more than one was confirmed the same day, numbered by confirm order ── */
  const arrangementLabels=useMemo(()=>{
    const byDay={};
    seatHistory.forEach((h,i)=>{
      const d=new Date(h.createdAt);
      const key=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (byDay[key]=byDay[key]||[]).push(i);
    });
    const labels={};
    Object.values(byDay).forEach(idxs=>{
      const sorted=[...idxs].sort((a,b)=>seatHistory[a].createdAt-seatHistory[b].createdAt);
      const multiple=sorted.length>1;
      sorted.forEach((idx,pos)=>{
        const base=fmtArrangementDate(seatHistory[idx].createdAt);
        labels[seatHistory[idx].id]=multiple?`${base} (${pos+1})`:base;
      });
    });
    return labels;
  },[seatHistory]);

  /* ── Computed seat positions (includes live drag) ── */
  const pos=useMemo(()=>sPosMap(seats,groups,dd),[seats,groups,dd]);
  const canvasSize=useMemo(()=>canvasContentSize(seats,roomItems),[seats,roomItems]);

  const[rubberBand,setRubberBand]=useState(null);

  /* Clamp a whole-group drag delta so no member — or the group's own boundary
     box and tab bar, which sit outside the seats themselves — goes off-screen
     (x or y below 0). Clamps the shared delta, not each seat separately, so the
     group can't be pulled apart or misaligned when it hits the edge. */
  const clampGroupDelta=(dragIds,dx,dy)=>{
    const groupSeats=seats.filter(s=>dragIds.has(s.id));
    if(!groupSeats.length)return{dx,dy};
    const minDx=Math.max(...groupSeats.map(s=>GROUP_PAD-s.x));
    const minDy=Math.max(...groupSeats.map(s=>GROUP_PAD+GROUP_BAR_H-s.y));
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
        setSel(new Set());setSelRoomId(null);setTagConfirm(null);
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
    const finalS=nextS.map(x=>toMove.includes(x.id)?{...x,groupId}:x);
    setSeats(finalS);setGroups(finalG);
    setSel(new Set(finalG.find(g=>g.id===groupId)?.seatIds||[]));setSelType('group');
    doSave(finalS,finalG,avTags,roomItems,rules);
  };

  /* ── Create a brand-new group from these seats, without repositioning them ── */
  const createGroupFromSeats=(seatIds,name)=>{
    const{nextS,nextG}=detachSeatsFromGroups(seatIds);
    const newGid=sUid();
    const label=(name||'').trim().slice(0,20)||nextGroupLabel(nextG);
    const finalG=[...nextG,{id:newGid,seatIds:[...seatIds],label}];
    const finalS=nextS.map(x=>seatIds.includes(x.id)?{...x,groupId:newGid}:x);
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
    const finalG=[...nextG,{id:newGid,seatIds:[...seatIds],label}];
    const finalS=nextS.map(x=>seatIds.includes(x.id)?{...x,groupId:newGid,x:posMap[x.id]?.x??x.x,y:posMap[x.id]?.y??x.y}:x);
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
    let didSomething=false;
    let nextS=seats,nextG=groups,nextRI=roomItems;
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

  /* ── Add room item (teacher's desk or door) ── */
  const addRoomItem=type=>{
    const offset=sSnap((roomItems.length*32)%240);
    const ri={id:sUid(),type,x:80+offset,y:80+offset,rotation:0};
    const nextRI=[...roomItems,ri];
    setRoomItems(nextRI);doSave(seats,groups,avTags,nextRI,rules);
  };

  /* ── Drag a room item ── */
  const handleRoomItemMD=(e,id)=>{
    if(e.button!==0)return;
    e.stopPropagation();
    if(e.shiftKey||e.metaKey||e.ctrlKey){e.preventDefault();return;}
    e.preventDefault();
    setSel(new Set());setSelRoomId(id);
    const item=roomItems.find(r=>r.id===id);if(!item)return;
    const sx=e.clientX,sy=e.clientY;
    let cx=item.x,cy=item.y;
    const mm=e2=>{
      cx=sSnap(Math.max(0,item.x+(e2.clientX-sx)/zoom));
      cy=sSnap(Math.max(0,item.y+(e2.clientY-sy)/zoom));
      setRoomItems(p=>p.map(r=>r.id===id?{...r,x:cx,y:cy}:r));
    };
    const mu=()=>{
      window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);
      const nextRI=roomItems.map(r=>r.id===id?{...r,x:cx,y:cy}:r);
      setRoomItems(nextRI);doSave(seats,groups,avTags,nextRI,rules);
    };
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
  };

  /* ── Rotate a door 90° ── */
  const rotateRoomItem=id=>{
    const nextRI=roomItems.map(r=>r.id===id?{...r,rotation:(r.rotation+90)%360}:r);
    setRoomItems(nextRI);doSave(seats,groups,avTags,nextRI,rules);
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
    const res=randomizeSeating({students:activeClass?.students||[],seats,rules,smartShuffle,hardTagRules,pairingHistory:seatPairingHistory});
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
          return seat?.used&&mx>=p.x&&mx<=p.x+SW&&my>=p.y&&my<=p.y+SH;
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

  /* Keep kbRef fresh on every render — must be after all handlers are defined */
  kbRef.current={handleDelete,addTable,addRoomItem,randomize};

  const btnS={padding:"7px 10px",borderRadius:"7px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.12s"};

  return(
    <div style={{display:"flex",height:"100%",fontFamily:"'Source Sans 3',sans-serif",overflow:"hidden"}}>

      {/* ── Left column ── */}
      <div style={{width:"188px",flexShrink:0,padding:"12px 10px",display:"flex",flexDirection:"column",gap:"14px",overflowY:"auto",background:"#fafbfc",borderRight:"1px solid rgba(0,0,0,0.06)"}}>

        {/* Randomize + Smart shuffle */}
        {activeClass&&seats.some(s=>s.used)&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            <button onClick={randomize} title="Randomly seat students into the used seats, respecting seat tags and keep-apart/together rules" style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",letterSpacing:"0.3px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"}
              onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
            >🎲 Randomize</button>
            <button onClick={confirmSeating} title="Save who's sitting where right now to Previous Arrangements" style={{width:"100%",padding:"8px",borderRadius:"9px",border:"1px solid rgba(46,142,88,0.3)",background:"#eefaf1",color:"#2e8e58",fontSize:"12px",fontWeight:700,cursor:"pointer",letterSpacing:"0.2px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#dff3e5"}
              onMouseLeave={e=>e.currentTarget.style.background="#eefaf1"}
            >✓ Confirm seating</button>
            <div ref={randomizeOptionsMenu.anchorRef} style={{position:"relative"}}>
              <button onClick={randomizeOptionsMenu.toggle} title="Options for how Randomize fills seats" style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${randomizeOptionsMenu.pos?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:randomizeOptionsMenu.pos?"#eaf1fc":"transparent",cursor:"pointer",fontSize:"11px",fontWeight:600,color:"rgba(0,0,0,0.5)",fontFamily:"'Source Sans 3',sans-serif"}}>
                <span>⚙ Randomize options</span>
                <span style={{fontSize:"9px"}}>▾</span>
              </button>
            </div>
            {randomizeOptionsMenu.pos&&createPortal(
              <div ref={randomizeOptionsMenu.menuRef} style={{position:"fixed",left:randomizeOptionsMenu.pos.left,...(randomizeOptionsMenu.pos.top!=null?{top:randomizeOptionsMenu.pos.top}:{bottom:randomizeOptionsMenu.pos.bottom}),maxHeight:randomizeOptionsMenu.pos.maxHeight,overflowY:"auto",zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",minWidth:"210px",display:"flex",flexDirection:"column",gap:"4px",fontFamily:"'Source Sans 3',sans-serif"}}>
                <button onClick={()=>{const n=!smartShuffle;setSmartShuffle(n);save('seating-rand-opts',{smartShuffle:n,hardTagRules});}} title="Avoid reseating students next to someone they've already sat beside recently" style={{width:"100%",display:"flex",alignItems:"center",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${smartShuffle?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:smartShuffle?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start"}}>
                  <div style={{width:"28px",height:"15px",borderRadius:"8px",background:smartShuffle?"#2e6bce":"rgba(0,0,0,0.12)",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
                    <div style={{width:"11px",height:"11px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:smartShuffle?"15px":"2px",transition:"left 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 2px rgba(0,0,0,0.2)"}}/>
                  </div>
                  <span style={{fontSize:"11px",fontWeight:600,color:smartShuffle?"#2e6bce":"rgba(0,0,0,0.4)"}}>Smart shuffle</span>
                </button>
                <button onClick={()=>{const n=!hardTagRules;setHardTagRules(n);save('seating-rand-opts',{smartShuffle,hardTagRules:n});}} title={hardTagRules?"Seats with a tag (e.g. Front, EAL) stay empty rather than seat a student who doesn't match":"Every seat gets filled — tag rules get broken if there aren't enough matching students"}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${!hardTagRules?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:!hardTagRules?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start"}}>
                  <div style={{width:"28px",height:"15px",borderRadius:"8px",background:!hardTagRules?"#2e6bce":"rgba(0,0,0,0.12)",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
                    <div style={{width:"11px",height:"11px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:!hardTagRules?"15px":"2px",transition:"left 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 2px rgba(0,0,0,0.2)"}}/>
                  </div>
                  <span style={{fontSize:"11px",fontWeight:600,color:!hardTagRules?"#2e6bce":"rgba(0,0,0,0.4)"}}>{hardTagRules?"Hard tag rules":"Best fit (fill every seat)"}</span>
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
          <button onClick={()=>onSetShowFlags?.(!showFlags)} title="Show a 🚩 dot next to students with flagged checklist items in the Seating tab (the Seating tab's own 🚩 toggle is the same setting)" style={{width:"100%",display:"flex",alignItems:"center",gap:"7px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${showFlags?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:showFlags?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start",fontFamily:"'Source Sans 3',sans-serif"}}>
            <div style={{width:"28px",height:"15px",borderRadius:"8px",background:showFlags?"#2e6bce":"rgba(0,0,0,0.12)",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
              <div style={{width:"11px",height:"11px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:showFlags?"15px":"2px",transition:"left 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 2px rgba(0,0,0,0.2)"}}/>
            </div>
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

        {/* Add table presets — tucked into a popover so the six presets don't
            sit permanently expanded, taking up a third of a narrow sidebar */}
        <div ref={addTableMenu.anchorRef} style={{position:"relative"}}>
          <button onClick={addTableMenu.toggle} title="Add a new desk or table to the room" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:addTableMenu.pos?"#f0f1f4":"#fff"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
            onMouseLeave={e=>e.currentTarget.style.background=addTableMenu.pos?"#f0f1f4":"#fff"}
          ><span>+ Add table</span><span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span></button>
          {groups.length>0&&(
            <button onClick={()=>setShowManageGroups(true)} style={{...btnS,marginTop:"6px",fontSize:"11px",width:"100%",textAlign:"left"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >🏷 Manage table groups…</button>
          )}
        </div>
        {addTableMenu.pos&&createPortal(
          <div ref={addTableMenu.menuRef} style={{position:"fixed",left:addTableMenu.pos.left,...(addTableMenu.pos.top!=null?{top:addTableMenu.pos.top}:{bottom:addTableMenu.pos.bottom}),maxHeight:addTableMenu.pos.maxHeight,overflowY:"auto",zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"216px",fontFamily:"'Source Sans 3',sans-serif"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
              {[
                {n:1,o:'H',label:'1 seat',lay:[{c:0,r:0}]},
                {n:2,o:'H',label:'2 horiz',lay:[{c:0,r:0},{c:1,r:0}]},
                {n:2,o:'V',label:'2 vert',lay:[{c:0,r:0},{c:0,r:1}]},
                {n:3,o:'H',label:'3 horiz',lay:[{c:0,r:0},{c:1,r:0},{c:2,r:0}]},
                {n:3,o:'V',label:'3 vert',lay:[{c:0,r:0},{c:0,r:1},{c:0,r:2}]},
                {n:4,o:'H',label:'4 seats',lay:[{c:0,r:0},{c:1,r:0},{c:0,r:1},{c:1,r:1}]},
              ].map(({n,o,label,lay})=>{
                const maxC=Math.max(...lay.map(l=>l.c));
                const maxR=Math.max(...lay.map(l=>l.r));
                return(
                  <button key={`${n}${o}`} onClick={()=>{addTable(n,o);addTableMenu.close();}} title={n===1?"Add one ungrouped seat":`Add a table of ${n} seats, grouped together`} style={{...btnS,padding:"8px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:"5px"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                    onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                  >
                    <div style={{display:"grid",gridTemplateColumns:`repeat(${maxC+1},10px)`,gridTemplateRows:`repeat(${maxR+1},8px)`,gap:"1px"}}>
                      {lay.map((l,i)=><div key={i} style={{gridColumn:l.c+1,gridRow:l.r+1,background:"rgba(0,0,0,0.2)",borderRadius:"1px"}}/>)}
                    </div>
                    <span style={{fontSize:"10px",color:"rgba(0,0,0,0.35)"}}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}

        {/* Room items — same popover treatment as Add table */}
        <div ref={roomMenu.anchorRef} style={{position:"relative"}}>
          <button onClick={roomMenu.toggle} title="Add a non-seat item to the room — desk, board, door" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:roomMenu.pos?"#f0f1f4":"#fff"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
            onMouseLeave={e=>e.currentTarget.style.background=roomMenu.pos?"#f0f1f4":"#fff"}
          ><span>+ Add room item</span><span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span></button>
        </div>
        {roomMenu.pos&&createPortal(
          <div ref={roomMenu.menuRef} style={{position:"fixed",left:roomMenu.pos.left,...(roomMenu.pos.top!=null?{top:roomMenu.pos.top}:{bottom:roomMenu.pos.bottom}),maxHeight:roomMenu.pos.maxHeight,overflowY:"auto",zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"6px",minWidth:"168px",display:"flex",flexDirection:"column",gap:"4px",fontFamily:"'Source Sans 3',sans-serif"}}>
            <button onClick={()=>{addRoomItem('desk');roomMenu.close();}} title="Mark where the teacher's desk sits in the room" style={{...btnS,display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >
              <div style={{width:"20px",height:"12px",borderRadius:"2px",background:"#d4b896",flexShrink:0}}/>
              <span style={{fontSize:"11px"}}>Teacher's desk</span>
            </button>
            <button onClick={()=>{addRoomItem('board');roomMenu.close();}} title="Mark where the whiteboard/screen is" style={{...btnS,display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >
              <div style={{width:"22px",height:"7px",borderRadius:"1px",background:"#a8b8a8",flexShrink:0}}/>
              <span style={{fontSize:"11px"}}>Board</span>
            </button>
            <button onClick={()=>{addRoomItem('door');roomMenu.close();}} title="Mark where the door is" style={{...btnS,display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" style={{flexShrink:0}}>
                <line x1="2" y1="2" x2="2" y2="16" stroke="#88aabb" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="2" y1="2" x2="14" y2="2" stroke="#88aabb" strokeWidth="2" strokeLinecap="round"/>
                <path d="M 2 16 A 14 14 0 0 1 16 2" fill="none" stroke="#88aabb" strokeWidth="1.5" strokeDasharray="3,2"/>
              </svg>
              <span style={{fontSize:"11px"}}>Door</span>
            </button>
          </div>,
          document.body
        )}
        {sel.size>0&&(
          <div>
            <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase",marginBottom:"8px"}}>
              Selected ({sel.size})
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
              {sel.size>=2&&(
                <button onClick={handleGroup} title="Combine the selected desks into one table group" style={{...btnS,background:"#eaf1fc",color:"#2e6bce",border:"1px solid rgba(66,133,244,0.2)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#d4e4fb"}
                  onMouseLeave={e=>e.currentTarget.style.background="#eaf1fc"}
                >Group</button>
              )}
              {anyGrouped&&(
                <button onClick={handleUngroup} title="Dissolve the table group — seats stay where they are" style={btnS}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >Ungroup</button>
              )}
              {!isGrpSel&&selSeats.length===1&&(
                <button onClick={()=>{const s=selSeats[0];const nextS=seats.map(x=>x.id===s.id?{...x,used:!x.used}:x);setSeats(nextS);doSave(nextS,groups,avTags,roomItems,rules);}} title={selSeats[0].used?"Take this seat out of use — it won't be filled by Randomize":"Put this seat back into use"} style={btnS}
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
                  <button onClick={toggleUnavailable}
                    style={{...btnS,background:allUnavailable?"#fdeeed":"#fff",color:allUnavailable?"#c44":"rgba(0,0,0,0.5)",border:allUnavailable?"1px solid rgba(200,60,60,0.2)":"1px solid rgba(0,0,0,0.08)"}}
                    onMouseEnter={e=>e.currentTarget.style.background=allUnavailable?"#f9dede":"#f0f1f4"}
                    onMouseLeave={e=>e.currentTarget.style.background=allUnavailable?"#fdeeed":"#fff"}
                    title={isGrpSel?"Toggle unavailable for whole group":"Toggle unavailable"}
                  >{allUnavailable?'✓ Unavailable':anyUnavailable?'Unavailable (partial)':'Mark unavailable'}</button>
                );
              })()}
              <button onClick={handleDelete} title="Remove the selected seat(s) or room item from the room entirely" style={{...btnS,color:"#c44",border:"1px solid rgba(200,60,60,0.15)"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#fdeeed";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fff";}}
              >Delete</button>
            </div>
          </div>
        )}

        {/* Saved layouts — tucked into a popover; the list can get long and
            doesn't need to sit permanently expanded in the sidebar */}
        <div style={{borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:"14px"}}>
          <div ref={layoutsMenu.anchorRef} style={{position:"relative"}}>
            <button onClick={layoutsMenu.toggle} title="Save this room layout to reuse for another class, or load a saved one" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:layoutsMenu.pos?"#f0f1f4":"#fff"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background=layoutsMenu.pos?"#f0f1f4":"#fff"}
            >
              <span>📁 Layouts{savedLayouts.length>0?` (${savedLayouts.length})`:''}</span>
              <span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span>
            </button>
          </div>
        </div>
        {layoutsMenu.pos&&createPortal(
          <div ref={layoutsMenu.menuRef} style={{position:"fixed",left:layoutsMenu.pos.left,...(layoutsMenu.pos.top!=null?{top:layoutsMenu.pos.top}:{bottom:layoutsMenu.pos.bottom}),zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"216px",maxHeight:Math.min(360,layoutsMenu.pos.maxHeight),overflowY:"auto",display:"flex",flexDirection:"column",gap:"6px",fontFamily:"'Source Sans 3',sans-serif"}}>
            {!showSaveLayout?(
              <button onClick={()=>{setLayoutName('');setShowSaveLayout(true);}} title="Save the room shape (tables, tags, rules) as a reusable template" style={{...btnS,fontSize:"11px",width:"100%",textAlign:"left"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                onMouseLeave={e=>e.currentTarget.style.background="#fff"}
              >💾 Save current layout…</button>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                <input value={layoutName} onChange={e=>setLayoutName(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&layoutName.trim()){saveLayout(layoutName);setShowSaveLayout(false);}if(e.key==='Escape')setShowSaveLayout(false);}}
                  autoFocus placeholder="Layout name…"
                  style={{padding:"6px 8px",borderRadius:"7px",border:"1px solid rgba(66,133,244,0.4)",background:"#fff",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e"}}
                />
                <div style={{display:"flex",gap:"4px"}}>
                  <button onClick={()=>{if(layoutName.trim()){saveLayout(layoutName);setShowSaveLayout(false);}}}
                    title="Save with this name" style={{...btnS,flex:1,background:"#1a1a2e",color:"#fff",border:"none",fontSize:"11px",padding:"5px 0"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"}
                    onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
                  >Save</button>
                  <button onClick={()=>setShowSaveLayout(false)} title="Cancel" style={{...btnS,fontSize:"11px",padding:"5px 8px"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
                    onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                  >Cancel</button>
                </div>
              </div>
            )}
            {savedLayouts.length===0&&!showSaveLayout&&(
              <div style={{fontSize:"11px",color:"rgba(0,0,0,0.22)",fontStyle:"italic"}}>No saved layouts yet</div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
              {savedLayouts.map(l=>(
                <LayoutCard key={l.id} layout={l} onLoad={()=>{requestLoadLayout(l);layoutsMenu.close();}} onDelete={()=>deleteLayout(l.id)}/>
              ))}
            </div>
          </div>,
          document.body
        )}

        {/* Previous arrangements — auto history of confirmed seatings, last 10,
            also tucked into a popover */}
        <div>
          <div ref={arrangementsMenu.anchorRef} style={{position:"relative"}}>
            <button onClick={arrangementsMenu.toggle} title="Restore who was sitting where from an earlier confirmed seating" style={{...btnS,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:arrangementsMenu.pos?"#f0f1f4":"#fff"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"}
              onMouseLeave={e=>e.currentTarget.style.background=arrangementsMenu.pos?"#f0f1f4":"#fff"}
            >
              <span>🕐 Previous arrangements{seatHistory.length>0?` (${seatHistory.length})`:''}</span>
              <span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>▾</span>
            </button>
          </div>
        </div>
        {arrangementsMenu.pos&&createPortal(
          <div ref={arrangementsMenu.menuRef} style={{position:"fixed",left:arrangementsMenu.pos.left,...(arrangementsMenu.pos.top!=null?{top:arrangementsMenu.pos.top}:{bottom:arrangementsMenu.pos.bottom}),zIndex:500,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.14)",padding:"8px",width:"216px",maxHeight:Math.min(360,arrangementsMenu.pos.maxHeight),overflowY:"auto",display:"flex",flexDirection:"column",gap:"4px",fontFamily:"'Source Sans 3',sans-serif"}}>
            {seatHistory.length===0&&(
              <div style={{fontSize:"11px",color:"rgba(0,0,0,0.22)",fontStyle:"italic"}}>Hit "Confirm seating" above to start keeping a history</div>
            )}
            {seatHistory.map(h=>(
              <LayoutCard key={h.id} layout={{...h,name:arrangementLabels[h.id]}} onLoad={()=>{requestRestoreArrangement(h);arrangementsMenu.close();}} onDelete={()=>deleteArrangement(h.id)}/>
            ))}
          </div>,
          document.body
        )}

        {/* Remove all students */}
        <button onClick={()=>{const nextS=seats.map(s=>({...s,studentId:null,locked:false}));setSeats(nextS);doSave(nextS,groups,avTags,roomItems,rules);}}
          title="Empty every seat, unlock everything — the room layout itself is untouched" style={{...btnS,width:"100%",marginTop:"auto",color:"rgba(0,0,0,0.35)",fontSize:"11px"}}
          onMouseEnter={e=>{e.currentTarget.style.color="#c44";e.currentTarget.style.borderColor="rgba(200,60,60,0.2)";}}
          onMouseLeave={e=>{e.currentTarget.style.color="rgba(0,0,0,0.35)";e.currentTarget.style.borderColor="rgba(0,0,0,0.08)";}}
        >Remove all students</button>
      </div>

      {/* ── Canvas ── */}
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
      <div ref={canvasRef} onMouseDown={handleCanvasMD}
        style={{position:"absolute",inset:0,overflow:"auto",
          // Scroll-position centering (below) only helps once content is bigger
          // than the viewport — when it's smaller, there's nothing to scroll, so
          // it just sits at the top-left. Flex-centering the single content div
          // handles that case directly; "safe" keeps it from clipping content
          // against the top-left edge once it *does* overflow.
          display:"flex",justifyContent:"safe center",alignItems:"safe center",
          backgroundImage:"radial-gradient(circle,#c8cad2 1.2px,transparent 1.2px)",
          backgroundSize:"32px 32px",backgroundColor:"#f0f2f5",cursor:"default"
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

          {/* ── Room items: teacher's desk and door ── */}
          {roomItems.map(item=>{
            const isSelRI=selRoomId===item.id;
            if(item.type==='desk'){
              const rot=item.rotation||0;
              const dw=rot===90||rot===270?SH:SW,dh=rot===90||rot===270?SW:SH;
              return(
                <div key={item.id} onMouseDown={e=>handleRoomItemMD(e,item.id)}
                  onClick={e=>{e.stopPropagation();setSel(new Set());setSelRoomId(item.id);}}
                  onDoubleClick={e=>{e.stopPropagation();rotateRoomItem(item.id);}}
                  title="Double-click to rotate"
                  style={{
                    position:"absolute",left:item.x,top:item.y,
                    width:dw,height:dh,borderRadius:"8px",
                    background:"linear-gradient(145deg,#faf5ee,#f0e8d8)",
                    border:isSelRI?"2px solid #c8a06a":"1.5px solid #d4b896",
                    boxShadow:isSelRI?"0 2px 12px rgba(200,160,100,0.25)":"0 2px 8px rgba(0,0,0,0.07)",
                    cursor:"grab",userSelect:"none",display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",gap:"3px",
                  }}
                >
                  <div style={{fontSize:"11px",fontWeight:700,color:"#8a7060",letterSpacing:"0.5px",textTransform:"uppercase",transform:rot===90||rot===270?"rotate(90deg)":"none"}}>Teacher's Desk</div>
                  {isSelRI&&<div style={{fontSize:"8.5px",color:"rgba(0,0,0,0.25)",whiteSpace:"nowrap",transform:rot===90||rot===270?"rotate(90deg)":"none"}}>dbl-click: rotate · Del: remove</div>}
                </div>
              );
            }
            if(item.type==='door'){
              const W=64,H=64;
              return(
                <div key={item.id} onMouseDown={e=>handleRoomItemMD(e,item.id)}
                  onClick={e=>{e.stopPropagation();setSel(new Set());setSelRoomId(item.id);}}
                  onDoubleClick={e=>{e.stopPropagation();rotateRoomItem(item.id);}}
                  title="Double-click to rotate"
                  style={{
                    position:"absolute",left:item.x,top:item.y,
                    width:W,height:H,
                    border:isSelRI?"2px solid #4a9ab0":"1.5px solid transparent",
                    borderRadius:"4px",cursor:"grab",userSelect:"none",
                    transform:`rotate(${item.rotation}deg)`,
                    transformOrigin:"top left",
                  }}
                >
                  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                    {/* Wall stub */}
                    <line x1="6" y1="4" x2="6" y2="58" stroke="#6a9aaa" strokeWidth="5" strokeLinecap="round"/>
                    {/* Door slab — closed position, horizontal from hinge */}
                    <line x1="6" y1="6" x2="58" y2="6" stroke="#6a9aaa" strokeWidth="3.5" strokeLinecap="round"/>
                    {/* Swing arc — quarter circle from slab tip back to wall */}
                    <path d="M 58 6 A 52 52 0 0 1 6 58" fill="rgba(100,180,200,0.08)" stroke="#6a9aaa" strokeWidth="1.5"/>
                  </svg>
                  {isSelRI&&(
                    <div style={{position:"absolute",bottom:-18,left:"50%",transform:"translateX(-50%)",fontSize:"8.5px",color:"rgba(0,0,0,0.35)",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif",fontWeight:600}}>dbl-click: rotate</div>
                  )}
                </div>
              );
            }
            if(item.type==='board'){
              return(
                <div key={item.id} onMouseDown={e=>handleRoomItemMD(e,item.id)}
                  onClick={e=>{e.stopPropagation();setSel(new Set());setSelRoomId(item.id);}}
                  onDoubleClick={e=>{e.stopPropagation();rotateRoomItem(item.id);}}
                  title="Double-click to rotate"
                  style={{
                    position:"absolute",left:item.x,top:item.y,
                    width: item.rotation===90||item.rotation===270 ? 36 : 260,
                    height: item.rotation===90||item.rotation===270 ? 260 : 36,
                    borderRadius:"5px",
                    background:"linear-gradient(180deg,#e8ebe8 0%,#d8dcd6 100%)",
                    border:isSelRI?"2px solid #7a9a7a":"1.5px solid #a8b8a8",
                    boxShadow:isSelRI?"0 2px 10px rgba(100,140,100,0.2)":"0 1px 4px rgba(0,0,0,0.08)",
                    cursor:"grab",userSelect:"none",display:"flex",
                    alignItems:"center",justifyContent:"center",
                  }}
                >
                  <span style={{
                    fontSize:"10px",fontWeight:700,color:"#5a7a5a",letterSpacing:"1.5px",
                    textTransform:"uppercase",
                    transform: item.rotation===90||item.rotation===270?"rotate(90deg)":"none",
                  }}>Board</span>
                  {isSelRI&&(
                    <div style={{position:"absolute",bottom:-18,left:"50%",transform:"translateX(-50%)",fontSize:"8.5px",color:"rgba(0,0,0,0.35)",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif",fontWeight:600}}>dbl-click: rotate · Del: remove</div>
                  )}
                </div>
              );
            }
            return null;
          })}

          {/* Group boundary + tab. The tab is a full-width bar sitting on top of the
              group, like a folder tab — always visible and always clickable, so it
              doubles as "here's a group" and "click here to select the whole thing."
              Three states: neutral (unrelated to current selection), soft (an
              individual member is selected — the rest of the group is lightly
              tinted), full (the group itself is selected via its tab). */}
          {groups.map((g,gi)=>{
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
            const borderCol=isFull?"rgba(66,133,244,0.55)":isSoft?"rgba(66,133,244,0.3)":"rgba(120,85,55,0.45)";
            return(
              <div key={`gb-${g.id}`}>
                {/* Boundary around the desks */}
                <div style={{
                  position:"absolute",left:gb.x-PAD,top:gb.y-PAD,
                  width:gb.w+PAD*2,height:gb.h+PAD*2,
                  borderRadius:"0 0 12px 12px",
                  background:isFull?"rgba(66,133,244,0.08)":isSoft?"rgba(66,133,244,0.035)":"transparent",
                  border:`${isFull?"2px":"1.5px"} ${isFull?"solid":"dashed"} ${borderCol}`,borderTop:"none",
                  boxShadow:isFull?"0 0 0 1px rgba(66,133,244,0.1)":"none",
                  pointerEvents:"none",transition:"border 0.15s,background 0.15s",
                }}/>
                {/* Tab bar — click to select the whole group, drag to move it */}
                <button onMouseDown={e=>handleGroupTabMD(e,g.id)} title="Select or drag the whole group" style={{
                  position:"absolute",left:gb.x-PAD,top:gb.y-PAD-BAR_H,
                  width:gb.w+PAD*2,height:BAR_H,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
                  borderRadius:"10px 10px 0 0",
                  background:isFull?"#2e6bce":isSoft?"rgba(66,133,244,0.12)":`${WOOD_GRAIN},linear-gradient(180deg,rgba(224,193,160,0.75),rgba(209,169,126,0.75))`,
                  border:`${isFull?"2px":"1.5px"} ${isFull?"solid":"dashed"} ${borderCol}`,borderBottom:"none",
                  cursor:"grab",fontFamily:"'Source Sans 3',sans-serif",
                }}>
                  <span style={{fontSize:"11px",lineHeight:1,opacity:isFull?1:0.7}}>👥</span>
                  <span style={{fontSize:"11px",fontWeight:800,letterSpacing:"0.3px",lineHeight:1,color:isFull?"#fff":"rgba(74,49,28,0.85)",maxWidth:"70%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.label||String(gi+1)}</span>
                </button>
              </div>
            );
          })}

          {/* Seat rectangles */}
          {seats.map(s=>{
            const p=pos[s.id];if(!p)return null;
            const isSel=sel.has(s.id);
            const isGroupMate=singleSeatGroupMates.has(s.id);
            const cleanTags=s.tags.filter(t=>!DEPRECATED_TAGS.has(t));
            const inActiveGroup=activeGroupId&&s.groupId===activeGroupId;
            return(
              <div key={s.id}
                onClick={e=>{e.stopPropagation();handleSeatClick(e,s.id);}}
                onMouseDown={e=>e.stopPropagation()} // prevent canvas clearing selection
                style={{
                  position:"absolute",left:p.x,top:p.y,width:SW,height:SH,
                  borderRadius:"7px",
                  background:s.unavailable?"linear-gradient(180deg,#f2d6cc,#e9c3b6)":!s.used?WOOD_PALE:isSel?woodBg("rgba(66,133,244,0.16)"):isGroupMate?woodBg("rgba(66,133,244,0.08)"):woodBg(),
                  border:isSel?"2px solid #2e6bce":s.unavailable?"1.5px solid rgba(200,60,60,0.4)":isGroupMate?"1.5px dashed rgba(66,133,244,0.55)":!s.used?"1.5px dashed rgba(120,85,55,0.35)":`1.5px solid ${WOOD_BORDER}`,
                  boxShadow:isSel?"0 2px 10px rgba(66,133,244,0.25)":"0 1px 4px rgba(74,49,28,0.18)",
                  userSelect:"none",display:"flex",flexDirection:"column",
                  boxSizing:"border-box",overflow:"visible",transition:"border 0.12s,background 0.12s",
                  cursor:"default",
                }}
              >
                {/* Add/remove-from-active-group toggle — only while a group tab is selected */}
                {activeGroupId&&(
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
                {/* Drag tab — grab anywhere on this strip to move the desk */}
                <div onMouseDown={e=>handleSeatMD(e,s.id)} title="Drag to move this desk" style={{
                  height:"16px",flexShrink:0,
                  background:isSel?"rgba(66,133,244,0.16)":isGroupMate?"rgba(66,133,244,0.08)":"rgba(120,85,55,0.16)",
                  borderBottom:`1px solid ${isSel?"rgba(66,133,244,0.2)":"rgba(120,85,55,0.22)"}`,
                  borderRadius:"7px 7px 0 0",
                  display:"flex",alignItems:"center",justifyContent:"flex-end",
                  padding:"0 5px",cursor:"grab",
                }}>
                  {/* Tag dots (colour indicator only) + drag dots */}
                  <div style={{display:"flex",alignItems:"center",gap:"3px",flexShrink:0}}>
                    {cleanTags.map((t,i)=>{const tc=colorFor(t);return(
                      <div key={t} title={t} style={{width:"8px",height:"8px",borderRadius:"50%",background:tc.t,opacity:0.75,flexShrink:0}}/>
                    );})}
                    <div style={{display:"flex",gap:"2px",marginLeft:cleanTags.length?"2px":"0"}}>
                      {[0,1,2].map(i=><div key={i} style={{width:"3px",height:"3px",borderRadius:"50%",background:isSel?"rgba(66,133,244,0.55)":"rgba(74,49,28,0.35)"}}/>)}
                    </div>
                  </div>
                </div>

                {/* Student name area */}
                <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"3px 6px",position:"relative",overflow:"hidden"}}>
                  {s.studentId?(()=>{
                    const st=studentById(s.studentId);
                    const mismatch=cleanTags.length>0&&st&&!studentMatchesSeat(st,s);
                    return st?(
                      <div style={{width:"100%",position:"relative"}}>
                        {/* Tag mismatch warning */}
                        {mismatch&&(
                          <div title={`${st.name} doesn't match this seat's tag rule`} style={{position:"absolute",top:"-2px",right:"14px",zIndex:3,fontSize:"9px",lineHeight:1,background:"#eb5757",color:"#fff",borderRadius:"50%",width:"13px",height:"13px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,cursor:"default"}}>!</div>
                        )}
                        {/* Lock icon — only when student is present */}
                        <button onClick={e=>{e.stopPropagation();toggleLock(s.id);}}
                          title={s.locked?"Unlock":"Lock student here"}
                          style={{position:"absolute",top:"50%",transform:"translateY(-50%)",right:"3px",background:"none",border:"none",cursor:"pointer",fontSize:"10px",opacity:s.locked?0.9:0.3,padding:"1px",lineHeight:1,zIndex:2}}
                          onMouseEnter={e=>{e.target.style.opacity="1";}}
                          onMouseLeave={e=>{e.target.style.opacity=s.locked?"0.9":"0.3";}}
                        >{s.locked?"🔒":"🔓"}</button>
                        {/* Name — click for tags/flags, drag to move */}
                        <div onMouseDown={e=>{e.stopPropagation();!s.locked&&startStudentDrag(e,s.studentId,s.id);}}
                          onClick={e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}}
                          style={{fontSize:"11px",fontWeight:700,color:s.locked?"#1f4fa3":mismatch?"#c0392b":"#1a1a2e",textAlign:"center",lineHeight:1.25,wordBreak:"break-word",cursor:s.locked?"default":"grab",background:"#fff",borderRadius:"6px",padding:"3px 17px 3px 7px",boxShadow:"0 1px 2px rgba(74,49,28,0.22)",userSelect:"none"}}
                        >{st.name}</div>
                        {/* × remove */}
                        {!s.locked&&(
                          <button onClick={e=>{e.stopPropagation();removeFromSeat(s.id);}}
                            title="Remove this student from the seat" style={{position:"absolute",top:"-3px",left:"-3px",background:"rgba(220,60,60,0.12)",border:"none",borderRadius:"50%",cursor:"pointer",fontSize:"12px",color:"rgba(200,50,50,0.7)",padding:"0",lineHeight:1,zIndex:2,width:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}
                            onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,60,60,0.9)";e.currentTarget.style.color="#fff";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="rgba(220,60,60,0.12)";e.currentTarget.style.color="rgba(200,50,50,0.7)";}}
                          >×</button>
                        )}
                      </div>
                    ):null;
                  })():(
                    s.unavailable
                      ?<span style={{fontSize:"9px",color:"rgba(160,40,40,0.7)",fontStyle:"italic",fontWeight:600}}>unavailable</span>
                      :!s.used
                        ?<span style={{fontSize:"9px",color:"rgba(74,49,28,0.45)",fontStyle:"italic"}}>unused</span>
                        :<span style={{fontSize:"9px",color:"rgba(74,49,28,0.4)",fontStyle:"italic"}}>empty</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {seats.length===0&&(
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
        <button onClick={()=>setZoom(z=>Math.max(ZOOM_MIN,+(z-0.15).toFixed(2)))} title="Zoom out" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
        <button onClick={()=>setZoom(1)} title="Reset zoom" style={{minWidth:"38px",padding:"0 4px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{Math.round(zoom*100)}%</button>
        <button onClick={()=>setZoom(z=>Math.min(ZOOM_MAX,+(z+0.15).toFixed(2)))} title="Zoom in" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
      </div>

      {/* Undo — reverts the last change to seats/groups/room items/rules.
          Session-only history, one step back per click. */}
      {canUndo&&(
        <button onClick={handleUndo} title="Undo the last change" style={{position:"absolute",bottom:"14px",left:"14px",zIndex:60,display:"flex",alignItems:"center",gap:"6px",padding:"7px 12px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.06)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"12px",fontWeight:600,cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",fontFamily:"'Source Sans 3',sans-serif"}}
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
          <button onClick={toggleRulesOpen} title="Tags and keep-apart/together rules — used by Randomize for this class" style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"2px",background:"none",border:"none",cursor:"pointer"}}>
            <span style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.4)",textTransform:"uppercase"}}>📋 Classroom rules</span>
            <span style={{fontSize:"9px",color:"rgba(0,0,0,0.3)"}}>{rulesOpen?'▲':'▼'}</span>
          </button>
          {rulesOpen&&(
            <div style={{display:"flex",flexDirection:"column",gap:"16px",paddingTop:"10px"}}>
              {/* Manage tags */}
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                  <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.25)",textTransform:"uppercase"}}>Tags</div>
                  <button onClick={()=>setShowManageTags(true)} title="Add, recolour or delete tags, and choose which students have each one" style={{background:"none",border:"none",color:"#2e6bce",cursor:"pointer",fontSize:"10.5px",fontWeight:700,padding:0}}>🎨 Manage</button>
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
                    <button onClick={()=>{applyTagToSeats(tagConfirm.sids,tagConfirm.tag);setTagConfirm(null);}} style={{...btnS,flex:1,background:"#1a1a2e",color:"#fff",border:"none",fontSize:"11px",padding:"5px 0"}}>Yes</button>
                    <button onClick={()=>setTagConfirm(null)} style={{...btnS,flex:1,fontSize:"11px",padding:"5px 0"}}>No</button>
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
                        <button key={t} onClick={()=>handleTagToggle(t)} title={`Remove "${t}"${avTags.includes(t)?'':' — not in this class\'s tag list, e.g. left over from a loaded layout'}`} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",fontWeight:700,padding:"3px 6px 3px 9px",borderRadius:"6px",background:tc.b,color:tc.t,border:"none",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
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
                    <button key={tag} onClick={()=>handleTagToggle(tag)} title={isOrphan?`"${tag}" isn't in this class's tag list (e.g. from a loaded layout) — still toggleable, or delete it from 🎨 Manage above`:matchCount===0?`No students have this tag — this seat will stay empty (or Randomize will need "Best fit" to fill it)`:`Toggle "${tag}" on this seat — only students with this tag can be placed here`} style={{
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
                      <button key={tag} onClick={()=>handleTagToggle(tag)} style={{
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
                        <button key={v} onClick={()=>{
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
          <ManageGroupsModal groups={groups} onRename={renameGroup} onDelete={deleteGroup} onClose={()=>setShowManageGroups(false)}/>
        </div>
      )}

      {/* ── Name-click popup — their tags, plus their outstanding checklist items ── */}
      {nameClick&&(()=>{
        const student=activeClass?.students.find(s=>s.id===nameClick.studentId);
        const studentTags=student?.tags||[];
        const addableTags=avTags.filter(t=>!studentTags.includes(t));
        return(
          <div
            onMouseDown={e=>e.stopPropagation()}
            style={{position:"fixed",left:nameClick.x,top:nameClick.y+6,transform:"translateX(-50%)",zIndex:500,background:"#fff",borderRadius:"10px",boxShadow:"0 4px 20px rgba(0,0,0,0.18)",border:"1px solid rgba(0,0,0,0.08)",padding:"9px 11px",minWidth:"160px",maxWidth:"230px",fontFamily:"'Source Sans 3',sans-serif"}}
          >
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}>
              <span style={{fontSize:"12.5px",fontWeight:700,color:"#1a1a2e",flex:1}}>{nameClick.name}</span>
              <button onClick={closeNameClick} title="Close" style={{background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"0 2px"}}>×</button>
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
                      <button onClick={()=>toggleStudentTagHere(nameClick.studentId,t,true)} title={`Remove "${t}" from ${nameClick.name.split(' ')[0]}`} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",fontSize:"12px",lineHeight:1,padding:"0 2px",opacity:0.6}}>×</button>
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
          <div style={{position:"fixed",left:studentDrag.ghostX+12,top:studentDrag.ghostY-16,zIndex:500,pointerEvents:"none",padding:"5px 12px",borderRadius:"8px",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.25)",whiteSpace:"nowrap"}}>
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
            <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxWidth:"320px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
              <div style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",marginBottom:"4px"}}>{isTidy?'Group these desks together':'These desks belong to different groups.'}</div>
              <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"18px"}}>{isTidy?'Make a new table group, or add them to one that already exists?':'Which group should they join?'}</div>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px"}}>
                {candidates.map(g=>(
                  <button key={g.id} onClick={()=>{addSeatsToGroup(groupMergeChoice.seatIds,g.id);closeDialog();}}
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
                <button onClick={makeNew}
                  style={{padding:"8px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:600,cursor:"pointer",flexShrink:0}}>Create</button>
              </div>
              <button onClick={closeDialog} style={{width:"100%",padding:"8px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.06)",background:"#fafbfc",color:"rgba(0,0,0,0.4)",fontSize:"12px",fontWeight:600,cursor:"pointer"}}>Cancel</button>
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
            <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxWidth:"320px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
              <div style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",marginBottom:"6px"}}>{seated.name} is already seated here.</div>
              <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"20px"}}>What would you like to do?</div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                <button onClick={()=>{
                  if(conflictDialog.fromSeatId)swapStudents(conflictDialog.fromSeatId,conflictDialog.targetSeatId);
                  else assignStudent(incoming.id,conflictDialog.targetSeatId,null);
                  setConflictDialog(null);
                }} style={{padding:"10px 16px",borderRadius:"10px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"13px",fontWeight:600,cursor:"pointer",textAlign:"left"}}>
                  Swap {incoming.name} with {seated.name}
                </button>
                <button onClick={()=>{
                  removeFromSeat(conflictDialog.targetSeatId);
                  setTimeout(()=>assignStudent(incoming.id,conflictDialog.targetSeatId,conflictDialog.fromSeatId),0);
                  setConflictDialog(null);
                }} style={{padding:"10px 16px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:600,cursor:"pointer",textAlign:"left"}}>
                  Move {seated.name} back to unplaced
                </button>
                <button onClick={()=>setConflictDialog(null)}
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
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxWidth:"340px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
            <div style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",marginBottom:"6px"}}>Load "{pendingLayoutLoad.template.name}"?</div>
            <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"16px",lineHeight:1.5}}>
              {pendingLayoutLoad.layoutDirty&&pendingLayoutLoad.seatingDirty?"Your current room layout and seating haven't been saved."
                :pendingLayoutLoad.layoutDirty?"Your current room layout hasn't been saved."
                :"Your current seating hasn't been recorded."}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"14px"}}>
              {pendingLayoutLoad.layoutDirty&&(!showSaveLayout?(
                <button onClick={()=>{setLayoutName('');setShowSaveLayout(true);}} style={{padding:"9px 12px",borderRadius:"9px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#1a1a2e",fontSize:"12.5px",fontWeight:600,cursor:"pointer",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >💾 Save current layout first</button>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                  <input value={layoutName} onChange={e=>setLayoutName(e.target.value)} autoFocus placeholder="Layout name…"
                    onKeyDown={e=>{if(e.key==='Enter'&&layoutName.trim()){saveLayout(layoutName);setShowSaveLayout(false);setPendingLayoutLoad(p=>({...p,layoutDirty:false}));}}}
                    style={{padding:"7px 9px",borderRadius:"7px",border:"1px solid rgba(66,133,244,0.4)",background:"#fff",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e"}}/>
                  <button onClick={()=>{if(layoutName.trim()){saveLayout(layoutName);setShowSaveLayout(false);setPendingLayoutLoad(p=>({...p,layoutDirty:false}));}}}
                    style={{padding:"7px 0",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"11.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
                  >Save layout</button>
                </div>
              ))}
              {pendingLayoutLoad.seatingDirty&&(
                <button onClick={()=>{confirmSeating();setPendingLayoutLoad(p=>({...p,seatingDirty:false}));}} style={{padding:"9px 12px",borderRadius:"9px",border:"1px solid rgba(46,142,88,0.3)",background:"#eefaf1",color:"#2e8e58",fontSize:"12.5px",fontWeight:700,cursor:"pointer",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#dff3e5"} onMouseLeave={e=>e.currentTarget.style.background="#eefaf1"}
                >✓ Record current seating first</button>
              )}
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>{loadLayout(pendingLayoutLoad.template);setPendingLayoutLoad(null);setShowSaveLayout(false);}}
                style={{flex:1,padding:"9px 0",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
              >{pendingLayoutLoad.layoutDirty||pendingLayoutLoad.seatingDirty?"Load anyway":`Load "${pendingLayoutLoad.template.name}"`}</button>
              <button onClick={()=>{setPendingLayoutLoad(null);setShowSaveLayout(false);}}
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
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxWidth:"340px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
            <div style={{fontSize:"13px",fontWeight:600,color:"#1a1a2e",marginBottom:"6px"}}>Load "{arrangementLabels[pendingArrangementLoad.entry.id]||pendingArrangementLoad.entry.name}"?</div>
            <div style={{fontSize:"12px",color:"rgba(0,0,0,0.4)",marginBottom:"14px",lineHeight:1.5}}>
              {pendingArrangementLoad.mismatched&&<div>This arrangement was made for a different room layout. I'll fit it into your current layout as closely as possible — groups stay together where there's room, and anyone who doesn't fit is left unplaced on the left.</div>}
              {pendingArrangementLoad.seatingDirty&&<div style={{marginTop:pendingArrangementLoad.mismatched?"8px":0}}>Your current seating hasn't been recorded.</div>}
            </div>
            {pendingArrangementLoad.seatingDirty&&(
              <button onClick={()=>{confirmSeating();setPendingArrangementLoad(p=>({...p,seatingDirty:false}));}} style={{width:"100%",padding:"9px 12px",borderRadius:"9px",border:"1px solid rgba(46,142,88,0.3)",background:"#eefaf1",color:"#2e8e58",fontSize:"12.5px",fontWeight:700,cursor:"pointer",textAlign:"left",marginBottom:"14px",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#dff3e5"} onMouseLeave={e=>e.currentTarget.style.background="#eefaf1"}
              >✓ Record current seating first</button>
            )}
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>{restoreArrangement(pendingArrangementLoad.entry,{bestFit:pendingArrangementLoad.mismatched});setPendingArrangementLoad(null);}}
                style={{flex:1,padding:"9px 0",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
              >{pendingArrangementLoad.mismatched?"Best-fit & load":"Load anyway"}</button>
              <button onClick={()=>setPendingArrangementLoad(null)}
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
function StudentSeatingPanel({activeClass,checklist,onChangeChecklist,flagsByStudent,now,showFlags,onSetShowFlags,onGoToChecklist}){
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
    const res=randomizeSeating({students:activeClass.students||[],seats:seatsIn,rules:layout.rules||[],smartShuffle:!!opts?.smartShuffle,hardTagRules:opts?.hardTagRules!==false,pairingHistory:history});
    prevSeatsRef.current=layout.seats;setCanUndoRandom(true);
    const next={...layout,seats:res.nextSeats};
    setLayout(next);save(`sl-${activeClass.id}`,next);
    setConflicts(res.placed?res.conflicts:[]);
    if(res.placed)save(phKey(activeClass.id,mode,'seating'),res.nextHistory);
    setRandomising(false);
  };
  const undoRandomise=()=>{
    if(!prevSeatsRef.current||!layout||!activeClass?.id)return;
    const next={...layout,seats:prevSeatsRef.current};
    prevSeatsRef.current=null;setCanUndoRandom(false);setConflicts([]);
    setLayout(next);save(`sl-${activeClass.id}`,next);
  };

  const centerScroll=(ref,seats,roomItems)=>{
    const el=ref.current;if(!el||!seats.length)return;
    const allItems=[...seats.filter(s=>s.x!==undefined).map(s=>({x:s.x,y:s.y,w:SW,h:SH})),...(roomItems||[]).map(r=>({x:r.x,y:r.y,w:SW,h:SH}))];
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
  const centerScrollWhenReady=(ref,seats,roomItems)=>{
    let raf1=requestAnimationFrame(()=>{raf1=requestAnimationFrame(()=>centerScroll(ref,seats,roomItems));});
    const recenter=()=>centerScroll(ref,seats,roomItems);
    window.addEventListener('resize',recenter);
    const stop=setTimeout(()=>window.removeEventListener('resize',recenter),700);
    return()=>{cancelAnimationFrame(raf1);window.removeEventListener('resize',recenter);clearTimeout(stop);};
  };

  useEffect(()=>{
    if(!activeClass?.id)return;
    setZoom(1);
    setConflicts([]);prevSeatsRef.current=null;setCanUndoRandom(false);
    let cleanupCenter=()=>{};
    load(`sl-${activeClass.id}`,null).then(l=>{
      if(l){
        const{seats:repairedSeats,groups:repairedGroups}=repairSeatGroups(l.seats||[],l.groups||[]);
        l={...l,seats:repairedSeats,groups:repairedGroups};
      }
      const loaded=l||{seats:[],groups:[],roomItems:[]};
      setLayout(loaded);
      cleanupCenter=centerScrollWhenReady(scrollRef,loaded.seats||[],loaded.roomItems||[]);
    });
    return()=>cleanupCenter();
  },[activeClass?.id]);

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
    return centerScrollWhenReady(displayScrollRef,layout.seats||[],layout.roomItems||[]);
  },[displayMode,layout]);

  if(!activeClass)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontFamily:"'Source Sans 3',sans-serif",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))"}}>No class selected</div>
  );
  if(!layout)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",background:"linear-gradient(180deg,var(--board-bg-top),var(--board-bg-bottom))",color:"var(--board-muted)",fontSize:"13px",fontFamily:"'Source Sans 3',sans-serif"}}>Loading…</div>
  );

  const{seats=[],groups=[],roomItems=[]}=layout;
  const pos=sPosMap(seats,groups,null);
  const studentById=id=>(activeClass?.students||[]).find(s=>s.id===id);
  const hasLayout=seats.length>0||roomItems.length>0;
  const canvasSize=canvasContentSize(seats,roomItems);

  const RoomCanvas=({scale=1,interactive=true})=>(
    <div style={{position:"relative",minWidth:canvasSize.w*scale,minHeight:canvasSize.h*scale,flexShrink:0}}>
      {/* Room items — clearly labelled for student wayfinding */}
      {roomItems.map(item=>{
        if(item.type==='desk')return(
          <div key={item.id} style={{position:"absolute",left:item.x*scale,top:item.y*scale,width:200*scale,height:72*scale,borderRadius:8*scale,background:"linear-gradient(145deg,#faf5ee,#f0e8d8)",border:"1.5px solid #d4b896",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2*scale}}>
            <span style={{fontSize:12*scale,fontWeight:700,color:"#8a7060",letterSpacing:"0.5px",textTransform:"uppercase"}}>Teacher's Desk</span>
          </div>
        );
        if(item.type==='board')return(
          <div key={item.id} style={{position:"absolute",left:item.x*scale,top:item.y*scale,width:(item.rotation===90||item.rotation===270?36:260)*scale,height:(item.rotation===90||item.rotation===270?260:36)*scale,borderRadius:5*scale,background:"linear-gradient(180deg,#e8ebe8,#d8dcd6)",border:"1.5px solid #a8b8a8",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:11*scale,fontWeight:700,color:"#5a7a5a",letterSpacing:"1.5px",textTransform:"uppercase",transform:item.rotation===90||item.rotation===270?"rotate(90deg)":"none"}}>Board</span>
          </div>
        );
        if(item.type==='door'){
          const W=64*scale,H=64*scale;
          return(
            <div key={item.id} style={{position:"absolute",left:item.x*scale,top:item.y*scale,width:W,height:H,transform:`rotate(${item.rotation}deg)`,transformOrigin:"top left"}}>
              <svg width={W} height={H} viewBox="0 0 64 64">
                <line x1="6" y1="4" x2="6" y2="58" stroke="#6a9aaa" strokeWidth="5" strokeLinecap="round"/>
                <line x1="6" y1="6" x2="58" y2="6" stroke="#6a9aaa" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M 58 6 A 52 52 0 0 1 6 58" fill="rgba(100,180,200,0.08)" stroke="#6a9aaa" strokeWidth="1.5"/>
              </svg>
              <div style={{position:"absolute",top:H+3,left:"50%",transform:"translateX(-50%)",fontSize:10*scale,fontWeight:700,color:"#6a9aaa",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}>Door</div>
            </div>
          );
        }
        return null;
      })}

      {/* Group shadow backgrounds */}
      {groups.map(g=>{
        const gb=gBoundsFromSeats(g,seats);
        return <div key={`gb-${g.id}`} style={{position:"absolute",left:(gb.x-4)*scale,top:(gb.y-4)*scale,width:(gb.w+8)*scale,height:(gb.h+8)*scale,borderRadius:10*scale,background:"rgba(120,85,55,0.06)",border:"1px solid rgba(120,85,55,0.2)",pointerEvents:"none"}}/>;
      })}

      {/* Seat rectangles — names only, no tags, no controls */}
      {seats.map(s=>{
        const p=pos[s.id];if(!p||!s.used)return null;
        const st=s.studentId?studentById(s.studentId):null;
        const name=st?.name||'';
        const fsize=Math.max(9,Math.min(14,Math.floor(SW*0.82/(Math.max(name.length,4)*0.58))));
        const studentFlags=st?(flagsByStudent?.get(st.id)||[]):[];
        return(
          <div key={s.id} style={{position:"absolute",left:p.x*scale,top:p.y*scale,width:SW*scale,height:SH*scale,borderRadius:7*scale,background:st?woodBg():"linear-gradient(180deg,rgba(224,193,160,0.35),rgba(209,169,126,0.35))",border:st?`1.5px solid ${WOOD_BORDER}`:"1px dashed rgba(120,85,55,0.3)",boxShadow:st?"0 1px 4px rgba(74,49,28,0.18)":"none",display:"flex",alignItems:"center",justifyContent:"center",overflow:"visible",position:"absolute"}}>
            {st&&<div
              onClick={interactive?e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}:undefined}
              style={{fontSize:fsize*scale,fontWeight:700,color:"#1a1a2e",textAlign:"center",background:"#fff",borderRadius:6*scale,padding:`${3*scale}px ${8*scale}px`,maxWidth:"calc(100% - 8px)",boxShadow:"0 1px 2px rgba(74,49,28,0.22)",lineHeight:1.25,wordBreak:"break-word",cursor:interactive?"pointer":"default"}}
            >{st.name}</div>}
            {/* Flag indicators */}
            {showFlags&&studentFlags.length>0&&(
              <div className="flag-indicator" style={{position:"absolute",top:-4*scale,right:-4*scale,zIndex:10}}>
                <FlagDots flags={studentFlags} scale={scale} onClick={interactive?e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();setNameClick({studentId:st.id,name:st.name,x:r.left+r.width/2,y:r.bottom});}:undefined}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const Header=({onDisplayClick})=>(
    <div style={{padding:"12px 18px 10px",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",background:"#fff",flexShrink:0}}>
      <div>
        <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",color:"rgba(0,0,0,0.25)",fontFamily:"'Source Sans 3',sans-serif"}}>Seating</div>
        <div style={{fontSize:"15px",fontWeight:700,color:"#1a1a2e",marginTop:"1px",fontFamily:"'Source Sans 3',sans-serif"}}>{activeClass.name}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end",gap:"8px"}}>
        {hasLayout&&canUndoRandom&&<button onClick={undoRandomise} title="Put everyone back where they were before the last Randomise" style={{fontSize:"12px",fontWeight:600,padding:"7px 11px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"none",color:"rgba(0,0,0,0.45)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>↺ Undo</button>}
        {hasLayout&&<button onClick={randomise} title="Shuffle everyone into new seats, using the seat tags, keep-apart/together rules and Randomize options from Manage Seating" style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12.5px",fontWeight:700,padding:"7px 13px",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>🎲 Randomise</button>}
        <button onClick={toggleShowFlags} title={showFlags?"Hide flags in this view (e.g. before projecting)":"Show flags in this view"}
          style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.07)",background:"none",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
        >
          <span style={{fontSize:"11px",fontWeight:600,color:"rgba(0,0,0,0.4)"}}>🚩 Flags</span>
          <span style={{width:"28px",height:"16px",borderRadius:"9px",background:showFlags?"#1a1a2e":"rgba(0,0,0,0.15)",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
            <span style={{width:"12px",height:"12px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:showFlags?"14px":"2px",transition:"left 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 2px rgba(0,0,0,0.2)"}}/>
          </span>
        </button>
        {hasLayout&&(
          <button onClick={onDisplayClick} title="Full screen (projector view)" style={{fontSize:"14px",fontWeight:600,padding:"7px 12px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.07)",background:"none",color:"rgba(0,0,0,0.3)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
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

      {conflicts.length>0&&(
        <div style={{margin:"10px 14px 0",padding:"9px 10px",borderRadius:"9px",background:"#fdeeed",border:"1px solid rgba(220,60,60,0.18)",display:"flex",flexDirection:"column",gap:"4px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:"9px",fontWeight:700,color:"#c44",letterSpacing:"0.5px",textTransform:"uppercase"}}>Rule conflicts ({conflicts.length})</div>
            <button onClick={()=>setConflicts([])} title="Dismiss" style={{background:"none",border:"none",color:"rgba(180,40,40,0.5)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:0}}>×</button>
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
          <div
            onMouseDown={e=>e.stopPropagation()}
            style={{position:"fixed",left:nameClick.x,top:nameClick.y+6,transform:"translateX(-50%)",zIndex:500,background:"#fff",borderRadius:"10px",boxShadow:"0 4px 20px rgba(0,0,0,0.18)",border:"1px solid rgba(0,0,0,0.08)",padding:"9px 11px",minWidth:"200px",maxWidth:"260px",fontFamily:"'Source Sans 3',sans-serif"}}
          >
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}>
              <span style={{fontSize:"12.5px",fontWeight:700,color:"#1a1a2e",flex:1}}>{nameClick.name}</span>
              <button onClick={closeNameClick} style={{background:"none",border:"none",color:"rgba(0,0,0,0.25)",cursor:"pointer",fontSize:"14px",lineHeight:1,padding:"0 2px"}}>×</button>
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
          <div ref={scrollRef} style={{position:"absolute",inset:0,overflow:"auto",display:"flex",justifyContent:"safe center",alignItems:"safe center",background:"radial-gradient(circle,var(--board-dot) 1.2px,transparent 1.2px)",backgroundSize:"32px 32px",backgroundColor:"var(--board-flat)"}}>
            <div style={{zoom}}><RoomCanvas scale={1}/></div>
          </div>

          {/* Zoom control — pinch-to-zoom on the trackpad works anywhere on the
              canvas; these buttons are here for anyone who'd rather click. */}
          <div style={{position:"absolute",bottom:"14px",right:"14px",zIndex:60,display:"flex",alignItems:"center",gap:"2px",background:"#fff",borderRadius:"10px",padding:"4px",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)"}}>
            <button onClick={()=>setZoom(z=>Math.max(ZOOM_MIN,+(z-0.15).toFixed(2)))} title="Zoom out" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
            <button onClick={()=>setZoom(1)} title="Reset zoom" style={{minWidth:"38px",padding:"0 4px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{Math.round(zoom*100)}%</button>
            <button onClick={()=>setZoom(z=>Math.min(ZOOM_MAX,+(z+0.15).toFixed(2)))} title="Zoom in" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
          </div>
        </div>
      )}

      {/* Display mode — full-screen projection view */}
      {displayMode&&(
        <div className="no-drag" style={{position:"fixed",inset:0,zIndex:400,background:"var(--board-flat)",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Source Sans 3',sans-serif"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",background:"#fff",borderBottom:"1px solid rgba(0,0,0,0.06)",flexShrink:0}}>
            <button onClick={()=>setDisplayMode(false)} style={{fontSize:"13px",fontWeight:600,padding:"7px 14px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.4)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>← Exit</button>
            <div style={{fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>{activeClass.name}</div>
            <div style={{minWidth:"100px",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"8px"}}>
              {conflicts.length>0&&<span title={conflicts.join("\n")} style={{fontSize:"11px",fontWeight:700,color:"#c44",background:"#fdeeed",padding:"4px 8px",borderRadius:"7px"}}>⚠ {conflicts.length} rule conflict{conflicts.length!==1?'s':''}</span>}
              {canUndoRandom&&<button onClick={undoRandomise} title="Put everyone back where they were before the last Randomise" style={{fontSize:"12px",fontWeight:600,padding:"7px 11px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"none",color:"rgba(0,0,0,0.45)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>↺ Undo</button>}
              <button onClick={randomise} title="Shuffle everyone into new seats, using the seat tags, keep-apart/together rules and Randomize options from Manage Seating" style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12.5px",fontWeight:700,padding:"7px 13px",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>🎲 Randomise</button>
            </div>
          </div>
          <div style={{flex:1,position:"relative",overflow:"hidden"}}>
            <div ref={displayScrollRef} style={{position:"absolute",inset:0,overflow:"auto",display:"flex",justifyContent:"safe center",alignItems:"safe center",backgroundImage:"radial-gradient(circle,var(--board-dot) 1.2px,transparent 1.2px)",backgroundSize:"32px 32px",backgroundColor:"var(--board-flat)"}}
            >
              <div style={{zoom:displayZoom}}><RoomCanvas scale={1} interactive={false}/></div>
            </div>

            <div style={{position:"absolute",bottom:"14px",right:"14px",zIndex:60,display:"flex",alignItems:"center",gap:"2px",background:"#fff",borderRadius:"10px",padding:"4px",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.06)"}}>
              <button onClick={()=>setDisplayZoom(z=>Math.max(ZOOM_MIN,+(z-0.15).toFixed(2)))} title="Zoom out" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
              <button onClick={()=>setDisplayZoom(1)} title="Reset zoom" style={{minWidth:"38px",padding:"0 4px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{Math.round(displayZoom*100)}%</button>
              <button onClick={()=>setDisplayZoom(z=>Math.min(ZOOM_MAX,+(z+0.15).toFixed(2)))} title="Zoom in" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
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
      {onRemove&&<button onClick={()=>onRemove(index)} title={group.length?"Delete this group — its students go back to Ungrouped":"Delete this empty group"} style={{background:"none",border:"none",color:col.text,opacity:0.5,cursor:"pointer",fontSize:"15px",lineHeight:1,padding:"0 2px"}} onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.color="#c44";}} onMouseLeave={e=>{e.currentTarget.style.opacity="0.5";e.currentTarget.style.color=col.text;}}>×</button>}
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
function ManageGroupsPanel({activeClass,guardRef,flagsByStudent,showFlags,onSetShowFlags}){
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
      setLoaded(true);
    });
  },[activeClass?.id]);

  /* Persist this panel's state so it survives closing and reopening the tab. */
  useEffect(()=>{
    if(!activeClass?.id||!loaded)return;
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
    <button onClick={onClick} title={help} style={{display:"flex",alignItems:"center",gap:"8px",background:"none",border:"none",cursor:"pointer",padding:0}}>
      <div style={{width:"34px",height:"18px",borderRadius:"9px",background:on?"#1a1a2e":"rgba(0,0,0,0.1)",transition:"background 0.2s",position:"relative",flexShrink:0}}>
        <div style={{width:"14px",height:"14px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:on?"18px":"2px",transition:"left 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/>
      </div>
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
                  <button onClick={()=>{setGroupNames(prevNames);setPrevNames(null);}} title="Bring back the group names you just cleared" style={{fontSize:"11.5px",fontWeight:600,padding:"6px 10px",borderRadius:"8px",border:"1px solid rgba(46,107,206,0.3)",background:"#eaf1fc",color:"#2e6bce",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}>↺ Undo name reset</button>
                ):groupNames.some(Boolean)&&(
                  <button onClick={()=>{setPrevNames(groupNames);setGroupNames([]);}} title="Clear every custom group name, back to Group 1, Group 2… (you can undo it straight after)" style={{fontSize:"11.5px",fontWeight:600,padding:"6px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}>Reset group names</button>
                )}
                {prevResult&&<button onClick={undoRedeal} title="Put everyone back where they were before the last Randomise" style={{fontSize:"12px",fontWeight:600,padding:"7px 11px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>↺ Undo</button>}
                <button onClick={handleFillRest} disabled={!(waiting.length>0&&result.groups.length>0)} title={waiting.length?`Deal the ${waiting.length} student${waiting.length!==1?"s":""} still in Ungrouped into the groups you have now. Everyone already in a group stays exactly where they are. Fills the smallest groups first, using your rules and Smart shuffle.`:"Everyone is already in a group — nobody left to place."} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12.5px",fontWeight:700,padding:"8px 14px",borderRadius:"9px",border:"none",background:(waiting.length>0&&result.groups.length>0)?"#1a1a2e":"rgba(0,0,0,0.08)",color:(waiting.length>0&&result.groups.length>0)?"#fff":"rgba(0,0,0,0.3)",cursor:(waiting.length>0&&result.groups.length>0)?"pointer":"default",fontFamily:"'Source Sans 3',sans-serif"}}
                  onMouseEnter={e=>{if(waiting.length>0&&result.groups.length>0)e.currentTarget.style.background="#2a2a4e";}} onMouseLeave={e=>{if(waiting.length>0&&result.groups.length>0)e.currentTarget.style.background="#1a1a2e";}}
                >🎲 Randomise remaining{waiting.length?` · ${waiting.length}`:""}</button>
                <button onClick={handleRedeal} title="Shuffle everyone again into the groups you have now — students already placed move too. Same groups and names; anyone sitting out stays out. Use Undo to go back." style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12.5px",fontWeight:700,padding:"7px 13px",borderRadius:"9px",border:"2px solid #1a1a2e",background:"#fff",color:"#1a1a2e",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
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
                <button onClick={()=>setGzoomClamped(z=>z-0.1)} title="Zoom out — smaller cards, more columns" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>−</button>
                <button onClick={()=>setGzoomClamped(1)} title="Reset zoom" style={{minWidth:"38px",padding:"0 4px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{Math.round(gzoom*100)}%</button>
                <button onClick={()=>setGzoomClamped(z=>z+0.1)} title="Zoom in — bigger cards, fewer columns" style={{width:"24px",height:"24px",borderRadius:"6px",border:"none",background:"none",color:"rgba(0,0,0,0.45)",fontSize:"15px",fontWeight:600,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="none"}>+</button>
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
              <button onClick={addGroup} title="Add another group — it starts empty; drag students into it" style={{...(vertical?{width:"100%",minHeight:"54px"}:{minWidth:"110px",flex:"0 0 auto"}),borderRadius:"16px",border:"2px dashed rgba(0,0,0,0.16)",background:"rgba(255,255,255,0.4)",color:"rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2px",padding:"10px",fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}}
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
              <button onClick={()=>{setGroupingName('');setShowSaveGrouping(true);}}
                title="Save this exact grouping under a name, separate from the working result above" style={{fontSize:"11.5px",fontWeight:600,padding:"7px 12px",borderRadius:"8px",border:"1px dashed rgba(0,0,0,0.15)",background:"none",color:"rgba(0,0,0,0.4)",cursor:"pointer",alignSelf:"flex-start",fontFamily:"'Source Sans 3',sans-serif"}}
              >💾 Save this arrangement…</button>
            ):(
              <div style={{display:"flex",gap:"6px"}}>
                <input value={groupingName} onChange={e=>setGroupingName(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&groupingName.trim()){saveGrouping(groupingName);setShowSaveGrouping(false);}if(e.key==='Escape')setShowSaveGrouping(false);}}
                  autoFocus placeholder="e.g. Persuasive Essay Groups"
                  style={{flex:1,minWidth:0,padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(66,133,244,0.4)",fontSize:"12px",outline:"none",fontFamily:"'Source Sans 3',sans-serif",color:"#1a1a2e"}}
                />
                <button onClick={()=>{if(groupingName.trim()){saveGrouping(groupingName);setShowSaveGrouping(false);}}}
                  style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,cursor:"pointer",flexShrink:0}}
                >Save</button>
                <button onClick={()=>setShowSaveGrouping(false)}
                  style={{padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"rgba(0,0,0,0.5)",fontSize:"12px",fontWeight:600,cursor:"pointer",flexShrink:0}}
                >Cancel</button>
              </div>
            )}

            <div style={{display:"flex",gap:"8px",alignItems:"center",paddingTop:"4px",flexWrap:"wrap"}}>
              {!finalised?(
                <button onClick={handleFinalise}
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
                    <button onClick={()=>setHistoryClearing(true)} style={{fontSize:"10.5px",fontWeight:700,color:"#b8850a",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Clear history…</button>
                  ):(
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <span style={{fontSize:"10.5px",fontWeight:700}}>Clear all history?</span>
                      <button onClick={handleClearHistory} style={{fontSize:"10.5px",fontWeight:700,color:"#c44",background:"none",border:"none",cursor:"pointer",padding:0}}>Yes, clear</button>
                      <button onClick={()=>setHistoryClearing(false)} style={{fontSize:"10.5px",fontWeight:600,color:"rgba(0,0,0,0.4)",background:"none",border:"none",cursor:"pointer",padding:0}}>Cancel</button>
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
              <button onClick={importFromSeating} disabled={!importableRules.length}
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

          <button onClick={handleGenerate}
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
        <div style={{position:"fixed",left:groupDrag.x+12,top:groupDrag.y+8,zIndex:600,pointerEvents:"none",padding:"5px 12px",borderRadius:"8px",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
          {groupDrag.name}
        </div>
      )}
      {closePrompt&&(
        <div style={{position:"fixed",inset:0,zIndex:650,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.25)",backdropFilter:"blur(3px)"}} onClick={()=>setClosePrompt(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"16px",padding:"24px 28px",boxShadow:"0 8px 40px rgba(0,0,0,0.2)",maxWidth:"360px",width:"90%",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
            <div style={{fontSize:"14px",fontWeight:700,color:"#1a1a2e",marginBottom:"6px"}}>Finalise these groups before you go?</div>
            <div style={{fontSize:"12.5px",color:"rgba(0,0,0,0.45)",lineHeight:1.55,marginBottom:"18px"}}>These groups haven't been finalised yet. Finalising records who worked together, so Smart shuffle can avoid repeating the same pairings next time.</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              <button onClick={()=>{const go=closePrompt.proceed;handleFinalise();setClosePrompt(null);setTimeout(go,80);}} title="Record these pairings, then close" style={{padding:"10px 16px",borderRadius:"10px",border:"none",background:"#2e6bce",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Finalise &amp; close</button>
              <button onClick={()=>{const go=closePrompt.proceed;setClosePrompt(null);go();}} title="Leave without recording these pairings — the groups themselves are still saved" style={{padding:"10px 16px",borderRadius:"10px",border:"1px solid rgba(0,0,0,0.1)",background:"#fff",color:"#1a1a2e",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Close without finalising</button>
              <button onClick={()=>setClosePrompt(null)} title="Go back to the groups" style={{padding:"8px 16px",borderRadius:"10px",border:"none",background:"none",color:"rgba(0,0,0,0.4)",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Stay here</button>
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
      <button onClick={()=>onChange(clampVZoom(zoom-0.1))} title="Zoom out — smaller cards, more columns" style={b} {...hov}>−</button>
      <button onClick={()=>onChange(1)} title="Reset zoom" style={{...b,width:"auto",minWidth:"42px",padding:"0 4px",fontSize:"11.5px",fontWeight:700,color:"rgba(0,0,0,0.45)"}} {...hov}>{Math.round(zoom*100)}%</button>
      <button onClick={()=>onChange(clampVZoom(zoom+0.1))} title="Zoom in — bigger cards, fewer columns" style={b} {...hov}>+</button>
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

function StudentGroupsPanel({activeClass,flagsByStudent,showFlags}){
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

  const GroupBlock=({group,i,big})=>{
    const col=COLORS[i%COLORS.length];
    return(
      <div style={{borderRadius:big?"18px":"16px",background:col.bg,border:`1px solid ${col.text}28`,padding:big?"20px 24px":"14px 16px",...(big?{minWidth:"180px"}:vertical?{width:"100%"}:{minWidth:"148px",flex:"0 0 auto"}),display:"flex",flexDirection:"column",gap:big?"8px":"6px"}}>
        <div style={{fontSize:big?"16px":"13px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:col.text}}>{rehydrated.names[i]||`Group ${i+1}`}</div>
        {group.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:big?"8px":"6px",fontSize:big?"19px":"13px",fontWeight:big?700:600,color:"#1a1a2e",padding:big?"6px 12px":"4px 9px",borderRadius:big?"10px":"8px",background:"rgba(255,255,255,0.8)",lineHeight:1.3}}><span style={{flex:1,minWidth:0}}>{s.name}</span>{showFlags&&<FlagDots flags={flagsByStudent?.get(s.id)} size={big?12:8}/>}</div>
        ))}
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
          <button onClick={randomize} title="Shuffle students into new groups, using whatever mode/size/rules are set up in Manage Groups" style={{fontSize:"12.5px",fontWeight:700,padding:"8px 16px",borderRadius:"9px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.background="#2a2a4e"} onMouseLeave={e=>e.currentTarget.style.background="#1a1a2e"}
          >🎲 Randomise</button>
          {hasGroups&&(
            <button onClick={()=>setDisplayMode(true)} title="Full screen (projector view)" style={{fontSize:"14px",fontWeight:600,padding:"7px 12px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.07)",background:"none",color:"rgba(0,0,0,0.3)",cursor:"pointer"}}
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
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:600,color:"#1a1a2e",padding:"4px 9px",borderRadius:"8px",background:"rgba(255,255,255,0.75)",lineHeight:1.3}}><span style={{flex:1,minWidth:0}}>{s.name}</span>{showFlags&&<FlagDots flags={flagsByStudent?.get(s.id)} size={8}/>}</div>
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
            <button onClick={()=>setDisplayMode(false)} style={{fontSize:"13px",fontWeight:600,padding:"7px 14px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"rgba(0,0,0,0.4)",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>← Exit</button>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>{activeClass.name}</div>
              <ZoomControl zoom={displayZoom} onChange={setDisplayZoom}/>
            </div>
            <button onClick={randomize} title="Shuffle students into new groups, using whatever mode/size/rules are set up in Manage Groups" style={{fontSize:"13px",fontWeight:700,padding:"7px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
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
    <div ref={boxRef} onMouseDown={e=>e.stopPropagation()} style={{position:"fixed",left,top,width:"276px",maxHeight:window.innerHeight-top-8,overflowY:"auto",zIndex:600,background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"12px",boxShadow:"0 8px 28px rgba(0,0,0,0.16)",padding:"12px 14px",display:"flex",flexDirection:"column",gap:"11px",fontFamily:"'Source Sans 3',sans-serif"}}>
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
          {col.due&&<button onClick={()=>onUpdate({due:null,dueTime:null,flagOnlyOverdue:false})} title="Remove the due date" style={{background:"none",border:"none",color:"rgba(0,0,0,0.35)",cursor:"pointer",fontSize:"11px",fontWeight:600,padding:"0 2px"}}>Clear</button>}
        </div>
      )}

      <div>
        <button onClick={()=>onUpdate(col.flag?{flag:false}:{flag:true,flagIf})} title={col.flag?"Stop showing a 🚩 dot by student names for this item":"Show a 🚩 dot by the name of any student who hasn't sorted this item, on the Seating chart (and in Groups, if 'Show flags' is on there). Choose below which statuses count."}
          style={{width:"100%",display:"flex",alignItems:"center",gap:"8px",padding:"6px 8px",borderRadius:"8px",border:`1px solid ${col.flag?"rgba(66,133,244,0.35)":"rgba(0,0,0,0.08)"}`,background:col.flag?"#eaf1fc":"transparent",cursor:"pointer",justifyContent:"flex-start",fontFamily:"'Source Sans 3',sans-serif"}}>
          <div style={{width:"28px",height:"15px",borderRadius:"8px",background:col.flag?"#2e6bce":"rgba(0,0,0,0.12)",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
            <div style={{width:"11px",height:"11px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:col.flag?"15px":"2px",transition:"left 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 1px 2px rgba(0,0,0,0.2)"}}/>
          </div>
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
        <button onClick={()=>onBulk('done')} title="Set every blank cell in this item to Done (cells that already have a status are left alone)" style={ckSmallBtn}>Mark all blank as Done</button>
        <button onClick={()=>onBulk('na')} title="Set every blank cell in this item to Not applicable (cells that already have a status are left alone)" style={ckSmallBtn}>Mark all blank as N/A</button>
      </div>

      {!confirmDel?(
        <button onClick={()=>setConfirmDel(true)} title="Delete this item and everyone's status for it" style={{...ckSmallBtn,color:"#c44",borderColor:"rgba(200,60,60,0.25)",textAlign:"center"}}>Delete item</button>
      ):(
        <div>
          <div style={{fontSize:"12px",color:"#c44",fontWeight:600,marginBottom:"7px",lineHeight:1.4}}>Delete "{col.name}"? This removes everyone's status for it.</div>
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={onDelete} title="Yes, delete this item" style={{flex:1,padding:"6px",borderRadius:"7px",border:"none",background:"#c44",color:"#fff",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Delete</button>
            <button onClick={()=>setConfirmDel(false)} title="Keep this item" style={{...ckSmallBtn,flex:1,textAlign:"center"}}>Cancel</button>
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
          <button onClick={toggleSelecting} disabled={!columns.length} title={selecting?"Stop selecting items":"Select items to copy to your other classes"} style={{padding:"7px 14px",borderRadius:"8px",border:`1px solid ${selecting?"#2e6bce":"rgba(0,0,0,0.15)"}`,background:selecting?"#eef3fc":"#fff",color:selecting?"#2e6bce":"#1a1a2e",fontSize:"13px",fontWeight:600,cursor:columns.length?"pointer":"default",opacity:columns.length?1:0.4,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap"}}>{selecting?"Done":"Select"}</button>
          <button onClick={addColumn} title="Add a new item (a piece of work or task) as a column" style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap"}}>+ Add item</button>
        </div>
      </div>

      {/* Select-mode bar — tick items in the grid, then copy them to other classes */}
      {selecting&&(
        <div style={{padding:"7px 16px",borderBottom:"1px solid rgba(0,0,0,0.06)",background:"#f4f7fd",flexShrink:0,display:"flex",alignItems:"center",gap:"10px",fontSize:"12px",color:"#1a1a2e"}}>
          <span style={{fontWeight:600}}>{selected.length?`${selected.length} selected`:"Tick the items you want to copy"}</span>
          <button onClick={()=>setSelected(columns.map(c=>c.id))} title="Tick every item" style={ckSmallBtn}>Select all</button>
          {selected.length>0&&<button onClick={()=>setSelected([])} title="Untick everything" style={ckSmallBtn}>Clear</button>}
          <button data-ck-copy-btn disabled={!selected.length||!otherClasses.length}
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
        <div ref={cellMenuRef} onMouseDown={e=>e.stopPropagation()} style={{position:"fixed",left:Math.max(8,Math.min(cellMenu.x,window.innerWidth-224)),top:Math.max(8,Math.min(cellMenu.y,window.innerHeight-320)),zIndex:600,width:"208px",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.16)",padding:"8px",display:"flex",flexDirection:"column",gap:"2px",fontFamily:"'Source Sans 3',sans-serif"}}>
          <div style={{fontSize:"10.5px",fontWeight:700,color:"rgba(0,0,0,0.4)",padding:"2px 6px 5px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={`${menuStudent.name} — ${menuCol.name}`}>{menuStudent.name} · {menuCol.name}</div>
          {noteDraft===null?(
            <>
              {CHECK_STATUSES.map(s=>{
                const cur=cellStatus(data,menuCol.id,menuStudent.id)===s.id;
                return(
                  <button key={s.id} onClick={()=>setStatus(menuCol.id,menuStudent.id,s.id)} title={`Set to ${s.label}`}
                    style={{display:"flex",alignItems:"center",gap:"8px",padding:"5px 6px",borderRadius:"7px",border:"none",background:cur?"#f0f1f4":"transparent",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",textAlign:"left"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background=cur?"#f0f1f4":"transparent"}>
                    <span style={{width:"22px",height:"18px",borderRadius:"5px",background:s.bg,border:"1px solid rgba(0,0,0,0.08)",color:s.text,fontSize:"11px",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.short}</span>
                    <span style={{flex:1,fontSize:"12px",fontWeight:cur?700:500,color:"#1a1a2e"}}>{s.label}</span>
                    {cur&&<span style={{fontSize:"11px",color:"#2e6bce"}}>✓</span>}
                  </button>
                );
              })}
              <div style={{height:"1px",background:"rgba(0,0,0,0.07)",margin:"3px 0"}}/>
              <button onClick={()=>setNoteDraft(data.cells?.[menuCol.id]?.[menuStudent.id]?.note||'')} title="Attach a short note to this cell" style={{padding:"5px 6px",borderRadius:"7px",border:"none",background:"transparent",cursor:"pointer",fontSize:"12px",fontWeight:600,color:"rgba(0,0,0,0.55)",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0f1f4"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >{data.cells?.[menuCol.id]?.[menuStudent.id]?.note?"Edit note…":"Add note…"}</button>
            </>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"6px",padding:"2px 4px 4px"}}>
              <input value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveNote(menuCol.id,menuStudent.id,noteDraft.trim());}} autoFocus placeholder="Note…" title="A short note for this student on this item" style={ckInputStyle}/>
              <div style={{display:"flex",gap:"6px"}}>
                <button onClick={()=>saveNote(menuCol.id,menuStudent.id,noteDraft.trim())} title="Save the note" style={{flex:1,padding:"5px",borderRadius:"7px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"11.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Save</button>
                <button onClick={()=>setNoteDraft(null)} title="Go back without saving" style={{...ckSmallBtn,flex:1,textAlign:"center",padding:"5px"}}>Back</button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Copy-to-class popover */}
      {copyMenu&&createPortal(
        <div ref={copyMenuRef} onMouseDown={e=>e.stopPropagation()} style={{position:"fixed",left:Math.max(8,Math.min(copyMenu.x-232,window.innerWidth-240)),top:Math.min(copyMenu.y,window.innerHeight-300),zIndex:600,width:"232px",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"10px",boxShadow:"0 8px 28px rgba(0,0,0,0.16)",padding:"10px",display:"flex",flexDirection:"column",gap:"6px",fontFamily:"'Source Sans 3',sans-serif"}}>
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
          <button onClick={doCopy} disabled={!copyTargets.length} title="Copy the ticked items to the chosen classes" style={{padding:"7px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12.5px",fontWeight:600,cursor:copyTargets.length?"pointer":"default",opacity:copyTargets.length?1:0.4,fontFamily:"'Source Sans 3',sans-serif"}}>Copy {selected.length} item{selected.length===1?'':'s'}{copyTargets.length?` to ${copyTargets.length} class${copyTargets.length===1?'':'es'}`:''}</button>
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
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"18px",padding:"24px 26px",boxShadow:"0 8px 48px rgba(0,0,0,0.2)",width:"90%",maxWidth:"380px",fontFamily:"'Source Sans 3',sans-serif",animation:"fadeIn 0.15s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"18px"}}>
          <h2 style={{margin:0,fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Settings</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"20px",color:"rgba(0,0,0,0.25)",cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"2px",color:"rgba(0,0,0,0.3)",textTransform:"uppercase",marginBottom:"10px"}}>Board colour</div>
        <div style={{display:"flex",gap:"10px"}}>
          {options.map(opt=>{
            const active=theme===opt.id;
            return(
              <button key={opt.id} onClick={()=>onSetTheme(opt.id)} style={{flex:1,padding:0,borderRadius:"12px",border:active?"2px solid #2e6bce":"2px solid rgba(0,0,0,0.08)",cursor:"pointer",overflow:"hidden",background:"#fff",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}>
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
              <button key={opt.id} onClick={()=>{audio.style=opt.id;audio.ding();onSetTimerStyle(opt.id);}} title={opt.help} style={{flex:1,minWidth:0,padding:0,borderRadius:"12px",border:active?"2px solid #2e6bce":"2px solid rgba(0,0,0,0.08)",cursor:"pointer",overflow:"hidden",background:"#fff",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}>
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
          <button onClick={exportData} title="Save all your classes, students, seating, groups and checklists to a backup file" style={{flex:1,padding:"9px 8px",borderRadius:"10px",border:"2px solid rgba(0,0,0,0.08)",background:"#fff",cursor:"pointer",fontSize:"12px",fontWeight:700,color:"#1a1a2e",fontFamily:"'Source Sans 3',sans-serif"}}>⬇ Export backup</button>
          <button onClick={()=>fileRef.current?.click()} title="Load a backup file made with Export backup — it replaces what is on this computer" style={{flex:1,padding:"9px 8px",borderRadius:"10px",border:"2px solid rgba(0,0,0,0.08)",background:"#fff",cursor:"pointer",fontSize:"12px",fontWeight:700,color:"#1a1a2e",fontFamily:"'Source Sans 3',sans-serif"}}>⬆ Import backup</button>
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={pickImport} style={{display:"none"}}/>
        </div>
        {dataMsg&&<div style={{fontSize:"11.5px",marginTop:"10px",lineHeight:1.5,color:dataMsg.ok?"#3a8a4e":"#c44",fontWeight:600}}>{dataMsg.text}</div>}
        {pendingImport&&(
          <div style={{marginTop:"10px",padding:"10px 12px",borderRadius:"10px",background:"#fdf5e6",border:"1px solid rgba(184,133,10,0.3)"}}>
            <div style={{fontSize:"12px",fontWeight:700,color:"#1a1a2e",lineHeight:1.45}}>Replace everything on this computer with "{pendingImport.name}"?</div>
            <div style={{fontSize:"11.5px",color:"rgba(0,0,0,0.55)",marginTop:"3px",lineHeight:1.45}}>{pendingImport.classNames.length?`It has ${pendingImport.classNames.length} class${pendingImport.classNames.length===1?'':'es'}: ${pendingImport.classNames.join(', ')}.`:"It has no classes."} Your current classes and checklists will be swapped for these.</div>
            <div style={{display:"flex",gap:"8px",marginTop:"9px"}}>
              <button onClick={confirmImport} title="Replace the data on this computer with the backup" style={{flex:1,padding:"7px",borderRadius:"8px",border:"none",background:"#1a1a2e",color:"#fff",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Replace</button>
              <button onClick={()=>setPendingImport(null)} title="Keep what's here and do nothing" style={{flex:1,padding:"7px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.12)",background:"#fff",color:"rgba(0,0,0,0.6)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>Cancel</button>
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
                <button onClick={()=>pickAutoBackup(b)} title={`Go back to how everything was on ${fmtBackupTime(b.exportedAt)} (you'll be asked to confirm first)`} style={{padding:"5px 10px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.12)",background:"#fff",cursor:"pointer",fontSize:"11.5px",fontWeight:700,color:"#1a1a2e",fontFamily:"'Source Sans 3',sans-serif"}}>Restore</button>
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
      <div style={{position:"fixed",left:"50%",bottom:"16px",transform:"translateX(-50%)",zIndex:900,background:"#1a1a2e",color:"#fff",padding:"7px 16px",borderRadius:"20px",fontSize:"12px",fontWeight:600,fontFamily:"'Source Sans 3',sans-serif",boxShadow:"0 6px 24px rgba(0,0,0,0.28)",pointerEvents:"none",whiteSpace:"nowrap"}}>
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
          <div style={{position:"fixed",left,top,transform:`translate(-50%, ${above?'-100%':'0'})`,zIndex:901,maxWidth:maxW+"px",background:"#fff",color:"#1a1a2e",padding:"10px 13px",borderRadius:"10px",boxShadow:"0 8px 32px rgba(0,0,0,0.22)",border:"1px solid rgba(0,0,0,0.08)",fontSize:"12.5px",lineHeight:1.5,fontFamily:"'Source Sans 3',sans-serif",pointerEvents:"none",animation:"fadeIn 0.12s ease"}}>
            {text}
          </div>
        );
      })()}
    </>
  );
}

function TabStrip({openPanels,onToggle,onTabClickFromManageSeating,timerStatus,classes,activeClassId,onSetActiveClass,onNewClass,onManageClass,onDeleteClass,manageSeatingOpen,onToggleManageSeating,manageGroupsOpen,onToggleManageGroups,onOpenSettings,helpMode,onToggleHelp}){
  const tabs=[
    {id:"timer",label:"Timer",icon:"⏱",help:"Quick countdown timers, or build a custom multi-step one with named tasks, alarms and cold call."},
    {id:"seating",label:"Seating",icon:"🪑",help:"See and adjust who's sitting where right now."},
    {id:"groups",label:"Groups",icon:"👥",help:"Randomly build student groups/teams, with rules for who should (or shouldn't) end up together."},
    {id:"checklist",label:"Checklist",icon:"✅",help:"A grid of work and tasks — who's done what, who's late, who owes what."},
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

  const renderTabButton=tab=>{
    const isOpen=!anyManageOpen&&openPanels[tab.id];
    const showBadge=tab.id==="timer"&&!isOpen&&timerStatus?.running;
    return(
      <button key={tab.id} className="no-drag" onClick={()=>{if(anyManageOpen)onTabClickFromManageSeating(tab.id);else onToggle(tab.id);}} title={tab.help} style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 13px",borderRadius:"8px",border:isOpen?"none":"1px solid rgba(74,49,28,0.2)",background:isOpen?"#1a1a2e":"transparent",color:isOpen?"#fff":"rgba(74,49,28,0.65)",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap",flexShrink:0}}
        onMouseEnter={e=>{if(!isOpen){e.currentTarget.style.background="rgba(255,255,255,0.3)";e.currentTarget.style.color="rgba(74,49,28,0.9)";}}}
        onMouseLeave={e=>{if(!isOpen){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(74,49,28,0.65)";}}}
      >
        <span style={{fontSize:"13px"}}>{tab.icon}</span>
        <span>{tab.label}</span>
        {showBadge&&<span style={{fontSize:"10px",fontWeight:700,color:"#2e6bce",background:"#eaf1fc",padding:"1px 6px",borderRadius:"6px",fontVariantNumeric:"tabular-nums",marginLeft:"2px"}}>{timerStatus.timeDisplay}</span>}
      </button>
    );
  };

  return(
    <div className="drag-bar" style={{display:"flex",alignItems:"center",height:"50px",padding:"0 12px",background:"repeating-linear-gradient(115deg,rgba(255,250,240,0.4) 0px,rgba(255,250,240,0.4) 1px,transparent 1px,transparent 5px),linear-gradient(180deg,#e0c1a0,#d1a97e)",borderBottom:"1px solid rgba(120,85,55,0.22)",flexShrink:0,zIndex:100,position:"relative"}}>
      <div style={{width:"72px",flexShrink:0}}/>
      <div ref={tabsOuterRef} style={{display:"flex",gap:"3px",flex:1,minWidth:0,justifyContent:"center",alignItems:"center",position:"relative"}}>
        {/* Hidden always-full-size copy, purely to measure whether all four
            tabs would fit — never shown, never interactive. */}
        <div ref={tabsMeasureRef} aria-hidden="true" style={{position:"absolute",top:0,left:"50%",visibility:"hidden",pointerEvents:"none",display:"flex",gap:"3px",alignItems:"center",whiteSpace:"nowrap"}}>
          {tabs.map(renderTabButton)}
        </div>
        {tabsCollapsed?(
          <div ref={tabsMenuRef} className="no-drag" style={{position:"relative"}}>
            <button onClick={()=>setTabsMenuOpen(o=>!o)} title="Show panels" style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"8px",border:"1px solid rgba(74,49,28,0.2)",background:tabsMenuOpen?"rgba(255,255,255,0.3)":"transparent",color:"rgba(74,49,28,0.75)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
              onMouseEnter={e=>{if(!tabsMenuOpen)e.currentTarget.style.background="rgba(255,255,255,0.3)";}}
              onMouseLeave={e=>{if(!tabsMenuOpen)e.currentTarget.style.background="transparent";}}
            >
              <span>☰ Panels</span>
              {timerStatus?.running&&!openPanels.timer&&!anyManageOpen&&<span style={{fontSize:"9px",fontWeight:700,color:"#2e6bce",background:"#eaf1fc",padding:"1px 5px",borderRadius:"5px",fontVariantNumeric:"tabular-nums"}}>{timerStatus.timeDisplay}</span>}
              <span style={{fontSize:"9px"}}>▾</span>
            </button>
            {tabsMenuOpen&&(
              <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",top:"calc(100% + 6px)",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"12px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:"170px",zIndex:400,overflow:"hidden",animation:"fadeIn 0.15s ease",padding:"6px"}}>
                {tabs.map(tab=>{
                  const isOpen=!anyManageOpen&&openPanels[tab.id];
                  const showBadge=tab.id==="timer"&&!isOpen&&timerStatus?.running;
                  return(
                    <button key={tab.id} onClick={()=>{if(anyManageOpen)onTabClickFromManageSeating(tab.id);else onToggle(tab.id);}} title={tab.help} style={{display:"flex",alignItems:"center",gap:"7px",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:"8px",border:"none",background:isOpen?"rgba(46,107,206,0.1)":"none",color:"#1a1a2e",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                      onMouseEnter={e=>e.currentTarget.style.background=isOpen?"rgba(46,107,206,0.15)":"rgba(0,0,0,0.05)"}
                      onMouseLeave={e=>e.currentTarget.style.background=isOpen?"rgba(46,107,206,0.1)":"none"}
                    >
                      <span style={{fontSize:"13px"}}>{tab.icon}</span>
                      <span style={{flex:1}}>{tab.label}</span>
                      {isOpen&&<span style={{fontSize:"11px",color:"#2e6bce"}}>✓</span>}
                      {showBadge&&<span style={{fontSize:"9px",fontWeight:700,color:"#2e6bce",background:"#eaf1fc",padding:"1px 5px",borderRadius:"5px",fontVariantNumeric:"tabular-nums"}}>{timerStatus.timeDisplay}</span>}
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
          <button onClick={()=>setOverflowOpen(o=>!o)} title="Manage seating & groups" style={{display:"flex",alignItems:"center",gap:"3px",padding:"5px 10px",borderRadius:"8px",border:"1px solid rgba(74,49,28,0.2)",background:overflowOpen?"rgba(255,255,255,0.3)":"transparent",color:"rgba(74,49,28,0.75)",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
            onMouseEnter={e=>{if(!overflowOpen)e.currentTarget.style.background="rgba(255,255,255,0.3)";}}
            onMouseLeave={e=>{if(!overflowOpen)e.currentTarget.style.background="transparent";}}
          >🗂 <span style={{fontSize:"9px"}}>▾</span></button>
          {overflowOpen&&(
            <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:"12px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:"190px",zIndex:400,overflow:"hidden",animation:"fadeIn 0.15s ease",padding:"6px"}}>
              <button onClick={()=>{onToggleManageSeating();setOverflowOpen(false);}} title="Full room editor — build the layout, tag seats, save layouts, run randomised seating" style={{display:"flex",alignItems:"center",gap:"7px",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:"8px",border:"none",background:manageSeatingOpen?"rgba(46,107,206,0.1)":"none",color:"#1a1a2e",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(46,107,206,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.background=manageSeatingOpen?"rgba(46,107,206,0.1)":"none"}
              >🗂 Manage Seating</button>
              <button onClick={()=>{onToggleManageGroups();setOverflowOpen(false);}} title="Build random student groups/teams — settings, fairness rules, drag-to-fix" style={{display:"flex",alignItems:"center",gap:"7px",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:"8px",border:"none",background:manageGroupsOpen?"rgba(58,138,78,0.1)":"none",color:"#1a1a2e",fontSize:"12.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(58,138,78,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.background=manageGroupsOpen?"rgba(58,138,78,0.1)":"none"}
              >🗂 Manage Groups</button>
            </div>
          )}
        </div>
        <button className="no-drag" onClick={onOpenSettings} title="Settings — whiteboard/blackboard theme" style={{background:"none",border:"1px solid rgba(74,49,28,0.22)",borderRadius:"6px",padding:"4px 9px",cursor:"pointer",color:"rgba(74,49,28,0.65)",fontSize:"15px",lineHeight:1,fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(74,49,28,0.4)";e.currentTarget.style.color="rgba(74,49,28,0.9)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(74,49,28,0.22)";e.currentTarget.style.color="rgba(74,49,28,0.65)";}}
        >⚙</button>
        <div className="no-drag"><DotsMenu classes={classes} activeClassId={activeClassId} onSetActiveClass={onSetActiveClass} onNewClass={onNewClass} onManageClass={onManageClass} onDeleteClass={onDeleteClass}/></div>
        <button className="no-drag" data-help-btn onClick={onToggleHelp} title={helpMode?"You are here! Click again or double click to leave help mode.":"Turn on help mode — hover anything to see what it does"} style={{background:helpMode?"#2e6bce":"none",border:`1px solid ${helpMode?"#2e6bce":"rgba(74,49,28,0.22)"}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer",color:helpMode?"#fff":"rgba(74,49,28,0.65)",fontSize:"15px",fontWeight:700,lineHeight:1,fontFamily:"'Source Sans 3',sans-serif",transition:"all 0.15s"}}
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
  useEffect(()=>{autoBackupIfNewDay();},[]);

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
    load(`sl-${classId}`,null).then(layout=>{
      if(!layout)return;
      const nextSeats=(layout.seats||[]).map(s=>removedSet.has(s.studentId)?{...s,studentId:null,locked:false}:s);
      if(nextSeats.some((s,i)=>s!==layout.seats[i]))save(`sl-${classId}`,{...layout,seats:nextSeats});
    });
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

  /* Delete a class — wipes its roster, seating layout, pairing history and checklist */
  const handleDeleteClass=useCallback(id=>{
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
        {manageSeatingOpen?(
          <div style={{flex:1,overflow:"hidden"}}>
            <ManageSeatingPanel activeClass={activeClass} checklist={checklist} onChangeChecklist={updateChecklist} flagsByStudent={flagsByStudent} now={now} showFlags={showFlagsSeating} onSetShowFlags={handleSetShowFlagsSeating} onGoToChecklist={goToChecklist} onUpdateStudentTags={updateStudentTags}/>
          </div>
        ):manageGroupsOpen?(
          <div style={{flex:1,overflow:"hidden"}}>
            <ManageGroupsPanel activeClass={activeClass} guardRef={groupsGuardRef} flagsByStudent={flagsByStudent} showFlags={showFlagsGroups} onSetShowFlags={handleSetShowFlagsGroups}/>
          </div>
        ):(
          <>
            {/* Timer panel — always mounted so timer keeps running when hidden */}
            <div style={{display:openPanels.timer?"flex":"none",flexDirection:"column",...(isLastOpen("timer")?{flex:1,minWidth:PANEL_MIN.timer}:{width:colWidth("timer"),flexShrink:0}),overflow:"hidden auto"}}>
              <TimerPanel onStatusChange={setTimerStatus} activeClass={activeClass} coldCallStudent={coldCallStudent} onColdCall={doColdCall} onDismissColdCall={dismissColdCall} timerStyle={timerStyle}/>
            </div>
            {openPanels.timer&&!isLastOpen("timer")&&<ResizeHandle panelId="timer"/>}

            {openPanels.seating&&(<div style={{display:"flex",flexDirection:"column",...(isLastOpen("seating")?{flex:1,minWidth:PANEL_MIN.seating}:{width:colWidth("seating"),flexShrink:0}),overflow:"hidden auto"}}><StudentSeatingPanel activeClass={activeClass} checklist={checklist} onChangeChecklist={updateChecklist} flagsByStudent={flagsByStudent} now={now} showFlags={showFlagsSeating} onSetShowFlags={handleSetShowFlagsSeating} onGoToChecklist={goToChecklist}/></div>)}
            {openPanels.seating&&!isLastOpen("seating")&&<ResizeHandle panelId="seating"/>}

            {openPanels.groups&&(<div style={{display:"flex",flexDirection:"column",...(isLastOpen("groups")?{flex:1,minWidth:PANEL_MIN.groups}:{width:colWidth("groups"),flexShrink:0}),overflow:"hidden auto"}}><StudentGroupsPanel activeClass={activeClass} flagsByStudent={flagsByStudent} showFlags={showFlagsGroups}/></div>)}
            {openPanels.groups&&!isLastOpen("groups")&&<ResizeHandle panelId="groups"/>}

            {openPanels.checklist&&(<div style={{display:"flex",flexDirection:"column",...(isLastOpen("checklist")?{flex:1,minWidth:PANEL_MIN.checklist}:{width:colWidth("checklist"),flexShrink:0}),overflow:"hidden auto"}}><ChecklistPanel activeClass={activeClass} classes={classes} data={checklist} onChange={updateChecklist} onCopyItems={copyChecklistItems} categories={checkCategories} onChangeCategories={updateCheckCategories} now={now} focus={pendingChecklistFocus} onFocusHandled={()=>setPendingChecklistFocus(null)}/></div>)}
            {openPanels.checklist&&!isLastOpen("checklist")&&<ResizeHandle panelId="checklist"/>}

            {noneOpen&&(<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg,var(--board-bg-top) 0%,var(--board-bg-bottom) 100%)",color:"var(--board-muted)",fontSize:"13px",fontStyle:"italic"}}>click a tab to open a panel</div>)}
          </>
        )}
      </div>

      {/* Manage class modal — rendered at root so it covers everything */}
      {editingClass&&(<ManageClassModal classToEdit={editingClass} onSave={handleSaveClass} onClose={()=>setEditingClass(null)}/>)}
      {showSettings&&(<SettingsModal theme={theme} onSetTheme={handleSetTheme} timerStyle={timerStyle} onSetTimerStyle={handleSetTimerStyle} onClose={()=>setShowSettings(false)}/>)}
    </div>
  );
}
