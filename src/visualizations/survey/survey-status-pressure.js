// Uses the template's visualisation interface: name, id, preload, setup, draw, destroy.
// Everything below is own.
/* Start - own code */

// Compares pressure by employment status
function SurveyStatusPressure() {

  this.name = 'Student vs worker';
  this.id = 'survey-status-pressure';
  this.table = null;
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading status pressure data...'
  });
  this.statuses = ['Student', 'Employed', 'Unemployed', 'Studying and working'];
  this.pressures = ['Food', 'Transport', 'Data', 'Rent', 'Tuition', 'Debt', 'Electricity'];
  this.colours = SATheme.pressure;
  this.counts = {};
  this.totals = {};
  this.representedRows = 0;

  this.preload = function() {
    var self = this;

    this.loadState.loadTables([{
      path: SurveyData.path,
      requiredColumns: ['status', 'pressure'],
      assign: function(table) { self.table = table; }
    }]);
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.countPressures();
  };

  this.countPressures = function() {
    this.counts = {};
    this.totals = {};
    this.representedRows = 0;

    for (var sIdx = 0; sIdx < this.statuses.length; sIdx++) {
      var st = this.statuses[sIdx];
      this.counts[st] = {};
      this.totals[st] = 0;
      for (var pIdx = 0; pIdx < this.pressures.length; pIdx++) {
        this.counts[st][this.pressures[pIdx]] = 0;
      }
    }

    var totalRows = this.table.getRowCount();
    for (var r = 0; r < totalRows; r++) {
      var rowStatus = this.table.getString(r, 'status');
      var rowPressure = this.table.getString(r, 'pressure');

      if (this.counts[rowStatus] && (rowPressure in this.counts[rowStatus])) {
        this.counts[rowStatus][rowPressure]++;
        this.totals[rowStatus]++;
        this.representedRows++;
      }
    }
  };

  this.draw = function() {
    if (this.loadState.draw()) return;

    if (!this.counts.Student) {
      this.countPressures();
    }

    // The bars take the space between the measured title and the legend.
    this.colours = SATheme.pressure;
    background(SATheme.bg);
    var top = this.drawTitle() + 14;
    var legendTop = this.drawLegend();
    this.drawStackedBars(top, legendTop - 14);
  };

  // Returns the y below the title block.
  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    var y = 18 + drawWrappedText('Who feels which pressure most?', 24, 18, width - 48);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    y += 6;
    return y + drawWrappedText(SurveyData.chartLabel, 24, y, width - 48);
  };

  this.drawStackedBars = function(top, bottom) {
    var isCompact = isCompactChart();
    var barLeft = isCompact ? 118 : 174;
    var barRight = width - (isCompact ? 46 : 56);
    var originY = top;
    var rowCount = Math.max(1, this.statuses.length);
    var available = bottom - top;
    var barHeight = constrain(available / rowCount * 0.68, 16, isCompact ? 28 : 34);
    var rowStride = rowCount > 1
      ? Math.min(isCompact ? 42 : 54, (available - barHeight) / (rowCount - 1))
      : 0;
    var fullWidth = barRight - barLeft;

    for (var s = 0; s < this.statuses.length; s++) {
      var statusKey = this.statuses[s];
      var rowTop = originY + (s * rowStride);
      var currentLeft = barLeft;
      var groupTotal = this.totals[statusKey] || 0;

      fill(SATheme.text);
      noStroke();
      textStyle(BOLD);
      chartTextSize(isCompact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(this.getShortStatus(statusKey), barLeft - 12, rowTop + (barHeight / 2));

      for (var p = 0; p < this.pressures.length; p++) {
        var pressureKey = this.pressures[p];
        var countVal = this.counts[statusKey][pressureKey];
        var sliceWidth = groupTotal > 0 ? (countVal / groupTotal) * fullWidth : 0;

        if (sliceWidth > 0) {
          fill(this.colours[pressureKey]);
          stroke(SATheme.axis);
          strokeWeight(1);
          rect(currentLeft, rowTop, sliceWidth, barHeight);

          if (sliceWidth > 24) {
            noStroke();
            fill(SATheme.text);
            textAlign(CENTER, CENTER);
            textStyle(BOLD);
            chartTextSize(11);
            text(countVal, currentLeft + (sliceWidth / 2), rowTop + (barHeight / 2));
          }

          if (mouseIsOverRect(currentLeft, rowTop, sliceWidth, barHeight)) {
            var pctText = groupTotal > 0 ? ((countVal / groupTotal) * 100).toFixed(1) : '0.0';
            drawChartTooltip(statusKey + ' / ' + pressureKey, countVal + ' responses', pctText + '% of group');
          }
        }

        currentLeft += sliceWidth;
      }

      noStroke();
      fill(SATheme.textMuted);
      textStyle(NORMAL);
      chartTextSize(11);
      textAlign(LEFT, CENTER);
      text('n=' + groupTotal, barRight + 8, rowTop + (barHeight / 2));
    }
  };

  // Draws the key against the bottom edge, in as many columns as its
  // measured items fit, and returns its top.
  this.drawLegend = function() {
    var compact = isCompactChart();
    var rowHeight = 20;
    chartTextSize(compact ? 10 : 11);
    textStyle(NORMAL);
    var widest = 0;
    for (var n = 0; n < this.pressures.length; n++) {
      widest = Math.max(widest, textWidth(this.pressures[n]));
    }
    var itemWidth = 18 + widest + 16;
    var columns = Math.max(1, Math.min(this.pressures.length, Math.floor((width - 52) / itemWidth)));
    var rows = Math.ceil(this.pressures.length / columns);
    var top = height - 12 - (rows * rowHeight);
    var startX = 28;

    textAlign(LEFT, CENTER);
    noStroke();

    for (var i = 0; i < this.pressures.length; i++) {
      var pressure = this.pressures[i];
      var x = startX + ((i % columns) * itemWidth);
      var y = top + (rowHeight / 2) + (Math.floor(i / columns) * rowHeight);

      fill(this.colours[pressure]);
      stroke(SATheme.axis);
      strokeWeight(1);
      rect(x, y - 7, 14, 14);
      noStroke();
      fill(SATheme.text);
      text(pressure, x + 18, y);
    }
    return top;
  };

  this.getShortStatus = function(status) {
    if (status == 'Studying and working') {
      return isCompactChart() ? 'Study+work' : status;
    }

    return status;
  };

  this.getExportData = function() {
    return tableToExportData(this.table);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
