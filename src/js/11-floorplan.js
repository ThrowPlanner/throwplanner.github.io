/* ===== PLANTEGNING ===== */
// tegningen huskes kun til siden lukkes; ved «Åbn projekt» kommer den fra projektfilen via sessionStorage (slettes med det samme)
let PLANIMG=null;try{PLANIMG=sessionStorage.getItem('kasteplan_nextimg');sessionStorage.removeItem('kasteplan_nextimg')}catch(e){}
const V=(a,b)=>[b[0]-a[0],b[1]-a[1]],len=v=>Math.hypot(v[0],v[1]),dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
function planGeo(){const p=S.plan;if(!PLANIMG||!p.cal||!p.cal.b||!p.scr||!p.scr.b)return null;
  const sc=len(V(p.cal.a,p.cal.b))/Math.max(.01,p.calM);if(!(sc>0))return null;
  const A=p.scr.a,B=p.scr.b,ab=V(A,B),L=len(ab);if(L<2)return null;const u=[ab[0]/L,ab[1]/L],n=[-u[1]*ZS(),u[0]*ZS()],C=[(A[0]+B[0])/2,(A[1]+B[1])/2];
  return {sc,A,B,u,n,C,wM:L/sc,at:(x,d)=>[C[0]+u[0]*x*sc+n[0]*d*sc,C[1]+u[1]*x*sc+n[1]*d*sc]}}
const planActive=()=>S.venue!=='immersive'&&S.venue!=='golf'&&!!(S.plan.use&&planGeo());
function syncPlan(){const g=planActive()&&planGeo();if(!g)return;const h=S.cw*g.sc/2;   // lærredet på tegningen følger billedbredden i 01
  S.plan.scr.a=[g.C[0]-g.u[0]*h,g.C[1]-g.u[1]*h];S.plan.scr.b=[g.C[0]+g.u[0]*h,g.C[1]+g.u[1]*h]}
/* 1 · Målestok: én linje over et kendt mål (calM) giver pixels pr. meter – alt andet måles ud fra pixels.
   2 · Rum: en firkant langs indervæggene (room, i billedets pixels) + lærredsvæggen (wall) → rummets bredde og længde i 02 (og 09/10) */
function roomEdges(R,w){const T=[[R.x0,R.y0],[R.x1,R.y0]],B=[[R.x0,R.y1],[R.x1,R.y1]],L=[[R.x0,R.y0],[R.x0,R.y1]],Rt=[[R.x1,R.y0],[R.x1,R.y1]];
  return ({top:{scr:T,side:Rt,inn:[0,1]},bottom:{scr:B,side:Rt,inn:[0,-1]},left:{scr:L,side:B,inn:[1,0]},right:{scr:Rt,side:B,inn:[-1,0]}})[w]||{scr:T,side:Rt,inn:[0,1]}}
function planRoomM(){const p=S.plan,sc=planScale();if(!p.room||!(sc>0))return null;const E=roomEdges(p.room,p.wall);return {w:len(V(...E.scr))/sc,d:len(V(...E.side))/sc,E}}
function applyPlanRoom(){const p=S.plan;if(S.venue==='immersive'||S.venue==='golf')return false;let ch=false;const m=planRoomM();
  if(m){const w=Math.round(m.w*100)/100,d=Math.round(m.d*100)/100;if(w>=2&&Math.abs(S.rw-w)>1e-6){S.rw=w;ch=true}if(d>=2&&Math.abs(S.rd-d)>1e-6){S.rd=d;ch=true}}
  if(p.calH>=2&&Math.abs(S.rh-p.calH)>1e-6){S.rh=Math.round(p.calH*100)/100;ch=true}
  return ch}
// rettes rummets bredde/længde i tallet, bliver den væg målestok (som før: rumbredden giver målestokken)
function setRoomDim(k,v){const p=S.plan;if(!p.room||!(v>0))return;const E=roomEdges(p.room,p.wall)[k];p.cal={a:E[0].slice(),b:E[1].slice()};p.calM=v;applyPlanRoom()}
// et punkt holdes inde i rum-firkanten (lærredets punkter)
const clampRoom=q=>{const R=S.plan.room;return R?[Math.max(R.x0,Math.min(R.x1,q[0])),Math.max(R.y0,Math.min(R.y1,q[1]))]:q};
// projektor(er) inde i rummet: kabinettet (set ovenfra) skal ligge inden for rum-firkanten – ikke ved bagprojektion (bag scenen)
function pjInRoom(){const R=S.plan.room,g=planGeo();if(!R||!g||REAR()||!planActive())return true;const r=calc(),B=r.B,t=1;
  return r.pjs.every(pj=>[[B.x0,B.z0],[B.x1,B.z0],[B.x0,B.z1],[B.x1,B.z1]].every(([x,z])=>{const q=g.at(pj.lx+x,S.L+z);return q[0]>=R.x0-t&&q[0]<=R.x1+t&&q[1]>=R.y0-t&&q[1]<=R.y1+t}))}
