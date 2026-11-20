/* ===== Luft ind/ud (air intake/exhaust) – knap i boks 03, pile/mål i boks 09, 10, Immersive og Free Grid, advarsler under «Rum» =====
   Data aflæst i Panasonics manualer (Operating Instructions, links i MAN_PJ): siden «Projector body» (hvor projektoren suger ind og blæser ud)
   og «Precautions for use» (mindste afstand til vægge og genstande). Kun fakta (sider og mm) – ingen tegninger eller tekst fra manualerne.
   Sider er set bagfra i projektorens egen retning (venstre/højre som bag projektoren, foran = optikkens side).
   pd:true = siderne er opgivet i forhold til projektionsretningen (indbygget ultrakort kast, PT-CMZ50).
   c: mindste fri afstand i mm pr. side; mellem: afstand mellem projektorer side om side. p: [side «Projector body», side med afstandskrav]. */
const AIR_DATA=[
  [['pt-rq45k','pt-rz44k'],{in:['front','left','bottom'],out:['rear'],c:{left:500,right:200,rear:800,top:100},p:[33,24]}],
  [['pt-htq20'],{in:['front','left'],out:['rear'],c:{left:300,right:200,rear:500,top:100},p:[33,24]}],
  [['pt-rq50k'],{in:['front','left','right'],out:['rear'],c:{left:500,right:500,rear:500,top:100},p:[34,25]}],
  [['pt-rq35k2','pt-rz34k2'],{in:['front','left','bottom'],out:['rear'],c:{left:500,right:500,rear:500,top:100},p:[31,23]}],
  [['pt-rq25k','pt-rq18k','pt-rz24k','pt-rz17k'],{in:['front','left'],out:['rear'],c:{left:300,right:200,rear:500,top:100},p:[36,26]}],
  [['pt-req15','pt-rez15'],{in:['front','left'],out:['rear'],c:{left:300,right:300,rear:500,top:100},p:[33,25]}],
  [['pt-req12','pt-req10','pt-req80','pt-rez12','pt-rez10','pt-rez80'],{in:['front','left'],out:['rear'],c:{left:300,right:300,rear:500,top:100},p:[35,27]}],
  [['pt-rq7l','pt-rq6l','pt-rz7l','pt-rz6l'],{in:['front','left'],out:['rear'],c:{left:300,right:300,rear:400,top:100},p:[33,25]}],
  [['pt-frq60','pt-frq50'],{in:['front','left','bottom'],out:['rear'],c:{left:500,right:500,rear:500,top:100},p:[29,22]}],
  [['pt-frz60','pt-frz50'],{in:['front','left','bottom'],out:['rear'],c:{left:500,right:500,rear:500,top:100},p:[28,22]}],
  [['pt-mz20kl','pt-mz17kl','pt-mz14kl','pt-mz11kl'],{in:['front','left'],out:['rear'],c:{left:300,right:300,rear:600,top:100},p:[32,23]}],
  [['pt-mz882','pt-mz782','pt-mz682'],{in:['front','left','right'],out:['rear'],c:{left:500,right:500,rear:1000,top:100},p:[30,24]}],
  [['pt-lmz420','pt-lmz460'],{in:['right','rear'],out:['left'],c:{left:1000,right:500,rear:500,top:200},p:[29,22]}],
  [['pt-tmz400'],{in:['right','rear'],out:['left'],c:{left:1000,right:500,rear:500,top:200},p:[28,21]}],
  [['pt-vmq85','pt-vmq75','pt-vmq65'],{in:['front','right'],out:['left'],c:{left:1000,right:500,rear:500,top:200},p:[30,22]}],
  [['pt-vmz82','pt-vmz72','pt-vmz62','pt-vmz51s'],{in:['front','right'],out:['left'],c:{left:1000,right:500,rear:500,top:200},p:[29,21]}],
  [['pt-vmz7st','pt-vmz6st'],{in:['right','bottom'],out:['left'],c:{left:1000,right:500,rear:500,top:200},p:[29,21]}],
  [['pt-vw545n'],{in:['right'],out:['left','rear'],c:{left:1000,right:500,rear:500,top:200},p:[31,24]}],
  [['pt-cmz50'],{pd:true,in:['left','bottom'],out:['right'],c:{left:500,right:1000},mellem:1200,p:[27,19]}]];
