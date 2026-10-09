# Projection Throw Planner

Web app for planning projector installations with current Panasonic projectors and lenses (EU range).

**Live:** https://bqnnestag.github.io/Projection-Throw-Planner/

## Features
- Throw distance, image size, zoom and throw ratio per aspect ratio (Panasonic formulas)
- Lens shift limits from Panasonic's shift data, ceiling/table mounting and flying frames
- Keystone correction within Panasonic's published ranges (safe values)
- Edge blend with overlap, projector spacing and blend-zone contrast
- Contrast per ANSI/INFOCOMM 3M-2011 (AVIXA V201.01), ambient light and sunlight with windows/skylights
- Room views (rear view and section) with draggable projector, screen and presenter, lockable distance/width
- Themes: Auditorium, Museum, Theatre (incl. rear projection) and Immersive (walls + floor, blended content)
- Floor plan import (PNG/JPG/PDF) with scale and screen marking
- PDF export of the whole page (selectable text, not editable)
- Languages: English, Danish, Japanese
- Installable (PWA) and usable offline after the first visit

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole app (catalogue, images and translations embedded) |
| `pdfexport.js` | PDF export (loaded when the PDF button is pressed) |
| `manifest.webmanifest`, `icon-*.png` | Home-screen install |
| `sw.js` | Offline cache |

## Notes
- PDF floor plans load pdf.js from cdnjs.cloudflare.com; fonts load from Google Fonts. Everything else is local.
- Settings are stored in the visitor's own browser (localStorage).
- Data is based on Panasonic's Throw Distance Calculator and product pages; always verify against Panasonic's official specifications before installation.
