"""Contact sheet and checks for flashcard pictures.
Usage (from force-hq-rebuild/):  python3 tests/fcart_check.py [--file src/js/64a-fcart-c1-3.js] [--out art_b] [--keys a,b,c]
Builds the app, renders each picture with fcArt(key) onto a contact sheet (6 per row, 240x150 and 2x), saves
/tmp/fhq-shots/fc/<out>.png and <out>_2x.png, and checks: no console errors, alt/s/t present, drawn content inside the 240x150 box."""
import argparse, pathlib, re, subprocess, sys, json
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('--file', default='src/js/64a-fcart-c1-3.js'); ap.add_argument('--out', default='art_b'); ap.add_argument('--keys', default='')
a = ap.parse_args()
ROOT = pathlib.Path(__file__).resolve().parent.parent
subprocess.run([sys.executable, 'build.py'], cwd=ROOT, check=True, capture_output=True)
keys = [k for k in a.keys.split(',') if k] or re.findall(r"fcB_set\('(\w+)'|FC_ART\.(\w+)\s*=|FC_ART\['(\w+)'\]\s*=", (ROOT / a.file).read_text())
keys = [next(x for x in k if x) if isinstance(k, tuple) else k for k in keys]
css = (ROOT / 'src/fonts-hand.css').read_text(); OUT = pathlib.Path('/tmp/fhq-shots/fc'); OUT.mkdir(parents=True, exist_ok=True)
fails = []
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 1500, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto((ROOT / 'dist/test.html').as_uri()); pg.wait_for_timeout(500)
    data = pg.evaluate("ks=>__fhq.ev(`JSON.stringify(${JSON.stringify(ks)}.map(k=>[k,fcArt(k),FC_ART[k]?{alt:!!FC_ART[k].alt,s:!!FC_ART[k].s,t:!!FC_ART[k].t}:null]))`)", keys)
    data = json.loads(data)
    for k, svg, m in data:
        if not m or not (m['alt'] and m['s'] and m['t']) or not svg: fails.append(f'{k}: missing alt/s/t ({m})')
    def sheet(scale, name):
        cells = ''.join(f'<div class="c"><div class="k">{k}</div><div style="width:{240*scale}px;height:{150*scale}px">{svg.replace("<svg ", f"<svg width=\"{240*scale}\" height=\"{150*scale}\" ")}</div></div>' for k, svg, m in data)
        html = f'<html><style>{css}body{{margin:8px;background:#e9dcc4;font:12px sans-serif}}.g{{display:grid;grid-template-columns:repeat(6,{240*scale+14}px);gap:10px}}.c{{background:#fffdf6;padding:6px;box-shadow:0 1px 3px #0005}}.c>div:last-child{{outline:1px dashed #ccc}}.k{{color:#999}}</style><div class="g">{cells}</div></html>'
        q = b.new_page(viewport={'width': int(6 * (240 * scale + 24) + 24), 'height': 600}); q.set_content(html); q.evaluate('document.fonts.ready'); q.wait_for_timeout(500)
        if scale == 1:
            res = q.evaluate("""()=>[...document.querySelectorAll('svg')].map(s=>{const g=s.children[2],t=s.children[1].nextElementSibling,gs=s.querySelector('g[filter]'),tx=s.querySelector('g:not([filter])');
              const sr=s.getBoundingClientRect();const bb=e=>{const r=e.getBBox();return [r.x,r.y,r.x+r.width,r.y+r.height]};const tb=[...tx.querySelectorAll('text')].map(x=>{const r=x.getBoundingClientRect();return [r.left-sr.left,r.top-sr.top,r.right-sr.left,r.bottom-sr.top]});const u=tb.length?[Math.min(...tb.map(r=>r[0])),Math.min(...tb.map(r=>r[1])),Math.max(...tb.map(r=>r[2])),Math.max(...tb.map(r=>r[3]))]:[0,0,0,0];return [bb(gs),u,[...tx.querySelectorAll('text')].map(x=>+x.getAttribute('font-size')).filter(z=>z<13).length]})""")
            for (k, _, _), (sb, tb, small) in zip(data, res):
                for nm, bx, lim in (('shapes', sb, 3), ('labels', tb, 0)):
                    if bx[2] > bx[0] and (bx[0] < lim or bx[1] < lim or bx[2] > 240 - lim or bx[3] > 150 - lim): fails.append(f'{k}: {nm} outside box {[round(v) for v in bx]}')
                if small: fails.append(f'{k}: label font under 13')
        q.screenshot(path=str(OUT / name), full_page=True); q.close()
    sheet(1, a.out + '.png'); sheet(2, a.out + '_2x.png')
    if errs: fails.append('console errors: ' + '; '.join(errs[:5]))
    b.close()
print(len(keys), 'keys;', OUT / (a.out + '.png'))
if fails: print('\n'.join(fails)); sys.exit(1)
print('OK')
