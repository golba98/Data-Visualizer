// Uses the template's visualisation interface: name, id, preload, setup, draw, destroy.
// Everything below is own.
/* Start - own code */

// Compares population land and wealth shares
function ZAOwnershipComparison() {

  this.name = 'Population vs ownership';
  this.id = 'za-ownership-comparison';
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading ownership comparison...'
  });
  this.population = null;
  this.income = null;
  this.wealth = null;
  this.rows = [];

  this.preload = function() {
    var self = this;
    this.loadState.loadTables([
      {
        path: 'data/inequality/za_population_groups.csv',
        requiredColumns: ['group', 'population_share_percent'],
        numericColumns: ['population_share_percent'],
        assign: function(table) { self.population = table; }
      },
      {
        path: 'data/inequality/za_income_distribution.csv',
        requiredColumns: ['year', 'top_10_income_share_percent'],
        numericColumns: ['year', 'top_10_income_share_percent'],
        assign: function(table) { self.income = table; }
      },
      {
        path: 'data/inequality/za_wealth_distribution.csv',
        requiredColumns: ['year', 'top_10_wealth_share_percent'],
        numericColumns: ['year', 'top_10_wealth_share_percent'],
        assign: function(table) { self.wealth = table; }
      }
    ]);
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
    if (this.loadState.draw()) return;

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
    // Leaves room for the "10% reference" badge, which only wider charts show.
    text('The same top 10 percent income-ranked reference group is compared with latest available income and wealth shares.',
         24,
         isPhoneChart() ? 54 : 44,
         isCompactChart() ? width - 48 : width - 230,
         isPhoneChart() ? 54 : 40);
  };

  this.drawAnnotations = function() {
    var phoneLayout = isPhoneChart();
    var left = phoneLayout ? 110 : (isCompactChart() ? 136 : 190);
    var right = width - (phoneLayout ? 36 : 48);
    var referenceX = map(10, 0, 100, left, right);
    var referenceBottom = this.getRowLayout().gridBottom;

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

  // Spreads the rows between the heading and the axis labels at the bottom of
  // the canvas. This chart has no footnote, so footnoteTop is the bottom edge.
  // When space is tight the bars get thinner, then the notes move to the tooltip.
  this.getRowLayout = function() {
    var isCompact = isCompactChart();
    var top = 128;
    var footnoteTop = height - 8;
    var rowsBottom = footnoteTop - 26;
    var step = fitRowStep(top, rowsBottom, this.rows.length, isCompact ? 68 : 82);
    var bar = isCompact ? 34 : 42;
    var detail = 24;
    var showDetail = step >= bar + detail;

    if (!showDetail && step - detail >= 16) {
      bar = step - detail;
      showDetail = true;
    } else if (!showDetail) {
      bar = Math.min(bar, step * 0.75);
    }

    var rowHeight = bar + (showDetail ? detail : 0);

    return {
      top: top,
      step: step,
      bar: bar,
      showDetail: showDetail,
      rowHeight: rowHeight,
      rowCount: this.rows.length,
      rowsBottom: rowsBottom,
      gridBottom: top + (step * (this.rows.length - 1)) + rowHeight + 4,
      footnoteTop: footnoteTop
    };
  };

  this.drawBars = function() {
    var isPhone = isPhoneChart();
    var isCompact = isCompactChart();
    var rowLayout = this.getRowLayout();
    var leftEdge = isPhone ? 110 : (isCompact ? 136 : 190);
    var rightEdge = width - (isPhone ? 36 : 48);
    var startY = rowLayout.top;
    var rowHeight = rowLayout.bar;
    var rowStride = rowLayout.step;
    var plotWidth = rightEdge - leftEdge;

    stroke(SATheme.grid);
    strokeWeight(1);
    var stepSize = isPhone ? 50 : 25;
    for (var mark = 0; mark <= 100; mark += stepSize) {
      var gridX = map(mark, 0, 100, leftEdge, rightEdge);
      line(gridX, startY - 18, gridX, rowLayout.gridBottom);
      noStroke();
      fill(SATheme.textMuted);
      chartTextSize(isPhone ? 9 : 11);
      textAlign(CENTER, TOP);
      text(mark + '%', gridX, rowLayout.gridBottom + 6);
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

      if (rowLayout.showDetail) {
        textStyle(NORMAL);
        fill(SATheme.textMuted);
        chartTextSize(isPhone ? 9 : 11);
        text(item.note, leftEdge, yPos + rowHeight + 14);
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
