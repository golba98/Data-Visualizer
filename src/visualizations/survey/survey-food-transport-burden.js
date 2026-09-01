// Food cost plotted against transport cost, one dot per respondent.
// Source: project survey, 48 responses.
function SurveyFoodTransportBurden() {

  this.name = 'Food vs transport';
  this.id = 'survey-food-transport-burden';
  this.table = null;
  this.loaded = false;
  this.foodBands = ['R501-R1000', 'R1001-R2000', 'R2001-R3000', 'R3000+'];   // grid rows (y)
  this.transportBands = ['R0-R300', 'R301-R600', 'R601-R1000', 'R1001-R1500', 'R1500+'];   // grid columns (x)
  this.counts = {};
  this.maxCount = 0;   // busiest cell, used to scale circle size

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
        console.error('Could not load food and transport burden data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.countBurden();
  };

  // Count respondents in each (food band x transport band) cell and track the busiest cell for circle scaling.
  this.countBurden = function() {
    this.counts = {};
    this.maxCount = 0;

    for (var f = 0; f < this.foodBands.length; f++) {
      this.counts[this.foodBands[f]] = {};

      for (var t = 0; t < this.transportBands.length; t++) {
        this.counts[this.foodBands[f]][this.transportBands[t]] = 0;
      }
    }

    for (var row = 0; row < this.table.getRowCount(); row++) {
      var food = this.table.getString(row, 'food_cost');
      var transport = this.table.getString(row, 'transport_cost');

      if (this.counts[food] && this.counts[food].hasOwnProperty(transport)) {
        this.counts[food][transport]++;
        this.maxCount = max(this.maxCount, this.counts[food][transport]);
      }
    }
  };

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (this.maxCount == 0) {
      this.countBurden();
    }

    background(SATheme.bg);
    this.drawTitle();
    this.drawGrid();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading burden data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    text('Food cost against transport cost', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text(SurveyData.chartLabel,
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 46 : 32);
  };

  this.drawGrid = function() {
    var left = isCompactChart() ? 94 : 130;
    var phoneLayout = isPhoneChart();
    var top = phoneLayout ? 108 : 96;
    var right = width - 28;
    var bottom = height - 72;
    var plotWidth = right - left;
    var plotHeight = bottom - top;
    var cellWidth = plotWidth / this.transportBands.length;
    var cellHeight = plotHeight / this.foodBands.length;
    var pointer = getChartPointer();

    stroke(SATheme.grid);
    strokeWeight(1);
    fill(SATheme.bg);

    for (var f = 0; f < this.foodBands.length; f++) {
      for (var t = 0; t < this.transportBands.length; t++) {
        rect(left + (t * cellWidth),
             top + (f * cellHeight),
             cellWidth,
             cellHeight);
      }
    }

    noStroke();
    textStyle(NORMAL);
    chartTextSize(isCompactChart() ? 9 : 11);
    fill(SATheme.textMuted);

    for (var x = 0; x < this.transportBands.length; x++) {
      var labelX = left + (x * cellWidth) + (cellWidth / 2);
      if (phoneLayout) {
        push();
        translate(labelX, bottom + 8);
        rotate(-PI / 4);
        textAlign(RIGHT, CENTER);
        chartTextSize(8);
        text(this.transportBands[x].replace(/R/g, ''), 0, 0);
        pop();
      } else {
        textAlign(CENTER, TOP);
        text(this.transportBands[x], labelX, bottom + 10, cellWidth, 28);
      }
    }

    for (var y = 0; y < this.foodBands.length; y++) {
      textAlign(RIGHT, CENTER);
      text(this.foodBands[y],
           left - 10,
           top + (y * cellHeight) + (cellHeight / 2));
    }

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    fill(SATheme.text);
    text('Transport cost', left + (plotWidth / 2), height - 20);

    push();
    translate(24, top + (plotHeight / 2));
    rotate(-HALF_PI);
    text('Food cost', 0, 0);
    pop();

    for (var fIndex = 0; fIndex < this.foodBands.length; fIndex++) {
      var food = this.foodBands[fIndex];

      for (var tIndex = 0; tIndex < this.transportBands.length; tIndex++) {
        var transport = this.transportBands[tIndex];
        var count = this.counts[food][transport];

        if (count == 0) {
          continue;
        }

        // Circle diameter scales with the count, capped to fit inside the cell.
        var size = map(count, 1, this.maxCount, 16, min(cellWidth, cellHeight) * 0.68);
        var cx = left + (tIndex * cellWidth) + (cellWidth / 2);
        var cy = top + (fIndex * cellHeight) + (cellHeight / 2);

        stroke(SATheme.axis);
        strokeWeight(1);
        fill(SATheme.withAlpha(SATheme.blueRGB, 150));
        circle(cx, cy, size);

        noStroke();
        fill(SATheme.text);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        chartTextSize(12);
        text(count, cx, cy);

        if (dist(pointer.x, pointer.y, cx, cy) < Math.max(size / 2, 14)) {
          drawChartTooltip(food + ' / ' + transport, String(count), 'responses');
        }
      }
    }
  };

  this.getExportData = function() {
    return tableToExportData(this.table);
  };
}
