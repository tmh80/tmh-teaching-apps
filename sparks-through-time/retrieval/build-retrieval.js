/* Joins retrieval/src/*.js and places it between the markers in Sparks-Through-Time.html.
   node build-retrieval.js              updates the real file
   node build-retrieval.js --out x.html writes a test copy instead (use this while working) */
const fs=require('fs'),path=require('path');
const html=path.join(__dirname,'..','Sparks-Through-Time.html');
const dir=path.join(__dirname,'src');
const A='/* RETRIEVAL:START */',B='/* RETRIEVAL:END */';
const js=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>`/* ---- ${f} ---- */\n`+fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
const out=process.argv[2]==='--out'?process.argv[3]:html;
let s=fs.readFileSync(html,'utf8');
const hook="document.getElementById('brand').prepend(pipSVG(40));";
if(!s.includes(A)){ if(!s.includes(hook)) throw new Error('hook missing'); s=s.replace(hook,`${A}\n${B}\n${hook}`); }
const i=s.indexOf(A)+A.length,j=s.indexOf(B);
fs.writeFileSync(out,s.slice(0,i)+'\n'+js+'\n'+s.slice(j));
console.log('built',out,fs.statSync(out).size);
