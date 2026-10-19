# Throw Planner

Web app for planning projector installations with current Panasonic projectors and lenses (EU range).

**Live:** https://throwplanner.github.io/

## Features
- Throw distance, image size, zoom and throw ratio per aspect ratio (Panasonic formulas and official throw ratios)
- Lens shift limits from Panasonic's shift data, keystone within Panasonic's published ranges, lens lock, ceiling/table mounting and flying frames
- Edge blend with overlap, projector spacing and blend-zone contrast
- Contrast per ANSI/INFOCOMM 3M-2011 (AVIXA V201.01), ambient light and sunlight with windows/skylights
- Room views (rear view and section) with draggable projector, screen and presenter, lockable distance/width
- Themes: Auditorium, Museum, Theatre (incl. rear projection), Immersive (walls + floor) and Golf Sim (player, swing, shadow, launch-monitor checks)
- Floor plan import (PNG/JPG/PDF) with scale and screen marking
- Project files (JSON) to save and share a setup · PDF export of the whole page
- Languages: English, Danish, Japanese · installable (PWA) and usable offline

## Project layout
| Path | Purpose |
|---|---|
| `src/page.html` | Page markup (head, panels, boxes 01–11) |
| `src/styles.css` | All styling |
| `src/js/NN-*.js` | App code, concatenated in file-name order into one script |
| `data/catalog.json` | Panasonic projector and lens catalogue |
| `data/images.json` | Product images (embedded in the website build) |
| `i18n/translations.txt` | Danish → English → Japanese texts, one per line: `dansk\|english\|日本語` |
| `web/` | Static files copied to the site: service worker, manifest, icons, `pdfexport.js` (PDF export, loaded when the PDF button is pressed) |
| `tools/build.py` | Build script (Python 3 only) |
| `.github/workflows/pages.yml` | Builds and publishes the site on every push to `main` |

## Build
```
python tools/build.py
```
Creates `dist/site/` (the website – open `dist/site/index.html` to test locally) and `dist/artifact.html` (single-file version). `dist/` is not committed; GitHub Actions builds it on every push. The service worker cache version is set automatically from the content.

## Notes
- PDF floor plans load pdf.js from cdnjs.cloudflare.com; fonts load from Google Fonts. Everything else is local.
- Settings are stored in the visitor's own browser (localStorage).
- Data is based on Panasonic's Throw Distance Calculator and product pages; always verify against Panasonic's official specifications before installation. Not affiliated with Panasonic or TrackMan.
