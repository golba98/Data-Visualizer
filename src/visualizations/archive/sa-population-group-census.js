function SAPopulationGroupCensus() {

  // ---- State ----

  this.name = 'Population group by census year';
  this.id = 'sa-population-group-census';

  this.loaded = false;
  this.years = ['1996', '2001', '2011', '2022'];   // census years available in the CSV

  // ---- Lifecycle ----

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/archive/population_group_census_1996_2022.csv',
      'csv',
      'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.selectLabel = document.createElement('label');
    this.selectLabel.textContent = 'Census year';
    document.getElementById('chart-controls').appendChild(this.selectLabel);

    this.select = createSelect();
    this.select.parent(this.selectLabel);

    for (var i = 0; i < this.years.length; i++) {
      this.select.option(this.years[i]);
    }
  };

  this.destroy = function() {
    if (this.select) {
      this.select.remove();
      this.select = null;
    }
    if (this.selectLabel) {
      this.selectLabel.remove();
      this.selectLabel = null;
    }
  };

  // Pie chart used to render the selected year. sketch.js re-centres and
  // rescales it via refreshVisualLayout on every resize.
  this.pie = new PieChart(width / 2, height / 2, width * 0.4);

  // ---- Drawing ----

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    if (!this.select) {
      this.setup();
      return;
    }

    var selectedYear = this.select.value();
    var values = stringsToNumbers(this.data.getColumn(selectedYear));
    var labels = this.data.getColumn('population_group');
    var legendLabels = [];
    var colours = SATheme.categorical;   // SA flag colours, one per population group

    for (var i = 0; i < labels.length; i++) {
      legendLabels.push(labels[i] + ' (' + values[i].toFixed(1) + '%)');
    }

    this.pie.draw(values, legendLabels, colours);
  };
}
