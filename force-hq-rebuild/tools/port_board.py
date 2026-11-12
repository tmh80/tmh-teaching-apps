#!/usr/bin/env python3
"""Generates src/js/4r-board5.js (Chapter 6 Part 5 rescue board) from proto/Rescue-Core-Board.html.
Run from force-hq-rebuild:  python3 tools/port_board.py
The prototype stays the place to test rules; this script wraps it as rescueBoardMount(host, opts) and swaps its sky,
Big Jelly, ground and Gumdrop for the Glimmer-9 art in 4g-glscene.js (that art is NOT changed)."""
import re, json
s = open('proto/Rescue-Core-Board.html').read()
css = s[s.index('<style>')+7:s.index('</style>')]
html = s[s.index('</style>')+8:s.index('<script>')]
js = s[s.index('<script>')+8:s.index('</script>')].replace("'use strict';", '', 1)

# ---- CSS: scope everything under .rb5, light theme only
css = re.sub(r'@media \(prefers-color-scheme: dark\)\{.*?\n', '', css)          # drop the dark-mode line
css = re.sub(r':root\[data-theme="dark"\]\{[^\n]*\n', '', css)
rules = []
for m in re.finditer(r'([^{}@]+)\{([^{}]*)\}', css):
    sel, body = m.group(1).strip(), m.group(2)
    if sel.startswith(':root'): sel = '.rb5'
    elif sel == 'body': sel = '.rb5'
    else: sel = ','.join('.rb5 ' + x.strip() for x in sel.split(','))
    rules.append(sel + '{' + body + '}')
css = '\n'.join(rules).replace('.rb5 .wrap', '.rb5 .rbwrap')

css += '\n.rb5in{width:100%;max-width:110px;padding:5px 8px;border:1.5px solid #d9d3ea;border-radius:8px;font:inherit}.rb5in.bad{border-color:#b3261e;background:#fdecea}.rb5msg{font-weight:650;margin-left:8px}.rb5strip .go{background:#6b3fd4;color:#fff;border-color:#6b3fd4}.rb5 select{font:inherit;margin:0 12px 0 6px}\n'

# ---- markup: drop the page title and intro (Force HQ writes its own), rename .wrap
html = re.sub(r'\s*<h1>.*?</h1>\s*<p class="sub">.*?</p>', '', html, flags=re.S).replace('class="wrap"', 'class="rbwrap"')

# ---- script
js = js.replace('document.getElementById(', '$r(')
for ev in ('pointermove', 'pointerup', 'keydown'):
    js, n = re.subn(r"window\.addEventListener\('%s', e => \{" % ev, "window.addEventListener('%s', e => { if (!root.isConnected) return;" % ev, js)
    assert n == 1, ev
