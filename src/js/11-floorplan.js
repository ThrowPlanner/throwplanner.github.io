/* ===== PLANTEGNING ===== */
let PLANIMG=null;try{PLANIMG=localStorage.getItem('kasteplan_planimg')}catch(e){}
const V=(a,b)=>[b[0]-a[0],b[1]-a[1]],len=v=>Math.hypot(v[0],v[1]),dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
function planGeo(){const p=S.plan;if(!PLANIMG||!p.cal||!p.cal.b||!p.scr||!p.scr.b)return null;
  const sc=len(V(p.cal.a,p.cal.b))/Math.max(.01,p.calM);if(!(sc>0))return null;
  const A=p.scr.a,B=p.scr.b,ab=V(A,B),L=len(ab);if(L<2)return null;const u=[ab[0]/L,ab[1]/L],n=[-u[1]*ZS(),u[0]*ZS()],C=[(A[0]+B[0])/2,(A[1]+B[1])/2];
  return {sc,A,B,u,n,C,wM:L/sc,at:(x,d)=>[C[0]+u[0]*x*sc+n[0]*d*sc,C[1]+u[1]*x*sc+n[1]*d*sc]}}
const planActive=()=>S.venue!=='immersive'&&S.venue!=='golf'&&!!(S.plan.use&&planGeo());
function syncPlan(){const g=planActive()&&planGeo();if(!g)return;const h=S.cw*g.sc/2;   // lærredet på tegningen følger billedbredden i 01
  S.plan.scr.a=[g.C[0]-g.u[0]*h,g.C[1]-g.u[1]*h];S.plan.scr.b=[g.C[0]+g.u[0]*h,g.C[1]+g.u[1]*h]}
// 1 · Målestok: bredde (giver målestokken), længde og evt. højde → rummets mål i 02 (og dermed 09 og 10)
function applyPlanRoom(){const p=S.plan;if(S.venue==='immersive'||S.venue==='golf')return;let ch=false;
  if(p.cal&&p.cal.b&&p.calM>=2&&Math.abs(S.rw-p.calM)>1e-6){S.rw=Math.round(p.calM*100)/100;ch=true}
  if(p.cal2&&p.cal2.b&&p.calL>=2&&Math.abs(S.rd-p.calL)>1e-6){S.rd=Math.round(p.calL*100)/100;ch=true}
  if(p.calH>=2&&Math.abs(S.rh-p.calH)>1e-6){S.rh=Math.round(p.calH*100)/100;ch=true}
  return ch}
