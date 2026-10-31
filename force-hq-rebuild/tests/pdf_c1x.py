"""Direct PDF download for Chapter 1 Extension (free-body diagram, tick list, explain), the file name, the print title swap and the no-name gate.
Run after build.py: python3 tests/pdf_c1x.py"""
import pathlib, sys, subprocess
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from playwright.sync_api import sync_playwright
from pdfcheck import download_check
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/c1/'; fails = []
def chk(n, c, x=''):
    print(('PASS ' if c else 'FAIL ') + n + (' ' + str(x) if (x and not c) else '')); c or fails.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 1000}, accept_downloads=True); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Alex Chen'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.openChapter('c1x','review')"); pg.wait_for_timeout(400)
    ca = pg.locator('#revAnyway')
    if ca.count() and ca.is_visible(): ca.click(); pg.wait_for_timeout(300)
    q = lambda i: pg.locator(f'#rq-{i}') if False else pg.locator('.revq').nth(i) if False else pg.locator(f'[id^="rq-"]').nth(i)
    ids = pg.evaluate("__fhq.ev('CHDATA.c1x.review.map(q=>q.id)')"); print(ids)
    R = lambda qid: pg.locator(f'#rq-{qid}')
    # c1x: r4 mass, r6 tick the forces, r8 the free-body diagram, r12 arrow to scale, r11 explain
    R('r4').locator('.ansin').fill('110'); R('r4').locator('.qchk').click()
    for t in ['Weight', 'Normal force', 'Tension', 'Friction']: R('r6').locator('label', has_text=t).first.locator('input').check()
    R('r6').locator('.qchk').click()
    R('r12').locator('button[data-o]', has_text='1 cm').click()
    R('r11').locator('textarea').fill('Friction acts against the pull on concrete and balances it so the crate stays still. The air floor has no friction.'); R('r11').locator('.qchk').click()
    for k in [0, 1, 3]: R('r11').locator(f'[data-ck="{k}"]').check()
    svg = R('r8').locator('.board svg'); svg.scroll_into_view_if_needed(); bb = svg.bounding_box(); k = bb['width'] / 520
    def draw(dx, dy, typ, val):
        cx, cy = bb['x'] + 260 * k, bb['y'] + 200 * k; pg.mouse.move(cx, cy); pg.mouse.down()
        for i in range(1, 8): pg.mouse.move(cx + dx * k * i / 7, cy + dy * k * i / 7)
        pg.mouse.up(); pg.wait_for_timeout(120); m = R('r8').locator('.amenu'); m.locator('.mt').select_option(typ); m.locator('.mv').fill(str(val)); m.locator('.mok').click()
    draw(0, 140, 'weight', 490); draw(0, -140, 'normal', 490); draw(-60, 0, 'pull', 130); draw(110, 0, 'pull', 260); draw(-25, 0, 'friction', 49)
    R('r8').locator('.fcheck').click(); pg.wait_for_timeout(300)
    # file name helper
    nm = lambda ch, mode: pg.evaluate("([c,m])=>__fhq.ev(`wsFileName('${c}','${m}')`)", [ch, mode])
    chk('name: Foundation example from the spec', nm('c3f', 'student') == 'Force HQ Ch3 Foundation (F = ma) - Alex Chen', nm('c3f', 'student'))
    chk('name: blank / key / scheme endings', [nm('c3f', m) for m in ['blank', 'key', 'scheme']] == ['Force HQ Ch3 Foundation (F = ma) - Blank template', 'Force HQ Ch3 Foundation (F = ma) - Answer key', 'Force HQ Ch3 Foundation (F = ma) - Marking scheme'])
    chk('name: Save my work', nm('c1f', 'progress') == 'Force HQ - My work so far - Alex Chen', nm('c1f', 'progress'))
    chk('name: bad characters stripped, spaces collapsed, 120 cap', pg.evaluate("__fhq.ev(`cleanFileName('a/b\\\\\\\\c:d*e?f\"g<h>i|j   k')`)") == 'abcdefghij k' and pg.evaluate("__fhq.ev(`cleanFileName('x'.repeat(300)).length`)") == 120)
    # print path: document.title is the file name while printing and is restored afterwards
    pg.evaluate("window.__printTitle = null; window.print = () => { window.__printTitle = document.title }; __fhq.openSheet('c1x','student')"); pg.wait_for_selector('#wsPrint')
    old = pg.evaluate('document.title'); pg.click('#wsPrint'); pt = pg.evaluate('window.__printTitle')
    chk('print: document.title equals the file name (without .pdf) during printing', pt == 'Force HQ Ch1 Extension (What is a force) - Alex Chen', pt)
    chk('print: the tip about Save as PDF is shown', pg.locator('#wsTip').is_visible())
    pg.wait_for_timeout(3300); chk('print: title restored after the fallback timeout', pg.evaluate('document.title') == old, pg.evaluate('document.title'))
    pg.evaluate("document.querySelector('#wsClose').click()")
    # the download
    r = download_check(pg, 'c1x', 'student', OUT + 'pdf/', 'c1x_student')
    chk('download c1x: file name', r['filename'] == 'Force HQ Ch1 Extension (What is a force) - Alex Chen.pdf', r['filename'])
    chk('download c1x: valid PDF, same page count as the print preview', r['pages'] >= 2 and r['pages'] == r['print_pages'], (r['pages'], r['print_pages']))
    chk('download c1x: text layer has the name and a typed answer', 'Alex Chen' in r['text'] and '110' in r['text'] and 'Friction acts against' in r['text'], r['text'][:200])
    chk('download c1x: the PDF title is the file name', 'Force HQ Ch1 Extension' in r['info'].split('Title:')[1].split('\n')[0], r['info'][:200])
    # teacher modes need no name, and a student with no name gets the gate message
    r2 = download_check(pg, 'c1x', 'blank', OUT + 'pdf/', 'c1x_blank'); chk('download blank: named Blank template, valid', r2['filename'].endswith('- Blank template.pdf') and r2['pages'] >= 2, r2['filename'])
    pg.evaluate("__fhq.ev(`DB.user.name=''`)"); pg.evaluate("__fhq.openSheet('c1x','student')"); pg.wait_for_selector('#wsDown'); pg.click('#wsDown'); pg.wait_for_timeout(300)
    chk('download with no name: No name, no worksheet!', 'No name, no worksheet' in pg.locator('#wsMsg').inner_text(), pg.locator('#wsMsg').inner_text())
    print('errors', errs); chk('no page errors', not errs, errs); b.close()
print('ALL PASSED' if not fails else 'FAILED: ' + ', '.join(fails))
