function ZAGiniTrend() {

  this.name = 'Gini trend';
  this.id = 'za-gini-trend';
  this.loaded = false;
  this.xAxisLabel = 'year';
  this.yAxisLabel = 'Gini';

  var marginSize = 42;
  var rightPadding = 78;
  var bottomPadding = 84;

  this.layout = {
    marginSize: marginSize,
    rightPadding: rightPadding,
    bottomPadding: bottomPadding,
    leftMargin: marginSize * 2,
    rightMargin: width - rightPadding,
    topMargin: 118,
    bottomMargin: height - bottomPadding,
    pad: 5,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },
    grid: true,
    numXTickLabels: 6,
    numYTickLabels: 5
  };

  this.preload = function() {
    var self = this;
    this.data = loadTable('data/inequality/za_gini_trend.csv', 'csv', 'header', function(table) {
      self.data = table;
      self.loaded = true;
    });
  };

  this.setup = function() {
    if (!this.loaded) {
      return;
    }

    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
    this.minValue = 0.5;
    this.maxValue = 0.7;
  };

  this.draw = function() {
    if (!this.loaded) {
      this.drawLoading();
      return;
    }

    if (this.startYear == null) {
      this.setup();
    }

    background(255);
    this.drawTitle();
    drawYAxisTickLabels(this.minValue,
                        this.maxValue,
                        this.layout,
                        this.mapValueToHeight.bind(this),
                        2);
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
    this.drawYearLabels();
    this.drawLine();
  };

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading Gini data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textStyle(BOLD);
    textSize(17);
    textAlign(LEFT, TOP);
    text('National inequality context', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(80);
    text('Available World Bank/PIP Gini estimates for South Africa. Higher values mean higher inequality.',
         24,
         44,
         width - 48,
         36);
  };

  this.drawYearLabels = function() {
    var labelYears = [1993, 2000, 2005, 2010, 2014, 2022];

    for (var i = 0; i < labelYears.length; i++) {
      drawXAxisTickLabel(labelYears[i], this.layout, this.mapYearToWidth.bind(this));
    }
  };

  this.drawLine = function() {
    stroke(SATheme.blue);
    strokeWeight(3);
    noFill();

    var previous = null;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var current = {
        year: this.data.getNum(i, 'year'),
        value: this.data.getNum(i, 'gini_coefficient')
      };

      if (previous != null) {
        line(this.mapYearToWidth(previous.year),
             this.mapValueToHeight(previous.value),
             this.mapYearToWidth(current.year),
             this.mapValueToHeight(current.value));
      }

      fill(255);
      stroke(SATheme.blue);
      strokeWeight(2);
      circle(this.mapYearToWidth(current.year), this.mapValueToHeight(current.value), 7);
      previous = current;
    }

    var last = previous;
    if (last) {
      noStroke();
      fill(0);
      textStyle(BOLD);
      textSize(12);
      textAlign(RIGHT, CENTER);
      text(last.year + ': ' + last.value.toFixed(2),
           this.layout.rightMargin - 8,
           this.mapValueToHeight(last.value));
    }
  };

  this.mapYearToWidth = function(value) {
    return map(value, this.startYear, this.endYear, this.layout.leftMargin, this.layout.rightMargin);
  };

  this.mapValueToHeight = function(value) {
    return map(value, this.minValue, this.maxValue, this.layout.bottomMargin, this.layout.topMargin);
  };
}
