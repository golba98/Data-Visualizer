# Change Log - Round 2 UI Usability & Decluttering

## 25 August 2026 — Interactive Exploration Enhancements

### Objective
Add high-impact exploration, export, sharing, and comparison features to the current inequality and survey visualisations while leaving archived charts unchanged.

### Implemented
- Added exact hover tooltips for lines, bars, stacked segments, waffle cells, heatmap cells, circles, gauge components, and survey counts.
- Added crosshairs for active line-chart points.
- Added 3× high-resolution PNG export and chart-ready CSV export, including cleaned source metadata and derived chart rows where applicable.
- Added hash routing for direct chart links such as `#za-gini-trend` and comparison links such as `#compare/za-dwelling-ownership-by-group/za-population-group-earnings`.
- Added independent desktop comparison panes and responsive mobile stacking using embedded p5 chart instances.
- Extended the Topic 8 test harness with CSV escaping, hash routing, comparison, and export-data checks.

### Verification
- JavaScript syntax checks: passed.
- `npm run build`: passed; only existing legacy-script informational warnings were emitted.
- `git diff --check`: passed.
- Browser validation: 41 tests passed, 0 failed; tooltip/crosshair rendering, deep links, desktop/mobile comparison, PNG export, and CSV export verified.
- PNG output verified at 3504 × 1716 pixels; Gini CSV export contained the cleaned source columns and seven data rows.

### Finals evidence
Five new rendered screenshots and the corresponding evidence descriptions were added to the requested external `1-Picture Evidence` folder. The evidence log records the feature states, download checks, routes, and verification results.

**Date/Time**: 2026-08-05 14:15:00 (+02:00)

## Objective
Improve practical usability, simplify sidebar navigation into a compact 4-button section switcher, de-duplicate chart titles, make the chart visualization the primary focus by replacing the permanent right panel with an optional "About this chart" drawer, remove raw internal CSV file paths from visible interface text, and reduce visual noise (unnecessary borders and bold typography) while strictly preserving the dark visual aesthetic, chart colors, CSV data, and p5 chart code.

## Initial Git Status
Branch `main`, working tree had uncommitted modifications to `index.html`, `style.css`, `src/gallery.js`, `README.md`, `package.json`, and `package-lock.json` from round 1.

## Files Inspected
- `index.html`
- `style.css`
- `src/gallery.js`
- `src/sketch.js`
- `src/topic8-testing.js`
- `README.md`
- `package.json`
- `package-lock.json`

## Files Modified
- `index.html`: Added `#about-chart-toggle` button in chart header; wrapped `#info-panel` header with `#info-panel-close` and title "About this chart"; set `#info-panel` to hidden by default.
- `src/gallery.js`: Refactored menu building to use compact 4-button section selector (`Overview`, `Inequality`, `Survey`, `Archive`); rendered chart links for ONLY the selected section; shortened chart labels; removed raw CSV file paths from `source` and `chartSource`; added `initAboutPanel()` and `toggleAboutPanel()` handling Escape key dismissal and canvas resizing.
- `style.css`: Added compact section tab button styles (`.section-tabs`, `.section-tab-btn`); styled `.chart-layout.about-open` and optional `#info-panel`; reduced heading size to ~20px (`1.25rem`); reduced redundant nested card borders and unneeded dividers; set normal font weight for inactive buttons and links.
- `README.md`: Added short navigation usage summary and updated local setup section.

## Files Created
- `documentation/CHANGE_LOG.md` (this file)
- `documentation/TESTING.md`
- `documentation/evidence/` (directory)

