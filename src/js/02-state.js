/* ===== STATE ===== */
const $=id=>document.getElementById(id);
const ASPECTS=['16:10','16:9','17:9','4:3','21:9'];
// standardprojektor i alle temaer: PT-REQ15 med Supplied lens/ET-C1S600
window.__T={get immDragApply(){return immDragApply},get immCalc(){return immCalc}};
const DEFM=Math.max(0,MODELS.findIndex(m=>m.m==='PT-REQ15')),DEFL=Math.max(0,MODELS[DEFM].L.findIndex(l=>/C1S600/.test(l[0])));
const S={cat:0,minLm:0,mi:DEFM,li:DEFL,defREQ:true,lang:'en',mode:'dark',venue:'aud',lockL:false,lockW:false,trows:4,rear:false,bsd:4,imm:{v:true,l:true,r:true,f:true},ak:'16:10',L:10,cw:5,sb:0.9,ceil:true,py:null,px:0,rd:16,rw:12,rh:5,r1:3,rp:0.95,gain:1,amb:200,
  plan:{use:true,lock:false,v2:true,w:0,h:0,cal:null,calM:5,scr:null,tool:'cal',open:false},sun:{on:false,face:180,t:0.5,win:'sides',off:[]},pcr:null,stack:1,crReq:'7',crCust:5,frame:false,frameId:null,openMount:false,openBlend:false,fw:null,fh:null,fd:null,blend:false,bc:2,br:1,ov:10,content:'none'};
let IMG=null;let FRESH=true;
const S0=JSON.parse(JSON.stringify(S));
let SAVED={};try{FRESH=!localStorage.getItem('kasteplan5');SAVED=JSON.parse(localStorage.getItem('kasteplan5')||'{}')||{};Object.assign(S,SAVED)}catch(e){}
let MIG=false;if(!SAVED.defREQ){MIG=!FRESH;S.mi=DEFM;S.li=DEFL;S.pcr=null;S.frameId=null;S.fw=null;S.immPj={};S.defREQ=true}
if(!S.mode)S.mode='dark';   // mørk tilstand er standard
if(S.plan&&!S.plan.v2){S.plan.lock=false;S.plan.v2=true}
if(!S.imm||typeof S.imm!=='object')S.imm={v:true,l:true,r:true,f:true};if(S.imm.v===undefined)S.imm.v=true;
if(S.sun){if(S.sun.win==='all')S.sun.win='custom';if(S.sun.win==='back')S.sun.win='sides';if(!Array.isArray(S.sun.off))S.sun.off=[];delete S.sun.sky}
const CROWDOPT=()=>S.venue==='museum'||S.venue==='immersive',NOCROWD=()=>CROWDOPT()&&S.crowd===false;
const STAND=()=>S.venue==='museum'||S.venue==='immersive';
const REAR=()=>S.venue==='theater'&&!!S.rear, RZ=()=>REAR()?S.bsd:0, ZS=()=>REAR()?-1:1, DEPTH=()=>REAR()?S.bsd:S.rd;
// teater: få stolerækker bagerst, scenen fylder resten (med 1,5 m gang foran første række)
const TROWS=()=>{const o=[],rp=Math.max(.7,S.rp);for(let k=Math.max(1,Math.round(S.trows||4))-1;k>=0;k--){const u=S.rd-0.75-k*rp;if(u>1)o.push(u)}return o};
// scenen: dybde fra lærredsvæggen (auto = op til 1,5 m før første række, kan trækkes/indtastes), højde 0,2–1,6 m
const STAGEMAX=()=>{const t=TROWS();return Math.max(1,(t.length?t[0]:S.rd)-1.0)};
const STAGE=()=>{if(S.venue!=='theater')return Math.max(0.6,Math.min(3,S.r1-1.2));const mx=STAGEMAX();if(S.stageD!=null)return Math.max(1,Math.min(mx,S.stageD));return Math.max(1.5,Math.min(12,mx-0.5))};
const STH=()=>S.venue==='theater'?Math.max(0.2,Math.min(1.6,S.stageH??0.8)):0.8;
// taleren står altid foran lærredet – ved bagprojektion mindst 0,8 m foran det
// taleren kan trækkes: afstand fra lærredsvæggen (S.presZ) og sideplacering (S.presX); standard = ved siden af lærredet
const PRESZR=()=>{if(S.venue==='theater'){const zS=STAGE();return [REAR()?RZ()+0.3:0.3,Math.max(0.4,zS-0.25)]}const t=(S.venue==='museum'&&NOCROWD())?S.rd-0.5:Math.max(0.6,S.r1-0.4);return [0.3,Math.max(0.35,t)]};
const PZ=()=>{const [a,b]=PRESZR();return Math.max(a,Math.min(b,S.presZ??(S.venue==='theater'?PRESZ():0.9)))};
const PXX=(cx,CW)=>{const w=S.rw/2-0.3;return Math.max(-w,Math.min(w,S.presX??Math.max(-S.rw/2+0.6,cx-CW/2-0.9)))};
const PRESZ=()=>{const zS=STAGE();return REAR()?Math.min(zS-0.25,RZ()+0.8):Math.max(0.5,Math.min(zS-0.3,0.9))};
/* immersive: hvor mange projektorer (valgt model og optik) skal der til for at dække sidevægge og gulv */
const IMPX=q=>{const pu=Math.round(q.U/q.su*(q.rot?q.eh:q.ew)),pv=Math.round(q.V/q.sv*(q.rot?q.ew:q.eh));return q.key==='f'?`${fi(pv)} × ${fi(pu)}`:`${fi(pu)} × ${fi(pv)}`};
const IMC={v:'#16B6D9',l:'#8B5CF6',r:'#EC4899',f:'#F59E0B'},IMT={v:'F',l:'V',r:'H',f:'G'};
/* færrest mulige projektorer på en flade (vægge: altid liggende montering; gulv: projektoren kan drejes 90°), tæl ved optikkens største billede (kast ≤ Lmax),
   og tilpas derefter billedet, så det præcis fylder fladen med det valgte overlap (mindre billede = mere lys) */
