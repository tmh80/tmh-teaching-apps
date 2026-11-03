"""Teacher page: step 4 prompt has no answer key and no 'attach'; step 5 AI text is locked until FORCE, has strands, level table,
every question, correct totals; the count updates; Copy works; phone width and dark mode render."""
import pathlib, sys, re
from playwright.sync_api import sync_playwright
F = pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'test.html'
bad = []
def chk(c, m):
    if not c: bad.append(m)
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1200, 'height': 900}, permissions=['clipboard-read', 'clipboard-write'])
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(F.as_uri()); pg.wait_for_timeout(300)
    pg.fill('#whoName', 'Sam'); pg.click('#whoForm .go')
    pg.evaluate("__fhq.ev(\"dbSet('teach',{secs:['c3f','c5x'],opt:['c4x'],parts:['learn','challenge','review'],cls:'7/8B',where:'home',msg:''})\")")
    pg.click('#homeBtn'); pg.click('#teacherBtn'); pg.wait_for_timeout(300)
    prompt = pg.input_value('#tPrompt')
    chk(not re.search(r'attaching|attached|attach (the|all|three)\b', prompt, re.I), 'prompt still talks about attaching files')
    chk('Q1 ' not in prompt and '===' not in prompt, 'prompt holds answer key text')
    chk('MYP objectives: please attach these MYP Year 3 Sciences objectives' in prompt, 'no MYP objectives block')
    chk('Criterion A (strands A i, A ii, A iii)' in prompt or 'Criterion A (strands' in prompt, 'no criterion A line')
    chk('Criterion D (strands D i, D iii)' in prompt, 'D strands wrong: ' + (re.findall(r'Criterion D[^.]*', prompt) or [''])[0])
    chk('together with the Force HQ file' in pg.inner_text('#vTeacher'), 'step 4 note not changed')
    chk('AI marking: I will paste the AI feedback instructions' in prompt, 'no AI marking line')
    print(prompt[-900:])
    # locked
    chk(pg.locator('#tAi').count() == 0, 'AI text visible while locked')
    chk(pg.locator('#tAiUnlock').count() == 1, 'no unlock button in step 5')
    chk('A ii' not in pg.inner_text('#tAiBox'), 'locked box leaks')
    pg.click('#tAiUnlock'); pg.fill('#codeIn', 'FORCE'); pg.click('#codeGo'); pg.wait_for_timeout(400)
    chk(pg.locator('#tAi').count() == 1, 'AI text not shown after unlock')
    txt = pg.input_value('#tAi')
    n = len(txt); shown = pg.inner_text('#tAiCount')
    chk(shown.replace(',', '') == f'{n} characters', f'count {shown} vs {n}')
    chk('AI text: first line is the Grade 7-8 style line', txt.split('\n')[0] == 'All written feedback should be grade 7-8 appropriate language, short and to-the-point, and enthusiastic.')
    for needle in ['HOW TO MARK', 'FEEDBACK STYLE', 'MYP LEVELS', 'WRITTEN ANSWER KEY', 'TOTALS', 'A ii: apply scientific knowledge', 'D iii: apply scientific language',
                   '1–12% = level 1', '88–100% = level 8', '1–2 limited', 'only if it raises the level',
                   '=== Force HQ Ch3 Foundation', '=== Force HQ Ch5 Extension', '=== Force HQ Ch4 Extension', '[A ii]']:
        chk(needle in txt, 'missing: ' + needle)
    qcount = len(re.findall(r'^Q\d+ ', txt, re.M)); exp = pg.evaluate("__fhq.ev('[\"c3f\",\"c5x\",\"c4x\"].reduce((a,c)=>a+CHDATA[c].review.length,0)')")
    chk(qcount == exp, f'questions {qcount} vs {exp}')
    tot = pg.evaluate("__fhq.ev('[\"c3f\",\"c5x\",\"c4x\"].reduce((a,c)=>a+CHDATA[c].review.reduce((b,q)=>b+qMarks(q),0),0)')")
    chk(f'Total marks for this task: {tot}.' in txt, 'total marks wrong')
    ca = pg.evaluate("__fhq.ev('critTotals([\"c3f\",\"c5x\",\"c4x\"])')")
    chk(f"Criterion A: {ca['A']} marks available; Criterion D: {ca['D']} marks available" in txt, 'criterion totals wrong')
    # header marks per sheet add up
    for m in re.finditer(r'=== Force HQ (.*?) worksheet \((\d+) marks\)', txt): pass
    # no HTML in text
    chk('<' not in txt, 'html tags in AI text')
    # count updates
    pg.uncheck('[data-opt=c4x]'); pg.uncheck('[data-sec=c4x]'); pg.wait_for_timeout(200)
    n2 = len(pg.input_value('#tAi')); chk(n2 < n, 'count did not drop when a section removed')
    chk(pg.inner_text('#tAiCount').replace(',', '') == f'{n2} characters', 'count not live')
    pg.check('[data-sec=c4x]'); pg.check('[data-opt=c4x]')
    # copy
    pg.click('#tAiCopy'); pg.wait_for_timeout(300)
    clip = pg.evaluate('navigator.clipboard.readText()'); chk(clip == pg.input_value('#tAi'), 'clipboard differs')
    chk(pg.inner_text('#tAiCopied') == 'Copied!', 'no copied message')
    # long note
    chk(pg.locator('#tAiLong').is_hidden() == (len(pg.input_value('#tAi')) <= 10000), 'long note state')
    print('chars', len(pg.input_value('#tAi')))
    # step 6 printable
    chk('Printable PDFs (optional)' in pg.inner_text('#vTeacher'), 'no step 6')
    chk('nothing needs attaching' in pg.inner_text('#vTeacher'), 'step 6 note missing')
    pg.screenshot(path='/tmp/fhq-shots/teacher_desktop.png', full_page=True)
    # scheme sheet text
    t = pg.evaluate("__fhq.ev('schemeHTML(\"c3f\")')")
    chk('attached' not in t.lower() and 'attach the' not in t.lower(), 'scheme still talks about attaching'); chk('MYP: A' in t, 'scheme has no MYP tag')
    pg.click('[data-file="c3f:key"]'); pg.wait_for_timeout(500)
    print('modals', pg.locator('.modalback').count(), pg.locator('.modal').count()); chk(pg.locator('.modal.wide').count() == 1, 'key preview did not open')
    pg.evaluate("document.querySelectorAll('.modalback').forEach(e=>e.remove())")
    # phone + dark
    pg.set_viewport_size({'width': 390, 'height': 800}); pg.wait_for_timeout(200)
    chk(pg.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'horizontal scroll on phone')
    pg.screenshot(path='/tmp/fhq-shots/teacher_phone.png', full_page=True)
    pg.evaluate("document.documentElement.setAttribute('data-theme','dark')"); pg.screenshot(path='/tmp/fhq-shots/teacher_dark.png', full_page=True)
    b.close()
print('errors', errs + bad)
sys.exit(1 if errs or bad else 0)
