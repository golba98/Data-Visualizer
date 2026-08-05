function SAPopulationSexAge2022() {

  // ---- State ----

  this.name = 'Population by sex and age';
  this.id = 'sa-sex-age-2022';

  this.layout = {
    leftMargin: 130,       // wide left margin leaves room for age-group labels
    rightMargin: width,
    topMargin: 30,
    bottomMargin: height,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    grid: true,
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;   // x of the 50% centre line
  this.femaleColour = color(SATheme.red);
  this.maleColour = color(SATheme.blue);
  this.loaded = false;

  // ---- Lifecycle ----

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/archive/sex_by_age_2022.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    textSize(16);
  };

  this.destroy = function() {
  };

  // ---- Drawing ----

  this.draw = function() {
    if (!this.loaded) {
      debugLog('Data not yet loaded');
      return;
    }

    this.drawCategoryLabels();

    // One horizontal row per age group, filling the canvas height.
    var lineHeight = (height - this.layout.topMargin) /
        this.data.getRowCount();

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var lineY = (lineHeight * i) + this.layout.topMargin;

      var ageGroup = {
        label: this.data.getString(i, 'age_group'),
        female: this.data.getNum(i, 'Female'),
        male: this.data.getNum(i, 'Male')
      };

      fill(0);
      noStroke();
      textAlign('right', 'top');
      text(ageGroup.label,
           this.layout.leftMargin - this.layout.pad,
           lineY);

      // Female bar starts at the left margin; the male bar is stacked
      // immediately to its right so each row sums to 100%.
      fill(this.femaleColour);
      rect(this.layout.leftMargin,
           lineY,
           this.mapPercentToWidth(ageGroup.female),
           lineHeight - this.layout.pad);

      fill(this.maleColour);
      rect(this.layout.leftMargin + this.mapPercentToWidth(ageGroup.female),
           lineY,
           this.mapPercentToWidth(ageGroup.male),
           lineHeight - this.layout.pad);
    }

    stroke(150);
    strokeWeight(1);
    line(this.midX,
         this.layout.topMargin,
         this.midX,
         this.layout.bottomMargin);
  };

  this.drawCategoryLabels = function() {
    fill(0);
    noStroke();
    textAlign('left', 'top');
    text('Female', this.layout.leftMargin, this.layout.pad);
    textAlign('center', 'top');
    text('50%', this.midX, this.layout.pad);
    textAlign('right', 'top');
    text('Male', this.layout.rightMargin, this.layout.pad);
  };

  this.mapPercentToWidth = function(percent) {
    return map(percent,
               0,
               100,
               0,
               this.layout.plotWidth());
  };
}
