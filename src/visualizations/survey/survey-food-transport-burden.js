// Compares food and transport costs
function SurveyFoodTransportBurden() {

  this.name = 'Food vs transport';
  this.id = 'survey-food-transport-burden';
  this.table = null;
  this.loaded = false;
  this.foodBands = ['R0-R500', 'R501-R1000', 'R1001-R2000', 'R2001-R3000', 'R3000+'];
  this.transportBands = ['R0-R300', 'R301-R600', 'R601-R1000', 'R1001-R1500', 'R1500+'];
  this.counts = {};
  this.maxCount = 0;
  this.representedRows = 0;

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

  // Counts responses in each cost group
  this.countBurden = function() {
    this.counts = {};
    this.maxCount = 0;
    this.representedRows = 0;

    for (var fIdx = 0; fIdx < this.foodBands.length; fIdx++) {
      var fBand = this.foodBands[fIdx];
      this.counts[fBand] = {};
      for (var tIdx = 0; tIdx < this.transportBands.length; tIdx++) {
        this.counts[fBand][this.transportBands[tIdx]] = 0;
      }
    }

    var totalRows = this.table.getRowCount();
    for (var r = 0; r < totalRows; r++) {
      var foodVal = this.table.getString(r, 'food_cost');
      var transVal = this.table.getString(r, 'transport_cost');

      if (this.counts[foodVal] && (transVal in this.counts[foodVal])) {
        this.counts[foodVal][transVal]++;
        if (this.counts[foodVal][transVal] > this.maxCount) {
          this.maxCount = this.counts[foodVal][transVal];
        }
        this.representedRows++;
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
    var isCompact = isCompactChart();
    var isPhone = isPhoneChart();
    var gridLeft = isCompact ? 94 : 130;
    var gridTop = isPhone ? 108 : 96;
    var gridRight = width - 28;
    var gridBottom = height - 72;
    var gridW = gridRight - gridLeft;
    var gridH = gridBottom - gridTop;
    var colWidth = gridW / this.transportBands.length;
    var rowHeight = gridH / this.foodBands.length;
    var cursor = getChartPointer();

    stroke(SATheme.grid);
    strokeWeight(1);
    fill(SATheme.bg);

    for (var rIndex = 0; rIndex < this.foodBands.length; rIndex++) {
      for (var cIndex = 0; cIndex < this.transportBands.length; cIndex++) {
        rect(gridLeft + (cIndex * colWidth),
             gridTop + (rIndex * rowHeight),
             colWidth,
             rowHeight);
      }
    }

    noStroke();
    textStyle(NORMAL);
    chartTextSize(isCompact ? 9 : 11);
    fill(SATheme.textMuted);

    for (var xCol = 0; xCol < this.transportBands.length; xCol++) {
      var colCenterX = gridLeft + (xCol * colWidth) + (colWidth / 2);
      if (isPhone) {
        push();
        translate(colCenterX, gridBottom + 8);
        rotate(-PI / 4);
        textAlign(RIGHT, CENTER);
        chartTextSize(8);
        text(this.transportBands[xCol].replace(/R/g, ''), 0, 0);
        pop();
      } else {
        textAlign(CENTER, TOP);
        text(this.transportBands[xCol], colCenterX, gridBottom + 10, colWidth, 28);
      }
    }

    for (var yRow = 0; yRow < this.foodBands.length; yRow++) {
      textAlign(RIGHT, CENTER);
      text(this.foodBands[yRow],
           gridLeft - 10,
           gridTop + (yRow * rowHeight) + (rowHeight / 2));
    }

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    fill(SATheme.text);
    text('Transport cost', gridLeft + (gridW / 2), height - 20);

    push();
    translate(24, gridTop + (gridH / 2));
    rotate(-HALF_PI);
    text('Food cost', 0, 0);
    pop();

    for (var f = 0; f < this.foodBands.length; f++) {
      var foodName = this.foodBands[f];

      for (var t = 0; t < this.transportBands.length; t++) {
        var transName = this.transportBands[t];
        var cellCount = this.counts[foodName][transName];

        if (cellCount === 0) {
          continue;
        }

        var bubbleDiameter = map(cellCount, 1, this.maxCount, 16, Math.min(colWidth, rowHeight) * 0.68);
        var bubbleCenterX = gridLeft + (t * colWidth) + (colWidth / 2);
        var bubbleCenterY = gridTop + (f * rowHeight) + (rowHeight / 2);

        stroke(SATheme.axis);
        strokeWeight(1);
        fill(SATheme.withAlpha(SATheme.blueRGB, 150));
        circle(bubbleCenterX, bubbleCenterY, bubbleDiameter);

        noStroke();
        fill(SATheme.text);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        chartTextSize(12);
        text(cellCount, bubbleCenterX, bubbleCenterY);

        if (dist(cursor.x, cursor.y, bubbleCenterX, bubbleCenterY) < Math.max(16, bubbleDiameter / 2)) {
          var percentageOfAll = this.representedRows > 0 ? ((cellCount / this.representedRows) * 100).toFixed(1) : '0.0';
          drawChartTooltip(foodName + ' food, ' + transName + ' transport', cellCount + ' respondents', percentageOfAll + '% of survey');
        }
      }
    }
  };

  this.getExportData = function() {
    return tableToExportData(this.table);
  };
}
