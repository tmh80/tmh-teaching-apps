// Builds the single-file prototype: node build.js (run from adapt-lab/prototype/)
const fs=require('fs'),path=require('path');const d=__dirname;
const html=fs.readFileSync(path.join(d,'index.src.html'),'utf8')
  .replace('/*RIG*/',()=>fs.readFileSync(path.join(d,'rig.js'),'utf8'))
  .replace('/*SCENE*/',()=>fs.readFileSync(path.join(d,'scene.js'),'utf8'));
fs.writeFileSync(path.join(d,'Adapt-Lab-Art-Prototype.html'),html);
console.log('built',html.length,'bytes');
