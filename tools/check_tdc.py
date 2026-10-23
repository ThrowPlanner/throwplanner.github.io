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
from fetch_eol import ROOT, load, model, official_tr, build_eol

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tdc-report.md')
FIELDS = {'lm': 'lumen', 'lc': 'lumen (center)', 'cr': 'kontrast', 'asp': 'formater', 'res': 'opløsning'}
LENS = {2: 'throw-formel', 3: 'lens shift', 4: 'optisk akse/offset'}

def pantr():
    src = open(os.path.join(ROOT, 'src', 'js', '04-ui.js'), encoding='utf-8').read()
    return json.loads(re.search(r'const PANTR=(\{.*?\});\n', src).group(1))

def short(x): s = json.dumps(x, ensure_ascii=False); return s if len(s) < 90 else s[:87] + '…'

def main():
    D = load(); tdc, vmap, cat = D['tdc'], D['vmap'], D['cat']; PT = pantr()
    rep = {'Aktuelle modeller (data/catalog.json)': [], 'Officielle throw ratios (PANTR)': [], 'Udgåede modeller (data/catalog-eol.json)': [], 'Nye eller forsvundne modeller i TDC': []}
    cur = rep['Aktuelle modeller (data/catalog.json)']
    for m in cat['models']:
        nm = m['m'].split(' (')[0]; v = vmap.get(nm)
        if not v or v not in tdc: cur.append(f'**{nm}** findes ikke længere i TDC'); continue
        t = model(m['m'], m['c'], tdc[v], D['ust'])
        for k, lab in FIELDS.items():
            if t[k] != m[k] and t[k]: cur.append(f'**{nm}** {lab}: vi har `{short(m[k])}`, TDC har `{short(t[k])}`')
        ours = {l[0]: l for l in m['L']}; theirs = {l[0]: l for l in t['L'] if l[2] and any(r[0] > 0 for r in l[2])}
        for n in theirs.keys() - ours.keys(): cur.append(f'**{nm}** ny optik i TDC: `{n}`')
        for n in ours.keys() - theirs.keys(): cur.append(f'**{nm}** optik findes ikke længere i TDC: `{n}`')
        for n in ours.keys() & theirs.keys():
            for i, lab in LENS.items():
                if ours[n][i] != theirs[n][i]: cur.append(f'**{nm} · {n}** {lab}: vi har `{short(ours[n][i])}`, TDC har `{short(theirs[n][i])}`')
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
    n = sum(len(v) for v in rep.values())
    if not n:
        if os.path.exists(OUT): os.remove(OUT)
        print('OK  ingen ændringer i forhold til Panasonics Throw Distance Calculator'); return
    md = [f'Ugentligt tjek fandt **{n} ændring(er)** i forhold til [Panasonics Throw Distance Calculator](https://docs.connect.panasonic.com/projector/calculator/tdc/).', '']
    for h, rows in rep.items():
        if rows: md += [f'### {h}', *[f'- {r}' for r in rows[:150]], *(['- …'] if len(rows) > 150 else []), '']
    md += ['Rettes med `python tools/fetch_eol.py` (udgåede) og `python tools/fetch_mounts.py` (beslag). Aktuelle modeller rettes i `data/catalog.json` efter tjek hos Panasonic.']
    open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(md) + '\n')
    print(f'ÆNDRINGER: {n} – se {OUT}')

if __name__ == '__main__':
    main()
