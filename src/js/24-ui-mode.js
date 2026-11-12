// Simpel / Avanceret: samme beregning og samme S – Simpel skjuler kun felter via CSS (data-ui på <html>)
// standard er Simpel (S.ui tom)
function applyUi(){const u=S.ui==='adv'?'adv':'simple';document.documentElement.dataset.ui=u;
  document.querySelectorAll('.uimode [data-ui]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ui===u));uiNote()}
// note i Simpel, når noget skjult er slået til (så resultatet ikke overrasker)
function uiNote(){const on=S.ui!=='adv'&&S.venue!=='golf'&&!!(S.frame||S.blend||S.portrait||stackOn());$('uiNote').hidden=!on}
document.querySelectorAll('[data-ui]').forEach(b=>b.addEventListener('click',()=>{S.ui=b.dataset.ui;applyUi();
  if(S.ui==='simple'&&(S.venue==='immersive'||S.venue==='warp'))document.querySelector('.venue [data-venue="aud"]').click();else render()}));
['click','change'].forEach(t=>document.addEventListener(t,()=>setTimeout(uiNote,0)));
if(S.venue==='immersive'||S.venue==='warp')S.ui='adv';// et åbnet immersive-projekt (og Warping) vises i Avanceret
applyUi();
