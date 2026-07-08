function SurveyPressureWaffle() {

  // ---- State ----

  this.name = 'Survey pressure waffle';
  this.id = 'survey-pressure-waffle';
  this.table = null;
  this.loaded = false;
  this.waffle = null;
  this.categories = ['Food', 'Transport', 'Data', 'Rent', 'Tuition', 'Debt', 'Electricity'];
  this.colours = SATheme.pressure;   // SA flag colours, shared with the stacked-bar chart
  this.boxesAcross = 10;   // 10 x 10 = 100 boxes, so each box is roughly 1%
  this.boxesDown = 10;
  this.layoutWidth = 0;    // cached canvas size; rebuild the waffle when it changes
  this.layoutHeight = 0;
  this.legendBelow = false;

  // ---- Lifecycle ----

  this.preload = function() {
    var self = this;

    this.table = loadTable('data/south-africa/survey_pressure_cleaned.csv', 'csv', 'header', function(table) {
      self.table = table;
      self.loaded = true;
      console.log('Survey pressure CSV loaded:', table.getRowCount(), 'rows');
    }, function(error) {
      console.error('Could not load survey_pressure_cleaned.csv for survey pressure waffle', error);
      self.table = null;
      self.loaded = false;
    });
  };

  this.setup = function() {
    if (!this.loaded) {
      console.log('Survey pressure data not yet loaded');
      return;
    }

    this.buildWaffle();
  };

  // ---- Layout ----

  // (Re)build the waffle sized to the current canvas. On narrow screens the
  // legend moves below the waffle instead of beside it.
  this.buildWaffle = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.layoutWidth = width;
    this.layoutHeight = height;

    this.legendBelow = width < 760;   // width < 760 => narrow / mobile layout

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

  // ---- Drawing ----

  this.draw = function() {
    if (!this.loaded || !this.table) {
      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      text('Loading survey data...', width / 2, height / 2);
      return;
    }

    if (!this.waffle || this.layoutWidth != width || this.layoutHeight != height) {
      this.buildWaffle();
    }

    background(255);
    this.drawHeading();

    this.waffle.draw();
    this.drawLegend();

    var hoveredCategory = this.waffle.checkMouse();
    if (hoveredCategory) {
      this.drawTooltip(hoveredCategory);
    }
  };

  this.drawHeading = function() {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textSize(16);
    textStyle(BOLD);
    text('Main cost pressure', 24, 18);

    textStyle(NORMAL);
    fill(90);
    textSize(12);
    var subtitle = 'Pressure answers from 41 survey rows, shown as 100 boxes.';
    text(subtitle, 24, 42);
  };

  this.drawLegend = function() {
    var startX = this.legendBelow ? 26 : this.waffle.x + this.waffle.width + 30;
    var y = this.legendBelow ? this.waffle.y + this.waffle.height + 30 : this.waffle.y + 4;
    var total = this.table.getRowCount();
    var itemWidth = this.legendBelow ? Math.max(150, Math.floor((width - 52) / 2)) : 116;
    var valueOffset = this.legendBelow ? 78 : 102;

    textAlign(LEFT, CENTER);
    textSize(this.legendBelow ? 11 : 12);
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
      stroke(0);
      strokeWeight(1);
      rect(itemX, itemY - 7, 14, 14);
      noStroke();

      fill(0);
      textStyle(BOLD);
      text(category, itemX + 22, itemY);

      fill(90);
      textStyle(NORMAL);
      text(count + ' (' + percent + '%)', itemX + valueOffset, itemY);
    }
  };

  this.drawTooltip = function(category) {
    var count = this.waffle.counts[category] || 0;
    var percent = this.table.getRowCount() > 0
        ? ((count / this.table.getRowCount()) * 100).toFixed(1)
        : '0.0';
    var label = category + ': ' + count + ' responses (' + percent + '%)';
    textSize(12);
    var labelWidth = textWidth(label) + 18;
    var labelHeight = 24;
    var x = constrain(mouseX + 12, 4, width - labelWidth - 4);
    var y = constrain(mouseY - 32, 4, height - labelHeight - 4);

    stroke(0);
    strokeWeight(1);
    fill(255);
    rect(x, y, labelWidth, labelHeight);
    noStroke();
    fill(0);
    textAlign(LEFT, CENTER);
    text(label, x + 9, y + (labelHeight / 2));
  };
}
