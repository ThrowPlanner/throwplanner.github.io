/* ===== EVENTS ===== */
function num(id,fn){$(id).addEventListener('input',e=>{const v=parseFloat(e.target.value);if(!Number.isFinite(v))return;fn(v);render()})}
num('dist',v=>{if(!S.lockL)S.L=Math.max(.1,v)});
$('iov').addEventListener('input',e=>{const v=parseFloat(e.target.value);if(Number.isFinite(v)){S.immOv=Math.max(0,Math.min(50,v));render()}});
$('iblRows').addEventListener('input',e=>{const t=e.target.closest('[data-g]');if(!t)return;const v=parseInt(t.value,10);if(!(v>=1))return;const k=t.dataset.g;S.immGrid={...(S.immGrid||{}),[k]:{...((S.immGrid||{})[k]||{}),[t.dataset.ax]:Math.min(20,v)}};render()});
$('iblRows').addEventListener('click',e=>{const b=e.target.closest('[data-auto]');if(!b)return;const k=b.dataset.auto;S.immGrid={...(S.immGrid||{}),[k]:{}};S.immAdj={...(S.immAdj||{}),[k]:{}};render()});
$('lockL').addEventListener('click',()=>{S.lockL=!S.lockL;render()});for(const [id,dm] of [['lockW','w'],['lockH','h'],['lockD','d']])$(id).addEventListener('click',()=>{const on=S.lockW&&(S.lockDim||'w')===dm;S.lockW=!on;S.lockDim=dm;render()});
num('cw',v=>{if(v>0&&!S.lockW)S.cw=v});
num('ch',v=>{const r=calc();if(v>0&&!S.lockW)S.cw=v*r.CW/r.CH});
num('cd',v=>{const r=calc();if(v>0&&!S.lockW)S.cw=v*IN*r.CW/Math.hypot(r.CW,r.CH)});
num('sb',v=>S.sb=v);
num('rd',v=>S.rd=Math.max(2,v));num('rw',v=>S.rw=Math.max(2,v));num('rh',v=>S.rh=Math.max(2,v));num('r1',v=>S.r1=Math.max(.5,v));num('rp',v=>S.rp=Math.max(.7,v));
num('gain',v=>S.gain=v);num('amb',v=>S.amb=Math.max(0,v));num('amb2',v=>S.amb=Math.max(0,v));num('pcr',v=>S.pcr=Math.max(10,v));num('stack',v=>S.stack=Math.max(2,Math.min(4,Math.round(v))));
$('stackOn').addEventListener('change',e=>{S.stackOn=e.target.checked;if(S.stackOn&&!(S.stack>=2))S.stack=2;render()});
$('crReq').addEventListener('change',e=>{S.crReq=e.target.value;render()});num('crCust',v=>S.crCust=Math.max(1,v));
$('ambR').addEventListener('input',e=>{S.amb=+e.target.value;render()});
num('fw',v=>S.fw=v);num('fh',v=>S.fh=v);num('fd',v=>S.fd=v);
$('portrait').addEventListener('change',e=>{S.portrait=e.target.checked;S.bdx={};render();if(!S.bauto&&!S.lockL)fitLens();zeroShift();render()});
$('bauto').addEventListener('change',e=>{S.bauto=e.target.checked;if(S.bauto){S.bth=Math.round(calc().CH*100)/100}render()});
num('bth',v=>S.bth=Math.max(0.2,v));
num('bc',v=>S.bc=Math.max(1,Math.min(8,Math.round(v))));num('br',v=>S.br=Math.max(1,Math.min(4,Math.round(v))));num('ov',v=>S.ov=Math.max(0,Math.min(50,v)));
$('aspect').addEventListener('change',e=>{const r0=calc(),dm=S.lockW?S.lockDim||'w':'w';S.ak=e.target.value;
  // låst højde eller diagonal: bredden regnes om, så det låste mål bliver det samme i det nye format
  if(dm!=='w'){const r1=calc();if(dm==='h'&&r1.CH>0)S.cw*=r0.CH/r1.CH;else if(dm==='d'){const d0=Math.hypot(r0.CW,r0.CH),d1=Math.hypot(r1.CW,r1.CH);if(d1>0)S.cw*=d0/d1}}
  zeroShift();render()});
$('cat').addEventListener('change',e=>{const m0=S.mi;S.cat=+e.target.value;fillModels();if(!SLOT()&&S.mi!==m0){fitLens();zeroShift()}render()});
$('minLm').addEventListener('change',e=>{const m0=S.mi;S.minLm=+e.target.value;fillCats();fillModels();if(!SLOT()&&S.mi!==m0){fitLens();zeroShift()}render()});
$('model').addEventListener('change',e=>{const k=SLOT();if(k){S.immPj={...(S.immPj||{}),[k]:{mi:+e.target.value,li:0}};S.immAdj={...(S.immAdj||{}),[k]:{}};fillLens();render();return}const ln=S.lockLens&&M().L[S.li]?M().L[S.li][0]:null;S.pcr=null;S.mi=+e.target.value;S.li=ln?Math.max(0,M().L.findIndex(l=>l[0]===ln)):0;fillLens();frameDefaults();fitLens();zeroShift();render();TRK('Projektor',{model:M().m})});
$('lens').addEventListener('change',e=>{const k=SLOT();if(k){S.immPj={...(S.immPj||{}),[k]:{mi:slotMI(),li:+e.target.value}};S.immAdj={...(S.immAdj||{}),[k]:{}};render();return}S.li=+e.target.value;fitLens();zeroShift();render()});
$('frameSel').addEventListener('change',e=>{S.frameId=e.target.value;applyFrame();render()});

