
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;
var chartCanvas;

function getChartCanvasSize() {
  var chartContainer = document.getElementById('chart-container');
  var width = chartContainer && chartContainer.clientWidth
      ? chartContainer.clientWidth
      : windowWidth - 320;
  var height = chartContainer && chartContainer.clientHeight
      ? chartContainer.clientHeight
      : windowHeight - 140;

  return {
    width: Math.max(300, Math.floor(width)),
    height: Math.max(240, Math.floor(height))
  };
}

function resizeChartCanvas() {
  var size = getChartCanvasSize();
  // Avoid p5 drawing part-way through a view switch before controls exist.
  resizeCanvas(size.width, size.height, true);

  if (gallery && gallery.selectedVisual) {
    refreshVisualLayout(gallery.selectedVisual);
  }
}

function refreshVisualLayout(vis) {
  if (vis.layout) {
    if (vis.layout.hasOwnProperty('rightMargin')) {
      vis.layout.rightMargin = width - (vis.layout.marginSize || 0);
    }
    if (vis.layout.hasOwnProperty('bottomMargin')) {
      vis.layout.bottomMargin = height - ((vis.layout.marginSize || 0) * 2);
    }
  }

  if (vis.id == 'sa-sex-age-2022') {
    vis.layout.rightMargin = width - 12;
    vis.layout.bottomMargin = height;
    vis.midX = (vis.layout.plotWidth() / 2) + vis.layout.leftMargin;
  }

  if (vis.pie) {
    var diameter = Math.min(width * 0.34, height * 0.68);
    vis.pie.x = Math.max((diameter / 2) + 20, width * 0.34);
    vis.pie.y = height / 2;
    vis.pie.diameter = diameter;
  }
}

function setup() {
  // Create a canvas for the chart card from index.html.
  var size = getChartCanvasSize();
  chartCanvas = createCanvas(size.width, size.height);
  chartCanvas.parent('chart-container');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new SAPopulationGroupCensus());
  gallery.addVisual(new SAPopulationSexAge2022());
  gallery.addVisual(new SAAgeSexBubble2022());
  gallery.addVisual(new SAYouthUnemployment());
  gallery.addVisual(new ClimateChange());
  gallery.buildOverviewCards();
  gallery.showOverview();
}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}

function windowResized() {
  resizeChartCanvas();
}