assert 'document.createElement' in js
# art: sky, Big Jelly, ground come from 4g-glscene.js
a = js.index('function drawSky(t) {'); b = js.index('const slopeAng')
newart = r'''function syncGLV() { GLV.z = V.z; GLV.cx = V.cx; GLV.cy = V.cy; GLV.LW = V.LW; GLV.LH = V.LH; GLV.K = V.K; }
let GCACHE = null, GKEY = '';
function groundArr() { const k = parts.map(p => p.type === 'dynamite' ? p.id + ':' + p.x + ':' + p.size + ':' + !!p.fired : '').join('|'); if (GCACHE && k === GKEY) return GCACHE; GKEY = k; GCACHE = []; for (let x = 0; x <= 100; x++) GCACHE.push(ground(x)); return GCACHE; }
function drawSky(t) {
  syncGLV(); c.fillStyle = GLC.sky0; c.fillRect(0, 0, V.LW, V.LH); glDrawSky(c, t); glDrawBigJelly(c, t, EV && EV.won && !!run && run.pos.y >= GOAL - 0.2);
  c.setLineDash([6, 6]); c.strokeStyle = 'rgba(160,255,214,.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx(76), sy(GOAL + 5)); c.lineTo(sx(100), sy(GOAL + 5)); c.stroke(); c.setLineDash([]);
}
function drawGround() {
  syncGLV(); glDrawGround(c, groundArr(), null);
  const ch = Math.round(ground(46.2) - ground(45.8) + 0.1); if (!parts.some(d => d.type === 'dynamite' && d.fired)) { c.fillStyle = 'rgba(70,51,137,.35)'; c.fillRect(sx(46), sy(10), 0.9 * U(), 6 * U()); }
  if (ch > 0) tag('Cliff, ' + ch + ' m', sx(48.5), sy(ground(45.8) + ch / 2 + 0.3), '#fff', 'rgba(18,12,46,.6)', 11); tag('The beam reaches this line', sx(88), sy(GOAL + 6.2), '#c9ffdc');
}
'''
js = js[:a] + newart + js[b:]
# Gumdrop body: the Glimmer-9 ship (the cart, if any, is still drawn by cartBody)
g0 = js.index('function drawGumdrop(x, y, a, cart, n, skipBody) {'); g1 = js.index('function hookDot')
newship = r'''function drawGumdrop(x, y, a, cart, n, skipBody) {
  syncGLV(); c.save(); c.globalAlpha = a; const tl = cart ? -slopeAng(x, cart.w || 6) : 0, lift = cart ? 0.7 : 0.45;
  glDrawShip(c, { x, y: y + lift, tilt: tl, mood: 'worried', dmg: 0 }); c.restore();
  if (cart && !skipBody) cartBody(x, y, cart.w || 6, a);
  if (n) qtag(n, sx(x), a < 1 ? sy(y) + 16 : sy(y + 6.2), '#ffe7b8');
}
'''
js = js[:g0] + newship + js[g1:]
# training mode comes from the mount options, and the rock uses the Glimmer-9 boulder art
a = "const TRAIN = /[?&]train\\b/.test(location.search);"; assert js.count(a) == 1, js.count(a)
js = js.replace(a, "const TRAIN = !!opts.train;")
r0 = js.index('function drawRock(x, y, a) {'); r1 = js.index('function drawLoad')
js = js[:r0] + "function drawRock(x, y, a) { syncGLV(); c.save(); c.globalAlpha = a; glDrawBoulder(c, x, y + 0.3, 0, false); c.restore(); }\n" + js[r1:]
# hooks for Force HQ: save the pieces, report the end of a run
js = js.replace("let parts = [], sel = null, hist = [], nid = 1, EV = null, run = null, drag = null;",
  "let parts = (opts.parts || []).map(p => Object.assign({}, p)), sel = null, hist = [], nid = 1 + parts.reduce((m, p) => Math.max(m, parseInt(String(p.id).replace(/\\D/g, ''), 10) || 0), 0), EV = null, run = null, drag = null, saveT = 0;\n  const changed = () => { clearTimeout(saveT); saveT = setTimeout(() => { if (opts.onChange) opts.onChange(JSON.parse(JSON.stringify(parts)), EV); }, 350); };", 1)
assert 'saveT = 0' in js
js = js.replace("run.saved.forEach(([q, x]) => { q.x = x; }); run = null; layout(); paint(); }",
  "run.saved.forEach(([q, x]) => { q.x = x; }); run = null; layout(); paint(); if (opts.onRunEnd) opts.onRunEnd(EV, JSON.parse(JSON.stringify(parts))); }", 1)
assert 'opts.onRunEnd' in js
js = js.replace("function refresh(full) { followCarts(); layout(); EV = evaluate();", "function refresh(full) { followCarts(); layout(); EV = evaluate(); changed();", 1)
assert 'changed();' in js
js = js.replace("function draw(now) {", "function draw(now) {\n  if (!root.isConnected) return;", 1)
assert 'root.isConnected) return;\n' in js

# camera follows the Gumdrop during a run, then returns to where the student was working
js = js.replace("function draw(now) {\n  if (!root.isConnected) return;", "function draw(now) {\n  if (!root.isConnected) return;\n  if (run) { if (!run.view0) run.view0 = { z: V.z, cx: V.cx, cy: V.cy }; V.z += (Math.max(V.z, 1.8) - V.z) * 0.1; V.cx += (run.pos.x - V.cx) * 0.06; V.cy += (run.pos.y + 3 - V.cy) * 0.06; }", 1)
assert 'run.view0' in js
js = js.replace("run.saved.forEach(([q, x]) => { q.x = x; }); run = null; layout(); paint();", "run.saved.forEach(([q, x]) => { q.x = x; }); if (run.view0) Object.assign(V, run.view0); run = null; layout(); paint();", 1)
assert 'Object.assign(V, run.view0)' in js