$('mDesk').addEventListener('click',()=>{S.ceil=false;zeroShift();render()});
$('mCeil').addEventListener('click',()=>{S.ceil=true;zeroShift();render()});
$('dMount').addEventListener('toggle',e=>{if(S.openMount!==e.target.open){S.openMount=e.target.open;save()}});
$('dBlend').addEventListener('toggle',e=>{if(S.openBlend!==e.target.open){S.openBlend=e.target.open;save()}});
$('frame').addEventListener('change',e=>{S.frame=e.target.checked;render()});
$('blend').addEventListener('change',e=>{S.blend=e.target.checked;zeroShift();render()});
{const py=(e,z)=>{const svg=$('front'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());const F=FRONTI;return F.E+(F.Yh-q.y)*(F.C-z)/F.f};
 const pl=(e,yp)=>{const svg=$('front'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());const F=FRONTI;
   const dyE=yp-F.E,k=(F.Yh-q.y)/(Math.abs(dyE)<.25?(dyE<0?-.25:.25):dyE);if(!(k>0))return null;return {x:(q.x-F.X0)/k,z:F.C-F.f/k}};
 let raf=0;
 {const show=id=>$('front').querySelectorAll('.ipjd').forEach(g=>g.classList.toggle('on',g.dataset.dim===id));
  $('front').addEventListener('pointerover',e=>{if(IMDRAG)return;const g=e.target.closest&&e.target.closest('[data-tid]');HOVDIM=g?g.dataset.tid:null;show(HOVDIM)});
  $('front').addEventListener('pointerleave',()=>{if(!IMDRAG){HOVDIM=null;show(null)}})}
 $('front').addEventListener('pointerdown',e=>{if(S.venue!=='immersive'||!FRONTI)return;const g=e.target.closest('[data-ipj]');if(!g)return;const key=g.dataset.ipj;
   const q=immCalc(calc()).find(x=>x.key===key);const yp=key==='f'?q.L:S.rh-.3;const p0=pl(e,yp);if(!p0)return;
   const vert=e.shiftKey||S.imMode==='v';const y0=vert?py(e,p0.z):0;
   IMDRAG={key,yp,p0,a0:{dL:q.dL,du:q.du,dv:q.dv},vert,y0,z0:p0.z,locked:false};$('front').setPointerCapture(e.pointerId);e.preventDefault()});
 $('front').addEventListener('pointermove',e=>{if(!IMDRAG)return;const p=pl(e,IMDRAG.yp);if(!p)return;const dx=p.x-IMDRAG.p0.x,dz=p.z-IMDRAG.p0.z,a=IMDRAG.a0,k=IMDRAG.key;
   const vert=IMDRAG.vert&&k==='f',dy=vert?py(e,IMDRAG.z0)-IMDRAG.y0:0;immDragApply(k,a,vert?0:dx,vert?0:dz,dy,vert);
   if(!raf)raf=requestAnimationFrame(()=>{raf=0;render()})});
 ['pointerup','pointercancel'].forEach(t=>$('front').addEventListener(t,()=>{if(IMDRAG){IMDRAG=null;save()}}));}
/* Immersive-træk: vandret flyttes gruppen (væggene: på tværs = kastafstand, langs = forskydning; gulvet: forskydning langs gulvet),
   op/ned hæver/sænker gulv-projektorerne. Rækker optikken ikke til det nye kast, skiftes til en optik på samme projektor, der gør
   (medmindre «Lås optik» er slået til), og «Auto» for fladen slås fra, så opdelingen bevares. */
function immDragApply(k,a,dx,dz,dy,vert){let n={l:{dL:a.dL+dx,du:a.du+dz,dv:a.dv},r:{dL:a.dL-dx,du:a.du+dz,dv:a.dv},v:{dL:a.dL+dz,du:a.du+dx,dv:a.dv},f:{dL:a.dL,du:a.du+dz,dv:a.dv+dx}}[k];
  if(vert&&k==='f'){if(dy)lockAuto(k);n={dL:a.dL+dy,du:a.du,dv:a.dv}}
  if(!isFinite(n.dL)||!isFinite(n.du)||!isFinite(n.dv))return;
  S.immAdj={...(S.immAdj||{}),[k]:n};let q=immCalc(calc()).find(x=>x.key===k);
  if(q&&q.ok&&n.dL!==a.dL){const want=Math.min(q.Lmax,q.Lmax+n.dL);if(Math.abs(q.L-want)>.01&&!S.lockLens){lockAuto(k);S.immAdj={...(S.immAdj||{}),[k]:n};immLensFit(k,n.dL);q=immCalc(calc()).find(x=>x.key===k)}}
  if(q){S.immAdj={...(S.immAdj||{}),[k]:{dL:q.dL,du:q.du,dv:q.dv}};
    // grænse nået: fortæl hvorfor gruppen ikke kommer længere
    const want=Math.min(q.Lmax,q.Lmax+n.dL);if(q.ok&&n.dL!==a.dL&&Math.abs(q.L-want)>.05){const lens=q.pl[0].replace('Supplied lens/','');
      IMMSG={t:Date.now(),txt:`${q.name}: ${want<q.L?`kortest mulige kast er ${f2(q.L)} m`:`længst mulige kast er ${f2(q.L)} m`} med ${S.lockLens?'den låste optik':'denne projektor'} (${lens}) og opdeling`};
      clearTimeout(immDragApply.t);immDragApply.t=setTimeout(()=>render(),4100)}}}
// Immersive: slå «Auto» fra for en flade (opdelingen og retningen bevares), når projektorerne flyttes op/ned med hånden
function lockAuto(k){const q=immCalc(calc()).find(x=>x.key===k);if(!q||!q.ok)return;const G=S.immGrid||{};if(G[k]&&G[k].c)return;
  S.immGrid={...G,[k]:{c:q.nu,r:q.nv}};S.immRot={...(S.immRot||{}),[k]:!!q.rot}}
// vælg den optik (samme projektor), hvis zoom rækker til det ønskede kast med samme billedstørrelse
function immLensFit(k,dL){if(S.lockLens)return;const q=immCalc(calc()).find(x=>x.key===k);if(!q||!q.ok)return;const want=Math.min(q.Lmax,q.Lmax+dL);if(Math.abs(q.L-want)<.01)return;
  const m=q.pm,ai=Math.max(0,aiFor(m)),[aw,ah]=ratioOf(m.asp[ai]),kW=IN*aw/Math.hypot(aw,ah),D=q.W/kW;let best=null;
  const missOf=ln=>{const row=ln[2]&&ln[2][ai];if(!row||!(row[0]>0)||D<row[4]-.5||D>row[5]+.5)return Infinity;const a=distAt(row,D,0),b=ln[1]==='F'?a:distAt(row,D,1),lo=Math.min(a,b),hi=Math.max(a,b);return want<lo?lo-want:want>hi?want-hi:0};
  m.L.forEach((ln,li)=>{const ms=missOf(ln);if(ms<Infinity&&(!best||ms<best.miss-1e-6))best={li,miss:ms}});
  if(best&&m.L[best.li]!==q.pl&&best.miss<missOf(q.pl)-1e-3){S.immPj={...(S.immPj||{}),[k]:{mi:MODELS.indexOf(m),li:best.li}};fillLens()}}
function useSug(ks){const IM=immCalc(calc());const P={...(S.immPj||{})},A={...(S.immAdj||{})},G={...(S.immGrid||{})};
  const RT={...(S.immRot||{})};for(const q of IM)if(q.on&&q.ok&&q.sug&&ks.includes(q.key)){P[q.key]={mi:q.sug.mi,li:q.sug.li};RT[q.key]=q.sug.rot;A[q.key]={};G[q.key]={}}S.immPj=P;S.immRot=RT;S.immAdj=A;S.immGrid=G;fillModels();fillLens();render()}
