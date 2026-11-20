/* ===== Projektorskitse (boks 08, 09, 10 og detaljen for ultrakort kast) =====
   Kabinet og optik tegnes ud fra Panasonics officielle mål: kabinet m.dim (B×H×D, uden fødder), optik ln[8] (B×H×L),
   udragning ln[5] og UST-boksen ln[7][1]. Fødder, gitre, ringe og panel er generiske detaljer, der placeres efter målene
   (ingen Panasonic-tegninger eller -design). Kun til tegning – påvirker ikke beregningen.
   Koordinater som calc(): meter, linsen i (0,0,0), x til højre, y op, z væk fra lærredet. */
const PKC=new Map();
function pkModel(r){
  const m=r.m,ln=r.ln,kind=r.kind,lr=kind==='l'?(S.lrot||0)&3:0,flat=lr&1,PT=!!r.PT,CE=!!S.ceil;
  const key=[m.m,ln[0],kind,lr,CE?1:0,PT?1:0].join('|');if(PKC.has(key))return PKC.get(key);
  const [W,H,D]=m.dim,P=ln[5]||0,ld=Array.isArray(ln[8])&&ln[8].length===3?ln[8]:null,zoom=ln[1]==='Z',big=W>=540;
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),c0=20;
  // kabinettets lokale akser (X bredde, Y højde, Z dybde fra fronten) → linsens koordinater (mm), samme placering som calc()
  let f;
  if(kind==='l')f=flat?{o:{x:P,y:-H/2,z:c0+W/2},X:['z',-1],Y:['y',1],Z:['x',1]}:{o:{x:0,y:-P,z:c0+H},X:['x',1],Y:['z',-1],Z:['y',-1]};
  else if(kind==='u'){const u=ln[7][1],bz1=Math.min(u[5],u[4]+D),bx0=Math.max(u[0],Math.min(-W/2,u[1]-W));f={o:{x:bx0+W/2,y:u[2],z:bz1},X:['x',-1],Y:['y',1],Z:['z',-1],bz1,u}}
  else f={o:{x:0,y:-H/2,z:P},X:['x',1],Y:['y',1],Z:['z',1]};
  const L2W=(x,y,z)=>{const p={...f.o};p[f.X[0]]+=f.X[1]*x;p[f.Y[0]]+=f.Y[1]*y;p[f.Z[0]]+=f.Z[1]*z;return p};
  const bx=(a,b)=>({x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),y0:Math.min(a.y,b.y),y1:Math.max(a.y,b.y),z0:Math.min(a.z,b.z),z1:Math.max(a.z,b.z)});
  const LB=(x0,x1,y0,y1,z0,z1)=>bx(L2W(x0,y0,z0),L2W(x1,y1,z1));
  const FACE={'X+':[f.X[0],f.X[1]],'X-':[f.X[0],-f.X[1]],'Y+':[f.Y[0],f.Y[1]],'Z-':[f.Z[0],-f.Z[1]],'Z+':[f.Z[0],f.Z[1]]};
  const pr=[],box=(b,c,o={})=>pr.push({t:'box',b,c,...o}),deco=(fc,b,k,al)=>pr.push({t:'deco',b,n:FACE[fc],k,al:al||f.Z[0]});
  const cyl=(axis,c,d,a0,a1,cls,o={})=>{const b={};for(const a of['x','y','z']){if(a===axis){b[a+'0']=Math.min(a0,a1);b[a+'1']=Math.max(a0,a1)}else{b[a+'0']=c[a]-d[a]/2;b[a+'1']=c[a]+d[a]/2}}pr.push({t:'cyl',axis,b,c:cls,...o})};
  const sc=(d,k)=>Object.fromEntries(Object.entries(d).map(([a,v])=>[a,v*k]));
  // kabinet (officielle mål er uden fødder – fødderne står uden for)
  const fh=cl(H*.05,6,16),fw=cl(W*.07,22,55),fd=cl(D*.07,22,55);
  box(LB(-W/2,W/2,0,H,0,D),'cab',{cab:1});
  for(const sx of[-1,1])for(const zz of[.1,.9])box(LB(sx*W*.4-fw/2,sx*W*.4+fw/2,-fh,0,zz*D-fd/2,zz*D+fd/2),'foot');
  const lip=H*.86;
  for(const s of[-1,1]){const x=s*W/2,fc=s>0?'X+':'X-';deco(fc,LB(x,x,lip,lip,0,D),'seam');deco(fc,LB(x,x,H*.22,H*.74,D*.5,D*.93),'slats');if(big)deco(fc,LB(x,x,H*.3,H*.62,D*.06,D*.2),'slats')}
  // bagside: gitter og tilslutningspanel
  deco('Z+',LB(-W*.42,-W*.06,H*.2,H*.78,D,D),'slats',f.X[0]);deco('Z+',LB(W*.06,W*.42,H*.24,H*.66,D,D),'panel');deco('Z+',LB(-W/2,W/2,lip,lip,D,D),'seam');
  const lr0=(ld?Math.max(ld[0],ld[1]):Math.min(H*.55,W*.24))/2;
  if(kind==='n'){for(const s of[-1,1]){const a=s*(lr0+W*.05),b=s*(W/2-W*.05);if(Math.abs(b)-Math.abs(a)>W*.08)deco('Z-',LB(Math.min(a,b),Math.max(a,b),H*.2,H*.8,0,0),'dots')}
    deco('Z-',LB(-W/2,W/2,lip,lip,0,0),'seam');deco('Z-',LB(W*.45,W*.45,H*.92,H*.92,0,0),'led')}
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
    else{const top=Math.min(u[3],u[2]+H),hw=W*.36;   // indbygget spejl: hætte bagest på toppen
      if(u[3]-top>3)box({x0:xc-hw,x1:xc+hw,y0:top,y1:u[3],z0:u[5]-D*.26,z1:u[5]},'lens',{mir:[{x:xc,z:u[5]-4,y:u[3]-2},{x:xc,z:u[5]-D*.24,y:top+1}]});
      pr.push({t:'deco',b:{x0:xc-hw*.8,x1:xc+hw*.8,y0:u[3],y1:u[3],z0:u[5]-D*.25,z1:u[5]-D*.1},n:['y',1],k:'win'})}}
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
function pkOrtho(M,V,map){
  const o=map(0,0),e=map(1,0),s=Math.hypot(e[0]-o[0],e[1]-o[1])/1000,sw=pkR(Math.max(.5,Math.min(1.2,s*1.4)));
  const pt=(u,v)=>{const q=map(u,v);return pkR(q[0])+','+pkR(q[1])};
  const quad=(r,c)=>`<polygon points="${pt(r.u0,r.v0)} ${pt(r.u1,r.v0)} ${pt(r.u1,r.v1)} ${pt(r.u0,r.v1)}" class="${c}" stroke-width="${sw}"/>`;
  const ln=(u0,v0,u1,v1,c,w=sw)=>{const a=map(u0,v0),b=map(u1,v1);return `<line x1="${pkR(a[0])}" y1="${pkR(a[1])}" x2="${pkR(b[0])}" y2="${pkR(b[1])}" class="${c}" stroke-width="${pkR(w)}"/>`};
  const ell=(cu,cv,ru,rv,c,w=sw,n=20)=>{let q='';for(let i=0;i<n;i++){const t=i/n*2*Math.PI;q+=pt(cu+ru*Math.cos(t),cv+rv*Math.sin(t))+' '}return `<polygon points="${q}" class="${c}" stroke-width="${pkR(w)}"/>`};
  const R=b=>({u0:b[V.u+'0'],u1:b[V.u+'1'],v0:b[V.v+'0'],v1:b[V.v+'1'],d:V.sd>0?b[V.d+'1']:-b[V.d+'0']});
  const it=[];
  M.forEach((p,i)=>{if(p.t==='deco'){if(p.n[0]!==V.d||p.n[1]!==V.sd)return;it.push({p,i,r:R(p.b),d:R(p.b).d+1e-4});return}
    const r=R(p.b);it.push({p,i,r,ax:p.t==='cyl'&&p.axis===V.d,d:p.hid?1e9:r.d+(p.pri||0)*1e-4})});
  it.sort((a,b)=>a.d-b.d||a.i-b.i);
  let out='';const px=v=>v*1000*s;
  for(const {p,r,ax} of it){const W=px(r.u1-r.u0),H=px(r.v1-r.v0);
    if(p.t==='deco'){const k=p.k;
      if(k==='seam'){if(s>.12)out+=ln(r.u0,r.v0,r.u1,r.v1,'pk-ln',sw*.8);continue}
      if(k==='led'){if(s>.25)out+=ell(r.u0,r.v0,.003,.003,'pk-glass',sw*.6,8);continue}
      if(k==='win'){out+=quad(r,'pk-glass');continue}
      if(k==='handle'){if(s>.1)out+=quad(r,'pk-foot');continue}
      if(k==='panel'){if(s>.06)out+=quad(r,'pk-foot');if(s>.3){const n=5;for(let j=0;j<n;j++){const cu=r.u0+(r.u1-r.u0)*(j+.5)/n,rr=Math.min(.005,(r.u1-r.u0)/(n*2.6));out+=ell(cu,(r.v0+r.v1)/2,rr,rr,'pk-cab',sw*.7,8)}}continue}
      if(k==='slats'||k==='dots'){if(s<.06)continue;out+=quad(r,'pk-vent');const st=.009;
        if(k==='slats'&&s*9>=2.6){if(p.al===V.u){for(let v=r.v0+st/2;v<r.v1;v+=st)out+=ln(r.u0+.004,v,r.u1-.004,v,'pk-ln',sw*.7)}else{for(let u=r.u0+st/2;u<r.u1;u+=st)out+=ln(u,r.v0+.004,u,r.v1-.004,'pk-ln',sw*.7)}}
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
function pk3D(M,P3,lx,ly){
  const W=(x,y,z)=>P3(lx+x,ly+y,S.L+z),pts=a=>a.map(q=>pkR(q[0])+','+pkR(q[1])).join(' ');
  const face=(a,c)=>`<polygon points="${pts(a)}" class="${c}" stroke-width=".8"/>`;
  const it=M.filter(p=>!p.hid&&p.c!=='glass'&&(p.t!=='deco'||(p.n[0]==='z'&&p.n[1]>0))).map((p,i)=>({p,i,d:p.b.z1+(p.t==='deco'?1e-4:0)+(p.pri||0)*1e-4}));
  it.sort((a,b)=>a.d-b.d||a.i-b.i);
  let s='';
  for(const {p} of it){const b=p.b,z1=b.z1,z0=b.z0;
    if(p.t==='deco'){const q=[W(b.x0,b.y0,z1),W(b.x1,b.y0,z1),W(b.x1,b.y1,z1),W(b.x0,b.y1,z1)],sc=Math.abs(W(1,0,z1)[0]-W(0,0,z1)[0])/1000;
      if(p.k==='seam'){if(sc>.12)s+=`<line x1="${pkR(q[0][0])}" y1="${pkR(q[0][1])}" x2="${pkR(q[2][0])}" y2="${pkR(q[2][1])}" class="pk-ln" stroke-width=".7"/>`;continue}
      if(sc<.05)continue;
      s+=face(q,p.k==='slats'?'pk-vent':'pk-foot');
      if(p.k==='slats'&&sc*9>=2.6){const st=.009;for(let y=b.y0+st/2;y<b.y1;y+=st){const a=W(b.x0+.004,y,z1),c=W(b.x1-.004,y,z1);s+=`<line x1="${pkR(a[0])}" y1="${pkR(a[1])}" x2="${pkR(c[0])}" y2="${pkR(c[1])}" class="pk-ln" stroke-width=".6"/>`}}
      continue}
    const X0=lx+b.x0,X1=lx+b.x1,Y0=ly+b.y0,Y1=ly+b.y1,cls='pk-'+p.c;
    if(X0>0)s+=face([W(b.x0,b.y0,z0),W(b.x0,b.y1,z0),W(b.x0,b.y1,z1),W(b.x0,b.y0,z1)],'pk-side');
    if(X1<0)s+=face([W(b.x1,b.y0,z0),W(b.x1,b.y1,z0),W(b.x1,b.y1,z1),W(b.x1,b.y0,z1)],'pk-side');
    if(Y1<1.6)s+=face([W(b.x0,b.y1,z0),W(b.x1,b.y1,z0),W(b.x1,b.y1,z1),W(b.x0,b.y1,z1)],'pk-top');
    else if(Y0>1.6)s+=face([W(b.x0,b.y0,z0),W(b.x1,b.y0,z0),W(b.x1,b.y0,z1),W(b.x0,b.y0,z1)],'pk-side');
    if(p.t==='cyl'&&p.axis==='z'){const cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2,rx=(b.x1-b.x0)/2,ry=(b.y1-b.y0)/2,q=[];for(let k=0;k<20;k++){const t=k/20*2*Math.PI;q.push(W(cx+rx*Math.cos(t),cy+ry*Math.sin(t),z1))}s+=face(q,cls)}
    else s+=face([W(b.x0,b.y0,z1),W(b.x1,b.y0,z1),W(b.x1,b.y1,z1),W(b.x0,b.y1,z1)],cls)}
  return `<g class="pk">${s}</g>`}
