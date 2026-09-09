// Based on the template's pay-gap-1997-2017.js.
// Template parts are outside the markers below.
/* Start - own code */
// Draws the Gini trend chart
function ZAGiniTrend() {

  this.name = 'Gini trend';
  this.id = 'za-gini-trend';
  this.xAxisLabel = 'year';
  this.yAxisLabel = 'Gini';


  this.dataPath = 'data/inequality/za_gini_trend.csv';
  this.data = null;
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading inequality data...'
  });

  var marginSize = 42;
  var rightPadding = 78;
  var bottomPadding = 84;

/* End - own code */
  // Template: layout object.
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
/* Start - own code */


  this.preload = function() {
    var self = this;

    this.data = null;
    this.startYear = undefined;
    this.endYear = undefined;

    this.loadState.loadTables([{
      path: this.dataPath,
      requiredColumns: ['year', 'gini_coefficient'],
      numericColumns: ['year', 'gini_coefficient'],
      assign: function(table) {
        self.data = table;
      }
    }], function() {
      self.deriveScales();
    });
  };

  this.handleDataLoaded = function(table) {
    this.loadState.start(1);
    try {
      this.loadState.validateTable(table, {
        requiredColumns: ['year', 'gini_coefficient'],
        numericColumns: ['year', 'gini_coefficient']
      });
      this.data = table;
      this.deriveScales();
      this.loadState.completeResource();
    } catch (error) {
      this.loadState.fail(error, this.dataPath);
    }
  };

  this.handleDataError = function(error) {
    this.data = null;
    if (this.loadState.status !== 'loading') this.loadState.start(1);
    this.loadState.fail(error, this.dataPath);
  };

  this.retryLoad = function() {
    this.preload();
  };


  // Sets chart scales from loaded data
  this.deriveScales = function() {
    if (!this.data || this.data.getRowCount() === 0) {
      return;
    }

/* End - own code */
    // Template: the startYear/endYear lines.
    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
    /* Start - own code */
    this.minValue = 0.5;
    this.maxValue = 0.7;
  };

  this.setup = function() {
    this.deriveScales();
  };

  this.draw = function() {
    if (this.loadState.draw()) return;

    if (this.startYear == null) {
      this.deriveScales();
    }

    background(SATheme.bg);
    this.drawTitle();
    drawYAxisTickLabels(this.minValue,
                        this.maxValue,
                        this.layout,
                        this.mapValueToHeight.bind(this),
                        2);
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
    this.drawYearLabels();
    this.drawAnnotations();
    this.drawLine();
  };

  this.drawTitle = function() {
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    textAlign(LEFT, TOP);
    text('National inequality context', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text('Available World Bank/PIP Gini estimates for South Africa. Higher values mean higher inequality.',
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 50 : 36);
  };

  this.drawYearLabels = function() {
    var labelYears = isPhoneChart()
      ? [1993, 2005, 2014, 2022]
      : [1993, 2000, 2005, 2010, 2014, 2022];

    for (var i = 0; i < labelYears.length; i++) {
      drawXAxisTickLabel(labelYears[i], this.layout, this.mapYearToWidth.bind(this));
    }
  };

  this.drawAnnotations = function() {
    var contextX = this.mapYearToWidth(1994);
    var peakX = this.mapYearToWidth(2005);

    if (isPhoneChart()) {
      drawVerticalReferenceLine(
        contextX,
        this.layout.topMargin,
        this.layout.bottomMargin,
        SATheme.gold
      );
      drawVerticalReferenceLine(
        peakX,
        this.layout.topMargin,
        this.layout.bottomMargin,
        SATheme.red
      );
      drawAnnotationBadge('Peak: 0.65', '', peakX + 7, this.layout.topMargin + 4, SATheme.red);
      return;
    }

    drawVerticalAnnotation(
      contextX,
      '1994 context marker',
      'Reference point, not a causal claim',
      this.layout.topMargin,
      this.layout.bottomMargin,
      SATheme.gold
    );
    drawVerticalAnnotation(
      peakX,
      'Peak in this series',
      'Gini 0.65',
      this.layout.topMargin,
      this.layout.bottomMargin,
      SATheme.red
    );
  };

  this.drawLine = function() {
    stroke(SATheme.blue);
    strokeWeight(3);
    noFill();

    var previous = null;
    var hovered = null;
    var pointer = getChartPointer();

/* End - own code */
    // Based on the template's draw loop.
    /* Start - own code */
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

      fill(SATheme.bg);
      stroke(SATheme.blue);
      strokeWeight(2);
      circle(this.mapYearToWidth(current.year), this.mapValueToHeight(current.value), 7);
      if (dist(pointer.x, pointer.y,
               this.mapYearToWidth(current.year),
               this.mapValueToHeight(current.value)) < 12) {
        hovered = current;
      }
      previous = current;
      /* End - own code */
    /* Start - own code */
    }

    if (hovered) {
      var hoverX = this.mapYearToWidth(hovered.year);
      var hoverY = this.mapValueToHeight(hovered.value);
      drawChartCrosshair(hoverX, hoverY);
      drawChartTooltip(String(hovered.year), hovered.value.toFixed(2), 'Gini coefficient');
    }

    var last = previous;
    if (last) {
      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(12);
      textAlign(RIGHT, CENTER);
      text(last.year + ': ' + last.value.toFixed(2),
           this.layout.rightMargin - 8,
           this.mapValueToHeight(last.value));
    }
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
