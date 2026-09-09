# Development Evidence: Midterm to Final

Every claim in this document was checked against the Git history with `git log`,
`git show` and `git diff`, not against comments or README prose. Where a number is
quoted, the command that produces it is given.

```
                    MIDTERM
                       |
                       |   Sep 1  52d7ad3   mobile, build, survey honesty
                       |   Sep 5  713fb6b   transformation refactor, tests
                       |   Sep 9  4fa8efd   lifecycle standardisation
     POST-MIDTERM      |
     TECHNICAL         |   Sep 9  c463da1   accessible insight summaries
     DEVELOPMENT       |   Sep 9  b2fcc37   size legends, chart interpretation
                       |   Sep 9  735e349   survey validation, denominators
                       |   Sep 9  7f40e52   reset, comparison mode
                       |   Sep 9  96b7688   test expansion
                       |   Sep 9  cdae6e6   responsive fixes
                       v
                     FINAL
```

## Where the midterm line is drawn

**This boundary is an assumption and should be confirmed before submission.** It is placed
after `12a2d07` (28 Aug 2026), the last commit before the three-commit quality run that
began on 1 September. The reasoning is that `52d7ad3`, `713fb6b` and `4fa8efd` are
corrective and structural rather than feature work — they repair mobile layout, rework
transformations, and standardise the lifecycle across all 19 charts.

If the real submission point differs, only the "Already present at the midterm" section
below needs moving; nothing else in this document depends on it.

---

## A. Already present at the midterm — not claimed as final work

All of the following existed at `12a2d07` and are **not** new work:

| Feature | Evidence |
| :-- | :-- |
| 19 registered visualisations across 3 sections | `git show 12a2d07:src/sketch.js` |
| `Gallery` object with catalogue, sidebar, tabbed sections | `git show 12a2d07:src/gallery.js` |
| Constructor-function visualisations with `preload/setup/draw/destroy` | `#17`, `#21` |
| Story Mode (guided tour, 7 steps, arrow-key and Escape handling) | `#22` `0099551`, `#23` `3a7b1ee` |
| Comparison Mode (two iframe panes, dropdown selection) | `#21` `8668056` |
| Dark design system, sidebar navigation, overview cards | `#9`–`#21` |
| Hover tooltips, animated pie transitions, PNG and CSV export | `#20` `2b9d244` |
| Real 48-response survey dataset and the six survey charts | `#23` `3a7b1ee` |
| `topic8-testing.js` browser harness | `#18` `b09fe05` |
| SVG logo and favicon | `#24` `12a2d07` |

At that point the browser suite had **50 `t.test` call sites** and the data suite had
**5 tests**:

```bash
git show 12a2d07:src/topic8-testing.js | grep -c 't\.test('
git show 12a2d07:scripts/prepare-survey-data.test.mjs | grep -c '^test('
```

---

## B. Post-midterm work completed before this branch

Three commits, all verifiable with `git show --stat`.

### `52d7ad3` — mobile layout, production build, survey honesty (1 Sep, 38 files, +1122/−855)

- Shared breakpoint helpers replacing six inconsistent width thresholds
- Tooltip stuck after a tap (missing `touchEnded`), tooltip under the fingertip
- Canvas rendering 55px wide when hidden; content drawn outside the canvas
- Touch targets raised to 44px; `dvh`, safe-area insets, `prefers-reduced-motion`
- Added `vite.config.js`: no config existed, so Vite never pulled the classic
  `<script src>` files into its graph and `dist/` referenced files that did not exist
- Dropped `generatedRows`/`unverifiedRows`, which had mislabelled 47 of 48 real
  responses as synthetic

### `713fb6b` — transformation refactor and test expansion (5 Sep, 34 files, +1299/−1041)

- Delimiter-based parsing replacing fragile substring matching
- Deterministic largest-remainder waffle allocation with a stable tie-break
- Browser suite **50 → 71** `t.test` call sites

### `4fa8efd` — lifecycle standardisation (9 Sep, 26 files, +816/−438)