const AIR={};AIR_DATA.forEach(([ks,v])=>ks.forEach(k=>AIR[k]=v));
const airFor=m=>m&&AIR[pjSlug(m.m)]||null;
const AIR_IN='#2F8FE8',AIR_OUT='#E5483B';
// knappen i boks 03: dropdown lukket, pile og mål slået fra, til brugeren sætter flueben
const AIR_UI={open:false,arrows:false,zones:false};
// zonefarve: rød = udblæsning, blå = indtag, grå = kun krav om fri plads (ingen luft ind/ud på den side)
const AIR_FREE='#8A939E',airCol=(A,sd)=>A.out.includes(sd)?AIR_OUT:A.in.includes(sd)?AIR_IN:AIR_FREE;
const airLbl=(x,y,t,col,an='middle')=>`<text class="airlbl" x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${col}" font-size="10" font-weight="600" text-anchor="${an}" dominant-baseline="middle" paint-order="stroke" stroke="var(--bg)" stroke-width="3">${t} mm</text>`;
const AIR_DA={front:'foran',rear:'bagpå',left:'venstre side',right:'højre side',top:'oven på',bottom:'under'};

/* projektorens sider som retning i calc-koordinater (x til højre set bagfra, y op, z væk fra lærredet).
   Loftmonteret: vendt om (venstre/højre og top/bund bytter). Ultrakort kast-optik på et almindeligt kabinet: kabinettet vender bagud. */
/* L-formet optik (3DLP m.fl.): kabinettets front vender mod linsehovedet. Rotér (S.lrot) som i calc:
   0 = kabinet lodret under linsehovedet (front op), 1 = fladt til højre (front mod venstre), 2 = lodret over (front ned), 3 = fladt til venstre.
   Lodret: kabinettets top vender væk fra lærredet (antaget). Fladt: toppen vender op. */
function airDirL(side,r){const lr=(S.lrot||0)&3,F=[[0,1,0],[-1,0,0],[0,-1,0],[1,0,0]][lr],U=lr&1?[0,1,0]:[0,0,1],R=airCross(F,U),c=S.ceil?[-1,-1,1]:[1,1,1];
  const v={front:F,rear:F.map(x=>-x),right:R,left:R.map(x=>-x),top:U,bottom:U.map(x=>-x)}[side];return v.map((x,k)=>x*c[k]+0)}
function airDir(side,r,A){if(r.kind==='l')return airDirL(side,r);const rev=r.kind==='u'&&!A.pd,fx=(S.ceil?-1:1)*(rev?-1:1),fy=S.ceil?-1:1,fz=rev?-1:1;
  return {front:[0,0,-fz],rear:[0,0,fz],left:[-fx,0,0],right:[fx,0,0],top:[0,fy,0],bottom:[0,-fy,0]}[side]}

