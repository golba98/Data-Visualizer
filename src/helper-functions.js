/* Start - own code */


// Checks for a URL flag
function hasQueryFlag(name) {
  if (typeof window == 'undefined' || !window.location) {
    return false;
  }

  return new URLSearchParams(window.location.search).get(name) == '1';
}

function debugLog() {
  if (!hasQueryFlag('debug')) {
    return;
  }

  console.log.apply(console, arguments);
}

// Returns the normal or test data path
function resolveDataPath(path) {
  if (hasQueryFlag('failData')) {
    return path + '.missing';
  }

  return path;
}

// Owns the loading, ready, and error lifecycle for one visualisation.
function VisualizationLoadState(owner, options) {
  options = options || {};

  this.owner = owner;
  this.status = 'idle';
  this.loadingMessage = options.loadingMessage || 'Loading visualisation data...';
  this.errorMessage = options.errorMessage
    || 'Unable to load this visualisation. Check your connection and refresh the page.';
  this.completedResources = 0;
  this.totalResources = 0;
  this.rawError = null;
  this.lastAnnouncement = null;

  this.syncOwner();
}

VisualizationLoadState.prototype.syncOwner = function() {
  if (!this.owner) return;

  this.owner.loaded = this.status === 'ready';
  this.owner.isLoading = this.status === 'loading';
  this.owner.isReady = this.status === 'ready';
  this.owner.loadError = this.status === 'error' ? this.errorMessage : null;
  this.owner.loadProgress = this.totalResources > 0
    ? this.completedResources / this.totalResources
    : 0;
};

VisualizationLoadState.prototype.requestRender = function() {
  if (typeof gallery !== 'undefined'
      && gallery
      && gallery.selectedVisual === this.owner
      && typeof requestChartRender === 'function') {
    requestChartRender();
  }
};

VisualizationLoadState.prototype.start = function(totalResources) {
  this.status = 'loading';
  this.completedResources = 0;
  this.totalResources = Math.max(1, Number(totalResources) || 1);
  this.rawError = null;
  this.lastAnnouncement = null;
  this.syncOwner();
  this.requestRender();
};

VisualizationLoadState.prototype.validateTable = function(table, request) {
  if (!table || typeof table.getRowCount !== 'function') {
    throw new Error('The data loader did not return a table.');
  }

  if (table.getRowCount() === 0) {
    throw new Error('The data table is empty.');
  }

  var columns = Array.isArray(table.columns) ? table.columns : [];
  var requiredColumns = request.requiredColumns || [];
  for (var c = 0; c < requiredColumns.length; c++) {
    if (columns.indexOf(requiredColumns[c]) === -1) {
      throw new Error('Missing required column: ' + requiredColumns[c]);
    }
  }

  var numericColumns = request.numericColumns || [];
  for (var row = 0; row < table.getRowCount(); row++) {
    for (var n = 0; n < numericColumns.length; n++) {
      var value = Number(table.getString(row, numericColumns[n]));
      if (!isFinite(value)) {
        throw new Error('Invalid number in column: ' + numericColumns[n]);
      }
    }
  }

  if (typeof request.validate === 'function' && request.validate(table) === false) {
    throw new Error('The data table failed visualisation validation.');
  }
};

VisualizationLoadState.prototype.completeResource = function() {
  if (this.status !== 'loading') return;

  this.completedResources++;
  if (this.completedResources >= this.totalResources) {
    this.status = 'ready';
  }
  this.syncOwner();
  this.requestRender();

  // Comparison panes are iframes, so the parent never draws these charts and
  // their summaries would otherwise stay empty after a late load.
  if (this.status === 'ready'
      && typeof gallery !== 'undefined'
      && gallery
      && typeof gallery.refreshComparisonSummary === 'function') {
    gallery.refreshComparisonSummary();
  }
};

