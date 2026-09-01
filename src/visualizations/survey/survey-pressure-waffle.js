// Which cost people worry about most, as a 10x10 waffle where each cell is one response.
// Source: project survey, 48 responses.
function SurveyPressureWaffle() {

  this.name = 'Survey pressure waffle';
  this.id = 'survey-pressure-waffle';
  this.table = null;
  this.loaded = false;
  this.waffle = null;
  this.categories = ['Food', 'Transport', 'Data', 'Rent', 'Tuition', 'Debt', 'Electricity'];
  this.colours = SATheme.pressure;
  this.boxesAcross = 10;
  this.boxesDown = 10;
  this.layoutWidth = 0;
  this.layoutHeight = 0;
  this.legendBelow = false;

  this.preload = function() {
    var self = this;

    this.table = loadTable(SurveyData.path, 'csv', 'header', function(table) {
      self.table = table;
      self.loaded = true;
    }, function(error) {
      console.error('Could not load survey data for the pressure waffle', error);
      self.table = null;
      self.loaded = false;
    });
  };

  this.setup = function() {
    if (!this.loaded) {
      return;
    }

    this.buildWaffle();
  };

  // (Re)build the waffle sized to the current canvas.
  this.buildWaffle = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.layoutWidth = width;
    this.layoutHeight = height;
    this.colours = SATheme.pressure;

    this.legendBelow = isCompactChart();

    var waffleSize = this.legendBelow
        ? Math.min(width - 56, height * 0.44, 320)
        : Math.min(width * 0.42, height * 0.58, 380);
    waffleSize = Math.max(180, Math.floor(waffleSize));

    var x = this.legendBelow
        ? Math.floor((width - waffleSize) / 2)
        : Math.max(28, Math.floor(width * 0.10));
    var y = this.legendBelow
        ? 92
        : Math.max(92, Math.floor((height - waffleSize) / 2));

    this.waffle = new Waffle(
      x,
      y,
      waffleSize,
      waffleSize,
      this.boxesAcross,
      this.boxesDown,
      this.table,
      'pressure',
      this.categories,
      this.colours
    );
  };

  this.draw = function() {
    if (!this.loaded || !this.table) {
      this.drawLoading();
      return;
    }

    if (!this.waffle || this.layoutWidth != width || this.layoutHeight != height) {
      this.buildWaffle();
    }

    background(SATheme.bg);
    this.drawTitle();

    this.waffle.draw();
    this.drawLegend();

    var hoveredCategory = this.waffle.checkMouse();
    if (hoveredCategory) {
      this.drawTooltip(hoveredCategory);
    }
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading survey data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    textAlign(LEFT, TOP);
    chartTextSize(isPhoneChart() ? 13 : 16);
    textStyle(BOLD);
    text('What people worry about most', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    fill(SATheme.textMuted);
    chartTextSize(12);
    var subtitle = SurveyData.chartLabel;
    text(subtitle, 24, isPhoneChart() ? 54 : 42, width - 48, isPhoneChart() ? 48 : 34);
  };

  this.drawLegend = function() {
    var startX = this.legendBelow ? 26 : this.waffle.x + this.waffle.width + 30;
    var y = this.legendBelow ? this.waffle.y + this.waffle.height + 30 : this.waffle.y + 4;
    var total = this.table.getRowCount();
    var itemWidth = this.legendBelow ? Math.max(150, Math.floor((width - 52) / 2)) : 116;
    var valueOffset = this.legendBelow ? 78 : 102;

    textAlign(LEFT, CENTER);
    chartTextSize(this.legendBelow ? 11 : 12);
    noStroke();

    for (var i = 0; i < this.categories.length; i++) {
      var category = this.categories[i];
      var count = this.waffle.counts[category] || 0;
      var percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      var itemX = this.legendBelow
          ? startX + ((i % 2) * itemWidth)
          : startX;
      var itemY = this.legendBelow
          ? y + (Math.floor(i / 2) * 26)
          : y + (i * 34);

      fill(this.colours[category]);
      stroke(SATheme.axis);
      strokeWeight(1);
      rect(itemX, itemY - 7, 14, 14);
      noStroke();

      fill(SATheme.text);
      textStyle(BOLD);
      text(category, itemX + 22, itemY);

      fill(SATheme.textMuted);
      textStyle(NORMAL);
      text(count + ' (' + percent + '%)', itemX + valueOffset, itemY);
    }
  };

  // Queued through the shared tooltip so it is painted above every waffle cell.
  this.drawTooltip = function(category) {
    var count = this.waffle.counts[category] || 0;
    var percent = this.table.getRowCount() > 0
        ? ((count / this.table.getRowCount()) * 100).toFixed(1)
        : '0.0';
    drawChartTooltip(category, count + ' responses', percent + '%');
  };

  this.getExportData = function() {
    return tableToExportData(this.table);
  };
}
