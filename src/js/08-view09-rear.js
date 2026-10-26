/* ===== LOKALE SET BAGFRA (1-punkts perspektiv) ===== */
let IMMPJ=null,FRONTI=null,IMDRAG=null,HOVDIM=null,IMMSG=null;
function drawFront(r){IMMPJ=null;if(S.venue==='golf')GCUR=golfCalc(r);
  // kameraet står bag bagvæggen, så hele lokalet (inkl. projektor og bagerste række) er i billedet
  const vw=1000,vh=560,E=Math.max(2.2,Math.min(3.4,S.rh*0.62)),RR=1.9;  // øjenhøjde: let oppefra, så stolerækkerne kan skelnes
  const kB=Math.min((vw-24)/S.rw,(vh-44)/S.rh);         // målestok ved bagvæggen (snitkant)
  let s0=kB/RR;const C=RR*S.rd/(RR-1);                      // målestok på lærredsvæggen og kameraafstand
  const f=s0*C,X0=vw/2,Yh=(vh-14)/2+(S.rh/2-E)*kB;
  const P=(x,y,z)=>{const d=Math.max(0.12,C-z);const k=f/d;return [X0+x*k,Yh-(y-E)*k]};
  const sc=z=>f/Math.max(0.12,C-z);
  const w=S.rw/2,h=S.rh,zN=S.rd;
  let X=x=>X0+x*s0, Y=y=>Yh-(y-E)*s0;
  const rear=REAR(),PJ=(x,y,z)=>P(x,y,RZ()+ZS()*z);   // projektor-koordinater: z = afstand fra lærredet (spejlet ved bagprojektion)
  let s=DEFS('f');
  // flader
  s+=`<rect x="0" y="0" width="${vw}" height="${vh}" style="fill:var(--r-out)"/>`;
  s+=`<polygon points="${pts([P(-w,h,0),P(w,h,0),P(w,h,zN),P(-w,h,zN)])}" style="fill:var(--r-ceil2)"/>`;
  // loftsplader 0,6 m (nedhængt loft)
  const VN=S.venue;
  if(VN==='aud'||VN==='museum'){for(let x=-w+0.6;x<w-0.01;x+=0.6){const a=P(x,h,0),b=P(x,h,zN);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--r-tile)" stroke-width="1"/>`}
  for(let z=0.6;z<zN-0.01;z+=0.6){const a=P(-w,h,z),b=P(w,h,z);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--r-tile)" stroke-width="1"/>`}}
  s+=`<polygon points="${pts([P(-w,0,0),P(w,0,0),P(w,0,zN),P(-w,0,zN)])}" fill="url(#flrf)"/>`;
  for(let x=-w+(VN==='museum'?.25:1);x<w;x+=(VN==='museum'?.25:1))s+=`<line x1="${P(x,0,0)[0]}" y1="${P(x,0,0)[1]}" x2="${P(x,0,zN)[0]}" y2="${P(x,0,zN)[1]}" style="stroke:var(--r-floor2)" stroke-width="1" opacity=".6"/>`;
  [[-w,1],[w,-1]].forEach(([xw])=>{s+=`<polygon points="${pts([P(xw,0,0),P(xw,h,0),P(xw,h,zN),P(xw,0,zN)])}" style="fill:var(--r-side)"/>`;
    if(VN==='museum'){const ART=['#C8553D','#2E6F95','#E0B04A','#5C8A5A','#7A4E8C','#D98C6A'];let i=xw<0?0:3;
      for(let z=1.2;z<zN-1.4;z+=2.8){if(xw>0&&z<2.3)continue;const a=1.0+0.4*((i%3)/2),y0=1.35,y1=Math.min(h-0.4,y0+a);
        s+=`<polygon points="${pts([P(xw,y0-.06,z-.06),P(xw,y1+.06,z-.06),P(xw,y1+.06,z+a*1.25+.06),P(xw,y0-.06,z+a*1.25+.06)])}" style="fill:#2B2622"/>`;
        s+=`<polygon points="${pts([P(xw,y0,z),P(xw,y1,z),P(xw,y1,z+a*1.25),P(xw,y0,z+a*1.25)])}" style="fill:${ART[i%ART.length]}"/>`;
        s+=`<polygon points="${pts([P(xw,y0,z+a*.3),P(xw,y0+(y1-y0)*.7,z+a*.65),P(xw,y0,z+a*1.1)])}" style="fill:#F4EFE6" opacity=".45"/>`;i++}}
    else if(VN==='immersive'){if(S.imm&&S.imm[xw<0?'l':'r']&&!IMMC())s+=`<polygon points="${pts([P(xw,0,0),P(xw,h,0),P(xw,h,zN),P(xw,0,zN)])}" fill="url(#immf)" opacity=".5"/>`}
    else if(VN==='golf'){}
    else for(let z=0.6;z<zN-0.6;z+=1.25){if(xw>0&&z<2.3)continue;s+=`<polygon points="${pts([P(xw,0.45,z),P(xw,h-0.55,z),P(xw,h-0.55,z+1.05),P(xw,0.45,z+1.05)])}" style="fill:var(--r-panel)"/>`}
    s+=`<polygon points="${pts([P(xw,0,0),P(xw,.12,0),P(xw,.12,zN),P(xw,0,zN)])}" style="fill:var(--r-base)"/>`});
  // vinduer og sollys – styrke og farve følger solens position
  // vinduer og sollys – styrke og farve følger solens position. «custom»: alle vinduer vises og kan slås til/fra med klik
  const CUST=S.sun.win==='custom',OFF=new Set(S.sun.off||[]),HIT=[];
  const ghost=(id,poly,t)=>{s+=`<polygon points="${pts(poly)}" style="fill:var(--surface);stroke:var(--muted)" fill-opacity=".35" stroke-width="1.2" stroke-dasharray="4 3"/>`;HIT.push([id,poly,t])};
  const SUN=S.sun.on&&SUNOK();
  if(SUN){const sl=sunLux(),el=sl.el||0,col=sunColor(el),sky=skyColor(el),per=sl.per||{};const use=CUST?['left','right']:({left:['left'],right:['right'],sides:['left','right']}[S.sun.win]||[]);
    const day=Math.max(0,Math.min(1,el/25));
    s+=`<polygon points="${pts([P(-w,h,zN),P(w,h,zN),P(w,0,zN),P(-w,0,zN)])}" style="fill:${col}" opacity="${(0.04+0.16*day+0.25*Math.min(1,sl.lux/2500)).toFixed(3)}" pointer-events="none"/>`;
    use.forEach(k=>{const xw=k==='left'?-w:w,I=per[k]||0;SIDEW().forEach((z,i)=>{const id=(k==='left'?'L':'R')+i;
      const wy0=VN==='museum'?Math.min(h-1.0,Math.max(1.0+(h-1.6)/2,2.95)):1.0,win=[P(xw,wy0,z),P(xw,h-0.6,z),P(xw,h-0.6,z+1.4),P(xw,wy0,z+1.4)],t=`Vindue ${k==='left'?'venstre':'højre'} væg ${i+1}`;
      if(CUST&&OFF.has(id)){ghost(id,win,t);return}
      s+=`<polygon points="${pts(win)}" style="fill:${sky};stroke:var(--r-cornice)" stroke-width="1.5"/>`;if(CUST)HIT.push([id,win,t]);
      if(I>0.01){s+=`<polygon points="${pts(win)}" style="fill:${col}" opacity="${(0.25+0.7*I).toFixed(2)}"/>`;
        const sh=xw<0?1:-1,d=Math.min(S.rw*0.8,(h-0.6)/Math.tan(Math.max(4,el)*RAD)),d1=Math.min(S.rw*0.8,wy0/Math.tan(Math.max(4,el)*RAD));
        const f0=[P(xw+sh*d1,0.02,z),P(xw+sh*d1,0.02,z+1.4),P(xw+sh*d,0.02,z+1.4),P(xw+sh*d,0.02,z)];
        s+=`<polygon points="${pts(hull(win.concat(f0)))}" style="fill:${col}" opacity="${(0.06+0.22*I).toFixed(3)}" pointer-events="none"/>`;
        s+=`<polygon points="${pts(f0)}" style="fill:${col}" opacity="${(0.2+0.6*I).toFixed(2)}" pointer-events="none"/>`}})});
    if(S.sun.win==='back'){const I=per.back||0;if(I>0.01){const reach=Math.min(zN,h/Math.tan(Math.max(4,el)*RAD));const z0=Math.max(0,zN-reach);
      s+=`<polygon points="${pts([P(-w,h,zN),P(w,h,zN),P(w*.8,0,z0),P(-w*.8,0,z0)])}" style="fill:${col}" opacity="${(0.08+0.3*I).toFixed(3)}" pointer-events="none"/>`;
      s+=`<polygon points="${pts([P(-w*.8,0.02,zN),P(w*.8,0.02,zN),P(w*.8,0.02,z0),P(-w*.8,0.02,z0)])}" style="fill:${col}" opacity="${(0.15+0.45*I).toFixed(2)}" pointer-events="none"/>`}}
    // ovenlys i loftet (kun custom): lysskakt og lysfelt på gulvet, forskudt efter solens retning
    if(CUST){const I=per.sky||0,dg=(sl.az||0)-S.sun.face,d=el>0?Math.min(Math.max(S.rw,zN),h/Math.tan(Math.max(4,el)*RAD)):0;
      const dz=-d*Math.cos(dg*RAD),dx=d*Math.cos((dg-90)*RAD);
      SKY().forEach(([x0,x1,z0,z1],i)=>{const id='S'+i,top=[P(x0,h,z0),P(x1,h,z0),P(x1,h,z1),P(x0,h,z1)],e=.12,inn=[P(x0+e,h,z0+e),P(x1-e,h,z0+e),P(x1-e,h,z1-e),P(x0+e,h,z1-e)],t=`Ovenlys ${i+1}`;
        if(OFF.has(id)){ghost(id,top,t);return}
        s+=`<polygon points="${pts(top)}" style="fill:var(--r-base);stroke:var(--r-truss)" stroke-width="1.2"/><polygon points="${pts(inn)}" style="fill:${sky}"/>`;HIT.push([id,top,t]);
        if(I>0.01){s+=`<polygon points="${pts(inn)}" style="fill:${col}" opacity="${(0.15+0.35*I).toFixed(2)}"/>`;
          const cx=v=>Math.max(-w,Math.min(w,v)),cz=v=>Math.max(0,Math.min(zN,v));
          const fl=[P(cx(x0+dx),0.02,cz(z0+dz)),P(cx(x1+dx),0.02,cz(z0+dz)),P(cx(x1+dx),0.02,cz(z1+dz)),P(cx(x0+dx),0.02,cz(z1+dz))];
          s+=`<polygon points="${pts(hull(top.concat(fl)))}" style="fill:${col}" opacity="${(0.05+0.18*I).toFixed(3)}" pointer-events="none"/>`;
          s+=`<polygon points="${pts(fl)}" style="fill:${col}" opacity="${(0.2+0.6*I).toFixed(2)}" pointer-events="none"/>`}})}}
  // dør + exit på højre væg
  if(VN!=='golf')s+=`<polygon points="${pts([P(w,0,0.9),P(w,2.1,0.9),P(w,2.1,1.9),P(w,0,1.9)])}" style="fill:var(--r-door);stroke:var(--r-base)" stroke-width="1"/>`;
  if(VN!=='golf')s+=`<polygon points="${pts([P(w,2.22,1.15),P(w,2.42,1.15),P(w,2.42,1.65),P(w,2.22,1.65)])}" style="fill:var(--r-exit)"/>`;
  // loftslamper
  if(VN==='museum'){for(const x of [-w/2,w/2]){const zt=Math.min(zN-0.4,Math.max(3,zN*0.55)),a=P(x,h-.02,0.4),b=P(x,h-.02,zt);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:#2B2622" stroke-width="2"/>`;
      for(let z=1;z<=zt;z+=1.6){const c=P(x,h-.1,z),k=sc(z);s+=`<ellipse cx="${c[0]}" cy="${c[1]+.3*k}" rx="${.5*k}" ry="${.3*k}" fill="url(#glowf)"/><circle cx="${c[0]}" cy="${c[1]}" r="${Math.max(1.2,.045*k)}" style="fill:#2B2622"/>`}}}
  else if(VN!=='immersive'&&VN!=='golf'){const xs=[];for(let x=-w+1.8;x<=w-1.2;x+=2.4)xs.push(Math.round(x/0.6)*0.6);
   const sk=SUN&&CUST?SKY():[];
   for(let z=1.8;z<zN-0.6;z+=2.4)for(const x of xs){if(sk.some(([a,b,c,d])=>x<b+0.1&&x+0.6>a-0.1&&z<d+0.1&&z+0.6>c-0.1))continue;const q=[P(x,h,z),P(x+0.6,h,z),P(x+0.6,h,z+0.6),P(x,h,z+0.6)];const c=P(x+0.3,h,z+0.3),k=sc(z+0.3);
     s+=`<ellipse cx="${c[0]}" cy="${c[1]+.25*k}" rx="${.9*k}" ry="${.45*k}" fill="url(#glowf)"/><polygon points="${pts(q)}" style="fill:var(--r-light);stroke:var(--r-cornice)" stroke-width=".8" opacity=".95"/>`}}
  // gesims mellem loft og vægge
  s+=`<polyline points="${pts([P(-w,h,zN),P(-w,h,0),P(w,h,0),P(w,h,zN)])}" fill="none" style="stroke:var(--r-cornice)" stroke-width="2.5"/>`;
  // forvæg
  s+=`<rect x="${X(-w)}" y="${Y(h)}" width="${S.rw*s0}" height="${S.rh*s0}" style="fill:var(--r-wall)"/>`;
  s+=`<rect x="${X(-w)}" y="${Y(.12)}" width="${S.rw*s0}" height="${.12*s0}" style="fill:var(--r-base)"/>`;
  // bagprojektion: lærredet hænger på scenen (RZ m fra bagvæggen); projektoren står bag det
  if(rear){const zS=STAGE();s+=`<polygon points="${pts([P(-w,STH(),0),P(w,STH(),0),P(w,STH(),zS),P(-w,STH(),zS)])}" style="fill:#6B4A2E"/>`;
    s+=beams()+'<g class="Lpj">'+r.pjs.map(p=>projector3D(PJ,r,p)).join('')+'</g>'+truss();
    const k=sc(RZ());s0=k;X=x=>X0+x*k;Y=y=>Yh-(y-E)*k;
    for(const sg of [-1,1])s+=`<line x1="${X(r.cx+sg*r.CW/2)}" y1="${Y(r.cy+r.CH/2)}" x2="${X(r.cx+sg*r.CW/2)}" y2="${Y(h)}" style="stroke:var(--r-truss)" stroke-width="1.2"/>`}
  // lærred (ikke i immersive – der er hele væggene projektionsflader)
  const NS=S.venue==='immersive',mS=s.length;
  const cl=X(r.cx-r.CW/2),ctp=Y(r.cy+r.CH/2),cwp=r.CW*s0,chp=r.CH*s0,bm=Math.max(3,.06*s0);
  FRONT={Yh,s0,E,X0};if(rear)s+='<g opacity=".84">';s+=`<rect class="fscr" x="${cl-bm}" y="${ctp-bm}" width="${cwp+2*bm}" height="${chp+2*bm}" rx="1.5" fill="#05080b"/>`;
  s+=`<clipPath id="cclip"><rect x="${cl}" y="${ctp}" width="${cwp}" height="${chp}"/></clipPath>`;
  if(S.content==='img'&&IMG) s+=`<image href="${IMG}" x="${cl}" y="${ctp}" width="${cwp}" height="${chp}" preserveAspectRatio="xMidYMid slice" clip-path="url(#cclip)"/>`;
  else if(S.content==='test') s+=`<g clip-path="url(#cclip)">${testPattern(cl,ctp,cwp,chp)}</g>`;
  else if(S.content==='golf'&&VN==='golf') s+=`<g clip-path="url(#cclip)">${golfScene(cl,ctp,cwp,chp,'f')}</g>`;
  else s+=`<rect class="fscr" x="${cl}" y="${ctp}" width="${cwp}" height="${chp}" fill="url(#scrf)"/>`;
  if(rear)s+='</g>';
  if(S.blend&&(r.N>1||r.R>1)){
    s+='<g class="Lbeam">';r.pjs.forEach(p=>{s+=`<rect x="${X(p.tx-r.W/2)}" y="${Y(p.ty+r.H/2)}" width="${r.W*s0}" height="${r.H*s0}" fill="none" style="stroke:var(--beam)" stroke-width="1.2" stroke-dasharray="6 4"/>`});
    for(let c=1;c<r.N;c++){const x0=r.cx-r.CW/2+c*r.W*(1-r.o);s+=`<rect x="${X(x0)}" y="${ctp}" width="${r.W*r.o*s0}" height="${chp}" fill="url(#bzf)" opacity=".8"/>`}
    for(let k=1;k<r.R;k++){const y0=r.cy+r.CH/2-k*r.H*(1-r.o);s+=`<rect x="${cl}" y="${Y(y0)}" width="${cwp}" height="${r.H*r.o*s0}" fill="url(#bzf)" opacity=".8"/>`}s+='</g>';
  }
  // spildlys: projektoren lyser altid hele sit panel (fx 16:10) – vælges et andet format (fx 4:3), lyser resten «sort» uden for billedet
  {const [pw,ph]=M().res,nA=r.PT?ph/pw:pw/ph,rA=r.W/r.H;let spill=Math.abs(nA-rA)/nA>.01&&!NS;
   if(spill){const NW=rA<nA?r.H*nA:r.W,NH=rA<nA?r.H:r.W/nA;s+='<g class="Lspill">';
     r.pjs.forEach(p=>{const ox=X(p.tx-NW/2),oy=Y(p.ty+NH/2),ix=X(p.tx-r.W/2),iy=Y(p.ty+r.H/2);
       s+=`<path d="M${ox},${oy}h${NW*s0}v${NH*s0}h${-NW*s0}Z M${ix},${iy}v${r.H*s0}h${r.W*s0}v${-r.H*s0}Z" fill-rule="evenodd" style="fill:var(--muted);stroke:var(--muted)" fill-opacity=".22" stroke-width="1" stroke-dasharray="3 3" pointer-events="none"/>`});
     s+='</g>'}
   const sb=document.querySelector('[data-l9="spill"]');if(sb)sb.hidden=!spill}
  // lens shift-område for hver projektor (ved edge blend har hver sin linse)
  if(r.P.length)r.pjs.forEach(p=>{const zx=p.lx,zy=p.ly+r.inv*r.off*r.H;
    s+=`<polygon class="Lshift" points="${r.P.map(([a,b])=>`${X(zx+r.inv*(a+r.th)*r.W)},${Y(zy+r.inv*(b+r.tv)*r.H)}`).join(' ')}" style="fill:none;stroke:var(--beam)" stroke-width="1.2" stroke-dasharray="5 4" opacity=".85"/>`});
  const ok=r.zoomOK&&r.shOK&&r.sizeOK;
  if(SUN){const sl=sunLux();if(sl.lux>0){const a=Math.min(.8,sl.lux/(sl.lux+r.lux)*0.9);s+=`<rect x="${cl}" y="${ctp}" width="${cwp}" height="${chp}" style="fill:${sunColor(sl.el)}" opacity="${a.toFixed(2)}" pointer-events="none"/>`}}
  s+=`<rect x="${cl}" y="${ctp}" width="${cwp}" height="${chp}" fill="none" style="stroke:${ok?'var(--ok)':'var(--bad)'}" stroke-width="2"/>`;
  if(VN==='golf'&&GCUR)s+=golfShadowFront(GCUR,X,Y);
  // museum: talerens skygge – silhuetten projiceret fra hver linse ind på lærredsvæggen (z = 0), klippet til billedet
  if(VN==='museum'&&!rear&&!NOCROWD()&&r.presZ<S.L-.05){const kk=S.L/(S.L-r.presZ);s+='<g pointer-events="none" clip-path="url(#cclip)">';
    r.pjs.forEach((p,i)=>{const PS=(x,y)=>[X(p.lx+(x-p.lx)*kk),Y(p.ly+(y-p.ly)*kk)];
      s+=`<clipPath id="pshc${i}"><rect x="${X(p.tx-r.W/2)}" y="${Y(p.ty+r.H/2)}" width="${r.W*s0}" height="${r.H*s0}"/></clipPath><g clip-path="url(#pshc${i})">`+
        person(PS,r.presX,r.presZ,'stand').replace('fill:var(--r-person)','fill:#000;fill-opacity:.62;stroke:var(--bad);stroke-width:1.2')+'</g>'});s+='</g>'}
  if(NS)s=s.slice(0,mS);
  // teater: tæppe/sidedraperier om lærredet og scene foran det
  if(VN==='theater'){const gap=0.35,vb=Math.min(h,Math.max(r.cy+r.CH/2+0.15,h-0.9));
    for(const sg of [-1,1]){const xa=X(sg*w),xb=X(Math.max(-w,Math.min(w,r.cx+sg*(r.CW/2+gap)))),x0=Math.min(xa,xb),wd=Math.abs(xa-xb);if(wd>2){s+=`<rect x="${x0}" y="${Y(h)}" width="${wd}" height="${h*s0}" fill="url(#drapef)"/>`;
      const n=Math.max(2,Math.round(wd/14));for(let i=1;i<n;i++)s+=`<line x1="${x0+wd*i/n}" y1="${Y(h)}" x2="${x0+wd*i/n}" y2="${Y(0)}" stroke="#4A0A14" stroke-width="1.2" opacity=".55"/>`}}
    s+=`<rect x="${X(-w)}" y="${Y(h)}" width="${S.rw*s0}" height="${(h-vb)*s0}" fill="url(#drapef)"/><rect x="${X(-w)}" y="${Y(vb)-3}" width="${S.rw*s0}" height="3" fill="#9C7A3C"/>`;
    const zS=STAGE(),fr=[P(-w,0,zS),P(w,0,zS),P(w,STH(),zS),P(-w,STH(),zS)],tp=[P(-w,STH(),rear?RZ():0),P(w,STH(),rear?RZ():0),P(w,STH(),zS),P(-w,STH(),zS)];
    s+=`<polygon points="${pts(tp)}" style="fill:#6B4A2E"/><polygon points="${pts(fr)}" style="fill:#2A1810"/><line x1="${fr[3][0]}" y1="${fr[3][1]}" x2="${fr[2][0]}" y2="${fr[2][1]}" stroke="#9C7A3C" stroke-width="2"/>`}
  if(VN==='immersive'){const IM=immCalc(r),src=IMMC();
    // eget billede / testbillede: ét samlet indhold over alle valgte flader, foldet ud som en kasse:
    // venstre væg | front-væg | højre væg side om side, gulvet under front-væggen. Billedet strækkes over de valgte flader.
    // strimler med ens højde på skærmen (tættere ved kameraet, hvor perspektivet ændrer sig mest)
    const ZT=[];{const k0=1/C,k1=1/(C-zN),n=40;for(let i=0;i<=n;i++)ZT.push(i===n?zN:Math.max(0,C-1/(k0+(k1-k0)*i/n)))}
    if(src){s+=`<defs><image id="immimg" href="${src}" x="0" y="0" width="1" height="1" preserveAspectRatio="none"/></defs>`;
      const NET={l:[0,0,zN,h],v:[zN,0,S.rw,h],r:[zN+S.rw,0,zN,h],f:[zN,h,S.rw,zN]},act=IM.filter(q=>q.on).map(q=>q.key);
      const x0=Math.min(...act.map(k=>NET[k][0])),x1=Math.max(...act.map(k=>NET[k][0]+NET[k][2])),y0=Math.min(...act.map(k=>NET[k][1])),y1=Math.max(...act.map(k=>NET[k][1]+NET[k][3]));
      const T=k=>{const [nx,ny,nw,nh]=NET[k],au=(nx-x0)/(x1-x0),su=nw/(x1-x0),av=(ny-y0)/(y1-y0),sv=nh/(y1-y0);return `matrix(${(1/su).toFixed(5)} 0 0 ${(1/sv).toFixed(5)} ${(-au/su).toFixed(5)} ${(-av/sv).toFixed(5)})`};
      for(const q of IM){if(!q.on)continue;
        if(q.key==='v')s+=warpImg('civ',(u,v)=>P(-w+S.rw*u,h*(1-v),0),[0,1],false,T('v'));
        else if(q.key==='l')s+=warpImg('cil',(u,v)=>P(-w,h*(1-v),zN*(1-u)),ZT.map(z=>1-z/zN).reverse(),false,T('l'));   // set fra rummet: venstre kant ved bagvæggen
        else if(q.key==='r')s+=warpImg('cir',(u,v)=>P(w,h*(1-v),zN*u),ZT.map(z=>z/zN),false,T('r'));
        else if(q.key==='f')s+=warpImg('cif',(u,v)=>P(-w+S.rw*u,0.01,zN*v),ZT.map(z=>z/zN),true,T('f'))}}
    for(const q of IM){if(!q.on||!q.ok)continue;const c=IMC[q.key],many=q.n>16;
      if(q.key==='v'&&!src)s+=`<rect x="${X(-w)}" y="${Y(h)}" width="${S.rw*s0}" height="${h*s0}" fill="url(#immf)" opacity=".35"/>`;
      if(q.key==='f'&&!src)s+=`<polygon points="${pts([P(-w,0.01,0),P(w,0.01,0),P(w,0.01,zN),P(-w,0.01,zN)])}" fill="url(#immff)"/>`;
      // blend-zoner (overlap mellem nabobilleder) – samme mønster som på lærredet
      {const W3=(u,v)=>q.key==='v'?P(u-w,v,0):q.key==='f'?P(v-w,0.02,u):P(q.key==='l'?-w:w,v,u);
       const span=(len,sz,n,off,ov=q.o)=>{const tot=n*sz-(n-1)*sz*ov,a0=(len-tot)/2+off;return {lo:Math.max(0,a0),hi:Math.min(len,a0+tot),z:[...Array(Math.max(0,n-1)).keys()].map(i=>[Math.max(0,a0+(i+1)*sz*(1-ov)),Math.min(len,a0+i*sz*(1-ov)+sz)]).filter(([a,b])=>b>a)}};
       const SU=span(q.U,q.su,q.nu,q.du,q.ou??q.o),SV=span(q.V,q.sv,q.nv,q.dv);
       for(const [a,b] of SU.z)s+=`<polygon points="${pts([W3(a,SV.lo),W3(b,SV.lo),W3(b,SV.hi),W3(a,SV.hi)])}" fill="url(#bzf)" opacity=".6"/>`;
       for(const [a,b] of SV.z)s+=`<polygon points="${pts([W3(SU.lo,a),W3(SU.hi,a),W3(SU.hi,b),W3(SU.lo,b)])}" fill="url(#bzf)" opacity=".6"/>`}
      for(const t of immPos(q)){const poly=t.c4.map(([x,y,z])=>P(x,y,z));
        s+=`<polygon points="${pts(poly)}" style="fill:${c};stroke:${c}" fill-opacity=".08" stroke-opacity=".9" stroke-width="1.2" stroke-dasharray="6 3"/>`;
        if(!many){const m=poly.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);s+=`<text x="${m[0]}" y="${m[1]+4}" text-anchor="middle" style="font:700 12px var(--f-mono);fill:${c};paint-order:stroke;stroke:#05060A;stroke-width:3px">${t.id}</text>`}}}
    IMMPJ=IM}
  FRONTI={Yh,E,X0,f,C};
  // taler ved lærredet (skala) – på scenen i teatret, ingen i immersive
  const PRS=g=>NOCROWD()?'':`<g class="presgrab"><title>Træk for at flytte taleren</title>${r.presHit?g.replace('fill:var(--r-person)','fill:var(--bad)'):g}</g>`;
  const tx=r.presX;if(VN==='theater'){const zS=STAGE(),zp=r.presZ;s+=`<g transform="translate(0,${(P(tx,STH(),zp)[1]-P(tx,0,zp)[1]).toFixed(1)})">`+PRS(person(P,tx,zp,'stand'))+'</g>'}else if(VN!=='immersive'&&VN!=='golf')s+=PRS(person(P,tx,r.presZ,'stand'));
  // mål på væggen
  if(!NS){s+='<g class="Ldim">'+dimH(cl,cl+cwp,ctp-20,`${f3(r.CW)} m`,ctp-4,ctp-4);
  s+=dimV(cl+cwp+bm+22,ctp,ctp+chp,`${f3(r.CH)} m`,cl+cwp+bm+3,cl+cwp+bm+3);
  if(S.blend&&r.N>1)s+=dimH(X(r.cx-r.CW/2+r.W*(1-r.o)),X(r.cx-r.CW/2+r.W),ctp-46,`blend ${f3(r.W*r.o)} m`,ctp-24,ctp-24);s+='</g>'}
  // stole + projektorer (malerens algoritme: fjernest først)
  const seatX=[];for(let x=-w+0.8;x<=w-0.8;x+=0.56)if(Math.abs(x)>0.6)seatX.push(x);
  const items=[];
  if(r.stand){// stående publikum i små grupper; museum får bænk og sokkel
    r.rows.forEach((z,i)=>{const xs=[-w*.55,-w*.2,w*.15,w*.5].map((x,j)=>x+((i*7+j*3)%5-2)*0.18);xs.forEach((x,j)=>{if((i+j)%3===2)return;const zz=z+((i+j)%2)*0.5;if(zz<S.rd-0.3)items.push({z:zz,draw:()=>person(P,x,zz,'stand')})})});
    if(VN==='museum'){const zb=Math.min(S.rd-1.5,Math.max(S.r1+1,S.rd*0.55));
      const zp=Math.min(S.rd-0.8,S.r1+0.4),xp=w-1.1;items.push({z:zp+.5,draw:()=>{const f=[P(xp-.25,0,zp+.5),P(xp+.25,0,zp+.5),P(xp+.25,1.0,zp+.5),P(xp-.25,1.0,zp+.5)],t=[P(xp-.25,1.0,zp),P(xp+.25,1.0,zp),P(xp+.25,1.0,zp+.5),P(xp-.25,1.0,zp+.5)],c=P(xp,1.25,zp+.25),k=sc(zp+.25);return `<polygon points="${pts(t)}" style="fill:#FFFFFF"/><polygon points="${pts(f)}" style="fill:#E4E0D8"/><path d="M${c[0]-.1*k},${c[1]+.25*k} q${-.08*k},${-.3*k} ${.05*k},${-.5*k} q${.13*k},${.2*k} ${.05*k},${.5*k} z" style="fill:#7A5A3A"/>`}})}}
  else r.rows.forEach(z=>{if(z<S.rd-0.4)items.push({z:z+0.5,draw:()=>seatRow(P,z,seatX)})});
  if(!rear&&!NS)r.pjs.forEach(p=>items.push({z:r.outBack,draw:()=>'<g class="Lpj">'+projector3D(PJ,r,p)+'</g>'}));
  if(VN==='golf'&&GCUR){const GC=GCUR;s+=golfFloor(P,GC);items.push({z:GC.tz,draw:()=>golferFront(P,sc,GC)+golfSwingFront(P,GC)});items.push({z:GC.ioBox?GC.ioBox.z1:(GC.t4z||0),draw:()=>golfUnitFront(P,GC,r)});const zc=(r.outFront+r.outBack)/2;r.pjs.filter(p=>!p.s).forEach(p=>items.push({z:r.outBack-.001,draw:()=>{const a=P(p.lx,r.topY,zc),b=P(p.lx,S.rh,zc);return S.ceil&&r.topY<S.rh-.02?`<line class="Lpj" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--r-truss)" stroke-width="3"/>`:''}}))}
  items.sort((a,b)=>a.z-b.z);
  // stråler under projektorer
  function beams(){let s='';r.pjs.forEach(p=>{const cw=[[p.tx-r.W/2,p.ty+r.H/2],[p.tx+r.W/2,p.ty+r.H/2],[p.tx+r.W/2,p.ty-r.H/2],[p.tx-r.W/2,p.ty-r.H/2]];
    const starts=cw.map(([x,y])=>{const e=beamExit(r,p.ly,S.L,y);const t=S.L>0?1-e[0]/S.L:0;return PJ(p.lx+(x-p.lx)*t,e[1],e[0])});
    const cs=cw.map(([x,y])=>[X(x),Y(y)]);
    s+=`<g class="Lbeam"><polygon points="${pts(hull(cs.concat(starts)))}" style="fill:var(--beam)" opacity=".10"/>`;
    cs.forEach((c,i)=>s+=`<line x1="${starts[i][0]}" y1="${starts[i][1]}" x2="${c[0]}" y2="${c[1]}" style="stroke:var(--beam)" stroke-width=".7" opacity=".45"/>`);s+='</g>'});return s};
  if(!rear&&!NS)s+=beams();
  items.forEach(it=>s+=it.draw());
  // lærredets underkant: målt midt i lokalet (i midtergangen), tegnet oven på stolene så tallet kan læses
  s+='<g class="Ldim">';if(NS);else if(S.sb>0.05){const x=X(r.cx),a=Y(0),b=Y(S.sb);s+=`<line x1="${x}" y1="${a}" x2="${x}" y2="${b}" style="stroke:var(--dim)" stroke-width="1.6" marker-start="url(#ar)" marker-end="url(#ar)"/>`+lbl(x,(a+b)/2,`underkant ${f3(S.sb)} m`)}
  else s+=lbl(X(r.cx),Y(0)-12,'underkant 0,000 m');
  if(!NS&&Math.abs(r.cx)>.005)s+=lbl(X(r.cx),ctp-42,`lærred forskudt ${f3(Math.abs(r.cx))} m til ${r.cx>0?'højre':'venstre'}`,'m');s+='</g>';
  // loftstruss ved loftmontering
  function truss(){let s='';if(S.ceil){const zt=(r.outFront+r.outBack)/2,a=PJ(-w,h-0.12,zt),b=PJ(w,h-0.42,zt);s+=`<rect x="${a[0]}" y="${a[1]}" width="${b[0]-a[0]}" height="${b[1]-a[1]}" fill="none" style="stroke:var(--r-truss)" stroke-width="2"/>`;
    const n=Math.round(S.rw/0.5);for(let i=0;i<n;i++){const x0=a[0]+(b[0]-a[0])*i/n,x1=a[0]+(b[0]-a[0])*(i+1)/n;s+=`<line x1="${x0}" y1="${a[1]}" x2="${x1}" y2="${b[1]}" style="stroke:var(--r-truss)" stroke-width="1"/>`}
    r.pjs.filter(p=>!p.s).forEach(p=>{const t=PJ(p.lx,p.ly+r.F.y1,zt),u=PJ(p.lx,h-0.42,zt);s+=`<line class="Lpj" x1="${t[0]}" y1="${t[1]}" x2="${u[0]}" y2="${u[1]}" style="stroke:var(--r-truss)" stroke-width="2.5"/>`})}return s};
  if(!rear&&!NS&&VN!=='golf')s+=truss();
  // afstand mellem projektorer (edge blend)
  if(!NS&&S.blend&&(r.N>1||r.R>1)){s+='<g class="Ldim">';const zb=r.outBack,oh=r.outer[1],ow=r.outer[0];
    const sLow=S.ceil?r.stk-1:0,row0=r.pjs.filter(p=>p.r===r.R-1&&p.s===sLow).sort((a,b)=>a.c-b.c);
    for(let i=0;i<row0.length-1;i++){const a=row0[i],b=row0[i+1];const yy=a.ly+r.F.y0-0.25;const A=PJ(a.lx,yy,zb),B=PJ(b.lx,yy,zb);
      const gap=r.pitchX-ow;s+=dimH(A[0],B[0],A[1],`c/c ${f3(r.pitchX)} m`,PJ(a.lx,a.ly+r.F.y0,zb)[1],PJ(b.lx,b.ly+r.F.y0,zb)[1]);
      const G1=PJ(a.lx+r.F.x1,yy-0.32,zb),G2=PJ(b.lx+r.F.x0,yy-0.32,zb);if(gap>0)s+=lbl((G1[0]+G2[0])/2,A[1]+22,`fri ${mm(gap)} mm`,'m');else s+=lbl((A[0]+B[0])/2,A[1]+22,`overlap ${mm(-gap)} mm`,'d')}
    if(r.R>1){const col=r.pjs.filter(p=>p.c===r.N-1&&!p.s).sort((a,b)=>b.r-a.r);for(let i=0;i<col.length-1;i++){const a=col[i],b=col[i+1];const xx=a.lx+r.F.x1+0.3;const A=PJ(xx,a.ly,zb),B=PJ(xx,b.ly,zb);
      s+=dimV(A[0],A[1],B[1],`c/c ${f3(r.pitchY)} m`,PJ(a.lx+r.F.x1,a.ly,zb)[0],PJ(b.lx+r.F.x1,b.ly,zb)[0])}}
  s+='</g>'}
  // immersive: projektorer til sidevægge (i loftet ved modsatte væg) og gulv (i loftet, pegende ned)
  if(VN==='immersive'&&IMMPJ){
    for(const q of IMMPJ){if(!q.on||!q.ok)continue;const c=IMC[q.key],many=q.n>16;
      for(const t of immPos(q)){const o=P(...t.pj),k=sc(t.pj[2]),cs=t.c4.map(([x,y,z])=>P(x,y,z)),bw=Math.max(6,.36*k),bh=Math.max(3,.16*k);
        s+=`<g class="ipj" data-ipj="${q.key}" data-tid="${t.id}"><title>${t.id} · ${q.name} · ${q.pm.m.split(' (')[0]} – træk for at flytte hele gruppen</title><polygon class="fr" points="${pts(hull(cs.concat([o])))}" style="fill:${c}" fill-opacity=".03"/>`+
          cs.map(p=>`<line class="ln" x1="${o[0]}" y1="${o[1]}" x2="${p[0]}" y2="${p[1]}" style="stroke:${c}" stroke-opacity=".15" stroke-width=".8"/>`).join('')+
          `<rect x="${o[0]-bw/2}" y="${o[1]-bh/2}" width="${bw}" height="${bh}" rx="2" style="fill:var(--pj-hi);stroke:${c}" stroke-width="1.6"/>`+
          `<rect x="${o[0]-bw/2-6}" y="${o[1]-bh/2-6}" width="${bw+12}" height="${bh+12}" fill="transparent"/>`+
          (many?'':`<text x="${o[0]}" y="${o[1]-bh/2-4}" text-anchor="middle" style="font:700 11px var(--f-mono);fill:${c};paint-order:stroke;stroke:#05060A;stroke-width:3px">${t.id}</text>`)+'</g>'}}
    const ML=(vis,full)=>full-vis>.1?`${f3(vis)} m (billede ${f3(full)} m)`:`${f3(full)} m`;
    // målestok på billedet fra den projektor, musen holdes over (vises via pointerover – ellers for meget oven i hinanden)
    let DIMS='';
    for(const q of IMMPJ){if(!q.on||!q.ok)continue;
      const W3=(u,v)=>q.key==='v'?P(u-w,v,0):q.key==='f'?P(v-w,0.03,u):P(q.key==='l'?-w:w,v,u);
      const seg=(A,B)=>`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" style="stroke:#fff" stroke-width="1.4"/>`;
      for(const t of immPos(q)){const du=(t.u1-t.u0),dv=(t.v1-t.v0),vu=t.v0+dv*.14,uv=t.u0+du*.12;
        const tick=(u,v,along)=>{const k=along==='u'?dv*.05:du*.05;return along==='u'?seg(W3(u,v-k),W3(u,v+k)):seg(W3(u-k,v),W3(u+k,v))};
        const mu=W3((t.u0+t.u1)/2,vu),mv=W3(uv,(t.v0+t.v1)/2);
        DIMS+=`<g class="ipjd${t.id===HOVDIM?' on':''}" data-dim="${t.id}" pointer-events="none"><g style="filter:drop-shadow(0 0 1.5px #000)">`+
          seg(W3(t.u0,vu),W3(t.u1,vu))+tick(t.u0,vu,'u')+tick(t.u1,vu,'u')+seg(W3(uv,t.v0),W3(uv,t.v1))+tick(uv,t.v0,'v')+tick(uv,t.v1,'v')+'</g>'+
          lbl(mu[0],mu[1],`${t.id} ${ML(du,q.su)}`,'d')+lbl(mv[0],mv[1],ML(dv,q.sv),'d')+'</g>'}}
    s+=(IMMSG&&Date.now()-IMMSG.t<4000)?lbl(14,vh-18,IMMSG.txt,'d','start'):lbl(14,vh-18,'træk i en projektor for at flytte dens gruppe · Shift eller «Op/ned» = hæv/sænk · hold musen over for at se, hvor den skyder hen','m','start')+DIMS}
  // mål på projektor
  const p0=r.pjs.filter(p=>!p.s).pop(),lp=PJ(p0.lx+r.F.x0,p0.ly+(r.stk>1?(S.ceil?-1:1)*(r.stk-1)*r.outer[1]/2:0),r.outBack);
  if(!NS&&!REAR())s+='<g class="Ldim">'+lbl(lp[0]-8,lp[1],r.stk>1?`stak ${r.stk} × ${mm(r.outer[1])} = ${mm(r.outer[0])} × ${mm(r.stk*r.outer[1])} mm`:`${mm(r.outer[0])} × ${mm(r.outer[1])} mm`,'d','end')+'</g>';
  {const t=`lokale ${f3(S.rw,1)} × ${f3(S.rd,1)} × ${f3(S.rh,1)} m${r.stand||VN==='golf'?'':` · ${fi(r.rows.length*r.seatsRow)} pladser`}`;s+=lbl(vw-14,vh-18,t,'m','end')}
  if(!NS&&S.content==='img'&&!IMG)s+=lbl(cl+cwp/2,ctp+chp/2,'Klik «Eget billede» for at vælge et billede','m');
  // klikflader for vinduer (custom) – øverst, så de kan rammes over alt andet
  HIT.forEach(([id,poly,t])=>{s+=`<polygon class="winhit" data-win="${id}" points="${pts(poly)}" fill="transparent"><title>${t} – klik for at ${OFF.has(id)?'tilføje':'fjerne'}</title></polygon>`});
  if(SUN&&CUST)s+=lbl(14,vh-18,`klik på et vindue for at fjerne/tilføje · ${HIT.length-OFF.size} af ${HIT.length} aktive`,'m','start');
  $('front').innerHTML=s;{const L=S.l9||{};const fr=$('front');['gsw','gsh'].forEach(k=>$('side').classList.toggle('h-'+k,L[k]===false));['beam','shift','spill','pj','dim','gsw','gsh'].forEach(k=>{const on=L[k]!==false;fr.classList.toggle('h-'+k,!on);const b=document.querySelector(`[data-l9="${k}"]`);if(b)b.setAttribute('aria-pressed',on)})}
  drawImm(r);
}
function drawCrBand(){const b=$('crBand');b.hidden=S.venue!=='immersive';if(b.hidden)return;const lo=S.immCrMin??1,hi=S.immCrMax??100,a=cbC2V(lo),z=cbC2V(hi);
  if(document.activeElement!==$('cbMin'))$('cbMin').value=a;if(document.activeElement!==$('cbMax'))$('cbMax').value=z;$('cbFill').style.left=a+'%';$('cbFill').style.width=Math.max(0,z-a)+'%';
  $('cbLo').textContent=f3(lo,lo<10?1:0)+':1';$('cbHi').textContent=hi>=99.5?'∞':f3(hi,hi<10?1:0)+':1'}
