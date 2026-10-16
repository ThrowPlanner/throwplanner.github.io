/* ===== BEREGNING ===== */
// lærredets vandrette placering (midte, m fra rummets midte) – kan trækkes i «Lokalet set bagfra»; plantegning/immersive: altid i midten
const SX=()=>{try{return S.venue!=='immersive'&&!planActive()?(S.sx||0):0}catch(e){return 0}};
// stacking (boks 05): flere projektorer på samme billede – ældre projekter uden stackOn er slået til, hvis stack > 1
const stackOn=()=>S.stackOn??((S.stack||1)>1);
// flyrammens grænse for stacking (loft/gulv) – null uden Panasonic-ramme
const stackLim=()=>{if(!S.frame)return null;const f=FRAMES.find(f=>f.id===S.frameId);return f&&f.stk?{id:f.id,max:f.stk[S.ceil?0:1]}:null};
const stackOver=n=>{const L=stackLim();return L&&n>L.max?L:null};
const stackN=()=>stackOn()&&S.venue!=='immersive'?Math.max(2,Math.min(4,Math.round(S.stack||2))):1;
/* Keystone-korrektion pr. model/optik ifølge Panasonics specifikationer (docs.connect.panasonic.com m.fl.).
   «Sikker» værdi: optikkens egen grænse hvis oplyst, ellers modellens basisværdi; ukendt → den mest forsigtige værdi
   fra en sammenlignelig optik/model. Lodret og vandret tilsammen højst 55° (anvendes på alle modeller for en sikkerheds skyld). */
const KSD={
  RQ25:{b:[45,40],l:{'D75LE10':[40],'D3LEW10':[40],'D75LE20':[40],'D3LES20':[40],'D3LES250':[40],'D75LE6':[28,15],'D3LEW60':[28,15],'D3LEW600':[28,15],'D3LEW300':[15,5],'D3LEW50':[22,15],'D3LEW200':[15,5],'D3LEW201':[15,5],'D3LEU100':[8,5],'D3LEU101':[8,5],'D75LE95':['+5',0]}},
  RQ45:{b:[45,40],l:{'D3LEW10':[40],'D3LES20':[40],'D3LES250':[40],'D3LEW60':[28,15],'D3LEW600':[28,15],'D3LEW50':[22,15],'D3LEW201':[15,5],'D3LEW300':[15,5],'D3LEU101':[8,5],'D75LE95':['+5',0]}},
  HTQ:{b:[40,40],like:'RQ45'},
  RQ50:{b:[40,40],l:{'D3QW300':[28,15],'D3QW200':[15,5,1]}},
  REQ:{b:[40,40],l:{'C1W500':[22,15],'C1W400':[14,8,1],'C1W300':[14,8,1],'C1U090':[5,3],'C1U100':[5,3],'C1U200':[5,0,1]}},
  RQ7:{b:[45,40],l:{'DLE020':[5,0],'DLE035':['+5',0],'DLE060':[16,10],'DLE055':[22,15],'DLE085':[22,15],'DLE105':[22,15],'DLE150':[40],'DLE170':[40],'DLE250':[40]}},
  MZ20:{b:[45,40],l:{'EMU100':[5,0],'EMW200':[14,8],'EMW300':[14,8],'EMW400':[22,15],'EMW500':[22,15]}},
  MZ882:{b:[25,30],l:{'ELW21':[22,15],'ELW22':[22,15],'ELU20':[5,0],'ELW20':[22,15,1],'ELT22':[22,15,1],'ELT23':[22,15,1]}},
  FR:{b:[40,20]},VM:{b:[25,35]},TMZ:{b:[15,15]},CMZ:{b:[3,3]},VW:{b:[15,15],safe:1}};
