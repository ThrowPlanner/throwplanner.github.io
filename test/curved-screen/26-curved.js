/* ===== TEST: Buet lærred (Panasonic [GEOMETRY] → [CURVED CORRECTION]) – punkt i boks 05 =====
   Grænserne er tabellen «[GEOMETRY] projection range» / «[SCREEN ADJUSTMENT] projection range» i hver projektors manual:
   R2 = buens radius set fra siden (lodret bue), R3 = set ovenfra (vandret bue), L = kasteafstand.
   Pr. optik (ET-kode) eller model (fast optik): [kun keystone V,H · keystone+curved V,H, min R2/L2, min R3/L3 · kun curved min R2/L2, min R3/L3]
   null = «―» i manualen (kan ikke). Optikker, der ikke står i tabellen, vises som «ikke oplyst». */
const CURV=(()=>{const T={},put=(ks,v)=>ks.split(' ').forEach(k=>T[k]=v),n=null;
  // PT-REQ/REZ-serien (ET-C1)
  put('ET-C1U100',[5,3,n,n,n,n,n,n]);put('ET-C1U200',[5,0,n,n,n,n,n,n]);put('ET-C1W300',[10,5,n,n,n,n,n,n]);put('ET-C1W400',[16,10,n,n,n,n,n,n]);
  put('ET-C1W500',[22,15,8,8,1.3,3.3,0.8,1.9]);put('ET-C1S600',[40,40,20,15,1.3,3.3,0.8,1.9]);put('ET-C1T700',[40,40,20,15,0.9,2.0,0.5,1.1]);put('ET-C1T800',[40,40,20,15,0.5,1.0,0.3,0.6]);
  // RQ45K/RZ44K, RQ35K2/RZ34K2, RQ25K-serien, HTQ20 (ET-D3LE/ET-D75LE – samme tal i alle manualer)
  put('ET-D3LEW201 ET-D3LEW200 ET-D3LEW300',[15,5,n,n,n,n,n,n]);put('ET-D3LEW60 ET-D3LEW600 ET-D75LE6',[28,15,10,10,1.2,3.0,0.7,1.7]);
  put('ET-D3LEW10 ET-D75LE10',[40,40,20,15,0.9,2.0,0.5,1.1]);put('ET-D3LES20 ET-D3LES250 ET-D75LE20',[40,40,20,15,0.7,1.3,0.4,0.7]);
  put('ET-D3LET30 ET-D75LE30',[45,40,20,15,0.5,0.9,0.3,0.5]);put('ET-D3LET40 ET-D75LE40',[45,40,20,15,0.3,0.5,0.2,0.3]);put('ET-D3LET80 ET-D75LE8',[45,40,20,15,0.2,0.3,0.1,0.2]);
  put('ET-D3LEU100 ET-D3LEU101',[8,5,n,n,n,n,n,n]);put('ET-D3LEW50 ET-D75LE50',[22,15,8,8,1.5,3.7,0.9,2.2]);put('ET-D75LE95',[5,0,n,n,n,n,n,n]);
  // PT-RQ50K (ET-D3Q)
  put('ET-D3QW300',[28,15,10,10,1.2,3.0,0.7,1.7]);put('ET-D3QS400 ET-D3QT500 ET-D3QT600 ET-D3QT700 ET-D3QT800',[40,40,20,15,0.9,2.0,0.5,1.1]);
  // PT-RQ7-serien (ET-DLE)
  put('ET-DLE170',[40,40,20,15,0.7,1.3,0.4,0.7]);put('ET-DLE020G ET-DLE020 ET-DLE035',[5,0,n,n,n,n,n,n]);put('ET-DLE055 ET-DLE085 ET-DLE105',[22,15,8,8,1.3,3.3,0.8,1.9]);
  put('ET-DLE060',[16,10,n,n,n,n,n,n]);put('ET-DLE150',[40,40,20,15,0.9,2,0.5,1.1]);put('ET-DLE250',[40,40,20,15,0.5,1,0.3,0.6]);put('ET-DLE350',[45,40,20,15,0.3,0.6,0.2,0.4]);put('ET-DLE450',[45,40,20,15,0.2,0.4,0.2,0.3]);
  // PT-MZ20K-serien (ET-EM)
  put('ET-EMU100',[5,0,n,n,n,n,n,n]);put('ET-EMS650 ET-EMS600',[45,40,20,15,0.9,2,0.5,1.1]);put('ET-EMW200 ET-EMW300',[14,8,n,n,n,n,n,n]);put('ET-EMW400',[22,15,8,8,1.5,3.7,0.9,2.2]);
  put('ET-EMW500',[22,15,8,8,1.2,3,0.7,1.7]);put('ET-EMT750 ET-EMT700',[45,40,20,15,0.6,1.1,0.3,0.6]);put('ET-EMT850 ET-EMT800',[45,40,20,15,0.3,0.6,0.2,0.3]);
  // PT-MZ882-serien (ET-EL)
  put('ET-ELS20',[25,30,20,15,0.9,1.8,0.5,1.0]);put('ET-ELW21 ET-ELW22',[22,15,8,8,1.7,4.3,1.0,2.6]);put('ET-ELU20',[5,0,n,n,n,n,n,n]);
  put('ET-ELW20',[25,30,20,15,1.2,3.1,0.7,1.8]);put('ET-ELT22',[25,30,20,15,0.6,1.1,0.3,0.6]);put('ET-ELT23',[25,30,20,15,0.4,0.7,0.2,0.4]);
  // fast optik: pr. model (VMQ/VMZ82/VMZ7ST-manualerne giver kun keystone og curved hver for sig)
  put('PT-FRQ60 PT-FRQ50 PT-FRZ60 PT-FRZ50',[40,20,20,15,0.9,1.7,0.5,1.0]);
  put('PT-VMQ85 PT-VMQ75 PT-VMQ65 PT-VMZ82 PT-VMZ72 PT-VMZ62',[25,35,n,n,n,n,0.6,0.7]);put('PT-VMZ7ST PT-VMZ6ST',[25,35,n,n,n,n,1.7,2.0]);
  put('PT-VMZ51S',[25,35,25,35,1.4,2.9,0.7,1.6]);put('PT-LMZ460 PT-LMZ420',[25,35,25,35,0.6,0.5,0.4,0.4]);put('PT-TMZ400',[15,15,15,15,7.4,7.0,5.0,5.0]);
  put('PT-CMZ50',[3,3,3,3,27.47,29.28,33.83,33.91]);put('PT-VW545N',[35,35,20,15,1.4,2.9,0.7,1.6]);
  return T})();
