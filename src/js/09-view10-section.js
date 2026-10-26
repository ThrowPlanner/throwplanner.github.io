/* ===== SNIT (set fra siden) ===== */
function drawSide(r){
  const vw=1000,vh=430,pl=96,pr=60,pt=40,pb=100;
  const sc=Math.min((vw-pl-pr)/(S.rd+0.6),(vh-pt-pb)/(S.rh+0.5));
  const X=z=>pl+z*sc, Y=y=>vh-pb-y*sc;SIDE={pl,sc,vh,pb};
  const T=.28;let s=DEFS('s');
  s+=`<rect x="${X(0)}" y="${Y(S.rh)}" width="${S.rd*sc}" height="${S.rh*sc}" style="fill:var(--r-side)"/>`;
  const VN=S.venue;
  if(VN==='museum'){const ART=['#C8553D','#2E6F95','#E0B04A','#5C8A5A','#7A4E8C','#D98C6A'];let i=0;for(let z=2.4;z<S.rd-1.4;z+=2.8){const a=1.0+0.4*((i%3)/2);s+=`<rect x="${X(z)-3}" y="${Y(1.35+a)-3}" width="${a*1.25*sc+6}" height="${a*sc+6}" style="fill:#2B2622"/><rect x="${X(z)}" y="${Y(1.35+a)}" width="${a*1.25*sc}" height="${a*sc}" style="fill:${ART[i%ART.length]}"/>`;i++}}
  else if(VN==='immersive'){const IM=immCalc(r),[v,l,rr,f]=IM,LB=[],pb=(z,y,c)=>`<rect x="${X(z)-.22*sc}" y="${Y(y+.1)}" width="${.44*sc}" height="${.2*sc}" rx="2" style="fill:var(--pj-hi);stroke:${c}" stroke-width="1.4"/>`;
    // sidevæg som baggrund i snittet (venstre eller højre – hvad der er valgt)
    const q=l.on&&l.ok?l:rr.on&&rr.ok?rr:null;
    if(q){const c=IMC[q.key];s+=`<rect x="${X(0)}" y="${Y(S.rh)}" width="${S.rd*sc}" height="${S.rh*sc}" fill="url(#imms)" opacity=".3"/>`;
      for(const t of immPos(q))s+=`<rect x="${X(t.u0)}" y="${Y(t.v1)}" width="${(t.u1-t.u0)*sc}" height="${(t.v1-t.v0)*sc}" style="fill:${c};stroke:${c}" fill-opacity=".08" stroke-dasharray="6 3"/>`;
      for(const qq of [l,rr])if(qq.on&&qq.ok){const c2=IMC[qq.key];for(const t of immPos(qq))s+=`<circle cx="${X(t.pj[2])}" cy="${Y(t.pj[1])}" r="${.45*sc}" style="fill:${c2}" opacity=".14"/>`+pb(t.pj[2],t.pj[1],c2);
        LB.push([c2,`${qq.name.toLowerCase()}: ${qq.n} projektorer i loftet, ${f3(qq.L)} m fra væggen (skyder vinkelret på snittet)`])}}
    // front-væg: projektorerne skyder mod lærredsvæggen
    if(v.on&&v.ok){const c=IMC.v;const seen=new Set();for(const t of immPos(v)){if(seen.has(t.j))continue;seen.add(t.j);const [x,y,z]=t.pj;
        s+=`<polygon points="${X(z)},${Y(y)} ${X(0)},${Y(t.v1)} ${X(0)},${Y(t.v0)}" style="fill:${c}" opacity=".12"/><line x1="${X(z)}" y1="${Y(y)}" x2="${X(0)}" y2="${Y(t.v1)}" style="stroke:${c}" stroke-width=".9" opacity=".7"/><line x1="${X(z)}" y1="${Y(y)}" x2="${X(0)}" y2="${Y(t.v0)}" style="stroke:${c}" stroke-width=".9" opacity=".7"/>`+pb(z,y,c)+`<rect x="${X(0)}" y="${Y(t.v1)}" width="4" height="${(t.v1-t.v0)*sc}" style="fill:${c}" opacity=".85"/>`}
      LB.push([c,`front-væg: ${v.n} projektorer, ${f3(v.L)} m fra væggen`])}
    // gulv: projektorerne i loftet skyder ned
    if(f.on&&f.ok){const c=IMC.f;const seen=new Set();for(const t of immPos(f)){const key=t.u0.toFixed(2);if(seen.has(key))continue;seen.add(key);const [x,y,z]=t.pj;
        s+=`<polygon points="${X(z)},${Y(y)} ${X(t.u1)},${Y(0)} ${X(t.u0)},${Y(0)}" style="fill:${c}" opacity=".15"/>`+pb(z,y,c)+`<rect x="${X(t.u0)}" y="${Y(0)-3}" width="${(t.u1-t.u0)*sc}" height="3" style="fill:${c}" opacity=".8"/>`}
      LB.push([c,`gulv: ${f.n} projektorer, ${f3(f.L)} m over gulvet`])}
    LB.forEach(([c,t],i)=>{const y=Y(0)+T*sc+20+i*16;s+=`<rect x="${X(0)}" y="${y-9}" width="10" height="10" rx="2" style="fill:${c}"/><text class="m" x="${X(0)+16}" y="${y}" style="font-size:11px;fill:var(--ink)">${t}</text>`})}
  else if(VN==='golf'){}
  else for(let z=0.6;z<S.rd-0.6;z+=1.25){if(z>0.8&&z<1.95)continue;s+=`<rect x="${X(z)}" y="${Y(S.rh-0.55)}" width="${1.05*sc}" height="${(S.rh-1)*sc}" style="fill:var(--r-panel)"/>`}
  if(VN!=='golf')s+=`<rect x="${X(0.9)}" y="${Y(2.1)}" width="${sc}" height="${2.1*sc}" style="fill:var(--r-door)"/><rect x="${X(1.15)}" y="${Y(2.42)}" width="${.5*sc}" height="${.2*sc}" style="fill:var(--r-exit)"/>`;
  s+=`<rect x="${X(0)}" y="${Y(.12)}" width="${S.rd*sc}" height="${.12*sc}" style="fill:var(--r-base)"/>`;
  if(VN!=='immersive'&&VN!=='golf')for(let z=1.6;z<S.rd-1.2;z+=3)s+=`<ellipse cx="${X(z)}" cy="${Y(S.rh)+3}" rx="${.6*sc}" ry="${.35*sc}" fill="url(#glows)"/><rect x="${X(z-.2)}" y="${Y(S.rh)}" width="${.4*sc}" height="4" style="fill:var(--r-light)"/>`;
  // snitflader
  s+=`<rect x="${X(-T)}" y="${Y(S.rh+T)}" width="${(S.rd+2*T)*sc}" height="${T*sc}" fill="url(#hatchs)"/><rect x="${X(-T)}" y="${Y(0)}" width="${(S.rd+2*T)*sc}" height="${T*sc}" fill="url(#hatchs)"/>`;
  s+=`<rect x="${X(-T)}" y="${Y(S.rh)}" width="${T*sc}" height="${S.rh*sc}" fill="url(#hatchs)"/><rect x="${X(S.rd)}" y="${Y(S.rh)}" width="${T*sc}" height="${S.rh*sc}" fill="url(#hatchs)"/>`;
  // ovenlys i snit: åbning i loftet + solstrøg mod gulvet (forskydning langs rummets dybde)
  if(S.sun.on&&SUNOK()&&S.sun.win==='custom'){const OFF=new Set(S.sun.off||[]);const sl=sunLux(),el=sl.el||0,I=(sl.per||{}).sky||0,col=sunColor(el),sky=skyColor(el);
    const d=el>0?Math.min(S.rd,S.rh/Math.tan(Math.max(4,el)*RAD)):0,dz=-d*Math.cos(((sl.az||0)-S.sun.face)*RAD),cz=v=>Math.max(0,Math.min(S.rd,v));
    const SK=SKY();[...new Set(SK.map(q=>q[2]))].forEach(z0=>{const z1=z0+1.2,act=SK.some((q,i)=>q[2]===z0&&!OFF.has('S'+i));
      s+=act?`<rect x="${X(z0)}" y="${Y(S.rh+T)}" width="${1.2*sc}" height="${T*sc}" style="fill:${sky};stroke:var(--r-truss)" stroke-width="1"/>`:`<rect x="${X(z0)}" y="${Y(S.rh+T)}" width="${1.2*sc}" height="${T*sc}" style="fill:none;stroke:var(--muted)" stroke-width="1" stroke-dasharray="3 2"/>`;
      if(act&&I>0.01){s+=`<polygon points="${X(z0)},${Y(S.rh)} ${X(z1)},${Y(S.rh)} ${X(cz(z1+dz))},${Y(0)} ${X(cz(z0+dz))},${Y(0)}" style="fill:${col}" opacity="${(0.1+0.3*I).toFixed(2)}" pointer-events="none"/>`;
        s+=`<rect x="${X(Math.min(cz(z0+dz),cz(z1+dz)))}" y="${Y(.04)}" width="${Math.abs(cz(z1+dz)-cz(z0+dz))*sc}" height="${.04*sc+2}" style="fill:${col}" opacity="${(0.4+0.5*I).toFixed(2)}" pointer-events="none"/>`}})}
  const rear=REAR(),XP=z=>X(RZ()+ZS()*z),MIR=rear?`<g transform="translate(${(2*pl+RZ()*sc).toFixed(1)},0) scale(-1,1)">`:'<g>';
  const NS=S.venue==='immersive',m1=s.length;
  // stråler
  s+=MIR;const rowsP=[...new Set(r.pjs.map(p=>p.r+','+p.s))].map(k=>r.pjs.find(p=>p.r+','+p.s===k));
  rowsP.forEach(p=>{const t=p.ty+r.H/2,b=p.ty-r.H/2;const e1=beamExit(r,p.ly,S.L,t),e2=beamExit(r,p.ly,S.L,b);
    const gid='bg'+p.r;s+=`<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${X((e1[0]+e2[0])/2)}" y1="${Y((e1[1]+e2[1])/2)}" x2="${X(0)}" y2="${Y(p.ty)}"><stop offset="0" style="stop-color:var(--beam);stop-opacity:.6"/><stop offset="1" style="stop-color:var(--beam);stop-opacity:.08"/></linearGradient>`;
    s+=`<polygon points="${X(e1[0])},${Y(e1[1])} ${X(0)},${Y(t)} ${X(0)},${Y(b)} ${X(e2[0])},${Y(e2[1])}" fill="url(#${gid})"/>`;
    s+=`<line x1="${X(e1[0])}" y1="${Y(e1[1])}" x2="${X(0)}" y2="${Y(t)}" style="stroke:var(--beam)" stroke-width=".9" opacity=".75"/><line x1="${X(e2[0])}" y1="${Y(e2[1])}" x2="${X(0)}" y2="${Y(b)}" style="stroke:var(--beam)" stroke-width=".9" opacity=".75"/>`});
  s+='</g>';
  // lærred
  {const xs=X(RZ());if(rear)s+=`<line x1="${xs}" y1="${Y(r.cy+r.CH/2)}" x2="${xs}" y2="${Y(S.rh)}" style="stroke:var(--r-truss)" stroke-width="1.2"/>`;
  s+=`<g class="scrgrab"><rect x="${xs-6}" y="${Y(r.cy+r.CH/2)-6}" width="${.07*sc+20}" height="${r.CH*sc+12}" fill="transparent"/><rect x="${xs}" y="${Y(r.cy+r.CH/2)-3}" width="${.07*sc+2}" height="${r.CH*sc+6}" fill="#05080b"/><rect x="${xs}" y="${Y(r.cy+r.CH/2)}" width="${.04*sc+1}" height="${r.CH*sc}" style="fill:${(r.zoomOK&&r.shOK&&r.sizeOK)?'var(--ok)':'var(--bad)'}"/></g>`}
  if(NS)s=s.slice(0,m1);
  // scene (teater) og taler
  const PRS2=g=>NOCROWD()?'':`<g class="presgrab"><title>Træk for at flytte taleren</title>${r.presHit?g.replace('fill:var(--r-person)','fill:var(--bad)'):g}</g>`;
  if(VN==='theater'){const zS=STAGE();s+=`<rect x="${X(0)}" y="${Y(STH())}" width="${zS*sc}" height="${STH()*sc}" style="fill:#6B4A2E"/><rect x="${X(RZ())}" y="${Y(S.rh)}" width="${.25*sc}" height="${.9*sc}" fill="#A3202F"/>`;
    {const zS2=STAGE(),h2=STH();s+=`<g class="stgrab" data-st="d"><rect x="${X(zS2)-7}" y="${Y(h2)}" width="14" height="${h2*sc}" fill="transparent"/><rect x="${X(zS2)-2}" y="${Y(h2)+2}" width="4" height="${Math.max(4,h2*sc-4)}" rx="2" fill="#9C7A3C"/></g>`+
      `<g class="stgrab" data-st="h"><rect x="${X(0)}" y="${Y(h2)-7}" width="${zS2*sc}" height="14" fill="transparent"/><rect x="${X(zS2/2)-14}" y="${Y(h2)-2}" width="28" height="4" rx="2" fill="#9C7A3C"/></g>`}
    s+=`<g transform="translate(0,${-STH()*sc})">${PRS2(standSide(X,Y,sc,r.presZ))}</g>`}
  else if(VN!=='immersive'&&VN!=='golf')s+=PRS2(standSide(X,Y,sc,r.presZ));
  if(VN==='golf'&&GCUR)s+=golfSide(X,Y,sc,r,GCUR);
  if(r.presHit&&VN!=='immersive'){const zp=r.presZ,yb=(VN==='theater'?STH():0)+1.76;s+=lbl(X(zp),Y(yb+0.35),'skygger','m').replace('class="m"','class="m" style="fill:var(--bad);font-weight:700"')}
  if(!NS){const lo=Math.min(r.Lw,r.Lt),hi=Math.max(r.Lw,r.Lt);const a0=XP(Math.max(0,lo)),b0=XP(Math.min(DEPTH(),hi)),a=Math.min(a0,b0),b=Math.max(a0,b0);
   if(b>a+1)s+=`<rect x="${a}" y="${Y(0)-5}" width="${b-a}" height="5" style="fill:var(--ok)" opacity=".55"/>`;else s+=`<rect x="${XP(lo)-2}" y="${Y(0)-8}" width="4" height="8" style="fill:var(--ok)"/>`;
   s+=`<text class="m" x="${a}" y="${Y(0)+13}" text-anchor="middle" style="font-size:10px;font-weight:700;fill:var(--ok);paint-order:stroke;stroke:var(--surface);stroke-width:3px">${r.fixed?'fast':'min'}</text>`+(b>a+20?`<text class="m" x="${b}" y="${Y(0)+13}" text-anchor="middle" style="font-size:10px;font-weight:700;fill:var(--ok);paint-order:stroke;stroke:var(--surface);stroke-width:3px">max</text>`:'')}
  // stolerækker med publikum
  if(r.stand)r.rows.forEach(z=>{const hit=r.hit.includes(z);s+=standSide(X,Y,sc,z+.3).replace('fill:var(--r-person)',hit?'fill:var(--bad)':'fill:var(--r-person)')});
  else r.rows.forEach(z=>{const hit=r.hit.includes(z);s+=chairSide(X,Y,sc,z)+sitter(X,Y,sc,z,hit)});
  // projektor(er) – kan trækkes
  const m2=s.length;s+=MIR+'<g class="sgrab">';
  rowsP.forEach(p=>{const ly=p.ly,B=r.B;
    // keystone: projektoren tegnes vippet om linsen (op = r.kv·inv)
    const kRot=r.kv?(r.kv*r.inv*Math.sign(X(S.L+1)-X(S.L))):0;if(kRot)s+=`<g transform="rotate(${kRot.toFixed(2)} ${X(S.L)} ${Y(ly)})">`;
    if(S.frame){const fd=r.outer[2],fh=r.outer[1];const x0=X(r.outFront),y0=Y(ly+r.F.y1);
      s+=`<rect x="${x0}" y="${y0}" width="${fd*sc}" height="${fh*sc}" rx="2" fill="none" style="stroke:var(--frame)" stroke-width="2.6"/>`;
      s+=`<line x1="${x0}" y1="${y0}" x2="${x0+fd*sc}" y2="${y0+fh*sc}" style="stroke:var(--frame)" stroke-width="1" opacity=".55"/><line x1="${x0+fd*sc}" y1="${y0}" x2="${x0}" y2="${y0+fh*sc}" style="stroke:var(--frame)" stroke-width="1" opacity=".55"/>`}
    s+=`<rect x="${X(S.L+B.z0)}" y="${Y(ly+B.y1)}" width="${(B.z1-B.z0)*sc}" height="${(B.y1-B.y0)*sc}" rx="3" fill="url(#pjgs)"/>`;
    if(r.kind==='n'){const lh=Math.min((B.y1-B.y0)*.6,.2);s+=`<rect x="${X(S.L)}" y="${Y(ly+lh/2)}" width="${Math.max(2,r.prot*sc)}" height="${lh*sc}" rx="1.5" style="fill:var(--pj-hi)"/>`}
    else if(r.kind==='l'){const yb=S.ceil?ly+B.y0:ly+B.y1,lw=.16;s+=`<rect x="${X(S.L)}" y="${Y(ly+lw/2)}" width="${.22*sc}" height="${lw*sc}" rx="2" style="fill:var(--pj-hi)"/><rect x="${X(S.L+.06)}" y="${Y(Math.max(ly,yb))}" width="${.11*sc}" height="${Math.abs(yb-ly)*sc}" style="fill:var(--pj-hi)"/>`}
    if(kRot)s+='</g>';
    {const e=beamExit(r,ly,S.L,p.ty);s+=`<circle cx="${X(e[0])}" cy="${Y(e[1])}" r="3.5" style="fill:var(--beam)"/>`}});
  {const p0=r.pjs[0];const z0=Math.min(r.outFront,S.L)-.1,z1=Math.max(r.outBack,S.L)+.1,y0=p0.ly+r.F.y0-.1,y1=p0.ly+r.F.y1+.1;s+=`<rect x="${X(z0)}" y="${Y(y1)}" width="${(z1-z0)*sc}" height="${(y1-y0)*sc}" fill="transparent"/>`;}
  s+='</g>';
  // ophæng / bord
  const top=r.topY,bot=r.botY,zc=(r.outFront+r.outBack)/2;
  if(S.ceil){const ty=S.rh-0.05;s+=`<rect x="${X(zc-.15)}" y="${Y(ty)}" width="${.3*sc}" height="${.3*sc}" fill="none" style="stroke:var(--r-truss)" stroke-width="2"/><line x1="${X(zc-.15)}" y1="${Y(ty)}" x2="${X(zc+.15)}" y2="${Y(ty-.3)}" style="stroke:var(--r-truss)"/><line x1="${X(zc+.15)}" y1="${Y(ty)}" x2="${X(zc-.15)}" y2="${Y(ty-.3)}" style="stroke:var(--r-truss)"/>`;
    if(top<ty-.3)s+=`<line x1="${X(zc)}" y1="${Y(ty-.3)}" x2="${X(zc)}" y2="${Y(top)}" style="stroke:var(--r-truss)" stroke-width="3"/>`}
  else if(bot>0.25){const z0=r.outFront-0.05,z1=r.outBack+0.05;s+=`<rect x="${X(z0)}" y="${Y(bot)}" width="${(z1-z0)*sc}" height="5" style="fill:var(--r-truss)"/><line x1="${X(z0+.05)}" y1="${Y(bot)}" x2="${X(z0+.05)}" y2="${Y(0)}" style="stroke:var(--r-truss)" stroke-width="3"/><line x1="${X(z1-.05)}" y1="${Y(bot)}" x2="${X(z1-.05)}" y2="${Y(0)}" style="stroke:var(--r-truss)" stroke-width="3"/>`}
  s+='</g>';if(NS)s=s.slice(0,m2);
  // mål
  const p0=r.pjs[0],dd=rear?-1:1,m3=s.length;
  s+=dimH(XP(0),XP(S.L),Y(0)+30,`L ${f3(S.L)} m`,null,Y(p0.ly)+6);
  s+=dimH(XP(0),XP(r.outBack),Y(0)+58,`bagkant ${f3(r.outBack)} m`,Y(0)+T*sc,Y(r.botY));
  if(rear){const xs=X(RZ())+.07*sc+4;s+=dimV(xs+20,Y(0),Y(S.sb),`${f3(S.sb)} m`,xs,null);s+=dimV(xs+50,Y(S.sb),Y(S.sb+r.CH),`${f3(r.CH)} m`,xs,xs);
    s+=dimH(X(0),X(RZ()),Y(S.rh)+18,`bagscene ${f3(RZ())} m`,null,null)}
  else{s+=dimV(X(-T)-20,Y(0),Y(S.sb),`${f3(S.sb)} m`,X(-T),null);
  s+=dimV(X(-T)-50,Y(S.sb),Y(S.sb+r.CH),`${f3(r.CH)} m`,X(-T),X(-T));}
  const dx=XP(Math.max(r.outBack,S.L))+dd*22;
  const fy=r.kind!=='u'?r.botY:p0.ly;// gulv → bund af projektor (kæden gulv/hus/loft)
  s+=dimV(dx,Y(0),Y(fy),`${f3(fy)} m`,null,XP(r.outBack));
  if(r.kind!=='u')s+=dimV(dx+dd*30,Y(r.botY),Y(r.topY),`${mm(r.topY-r.botY)} mm`,XP(r.outBack),XP(r.outBack),dx+dd*66);
  if(S.ceil&&r.topY<S.rh)s+=dimV(dx+dd*60,Y(r.topY),Y(S.rh),`${f3(S.rh-r.topY)} m`,XP(r.outBack),null);
  if(NS)s=s.slice(0,m3);
  if(r.rows.length&&VN==='theater')s+=lbl(X(r.rows[0]+0.2),Y(0)+14,r.stand?`publikum fra ${f3(r.rows[0],1)} m`:`1. række ${f3(r.rows[0],1)} m`,'m');
  s+=`<text class="m" x="${X(S.rd)}" y="${Y(S.rh+T)-8}" text-anchor="end">snit ${f3(S.rd,1)} × ${f3(S.rh,1)} m</text>`;
  $('side').innerHTML=s;
}
function chairSide(X,Y,sc,z){const u=sc;return `<path d="M${X(z)},${Y(.45)} h${.48*u} l${.06*u},-${.53*u} h${.05*u} l-${.05*u},${.6*u} v${.38*u} h-${.04*u} v-${.36*u} h-${.4*u} v${.36*u} h-${.04*u} z" style="fill:var(--r-seat)"/>`}
function sitter(X,Y,sc,z,hit){const u=sc,hx=X(z+.35),hy=Y(1.2);return `<g style="fill:${hit?'var(--bad)':'var(--r-person)'}"><circle cx="${hx}" cy="${hy}" r="${.11*u}"/><path d="M${X(z+.22)},${Y(1.05)} q${.12*u},-${.04*u} ${.24*u},0 l${.04*u},${.55*u} h-${.38*u} l-${.06*u},${.38*u} h-${.08*u} l${.04*u},-${.45*u} h${.12*u} z"/></g>`}
function standSide(X,Y,sc,z){const u=sc,x=X(z);return `<g style="fill:var(--r-person)"><circle cx="${x}" cy="${Y(1.65)}" r="${.11*u}"/><path d="M${x-.1*u},${Y(1.5)} h${.2*u} l${.03*u},${.62*u} h-${.07*u} l-${.01*u},${.86*u} h-${.12*u} v-${.86*u} h-${.06*u} z"/></g>`}


const blend0=r=>S.blend&&(r.N>1||r.R>1);
