// boks 03: Menu-hjælp – søg i projektorens egen skærmmenu (menutræ og sidetal fra Panasonics manualer, data/menus.json)
const MENUS=/*__MENUS__*/;
/* oprydning i menutræet (udtrukket automatisk fra manualernes tekst):
   – er alle et punkts «valg» i virkeligheden undermenuer (fx [LENS] › [LENS TYPE]), er valglisten forkert og fjernes
   – et valg med egne indstillinger (fx [COLOR MATCHING] › [3COLORS], [GEOMETRY] › [KEYSTONE]) står kun som valg; undermenuen gemmes i it.osub
   – en undermenus valg må ikke være en nabo-undermenu eller et nabovalg på flere ord (fx [LENS TYPE] › [LENS HOME POSITION], [KEYSTONE] › [CURVED CORRECTION])
   – [ON]/[OFF] er en indstilling, ikke en undermenu */
for(const man of MENUS)for(const m of man.me)for(const it of m[2]){let subs=(it[3]||[]).filter(s=>!/^(ON|OFF)$/.test(s[0])||(it[2]||[]).includes(s[0]));const sn=new Set(subs.map(s=>s[0]));
  if((it[2]||[]).length&&it[2].every(o=>sn.has(o)))it[2]=[];
  const os=new Set(it[2]||[]);it.osub={};it[3]=subs.filter(s=>os.has(s[0])?(it.osub[s[0]]=s,false):true);
  for(const s of subs)s[2]=[...new Set((s[2]||[]).filter(o=>!sn.has(o)&&o!==it[0]&&!(os.has(o)&&/\S\s\S/.test(o))))]}
