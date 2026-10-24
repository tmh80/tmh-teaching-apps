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
css = S('fonts.css') + '\n' + S('tokens.css') + '\n' + S('app.css')
head = '<title>Force HQ</title>\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
def page(hook=False, full=True):
    hookjs = ('window.__fhq={get S(){return S},LAB,CHDATA,FBDB,setStep:(i)=>setStep(i),openChapter,setCTab,forces,staticForces,dbGet,dbSet,resetDB:()=>{DB={};saveDB()},get DB(){return DB},addPuller,renderReview,openSheet,buildWorksheet,schemeHTML,schemeText,teacherPrompt,progressHTML,openExplore,checkStep,qMarks,CHAPTERS,get GI(){return GI},calcEval,WS_CSS,user,ev:c=>eval(c)};' if hook else '')
    script = '(()=>{' + js + '\n' + hookjs + '\n})();'
    body = f'<style>\n{css}\n</style>\n' + S('index.html') + f'\n<script>\n{script}\n</script>\n'
    if not full: return head.replace('<title>Force HQ</title>', '<title>Force HQ Rebuild</title>') + body
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' + head + '</head>\n<body>\n' + body + '</body>\n</html>\n'
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
open(os.path.join(ROOT, 'dist', 'Force-HQ-offline.html'), 'w', encoding='utf-8').write(page())
open(os.path.join(ROOT, 'dist', 'test.html'), 'w', encoding='utf-8').write(page(hook=True))
open(os.path.join(ROOT, 'dist', 'artifact.html'), 'w', encoding='utf-8').write(page(full=False))
print('built', len(page()) // 1024, 'KB')
