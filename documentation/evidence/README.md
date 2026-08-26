# Picture Evidence — Topic 8

**29 July 2026** · asynchronous programming, debugging, software testing

Five before/after pairs covering everything Topic 8 changed in the app.

| # | Change | Before | After |
| :-- | :-- | :-- | :-- |
| 01 | Number formatting with a missing value | `NaN ha` | `— ha` |
| 02 | Loading state | plain text only | text + progress bar |
| 03 | Failed data load | stuck loading forever | clear error message |
| 04 | Console in normal use | 63 log lines | silent |
| 05 | Automated tests | none existed | 38 passing |

---

## How these were captured

The Topic 8 work was set aside with `git stash push -u`, returning the working tree to the original code (`git status` clean). The before images were captured against that code, then `git stash pop` restored the changes and the after images were captured using identical steps, same viewport, same pages.

All images are unedited screenshots of the app running at `http://localhost:8877/index.html`.

## 26 August 2026 — Story Mode layout diagram

[`story-mode-presentation-layout.svg`](story-mode-presentation-layout.svg) is a simple explanatory diagram of the new distraction-free Story Mode: compact step information and controls, a large chart stage, and one source footer. It is visibly labelled **“Layout diagram — not a screenshot”** and is not included in the screenshot claims above.

---

## 01 · Number formatting

`01-number-formatting-before.png` → `01-number-formatting-after.png`

**Look at the small grey label under the "African" bar.**

| Before | After |
| :-- | :-- |
| `NaN ha` | `— ha` |

`za-land-ownership-by-group.js` builds this label as `formatThousands(row.hectares) + ' ha'`, and `hectares` comes from `table.getNum()`. A blank or non-numeric CSV cell makes `getNum()` return `NaN`.

**Reproduced by** setting the first row's `hectares` to `NaN` in memory — the same single step in both runs — rather than editing the dataset.

**Fixed by** making `formatThousands()` coerce with `Number()` and return an em dash for non-finite input, instead of letting `Math.round(NaN).toString()` produce the string `"NaN"`.

Found by the unit test *"invalid input falls back to an unavailable marker"*, which failed on the first run.

---

## 02 · Loading state

`02-loading-state-before.png` → `02-loading-state-after.png`

**Look at the middle of the white chart area.**

| Before | After |
| :-- | :-- |
| `Loading Gini data...` and nothing else | `Loading inequality data...` above a progress bar |

`ZAGiniTrend` went from a single `loaded` boolean to four explicit fields: `isLoading`, `isReady`, `loadError`, `loadProgress`. The bar is drawn from `loadProgress`.

p5.js 0.10.2's `loadTable()` exposes no byte-level progress event, so the bar shows the two states the loader genuinely knows about — requested and parsed — rather than an invented percentage.

---

## 03 · Failed data load

`03-load-failure-before.png` → `03-load-failure-after.png`

**The most important pair.**

| Before | After |
| :-- | :-- |
| Sits on `Loading Gini data...` **forever**. The user is never told anything went wrong. | `This chart is unavailable`<br>`This chart could not load its data. Check your connection and refresh the page.` |

The original code called `loadTable()` with a success callback only, so there was no error path at all — `loaded` simply stays `false` for the lifetime of the page.

**Reproduced by** temporarily renaming `data/inequality/za_gini_trend.csv` so the server returned 404, then renaming it straight back. `git status` confirmed the dataset was restored unchanged. The after image uses the built-in `?failData=1` flag, which exercises the same failure.

**Fixed by** passing an error callback. `handleDataError()` clears the table, sets `isReady` false, and sets `loadError` to a plain-English sentence that `drawLoadError()` renders. The underlying 404 goes only to `debugLog()`, so the raw error reaches the console only under `?debug=1` and never reaches the user.

---

## 04 · Console output

`04-console-output-before.txt` → `04-console-output-after.txt`

Identical steps both times: load the page with the network throttled to Slow 3G, then open "Global temperature anomaly" from the sidebar.

| Before | After |
| :-- | :-- |
| `Data not yet loaded` × 63 | no console messages |

The six archived visualisations had 10 unconditional `console.log('Data not yet loaded')` calls inside `draw()`, firing once per frame for as long as a CSV was in flight. They are now `debugLog()`, which returns early unless `?debug=1` is set — the diagnostics still exist, they just no longer reach a normal visitor.

> Text captures rather than screenshots: the DevTools panel could not be opened through the available browser-automation tools. See the Debugging evidence section of [`../evidence-log.md`](../evidence-log.md).

---

## 05 · Automated tests

`05-test-suite-before.txt` → `05-test-suite-after.txt`

| Before | After |
| :-- | :-- |
| No harness, no tests. `window.cm1010Testing` undefined, `?test=1` did nothing. | 38 tests across 10 suites — 30 unit, 8 integration. **38 passed, 0 failed.** |

On the **first** run this was 38 total, 37 passed, 1 failed. The failure was the `formatThousands` defect in pair 01, at test 6 of 38 — and all 32 later tests, across five further suites, still ran and reported before anything was corrected.

> Text capture, same reason as pair 04.

---

## Unchanged behaviour

The rest of the app is deliberately untouched. Screenshots confirming normal operation after the refactor — overview, Gini chart, census pie chart, loading and error states in their system-test context — are in [`../photos/topic8/`](../photos/topic8/).