$('iblRows').addEventListener('click',e=>{const b=e.target.closest('[data-use]');if(b)useSug([b.dataset.use])});
$('immLensLock').addEventListener('click',()=>{S.lockLens=!S.lockLens;render()});
document.querySelectorAll('[data-imode]').forEach(b=>b.addEventListener('click',()=>{S.imMode=b.dataset.imode;document.querySelectorAll('[data-imode]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.imode===S.imMode))}));
document.querySelectorAll('[data-ity]').forEach(b=>b.addEventListener('click',()=>{const T={d1:true,d3:true,lcd:true,...(S.immTypes||{})};const k=b.dataset.ity;T[k]=!T[k];if(!Object.values(T).some(Boolean))T[k]=true;S.immTypes=T;render()}));
['cbMin','cbMax'].forEach(id=>$(id).addEventListener('input',e=>{let a=+$('cbMin').value,z=+$('cbMax').value;if(a>z-2){if(id==='cbMin')a=z-2;else z=a+2;a=Math.max(0,a);z=Math.min(100,z);$('cbMin').value=a;$('cbMax').value=z}
  S.immCrMin=Math.round(cbV2C(a)*10)/10;S.immCrMax=z>=100?100:Math.round(cbV2C(z)*10)/10;render()}));
$('crBand').addEventListener('click',e=>e.stopPropagation());
$('iblBest').addEventListener('click',e=>{if(e.target.closest('[data-best]'))useSug(['v','l','r','f'])});
document.querySelectorAll('[data-slot]').forEach(b=>b.addEventListener('click',()=>{S.immSel=b.dataset.slot;fillLens();render()}));
$('pjSlotInfo').addEventListener('click',e=>{const b=e.target.closest('[data-reset]');if(!b)return;const k=b.dataset.reset;const p={...(S.immPj||{})};delete p[k];S.immPj=p;S.immAdj={...(S.immAdj||{}),[k]:{}};fillLens();render()});
document.querySelectorAll('[data-imm]').forEach(b=>b.addEventListener('click',()=>{S.imm={...S.imm,[b.dataset.imm]:!S.imm[b.dataset.imm]};render()}));
document.querySelectorAll('button[data-venue]').forEach(b=>b.addEventListener('click',()=>{const prev=S.venue,nv=b.dataset.venue;S.venue=nv;if(nv!==prev)TRK('Tema',{tema:nv});if(nv==='golf'&&prev!=='golf')golfEnter();else if(prev==='golf'&&nv!=='golf'){golfLeave();fillCats();fillModels();fillLens()}render()}));
{const gset=(id,f)=>$(id).addEventListener('change',e=>{const v=parseFloat(String(e.target.value).replace(',','.'));if(!Number.isFinite(v))return;S.golf={...GS(),...f(v)};render()});
 gset('gH',v=>{const h=Math.max(1.4,Math.min(2.1,v)),g=GS();return {h,R:Math.round(g.R*h/g.h*100)/100}});gset('gR',v=>({R:Math.max(1,Math.min(2.4,v))}));gset('gTh',v=>({th:Math.max(30,Math.min(80,v))}));
 gset('gTee',v=>({tee:Math.max(1,Math.min(S.rd-.5,v))}));gset('gMW',v=>({matW:Math.max(.5,Math.min(S.rw,v))}));gset('gMD',v=>({matD:Math.max(.5,Math.min(S.rd,v))}));
 $('gTM').addEventListener('change',e=>{S.golf={...GS(),tm:e.target.value};render()});
 document.querySelectorAll('[data-ghand]').forEach(b=>b.addEventListener('click',()=>{S.golf={...GS(),hand:b.dataset.ghand};render()}));
 let gAnim=null;const golfFrame=()=>{const r=calc();GCUR=golfCalc(r);drawGolfPanel(GCUR);drawFront(r);drawSide(r);save()};
 $('gPose').addEventListener('input',e=>{if(gAnim){cancelAnimationFrame(gAnim);gAnim=null}S.golf={...GS(),pose:+e.target.value/100};golfFrame()});
 $('gPlay').addEventListener('click',()=>{if(gAnim){cancelAnimationFrame(gAnim);gAnim=null;render();return}const t0=performance.now(),D=2600;
  const step=now=>{const u=(now-t0)/D;if(u>=1){gAnim=null;S.golf={...GS(),pose:1};render();return}const t=u<.55?.42*gEase(u/.55):.42+.58*(1-Math.pow(1-(u-.55)/.45,2));S.golf={...GS(),pose:t};golfFrame();gAnim=requestAnimationFrame(step)};gAnim=requestAnimationFrame(step)});
 let gd=null;const sv=$('side');
 sv.addEventListener('pointerdown',e=>{if(S.venue!=='golf'||!e.target.closest('.ggrab'))return;gd=1;sv.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation()},true);
 sv.addEventListener('pointermove',e=>{if(!gd)return;const pt=sv.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(sv.getScreenCTM().inverse()),z=(q.x-SIDE.pl)/SIDE.sc;S.golf={...GS(),tee:Math.round(Math.max(1,Math.min(S.rd-.5,z))*20)/20};render();e.stopImmediatePropagation()},true);
 sv.addEventListener('pointerup',e=>{if(gd){gd=null;e.stopImmediatePropagation()}},true)}
document.querySelectorAll('[data-crowd]').forEach(b=>b.addEventListener('click',()=>{S.crowd=b.dataset.crowd==='1';render()}));
document.querySelectorAll('[data-rear]').forEach(b=>b.addEventListener('click',()=>{const on=b.dataset.rear==='1';if(on&&!S.rear){const r=calc();S.bsd=Math.round(Math.max(1,Math.min(STAGE()-1.1,Math.max(3,r.outBack+0.4)))*10)/10}S.rear=on;render()}));
num('stD',v=>S.stageD=Math.max(1,v));num('stH',v=>S.stageH=Math.max(0.2,Math.min(1.6,v)));num('trows',v=>S.trows=Math.max(1,Math.min(30,Math.round(v))));num('bsd',v=>S.bsd=Math.max(1,v));
document.querySelectorAll('[data-content]').forEach(b=>b.addEventListener('click',()=>{const again=S.content==='img';S.content=b.dataset.content;if(S.content==='img'&&(!IMG||again))$('file').click();render()}));
$('file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=()=>{IMG=fr.result;S.content='img';render()};fr.readAsDataURL(f);e.target.value=''});

$('dPlan').addEventListener('toggle',e=>{if(S.plan.open!==e.target.open){S.plan.open=e.target.open;save()}});
['planUp','planUp2'].forEach(id=>$(id).addEventListener('click',()=>$('planFile').click()));
$('planFile').addEventListener('change',e=>{planLoad(e.target.files[0]);e.target.value=''});
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{const p=S.plan;p.tool=b.dataset.tool;if(p.tool==='cal')p.calStep=!p.cal||!p.cal.b?'w':!p.cal2||!p.cal2.b?'l':'h';render()}));
$('calM').addEventListener('input',e=>{const v=parseFloat(e.target.value);if(v>0){S.plan.calM=v;applyPlanRoom();render()}});
$('planCw').addEventListener('input',e=>{const v=parseFloat(e.target.value),p=S.plan;if(!(v>=.2)||!p.scr||!p.scr.b)return;
  if(planActive()){if(S.lockW)return;S.cw=v}
  else{const sc=planScale();if(!(sc>0))return;const a=p.scr.a,b=p.scr.b,l=len(V(a,b)),c=[(a[0]+b[0])/2,(a[1]+b[1])/2],h=v*sc/2;p.scr.a=[c[0]-(b[0]-a[0])/l*h,c[1]-(b[1]-a[1])/l*h];p.scr.b=[c[0]+(b[0]-a[0])/l*h,c[1]+(b[1]-a[1])/l*h]}
  render()});
$('planL').addEventListener('input',e=>{const v=parseFloat(e.target.value);if(v>0&&!S.lockL){S.L=v;render()}});
$('planPx').addEventListener('input',e=>{const v=parseFloat(e.target.value);if(Number.isFinite(v)&&!S.plan.lock){guardShift({px:S.px},{px:v});render()}});
$('calL').addEventListener('input',e=>{const v=parseFloat(e.target.value);if(v>0){S.plan.calL=v;applyPlanRoom();render()}});
$('calH').addEventListener('input',e=>{const v=parseFloat(e.target.value);S.plan.calH=v>0?v:null;applyPlanRoom();render()});
document.querySelectorAll('[data-cal]').forEach(b=>b.addEventListener('click',()=>{const p=S.plan;p.tool='cal';p.calStep=b.dataset.cal;render()}));  // beholder linjen – punkterne kan nu flyttes, eller man tegner en ny
$('planLock').addEventListener('change',e=>{S.plan.lock=e.target.checked;if(S.plan.lock)S.px=0;render()});
$('planUse').addEventListener('change',e=>{S.plan.use=e.target.checked;render()});
$('planDel').addEventListener('click',()=>{PLANIMG=null;try{localStorage.removeItem('kasteplan_planimg')}catch(e){}S.plan={...S.plan,w:0,h:0,cal:null,cal2:null,calStep:'w',scr:null,tool:'cal',pjSet:false};render()});
// zoom i plantegningen – midten af det synlige udsnit bliver liggende
document.querySelectorAll('[data-pz]').forEach(b=>b.addEventListener('click',()=>{const d=+b.dataset.pz,st=$('planStage');
  const i=PLANZ.indexOf(S.plan.zoom)<0?PLANZ.indexOf(1):PLANZ.indexOf(S.plan.zoom);S.plan.zoom=d?PLANZ[Math.max(0,Math.min(PLANZ.length-1,i+d))]:1;
  const fx=(st.scrollLeft+st.clientWidth/2)/st.scrollWidth,fy=(st.scrollTop+st.clientHeight/2)/st.scrollHeight;render();
  st.scrollLeft=fx*st.scrollWidth-st.clientWidth/2;st.scrollTop=fy*st.scrollHeight-st.clientHeight/2;save()}));
let scrDraw=null;
function scrSet(which,q,keep){const p=S.plan,sc=planScale();const o=which==='a'?p.scr.b:p.scr.a;let v=V(o,q),l=len(v);if(l<1)return;
  if(keep){const h=len(V(p.scr.a,p.scr.b));q=[o[0]+v[0]/l*h,o[1]+v[1]/l*h]}   // trin 3: kun rotation om det andet punkt
  else if(S.lockW&&sc>0&&p.use){const h=S.cw*sc;q=[o[0]+v[0]/l*h,o[1]+v[1]/l*h]}else if(sc>0&&p.use)S.cw=Math.max(.2,l/sc);
  p.scr[which]=q;if(!planRaf)planRaf=requestAnimationFrame(()=>{planRaf=0;render()})}
let calDrag=null;
$('planSvg').addEventListener('pointerdown',e=>{if(!PLANIMG)return;const q=svgPt(e),p=S.plan;
  {const ch=e.target.closest('.calh'),cl=e.target.closest('.calline');if((ch&&!planEdit(ch.dataset.c))||(cl&&!planEdit(cl.dataset.c)))return;
   if(ch&&p[ch.dataset.c]&&p[ch.dataset.c].b){calDrag={c:ch.dataset.c,end:ch.dataset.end};$('planSvg').setPointerCapture(e.pointerId);e.preventDefault();return}
   if(cl&&p[cl.dataset.c]&&p[cl.dataset.c].b){const L=p[cl.dataset.c];calDrag={c:cl.dataset.c,q0:q,a0:L.a.slice(),b0:L.b.slice()};$('planSvg').setPointerCapture(e.pointerId);e.preventDefault();return}}
  // lærredets to punkter (flyt/rotér) og selve lærredet (flyt)
  const h=planEdit('scr')&&e.target.closest('.scrh');if(h&&p.scr&&p.scr.b){scrDraw={mode:'end',which:h.dataset.end,keep:p.tool==='pj'};$('planSvg').setPointerCapture(e.pointerId);e.preventDefault();return}
  if(planEdit('scr')&&e.target.closest('.scrline')&&p.scr&&p.scr.b){scrDraw={mode:'move',q0:q,a0:p.scr.a.slice(),b0:p.scr.b.slice(),keep:p.tool==='pj'};$('planSvg').setPointerCapture(e.pointerId);e.preventDefault();return}
  if(p.tool==='scr'&&p.scr&&p.scr.a&&!p.scr.b){p.scr.b=p.scr.a.slice();scrSet('b',q);p.tool='pj';if(p.lock)S.px=0;cancelAnimationFrame(planRaf);planRaf=0;if(planActive()){syncPlan();fitLens();zeroShift()}save();render();e.preventDefault();return}  // klik-klik virker stadig
  if(p.tool==='scr'&&(!p.scr||!p.scr.b||!planGeo())){p.scr={a:q,b:q.slice()};scrDraw={mode:'new'};$('planSvg').setPointerCapture(e.pointerId);e.preventDefault();render();return}
  if(e.target.closest('.pjgrab')||p.tool==='pj'){const g=planGeo();if(!g)return;const gr=e.target.closest('.pjgrab');planDrag={i:gr?+gr.dataset.pj:null};if(gr){const r0=calc(),pj=r0.pjs[+gr.dataset.pj]||r0.pjs[0];const L0=g.at(S.blend?pj.lx:S.px,S.L);planOff=[q[0]-L0[0],q[1]-L0[1]]}else planOff=[0,0];p.tool='pj';$('planSvg').setPointerCapture(e.pointerId);planMove(q);e.preventDefault();return}
  if(p.tool==='cal'){const st=p.calStep||'w';
    if(st==='w'){if(!p.cal||p.cal.b)p.cal={a:q,b:null};else{p.cal.b=q;p.calStep='l';if(!(p.calM>=2))p.calM=S.rw;applyPlanRoom()}}
    else if(st==='l'){if(!p.cal2||p.cal2.b)p.cal2={a:q,b:null};else{p.cal2.b=q;p.calStep='h';if(!(p.scr&&p.scr.b))p.tool='scr';  // målestok færdig – videre til 2 · Lærred
const sc=planScale();if(!(p.calL>0))p.calL=sc>0?Math.round(len(V(p.cal2.a,p.cal2.b))/sc*10)/10:S.rd;applyPlanRoom()}}
    save();render()}
  else if(p.tool==='scr'){p.scr={a:q,b:q.slice()};scrDraw={mode:'new'};$('planSvg').setPointerCapture(e.pointerId);render()}});
$('planSvg').addEventListener('pointermove',e=>{const q=svgPt(e);
  if(calDrag){const L=S.plan[calDrag.c];if(calDrag.end)L[calDrag.end]=q;else{const d=V(calDrag.q0,q);L.a=[calDrag.a0[0]+d[0],calDrag.a0[1]+d[1]];L.b=[calDrag.b0[0]+d[0],calDrag.b0[1]+d[1]]}
    if(!planRaf)planRaf=requestAnimationFrame(()=>{planRaf=0;render()});return}
  if(scrDraw){const p=S.plan;if(scrDraw.mode==='move'){const d=V(scrDraw.q0,q);p.scr.a=[scrDraw.a0[0]+d[0],scrDraw.a0[1]+d[1]];p.scr.b=[scrDraw.b0[0]+d[0],scrDraw.b0[1]+d[1]];if(!planRaf)planRaf=requestAnimationFrame(()=>{planRaf=0;render()})}
    else scrSet(scrDraw.mode==='new'?'b':scrDraw.which,q,scrDraw.keep);return}
  if(planDrag)planMove(q)});
['pointerup','pointercancel'].forEach(t=>$('planSvg').addEventListener(t,()=>{
  if(calDrag){calDrag=null;applyPlanRoom();save();render();return}
  if(scrDraw){const p=S.plan,m=scrDraw.mode,keep=scrDraw.keep;scrDraw=null;if(m==='new'){if(len(V(p.scr.a,p.scr.b))<6){p.scr={a:p.scr.a,b:null}}else{p.tool='pj';if(p.lock)S.px=0}}else if(p.tool==='scr'&&planGeo())p.tool='pj';if(planActive()&&!keep){fitLens();zeroShift()}save();render();return}
  if(planDrag){planDrag=null;save()}}));
let presDrag=null;
$('side').addEventListener('pointerdown',e=>{if(S.venue==='immersive'||!SIDE||!e.target.closest('.presgrab'))return;presDrag={v:'side'};$('side').setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation()},true);
$('side').addEventListener('pointermove',e=>{if(!presDrag||presDrag.v!=='side')return;const q=sideRaw(e);const [a,b]=PRESZR();S.presZ=Math.round(Math.max(a,Math.min(b,q.z))*20)/20;if(!sideRaf)sideRaf=requestAnimationFrame(()=>{sideRaf=0;render()});e.stopImmediatePropagation()},true);
$('front').addEventListener('pointerdown',e=>{if(S.venue==='immersive'||!FRONTI||!e.target.closest('.presgrab'))return;const svg=$('front'),pt=svg.createSVGPoint();
  const pick=ev=>{pt.x=ev.clientX;pt.y=ev.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse()),F=FRONTI,yb=S.venue==='theater'?STH():0;const k=(F.Yh-q.y)/((yb-F.E)||-0.01);return k>0?{x:(q.x-F.X0)/k,z:F.C-F.f/k}:null};
  const r=calc(),p0=pick(e);if(!p0)return;presDrag={v:'front',pick,dx:p0.x-r.presX,dz:p0.z-r.presZ};svg.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation()},true);
$('front').addEventListener('pointermove',e=>{if(!presDrag||presDrag.v!=='front')return;const q=presDrag.pick(e);e.stopImmediatePropagation();if(!q)return;const [a,b]=PRESZR(),w=S.rw/2-0.3;
  S.presX=Math.round(Math.max(-w,Math.min(w,q.x-presDrag.dx))*20)/20;S.presZ=Math.round(Math.max(a,Math.min(b,q.z-presDrag.dz))*20)/20;if(!sideRaf)sideRaf=requestAnimationFrame(()=>{sideRaf=0;render()})},true);
['pointerup','pointercancel'].forEach(t=>{$('side').addEventListener(t,()=>{if(presDrag){presDrag=null;save()}});$('front').addEventListener(t,()=>{if(presDrag){presDrag=null;save()}})});
let stDrag=null;const sideRaw=e=>{const svg=$('side'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());return {z:(q.x-SIDE.pl)/SIDE.sc,y:(SIDE.vh-SIDE.pb-q.y)/SIDE.sc}};
$('side').addEventListener('pointerdown',e=>{const sg=e.target.closest('.stgrab');if(sg&&SIDE){stDrag=sg.dataset.st;$('side').setPointerCapture(e.pointerId);e.preventDefault();return}},true);
$('side').addEventListener('pointermove',e=>{if(!stDrag)return;const q=sideRaw(e);if(stDrag==='d')S.stageD=Math.round(Math.max(1,Math.min(STAGEMAX(),q.z))*10)/10;else S.stageH=Math.round(Math.max(0.2,Math.min(1.6,q.y))*20)/20;if(!sideRaf)sideRaf=requestAnimationFrame(()=>{sideRaf=0;render()})});
['pointerup','pointercancel'].forEach(t=>$('side').addEventListener(t,()=>{if(stDrag){stDrag=null;save()}}));
$('side').addEventListener('pointerdown',e=>{if(!SIDE||stDrag)return;if(e.target.closest('.scrgrab')){const q=sidePt(e);scrDrag={dy:q.y-S.sb,el:$('side'),pt:sidePt};$('side').setPointerCapture(e.pointerId);e.preventDefault();return}if(!e.target.closest('.sgrab'))return;const q=sidePt(e);sideDrag={dz:q.z-S.L,dy:q.y-S.py};$('side').setPointerCapture(e.pointerId);e.preventDefault()});
/* træk ud over optikkens zoom/lens shift: skift automatisk til næste optik (samme projektor) i trækkets retning */
function autoLens(z,y){if(S.lockLens||S.lockL||SLOT()||S.venue==='immersive')return false;const m=M(),cur=S.li,L0=S.L,py0=S.py,r0=calc();
  const lo0=Math.min(r0.Lw,r0.Lt),hi0=Math.max(r0.Lw,r0.Lt),dz=z>hi0+.005?1:z<lo0-.005?-1:0;
  const out=(rr,yy)=>{if(rr.kon||!rr.pyRange)return 0;return Math.max(0,rr.pyRange[0]-yy,yy-rr.pyRange[1])};
  const curZ=Math.abs(Math.max(lo0,Math.min(hi0,z))-z),curY=out(r0,y);if(!dz&&curY<.005)return false;
  let best=null;
  for(let i=0;i<m.L.length;i++){if(i===cur)continue;S.li=i;S.L=L0;let r=calc();if(!r.aspOK||!r.sizeOK)continue;if(!r.P.length&&!r.kon&&!isUST(r.row,r.aw,r.ah,r.kind)){const w=r.cy-r.inv*r.off*r.H;if(w<.05||w>S.rh-.05)continue}
    const lo=Math.min(r.Lw,r.Lt),hi=Math.max(r.Lw,r.Lt);let L=r.fixed?r.Lw:Math.max(lo,Math.min(hi,dz?z:L0));
    if(L>DEPTH()-.2||L<.2)continue;
    if(dz>0&&!(hi>hi0+1e-6))continue;if(dz<0&&!(lo<lo0-1e-6))continue;if(!dz&&Math.abs(L-L0)>.005)continue;
    S.L=L;r=calc();const eZ=dz?Math.abs(L-z):0,eY=out(r,y);
    if(dz&&eZ>=curZ-.005)continue;if(!dz&&eY>=curY-.005)continue;
    const sc=eZ*10+eY*3+(dz>0?lo:dz<0?-hi:Math.abs((lo+hi)/2-L0))*.01;
    if(!best||sc<best.sc)best={i,L,sc}}
  if(!best){S.li=cur;S.L=L0;S.py=py0;return false}
  S.li=best.i;S.L=Math.round(best.L*100)/100;const r=calc();if(r.pyRange&&!r.kon&&r.P.length)S.py=Math.max(r.pyRange[0],Math.min(r.pyRange[1],S.py));else if(!r.P.length&&!r.kon)zeroShift();
  hit('lens');{const el=$('lens');el.classList.remove('lflash');void el.offsetWidth;el.classList.add('lflash')}return true}
$('side').addEventListener('pointermove',e=>{if(scrDrag){moveScreen(scrDrag.pt(e).y-scrDrag.dy);return}if(!sideDrag)return;const q=sidePt(e);autoLens(q.z-sideDrag.dz,q.y-sideDrag.dy);const lim=lensLimits();let nz=Math.max(lim.lo,Math.min(lim.hi,q.z-sideDrag.dz)),ny=q.y-sideDrag.dy;if(lim.py)ny=Math.max(lim.py[0],Math.min(lim.py[1],ny));if(nz>DEPTH()-.2)hit('depth');if(ny>S.rh-.05)hit('pyTop');if(ny<.05)hit('pyBot');S.L=Math.max(.2,Math.min(DEPTH()-.2,nz));S.L=Math.round(S.L*100)/100;if(S.L<lim.lo-1e-9)S.L=Math.ceil(lim.lo*100)/100;if(S.L>lim.hi+1e-9)S.L=Math.floor(lim.hi*100)/100;if(S.L<lim.lo||S.L>lim.hi)S.L=Math.max(lim.lo,Math.min(lim.hi,S.L));guardShift({py:S.py},{py:Math.round(Math.max(.05,Math.min(S.rh-.05,ny))*100)/100});if(!sideRaf)sideRaf=requestAnimationFrame(()=>{sideRaf=0;render()})});
['pointerup','pointercancel'].forEach(t=>$('side').addEventListener(t,()=>{if(sideDrag||scrDrag){sideDrag=null;scrDrag=null;save()}}));
$('svR').addEventListener('input',e=>setShift(+e.target.value/100,null));
for(const id of ['lensLock','lensLock3'])$(id).addEventListener('click',()=>{S.lockLens=!S.lockLens;render()});
$('ksBtn').addEventListener('click',()=>{if(S.ks&&S.ks.on){const r=calc();S.py=r.cy-r.inv*(r.sv+r.off)*r.H;S.px=r.cx-r.inv*(r.sh+r.offH)*r.W;S.ks={v:0,h:0,on:false}}else S.ks={v:0,h:0,on:true};render()});
// keystone-bar: optikken lægges på kanten af sin lens shift, og projektoren flyttes (vippes) resten – 0° = projektoren inden for lens shift
const ksSet=(k,val)=>{const r0=calc();if(!r0.KL)return;S.ks={...(S.ks||{}),on:true};const D=Math.PI/180,o={py:S.py,px:S.px},old=k==='v'?r0.kv:r0.kh;
  const ap=x=>{S.py=o.py;S.px=o.px;if(k==='v'){const nh=r0.sh+r0.th-r0.offH,vr=(Math.abs(x)<1e-9?svInt(nh,r0.P):null)||svRange(r0.sh,r0.P)||[0,0],e=x>0?vr[1]:x<0?vr[0]:Math.max(vr[0],Math.min(vr[1],r0.sv+r0.tv)),need=e+Math.tan(x*D)*S.L/r0.H;S.py=r0.cy-r0.inv*(need+r0.off)*r0.H;return S.py>0.1&&S.py<S.rh-0.1&&calc().shOK}
    const nv=r0.sv+r0.tv;let hr=null;if(Math.abs(x)<1e-9){for(let q=-2.5;q<=2.5001;q+=.005){const iv=svInt(q,r0.P);if(iv&&nv>=iv[0]-1e-9&&nv<=iv[1]+1e-9){if(!hr)hr=[q,q];hr[1]=q}}}hr=hr||shRange(r0.sv,r0.P)||[0,0];const e=x>0?hr[1]:x<0?hr[0]:Math.max(hr[0],Math.min(hr[1],r0.sh+r0.th-r0.offH)),need=e+Math.tan(x*D)*S.L/r0.W;S.px=r0.cx-r0.inv*(need+r0.offH)*r0.W;return Math.abs(S.px)<S.rw/2-0.2&&calc().shOK};
  if(!ap(val)){let lo=0,hi=1;for(let i=0;i<16;i++){const m=(lo+hi)/2;if(ap(old+(val-old)*m))lo=m;else hi=m}ap(old+(val-old)*lo);hit('shift')}
  render()};
$('kvR').addEventListener('input',e=>ksSet('v',+e.target.value));$('khR').addEventListener('input',e=>ksSet('h',+e.target.value));
$('shR').addEventListener('input',e=>setShift(null,+e.target.value/100));
// 0-knapper pr. bar: lens shift 0 % = billedet midt for optikken (uden vip); keystone 0° = projektoren tilbage inden for lens shift
const zero=(k,e)=>{e.preventDefault();const r=calc();if(k==='sv')guardShift({py:S.py},{py:r.cy-r.inv*r.off*r.H});else if(k==='sh')guardShift({px:S.px},{px:r.cx-r.inv*r.offH*r.W});else ksSet(k==='kv'?'v':'h',0);render();save()};
['sv','sh','kv','kh'].forEach(k=>$(k+'0').addEventListener('click',e=>zero(k,e)));

{const fp=e=>{const svg=$('front'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());return {x:(q.x-FRONT.X0)/FRONT.s0,y:FRONT.E-(q.y-FRONT.Yh)/FRONT.s0}};
 $('front').addEventListener('pointerdown',e=>{if(!FRONT||S.venue==='immersive')return;const q=fp(e);const r=calc();if(Math.abs(q.x-r.cx)>r.CW/2||q.y<S.sb||q.y>S.sb+r.CH)return;scrDrag={dy:q.y-S.sb,dx:q.x-r.cx,pt:fp,h:true};$('front').setPointerCapture(e.pointerId);e.preventDefault()});
 $('front').addEventListener('pointermove',e=>{if(scrDrag){const q=scrDrag.pt(e);moveScreen(q.y-scrDrag.dy,scrDrag.h?q.x-scrDrag.dx:null);return}if(!FRONT||S.venue==='immersive')return;const q=fp(e),r=calc();$('front').style.cursor=(Math.abs(q.x-r.cx)<=r.CW/2&&q.y>=S.sb&&q.y<=S.sb+r.CH)?(planActive()?'ns-resize':'move'):''});
 ['pointerup','pointercancel'].forEach(t=>$('front').addEventListener(t,()=>{if(scrDrag){scrDrag=null;save()}}));}
$('sunOn').addEventListener('change',e=>{S.sun.on=e.target.checked;render()});
$('sunT').addEventListener('input',e=>{S.sun.t=+e.target.value/1000;render()});
$('sunWin').addEventListener('change',e=>{S.sun.win=e.target.value;render()});
$('front').addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-win]');if(!t)return;const id=t.dataset.win,o=new Set(S.sun.off||[]);o.has(id)?o.delete(id):o.add(id);S.sun.off=[...o];render()});
{const setFace=e=>{const svg=$('compass'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());let a=Math.atan2(q.x,-q.y)/RAD;S.sun.face=(Math.round(((a+360)%360)/15)*15)%360;render()};
 $('compass').addEventListener('click',setFace);$('compass').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){S.sun.face=(S.sun.face+(e.key==='ArrowRight'?15:345))%360;render();e.preventDefault()}})}
