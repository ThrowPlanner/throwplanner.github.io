/* ===== Projektorskitse (boks 08, 09, 10 og detaljen for ultrakort kast) =====
   Kabinet og optik tegnes ud fra Panasonics officielle mål: kabinet m.dim (B×H×D, uden fødder), optik ln[8] (B×H×L),
   udragning ln[5] og UST-boksen ln[7][1]. Fødder, gitre, ringe og panel er generiske detaljer, der placeres efter målene
   (ingen Panasonic-tegninger eller -design). Kun til tegning – påvirker ikke beregningen.
   Koordinater som calc(): meter, linsen i (0,0,0), x til højre, y op, z væk fra lærredet. */
const PKC=new Map();
// r = {m, ln, kind, PT} (fx calc()); o.ceil / o.lrot overstyrer S (Free Grid har sin egen loftmontering pr. projektor)
function pkModel(r,o={}){
  const m=r.m,ln=r.ln,kind=r.kind||(ln[7]&&ln[7][0])||'n',lr=kind==='l'?((o.lrot??S.lrot)||0)&3:0,flat=lr&1,PT=!!r.PT,CE=!!(o.ceil??S.ceil);
  const key=[m.m,ln[0],kind,lr,CE?1:0,PT?1:0].join('|');if(PKC.has(key))return PKC.get(key);
  const [W,H,D]=m.dim,P=ln[5]||0,ld=Array.isArray(ln[8])&&ln[8].length===3?ln[8]:null,zoom=ln[1]==='Z',big=W>=540;
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),c0=20,LO=kind==='n'?lensOff(m):{x:0,y:0,f:null},lx=LO.x,ly=LO.y+H/2;   // lx/ly: linsens midte i kabinettets lokale mål
  // kabinettets lokale akser (X bredde, Y højde, Z dybde fra fronten) → linsens koordinater (mm), samme placering som calc()
  let f;
  if(kind==='l')f=flat?{o:{x:P,y:-H/2,z:c0+W/2},X:['z',-1],Y:['y',1],Z:['x',1]}:{o:{x:0,y:-P,z:c0+H},X:['x',1],Y:['z',-1],Z:['y',-1]};
  // ultrakort kast: kabinettet = TDC-dybden fra fronten u[4] (som calc). Indbygget spejl (ingen udragning): ust-boksens ekstra højde er fødderne
  else if(kind==='u'){const u=ln[7][1],bz1=u[4]+D,bx0=Math.max(u[0],Math.min(-W/2,u[1]-W)),own=!(ld&&P>0),yb=own?Math.max(u[2],u[3]-H):u[2];f={o:{x:bx0+W/2,y:yb,z:bz1},X:['x',-1],Y:['y',1],Z:['z',-1],bz1,u,ft:own&&yb-u[2]>2?yb-u[2]:0}}
  else f={o:{x:-LO.x,y:-LO.y-H/2,z:P},X:['x',1],Y:['y',1],Z:['z',1]};   // optikken sidder ikke altid i midten (LENSPOS i 03-calc.js)
  const L2W=(x,y,z)=>{const p={...f.o};p[f.X[0]]+=f.X[1]*x;p[f.Y[0]]+=f.Y[1]*y;p[f.Z[0]]+=f.Z[1]*z;return p};
  const bx=(a,b)=>({x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),y0:Math.min(a.y,b.y),y1:Math.max(a.y,b.y),z0:Math.min(a.z,b.z),z1:Math.max(a.z,b.z)});
  const LB=(x0,x1,y0,y1,z0,z1)=>bx(L2W(x0,y0,z0),L2W(x1,y1,z1));
  const FACE={'X+':[f.X[0],f.X[1]],'X-':[f.X[0],-f.X[1]],'Y+':[f.Y[0],f.Y[1]],'Z-':[f.Z[0],-f.Z[1]],'Z+':[f.Z[0],f.Z[1]]};
  const pr=[],box=(b,c,o={})=>pr.push({t:'box',b,c,...o}),deco=(fc,b,k,al)=>pr.push({t:'deco',b,n:FACE[fc],k,al:al||f.Z[0]});
  const cyl=(axis,c,d,a0,a1,cls,o={})=>{const b={};for(const a of['x','y','z']){if(a===axis){b[a+'0']=Math.min(a0,a1);b[a+'1']=Math.max(a0,a1)}else{b[a+'0']=c[a]-d[a]/2;b[a+'1']=c[a]+d[a]/2}}pr.push({t:'cyl',axis,b,c:cls,...o})};
  const sc=(d,k)=>Object.fromEntries(Object.entries(d).map(([a,v])=>[a,v*k]));
  // kabinet (officielle mål er uden fødder – fødderne står uden for)
  const fh=f.ft||cl(H*.05,6,16),fw=cl(W*.07,22,55),fd=cl(D*.07,22,55);
  box(LB(-W/2,W/2,0,H,0,D),'cab',{cab:1});
  for(const sx of[-1,1])for(const zz of[.1,.9])box(LB(sx*W*.4-fw/2,sx*W*.4+fw/2,-fh,0,zz*D-fd/2,zz*D+fd/2),'foot');
  const lip=H*.86;
  // sider: gitre (generiske) – kendt filterplacering (LENSPOS) tegnes som ét langt gitter på siden med optikken
  for(const s of[-1,1]){const x=s*W/2,fc=s>0?'X+':'X-',fs=LO.f&&s===Math.sign(LO.x||1);deco(fc,LB(x,x,lip,lip,0,D),'seam');
    if(fs)deco(fc,LB(x,x,H*.14,H*.8,LO.f[0],LO.f[1]),'slats');else{deco(fc,LB(x,x,H*.22,H*.74,D*.5,D*.93),'slats');if(big)deco(fc,LB(x,x,H*.3,H*.62,D*.06,D*.2),'slats')}}
  // bagside: gitter og tilslutningspanel
  deco('Z+',LB(-W*.42,-W*.06,H*.2,H*.78,D,D),'slats',f.X[0]);deco('Z+',LB(W*.06,W*.42,H*.24,H*.66,D,D),'panel');deco('Z+',LB(-W/2,W/2,lip,lip,D,D),'seam');
  const lr0=(ld?Math.max(ld[0],ld[1]):Math.min(H*.55,W*.24))/2;
  if(kind==='n'){for(const s of[-1,1]){const a=lx+s*(lr0+W*.05),b=s*(W/2-W*.05);if(s*(b-a)>W*.08)deco('Z-',LB(Math.min(a,b),Math.max(a,b),H*.2,H*.8,0,0),'dots')}
    deco('Z-',LB(-W/2,W/2,lip,lip,0,0),'seam');const xl=lx>0?-W*.45:W*.45;deco('Z-',LB(xl,xl,H*.92,H*.92,0,0),'led')}
  deco('Y+',LB(W*.18,W*.44,H,H,D*.66,D*.88),'panel');
  if(big)for(const zz of[[.03,.08],[.92,.97]])deco('Y+',LB(-W*.28,W*.28,H,H,zz[0]*D,zz[1]*D),'handle');
  // optik: a0 = forenden (mod lærredet/spejlet), a1 = ved kabinettet
  const rings=(axis,c,d0,a0,a1)=>{const L=a1-a0,at=t=>a0+t*L,seg=(t0,t1,k,cls,kn)=>cyl(axis,c,sc(d0,k),at(t0),at(t1),cls,{kn});
    if(Math.abs(L)<25){seg(0,1,1,'lens');return}
    seg(0,.07,1,'cap');seg(.07,.34,1,'lens');if(zoom)seg(.34,.56,.95,'ring',1);seg(zoom?.6:.4,zoom?.8:.66,.95,'ring',1);seg(zoom?.8:.66,1,.82,'lens')};
  const glass=(c,d,a)=>cyl('z',c,sc(d,.64),a,a+.5,'glass',{pri:2});
  if(kind==='n'){const d0=ld?{x:ld[0],y:ld[1]}:{x:lr0*2,y:lr0*2},I=ld?Math.max(0,ld[2]-P):0;
    if(P>4)rings('z',{x:0,y:0},d0,0,P);else cyl('z',{x:0,y:0},sc(d0,.9),P,P+.3,'cap',{pri:1});
    glass({x:0,y:0},d0,P>4?0:P-.4);
    if(I>0)cyl('z',{x:0,y:0},sc(d0,.78),P,P+I,'hid',{hid:1})}
  else if(kind==='l'){const lw=ld?ld[0]:250,hh=ld?ld[1]:190,ll=ld?ld[2]:480,ax=f.Z[0],sg=f.Z[1],zc=c0+(flat?W:H)/2,td=Math.min(lw,hh)*.72,I=Math.max(0,ll-P-hh/2);
    box({x0:-lw/2,x1:lw/2,y0:-hh/2,y1:hh/2,z0:0,z1:zc+td/2+12},'lens');
    const c={x:0,y:0,z:zc};delete c[ax];const dd={x:td,y:td,z:td};delete dd[ax];
    rings(ax,c,dd,sg*hh/2,sg*P);
    cyl('z',{x:0,y:0},{x:hh*.92,y:hh*.92},0,.3,'cap',{pri:1});glass({x:0,y:0},{x:hh*.92,y:hh*.92},-.4);
    if(I>0)cyl(ax,c,sc(dd,.85),sg*P,sg*(P+I),'hid',{hid:1})}
  else if(kind==='u'){const u=f.u,bz1=f.bz1,yc=u[2]+H/2,xc=f.o.x;
    if(ld&&u[5]-bz1>5){const Pn=u[5]-bz1,hd=Math.min(Pn*.42,ld[1]*1.15),I=Math.max(0,ld[2]-Pn),d0={x:ld[0],y:ld[1]};
      rings('z',{x:xc,y:yc},d0,u[5]-hd,bz1);
      const hw=Math.min(ld[0]*1.1,u[1]-u[0]);box({x0:xc-hw/2,x1:xc+hw/2,y0:yc-ld[1]/2,y1:u[3],z0:u[5]-hd,z1:u[5]},'lens',{mir:[{x:xc,z:u[5]-4,y:u[3]-4},{x:xc,z:u[5]-hd+6,y:yc-ld[1]*.25}]});
      pr.push({t:'deco',b:{x0:xc-hw*.38,x1:xc+hw*.38,y0:yc+ld[1]*.42,y1:u[3]-8,z0:u[5]-hd,z1:u[5]-hd},n:['z',-1],k:'win'});
      if(I>0)cyl('z',{x:xc,y:yc},sc(d0,.78),bz1-I,bz1,'hid',{hid:1})}
    else{const hw=W*.36,top=f.o.y+H;   // indbygget spejl: udgangsvindue i toppen lige foran spejlpunktet (z = u[5])
      pr.push({t:'deco',b:{x0:xc-hw*.8,x1:xc+hw*.8,y0:top,y1:top,z0:u[5]-D*.25,z1:u[5]-D*.04},n:['y',1],k:'win'})}}
  // samme drejning/spejling som calc(): L-linse vendt (lrot 2/3), portræt (x↔y), loft (x,y vendes) – og mm → m
  const tv=v=>{let {x,y,z}=v;if(lr===2)y=-y;else if(lr===3)x=-x;if(PT)[x,y]=[y,x];if(CE){x=-x;y=-y}return {x,y,z}};
  const tp=p=>{const q=tv(p);return {x:q.x/1000,y:q.y/1000,z:q.z/1000}};
  const tb=b=>{const a=tp({x:b.x0,y:b.y0,z:b.z0}),c=tp({x:b.x1,y:b.y1,z:b.z1});return bx(a,c)};
  const ta=a=>{const v={x:0,y:0,z:0};v[a]=1;const q=tv(v);return ['x','y','z'].find(k=>q[k])};
  const tn=([a,s])=>{const v={x:0,y:0,z:0};v[a]=s;const q=tv(v);const k=['x','y','z'].find(k=>q[k]);return [k,Math.sign(q[k])]};
  const out=pr.map(p=>({...p,b:tb(p.b),...(p.axis?{axis:ta(p.axis)}:{}),...(p.n?{n:tn(p.n)}:{}),...(p.al?{al:ta(p.al)}:{}),...(p.mir?{mir:p.mir.map(tp)}:{})}));
  if(PKC.size>60)PKC.clear();PKC.set(key,out);return out}

