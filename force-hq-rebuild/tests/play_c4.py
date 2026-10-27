# Chapter 4 (Action and reaction): play both sections through Learn, the docking-orders Challenge and the Check
import pathlib, time, json
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/c4/'
pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
RUNS = {  # step -> (push N, pod kg, astronaut kg) runs the student does
  'f1': [(100, 100, 100)], 'f2': [(200, 100, 100), (60, 100, 100)], 'f3': [(100, 200, 80)],
  'f5': [(150, 250, 75), (120, 300, 80), (90, 300, 100), (200, 400, 50)], 'g2': [(150, 250, 100)]}
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
  def waitrun(limit=40):
    t0 = time.time(); pg.wait_for_timeout(300)
    while time.time() - t0 < limit and ev("S.running"): pg.wait_for_timeout(120)
  def push(F, mp, ma, shot=None):
    ev(f"S.scene='space'; S.x0=POD_X0; S.floor='air'; S.mass={mp}; S.astro={ma}; S.pushF={F}; S.warp=8; resetSim(); labChanged()"); pg.wait_for_timeout(100)
    pg.click('#shoveBtn'); pg.wait_for_timeout(700)
    if shot: pg.screenshot(path=OUT + shot + '.png')
    waitrun()
  def answer(q):
    sel = f'#qCard [data-q="{q["id"]}"]'; popq(); bx = pg.locator(sel)
    t = q['type']
    if t in ('num', 'reading'):
      bx.locator('.ansin').fill(str(q['val']))
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
    js = f"""JSON.stringify(({stepi}==null?SECTIONS.find(s=>s.id==='{sec}').review.map(id=>CHDATA.c4.review.find(q=>q.id===id)):CHDATA.c4.steps[{stepi}].qs).map(q=>({{id:q.id,type:q.type,unit:q.unit,a:q.a,gap:q.type==='gap'?q.ans.map(x=>x[0]):null,
      val:q.type==='reading'||(q.live&&q.type==='num')?(q.live?q.live():null):q.ans}})))"""
    return json.loads(ev(js))
  def state(tag): print(tag, ev("JSON.stringify([CH.id, GI, stepDone(CH.id, GI)])"))
  def nxt():
    q = pg.locator('#qNext')
    if q.count() and q.is_visible(): q.click()
    else: pg.click('#gNext')
    pg.wait_for_timeout(200); m = pg.locator('#modal #contAnyway')
    if m.count() and m.is_visible(): m.click(); pg.wait_for_timeout(200)
  def burst(btn):
    pg.click(btn); pg.wait_for_timeout(200)
    t0 = time.time()
    while time.time() - t0 < 10 and ev("S.thrT>=0"): pg.wait_for_timeout(60)
  for sec, ids in (('c4f', ['f1','f2','f3','f4','f5']), ('c4x', ['g1','g2'])):
    pg.click('#homeBtn') if pg.locator('#homeBtn').is_visible() else 0; pg.wait_for_timeout(300)
    pg.evaluate(f"document.querySelector('[data-open={sec}]').click()"); pg.wait_for_timeout(500)
    for k, sid in enumerate(ids):
      cards(); idx = ev(f"CHDATA.c4.steps.findIndex(s=>s.id==='{sid}')")
      pr = pg.locator('#rail [data-pred]')
      if pr.count(): pr.first.click(); pg.wait_for_timeout(100)
      dock(); pg.screenshot(path=OUT + sid + '_start.png')
      if sid == 'f4':
        pg.click('#runBtn'); pg.wait_for_timeout(1800); pg.screenshot(path=OUT + 'f4_pairs.png'); ev("resetSim()")
      elif sid == 'g1':
        ev("S.warp=8"); [burst('#thrFwd') for _ in range(3)]; burst('#thrBack'); pg.screenshot(path=OUT + 'g1_thr.png')
      else:
        for i, r in enumerate(RUNS[sid]): push(*r, shot=(sid + '_push' + str(i)) if sid in ('f1', 'f2', 'f3') else None)
      if sid == 'f5': ev("CALC_USED=true; labChanged()")
      if sid in ('f3', 'f5'): print(sid, 'readouts before answering:', pg.locator('#v-readV').inner_text(), '|', pg.locator('#v-readAV').inner_text())
      res = [(q['id'], answer(q)) for q in qinfo(sec, idx)]
      if sid in ('f3', 'f5'): print(sid, 'readouts after answering:', pg.locator('#v-readV').inner_text(), '|', pg.locator('#v-readAV').inner_text())
      print(sid, res); state(sid); pg.screenshot(path=OUT + sid + '.png'); nxt()
    print('secMins', ev(f"JSON.stringify(secMins('{sec}'))"))
  # ---------- Challenge (docking orders) ----------
  ct = pg.locator('[data-ctab=challenge], [data-ctab-go=challenge]')
  print('challenge tabs', ct.count(), pg.locator('#mi-orders').count())
  if ct.count(): ct.first.click(); pg.wait_for_timeout(500)
  print('mi-orders', pg.locator('#mi-orders').count())
  if pg.locator('#mi-orders').count():
    plan = [(0, 50, None), (0, 100, None), (1, 210, None), (2, 300, 100), (2, 270, 140)]
    for mi, F, ma in plan:
      pg.locator(f'[data-or="{mi}"]').first.click(); pg.wait_for_timeout(200)
      ev(f"S.pushF={F}; " + (f"S.astro={ma}; " if ma else '') + "S.warp=8; resetSim(); labChanged()"); pg.wait_for_timeout(100)
      pg.click('#shoveBtn'); pg.wait_for_timeout(2500); pg.screenshot(path=OUT + f'ord{mi}_{F}.png'); waitrun()
      pg.wait_for_timeout(300); print(mi, F, ma, '->', pg.locator('#odFb').inner_text() if pg.locator('#odFb').is_visible() else '(no fb)')
    print('saved', ev("JSON.stringify(dbGet('chal.c4x',{}))")[:500])
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
  check('c4f'); check('c4x')
  print('errors', errs)
