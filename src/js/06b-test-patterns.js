/* ===== TESTBILLEDER (boks 09): vælges i dropdown og kan hentes som PNG i præcis den opløsning, der står i boks 05 ===== */
// billedet i pixels: N×R projektorer à ew×eh, blend-zoner bx/by px, samlet W×H (sættes i render)
let TPI={N:1,R:1,ew:1920,eh:1200,bx:0,by:0,W:1920,H:1200};
const tpBlendOK=()=>S.blend&&S.venue!=='immersive';
function tpInfo(r){const bl=tpBlendOK(),N=bl?r.N:1,R=bl?r.R:1,ew=r.ew||1920,eh=r.eh||1200,bx=bl&&N>1?Math.round(ew*r.o):0,by=bl&&R>1?Math.round(eh*r.o):0;
  return {N,R,ew,eh,bx,by,W:N*ew-(N-1)*bx,H:R*eh-(R-1)*by}}
const tpKind=()=>{const k=S.tp||'std';return k==='blend'&&!tpBlendOK()?'std':k};
// med edge blend får alle mønstre blend-zonerne ovenpå, så den hentede PNG kan bruges direkte til at justere projektorerne
function tpSVG(x,y,w,h,kind=tpKind(),I=TPI){const u=w/I.W;
  if(kind==='blend')return tpBlend(x,y,w,h,I,u);
  return (kind==='focus'?tpFocus(x,y,w,h,u):kind==='bars'?tpBars(x,y,w,h):testPattern(x,y,w,h))+(I.bx||I.by?tpZones(x,y,w,h,I,u,true):'')}
const tpTxt=(x,y,fs,t,c='#fff',a='middle')=>`<text x="${x}" y="${y}" font-family="Arial,Helvetica,sans-serif" font-size="${fs}" font-weight="700" text-anchor="${a}" dominant-baseline="middle" fill="${c}" stroke="#000" stroke-width="${fs*.12}" paint-order="stroke">${t}</text>`;

// fokus: fint gitter, Siemens-stjerner i midten og hjørnerne, felter med 1-px linjer
function tpFocus(x,y,w,h,u){const lw=Math.max(u,.35);let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000"/>`;
  const n=32,m=Math.max(4,Math.round(n*h/w));
  for(let i=1;i<n;i++)s+=`<line x1="${x+w*i/n}" y1="${y}" x2="${x+w*i/n}" y2="${y+h}" stroke="#fff" stroke-opacity=".45" stroke-width="${lw}"/>`;
  for(let j=1;j<m;j++)s+=`<line x1="${x}" y1="${y+h*j/m}" x2="${x+w}" y2="${y+h*j/m}" stroke="#fff" stroke-opacity=".45" stroke-width="${lw}"/>`;
  const star=(cx,cy,R)=>{let t=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#000"/>`;const k=48;
    for(let i=0;i<k;i+=2){const a0=i/k*2*Math.PI,a1=(i+1)/k*2*Math.PI;t+=`<polygon points="${cx},${cy} ${cx+R*Math.cos(a0)},${cy+R*Math.sin(a0)} ${cx+R*Math.cos(a1)},${cy+R*Math.sin(a1)}" fill="#fff"/>`}
    return t+`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#fff" stroke-width="${lw*2}"/>`};
  const R=Math.min(w,h)*.17,rc=R*.55,mx=rc*1.35;
  s+=star(x+w/2,y+h/2,R);[[x+mx,y+mx],[x+w-mx,y+mx],[x+mx,y+h-mx],[x+w-mx,y+h-mx]].forEach(([a,b])=>s+=star(a,b,rc));
  // felter med skiftevis 1 px lys / 1 px mørk (lodret og vandret) – skarpt fokus giver tydelige linjer
  const bs=R*.9,p=2*u,lines=(bx,by,vert)=>{let t=`<rect x="${bx}" y="${by}" width="${bs}" height="${bs}" fill="#000" stroke="#fff" stroke-width="${lw}"/>`;
    for(let q=0;q<bs-1e-9;q+=p)t+=vert?`<rect x="${bx+q}" y="${by}" width="${u}" height="${bs}" fill="#fff"/>`:`<rect x="${bx}" y="${by+q}" width="${bs}" height="${u}" fill="#fff"/>`;return t};
  const ly=y+h/2-bs/2,g=R*.35;s+=lines(x+w/2-R-g-bs,ly,true)+lines(x+w/2+R+g,ly,false);
  s+=`<rect x="${x+lw/2}" y="${y+lw/2}" width="${w-lw}" height="${h-lw}" fill="none" stroke="#fff" stroke-width="${lw}"/>`;
  return s}

