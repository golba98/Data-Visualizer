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

The climate dataset is stored in `data/climate/`.

- `global_temperature_anomaly_1880_2025.csv`

## Data Sources

- Statistics South Africa Census 2022 data was used for the age, sex, and
  population group charts.
- World Bank / ILO youth unemployment data was used for the South African youth
  unemployment chart.
- NASA GISTEMP v4 global temperature anomaly data was used for the climate chart.

## Charts Replaced

- The original stacked bar chart was changed to South African population by sex
  and age group for Census 2022.
- The original pie chart was changed to population group distribution by census
  year.
- The original bubble chart was changed to age group size and female share for
  Census 2022.
- The original line chart was changed to South African youth unemployment from 1991
  to 2025.
- The climate chart was updated with global temperature anomaly data from 1880
  to 2025.

## How The CSV Files Were Cleaned

The CSV files were simplified so the JavaScript can read them directly. I kept
only the columns needed for the charts, used clear column names, and changed the
values into percentages or yearly values where needed. This makes the project
easier to understand because each visualisation uses a small chart-ready file.

## Why These Chart Types Fit

- A stacked horizontal bar chart works well for comparing female and male
  percentages across age groups.
- A pie chart works for one census year at a time because it shows how the
  population groups make up a whole.
- A bubble chart fits the age data because it can show age midpoint, female
  percentage, and total population at the same time.
- A line chart fits youth unemployment because the data changes over many years.
- The temperature chart keeps the slider because it is useful for looking at
  different year ranges in a long time series.