const planScale=()=>{const p=S.plan;return p.cal&&p.cal.b?len(V(p.cal.a,p.cal.b))/Math.max(.01,p.calM):0};
function svgPt(e){const svg=$('planSvg'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());return [q.x,q.y]}
function drawPlan(r){
  const p=S.plan,has=!!PLANIMG;$('dPlan').open=!!p.open;
  $('planEmpty').hidden=has;$('planSvg').style.display=has?'block':'none';
  document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===p.tool));
  $('calBox').hidden=!PLANIMG;if(document.activeElement!==$('calM'))$('calM').value=p.calM;if(document.activeElement!==$('calL'))$('calL').value=p.calL??'';if(document.activeElement!==$('calH'))$('calH').value=p.calH??'';
  const cst=p.calStep||'w';document.querySelectorAll('[data-cal]').forEach(b=>b.setAttribute('aria-pressed',p.tool==='cal'&&b.dataset.cal===cst));
  $('planLock').checked=!!p.lock;$('planUse').checked=!!p.use;
  const g=planGeo();
  $('planCap').textContent=!has?'valgfri – indsæt en tegning og placér projektoren på den':planActive()?`styrer afstand ${f2(S.L)} m og bredde ${f2(S.cw)} m`:'indsat – ikke i brug';
  const sc1=planScale(),chk=p.cal2&&p.cal2.b&&sc1>0&&p.calL>0?len(V(p.cal2.a,p.cal2.b))/sc1:null,chkTxt=chk&&Math.abs(chk-p.calL)/p.calL>.05?` <span style="color:var(--bad)">Længden måler ${f2(chk)} m på tegningen med breddens målestok – tjek tallene eller tegningen.</span>`:'';
  const step=!has?'':!p.cal||!p.cal.b||(p.tool==='cal'&&cst==='w')?'<b>1 · Målestok – bredde:</b> klik på rummets to sidevægge (på tværs af rummet) og skriv bredden i meter i feltet «Bredde».':
    p.tool==='cal'&&cst==='l'?'<b>1 · Målestok – længde:</b> klik på forvæggen og bagvæggen (på langs af rummet) og skriv længden i feltet «Længde». Højden kan skrives i feltet «Højde» (valgfri). Rummets mål i 02, 09 og 10 opdateres med det samme.'+chkTxt:
    p.tool==='cal'?'<b>1 · Målestok:</b> bredde og længde er sat'+(p.calH?' – og højden':' – skriv evt. højden i feltet «Højde»')+'. Tryk derefter på «2 · Lærred».'+chkTxt:
    !p.scr||!p.scr.b||p.tool==='scr'?'<b>2 · Lærred:</b> tryk på lærredets venstre kant (set fra publikum) og træk hen til højre kant – længden vises i meter. Træk bagefter i de to punkter for at flytte eller rotere lærredet. Bredden kan også rettes under 01 «Billedbredde».':
    p.use?`<b>3 · Projektor:</b> klik eller træk projektoren på plads – den holder sig inden for billedets bredde og optikkens zoom. Afstand <b>${f2(S.L)} m</b> · sideforskydning ${S.blend&&r.N>1?r.pjs.filter(q=>q.r===0).map(q=>f2(q.lx-q.tx)).join(' / ')+' m (træk hver projektor ud til siden inden for dens lens shift)':f2(S.px)+' m'} · lærred ${f2(g.wM)} m bredt (målestok ${f2(g.sc,1)} px/m)`:'Plantegningen er ikke i brug. Slå «Brug plantegningens mål» til.';
  $('planInfo').innerHTML=step;$('planInfo').hidden=!has;
  if(!has){$('planSvg').innerHTML='';return}
  const W=p.w,H=p.h,k=Math.max(W,H)/900;$('planSvg').setAttribute('viewBox',`0 0 ${W} ${H}`);
  let s=`<defs><marker id="par" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#0B6E9C"/></marker></defs><image href="${PLANIMG}" x="0" y="0" width="${W}" height="${H}"/>`;
  const dot2=(q,c)=>`<circle cx="${q[0]}" cy="${q[1]}" r="${5*k}" fill="${c}" stroke="#fff" stroke-width="${1.5*k}"/>`;
  const tag=(x,y,t,c='#0B6E9C')=>{const w=TW(t)*7*k+10*k;return `<g transform="translate(${x},${y})"><rect x="${-w/2}" y="${-10*k}" width="${w}" height="${20*k}" rx="${4*k}" fill="#fff" stroke="${c}" stroke-width="${k}"/><text x="0" y="${4.5*k}" text-anchor="middle" style="font-size:${12*k}px;fill:${c};font-family:var(--f-mono);font-weight:600">${esc(t)}</text></g>`};
  if(p.cal2){s+=dot2(p.cal2.a,'#7A3FB0');if(p.cal2.b){s+=`<line x1="${p.cal2.a[0]}" y1="${p.cal2.a[1]}" x2="${p.cal2.b[0]}" y2="${p.cal2.b[1]}" stroke="#7A3FB0" stroke-width="${2*k}" stroke-dasharray="${6*k} ${4*k}"/>`+dot2(p.cal2.b,'#7A3FB0')+tag(p.cal2.a[0]+(p.cal2.b[0]-p.cal2.a[0])*.22+30*k,p.cal2.a[1]+(p.cal2.b[1]-p.cal2.a[1])*.22,`${f2(p.calL||0)} m`,'#7A3FB0')}}
  if(p.cal){s+=dot2(p.cal.a,'#0B6E9C');if(p.cal.b){s+=`<line x1="${p.cal.a[0]}" y1="${p.cal.a[1]}" x2="${p.cal.b[0]}" y2="${p.cal.b[1]}" stroke="#0B6E9C" stroke-width="${2*k}" stroke-dasharray="${6*k} ${4*k}"/>`+dot2(p.cal.b,'#0B6E9C')+tag(p.cal.a[0]+(p.cal.b[0]-p.cal.a[0])*.22,p.cal.a[1]+(p.cal.b[1]-p.cal.a[1])*.22-14*k,`${f2(p.calM)} m`)}}
  if(p.scr){const a=p.scr.a,b=p.scr.b;
    if(b){s+=`<line class="scrline" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#111" stroke-width="${6*k}" stroke-linecap="round"/>`;
      const sc0=planScale(),lp=len(V(a,b));if(sc0>0&&lp>2&&!(g&&p.use)){const nx=-(b[1]-a[1])/lp,ny=(b[0]-a[0])/lp;s+=tag((a[0]+b[0])/2-nx*22*k,(a[1]+b[1])/2-ny*22*k,`lærred ${f2(lp/sc0)} m`,'#111')}}
  }
  if(g&&p.use){
    const sc=g.sc,P=g.at,poly=a=>a.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
    // zoomområde
    // tilladt område: zoom (frem/tilbage) × vandret lens shift (sidelæns, ved den aktuelle lodrette shift) – projektorens kabinet holder sig inden for den lyseblå firkant
    {const lo=Math.min(r.Lw,r.Lt),hi=Math.max(r.Lw,r.Lt),B=r.B,hw=(B.x1-B.x0)/2;let x0=S.px,x1=S.px;
     let BRX=null;if(S.blend&&r.N>1){const lim=bdxRange(r);const z0=lo+B.z0,z1=hi+B.z1;
       r.pjs.filter(pj=>pj.r===0).forEach(pj=>{let a=pj.lx,b=pj.lx;if(lim){const [m0,m1]=lim(pj.c);a=pj.tx+(S.px-r.cx)+m0;b=pj.tx+(S.px-r.cx)+m1}const box=[P(a-hw,z0),P(b+hw,z0),P(b+hw,z1),P(a-hw,z1)];BRX=Math.max(BRX??-1e9,b+hw);
         s+=`<polygon points="${poly(box)}" fill="#62C9EC" fill-opacity=".16" stroke="#0B6E9C" stroke-width="${1.2*k}" stroke-dasharray="${6*k} ${4*k}"/>`});x0=x1=S.px}
     else if(r.P.length){const hr=shRange(r.sv,r.P);if(hr){const a=r.cx-r.inv*(hr[0]+r.th)*r.W,b2=r.cx-r.inv*(hr[1]+r.th)*r.W;x0=Math.min(a,b2);x1=Math.max(a,b2)}}else{x0=x1=0}
     const z0=lo+B.z0,z1=hi+B.z1,box=[P(x0-hw,z0),P(x1+hw,z0),P(x1+hw,z1),P(x0-hw,z1)];
     if(!(S.blend&&r.N>1))s+=`<polygon points="${poly(box)}" fill="#62C9EC" fill-opacity=".22" stroke="#0B6E9C" stroke-width="${1.4*k}" stroke-dasharray="${6*k} ${4*k}"/>`;
     const cl=P((x0+x1)/2,lo),cr=P((x0+x1)/2,hi);s+=`<line x1="${cl[0]}" y1="${cl[1]}" x2="${cr[0]}" y2="${cr[1]}" stroke="#0B6E9C" stroke-width="${1.2*k}" stroke-opacity=".7"/>`;
     const side=(BRX??(x1+hw))+0.25,ta=P(side,lo),tb=P(side,hi),off=TW('min 0,00 m')*3.5*k;
     s+=tag(ta[0]+g.u[0]*off,ta[1]+g.u[1]*off,`${r.fixed?'fast':'min'} ${f2(lo)} m`,'#0B6E9C');if(!r.fixed)s+=tag(tb[0]+g.u[0]*off,tb[1]+g.u[1]*off,`max ${f2(hi)} m`,'#0B6E9C');
     if(x1-x0>0.02){const tc=P((x0+x1)/2,z1+0.35);s+=tag(tc[0],tc[1],`shift ${f2(x0)}…${f2(x1)} m`,'#0B6E9C')}}
    r.pjs.forEach((pj,i)=>{const lens=P(pj.lx,S.L),e1=P(pj.tx-r.W/2,0),e2=P(pj.tx+r.W/2,0);
      s+=`<polygon points="${poly([lens,e1,e2])}" fill="#F2A81D" fill-opacity=".22" stroke="#D98300" stroke-width="${1.2*k}"/>`;
      const B=r.B,bw=B.x1-B.x0,z1=S.L+B.z0,z2=S.L+B.z1;
      s+=`<g class="pjgrab" data-pj="${i}"><polygon points="${poly([P(pj.lx+B.x0,z1),P(pj.lx+B.x1,z1),P(pj.lx+B.x1,z2),P(pj.lx+B.x0,z2)])}" fill="#2F4D6C" stroke="#0F1821" stroke-width="${k}"/>`;
      if(r.kind==='n'){const lw=Math.min(bw*.35,.18);s+=`<polygon points="${poly([P(pj.lx-lw/2,S.L),P(pj.lx+lw/2,S.L),P(pj.lx+lw/2,z1),P(pj.lx-lw/2,z1)])}" fill="#4C719A"/>`}
      if(S.frame){s+=`<polygon points="${poly([P(pj.lx+r.F.x0,r.outFront),P(pj.lx+r.F.x1,r.outFront),P(pj.lx+r.F.x1,r.outBack),P(pj.lx+r.F.x0,r.outBack)])}" fill="none" stroke="#3F4B57" stroke-width="${2.2*k}"/>`}
      s+=`<circle cx="${lens[0]}" cy="${lens[1]}" r="${4*k}" fill="#D98300"/><circle cx="${P(pj.lx,(r.outFront+r.outBack)/2)[0]}" cy="${P(pj.lx,(r.outFront+r.outBack)/2)[1]}" r="${Math.max(14*k,bw*sc*.6)}" fill="transparent"/></g>`});
    const m0=P(S.px,0),m1=P(S.px,S.L);const off=-(r.body[0]/2+.35)*sc;const d0=[m0[0]+g.u[0]*off,m0[1]+g.u[1]*off],d1=[m1[0]+g.u[0]*off,m1[1]+g.u[1]*off];
    s+=`<line x1="${d0[0]}" y1="${d0[1]}" x2="${d1[0]}" y2="${d1[1]}" stroke="#0B6E9C" stroke-width="${1.5*k}" marker-start="url(#par)" marker-end="url(#par)"/>`+tag((d0[0]+d1[0])/2,(d0[1]+d1[1])/2,`L ${f2(S.L)} m`);
    s+=tag(g.C[0]-g.n[0]*22*k,g.C[1]-g.n[1]*22*k,`lærred ${f2(g.wM)} m`,'#111');
    const ok=r.zoomOK&&r.shOK&&r.sizeOK;{const q=P(r.pjs[0].lx-r.body[0]/2,(r.outFront+r.outBack)/2);const t0=ok?'✓ placering virker':(!r.zoomOK?'✗ uden for zoom':'✗ tjek shift/størrelse');const ww=(t0.length*7+10)*k/2+12*k;s+=tag(q[0]-g.u[0]*ww,q[1]-g.u[1]*ww,t0,ok?'#17834F':'#C23A22')}
  }
  // lærredets greb øverst, så de altid kan rammes (flyt hele lærredet / træk i punkterne for at rotere)
  // målestoks-linjerne kan trækkes: endepunkter (ret) og selve linjen (flyt)
  for(const [c,col] of [['cal','#0B6E9C'],['cal2','#7A3FB0']]){const L=p[c];if(!L||!L.b)continue;
    s+=`<line class="calline" data-c="${c}" x1="${L.a[0]}" y1="${L.a[1]}" x2="${L.b[0]}" y2="${L.b[1]}" stroke="transparent" stroke-width="${16*k}"/>`;
    for(const e of ['a','b'])s+=`<g class="calh" data-c="${c}" data-end="${e}"><circle cx="${L[e][0]}" cy="${L[e][1]}" r="${14*k}" fill="transparent"/><circle cx="${L[e][0]}" cy="${L[e][1]}" r="${6*k}" fill="#fff" stroke="${col}" stroke-width="${2.5*k}"/></g>`}
  if(p.scr){const a=p.scr.a,b=p.scr.b;if(b)s+=`<line class="scrline" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="transparent" stroke-width="${18*k}"/>`;
    for(const [q,e] of [[a,'a'],[b,'b']])if(q)s+=`<g class="scrh" data-end="${e}"><circle cx="${q[0]}" cy="${q[1]}" r="${16*k}" fill="transparent"/><circle cx="${q[0]}" cy="${q[1]}" r="${7*k}" fill="#fff" stroke="#111" stroke-width="${2.5*k}"/></g>`}
  $('planSvg').innerHTML=s;
}
function planLoad(file){if(!file)return;
  const done=url=>{const im=new Image();im.onload=()=>{PLANIMG=url;S.plan={...S.plan,w:im.naturalWidth,h:im.naturalHeight,cal:null,cal2:null,calStep:'w',scr:null,tool:'cal',open:true};try{localStorage.setItem('kasteplan_planimg',url)}catch(e){}render()};im.src=url};
  if(/pdf/i.test(file.type)||/\.pdf$/i.test(file.name)){
    $('planInfo').hidden=false;$('planInfo').textContent='Læser PDF…';
    const go=async()=>{try{const lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;const pg=await pdf.getPage(1);const vp0=pg.getViewport({scale:1});const vp=pg.getViewport({scale:Math.min(3,2400/Math.max(vp0.width,vp0.height))});
      const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:ctx,viewport:vp}).promise;done(c.toDataURL('image/jpeg',.9))}
      catch(e){$('planInfo').textContent='PDF’en kunne ikke læses. Gem første side som PNG eller JPG og indsæt den i stedet.'}};
    if(window.pdfjsLib)go();else{const a=document.createElement('script');a.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';a.onload=()=>{const b=document.createElement('script');b.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';b.onload=go;b.onerror=()=>{$('planInfo').textContent='PDF-læseren kunne ikke hentes. Indsæt tegningen som PNG eller JPG.'};document.head.appendChild(b)};a.onerror=a.onload;document.head.appendChild(a)}
  }else{const fr=new FileReader();fr.onload=()=>done(fr.result);fr.readAsDataURL(file)}}
let planDrag=null,planRaf=0,planOff=[0,0];
function planMove(q){const g=planGeo();if(!g)return;q=[q[0]-planOff[0],q[1]-planOff[1]];const d=V(g.C,q);{const lim=lensLimits();S.L=Math.max(lim.lo,Math.min(lim.hi,dot(d,g.n)/g.sc))};
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
