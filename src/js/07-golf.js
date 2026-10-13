/* ===== GOLF SIM: golfsimulator med TrackMan – spiller, sving, slagmåtte og skygge ===== */
// koordinater: x fra lokalets midte (+ = højre set bagfra), y op fra gulvet, z fra lærredsvæggen
// svinget er forenklet som en cirkel (svingradius R) i et skråt svingplan (vinkel th) gennem bolden – køllehovedets bane
const GDEF={v:2,pose:0,h:1.78,R:1.6,th:60,hand:'R',tee:3.0,tm:'auto',matW:3.0,matD:1.8};
// v2: svingcirklen går gennem bolden og skuldrene (centrum = skuldermidten) – ældre gemte værdier (R 1,75 m / 55°) opdateres
const GS=()=>{if(S.golf&&S.golf.v!==2)S.golf={...S.golf,R:Math.round(1.6*(S.golf.h||1.78)/1.78*100)/100,th:60,v:2};return Object.assign({},GDEF,S.golf||{})};
// TrackMan iO: monteringshøjde pr. version (offentlig installationsvejledning) og placering ~1 m bag tee
const TMV={LOW:[2.70,2.90],MID:[2.85,3.05],HIGH:[3.00,3.20]},IO={w:.46,d:.36,h:.12,dz:1.0};
const GKEEP=['frame','amb','rw','rd','rh','cw','sb','ceil','blend','portrait','sx','ak','cat','mi','li','L','py','px','content','lockL','lockW'];
function golfEnter(){S.preGolf={};GKEEP.forEach(k=>S.preGolf[k]=S[k]===undefined?null:JSON.parse(JSON.stringify(S[k])));
  S.golf=Object.assign({},GDEF,S.golf||{});
  Object.assign(S,{frame:false,amb:30,rw:5,rd:6.5,rh:3.2,cw:3.6,sb:0.3,ceil:true,blend:false,portrait:false,sx:0,ak:'16:10',cat:3,lockL:false,lockW:false,content:'golf',L:5.0});
  if(!MODELS[S.mi]||MODELS[S.mi].c!==3){const i=MODELS.findIndex(m=>m.m==='PT-VMZ82');S.mi=i>=0?i:MODELS.findIndex(m=>m.c===3);S.li=0;S.pcr=null;frameDefaults()}
  fillCats();fillModels();fillLens();fitLens();zeroShift()}
function golfLeave(){const p=S.preGolf,m0=S.mi;if(p){GKEEP.forEach(k=>{if(p[k]!==null&&p[k]!==undefined)S[k]=p[k]});delete S.preGolf}if(S.content==='golf')S.content='none';if(S.mi!==m0)frameDefaults()}
const gArea=p=>{let a=0;for(let i=0;i<p.length;i++){const q=p[i],w=p[(i+1)%p.length];a+=q[0]*w[1]-w[0]*q[1]}return Math.abs(a)/2};
function gClip(poly,x0,x1,y0,y1){let o=poly;const ed=[[p=>p[0]>=x0,(a,b)=>[x0,a[1]+(x0-a[0])/(b[0]-a[0])*(b[1]-a[1])]],[p=>p[0]<=x1,(a,b)=>[x1,a[1]+(x1-a[0])/(b[0]-a[0])*(b[1]-a[1])]],
    [p=>p[1]>=y0,(a,b)=>[a[0]+(y0-a[1])/(b[1]-a[1])*(b[0]-a[0]),y0]],[p=>p[1]<=y1,(a,b)=>[a[0]+(y1-a[1])/(b[1]-a[1])*(b[0]-a[0]),y1]]];
  for(const [inn,cut] of ed){const src=o;o=[];for(let i=0;i<src.length;i++){const a=src[i],b=src[(i+1)%src.length],ia=inn(a),ib=inn(b);if(ia)o.push(a);if(ia!==ib)o.push(cut(a,b))}if(!o.length)break}return o}
// svingpositioner (t: 0 adresse · .2 baglæns · .42 top · .62 træf · .75 gennemsving · 1 finish) – mål i m for en spiller på 1,78 m
// d = væk fra bolden (vinkelret på sigtelinjen), y = op, w = mod målet (lærredet). Kolonner:
// t, skulderdrejning°, hoftedrejning°, skuldermidte d,y,w, hoftemidte d,y,w, venstre knæ d,y,w, højre knæ d,y,w, hæl-løft, hoved d,y (fra skuldermidte), hænder d,y,w, køllevinkel°, albuebøj (forreste, bageste)
const GPK=[
 [0,    0,  0, .77,1.39,  0, 1.03,.93,  0, .84,.48,.20, .84,.48,-.20,  0, -.11,.15,  .60, .80, .04,   0, .02,.05],
 [.2,  45, 20, .78,1.40,-.01,1.03,.93,-.01,.81,.48,.18, .85,.48,-.20,  0, -.11,.15,  .82,1.05,-.45, -75, .02,.08],
 [.42, 90, 45, .80,1.42,-.03,1.03,.94,-.03,.76,.47,.14, .86,.49,-.21,  0, -.11,.15, 1.02,1.88,-.30,-212, .02,.22],
 [.62,-15,-40, .78,1.39, .06,1.00,.95, .08,.86,.50,.22, .76,.46,-.08,.03, -.10,.15,  .58, .82, .12,   8, .02,.06],
 [.75,-55,-65, .84,1.44, .12,1.00,.96, .14,.92,.50,.23, .80,.44,-.02,.07, -.07,.15,  .70,1.05, .50,  80, .06,.03],
 [1, -100,-90, .98,1.52, .18,1.00,.98, .20,.98,.50,.24, .88,.42, .08,.12, -.02,.16, 1.05,1.86, .15, 212, .18,.02]];