- `VisualizationLoadState` introduced in `src/helper-functions.js`, absent before this
  commit (`git show 52d7ad3:src/helper-functions.js | grep -c VisualizationLoadState`
  returns 0)
- `loading` / `ready` / `error` states applied uniformly to all 19 charts
- `role="alert"` / `aria-live` wiring for load status
- Browser suite **71 → 82** `t.test` call sites

---

## C. This branch — `feature/final-accessibility-improvements`

Six commits, 20 files, **+3132 / −124**.

```bash
git diff --stat main..HEAD
```

---

### C1. Accessible textual insight summaries

**Problem.** Every chart's main result could only be obtained by hovering with a mouse,
distinguishing colours, or interpreting geometry. The one piece of prose per chart was the
catalogue's hard-coded `finding` field, and for all six survey charts that field was the
same generic string, `SurveyData.note`. Nothing was computed from the data.

**Reason.** A hover-only chart excludes keyboard users, screen-reader users, touch users
on small screens, and anyone who cannot separate the colours. Hard-coded prose also drifts:
`za-gini-trend.js` painted `'Peak: 0.65'` and the year `2005` as literals, so the annotation
would have been silently wrong if the dataset changed.

**Implementation.** Three layers, deliberately separated:

```
data calculation  -> stays inside each visualisation (countBurden, calculateIndex, ...)
summary model     -> src/chart-insights.js, one builder per visualisation
summary rendering -> src/chart-summary.js, writes into the existing DOM hooks
```

`ChartInsights.build(vis)` returns `null` rather than emit a sentence containing `NaN`,
`undefined` or `Infinity`, and a builder that throws is contained rather than breaking the
page. Rendering is driven from `draw()` through a cheap key (`id | load status | manifest
status | control state`), so it rebuilds when state changes and does nothing otherwise.

`index.html` already contained the markup for these sections in the working tree, unstyled
and referenced by no JavaScript. This branch wires it up.

**Files.** `src/chart-insights.js` (new, 1095 lines), `src/chart-summary.js` (new, 355),
`src/gallery.js`, `src/sketch.js`, `index.html`, `style.css`.

**Testing.** `unit: ChartInsights summary models` and `unit: SummaryStats guards` in
`src/topic8-testing.js`: every registered chart has a builder; insights contain no
non-finite text; quoted figures stay inside the source range; empty, unloaded and failed
states produce no summary rather than a broken one.

**Course topic.** Topic 1 object orientation — a registry of builders composed onto the
existing visualisation interface through optional hooks, adding no requirement to the
contract that `Gallery.addVisual` validates. Accessibility — information available without
hover, colour or a pointing device.

**Evidence.** `c463da1`

---

### C2. Data provenance

**Problem.** `data/inequality/za_dashboard_sources.csv` is a complete provenance manifest —
source, URL, period, data status, limitations — for all ten datasets. Nothing loaded it.
Every inequality CSV also carries the same columns per row, equally unread.

**Reason.** Provenance that is computed from a manifest cannot contradict the data; provenance
retyped into prose can.

**Implementation.** `DataProvenance` loads the manifest once at sketch setup and keys it by
data filename. The rendered list gives Source, Period, Unit, rows or responses used,
Transformation and Limitation. Failure to load is non-fatal: the section stays hidden.

While wiring this up, the manifest's own survey row recorded its limitation as
`"Real survey data."` and its status as `"48 survey rows"` — neither is a limitation or a
status. Replaced with the actual limitation: a self-selected convenience sample of 48.

**Files.** `src/chart-summary.js`, `data/inequality/za_dashboard_sources.csv`.

**Course topic.** Parsing and data processing.

**Evidence.** `c463da1`

---

### C3. Size legends and chart interpretation

**Problem.** Four encodings could not be read from the chart at all:

| Chart | Encoding | What existed |
| :-- | :-- | :-- |
| `sa-age-sex-bubble-2022` | circle width = population | the sentence "Bigger circles = larger age groups" |
| `survey-food-transport-burden` | circle width = respondents | nothing |
| `survey-cutback-heatmap` | alpha = count | a five-step ramp with no numbers on it |
| `climate-change` | background colour = anomaly | nothing |

