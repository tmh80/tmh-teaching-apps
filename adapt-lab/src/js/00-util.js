/* Adapt Lab model · small shared helpers
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const n01=x=>x/100;
function gauss(R){let u=0,w=0;while(!u)u=R();while(!w)w=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*w)}
function vary(t,keys,R,sd){const n={...t};keys.forEach(k=>{n[k]=clamp(Math.round(t[k]+gauss(R)*sd),0,100)});return n}
Object.assign(M,{clamp,rng,hashStr,n01,gauss,vary});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
