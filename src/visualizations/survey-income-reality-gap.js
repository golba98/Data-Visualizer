function SurveyIncomeRealityGap() {

  // ---- State ----

  this.name = 'Income reality gap';
  this.id = 'survey-income-reality-gap';
  this.table = null;
  this.loaded = false;
  this.statuses = ['Overall', 'Student', 'Employed', 'Unemployed', 'Studying and working'];
  this.rows = [];   // per-status average worry vs income ratings

  // ---- Lifecycle ----

  this.preload = function() {
    var self = this;

    this.table = loadTable(
      'data/south-africa/survey_pressure_cleaned.csv',
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

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (this.rows.length == 0) {
      this.calculateRows();
    }

    background(247, 248, 252);
    this.drawTitle();
    this.drawScale();
    this.drawGapRows();
  };

  // ---- Data ----

  // For each status group (plus an 'Overall' pass over everyone), average the
  // work-worry and income-keeps-up ratings.
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

  // ---- Drawing ----

  this.drawLoading = function() {
    background(247, 248, 252);
    fill(31, 41, 55);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading income gap data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(17);
    text('Income reality gap', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(90);
    text('The line joins average work worry to average income-keeps-up rating for each group.',
         24,
         44,
         width - 48,
         32);
  };

  this.drawScale = function() {
    // width < 680 => narrow / mobile layout (tighter left margin).
    var left = width < 680 ? 122 : 172;
    var right = width - 54;
    var top = 100;

    stroke(200);
    strokeWeight(1);
    line(left, top, right, top);

    noStroke();
    fill(90);
    textSize(11);
    textStyle(NORMAL);
    textAlign(CENTER, TOP);

    for (var value = 1; value <= 5; value++) {
      var x = map(value, 1, 5, left, right);
      stroke(200);
      line(x, top - 4, x, height - 42);
      noStroke();
      text(value, x, top - 22);
    }

    fill(60);
    textAlign(LEFT, TOP);
    text('Rating scale: 1 low, 5 high', left, top - 48);
  };

  this.drawGapRows = function() {
    var left = width < 680 ? 122 : 172;
    var right = width - 54;
    var startY = 132;
    var rowGap = min(54, (height - startY - 40) / this.rows.length);

    for (var i = 0; i < this.rows.length; i++) {
      var item = this.rows[i];
      var y = startY + (i * rowGap);
      var worryX = map(item.worry, 1, 5, left, right);
      var incomeX = map(item.income, 1, 5, left, right);

      // Dumbbell row: the line joins the income dot (blue) to the worry dot
      // (red); a wider gap means more worry relative to income keeping up.
      stroke(150);
      strokeWeight(3);
      line(incomeX, y, worryX, y);

      noStroke();
      fill(SATheme.blue);
      circle(incomeX, y, 14);
      fill(SATheme.red);
      circle(worryX, y, 14);

      fill(0);
      textStyle(BOLD);
      textSize(width < 680 ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(this.getShortLabel(item.label), left - 12, y);

      fill(90);
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
    fill(60);
    text('Income keeps up', x + 10, y);

    fill(SATheme.red);
    circle(x + 130, y, 10);
    fill(60);
    text('Work worry', x + 140, y);
  };

  this.getShortLabel = function(label) {
    if (label == 'Studying and working') {
      return width < 680 ? 'Study+work' : label;
    }

    return label;
  };
}
