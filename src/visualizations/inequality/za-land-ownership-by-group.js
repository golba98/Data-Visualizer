// Share of individually owned farms and agricultural holdings, by population group.
// Source: Department of Rural Development and Land Reform Land Audit Report 2017.
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
    var compact = isCompactChart();
    var left = compact ? 98 : 142;
    var right = width - 54;
    var top = isPhoneChart() ? 134 : 118;
    var barHeight = compact ? 24 : 30;
    var gap = this.getBarGap();
    var barWidth = right - left;

    stroke(SATheme.grid);
    strokeWeight(1);
    for (var tick = 0; tick <= 80; tick += 20) {
      var x = map(tick, 0, 80, left, right);
      line(x, top - 12, x, top + (gap * (this.rows.length - 1)) + barHeight + 10);
      if (!isPhoneChart()) {
        noStroke();
        fill(SATheme.textMuted);
        textStyle(NORMAL);
        chartTextSize(11);
        textAlign(CENTER, TOP);
        text(tick + '%', x, top + (gap * (this.rows.length - 1)) + barHeight + 18);
      }
      stroke(SATheme.grid);
    }

    for (var i = 0; i < this.rows.length; i++) {
      var row = this.rows[i];
      var y = top + (i * gap);
      var currentWidth = map(row.share, 0, 80, 0, barWidth);
      var colour = row.group == 'White' ? SATheme.red : SATheme.green;

      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(compact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(row.group, left - 12, y + (barHeight / 2));

      drawBar(left, y, currentWidth, barHeight, colour);

      if (mouseIsOverRect(left, y, currentWidth, barHeight)) {
        drawChartTooltip(row.group, row.share.toFixed(1) + '%', formatThousands(row.hectares) + ' ha');
      }

      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(12);
      textAlign(LEFT, CENTER);
      text(row.share.toFixed(0) + '%', left + currentWidth + 8, y + (barHeight / 2));

      textStyle(NORMAL);
      chartTextSize(compact ? 9 : 10);
      fill(SATheme.textMuted);
      text(formatThousands(row.hectares) + ' ha', left, y + barHeight + (compact ? 8 : 12));
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
