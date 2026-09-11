// Uses the template's visualisation interface: name, id, preload, setup, draw, destroy.
// Everything below is own.
/* Start - own code */

// Shows the main money worry
function SurveyPressureWaffle() {

  this.name = 'Survey pressure waffle';
  this.id = 'survey-pressure-waffle';
  this.table = null;
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading survey data...'
  });
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

    this.loadState.loadTables([{
      path: SurveyData.path,
      requiredColumns: ['pressure'],
      assign: function(table) { self.table = table; }
    }]);
  };

  this.setup = function() {
    if (!this.loaded) {
      return;
    }

    this.buildWaffle();
  };

  // Lays out the grid and its legend below the measured title. Landscape
  // canvases put the legend beside the grid; portrait ones put it below, in
  // two columns when two fit. The grid is the largest square left over.
  this.getLayout = function() {
    var top = this.titleBottom() + 16;
    var bottom = height - 14;
    var count = this.categories.length;
    var layout = { beside: width >= 420 && width >= height * 1.2 };

    chartTextSize(layout.beside ? 12 : 11);
    textStyle(BOLD);
    var nameWidth = 0;
    for (var i = 0; i < count; i++) {
      nameWidth = Math.max(nameWidth, textWidth(this.categories[i]));
    }
    textStyle(NORMAL);
    layout.valueOffset = 22 + nameWidth + 12;
    var itemWidth = layout.valueOffset + textWidth('11 (22.9%)') + 16;

    if (layout.beside) {
      layout.rowGap = constrain((bottom - top) / count, 20, 34);
      var side = Math.min(bottom - top, width - 48 - 30 - itemWidth, 380);
      layout.side = Math.max(100, Math.floor(side));
      layout.x = Math.max(24, Math.floor((width - layout.side - 30 - itemWidth) / 2));
      layout.y = Math.floor(top + ((bottom - top - layout.side) / 2));
      layout.legendX = layout.x + layout.side + 30;
      layout.legendY = top + ((bottom - top - (layout.rowGap * (count - 1))) / 2);
      layout.columns = 1;
    } else {
      layout.columns = (width - 48) >= itemWidth * 2 ? 2 : 1;
      layout.rowGap = 22;
      layout.itemWidth = (width - 48) / layout.columns;
      var legendHeight = Math.ceil(count / layout.columns) * layout.rowGap;
      var squareSide = Math.min(width - 56, bottom - top - legendHeight - 16, 320);
      layout.side = Math.max(100, Math.floor(squareSide));
      layout.x = Math.floor((width - layout.side) / 2);
      layout.y = top;
      layout.legendX = 24;
      layout.legendY = layout.y + layout.side + 16 + (layout.rowGap / 2);
    }
    return layout;
  };

  this.buildWaffle = function() {
    if (!this.loaded || !this.table) {
      return;
    }

    this.layoutWidth = width;
    this.layoutHeight = height;
    this.colours = SATheme.pressure;
    this.layout = this.getLayout();

    this.waffle = new Waffle(
      this.layout.x,
      this.layout.y,
      this.layout.side,
      this.layout.side,
      this.boxesAcross,
      this.boxesDown,
      this.table,
      'pressure',
      this.categories,
      this.colours
    );
  };

  this.draw = function() {
    if (this.loadState.draw()) return;

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

  this.titleText = 'What people worry about most';

  // Measures the title block without drawing it, for the layout.
  this.titleBottom = function() {
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 16);
    var y = 18 + wrappedTextHeight(this.titleText, width - 48) + 6;
    textStyle(NORMAL);
    chartTextSize(12);
    return y + wrappedTextHeight(SurveyData.chartLabel, width - 48);
  };

  this.drawTitle = function() {
    noStroke();
    fill(SATheme.text);
    chartTextSize(isPhoneChart() ? 13 : 16);
    textStyle(BOLD);
    var y = 18 + drawWrappedText(this.titleText, 24, 18, width - 48) + 6;

    textStyle(NORMAL);
    fill(SATheme.textMuted);
    chartTextSize(12);
    drawWrappedText(SurveyData.chartLabel, 24, y, width - 48);
  };

  this.drawLegend = function() {
    var layout = this.layout;
    var total = this.representedTotal();

    textAlign(LEFT, CENTER);
    chartTextSize(layout.beside ? 12 : 11);
    noStroke();

    for (var i = 0; i < this.categories.length; i++) {
      var category = this.categories[i];
      var count = this.waffle.counts[category] || 0;
      var percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      var itemX = layout.legendX + ((i % layout.columns) * (layout.itemWidth || 0));
      var itemY = layout.legendY + (Math.floor(i / layout.columns) * layout.rowGap);

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
      text(count + ' (' + percent + '%)', itemX + layout.valueOffset, itemY);
    }
  };

  // The denominator the grid itself uses: rows whose pressure is a known category.
  this.representedTotal = function() {
    if (this.waffle && isFinite(this.waffle.representedRows)) {
      return this.waffle.representedRows;
    }
    return this.table ? this.table.getRowCount() : 0;
  };

  this.drawTooltip = function(category) {
    var count = this.waffle.counts[category] || 0;
    var total = this.representedTotal();
    var percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    drawChartTooltip(category, count + ' responses', percent + '% of ' + total);
  };

  this.getExportData = function() {
    return tableToExportData(this.table);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