const pkR=n=>Math.round(n*10)/10;
/* Retvinklet visning (snit, plantegning, UST-detalje). V = {u,v,d,sd}: skærmens akser og hvilken vej man ser (sd=+1: man ser fladen med største d).
   map(u,v) → [sx,sy] i px (må gerne være drejet). Detaljeniveau følger størrelsen: små tegninger viser kun omrids, optik og fødder. */
// zf: boksens zoom (Z9L) – tegningen forstørres på skærmen, så detaljeniveauet (s = px pr. mm på skærmen) følger med; stregtykkelsen følger tegningens egne enheder
// su (valgfri): tegningens enheder pr. skærm-px (plantegningen, hvor billedets px ≠ skærmens) – så stregerne holder samme tykkelse på skærmen
function pkOrtho(M,V,map,zf,su){
  const o=map(0,0),e=map(1,0),s0=Math.hypot(e[0]-o[0],e[1]-o[1])/1000,s=s0*(zf||1),sw=su?Math.round(Math.max(.5,Math.min(1.2,s*1.4))*su*100)/100:pkR(Math.max(.5,Math.min(1.2,s0*1.4)));
  const pt=(u,v)=>{const q=map(u,v);return pkR(q[0])+','+pkR(q[1])};
  const quad=(r,c)=>`<polygon points="${pt(r.u0,r.v0)} ${pt(r.u1,r.v0)} ${pt(r.u1,r.v1)} ${pt(r.u0,r.v1)}" class="${c}" stroke-width="${sw}"/>`;
  const ln=(u0,v0,u1,v1,c,w=sw)=>{const a=map(u0,v0),b=map(u1,v1);return `<line x1="${pkR(a[0])}" y1="${pkR(a[1])}" x2="${pkR(b[0])}" y2="${pkR(b[1])}" class="${c}" stroke-width="${pkR(w)}"/>`};
  const ell=(cu,cv,ru,rv,c,w=sw,n=20)=>{let q='';for(let i=0;i<n;i++){const t=i/n*2*Math.PI;q+=pt(cu+ru*Math.cos(t),cv+rv*Math.sin(t))+' '}return `<polygon points="${q}" class="${c}" stroke-width="${pkR(w)}"/>`};
  const R=b=>({u0:b[V.u+'0'],u1:b[V.u+'1'],v0:b[V.v+'0'],v1:b[V.v+'1'],d:V.sd>0?b[V.d+'1']:-b[V.d+'0']});
  const it=[];
  M.forEach((p,i)=>{if(p.t==='deco'){if(p.n[0]!==V.d||p.n[1]!==V.sd)return;it.push({p,i,r:R(p.b),d:R(p.b).d+1e-4});return}
    const r=R(p.b);it.push({p,i,r,ax:p.t==='cyl'&&p.axis===V.d,d:p.hid?1e9:r.d+(p.pri||0)*1e-4})});
  it.sort((a,b)=>a.d-b.d||a.i-b.i);
  let out='';const px=v=>v*1000*s;   // længde på skærmen i px (med zoom)
  for(const {p,r,ax} of it){const W=px(r.u1-r.u0),H=px(r.v1-r.v0);
    if(p.t==='deco'){const k=p.k;
      // små tegninger (rummet i 100 %): gitre og panel vises stadig, men med færre og grovere striber, så projektoren ikke ser «plain» ud
      if(k==='seam'){if(s>.04)out+=ln(r.u0,r.v0,r.u1,r.v1,'pk-ln',sw*.8);continue}
      if(k==='led'){if(s>.12)out+=ell(r.u0,r.v0,.003,.003,'pk-glass',sw*.6,8);continue}
      if(k==='win'){out+=quad(r,'pk-glass');continue}
      if(k==='handle'){if(s>.04)out+=quad(r,'pk-foot');continue}
      if(k==='panel'){if(s>.025)out+=quad(r,'pk-foot');if(s>.3){const n=5;for(let j=0;j<n;j++){const cu=r.u0+(r.u1-r.u0)*(j+.5)/n,rr=Math.min(.005,(r.u1-r.u0)/(n*2.6));out+=ell(cu,(r.v0+r.v1)/2,rr,rr,'pk-cab',sw*.7,8)}}continue}
      if(k==='slats'||k==='dots'){if(s<.025)continue;out+=quad(r,'pk-vent');const st=Math.max(.009,2.6/(1000*s)),sl=k==='slats'||s*9<3.2,ins=Math.min(.004,st*.25);   // striber mindst 2,6 px fra hinanden
        if(sl&&px(st)>=2.6&&Math.max(W,H)>=6){if(p.al===V.u){for(let v=r.v0+st/2;v<r.v1;v+=st)out+=ln(r.u0+ins,v,r.u1-ins,v,'pk-ln',sw*.7)}else{for(let u=r.u0+st/2;u<r.u1;u+=st)out+=ln(u,r.v0+ins,u,r.v1-ins,'pk-ln',sw*.7)}}
        if(k==='dots'&&s*9>=3.2){for(let u=r.u0+st/2;u<r.u1;u+=st)for(let v=r.v0+st/2;v<r.v1;v+=st)out+=ell(u,v,.0022,.0022,'pk-dot',0,6)}}
      continue}
    if(ax){const cu=(r.u0+r.u1)/2,cv=(r.v0+r.v1)/2,ru=(r.u1-r.u0)/2,rv=(r.v1-r.v0)/2;if(p.c==='hid')continue;
      out+=ell(cu,cv,ru,rv,'pk-'+p.c);
      if(p.c==='cap'&&px(ru)>6)out+=ell(cu,cv,ru*.86,rv*.86,'pk-ln');
      if(p.c==='glass'&&px(ru)>5)out+=ell(cu,cv,ru*.3,rv*.3,'pk-ln',sw*.8);
      continue}
    if(p.c==='glass')continue;
    if(p.c==='hid'){if(s>.2)out+=quad(r,'pk-hid');continue}
    if(W<.3&&H<.3)continue;
    out+=quad(r,'pk-'+p.c);
    if(p.kn&&s>=.45){const st=.005;if(V.u===p.axis){for(let u=r.u0+st/2;u<r.u1;u+=st)out+=ln(u,r.v0,u,r.v1,'pk-ln',sw*.6)}else if(V.v===p.axis){for(let v=r.v0+st/2;v<r.v1;v+=st)out+=ln(r.u0,v,r.u1,v,'pk-ln',sw*.6)}}
    if(p.mir&&V.d==='x'&&s>.03){const a=p.mir[0],b=p.mir[1];out+=ln(a[V.u],a[V.v],b[V.u],b[V.v],'pk-mir',Math.max(1,Math.min(3,4*s)))}}
  return `<g class="pk">${out}</g>`}

