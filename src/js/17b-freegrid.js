/* ===== FREE GRID – fane i boks 08 ved siden af Plantegning, i 3D =====
   Et tomt rum (bredde × længde × loftshøjde, sættes i boks 02) hvor man frit kan sætte flere projektorer ind – hver med egen model, optik, placering,
   retning, afstand, zoom, linsehøjde, lens shift og evt. top/down (lodret ned på gulv eller bord). De påvirker ikke appens egen projektor.
   Mens fanen er åben, viser og ændrer boks 01, 02, 05 og 07 den valgte Free Grid-projektor (appens egne tal gemmes og lægges tilbage).
   Hver projektor har også boks 05: portrait mode, edge blend (vandret × lodret, overlap, beregn antal automatisk), stacking og buet lærred.
   En projektor med edge blend er et sæt projektorer side om side (parallelle, samme afstand); punktet X/Y/linsehøjde er sættets midte.
   Kast: Panasonics formel L = A·D + B (samme optikrækker som appen). Lodret shift holdes inden for optikkens shift-polygon (som calc).
   Buet lærred: grænser fra CURV (26-curved.js, manualernes «projection range»-tabel), som i boks 05.
   3D: three.js r128 fra web/warp-three.js (samme fil som Warp), hentes først når fanen åbnes (artifactet skal have filen med).
   Projektfilen (17-project-file.js) gemmer Free Grid under «freegrid» (modeller og optikker også ved navn). */
const FG={tab:'plan',w:20,d:20,hgt:6,grid:1,snap:false,view:'3d',pjs:[],sel:-1};
const FGC=['#E8833A','#2F7FC1','#2E9E6A','#B5539C','#C9A227','#3FA3A5','#D0563B','#7A6BD1'],FGR=Math.PI/180;
const fgCol=i=>FGC[i%FGC.length],fgCl=(v,a,b)=>Math.max(a,Math.min(b,v)),fgR3=v=>Math.round(v*1000)/1000;
// formatets række for optikken (som calc: formatet fra 01, ellers modellens første); portræt: billedet står på højkant
function fgRow(m,ln,pt){let ai=aiFor(m);if(ai<0||!ln[2][ai]||!(ln[2][ai][0]>0))ai=ln[2].findIndex(r=>r[0]>0);if(ai<0)ai=0;let [aw,ah]=ratioOf(m.asp[ai]);if(pt)[aw,ah]=[ah,aw];return {row:ln[2][ai],aw,ah,hy:Math.hypot(aw,ah),asp:m.asp[ai]}}
// lens shift-områder (andel af billedet) fra optikkens shift-polygon (drejet i portræt, som calc): lodret ved et givet vandret shift og omvendt
const fgP=(ln,pt)=>{const P=ln[3]||[];return pt?P.map(([a,b])=>[b,a]):P};
const FGSV={},FGSH={};
function fgSvR(m,ln,pt,sh=0){if(Object.keys(FGSV).length>3000)for(const k in FGSV)delete FGSV[k];const q=sh.toFixed(3),k=m.m+'|'+ln[0]+'|'+(pt?1:0)+'|'+q;if(!FGSV[k])FGSV[k]=svRange(+q,fgP(ln,pt))||[0,0];return FGSV[k]}   // regnes for den afrundede værdi (= nøglen), så svaret ikke afhænger af, hvad der blev regnet først
function fgShR(m,ln,pt,sv=0){if(Object.keys(FGSH).length>3000)for(const k in FGSH)delete FGSH[k];const q=sv.toFixed(3),k=m.m+'|'+ln[0]+'|'+(pt?1:0)+'|'+q;if(!FGSH[k])FGSH[k]=shRange(+q,fgP(ln,pt))||[0,0];return FGSH[k]}
const fgBl=p=>p.bl&&p.bl.on?p.bl:null,fgStk=p=>p.st&&p.st.on?fgCl(Math.round(p.st.k||2),2,4):1;
/* kabinettets dybde (Dp) og linsens afstand fra kabinettets midte mod lærredet (Lo). Ultrakort kast (ET-DLE035, ET-C1U200 …) skyder bagud:
   spejlet sidder bagest, og kabinettet står mellem spejl og lærred (Panasonic RearProjPjBodyTable, som calc) → Lo er negativ */
// ul: optikken som boks (officielle mål fra TDC, felt 8), c = afstand fra linsepunktet til optikkens midte mod lærredet
function fgBz(m,ln){const k=ln&&ln[7],Dp=m.dim[2]/1000,ld=Array.isArray(ln&&ln[8])?ln[8].map(v=>v/1000):null,prot=(ln&&ln[5]||0)/1000;
  if(k&&k[0]==='u'&&k[1]){const z0=k[1][4]/1000,z1=k[1][5]/1000,D=Dp,len=z1-(z0+D);   // kabinet = TDC-dybden fra fronten (z0); optikken rager len ud bagved (som calc). Indbygget spejl: kabinettet kan række bag spejlpunktet
    return {Dp:D,Lo:z0+D/2,top:Math.max(z1,z0+D),bot:z0,ul:len>.005?{len,c:len/2-z1,w:ld?ld[0]:Math.min(.22,m.dim[0]/1000*.45),h:Math.min(ld?ld[1]:.2,(k[1][3]-k[1][2])/1000)}:null}}
  // almindelig optik: rager prot frem foran kabinettet (som calc: kabinettet starter prot bag linsen)
  if((!k||k[0]==='n')&&prot>.005)return {Dp,Lo:Dp/2+prot,top:Dp+prot,bot:0,ul:{len:prot,c:-prot/2,w:ld?ld[0]:Math.min(.16,m.dim[0]/1000*.4),h:ld?ld[1]:Math.min(.16,m.dim[1]/1000*.6)}};
  return {Dp,Lo:Dp/2,top:Dp,bot:0,ul:null}}
function fgSpec(p){const m=MODELS[p.mi],ln=m.L[p.li]||m.L[0],pt=!!p.port,{row,aw,ah,hy,asp}=fgRow(m,ln,pt),fixed=ln[1]==='F',z=fixed?0:fgCl(p.z,0,1);
  const D=diagFor(row,p.L,z),W=D*IN*aw/hy,H=D*IN*ah/hy,ok=D>=row[4]-.5&&D<=row[5]+.5;
  // afstande ved denne zoom, hvor billedet har optikkens mindste/største diagonal
  const a=distAt(row,row[4],z),b=distAt(row,row[5],z);
  // edge blend: c × r billeder med overlap o – det samlede billede er W·kx × H·ky (som calc)
  const bl=fgBl(p),c=bl?bl.c:1,r=bl?bl.r:1,o=bl?fgCl(bl.ov/100,0,.5):0,kx=c-(c-1)*o,ky=r-(r-1)*o,stk=fgStk(p);
  // billedets midte: linsehøjde + (shift + optikkens offset) × billedhøjde (loftmonteret: vendt om; portræt: intet lodret offset – som calc)
  // vandret shift: billedets midte flyttes sh × billedbredde til højre for optikken
  // top/down: projektoren peger lodret ned, billedet ligger på gulvet (linsehøjde = afstand); lodret shift flytter billedet frem/tilbage (fo) langs gulvet
  const dn=!!p.down,sh=p.sh||0,svR=fgSvR(m,ln,pt,sh),off=pt?0:(ln[4]||0),sg=dn?1:p.inv?-1:1,sv=fgCl(p.sv||0,svR[0],svR[1]),fh=dn?fgFh(p):0,yc=dn?fh+.03:p.h+sg*(sv+off)*H;
  const B=m.dim[0]/1000,Hb=m.dim[1]/1000,bz=fgBz(m,ln);
  // lodret udstrækning over/under linsen (kabinet + optik, som skitsen) – L-formet optik: kabinettet hænger under linsehovedet
  const pb=pkBox(pkModel({m,ln,PT:pt},{ceil:false,lrot:0})),vy=[pb.y0,pb.y1];
  return {m,ln,vy,row,aw,ah,hy,asp,fixed,z,D,W,H,ok,tr:W>0?p.L/W:0,lo:Math.min(a,b),hi:Math.max(a,b),B,Hb,Dp:bz.Dp,Lo:bz.Lo,top:bz.top,bot:bz.bot,ul:bz.ul,port:pt,bw:pt?Hb:B,bh:pt?B:Hb,
    // vandret som calc: billedets midte flyttes sg·(sh + offH)·W til siden (loftmonteret: spejlet; portræt: optikkens offset er vandret)
    offH:pt?(ln[4]||0):0,ox:sg*(sh+(pt?(ln[4]||0):0))*W,
    svR,off,sg,sv,sh,yc,dn,fh,fo:(sv+off)*H,pt,c,r,o,kx,ky,Wt:W*kx,Ht:H*ky,stk,n:c*r*stk,shOK:shiftOK(sh,sv,fgP(ln,pt))}}
// top/down: højden på den flade, der projiceres på (gulv = 0, fx et bord 0,8 m) – afstanden regnes fra linsen ned til fladen
const fgFh=p=>fgCl(p.fh||0,0,Math.max(0,FG.hgt-.3));
function fgSetSvFor(p,yc){if(p.down)return;const sp=fgSpec(p);p.sv=Math.round(fgCl((yc-p.h)*sp.sg/sp.H-sp.off,sp.svR[0],sp.svR[1])*1000)/1000}
// retning: 0° = mod den øverste væg (plan-y = 0); u = fremad, n = til højre (set ovenfra). 3D: x = plan-x, y = højde, z = plan-y
const fgDir=p=>{const a=p.rot*FGR;return {u:[Math.sin(a),-Math.cos(a)],n:[Math.cos(a),Math.sin(a)]}};
function fgGeo(p,sp=fgSpec(p)){const {u,n}=fgDir(p),h=sp.dn?0:sp.Lo,at=(f,s)=>[p.x+u[0]*f+n[0]*s,p.y+u[1]*f+n[1]*s],ox=sp.ox,f=sp.dn?sp.fo:h+p.L;   // top/down: linsen lige under kabinettets midte
  return {u,n,at,lens:at(h,0),img:at(f,ox),e1:at(f,ox-sp.Wt/2),e2:at(f,ox+sp.Wt/2)}}
/* --- lærred og projektor hænger sammen via afstand, optik, zoom og lens shift ---
   lærredet (scr): midte c (plan), højde yc, bredde W pr. billede og retning rot */
const fgScr=(p,sp=fgSpec(p))=>({c:fgGeo(p,sp).img,yc:sp.yc,W:sp.W,rot:p.rot});
// optik der kan lave billedbredden W på afstanden L: den nuværende først; ellers (optikken ikke låst) en anden – aktuelle optikker før udgåede
// exact: billedet skal blive præcis W (låst lærred) – fast optik kun på sin egen afstand (0,2 mm), zoom inden for 0–100 % uden slør
function fgLensFor(p,W,L,exact){const m=MODELS[p.mi],fit=i=>{const ln=m.L[i],{row,aw,hy}=fgRow(m,ln,p.port),D=W/(IN*aw/hy);if(D<row[4]-.5||D>row[5]+.5)return null;
    if(ln[1]==='F')return Math.abs(distAt(row,D,0)-L)<=(exact?2e-4:.015*L)?0:null;const z=zoomFor(row,D,L),t=exact?1e-9:.002;return z>=-t&&z<=1+t?fgCl(z,0,1):null};
  let z=fit(p.li);if(z!=null)return {li:p.li,z};if(p.lockO)return null;
  const ord=m.L.map((l,i)=>i).sort((a,b)=>(lnEOL(m.L[a])?1:0)-(lnEOL(m.L[b])?1:0));for(const i of ord){if(i===p.li)continue;z=fit(i);if(z!=null)return {li:i,z}}return null}
// projektoren (kabinettets midte x,y og linsehøjde h) over for lærredet scr: afstand, optik, zoom og shift regnes ud.
// strict: null, hvis ingen optik kan, eller billedet er uden for optikkens lens shift
function fgFit(p,scr,x,y,h,strict=true){const m=MODELS[p.mi],{u,n}=fgDir(scr),dn=!!p.down,Lo=dn?0:fgBz(m,m.L[p.li]||m.L[0]).Lo,lx=x+u[0]*Lo,ly=y+u[1]*Lo,dx=scr.c[0]-lx,dy=scr.c[1]-ly,fw=dx*u[0]+dy*u[1],d=dx*n[0]+dy*n[1];
  // top/down: afstanden er linsehøjden over fladen (fladens højde følger lærredets højde scr.yc), og billedet frem/tilbage langs fladen er lodret shift
  const fh=dn?fgCl((scr.yc??.03)-.03,0,Math.max(0,FG.hgt-.3)):0,L=dn?h-fh:fw;
  if(!(L>.1))return null;let lf=fgLensFor(p,scr.W,L,!!strict);
  if(!lf){if(strict)return null;const ln=m.L[p.li],{row,aw,hy}=fgRow(m,ln,p.port),D=fgCl(scr.W/(IN*aw/hy),row[4],row[5]);lf={li:p.li,z:ln[1]==='F'?0:fgCl(zoomFor(row,D,L),0,1)}}
  const sp=fgSpec({...p,li:lf.li,z:lf.z,L,h,sh:0,sv:0}),sh=d*sp.sg/sp.W-sp.offH,sv=(dn?fw:(scr.yc-h)*sp.sg)/sp.H-sp.off;
  // samme grænse som fgSpec (svRange har en lille margen i forhold til shiftOK) – ellers flytter billedet sig en smule, når fgSpec klemmer shiftet
  if(strict===true){const vr=fgSvR(sp.m,sp.ln,sp.pt,sh);if(!shiftOK(sh,sv,fgP(sp.ln,sp.pt))||sv<vr[0]-1e-9||sv>vr[1]+1e-9)return null}   // strict='lens': optikken skal kunne, men lens shift tjekkes ikke
  const r={li:lf.li,z:lf.z,L,sh,sv,x,y,h,rot:scr.rot};if(dn)r.fh=fh;return r}   // ingen afrunding: billedet skal blive præcis, hvor det er
