// Uses the template's visualisation interface: name, id, preload, setup, draw, destroy.
// Everything below is own.
/* Start - own code */

// Shows housing tenure by population group
function ZADwellingOwnershipByGroup() {

  this.name = 'Dwelling ownership';
  this.id = 'za-dwelling-ownership-by-group';
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading dwelling ownership data...'
  });
  this.rows = [];

  this.preload = function() {
    var self = this;
    this.loadState.loadTables([{
      path: 'data/inequality/za_dwelling_ownership_by_group.csv',
      requiredColumns: ['population_group', 'owned_percent', 'rented_percent',
                        'occupied_rent_free_percent', 'other_or_unknown_percent'],
      numericColumns: ['owned_percent', 'rented_percent',
                       'occupied_rent_free_percent', 'other_or_unknown_percent'],
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
        owned: this.data.getNum(i, 'owned_percent'),
        rented: this.data.getNum(i, 'rented_percent'),
        rentFree: this.data.getNum(i, 'occupied_rent_free_percent'),
        other: this.data.getNum(i, 'other_or_unknown_percent')
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
    this.drawStackedBars();
    this.drawLegend();
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
    // Leaves room for the "Read as tenure" badge, which only wider charts show.
    text('Stats SA GHS 2024 table by population group of household head. Owned includes fully paid and still being paid off.',
         24,
         isPhoneChart() ? 54 : 44,
         isCompactChart() ? width - 48 : width - 260,
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

  this.limitation = 'Limitation: this measures household dwelling tenure rates, not total property wealth or individual ownership totals.';

  // Spreads the rows between the legend and the footnote, thinning the bars
  // when space is tight.
  this.getRowLayout = function() {
    var isCompact = isCompactChart();
    var top = isCompact ? 160 : 124;
    var footnoteTop = chartFootnoteTop(this.limitation, 11);
    var rowsBottom = footnoteTop - 30;
    var step = fitRowStep(top, rowsBottom, this.rows.length, isCompact ? 56 : 70);
    var bar = Math.min(isCompact ? 30 : 38, step * 0.75);

    return {
      top: top,
      step: step,
      bar: bar,
      rowHeight: bar,
      rowCount: this.rows.length,
      rowsBottom: rowsBottom,
      gridBottom: top + (step * (this.rows.length - 1)) + bar + 8,
      footnoteTop: footnoteTop
    };
  };

  this.drawStackedBars = function() {
    var isCompact = isCompactChart();
    var rowLayout = this.getRowLayout();
    var xStart = isCompact ? 112 : 156;
    var xEnd = width - 42;
    var yStart = rowLayout.top;
    var rowHeight = rowLayout.bar;
    var rowStep = rowLayout.step;
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
      line(gridLineX, yStart - 12, gridLineX, rowLayout.gridBottom);
      noStroke();
      fill(SATheme.textMuted);
      textStyle(NORMAL);
      chartTextSize(11);
      textAlign(CENTER, TOP);
      text(pct + '%', gridLineX, rowLayout.gridBottom + 6);
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

    drawChartFootnote(this.limitation, 11);
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

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
