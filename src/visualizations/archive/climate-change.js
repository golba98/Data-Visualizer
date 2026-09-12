// Draws the temperature anomaly trend
function ClimateChange() {

  // Template: the menu name, changed.
  /* Start - own code */
  this.name = 'Global temperature anomaly';
  /* End - own code */
  this.id = 'climate-change';

  this.xAxisLabel = 'year';
  // Template: the y-axis label, changed.
  /* Start - own code */
  this.yAxisLabel = '°C';
  /* End - own code */

  var marginSize = 35;

  this.layout = {
    marginSize: marginSize,

    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    grid: false,

    numXTickLabels: 8,
    numYTickLabels: 8,
  };

  // Replaces the template's loaded flag.
  /* Start - own code */
  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading temperature data...'
  });
  /* End - own code */

  // Based on the template's preload().
  /* Start - own code */
  this.preload = function() {
    var self = this;
    this.loadState.loadTables([{
      path: './data/archive/global_temperature_anomaly_1880_2025.csv',
      requiredColumns: ['year', 'temperature_anomaly_c'],
      numericColumns: ['year', 'temperature_anomaly_c'],
      assign: function(table) { self.data = table; }
    }]);
  };
  /* End - own code */

  // Based on the template's setup().
  /* Start - own code */
  this.setup = function() {
    if (!this.loaded) {
      debugLog('Data not yet loaded');
      return;
    }

    chartTextSize(16);
    textAlign('center', 'center');

    this.minYear = this.data.getNum(0, 'year');
    this.maxYear = this.data.getNum(this.data.getRowCount() - 1, 'year');

    this.minTemperature = min(this.data.getColumn('temperature_anomaly_c'));
    this.maxTemperature = max(this.data.getColumn('temperature_anomaly_c'));

    this.meanTemperature = mean(this.data.getColumn('temperature_anomaly_c'));

    this.frameCount = 0;

    var controls = document.getElementById('chart-controls');
    this.startLabel = document.createElement('label');
    this.startLabel.textContent = 'Start';
    controls.appendChild(this.startLabel);

    this.startSlider = createSlider(this.minYear,
                                    this.maxYear - 1,
                                    this.minYear,
                                    1);
    this.startSlider.parent(this.startLabel);

    var self = this;

    this.startInput = document.createElement('input');
    this.startInput.type = 'number';
    this.startInput.min = this.minYear;
    this.startInput.max = this.maxYear - 1;
    this.startInput.value = this.minYear;
    this.startInput.className = 'year-number-input';
    this.startInput.setAttribute('aria-label', 'Start year');
    this.startLabel.appendChild(this.startInput);

    this.endLabel = document.createElement('label');
    this.endLabel.textContent = 'End';
    controls.appendChild(this.endLabel);

    this.endSlider = createSlider(this.minYear + 1,
                                  this.maxYear,
                                  this.maxYear,
                                  1);
    this.endSlider.parent(this.endLabel);

    this.endInput = document.createElement('input');
    this.endInput.type = 'number';
    this.endInput.min = this.minYear + 1;
    this.endInput.max = this.maxYear;
    this.endInput.value = this.maxYear;
    this.endInput.className = 'year-number-input';
    this.endInput.setAttribute('aria-label', 'End year');
    this.endLabel.appendChild(this.endInput);

    // Synchronise slider -> input and input -> slider
    this.startSlider.input(function() {
      var val = self.startSlider.value();
      if (val >= self.endSlider.value()) {
        val = self.endSlider.value() - 1;
        self.startSlider.value(val);
      }
      self.startInput.value = val;
      self.restartAnimation();
      if (typeof redraw === 'function') redraw();
    });

    this.endSlider.input(function() {
      var val = self.endSlider.value();
      if (val <= self.startSlider.value()) {
        val = self.startSlider.value() + 1;
        self.endSlider.value(val);
      }
      self.endInput.value = val;
      self.restartAnimation();
      if (typeof redraw === 'function') redraw();
    });

    this.startInput.addEventListener('change', function() {
      var val = parseInt(self.startInput.value, 10);
      if (isNaN(val) || val < self.minYear) val = self.minYear;
      if (val >= self.endSlider.value()) val = self.endSlider.value() - 1;
      self.startInput.value = val;
      self.startSlider.value(val);
      self.restartAnimation();
      if (typeof redraw === 'function') redraw();
    });

    this.endInput.addEventListener('change', function() {
      var val = parseInt(self.endInput.value, 10);
      if (isNaN(val) || val > self.maxYear) val = self.maxYear;
      if (val <= self.startSlider.value()) val = self.startSlider.value() + 1;
      self.endInput.value = val;
      self.endSlider.value(val);
      self.restartAnimation();
      if (typeof redraw === 'function') redraw();
    });
  };
  /* End - own code */

  /* Start - own code */
  // Two coupled sliders with no way back to the full range: the one chart where
  // a reset is genuinely useful. Restores the documented default, which is the
  // whole series, without reloading the visualisation.
  this.resetControls = function() {
    if (!this.startSlider || !this.endSlider) return;

    this.startSlider.value(this.minYear);
    this.endSlider.value(this.maxYear);
    if (this.startInput) this.startInput.value = this.minYear;
    if (this.endInput) this.endInput.value = this.maxYear;
    this.startYear = this.minYear;
    this.endYear = this.maxYear;
    this.restartAnimation();
  };

  // Lets the accessible summary refresh when the year range changes.
  this.summaryKey = function() {
    if (!this.startSlider || !this.endSlider) return '';
    return this.startSlider.value() + '-' + this.endSlider.value();
  };

  this.restartAnimation = function() {
    this.frameCount = 0;
  };

  this.isAnimating = function() {
    return this.frameCount <= (this.endYear || this.maxYear) - (this.startYear || this.minYear);
  };
  /* End - own code */

  // Based on the template's destroy().
  /* Start - own code */
  this.destroy = function() {
    this.loadState.destroy();
    if (this.startSlider) {
      this.startSlider.remove();
      this.startSlider = null;
    }
    if (this.endSlider) {
      this.endSlider.remove();
      this.endSlider = null;
    }
    if (this.startInput) {
      this.startInput.remove();
      this.startInput = null;
    }
    if (this.endInput) {
      this.endInput.remove();
      this.endInput = null;
    }
    if (this.startLabel) {
      this.startLabel.remove();
      this.startLabel = null;
    }
    if (this.endLabel) {
      this.endLabel.remove();
      this.endLabel = null;
    }
  };
  /* End - own code */

  // Based on the template's draw().
  /* Start - own code */
  this.draw = function() {
    if (this.loadState.draw()) return;

    if (!this.startSlider || !this.endSlider) {
      this.setup();
      return;
    }

    if (this.startSlider.value() >= this.endSlider.value()) {
      this.startSlider.value(this.endSlider.value() - 1);
    }
    this.startYear = this.startSlider.value();
    this.endYear = this.endSlider.value();
    if (this.startInput && document.activeElement !== this.startInput) {
      this.startInput.value = this.startYear;
    }
    if (this.endInput && document.activeElement !== this.endInput) {
      this.endInput.value = this.endYear;
    }

    drawYAxisTickLabels(this.minTemperature,
                        this.maxTemperature,
                        this.layout,
                        this.mapValueToHeight.bind(this),
                        1);

    drawAxis(this.layout);

    // On phones the colour key sits where the x-axis title would go, and the
    // year tick labels already name the axis.
    drawAxisLabels(isPhoneChart() ? '' : this.xAxisLabel,
                   this.yAxisLabel,
                   this.layout);

    stroke(SATheme.axis);
    strokeWeight(1);
    line(this.layout.leftMargin,
         this.mapValueToHeight(this.meanTemperature),
         this.layout.rightMargin,
         this.mapValueToHeight(this.meanTemperature));

    var previous;
    var numYears = this.endYear - this.startYear;
    var segmentWidth = this.layout.plotWidth() / numYears;

    var yearCount = 0;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var current = {
        'year': this.data.getNum(i, 'year'),
        'temperature': this.data.getNum(i, 'temperature_anomaly_c')
      };

      if (previous != null
          && current.year > this.startYear
          && current.year <= this.endYear) {
        noStroke();
        fill(this.mapTemperatureToColour(current.temperature));
        rect(this.mapYearToWidth(previous.year),
             this.layout.topMargin,
             segmentWidth,
             this.layout.plotHeight());

        stroke(SATheme.text);
        line(this.mapYearToWidth(previous.year),
             this.mapValueToHeight(previous.temperature),
             this.mapYearToWidth(current.year),
             this.mapValueToHeight(current.temperature));

        var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

        if (yearCount % xLabelSkip == 0) {
          drawXAxisTickLabel(previous.year, this.layout,
                             this.mapYearToWidth.bind(this));
        }

        if ((numYears <= 6
             && yearCount == numYears - 1)) {
          drawXAxisTickLabel(current.year, this.layout,
                             this.mapYearToWidth.bind(this));
        }

        yearCount++;
      }

      if (yearCount >= this.frameCount) {
        break;
      }

      previous = current;
    }

    this.drawColourKey();

    this.frameCount++;
  };
  /* End - own code */

  /* Start - own code */
  this.drawColourKey = function() {
    var self = this;

    drawColourRampKey(this.layout.leftMargin, this.layout.bottomMargin + 34, {
      title: isPhoneChart() ? 'Column' : 'Column colour = anomaly',
      lowValue: this.minTemperature,
      highValue: this.maxTemperature,
      steps: 5,
      format: function(value) { return value.toFixed(1) + '\u00b0C'; },
      colourFor: function(value) { return self.mapTemperatureToColour(value); }
    });
  };
  /* End - own code */

  this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,
               this.layout.rightMargin);
  };

  // Template: mapTemperatureToHeight(), renamed.
  /* Start - own code */
  this.mapValueToHeight = function(value) {
  /* End - own code */
    return map(value,
               this.minTemperature,
               this.maxTemperature,
               this.layout.bottomMargin,
               this.layout.topMargin);
  };

  this.mapTemperatureToColour = function(value) {
    var red = map(value,
                   this.minTemperature,
                   this.maxTemperature,
                   0,
                   255);
    var blue = 255 - red;
    return color(red, 0, blue, 100);
  };

  // New method.
  /* Start - own code */
  this.getExportData = function() {
    return tableToExportData(this.data);
  };
  /* End - own code */
}