Two further charts use colour purely as a highlight — the highest-earning group, the largest
landholder — with nothing saying so, which invites reading it as a category.

**Reason.** A size or colour encoding without a key is unreadable; a highlight mistaken for
a category is actively misleading.

**Implementation.** `drawSizeLegend` takes the caller's own mapping function rather than
re-deriving one, so a key cannot disagree with the marks it explains. `sizeLegendValues`
picks representative values from the real data range instead of inventing round numbers.
`drawColourRampKey` renders a ramp with its actual numeric end points. The burden chart
reserves header height for its key before computing cell geometry, so the key cannot
overlap the grid, and skips it on phone-width and short canvases where "How to read this
chart" still explains the encoding. The two highlight charts state the meaning in their
existing note lines — prose, because it also works for a reader who cannot separate the
colours.

"How to read this chart" text was added only where the encoding is genuinely non-obvious:
the gauge, the bubble grid, the alpha heatmap, the dumbbell, the bubble scatter and the
colour ramp. Simple bar and line charts got none.

**Files.** `src/helper-functions.js` (+180), the six charts listed above.

**Testing.** `unit: size legend values` — legend values stay inside the data domain, a flat
range collapses to one value rather than repeating, and the legend uses the chart's own
mapping.

**Course topic.** Accessibility and data visualisation practice.

**Evidence.** `b2fcc37`

---

### C4. Accessible data-table alternatives

**Problem.** No chart offered a non-graphical view of its data. `getExportData()` existed
for CSV download, but for the six survey charts it returns the raw 48-row response table,
which is not what those charts draw.

**Implementation.** Each builder supplies a chart-shaped, aggregated table model — the 5×5
burden grid, the cutback cross-tabulation, the pressure components — rather than raw rows.
Where the chart genuinely draws its source rows, the generic path reuses the existing
`getVisualExportData()`. Rendering produces `<caption>`, `<thead>`, `<th scope="col">`,
`<tbody>` and `<th scope="row">` on the identifying column, inside the native
`<details>`/`<summary>` disclosure already present in the markup. Large tables are capped at
60 rows with the cap stated in the caption and a pointer to Download CSV.

**Files.** `src/chart-insights.js`, `src/chart-summary.js`, `style.css`, `index.html`.

**Testing.** `unit: data table models` — row counts match the aggregate the chart draws,
group totals reconcile with the responses counted, every column key resolves in every row.
`integration: accessible summary rendering` — caption present, column and row headers
scoped, disclosure keyboard-operable and reporting its expanded state, and cleared between
charts.

**Course topic.** Accessibility, semantic HTML, responsive web design.

**Evidence.** `c463da1`, `cdae6e6`

---

### C5. Survey preprocessing validation

**Problem.** `prepare-survey-data.mjs` checked that required *columns* existed and nothing
else. Every category value passed through verbatim, so a typo'd band reached the published
CSV and was then silently dropped by one chart or given a fallback weight by another, with
no error anywhere.

**Reason.** Silent corruption is worse than a failed run: the site keeps drawing plausible
charts from wrong data.

**Implementation.** `SURVEY_SCHEMA` is the single source of truth for valid values, checked
against all 48 real responses so no legitimate export breaks. `prepareRows` returns
`{ rows, metadata, issues }` and distinguishes what went wrong:

```
missing-required-value   invalid-category      invalid-number
out-of-range             invalid-cut-back-on   unknown-cutback-token
invalid-timestamp
```

Strict mode (the default) throws naming the row, field and value. `--lenient` quarantines
the record and counts it in `metadata.excludedRows`. Unknown `cut_back_on` *options* are
dropped and reported without discarding the whole record, because it is an optional
multi-select — the required/optional distinction the brief asks for.

Further defects fixed in the same commit:

- A blank `cut_back_on` threw via `JSON.parse('')` while `"5"` and `null` silently became an
  empty string. An empty multi-select is now a valid answer; non-array JSON is an error.
- Ratings are integer-checked before `Number()`, so `"3abc"` cannot become 3.
- `latestTimestamp` was a lexicographic maximum over unfiltered rows; it is now
  format-checked and taken over valid rows only.
