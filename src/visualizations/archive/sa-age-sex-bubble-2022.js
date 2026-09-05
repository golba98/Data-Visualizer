// Draws age groups as bubbles
function SAAgeSexBubble2022() {

  this.name = 'Age group size and female share';
  this.id = 'sa-age-sex-bubble-2022';

  this.loaded = false;
  this.pad = 58;
  this.dotSizeMin = 12;
  this.dotSizeMax = 42;
  this.yMin = 45;
  this.yMax = 75;

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/archive/age_sex_bubble_2022.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    chartTextSize(14);
    this.onResize();
  };

  this.onResize = function() {
    this.pad = isPhoneChart() ? 48 : 58;
    this.dotSizeMax = isPhoneChart() ? 34 : 42;
  };

  this.draw = function() {
    if (!this.loaded) {
      debugLog('Data not yet loaded');
      return;
    }

    this.addAxes();

    var midpoints = stringsToNumbers(this.data.getColumn('age_midpoint'));
    var femalePercent = stringsToNumbers(this.data.getColumn('female_percent'));
    var totals = stringsToNumbers(this.data.getColumn('total_population'));

    var xMin = min(midpoints);
    var xMax = max(midpoints);
    var totalMin = min(totals);
    var totalMax = max(totals);

    fill(SATheme.withAlpha(SATheme.blueRGB, 140));
    stroke(SATheme.axis);
    strokeWeight(1);

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var ageGroup = this.data.getString(i, 'age_group');
      var x = map(midpoints[i], xMin, xMax, this.pad, width - this.pad);
      var y = map(femalePercent[i],
                  this.yMin,
                  this.yMax,
                  height - this.pad,
                  this.pad);
      var size = map(totals[i], totalMin, totalMax,
                     this.dotSizeMin, this.dotSizeMax);

      ellipse(x, y, size, size);

      if (i % 2 == 0 || ageGroup == '85+') {
        fill(SATheme.text);
        noStroke();
        textAlign('center', 'bottom');
        text(ageGroup, x, y - (size / 2) - 3);
        fill(SATheme.withAlpha(SATheme.blueRGB, 140));
        stroke(SATheme.axis);
      }
    }
  };

  this.addAxes = function() {
    stroke(SATheme.axis);
    strokeWeight(1);

    line(this.pad,
         height - this.pad,
         width - this.pad,
         height - this.pad);

    line(this.pad,
         this.pad,
         this.pad,
         height - this.pad);

    fill(SATheme.text);
    noStroke();
    chartTextSize(12);
    textAlign('right', 'center');

    for (var value = this.yMin; value <= this.yMax; value += 5) {
      var y = map(value,
                  this.yMin,
                  this.yMax,
                  height - this.pad,
                  this.pad);
      text(value + '%', this.pad - 8, y);
      stroke(SATheme.grid);
      line(this.pad, y, width - this.pad, y);
      noStroke();
    }

    fill(SATheme.text);
    noStroke();
    textAlign('center', 'center');
    text('Age group midpoint',
         width / 2,
         height - 12);

    push();
    translate(14, height / 2);
    rotate(-PI / 2);
    text('Female %', 0, 0);
    pop();

    textAlign('left', 'top');
    text('Bigger circles = larger age groups', this.pad + 10, this.pad);
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };
}
