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
    T = '#rb5TrainHost '
    chk('training is shown first, on the real board, and the rescue board is hidden', pg.locator(T + 'canvas').count() == 1 and pg.locator('#rb5Main').is_hidden())
    chk('training tray has only the lever, crane, pulley block and winch', pg.locator(T + '[data-add]').count() == 4)
    ban = lambda: pg.inner_text(T + '#banner')
    pg.wait_for_timeout(300); pg.locator('#rb5Train').scroll_into_view_if_needed(); pg.screenshot(path=OUT + 'training.png')
    pg.click(T + '[data-add="crane"]'); pg.wait_for_timeout(200); chk('a crane alone is refused: the rock is wedged', not pg.evaluate("()=>window.__board.ev.legs.length"))
    pg.click(T + '[data-add="lever"]'); pg.wait_for_timeout(200); chk('a short lever is refused with the numbers (240 N of 252 N)', pg.evaluate("()=>{const l=window.__board.ev.legs[0];return l&&!l.ok&&Math.round(l.gives)===240&&Math.round(l.pl.needs)===252}"))
    pg.click(T + '[data-a="le+"]'); pg.wait_for_timeout(200); chk('a longer lever pries the rock up, and the crane is next', pg.evaluate("()=>{const e=window.__board.ev;return e.legs[0].ok&&e.legs[1]&&e.legs[1].m.type==='crane'&&!e.legs[1].ok}"))
    pg.click(T + '[data-add="pulley"]'); pg.wait_for_timeout(200)
    chk('a pulley block from the tray is built on the stuck crane and joins its rope', pg.evaluate("()=>{const P=window.__board.parts,c=P.find(q=>q.type==='crane'),h=P.find(q=>q.type==='pulley');return h.mount===c.id&&h.to===c.id}"), ban())
    chk('4 ropes are still short (240 N)', not pg.evaluate("()=>window.__board.ev.won"))
    pg.click(T + '[data-a="r+"]'); pg.wait_for_timeout(5000); chk('5 ropes clear it: both legs work', pg.evaluate("()=>window.__board.ev.won") and 'Both legs work' in ban(), ban())
    pg.screenshot(path=OUT + 'training-built.png'); pg.click(T + '#run'); pg.wait_for_timeout(12500)
    chk('the board opens after training and the kit is packed away', pg.locator('#rb5Host canvas').count() == 1 and pg.locator('#rb5Main').is_visible() and pg.locator('#rb5Train').inner_html() == '' and pg.evaluate("()=>window.__board.parts.length") == 0)
    chk('training is saved', pg.evaluate("()=>!!__fhq.ev('dbGet(\"chal.c6e\",{}).gl.trainDone')"))
    pg.evaluate("p=>{window.__board.parts=p}", [dict(id='k', type='platform', x=12, w=6, wheels=True), dict(id='w', type='winch', x=0, y=0, mount='ground', gx=45, to=None, ratio=20, hooked=True, tow=None, via=None), dict(id='b', type='crane', x=44.5, lift=7, across=5.5, hooked=True)]); pg.wait_for_timeout(300)
    pg.click('#rb5Host [data-add="pulley"]'); pg.wait_for_timeout(200)
    chk('rescue board: a pulley block from the tray is built on the stuck crane and clipped to it', pg.evaluate("()=>{const h=window.__board.parts.find(q=>q.type==='pulley');return h.mount==='b'&&h.to==='b'}"), pg.inner_text('#rb5Host #banner'))
    box = pg.locator('#rb5Host canvas').bounding_box(); tile = pg.locator('#rb5Host [data-add="winch"]').bounding_box()
    at = pg.evaluate("()=>{const b=window.__board;b.V.z=1.9;b.V.cx=46;b.V.cy=9;return [b.sx(49)/b.V.LW,b.sy(11.5)/b.V.LH]}"); pg.wait_for_timeout(200)
    pg.mouse.move(tile['x'] + 20, tile['y'] + 12); pg.mouse.down(); pg.mouse.move(box['x'] + 200, box['y'] + 200, steps=4); pg.mouse.move(box['x'] + at[0] * box['width'], box['y'] + at[1] * box['height'], steps=4); pg.mouse.up(); pg.wait_for_timeout(250)
    chk('rescue board: a winch dragged onto the middle of the crane frame is built on the crane and joins its rope', pg.evaluate("()=>{const P=window.__board.parts,h=P.find(q=>q.type==='winch'&&q.id!=='w');return !!h&&h.mount==='b'&&h.to===P.find(q=>q.type==='pulley').id}"), pg.evaluate("()=>window.__board.parts.filter(q=>q.type==='winch')"))
    pg.evaluate("p=>{window.__board.parts=p}", ROUTE); pg.wait_for_timeout(500)
    chk('route strip has a row per leg (3 legs x 3 boxes)', pg.locator('.rb5in').count() == 9, pg.locator('.rb5in').count())
    chk('the board hides Smooshy\'s pull until GASA approves', 'Smooshy pulls' not in pg.inner_text('#legs'))
    lt = pg.inner_text('#legs'); chk('the board hides the total MA sum until GASA approves, and shows each distance', '4,800' not in lt and '20 × 4' in lt.replace('4 × 20', '20 × 4') and 'Dragged 34.1 m' in lt, lt)
    pg.click('#run'); pg.wait_for_timeout(300); chk('Run is refused before GASA approves', 'GASA' in pg.inner_text('#banner'), pg.inner_text('#banner'))
    for i in range(9): pg.locator('.rb5in').nth(i).fill('1')
    pg.click('#rb5Send'); chk('wrong boxes get a hint, not the answer', 'Look again' in pg.inner_text('#rb5Msg'), pg.inner_text('#rb5Msg'))
    pg.click('#rb5Send'); chk('a second wrong send gives the formula', 'force needed' in pg.inner_text('#rb5Msg') or 'MA' in pg.inner_text('#rb5Msg'), pg.inner_text('#rb5Msg'))
    legs = pg.evaluate("()=>{const e=window.__board.ev;return e.legs.filter(l=>l.ok).map(l=>[l.ma,l.pull,l.ma*(l.pl.dist||0)])}")
    for i, l in enumerate(legs):
        for j, v in enumerate(l): pg.locator('.rb5in').nth(i * 3 + j).fill(str(round(v, 2)))
    pg.click('#rb5Send'); pg.wait_for_timeout(200); chk('GASA approves right numbers', 'approves' in pg.inner_text('#rb5Msg'), pg.inner_text('#rb5Msg'))
    chk('after approval the board shows the full sum', '4,800' in pg.inner_text('#legs'))
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
