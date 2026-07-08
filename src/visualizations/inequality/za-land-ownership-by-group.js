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

    background(255);
    this.drawTitle();
    this.drawBars();
  };

  this.drawLoading = function() {
    background(255);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text('Loading land ownership data...', width / 2, height / 2);
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textStyle(BOLD);
    textSize(17);
    textAlign(LEFT, TOP);
    text('Agricultural land ownership by population group', 24, 18);

    textStyle(NORMAL);
    textSize(12);
    fill(80);
    text('2017 Land Audit shares for farms and agricultural holdings owned by individual landowners.',
         24,
         44,
         width - 48,
         38);
  };

  this.drawBars = function() {
    var compact = width < 720;
    var left = compact ? 98 : 142;
    var right = width - 54;
    var top = 118;
    var barHeight = compact ? 24 : 30;
    var gap = compact ? 44 : 52;
    var barWidth = right - left;

    stroke(220);
    strokeWeight(1);
    for (var tick = 0; tick <= 80; tick += 20) {
      var x = map(tick, 0, 80, left, right);
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
      var currentWidth = map(row.share, 0, 80, 0, barWidth);
      var colour = row.group == 'White' ? SATheme.red : SATheme.green;

      noStroke();
      fill(0);
      textStyle(BOLD);
      textSize(compact ? 10 : 12);
      textAlign(RIGHT, CENTER);
      text(row.group, left - 12, y + (barHeight / 2));

      drawBar(left, y, currentWidth, barHeight, colour);

      fill(0);
      textStyle(BOLD);
      textSize(12);
      textAlign(LEFT, CENTER);
      text(row.share.toFixed(0) + '%', left + currentWidth + 8, y + (barHeight / 2));

      textStyle(NORMAL);
      textSize(10);
      fill(90);
      text(formatThousands(row.hectares) + ' ha', left, y + barHeight + 12);
    }

    noStroke();
    fill(90);
    textStyle(NORMAL);
    textSize(11);
    textAlign(LEFT, BOTTOM);
    text('Limitation: this is a land-audit measure for individually owned farms/agricultural holdings, not all homes or all wealth.',
         24,
         height - 30,
         width - 48,
         28);
  };
}
