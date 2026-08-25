
// ---- State ----

// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;
var chartCanvas;   // p5 canvas element mounted inside #chart-container

// ---- Canvas sizing & layout ----

// Measure the chart card so the canvas fills it, with sensible fallbacks
// (window size minus the sidebar / header) and minimum dimensions.
function getChartCanvasSize() {
  var chartContainer = document.getElementById('chart-container');
  var width = chartContainer && chartContainer.clientWidth
      ? chartContainer.clientWidth
      : windowWidth - 320;   // fallback: window minus sidebar width
  var height = chartContainer && chartContainer.clientHeight
      ? chartContainer.clientHeight
      : windowHeight - 140;  // fallback: window minus header height

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

// Recompute a visualisation's layout margins after a resize so its plot
// keeps filling the current canvas.
function refreshVisualLayout(vis) {
  if (vis.layout) {
    if (vis.layout.hasOwnProperty('rightMargin')) {
      vis.layout.rightMargin = width - (vis.layout.rightPadding || vis.layout.marginSize || 0);
    }
    if (vis.layout.hasOwnProperty('bottomMargin')) {
      vis.layout.bottomMargin = height - (vis.layout.bottomPadding || ((vis.layout.marginSize || 0) * 2));
    }
  }

  // sa-sex-age-2022 spans the full canvas width, so override the shared margins.
  if (vis.id == 'sa-sex-age-2022') {
    vis.layout.rightMargin = width - 12;
    vis.layout.bottomMargin = height;
    vis.midX = (vis.layout.plotWidth() / 2) + vis.layout.leftMargin;
  }

  // Pie-chart visualisations recentre and rescale their pie on resize.
  if (vis.pie) {
    var diameter = Math.min(width * 0.34, height * 0.68);
    vis.pie.x = Math.max((diameter / 2) + 20, width * 0.34);
    vis.pie.y = height / 2;
    vis.pie.diameter = diameter;
  }
}

// ---- p5 lifecycle ----

function setup() {
  var urlParams = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  if (urlParams && urlParams.get('embedded') === '1') {
    document.body.classList.add('embedded-chart');
  }

  // Create a canvas for the chart card from index.html.
  var size = getChartCanvasSize();
  chartCanvas = createCanvas(size.width, size.height);
  chartCanvas.parent('chart-container');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new ZAGiniTrend());
  gallery.addVisual(new ZAPopulationGroupEarnings());
  gallery.addVisual(new ZADwellingOwnershipByGroup());
  gallery.addVisual(new ZALandOwnershipByGroup());
  gallery.addVisual(new ZAIncomeShareTrend());
  gallery.addVisual(new ZAOwnershipComparison());
  gallery.addVisual(new ZAPovertyContext());
  gallery.addVisual(new SurveyPressureIndex());
  gallery.addVisual(new SurveyFoodTransportBurden());
  gallery.addVisual(new SurveyPressureWaffle());
  gallery.addVisual(new SurveyCutbackHeatmap());
  gallery.addVisual(new SurveyIncomeRealityGap());
  gallery.addVisual(new SurveyStatusPressure());

  // Archived: earlier drafts of the project, kept for reference below the
  // survey section rather than deleted outright.
  gallery.addVisual(new SAPopulationGroupCensus());
  gallery.addVisual(new SAPopulationSexAge2022());
  gallery.addVisual(new SAAgeSexBubble2022());
  gallery.addVisual(new SAYouthUnemployment());
  gallery.addVisual(new SALifeExpectancy());
  gallery.addVisual(new ClimateChange());

  gallery.buildOverviewCards();

  var visParam = urlParams ? urlParams.get('vis') : null;
  var secParam = urlParams ? urlParams.get('section') : null;
  var aboutParam = urlParams ? urlParams.get('about') : null;
  var mobileParam = urlParams ? urlParams.get('mobile') : null;
  var focusParam = urlParams ? urlParams.get('focus') : null;

  var hashRoute = gallery.parseHash();

  if (hashRoute && hashRoute.type === 'tour' && !gallery.isEmbedded) {
    var tourIndex = gallery.tourSteps.findIndex(function(step) {
      return step.id === hashRoute.stepId;
    });
    gallery.showTourStep(tourIndex, true);
  } else if (hashRoute && hashRoute.type === 'compare' && !gallery.isEmbedded) {
    gallery.openComparison(hashRoute.left, hashRoute.right, true);
  } else if (hashRoute && hashRoute.type === 'visual' && !visParam) {
    gallery.selectVisual(hashRoute.id, true);
    if (aboutParam === '1') {
      gallery.toggleAboutPanel(true);
    }
  } else if (visParam) {
    gallery.selectVisual(visParam);
    if (aboutParam === '1') {
      gallery.toggleAboutPanel(true);
    }
  } else if (secParam) {
    gallery.selectSection(secParam);
  } else {
    gallery.showOverview();
  }

  if (mobileParam === '1') {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.add('open');
  }

  if (focusParam === '1') {
    var firstBtn = document.querySelector('.section-tab-btn');
    if (firstBtn) firstBtn.focus();
  }
}

function draw() {
  if (gallery && gallery.selectedVisual != null) {
    background(255);
    gallery.selectedVisual.draw();
  }
}

function windowResized() {
  resizeChartCanvas();
}
