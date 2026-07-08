function SurveyPressureIndex() {

  // ---- State ----

  this.name = 'Pressure index';
  this.id = 'survey-pressure-index';
  this.table = null;
  this.loaded = false;
  this.index = 0;          // overall 0-100 pressure score
  this.components = [];     // per-factor averages that make up the index

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
        console.error('Could not load survey pressure index data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.calculateIndex();
  };

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (this.components.length == 0) {
      this.calculateIndex();
    }

    background(255);
    this.drawTitle();
    this.drawGauge();
    this.drawComponentBars();
  };

  // ---- Data ----

  // Average each pressure factor across all responses (every factor is
  // normalised to 0-1) and combine them into a single 0-100 index.
  this.calculateIndex = function() {
    var totals = {
      pressure: 0,
      worry: 0,
      incomeGap: 0,
      food: 0,
      transport: 0
    };
    var count = 0;

    for (var i = 0; i < this.table.getRowCount(); i++) {
      totals.pressure += this.getPressureScore(this.table.getString(i, 'pressure'));
      totals.worry += this.table.getNum(i, 'work_worry') / 5;                 // 1-5 rating -> 0-1
      totals.incomeGap += (6 - this.table.getNum(i, 'income_keeps_up')) / 5;  // reverse 1-5 -> 0-1 (lower income = bigger gap)
      totals.food += this.getFoodScore(this.table.getString(i, 'food_cost'));
      totals.transport += this.getTransportScore(this.table.getString(i, 'transport_cost'));
      count++;
    }

    if (count == 0) {
      this.index = 0;
      this.components = [];
      return;
    }

    this.components = [
      { label: 'Main pressure', value: totals.pressure / count, colour: SATheme.green },
      { label: 'Work worry', value: totals.worry / count, colour: SATheme.red },
      { label: 'Income gap', value: totals.incomeGap / count, colour: SATheme.gold },
      { label: 'Food cost', value: totals.food / count, colour: SATheme.blue },
      { label: 'Transport cost', value: totals.transport / count, colour: SATheme.black }
    ];

    var total = 0;
    for (var j = 0; j < this.components.length; j++) {
      total += this.components[j].value;
    }

    this.index = Math.round((total / this.components.length) * 100);
  };

  // ---- Scoring / lookups ----

  // Weight tables (0-1) mapping each survey answer to a pressure score.
  // Unknown answers fall back to the default returned at the end.
  this.getPressureScore = function(value) {
    var scores = {
      Food: 0.90,
      Transport: 0.85,
      Data: 0.70,
      Rent: 0.95,
      Tuition: 0.78,
      Debt: 1.00,
      Electricity: 0.82
    };

    return scores[value] || 0.55;
  };

  this.getFoodScore = function(value) {
    var scores = {
      'R501-R1000': 0.35,
      'R1001-R2000': 0.60,
      'R2001-R3000': 0.82,
      'R3000+': 1.00
    };

    return scores[value] || 0.25;
  };

  this.getTransportScore = function(value) {
    var scores = {
      'R0-R300': 0.20,
      'R301-R600': 0.40,
      'R601-R1000': 0.62,
      'R1001-R1500': 0.82,
      'R1500+': 1.00
    };

    return scores[value] || 0.25;
  };

  // ---- Drawing ----

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text('Loading survey data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(17);
    text('How pressured are people feeling? (demo)', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(90);
    text("Built from made-up survey answers while I wait on the real thing.",
         24,
         44,
         width - 48,
         36);
  };

  this.drawGauge = function() {
    var compact = width < 720;   // narrow / mobile layout
    var centerX = compact ? width / 2 : width * 0.34;
    var centerY = compact ? Math.min(height * 0.43, 218) : height * 0.56;
    var radius = compact
        ? Math.min(width * 0.24, height * 0.21, 116)
        : Math.min(width * 0.22, height * 0.28, 150);
    radius = Math.max(compact ? 72 : 96, radius);

    noFill();
    strokeWeight(compact ? 14 : 18);
    strokeCap(ROUND);

    // Semicircular gauge split into three equal thirds using SA flag colours:
    // green (low), gold (medium), red (high). Angles sweep from PI to TWO_PI.
    stroke(SATheme.green);
    arc(centerX, centerY, radius * 2, radius * 2, PI, PI + (PI * 0.33));
    stroke(SATheme.gold);
    arc(centerX, centerY, radius * 2, radius * 2, PI + (PI * 0.33), PI + (PI * 0.66));
    stroke(SATheme.red);
    arc(centerX, centerY, radius * 2, radius * 2, PI + (PI * 0.66), TWO_PI);

    // Needle angle maps the 0-100 index onto the gauge's PI..TWO_PI sweep.
    var needleAngle = map(this.index, 0, 100, PI, TWO_PI);
    var needleLength = radius * 0.78;
    stroke(0);
    strokeWeight(4);
    line(centerX,
         centerY,
         centerX + cos(needleAngle) * needleLength,
         centerY + sin(needleAngle) * needleLength);

    noStroke();
    fill(0);
    circle(centerX, centerY, 12);

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(compact ? 36 : 46);
    fill(0);
    text(this.index, centerX, centerY + (compact ? 26 : 34));

    textStyle(NORMAL);
    textSize(compact ? 11 : 13);
    fill(90);
    text('out of 100', centerX, centerY + (compact ? 54 : 70));
  };

  this.drawComponentBars = function() {
    var compact = width < 720;   // narrow / mobile layout
    var startX = compact ? 28 : width * 0.58;
    var startY = compact ? Math.max(310, height - 160) : 118;
    var barWidth = compact ? width - 56 : width * 0.32;
    var rowGap = compact ? 30 : 38;
    var barHeight = compact ? 10 : 12;

    textAlign(LEFT, CENTER);
    textSize(compact ? 11 : 12);
    textStyle(NORMAL);

    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      var y = startY + (i * rowGap);

      fill(0);
      noStroke();
      text(component.label, startX, y - 10);

      fill(220);
      rect(startX, y + 3, barWidth, barHeight);
      fill(component.colour);
      rect(startX, y + 3, barWidth * component.value, barHeight);

      fill(90);
      textAlign(RIGHT, CENTER);
      text(Math.round(component.value * 100), startX + barWidth, y - 10);
      textAlign(LEFT, CENTER);
    }
  };
}
