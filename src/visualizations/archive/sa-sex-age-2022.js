// Draws the age and sex pyramid
function SAPopulationSexAge2022() {

  this.name = 'Population by sex and age';
  this.id = 'sa-sex-age-2022';

  this.layout = {
    leftMargin: 130,
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

  this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;
  this.femaleColour = color(SATheme.red);
  this.maleColour = color(SATheme.blue);
  this.loaded = false;

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/archive/sex_by_age_2022.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    chartTextSize(16);
    this.onResize();
  };

  this.onResize = function() {
    this.layout.leftMargin = isPhoneChart() ? 62 : 130;
    this.layout.rightMargin = width - 12;
    this.layout.bottomMargin = height - (isPhoneChart() ? 12 : 0);
    this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;
  };

  this.draw = function() {
    if (!this.loaded) {
      debugLog('Data not yet loaded');
      return;
    }

    this.femaleColour = color(SATheme.red);
    this.maleColour = color(SATheme.blue);
    this.drawCategoryLabels();

    var lineHeight = (height - this.layout.topMargin) /
        this.data.getRowCount();

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var lineY = (lineHeight * i) + this.layout.topMargin;

      var ageGroup = {
        label: this.data.getString(i, 'age_group'),
        female: this.data.getNum(i, 'Female'),
        male: this.data.getNum(i, 'Male')
      };

      fill(SATheme.text);
      noStroke();
      textAlign('right', 'top');
      text(ageGroup.label,
           this.layout.leftMargin - this.layout.pad,
           lineY);

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

    stroke(SATheme.axis);
    strokeWeight(1);
    line(this.midX,
         this.layout.topMargin,
         this.midX,
         this.layout.bottomMargin);
  };

  this.drawCategoryLabels = function() {
    fill(SATheme.text);
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

  this.getExportData = function() {
    return tableToExportData(this.data);
  };
}
