"""Tom's feedback, 23 Nov 2026: run with python3 tests/feedback_1123.py from the force-hq-rebuild folder.
1. The push always gives the same velocity, whatever the frame rate (24 kg: 3.26 m/s, never 3.12 / 3.13).
2. Distance ÷ time (the average velocity) gets a hint and a second go.
3. Minimised questions float on screen at desktop, iPad and phone widths, and open with one tap.
4. Clear runs during a live run keeps that run and clears the rest (real mouse clicks).
5. Air-floor tug-of-war: a crate left sliding right, then given a stronger left team, never moves right."""
import pathlib, json
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/'
pathlib.Path(OUT).mkdir(exist_ok=True)
errs = []
def start(b, w, h):
  pg = b.new_page(viewport={'width': w, 'height': h}); pg.on('pageerror', lambda e: errs.append(str(e)))
  pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Mia'); pg.click('#whoGo')
  pg.evaluate("__fhq.dbSet('tourDone',true)"); return pg
def cards(pg):
  for _ in range(12):
    n = pg.locator('body > .chunk .go, .chunk .cnav .go')
    if n.count() and n.first.is_visible(): n.first.click(); pg.wait_for_timeout(80)
    else: break
with sync_playwright() as p:
  b = p.chromium.launch()
  pg = start(b, 1440, 860); ev = lambda c: pg.evaluate(f"__fhq.ev({json.dumps(c)})")
  pg.evaluate("__fhq.openChapter('c2f','learn')"); pg.wait_for_timeout(300); cards(pg)
  # 1. same velocity at any frame rate
  res = ev("""(() => { const out = {}; S.running = false; for (const fps of [24, 30, 60, 90, 120, 144]) for (const m of [24, 48, 61, 96, 147]) {
      S.mass = m; resetSim(); shove(); let n = 0, t = 0; while (S.running && t < 0.9) { const dt = 1 / fps * (0.8 + 0.4 * ((n * 7919) % 13) / 13); updateSim(dt); t += dt; n++; }
      (out[m] = out[m] || []).push(fmt(S.v, 2)); } S.running = false; resetSim(); return out; })()""")
  print('velocities', res)
  for m, vs in res.items(): assert len(set(vs)) == 1, (m, vs)
  assert res['24'][0] == '3.26' and res['48'][0] == '1.63' and res['96'][0] == '0.82', res
  # 2. the average-velocity trap: hint, then a second go
  ev("S.mass = 24; resetSim(); labChanged()"); pg.click('#shoveBtn'); pg.wait_for_timeout(1300)
  ev("qPlace('pop')"); pg.wait_for_timeout(200)
  q = pg.locator('#qCard .qitem[data-q="q1"]'); q.locator('.ansin').fill('2.71'); q.locator('.qchk').click(); pg.wait_for_timeout(100)
  msg = q.locator('.fb').inner_text(); print('trap:', msg)
  assert 'average velocity' in msg and 'locked' not in (q.get_attribute('class') or '')
  q.locator('.ansin').fill('3.26'); q.locator('.qchk').click(); pg.wait_for_timeout(100)
  print('then:', q.locator('.fb').inner_text()); assert 'ok' in q.get_attribute('class')
  # 3. minimised questions stay in view
  for w, h, tag in [(1440, 860, 'desk'), (1024, 700, 'ipad'), (390, 800, 'phone')]:
    pg.set_viewport_size({'width': w, 'height': h}); ev("qPlace('pop')"); pg.wait_for_timeout(150)
    pg.click('#qMin'); pg.wait_for_timeout(150); pg.mouse.wheel(0, 900); pg.wait_for_timeout(150)
    r = pg.evaluate("(() => { const r = document.querySelector('#qCard').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; })()")
    assert r[0] >= 0 and r[2] <= w and r[1] >= 0 and r[3] <= h, (tag, r)
    pg.screenshot(path=OUT + f'qfloat_{tag}.png'); pg.click('#qOpen'); pg.wait_for_timeout(150); assert pg.locator('#qPop').is_visible(), tag
    print(tag, 'floating tab in view', [round(x) for x in r], 'scrollW', pg.evaluate('document.documentElement.scrollWidth'))
    pg.click('#qMin'); pg.wait_for_timeout(100)
  pg.set_viewport_size({'width': 1440, 'height': 860}); pg.wait_for_timeout(150)
  # 4. clear runs while a run is underway (a slow push of the 147 kg crate)
  for m in (24, 61): ev(f"S.mass = {m}; resetSim(); labChanged()"); pg.click('#shoveBtn'); pg.wait_for_timeout(700)
  ev("S.mass = 147; resetSim(); labChanged()"); pg.click('#shoveBtn'); pg.wait_for_timeout(300)
  pg.click('[data-journal]'); pg.wait_for_timeout(200); pg.locator('#journal [data-jtab="runs"], #journal [data-tab="runs"]').first.click(); pg.wait_for_timeout(300)
  before = ev("runsAll().length"); assert ev("!!RUN"), 'a run should be live'
  pg.locator('#rpClear').scroll_into_view_if_needed(); print('button:', pg.locator('#rpClear').inner_text())
  pg.locator('#rpClear').click(); pg.wait_for_timeout(700); print('armed:', pg.locator('#rpClear').inner_text())
  pg.locator('#rpClear').click(); pg.wait_for_timeout(400)
  after = ev("runsAll().map(r => [r.mass, r.live])"); print('runs before', before, 'after', after, '|', pg.locator('.rpcleared').inner_text())
  assert after == [[147, True]], after
  pg.screenshot(path=OUT + 'clear_live.png'); pg.click('#jClose'); pg.wait_for_timeout(100)
  # 5. tug-of-war on the air floor
  pg.evaluate("__fhq.openChapter('c1f','learn')"); pg.wait_for_timeout(300); pg.evaluate("__fhq.setStep(4)"); pg.wait_for_timeout(300); cards(pg)
  ev("S.left = ['adult']; S.right = ['strong']; labChanged()"); pg.click('#runBtn'); pg.wait_for_timeout(900); pg.click('#runBtn'); pg.wait_for_timeout(100)
  print('paused sliding right at', ev("[+S.x.toFixed(2), +S.v.toFixed(2)]"))
  ev("S.left = ['adult', 'kid']; S.right = ['adult']; labChanged()"); x0 = ev("S.x"); pg.click('#runBtn')
  xs = []
  for _ in range(10): pg.wait_for_timeout(100); xs.append(ev("S.x"))
  print('after new teams', x0, [round(x, 3) for x in xs], '| toast:', pg.locator('#toast').inner_text())
  assert all(b2 <= a2 + 1e-9 for a2, b2 in zip([x0 if x0 == 0 else 0] + xs, xs)) and xs[-1] < 0, xs
  # same teams after a pause still carry on the same run
  pg.click('#runBtn'); pg.wait_for_timeout(100); v1 = ev("S.v"); pg.click('#runBtn'); pg.wait_for_timeout(50); assert ev("S.v") <= v1 + 1e-9 and ev("S.x") < 0
  print('resume keeps going', round(v1, 3))
  print('errors', errs)
