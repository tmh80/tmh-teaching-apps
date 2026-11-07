# Graph maker (model level): the five marks, the bar and scatter types, wrong choices, bar values, SVG with rings, and the worksheet prints.
# The on-screen taps, drags and the locked one-go are played in play_c2s.py.
import pathlib, json, sys
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); bad = []
def ok(c, m):
  print(('PASS ' if c else 'FAIL ') + m)
  if not c: bad.append(m)
with sync_playwright() as p:
  b = p.chromium.launch(); pg = b.new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto(f); pg.wait_for_timeout(400)
  ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
  j = lambda c: json.loads(ev("JSON.stringify(" + c + ")"))
  for nm, sp in (('scatter', 'c2sSpec()'), ('bar', 'FLOORS_BAR')):
    ok(j(f"gmEval({sp},gmModel({sp})).marks") == [True] * 5, f'{nm}: the model answer earns all five marks')
    ok(j(f"gmEval({sp}).marks") == [False] * 5, f'{nm}: a blank graph earns none')
    ok(j(f"(()=>{{const S=gmModel({sp});S.title='Graph';return gmEval({sp},S).marks}})()") [1] is False, f'{nm}: a title without the two quantities fails')
    ok(j(f"(()=>{{const S=gmModel({sp});S.xl='';S.yl='';return gmEval({sp},S).marks}})()")[2] is False, f'{nm}: missing axis labels fail')
    ok(j(f"(()=>{{const S=gmModel({sp});S.ymax=1;S.ystep=1;return gmEval({sp},S).marks}})()")[3] is False, f'{nm}: an axis too small for the data fails')
    ok(j(f"(()=>{{const S=gmModel({sp});S.type=gmIsScatter({sp})?'bar':'scatter';return gmEval({sp},S).marks}})()")[0] is False, f'{nm}: the wrong graph type fails')
    ok(j(f"(()=>{{const S=gmModel({sp});S.pts={{}};S.bars={{}};return gmEval({sp},S).marks}})()")[4] is False, f'{nm}: no points or bars fails the last mark')
    ok(ev(f"gmSVG({sp},gmModel({sp}),{{rings:true}})").count('gmring ok') >= 4, f'{nm}: every point or bar shows a green ring')
    ok(ev(f"gmSVG({sp},null,{{blank:true,print:true}})").startswith('<svg'), f'{nm}: a blank print graph draws')
  ok(ev("gmHowHTML(true)").count('<li>') >= 4 and 'open' in ev("gmHowHTML(true)"), 'How to make a good graph lists its tips and can start open')
  for m in ('student', 'blank', 'key'):
    h = ev(f"buildWorksheet('c2s','{m}')")
    ok(h.count('<svg') >= 2 and ('Graph type' in h or m != 'key'), f'worksheet {m}: graph questions print')
  ok(ev("buildWorksheet('c2s','key')").count('Look for') >= 1, 'answer key lists what to look for')
  print('errors', errs, bad); b.close()
sys.exit(1 if errs or bad else 0)
