function SurveyIncomeRealityGap() {

  // State

  this.name = 'Income reality gap';
  this.id = 'survey-income-reality-gap';
  this.table = null;
  this.loaded = false;
  this.statuses = ['Overall', 'Student', 'Employed', 'Unemployed', 'Studying and working'];
  this.rows = [];   // per-status average worry vs income ratings

  // Lifecycle

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
        console.error('Could not load demo income reality gap data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.calculateRows();
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

  // Data

  // For each status group (plus an 'Overall' pass over everyone), average the work-worry and income-keeps-up ratings.
  this.calculateRows = function() {
    this.rows = [];

    for (var i = 0; i < this.statuses.length; i++) {
      var status = this.statuses[i];
      var worryTotal = 0;
      var incomeTotal = 0;
      var count = 0;

      for (var row = 0; row < this.table.getRowCount(); row++) {
        var rowStatus = this.table.getString(row, 'status');

        if (status == 'Overall' || rowStatus == status) {
          worryTotal += this.table.getNum(row, 'work_worry');
          incomeTotal += this.table.getNum(row, 'income_keeps_up');
          count++;
        }
      }

      if (count > 0) {
        this.rows.push({
          label: status,
          worry: worryTotal / count,
          income: incomeTotal / count,
          count: count
        });
      }
    }
  };

  // Drawing

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading demo income gap data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(width < 520 ? 13 : 17);
    text('Does income keep up with the worry?', 24, 18, width - 48, 36);

    textStyle(NORMAL);
    textSize(12);
    fill(SATheme.textMuted);
    text(SurveyData.chartLabel,
         24,
         width < 520 ? 54 : 44,
         width - 48,
         32);
  };

  this.drawScale = function() {
    // width < 680 => narrow / mobile layout (tighter left margin).
    var left = width < 680 ? 122 : 172;
    var right = width - 54;
    var top = 124;

    stroke(SATheme.grid);
    strokeWeight(1);
    line(left, top, right, top);

    noStroke();
    fill(SATheme.textMuted);
    textSize(11);
    textStyle(NORMAL);
    textAlign(CENTER, TOP);

    for (var value = 1; value <= 5; value++) {
      var x = map(value, 1, 5, left, right);
      stroke(SATheme.grid);
      line(x, top - 4, x, height - 42);
      noStroke();
      text(value, x, top - 22);
    }

    fill(SATheme.textMuted);
    textAlign(LEFT, TOP);
    text('Rating scale: 1 low, 5 high', left, top - 40);
  };

  this.drawGapRows = function() {
    var left = width < 680 ? 122 : 172;
    var right = width - 54;
    var startY = 156;
    var rowGap = min(54, (height - startY - 40) / this.rows.length);
    var pointer = getChartPointer();

    for (var i = 0; i < this.rows.length; i++) {
      var item = this.rows[i];
      var y = startY + (i * rowGap);
      var worryX = map(item.worry, 1, 5, left, right);
      var incomeX = map(item.income, 1, 5, left, right);

      // Dumbbell row: the line joins the income dot (blue) to the worry dot (red); a wider gap means more worry relative to income keeping up.
      stroke(SATheme.axis);
      strokeWeight(3);
      line(incomeX, y, worryX, y);

      noStroke();
      fill(SATheme.blue);
      circle(incomeX, y, 14);
      fill(SATheme.red);
      circle(worryX, y, 14);

      if (dist(pointer.x, pointer.y, incomeX, y) < 12) {
        drawChartTooltip(item.label, item.income.toFixed(2), 'income keeps up');
      } else if (dist(pointer.x, pointer.y, worryX, y) < 12) {
        drawChartTooltip(item.label, item.worry.toFixed(2), 'work worry');
      }

      fill(SATheme.text);
      textStyle(BOLD);
      textSize(width < 680 ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(this.getShortLabel(item.label), left - 12, y);

      fill(SATheme.textMuted);
      textStyle(NORMAL);
      textAlign(LEFT, CENTER);
      text('n=' + item.count, right + 8, y);
    }

    this.drawLegend(left, height - 24);
  };

  this.drawLegend = function(x, y) {
    noStroke();
    textSize(11);
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
      return width < 680 ? 'Study+work' : label;
    }

    return label;
  };

  this.getExportData = function() {
    return rowsToExportData(this.rows);
  };
}
