const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const file=process.argv[2], out=process.argv[3], tag=process.argv[4]||'a';
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const ctx=await b.newContext({viewport:{width:1100,height:900},deviceScaleFactor:1.5});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+file);await p.waitForTimeout(2500);
  await (await p.$('#gal')).screenshot({path:`${out}/${tag}-gal.png`});
  await p.fill('#gen','0');await p.waitForTimeout(200);await (await p.$('#vary')).screenshot({path:`${out}/${tag}-vary0.png`});
  await p.evaluate(()=>{const g=document.getElementById('gen');g.value=100});await p.waitForTimeout(300);await (await p.$('#vary')).screenshot({path:`${out}/${tag}-vary100.png`});
  await p.waitForTimeout(3000);await (await p.$('#scene')).screenshot({path:`${out}/${tag}-tundra.png`});
  await p.click('[data-biome=savanna]');await p.waitForTimeout(5000);await (await p.$('#scene')).screenshot({path:`${out}/${tag}-savanna.png`});
  await p.click('[data-biome=ocean]');await p.waitForTimeout(2500);await (await p.$('#scene')).screenshot({path:`${out}/${tag}-ocean.png`});
  await p.setViewportSize({width:390,height:800});await p.waitForTimeout(800);await p.screenshot({path:`${out}/${tag}-phone.png`,fullPage:true});
  console.log('scrollW',await p.evaluate(()=>document.documentElement.scrollWidth),'errors',errs.slice(0,6));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
