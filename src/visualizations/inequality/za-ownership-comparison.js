function ZAOwnershipComparison() {

  this.name = 'Population vs ownership';
  this.id = 'za-ownership-comparison';
  this.loaded = false;
  this.population = null;
  this.income = null;
  this.wealth = null;
  this.rows = [];

  this.preload = function() {
    var self = this;
    this.population = loadTable('data/inequality/za_population_groups.csv', 'csv', 'header', function(table) {
      self.population = table;
      self.checkLoaded();
    });
    this.income = loadTable('data/inequality/za_income_distribution.csv', 'csv', 'header', function(table) {
      self.income = table;
      self.checkLoaded();
    });
    this.wealth = loadTable('data/inequality/za_wealth_distribution.csv', 'csv', 'header', function(table) {
      self.wealth = table;
      self.checkLoaded();
    });
  };

  this.checkLoaded = function() {
    this.loaded = this.population && this.income && this.wealth
        && this.population.getRowCount() > 0
        && this.income.getRowCount() > 0
        && this.wealth.getRowCount() > 0;
  };

  this.setup = function() {
    if (!this.loaded) {
      return;
    }

    var incomeIndex = this.income.getRowCount() - 1;
    var wealthIndex = this.wealth.getRowCount() - 1;
    this.rows = [
      {
        label: 'Population share',
        value: 10,
        colour: SATheme.black,
        note: 'Top 10 percent of people'
      },
      {
        label: 'Income share',
        value: this.income.getNum(incomeIndex, 'top_10_income_share_percent'),
        colour: SATheme.green,
        note: 'Top 10 percent, WID ' + this.income.getString(incomeIndex, 'year')
      },
      {
        label: 'Wealth share',
        value: this.wealth.getNum(wealthIndex, 'top_10_wealth_share_percent'),
        colour: SATheme.red,
        note: 'Top 10 percent, WID ' + this.wealth.getString(wealthIndex, 'year')
      }
    ];
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
    this.drawAnnotations();
    this.drawBars();
  };

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading ownership comparison...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textStyle(BOLD);
    textSize(17);
    textAlign(LEFT, TOP);
    text('Population size compared with resource share', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(80);
    text('The same top 10 percent income-ranked reference group is compared with latest available income and wealth shares.',
         24,
         44,
         width - 48,
         40);
  };

  this.drawAnnotations = function() {
    var left = width < 680 ? 136 : 190;
    var right = width - 48;
    var referenceX = map(10, 0, 100, left, right);
    var referenceBottom = Math.min(
      height - 66,
      128 + (this.rows.length * (width < 680 ? 68 : 82))
    );

    push();
    stroke(SATheme.blue);
    strokeWeight(1.5);
    drawingContext.setLineDash([5, 4]);
    line(referenceX, 110, referenceX, referenceBottom);
    drawingContext.setLineDash([]);
    pop();

    // Keep the explanatory badge away from the 10.0% value and first bar.
    // Compact charts already label that bar, so the reference line is enough.
    if (width >= 680) {
      drawAnnotationBadge(
        '10% reference',
        'Population share',
        width - 190,
        18,
        SATheme.blue
      );
    }
  };

  this.drawBars = function() {
    var left = width < 680 ? 136 : 190;
    var right = width - 48;
    var top = 128;
    var barHeight = width < 680 ? 34 : 42;
    var gap = width < 680 ? 68 : 82;
    var barWidth = right - left;

    stroke(210);
    strokeWeight(1);
    for (var tick = 0; tick <= 100; tick += 25) {
      var x = map(tick, 0, 100, left, right);
      line(x, top - 18, x, top + (gap * (this.rows.length - 1)) + barHeight + 18);
      noStroke();
      fill(90);
      textSize(11);
      textAlign(CENTER, TOP);
      text(tick + '%', x, top + (gap * (this.rows.length - 1)) + barHeight + 24);
      stroke(210);
    }

    for (var i = 0; i < this.rows.length; i++) {
      var row = this.rows[i];
      var y = top + (i * gap);
      var currentWidth = map(row.value, 0, 100, 0, barWidth);

      noStroke();
      fill(0);
      textStyle(BOLD);
      textSize(width < 680 ? 11 : 13);
      textAlign(RIGHT, CENTER);
      text(row.label, left - 12, y + (barHeight / 2));

      drawBar(left, y, currentWidth, barHeight, row.colour);

      if (mouseIsOverRect(left, y, currentWidth, barHeight)) {
        drawChartTooltip(row.label, row.value.toFixed(1) + '%', row.note);
      }

      fill(0);
      textAlign(LEFT, CENTER);
      textStyle(BOLD);
      textSize(13);
      text(row.value.toFixed(1) + '%', left + currentWidth + 10, y + (barHeight / 2));

      textStyle(NORMAL);
      textSize(11);
      fill(85);
      text(row.note, left, y + barHeight + 17);
    }
  };

  this.getExportData = function() {
    return rowsToExportData(this.rows);
  };
}
