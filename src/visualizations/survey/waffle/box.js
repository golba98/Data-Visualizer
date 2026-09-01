// A single waffle cell: a coloured rectangle tagged with its category.
function Box(x, y, width, height, category, colour) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.category = category;
  this.colour = colour;

  this.draw = function() {
    stroke(SATheme.axis);
    strokeWeight(1);
    fill(this.colour);
    rect(this.x, this.y, this.width, this.height);
  };

  this.mouseOver = function() {
    return mouseIsOverRect(this.x, this.y, this.width, this.height);
  };
}