const PLANZ=[0.25,0.33,0.5,0.67,0.8,1,1.25,1.5,2,3,4];   // zoomtrin for plantegningen
// må punkterne flyttes i det aktuelle trin? Lærredet kan også flyttes/roteres i trin 4 (projektoren følger med, bredden bevares)
const planEdit=c=>{const t=S.plan.tool;return c==='scr'?t==='scr'||t==='pj':c==='cal'?t==='cal':c==='room'?t==='room':c==='ruler'?t==='ruler':false};
const planScale=()=>{const p=S.plan;return p.cal&&p.cal.b&&p.calM>0?len(V(p.cal.a,p.cal.b))/p.calM:0};
// «fang streger»: punktet lægges på nærmeste mørke pixel inden for ca. 7 skærm-pixels (Shift slår det fra og låser i stedet vinklen)
let PLANPIX=null,PLANLOUPE=null,RULSEL=-1;
function planPixLoad(){const src=PLANIMG;if(!src){PLANPIX=null;return}if(PLANPIX&&PLANPIX.src===src)return;PLANPIX={src};const im=new Image();
  im.onload=()=>{if(PLANIMG!==src)return;const W=S.plan.w||im.naturalWidth,H=S.plan.h||im.naturalHeight,f=Math.min(1,2500/Math.max(W,H)),w=Math.max(1,Math.round(W*f)),h=Math.max(1,Math.round(H*f));
    try{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);
      const D=x.getImageData(0,0,w,h).data,L=new Uint8Array(w*h);for(let i=0;i<w*h;i++)L[i]=(D[4*i]*77+D[4*i+1]*150+D[4*i+2]*29)>>8;PLANPIX={src,w,h,f,L}}catch(e){}};im.src=src}
const planPxPerScreen=()=>{const m=$('planSvg').getScreenCTM();return m&&m.a?1/m.a:1};
function planSnap(q,e){const P=PLANPIX;if(!S.plan.snap||(e&&e.shiftKey)||!P||!P.L)return q;const R=Math.max(2,Math.round(7*planPxPerScreen()*P.f)),cx=Math.round(q[0]*P.f),cy=Math.round(q[1]*P.f);let best=null,bd=1e18;
  for(let y=Math.max(0,cy-R);y<=Math.min(P.h-1,cy+R);y++)for(let x=Math.max(0,cx-R);x<=Math.min(P.w-1,cx+R);x++)if(P.L[y*P.w+x]<110){const d=(x+.5-q[0]*P.f)**2+(y+.5-q[1]*P.f)**2;if(d<bd){bd=d;best=[(x+.5)/P.f,(y+.5)/P.f]}}
  return best||q}
