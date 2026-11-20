# Throw Planner – noter til Claude

Simons projektor-planlægningsapp (Panasonic-data). Live: https://throwplanner.com/ (GitHub: ThrowPlanner/throwplanner.github.io).
Claude-artifact (én-fils-udgaven): https://claude.ai/artifact/VCjkMS7no1dYqKRxV1qPH5 – opdateres med `dist/artifact.html`.
Jura: produktbilleder vises direkte fra Panasonics TDC-server (kopiér dem aldrig ind), skrifter og pdf.js ligger i `web/`
(intet fra Google/cdnjs på siden), privatliv/kontakt i `src/js/23-privacy.js` (`CONTACT` + teksten skal holdes opdateret).

## Arbejdsgang
1. Ret i `src/` (kun de filer der skal ændres – læs ikke hele projektet).
2. Byg: `python tools/build.py` → `dist/site/index.html` (hjemmeside) og `dist/artifact.html`.
3. Test i browser (Playwright/åbn `dist/site/index.html`). Ingen fejl i konsollen; tjek alle temaer der berøres.
4. Simon committer og pusher med GitHub Desktop → GitHub Actions bygger og publicerer siden. `dist/` committes ikke.
   Service worker-versionen sættes automatisk – ingen manuel bump.

## Struktur
- `src/page.html` markup · `src/styles.css` stil · `src/js/NN-navn.js` kode (sammensættes i filnavnsorden til ét `<script>` –
  alt deler samme scope, så funktioner/variabler kan bruges på tværs af filer).
  - 00-data (katalog-indlæsning), 01-core (Panasonic-formler), 02-state (`S`, temaer; intet gemmes mellem besøg – kun disclaimer-valget `kasteplan_disc` i 22-disclaimer),
    03-calc (`calc()`), 04-ui (lister, `fitLens`, `constrain`), 05-i18n (`I18`, `render()`), 06-draw-helpers,
    07-golf (Golf Sim), 08-view09-rear (`drawFront`, boks 09), 09-view10-section (`drawSide`, boks 10) – i aud/museum/teater står snittet øverst og numrene er byttet (10 = bagfra, 09 = snit), 10-contrast (boks 06),
    11-floorplan (boks 08), 12/13 træk og lens shift-bar, 14-sun, 15-solutions (boks 11), 16-events, 17-project-file (JSON), 17b-freegrid (Free Grid i boks 08), 18-start, 19-quick-guide (rundvisning).
- `data/catalog.json` katalog: `{cats, models}`; optikrække `[A,B,At,Bt,minD",maxD"]`, kast L = A·D + B.
  Optik: `[navn, F/Z, rækker, shift-polygon, offset, udragning mm, billede, [type, ust-boks], [B,H,L mm]]` – felt 8 = optikkens officielle mål (TDC «Diameter»), kun til tegning.
  Ultrakort kast (type `u`): optikken skyder bagud; ust-boks = kabinet + optik (samlet længde = kabinetdybde + udragning).
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
| Digital Zoom Extender | `dzeSpec`/`DZE_MIN` i `03-calc.js` (lens shift regnes i `r.Hs`/`r.Ws`), visning i `13-lensshift-bar.js`, `dzeSet` i `16-events.js` |
| Kontrast og sollys | `10-contrast.js`, `14-sun.js` |
| Plantegning (boks 08) | `11-floorplan.js` |
| Projektorskitse (kabinet + optik i boks 08/09/10, UST-detaljen og Free Grid 3D) | `src/js/06c-pjsketch.js` (`pkModel` ud fra `m.dim`, optik felt 5/7/8; `pkOrtho` retvinklet, `pk3D` perspektiv, `pkThree` three.js i Free Grid, `pkBox` udstrækning til Free Grids rum-tjek), `.pk-*` i `src/styles.css`. Generiske detaljer – ingen Panasonic-tegninger. Optik der ikke sidder i midten (VMQ/VMZ) + filterside: `LENSPOS`/`lensOff` i `03-calc.js` (tal fra Panasonics CAD-PDF under modellens Resources) |
| Målsat projektordetalje (lille kort øverst til højre i boks 08/09/10: ovenfra, fra siden, set fra lærredet) | `src/js/06d-pjdetail.js` (`pkDetail(r)` kaldes fra `render()`), `.skd*` i `src/styles.css` |
| Free Grid (fane i boks 08, 3D-rum med flere projektorer, top/down) | `src/js/17b-freegrid.js` (`FG`, `fgSpec`/`fgFit`/`fg3Build`; boks 01/02/05/07 viser den valgte projektor, mens fanen er åben), `.fg*` i `src/styles.css`, 3D fra `web/warp-three.js` (artifactet skal have filen med som ekstra fil) |
| Edge blend og portræt (boks 05) | `03-calc.js`, `blendAuto` i `04-ui.js` |
| Buet lærred / curved (boks 05, tegnes i 08/09/10) | `src/js/26-curved.js` (manual-tabel i `put`-linjer), nye tal meldes af `tools/check_curved.py` i det ugentlige TDC-tjek |
| Luft ind/ud (knap i boks 03: pile, fri zoner, advarsler i alle temaer undtagen Warping) | `src/js/17c-airflow.js` (`AIR_DATA` fra Panasonics manualer: sider + mm + sidetal; wrapper `calc`/`render`/`projector3D`/`fgWarn`, kroge `airSide`/`airImm09`/`airImm10`/`airFG` i 08/09/17b), `.air*` i `src/styles.css` |
| Katalog og throw ratios | `data/catalog.json`, `PANTR` i `04-ui.js` |
| Løsninger (boks 11) | `15-solutions.js` |
| Projektfil (JSON) | `17-project-file.js` |
| Quick Guide (rundvisning) | `src/js/19-quick-guide.js` (trin i `STEPS`), knap `#qgBtn` i `src/page.html`, `.qg*` i `src/styles.css` |
| Warping (TEST) – tema kun i Avanceret | `src/warp.html` (selvstændig side med egen kode/stil, kun engelsk; bygges til `dist/site/warp.html` og vises i en ramme), `src/js/25-warp.js` (rammen), `web/warp-three.js` (three.js r128 lokalt), knap `data-venue="warp"` i `src/page.html`. Ikke med i én-fils-artifactet. Free Grid-tabellen (`geoLevel`) følger Panasonics liste fra maj 2024. |
| Oversættelser | `i18n/translations.txt` |
| Layout og design | `src/page.html`, `src/styles.css` |

## Faste regler fra Simon
- Throw ratios skal være 100 % Panasonics officielle (TDC). Ændr aldrig kast-/optikdata uden at tjekke Panasonics side.
- Ingen Panasonic/MEVIX- eller TrackMan-logoer/brandfarver/design (TrackMan-enheden tegnes generisk).
- Navnet TrackMan og modelnavne (iO, TM4 …) må ikke stå i appen – brug «Sim-kamera», «Loftkamera» (lav/mellem/høj) og «Gulvkamera». Interne nøgler (`tm:'LOW'|'TM4'`) bevares for gemte projekter.
- Standard: engelsk, mørk tilstand; Nulstil beholder lys/mørk.
- Store nye funktioner: lav først en testversion (separat artifact) – tilføj ikke til appen før Simon har testet.
- Svar Simon på dansk, kort.