const curvRow=()=>{const l=LN(),m=M();for(const k of etCodes(l[0]))if(CURV[k])return {k,v:CURV[k]};
  const mk=m.m.split(' (')[0].split('/')[0];return CURV[mk]?{k:mk,v:CURV[mk]}:null};
if(!S.curv)S.curv={on:false,dir:'h',rh:10,rv:10};S0.curv=JSON.parse(JSON.stringify(S.curv));

(function(){const host=$('stackBox');if(!host)return;
  document.head.insertAdjacentHTML('beforeend','<style>.curvout p{margin:4px 0;font-size:12.5px}.curvout .cok{color:var(--ok)}.curvout .cbad{color:var(--bad)}#curvSvg{display:block;margin:6px 0;max-height:130px}</style>');
  const sw=(id,lab)=>`<label class="switch"><input type="checkbox" id="${id}" aria-label="${lab}"><span></span></label>`;
  host.insertAdjacentHTML('afterend',`<div class="row"><span style="color:var(--ink)">Buet lærred <span class="hint">(TEST · curved correction)</span></span>${sw('curvOn','Buet lærred')}</div>
  <div class="sub" id="curvBox" hidden>
    <div class="seg" role="group" aria-label="Buens retning"><button type="button" data-cdir="h" aria-pressed="true">Vandret bue</button><button type="button" data-cdir="v" aria-pressed="false">Lodret bue</button><button type="button" data-cdir="hv" aria-pressed="false">Begge</button></div>
    <div class="row" id="curvRhRow"><span>Radius vandret bue (R3)</span><span class="inl"><input type="number" id="curvRh" step="0.1" min="0.1"><span class="unit">m</span></span></div>
    <div class="row" id="curvRvRow"><span>Radius lodret bue (R2)</span><span class="inl"><input type="number" id="curvRv" step="0.1" min="0.1"><span class="unit">m</span></span></div>
    <svg id="curvSvg" viewBox="0 0 300 120" width="100%" role="img" aria-label="Buet lærred set ovenfra"></svg>
    <div id="curvOut" class="curvout"></div>
    <div class="hint">Grænser fra tabellen «projection range» i projektorens manual. Lærredet skal være en cirkelbue (en del af en perfekt cirkel). Projektor-menu: <b class="notr">[GEOMETRY] → [CURVED CORRECTION]</b>.</div>
  </div>`);
  $('curvOn').addEventListener('change',e=>{S.curv.on=e.target.checked;render()});
  document.querySelectorAll('[data-cdir]').forEach(b=>b.addEventListener('click',()=>{S.curv.dir=b.dataset.cdir;render()}));
  [['curvRh','rh'],['curvRv','rv']].forEach(([id,k])=>$(id).addEventListener('input',e=>{const v=parseFloat(e.target.value);if(v>0){S.curv[k]=v;render()}}));
})();

