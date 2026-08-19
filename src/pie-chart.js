function PieChart(x, y, diameter) {

  // ---- State ----

  this.x = x;
  this.y = y;
  this.diameter = diameter;
  this.labelSpace = 30;   // vertical gap between legend rows, in pixels
  this.currentData = null;
  this.targetData = null;
  this.animation = 1;

  // ---- Geometry ----

  // Convert each data value into its slice angle (its share of TWO_PI).
  this.get_radians = function(data) {
    var total = sum(data);
    var radians = [];

    for (let i = 0; i < data.length; i++) {
      radians.push((data[i] / total) * TWO_PI);
    }

    return radians;
  };

  // ---- Drawing ----

  this.draw = function(data, labels, colours, title) {

    // Test that data is not empty and that each input array is the
    // same length.
    if (data.length == 0) {
      alert('Data has length zero!');
    } else if (![labels, colours].every((array) => {
      return array.length == data.length;
    })) {
      alert(`Data (length: ${data.length})
Labels (length: ${labels.length})
Colours (length: ${colours.length})
Arrays must be the same length!`);
    }

    // https://p5js.org/examples/form-pie-chart.html

    if (!this.targetData || this.targetData.length != data.length) {
      this.currentData = data.slice();
      this.targetData = data.slice();
      this.animation = 1;
    } else if (JSON.stringify(this.targetData) != JSON.stringify(data)) {
      this.currentData = this.currentData || data.slice();
      this.targetData = data.slice();
      this.animation = 0;
    }

    this.animation = Math.min(1, this.animation + 0.08);
    var shownData = [];
    for (var d = 0; d < data.length; d++) {
      shownData.push(lerp(this.currentData[d], this.targetData[d], this.animation));
    }
    if (this.animation >= 1) this.currentData = this.targetData.slice();

    var angles = this.get_radians(shownData);
    var lastAngle = 0;
    var colour;

    for (var i = 0; i < data.length; i++) {
      if (colours) {
        colour = colours[i];
      } else {
        colour = map(i, 0, data.length, 0, 255);
      }

      fill(colour);
      stroke(0);
      strokeWeight(1);

      // The + 0.001 nudge forces p5 to render a visible slice even when
      // a category's angle is 0. (Hack for 0!)
      arc(this.x, this.y,
          this.diameter, this.diameter,
          lastAngle, lastAngle + angles[i] + 0.001);

      if (labels) {
        this.makeLegendItem(labels[i], i, colour);
      }

      lastAngle += angles[i];
    }

    var hovered = null;
    var distance = dist(mouseX, mouseY, this.x, this.y);
    if (distance <= this.diameter / 2) {
      var mouseAngle = atan2(mouseY - this.y, mouseX - this.x);
      if (mouseAngle < 0) mouseAngle += TWO_PI;
      var testAngle = 0;
      for (var h = 0; h < angles.length; h++) {
        if (mouseAngle >= testAngle && mouseAngle <= testAngle + angles[h]) {
          hovered = h;
          break;
        }
        testAngle += angles[h];
      }
    }

    if (hovered !== null) {
      var percent = (shownData[hovered] / sum(shownData) * 100).toFixed(1) + '%';
      drawChartTooltip(labels[hovered], shownData[hovered].toFixed(1) + '%', percent + ' of total');
    }

    if (title) {
      noStroke();
      textAlign('center', 'center');
      textSize(24);
      text(title, this.x, this.y - this.diameter * 0.6);
    }
  };

  // Draw one coloured swatch + label for the legend, stacked by index i.
  this.makeLegendItem = function(label, i, colour) {
    var x = this.x + 50 + this.diameter / 2;
    var y = this.y + (this.labelSpace * i) - this.diameter / 3;
    var boxWidth = this.labelSpace / 2;
    var boxHeight = this.labelSpace / 2;

    fill(colour);
    rect(x, y, boxWidth, boxHeight);

    fill('black');
    noStroke();
    textAlign('left', 'center');
    textSize(12);
    text(label, x + boxWidth + 10, y + boxWidth / 2);
  };
}