// flyt projektoren fra «fra» mod «til» med lærredet fast: stop ved grænsen (halvering), som når projektoren trækkes på plantegningen
// (er billedet allerede uden for lens shift, holdes kun optikkens grænse – ellers ville lærredet ændre sig)
function fgMoveTo(p,scr,to){const fr=[p.x,p.y,p.h],st=fgFit(p,scr,...fr)?true:'lens',at=t=>fgFit(p,scr,...fr.map((v,k)=>v+(to[k]-v)*t),st);
  let r=at(1);if(!r){if(at(0)){let lo=0,hi=1;r=at(0);for(let i=0;i<14;i++){const m=(lo+hi)/2,q=at(m);if(q){lo=m;r=q}else hi=m}hitFG()}else r=fgFit(p,scr,...to,false)}
  if(r)Object.assign(p,r);return r}
// flyt lærredet med projektoren stående: samme grænser
function fgMoveScr(p,s0,s1){const st=fgFit(p,s0,p.x,p.y,p.h)?true:'lens',at=t=>fgFit(p,{...s0,c:[s0.c[0]+(s1.c[0]-s0.c[0])*t,s0.c[1]+(s1.c[1]-s0.c[1])*t],yc:s0.yc+(s1.yc-s0.yc)*t},p.x,p.y,p.h,st);
  let r=at(1);if(!r){if(at(0)){let lo=0,hi=1;r=at(0);for(let i=0;i<14;i++){const m=(lo+hi)/2,q=at(m);if(q){lo=m;r=q}else hi=m}hitFG()}else r=fgFit(p,s1,p.x,p.y,p.h,false)}
  if(r)Object.assign(p,r);return r}
// lærredet står fast, men billedet pr. projektor eller optikken er ændret: afstanden tilpasses (zoom, evt. anden optik), projektoren flyttes langs sin akse
function fgKeepScr(p,scr){let L=p.L;const lf=fgLensFor(p,scr.W,L);
  if(lf){p.li=lf.li;p.z=lf.z}else{const ln=MODELS[p.mi].L[p.li],{row,aw,hy}=fgRow(MODELS[p.mi],ln,p.port),D=fgCl(scr.W/(IN*aw/hy),row[4],row[5]),a=distAt(row,D,0),b=ln[1]==='F'?a:distAt(row,D,1);
    L=fgCl(L,Math.min(a,b),Math.max(a,b));p.z=ln[1]==='F'?0:fgCl(zoomFor(row,D,L),0,1)}
  p.L=fgR3(L);fgPlace(p,scr)}
function fgPlace(p,scr){const {u,n}=fgDir(p),sp=fgSpec(p),ox=sp.ox;
  if(p.down){p.x=fgR3(scr.c[0]-n[0]*ox-u[0]*sp.fo);p.y=fgR3(scr.c[1]-n[1]*ox-u[1]*sp.fo);p.h=fgR3(p.L+sp.fh);return}
  const lx=scr.c[0]-u[0]*p.L-n[0]*ox,ly=scr.c[1]-u[1]*p.L-n[1]*ox;p.x=fgR3(lx-u[0]*sp.Lo);p.y=fgR3(ly-u[1]*sp.Lo);fgSetSvFor(p,scr.yc)}
// ny billedbredde (pr. billede): låst lærred → lærredet bliver stående, ellers holdes afstanden og billedet følger med
function fgSize(p,W){if(p.lockS){const s=fgScr(p);fgKeepScr(p,{...s,W})}else fgSetLW(p,p.L,W)}
// lodret lens shift et trin (andel af billedhøjden, op = billedet op i forhold til optikken): låst lærred → billedet bliver stående, og projektoren flyttes op/ned
function fgStepSv(p,d){const sp=fgSpec(p),sv=fgCl(sp.sv+d*sp.sg,sp.svR[0],sp.svR[1]);if(Math.abs(sv-sp.sv)<1e-6){hitFG();return}
  if(p.lockS&&p.down){const {u}=fgDir(p),dl=(sv-sp.sv)*sp.H;fgMoveTo(p,fgScr(p,sp),[fgCl(p.x-u[0]*dl,0,FG.w),fgCl(p.y-u[1]*dl,0,FG.d),p.h])}   // top/down: projektoren flyttes frem/tilbage
  else if(p.lockS)fgMoveTo(p,fgScr(p,sp),[p.x,p.y,fgCl(sp.yc-sp.sg*(sv+sp.off)*sp.H,.05,FG.hgt-.05)]);else p.sv=Math.round(sv*1000)/1000}
let FGHIT=0,FGHITK='';function hitFG(k='edge'){FGHIT=performance.now();FGHITK=k;clearTimeout(hitFG.t);hitFG.t=setTimeout(()=>{if(FG.tab==='grid')fgDraw()},1600)}
// sættets projektorer: midte for hver (sideforskydning xc langs n, højde yr) – rækkefølge: øverste række fra venstre
function fgTiles(sp){const t=[],pw=sp.W*(1-sp.o),ph=sp.H*(1-sp.o);for(let ri=0;ri<sp.r;ri++)for(let ci=0;ci<sp.c;ci++)t.push({ci,ri,xc:(ci-(sp.c-1)/2)*pw,yr:((sp.r-1)/2-ri)*ph});return t}
const fgIn=q=>q[0]>=-.01&&q[0]<=FG.w+.01&&q[1]>=-.01&&q[1]<=FG.d+.01;
/* buet lærred: konkav bue, midten ved billedets plan og kanterne frem mod projektoren: z = R − √(R² − u²) (som 26-curved) */
function fgCZ(p){const cu=p.curv;if(!cu||!cu.on)return ()=>0;const s=(R,x)=>{const a=Math.abs(x);return a>=R?R:R-Math.sqrt(R*R-x*x)};return (u,v)=>(cu.dir!=='v'?s(cu.rh,u):0)+(cu.dir!=='h'?s(cu.rv,v):0)}
// manualens grænse (uden keystone – projektoren står vinkelret på lærredet): R/L ≥ min. R3/L (vandret bue) og R2/L (lodret bue)
function fgCurv(p,sp=fgSpec(p)){const cu=p.curv;if(!cu||!cu.on)return null;let row=null,key='';
  for(const k of etCodes(sp.ln[0]))if(CURV[k]){row=CURV[k];key=k;break}
  if(!row){const mk=sp.m.m.split(' (')[0].split('/')[0];if(CURV[mk]){row=CURV[mk];key=mk}}
  const name=key||etCodes(sp.ln[0]).join(' / ')||sp.m.m.split(' (')[0],L=p.L,useH=cu.dir!=='v',useV=cu.dir!=='h',f2x=x=>x.toFixed(2);
  if(!row)return {st:'unknown',lines:[{good:false,t:`${name}: ikke oplyst i manualens tabel – kan ikke tjekkes.`}]};
  if(row[6]==null)return {st:'none',lines:[{good:false,t:`${name} kan ikke bruge curved correction (kun keystone).`}]};
  let ok=true;const lines=[{good:true,t:`${name} · kun curved correction · L ${f2x(L)} m`}],sag=(R,ch)=>R>ch/2?R-Math.sqrt(R*R-ch*ch/4):null;
  const line=(lab,R,mn,ch)=>{const q=R/L,good=q>=mn-1e-9,s=sag(R,ch);if(!good)ok=false;
    lines.push({good,t:`${lab}: R/L = ${f2x(q)} · min. ${f2x(mn)} → ${good?'OK':'for stærk bue'} (mindste radius ${f2x(mn*L)} m)${s!=null?` · buedybde ${(s*1000).toFixed(0)} mm`:' · radius mindre end halv bredde'}`})};
  if(useH)line('Vandret bue (R3)',cu.rh,row[7],sp.Wt);if(useV)line('Lodret bue (R2)',cu.rv,row[6],sp.Ht);
  return {st:ok?'ok':'bad',lines}}
function fgWarn(p,sp=fgSpec(p)){const g=fgGeo(p,sp),w=[];if(!sp.ok)w.push('billedet er uden for optikkens størrelse');if(!sp.shOK)w.push('billedet er uden for optikkens lens shift');
  if(sp.dn){// top/down: billedets fire hjørner på gulvet og kabinetterne (linsen nederst, sættet breder sig ud langs gulvet)
    const P=(a,b)=>[g.img[0]+g.n[0]*a+g.u[0]*b,g.img[1]+g.n[1]*a+g.u[1]*b];if(![[-1,-1],[1,-1],[1,1],[-1,1]].every(([a,b])=>fgIn(P(a*sp.Wt/2,b*sp.Ht/2))))w.push('billedet rækker uden for rummet');
    const xm=(sp.c-1)/2*sp.W*(1-sp.o)+sp.bw/2,ym=(sp.r-1)/2*sp.H*(1-sp.o)+(sp.stk-1)*sp.bh*1.08,Q=(a,b)=>[p.x+g.n[0]*a+g.u[0]*b,p.y+g.n[1]*a+g.u[1]*b];
    if(p.h<-.01||p.h+sp.top>FG.hgt+.01||p.h+sp.bot<sp.fh-.01||![[-1,-1],[1,-1],[1,1],[-1,1]].every(([a,b])=>fgIn(Q(a*xm,b*ym))))w.push('en projektor står uden for rummet')}
  else{if(!fgIn(g.e1)||!fgIn(g.e2))w.push('billedet rækker uden for rummet');
  if(sp.yc-sp.Ht/2<-.01)w.push('billedet går under gulvet');if(sp.yc+sp.Ht/2>FG.hgt+.01)w.push('billedet går over loftet');
  // kabinetterne (alle i sættet, med stak) skal stå inde i rummet
  {const ym=(sp.r-1)/2*sp.H*(1-sp.o),xm=(sp.c-1)/2*sp.W*(1-sp.o),st=(sp.stk-1)*sp.bh*1.08,lo=p.h-ym+(p.inv?-sp.vy[1]:sp.vy[0])-(p.inv?st:0),hi=p.h+ym+(p.inv?-sp.vy[0]:sp.vy[1])+(p.inv?0:st);
   if(lo<-.01||hi>FG.hgt+.01||!fgIn([p.x-g.n[0]*xm,p.y-g.n[1]*xm])||!fgIn([p.x+g.n[0]*xm,p.y+g.n[1]*xm]))w.push('en projektor står uden for rummet')}}
  const cv=fgCurv(p,sp);if(cv&&cv.st==='bad')w.push('buen er for stærk til optikken');if(cv&&cv.st==='none')w.push('optikken kan ikke bruge curved correction');if(cv&&cv.st==='unknown')w.push('optikken står ikke i manualens tabel');
  return w}
// afstand og billedbredde (ét billede i sættet): zoomen tilpasses; kan optikken ikke nå bredden, holdes afstanden og zoomen går til kanten
function fgSetLW(p,L,W){const sp=fgSpec(p),{row,aw,hy,fixed}=sp,yc=sp.yc;let D=fgCl(W/(IN*aw/hy),row[4],row[5]);L=Math.max(.1,L);
  let z=fixed?0:zoomFor(row,D,L);if(!Number.isFinite(z))z=.5;z=fgCl(z,0,1);p.z=z;
  const D2=diagFor(row,L,z);if(D2<row[4]-.5||D2>row[5]+.5)L=distAt(row,fgCl(D2,row[4],row[5]),z);p.L=fgR3(L);fgSetSvFor(p,yc)}
// ny model/optik: billedbredden holdes – første optik der kan lave den på samme afstand vælges
function fgFitLens(p,W){const m=MODELS[p.mi],yc=fgSpec(p).yc;let best=-1;
  for(let i=0;i<m.L.length&&best<0;i++){const ln=m.L[i],{row,aw,hy}=fgRow(m,ln,p.port),D=W/(IN*aw/hy);if(D<row[4]-.5||D>row[5]+.5)continue;
    if(ln[1]==='F'){if(Math.abs(distAt(row,D,0)-p.L)<=.05*p.L)best=i}else{const z=zoomFor(row,D,p.L);if(z>=-.002&&z<=1.002)best=i}}
  if(best<0){best=m.L.findIndex(l=>/standard|std/i.test(l[0]));if(best<0)best=0;p.li=best;const {row,aw,hy}=fgRow(m,m.L[best],p.port),D=fgCl(W/(IN*aw/hy),row[4],row[5]);p.z=m.L[best][1]==='F'?0:.5;p.L=fgR3(distAt(row,D,p.z));fgSetSvFor(p,yc);return}
  p.li=best;fgSetLW(p,p.L,W);fgSetSvFor(p,yc)}
/* beregn antal automatisk (som boks 05): den samlede bredde holdes; færrest projektorer, hvor hvert billede kan laves på afstanden og den samlede højde ≥ målet */
function fgAuto(p){const bl=fgBl(p);if(!bl||!bl.auto)return;const sp=fgSpec(p);if(!(bl.th>0))bl.th=Math.round(sp.Ht*100)/100;const Wt=sp.Wt,o=sp.o,{row,aw,ah,fixed}=sp;let best=null;
  for(let c=1;c<=8;c++)for(let r=1;r<=4;r++){const kx=c-(c-1)*o,ky=r-(r-1)*o,W=Wt/kx,H=W*ah/aw,Ht=H*ky,D=Math.hypot(W,H)/IN;if(D<row[4]-.5||D>row[5]+.5||Ht<bl.th-1e-6)continue;
    const zz=fixed?(Math.abs(distAt(row,D,0)-p.L)<=.05*p.L?0:-1):zoomFor(row,D,p.L);if(!(zz>=-.002&&zz<=1.002))continue;const k=c*r*1000+Ht;if(!best||k<best.k)best={k,c,r,W}}
  bl.autoOK=!!best;if(best){bl.c=best.c;bl.r=best.r;fgSize(p,best.W)}}
