// Uses the template's visualisation interface: name, id, preload, setup, draw, destroy.
// Everything below is own.
// The lecture's Bubble object was not used.
/* Start - own code */

// Draws age groups as bubbles
function SAAgeSexBubble2022() {

  this.name = 'Age group size and female share';
  this.id = 'sa-age-sex-bubble-2022';

  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading age and sex data...'
  });
  this.pad = 58;
  this.dotSizeMin = 12;
  this.dotSizeMax = 42;
  this.yMin = 45;
  this.yMax = 75;

  this.preload = function() {
    var self = this;
    this.loadState.loadTables([{
      path: './data/archive/age_sex_bubble_2022.csv',
      requiredColumns: ['age_group', 'age_midpoint', 'female_percent', 'total_population'],
      numericColumns: ['age_midpoint', 'female_percent', 'total_population'],
      assign: function(table) { self.data = table; }
    }]);
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
    if (this.loadState.draw()) return;

    this.addAxes();

    var midpoints = stringsToNumbers(this.data.getColumn('age_midpoint'));
    var femalePercent = stringsToNumbers(this.data.getColumn('female_percent'));
    var totals = stringsToNumbers(this.data.getColumn('total_population'));

    var xMin = min(midpoints);
    var xMax = max(midpoints);
    var totalMin = min(totals);
    var totalMax = max(totals);

    this.drawSizeKey(totalMin, totalMax);

    fill(SATheme.withAlpha(SATheme.blueRGB, 140));
    stroke(SATheme.axis);
    strokeWeight(1);

    // Label every step-th group, with the step set by how many labels fit
    // across the plot, and always the last (85+) unless its neighbour is too
    // close.
    var rowCount = this.data.getRowCount();
    chartTextSize(12);
    var spacing = (width - (this.pad * 2)) / Math.max(1, rowCount - 1);
    var labelStep = Math.max(2, Math.ceil((textWidth('00-00') + 10) / spacing));

    for (var i = 0; i < rowCount; i++) {
      var ageGroup = this.data.getString(i, 'age_group');
      var x = map(midpoints[i], xMin, xMax, this.pad, width - this.pad);
      var y = map(femalePercent[i],
                  this.yMin,
                  this.yMax,
                  height - this.pad,
                  this.pad);
      var size = this.bubbleDiameter(totals[i], totalMin, totalMax);

      ellipse(x, y, size, size);

      var isLast = i === rowCount - 1;
      var nearLast = !isLast && (rowCount - 1 - i) < labelStep;
      if ((i % labelStep == 0 && !nearLast) || isLast) {
        fill(SATheme.text);
        noStroke();
        textAlign('center', 'bottom');
        text(ageGroup, x, y - (size / 2) - 3);
        fill(SATheme.withAlpha(SATheme.blueRGB, 140));
        stroke(SATheme.axis);
      }
    }
  };

  // Shared by the bubbles and by the size key, so the two cannot disagree.
  this.bubbleDiameter = function(total, totalMin, totalMax) {
    return map(total, totalMin, totalMax, this.dotSizeMin, this.dotSizeMax);
  };

  this.drawSizeKey = function(totalMin, totalMax) {
    var self = this;

    drawSizeLegend(this.pad + 10, this.pad + 4, {
      title: 'Circle size = people in the age group',
      values: sizeLegendValues(totalMin, totalMax, 3),
      diameterFor: function(value) {
        return self.bubbleDiameter(value, totalMin, totalMax);
      },
      format: function(value) { return formatThousands(value); },
      fill: SATheme.withAlpha(SATheme.blueRGB, 140)
    });
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
    chartTextSize(isPhoneChart() ? 10 : 12);
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
    translate(isPhoneChart() ? 10 : 14, height / 2);
    rotate(-PI / 2);
    text('Female %', 0, 0);
    pop();

  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}

/* End - own code */
