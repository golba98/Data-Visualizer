# Testing Log - Round 2 UI Usability

**Date/Time**: 2026-08-05 14:15:00 (+02:00)

## Section Selector Tests
- **Test 1**: Overview tab can be selected.
  - Expected: Shows Overview section content; hides chart view.
  - Actual: Overview section is displayed, active tab is `Overview`.
  - Result: PASS
- **Test 2**: Inequality tab can be selected.
  - Expected: Displays 7 inequality chart links; hides other section links.
  - Actual: `National inequality`, `Population earnings`, etc. rendered.
  - Result: PASS
- **Test 3**: Survey tab can be selected.
  - Expected: Displays 6 survey chart links; hides other section links.
  - Actual: `Pressure index`, `Cost pressure mix`, etc. rendered.
  - Result: PASS
- **Test 4**: Archive tab can be selected.
  - Expected: Displays 6 archive chart links; hides other section links.
  - Actual: `Population by census`, `Population by sex & age`, etc. rendered.
  - Result: PASS
- **Test 5**: Inactive section links cannot receive keyboard focus.
  - Expected: Hidden section links are omitted from DOM / not focusable.
  - Actual: Only active section links exist in the DOM list.
  - Result: PASS

## Chart Navigation Tests
- **Test 6**: Selecting a chart loads the chart and updates active section tab.
  - Expected: Chart renders into p5 canvas, parent section tab becomes active, link gets `aria-current="page"`.
  - Actual: Parent section selected automatically, chart title and source displayed cleanly.
  - Result: PASS
- **Test 7**: Topic 8 automated test suite compatibility (`window.cm1010Testing.runAll()`).
  - Expected: All unit and integration test assertions pass.
  - Actual: `formatThousands`, `sum`, `mean`, `PieChart.get_radians`, `SurveyPressureIndex`, and `getCatalogueItem` tests pass cleanly.
  - Result: PASS

## "About this chart" Panel Tests
- **Test 8**: Panel is closed by default.
  - Expected: `#info-panel` has `hidden` attribute on initial chart load; chart card uses 100% layout width.
  - Actual: Panel hidden by default; canvas fills main container.
  - Result: PASS
- **Test 9**: "About this chart" toggle button opens/closes panel.
  - Expected: Clicking toggle opens panel, updates `aria-expanded="true"`, triggers canvas resize.
  - Actual: Panel opens, `aria-expanded` updates, canvas resizes smoothly.
  - Result: PASS
- **Test 10**: Close button (`&times;`) and Escape key close panel.
  - Expected: Clicking close button or pressing `Escape` hides panel and updates `aria-expanded="false"`.
  - Actual: Panel closes cleanly on Escape or close button click.
  - Result: PASS
- **Test 11**: De-duplicated title inside panel.
  - Expected: `#info-title` displays "About this chart" instead of repeating full chart title.
  - Actual: `#info-title` reads "About this chart".
  - Result: PASS
- **Test 12**: No raw CSV file paths in visible interface text.
  - Expected: `#info-source` and `#chart-source` display clean public attributions without `data/...` paths.
  - Actual: All `data/inequality/...` and `data/archive/...` paths removed from visible UI text.
  - Result: PASS

## Evidence Pictures & Log Files
All visual evidence and test output logs are saved in [`documentation/evidence/`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/):
- **Live UI Screenshots (Captured with Google Chrome)**:
  - [`12-compact-section-selector.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/12-compact-section-selector.png): 4-button compact section switcher (`Overview`, `Inequality`, `Survey`, `Archive`)
  - [`13-inequality-chart-list.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/13-inequality-chart-list.png): Filtered chart link list for selected section
  - [`14-active-chart-state.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/14-active-chart-state.png): Active chart selection highlight
  - [`15-chart-full-width.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/15-chart-full-width.png): Full 100% width chart card layout
  - [`16-about-chart-closed.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/16-about-chart-closed.png): Chart header with "About this chart" toggle button (closed)
  - [`17-about-chart-open.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/17-about-chart-open.png): Collapsible "About this chart" panel (open state)
  - [`18-clean-source-text.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/18-clean-source-text.png): Clean public source text without internal CSV paths
  - [`19-mobile-section-selector.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/19-mobile-section-selector.png): Mobile overlay drawer with 4 section buttons (390x844)
  - [`20-keyboard-focus-state.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/20-keyboard-focus-state.png): Focus outline state (`outline: 2px solid #3b82f6`)
  - [`21-production-build-success.png`](file:///home/k9-vortex/Development/1-JavaScript(Type)/20-Data%20Visualization/documentation/evidence/21-production-build-success.png): Production build preview verification
- **System Test Screenshots**:
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
