# Answer boxes under Do-this tasks, the question shown in each task, the Journal tab on the right edge,
# the Journal Working tab and the calculator's "Save to Journal" button
import pathlib
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); bad = []
def check(label, ok):
  print(('ok  ' if ok else 'FAIL'), label)
  if not ok: bad.append(label)
with sync_playwright() as p:
  b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
  pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
  pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
  ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
  def cards():
    for _ in range(8):
      n = pg.locator('#chunk [data-cb=next]')
      if n.count() and n.is_visible(): n.click(); pg.wait_for_timeout(100)
      else: break
  ev("openChapter('c4f')"); pg.wait_for_timeout(300); ev("setStep(4)"); pg.wait_for_timeout(400); cards()
  # 1. every puzzle task shows its question and has an answer box
  tasks = pg.locator('#rail .tasks li')
  check('4 calculate + 4 check tasks', tasks.count() == 8)
  check('task 1 states the question', 'What velocity does the pod reach?' in tasks.nth(0).inner_text())
  check('task 3 states the question', "What is the pod's mass?" in tasks.nth(4).inner_text())
  check('each task has an answer box', pg.locator('#rail .tkans').count() == 4)
  check('mass puzzle box has a kg unit', 'kg' in pg.locator('#rail .tkans').nth(2).locator('.tksel').inner_text())
  # 2. typing in the task copies into Your turn (the Your turn box stays hidden until Next)
  box = pg.locator('#rail .tkans').first
  box.locator('[data-chkq]').click(); pg.wait_for_timeout(150)
  check('Check with nothing typed gives a message in the task box', 'number' in box.locator('.tkmsg').inner_text().lower())
  box.locator('.tkin').fill('0.65'); box.locator('.tksel').select_option('m/s'); pg.wait_for_timeout(100)
  q1 = pg.locator('#qCard [data-q=q1]')
  check('number copied to the question', q1.locator('.ansin').input_value() == '0.65')
  check('unit copied to the question', q1.locator('.unitsel').input_value() == 'm/s')
  # 3. and typing in the question copies back
  ev("qPlace('pop')"); pg.wait_for_timeout(200)
  q1.locator('.ansin').fill('0.7')
  check('question edit copied back to the task box', box.locator('.tkin').input_value() == '0.7')
  ev("qPlace('dock')"); pg.wait_for_timeout(100)
  # 4. Check in the task box marks the Your turn question
  box.locator('.tkin').fill('0.6'); box.locator('[data-chkq]').click(); pg.wait_for_timeout(300)
  check('answer was marked right in Your turn', ev("!!(dbGet(stepKey(CH.id, GI) + '.q1', null) || {}).ok"))
  check('Your turn question shows as locked', pg.locator('#qCard [data-q=q1].locked').count() == 1)
  check('task box locked after checking', pg.locator('#rail .tkans').first.locator('.tkin').is_disabled())
  check('task box shows the answer and a tick', pg.locator('#rail .tkans').first.locator('.tkin').input_value() == '0.6' and '✓' in pg.locator('#rail .tkans').first.locator('.tkmsg').inner_text())
  check('f5 has separate check tasks', 'Check puzzle 1' in pg.locator('#rail .tasks').inner_text())
  # 5. the unfinished-tasks modal names the question
  ev("qPlace('dock')"); pg.wait_for_timeout(100); pg.click('#gNext'); pg.wait_for_timeout(300)
  m = pg.locator('.modal').inner_text()
  check('modal names the question', 'What velocity does the astronaut reach?' in m and "What is the pod's mass?" in m)
  check('modal lists the Space Dome check for puzzle 1', 'Check puzzle 1' in m and 'rescue pod' not in m)
  pg.click('.modal [data-close]'); pg.wait_for_timeout(100)
  # 6. a calculate task ticks once the answer has been checked, and the "Check it" reading completes itself in the simulation
  ev("setStep(2)"); pg.wait_for_timeout(300); cards()
  t = pg.locator('#rail .tasks li'); n = t.count()
  check('f3 has predict, 2 calculate and 1 check tasks', n == 4)
  box = pg.locator('#rail .tkans').first
  box.locator('.tkin').fill('0.5'); box.locator('.tksel').select_option('m/s'); pg.wait_for_timeout(150)
  check('calculate task not ticked until checked', 'ok' not in (t.nth(1).get_attribute('class') or ''))
  box.locator('[data-chkq]').click(); pg.wait_for_timeout(250)
  check('calculate task ticks once checked', 'ok' in (t.nth(1).get_attribute('class') or ''))
  check('check task not ticked before the push', 'ok' not in (t.nth(3).get_attribute('class') or ''))
  ev("S.scene='space'; S.x0=POD_X0; S.floor='air'; S.mass=200; S.astro=80; S.pushF=100; S.warp=8; resetSim(); labChanged()"); pg.wait_for_timeout(100)
  pg.click('#shoveBtn'); pg.wait_for_timeout(500)
  for _ in range(60):
    if not ev("S.running"): break
    pg.wait_for_timeout(150)
  pg.wait_for_timeout(300)
  check('check task ticks after the push', 'ok' in (t.nth(3).get_attribute('class') or ''))
  check('the Check it reading question completed itself', ev("!!(dbGet(stepKey(CH.id, GI) + '.q4', null) || {}).done"))
  # 7. the Journal tab on the right edge
  tab = pg.locator('.jtab')
  check('journal tab visible', tab.is_visible())
  tab.click(); pg.wait_for_timeout(250)
  check('journal tab opens the Journal', pg.locator('#journal').is_visible() and tab.get_attribute('aria-expanded') == 'true')
  check('journal tab sits beside the open Journal', tab.bounding_box()['x'] + tab.bounding_box()['width'] <= pg.locator('#journal').bounding_box()['x'] + 4)
  tab.click(); pg.wait_for_timeout(200)
  check('journal tab closes the Journal', pg.locator('#journal').is_hidden())
  # 8. calculator -> Save to Journal -> Working tab
  pg.click('#calcFab'); pg.wait_for_timeout(150)
  pg.fill('#calcIn', '100/200'); pg.fill('#calcNote', 'velocity = F ÷ m'); pg.click('#calcSave'); pg.wait_for_timeout(150)
  w = ev("JSON.stringify(dbGet('jwork'))")
  check('calculation saved with note', '"res":"0.5"' in w and 'velocity = F ÷ m' in w)
  pg.click('#calcWork'); pg.wait_for_timeout(250)
  check('Working tab is open', pg.locator('#journal [data-jtab=work][aria-selected=true]').count() == 1)
  check('saved calculation listed', '100÷200' in pg.locator('#journal .calcl').inner_text())
  pg.locator('#workPad').fill('velocity = 100 ÷ 200\nvelocity = 0.5 m/s'); pg.wait_for_timeout(100)
  check('working saved against this step', 'velocity = 0.5 m/s' in ev("(dbGet('jwork').pads['c4f:f3']||{}).text||''"))
  pg.click('#jClose'); pg.wait_for_timeout(100); ev("setStep(4)"); pg.wait_for_timeout(300)
  pg.click('.jtab'); pg.wait_for_timeout(250)
  check('working from another step is kept', 'Working from other steps' in pg.locator('#journal').inner_text())
  pg.screenshot(path='/tmp/fhq-shots/new/test_work.png')
  # 9. phone width has no sideways scroll
  pg.set_viewport_size({'width': 390, 'height': 800}); pg.wait_for_timeout(300)
  check('phone no sideways scroll', pg.evaluate("document.documentElement.scrollWidth") <= 392)
  print('errors', errs, 'FAILED' if bad else 'all ok')
  b.close()
raise SystemExit(1 if bad or errs else 0)