function drawImmBlend(r){$('blendStd').hidden=true;$('blendImm').hidden=false;document.querySelectorAll('[data-ity]').forEach(b=>b.setAttribute('aria-pressed',(S.immTypes||{})[b.dataset.ity]!==false));
  const IM=immCalc(r),on=IM.filter(q=>q.on),tot=on.reduce((a,q)=>a+(q.ok?q.n:0),0),el=document.activeElement;
  $('sumBlend').textContent=`${tot} stk · ${S.immOv??10} %`;
  if(el!==$('iov'))$('iov').value=S.immOv??10;
  const lab={v:['vandret','lodret'],l:['vandret','lodret'],r:['vandret','lodret'],f:['på langs','på tværs']};
  const box=$('iblRows'),sig=on.map(q=>q.key).join('');
  if(box.dataset.sig!==sig){box.dataset.sig=sig;box.innerHTML=on.map(q=>`<div class="iblr" data-k="${q.key}"><div class="hd"><i style="background:${IMC[q.key]}"></i>${q.name}<span class="sp"></span><button type="button" class="autob" data-auto="${q.key}" title="Auto: færrest mulige projektorer">Auto</button></div>
      <div class="grid"><input type="number" min="1" max="20" step="1" data-g="${q.key}" data-ax="c" aria-label="${q.name} ${lab[q.key][0]}"><span>${lab[q.key][0]}</span><span class="x">×</span><input type="number" min="1" max="20" step="1" data-g="${q.key}" data-ax="r" aria-label="${q.name} ${lab[q.key][1]}"><span>${lab[q.key][1]}</span></div><div class="res"></div></div>`).join('')||'<div class="hint">Vælg flader under «Lokalet set bagfra».</div>'}
  for(const q of on){const d=box.querySelector(`[data-k="${q.key}"]`);if(!d)continue;
    const ic=d.querySelector('[data-ax="c"]'),ir=d.querySelector('[data-ax="r"]');if(el!==ic)ic.value=q.nu;if(el!==ir)ir.value=q.nv;
    d.querySelector('[data-auto]').setAttribute('aria-pressed',!q.fixedN&&!q.fixedR);
    d.querySelector('.res').innerHTML=q.ok?`billede <b>${f3(q.W)} × ${f3(q.H)} m</b> · blend <b>${f3(q.bz)} m</b>${q.nv>1?` / ${f3(q.bzv)} m`:''} · kast <b>${f3(q.L)} m</b>${q.rot?' · drejet 90°':''} · <b>${q.n}</b> stk${q.note?`<br><span class="warn">${q.note}</span>`:''}${(()=>{const CB=crBandOf();if(!CB.on)return '';const out=q.cr<CB.lo||q.cr>CB.hi;return `<br>kontrast <b class="${out?'warnc':''}">${f3(q.cr,1)}:1</b>${out?' – uden for kontrastområdet':''}`})()}${q.bandMiss?`<br><span class="warn">Ingen projektor/optik giver ${f3(crBandOf().lo,0)}–${crBandOf().hi===Infinity?'∞':f3(crBandOf().hi,0)}:1 på denne flade</span>`:''}${q.sug?`<br><span class="sug">Bedste løsning: <span class="notr">${q.sug.model}</span> · ${q.sug.name}${q.sug.rot?' · portræt':''}${crBandOf().on?` · ${f3(q.sug.cr,1)}:1`:''}: <b>${q.sug.n}</b> stk<button type="button" data-use="${q.key}">Brug</button></span>`:''}`:`<span class="warn">${q.note||'kan ikke dækkes'}</span>`}
  {const sv=on.filter(q=>q.ok&&q.sug),save=sv.reduce((a,q)=>a+q.n-q.sug.n,0);$('iblBest').hidden=!sv.length;
   if(sv.length)$('iblBest').innerHTML=`<span>Bedste løsning pr. flade: <b>${tot-save}</b> i stedet for ${tot} projektorer</span><span class="sp"></span><button type="button" data-best="1">Brug bedste løsning</button>`}
  $('iblHint').innerHTML=`Auto vælger det mindste antal projektorer og tilpasser billedet, så det præcis fylder fladen. Skriv et fast antal projektorer for at låse opdelingen – billedet tilpasses, så det fylder fladen med ${S.immOv??10} % overlap, og kastet holdes inden for optikkens zoom (træk i projektorerne i «Lokalet set bagfra»). `}
