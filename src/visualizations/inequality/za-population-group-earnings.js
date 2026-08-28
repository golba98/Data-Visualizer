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
    textSize(width < 520 ? 13 : 17);
    textAlign(LEFT, TOP);
    text('Population share compared with mean earnings', 24, 18, width - 48, 36);

    textStyle(NORMAL);
    textSize(12);
    fill(SATheme.textMuted);
    text('Official population-group categories are compared with Stats SA mean monthly real earnings for 2011-2015.',
         24,
         width < 520 ? 54 : 44,
         width - 48,
         40);
  };

  this.drawChart = function() {
    if (width < 520) {
      this.drawPhoneChart();
      return;
    }

    var compact = width < 720;
    var left = compact ? 106 : 150;
    var right = width - (compact ? 58 : 52);
    var top = 118;
    var rowGap = compact ? 58 : 70;
    var shareWidth = (right - left) * (compact ? 0.25 : 0.28);
    var earningsLeft = left + shareWidth + (compact ? 34 : 54);
    var earningsWidth = right - earningsLeft;
    var barHeight = compact ? 16 : 20;
    var maxEarnings = 26000;

    noStroke();
    textStyle(NORMAL);
    textSize(compact ? 10 : 11);
    fill(SATheme.textMuted);
    textAlign(LEFT, CENTER);
    text('Population share', left, top - 18);
    text('Mean monthly earnings', earningsLeft, top - 18);

    stroke(SATheme.grid);
    strokeWeight(1);
    for (var tick = 0; tick <= maxEarnings; tick += 5000) {
      var x = map(tick, 0, maxEarnings, earningsLeft, earningsLeft + earningsWidth);
      line(x, top - 4, x, top + (rowGap * (this.rows.length - 1)) + barHeight + 22);
      noStroke();
      fill(SATheme.textMuted);
      textAlign(CENTER, TOP);
      text('R' + (tick / 1000) + 'k', x, top + (rowGap * (this.rows.length - 1)) + barHeight + 28);
      stroke(SATheme.grid);
    }

    for (var i = 0; i < this.rows.length; i++) {
      var row = this.rows[i];
      var y = top + (i * rowGap);
      var shareBarWidth = map(row.populationShare, 0, 85, 0, shareWidth);
      var earningsBarWidth = map(row.earnings, 0, maxEarnings, 0, earningsWidth);
      var colour = row.group == 'White' ? SATheme.red : SATheme.green;

      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      textSize(compact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(row.group, left - 12, y + (barHeight / 2));

      drawBar(left, y, shareBarWidth, barHeight, SATheme.blueTint);
      drawBar(earningsLeft, y, earningsBarWidth, barHeight, colour);

      if (mouseIsOverRect(left, y, shareBarWidth, barHeight)) {
        drawChartTooltip(row.group, row.populationShare.toFixed(1) + '%', 'population share');
      } else if (mouseIsOverRect(earningsLeft, y, earningsBarWidth, barHeight)) {
        drawChartTooltip(row.group, 'R' + formatThousands(row.earnings), 'mean monthly earnings');
      }

      fill(SATheme.text);
      textStyle(NORMAL);
      textSize(compact ? 10 : 11);
      textAlign(LEFT, CENTER);
      text(row.populationShare.toFixed(1) + '%', left + shareBarWidth + 6, y + (barHeight / 2));
      text('R' + formatThousands(row.earnings), earningsLeft + earningsBarWidth + 6, y + (barHeight / 2));

      if (row.group == 'White' && width >= 680) {
        drawAnnotationBadge(
          'Highest shown mean',
          'R' + formatThousands(row.earnings),
          width - 210,
          82,
          SATheme.red
        );
      }
    }

    noStroke();
    fill(SATheme.textMuted);
    textStyle(NORMAL);
    textSize(11);
    textAlign(LEFT, BOTTOM);
    text('Note: earnings are not wealth. This chart shows labour-market earnings by official population group.',
         24,
         height - 30,
         width - 48,
         28);
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
      textSize(9);
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
    textSize(9);
    textAlign(LEFT, TOP);
    text('Note: earnings are not wealth. This chart shows labour-market earnings by official population group.',
         24, height - 42, width - 48, 36);
  };

  this.getExportData = function() {
    return rowsToExportData(this.rows);
  };
}
