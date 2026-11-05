/* Looks for stray computer words (null, undefined, NaN, [object Object]) on every new screen. */
const { chromium } = require('playwright'), path=require('path');
const BAD=/\bnull\b|\bundefined\b|\bNaN\b|\[object/;
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+path.resolve(__dirname,'../../Sparks-Through-Time.html'));
 await pg.evaluate(()=>{Store.data.studentName='Check';Store.data.studentClass='6X';Store.data.teacherOK=true;Store.save();}); await pg.reload(); await pg.waitForTimeout(400);
 const bad=[]; let n=0;
 const look=async w=>{ n++; const t=await pg.evaluate(()=>document.getElementById('app').innerText); const m=t.match(BAD); if(m) bad.push(w+': '+t.slice(Math.max(0,m.index-50),m.index+40).replace(/\n/g,' ')); };
 const click=async re=>pg.evaluate(s=>{const r=new RegExp(s,'i');const x=[...document.querySelectorAll('#app button')].find(b=>r.test(b.textContent)&&!b.disabled);if(x){x.click();return true}return false},re);
 await pg.evaluate(()=>renderHome()); await look('home');
 await pg.evaluate(()=>{STOPS.forEach(s=>{prog(s.id).learn=true});Store.save();renderRtFlashcards(STOPS.map(s=>s.id))}); await look('fc pick');
 await click('^Both$'); await click('start|begin|go'); await pg.waitForTimeout(200);
 for(let i=0;i<150;i++){ await look('fc front'); if(!await click('flip|show')) break; await look('fc back'); if(!await click(i%3?'got it':'not yet')) break; await pg.waitForTimeout(10); }
 await look('fc end');
 await pg.evaluate(()=>renderRtReview()); await look('review pick'); await click('start|begin|go'); await pg.waitForTimeout(200); await look('review');
 await pg.evaluate(()=>renderRtTimeTest()); await look('tt start'); await click('^Start'); await pg.waitForTimeout(200); await look('tt');
 for(const s of RTCODES()) { await pg.evaluate(c=>renderRtClassSet(c),s); await pg.waitForTimeout(40); await look('set '+s); }
 await pg.evaluate(()=>renderTeacher()); await pg.waitForTimeout(200); await look('teacher');
 console.log(n+' screens checked; '+bad.length+' with stray words; page errors '+errs.length); [...new Set(bad)].slice(0,12).forEach(x=>console.log(x)); errs.slice(0,3).forEach(x=>console.log(x));
 await b.close(); process.exit(bad.length||errs.length?1:0);
})();
function RTCODES(){ return Array.from({length:12},(_,i)=>'S'+String(i+1).padStart(2,'0')); }
