"""Part 5 rescue (new board): training round, board, route strip + GASA check, run, score, My Rescue page. Real clicks and a real run.
Run after build.py:  python3 tests/play_rescue5.py     Screenshots: /tmp/fhq-shots/rescue5/"""
import pathlib, json, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/rescue5/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
def H(i, t, mount, to, **k): d = dict(id=i, type=t, x=0, y=0, mount=mount, to=to); d.update(k); return d
ROUTE = [dict(id='a', type='pole', x=44, h=6), H('a1', 'winch', 'a', 'a2', ratio=20), H('a2', 'pulley', 'a', None, ropes=4, hooked=True),
  dict(id='b', type='crane', x=45.5, lift=7, across=4.5, hooked=True), H('b1', 'winch', 'b', 'b2', ratio=16), H('b2', 'pulley', 'b', 'b', ropes=8),
  dict(id='d', type='pole', x=84, h=6), H('d1', 'winch', 'd', 'd2', ratio=20), H('d2', 'pulley', 'd', None, ropes=8, hooked=True)]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 1100}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.ev('DB.user.teacher=true')"); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(600); pg.evaluate("__fhq.ev('closeModal()')")
    chk('training is shown first and the board is hidden', pg.locator('#rb5tc').count() == 1 and pg.locator('#rb5Main').is_hidden())
    pg.locator('#rb5tc').scroll_into_view_if_needed(); pg.screenshot(path=OUT + 'training.png')
    pg.click('#rb5ttry'); chk('a weak lever is refused with the numbers', 'Not enough' in pg.inner_text('#rb5tmsg'), pg.inner_text('#rb5tmsg'))
    pg.select_option('#rb5e', '3'); pg.select_option('#rb5wl', '8'); pg.click('#rb5ttry'); pg.wait_for_timeout(2400)
    chk('step 2 (crane) follows the lever', pg.locator('#rb5ro').count() == 1)
    pg.select_option('#rb5ro', '4'); pg.select_option('#rb5wc', '4'); pg.click('#rb5ttry'); pg.wait_for_timeout(4500)
    chk('the board opens after training and the kit is packed away', pg.locator('#rb5Host canvas').count() == 1 and pg.locator('#rb5Main').is_visible() and pg.locator('#rb5Train').inner_html() == '')
    chk('training is saved', pg.evaluate("()=>!!__fhq.ev('dbGet(\"chal.c6e\",{}).gl.trainDone')"))
    pg.evaluate("p=>{window.__board.parts=p}", ROUTE); pg.wait_for_timeout(500)
    chk('route strip has a row per leg (3 legs x 3 boxes)', pg.locator('.rb5in').count() == 9, pg.locator('.rb5in').count())
    chk('the board hides Smooshy\'s pull until GASA approves', 'Smooshy pulls' not in pg.inner_text('#legs'))
    pg.click('#run'); pg.wait_for_timeout(300); chk('Run is refused before GASA approves', 'GASA' in pg.inner_text('#banner'), pg.inner_text('#banner'))
    for i in range(9): pg.locator('.rb5in').nth(i).fill('1')
    pg.click('#rb5Send'); chk('wrong boxes get a hint, not the answer', 'Look again' in pg.inner_text('#rb5Msg'), pg.inner_text('#rb5Msg'))
    pg.click('#rb5Send'); chk('a second wrong send gives the formula', 'force needed' in pg.inner_text('#rb5Msg') or 'MA' in pg.inner_text('#rb5Msg'), pg.inner_text('#rb5Msg'))
    legs = pg.evaluate("()=>{const e=window.__board.ev;return e.legs.filter(l=>l.ok).map(l=>[l.ma,l.pull,l.ma*(l.pl.dist||0)])}")
    for i, l in enumerate(legs):
        for j, v in enumerate(l): pg.locator('.rb5in').nth(i * 3 + j).fill(str(round(v, 2)))
    pg.click('#rb5Send'); pg.wait_for_timeout(200); chk('GASA approves right numbers', 'approves' in pg.inner_text('#rb5Msg'), pg.inner_text('#rb5Msg'))
    pg.click('#run'); pg.wait_for_timeout(21000)
    g = pg.evaluate("()=>{const g=__fhq.ev('dbGet(\"chal.c6e\",{}).gl');return {runs:g.runs,first:!!g.firstDone,best:g.best,score:g.lastSum&&g.lastSum.score,hints:g.work5&&g.work5.hints,snap:!!(g.bestRun&&g.bestRun.snap),parts:(g.parts5||[]).length}}")
    chk('the rescue is recorded and scored (4 + 2 budget + 1 maths = 7 for this example)', g['first'] and g['best'] == 7 and g['score']['pts']['maths'] == 1, g)
    chk('best run keeps a picture and the pieces are saved', g['snap'] and g['parts'] == 9, g)
    pg.reload(); pg.wait_for_timeout(600); pg.evaluate("__fhq.ev('DB.user.teacher=true')"); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(700); pg.evaluate("__fhq.ev('closeModal()')")
    chk('after a reload the board comes back with the saved pieces', pg.evaluate("()=>window.__board.parts.length") == 9)
    for m in ['student', 'key', 'blank']:
        h = pg.evaluate("m=>__fhq.ev('myRescueHTML(\"'+m+'\")')", m); chk('My Rescue page renders: ' + m, 'My Rescue' in h and len(h) > 500)
    chk('no page errors', not errs, errs[:3]); b.close()
print('errors', errs[:3]); print('FAILS', fails); sys.exit(1 if fails else 0)
