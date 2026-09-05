// Compares pressure by employment status
function SurveyStatusPressure() {

  this.name = 'Student vs worker';
  this.id = 'survey-status-pressure';
  this.table = null;
  this.loaded = false;
  this.statuses = ['Student', 'Employed', 'Unemployed', 'Studying and working'];
  this.pressures = ['Food', 'Transport', 'Data', 'Rent', 'Tuition', 'Debt', 'Electricity'];
  this.colours = SATheme.pressure;
  this.counts = {};
  this.totals = {};
  this.representedRows = 0;

  this.preload = function() {
    var self = this;

    this.table = loadTable(
      SurveyData.path,
      'csv',
      'header',
      function(table) {
        self.table = table;
        self.loaded = true;
      },
      function(error) {
        console.error('Could not load status pressure data', error);
      });
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
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (!this.counts.Student) {
      this.countPressures();
    }

    this.colours = SATheme.pressure;
    background(SATheme.bg);
    this.drawTitle();
    this.drawStackedBars();
    this.drawLegend();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading status pressure data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    text('Who feels which pressure most?', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text(SurveyData.chartLabel,
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 46 : 32);
  };

  this.drawStackedBars = function() {
    var isCompact = isCompactChart();
    var barLeft = isCompact ? 118 : 174;
    var barRight = width - (isCompact ? 46 : 56);
    var originY = 112;
    var barHeight = isCompact ? 28 : 34;
    var rowStride = isCompact ? 42 : 54;
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

  this.drawLegend = function() {
    var compact = isCompactChart();
    var columns = compact ? 3 : 4;
    var itemWidth = compact ? (width - 48) / columns : 118;
    var startX = 28;
    var startY = height - (compact ? 66 : 52);

    chartTextSize(11);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    noStroke();

    for (var i = 0; i < this.pressures.length; i++) {
      var pressure = this.pressures[i];
      var x = startX + ((i % columns) * itemWidth);
      var y = startY + (Math.floor(i / columns) * 20);

      fill(this.colours[pressure]);
      stroke(SATheme.axis);
      strokeWeight(1);
      rect(x, y - 7, 14, 14);
      noStroke();
      fill(SATheme.text);
      chartTextSize(compact ? 9 : 11);
      text(pressure, x + 18, y);
    }
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
}
