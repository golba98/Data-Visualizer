// Shows cuts by employment status
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
  ];
  this.statuses = ['Student', 'Employed', 'Unemployed', 'Studying and working'];
  this.counts = {};
  this.maxCount = 0;
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
        console.error('Could not load survey cutback data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.countCutbacks();
  };

  this.parseCutbacks = function(cellText) {
    var items = String(cellText || '').split(';');
    var chosen = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i].trim();

      if (item !== '') {
        chosen.push(item);
      }
    }

    return chosen;
  };

  // Counts cuts for each status
  this.countCutbacks = function() {
    this.counts = {};
    this.maxCount = 0;
    this.representedRows = 0;

    for (var c = 0; c < this.cutbacks.length; c++) {
      var itemKey = this.cutbacks[c];
      this.counts[itemKey] = {};
      for (var s = 0; s < this.statuses.length; s++) {
        this.counts[itemKey][this.statuses[s]] = 0;
      }
    }

    var totalRows = this.table.getRowCount();
    for (var r = 0; r < totalRows; r++) {
      var respondentStatus = this.table.getString(r, 'status');
      if (this.statuses.indexOf(respondentStatus) === -1) {
        continue;
      }

      var chosenItems = this.parseCutbacks(this.table.getString(r, 'cut_back_on'));
      var hasMatch = false;

      for (var i = 0; i < chosenItems.length; i++) {
        var item = chosenItems[i];
        if (item in this.counts) {
          this.counts[item][respondentStatus]++;
          if (this.counts[item][respondentStatus] > this.maxCount) {
            this.maxCount = this.counts[item][respondentStatus];
          }
          hasMatch = true;
        }
      }

      if (hasMatch) {
        this.representedRows++;
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
    text('Loading cutback data...', width / 2, height / 2);
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
    var rightPadding = isPhoneChart() ? 12 : 24;
    var defaultLeft = isCompactChart() ? 92 : 148;
    var minGridSpan = this.statuses.length * 30;
    var originX = Math.min(defaultLeft, Math.max(52, width - rightPadding - minGridSpan));

    var originY = isPhoneChart() ? 108 : (isCompactChart() ? 100 : 112);
    var bottomMargin = 62;
    var cellW = (width - originX - rightPadding) / this.statuses.length;
    var cellH = Math.max(30, Math.min(58, (height - originY - bottomMargin) / this.cutbacks.length));

    textStyle(NORMAL);
    chartTextSize(isCompactChart() ? 10 : 12);
    noStroke();

    for (var colIdx = 0; colIdx < this.statuses.length; colIdx++) {
      var statusName = isCompactChart()
        ? this.getShortStatus(this.statuses[colIdx])
        : this.statuses[colIdx];
      fill(SATheme.text);
      textAlign(CENTER, BOTTOM);
      text(statusName, originX + (colIdx * cellW) + (cellW / 2), originY - 10);
    }

    for (var rowIdx = 0; rowIdx < this.cutbacks.length; rowIdx++) {
      var cutbackName = this.cutbacks[rowIdx];
      var blockY = originY + (rowIdx * cellH);

      fill(SATheme.text);
      textAlign(RIGHT, CENTER);
      text(cutbackName, originX - 12, blockY + (cellH / 2));

      for (var sIdx = 0; sIdx < this.statuses.length; sIdx++) {
        var groupStatus = this.statuses[sIdx];
        var responsesCount = this.counts[cutbackName][groupStatus];
        var alphaRatio = this.maxCount > 0 ? (responsesCount / this.maxCount) : 0;
        var blockX = originX + (sIdx * cellW);
        var tileW = cellW - 4;
        var tileH = cellH - 4;

        fill(SATheme.withAlpha(SATheme.redRGB, alphaRatio * 255));
        stroke(SATheme.axis);
        strokeWeight(1);
        rect(blockX, blockY, tileW, tileH);

        noStroke();
        fill(SATheme.text);
        textAlign(CENTER, CENTER);
        text(responsesCount, blockX + (tileW / 2), blockY + (tileH / 2));

        if (mouseIsOverRect(blockX, blockY, tileW, tileH)) {
          drawChartTooltip(cutbackName + ' / ' + groupStatus, String(responsesCount), 'responses');
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
