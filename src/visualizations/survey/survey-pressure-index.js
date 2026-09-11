// Uses the template's visualisation interface: name, id, preload, setup, draw, destroy.
// Everything below is own.
/* Start - own code */

// Draws the survey pressure score
function SurveyPressureIndex() {

  this.name = 'Pressure index';
  this.id = 'survey-pressure-index';
  this.table = null;
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading survey data...'
  });
  this.index = 0;
  this.components = [];
  this.validRows = 0;
  this.skippedRows = 0;

  this.preload = function() {
    var self = this;

    this.loadState.loadTables([{
      path: SurveyData.path,
      requiredColumns: ['pressure', 'work_worry', 'income_keeps_up',
                        'transport_cost', 'food_cost'],
      numericColumns: ['work_worry', 'income_keeps_up'],
      assign: function(table) { self.table = table; }
    }]);
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

    this.skippedRows = 0;

    for (var r = 0; r < rowCount; r++) {
      var pScore = this.getPressureScore(this.table.getString(r, 'pressure'));
      var fScore = this.getFoodScore(this.table.getString(r, 'food_cost'));
      var tScore = this.getTransportScore(this.table.getString(r, 'transport_cost'));
      var worry = this.table.getNum(r, 'work_worry');
      var income = this.table.getNum(r, 'income_keeps_up');

      // A row only contributes when every component is recognised. Previously an
      // unknown answer was scored with a fallback weight and still counted, so
      // invalid data moved the index instead of being excluded from it.
      if (pScore === null || fScore === null || tScore === null
          || !this.isValidRating(worry) || !this.isValidRating(income)) {
        this.skippedRows++;
        continue;
      }

      totals.pressure += pScore;
      totals.worry += worry / 5.0;
      totals.incomeGap += (6.0 - income) / 5.0;
      totals.food += fScore;
      totals.transport += tScore;
      validRows++;
    }

    this.validRows = validRows;

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

  // The survey uses a 1-5 scale; anything else is not a rating.
  this.isValidRating = function(value) {
    return typeof value === 'number' && isFinite(value) && value >= 1 && value <= 5;
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
      default: return null;
    }
  };

  this.getFoodScore = function(value) {
    switch (value) {
      case 'R3000+': return 1.00;
      case 'R2001-R3000': return 0.82;
      case 'R1001-R2000': return 0.60;
      case 'R501-R1000': return 0.35;
      case 'R0-R500': return 0.15;
      default: return null;
    }
  };

  this.getTransportScore = function(value) {
    switch (value) {
      case 'R1500+': return 1.00;
      case 'R1001-R1500': return 0.82;
      case 'R601-R1000': return 0.62;
      case 'R301-R600': return 0.40;
      case 'R0-R300': return 0.20;
      default: return null;
    }
  };

  this.draw = function() {
    if (this.loadState.draw()) return;

    if (this.components.length == 0) {
      this.calculateIndex();
    }

    var themeColours = [SATheme.green, SATheme.red, SATheme.gold, SATheme.blue, SATheme.orange];
    for (var colourIndex = 0; colourIndex < this.components.length; colourIndex++) {
      this.components[colourIndex].colour = themeColours[colourIndex];
    }

    background(SATheme.bg);
    var layout = this.getLayout(this.drawTitle() + 8);
    this.drawGauge(layout);
    this.drawComponentBars(layout);
  };

  // Returns the y below the title block.
  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    var y = 18 + drawWrappedText('How pressured are people feeling?', 24, 18, width - 48);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    y += 6;
    return y + drawWrappedText(SurveyData.chartLabel, 24, y, width - 48);
  };

  // Places the gauge and the component rows below top. Wide or landscape
  // canvases put the gauge beside the rows; portrait canvases stack them and
  // size the gauge to the height the rows leave. Each row is a label above
  // its bar, so rows are never closer than ROW_MIN or labels sit on bars.
  this.getLayout = function(top) {
    var ROW_MIN = 32;
    var compact = isCompactChart();
    var sideBySide = !compact || (width >= 420 && width >= height * 1.25);
    var rowCount = Math.max(1, this.components.length);
    var bottom = height - 16;
    var layout = {
      sideBySide: sideBySide,
      stroke: compact ? 14 : 18,
      numberSize: sideBySide ? (compact ? 36 : 46) : 30,
      numberOffset: sideBySide ? (compact ? 26 : 34) : 22,
      captionOffset: sideBySide ? (compact ? 54 : 70) : 44
    };
    var belowCentre = layout.captionOffset + 10;

    if (sideBySide) {
      var available = bottom - top;
      layout.radius = Math.max(40, Math.min((width * 0.52 - 24) / 2 - layout.stroke, available - belowCentre - layout.stroke, 150));
      var gaugeHeight = layout.radius + (layout.stroke / 2) + belowCentre;
      layout.centreX = width * 0.34;
      layout.centreY = top + ((available - gaugeHeight) / 2) + (layout.stroke / 2) + layout.radius;
      layout.barsX = width * 0.58;
      layout.barWidth = width * 0.32;
      layout.rowGap = constrain(available / rowCount, ROW_MIN, 38);
      layout.firstRowY = top + ((available - (layout.rowGap * rowCount)) / 2) + 17;
    } else {
      layout.rowGap = ROW_MIN;
      var gaugeSpace = bottom - top - (rowCount * layout.rowGap) - belowCentre - layout.stroke;
      layout.radius = constrain(gaugeSpace, 44, Math.min(width * 0.24, 116));
      layout.centreX = width / 2;
      layout.centreY = top + (layout.stroke / 2) + layout.radius;
      var rowsTop = layout.centreY + belowCentre;
      layout.rowGap = constrain((bottom - rowsTop) / rowCount, ROW_MIN, 38);
      layout.barsX = 28;
      layout.barWidth = width - 56;
      layout.firstRowY = rowsTop + 17;
    }
    return layout;
  };

  this.drawGauge = function(layout) {
    var gaugeOriginX = layout.centreX;
    var gaugeOriginY = layout.centreY;
    var dialRadius = layout.radius;
    var strokeThick = layout.stroke;

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
    chartTextSize(layout.numberSize);
    fill(SATheme.text);
    text(this.index, gaugeOriginX, gaugeOriginY + layout.numberOffset);

    textStyle(NORMAL);
    chartTextSize(isCompactChart() ? 11 : 13);
    fill(SATheme.textMuted);
    text('out of 100', gaugeOriginX, gaugeOriginY + layout.captionOffset);
  };

  this.drawComponentBars = function(layout) {
    var compact = isCompactChart();
    var startX = layout.barsX;
    var barWidth = layout.barWidth;
    var barHeight = compact ? 10 : 12;

    textAlign(LEFT, CENTER);
    chartTextSize(compact ? 11 : 12);
    textStyle(NORMAL);

    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      var y = layout.firstRowY + (i * layout.rowGap);

      fill(SATheme.text);
      noStroke();
      text(component.label, startX, y - 10);

      fill(SATheme.grid);
      rect(startX, y + 3, barWidth, barHeight);
      fill(component.colour);
      rect(startX, y + 3, barWidth * component.value, barHeight);

      // The whole row, label included, is the tap target.
      if (mouseIsOverRect(startX, y - 17, barWidth, layout.rowGap)) {
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

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
