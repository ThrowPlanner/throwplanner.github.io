// boks 03: Menu-hjælp – søg i projektorens egen skærmmenu (menutræ og sidetal fra Panasonics manualer, data/menus.json)
const MENUS=/*__MENUS__*/;
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
    <p class="mhnote">Menu names and page numbers from Panasonic's operating instructions. Names may vary with the firmware version.</p>
    <div class="pdfbtns"><a class="manbtn mhman" target="_blank" rel="noopener noreferrer">Manual</a><button type="button" class="btn" value="no">Close</button></div>`;
  const q=d.querySelector('.mhq'),sel=d.querySelector('.mhmod'),out=d.querySelector('.mhres'),mb=d.querySelector('.mhman');
  const url=()=>{const p=MAN_PJ[MENUS[sel.value].mo[0]];return /^https?:/.test(p)?p:MAN_B+p};
  const pg=n=>`<a class="mhpg" href="${url()}#page=${n}" target="_blank" rel="noopener noreferrer" title="Open the manual at page ${n}">p. ${n}</a>`;
  const desc=k=>{const h=MH[k];return h?h.split('|')[1]:''};
  const ops=o=>o&&o.length?`<span class="mhops">${o.map(x=>`<i>${esc(x)}</i>`).join('')}</span>`:'';
  const pw=a=>a&&a.length?`<span class="mhpw">Default password: ${a.map(x=>`<code>${esc(x)}</code>`).join(' · ')}</span>`:'';
  const path=p=>p.length?`<span class="mhpath">${p.map(esc).join(' › ')} › </span>`:'';
  // et menupunkt: [navn, side, valg, undermenuer[[navn, side, valg]], adgangskoder] – med undermenuer kan det foldes ud
  const item=(it,p,open)=>{const head=`<div>${path(p)}<b>${esc(it[0])}</b>${desc(it[0])?`<span class="mhd">${esc(desc(it[0]))}</span>`:''}${ops(it[2])}${pw(it[4])}</div>${pg(it[1])}`;
    const subs=it[3]||[];
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
  q.addEventListener('input',draw);sel.addEventListener('change',draw);
  d.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{q.value=b.dataset.q;draw();q.focus()}));
  d.querySelector('[value="no"]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>d.remove());
  document.body.appendChild(d);draw();d.showModal();q.focus();TRK('Menu-hjælp',{model:cur})}
$('mhBtn').addEventListener('click',menuHelp);
