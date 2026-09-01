// Youth unemployment rate, 1991-2025.
// Source: World Bank / Statistics South Africa.
function SAYouthUnemployment() {

  this.name = 'Youth unemployment trend';
  this.id = 'sa-youth-unemployment';

  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';

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
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  this.loaded = false;

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/archive/sa_youth_unemployment_1991_2025.csv',
      'csv',
      'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    if (!this.loaded) {
      debugLog('Data not yet loaded');
      return;
    }

    chartTextSize(16);

    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');

    var youthRates = stringsToNumbers(
      this.data.getColumn('youth_unemployment_rate'));
    this.minRate = 0;
    this.maxRate = ceil(max(youthRates));
  };

  this.draw = function() {
    if (!this.loaded) {
      debugLog('Data not yet loaded');
      return;
    }

    if (this.startYear == null) {
      this.setup();
    }

    drawYAxisTickLabels(this.minRate,
                        this.maxRate,
                        this.layout,
                        this.mapValueToHeight.bind(this),
                        0);

    drawAxis(this.layout);

    drawAxisLabels(this.xAxisLabel,
                   this.yAxisLabel,
                   this.layout);

    var numYears = this.endYear - this.startYear;
    var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

    for (var year = this.startYear; year < this.endYear; year += xLabelSkip) {
      drawXAxisTickLabel(year, this.layout, this.mapYearToWidth.bind(this));
    }
    drawXAxisTickLabel(this.endYear, this.layout,
                       this.mapYearToWidth.bind(this));

    this.drawLegend();

    // Trend line in SA flag blue.
    stroke(SATheme.blue);
    strokeWeight(3);
    noFill();

    var previous;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var current = {
        year: this.data.getNum(i, 'year'),
        rate: this.data.getNum(i, 'youth_unemployment_rate')
      };

      if (previous != null) {
        line(this.mapYearToWidth(previous.year),
             this.mapValueToHeight(previous.rate),
             this.mapYearToWidth(current.year),
             this.mapValueToHeight(current.rate));
      }

      previous = current;
    }
  };

  this.drawLegend = function() {
    var x = this.layout.leftMargin + 12;
    var y = this.layout.topMargin + 14;

    stroke(SATheme.blue);
    strokeWeight(3);
    line(x, y, x + 35, y);

    fill(SATheme.text);
    noStroke();
    chartTextSize(13);
    textAlign('left', 'center');
    text('Youth unemployment (%)', x + 43, y);
  };

  this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,
               this.layout.rightMargin);
  };

  this.mapValueToHeight = function(value) {
    return map(value,
               this.minRate,
               this.maxRate,
               this.layout.bottomMargin,
               this.layout.topMargin);
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };
}