function ksKey(name){const n=name.toUpperCase();
  if(/RQ50K/.test(n))return 'RQ50';if(/RQ45K|RZ44K/.test(n))return 'RQ45';if(/HTQ20/.test(n))return 'HTQ';if(/RQ35K|RZ34K|RQ25K|RZ24K|RQ18K|RZ17K/.test(n))return 'RQ25';
  if(/RE[QZ]\d/.test(n))return 'REQ';if(/R[QZ][67]L/.test(n))return 'RQ7';if(/MZ\d+KL/.test(n))return 'MZ20';if(/MZ[678]82/.test(n))return 'MZ882';if(/FR[QZ]/.test(n))return 'FR';
  if(/VMQ|VMZ|LMZ/.test(n))return 'VM';if(/TMZ/.test(n))return 'TMZ';if(/CMZ/.test(n))return 'CMZ';if(/VW5/.test(n))return 'VW';return null}
function ksLim(m,ln){const k=ksKey(m.m);if(!k)return null;const d=KSD[k];const tab=d.l||(d.like&&KSD[d.like].l)||{};let v=d.b[0],h=d.b[1],vmin=-v,safe=!!d.safe;
  for(const t in tab){if(ln[0].toUpperCase().includes(t)){const e=tab[t];if(e[0]==='+5'){v=Math.min(v,5);vmin=0}else{v=Math.min(v,e[0]);vmin=-v}if(e[1]!=null)h=Math.min(h,e[1]);if(e[2])safe=true;break}}
  vmin=Math.max(vmin,-v);return {vmin,vmax:v,h,cap:55,safe}}