function immLay(U,V,Lmax,row,aw,ah,fixed,o,gr,canRot,fitV){const kW=IN*aw/Math.hypot(aw,ah),cnt=(len,sz)=>len<=sz+1e-6?1:Math.ceil((len-sz*o)/(sz*(1-o))-1e-6);
  const Dmax=Math.min(row[5],diagFor(row,Lmax,0));if(!(Dmax>=row[4]-1e-6))return null;const Wm=Dmax*kW,Hm=Wm*ah/aw;let best=null;
  // vægge (auto): prøv først at lade billedet gå præcis fra gulv til loft – bredden fyldes præcist med lidt mere vandret overlap (ou).
  // Kan optikken ikke det, eller vælger man selv et fast antal i 05, må billedet gå over i højden (beregningen nedenfor)
  if(fitV){for(const rot of canRot==='only'?[true]:canRot===false?[false]:[false,true]){const nv=gr?Math.max(1,Math.round(gr)):cnt(V,rot?Wm:Hm),sv=V/(nv-(nv-1)*o);
      const W=rot?sv:sv*aw/ah,H=W*ah/aw,su=rot?H:W;if(W>Wm+1e-6||W<row[4]*kW-1e-6)continue;
      const nu=cnt(U,su),ou=nu>1?Math.max(o,(nu*su-U)/((nu-1)*su)):o,c={rot,nu,nv,n:nu*nv,W,H,D:W/kW,su,sv,ou,big:W>=Wm-1e-6};
      if(!best||c.n<best.n||(c.n===best.n&&c.W*c.H<best.W*best.H-1e-9))best=c}
    if(best)return best}
  for(const rot of canRot==='only'?[true]:canRot===false?[false]:[false,true]){const su0=rot?Hm:Wm,sv0=rot?Wm:Hm,nu=cnt(U,su0),nv=gr?Math.max(1,Math.round(gr)):cnt(V,sv0);
    const nU=U/(nu-(nu-1)*o),nV=V/(nv-(nv-1)*o);let W=rot?Math.max(nV,nU*aw/ah):Math.max(nU,nV*aw/ah);W=Math.max(row[4]*kW,Math.min(Wm,W));
    const H=W*ah/aw,c={rot,nu,nv,n:nu*nv,W,H,D:W/kW,su:rot?H:W,sv:rot?W:H,ou:o,big:W>=Wm-1e-6};
    if(!best||c.n<best.n||(c.n===best.n&&c.W*c.H<best.W*best.H-1e-9))best=c}
  return best}
