#!/usr/bin/env python3
"""Hent udgåede (EOL) Panasonic-projektorer fra Panasonics Throw Distance Calculator (TDC) til data/catalog-eol.json.

Kilde: https://docs.connect.panasonic.com/projector/calculator/tdc/ (js/include/ModelData.js + ModelDataDef.js).
Med:   kategorien «Previous» (7) + modeller som Panasonics Product Finder markerer «Discontinued» (DISC herunder),
       kun modeller med udskiftelig optik (ET-…) – formålet er at finde nye projektorer til en gammel optik.
Throw-tallene konverteres præcis som i data/catalog.json; konverteringen tjekkes mod de aktuelle modeller først.

Kør:  python tools/fetch_eol.py
"""
import json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TDC = 'https://docs.connect.panasonic.com/projector/calculator/tdc/js/include/'
# Product Finder (docs.connect.panasonic.com/projector/products/finder/) – «Discontinued. Limited Stock.»
DISC = {'PT-RQ13K', 'PT-RZ12K', 'PT-RS11K', 'PT-RCQ10', 'PT-RCQ80', 'PT-RZ120', 'PT-RZ990', 'PT-RZ890', 'PT-EZ590', 'PT-EW550',
        'PT-EX620', 'PT-EX520', 'PT-FZ570', 'PT-FX500', 'PT-VZ585N/VZ580', 'PT-VX615N/VX610'}

def get(fn):
    req = urllib.request.Request(TDC + fn, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=120) as r: return r.read().decode('utf-8')

# --- TDC-filerne er JavaScript-objekter: lav dem om til JSON ---
def js2json(s):
    out = []; i = 0; n = len(s); last = ''
    while i < n:
        c = s[i]
        if c in '"\'':
            j = i + 1
            while s[j] != c: j += 2 if s[j] == '\\' else 1
            out.append(s[i:j + 1] if c == '"' else json.dumps(s[i + 1:j].replace("\\'", "'"))); i = j + 1; last = '"'; continue
        m = re.match(r'[A-Za-z_$][\w$]*(?=\s*:)', s[i:i + 80])
        if m and last in ('{', ','):
            out.append('"' + m.group(0) + '"'); i += len(m.group(0)); last = 'k'; continue
        out.append(c); i += 1
        if not c.isspace(): last = c
    return json.loads(''.join(out))

def balanced(s, i):
    depth = 0; j = i
    while True:
        c = s[j]
        if c in '"\'':
            j += 1
            while s[j] != c: j += 2 if s[j] == '\\' else 1
        elif c in '{[': depth += 1
        elif c in '}]':
            depth -= 1
            if depth == 0: return j + 1
        j += 1

def parse(src):
    res = {}
    for m in re.finditer(r'([A-Za-z0-9_]+)=function\(\)\{return function\(\)\{this\.projectorTecnicalData=', src):
        a = m.end(); b = balanced(src, a)
        k = src.index('this.lensData=', b) + len('this.lensData='); e = balanced(src, k)
        res[m.group(1)] = {'tech': js2json(src[a:b]), 'lens': js2json(src[k:e])}
    return res

# --- konvertering til katalogformatet ---
f = float
def num(x): x = round(float(x), 6); return int(x) if x.is_integer() else x

def row(a, fixed):
    if fixed and f(a['FixCaluclateValue1']):
        s = -1 if a['FixCaluclateValue3'] == 'minus' else 1
        return [num(a['FixCaluclateValue1']), num(s * f(a['FixCaluclateValue2'])), num(a['FixCaluclateValue1']), num(s * f(a['FixCaluclateValue2'])), num(a['FixMinScreenSize']), num(a['FixMaxScreenSize'])]
    s1 = -1 if a['MinCaluclateValue3'] == 'minus' else 1; s2 = -1 if a['MaxCaluclateValue3'] == 'minus' else 1
    return [num(a['MinCaluclateValue1']), num(s1 * f(a['MinCaluclateValue2'])), num(a['MaxCaluclateValue1']), num(s2 * f(a['MaxCaluclateValue2'])), num(a['MinMinScreenSize']), num(a['MinMaxScreenSize'])]

def lens(l, ust):
    fixed = 'Fixed' in l['LensType']; img = l['ProjectionDistanceImage']
    kind = 'u' if 'ust' in img else 'l' if 'l_shape' in img else 'n'; k = [kind]
    if kind == 'u':
        xs = [f(p['x']) for p in l['PjBody']]; ys = [f(p['y']) for p in l['PjBody']]
        k.append([num(min(xs)), num(max(xs)), num(min(ys)), num(max(ys)), num(round(-(f(l['L5']) - f(l['L0'])), 1)), num(f(l['L0']))])
        if ust.get(l['LensName']): k = min(ust[l['LensName']], key=lambda u: abs(u[1][4] - k[1][4]))  # spejl-optikkens husmål som i kataloget
    la = l['LightAxisRatio']; la = f(la) if re.fullmatch(r'-?[\d.]+', la or '') else 0
    poly = [[num(f(p['x'])), num(f(p['y']))] for p in l['LensShiftVp']]
    if all(p == [0, 0] for p in poly): poly = []
    return [l['LensName'], 'F' if fixed else 'Z', [row(a, fixed) for a in l['AspectRatio']], poly, num(f(l['LensShiftOffsetV']) or la),
            num(f(l['Protrudes'])) if l['Protrudes'] else 0, l['ProductImage'] or 'NONE', k]

