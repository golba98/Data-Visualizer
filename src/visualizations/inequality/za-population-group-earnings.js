// Uses the template's visualisation interface: name, id, preload, setup, draw, destroy.
// Everything below is own.
/* Start - own code */

// Compares population share and earnings
function ZAPopulationGroupEarnings() {

  this.name = 'Population group earnings';
  this.id = 'za-population-group-earnings';
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading population-group earnings data...'
  });
  this.population = null;
  this.earnings = null;
  this.rows = [];

  this.preload = function() {
    var self = this;
    this.loadState.loadTables([
      {
        path: 'data/inequality/za_population_group_shares.csv',
        requiredColumns: ['population_group', 'population_share_percent'],
        numericColumns: ['population_share_percent'],
        assign: function(table) { self.population = table; }
      },
      {
        path: 'data/inequality/za_population_group_earnings.csv',
        requiredColumns: ['population_group', 'mean_real_monthly_earnings_rand'],
        numericColumns: ['mean_real_monthly_earnings_rand'],
        assign: function(table) { self.earnings = table; }
      }
    ]);
  };

  this.setup = function() {
    if (!this.loaded) {
      return;
    }

    var shares = {};
    for (var i = 0; i < this.population.getRowCount(); i++) {
      shares[this.population.getString(i, 'population_group')] =
          this.population.getNum(i, 'population_share_percent');
    }

    this.rows = [];
    for (var row = 0; row < this.earnings.getRowCount(); row++) {
      var group = this.earnings.getString(row, 'population_group');
      this.rows.push({
        group: group,
        populationShare: shares[group] || 0,
        earnings: this.earnings.getNum(row, 'mean_real_monthly_earnings_rand')
      });
    }
  };

  this.draw = function() {
    if (this.loadState.draw()) return;

    if (this.rows.length == 0) {
      this.setup();
    }

    background(SATheme.bg);
    this.drawTitle();
    this.drawChart();
  };

  this.drawTitle = function() {
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    textAlign(LEFT, TOP);
    text('Population share compared with mean earnings', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text('Official population-group categories are compared with Stats SA mean monthly real earnings for 2011-2015.',
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 54 : 40);
  };

  this.note = 'Note: earnings are not wealth. This chart shows labour-market earnings by official population group. Colour only highlights the highest-earning group; it does not encode a second value.';
  this.phoneNote = 'Note: earnings are not wealth. This chart shows labour-market earnings by official population group.';

  // Spreads the rows between the heading and the footnote. On phones each row
  // stacks a label and bar for population, then for earnings.
  this.getRowLayout = function() {
    var phone = isPhoneChart();
    var footnoteTop = phone
      ? chartFootnoteTop(this.phoneNote, 9)
      : chartFootnoteTop(this.note, 11);

    if (phone) {
      var phoneBottom = footnoteTop - 8;
      var phoneStep = fitRowStep(104, phoneBottom, this.rows.length, 64);
      var roomy = phoneStep >= 58;

      return {
        top: 104,
        step: phoneStep,
        barA: roomy ? 13 : 12,
        labelB: roomy ? 28 : 24,
        barB: roomy ? 41 : 36,
        bar: 8,
        rowHeight: roomy ? 49 : 44,
        rowCount: this.rows.length,
        rowsBottom: phoneBottom,
        footnoteTop: footnoteTop
      };
    }

    var compact = isCompactChart();
    var bar = compact ? 16 : 20;
    var rowsBottom = footnoteTop - 30;
    var step = fitRowStep(118, rowsBottom, this.rows.length, compact ? 58 : 70);

    return {
      top: 118,
      step: step,
      bar: bar,
      rowHeight: Math.max(bar, 14),
      rowCount: this.rows.length,
      rowsBottom: rowsBottom,
      gridBottom: 118 + (step * (this.rows.length - 1)) + bar + 8,
      footnoteTop: footnoteTop
    };
  };

  this.drawChart = function() {
    if (isPhoneChart()) {
      this.drawPhoneChart();
      return;
    }

    var compact = isCompactChart();
    var rowLayout = this.getRowLayout();
    var leftEdge = compact ? 106 : 150;
    var rightEdge = width - (compact ? 58 : 52);
    var startTop = rowLayout.top;
    var rowSpacing = rowLayout.step;
    var shareColWidth = (rightEdge - leftEdge) * (compact ? 0.25 : 0.28);
    var earningsColLeft = leftEdge + shareColWidth + (compact ? 34 : 54);
    var earningsColWidth = rightEdge - earningsColLeft;
    var barThick = rowLayout.bar;
    var maxEarningScale = 26000;

    noStroke();
    textStyle(NORMAL);
    chartTextSize(compact ? 10 : 11);
    fill(SATheme.textMuted);
    textAlign(LEFT, CENTER);
    text('Population share', leftEdge, startTop - 18);
    text('Mean monthly earnings', earningsColLeft, startTop - 18);

    stroke(SATheme.grid);
    strokeWeight(1);
    for (var step = 0; step <= maxEarningScale; step += 5000) {
      var tickX = map(step, 0, maxEarningScale, earningsColLeft, earningsColLeft + earningsColWidth);
      line(tickX, startTop - 4, tickX, rowLayout.gridBottom);
      noStroke();
      fill(SATheme.textMuted);
      textAlign(CENTER, TOP);
      text('R' + (step / 1000) + 'k', tickX, rowLayout.gridBottom + 6);
      stroke(SATheme.grid);
    }

    for (var rIdx = 0; rIdx < this.rows.length; rIdx++) {
      var entry = this.rows[rIdx];
      var rowY = startTop + (rIdx * rowSpacing);
      var popWidth = map(entry.populationShare, 0, 85, 0, shareColWidth);
      var earnWidth = map(entry.earnings, 0, maxEarningScale, 0, earningsColWidth);
      var earnColor = entry.group === 'White' ? SATheme.red : SATheme.green;

      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(compact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(entry.group, leftEdge - 12, rowY + (barThick / 2));

      drawBar(leftEdge, rowY, popWidth, barThick, SATheme.blueTint);
      drawBar(earningsColLeft, rowY, earnWidth, barThick, earnColor);

      if (mouseIsOverRect(leftEdge, rowY, popWidth, barThick)) {
        drawChartTooltip(entry.group, entry.populationShare.toFixed(1) + '%', 'population share');
      } else if (mouseIsOverRect(earningsColLeft, rowY, earnWidth, barThick)) {
        drawChartTooltip(entry.group, 'R' + formatThousands(entry.earnings), 'mean monthly earnings');
      }

      fill(SATheme.text);
      textStyle(NORMAL);
      chartTextSize(compact ? 10 : 11);
      textAlign(LEFT, CENTER);
      text(entry.populationShare.toFixed(1) + '%', leftEdge + popWidth + 6, rowY + (barThick / 2));
      text('R' + formatThousands(entry.earnings), earningsColLeft + earnWidth + 6, rowY + (barThick / 2));

      if (entry.group === 'White' && !isCompactChart()) {
        drawAnnotationBadge(
          'Highest shown mean',
          'R' + formatThousands(entry.earnings),
          width - 210,
          82,
          SATheme.red
        );
      }
    }

    drawChartFootnote(this.note, 11);
  };

  this.drawPhoneChart = function() {
    var rowLayout = this.getRowLayout();
    var left = 96;
    var right = width - 24;
    var top = rowLayout.top;
    var rowGap = rowLayout.step;
    var barWidth = right - left;
    var barHeight = rowLayout.bar;
    var maxEarnings = 26000;

    for (var i = 0; i < this.rows.length; i++) {
      var row = this.rows[i];
      var y = top + (i * rowGap);
      var shareWidth = map(row.populationShare, 0, 85, 0, barWidth);
      var earningsWidth = map(row.earnings, 0, maxEarnings, 0, barWidth);
      var earningsColour = row.group == 'White' ? SATheme.red : SATheme.green;

      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(9);
      textAlign(RIGHT, TOP);
      text(row.group, left - 10, y + 1);

      textStyle(NORMAL);
      textAlign(LEFT, TOP);
      text('Population', left, y);
      textAlign(RIGHT, TOP);
      text(row.populationShare.toFixed(1) + '%', right, y);
      drawBar(left, y + rowLayout.barA, shareWidth, barHeight, SATheme.blueTint);

      noStroke();
      fill(SATheme.text);
      textAlign(LEFT, TOP);
      text('Earnings', left, y + rowLayout.labelB);
      textAlign(RIGHT, TOP);
      text('R' + formatThousands(row.earnings), right, y + rowLayout.labelB);
      drawBar(left, y + rowLayout.barB, earningsWidth, barHeight, earningsColour);

      if (mouseIsOverRect(left, y + rowLayout.barA, shareWidth, barHeight)) {
        drawChartTooltip(row.group, row.populationShare.toFixed(1) + '%', 'population share');
      } else if (mouseIsOverRect(left, y + rowLayout.barB, earningsWidth, barHeight)) {
        drawChartTooltip(row.group, 'R' + formatThousands(row.earnings), 'mean monthly earnings');
      }
    }

    drawChartFootnote(this.phoneNote, 9);
  };

  this.getExportData = function() {
    return rowsToExportData(this.rows);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