const gEase=u=>(1-Math.cos(Math.PI*Math.max(0,Math.min(1,u))))/2;
function gKey(t){for(let i=0;i<GPK.length-1;i++){const a=GPK[i],b=GPK[i+1];if(t<=b[0]||i===GPK.length-2){const u=gEase((t-a[0])/(b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u)}}}
const GPH=t=>t<.08?'Adresse':t<.36?'Baglæns sving':t<.5?'Top':t<.68?'Træf':t<.9?'Gennemsving':'Finish';
function golfPose(GC,t){const {bx,tz,s,h,th}=GC,k=h/1.78,W=(d,y,w)=>[bx+s*d*k,y*k,tz-w*k];
  const [tau,tauH,sd,sy,sw,hd,hy,hw,kLd,kLy,kLw,kTd,kTy,kTw,lift,hdd,hdy,Hd,Hy,Hw,al,bL,bT]=gKey(t);
  const R2=(a,w)=>[-w*Math.sin(a*RAD),w*Math.cos(a*RAD)];
  const sL=R2(tau,.2),sT=R2(tau,-.2),hL=R2(tauH,.16),hT=R2(tauH,-.16),nS=[-Math.cos(tau*RAD),-Math.sin(tau*RAD)],nH=[-Math.cos(tauH*RAD),-Math.sin(tauH*RAD)];
  const J={shL:W(sd+sL[0],sy,sw+sL[1]),shT:W(sd+sT[0],sy-.02,sw+sT[1]),hpL:W(hd+hL[0],hy,hw+hL[1]),hpT:W(hd+hT[0],hy,hw+hT[1]),
    knL:W(kLd,kLy,kLw),knT:W(kTd,kTy,kTw),anL:W(.95,.08,.25),anT:W(.95-lift*.5,.08+lift,-.25),toL:W(.78,.03,.29),toT:W(.78,.03,-.27),
    neck:W(sd+hdd*.4,sy+.05,sw),head:W(sd+hdd,sy+hdy,sw),hand:W(Hd,Hy,Hw)};
  const off=(c,n,dd)=>[c[0]+s*n[0]*dd*k,c[1],c[2]-n[1]*dd*k];
  J.torso=[off(J.shL,nS,.11),off(J.shL,nS,-.11),off(J.shT,nS,.11),off(J.shT,nS,-.11),off(J.hpL,nH,.1),off(J.hpL,nH,-.12),off(J.hpT,nH,.1),off(J.hpT,nH,-.12)];
  const lo=c=>[c[0],c[1]-.1*k,c[2]];J.pelvis=[...J.torso.slice(4),...J.torso.slice(4).map(lo)];
  J.face=off(J.head,nS,.13);
  const mid=(a,b,dn)=>[(a[0]+b[0])/2,(a[1]+b[1])/2-dn*k,(a[2]+b[2])/2];J.elL=mid(J.shL,J.hand,bL);J.elT=mid(J.shT,J.hand,bT);
  // køllen ligger i svingplanet: retning u(α) fra hænderne
  const c1=Math.cos(th),s1=Math.sin(th),u=a=>[-s*c1*Math.cos(a*RAD),-s1*Math.cos(a*RAD),-Math.sin(a*RAD)];
  const ball=[bx,.021,tz],H0=W(GPK[0][18],GPK[0][19],GPK[0][20]),Lc=Math.hypot(ball[0]-H0[0],ball[1]-H0[1],ball[2]-H0[2]);
  const ua=u(al);let ch=J.hand.map((v,i)=>v+Lc*ua[i]);
  // køllehovedet rammer bolden præcist ved adresse og træf
  const fix=tt=>{const p=gKey(tt),hh=W(p[17],p[18],p[19]),uu=u(p[20]);return ball.map((v,i)=>v-(hh[i]+Lc*uu[i]))};
  const wA=Math.max(0,1-t/.15),wI=Math.max(0,1-Math.abs(t-.62)/.1);if(wA>0){const f=fix(0);ch=ch.map((v,i)=>v+f[i]*wA)}if(wI>0){const f=fix(.62);ch=ch.map((v,i)=>v+f[i]*wI)}
  J.club=ch;J.ball=ball;J.k=k;J.t=t;return J}
function poseShadowPts(J){const k=J.k,o=[];const add=(q,r)=>{o.push([q[0]-r,q[1],q[2]],[q[0]+r,q[1],q[2]],[q[0],q[1]-r,q[2]],[q[0],q[1]+r,q[2]],[q[0],q[1],q[2]-r],[q[0],q[1],q[2]+r])};
  [['anL',.05],['anT',.05],['toL',.05],['toT',.05],['knL',.07],['knT',.07],['hand',.05],['elL',.05],['elT',.05],['neck',.06]].forEach(([n,r])=>add(J[n],r*k));
  add(J.head,.12*k);o.push(...J.torso,...J.pelvis);for(let i=0;i<=4;i++){const f=i/4;o.push(J.hand.map((v,j)=>v+(J.club[j]-v)*f))}return o}
/* spilleren tegnet med bløde, tilspidsede lemmer – sorteret efter dybde (malerens algoritme) */
const GCOL={shirt:['#EEF1F5','#B9C1CC'],pants:['#2E3644','#1C222B'],skin:['#DDA982','#B4835E'],shoe:['#F6F6F6','#CDD1D6'],cap:'#1B2940'};
function golferSVG(J,pr,ppm,dep){const k=J.k,parts=[],F=v=>v.toFixed(1);
  const centre=(dep(J.hpL)+dep(J.hpT)+dep(J.shL)+dep(J.shT))/4,col=(c,q)=>c[dep(q)<centre-.02?1:0],M2=(A,B,f=.5)=>A.map((v,i)=>v+(B[i]-v)*f);
  const cap=(A,B,ra,rb,c)=>{const a=pr(A),b=pr(B),r1=ra*k*ppm(A),r2=rb*k*ppm(B),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1e-6,nx=-dy/L,ny=dx/L;
    return `<path d="M${F(a[0]+nx*r1)},${F(a[1]+ny*r1)} L${F(b[0]+nx*r2)},${F(b[1]+ny*r2)} L${F(b[0]-nx*r2)},${F(b[1]-ny*r2)} L${F(a[0]-nx*r1)},${F(a[1]-ny*r1)} Z" fill="${c}"/><circle cx="${F(a[0])}" cy="${F(a[1])}" r="${F(r1)}" fill="${c}"/><circle cx="${F(b[0])}" cy="${F(b[1])}" r="${F(r2)}" fill="${c}"/>`};
  const L2=(A,B,ra,rb,c,dd=0)=>parts.push({d:(dep(A)+dep(B))/2+dd,g:()=>cap(A,B,ra,rb,col(c,M2(A,B)))});
  for(const sd of ['L','T']){const hp=J['hp'+sd],kn=J['kn'+sd],an=J['an'+sd],to=J['to'+sd],sh=J['sh'+sd],el=J['el'+sd];
    L2(hp,kn,.085,.064,GCOL.pants);L2(kn,an,.064,.046,GCOL.pants);L2(an,to,.052,.044,GCOL.shoe,.001);
    L2(sh,M2(sh,el,.55),.06,.052,GCOL.shirt,.002);L2(M2(sh,el,.5),el,.046,.042,GCOL.skin,.001);L2(el,J.hand,.042,.034,GCOL.skin,.002)}
  const poly=(ps,c,sw)=>{const h2=hull(ps.map(pr));return `<polygon points="${pts(h2)}" fill="${c}" stroke="${c}" stroke-width="${F(sw)}" stroke-linejoin="round"/>`};
  const sw=.05*k*ppm(J.shL);
  parts.push({d:centre-.001,g:()=>poly(J.pelvis,GCOL.pants[0],sw)});
  parts.push({d:centre,g:()=>{const a=pr(M2(J.hpL,J.hpT)),b=pr(M2(J.shL,J.shT));return poly(J.torso,GCOL.shirt[0],sw)+`<line x1="${F(a[0])}" y1="${F(a[1])}" x2="${F(b[0])}" y2="${F(b[1])}" stroke="#C9D0DA" stroke-width="${F(sw*.4)}" opacity=".6"/>`}});
  L2(J.neck,J.head,.05,.05,GCOL.skin,-.001);
  parts.push({d:dep(J.head),g:()=>{const c=pr(J.head),f=pr(J.face),r=.105*k*ppm(J.head),dx=f[0]-c[0],dy=f[1]-c[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
    return `<circle cx="${F(c[0])}" cy="${F(c[1])}" r="${F(r)}" fill="${GCOL.skin[0]}"/><path d="M${F(c[0]-r)},${F(c[1]-r*.1)} A${F(r)},${F(r)} 0 0 1 ${F(c[0]+r)},${F(c[1]-r*.1)} Z" fill="${GCOL.cap}"/>`+
      `<line x1="${F(c[0]+ux*r*.3)}" y1="${F(c[1]-r*.15)}" x2="${F(c[0]+ux*r*(.3+1.1*Math.min(1,L/r)))}" y2="${F(c[1]-r*.12)}" stroke="${GCOL.cap}" stroke-width="${F(Math.max(1.2,r*.28))}" stroke-linecap="round"/>`}});
  parts.push({d:(dep(J.hand)+dep(J.club))/2+.003,g:()=>{const a=pr(J.hand),b=pr(J.club),g=pr(M2(J.hand,J.club,.24)),r=Math.max(1.6,.05*k*ppm(J.club)),ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
    return `<line x1="${F(a[0])}" y1="${F(a[1])}" x2="${F(b[0])}" y2="${F(b[1])}" stroke="#A7B0BA" stroke-width="${F(Math.max(1,.012*ppm(J.club)))}" stroke-linecap="round"/><line x1="${F(a[0])}" y1="${F(a[1])}" x2="${F(g[0])}" y2="${F(g[1])}" stroke="#14171B" stroke-width="${F(Math.max(1.6,.024*ppm(J.hand)))}" stroke-linecap="round"/>`+
      `<ellipse cx="${F(b[0])}" cy="${F(b[1])}" rx="${F(r*1.2)}" ry="${F(r*.75)}" transform="rotate(${ang.toFixed(0)} ${F(b[0])} ${F(b[1])})" fill="#15171B" stroke="#59616B" stroke-width=".8"/>`+
      `<circle cx="${F(a[0])}" cy="${F(a[1])}" r="${F(.048*k*ppm(J.hand))}" fill="#F4F4F4"/>`}});
  if(J.t<.6)parts.push({d:dep(J.ball)-.01,g:()=>{const b=pr(J.ball);return `<circle cx="${F(b[0])}" cy="${F(b[1])}" r="${F(Math.max(1.6,.021*ppm(J.ball)))}" fill="#fff"/>`}});
  return parts.sort((a,b)=>a.d-b.d).map(p=>p.g()).join('')}
function golfCalc(r){const G=GS(),s=G.hand==='L'?1:-1,h=G.h,R=G.R,th=G.th*RAD,bx=r.cx,tz=G.tee;
  const hub=[bx+s*R*Math.cos(th),R*Math.sin(th),tz],e1=[-s*Math.cos(th),-Math.sin(th)];
  const ring=f=>{const o=[];for(let i=0;i<96;i++){const a=i/96*2*Math.PI,c=Math.cos(a);o.push([hub[0]+f*R*c*e1[0],hub[1]+f*R*c*e1[1],tz-f*R*Math.sin(a)])}return o};
  const arc=ring(1),disk=[...ring(1),...ring(.75),...ring(.5),hub];
  const t0=Math.max(0,Math.min(1,G.pose??0)),GC0={bx,tz,s,h,th},pose=golfPose(GC0,t0),body=poseShadowPts(pose);
  // TrackMan
  const tm=G.tm,io=tm!=='none'&&tm!=='TM4';let ver=null,yb=null,ioBad=false,drop=false;const maxB=S.rh-IO.h-.02;
  if(io){if(tm==='auto'){ver=maxB>=TMV.HIGH[0]?'HIGH':maxB>=TMV.MID[0]?'MID':maxB>=TMV.LOW[0]?'LOW':null;if(!ver){ver='LOW';ioBad=true}}else ver=tm;
    const [a,b]=TMV[ver];yb=Math.min(maxB,b);if(yb<a-1e-6)ioBad=true;drop=maxB>b+.05}
  const ioBox=io?{x0:bx-IO.w/2,x1:bx+IO.w/2,y0:yb,y1:yb+IO.h,z0:tz+IO.dz-IO.d/2,z1:tz+IO.dz+IO.d/2}:null;
  const t4z=tm==='TM4'?Math.min(tz+2.1,S.rd-.25):null;
  // skygge: kroppen og svinget projiceret fra hver projektors linse ind på lærredsvæggen (z = 0)
  const SC={x0:r.cx-r.CW/2,x1:r.cx+r.CW/2,y0:S.sb,y1:S.sb+r.CH},A=r.CW*r.CH;
  const proj=(p,q)=>{const d=S.L-q[2];if(d<.05)return null;const k=S.L/d;return [p.lx+(q[0]-p.lx)*k,p.ly+(q[1]-p.ly)*k]};
  const shBody=[],shSwing=[];let fBody=0,fSwing=0;
  r.pjs.forEach(p=>{const b=hull(body.map(q=>proj(p,q)).filter(Boolean)),w=hull(disk.map(q=>proj(p,q)).filter(Boolean));
    const ib=[p.tx-r.W/2,p.tx+r.W/2,p.ty-r.H/2,p.ty+r.H/2],cb=b.length>2?gClip(gClip(b,...ib),SC.x0,SC.x1,SC.y0,SC.y1):[],cw=w.length>2?gClip(gClip(w,...ib),SC.x0,SC.x1,SC.y0,SC.y1):[];
    if(cb.length>2){shBody.push(cb);fBody=Math.max(fBody,gArea(cb)/A)}if(cw.length>2){shSwing.push(cw);fSwing=Math.max(fSwing,gArea(cw)/A)}});
  // spillerens skygge: største over hele svinget (11 positioner)
  let fBodyMax=fBody;for(let i=0;i<=10;i++){const bp=poseShadowPts(golfPose(GC0,i/10));r.pjs.forEach(p=>{const bb=hull(bp.map(q=>proj(p,q)).filter(Boolean));if(bb.length<3)return;const c=gClip(gClip(bb,p.tx-r.W/2,p.tx+r.W/2,p.ty-r.H/2,p.ty+r.H/2),SC.x0,SC.x1,SC.y0,SC.y1);if(c.length>2)fBodyMax=Math.max(fBodyMax,gArea(c)/A)})}
  // kollisioner
  const inBox=(q,B,m=.05)=>q[0]>B.x0-m&&q[0]<B.x1+m&&q[1]>B.y0-m&&q[1]<B.y1+m&&q[2]>B.z0-m&&q[2]<B.z1+m;
  const top=Math.max(...arc.map(q=>q[1])),xs=arc.map(q=>q[0]),zs=arc.map(q=>q[2]);
  const pjBoxes=r.pjs.map(p=>({x0:p.lx+r.F.x0,x1:p.lx+r.F.x1,y0:p.ly+r.F.y0,y1:p.ly+r.F.y1,z0:S.L+r.F.z0,z1:S.L+r.F.z1}));
  const hitPj=pjBoxes.some(B=>disk.some(q=>inBox(q,B))),hitIO=!!ioBox&&disk.some(q=>inBox(q,ioBox));
  // TrackMan i lysstrålen: enhedens kasse inden for strålens pyramide (fra linsen til billedets hjørner)
  const inBeam=B=>r.pjs.some(p=>{if(B.z0>=S.L)return false;for(const z of [B.z0,(B.z0+B.z1)/2,Math.min(B.z1,S.L-.01)]){const k=z/S.L,yt=p.ty+r.H/2+(p.ly-p.ty-r.H/2)*k,yb2=p.ty-r.H/2+(p.ly-p.ty+r.H/2)*k,xl=p.tx-r.W/2+(p.lx-p.tx+r.W/2)*k,xr=p.tx+r.W/2+(p.lx-p.tx-r.W/2)*k;
    if(B.y0<yt&&B.y1>yb2&&B.x0<xr&&B.x1>xl)return true}return false});
  const ioBeam=!!ioBox&&inBeam(ioBox);
  const ck=[];const add=(l,t)=>ck.push({l,t});
  const need=tm==='TM4'?[3.0,3.65]:[2.5,3.0];
  if(tm!=='none')add(tz<need[0]-1e-6?'bad':tz<need[1]-1e-6?'warn':'ok',`Tee ${f2(tz)} m fra lærredet (krav mindst ${f2(need[0],1)} m, anbefalet ${f2(need[1],need[1]*10%1>.01?2:1)} m)`);
  if(io){if(ioBad)add('bad',tm==='auto'?`Loftet er for lavt til TrackMan iO (mindst ${f2(TMV.LOW[0]+IO.h+.02)} m)`:'Loftet er for lavt til den valgte iO-version');
    else add('ok',`TrackMan iO ${ver} i ${f2(yb)} m`);
    add(ioBeam?'bad':'ok',ioBeam?'TrackMan-enheden er i lysstrålen':'TrackMan-enheden er fri af lysstrålen')}
  if(tm==='TM4'){const d=t4z-tz;add(d<1.8-1e-6?'bad':d>2.9?'warn':'ok',`TrackMan 4 ${f2(d)} m bag bolden (krav ${f2(1.8,1)}–${f2(2.9,1)} m)`);if(S.rh<2.75)add('warn',`Loftet er lavere end anbefalet for TrackMan 4 (mindst ${f2(2.75)} m)`)}
  if(tm==='none')add('warn','Ingen TrackMan valgt');
  add(top>S.rh-.02?'bad':'ok',top>S.rh-.02?`Svinget rammer loftet (top ${f2(top)} m, loft ${f2(S.rh)} m)`:`Frihøjde over svinget ${fi((S.rh-top)*100)} cm (top ${f2(top)} m)`);
  if(hitPj)add('bad','Svinget rammer projektoren');
  if(hitIO)add('bad','Svinget rammer TrackMan-enheden');
  {const gap=Math.min(Math.min(...xs)+S.rw/2,S.rw/2-Math.max(...xs));add(gap<.05?'bad':gap<.3?'warn':'ok',gap<.05?'Svinget rammer sidevæggen':`Frit til sidevæggene: ${f2(gap)} m`)}
  if(Math.min(...zs)<.3)add('bad','Svinget kommer for tæt på lærredet');
  if(Math.min(G.matW,G.matD)<1.5-1e-6||Math.max(G.matW,G.matD)<1.8-1e-6)add('warn',`Måtten er mindre end slagområdet (mindst ${f2(1.5,1)} × ${f2(1.8,1)} m)`);
  if(tz+G.matD/2>S.rd+1e-6||Math.abs(bx)+G.matW/2>S.rw/2+1e-6||tz-G.matD/2<0)add('warn','Måtten er ikke inden for lokalet');
  add(fBodyMax>.0005?'warn':'ok',fBodyMax>.0005?`Spilleren skygger på billedet (${f2(fBodyMax*100,1)} % af billedet)`:'Ingen skygge fra spilleren');
  add(fSwing>.0005?'warn':'ok',fSwing>.0005?`Svinget skygger på billedet (${f2(fSwing*100,1)} % af billedet)`:'Ingen skygge fra svinget');
  return {G,s,h,R,th,bx,tz,hub,arc,disk,pose,t0,fBodyMax,body,ver,yb,ioBox,ioBad,ioBeam,drop,t4z,top,shBody,shSwing,fBody,fSwing,ck,hitPj,hitIO}}
/* default-indhold: egen stiliseret golfbane (ikke fra et rigtigt spil) med spil-HUD */
function golfScene(x,y,w,h,id){const X=u=>(x+u*w).toFixed(1),Y=v=>(y+v*h).toFixed(1),hz=.42,fs=Math.max(4,h*.05);
  let s=`<defs><linearGradient id="gsk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D8FD6"/><stop offset="1" stop-color="#CBE9F8"/></linearGradient><linearGradient id="gfw${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93D067"/><stop offset="1" stop-color="#57A63A"/></linearGradient><linearGradient id="grf${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4F8F3A"/><stop offset="1" stop-color="#3A7A2A"/></linearGradient></defs>`;
  s+=`<rect x="${x}" y="${y}" width="${w}" height="${(hz+.01)*h}" fill="url(#gsk${id})"/>`;
  for(const [u,v,a] of [[.18,.1,1],[.7,.07,.8],[.86,.16,.6],[.4,.18,.5]])s+=`<ellipse cx="${X(u)}" cy="${Y(v)}" rx="${w*.07*a}" ry="${h*.025*a}" fill="#fff" opacity=".85"/><ellipse cx="${X(u+.04*a)}" cy="${Y(v-.012)}" rx="${w*.045*a}" ry="${h*.025*a}" fill="#fff" opacity=".85"/>`;
  s+=`<path d="M${X(0)},${Y(hz)} Q${X(.12)},${Y(.32)} ${X(.3)},${Y(.385)} T${X(.62)},${Y(.36)} T${X(1)},${Y(.385)} L${X(1)},${Y(hz+.01)} L${X(0)},${Y(hz+.01)} Z" fill="#7FA48A"/>`;
  s+=`<rect x="${x}" y="${Y(hz)}" width="${w}" height="${(1-hz)*h}" fill="url(#grf${id})"/>`;
  for(let i=0;i<=46;i++){const u=i/46;if(u>.47&&u<.6)continue;s+=`<circle cx="${X(u)}" cy="${Y(hz-.004)}" r="${(w*.016*(1+.45*Math.sin(i*1.7))).toFixed(1)}" fill="${i%3?'#2F6B3A':'#26592F'}"/>`}
  const fw=[[.29,1],[.75,1],[.585,hz+.022],[.49,hz+.022]];s+=`<path d="M${X(.29)},${Y(1)} C${X(.36)},${Y(.7)} ${X(.44)},${Y(.55)} ${X(.49)},${Y(hz+.022)} L${X(.585)},${Y(hz+.022)} C${X(.6)},${Y(.55)} ${X(.68)},${Y(.72)} ${X(.75)},${Y(1)} Z" fill="url(#gfw${id})"/>`;
  for(let i=0;i<7;i+=2){const t0=i/7,t1=(i+1)/7,v=t=>hz+.022+(1-hz-.022)*t*t,l=t=>.49-(.49-.29)*t,rr=t=>.585+(.75-.585)*t;
    s+=`<polygon points="${X(l(t0))},${Y(v(t0))} ${X(rr(t0))},${Y(v(t0))} ${X(rr(t1))},${Y(v(t1))} ${X(l(t1))},${Y(v(t1))}" fill="#fff" opacity=".07"/>`}
  s+=`<ellipse cx="${X(.2)}" cy="${Y(.6)}" rx="${w*.1}" ry="${h*.04}" fill="#2E8BC7"/><ellipse cx="${X(.19)}" cy="${Y(.592)}" rx="${w*.06}" ry="${h*.012}" fill="#8FD0F2" opacity=".55"/>`;
  s+=`<ellipse cx="${X(.43)}" cy="${Y(.5)}" rx="${w*.03}" ry="${h*.011}" fill="#E9DDB0"/><ellipse cx="${X(.615)}" cy="${Y(.455)}" rx="${w*.02}" ry="${h*.007}" fill="#E9DDB0"/>`;
  s+=`<ellipse cx="${X(.537)}" cy="${Y(hz+.03)}" rx="${w*.034}" ry="${h*.009}" fill="#B2E88A"/><line x1="${X(.54)}" y1="${Y(hz+.03)}" x2="${X(.54)}" y2="${Y(hz-.035)}" stroke="#F4F4F4" stroke-width="${Math.max(.5,w*.002)}"/><polygon points="${X(.54)},${Y(hz-.035)} ${X(.556)},${Y(hz-.026)} ${X(.54)},${Y(hz-.017)}" fill="#E23B3B"/>`;
  for(const [u,v,k] of [[.03,.6,1.2],[.1,.5,.8],[.96,.55,1.3],[.89,.47,.8]])s+=`<rect x="${X(u-.006*k)}" y="${Y(v)}" width="${w*.012*k}" height="${h*.12*k}" fill="#5A3E2A"/><circle cx="${X(u)}" cy="${Y(v)}" r="${w*.05*k}" fill="#24552E"/><circle cx="${X(u-.02*k)}" cy="${Y(v+.03*k)}" r="${w*.035*k}" fill="#2D6838"/>`;
  s+=`<path d="M${X(.52)},${Y(.99)} Q${X(.6)},${Y(.05)} ${X(.538)},${Y(hz+.026)}" fill="none" stroke="#FFD23F" stroke-width="${Math.max(.6,w*.004)}" stroke-linecap="round" opacity=".9"/>`;
  s+=`<g style="font:700 ${fs.toFixed(1)}px system-ui,sans-serif"><rect x="${X(.02)}" y="${Y(.03)}" width="${w*.21}" height="${h*.13}" rx="${h*.015}" fill="#000" opacity=".5"/><text x="${X(.035)}" y="${Y(.085)}" fill="#fff">HOLE 7</text><text x="${X(.035)}" y="${Y(.14)}" fill="#BDE08F" style="font-size:${(fs*.8).toFixed(1)}px">PAR 4 · 385 m</text>`+
    `<rect x="${X(.77)}" y="${Y(.03)}" width="${w*.21}" height="${h*.13}" rx="${h*.015}" fill="#000" opacity=".5"/><text x="${X(.785)}" y="${Y(.085)}" fill="#fff">CARRY 231 m</text><text x="${X(.785)}" y="${Y(.14)}" fill="#9FD3FF" style="font-size:${(fs*.8).toFixed(1)}px">BALL 71 m/s</text></g>`;
  return s}
/* 09: slagmåtte på gulvet (tegnes før projektor/spiller) */
function golfFloor(P,GC){const {G,bx,tz}=GC,a=G.matW/2,z0=Math.max(0,tz-G.matD/2),z1=Math.min(S.rd,tz+G.matD/2),q=(x,z)=>P(x,0.012,z);
  let s=`<polygon points="${pts([q(bx-a,z0),q(bx+a,z0),q(bx+a,z1),q(bx-a,z1)])}" style="fill:#2E7D32;stroke:#1B4D1F" stroke-width="1.5"/>`;
  s+=`<polygon points="${pts([q(bx-a+.05,z0+.05),q(bx+a-.05,z0+.05),q(bx+a-.05,z1-.05),q(bx-a+.05,z1-.05)])}" fill="none" stroke="#7BC67E" stroke-width="1" opacity=".55"/>`;
  s+=`<polygon points="${pts([q(bx-.3,tz-.2),q(bx+.3,tz-.2),q(bx+.3,tz+.2),q(bx-.3,tz+.2)])}" style="fill:#43A047" opacity=".9"/>`;
  const sp=G.hand==='L'?1:-1;s+=`<polygon points="${pts([q(bx+sp*.3,tz-.6),q(bx+sp*1.2,tz-.6),q(bx+sp*1.2,tz+.6),q(bx+sp*.3,tz+.6)])}" fill="#000" opacity=".08"/>`;
  return s}
/* 09: spilleren set bagfra ned ad sigtelinjen (profil), køllen ved bolden */
function golferFront(P,sc,GC){return '<g class="golfer">'+golferSVG(GC.pose,q=>P(...q),q=>sc(q[2]),q=>q[2])+'</g>'}
function golfSwingFront(P,GC){const {arc,top,R,hub,tz}=GC,pp=arc.map(q=>P(...q));let s=`<g class="Lgsw" pointer-events="none"><polygon points="${pts(pp)}" style="fill:#F5A524;stroke:#F5A524" fill-opacity=".07" stroke-width="1.6" stroke-dasharray="7 4"/>`;
  const it=arc.reduce((a,q)=>q[1]>a[1]?q:a),T=P(...it),Hb=P(...hub);s+=`<circle cx="${Hb[0]}" cy="${Hb[1]}" r="2.5" fill="#F5A524"/><circle cx="${T[0]}" cy="${T[1]}" r="3.5" fill="#F5A524"/>`;
  s+=lbl(T[0],T[1]-14,`sving R ${f2(R)} m · top ${f2(top)} m`,'m')+'</g>';return s}
function golfUnitFront(P,GC,r){let s='';const {ioBox,ver,ioBeam,ioBad,t4z,bx}=GC;
  if(ioBox){const B=ioBox,c=(x,y,z)=>P(x,y,z),bad=ioBeam||ioBad||GC.hitIO,st=bad?'var(--bad)':'#8B95A3';
    if(B.y1<S.rh-.01){const a=c((B.x0+B.x1)/2,B.y1,(B.z0+B.z1)/2),b=c((B.x0+B.x1)/2,S.rh,(B.z0+B.z1)/2);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#5B6470" stroke-width="3"/>`}
    s+=`<polygon points="${pts([c(B.x0,B.y0,B.z0),c(B.x1,B.y0,B.z0),c(B.x1,B.y0,B.z1),c(B.x0,B.y0,B.z1)])}" style="fill:#1D2127;stroke:${st}" stroke-width="1"/>`;
    s+=`<polygon points="${pts([c(B.x0,B.y0,B.z1),c(B.x1,B.y0,B.z1),c(B.x1,B.y1,B.z1),c(B.x0,B.y1,B.z1)])}" style="fill:#2B3038;stroke:${st}" stroke-width="1.4"/>`;
    const m=c(bx,B.y0,B.z0+.06);s+=`<circle cx="${m[0]}" cy="${m[1]}" r="2.6" fill="#59C3FF"/>`;
    // navnet står øverst i tegningen (over loftkanten) med en stiplet linje ned til enheden – så det aldrig dækker målene
    const L0=c(bx,B.y1,(B.z0+B.z1)/2),ly=16;s+=`<line x1="${L0[0]}" y1="${ly+9}" x2="${L0[0]}" y2="${L0[1]}" style="stroke:${bad?'var(--bad)':'#8B95A3'}" stroke-width="1" stroke-dasharray="2 3" opacity=".8"/>`+lbl(L0[0],ly,`TrackMan iO ${ver}`,bad?'d':'m')}
  if(t4z!=null){const z=t4z,x=bx,c=(dx,y,dz)=>P(x+dx,y,z+dz);s+=`<polygon points="${pts([c(-.15,.04,-.03),c(.15,.04,-.03),c(.15,.32,-.08),c(-.15,.32,-.08)])}" style="fill:#2B3038;stroke:#8B95A3" stroke-width="1.2"/><polygon points="${pts([c(-.12,0,0),c(.12,0,0),c(.12,.04,-.03),c(-.12,.04,-.03)])}" fill="#14171B"/>`;
    const L0=c(.15,.32,-.08);s+=lbl(L0[0]+6,L0[1]-6,'TrackMan 4','m','start')}
  return s}
function golfShadowFront(GC,X,Y){let s='<g class="Lgsh" pointer-events="none" clip-path="url(#cclip)">';
  GC.shSwing.forEach(p=>s+=`<polygon points="${pts(p.map(([x,y])=>[X(x),Y(y)]))}" fill="#000" fill-opacity=".38" style="stroke:var(--bad)" stroke-width="1.2" stroke-dasharray="5 3"/>`);
  GC.shBody.forEach(p=>s+=`<polygon points="${pts(p.map(([x,y])=>[X(x),Y(y)]))}" fill="#000" fill-opacity=".62" style="stroke:var(--bad)" stroke-width="1.4"/>`);
  return s+'</g>'}
/* 10: snit – måtte, spiller set forfra, svingets ellipse, TrackMan, skyggens kegle og skyggen på lærredet */
function golfSide(X,Y,sc,r,GC){const {G,tz,h,R,th,hr,ioBox,t4z}=GC;let s='';
  s+=`<rect x="${X(Math.max(0,tz-G.matD/2))}" y="${Y(.03)-3}" width="${Math.min(G.matD,S.rd)*sc}" height="${.03*sc+3}" style="fill:#2E7D32"/>`;
  // skygge-kegle: fra linsen forbi spilleren/svinget ind på lærredet – klippet til lysstrålen
  const p0=r.pjs[0],ly=p0.ly,Lz=S.L,yt=Math.max(...r.pjs.map(p=>p.ty))+r.H/2,yb=Math.min(...r.pjs.map(p=>p.ty))-r.H/2;
  s+=`<clipPath id="gbeam"><polygon points="${X(Lz)},${Y(ly)} ${X(0)},${Y(yt)} ${X(0)},${Y(yb)}"/></clipPath>`;
  const ps=(q)=>{const d=Lz-q[0];if(d<.05)return null;return [0,ly+(q[1]-ly)*Lz/d]};
  const side2=a=>a.map(q=>[q[2],q[1]]);
  const vol=(pts2,c,op)=>{const pr=pts2.map(ps).filter(Boolean);if(!pr.length)return '';const hh=hull(pts2.filter(q=>q[0]<Lz-.05).concat(pr));
    const ys=pr.map(q=>q[1]),a=Math.max(yb,Math.min(...ys)),b=Math.min(yt,Math.max(...ys));
    return `<polygon points="${pts(hh.map(([z,y])=>[X(z),Y(y)]))}" fill="${c}" opacity="${op}"/>`+(b>a?`<rect x="${X(0)-1}" y="${Y(b)}" width="${.07*sc+3}" height="${(b-a)*sc}" style="fill:var(--bad)"/>`:'')};
  s+=`<g class="Lgsh" pointer-events="none"><g clip-path="url(#gbeam)">`+vol(side2(GC.disk),'#000',.22)+vol(side2(GC.body),'#000',.32)+`</g>`;
  {const ys=[];[...GC.disk,...GC.body].forEach(q=>{const v=ps([q[2],q[1]]);if(v)ys.push(v[1])});const a=Math.max(yb,Math.min(...ys)),b=Math.min(yt,Math.max(...ys));if(ys.length&&b>a)s+=lbl(X(0)+.07*sc+8,Y((a+b)/2),'skygge','d','start').replace('class="d"','class="d" style="fill:var(--bad);font-weight:700"')}
  s+='</g>';
  // TrackMan
  if(ioBox){const B=ioBox,bad=GC.ioBeam||GC.ioBad||GC.hitIO;s+=`<line x1="${X((B.z0+B.z1)/2)}" y1="${Y(B.y1)}" x2="${X((B.z0+B.z1)/2)}" y2="${Y(S.rh)}" stroke="#5B6470" stroke-width="3"/><rect x="${X(B.z0)}" y="${Y(B.y1)}" width="${(B.z1-B.z0)*sc}" height="${(B.y1-B.y0)*sc}" rx="2" style="fill:#2B3038;stroke:${bad?'var(--bad)':'#8B95A3'}" stroke-width="1.4"/><circle cx="${X(B.z0+.06)}" cy="${Y(B.y0)}" r="2.6" fill="#59C3FF"/>`;
    s+=`<polygon points="${X(B.z0+.06)},${Y(B.y0)} ${X(tz-.9)},${Y(0)} ${X(tz+.9)},${Y(0)}" fill="#59C3FF" opacity=".05"/>`;
    s+=lbl(X(B.z1),Y(S.rh+.28)-8,`TrackMan iO ${GC.ver} · ${f2(B.y0)} m`,bad?'d':'m','end')}
  if(t4z!=null){s+=`<polygon points="${X(t4z-.03)},${Y(.04)} ${X(t4z+.05)},${Y(.32)} ${X(t4z+.11)},${Y(.32)} ${X(t4z+.03)},${Y(.04)}" style="fill:#2B3038;stroke:#8B95A3" stroke-width="1.2"/>`+lbl(X(t4z)+10,Y(.5),`TrackMan 4 · ${f2(t4z-tz)} m`,'m','start')}
  // spiller (forfra) – kan trækkes langs gulvet
  s+=`<g class="ggrab"><title>Træk for at flytte spilleren (tee)</title><rect x="${X(tz-.5)}" y="${Y(h+.1)}" width="${sc}" height="${(h+.1)*sc}" fill="transparent"/>`+golferSVG(GC.pose,q=>[X(q[2]),Y(q[1])],()=>sc,q=>q[0])+'</g>';
  // svinget: cirklen i det skrå svingplan ses som en ellipse fra siden
  s+=`<g class="Lgsw" pointer-events="none"><ellipse cx="${X(tz)}" cy="${Y(R*Math.sin(th))}" rx="${R*sc}" ry="${R*Math.sin(th)*sc}" style="fill:#F5A524;stroke:#F5A524" fill-opacity=".07" stroke-width="1.6" stroke-dasharray="7 4"/>`+
    dimH(X(tz-R),X(tz),Y(R*Math.sin(th)),`R ${f2(R)} m`,null,null)+lbl(X(tz),Y(GC.top)-12,`top ${f2(GC.top)} m`,'m')+'</g>';
  s+=`<g class="Ldim">`+dimH(X(0),X(tz),Y(0)+82,`tee ${f2(tz)} m`,Y(0),Y(0)+4)+'</g>';
  return s}
function drawGolfPanel(GC){const on=!!GC;$('golfPanel').hidden=!on;document.querySelectorAll('[data-l9="gsw"],[data-l9="gsh"]').forEach(b=>b.hidden=!on);if(!on)return;const G=GC.G;
  const set=(id,v)=>{const el=$(id);if(document.activeElement!==el)el.value=v};
  set('gH',G.h.toFixed(2));set('gR',G.R.toFixed(2));set('gTh',Math.round(G.th));set('gTee',G.tee.toFixed(2));set('gMW',G.matW.toFixed(1));set('gMD',G.matD.toFixed(1));$('gTM').value=G.tm;set('gPose',Math.round(GC.t0*100));$('gPoseTxt').textContent=GPH(GC.t0);
  document.querySelectorAll('[data-ghand]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ghand===G.hand));
  $('gChk').innerHTML=GC.ck.map(c=>`<li class="${c.l}">${esc(c.t)}</li>`).join('')}

