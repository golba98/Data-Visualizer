# South African Inequality Explained

A data story about inequality in South Africa, built with p5.js.

It brings together official statistics and a small original survey to look at income, wealth,
earnings, housing, land, poverty, and the everyday money pressure people feel. Nineteen charts
are grouped into three sections, and each one states its main result in plain text so the story
can be followed without reading a single axis.

**Contents**

- [Quick start](#quick-start)
- [Using the site](#using-the-site)
- [The charts](#the-charts)
- [Data and method](#data-and-method)
- [What it shows](#what-it-shows)
- [Limits](#limits)
- [How the code is organised](#how-the-code-is-organised)
- [Testing](#testing)
- [Coursework evidence: object orientation](#coursework-evidence-object-orientation)

## Quick start

Install the dependencies and start the dev server:

```bash
npm install
npm run dev
```

To build the production bundle and preview it:

```bash
npm run build
npm run start
```

There is also a script for refreshing the survey data from a new Survey App export:

```bash
# Validate a raw export and publish it to data/survey/
npm run data:survey -- --input raw_export.csv

# Same, but drop bad rows instead of stopping at the first one
npm run data:survey -- --input raw.csv --lenient
```

## Using the site

**Every chart can be read without a mouse.** Above each canvas is a sentence stating that
chart's main result, computed from the chart's own data rather than written by hand. The
`About this chart` panel adds three things: how to read the encoding where it is not obvious,
where the data came from, and a data table containing the same numbers the chart draws.

**URL options.** Add any of these to the address to change what loads:

| Flag | What it does |
| --- | --- |
| `?vis=<id>` | Opens one chart |
| `?section=<id>` | Opens one menu section |
| `?about=1` | Opens the chart notes panel |
| `?embedded=1` | Opens one chart without the app shell |
| `?test=1` | Runs the browser test suite |
| `?debug=1` | Shows debug logs in the console |
| `?failData=1` | Simulates a data loading failure, to test error states |

## The charts

Nineteen charts in three sections, named as they appear in the menu.

**Inequality** (official data)

- **National inequality** — the Gini coefficient over time.
- **Population earnings** — population share compared with average pay.
- **Dwelling ownership** — owned, rented, and rent-free homes.
- **Land ownership** — individual farm and agricultural land ownership.
- **Top income share** — the top 10 percent's share of pre-tax income.
- **Top 10 concentration** — income share compared with wealth share.
- **Poverty indicators** — poverty rates over time.

**Survey**

- **Pressure index** — a project pressure score out of 100.
- **Cost pressure mix** — the main money worry.
- **Food & transport** — monthly cost bands compared.
- **What gets cut** — spending cuts when money is tight.
- **Worry vs. income** — work worry compared with income pressure.
- **Pressure by status** — each employment group compared.

**Archive** (earlier drafts)

- Population by census
- Population by sex & age
- Age group & female share
- Youth unemployment
- Life expectancy
- Global temperature

## Data and method

**Research question:** how can data help explain inequality in South Africa?

South Africa has major gaps in income, wealth, housing, and land. Each chart shows one part of
that wider picture. Note that the Stats SA population groups used throughout are official
statistical categories, not biological ones.

**How the data was gathered:**

- Official data from WID World, the World Bank, Our World in Data, Stats SA, and the 2017 Land
  Audit.
- A 48-response survey, exported from [Survey App](https://surveyapp.ink/) and shared through
  friends, family, Reddit, Facebook, and Instagram.
- Cleaned chart files live in `data/inequality/`, `data/survey/`, and `data/archive/`.
- p5.js draws the charts and powers the site.

### Sources

| File | Source | URL | Period | Notes |
| --- | --- | --- | --- | --- |
| `data/inequality/za_gini_trend.csv` | World Bank PIP via OWID | https://ourworldindata.org/grapher/economic-inequality-gini-index | 1993-2022 | Results can differ by survey method |
| `data/inequality/za_population_group_shares.csv` | Stats SA local cleaned file | Local file | 2022 | Official statistical groups |
| `data/inequality/za_population_group_earnings.csv` | Stats SA | https://www.statssa.gov.za/?p=12930 | 2011-2015 | Earnings are not total wealth |
| `data/inequality/za_dwelling_ownership_by_group.csv` | Stats SA GHS 2024 Table 8.6 | https://www.statssa.gov.za/publications/P0318/P03182024.pdf | 2024 | Household tenure, not total property wealth |
| `data/inequality/za_land_ownership_by_group.csv` | Land Audit Report | https://www.gov.za/sites/default/files/gcis_document/201802/landauditreport13feb2018.pdf | 2017 | Farms and agricultural holdings only |
| `data/inequality/za_income_distribution.csv` | WID World via OWID | https://ourworldindata.org/grapher/income-share-top-10-before-tax-wid | 1993-2014 | Pre-tax income |
| `data/inequality/za_wealth_distribution.csv` | WID World via OWID | https://ourworldindata.org/grapher/wealth-share-richest-10-percent | 1993-2024 | Some values are modelled |
| `data/inequality/za_population_groups.csv` | Local derived file | Local file | Not a time series | Top 10, middle 40, and bottom 50 groups |
| `data/inequality/za_poverty_indicators.csv` | World Bank PIP, OWID, and Stats SA | https://ourworldindata.org/grapher/relative-poverty-share-of-people-below-50-of-the-median and https://www.statssa.gov.za/?p=19078 | 1993-2023 | Measures use different definitions |
| `data/survey/za_survey_responses.csv` | Survey App export | https://surveyapp.ink/ | Through 2026-08-25 | 48 real survey rows |
| `data/inequality/za_dashboard_sources.csv` | Local source register | Local file | Project notes | Sources and limits |

### About the survey data

The survey holds 48 real Survey App responses. Private fields — `ip_hash`, `user_agent`,
`timestamp`, and `comment` — were removed before the data was published. The free-text
`cut_back_on` answers were standardised and checked by hand.

## What it shows

- Inequality is clear when population, income, and wealth shares are compared side by side.
- National figures point to wider structural inequality.
- Official data shows gaps in earnings, housing, and land.
- Survey data connects those gaps to daily money pressure.

## Limits

- Sources measure things in different ways.
- Charts simplify complex social and economic issues.
- Some income and wealth estimates are modelled.
- Housing data measures tenure, not full property wealth.
- Land data covers individual farms and agricultural holdings only.
- Datasets use different years.

## How the code is organised

`index.html` loads p5.js, the chart files, and `src/sketch.js`, which registers every
visualisation. `src/gallery.js` controls chart titles, menu items, source notes, and sections.
Each chart loads its CSV with `loadTable()` and draws onto a responsive canvas.

```text
index.html            Entry point; loads p5.js and the sketch
src/
  sketch.js           Registers all 19 visualisations with the gallery
  gallery.js          Menu, sections, titles, source notes, teardown
  visualizations/     One file per chart, grouped by section
    inequality/
    survey/
    archive/
  helper-functions.js Shared drawing, tooltip, annotation, and export helpers
  pie-chart.js        The PieChart object used by the census chart
  survey-data.js      Survey row count, chart label, and source note
  chart-insights.js   Works out each chart's main result from its data
  chart-summary.js    The plain-text result above each canvas
  topic8-testing.js   Browser test harness
data/                 Cleaned CSVs, grouped the same way as the charts
scripts/              Survey export validation and its unit tests
tests/browser/        Playwright specs: the browser suite, chart sizes, and phones
```

## Testing

```bash
npm run test:unit      # 31 data preprocessing tests (node --test)
npm run test:browser   # every Playwright spec below, desktop and phones
npm test               # both; exits non-zero if anything fails
```

`npm run test:browser` starts the dev server itself and runs:

| Spec | Runs on | Checks |
|---|---|---|
| `topic8-suite.spec.mjs` | Desktop Chrome | Opens `?test=1` and fails if any in-page test failed |
| `chart-sizes.spec.mjs` | Desktop Chrome | Every chart at every size the layouts can give it (260-390px wide by 360-480px tall, 400-800px by 280-380px, and desktop): all canvas text drawn, inside the canvas, without overlaps |
| `mobile-charts.spec.mjs` | 8 phones | Every chart: layout, canvas size, canvas text, annotations, controls, PNG/CSV downloads, About panel and data table, touch tooltips, rotation |
| `mobile-sections.spec.mjs` | 8 phones | Overview cards and Back, the navigation drawer, every guided story step, comparison pickers |
| `mobile-comparison.spec.mjs` | 8 phones | Both comparison panes show their chart at full height |

The phones are iPhone SE (3rd gen), iPhone 15, iPhone 15 Pro Max and iPhone 15 in landscape on WebKit (the
engine every iOS browser uses), and Galaxy S9+, Galaxy S24, Pixel 7 and Pixel 7 in landscape on
Chromium. Each spec's layout checks fail on sideways scrolling, tap targets under 44px, clipped
text and a canvas shown at a different size from the one it was drawn at. The canvas text checks
wrap p5's text renderer to find overlapping, off-canvas and silently dropped text.

Before the first run, install the browsers with `npx playwright install chromium webkit`. WebKit
needs Ubuntu's libraries; on other Linux distributions run the suite in Playwright's image:

```bash
podman run --rm --network host --userns=keep-id --security-opt label=disable \
  -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble npx playwright test
```

Add `--project=iphone-15` (or any name in `playwright.config.mjs`) to run one device.

The browser suite can also be run by hand: open `index.html?test=1` and read the console report.

Continuous integration runs both suites and the production build on every push and pull request
to `main`. It is defined in `.github/workflows/ci.yml`.

## Coursework evidence: object orientation

This section is the Topic 1 evidence for marking. It describes how the project uses objects, and
which parts were written for this submission.

The `Gallery` object controls registration, selection, and teardown. Each visualisation is
created with a JavaScript constructor function and owns its data, derived values, layout, and
drawing behaviour. The objects use a common behavioural interface: `preload()` loads data,
`setup()` prepares the chart, `draw()` renders it, and `destroy()` removes chart-owned state.
`onResize()` is an optional hook for charts with extra responsive work.

`VisualizationLoadState` is a reusable constructor-function object composed inside every
visualisation. It validates CSV tables and encapsulates the shared `loading`, `ready`, and
terminal `error` transitions. It also owns the canvas feedback and accessible live-region
message. Raw failures remain available through debug logging while visitors receive a concise
message.

Composition is also used where `SurveyPressureWaffle` contains a `Waffle`, a `Waffle` contains
`Box` objects, and `SAPopulationGroupCensus` contains a `PieChart`. These are cooperating
objects rather than an inheritance hierarchy.

```text
Gallery -> visualisation constructor -> preload / CSV loading
                                      -> loading -> ready
                                                 -> error
                                      -> setup -> draw -> onResize
                                                           -> destroy
```

| Coursework stage | Evidence |
| --- | --- |
| Already existed | Gallery and visualisation constructors, responsive drawing, Waffle/Box/PieChart composition, survey transformations, and the Topic 8 test harness. |
| Improved for final submission | All 19 registered charts now share validated load transitions, terminal error handling, accessible feedback, and lifecycle cleanup. |
| Newly added | `VisualizationLoadState`, constructor/interface coverage for every Gallery object, duplicate-ID and catalogue checks, and focused success/failure/cleanup tests. |

## Conclusion

This project uses official data and clearly labelled survey data to explain inequality in South
Africa.
