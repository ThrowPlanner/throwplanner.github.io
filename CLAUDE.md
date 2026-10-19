# Throw Planner – noter til Claude

Simons projektor-planlægningsapp (Panasonic-data). Live: https://throwplanner.github.io/ (GitHub: ThrowPlanner/throwplanner.github.io).
Claude-artifact (én-fils-udgaven): https://claude.ai/artifact/VCjkMS7no1dYqKRxV1qPH5 – opdateres med `dist/artifact.html`
(billederne ligger som `img.json` ved siden af i artifactet).

## Arbejdsgang
1. Ret i `src/` (kun de filer der skal ændres – læs ikke hele projektet).
2. Byg: `python tools/build.py` → `dist/site/index.html` (hjemmeside) og `dist/artifact.html`.
3. Test i browser (Playwright/åbn `dist/site/index.html`). Ingen fejl i konsollen; tjek alle temaer der berøres.
4. Simon committer og pusher med GitHub Desktop → GitHub Actions bygger og publicerer siden. `dist/` committes ikke.
   Service worker-versionen sættes automatisk – ingen manuel bump.

## Struktur
- `src/page.html` markup · `src/styles.css` stil · `src/js/NN-navn.js` kode (sammensættes i filnavnsorden til ét `<script>` –
  alt deler samme scope, så funktioner/variabler kan bruges på tværs af filer).
  - 00-data (katalog-indlæsning), 01-core (Panasonic-formler), 02-state (`S`, temaer, gem i localStorage `kasteplan5`),
    03-calc (`calc()`), 04-ui (lister, `fitLens`, `constrain`), 05-i18n (`I18`, `render()`), 06-draw-helpers,
    07-golf (Golf Sim), 08-view09-rear (`drawFront`, boks 09), 09-view10-section (`drawSide`, boks 10), 10-contrast (boks 06),
    11-floorplan (boks 08), 12/13 træk og lens shift-bar, 14-sun, 15-solutions (boks 11), 16-events, 17-project-file (JSON), 18-start, 19-quick-guide (rundvisning).
- `data/catalog.json` katalog: `{cats, models}`; optikrække `[A,B,At,Bt,minD",maxD"]`, kast L = A·D + B.
- `i18n/translations.txt`: dansk er kildesproget i koden. Ny dansk tekst i UI → tilføj linje `dansk|english|日本語`
  (tal skrives som `#`; `=` foran = kun hele tekster). Standardsprog for brugere er engelsk.
- Temaer (`S.venue`): `aud`, `museum`, `theater`, `immersive`, `golf` (knap «Golf Sim»). `data-venue` på `<html>` styrer CSS pr. tema.

## Emner → filer (start her i stedet for at læse alt)
| Emne | Filer |
|---|---|
| Golf Sim | `src/js/07-golf.js` (+ golf-CSS i `src/styles.css`, panel i `src/page.html`) |
| Immersive | `immCalc` i `02-state.js`, `drawImm` i `08-view09-rear.js`, `09-view10-section.js`, `16-events.js` |
| Teater / Auditorium / Museum | `02-state.js` (temaregler), `08-view09-rear.js`, `09-view10-section.js` |
| Optik, lens shift, keystone | `01-core.js` (shift-polygon), `03-calc.js` (`calc`, `ksLim`), `13-lensshift-bar.js` |
| Kontrast og sollys | `10-contrast.js`, `14-sun.js` |
| Plantegning (boks 08) | `11-floorplan.js` |
| Edge blend og portræt (boks 05) | `03-calc.js`, `blendAuto` i `04-ui.js` |
| Katalog og throw ratios | `data/catalog.json`, `PANTR` i `04-ui.js` |
| Løsninger (boks 11) | `15-solutions.js` |
| Projektfil (JSON) | `17-project-file.js` |
| Quick Guide (rundvisning) | `src/js/19-quick-guide.js` (trin i `STEPS`), knap `#qgBtn` i `src/page.html`, `.qg*` i `src/styles.css` |
| Oversættelser | `i18n/translations.txt` |
| Layout og design | `src/page.html`, `src/styles.css` |

## Faste regler fra Simon
- Throw ratios skal være 100 % Panasonics officielle (TDC). Ændr aldrig kast-/optikdata uden at tjekke Panasonics side.
- Ingen Panasonic/MEVIX- eller TrackMan-logoer/brandfarver/design (TrackMan-enheden tegnes generisk).
- Navnet TrackMan og modelnavne (iO, TM4 …) må ikke stå i appen – brug «Sim-kamera», «Loftkamera» (lav/mellem/høj) og «Gulvkamera». Interne nøgler (`tm:'LOW'|'TM4'`) bevares for gemte projekter.
- Standard: engelsk, mørk tilstand; Nulstil beholder lys/mørk.
- Store nye funktioner: lav først en testversion (separat artifact) – tilføj ikke til appen før Simon har testet.
- Svar Simon på dansk, kort.
