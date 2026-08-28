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

## Visualisation Design

The site separates official inequality data, Survey App data, and archived charts.

### Gini coefficient over time

This line chart uses `data/inequality/za_gini_trend.csv`, showing the South African Gini estimates I could find from World Bank/PIP via Our World in Data. I use it to set the national inequality context before getting into ownership and income specifics.

### Population share compared with mean earnings

This bar comparison uses `data/inequality/za_population_group_shares.csv` and `data/inequality/za_population_group_earnings.csv`, comparing population-group shares with Stats SA mean monthly real earnings. It shows how a small population group can earn far more on average than much larger groups.

### Dwelling tenure by population group

This stacked bar chart uses `data/inequality/za_dwelling_ownership_by_group.csv`, showing owned, rented, rent-free, and other tenure rates by the population group of the household head. It's one practical way inequality shows up in everyday living conditions — though it's a tenure measure, not a full property-wealth one.

### Agricultural land ownership by population group

This bar chart uses `data/inequality/za_land_ownership_by_group.csv`, showing shares of individually owned farms and agricultural land from the 2017 Land Audit. It shows ownership concentration in a land-related measure, though it doesn't cover all homes or all wealth.

### Top 10 percent income share

This line chart uses `data/inequality/za_income_distribution.csv`, showing the share of before-tax income going to the richest 10 percent. It's here because the project is about money distribution, not just population size.

### Top 10 percent population share versus income and wealth share

This comparison chart uses `data/inequality/za_population_groups.csv`, `data/inequality/za_income_distribution.csv`, and `data/inequality/za_wealth_distribution.csv`, comparing a 10 percent population reference group with top 10 percent income and wealth shares. This is the central argument of the project: a small slice of the population holds a much bigger share of resources.

### Poverty context

This chart uses `data/inequality/za_poverty_indicators.csv`, showing a few poverty indicators from World Bank/PIP and Stats SA. It gives context for financial pressure, but the different definitions have to be read separately.

### How pressured are people feeling?

A gauge combines the 48 Survey App rows into one 0–100 pressure score.

### What people worry about most

A waffle chart shows the main cost-pressure answers in the 48-row dataset.

### Food cost against transport cost

A grid compares food-cost bands with transport-cost bands.

### What people say they cut back on

A heatmap compares cutback choices across status groups.

### Does income keep up with the worry?

A dumbbell chart compares work worry with income adequacy.

### Who feels which pressure most?

Stacked bars compare main cost pressures across status groups.

### Archived charts

Below the survey app is a small archive of six charts from earlier drafts of this project — a census pie chart, a sex-by-age breakdown, an age/female-share bubble chart, youth unemployment, life expectancy, and (unrelated to South Africa) a global temperature anomaly chart I built while still deciding on a topic. They're not part of the inequality story, so I moved them out of the main sections instead of deleting them.

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