// ultrakort kast (UST): Panasonics «u»-kabinet eller throw ratio under 0,5:1
const isUST=(row,aw,ah,kind)=>kind==='u'||row[0]*Math.hypot(aw,ah)/(IN*aw)<.5;
function calc(){
  const m=M(),ln=LN();
  let ai=aiFor(m);const aspOK=ai>=0;if(!aspOK)ai=0;
  // portræt: projektoren drejes 90° – billedet står på højkant, lens shift/offset/keystone og kabinet drejes med
  const PT=!!S.portrait&&S.venue!=='immersive';
  const row=ln[2][ai],fixed=ln[1]==='F';let [aw,ah]=ratioOf(m.asp[ai]);if(PT)[aw,ah]=[ah,aw];
  const N=S.blend?Math.max(1,Math.round(S.bc)):1, R=S.blend?Math.max(1,Math.round(S.br)):1, o=S.blend?Math.min(.5,Math.max(0,S.ov/100)):0;
  const kx=N-(N-1)*o, ky=R-(R-1)*o;
  const W=S.cw/kx, H=W*ah/aw, CW=S.cw, CH=H*ky;
  const D=Math.hypot(W,H)/IN;
  const Lw=distAt(row,D,0), Lt=distAt(row,D,1);
  const z=fixed?0:zoomFor(row,D,S.L);
  const zoomOK=fixed?Math.abs(S.L-Lw)<=0.015*Lw:(z>=-0.002&&z<=1.002);
  const sizeOK=D>=row[4]-.5&&D<=row[5]+.5;
  const Dzw=diagFor(row,S.L,0),Dzt=diagFor(row,S.L,1);
  const cy=S.sb+CH/2, cx=SX(), inv=S.ceil?-1:1, off=PT?0:ln[4], offH=PT?ln[4]:0;
  const dX=S.px-cx, dY=S.py-cy;
  // edge blend: hver kolonne kan forskydes sidelæns for sig (S.bdx[c], m) – inden for sin egen lens shift
  const BD=c=>S.blend&&N>1?((S.bdx&&S.bdx[c])||0):0;
  // keystone: projektoren vippes – vippen tager en del af forskydningen, resten klares med lens shift (sv/sh = optikkens lens shift)
  // keystone (auto): bruges kun, når projektoren står uden for optikkens lens shift – inden for lens shift er keystone 0°
  const KL0=ksLim(m,ln),KL=KL0&&PT?{...KL0,vmin:-KL0.h,vmax:KL0.h,h:Math.min(KL0.vmax,-KL0.vmin)}:KL0,kon=!!(S.ks&&S.ks.on&&KL&&S.venue!=='immersive');
  const DEG=Math.PI/180,P=PT?ln[3].map(([a,b])=>[b,a]):ln[3];
  const needV=inv*(-dY)/H-off, needC=[...Array(N).keys()].map(c=>inv*(-(dX+BD(c)))/W-offH), dC=needC.map(v=>v-needC[0]);
  const ivAt=x=>{let lo=-Infinity,hi=Infinity;for(const d of dC){const iv=svInt(x+d,P);if(!iv)return null;lo=Math.max(lo,iv[0]);hi=Math.min(hi,iv[1])}return lo<=hi+1e-9?[lo,Math.max(lo,hi)]:null};
  let kv=0,kh=0,tv=0,thk=0,ksBad=false;
  if(kon){const iv0=ivAt(needC[0]);
    if(!(iv0&&needV>=iv0[0]-1e-9&&needV<=iv0[1]+1e-9)){
      const ang=(t,s)=>Math.atan(t*s/S.L)/DEG, okA=(a,b)=>a>=KL.vmin-1e-6&&a<=KL.vmax+1e-6&&Math.abs(b)<=KL.h+1e-6&&Math.abs(a)+Math.abs(b)<=KL.cap+1e-6;
      let best=null,bestAny=null;const consider=x=>{const iv=ivAt(x);if(!iv)return;const y=Math.max(iv[0],Math.min(iv[1],needV)),a=ang(needV-y,H),b=ang(needC[0]-x,W),c=a*a+b*b,ok=okA(a,b);
        if(!bestAny||c<bestAny.c)bestAny={x,y,a,b,c};if(ok&&(!best||c<best.c))best={x,y,a,b,c};
        if(!ok){// prøv punktet i intervallet nærmest grænsen, der overholder vinkelgrænserne
          for(const y2 of [iv[0],iv[1]]){const a2=ang(needV-y2,H),c2=a2*a2+b*b;if(okA(a2,b)&&(!best||c2<best.c))best={x,y:y2,a:a2,b,c:c2}}}};
      if(iv0)consider(needC[0]);for(let x=-2.5;x<=2.5001;x+=.005)consider(x);
      const pick=best||bestAny;if(pick){kv=pick.a;kh=pick.b;tv=needV-pick.y;thk=needC[0]-pick.x}ksBad=!best}}
  const th=thk+offH;
  const kr=(k,a)=>Math.cos(Math.abs(k*DEG)+a)/Math.cos(Math.abs(k*DEG)-a);
  const sv=needV-tv, sh=inv*(-dX)/W-th, shC=needC.map(v=>v-thk);
  const shAt=y=>shC.every(v=>shiftOK(v,y,P)||(kon&&(()=>{const iv=svInt(v,P);return iv&&y>=iv[0]-1e-6&&y<=iv[1]+1e-6})()));
  let shOK=!ksBad&&shAt(sv);
  const ksUse=kon&&(kv||kh)?ksFrac(kv,kh,sv,sh,W,H,S.L,aw,ah):1;
  const vr=svRange(sh,P); let pyRange=null;
  if(vr){let e0=vr[0]+off+tv,e1=vr[1]+off+tv;if(kon){const room=Math.max(0,KL.cap-Math.abs(kh));e0=vr[0]+off+Math.tan(Math.max(KL.vmin,-room)*DEG)*S.L/H;e1=vr[1]+off+Math.tan(Math.min(KL.vmax,room)*DEG)*S.L/H}
    const a=cy-inv*e0*H,b=cy-inv*e1*H;pyRange=[Math.min(a,b),Math.max(a,b)]}
  const dim=m.dim.map(v=>v/1000), prot=(ln[5]||0)/1000, kind=(ln[7]&&ln[7][0])||'n';
  // kabinet som boks i linsens koordinater: x til højre, y op, z væk fra lærredet (verden: afstand = L + z)
  let B;
  if(kind==='u'){const u=ln[7][1].map(v=>v/1000);B={x0:u[0],x1:u[1],y0:u[2],y1:u[3],z0:u[4],z1:u[5]}}           // ultrakort kast: kabinet mellem spejl og lærred (Panasonic RearProjPjBodyTable)
  else if(kind==='l'){const c=0.02;B={x0:-dim[0]/2,x1:dim[0]/2,y0:-(prot+dim[2]),y1:-prot,z0:c,z1:c+dim[1]}}   // L-formet linse: kabinet lodret under linsehovedet
  else B={x0:-dim[0]/2,x1:dim[0]/2,y0:-dim[1]/2,y1:dim[1]/2,z0:prot,z1:prot+dim[2]};
  const fd3=S.frame?[S.fw/1000,S.fh/1000,S.fd/1000]:dim;
  const fx=fd3[0],fy=kind==='l'?fd3[2]:fd3[1],fz=kind==='l'?fd3[1]:fd3[2];
  const bc=[(B.x0+B.x1)/2,(B.y0+B.y1)/2,(B.z0+B.z1)/2];
  let F=S.frame?{x0:bc[0]-fx/2,x1:bc[0]+fx/2,y0:bc[1]-fy/2,y1:bc[1]+fy/2,z0:bc[2]-fz/2,z1:bc[2]+fz/2}:{...B};
  const flip=b=>S.ceil?{x0:-b.x1,x1:-b.x0,y0:-b.y1,y1:-b.y0,z0:b.z0,z1:b.z1}:b;
  if(PT){const rot=b=>({x0:b.y0,x1:b.y1,y0:b.x0,y1:b.x1,z0:b.z0,z1:b.z1});B=rot(B);F=rot(F)}
  B=flip(B);F=flip(F);
  const body=[B.x1-B.x0,B.y1-B.y0,B.z1-B.z0], outer=[F.x1-F.x0,F.y1-F.y0,F.z1-F.z0];
  const bodyFront=S.L+B.z0, outFront=S.L+F.z0, outBack=S.L+F.z1;
  // stacking: enhed 0 sidder ved ophænget (loft: øverst, bord: nederst), de næste stables væk fra det med kabinettets/rammens højde
  // hver enhed rammer samme billede med lodret lens shift – alle skal kunne nå det
  const stk=stackN(), stkDir=S.ceil?-1:1, stkPitch=outer[1];
  for(let k=1;k<stk&&shOK;k++)shOK=shAt(sv+inv*(-stkDir*k*stkPitch)/H);
  const pjs=[];for(let s=0;s<stk;s++)for(let r=0;r<R;r++)for(let c=0;c<N;c++){
    const tx=cx-CW/2+W/2+c*W*(1-o), ty=cy+CH/2-H/2-r*H*(1-o);
    pjs.push({c,r,s,tx,ty,lx:tx+dX+BD(c),ly:ty+dY+stkDir*s*stkPitch})}
  const pitchX=W*(1-o), pitchY=H*(1-o);
  const clashX=N>1&&[...Array(N-1).keys()].some(c=>outer[0]>pitchX+BD(c+1)-BD(c)-1e-6), clashY=R>1&&stk*outer[1]>pitchY;
  const ys=pjs.map(p=>p.ly);const topY=Math.max(...ys)+F.y1, botY=Math.min(...ys)+F.y0;
  const xs=pjs.map(p=>p.lx);const leftX=Math.min(...xs)+F.x0, rightX=Math.max(...xs)+F.x1;
  const roomIssues=[];
  if(outBack>DEPTH())roomIssues.push(REAR()?'bagscenen er for lav':'for dybt');
  if(topY>S.rh)roomIssues.push('over loftet');
  if(botY<0)roomIssues.push('under gulvet');
  if(S.sb+CH>S.rh)roomIssues.push('lærred for højt');
  if(CW>S.rw||leftX<-S.rw/2||rightX>S.rw/2)roomIssues.push('for bredt');
  // publikum i lysstrålen (siddende hoved ~1,32 m)
  // publikum: siddende rækker (auditorium/teater) eller stående grupper (museum/immersive, hoved ~1,80 m)
  const stand=STAND(),headY=stand?1.8:1.32;let rows=[];
  if(S.venue==='theater')rows=TROWS();else if(S.venue==='immersive'){for(const u of [S.rd-2.6,S.rd-1.1])if(u>0.5)rows.push(u)}else for(let z0=S.r1;z0<=S.rd-0.7;z0+=stand?1.6:Math.max(.6,S.rp))rows.push(z0);
  if(NOCROWD()||S.venue==='golf')rows=[];
  const lowest=pjs.reduce((a,p)=>p.ly<a.ly?p:a,pjs[0]);
  const bottomEdge=r=>(r.ty-H/2);
  const hit=rows.filter(zr=>{const zh=zr+0.35;if(zh>=S.L)return false;return pjs.some(p=>{const b=p.ty-H/2;const y=b+(p.ly-b)*zh/S.L;return y<headY})});if(REAR()||S.venue==='immersive')hit.length=0;
  // taleren tættest på lærredet: skygger han, når han står foran lærredet? (ikke ved bagprojektion / immersive)
  const presZ=PZ(),presX=PXX(cx,CW),presBase=S.venue==='theater'?STH():0,presTop=presBase+1.76;
  // skygge: kroppen (±0,25 m) inden for strålen både på tværs og i højden ved talerens afstand
  const presHit=S.venue!=='immersive'&&S.venue!=='golf'&&!NOCROWD()&&!REAR()&&presZ<S.L&&pjs.some(p=>{const k=presZ/S.L,b=p.ty-H/2,t=p.ty+H/2,l=p.tx-W/2,rr=p.tx+W/2;
    const yb=b+(p.ly-b)*k,yt=t+(p.ly-t)*k,xl=l+(p.lx-l)*k,xr=rr+(p.lx-rr)*k;return yb<presTop&&yt>presBase&&xr>presX-0.25&&xl<presX+0.25});
  const pcr=S.pcr||m.cr;
  const amb=AMB();const lm=(m.lc||m.lm)*stk*ksUse, lux=lm/(W*H), nits=S.gain*lux/Math.PI, cr=(lux+amb)/(lux/pcr+amb);
  const blk=lux/pcr+amb, blk2=2*lux/pcr+amb, blk4=4*lux/pcr+amb, cr2=(lux+blk2)/blk2, cr4=(lux+blk4)/blk4;
  const [ew,eh]=effRes(PT?[m.res[1],m.res[0]]:m.res,aw,ah), pxW=Math.round(ew*kx), pxH=Math.round(eh*ky), ksLost=Math.round(ew*eh*(1-ksUse)), lm0=(m.lc||m.lm)*stk, bzPx=Math.round(ew*o);
  const seatsRow=stand?0:Math.max(0,Math.floor((S.rw-1.6-1.2)/0.56));
  return {m,ln,ai,aspOK,row,aw,ah,fixed,N,R,o,kx,ky,W,H,CW,CH,D,Lw,Lt,z,zoomOK,sizeOK,Dzw,Dzt,cy,cx,inv,off,dX,dY,sv,sh,P,shOK,pyRange,
    body,prot,outer,B,F,kind,bodyFront,outFront,outBack,pjs,shC,PT,offH,KL,kon,kv,kh,tv,th,ksUse,ksLost,lm0,ksBad,pitchX,pitchY,clashX,clashY,topY,botY,roomIssues,rows,hit,presHit,presZ,presX,stand,lm,lux,amb,pcr,stk,blk,blk2,blk4,cr2,cr4,nits,cr,ew,eh,pxW,pxH,bzPx,seatsRow};
}

