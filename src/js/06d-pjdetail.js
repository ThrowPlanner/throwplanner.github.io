/* ===== Målsat projektordetalje: lille kort øverst til højre i boks 08 (ovenfra), 09/10 (fra siden / set fra lærredet) =====
   Tegnes med samme skitse som boksene (pkModel/pkOrtho i 06c-pjsketch.js) og TDC-målene (kabinet B×H×D, optikkens udragning).
   Kaldes fra render(); kortet kan skjules med × (gælder alle tre bokse, gemmes ikke). Stil: .skd* i styles.css */
const PKD_T={side:{en:'Side view',ja:'側面',da:'Fra siden'},top:{en:'Top view',ja:'上面',da:'Ovenfra'},front:{en:'Seen from the screen',ja:'スクリーン側から',da:'Set fra lærredet'},
  tot:{en:'total',ja:'全長',da:'i alt'},hide:{en:'Hide detail',ja:'詳細を隠す',da:'Skjul detalje'},show:{en:'Projector detail',ja:'プロジェクター詳細',da:'Projektordetalje'}};
const pkdTr=k=>PKD_T[k][S.lang]||PKD_T[k].en;
let PKD_HID=false;
// mållinje med små skrå streger (som en teknisk tegning)
function pkdH(x0,x1,y,t,e0,e1){if(Math.abs(x1-x0)<3)return '';let s='';const a=Math.min(x0,x1),b=Math.max(x0,x1);
  if(e0!=null)s+=`<line class="skd-ext" x1="${x0}" y1="${e0}" x2="${x0}" y2="${y+3}"/>`;if(e1!=null)s+=`<line class="skd-ext" x1="${x1}" y1="${e1}" x2="${x1}" y2="${y+3}"/>`;
  s+=`<line class="skd-dl" x1="${a}" y1="${y}" x2="${b}" y2="${y}"/><line class="skd-dl" x1="${a-3}" y1="${y+3}" x2="${a+3}" y2="${y-3}"/><line class="skd-dl" x1="${b-3}" y1="${y+3}" x2="${b+3}" y2="${y-3}"/>`;
  return s+`<text class="skd-dt" x="${(a+b)/2}" y="${y-5}">${t}</text>`}
function pkdV(x,y0,y1,t,e0,e1){if(Math.abs(y1-y0)<3)return '';let s='';const a=Math.min(y0,y1),b=Math.max(y0,y1);
  if(e0!=null)s+=`<line class="skd-ext" x1="${e0}" y1="${y0}" x2="${x+3}" y2="${y0}"/>`;if(e1!=null)s+=`<line class="skd-ext" x1="${e1}" y1="${y1}" x2="${x+3}" y2="${y1}"/>`;
  s+=`<line class="skd-dl" x1="${x}" y1="${a}" x2="${x}" y2="${b}"/><line class="skd-dl" x1="${x-3}" y1="${a+3}" x2="${x+3}" y2="${a-3}"/><line class="skd-dl" x1="${x-3}" y1="${b+3}" x2="${x+3}" y2="${b-3}"/>`;
  return s+`<text class="skd-dt" x="${x+6}" y="${(a+b)/2+5.5}" text-anchor="start">${t}</text>`}
