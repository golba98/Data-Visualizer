
var gallery;
var chartCanvas;
var chartResizeFrame = null;
var chartLoopStartedAt = 0;


// Finds the best canvas size
function getChartCanvasSize() {
  var container = document.getElementById('chart-container');
  var targetWidth = 0;
  var targetHeight = 0;

  if (container && container.clientWidth > 0) {
    targetWidth = container.clientWidth;
  } else if (typeof windowWidth !== 'undefined') {
    targetWidth = windowWidth < 820 ? (windowWidth - 40) : (windowWidth - 320);
  } else {
    targetWidth = 800;
  }

  if (container && container.clientHeight > 0) {
    targetHeight = container.clientHeight;
  } else if (typeof windowHeight !== 'undefined') {
    targetHeight = windowHeight - 140;
  } else {
    targetHeight = 500;
  }

  return {
    width: Math.max(280, Math.floor(targetWidth)),
    height: Math.max(240, Math.floor(targetHeight))
  };
}

// Resizes and redraws the chart
function resizeChartCanvas() {
  var dimensions = getChartCanvasSize();
  resizeCanvas(dimensions.width, dimensions.height, true);

  if (gallery && gallery.selectedVisual) {
    refreshVisualLayout(gallery.selectedVisual);
    requestChartRender();
  }
}

// Draws one frame or starts animation
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

function queueChartResize() {
  if (chartResizeFrame != null) cancelAnimationFrame(chartResizeFrame);
  chartResizeFrame = requestAnimationFrame(function() {
    chartResizeFrame = null;
    resizeChartCanvas();
  });
}

function refreshVisualLayout(vis) {
  if (!vis || !vis.layout) {
    if (vis && typeof vis.onResize === 'function') {
      vis.onResize();
    }
    return;
  }

  if (!vis.layout.responsiveDefaults) {
    vis.layout.responsiveDefaults = {
      marginSize: vis.layout.marginSize,
      leftMargin: vis.layout.leftMargin,
      topMargin: vis.layout.topMargin,
      rightPadding: vis.layout.rightPadding,
      bottomPadding: vis.layout.bottomPadding,
      numXTickLabels: vis.layout.numXTickLabels,
      numYTickLabels: vis.layout.numYTickLabels
    };
  }

  var base = vis.layout.responsiveDefaults;
  var isPhone = isPhoneChart();
  var isShort = isShortChart();

  if (isPhone) {
    if ('marginSize' in vis.layout) vis.layout.marginSize = 28;
    if ('leftMargin' in vis.layout) vis.layout.leftMargin = Math.min(base.leftMargin || 56, 56);
    if ('numXTickLabels' in vis.layout) vis.layout.numXTickLabels = Math.min(base.numXTickLabels || 4, 4);
    if ('numYTickLabels' in vis.layout) vis.layout.numYTickLabels = Math.min(base.numYTickLabels || 5, 5);
  } else {
    if (base.marginSize !== undefined) vis.layout.marginSize = base.marginSize;
    if (base.leftMargin !== undefined) vis.layout.leftMargin = base.leftMargin;
    if (base.numXTickLabels !== undefined) vis.layout.numXTickLabels = base.numXTickLabels;
    if (base.numYTickLabels !== undefined) vis.layout.numYTickLabels = base.numYTickLabels;
  }

  if (isShort) {
    if ('topMargin' in vis.layout) vis.layout.topMargin = Math.min(base.topMargin || 88, 88);
    if ('marginSize' in vis.layout) vis.layout.marginSize = Math.min(base.marginSize || 24, 24);
    if ('numYTickLabels' in vis.layout) vis.layout.numYTickLabels = Math.min(vis.layout.numYTickLabels || 4, 4);
  } else if ('topMargin' in vis.layout && base.topMargin !== undefined) {
    vis.layout.topMargin = base.topMargin;
  }

  if ('rightMargin' in vis.layout) {
    vis.layout.rightMargin = width - (isPhone ? 18 : (base.rightPadding || vis.layout.marginSize || 0));
  }
  if ('bottomMargin' in vis.layout) {
    var bottomPad = isShort ? 52 : (isPhone ? 58 : (base.bottomPadding || ((vis.layout.marginSize || 0) * 2)));
    vis.layout.bottomMargin = height - bottomPad;
  }

  if (typeof vis.onResize === 'function') {
    vis.onResize();
  }
}


// Starts the canvas and chart gallery
function setup() {
  var urlParams = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  if (urlParams && urlParams.get('embedded') === '1') {
    document.body.classList.add('embedded-chart');
  }

  var size = getChartCanvasSize();
  chartCanvas = createCanvas(size.width, size.height);
  chartCanvas.parent('chart-container');

  gallery = new Gallery();

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
    gallery.openMobileMenu();
  }

  if (focusParam === '1') {
    var firstBtn = document.querySelector('.section-tab-btn');
    if (firstBtn) firstBtn.focus();
  }
}

// Draws the selected chart
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

function touchEnded() {
  if (gallery && gallery.selectedVisual) requestChartRender();
}

function windowResized() {
  queueChartResize();
}
