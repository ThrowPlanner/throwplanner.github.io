#!/usr/bin/env python3
"""Hent Panasonics flyrammer (med kompatible projektorer) til data/mounts.json.

Kilde: https://docs.connect.panasonic.com/projector/products/optional_accessories/
Tabellen bruger rowspan: fx deler ET-PKD100H/ET-PKD100S/ET-PFD100 én celle med projektorerne – det håndteres her.
Kun navne og kompatibilitet gemmes. Udgåede projektorer står i tabellen uden link (= «discontinued» ifølge Panasonic).

Kør:  python tools/fetch_mounts.py
"""
import json, os, re, sys, urllib.request
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://docs.connect.panasonic.com/projector/products/optional_accessories/'
# kun flyrammer (loftbeslag, bærehåndtag o.l. udelades)
KEEP = re.compile(r'^frame$', re.I)

class Tables(HTMLParser):
    """Alle tabelrækker som lister af celler [tekst, rowspan]."""
    def __init__(self):
        super().__init__(); self.rows = []; self.row = None; self.cell = None
    def handle_starttag(self, tag, a):
        if tag == 'tr': self.row = []
        elif tag in ('td', 'th') and self.row is not None: self.cell = ['', int(dict(a).get('rowspan') or 1)]
        elif tag == 'br' and self.cell is not None: self.cell[0] += ' '
    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None: self.row.append(self.cell); self.cell = None
        elif tag == 'tr' and self.row is not None: self.rows.append(self.row); self.row = None
    def handle_data(self, d):
        if self.cell is not None: self.cell[0] += d

def grid(rows):
    """Udfold rowspan, så hver række har alle tre kolonner (model, type, kompatible)."""
    out, carry = [], {}
    for r in rows:
        full, it, col = [], iter(r), 0
        while True:
            if col in carry and carry[col][1] > 0:
                full.append(carry[col][0]); carry[col][1] -= 1; col += 1; continue
            c = next(it, None)
            if c is None: break
            txt = re.sub(r'\s+', ' ', c[0]).strip(); full.append(txt)
            if c[1] > 1: carry[col] = [txt, c[1] - 1]
            col += 1
        out.append(full)
    return out

def models(s):
    """«PT-REQ15/REQ15L, PT-RZ21K/RS20K» → ['PT-REQ15','PT-REQ15L','PT-RZ21K','PT-RS20K']"""
    r = []
    for part in re.split(r',\s*', s):
        for i, p in enumerate(part.strip().split('/')):
            p = p.strip()
            if not p: continue
            r.append(p if p.startswith('PT-') else 'PT-' + p)
    return [m for m in r if re.fullmatch(r'PT-[A-Z0-9]+', m)]

def fetch():
    """Panasonics tabel → liste af {id, type, models, note?, eol?} (bruges også af tools/check_tdc.py)."""
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=60).read().decode('utf-8')
    p = Tables(); p.feed(html)
    out = []
    for r in grid(p.rows):
        if len(r) < 3 or not re.match(r'ET-[A-Z0-9]', r[0]): continue
        mid = re.match(r'(ET-[A-Z0-9]+)', r[0]).group(1); typ = r[1]
        if not KEEP.search(typ): continue
        note = r[0][len(mid):].strip(); disc = '(Discontinued)' in note
        note = re.sub(r'^Note:\s*|\(Discontinued\)', '', note).strip()
        out.append({'id': mid, 'type': typ, 'models': models(r[2]), **({'note': note} if note else {}), **({'eol': 1} if disc else {})})
    if len(out) < 3: sys.exit(f'For få flyrammer fundet ({len(out)}) – har Panasonic ændret siden?')
    return out

def main():
    out = fetch()
    with open(os.path.join(ROOT, 'data', 'mounts.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'OK  data/mounts.json  {len(out)} flyrammer')

if __name__ == '__main__':
    main()
