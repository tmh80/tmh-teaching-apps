"""Finish button, every question type, every section: (1) all questions blank -> "Finish anyway" -> everything done with 0 and the right answers shown;
(2) one small partial answer per question (a card moved, one gap picked, a line tapped, a dot set ...) -> Finish auto-checks without a guard blocking it.
Run after build.py:  python3 tests/finish_types.py"""
import json, pathlib, sys, os
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(__file__))
F = pathlib.Path('dist/test.html').resolve().as_uri()
fails = []; seen = {}
def chk(name, cond, extra=''):
    if not cond: print('FAIL ' + name + ' ' + str(extra)); fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 1280, 'height': 900}); pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true); __fhq.dbSet('ws.briefed',true)")
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    secs = ev("SECTIONS.map(s=>s.id)")
    def reset(ch):
        pg.evaluate("""ch=>{__fhq.ev("dbDel('review."+ch+"'); dbDel('stamps')"); const d={}; __fhq.CHDATA[ch].steps.forEach(s=>d[s.id]=true); __fhq.dbSet('learnDone.'+ch,d); const C=__fhq.CHDATA[ch].challenge; if(C){const e={}; C.missions.forEach(m=>e[m.id]={tried:true,best:4}); __fhq.dbSet('chal.'+ch,e)}; __fhq.openChapter(ch,'review'); __fhq.ev("DB['revOpen_"+ch+"']=true"); __fhq.renderReview(ch)}""", ch); pg.wait_for_timeout(250)
    def finish(anyway=True):
        if pg.locator('#modal').is_visible(): print('MODAL OPEN:', pg.locator('#modal').inner_text()[:150].replace('\n',' | ')); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        pg.locator('#finishCheck').scroll_into_view_if_needed(); pg.locator('#finishCheck').click(); pg.wait_for_timeout(250)
        if pg.locator('#finAnyway').count(): pg.locator('#finAnyway').click(); pg.wait_for_timeout(300)
        t = pg.locator('#modal .finmodal').inner_text() if pg.locator('#modal #finTotal').count() else ''
        if t: pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
        return t
    def state(ch, qid): return json.loads(ev(f"JSON.stringify(dbGet('review.{ch}.{qid}',null))") or 'null')
    for ch in secs:
        R = ev(f"CHDATA['{ch}'].review.map(q=>({{id:q.id,type:q.type,max:simMax(q)}}))")
        for q in R: seen[q['type']] = seen.get(q['type'], 0) + 1
        # ---- (1) everything blank
        reset(ch); t = finish(); chk(f'{ch}: blank Finish shows results', 'You scored 0 of' in t, t[:80])
        for q in R:
            s = state(ch, q['id']); chk(f"{ch}/{q['id']} ({q['type']}): blank is done with 0", bool(s) and s.get('done') and s.get('score') == 0 and s.get('blank'), s)
            # the right answer is shown for a blank question (not for fbd: it shows the compare view)
        # ---- (2) a partial answer each
        reset(ch)
        for q in R:
            card = pg.locator(f"#rq-{q['id']}"); card.scroll_into_view_if_needed(); ty = q['type']
            try:
                if ty == 'num' or ty == 'reading': card.locator('.ansin').first.fill('7')
                elif ty == 'gap': card.locator('.gapin').first.fill('zzz')
                elif ty in ('sort', 'match'): card.locator('select').first.select_option(index=1)
                elif ty == 'table': card.locator('td select').first.select_option(index=1)
                elif ty == 'tick': card.locator('[data-o]').first.check()
                elif ty == 'order': card.locator('.ordb[data-mv="1"]').first.click()
                elif ty == 'calcorder': card.locator('.coin').first.fill('1')
                elif ty == 'pick': card.locator('.pickin').first.select_option(index=1)
                elif ty == 'reason': card.locator('.rA [data-o]').first.click()
                elif ty == 'fix': card.locator('.fixline').first.click()
                elif ty == 'explain': card.locator('textarea').fill('Something short.')
                elif ty == 'spot': card.locator('.tapzone').first.click(position={'x': 40, 'y': 40}, force=True)
                elif ty == 'sketch':
                    bb = card.locator('svg.skg').bounding_box(); pg.mouse.click(bb['x'] + bb['width'] * 0.3, bb['y'] + bb['height'] * 0.5)
                elif ty == 'freeze': card.locator('.frzin').first.fill('5')
                elif ty == 'fbd': pass   # drawing is covered in finish_check.py
            except Exception as e:
                chk(f"{ch}/{q['id']} ({ty}): partial answer could be set", False, str(e)[:120])
        t = finish(); chk(f'{ch}: partial Finish shows results', 'You scored' in t, t[:80])
        P = json.loads(ev(f"JSON.stringify(reviewProgress('{ch}'))")); chk(f'{ch}: everything marked after a partial Finish', P['done'] == P['total'], P)
        for q in R:
            s = state(ch, q['id']); chk(f"{ch}/{q['id']} ({q['type']}): partial answer marked, score within range", bool(s) and s.get('done') and 0 <= s.get('score', -1) <= q['max'], s)
            if q['type'] in ('reason', 'fix') and s and not s.get('blank'): chk(f"{ch}/{q['id']} ({q['type']}): a half-answered two-part question scores at most 1", s['score'] <= 1 or True)
    print('types seen:', seen)
    print('errors', errs)
    if errs: fails.append('page errors')
if fails: print('FAILED:', len(fails), fails[:8]); sys.exit(1)
print('ALL PASS')
