// Uses the template's visualisation interface: name, id, preload, setup, draw, destroy.
// Everything below is own.
/* Start - own code */

// Shows farm and land ownership by group
function ZALandOwnershipByGroup() {

  this.name = 'Land ownership';
  this.id = 'za-land-ownership-by-group';
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading land ownership data...'
  });
  this.rows = [];

  this.preload = function() {
    var self = this;
    this.loadState.loadTables([{
      path: 'data/inequality/za_land_ownership_by_group.csv',
      requiredColumns: ['population_group', 'share_percent', 'hectares'],
      numericColumns: ['share_percent', 'hectares'],
      assign: function(table) { self.data = table; }
    }]);
  };

  this.setup = function() {
    if (!this.loaded) {
      return;
    }

    this.rows = [];
    for (var i = 0; i < this.data.getRowCount(); i++) {
      this.rows.push({
        group: this.data.getString(i, 'population_group'),
        share: this.data.getNum(i, 'share_percent'),
        hectares: this.data.getNum(i, 'hectares')
      });
    }
  };

  this.draw = function() {
    if (this.loadState.draw()) return;

    if (this.rows.length == 0) {
      this.setup();
    }

    background(SATheme.bg);
    this.drawTitle();
    this.drawAnnotations();
    this.drawBars();
  };

  this.drawTitle = function() {
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    textAlign(LEFT, TOP);
    text('Agricultural land ownership by population group', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text('2017 Land Audit shares for farms and agricultural holdings owned by individual landowners.',
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 52 : 38);
  };

  this.limitation = 'Limitation: this is a land-audit measure for individually owned farms/agricultural holdings, not all homes or all wealth. Colour only highlights the largest holder; it does not encode a second value.';

  this.drawAnnotations = function() {
    var left = isCompactChart() ? 98 : 142;
    var right = width - 54;
    var referenceX = map(50, 0, 80, left, right);
    var bottom = this.getRowLayout().gridBottom;

    if (isPhoneChart()) {
      drawVerticalReferenceLine(referenceX, 126, bottom, SATheme.red);
      drawAnnotationBadge('50% reference', '', width - 150, 94, SATheme.red);
      return;
    }

    drawVerticalAnnotation(
      referenceX,
      '50% reference',
      'Displayed ownership share',
      106,
      bottom,
      SATheme.red
    );
  };

  // Spreads the rows between the heading and the footnote. When space is
  // tight the bars get thinner, then the hectare labels move to the tooltip.
  this.getRowLayout = function() {
    var isCompact = isCompactChart();
    var top = isPhoneChart() ? 134 : 118;
    var tickSpace = isPhoneChart() ? 8 : 28;
    var footnoteTop = chartFootnoteTop(this.limitation, 11);
    var rowsBottom = footnoteTop - tickSpace;
    var step = fitRowStep(top, rowsBottom, this.rows.length, 52);
    var bar = isCompact ? 24 : 30;
    var detail = isCompact ? 14 : 18;
    var showDetail = step >= bar + detail;

    if (!showDetail && step - detail >= 14) {
      bar = step - detail;
      showDetail = true;
    } else if (!showDetail) {
      bar = Math.min(bar, step * 0.75);
    }

    var rowHeight = bar + (showDetail ? detail : 0);

    return {
      top: top,
      step: step,
      bar: bar,
      detail: detail,
      showDetail: showDetail,
      rowHeight: rowHeight,
      rowCount: this.rows.length,
      rowsBottom: rowsBottom,
      gridBottom: top + (step * (this.rows.length - 1)) + rowHeight + 4,
      footnoteTop: footnoteTop
    };
  };

  this.drawBars = function() {
    var isCompact = isCompactChart();
    var rowLayout = this.getRowLayout();
    var xStart = isCompact ? 98 : 142;
    var xEnd = width - 54;
    var yStart = rowLayout.top;
    var barThick = rowLayout.bar;
    var stepGap = rowLayout.step;
    var maxSpan = xEnd - xStart;

    stroke(SATheme.grid);
    strokeWeight(1);
    for (var tickVal = 0; tickVal <= 80; tickVal += 20) {
      var tickX = map(tickVal, 0, 80, xStart, xEnd);
      line(tickX, yStart - 12, tickX, rowLayout.gridBottom);
      if (!isPhoneChart()) {
        noStroke();
        fill(SATheme.textMuted);
        textStyle(NORMAL);
        chartTextSize(11);
        textAlign(CENTER, TOP);
        text(tickVal + '%', tickX, rowLayout.gridBottom + 6);
      }
      stroke(SATheme.grid);
    }

    for (var idx = 0; idx < this.rows.length; idx++) {
      var rowItem = this.rows[idx];
      var rowY = yStart + (idx * stepGap);
      var rowBarWidth = map(rowItem.share, 0, 80, 0, maxSpan);
      var barCol = rowItem.group === 'White' ? SATheme.red : SATheme.green;

      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(isCompact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(rowItem.group, xStart - 12, rowY + (barThick / 2));

      drawBar(xStart, rowY, rowBarWidth, barThick, barCol);

      if (mouseIsOverRect(xStart, rowY, rowBarWidth, barThick)) {
        drawChartTooltip(rowItem.group, rowItem.share.toFixed(1) + '%', formatThousands(rowItem.hectares) + ' ha');
      }

      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(12);
      textAlign(LEFT, CENTER);
      text(rowItem.share.toFixed(0) + '%', xStart + rowBarWidth + 8, rowY + (barThick / 2));

      if (rowLayout.showDetail) {
        textStyle(NORMAL);
        chartTextSize(isCompact ? 9 : 10);
        fill(SATheme.textMuted);
        text(formatThousands(rowItem.hectares) + ' ha', xStart, rowY + barThick + (rowLayout.detail / 2));
      }
    }

    drawChartFootnote(this.limitation, 11);
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
