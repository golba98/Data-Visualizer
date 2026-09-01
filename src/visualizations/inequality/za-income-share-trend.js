// Share of national income taken by the top 10 percent, over time.
// Source: WID.world via Our World in Data, 1993-2014.
function ZAIncomeShareTrend() {

  this.name = 'Top income share';
  this.id = 'za-income-share-trend';
  this.loaded = false;
  this.xAxisLabel = 'year';
  this.yAxisLabel = '% of income';

  var marginSize = 42;
  var rightPadding = 82;
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
    numYTickLabels: 7
  };

  this.preload = function() {
    var self = this;
    this.data = loadTable('data/inequality/za_income_distribution.csv', 'csv', 'header', function(table) {
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
    this.minValue = 0;
    this.maxValue = 70;
  };

  this.draw = function() {
    if (!this.loaded) {
      this.drawLoading();
      return;
    }

    if (this.startYear == null) {
      this.setup();
    }

    background(SATheme.bg);
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
    this.drawLine();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading income-share data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    textAlign(LEFT, TOP);
    text('Top 10 percent income share', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text('Before-tax income share received by the richest 10 percent in WID estimates.',
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 50 : 36);
  };

  this.drawYearLabels = function() {
    var labelYears = isPhoneChart()
      ? [1993, 2000, 2007, 2014]
      : [1993, 2000, 2005, 2010, 2014];

    for (var i = 0; i < labelYears.length; i++) {
      drawXAxisTickLabel(labelYears[i], this.layout, this.mapYearToWidth.bind(this));
    }
  };

  this.drawAnnotations = function() {
    var contextX = this.mapYearToWidth(1994);
    var referenceY = this.mapValueToHeight(50);

    if (isPhoneChart()) {
      drawVerticalReferenceLine(
        contextX,
        this.layout.topMargin,
        this.layout.bottomMargin,
        SATheme.gold
      );
      drawHorizontalReferenceLine(
        referenceY,
        this.layout.leftMargin,
        this.layout.rightMargin,
        SATheme.red
      );
      drawAnnotationBadge(
        '50% reference',
        '',
        this.layout.leftMargin + 8,
        referenceY - 26,
        SATheme.red
      );
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
    drawHorizontalAnnotation(
      referenceY,
      '50% reference',
      'Before-tax income share',
      this.layout.leftMargin,
      this.layout.rightMargin,
      SATheme.red
    );
  };

  this.drawLine = function() {
    stroke(SATheme.green);
    strokeWeight(3);
    noFill();

    var previous = null;
    var hovered = null;
    var pointer = getChartPointer();

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var current = {
        year: this.data.getNum(i, 'year'),
        value: this.data.getNum(i, 'top_10_income_share_percent')
      };

      if (previous != null) {
        line(this.mapYearToWidth(previous.year),
             this.mapValueToHeight(previous.value),
             this.mapYearToWidth(current.year),
             this.mapValueToHeight(current.value));
      }

      fill(SATheme.bg);
      stroke(SATheme.green);
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
      drawChartTooltip(String(hovered.year), hovered.value.toFixed(1) + '%', 'Top 10 income share');
    }

    var last = previous;
    if (last) {
      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(12);
      textAlign(RIGHT, CENTER);
      text(last.year + ': ' + last.value.toFixed(1) + '%',
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
