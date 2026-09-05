// Compares population share and earnings
function ZAPopulationGroupEarnings() {

  this.name = 'Population group earnings';
  this.id = 'za-population-group-earnings';
  this.loaded = false;
  this.population = null;
  this.earnings = null;
  this.rows = [];

  this.preload = function() {
    var self = this;
    this.population = loadTable('data/inequality/za_population_group_shares.csv', 'csv', 'header', function(table) {
      self.population = table;
      self.checkLoaded();
    });
    this.earnings = loadTable('data/inequality/za_population_group_earnings.csv', 'csv', 'header', function(table) {
      self.earnings = table;
      self.checkLoaded();
    });
  };

  this.checkLoaded = function() {
    this.loaded = this.population && this.earnings
        && this.population.getRowCount() > 0
        && this.earnings.getRowCount() > 0;
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
    if (!this.loaded) {
      this.drawLoading();
      return;
    }

    if (this.rows.length == 0) {
      this.setup();
    }

    background(SATheme.bg);
    this.drawTitle();
    this.drawChart();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading population-group earnings data...', width / 2, height / 2);
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

  this.drawChart = function() {
    if (isPhoneChart()) {
      this.drawPhoneChart();
      return;
    }

    var compact = isCompactChart();
    var leftEdge = compact ? 106 : 150;
    var rightEdge = width - (compact ? 58 : 52);
    var startTop = 118;
    var rowSpacing = compact ? 58 : 70;
    var shareColWidth = (rightEdge - leftEdge) * (compact ? 0.25 : 0.28);
    var earningsColLeft = leftEdge + shareColWidth + (compact ? 34 : 54);
    var earningsColWidth = rightEdge - earningsColLeft;
    var barThick = compact ? 16 : 20;
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
      line(tickX, startTop - 4, tickX, startTop + (rowSpacing * (this.rows.length - 1)) + barThick + 22);
      noStroke();
      fill(SATheme.textMuted);
      textAlign(CENTER, TOP);
      text('R' + (step / 1000) + 'k', tickX, startTop + (rowSpacing * (this.rows.length - 1)) + barThick + 28);
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

    noStroke();
    fill(SATheme.textMuted);
    textStyle(NORMAL);
    chartTextSize(11);
    textAlign(LEFT, BOTTOM);
    text('Note: earnings are not wealth. This chart shows labour-market earnings by official population group.',
         24,
         isPhoneChart() ? height - 46 : height - 30,
         width - 48,
         isPhoneChart() ? 42 : 28);
  };

  this.drawPhoneChart = function() {
    var left = 96;
    var right = width - 24;
    var top = 104;
    var rowGap = 64;
    var barWidth = right - left;
    var barHeight = 8;
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
      drawBar(left, y + 13, shareWidth, barHeight, SATheme.blueTint);

      noStroke();
      fill(SATheme.text);
      textAlign(LEFT, TOP);
      text('Earnings', left, y + 28);
      textAlign(RIGHT, TOP);
      text('R' + formatThousands(row.earnings), right, y + 28);
      drawBar(left, y + 41, earningsWidth, barHeight, earningsColour);

      if (mouseIsOverRect(left, y + 13, shareWidth, barHeight)) {
        drawChartTooltip(row.group, row.populationShare.toFixed(1) + '%', 'population share');
      } else if (mouseIsOverRect(left, y + 41, earningsWidth, barHeight)) {
        drawChartTooltip(row.group, 'R' + formatThousands(row.earnings), 'mean monthly earnings');
      }
    }

    noStroke();
    fill(SATheme.textMuted);
    textStyle(NORMAL);
    chartTextSize(9);
    textAlign(LEFT, TOP);
    text('Note: earnings are not wealth. This chart shows labour-market earnings by official population group.',
         24, isPhoneChart() ? height - 54 : height - 42, width - 48, isPhoneChart() ? 50 : 36);
  };

  this.getExportData = function() {
    return rowsToExportData(this.rows);
  };
}
