/* ===== DATA: hele Panasonics katalog (ModelData.js) =====
   model: {m, c, t, lm, lc, cr, asp[], dim[B,H,D mm], res[px], img, L:[navn,'Z'|'F',[[Aw,Bw,At,Bt,min",max"] pr. format],shift-polygon,offsetV,fremspring mm,billede]} */
const CAT=/*__CATALOG__*/;
const CATS=Object.fromEntries(CAT.cats);
const MODELS=CAT.models.map(m=>({...m,lm:m.lm||m.lc||0,lc:m.lc||m.lm||0,cr:m.cr||2000,dim:m.dim.length===3?m.dim:[400,150,350],res:m.res.length===2?m.res:[1920,1200],
  L:m.L.filter(l=>l[2].length&&l[2].some(r=>r[0]>0))}));
const CAT_ORDER=[1,2,4,8,3];
let IMGS={};
// besøgsstatistik (Umami, kun på throwplanner.com – scriptet findes ikke i artifactet)
const TRK=(n,d)=>{try{window.umami&&window.umami.track(n,d)}catch(e){}};

/* Panasonic flyrammer (ET-RFD-serien). Kilde: Panasonic "Overview Frames table FY25" + kompatibilitetstabel på eu.connect.panasonic.com
   stk:[loft,gulv] = maks. stablede projektorer (loft ×3 kræver ET-LINK200/201 eller ET-LINK210/211). ET-RFD80 står ikke i tabellen – produktsiden: «Stacking of up to 2 projectors» */
const FRAMES=[
 {id:'ET-RFD40',dim:[652,353.5,683],kg:13.5,stk:[3,3],re:/^PT-(REQ(15|12|10|80)|REZ(15|12|10|80)|RZ(990|890|790|690|970|870|770|670|660)|R[ZW]120|RCQ(10|80))/},
 {id:'ET-RFD41',dim:[652,394,683],kg:13.5,stk:[3,4],re:/^PT-(REQ(15|12|10|80)|REZ(15|12|10|80)|RZ(990|890|790|690|970|870|770|670|660)|R[ZW]120|RCQ(10|80))/},
 {id:'ET-RFD50',dim:[768.5,373,678],kg:14.5,stk:[3,3],re:/^PT-MZ(20K|17K|14K|11K|16K|13K|10K|882|782|682)/},
 {id:'ET-RFD65',dim:[778,388.5,721.4],kg:15.5,stk:[3,3],re:/^PT-R(Q25K|Q18K|Z24K|Z17K)/},
 {id:'ET-RFD60',dim:[750,435,883],kg:16,stk:[2,2],re:/^PT-R(Q22K|Z21K|Z16K|Q13K|Z12K|S20K)/},
 {id:'ET-RFD70',dim:[750,540,883],kg:17.5,stk:[2,4],re:/^PT-R(Q35K|Z34K)/},
 {id:'ET-RFD70H',dim:[749,540,894],kg:18.5,stk:[2,3],re:/^PT-R(Q35K|Z34K)/},
 {id:'ET-RFD80',dim:null,kg:null,stk:[2,2],re:/^PT-RQ50K/}
];
const FRAME_ADD=[152,187,103]; // tillæg brugt til skøn (samme margen som ET-RFD70 omkring PT-RQ35K)