def official_tr(s, name=None, asp=None):
    """Panasonics ThrowRatio-tekst («0.548–0.650:1 for PT-… (17:9 aspect ratio)<br>…») → [min, max|None, format].
    Teksten kan dække flere projektorer – linjerne for `name` vælges; derefter formatet `asp`, ellers 16:10, ellers den første."""
    rows = []
    for part in re.split(r'<br\s*/?>', s or ''):
        m = re.search(r'([\d.]+)\s*(?:[–-]\s*([\d.]+))?\s*:\s*1(?:.*?\((\d+:\d+)[^)]*aspect)?', part)
        if m: rows.append([m.group(1), m.group(2), m.group(3), part])
    if name:
        key = name.split('/')[0].replace('PT-', '')
        mine = [r for r in rows if re.search(r'PT-[\w/]*\b' + re.escape(key) + r'\b', r[3]) or key in r[3]]
        if mine: rows = mine
    pick = next((r for r in rows if asp and r[2] == asp), None) or next((r for r in rows if r[2] == '16:10'), rows[0] if rows else None)
    return pick[:3] if pick else None

def ints(s): return [int(x.replace(',', '')) for x in re.findall(r'\d[\d,]*', s)]
def model(name, c, d, ust):
    t = d['tech']; br = [int(x) for x in re.findall(r'\d+', t['Brightness'])] + [0]
    rs = [(int(a.replace(',', '')), int(b.replace(',', ''))) for a, b in re.findall(r'(\d[\d,]{2,6})\s*[x×]\s*(\d[\d,]{2,6})', t['Resolution1'] + ' ' + t['Resolution2'] + ' ' + t.get('Panel', ''))]
    res = max(rs, key=lambda r: r[0] * r[1]) if rs else None
    return {'m': name, 'c': c, 't': t['Based'], 'lm': br[0], 'lc': br[1], 'cr': (ints(t['ContrastRatio']) or [0])[0],
            'asp': [a['AspectRatioName'] for a in t['AspectRatio']], 'dim': ints(t['Dimensions'])[:3], 'res': list(res) if res else [],
            'L': [lens(l, ust) for l in d['lens']], 'img': t['ProductImage']}

def load():
    """Hent TDC og vores katalog. Returnerer en dict med alt, som main() og tools/check_tdc.py bruger."""
    defs = get('ModelDataDef.js'); tdc = parse(get('ModelData.js'))
    cat = json.load(open(os.path.join(ROOT, 'data', 'catalog.json'), encoding='utf-8'))
    glob = defs[:defs.index('PT-RQ50KJ"')]  # kun de globale modeller (de japanske J-modeller udelades)
    ust = {}
    for m in cat['models']:
        for l in m['L']:
            if l[7][0] == 'u' and l[0] != 'Supplied lens' and l[7] not in ust.setdefault(l[0], []): ust[l[0]].append(l[7])
    return {'tdc': tdc, 'cat': cat, 'ust': ust, 'glob': glob,
            'names': re.findall(r'ProjectorModelName:"([^"]+)",\s*ProjectorCategoryValue:(\d+)', glob),
            'vmap': dict(re.findall(r'"?(PT-[^",:]+|NTN\d+)"?:([a-z0-9_]+)[,}]', defs))}

def build_eol(D, log=print):
    """Alle globale TDC-modeller, som ikke er i det aktuelle EU-katalog → katalogformat med eol-mærke."""
    tdc, ust, vmap = D['tdc'], D['ust'], D['vmap']
    have = {m['m'].split(' (')[0] for m in D['cat']['models']}
    out = []
    for name, c in D['names']:
        if name in have: continue  # alt i TDC, som ikke er i det aktuelle EU-katalog, kommer med
        v = vmap.get(name)
        if not v or v not in tdc: log(f'ingen data {name}'); continue
        mo = model(name, 7, tdc[v], ust)
        mo['L'] = [l for l in mo['L'] if l[2] and any(r[0] > 0 for r in l[2])]
        if not mo['L']: log(f'ingen throw-data {name}'); continue
        mo['tr'] = {l['LensName']: t for l in tdc[v]['lens'] if (t := official_tr(l['ThrowRatio'], name))}  # officielle throw ratios (som PANTR)
        # p = «Previous» i TDC, d = «Discontinued» i Product Finder, x = stadig i TDC, men ikke i det aktuelle EU-sortiment
        mo['eol'] = 'p' if c == '7' else 'd' if name in DISC else 'x'
        out.append(mo)
    return out

def main():
    D = load(); cat, tdc, vmap = D['cat'], D['tdc'], D['vmap']
    # 1) tjek konverteringen mod de aktuelle modeller – throw-tallene skal være identiske
    bad = 0
    for m in cat['models']:
        v = vmap.get(m['m'].split(' (')[0])
        if not v: continue
        ours = {l[0]: l for l in m['L']}
        for l in model(m['m'], m['c'], tdc[v], D['ust'])['L']:
            if l[0] in ours and l[2] != ours[l[0]][2]: print('AFVIGER', m['m'], l[0]); bad += 1
    if bad: sys.exit(f'{bad} afvigelser i throw-tal – stop')
    # 2) udgåede modeller
    out = build_eol(D)
    with open(os.path.join(ROOT, 'data', 'catalog-eol.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({'models': out}, fh, ensure_ascii=False, separators=(',', ':'))
    # kontrol: hver global TDC-model er enten aktuel (catalog.json) eller udgået (catalog-eol.json)
    have = {m['m'].split(' (')[0] for m in cat['models']}
    alln = re.findall(r'ProjectorModelName:"([^"]+)"', D['glob']); got = have | {m['m'] for m in out}
    miss = [n for n in alln if n not in got]
    if miss: print('MANGLER', miss)
    print(f'OK  data/catalog-eol.json  {len(out)} udgåede modeller · {sum(len(m["L"]) for m in out)} optik-kombinationer · {len(alln)} modeller i TDC (globale)')

if __name__ == '__main__':
    main()