VisualizationLoadState.prototype.fail = function(error, path) {
  if (this.status !== 'loading') return;

  this.status = 'error';
  this.completedResources = 0;
  this.rawError = error || new Error('Unknown data-loading error.');
  this.syncOwner();
  debugLog('Data load failed for', this.owner ? this.owner.id : 'visualisation', path, this.rawError);
  this.requestRender();
};

VisualizationLoadState.prototype.loadTables = function(requests, onReady) {
  var self = this;
  var list = Array.isArray(requests) ? requests : [];

  this.start(list.length);
  if (list.length === 0) {
    this.fail(new Error('No data resources were configured.'));
    return;
  }

  list.forEach(function(request) {
    try {
      loadTable(
        resolveDataPath(request.path),
        'csv',
        'header',
        function(table) {
          if (self.status !== 'loading') return;

          try {
            self.validateTable(table, request);
            if (typeof request.assign === 'function') {
              request.assign(table);
            }

            var isLast = self.completedResources + 1 >= self.totalResources;
            if (isLast && typeof onReady === 'function') {
              onReady();
            }
            self.completeResource();
          } catch (error) {
            self.fail(error, request.path);
          }
        },
        function(error) {
          self.fail(error, request.path);
        });
    } catch (error) {
      self.fail(error, request.path);
    }
  });
};

VisualizationLoadState.prototype.announce = function(status, message) {
  if (typeof document === 'undefined') return;

  var region = document.getElementById('chart-load-status');
  if (!region) return;

  var announcement = status + ':' + message;
  if (this.lastAnnouncement === announcement
      && region.dataset.visualisationId === this.owner.id) {
    return;
  }

  region.dataset.visualisationId = this.owner.id;
  region.setAttribute('role', status === 'error' ? 'alert' : 'status');
  region.setAttribute('aria-live', status === 'error' ? 'assertive' : 'polite');
  region.textContent = message;
  this.lastAnnouncement = announcement;
};

VisualizationLoadState.prototype.draw = function() {
  if (this.status === 'ready') {
    this.announce('ready', this.owner.name + ' ready.');
    return false;
  }

  background(SATheme.bg);
  noStroke();
  textAlign(CENTER, CENTER);

  if (this.status === 'error') {
    fill(SATheme.red);
    textStyle(BOLD);
    chartTextSize(16);
    text('This chart is unavailable', width / 2, (height / 2) - 22);

    fill(SATheme.textMuted);
    textStyle(NORMAL);
    chartTextSize(13);
    text(this.errorMessage, width * 0.1, (height / 2) + 4, width * 0.8, 60);
    this.announce('error', this.errorMessage);
    return true;
  }

  fill(SATheme.text);
  textStyle(NORMAL);
  chartTextSize(14);
  text(this.loadingMessage, width / 2, (height / 2) - 16);

  var barWidth = Math.min(220, width * 0.4);
  var barX = (width - barWidth) / 2;
  var barY = (height / 2) + 8;
  noFill();
  stroke(SATheme.axis);
  strokeWeight(1);
  rect(barX, barY, barWidth, 8);
  noStroke();
  fill(SATheme.blue);
  rect(barX, barY, barWidth * Math.max(0.08, this.owner.loadProgress), 8);

  this.announce('loading', this.loadingMessage);
  return true;
};

VisualizationLoadState.prototype.destroy = function() {
  if (typeof document !== 'undefined') {
    var region = document.getElementById('chart-load-status');
    if (region && region.dataset.visualisationId === this.owner.id) {
      region.textContent = '';
      region.removeAttribute('role');
      region.setAttribute('aria-live', 'polite');
      delete region.dataset.visualisationId;
    }
  }

  this.lastAnnouncement = null;
};

var CHART_PHONE_WIDTH = 520;
var CHART_COMPACT_WIDTH = 720;
var CHART_SHORT_HEIGHT = 320;

var CHART_MIN_TEXT_SIZE = 10;

function isPhoneChart() {
  return width < CHART_PHONE_WIDTH;
}

