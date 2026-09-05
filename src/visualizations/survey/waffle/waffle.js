// Builds and draws a waffle chart
function Waffle(x, y, width, height, boxesAcross, boxesDown, table, columnName, categories, colours) {

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
  this.representedRows = 0;


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
        var currentCategory = categoryForBoxes[boxIndex];
        boxIndex++;

        if (currentCategory === undefined) {
          boxRow.push(null);
          continue;
        }

        boxRow.push(new Box(
          this.x + (col * boxWidth),
          this.y + (row * boxHeight),
          boxWidth,
          boxHeight,
          currentCategory,
          this.colours[currentCategory]
        ));
      }

      this.boxes.push(boxRow);
    }
  };


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

    this.representedRows = total;

    return total;
  };

  // Shares cells across categories
  this.calculateBoxTotals = function(validTotal) {
    var capacity = this.boxesAcross * this.boxesDown;
    var allocation = {};

    if (validTotal <= 0) {
      for (var k = 0; k < this.categories.length; k++) {
        allocation[this.categories[k]] = 0;
      }
      return allocation;
    }

    var baseSum = 0;
    var fractionList = [];

    for (var i = 0; i < this.categories.length; i++) {
      var catName = this.categories[i];
      var rawShare = (this.counts[catName] / validTotal) * capacity;
      var integerBoxes = Math.floor(rawShare);

      allocation[catName] = integerBoxes;
      baseSum += integerBoxes;

      fractionList.push({
        name: catName,
        position: i,
        frac: rawShare - integerBoxes
      });
    }

    fractionList.sort(function(itemA, itemB) {
      var diff = itemB.frac - itemA.frac;
      if (Math.abs(diff) > 1e-12) {
        return diff;
      }
      return itemA.position - itemB.position;
    });

    var unallocated = capacity - baseSum;
    for (var extra = 0; extra < unallocated; extra++) {
      var topCandidate = fractionList[extra % fractionList.length];
      allocation[topCandidate.name]++;
    }

    return allocation;
  };


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

  this.build();
}
