function TechDiversityRace() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Tech Diversity: Race';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'tech-diversity-race';

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/race-2018.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
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
    this.selectLabel.textContent = 'Company';
    document.getElementById('chart-controls').appendChild(this.selectLabel);

    // Create a select DOM element.
    this.select = createSelect();
    this.select.parent(this.selectLabel);

    // Fill the options with all company names.
    for (var i = 1; i < this.data.columns.length; i++) {
      this.select.option(this.data.columns[i]);
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

  // Create a new pie chart object.
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

    // Get the value of the company we're interested in from the
    // select item.
    var companyName = this.select.value();

    // Get the column of raw data for companyName.
    var col = this.data.getColumn(companyName);

    // Convert all data strings to numbers.
    col = stringsToNumbers(col);

    // Copy the row labels from the table (the first item of each row).
    var labels = this.data.getColumn(0);

    // Colour to use for each category.
    var colours = ['blue', 'red', 'green', 'pink', 'purple', 'yellow'];

    // Draw the pie chart!
    this.pie.draw(col, labels, colours);
  };
}