## Navigation Changes
- Replaced large vertical accordion headings with a compact 4-button tab switcher: `Overview`, `Inequality`, `Survey`, `Archive`.
- Selecting a section tab displays chart links ONLY for that section.
- Selecting a chart automatically selects its parent section tab.
- Shortened chart link labels (e.g. `National inequality`, `Population earnings`, `Dwelling ownership`, `Land ownership`, `Top income share`, `Top 10 concentration`, `Poverty indicators`).
- Full keyboard support (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-current="page"`). Hidden section links are omitted from DOM when inactive, preventing focus traps.

## Chart Layout & "About this chart" Changes
- The chart card expands to 100% layout width when the information panel is closed.
- The information panel is closed (hidden) by default, preserving maximum visual space for the chart.
- An "About this chart" toggle button in the chart header opens/closes the panel.
- Pressing `Escape` or clicking the close button (`&times;`) closes the panel.
- De-duplicated titles: chart title is displayed once in the chart header; `#info-title` inside the panel displays "About this chart".

## Source & Text Simplification
- Stripped all raw internal CSV paths (e.g. `data/inequality/za_gini_trend.csv`) from visible source attributions.
- Replaced with clean public source strings (e.g. `World Bank PIP via OWID, 1993-2022`, `Stats SA Census 2022 and Stats SA earnings data, 2011–2015`).

## Visual Noise & Typography Reductions
- Reduced "Story Sections" heading font size to 20px (`1.25rem`).
- Removed redundant inner card borders and canvas border outlines.
- Reduced font weight: normal weight for body copy, inactive section tabs, and inactive chart buttons. Semibold/bold reserved for active controls and section titles.

## NPM & Verification Results
- `node -c src/gallery.js`: PASSED (0 exit code).
- `npm run build`: PASSED (production bundle generated in `dist/`).
- `npx vite`: PASSED (dev server started on port 5173).

## Data & Theme Preservation Confirmation
- Underlying CSV values, JSON data, and calculated stats were 100% preserved.
- p5 chart rendering logic, chart colors, and chart types were 100% preserved.
- Dark theme palette (`#0f1115`, `#1a1f27`, `#30353f`, `#e5e7eb`) was 100% preserved.

## Evidence Pictures & Log Files
The following picture evidence and test logs were collected and stored in [`documentation/evidence/`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/):
- **Round 2 UI Improvement Screenshots (Captured live with Google Chrome)**:
  - [`12-compact-section-selector.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/12-compact-section-selector.png): Compact 4-button section selector on Overview
  - [`13-inequality-chart-list.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/13-inequality-chart-list.png): Inequality section selected showing filtered chart links
  - [`14-active-chart-state.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/14-active-chart-state.png): Active chart link highlighted state
  - [`15-chart-full-width.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/15-chart-full-width.png): Full-width chart card view
  - [`16-about-chart-closed.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/16-about-chart-closed.png): Chart header with "About this chart" toggle button (closed state)
  - [`17-about-chart-open.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/17-about-chart-open.png): Optional "About this chart" panel open state
  - [`18-clean-source-text.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/18-clean-source-text.png): Clean public source text without internal file paths
  - [`19-mobile-section-selector.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/19-mobile-section-selector.png): Mobile viewport drawer with compact section selector
  - [`20-keyboard-focus-state.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/20-keyboard-focus-state.png): Visible blue focus outline on controls
  - [`21-production-build-success.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/21-production-build-success.png): Production build preview verification
- **Initial Overview & System Tests**:
  - [`st01-initial-overview.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/st01-initial-overview.png)
  - [`st02-gini-chart-loaded.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/st02-gini-chart-loaded.png)
  - [`st03-census-year-max-2022.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/st03-census-year-max-2022.png)
  - [`st04-load-error-state.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/st04-load-error-state.png)
  - [`st06-loading-state.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/st06-loading-state.png)
- **Before & After Visual Evidence**:
  - Number formatting: [`01-number-formatting-before.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/01-number-formatting-before.png) / [`01-number-formatting-after.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/01-number-formatting-after.png)
  - Loading states: [`02-loading-state-before.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/02-loading-state-before.png) / [`02-loading-state-after.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/02-loading-state-after.png)
  - Load failure messaging: [`03-load-failure-before.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/03-load-failure-before.png) / [`03-load-failure-after.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/03-load-failure-after.png)
- **Automated Test Run Log**: [`automated-test-run.txt`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/automated-test-run.txt)

## Final Git Status
Uncommitted modifications on `main`: `index.html`, `style.css`, `src/gallery.js`, `src/sketch.js`, `README.md`, `.gitignore`, `package.json`, `package-lock.json`. Untracked: `documentation/`.

## 25 August 2026 — Guided inequality story and canvas annotations

### Changes made

- Added a seven-step guided story covering national Gini context, before-tax income concentration, population-group earnings, dwelling tenure, land concentration, top-10 concentration, and poverty-line context.
- Added `#tour/<step-id>` hash routes so story steps can be bookmarked and reloaded directly.
- Added Previous, Next/Finish, Exit story, progress, narrative, and source controls.
- Added toggleable direct-canvas annotations: a 1994 historical context marker, a Gini peak callout, 50% threshold/reference lines, a 10% population reference, and chart-specific value/context badges.
- Kept annotations source-aware: the 1994 marker is labelled as a context/reference point rather than a causal policy claim, and poverty measures remain explicitly separate.
- Added one annotation visibility toggle: in the story controls during a tour, or in the normal chart action bar outside a tour.

### Verification

- JavaScript syntax checks: passed across all source visualisations and gallery files.
- Browser route check: `#tour/national-context` loaded step 1; Next advanced to `#tour/income-concentration` and step 2 of 7.
- Annotation toggle check: Hide annotations changed the active story control to Show annotations with `aria-pressed="false"`.
- `npm run build`: passed; only existing legacy-script informational warnings were emitted.
- `git diff --check`: passed.

### Finals evidence

Added to the requested external `1-Picture Evidence` folder:

- `feature-guided-tour-gini.png` — Gini story step with 1994 context and 2005 peak annotations.
- `feature-guided-tour-income-threshold.png` — income concentration story step with the 50% reference line.

## 25 August 2026 — Short-viewport story-mode repair

- Replaced the fixed, non-scrollable story layout with a vertically scrollable tour stack.
- Gave the active chart a 520px minimum section height and resized the p5 canvas after the tour layout settles.
- Prevented direct `#tour/<step-id>` routes from being overwritten by ordinary chart hashes.
- Preserved hidden annotations between Previous and Next, while resetting them only when a new tour starts.
- Removed the duplicate chart-toolbar annotation control during a tour.
- Returned the scroll position to the top when each new story chart opens.

Chrome verification at 1119 × 527: the canvas rendered between 388px and 419px tall across all seven steps, every tour hash remained correct, one annotation control was shown, and Finish story returned to `#overview`. At 390 × 844 the page had no horizontal overflow and used a bounded mobile chart height. The browser suite passed 44/44. Added `feature-guided-tour-short-viewport-fixed.png` to the Finals evidence folder.

### Dwelling-tenure annotation correction

- Moved the “Read as tenure” badge into unused top-right whitespace on wide charts.
- Omitted the duplicate badge on canvases narrower than 720px, where the written limitation remains visible below the bars.
- Increased the mobile tour chart section to 620px so the limitation note no longer overlaps the White row or percentage axis.
- Verified in Chrome at 1920 × 937 and 390 × 844 with no label, legend, bar, or horizontal-overflow collision.

### Top-10 reference annotation correction

- Separated the dashed 10% reference line from its explanatory badge.
- Moved the badge into unused top-right whitespace on wide charts so it no longer covers the population-share bar or its 10.0% value.
- Kept only the dashed line on compact charts, where the bar and value already identify the 10% reference.
- Verified in Chrome at 1920 × 937 and 390 × 844 with the 10.0% label fully visible and no horizontal overflow.

## 25 August 2026 — Compact story rail and complete annotation audit

- Moved the guided narrative and controls above the active chart in a compact rail.
- Removed forced scroll-to-top calls and the delayed duplicate canvas resize; each step now performs one animation-frame resize and temporarily guards the navigation buttons against double activation.
- At 1600 × 900 and 1920 × 937, the story rail and chart fit the main viewport without vertical overflow. At 1119 × 527, the short-height fallback keeps all story controls visible above a scrollable chart.
- Split reference-line drawing from annotation badges so narrow layouts can retain useful thresholds without duplicate explanatory boxes.
- Audited all seven story charts in Chrome at 1920 × 937, 1600 × 900, 1119 × 527, and 390 × 844.
- Corrected mobile Gini, income-share, earnings, land, and poverty annotations; dwelling tenure and top-10 concentration retained their already-correct compact behavior.

### Verification and evidence

- Chrome browser suite: 44/44 passed.
- All source JavaScript passed `node --check`.
- `npm run build` and `git diff --check` passed.
- Added five final Chrome captures to the requested Finals `1-Picture Evidence` folder: compact desktop rail, corrected mobile income, land and poverty charts, and corrected desktop earnings callout.

## Complete implementation and picture-evidence index — 25 August 2026

This section consolidates every change in the current 20-file implementation so the code, verification, and pictures can be reviewed from one place.

| Area | Source files | Implemented change | Picture evidence |
| --- | --- | --- | --- |
| Shared interaction | `src/helper-functions.js`, `src/sketch.js` | Shared tooltips, line-chart crosshairs, annotation helpers, 3× PNG export, and cleaned CSV export | `feature-interaction-gini-tooltip.png`, `feature-interaction-deep-link-export.png` |
| Navigation and sharing | `index.html`, `src/gallery.js`, `style.css` | Chart hash routes, tour routes, comparison routes, responsive controls, and two live comparison panes | `feature-interaction-deep-link-export.png`, `feature-interaction-comparison-desktop.png`, `feature-interaction-comparison-mobile.png` |
| Survey exploration | Six files under `src/visualizations/survey/` | Exact values/sample counts on survey charts and export-ready derived rows | `feature-interaction-survey-waffle.png` |
| Guided story | `index.html`, `src/gallery.js`, `style.css` | Seven-step narrative, progress, Previous/Next/Finish, Exit, source text, and annotation toggle | `feature-guided-tour-compact-rail.png`, `feature-guided-tour-gini.png` |
| Story performance/layout | `src/gallery.js`, `style.css` | Compact rail above chart, one animation-frame resize, double-activation guard, no forced scroll reset, and short-height fallback | `before-guided-story-below-chart.png` → `feature-guided-tour-compact-rail.png`; `feature-guided-tour-short-viewport-fixed.png` |
| Inequality annotations | Seven files under `src/visualizations/inequality/` | Chart-specific reference lines, callouts, compact mobile rules, direct values, and collision-free spacing | All `feature-guided-tour-*-fixed.png` pictures listed in the Finals evidence README |
| Automated checks | `src/topic8-testing.js` | CSV escaping, export-data, comparison/hash, seven-step tour, and annotation-default tests | Browser console result recorded as 44/44 passing in `evidence-log.md` |

### Recorded before/after issue evidence

- `before-guided-story-below-chart.png` → `feature-guided-tour-compact-rail.png`
- `before-dwelling-annotation-overlap.png` → `feature-guided-tour-dwelling-callout-fixed.png`
- `before-top-ten-annotation-overlap-crop.png` and `before-top-ten-annotation-layout.png` → `feature-guided-tour-top-ten-reference-fixed.png`

The four `before-*` files are the original screenshots supplied during debugging. The `feature-*` files are live Chrome captures of the implemented state; none are recreated mockups.

## 26 August 2026 — Distraction-free presentation Story Mode

- Replaced the dashboard-like tour layout with a full-width, chart-first presentation state.
- Hid the sidebar, page heading, About/export/comparison toolbar, and duplicate chart source only while Story Mode is active.
- Shortened all seven story narratives to one-sentence takeaways and moved the source into a single subdued footer.
- Added Left Arrow, Right Arrow, and Escape shortcuts while retaining visible Previous, Next/Finish, annotations, and Exit controls.
- Added automated checks for concise story copy, coordinated presentation classes, and keyboard navigation.
- Added [`story-mode-presentation-layout.svg`](evidence/story-mode-presentation-layout.svg), clearly labelled as a layout diagram rather than a screenshot.

Verification: JavaScript syntax checks, `npm run build`, served-markup inspection, and `git diff --check` passed. A live browser screenshot was not claimed because the browser runtime was unavailable.