function pickRow(tr){if(!tr)return;S.pcr=null;S.mi=+tr.dataset.mi;S.li=+tr.dataset.li;fillLens();frameDefaults();fitLens();zeroShift();render()}
$('solCur').addEventListener('click',e=>pickRow(e.target.closest('tr[data-mi]')));
$('dSol').addEventListener('toggle',e=>{S.openSol=e.target.open;save()});
$('solView').addEventListener('toggle',e=>{if(e.target.open!==(S.solOpen!==false)){S.solOpen=e.target.open;save()}});
$('dCr').addEventListener('toggle',e=>{S.openCr=e.target.open;save()});
$('sol').addEventListener('click',e=>pickRow(e.target.closest('tr[data-mi]')));
$('sol').addEventListener('keydown',e=>{if(e.key==='Enter')pickRow(e.target.closest('tr[data-mi]'))});

$('nModels').textContent=NCUR;fillCats();fillAspect();if(S.mi>=MODELS.length)S.mi=0;fillLens();fillModels();
if(FRESH||MIG){S.li=DEFL;fillLens();frameDefaults();fitLens();zeroShift()}if(S.content==='img')S.content='none';if(S.py==null)zeroShift();render();


/* lys/mørk tilstand: følger systemet, indtil man vælger selv (gemmes) */
const MQ=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function applyMode(){const dark=S.mode?S.mode==='dark':!!(MQ&&MQ.matches);const root=document.documentElement;
  if(S.mode)root.dataset.theme=S.mode;else delete root.dataset.theme;root.classList.toggle('isdark',dark);
  const b=$('modeBtn');b.setAttribute('aria-pressed',dark);const t=dark?'Skift til lys tilstand':'Skift til mørk tilstand';b.title=t;b.setAttribute('aria-label',t)}
