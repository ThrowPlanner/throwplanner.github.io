/* ===== KONTRAST (ANSI/AVIXA ISCR-kategorier) ===== */
const ISCR=[[7,'Passiv visning'],[15,'Enkle beslutninger'],[50,'Analytisk'],[80,'Video']];
const crMin=()=>S.crReq==='custom'?Math.max(1,+S.crCust||5):+S.crReq;
const crName=()=>S.crReq==='custom'?'eget krav':({7:'passiv visning',15:'enkle beslutninger',50:'analytisk',80:'fuld video'})[S.crReq];
function crClass(c){let k='Under 7:1';ISCR.forEach(([v,n])=>{if(c>=v)k=n});return k}
function drawContrast(r){
  const set=(id,v)=>{const el=$(id);if(document.activeElement!==el)el.value=v};
  $('crReq').value=S.crReq;$('crCustRow').hidden=S.crReq!=='custom';set('crCust',S.crCust);
  const req=crMin(),worst=blend0(r)?Math.min(r.cr,r.cr2):r.cr;
  $('crPill').innerHTML=worst>=req?pill('ok',`Opfylder ${fi(req)}:1 (${crName()})`):pill('bad',`Under kravet ${f2(req,req%1?1:0)}:1 – mangler ${f2(req/worst,1)}× kontrast`);
  set('amb2',S.amb);set('ambR',Math.min(1000,S.amb));set('pcr',Math.round(r.pcr));set('stack',r.stk);
  const blend=S.blend&&(r.N>1||r.R>1);
  // simulering: lineært lys, sort niveau løftes af projektorens sort + omgivelseslys
  const fil=(id,b)=>{const ws=r.lux/(r.lux+b),ic=b/(r.lux+b);return `<filter id="${id}" color-interpolation-filters="linearRGB"><feComponentTransfer>${['R','G','B'].map(c=>`<feFunc${c} type="linear" slope="${ws.toFixed(4)}" intercept="${ic.toFixed(4)}"/>`).join('')}</feComponentTransfer></filter>`};
  const W=320,H=180;
  let content=S.content==='img'&&IMG?`<image href="${IMG}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`:(S.venue==='golf'&&S.content==='golf'?golfScene(0,0,W,H,'c'):testPattern(0,0,W,H));
  let s=`<defs>${fil('cf1',r.blk)}${fil('cf2',r.blk2)}${fil('cf4',r.blk4)}<clipPath id="cfc"><rect width="${W}" height="${H}"/></clipPath>`;
  let zones='';
  if(blend){
    for(let c=1;c<r.N;c++){const x0=(c*(1-r.o)/r.kx)*W,w=(r.o/r.kx)*W;zones+=`<rect x="${x0}" y="0" width="${w}" height="${H}"/>`}
    for(let k=1;k<r.R;k++){const y0=(k*(1-r.o)/r.ky)*H,h=(r.o/r.ky)*H;zones+=`<rect x="0" y="${y0}" width="${W}" height="${h}"/>`}
    s+=`<clipPath id="cz">${zones}</clipPath>`;
  }
  s+=`</defs><g filter="url(#cf1)">${content}</g>`;
  if(blend)s+=`<g clip-path="url(#cz)" filter="url(#cf2)">${content}</g>`;
  if(blend&&r.N>1&&r.R>1){let cz='';for(let c=1;c<r.N;c++)for(let k=1;k<r.R;k++){cz+=`<rect x="${(c*(1-r.o)/r.kx)*W}" y="${(k*(1-r.o)/r.ky)*H}" width="${(r.o/r.kx)*W}" height="${(r.o/r.ky)*H}"/>`}
    s=s.replace('</defs>',`<clipPath id="cz4">${cz}</clipPath></defs>`)+`<g clip-path="url(#cz4)" filter="url(#cf4)">${content}</g>`}
  $('crSvg').innerHTML=s;
  $('crSum').innerHTML=`${worst>=req?pill('ok','Opfylder krav'):pill('bad','Under krav')} <span class="hint">Detaljer og indstillinger</span>`;$('dCr').open=!!S.openCr;
  $('crTag').innerHTML=`${fi(r.cr)}:1 · ${r.cr>=crMin()?'✓':'✗'} krav ${f2(crMin(),crMin()%1?1:0)}:1`+(blend?`<br>blend-zone ${fi(r.cr2)}:1`:'');
  // skala (log 1–1000)
  const pos=c=>Math.max(0,Math.min(100,Math.log10(Math.max(1,c))/3*100));
  let sc='<div class="bar"></div>';
  const rq=crMin();const ticks=[[1,'1'],[7,'7'],[15,'15'],[50,'50'],[80,'80'],[1000,'1000']];if(!ticks.some(t=>t[0]===rq))ticks.push([rq,f2(rq,rq%1?1:0)]);ticks.forEach(([v,t])=>{const on=v===rq;sc+=`<span class="tick" style="left:${pos(v)}%;${on?'opacity:1;width:3px;height:20px;top:16px;background:var(--dim)':''}"></span><span class="tl" style="left:${Math.min(97,Math.max(2,pos(v)))}%;${on?'color:var(--dim);font-weight:700':''}">${on?'krav ':''}${t}</span>`});
  sc+=`<span class="mk" style="left:${pos(r.cr)}%;color:var(--ink)">${fi(r.cr)}:1<i></i></span>`;
  if(blend)sc+=`<span class="mk" style="left:${pos(r.cr2)}%;color:var(--beam);top:${Math.abs(pos(r.cr)-pos(r.cr2))<14?'34px':'0'}">${Math.abs(pos(r.cr)-pos(r.cr2))<14?'<i></i>':''}blend ${fi(r.cr2)}:1${Math.abs(pos(r.cr)-pos(r.cr2))<14?'':'<i></i>'}</span>`;
  $('crScale').innerHTML=sc;
  const L=e=>S.gain*e/Math.PI;
  $('crNums').innerHTML=`<div><span>Hvid</span><b>${fi(L(r.lux+r.blk))} cd/m²</b></div><div><span>Sort</span><b>${f2(L(r.blk),1)} cd/m²</b></div>`+
    `<div><span>Kontrast</span><b style="color:${r.cr>=15?'var(--ok)':r.cr>=7?'var(--warn)':'var(--bad)'}">${fi(r.cr)}:1</b></div>`+
    (blend?`<div><span>Blend-zone</span><b style="color:${r.cr2>=15?'var(--ok)':r.cr2>=7?'var(--warn)':'var(--bad)'}">${fi(r.cr2)}:1</b></div>`:`<div><span>Kategori</span><b style="font-size:14px;padding-top:3px">${crClass(r.cr)}</b></div>`);
  const ambShare=r.amb/r.blk*100;const sl=sunLux();
  $('crHint').innerHTML=(blend?`Sort niveau i blend-zonen er <b>${f2(r.blk2/r.blk,3)}×</b> højere${r.N>1&&r.R>1?` og ${f2(r.blk4/r.blk,2)}× i hjørnerne`:''} (synligt gråt bånd i mørke scener uden black level-korrektion). `:'')+
    `Omgivelseslyset${sl.lux?` (${fi(S.amb)} lux kunstlys + ${fi(sl.lux)} lux sollys)`:''} står for <b>${f2(ambShare,1)} %</b> af sortniveauet. Databladets kontrast er full on/off – ret til ANSI-kontrast for et mere realistisk tal. Krav efter ANSI/INFOCOMM 3M-2011 (nu AVIXA V201.01): målt i lokalet med ANSI-skakbræt, så brug projektorens ANSI-kontrast.`;
}

