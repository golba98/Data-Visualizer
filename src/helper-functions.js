// Debug / test flags

// Opt-in flags read from the query string.
function hasQueryFlag(name) {
  if (typeof window == 'undefined' || !window.location) {
    return false;
  }

  return new URLSearchParams(window.location.search).get(name) == '1';
}

// Console output that stays silent unless ?debug=1 is set, so temporary diagnostics never reach a normal visitor's console.
function debugLog() {
  if (!hasQueryFlag('debug')) {
    return;
  }

  console.log.apply(console, arguments);
}

// Returns the path unchanged in normal use.
function resolveDataPath(path) {
  if (hasQueryFlag('failData')) {
    return path + '.missing';
  }

  return path;
}

// Data processing helper functions.
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

// Add thousands separators to a number, e.g.
function formatThousands(value) {
  var number = Number(value);

  if (!isFinite(number)) {
    return '—';
  }

  return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Plotting helper functions

function drawAxis(layout, colour) {
  // Flat plot area: a plain border box around all four sides.
  push();
  var strokeCol = colour !== undefined ? colour : (typeof SATheme !== 'undefined' ? SATheme.axis : 80);
  stroke(strokeCol);
  strokeWeight(1.5);
  noFill();
  rect(layout.leftMargin,
       layout.topMargin,
       layout.rightMargin - layout.leftMargin,
       layout.bottomMargin - layout.topMargin);
  pop();
}

function drawAxisLabels(xLabel, yLabel, layout) {
  push();
  var textCol = typeof SATheme !== 'undefined' ? SATheme.text : 245;
  fill(textCol);
  noStroke();
  textAlign('center', 'center');

  // Draw x-axis label, centred below the plot.
  text(xLabel,
       (layout.plotWidth() / 2) + layout.leftMargin,
       layout.bottomMargin + (layout.marginSize * 1.5));

  // Draw y-axis label, rotated 90 degrees and centred to the left of the plot.
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
  var textCol = typeof SATheme !== 'undefined' ? SATheme.textMuted : 160;
  var gridCol = typeof SATheme !== 'undefined' ? SATheme.grid : 40;

  fill(textCol);
  noStroke();
  textAlign('right', 'center');

  // Draw all axis tick labels and grid lines.
  for (var i = 0; i <= layout.numYTickLabels; i++) {
    var value = min + (i * yTickStep);
    var y = mapFunction(value);

    // Add tick label.
    fill(textCol);
    noStroke();
    text(value.toFixed(decimalPlaces),
         layout.leftMargin - layout.pad,
         y);

    if (layout.grid) {
      // Add grid line.
      stroke(gridCol);
      strokeWeight(1);
      line(layout.leftMargin, y, layout.rightMargin, y);
    }
  }
}

function drawXAxisTickLabel(value, layout, mapFunction) {
  // Map function must be passed with .bind(this).
  var x = mapFunction(value);
  var textCol = typeof SATheme !== 'undefined' ? SATheme.textMuted : 160;
  var gridCol = typeof SATheme !== 'undefined' ? SATheme.grid : 40;

  fill(textCol);
  noStroke();
  textAlign('center', 'center');

  // Add tick label.
  text(value,
       x,
       layout.bottomMargin + layout.marginSize / 2);

  if (layout.grid) {
    // Add grid line.
    stroke(gridCol);
    strokeWeight(1);
    line(x,
         layout.topMargin,
         x,
         layout.bottomMargin);
  }
}

// Flat 2D chart styling helpers

// Draw a plain flat bar.
function drawBar(x, y, w, h, col) {
  push();
  stroke(typeof SATheme !== 'undefined' ? SATheme.axis : 80);
  strokeWeight(1);
  fill(col);
  rect(x, y, w, h);
  pop();
}

var pendingChartTooltip = null;

// Queue the tooltip so it is drawn above every chart mark.
function drawChartTooltip(label, value, extra) {
  pendingChartTooltip = { label: label, value: value, extra: extra };
}

function clearChartTooltip() {
  pendingChartTooltip = null;
}

function drawPendingChartTooltip() {
  if (!pendingChartTooltip) return;

  var label = pendingChartTooltip.label;
  var value = pendingChartTooltip.value;
  var extra = pendingChartTooltip.extra;
  var message = label + ': ' + value + (extra ? ' (' + extra + ')' : '');
  textSize(12);
  var boxWidth = textWidth(message) + 20;
  var boxHeight = 28;
  var pointer = getChartPointer();
  var boxX = constrain(pointer.x + 14, 6, width - boxWidth - 6);
  var boxY = constrain(pointer.y - 38, 6, height - boxHeight - 6);

  push();
  stroke(255, 255, 255, 180);
  strokeWeight(1);
  fill(18, 18, 20, 240);
  rect(boxX, boxY, boxWidth, boxHeight, 6);
  noStroke();
  fill(250, 250, 250);
  textAlign(LEFT, CENTER);
  text(message, boxX + 10, boxY + boxHeight / 2);
  pop();
}

// Draw a compact crosshair behind the shared tooltip.
function drawChartCrosshair(x, y) {
  if (!isFinite(x) || !isFinite(y)) return;

  push();
  stroke(255, 255, 255, 80);
  strokeWeight(1);
  drawingContext.setLineDash([4, 4]);
  line(x, 0, x, height);
  line(0, y, width, y);
  drawingContext.setLineDash([]);
  pop();
}

function annotationsAreVisible() {
  return typeof gallery === 'undefined'
      || gallery === null
      || gallery.annotationsEnabled !== false;
}

function drawAnnotationBadge(label, detail, x, y, colour) {
  if (!annotationsAreVisible()) return;

  var main = String(label || '');
  var secondary = detail ? String(detail) : '';
  textSize(11);
  var boxWidth = Math.max(textWidth(main), secondary ? textWidth(secondary) : 0) + 22;
  var boxHeight = secondary ? 36 : 24;
  var boxX = constrain(x, 6, width - boxWidth - 6);
  var boxY = constrain(y, 6, height - boxHeight - 6);

  push();
  stroke(255, 255, 255, 160);
  strokeWeight(1);
  fill(24, 24, 27, 240);
  rect(boxX, boxY, boxWidth, boxHeight, 6);
  noStroke();
  fill(255, 255, 255);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text(main, boxX + 10, boxY + 6);
  if (secondary) {
    textStyle(NORMAL);
    textSize(10);
    fill(212, 212, 216);
    text(secondary, boxX + 10, boxY + 20);
  }
  pop();
}

function drawVerticalReferenceLine(x, top, bottom, colour) {
  if (!annotationsAreVisible()) return;

  push();
  stroke(255, 255, 255, 140);
  strokeWeight(1.2);
  drawingContext.setLineDash([4, 4]);
  line(x, top, x, bottom);
  drawingContext.setLineDash([]);
  pop();
}

function drawVerticalAnnotation(x, label, detail, top, bottom, colour, badgeYOffset) {
  if (!annotationsAreVisible()) return;

  drawVerticalReferenceLine(x, top, bottom, colour);
  drawAnnotationBadge(label, detail, x + 7, top + 4 + (badgeYOffset || 0), colour);
}

function drawHorizontalReferenceLine(y, left, right, colour) {
  if (!annotationsAreVisible()) return;

  push();
  stroke(colour || color(100, 116, 139));
  strokeWeight(1.5);
  drawingContext.setLineDash([5, 4]);
  line(left, y, right, y);
  drawingContext.setLineDash([]);
  pop();
}

function drawHorizontalAnnotation(y, label, detail, left, right, colour) {
  if (!annotationsAreVisible()) return;

  drawHorizontalReferenceLine(y, left, right, colour);
  drawAnnotationBadge(label, detail, left + 8, y - 30, colour);
}

function mouseIsOverRect(x, y, w, h) {
  var pointer = getChartPointer();
  return pointer.x >= x && pointer.x <= x + w
      && pointer.y >= y && pointer.y <= y + h;
}

function getChartPointer() {
  if (typeof touches !== 'undefined' && touches.length > 0) {
    return { x: touches[0].x, y: touches[0].y };
  }
  return { x: mouseX, y: mouseY };
}

function tableToExportData(table) {
  if (!table || typeof table.getColumnCount !== 'function') return null;

  var columns = table.columns ? table.columns.slice() : [];
  var rows = [];
  for (var r = 0; r < table.getRowCount(); r++) {
    var row = {};
    for (var c = 0; c < columns.length; c++) {
      row[columns[c]] = table.getString(r, columns[c]);
    }
    rows.push(row);
  }
  return { columns: columns, rows: rows };
}

function rowsToExportData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  var columns = [];
  rows.forEach(function(row) {
    Object.keys(row || {}).forEach(function(key) {
      if (columns.indexOf(key) === -1) columns.push(key);
    });
  });
  return { columns: columns, rows: rows };
}

