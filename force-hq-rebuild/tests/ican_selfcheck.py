# Whole app (Chapter 1 and every section): I can statements, the I can screen, the My I can statements button on every tab, read-first OK,
# the self-check before the Check (not blocking a part-done Check or teacher mode), worksheet and AI text. FAST is switched off.
import pathlib, json, sys
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); bad = []
def ok(c, m):
  print(('PASS ' if c else 'FAIL ') + m)
  if not c: bad.append(m)
with sync_playwright() as p:
  b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
  pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
  ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
  ev("FAST=false"); ev("SECTIONS.forEach(s=>{DB['revOpen_'+s.id]=true})")
  secs = json.loads(ev("JSON.stringify(SECTIONS.map(s=>[s.id,(ICAN[s.id]||[]).length]))"))
  ok(len(secs) >= 17 and all(3 <= n <= 4 for _, n in secs), f'every section has 3 or 4 I can statements: {secs}')
  ok(all(' ' + w not in ' '.join(ev("JSON.stringify(Object.values(ICAN).flat())").split()) for w in ('ACARA', 'MYP')), 'no standards on student screens')
  # Chapter 1 Foundation: I can screen, then read-first OK
  pg.click('[data-open="c1f"]'); pg.wait_for_timeout(500)
  ok(pg.locator('#icanCard li').count() == 4, 'Chapter 1: the I can screen comes first')
  pg.click('.ican-next'); pg.wait_for_timeout(400)
  ok(pg.locator('.rg-blur').count() >= 3 and pg.locator('#chunk .say-ok').count() == 1, 'Chapter 1: read-first OK on step 1')
  pg.click('#chunk .say-ok'); pg.wait_for_timeout(100); ok(pg.locator('.rg-blur').count() == 0, 'Chapter 1: OK clears the blur')
  # the button on every tab
  d = pg.locator('#icanPeek details'); ok(d.count() == 1 and not d.locator('li').first.is_visible(), 'the button starts closed')
  d.locator('summary').click(); ok(d.locator('li').first.is_visible(), 'the button opens on the Learn tab')
  ev("hideCards()"); ev("setCTab('review')"); pg.wait_for_timeout(300); ok(pg.locator('#icanPeek details summary').count() == 1, 'the button is there on the Check tab')
  ev("openChapter('c1x','challenge')"); pg.wait_for_timeout(400); ok(pg.locator('#icanPeek details summary').count() == 1, 'the button is there on the Challenge tab')
  # a finished step skips the blur
  ev("openChapter('c1f','learn')"); pg.wait_for_timeout(300)
  ev("dbSet('learnDone.c1f',{s0:true}); dbDel('readOK.c1f.s0'); setStep(0)"); pg.wait_for_timeout(300)
  ok(pg.locator('.rg-blur').count() == 0, 'a finished step is not blurred')
  # self-check before the Check, Chapter 1
  ev("setCTab('review')"); pg.wait_for_timeout(300)
  ok(pg.locator('.sa-card').count() == 1 and pg.locator('.revq:visible').count() == 0, 'Chapter 1: questions hidden until the self-check is done')
  tr = pg.locator('.sa-track'); ok(tr.count() == 4, 'four statements, four lines')
  for i in range(4): tr.nth(i).scroll_into_view_if_needed(); tr.nth(i).click(position={'x': 60 + 90 * i, 'y': 10})
  ok(not pg.locator('.sa-go').is_disabled(), 'Save is ready once every line has an X')
  pg.locator('.sa-go').click(); pg.wait_for_timeout(200)
  ok(pg.locator('.revq:visible').count() == 7 and pg.locator('details.sa-done').count() == 1, 'questions appear and the self-check is kept in a fold-out')
  # not blocking a part-done Check, nor teacher mode
  ev("dbDel('selfA.c1f'); dbSet('review.c1f',{[CHDATA.c1f.review[0].id]:{v:0,done:true,ok:false,tries:1,max:1,score:0}}); setCTab('learn'); setCTab('review')"); pg.wait_for_timeout(300)
  ok(pg.locator('.sa-card').count() == 0 and pg.locator('.revq:visible').count() > 0, 'a part-done Check is never blocked')
  ev("openChapter('c2f','review')"); pg.wait_for_timeout(300); ok(pg.locator('.sa-card').count() == 1, 'every Foundation asks for it')
  ev("dbSet('user',{name:'T',teacher:true}); openChapter('c3f','review')"); pg.wait_for_timeout(300)
  ok(pg.locator('.sa-card').count() == 0 and pg.locator('.revq:visible').count() > 0, 'teacher mode is not blocked')
  ev("dbSet('user',{name:'Sam'})")
  # worksheets and AI text for every section
  r = json.loads(ev("""JSON.stringify(SECTIONS.map(s => { const o = { id: s.id }; ['student','blank','key'].forEach(m => { const h = buildWorksheet(s.id, m), i = h.indexOf('ws-selfcheck'); o[m] = [i > h.indexOf('namebar') && i > 0 && i < h.indexOf('<h2>'), (h.match(/wsx/g) || []).length, (h.match(/ws-sa-line/g) || []).length]; }); o.ai = /self-review/.test(aiFeedbackText([s.id], [])) && aiFeedbackText([s.id], []).startsWith('All written feedback should be grade 7-8'); return o; }))"""))
  ok(all(x['student'][0] and x['blank'][0] and x['key'][0] for x in r), 'self-check sits straight under the name on student, blank and key sheets of every section')
  ok(all(x['blank'][1] == 0 and x['blank'][2] >= 3 for x in r), 'blank sheets have empty lines')
  ok(all(x['ai'] for x in r), 'the AI text of every task has the self-review note and keeps its first line')
  ai = ev("aiFeedbackText(['c1f'],[])"); ok('at most one short sentence' in ai.replace('\n', ' ') and 'not marked' in ai, 'AI text: unmarked, at most one comparing sentence')
  ev("dbSet('selfA.c1f',{v:[10,40,60,90],done:true})")
  h = ev("buildWorksheet('c1f','student')"); ok(h.count('class="wsx"') == 4, 'student sheet shows their four Xs')
  print('errors', errs, bad); b.close()
sys.exit(1 if errs or bad else 0)
