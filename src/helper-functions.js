// --------------------------------------------------------------------
// Debug / test flags
// --------------------------------------------------------------------

// Opt-in flags read from the query string. None of these change anything for
// a normal visitor -- the app only behaves differently when a flag is asked
// for explicitly:
//
//   ?test=1      run the Topic 8 test suite (see topic8-testing.js)
//   ?debug=1     allow debugLog() output through to the console
//   ?failData=1  point data loads at a file that does not exist, so the
//                asynchronous loader's error path can actually be observed
function hasQueryFlag(name) {
  if (typeof window == 'undefined' || !window.location) {
    return false;
  }

  return new URLSearchParams(window.location.search).get(name) == '1';
}

// Console output that stays silent unless ?debug=1 is set, so temporary
// diagnostics never reach a normal visitor's console.
function debugLog() {
  if (!hasQueryFlag('debug')) {
    return;
  }

  console.log.apply(console, arguments);
}

// Returns the path unchanged in normal use. Under ?failData=1 it returns a
// path that cannot resolve, which is how the load-failure state is tested.
function resolveDataPath(path) {
  if (hasQueryFlag('failData')) {
    return path + '.missing';
  }

  return path;
}

// --------------------------------------------------------------------
// Data processing helper functions.
// --------------------------------------------------------------------
function sum(data) {
  var total = 0;

  // Ensure that data contains numbers and not strings.
  data = stringsToNumbers(data);

  for (let i = 0; i < data.length; i++) {
    total = total + data[i];
  }

  return total;
}

function mean(data) {
  var total = sum(data);

  return total / data.length;
}

function sliceRowNumbers (row, start=0, end) {
  var rowData = [];

  if (!end) {
    // Parse all values until the end of the row.
    end = row.arr.length;
  }

  for (var i = start; i < end; i++) {
    rowData.push(row.getNum(i));
  }

  return rowData;
}

function stringsToNumbers (array) {
  return array.map(Number);
}

// Add thousands separators to a number, e.g. 26663144 -> '26,663,144'.
//
// Chart labels are built straight from this, so a missing or non-numeric
// cell used to render as "RNaN" or "NaN ha" on the canvas. Anything that
// isn't a finite number now becomes an em dash instead.
function formatThousands(value) {
  var number = Number(value);

  if (!isFinite(number)) {
    return '—';
  }

  return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// --------------------------------------------------------------------
// Plotting helper functions
// --------------------------------------------------------------------

function drawAxis(layout, colour=0) {
  // Flat plot area: a plain border box around all four sides, not just the
  // two axis lines. Drawn on top of any grid lines.
  push();
  stroke(color(colour));
  strokeWeight(2);
  noFill();
  rect(layout.leftMargin,
       layout.topMargin,
       layout.rightMargin - layout.leftMargin,
       layout.bottomMargin - layout.topMargin);
  pop();
}

function drawAxisLabels(xLabel, yLabel, layout) {
  fill(0);
  noStroke();
  textAlign('center', 'center');

  // Draw x-axis label, centred below the plot. The 1.5 * marginSize
  // offset drops it clear of the tick labels.
  text(xLabel,
       (layout.plotWidth() / 2) + layout.leftMargin,
       layout.bottomMargin + (layout.marginSize * 1.5));

  // Draw y-axis label, rotated 90 degrees and centred to the left of the plot.
  push();
  translate(layout.leftMargin - (layout.marginSize * 1.5),
            layout.bottomMargin / 2);
  rotate(- PI / 2);
  text(yLabel, 0, 0);
  pop();
}

function drawYAxisTickLabels(min, max, layout, mapFunction,
                             decimalPlaces) {
  // Map function must be passed with .bind(this).
  var range = max - min;
  var yTickStep = range / layout.numYTickLabels;

  fill(0);
  noStroke();
  textAlign('right', 'center');

  // Draw all axis tick labels and grid lines.
  for (var i = 0; i <= layout.numYTickLabels; i++) {
    var value = min + (i * yTickStep);
    var y = mapFunction(value);

    // Add tick label.
    text(value.toFixed(decimalPlaces),
         layout.leftMargin - layout.pad,
         y);

    if (layout.grid) {
      // Add grid line.
      stroke(140);
      strokeWeight(1);
      line(layout.leftMargin, y, layout.rightMargin, y);
    }
  }
}

function drawXAxisTickLabel(value, layout, mapFunction) {
  // Map function must be passed with .bind(this).
  var x = mapFunction(value);

  fill(0);
  noStroke();
  textAlign('center', 'center');

  // Add tick label.
  text(value,
       x,
       layout.bottomMargin + layout.marginSize / 2);

  if (layout.grid) {
    // Add grid line.
    stroke(140);
    strokeWeight(1);
    line(x,
         layout.topMargin,
         x,
         layout.bottomMargin);
  }
}

// --------------------------------------------------------------------
// Flat 2D chart styling helpers
// --------------------------------------------------------------------

// Draw a plain flat bar. (x, y) is the top-left of the bar; w/h its size.
function drawBar(x, y, w, h, col) {
  push();
  stroke(0);
  strokeWeight(1);
  fill(col);
  rect(x, y, w, h);
  pop();
}

// Small canvas tooltip used by the interactive charts.
function drawChartTooltip(label, value, extra) {
  var message = label + ': ' + value + (extra ? ' (' + extra + ')' : '');
  textSize(12);
  var boxWidth = textWidth(message) + 18;
  var boxHeight = 28;
  var boxX = constrain(mouseX + 12, 4, width - boxWidth - 4);
  var boxY = constrain(mouseY - 38, 4, height - boxHeight - 4);

  push();
  stroke(40);
  strokeWeight(1);
  fill(255, 250);
  rect(boxX, boxY, boxWidth, boxHeight, 4);
  noStroke();
  fill(20);
  textAlign(LEFT, CENTER);
  text(message, boxX + 9, boxY + boxHeight / 2);
  pop();
}

function mouseIsOverRect(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w
      && mouseY >= y && mouseY <= y + h;
}
