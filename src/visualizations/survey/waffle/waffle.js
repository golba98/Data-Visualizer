// Waffle chart: a boxesAcross x boxesDown grid of Box cells whose colours show each category's share of the values in table[columnName].
function Waffle(x, y, width, height, boxesAcross, boxesDown, table, columnName, categories, colours) {

  // State

  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.boxesAcross = boxesAcross;
  this.boxesDown = boxesDown;
  this.table = table;
  this.columnName = columnName;
  this.categories = categories;
  this.colours = colours;
  this.boxes = [];
  this.counts = {};

  // Build

  // Count categories, work out how many boxes each one gets, then fill a row-by-row grid of Box objects.
  this.build = function() {
    var validTotal = this.countCategories();
    var boxTotals = this.calculateBoxTotals(validTotal);
    var categoryForBoxes = [];

    for (var i = 0; i < this.categories.length; i++) {
      var category = this.categories[i];
      for (var j = 0; j < boxTotals[category]; j++) {
        categoryForBoxes.push(category);
      }
    }

    var boxWidth = this.width / this.boxesAcross;
    var boxHeight = this.height / this.boxesDown;
    var boxIndex = 0;
    this.boxes = [];

    for (var row = 0; row < this.boxesDown; row++) {
      var boxRow = [];

      for (var col = 0; col < this.boxesAcross; col++) {
        var currentCategory = categoryForBoxes[boxIndex] || this.categories[0];
        var colour = this.colours[currentCategory];
        boxRow.push(new Box(
          this.x + (col * boxWidth),
          this.y + (row * boxHeight),
          boxWidth,
          boxHeight,
          currentCategory,
          colour
        ));
        boxIndex++;
      }

      this.boxes.push(boxRow);
    }
  };

  // Counting

  // Tally how many table rows fall into each known category.
  this.countCategories = function() {
    var total = 0;
    this.counts = {};

    for (var i = 0; i < this.categories.length; i++) {
      this.counts[this.categories[i]] = 0;
    }

    for (var row = 0; row < this.table.getRowCount(); row++) {
      var value = this.table.getString(row, this.columnName).trim();

      if (this.counts.hasOwnProperty(value)) {
        this.counts[value]++;
        total++;
      }
    }

    return total;
  };

  // Box allocation

  // Convert category counts into whole box totals using the largest-remainder method, so the boxes always sum to exactly totalBoxes.
  this.calculateBoxTotals = function(validTotal) {
    var totalBoxes = this.boxesAcross * this.boxesDown;
    var boxTotals = {};
    var remainders = [];
    var assigned = 0;

    for (var i = 0; i < this.categories.length; i++) {
      var category = this.categories[i];
      var exact = validTotal > 0
          ? (this.counts[category] / validTotal) * totalBoxes
          : 0;
      var whole = Math.floor(exact);

      boxTotals[category] = whole;
      assigned += whole;
      remainders.push({
        category: category,
        remainder: exact - whole
      });
    }

    // Hand the leftover boxes to the categories with the largest fractional remainders first.
    remainders.sort(function(a, b) {
      return b.remainder - a.remainder;
    });

    for (var extra = 0; extra < totalBoxes - assigned; extra++) {
      boxTotals[remainders[extra % remainders.length].category]++;
    }

    return boxTotals;
  };

  // Drawing & interaction

  this.draw = function() {
    for (var row = 0; row < this.boxes.length; row++) {
      for (var col = 0; col < this.boxes[row].length; col++) {
        if (this.boxes[row][col]) {
          this.boxes[row][col].draw();
        }
      }
    }
  };

  this.checkMouse = function() {
    for (var row = 0; row < this.boxes.length; row++) {
      for (var col = 0; col < this.boxes[row].length; col++) {
        var box = this.boxes[row][col];

        if (box && box.mouseOver()) {
          return box.category;
        }
      }
    }

    return null;
  };

  // Build the grid immediately when the Waffle is constructed.
  this.build();
}
