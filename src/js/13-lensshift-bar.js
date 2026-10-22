/* ===== LENS SHIFT-BAR (Panasonic shift-polygon for valgt optik og format) ===== */
// tilladt sideforskydning (m) for kolonne c i edge blend, ud over den fælles placering
function bdxRange(r){if(!r.P.length)return null;const hr=shRange(r.sv,r.P);if(!hr)return null;const dX=S.px-r.cx;
  return c=>{const a=-r.inv*(hr[0]+r.th)*r.W-dX,b=-r.inv*(hr[1]+r.th)*r.W-dX;return [Math.min(a,b),Math.max(a,b)]}}
function shRange(sv,P){let lo=null,hi=null;for(let s=-1.5;s<=1.5;s+=.0025){if(shiftOK(s,sv,P)){if(lo===null)lo=s;hi=s}}return lo===null?null:[lo,hi]}
function drawShiftBar(r){const P=r.P,none=!P.length,blend=S.blend&&(r.N>1||r.R>1);
  const pc=v=>{const x=Math.round(v*1000)/10;return (x>0?'+':'')+f2(x===0?0:x,x%1?1:0)+' %'};
  const vr=none?null:svRange(0,P),hr=none?null:shRange(0,P);
  const set=(id,lo,hi,val,dis)=>{const el=$(id);el.disabled=dis;if(lo!=null){el.min=(lo*100).toFixed(1);el.max=(hi*100).toFixed(1)}if(document.activeElement!==el)el.value=(val*100).toFixed(1)};
  set('svR',vr?vr[0]:0,vr?vr[1]:0,r.sv,none||!vr);set('shR',hr?hr[0]:0,hr?hr[1]:0,r.sh,none||!hr||(S.plan.use&&S.plan.lock&&planActive()));
  $('svMin').textContent=vr?pc(vr[0]):'–';$('svMax').textContent=vr?pc(vr[1]):'–';$('shMin').textContent=hr?pc(hr[0]):'–';$('shMax').textContent=hr?pc(hr[1]):'–';
  $('svVal').textContent=pc(r.sv);$('shVal').textContent=pc(r.sh);$('svVal').style.color=$('shVal').style.color=r.shOK?'':'var(--bad)';
  $('sv0').disabled=none||!vr;$('sh0').disabled=none||!hr||(S.plan.use&&S.plan.lock&&planActive());$('kv0').disabled=$('kh0').disabled=!(S.ks&&S.ks.on&&r.KL);
  {const lk=!!S.lockLens;$('lensLock').setAttribute('aria-pressed',lk);$('lensLockTxt').textContent=lk?'🔒 Optik låst':'Lås optik';}
  {const KL=r.KL,on=!!(S.ks&&S.ks.on);$('ksBtn').disabled=!KL;$('ksBtn').setAttribute('aria-pressed',on&&!!KL);$('ksBtn').parentElement.classList.toggle('on',on&&!!KL);
   const dg=v=>(v>0?'+':'')+f2(v,v%1?1:0)+'°';
   if(KL){const cap=KL.cap,vh=Math.min(KL.vmax,cap-Math.abs(r.kh)),vl=Math.max(KL.vmin,-(cap-Math.abs(r.kh))),hh=Math.min(KL.h,cap-Math.abs(r.kv));
     const st=(id,lo,hi,val)=>{const el=$(id);el.min=lo;el.max=hi;if(document.activeElement!==el)el.value=val};st('kvR',vl,vh,r.kv);st('khR',-hh,hh,r.kh);
     $('kvMin').textContent=dg(vl);$('kvMax').textContent=dg(vh);$('khMin').textContent=dg(-hh);$('khMax').textContent=dg(hh);$('kvVal').textContent=dg(r.kv);$('khVal').textContent=dg(r.kh);
     $('ksNote').textContent=on?`Panasonic: ${KL.vmin<0?'±':'+'}${KL.vmax}° V / ±${KL.h}° H${KL.safe?' (sikker værdi)':''} · tilsammen maks. ${cap}° · keystone bruges kun uden for lens shift`:`Keystone: ${KL.vmin<0?'±':'+'}${KL.vmax}° V / ±${KL.h}° H${KL.safe?' (sikker værdi)':''}`;
     const nP=r.N*r.R,lostPct=(1-r.ksUse)*100,pf=v=>f2(v,v>0&&v<10?1:0);
     $('ksLoss').innerHTML=on?(r.kv||r.kh?`Tabte pixels: <b>${fi(r.ksLost*nP)}</b> (${pf(lostPct)} %)${nP>1?` · ${fi(r.ksLost)} pr. projektor`:''} · Lystab: <b>${pf(lostPct)} %</b> (≈ ${fi(Math.round(r.lm0*nP*(1-r.ksUse)))} lm)`:`Inden for lens shift – keystone 0° · ingen tab af pixels eller lys`)+(r.ksBad?` · <span class="bad">uden for keystone-grænsen</span>`:''):''}
   else{$('ksNote').textContent='Ingen keystone-data for denne model';$('ksLoss').innerHTML=''}}
  {const pts=P.map(([a,b])=>`${a},${-b}`).join(' ');const ok=r.shOK;
   // loft/inverteret: drejes 180° så grafikken svarer til rummet (procenterne er stadig projektorens egne)
   $('shMini').innerHTML=`<rect x="-1.5" y="-1.3" width="3" height="2.6" rx=".12" style="fill:var(--bg2);stroke:var(--line)" stroke-width=".03"/><g${r.inv<0?' transform="rotate(180)"':''}>`+
    (none?'':`<polygon points="${pts}" style="fill:var(--beam-soft);stroke:var(--beam)" stroke-width=".035" stroke-dasharray=".09 .06"/>`)+
    `<line x1="-.5" y1="0" x2=".5" y2="0" style="stroke:var(--muted)" stroke-width=".02"/><line x1="0" y1="-.5" x2="0" y2=".5" style="stroke:var(--muted)" stroke-width=".02"/>`+
    `<rect x="${r.sh-.5}" y="${-r.sv-.5}" width="1" height="1" style="fill:var(--screen);stroke:${ok?'var(--ok)':'var(--bad)'}" stroke-width=".05" opacity=".9"/></g>`}
  {const nt=none?`${r.ln[0]} har ingen lens shift${r.off?` (fast offset ${f2(r.off*100,1)} %)`:''}`:(r.off?`fast offset ${f2(r.off*100,1)} % + shift`:'');
   $('shiftNote').textContent=(r.inv<0?'Loft, inverteret':'Bord / gulv')+(nt?' · '+nt:'');}
}
function setShift(sv,sh){const r=calc();let v=sv??r.sv,h=sh??r.sh;
  if(r.P.length&&!shiftOK(h,v,r.P)){if(sv!=null){const hr=shRange(v,r.P);if(hr)h=Math.max(hr[0],Math.min(hr[1],h))}else{const vr=svRange(h,r.P);if(vr)v=Math.max(vr[0],Math.min(vr[1],v))}}
  guardShift({py:S.py,px:S.px},{py:r.cy-r.inv*(v+r.off+r.tv)*r.H,px:r.cx-r.inv*(h+r.th)*r.W});render()}

