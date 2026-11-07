# Shuffled display order: printed multiple-choice answers spread across A to D; order questions never start correct; table, match and sort rows are shuffled, stable and keep true sequences
import pathlib, json, sys
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); bad = []
def ok(c, m):
  print(('PASS ' if c else 'FAIL ') + m)
  if not c: bad.append(m)
with sync_playwright() as p:
  b = p.chromium.launch(); pg = b.new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto(f); pg.wait_for_timeout(300)
  ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
  d = json.loads(ev("""JSON.stringify((()=>{
    const out = { mcq: [0,0,0,0,0], all: [0,0,0,0,0], n: 0, ord: [], rows: [], again: 0 };
    const qs = [], rev = new Set(); SECTIONS.forEach(s => { CHDATA[s.id].review.forEach(q => { qs.push(q); rev.add(q); }); CHDATA[s.id].steps.forEach(st => (st.qs || []).forEach(q => qs.push(q))); });
    const seen = new Set();
    qs.forEach(q => { if (seen.has(q.id + q.type + (q.p||'').slice(0,20))) return; seen.add(q.id + q.type + (q.p||'').slice(0,20));
      if ((q.type === 'mcq' || q.type === 'tap') && !q.noShuffle && q.opts.length === 4) { out.all[optOrder(q).indexOf(q.a)]++; if (rev.has(q)) { out.mcq[optOrder(q).indexOf(q.a)]++; out.n++; } }
      if (q.type === 'order' || q.type === 'calcorder') { const p = orderPerm(q); out.ord.push([q.id, p.every((x, i) => x === i)]); }
      if (q.type === 'table' || q.type === 'match' || q.type === 'sort') { const labs = q.type === 'sort' ? q.items.map(x => x[0]) : q.rows.map(r => r[0]); const o1 = rowOrder(q, labs), o2 = rowOrder(q, labs); out.rows.push([q.id, q.type, labs.length, o1.every((x, i) => x === i), JSON.stringify(o1) === JSON.stringify(o2), !!q.keepRows]); }
    });
    return out; })())"""))
  tot = d['n']; share = [c / tot for c in d['mcq']]; print('printed (Check) answers land on A,B,C,D:', d['mcq'], 'of', tot, '| every question incl. Learn:', d['all'])
  syn = json.loads(ev("JSON.stringify((()=>{ const c=[0,0,0,0], ids=[]; for (const pre of ['c1r','c2r','c3r','c4r','c5r','c6r','r']) for (let i=1;i<40;i++) ids.push(pre+i); ids.forEach(id=>{ c[optOrder({id, opts:['a','b','c','d'], a:0}).indexOf(0)]++; }); return c; })())"))
  print('shuffle on 273 made-up ids, right answer on A,B,C,D:', syn)
  al = d['all'][:4]; ok(max(al) <= 0.45 * sum(al) and min(al) >= 0.12 * sum(al), f'Learn questions are spread across A to D too: {al}')
  ok(all(0.18 <= x / sum(syn) <= 0.32 for x in syn), 'the shuffle itself spreads the right answer across A to D (no Sparks bug)')
  ok(tot >= 10 and all(c >= 1 for c in d['mcq'][:4]) and max(d['mcq'][:4]) <= 0.55 * tot, 'printed multiple-choice answers in the real Checks use every letter A to D')
  ok(not any(x[1] for x in d['ord']), 'order questions never start in the right order')
  ok(all(r[4] for r in d['rows']), 'row order is the same every time (stable across reloads)')
  moved = [r for r in d['rows'] if r[2] >= 3 and not r[3]]; same = [r[0] for r in d['rows'] if r[2] >= 3 and r[3] and not r[5]]
  print('rows shuffled:', len(moved), 'kept in authored order:', same)
  ok(len(moved) >= 10, 'table, match and sort rows are shuffled')
  t = json.loads(ev("""JSON.stringify([rowOrder({id:'x', keepRows:true}, ['a','b','c','d']), rowOrder({id:'y'}, ['1 N','2 N','3 N','4 N']), rowOrder({id:'z'}, ['10 kg','20 kg','30 kg']), rowOrder({id:'w'}, ['Weight','Friction','Tension','Air resistance','Normal force']).join('')])"""))
  ok(t[0] == [0, 1, 2, 3] and t[1] == [0, 1, 2, 3] and t[2] == [0, 1, 2], 'keepRows and rows that are the same words with a rising number stay in order')
  ok(t[3] != '01234', 'other rows are shuffled')
  print('errors', errs, bad); b.close()
sys.exit(1 if errs or bad else 0)
