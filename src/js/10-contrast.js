/* ===== KONTRAST (ANSI/AVIXA ISCR-kategorier) ===== */
const crMin=()=>S.crReq==='custom'?Math.max(1,+S.crCust||5):+S.crReq;
const crName=()=>S.crReq==='custom'?'eget krav':({7:'passiv visning',15:'enkle beslutninger',50:'analytisk',80:'fuld video'})[S.crReq];
function drawContrast(r){
  const set=(id,v)=>{const el=$(id);if(document.activeElement!==el)el.value=v};
  $('crReq').value=S.crReq;$('crCustRow').hidden=S.crReq!=='custom';set('crCust',S.crCust);
  // blend-zonens kontrast vises ikke – kun billedets kontrast tæller
  const req=crMin(),worst=r.cr;
  $('crPill').innerHTML=worst>=req?pill('ok',`Opfylder ${fi(req)}:1 (${crName()})`):pill('bad',`Under kravet ${f2(req,req%1?1:0)}:1 – mangler ${f2(req/worst,1)}× kontrast`);
  set('amb2',S.amb);set('ambR',Math.min(1000,S.amb));set('pcr',Math.round(r.pcr));
  // simulering: lineært lys, sort niveau løftes af projektorens sort + omgivelseslys
  const fil=(id,b)=>{const ws=r.lux/(r.lux+b),ic=b/(r.lux+b);return `<filter id="${id}" color-interpolation-filters="linearRGB"><feComponentTransfer>${['R','G','B'].map(c=>`<feFunc${c} type="linear" slope="${ws.toFixed(4)}" intercept="${ic.toFixed(4)}"/>`).join('')}</feComponentTransfer></filter>`};
  const W=320,H=180;
  let content=S.content==='img'&&IMG?`<image href="${IMG}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`:(S.venue==='golf'&&S.content==='golf'?golfScene(0,0,W,H,'c'):testPattern(0,0,W,H));
  $('crSvg').innerHTML=`<defs>${fil('cf1',r.blk)}<clipPath id="cfc"><rect width="${W}" height="${H}"/></clipPath></defs><g filter="url(#cf1)">${content}</g>`;
  $('crSum').innerHTML=`${worst>=req?pill('ok','Opfylder krav'):pill('bad','Under krav')} <span class="hint">Detaljer og indstillinger</span>`;$('dCr').open=!!S.openCr;
  $('crTag').innerHTML=`${fi(r.cr)}:1 · ${r.cr>=crMin()?'✓':'✗'} krav ${f2(crMin(),crMin()%1?1:0)}:1 · ${crName()}`;
  // skala (log 1–1000)
  const pos=c=>Math.max(0,Math.min(100,Math.log10(Math.max(1,c))/3*100));
  let sc='<div class="bar"></div>';
  const rq=crMin();const ticks=[[1,'1'],[7,'7'],[15,'15'],[50,'50'],[80,'80'],[1000,'1000']];if(!ticks.some(t=>t[0]===rq))ticks.push([rq,f2(rq,rq%1?1:0)]);ticks.forEach(([v,t])=>{const on=v===rq;sc+=`<span class="tick" style="left:${pos(v)}%;${on?'opacity:1;width:3px;height:20px;top:16px;background:var(--dim)':''}"></span><span class="tl" style="left:${Math.min(97,Math.max(2,pos(v)))}%;${on?'color:var(--dim);font-weight:700':''}">${on?'krav ':''}${t}</span>`});
  sc+=`<span class="mk" style="left:${pos(r.cr)}%;color:var(--ink)">${fi(r.cr)}:1<i></i></span>`;
  $('crScale').innerHTML=sc;
  const L=e=>S.gain*e/Math.PI;
  $('crNums').innerHTML=`<div><span>Belysning (center)</span><b>${fi(r.lux)} lux</b></div><div><span>Hvid</span><b>${fi(L(r.lux+r.blk))} cd/m²</b></div><div><span>Sort</span><b>${f2(L(r.blk),1)} cd/m²</b></div>`+
    `<div><span>Kontrast</span><b style="color:${r.cr>=15?'var(--ok)':r.cr>=7?'var(--warn)':'var(--bad)'}">${fi(r.cr)}:1</b></div>`;
  const ambShare=r.amb/r.blk*100;const sl=sunLux();
  $('crHint').innerHTML=`Omgivelseslyset${sl.lux?` (${fi(S.amb)} lux kunstlys + ${fi(sl.lux)} lux sollys)`:''} står for <b>${f2(ambShare,1)} %</b> af sortniveauet. Databladets kontrast er full on/off – ret til ANSI-kontrast for et mere realistisk tal. Krav efter ANSI/INFOCOMM 3M-2011 (nu AVIXA V201.01): målt i lokalet med ANSI-skakbræt, så brug projektorens ANSI-kontrast.`;
}

