/* ===== PRIVATLIV, KONTAKT OG VAREMÆRKER: link nederst i appen åbner en dialog (GDPR art. 13 + e-handelslovens § 7) ===== */
// kontaktoplysninger – udfyld før udgivelse (afsnittet vises kun, når mindst navn eller e-mail er udfyldt)
const CONTACT={name:'',address:'',cvr:'',email:''};
const PRIV_DATE='2026-11-02';
const PRIV=[
  ['Dine data',['Throw Planner har ingen login, ingen cookies og ingen database. Alt du indtaster – også plantegning, logo og firmaoplysninger – behandles kun i din browser og slettes, når du lukker eller genindlæser siden.',
    'Det eneste, der gemmes på din enhed, er dit valg «Vis ikke igen» ved ansvarsfraskrivelsen. Det er nødvendigt for funktionen og kræver ikke samtykke.',
    'Projektfiler («Gem projekt») gemmes kun der, hvor du selv vælger at gemme dem.']],
  ['Ingen statistik eller sporing',['Throw Planner bruger ingen besøgsstatistik, ingen analyseværktøjer og ingen sporing.']],
  ['Hosting',['Siden hostes af GitHub Pages (GitHub Inc., USA). Som alle webservere modtager GitHub din IP-adresse for at kunne levere siden og kan logge den af sikkerhedshensyn. GitHub er certificeret under EU-US Data Privacy Framework.',
    'Skrifter og PDF-læser ligger på siden selv – der hentes intet fra Google eller andre CDN\'er.']],
  ['Produktbilleder og links',['Billeder af projektorer og optikker vises direkte fra Panasonics server (docs.connect.panasonic.com), så Panasonic modtager din IP-adresse, når et billede vises. Knapperne til specifikationer, manualer og terminaler åbner Panasonics egne sider.']],
  ['Dine rettigheder',['Du har ret til indsigt, berigtigelse, sletning og indsigelse og kan klage til Datatilsynet (datatilsynet.dk). Da vi ikke gemmer oplysninger om dig, har vi som regel intet at udlevere eller slette.']],
  ['Data, ophavsret og varemærker',['Projektor- og optikdata er baseret på Panasonics officielle Throw Distance Calculator (TDC) og produktsider. Kontrollér altid med Panasonics specifikationer før installation.',
    'Panasonic er et varemærke tilhørende Panasonic Holdings Corporation. Throw Planner er ikke tilknyttet eller godkendt af Panasonic eller af producenter af golfsimulatorer.',
    'Skrifter: Manrope og JetBrains Mono (SIL Open Font License 1.1). PDF-læser: PDF.js (Apache License 2.0).']]];
function privDialog(){let d=$('privDlg');if(d)d.remove();
  d=document.createElement('dialog');d.id='privDlg';d.className='pdfdlg privdlg';
  const c=CONTACT,kon=(c.name||c.email)?`<h4>Kontakt</h4><p class="notr">${[c.name,c.address,c.cvr&&('CVR '+c.cvr)].filter(Boolean).map(esc).join('<br>')}${c.email?`<br><a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`:''}</p>`:'';
  d.innerHTML=`<form method="dialog"><h3>Privatliv og kontakt</h3><div class="privbody">`+PRIV.map(([h,ps])=>`<h4>${h}</h4>`+ps.map(p=>`<p>${p}</p>`).join('')).join('')+kon+
    `<p class="privdate">Senest opdateret: ${PRIV_DATE}</p></div><div class="pdfbtns"><button type="submit" class="btn pdfgo">Luk</button></div></form>`;
  d.addEventListener('close',()=>d.remove());d.addEventListener('click',e=>{if(e.target===d)d.close()});
  document.body.appendChild(d);d.showModal()}
$('disc').insertAdjacentHTML('beforeend','<p class="discnote">Ikke tilknyttet Panasonic eller producenter af golfsimulatorer. Data baseret på Panasonics officielle Throw Distance Calculator (TDC).</p><button type="button" class="disclink" id="privBtn">Privatliv og kontakt</button>');
$('privBtn').addEventListener('click',privDialog);
