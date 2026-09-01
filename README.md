# South African Inequality, Explained

## Abstract / Summary

This is a data-story website I built about South African inequality. I wanted to see how inequality shows up when you compare population size against income, wealth, earnings by population group, dwelling tenure, land ownership, and everyday financial pressure.

The site has official inequality charts, a Survey App section, and an archive of earlier work.

## Run locally

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Or build and preview the application:

```bash
npm run build
npm run start
```

Two other scripts are available:

```bash
npm run data:survey   # rebuild src/survey-data.js from the survey CSV
npm run test:data     # run the survey data-preparation tests
```

## Query string options

Append these to the URL to change what the page does:

| Flag | Effect |
| --- | --- |
| `?test=1` | Runs the in-browser test suite (`src/topic8-testing.js`) on load and leaves the results in `window.cm1010TestResults`. |
| `?debug=1` | Turns on the `debugLog()` console output, which is silent otherwise. |
| `?failData=1` | Makes every CSV path point at a missing file, so the loading and error states can be checked. |
| `?embedded=1` | Chrome-free single-chart view. Used by the comparison panes. |
| `?vis=<id>` | Opens a specific chart, e.g. `?vis=za-gini-trend`. |
| `?section=<id>` | Opens a section of the menu. |
| `?about=1` | Opens the "About this chart" panel with the chart. |

## Research Question

How can data visualisation help explain South African inequality — income, wealth, population-group differences, dwelling tenure, land ownership, and everyday financial pressure?

## Background

South Africa has a well-known inequality problem, so I focused on money and related measures: income groups, wealth ownership, earnings by population group, dwelling tenure, land ownership, poverty, and survey responses about financial pressure.

Population-group labels here are the official statistical categories used by Stats SA — not biological categories. No single chart is meant to explain the whole inequality picture; each one covers a specific piece of the story.

## Methodology

I used:

- secondary data from credible sources: WID.world, the World Bank Poverty and Inequality Platform, Our World in Data, Statistics South Africa, and the 2017 Land Audit report
- a survey section for this project
- a sanitized 48-row Survey App export collected via https://surveyapp.ink/ and shared across IRL friends and family, Reddit, Facebook, and Instagram
- cleaned, chart-ready CSV files in the `data/` folder
- p5.js to draw the charts and build the site

The survey section presents 48 rows of survey data collected through https://surveyapp.ink/.

## Data Sources

| Filename | Source | URL | Year or period | Status | Limitations |
| --- | --- | --- | --- | --- | --- |
| `data/inequality/za_gini_trend.csv` | World Bank Poverty and Inequality Platform via Our World in Data | https://ourworldindata.org/grapher/economic-inequality-gini-index | 1993-2022 | Real cleaned data | Survey-based inequality estimates aren't always fully comparable across years. |
| `data/inequality/za_population_group_shares.csv` | Statistics South Africa population group table cleaned from the existing project census file | Local cleaned file | 2022 | Real cleaned data | Population group categories are official statistical categories, not biological groups. |
| `data/inequality/za_population_group_earnings.csv` | Statistics South Africa, “How unequal is South Africa?” | https://www.statssa.gov.za/?p=12930 | 2011-2015 | Real cleaned data | Mean monthly earnings don't capture total wealth, assets, or all household resources. |
| `data/inequality/za_dwelling_ownership_by_group.csv` | Statistics South Africa General Household Survey 2024, Table 8.6 | https://www.statssa.gov.za/publications/P0318/P03182024.pdf | 2024 | Real cleaned and calculated data | Measures dwelling tenure by the population group of the household head, not total property wealth or homes owned by individuals. |
| `data/inequality/za_land_ownership_by_group.csv` | Department of Rural Development and Land Reform Land Audit Report 2017 | https://www.gov.za/sites/default/files/gcis_document/201802/landauditreport13feb2018.pdf | 2017 | Real cleaned data | Only covers individually owned farms and agricultural holdings, not all homes, property, or wealth. |
| `data/inequality/za_income_distribution.csv` | WID.world via Our World in Data | https://ourworldindata.org/grapher/income-share-top-10-before-tax-wid | 1993-2014 | Real cleaned data | Before-tax income share isn't the same as disposable income after taxes and benefits. |
| `data/inequality/za_wealth_distribution.csv` | WID.world via Our World in Data | https://ourworldindata.org/grapher/wealth-share-richest-10-percent | 1993-2024 | Real cleaned data | Wealth estimates may include modelled values where direct data is limited. |
| `data/inequality/za_population_groups.csv` | Local derived grouping file | Local file | Not time-series | Derived grouping data | Simplifies top 10 percent, middle 40 percent, and bottom 50 percent groups for comparison. |
| `data/inequality/za_poverty_indicators.csv` | World Bank PIP via OWID and Statistics South Africa | https://ourworldindata.org/grapher/relative-poverty-share-of-people-below-50-of-the-median and https://www.statssa.gov.za/?p=19078 | 1993-2023 | Real cleaned data | Different poverty definitions here shouldn't be merged into one measure. |
| `data/survey/za_survey_responses.csv` | Project Survey App export | https://surveyapp.ink/ | Through 2026-08-25 | Real survey data | 48 Survey App rows collected via https://surveyapp.ink/ and shared on Reddit, Facebook, Instagram, and with IRL friends and family. |
| `data/inequality/za_dashboard_sources.csv` | Local source register | Local file | Project documentation | Metadata | Summarises sources and limitations for the dashboard. |

