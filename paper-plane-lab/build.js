// Builds Paper-Plane-Lab-offline.html (the Toddle file) and dist/test.html (same app plus a test hook).
// Run from this folder:  node build.js
const fs=require('fs'),path=require('path');
const here=__dirname,src=f=>fs.readFileSync(path.join(here,'src',f),'utf8');
const css=src('style.css'),body=src('body.html');
const js=['model','core','lab','graph','steps1','steps2','evaluate','report','progress','teacher','sheet','intro','tour','app'].map(f=>src(f+'.js')).join('\n');
const head=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Paper Plane Lab</title>\n<style>\n${css}\n</style></head><body>\n${body}\n<script>\n${js}\n`;
const hook=`window.__T={get S(){return S},set S(v){S=v},LAB,render,go,labLaunch,labRecord,swToggle,buildReport,rubric,graphEval,gInit,putPoint,setBar,save,trendOf,cmpRows,makeVirtual};\n`;
fs.mkdirSync(path.join(here,'dist'),{recursive:true});
fs.writeFileSync(path.join(here,'Paper-Plane-Lab-offline.html'),head+`</script></body></html>`);
fs.writeFileSync(path.join(here,'dist','test.html'),head+hook+`</script></body></html>`);
console.log('built',(fs.statSync(path.join(here,'Paper-Plane-Lab-offline.html')).size/1024).toFixed(0)+' KB');
