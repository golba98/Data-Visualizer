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

    // Stacked from measured text: the rows take the space between the title
    // block and the footnote.
    background(SATheme.bg);
    var top = this.drawTitle();
    var bottom = this.drawFootnote();

    if (isPhoneChart()) {
      this.drawPhoneChart(top + 12, bottom - 12);
    } else {
      this.drawChart(top + 30, bottom - 12);
    }
  };

  // The "highest shown mean" badge sits top-right on wide canvases.
  this.showsBadge = function() {
    return !isCompactChart() && annotationsAreVisible();
  };

  // Returns the y below the title block.
  this.drawTitle = function() {
    var blockWidth = this.showsBadge() ? width - 268 : width - 48;
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    var y = 18 + drawWrappedText('Population share compared with mean earnings', 24, 18, blockWidth);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    y += 6;
    return y + drawWrappedText('Official population-group categories are compared with Stats SA mean monthly real earnings for 2011-2015.',
                               24, y, blockWidth);
  };

  // Draws the note against the bottom edge and returns its top.
  this.drawFootnote = function() {
    var note = isPhoneChart()
      ? 'Note: earnings are not wealth. This chart shows labour-market earnings by official population group.'
      : 'Note: earnings are not wealth. This chart shows labour-market earnings by official population group. Colour only highlights the highest-earning group; it does not encode a second value.';
    noStroke();
    fill(SATheme.textMuted);
    textStyle(NORMAL);
    chartTextSize(isPhoneChart() ? 10 : 11);
    var top = height - 14 - wrappedTextHeight(note, width - 48);
    drawWrappedText(note, 24, top, width - 48);
    return top;
  };

  this.drawChart = function(top, bottom) {
    var compact = isCompactChart();
    var leftEdge = compact ? 106 : 150;
    var rightEdge = width - (compact ? 58 : 52);
    var startTop = top;
    var barThick = compact ? 16 : 20;
    var axisSpace = 34;
    var rowCount = Math.max(1, this.rows.length);
    var rowSpacing = rowCount > 1
      ? constrain((bottom - axisSpace - barThick - startTop) / (rowCount - 1), barThick + 8, compact ? 58 : 70)
      : 0;
    var barsBottom = startTop + (rowSpacing * (rowCount - 1)) + barThick;
    var shareColWidth = (rightEdge - leftEdge) * (compact ? 0.25 : 0.28);
    var earningsColLeft = leftEdge + shareColWidth + (compact ? 34 : 54);
    var earningsColWidth = rightEdge - earningsColLeft;
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
      line(tickX, startTop - 4, tickX, barsBottom + 8);
      noStroke();
      fill(SATheme.textMuted);
      textAlign(CENTER, TOP);
      text('R' + (step / 1000) + 'k', tickX, barsBottom + 14);
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

      if (entry.group === 'White' && this.showsBadge()) {
        drawAnnotationBadge(
          'Highest shown mean',
          'R' + formatThousands(entry.earnings),
          width - 210,
          18,
          SATheme.red
        );
      }
    }
  };

  // Phones: a key, then two slim bars per group with their values at the
  // bar ends. Each bar's full-width band is its tap target.
  this.drawPhoneChart = function(top, bottom) {
    var left = 96;
    var right = width - 24;
    var barSpan = right - left - 48;
    var barHeight = 9;
    var pairHeight = 23;
    var maxEarnings = 26000;

    var key = drawColourKey(24, top, [
      { label: 'Population share', colour: SATheme.blueTint },
      { label: 'Mean monthly earnings (highest in red)', colour: SATheme.green }
    ]);
    var rowsTop = top + key.height + 10;
    var rowCount = Math.max(1, this.rows.length);
    var rowGap = rowCount > 1
      ? constrain((bottom - rowsTop - pairHeight) / (rowCount - 1), pairHeight + 6, 64)
      : 0;

    for (var i = 0; i < this.rows.length; i++) {
      var row = this.rows[i];
      var y = rowsTop + (i * rowGap);
      var shareWidth = map(row.populationShare, 0, 85, 0, barSpan);
      var earningsWidth = map(row.earnings, 0, maxEarnings, 0, barSpan);
      var earningsColour = row.group == 'White' ? SATheme.red : SATheme.green;

      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(10);
      textAlign(RIGHT, CENTER);
      text(row.group, left - 10, y + (pairHeight / 2));

      drawBar(left, y, shareWidth, barHeight, SATheme.blueTint);
      drawBar(left, y + pairHeight - barHeight, earningsWidth, barHeight, earningsColour);

      noStroke();
      fill(SATheme.text);
      textStyle(NORMAL);
      chartTextSize(10);
      textAlign(LEFT, CENTER);
      text(row.populationShare.toFixed(1) + '%', left + shareWidth + 6, y + (barHeight / 2));
      text('R' + formatThousands(row.earnings), left + earningsWidth + 6, y + pairHeight - (barHeight / 2));

      if (mouseIsOverRect(left, y - 2, right - left, pairHeight / 2 + 2)) {
        drawChartTooltip(row.group, row.populationShare.toFixed(1) + '%', 'population share');
      } else if (mouseIsOverRect(left, y + pairHeight / 2, right - left, pairHeight / 2 + 2)) {
        drawChartTooltip(row.group, 'R' + formatThousands(row.earnings), 'mean monthly earnings');
      }
    }
  };

  this.getExportData = function() {
    return rowsToExportData(this.rows);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
