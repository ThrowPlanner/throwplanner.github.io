/* ===== PROJEKTFIL (JSON): gem og send videre – modtageren åbner den og arbejder videre ===== */
const PROJ_FMT='projection-throw-planner';
function projData(){const st=JSON.parse(JSON.stringify(S));delete st.lang;delete st.mode;
  const nm=(mi,li)=>{const m=MODELS[mi];return m?{model:m.m,lens:(m.L[li]||[''])[0]}:null};const imm={};for(const k in (S.immPj||{})){const q=S.immPj[k];if(q)imm[k]=nm(q.mi,q.li)}
  return {format:PROJ_FMT,version:1,app:'Projection Throw Planner',saved:new Date().toISOString(),names:{main:nm(S.mi,S.li),imm},state:st,planImage:PLANIMG||null}}
async function saveProject(){const vn={aud:'Auditorium',museum:'Museum',theater:'Theatre',immersive:'Immersive'}[S.venue]||S.venue,dt=new Date().toISOString().slice(0,10);
  const name=`Projection-Throw-Planner_${vn}_${dt}.json`,blob=new Blob([JSON.stringify(projData(),null,1)],{type:'application/json'});
  if(window.claude&&window.claude.use){try{const dl=await Promise.race([Promise.resolve(window.claude.use('downloads')),new Promise(r=>setTimeout(()=>r(null),4000))]);if(dl){await dl.save({filename:name,data:blob});return}}catch(e){if(e&&e.code==='declined')return}
    pdfToast('<span>På et claude.ai-link kan kun ejeren af appen gemme filer. Brug web-app-versionen af Projection Throw Planner for at gemme projektet.</span>');return}
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
function loadProject(txt){let d;try{d=JSON.parse(txt)}catch(e){pdfToast('<span>Filen kunne ikke læses – den er ikke en gyldig projektfil.</span>');return}
  const st=d&&d.format===PROJ_FMT?d.state:(d&&d.venue&&d.mi!=null?d:null);if(!st||typeof st!=='object'){pdfToast('<span>Filen kunne ikke læses – den er ikke en gyldig projektfil.</span>');return}
  const find=(n,mi,li)=>{if(!n||!n.model)return [mi,li];let m=MODELS[mi];if(!m||m.m!==n.model){const j=MODELS.findIndex(x=>x.m===n.model);if(j<0)return [mi,li];mi=j;m=MODELS[j]}
    if(!m.L[li]||m.L[li][0]!==n.lens){const k=m.L.findIndex(l=>l[0]===n.lens);li=k<0?0:k}return [mi,li]};
  const N=d.names||{};[st.mi,st.li]=find(N.main,st.mi,st.li);if(st.immPj&&N.imm)for(const k in st.immPj){const q=st.immPj[k];if(q)[q.mi,q.li]=find(N.imm[k],q.mi,q.li)}
  const keep={lang:S.lang,mode:S.mode},nx={...JSON.parse(JSON.stringify(S0)),...st,...keep,defREQ:true};
  try{localStorage.setItem('kasteplan5',JSON.stringify(nx));if(d.planImage)localStorage.setItem('kasteplan_planimg',d.planImage);else localStorage.removeItem('kasteplan_planimg');
    if(localStorage.getItem('kasteplan5'))return location.reload()}catch(e){}
  // ingen lokal lagring (fx privat vindue): indlæs direkte
  for(const k of Object.keys(S))delete S[k];Object.assign(S,nx);PLANIMG=d.planImage||null;
  try{fillCats();fillModels();fillLens();fillFrames()}catch(e){}render();I18.all()}
const readProj=f=>{if(!f)return;const r=new FileReader();r.onload=()=>loadProject(String(r.result));r.readAsText(f)};
$('projSave').addEventListener('click',saveProject);
$('projOpen').addEventListener('click',()=>{$('projFile').value='';$('projFile').click()});
$('projFile').addEventListener('change',e=>readProj(e.target.files[0]));
// træk en projektfil ind på siden
document.addEventListener('dragover',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files'))e.preventDefault()});
document.addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(!f||!/\.json$|json/i.test(f.name+' '+f.type))return;e.preventDefault();readProj(f)});
$('sizeHint').addEventListener('click',e=>{const b=e.target.closest('[data-lsug]');if(!b)return;S.li=+b.dataset.lsug;fillLens();fitLens();zeroShift();render()});
// nulstil: første klik beder om bekræftelse, andet klik (inden 4 s) sletter alle gemte indstillinger – mørk/lys tilstand beholdes, sproget sættes til engelsk
{let tmo=0;$('resetBtn').addEventListener('click',()=>{const b=$('resetBtn');
  if(!b.classList.contains('arm')){b.classList.add('arm');$('resetTxt').textContent='Klik igen for at nulstille';clearTimeout(tmo);tmo=setTimeout(()=>{b.classList.remove('arm');$('resetTxt').textContent='Nulstil'},4000);return}
  try{localStorage.setItem('kasteplan5',JSON.stringify({lang:'en',mode:S.mode}))}catch(e){}location.reload()})}
$('modeBtn').addEventListener('click',()=>{const dark=document.documentElement.classList.contains('isdark');S.mode=dark?'light':'dark';save();applyMode();render()});
if(MQ&&MQ.addEventListener)MQ.addEventListener('change',()=>{if(!S.mode){applyMode();render()}});
applyMode();
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{S.lang=b.dataset.lang;save();document.querySelectorAll('[data-lang]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.lang===S.lang));render();I18.all()}));
if(!['da','en','ja'].includes(S.lang))S.lang='en';document.querySelectorAll('[data-lang]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.lang===S.lang));
I18.all();I18.start();
