// Draws the survey pressure score
function SurveyPressureIndex() {

  this.name = 'Pressure index';
  this.id = 'survey-pressure-index';
  this.table = null;
  this.loaded = false;
  this.index = 0;
  this.components = [];

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

  // Calculates the average pressure score
  this.calculateIndex = function() {
    var totals = {
      pressure: 0,
      worry: 0,
      incomeGap: 0,
      food: 0,
      transport: 0
    };
    var validRows = 0;
    var rowCount = this.table.getRowCount();

    for (var r = 0; r < rowCount; r++) {
      var pScore = this.getPressureScore(this.table.getString(r, 'pressure'));
      var wScore = this.table.getNum(r, 'work_worry') / 5.0;
      var gapScore = (6.0 - this.table.getNum(r, 'income_keeps_up')) / 5.0;
      var fScore = this.getFoodScore(this.table.getString(r, 'food_cost'));
      var tScore = this.getTransportScore(this.table.getString(r, 'transport_cost'));

      totals.pressure += pScore;
      totals.worry += wScore;
      totals.incomeGap += gapScore;
      totals.food += fScore;
      totals.transport += tScore;
      validRows++;
    }

    if (validRows === 0) {
      this.index = 0;
      this.components = [];
      return;
    }

    this.components = [
      { label: 'Main pressure', value: totals.pressure / validRows, colour: SATheme.green },
      { label: 'Work worry', value: totals.worry / validRows, colour: SATheme.red },
      { label: 'Income gap', value: totals.incomeGap / validRows, colour: SATheme.gold },
      { label: 'Food cost', value: totals.food / validRows, colour: SATheme.blue },
      { label: 'Transport cost', value: totals.transport / validRows, colour: SATheme.orange }
    ];

    var sumComponents = 0;
    for (var k = 0; k < this.components.length; k++) {
      sumComponents += this.components[k].value;
    }

    this.index = Math.round((sumComponents / this.components.length) * 100);
  };

  this.getPressureScore = function(value) {
    switch (value) {
      case 'Debt': return 1.00;
      case 'Rent': return 0.95;
      case 'Food': return 0.90;
      case 'Transport': return 0.85;
      case 'Electricity': return 0.82;
      case 'Tuition': return 0.78;
      case 'Data': return 0.70;
      default: return 0.55;
    }
  };

  this.getFoodScore = function(value) {
    switch (value) {
      case 'R3000+': return 1.00;
      case 'R2001-R3000': return 0.82;
      case 'R1001-R2000': return 0.60;
      case 'R501-R1000': return 0.35;
      case 'R0-R500': return 0.15;
      default: return 0.25;
    }
  };

  this.getTransportScore = function(value) {
    switch (value) {
      case 'R1500+': return 1.00;
      case 'R1001-R1500': return 0.82;
      case 'R601-R1000': return 0.62;
      case 'R301-R600': return 0.40;
      case 'R0-R300': return 0.20;
      default: return 0.25;
    }
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

  this.gaugeBottom = function() {
    return this.gaugeCenterY() + (isCompactChart() ? 66 : 84);
  };

  this.drawGauge = function() {
    var isCompact = isCompactChart();
    var gaugeOriginX = isCompact ? (width / 2) : (width * 0.34);
    var gaugeOriginY = this.gaugeCenterY();
    var dialRadius = this.gaugeRadius();
    var strokeThick = isCompact ? 14 : 18;

    noFill();
    strokeWeight(strokeThick);
    strokeCap(ROUND);

    var spanThird = PI / 3.0;
    stroke(SATheme.green);
    arc(gaugeOriginX, gaugeOriginY, dialRadius * 2, dialRadius * 2, PI, PI + spanThird);
    stroke(SATheme.gold);
    arc(gaugeOriginX, gaugeOriginY, dialRadius * 2, dialRadius * 2, PI + spanThird, PI + (2 * spanThird));
    stroke(SATheme.red);
    arc(gaugeOriginX, gaugeOriginY, dialRadius * 2, dialRadius * 2, PI + (2 * spanThird), TWO_PI);

    var targetRad = map(this.index, 0, 100, PI, TWO_PI);
    var pointerLen = dialRadius * 0.78;
    stroke(SATheme.axis);
    strokeWeight(4);
    var tipX = gaugeOriginX + Math.cos(targetRad) * pointerLen;
    var tipY = gaugeOriginY + Math.sin(targetRad) * pointerLen;
    line(gaugeOriginX, gaugeOriginY, tipX, tipY);

    noStroke();
    fill(SATheme.text);
    circle(gaugeOriginX, gaugeOriginY, 12);

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    chartTextSize(isCompact ? 36 : 46);
    fill(SATheme.text);
    text(this.index, gaugeOriginX, gaugeOriginY + (isCompact ? 26 : 34));

    textStyle(NORMAL);
    chartTextSize(isCompact ? 11 : 13);
    fill(SATheme.textMuted);
    text('out of 100', gaugeOriginX, gaugeOriginY + (isCompact ? 54 : 70));
  };

  this.drawComponentBars = function() {
    var compact = isCompactChart();
    var startX = compact ? 28 : width * 0.58;
    var barWidth = compact ? width - 56 : width * 0.32;
    var barHeight = compact ? 10 : 12;

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
