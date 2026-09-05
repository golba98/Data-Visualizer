# South African Inequality Explained

## About

A data story about inequality in South Africa

It looks at income wealth earnings housing land poverty and everyday money pressure

## Run locally

```bash
npm install
npm run dev
```

Build and preview

```bash
npm run build
npm run start
```

Other scripts

```bash
npm run data:survey
npm run test:data
```

## URL options

| Flag | What it does |
| --- | --- |
| `?test=1` | Runs browser tests |
| `?debug=1` | Shows debug logs |
| `?failData=1` | Tests data loading errors |
| `?embedded=1` | Opens one chart without the app shell |
| `?vis=<id>` | Opens one chart |
| `?section=<id>` | Opens one menu section |
| `?about=1` | Opens chart notes |

## Research question

How can data help explain inequality in South Africa

## Background

South Africa has major gaps in income wealth housing and land

Stats SA population groups are official statistical categories not biological groups

Each chart shows one part of the wider picture

## Method

- Official data from WID World World Bank Our World in Data Stats SA and the 2017 Land Audit
- A 48 response Survey App export from https://surveyapp.ink/
- Survey sharing through friends family Reddit Facebook and Instagram
- Clean chart files in `data/`
- p5.js for the charts and site

## Data sources

| File | Source | URL | Period | Notes |
| --- | --- | --- | --- | --- |
| `za_gini_trend.csv` | World Bank PIP via OWID | https://ourworldindata.org/grapher/economic-inequality-gini-index | 1993-2022 | Results can differ by survey method |
| `za_population_group_shares.csv` | Stats SA local cleaned file | Local file | 2022 | Official statistical groups |
| `za_population_group_earnings.csv` | Stats SA | https://www.statssa.gov.za/?p=12930 | 2011-2015 | Earnings are not total wealth |
| `za_dwelling_ownership_by_group.csv` | Stats SA GHS 2024 Table 8.6 | https://www.statssa.gov.za/publications/P0318/P03182024.pdf | 2024 | Household tenure not total property wealth |
| `za_land_ownership_by_group.csv` | Land Audit Report | https://www.gov.za/sites/default/files/gcis_document/201802/landauditreport13feb2018.pdf | 2017 | Farms and agricultural holdings only |
| `za_income_distribution.csv` | WID World via OWID | https://ourworldindata.org/grapher/income-share-top-10-before-tax-wid | 1993-2014 | Pre tax income |
| `za_wealth_distribution.csv` | WID World via OWID | https://ourworldindata.org/grapher/wealth-share-richest-10-percent | 1993-2024 | Some values are modelled |
| `za_population_groups.csv` | Local derived file | Local file | Not a time series | Top 10 middle 40 and bottom 50 groups |
| `za_poverty_indicators.csv` | World Bank PIP OWID and Stats SA | https://ourworldindata.org/grapher/relative-poverty-share-of-people-below-50-of-the-median and https://www.statssa.gov.za/?p=19078 | 1993-2023 | Measures use different definitions |
| `za_survey_responses.csv` | Survey App export | https://surveyapp.ink/ | Through 2026-08-25 | 48 real survey rows |
| `za_dashboard_sources.csv` | Local source register | Local file | Project notes | Sources and limits |

## Charts

### Official data

- Gini trend shows national inequality over time
- Population earnings compares population share and average pay
- Dwelling ownership shows own rent and rent free homes
- Land ownership shows individual farm and agricultural land ownership
- Top 10 income share shows pre tax income concentration
- Top 10 concentration compares income and wealth shares
- Poverty indicators show poverty rates over time

### Survey data

- Pressure index shows a project pressure score out of 100
- Cost pressure mix shows the main money worry
- Food and transport compares monthly cost bands
- What gets cut shows spending cuts when money is tight
- Worry and income compares work worry with income pressure
- Pressure by status compares each employment group

### Archive

- Population by census
- Sex and age structure
- Youth unemployment
- Life expectancy
- Global temperature anomaly

## Survey data

The data has 48 Survey App responses

Private fields such as `ip_hash` `user_agent` `timestamp` and `comment` were removed

The `cut_back_on` answers were standardised and checked by hand

## What it shows

- Inequality is clear when population income and wealth shares are compared
- National figures point to wider structural inequality
- Official data shows gaps in earnings housing and land
- Survey data connects these gaps to daily money pressure

## Limits

- Sources measure things in different ways
- Charts simplify complex social and economic issues
- Some income and wealth estimates are modelled
- Housing data measures tenure not full property wealth
- Land data covers individual farms and agricultural holdings only
- Datasets use different years

## Technical notes

`index.html` loads p5.js chart files and `src/sketch.js`

`src/gallery.js` controls chart titles menu items source notes and sections

Each chart loads a CSV with `loadTable()` and draws on a responsive canvas

## Conclusion

This project uses official data and clearly labelled survey data to explain inequality in South Africa