const fgCopy=o=>o?JSON.parse(JSON.stringify(o)):o;
function fgNew(x,y,from){const mi=from?from.mi:(MODELS[S.mi]&&!isEOL(MODELS[S.mi])?S.mi:0),li=from?from.li:(MODELS[mi].L[S.li]?S.li:0);
  // intet er låst fra start (en kopi får samme låse for optik og lærred, men projektoren er ikke låst – den står et nyt sted)
  const p={mi,li,x,y,rot:from?from.rot:0,L:5,z:.5,h:from?from.h:1.2,sv:from?from.sv:0,sh:from?from.sh||0:0,inv:from?from.inv:false,down:from?!!from.down:false,fh:from?from.fh||0:0,port:from?from.port:false,
    lockS:from?!!from.lockS:false,lockO:from?!!from.lockO:false,lockP:false,bl:fgCopy(from&&from.bl),st:fgCopy(from&&from.st),curv:fgCopy(from&&from.curv)};
  if(from){p.L=from.L;p.z=from.z}else{const {row,aw,hy}=fgRow(MODELS[mi],MODELS[mi].L[li]),D=fgCl(Math.min(4,FG.w/3)/(IN*aw/hy),row[4],row[5]);p.z=MODELS[mi].L[li][1]==='F'?0:.5;p.L=fgR3(distAt(row,D,p.z));
    const sp0=fgSpec(p),H=sp0.H;p.h=fgR3(Math.max(p.h,.1-sp0.vy[0]));fgSetSvFor(p,Math.min(FG.hgt-.2-H/2,.8+H/2))}   // billedets underkant ca. 0,8 m over gulvet
  return p}
function fgAdd(at){let p;const s=FG.pjs[FG.sel];
  if(at)p=fgNew(at[0],at[1],s);
  else if(s){// kopi ved siden af: flyttes én (samlet) billedbredde til højre (set fra projektoren)
    const sp=fgSpec(s),{n}=fgDir(s);p=fgNew(s.x+n[0]*sp.Wt,s.y+n[1]*sp.Wt,s)}
  else p=fgNew(FG.w/2,FG.d/2);   // den første projektor står midt i rummet (og peger mod den øverste væg)
  p.x=fgCl(p.x,0,FG.w);p.y=fgCl(p.y,0,FG.d);p.h=fgCl(p.h,.05,FG.hgt-.05);FG.pjs.push(p);FG.sel=FG.pjs.length-1;fgDraw()}
function fgDel(){if(FG.sel<0)return;FG.pjs.splice(FG.sel,1);FG.sel=Math.min(FG.sel,FG.pjs.length-1);fgDraw()}

/* --- opbygning: faner i boks 08 + Free Grid-panelet (bygges én gang) --- */
function fgInit(){const d=$('dPlan');if(!d||$('fgWrap'))return;
  const tabs=document.createElement('div');tabs.className='fgtabs';
  tabs.innerHTML=`<div class="seg" role="group" aria-label="Plantegning eller Free Grid"><button type="button" data-fgt="plan" aria-pressed="true">Plantegning</button><button type="button" data-fgt="grid" aria-pressed="false">Free Grid</button></div>`;
  d.querySelector('summary').after(tabs);
  // overskriften: «Floor Plan & Free Grid»
  {const h=d.querySelector('summary h2');if(h)[...h.childNodes].forEach(n=>{if(n.nodeType===3&&n.nodeValue.trim())n.nodeValue='Plantegning & Free Grid'})}
  const ico={'3d':'<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z M4 7.5 12 12l8-4.5 M12 12v9"/>',top:'<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 10h16M10 4v16"/>',side:'<path d="M3 20h18M5 20V8h14v12M9 20v-6h6v6"/>'};
  const vb=(k,t)=>`<button type="button" data-fgv="${k}" aria-pressed="false"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">${ico[k]}</svg>${t}</button>`;
  const ck=(id,t,cls='')=>`<label class="inl hint fgck ${cls}"><input type="checkbox" id="${id}">${t}</label>`,nf=(id,t,u,a,cls='',w=58)=>`<span class="inl ${cls}"><span class="hint">${t}</span><input type="number" id="${id}" ${a} style="width:${w}px">${u?`<span class="unit">${u}</span>`:''}</span>`;
  const lk='<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path class="shk" d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const w=document.createElement('div');w.id='fgWrap';
  w.innerHTML=`<div class="ptool fgtool">
      <span class="inl"><span class="hint">Gitter</span><select id="fgGrid"><option value="0.5">0,5 m</option><option value="1">1 m</option><option value="2">2 m</option><option value="5">5 m</option></select></span>
      <label class="inl hint" style="gap:6px"><input type="checkbox" id="fgSnap">Fang gitter</label>
      <span class="sp"></span>
      <button class="btn" type="button" id="fgClr">Ryd rummet</button>
    </div>
    <div class="ptool fgtool fgsel" id="fgSel">
      <span class="fgpjs"><span class="fgchips" id="fgChips"></span><button type="button" class="fgadd" id="fgAddB" title="Tilføj en projektor mere (samme model som den valgte, ved siden af)">+ Projektor</button></span>
      <span class="fglocks"><button type="button" class="fglock" id="fgLockO" aria-pressed="false" title="Lås optikken – så skifter appen den ikke automatisk">${lk}Lås optik</button><button type="button" class="fglock" id="fgLockS" aria-pressed="false" title="Lås lærredet – billedet bliver stående, når projektoren flyttes">${lk}Lås lærred</button><button type="button" class="fglock" id="fgLockP" aria-pressed="false" title="Lås projektoren – den bliver stående, og billedet kan flyttes inden for lens shift og zoom">${lk}Lås projektor</button></span>
      <span class="inl"><span class="hint">Zoom</span><input type="range" id="fgZ" min="0" max="100" step="1" style="width:90px"><span class="unit" id="fgZv"></span></span>
      <span class="inl"><span class="hint">Retning</span><input type="number" id="fgRot" step="1" style="width:64px"><span class="unit">°</span></span>
      <span class="inl"><span class="hint">Linsehøjde</span><input type="number" id="fgH" step="0.05" min="0.05" style="width:70px"><span class="unit">m</span></span>
      <span class="inl"><span class="hint">Lodret shift</span><input type="number" id="fgSv" step="1" style="width:64px"><span class="unit" id="fgSvR">%</span></span>
      <label class="inl hint" style="gap:6px"><input type="checkbox" id="fgInv">Loftmonteret</label>
      <button type="button" class="fglock fgdown" id="fgDown" aria-pressed="false" title="Projektoren peger lodret ned – billedet ligger på gulvet"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="7" rx="1.5"/><path d="M12 9v9M8 14l4 4 4-4M4 21h16"/></svg>Top/down</button>
      <span class="inl" id="fgFhW" hidden title="Højden på den flade, der projiceres på – fx et bord (gulv = 0)"><span class="hint">Fladens højde</span><input type="number" id="fgFh" step="0.05" min="0" style="width:70px"><span class="unit">m</span></span>
      <span class="inl"><span class="hint">X</span><input type="number" id="fgX" step="0.05" style="width:80px"><span class="unit">m</span></span>
      <span class="inl"><span class="hint">Y</span><input type="number" id="fgY" step="0.05" style="width:80px"><span class="unit">m</span></span>
      <button class="btn" type="button" id="fgDup" title="Kopiér projektoren og sæt den ved siden af">Kopiér</button>
      <button class="btn" type="button" id="fgDelB">Slet</button>
    </div>
    <div class="ptool fgtool fgb05" id="fgB05"></div>
    <div class="pinfo" id="fgInfo"></div>
    <div class="pinfo fgcurv" id="fgCurvOut" hidden></div>
    <div class="fgstage" id="fgStage"><canvas id="fgCv" tabindex="0" aria-label="Free Grid: tomt rum med projektorer i 3D"></canvas>
      <div class="seg fgviews" role="group" aria-label="Visning">${vb('3d','3D')}${vb('top','Ovenfra')}${vb('side','Fra siden')}</div>
      <div class="fgmsg" id="fgMsg">Indlæser 3D…</div><div class="fghint" id="fgHint"></div></div>
    <div class="ptool fgtool fgcont"><span class="hint">Indhold på lærredet</span>
      <div class="seg" role="group" aria-label="Indhold på lærredet"><button type="button" data-fgc="none">Lærred</button><button type="button" data-fgc="test">Testbillede</button><button type="button" data-fgc="golf" hidden>Golfbane</button><button type="button" data-fgc="img">Eget billede</button></div>
      <select id="fgTp" aria-label="Testbillede" hidden><option value="std">ANSI og farver</option><option value="focus">Fokus</option><option value="bars">Farvebjælker</option></select></div>`;
  tabs.after(w);
  document.querySelectorAll('[data-fgt]').forEach(b=>b.addEventListener('click',()=>{FG.tab=b.dataset.fgt;if(FG.tab==='grid'&&!FG.pjs.length)fgAdd();fgDraw()}));
  document.querySelectorAll('[data-fgv]').forEach(b=>b.addEventListener('click',()=>{if(G3.R)fg3View(b.dataset.fgv,b.dataset.fgv===FG.view);else FG.view=b.dataset.fgv}));
  const val=id=>parseFloat(String($(id).value).replace(',','.'));
  const num=(id,f)=>$(id).addEventListener('change',()=>{const v=val(id);if(Number.isFinite(v))f(v);fgDraw()});
  $('fgGrid').addEventListener('change',()=>{FG.grid=+$('fgGrid').value;fgDraw()});$('fgSnap').addEventListener('change',()=>{FG.snap=$('fgSnap').checked});
  $('fgAddB').addEventListener('click',()=>fgAdd());$('fgDup').addEventListener('click',()=>fgAdd());$('fgDelB').addEventListener('click',fgDel);
  // indhold på lærredet: samme valg som i boks 09 (S.content, S.tp og det valgte billede IMG) – vises på lærrederne i Free Grid
  document.querySelectorAll('[data-fgc]').forEach(b=>b.addEventListener('click',()=>{const again=S.content==='img';S.content=b.dataset.fgc;if(S.content==='img'&&(!IMG||again))$('file').click();render()}));
  $('fgTp').addEventListener('change',()=>{S.tp=$('fgTp').value;S.content='test';render()});
  $('fgClr').addEventListener('click',()=>{FG.pjs=[];FG.sel=-1;fgDraw()});
  const P=()=>FG.pjs[FG.sel];
  // låse: optikken skifter ikke af sig selv / lærredet bliver stående, når projektoren flyttes
  // lærred og projektor kan ikke være låst på samme tid: låses den ene, låses den anden op
  $('fgLockO').addEventListener('click',()=>{const p=P();if(p){p.lockO=!p.lockO;fgDraw()}});
  $('fgLockS').addEventListener('click',()=>{const p=P();if(p){p.lockS=!p.lockS;if(p.lockS)p.lockP=false;fgDraw()}});
  $('fgLockP').addEventListener('click',()=>{const p=P();if(p){p.lockP=!p.lockP;if(p.lockP)p.lockS=false;fgDraw()}});
  const mvTo=fgMvTo;
  $('fgZ').addEventListener('input',()=>{const p=P();if(!p)return;const sp=fgSpec(p);if(sp.fixed)return;const z=+$('fgZ').value/100;
    if(p.lockS){const s=fgScr(p,sp);p.z=z;p.L=fgR3(distAt(sp.row,sp.D,z));fgPlace(p,s)}   // låst lærred: zoomen flytter projektoren
    else{p.z=z;const s2=fgSpec(p);if(!s2.ok)p.L=fgR3(fgCl(p.L,s2.lo,s2.hi))}fgDraw()});
  num('fgRot',v=>{const p=P();if(p&&!p.lockS)p.rot=((Math.round(v)%360)+540)%360-180});
  num('fgH',v=>{const p=P();if(!p||p.lockP)return;if(p.lockS)mvTo(p,p.x,p.y,v);else fgSetH(p,v)});
  num('fgSv',v=>{const p=P();if(!p)return;const sp=fgSpec(p),sv=fgCl(v/100,sp.svR[0],sp.svR[1]);if(p.down)fgStepSv(p,sv-sp.sv);else if(p.lockS)mvTo(p,p.x,p.y,sp.yc-sp.sg*(sv+sp.off)*sp.H);else p.sv=sv});
  // top/down: projektoren peger lodret ned mod gulvet. Slås til: den hænger lige under loftet, billedbredden holdes så vidt muligt (zoom/afstand), intet shift.
  // Slås fra: tilbage til vandret med linsen i 1,2 m og billedets underkant ca. 0,8 m over gulvet
  $('fgDown').addEventListener('click',()=>{const p=P();if(!p)return;const sp=fgSpec(p),W=sp.W;
    if(!p.down){p.down=true;p.inv=false;p.sv=0;p.sh=0;const fh=fgFh(p);p.L=fgR3(Math.max(.5,FG.hgt-sp.top-.15-fh));fgSetLW(p,p.L,W);p.h=fgR3(p.L+fh)}
    else{p.down=false;p.h=Math.min(1.2,FG.hgt-.05);p.sv=0;const H=fgSpec(p).H;fgSetSvFor(p,Math.min(FG.hgt-.2-H/2,.8+H/2))}
    fgAuto(p);fgDraw()});
  // fladens højde (top/down): projektoren følger med op/ned, så billedet bliver det samme. Låst projektor (eller loftet nås): zoom/optik regnes om
  num('fgFh',v=>{const p=P();if(!p||!p.down)return;const sp=fgSpec(p),fh=fgCl(v,0,Math.max(0,FG.hgt-.3)),nh=p.h+fh-sp.fh;
    if(!p.lockP&&nh+sp.top<=FG.hgt+1e-6){p.fh=fh;p.h=fgR3(nh);return}const s0=fgScr(p,sp);fgMoveScr(p,s0,{...s0,yc:fh+.03})});
  $('fgInv').addEventListener('change',()=>{const p=P();if(!p)return;const yc=fgSpec(p).yc;p.inv=$('fgInv').checked;
    // ny linsehøjde, så hele projektoren er i rummet (L-formet optik: kabinettet står over/under linsen – fgSpec.vy)
    const vy=fgSpec(p).vy;if(p.inv&&p.h<FG.hgt/2)p.h=fgR3(Math.max(.05,Math.min(FG.hgt-.4,FG.hgt-.1+vy[0])));if(!p.inv&&p.h>FG.hgt/2)p.h=fgR3(Math.max(1.2,.1-vy[0]));fgSetSvFor(p,yc);fgDraw()});
  num('fgX',v=>{const p=P();if(!p||p.lockP)return;if(p.lockS)mvTo(p,v,p.y,p.h);else p.x=fgCl(v,0,FG.w)});num('fgY',v=>{const p=P();if(!p||p.lockP)return;if(p.lockS)mvTo(p,p.x,v,p.h);else p.y=fgCl(v,0,FG.d)});
  // markeringerne af boks 05 åbner boks 05 (dér ændres de)
  $('fgB05').addEventListener('click',e=>{if(!e.target.closest('[data-go05]'))return;const b=$('dBlend');if(!b)return;b.open=true;b.scrollIntoView({behavior:'smooth',block:'center'})})}

