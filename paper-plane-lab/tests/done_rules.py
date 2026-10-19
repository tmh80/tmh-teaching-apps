import os
from playwright.sync_api import sync_playwright
# Checks the plan's "done" rules: completeness only (never correctness).
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome');pg=b.new_page()
    pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','dist','test.html')))
    for lv in ['developing','proficient','mastering']:
        r=pg.evaluate('''(lv)=>{const T=window.__T;let s=T.S;s.started=true;s.level=lv;s.iv='span';s.dv='dist';s.levels=[6,8,10];s.env='inside';s.launch='hand';s.a={};T.S=s;
          const f=()=>{const b=BUILD.plan();return{ctl:b.f.ctl,mat:b.f.mat,met:b.f.met}};const o={};
          s.a['ctl.n0']='a';o.oneWord=f();
          ['0','1','2'].forEach(i=>{s.a['ctl.n'+i]='x';s.a['ctl.h'+i]='y'});o.ctlFull=f();
          if(lv==='mastering'){s.a.mat='paper\\n1 tape\\n1 calc\\n2 clips';o.matNoAmount=f();s.a.mat='3 paper\\n1 tape\\n1 calc\\n2 clips';o.matFull=f();
            s.a['met.0']='a';s.a['met.1']='b';s.a['met.2']='c';o.met3=f();s.a['met.3']='d';o.met4=f()}
          else{s.a.matsel=['paper','tape','calc'];o.mat3=f();s.a.matsel=['paper','tape','calc','glue'];if(lv==='proficient'){o.matNoAmt=f();['paper','tape','calc','glue'].forEach(id=>s.a['mat.n.'+id]='1')}o.mat4=f();
            s.a.mb=['m1','m2','m3'];o.met3=f();s.a.mb=['m1','m2','m3','m4'];o.met4=f();if(lv==='proficient'){Object.keys(s.a).filter(k=>k.startsWith('mb.')).forEach(k=>delete s.a[k]);o.met4gaps=f()}}
          return o}''',lv)
        print(lv, r)
    b.close()
