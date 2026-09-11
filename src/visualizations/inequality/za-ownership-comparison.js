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

    // The rows take the space below the measured title block.
    background(SATheme.bg);
    var bars = this.getBarLayout(this.drawTitle() + 36, height - 12);
    this.drawAnnotations(bars);
    this.drawBars(bars);
  };

  // The reference badge sits top-right on wide canvases.
  this.showsBadge = function() {
    return !isCompactChart() && annotationsAreVisible();
  };

  // Returns the y below the title block.
  this.drawTitle = function() {
    var blockWidth = this.showsBadge() ? width - 248 : width - 48;
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    var y = 18 + drawWrappedText('Population size compared with resource share', 24, 18, blockWidth);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    y += 6;
    return y + drawWrappedText('The same top 10 percent income-ranked reference group is compared with latest available income and wealth shares.',
                               24, y, blockWidth);
  };

  // Row geometry between top and bottom. With room, each bar keeps its
  // source note underneath; when space is short the notes are left to the
  // tooltip and the rows tighten to fit.
  this.getBarLayout = function(top, bottom) {
    var isPhone = isPhoneChart();
    var isCompact = isCompactChart();
    var axisSpace = 40;
    var rowCount = Math.max(1, this.rows.length);
    var available = bottom - axisSpace - top;
    var rowHeight = isCompact ? 34 : 42;
    var noteSpace = 26;
    var showNotes = available >= rowCount * (rowHeight + noteSpace);

    if (!showNotes) {
      rowHeight = constrain(available / rowCount * 0.7, 16, rowHeight);
      noteSpace = 0;
    }

    var rowStride = rowCount > 1
      ? Math.min(isCompact ? 68 : 82, (available - rowHeight - noteSpace) / (rowCount - 1))
      : 0;
    rowStride = Math.max(rowStride, rowHeight + noteSpace + 6);

    return {
      leftEdge: isPhone ? 110 : (isCompact ? 136 : 190),
      rightEdge: width - (isPhone ? 36 : 48),
      startY: top,
      rowHeight: rowHeight,
      rowStride: rowStride,
      showNotes: showNotes,
      rowsBottom: top + (rowStride * (rowCount - 1)) + rowHeight + noteSpace
    };
  };

  this.drawAnnotations = function(bars) {
    var referenceX = map(10, 0, 100, bars.leftEdge, bars.rightEdge);

    push();
    stroke(SATheme.blue);
    strokeWeight(1.5);
    drawingContext.setLineDash([5, 4]);
    line(referenceX, bars.startY - 18, referenceX, bars.rowsBottom);
    drawingContext.setLineDash([]);
    pop();

    if (this.showsBadge()) {
      drawAnnotationBadge(
        '10% reference',
        'Population share',
        width - 190,
        18,
        SATheme.blue
      );
    }
  };

  this.drawBars = function(bars) {
    var isPhone = isPhoneChart();
    var isCompact = isCompactChart();
    var leftEdge = bars.leftEdge;
    var rightEdge = bars.rightEdge;
    var startY = bars.startY;
    var rowHeight = bars.rowHeight;
    var rowStride = bars.rowStride;
    var plotWidth = rightEdge - leftEdge;

    stroke(SATheme.grid);
    strokeWeight(1);
    var stepSize = isPhone ? 50 : 25;
    for (var mark = 0; mark <= 100; mark += stepSize) {
      var gridX = map(mark, 0, 100, leftEdge, rightEdge);
      line(gridX, startY - 18, gridX, bars.rowsBottom);
      noStroke();
      fill(SATheme.textMuted);
      chartTextSize(isPhone ? 9 : 11);
      textAlign(CENTER, TOP);
      text(mark + '%', gridX, bars.rowsBottom + 8);
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

      if (bars.showNotes) {
        textStyle(NORMAL);
        fill(SATheme.textMuted);
        chartTextSize(isPhone ? 9 : 11);
        text(item.note, leftEdge, yPos + rowHeight + 17);
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