function getVisualExportData(vis) {
  if (vis && typeof vis.getExportData === 'function') {
    var customData = vis.getExportData();
    if (customData) return customData;
  }

  if (vis && vis.rows && vis.rows.length) {
    return rowsToExportData(vis.rows);
  }

  if (vis && vis.data) return tableToExportData(vis.data);
  if (vis && vis.table) return tableToExportData(vis.table);

  if (vis) {
    var tables = [];
    ['population', 'earnings', 'income', 'wealth'].forEach(function(key) {
      var tableData = tableToExportData(vis[key]);
      if (tableData) tables.push({ key: key, data: tableData });
    });
    if (tables.length) {
      var combined = [];
      tables.forEach(function(item) {
        item.data.rows.forEach(function(row) {
          var copy = {};
          Object.keys(row).forEach(function(key) {
            copy[item.key + '_' + key] = row[key];
          });
          combined.push(copy);
        });
      });
      return rowsToExportData(combined);
    }
  }

  return { columns: ['message'], rows: [{ message: 'Data is still loading.' }] };
}

function escapeCSVCell(value) {
  var textValue = value == null ? '' : String(value);
  return /[",\n\r]/.test(textValue)
    ? '"' + textValue.replace(/"/g, '""') + '"'
    : textValue;
}

function exportDataCSV(vis) {
  var data = getVisualExportData(vis);
  var lines = [data.columns.map(escapeCSVCell).join(',')];
  data.rows.forEach(function(row) {
    lines.push(data.columns.map(function(column) {
      return escapeCSVCell(row[column]);
    }).join(','));
  });

  var blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = (vis.id || 'visualisation') + '-chart-data.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function() { URL.revokeObjectURL(link.href); }, 0);
}

function exportHighResolutionPNG(vis) {
  var previousDensity = pixelDensity();
  pixelDensity(3);
  redraw();
  saveCanvas((vis.id || 'visualisation') + '-chart', 'png');
  pixelDensity(previousDensity);
  redraw();
}
