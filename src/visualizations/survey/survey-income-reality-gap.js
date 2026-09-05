// Compares income pressure and worry
function SurveyIncomeRealityGap() {

  this.name = 'Income reality gap';
  this.id = 'survey-income-reality-gap';
  this.table = null;
  this.loaded = false;
  this.statuses = ['Overall', 'Student', 'Employed', 'Unemployed', 'Studying and working'];
  this.rows = [];
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
        console.error('Could not load income reality gap data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.calculateRows();
  };

  // Averages scores for each status
  this.calculateRows = function() {
    this.rows = [];
    this.representedRows = 0;
    var rowCount = this.table.getRowCount();

    for (var sIdx = 0; sIdx < this.statuses.length; sIdx++) {
      var targetStatus = this.statuses[sIdx];
      var accumWorry = 0;
      var accumIncome = 0;
      var tally = 0;

      for (var r = 0; r < rowCount; r++) {
        var personStatus = this.table.getString(r, 'status');
        if (targetStatus === 'Overall' || personStatus === targetStatus) {
          accumWorry += this.table.getNum(r, 'work_worry');
          accumIncome += this.table.getNum(r, 'income_keeps_up');
          tally++;
        }
      }

      if (tally > 0) {
        this.rows.push({
          label: targetStatus,
          worry: accumWorry / tally,
          income: accumIncome / tally,
          count: tally
        });

        if (targetStatus !== 'Overall') {
          this.representedRows += tally;
        }
      }
    }
  };

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (this.rows.length == 0) {
      this.calculateRows();
    }

    background(SATheme.bg);
    this.drawTitle();
    this.drawScale();
    this.drawGapRows();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading income gap data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    text('Does income keep up with the worry?', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text(SurveyData.chartLabel,
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 46 : 32);
  };

  this.drawScale = function() {
    var scaleLeft = isCompactChart() ? 122 : 172;
    var scaleRight = width - 54;
    var scaleTop = 124;

    stroke(SATheme.grid);
    strokeWeight(1);
    line(scaleLeft, scaleTop, scaleRight, scaleTop);

    noStroke();
    fill(SATheme.textMuted);
    chartTextSize(11);
    textStyle(NORMAL);
    textAlign(CENTER, TOP);

    for (var score = 1; score <= 5; score++) {
      var markerX = map(score, 1, 5, scaleLeft, scaleRight);
      stroke(SATheme.grid);
      line(markerX, scaleTop - 4, markerX, height - 42);
      noStroke();
      text(score, markerX, scaleTop - 22);
    }

    fill(SATheme.textMuted);
    textAlign(LEFT, TOP);
    text('Rating scale: 1 low, 5 high', scaleLeft, scaleTop - 40);
  };

  this.drawGapRows = function() {
    var chartLeft = isCompactChart() ? 122 : 172;
    var chartRight = width - 54;
    var startY = 156;
    var rowStride = Math.min(54, (height - startY - 40) / this.rows.length);
    var cursor = getChartPointer();

    for (var row = 0; row < this.rows.length; row++) {
      var itemData = this.rows[row];
      var rowCenterY = startY + (row * rowStride);
      var worryDotX = map(itemData.worry, 1, 5, chartLeft, chartRight);
      var incomeDotX = map(itemData.income, 1, 5, chartLeft, chartRight);

      stroke(SATheme.axis);
      strokeWeight(3);
      line(incomeDotX, rowCenterY, worryDotX, rowCenterY);

      noStroke();
      fill(SATheme.blue);
      circle(incomeDotX, rowCenterY, 14);
      fill(SATheme.red);
      circle(worryDotX, rowCenterY, 14);

      if (dist(cursor.x, cursor.y, incomeDotX, rowCenterY) < 12) {
        drawChartTooltip(itemData.label, itemData.income.toFixed(2), 'income keeps up');
      } else if (dist(cursor.x, cursor.y, worryDotX, rowCenterY) < 12) {
        drawChartTooltip(itemData.label, itemData.worry.toFixed(2), 'work worry');
      }

      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(isCompactChart() ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(this.getShortLabel(itemData.label), chartLeft - 12, rowCenterY);

      fill(SATheme.textMuted);
      textStyle(NORMAL);
      textAlign(LEFT, CENTER);
      text('n=' + itemData.count, chartRight + 8, rowCenterY);
    }

    this.drawLegend(chartLeft, height - 24);
  };

  this.drawLegend = function(x, y) {
    noStroke();
    chartTextSize(11);
    textAlign(LEFT, CENTER);
    textStyle(NORMAL);

    fill(SATheme.blue);
    circle(x, y, 10);
    fill(SATheme.textMuted);
    text('Income keeps up', x + 10, y);

    fill(SATheme.red);
    circle(x + 130, y, 10);
    fill(SATheme.textMuted);
    text('Work worry', x + 140, y);
  };

  this.getShortLabel = function(label) {
    if (label == 'Studying and working') {
      return isCompactChart() ? 'Study+work' : label;
    }

    return label;
  };

  this.getExportData = function() {
    return rowsToExportData(this.rows);
  };
}