// PDF: hele siden som den ser ud (tema, sprog, mørk/lys), med alle bokse foldet ud; tekst og tal kan kopieres, filen kan ikke redigeres
// PDF-status: vises når filen ikke kunne gemmes automatisk (fx i en visning uden download-adgang)
function pdfToast(html){let t=$('pdfToast');if(!t){t=document.createElement('div');t.id='pdfToast';t.setAttribute('role','status');document.body.appendChild(t);
    t.addEventListener('click',e=>{if(e.target.closest('[data-x]'))t.hidden=true;if(e.target.closest('[data-print]')){t.hidden=true;printPage()}})}
  t.innerHTML=html+'<button type="button" class="px" data-x="1" aria-label="Luk">×</button>';t.hidden=!html}
let PDFURL=null;
// udskrift: alle bokse foldes ud, knapper og statusboks skjules (se @media print)
function printPage(){const closed=[...document.querySelectorAll('details')].filter(d=>!d.open&&!d.closest('[hidden]'));closed.forEach(d=>d.open=true);
  const done=()=>{closed.forEach(d=>d.open=false);window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);
  setTimeout(()=>{try{window.print()}catch(e){done()}},150)}
// PDF-valg: bokse med nummer (01, 02 …) som kan til- og fravælges; fravalgte skjules, mens PDF'en laves
// 11 (Løsninger) og 12 (Formler) tilbydes ikke – de kommer aldrig med i PDF'en
const PDF_NEVER=['11','12'];
function pdfSections(all){const out=[];document.querySelectorAll('.no').forEach(n=>{const el=n.closest('#kpis')||n.closest('.card,.view');if(!el||out.some(x=>x.el===el)||!el.getClientRects().length)return;
  if(!all&&PDF_NEVER.includes(n.textContent.trim()))return;
  const t=n.nextSibling&&n.nextSibling.nodeType===3?n.nextSibling.nodeValue.trim():'';out.push({no:n.textContent.trim(),t,el})});return out.sort((a,b)=>a.no.localeCompare(b.no))}
