// Tema «Warping (TEST)» (kun i Avanceret): siden warp.html vises i en ramme, resten af appen skjules med CSS (data-venue="warp").
// warp.html (src/warp.html) er selvstændig med egen kode og stil – her styres kun rammen: indlæsning første gang, lys/mørk og højde.
(function(){const box=$('warpBox'),fr=$('warpFrame');if(!box||!fr)return;
  const theme=()=>{try{if(fr.contentWindow)fr.contentWindow.postMessage({tp:'theme',mode:document.documentElement.classList.contains('isdark')?'dark':'light'},'*')}catch(e){}};
  const sync=()=>{const on=S.venue==='warp';box.hidden=!on;if(on&&!fr.getAttribute('src'))fr.src='warp.html';theme()};
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-venue','data-theme','class']});
  addEventListener('message',e=>{if(e.source!==fr.contentWindow||!e.data)return;
    if(e.data.tp==='warpH')fr.style.height=Math.max(600,Math.ceil(e.data.h)+4)+'px';if(e.data.tp==='warpReady')theme()});
  sync()})();