/* immersive: nøgletal, status og kontrast ud fra fladerne (der er intet lærred) */
function immStats(r){const on=immCalc(r).filter(q=>q.on),ok=on.filter(q=>q.ok);const worst=ok.reduce((a,q)=>!a||q.cr<a.cr?q:a,null);
  const px=ok.reduce((a,q)=>a+Math.round(q.U/q.su*(q.rot?q.eh:q.ew))*Math.round(q.V/q.sv*(q.rot?q.ew:q.eh)),0);
  return {on,ok,bad:on.filter(q=>!q.ok),worst,dim:ok.reduce((a,q)=>!a||q.lux<a.lux?q:a,null),tot:ok.reduce((a,q)=>a+q.n,0),px,Lmin:Math.min(...ok.map(q=>q.L)),Lmax:Math.max(...ok.map(q=>q.L))}}
function immKPI(r,K){const st=immStats(r),req=crMin();const c={};st.ok.forEach(q=>{const t=q.pm.m.split(' (')[0];c[t]=(c[t]||0)+q.n});
  const nm=q=>q?q.name:'–';
  return K(st.bad.length?'bad':st.ok.length?'ok':'','Projektorer i alt',`${st.tot}<small>stk</small>`,Object.entries(c).map(([t,n])=>`${n} × ${t}`).join(' · ')||'ingen flader valgt')+
    K('','Flader',`${st.on.length}<small>af 4</small>`,st.on.map(q=>q.name).join(' · ')||'vælg flader under «Lokalet set bagfra»')+
    K('','Pixels i alt',`${f3(st.px/1e6,1)}<small>MP</small>`,'alle flader, overlap talt én gang')+
    K('','Kast',st.ok.length?`${f3(st.Lmin,1)}–${f3(st.Lmax,1)}<small>m</small>`:'–',st.ok.length?'korteste og længste kast':'')+
    K('','Mindste lys',st.dim?`${fi(st.dim.lux)}<small>lux</small>`:'–',st.dim?nm(st.dim):'')+
    K(st.worst?(st.worst.cr>=req?'ok':'warn'):'','Laveste kontrast',st.worst?`${fi(st.worst.cr)}<small>:1</small>`:'–',st.worst?`${nm(st.worst)} · krav ${f3(req,req%1?1:0)}:1`:'')}
