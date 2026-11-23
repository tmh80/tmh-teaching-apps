"""Play-through test for Acceleration Lab. Run: python3 tests/play.py  (after node build.js)
Saves screenshots and PDFs to tests/out/."""
import os, sys, pathlib
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent
URL = (HERE.parent / 'dist' / 'test.html').as_uri()
OUT = HERE / 'out'; OUT.mkdir(exist_ok=True)
errs, net = [], []
TIMES = {1: ['1.40', '1.45', '1.39'], 2: ['2.01', '1.98', '2.02'], 3: ['2.55', '2.52', '2.57'], 4: ['3.24', '3.20', '3.25']}

def run(grade, w=1280, h=900):
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': w, 'height': h}, accept_downloads=True)
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('request', lambda r: not r.url.startswith(('file:', 'data:', 'blob:')) and net.append(r.url))
        pg.goto(URL)
        # name gate: Escape and clicking outside keep it open; no name refused
        pg.keyboard.press('Escape'); assert pg.locator('#gate').count() == 1
        pg.mouse.click(5, 5); assert pg.locator('#gate').count() == 1
        pg.click('#gok'); assert 'name' in pg.inner_text('#gerr')
        pg.fill('#gn', 'Test Student'); pg.fill('#gc', '7B')
        pg.click('#gok'); assert 'grade' in pg.inner_text('#gerr')
        pg.click(f'[data-g="{grade}"]'); pg.click('#gok')
        assert pg.locator('#gate').count() == 0
        tag = f'g{grade}_{w}'
        # step 1 predict
        pg.click('[data-act=pred][data-k=ramp][data-v=up]'); pg.click('[data-act=pred][data-k=flat][data-v=same]')
        pg.screenshot(path=str(OUT / f'{tag}_1predict.png'), full_page=True)
        pg.click('#nextbtn')
        for k, ts in TIMES.items():
            for i, t in enumerate(ts):
                pg.fill(f'[data-bind="T.{k}.{i}"]', t)
        assert pg.inner_text('#av4').strip() == '3.23', pg.inner_text('#av4')
        pg.screenshot(path=str(OUT / f'{tag}_2times.png'), full_page=True)
        pg.click('#nextbtn')
        # step 3: the student's maths, using averages 1.41, 2.00, 2.55, 3.23
        legs = {1: '1.41', 2: '0.59', 3: '0.55', 4: '0.68'}
        for k, v in legs.items(): pg.fill(f'#leg{k}', v)
        spd = {1: '0.71', 2: '1.69', 3: '1.82', 4: '1.47'}
        for k, v in spd.items(): pg.fill(f'#spd{k}', v)
        chg = {1: '0.71', 2: '0.98', 3: '0.13', 4: '-0.5'}  # metre 4 deliberately wrong (should be -0.35)
        for k, v in chg.items(): pg.fill(f'#chg{k}', v)
        pg.click('[data-act=chk2]')
        pg.click('#spd3')  # light up its sources
        assert pg.locator('[data-live="mk:chg:4"] .mk.no').count() == 1
        assert pg.locator('[data-live="mk:leg:2"] .mk.ok').count() == 1
        pg.click('[data-help=spd]'); assert pg.locator('#pophelp').count() == 1
        hd = pg.locator('#pophelp .hd').bounding_box(); pg.mouse.move(hd['x'] + 30, hd['y'] + 10); pg.mouse.down(); pg.mouse.move(200, 300, steps=5); pg.mouse.up()
        assert abs(pg.locator('#pophelp').bounding_box()['y'] - 290) < 30
        pg.screenshot(path=str(OUT / f'{tag}_3metres.png'), full_page=True)
        pg.click('#pophelp .x')
        pg.fill('#chg4', '-0.35')
        # calculator puts its answer in the last box used
        pg.click('#spd4'); pg.click('[data-act=calc]')
        for k in ['1', '÷', '0', '.', '6', '8', '=']: pg.click(f'#popcalc [data-ck="{k}"]')
        assert pg.inner_text('#calcd').startswith('1.47'), pg.inner_text('#calcd')
        pg.click('#calcput'); assert pg.input_value('#spd4') == '1.47'
        pg.click('#popcalc .x')
        T = lambda: pg.evaluate('MS.map(k=>accel(k))')
        a = T(); print('accelerations', [round(x, 3) for x in a])
        assert a[0] > 0 and a[1] > 0 and a[3] < 0
        pg.click('#nextbtn')
        # graph: title, labels, negative axis, drag each bar
        pg.fill('[data-bind="g.title"]', 'Part of the track vs acceleration'); pg.fill('[data-bind="g.xl"]', 'Part of the track'); pg.fill('[data-bind="g.yl"]', 'Acceleration (m/s²)')
        if grade == '6':
            pg.click('[data-act=gsuggest]')
        else:
            for k, v in (('ymin', '-1'), ('ymax', '2'), ('ystep', '0.5')):
                pg.fill(f'[data-bind="g.{k}"]', v); pg.press(f'[data-bind="g.{k}"]', 'Tab')
        g = pg.evaluate('S.g'); assert float(str(g['ymin']).replace('−', '-')) < 0, g
        pg.locator('#gcv').scroll_into_view_if_needed(); box = pg.locator('#gcv').bounding_box()
        for i, val in enumerate(a):
            m = pg.evaluate(f'(()=>{{const m=gMap(S.g);return [m.slotX({i}),m.py(m.zero),m.py({val})]}})()')
            sx = box['width'] / 1000; sy = box['height'] / 560
            pg.mouse.move(box['x'] + m[0] * sx, box['y'] + m[1] * sy); pg.mouse.down()
            pg.mouse.move(box['x'] + m[0] * sx, box['y'] + m[2] * sy, steps=6); pg.mouse.up()
        pg.click('[data-act=gcheck]')
        e = pg.evaluate('graphEval()'); print('graph', e); assert e['placed'] == 4 and e['acc'] == 4 and e['fits']
        pg.screenshot(path=str(OUT / f'{tag}_4accel.png'), full_page=True)
        pg.click('#nextbtn')
        # forces
        if grade != '6':
            for s, arrows in (('ramp', [('weight', 90, 150), ('normal', -70+0, 130), ('friction', 200, 50)]), ('flat', [('weight', 90, 130), ('normal', -90, 130), ('forward', 0, 80)])):
                pg.locator(f'#fbd-{s} .board').scroll_into_view_if_needed(); bd = pg.locator(f'#fbd-{s} .board').bounding_box(); k = bd['width'] / 520
                cx, cy = bd['x'] + 260 * k, bd['y'] + 200 * k
                import math
                for t, ang, ln in arrows:
                    pg.mouse.move(cx, cy); pg.mouse.down()
                    pg.mouse.move(cx + math.cos(math.radians(ang)) * ln * k, cy + math.sin(math.radians(ang)) * ln * k, steps=6); pg.mouse.up()
                    pg.click(f'#fbd-{s} .amenu [data-t={t}]')
                pg.click(f'#fbd-{s} .fchk')
                print(s, pg.inner_text(f'#fbd-{s} .ffb'))
            assert 'forward force' in pg.inner_text('#fbd-flat .ffb').lower()
            assert 'great' in pg.inner_text('#fbd-ramp .ffb').lower(), pg.inner_text('#fbd-ramp .ffb')
        for s in ('ramp', 'flat'):
            ans = {'bal': 'unb', 'res': 'fwd' if s == 'ramp' else 'back', 'acc': 'pos' if s == 'ramp' else 'neg'}
            pg.click(f'[data-act=fq][data-k="{s}.bal"][data-v=bal]')
            assert pg.locator(f'[data-act=fq][data-k="{s}.bal"].wrong').count() == 1
            for q, v in ans.items(): pg.click(f'[data-act=fq][data-k="{s}.{q}"][data-v={v}]')
        pg.screenshot(path=str(OUT / f'{tag}_5forces.png'), full_page=True)
        pg.click('#nextbtn')
        if grade == '6':
            for k, v in (('f1', 'speeding up'), ('f2', 'positive'), ('f3', 'getting slower'), ('f4', 'minus'), ('f5', 'Friction')): pg.fill(f'[data-bind="con.{k}"]', v)
            pg.fill('[data-bind="con.pred"]', 'I was partly right because it slowed down on the flat.')
            pg.click('[data-act=chkcon]'); assert pg.locator('.mk.no').count() == 0
        else:
            for k in ('claim', 'evid', 'reason', 'mix', 'pred'):
                pg.fill(f'[data-bind="con.{k}"]', 'On the ramp acceleration was positive (0.99 m/s²) and on the flat negative (−0.57 m/s²) because friction is an unbalanced resultant force.')
        pg.screenshot(path=str(OUT / f'{tag}_6conclusion.png'), full_page=True)
        st = pg.evaluate('STEPS.map((s,i)=>stepStatus(i))'); print('status', st)
        with pg.expect_download() as dl:
            pg.click('#main [data-act=pdf]')
        if pg.locator('#saveany').count(): pass
        d = dl.value; d.save_as(str(OUT / f'{tag}_worksheet.pdf'))
        # memory: reload keeps everything
        pg.reload(); assert pg.locator('#gate').count() == 0
        pg.click('[data-go="2"]'); assert pg.input_value('#leg3') == '0.55'
        # blank paper worksheet rendered for the teacher
        pg.evaluate('buildSheet(true)'); pg.wait_for_timeout(600)
        pg.emulate_media(media='print'); pg.pdf(path=str(OUT / 'blank_worksheet.pdf'), format='A4', print_background=True); pg.emulate_media(media='screen')
        b.close()

for gr, w in (('6', 1280), ('8', 1280), ('8', 390)):
    try:
        run(gr, w, 844 if w < 500 else 900)
    except Exception as ex:
        print('FAIL', gr, w, ex); import traceback; traceback.print_exc()
print('errors', errs[:8]); print('network', net[:5])