/* ---- boks 10 (snit): pile foran/bag/top/bund + fri zone bag og over ---- */
function airArrowSVG(x1,y1,x2,y2,col){const a=Math.atan2(y2-y1,x2-x1),h=7,w=4.5;
  const p=[[x2,y2],[x2-h*Math.cos(a)+w*Math.sin(a),y2-h*Math.sin(a)-w*Math.cos(a)],[x2-h*Math.cos(a)-w*Math.sin(a),y2-h*Math.sin(a)+w*Math.cos(a)]];
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/><polygon points="${p.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ')}" fill="${col}"/>`}
// alle temaer undtagen Warping (egen side i en ramme)
const airOK=(r,A)=>A&&!r.PT&&S.venue!=='warp';
window.airSide=function(r,X,Y,sc){const A=airFor(r.m);if(!airOK(r,A)||!(AIR_UI.arrows||AIR_UI.zones))return '';const K=r.UB||r.B;let s='<g class="airL" pointer-events="none">';
  r.pjs.filter(p=>p.c===0&&p.r===0).forEach(p=>{const z0=S.L+K.z0,z1=S.L+K.z1,y0=p.ly+K.y0,y1=p.ly+K.y1,zc=(z0+z1)/2,yc=(y0+y1)/2,L=26;
    // pilene sidder lidt væk fra optikken (foran) og ophænget (oven/under), så de ikke dækker dem
    const yo=y0+(y1-y0)*(S.ceil?.25:.75),zo=z0+(z1-z0)*.3,face=d=>d[2]?[d[2]<0?z0:z1,yo]:[zo,d[1]>0?y1:y0];
    // fri zone (mindste afstand) for siderne, der ses i snittet
    if(AIR_UI.zones)Object.keys(A.c).forEach(sd=>{const c=A.c[sd];if(!c)return;const d=airDir(sd,r,A);if(d[0])return;const m=c/1000,col=airCol(A,sd);
      if(d[2]){const za=d[2]>0?z1:z0-m,zb=d[2]>0?z1+m:z0;s+=`<rect x="${X(za)}" y="${Y(y1)}" width="${(zb-za)*sc}" height="${(y1-y0)*sc}" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-dasharray="4 3" stroke-width="1"/>`+airLbl((X(za)+X(zb))/2,Y(y1)-8,c,col)}
      else{const ya=d[1]>0?y1:y0-m,yb=d[1]>0?y1+m:y0;s+=`<rect x="${X(z0)}" y="${Y(yb)}" width="${(z1-z0)*sc}" height="${(yb-ya)*sc}" fill="${col}" fill-opacity=".1" stroke="${col}" stroke-dasharray="4 3" stroke-width="1"/>`+airLbl((X(z0)+X(z1))/2,(Y(ya)+Y(yb))/2,c,col)}});
    if(!AIR_UI.arrows)return;
    const put=(sd,out)=>{const d=airDir(sd,r,A);if(d[0])return;const [fz,fy]=face(d),px=X(fz),py=Y(fy),dx=Math.sign(X(fz+d[2])-px)||0,dy=Math.sign(Y(fy+d[1])-py)||0,ox=px+dx*L,oy=py+dy*L;
      s+=out?airArrowSVG(px+dx*3,py+dy*3,ox,oy,AIR_OUT):airArrowSVG(ox,oy,px+dx*3,py+dy*3,AIR_IN)};
    A.in.forEach(sd=>put(sd,false));A.out.forEach(sd=>put(sd,true))});
  return s+'</g>'};

/* ---- boks 09 (set bagfra): pile venstre/højre/top/bund + fri zone til siderne ---- */
const airP3=projector3D;
projector3D=function(P,r,p){let s=airP3(P,r,p);const A=airFor(r.m);if(!airOK(r,A)||p.r||p.s||!(AIR_UI.arrows||AIR_UI.zones))return s;const K=r.UB||r.B,z=S.L+K.z1;
  const x0=p.lx+K.x0,x1=p.lx+K.x1,y0=p.ly+K.y0,y1=p.ly+K.y1,xc=(x0+x1)/2,yc=(y0+y1)/2;
  if(AIR_UI.zones)Object.keys(A.c).forEach(sd=>{const c=A.c[sd];if(!c)return;const d=airDir(sd,r,A);if(!d[0])return;const m=c/1000,xa=d[0]>0?x1:x0-m,xb=d[0]>0?x1+m:x0,a=P(xa,y1,z),b=P(xb,y0,z),col=airCol(A,sd);
    s+=`<rect class="airL" pointer-events="none" x="${Math.min(a[0],b[0])}" y="${a[1]}" width="${Math.abs(b[0]-a[0])}" height="${b[1]-a[1]}" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-dasharray="4 3" stroke-width="1"/>`+`<g pointer-events="none">${(()=>{const xc0=P(xc,y1,z)[0],lo=Math.min(a[0],b[0]),hi=Math.max(a[0],b[0]),left=(lo+hi)/2<xc0;return airLbl(left?hi:lo,a[1]-8,c,col,left?'end':'start')})()}</g>`});
  if(!AIR_UI.arrows)return s;
  const put=(sd,out)=>{const d=airDir(sd,r,A);if(d[2])return;const f=d[0]?[d[0]>0?x1:x0,yc]:[xc,d[1]>0?y1:y0],q=P(f[0],f[1],z),q2=P(f[0]+d[0],f[1]+d[1],z),
      dx=Math.sign(q2[0]-q[0])||0,dy=Math.sign(q2[1]-q[1])||0,L=22;
    s+=out?airArrowSVG(q[0]+dx*2,q[1]+dy*2,q[0]+dx*L,q[1]+dy*L,AIR_OUT):airArrowSVG(q[0]+dx*L,q[1]+dy*L,q[0]+dx*2,q[1]+dy*2,AIR_IN)};
  A.in.forEach(sd=>put(sd,false));A.out.forEach(sd=>put(sd,true));return s};

/* ---- advarsler (vises under «Rum:») ---- */
const airC0=calc;
calc=function(){const r=airC0.apply(this,arguments);try{airIssues(r)}catch(e){}return r};
// advarslerne gælder, så snart luft ind/ud er slået til (pile eller mål)
const airWarnOn=()=>AIR_UI.arrows||AIR_UI.zones;
function airIssues(r){if(airWarnOn()&&S.venue==='immersive'){airImmIssues(r);return}const A=airFor(r.m);if(!airWarnOn()||!airOK(r,A))return;const K=r.UB||r.B,mm=v=>Math.round(v);
  const iss=r.roomIssues,add=t=>{if(!iss.includes(t))iss.push(t)};
  for(const sd of Object.keys(A.c)){const c=A.c[sd]/1000,d=airDir(sd,r,A),tag=A.out.includes(sd)?'udblæsning':'luft';
    if(d[2]>0&&S.L+K.z1+c>DEPTH()+1e-6)add(`${tag}: for tæt på bagvæggen (min. ${mm(A.c[sd])} mm)`);
    if(d[2]<0&&S.L+K.z0-c<-1e-6)add(`${tag}: for tæt på lærredsvæggen (min. ${mm(A.c[sd])} mm)`);
    if(d[1]>0){const top=Math.max(...r.pjs.map(p=>p.ly))+K.y1;if(top+c>S.rh+1e-6)add(`${tag}: for tæt på loftet (min. ${mm(A.c[sd])} mm)`)}
    if(d[1]<0){const bot=Math.min(...r.pjs.map(p=>p.ly))+K.y0;if(bot-c<-1e-6)add(`${tag}: for tæt på gulvet (min. ${mm(A.c[sd])} mm)`)}
    if(d[0]){const xs=r.pjs.map(p=>p.lx),edge=d[0]>0?Math.max(...xs)+K.x1:Math.min(...xs)+K.x0;if(Math.abs(edge)+c>S.rw/2+1e-6)add(`${tag}: for tæt på sidevæggen (min. ${mm(A.c[sd])} mm)`)}}
  // projektorer side om side (edge blend): afstanden mellem kabinetterne skal opfylde begge siders krav
  if(r.N>1){const cols=[...new Set(r.pjs.filter(p=>!p.r&&!p.s).map(p=>p.lx))].sort((a,b)=>a-b),bw=K.x1-K.x0;
    const need=Math.max(A.mellem||0,...Object.keys(A.c).filter(sd=>airDir(sd,r,A)[0]).map(sd=>A.c[sd]||0));let gap=1e9;for(let i=1;i<cols.length;i++)gap=Math.min(gap,cols[i]-cols[i-1]-bw);
    if(need&&gap*1000<need-1)add(`for lidt luft mellem projektorerne (min. ${mm(need)} mm)`)}
  // stak: luft over hver projektor (afstand mellem kabinetterne)
  if(r.stk>1&&A.c.top){const gap=(r.outer[1]-(K.y1-K.y0))*1000;if(gap<A.c.top-1)add(`stak: for lidt luft mellem projektorerne (min. ${mm(A.c.top)} mm)`)}}

/* ---- info i boks 03: hvor luften går ind og ud + afstandskrav + link til manualens side ---- */
function airInfo(){let el=document.getElementById('airInfo');if(!el){const t=document.getElementById('pjTerm');if(!t)return;
    el=document.createElement('div');el.id='airInfo';el.className='airwrap';t.insertAdjacentElement('afterend',el);
    el.innerHTML=`<button type="button" class="termbtn airbtn" id="airBtn" aria-expanded="false" aria-controls="airDrop"><span class="ttx">Luft ind/ud</span><span class="airchev" aria-hidden="true">▾</span></button>
      <div class="airdrop" id="airDrop" hidden><div class="airinfo" id="airTxt"></div>
      <label class="airchk"><input type="checkbox" data-air="arrows"> <span>Vis pile for luft ind/ud</span></label>
      <label class="airchk"><input type="checkbox" data-air="zones"> <span>Vis mål for mindste fri afstand</span></label></div>`;
    el.querySelector('#airBtn').addEventListener('click',()=>{AIR_UI.open=!AIR_UI.open;airInfo()});
    el.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.air;if(!k)return;AIR_UI[k]=e.target.checked;render();if(typeof FG!=='undefined'&&FG.tab==='grid')fgDraw()})}
  el.hidden=S.venue==='warp';
  el.querySelector('#airBtn').setAttribute('aria-expanded',AIR_UI.open);el.querySelector('#airDrop').hidden=!AIR_UI.open;el.classList.toggle('on',AIR_UI.open);
  el.querySelectorAll('[data-air]').forEach(c=>{c.checked=!!AIR_UI[c.dataset.air]});
  const m=MODELS[S.mi],A=airFor(m);el.querySelectorAll('.airchk').forEach(l=>{l.hidden=!A});el=el.querySelector('#airTxt');
  if(!AIR_UI.open)return;
  if(!A){el.innerHTML='<span>ingen data for denne projektor</span>';return}
  const u=MAN_PJ[pjSlug(m.m)],url=u?(/^https?:/.test(u)?u:MAN_B+u):'',lnk=n=>url?`<a href="${url}#page=${n}" target="_blank" rel="noopener noreferrer">s. ${n}</a>`:`s. ${n}`;
  const cs=['rear','left','right','top'].filter(k=>A.c[k]).map(k=>`<span>${AIR_DA[k]} ${A.c[k]} mm</span>`).join(' · ');
  el.innerHTML=`<i style="color:${AIR_IN}">▶</i> <span>indtag:</span> ${A.in.map(k=>`<span>${AIR_DA[k]}</span>`).join(', ')} · <i style="color:${AIR_OUT}">▶</i> <span>udblæsning:</span> ${A.out.map(k=>`<span>${AIR_DA[k]}</span>`).join(', ')}`+
    `<br><span>mindste fri afstand:</span> ${cs}${A.mellem?` · <span>mellem projektorer</span> ${A.mellem} mm`:''} <small>(manual ${lnk(A.p[0])}, ${lnk(A.p[1])})</small>`+
    `<br><small><i style="color:${AIR_IN}">■</i> <span>indtag</span> · <i style="color:${AIR_OUT}">■</i> <span>udblæsning</span> · <i style="color:${AIR_FREE}">■</i> <span>kun fri plads (ingen luft ind/ud)</span></small>`}
const airR0=render;
// mm-tallene lægges øverst i tegningen, så appens egne målmærker ikke dækker dem
function airLblTop(){document.querySelectorAll('text.airlbl').forEach(t=>{const s=t.ownerSVGElement;if(!s||t.parentNode===s&&s.lastElementChild===t)return;
  const m=t.getCTM(),sm=s.getCTM();if(!m||!sm)return;const k=sm.inverse().multiply(m);t.setAttribute('transform',`matrix(${k.a} ${k.b} ${k.c} ${k.d} ${k.e} ${k.f})`);s.appendChild(t)})}
// Immersive: statuslinjen viser ikke «Rum:»-advarsler – luft-advarslerne tilføjes her
function airImmStatus(){if(S.venue!=='immersive'||!airWarnOn())return;const el=document.getElementById('topStatus');if(!el)return;
  const iss=calc().roomIssues.filter(t=>/luft|udblæsning/.test(t));if(!iss.length)return;
  el.querySelectorAll('.pill.ok').forEach(p=>p.remove());el.insertAdjacentHTML('beforeend',pill('warn','Rum: '+iss.join(', ')))}
render=function(){const v=airR0.apply(this,arguments);try{airInfo();airLblTop();airImmStatus()}catch(e){}return v};

/* ---- Immersive: projektorgrupperne (front-væg, sidevægge, gulv) hænger i loftet – pile, fri zoner og advarsler ---- */
const airCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const AIR_OTH={front:['top','left'],rear:['top','left'],left:['top','front'],right:['top','front'],top:['front','left'],bottom:['front','left']};
function airImmAxes(q,A){const F0={v:[0,0,-1],l:[-1,0,0],r:[1,0,0],f:[0,-1,0]}[q.key];
  let up=q.key==='f'?[0,0,-1]:[0,-1,0],rt=airCross(F0,up);      // i loftet: vendt på hovedet; gulv: peger ned
  if(q.rot){const u2=rt;rt=up.map(v=>-v);up=u2}                     // portræt (drejet 90°)
  const rev=q.pl&&q.pl[7]&&q.pl[7][0]==='u'&&!A.pd,F=rev?F0.map(v=>-v):F0,R=rev?rt.map(v=>-v):rt,d=q.pm.dim.map(v=>v/1000);
  return {front:[F,d[2]/2],rear:[F.map(v=>-v),d[2]/2],left:[R.map(v=>-v),d[0]/2],right:[R,d[0]/2],top:[up,d[1]/2],bottom:[up.map(v=>-v),d[1]/2]}}
const airImmOK=q=>q.on&&q.ok&&q.pm&&airFor(q.pm);
const airAdd=(C,...vs)=>C.map((v,k)=>v+vs.reduce((a,[d,s])=>a+d[k]*s,0));
function airImmDraw(IM,proj){if(!(AIR_UI.arrows||AIR_UI.zones)||S.venue!=='immersive')return '';let s='<g class="airL" pointer-events="none">';
  for(const q of IM||[]){if(!airImmOK(q))continue;const A=airFor(q.pm),ax=airImmAxes(q,A),ts=immPos(q),L=ts.length>16?12:18;
    ts.forEach((t,ti)=>{const C=t.pj;
      // store grupper (fx gulvet): kun pile – zonerne ville dække hele tegningen (advarslerne regnes stadig for alle)
      if(AIR_UI.zones&&ts.length<=8)Object.keys(A.c).forEach(sd=>{if(!ax[sd])return;const c=A.c[sd]/1000,[d,h]=ax[sd],[a,b]=AIR_OTH[sd].map(k=>ax[k]),col=airCol(A,sd),pt=[];
        for(const e of [h,h+c])for(const s1 of [-1,1])for(const s2 of [-1,1])pt.push(proj(...airAdd(C,[d,e],[a[0],s1*a[1]],[b[0],s2*b[1]])));
        const hl=hull(pt);if(!hl||hl.length<3)return;s+=`<polygon points="${pts(hl)}" fill="${col}" fill-opacity=".1" stroke="${col}" stroke-dasharray="4 3" stroke-width="1"/>`;
        if(ti===0&&A.out.includes(sd)){const m=proj(...airAdd(C,[d,h+c]));s+=airLbl(m[0],m[1],A.c[sd],col)}});
      if(AIR_UI.arrows){const put=(sd,out)=>{const [d,h]=ax[sd],f=proj(...airAdd(C,[d,h])),g=proj(...airAdd(C,[d,h+.3])),dx=g[0]-f[0],dy=g[1]-f[1],n=Math.hypot(dx,dy);if(n<3)return;
          const ux=dx/n,uy=dy/n;s+=out?airArrowSVG(f[0]+ux*2,f[1]+uy*2,f[0]+ux*L,f[1]+uy*L,AIR_OUT):airArrowSVG(f[0]+ux*L,f[1]+uy*L,f[0]+ux*2,f[1]+uy*2,AIR_IN)};
        A.in.forEach(sd=>put(sd,false));A.out.forEach(sd=>put(sd,true))}})}
  return s+'</g>'}
window.airImm10=(IM,X,Y)=>airImmDraw(IM,(x,y,z)=>[X(z),Y(y)]);
window.airImm09=(IM,P)=>airImmDraw(IM,P);
// samme tekster som i de andre temaer: hvad der er for tæt på (loft, gulv, bagvæg, lærredsvæg, sidevæg)
function airWall(add,A,sd,wall){if(wall)add(`${A.out.includes(sd)?'udblæsning':'luft'}: for tæt på ${wall} (min. ${A.c[sd]} mm)`)}
function airImmIssues(r){const iss=r.roomIssues,add=t=>{if(!iss.includes(t))iss.push(t)},w=S.rw/2,D=DEPTH();
  for(const q of immCalc(r)){if(!airImmOK(q))continue;const A=airFor(q.pm),ax=airImmAxes(q,A),ts=immPos(q);
    for(const t of ts)for(const sd of Object.keys(A.c)){if(!ax[sd])continue;const c=A.c[sd]/1000,[d,h]=ax[sd],p=airAdd(t.pj,[d,h+c]);
      airWall(add,A,sd,p[1]>S.rh+1e-6?'loftet':p[1]<-1e-6?'gulvet':p[2]<-1e-6?'lærredsvæggen':p[2]>D+1e-6?'bagvæggen':Math.abs(p[0])>w+1e-6?'sidevæggen':'')}
    // naboprojektorer i samme gruppe: varm luft fra udblæsningen og mindsteafstanden mellem kabinetterne
    A.out.forEach(sd=>{const c=(A.c[sd]||0)/1000;if(!c)return;const [d,h]=ax[sd],rq=Math.max(...q.pm.dim)/2000;
      ts.forEach(a=>ts.forEach(b=>{if(a===b)return;const v=b.pj.map((x,k)=>x-a.pj[k]),al=v[0]*d[0]+v[1]*d[1]+v[2]*d[2],pe=Math.hypot(...v.map((x,k)=>x-al*d[k]));
        if(al>0&&al<h+c+rq&&pe<rq*1.2)add(`for lidt luft mellem projektorerne (min. ${A.c[sd]} mm)`)}))})}}

/* ---- Free Grid: pile og fri zoner i 3D + advarsler (varm luft mod en anden projektor, for tæt på væg/loft) ---- */
function airFGAxes(p,sp,A){const {u,n}=fgDir(p),rev=sp.ln&&sp.ln[7]&&sp.ln[7][0]==='u'&&!A.pd,inv=!sp.dn&&p.inv,s=(inv?-1:1)*(rev?-1:1);
  const F=sp.dn?[0,-1,0]:[u[0],0,u[1]],V=sp.dn?[u[0],0,u[1]]:[0,inv?-1:1,0],R=[n[0]*s,0,n[1]*s],Fw=rev?F.map(v=>-v):F;
  const hb=sp.port?sp.bh:sp.bw,vb=sp.port?sp.bw:sp.bh;
  return {front:[Fw,sp.Dp/2],rear:[Fw.map(v=>-v),sp.Dp/2],left:[R.map(v=>-v),hb/2],right:[R,hb/2],top:[V,vb/2],bottom:[V.map(v=>-v),vb/2]}}
const airFGok=sp=>true;   // Free Grid tegner også L-optik-projektorer som et almindeligt kabinet
window.airFG=function(g,p,sp,Bc,o){const A=airFor(sp.m);if(!A||!window.THREE||!airFGok(sp))return;const ax=airFGAxes(p,sp,A);
  const arrow=(sd,out)=>{const [d,h]=ax[sd],D=new THREE.Vector3(...d),L=Math.max(.25,sp.Dp*.6),f=Bc.clone().addScaledVector(D,h+.02);
    const from=out?f:f.clone().addScaledVector(D,L),dir=out?D:D.clone().negate();g.add(new THREE.ArrowHelper(dir,from,L,out?0xE5483B:0x2F8FE8,L*.35,L*.22))};
  if(AIR_UI.arrows){A.in.forEach(sd=>arrow(sd,false));A.out.forEach(sd=>arrow(sd,true))}
  if(AIR_UI.zones)A.out.forEach(sd=>{const c=(A.c[sd]||0)/1000;if(!c)return;const [d,h]=ax[sd],D=new THREE.Vector3(...d),ex=airFGExt(ax,sd),
    box=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xE5483B,transparent:true,opacity:.12,depthWrite:false}));
    box.position.copy(Bc).addScaledVector(D,h+c/2);const M=new THREE.Matrix4().makeBasis(...airFGBasis(ax,sd));box.quaternion.setFromRotationMatrix(M);box.scale.set(c,ex[0],ex[1]);g.add(box)})};
// zonens tværmål: de to andre akser
function airFGExt(ax,sd){const o={front:['top','left'],rear:['top','left'],left:['top','front'],right:['top','front'],top:['front','left'],bottom:['front','left']}[sd];return [ax[o[0]][1]*2,ax[o[1]][1]*2]}
function airFGBasis(ax,sd){const o={front:['top','left'],rear:['top','left'],left:['top','front'],right:['top','front'],top:['front','left'],bottom:['front','left']}[sd];
  return [new THREE.Vector3(...ax[sd][0]),new THREE.Vector3(...ax[o[0]][0]),new THREE.Vector3(...ax[o[1]][0])]}
function airFGCenter(p,sp){const g=fgGeo(p,sp),h=sp.dn?p.h+sp.Lo:p.h;return [p.x,h,p.y]}
const airW0=fgWarn;
fgWarn=function(p,sp=fgSpec(p)){const w=airW0(p,sp);try{const A=airFor(sp.m);if(!airWarnOn()||!A||!airFGok(sp))return w;const ax=airFGAxes(p,sp,A),C=airFGCenter(p,sp),i=FG.pjs.indexOf(p);
  for(const sd of Object.keys(A.c)){if(!ax[sd])continue;const c=A.c[sd]/1000,[d,h]=ax[sd],q=C.map((v,k)=>v+d[k]*(h+c));
    airWall(t=>{if(!w.includes(t))w.push(t)},A,sd,q[1]>FG.hgt+1e-6?'loftet':q[1]<-1e-6?'gulvet':(q[0]<-1e-6||q[0]>FG.w+1e-6||q[2]<-1e-6||q[2]>FG.d+1e-6)?'væggen':'')}
  // varm luft (udblæsningszonen) rammer en anden projektor
  A.out.forEach(sd=>{const c=(A.c[sd]||0)/1000;if(!c)return;const [d,h]=ax[sd];
    FG.pjs.forEach((q,j)=>{if(q===p)return;const sq=fgSpec(q),Q=airFGCenter(q,sq),rq=Math.hypot(sq.bw,sq.bh,sq.Dp)/2,v=Q.map((x,k)=>x-C[k]),along=v[0]*d[0]+v[1]*d[1]+v[2]*d[2],perp=Math.hypot(...v.map((x,k)=>x-along*d[k]));
      if(along>h-rq&&along<h+c+rq&&perp<Math.max(sp.bw,sp.bh)/2+rq)w.push(`blæser varm luft mod P${j+1} (udblæsning ${AIR_DA[sd]}, min. ${A.c[sd]} mm)`)})})}catch(e){}return w};