/* --- felter og info --- */
let fgRaf=0;const fgRedraw=()=>{if(!fgRaf)fgRaf=requestAnimationFrame(()=>{fgRaf=0;fgDraw()})};
function fgDraw(){const on=FG.tab==='grid',d=$('dPlan');if(!d)return;
  // ny fane eller ny projektor valgt: boks 05 skal vise noget andet – tegn hele appen om (render kalder fgDraw igen)
  if(on!==!!FG.app05||(on&&FG.sel05!==FG.sel)){render();return}
  d.classList.toggle('fgOn',on);
  document.querySelectorAll('[data-fgt]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.fgt===FG.tab));
  if(!on)return;
  // Free Grid har skiftet model/optik på den valgte projektor (fx automatisk optikvalg, når den flyttes med låst lærred): boks 03 skal vise det
  {const p=FG.pjs[FG.sel],k=p?p.mi+'|'+p.li:'';if(k!==FG.k03){FG.k03=k;if(p&&$('lens').value!==String(p.li)||p&&$('model').value!==String(p.mi)){render();return}}}
  {const c=fgContent();document.querySelectorAll('[data-fgc]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.fgc===(c?S.content:'none'));if(b.dataset.fgc==='golf')b.hidden=S.venue!=='golf'});
   $('fgTp').hidden=S.content!=='test';$('fgTp').value=fgTpKind();document.querySelector('[data-fgc="img"]').title=IMG?'Klik igen for at skifte billede':'Vælg et billede fra din computer'}
  FG.pjs.forEach(p=>{if(p.down)p.h=fgR3(p.L+fgFh(p))});   // top/down: linsehøjden er afstanden til fladen + fladens højde
  fg0102Show();
  const nAll=FG.pjs.reduce((a,p)=>a+fgSpec(p).n,0);
  $('planCap').textContent=`Free Grid · rum ${f3(FG.w,1)} × ${f3(FG.d,1)} × ${f3(FG.hgt,1)} m · projektorer: ${nAll}`;
  const set=(id,v)=>{const el=$(id);if(document.activeElement!==el)el.value=v};
  $('fgGrid').value=String(FG.grid);$('fgSnap').checked=FG.snap;
  $('fgChips').innerHTML=FG.pjs.map((p,i)=>{const n=fgSpec(p).n;return `<button type="button" class="notr" data-fgi="${i}" aria-pressed="${i===FG.sel}" style="--c:${fgCol(i)}">P${i+1}${n>1?` ×${n}`:''}</button>`}).join('');
  $('fgChips').querySelectorAll('[data-fgi]').forEach(b=>b.addEventListener('click',()=>{FG.sel=+b.dataset.fgi;fgDraw()}));
  const p=FG.pjs[FG.sel];$('fgSel').classList.toggle('none',!p);
  $('fgSel').querySelectorAll('select,input,#fgDup,#fgDelB').forEach(el=>el.disabled=!p);$('fgAddB').disabled=false;
  let info,cvOut='';
  if(p){const sp=fgSpec(p),m=sp.m,bl=fgBl(p),cu=p.curv&&p.curv.on?p.curv:null;
    set('fgRot',Math.round(p.rot));set('fgX',p.x.toFixed(2));set('fgY',p.y.toFixed(2));
    set('fgH',p.h.toFixed(2));set('fgSv',Math.round(sp.sv*100));$('fgSvR').textContent=`% (${Math.round(sp.svR[0]*100)}…${Math.round(sp.svR[1]*100)})`;$('fgInv').checked=!!p.inv;$('fgInv').disabled=!!p.down;$('fgDown').setAttribute('aria-pressed',!!p.down);$('fgFhW').hidden=!p.down;set('fgFh',fgFh(p).toFixed(2));
    $('fgLockO').setAttribute('aria-pressed',!!p.lockO);$('fgLockS').setAttribute('aria-pressed',!!p.lockS);$('fgLockP').setAttribute('aria-pressed',!!p.lockP);$('fgRot').disabled=!!p.lockS;
    ['fgX','fgY','fgH'].forEach(id=>{$(id).disabled=!!p.lockP;$(id).title=p.lockP?'Projektoren er låst – lås den op for at flytte den':''});
    $('fgRot').title=p.lockS?'Lærredet er låst – lås det op for at ændre billedet':'';
    $('fgZ').value=Math.round(sp.z*100);$('fgZ').disabled=sp.fixed;$('fgZv').textContent=sp.fixed?'fast':Math.round(sp.z*100)+' %';
    // boks 05: kun en markering af det, der er slået til (ændres i boks 05 til venstre)
    {const k=cu&&fgCurv(p,sp),pill=(t,cls='')=>`<button type="button" class="fgpill ${cls}" data-go05 title="Ændres i boks 05">${esc(t)}</button>`,a=[];
     if(sp.pt)a.push(pill('Portrait mode'));
     if(bl)a.push(pill(`Edge Blend ${sp.c} × ${sp.r} · overlap ${bl.ov} %${bl.auto?' · auto':''}`));
     if(sp.stk>1)a.push(pill(`Stacking × ${sp.stk}`));
     if(cu)a.push(pill(`Buet lærred ${cu.dir!=='v'?`R3 ${f2(cu.rh,2)} m`:''}${cu.dir==='hv'?' · ':''}${cu.dir!=='h'?`R2 ${f2(cu.rv,2)} m`:''}`,k&&k.st==='ok'?'ok':'bad'));
     $('fgB05').innerHTML=`<span class="fgno notr">05</span>${a.length?a.join(''):'<span class="hint">Edge Blend, Stacking, Portrait Mode &amp; Curved: intet slået til</span>'}<button type="button" class="lnk fg05go" data-go05>Ændres i boks 05 <span aria-hidden="true">→</span></button>`}
    if(cu){const k=fgCurv(p,sp);cvOut=k.lines.map(l=>`<p class="${l.good?'cok':'cbad'}">${esc(l.t)}</p>`).join('')+'<p class="hint">Grænser fra tabellen «projection range» i projektorens manual. Lærredet skal være en cirkelbue (en del af en perfekt cirkel). Projektor-menu: <b class="notr">[GEOMETRY] → [CURVED CORRECTION]</b></p>'}
    const warn=fgWarn(p,sp);
    info=`<b>P${FG.sel+1} · ${esc(m.m)}</b> · <span class="notr">${esc(sp.ln[0])}</span> · throw ratio ${f2(sp.tr,2)}:1 · billede ${f3(sp.W)} × ${f3(sp.H)} m (${Math.round(sp.D)}″, ${sp.asp}${sp.pt?' · Portrait mode':''})`+
      (sp.n>1?` · <b>projektorer: ${sp.n}</b> (${sp.c} × ${sp.r}${sp.stk>1?` · stak ${sp.stk}`:''}) · samlet billede ${f3(sp.Wt)} × ${f3(sp.Ht)} m${bl?` · overlap ${bl.ov} %`:''}`:'')+
      ` · afstand ${f3(p.L)} m (${sp.fixed?'fast':`zoom ${f3(Math.min(distAt(sp.row,sp.D,0),distAt(sp.row,sp.D,1)))}–${f3(Math.max(distAt(sp.row,sp.D,0),distAt(sp.row,sp.D,1)))} m`})`+
      (sp.dn?(sp.fh>0?` · Top/down: billede på en flade ${f2(sp.fh,2)} m over gulvet`:' · Top/down: billede på gulvet'):` · billede fra ${f2(sp.yc-sp.Ht/2,2)} til ${f2(sp.yc+sp.Ht/2,2)} m over gulvet`)+` · lens shift V ${Math.round(sp.sv*100)} % · H ${Math.round(sp.sh*100)} % · ${Math.round(m.lm*sp.stk).toLocaleString('da-DK')} lm pr. billede`+
      (performance.now()-FGHIT<1500?` <span style="color:var(--warn)">· ${FGHITK==='lock'?'Lærredet er låst – lås det op for at flytte billedet':FGHITK==='lockP'?'Projektoren er låst – lås den op for at flytte den':'Grænsen for optik og lens shift er nået'}</span>`:'')+
      (bl&&bl.auto&&bl.autoOK===false?' <span style="color:var(--bad)">· Ingen opdeling passer – prøv en anden optik eller afstand.</span>':'')+
      (warn.length?` <span style="color:var(--bad)">· ${warn.join(' · ')}</span>`:'')}
  else{info=FG.pjs.length?'Klik på en projektor for at vælge den.':'Tryk «+ Projektor» eller dobbeltklik på gulvet for at sætte en projektor ind.';$('fgB05').innerHTML=''}
  $('fgInfo').innerHTML=info;$('fgCurvOut').innerHTML=cvOut;$('fgCurvOut').hidden=!cvOut;
  if(window.THREE&&THREE.OrbitControls){if(!G3.R)fg3Init();fg3Build();fg3Paint()}else fgLoad3()}

/* --- 3D (three.js fra web/warp-three.js) --- */
function fgLoad3(){if(fgLoad3.busy)return;fgLoad3.busy=1;$('fgMsg').hidden=false;const s=document.createElement('script');s.src='warp-three.js';
  s.onload=()=>{$('fgMsg').hidden=true;fgDraw()};s.onerror=()=>{fgLoad3.busy=0;$('fgMsg').textContent='3D kunne ikke indlæses.'};document.head.appendChild(s)}
const G3={},FGLB=new Map();
function fgTheme(){const v=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),m=/^#?([0-9a-f]{6})$/i.exec(v),n=m?parseInt(m[1],16):0x252A31,dark=((n>>16&255)*.3+(n>>8&255)*.59+(n&255)*.11)<128;
  return dark?{bg:n,floor:0x3A434E,wall:0x55606D,minor:0x48525E,major:0x6A7683,edge:0x8E9AA7,scr:0xDCE2E8}:{bg:n,floor:0xF4F6F8,wall:0xCBD2DA,minor:0xDDE2E8,major:0xAFB9C4,edge:0x5E6976,scr:0xFFFFFF}}
function fg3Init(){const cv=$('fgCv');G3.cv=cv;
  // egne museknapper først: rammes en projektor eller et billede, slås kameraets styring fra, mens der trækkes
  cv.addEventListener('pointerdown',fg3Down);cv.addEventListener('pointermove',fg3Move);cv.addEventListener('pointerup',fg3Up);cv.addEventListener('pointercancel',fg3Up);cv.addEventListener('dblclick',fg3Dbl);
  cv.addEventListener('keydown',e=>{if((e.key==='Delete'||e.key==='Backspace')&&FG.sel>=0){e.preventDefault();fgDel()}});
  const R=new THREE.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x8a93a0,.85));const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(.3,1,.6);sc.add(dl);
  const pc=new THREE.PerspectiveCamera(45,1.6,.05,3000),tc=new THREE.OrthographicCamera(-1,1,1,-1,-5000,5000),sd=new THREE.OrthographicCamera(-1,1,1,-1,-5000,5000);
  tc.up.set(0,0,-1);   // ovenfra: den øverste væg (plan-y = 0) øverst, som på plantegningen
  const mk=(cam,rot)=>{const o=new THREE.OrbitControls(cam,cv);o.enabled=false;o.addEventListener('change',fg3Paint);
    if(!rot){o.enableRotate=false;o.screenSpacePanning=true;o.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};o.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_PAN}}return o};
  Object.assign(G3,{R,sc,cams:{'3d':pc,top:tc,side:sd},ctl:{'3d':mk(pc,true),top:mk(tc,false),side:mk(sd,false)},root:new THREE.Group(),ray:new THREE.Raycaster(),pick:[],oh:{top:10,side:5},done:{}});sc.add(G3.root);
  new ResizeObserver(fg3Size).observe($('fgStage'));fg3Size();fg3View(FG.view,true)}
function fg3Size(){const st=$('fgStage'),w=st.clientWidth;if(!w||!G3.R)return;const h=Math.round(Math.min(window.innerHeight*.72,Math.max(320,w*.62)));
  if(G3.sz===w+'x'+h)return;G3.sz=w+'x'+h;G3.R.setSize(w,h);G3.cams['3d'].aspect=w/h;G3.cams['3d'].updateProjectionMatrix();fg3Ortho('top');fg3Ortho('side');fg3Paint()}
