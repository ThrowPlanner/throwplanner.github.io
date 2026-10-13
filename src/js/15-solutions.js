/* ===== LØSNINGER ===== */
function solutions(r){
  const res=[];MODELS.forEach((m,mi)=>{if(S.cat&&m.c!==S.cat)return;if(S.venue==='golf'&&m.c!==3)return;if(m.lm<S.minLm)return;const ai=aiFor(m);if(ai<0)return;
    m.L.forEach((l,li)=>{const row=l[2][ai];if(!row||!(row[0]>0))return;const fixed=l[1]==='F';const D=r.D;
      const a=distAt(row,D,0),b=distAt(row,D,1),z=fixed?0:zoomFor(row,D,S.L);
      const sizeOK=D>=row[4]-.5&&D<=row[5]+.5;const zOK=fixed?Math.abs(S.L-a)<=.015*a:(z>=-0.002&&z<=1.002);
      const lux=(m.lc||m.lm)/(r.W*r.H);res.push({mi,li,m,l,a,b,z,fixed,sizeOK,zOK,lux,ok:sizeOK&&zOK,miss:fixed?Math.abs(S.L-a)/a:(z<0?-z:z>1?z-1:0)})})});
  const allFits=res.filter(x=>x.ok).sort((x,y)=>(x.m.c===7)-(y.m.c===7)||Math.abs(x.z-.5)-Math.abs(y.z-.5));const fits=allFits.slice(0,30);
  let near=res.filter(x=>!x.ok&&x.sizeOK);if(!near.length)near=res.filter(x=>!x.ok);near=near.sort((x,y)=>x.miss-y.miss).slice(0,fits.length?3:6);
  $('solCap').textContent=`${allFits.length} kombinationer${allFits.length>30?' (viser 30)':''} giver ${f2(r.W)} m ved ${f2(S.L)} m · ${S.ak}`+(S.blend?' · pr. projektor':'');
  const tr=x=>{const zp=x.fixed?'Fast':`<span class="zbar"><i style="left:${Math.max(0,Math.min(100,x.z*100))}%"></i></span>${Math.round(x.z*100)} %`;
    const st=x.ok?pill('ok','Passer'):pill(x.fixed?'warn':'bad',x.fixed?'Fast afstand':x.z<0?'For tæt':'For langt');
    return `<tr data-mi="${x.mi}" data-li="${x.li}" tabindex="0" class="${x.mi==S.mi&&x.li==S.li?'cur':''}"><td class="th"><span>${imgTag('p:'+x.m.img,'')}</span></td><td><b>${x.m.m}</b> <span class="hint">${fi(x.m.lm)} lm${x.m.c===7?' · udgået':''}</span></td><td>${x.l[0]}</td><td>${zp}</td><td class="n">${x.fixed?f2(x.a):f2(x.a)+'–'+f2(x.b)} m</td><td class="n">${lensTR(x.m,x.l).replace(/^TR /,'')}</td><td class="n">${fi(x.lux)} lux</td><td>${st}</td></tr>`};
  const cur=res.find(x=>x.mi==S.mi&&x.li==S.li);
  $('solCur').innerHTML=cur?tr(cur):`<tr><td colspan="8" class="empty">Den valgte kombination understøtter ikke ${S.ak}.</td></tr>`;
  $('solSum').innerHTML=`Vis alle løsninger <span class="hint">· ${allFits.length} passer</span>`;$('dSol').open=!!S.openSol;
  $('sol').innerHTML=(fits.map(tr).join('')||`<tr><td colspan="8" class="empty">${res.length?'Ingen linse rammer præcis denne kombination. Nærmeste bud:':'Ingen modeller i filteret understøtter '+S.ak+'.'}</td></tr>`)+
    (near.length&&fits.length?`<tr><td colspan="8" class="empty" style="padding:8px 14px;font-size:12px">Tæt på:</td></tr>`:'')+near.map(tr).join('');
}
function formula(r){const[aw,bw,at,bt]=r.row;
  $('formula').textContent=
`Afstand (Panasonic):   L = A · diagonal(″) + B
  wide: ${aw} · ${f2(r.D,1)} ${bw<0?'−':'+'} ${Math.abs(bw)} = ${f2(r.Lw,3)} m
  tele: ${at} · ${f2(r.D,1)} ${bt<0?'−':'+'} ${Math.abs(bt)} = ${f2(r.Lt,3)} m
Zoom:        z = (L − L_wide) / (L_tele − L_wide) = ${r.fixed?'fast linse':f2(r.z*100,1)+' %'}
Størrelse:   B = D·w/√(w²+h²),  H = D·h/√(w²+h²)
Throw ratio: L / B = ${f2(S.L/r.W)}
Edge blend:  samlet bredde = n·B − (n−1)·overlap·B  →  B = ${f2(r.CW)} / ${f2(r.kx,3)} = ${f2(r.W,3)} m
Lens shift:  V = (lærredcentrum − linsehøjde)/H − offset = ${f2(r.sv*100,1)} %
Fysisk:      ${r.kind==='u'?'ultrakort kast: L måles til spejlet, kabinettet står mellem spejl og lærred (Panasonic-mål)':r.kind==='l'?'L-formet linse: kabinettet står lodret under linsehovedet':'linse rager '+mm(r.prot)+' mm frem foran kabinettet'} · kabinet ${r.m.dim.join('×')} mm${S.frame?` · ramme ${Math.round(S.fw)}×${Math.round(S.fh)}×${Math.round(S.fd)} mm`:''}
             nærmest lærred ${f2(Math.min(r.outFront,S.L),3)} m · bagkant ${f2(r.outBack,3)} m
Skygge:      strålens underkant ved række z: y = lærred_underkant + (linsehøjde − lærred_underkant)·z/L  < 1,32 m → hoved i lyset
Belysning:   lux = lumen / (B·H) = ${fi(r.lm)} / ${f2(r.W*r.H,3)} = ${fi(r.lux)}
Luminans:    cd/m² = gain · lux / π = ${fi(r.nits)}
Kontrast:    (lux + omg.) / (lux/kontrast + omg.) = ${fi(r.cr)}:1   (omg. ${fi(r.amb)} lux${S.sun.on&&SUNOK()?' inkl. sollys':''})`;}

