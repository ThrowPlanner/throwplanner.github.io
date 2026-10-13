/* ===== TRÆK I SNITTET ===== */
let SIDE=null,sideDrag=null,sideRaf=0,scrDrag=null,FRONT=null;
function moveScreen(sb,sx){const r=calc();const max=Math.max(0,S.rh-r.CH);if(S.venue==='theater')sb=Math.max(STH(),sb);if(sb>max+1e-6)hit('top');const o={sb:S.sb},n={sb:Math.round(Math.max(0,Math.min(max,sb))*100)/100};
  if(sx!=null&&!planActive()&&S.venue!=='immersive'){const mx=Math.max(0,S.rw/2-r.CW/2);guardShift(o,n);guardShift({sx:S.sx||0},{sx:Math.round(Math.max(-mx,Math.min(mx,sx))*100)/100})}else guardShift(o,n);if(!sideRaf)sideRaf=requestAnimationFrame(()=>{sideRaf=0;render()})}
function sidePt(e){const svg=$('side'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());return {z:ZS()*((q.x-SIDE.pl)/SIDE.sc-RZ()),y:(SIDE.vh-SIDE.pb-q.y)/SIDE.sc}}