/* Perspektiv (boks 09): P3(x,y,z) i rummets koordinater, projektoren står i (lx,ly,S.L). Beskueren står bag projektoren (stor z) i øjenhøjde 1,6 m. */
function pk3D(M,P3,lx,ly,zf){zf=zf||1;   // zf: boksens zoom – detaljeniveauet følger størrelsen på skærmen
  const W=(x,y,z)=>P3(lx+x,ly+y,S.L+z),pts=a=>a.map(q=>pkR(q[0])+','+pkR(q[1])).join(' ');
  const face=(a,c)=>`<polygon points="${pts(a)}" class="${c}" stroke-width=".8"/>`;
  const it=M.filter(p=>!p.hid&&p.c!=='glass'&&(p.t!=='deco'||(p.n[0]==='z'&&p.n[1]>0))).map((p,i)=>({p,i,d:p.b.z1+(p.t==='deco'?1e-4:0)+(p.pri||0)*1e-4}));
  it.sort((a,b)=>a.d-b.d||a.i-b.i);
  let s='';
  for(const {p} of it){const b=p.b,z1=b.z1,z0=b.z0;
    if(p.t==='deco'){const q=[W(b.x0,b.y0,z1),W(b.x1,b.y0,z1),W(b.x1,b.y1,z1),W(b.x0,b.y1,z1)],sc=Math.abs(W(1,0,z1)[0]-W(0,0,z1)[0])/1000*zf;
      if(p.k==='seam'){if(sc>.04)s+=`<line x1="${pkR(q[0][0])}" y1="${pkR(q[0][1])}" x2="${pkR(q[2][0])}" y2="${pkR(q[2][1])}" class="pk-ln" stroke-width=".7"/>`;continue}
      if(sc<.025)continue;
      s+=face(q,p.k==='slats'?'pk-vent':'pk-foot');
      if(p.k==='slats'){const st=Math.max(.009,2.6/(1000*sc)),ins=Math.min(.004,st*.25);if((b.y1-b.y0)*1000*sc>=6)for(let y=b.y0+st/2;y<b.y1;y+=st){const a=W(b.x0+ins,y,z1),c=W(b.x1-ins,y,z1);s+=`<line x1="${pkR(a[0])}" y1="${pkR(a[1])}" x2="${pkR(c[0])}" y2="${pkR(c[1])}" class="pk-ln" stroke-width=".6"/>`}}
      continue}
    const X0=lx+b.x0,X1=lx+b.x1,Y0=ly+b.y0,Y1=ly+b.y1,cls='pk-'+p.c;
    if(X0>0)s+=face([W(b.x0,b.y0,z0),W(b.x0,b.y1,z0),W(b.x0,b.y1,z1),W(b.x0,b.y0,z1)],'pk-side');
    if(X1<0)s+=face([W(b.x1,b.y0,z0),W(b.x1,b.y1,z0),W(b.x1,b.y1,z1),W(b.x1,b.y0,z1)],'pk-side');
    if(Y1<1.6)s+=face([W(b.x0,b.y1,z0),W(b.x1,b.y1,z0),W(b.x1,b.y1,z1),W(b.x0,b.y1,z1)],'pk-top');
    else if(Y0>1.6)s+=face([W(b.x0,b.y0,z0),W(b.x1,b.y0,z0),W(b.x1,b.y0,z1),W(b.x0,b.y0,z1)],'pk-side');
    if(p.t==='cyl'&&p.axis==='z'){const cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2,rx=(b.x1-b.x0)/2,ry=(b.y1-b.y0)/2,q=[];for(let k=0;k<20;k++){const t=k/20*2*Math.PI;q.push(W(cx+rx*Math.cos(t),cy+ry*Math.sin(t),z1))}s+=face(q,cls)}
    else s+=face([W(b.x0,b.y0,z1),W(b.x1,b.y0,z1),W(b.x1,b.y1,z1),W(b.x0,b.y1,z1)],cls)}
  return `<g class="pk">${s}</g>`}

