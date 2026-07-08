function SurveyCutbackHeatmap() {

  // ---- State ----

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

  // ---- Lifecycle ----

  this.preload = function() {
    var self = this;

    this.table = loadTable(
      'data/survey/za_survey_demo.csv',
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

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (this.maxCount == 0) {
      this.countCutbacks();
    }

    background(255);
    this.drawTitle();
    this.drawHeatmap();
    this.drawLegend();
  };

  // ---- Data ----

  // Tally, per cutback item and status group, how many respondents mentioned
  // that item; also track the largest count for colour scaling.
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

  // ---- Drawing ----

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading demo cutback data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(17);
    text('What people say they cut back on (demo)', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(90);
    text('Made-up answers for now — darker cells just mean more fake rows picked that item.',
         24,
         44,
         width - 48,
         32);
  };

  this.drawHeatmap = function() {
    // width < 620 => narrow / mobile layout (tighter left margin and top).
    var left = width < 620 ? 92 : 148;
    var top = width < 620 ? 100 : 112;
    var rightPad = 24;
    var bottomPad = 62;
    var cellWidth = (width - left - rightPad) / this.statuses.length;
    var cellHeight = (height - top - bottomPad) / this.cutbacks.length;
    cellWidth = max(44, cellWidth);
    cellHeight = max(30, min(58, cellHeight));

    textStyle(NORMAL);
    textSize(width < 620 ? 10 : 12);
    noStroke();

    for (var s = 0; s < this.statuses.length; s++) {
      var statusLabel = width < 620
          ? this.getShortStatus(this.statuses[s])
          : this.statuses[s];
      fill(0);
      textAlign(CENTER, BOTTOM);
      text(statusLabel, left + (s * cellWidth) + (cellWidth / 2), top - 10);
    }

    for (var c = 0; c < this.cutbacks.length; c++) {
      var cutback = this.cutbacks[c];
      var y = top + (c * cellHeight);

      fill(0);
      textAlign(RIGHT, CENTER);
      text(cutback, left - 12, y + (cellHeight / 2));

      for (var i = 0; i < this.statuses.length; i++) {
        var status = this.statuses[i];
        var count = this.counts[cutback][status];
        var strength = this.maxCount > 0 ? count / this.maxCount : 0;
        var x = left + (i * cellWidth);

        // Red cell with alpha scaled by this group's count (darker = more people).
        fill(SATheme.withAlpha(SATheme.redRGB, strength * 255));
        stroke(0);
        strokeWeight(1);
        rect(x, y, cellWidth - 4, cellHeight - 4);

        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        text(count, x + ((cellWidth - 4) / 2), y + ((cellHeight - 4) / 2));
      }
    }
  };

  this.drawLegend = function() {
    var x = 24;
    var y = height - 28;

    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    fill(90);
    text('Count per group', x, y);

    for (var i = 0; i < 5; i++) {
      var strength = i / 4;
      fill(SATheme.withAlpha(SATheme.redRGB, strength * 255));
      stroke(0);
      strokeWeight(1);
      rect(x + 92 + (i * 22), y - 8, 20, 16);
      noStroke();
    }
  };

  this.getShortStatus = function(status) {
    if (status == 'Studying and working') {
      return 'Study+work';
    }

    return status;
  };
}
