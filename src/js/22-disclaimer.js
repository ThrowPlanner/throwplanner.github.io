/* ===== ANSVARSFRASKRIVELSE: popup ved hver åbning (kan slås fra med «Vis ikke igen») + fast tekst nederst i appen ===== */
const DISC_K='kasteplan_disc';
const DISC=['De beregnede værdier kan variere afhængigt af brug og omgivelsesforhold.',
  'Beregnerens nøjagtighed: ±5 % (for alle værdier undtagen projektorens lysudbytte og skærmens luminans).',
  'Projektorens målestok er ikke nøjagtig.',
  'Beregningsresultatet er målt fra projektorens linsecentrum.',
  'Linsens placering varierer fra projektor til projektor.',
  'Det du indtaster, gemmes ikke – hverken på din enhed eller eksternt. Brug «Gem projekt» for at beholde dit projekt.'];
const discList=()=>'<ul>'+DISC.map(t=>`<li>${t}</li>`).join('')+'</ul>';
$('disc').innerHTML='<h2>Ansvarsfraskrivelse</h2>'+discList();
(()=>{try{if(localStorage.getItem(DISC_K)==='1')return}catch(e){}
  const d=document.createElement('dialog');d.id='discDlg';d.className='pdfdlg discdlg';
  d.innerHTML=`<form method="dialog"><h3>Ansvarsfraskrivelse</h3>${discList()}
    <div class="pdfbtns"><label><input type="checkbox" id="discNo"> Vis ikke igen</label><button type="submit" class="btn pdfgo">OK</button></div></form>`;
  document.body.appendChild(d);
  d.addEventListener('close',()=>{if($('discNo').checked)try{localStorage.setItem(DISC_K,'1')}catch(e){}d.remove()});
  d.showModal()})();
