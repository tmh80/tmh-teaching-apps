// Builds Acceleration-Lab-offline.html (the Toddle file) and dist/test.html (same app plus a test hook).
// Run from this folder:  node build.js
const fs=require('fs'),path=require('path');
const here=__dirname,src=f=>fs.readFileSync(path.join(here,'src',f),'utf8');
const css=src('style.css');
const vendor=fs.readFileSync(path.join(here,'vendor','html2canvas.min.js'),'utf8');
const js=['core','steps','graph','fbd','app','sheet','teacher'].map(f=>src(f+'.js')).join('\n');
const head=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Acceleration Lab</title>\n<style>\n${css}\n</style></head><body>\n<div class="app" id="app"></div>\n<script>/* html2canvas 1.4.1, MIT licence (see vendor/html2canvas.LICENSE.txt) */\n${vendor}\n</script>\n<script>\n${js}\n`;
const hook=`window.__T={get S(){return S},set S(v){S=v},render,go,accel,avgT,legCalc,spdCalc,chgCalc,graphEval,fbdCheck,buildSheet,exampleData,save};\n`;
fs.mkdirSync(path.join(here,'dist'),{recursive:true});
fs.writeFileSync(path.join(here,'Acceleration-Lab-offline.html'),head+`</script></body></html>`);
fs.writeFileSync(path.join(here,'dist','test.html'),head+hook+`</script></body></html>`);
console.log('built',(fs.statSync(path.join(here,'Acceleration-Lab-offline.html')).size/1024).toFixed(0)+' KB');