// egne korte forklaringer: 'MENUPUNKT':'dansk|english|ekstra søgeord' (vises på engelsk; danske ord kan stadig søges)
const MH={
'PICTURE':'Billedindstillinger|Picture settings|billede farve',
'POSITION':'Placering og geometri af billedet|Image position and geometry|placering',
'ADVANCED MENU':'Avancerede billedfunktioner|Advanced picture functions|avanceret',
'DISPLAY LANGUAGE':'Sprog i menuen|Menu language|sprog language dansk english',
'LANGUAGE':'Sprog i menuen|Menu language|sprog language dansk english',
'DISPLAY OPTION':'Visning, indgange og billedtilpasning|Display, inputs and image matching|visning',
'PROJECTOR SETUP':'Opsætning af selve projektoren|Projector set-up|opsætning setup',
'TEST PATTERN':'Testbilleder til justering|Test images for alignment|testbillede gitter grid fokus focus',
'SIGNAL LIST':'Gemte indgangssignaler|Stored input signals|signal liste',
'SECURITY':'Adgangskoder og lås|Passwords and locks|sikkerhed kode lås',
'NETWORK':'Netværk og fjernstyring|Network and remote control|netværk lan ip',
'NETWORK/USB':'Netværk og USB|Network and USB|netværk lan ip usb',
'3D SETTINGS':'3D-indstillinger|3D settings|3d',
'PICTURE MODE':'Forudindstillet billedtilstand (fx Standard, Dynamic, Cinema)|Picture preset (e.g. Standard, Dynamic, Cinema)|billedtilstand preset mode',
'CONTRAST':'Kontrast|Contrast|kontrast',
'BRIGHTNESS':'Sortniveau (lyse/mørke partier)|Black level|lysstyrke sort niveau',
'COLOR':'Farvemætning|Colour saturation|farve mætning saturation',
'TINT':'Farvetone (hud­toner)|Hue / tint|farvetone hue',
'COLOR TEMPERATURE':'Hvidbalance – varm/kold|White balance – warm/cool|farvetemperatur kelvin hvidbalance white balance',
'WHITE GAIN':'Hvor kraftige de hvide flader er|Intensity of white areas|hvid',
'GAMMA':'Gråtone-kurve|Grey-scale curve|gamma',
'SYSTEM DAYLIGHT VIEW':'Bedre billede i lyst lokale|Better image in bright rooms|dagslys lyst rum sollys',
'DAYLIGHT VIEW':'Bedre billede i lyst lokale|Better image in bright rooms|dagslys lyst rum sollys',
'SHARPNESS':'Skarphed|Sharpness|skarphed skarp',
'NOISE REDUCTION':'Støjreduktion|Noise reduction|støj',
'DYNAMIC CONTRAST':'Automatisk kontrast/lysregulering|Automatic contrast / light control|dynamisk kontrast sort',
'DYNAMIC CONTRAST NX':'Automatisk kontrast/lysregulering|Automatic contrast / light control|dynamisk kontrast sort',
'COLOR SPACE':'Farverum|Colour space|farverum rec709 rec2020',
'SYSTEM SELECTOR':'Signalformat|Signal format|signal format',
'DEFAULT PICTURE MODE':'Standard billedtilstand ved opstart|Default picture mode|billedtilstand',
'IRIS':'Blænde – sortniveau/kontrast|Iris – black level/contrast|blænde iris',
'SHIFT':'Flyt billedet digitalt (ikke lens shift)|Move the image digitally (not lens shift)|flyt position',
'ASPECT':'Billedformat (16:9, 16:10 …)|Aspect ratio (16:9, 16:10 …)|format aspect 16:9 16:10 4:3',
'ZOOM':'Digital zoom af signalet|Digital zoom of the signal|zoom',
'DIGITAL ZOOM':'Digital zoom af signalet|Digital zoom of the signal|zoom',
'GEOMETRY':'Keystone, hjørner og buet lærred|Keystone, corners and curved screens|keystone trapez hjørne corner kurvet buet curved geometri warp',
'SCREEN ADJUSTMENT':'Keystone og hjørnekorrektion|Keystone and corner correction|keystone trapez hjørne corner geometri',
'REALTIME KEYSTONE':'Automatisk lodret keystone|Automatic vertical keystone|keystone trapez auto hældning',
'CLOCK PHASE':'Fjern flimmer på pc-signal|Remove flicker on PC signal|flimmer pc vga',
'DOT CLOCK':'Fjern striber på pc-signal|Remove stripes on PC signal|striber pc vga',
'OVER SCAN':'Beskær billedkanten|Crop the image edge|beskær kant overscan',
'DIGITAL CINEMA REALITY':'Film-signal (24p) behandling|Film-signal (24p) processing|film 24p',
'BLANKING':'Sort maske i kanterne|Black masking at the edges|maske kant sort blanking beskær',
'EDGE BLENDING':'Bløde overgange mellem flere projektorer|Soft edges between multiple projectors|edge blend blending overlap flere projektorer sammensætning',
'FRAME RESPONSE':'Lavere forsinkelse|Lower latency|forsinkelse latency delay',
'FRAME DELAY':'Lavere forsinkelse|Lower latency|forsinkelse latency delay',
'QUAD PIXEL DRIVE':'Højere opløsning (4K-forskydning)|Higher resolution (4K shift)|4k opløsning',
'RASTER POSITION':'Flyt billedet inden for panelet|Move image within the panel|position',
'COLOR MATCHING':'Ens farver på flere projektorer|Match colours across projectors|farve flere projektorer ens',
'COLOR CORRECTION':'Farvekorrektion pr. indgang|Colour correction per input|farve korrektion',
'SCREEN SETTING':'Lærredsformat/panel-opløsning|Screen format / panel area|lærred format',
'BACKUP INPUT SETTING':'Automatisk skift til reserve-indgang|Automatic switch to backup input|backup reserve redundans',
'HDMI IN':'Indstillinger for HDMI-indgang|HDMI input settings|hdmi indgang',
'HDMI1 IN / HDMI2 IN':'Indstillinger for HDMI-indgange|HDMI input settings|hdmi indgang',
'DIGITAL LINK IN':'Indstillinger for DIGITAL LINK (HDBaseT)|DIGITAL LINK (HDBaseT) settings|hdbaset digital link',
'DIGITAL LINK':'DIGITAL LINK (HDBaseT)|DIGITAL LINK (HDBaseT)|hdbaset',
'DIGITAL LINK MODE':'DIGITAL LINK (HDBaseT)-tilstand|DIGITAL LINK (HDBaseT) mode|hdbaset',
'SDI IN':'Indstillinger for SDI-indgang|SDI input settings|sdi',
'SLOT IN':'Indstillinger for indstikskort (slot)|Interface board (slot) settings|slot kort 12g-sdi',
'DisplayPort IN':'Indstillinger for DisplayPort|DisplayPort settings|displayport',
'ON-SCREEN DISPLAY':'Skjul/vis menu og beskeder på billedet|Show/hide on-screen messages|osd beskeder skjul',
'MENU MODE':'Simpel eller fuld menu|Simple or full menu|menu',
'BACK COLOR':'Baggrund uden signal|Background with no signal|baggrund blå sort',
'STARTUP LOGO':'Opstartslogo|Start-up logo|logo opstart',
'UNIFORMITY':'Ensartet farve over hele billedet|Uniform colour across the image|ensartet farve',
'SHUTTER SETTING':'Lukker – fade ind/ud|Shutter – fade in/out|shutter lukker fade sort',
'FREEZE':'Frys billedet|Freeze image|frys pause',
'WAVEFORM MONITOR':'Vis signalniveau|Show signal level|signal måling',
'CUT OFF':'Slå farvekanaler fra (til justering)|Turn off colour channels (for alignment)|rgb kanal',
'PROJECTOR ID':'ID-nummer til fjernbetjening|ID number for remote control|id fjernbetjening',
'PROJECTION METHOD':'Loft/gulv og forfra/bagfra|Ceiling/floor and front/rear|loft gulv bagprojektion rear front ceiling spejl vend',
'LENS':'Optik: kalibrering, hukommelse, type|Lens: calibration, memory, type|linse optik lens shift fokus zoom kalibrering',
'SLOT SETTING':'Strøm til indstikskort|Power to interface board|slot',
'OPERATION SETTING':'Drift: lysstyrke-tilstand, 24/7 osv.|Operation mode, 24/7 etc.|drift lysstyrke 24/7 lydløs',
'LIGHT OUTPUT':'Lysstyrke (lyskilde-effekt)|Light output (light source power)|lysstyrke lumen dæmp lys',
'LAMP POWER':'Lysstyrke (lyskilde-effekt)|Light output (light source power)|lysstyrke lumen dæmp lys',
'BRIGHTNESS CONTROL':'Konstant lysstyrke / ens lys på flere projektorer|Constant brightness / match across projectors|lysstyrke konstant flere projektorer',
'STANDBY MODE':'Strømforbrug i standby|Standby power|standby strøm',
'QUICK STARTUP':'Hurtig opstart|Quick start-up|opstart hurtig',
'POWER MANAGEMENT':'Sluk uden signal|Power off without signal|strøm sluk auto',
'ECO MANAGEMENT':'Strømsparefunktioner|Power-saving functions|eco strøm spare sluk',
'NO SIGNAL SETTING':'Hvad sker der uden signal|Behaviour with no signal|ingen signal',
'INITIAL STARTUP':'Første opstart|Initial set-up|første opstart',
'INITIAL START UP':'Første opstart|Initial set-up|første opstart',
'STARTUP INPUT SELECT':'Indgang ved opstart|Input at start-up|indgang opstart',
'DATE AND TIME':'Dato og tid|Date and time|dato tid ur',
'SCHEDULE':'Tænd/sluk efter tidsplan|Power on/off by schedule|tidsplan timer kalender',
'MULTI PROJECTOR SYNC':'Synkroniser flere projektorer|Sync multiple projectors|synk flere projektorer',
'RS-232C':'Seriel styring|Serial control|rs232 seriel styring',
'STORE TYPE':'Butik/udstillingstilstand|Store/display mode|butik',
'USB CONNECT CONTROL':'USB-styring|USB control|usb',
'FUNCTION BUTTON':'Genvejsknap på fjernbetjening|Function button on remote|funktionsknap genvej',
'STATUS':'Status: driftstimer, temperatur, fejl|Status: hours, temperature, errors|status timer temperatur fejl',
'INDICATOR SETTING':'Lysdioder på projektoren|Indicator lamps|lysdiode led',
'USER IMAGE':'Eget billede/logo|Own image/logo|logo billede',
'DATA CLONING':'Kopiér indstillinger til andre projektorer|Copy settings to other projectors|kopier klon',
'SAVE ALL USER DATA':'Gem alle indstillinger|Save all settings|gem backup',
'LOAD ALL USER DATA':'Indlæs gemte indstillinger|Load saved settings|indlæs',
'HDMI CEC':'Styring via HDMI|Control via HDMI|cec',
'INITIALIZE':'Nulstil til fabriksindstilling|Reset to factory settings|nulstil reset fabrik',
'INITIALIZE ALL':'Nulstil til fabriksindstilling|Reset to factory settings|nulstil reset fabrik',
'FIRMWARE UPDATE':'Opdater firmware|Update firmware|firmware opdater',
'FILTER COUNTER':'Filter-tæller|Filter counter|filter',
'FILTER SETTING':'Filter|Filter|filter',
'IMAGE ROTATION':'Rotér billedet (portræt)|Rotate the image (portrait)|portræt portrait rotér',
'MULTI IMAGE PROJECTION':'Flere projektorer samlet|Multiple projectors combined|flere projektorer',
'P-TIMER':'Nedtællingsur på billedet|Countdown timer on screen|timer ur',
'AUTO SETUP':'Automatisk justering af pc-signal|Automatic PC signal set-up|auto',
'AUTO SIGNAL':'Automatisk justering af pc-signal|Automatic PC signal set-up|auto',
'SIGNAL SEARCH':'Find indgang med signal automatisk|Search input with signal|signal søg indgang',
'AUDIO SETTING':'Lyd|Audio|lyd højttaler volumen',
'SECURITY PASSWORD':'Adgangskode ved opstart|Start-up password|kode password',
'MENU LOCK':'Lås menuen|Lock the menu|lås menu',
'CONTROL DEVICE SETUP':'Lås knapper på projektor/fjernbetjening|Lock buttons on projector/remote|lås knapper',
'TEXT DISPLAY':'Tekst på billedet|Text on image|tekst',
'WIRED LAN':'Kablet netværk (IP-adresse)|Wired network (IP address)|ip adresse lan dhcp',
'WIRELESS LAN':'Trådløst netværk|Wireless network|wifi trådløs',
'NETWORK CONTROL':'Styring over netværk (web, PJLink …)|Network control (web, PJLink …)|web styring',
'NETWORK STATUS':'Vis netværksstatus|Show network status|ip status',
'PJLink':'PJLink-styring|PJLink control|pjlink',
'Art-Net':'Art-Net (lysstyring/DMX)|Art-Net (lighting/DMX)|dmx artnet lysstyring',
'Art-Net SETUP':'Art-Net (lysstyring/DMX)|Art-Net (lighting/DMX)|dmx artnet lysstyring',
'PROJECTOR NAME':'Projektorens navn på netværket|Projector network name|navn',
'ADMINISTRATOR ACCOUNT':'Administrator-konto|Administrator account|admin konto',
'CONVERGENCE':'Farvekonvergens (RGB-forskydning)|Colour convergence|konvergens rgb',
'MEMORY VIEWER':'Vis billeder fra USB|Show images from USB|usb billeder',
'MIRRORING':'Skærmdeling fra pc/mobil|Screen mirroring|mirroring trådløs',
'DC OUT':'Strøm-udgang (USB)|DC power output (USB)|usb strøm'};
const MH_CHIPS=[['Edge blend','edge blending'],['Keystone','keystone'],['Lens shift','lens'],['Ceiling / rear','projection method'],['Brightness','light output'],['Network / IP','lan'],['Test pattern','test pattern'],['Factory reset','initialize'],['Passwords','password']];
const mhNorm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[-_/]/g,' ');
// Menu-hjælp er altid på engelsk (som projektorens menu) – derfor notr på hele dialogen
function menuHelp(){
  const cur=pjSlug(MODELS[slotMI()].m),man=MENUS.find(x=>x.mo.includes(cur))||null;
  const d=document.createElement('dialog');d.className='pdfdlg mhdlg notr';d.lang='en';
  const opts=MENUS.map((x,i)=>`<option value="${i}"${x===man?' selected':''}>${esc(x.mo.map(k=>k.toUpperCase()).join(' / '))}</option>`).join('');
  d.innerHTML=`<h3>Menu Help</h3><p class="mhsub">Find the right place in the projector's own on-screen menu.</p>
    <select class="mhmod" aria-label="Projector">${opts}</select>
    <input type="search" class="mhq" placeholder="What do you want to set? e.g. keystone, edge blend, IP address" aria-label="Search the menu">
    <div class="mhchips">${MH_CHIPS.map(c=>`<button type="button" class="chip" data-q="${esc(c[1])}">${esc(c[0])}</button>`).join('')}</div>
    <div class="mhres" aria-live="polite"></div>
    <div class="mhguide" hidden></div>
    <p class="mhnote">Menu names and page numbers from Panasonic's operating instructions. Names may vary with the firmware version.</p>
    <div class="pdfbtns"><a class="manbtn mhman" target="_blank" rel="noopener noreferrer">Manual</a><button type="button" class="btn mhgo" aria-pressed="false">Make a guided help</button><button type="button" class="btn" value="no">Close</button></div>`;
  const q=d.querySelector('.mhq'),sel=d.querySelector('.mhmod'),out=d.querySelector('.mhres'),mb=d.querySelector('.mhman');
  const url=()=>{const p=MAN_PJ[MENUS[sel.value].mo[0]];return /^https?:/.test(p)?p:MAN_B+p};
  const pg=n=>`<a class="mhpg" href="${url()}#page=${n}" target="_blank" rel="noopener noreferrer" title="Open the manual at page ${n}">p. ${n}</a>`;
  const desc=k=>{const h=MH[k];return h?h.split('|')[1]:''};
  const ops=o=>o&&o.length?`<span class="mhops">${o.map(x=>`<i>${esc(x)}</i>`).join('')}</span>`:'';
  const pw=a=>a&&a.length?`<span class="mhpw">Default password: ${a.map(x=>`<code>${esc(x)}</code>`).join(' · ')}</span>`:'';
  const path=p=>p.length?`<span class="mhpath">${p.map(esc).join(' › ')} › </span>`:'';
  // et menupunkt: [navn, side, valg, undermenuer[[navn, side, valg]], adgangskoder] – med undermenuer kan det foldes ud
  const item=(it,p,open)=>{const head=`<div>${path(p)}<b>${esc(it[0])}</b>${desc(it[0])?`<span class="mhd">${esc(desc(it[0]))}</span>`:''}${ops(it[2])}${pw(it[4])}</div>${pg(it[1])}`;
    const subs=[...(it[3]||[]),...Object.values(it.osub||{})].sort((a,b)=>a[1]-b[1]);
    return subs.length?`<li class="mhsubs"><details${open?' open':''}><summary>${head}</summary><ul>${subs.map(s=>`<li><div><b>${esc(s[0])}</b>${ops(s[2])}</div>${pg(s[1])}</li>`).join('')}</ul></details></li>`:`<li>${head}</li>`};
  const draw=()=>{const M=MENUS[sel.value].me,t=mhNorm(q.value).split(/\s+/).filter(Boolean);mb.href=url();
    if(!t.length){out.innerHTML=M.map(m=>`<details class="mhtop"><summary><div><b>${esc(m[0])}</b><span class="mhd">${esc(desc(m[0]))}</span>${pw(m[3])}</div>${pg(m[1])}</summary><ul>${m[2].map(i=>item(i,[])).join('')}</ul></details>`).join('');return}
    const sc=(name,hay)=>{let s=0;for(const w of t){if(mhNorm(name).includes(w))s+=3;else if(mhNorm(hay).includes(w))s+=1;else return 0}return s};
    const pwk=a=>a&&a.length?' password default kode adgangskode '+a.join(' '):'';
    const hits=[];
    for(const m of M){const s=sc(m[0],(MH[m[0]]||'')+' '+m[0]+pwk(m[3]));if(s)hits.push([s,[],[m[0],m[1],[],[],m[3]],0]);
      for(const it of m[2]){const subs=it[3]||[],sub=subs.map(x=>x[0]+' '+x[2].join(' ')).join(' ');
        const s1=sc(it[0],[MH[it[0]]||'',m[0],it[2].join(' '),sub,pwk(it[4])].join(' '));
        // ramte ordet kun en undermenu, foldes punktet ud
        if(s1){const own=mhNorm(it[0]+' '+(MH[it[0]]||''));hits.push([s1,[m[0]],it,t.some(w=>!own.includes(w))])}}}
    hits.sort((a,b)=>b[0]-a[0]);
    out.innerHTML=hits.length?`<ul>${hits.slice(0,40).map(h=>item(h[2],h[1],h[3])).join('')}</ul>`:`<p class="mhnone">Nothing found – try another word, or clear the search to see the whole menu.</p>`};
  const gd=d.querySelector('.mhguide'),gb=d.querySelector('.mhgo');let G=null;
  const guideMode=on=>{gb.setAttribute('aria-pressed',on);gb.textContent=on?'Back to search':'Make a guided help';gd.hidden=!on;
    for(const el of [q,d.querySelector('.mhchips'),out])el.hidden=on;
    if(on){G=mhGuide(gd,MENUS[sel.value],url);TRK('Guided help',{model:MENUS[sel.value].mo[0]})}else{gd.innerHTML='';G=null}};
  gb.addEventListener('click',()=>guideMode(!G));
  sel.addEventListener('change',()=>{if(G)guideMode(true)});
  q.addEventListener('input',draw);sel.addEventListener('change',draw);
  d.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{q.value=b.dataset.q;draw();q.focus()}));
  d.querySelector('[value="no"]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>d.remove());
  document.body.appendChild(d);draw();d.showModal();q.focus();TRK('Menu-hjælp',{model:cur})}
