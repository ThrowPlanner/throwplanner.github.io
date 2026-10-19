#!/usr/bin/env python3
"""Byg Throw Planner.

Samler src/ (page.html + styles.css + js/*.js i navneorden), data/ og i18n/ til:
  dist/site/      – hjemmesiden (index.html, sw.js, manifest, ikoner, pdfexport.js) – det GitHub Pages viser
  dist/artifact.html – én-fils-udgaven til Claude-artifactet (henter billeder fra img.json)

Kør:  python tools/build.py          (kun Python 3 – ingen andre programmer)
"""
import hashlib, json, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def p(*a): return os.path.join(ROOT, *a)
def read(*a):
    with open(p(*a), encoding='utf-8') as f: return f.read()

def translations():
    """i18n/translations.txt: én linje pr. tekst «dansk|engelsk|japansk». '=' foran = kun hele tekster."""
    rows = []
    for line in read('i18n', 'translations.txt').strip('\n').split('\n'):
        if not line.strip(): continue
        parts = line.split('|')
        if len(parts) != 3: sys.exit(f'translations.txt: forkert linje (skal have 3 dele adskilt af |): {line}')
        k, en, ja = parts
        exact = k.startswith('=')
        if exact: k = k[1:]
        rows.append([k, en, ja, 1 if exact else 0])
    return json.dumps(rows, ensure_ascii=False)

def page():
    js_dir = p('src', 'js')
    js = ''.join(read('src', 'js', f) for f in sorted(os.listdir(js_dir)) if f.endswith('.js'))
    s = read('src', 'page.html')
    assert s.count('/*@styles*/\n') == 1 and s.count('/*@scripts*/\n') == 1
    s = s.replace('/*@styles*/\n', read('src', 'styles.css')).replace('/*@scripts*/\n', js)
    s = s.replace('/*__CATALOG__*/', read('data', 'catalog.json')).replace('/*__I18N__*/', translations())
    return s

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Projector throw distance, lens shift, edge blend and contrast planner based on Panasonic data.">
<meta name="theme-color" content="#252A31">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Throw Planner">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-180.png">
<script defer src="https://cloud.umami.is/script.js" data-website-id="beefa004-7993-4963-ba1f-2f1bdbdb1a51" data-domains="throwplanner.com"></script>
'''
BOOT = "fetch('img.json').then(r=>r.json()).then(j=>{IMGS=j;render()}).catch(()=>{IMGS={};render()});"

def main():
    s = page()
    dist = p('dist'); site = p('dist', 'site')
    shutil.rmtree(dist, ignore_errors=True); os.makedirs(site)
    with open(p('dist', 'artifact.html'), 'w', encoding='utf-8', newline='\n') as f: f.write(s)
    # hjemmesiden: billeder indlejret, service worker registreres, fuldt HTML-dokument
    assert BOOT in s
    w = s.replace(BOOT, 'IMGS=' + read('data', 'images.json') + ";render();\nif('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});")
    j = w.index('</style>') + len('</style>')
    index = HEAD + w[:j] + '\n</head>\n<body>\n' + w[j:] + '\n</body>\n</html>\n'
    with open(os.path.join(site, 'index.html'), 'w', encoding='utf-8', newline='\n') as f: f.write(index)
    for fn in os.listdir(p('web')):
        if fn != 'sw.js': shutil.copy(p('web', fn), os.path.join(site, fn))
    # cache-navnet skifter automatisk, når index.html ændrer sig – så brugerne altid får den nye version
    ver = hashlib.sha1(index.encode('utf-8')).hexdigest()[:10]
    with open(os.path.join(site, 'sw.js'), 'w', encoding='utf-8', newline='\n') as f: f.write(read('web', 'sw.js').replace('__VERSION__', ver))
    print(f'OK  dist/site/index.html {len(index.encode()) // 1024} kB · dist/artifact.html · sw-version {ver}')

if __name__ == '__main__':
    main()
