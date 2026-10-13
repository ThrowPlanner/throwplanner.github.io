fetch('img.json').then(r=>r.json()).then(j=>{IMGS=j;render()}).catch(()=>{IMGS={};render()});
