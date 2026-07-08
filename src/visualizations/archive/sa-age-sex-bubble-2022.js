function SAAgeSexBubble2022() {

  // ---- State ----

  this.name = 'Age group size and female share';
  this.id = 'sa-age-sex-bubble-2022';

  this.loaded = false;
  this.pad = 58;          // padding between the plot area and the canvas edge
  this.dotSizeMin = 12;   // bubble diameter for the smallest age group
  this.dotSizeMax = 42;   // bubble diameter for the largest age group
  this.yMin = 45;         // female-% axis range (minimum)
  this.yMax = 75;         // female-% axis range (maximum)

  // ---- Lifecycle ----

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/archive/age_sex_bubble_2022.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    textSize(14);
  };

  this.destroy = function() {
  };

  // ---- Drawing ----

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
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
    stroke(0);
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

      // Label every other bubble (plus the 85+ group) to avoid crowding.
      if (i % 2 == 0 || ageGroup == '85+') {
        fill(0);
        noStroke();
        textAlign('center', 'bottom');
        text(ageGroup, x, y - (size / 2) - 3);
        fill(SATheme.withAlpha(SATheme.blueRGB, 140));
        stroke(0);
      }
    }
  };

  // ---- Axes & annotations ----

  this.addAxes = function() {
    stroke(200);
    strokeWeight(1);

    line(this.pad,
         height - this.pad,
         width - this.pad,
         height - this.pad);

    line(this.pad,
         this.pad,
         this.pad,
         height - this.pad);

    fill(0);
    noStroke();
    textSize(12);
    textAlign('right', 'center');

    for (var value = this.yMin; value <= this.yMax; value += 5) {
      var y = map(value,
                  this.yMin,
                  this.yMax,
                  height - this.pad,
                  this.pad);
      text(value + '%', this.pad - 8, y);
      stroke(230);
      line(this.pad, y, width - this.pad, y);
      noStroke();
    }

    fill(0);
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
}
