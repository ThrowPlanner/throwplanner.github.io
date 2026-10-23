// boks 03: udgåede (EOL) projektorer og optikker – find aktuelle projektorer, der kan bruge den gamle optik
const TDC_IMG='https://docs.connect.panasonic.com/projector/calculator/tdc/img/';
// aktuelle modeller (og optikkens plads), der kan bruge en af optikkens ET-numre
const lensFits=l=>{const c=etCodes(l[0]);if(!c.length)return [];const r=[];
  for(let i=0;i<NCUR;i++){const li=MODELS[i].L.findIndex(x=>etCodes(x[0]).some(k=>c.includes(k)));if(li>=0)r.push([i,li])}return r};
function eolUI(ri){const b=$('eolBox'),m=ri.m,l=ri.ln,me=isEOL(m),le=lnEOL(l);
  // rødt, gennemsigtigt lag over billedet af en udgået projektor/optik
  $('pjImg').classList.toggle('eolimg',me);$('lnImg').classList.toggle('eolimg',le);
  b.hidden=!me&&!le;if(b.hidden){b.innerHTML='';return}
  // billeder: de udgåede ligger ikke i appen – hent dem fra Panasonics beregner
  if(me&&!IMGS['p:'+m.img])$('pjImg').innerHTML=`<img src="${TDC_IMG}pj/${encodeURIComponent(m.img)}" alt="${esc(m.m)}" onerror="this.outerHTML='<span class=none>Intet billede</span>'">`;
  if(l[6]&&l[6]!=='NONE'&&!IMGS['l:'+l[6]])$('lnImg').innerHTML=`<img src="${TDC_IMG}lens/${encodeURIComponent(l[6])}" alt="${esc(l[0])}" onerror="this.outerHTML='<span class=none>Intet billede</span>'">`;
  if(me)$('pjLink').href='https://docs.connect.panasonic.com/projector/calculator/tdc/';
  const fits=lensFits(l),code=etCodes(l[0]).join(' / ');
  let h='';
  if(me)h+=`<div class="eolhead"><span class="eoltag">EOL</span><b>Udgået projektormodel</b></div><p>${m.eol==='d'?'Sælges kun fra restlager.':m.eol==='x'?'Ikke i Panasonics aktuelle EU-sortiment.':'Ikke længere i Panasonics sortiment.'} Data fra Panasonics Throw Distance Calculator.</p>`;
  if(!code)h+=`<p>Standardoptikken sidder fast i projektoren og kan ikke flyttes til en anden model.</p>`;
  else if(fits.length)h+=`<p class="eolq">${le?'<span class="eoltag">EOL</span> ':''}<b class="notr">${esc(code)}</b> passer på disse aktuelle projektorer:</p><div class="eolfit">${fits.map(([i,li])=>`<button type="button" class="chip notr" data-eolm="${i}" data-eoll="${li}" title="Skift til ${esc(MODELS[i].m)} med samme optik">${esc(MODELS[i].m.split(' (')[0])}</button>`).join('')}</div>`;
  else h+=`<p class="eolq"><span class="eoltag">EOL</span> <b class="notr">${esc(code)}</b> er udgået – ingen aktuelle projektorer kan bruge den.</p>`;
  if(b.dataset.h!==h){b.dataset.h=h;b.innerHTML=h}}
// klik på en aktuel projektor: skift til den med samme optik (afstand og billedstørrelse bevares)
$('eolBox').addEventListener('click',e=>{const t=e.target.closest('[data-eolm]');if(!t)return;
  const mi=+t.dataset.eolm,li=+t.dataset.eoll;S.cat=0;fillCats();fillModels();S.pcr=null;S.mi=mi;S.li=li;
  fillLens();frameDefaults();zeroShift();render();TRK('EOL optik',{fra:(etCodes(MODELS[mi].L[li][0])[0]||''),til:MODELS[mi].m})});