- Empty input produces `n=0`, never `NaN` or `undefined`.
- `--output`/`--config` added; the tool previously overwrote its own default input path.

Two browser-side denominator defects, both masked by the current data:

- `survey-pressure-index` scored an unrecognised band `0.25`, **higher** than the cheapest
  real band (`R0-R500` = 0.15), so invalid data read as more pressured than the
  least-pressured real respondent. `validRows` was also incremented unconditionally, so no
  row was ever rejected. Scores now return `null` and the row is excluded. **The published
  index is unchanged at 71, with 48 valid rows and 0 skipped** — this is hardening, not a
  change to the result.
- `survey-pressure-waffle` allocated 100 squares from `validTotal` but computed legend and
  tooltip percentages from every row. Both now use `validTotal`.

**Files.** `scripts/prepare-survey-data.mjs` (+314/−71),
`src/visualizations/survey/survey-pressure-index.js`, `survey-pressure-waffle.js`.

**Course topic.** Parsing and data processing — CSV parsing, defensive validation,
malformed input.

**Evidence.** `735e349`

---

### C6. Test expansion

**Problem.** The data suite had 4 tests and covered no category, numeric, boundary or
edge-case behaviour. `parseCsv` had no direct tests at all. The browser fixture at
`topic8-testing.js:172` still carried an `id` column the pipeline had stopped publishing and
omitted `cut_back_on`, so tests ran against a schema the app no longer emits.

**Implementation.** `npm run test:data` **4 → 31** tests, same `node:test` +
`node:assert/strict` style, no new framework. Browser suite **82 → 107** `t.test` call sites
(**125 executed**, because several call sites sit inside loops over the registered charts),
same `TestRunner` harness and `makeTable` fixture pattern.

Two real defects were found by writing these tests and fixed in the preceding commits:

1. JSON `null` in `cut_back_on` collided with the error sentinel in the validator and was
   accepted as an empty selection.
2. `survey-food-transport-burden` mapped counts with `map(count, 1, maxCount, ...)`, so a
   dataset in which every food/transport combination is unique gave `maxCount` of 1, every
   diameter became `NaN`, and **no bubbles drew at all**.

**Course topic.** Topic 8 testing — unit tests for transformations, interface tests,
integration tests over the rendered DOM.

**Evidence.** `96b7688`, and the two fixes in `735e349` and `7f40e52`

---

### C7. Reset and comparison-mode usability

**Problem.** `climate-change` has two coupled year sliders with no way back to the full
range. Comparison Mode headed its panes with the literal strings `"Chart 1"`/`"Chart 2"`, so
the chosen chart's name appeared nowhere except inside the dropdown; it had no keyboard exit
and no summary.

**Implementation.** `resetControls()` is an optional hook, so "Reset view" is rendered only
for a chart that defines one — exactly one chart does.
`sa-population-group-census` deliberately gets no button: a single `<select>` already shows
its own state and resets when the chart is reselected.

Comparison Mode keeps its two-pane design. N is fixed at 2 in three places by construction,
so chips, clear-all and a maximum limit do not apply and were not built. Four small changes:
panes name their chart, a textual summary states both results by reusing the insight
builders, Escape exits to match Story Mode and the About panel, and Reset comparison returns
the default pair.

**Testing.** `unit: reset restores documented defaults`, plus manual verification: sliders
set to 1950–1980 return to 1880–2025; the button appears on `climate-change` and on no other
chart; Escape leaves comparison mode; reset restores the default pair.

**Course topic.** Accessibility — keyboard operation and state recovery.

**Evidence.** `7f40e52`

---

### C8. Responsive and focus fixes

**Problem.** Found while checking 320 / 390 / 768 / 1024 / 1366 / 1920 px. The table caption
sat inside the horizontally scrolling container, inherited the table's width, and was clipped
rather than wrapping at narrow widths. On a 768px-tall window the insight strip took ~120px
from a canvas that only had ~500. Separately, `style.css` had **no `:focus-visible` rule
anywhere**, and four existing rules set `outline: none` on `:focus` without restoring
anything, so keyboard focus was signalled only by a 1px border colour change.

