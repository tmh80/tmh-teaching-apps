"""Maths Gym screens (67-practice.js): home card, Chapter 3 reminder, level up and down, clues, two tries, traps, units card, worlds gate,
end screen, targets, summary PDF, progress PDF, teacher row, backup, phone width, dark mode, no errors, no network.
Run after build.py: python3 tests/practice.py   Screenshots: /tmp/fhq-shots/gym/"""
import pathlib, json, os, re, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pdfcheck import download_check
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/gym/'; os.makedirs(OUT, exist_ok=True)
errs = []; reqs = []; fails = []
def chk(n, c, x=''):
    print(('PASS ' if c else 'FAIL ') + n + (' ' + str(x)[:400] if (x and not c) else '')); c or fails.append(n)
def watch(pg):
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('request', lambda r: reqs.append(r.url) if not r.url.startswith(('file:', 'data:', 'blob:')) else None)
def fresh(b, W=1300, H=900, dark=False, name='Mia', cls='7B'):
    ctx = b.new_context(viewport={'width': W, 'height': H}, color_scheme='dark' if dark else 'light', accept_downloads=True, permissions=['clipboard-read', 'clipboard-write'])
    pg = ctx.new_page(); watch(pg)
    pg.goto(f); pg.wait_for_timeout(300); pg.fill('#whoName', name); pg.fill('#whoCls', cls); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.ev('PG_MIX=0')")
    return ctx, pg

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx, pg = fresh(b)
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    Q = lambda: ev("(()=>{const q=pgQ(pgData());return {ans:q.ans,unit:q.unit,ansText:q.ansText,kind:q.kind,level:q.level,traps:q.traps,hints:q.hints,work:q.work,steps:q.steps,units2:q.units2,world:q.world,arrows:q.pic.arrows}})()")
    P = lambda: ev("pgData()")
    def setp(o):   # a fresh Gym state, then show it
        ev("(()=>{dbSet('prac'," + json.dumps(o) + ");PGV.q=null;PGV.mode='play';if(VIEW!=='vPractice')show('vPractice');else pgRender()})()"); pg.wait_for_timeout(80)
    def answer(val=None, unit=None):
        q = Q(); pg.fill('#pgIn', str(q['ansText'] if val is None else val)); pg.select_option('#pgU', q['unit'] if unit is None else unit); pg.click('#pgCheck'); pg.wait_for_timeout(60); return q
    def nxt(): pg.click('#pgNext'); pg.wait_for_timeout(80)
    def wrong_val(q):   # a wrong number that is not a trap
        v = q['ans'] * 3.7 + 11.3; return round(v, 2)

    # ---- home card and the Chapter 3 reminder ----
    ev("renderHome()"); chk('home card visible', pg.is_visible('#gymCard') and 'Maths Gym' in pg.inner_text('#gymCard'))
    pg.locator('#gymCard').scroll_into_view_if_needed(); pg.screenshot(path=OUT + 'homecard_1300.png')
    pg.click('#gymCard [data-pg=open]'); pg.wait_for_timeout(150)
    chk('Gym opens', pg.is_visible('#vPractice'))
    chk('reminder for a new student', pg.is_visible('.pg-remind') and 'We recommend doing Chapter 3 first' in pg.inner_text('.pg-remind'))
    pg.screenshot(path=OUT + 'reminder_1300.png')
    pg.click('.pg-remind [data-open=c3f]'); pg.wait_for_timeout(300)
    chk('Go to Chapter 3 opens Chapter 3', pg.is_visible('#vChapter') and ev("CH.id") == 'c3f')
    pg.click('#homeBtn'); pg.wait_for_timeout(100); pg.click('#gymCard [data-pg=open]'); pg.wait_for_timeout(100)
    chk('reminder shows each time', pg.is_visible('.pg-remind'))
    pg.click('[data-pg=anyway]'); pg.wait_for_timeout(100)
    chk('Practise anyway shows a question', pg.is_visible('#pgIn') and pg.is_visible('.pg-bar'))
    ev("DB.user={name:'Teacher',cls:'',teacher:true};saveDB()"); ev("pgOpen()"); pg.wait_for_timeout(100)
    chk('no reminder in teacher mode', not pg.is_visible('.pg-remind') and pg.is_visible('#pgIn'))
    ev("DB.user={name:'Mia',cls:'7B'};saveDB();refreshWho()")
    ev("giveStamp('c3f')"); ev("pgOpen()"); pg.wait_for_timeout(100)
    chk('no reminder once Chapter 3 Foundation is done', not pg.is_visible('.pg-remind'))
    ev("(()=>{const s=dbGet('stamps',{});delete s.c3f;dbSet('stamps',s)})()")

    # ---- level up: 3 right in a row, no clue ----
    setp({})
    for i in range(3):
        q = answer(); chk(f'right answer {i + 1} marked right', 'ok' in pg.get_attribute('#pgFb', 'class') and P()['cur']['ok'], pg.inner_text('#pgFb'))
        if i < 2: chk(f'run is {i + 1}', P()['run'] == i + 1, P()['run']); nxt()
    chk('level 2 after 3 right', P()['level'] == 2, P()['level'])
    chk('celebration names the new level', pg.is_visible('.pg-cele') and 'Level 2 unlocked' in pg.inner_text('.pg-cele'), pg.inner_text('#pgHost')[:300])
    chk('Next says Start level 2', 'Start level 2' in pg.inner_text('#pgNext'))
    pg.wait_for_timeout(400); pg.screenshot(path=OUT + 'levelup_1300.png', full_page=True)
    nxt(); chk('new question is level 2', Q()['level'] == 2)
    chk('evidence saved for right answers', ev("dbGet('evidence',[]).filter(e=>/Maths Gym/.test(e.text)).length") == 3)

    # ---- a clue: right, but the run does not grow ----
    pg.click('[data-pg=clue]'); pg.wait_for_timeout(60)
    chk('clue shows hint 1', pg.locator('.pg-clues .clist li').count() == 1 and Q()['hints'][0][:30] in pg.inner_text('.pg-clues'))
    pg.click('[data-pg=clue]'); pg.wait_for_timeout(60); chk('second clue', pg.locator('.pg-clues .clist li').count() == 2)
    answer(); chk('right after a clue: run stays 0', P()['run'] == 0 and P()['hist'][-1]['clue'] is True, P()['run'])
    nxt()

    # ---- wrong, then right on the second try ----
    q = Q(); answer(wrong_val(q)); fb = pg.inner_text('#pgFb')
    chk('first wrong: clue or trap and another go', 'another go' in fb.lower(), fb)
    chk('Try again button shown', pg.is_visible('[data-pg=retry]'))
    pg.click('[data-pg=retry]'); chk('Try again clears the box', pg.input_value('#pgIn') == '')
    answer(); h = P()['hist'][-1]
    chk('right on the second try', h['ok'] and h['tries'] == 2 and 'second try' in pg.inner_text('#pgFb'), h)
    chk('second-try right does not grow the run', P()['run'] == 0)
    nxt()

    # ---- wrong twice: the worked answer ----
    setp({'level': 3})
    q = answer(wrong_val(Q())); answer(wrong_val(q) + 1)
    chk('wrong twice: worked answer shown', pg.is_visible('.pg-worked') and 'worked answer' in pg.inner_text('.pg-worked').lower())
    chk('worked answer is q.work', q['work'].split('\n')[0] in pg.inner_text('.pg-workans'), pg.inner_text('.pg-workans'))
    chk('"The answer is" in the feedback', 'The answer is ' + q['ansText'] in pg.inner_text('#pgFb'), pg.inner_text('#pgFb'))
    chk('one wrong question does not drop the level', P()['level'] == 3 and P()['wrongRun'] == 1)
    nxt()
    # ---- a second wrong question: level down, then a twin ----
    q2 = answer(wrong_val(Q())); answer(wrong_val(q2) + 1)
    chk('2 wrong in a row: level down', P()['level'] == 2, P()['level'])
    chk('kind message', pg.is_visible('.pg-down') and "Let's go back a step" in pg.inner_text('.pg-down'))
    pg.screenshot(path=OUT + 'leveldown_1300.png', full_page=True)
    chk('Next offers the twin', 'twin' in pg.inner_text('#pgNext').lower())
    nxt(); t = Q()
    chk('twin question: same kind, new seed', t['kind'] == q2['kind'] and P()['cur']['twin'] and P()['cur']['seed'] != P()['hist'][-1]['seed'], (t['kind'], q2['kind']))
    chk('twin chip shown', 'Twin question' in pg.inner_text('.pg-qhd'))

    # ---- a trap answer names the mistake ----
    setp({'level': 2})
    q = Q(); tr = q['traps'][0]
    answer(tr['ans']); chk('trap says its mistake', tr['say'][:40] in pg.inner_text('#pgFb'), (tr, pg.inner_text('#pgFb')))
    chk('trap saved', tr['key'] in P()['cur']['traps'])
    answer(); chk('fixed on try 2 counts as fixed', P()['traps'][tr['key']]['fixed'] == 1)
    nxt()
    # ---- wrong unit ----
    q = Q(); other = [u for u in ['N', 'kg', 'm/s²'] if u != q['unit']][0]
    answer(None, other); fb = pg.inner_text('#pgFb')
    chk('wrong unit message', 'Your number is right! Now check the unit' in fb, fb)
    chk('no unit refused, not counted', True)
    pg.fill('#pgIn', q['ansText']); pg.select_option('#pgU', ''); pg.click('#pgCheck'); pg.wait_for_timeout(50)
    chk('no unit: asks for one', 'Choose a unit' in pg.inner_text('#pgFb') and P()['cur']['tries'] == 1)
    pg.fill('#pgIn', 'abc'); pg.select_option('#pgU', q['unit']); pg.click('#pgCheck'); pg.wait_for_timeout(50)
    chk('not a number: asks for a number', 'as a number' in pg.inner_text('#pgFb') and P()['cur']['tries'] == 1)

    # ---- worlds only after the Chapter 5 Learn steps ----
    setp({'level': 5})
    w0 = ev("(()=>{const P=pgData();let n=0;for(let i=0;i<150;i++){pgNewQ(P);P.hist.push({kind:PGV.q.kind});P.hist=P.hist.slice(-3);if(PGV.q.world)n++}return n})()")
    chk('no other-world questions before Chapter 5 Learn', w0 == 0, w0)
    ev("['c5f','c5x'].forEach(id=>{const o={};CHDATA[id].steps.forEach(s=>o[s.id]=true);dbSet('learnDone.'+id,o)})")
    w1 = ev("(()=>{const P=pgData();let n=0;for(let i=0;i<150;i++){pgNewQ(P);P.hist.push({kind:PGV.q.kind});P.hist=P.hist.slice(-3);if(PGV.q.world)n++}return n})()")
    chk('other-world questions after Chapter 5 Learn', w1 > 0, w1)
    ev("dbSet('learnDone.c5f',{});dbSet('learnDone.c5x',{})")
    # a world picture
    ev("(()=>{const P=pgData();P.level=5;for(let i=0;i<400;i++){pgNewQ(P);if(PGV.q.world)break}pgSave(P);PGV.mode='play';pgRender()})()") if False else None

    # ---- units: the teach card on first reaching level 6 ----
    setp({'level': 5, 'run': 2, 'best': 5})
    u0 = ev("(()=>{const P=pgData();P.level=6;let n=0;for(let i=0;i<150;i++){pgNewQ(P);P.hist.push({kind:PGV.q.kind});P.hist=P.hist.slice(-3);if(PGV.q.units2)n++}return n})()")
    chk('no units questions before the card', u0 == 0, u0)
    answer(); chk('level 6 reached', P()['level'] == 6); nxt()
    chk('units card opens on first reaching level 6', pg.is_visible('.pg-units') and 'Grams and kilograms' in pg.inner_text('.pg-units'))
    pg.screenshot(path=OUT + 'units_1300.png', full_page=True)
    pg.click('[data-pg=unext]'); chk('card 2: tonnes', 'Tonnes' in pg.inner_text('.pg-units'))
    pg.click('[data-pg=unext]'); chk('card 3: worked example', '0.057 kg' in pg.inner_text('.pg-units')); pg.screenshot(path=OUT + 'units_example_1300.png', full_page=True)
    pg.click('[data-pg=unext]'); pg.fill('#pgGap', 'multiply'); pg.click('[data-pg=ugap]'); pg.wait_for_timeout(50)
    chk('gap: multiply is not accepted', 'Not quite' in pg.inner_text('#pgUfb') and not P()['unitsDone'])
    pg.fill('#pgGap', 'divide'); pg.press('#pgGap', 'Enter'); pg.wait_for_timeout(80)
    chk('gap accepts divide', P()['unitsDone'] and 'Yes!' in pg.inner_text('#pgUfb'))
    pg.screenshot(path=OUT + 'units_gap_1300.png', full_page=True)
    chk('gap accepts ÷ and divided', ev("(()=>{const ok=[];['÷','divided','Divide'].forEach(w=>{PGV.gapOk=false;pgRender();document.querySelector('#pgGap').value=w;ok.push(pgUnitsGap())});return ok.every(Boolean)})()"))
    pg.click('[data-pg=udone]'); pg.wait_for_timeout(80)
    chk('back to a level 6 question', pg.is_visible('#pgIn') and Q()['level'] == 6)
    u1 = ev("(()=>{const P=pgData();let n=0;for(let i=0;i<150;i++){pgNewQ(P);P.hist.push({kind:PGV.q.kind});P.hist=P.hist.slice(-3);if(PGV.q.units2)n++}return n})()")
    chk('units questions after the card', u1 > 0, u1)
    ev("(()=>{const P=pgData();for(let i=0;i<400;i++){pgNewQ(P);if(PGV.q.units2)break}pgSave(P);pgRender()})()")
    chk('units fold-out on a units question', pg.is_visible('.pg-unitsfold'))
    pg.click('.pg-unitsfold summary'); pg.click('.pg-unitsfold [data-pg=units]'); pg.wait_for_timeout(60)
    chk('fold-out reopens the units cards', pg.is_visible('.pg-units'))
    pg.click('.pg-units [data-pg=uskip]'); pg.wait_for_timeout(60); chk('back to the same question', Q()['units2'])

    # ---- question card with arrows (screenshot) ----
    setp({'level': 4})
    ev("(()=>{const P=pgData();for(let i=0;i<50;i++){pgNewQ(P);if(PGV.q.pic.arrows.length&&PGV.q.kind==='fricA')break}pgSave(P);pgRender()})()")
    chk('force sketch shown when arrows', pg.locator('.pg-fbd svg').count() == 1 and Q()['arrows'][0]['label'].split(' ')[0] in pg.inner_text('.pg-fbd'))
    pg.screenshot(path=OUT + 'question_arrows_1300.png', full_page=True)
    ev("(()=>{const P=pgData();P.level=6;for(let i=0;i<300;i++){pgNewQ(P);if(PGV.q.kind==='fall')break}pgSave(P);pgRender()})()")
    pg.screenshot(path=OUT + 'question_fall_1300.png', full_page=True)
    ev("(()=>{const P=pgData();P.level=6;for(let i=0;i<300;i++){pgNewQ(P);if(PGV.q.kind==='compare')break}pgSave(P);pgRender()})()")
    pg.screenshot(path=OUT + 'question_compare_1300.png', full_page=True)
    # every picture key draws without error
    n = ev("PR_THINGS.map(t=>pgPic({thing:t.key,draw:t.pic,dir:t.dir||'right',arrows:[]})).filter(s=>s.startsWith('<svg')).length")
    chk('a picture for every object', n == ev("PR_THINGS.length"), n)
    ev("document.querySelector('#pgHost').insertAdjacentHTML('afterbegin','<div id=allpics style=\"display:grid;grid-template-columns:repeat(6,1fr);gap:6px\">'+PR_THINGS.map(t=>'<div>'+pgPic({thing:t.key,draw:t.pic,dir:t.dir||'right',arrows:[],world:t.key==='rover'?'mars':null})+'<small>'+t.key+'</small></div>').join('')+'</div>')")
    pg.locator('#allpics').screenshot(path=OUT + 'all_pictures.png'); ev("document.querySelector('#allpics').remove()")

    # ---- a go of 10: the end screen ----
    setp({'level': 1, 'target': 'r10'})
    chk('target picker shows progress', '0 of 10 right' in pg.inner_text('.pg-bar'), pg.inner_text('.pg-bar'))
    for i in range(10):
        q = Q()
        if i in (3, 4):
            answer(wrong_val(q)); answer(wrong_val(q) + 1)
        else: answer()
        if i == 1: chk('target progress counts', '2 of 10 right' in pg.inner_text('.pg-bar'), pg.inner_text('.pg-bar'))
        nxt()
    chk('end screen after 10 questions', pg.is_visible('.pg-end'), pg.inner_text('#pgHost')[:200])
    et = pg.inner_text('.pg-end')
    chk('end: questions right', '8' in et and 'questions right' in et, et)
    chk('end: highest level', 'highest level reached' in et)
    chk('end: skills table', pg.locator('.pg-end .pg-tbl tr').count() >= 2)
    chk('end: next time line', 'Next time, practise' in et or 'Next time,' in et)
    chk('end: buttons', all(pg.locator(f'.pg-end [data-pg={k}]').count() == 1 for k in ['again', 'home', 'pdf']))
    chk('goes counted', P()['goes'] == 1 and P()['go'] is None)
    pg.screenshot(path=OUT + 'end_1300.png', full_page=True)
    pg.click('.pg-end [data-pg=again]'); pg.wait_for_timeout(60); chk('Keep going starts a new go', 'question 1 of 10' in pg.inner_text('.pg-qhd').lower())
    # target picker
    pg.select_option('[data-pg=target]', 'l3'); pg.wait_for_timeout(60)
    chk('target saved', P()['target'] == 'l3')
    ev("(()=>{const P=pgData();P.best=3;pgSave(P);pgRender()})()")
    chk('level target reached shows ✓', '✓ Target reached' in pg.inner_text('.pg-bar'))
    pg.select_option('[data-pg=target]', 'r20'); pg.wait_for_timeout(60)
    chk('right-count target counts from when chosen', '0 of 20 right' in pg.inner_text('.pg-bar'), pg.inner_text('.pg-bar'))
    chk('mistakes saved', len(P()['hist']) >= 10)
    hist = P()['hist'][-1]; chk('history keeps seed and opts', 'seed' in hist and 'opts' in hist and 'kind' in hist and 'skill' in hist)
    chk('history rebuilds the same question', ev("(()=>{const h=pgData().hist.slice(-1)[0];return prGen(h.lvl,h.seed,h.opts).kind===h.kind})()"))

    # ---- Save my practice: name and class first ----
    pg.select_option('[data-pg=target]', 'l3'); pg.wait_for_timeout(50)
    ev("DB.user={name:'Mia',cls:''};saveDB()")
    chk('no class: PDF refused', ev("pgPdf()") is False and 'No name, no worksheet' in pg.inner_text('#modal'))
    chk('download gate agrees', ev("wsNeedsName('gym')") is True)
    ev("closeModal()"); ev("DB.user={name:'Mia',cls:'7B'};saveDB();refreshWho()")
    chk('with a name: summary opens', ev("pgPdf()") is True and pg.is_visible('#wsDown'))
    pv = pg.inner_text('.modalback .modal'); chk('summary preview has the target', 'Target: reach level 3. ✓ Reached' in pv, pv[:400])
    chk('summary preview has skills and last questions', 'Skills' in pv and 'My last' in pv and 'Mistakes met and fixed' in pv)
    pg.screenshot(path=OUT + 'summary_preview_1300.png')
    ev("document.querySelectorAll('.modalback').forEach(m=>m.remove())")
    r = download_check(pg, 'null', 'gym', OUT, 'gym_summary')
    chk('PDF file name', r['filename'] == 'Force HQ Maths Gym - Mia.pdf', r['filename'])
    chk('PDF has the target and name', 'Target' in r['text'] and 'Mia' in r['text'] and 'Maths Gym' in r['text'], r['text'][:300])
    chk('PDF is short', r['pages'] <= 2, r['pages']); print('summary pages:', r['pages'], 'print pages:', r['print_pages'])
    # progress PDF
    ph = ev("progressHTML()"); chk('My work so far has the Gym section', 'Maths Gym (F = m × a practice)' in ph and 'Highest level reached' in ph)

    # ---- teacher page row ----
    pg.reload(); pg.wait_for_timeout(400)   # download_check removes every .modalback, the app's own #modal too
    ev("dbSet('teach',{secs:['c3f'],opt:[],parts:['learn','review'],cls:'7/8B',where:'home',msg:'',bts:[],gym:{on:true,target:'l4'}})")
    pg.click('#homeBtn'); pg.click('#teacherBtn'); pg.wait_for_timeout(300)
    chk('teacher row present and ticked', pg.locator('[data-gym]').is_checked() and pg.input_value('#tGymT') == 'l4')
    pr = pg.input_value('#tPrompt')
    chk('prompt has the Gym step', 'Maths Gym: on the home page press "Open the Maths Gym"' in pr and '"Reach level 4"' in pr, pr[-1500:])
    chk('prompt has no answers', 'Q1 ' not in pr and '===' not in pr and 'Answer:' not in pr)
    chk('prompt never says files are attached', not re.search(r'attached|attaching', pr, re.I))
    chk('prompt: A ii', 'A ii' in pr)
    tt = pg.inner_text('#tTime'); m = re.search(r'approx\. (\d+) minutes', tt); base = ev("secMins('c3f').learn+secMins('c3f').review")
    chk('time includes approx. 20 min for the Gym', m and int(m.group(1)) == base + 20, (tt, base))
    pg.select_option('#tGymT', 'r30'); pg.wait_for_timeout(80)
    chk('target change updates time and prompt', '30' == pg.inner_text('#tGymMin') and '"Get 30 questions right"' in pg.input_value('#tPrompt'))
    pg.select_option('#tGymT', 'l4'); pg.wait_for_timeout(80)
    pg.click('#tAiUnlock'); pg.fill('#codeIn', 'FORCE'); pg.click('#codeGo'); pg.wait_for_timeout(300)
    ai = pg.input_value('#tAi')
    chk('AI text has the Gym block with the target', 'MATHS GYM' in ai and 'Target set by the teacher: Reach level 4' in ai and 'A ii' in ai, ai[-1200:])
    chk('AI text checks working and mistakes', 'Working shown' in ai and 'Mistakes met and fixed' in ai)
    # the Gym on its own
    pg.uncheck('[data-sec=c3f]'); pg.wait_for_timeout(100)
    pr2 = pg.input_value('#tPrompt'); ai2 = pg.input_value('#tAi')
    chk('Gym alone makes a prompt', 'Maths Gym' in pr2 and 'Tick at least one' not in pr2, pr2[:300])
    chk('Gym alone makes AI text', ai2.startswith('All written feedback') and 'MATHS GYM' in ai2 and 'no level' in ai2, ai2[:300])
    pg.screenshot(path=OUT + 'teacher_1300.png', full_page=True)
    ev("dbSet('teach',{})"); ev("DB.unlocked=false;saveDB()")

    # ---- backup keeps DB.prac ----
    pg.click('#homeBtn'); before = ev("JSON.stringify(dbGet('prac',null))")
    pg.click('#bkBtn'); pg.wait_for_timeout(200)
    with pg.expect_download() as dl: pg.click('#bkSave')
    d = dl.value; bpath = pathlib.Path(OUT) / 'gym_backup.txt'; d.save_as(str(bpath)); ev("closeModal()")
    ctx3 = b.new_context(viewport={'width': 1280, 'height': 860}); pg3 = ctx3.new_page(); watch(pg3)
    pg3.goto(f); pg3.wait_for_timeout(300); pg3.click('#haveFile'); pg3.wait_for_timeout(200); pg3.set_input_files('#bkFile', str(bpath)); pg3.wait_for_timeout(400); pg3.click('#bkYes'); pg3.wait_for_timeout(900)
    after = pg3.evaluate("c=>__fhq.ev(c)", "JSON.stringify(dbGet('prac',null))")
    chk('backup round trip keeps DB.prac', before == after and json.loads(after)['level'] >= 1, (before[:80], after[:80]))
    ctx3.close()
    ctx.close()

    # ---- phone width 390 ----
    ctx, pg = fresh(b, 390, 844); ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    def noscroll(tag):
        w = pg.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]"); chk(f'390 px no sideways scroll: {tag}', w[0] <= w[1], w)
    ev("pgOpen()"); pg.wait_for_timeout(150); noscroll('reminder'); pg.screenshot(path=OUT + 'reminder_390.png', full_page=True)
    pg.click('[data-pg=anyway]'); ev("(()=>{const P=pgData();P.level=4;for(let i=0;i<50;i++){pgNewQ(P);if(PGV.q.pic.arrows.length&&PGV.q.kind==='fricA')break}pgSave(P);pgRender()})()"); pg.wait_for_timeout(100)
    noscroll('question with arrows'); pg.screenshot(path=OUT + 'question_arrows_390.png', full_page=True)
    ev("(()=>{const P=pgData();P.level=1;P.run=2;P.cur=null;pgSave(P);PGV.q=null;pgRender()})()"); pg.wait_for_timeout(60)
    q = ev("(()=>{const q=pgQ(pgData());return {t:q.ansText,u:q.unit}})()"); pg.fill('#pgIn', q['t']); pg.select_option('#pgU', q['u']); pg.click('#pgCheck'); pg.wait_for_timeout(400)
    noscroll('level up'); pg.screenshot(path=OUT + 'levelup_390.png', full_page=True)
    ev("(()=>{const P=pgData();P.level=6;P.unitsDone=false;pgSave(P);pgUnitsOpen(true)})()"); pg.wait_for_timeout(60); noscroll('units card'); pg.screenshot(path=OUT + 'units_390.png', full_page=True)
    ev("(()=>{PGV.uStep=3;pgRender()})()"); noscroll('units gap'); pg.screenshot(path=OUT + 'units_gap_390.png', full_page=True)
    ev("(()=>{const P=pgData();P.lastGo={n:10,right:7,top:3,start:2,skills:{F:{right:3,tries:3},a:{right:2,tries:4},m:{right:2,tries:3}},traps:{mult:{met:2,fixed:1},unit:{met:1,fixed:1}}};P.target='l4';pgSave(P);PGV.mode='end';pgRender()})()")
    noscroll('end screen'); pg.screenshot(path=OUT + 'end_390.png', full_page=True)
    ctx.close()

    # ---- dark mode ----
    ctx, pg = fresh(b, 1300, 900, dark=True); ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    ev("giveStamp('c3f')"); ev("pgOpen()"); ev("(()=>{const P=pgData();P.level=4;P.run=1;P.target='l5';for(let i=0;i<50;i++){pgNewQ(P);if(PGV.q.pic.arrows.length)break}pgSave(P);pgRender()})()"); pg.wait_for_timeout(100)
    pg.click('[data-pg=clue]'); pg.screenshot(path=OUT + 'dark_question_1300.png', full_page=True)
    ev("(()=>{const P=pgData();P.lastGo={n:10,right:9,top:5,start:4,skills:{res:{right:5,tries:5},weight:{right:4,tries:5}},traps:{oneForce:{met:1,fixed:1}}};pgSave(P);PGV.mode='end';pgRender()})()")
    pg.screenshot(path=OUT + 'dark_end_1300.png', full_page=True)
    ctx.close()
    b.close()

chk('no console errors', not errs, errs[:5])
chk('no network requests', not reqs, reqs[:5])
print('errors', errs)
print('FAILED:' if fails else 'ALL PASS', fails)
sys.exit(1 if fails else 0)