// samlet udstrækning (kabinet + optik, uden fødder) i linsens koordinater – til rum-tjek
function pkBox(M){let b=null;for(const p of M){if(p.t==='deco'||p.hid||p.c==='foot')continue;const q=p.b;
  b=b?{x0:Math.min(b.x0,q.x0),x1:Math.max(b.x1,q.x1),y0:Math.min(b.y0,q.y0),y1:Math.max(b.y1,q.y1),z0:Math.min(b.z0,q.z0),z1:Math.max(b.z1,q.z1)}:{...q}}return b}

/* Free Grid (three.js): samme skitse som 3D-legemer. W3(x,y,z) = rummets punkt for linsens koordinater, Q = drejning (x→højre, y→op, z→væk fra lærredet) */
function pkQuat(n3,V3,F3){return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(n3,V3,F3.clone().negate()))}
const PK3C={cab:0xDDE3E9,foot:0xAEB9C4,lens:0xC5CDD5,cap:0xC5CDD5,ring:0xA3AEB9,glass:0x2B4860,deco:0x8995A2};   // samme farver som .pk-* i styles.css
/* Skitse-streger til Free Grid: kanter på kabinet/fødder/optik, ringe på cylindre og striber i gitrene – som i boks 08/09/10.
   Regnes én gang pr. model (linsens koordinater, cache) og samles i ét LineSegments-objekt pr. projektor (ét draw call). */
