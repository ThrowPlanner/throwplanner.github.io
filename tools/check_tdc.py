#!/usr/bin/env python3
"""Tjek at Throw Planner stadig stemmer med Panasonics Throw Distance Calculator (TDC).

Sammenligner hver model og optik i data/catalog.json (aktuelle) og data/catalog-eol.json (udgåede) med TDC:
throw-formler pr. format, lens shift-polygon, optisk akse, officiel throw ratio (PANTR i src/js/04-ui.js),
lumen, kontrast, opløsning og formater – og melder nye eller forsvundne modeller og optikker.

Kør:  python tools/check_tdc.py [rapport.md]
Ingen afvigelser → ingen rapport (filen slettes). Afvigelser → Markdown-rapport + exit 0 (workflowen laver et issue).
Rettes med:  python tools/fetch_eol.py  (udgåede) – aktuelle modeller rettes i data/catalog.json efter tjek hos Panasonic.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_eol import ROOT, load, model, official_tr, build_eol, f, num

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tdc-report.md')
STATUS = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(OUT) or '.', 'tdc-status.md')
FIELDS = {'lm': 'lumen', 'lc': 'lumen (center)', 'cr': 'kontrast', 'asp': 'formater', 'res': 'opløsning',
          't': 'teknologi', 'dim': 'kabinetmål (B×H×D mm)', 'img': 'produktbillede'}
LENS = {1: 'fast/zoom (F/Z)', 2: 'throw-formel', 3: 'lens shift', 4: 'optisk akse/offset', 5: 'udragning (mm)',
        6: 'optikbillede', 7: 'type/UST-boks', 8: 'optikmål (B×H×L mm)'}
def fld(l, i): return l[i] if len(l) > i else None

def pantr():
    src = open(os.path.join(ROOT, 'src', 'js', '04-ui.js'), encoding='utf-8').read()
    return json.loads(re.search(r'const PANTR=(\{.*?\});\n', src).group(1))

def short(x): s = json.dumps(x, ensure_ascii=False); return s if len(s) < 90 else s[:87] + '…'

def main():
    D = load(); tdc, vmap, cat = D['tdc'], D['vmap'], D['cat']; PT = pantr()
    rep = {'Aktuelle modeller (data/catalog.json)': [], 'Officielle throw ratios (PANTR)': [], 'Udgåede modeller (data/catalog-eol.json)': [], 'Nye eller forsvundne modeller i TDC': []}
    cur = rep['Aktuelle modeller (data/catalog.json)']; newl = []
    for m in cat['models']:
        nm = m['m'].split(' (')[0]; v = vmap.get(nm)
        if not v or v not in tdc: cur.append(f'**{nm}** findes ikke længere i TDC'); continue
        t = model(m['m'], m['c'], tdc[v], D['ust'])
        for k, lab in FIELDS.items():
            if t[k] != m[k] and t[k]: cur.append(f'**{nm}** {lab}: vi har `{short(m[k])}`, TDC har `{short(t[k])}`')
        ours = {l[0]: l for l in m['L']}; theirs = {l[0]: l for l in t['L'] if l[2] and any(r[0] > 0 for r in l[2])}
        for n in theirs.keys() - ours.keys(): cur.append(f'**{nm}** ny optik i TDC: `{n}`'); newl.append((m['m'], n))
        for n in ours.keys() - theirs.keys(): cur.append(f'**{nm}** optik findes ikke længere i TDC: `{n}`')
        raw = {l['LensName']: l for l in tdc[v]['lens']}
        for n in ours.keys() & theirs.keys():
            # UST-boks: TDC's PjBody er en generisk kasse (±250 × −120…80) – kun L0 og afstanden L5−L0 er rigtige tal fra TDC.
            # Husmålene i kataloget er vores egne (fra manualen), så kun type, L-afstand og L0 sammenlignes (±1 mm afrunding).
            a, b = fld(ours[n], 7), fld(theirs[n], 7)
            if a and b and a[0] == b[0] == 'u' and len(a) > 1:
                r = raw[n]; tl = [num(round(-(f(r['L5']) - f(r['L0'])), 1)), num(f(r['L0']))]
                if any(abs(x - y) > 1 for x, y in zip(a[1][4:6], tl)): cur.append(f'**{nm} · {n}** UST L5−L0 / L0: vi har `{short(a[1][4:6])}`, TDC har `{short(tl)}`')
            for i, lab in LENS.items():
                if i == 7 and a and b and a[0] == b[0] == 'u': continue
                if fld(ours[n], i) != fld(theirs[n], i): cur.append(f'**{nm} · {n}** {lab}: vi har `{short(fld(ours[n], i))}`, TDC har `{short(fld(theirs[n], i))}`')
        # officiel throw ratio-tekst
        pt = PT.get(nm.split('/')[0], {})
        for l in tdc[v]['lens']:
            if l['LensName'] not in pt: continue
            o = official_tr(l['ThrowRatio'], nm, pt[l['LensName']][2])
            if o and pt[l['LensName']][:2] != o[:2]:
                rep['Officielle throw ratios (PANTR)'].append(f'**{nm} · {l["LensName"]}**: vi har `{short(pt[l["LensName"]])}`, TDC har `{short(o)}`')
    # udgåede: byg igen og sammenlign med filen
    fe = os.path.join(ROOT, 'data', 'catalog-eol.json')
    eol = {m['m']: m for m in json.load(open(fe, encoding='utf-8'))['models']} if os.path.exists(fe) else None
    new = {m['m']: m for m in build_eol(D, log=lambda s: None)} if eol is not None else {}
    if eol is None: eol = {}  # uden EOL-kataloget tjekkes kun de aktuelle modeller
    for n in new.keys() - eol.keys(): rep['Nye eller forsvundne modeller i TDC'].append(f'Ny udgået/ikke-EU model: **{n}** ({new[n]["t"]})')
    for n in eol.keys() - new.keys(): rep['Nye eller forsvundne modeller i TDC'].append(f'Udgået model er væk fra TDC: **{n}**')
    for n in eol.keys() & new.keys():
        if eol[n] != new[n]:
            diff = [k for k in new[n] if new[n].get(k) != eol[n].get(k)]
            rep['Udgåede modeller (data/catalog-eol.json)'].append(f'**{n}** ændret: {", ".join(diff)}')
    # helt nye modeller i TDC, som hverken er aktuelle eller udgåede, fanges af build_eol (kommer som «ny udgået/ikke-EU»)
    # flyrammer og loftbeslag (Panasonics «Optional Accessories»)
    fm = os.path.join(ROOT, 'data', 'mounts.json')
    if os.path.exists(fm):
        from fetch_mounts import fetch as fetch_mounts
        ours = {x['id']: x for x in json.load(open(fm, encoding='utf-8'))}; theirs = {x['id']: x for x in fetch_mounts()}
        mt = rep.setdefault('Flyrammer og loftbeslag (data/mounts.json)', [])
        for n in theirs.keys() - ours.keys(): mt.append(f'Nyt beslag hos Panasonic: **{n}** ({theirs[n]["type"]})')
        for n in ours.keys() - theirs.keys(): mt.append(f'Beslag er væk fra Panasonics liste: **{n}**')
        for n in ours.keys() & theirs.keys():
            a, b = set(ours[n]['models']), set(theirs[n]['models'])
            if a != b: mt.append(f'**{n}** projektorer: +{", ".join(sorted(b - a)) or "–"} / −{", ".join(sorted(a - b)) or "–"}')
            elif ours[n] != theirs[n]: mt.append(f'**{n}** type/note/status ændret')
    # buet lærred: nye modeller/optikker uden tal fra manualens curved correction-tabel (tools/check_curved.py)
    try:
        from check_curved import check as check_curved
        cv = check_curved(cat, newl)
    except Exception as e:
        cv = [f'Curved-tjekket kunne ikke køre: {type(e).__name__}: {e}']
    if cv: rep['Buet lærred – curved correction-tabellen i manualen'] = cv
    n = sum(len(v) for v in rep.values())
    # ugentlig status – skrives altid (workflowen lægger den som kommentar på issuet «TDC ugentlig status»)
    nl = sum(len(m['L']) for m in cat['models'])
    nb = len(json.load(open(fm, encoding='utf-8'))) if os.path.exists(fm) else 0
    nyt = [r for r in rep['Nye eller forsvundne modeller i TDC'] if r.startswith('Ny')] + [r for r in cur if 'ny optik' in r]
    væk = [r for r in rep['Nye eller forsvundne modeller i TDC'] if 'væk' in r] + [r for r in cur if 'findes ikke længere' in r]
    st = [f'**{"✅ Alt stemmer med Panasonic" if not n else f"⚠️ {n} afvigelse(r) fundet"}**', '',
          f'Tjekket: {len(cat["models"])} aktuelle modeller · {nl} optikker · {len(eol)} udgåede/ikke-EU modeller · {nb} beslag.', '',
          '| Område | Status |', '|---|---|',
          *[f'| {h} | {"OK" if not rows else f"{len(rows)} afvigelse(r)"} |' for h, rows in rep.items()],
          f'| Nye modeller/optikker | {len(nyt) or "ingen"} |', f'| Udgåede/forsvundne | {len(væk) or "ingen"} |', '']
    if n: st += ['Detaljer står i det åbne issue med mærket `tdc-change`.']
    open(STATUS, 'w', encoding='utf-8', newline='\n').write('\n'.join(st) + '\n')
    if not n:
        if os.path.exists(OUT): os.remove(OUT)
        print('OK  ingen ændringer i forhold til Panasonics Throw Distance Calculator'); return
    md = [f'Ugentligt tjek fandt **{n} ændring(er)** i forhold til [Panasonics Throw Distance Calculator](https://docs.connect.panasonic.com/projector/calculator/tdc/).', '']
    for h, rows in rep.items():
        if rows: md += [f'### {h}', *[f'- {r}' for r in rows[:150]], *(['- …'] if len(rows) > 150 else []), '']
    md += ['Rettes med `python tools/fetch_eol.py` (udgåede) og `python tools/fetch_mounts.py` (beslag). Aktuelle modeller rettes i `data/catalog.json` efter tjek hos Panasonic. Curved-tal sættes ind i `26-curved.js` (put-linjerne) efter tjek i manualen.']
    open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(md) + '\n')
    print(f'ÆNDRINGER: {n} – se {OUT}')

if __name__ == '__main__':
    main()
