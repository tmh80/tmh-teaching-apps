// Builds single-file pages: node build.js   (run from anywhere)
// Every <script src="local.js"></script> in a *.src.html page is replaced by the file's contents. Missing files become empty.
const fs=require('fs'),path=require('path');const d=__dirname;
const PAGES={'index.src.html':'Adapt-Lab-Art-Prototype.html'};
for(const[src,out]of Object.entries(PAGES)){
  if(!fs.existsSync(path.join(d,src)))continue;
  const html=fs.readFileSync(path.join(d,src),'utf8').replace(/<script src="([^"]+)"><\/script>/g,(m,f)=>{const p=path.join(d,f);return fs.existsSync(p)?'<script>\n'+fs.readFileSync(p,'utf8').replace(/<\/script/g,'<\\/script')+'\n</script>':''});
  fs.writeFileSync(path.join(d,out),html);console.log('built',out,html.length,'bytes');
}
