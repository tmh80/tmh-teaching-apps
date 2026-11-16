# Flashcard art check for Agent C's 37 pictures (chapters 4-6): builds, renders every picture, checks the basics, draws a contact sheet.
# Run from force-hq-rebuild/:  python3 tests/fcart_check_c.py
# Output: /tmp/fhq-shots/fc/art_c.png (6 per row at 240 x 150, retina) and /tmp/fhq-shots/fc/art_c_2x.png (3 per row at 480 x 300)
import os, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
os.chdir(ROOT)
KEYS = ('newton3 forcepair action reaction thrust thruster terminal parachute canopy drag gfs vacuum lift hover machine lever fulcrum effort load '
        'effortarm loadarm pulley supporting wheelaxle winch incline wedge screw pitch mechadv work joule compound simplemach efficiency wasted lubricant').split()
assert len(KEYS) == 37 and len(set(KEYS)) == 37
OUT = pathlib.Path('/tmp/fhq-shots/fc'); OUT.mkdir(parents=True, exist_ok=True)

subprocess.run([sys.executable, 'build.py'], check=True, stdout=subprocess.DEVNULL)
fonts = (ROOT / 'src' / 'fonts-hand.css').read_text()

def sheet(svgs, per_row, width):
    cells = ''.join(f'<div class="c"><div class="k">{k}</div>{svgs[k]}</div>' for k in KEYS)
    return f'''<!doctype html><meta charset="utf-8"><style>{fonts}
body{{margin:0;padding:10px;background:#e9dcc4;font-family:sans-serif}}
.g{{display:grid;grid-template-columns:repeat({per_row},{width}px);gap:10px}}
.c{{background:#fffdf6;border-radius:5px;box-shadow:0 1px 3px #0005;padding:0;position:relative}}
.k{{position:absolute;right:3px;top:1px;font:10px sans-serif;color:#aaa}}
svg{{display:block;width:{width}px;height:{width * 150 // 240}px;background:repeating-linear-gradient(transparent 0 {width * 24 // 240 - 1}px,#a9c8ea66 {width * 24 // 240 - 1}px {width * 24 // 240}px)}}
</style><div class="g">{cells}</div>'''

problems = []
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 1440, 'height': 900})
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
    pg.goto((ROOT / 'dist' / 'test.html').as_uri()); pg.wait_for_timeout(400)
    pg.fill('#whoName', 'Mia'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    svgs = {}
    for k in KEYS:
        art = ev(f"FC_ART[{k!r}] ? {{alt: FC_ART[{k!r}].alt||'', s: (FC_ART[{k!r}].s||'').length, t: (FC_ART[{k!r}].t||'').length}} : null")
        if not art: problems.append(f'{k}: missing from FC_ART'); continue
        if len(art['alt']) < 20: problems.append(f'{k}: alt is missing or too short')
        if not art['s']: problems.append(f'{k}: no shapes (s)')
        if not art['t']: problems.append(f'{k}: no labels (t)')
        svgs[k] = ev(f"fcArt({k!r})")
        if not svgs[k]: problems.append(f'{k}: fcArt returned nothing')
    KEYS = [k for k in KEYS if k in svgs]
    # contact sheets
    page = b.new_page(viewport={'width': 1560, 'height': 900}, device_scale_factor=2)
    page.set_content(sheet(svgs, 6, 240)); page.wait_for_timeout(500)
    # bounding boxes: every svg has two top-level groups (shapes, labels); both must sit inside 0..240 x 0..150
    boxes = page.evaluate('''() => [...document.querySelectorAll('svg')].map(svg => {
        const gs = [...svg.children].filter(n => n.tagName === 'g');
        const bb = g => { try { const b = g.getBBox(); return b.width || b.height ? [b.x, b.y, b.x + b.width, b.y + b.height] : null; } catch (e) { return null; } };
        const small = [...svg.querySelectorAll('text')].filter(t => parseFloat(t.getAttribute('font-size')) < 13).map(t => t.textContent);
        return { shapes: bb(gs[0]), labels: gs[1] ? bb(gs[1]) : null, small };
    })''')
    for k, bx in zip(KEYS, boxes):
        for name in ('shapes', 'labels'):
            r = bx[name]
            if r is None: problems.append(f'{k}: {name} group is empty'); continue
            x0, y0, x1, y1 = r
            if x0 < 0 or y0 < 0 or x1 > 240 or y1 > 150: problems.append(f'{k}: {name} outside the card box ({x0:.0f},{y0:.0f})-({x1:.0f},{y1:.0f})')
            elif x0 < 4 or y0 < 4 or x1 > 236 or y1 > 146: print(f'note: {k} {name} is within 4 px of the edge ({x0:.0f},{y0:.0f})-({x1:.0f},{y1:.0f})')
        if bx['small']: problems.append(f'{k}: labels smaller than 13 px: {bx["small"]}')
    fonts_ok = page.evaluate("document.fonts.check(\"15px 'FC Hand'\")")
    if not fonts_ok: problems.append("font 'FC Hand' did not load in the contact sheet")
    page.screenshot(path=str(OUT / 'art_c.png'), full_page=True)
    page2 = b.new_page(viewport={'width': 1500, 'height': 900}, device_scale_factor=1)
    page2.set_content(sheet(svgs, 3, 480)); page2.wait_for_timeout(500)
    page2.screenshot(path=str(OUT / 'art_c_2x.png'), full_page=True)
    # a few single big renders are handy for close-up review: /tmp/fhq-shots/fc/c_<key>.png
    if os.environ.get('FC_SINGLES'):
        for k in KEYS:
            one = b.new_page(viewport={'width': 720, 'height': 460}); one.set_content(f'<style>{fonts}body{{margin:0;background:#fffdf6}}svg{{width:720px;height:450px}}</style>{svgs[k]}'); one.wait_for_timeout(200)
            one.screenshot(path=str(OUT / f'c_{k}.png')); one.close()
    if errs: problems += errs
    b.close()

print(f'{len(KEYS)} pictures drawn; contact sheets: {OUT}/art_c.png and {OUT}/art_c_2x.png')
if problems:
    print('PROBLEMS:'); [print(' -', x) for x in problems]; sys.exit(1)
print('OK: every key has alt, shapes and labels; all drawn content is inside 240 x 150; labels are 13 px or bigger; no console errors.')
