/* ===== TESTBILLEDER (boks 09): vælges i dropdown og kan hentes som PNG i præcis den opløsning, der står i boks 05 ===== */
// billedet i pixels: N×R projektorer à ew×eh, blend-zoner bx/by px, samlet W×H (sættes i render)
const Z9L=[1,1.5,2,3,4,6];let Z9=0,Z9C={x:.5,y:.5};   // zoomtrin i boks 09 og lærredets midte (brøkdel af tegningen)
let TPI={N:1,R:1,ew:1920,eh:1200,bx:0,by:0,W:1920,H:1200};
const tpBlendOK=()=>S.blend&&S.venue!=='immersive';
function tpInfo(r){const bl=tpBlendOK(),N=bl?r.N:1,R=bl?r.R:1,ew=r.ew||1920,eh=r.eh||1200,bx=bl&&N>1?Math.round(ew*r.o):0,by=bl&&R>1?Math.round(eh*r.o):0;
  return {N,R,ew,eh,bx,by,W:N*ew-(N-1)*bx,H:R*eh-(R-1)*by}}
const tpKind=()=>{const k=S.tp||'std';return k==='blend'&&!tpBlendOK()?'std':k};
// med edge blend får alle mønstre blend-zonerne ovenpå, så den hentede PNG kan bruges direkte til at justere projektorerne
function tpSVG(x,y,w,h,kind=tpKind(),I=TPI){const u=w/I.W;
  if(kind==='blend')return tpBlend(x,y,w,h,I,u);
  return (kind==='focus'?tpFocus(x,y,w,h,u):kind==='bars'?tpBars(x,y,w,h):testPattern(x,y,w,h))+(I.bx||I.by?tpZones(x,y,w,h,I,u,true):'')}
// skrift sættes i style, så appens svg.draw text-regel (mono 12px) ikke overtager den i visningen
const tpTxt=(x,y,fs,t,c='#fff',a='middle',k='#000')=>`<text x="${x}" y="${y}" style="font:700 ${fs}px Arial,Helvetica,sans-serif;fill:${c}" text-anchor="${a}" dominant-baseline="middle" stroke="${k}" stroke-width="${fs*.12}" paint-order="stroke">${t}</text>`;

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

