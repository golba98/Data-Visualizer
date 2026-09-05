// Shows farm and land ownership by group
function ZALandOwnershipByGroup() {

  this.name = 'Land ownership';
  this.id = 'za-land-ownership-by-group';
  this.loaded = false;
  this.rows = [];

  this.preload = function() {
    var self = this;
    this.data = loadTable('data/inequality/za_land_ownership_by_group.csv', 'csv', 'header', function(table) {
      self.data = table;
      self.loaded = true;
    });
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
    if (!this.loaded) {
      this.drawLoading();
      return;
    }

    if (this.rows.length == 0) {
      this.setup();
    }

    background(SATheme.bg);
    this.drawTitle();
    this.drawAnnotations();
    this.drawBars();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading land ownership data...', width / 2, height / 2);
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

  this.drawAnnotations = function() {
    var left = isCompactChart() ? 98 : 142;
    var right = width - 54;
    var referenceX = map(50, 0, 80, left, right);
    var bottom = Math.min(height - 64, 118 + (this.rows.length * this.getBarGap()));

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

  this.getBarGap = function() {
    if (!isCompactChart()) return 52;
    if (this.rows.length < 2) return 44;

    var available = height - 100 - 118 - 24;
    return Math.min(52, Math.max(36, available / (this.rows.length - 1)));
  };

  this.drawBars = function() {
    var isCompact = isCompactChart();
    var xStart = isCompact ? 98 : 142;
    var xEnd = width - 54;
    var yStart = isPhoneChart() ? 134 : 118;
    var barThick = isCompact ? 24 : 30;
    var stepGap = this.getBarGap();
    var maxSpan = xEnd - xStart;

    stroke(SATheme.grid);
    strokeWeight(1);
    for (var tickVal = 0; tickVal <= 80; tickVal += 20) {
      var tickX = map(tickVal, 0, 80, xStart, xEnd);
      line(tickX, yStart - 12, tickX, yStart + (stepGap * (this.rows.length - 1)) + barThick + 10);
      if (!isPhoneChart()) {
        noStroke();
        fill(SATheme.textMuted);
        textStyle(NORMAL);
        chartTextSize(11);
        textAlign(CENTER, TOP);
        text(tickVal + '%', tickX, yStart + (stepGap * (this.rows.length - 1)) + barThick + 18);
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

      textStyle(NORMAL);
      chartTextSize(isCompact ? 9 : 10);
      fill(SATheme.textMuted);
      text(formatThousands(rowItem.hectares) + ' ha', xStart, rowY + barThick + (isCompact ? 8 : 12));
    }

    noStroke();
    fill(SATheme.textMuted);
    textStyle(NORMAL);
    chartTextSize(11);
    textAlign(LEFT, isPhoneChart() ? TOP : BOTTOM);
    text('Limitation: this is a land-audit measure for individually owned farms/agricultural holdings, not all homes or all wealth.',
         24,
         isPhoneChart() ? height - 54 : height - 30,
         width - 48,
         isPhoneChart() ? 50 : 28);
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };
}
