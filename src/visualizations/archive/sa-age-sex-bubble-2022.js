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

    // The last label drawn, so a label that would collide with it is skipped.
    var lastLabel = null;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var ageGroup = this.data.getString(i, 'age_group');
      var x = map(midpoints[i], xMin, xMax, this.pad, width - this.pad);
      var y = map(femalePercent[i],
                  this.yMin,
                  this.yMax,
                  height - this.pad,
                  this.pad);
      var size = this.bubbleDiameter(totals[i], totalMin, totalMax);

      ellipse(x, y, size, size);

      if (i % 2 == 0 || ageGroup == '85+') {
        chartTextSize(isPhoneChart() ? 10 : 12);
        var halfWidth = (textWidth(ageGroup) / 2) + 2;
        var label = {
          left: x - halfWidth,
          right: x + halfWidth,
          bottom: y - (size / 2) - 3,
          top: y - (size / 2) - 3 - textAscent() - textDescent()
        };
        var collides = lastLabel
          && label.left < lastLabel.right && label.right > lastLabel.left
          && label.top < lastLabel.bottom && label.bottom > lastLabel.top;

        if (!collides) {
          fill(SATheme.text);
          noStroke();
          textAlign('center', 'bottom');
          text(ageGroup, x, label.bottom);
          lastLabel = label;
        }

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
    chartTextSize(12);
    textAlign('center', 'center');
    text('Age group midpoint',
         width / 2,
         height - 12);

    // Phones have a narrower margin, so the title sits nearer the edge to stay
    // clear of the tick labels.
    push();
    translate(isPhoneChart() ? 9 : 14, height / 2);
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
