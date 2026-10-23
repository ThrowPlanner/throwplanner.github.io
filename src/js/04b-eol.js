// boks 03: udgåede (EOL) projektorer og optikker – find aktuelle projektorer, der kan bruge den gamle optik
const TDC_IMG='https://docs.connect.panasonic.com/projector/calculator/tdc/img/';
// aktuelle modeller (og optikkens plads), der kan bruge en af optikkens ET-numre
const lensFits=l=>{const c=etCodes(l[0]);if(!c.length)return [];const r=[];
  for(let i=0;i<NCUR;i++){const li=MODELS[i].L.findIndex(x=>etCodes(x[0]).some(k=>c.includes(k)));if(li>=0)r.push([i,li])}return r};
// flyrammer: Panasonics gamle ET-PFD-rammer (data/mounts.json fra «Optional Accessories») + ET-RFD-rammerne i FRAMES
const MOUNTS=/*__MOUNTS__*/;
const pjNames=m=>m.m.split(' (')[0].split('/').map(p=>p.startsWith('PT-')?p:'PT-'+p);
// Panasonic skriver fx PT-DZ21K2 / PT-REQ15L for samme projektor som vores navne; et ekstra K/S/L til sidst tæller som samme model
const pjIn=(m,list)=>pjNames(m).some(n=>list.some(x=>x===n||(x.length===n.length+1&&x.startsWith(n)&&/[KSL]$/.test(x))));
// rammer med samme aktuelle projektorer står på én linje
function eolFrames(m){const g=[];
  const add=(id,cur,note,eol)=>{const key=cur.join(',');let x=g.find(y=>y.key===key);if(!x)g.push(x={key,ids:[],cur,note:'',eol:true});x.ids.push(id);if(note&&!x.note)x.note=note;x.eol=x.eol&&!!eol};
  const cur=fn=>{const r=[];for(let i=0;i<NCUR;i++)if(fn(MODELS[i]))r.push(i);return r};
  FRAMES.forEach(f=>{if(pjNames(m).some(n=>f.re.test(n)))add(f.id,cur(x=>pjNames(x).some(n=>f.re.test(n))),'',false)});
  MOUNTS.forEach(o=>{if(pjIn(m,o.models))add(o.id,cur(x=>pjIn(x,o.models)),o.note,o.eol)});
  return g}
const chips=a=>a.map(i=>`<button type="button" class="chip notr" data-eolm="${i}" data-eoll="-1" title="Skift til ${esc(MODELS[i].m)}">${esc(MODELS[i].m.split(' (')[0])}</button>`).join('');
function eolUI(ri){const b=$('eolBox'),m=ri.m,l=ri.ln,me=isEOL(m),le=lnEOL(l);eolFrameUI(m);
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
// boks 04: kan den udgåede projektors flyramme genbruges til en aktuel projektor?
function eolFrameUI(m){const b=$('eolFrame');b.hidden=!isEOL(m);if(b.hidden){b.innerHTML='';b.dataset.h='';return}
  const ms=eolFrames(m);
  const h=`<div class="eolhead"><span class="eoltag">EOL</span><b>Flyramme fra den udgåede projektor</b></div>`+(ms.length?ms.map(x=>`<div class="eolmi"><b class="notr">${esc(x.ids.join(' / '))}</b>${x.eol?' <span class="eoltag">EOL</span>':''}`+
      (x.cur.length?`<p class="eolq">passer også på:</p><div class="eolfit">${chips(x.cur.slice(0,8))}${x.cur.length>8?`<details class="eolmore"><summary class="chip">+${x.cur.length-8}</summary><div class="eolfit">${chips(x.cur.slice(8))}</div></details>`:''}</div>`
        :`<p>Kun udgåede projektorer – kan ikke genbruges til en aktuel model.</p>`)+(x.note?`<p class="eolnote notr">${esc(x.note)}</p>`:'')+'</div>').join('')
    :`<p>Panasonic angiver ingen flyramme for denne model.</p>`);
  if(b.dataset.h!==h){b.dataset.h=h;b.innerHTML=h}}
// klik på en aktuel projektor: skift til den med samme optik (afstand og billedstørrelse bevares).
// Fra flyrammen (li −1): samme optik hvis den passer, ellers vælger appen den optik, der passer til afstanden
const eolClick=e=>{const t=e.target.closest('[data-eolm]');if(!t)return;
  const mi=+t.dataset.eolm,old=etCodes(LN()[0]);let li=+t.dataset.eoll,fit=false;
  if(li<0){li=MODELS[mi].L.findIndex(x=>etCodes(x[0]).some(k=>old.includes(k)));if(li<0){li=0;fit=true}}
  S.cat=0;fillCats();fillModels();S.pcr=null;S.mi=mi;S.li=li;
  fillLens();frameDefaults();if(fit)fitLens();zeroShift();render();TRK(+t.dataset.eoll<0?'EOL flyramme':'EOL optik',{til:MODELS[mi].m})};
$('eolBox').addEventListener('click',eolClick);$('eolFrame').addEventListener('click',eolClick);
