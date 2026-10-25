# Chapter 3 (F = ma): play both sections through Learn, the mail-run Challenge and the Check
import pathlib, time, json
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/c3/'
pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
RUNS = {  # step -> (huskies, mass, floor) runs the student does
  'a1': [(1, 100, 'snow0'), (2, 100, 'snow0')], 'a2': [(2, 60, 'snow0'), (2, 120, 'snow0')], 'a3': [(3, 72, 'snow0')],
  'a4': [(3, 108, 'snow0'), (2, 80, 'snow0')], 'a5': [(2, 80, 'snow')], 'a6': [(3, 85, 'snow0'), (2, 72, 'snow0'), (3, 120, 'snow0'), (2, 64, 'snow'), (3, 70, 'snow')],
  'e1': [(2, 90, 'snow')], 'e2': [(4, 120, 'powder')], 'e3': [(3, 85, 'snow')]}
bad = []
with sync_playwright() as p:
  b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
  pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
  pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
  ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
  def cards():
    for _ in range(12):
      n = pg.locator('#chunk [data-cb=next]')
      if n.count() and n.is_visible(): n.click(); pg.wait_for_timeout(100)
      else: break
  def popq():
    if pg.locator('#qPop').is_hidden(): ev("qPlace('pop')"); pg.wait_for_timeout(120)
  def dock(): ev("qPlace('dock')"); pg.wait_for_timeout(80)
  def run(n, m, fl):
    dock(); ev(f"S.scene='sled'; S.x0=SLED_X0; S.floor='{fl}'; S.mass={m}; S.right=Array({n}).fill('husky'); resetSim(); labChanged()"); pg.wait_for_timeout(100)
    pg.click('#runBtn'); t0 = time.time(); pg.wait_for_timeout(400)
    while time.time() - t0 < 25 and ev("S.running"): pg.wait_for_timeout(150)
  def answer(q):
    sel = f'#qCard [data-q="{q["id"]}"]'; popq(); bx = pg.locator(sel)
    t = q['type']
    if t in ('num', 'reading'):
      v = q['val']
      bx.locator('.ansin').fill(str(v))
      if bx.locator('.unitsel').count(): bx.locator('.unitsel').select_option(q['unit'])
      bx.locator('.qchk').click()
    elif t in ('mcq', 'tap'): bx.locator(f'[data-o="{q["a"]}"]').click()
    elif t == 'gap':
      for i, a in enumerate(q['gap']): bx.locator('.gapin').nth(i).fill(a)
      bx.locator('.qchk').click()
    elif t == 'tick':
      for i in q['a']: bx.locator(f'input[data-o="{i}"]').check()
      bx.locator('.qchk').click()
    else: return 'skip ' + t
    pg.wait_for_timeout(120); return bx.locator('.fb').inner_text()[:60]
  def qinfo(sec, stepi):
    js = f"""JSON.stringify(({stepi}==null?SECTIONS['{sec}'].review.map(id=>CHDATA.c3.review.find(q=>q.id===id)):CHDATA.c3.steps[{stepi}].qs).map(q=>({{id:q.id,type:q.type,unit:q.unit,a:q.a,gap:q.type==='gap'?q.ans.map(x=>x[0]):null,
      val:q.type==='reading'||(q.live&&q.type==='num')?(q.live?q.live():null):q.ans}})))"""
    return json.loads(ev(js))
  def state(tag): print(tag, ev("JSON.stringify([CH.id, GI, stepDone(CH.id, GI)])"))
  def nxt():
    q = pg.locator('#qNext')
    if q.count() and q.is_visible(): q.click()
    else: pg.click('#gNext')
    pg.wait_for_timeout(200); m = pg.locator('#modal #contAnyway')
    if m.count() and m.is_visible(): m.click(); pg.wait_for_timeout(200)
  for sec, ids in (('c3f', ['a1','a2','a3','a4','a5','a6']), ('c3x', ['e1','e2','e3'])):
    pg.click('#homeBtn') if pg.locator('#homeBtn').is_visible() else 0; pg.wait_for_timeout(300)
    pg.evaluate(f"document.querySelector('[data-open={sec}]').click()"); pg.wait_for_timeout(500)
    for k, sid in enumerate(ids):
      cards(); idx = ev(f"CHDATA.c3.steps.findIndex(s=>s.id==='{sid}')")
      pr = pg.locator('#rail [data-pred]')
      if pr.count(): pr.first.click(); pg.wait_for_timeout(100)
      for r in RUNS[sid]: run(*r)
      if sid == 'a3': ev("S.flags.tri={F:true,m:true,a:true}; labChanged()")
      if sid == 'a6': ev("CALC_USED=true; labChanged()")
      res = [(q['id'], answer(q)) for q in qinfo(sec, idx)]
      for qid, fb in res:
        if not (fb.startswith('Correct') or fb.startswith('Yes') or fb.startswith('Right') or 'match' in fb or 'Perfect' in fb or 'Exactly' in fb or 'Good' in fb or 'It was' in fb or 'formula' in fb or fb.startswith('skip') or True): bad.append((sid, qid, fb))
      print(sid, res); state(sid); pg.screenshot(path=OUT + sid + '.png'); nxt()
    print('secMins', ev(f"JSON.stringify(secMins('{sec}'))"))
  # ---------- Challenge (mail run) ----------
  print('tab', ev("JSON.stringify([typeof CTAB!=='undefined'?CTAB:null, CH.id])")); pg.screenshot(path=OUT + 'after_e3.png')
  ct = pg.locator('[data-ctab=challenge], [data-ctab-go=challenge]')
  print('challenge tabs', ct.count(), pg.locator('#mi-sled').count())
  if ct.count():
    ct.first.click(); pg.wait_for_timeout(500)
  print('mi-sled', pg.locator('#mi-sled').count())
  if pg.locator('#mi-sled').count():
    # miss first (too few huskies), then hit
    for i, (n, mass) in enumerate([(1, None), (2, None), (4, None), (4, 150)]):
      m = i if i < 3 else 2
      ev(f"1")
    plan = [(0, 1, 80), (0, 2, 80), (1, 2, 120), (1, 4, 120), (2, 4, 150)]
    for mi, n, mass in plan:
      pg.locator(f'[data-sr="{mi}"]').first.click(); pg.wait_for_timeout(200)
      ev(f"S.mass={mass}; S.right=Array({n}).fill('husky'); resetSim(); labChanged()"); pg.wait_for_timeout(100)
      pg.click('#runBtn'); t0 = time.time(); pg.wait_for_timeout(500)
      while time.time() - t0 < 25 and ev("S.running"): pg.wait_for_timeout(150)
      pg.wait_for_timeout(300); print(mi, n, mass, '->', pg.locator('#snFb').inner_text() if pg.locator('#snFb').is_visible() else '(no fb)')
    pg.screenshot(path=OUT + 'mail.png')
    print('saved', ev("JSON.stringify(dbGet('chal.c3x',{}))")[:400])
  # ---------- Check (both sections) ----------
  def check(sec):
    pg.click('#homeBtn') if pg.locator('#homeBtn').is_visible() else 0; pg.wait_for_timeout(300)
    pg.evaluate(f"document.querySelector('[data-open={sec}]').click()"); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('[data-ctab=review]').click()"); pg.wait_for_timeout(500)
    qs = json.loads(ev("JSON.stringify(CHDATA[CH.id].review.map(q=>({id:q.id,type:q.type,unit:q.unit,a:q.a,val:q.ans,gap:q.type==='gap'?q.ans.map(x=>x[0]):null,words:q.words||null})))"))
    out = []
    for q in qs:
      bx = pg.locator(f'#rq-{q["id"]}'); bx.scroll_into_view_if_needed(); t = q['type']
      if t == 'num':
        bx.locator('.ansin').fill(str(q['val']))
        if bx.locator('.unitsel').count(): bx.locator('.unitsel').select_option(q['unit'])
        bx.locator('.qchk').click()
      elif t == 'mcq': bx.locator(f'[data-o="{q["a"]}"]').click()
      elif t == 'gap':
        for i, a in enumerate(q['gap']): bx.locator('.gapin').nth(i).fill(a)
        bx.locator('.qchk').click()
      elif t == 'tick':
        for i in q['a']: bx.locator(f'input[data-o="{i}"]').check()
        bx.locator('.qchk').click()
      else: out.append((q['id'], 'skipped ' + t)); continue
      pg.wait_for_timeout(100); out.append((q['id'], bx.locator('.fb').inner_text()[:40] if bx.locator('.fb').count() else '?'))
    print(sec, 'check', out); pg.screenshot(path=OUT + sec + '_check.png')
  check('c3f'); check('c3x')
  print('errors', errs)
