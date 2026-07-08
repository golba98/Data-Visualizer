# Data Visualisation Coursework

This project started from the Data Visualiser template. I changed the original
template datasets to use newer external datasets, but kept the app simple so the
charts are still easy to explain.

## Datasets Added

The South African datasets are stored in `data/south-africa/`.

- `sex_by_age_2022.csv`
- `sex_by_age_2022_detailed.csv`
- `population_group_census_1996_2022.csv`
- `age_sex_bubble_2022.csv`
- `sa_youth_unemployment_1991_2025.csv`
- `survey_pressure_cleaned.csv`
- `survey_responses.csv`

The climate dataset is stored in `data/climate/`.

- `global_temperature_anomaly_1880_2025.csv`

The health dataset is stored in `data/health/`.

- `sa_life_expectancy_1960_2024.csv`

## Data Sources

- Statistics South Africa Census 2022 data was used for the age, sex, and
  population group charts.
- World Bank / ILO youth unemployment data was used for the South African youth
  unemployment chart.
- World Bank life expectancy indicators were used for the South African life
  expectancy chart.
- NASA GISTEMP v4 global temperature anomaly data was used for the climate chart.
- The waffle chart uses the cleaned local survey response CSV.
  `data/south-africa/survey_pressure_cleaned.csv` was derived from
  `data/south-africa/survey_responses.csv` and uses the real `main_pressure`
  answers as the waffle categories.

## Charts Replaced

- The original stacked bar chart was changed to South African population by sex
  and age group for Census 2022.
- The original pie chart was changed to population group distribution by census
  year.
- The original bubble chart was changed to age group size and female share for
  Census 2022.
- The original line chart was changed to South African youth unemployment from 1991
  to 2025.
- A new multi-series line chart was added for South African life expectancy by
  sex from 1960 to 2024.
- The climate chart was updated with global temperature anomaly data from 1880
  to 2025.
- A waffle-chart view was added for the survey question about the main
  cost-of-living pressure.
- Five extra survey views were added for the cost-of-living survey:
  the Mzansi Monthly Pressure Index, cutback heatmap, food vs transport burden,
  income reality gap, and student vs worker pressure chart.

## How More Graphs Are Organised

The dashboard uses `src/gallery.js` as the chart catalogue. Each chart belongs
to a topic group such as South Africa Census, Employment, Health, Climate, or
Survey. The catalogue stores the menu label and the information-panel text in
one place, so adding more graphs does not require separate edits to a menu list
and a metadata object.

To add a new graph:

1. Add the chart JavaScript file in `src/visualizations/`.
2. Load that file from `index.html`.
3. Register the chart object in `src/sketch.js`.
4. Add one catalogue item in `src/gallery.js` under the right topic group.

The evidence and decision log were saved in the CM1010 midterm evidence folder:
`1-Evidence/3-Organisation/graph-organisation-log.md`.

## How The CSV Files Were Cleaned

The CSV files were simplified so the JavaScript can read them directly. I kept
only the columns needed for the charts, used clear column names, and changed the
values into percentages or yearly values where needed. This makes the project
easier to understand because each visualisation uses a small chart-ready file.

For `data/south-africa/survey_pressure_cleaned.csv`, the raw survey export was
cleaned into shorter headings such as `age`, `status`, `pressure`,
`work_worry`, and `income_keeps_up`. The waffle chart reads the real `pressure`
column.

The Mzansi Monthly Pressure Index also uses the cleaned survey file. The survey
does not have a month column, so I used it as one current pressure index instead
of pretending it is a monthly time-series chart. The cutback heatmap uses the
raw survey file because that is where the `cut_back_on` answers are stored.

## Why These Chart Types Fit

- A stacked horizontal bar chart works well for comparing female and male
  percentages across age groups.
- A pie chart works for one census year at a time because it shows how the
  population groups make up a whole.
- A bubble chart fits the age data because it can show age midpoint, female
  percentage, and total population at the same time.
- A line chart fits youth unemployment because the data changes over many years.
- A multi-series line chart works for life expectancy because it compares female,
  male, and total trends over time on the same scale.
- The temperature chart keeps the slider because it is useful for looking at
  different year ranges in a long time series.
- A waffle chart works for the survey because it shows the proportion of
  categorical `pressure` responses as parts of a whole.
- A pressure index works as an overview because it combines several survey
  ratings into one easy-to-read score.
- A heatmap works for cutbacks because it shows where sacrifices are strongest
  across different status groups.
- A burden grid works for food and transport because both costs are regular
  survival expenses and can be compared as spending bands.
- A gap chart works for income reality because the distance between worry and
  income rating is the main point.
- A stacked bar chart works for student versus worker pressure because it shows
  the mix of pressure categories inside each group.
