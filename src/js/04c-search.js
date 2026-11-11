// boks 03: søg blandt alle projektorer – aktuelle og udgåede (EOL). «rz 770», «PT-RZ770» og «rz770» finder det samme
// søg også optik: «d3lew201», «ET-D3LEW201» → optikken med en liste over de projektorer, den passer til
const pjKey=s=>String(s).toLowerCase().replace(/^pt-?/,'').replace(/[\s\-_.]/g,'');
const lnKey=s=>pjKey(s).replace(/^et/,'');
const pjOK=m=>S.venue!=='golf'||m.c===3;
function pjSearch(q){const k=pjKey(q);if(!k)return [];const r=[];
  MODELS.forEach((m,i)=>{if(!pjOK(m))return;
    const parts=m.m.split(' (')[0].split('/').map(pjKey),all=pjKey(m.m);
    const s=parts.some(p=>p===k)?0:parts.some(p=>p.startsWith(k))?1:all.includes(k)?2:-1;
    if(s>=0)r.push([s,isEOL(m)?1:0,i])});
  return r.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||MODELS[a[2]].m.localeCompare(MODELS[b[2]].m)).slice(0,12).map(x=>x[2])}
// optik: grupperet pr. optiknavn → [[mi,li],…] for hver projektor, den kan bruges på («Supplied lens» alene springes over)
function lnSearch(q){const k=lnKey(q);if(k.length<2)return [];const G=new Map();
  MODELS.forEach((m,i)=>{if(!pjOK(m))return;m.L.forEach((l,j)=>{
    const parts=l[0].split('/').filter(p=>!/^supplied/i.test(p)).map(lnKey);if(!parts.length)return;
    const s=parts.some(p=>p===k)?0:parts.some(p=>p.startsWith(k))?1:parts.some(p=>p.includes(k))?2:-1;if(s<0)return;
    const n=l[0].replace(/^Supplied lens\//i,'');const g=G.get(n)||{n,s,eol:lnEOL(l),h:[]};g.s=Math.min(g.s,s);g.h.push([i,j]);G.set(n,g)})});
  return [...G.values()].sort((a,b)=>a.s-b.s||(a.eol?1:0)-(b.eol?1:0)||a.n.localeCompare(b.n)).slice(0,4)
    .map(g=>(g.h.sort((a,b)=>(isEOL(MODELS[a[0]])?1:0)-(isEOL(MODELS[b[0]])?1:0)||MODELS[a[0]].m.localeCompare(MODELS[b[0]].m)),g))}
// vælg som i modellisten: kategori og min. lumen åbnes, så modellen kan vises; li = optik fra optiksøgningen
function pjPick(i,li){const m=MODELS[i];S.cat=isEOL(m)?7:0;if(m.lm<S.minLm)S.minLm=0;fillCats();fillModels();
  const sel=$('model');sel.value=String(i);sel.dispatchEvent(new Event('change'));
  if(li!=null&&m.L[li]){const ls=$('lens');ls.value=String(li);ls.dispatchEvent(new Event('change'))}
  pjClose();$('pjQ').value='';}
let pjAt=-1;
function pjClose(){$('pjRes').hidden=true;$('pjQ').setAttribute('aria-expanded','false');pjAt=-1}
const pjName=m=>m.m.split(' (')[0];
function pjShow(){const q=$('pjQ').value,hits=pjSearch(q),lens=lnSearch(q),box=$('pjRes');pjAt=hits.length||lens.length?0:-1;
  if(!q.trim()){pjClose();return}
  let n=0;const on=()=>n++===0?' on':'';
  const pj=hits.map(i=>{const m=MODELS[i];return `<button type="button" role="option" class="pjhit${on()}" data-i="${i}"><b class="notr">${esc(pjName(m))}</b>${isEOL(m)?'<span class="eoltag">EOL</span>':''}<span class="notr">${fi(m.lm)} lm${is4K(m)?' · 4K':''}</span></button>`}).join('');
  const ln=lens.map(g=>`<div class="pjlens" role="presentation"><span class="pjlt">Optik</span><b class="notr">${esc(g.n)}</b>${g.eol?'<span class="eoltag">EOL</span>':''}<span>Passer til ${g.h.length} ${g.h.length===1?'projektor':'projektorer'}</span></div>`+
    g.h.map(([i,j])=>{const m=MODELS[i],tr=lensTR(m,m.L[j]);return `<button type="button" role="option" class="pjhit pjsub${on()}" data-i="${i}" data-l="${j}"><b class="notr">${esc(pjName(m))}</b>${isEOL(m)?'<span class="eoltag">EOL</span>':''}<span class="notr">${fi(m.lm)} lm${tr?' · '+tr:''}</span></button>`}).join('')).join('');
  box.innerHTML=pj||ln?pj+ln:'<div class="pjnone">Ingen projektor eller optik fundet</div>';
  box.hidden=false;$('pjQ').setAttribute('aria-expanded','true')}
const pjGo=b=>pjPick(+b.dataset.i,b.dataset.l!=null?+b.dataset.l:null);
$('pjQ').addEventListener('input',pjShow);
$('pjQ').addEventListener('focus',()=>{if($('pjQ').value.trim())pjShow()});
$('pjQ').addEventListener('keydown',e=>{const b=[...$('pjRes').querySelectorAll('.pjhit')];
  if(e.key==='Escape'){pjClose();return}
  if(!b.length||$('pjRes').hidden)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();pjAt=(pjAt+(e.key==='ArrowDown'?1:-1)+b.length)%b.length;b.forEach((x,n)=>x.classList.toggle('on',n===pjAt));b[pjAt].scrollIntoView({block:'nearest'})}
  else if(e.key==='Enter'){e.preventDefault();pjGo(b[Math.max(0,pjAt)])}});
$('pjRes').addEventListener('mousedown',e=>{const t=e.target.closest('[data-i]');if(t){e.preventDefault();pjGo(t)}});
$('pjQ').addEventListener('blur',()=>setTimeout(pjClose,150));