function isCompactChart() {
  return width < CHART_COMPACT_WIDTH;
}

function isShortChart() {
  return height < CHART_SHORT_HEIGHT;
}

function chartTextSize(size) {
  textSize(Math.max(CHART_MIN_TEXT_SIZE, size));
}


/* End - own code */

// Template: sum, mean, sliceRowNumbers, stringsToNumbers.
function sum(data) {
  var total = 0;

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
    end = row.arr.length;
  }

  // Template loop. var added so i is not a global.
  /* Start - own code */
  for (var i = start; i < end; i++) {
  /* End - own code */
    rowData.push(row.getNum(i));
  }

  return rowData;
}

function stringsToNumbers (array) {
  return array.map(Number);
}

/* Start - own code */
// Formats a number with commas
function formatThousands(value) {
  var num = Number(value);
  if (!isFinite(num)) {
    return '—';
  }

  var digits = String(Math.round(num));
  var isNegative = false;
  if (digits.charAt(0) === '-') {
    isNegative = true;
    digits = digits.slice(1);
  }

  var result = '';
  var length = digits.length;
  for (var i = 0; i < length; i++) {
    if (i > 0 && (length - i) % 3 === 0) {
      result += ',';
    }
    result += digits.charAt(i);
  }

  return isNegative ? '-' + result : result;
}
/* End - own code */


// Based on the template's axis helpers.
/* Start - own code */
// Draws the chart border
function drawAxis(layout, colour) {
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
  if (isShortChart()) return;

  push();
  var textCol = typeof SATheme !== 'undefined' ? SATheme.text : 245;
  fill(textCol);
  noStroke();
  textAlign('center', 'center');

  text(xLabel,
       (layout.plotWidth() / 2) + layout.leftMargin,
       layout.bottomMargin + (layout.marginSize * 1.5));

  translate(layout.leftMargin - (layout.marginSize * 1.5),
            layout.bottomMargin / 2);
  rotate(- PI / 2);
  text(yLabel, 0, 0);
  pop();
}

function drawYAxisTickLabels(min, max, layout, mapFunction,
                             decimalPlaces) {
  var range = max - min;
  var yTickStep = range / layout.numYTickLabels;
  var textCol = typeof SATheme !== 'undefined' ? SATheme.textMuted : 160;
  var gridCol = typeof SATheme !== 'undefined' ? SATheme.grid : 40;

  fill(textCol);
  noStroke();
  textAlign('right', 'center');

  for (var i = 0; i <= layout.numYTickLabels; i++) {
    var value = min + (i * yTickStep);
    var y = mapFunction(value);

    fill(textCol);
    noStroke();
    text(value.toFixed(decimalPlaces),
         layout.leftMargin - layout.pad,
         y);

    if (layout.grid) {
      stroke(gridCol);
      strokeWeight(1);
      line(layout.leftMargin, y, layout.rightMargin, y);
    }
  }
}

function drawXAxisTickLabel(value, layout, mapFunction) {
  var x = mapFunction(value);
  var textCol = typeof SATheme !== 'undefined' ? SATheme.textMuted : 160;
  var gridCol = typeof SATheme !== 'undefined' ? SATheme.grid : 40;

  fill(textCol);
  noStroke();
  textAlign('center', 'center');

  text(value,
       x,
       layout.bottomMargin + layout.marginSize / 2);

  if (layout.grid) {
    stroke(gridCol);
    strokeWeight(1);
    line(x,
         layout.topMargin,
         x,
         layout.bottomMargin);
  }
}
/* End - own code */

/* Start - own code */

function drawBar(x, y, w, h, col) {
  push();
  stroke(typeof SATheme !== 'undefined' ? SATheme.axis : 80);
  strokeWeight(1);
  fill(col);
  rect(x, y, w, h);
  pop();
}

var pendingChartTooltip = null;

