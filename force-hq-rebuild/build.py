#!/usr/bin/env python3
"""Build Force HQ: concatenate src/ into one self-contained offline HTML file (+ a test build with a debug hook)."""
import os, glob, subprocess, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
S = lambda p: open(os.path.join(ROOT, 'src', p), encoding='utf-8').read()
js_files = sorted(glob.glob(os.path.join(ROOT, 'src', 'js', '*.js')))
# syntax-check each module on its own so errors point at the right file
for f in js_files:
    r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
    if r.returncode: print(r.stderr); sys.exit(1)
js = '\n'.join(open(f, encoding='utf-8').read() for f in js_files)
# vendored libraries (see vendor/): inlined, each in its own <script>, before the app. No CDN links: the file stays fully offline.
VENDOR = ['html2canvas.min.js', 'jspdf.umd.min.js']
def vendor_js(name):
    t = open(os.path.join(ROOT, 'vendor', name), encoding='utf-8').read()
    t = '\n'.join(l for l in t.split('\n') if not l.startswith('//# sourceMappingURL='))   # no source map: nothing to fetch offline
    if '</script' in t.lower(): print('vendor file would end the script block early:', name); sys.exit(1)
    return t
vendor_blocks = ''.join(f'<script>\n{vendor_js(n)}\n</script>\n' for n in VENDOR)
css = S('fonts.css') + '\n' + S('fonts-hand.css') + '\n' + S('tokens.css') + '\n' + S('app.css') + '\n' + S('flashcards.css') + '\n' + S('practice.css')
head = '<title>Force HQ</title>\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
def page(hook=False, full=True, workshop=False):
    hookjs = ('window.__fhq={get S(){return S},LAB,CHDATA,FBDB,setStep:(i)=>setStep(i),openChapter,setCTab,forces,staticForces,dbGet,dbSet,resetDB:()=>{DB={};saveDB()},get DB(){return DB},addPuller,renderReview,openSheet,buildWorksheet,schemeHTML,schemeText,teacherPrompt,progressHTML,openExplore,checkStep,qMarks,CHAPTERS,get GI(){return GI},calcEval,WS_CSS,user,fcRender,fcState:()=>FCV,FC_TOPICS,fcArt,FC_ART,fcStartGo,fcAnswer,ev:c=>eval(c)};' if hook else '')
    src = js.replace('const WORKSHOP_OPEN = false;', 'const WORKSHOP_OPEN = true;') if workshop else js   # test.html always has the Workshop open, so its tests keep working
    script = '(()=>{' + src + '\n' + hookjs + '\n})();'
    body = f'<style>\n{css}\n</style>\n' + S('index.html') + '\n' + vendor_blocks + f'<script>\n{script}\n</script>\n'
    if not full: return head.replace('<title>Force HQ</title>', '<title>Force HQ Rebuild</title>') + body
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' + head + '</head>\n<body>\n' + body + '</body>\n</html>\n'
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
open(os.path.join(ROOT, 'dist', 'Force-HQ-offline.html'), 'w', encoding='utf-8').write(page())
open(os.path.join(ROOT, 'dist', 'test.html'), 'w', encoding='utf-8').write(page(hook=True, workshop=True))
open(os.path.join(ROOT, 'dist', 'test-closed.html'), 'w', encoding='utf-8').write(page(hook=True))   # exactly what students get, plus the test hook
open(os.path.join(ROOT, 'dist', 'artifact.html'), 'w', encoding='utf-8').write(page(full=False))
print('built', len(page()) // 1024, 'KB')
