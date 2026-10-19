/* ===== QUICK GUIDE (rundvisning med spotlight og pil på de vigtigste kasser) ===== */
(()=>{
const tr=s=>I18.tr(s,S.lang);
const qa=s=>document.querySelector(s);
// [element, boks-nr, titel, tekst] – dansk er kildesproget (oversættelser i i18n/translations.txt)
const STEPS=[
 [()=>qa('.venue'),'','Vælg lokaletype','Start her: vælg Auditorium, Museum, Teater, Immersive eller Golf Sim. Det ændrer tegninger og regler.'],
 [()=>qa('#c01 .big'),'01','Afstand og billedbredde','Det vigtigste: indtast afstand L og billedbredde. Hængelåsen holder en værdi fast, så du kan se, om projektor og optik passer.'],
 [()=>qa('.toprow > .card:nth-of-type(2) .trio'),'02','Rummets mål','Indtast rummets dybde, bredde og højde. Målene bruges i tegningerne og til at tjekke, at alt kan være i rummet.'],
 [()=>$('kpis'),'','Resultater','Throw ratio, lysstyrke og kontrast opdateres med det samme. Grøn = passer, rød = passer ikke.'],
 [()=>$('model').closest('.card'),'03','Projektor og linse','Vælg projektor. Appen vælger automatisk den optik, der passer til afstand og billedbredde. Klik på billedet af projektoren eller optikken for at se specifikationerne hos Panasonic.'],
 [()=>$('crCard'),'06','Kontrast','Billedet giver et skøn over kontrastniveauet og ændrer sig, når du ændrer lys, lærred eller projektor. Fold ud for tal og krav.'],
 [()=>$('shiftBar'),'','Lens shift og keystone','Flyt billedet op/ned og til siden. Den lille boks viser, hvor meget lens shift der er tilbage. Slå «Lås optik» til, hvis appen ikke automatisk skal skifte optik, når du flytter projektoren.'],
 [()=>$('side').closest('.view'),'10','Snit gennem lokalet','Set fra siden. Du kan trække direkte i projektoren og lærredet.'],
 [()=>$('front').closest('.view'),'09','Lokalet set bagfra','Lærredet i målestok – vis testbillede eller dit eget billede, og slå sollys til.'],
 [()=>$('solView'),'11','Løsninger','Alle projektor/optik-kombinationer, der passer til dit lokale.'],
 [()=>$('projSave').parentElement,'','Gem og del','Gem projektet som fil, åbn det igen senere, eller gem hele siden som PDF.']];
const mk=h=>{const d=document.createElement('div');d.innerHTML=h;const e=d.firstElementChild;e.classList.add('notr');return e};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ui=null,cur=null,el=null,steps=[];
const relay=()=>{if(!ui||!el)return;const {spot,tip,arr}=ui,r=el.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,p=6;
  const top=Math.max(4,r.top-p),bot=Math.min(vh-4,r.bottom+p);
  Object.assign(spot.style,{left:r.left-p+'px',top:top+'px',width:r.width+2*p+'px',height:Math.max(20,bot-top)+'px'});
  const tw=tip.offsetWidth,th=tip.offsetHeight;let y,x=Math.max(16,Math.min(vw-tw-16,r.left)),dir=null;
  if(r.bottom+th+70<vh){y=r.bottom+62;dir='up'}else if(r.top-th-70>0){y=r.top-th-62;dir='down'}else{y=vh-th-16;x=vw-tw-16}
  tip.style.top=y+'px';tip.style.left=x+'px';arr.style.display=dir?'':'none';
  arr.style.left=Math.max(x+10,Math.min(x+tw-56,r.left+Math.min(60,r.width/2)-23))+'px';
  arr.style.top=(dir==='up'?r.bottom+8:r.top-54)+'px';arr.style.transform=dir==='down'?'rotate(180deg)':''};
const key=e=>{if(e.key==='Escape')close();else if(e.key==='ArrowRight')go(cur+1);else if(e.key==='ArrowLeft')go(cur-1)};
function close(){if(!ui)return;Object.values(ui).forEach(n=>n.remove());ui=null;cur=el=null;removeEventListener('keydown',key);removeEventListener('resize',relay);removeEventListener('scroll',relay,true);$('qgBtn').focus({preventScroll:true})}
function open(){steps=STEPS.filter(s=>{const e=s[0]();return e&&e.offsetParent!==null});
  ui={shade:mk('<div class="qgshade"></div>'),spot:mk('<div class="qgspot"></div>'),
    arr:mk('<div class="qgarrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 4 13h5v8h6v-8h5z" fill="currentColor"/></svg></div>'),
    tip:mk('<div class="qgtip" role="dialog" aria-live="polite"></div>')};
  ui.shade.onclick=()=>go(cur+1);
  ui.tip.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;b.dataset.n?go(cur+ +b.dataset.n):close()};
  document.body.append(ui.shade,ui.spot,ui.arr,ui.tip);
  addEventListener('keydown',key);addEventListener('resize',relay);addEventListener('scroll',relay,true);go(0)}
async function go(i){if(!ui)return;if(i>=steps.length)return close();i=Math.max(0,i);cur=i;
  const [f,no,h,p]=steps[i],last=i===steps.length-1;el=f();
  ui.tip.innerHTML=`<button type="button" class="qgx" aria-label="${tr('Luk')}">×</button><h4>${no?no+' · ':''}${tr(h)}</h4><p>${tr(p)}</p>
    <div class="qgnav"><span class="qgdots">${steps.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</span>${i?`<button type="button" data-n="-1">${tr('Tilbage')}</button>`:''}<button type="button" class="pri" data-n="1">${tr(last?'Færdig':'Næste')}</button></div>`;
  const tall=el.getBoundingClientRect().height>innerHeight*.55,blk=tall?'start':'center';
  el.scrollIntoView({block:blk,behavior:'smooth'});await sleep(550);if(!ui||cur!==i)return;
  const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight-40)el.scrollIntoView({block:blk});
  relay();ui.tip.querySelector('.pri').focus({preventScroll:true})}
// guiden vises altid i Auditorium – andre temaer skifter først dertil
$('qgBtn').addEventListener('click',async()=>{if(ui)return close();TRK('Quick Guide');if(S.venue!=='aud'){qa('[data-venue="aud"]').click();await sleep(150)}open()});
})();