// én visning (side/top/front) i et 300 px bredt viewBox med mål i mm
function pkdView(r,kind){const mm=v=>Math.round(v*1000);
  const M=pkModel(r),A=pkBox(M),C=(M.find(p=>p.cab)||{b:A}).b;
  const V=kind==='side'?{u:'z',v:'y',d:'x',sd:1,su:1}:kind==='top'?{u:'x',v:'z',d:'y',sd:1,su:1}:{u:'x',v:'y',d:'z',sd:-1,su:-1};
  const u0=A[V.u+'0'],u1=A[V.u+'1'],v0=A[V.v+'0'],v1=A[V.v+'1'];
  const two=(u1-u0)-(C[V.u+'1']-C[V.u+'0'])>.002;
  const W=300,pl=10,pr=(v1-v0)-(C[V.v+'1']-C[V.v+'0'])>.002?118:62,pt=10,pb=two?58:32;
  const sc=Math.min((W-pl-pr)/(u1-u0),(210-pt-pb)/(v1-v0)),H=Math.round(pt+(v1-v0)*sc+pb);
  const cx=pl+(W-pl-pr)/2,cy=pt+(H-pt-pb)/2,um=(u0+u1)/2,vm=(v0+v1)/2;
  // ovenfra: lærredet er nedad (optikken nederst); ellers op = op
  const X=u=>cx+V.su*(u-um)*sc,Y=kind==='top'?(v=>cy+(v-vm)*sc*-1):(v=>cy-(v-vm)*sc);
  let s=pkOrtho(M,V,(u,v)=>[X(u),Y(v)]);
  const lo=(o,a)=>Math.min(X(o[a+'0']),X(o[a+'1'])),hi=(o,a)=>Math.max(X(o[a+'0']),X(o[a+'1'])),loY=(o,a)=>Math.min(Y(o[a+'0']),Y(o[a+'1'])),hiY=(o,a)=>Math.max(Y(o[a+'0']),Y(o[a+'1']));
  const ua=lo(A,V.u),ub=hi(A,V.u),cu0=lo(C,V.u),cu1=hi(C,V.u),va=loY(A,V.v),vb=hiY(A,V.v),cv0=loY(C,V.v),cv1=hiY(C,V.v);
  const cw=mm(C[V.u+'1']-C[V.u+'0']),ch=mm(C[V.v+'1']-C[V.v+'0']),aw=mm(u1-u0),ah=mm(v1-v0);
  // vandrette mål under tegningen: udragning + kabinet og samlet længde
  let y=vb+22;
  if(aw-cw>2){const lensLeft=Math.abs(ua-cu0)>Math.abs(ub-cu1),lx0=lensLeft?ua:cu1,lx1=lensLeft?cu0:ub;
    s+=pkdH(lx0,lx1,y,`${mm(Math.abs(lx1-lx0)/sc)}`,vb,vb)+pkdH(cu0,cu1,y,`${cw}`,null,cv1);y+=24;s+=pkdH(ua,ub,y,`${pkdTr('tot')} ${aw}`,null,null)}
  else s+=pkdH(cu0,cu1,y,`${cw}`,cv1,cv1);
  // lodrette mål til højre: kabinet og samlet, hvis optikken rager op/ned
  const x=Math.max(ub,cu1)+12;s+=pkdV(x,cv0,cv1,`${ch}`,cu1,cu1);
  if(ah-ch>2)s+=pkdV(x+52,va,vb,`${ah}`,null,null);
  return {svg:s,W,H}}
function pkdCard(host,kind,r){let el=host.querySelector(':scope>.skd');
  if(!el){el=document.createElement('div');el.className='skd';host.appendChild(el)}
  el.classList.toggle('skd-min',PKD_HID);
  if(PKD_HID){el.innerHTML=`<button type="button" class="skd-btn" data-skd="show">${pkdTr('show')}</button>`;return}
  const v=pkdView(r,kind);
  el.innerHTML=`<div class="skd-h"><span><b>${esc(r.m.m.replace(/^PT-/,''))}</b> + ${esc(r.ln[0].replace(/^Supplied lens\//,''))}</span><button type="button" class="skd-x" data-skd="hide" aria-label="${pkdTr('hide')}" title="${pkdTr('hide')}">×</button></div>`+
    `<svg viewBox="0 0 ${v.W} ${v.H}" role="img" aria-label="${pkdTr(kind)}">${v.svg}</svg><div class="skd-c">${pkdTr(kind)} · mm</div>`}
function pkDetail(r){const on=!['immersive','golf','warp'].includes(S.venue)&&r&&r.m&&r.ln;
  document.querySelectorAll('.skd').forEach(e=>e.hidden=!on);if(!on)return;
  const side=$('side'),front=$('front'),plan=$('planStage');
  if(side)pkdCard(side.parentElement,'side',r);if(front)pkdCard(front.parentElement,'front',r);
  // plantegningen scroller – kortet sidder i en ramme uden om den
  if(plan){let w=plan.parentElement;if(!w.classList.contains('skwrap')){w=document.createElement('div');w.className='skwrap';plan.parentElement.insertBefore(w,plan);w.appendChild(plan)}pkdCard(w,'top',r)}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-skd]');if(!b)return;PKD_HID=b.dataset.skd==='hide';try{pkDetail(calc())}catch(_){}});