const PKL=new WeakMap();
function pkLines(M){if(PKL.has(M))return PKL.get(M);const a=[],seg=(p,q)=>a.push(p.x,p.y,p.z,q.x,q.y,q.z),P=(x,y,z)=>({x,y,z}),ax=['x','y','z'];
  for(const p of M){if(p.hid||p.c==='glass')continue;const b=p.b;
    if(p.t==='box'){const xs=[b.x0,b.x1],ys=[b.y0,b.y1],zs=[b.z0,b.z1];
      for(const y of ys)for(const z of zs)seg(P(b.x0,y,z),P(b.x1,y,z));for(const x of xs)for(const z of zs)seg(P(x,b.y0,z),P(x,b.y1,z));for(const x of xs)for(const y of ys)seg(P(x,y,b.z0),P(x,y,b.z1));continue}
    if(p.t==='cyl'){const A=p.axis,[U,V]=ax.filter(k=>k!==A),c={},r={};for(const k of[U,V]){c[k]=(b[k+'0']+b[k+'1'])/2;r[k]=(b[k+'1']-b[k+'0'])/2}const n=24;
      for(const e of[b[A+'0'],b[A+'1']])for(let i=0;i<n;i++){const t0=i/n*2*Math.PI,t1=(i+1)/n*2*Math.PI,q0={},q1={};q0[A]=q1[A]=e;q0[U]=c[U]+r[U]*Math.cos(t0);q0[V]=c[V]+r[V]*Math.sin(t0);q1[U]=c[U]+r[U]*Math.cos(t1);q1[V]=c[V]+r[V]*Math.sin(t1);seg(q0,q1)}
      continue}
    if(p.t==='deco'&&(p.k==='slats'||p.k==='dots'||p.k==='seam')){const [N,sg]=p.n,w=b[N+(sg>0?'1':'0')]+sg*.003,L=p.al&&p.al!==N?p.al:ax.find(k=>k!==N),O=ax.find(k=>k!==N&&k!==L);
      const mk=(l,o)=>{const q={};q[N]=w;q[L]=l;q[O]=o;return q};
      if(p.k==='seam'){const q0={},q1={};q0[N]=q1[N]=w;for(const k of[L,O]){q0[k]=b[k+'0'];q1[k]=b[k+'1']}seg(q0,q1);continue}
      const st=p.k==='dots'?.008:.011,o0=b[O+'0'],o1=b[O+'1'],ins=.004;if(o1-o0<.006)continue;
      for(let o=o0+st/2;o<o1;o+=st)seg(mk(b[L+'0']+ins,o),mk(b[L+'1']-ins,o))}}
  const f=new Float32Array(a);PKL.set(M,f);return f}
