// Draws an animated pie chart
function PieChart(x, y, diameter) {

  this.x = x;
  this.y = y;
  this.diameter = diameter;
  this.labelSpace = 30;
  this.currentData = null;
  this.targetData = null;
  this.animation = 1;

  this.isAnimating = function() {
    return this.animation < 1;
  };

  // Changes values into pie angles
  this.get_radians = function(data) {
    var total = sum(data);
    var radians = [];

    for (let i = 0; i < data.length; i++) {
      radians.push((data[i] / total) * TWO_PI);
    }

    return radians;
  };

  // Draws the pie and its legend
  this.draw = function(data, labels, colours) {

    if (data.length == 0) {
      debugLog('PieChart: no data to draw');
      return;
    }
    if (![labels, colours].every(function(array) { return array.length == data.length; })) {
      debugLog('PieChart: data, labels and colours must be the same length',
               data.length, labels.length, colours.length);
      return;
    }

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
      stroke(SATheme.axis);
      strokeWeight(1);

      arc(this.x, this.y,
          this.diameter, this.diameter,
          lastAngle, lastAngle + angles[i] + 0.001);

      if (labels) {
        this.makeLegendItem(labels[i], i, colour);
      }

      lastAngle += angles[i];
    }

    var hovered = null;
    var pointer = getChartPointer();
    var distance = dist(pointer.x, pointer.y, this.x, this.y);
    if (distance <= this.diameter / 2) {
      var mouseAngle = atan2(pointer.y - this.y, pointer.x - this.x);
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
  };

  this.phoneRowHeight = function() {
    return 34;
  };

  this.makeLegendItem = function(label, i, colour) {
    var phoneLayout = isPhoneChart();
    var columnWidth = Math.floor((width - 48) / 2);
    var x = phoneLayout
      ? 24 + ((i % 2) * columnWidth)
      : this.x + 50 + this.diameter / 2;
    var y = phoneLayout
      ? this.y + (this.diameter / 2) + 24 + (Math.floor(i / 2) * this.phoneRowHeight())
      : this.y + (this.labelSpace * i) - this.diameter / 3;
    var boxWidth = phoneLayout ? 11 : this.labelSpace / 2;
    var boxHeight = phoneLayout ? 11 : this.labelSpace / 2;

    fill(colour);
    noStroke();
    rect(x, y, boxWidth, boxHeight);

    fill(SATheme.text);
    textAlign('left', 'top');
    chartTextSize(phoneLayout ? 10 : 12);
    if (phoneLayout) {
      text(label, x + boxWidth + 7, y - 1,
           columnWidth - boxWidth - 16, this.phoneRowHeight() - 4);
    } else {
      textAlign('left', 'center');
      text(label, x + boxWidth + 10, y + boxHeight / 2);
    }
  };
}
