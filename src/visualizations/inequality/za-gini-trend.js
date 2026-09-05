// Draws the Gini trend chart
function ZAGiniTrend() {

  this.name = 'Gini trend';
  this.id = 'za-gini-trend';
  this.xAxisLabel = 'year';
  this.yAxisLabel = 'Gini';


  this.dataPath = 'data/inequality/za_gini_trend.csv';
  this.data = null;
  this.isLoading = false;
  this.isReady = false;
  this.loadError = null;
  this.loadProgress = 0;
  this.loaded = false;

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

    this.data = null;
    this.startYear = undefined;
    this.endYear = undefined;

    this.isLoading = true;
    this.isReady = false;
    this.loaded = false;
    this.loadError = null;
    this.loadProgress = 0;

    loadTable(
      resolveDataPath(this.dataPath),
      'csv',
      'header',
      function(table) {
        self.handleDataLoaded(table);
      },
      function(error) {
        self.handleDataError(error);
      });
  };

  this.handleDataLoaded = function(table) {
    this.data = table;
    this.isLoading = false;
    this.isReady = true;
    this.loaded = true;
    this.loadProgress = 1;
    this.loadError = null;

    this.deriveScales();
  };

  this.handleDataError = function(error) {
    this.data = null;
    this.isLoading = false;
    this.isReady = false;
    this.loaded = false;
    this.loadProgress = 0;
    this.loadError = 'This chart could not load its data. '
        + 'Check your connection and refresh the page.';

    debugLog('ZAGiniTrend: loadTable failed for', this.dataPath, error);
  };

  this.retryLoad = function() {
    this.preload();
  };


  // Sets chart scales from loaded data
  this.deriveScales = function() {
    if (!this.isReady) {
      return;
    }

    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
    this.minValue = 0.5;
    this.maxValue = 0.7;
  };

  this.setup = function() {
    this.deriveScales();
  };

  this.draw = function() {
    if (this.loadError != null) {
      this.drawLoadError();
      return;
    }

    if (!this.isReady) {
      this.drawLoading();
      return;
    }

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

  this.drawLoading = function() {
    background(SATheme.bg);
    noStroke();
    fill(SATheme.text);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    chartTextSize(14);
    text('Loading inequality data...', width / 2, (height / 2) - 16);

    var barWidth = Math.min(220, width * 0.4);
    var barX = (width - barWidth) / 2;
    var barY = (height / 2) + 8;

    noFill();
    stroke(170);
    strokeWeight(1);
    rect(barX, barY, barWidth, 8);

    noStroke();
    fill(SATheme.blue);
    rect(barX, barY, barWidth * Math.max(0.08, this.loadProgress), 8);
  };

  this.drawLoadError = function() {
    background(SATheme.bg);
    noStroke();
    textAlign(CENTER, CENTER);

    fill(SATheme.red);
    textStyle(BOLD);
    chartTextSize(16);
    text('This chart is unavailable', width / 2, (height / 2) - 22);

    fill(SATheme.textMuted);
    textStyle(NORMAL);
    chartTextSize(13);
    text(this.loadError, width * 0.1, (height / 2) + 4, width * 0.8, 60);
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