function fg3Ortho(k){const c=G3.cams[k],cv=G3.cv,a=(cv.clientWidth||16)/(cv.clientHeight||10),h=G3.oh[k];c.left=-h*a;c.right=h*a;c.top=h;c.bottom=-h;c.updateProjectionMatrix()}
// visning: 3D drejes frit; ovenfra og fra siden er uden perspektiv (som en tegning) – træk flytter, hjulet zoomer. Klik igen på samme knap: tilbage til start
function fg3View(v,reset){FG.view=v;for(const k in G3.ctl)G3.ctl[k].enabled=k===v;G3.cam=G3.cams[v];if(reset||!G3.done[v]){G3.done[v]=1;fg3Reset(v)}
  document.querySelectorAll('[data-fgv]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.fgv===v));
  $('fgHint').textContent=v==='3d'?'Venstre knap drejer kameraet · højre knap flytter · hjulet zoomer · træk projektoren eller billedet – optikken skifter, når zoomen ikke rækker · det blå felt viser, hvor projektoren kan stå · pilene ved projektoren ændrer lodret lens shift':
    v==='top'?'Træk i baggrunden for at flytte visningen · hjulet zoomer · træk projektoren eller billedet · træk i ringen ved billedet for at dreje · det blå felt viser, hvor projektoren kan stå · pilene ved projektoren ændrer lodret lens shift':
    'Træk projektoren op/ned og frem/tilbage · træk billedet op/ned og frem/tilbage · hjulet zoomer · det blå felt viser, hvor projektoren kan stå · pilene ved projektoren ændrer lodret lens shift';fg3Build();fg3Paint()}
function fg3Reset(v){const W=FG.w,D=FG.d,Hr=FG.hgt,c=G3.cams[v],o=G3.ctl[v],cv=G3.cv,a=(cv.clientWidth||16)/(cv.clientHeight||10),m=Math.max(1,Math.max(W,D)*.06);
  if(v==='3d'){c.position.set(W*1.02,Math.max(W,D)*.62+Hr*.8,D*1.5);o.target.set(W/2,Hr*.25,D/2)}
  // (lidt ekstra luft foroven til visningsknapperne)
  else if(v==='top'){const h=Math.max(D/2+m,(W/2+m)/a)*1.12;G3.oh.top=h;c.zoom=1;c.position.set(W/2,1000,D/2-h*.1);o.target.set(W/2,0,D/2-h*.1);fg3Ortho('top')}
  else{const h=Math.max(Hr/2+m,(D/2+m)/a)*1.12;G3.oh.side=h;c.zoom=1;c.position.set(W/2-1000,Hr/2+h*.1,D/2);o.target.set(W/2,Hr/2+h*.1,D/2);fg3Ortho('side')}
  c.updateProjectionMatrix();o.update()}
function fg3Paint(){if(G3.raf||!G3.R)return;G3.raf=requestAnimationFrame(()=>{G3.raf=0;
  if(FG.view==='3d'){const cp=G3.cam.position;G3.root.children.forEach(o=>{const d=o.userData&&o.userData.fgDyn;if(!d)return;const s=Math.min(d.max,o.position.distanceTo(cp)*.028*d.f);o.scale.set(s*d.a,s,1)})}
  G3.R.setClearColor(fgTheme().bg,1);G3.R.render(G3.sc,G3.cam)})}
function fg3Clear(g){while(g.children.length){const o=g.children.pop();o.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material)x.material.dispose()})}}
// tekstskilt (canvas-tekstur) – teksten oversættes som resten af appen
// back: rummets mål og meter-tal – ligger i baggrunden (skjules bag projektorer, billeder og lærred) i stedet for altid øverst
function fgLabel(t,c,pos,h,back){t=I18.tr(t,S.lang);const key=t+'|'+c;let tx=FGLB.get(key);
  if(!tx){const cv=document.createElement('canvas'),g=cv.getContext('2d'),fs=40,font=`600 ${fs}px "JetBrains Mono",ui-monospace,monospace`;g.font=font;const w=Math.ceil(g.measureText(t).width)+28;cv.width=w;cv.height=fs+22;
    g.font=font;g.fillStyle='rgba(255,255,255,.93)';g.strokeStyle=c;g.lineWidth=3;const r=10,W=w-3,H=cv.height-3;g.beginPath();g.moveTo(1.5+r,1.5);g.arcTo(1.5+W,1.5,1.5+W,1.5+H,r);g.arcTo(1.5+W,1.5+H,1.5,1.5+H,r);g.arcTo(1.5,1.5+H,1.5,1.5,r);g.arcTo(1.5,1.5,1.5+W,1.5,r);g.closePath();g.fill();g.stroke();
    g.fillStyle=c;g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,cv.height/2+2);tx=new THREE.CanvasTexture(cv);tx.minFilter=THREE.LinearFilter;tx.fgA=w/cv.height;
    if(FGLB.size>400){FGLB.forEach(x=>x.dispose());FGLB.clear()}FGLB.set(key,tx)}
  // 3D: fast størrelse på skærmen; ovenfra/fra siden: i meter, så skiltene følger tegningen (h er i meter – omregnes)
  // alle mærker har en fast størrelse i meter (i 3D og for rummets mærker), så de skalerer med zoom som resten af tegningen
  const s3=false,k=h/G3.lw,hh=back?h*1.25:FG.view==='3d'?h*1.6:G3.oh[FG.view]*2/(G3.cam.zoom||1)*.038*k;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:!!back,depthWrite:false,transparent:true,sizeAttenuation:!s3}));sp.scale.set(hh*tx.fgA,hh,1);sp.position.copy(pos);sp.renderOrder=back?-1:10;
  // projektorens mærker i 3D: følger zoom, men bliver aldrig store tæt på (størrelsen regnes ved hver tegning ud fra afstanden til kameraet)
  if(FG.view==='3d')sp.userData.fgDyn={a:tx.fgA,max:hh,f:back?k*.8:k};   // (rummets tal også – lidt mindre)
  if(back){sp.center.set(.5,0);sp.position.y+=.03}   // står på gulvet (nederste kant ved punktet) – så det ikke skæres af gulvet i nogle vinkler
  return sp}
// tekst til kabinettet (P1 …): kraftige bogstaver i projektorens farve med mørk kant
function fgBodyTex(t,c){const key='body|'+t+'|'+c;let tx=FGLB.get(key);if(tx)return tx;const cv=document.createElement('canvas');cv.width=256;cv.height=128;const g=cv.getContext('2d');
  g.font='800 92px "JetBrains Mono",ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';g.lineWidth=12;g.strokeStyle='rgba(10,16,24,.85)';g.strokeText(t,128,68);g.fillStyle=c;g.fillText(t,128,68);
  tx=new THREE.CanvasTexture(cv);tx.minFilter=THREE.LinearFilter;FGLB.set(key,tx);return tx}
/* indhold på lærredet (som boks 09): eget billede, testbillede eller golfbane – tegnes ind i et canvas og lægges på lærredet som tekstur.
   Eget billede dækker lærredet (beskæres som i 09, «slice»); testbillede og golfbane strækkes ud over hele lærredet. */
const fgTpKind=()=>{const k=S.tp||'std';return k==='blend'?'std':k};   // (edge blend-mønstret hører til appens egen projektor)
const fgContent=()=>S.content==='img'&&IMG?'img':S.content==='test'?'test':S.content==='golf'&&S.venue==='golf'?'golf':null;
const FGTX={key:'',e:null,cut:new Map()};
function fgContentTex(){const c=fgContent();if(!c)return null;const key=c==='img'?'img|'+IMG.length+'|'+IMG.slice(-64):c==='test'?'test|'+fgTpKind():'golf';
  if(FGTX.key===key)return FGTX.e&&FGTX.e.ok?FGTX.e:null;
  if(FGTX.e&&FGTX.e.tex)FGTX.e.tex.dispose();FGTX.cut.forEach(t=>t.dispose());FGTX.cut.clear();FGTX.key=key;const e=FGTX.e={ok:false},im=new Image();
  im.onload=()=>{if(FGTX.e!==e)return;const cv=document.createElement('canvas');let w=1600,h=1000;
    if(c==='img'){const f=Math.min(1,2048/Math.max(im.naturalWidth,im.naturalHeight));w=Math.max(1,Math.round(im.naturalWidth*f));h=Math.max(1,Math.round(im.naturalHeight*f));e.asp=w/h}else e.asp=0;
    cv.width=w;cv.height=h;cv.getContext('2d').drawImage(im,0,0,w,h);e.tex=new THREE.CanvasTexture(cv);e.tex.minFilter=THREE.LinearFilter;e.ok=true;if(FG.tab==='grid'&&G3.R){fg3Build();fg3Paint()}};
  im.src=c==='img'?IMG:c==='test'?testURI(fgTpKind()):'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000" preserveAspectRatio="none">${golfScene(0,0,1600,1000,'fg')}</svg>`);
  return null}
// tekstur til et lærred med formatet a (bredde/højde): eget billede beskæres midt på (som «slice»), så det dækker lærredet uden at blive forvrænget
function fgContentFor(a){const e=fgContentTex();if(!e)return null;if(!e.asp)return e.tex;const k=a.toFixed(3);let t=FGTX.cut.get(k);if(t)return t;
  t=e.tex.clone();t.needsUpdate=true;const r=a/e.asp;if(r<1){t.repeat.set(r,1);t.offset.set((1-r)/2,0)}else{t.repeat.set(1,1/r);t.offset.set(0,(1-1/r)/2)}FGTX.cut.set(k,t);return t}
const fgV=(x,y,z)=>new THREE.Vector3(x,y,z);
function fgLines(pts,color,o={}){const m=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:o.op!=null,opacity:o.op??1,depthTest:o.dt!==false}));if(o.dt===false)m.renderOrder=6;return m}
// en (evt. buet) flade over lærredets koordinater u (vandret) og v (lodret)
function fgSurf(S3,u0,u1,v0,v1,su,sv,mat){const g=new THREE.PlaneGeometry(1,1,su,sv),a=g.attributes.position;
  for(let k=0;k<a.count;k++){const P=S3(u0+(u1-u0)*(a.getX(k)+.5),v0+(v1-v0)*(a.getY(k)+.5));a.setXYZ(k,P.x,P.y,P.z)}a.needsUpdate=true;g.computeBoundingSphere();return new THREE.Mesh(g,mat)}
function fgEdge(S3,u0,u1,v0,v1,N){const q=[];for(let k=0;k<=N;k++)q.push(S3(u0+(u1-u0)*k/N,v1));for(let k=1;k<=N;k++)q.push(S3(u1,v1-(v1-v0)*k/N));
  for(let k=1;k<=N;k++)q.push(S3(u1-(u1-u0)*k/N,v0));for(let k=1;k<=N;k++)q.push(S3(u0,v0+(v1-v0)*k/N));const P=[];for(let k=0;k<q.length-1;k++)P.push(q[k],q[k+1]);return P}
