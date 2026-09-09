// Draws the temperature anomaly trend
function ClimateChange() {

  this.name = 'Global temperature anomaly';
  this.id = 'climate-change';

  this.xAxisLabel = 'year';
  this.yAxisLabel = '°C';

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

  this.loadState = new VisualizationLoadState(this, {
    loadingMessage: 'Loading temperature data...'
  });

  this.preload = function() {
    var self = this;
    this.loadState.loadTables([{
      path: './data/archive/global_temperature_anomaly_1880_2025.csv',
      requiredColumns: ['year', 'temperature_anomaly_c'],
      numericColumns: ['year', 'temperature_anomaly_c'],
      assign: function(table) { self.data = table; }
    }]);
  };

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
    this.startValue = document.createElement('span');
    this.startValue.className = 'control-value';
    this.startLabel.appendChild(this.startValue);

    this.endLabel = document.createElement('label');
    this.endLabel.textContent = 'End';
    controls.appendChild(this.endLabel);

    this.endSlider = createSlider(this.minYear + 1,
                                  this.maxYear,
                                  this.maxYear,
                                  1);
    this.endSlider.parent(this.endLabel);
    this.endValue = document.createElement('span');
    this.endValue.className = 'control-value';
    this.endLabel.appendChild(this.endValue);
  };

  // Two coupled sliders with no way back to the full range: the one chart where
  // a reset is genuinely useful. Restores the documented default, which is the
  // whole series, without reloading the visualisation.
  this.resetControls = function() {
    if (!this.startSlider || !this.endSlider) return;

    this.startSlider.value(this.minYear);
    this.endSlider.value(this.maxYear);
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
    if (this.startLabel) {
      this.startLabel.remove();
      this.startLabel = null;
    }
    if (this.endLabel) {
      this.endLabel.remove();
      this.endLabel = null;
    }
  };

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
    this.startValue.textContent = this.startYear;
    this.endValue.textContent = this.endYear;

    drawYAxisTickLabels(this.minTemperature,
                        this.maxTemperature,
                        this.layout,
                        this.mapValueToHeight.bind(this),
                        1);

    drawAxis(this.layout);

    drawAxisLabels(this.xAxisLabel,
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

  this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,
               this.layout.rightMargin);
  };

  this.mapValueToHeight = function(value) {
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

  this.getExportData = function() {
    return tableToExportData(this.data);
  };
}