// projektortype ud fra Panasonics kategori: 1-chip DLP, 3-chip DLP eller LCD (Panasonics LCD-projektorer er 3LCD)
const typeOf=m=>/3-Chip DLP/i.test(m.t)?'d3':/1-Chip DLP/i.test(m.t)?'d1':/LCD/i.test(m.t)?'lcd':null;
const typeOK=m=>{const T=S.immTypes||{};const t=typeOf(m);return !!t&&T[t]!==false};
// kontrastområde for «bedste løsning» (Immersive): bar 0–100 ↔ 1:1–100:1 i logaritmisk skala; 100 = ingen øvre grænse
const cbV2C=v=>Math.pow(10,v/50),cbC2V=c=>Math.round(50*Math.log10(Math.max(1,c)));
const crBandOf=()=>{const lo=S.immCrMin??1,hi=S.immCrMax??100;return {lo,hi:hi>=99.5?Infinity:hi,on:lo>1.01||hi<99.5}};
function immCalc(r0){const o=Math.min(.5,Math.max(0,(S.immOv??10)/100)),amb=AMB(),A=S.immAdj||{},G=S.immGrid||{};
  const cnt=(len,sz)=>len<=sz+1e-6?1:Math.ceil((len-sz*o)/(sz*(1-o))-1e-6);
  // Lmax: længste kast i rummet. Træk kan flytte gruppen tættere på fladen (dL<0) og langs fladen (du/dv).
  // Auto: største billede pr. projektor ved kastet. Fast antal (05 Edge blend): billedet fylder fladen præcist, kastet holdes inden for optikkens zoom.
  const one=(key,name,U,V,Lmax,canRot0)=>{if(!S.imm||!S.imm[key])return {key,name,on:false};const RT=(S.immRot||{})[key],canRot=RT===true?'only':RT===false?false:canRot0;
    const r=immR(key,r0),row=r.row,lm=(r.m.lc||r.m.lm),kW=IN*r.aw/Math.hypot(r.aw,r.ah);
    const a=A[key]||{},g=G[key]||{},Lmin=Math.min(Lmax,Math.max(0.3,distAt(row,row[4],0)));let ok=true,note='',L,D,W,H,su,sv,rot=false,nu,nv,ou=o,fixedN=!!g.c,sug=null,bandMiss=false;
    if(fixedN){nu=Math.max(1,Math.round(g.c));su=U/(nu-(nu-1)*o);if(canRot==='only'){rot=true;H=su;W=H*r.aw/r.ah;sv=W}else{W=su;H=W*r.ah/r.aw;sv=H}D=W/kW;
      if(g.r){const nvF=Math.max(1,Math.round(g.r)),vNeed=V/(nvF-(nvF-1)*o);if(rot){H=Math.max(H,vNeed*r.ah/r.aw);W=H*r.aw/r.ah;su=H;sv=W}else{W=Math.max(W,vNeed*r.aw/r.ah);H=W*r.ah/r.aw;su=W;sv=H}D=W/kW}
      const lw=distAt(row,D,0),lt=r.fixed?lw:distAt(row,D,1),lo=Math.min(lw,lt),hi=Math.max(lw,lt);
      if(D<row[4]-.5||D>row[5]+.5){ok=false;note=`${fi(D)}″ pr. projektor ligger uden for optikkens område`;L=Lmax}
      else if(lo>Lmax+1e-6){ok=false;note=`kræver mindst ${f2(lo)} m kast – der er kun ${f2(Lmax)} m`;L=Lmax}
      else{L=a.dL==null?Math.min(lw,Lmax):Math.max(lo,Math.min(Math.min(hi,Lmax),Lmax+a.dL))}
      nv=g.r?Math.max(1,Math.round(g.r)):cnt(V,sv)}
    else{const lay=immLay(U,V,Lmax,row,r.aw,r.ah,r.fixed,o,g.r,canRot,key!=='f');
      if(!lay){ok=false;L=Lmax;D=row[4];note=`optikken kan ikke give et billede på ${f2(L)} m afstand`;W=D*kW;H=W*r.ah/r.aw;su=W;sv=H;nu=1;nv=1}
      else{({D,W,H,su,sv,rot,nu,nv,ou}=lay);
        // kast: uden zoom (vidvinkel, zoomfaktor 1,0) for det tilpassede billede – træk på tværs flytter inden for zoomområdet
        const lo=distAt(row,D,0),hi=r.fixed?lo:distAt(row,D,1),Lhi=Math.min(Math.max(lo,hi),Lmax),Llo=Math.min(lo,hi);
        L=a.dL==null?Math.min(lo,Lhi):Math.max(Llo,Math.min(Lhi,Lmax+a.dL));if(lay.big)note=`optikkens største billede (${fi(D)}″)`}
      // bedste løsning: alle modeller og optikker af de valgte projektortyper, både liggende og portræt – færrest projektorer, derefter mest lys
      // bedste løsning: alle modeller og optikker af de valgte projektortyper (05), både liggende og portræt, inden for kontrastområdet (06)
      // færrest projektorer; ved lige antal: kontrasten tættest på midten af området (eller mest lys, når intet område er valgt)
      if(ok&&r.m){const CB=crBandOf(),mid=Math.sqrt(CB.lo*(CB.hi===Infinity?100:CB.hi)),dist=c=>Math.abs(Math.log(c/mid));let bs=null;
        for(const m2 of MODELS){if(!typeOK(m2))continue;const ai2=aiFor(m2);if(ai2<0)continue;const [aw2,ah2]=ratioOf(m2.asp[ai2]);const lm2=m2.lc||m2.lm,pc2=m2.cr||2000;
          m2.L.forEach((ln2,li2)=>{const rw2=ln2[2]&&ln2[2][ai2];if(!rw2||!(rw2[0]>0))return;for(const rr of [false,true]){const l2=immLay(U,V,Lmax,rw2,aw2,ah2,ln2[1]==='F',o,g.r,rr?'only':false,key!=='f');if(!l2)continue;
            const lux2=lm2/(l2.W*l2.H),cr2=(lux2+amb)/(lux2/pc2+amb);if(cr2<CB.lo-1e-9||cr2>CB.hi+1e-9)continue;
            const better=!bs||l2.n<bs.n||(l2.n===bs.n&&(CB.on?dist(cr2)<dist(bs.cr)-1e-6:lux2>bs.lux*1.001));
            if(better)bs={...l2,mi:MODELS.indexOf(m2),li:li2,name:ln2[0],model:m2.m.split(' (')[0],lux:lux2,cr:cr2,rot:rr}}})}
        const same=bs&&bs.mi===MODELS.indexOf(r.m)&&r.m.L[bs.li]===r.ln&&bs.rot===rot;
        const crNow=(lm/(W*H)+amb)/(lm/(W*H)/r.pcr+amb),outNow=crNow<CB.lo-1e-9||crNow>CB.hi+1e-9;bandMiss=CB.on&&!bs;
        if(bs&&!same&&(!typeOK(r.m)||outNow||bs.n<nu*nv||(bs.n===nu*nv&&(CB.on?dist(bs.cr)<dist(crNow)-.05:bs.lux>lm/(W*H)*1.05))))sug=bs}}
    const dL=L-Lmax,covV=nv*sv-(nv-1)*sv*o,covU=nu*su-(nu-1)*su*ou;
    if(ok&&covV<V-1e-3)note=`dækker kun ${f2(covV)} af ${f2(V)} m – flere projektorer på tværs`;
    const lux=lm/(W*H),cr=(lux+amb)/(lux/r.pcr+amb);
    const mu=Math.max(0,(covU-U)/2),mv=Math.max(0,(covV-V)/2);
    const du=Math.max(-mu,Math.min(mu,a.du||0)),dv=Math.max(-mv,Math.min(mv,a.dv||0));
    const [ew,eh]=effRes(r.m.res,r.aw,r.ah);
    return {key,name,on:true,pm:r.m,pl:r.ln,own:r!==r0,ew,eh,sug,bandMiss,ok,note,U,V,L,Lmax,Lmin,dL,du,dv,W,H,su,sv,nu,nv,rot,o,ou,lux,cr,fixedN,fixedR:!!g.r,bz:su*ou,bzv:sv*o,n:ok?nu*nv:0}};
  return [one('v','Front-væg',S.rw,S.rh,S.rd-0.6,false),one('l','Venstre væg',S.rd,S.rh,S.rw-0.6,false),one('r','Højre væg',S.rd,S.rh,S.rw-0.6,false),one('f','Gulv',S.rd,S.rw,S.rh-0.6,true)]}