// Shift: linjen låses til 0/45/90°
function angleLock(a,b,e){if(!e||!e.shiftKey)return b;const v=V(a,b),L=len(v),an=Math.round(Math.atan2(v[1],v[0])/(Math.PI/4))*(Math.PI/4);return [a[0]+Math.cos(an)*L,a[1]+Math.sin(an)*L]}
function svgPt(e){const svg=$('planSvg'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());return [q.x,q.y]}
function drawPlan(r){
  // et billede uden mål tæller ikke som indsat
  if(PLANIMG&&!(S.plan.w>0&&S.plan.h>0))PLANIMG=null;
  const p=S.plan,has=!!PLANIMG;$('dPlan').open=!!p.open;
  $('planEmpty').hidden=has;$('planSvg').style.display=has?'block':'none';
  document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===p.tool));
  // trin-guide: flueben på færdige trin, blinkende pil på det næste
  {const dn={cal:planScale()>0,room:!!p.room,scr:!!(p.scr&&p.scr.b&&planGeo()),pj:!!(p.pjSet&&planActive()),ruler:false};
   const nx=!has?'up':['cal','room','scr','pj'].find(k=>!dn[k]);
   $('planUp').classList.toggle('stepdone',has);['planUp','planUp2'].forEach(id=>$(id).classList.toggle('stepnext',!has));
   document.querySelectorAll('#planTools [data-tool]').forEach(b=>{const k=b.dataset.tool;b.classList.toggle('stepdone',has&&!!dn[k]);b.classList.toggle('stepnext',k===nx)})}
  if(has)planPixLoad();
  // målefelter pr. fane: 1 målestok · 2 rummets mål · 3 lærredets bredde · 4 projektorens afstand og sideforskydning · lineal
  $('calBox').hidden=!PLANIMG||p.tool!=='cal';$('roomBox').hidden=!PLANIMG||p.tool!=='room';$('rulBox').hidden=!PLANIMG||p.tool!=='ruler';
  $('scrBox').hidden=!PLANIMG||p.tool!=='scr'||!(p.scr&&p.scr.b);$('pjBox').hidden=!PLANIMG||p.tool!=='pj'||!planActive();
  $('planSnap').checked=!!p.snap;$('planSnap').closest('label').hidden=!PLANIMG||p.tool==='pj';
  {const sc=planScale(),m=planRoomM();
   if(!ptDrag)$('calAcc').textContent=sc>0?`1 px = ${f3(100/sc,1)} cm`:p.cal&&p.cal.b?'Skriv hvor lang linjen er':'';
   for(const [id,k] of [['planRw','w'],['calL','d']]){const el=$(id);el.disabled=!m;if(document.activeElement!==el)el.value=m?m[k].toFixed(2):''}
   document.querySelectorAll('[data-wall]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.wall===(p.wall||'top')));
   const rl=p.rulers||[];if(!ptDrag)$('rulList').textContent=rl.length?rl.map((q,i)=>`${i+1}: ${sc>0?f3(len(V(q.a,q.b))/sc,2)+' m':Math.round(len(V(q.a,q.b)))+' px'}`).join(' · '):'';if(!ptDrag)$('rulClr').hidden=!rl.length}
  {const sc=planScale(),wNow=planActive()?S.cw:p.scr&&p.scr.b&&sc>0?len(V(p.scr.a,p.scr.b))/sc:null;
   if(document.activeElement!==$('planCw'))$('planCw').value=wNow!=null?wNow.toFixed(3):'';$('planCw').disabled=!!S.lockW&&planActive();
   if(document.activeElement!==$('planL'))$('planL').value=S.L.toFixed(3);$('planL').disabled=!!S.lockL;
   if(document.activeElement!==$('planPx'))$('planPx').value=S.px.toFixed(3);$('planPx').disabled=!!p.lock||!!(S.blend&&r.N>1)}
$('planZoom').hidden=!has;if(document.activeElement!==$('calM'))$('calM').value=p.calM>0?p.calM:'';if(!ptDrag)$('calM').disabled=!(p.cal&&p.cal.b);if(document.activeElement!==$('calH'))$('calH').value=p.calH??'';
  $('planLock').checked=!!p.lock;$('planUse').checked=!!p.use;
  const g=planGeo();
  $('planCap').textContent=!has?'valgfri – indsæt en tegning og placér projektoren på den':planActive()?`styrer afstand ${f3(S.L)} m og bredde ${f3(S.cw)} m`:'indsat – ikke i brug';
  const sc1=planScale(),calL=p.cal&&p.cal.b?len(V(p.cal.a,p.cal.b)):0,diag=Math.hypot(p.w||0,p.h||0);
  const calTip=sc1>0&&calL<diag*0.2?'<span style="color:var(--warn)"> Linjen er kort i forhold til tegningen – brug et længere mål, hvis du har et, så bliver alle mål mere præcise.</span>':'';
  const roomOut=hitOn('room')?'<span style="color:var(--bad)"> Projektoren skal stå inde i rummet.</span>':'';
  const step=!has?'':p.tool==='ruler'?'<b>Lineal:</b> træk en linje for at måle en afstand på tegningen. Træk i punkterne for at rette den. Shift låser vinklen til 0/45/90°, Delete sletter den valgte.'+(sc1>0?'':'<span style="color:var(--bad)"> Lav først en målestok (1) – så viser linealen meter.</span>'):
    !sc1||p.tool==='cal'?'<b>1 · Målestok:</b> træk en linje hen over et mål du kender – fx en målsætning eller en væg – og skriv længden i feltet «Linjen er». Alle andre mål regnes ud fra den.'+calTip:
    !p.room||p.tool==='room'?'<b>2 · Rum:</b> træk en firkant fra hjørne til hjørne langs rummets indervægge – bredde og længde regnes ud og sættes i 02, 09 og 10. Klik på den væg, lærredet sidder på (orange). Højden kan skrives i feltet «Højde» (valgfri).':
    !p.scr||!p.scr.b||p.tool==='scr'?'<b>3 · Lærred:</b> tryk på lærredets venstre kant (set fra publikum) og træk hen til højre kant – længden vises i meter. Træk bagefter i de to punkter for at flytte eller rotere lærredet. Bredden kan også rettes under 01 «Billedbredde».':
    p.use?`<b>4 · Projektor:</b> klik eller træk projektoren på plads – den holder sig inde i rummet, inden for billedets bredde og optikkens zoom. Træk i lærredet for at flytte det, eller i dets punkter for at rotere det. Afstand <b>${f3(S.L)} m</b> · sideforskydning ${S.blend&&r.N>1?r.pjs.filter(q=>q.r===0).map(q=>f3(q.lx-q.tx)).join(' / ')+' m (træk hver projektor ud til siden inden for dens lens shift)':f3(S.px)+' m'} · lærred ${f3(g.wM)} m bredt (målestok ${f3(g.sc,1)} px/m)`+roomOut:'Plantegningen er ikke i brug. Slå «Brug plantegningens mål» til.';
  $('planInfo').innerHTML=step;$('planInfo').hidden=!has;
  if(!has){$('planSvg').innerHTML='';return}
  // zoom: under 100 % vises luft omkring tegningen (større viewBox), over 100 % bliver tegningen bredere og kan rulles
  const W=p.w,H=p.h,z=PLANZ[Math.max(0,Math.min(PLANZ.length-1,PLANZ.indexOf(p.zoom)<0?PLANZ.indexOf(1):PLANZ.indexOf(p.zoom)))],k=Math.max(W,H)/900/z;
  const vw=z<1?W/z:W,vh=z<1?H/z:H;let vx=(W-vw)/2,vy=(H-vh)/2;
  const ov=drawPlan.vb;if(z<1&&ov&&ov.z===z&&ov.w===W&&ov.h===H){vx=ov.x;vy=ov.y}   // udsnittet flyttes kun, når der zoomes – ikke mens man trækker
  else if(z<1&&g&&p.use){let x0=0,y0=0,x1=W,y1=H;for(const q of [g.at(S.px,(r.outBack??S.L)+0.6),g.at(S.px,(r.outFront??S.L)-0.3)]){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}
    // midt i tegning + projektor, men hele tegningen holdes inde når der er plads
    const cx=(x0+x1)/2,cy=(y0+y1)/2;vx=Math.min(0,Math.max(W-vw,cx-vw/2));vy=Math.min(0,Math.max(H-vh,cy-vh/2))}drawPlan.vb={x:vx,y:vy,z,w:W,h:H};$('planSvg').setAttribute('viewBox',`${vx} ${vy} ${vw} ${vh}`);$('planSvg').style.width=z>1?z*100+'%':'';
  {const st=$('planStage');st.style.height=z>1?Math.round(st.clientWidth*H/W)+'px':''}   // indzoomet: samme højde som ved 100 %, resten rulles
  $('planZv').textContent=Math.round(z*100)+' %';document.querySelector('[data-pz="-1"]').disabled=z<=PLANZ[0];document.querySelector('[data-pz="1"]').disabled=z>=PLANZ[PLANZ.length-1];
  let s=`<defs><marker id="par" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#0B6E9C"/></marker></defs>${z<1?`<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#E9ECF0"/>`:''}<image href="${PLANIMG}" x="0" y="0" width="${W}" height="${H}"/>`;
  const dot2=(q,c)=>`<circle cx="${q[0]}" cy="${q[1]}" r="${5*k}" fill="${c}" stroke="#fff" stroke-width="${1.5*k}"/>`;
  const tag=(x,y,t,c='#0B6E9C')=>{const w=TW(t)*7*k+10*k;return `<g transform="translate(${x},${y})"><rect x="${-w/2}" y="${-10*k}" width="${w}" height="${20*k}" rx="${4*k}" fill="#fff" stroke="${c}" stroke-width="${k}"/><text x="0" y="${4.5*k}" text-anchor="middle" style="font-size:${12*k}px;fill:${c};font-family:var(--f-mono);font-weight:600">${esc(t)}</text></g>`};
  // rummet: stiplet firkant, lærredsvæggen orange, bredde langs lærredsvæggen og længde væk fra den
  if(p.room){const R=p.room,E=roomEdges(R,p.wall),m=planRoomM();
    s+=`<rect x="${Math.min(R.x0,R.x1)}" y="${Math.min(R.y0,R.y1)}" width="${Math.abs(R.x1-R.x0)}" height="${Math.abs(R.y1-R.y0)}" fill="#7A3FB0" fill-opacity=".06" stroke="#7A3FB0" stroke-width="${2*k}" stroke-dasharray="${8*k} ${5*k}" pointer-events="none"/>`;
    s+=`<line x1="${E.scr[0][0]}" y1="${E.scr[0][1]}" x2="${E.scr[1][0]}" y2="${E.scr[1][1]}" stroke="#D98300" stroke-width="${5*k}" stroke-opacity=".85" pointer-events="none"/>`;
    if(m){const ms=[E.scr[0][0]*.8+E.scr[1][0]*.2,E.scr[0][1]*.8+E.scr[1][1]*.2],md=[(E.side[0][0]+E.side[1][0])/2,(E.side[0][1]+E.side[1][1])/2];
      s+=tag(ms[0]+E.inn[0]*24*k,ms[1]+E.inn[1]*24*k,`rum bredde ${f3(m.w,2)} m`,'#D98300')+tag(md[0]-(E.inn[0]?0:70*k),md[1]-(E.inn[0]?26*k:0),`længde ${f3(m.d,2)} m`,'#7A3FB0')}}
  // linealer
  (p.rulers||[]).forEach((q,i)=>{const c=i===RULSEL?'#D98300':'#17834F',sc=planScale(),L=len(V(q.a,q.b));
    s+=`<line x1="${q.a[0]}" y1="${q.a[1]}" x2="${q.b[0]}" y2="${q.b[1]}" stroke="${c}" stroke-width="${2*k}" pointer-events="none"/>`+dot2(q.a,c)+dot2(q.b,c)+tag((q.a[0]+q.b[0])/2,(q.a[1]+q.b[1])/2-16*k,sc>0?`${f3(L/sc,2)} m`:`${Math.round(L)} px`,c)});
  if(p.cal){s+=dot2(p.cal.a,'#0B6E9C');if(p.cal.b){s+=`<line x1="${p.cal.a[0]}" y1="${p.cal.a[1]}" x2="${p.cal.b[0]}" y2="${p.cal.b[1]}" stroke="#0B6E9C" stroke-width="${2.5*k}" stroke-dasharray="${8*k} ${4*k}"/>`+dot2(p.cal.b,'#0B6E9C')+tag((p.cal.a[0]+p.cal.b[0])/2,(p.cal.a[1]+p.cal.b[1])/2-16*k,p.calM>0?`målestok ${f3(p.calM,2)} m`:'skriv længden','#0B6E9C')}}
  if(p.scr){const a=p.scr.a,b=p.scr.b;
    if(b){s+=`<line class="scrline" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#111" stroke-width="${6*k}" stroke-linecap="round"/>`;
      const sc0=planScale(),lp=len(V(a,b));if(sc0>0&&lp>2&&!(g&&p.use)){const nx=-(b[1]-a[1])/lp,ny=(b[0]-a[0])/lp;s+=tag((a[0]+b[0])/2-nx*22*k,(a[1]+b[1])/2-ny*22*k,`lærred ${f3(lp/sc0)} m`,'#111')}}
  }
  if(g&&p.use){
    const sc=g.sc,P=g.at,poly=a=>a.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
    // zoomområde
    // tilladt område: zoom (frem/tilbage) × vandret lens shift (sidelæns, ved den aktuelle lodrette shift) – projektorens kabinet holder sig inden for den lyseblå firkant
    {const lo=Math.min(r.Lw,r.Lt),hi=Math.max(r.Lw,r.Lt),B=r.B,hw=(B.x1-B.x0)/2;let x0=S.px,x1=S.px;
     let BRX=null;if(S.blend&&r.N>1){const lim=bdxRange(r);const z0=lo+B.z0,z1=hi+B.z1;
       r.pjs.filter(pj=>pj.r===0).forEach(pj=>{let a=pj.lx,b=pj.lx;if(lim){const [m0,m1]=lim(pj.c);a=pj.tx+(S.px-r.cx)+m0;b=pj.tx+(S.px-r.cx)+m1}const box=[P(a-hw,z0),P(b+hw,z0),P(b+hw,z1),P(a-hw,z1)];BRX=Math.max(BRX??-1e9,b+hw);
         s+=`<polygon points="${poly(box)}" fill="#62C9EC" fill-opacity=".16" stroke="#0B6E9C" stroke-width="${1.2*k}" stroke-dasharray="${6*k} ${4*k}"/>`});x0=x1=S.px}
     else if(r.P.length){const hr=shRange(r.sv,r.P);if(hr){const a=r.cx-r.inv*(hr[0]+r.th)*r.Ws,b2=r.cx-r.inv*(hr[1]+r.th)*r.Ws;x0=Math.min(a,b2);x1=Math.max(a,b2)}}else{x0=x1=0}
     const z0=lo+B.z0,z1=hi+B.z1,box=[P(x0-hw,z0),P(x1+hw,z0),P(x1+hw,z1),P(x0-hw,z1)];
     if(!(S.blend&&r.N>1))s+=`<polygon points="${poly(box)}" fill="#62C9EC" fill-opacity=".22" stroke="#0B6E9C" stroke-width="${1.4*k}" stroke-dasharray="${6*k} ${4*k}"/>`;
     const cl=P((x0+x1)/2,lo),cr=P((x0+x1)/2,hi);s+=`<line x1="${cl[0]}" y1="${cl[1]}" x2="${cr[0]}" y2="${cr[1]}" stroke="#0B6E9C" stroke-width="${1.2*k}" stroke-opacity=".7"/>`;
     const side=(BRX??(x1+hw))+0.25,ta=P(side,lo),tb=P(side,hi),off=TW('min 0,00 m')*3.5*k;
     s+=tag(ta[0]+g.u[0]*off,ta[1]+g.u[1]*off,`${r.fixed?'fast':'min'} ${f3(lo)} m`,'#0B6E9C');if(!r.fixed)s+=tag(tb[0]+g.u[0]*off,tb[1]+g.u[1]*off,`max ${f3(hi)} m`,'#0B6E9C');
     if(x1-x0>0.02){const tc=P((x0+x1)/2,z1+0.35);s+=tag(tc[0],tc[1],`shift ${f3(x0)}…${f3(x1)} m`,'#0B6E9C')}}
    // stablede enheder ligger oven på hinanden – set ovenfra tegnes kun den nederste i stakken, med et mærke
    r.pjs.forEach((pj,i)=>{if(pj.s)return;const lens=P(pj.lx,S.L),e1=P(pj.tx-r.W/2,0),e2=P(pj.tx+r.W/2,0);
      s+=`<polygon points="${poly([lens,e1,e2])}" fill="#F2A81D" fill-opacity=".22" stroke="#D98300" stroke-width="${1.2*k}"/>`;
      const B=r.B,bw=B.x1-B.x0,z1=S.L+B.z0,z2=S.L+B.z1;
      s+=`<g class="pjgrab" data-pj="${i}"><polygon points="${poly([P(pj.lx+B.x0,z1),P(pj.lx+B.x1,z1),P(pj.lx+B.x1,z2),P(pj.lx+B.x0,z2)])}" fill="#2F4D6C" stroke="#0F1821" stroke-width="${k}"/>`;
      if(r.kind==='n'){const lw=Math.min(bw*.35,.18);s+=`<polygon points="${poly([P(pj.lx-lw/2,S.L),P(pj.lx+lw/2,S.L),P(pj.lx+lw/2,z1),P(pj.lx-lw/2,z1)])}" fill="#4C719A"/>`}
      if(S.frame){s+=`<polygon points="${poly([P(pj.lx+r.F.x0,r.outFront),P(pj.lx+r.F.x1,r.outFront),P(pj.lx+r.F.x1,r.outBack),P(pj.lx+r.F.x0,r.outBack)])}" fill="none" stroke="#3F4B57" stroke-width="${2.2*k}"/>`}
      s+=`<circle cx="${lens[0]}" cy="${lens[1]}" r="${4*k}" fill="#D98300"/><circle cx="${P(pj.lx,(r.outFront+r.outBack)/2)[0]}" cy="${P(pj.lx,(r.outFront+r.outBack)/2)[1]}" r="${Math.max(14*k,bw*sc*.6)}" fill="transparent"/></g>`});
    if(r.stk>1)r.pjs.forEach(pj=>{if(pj.s)return;const q=P(pj.lx,r.outBack+0.3);s+=tag(q[0],q[1],`stak ${r.stk} × ${mm(r.outer[1])} mm`,'#3F4B57')});
    const m0=P(S.px,0),m1=P(S.px,S.L);const off=-(r.body[0]/2+.35)*sc;const d0=[m0[0]+g.u[0]*off,m0[1]+g.u[1]*off],d1=[m1[0]+g.u[0]*off,m1[1]+g.u[1]*off];
    s+=`<line x1="${d0[0]}" y1="${d0[1]}" x2="${d1[0]}" y2="${d1[1]}" stroke="#0B6E9C" stroke-width="${1.5*k}" marker-start="url(#par)" marker-end="url(#par)"/>`+tag((d0[0]+d1[0])/2,(d0[1]+d1[1])/2,`L ${f3(S.L)} m`);
    s+=tag(g.C[0]-g.n[0]*22*k,g.C[1]-g.n[1]*22*k,`lærred ${f3(g.wM)} m`,'#111');
    const ok=r.zoomOK&&r.shOK&&r.sizeOK;{const q=P(r.pjs[0].lx-r.body[0]/2,(r.outFront+r.outBack)/2);const t0=ok?'✓ placering virker':(!r.zoomOK?'✗ uden for zoom':'✗ tjek shift/størrelse');const ww=(t0.length*7+10)*k/2+12*k;s+=tag(q[0]-g.u[0]*ww,q[1]-g.u[1]*ww,t0,ok?'#17834F':'#C23A22')}
  }
  // lærredets greb øverst, så de altid kan rammes (flyt hele lærredet / træk i punkterne for at rotere)
  // målestoks-linjerne kan trækkes: endepunkter (ret) og selve linjen (flyt)
  // punkterne kan kun flyttes i deres eget trin (Tegn bredde / Tegn længde / 2 · Lærred) – ellers kan man klikke oven i dem
  {const L=p.cal;if(L&&L.b&&planEdit('cal')){s+=`<line class="calline" data-c="cal" x1="${L.a[0]}" y1="${L.a[1]}" x2="${L.b[0]}" y2="${L.b[1]}" stroke="transparent" stroke-width="${16*k}"/>`;
    for(const e of ['a','b'])s+=`<g class="calh" data-c="cal" data-end="${e}"><circle cx="${L[e][0]}" cy="${L[e][1]}" r="${14*k}" fill="transparent"/><circle cx="${L[e][0]}" cy="${L[e][1]}" r="${6*k}" fill="#fff" stroke="#0B6E9C" stroke-width="${2.5*k}"/></g>`}}
  // rummets vægge (klik = lærredsvæg) og hjørner (træk)
  if(p.room&&planEdit('room')){const R=p.room,W4={top:[[R.x0,R.y0],[R.x1,R.y0]],bottom:[[R.x0,R.y1],[R.x1,R.y1]],left:[[R.x0,R.y0],[R.x0,R.y1]],right:[[R.x1,R.y0],[R.x1,R.y1]]};
    for(const w in W4){const [a,b]=W4[w];s+=`<line class="roomedge" data-wall="${w}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="transparent" stroke-width="${14*k}"/>`}
    for(const c of ['00','10','01','11']){const x=c[0]==='0'?R.x0:R.x1,y=c[1]==='0'?R.y0:R.y1;s+=`<g class="roomh" data-c="${c}"><circle cx="${x}" cy="${y}" r="${14*k}" fill="transparent"/><rect x="${x-5*k}" y="${y-5*k}" width="${10*k}" height="${10*k}" fill="#fff" stroke="#7A3FB0" stroke-width="${2.5*k}"/></g>`}}
  if(planEdit('ruler'))(p.rulers||[]).forEach((q,i)=>{s+=`<line class="rulline" data-i="${i}" x1="${q.a[0]}" y1="${q.a[1]}" x2="${q.b[0]}" y2="${q.b[1]}" stroke="transparent" stroke-width="${14*k}"/>`;
    for(const e of ['a','b'])s+=`<g class="rulh" data-i="${i}" data-end="${e}"><circle cx="${q[e][0]}" cy="${q[e][1]}" r="${12*k}" fill="transparent"/></g>`});
  if(p.scr){const a=p.scr.a,b=p.scr.b,on=planEdit('scr');if(b&&on)s+=`<line class="scrline" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="transparent" stroke-width="${18*k}"/>`;
    for(const [q,e] of [[a,'a'],[b,'b']])if(q)s+=on?`<g class="scrh" data-end="${e}"><circle cx="${q[0]}" cy="${q[1]}" r="${16*k}" fill="transparent"/><circle cx="${q[0]}" cy="${q[1]}" r="${7*k}" fill="#fff" stroke="#111" stroke-width="${2.5*k}"/></g>`:`<circle cx="${q[0]}" cy="${q[1]}" r="${4*k}" fill="#fff" stroke="#111" stroke-width="${2*k}" pointer-events="none"/>`}
  drawPlan.vb={...drawPlan.vb,vw,vh};
  $('planSvg').innerHTML=s+'<g id="plLoupe" pointer-events="none"></g>';planLoupeDraw();
}
// lup: 4× forstørret udsnit med sigtekorn – vises mens man sigter (før første klik) og mens et punkt trækkes; tegnes alene, så musebevægelser ikke tegner hele appen om
function planLoupeDraw(){const el=$('plLoupe');if(!el)return;if(!ptDrag&&!scrDraw&&!['cal','room','ruler','scr'].includes(S.plan.tool))PLANLOUPE=null;const q=PLANLOUPE,v=drawPlan.vb;if(!q||!PLANIMG||!v){el.style.display='none';return}el.style.display='';
  const kp=planPxPerScreen(),R=60*kp,Z=4,off=95*kp;let cx=q[0]+off,cy=q[1]-off;if(cx+R>v.x+v.vw)cx=q[0]-off;if(cy-R<v.y)cy=q[1]+off;
  // billedet sættes kun ind én gang pr. tegning – ved musebevægelser flyttes kun lup og sigtekorn
  if(!el.firstChild){el.innerHTML=`<circle class="lpt" fill="none" stroke="#D98300"/><clipPath id="plp"><circle class="lcl"/></clipPath><g clip-path="url(#plp)"><rect class="lbg" fill="#fff"/><image class="lim" x="0" y="0" width="${S.plan.w}" height="${S.plan.h}" style="image-rendering:pixelated"/></g><circle class="lrim" fill="none" stroke="#D98300"/><path class="lx" stroke="#D98300"/>`;el.querySelector('.lim').setAttribute('href',PLANIMG)}
  const A=(c,o)=>{const n=el.querySelector(c);for(const k in o)n.setAttribute(k,o[k])};
  A('.lpt',{cx:q[0],cy:q[1],r:4*kp,'stroke-width':1.5*kp});A('.lcl',{cx,cy,r:R});A('.lbg',{x:cx-R,y:cy-R,width:2*R,height:2*R});A('.lim',{transform:`translate(${cx-q[0]*Z},${cy-q[1]*Z}) scale(${Z})`});
  A('.lrim',{cx,cy,r:R,'stroke-width':2*kp});A('.lx',{d:`M${cx-R},${cy}H${cx-5*kp}M${cx+5*kp},${cy}H${cx+R}M${cx},${cy-R}V${cy-5*kp}M${cx},${cy+5*kp}V${cy+R}`,'stroke-width':kp})}