$('mhBtn').addEventListener('click',menuHelp);

// «Make a guided help»: klik dig gennem menu › punkt › undermenu › valg – laver et step-by-step-billede til en mail
function mhGuide(box,man,url){
  const model=man.mo.map(k=>k.toUpperCase()).join(' / ');
  let path=[];// [{k:'menu'|'item'|'sub'|'opt', n:navn, p:side, pw:[koder], ref:node}]
  box.innerHTML=`<p class="mhsub">Click through the menu as you would on the projector. Every click adds a step.</p>
    <div class="mhgpath"></div><div class="mhgpick"></div>
    <label class="mhgl">Title<input type="text" class="mhgt" maxlength="90"></label>
    <label class="mhgl">Note for the customer (optional)<textarea class="mhgn" rows="2" maxlength="400" placeholder="e.g. Use this after moving the projector."></textarea></label>
    <div class="mhgprev"></div>
    <div class="mhgact"><button type="button" class="btn mhgimg">Copy image</button><button type="button" class="btn mhgtxt">Copy text</button><button type="button" class="btn mhgpng">Save PNG</button></div>
    <p class="mhgmsg" aria-live="polite"></p>`;
  const $$=s=>box.querySelector(s),ti=$$('.mhgt'),no=$$('.mhgn'),msg=$$('.mhgmsg');let auto='',dirty=false;
  ti.addEventListener('input',()=>{dirty=true;prev()});no.addEventListener('input',prev);
  const last=()=>path[path.length-1];
  // valgmuligheder på det næste niveau
  const choices=()=>{const L=last();if(!L)return man.me.map(m=>({k:'menu',n:m[0],p:m[1],pw:m[3],ref:m}));
    if(L.k==='menu')return L.ref[2].map(i=>({k:'item',n:i[0],p:i[1],pw:i[4],ref:i}));
    // osub: et valg med egne indstillinger – vælges med ◀ ▶, ENTER åbner indstillingerne
    if(L.k==='item'){const os=L.ref.osub||{};return [...(L.ref[3]||[]).map(s=>({k:'sub',n:s[0],p:s[1],ref:s})),...(L.ref[2]||[]).map(o=>os[o]?{k:'osub',n:o,p:os[o][1],ref:os[o]}:{k:'opt',n:o,p:L.p})]}
    if(L.k==='sub')return (L.ref[2]||[]).map(o=>({k:'opt',n:o,p:L.p}));if(L.k==='osub')return (L.ref[2]||[]).map(o=>({k:'row',n:o,p:L.p}));return []};
  const isOpt=x=>x&&(x.k==='opt'||x.k==='osub'||x.k==='row');  // row: en række i et valgs eget undervindue
  const steps=()=>{const s=['Press the <MENU> button on the remote control (or on the projector) to open the on-screen menu.'],shown=[];
    path.forEach((x,i)=>{const nx=path[i+1];
      if(x.k==='opt')s.push(`Use ◀ ▶ to choose [${x.n}].`);
      else if(x.k==='row')s.push(`Use ▲ ▼ to select [${x.n}] and adjust it with ◀ ▶.`);
      else if(x.k==='osub')s.push(`Use ◀ ▶ to choose [${x.n}]${nx?' and press <ENTER>':''}.`);
      else{// ENTER åbner næste niveau; et valg skiftes direkte med ◀ ▶
        const enter=nx?!isOpt(nx):x.k==='menu'||(x.ref[3]||[]).length>0;
        s.push(`Use ▲ ▼ to select [${x.n}]${enter?' and press <ENTER>':''}.`)}
      const p=(x.pw||[]).filter(v=>!shown.includes(v));shown.push(...p);// samme kode vises kun én gang
      if(p.length)s.push(`If the projector asks for a password, enter it (factory default: ${p.join(' / ')}).`)});
    if(path.length)s.push('Press <MENU> to go back one level – press it repeatedly to close the menu.');return s};
  const title=()=>{if(!dirty){const L=path.filter(x=>!isOpt(x)).pop(),o=L?path.slice(path.indexOf(L)+1).map(x=>x.n).join(' › '):'';
      auto=L?(o?`How to set ${L.n} to ${o}`:`How to find ${L.n}`):'';ti.value=auto}return ti.value.trim()||'Projector menu guide'};
  function draw(){const ch=choices(),L=last();
    $$('.mhgpath').innerHTML=`<span class="mhgcr">MENU</span>${path.map(x=>`<span class="mhgsep">›</span><span class="mhgcr${isOpt(x)?' opt':''}">${esc(x.n)}</span>`).join('')}${path.length?'<button type="button" class="chip mhgback">↶ Undo</button><button type="button" class="chip mhgclr">Start over</button>':''}`;
    $$('.mhgpick').innerHTML=ch.length?`<div class="mhgh">${L?(L.k==='item'&&(L.ref[3]||[]).length&&(L.ref[2]||[]).length?'Choose a sub-menu or a setting':L.k==='item'&&!(L.ref[3]||[]).length||L.k==='sub'||L.k==='osub'?'Choose the setting (optional)':'Choose the next step'):'Choose a menu'}</div>${ch.map((c,i)=>`<button type="button" class="mhgc${isOpt(c)?' opt':''}" data-i="${i}"${c.k==='osub'&&(c.ref[2]||[]).length?' title="This setting has its own settings – press ENTER to open them"':''}>${esc(c.n)}${c.k==='osub'&&(c.ref[2]||[]).length?' ›':''}${c.pw&&c.pw.length?' <small>🔒</small>':''}</button>`).join('')}`:`<div class="mhgh">Guide complete – copy it below.</div>`;
    $$('.mhgpick').querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click',()=>{path.push(ch[+b.dataset.i]);draw()}));
    const bk=$$('.mhgback');if(bk)bk.addEventListener('click',()=>{path.pop();draw()});
    const cl=$$('.mhgclr');if(cl)cl.addEventListener('click',()=>{path=[];dirty=false;draw()});
    title();prev()}
  let cv=null;
  function prev(){cv=mhCanvas({title:title(),model,path:path.map(x=>x.n),steps:steps(),note:no.value.trim(),page:(path.filter(x=>x.k!=='opt').pop()||{}).p});
    $$('.mhgprev').innerHTML='';const im=new Image();im.src=cv.toDataURL('image/png');im.alt='Preview of the guide';$$('.mhgprev').appendChild(im)}
  const say=t=>{msg.textContent=t;clearTimeout(say.t);say.t=setTimeout(()=>msg.textContent='',5000)};
  const plain=()=>[title(),`Projector: ${model}`,`Menu path: MENU › ${path.map(x=>x.n).join(' › ')}`,'',...steps().map((s,i)=>`${i+1}. ${s}`),...(no.value.trim()?['',no.value.trim()]:[]),'',`Reference: Panasonic operating instructions${(path.filter(x=>x.k!=='opt').pop()||{}).p?', page '+path.filter(x=>x.k!=='opt').pop().p:''}`].join('\n');
  const html=()=>`<div style="font-family:Arial,sans-serif;font-size:14px"><b style="font-size:16px">${esc(title())}</b><br>Projector: ${esc(model)}<br>Menu path: <b>MENU › ${path.map(x=>esc(x.n)).join(' › ')}</b><ol>${steps().map(s=>`<li>${esc(s).replace(/\[([^\]]+)\]/g,'<b>[$1]</b>')}</li>`).join('')}</ol>${no.value.trim()?`<p>${esc(no.value.trim())}</p>`:''}</div>`;
  const blob=()=>new Promise(r=>cv.toBlob(r,'image/png'));
  $$('.mhgimg').addEventListener('click',async()=>{if(!path.length)return say('Choose at least one menu first.');
    try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob()})]);say('Image copied – paste it into your e-mail (Ctrl+V / ⌘V).');TRK('Guided help kopi',{type:'billede'})}
    catch(e){say('This browser does not allow copying images here – use «Copy text» or «Save PNG».')}});
  $$('.mhgtxt').addEventListener('click',async()=>{if(!path.length)return say('Choose at least one menu first.');
    try{await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html()],{type:'text/html'}),'text/plain':new Blob([plain()],{type:'text/plain'})})]);say('Text copied – paste it into your e-mail.')}
    catch(e){try{await navigator.clipboard.writeText(plain());say('Text copied – paste it into your e-mail.')}catch(e2){say('Copying is blocked in this browser.')}}
    TRK('Guided help kopi',{type:'tekst'})});
  $$('.mhgpng').addEventListener('click',async()=>{if(!path.length)return say('Choose at least one menu first.');
    const a=document.createElement('a');a.href=URL.createObjectURL(await blob());a.download=title().replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')+'.png';document.body.appendChild(a);a.click();a.remove()});
  draw();return {draw}}

// selve billedet: lys baggrund (passer i en mail), nummererede trin, [MENUNAVNE] fremhævet
function mhCanvas(o){
  const W=900,P=40,K=2,F='Manrope,Segoe UI,Arial,sans-serif',FM='JetBrains Mono,Consolas,monospace',AC='#0E8FB0',INK='#1C2229',MU='#5B6672';
  const c=document.createElement('canvas'),x=c.getContext('2d');
  // tekst med [FREMHÆVNINGER] og ombrydning – returnerer linjer af tokens
  const toks=s=>s.split(/(\[[^\]]+\]|<[A-Z]+>)/).filter(Boolean).flatMap(p=>/^[\[<]/.test(p)?[{t:p,b:1}]:p.split(/(\s+)/).filter(Boolean).map(t=>({t,b:0})));
  const fnt=(b,sz)=>b?`700 ${sz-1}px ${FM}`:`500 ${sz}px ${F}`;
  const wrap=(s,w,sz)=>{const L=[[]];let cx=0;for(const k of toks(s)){x.font=fnt(k.b,sz);const tw=x.measureText(k.t).width;
      if(cx+tw>w&&cx>0&&!/^\s+$/.test(k.t)){L.push([]);cx=0}if(!L[L.length-1].length&&/^\s+$/.test(k.t))continue;L[L.length-1].push({...k,w:tw});cx+=tw}return L};
  const plainWrap=(s,w,font)=>{x.font=font;const out=[];let l='';for(const wd of s.split(/\s+/)){const t=l?l+' '+wd:wd;if(x.measureText(t).width>w&&l){out.push(l);l=wd}else l=t}if(l)out.push(l);return out};
  // mål højden først
  const SZ=17,LH=26,tw=W-2*P-50;
  const st=o.steps.map(s=>wrap(s,tw,SZ));
  const tl=plainWrap(o.title,W-2*P,`800 26px ${F}`),nl=o.note?plainWrap(o.note,W-2*P-24,`500 15px ${F}`):[];
  const pathTxt='MENU › '+o.path.join(' › '),pl=plainWrap(pathTxt,W-2*P-24,`700 14px ${FM}`);
  let H=P+8+tl.length*34+30+pl.length*22+30;H+=st.reduce((a,l)=>a+Math.max(l.length*LH,34)+14,0);if(nl.length)H+=nl.length*22+34;H+=60;
  c.width=W*K;c.height=H*K;x.scale(K,K);
  x.fillStyle='#FFFFFF';x.fillRect(0,0,W,H);x.fillStyle=AC;x.fillRect(0,0,W,6);
  let y=P+8;x.textBaseline='top';
  x.fillStyle=INK;x.font=`800 26px ${F}`;for(const l of tl){x.fillText(l,P,y);y+=34}
  x.fillStyle=MU;x.font=`600 14px ${F}`;x.fillText('Projector: '+o.model,P,y+2);y+=30;
  // menustien i en boks
  x.fillStyle='#EEF6F9';const ph=pl.length*22+14;x.beginPath();x.roundRect(P,y,W-2*P,ph,8);x.fill();
  x.fillStyle=AC;x.font=`700 14px ${FM}`;pl.forEach((l,i)=>x.fillText(l,P+12,y+8+i*22));y+=ph+20;
  st.forEach((L,i)=>{const h=Math.max(L.length*LH,34);
    x.fillStyle=AC;x.beginPath();x.arc(P+16,y+15,15,0,7);x.fill();x.fillStyle='#fff';x.font=`800 15px ${F}`;x.textAlign='center';x.fillText(String(i+1),P+16,y+6);x.textAlign='left';
    L.forEach((ln,j)=>{let cx=P+50;for(const k of ln){x.font=fnt(k.b,SZ);x.fillStyle=k.b?INK:'#2E3742';
        if(k.b){x.fillStyle='#E6EDF1';x.beginPath();x.roundRect(cx-2,y+4+j*LH-3,k.w+4,LH-2,4);x.fill();x.fillStyle=INK}
        x.fillText(k.t,cx,y+5+j*LH);cx+=k.w}});
    y+=h+14});
  if(nl.length){y+=6;x.fillStyle='#FFF7E6';x.beginPath();x.roundRect(P,y,W-2*P,nl.length*22+16,8);x.fill();x.fillStyle=INK;x.font=`500 15px ${F}`;nl.forEach((l,i)=>x.fillText(l,P+12,y+9+i*22));y+=nl.length*22+28}
  x.strokeStyle='#E1E6EA';x.beginPath();x.moveTo(P,H-44);x.lineTo(W-P,H-44);x.stroke();
  x.fillStyle=MU;x.font=`500 12px ${F}`;x.fillText(`Reference: Panasonic operating instructions${o.page?', page '+o.page:''} · Menu names may vary with firmware.`,P,H-32);
  x.textAlign='right';x.fillText('Made with Throw Planner · throwplanner.com',W-P,H-32);x.textAlign='left';
  return c}