// «Dine oplysninger» (firma, person, dato, projekt, logo) – huskes i browseren og vises nederst til venstre i PDF'en
const PDFME_K='kasteplan_pdfme';
function pdfMe(){try{return JSON.parse(localStorage.getItem(PDFME_K))||{}}catch(e){return {}}}
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function pdfHead(me){if(!me||!(me.co||me.person||me.proj||me.logo))return null;const h=document.createElement('div');h.className='pdfhead card';
  const dt=me.date?new Date(me.date+'T12:00').toLocaleDateString({da:'da-DK',en:'en-GB',ja:'ja-JP'}[S.lang]||'en-GB',{year:'numeric',month:'long',day:'numeric'}):'';
  h.innerHTML=(me.logo?`<img src="${me.logo}" alt="">`:'')+`<div class="notr">${me.proj?`<div class="ph1">${esc(me.proj)}</div>`:''}<div class="ph2">${[me.co,me.person,dt].filter(Boolean).map(esc).join(' · ')}</div></div>`;return h}
function pdfDialog(){const secs=pdfSections(),sel=S.pdfSel||{},me=pdfMe();let d=$('pdfDlg');if(d)d.remove();
  d=document.createElement('dialog');d.id='pdfDlg';d.className='pdfdlg';const v=k=>esc(me[k]||'');
  d.innerHTML=`<form method="dialog"><h3>Vælg hvad PDF'en skal vise</h3><label class="pdfall"><input type="checkbox" id="pdfAll"> <b>Alle</b></label><div class="pdflist">`+
    secs.map(s=>`<label><input type="checkbox" data-no="${s.no}"${sel[s.no]===false?'':' checked'}> <span class="no">${s.no}</span> <span class="notr">${esc(s.t)}</span></label>`).join('')+
    `</div><button type="button" class="btn pdfmebtn" aria-expanded="false">Dine oplysninger</button>
    <div class="pdfme" hidden>
      <label>Firmanavn<input type="text" data-me="co" value="${v('co')}" autocomplete="organization"></label>
      <label>Person<input type="text" data-me="person" value="${v('person')}" autocomplete="name"></label>
      <label>Dato<input type="date" data-me="date" value="${esc(me.date||today())}"></label>
      <label>Projektnavn<input type="text" data-me="proj" value="${v('proj')}"></label>      <div class="pdflogo"><span>Firmalogo</span><img alt=""${me.logo?'':' hidden'}><button type="button" class="btn" data-lg="pick">Vælg logo…</button><button type="button" class="btn" data-lg="del"${me.logo?'':' hidden'}>Fjern logo</button><input type="file" accept="image/*" hidden></div>
    </div>
    <div class="pdfbtns"><button type="button" class="btn" value="no">Annuller</button><button type="submit" class="btn pdfgo" value="ok">Lav PDF</button></div></form>`;
  document.body.appendChild(d);const boxes=[...d.querySelectorAll('[data-no]')],all=d.querySelector('#pdfAll');
  {const mb=d.querySelector('.pdfmebtn'),pm=d.querySelector('.pdfme');mb.addEventListener('click',()=>{pm.hidden=!pm.hidden;mb.setAttribute('aria-expanded',!pm.hidden)});
   const im=pm.querySelector('img'),fi=pm.querySelector('input[type=file]'),del=pm.querySelector('[data-lg="del"]');if(me.logo)im.src=me.logo;
   pm.querySelector('[data-lg="pick"]').addEventListener('click',()=>fi.click());
   del.addEventListener('click',()=>{me.logo='';im.hidden=true;del.hidden=true});
   // logoet skaleres ned (maks. 600 px), så det kan gemmes i browseren
   fi.addEventListener('change',()=>{const f=fi.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const g=new Image();g.onload=()=>{const k=Math.min(1,600/Math.max(g.width,g.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(g.width*k));c.height=Math.max(1,Math.round(g.height*k));c.getContext('2d').drawImage(g,0,0,c.width,c.height);
     me.logo=c.toDataURL('image/png');im.src=me.logo;im.hidden=false;del.hidden=false};g.src=rd.result};rd.readAsDataURL(f);fi.value=''})}
  const sync=()=>{const n=boxes.filter(x=>x.checked).length;all.checked=n===boxes.length;all.indeterminate=n>0&&n<boxes.length;d.querySelector('.pdfgo').disabled=!n};sync();
  all.addEventListener('change',()=>{boxes.forEach(x=>x.checked=all.checked);sync()});boxes.forEach(x=>x.addEventListener('change',sync));
  d.querySelector('[value="no"]').addEventListener('click',()=>d.close());d.addEventListener('close',()=>d.remove());
  d.querySelector('form').addEventListener('submit',e=>{e.preventDefault();S.pdfSel={...sel};boxes.forEach(x=>S.pdfSel[x.dataset.no]=x.checked);save();
    d.querySelectorAll('[data-me]').forEach(x=>me[x.dataset.me]=x.value.trim());try{localStorage.setItem(PDFME_K,JSON.stringify(me))}catch(err){}d.close();
    exportPDF(pdfSections(true).filter(s=>PDF_NEVER.includes(s.no)||!S.pdfSel[s.no]).map(s=>s.el),me)});
  d.showModal()}
