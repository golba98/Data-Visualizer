function SurveyFoodTransportBurden() {

  // ---- State ----

  this.name = 'Food vs transport';
  this.id = 'survey-food-transport-burden';
  this.table = null;
  this.loaded = false;
  this.foodBands = ['R501-R1000', 'R1001-R2000', 'R2001-R3000', 'R3000+'];   // grid rows (y)
  this.transportBands = ['R0-R300', 'R301-R600', 'R601-R1000', 'R1001-R1500', 'R1500+'];   // grid columns (x)
  this.counts = {};
  this.maxCount = 0;   // busiest cell, used to scale circle size

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
        console.error('Could not load food and transport burden data', error);
      });
  };

  this.setup = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.countBurden();
  };

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (this.maxCount == 0) {
      this.countBurden();
    }

    background(250, 250, 247);
    this.drawTitle();
    this.drawGrid();
  };

  // ---- Data ----

  // Count respondents in each (food band x transport band) cell and track the
  // busiest cell for circle scaling.
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

  // ---- Drawing ----

  this.drawLoading = function() {
    background(250, 250, 247);
    fill(31, 41, 55);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading burden data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(17);
    text('Food cost against transport cost (demo)', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(90);
    text('Invented rows, not real respondents. Each circle counts how many land in that food/transport combination.',
         24,
         44,
         width - 48,
         32);
  };

  this.drawGrid = function() {
    // width < 680 => narrow / mobile layout (tighter left margin).
    var left = width < 680 ? 94 : 130;
    var top = 96;
    var right = width - 28;
    var bottom = height - 72;
    var plotWidth = right - left;
    var plotHeight = bottom - top;
    var cellWidth = plotWidth / this.transportBands.length;
    var cellHeight = plotHeight / this.foodBands.length;

    stroke(200);
    strokeWeight(1);
    fill(240);

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
    textSize(width < 680 ? 9 : 11);
    fill(55, 65, 81);

    for (var x = 0; x < this.transportBands.length; x++) {
      textAlign(CENTER, TOP);
      text(this.transportBands[x],
           left + (x * cellWidth) + (cellWidth / 2),
           bottom + 10,
           cellWidth,
           28);
    }

    for (var y = 0; y < this.foodBands.length; y++) {
      textAlign(RIGHT, CENTER);
      text(this.foodBands[y],
           left - 10,
           top + (y * cellHeight) + (cellHeight / 2));
    }

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    fill(31, 41, 55);
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

        stroke(0);
        strokeWeight(1);
        fill(SATheme.withAlpha(SATheme.blueRGB, 150));
        circle(cx, cy, size);

        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(12);
        text(count, cx, cy);

        if (dist(mouseX, mouseY, cx, cy) < Math.max(size / 2, 14)) {
          drawChartTooltip(food + ' / ' + transport, String(count), 'responses');
        }
      }
    }
  };

  this.getExportData = function() {
    return tableToExportData(this.table);
  };
}
