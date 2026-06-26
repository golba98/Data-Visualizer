function SAPopulationGroupCensus() {

  this.name = 'Population group by census year';
  this.id = 'sa-population-group-census';

  this.loaded = false;
  this.years = ['1996', '2001', '2011', '2022'];

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/south-africa/population_group_census_1996_2022.csv',
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

  this.pie = new PieChart(width / 2, height / 2, width * 0.4);

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
    var colours = ['#4e79a7', '#f28e2b', '#59a14f', '#e15759', '#b07aa1'];

    for (var i = 0; i < labels.length; i++) {
      legendLabels.push(labels[i] + ' (' + values[i].toFixed(1) + '%)');
    }

    this.pie.draw(values, legendLabels, colours);
  };
}
