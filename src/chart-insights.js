
// One summary-model builder per visualisation.
// Every number here is computed from the visualisation's own loaded data, so the
// text cannot drift from the chart. Differences are described, never explained:
// this dataset can show an association, not a cause.
(function(global) {
  'use strict';

  var S = null;

  function stats() {
    if (!S) S = global.SummaryStats;
    return S;
  }

  function isReady(vis) {
    if (!vis) return false;
    if (vis.loadState && vis.loadState.status !== 'ready') return false;
    return vis.loaded === true;
  }

  // Converts a p5 Table into plain objects for the table model.
  function tableRows(table, columns) {
    var rows = [];
    if (!table || typeof table.getRowCount !== 'function') return rows;

    for (var r = 0; r < table.getRowCount(); r++) {
      var row = {};
      for (var c = 0; c < columns.length; c++) {
        row[columns[c].key] = table.getString(r, columns[c].source || columns[c].key);
      }
      rows.push(row);
    }
    return rows;
  }

  // Manifest entry first, then anything the chart can add from its own data.
  function provenanceFor(path, extras) {
    var entry = global.DataProvenance ? global.DataProvenance.get(path) : null;
    var out = {};

    if (entry) {
      if (entry.source) out.Source = entry.source;
      if (entry.period) out.Period = entry.period;
    }

    var keys = Object.keys(extras || {});
    for (var i = 0; i < keys.length; i++) {
      if (extras[keys[i]]) out[keys[i]] = extras[keys[i]];
    }

    if (entry) {
      if (entry.status) out['Data status'] = entry.status;
      if (entry.limitation) out.Limitation = entry.limitation;
    }

    return out;
  }

  function surveyRowsUsed(represented) {
    var total = (global.SurveyData && global.SurveyData.totalRows) || 0;
    if (!stats().isNumber(represented)) return total + ' of ' + total;
    return represented + ' of ' + total;
  }

  // The survey is a small convenience sample; say so once, everywhere.
  function surveyCaveat(extra) {
    var total = (global.SurveyData && global.SurveyData.totalRows) || 0;
    var base = 'Based on ' + total + ' self-selected responses, so these are differences '
      + 'within this sample rather than estimates for South Africa as a whole.';
    return extra ? base + ' ' + extra : base;
  }

  function surveyProvenance(extras) {
    return provenanceFor('za_survey_responses.csv', extras);
  }


  var builders = {};


  builders['za-gini-trend'] = function(vis) {
    var st = stats();
    var table = vis.data;
    if (!table || table.getRowCount() === 0) return null;

    var points = [];
    for (var r = 0; r < table.getRowCount(); r++) {
      var year = Number(table.getString(r, 'year'));
      var value = Number(table.getString(r, 'gini_coefficient'));
      if (isFinite(year) && isFinite(value)) points.push({ year: year, value: value });
    }
    if (!points.length) return null;

    var peak = st.highest(points, function(p) { return p.value; });
    var trough = st.lowest(points, function(p) { return p.value; });
    var first = points[0];
    var last = points[points.length - 1];

    return {
      insight: 'The highest Gini value in this series is ' + st.format(peak.value, 2)
        + ' in ' + peak.item.year + ', and the lowest is ' + st.format(trough.value, 2)
        + ' in ' + trough.item.year + '. Between ' + first.year + ' and ' + last.year
        + ' the coefficient moved from ' + st.format(first.value, 2) + ' to '
        + st.format(last.value, 2) + ', ' + st.describeChange(first.value, last.value, 2, 'points') + '.',
      caveat: 'Only ' + points.length + ' years have observations; missing years are not '
        + 'interpolated, so the line joins measured points directly.',
      howToRead: 'The vertical axis starts at 0.50 rather than 0, so the ups and downs look '
        + 'larger than the underlying change. A Gini of 0 would mean everyone receives the '
        + 'same income and 1 would mean one person receives all of it.',
      table: {
        caption: 'Gini coefficient by year of observation.',
        columns: [
          { key: 'year', label: 'Year' },
          { key: 'gini', label: 'Gini coefficient' }
        ],
        rows: points.map(function(p) {
          return { year: p.year, gini: st.format(p.value, 4) };
        })
      },
      provenance: provenanceFor('za_gini_trend.csv', {
        Unit: 'Gini coefficient, 0 to 1',
        'Observations used': points.length + ' of ' + table.getRowCount() + ' rows',
        Transformation: 'Values read directly from the source column; no smoothing or interpolation'
      })
    };
  };


  builders['za-income-share-trend'] = function(vis) {
    var st = stats();
    var table = vis.data;
    if (!table || table.getRowCount() === 0) return null;

    var points = [];
    for (var r = 0; r < table.getRowCount(); r++) {
      var year = Number(table.getString(r, 'year'));
      var value = Number(table.getString(r, 'top_10_income_share_percent'));
      if (isFinite(year) && isFinite(value)) points.push({ year: year, value: value });
    }
    if (!points.length) return null;

    var peak = st.highest(points, function(p) { return p.value; });
    var first = points[0];
    var last = points[points.length - 1];

    return {
      insight: 'The top 10% share of before-tax income moves from '
        + st.format(first.value, 2) + '% in ' + first.year + ' to '
        + st.format(last.value, 2) + '% in ' + last.year + ', '
        + st.describeChange(first.value, last.value, 2, 'percentage points') + '. '
        + 'The highest recorded share is ' + st.format(peak.value, 2) + '% in '
        + peak.item.year + '.',
      caveat: 'The series stops at ' + last.year + '; later years are not available in this dataset.',
      table: {
        caption: 'Top 10% share of before-tax income by year.',
        columns: [
          { key: 'year', label: 'Year' },
          { key: 'share', label: 'Top 10% income share (%)' }
        ],
        rows: points.map(function(p) {
          return { year: p.year, share: st.format(p.value, 2) };
        })
      },
      provenance: provenanceFor('za_income_distribution.csv', {
        Unit: 'Percentage of total before-tax income',
        'Observations used': points.length + ' years',
        Transformation: 'Plotted as supplied; before-tax income is not the same as disposable income'
      })
    };
  };


  builders['za-population-group-earnings'] = function(vis) {
    var st = stats();
    var rows = vis.rows || [];
    if (!rows.length) return null;

    var top = st.highest(rows, function(row) { return row.earnings; });
    var bottom = st.lowest(rows, function(row) { return row.earnings; });
    if (!top || !bottom) return null;

    var ratio = (bottom.value > 0)
      ? st.format(top.value / bottom.value, 1) + ' to 1'
      : 'not comparable';

    return {
      insight: 'Mean monthly earnings are highest for the ' + top.item.group
        + ' group at R' + st.formatCount(top.value) + ' and lowest for the '
        + bottom.item.group + ' group at R' + st.formatCount(bottom.value)
        + ', a ratio of ' + ratio + ' in this dataset.',
      caveat: 'Population shares are from the 2022 census while earnings cover 2011-2015, so '
        + 'the two bars in each row describe different periods and should not be read as a rate.',
      howToRead: 'Each row is one population group. The upper bar is that group’s share of '
        + 'the population and the lower bar is its mean monthly earnings. Colour only highlights '
        + 'the highest-earning group; it does not encode a separate value.',
      table: {
        caption: 'Population share and mean real monthly earnings by population group.',
        columns: [
          { key: 'group', label: 'Population group' },
          { key: 'share', label: 'Population share (%)' },
          { key: 'earnings', label: 'Mean monthly earnings (R)' }
        ],
        rows: rows.map(function(row) {
          return {
            group: row.group,
            share: st.format(row.populationShare, 1),
            earnings: st.formatCount(row.earnings)
          };
        })
      },
      provenance: provenanceFor('za_population_group_earnings.csv', {
        Unit: 'Rand per month (mean real earnings) and percentage of population',
        'Groups shown': rows.length,
        Transformation: 'Two datasets joined on population group; groups with no earnings row are omitted'
      })
    };
  };


  builders['za-dwelling-ownership-by-group'] = function(vis) {
    var st = stats();
    var rows = vis.rows || [];
    if (!rows.length) return null;

    var mostOwned = st.highest(rows, function(row) { return row.owned; });
    var leastOwned = st.lowest(rows, function(row) { return row.owned; });
    if (!mostOwned || !leastOwned) return null;

    return {
      insight: 'Owned dwellings account for ' + st.format(mostOwned.value, 1)
        + '% of households headed by the ' + mostOwned.item.group + ' group, the highest share, '
        + 'and ' + st.format(leastOwned.value, 1) + '% for the ' + leastOwned.item.group
        + ' group, the lowest. The remaining households rent, occupy rent-free, or are recorded as other.',
      caveat: 'Tenure is recorded by the population group of the household head and describes '
        + 'how a home is occupied, not how much property a household owns.',
      table: {
        caption: 'Dwelling tenure by population group of household head, percentage of households.',
        columns: [
          { key: 'group', label: 'Population group' },
          { key: 'owned', label: 'Owned (%)' },
          { key: 'rented', label: 'Rented (%)' },
          { key: 'rentFree', label: 'Rent-free (%)' },
          { key: 'other', label: 'Other or unknown (%)' }
        ],
        rows: rows.map(function(row) {
          return {
            group: row.group,
            owned: st.format(row.owned, 1),
            rented: st.format(row.rented, 1),
            rentFree: st.format(row.rentFree, 1),
            other: st.format(row.other, 1)
          };
        })
      },
      provenance: provenanceFor('za_dwelling_ownership_by_group.csv', {
        Unit: 'Percentage of households within each population group',
        'Groups shown': rows.length,
        Transformation: 'Percentages taken from the published table; each row sums to about 100%'
      })
    };
  };


  builders['za-land-ownership-by-group'] = function(vis) {
    var st = stats();
    var rows = vis.rows || [];
    if (!rows.length) return null;

    var top = st.highest(rows, function(row) { return row.share; });
    var bottom = st.lowest(rows, function(row) { return row.share; });
    if (!top) return null;

    return {
      insight: 'The ' + top.item.group + ' group holds the largest share of individually owned '
        + 'farms and agricultural holdings at ' + st.format(top.value, 1) + '% ('
        + st.formatCount(top.item.hectares) + ' hectares). The smallest recorded share is '
        + st.format(bottom.value, 1) + '% for ' + bottom.item.group + '.',
      caveat: 'The audit covers farms and agricultural holdings owned by individuals only. It '
        + 'excludes homes, company- and trust-held land, and state land, so it is not a measure '
        + 'of total property or wealth.',
      howToRead: 'Bar length is the share of audited agricultural land. Colour only highlights '
        + 'the largest holder and does not encode a second value. The hectare figure under each '
        + 'bar is the same value in absolute terms.',
      table: {
        caption: 'Individually owned farms and agricultural holdings by population group.',
        columns: [
          { key: 'group', label: 'Population group' },
          { key: 'share', label: 'Share of audited land (%)' },
          { key: 'hectares', label: 'Hectares' }
        ],
        rows: rows.map(function(row) {
          return {
            group: row.group,
            share: st.format(row.share, 1),
            hectares: st.formatCount(row.hectares)
          };
        })
      },
      provenance: provenanceFor('za_land_ownership_by_group.csv', {
        Unit: 'Percentage of audited hectares, and hectares',
        'Groups shown': rows.length,
        Transformation: 'Shares as published in the 2017 Land Audit; no reallocation of unclassified land'
      })
    };
  };


  builders['za-ownership-comparison'] = function(vis) {
    var st = stats();
    var rows = vis.rows || [];
    if (rows.length < 3) return null;

    var population = rows[0];
    var income = rows[1];
    var wealth = rows[2];

    return {
      insight: 'The top ' + st.format(population.value, 0) + '% of people receive '
        + st.format(income.value, 1) + '% of before-tax income and hold '
        + st.format(wealth.value, 1) + '% of wealth in these estimates — '
        + st.format(wealth.value / population.value, 1)
        + ' times their share of the population by wealth.',
      caveat: 'Income and wealth come from separate WID series with different latest years, so '
        + 'the two bars are not measured in the same period.',
      table: {
        caption: 'Population share compared with income and wealth share for the top 10%.',
        columns: [
          { key: 'label', label: 'Measure' },
          { key: 'value', label: 'Share (%)' },
          { key: 'note', label: 'Basis' }
        ],
        rows: rows.map(function(row) {
          return { label: row.label, value: st.format(row.value, 1), note: row.note };
        })
      },
      provenance: provenanceFor('za_wealth_distribution.csv', {
        Unit: 'Percentage share',
        Transformation: 'Latest available year taken from each source series; population share is '
          + 'the fixed top-10% definition, not an estimate'
      })
    };
  };


  builders['za-poverty-context'] = function(vis) {
    var st = stats();
    var series = vis.series || {};
    var names = vis.seriesNames || [];
    var described = [];
    var tableRowsOut = [];

    for (var i = 0; i < names.length; i++) {
      var points = series[names[i]] || [];
      if (!points.length) continue;

      var latest = points[points.length - 1];
      described.push(names[i] + ' is at ' + st.format(latest.value, 1) + '% in ' + latest.year);

      for (var p = 0; p < points.length; p++) {
        tableRowsOut.push({
          indicator: names[i],
          year: points[p].year,
          value: st.format(points[p].value, 1)
        });
      }
    }

    if (!described.length) return null;

    return {
      insight: 'On the latest available reading, ' + described.join('; ') + '.',
      caveat: 'Each line uses a different poverty definition. They answer different questions and '
        + 'should not be added together or read as one measure.',
      table: {
        caption: 'Poverty indicators by year, one row per observation.',
        columns: [
          { key: 'indicator', label: 'Indicator' },
          { key: 'year', label: 'Year' },
          { key: 'value', label: 'Headcount (%)' }
        ],
        rows: tableRowsOut
      },
      provenance: provenanceFor('za_poverty_indicators.csv', {
        Unit: 'Percentage of population below the stated line',
        'Series shown': described.length,
        Transformation: 'Rows grouped by indicator; years without an observation are left as gaps'
      })
    };
  };


  builders['survey-pressure-index'] = function(vis) {
    var st = stats();
    var components = vis.components || [];
    if (!components.length || !st.isNumber(vis.index)) return null;

    var top = st.highest(components, function(c) { return c.value; });
    var bottom = st.lowest(components, function(c) { return c.value; });

    return {
      insight: 'The combined pressure index for this sample is ' + vis.index + ' out of 100. '
        + top.item.label + ' contributes the most at ' + st.format(top.value, 2)
        + ' out of 1.00, and ' + bottom.item.label + ' the least at '
        + st.format(bottom.value, 2) + '.',
      caveat: surveyCaveat('The index is a weighted summary designed for this project, not a '
        + 'published or validated measure.'),
      howToRead: 'The dial shows the combined index from 0 on the left to 100 on the right, split '
        + 'into equal low, middle and high thirds at 33 and 67. The five bars below are the parts '
        + 'it averages, each scored from 0 to 1. Main pressure uses fixed weights (Debt 1.00, '
        + 'Rent 0.95, Food 0.90, Transport 0.85, Electricity 0.82, Tuition 0.78, Data 0.70); the '
        + 'cost bands are scored from cheapest to most expensive.',
      table: {
        caption: 'Components averaged into the pressure index, each scored from 0 to 1.',
        columns: [
          { key: 'label', label: 'Component' },
          { key: 'value', label: 'Mean score (0-1)' }
        ],
        rows: components.map(function(component) {
          return { label: component.label, value: st.format(component.value, 3) };
        }).concat([{ label: 'Combined index (0-100)', value: String(vis.index) }])
      },
      provenance: surveyProvenance({
        Unit: 'Index from 0 to 100, averaged from five 0-1 components',
        'Responses used': surveyRowsUsed(vis.validRows),
        Transformation: 'Ordinal answers mapped to fixed weights, averaged per component, then '
          + 'the five component means are averaged and scaled to 100'
      })
    };
  };


  builders['survey-food-transport-burden'] = function(vis) {
    var st = stats();
    var counts = vis.counts || {};
    var foodBands = vis.foodBands || [];
    var transportBands = vis.transportBands || [];
    if (!vis.representedRows) return null;

    var cells = [];
    var emptyFoodBands = [];

    for (var f = 0; f < foodBands.length; f++) {
      var foodTotal = 0;
      for (var t = 0; t < transportBands.length; t++) {
        var count = (counts[foodBands[f]] || {})[transportBands[t]] || 0;
        foodTotal += count;
        cells.push({ food: foodBands[f], transport: transportBands[t], count: count });
      }
      if (foodTotal === 0) emptyFoodBands.push(foodBands[f]);
    }

    var busiest = st.highest(cells, function(cell) { return cell.count; });
    if (!busiest || busiest.value === 0) return null;

    var totalRows = vis.table ? vis.table.getRowCount() : vis.representedRows;
    var emptyNote = emptyFoodBands.length
      ? 'No respondent reported food spending in the ' + emptyFoodBands.join(' or ')
        + ' band, so that row is empty rather than missing.'
      : '';

    return {
      insight: 'The most common combination is ' + busiest.item.food + ' a month on food with '
        + busiest.item.transport + ' on transport, reported by ' + busiest.value
        + ' respondents (' + st.percent(busiest.value, vis.representedRows)
        + '% of the ' + vis.representedRows + ' responses shown).',
      caveat: surveyCaveat(emptyNote),
      howToRead: 'Horizontal position is the monthly transport-cost band and vertical position is '
        + 'the monthly food-cost band. Circle size and the number inside it are both the count of '
        + 'respondents in that combination. Circle width, not circle area, scales with the count, '
        + 'so read the printed number for the exact value.',
      table: {
        caption: 'Respondents by food-cost band and transport-cost band ('
          + vis.representedRows + ' of ' + totalRows + ' responses).',
        columns: [{ key: 'food', label: 'Food cost per month' }]
          .concat(transportBands.map(function(band) {
            return { key: band, label: band };
          }))
          .concat([{ key: 'total', label: 'Total' }]),
        rows: foodBands.map(function(band) {
          var row = { food: band };
          var total = 0;
          for (var t = 0; t < transportBands.length; t++) {
            var value = (counts[band] || {})[transportBands[t]] || 0;
            row[transportBands[t]] = value;
            total += value;
          }
          row.total = total;
          return row;
        })
      },
      provenance: surveyProvenance({
        Unit: 'Count of respondents per band combination',
        'Responses used': vis.representedRows + ' of ' + totalRows,
        Transformation: 'Responses cross-tabulated into the survey’s own cost bands; a response '
          + 'is only counted when both of its bands are recognised'
      })
    };
  };


  builders['survey-pressure-waffle'] = function(vis) {
    var st = stats();
    var waffle = vis.waffle;
    if (!waffle || !waffle.counts) return null;

    var categories = vis.categories || [];
    var items = categories.map(function(name) {
      return { name: name, count: waffle.counts[name] || 0 };
    });

    var total = st.isNumber(waffle.representedRows) && waffle.representedRows > 0
      ? waffle.representedRows
      : (vis.table ? vis.table.getRowCount() : 0);
    if (!total) return null;

    var top = st.highest(items, function(item) { return item.count; });
    var unused = items.filter(function(item) { return item.count === 0; });

    return {
      insight: top.item.name + ' is the most often chosen main money worry, named by '
        + top.value + ' of ' + total + ' respondents ('
        + st.percent(top.value, total) + '%). Each square in the grid is about one percent of '
        + 'those responses.',
      caveat: surveyCaveat(unused.length
        ? 'No respondent chose ' + unused.map(function(i) { return i.name; }).join(' or ')
          + ', so those colours do not appear in the grid.'
        : ''),
      table: {
        caption: 'Main money worry chosen, out of ' + total + ' recognised responses.',
        columns: [
          { key: 'name', label: 'Main pressure' },
          { key: 'count', label: 'Respondents' },
          { key: 'percent', label: 'Share of responses (%)' }
        ],
        rows: items.map(function(item) {
          return {
            name: item.name,
            count: item.count,
            percent: st.percent(item.count, total)
          };
        })
      },
      provenance: surveyProvenance({
        Unit: 'Count of respondents, and squares out of 100',
        'Responses used': total + ' of ' + (vis.table ? vis.table.getRowCount() : total),
        Transformation: 'Counts converted to 100 squares using largest-remainder allocation, so the '
          + 'squares always total exactly 100'
      })
    };
  };


  builders['survey-cutback-heatmap'] = function(vis) {
    var st = stats();
    var counts = vis.counts || {};
    var cutbacks = vis.cutbacks || [];
    var statuses = vis.statuses || [];
    if (!vis.representedRows) return null;

    var totals = cutbacks.map(function(name) {
      var sum = 0;
      for (var s = 0; s < statuses.length; s++) {
        sum += (counts[name] || {})[statuses[s]] || 0;
      }
      return { name: name, total: sum };
    });

    var top = st.highest(totals, function(item) { return item.total; });
    if (!top || top.value === 0) return null;

    var unused = totals.filter(function(item) { return item.total === 0; });

    return {
      insight: top.item.name + ' is the most often selected cutback, chosen ' + top.value
        + ' times across the ' + vis.representedRows + ' respondents shown. Respondents could '
        + 'choose more than one, so the selections add up to more than the number of people.',
      caveat: surveyCaveat(unused.length
        ? 'No respondent selected ' + unused.map(function(i) { return i.name; }).join(' or ')
          + ', so those rows stay empty.'
        : ''),
      howToRead: 'Each cell is one cutback for one status group. Colour intensity is the count in '
        + 'that cell, running from 0 to the largest cell value; the number is printed in the cell '
        + 'as well. Shading is relative to the busiest cell, not to group size, so a small group '
        + 'will look pale even when most of its members chose that cutback.',
      table: {
        caption: 'Cutback selections by employment status ('
          + vis.representedRows + ' respondents, multiple selections allowed).',
        columns: [{ key: 'cutback', label: 'Cut back on' }]
          .concat(statuses.map(function(status) {
            return { key: status, label: status };
          }))
          .concat([{ key: 'total', label: 'Total selections' }]),
        rows: cutbacks.map(function(name) {
          var row = { cutback: name };
          var sum = 0;
          for (var s = 0; s < statuses.length; s++) {
            var value = (counts[name] || {})[statuses[s]] || 0;
            row[statuses[s]] = value;
            sum += value;
          }
          row.total = sum;
          return row;
        })
      },
      provenance: surveyProvenance({
        Unit: 'Count of selections (a respondent may appear in several rows)',
        'Responses used': surveyRowsUsed(vis.representedRows),
        Transformation: 'Multi-select answers split on semicolons and matched exactly against the '
          + 'known cutback list; unrecognised entries are ignored'
      })
    };
  };


  builders['survey-income-reality-gap'] = function(vis) {
    var st = stats();
    var rows = vis.rows || [];
    if (!rows.length) return null;

    var groups = rows.filter(function(row) { return row.label !== 'Overall'; });
    var overall = rows.filter(function(row) { return row.label === 'Overall'; })[0];
    if (!overall) return null;

    var widest = st.highest(groups, function(row) { return row.worry - row.income; });
    var smallest = rows.length > 1
      ? st.lowest(groups, function(row) { return row.count; })
      : null;

    var smallGroupNote = (smallest && smallest.value < 10)
      ? 'The ' + smallest.item.label + ' group has only ' + smallest.value
        + ' respondents, so its average is not stable.'
      : '';

    return {
      insight: 'Across all respondents, work worry averages '
        + st.format(overall.worry, 2) + ' out of 5 while income keeping up averages '
        + st.format(overall.income, 2) + '. The widest gap between the two is among '
        + widest.item.label + ' respondents (' + st.format(widest.value, 2)
        + ' points, n=' + widest.item.count + ').',
      caveat: surveyCaveat(smallGroupNote),
      howToRead: 'Each row is one group. The blue dot is the average rating for income keeping up '
        + 'and the red dot is the average work-worry rating, both on the survey’s 1 to 5 scale. '
        + 'The grey line between them is the gap. The Overall row includes every respondent, so it '
        + 'is not a separate group.',
      table: {
        caption: 'Mean work worry and income adequacy by status, on a 1 to 5 scale.',
        columns: [
          { key: 'label', label: 'Group' },
          { key: 'worry', label: 'Mean work worry' },
          { key: 'income', label: 'Mean income keeps up' },
          { key: 'gap', label: 'Gap' },
          { key: 'count', label: 'Respondents' }
        ],
        rows: rows.map(function(row) {
          return {
            label: row.label,
            worry: st.format(row.worry, 2),
            income: st.format(row.income, 2),
            gap: st.format(row.worry - row.income, 2),
            count: row.count
          };
        })
      },
      provenance: surveyProvenance({
        Unit: 'Mean rating on a 1 to 5 scale',
        'Responses used': surveyRowsUsed(vis.representedRows),
        Transformation: 'Means taken per status group; the Overall row repeats every respondent '
          + 'and is excluded from the response count'
      })
    };
  };


  builders['survey-status-pressure'] = function(vis) {
    var st = stats();
    var counts = vis.counts || {};
    var totals = vis.totals || {};
    var statuses = vis.statuses || [];
    var pressures = vis.pressures || [];
    if (!vis.representedRows) return null;

    var described = [];
    var smallGroups = [];

    for (var s = 0; s < statuses.length; s++) {
      var status = statuses[s];
      var groupTotal = totals[status] || 0;
      if (groupTotal === 0) continue;

      var options = pressures.map(function(name) {
        return { name: name, count: (counts[status] || {})[name] || 0 };
      });
      var top = st.highest(options, function(option) { return option.count; });
      if (!top || top.value === 0) continue;

      described.push(status + ' respondents most often name ' + top.item.name + ' ('
        + st.percent(top.value, groupTotal) + '% of ' + groupTotal + ')');

      if (groupTotal < 10) smallGroups.push(status + ' n=' + groupTotal);
    }

    if (!described.length) return null;

    var tableRowsOut = [];
    for (var i = 0; i < statuses.length; i++) {
      var row = { status: statuses[i] };
      for (var p = 0; p < pressures.length; p++) {
        row[pressures[p]] = (counts[statuses[i]] || {})[pressures[p]] || 0;
      }
      row.total = totals[statuses[i]] || 0;
      tableRowsOut.push(row);
    }

    return {
      insight: described.join('. ') + '.',
      caveat: surveyCaveat(smallGroups.length
        ? 'Some groups are very small (' + smallGroups.join(', ')
          + '), so their percentages move a lot with a single response.'
        : ''),
      howToRead: 'Each bar is normalised to the full width of its own group, so bar segments show '
        + 'shares within a group and not group sizes. The number of respondents in each group is '
        + 'printed at the end of its row.',
      table: {
        caption: 'Main pressure by employment status, counts of respondents.',
        columns: [{ key: 'status', label: 'Status' }]
          .concat(pressures.map(function(name) {
            return { key: name, label: name };
          }))
          .concat([{ key: 'total', label: 'Group total' }]),
        rows: tableRowsOut
      },
      provenance: surveyProvenance({
        Unit: 'Count of respondents, shown as a share within each status group',
        'Responses used': surveyRowsUsed(vis.representedRows),
        Transformation: 'Cross-tabulated by status and main pressure; a response is counted only '
          + 'when both values are recognised'
      })
    };
  };


  builders['sa-population-group-census'] = function(vis) {
    var st = stats();
    var table = vis.data;
    if (!table || table.getRowCount() === 0) return null;

    var year = (vis.select && typeof vis.select.value === 'function')
      ? vis.select.value()
      : (vis.years ? vis.years[0] : '2022');
    if (!year) year = '2022';

    var groups = [];
    for (var r = 0; r < table.getRowCount(); r++) {
      var value = Number(table.getString(r, year));
      groups.push({
        group: table.getString(r, 'population_group'),
        value: isFinite(value) ? value : null
      });
    }

    var top = st.highest(groups, function(g) { return g.value; });
    if (!top) return null;

    var columns = [{ key: 'group', label: 'Population group' }];
    var years = vis.years || [year];
    years.forEach(function(y) {
      columns.push({ key: y, label: y + ' (%)' });
    });

    return {
      insight: 'In the ' + year + ' census the ' + top.item.group
        + ' group is the largest at ' + st.format(top.value, 1)
        + '% of the population. Use the census-year control to change the year shown.',
      caveat: 'Population groups are official statistical categories used for reporting; they are '
        + 'not biological groups.',
      table: {
        caption: 'Population group shares across all census years in this dataset.',
        columns: columns,
        rows: tableRows(table, columns.map(function(column) {
          return { key: column.key, source: column.key === 'group' ? 'population_group' : column.key };
        }))
      },
      provenance: provenanceFor('population_group_census_1996_2022.csv', {
        Source: 'Statistics South Africa census tables',
        Period: (years[0] || '') + '-' + (years[years.length - 1] || ''),
        Unit: 'Percentage of total population',
        'Year shown': year,
        Transformation: 'One column per census year; the chart shows the selected year only'
      })
    };
  };


  builders['sa-sex-age-2022'] = function(vis) {
    var st = stats();
    var table = vis.data;
    if (!table || table.getRowCount() === 0) return null;

    var groups = [];
    for (var r = 0; r < table.getRowCount(); r++) {
      var female = Number(table.getString(r, 'Female'));
      var male = Number(table.getString(r, 'Male'));
      var total = female + male;
      groups.push({
        age: table.getString(r, 'age_group'),
        female: female,
        male: male,
        share: (isFinite(total) && total > 0) ? (female / total) * 100 : null
      });
    }

    var top = st.highest(groups, function(g) { return g.share; });
    var bottom = st.lowest(groups, function(g) { return g.share; });
    if (!top || !bottom) return null;

    return {
      insight: 'The female share is highest in the ' + top.item.age + ' age group at '
        + st.format(top.value, 1) + '% and lowest in the ' + bottom.item.age + ' group at '
        + st.format(bottom.value, 1) + '%.',
      caveat: 'Each bar is scaled to its own age group, so the bars show the split within a group '
        + 'and not how large that age group is.',
      table: {
        caption: 'Female and male shares within each age group, census 2022.',
        columns: [
          { key: 'age', label: 'Age group' },
          { key: 'female', label: 'Female (%)' },
          { key: 'male', label: 'Male (%)' }
        ],
        rows: groups.map(function(g) {
          return {
            age: g.age,
            female: st.format(g.female, 1),
            male: st.format(g.male, 1)
          };
        })
      },
      provenance: provenanceFor('sex_by_age_2022.csv', {
        Source: 'Statistics South Africa Census 2022',
        Period: '2022',
        Unit: 'Percentage within each age group',
        'Age groups shown': groups.length,
        Transformation: 'Values used as published; each age group sums to about 100%'
      })
    };
  };


  builders['sa-age-sex-bubble-2022'] = function(vis) {
    var st = stats();
    var table = vis.data;
    if (!table || table.getRowCount() === 0) return null;

    var groups = [];
    for (var r = 0; r < table.getRowCount(); r++) {
      groups.push({
        age: table.getString(r, 'age_group'),
        midpoint: Number(table.getString(r, 'age_midpoint')),
        female: Number(table.getString(r, 'female_percent')),
        population: Number(table.getString(r, 'total_population'))
      });
    }

    var largest = st.highest(groups, function(g) { return g.population; });
    var mostFemale = st.highest(groups, function(g) { return g.female; });
    if (!largest || !mostFemale) return null;

    return {
      insight: 'The largest age group is ' + largest.item.age + ' with '
        + st.formatCount(largest.value) + ' people. The female share is highest in the '
        + mostFemale.item.age + ' group at ' + st.format(mostFemale.value, 1)
        + '%, and it is generally higher in older age groups.',
      caveat: 'The vertical axis is clipped to 45-75%, so it does not start at zero and small '
        + 'differences in female share look larger than they are.',
      howToRead: 'Horizontal position is the mid-point of the age group and vertical position is '
        + 'the percentage of that group who are female. Circle width scales with the number of '
        + 'people in the group; the size legend gives example values. Circle width, not area, '
        + 'carries the value.',
      table: {
        caption: 'Age groups by size and female share, census 2022.',
        columns: [
          { key: 'age', label: 'Age group' },
          { key: 'population', label: 'Total population' },
          { key: 'female', label: 'Female (%)' }
        ],
        rows: groups.map(function(g) {
          return {
            age: g.age,
            population: st.formatCount(g.population),
            female: st.format(g.female, 1)
          };
        })
      },
      provenance: provenanceFor('age_sex_bubble_2022.csv', {
        Source: 'Statistics South Africa Census 2022',
        Period: '2022',
        Unit: 'People, and percentage female within the age group',
        'Age groups shown': groups.length,
        Transformation: 'Age-group mid-points derived for plotting; population and female share as published'
      })
    };
  };


  builders['sa-youth-unemployment'] = function(vis) {
    var st = stats();
    var table = vis.data;
    if (!table || table.getRowCount() === 0) return null;

    var points = [];
    for (var r = 0; r < table.getRowCount(); r++) {
      var year = Number(table.getString(r, 'year'));
      var rate = Number(table.getString(r, 'youth_unemployment_rate'));
      if (isFinite(year) && isFinite(rate)) points.push({ year: year, rate: rate });
    }
    if (!points.length) return null;

    var peak = st.highest(points, function(p) { return p.rate; });
    var first = points[0];
    var last = points[points.length - 1];

    return {
      insight: 'Youth unemployment is highest at ' + st.format(peak.value, 1) + '% in '
        + peak.item.year + '. Between ' + first.year + ' and ' + last.year + ' the rate moves '
        + 'from ' + st.format(first.rate, 1) + '% to ' + st.format(last.rate, 1) + '%, '
        + st.describeChange(first.rate, last.rate, 1, 'percentage points') + '.',
      caveat: 'Later years in this series are modelled estimates rather than direct survey readings.',
      table: {
        caption: 'Youth unemployment rate by year.',
        columns: [
          { key: 'year', label: 'Year' },
          { key: 'rate', label: 'Youth unemployment (%)' }
        ],
        rows: points.map(function(p) {
          return { year: p.year, rate: st.format(p.rate, 1) };
        })
      },
      provenance: provenanceFor('sa_youth_unemployment_1991_2025.csv', {
        Source: 'World Bank / ILO modelled estimates',
        Period: first.year + '-' + last.year,
        Unit: 'Percentage of the youth labour force',
        'Observations used': points.length + ' years',
        Transformation: 'Plotted as supplied; no smoothing'
      })
    };
  };


  builders['sa-life-expectancy'] = function(vis) {
    var st = stats();
    var series = vis.series || [];
    var years = vis.years || [];
    if (!series.length || !years.length) return null;

    var lastIndex = years.length - 1;
    var latest = series.map(function(entry) {
      return { label: entry.label, value: entry.values[lastIndex] };
    });

    var top = st.highest(latest, function(entry) { return entry.value; });
    var bottom = st.lowest(latest, function(entry) { return entry.value; });
    if (!top || !bottom) return null;

    var total = series.filter(function(entry) { return entry.label === 'Total'; })[0];
    var lowestPoint = total
      ? st.lowest(total.values.map(function(value, index) {
          return { year: years[index], value: value };
        }), function(point) { return point.value; })
      : null;

    var recovery = lowestPoint
      ? ' Overall life expectancy is lowest in ' + lowestPoint.item.year + ' at '
        + st.format(lowestPoint.value, 1) + ' years and is higher again by ' + years[lastIndex] + '.'
      : '';

    return {
      insight: 'In ' + years[lastIndex] + ', ' + top.item.label + ' life expectancy at birth is '
        + st.format(top.value, 1) + ' years and ' + bottom.item.label + ' is '
        + st.format(bottom.value, 1) + ' years, a difference of '
        + st.format(top.value - bottom.value, 1) + ' years.' + recovery,
      caveat: 'Life expectancy at birth is a period measure calculated from current mortality '
        + 'rates, not a prediction for anyone born in that year.',
      table: {
        caption: 'Life expectancy at birth in years, one row per year.',
        columns: [{ key: 'year', label: 'Year' }]
          .concat(series.map(function(entry) {
            return { key: entry.label, label: entry.label };
          })),
        rows: years.map(function(year, index) {
          var row = { year: year };
          for (var s2 = 0; s2 < series.length; s2++) {
            row[series[s2].label] = st.format(series[s2].values[index], 1);
          }
          return row;
        })
      },
      provenance: provenanceFor('sa_life_expectancy_1960_2024.csv', {
        Source: 'World Bank indicators',
        Period: years[0] + '-' + years[lastIndex],
        Unit: 'Years of life expectancy at birth',
        'Series shown': series.length,
        Transformation: 'Wide-format rows read one series per row; values used as published'
      })
    };
  };


  builders['climate-change'] = function(vis) {
    var st = stats();
    var table = vis.data;
    if (!table || table.getRowCount() === 0) return null;

    var points = [];
    for (var r = 0; r < table.getRowCount(); r++) {
      var year = Number(table.getString(r, 'year'));
      var value = Number(table.getString(r, 'temperature_anomaly_c'));
      if (isFinite(year) && isFinite(value)) points.push({ year: year, value: value });
    }
    if (!points.length) return null;

    var warmest = st.highest(points, function(p) { return p.value; });
    var coolest = st.lowest(points, function(p) { return p.value; });
    var last = points[points.length - 1];

    return {
      insight: 'The warmest year in this series is ' + warmest.item.year + ' at '
        + st.format(warmest.value, 2) + ' °C above the long-term average, and the coolest is '
        + coolest.item.year + ' at ' + st.format(coolest.value, 2) + ' °C. The latest year, '
        + last.year + ', is ' + st.format(last.value, 2) + ' °C.',
      caveat: 'The year sliders change the range drawn; the full series covers '
        + points[0].year + '-' + last.year + '.',
      howToRead: 'The line is the yearly temperature anomaly against the long-term average, and '
        + 'the shaded column behind each year repeats that same value as colour, from blue for the '
        + 'coolest year in view to red for the warmest. The dashed horizontal line is the mean of '
        + 'the years currently selected.',
      table: {
        caption: 'Global surface temperature anomaly by year.',
        columns: [
          { key: 'year', label: 'Year' },
          { key: 'value', label: 'Anomaly (°C)' }
        ],
        rows: points.map(function(p) {
          return { year: p.year, value: st.format(p.value, 2) };
        })
      },
      provenance: provenanceFor('global_temperature_anomaly_1880_2025.csv', {
        Source: 'NASA GISTEMP v4',
        Period: points[0].year + '-' + last.year,
        Unit: 'Degrees Celsius relative to the long-term average',
        'Observations used': points.length + ' years',
        Transformation: 'Annual means as published; the reference line is the mean of the selected range'
      })
    };
  };


  var ChartInsights = {
    builders: builders,

    has: function(visId) {
      return Object.prototype.hasOwnProperty.call(builders, visId);
    },

    // Returns null whenever a trustworthy summary cannot be produced.
    build: function(vis) {
      if (!isReady(vis) || !this.has(vis.id)) return null;

      var model;
      try {
        model = builders[vis.id](vis);
      } catch (error) {
        if (typeof debugLog === 'function') {
          debugLog('Insight builder failed for', vis.id, error);
        }
        return null;
      }

      if (!model || typeof model.insight !== 'string' || model.insight.length === 0) {
        return null;
      }

      // A summary that would print NaN or undefined is worse than no summary.
      if (/NaN|undefined|Infinity/.test(model.insight)) {
        if (typeof debugLog === 'function') {
          debugLog('Insight rejected as non-finite for', vis.id, model.insight);
        }
        return null;
      }

      return model;
    }
  };

  global.ChartInsights = ChartInsights;
}(window));
