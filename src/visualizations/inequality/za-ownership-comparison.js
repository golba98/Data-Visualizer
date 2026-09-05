// Compares population land and wealth shares
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
        colour: SATheme.orange,
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

    this.rows[0].colour = SATheme.orange;
    this.rows[1].colour = SATheme.green;
    this.rows[2].colour = SATheme.red;

    background(SATheme.bg);
    this.drawTitle();
    this.drawAnnotations();
    this.drawBars();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading ownership comparison...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    textAlign(LEFT, TOP);
    text('Population size compared with resource share', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text('The same top 10 percent income-ranked reference group is compared with latest available income and wealth shares.',
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 54 : 40);
  };

  this.drawAnnotations = function() {
    var phoneLayout = isPhoneChart();
    var left = phoneLayout ? 110 : (isCompactChart() ? 136 : 190);
    var right = width - (phoneLayout ? 36 : 48);
    var referenceX = map(10, 0, 100, left, right);
    var referenceBottom = Math.min(
      isPhoneChart() ? height - 78 : height - 66,
      128 + (this.rows.length * (isCompactChart() ? 68 : 82))
    );

    push();
    stroke(SATheme.blue);
    strokeWeight(1.5);
    drawingContext.setLineDash([5, 4]);
    line(referenceX, 110, referenceX, referenceBottom);
    drawingContext.setLineDash([]);
    pop();

    if (!isCompactChart()) {
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
    var isPhone = isPhoneChart();
    var isCompact = isCompactChart();
    var leftEdge = isPhone ? 110 : (isCompact ? 136 : 190);
    var rightEdge = width - (isPhone ? 36 : 48);
    var startY = 128;
    var rowHeight = isCompact ? 34 : 42;
    var rowStride = isCompact ? 68 : 82;
    var plotWidth = rightEdge - leftEdge;

    stroke(SATheme.grid);
    strokeWeight(1);
    var stepSize = isPhone ? 50 : 25;
    for (var mark = 0; mark <= 100; mark += stepSize) {
      var gridX = map(mark, 0, 100, leftEdge, rightEdge);
      line(gridX, startY - 18, gridX, startY + (rowStride * (this.rows.length - 1)) + rowHeight + 18);
      noStroke();
      fill(SATheme.textMuted);
      chartTextSize(isPhone ? 9 : 11);
      textAlign(CENTER, TOP);
      text(mark + '%', gridX, startY + (rowStride * (this.rows.length - 1)) + rowHeight + 24);
      stroke(SATheme.grid);
    }

    for (var r = 0; r < this.rows.length; r++) {
      var item = this.rows[r];
      var yPos = startY + (r * rowStride);
      var currentBarWidth = map(item.value, 0, 100, 0, plotWidth);

      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(isPhone ? 9 : (isCompact ? 11 : 13));
      textAlign(RIGHT, CENTER);
      text(item.label, leftEdge - 12, yPos + (rowHeight / 2));

      drawBar(leftEdge, yPos, currentBarWidth, rowHeight, item.colour);

      if (mouseIsOverRect(leftEdge, yPos, currentBarWidth, rowHeight)) {
        drawChartTooltip(item.label, item.value.toFixed(1) + '%', item.note);
      }

      fill(SATheme.text);
      textAlign(LEFT, CENTER);
      textStyle(BOLD);
      chartTextSize(isPhone ? 10 : 13);
      text(item.value.toFixed(1) + '%', leftEdge + currentBarWidth + 10, yPos + (rowHeight / 2));

      textStyle(NORMAL);
      fill(SATheme.textMuted);
      chartTextSize(isPhone ? 9 : 11);
      text(item.note, leftEdge, yPos + rowHeight + 17);
    }
  };

  this.getExportData = function() {
    return rowsToExportData(this.rows);
  };
}
