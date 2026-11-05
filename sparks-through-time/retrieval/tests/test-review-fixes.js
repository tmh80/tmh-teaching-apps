/* Table choices are mixed, the ammeter gap says connected, and Complete works at the top of a review. */
const { chromium } = require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+path.resolve(__dirname,'../../Sparks-Through-Time.html'));
 await pg.evaluate(()=>{Store.data.studentName='Check';Store.data.studentClass='6X';Store.save();}); await pg.reload(); await pg.waitForTimeout(400);
 const r=await pg.evaluate(async()=>{ const out={grids:0,rowOrder:[],same:0};
  STOPS.forEach(s=>['f','c'].forEach(p=>rvItems(s,p).forEach((it,i)=>{ if(!['table','match','sort'].includes(it.t)) return; const g=asGrid(it); g.cols.forEach((c,j)=>{ const o=gridOptions(g,j); if(o.length<3) return; out.grids++; const rows=g.rows.map(x=>x.ans[j]); if(o.every((x,k)=>x===rows[k])) out.rowOrder.push(s.id+p+(i+1)); if(c.options&&o.join()===c.options.join()) out.same++; if(new Set(o).size!==o.length||gridOptions(g,j).join()!==o.join()) out.rowOrder.push('unstable '+s.id); }); })));
  const c=STOPS.find(s=>s.id==='circuits'); const it=rvItems(c,'f').find(x=>x.t==='fill'&&/ammeter/.test(JSON.stringify(x.blanks))); out.fill=[it.text,it.blanks[2]];
  return out; });
 console.log(JSON.stringify(r).slice(0,300));
 await pg.evaluate(()=>{ const c=STOPS.find(s=>s.id==='circuits'); travel(c); }); await pg.waitForTimeout(1500);
 await pg.evaluate(()=>{ const c=STOPS.find(s=>s.id==='circuits'); prog(c.id).learn=true; Store.data.teacherOK=true; Store.save(); renderStop(c,'review'); }); await pg.waitForTimeout(600);
 const has=async t=>pg.evaluate(t=>[...document.querySelectorAll('.rv-bar button,.rv-bar div')].some(x=>x.textContent.includes(t)),t);
 console.log('before', await has('Complete my review'), await has('Complete!'));
 await pg.getByRole('button',{name:/Complete my review/}).click(); await pg.waitForTimeout(100); console.log('missing list', await has('still have'));
 await pg.evaluate(()=>{ const c=STOPS.find(s=>s.id==='circuits'), st=rvStore(rvKey(c,'f')); rvItems(c,'f').forEach((it,i)=>{st[i]={done:true,ok:true,pts:1,max:1}}); Store.save(); renderStop(c,'review'); }); await pg.waitForTimeout(500);
 console.log('after', await has('Complete!'), await has('Make my Foundation worksheet')); console.log('errors',errs.slice(0,3));
 await b.close(); })();
