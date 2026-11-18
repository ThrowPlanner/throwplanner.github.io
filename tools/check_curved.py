#!/usr/bin/env python3
"""Buet lærred (Panasonic [CURVED CORRECTION]): har hver aktuel model/optik tal fra manualens «projection range»-tabel?

Tabellen i Throw Planner står i 26-curved.js (src/js/ når funktionen er i appen, ellers test/curved-screen/) som linjer
put('ET-KODE ...',[kun keystone V,H · keystone+curved V,H, R2/L2, R3/L3 · kun curved R2/L2, R3/L3]).
For hver model/optik uden tal (fx en ny model eller optik i Panasonics Throw Distance Calculator) hentes projektorens
manual (MAN_PJ i src/js/02-state.js), og rækken fra tabellen «[GEOMETRY]/[SCREEN ADJUSTMENT] projection range»
skrives i rapporten, så tallene kan sættes ind efter tjek. Kun tal gemmes – ingen tekst fra manualerne.

Kør alene:  pip install pypdf  &&  python tools/check_curved.py
Bruges også af tools/check_tdc.py (det ugentlige TDC-tjek i GitHub Actions).
"""
import json, os, re, sys, tempfile, urllib.request, logging
logging.disable(logging.WARNING)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAN_BASE = 'https://eu.connect.panasonic.com/sites/default/files/media/'
# kontrolleret mod manualerne 2026-11-18: står ikke i tabellen (vises som «ikke oplyst» i appen)
NOT_IN_MANUAL = {'ET-C1U090', 'ET-C1T900', 'ET-D3QW200'}

def et_codes(n): return [x.upper() for x in re.findall(r'ET-[A-Z0-9]+', str(n), re.I)]
def model_key(name): return name.split(' (')[0].split('/')[0].upper()

def curved_keys():
    """Nøgler (ET-koder og modelnavne) med curved-tal i 26-curved.js. None, hvis filen ikke findes."""
    for p in (os.path.join(ROOT, 'src', 'js', '26-curved.js'), os.path.join(ROOT, 'test', 'curved-screen', '26-curved.js')):
        if os.path.exists(p):
            src = open(p, encoding='utf-8').read()
            return {k for ks in re.findall(r"put\('([^']+)'", src) for k in ks.split()}, os.path.relpath(p, ROOT).replace('\\', '/')
    return None, None

def manuals():
    src = open(os.path.join(ROOT, 'src', 'js', '02-state.js'), encoding='utf-8').read()
    m = json.loads(re.search(r"const MAN_PJ=(\{.*?\});", src).group(1).replace("'", '"'))
    return {k.upper(): (v if v.startswith('http') else MAN_BASE + v) for k, v in m.items()}

_pdf = {}
def table_text(url):
    """Teksten fra siderne med «projection range»-tabellen (cache pr. kørsel)."""
    if url in _pdf: return _pdf[url]
    import pypdf
    fn = os.path.join(tempfile.gettempdir(), 'throwplanner-curved-' + re.sub(r'\W', '_', url)[-80:] + '.pdf')
    if not os.path.exists(fn):
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        open(fn, 'wb').write(urllib.request.urlopen(req, timeout=180).read())
    pages = [p.extract_text() or '' for p in pypdf.PdfReader(fn).pages]
    out = []
    for i, t in enumerate(pages):
        if 'projection range' in t and ('R2/L2' in t or 'R3/L3' in t or (i + 1 < len(pages) and 'R3/L3' in pages[i + 1])):
            out.append(t + '\n' + (pages[i + 1] if i + 1 < len(pages) and 'R3/L3' in pages[i + 1] and 'R3/L3' not in t else ''))
    _pdf[url] = '\n'.join(out)
    return _pdf[url]

NUM = re.compile(r'(?:±\d+(?:\.\d+)?|\+\d+\s*/\s*-\d+|\d+(?:\.\d+)?|―|(?<!\w)-(?!\w))')
def row_for(text, key):
    """Tallene i tabellens række for en ET-kode eller model (8 felter), eller None."""
    lines = [l.strip() for l in text.splitlines()]
    for i, l in enumerate(lines):
        if key in l.upper().replace(' ', ''):
            for cand in [l.split(key, 1)[-1] if key in l else l] + lines[i + 1:i + 5]:
                vals = NUM.findall(re.sub(r'(?:ET|PT)-[A-Z0-9]+|\*\d', ' ', cand, flags=re.I))   # uden andre kode-/modelnavne og fodnoter
                if len(vals) >= 4: return ' '.join(vals)
    # fast optik: tabellen har ofte kun én talrække uden modelnavn
    j = text.rfind('R3/L3')
    if j >= 0 and key.startswith('PT-'):
        for l in text[j:].splitlines()[1:8]:
            vals = NUM.findall(l)
            if len(vals) >= 4 and '±' in l: return ' '.join(vals)
    return None

def check(cat, extra=()):
    """Rapportlinjer for modeller/optikker uden curved-tal. extra: [(modelnavn, optiknavn)] fx nye optikker fra TDC."""
    keys, where = curved_keys()
    if keys is None: return []
    man = manuals(); rows = []; todo = []
    for m in cat['models']:
        for l in m['L']: todo.append((m['m'], l[0]))
    todo += list(extra)
    seen = set()
    for mname, lname in todo:
        mk = model_key(mname); codes = et_codes(lname)
        if any(c in keys or c in NOT_IN_MANUAL for c in codes) or (not codes and mk in keys): continue
        key = codes[0] if codes else mk
        if key in seen: continue
        seen.add(key)
        url = man.get(mk)
        if not url: rows.append(f'**{mk} · {lname}**: ingen curved-tal og intet manual-link i MAN_PJ – tjek manualen i hånden'); continue
        try:
            r = row_for(table_text(url), key)
        except Exception as e:
            rows.append(f'**{mk} · {lname}**: ingen curved-tal – manualen kunne ikke læses ({type(e).__name__})'); continue
        rows.append(f'**{mk} · {lname}**: ingen curved-tal i `{where}` – manualens række: `{r}`' if r
                    else f'**{mk} · {lname}**: ingen curved-tal, og optikken står ikke i manualens tabel – tilføj til NOT_IN_MANUAL efter tjek')
    return rows

if __name__ == '__main__':
    cat = json.load(open(os.path.join(ROOT, 'data', 'catalog.json'), encoding='utf-8'))
    out = check(cat, [tuple(a.split('|', 1)) for a in sys.argv[1:]])
    print('\n'.join(out) if out else 'OK  alle aktuelle modeller og optikker har curved-tal (eller er kontrolleret uden)')
