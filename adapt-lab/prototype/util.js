/* small page helpers shared by the prototype pages */
(function(){
"use strict";
function fit(cv,ratio){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth,h=Math.round(w*ratio);cv.style.height=h+'px';if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return{c,w,h}}
function blinkAt(t,seed){return((t+seed*1.7)%4.3)<.12}
function label(c,txt,x,y,sz,colr,weight){c.font=`${weight||600} ${sz}px "Avenir Next","Segoe UI",system-ui,sans-serif`;c.textAlign='center';c.fillStyle=colr||'#24352d';c.fillText(txt,x,y)}
window.PU={fit,blinkAt,label};
})();
