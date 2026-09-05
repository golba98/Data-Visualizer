// Shows housing tenure by population group
function ZADwellingOwnershipByGroup() {

  this.name = 'Dwelling ownership';
  this.id = 'za-dwelling-ownership-by-group';
  this.loaded = false;
  this.rows = [];

  this.preload = function() {
    var self = this;
    this.data = loadTable('data/inequality/za_dwelling_ownership_by_group.csv', 'csv', 'header', function(table) {
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
        owned: this.data.getNum(i, 'owned_percent'),
        rented: this.data.getNum(i, 'rented_percent'),
        rentFree: this.data.getNum(i, 'occupied_rent_free_percent'),
        other: this.data.getNum(i, 'other_or_unknown_percent')
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
    this.drawStackedBars();
    this.drawLegend();
  };

  this.drawLoading = function() {
    background(SATheme.bg);
    fill(SATheme.text);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading dwelling ownership data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(SATheme.text);
    noStroke();
    textStyle(BOLD);
    chartTextSize(isPhoneChart() ? 13 : 17);
    textAlign(LEFT, TOP);
    text('Dwelling tenure by population group', 24, 18, width - 48, isPhoneChart() ? 44 : 36);

    textStyle(NORMAL);
    chartTextSize(12);
    fill(SATheme.textMuted);
    text('Stats SA GHS 2024 table by population group of household head. Owned includes fully paid and still being paid off.',
         24,
         isPhoneChart() ? 54 : 44,
         width - 48,
         isPhoneChart() ? 56 : 42);
  };

  this.drawAnnotations = function() {
    if (isCompactChart()) return;

    drawAnnotationBadge(
      'Read as tenure',
      'Not total property wealth',
      width - 220,
      18,
      SATheme.blue
    );
  };

  this.drawStackedBars = function() {
    var isCompact = isCompactChart();
    var xStart = isCompact ? 112 : 156;
    var xEnd = width - 42;
    var yStart = isCompact ? 160 : 124;
    var rowHeight = isCompact ? 30 : 38;
    var rowStep = isCompact ? 56 : 70;
    var totalBarSpan = xEnd - xStart;

    var tenureCategories = [
      { key: 'owned', title: 'Owned', fill: SATheme.green },
      { key: 'rented', title: 'Rented', fill: SATheme.red },
      { key: 'rentFree', title: 'Rent-free', fill: SATheme.gold },
      { key: 'other', title: 'Other/unknown', fill: SATheme.blueTint }
    ];

    stroke(SATheme.grid);
    strokeWeight(1);
    for (var pct = 0; pct <= 100; pct += 25) {
      var gridLineX = map(pct, 0, 100, xStart, xEnd);
      line(gridLineX, yStart - 12, gridLineX, yStart + (rowStep * (this.rows.length - 1)) + rowHeight + 10);
      noStroke();
      fill(SATheme.textMuted);
      textStyle(NORMAL);
      chartTextSize(11);
      textAlign(CENTER, TOP);
      text(pct + '%', gridLineX, yStart + (rowStep * (this.rows.length - 1)) + rowHeight + 18);
      stroke(SATheme.grid);
    }

    for (var rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
      var groupData = this.rows[rowIndex];
      var rowTop = yStart + (rowIndex * rowStep);
      var offsetX = xStart;

      noStroke();
      fill(SATheme.text);
      textStyle(BOLD);
      chartTextSize(isCompact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(groupData.group, xStart - 12, rowTop + (rowHeight / 2));

      for (var catIdx = 0; catIdx < tenureCategories.length; catIdx++) {
        var cat = tenureCategories[catIdx];
        var pctValue = groupData[cat.key];
        var blockWidth = map(pctValue, 0, 100, 0, totalBarSpan);

        if (blockWidth > 0) {
          fill(cat.fill);
          stroke(SATheme.axis);
          strokeWeight(1);
          rect(offsetX, rowTop, blockWidth, rowHeight);

          if (cat.key === 'owned' && blockWidth > 48) {
            noStroke();
            fill(SATheme.text);
            textStyle(BOLD);
            chartTextSize(11);
            textAlign(CENTER, CENTER);
            text(pctValue.toFixed(1) + '%', offsetX + (blockWidth / 2), rowTop + (rowHeight / 2));
          }

          if (mouseIsOverRect(offsetX, rowTop, blockWidth, rowHeight)) {
            drawChartTooltip(groupData.group, pctValue.toFixed(1) + '%', cat.title);
          }
        }

        offsetX += blockWidth;
      }
    }

    noStroke();
    fill(SATheme.textMuted);
    textStyle(NORMAL);
    chartTextSize(11);
    textAlign(LEFT, isPhoneChart() ? TOP : BOTTOM);
    text('Limitation: this measures household dwelling tenure rates, not total property wealth or individual ownership totals.',
         24,
         isPhoneChart() ? height - 54 : height - 30,
         width - 48,
         isPhoneChart() ? 46 : 28);
  };

  this.drawLegend = function() {
    var labels = [
      { label: 'Owned', colour: SATheme.green },
      { label: 'Rented', colour: SATheme.red },
      { label: 'Rent-free', colour: SATheme.gold },
      { label: 'Other/unknown', colour: SATheme.blueTint }
    ];
    var compact = isCompactChart();
    var startX = compact ? 24 : 42;
    var y = compact ? 110 : 92;
    var gap = compact ? (width - 48) / 2 : 126;

    textStyle(NORMAL);
    chartTextSize(isCompactChart() ? 10 : 11);
    textAlign(LEFT, CENTER);

    for (var i = 0; i < labels.length; i++) {
      var x = startX + ((compact ? i % 2 : i) * gap);
      var itemY = y + (compact ? Math.floor(i / 2) * 24 : 0);
      fill(labels[i].colour);
      stroke(SATheme.axis);
      strokeWeight(1);
      rect(x, itemY - 7, 14, 14);
      noStroke();
      fill(SATheme.text);
      text(labels[i].label, x + 20, itemY);
    }
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };
}
