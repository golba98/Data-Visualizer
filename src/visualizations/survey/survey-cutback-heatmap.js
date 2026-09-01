// What people cut back on, crossed with their employment status.
// Source: project survey, 48 responses.
function SurveyCutbackHeatmap() {

  this.name = 'Cutback heatmap';
  this.id = 'survey-cutback-heatmap';
  this.table = null;
  this.loaded = false;
  this.cutbacks = [
    'Meat',
    'Eating out',
    'Data',
    'Transport',
    'Subscriptions',
    'Social life',
    'Clothing',
    'Electricity'
  ];   // heatmap rows
  this.statuses = ['Student', 'Employed', 'Unemployed', 'Studying and working'];   // heatmap columns
  this.counts = {};
  this.maxCount = 0;   // highest single cell count, used to scale colour intensity

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
        console.error('Could not load survey demo cutback data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.countCutbacks();
  };

  // Tally, per cutback item and status group, how many respondents mentioned that item; also track the largest count for colour scaling.
  this.countCutbacks = function() {
    this.counts = {};
    this.maxCount = 0;

    for (var c = 0; c < this.cutbacks.length; c++) {
      this.counts[this.cutbacks[c]] = {};

      for (var s = 0; s < this.statuses.length; s++) {
        this.counts[this.cutbacks[c]][this.statuses[s]] = 0;
      }
    }

    for (var row = 0; row < this.table.getRowCount(); row++) {
      var status = this.table.getString(row, 'status');
      var cutbackText = this.table.getString(row, 'cut_back_on');

      for (var i = 0; i < this.cutbacks.length; i++) {
        var cutback = this.cutbacks[i];

        if (this.counts[cutback].hasOwnProperty(status)
            && cutbackText.indexOf(cutback) != -1) {
          this.counts[cutback][status]++;
          this.maxCount = max(this.maxCount, this.counts[cutback][status]);
        }
      }
    }
  };

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (this.maxCount == 0) {
      this.countCutbacks();
    }

    background(SATheme.bg);
    this.drawTitle();
    this.drawHeatmap();
    this.drawLegend();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading demo cutback data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    text('What people say they cut back on', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text(SurveyData.chartLabel,
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 46 : 32);
  };

  this.drawHeatmap = function() {
    // The row labels need less room than the grid does, so on a very narrow canvas
    // the left margin gives way first -- the grid must never run off the edge.
    var rightPad = isPhoneChart() ? 12 : 24;
    var left = isCompactChart() ? 92 : 148;
    var minGrid = this.statuses.length * 30;
    left = Math.min(left, Math.max(52, width - rightPad - minGrid));

    var top = isPhoneChart() ? 108 : (isCompactChart() ? 100 : 112);
    var bottomPad = 62;
    var cellWidth = (width - left - rightPad) / this.statuses.length;
    var cellHeight = max(30, min(58, (height - top - bottomPad) / this.cutbacks.length));

    textStyle(NORMAL);
    chartTextSize(isCompactChart() ? 10 : 12);
    noStroke();

    for (var s = 0; s < this.statuses.length; s++) {
      var statusLabel = isCompactChart()
          ? this.getShortStatus(this.statuses[s])
          : this.statuses[s];
      fill(SATheme.text);
      textAlign(CENTER, BOTTOM);
      text(statusLabel, left + (s * cellWidth) + (cellWidth / 2), top - 10);
    }

    for (var c = 0; c < this.cutbacks.length; c++) {
      var cutback = this.cutbacks[c];
      var y = top + (c * cellHeight);

      fill(SATheme.text);
      textAlign(RIGHT, CENTER);
      text(cutback, left - 12, y + (cellHeight / 2));

      for (var i = 0; i < this.statuses.length; i++) {
        var status = this.statuses[i];
        var count = this.counts[cutback][status];
        var strength = this.maxCount > 0 ? count / this.maxCount : 0;
        var x = left + (i * cellWidth);

        // Red cell with alpha scaled by this group's count (darker = more people).
        fill(SATheme.withAlpha(SATheme.redRGB, strength * 255));
        stroke(SATheme.axis);
        strokeWeight(1);
        rect(x, y, cellWidth - 4, cellHeight - 4);

        noStroke();
        fill(SATheme.text);
        textAlign(CENTER, CENTER);
        text(count, x + ((cellWidth - 4) / 2), y + ((cellHeight - 4) / 2));

        if (mouseIsOverRect(x, y, cellWidth - 4, cellHeight - 4)) {
          drawChartTooltip(cutback + ' / ' + status, String(count), 'responses');
        }
      }
    }
  };

  this.drawLegend = function() {
    var x = 24;
    var y = height - 28;

    noStroke();
    textAlign(LEFT, CENTER);
    chartTextSize(11);
    fill(SATheme.textMuted);
    text('Count per group', x, y);

    for (var i = 0; i < 5; i++) {
      var strength = i / 4;
      fill(SATheme.withAlpha(SATheme.redRGB, strength * 255));
      stroke(SATheme.axis);
      strokeWeight(1);
      rect(x + 92 + (i * 22), y - 8, 20, 16);
      noStroke();
    }
  };

  this.getShortStatus = function(status) {
    if (isPhoneChart()) {
      if (status == 'Student') return 'Stud.';
      if (status == 'Employed') return 'Emp.';
      if (status == 'Unemployed') return 'Unemp.';
      if (status == 'Studying and working') return 'Study+';
    }

    if (status == 'Studying and working') {
      return 'Study+work';
    }

    return status;
  };

  this.getExportData = function() {
    return tableToExportData(this.table);
  };
}
