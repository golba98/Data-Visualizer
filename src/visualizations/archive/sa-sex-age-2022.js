// Based on the template's tech-diversity-gender.js.
// Template parts are outside the markers below.
/* Start - own code */
// Draws the age and sex pyramid
function SAPopulationSexAge2022() {

  this.name = 'Population by sex and age';
  this.id = 'sa-sex-age-2022';
  /* End - own code */

  // Template: layout object.
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

  // Template: midX for the 50% line.
  this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;
  /* Start - own code */
  this.femaleColour = color(SATheme.red);
  this.maleColour = color(SATheme.blue);
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading population by sex and age...'
  });
  /* End - own code */

  // Based on the template's preload().
  /* Start - own code */
  this.preload = function() {
    var self = this;
    this.loadState.loadTables([{
      path: './data/archive/sex_by_age_2022.csv',
      requiredColumns: ['age_group', 'Female', 'Male'],
      numericColumns: ['Female', 'Male'],
      assign: function(table) { self.data = table; }
    }]);
  };
  /* End - own code */

  // Based on the template's setup().
  /* Start - own code */
  this.setup = function() {
    chartTextSize(16);
    this.onResize();
  };
  /* End - own code */

  /* Start - own code */
  this.onResize = function() {
    this.layout.leftMargin = isPhoneChart() ? 62 : 130;
    this.layout.rightMargin = width - 12;
    this.layout.bottomMargin = height - (isPhoneChart() ? 12 : 0);
    this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;
  };
  /* End - own code */

  // Based on the template's drawCategoryLabels().
  /* Start - own code */
  this.draw = function() {
    if (this.loadState.draw()) return;

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
  /* End - own code */

  // Based on the template's drawCategoryLabels().
  /* Start - own code */
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
  /* End - own code */

  // Template: mapPercentToWidth().
  this.mapPercentToWidth = function(percent) {
    return map(percent,
               0,
               100,
               0,
               this.layout.plotWidth());
  };

  /* Start - own code */
  this.getExportData = function() {
    return tableToExportData(this.data);
  };

  this.destroy = function() {
    this.loadState.destroy();
  };
}
  /* End - own code */