function planLoad(file){if(!file)return;
  const done=url=>{const im=new Image();im.onload=()=>{PLANIMG=url;S.plan={...S.plan,w:im.naturalWidth,h:im.naturalHeight,cal:null,calM:0,room:null,rulers:[],scr:null,tool:'cal',open:true,pjSet:false};RULSEL=-1;render()};im.src=url};
  if(/pdf/i.test(file.type)||/\.pdf$/i.test(file.name)){
    $('planInfo').hidden=false;$('planInfo').textContent='Læser PDF…';
    const go=async()=>{try{const lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;const pg=await pdf.getPage(1);const vp0=pg.getViewport({scale:1});const vp=pg.getViewport({scale:Math.min(3,2400/Math.max(vp0.width,vp0.height))});
      const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:ctx,viewport:vp}).promise;done(c.toDataURL('image/jpeg',.9))}
      catch(e){$('planInfo').textContent='PDF’en kunne ikke læses. Gem første side som PNG eller JPG og indsæt den i stedet.'}};
    if(window.pdfjsLib)go();else{const a=document.createElement('script');a.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';a.onload=()=>{const b=document.createElement('script');b.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';b.onload=go;b.onerror=()=>{$('planInfo').textContent='PDF-læseren kunne ikke hentes. Indsæt tegningen som PNG eller JPG.'};document.head.appendChild(b)};a.onerror=a.onload;document.head.appendChild(a)}
  }else{const fr=new FileReader();fr.onload=()=>done(fr.result);fr.readAsDataURL(file)}}