// Stores the next chart tooltip
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
  var maxWidth = width - 12;
  var boxWidth = Math.min(textWidth(message) + 20, maxWidth);

  if (textWidth(message) + 20 > maxWidth && extra) {
    message = label + ': ' + value;
    boxWidth = Math.min(textWidth(message) + 20, maxWidth);
  }
  while (message.length > 4 && textWidth(message) + 20 > maxWidth) {
    message = message.slice(0, -2) + '\u2026';
  }

  var boxHeight = 28;
  var pointer = getChartPointer();
  var onTouch = typeof touches !== 'undefined' && touches.length > 0;

  var lift = onTouch ? 58 : 38;
  var boxY = pointer.y - lift;
  if (boxY < 6) {
    boxY = pointer.y + (onTouch ? 30 : 16);
  }

  var boxX = pointer.x + 14;
  if (boxX + boxWidth > width - 6) {
    boxX = pointer.x - 14 - boxWidth;
  }
  boxX = Math.max(6, Math.min(boxX, width - boxWidth - 6));
  boxY = Math.max(6, Math.min(boxY, height - boxHeight - 6));

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
  chartTextSize(11);
  var boxWidth = Math.max(textWidth(main), secondary ? textWidth(secondary) : 0) + 22;
  var boxHeight = secondary ? 36 : 24;
  var boxX = Math.max(6, Math.min(x, width - boxWidth - 6));
  var boxY = Math.max(6, Math.min(y, height - boxHeight - 6));

  push();
  stroke(colour || color(255, 255, 255, 160));
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
    chartTextSize(10);
    fill(212, 212, 216);
    text(secondary, boxX + 10, boxY + 20);
  }
  pop();
}

