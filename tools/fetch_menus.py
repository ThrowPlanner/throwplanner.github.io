#!/usr/bin/env python3
"""Hent Panasonic-manualerne (MAN_PJ i src/js/02-state.js) og udtræk projektorens menutræ fra
indholdsfortegnelsen (kapitel 4 «Settings») til data/menus.json – bruges af «Menu-hjælp» i boks 03.

Kør:  pip install pypdf
      python tools/fetch_menus.py [mappe-til-pdf'er]
Kun menunavne og sidetal gemmes – ingen tekst fra manualerne.
"""
import json, logging, os, re, sys, tempfile, urllib.request
logging.disable(logging.WARNING)
import pypdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DL = sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), 'throwplanner-manualer')
os.makedirs(DL, exist_ok=True)
src = open(os.path.join(ROOT, 'src', 'js', '02-state.js'), encoding='utf-8').read()
man = json.loads(re.search(r"const MAN_PJ=(\{.*?\});", src).group(1).replace("'", '"'))
B = 'https://eu.connect.panasonic.com/sites/default/files/media/'
full = lambda u: u if u.startswith('http') else B + u

urls = {}
for k, u in man.items(): urls.setdefault(full(u), []).append(k)

ITEM = re.compile(r'^(\[.*\])( menu)?[\s.]*(\d{1,3})$')  # «[EDGE BLENDING] ..... 130» / «[PICTURE] menu ... 111»
SKIP = {'OK', 'YES', 'NO', 'EXECUTE', 'CANCEL', 'ENTER', 'SET', 'STORE'}
SEL = re.compile(r'^\d+\)\s*Press .*?select \[([^\]]+)\]')
OPT = re.compile(r'^\[([^\]]+)\](?:\s|$)')

def sections(r, menus):
    """Gennemgå hvert menupunkts afsnit: undermenuer («Press .. to select [X]») og valgmuligheder (linjer der starter med [X]).
    Hvert punkt bliver [navn, side, valg, [[undermenu, side, valg], …], adgangskoder]; hver menu [navn, side, punkter, adgangskoder]."""
    seq = [it for m in menus for it in m[2]]
    names = {m[0] for m in menus} | {it[0] for it in seq}
    txt = {}
    def page(n):
        if n not in txt: txt[n] = (r.pages[n - 1].extract_text() or '') if 0 < n <= len(r.pages) else ''
        return txt[n]
    for k, it in enumerate(seq):
        nxt = seq[k + 1] if k + 1 < len(seq) else None
        end = min(nxt[1] if nxt else it[1] + 3, it[1] + 12)
        lines = [(n, re.sub(r'\s+', ' ', l).strip()) for n in range(it[1], end + 1) for l in page(n).split('\n')]
        st = next((j for j, (n, l) in enumerate(lines) if l == f'[{it[0]}]'), 0)
        opts, subs, cur, body = [], [], None, []
        for n, l in lines[st + 1:]:
            if nxt and l == f'[{nxt[0]}]' or re.match(r'^\[[^\]]+\] menu$', l): break
            body.append(l)
            m = SEL.match(l)
            if m:
                x = m.group(1)
                if x != it[0] and x not in names and x not in SKIP:
                    cur = next((s for s in subs if s[0] == x), None)
                    if not cur: cur = [x, n, []]; subs.append(cur)
                continue
            m = OPT.match(l)
            if m:
                x = m.group(1); tgt = cur[2] if cur else opts
                if x != it[0] and x not in names and x not in SKIP and len(x) < 40 and x not in tgt and len(tgt) < 24: tgt.append(x)
        sn = {s[0] for s in subs}  # et undermenunavn er ikke også en valgmulighed
        it += [[o for o in opts if o not in sn], [[s[0], s[1], [o for o in s[2] if o not in sn]] for s in subs], passwords(' '.join(body))]
    # menuens indledning (før første punkt) – fx adgangskoden til hele [SECURITY]-menuen
    for m in menus:
        first = m[2][0] if m[2] else None
        lines = [re.sub(r'\s+', ' ', l).strip() for n in range(m[1], (first[1] if first else m[1]) + 1) for l in page(n).split('\n')]
        st = next((j for j, l in enumerate(lines) if l == f'[{m[0]}] menu'), 0)
        body = []
        for l in lines[st + 1:]:
            if first and l == f'[{first[0]}]': break
            body.append(l)
        m.append(passwords(' '.join(body)))
        # menuens kode gælder også dens egne adgangskode-punkter ([SECURITY PASSWORD], [PASSWORD CHANGE] …)
        for it in m[2]:
            if m[3] and 'PASSWORD' in it[0] and not it[4] and not re.search(r'CONTROL DEVICE|MENU LOCK|SERVICE', it[0]): it[4] = list(m[3])
    # trådløs adgangskode står ofte i et kapitel uden for menuerne
    for n in range(1, len(r.pages) + 1):
        t = re.sub(r'\s+', ' ', page(n))
        w = re.search(r'default factory password for wireless connection is “([^”]+)”', t)
        if w:
            tgt = next((it for it in seq if it[0] == 'WIRELESS LAN'), None) or next((m for m in menus if 'NETWORK' in m[0]), None)
            pw = tgt[-1]; x = f'{w.group(1)} (wireless connection)'
            if x not in pw: pw.append(x)
            break

