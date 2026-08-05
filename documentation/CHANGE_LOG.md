# Change Log - Round 2 UI Usability & Decluttering

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