**Implementation.** The `<caption>` is kept as the table's accessible name but visually
hidden, with the same text repeated as a wrapping paragraph outside the scroll area, marked
`aria-hidden` so it is not announced twice. The insight strip tightens below 820px of
viewport height — the caveat is shortened, never dropped, because it carries the sample-size
honesty. A `:focus-visible` ring was added using `--border-focus`, which was declared at
`style.css:8` and never used.

**Course topic.** Responsive web design, accessibility.

**Evidence.** `cdae6e6`, `c463da1`

---

## D. Summary by category

| | |
| :-- | :-- |
| **Already existed** | 19 charts, Gallery, Story Mode, Comparison Mode, dark design system, tooltips, PNG/CSV export, survey dataset, browser test harness |
| **Refactored** | Survey preprocessing rewritten around a schema; pressure-index scoring rewritten to reject rather than substitute; waffle percentages moved onto the grid's own denominator |
| **Improved** | Comparison Mode pane labelling, keyboard exit and summary; heatmap and climate colour keys quantified; earnings and land colour meaning stated; table caption wrapping; short-viewport layout; keyboard focus visibility; the survey row of the provenance manifest |
| **New** | Computed insight summaries for all 19 charts; "How to read this chart" for 6; semantic data tables for all 19; provenance lists driven by the manifest; two size legends; `SURVEY_SCHEMA` validation with typed issues; reset control; 27 new data tests and 25 new browser tests; this document and the user-testing protocol |

---

## E. Test results

Run on 9 September 2026 at the tip of this branch.

| Command | Result |
| :-- | :-- |
| `npm run test:data` | **31 passed, 0 failed** |
| `index.html?test=1` | **125 passed, 0 failed** |
| `npm run build` | succeeds; `dist/` carries `src`, `data`, `lib`, `assets` |

`npm run lint`, `npm run test:layout` and `npm run test:browser` **do not exist** in this
project. `test:data` is the only scriptable test command; the browser suite runs by opening
`index.html?test=1` and reading the console.

---

## F. Remaining weaknesses

Stated plainly, because they are real.

1. **The browser suite is not scriptable.** 125 tests require a human to open a URL and read
   the console. There is no CI, and no npm script can fail on them. Automating this needs a
   headless runner the project does not have.
2. **No linting.** `.eslintrc` is listed in `.gitignore` but no config exists. Style is held
   by convention only.
3. **The canvas is still not keyboard-navigable.** The summaries and tables give a
   non-pointer route to the *headline* result and to the underlying numbers, but individual
   marks cannot be focused or read one at a time. A full solution would need focusable
   off-screen elements per mark.
4. **The insight sentences are English-only and hand-written per chart.** 19 builders is a
   lot of prose to keep correct; a data change that alters a superlative will change the
   sentence correctly, but a change to what the chart *means* will not.
5. **The survey remains 48 self-selected responses.** Validation makes the pipeline
   trustworthy; it does not make the sample representative. Several status groups have fewer
   than 10 respondents. The caveats say so, but the charts still draw those groups at full
   bar width.
6. **`R0-R500` and the `Electricity` cutback have no respondents at all**, so those rows are
   permanently empty. This is now explained in the caveat text rather than fixed, because
   they are real survey options.
7. **Two charts still have hard-coded axis bounds** — the Gini axis is pinned to 0.50–0.70
   and the bubble chart's to 45–75%. The "How to read" text now discloses this, but the axes
   would still mislead if the data moved outside those ranges.
8. **Comparison Mode still reloads both iframes** when either dropdown changes, so changing
   the left chart re-renders the right one. Fixing this means restructuring the iframe
   approach, which was out of scope.
9. **`prefers-contrast` and light mode are unsupported.** `color-scheme` is hard-coded to
   dark.
10. **The user testing has not been run.** `USER_TESTING_PROTOCOL.md` is a blank instrument.
    No participant, quote, timing or finding exists yet, and none should be written into this
    document until real sessions have happened.
