function SALifeExpectancy() {

  // ---- State ----

  this.name = 'Life expectancy by sex';
  this.id = 'sa-life-expectancy';

  this.xAxisLabel = 'year';
  this.yAxisLabel = 'years';

  var marginSize = 35;   // base spacing used to derive the plot margins below

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

    grid: true,
    numXTickLabels: 9,
    numYTickLabels: 8,
  };

  this.loaded = false;

  // One line colour per data series.
  this.seriesColours = {
    'Female': SATheme.red,
    'Male': SATheme.blue,
    'Total': SATheme.green
  };

  // ---- Lifecycle ----

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/health/sa_life_expectancy_1960_2024.csv',
      'csv',
      'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    textSize(16);

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
        colour: this.seriesColours[label] || SATheme.black
      });
    }

    // Add ~8% headroom above and below the data so the lines don't touch the
    // axes, then round the y-axis bounds to one decimal place.
    var minValue = min(allValues);
    var maxValue = max(allValues);
    var padding = max(1, (maxValue - minValue) * 0.08);

    this.minLife = floor((minValue - padding) * 10) / 10;
    this.maxLife = ceil((maxValue + padding) * 10) / 10;
  };

  this.destroy = function() {
  };

  // ---- Drawing ----

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    if (!this.series) {
      this.setup();
    }

    drawYAxisTickLabels(this.minLife,
                        this.maxLife,
                        this.layout,
                        this.mapLifeToHeight.bind(this),
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
    textSize(12);

    for (var i = 0; i < this.series.length; i++) {
      var series = this.series[i];
      var previous = null;

      stroke(series.colour);
      strokeWeight(2.5);
      noFill();

      for (var j = 0; j < this.years.length; j++) {
        var current = {
          year: this.years[j],
          value: series.values[j]
        };

        if (previous != null) {
          line(this.mapYearToWidth(previous.year),
               this.mapLifeToHeight(previous.value),
               this.mapYearToWidth(current.year),
               this.mapLifeToHeight(current.value));
        }

        previous = current;
      }

      this.drawSeriesLabel(series, previous.value);
    }
  };

  // Draw an end-of-line label (series name + dot) at the series' final value.
  this.drawSeriesLabel = function(series, finalValue) {
    var labelX = this.layout.rightMargin - 4;
    var labelY = this.mapLifeToHeight(finalValue);
    var labelWidth = textWidth(series.label) + 12;

    noStroke();
    fill(255, 245);
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
    fill(60);
    noStroke();
    textSize(12);
    textAlign('left', 'top');
    text('Female life expectancy stays highest across the full period, and all three series recover strongly after the 2000s decline.',
         this.layout.leftMargin,
         this.layout.topMargin + 6);
  };

  // ---- Mapping helpers ----

  this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,
               this.layout.rightMargin);
  };

  this.mapLifeToHeight = function(value) {
    return map(value,
               this.minLife,
               this.maxLife,
               this.layout.bottomMargin,
               this.layout.topMargin);
  };
}