function fg3Build(){const g=G3.root,T=fgTheme(),W=FG.w,D=FG.d,Hr=FG.hgt,lh=fgCl(Math.max(W,D)*.026,.22,1.6);G3.lw=lh;fg3Clear(g);G3.pick=[];
  // gulv og vægge: væggene vender ind og ses kun indefra, så man kan kigge ind udefra (som i et dukkehus)
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshLambertMaterial({color:T.floor}));fl.rotation.x=-Math.PI/2;fl.position.set(W/2,0,D/2);g.add(fl);
  [[W,W/2,0,0],[W,W/2,D,Math.PI],[D,0,D/2,Math.PI/2],[D,W,D/2,-Math.PI/2]].forEach(([a,x,z,ry])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(a,Hr),new THREE.MeshLambertMaterial({color:T.wall}));m.position.set(x,Hr/2,z);m.rotation.y=ry;g.add(m)});
  // gitter: tynde linjer for hvert trin, kraftigere for hver 5. meter
  const mi=[],ma=[],y=.005,st=FG.grid,maj=v=>Math.abs(v/5-Math.round(v/5))<1e-6;
  for(let x=st;x<W-1e-6;x+=st)(maj(x)?ma:mi).push(fgV(x,y,0),fgV(x,y,D));for(let z=st;z<D-1e-6;z+=st)(maj(z)?ma:mi).push(fgV(0,y,z),fgV(W,y,z));
  if(mi.length)g.add(fgLines(mi,T.minor));if(ma.length)g.add(fgLines(ma,T.major));
  const ed=[];for(const[a,b]of[[[0,0],[W,0]],[[W,0],[W,D]],[[W,D],[0,D]],[[0,D],[0,0]]])ed.push(fgV(a[0],y,a[1]),fgV(b[0],y,b[1]),fgV(a[0],Hr,a[1]),fgV(b[0],Hr,b[1]),fgV(a[0],0,a[1]),fgV(a[0],Hr,a[1]));g.add(fgLines(ed,T.edge));
  // mål og meter-tal langs væggene
  const ls=Math.max(W,D)>60?10:5;for(let x=0;x<=W+1e-6;x+=ls)g.add(fgLabel(String(x),'#6B7480',fgV(fgCl(x,lh*1.1,W-lh*1.1),.02,lh*.9),lh*.75,true));for(let z=ls;z<=D+1e-6;z+=ls)g.add(fgLabel(String(z),'#6B7480',fgV(lh*1.1,.02,fgCl(z,0,D-lh*.9)),lh*.75,true));   // lige inden for væggene (ellers skjuler væggen dem)
  g.add(fgLabel(`bredde ${f3(W,2)} m`,'#3F4B57',fgV(W/2,.02,D+lh*1.1),lh,true));g.add(fgLabel(`længde ${f3(D,2)} m`,'#3F4B57',fgV(W+lh*3.2,.02,D/2),lh,true));g.add(fgLabel(`højde ${f3(Hr,2)} m`,'#3F4B57',fgV(0,Hr+lh*.8,0),lh,true));
  FG.pjs.forEach((p,i)=>{const sp=fgSpec(p),q=fgGeo(p,sp),col=fgCol(i),c=new THREE.Color(col),sel=i===FG.sel,bad=fgWarn(p,sp).length>0,ry=-p.rot*FGR,cv=fgCurv(p,sp),curved=!!cv;
    const u3=fgV(q.u[0],0,q.u[1]),n3=fgV(q.n[0],0,q.n[1]),Y=fgV(0,1,0),C3=fgV(q.img[0],sp.yc,q.img[1]),zf=fgCZ(p),hw=sp.W/2,hh=sp.H/2,dn=sp.dn;
    // projektorens akser: F = lysets retning, V = billedets «op». Vandret: F fremad, V op. Top/down: F lodret ned, V fremad langs gulvet
    const F3=dn?fgV(0,-1,0):u3,V3=dn?u3:Y;
    // et punkt på lærredet: u vandret, v «op» fra det samlede billedes midte; et buet lærred kommer frem mod projektoren ude ved kanterne
    const S3=(u,v,e=0)=>C3.clone().addScaledVector(n3,u).addScaledVector(V3,v).addScaledVector(F3,e-zf(u,v));
    const su=curved&&p.curv.dir!=='v'?32:1,sv=curved&&p.curv.dir!=='h'?20:1;
    // lærredet selv (fladt eller buet): præcis det samlede billedes størrelse (billedet fylder altid lærredet ud), lige bag billedet
    // buet: grønt/rødt omrids efter manualens grænse · fladt: neutralt omrids
    {const u0=-sp.Wt/2,u1=sp.Wt/2,v0=-sp.Ht/2,v1=sp.Ht/2;
      const map=fgContentFor(sp.Wt/sp.Ht);   // indhold på lærredet (ikke lyst op af scenens lys – som et projiceret billede)
      g.add(fgSurf((u,v)=>S3(u,v,.015),u0,u1,v0,v1,su,sv,map?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({color:T.scr,side:THREE.DoubleSide})));
      g.add(fgLines(fgEdge((u,v)=>S3(u,v,.01),u0,u1,v0,v1,curved?32:1),curved?(cv.st==='ok'?0x17834F:0xC23A22):0x6B7480));
      // top/down på en hævet flade (fx et bord): en klods fra gulvet op til fladen, lige så stor som billedet
      if(dn&&sp.fh>.01){const tb=new THREE.Mesh(new THREE.BoxGeometry(sp.Wt,sp.fh,sp.Ht),new THREE.MeshLambertMaterial({color:T.scr,transparent:true,opacity:.55}));tb.position.set(C3.x,sp.fh/2,C3.z);tb.rotation.y=ry;g.add(tb);
        const te=new THREE.LineSegments(new THREE.EdgesGeometry(tb.geometry),new THREE.LineBasicMaterial({color:0x6B7480}));te.position.copy(tb.position);te.rotation.y=ry;g.add(te)}}   // radius og tjek står i 05-markeringen og under felterne
    // B0: kabinettets midte (top/down: linsen nederst ved linsehøjden, kabinettet over den)
    const tiles=fgTiles(sp),B0=fgV(p.x,p.h+(dn?sp.Lo:0),p.y),stH=sp.bh*1.08*sp.sg;
    tiles.forEach((t,k)=>{const Bc=B0.clone().addScaledVector(n3,t.xc).addScaledVector(V3,t.yr),Lc=Bc.clone().addScaledVector(F3,sp.Lo),u0=t.xc-hw,u1=t.xc+hw,v0=t.yr-hh,v1=t.yr+hh;
      // kabinetter: én pr. billede, og ved stacking flere oven på hinanden (under hinanden når loftmonteret; top/down: bag hinanden)
      // projektoren tegnes som skitsen i boks 08/09/10 (06c-pjsketch.js): kabinet, optik og detaljer ud fra TDC-målene – også L-formet optik og ultrakort kast
      const PK=pkModel({m:sp.m,ln:sp.ln,PT:sp.port},{ceil:!!p.inv,lrot:0}),PQ=pkQuat(n3,V3,F3);
      for(let s=0;s<sp.stk;s++){const L0=Lc.clone().addScaledVector(V3,s*stH),W3=(x,y,z)=>L0.clone().addScaledVector(n3,x).addScaledVector(V3,y).addScaledVector(F3,-z);
        const sk=pkThree(PK,W3,PQ,sel);g.add(sk.g);const cb=sk.cab.geometry.parameters,cs=[cb.width,cb.height,cb.depth];   // cs: kabinettets udstrækning (højre, op, bagud)
        // usynlig greb-kasse om kabinettet (navn, luft ind/ud og markering bruger den)
        const bm=new THREE.Mesh(new THREE.BoxGeometry(...cs),new THREE.MeshBasicMaterial({visible:false}));bm.position.copy(sk.cab.position);bm.quaternion.copy(PQ);bm.userData={fg:'body',i};g.add(bm);G3.pick.push(bm);
        sk.g.traverse(o=>{if(o.isMesh){o.userData={fg:'body',i};G3.pick.push(o)}});
        if(typeof window.airFG==='function')window.airFG(g,p,sp,bm.position,{u3,n3,V3,F3,dn,ry,i});   // luft ind/ud (17c-airflow.js)
        if(sel){const e=new THREE.LineSegments(new THREE.EdgesGeometry(bm.geometry),new THREE.LineBasicMaterial({color:c}));e.position.copy(bm.position);e.quaternion.copy(PQ);g.add(e)}
        // navnet (P1 …) står på selve kabinettet: oven på og bagpå – læses bagfra, set fra projektorens plads
        {const tx=fgBodyTex(`P${i+1}`,col),tw=Math.min(cs[0]*.85,cs[2]*1.6),th=tw/2,mt=()=>new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false});
         if(dn){const tp=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(tw,cs[0]*.85),Math.min(th,cs[1]*.8)),mt());tp.position.copy(bm.position).add(fgV(0,cs[2]/2+.003,0));tp.rotation.set(-Math.PI/2,ry,0,'YXZ');g.add(tp)}
         else{const tp=new THREE.Mesh(new THREE.PlaneGeometry(tw,Math.min(th,cs[2]*.8)),mt());tp.position.copy(bm.position).add(fgV(0,(p.inv?-1:1)*(cs[1]/2+.003),0));tp.rotation.set(p.inv?Math.PI/2:-Math.PI/2,ry,0,'YXZ');g.add(tp);
         const bk=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(tw,cs[1]*1.7),Math.min(th,cs[1]*.85)),mt());bk.position.copy(bm.position).addScaledVector(u3,-(cs[2]/2+.003));bk.rotation.y=ry;g.add(bk)}}}
      {const px=new THREE.Mesh(new THREE.SphereGeometry(Math.max(lh*.7,sp.bw*.7),12,8),new THREE.MeshBasicMaterial({visible:false}));px.position.copy(Bc);px.userData={fg:'body',i};g.add(px);G3.pick.push(px)}   // større greb end selve kabinettet
      // linsens midtpunkt: en halv kugle foran optikken (buen peger mod lærredet), så den ikke går ind i optikken
      const ln=new THREE.Mesh(new THREE.SphereGeometry(Math.max(.05,sp.bh*.25),16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));ln.position.copy(Lc);ln.quaternion.setFromUnitVectors(fgV(0,1,0),F3.clone().normalize());g.add(ln);
      // lyskeglen og billedet (overlap i edge blend ses som de tættere farvede felter)
      const cs=[S3(u0,v1),S3(u1,v1),S3(u1,v0),S3(u0,v0)],bp=[];cs.forEach(v=>bp.push(Lc,v));g.add(fgLines(bp.concat(fgEdge(S3,u0,u1,v0,v1,curved?16:1)),bad?0xC23A22:col,{op:sel?.95:.6}));
      g.add(new THREE.Mesh(new THREE.BufferGeometry().setFromPoints(cs.flatMap((v,j)=>[Lc,v,cs[(j+1)%4]])),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:sel?.1:.06,side:THREE.DoubleSide,depthWrite:false})));
      const im=fgSurf(S3,u0,u1,v0,v1,Math.max(1,Math.round(su*sp.W/sp.Wt)),Math.max(1,Math.round(sv*sp.H/sp.Ht)),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:fgContent()?(sel?.16:.1):sp.n>1?(sel?.42:.3):(sel?.62:.45),side:THREE.DoubleSide,depthWrite:false}));   // med indhold: kun en svag farve, så billedet ses
      im.userData={fg:'img',i};g.add(im);G3.pick.push(im)});
    // lod fra hver projektor ned til gulvet / op til loftet (i et sæt: fra hver af dem, ikke fra sættets midte)
    if(!dn){const lp=[];tiles.forEach(t=>{const B=B0.clone().addScaledVector(n3,t.xc).addScaledVector(Y,t.yr);lp.push(B,fgV(B.x,p.inv?Hr:0,B.z))});g.add(fgLines(lp,col,{op:.6}))}
    // billedets midte: greb (vises altid oven på)
    const Cm=S3(0,0);
    if(sel){const hd=new THREE.Mesh(new THREE.SphereGeometry(lh*.32,20,12),new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false}));hd.position.copy(Cm);hd.renderOrder=8;hd.userData={fg:'hdl',i};g.add(hd);G3.pick.push(hd);
      const rg=new THREE.Mesh(new THREE.SphereGeometry(lh*.42,20,12),new THREE.MeshBasicMaterial({color:p.lockS?0x8E9AA7:c,depthTest:false,transparent:true,opacity:.6}));rg.position.copy(Cm);rg.renderOrder=7;g.add(rg);
      // tilladt område (som på plantegningen): en stiplet ramme med lys udfyldning, hvor optikken kan stå med denne optik og dette billede.
      // Ovenfra/3D: vandret ved linsehøjden – zoom frem/tilbage × vandret lens shift. Fra siden: lodret – zoom frem/tilbage × lodret lens shift
      {const a=distAt(sp.row,sp.D,0),b=sp.fixed?a:distAt(sp.row,sp.D,1),lo=Math.min(a,b),hi=Math.max(a,b),shr=fgShR(sp.m,sp.ln,sp.pt,sp.sv),svr=fgSvR(sp.m,sp.ln,sp.pt,sp.sh);
       const xa=-sp.sg*(shr[0]+sp.offH)*sp.W,xb=-sp.sg*(shr[1]+sp.offH)*sp.W,x0=Math.min(xa,xb),x1=Math.max(xa,xb),ha=sp.yc-sp.sg*(svr[1]+sp.off)*sp.H,hb=sp.yc-sp.sg*(svr[0]+sp.off)*sp.H,y0=Math.min(ha,hb),y1=Math.max(ha,hb),side=FG.view==='side';
       // edge blend: ét felt pr. projektor i sættet (ved dens egen sideforskydning og højde) – ikke midt i sættet, hvor der ingen projektor står
       const Cs=fgV(q.img[0],0,q.img[1]),tl=fgTiles(sp),last=tl.reduce((a,t)=>t.xc>a.xc+1e-9||(Math.abs(t.xc-a.xc)<1e-9&&Math.abs(t.yr)<Math.abs(a.yr))?t:a,tl[0]);
       const P=(t,lat,dist,y)=>Cs.clone().addScaledVector(n3,t.xc+lat).addScaledVector(u3,-dist).setY(y+t.yr);
       // top/down: linsen kan stå i et vandret felt over billedet (vandret shift × lodret shift, der her er frem/tilbage) og i højden inden for zoomen
       const f0=-(svr[1]+sp.off)*sp.H,f1=-(svr[0]+sp.off)*sp.H,PD=(t,lat,fw,y)=>Cs.clone().addScaledVector(n3,t.xc+lat).addScaledVector(u3,t.yr+fw).setY(y);
       const seen=new Set();tl.forEach(t=>{const key=side?(dn?t.xc.toFixed(3):t.yr.toFixed(3)):t.xc.toFixed(3)+'|'+t.yr.toFixed(3);if(seen.has(key))return;seen.add(key);   // fra siden ligger søjlerne oven i hinanden
         const cs=dn?(side?[PD(t,0,f0,lo+sp.fh),PD(t,0,f1,lo+sp.fh),PD(t,0,f1,hi+sp.fh),PD(t,0,f0,hi+sp.fh)]:[PD(t,x0,f0,p.h),PD(t,x1,f0,p.h),PD(t,x1,f1,p.h),PD(t,x0,f1,p.h)])
           :side?[P(t,0,lo,y0),P(t,0,hi,y0),P(t,0,hi,y1),P(t,0,lo,y1)]:[P(t,x0,lo,p.h),P(t,x0,hi,p.h),P(t,x1,hi,p.h),P(t,x1,lo,p.h)];
         g.add(new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([cs[0],cs[1],cs[2],cs[0],cs[2],cs[3]]),new THREE.MeshBasicMaterial({color:0x62C9EC,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide})));
         const ol=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(cs),new THREE.LineDashedMaterial({color:0x2FA3D6,dashSize:lh*.32,gapSize:lh*.2}));ol.computeLineDistances();g.add(ol);
         if(dn){if(!side)g.add(fgLines([PD(t,(x0+x1)/2,(f0+f1)/2,lo+sp.fh),PD(t,(x0+x1)/2,(f0+f1)/2,hi+sp.fh)],0x2FA3D6,{op:.7}))}   // lodret: zoomens højder
         else if(!side)g.add(fgLines([P(t,(x0+x1)/2,lo,p.h),P(t,(x0+x1)/2,hi,p.h)],0x2FA3D6,{op:.7}))});   // midterlinje for zoomen
       // (afstandene min/max står i infolinjen – ikke som skilte i 3D)
       // lodret lens shift: to pile ved projektoren (længst til højre i et sæt) – klik = 1 %, Shift-klik = 10 %, hold for at blive ved
       // (top/down: pilene peger frem/tilbage langs gulvet – den vej billedet flytter sig)
       const L0=B0.clone().addScaledVector(V3,last.yr).addScaledVector(F3,sp.Lo).addScaledVector(n3,last.xc+sp.bw/2+lh*.9);
       if(svr[1]-svr[0]>.005){const cone=(dir,y)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(lh*.3,lh*.55,16),new THREE.MeshBasicMaterial({color:0x2FA3D6,depthTest:false}));
           m.position.copy(L0).addScaledVector(V3,y);m.quaternion.setFromUnitVectors(Y,V3.clone().multiplyScalar(dir));m.renderOrder=9;m.userData={fg:dir>0?'svUp':'svDn',i};g.add(m);G3.pick.push(m);
           const hp=new THREE.Mesh(new THREE.SphereGeometry(lh*.45,10,8),new THREE.MeshBasicMaterial({visible:false}));hp.position.copy(m.position);hp.userData=m.userData;g.add(hp);G3.pick.push(hp)};
         cone(1,lh*.65);cone(-1,-lh*.65)}
       // lens shift V og H i ét mærke ved pilene
       {const s=fgLabel(`V ${Math.round(sp.sv*100)} % · H ${Math.round(sp.sh*100)} %`,'#0B6E9C',L0.clone().addScaledVector(n3,lh*.55),lh*.6);s.center.set(0,.5);g.add(s)}}   // starter lige til højre for pilene
      // drej-greb ved billedets højre kant (kun når lærredet ikke er låst; ikke fra siden)
      if(!p.lockS&&!p.lockP&&FG.view!=='side'){const rp=S3(sp.Wt/2+lh*1.4,0),tr=new THREE.Mesh(new THREE.TorusGeometry(lh*.38,lh*.09,8,28),new THREE.MeshBasicMaterial({color:c,depthTest:false}));tr.position.copy(rp);tr.rotation.x=-Math.PI/2;tr.renderOrder=8;g.add(tr);
        const tp=new THREE.Mesh(new THREE.SphereGeometry(lh*.55,12,8),new THREE.MeshBasicMaterial({visible:false}));tp.position.copy(rp);tp.userData={fg:'rot',i};g.add(tp);G3.pick.push(tp)}}
    g.add(fgLabel(`${f3(sp.Wt,2)} × ${f3(sp.Ht,2)} m${fgBl(p)?` · overlap ${fgBl(p).ov} %`:''}${p.lockS?' · låst':''}`,bad?'#C23A22':col,S3(0,sp.Ht/2).add(fgV(0,lh*.8,0)),lh));
    if(sel){const mp=fgV(p.x,p.h,p.y).addScaledVector(u3,dn?0:sp.Lo).lerp(C3,.5).add(fgV(0,lh*.9,0));g.add(fgLabel(`L ${f3(p.L)} m`,col,mp,lh))}});
  g.updateMatrixWorld(true)}   // så der kan sigtes på det nye med det samme (før næste tegning)
