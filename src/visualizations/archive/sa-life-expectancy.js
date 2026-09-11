// Based on the template's climate-change.js.
// Template parts are outside the markers below.
/* Start - own code */
// Draws life expectancy over time
function SALifeExpectancy() {

  this.name = 'Life expectancy by sex';
  this.id = 'sa-life-expectancy';

/* End - own code */
  // Template: axis labels and layout object. Changed values are marked.
  this.xAxisLabel = 'year';
  /* Start - own code */
  this.yAxisLabel = 'years';
  /* End - own code */

  var marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    /* Start - own code */
    grid: true,
    numXTickLabels: 9,
    /* End - own code */
    numYTickLabels: 8,
  };
/* Start - own code */

  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading life expectancy data...'
  });

  this.seriesColours = {
    'Female': SATheme.red,
    'Male': SATheme.blue,
    'Total': SATheme.green
  };
  /* End - own code */

  // Based on the template's preload().
  /* Start - own code */
  this.preload = function() {
    var self = this;
    this.loadState.loadTables([{
      path: './data/archive/sa_life_expectancy_1960_2024.csv',
      requiredColumns: ['series'],
      validate: function(table) {
        if (table.columns.length < 2) return false;
        for (var row = 0; row < table.getRowCount(); row++) {
          for (var col = 1; col < table.columns.length; col++) {
            if (!isFinite(Number(table.getString(row, table.columns[col])))) return false;
          }
        }
        return true;
      },
      assign: function(table) { self.data = table; }
    }]);
  };
  /* End - own code */

  // Based on the template's setup().
  /* Start - own code */
  this.setup = function() {
    if (!this.loaded) {
      debugLog('Data not yet loaded');
      return;
    }

    chartTextSize(16);

    this.years = this.data.columns.slice(1).map(Number);
    this.startYear = this.years[0];
    this.endYear = this.years[this.years.length - 1];
    this.series = [];

    var allValues = [];

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var label = row.getString(0);
      var values = sliceRowNumbers(row, 1);

      allValues = allValues.concat(values);
      this.series.push({
        label: label,
        values: values,
        colour: this.seriesColours[label] || SATheme.orange
      });
    }

    var minValue = min(allValues);
    var maxValue = max(allValues);
    var padding = max(1, (maxValue - minValue) * 0.08);

    this.minLife = floor((minValue - padding) * 10) / 10;
    this.maxLife = ceil((maxValue + padding) * 10) / 10;
  };
  /* End - own code */

  /* Start - own code */
  this.draw = function() {
    if (this.loadState.draw()) return;

    if (!this.series) {
      this.setup();
    }

    drawYAxisTickLabels(this.minLife,
                        this.maxLife,
                        this.layout,
                        this.mapValueToHeight.bind(this),
                        1);

    drawAxis(this.layout);

    drawAxisLabels(this.xAxisLabel,
                   this.yAxisLabel,
                   this.layout);

    this.drawYearLabels();
    this.drawSeriesLines();
    this.drawInsight();
  };

  this.drawYearLabels = function() {
    var totalYears = this.endYear - this.startYear;
    var xLabelSkip = ceil(totalYears / this.layout.numXTickLabels);

    for (var year = this.startYear; year < this.endYear; year += xLabelSkip) {
      drawXAxisTickLabel(year, this.layout, this.mapYearToWidth.bind(this));
    }

    drawXAxisTickLabel(this.endYear,
                       this.layout,
                       this.mapYearToWidth.bind(this));
  };

  this.drawSeriesLines = function() {
    chartTextSize(12);

    for (var s = 0; s < this.series.length; s++) {
      var itemSeries = this.series[s];
      itemSeries.colour = itemSeries.label === 'Female'
        ? SATheme.red
        : (itemSeries.label === 'Male' ? SATheme.blue : SATheme.green);

      stroke(itemSeries.colour);
      strokeWeight(2.5);
      noFill();

      for (var yIdx = 1; yIdx < this.years.length; yIdx++) {
        var x1 = this.mapYearToWidth(this.years[yIdx - 1]);
        var y1 = this.mapValueToHeight(itemSeries.values[yIdx - 1]);
        var x2 = this.mapYearToWidth(this.years[yIdx]);
        var y2 = this.mapValueToHeight(itemSeries.values[yIdx]);
        line(x1, y1, x2, y2);
      }

      if (this.years.length > 0) {
        var lastVal = itemSeries.values[this.years.length - 1];
        this.drawSeriesLabel(itemSeries, lastVal);
      }
    }
  };

  this.drawSeriesLabel = function(series, finalValue) {
    var labelX = this.layout.rightMargin - 4;
    var labelY = this.mapValueToHeight(finalValue);
    var labelWidth = textWidth(series.label) + 12;

    noStroke();
    fill(SATheme.bg);
    rect(labelX - labelWidth,
         labelY - 10,
         labelWidth,
         18,
         3);

    fill(series.colour);
    textAlign('right', 'center');
    text(series.label, labelX - 6, labelY);

    fill(series.colour);
    circle(this.mapYearToWidth(this.endYear), labelY, 7);
  };

  this.drawInsight = function() {
    fill(SATheme.textMuted);
    noStroke();
    chartTextSize(12);
    textAlign('left', 'top');
    text('Female life expectancy stays highest across the full period, and all three series recover strongly after the 2000s decline.',
         this.layout.leftMargin,
         this.layout.topMargin + 6);
  };
  /* End - own code */

  // Template: mapYearToWidth().
  this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,
               this.layout.rightMargin);
  };

  /* Start - own code */
  this.mapValueToHeight = function(value) {
    return map(value,
               this.minLife,
               this.maxLife,
               this.layout.bottomMargin,
               this.layout.topMargin);
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}
  /* End - own code */