# ---- hooks for the route strip / GASA gate, and the opening pan
js = js.replace("function startRun() { if (run) return; sel = null;", "function startRun() { if (run) return; if (opts.canRun) { const msg = opts.canRun(EV); if (msg !== true) { say(msg); return; } } sel = null;", 1)
assert 'opts.canRun' in js
hp = "Smooshy pulls ${f1(l.pull)} N."
assert js.count(hp) >= 2, js.count(hp)
js = js.replace(hp, "${opts.hidePull && opts.hidePull() ? 'It moves.' : 'Smooshy pulls ' + f1(l.pull) + ' N.'}")
js = js.replace("`Moves. ${opts.hidePull && opts.hidePull() ? 'It moves.' :", "`Moves. ${opts.hidePull && opts.hidePull() ? '' :")
assert "? '' : 'Smooshy pulls '" in js
js = js.replace("run.cap = `Leg ${l.n}: ${NAMES[l.m.type]}. ${opts.hidePull", "run.cap = `Leg ${l.n}: ${NAMES[l.m.type]}. ${opts.hidePull")
js = js.replace("document.getElementById('run').disabled = !!run; }", "document.getElementById('run').disabled = !!run; }", 1)
js = js.replace("$r('run').disabled = !!run; }", "$r('run').disabled = !!run; if (opts.onPaint) opts.onPaint(EV, parts); }", 1)
assert 'opts.onPaint' in js
# the total MA and the force it gives are the student's sums: show only the machines' own numbers until GASA approves
a = "<td>60 N × ${maText(l.m)} = ${f0(l.gives)} N</td>"; assert js.count(a) == 1
js = js.replace(a, "<td>${opts.hidePull && opts.hidePull() ? '60 N × ' + maText(l.m) : '60 N × ' + maText(l.m) + ' = ' + f0(l.gives) + ' N'}</td>")
a = "h += `<p>Total MA on this leg: ${maText(mm)} = <b>${f0(totalMA(mm))}</b>, so Smooshy's machines give 60 × ${f0(totalMA(mm))} = <b>${f0(PULL * totalMA(mm))} N</b>.</p>`"; assert js.count(a) == 1
js = js.replace(a, "h += (opts.hidePull && opts.hidePull() ? `<p>Machines on this leg: <b>${maText(mm)}</b>. Multiply them to find the total MA.</p>` : `<p>Total MA on this leg: ${maText(mm)} = <b>${f0(totalMA(mm))}</b>, so Smooshy's machines give 60 × ${f0(totalMA(mm))} = <b>${f0(PULL * totalMA(mm))} N</b>.</p>`)")
# opening pan: from the Big Jelly, down to the Gumdrop
js = js.replace("function draw(now) {\n  if (!root.isConnected) return;", "let intro = opts.intro ? { t0: 0 } : null;\n  function draw(now) {\n  if (!root.isConnected) return;\n  if (intro) { if (!intro.t0) intro.t0 = now; const k = Math.min(1, (now - intro.t0) / 3600), e = k * k * (3 - 2 * k); V.z = 1 + 0.9 * e; V.cx = 62 + (27 - 62) * e; V.cy = 17 + (8 - 17) * e; if (k >= 1) { intro = null; if (opts.onIntroEnd) opts.onIntroEnd(); } }", 1)
assert 'let intro' in js
# camera: the board starts over the Gumdrop
out = ("/* GENERATED by tools/port_board.py from proto/Rescue-Core-Board.html. Edit the prototype, then run the script. Do not edit by hand.\n"
 "   Chapter 6 Part 5 rescue board: rescueBoardMount(host, { parts, onChange(parts, ev), onRunEnd(ev, parts) }) -> { board } */\n"
 "const RB5_CSS = " + json.dumps(css) + ";\nconst RB5_HTML = " + json.dumps(html) + ";\n"
 "function rb5Css() { if (!document.getElementById('rb5css')) { const st = document.createElement('style'); st.id = 'rb5css'; st.textContent = RB5_CSS; document.head.appendChild(st); } }\n"
 "function rescueBoardMount(host, opts) {\n  opts = opts || {};\n  rb5Css();\n"
 "  host.innerHTML = '<div class=\"rb5\">' + RB5_HTML + '</div>'; const root = host.querySelector('.rb5'), $r = id => root.querySelector('#' + id);\n"
 + js + "\n  return { board: window.__board, repaint: () => paint() };\n}\n")
open('src/js/4r-board5.js', 'w').write(out)
print('ok', len(out))