const fgPlane=(n,c)=>new THREE.Plane(n,c);
// under et træk bruges rudens placering fra trækkets start: skifter infolinjen over 3D-billedet højde (fx en advarsel), må punktet ikke hoppe
function fg3Ray(e){const r=G3.dragRect||G3.cv.getBoundingClientRect();G3.cam.updateMatrixWorld();G3.ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),G3.cam);return G3.ray}
const fg3Hit=(ray,pl)=>{const q=new THREE.Vector3();return ray.ray.intersectPlane(pl,q)?q:null};
function fg3Down(e){G3.dn=[e.clientX,e.clientY];if(e.button!==0)return;const ray=fg3Ray(e);
  const top=o=>/^(hdl|rot|svUp|svDn)$/.test(o.userData.fg);
  const h=ray.intersectObjects(G3.pick.filter(top),false)[0]||ray.intersectObjects(G3.pick.filter(o=>!top(o)),false)[0];if(!h)return;
  // pilene: lodret lens shift et trin op/ned (hold for at blive ved)
  if(/^sv/.test(h.object.userData.fg)){const i=h.object.userData.i,dir=h.object.userData.fg==='svUp'?1:-1,st=e.shiftKey?.1:.01;FG.sel=i;e.preventDefault();G3.cv.setPointerCapture(e.pointerId);G3.ctl[FG.view].enabled=false;setTimeout(()=>{if(!G3.drag)G3.ctl[FG.view].enabled=true},0);
    const go=()=>{const p=FG.pjs[i];if(p){fgStepSv(p,dir*st);fgDraw()}};go();clearInterval(G3.rep);G3.rep=setTimeout(()=>{G3.rep=setInterval(go,70)},380);return}
  const {fg,i}=h.object.userData,p=FG.pjs[i],sp=fgSpec(p),side=FG.view==='side',s0=fgScr(p,sp),d={i,k:fg==='body'?'body':fg==='rot'?'rot':'img',s0};FG.sel=i;
  // låst lærred: billedet kan ikke trækkes (projektoren vælges bare)
  if((d.k==='img'||d.k==='rot')&&p.lockS){hitFG('lock');fgDraw();return}
  // låst projektor: den kan ikke flyttes eller drejes – billedet kan stadig trækkes inden for lens shift og zoom
  if((d.k==='body'||d.k==='rot')&&p.lockP){hitFG('lockP');fgDraw();return}
  if(d.k==='body'){d.pl=side?fgPlane(fgV(1,0,0),-p.x):fgPlane(fgV(0,1,0),-p.h);const q=fg3Hit(ray,d.pl);if(!q)return;d.off=side?[q.z-p.y,q.y-p.h]:[q.x-p.x,q.z-p.y]}
  else if(d.k==='img'){if(side){d.pl=fgPlane(fgV(1,0,0),-s0.c[0]);const q=fg3Hit(ray,d.pl);if(!q)return;d.off=[q.z-s0.c[1],q.y-s0.yc]}
    else{d.pl=fgPlane(fgV(0,1,0),-s0.yc);const q=fg3Hit(ray,d.pl);if(!q)return;d.off=[q.x-s0.c[0],q.z-s0.c[1]]}}
  else{d.pl=fgPlane(fgV(0,1,0),-s0.yc);const q=fg3Hit(ray,d.pl);if(!q)return;d.a0=Math.atan2(q.z-s0.c[1],q.x-s0.c[0]);d.rot0=p.rot;d.p0=[p.x,p.y]}
  G3.drag=d;G3.dragRect=G3.cv.getBoundingClientRect();G3.ctl[FG.view].enabled=false;G3.cv.setPointerCapture(e.pointerId);e.preventDefault();G3.cv.focus({preventScroll:true});fgDraw()}
function fg3Move(e){const d=G3.drag;if(!d)return;const p=FG.pjs[d.i];if(!p)return;const q=fg3Hit(fg3Ray(e),d.pl);if(!q)return;const side=FG.view==='side',sn=FG.snap&&!e.shiftKey,s=Math.min(.25,FG.grid/2),R=(v,t)=>sn?Math.round(v/t)*t:v;
  if(d.k==='body'){let x=p.x,y,h=p.h;if(side){y=R(q.z-d.off[0],s);h=R(q.y-d.off[1],.05)}else{x=R(q.x-d.off[0],s);y=R(q.z-d.off[1],s)}
    x=fgCl(x,0,FG.w);y=fgCl(y,0,FG.d);h=fgCl(h,.05,FG.hgt-.05);
    // låst lærred: billedet bliver stående – afstand, zoom, shift og evt. optik regnes om, og projektoren stopper ved grænsen. Ulåst: billedet følger med
    if(p.lockS)fgMoveTo(p,d.s0,[x,y,h]);else{p.x=fgR3(x);p.y=fgR3(y);if(side)fgSetH(p,h)}}
  else if(d.k==='img'){// billedet flyttes, projektoren står: afstand, zoom, shift og evt. optik regnes om
    const s0=fgScr(p),s1=side?{...s0,c:[s0.c[0],q.z-d.off[0]],yc:q.y-d.off[1]}:{...s0,c:[q.x-d.off[0],q.z-d.off[1]]};fgMoveScr(p,s0,s1)}
  else{// drej hele opstillingen (projektor og billede) om billedets midte
    const st=e.shiftKey?15:FG.snap?5:1,a=Math.atan2(q.z-d.s0.c[1],q.x-d.s0.c[0]);let r=d.rot0+(a-d.a0)/FGR;r=Math.round(r/st)*st;const da=(r-d.rot0)*FGR,c=d.s0.c,vx=d.p0[0]-c[0],vy=d.p0[1]-c[1];
    p.rot=((r%360)+540)%360-180;p.x=fgR3(c[0]+vx*Math.cos(da)-vy*Math.sin(da));p.y=fgR3(c[1]+vx*Math.sin(da)+vy*Math.cos(da))}
  fgRedraw()}
function fg3Up(e){if(G3.rep){clearTimeout(G3.rep);clearInterval(G3.rep);G3.rep=0;G3.dn=null;return}
  if(G3.drag){G3.drag=null;G3.dragRect=null;G3.ctl[FG.view].enabled=true;return}
  // et klik (uden at trække) i baggrunden fravælger projektoren
  if(G3.dn&&e.button===0&&Math.hypot(e.clientX-G3.dn[0],e.clientY-G3.dn[1])<4&&FG.sel>=0){FG.sel=-1;fgDraw()}}
function fg3Dbl(e){const ray=fg3Ray(e);if(ray.intersectObjects(G3.pick,false).length)return;const q=fg3Hit(ray,fgPlane(fgV(0,1,0),0));if(q&&fgIn([q.x,q.z]))fgAdd([q.x,q.z])}
/* Boks 05 er det eneste sted, funktionerne slås til og ændres. Mens Free Grid-fanen er åben, viser og ændrer boks 05 den valgte Free Grid-projektor:
   - fanen åbnes: appens egne 05-indstillinger gemmes, og den valgte projektors lægges i boks 05 (også når en anden projektor vælges)
   - et felt ændres i boks 05: kun det ændrede felt sættes på projektoren
   - tilbage til Plantegning: appens egne 05-indstillinger lægges tilbage */
const F05=['portrait','blend','bc','br','ov','bauto','bth','stackOn','stack'];
function fg05Put(p){S.portrait=!!p.port;const b=p.bl;S.blend=!!(b&&b.on);if(b){S.bc=b.c;S.br=b.r;S.ov=b.ov;S.bauto=!!b.auto;if(b.th>0)S.bth=b.th}else S.bauto=false;
  S.stackOn=!!(p.st&&p.st.on);S.stack=p.st?fgCl(p.st.k||2,2,4):2;const c=p.curv;S.curv=c?{on:!!c.on,dir:c.dir,rh:c.rh,rv:c.rv}:{...(S.curv||{dir:'h',rh:10,rv:10}),on:false}}
function fg05Mode(){const g=FG.tab==='grid';
  if(g&&!FG.app05){FG.app05={...Object.fromEntries(F05.map(k=>[k,S[k]])),curv:JSON.parse(JSON.stringify(S.curv||{}))};FG.sel05=undefined}
  if(!g&&FG.app05){const a=FG.app05;FG.app05=null;F05.forEach(k=>{S[k]=a[k]});S.curv=a.curv;FG.s05=fg05();return true}
  if(g&&FG.sel05!==FG.sel){FG.sel05=FG.sel;const p=FG.pjs[FG.sel];if(p){fg05Put(p);FG.s05=fg05();return true}}
  return false}
const fg05=()=>{const c=S.curv||{};return {port:!!S.portrait,bl:!!S.blend,bc:Math.round(S.bc),br:Math.round(S.br),ov:Math.round(S.ov),ba:!!S.bauto,th:S.bth,so:!!S.stackOn,sk:Math.round(S.stack||2),co:!!c.on,cd:c.dir,rh:c.rh,rv:c.rv}};
function fgSync05(){const n=fg05(),o=FG.s05;FG.s05=n;const p=FG.pjs[FG.sel];if(!o||FG.tab!=='grid'||!p)return;const ch=k=>n[k]!==o[k];if(!Object.keys(n).some(ch))return;
  if(ch('port')){const sp=fgSpec(p),s=fgScr(p,sp);p.port=n.port;if(p.lockS)fgKeepScr(p,s);else{fgSetLW(p,p.L,sp.W);fgSetSvFor(p,sp.yc)}}
  if(ch('bl')||ch('bc')||ch('br')||ch('ov')||ch('ba')||ch('th')){const Wt=fgSpec(p).Wt;p.bl=p.bl||{c:2,r:1,ov:15,auto:false,th:0};const b=p.bl;
    // slås edge blend til, tages alle tal fra boks 05 (ellers står fx overlap på projektorens gamle/standardværdi, mens boks 05 viser noget andet)
    if(ch('bl')){b.on=n.bl;if(n.bl){b.ov=fgCl(n.ov,0,50);b.auto=n.ba;if(n.th>0)b.th=n.th}}if(ch('ov'))b.ov=fgCl(n.ov,0,50);if(ch('ba'))b.auto=n.ba;if(ch('th')&&n.th>0)b.th=n.th;
    if(!b.auto){if(ch('bc')||ch('bl'))b.c=fgCl(n.bc,1,8);if(ch('br')||ch('bl'))b.r=fgCl(n.br,1,4)}if(b.on&&!b.auto&&b.c*b.r<2)b.c=2;
    fgSize(p,Wt/fgSpec(p).kx);if(b.auto&&!(b.th>0))b.th=Math.round(fgSpec(p).Ht*100)/100;fgAuto(p)}
  if(ch('so')||ch('sk')){p.st=p.st||{k:2};if(ch('so'))p.st.on=n.so;p.st.k=fgCl(n.sk,2,4)}
  if(ch('co')||ch('cd')||ch('rh')||ch('rv')){p.curv=p.curv||{dir:'h',rh:10,rv:10};const c=p.curv;if(ch('co'))c.on=n.co;if(n.cd)c.dir=n.cd;if(n.rh>0)c.rh=n.rh;if(n.rv>0)c.rv=n.rv}}
/* Buet lærred slås til i boks 05: radius sættes til den mindste, manualen tillader for optikken og afstanden (uden keystone), rundet op til 0,1 m – så tjekket er grønt fra start.
   Free Grid åben: den valgte projektor; ellers appens egen projektor (curvRow, S.L). Ukendt optik / ingen curved correction: radius røres ikke */
