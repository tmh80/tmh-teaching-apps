# Calculator Formulas tab: formulas start locked, unlock when the student reaches the step that teaches them, and the triangles work
import pathlib, json
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/c4/'
pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
  b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
  pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
  pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
  def state(): return pg.evaluate("[...document.querySelectorAll('#calcForm .fcard')].map(c=>(c.classList.contains('locked')?'L':'U')+':'+c.querySelector('b').textContent.replace('🔒 ','')).join(' | ')")
  def opencalc():
    if pg.locator('#calc').is_hidden(): pg.click('#calcFab'); pg.wait_for_timeout(150)
    pg.click('#calcTabF'); pg.wait_for_timeout(150)
  opencalc(); print('start', state()); assert state().count('L:') == 7
  pg.click('#calcTabK'); pg.click('#calcX')
  def goto(sec, i):
    pg.evaluate(f"__fhq.openChapter('{sec}')"); pg.wait_for_timeout(400)
    pg.evaluate(f"__fhq.setStep({i})"); pg.wait_for_timeout(300)
    m = pg.locator('#modal #contAnyway')
    if m.count() and m.is_visible(): m.click(); pg.wait_for_timeout(200)
  goto('c1f', 6); print('toast', pg.locator('#toast').inner_text()); print('fab new dot', pg.evaluate("document.querySelector('#calcFab').classList.contains('hasnew')"))
  opencalc(); print('after c1 weight step', state())
  pg.locator('#calcForm .tri[data-kind=w] [data-tri=W]').first.click(); print('weight triangle:', pg.locator('#calcForm .tri[data-kind=w] .trisum').inner_text().replace('\n', ' '))
  pg.screenshot(path=OUT + 'calc_formulas_weight.png'); pg.click('#calcX')
  goto('c3f', 2); opencalc(); print('after c3 triangle step', state())
  for k, want in (('F', 'F = m × a'), ('m', 'm = F ÷ a'), ('a', 'a = F ÷ m')):
    pg.locator(f'#calcForm .tri[data-kind=fma] .trib [data-tri={k}]').click()
    got = pg.locator('#calcForm .tri[data-kind=fma] .trisum b').inner_text(); print(k, got); assert got == want
  pg.screenshot(path=OUT + 'calc_formulas_fma.png')
  pg.click('#calcTabK'); pg.fill('#calcIn', '270÷72'); pg.press('#calcIn', 'Enter'); print('keys still work', pg.input_value('#calcIn'))
  pg.click('#calcX')
  goto('c4f', 2); opencalc(); print('after c4 f3', state())
  # saved with the student's progress
  print('saved fu', pg.evaluate("JSON.stringify(__fhq.dbGet('fu',{}))"))
  # phone width
  pg.set_viewport_size({'width': 390, 'height': 800}); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'calc_formulas_phone.png')
  print('phone scrollW', pg.evaluate("document.documentElement.scrollWidth"))
  print('errors', errs)