// farvebjælker: 75 % bjælker, omvendt stribe, gråtrin og sorte nær-sort-felter (PLUGE)
function tpBars(x,y,w,h){let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000"/>`;
  const C=['#bfbfbf','#bfbf00','#00bfbf','#00bf00','#bf00bf','#bf0000','#0000bf'],D=['#0000bf','#000','#bf00bf','#000','#00bfbf','#000','#bfbfbf'],bw=w/7;
  C.forEach((c,i)=>s+=`<rect x="${x+i*bw}" y="${y}" width="${bw+.5}" height="${h*.62}" fill="${c}"/>`);
  D.forEach((c,i)=>s+=`<rect x="${x+i*bw}" y="${y+h*.62}" width="${bw+.5}" height="${h*.08}" fill="${c}"/>`);
  const F=['#fff','#ff0','#0ff','#0f0','#f0f','#f00','#00f'];F.forEach((c,i)=>s+=`<rect x="${x+i*bw}" y="${y+h*.70}" width="${bw+.5}" height="${h*.12}" fill="${c}"/>`);
  const ns=11,gw=w*.7/ns;for(let i=0;i<ns;i++){const g=Math.round(i*255/(ns-1));s+=`<rect x="${x+i*gw}" y="${y+h*.82}" width="${gw+.5}" height="${h*.18}" fill="rgb(${g},${g},${g})"/>`}
  [5,0,10,0,15].forEach((g,i)=>s+=`<rect x="${x+w*.7+i*w*.06}" y="${y+h*.82}" width="${w*.06+.5}" height="${h*.18}" fill="rgb(${g},${g},${g})"/>`);
  return s}

// edge blend: hver projektor i sin farve (overlap bliver blandet), blend-zoner med mål i px, nummer og pixelområde pr. projektor
function tpBlend(x,y,w,h,I,u){const {N,R,ew,eh,bx,by,W,H}=I,kx=w/W,ky=h/H,lw=Math.max(2*u,.5),fs=Math.min(ew*kx,eh*ky)*.14;
  const COL=['#e5484d','#30a46c','#3e63dd','#f5d90a','#d6409f','#12a594','#f76b15','#8e4ec6'];
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0b0d10"/>`;
  const n=16,m=Math.max(4,Math.round(n*h/w));
  for(let i=1;i<n;i++)s+=`<line x1="${x+w*i/n}" y1="${y}" x2="${x+w*i/n}" y2="${y+h}" stroke="#fff" stroke-opacity=".14" stroke-width="${lw/2}"/>`;
  for(let j=1;j<m;j++)s+=`<line x1="${x}" y1="${y+h*j/m}" x2="${x+w}" y2="${y+h*j/m}" stroke="#fff" stroke-opacity=".14" stroke-width="${lw/2}"/>`;
  const P=[];for(let rr=0;rr<R;rr++)for(let c=0;c<N;c++){const px0=c*(ew-bx),py0=rr*(eh-by);P.push({c,rr,px0,py0,X:x+px0*kx,Y:y+py0*ky,w:ew*kx,h:eh*ky,col:COL[(rr*N+c)%COL.length]})}
  P.forEach(p=>s+=`<rect x="${p.X}" y="${p.Y}" width="${p.w}" height="${p.h}" fill="${p.col}" fill-opacity=".26"/>`);
  s+=tpZones(x,y,w,h,I,u);
  // pr. projektor: kant, kryds og cirkel i midten, nummer og pixelområde
  P.forEach((p,i)=>{const cx=p.X+p.w/2,cy=p.Y+p.h/2,rr=Math.min(p.w,p.h)*.3;
    s+=`<rect x="${p.X+lw/2}" y="${p.Y+lw/2}" width="${p.w-lw}" height="${p.h-lw}" fill="none" stroke="${p.col}" stroke-width="${lw*1.5}"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${p.col}" stroke-width="${lw}"/><line x1="${cx-rr*1.2}" y1="${cy}" x2="${cx+rr*1.2}" y2="${cy}" stroke="${p.col}" stroke-width="${lw}"/><line x1="${cx}" y1="${cy-rr*1.2}" x2="${cx}" y2="${cy+rr*1.2}" stroke="${p.col}" stroke-width="${lw}"/>`;
    s+=tpTxt(cx,cy-rr*.45,fs,`P${i+1}`,p.col);
    const rg=[N>1?`x ${p.px0}–${p.px0+ew-1}`:'',R>1?`y ${p.py0}–${p.py0+eh-1}`:''].filter(Boolean).join(' · ');
    s+=tpTxt(cx,cy+rr*.45,fs*.4,`${ew} × ${eh} px`)+(rg?tpTxt(cx,cy+rr*.45+fs*.52,fs*.38,rg):'')});
  s+=`<rect x="${x+lw/2}" y="${y+lw/2}" width="${w-lw}" height="${h-lw}" fill="none" stroke="#fff" stroke-width="${lw}"/>`;
  s+=tpTxt(x+w/2,y+h-fs*.45,fs*.42,`${W} × ${H} px`);
  return s}