const fgCurvMin=(row,L)=>row&&row[6]!=null?{rv:Math.ceil(row[6]*L*10+1e-9)/10,rh:Math.ceil(row[7]*L*10+1e-9)/10}:null;
function fgCurvRowOf(sp){for(const k of etCodes(sp.ln[0]))if(CURV[k])return CURV[k];const mk=sp.m.m.split(' (')[0].split('/')[0];return CURV[mk]||null}
// (lytter på dokumentet: boks 05's knap til buet lærred laves først senere af 26-curved.js – og dokumentet hører det efter knappens egen lytter)
document.addEventListener('change',e=>{const cb=e.target;if(!cb||cb.id!=='curvOn'||!cb.checked||!S.curv)return;{const p=FG.tab==='grid'?FG.pjs[FG.sel]:null;
  const mn=p?fgCurvMin(fgCurvRowOf(fgSpec(p)),p.L):(()=>{const r=curvRow();return fgCurvMin(r&&r.v,S.L)})();if(!mn)return;
  S.curv.rh=Math.max(.5,mn.rh);S.curv.rv=Math.max(.5,mn.rv);render()}});
/* Boks 01 (afstand og billedstørrelse) og boks 02 (rummet) viser og ændrer Free Grid, mens fanen er åben – som boks 05.
   Indtastningen fanges før appens egne lyttere, så appens egne tal (S.L, S.cw, S.rd …) ikke røres; tilbage på Plantegning viser felterne appens tal igen. */
// ny linsehøjde (ulåst lærred): top/down → afstanden følger med (zoomen holdes, billedet bliver større/mindre)
function fgSetH(p,h){if(p.down){const fh=fgFh(p);p.h=fgR3(fgCl(h,fh+.1,FG.hgt-fgSpec(p).top));p.L=fgR3(p.h-fh)}else p.h=fgR3(fgCl(h,.05,FG.hgt-.05))}
function fgMvTo(p,x,y,h){fgMoveTo(p,fgScr(p),[fgCl(x,0,FG.w),fgCl(y,0,FG.d),fgCl(h,.05,FG.hgt-.05)])}
function fgSetDist(p,v){
  // låst projektor: billedet flyttes langs projektorens akse (inden for zoom/optik)
  if(p.lockP){const s0=fgScr(p),{u}=fgDir(p),dl=Math.max(.1,v)-p.L;fgMoveScr(p,s0,{...s0,c:[s0.c[0]+u[0]*dl,s0.c[1]+u[1]*dl]});fgAuto(p);return}
  if(p.lockS){const {u}=fgDir(p),dl=p.L-Math.max(.1,v);fgMvTo(p,p.x+u[0]*dl,p.y+u[1]*dl,p.h)}else fgSetLW(p,v,fgSpec(p).W);fgAuto(p)}
function fgSetWt(p,Wt){if(p.lockS||!(Wt>0))return;const sp=fgSpec(p);fgSetLW(p,p.L,Wt/sp.kx);fgAuto(p)}   // billedbredde = det samlede billede
// den valgte Free Grid-projektor, mens fanen er åben (boks 03 viser og ændrer den) – ellers null. Kan kaldes før FG findes (opstart)
function fgSlotPj(){try{return FG.tab==='grid'&&FG.pjs[FG.sel]||null}catch(e){return null}}
const FG0102={dist:(p,v)=>p&&fgSetDist(p,v),cw:(p,v)=>p&&fgSetWt(p,v),
  ch:(p,v)=>{if(!p)return;const sp=fgSpec(p);fgSetWt(p,v*sp.Wt/sp.Ht)},cd:(p,v)=>{if(!p)return;const sp=fgSpec(p);fgSetWt(p,v*IN*sp.Wt/Math.hypot(sp.Wt,sp.Ht))},
  // boks 03 (model og optik) styrer den valgte Free Grid-projektor – Free Grid har ikke sine egne valg
  model:(p,v)=>{if(!p)return;const s=fgScr(p);p.mi=v;fgFitLens(p,s.W);if(p.lockS)fgKeepScr(p,s);fgAuto(p);fgDraw()},
  // valgt optik holdes (også når den ikke kan på den nuværende afstand – så flyttes projektoren, hvis lærredet er låst)
  lens:(p,v)=>{if(!p)return;const s=fgScr(p);p.li=v;if(p.lockS){const lo=p.lockO;p.lockO=true;fgKeepScr(p,s);p.lockO=lo}else fgSetLW(p,p.L,s.W);fgAuto(p);fgDraw()},
  rw:(p,v)=>{FG.w=fgCl(v,2,200)},rd:(p,v)=>{FG.d=fgCl(v,2,200)},rh:(p,v)=>{FG.hgt=fgCl(v,2,60);FG.pjs.forEach(q=>{q.h=Math.min(q.h,FG.hgt-.05)})}};
function fg0102In(e){const el=e.target;if(FG.tab!=='grid'||!el||!FG0102[el.id])return;if(e.type==='keydown'&&e.key!=='Enter')return;
  if((el.id==='model'||el.id==='lens')&&(e.type!=='change'||!FG.pjs[FG.sel]))return;   // ingen projektor valgt: boks 03 vælger appens projektor (som nye Free Grid-projektorer starter med)
  e.stopImmediatePropagation();if(e.type==='keydown')e.preventDefault();const v=parseFloat(String(el.value).replace(',','.'));
  if(Number.isFinite(v))FG0102[el.id](FG.pjs[FG.sel],v);render();if(e.type==='keydown')el.select()}
document.addEventListener('change',fg0102In,true);document.addEventListener('keydown',fg0102In,true);
function fg0102Show(){if(FG.tab!=='grid')return;const p=FG.pjs[FG.sel],sp=p&&fgSpec(p),set=(id,v)=>{const el=$(id);if(el&&document.activeElement!==el)el.value=v};
  set('rd',FG.d);set('rw',FG.w);set('rh',FG.hgt);
  if(sp){set('dist',p.L.toFixed(3));set('cw',sp.Wt.toFixed(3));set('ch',sp.Ht.toFixed(3));set('cd',Math.round(Math.hypot(sp.Wt,sp.Ht)/IN))}
  fgKPI(p,sp)}
// boks 01's tekst under felterne og nøgletallene (07) for den valgte Free Grid-projektor – samme formler og tekster som appens (05-i18n.js)
function fgKPI(p,sp){const hint=$('sizeHint'),kp=$('kpis');if(!hint||!kp)return;const KH='<h3 class="kh"><span class="no">07</span>Nøgletal</h3>';
  if(!sp){hint.innerHTML='Free Grid: ingen projektor valgt.';kp.innerHTML=KH;return}
  const K=(cls,k,v,s,vc='')=>`<div class="kpi ${cls}"><span class="k">${k}</span><span class="v ${vc}">${v}</span><span class="s">${s}</span></div>`;
  const m=sp.m,row=sp.row,Lw=distAt(row,sp.D,0),LtO=distAt(row,sp.D,1),bl=fgBl(p),hyp=Math.hypot(sp.aw,sp.ah);
  const pre=`<b>Free Grid · P${FG.sel+1}</b> · `;
  if(bl)hint.innerHTML=pre+`Samlet billede. Pr. projektor: <b>${f3(sp.W)} × ${f3(sp.H)} m</b> (${fi(sp.D)}″).`;
  else{const wpr=diagFor(row,p.L,0)*IN*sp.aw/hyp;hint.innerHTML=pre+`${sp.fixed?'Billedstørrelse':'Maksimal billedstørrelse'} ved ${f3(p.L)} m: <b>${f3(wpr)} × ${f3(wpr*sp.H/sp.W)} m</b> (${fi(Math.hypot(wpr,wpr*sp.H/sp.W)/IN)}″)`}
  const lm=(m.lc||m.lm)*sp.stk,lux=lm/(sp.W*sp.H),amb=AMB(),cr=(lux+amb)/(lux/m.cr+amb),zOK=sp.fixed||(sp.z>=0&&sp.z<=1);
  kp.innerHTML=KH+
    K(zOK?'ok':'bad','Zoomfaktor',sp.fixed?'Fast':`${f2(p.L/Lw,1)}<small>x</small>`,sp.fixed?`linse kaster ${f3(Lw)} m`:`linsen kan 1,0–${f2(LtO/Lw,1)}x`)+
    K('','Afstand L',`${f3(p.L)}<small>m</small>`,sp.fixed?`aktuel TR ${f2(Lw/sp.W)}:1`:`linse ${f3(Math.min(Lw,LtO))}–${f3(Math.max(Lw,LtO))} m · aktuel TR ${f2(p.L/sp.W)}:1`)+
    K(sp.ok?'':'warn','Billedflade',`${f3(sp.Wt)}<small>×</small>${f3(sp.Ht)}<small>m</small>`,bl?`${fi(Math.hypot(sp.Wt,sp.Ht)/IN)}″ · projektorer: ${sp.n}`:`${fi(sp.D)}″`,'sm')+
    K(sp.shOK?'ok':'bad','Lens shift V / H',`${Math.round(sp.sv*100)}<small>/</small>${Math.round(sp.sh*100)}<small>%</small>`,sp.shOK?'inden for linsens shift':'uden for linsens shift')+
    K('','Lys pr. projektor',`${fi(lux)}<small>lux</small>`,`${fi(S.gain*lux/Math.PI)} cd/m² · kontrast ${fi(cr)}:1`)+
    K('','Projektor (B×H×D)',`${mm(sp.B)}<small>×</small>${mm(sp.Hb)}<small>×</small>${mm(sp.Dp)}<small>mm</small>`,`Free Grid · P${FG.sel+1}`,'sm')}
// boks 05's tjek af buet lærred (26-curved.js) regner med appens projektor og afstand – i Free Grid skal det være den valgte projektors
// (curvUI er en funktionserklæring i 26-curved.js; dens render-indpakning kalder den ved navn, så den kan udskiftes herfra)
{const c0=curvUI;curvUI=function(){c0.apply(this,arguments);if(FG.tab!=='grid')return;const p=FG.pjs[FG.sel],el=$('curvOut');if(!p||!el||!(p.curv&&p.curv.on))return;
  const k=fgCurv(p);if(k)el.innerHTML=`<p class="hint"><b class="notr">Free Grid · P${FG.sel+1}</b></p>`+k.lines.map(l=>`<p class="${l.good?'cok':'cbad'}">${esc(l.t)}</p>`).join('');
  const sv=$('curvSvg');if(sv)sv.innerHTML=''}}
/* Projektfil (17-project-file.js): Free Grid gemmes under «freegrid», med model og optik ved navn (katalogets rækkefølge kan ændre sig).
   Gemmes der, mens Free Grid er åben, står den valgte projektors 05-indstillinger i S – appens egne skrives i stedet. Åbnes en fil, gives Free Grid
   videre til genindlæsningen via sessionStorage (som resten af projektet) og læses ved start. */
{const pd0=projData;projData=function(){const d=pd0.apply(this,arguments);
   if(FG.app05&&d.state){const a=FG.app05;F05.forEach(k=>{d.state[k]=a[k]});d.state.curv=JSON.parse(JSON.stringify(a.curv))}
   if(FG.pjs.length)d.freegrid={bz:2,w:FG.w,d:FG.d,hgt:FG.hgt,grid:FG.grid,snap:FG.snap,sel:FG.sel,pjs:FG.pjs.map(p=>{const m=MODELS[p.mi];return {...JSON.parse(JSON.stringify(p)),model:m?m.m:'',lens:m&&m.L[p.li]?m.L[p.li][0]:''}})};
   return d};
 const lp0=loadProject;loadProject=function(txt){let f=null;try{const d=JSON.parse(txt);f=d&&d.freegrid||null}catch(e){}
   try{if(f)sessionStorage.setItem('kasteplan_nextfg',JSON.stringify(f));else sessionStorage.removeItem('kasteplan_nextfg')}catch(e){}
   fgLoadData(f);return lp0.apply(this,arguments)}}
function fgLoadData(f){FG.pjs=[];FG.sel=-1;FG.tab='plan';FG.app05=null;FG.s05=null;FG.sel05=undefined;   // (det indlæste projekts egne 05-tal må ikke overskrives)
  if(!f||!Array.isArray(f.pjs))return;
  FG.w=fgCl(+f.w||20,2,200);FG.d=fgCl(+f.d||20,2,200);FG.hgt=fgCl(+f.hgt||6,2,60);if(f.grid>0)FG.grid=+f.grid;FG.snap=!!f.snap;
  for(const q of f.pjs){let mi=MODELS.findIndex(m=>m.m===q.model);if(mi<0)mi=MODELS[q.mi]?q.mi:0;const m=MODELS[mi];let li=m.L.findIndex(l=>l[0]===q.lens);if(li<0)li=m.L[q.li]?q.li:0;
    const p={...fgNew(FG.w/2,FG.d/2),...q,mi,li};delete p.model;delete p.lens;
    // ældre projektfiler (før bz:2) regnede linsen ved kabinettets forkant (Lo = dybde/2) – flyt kabinettet, så linsen og billedet står samme sted
    if(f.bz!==2&&!p.down){const {u}=fgDir(p),dl=fgBz(m,m.L[li]).Lo-m.dim[2]/2000;if(Math.abs(dl)>1e-6){p.x=fgR3(p.x-u[0]*dl);p.y=fgR3(p.y-u[1]*dl)}}
    FG.pjs.push(p)}
  FG.sel=FG.pjs.length?fgCl(+f.sel||0,0,FG.pjs.length-1):-1}
try{const t=sessionStorage.getItem('kasteplan_nextfg');sessionStorage.removeItem('kasteplan_nextfg');if(t)fgLoadData(JSON.parse(t))}catch(e){}
fgInit();
{const r0=render;render=function(){if(fg05Mode()){FG.s05=null}r0();fgSync05();fgDraw();fg0102Show()}}