async function exportPDF(hide=[],me=null){const b=$('pdfBtn');if(b.getAttribute('aria-busy')==='true')return;b.setAttribute('aria-busy','true');pdfToast('');
  hide.forEach(el=>el.classList.add('pdfhide'));const head=pdfHead(me);
  // oplysningsboksen lægges til højre for indholdet, med bunden ud for den nederste boks (siden bliver bredere, hvis der mangler plads)
  const hold=head&&document.createElement('div');if(hold){hold.className='pdfhold';hold.append(head)}
  const placeHead=()=>{if(!hold)return;const w=document.querySelector('.wrap').getBoundingClientRect(),g=document.querySelector('.wrap > .grid').getBoundingClientRect();
    hold.style.left=Math.round(w.right+scrollX)+'px';hold.style.top=Math.round(g.bottom+scrollY-head.offsetHeight)+'px'};
  if(hold){document.body.append(hold);placeHead()}
  // download-adgangen hentes med det samme (mens klikket stadig er «frisk»), og der ventes højst 4 s på den
  const dlP=(window.claude&&window.claude.use)?Promise.race([Promise.resolve(window.claude.use('downloads')).catch(()=>null),new Promise(r=>setTimeout(()=>r(null),4000))]):Promise.resolve(null);
  const closed=[...document.querySelectorAll('details')].filter(d=>!d.open&&!d.closest('[hidden]'));let step='load';
  try{if(!window.PTP_PDF)await new Promise((ok,no)=>{const sc=document.createElement('script');sc.src='pdfexport.js';sc.onload=ok;sc.onerror=()=>no(new Error('load'));document.head.appendChild(sc)});
    step='make';closed.forEach(d=>d.open=true);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(r,120))));placeHead();
    const blob=await window.PTP_PDF({title:'Throw Planner'});closed.forEach(d=>d.open=false);
    const vn={aud:'Auditorium',museum:'Museum',theater:'Theatre',immersive:'Immersive'}[S.venue]||S.venue,dt=new Date().toISOString().slice(0,10);
    // filnavn: projektnavn og firma fra «Dine oplysninger», ellers Throw-Planner_tema
    const fn=t=>String(t||'').replace(/[\\/:*?"<>|\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,60),own=me?[me.proj,me.co].map(fn).filter(Boolean):[];
    const name=own.length?`${own.join('_')}_${me.date||dt}.pdf`:`Throw-Planner_${vn}_${dt}.pdf`;step='save';TRK('PDF',{tema:S.venue});
    if(PDFURL)URL.revokeObjectURL(PDFURL);PDFURL=URL.createObjectURL(blob);
    const dl=await dlP;let why='';
    if(dl){try{await dl.save({filename:name,data:blob});pdfToast('');return}catch(e){const c=(e&&e.code)||'unavailable';if(c==='declined'){pdfToast('');return}why=c}}
    else if(!window.claude){const a=document.createElement('a');a.href=PDFURL;a.download=name;document.body.appendChild(a);a.click();a.remove();pdfToast('');return}
    else why='unavailable';
    // ingen automatisk gemning her – tilbyd selv at hente eller åbne filen (klik = brugerhandling)
    pdfToast(`<span>På et claude.ai-link kan kun ejeren af appen gemme filer${why?` (${why})`:''}. Brug web-app-versionen af Throw Planner for at gemme PDF.</span>`)}
  catch(e){console.warn('pdf',e);closed.forEach(d=>d.open=false);pdfToast(`<span>${step==='load'?'PDF-modulet kunne ikke hentes – tjek internetforbindelsen og prøv igen.':'PDF\'en kunne ikke laves i denne browser.'}</span>`)}
  finally{b.removeAttribute('aria-busy');hide.forEach(el=>el.classList.remove('pdfhide'));if(hold)hold.remove()}}
$('pdfBtn').addEventListener('click',pdfDialog);
// boks 03: terminalsiden (input/output) i stort format
$('pjTerm').addEventListener('click',()=>{const nm=MODELS[slotMI()].m.split(' (')[0],k=pjSlug(nm),src=termImg(k),url=termRes(k);if(!src)return;
  const d=document.createElement('dialog');d.className='pdfdlg termdlg';
  d.innerHTML=`<h3>${esc(nm)} – input/output-terminaler</h3><img src="${src}" alt="Terminalsiden på ${esc(nm)}"><div class="pdfbtns">${url?`<a class="manbtn termhi" href="${url}" target="_blank" rel="noopener noreferrer">Større billeder hos Panasonic ↗</a>`:''}<button type="button" class="btn" value="no">Luk</button></div>`;
  d.querySelector('[value="no"]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>d.remove());
  document.body.appendChild(d);d.showModal()});
// boks 09: klik på forklaringen for at vise/skjule lag i tegningen
document.querySelectorAll('[data-l9]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.l9;S.l9={...(S.l9||{}),[k]:!((S.l9||{})[k]!==false)};render()}));
