// boks 03: søg blandt alle projektorer – aktuelle og udgåede (EOL). «rz 770», «PT-RZ770» og «rz770» finder det samme
const pjKey=s=>String(s).toLowerCase().replace(/^pt-?/,'').replace(/[\s\-_.]/g,'');
function pjSearch(q){const k=pjKey(q);if(!k)return [];const r=[];
  MODELS.forEach((m,i)=>{if(S.venue==='golf'&&m.c!==3)return;
    const parts=m.m.split(' (')[0].split('/').map(pjKey),all=pjKey(m.m);
    const s=parts.some(p=>p===k)?0:parts.some(p=>p.startsWith(k))?1:all.includes(k)?2:-1;
    if(s>=0)r.push([s,isEOL(m)?1:0,i])});
  return r.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||MODELS[a[2]].m.localeCompare(MODELS[b[2]].m)).slice(0,12).map(x=>x[2])}
// vælg som i modellisten: kategori og min. lumen åbnes, så modellen kan vises
function pjPick(i){const m=MODELS[i];S.cat=isEOL(m)?7:0;if(m.lm<S.minLm)S.minLm=0;fillCats();fillModels();
  const sel=$('model');sel.value=String(i);sel.dispatchEvent(new Event('change'));pjClose();$('pjQ').value='';TRK('Søg projektor',{model:m.m})}
let pjAt=-1;
function pjClose(){$('pjRes').hidden=true;$('pjQ').setAttribute('aria-expanded','false');pjAt=-1}
function pjShow(){const q=$('pjQ').value,hits=pjSearch(q),box=$('pjRes');pjAt=hits.length?0:-1;
  if(!q.trim()){pjClose();return}
  box.innerHTML=hits.length?hits.map((i,n)=>{const m=MODELS[i];return `<button type="button" role="option" class="pjhit${n===0?' on':''}" data-i="${i}"><b class="notr">${esc(m.m.split(' (')[0])}</b>${isEOL(m)?'<span class="eoltag">EOL</span>':''}<span class="notr">${fi(m.lm)} lm${is4K(m)?' · 4K':''}</span></button>`}).join('')
    :'<div class="pjnone">Ingen projektor fundet</div>';
  box.hidden=false;$('pjQ').setAttribute('aria-expanded','true')}
$('pjQ').addEventListener('input',pjShow);
$('pjQ').addEventListener('focus',()=>{if($('pjQ').value.trim())pjShow()});
$('pjQ').addEventListener('keydown',e=>{const b=[...$('pjRes').querySelectorAll('.pjhit')];
  if(e.key==='Escape'){pjClose();return}
  if(!b.length||$('pjRes').hidden)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();pjAt=(pjAt+(e.key==='ArrowDown'?1:-1)+b.length)%b.length;b.forEach((x,n)=>x.classList.toggle('on',n===pjAt));b[pjAt].scrollIntoView({block:'nearest'})}
  else if(e.key==='Enter'){e.preventDefault();pjPick(+b[Math.max(0,pjAt)].dataset.i)}});
$('pjRes').addEventListener('mousedown',e=>{const t=e.target.closest('[data-i]');if(t){e.preventDefault();pjPick(+t.dataset.i)}});
$('pjQ').addEventListener('blur',()=>setTimeout(pjClose,150));
