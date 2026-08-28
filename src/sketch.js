
// State

// Global variable to store the gallery object.
var gallery;
var chartCanvas;
var chartResizeFrame = null;
var chartLoopStartedAt = 0;

// Canvas sizing & layout

// Measure the chart card so the canvas fills it, with sensible fallbacks (window size minus the sidebar / header) and minimum dimensions.
function getChartCanvasSize() {
  var chartContainer = document.getElementById('chart-container');
  var width = chartContainer && chartContainer.clientWidth
      ? chartContainer.clientWidth
      : windowWidth - 320;   // fallback: window minus sidebar width
  var height = chartContainer && chartContainer.clientHeight
      ? chartContainer.clientHeight
      : windowHeight - 140;  // fallback: window minus header height

  return {
    // On very small phones the old 300px minimum could make the canvas wider than its card.
    width: Math.max(1, Math.floor(width)),
    height: Math.max(240, Math.floor(height))
  };
}

function resizeChartCanvas() {
  var size = getChartCanvasSize();
  // Avoid p5 drawing part-way through a view switch before controls exist.
  resizeCanvas(size.width, size.height, true);

  if (gallery && gallery.selectedVisual) {
    refreshVisualLayout(gallery.selectedVisual);
    requestChartRender();
  }
}

function requestChartRender(animate) {
  if (animate) {
    chartLoopStartedAt = typeof millis === 'function' ? millis() : 0;
    loop();
  } else {
    redraw();
  }
}

function chartNeedsMoreFrames(vis) {
  if (!vis) return false;
  if (typeof vis.isAnimating === 'function' && vis.isAnimating()) return true;
  if (vis.pie && typeof vis.pie.isAnimating === 'function' && vis.pie.isAnimating()) return true;

  var waitingForData = vis.isLoading === true || (vis.loaded === false && !vis.loadError);
  return waitingForData && millis() - chartLoopStartedAt < 10000;
}

// Views are hidden while their content is being changed.
function queueChartResize() {
  if (chartResizeFrame != null) cancelAnimationFrame(chartResizeFrame);
  chartResizeFrame = requestAnimationFrame(function() {
    chartResizeFrame = null;
    resizeChartCanvas();
  });
}

// Recompute a visualisation's layout margins after a resize so its plot keeps filling the current canvas.
function refreshVisualLayout(vis) {
  if (vis.layout) {
    if (!vis.layout.responsiveDefaults) {
      vis.layout.responsiveDefaults = {
        marginSize: vis.layout.marginSize,
        leftMargin: vis.layout.leftMargin,
        rightPadding: vis.layout.rightPadding,
        bottomPadding: vis.layout.bottomPadding,
        numXTickLabels: vis.layout.numXTickLabels,
        numYTickLabels: vis.layout.numYTickLabels
      };
    }

    var defaults = vis.layout.responsiveDefaults;
    var phoneLayout = width < 520;
    if (phoneLayout) {
      if (vis.layout.hasOwnProperty('marginSize')) vis.layout.marginSize = 28;
      if (vis.layout.hasOwnProperty('leftMargin')) {
        vis.layout.leftMargin = Math.min(defaults.leftMargin || 56, 56);
      }
      if (vis.layout.hasOwnProperty('numXTickLabels')) {
        vis.layout.numXTickLabels = Math.min(defaults.numXTickLabels || 4, 4);
      }
      if (vis.layout.hasOwnProperty('numYTickLabels')) {
        vis.layout.numYTickLabels = Math.min(defaults.numYTickLabels || 5, 5);
      }
    } else {
      if (defaults.marginSize !== undefined) vis.layout.marginSize = defaults.marginSize;
      if (defaults.leftMargin !== undefined) vis.layout.leftMargin = defaults.leftMargin;
      if (defaults.numXTickLabels !== undefined) vis.layout.numXTickLabels = defaults.numXTickLabels;
      if (defaults.numYTickLabels !== undefined) vis.layout.numYTickLabels = defaults.numYTickLabels;
    }

    if (vis.layout.hasOwnProperty('rightMargin')) {
      vis.layout.rightMargin = width - (phoneLayout
        ? 18
        : (defaults.rightPadding || vis.layout.marginSize || 0));
    }
    if (vis.layout.hasOwnProperty('bottomMargin')) {
      vis.layout.bottomMargin = height - (phoneLayout
        ? 58
        : (defaults.bottomPadding || ((vis.layout.marginSize || 0) * 2)));
    }
  }

  // sa-sex-age-2022 spans the full canvas width, so override the shared margins.
  if (vis.id == 'sa-sex-age-2022') {
    vis.layout.leftMargin = width < 520 ? 62 : 130;
    vis.layout.rightMargin = width - 12;
    vis.layout.bottomMargin = height - (width < 520 ? 12 : 0);
    vis.midX = (vis.layout.plotWidth() / 2) + vis.layout.leftMargin;
  }

  if (vis.id == 'sa-age-sex-bubble-2022') {
    vis.pad = width < 520 ? 48 : 58;
    vis.dotSizeMax = width < 520 ? 34 : 42;
  }

  // Pie-chart visualisations recentre and rescale their pie on resize.
  if (vis.pie) {
    var phonePie = width < 520;
    var diameter = phonePie
      ? Math.min(width - 64, height * 0.46)
      : Math.min(width * 0.34, height * 0.68);
    vis.pie.x = phonePie ? width / 2 : Math.max((diameter / 2) + 20, width * 0.34);
    vis.pie.y = phonePie ? Math.max((diameter / 2) + 24, height * 0.32) : height / 2;
    vis.pie.diameter = diameter;
  }
}

// p5 lifecycle

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

  // Archived: earlier drafts of the project, kept for reference below the survey section rather than deleted outright.
  gallery.addVisual(new SAPopulationGroupCensus());
  gallery.addVisual(new SAPopulationSexAge2022());
  gallery.addVisual(new SAAgeSexBubble2022());
  gallery.addVisual(new SAYouthUnemployment());
  gallery.addVisual(new SALifeExpectancy());
  gallery.addVisual(new ClimateChange());

  gallery.buildOverviewCards();

  var controls = document.getElementById('chart-controls');
  controls.addEventListener('input', function() {
    if (gallery.selectedVisual && typeof gallery.selectedVisual.restartAnimation === 'function') {
      gallery.selectedVisual.restartAnimation();
    }
    requestChartRender(true);
  });
  controls.addEventListener('change', function() {
    requestChartRender(true);
  });

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
    background(SATheme.bg);
    clearChartTooltip();
    gallery.selectedVisual.draw();
    drawPendingChartTooltip();
    if (!chartNeedsMoreFrames(gallery.selectedVisual)) noLoop();
  }
}

function mouseMoved() {
  if (gallery && gallery.selectedVisual) requestChartRender();
}

function mouseDragged() {
  if (gallery && gallery.selectedVisual) requestChartRender();
}

function touchStarted() {
  if (gallery && gallery.selectedVisual) requestChartRender();
}

function windowResized() {
  queueChartResize();
}
