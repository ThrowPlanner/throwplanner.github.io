/* ===== KERNE (Panasonics Calculation.js) ===== */
const IN=0.0254;
const ratioOf=s=>{const m=s.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);return [+m[1],+m[2]]};
const keyOf=s=>{const[a,b]=ratioOf(s);return a+':'+b};
const distAt=(row,d,z)=>{const[aw,bw,at,bt]=row;return (aw+(at-aw)*z)*d+(bw+(bt-bw)*z)};
const zoomFor=(row,d,L)=>{const[aw,bw,at,bt]=row;const den=(at-aw)*d+(bt-bw);return den===0?0:(L-(aw*d+bw))/den};
const diagFor=(row,L,z)=>{const[aw,bw,at,bt]=row;return (L-(bw+(bt-bw)*z))/(aw+(at-aw)*z)};
function inPoly(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c}
function onEdge(x,y,P){const e=1e-6;return P.some(([px,py],i)=>{const[qx,qy]=P[(i+1)%P.length];const cr=(qx-px)*(y-py)-(qy-py)*(x-px);return Math.abs(cr)<e&&x>=Math.min(px,qx)-e&&x<=Math.max(px,qx)+e&&y>=Math.min(py,qy)-e&&y<=Math.max(py,qy)+e})}
function shiftOK(sh,sv,P){if(!P.length)return Math.abs(sh)<.01&&Math.abs(sv)<.01;return [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].every(([a,b])=>inPoly(sh+a,sv+b,P)||onEdge(sh+a,sv+b,P))}
function svRange(sh,P){let lo=null,hi=null;for(let s=-2.5;s<=2.5;s+=.0025){if(shiftOK(sh,s,P)){if(lo===null)lo=s;hi=s}}return lo===null?null:[lo,hi]}
/* hurtig lens shift-geometri: lodret korde af polygonen ved x, og det lodrette interval for billedets midte ved sh */
function chordY(P,x){let lo=Infinity,hi=-Infinity;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];
  if(Math.abs(xj-xi)<1e-12){if(Math.abs(x-xi)<1e-9){lo=Math.min(lo,yi,yj);hi=Math.max(hi,yi,yj)}continue}
  if(x>=Math.min(xi,xj)-1e-9&&x<=Math.max(xi,xj)+1e-9){const y=yi+(yj-yi)*(x-xi)/(xj-xi);lo=Math.min(lo,y);hi=Math.max(hi,y)}}return lo<=hi?[lo,hi]:null}
function svInt(sh,P){if(!P.length)return Math.abs(sh)<.01?[0,0]:null;const a=chordY(P,sh-.5),b=chordY(P,sh+.5);if(!a||!b)return null;const lo=Math.max(a[0],b[0])+.5,hi=Math.min(a[1],b[1])-.5;return lo<=hi+1e-9?[lo,Math.max(lo,hi)]:null}
/* keystone: andel af panelet der bruges, når billedet rettes op til et rektangel (pinhole-model, vip kv op / kh højre) */
function ksFrac(kv,kh,sv,sh,W,H,L,aw,ah){if(!kv&&!kh)return 1;const D=Math.PI/180,ca=Math.cos(kv*D),sa=Math.sin(kv*D),cb=Math.cos(kh*D),sb=Math.sin(kh*D);
  const fw=(u,v)=>{const x=(u+sh)*W/L,y=(v+sv)*H/L,z=1;const y1=y*ca+z*sa,z1=-y*sa+z*ca;const x2=x*cb+z1*sb,z2=-x*sb+z1*cb;if(z2<=1e-6)return null;return [x2*L/z2,y1*L/z2]};
  const bw=(X,Y)=>{const x2=X,y1=Y,z2=L;const x=x2*cb-z2*sb,z1=x2*sb+z2*cb;const y=y1*ca-z1*sa,z=y1*sa+z1*ca;return [x/z*L/W-sh,y/z*L/H-sv]};
  const Q=[fw(-.5,-.5),fw(.5,-.5),fw(.5,.5),fw(-.5,.5)];if(Q.some(q=>!q))return 0;
  const ar=(A)=>{let a=0;for(let i=0;i<A.length;i++){const p=A[i],q=A[(i+1)%A.length];a+=p[0]*q[1]-q[0]*p[1]}return a/2},sg=Math.sign(ar(Q))||1;
  const inside=(x,y)=>Q.every((p,i)=>{const q=Q[(i+1)%4];return sg*((q[0]-p[0])*(y-p[1])-(q[1]-p[1])*(x-p[0]))>=-1e-12});
  const rw=aw/Math.hypot(aw,ah),rh=ah/Math.hypot(aw,ah);
  const fit=(cx,cy)=>{let lo=0,hi=4*Math.hypot(W,H);for(let i=0;i<28;i++){const m=(lo+hi)/2,dx=m*rw/2,dy=m*rh/2;if(inside(cx-dx,cy-dy)&&inside(cx+dx,cy-dy)&&inside(cx+dx,cy+dy)&&inside(cx-dx,cy+dy))lo=m;else hi=m}return lo};
  let cx=Q.reduce((a,q)=>a+q[0],0)/4,cy=Q.reduce((a,q)=>a+q[1],0)/4,best=fit(cx,cy),st=Math.hypot(W,H)*.1;
  for(let it=0;it<30&&st>1e-5;it++){let moved=false;for(const[dx,dy]of[[st,0],[-st,0],[0,st],[0,-st]]){const f=fit(cx+dx,cy+dy);if(f>best+1e-12){best=f;cx+=dx;cy+=dy;moved=true;break}}if(!moved)st/=2}
  const dx=best*rw/2,dy=best*rh/2,R=[bw(cx-dx,cy-dy),bw(cx+dx,cy-dy),bw(cx+dx,cy+dy),bw(cx-dx,cy+dy)];return Math.max(0,Math.min(1,Math.abs(ar(R))))}
function effRes([pw,ph],aw,ah){const r=aw/ah;return r>=pw/ph?[pw,Math.round(pw/r)]:[Math.round(ph*r),ph]}

