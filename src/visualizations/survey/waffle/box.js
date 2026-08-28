// A single waffle cell: a coloured rectangle tagged with its category.
function Box(x, y, width, height, category, colour) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.category = category;
  this.colour = colour;

  // Draw this cell as a filled rectangle with a dark slate border.
  this.draw = function() {
    stroke(SATheme.axis);
    strokeWeight(1);
    fill(this.colour);
    rect(this.x, this.y, this.width, this.height);
  };

  // True when the pointer is inside this cell (used for waffle tooltips).
  this.mouseOver = function() {
    var pointer = getChartPointer();
    return pointer.x >= this.x
        && pointer.x <= this.x + this.width
        && pointer.y >= this.y
        && pointer.y <= this.y + this.height;
  };
}
