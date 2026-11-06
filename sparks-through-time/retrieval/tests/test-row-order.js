/* Table, match and sort rows are shown in a stable shuffled order (never the authored order when there are 3 or more rows),
   a right answer still marks right under that order, and the saved answer loads back onto the right rows after a reload.
   Also: order questions never start in the right order, and the blank worksheet shows rows in the same order as the screen. */
const { chromium } = require('playwright'), path = require('path');
(async()=>{ const b = await chromium.launch(); const pg = await b.newPage(); const errs = []; pg.on('pageerror', e=>errs.push(e.message));
 await pg.goto('file://' + path.resolve(__dirname, '../../Sparks-Through-Time.html')); await pg.waitForTimeout(400);
 const r = await pg.evaluate(()=>{
  const out = {checked:0, big:0, kept:[], fails:[], orderChecked:0};
  const items = [];
  STOPS.forEach(s=>['f','c'].forEach(p=>rvItems(s,p).forEach((it,i)=>items.push({it, tag:`${s.id}/${p}/${i}`}))));
  if (typeof RT_FAMILIES !== 'undefined') RT_FAMILIES.forEach(f=>['A','B'].forEach(d=>{ for (let k=0;k<12;k++){ let it = null; try{ it = rtGen(f.id, d, rtRng(`row${k}`)); }catch(e){} if (it) items.push({it, tag:`${f.id}${d}#${k}`}); } }));
  const labelsOf = tbl=>[...tbl.querySelectorAll('tbody tr')].map(tr=>tr.querySelector('td').textContent.trim());
  items.forEach(({it, tag})=>{
   if (it.t==='order'){ out.orderChecked++; for (let n=0;n<30;n++){ const host = document.createElement('div'); document.body.append(host); reviewCard(host, it, 1, null, ()=>{}); const got = [...host.querySelectorAll('.rv-otxt')].map(x=>x.innerHTML); host.remove(); if (got.length>1 && got.every((x,i)=>x===it.items[i])){ out.fails.push(tag+' order starts correct'); break; } } return; }
   if (!['table','match','sort'].includes(it.t)) return;
   const g = asGrid(it), n = g.rows.length, keep = gridRowsKeepOrder(it, g); out.checked++;
   const auth = g.rows.map(r=>String(r.label||'').replace(/<[^>]+>/g,'').trim());
   let resp = null; const host = document.createElement('div'); document.body.append(host);
   reviewCard(host, it, 1, null, v=>{ resp = v.resp; });
   const tbl = host.querySelector('table.rv-grid'); const shown = labelsOf(tbl);
   if (keep){ out.kept.push(tag); if (shown.join('|')!==auth.join('|')) out.fails.push(tag+' exception was reordered'); }
   else if (n>=3){ out.big++; if (shown.join('|')===auth.join('|') && auth.some(l=>l)) out.fails.push(tag+' displayed in authored order'); }
   /* second render gives the same order (stable) */
   const host2 = document.createElement('div'); document.body.append(host2); reviewCard(host2, it, 1, null, ()=>{}); if (labelsOf(host2.querySelector('table.rv-grid')).join('|')!==shown.join('|')) out.fails.push(tag+' order changes between renders'); host2.remove();
   /* fill the right answers by ORIGINAL row (matched through the display order) and press Check */
   const order = gridRowOrder(it, g); const trs = [...tbl.querySelectorAll('tbody tr')];
   trs.forEach((tr,pos)=>{ const i = order[pos]; [...tr.querySelectorAll('select')].forEach((sel,j)=>{ sel.value = g.rows[i].ans[j]; }); });
   [...host.querySelectorAll('button')].filter(x=>x.textContent==='Check')[0].click();
   if (!resp) { out.fails.push(tag+' no save'); host.remove(); return; }
   if (!g.rows.every((row,i)=>row.ans.every((a,j)=>resp[i][j]===a))) out.fails.push(tag+' saved answers not by original index');
   if (!host.querySelector('.feedback.ok')) out.fails.push(tag+' right answer not marked right');
   host.remove();
   /* reload: render again with the saved answer */
   const host3 = document.createElement('div'); document.body.append(host3); reviewCard(host3, it, 1, {resp, ok:true, done:true, pts:1, max:1}, ()=>{});
   const t3 = host3.querySelector('table.rv-grid'); [...t3.querySelectorAll('tbody tr')].forEach((tr,pos)=>{ const i = order[pos]; [...tr.querySelectorAll('select')].forEach((sel,j)=>{ if (sel.value!==g.rows[i].ans[j]) out.fails.push(tag+' reload mismatch row '+pos); }); });
   if (labelsOf(t3).join('|')!==shown.join('|')) out.fails.push(tag+' order after reload differs');
   /* the blank worksheet lists the rows in the same order */
   const ws = wsItem(it, 1, 'blank', null); const wl = [...ws.querySelectorAll('.ws-table tbody tr')].map(tr=>tr.querySelector('td').textContent.trim()); if (wl.join('|')!==shown.join('|')) out.fails.push(tag+' worksheet order differs from screen');
   const key = wsItem(it, 1, 'key', null); const kl = [...key.querySelectorAll('.ws-table tbody tr')]; if (!kl.every((tr,pos)=>{ const cells = [...tr.querySelectorAll('.ws-cell')].map(c=>c.textContent); return cells.join('|')===g.rows[order[pos]].ans.join('|'); })) out.fails.push(tag+' key does not match the shown order');
   host3.remove();
  });
  return out; });
 console.log(`grids checked ${r.checked}, with 3+ rows and shuffled ${r.big}, order questions ${r.orderChecked}`); console.log('kept in authored order:', [...new Set(r.kept.map(x=>x.replace(/#\d+$/,'')))].join(', '));
 r.fails.slice(0,20).forEach(f=>console.log('FAIL', f)); console.log('errors', errs.slice(0,3));
 await b.close(); if (r.fails.length || errs.length || r.big<20){ console.log('FAILED'); process.exit(1); } console.log('PASS'); })();
