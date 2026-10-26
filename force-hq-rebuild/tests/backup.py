# Progress backup: save to a file and a code, load it back into an empty browser, undo, and "Start fresh"
import pathlib, json
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/'; D = pathlib.Path('/tmp/fhq-shots/bk'); D.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
  b = p.chromium.launch(); errs = []
  def mk():
    ctx = b.new_context(viewport={'width': 1280, 'height': 860}, accept_downloads=True); pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); return ctx, pg
  ctx, pg = mk(); pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.fill('#whoCls', '7B'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
  ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
  pg.evaluate("__fhq.dbSet('learn.c1.s1.q1', {done:true, ok:true, v:2})"); pg.evaluate("__fhq.dbSet('learnDone.c1f', {s0:true, s1:true})"); pg.evaluate("__fhq.dbSet('jnotes', {k1:'my note about friction'})"); pg.evaluate("__fhq.dbSet('unlocked', true)")
  pg.click('#bkBtn'); pg.wait_for_timeout(200); pg.screenshot(path=OUT + 'bk_modal.png')
  with pg.expect_download() as dl: pg.click('#bkSave')
  d = dl.value; path = D / d.suggested_filename; d.save_as(str(path)); print('file', d.suggested_filename, path.stat().st_size, 'bytes')
  txt = path.read_text(); o = json.loads(txt); pay = json.loads(o['payload']); print('has note', pay['data']['jnotes'], 'unlocked saved?', 'unlocked' in pay['data'], 'name', pay['name'], pay['cls'])
  pg.click('summary:has-text("download did not work")'); pg.click('#bkMakeCode'); pg.wait_for_timeout(300); code = pg.input_value('#bkCode'); print('code', code[:12], len(code))
  ctx.close()
  # fresh browser (a loaner device): load from the first screen
  ctx, pg = mk(); pg.goto(f); pg.wait_for_timeout(400); pg.click('#haveFile'); pg.wait_for_timeout(200)
  pg.set_input_files('#bkFile', str(path)); pg.wait_for_timeout(400); print('review:', pg.locator('#modal').inner_text().replace('\n', ' | ')[:230])
  pg.click('#bkYes'); pg.wait_for_timeout(900)
  ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
  print('after load:', ev("JSON.stringify([user().name, user().cls, dbGet('jnotes',{}), dbGet('learnDone.c1f',{}), !!DB.unlocked])"))
  # tampered file
  bad = json.loads(txt); bad['payload'] = bad['payload'].replace('Sam', 'Tom'); (D / 'bad.json').write_text(json.dumps(bad))
  pg.click('#bkBtn'); pg.wait_for_timeout(200); pg.set_input_files('#bkFile', str(D / 'bad.json')); pg.wait_for_timeout(400); print('tampered:', pg.locator('#bkMsg').inner_text())
  # code load into another fresh browser
  ctx2, pg2 = mk(); pg2.goto(f); pg2.wait_for_timeout(400); pg2.click('#haveFile'); pg2.wait_for_timeout(200); pg2.click('summary:has-text("Load from a progress code")'); pg2.fill('#bkPaste', code); pg2.click('#bkLoadCode'); pg2.wait_for_timeout(500); print('code review:', pg2.locator('#modal').inner_text().replace('\n', ' | ')[:120])
  pg2.click('#bkYes'); pg2.wait_for_timeout(900); print('code load:', pg2.evaluate("c=>__fhq.ev(c)", "JSON.stringify([user().name, dbGet('jnotes',{})])"))
  ctx2.close()
  # start fresh from the Change screen
  pg.evaluate("document.querySelector('.modal [data-close]') && document.querySelector('.modal [data-close]').click()"); pg.wait_for_timeout(200)
  pg.click('[data-act=who]'); pg.wait_for_timeout(200); pg.screenshot(path=OUT + 'bk_who.png'); pg.click('#freshStart'); pg.wait_for_timeout(200); pg.click('#frYes'); pg.wait_for_timeout(400)
  print('fresh:', ev("JSON.stringify([user().name||null, Object.keys(DB)])"), 'name box shown:', pg.locator('#whoName').count())
  # Undo is not offered after fresh, but is after a load: check the key exists
  print('errors', errs)