// edge blend: ved hvert overlap et lille sæt farvebjælker, hvor den grønne bjælke ligger præcis i overlappet –
// hvid/gul/cyan i den ene projektor, magenta/rød/blå i den anden. En projektor i midten får derfor to sæt.
// Små cirkler kun i overlap, to linjer tværs over i top og bund, nummer og pixelområde pr. projektor.
function tpBlend(x,y,w,h,I,u){const {N,R,ew,eh,bx,by,W,H}=I,kx=w/W,ky=h/H,lw=Math.max(2*u,.5),fs=Math.min(ew*kx,eh*ky)*.14;
  const A=['#fff','#ff0','#0ff'],GRN='#0f0',B=['#f0f','#f00','#00f'],cl=(v,a,b)=>Math.min(b,Math.max(a,v));
  const sbw=cl(bx,ew*.05,ew*.07)*kx,sbh=cl(by,eh*.05,eh*.06)*ky;
  // hvid baggrund med rødt gitter (kvadratiske felter, 1/10 af højden)
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>`;const gs=h/10;
  for(let gx=x+gs;gx<x+w-1e-6;gx+=gs)s+=`<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y+h}" stroke="#e00" stroke-width="${lw}"/>`;
  for(let gy=y+gs;gy<y+h-1e-6;gy+=gs)s+=`<line x1="${x}" y1="${gy}" x2="${x+w}" y2="${gy}" stroke="#e00" stroke-width="${lw}"/>`;
  const T=(x1,y1,f,t,a)=>tpTxt(x1,y1,f,t,'#000',a,'#fff');
  const ring=(cx,cy,r)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#000" stroke-width="${lw*1.5}"/>`;
  const dash=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-opacity=".6" stroke-width="${lw}" stroke-dasharray="${lw*6} ${lw*4}"/>`;
  // lodrette overlap (mellem kolonner): bjælker i et bånd midt i hver række
  for(let c=0;c<N-1&&bx>0;c++){const zx=x+((c+1)*(ew-bx))*kx,zw=bx*kx,r=zw*.3,st=Math.max(zw*.9,eh*ky*.05);
    s+=dash(zx,y,zx,y+h)+dash(zx+zw,y,zx+zw,y+h);
    for(let rr=0;rr<R;rr++){const t=y+rr*(eh-by)*ky,rh=eh*ky,b0=t+rh*(R>1?.375:.35),b1=t+rh*(R>1?.625:.65);
      A.forEach((f,i)=>s+=`<rect x="${zx-(3-i)*sbw}" y="${b0}" width="${sbw+.3}" height="${b1-b0}" fill="${f}"/>`);
      s+=`<rect x="${zx}" y="${b0}" width="${zw}" height="${b1-b0}" fill="${GRN}"/>`;
      B.forEach((f,i)=>s+=`<rect x="${zx+zw+i*sbw-.3}" y="${b0}" width="${sbw+.3}" height="${b1-b0}" fill="${f}"/>`);
      s+=`<rect x="${zx-3*sbw}" y="${b0}" width="${6*sbw+zw}" height="${b1-b0}" fill="none" stroke="#000" stroke-width="${lw}"/>`;
      s+=T(zx+zw/2,b0-fs*.18,fs*.2,`${bx} px`);
      // cirkler hele vejen ned gennem overlappet, men ikke over målet
      const y0=t+rh*(rr?.08:.1),y1=t+rh*(rr<R-1?.92:.9);
      for(let cy=y0+r;cy<=y1-r;cy+=st)if(cy+r<b0-fs*.32||cy-r>b0)s+=ring(zx+zw/2,cy,r)}}
  // vandrette overlap (mellem rækker): bjælker liggende, midt i hver kolonne
  for(let rr=0;rr<R-1&&by>0;rr++){const zy=y+((rr+1)*(eh-by))*ky,zh=by*ky,r=zh*.3,st=Math.max(zh*1.3,ew*kx*.05);
    s+=dash(x,zy,x+w,zy)+dash(x,zy+zh,x+w,zy+zh);
    for(let c=0;c<N;c++){const l=x+c*(ew-bx)*kx,cw=ew*kx,ext=bx*kx+3*sbw,f0=l+(c?ext:0),f1=l+cw-(c<N-1?ext:0),fw=f1-f0,a0=f0+fw*.35,a1=f1-fw*.35;
      A.forEach((f,i)=>s+=`<rect x="${a0}" y="${zy-(3-i)*sbh}" width="${a1-a0}" height="${sbh+.3}" fill="${f}"/>`);
      s+=`<rect x="${a0}" y="${zy}" width="${a1-a0}" height="${zh}" fill="${GRN}"/>`;
      B.forEach((f,i)=>s+=`<rect x="${a0}" y="${zy+zh+i*sbh-.3}" width="${a1-a0}" height="${sbh+.3}" fill="${f}"/>`);
      s+=`<rect x="${a0}" y="${zy-3*sbh}" width="${a1-a0}" height="${6*sbh+zh}" fill="none" stroke="#000" stroke-width="${lw}"/>`;
      s+=T((a0+a1)/2,zy+zh/2,Math.min(fs*.2,zh*.5),`${by} px`);
      const x0=l+cw*(c?.08:.1),x1=l+cw*(c<N-1?.92:.9),lw2=fs*.35;
      for(let cx=x0+r;cx<=x1-r;cx+=st)if(Math.abs(cx-(a0+a1)/2)>lw2+r)s+=ring(cx,zy+zh/2,r)}}
  // to linjer tværs over i top og bund (og i siderne ved flere rækker) – skal fortsætte lige gennem overlap, når projektorerne er justeret
  const ln=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="${lw*2}"/>`;
  for(const f of [.03,.06,.94,.97])s+=ln(x,y+h*f,x+w,y+h*f);
  if(R>1)for(const f of [.015,.03,.97,.985])s+=ln(x+w*f,y,x+w*f,y+h);
  // pr. projektor: kryds og cirkel i midten, nummer og pixelområde
  for(let rr=0;rr<R;rr++)for(let c=0;c<N;c++){const px0=c*(ew-bx),py0=rr*(eh-by),cx=x+(px0+ew/2)*kx,cy=y+(py0+eh/2)*ky,ra=Math.min(ew*kx,eh*ky)*.16;
    s+=`<circle cx="${cx}" cy="${cy}" r="${ra}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="${lw}"/><line x1="${cx-ra*1.15}" y1="${cy}" x2="${cx+ra*1.15}" y2="${cy}" stroke="#000" stroke-opacity=".6" stroke-width="${lw}"/><line x1="${cx}" y1="${cy-ra*1.15}" x2="${cx}" y2="${cy+ra*1.15}" stroke="#000" stroke-opacity=".6" stroke-width="${lw}"/>`;
    s+=T(cx,cy-ra*.45,ra*.38,`P${rr*N+c+1}`);
    const rg=[N>1?`x ${px0}–${px0+ew-1}`:'',R>1?`y ${py0}–${py0+eh-1}`:''].filter(Boolean).join(' · ');
    s+=T(cx,cy+ra*.35,ra*.12,`${ew} × ${eh} px`)+(rg?T(cx,cy+ra*.55,ra*.11,rg):'')}
  s+=`<rect x="${x+lw/2}" y="${y+lw/2}" width="${w-lw}" height="${h-lw}" fill="none" stroke="#000" stroke-width="${lw}"/>`;
  s+=T(x+w*.045,y+h*.9,fs*.2,`${W} × ${H} px`,'start');
  return s}

