/* ===== SOL (København, dagens dato) – skøn over dagslys på lærredet ===== */
const LAT=55.68,LON=12.57,RAD=Math.PI/180;
function sunDay(){const d=new Date();const N=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);const dec=23.44*Math.sin(RAD*360/365*(N-81));
  const H0=Math.acos(Math.max(-1,Math.min(1,-Math.tan(LAT*RAD)*Math.tan(dec*RAD))))/RAD;const B=RAD*360/365*(N-81);const eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
  const tz=-d.getTimezoneOffset()/60||((N>86&&N<300)?2:1);const noon=12-(LON/15)+tz-eot/60;return {dec,H0,noon,rise:noon-H0/15,set:noon+H0/15}}
function sunPos(t){const D=sunDay();const H=(-D.H0+2*D.H0*t);const lat=LAT*RAD,dec=D.dec*RAD,h=H*RAD;
  const el=Math.asin(Math.sin(lat)*Math.sin(dec)+Math.cos(lat)*Math.cos(dec)*Math.cos(h))/RAD;
  const az=(Math.atan2(Math.sin(h),Math.cos(h)*Math.sin(lat)-Math.tan(dec)*Math.cos(lat))/RAD+180+360)%360;
  return {el,az,clock:D.noon+H/15,rise:D.rise,set:D.set}}
const hm=h=>{h=(h+24)%24;const m=Math.round(h*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const WALLS=f=>({back:f,left:(f+90)%360,right:(f+270)%360});
function sunLux(){const o=S.sun;if(!o||!o.on||!SUNOK())return {lux:0};const p=sunPos(o.t);if(p.el<=0)return {lux:0,...p};
  const w=WALLS(o.face),cust=o.win==='custom',off=new Set(o.off||[]);const use=cust?['left','right']:({back:['back'],left:['left'],right:['right'],sides:['left','right']}[o.win]||[]);
  const frac=k=>{if(!cust)return 1;if(k==='sky'){const q=SKY();return q.length?q.filter((_,i)=>!off.has('S'+i)).length/q.length:0}const z=SIDEW(),c=k==='left'?'L':'R';return z.length?z.filter((_,i)=>!off.has(c+i)).length/z.length:0};
  const pen=Math.max(0,1-p.el/60);let direct=0,lit=[];const per={};
  use.forEach(k=>{const c=Math.cos((p.az-w[k])*RAD);if(c>0){const v=c*pen*Math.min(1,3*Math.sin(p.el*RAD));per[k]=v;direct+=(k==='back'?3000:500)*v*frac(k);if(frac(k)>0)lit.push(k)}});
  const fs=cust?frac('sky'):0;if(fs>0){const v=Math.min(1,1.2*Math.sin(p.el*RAD));per.sky=v;direct+=900*v*fs;lit.push('sky')}
  const diffuse=(use.reduce((a,k)=>a+60*frac(k),0)+140*fs)*Math.sin(p.el*RAD);
  return {lux:Math.round(direct+diffuse),direct:Math.round(direct),diffuse:Math.round(diffuse),lit,per,...p}}
function sunColor(el){const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));const c=el<=0?[255,140,80]:el<10?mix([255,140,70],[255,214,140],el/10):mix([255,214,140],[255,248,228],Math.min(1,(el-10)/30));return `rgb(${c.join(',')})`}
function skyColor(el){const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));const c=el<=-2?[40,52,80]:el<6?mix([250,170,110],[190,215,240],Math.max(0,(el+2)/8)):mix([190,215,240],[150,200,245],Math.min(1,(el-6)/30));return `rgb(${c.join(',')})`}
const IMMC=()=>S.venue==='immersive'&&((S.content==='img'&&IMG)||S.content==='test')?(S.content==='img'?IMG:testURI()):null;
const SUNOK=()=>S.venue!=='theater'&&S.venue!=='immersive'&&S.venue!=='golf';
const AMB=()=>S.amb+sunLux().lux;
// ovenlys: 1,2 × 1,2 m kupler, én række (to ved bredde over 8 m), ca. hver 3. meter i dybden
function SIDEW(){const o=[];for(let z=2.6;z<S.rd-1;z+=2.6)o.push(z);return o}
function SKY(){const w=S.rw/2,zN=S.rd,a=1.2,out=[];const cols=S.rw>8?[-w/2,w/2]:[0];
  for(let z=2.2;z+a<=zN-0.8;z+=3)cols.forEach(x=>out.push([x-a/2,x+a/2,z,z+a]));return out}
function drawSunUI(){const o=S.sun,sl=sunLux(),p=sunPos(o.t);$('sunT').style.accentColor=o.on?sunColor(p.el):'';$('sunTime').style.color=o.on?sunColor(p.el):'';$('sunBar').classList.toggle('off',!o.on);$('sunOn').checked=!!o.on;$('sunWin').value=o.win;
  if(document.activeElement!==$('sunT'))$('sunT').value=Math.round(o.t*1000);
  $('sunTime').textContent=o.on?`${hm(p.clock)} · ${p.el>0?fi(sl.lux)+' lux':'mørkt'}`:`${hm(p.rise)}–${hm(p.set)}`;$('sunTime').title=o.on?`Solhøjde ${Math.round(p.el)}°, retning ${Math.round(p.az)}° · København, i dag`:'Sollys er slået fra';
  const f=o.face;const ax=(a,r)=>[Math.sin(a*RAD)*r,-Math.cos(a*RAD)*r];
  let c=`<circle r="27" style="fill:var(--surface);stroke:var(--line)"/>`;
  ['N','Ø','S','V'].forEach((t,i)=>{const [x,y]=ax(i*90,20.5);c+=`<text x="${x}" y="${y+3.5}" text-anchor="middle" style="font-size:9px;font-family:var(--f-mono);fill:${t==='N'?'var(--bad)':'var(--muted)'};font-weight:700">${t}</text>`});
  // rum: lærred som streg, pil = retning lærredet vender (mod publikum)
  const [sx,sy]=ax(f+180,9),[px,py]=ax(f,13),[lx,ly]=ax(f+90,7),[rx,ry]=ax(f-90,7);
  c+=`<g transform="translate(${sx},${sy})"><line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" style="stroke:var(--ink)" stroke-width="3" stroke-linecap="round"/></g><line x1="${sx}" y1="${sy}" x2="${px}" y2="${py}" style="stroke:var(--beam)" stroke-width="1.6"/><circle cx="${px}" cy="${py}" r="2.2" style="fill:var(--beam)"/>`;
  if(o.on&&p.el>0){const [ux,uy]=ax(p.az,24);c+=`<circle cx="${ux}" cy="${uy}" r="4" style="fill:#FFC233;stroke:#B07700" stroke-width="1"/>`}
  $('compass').innerHTML=c+`<title>Lærredet vender mod ${Math.round(f)}° (${['N','NØ','Ø','SØ','S','SV','V','NV'][Math.round(f/45)%8]})</title>`}
