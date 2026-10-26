/* ===== SPROG (dansk er kildesproget; engelsk og japansk oversættes på tekstniveau efter hver tegning) ===== */
const I18N=/*__I18N__*/;
const I18=(()=>{const L={en:1,ja:2},M={};
  for(const lg of ['en','ja']){const ex=new Map(),ph=new Map();for(const r of I18N){(r[3]?ex:ph).set(r[0],r[L[lg]]);if(!r[3])ex.set(r[0],r[L[lg]])}
    const keys=[...ph.keys()].sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+'));
    M[lg]={ex,ph,re:new RegExp('(^|[^\\p{L}])('+keys.join('|')+')(?![\\p{L}])','gu')}}
  const conv=n=>/^\d{1,3}(\.\d{3})+$/.test(n)?n.replace(/\./g,','):n.replace(/,/g,'.');
  const tr=(src,lg)=>{if(lg==='da'||!M[lg]||!/[A-Za-zÆØÅæøå\d]/.test(src))return src;const D=M[lg],nums=[];
    const norm=src.replace(/\d[\d.,]*\d|\d/g,m=>{nums.push(m);return '#'}),core=norm.replace(/\s+/g,' ').trim();let out;
    if(D.ex.has(core))out=norm.replace(norm.trim(),D.ex.get(core));
    else out=norm.replace(D.re,(m,pre,w)=>{const k=w.replace(/\s+/g,' ');return pre+(D.ph.has(k)?D.ph.get(k):w)});
    let i=0;return out.replace(/#/g,()=>i<nums.length?conv(nums[i++]):'#')};
  const TX=new WeakMap(),AT=new WeakMap(),ATTRS=['title','aria-label','placeholder'];
  const skip=el=>!el||el.closest('script,style,.notr,textarea');
  const doText=n=>{if(skip(n.parentElement))return;const r=TX.get(n);const src=r&&n.nodeValue===r.out?r.src:n.nodeValue;const out=tr(src,S.lang);TX.set(n,{src,out});if(n.nodeValue!==out)n.nodeValue=out};
  const doAttr=(el,a)=>{if(skip(el))return;const v=el.getAttribute(a);if(v==null)return;let m=AT.get(el);if(!m){m={};AT.set(el,m)}const r=m[a];const src=r&&v===r.out?r.src:v;const out=tr(src,S.lang);m[a]={src,out};if(v!==out)el.setAttribute(a,out)};
  const walk=root=>{if(root.nodeType===3){doText(root);return}if(root.nodeType!==1)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())doText(n);
    ATTRS.forEach(a=>{if(root.hasAttribute&&root.hasAttribute(a))doAttr(root,a);root.querySelectorAll('['+a+']').forEach(e=>doAttr(e,a))})};
  const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')doText(m.target);else if(m.type==='attributes')doAttr(m.target,m.attributeName);else m.addedNodes.forEach(walk)}});
  return {all(){document.documentElement.lang=S.lang;walk(document.body)},start(){mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS})},tr}})();
