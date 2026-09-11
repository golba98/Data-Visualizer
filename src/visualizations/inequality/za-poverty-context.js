// Based on the template's pay-gap-1997-2017.js.
// Template parts are outside the markers below.
/* Start - own code */
// Draws poverty measures over time
function ZAPovertyContext() {

  this.name = 'Poverty context';
  this.id = 'za-poverty-context';
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading poverty context...'
  });
  this.series = {};
  this.seriesNames = [
    'Relative poverty below 50 percent of median',
    'Food poverty line headcount',
    'Upper-bound poverty line headcount'
  ];
  this.colours = [SATheme.blue, SATheme.gold, SATheme.red];
  /* End - own code */
  // Template: axis labels and layout object. Changed values are marked.
  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';

  /* Start - own code */
  var marginSize = 42;
  var rightPadding = 70;
  var bottomPadding = 84;
  /* End - own code */

  this.layout = {
    marginSize: marginSize,
    /* Start - own code */
    rightPadding: rightPadding,
    bottomPadding: bottomPadding,
    /* End - own code */
    leftMargin: marginSize * 2,
    /* Start - own code */
    rightMargin: width - rightPadding,
    topMargin: 154,
    bottomMargin: height - bottomPadding,
    /* End - own code */
    pad: 5,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },
    grid: true,
    /* Start - own code */
    numXTickLabels: 5,
    numYTickLabels: 8
    /* End - own code */
  };

  // Based on the template's preload().
  /* Start - own code */
  this.preload = function() {
    var self = this;
    this.loadState.loadTables([{
      path: 'data/inequality/za_poverty_indicators.csv',
      requiredColumns: ['year', 'indicator', 'value_percent'],
      numericColumns: ['year', 'value_percent'],
      assign: function(table) { self.data = table; }
    }]);
  };
  /* End - own code */

  // Based on the template's setup().
  /* Start - own code */
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
  /* End - own code */

  /* Start - own code */
  this.draw = function() {
    if (this.loadState.draw()) return;

    if (Object.keys(this.series).length == 0) {
      this.setup();
    }

    // The plot starts below the measured title and legend, so wrapped text on
    // a narrow canvas pushes the plot down instead of running into it.
    this.colours = [SATheme.blue, SATheme.gold, SATheme.red];
    background(SATheme.bg);
    var legendTop = this.drawTitle() + 10;
    this.layout.topMargin = this.drawLegend(legendTop) + (isPhoneChart() ? 20 : 26);
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
  };

  // Returns the y below the title block.
  this.drawTitle = function() {
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    var y = 18 + drawWrappedText('Poverty context', 24, 18, width - 48);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    y += 6;
    return y + drawWrappedText('Different poverty measures are shown separately because each source uses a different definition.',
                               24, y, width - 48);
  };

  this.drawAnnotations = function() {
    var referenceY = this.mapValueToHeight(50);
    var upper = this.series['Upper-bound poverty line headcount'];
    var food = this.series['Food poverty line headcount'];

    if (isPhoneChart()) {
      drawHorizontalReferenceLine(
        referenceY,
        this.layout.leftMargin,
        this.layout.rightMargin,
        SATheme.gold
      );

      // The 2023 values are labelled at the line ends rather than repeated
      // in a badge, which a phone has no height to spare for.
      if (upper && upper.length && food && food.length) {
        this.drawEndpointLabel(upper[upper.length - 1], -49, -13, SATheme.red);
        this.drawEndpointLabel(food[food.length - 1], -49, 14, SATheme.gold);
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

  this.drawEndpointLabel = function(point, xOffset, yOffset, colour) {
    noStroke();
    fill(colour);
    textStyle(BOLD);
    chartTextSize(10);
    textAlign(LEFT, CENTER);
    text(
      point.value.toFixed(1) + '%',
      this.mapYearToWidth(point.year) + xOffset,
      this.mapValueToHeight(point.value) + yOffset
    );
  };

  this.drawYearLabels = function() {
    var labelYears = isPhoneChart()
      ? [1993, 2006, 2014, 2023]
      : [1993, 2000, 2006, 2014, 2023];
    for (var i = 0; i < labelYears.length; i++) {
      drawXAxisTickLabel(labelYears[i], this.layout, this.mapYearToWidth.bind(this));
    }
  };

  this.drawSeries = function() {
    var cursor = getChartPointer();
    var nearest = null;
    var nearestDistance = chartHitRadius(12);
    for (var sIdx = 0; sIdx < this.seriesNames.length; sIdx++) {
      var seriesLabel = this.seriesNames[sIdx];
      var seriesPoints = this.series[seriesLabel];
      var lineColour = this.colours[sIdx];

      stroke(lineColour);
      strokeWeight(3);
      noFill();

      for (var p = 1; p < seriesPoints.length; p++) {
        var prevX = this.mapYearToWidth(seriesPoints[p - 1].year);
        var prevY = this.mapValueToHeight(seriesPoints[p - 1].value);
        var curX = this.mapYearToWidth(seriesPoints[p].year);
        var curY = this.mapValueToHeight(seriesPoints[p].value);
        line(prevX, prevY, curX, curY);
      }

      for (var pt = 0; pt < seriesPoints.length; pt++) {
        var node = seriesPoints[pt];
        var circleX = this.mapYearToWidth(node.year);
        var circleY = this.mapValueToHeight(node.value);

        fill(SATheme.bg);
        stroke(lineColour);
        strokeWeight(2);
        circle(circleX, circleY, 7);

        var pointDistance = dist(cursor.x, cursor.y, circleX, circleY);
        if (pointDistance < nearestDistance) {
          nearest = { x: circleX, y: circleY, node: node, series: seriesLabel };
          nearestDistance = pointDistance;
        }
      }
    }

    // One tooltip, for the nearest point within reach across all series.
    if (nearest) {
      drawChartCrosshair(nearest.x, nearest.y);
      drawChartTooltip(String(nearest.node.year), nearest.node.value.toFixed(1) + '%', nearest.series);
    }
  };

  // Draws the series key from top, wrapping long names, and returns the y
  // below it.
  this.drawLegend = function(top) {
    var x = isPhoneChart() ? 24 : this.layout.leftMargin + 10;
    var labelWidth = width - x - 36 - 24;
    var y = top;

    textStyle(NORMAL);
    chartTextSize(isCompactChart() ? 10 : 11);

    for (var i = 0; i < this.seriesNames.length; i++) {
      var lineY = y + (textLeading() / 2);
      stroke(this.colours[i]);
      strokeWeight(3);
      line(x, lineY, x + 28, lineY);
      noStroke();
      fill(SATheme.text);
      y += drawWrappedText(this.seriesNames[i], x + 36, y, labelWidth) + (isCompactChart() ? 4 : 7);
    }
    return y;
  };
  /* End - own code */

  // Template: mapYearToWidth().
  this.mapYearToWidth = function(value) {
    return map(value, this.startYear, this.endYear, this.layout.leftMargin, this.layout.rightMargin);
  };

  /* Start - own code */
  this.mapValueToHeight = function(value) {
    return map(value, this.minValue, this.maxValue, this.layout.bottomMargin, this.layout.topMargin);
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}
  /* End - own code */
