# Calculator Formulas tab: every formula is always there, the ones for the current chapter glow and come first, and the triangles work
import pathlib
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/c4/'
pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
  b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
  pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
  pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
  def names(sel): return pg.evaluate("s=>[...document.querySelectorAll(s)].map(c=>c.querySelector('b').firstChild.textContent.trim())", sel)
  def opencalc():
    if pg.locator('#calc').is_hidden(): pg.click('#calcFab'); pg.wait_for_timeout(150)
    pg.click('#calcTabF'); pg.wait_for_timeout(150)
  def goto(sec, i):
    pg.evaluate(f"__fhq.openChapter('{sec}')"); pg.wait_for_timeout(400)
    pg.evaluate(f"__fhq.setStep({i})"); pg.wait_for_timeout(300)
    m = pg.locator('#modal #contAnyway')
    if m.count() and m.is_visible(): m.click(); pg.wait_for_timeout(200)
  opencalc(); allf = names('#calcForm .fcard'); print('home', allf)
  assert len(allf) == pg.evaluate("__fhq.ev('FORMULAS.length')") and len(allf) >= 9 and not names('#calcForm .fcard.rel')
  pg.click('#calcTabK'); pg.click('#calcX')
  goto('c1f', 6); opencalc(); print('chapter 1 glow', names('#calcForm .fcard.rel')); assert names('#calcForm .fcard.rel') == ['Weight', 'Resultant force']
  assert names('#calcForm .fcard')[:2] == ['Weight', 'Resultant force']
  pg.locator('#calcForm .tri[data-kind=w] [data-tri=W]').first.click(); print('weight triangle:', pg.locator('#calcForm .tri[data-kind=w] .trisum').inner_text().replace('\n', ' '))
  pg.screenshot(path=OUT + 'calc_formulas_weight.png'); pg.click('#calcX')
  goto('c4f', 2); opencalc(); g = names('#calcForm .fcard.rel'); print('chapter 4 glow', g)
  assert set(g) == {"Newton's second law", "Newton's third law", 'A push that lasts 1 s'} and names('#calcForm .fcard')[:3] == g
  pg.screenshot(path=OUT + 'calc_formulas_c4.png')
  pg.click('#calcX'); goto('c5f', 2); opencalc(); g5 = names('#calcForm .fcard.rel'); print('chapter 5 glow', g5)
  assert len(g5) == 4 and 'Weight' in g5 and 'Resultant force' in g5
  pg.click('#calcX'); goto('c3f', 2); opencalc()
  for k, want in (('F', 'F = m × a'), ('m', 'm = F ÷ a'), ('a', 'a = F ÷ m')):
    pg.locator(f'#calcForm .tri[data-kind=fma] .trib [data-tri={k}]').click()
    got = pg.locator('#calcForm .tri[data-kind=fma] .trisum b').inner_text(); print(k, got); assert got == want
  pg.click('#calcTabK'); pg.fill('#calcIn', '270÷72'); pg.press('#calcIn', 'Enter'); print('keys still work', pg.input_value('#calcIn'))
  pg.set_viewport_size({'width': 390, 'height': 800}); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'calc_formulas_phone.png')
  print('phone scrollW', pg.evaluate("document.documentElement.scrollWidth"))
  print('errors', errs)
