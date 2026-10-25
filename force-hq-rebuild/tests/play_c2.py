# Chapter 2 (Inertia): play both sections through Learn, the obstacle-course Challenge and the Check
import pathlib, time
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/c2/'
pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
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
  def box(q): popq(); return pg.locator(f'#qCard [data-q="{q}"]')
  def num(q, v):
    bx = box(q); bx.locator('.ansin').fill(str(v)); bx.locator('.qchk').click(); pg.wait_for_timeout(120); return bx.locator('.fb').inner_text()
  def opt(q, t):
    bx = box(q); bx.locator('button[data-o]', has_text=t).first.click(); pg.wait_for_timeout(120); return bx.locator('.fb').inner_text()
  def gap(q, vals):
    bx = box(q); ins = bx.locator('.gapin')
    for i, v in enumerate(vals): ins.nth(i).fill(v)
    bx.locator('.qchk').click(); pg.wait_for_timeout(120); return bx.locator('.fb').inner_text()
  def dock(): ev("qPlace('dock')"); pg.wait_for_timeout(80)
  def wait_stop(limit=15):
    t0 = time.time(); pg.wait_for_timeout(300)
    while time.time() - t0 < limit and ev("S.running"): pg.wait_for_timeout(150)
  def setm(m): ev(f"S.mass={m}; resetSim(); labChanged()"); pg.wait_for_timeout(80)
  def push(m): dock(); setm(m); pg.click('#shoveBtn'); pg.wait_for_timeout(1000)
  def launch(m=None, F=None):
    dock()
    if m: setm(m)
    if F: ev(f"S.brakeF={F}; resetSim(); labChanged()")
    pg.click('#launchBtn'); wait_stop()
  def state(tag): print(tag, ev("JSON.stringify([CH.id, GI, [...document.querySelectorAll('#rail .tasks li')].map(l=>l.className.includes('ok')||l.className.includes('done')), stepDone(CH.id, GI)])"))
  def nxt():
    q = pg.locator('#qNext')
    if q.count() and q.is_visible(): q.click()
    else: pg.click('#gNext')
    pg.wait_for_timeout(200); m = pg.locator('#modal #contAnyway')
    if m.count() and m.is_visible(): m.click(); pg.wait_for_timeout(200)
  # ---------- Foundation ----------
  pg.click('[data-open="c2f"]'); pg.wait_for_timeout(500); cards()
  pg.click('#rail [data-pred="2"]'); pg.wait_for_timeout(100)
  for m in (24, 61, 147): push(m)
  sp = ev("JSON.stringify(S.flags.sp)"); print('speeds', sp)
  pg.screenshot(path=OUT + 'i1.png')
  import json; S1 = json.loads(sp)
  print(num('q1', f"{S1['24']:.2f}"), '|', num('q2', f"{S1['61']:.2f}"), '|', num('q3', f"{S1['147']:.2f}"), '|', opt('q4', '6 times more slowly')); state('i1'); nxt()
  cards(); push(48); v48 = ev('S.flags.sp[48]'); print(opt('q1', 'how hard it is to change')); print(gap('q2', ['mass', 'more difficult'])); print(num('q3', f'{v48:.2f}'), '|', num('q4', '0.78')); state('i2'); nxt()
  cards(); push(61); pg.wait_for_timeout(1200); pg.locator('#cvVT').scroll_into_view_if_needed(); pg.screenshot(path=OUT + 'i3_graph.png')
  v = ev("S.flags.sp[61]"); print(num('q1', f"{v:.1f}"), '|', opt('q2', 'steady speed')); state('i3'); nxt()
  cards(); pg.click('#rail [data-pred="1"]'); launch(24); pg.screenshot(path=OUT + 'i4_24.png'); launch(61); pg.screenshot(path=OUT + 'i4_61.png')
  d = json.loads(ev("JSON.stringify(S.flags.sd)")); print('distances', d)
  print(num('q1', f"{d['24']:.2f}"), '|', num('q2', f"{d['61']:.2f}"), '|', opt('q3', 'more inertia')); state('i4'); nxt()
  cards(); push(47); print(opt('q1', 'stays still, or keeps moving'), '|', opt('q2', 'keeps gliding')); state('i5'); nxt()
  cards(); launch(); print(opt('q1', 'Their body has inertia'), '|', opt('q2', 'tend to stay still'), '|', opt('q3', 'The bowling ball')); state('i6')
  print('foundation learn', ev("JSON.stringify(learnProgress('c2f'))")); nxt(); pg.wait_for_timeout(400)
  pg.screenshot(path=OUT + 'c2f_check.png', full_page=True)
  print('check tab', ev("CTAB"), ev("JSON.stringify(reviewProgress('c2f'))"))
  # ---------- Extension ----------
  ev("openChapter('c2x','learn')"); pg.wait_for_timeout(500); cards()
  launch(); pg.locator('#cvVT').scroll_into_view_if_needed(); pg.screenshot(path=OUT + 'x1.png', full_page=True)
  st = ev("S.flags.st[55]"); print('stop time', st)
  print(num('q1', '1.8'), '|', num('q2', f"{st:.1f}"), '|', opt('q3', 'Only the weight and the normal force')); state('x1'); nxt()
  cards(); launch(40, 48); launch(120, 48); launch(120, 150); print('marks', ev('JSON.stringify(LAB.bmarks)')); launch(120, 144); pg.screenshot(path=OUT + 'x2.png')
  f2 = ev("JSON.stringify([S.flags.car48, S.flags.truck48, S.flags.truckOK])"); print('x2 flags', f2); c48, t48, ok = json.loads(f2)
  print(num('q1', f"{c48:.2f}"), '|', num('q2', f"{t48:.2f}"), '|', num('q3', '3'), '|', num('q4', f'{t48/c48:.2f}'), '|', num('q5', '144'), '|', opt('q6', '3 times the brake force')); state('x2'); nxt(); pg.wait_for_timeout(500)
  print('tab', ev("CTAB"))
  # challenge: crate 1 miss then hit, crate 2 hit, crate 3 hit
  def ch_launch(F):
    ev(f"S.brakeF={F}; resetSim(); labChanged()"); pg.click('#launchBtn'); wait_stop(); pg.wait_for_timeout(200)
  ch_launch(40); print('b1 miss:', pg.locator('#bkFb').inner_text()); ch_launch(32); print('b1:', pg.locator('#bkFb').inner_text())
  pg.screenshot(path=OUT + 'chal_b1.png', full_page=True)
  pg.click('#bkMore [data-cr="1"]'); pg.wait_for_timeout(200); ch_launch(62); print('b2:', pg.locator('#bkFb').inner_text())
  pg.click('#bkMore [data-cr="2"]'); pg.wait_for_timeout(200); ch_launch(92); print('b3:', pg.locator('#bkFb').inner_text())
  print('chal', ev("JSON.stringify(challengeState('c2x'))"))
  pg.screenshot(path=OUT + 'chal_done.png', full_page=True)
  ev("setCTab('review')"); pg.wait_for_timeout(400); pg.screenshot(path=OUT + 'c2x_check.png', full_page=True)
  # phone width
  pg.set_viewport_size({'width': 390, 'height': 844}); ev("openChapter('c2f','learn')"); pg.wait_for_timeout(400); ev("setStep(2)"); pg.wait_for_timeout(400); cards()
  pg.screenshot(path=OUT + 'phone_i3.png', full_page=True); print('phone scrollW', pg.evaluate('document.documentElement.scrollWidth'))
  print('errors', errs)