function pkThree(M,W3,Q,sel){const g=new THREE.Group();let cab=null;
  {const L=pkLines(M),pos=new Float32Array(L.length);for(let i=0;i<L.length;i+=3){const w=W3(L[i],L[i+1],L[i+2]);pos[i]=w.x;pos[i+1]=w.y;pos[i+2]=w.z}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));g.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x4F5B67})))}
  for(const p of M){if(p.hid)continue;let b=p.b,col;
    if(p.t==='deco'){if(!['slats','dots','panel','handle','win'].includes(p.k))continue;const [a,sg]=p.n;b={...b};b[a+(sg>0?'0':'1')]+=sg*.0005;b[a+(sg>0?'1':'0')]+=sg*.0025;col=p.k==='win'?PK3C.glass:PK3C.deco}
    else col=p.cab&&sel?0xBFD6EC:(PK3C[p.c]??PK3C.lens);
    const sx=Math.max(b.x1-b.x0,.001),sy=Math.max(b.y1-b.y0,.001),sz=Math.max(b.z1-b.z0,.001);let geo;
    if(p.t==='cyl'){geo=new THREE.CylinderGeometry(.5,.5,1,24);const ax=p.axis;
      if(ax==='y')geo.scale(sx,sy,sz);else if(ax==='z'){geo.scale(sx,sz,sy);geo.rotateX(Math.PI/2)}else{geo.scale(sy,sx,sz);geo.rotateZ(Math.PI/2)}}
    else geo=new THREE.BoxGeometry(sx,sy,sz);
    const me=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:col,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));me.position.copy(W3((b.x0+b.x1)/2,(b.y0+b.y1)/2,(b.z0+b.z1)/2));me.quaternion.copy(Q);g.add(me);
    if(p.cab)cab=me}
  return {g,cab}}