function render(){
  syncPlan();blendAuto();constrain();LASTPY=S.py;LASTSB=S.sb;
  {const A={};if(hitOn('depth'))A.dist='→';if(hitOn('width')){A.cw='↔';A.cd='↔'}if(hitOn('height')){A.ch='↑';A.cd=A.cd||'↑';if(!A.cw)A.cw='↑'}if(hitOn('top'))A.sb='↑';if(hitOn('bsd'))A.bsd='→';
   ['dist','cw','ch','cd','sb','bsd'].forEach(id=>{const el=$('ha_'+id);el.hidden=!A[id];el.textContent=A[id]||'';el.title=A[id]?'Grænsen for rummet er nået':''})}
  const r=calc();
  const set=(id,v)=>{const el=$(id);if(document.activeElement!==el)el.value=v};
  if(fillLens.mi!==slotMI())fillLens();$('model').value=slotMI();$('lens').value=slotLI();{const o=$('lens').selectedOptions[0];if(o)$('lens').title=o.textContent}
  {const lk=!!S.lockLens;$('lens').disabled=lk;$('lensLock3').setAttribute('aria-pressed',lk);$('lensLock3').title=lk?'Optikken er låst – klik for at låse op':'Lås optikken – så skifter appen den ikke automatisk'}$('aspect').value=S.ak;$('cat').value=S.cat;$('minLm').value=S.minLm;
  // 3 decimaler (mm) som Panasonics Throw Distance Calculator
  set('dist',S.L.toFixed(3));set('cw',S.cw.toFixed(3));set('ch',r.CH.toFixed(3));set('cd',Math.round(Math.hypot(r.CW,r.CH)/IN));
  set('sb',S.sb.toFixed(3));if(CLAMP){$('dist').value=S.L.toFixed(3);$('cw').value=S.cw.toFixed(3);$('ch').value=r.CH.toFixed(3);$('cd').value=Math.round(Math.hypot(r.CW,r.CH)/IN);$('sb').value=S.sb.toFixed(3)}
  set('rd',S.rd);set('rw',S.rw);set('rh',S.rh);set('r1',S.r1.toFixed(1));set('rp',S.rp.toFixed(2));set('gain',S.gain.toFixed(2));set('amb',S.amb);
  set('fw',Math.round(S.fw));set('fh',Math.round(S.fh));set('fd',Math.round(S.fd));set('bc',S.bc);set('br',S.br);set('ov',S.ov);
  {const pa=planActive(),lw=!!S.lockW,ll=!!S.lockL;$('cw').disabled=lw;$('ch').disabled=lw;$('cd').disabled=lw;$('dist').disabled=ll;
   $('lockL').setAttribute('aria-pressed',ll);$('lockW').setAttribute('aria-pressed',lw);$('dist').closest('.bigf').classList.toggle('locked',ll);$('cw').closest('.bigf').classList.toggle('locked',lw);
   $('lockL').title=ll?'Afstanden er låst – klik for at låse op':'Lås afstanden – så kan du se, om projektor og optik passer';$('lockW').title=lw?'Billedbredden er låst – klik for at låse op':'Lås billedbredden – så kan du se, om projektor og optik passer';
   // billedstørrelsen kan låses fra bredde, højde eller diagonal – det valgte mål holdes, hvis formatet skiftes
   const dim=S.lockDim||'w';$('lockW').setAttribute('aria-pressed',lw&&dim==='w');$('lockH').setAttribute('aria-pressed',lw&&dim==='h');$('lockD').setAttribute('aria-pressed',lw&&dim==='d');
   $('ch').closest('.row').classList.toggle('locked',lw&&dim==='h');$('cd').closest('.row').classList.toggle('locked',lw&&dim==='d');$('cw').closest('.bigf').classList.toggle('locked',lw&&dim==='w');
   $('lockH').title=lw&&dim==='h'?'Billedhøjden er låst – klik for at låse op':'Lås billedhøjden';$('lockD').title=lw&&dim==='d'?'Diagonalen er låst – klik for at låse op':'Lås diagonalen'}
  $('frame').checked=S.frame;$('frameBox').hidden=!S.frame;$('blend').checked=S.blend;$('portrait').checked=!!S.portrait;$('bauto').checked=!!S.bauto;$('bthRow').hidden=!S.bauto;$('bc').disabled=$('br').disabled=!!S.bauto;if(document.activeElement!==$('bth')&&S.bth)$('bth').value=S.bth;$('blendBox').hidden=!S.blend;$('blendOff').hidden=S.blend;
  {const on=stackOn();$('stackOn').checked=on;$('stackBox').hidden=!on;if(on){set('stack',r.stk);const n=(S.blend?r.N*r.R:1)*r.stk;
   $('stackHint').innerHTML=`Lyset ganges med ${r.stk}, så billedet bliver ${r.stk} gange lysere. Kontrasten i 06 regnes med det samlede lys.${n>r.stk?` I alt <b>${n}</b> projektorer.`:''}`;
   const L=stackLim();if(L)$('stackHint').innerHTML+=r.stk>L.max?`<span style="display:block;margin-top:4px;color:var(--bad);font-weight:600">${L.id} kan højst stable ${L.max} projektorer ved ${S.ceil?'loftmontering':'gulvmontering'} (Panasonic).</span>`:
     (S.ceil&&r.stk===3?`<span style="display:block;margin-top:4px">3 i loftet med ${L.id} kræver ET-LINK200/201 eller ET-LINK210/211.</span>`:'')}}
  fillFrames();const fsel=FRAMES.find(f=>f.id===S.frameId);['fw','fh','fd'].forEach(id=>$(id).disabled=!!(fsel&&fsel.dim));
  $('frameHint').innerHTML=(fsel&&fsel.stk?`Stacking: højst ${fsel.stk[0]} i loft · ${fsel.stk[1]} på gulv<br>`:'')+(fsel?(fsel.dim?`Officielle mål fra Panasonic · ${String(fsel.kg).replace('.',',')} kg uden projektor`:`Panasonic har ikke offentliggjort mål for ${fsel.id}. Skøn ud fra ET-RFD70 – ret til de rigtige mål.`):
    (framesFor(r.m).length?'Egne mål.':`Panasonic har ingen ramme i ET-RFD-serien til ${r.m.m}. Skøn: projektor + ${FRAME_ADD.join('/')} mm.`));
  $('sumMount').textContent=`${S.ceil?'Loft':'Bord'} · linse ${f2(S.py)} m${S.frame?' · '+(S.frameId==='custom'?'egen ramme':S.frameId):''}`;
  if(S.venue==='immersive')drawImmBlend(r);else{$('blendStd').hidden=false;$('blendImm').hidden=true;}drawCrBand();
  if(S.venue!=='immersive')$('sumBlend').textContent=(S.portrait?'Portræt · ':'')+[S.blend?`${Math.round(S.bc)}×${Math.round(S.br)} · ${S.ov} % overlap`:'',r.stk>1?`stacking ×${r.stk}`:''].filter(Boolean).join(' · ')||(S.portrait?'':'Fra');
  $('dMount').open=!!S.openMount;$('dBlend').open=!!S.openBlend;
  $('mDesk').setAttribute('aria-pressed',!S.ceil);$('mCeil').setAttribute('aria-pressed',S.ceil);
  {const im=S.venue==='immersive';$('c01').hidden=im;$('solView').hidden=im;$('shiftBar').hidden=im}
  document.documentElement.dataset.venue=S.venue;{const lb=document.querySelector('[data-content="none"]');if(lb)lb.hidden=S.venue==='immersive'}{const gb=document.querySelector('[data-content="golf"]');if(gb)gb.hidden=S.venue!=='golf';if(S.venue!=='golf'&&S.content==='golf')S.content='none'}$('sunBar').hidden=!SUNOK();document.querySelectorAll('[data-venue]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.venue===S.venue));
  {const V=S.venue;$('r1Lbl').textContent=STAND()?'Publikum fra':'Første stolerække';$('r1Row').hidden=V==='theater'||V==='immersive'||V==='golf';$('rpRow').hidden=STAND()||V==='theater'||V==='golf';$('crowdRow').hidden=!CROWDOPT();document.querySelectorAll('[data-crowd]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.crowd==='1')===(S.crowd!==false)));$('r1Row').hidden=$('r1Row').hidden||(CROWDOPT()&&S.crowd===false);
   $('trRow').hidden=$('rearRow').hidden=$('stDRow').hidden=$('stHRow').hidden=V!=='theater';set('stD',STAGE().toFixed(1));set('stH',STH().toFixed(2));$('bsdRow').hidden=!REAR();set('trows',Math.round(S.trows));set('bsd',S.bsd.toFixed(1));
   document.querySelectorAll('[data-rear]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.rear==='1')===!!S.rear))}
  document.querySelectorAll('[data-content]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.content===S.content));
  {const b=document.querySelector('[data-content="img"]');b.title=IMG?'Klik igen for at skifte billede':'Vælg et billede fra din computer'}
  
  // billeder
  {const imm=S.venue==='immersive';$('pjSlot').hidden=$('pjSlotInfo').hidden=!imm;
   if(imm){const k=SLOT();document.querySelectorAll('[data-slot]').forEach(b=>{const s=b.dataset.slot;b.setAttribute('aria-pressed',(k||'all')===s);b.classList.toggle('own',s!=='all'&&!!ownPj(s));b.style.opacity=s==='all'||(S.imm&&S.imm[s])?'':'.55'});
     const NM={v:'Front-væg',l:'Venstre væg',r:'Højre væg',f:'Gulv'};
     $('pjSlotInfo').innerHTML=k?(ownPj(k)?`${NM[k]} har sin egen projektor og optik. <button type="button" data-reset="${k}">Brug standard</button>`:`${NM[k]} bruger standard (alle flader). Vælg en model eller optik herunder for at give fladen sin egen.`)+(S.imm&&S.imm[k]?'':' Fladen er slået fra under «Lokalet set bagfra».')
       :'Standard for alle flader uden egen projektor. Vælg en flade for at give den en anden model eller optik.'}}
  const _sm=MODELS[slotMI()],_sl=_sm.L[slotLI()];const ri={m:_sm,ln:_sl};
  const pk='p:'+ri.m.img, lk='l:'+ri.ln[6];
  $('pjImg').innerHTML=(imgTag(pk,ri.m.m)||`<span class="none">${Object.keys(IMGS).length?'Intet billede':'Henter billede…'}</span>`)+(is4K(ri.m)?'<span class="b4k" title="4K"><b>4K</b><i>ULTRA <u>HD</u></i></span>':'');
  $('pjCap').textContent=ri.m.m;$('pjLink').href=pjURL(ri.m);$('pjLink').setAttribute('aria-label',`${ri.m.m} – specifikationer hos Panasonic`);
  $('lnImg').innerHTML=(ri.ln[6]&&ri.ln[6]!=='NONE'&&imgTag(lk,ri.ln[0]))||`<span class="none">${/Supplied|Standard/i.test(ri.ln[0])?'Indbygget standardlinse':'Intet billede'}</span>`;
  {const k=pjSlug(ri.m.m),src=termImg(k),b=$('pjTerm');if(b.dataset.k!==k+!!src){b.dataset.k=k+!!src;b.disabled=!src;$('pjTermImg').innerHTML=src?`<img src="${src}" alt="">`:'';
    $('pjTermTxt').textContent=src?'Input/output-terminaler':'Intet terminalbillede';b.title=src?`Vis terminalsiden på ${ri.m.m.split(' (')[0]}`:'Panasonic har intet terminalbillede for denne model'}}
  eolUI(ri);
  setMan('pjMan',MAN_PJ[pjSlug(ri.m.m)],ri.m.m.split(' (')[0]);{const c=lnCode(ri.ln);setMan('lnMan',c?MAN_LN[c]:MAN_PJ[pjSlug(ri.m.m)],ri.ln[0])}$('lnCap').textContent=ri.ln[0];$('lnLink').href=lnURL(ri.m,ri.ln);$('lnLink').setAttribute('aria-label',`${ri.ln[0]} – specifikationer hos Panasonic`);

  const wpr=(r.Dzw*IN*r.aw/Math.hypot(r.aw,r.ah)*r.kx), wpt=(r.Dzt*IN*r.aw/Math.hypot(r.aw,r.ah)*r.kx);
  const LK=(S.lockL||S.lockW)?(()=>{const ok=r.zoomOK&&r.sizeOK,lo=Math.min(r.Lw,r.Lt),hi=Math.max(r.Lw,r.Lt),c=ok?'var(--ok)':'var(--bad)';
     const need=r.fixed?`${f3(r.Lw)} m`:`${f3(lo)}–${f3(hi)} m`;
     const what=S.lockL&&S.lockW?`${f3(S.L)} m og ${f3(S.cw)} m bredde`:S.lockL?`afstand ${f3(S.L)} m`:`bredde ${f3(S.cw)} m`;
     return `<span style="display:block;margin-bottom:4px;color:${c};font-weight:600">${ok?'Passer':'Passer ikke'}: ${what}${ok?'':` – med denne optik skal afstanden være ${need} for ${f3(S.cw)} m bredde`}</span>`})():'';
  // låst afstand: optikker til den valgte projektor, der giver billedet ved den låste afstand
  const LS=S.lockL&&S.venue!=='immersive'?(()=>{const m=r.m;let ai=aiFor(m);if(ai<0)ai=0;const D=r.D,fits=[];
    m.L.forEach((l,li)=>{const row=l[2][ai];if(!row||!(row[0]>0))return;const fx=l[1]==='F',a=distAt(row,D,0),b=distAt(row,D,1);
      const sizeOK=D>=row[4]-.5&&D<=row[5]+.5,z=fx?0:zoomFor(row,D,S.L);const ok=sizeOK&&(fx?Math.abs(S.L-a)<=.015*a:(z>=-0.002&&z<=1.002));
      if(ok)fits.push({li,l,z,fx})});
    const btn=f=>`<button type="button" class="lsug${f.li===S.li?' cur':''}" data-lsug="${f.li}">${f.l[0]} · ${f.fx?'fast':Math.round(f.z*100)+' %'}</button>`;
    return `<span class="lsugbox"><b class="notr">${m.m.split(' (')[0]}</b><br>${fits.length?`Passende optik ved ${f3(S.L)} m og ${f3(r.W)} m bredde:`:`Ingen passende optik ved ${f3(S.L)} m og ${f3(r.W)} m bredde.`}${fits.length?'<span class="lsugs">'+fits.map(btn).join('')+'</span>':''}</span>`})():'';
  $('sizeHint').innerHTML=LK+LS+(CLAMP?`<span style="color:var(--warn)">${CLAMP}</span>`:'')+(planActive()?'<b>Bredden er koblet til lærredet på plantegningen.</b> ':'')+(S.blend?`Samlet billede. Pr. projektor: <b>${f3(r.W)} × ${f3(r.H)} m</b> (${fi(r.D)}″).`:
    `${r.fixed?'Billedstørrelse':'Maksimal billedstørrelse'} ved ${f3(S.L)} m: <b>${f3(wpr)} × ${f3(wpr*r.H/r.W)} m</b> (${fi(Math.hypot(wpr,wpr*r.H/r.W)/0.0254)}″)`);
  $('pjinfo').innerHTML=`${fi(ri.m.lm)} lm · kontrast ${fi(ri.m.cr)}:1 · ${ri.m.res.join('×')} · ${ri.m.dim.join('×')} mm · ${((ri.ln[7]&&ri.ln[7][0])||'n')==='u'?'ultrakort kast (kabinet foran spejlet)':((ri.ln[7]&&ri.ln[7][0])||'n')==='l'?'L-formet linse (kabinet lodret)':'linse rager '+fi(ri.ln[5]||0)+' mm frem'}`+
    (r.aspOK?'':`<br><span style="color:var(--warn)">${S.ak} findes ikke på denne model – bruger ${r.m.asp[r.ai]}.</span>`);
  $('blendHint').innerHTML=(BAUTO?`<span style="display:block;margin-bottom:4px;font-weight:600;color:${BAUTO.ok?'var(--ok)':'var(--bad)'}">${BAUTO.ok?`Auto: ${BAUTO.n} × ${BAUTO.r} = ${BAUTO.n*BAUTO.r} projektorer giver ${f2(r.CW)} × ${f2(r.CH)} m ved ${f2(S.L)} m`:BAUTO.small?`Billedet pr. projektor bliver for lille til optikken ved ${f2(S.L)} m – brug færre projektorer, en anden optik eller en kortere afstand`:`Kan ikke dækkes med højst 8 × 4 projektorer ved ${f2(S.L)} m – vælg en anden optik eller afstand`}</span>`:'')+(S.blend?`Blend-zone <b>${f2(r.W*r.o)} m</b> (${fi(r.bzPx)} px) · samlet <b>${fi(r.pxW)} × ${fi(r.pxH)} px</b> · afstand mellem projektorer ${f2(r.pitchX)} m`:'');

  if(S.venue==='immersive'){const st=immStats(r),req=crMin();const ps=[...st.bad.map(q=>pill('bad',`${q.name} kan ikke dækkes`)),st.worst&&st.worst.cr<req&&pill('warn',`Kontrast under ${f2(req,req%1?1:0)}:1 (${st.worst.name})`)].filter(Boolean);
    $('topStatus').innerHTML=ps.length?ps.join(''):st.ok.length?pill('ok','Opstillingen virker'):''}else{
  const SOV=stackOver(r.stk);
  const allOK=!SOV&&r.cr>=crMin()&&r.zoomOK&&r.sizeOK&&r.shOK&&!r.roomIssues.length&&!r.clashX&&!r.clashY&&!r.hit.length&&!r.presHit;
  $('topStatus').innerHTML=allOK?pill('ok','Opstillingen virker'):[!r.zoomOK&&pill('bad',r.fixed?'Afstand passer ikke':'Uden for zoom'),!r.sizeOK&&pill('warn','Størrelse uden for linsens område'),!r.shOK&&pill('bad','Uden for lens shift'),(r.clashX||r.clashY)&&pill('bad','Projektorer kolliderer'),(r.cr<crMin())&&pill('warn',`Kontrast under ${f2(crMin(),crMin()%1?1:0)}:1`),r.hit.length&&pill('warn',r.stand?'Publikum i lysstrålen':`Publikum i lysstrålen (${r.hit.length} ${r.hit.length===1?'række':'rækker'})`),r.roomIssues.length&&pill('warn','Rum: '+r.roomIssues.join(', '))].filter(Boolean).join('');
  if(r.presHit)$('topStatus').innerHTML+=pill('warn','Taleren skygger på lærredet');
  if(SOV)$('topStatus').innerHTML+=pill('warn',`${SOV.id}: højst ${SOV.max} stablede projektorer`)}
  GCUR=S.venue==='golf'?golfCalc(r):null;
  if(GCUR){const bad=GCUR.ck.filter(c=>c.l!=='ok');if(bad.length){const st=$('topStatus');st.innerHTML=st.innerHTML.replace(/<span class="pill ok">[^<]*<\/span>/,'')+bad.map(c=>pill(c.l==='bad'?'bad':'warn',c.t)).join('')}}

  const K=(cls,k,v,s,vc='')=>`<div class="kpi ${cls}"><span class="k">${k}</span><span class="v ${vc}">${v}</span><span class="s">${s}</span></div>`;
  const o=r.outer;
  const KH='<h3 class="kh"><span class="no">07</span>Nøgletal</h3>';
  if(S.venue==='immersive')$('kpis').innerHTML=KH+immKPI(r,K);else $('kpis').innerHTML=KH+
    K(r.zoomOK?'ok':'bad','Zoomfaktor',r.fixed?'Fast':`${f2(S.L/r.Lw,1)}<small>x</small>`,r.fixed?`linse kaster ${f3(r.Lw)} m`:r.zoomOK?`linsen kan 1,0–${f2(r.Lt/r.Lw,1)}x`:(r.z<0?'projektor for tæt på':'projektor for langt væk'))+
    K('','Afstand L',`${f3(S.L)}<small>m</small>`,r.fixed?`aktuel TR ${f2(r.Lw/r.W)}:1`:`linse ${f3(r.Lw)}–${f3(r.Lt)} m · aktuel TR ${f2(S.L/r.W)}:1`)+
    K(r.sizeOK?'':'warn',S.blend?'Billede pr. projektor':'Billede',`${f3(r.W)}<small>×</small>${f3(r.H)}<small>m</small>`,S.blend?`${fi(r.D)}″ · samlet ${fi(r.pxW)}×${fi(r.pxH)} px`:`${fi(r.D)}″ · ${fi(r.ew)}×${fi(r.eh)} px`,'sm')+
    K(r.shOK?'ok':'bad','Lens shift V / H',`${Math.round(r.sv*100)}<small>/</small>${Math.round(r.sh*100)}<small>%</small>`,(S.blend&&r.N>1&&r.shC.some(v=>Math.abs(v-r.sh)>.004)?`H pr. projektor ${r.shC.map(v=>Math.round(v*100)).join(' / ')} % · `:'')+(r.shOK?'inden for linsens shift':'uden for linsens shift'))+
    K('','Lys pr. projektor',`${fi(r.lux)}<small>lux</small>`,`${fi(r.nits)} cd/m² · kontrast ${fi(r.cr)}:1`)+
    K((r.roomIssues.length||r.clashX||r.clashY)?'warn':'',S.frame?`Flyramme ${S.frameId==='custom'?'(egen)':S.frameId}`:'Projektor (B×H×D)',`${mm(o[0])}<small>×</small>${mm(o[1])}<small>×</small>${mm(o[2])}<small>mm</small>`,(r.clashX||r.clashY)?'projektorer kolliderer':`bagkant ${f3(r.outBack)} m fra lærred`,'sm');

  $('sideCap').textContent=S.venue==='immersive'?'flader og projektorer set fra siden':`træk projektoren · L ${f3(S.L)} m · linse ${f3(S.py)} m${Math.abs(r.sh)>.004?` · H-shift: projektor ${f3(Math.abs(S.px))} m til ${S.px>0?'højre':'venstre'}`:''}`;
  drawSunUI();drawGolfPanel(GCUR);drawFront(r);drawSide(r);drawTop(r);drawShiftBar(r);drawContrast(S.venue==='immersive'?immCrR(r):r);drawPlan(r);solutions(r);formula(r);save();
}

