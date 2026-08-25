function ZAPovertyContext() {

  this.name = 'Poverty context';
  this.id = 'za-poverty-context';
  this.loaded = false;
  this.series = {};
  this.seriesNames = [
    'Relative poverty below 50 percent of median',
    'Food poverty line headcount',
    'Upper-bound poverty line headcount'
  ];
  this.colours = [SATheme.blue, SATheme.gold, SATheme.red];
  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';

  var marginSize = 42;
  var rightPadding = 70;
  var bottomPadding = 84;

  this.layout = {
    marginSize: marginSize,
    rightPadding: rightPadding,
    bottomPadding: bottomPadding,
    leftMargin: marginSize * 2,
    rightMargin: width - rightPadding,
    topMargin: 154,
    bottomMargin: height - bottomPadding,
    pad: 5,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },
    grid: true,
    numXTickLabels: 5,
    numYTickLabels: 8
  };

  this.preload = function() {
    var self = this;
    this.data = loadTable('data/inequality/za_poverty_indicators.csv', 'csv', 'header', function(table) {
      self.data = table;
      self.loaded = true;
    });
  };

  this.setup = function() {
    if (!this.loaded) {
      return;
    }

    this.startYear = 1993;
    this.endYear = 2023;
    this.minValue = 0;
    this.maxValue = 80;
    this.series = {};

    for (var s = 0; s < this.seriesNames.length; s++) {
      this.series[this.seriesNames[s]] = [];
    }

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var indicator = this.data.getString(i, 'indicator');
      if (this.series[indicator]) {
        this.series[indicator].push({
          year: this.data.getNum(i, 'year'),
          value: this.data.getNum(i, 'value_percent')
        });
      }
    }
  };

  this.draw = function() {
    if (!this.loaded) {
      this.drawLoading();
      return;
    }

    if (Object.keys(this.series).length == 0) {
      this.setup();
    }

    // On phones, reserve a narrow strip below the stacked legend so the
    // single summary badge never covers a data point or reference line.
    this.layout.topMargin = width < 520 ? 180 : 154;

    background(255);
    this.drawTitle();
    drawYAxisTickLabels(this.minValue,
                        this.maxValue,
                        this.layout,
                        this.mapValueToHeight.bind(this),
                        0);
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
    this.drawYearLabels();
    this.drawAnnotations();
    this.drawSeries();
    this.drawLegend();
  };

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading poverty context...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textStyle(BOLD);
    textSize(17);
    textAlign(LEFT, TOP);
    text('Poverty context', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(80);
    text('Different poverty measures are shown separately because each source uses a different definition.',
         24,
         44,
         width - 48,
         36);
  };

  this.drawAnnotations = function() {
    var referenceY = this.mapValueToHeight(50);
    var upper = this.series['Upper-bound poverty line headcount'];
    var food = this.series['Food poverty line headcount'];

    if (width < 520) {
      drawHorizontalReferenceLine(
        referenceY,
        this.layout.leftMargin,
        this.layout.rightMargin,
        SATheme.gold
      );

      if (upper && upper.length && food && food.length) {
        var compactUpper = upper[upper.length - 1];
        var compactFood = food[food.length - 1];
        drawAnnotationBadge(
          '2023 poverty levels',
          'Upper 66.7% | Food 17.6%',
          width - 190,
          this.layout.topMargin - 38,
          SATheme.red
        );
        this.drawEndpointLabel(compactUpper, -49, -13);
        this.drawEndpointLabel(compactFood, -49, 14);
      }
      return;
    }

    drawHorizontalAnnotation(
      referenceY,
      '50% reference',
      'Definitions remain separate',
      this.layout.leftMargin,
      this.layout.rightMargin,
      SATheme.gold
    );

    if (upper && upper.length) {
      var upperPoint = upper[upper.length - 1];
      drawAnnotationBadge(
        '2023 upper-bound line',
        upperPoint.value.toFixed(1) + '%',
        this.mapYearToWidth(upperPoint.year) - 132,
        this.mapValueToHeight(upperPoint.value) - 42,
        SATheme.red
      );
    }
    if (food && food.length) {
      var foodPoint = food[food.length - 1];
      drawAnnotationBadge(
        '2023 food line',
        foodPoint.value.toFixed(1) + '%',
        this.mapYearToWidth(foodPoint.year) - 112,
        this.mapValueToHeight(foodPoint.value) + 8,
        SATheme.blue
      );
    }
  };

  this.drawEndpointLabel = function(point, xOffset, yOffset) {
    noStroke();
    fill(30);
    textStyle(BOLD);
    textSize(10);
    textAlign(LEFT, CENTER);
    text(
      point.value.toFixed(1) + '%',
      this.mapYearToWidth(point.year) + xOffset,
      this.mapValueToHeight(point.value) + yOffset
    );
  };

  this.drawYearLabels = function() {
    var labelYears = [1993, 2000, 2006, 2014, 2023];
    for (var i = 0; i < labelYears.length; i++) {
      drawXAxisTickLabel(labelYears[i], this.layout, this.mapYearToWidth.bind(this));
    }
  };

  this.drawSeries = function() {
    for (var s = 0; s < this.seriesNames.length; s++) {
      var name = this.seriesNames[s];
      var rows = this.series[name];

      stroke(this.colours[s]);
      strokeWeight(3);
      noFill();

      for (var i = 1; i < rows.length; i++) {
        line(this.mapYearToWidth(rows[i - 1].year),
             this.mapValueToHeight(rows[i - 1].value),
             this.mapYearToWidth(rows[i].year),
             this.mapValueToHeight(rows[i].value));
      }

      for (var j = 0; j < rows.length; j++) {
        fill(255);
        stroke(this.colours[s]);
        strokeWeight(2);
        var pointX = this.mapYearToWidth(rows[j].year);
        var pointY = this.mapValueToHeight(rows[j].value);
        circle(pointX, pointY, 7);
        if (dist(mouseX, mouseY, pointX, pointY) < 12) {
          drawChartCrosshair(pointX, pointY);
          drawChartTooltip(String(rows[j].year), rows[j].value.toFixed(1) + '%', name);
        }
      }
    }
  };

  this.drawLegend = function() {
    var x = this.layout.leftMargin + 10;
    var y = 92;
    var compact = width < 760;

    textStyle(NORMAL);
    textSize(compact ? 10 : 11);
    textAlign(LEFT, CENTER);

    for (var i = 0; i < this.seriesNames.length; i++) {
      var rowY = y + (i * (compact ? 20 : 22));
      stroke(this.colours[i]);
      strokeWeight(3);
      line(x, rowY, x + 28, rowY);
      noStroke();
      fill(0);
      text(this.seriesNames[i], x + 36, rowY);
    }
  };

  this.mapYearToWidth = function(value) {
    return map(value, this.startYear, this.endYear, this.layout.leftMargin, this.layout.rightMargin);
  };

  this.mapValueToHeight = function(value) {
    return map(value, this.minValue, this.maxValue, this.layout.bottomMargin, this.layout.topMargin);
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };
}
