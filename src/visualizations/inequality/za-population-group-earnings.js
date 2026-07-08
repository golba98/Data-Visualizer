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

    background(255);
    this.drawTitle();
    this.drawChart();
  };

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading population-group earnings data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textStyle(BOLD);
    textSize(17);
    textAlign(LEFT, TOP);
    text('Population share compared with mean earnings', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(80);
    text('Official population-group categories are compared with Stats SA mean monthly real earnings for 2011-2015.',
         24,
         44,
         width - 48,
         40);
  };

  this.drawChart = function() {
    var compact = width < 720;
    var left = compact ? 106 : 150;
    var right = width - (compact ? 28 : 52);
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
    fill(80);
    textAlign(LEFT, CENTER);
    text('Population share', left, top - 18);
    text('Mean monthly earnings', earningsLeft, top - 18);

    stroke(220);
    strokeWeight(1);
    for (var tick = 0; tick <= maxEarnings; tick += 5000) {
      var x = map(tick, 0, maxEarnings, earningsLeft, earningsLeft + earningsWidth);
      line(x, top - 4, x, top + (rowGap * (this.rows.length - 1)) + barHeight + 22);
      noStroke();
      fill(100);
      textAlign(CENTER, TOP);
      text('R' + (tick / 1000) + 'k', x, top + (rowGap * (this.rows.length - 1)) + barHeight + 28);
      stroke(220);
    }

    for (var i = 0; i < this.rows.length; i++) {
      var row = this.rows[i];
      var y = top + (i * rowGap);
      var shareBarWidth = map(row.populationShare, 0, 85, 0, shareWidth);
      var earningsBarWidth = map(row.earnings, 0, maxEarnings, 0, earningsWidth);
      var colour = row.group == 'White' ? SATheme.red : SATheme.green;

      noStroke();
      fill(0);
      textStyle(BOLD);
      textSize(compact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(row.group, left - 12, y + (barHeight / 2));

      drawBar(left, y, shareBarWidth, barHeight, SATheme.blueTint);
      drawBar(earningsLeft, y, earningsBarWidth, barHeight, colour);

      fill(0);
      textStyle(NORMAL);
      textSize(compact ? 10 : 11);
      textAlign(LEFT, CENTER);
      text(row.populationShare.toFixed(1) + '%', left + shareBarWidth + 6, y + (barHeight / 2));
      text('R' + formatThousands(row.earnings), earningsLeft + earningsBarWidth + 6, y + (barHeight / 2));
    }

    noStroke();
    fill(90);
    textStyle(NORMAL);
    textSize(11);
    textAlign(LEFT, BOTTOM);
    text('Note: earnings are not wealth. This chart shows labour-market earnings by official population group.',
         24,
         height - 30,
         width - 48,
         28);
  };
}