let planDrag=null,planRaf=0,planOff=[0,0];
function planMove(q){const o={L:S.L,px:S.px,bdx:JSON.stringify(S.bdx||{}),li:S.li},in0=pjInRoom();planMove0(q);
  // projektoren må ikke komme uden for rummet: stop ved væggen (halvering mellem gammel og ny placering)
  if(in0&&!pjInRoom()&&S.li===o.li){const n={L:S.L,px:S.px},nb=S.bdx;S.bdx=JSON.parse(o.bdx);const set=t=>{S.L=o.L+(n.L-o.L)*t;S.px=o.px+(n.px-o.px)*t};
    let lo=0,hi=1;for(let i=0;i<14;i++){const m=(lo+hi)/2;set(m);if(pjInRoom())lo=m;else hi=m}set(lo);S.L=Math.round(S.L*1000)/1000;
    if(nb&&JSON.stringify(nb)!==o.bdx){const keep=S.bdx;S.bdx=nb;if(!pjInRoom())S.bdx=keep}hit('room')}}
function planMove0(q){const g=planGeo();if(!g)return;S.plan.pjSet=true;q=[q[0]-planOff[0],q[1]-planOff[1]];const d=V(g.C,q);{const z=dot(d,g.n)/g.sc;autoLens(z,S.py);   // som i 10: træk ud over zoomen skifter optik
    const lim=lensLimits();if(z>DEPTH()-.2)hit('depth');S.L=Math.round(Math.max(lim.lo,Math.min(lim.hi,Math.max(.2,Math.min(DEPTH()-.2,z))))*1000)/1000;if(S.L<lim.lo||S.L>lim.hi)S.L=Math.max(lim.lo,Math.min(lim.hi,S.L))};
  if(S.blend&&planDrag&&planDrag.i!=null&&!S.plan.lock){const r=calc(),pj=r.pjs[planDrag.i];const lim=bdxRange(r);if(pj&&lim){const [a,b]=lim(pj.c);const want=dot(d,g.u)/g.sc-pj.tx-(S.px-r.cx);S.bdx={...(S.bdx||{}),[pj.c]:Math.round(Math.max(a,Math.min(b,want))*1000)/1000};if(want<a-1e-3||want>b+1e-3)hit('shift')}}
  else if(!S.plan.lock&&!S.blend)guardShift({px:S.px},{px:dot(d,g.u)/g.sc});else if(S.plan.lock){S.px=0;S.bdx={}}
  if(!planRaf)planRaf=requestAnimationFrame(()=>{planRaf=0;render()})}
/* Lens shift-vagt: en ændring (py, px, sb …) må ikke føre billedet uden for optikkens shift-område.
   Er udgangspunktet gyldigt, stoppes bevægelsen ved kanten (halvering mellem gammel og ny værdi). */
function guardShift(old,nw){const keys=Object.keys(nw);const set=t=>keys.forEach(k=>S[k]=old[k]+(nw[k]-old[k])*t);
  set(0);const r0=calc();if((!r0.P.length&&!r0.kon)||!r0.shOK){set(1);return true}
  set(1);if(calc().shOK)return true;
  let lo=0,hi=1;for(let i=0;i<14;i++){const m=(lo+hi)/2;set(m);if(calc().shOK)lo=m;else hi=m}set(lo);hit('shift');return false}
/* Grænser for træk: afstand inden for optikkens zoom (Panasonic L-formel), højde inden for lens shift */
function lensLimits(){const r=calc();let lo=Math.min(r.Lw,r.Lt),hi=Math.max(r.Lw,r.Lt);if(S.lockL){lo=hi=S.L}return {lo,hi,py:r.P.length?r.pyRange:null}}