function immCrR(r){const st=immStats(r),q=st.worst;if(!q)return r;const pcr=q.pm===r.m&&S.pcr?S.pcr:q.pm.cr,amb=r.amb,lux=q.lux;
  const blk=lux/pcr+amb,blk2=2*lux/pcr+amb,blk4=4*lux/pcr+amb;return {...r,lux,pcr,cr:(lux+amb)/blk,blk,blk2,blk4,cr2:(lux+blk2)/blk2,cr4:(lux+blk4)/blk4,N:1,R:1,kx:1,ky:1,o:0,immQ:q}}
function drawImm(r){const on=S.venue==='immersive';$('immPanel').hidden=!on;if(!on)return;
  document.querySelectorAll('[data-imm]').forEach(b=>b.setAttribute('aria-pressed',!!S.imm[b.dataset.imm]));
  const IM=immCalc(r),q0={name:'Front (lærred)',U:r.CW,V:r.CH,L:S.L,W:r.W,H:r.H,nu:r.N,nv:r.R,lux:r.lux,cr:r.cr,ok:r.zoomOK&&r.sizeOK,n:r.N*r.R,on:true,note:r.zoomOK?'':'uden for zoom'};
  const rows=IM.filter(q=>q.on);const tot=rows.reduce((a,q)=>a+(q.ok?q.n:0),0);
  $('immTbl').innerHTML=`<tr><th>Flade</th><th class="n">Flade</th><th class="n">Afstand</th><th class="n">Billede pr. stk</th><th class="n">Projektorer</th><th class="n">Pixels (samlet)</th><th class="n">Lys</th><th class="n">Kontrast</th></tr>`+
    rows.map(q=>q.ok?`<tr><td><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${IMC[q.key]};margin-right:6px"></i>${q.name}${q.note?` <span class="hint">· ${q.note}</span>`:''}<br><span class="hint" style="margin-left:16px">${q.pm.m.split(' (')[0]} · ${q.pl[0]}</span></td><td class="n">${f3(q.U,1)} × ${f3(q.V,1)} m</td><td class="n">${f3(q.L)} m</td><td class="n">${f3(q.W)} × ${f3(q.H)} m${q.rot?' (drejet 90°)':''}</td><td class="n"><b>${q.n}</b> <span class="hint">(${q.nu}×${q.nv})</span></td><td class="n">${IMPX(q)} px</td><td class="n">${fi(q.lux)} lux</td><td class="n" style="color:${q.cr>=15?'var(--ok)':q.cr>=7?'var(--warn)':'var(--bad)'}">${fi(q.cr)}:1</td></tr>`
      :`<tr><td>${q.name}<br><span class="hint">${q.pm.m.split(' (')[0]} · ${q.pl[0]}</span></td><td class="n">${f3(q.U,1)} × ${f3(q.V,1)} m</td><td colspan="6" style="color:var(--bad)">${q.note||'kan ikke dækkes'} – vælg en anden optik</td></tr>`).join('')+
    (rows.length?'':`<tr><td colspan="8" class="hint">Vælg en eller flere flader ovenfor.</td></tr>`)+`<tr><td><b>I alt</b></td><td></td><td></td><td></td><td class="n"><b>${tot}</b></td><td></td><td></td><td></td></tr>`+(()=>{const c={};rows.forEach(q=>{if(q.ok&&q.n){const t=q.pm.m.split(' (')[0]+' · '+q.pl[0];c[t]=(c[t]||0)+q.n}});return Object.entries(c).map(([t,n])=>`<tr><td colspan="4" class="hint">${t}</td><td class="n">${n} stk</td><td></td><td></td><td></td></tr>`).join('')})();
  document.querySelectorAll('[data-imode]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.imode===(S.imMode||'h')));$('immLensLock').setAttribute('aria-pressed',!!S.lockLens);$('immLensLockTxt').textContent=S.lockLens?'🔒 Optik låst':'Lås optik';
  $('immHint').innerHTML=`Træk i en projektor i «Lokalet set bagfra» for at flytte hele gruppen: på tværs ændrer kastafstanden, langs fladen forskyder billederne – overlappet (edge blend) bliver det samme. Med «Op/ned» (eller Shift) hæves og sænkes gulv-projektorerne – optikken skiftes automatisk, og «Auto» for gulvet i 05 slås fra, så opdelingen bevares. Hver flade beregnes med sin egen projektor og optik, uafhængigt af lærredet. Projektorerne starter uden zoom (vidvinkel, zoomfaktor 1,0) – træk dem væk fra fladen for at bruge zoomen. Side-projektorerne hænger i loftet, gulv-projektorerne i loftet over gulvet – det faktiske kast pr. flade står i tabellen. Auto vælger færrest mulige projektorer og tilpasser billedet, så det præcis fylder fladen med ${fi(S.immOv??10)} % overlap (indstilles under 05 Edge blend). Projektion på vægge fra loftet kræver lens shift og/eller geometrisk korrektion (warp). Lys og kontrast er pr. projektor uden refleksioner – i et immersive rum lyser fladerne hinanden op, så den reelle kontrast bliver lavere.`}
function seatRow(P,z,xs){let back='',front='';const zb=z+0.5,zt=z+0.58,zs0=z+0.06,zs1=z+0.47;
  for(const x of xs){
    // armlæn (mellem stolene), sæde og ben
    for(const xa of [x-0.28,x+0.28]){const a=P(xa,0.66,zb),b=P(xa,0.66,z+0.02),c=P(xa,0,zb);front+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--r-seat3)" stroke-width="${Math.max(1.5,(P(.06,0,zb)[0]-P(0,0,zb)[0]))}" stroke-linecap="round"/><line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" style="stroke:var(--r-seat3)" stroke-width="${Math.max(1,(P(.05,0,zb)[0]-P(0,0,zb)[0]))}"/>`}
    front+=`<polygon points="${pts([P(x-0.24,0.46,zs1),P(x+0.24,0.46,zs1),P(x+0.23,0.47,zs0),P(x-0.23,0.47,zs0)])}" style="fill:var(--r-seat2)"/>`;
    // ryglæn bagfra (let tilbagelænet, afrundet top)
    const l0=P(x-0.25,0.44,zb),r0=P(x+0.25,0.44,zb),r1=P(x+0.24,0.96,zt),l1=P(x-0.24,0.96,zt),tc=P(x,1.02,zt+.01);
    back+=`<path d="M${l0[0]},${l0[1]} L${r0[0]},${r0[1]} L${r1[0]},${r1[1]} Q${tc[0]},${tc[1]-(r1[1]-tc[1])*0.2} ${l1[0]},${l1[1]} Z" style="fill:var(--r-seat)"/>`;
    const h0=P(x-0.2,0.9,zt-.01),h1=P(x+0.2,0.9,zt-.01);back+=`<line x1="${h0[0]}" y1="${h0[1]}" x2="${h1[0]}" y2="${h1[1]}" style="stroke:var(--r-seat2)" stroke-width="${Math.max(1,(P(.04,0,zt)[0]-P(0,0,zt)[0]))}" stroke-linecap="round" opacity=".7"/>`;
    const n=P(x-0.03,0.44,zb),n2=P(x+0.03,0,zb);back+=`<rect x="${n[0]}" y="${n[1]}" width="${Math.max(1,n2[0]-n[0])}" height="${n2[1]-n[1]}" style="fill:var(--r-seat3)"/>`}
  return front+back}
function person(P,x,z,mode){const k=(P(1,0,z)[0]-P(0,0,z)[0]);const [bx,by]=P(x,0,z);const hgt=1.76*k;
  return `<g style="fill:var(--r-person)"><circle cx="${bx}" cy="${by-hgt+.11*k}" r="${.11*k}"/><path d="M${bx-.21*k},${by-hgt+.28*k} q${.21*k},-${.06*k} ${.42*k},0 l${.03*k},${.62*k} h-${.1*k} l-${.02*k},${.82*k} h-${.13*k} l-${.02*k},-${.6*k} l-${.02*k},${.6*k} h-${.13*k} l-${.02*k},-${.82*k} h-${.1*k} z"/></g>`}
function projector3D(P,r,p){let s='';const B=r.B;const z1=S.L+B.z0,z2=S.L+B.z1,x0=p.lx+B.x0,x1=p.lx+B.x1,y0=p.ly+B.y0,y1=p.ly+B.y1;
  const side=(x)=>pts([P(x,y0,z1),P(x,y1,z1),P(x,y1,z2),P(x,y0,z2)]);
  if(x0>0)s+=`<polygon points="${side(x0)}" style="fill:var(--pj-dk)"/>`; if(x1<0)s+=`<polygon points="${side(x1)}" style="fill:var(--pj-dk)"/>`;
  const yy=1.6>y1?y1:(1.6<y0?y0:null);if(yy!=null)s+=`<polygon points="${pts([P(x0,yy,z1),P(x1,yy,z1),P(x1,yy,z2),P(x0,yy,z2)])}" style="fill:var(--pj-hi)"/>`;
  const a=P(x0,y1,z2),b=P(x1,y0,z2);s+=`<rect x="${a[0]}" y="${a[1]}" width="${b[0]-a[0]}" height="${b[1]-a[1]}" rx="${(b[0]-a[0])*.04}" fill="url(#pjgf)"/>`;
  for(let i=1;i<6;i++){const yv=a[1]+(b[1]-a[1])*(0.2+i*0.1);s+=`<line x1="${a[0]+(b[0]-a[0])*.12}" y1="${yv}" x2="${a[0]+(b[0]-a[0])*.5}" y2="${yv}" style="stroke:var(--pj-dk)" stroke-width="1.2"/>`}
  if(S.frame){const fx0=p.lx+r.F.x0,fx1=p.lx+r.F.x1,fy0=p.ly+r.F.y0,fy1=p.ly+r.F.y1,fz0=r.outFront,fz1=r.outBack;
    const E=[[[fx0,fy0,fz0],[fx0,fy0,fz1]],[[fx1,fy0,fz0],[fx1,fy0,fz1]],[[fx0,fy1,fz0],[fx0,fy1,fz1]],[[fx1,fy1,fz0],[fx1,fy1,fz1]],
      [[fx0,fy0,fz0],[fx1,fy0,fz0]],[[fx0,fy1,fz0],[fx1,fy1,fz0]],[[fx0,fy0,fz0],[fx0,fy1,fz0]],[[fx1,fy0,fz0],[fx1,fy1,fz0]],
      [[fx0,fy0,fz1],[fx1,fy0,fz1]],[[fx0,fy1,fz1],[fx1,fy1,fz1]],[[fx0,fy0,fz1],[fx0,fy1,fz1]],[[fx1,fy0,fz1],[fx1,fy1,fz1]]];
    E.forEach(([u,v])=>{const A=P(...u),B=P(...v);s+=`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" style="stroke:var(--frame)" stroke-width="2.6" stroke-linecap="round"/>`})}
  return s}

/* Lysstrålen tegnes fra det sted, hvor den forlader kabinettet (ultrakort kast: spejlet sidder inde i kabinettet, lyset går ud gennem toppen) */
function beamExit(r,ly,L,yS){if(r.kind!=='u')return [L,ly];const top=ly+r.B.y1,bot=ly+r.B.y0;const ye=yS>top?top:(yS<bot?bot:null);if(ye==null)return [L,ly];const t=(ye-ly)/(yS-ly);return [L*(1-t),ye]}

/* Detalje for ultrakort kast: lærredets underkant, spejl og kabinet i stor målestok (mål som i Panasonics værktøj: L, L1/L4 og H) */
function ustInset(r){const p0=r.pjs[0],B=r.B,yb=p0.ty-r.H/2,near=Math.min(r.outFront,S.L),back=Math.max(r.outBack,S.L);
  const yTop=p0.ly+B.y1,yBot=p0.ly+B.y0,yEdge=S.ceil?yBot:yTop;
  const yT=yb+r.H;const z0=-0.12,z1=back+0.18,ya=Math.min(yBot,yb,yT)-0.15,yz=Math.max(yTop,yT,yb)+0.15;
  const bx=600,by=34,bw=370,bh=300;const sc=Math.min((bw-90)/(z1-z0),(bh-70)/(yz-ya));
  const X=z=>bx+60+(z-z0)*sc,Y=y=>by+bh-34-(y-ya)*sc;
  let s=`<g><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8" style="fill:var(--surface);stroke:var(--line)"/><text class="m" x="${bx+12}" y="${by+18}">Detalje · ultrakort kast</text>`;
  s+=`<clipPath id="uclip"><rect x="${bx+1}" y="${by+24}" width="${bw-2}" height="${bh-25}"/></clipPath><g clip-path="url(#uclip)">`;
  s+=`<rect x="${X(z0)}" y="${by}" width="${X(0)-X(z0)}" height="${bh}" fill="url(#hatchs)"/>`;
  if(ya<0)s+=`<rect x="${X(z0)}" y="${Y(0)}" width="${bw}" height="${by+bh-Y(0)}" fill="url(#hatchs)"/>`;
  s+=`<rect x="${X(0)}" y="${Y(yT)}" width="${Math.max(3,.03*sc)}" height="${Y(yb)-Y(yT)}" style="fill:var(--ok)"/>`;
  const e1=beamExit(r,p0.ly,S.L,yb),top=yT;const e2=beamExit(r,p0.ly,S.L,top);
  s+=`<linearGradient id="ug" gradientUnits="userSpaceOnUse" x1="${X((e1[0]+e2[0])/2)}" y1="${Y((e1[1]+e2[1])/2)}" x2="${X(0)}" y2="${Y(p0.ty)}"><stop offset="0" style="stop-color:var(--beam);stop-opacity:.65"/><stop offset="1" style="stop-color:var(--beam);stop-opacity:.1"/></linearGradient>`;
  s+=`<polygon points="${X(e2[0])},${Y(e2[1])} ${X(0)},${Y(top)} ${X(0)},${Y(yb)} ${X(e1[0])},${Y(e1[1])}" fill="url(#ug)"/><line x1="${X(e2[0])}" y1="${Y(e2[1])}" x2="${X(0)}" y2="${Y(top)}" style="stroke:var(--beam)"/>`;
  s+=`<line x1="${X(S.L)}" y1="${Y(p0.ly)}" x2="${X(e2[0])}" y2="${Y(e2[1])}" style="stroke:var(--beam)" stroke-dasharray="3 3" opacity=".8"/>`;
  s+=`<line x1="${X(S.L)}" y1="${Y(p0.ly)}" x2="${X(e1[0])}" y2="${Y(e1[1])}" style="stroke:var(--beam)" stroke-dasharray="3 3" opacity=".8"/><line x1="${X(e1[0])}" y1="${Y(e1[1])}" x2="${X(0)}" y2="${Y(yb)}" style="stroke:var(--beam)"/>`;
  s+=`<rect x="${X(S.L+B.z0)}" y="${Y(yTop)}" width="${(B.z1-B.z0)*sc}" height="${(yTop-yBot)*sc}" rx="3" fill="url(#pjgs)"/>`;
  s+=`<circle cx="${X(S.L)}" cy="${Y(p0.ly)}" r="3.5" style="fill:var(--beam)"/><text class="m" x="${X(S.L)+6}" y="${Y(p0.ly)-6}" style="font-size:10px">spejl</text>`;
  s+=`</g>`;
  const dimY=Y(Math.min(yBot,yb))+18;
  s+=dimH(X(0),X(S.L),Math.min(by+bh-10,dimY+16),`L ${f3(S.L,3)} m`,null,Y(p0.ly));
  s+=dimH(X(0),X(near),Math.min(by+bh-28,dimY),`${f3(near,3)} m`,null,Y(yBot));
  const yN=S.ceil?yT:yb;s+=dimV(X(0)-24,Y(yEdge),Y(yN),`H ${f3(Math.abs(yN-yEdge),3)} m`,X(near),X(0));
  return s+'</g>'}
