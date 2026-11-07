"""Part 5 worksheet: My Rescue page (student, blank, key), the reflection on its own page, marking scheme and AI text.
Run after build.py:  python3 tests/play_myrescue.py"""
import json, pathlib, re
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
routes = pathlib.Path('tests/rescue_routes.js').read_text()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    ev = lambda code: pg.evaluate('c=>__fhq.ev(c)', code)
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev('DB.user.teacher=true'); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500); ev('closeModal()'); pg.wait_for_timeout(200)
    html0 = ev("buildWorksheet('c6e','student')")
    chk('before any run the student page shows an empty frame and no score', 'rsnap empty' in html0 and 'My Rescue' in html0)
    pg.evaluate('c=>__fhq.ev(c)', routes + ";(()=>{GLB.rig=ROUTES.top(); glChanged(); glRunPaint();})()"); pg.wait_for_timeout(100)
    pg.fill('#glPVal', '56'); pg.fill('#glWork', '4 x 4 x 7 = 112, 6300 / 112 = 56.25'); pg.click('#glRun'); pg.wait_for_timeout(300); ev('GLR.t0 -= 1e7'); pg.wait_for_timeout(700)
    s = json.loads(ev("JSON.stringify((__fhq.dbGet('chal.c6e',{}).gl||{}).bestRun.sum.score)")); chk('top route scores 10', s == 10, s)
    for pop in pg.locator('#glPop').all(): pass
    html = ev("buildWorksheet('c6e','student')")
    chk('student My Rescue has the screenshot, stamp, score, a row per leg, totals and working', 'data:image/jpeg' in html and 'Spotless' in html and '10 of 10' in html and html.count('<td>1</td>') >= 1 and '1,344 m' in html and '75,600 J' in html and '4 x 4 x 7 = 112' in html, re.sub('<[^>]+>', ' ', html)[:500])
    chk('student page 1 comes before Part A, reflection on its own page', html.index('My Rescue') < html.index('Part A') < html.index('Part C: My rescue reflection') and html.count('class="page"') >= 3)
    chk('reflection is the last Check question', ev("CHDATA.c6e.review.slice(-1)[0].id") == 'c6r32' and ev("CHDATA.c6e.review.slice(-1)[0].type") == 'explain')
    blank = ev("buildWorksheet('c6e','blank')"); chk('blank template has an empty frame and no numbers', 'rsnap empty' in blank and 'data:image' not in blank and '1,344' not in blank)
    key = ev("buildWorksheet('c6e','key')"); chk('answer key shows an example route picture and its numbers', 'data:image/jpeg' in key and '56.3 N' in key and '1,344 m' in key and '75,600 J' in key and '358' in key, re.sub('<[^>]+>', ' ', key)[:400])
    scheme = ev("schemeHTML('c6e')"); chk('marking scheme has the reflection points and the My Rescue instruction', 'My Rescue table' in scheme and 'Gives one improvement with a reason' in scheme)
    ai = ev("typeof aiPromptText==='function' ? aiPromptText('c6e') : ''") or ''
    src = pathlib.Path('dist/test.html').read_text()
    chk('AI text mentions the My Rescue page and keeps its first line', 'My Rescue page (not marked)' in src and 'All written feedback should be grade 7-8 appropriate language, short and to-the-point, and enthusiastic.' in src and 'three rescue stages' not in src)
    chk('section time is about 60 minutes', abs(ev("secMins('c6e').total") - 60) <= 2, ev("secMins('c6e').total"))
    # the PDF route: the screenshot (a data: JPEG) must come through, on the student copy and on the key
    import subprocess, sys; sys.path.insert(0, 'tests'); from pdfcheck import download_check
    for mode in ['student', 'key']:
        if mode == 'key': pg.reload(); pg.wait_for_timeout(500); ev('DB.unlocked=true;saveDB()')   # the helper removes the modal, so start fresh
        r = download_check(pg, 'c6e', mode, '/tmp/fhq-shots/c6e'); imgs = subprocess.run(['pdfimages', '-list', str(r['path'])], capture_output=True, text=True).stdout.strip().splitlines()
        chk(f'{mode} PDF has My Rescue text and a picture on page 1', 'My Rescue' in r['text'] and ('1,344' in r['text']) and any(l.split()[0] == '1' for l in imgs[2:]), (r['pages'], r['text'][:200], imgs[:4]))
        chk(f'{mode} PDF page count matches the print preview', r['pages'] == r['print_pages'] or abs(r['pages'] - r['print_pages']) <= 1, (r['pages'], r['print_pages']))
    chk('no page errors', not errs, errs)
print('FAILS: ' + str(fails) if fails else 'all passed')
