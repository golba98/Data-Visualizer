// A single 0-100 pressure score built from five survey components, shown as a gauge.
// Source: project survey, 48 responses.
function SurveyPressureIndex() {

  this.name = 'Pressure index';
  this.id = 'survey-pressure-index';
  this.table = null;
  this.loaded = false;
  this.index = 0;          // overall 0-100 pressure score
  this.components = [];     // per-factor averages that make up the index

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
        console.error('Could not load survey pressure index data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.calculateIndex();
  };

  // Average each pressure factor across all responses (every factor is normalised to 0-1) and combine them into a single 0-100 index.
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
      { label: 'Transport cost', value: totals.transport / count, colour: SATheme.orange }
    ];

    var total = 0;
    for (var j = 0; j < this.components.length; j++) {
      total += this.components[j].value;
    }

    this.index = Math.round((total / this.components.length) * 100);
  };

  // Weight tables (0-1) mapping each survey answer to a pressure score.
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

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (this.components.length == 0) {
      this.calculateIndex();
    }

    var themeColours = [SATheme.green, SATheme.red, SATheme.gold, SATheme.blue, SATheme.orange];
    for (var colourIndex = 0; colourIndex < this.components.length; colourIndex++) {
      this.components[colourIndex].colour = themeColours[colourIndex];
    }

    background(SATheme.bg);
    this.drawTitle();
    this.drawGauge();
    this.drawComponentBars();
  };

  // Scoring / lookups

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    chartTextSize(14);
    text('Loading survey data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    text('How pressured are people feeling?', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text(SurveyData.chartLabel,
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 50 : 36);
  };

  // Gauge geometry, shared with drawComponentBars so the two never collide.
  this.gaugeCenterY = function() {
    return isCompactChart() ? Math.min(height * 0.43, 218) : height * 0.56;
  };

  this.gaugeRadius = function() {
    var compact = isCompactChart();
    var radius = compact
        ? Math.min(width * 0.24, height * 0.21, 116)
        : Math.min(width * 0.22, height * 0.28, 150);
    return Math.max(compact ? 72 : 96, radius);
  };

  // Bottom of the gauge including the value and "out of 100" text beneath it.
  this.gaugeBottom = function() {
    return this.gaugeCenterY() + (isCompactChart() ? 66 : 84);
  };

  this.drawGauge = function() {
    var compact = isCompactChart();
    var centerX = compact ? width / 2 : width * 0.34;
    var centerY = this.gaugeCenterY();
    var radius = this.gaugeRadius();

    noFill();
    strokeWeight(compact ? 14 : 18);
    strokeCap(ROUND);

    // Semicircular gauge split into three equal thirds using SA flag colours: green (low), gold (medium), red (high).
    stroke(SATheme.green);
    arc(centerX, centerY, radius * 2, radius * 2, PI, PI + (PI * 0.33));
    stroke(SATheme.gold);
    arc(centerX, centerY, radius * 2, radius * 2, PI + (PI * 0.33), PI + (PI * 0.66));
    stroke(SATheme.red);
    arc(centerX, centerY, radius * 2, radius * 2, PI + (PI * 0.66), TWO_PI);

    // Needle angle maps the 0-100 index onto the gauge's PI..TWO_PI sweep.
    var needleAngle = map(this.index, 0, 100, PI, TWO_PI);
    var needleLength = radius * 0.78;
    stroke(SATheme.axis);
    strokeWeight(4);
    line(centerX,
         centerY,
         centerX + cos(needleAngle) * needleLength,
         centerY + sin(needleAngle) * needleLength);

    noStroke();
    fill(SATheme.text);
    circle(centerX, centerY, 12);

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    chartTextSize(compact ? 36 : 46);
    fill(SATheme.text);
    text(this.index, centerX, centerY + (compact ? 26 : 34));

    textStyle(NORMAL);
    chartTextSize(compact ? 11 : 13);
    fill(SATheme.textMuted);
    text('out of 100', centerX, centerY + (compact ? 54 : 70));
  };

  this.drawComponentBars = function() {
    var compact = isCompactChart();
    var startX = compact ? 28 : width * 0.58;
    var barWidth = compact ? width - 56 : width * 0.32;
    var barHeight = compact ? 10 : 12;

    // Stacked under the gauge on a narrow canvas, so the rows have to fit whatever
    // height is left rather than starting at a fixed offset.
    var rows = this.components.length;
    var startY = 118;
    var rowGap = 38;
    if (compact) {
      var available = height - 26 - this.gaugeBottom();
      rowGap = Math.max(22, Math.min(30, available / rows));
      startY = this.gaugeBottom() + rowGap;
    }

    textAlign(LEFT, CENTER);
    chartTextSize(compact ? 11 : 12);
    textStyle(NORMAL);

    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      var y = startY + (i * rowGap);

      fill(SATheme.text);
      noStroke();
      text(component.label, startX, y - 10);

      fill(SATheme.grid);
      rect(startX, y + 3, barWidth, barHeight);
      fill(component.colour);
      rect(startX, y + 3, barWidth * component.value, barHeight);

      if (mouseIsOverRect(startX, y + 3, barWidth * component.value, barHeight)) {
        drawChartTooltip(component.label, Math.round(component.value * 100) + '%', 'component score');
      }

      fill(SATheme.textMuted);
      textAlign(RIGHT, CENTER);
      text(Math.round(component.value * 100), startX + barWidth, y - 10);
      textAlign(LEFT, CENTER);
    }
  };

  this.getExportData = function() {
    return tableToExportData(this.table);
  };
}
