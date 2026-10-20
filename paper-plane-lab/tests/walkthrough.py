import os
import sys, json, time
from playwright.sync_api import sync_playwright
LEVEL=sys.argv[1] if len(sys.argv)>1 else 'developing'
IV=sys.argv[2] if len(sys.argv)>2 else 'span'
DV=sys.argv[3] if len(sys.argv)>3 else 'dist'
SH=os.path.join(os.path.dirname(__file__),'shots','')
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    pg=b.new_page(viewport={'width':1360,'height':900},accept_downloads=True)
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','dist','test.html'))+'')
    pg.screenshot(path=SH+f'{LEVEL}_00_start.png',full_page=True)
    pg.fill('[data-bind="start.name"]','Lucy Wang'); pg.fill('[data-bind="start.cls"]','6B')
    pg.click(f'[data-act="pick-level"][data-k="{LEVEL}"]'); pg.click('[data-act="start"]')
    def fill(sel,val):
        pg.fill(f'[data-bind="{sel}"]',val)
    def ok(shot=None):
        pg.wait_for_timeout(150)
        ga=pg.query_selector('[data-act="go-anyway"]')
        if ga and ga.is_visible():
            print('WARN:',pg.inner_text('#modalbox')[:200].replace('\n',' | ')); ga.click(); pg.wait_for_timeout(200)
        b=pg.query_selector('[data-act="intro-ok"]')
        if b and b.is_visible():
            if shot: pg.screenshot(path=SH+shot)
            b.click(); pg.wait_for_timeout(150)
    pg.click('[data-act="tour-skip"]'); ok(f'{LEVEL}_00a_intro.png')
    for i in range(3):
        pg.click('[data-act="lab:launch"]')
        pg.wait_for_function('window.__T.LAB.state==="flying"',timeout=6000)
        if i==1: pg.screenshot(path=SH+f'{LEVEL}_00b_observe_fly.png')
        pg.wait_for_function('window.__T.LAB.state==="idle"',timeout=9000)
        if i==0: pg.select_option('[data-exp="paper"]','Newspaper')
    if LEVEL=='developing':
        for n in ['obs1','obs2']: fill(n+'.a','paper'); fill(n+'.b','flew a shorter distance')
        fill('obs3.a','bigger wings make the plane fly further')
    else: fill('obs','I noticed newspaper planes flew less far. When I changed the paper the plane wobbled. I wonder if bigger wings fly further.')
    pg.screenshot(path=SH+f'{LEVEL}_00c_observe.png',full_page=True)
    pg.click('[data-go="question"]'); ok()
    num = IV in ('span','clips','angle','speed')
    pg.click(f'[data-act="iv"][data-k="{IV}"]'); pg.click(f'[data-act="dv"][data-k="{DV}"]')
    help_ = LEVEL in ('developing','proficient')
    if help_:
        fill('rq.a','wingspan'); fill('rq.b','distance the plane flies'); fill('rq.x','I know that planes with bigger wings get more lift from the air.')
    else:
        fill('rq','How does the wingspan affect the distance a paper plane flies?'); fill('rq.x','Bigger wings make more lift.')
    fill('iv.t','Wingspan'); fill('iv.u','cm'); fill('dv.t','Distance flown'); fill('dv.u','cm')
    if help_: pg.click('[data-act="chk"][data-id="rq"]')
    pg.screenshot(path=SH+f'{LEVEL}_01_question.png',full_page=True)
    pg.click('[data-go="hypothesis"]'); ok()
    if LEVEL=='developing':
        for k,v in zip('abcde',['increase','wingspan','distance flown','increase','bigger wings give more lift so the plane glides further']): fill('hyp.'+k,v)
        pg.click('[data-act="chk"][data-id="hyp"]')
    elif LEVEL=='proficient':
        for k,v in zip('abc',['I increase the wingspan','the distance flown will increase','bigger wings give more lift so it glides further']): fill('hyp.'+k,v)
    else: fill('hyp','If I increase the wingspan, then the distance flown will increase, because bigger wings give more lift.')
    pg.screenshot(path=SH+f'{LEVEL}_02_hyp.png',full_page=True)
    pg.click('[data-go="plan"]'); ok()
    vs=[e.get_attribute('data-v') for e in pg.query_selector_all('[data-act="levelpick"]')][:4]
    for v in vs: pg.click(f'[data-act="levelpick"][data-v="{v}"]')
    NL=len(vs)
    pg.click('[data-act="env"][data-k="inside"]'); pg.click('[data-act="launch"][data-k="hand"]')
    if IV!='paper': pg.select_option('[data-design="paper"]','Thin card')
    for i,(n,h) in enumerate([('Type of paper','I will use thin card for every plane'),('Where I fly','I will fly inside the hall every time'),('Throw speed','I will throw at 6.5 m/s every time')]):
        fill(f'ctl.n{i}',n); fill(f'ctl.h{i}',h)
    if help_:
        for k in pg.evaluate("matShelf().filter(m=>m.need).map(m=>m.id)"):
            pg.click(f'[data-act="mat:add"][data-k="{k}"]')
        if LEVEL=='proficient':
            for e in pg.query_selector_all('[data-bind^="mat.n."]'): e.fill('3')
        pg.click('[data-act="chk"][data-id="mat"]')
    else: fill('mat','3 sheets of thin card\n1 tape measure\n1 calculator\n4 paper clips')
    if help_:
        for k in ['m1','m3','m4','m5','m6','m7']:
            pg.click(f'[data-act="mb:add"][data-k="{k}"]')
        ins=pg.query_selector_all('[data-bind^="mb."]')
        for el in ins: el.fill('wingspan')
        pg.click('[data-act="chk"][data-id="met"]')
    else:
        for i in range(6): fill(f'met.{i}',f'Step number {i} of the method here')
    pg.screenshot(path=SH+f'{LEVEL}_03_plan.png',full_page=True)
    pg.click('[data-go="lab"]'); ok()
    pg.wait_for_timeout(400)
    if help_: fill('t1.a','wingspan'); fill('t1.b','distance flown')
    else: fill('t1.title','The effect of wingspan on distance flown')
    fill('t1.ivh','Wingspan (cm)'); fill('t1.dvh','Distance flown (cm)'); fill('t1.avgu','cm')
    pg.screenshot(path=SH+f'{LEVEL}_04_lab0.png',full_page=False)
    nflights=0
    for f in range(NL*3):
        pg.click('[data-act="lab:launch"]')
        pg.wait_for_function('window.__T.LAB.state==="flying"',timeout=6000)
        pg.wait_for_timeout(150); pg.click('[data-act="lab:swtoggle"]')
        if f==0: pg.wait_for_timeout(500); pg.screenshot(path=SH+f'{LEVEL}_05_flying.png')
        pg.wait_for_function('window.__T.LAB.state==="landed"',timeout=8000)
        pg.wait_for_timeout(200); pg.click('[data-act="lab:swtoggle"]')
        cm=pg.evaluate('window.__T.LAB.comment'); 
        if cm:
            print('flight',f,'comment:',cm['t'])
            if pg.query_selector('[data-act="lab:addnote"]'): pg.click('[data-act="lab:addnote"]')
            elif pg.query_selector('[data-act="lab:peek"]'):
                pg.click('[data-act="lab:peek"]'); pg.wait_for_timeout(200)
                if not globals().get('peeked'): pg.screenshot(path=SH+f'{LEVEL}_06p_peek.png'); globals()['peeked']=1
                pg.click('#modalbox [data-act="closemodal"]')
            if not globals().get('bub'): pg.screenshot(path=SH+f'{LEVEL}_06b_bubble.png'); globals()['bub']=1
        d=pg.evaluate('window.__T.S.dv==="dist"?Math.round(window.__T.LAB.res.fl.landX*100):(Math.round((window.__T.LAB.sw.stop-window.__T.LAB.sw.start)/10)/100)')
        pg.fill('#cellin',str(d+25 if f==1 else d))
        if f==1: print('cellfb:',repr(pg.inner_text('#cellfb')),'recbtn disabled:',pg.is_disabled('#recbtn'))
        if f==0: pg.screenshot(path=SH+f'{LEVEL}_06_landed.png',full_page=True)
        pg.click('#recbtn'); nflights+=1
    st=pg.evaluate('(()=>{const T=window.__T;return T.S.levels.map(lk=>({lk:String(lk),v:T.S.flights.filter(f=>!f.gone&&f.lv===lk).map(f=>T.S.dv==="dist"?f.read:f.timed)}))})()')
    for j,r in enumerate(st): fill(f'avg.{r["lk"]}',str(round(sum(r['v'])/3,2 if DV=='time' else 1)+(10 if j==0 else 0)))
    for k in ['C','1','2','+','3','=']: pg.click(f'[data-act="calc"][data-k="{k}"]')
    print('calc 12+3 =',pg.inner_text('#calcd'))
    pg.screenshot(path=SH+f'{LEVEL}_07_labdone.png',full_page=True)
    pg.click('#labnext'); ok()
    # results
    for r in st: fill(f'obs.{r["lk"]}','It flew straight and then dipped down at the end.')
    pg.click(f'[data-act="g:type"][data-k="{"scatter" if num else "bar"}"]')
    if LEVEL=='developing': pg.click('[data-act="g:suggest"]')
    else:
        for k,v in [('g.ymin','0'),('g.ymax','1000' if DV=='dist' else '5'),('g.ystep','100' if DV=='dist' else '0.5'),('g.xmin','-1'),('g.xmax','18'),('g.xstep','2')]:
            if pg.query_selector(f'[data-bind="{k}"]'): fill(k,v)
    fill('g.title','Wingspan vs Distance flown'); fill('g.xl','Wingspan (cm)'); fill('g.yl','Distance flown (cm)')
    if num:
        chip=pg.query_selector('[data-chip]'); chip.scroll_into_view_if_needed(); pg.wait_for_timeout(200); box=chip.bounding_box(); cv=pg.query_selector('#gcv').bounding_box()
        pg.mouse.move(box['x']+20,box['y']+10); pg.mouse.down(); pg.mouse.move(cv['x']+300,cv['y']+200,steps=8); pg.mouse.up()
        pg.evaluate('(()=>{const T=window.__T;T.S.levels.forEach((lk,i)=>{if(i>0){const v=parseFloat(T.S.a["avg."+lk]);T.putPoint(lk,lk,v)}});T.save();})()')
        pg.click('[data-act="g:fit"]')
        pg.click('[data-act="g:curve"]'); pg.wait_for_timeout(200)
        hp=pg.evaluate('(()=>{const g=gInit(),m=gMap(g),cv=document.querySelector("#gcv").getBoundingClientRect(),s=cv.width/GW;return [cv.left+m.px(g.fit.xm)*s,cv.top+m.py(g.fit.ym)*s,cv.top+m.py(m.ymax*0.9+m.ymin*0.1)*s]})()')
        pg.mouse.move(hp[0],hp[1]); pg.mouse.down(); pg.mouse.move(hp[0],hp[2],steps=6); pg.mouse.up(); pg.wait_for_timeout(200)
        print('curve eval',pg.evaluate('(()=>{const e=graphEval();return [e.fitOK,e.bendy,e.fitShort]})()'))
    else:
        chip=pg.query_selector('[data-cat]'); chip.scroll_into_view_if_needed(); pg.wait_for_timeout(200); box=chip.bounding_box(); cv=pg.query_selector('#gcv').bounding_box()
        pg.mouse.move(box['x']+20,box['y']+10); pg.mouse.down(); pg.mouse.move(cv['x']+cv['width']*0.3,cv['y']+cv['height']*0.95,steps=8); pg.mouse.up()
        pg.evaluate('(()=>{const T=window.__T,g=T.gInit();T.S.levels.forEach((lk,i)=>{if(!g.slots.includes(String(lk))){const j=g.slots.indexOf(null);g.slots[j]=String(lk)}T.setBar(String(lk),parseFloat(T.S.a["avg."+lk]))});T.save();T.render()})()')
    if help_: pg.click('[data-act="g:check"]')
    pg.screenshot(path=SH+f'{LEVEL}_08_results.png',full_page=True)
    pg.click('[data-go="conclusion"]'); ok(f'{LEVEL}_09z_lesson.png')
    pg.wait_for_timeout(400); pg.screenshot(path=SH+f'{LEVEL}_09y_analysis_sheet.png')
    hq=pg.query_selector('.helpq')
    if hq: hq.click(); pg.wait_for_timeout(200); pg.screenshot(path=SH+f'{LEVEL}_09x_help.png'); pg.click('#modalbox [data-act="closemodal"]')
    else: print('no help ?')
    if LEVEL=='developing':
        for e in pg.query_selector_all('[data-bind^="q1."]'): e.fill('positive' if e.get_attribute('data-bind')=='q1.a' else '520 cm')
        for k,v in zip('abc',['supported','bigger wings would fly further','the 16 cm wings flew 860 cm but 6 cm flew 520 cm']): fill('q2.'+k,v)
        for n in ['q1','q2']: pg.click(f'[data-act="chk"][data-id="{n}"]')
    else:
        fill('q1','My graph shows a positive trend. As the wingspan increased the distance increased from 520 cm at 6 cm to 860 cm at 16 cm.')
        fill('q2','My hypothesis was supported because the distance went up from 520 to 860 cm.')
    pg.screenshot(path=SH+f'{LEVEL}_10_conclusion.png',full_page=True)
    pg.click('[data-go="evaluate"]'); ok(f'{LEVEL}_10y_evallesson.png')
    fl=pg.query_selector('.fairline').bounding_box(); pg.mouse.click(fl['x']+fl['width']*0.62,fl['y']+10)
    if LEVEL=='developing': fill('fairw.a','I kept most things the same but the air and my throws changed')
    else: fill('fairw','I kept most things the same but the air and my throws changed.')
    pg.click('[data-act="reveal"]')
    if LEVEL in ('developing','proficient'):
        ids=pg.evaluate("Array.from(new Set(Array.from(document.querySelectorAll('[data-act=sortpick]')).map(e=>e.dataset.id)))")
        cats=['human','method','improve','irrelevant']
        for j,i in enumerate(ids):
            pg.click(f'[data-act="sortpick"][data-id="{i}"][data-k="{"improve" if i[0]=="i" else "irrelevant" if i[0]=="x" else "method" if i[0]=="m" else "human"}"]')
        pg.click('[data-act="chk"][data-id="sort"]')
    else:
        fill('ev.m','The draft from the vent and folding each plane by hand'); fill('ev.i','Use a launcher and close the windows')
    if help_:
        for j in range(2):
            btn=pg.query_selector_all('[data-act="q3pick"]:not(.sel)')[0]; btn.click(); pg.wait_for_timeout(150)
        for e in pg.query_selector_all('[data-bind^="q3.w"]'): e.fill('it pushed some planes further than others')
        pg.click('[data-act="chk"][data-id="q3"]')
    if LEVEL=='developing':
        for k,v in zip('abcd',['close the doors and windows','the air would be still and the test fair','do more trials','one odd flight would matter less and results would be reliable']): fill('q4.'+k,v)
        pg.click('[data-act="chk"][data-id="q4"]')
    elif LEVEL=='proficient': fill('q4','To fix my first method error I would close the windows so the test is fair. I would use a template so results are reliable.')
    else:
        fill('q3','One method error was the draft from the vent because it pushed planes further. Another was folding by hand, so each plane was different, which changed the distance.')
        fill('q4','Use a launcher so every throw is the same because this would be fair. Do more trials so results are reliable.')
    pg.click('[data-act="sheet"]'); pg.wait_for_timeout(500); pg.screenshot(path=SH+f'{LEVEL}_10b_sheet.png'); pg.click('#sheet [data-act="sheet"]')
    pg.screenshot(path=SH+f'{LEVEL}_10c_evaluate.png',full_page=True)
    pg.click('[data-go="finish"]'); ok()
    with pg.expect_download() as dl:
        pg.click('[data-act="pdf"]'); pg.wait_for_timeout(300)
        if pg.query_selector('[data-act="pdf-anyway"]'):
            print('MISSING:',pg.inner_text('.misslist')[:400].replace('\n',' | ')); pg.screenshot(path=SH+f'{LEVEL}_presave.png'); pg.click('[data-act="pdf-anyway"]')
    dl.value.save_as(SH+f'{LEVEL}_report.pdf')
    pg.wait_for_timeout(1800)
    with pg.expect_download() as dl:
        pg.click('[data-act="pdffb"]'); pg.wait_for_timeout(300)
        if pg.query_selector('[data-act="pdf-anyway"]'): pg.click('[data-act="pdf-anyway"]')
    dl.value.save_as(SH+f'{LEVEL}_feedback.pdf')
    pg.wait_for_timeout(1800)
    for k in ['o','q','h','p','l','r','g','e','v','s1','s2','s3']:
        el=pg.query_selector(f'[data-ck="{k}"]:not([disabled])')
        if el and not el.is_checked(): el.click(); pg.wait_for_timeout(200)
        elif not el: print('cannot tick',k)
    pg.wait_for_timeout(300)
    pg.screenshot(path=SH+f'{LEVEL}_11_finish.png',full_page=True)
    # missing-item highlight test
    pg.click('[data-go="results"]'); ok(); k0=st[0]['lk']; fill(f'obs.{k0}','')
    pg.click('[data-go="finish"]'); ok(); pg.click('[data-act="gofix"][data-k="results"]'); pg.wait_for_timeout(900)
    pg.screenshot(path=SH+f'{LEVEL}_11b_gofix.png'); print('missing count',pg.evaluate("document.querySelectorAll('.missing').length"))
    fill(f'obs.{k0}','It flew straight and then dipped down at the end.'); pg.click('[data-go="finish"]'); ok()
    if pg.query_selector('[data-act="cert"]'):
        with pg.expect_download() as dl: pg.click('[data-act="cert"]')
        dl.value.save_as(SH+f'{LEVEL}_cert.pdf')
    else: print('cert locked; unticked:',pg.evaluate('JSON.stringify(window.__T.S.ck)'))
    # extensions
    pg.click('[data-go="extend"]'); ok(); pg.wait_for_timeout(200); pg.screenshot(path=SH+f'{LEVEL}_12_extend.png',full_page=True)
    pg.click('.typecard [data-go="compare"]'); ok()
    pg.click('[data-act="pmode"][data-k="virtual"]')
    if LEVEL=='developing':
        for k,v in zip('abcdefg',['similar to','16 cm','860 cm','790 cm','the air moved differently','reliable','most results were within 10%']): fill('rel.'+k,v)
    else: fill('rel','My results were similar to Sam. The biggest difference was at 16 cm where I got 860 and Sam got 790. This might be because of the draft. I think it is reliable because most were within 10%.')
    fill('peer.name','Ben'); pg.click('[data-peerck="rq"]'); fill('peer.well','Clear graph with labels'); fill('peer.better','Add units to the method')
    pg.screenshot(path=SH+f'{LEVEL}_09_compare.png',full_page=True)
    pg.click('[data-go="finish"]'); ok()
    try:
        with pg.expect_download(timeout=8000) as dl: pg.click('[data-act="pdf"]')
        dl.value.save_as(SH+f"{LEVEL}_report_with_ext.pdf")
    except Exception as e: print('EXT PDF FAIL',errs, pg.inner_text('#pdfmsg'))
    pg.wait_for_timeout(1800)
    pg.click('[data-go="extend"]'); ok()
    if LEVEL!='einstein':
        pg.click('[data-act="x-level"]'); pg.click('[data-act="x-start"]'); pg.click('[data-act="confirm-yes"]'); pg.wait_for_timeout(300); ok()
        pg.screenshot(path=SH+f'{LEVEL}_13_new_question.png',full_page=True)
        print('attempt',pg.evaluate('window.__T.S.attempt'),'level',pg.evaluate('window.__T.S.level'))
        pg.click('[data-go="extend"]'); ok()
        with pg.expect_download() as dl: pg.click('[data-act="x-oldpdf"]')
        dl.value.save_as(SH+f'{LEVEL}_old.pdf')
    b.close()
print('errors:',errs[:10])
