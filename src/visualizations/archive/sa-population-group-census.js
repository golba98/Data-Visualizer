// Draws census groups as a pie chart
function SAPopulationGroupCensus() {

  this.name = 'Population group by census year';
  this.id = 'sa-population-group-census';

  this.loaded = false;
  this.years = ['1996', '2001', '2011', '2022'];
  this.pie = null;

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
      debugLog('Data not yet loaded');
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

    if (!this.pie) {
      this.pie = new PieChart(width / 2, height / 2, width * 0.4);
    }
    this.onResize();
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

  this.onResize = function() {
    if (!this.pie) return;

    if (!isPhoneChart()) {
      this.pie.diameter = Math.min(width * 0.34, height * 0.68);
      this.pie.x = Math.max((this.pie.diameter / 2) + 20, width * 0.34);
      this.pie.y = height / 2;
      return;
    }

    var rows = Math.ceil(this.years.length / 2) + 1;
    var legendHeight = 24 + (rows * this.pie.phoneRowHeight());
    var diameter = Math.max(96, Math.min(width - 64, height - legendHeight - 40));

    this.pie.diameter = diameter;
    this.pie.x = width / 2;
    this.pie.y = (diameter / 2) + 24;
  };

  this.draw = function() {
    if (!this.loaded) {
      debugLog('Data not yet loaded');
      return;
    }

    if (!this.select || !this.pie) {
      this.setup();
      requestChartRender(true);
      return;
    }

    var selectedYear = this.select.value();
    var values = stringsToNumbers(this.data.getColumn(selectedYear));
    var labels = this.data.getColumn('population_group');
    var legendLabels = [];
    var colours = SATheme.categorical.slice(0, labels.length);

    for (var i = 0; i < labels.length; i++) {
      legendLabels.push(labels[i] + ' (' + values[i].toFixed(1) + '%)');
    }

    this.pie.draw(values, legendLabels, colours);
  };

  this.getExportData = function() {
    return tableToExportData(this.data);
  };
}