function drawVerticalReferenceLine(x, top, bottom, colour) {
  if (!annotationsAreVisible()) return;

  push();
  stroke(colour || color(255, 255, 255, 140));
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

// Draws a size key for charts where a mark's width carries the value.
// The caller passes the same mapping function the chart uses, so the key and the
// marks cannot drift apart, and representative values taken from the real data.
// Returns the space used so callers can lay out around it.
function drawSizeLegend(x, y, options) {
  var settings = options || {};
  var values = settings.values || [];
  var diameterFor = settings.diameterFor;

  if (!values.length || typeof diameterFor !== 'function') {
    return { width: 0, height: 0 };
  }

  var formatValue = settings.format || function(value) { return String(value); };
  var titleSize = isPhoneChart() ? 9 : 11;
  var labelSize = isPhoneChart() ? 8 : 10;
  var gap = isPhoneChart() ? 8 : 12;

  push();
  noStroke();
  textAlign(LEFT, TOP);
  chartTextSize(titleSize);
  fill(SATheme.textMuted);

  var titleHeight = 0;
  if (settings.title) {
    text(settings.title, x, y);
    titleHeight = titleSize + 6;
  }

  var diameters = [];
  var largest = 0;
  for (var i = 0; i < values.length; i++) {
    var diameter = Math.max(6, diameterFor(values[i]));
    diameters.push(diameter);
    if (diameter > largest) largest = diameter;
  }

  var baseline = y + titleHeight + (largest / 2);
  var cursorX = x;

  for (var v = 0; v < values.length; v++) {
    var size = diameters[v];
    var centreX = cursorX + (largest / 2);

    stroke(settings.stroke === undefined ? SATheme.axis : settings.stroke);
    strokeWeight(1);
    fill(settings.fill === undefined ? SATheme.withAlpha(SATheme.blueRGB, 150) : settings.fill);
    circle(centreX, baseline, size);

    noStroke();
    fill(SATheme.textMuted);
    textAlign(CENTER, TOP);
    chartTextSize(labelSize);
    text(formatValue(values[v]), centreX, baseline + (largest / 2) + 3);

    cursorX += largest + gap;
  }

  pop();

  return {
    width: Math.max(0, cursorX - gap - x),
    height: titleHeight + largest + labelSize + 5
  };
}

// Picks a small set of representative values spanning a data range, so a size
// key shows real magnitudes rather than invented round numbers.
function sizeLegendValues(minValue, maxValue, count) {
  var wanted = count || 3;
  if (!isFinite(minValue) || !isFinite(maxValue)) return [];
  if (maxValue <= minValue) return [maxValue];

  var values = [];
  for (var i = 0; i < wanted; i++) {
    var value = minValue + ((maxValue - minValue) * (i / (wanted - 1)));
    var rounded = Math.round(value);
    if (values.indexOf(rounded) === -1) values.push(rounded);
  }

  return values;
}

// Draws a swatch key. Used where colour marks a highlight rather than a variable,
// so the reader is told which of the two it is.
function drawColourKey(x, y, items, options) {
  var settings = options || {};
  var list = items || [];
  if (!list.length) return { width: 0, height: 0 };

  var labelSize = isPhoneChart() ? 9 : 11;
  var swatch = 12;
  var rowHeight = swatch + 8;
  var widest = 0;

  push();
  chartTextSize(labelSize);

  if (settings.title) {
    noStroke();
    fill(SATheme.textMuted);
    textAlign(LEFT, TOP);
    text(settings.title, x, y);
    y += labelSize + 5;
  }

  for (var i = 0; i < list.length; i++) {
    var rowY = y + (i * rowHeight);

    fill(list[i].colour);
    stroke(SATheme.axis);
    strokeWeight(1);
    rect(x, rowY, swatch, swatch);

    noStroke();
    fill(SATheme.textMuted);
    textAlign(LEFT, CENTER);
    text(list[i].label, x + swatch + 6, rowY + (swatch / 2));

    widest = Math.max(widest, swatch + 6 + textWidth(list[i].label));
  }

  pop();

  return { width: widest, height: list.length * rowHeight };
}

// Draws a colour ramp with its numeric end points, so a shaded encoding can be
// read as a quantity instead of a vague "darker means more".
function drawColourRampKey(x, y, options) {
  var settings = options || {};
  var colourFor = settings.colourFor;
  if (typeof colourFor !== 'function') return { width: 0, height: 0 };

  var steps = settings.steps || 5;
  var swatchWidth = isPhoneChart() ? 16 : 20;
  var swatchHeight = 14;
  var labelSize = isPhoneChart() ? 9 : 10;
  var lowValue = settings.lowValue;
  var highValue = settings.highValue;
  var formatValue = settings.format || function(value) { return String(value); };

  push();
  chartTextSize(labelSize);
  noStroke();
  textAlign(LEFT, CENTER);
  fill(SATheme.textMuted);

  var cursorX = x;
  if (settings.title) {
    text(settings.title, cursorX, y + (swatchHeight / 2));
    cursorX += textWidth(settings.title) + 8;
  }

  var lowLabel = formatValue(lowValue);
  textAlign(RIGHT, CENTER);
  text(lowLabel, cursorX + textWidth(lowLabel), y + (swatchHeight / 2));
  cursorX += textWidth(lowLabel) + 6;

  for (var i = 0; i < steps; i++) {
    var position = steps === 1 ? 0 : (i / (steps - 1));
    fill(colourFor(lowValue + ((highValue - lowValue) * position), position));
    stroke(SATheme.axis);
    strokeWeight(1);
    rect(cursorX + (i * swatchWidth), y, swatchWidth, swatchHeight);
  }
  cursorX += steps * swatchWidth;

  noStroke();
  fill(SATheme.textMuted);
  textAlign(LEFT, CENTER);
  text(formatValue(highValue), cursorX + 6, y + (swatchHeight / 2));
  cursorX += 6 + textWidth(formatValue(highValue));

  pop();

  return { width: cursorX - x, height: swatchHeight };
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

// Gets data ready for export
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

// Downloads chart data as CSV
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

/* End - own code */