## Visualisation Design (Simple Chart Guide)

### 1. South African Inequality, Explained (Official Data)

- **National inequality (Gini over time)**: Measures inequality from 0 (equal) to 1 (totally unequal). South Africa stays above 0.60, making it one of the most unequal countries in the world.
- **Population earnings**: Compares population size with average monthly pay. Black Africans make up over 80% of people but have the lowest average pay; White people make up ~7% but earn over 3x the national average.
- **Dwelling ownership**: Shows housing tenure (own, rent, or rent-free). Shows big gaps in who owns their home versus who has to rent.
- **Land ownership**: Shows who owns individual farm and agricultural land. Over 70% of individually owned farmland is held by White owners.
- **Top 10% income share**: Shows how much pre-tax national income goes to the top 10% richest earners (over 50% to 65%).
- **Top 10% concentration**: Compares 10% of the population against their income share (~65%) and wealth share (~86%). Shows wealth is even more concentrated than income.
- **Poverty indicators**: Shows the percentage of people living below different poverty lines over time.

### 2. Survey App: Everyday Financial Pressure (48 Responses)

- **Pressure index**: Combines all survey answers into one stress score out of 100 (**71/100 = high pressure**) and shows the 5 parts that make it up: Main pressure (86), Income gap (80), Work worry (72), Food cost (63), and Transport cost (56).
- **Cost pressure mix**: A 100-block waffle chart showing people's #1 financial worry (Food, Transport, Rent, Debt, Data, Electricity).
- **Food & transport**: Compares monthly food spending against monthly transport spending to show who gets squeezed by both.
- **What gets cut**: A heatmap showing what people stop buying when money is tight (eating out, entertainment, meat, clothes, data).
- **Worry vs. income**: Compares work stress with whether income is enough. Shows unemployed people and working students have the biggest gap.
- **Pressure by status**: Shows what hurts each group most (students worry about tuition and data; workers worry about rent and debt).

### 3. Archived Drafts

- **Population by census (1996–2022)**: Demographic proportions across four census counts.
- **Sex & age structure (2022)**: South Africa's population pyramid.
- **Youth unemployment**: Unemployment rates for youth over time.
- **Life expectancy**: Historical lifespan trends.
- **Global temperature anomaly**: Exploration draft on world temperature changes.

## Survey Data

The dataset contains 48 survey responses collected using the custom Survey App hosted at https://surveyapp.ink/. The survey was distributed and shared across in-real-life (IRL) friends and family, Reddit, Facebook, and Instagram.

The responses were sanitized to remove private submission headers (`ip_hash`, `user_agent`, `timestamp`, `comment`), and the multiple-choice `cut_back_on` field was standardized for uniform category formatting with manual verification to ensure data fidelity.

## Findings / Expected Insights

I designed this project to show that:

- inequality shows up clearly when you compare population share with income and wealth share
- national inequality indicators point to a broader structural problem
- official population-group data shows unequal outcomes in earnings, dwelling tenure, and land ownership
- survey responses can later help connect that structural inequality to everyday financial pressure

## Limitations

- Different sources measure income, wealth, poverty, population, dwelling tenure, and land ownership differently.
- These charts simplify complex social and economic issues.
- Some WID wealth and income estimates involve modelling where direct data is limited.
- The dwelling chart measures household tenure rates, not full property wealth.
- The land chart measures individually owned farms and agricultural holdings, not all land or homes.
- Not all datasets share the same latest year, so I've labelled the year used on each chart.

## Technical Implementation

The site is a p5.js dashboard. `index.html` loads the app shell, p5.js, helper functions, chart scripts, and `src/sketch.js`. The chart catalogue in `src/gallery.js` controls the menu labels, overview cards, chart titles, descriptions, source text, and the split between the national-data section and the survey app.

Each chart loads a CSV from `data/` with `loadTable()` and draws into one responsive canvas inside the chart panel. The layout uses CSS grid so the menu, chart area, and info panel work on both desktop and smaller screens.

## Conclusion

I built this project to explain South African inequality with official data and a clearly labelled Survey App dataset.
