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

    // Stacked from measured text: the bars take the space between the title
    // block (plus a row for the annotation badge) and the footnote.
    background(SATheme.bg);
    var badgeRow = isPhoneChart() ? 34 : 50;
    var top = this.drawTitle() + (annotationsAreVisible() ? badgeRow : 22);
    var bottom = this.drawFootnote() - 12;
    var bars = this.getBarLayout(top, bottom);
    this.drawAnnotations(bars);
    this.drawBars(bars);
  };

  // Returns the y below the title block.
  this.drawTitle = function() {
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    var y = 18 + drawWrappedText('Agricultural land ownership by population group', 24, 18, width - 48);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    y += 6;
    return y + drawWrappedText('2017 Land Audit shares for farms and agricultural holdings owned by individual landowners.',
                               24, y, width - 48);
  };

  // Draws the limitation note against the bottom edge and returns its top.
  this.drawFootnote = function() {
    var note = 'Limitation: this is a land-audit measure for individually owned farms/agricultural holdings, not all homes or all wealth. Colour only highlights the largest holder; it does not encode a second value.';
    noStroke();
    fill(SATheme.textMuted);
    textStyle(NORMAL);
    chartTextSize(11);
    var top = height - 14 - wrappedTextHeight(note, width - 48);
    drawWrappedText(note, 24, top, width - 48);
    return top;
  };

  // Row geometry for bars between top and bottom. With room, each bar keeps
  // its hectares label underneath; when space is short the labels are left
  // to the tooltip and data table and the bars tighten to fit.
  this.getBarLayout = function(top, bottom) {
    var isCompact = isCompactChart();
    var labelGap = isCompact ? 8 : 12;
    var labelHeight = isCompact ? 12 : 13;
    var axisSpace = isPhoneChart() ? 0 : 26;
    var rowCount = Math.max(1, this.rows.length);
    var available = bottom - axisSpace - top;
    var barThick = isCompact ? 24 : 30;
    var rowContent = barThick + labelGap + labelHeight;
    var showHectares = available >= rowCount * rowContent + (rowCount - 1) * 8;

    if (!showHectares) {
      barThick = constrain(available / rowCount * 0.65, 12, barThick);
      rowContent = barThick;
    }

    var stepGap = rowCount > 1
      ? Math.min(Math.max(52, rowContent + 8), (available - rowContent) / (rowCount - 1))
      : 0;
    var barsBottom = top + (stepGap * (rowCount - 1)) + barThick;

    return {
      xStart: isCompact ? 98 : 142,
      xEnd: width - 54,
      yStart: top,
      barThick: barThick,
      labelGap: labelGap,
      stepGap: stepGap,
      showHectares: showHectares,
      barsBottom: barsBottom,
      contentBottom: barsBottom + (rowContent - barThick)
    };
  };

  this.drawAnnotations = function(bars) {
    var referenceX = map(50, 0, 80, bars.xStart, bars.xEnd);

    if (isPhoneChart()) {
      drawVerticalReferenceLine(referenceX, bars.yStart - 12, bars.barsBottom + 10, SATheme.red);
      drawAnnotationBadge('50% reference', '', width - 150, bars.yStart - 30, SATheme.red);
      return;
    }

    drawVerticalAnnotation(
      referenceX,
      '50% reference',
      'Displayed ownership share',
      bars.yStart - 48,
      bars.barsBottom + 10,
      SATheme.red
    );
  };

  this.drawBars = function(bars) {
    var isCompact = isCompactChart();
    var xStart = bars.xStart;
    var yStart = bars.yStart;
    var barThick = bars.barThick;
    var stepGap = bars.stepGap;
    var maxSpan = bars.xEnd - xStart;

    stroke(SATheme.grid);
    strokeWeight(1);
    for (var tickVal = 0; tickVal <= 80; tickVal += 20) {
      var tickX = map(tickVal, 0, 80, xStart, bars.xEnd);
      line(tickX, yStart - 12, tickX, bars.barsBottom + 10);
      if (!isPhoneChart()) {
        noStroke();
        fill(SATheme.textMuted);
        textStyle(NORMAL);
        chartTextSize(11);
        textAlign(CENTER, TOP);
        text(tickVal + '%', tickX, bars.contentBottom + 10);
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

      if (bars.showHectares) {
        textStyle(NORMAL);
        chartTextSize(isCompact ? 9 : 10);
        fill(SATheme.textMuted);
        textAlign(LEFT, TOP);
        text(formatThousands(rowItem.hectares) + ' ha', xStart, rowY + barThick + bars.labelGap);
      }
    }
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
