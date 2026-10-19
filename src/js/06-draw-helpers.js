/* ===== TEGNEHJÆLPERE ===== */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
// tekstbredde efter oversættelse (japanske tegn er ca. dobbelt så brede)
function TW(t){const s=typeof I18!=='undefined'?I18.tr(t,S.lang):t;let u=0;for(const c of s)u+=/[\u3000-\u9fff\uff00-\uffef]/.test(c)?1.8:1;return u}
function lbl(x,y,t,cls='d',anchor='middle',rot=0){const w=TW(t)*7.3+10;const bx=anchor==='middle'?-w/2:anchor==='end'?-w:0;
  return `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${bx}" y="-9" width="${w}" height="18" rx="4" style="fill:var(--surface)" opacity=".9"/><text class="${cls}" x="${bx+w/2}" y="4.5" text-anchor="middle">${esc(t)}</text></g>`}
function dimH(x1,x2,y,t,ext1,ext2){const a=Math.min(x1,x2),b=Math.max(x1,x2);let s='';
  if(ext1!=null)s+=`<line x1="${x1}" y1="${ext1}" x2="${x1}" y2="${y}" style="stroke:var(--dim)" stroke-width=".8" opacity=".6"/>`;
  if(ext2!=null)s+=`<line x1="${x2}" y1="${ext2}" x2="${x2}" y2="${y}" style="stroke:var(--dim)" stroke-width=".8" opacity=".6"/>`;
  s+=`<line x1="${a}" y1="${y}" x2="${b}" y2="${y}" style="stroke:var(--dim)" stroke-width="1.3" marker-start="url(#ar)" marker-end="url(#ar)"/>`;
  return s+(b-a>8?lbl((a+b)/2,y,t):'')}
function dimV(x,y1,y2,t,ext1,ext2,hx){const a=Math.min(y1,y2),b=Math.max(y1,y2);let s='';
  if(ext1!=null)s+=`<line x1="${ext1}" y1="${y1}" x2="${x}" y2="${y1}" style="stroke:var(--dim)" stroke-width=".8" opacity=".6"/>`;
  if(ext2!=null)s+=`<line x1="${ext2}" y1="${y2}" x2="${x}" y2="${y2}" style="stroke:var(--dim)" stroke-width=".8" opacity=".6"/>`;
  s+=`<line x1="${x}" y1="${a}" x2="${x}" y2="${b}" style="stroke:var(--dim)" stroke-width="1.3" marker-start="url(#ar)" marker-end="url(#ar)"/>`;
  // for kort til lodret tekst → vandret tekst over målet (eller ude ved hx med hjælpelinje)
  if(b-a>TW(t)*7.3+16)return s+lbl(x,(a+b)/2,t,'d','middle',-90);
  if(hx==null)return s+lbl(x,a-13,t);
  const m=(a+b)/2;return s+`<line x1="${x}" y1="${m}" x2="${hx}" y2="${m}" style="stroke:var(--dim)" stroke-width=".8" opacity=".6"/>`+lbl(hx,m,t,'d',hx>x?'start':'end')}
const DEFS=id=>`<defs>
 <marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" style="fill:var(--dim)"/></marker>
 <pattern id="hatch${id}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" style="fill:var(--r-cut)"/><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--r-base)" stroke-width="1.4" opacity=".6"/></pattern>
 <pattern id="bz${id}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="7" height="7" style="fill:var(--beam-a)"/><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--beam)" stroke-width="1.4" opacity=".7"/></pattern>
 <linearGradient id="beamh${id}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" style="stop-color:var(--beam);stop-opacity:.6"/><stop offset="1" style="stop-color:var(--beam);stop-opacity:.07"/></linearGradient>
 <radialGradient id="glow${id}"><stop offset="0" style="stop-color:var(--r-light);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--r-light);stop-opacity:0"/></radialGradient>
 <linearGradient id="scr${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--screen)"/><stop offset="1" style="stop-color:var(--screen);stop-opacity:.85"/></linearGradient>
 <linearGradient id="flr${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--r-floor)"/><stop offset="1" style="stop-color:var(--r-floor2)"/></linearGradient>
 <linearGradient id="imm${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6D3BFF"/><stop offset=".5" stop-color="#16B6D9"/><stop offset="1" stop-color="#FF4FA3"/></linearGradient>
 <radialGradient id="immf${id}"><stop offset="0" stop-color="#16B6D9" stop-opacity=".55"/><stop offset=".6" stop-color="#6D3BFF" stop-opacity=".25"/><stop offset="1" stop-color="#6D3BFF" stop-opacity="0"/></radialGradient>
 <linearGradient id="drape${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E0F1C"/><stop offset=".5" stop-color="#B0202F"/><stop offset="1" stop-color="#6E0F1C"/></linearGradient>
 <linearGradient id="pjg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--pj-hi)"/><stop offset="1" style="stop-color:var(--pj)"/></linearGradient>
</defs>`;

function testPattern(x,y,w,h){const n=16,mrow=Math.max(4,Math.round(n*h/w));let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1b1f24"/>`;
  for(let i=1;i<n;i++)s+=`<line x1="${x+w*i/n}" y1="${y}" x2="${x+w*i/n}" y2="${y+h}" stroke="#fff" stroke-opacity=".28" stroke-width=".8"/>`;
  for(let j=1;j<mrow;j++)s+=`<line x1="${x}" y1="${y+h*j/mrow}" x2="${x+w}" y2="${y+h*j/mrow}" stroke="#fff" stroke-opacity=".28" stroke-width=".8"/>`;
  const cols=['#e6e6e6','#e8d33a','#32c7d6','#36c24a','#c53fc4','#d23a2e','#2f49c8'];const bw=w*.6/cols.length;
  cols.forEach((c,i)=>s+=`<rect x="${x+w*.2+i*bw}" y="${y+h*.62}" width="${bw}" height="${h*.16}" fill="${c}"/>`);
  for(let i=0;i<10;i++){const g=Math.round(i*255/9);s+=`<rect x="${x+w*.2+i*w*.06}" y="${y+h*.79}" width="${w*.06}" height="${h*.06}" fill="rgb(${g},${g},${g})"/>`}
  const rr=Math.min(w,h)*.42;s+=`<circle cx="${x+w/2}" cy="${y+h/2}" r="${rr}" fill="none" stroke="#fff" stroke-width="1.6"/><line x1="${x+w/2}" y1="${y}" x2="${x+w/2}" y2="${y+h}" stroke="#fff"/><line x1="${x}" y1="${y+h/2}" x2="${x+w}" y2="${y+h/2}" stroke="#fff"/>`;
  return s}
function hull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
  for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
  for(const p of pts.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
  return lo.slice(0,-1).concat(up.slice(0,-1))}
const pts=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');

let GCUR=null;