// blend-zoner: lys flade, stiplede kanter (= projektorernes kanter), pil og mål i px; ol = lagt oven på et andet mønster (mørk kant så linjerne ses på lyse farver), nf = uden lys flade
function tpZones(x,y,w,h,I,u,ol,nf){const {N,R,ew,eh,bx,by,W,H}=I,kx=w/W,ky=h/H,lw=Math.max(2*u,.5),fs=Math.min(ew*kx,eh*ky)*.14;let s='';
  const arrow=(x1,y1,x2,y2,a)=>{const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,hx=-uy*a*.5,hy=ux*a*.5;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="${lw}"/><polygon points="${x1},${y1} ${x1+ux*a+hx},${y1+uy*a+hy} ${x1+ux*a-hx},${y1+uy*a-hy}" fill="#fff"/><polygon points="${x2},${y2} ${x2-ux*a+hx},${y2-uy*a+hy} ${x2-ux*a-hx},${y2-uy*a-hy}" fill="#fff"/>`};
  const dash=`stroke="#fff" stroke-width="${lw}" stroke-dasharray="${lw*6} ${lw*4}"`,line=(x1,y1,x2,y2)=>(ol?`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="${lw*2.2}"/>`:'')+`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${dash}/>`;
  for(let c=0;c<N-1&&bx>0;c++){const zx=x+((c+1)*(ew-bx))*kx,zw=bx*kx,a=Math.min(zw*.3,fs*.45);
    s+=(nf?'':`<rect x="${zx}" y="${y}" width="${zw}" height="${h}" fill="#fff" fill-opacity="${ol?.18:.10}"/>`)+line(zx,y,zx,y+h)+line(zx+zw,y,zx+zw,y+h);
    for(const yy of [y+h*.12,y+h*.88])s+=arrow(zx,yy,zx+zw,yy,a)+tpTxt(zx+zw/2,yy-fs*.55,fs*.42,`${bx} px`)}
  for(let rr=0;rr<R-1&&by>0;rr++){const zy=y+((rr+1)*(eh-by))*ky,zh=by*ky,a=Math.min(zh*.3,fs*.45);
    s+=(nf?'':`<rect x="${x}" y="${zy}" width="${w}" height="${zh}" fill="#fff" fill-opacity="${ol?.18:.10}"/>`)+line(x,zy,x+w,zy)+line(x,zy+zh,x+w,zy+zh);
    for(const xx of [x+w*.08,x+w*.92])s+=arrow(xx,zy,xx,zy+zh,a)+tpTxt(xx+fs*.3,zy+zh/2,fs*.42,`${by} px`,'#fff','start')}
  // oven på et andet mønster: projektornummer øverst midt i hvert projektorbillede
  if(ol)for(let rr=0;rr<R;rr++)for(let c=0;c<N;c++)s+=tpTxt(x+(c*(ew-bx)+ew/2)*kx,y+(rr*(eh-by)+(rr?by:0))*ky+fs*.5,fs*.5,`P${rr*N+c+1}`);
  return s}

// hent det valgte testbillede som PNG i fuld opløsning
// små billeder via ét canvas; store (over browserens canvas-grænse på 16.384 px) tegnes i bidder og pakkes som PNG her
async function tpDownload(){const I=TPI,k=tpKind(),W=I.W,H=I.H;
  if(W*H>6e8){alert(I18.tr('Billedet er for stort til at blive lavet i browseren.',S.lang));return}
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${tpSVG(0,0,W,H,k,I)}</svg>`;
  const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
  let b;if(W<=16384&&H<=16384&&W*H<=1.2e8){const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(img,0,0,W,H);b=await new Promise(r=>c.toBlob(r,'image/png'))}
  else b=await tpPNGTiled(img,W,H);
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`throwplanner-${k}-${W}x${H}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
let TPCRC=null;const tpCrc=(u8)=>{if(!TPCRC){TPCRC=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let j=0;j<8;j++)c=c&1?0xEDB88320^(c>>>1):c>>>1;TPCRC[n]=c>>>0}}
  let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=TPCRC[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
async function tpPNGTiled(img,W,H){const TW=Math.min(W,8192),TH=256,cv=document.createElement('canvas');cv.width=TW;cv.height=TH;const g=cv.getContext('2d',{willReadFrequently:true});
  const cs=new CompressionStream('deflate'),wr=cs.writable.getWriter(),z=new Response(cs.readable).arrayBuffer(),row=W*3+1;
  for(let y0=0;y0<H;y0+=TH){const th=Math.min(TH,H-y0),band=new Uint8Array(th*row);   // filterbyte 0 pr. linje, RGB
    for(let x0=0;x0<W;x0+=TW){const tw=Math.min(TW,W-x0);g.fillStyle='#fff';g.fillRect(0,0,TW,TH);g.drawImage(img,x0,y0,tw,th,0,0,tw,th);const d=g.getImageData(0,0,tw,th).data;
      for(let r=0;r<th;r++){let o=r*row+1+x0*3,i=r*tw*4;for(let c=0;c<tw;c++,i+=4){band[o++]=d[i];band[o++]=d[i+1];band[o++]=d[i+2]}}}
    await wr.write(band)}
  await wr.close();const data=new Uint8Array(await z);
  const chunk=(t,d)=>{const c=new Uint8Array(12+d.length),v=new DataView(c.buffer);v.setUint32(0,d.length);for(let i=0;i<4;i++)c[4+i]=t.charCodeAt(i);c.set(d,8);v.setUint32(8+d.length,tpCrc(c.subarray(4,8+d.length)));return c};
  const ih=new Uint8Array(13),v=new DataView(ih.buffer);v.setUint32(0,W);v.setUint32(4,H);ih[8]=8;ih[9]=2;
  return new Blob([new Uint8Array([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',data),chunk('IEND',new Uint8Array(0))],{type:'image/png'})}