function curvUI(){if(!S.curv)S.curv=JSON.parse(JSON.stringify(S0.curv));const c=S.curv,box=$('curvBox');if(!box)return;$('curvOn').checked=c.on;box.hidden=!c.on;if(!c.on)return;
  const r=calc(),L=S.L,W=r.CW,H=r.CH,row=curvRow(),kon=!!(r.kon&&(Math.abs(r.kv||0)>0.05||Math.abs(r.kh||0)>0.05));
  document.querySelectorAll('[data-cdir]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cdir===c.dir));
  const useH=c.dir!=='v',useV=c.dir!=='h';$('curvRhRow').hidden=!useH;$('curvRvRow').hidden=!useV;
  const set=(id,v)=>{const el=$(id);if(document.activeElement!==el)el.value=v.toFixed(2)};set('curvRh',c.rh);set('curvRv',c.rv);
  const f2=x=>x.toFixed(2),sag=(R,ch)=>R>ch/2?R-Math.sqrt(R*R-ch*ch/4):null;
  const name=`<b class="notr">${esc(row?row.k:(etCodes(LN()[0]).join(' / ')||M().m.split(' (')[0]))}</b>`;
  let h='';
  if(!row)h+=`<p class="cbad">${name}: ikke oplyst i manualens tabel – kan ikke tjekkes.</p>`;
  else{const v=row.v,lim=kon?{r2:v[4],r3:v[5]}:{r2:v[6],r3:v[7]};
    if(v[6]==null)h+=`<p class="cbad">${name} kan ikke bruge curved correction (kun keystone).</p>`;
    else{
      h+=`<p>${name} · ${kon?'keystone og curved correction sammen':'kun curved correction'} · L ${f2(L)} m</p>`;
      if(kon&&v[4]==null)h+=`<p class="cbad">Manualen giver ingen grænse for keystone og curved correction sammen – slå keystone fra.</p>`;
      if(kon&&v[2]!=null){const okk=Math.abs(r.kv||0)<=v[2]+1e-6&&Math.abs(r.kh||0)<=v[3]+1e-6;h+=`<p class="${okk?'cok':'cbad'}">Keystone V ${f2(Math.abs(r.kv||0))}° / H ${f2(Math.abs(r.kh||0))}° · tilladt med buet lærred ±${v[2]}° / ±${v[3]}°</p>`}
      const line=(lab,R,mn,ch)=>{if(mn==null)return '';const q=R/L,ok=q>=mn-1e-9,s=sag(R,ch),minR=mn*L;
        return `<p class="${ok?'cok':'cbad'}">${lab}: R/L = ${f2(q)} · min. ${f2(mn)} → ${ok?'OK':'for stærk bue'} (mindste radius ${f2(minR)} m)${s!=null?` · buedybde ${(s*1000).toFixed(0)} mm`:' · radius mindre end halv bredde'}</p>`};
      if(useH)h+=line('Vandret bue (R3)',c.rh,lim.r3,W);
      if(useV)h+=line('Lodret bue (R2)',c.rv,lim.r2,H);
      h+=`<p class="hint">Uden keystone: min. R2/L ${f2(v[6])} · R3/L ${f2(v[7])}${v[4]!=null?` · med keystone (±${v[2]}°/±${v[3]}°): R2/L ${f2(v[4])} · R3/L ${f2(v[5])}`:''}</p>`}}
  $('curvOut').innerHTML=h;
  // tegning: vandret bue set ovenfra (eller lodret set fra siden) med projektor og radius
  {const R=useH?c.rh:c.rv,ch=useH?W:H,sc=Math.min(240/Math.max(ch,0.1),90/Math.max(L,0.1)),cx=150,y0=20,half=Math.min(ch/2,R*0.999);
    const a=Math.asin(half/R),N=40;let p='';for(let i=0;i<=N;i++){const t=-a+2*a*i/N,x=R*Math.sin(t),z=R-R*Math.cos(t);p+=(i?'L':'M')+(cx+x*sc).toFixed(1)+','+(y0+z*sc).toFixed(1)}
    const py=y0+L*sc,ok=row&&row.v[6]!=null&&(R/L)>=((kon?row.v[useH?5:4]:row.v[useH?7:6])??Infinity);
    $('curvSvg').innerHTML=`<line x1="${cx-ch/2*sc}" y1="${y0}" x2="${cx+ch/2*sc}" y2="${y0}" style="stroke:var(--faint)" stroke-dasharray="3 3"/>`+
      `<path d="M${cx},${py} L${(cx-half*sc).toFixed(1)},${(y0+(R-R*Math.cos(a))*sc).toFixed(1)} M${cx},${py} L${(cx+half*sc).toFixed(1)},${(y0+(R-R*Math.cos(a))*sc).toFixed(1)}" style="stroke:var(--beam)" opacity=".6"/>`+
      `<path d="${p}" fill="none" style="stroke:${ok?'var(--ok)':'var(--bad)'}" stroke-width="3"/>`+
      `<rect x="${cx-9}" y="${py-5}" width="18" height="10" rx="2" style="fill:var(--pj-hi)"/>`+
      `<text x="${cx+14}" y="${Math.min(py+4,116)}" style="fill:var(--muted);font:11px var(--f-mono)" class="notr">L ${f2(L)} m · R ${f2(R)} m</text>`;
    $('curvSvg').setAttribute('aria-label',useH?'Buet lærred set ovenfra':'Buet lærred set fra siden')}}
{const _r=render;render=function(){const o=_r.apply(this,arguments);try{curvUI()}catch(e){console.error(e)}return o}}
// boks 05: «Curved» i overskriften
{const t=document.querySelector('#dBlend .ttlw');if(t)t.textContent='Edge Blend, Stacking, Portrait Mode & Curved'}

/* Buet lærred i tegningerne 08 (plantegning), 09 (set bagfra) og 10 (snit). Lærredets midte står på væggen, kanterne kommer frem mod publikum
   (konkav bue): fremrykning z = R − √(R² − u²), u = afstand fra midten. Begge buer: z = zH(u) + zV(v). */
const curvOn=()=>!!(S.curv&&S.curv.on)&&S.venue!=='immersive'&&S.venue!=='golf'&&!REAR();
const cSag=(R,u)=>{const a=Math.abs(u);return a>=R?R:R-Math.sqrt(R*R-u*u)};
const cZ=(u,v)=>{const c=S.curv;return (c.dir!=='v'?cSag(c.rh,u):0)+(c.dir!=='h'?cSag(c.rv,v):0)};
const cTxt=r=>{const c=S.curv,a=[];if(c.dir!=='v')a.push(`R3 ${f2c(c.rh)} m`);if(c.dir!=='h')a.push(`R2 ${f2c(c.rv)} m`);return `buet lærred ${a.join(' · ')} · kanter ${Math.round(cZ(r.CW/2,r.CH/2)*1000)} mm frem`};
const f2c=x=>x.toFixed(2);
// 09: samme 1-punkts perspektiv som drawFront
{const _f=drawFront;drawFront=function(r){const o=_f.apply(this,arguments);try{if(curvOn())curvFront(r)}catch(e){console.error(e)}return o}}
function curvFront(r){const svg=$('front');if(!svg)return;
  const vw=1000,vh=560,E=Math.max(2.2,Math.min(3.4,S.rh*0.62)),RR=1.9,kB=Math.min((vw-24)/S.rw,(vh-44)/S.rh),s0=kB/RR,C=RR*S.rd/(RR-1),f=s0*C,X0=vw/2,Yh=(vh-14)/2+(S.rh/2-E)*kB;
  const P=(x,y,z)=>{const k=f/Math.max(0.12,C-z);return [X0+x*k,Yh-(y-E)*k]},pt=a=>a.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  const W=r.CW/2,H=r.CH/2,cx=r.cx,cy=r.cy,N=24,Q=(u,v)=>P(cx+u,cy+v,cZ(u,v)),edge=[];
  for(let i=0;i<=N;i++)edge.push(Q(-W+2*W*i/N,H));for(let i=0;i<=N;i++)edge.push(Q(W,H-2*H*i/N));
  for(let i=0;i<=N;i++)edge.push(Q(W-2*W*i/N,-H));for(let i=0;i<=N;i++)edge.push(Q(-W,-H+2*H*i/N));
  // selve lærredet tegnes buet: den flade ramme/flade fjernes, og den buede flade lægges samme sted (indhold som testbillede ligger ovenpå)
  const fs=[...svg.querySelectorAll('.fscr')],show=fs.length<2;if(!fs.length)return;
  const bm=Math.max(3,.06*(f/C))/(f/C),bo=[];   // sort kant ca. 6 cm uden om
  for(let i=0;i<=N;i++)bo.push(Q(-W-bm+2*(W+bm)*i/N,H+bm));for(let i=0;i<=N;i++)bo.push(Q(W+bm,H+bm-2*(H+bm)*i/N));
  for(let i=0;i<=N;i++)bo.push(Q(W+bm-2*(W+bm)*i/N,-H-bm));for(let i=0;i<=N;i++)bo.push(Q(-W-bm,-H-bm+2*(H+bm)*i/N));
  const scr=`<g class="curv9s" pointer-events="none"><polygon points="${pt(bo)}" fill="#05080b"/>${show?'':`<polygon points="${pt(edge)}" fill="url(#scrf)"/>`}</g>`;
  fs[0].insertAdjacentHTML('beforebegin',scr);fs.forEach((e,i)=>{if(i===0||!show)e.style.display='none'});
  const t=Q(0,H+bm);svg.insertAdjacentHTML('beforeend',`<g class="curv9" pointer-events="none">${lbl(t[0],t[1]-14,cTxt(r))}</g>`)}
// 10: snittet set fra siden (lærredet ved z = 0)
{const _s=drawSide;drawSide=function(r){const o=_s.apply(this,arguments);try{if(curvOn())curvSide(r)}catch(e){console.error(e)}return o}}
function curvSide(r){const svg=$('side');if(!svg||!SIDE)return;const X=z=>SIDE.pl+z*SIDE.sc,Y=y=>SIDE.vh-SIDE.pb-y*SIDE.sc,c=S.curv,H=r.CH/2,W=r.CW/2,cy=r.cy,N=30;
  let s='<g class="curv10" pointer-events="none">';const mid=[],ed=[];
  for(let i=0;i<=N;i++){const v=-H+2*H*i/N;mid.push([X(cZ(0,v)),Y(cy+v)]);ed.push([X(cZ(W,v)),Y(cy+v)])}
  const pl=a=>a.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  // selve lærredet buer: den flade lærreds-streg skjules (grebet bevares), og lærredet tegnes langs buen.
  // Vandret bue: set fra siden fylder lærredet fra midten (ved væggen) frem til sidekanterne
  const g0=svg.querySelector('.scrgrab');if(g0)[...g0.querySelectorAll('rect')].slice(1).forEach(e=>e.style.display='none');
  const okc=(r.zoomOK&&r.shOK&&r.sizeOK)?'var(--ok)':'var(--bad)',lw=.04*SIDE.sc+1;
  if(c.dir!=='v')s+=`<polygon points="${pl(mid.concat(ed.slice().reverse()))}" style="fill:${okc}" fill-opacity=".35"/><polyline points="${pl(ed)}" fill="none" style="stroke:${okc}" stroke-width="1.5"/>`;
  s+=`<polyline points="${pl(mid)}" fill="none" stroke="#05080b" stroke-width="${lw+5}" stroke-linejoin="round"/><polyline points="${pl(mid)}" fill="none" style="stroke:${okc}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  const t=ed[N];s+=lbl(t[0]+8,t[1]-12,cTxt(r),'d','start')+'</g>';svg.insertAdjacentHTML('beforeend',s)}
// 08: plantegningen (kun når der er en tegning med lærred)
{const _p=drawPlan;drawPlan=function(r){const o=_p.apply(this,arguments);try{if(curvOn())curvPlan(r)}catch(e){console.error(e)}return o}}
function curvPlan(r){const svg=$('planSvg'),p=S.plan;if(!svg||!planActive())return;const g=planGeo();if(!g)return;
  const k=Math.max(p.w,p.h)/900/(p.zoom||1),W=r.CW/2,H=r.CH/2,cx=r.cx,N=30,c=S.curv,front=[],edge=[];
  for(let i=0;i<=N;i++){const u=-W+2*W*i/N;front.push(g.at(cx+u,cZ(u,0)));edge.push(g.at(cx+u,cZ(u,H)))}
  const pl=a=>a.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  let s=`<g class="curv8" pointer-events="none">`;
  // selve lærredet buer: den lige lærreds-streg skjules (den usynlige greb-streg bevares)
  svg.querySelectorAll('line.scrline').forEach(e=>{if(e.getAttribute('stroke')!=='transparent')e.style.display='none'});
  if(c.dir!=='h')s+=`<polygon points="${pl(front.concat(edge.slice().reverse()))}" fill="#111" fill-opacity=".25"/>`;   // lodret bue: top-/underkant kommer frem
  s+=`<polyline points="${pl(front)}" fill="none" stroke="#111" stroke-width="${6*k}" stroke-linecap="round"/>`;
  const t=g.at(cx,cZ(W,H)+0.6);s+=`<text x="${t[0]}" y="${t[1]}" text-anchor="middle" style="font:${12*k}px var(--f-mono);fill:#D98300;paint-order:stroke;stroke:#fff;stroke-width:${3*k}px">${esc(cTxt(r))}</text></g>`;
  const lp=svg.querySelector('#plLoupe');if(lp)lp.insertAdjacentHTML('beforebegin',s);else svg.insertAdjacentHTML('beforeend',s)}
curvUI();try{render()}catch(e){}