// fliser (billeder) langs en flade: [start, slut, midte] – centreret (+ forskydning), overlap fordeles jævnt
const tiles=(len,sz,n,o,off=0)=>{const tot=n*sz-(n-1)*sz*o,a0=(len-tot)/2+off,out=[];for(let i=0;i<n;i++){const a=a0+i*sz*(1-o);out.push([Math.max(0,a),Math.min(len,a+sz),a+sz/2])}return out};
// projektorer og deres billeder i rummets koordinater (x fra midten, y op, z fra frontvæggen)
/* billede på en flade i perspektiv: fladen deles i tynde strimler, hver tegnet med en affin transformation og klippet til sin firkant */
let TESTURI=null;const testURI=()=>TESTURI||(TESTURI='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="none">${testPattern(0,0,1600,1000)}</svg>`));
function warpImg(id,pt,ts,alongV,T=''){let s='';const n=ts.length-1;for(let i=0;i<n;i++){const t0=ts[i],t1=ts[i+1],tm=(t0+t1)/2,e=(t1-t0)*.08;let m,Q;
    if(!alongV){const M0=pt(tm,0),M1=pt(tm,1),U0=pt(t0,.5),U1=pt(t1,.5),a=(U1[0]-U0[0])/(t1-t0),b=(U1[1]-U0[1])/(t1-t0),c=M1[0]-M0[0],d=M1[1]-M0[1];
      m=[a,b,c,d,M0[0]-a*tm,M0[1]-b*tm];const u0=Math.max(0,t0-e),u1=Math.min(1,t1+e);Q=[pt(u0,0),pt(u1,0),pt(u1,1),pt(u0,1)]}
    else{const M0=pt(0,tm),M1=pt(1,tm),V0=pt(.5,t0),V1=pt(.5,t1),a=M1[0]-M0[0],b=M1[1]-M0[1],c=(V1[0]-V0[0])/(t1-t0),d=(V1[1]-V0[1])/(t1-t0);
      m=[a,b,c,d,M0[0]-c*tm,M0[1]-d*tm];const v0=Math.max(0,t0-e),v1=Math.min(1,t1+e);Q=[pt(0,v0),pt(1,v0),pt(1,v1),pt(0,v1)]}
    s+=`<clipPath id="${id}${i}"><polygon points="${pts(Q)}"/></clipPath><g clip-path="url(#${id}${i})"><use href="#immimg" transform="matrix(${m.map(v=>v.toFixed(4)).join(' ')}) ${T}"/></g>`}
  return s}
function immPos(q){const w=S.rw/2,h=S.rh,out=[];if(!q.on||!q.ok)return out;let k=0;
  const tU=tiles(q.U,q.su,q.nu,q.ou??q.o,q.du),tV=tiles(q.V,q.sv,q.nv,q.o,q.dv);
  tU.forEach(([u0,u1,uc])=>tV.forEach(([v0,v1,vc],j)=>{k++;const id=IMT[q.key]+k;let pj,c4;
    if(q.key==='v'){pj=[uc-w,h-.35-j*.3,q.L];c4=[[u0-w,v0,0],[u1-w,v0,0],[u1-w,v1,0],[u0-w,v1,0]]}
    else if(q.key==='f'){pj=[vc-w,q.L,uc];c4=[[v0-w,0,u0],[v1-w,0,u0],[v1-w,0,u1],[v0-w,0,u1]]}
    else{const xw=q.key==='l'?-w:w;pj=[xw+(q.key==='l'?1:-1)*q.L,h-.3-j*.3,uc];c4=[[xw,v0,u0],[xw,v1,u0],[xw,v1,u1],[xw,v0,u1]]}
    out.push({id,pj,c4,uc,vc,u0,u1,v0,v1,j})}));return out}
/* manualer (Operating Instructions) fra Panasonics EU-produktsider – stier under MAN_B. Optikker uden ET-nummer (indbygget) bruger projektorens manual */
const MAN_PJ={'pt-htq20':'https://pim-api.connect.panasonic.com/mediaStream/190046','pt-lmz420':'https://bizpartner.panasonic.net/public/ppr/file_view/208148','pt-lmz460':'https://bizpartner.panasonic.net/public/ppr/file_view/208148','pt-rq45k':'https://pim-api.connect.panasonic.com/mediaStream/185900','pt-rz44k':'https://pim-api.connect.panasonic.com/mediaStream/185900','pt-tmz400':'https://bizpartner.panasonic.net/public/ppr/file_view/208179','pt-vmq85':'https://pim-api.connect.panasonic.com/mediaStream/186896','pt-vmq75':'https://pim-api.connect.panasonic.com/mediaStream/186896','pt-vmq65':'https://pim-api.connect.panasonic.com/mediaStream/186896','pt-rq50k':'2024-04/rq50k_manual_en_0.pdf','pt-rq35k2':'document/2025-07/PT-RQ35K2_Series_manual_en.pdf','pt-rz34k2':'document/2025-07/PT-RQ35K2_Series_manual_en.pdf','pt-rq25k':'document/2024-04/rq25k_manual_en.pdf','pt-rq18k':'document/2024-04/rq25k_manual_en.pdf','pt-rz24k':'document/2024-04/rq25k_manual_en.pdf','pt-rz17k':'document/2024-04/rq25k_manual_en.pdf','pt-req15':'2024-06/PT-REQ15_REZ15_manual_en_1715224076.0042.pdf','pt-rez15':'2024-06/PT-REQ15_REZ15_manual_en_1715224076.0042.pdf','pt-req12':'2024-04/PT-REQ12_manual_en_6.pdf','pt-req10':'2024-04/PT-REQ12_manual_en_6.pdf','pt-req80':'2024-04/PT-REQ12_manual_en_6.pdf','pt-rez12':'2024-04/PT-REZ12_manual_en_5.pdf','pt-rez10':'2024-04/PT-REZ12_manual_en_5.pdf','pt-rez80':'2024-04/PT-REZ12_manual_en_5.pdf','pt-rq7l':'document/2024-10/PT-RQ7_Series_manual_en_3.pdf','pt-rq6l':'document/2024-10/PT-RQ7_Series_manual_en_3.pdf','pt-rz7l':'document/2024-10/PT-RQ7_Series_manual_en_3.pdf','pt-rz6l':'document/2024-10/PT-RQ7_Series_manual_en_3.pdf','pt-frq60':'document/2024-04/frq60_frq50_manual_en_0.pdf','pt-frq50':'document/2024-04/frq60_frq50_manual_en_0.pdf','pt-frz60':'document/2024-04/frz60_frz50_manual_en_0.pdf','pt-frz50':'document/2024-04/frz60_frz50_manual_en_0.pdf','pt-mz20kl':'document/2025-08/mz20k_manual_en.pdf','pt-mz17kl':'document/2025-08/mz20k_manual_en.pdf','pt-mz14kl':'document/2025-08/mz20k_manual_en.pdf','pt-mz11kl':'document/2025-08/mz20k_manual_en.pdf','pt-mz882':'2024-06/PT-MZ882_Series_manual_en_1716090622.5247.pdf','pt-mz782':'2024-06/PT-MZ882_Series_manual_en_1716090622.5247.pdf','pt-mz682':'2024-06/PT-MZ882_Series_manual_en_1716090622.5247.pdf','pt-vmz82':'document/2025-04/vmz82_manual_en_16.pdf','pt-vmz72':'document/2025-04/vmz82_manual_en_16.pdf','pt-vmz62':'document/2025-04/vmz82_manual_en_16.pdf','pt-vmz51s':'document/2024-04/vmz71_manual_en_5.pdf','pt-vmz7st':'document/2025-04/vmz7st_manual_en_5.pdf','pt-vmz6st':'document/2025-04/vmz7st_manual_en_5.pdf','pt-cmz50':'document/2024-04/cmz50_manual_en_0.pdf','pt-vw545n':'document/2025-08/vz585n_manual_en.pdf'};
const MAN_LN={'et-d3qs400':'2024-04/ET-D3QW300%28DPQX1392ZB_X1%29_E%2BAppendix_9.pdf','et-d3qt500':'2024-04/ET-D3QW300%28DPQX1392ZB_X1%29_E%2BAppendix_9.pdf','et-d3qt600':'2024-04/ET-D3QW300%28DPQX1392ZB_X1%29_E%2BAppendix_9.pdf','et-d3qt700':'2024-04/ET-D3QW300%28DPQX1392ZB_X1%29_E%2BAppendix_9.pdf','et-d3qt800':'2024-04/ET-D3QW300%28DPQX1392ZB_X1%29_E%2BAppendix_9.pdf','et-d3lew60':'document/2024-04/ET-D3LEW60%28DPQX1279ZC%29_EN%2BAppendix_3.pdf','et-d3les20':'document/2024-04/ET-D3LEW60%28DPQX1279ZC%29_EN%2BAppendix_3.pdf','et-d3let80':'document/2024-04/ET-D3LEW60%28DPQX1279ZC%29_EN%2BAppendix_3.pdf','et-d3lew50':'document/2024-04/ET-D3LEW60%28DPQX1279ZC%29_EN%2BAppendix_3.pdf','et-d3lew10':'document/2024-04/ET-D3LEW10%28DPQX1300ZC_X1%29_EN%2BAppendix_2.pdf','et-d3let30':'document/2024-04/ET-D3LEW10%28DPQX1300ZC_X1%29_EN%2BAppendix_2.pdf','et-d3let40':'document/2024-04/ET-D3LEW10%28DPQX1300ZC_X1%29_EN%2BAppendix_2.pdf','et-d75le50':'document/2024-04/et-d75le50_manual_en_2.pdf','et-dle035':'document/2024-04/ET-DLE035%28DPQX1334ZB_X1%29_EN-Appendix_4.pdf','et-elw20':'document/2024-04/ET-ELW21%28TQZJ444-5%29_EN%2BAppendix_1.pdf','et-elt22':'document/2024-04/ET-ELW21%28TQZJ444-5%29_EN%2BAppendix_1.pdf','et-elt23':'document/2024-04/ET-ELW21%28TQZJ444-5%29_EN%2BAppendix_1.pdf','et-ems600':'document/2024-04/ET-EMS600%28DPQX1425ZF_X1%29_EN%2BAppendix_0.pdf','et-emt700':'document/2024-04/ET-EMS600%28DPQX1425ZF_X1%29_EN%2BAppendix_0.pdf','et-emt800':'document/2024-04/ET-EMS600%28DPQX1425ZF_X1%29_EN%2BAppendix_0.pdf','et-emu100':'document/2024-04/et-emw200_emw300_emw400_emw500_ems650_emt750_emt850_manual_en_3.pdf','et-d3qw200':'document/2024-04/ET-D3QW200%28DPQX1563ZB_X1%29_E%2BAppendix_1.pdf','et-d3qw300':'2024-04/ET-D3QW300%28DPQX1392ZB_X1%29_E%2BAppendix_9.pdf','et-d75le95':'document/2024-04/ET-D75LE95%28DPQX1086ZC%29_EN%2BAppendix_3.pdf','et-d3lew200':'document/2024-04/ET-D3LEU100_LEW200%28DPQX1394ZB_X1%29_E%2BAppendix_0.pdf','et-d3leu100':'document/2024-04/ET-D3LEU100_LEW200%28DPQX1394ZB_X1%29_E%2BAppendix_0.pdf','et-c1w400':'2024-04/ET-C1W300_C1W400_C1W500_C1S600_C1T700_manual_en_9.pdf','et-c1t700':'2024-04/ET-C1W300_C1W400_C1W500_C1S600_C1T700_manual_en_9.pdf','et-c1w500':'2024-04/ET-C1W300_C1W400_C1W500_C1S600_C1T700_manual_en_9.pdf','et-c1w300':'2024-04/ET-C1W300_C1W400_C1W500_C1S600_C1T700_manual_en_9.pdf','et-c1s600':'2024-04/ET-C1W300_C1W400_C1W500_C1S600_C1T700_manual_en_9.pdf','et-c1u100':'document/2024-04/et-c1u100_manual_en_1.pdf','et-c1t900':'2026-08/ET-C1T900_manual_en_1.pdf','et-dle020':'document/2024-04/ET-DLE020%28DPQX1396ZC_X1%29_EN%2BAppendex_1.pdf','et-dle060':'document/2024-04/ET-DLE060%28DPQX1249ZC_X1%29_EN%2BAppendix_1.pdf','et-dle085':'document/2024-04/et-dle085_manual_en_1.pdf','et-dle105':'document/2024-04/ET-DLE105%28DPQX1115ZC%29_EN%2BAppendix_1.pdf','et-dle170':'document/2024-04/ET-DLE170%28DPQX1113ZC%29_EN%2BAppendix_1.pdf','et-ems650':'document/2024-04/et-emw200_emw300_emw400_emw500_ems650_emt750_emt850_manual_en_3.pdf','et-emw200':'document/2024-04/et-emw200_emw300_emw400_emw500_ems650_emt750_emt850_manual_en_3.pdf','et-emt750':'document/2024-04/et-emw200_emw300_emw400_emw500_ems650_emt750_emt850_manual_en_3.pdf','et-emw400':'document/2024-04/et-emw200_emw300_emw400_emw500_ems650_emt750_emt850_manual_en_3.pdf','et-emt850':'document/2024-04/et-emw200_emw300_emw400_emw500_ems650_emt750_emt850_manual_en_3.pdf','et-emw300':'document/2024-04/et-emw200_emw300_emw400_emw500_ems650_emt750_emt850_manual_en_3.pdf','et-emw500':'document/2024-04/et-emw200_emw300_emw400_emw500_ems650_emt750_emt850_manual_en_3.pdf','et-els20':'document/2024-04/ET-ELS20%28DPQX1114ZC%29_EN%2BAppendix_5.pdf','et-elu20':'document/2024-04/ET-ELU20%28DPQX1580ZB_X1%29_EN%2BAppendix_1.pdf','et-elw22':'document/2024-04/ET-ELW22%28TQZJ641-2%29_EN%2BAppendix_3.pdf','et-elw21':'document/2024-04/ET-ELW21%28TQZJ444-5%29_EN%2BAppendix_1.pdf'};
const MAN_B='https://eu.connect.panasonic.com/sites/default/files/media/';
const lnCode=ln=>{const et=ln[0].split('/').map(x=>x.trim()).find(x=>/^ET-/i.test(x));return et?et.toLowerCase().replace(/^et-dle020g$/,'et-dle020'):null};
const setMan=(id,path,name)=>{const a=$(id);if(path){a.href=/^https?:/.test(path)?path:MAN_B+path;a.removeAttribute('aria-disabled');a.removeAttribute('tabindex');a.textContent='Manual';a.title=`Åbn manual for ${name} (PDF)`}else{a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.tabIndex=-1;a.textContent='Ingen manual';a.title=`Panasonic har ingen manual for ${name} på produktsiden`}};
/* links til Panasonics produktsider (EU, engelsk) med specifikationer */
const PAN='https://eu.connect.panasonic.com/gb/en/';
const PAN_SERIES={'pt-rq35k2':'pt-rq35-series','pt-rz34k2':'pt-rq35-series','pt-frq60':'pt-frq60-series','pt-frq50':'pt-frq60-series','pt-frz60':'pt-frz60-series','pt-frz50':'pt-frz60-series',
  'pt-mz20kl':'pt-mz20-series','pt-mz17kl':'pt-mz20-series','pt-mz14kl':'pt-mz20-series','pt-mz11kl':'pt-mz20-series','pt-vmz51s':'pt-vmz71-series','pt-lmz460':'pt-lmz460-series','pt-lmz420':'pt-lmz460-series','pt-tmz400':'pt-tmz400-series'};
const pjSlug=name=>name.split(' (')[0].split('/')[0].trim().toLowerCase();
const pjURL=m=>{const k=pjSlug(m.m);return PAN+'projectors/'+(PAN_SERIES[k]?PAN_SERIES[k]+'/':'')+k};
/* terminalsiden (input/output) – billeder fra Panasonics ressourcesider, indlejret som 't:<slug>' i images.json ('=' foran = samme billede som en anden model) */
const TERM_RES={cmz50:'cmz50',frq60:'frq60 frq50',frz60:'frz60 frz50',htq20:'htq20',lmz460:'lmz460 lmz420',mz20k:'mz20kl mz17kl mz14kl mz11kl',mz882:'mz882 mz782 mz682',
  req15:'req15 rez15',req12:'req12 req10 req80',rez12:'rez12 rez10 rez80',rq25k:'rq25k rq18k rz24k rz17k',rq35k:'rq35k2 rz34k2',rq45k:'rq45k rz44k',rq50k:'rq50k',
  rq7:'rq7l rq6l rz7l rz6l',tmz400:'tmz400',vmq85:'vmq85 vmq75 vmq65',vmz71:'vmz51s',vmz7st:'vmz7st vmz6st',vmz82:'vmz82 vmz72 vmz62'};
const termRes=k=>{const s=k.replace(/^pt-/,'');const p=Object.keys(TERM_RES).find(p=>TERM_RES[p].split(' ').includes(s));return p?'https://docs.connect.panasonic.com/projector/products/'+p+'/resources/':null};
const termImg=k=>{let v=IMGS['t:'+k];if(v&&v[0]==='=')v=IMGS[v.slice(1)];return v||null};
const lnURL=(m,ln)=>{const n=ln[0];const parts=n.split('/').map(x=>x.trim());const et=parts.find(x=>/^ET-/i.test(x));
  if(!et)return pjURL(m);                                   // indbygget/standardlinse: projektorens side
  const k=et.toLowerCase().replace(/^et-dle020g$/,'et-dle020');
  if(k==='et-d3lew600')return PAN+'products/projectors/et-d3lew600';
  if(k==='et-d3lew300'||k==='et-d75le50')return pjURL(m);  // ingen egen EU-side – projektorens side viser tilbehør
  return PAN+'projectors/'+k};
const save=()=>{try{localStorage.setItem('kasteplan5',JSON.stringify(S))}catch(e){}};
const M=()=>MODELS[S.mi], LN=()=>M().L[S.li];
/* immersive: egen projektor/optik pr. flade (S.immPj[k]={mi,li}); uden = standard (S.mi/S.li) */
const SLOT=()=>S.venue==='immersive'&&S.immSel&&S.immSel!=='all'?S.immSel:null;
const ownPj=k=>{const o=S.immPj&&S.immPj[k];return o&&MODELS[o.mi]&&MODELS[o.mi].L[o.li]?o:null};
const slotMI=()=>{const k=SLOT(),o=k&&ownPj(k);return o?o.mi:S.mi}, slotLI=()=>{const k=SLOT(),o=k&&ownPj(k);return o?o.li:S.li};
function immR(k,r){const o=S.venue==='immersive'&&ownPj(k);if(!o)return r;const m=MODELS[o.mi],ln=m.L[o.li];let ai=aiFor(m);if(ai<0)ai=0;
  const [aw,ah]=ratioOf(m.asp[ai]);return {m,ln,row:ln[2][ai],aw,ah,fixed:ln[1]==='F',pcr:o.mi===S.mi&&S.pcr?S.pcr:m.cr}}
const aiFor=m=>m.asp.findIndex(a=>keyOf(a)===S.ak);
const f2=(x,n=2)=>Number.isFinite(x)?x.toFixed(n).replace('.',','):'–';
const f3=(x,n=3)=>f2(x,n);  // mål i boks 08–10: 3 decimaler (mm) som Panasonics TDC
const fi=x=>Number.isFinite(x)?Math.round(x).toLocaleString('da-DK'):'–';
const mm=x=>fi(x*1000);

const framesFor=m=>FRAMES.filter(f=>f.re.test(m.m));
function frameDefaults(){const m=M(),fr=framesFor(m);S.frameId=fr.length?fr[0].id:'custom';applyFrame()}
function applyFrame(){const m=M();const f=FRAMES.find(x=>x.id===S.frameId);
  if(f){const d=f.dim||m.dim.map((v,i)=>v+FRAME_ADD[i]);[S.fw,S.fh,S.fd]=d}
  else if(S.fw==null){[S.fw,S.fh,S.fd]=m.dim.map((v,i)=>v+FRAME_ADD[i])}}
if(S.frameId==null)frameDefaults();

