#!/usr/bin/env python3
"""Byg testudgaven «Free Grid (TEST)» – appen + src/test/freegrid.* (ikke med i den rigtige app).

Kører først den normale build (tools/build.py) og laver derefter:
  dist/site/freegrid-test.html – til preview i browservinduet (http://localhost:8000/freegrid-test.html)
  dist/test-freegrid.html      – én-fils-udgaven til et separat test-artifact (3D henter warp-three.js ved siden af)

Kør:  python tools/build_test.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build

T = ('src', 'test')

def translations_plus(orig=build.translations):
    rows = json.loads(orig())
    for line in build.read(*T, 'freegrid-translations.txt').strip('\n').split('\n'):
        if not line.strip(): continue
        parts = line.split('|')
        if len(parts) != 3: sys.exit(f'freegrid-translations.txt: forkert linje: {line}')
        k, en, ja = parts
        ex = k.startswith('=')
        rows.append([k[1:] if ex else k, en, ja, 1 if ex else 0])
    return json.dumps(rows, ensure_ascii=False)

def main():
    build.main()
    build.translations = translations_plus
    s = build.page()
    assert s.count(build.BOOT) == 1 and s.count(build.GFONTS) == 1
    s = s.replace(build.BOOT, build.read(*T, 'freegrid.js') + '\n' + build.BOOT)
    i = s.index('</style>')
    s = s[:i] + build.read(*T, 'freegrid.css') + s[i:]
    assert s.startswith('<title>Throw Planner</title>')
    s = s.replace('<title>Throw Planner</title>', '<title>Throw Planner Free Grid</title>', 1)
    s = s.replace(build.GFONTS, '<link rel="stylesheet" href="fonts.css">').replace(build.PDFJS_CDN, '').replace(build.WARP_BTN, '')
    with open(build.p('dist', 'test-freegrid.html'), 'w', encoding='utf-8', newline='\n') as f: f.write(s)
    w = s.replace(build.BOOT, 'render();')
    j = w.index('</style>') + len('</style>')
    html = build.HEAD + w[:j] + '\n</head>\n<body>\n' + w[j:] + '\n</body>\n</html>\n'
    with open(build.p('dist', 'site', 'freegrid-test.html'), 'w', encoding='utf-8', newline='\n') as f: f.write(html)
    print('OK  dist/site/freegrid-test.html · dist/test-freegrid.html')

if __name__ == '__main__':
    main()