# fabriksadgangskoder, som manualen oplyser i et menupunkts afsnit. Panasonics pile-skrift: a=▲ s=▼ q=◀ w=▶
ARROW = str.maketrans({'a': '▲', 's': '▼', 'q': '◀', 'w': '▶'})
def passwords(t):
    pw = []
    add = lambda x: x not in pw and pw.append(x)
    for m in re.finditer(r'Initial password[^.]{0,60}?:\s*(?:Press\s*)?([awsq]{4,12})\b', t):
        add(' '.join(m.group(1).translate(ARROW)) + ' (arrow buttons), then ENTER')
    for m in re.finditer(r'initial password is “([^”]+)”', t): add(m.group(1))
    for m in re.finditer(r'default factory password for wireless connection is “([^”]+)”', t): add(f'{m.group(1)} (wireless connection)')
    for m in re.finditer(r'factory default setting of (?:the )?(PJLink )?password is blank', t): add(f'{m.group(1) or ""}blank (no password)'.strip())
    return pw

res = []
for i, (u, models) in enumerate(urls.items()):
    fn = os.path.join(DL, f'm{i}.pdf')
    if not os.path.exists(fn):
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=120) as r, open(fn, 'wb') as f: f.write(r.read())
    r = pypdf.PdfReader(fn)
    toc = ''.join((p.extract_text() or '') + '\n' for p in r.pages[:8])
    menus = []; cur = None; on = False; wrap = ''
    for l in (re.sub(r'\s+', ' ', l).strip() for l in toc.split('\n')):
        l = (wrap + ' ' + l).strip() if wrap else l; wrap = ''
        if l.startswith('[') and (']' not in l or re.match(r'^\[.*\]( menu)?$', l)): wrap = l; continue  # langt navn/sidetal på næste linje
        if l.startswith('Chapter 4'): on = True; continue
        if on and l.startswith('Chapter') and menus: break
        m = ITEM.match(l) if on else None
        if not m: continue
        name, pg = m.group(1).strip('[]').replace('] / [', ' / '), int(m.group(3))
        if m.group(2): cur = [name, pg, []]; menus.append(cur)
        elif cur: cur[2].append([name, pg])
    sections(r, menus)
    print(f'{models[0]:12} menuer={len(menus)} punkter={sum(len(m[2]) for m in menus)} under={sum(len(i[3]) for m in menus for i in m[2])}', flush=True)
    if not menus: sys.exit(f'Ingen menuer fundet i {u}')
    res.append({'mo': models, 'me': menus})
with open(os.path.join(ROOT, 'data', 'menus.json'), 'w', encoding='utf-8', newline='\n') as f:
    json.dump(res, f, ensure_ascii=False, separators=(',', ':'))
print('OK  data/menus.json')
