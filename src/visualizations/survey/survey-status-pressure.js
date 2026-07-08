function SurveyStatusPressure() {

  // ---- State ----

  this.name = 'Student vs worker';
  this.id = 'survey-status-pressure';
  this.table = null;
  this.loaded = false;
  this.statuses = ['Student', 'Employed', 'Unemployed', 'Studying and working'];
  this.pressures = ['Food', 'Transport', 'Data', 'Rent', 'Tuition', 'Debt', 'Electricity'];
  this.colours = SATheme.pressure;   // SA flag colours, shared with the waffle chart
  this.counts = {};
  this.totals = {};

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
        console.error('Could not load demo status pressure data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.countPressures();
  };

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (!this.counts.Student) {
      this.countPressures();
    }

    background(255);
    this.drawTitle();
    this.drawStackedBars();
    this.drawLegend();
  };

  // ---- Data ----

  // Count each status group's main-pressure responses and keep per-group totals.
  this.countPressures = function() {
    this.counts = {};
    this.totals = {};

    for (var s = 0; s < this.statuses.length; s++) {
      var status = this.statuses[s];
      this.counts[status] = {};
      this.totals[status] = 0;

      for (var p = 0; p < this.pressures.length; p++) {
        this.counts[status][this.pressures[p]] = 0;
      }
    }

    for (var row = 0; row < this.table.getRowCount(); row++) {
      var rowStatus = this.table.getString(row, 'status');
      var pressure = this.table.getString(row, 'pressure');

      if (this.counts[rowStatus] && this.counts[rowStatus].hasOwnProperty(pressure)) {
        this.counts[rowStatus][pressure]++;
        this.totals[rowStatus]++;
      }
    }
  };

  // ---- Drawing ----

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading demo status pressure data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(17);
    text('Who feels which pressure most? (demo)', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(80);
    text('Still running on invented rows — each bar splits a status group by its main cost pressure.',
         24,
         44,
         width - 48,
         32);
  };

  this.drawStackedBars = function() {
    // width < 700 => narrow / mobile layout (smaller bars and margins).
    var left = width < 700 ? 118 : 174;
    var right = width - 32;
    var startY = 112;
    var barHeight = width < 700 ? 28 : 34;
    var gap = width < 700 ? 42 : 54;
    var barWidth = right - left;

    for (var i = 0; i < this.statuses.length; i++) {
      var status = this.statuses[i];
      var y = startY + (i * gap);
      var currentX = left;

      fill(0);
      noStroke();
      textStyle(BOLD);
      textSize(width < 700 ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(this.getShortStatus(status), left - 12, y + (barHeight / 2));

      for (var p = 0; p < this.pressures.length; p++) {
        var pressure = this.pressures[p];
        var count = this.counts[status][pressure];
        var segmentWidth = this.totals[status] > 0
            ? (count / this.totals[status]) * barWidth
            : 0;

        if (segmentWidth > 0) {
          fill(this.colours[pressure]);
          stroke(0);
          strokeWeight(1);
          rect(currentX, y, segmentWidth, barHeight);

          // Only label a segment when it's wide enough to fit the count.
          if (segmentWidth > 24) {
            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            textStyle(BOLD);
            textSize(11);
            text(count, currentX + (segmentWidth / 2), y + (barHeight / 2));
          }
        }

        currentX += segmentWidth;
      }

      noStroke();
      fill(80);
      textStyle(NORMAL);
      textSize(11);
      textAlign(LEFT, CENTER);
      text('n=' + this.totals[status], right + 6, y + (barHeight / 2));
    }
  };

  this.drawLegend = function() {
    var itemWidth = width < 700 ? 92 : 118;
    var startX = 28;
    var startY = height - (width < 700 ? 74 : 52);

    textSize(11);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    noStroke();

    for (var i = 0; i < this.pressures.length; i++) {
      var pressure = this.pressures[i];
      var x = startX + ((i % 4) * itemWidth);
      var y = startY + (Math.floor(i / 4) * 24);

      fill(this.colours[pressure]);
      stroke(0);
      strokeWeight(1);
      rect(x, y - 7, 14, 14);
      noStroke();
      fill(0);
      text(pressure, x + 20, y);
    }
  };

  this.getShortStatus = function(status) {
    if (status == 'Studying and working') {
      return width < 700 ? 'Study+work' : status;
    }

    return status;
  };
}