// blend-zoner: lys flade, stiplede kanter (= projektorernes kanter), pil og mål i px; ol = lagt oven på et andet mønster (mørk kant så linjerne ses på lyse farver)
function tpZones(x,y,w,h,I,u,ol){const {N,R,ew,eh,bx,by,W,H}=I,kx=w/W,ky=h/H,lw=Math.max(2*u,.5),fs=Math.min(ew*kx,eh*ky)*.14;let s='';
  const arrow=(x1,y1,x2,y2,a)=>{const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,hx=-uy*a*.5,hy=ux*a*.5;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="${lw}"/><polygon points="${x1},${y1} ${x1+ux*a+hx},${y1+uy*a+hy} ${x1+ux*a-hx},${y1+uy*a-hy}" fill="#fff"/><polygon points="${x2},${y2} ${x2-ux*a+hx},${y2-uy*a+hy} ${x2-ux*a-hx},${y2-uy*a-hy}" fill="#fff"/>`};
  const dash=`stroke="#fff" stroke-width="${lw}" stroke-dasharray="${lw*6} ${lw*4}"`,line=(x1,y1,x2,y2)=>(ol?`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="${lw*2.2}"/>`:'')+`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${dash}/>`;
  for(let c=0;c<N-1&&bx>0;c++){const zx=x+((c+1)*(ew-bx))*kx,zw=bx*kx,a=Math.min(zw*.3,fs*.45);
    s+=`<rect x="${zx}" y="${y}" width="${zw}" height="${h}" fill="#fff" fill-opacity="${ol?.18:.10}"/>`+line(zx,y,zx,y+h)+line(zx+zw,y,zx+zw,y+h);
    for(const yy of [y+h*.12,y+h*.88])s+=arrow(zx,yy,zx+zw,yy,a)+tpTxt(zx+zw/2,yy-fs*.55,fs*.42,`${bx} px`)}
  for(let rr=0;rr<R-1&&by>0;rr++){const zy=y+((rr+1)*(eh-by))*ky,zh=by*ky,a=Math.min(zh*.3,fs*.45);
    s+=`<rect x="${x}" y="${zy}" width="${w}" height="${zh}" fill="#fff" fill-opacity="${ol?.18:.10}"/>`+line(x,zy,x+w,zy)+line(x,zy+zh,x+w,zy+zh);
    for(const xx of [x+w*.08,x+w*.92])s+=arrow(xx,zy,xx,zy+zh,a)+tpTxt(xx+fs*.3,zy+zh/2,fs*.42,`${by} px`,'#fff','start')}
  // oven på et andet mønster: projektornummer øverst midt i hvert projektorbillede
  if(ol)for(let rr=0;rr<R;rr++)for(let c=0;c<N;c++)s+=tpTxt(x+(c*(ew-bx)+ew/2)*kx,y+(rr*(eh-by)+(rr?by:0))*ky+fs*.5,fs*.5,`P${rr*N+c+1}`);
  return s}

// hent det valgte testbillede som PNG i fuld opløsning
function tpDownload(){const I=TPI,k=tpKind(),W=I.W,H=I.H;
  if(W>16384||H>16384||W*H>1.5e8){alert(I18.tr('Billedet er for stort til at blive lavet i browseren.',S.lang));return}
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${tpSVG(0,0,W,H,k,I)}</svg>`;
  const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(img,0,0,W,H);
    c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`throwplanner-${k}-${W}x${H}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000)},'image/png')};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
