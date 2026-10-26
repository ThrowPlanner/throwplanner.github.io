/* ===== IMMERSIVE: LOKALET SET OVENFRA (x fra midten mod højre, z fra front-væggen og ned i billedet) ===== */
function drawTop(r){const on=S.venue==='immersive';$('topView').hidden=!on;if(!on)return;
  const vw=1000,pl=70,pr=70,pt=56,pb=40,w=S.rw/2,T=.28;
  const sc=Math.min((vw-pl-pr)/(S.rw+2*T),520/(S.rd+2*T)),ox=vw/2;
  const X=x=>ox+x*sc,Y=z=>pt+z*sc;
  const IM=immCalc(r),[v,l,rr,f]=IM,LB=[];
  let s=DEFS('t');
  // gulv og vægge (snitflader)
  s+=`<rect x="${X(-w)}" y="${Y(0)}" width="${S.rw*sc}" height="${S.rd*sc}" style="fill:var(--r-side)"/>`;
  s+=`<rect x="${X(-w-T)}" y="${Y(-T)}" width="${(S.rw+2*T)*sc}" height="${T*sc}" fill="url(#hatcht)"/><rect x="${X(-w-T)}" y="${Y(S.rd)}" width="${(S.rw+2*T)*sc}" height="${T*sc}" fill="url(#hatcht)"/>`;
  s+=`<rect x="${X(-w-T)}" y="${Y(0)}" width="${T*sc}" height="${S.rd*sc}" fill="url(#hatcht)"/><rect x="${X(w)}" y="${Y(0)}" width="${T*sc}" height="${S.rd*sc}" fill="url(#hatcht)"/>`;
  // projektor set ovenfra: kabinet med linsen mod fladen (dir: retning mod fladen)
  const pjBox=(x,z,dir,c)=>{const a=.22,b=.3;const [hw,hd]=dir==='x'?[b,a]:[a,b];return `<rect x="${X(x-hw)}" y="${Y(z-hd)}" width="${2*hw*sc}" height="${2*hd*sc}" rx="2" style="fill:var(--pj-hi);stroke:${c}" stroke-width="1.4"/>`};
  const beam=(p,a,b,c)=>`<polygon points="${X(p[0])},${Y(p[1])} ${X(a[0])},${Y(a[1])} ${X(b[0])},${Y(b[1])}" style="fill:${c}" opacity=".12"/>`+
    [a,b].map(e=>`<line x1="${X(p[0])}" y1="${Y(p[1])}" x2="${X(e[0])}" y2="${Y(e[1])}" style="stroke:${c}" stroke-width=".9" opacity=".7"/>`).join('');
  // gulv: billederne på gulvet, projektorerne i loftet lige over
  if(f.on&&f.ok){const c=IMC.f;const P=immPos(f);
    for(const t of P){const [x0,,z0]=t.c4[0],[x1,,z1]=t.c4[2];s+=`<rect x="${X(Math.min(x0,x1))}" y="${Y(Math.min(z0,z1))}" width="${Math.abs(x1-x0)*sc}" height="${Math.abs(z1-z0)*sc}" style="fill:${c};stroke:${c}" fill-opacity=".1" stroke-dasharray="6 3"/>`}
    for(const t of P)s+=pjBox(t.pj[0],t.pj[2],'z',c);
    LB.push([c,`gulv: ${f.n} projektorer, ${f3(f.L)} m over gulvet`])}
  // front-væg: projektorerne skyder mod væggen øverst
  if(v.on&&v.ok){const c=IMC.v;const seen=new Set();for(const t of immPos(v)){if(seen.has(t.uc.toFixed(3)))continue;seen.add(t.uc.toFixed(3));const [x,,z]=t.pj;
      s+=beam([x,z],[t.u0-w,0],[t.u1-w,0],c)+pjBox(x,z,'z',c)+`<rect x="${X(t.u0-w)}" y="${Y(0)-4}" width="${(t.u1-t.u0)*sc}" height="4" style="fill:${c}" opacity=".85"/>`}
    LB.push([c,`front-væg: ${v.n} projektorer, ${f3(v.L)} m fra væggen`])}
  // sidevægge: projektorerne hænger ved den modsatte væg og skyder på tværs
  for(const q of [l,rr])if(q.on&&q.ok){const c=IMC[q.key],xw=q.key==='l'?-w:w,d=q.key==='l'?-4:0;const seen=new Set();
    for(const t of immPos(q)){if(seen.has(t.uc.toFixed(3)))continue;seen.add(t.uc.toFixed(3));const [x,,z]=t.pj;
      s+=beam([x,z],[xw,t.u0],[xw,t.u1],c)+pjBox(x,z,'x',c)+`<rect x="${X(xw)+d}" y="${Y(t.u0)}" width="4" height="${(t.u1-t.u0)*sc}" style="fill:${c}" opacity=".85"/>`}
    LB.push([c,`${q.name.toLowerCase()}: ${q.n} projektorer i loftet, ${f3(q.L)} m fra væggen`])}
  // kastafstand pr. flade (venstre væg ved forreste, højre væg ved bageste projektor, så målene ikke overlapper)
  for(const q of [v,l,rr])if(q.on&&q.ok){const P=immPos(q),t=q.key==='r'?P[P.length-1]:P[0];if(!t)continue;const [x,,z]=t.pj;
    if(q.key==='v'){const xm=x+.45;s+=`<g class="Ldim">`+dimV(X(xm),Y(0),Y(z),`${f3(q.L)} m`,null,null,X(xm)+40)+'</g>'}
    else{const xw=q.key==='l'?-w:w,zm=q.key==='r'?z-.45:z+.45;s+=`<g class="Ldim">`+dimH(X(xw),X(x),Y(zm),`${f3(q.L)} m`,null,null)+'</g>'}}
  // rummets mål og retning
  s+=dimH(X(-w),X(w),Y(-T)-22,`bredde ${f3(S.rw)} m`,Y(-T)-4,Y(-T)-4);
  s+=dimV(X(-w-T)-24,Y(0),Y(S.rd),`dybde ${f3(S.rd)} m`,X(-w-T)-4,X(-w-T)-4);
  s+=lbl(X(0),Y(-T/2),'Front-væg','m')+lbl(X(-w-T/2),Y(S.rd/2),'Venstre væg','m','middle',-90)+lbl(X(w+T/2),Y(S.rd/2),'Højre væg','m','middle',90);
  // forklaring under tegningen
  const y0=Y(S.rd+T)+24;LB.forEach(([c,t],i)=>{const y=y0+i*16;s+=`<rect x="${X(-w)}" y="${y-9}" width="10" height="10" rx="2" style="fill:${c}"/><text class="m" x="${X(-w)+16}" y="${y}" style="font-size:11px;fill:var(--ink)">${esc(t)}</text>`});
  if(!LB.length)s+=`<text class="m" x="${X(0)}" y="${Y(S.rd/2)}" text-anchor="middle" style="font-size:13px;fill:var(--muted)">Vælg flader under «Lokalet set bagfra».</text>`;
  const vh=Math.ceil(y0+LB.length*16+pb-16);
  const el=$('top');el.setAttribute('viewBox',`0 0 ${vw} ${vh}`);el.innerHTML=s}
