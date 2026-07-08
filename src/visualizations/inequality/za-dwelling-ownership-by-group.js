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

    background(255);
    this.drawTitle();
    this.drawStackedBars();
    this.drawLegend();
  };

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading dwelling ownership data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textStyle(BOLD);
    textSize(17);
    textAlign(LEFT, TOP);
    text('Dwelling tenure by population group', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(80);
    text('Stats SA GHS 2024 table by population group of household head. Owned includes fully paid and still being paid off.',
         24,
         44,
         width - 48,
         42);
  };

  this.drawStackedBars = function() {
    var compact = width < 720;
    var left = compact ? 112 : 156;
    var right = width - 42;
    var top = 124;
    var barHeight = compact ? 30 : 38;
    var gap = compact ? 56 : 70;
    var barWidth = right - left;
    var keys = [
      { field: 'owned', label: 'Owned', colour: SATheme.green },
      { field: 'rented', label: 'Rented', colour: SATheme.red },
      { field: 'rentFree', label: 'Rent-free', colour: SATheme.gold },
      { field: 'other', label: 'Other/unknown', colour: SATheme.blueTint }
    ];

    stroke(220);
    strokeWeight(1);
    for (var tick = 0; tick <= 100; tick += 25) {
      var x = map(tick, 0, 100, left, right);
      line(x, top - 12, x, top + (gap * (this.rows.length - 1)) + barHeight + 10);
      noStroke();
      fill(90);
      textStyle(NORMAL);
      textSize(11);
      textAlign(CENTER, TOP);
      text(tick + '%', x, top + (gap * (this.rows.length - 1)) + barHeight + 18);
      stroke(220);
    }

    for (var i = 0; i < this.rows.length; i++) {
      var row = this.rows[i];
      var y = top + (i * gap);
      var currentX = left;

      noStroke();
      fill(0);
      textStyle(BOLD);
      textSize(compact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(row.group, left - 12, y + (barHeight / 2));

      for (var k = 0; k < keys.length; k++) {
        var item = keys[k];
        var value = row[item.field];
        var segmentWidth = map(value, 0, 100, 0, barWidth);

        if (segmentWidth > 0) {
          fill(item.colour);
          stroke(0);
          strokeWeight(1);
          rect(currentX, y, segmentWidth, barHeight);

          if (item.field == 'owned' && segmentWidth > 48) {
            noStroke();
            fill(0);
            textStyle(BOLD);
            textSize(11);
            textAlign(CENTER, CENTER);
            text(value.toFixed(1) + '%', currentX + (segmentWidth / 2), y + (barHeight / 2));
          }
        }

        currentX += segmentWidth;
      }
    }

    noStroke();
    fill(90);
    textStyle(NORMAL);
    textSize(11);
    textAlign(LEFT, BOTTOM);
    text('Limitation: this measures household dwelling tenure rates, not total property wealth or individual ownership totals.',
         24,
         height - 30,
         width - 48,
         28);
  };

  this.drawLegend = function() {
    var labels = [
      { label: 'Owned', colour: SATheme.green },
      { label: 'Rented', colour: SATheme.red },
      { label: 'Rent-free', colour: SATheme.gold },
      { label: 'Other/unknown', colour: SATheme.blueTint }
    ];
    var startX = width < 720 ? 24 : 42;
    var y = 92;
    var gap = width < 720 ? 102 : 126;

    textStyle(NORMAL);
    textSize(width < 720 ? 10 : 11);
    textAlign(LEFT, CENTER);

    for (var i = 0; i < labels.length; i++) {
      var x = startX + (i * gap);
      fill(labels[i].colour);
      stroke(0);
      strokeWeight(1);
      rect(x, y - 7, 14, 14);
      noStroke();
      fill(0);
      text(labels[i].label, x + 20, y);
    }
  };
}
