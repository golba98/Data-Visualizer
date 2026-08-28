// Topic 8 -- software testing for this project.

(function(global) {
  'use strict';

  // Test harness

  function AssertionError(message) {
    this.name = 'AssertionError';
    this.message = message;
  }
  AssertionError.prototype = Object.create(Error.prototype);

  function TestRunner() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
    this.total = 0;
    this.currentSuite = 'general';
  }

  TestRunner.prototype.suite = function(name) {
    this.currentSuite = name;
  };

  // Run one test.
  TestRunner.prototype.test = function(name, testFunction) {
    this.total++;

    var record = {
      suite: this.currentSuite,
      name: name,
      passed: false,
      message: ''
    };

    try {
      testFunction();
      record.passed = true;
      this.passed++;
    } catch (error) {
      record.passed = false;
      record.message = (error && error.message) ? error.message : String(error);
      this.failed++;
    }

    this.results.push(record);
    return record;
  };

  // Assertions

  // Values are compared after being made printable, so 3 and '3' are not treated as equal and the failure message shows both types.
  TestRunner.prototype.assertEqual = function(actual, expected, message) {
    if (actual === expected) {
      return;
    }

    throw new AssertionError(
      (message || 'assertEqual failed')
      + ' -- expected: ' + describe(expected)
      + ', actual: ' + describe(actual));
  };

  // Float-tolerant comparison, for anything derived from map()/division.
  TestRunner.prototype.assertClose = function(actual, expected, tolerance, message) {
    var allowed = (tolerance === undefined) ? 1e-9 : tolerance;

    if (typeof actual === 'number'
        && isFinite(actual)
        && Math.abs(actual - expected) <= allowed) {
      return;
    }

    throw new AssertionError(
      (message || 'assertClose failed')
      + ' -- expected: ' + describe(expected)
      + ' (+/- ' + allowed + '), actual: ' + describe(actual));
  };

  TestRunner.prototype.assertTrue = function(value, message) {
    if (value) {
      return;
    }

    throw new AssertionError(
      (message || 'assertTrue failed')
      + ' -- expected a truthy value, actual: ' + describe(value));
  };

  TestRunner.prototype.assertNull = function(value, message) {
    if (value === null) {
      return;
    }

    throw new AssertionError(
      (message || 'assertNull failed')
      + ' -- expected: null, actual: ' + describe(value));
  };

  function describe(value) {
    if (typeof value === 'string') {
      return '"' + value + '"';
    }
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }
    if (typeof value === 'number' && isNaN(value)) {
      return 'NaN';
    }
    if (Array.isArray(value)) {
      return '[' + value.map(describe).join(', ') + ']';
    }

    return String(value);
  }

  // Reporting

  TestRunner.prototype.report = function() {
    var suites = {};

    for (var i = 0; i < this.results.length; i++) {
      var record = this.results[i];
      if (!suites[record.suite]) {
        suites[record.suite] = [];
      }
      suites[record.suite].push(record);
    }

    console.group('CM1010 Topic 8 -- test run');

    Object.keys(suites).forEach(function(suiteName) {
      var records = suites[suiteName];
      var suitePassed = records.filter(function(r) { return r.passed; }).length;

      console.group(suiteName + ' (' + suitePassed + '/' + records.length + ' passed)');

      records.forEach(function(record) {
        if (record.passed) {
          console.log('PASS  ' + record.name);
        } else {
          console.error('FAIL  ' + record.name + '\n      ' + record.message);
        }
      });

      console.groupEnd();
    });

    console.log('Total: ' + this.total
        + '  |  Passed: ' + this.passed
        + '  |  Failed: ' + this.failed);
    console.groupEnd();
  };

  // Test fixtures

  // Build a real p5.Table so the tests exercise the same table API the charts use at runtime, instead of a hand-rolled stand-in.
  function makeTable(headers, rows) {
    var table = new p5.Table();

    for (var h = 0; h < headers.length; h++) {
      table.addColumn(headers[h]);
    }

    for (var r = 0; r < rows.length; r++) {
      var row = table.addRow();

      for (var c = 0; c < headers.length; c++) {
        row.setString(headers[c], String(rows[r][c]));
      }
    }

    return table;
  }

  // Use the first two sanitized Survey App rows.
  var SURVEY_HEADERS = ['id', 'age', 'status', 'pressure', 'cost_increased',
                        'work_worry', 'income_keeps_up', 'transport_cost',
                        'food_cost'];
  var SURVEY_ROWS = [
    [1, '18-21', 'Student', 'Food', 'Yes', 5, 1, 'R0-R300', 'R3000+'],
    [2, '18-21', 'Student', 'Data', 'Yes', 2, 4, 'R0-R300', 'R501-R1000']
  ];

  // The full 2022 column of data/archive/population_group_census_1996_2022.csv, in file order (Black African, Coloured, Indian or Asian, White,...
  var CENSUS_2022_SHARES = ['81.4', '8.2', '2.7', '7.3', '0.4'];

  // Unit tests -- each one calls a real function already used by the app

  function runUnitTests(t) {

    // helper-functions.js : formatThousands
    t.suite('unit: formatThousands (helper-functions.js)');

    t.test('formats a large number with separators', function() {
      t.assertEqual(formatThousands(26663144), '26,663,144',
        'seven-digit population figure');
    });

    t.test('formats a mid-range number', function() {
      t.assertEqual(formatThousands(1234), '1,234',
        'four-digit earnings figure');
    });

    t.test('lowest boundary: zero needs no separator', function() {
      t.assertEqual(formatThousands(0), '0', 'minimum sensible input');
    });

    t.test('boundary either side of the first separator', function() {
      t.assertEqual(formatThousands(999), '999', 'last value with no comma');
      t.assertEqual(formatThousands(1000), '1,000', 'first value with a comma');
    });

    t.test('highest boundary: value at the safe-integer limit', function() {
      t.assertEqual(formatThousands(9007199254740991), '9,007,199,254,740,991',
        'Number.MAX_SAFE_INTEGER');
    });

    t.test('invalid input falls back to an unavailable marker', function() {
      // Chart labels are built straight from this, so a non-numeric cell must not end up rendered to the user as "RNaN".
      t.assertEqual(formatThousands('not a number'), '—',
        'non-numeric string');
      t.assertEqual(formatThousands(undefined), '—', 'missing value');
      t.assertEqual(formatThousands(Infinity), '—', 'non-finite value');
    });

    // helper-functions.js : sum / mean / stringsToNumbers
    t.suite('unit: sum / mean (helper-functions.js)');

    t.test('sum adds a list of numbers', function() {
      t.assertEqual(sum([1, 2, 3, 4]), 10, 'four positive integers');
    });

    t.test('sum coerces the strings a CSV column yields', function() {
      t.assertEqual(sum(['10', '20', '30']), 60, 'numeric strings');
    });

    t.test('lowest boundary: sum of an empty list is zero', function() {
      t.assertEqual(sum([]), 0, 'empty column');
    });

    t.test('sum handles negative values (temperature anomalies)', function() {
      t.assertClose(sum([-0.17, 0.02, 1.28]), 1.13, 1e-9,
        'mixed-sign anomaly values');
    });

    t.test('mean averages a list', function() {
      t.assertEqual(mean([2, 4, 6]), 4, 'three even numbers');
    });

    t.test('mean of a single value is that value', function() {
      t.assertEqual(mean([7]), 7, 'minimum non-empty list');
    });

    t.test('invalid input: mean of an empty list is not a number', function() {
      // Documents the current behaviour so a caller knows it must guard against an empty column before displaying the result.
      t.assertTrue(isNaN(mean([])), 'empty list yields NaN, not 0');
    });

    // survey-pressure-index.js : the three scoring lookups
    t.suite('unit: SurveyPressureIndex scoring (survey-pressure-index.js)');

    var index = new SurveyPressureIndex();

    t.test('getPressureScore returns the weight for a known answer', function() {
      t.assertEqual(index.getPressureScore('Food'), 0.90, 'Food');
      t.assertEqual(index.getPressureScore('Data'), 0.70, 'Data');
    });

    t.test('getPressureScore boundaries: lowest and highest weights', function() {
      t.assertEqual(index.getPressureScore('Data'), 0.70, 'lowest weight in table');
      t.assertEqual(index.getPressureScore('Debt'), 1.00, 'highest weight in table');
    });

    t.test('getPressureScore falls back for an unknown answer', function() {
      t.assertEqual(index.getPressureScore('Childcare'), 0.55, 'answer not in table');
      t.assertEqual(index.getPressureScore(undefined), 0.55, 'missing answer');
    });

    t.test('getFoodScore returns the weight for a known band', function() {
      t.assertEqual(index.getFoodScore('R1001-R2000'), 0.60, 'middle band');
    });

    t.test('getFoodScore boundaries: cheapest and dearest bands', function() {
      t.assertEqual(index.getFoodScore('R501-R1000'), 0.35, 'lowest band');
      t.assertEqual(index.getFoodScore('R3000+'), 1.00, 'highest band');
    });

    t.test('getFoodScore falls back for an unrecognised band', function() {
      t.assertEqual(index.getFoodScore('R99'), 0.25, 'band not in table');
      t.assertEqual(index.getFoodScore(''), 0.25, 'blank cell');
    });

    t.test('getTransportScore boundaries: cheapest and dearest bands', function() {
      t.assertEqual(index.getTransportScore('R0-R300'), 0.20, 'lowest band');
      t.assertEqual(index.getTransportScore('R1500+'), 1.00, 'highest band');
    });

    t.test('getTransportScore falls back for an unrecognised band', function() {
      t.assertEqual(index.getTransportScore('free'), 0.25, 'band not in table');
    });

    // pie-chart.js : get_radians
    t.suite('unit: PieChart.get_radians (pie-chart.js)');

    var pie = new PieChart(0, 0, 100);

    t.test('four equal values give four quarter turns', function() {
      var angles = pie.get_radians([25, 25, 25, 25]);
      t.assertEqual(angles.length, 4, 'one angle per value');
      t.assertClose(angles[0], TWO_PI / 4, 1e-9, 'first slice');
      t.assertClose(angles[3], TWO_PI / 4, 1e-9, 'last slice');
    });

    t.test('a single value takes the whole circle', function() {
      t.assertClose(pie.get_radians([42])[0], TWO_PI, 1e-9, 'only slice');
    });

    t.test('lowest boundary: a zero value gets a zero angle', function() {
      var angles = pie.get_radians([0, 100]);
      t.assertClose(angles[0], 0, 1e-9, 'empty category');
      t.assertClose(angles[1], TWO_PI, 1e-9, 'category holding everything');
    });

    t.test('angles always add up to a full circle', function() {
      var angles = pie.get_radians([81.4, 8.2, 7.3, 2.7]);
      t.assertClose(sum(angles), TWO_PI, 1e-9, 'sum of all slice angles');
    });

    // gallery.js : registry and catalogue lookups
    t.suite('unit: Gallery lookups (gallery.js)');

    t.test('findVisIndex locates a registered visualisation', function() {
      t.assertEqual(gallery.findVisIndex('za-gini-trend'), 0,
        'first visualisation registered in sketch.js');
    });

    t.test('highest boundary: the last registered visualisation', function() {
      var lastIndex = gallery.visuals.length - 1;
      var lastId = gallery.visuals[lastIndex].id;
      t.assertEqual(gallery.findVisIndex(lastId), lastIndex,
        'last visualisation in the registry');
    });

    t.test('findVisIndex returns null for an unknown id', function() {
      t.assertNull(gallery.findVisIndex('no-such-chart'), 'id not registered');
      t.assertNull(gallery.findVisIndex(''), 'empty id');
    });

    t.test('getCatalogueItem returns the metadata for an id', function() {
      var item = gallery.getCatalogueItem('za-land-ownership-by-group');
      t.assertTrue(item !== null, 'metadata found');
      t.assertEqual(item.name, 'Land ownership', 'menu name');
      t.assertEqual(item.title,
        'Agricultural land ownership by population group', 'chart title');
    });

    t.test('getCatalogueItem returns null for an unknown id', function() {
      t.assertNull(gallery.getCatalogueItem('no-such-chart'), 'id not in catalogue');
    });

    t.test('CSV cells are escaped for downloadable chart data', function() {
      t.assertEqual(escapeCSVCell('Food, transport'), '"Food, transport"', 'comma escaped');
      t.assertEqual(escapeCSVCell('say "hello"'), '"say ""hello"""', 'quote escaped');
      t.assertEqual(escapeCSVCell('plain'), 'plain', 'plain cell unchanged');
    });

    t.test('comparison hashes are parsed into two registered chart ids', function() {
      var originalHash = window.location.hash;
      try {
        window.location.hash = '#compare/za-dwelling-ownership-by-group/za-population-group-earnings';
        var route = gallery.parseHash();
        t.assertEqual(route.type, 'compare', 'comparison route detected');
        t.assertEqual(route.left, 'za-dwelling-ownership-by-group', 'left chart id');
        t.assertEqual(route.right, 'za-population-group-earnings', 'right chart id');
      } finally {
        window.location.hash = originalHash;
      }
    });

    t.test('guided story contains the seven primary inequality charts', function() {
      t.assertEqual(gallery.tourSteps.length, 7, 'seven story steps');
      t.assertEqual(gallery.tourSteps[0].id, 'national-context', 'first step id');
      t.assertEqual(gallery.tourSteps[0].visualId, 'za-gini-trend', 'first chart');
      t.assertEqual(gallery.tourSteps[6].id, 'poverty-context', 'last step id');
      t.assertEqual(gallery.tourSteps[6].visualId, 'za-poverty-context', 'last chart');
    });

    t.test('guided story hashes resolve to a known step', function() {
      var originalHash = window.location.hash;
      try {
        window.location.hash = '#tour/income-concentration';
        var route = gallery.parseHash();
        t.assertEqual(route.type, 'tour', 'tour route detected');
        t.assertEqual(route.stepId, 'income-concentration', 'tour step id');
      } finally {
        window.location.hash = originalHash;
      }
    });

    t.test('guided story uses concise presentation copy', function() {
      for (var i = 0; i < gallery.tourSteps.length; i++) {
        t.assertTrue(gallery.tourSteps[i].narrative.length <= 120,
          'story step ' + (i + 1) + ' has a short takeaway');
      }
    });

    t.test('guided story presentation classes toggle together', function() {
      var app = document.getElementById('app');
      var main = document.querySelector('.main-content');

      gallery.setTourLayoutActive(true);
      t.assertTrue(app.classList.contains('story-mode'), 'app enters story mode');
      t.assertTrue(document.body.classList.contains('story-mode'), 'body enters story mode');
      t.assertTrue(main.classList.contains('tour-active'), 'main uses story layout');

      gallery.setTourLayoutActive(false);
      t.assertTrue(!app.classList.contains('story-mode'), 'app leaves story mode');
      t.assertTrue(!document.body.classList.contains('story-mode'), 'body leaves story mode');
      t.assertTrue(!main.classList.contains('tour-active'), 'main restores normal layout');
    });

    t.test('guided story responds to presentation keyboard shortcuts', function() {
      var originalPrevious = gallery.previousTourStep;
      var originalNext = gallery.nextTourStep;
      var originalExit = gallery.exitTour;
      var originalActive = gallery.isTourActive;
      var calls = { previous: 0, next: 0, exit: 0 };

      try {
        gallery.isTourActive = true;
        gallery.previousTourStep = function() { calls.previous += 1; };
        gallery.nextTourStep = function() { calls.next += 1; };
        gallery.exitTour = function() { calls.exit += 1; };

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        t.assertEqual(calls.previous, 1, 'Left Arrow moves to the previous slide');
        t.assertEqual(calls.next, 1, 'Right Arrow moves to the next slide');
        t.assertEqual(calls.exit, 1, 'Escape exits the story');
      } finally {
        gallery.previousTourStep = originalPrevious;
        gallery.nextTourStep = originalNext;
        gallery.exitTour = originalExit;
        gallery.isTourActive = originalActive;
      }
    });

    t.test('annotation visibility defaults to enabled', function() {
      t.assertTrue(gallery.annotationsEnabled, 'annotations start visible');
      t.assertTrue(annotationsAreVisible(), 'annotation helper permits drawing');
    });

    t.test('the page uses one fixed dark theme', function() {
      t.assertEqual(document.getElementById('theme-mode-toggle'), null, 'no theme button');
      t.assertEqual(SATheme.mode, undefined, 'no theme switch state');
      t.assertEqual(document.querySelector('meta[name="color-scheme"]').content, 'dark', 'native dark controls');
    });

    t.test('the chart palette has seven category colours', function() {
      t.assertEqual(SATheme.categorical.length, 7, 'seven chart colours');
      t.assertEqual(new Set(SATheme.categorical).size, 7, 'each chart colour is different');
    });

    t.test('survey provenance is shown honestly', function() {
      t.assertEqual(SurveyData.totalRows, 48, 'all Survey App rows are included');
      t.assertEqual(SurveyData.generatedRows, 47, 'generated rows are counted');
      t.assertEqual(SurveyData.unverifiedRows, 1, 'the unverified test is counted');
      t.assertEqual(SurveyData.verifiedRows, 0, 'no generated row is called verified');
    });
  }

  // Integration tests -- output of one real unit fed into another

  function runIntegrationTests(t) {

    t.suite('integration: CSV row -> sliceRowNumbers -> mean -> formatThousands');

    t.test('a table row is parsed, averaged, and formatted for display', function() {
      // The chain a chart actually uses: read a row out of a p5 table, slice its numeric columns, average them, then format for a label.
      var table = makeTable(
        ['population_group', '1996', '2001', '2011', '2022'],
        [['Black African', 31127631, 35416166, 41000938, 48000000]]);

      var row = table.getRow(0);
      var values = sliceRowNumbers(row, 1);

      t.assertEqual(values.length, 4, 'four census columns parsed');
      t.assertEqual(values[0], 31127631, 'first census value is a number');

      var average = mean(values);
      t.assertEqual(average, 38886183.75, 'mean across the four census years');

      t.assertEqual(formatThousands(average), '38,886,184',
        'rounded and separated for the chart label');
    });

    t.suite('integration: CSV column -> stringsToNumbers -> PieChart.get_radians');

    t.test('a string column becomes slice angles that map back to shares', function() {
      // stringsToNumbers -> PieChart.get_radians -> sum, exactly as sa-population-group-census.js drives the pie chart.
      var values = stringsToNumbers(CENSUS_2022_SHARES);
      t.assertEqual(values[0], 81.4, 'largest share parsed as a number');

      var pie = new PieChart(0, 0, 100);
      var angles = pie.get_radians(values);

      t.assertEqual(angles.length, CENSUS_2022_SHARES.length,
        'one angle per population group');
      t.assertClose(sum(angles), TWO_PI, 1e-9, 'slices fill the circle');

      // The biggest group must own the biggest slice, in proportion.
      var total = sum(values);
      t.assertClose(angles[0] / TWO_PI, 81.4 / total, 1e-9,
        'largest slice keeps its share of the total');
    });

    t.suite('integration: survey table -> calculateIndex -> components + score');

    t.test('survey rows produce the expected components and index', function() {
      // Feeds a real p5 table through calculateIndex(), which internally calls getPressureScore, getFoodScore and getTransportScore.
      var index = new SurveyPressureIndex();
      index.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      index.loaded = true;

      index.calculateIndex();

      t.assertEqual(index.components.length, 5, 'five pressure components');

      // (0.90 + 0.70) / 2
      t.assertClose(index.components[0].value, 0.80, 1e-9, 'main pressure');
      // (5/5 + 2/5) / 2
      t.assertClose(index.components[1].value, 0.70, 1e-9, 'work worry');
      // ((6-1)/5 + (6-4)/5) / 2
      t.assertClose(index.components[2].value, 0.70, 1e-9, 'income gap');
      // (1.00 + 0.35) / 2
      t.assertClose(index.components[3].value, 0.675, 1e-9, 'food cost');
      // (0.20 + 0.20) / 2
      t.assertClose(index.components[4].value, 0.20, 1e-9, 'transport cost');

      // Mean of the five components, scaled to 0-100 and rounded.
      t.assertEqual(index.index, 62, 'overall pressure index');
    });

    t.test('an empty survey table zeroes the index instead of dividing by zero', function() {
      var index = new SurveyPressureIndex();
      index.table = makeTable(SURVEY_HEADERS, []);
      index.loaded = true;

      index.calculateIndex();

      t.assertEqual(index.index, 0, 'no rows means no score');
      t.assertEqual(index.components.length, 0, 'no components built');
    });

    t.suite('integration: menu id -> gallery lookup -> chart details in the DOM');

    t.test('selecting a catalogue id populates the chart and info panels', function() {
      // findVisIndex -> getCatalogueItem -> showChartDetails -> DOM, which is the chain a sidebar button click runs through.
      var previous = gallery.selectedVisual;
      var visId = 'za-land-ownership-by-group';

      try {
        var visIndex = gallery.findVisIndex(visId);
        t.assertTrue(visIndex !== null, 'visualisation is registered');

        var vis = gallery.visuals[visIndex];
        var metadata = gallery.getCatalogueItem(visId);
        t.assertTrue(metadata !== null, 'catalogue metadata found');

        gallery.showChartDetails(vis);

        t.assertEqual(document.getElementById('chart-title').textContent,
          metadata.title, 'chart heading matches the catalogue');
        t.assertEqual(document.getElementById('info-shows').textContent,
          metadata.shows, '"what this shows" panel filled');
        t.assertEqual(document.getElementById('info-source').textContent,
          metadata.source, 'source panel filled');
        t.assertEqual(document.getElementById('chart-source').textContent,
          metadata.chartSource, 'chart source note filled');

        t.assertTrue(
          document.getElementById('chart-view').classList.contains('hidden') === false,
          'chart view is visible');
        t.assertTrue(
          document.getElementById('overview').classList.contains('hidden'),
          'overview is hidden');

        var selectedButton = document.querySelector('.menu-button.selected');
        t.assertTrue(selectedButton !== null, 'a menu button is marked selected');
        t.assertEqual(selectedButton.dataset.visualId, visId,
          'the selected menu button matches the chart');
      } finally {
        // Leave the app exactly as the test found it.
        if (previous === null) {
          gallery.showOverview();
        } else {
          gallery.selectVisual(previous.id);
        }
      }
    });

    t.suite('integration: chart visual -> chart-ready export data');

    t.test('a loaded survey table produces export columns and rows', function() {
      var chart = new SurveyPressureIndex();
      chart.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      chart.loaded = true;
      var exported = chart.getExportData();

      t.assertTrue(exported.columns.indexOf('pressure') !== -1, 'pressure column exported');
      t.assertEqual(exported.rows.length, 2, 'all survey rows exported');
    });

    t.suite('integration: asynchronous load state -> ZAGiniTrend draw branch');

    t.test('the chart refuses to derive scales before its data arrives', function() {
      // Ready-state protection: setup() must be safe to call while the request is still in flight.
      var chart = new ZAGiniTrend();

      t.assertEqual(chart.isReady, false, 'starts not ready');
      t.assertEqual(chart.data, null, 'no table before the callback runs');

      chart.setup();
      t.assertEqual(chart.startYear, undefined,
        'no scales derived while the data is missing');
    });

    t.test('the success callback moves the chart to a ready, drawable state', function() {
      var chart = new ZAGiniTrend();
      var table = makeTable(['year', 'gini_coefficient'],
                            [[1993, 0.5933393836], [2022, 0.6300000000]]);

      chart.handleDataLoaded(table);

      t.assertEqual(chart.isLoading, false, 'loading finished');
      t.assertEqual(chart.isReady, true, 'ready to draw');
      t.assertEqual(chart.loadProgress, 1, 'progress complete');
      t.assertNull(chart.loadError, 'no error recorded');
      t.assertEqual(chart.startYear, 1993, 'scales derived from the real table');
      t.assertEqual(chart.endYear, 2022, 'end year taken from the last row');
    });

    t.test('the error callback leaves a user-facing message, not a raw error', function() {
      var chart = new ZAGiniTrend();

      chart.handleDataError(new Error('Failed to fetch (404)'));

      t.assertEqual(chart.isLoading, false, 'loading finished');
      t.assertEqual(chart.isReady, false, 'not drawable');
      t.assertEqual(chart.data, null, 'no stale table left behind');
      t.assertTrue(typeof chart.loadError === 'string' && chart.loadError.length > 0,
        'an error message is set');
      t.assertTrue(chart.loadError.indexOf('404') === -1,
        'the raw error is not shown to the user');
      t.assertTrue(chart.loadError.indexOf('refresh') !== -1,
        'the message tells the user what to do');
    });
  }

  // System test cases -- manual, black-box, run against the whole app

  var systemTestCases = [
    {
      id: 'ST-01',
      feature: 'Initial application loading and default state',
      preconditions: 'The site is served over HTTP with no query parameters.',
      steps: [
        'Open index.html in a browser.',
        'Wait for the page to finish loading.',
        'Look at the sidebar, the page heading, and the main panel.'
      ],
      expectedResult: 'The page opens on the Overview section with the heading '
        + '"South African Inequality, Explained". The sidebar lists Overview plus '
        + 'the three story sections, "Overview" is the selected menu item, no chart '
        + 'is displayed, and dataset cards are shown for every visualisation.',
      actualResult: 'Heading correct. Sidebar showed the four group headings '
        + '(Overview, South African Inequality Explained, Survey App, Archived) '
        + 'with 20 menu buttons. #overview visible, #chart-view hidden, '
        + 'gallery.selectedVisual was null, chart-controls empty, and 19 dataset '
        + 'cards rendered -- one per registered visualisation.',
      status: 'Pass',
      notes: 'Run on 2026-07-29 against http://localhost:8877/index.html with no '
        + 'query string. window.cm1010TestResults was undefined, confirming the '
        + 'test suite stays dormant in normal use.'
    },
    {
      id: 'ST-02',
      feature: 'Normal valid interaction with a main feature',
      preconditions: 'The app is open on the Overview section.',
      steps: [
        'Click "National inequality" in the sidebar.',
        'Wait for the chart to render.',
        'Read the chart heading, the information panel, and the source note.'
      ],
      expectedResult: 'The overview is hidden and the chart view appears. The Gini '
        + 'trend line chart draws with axes, year labels, and a final-year value '
        + 'label. The information panel shows the matching "What this shows", '
        + '"Key finding", and "Source" text, and the sidebar highlights the '
        + 'selected item.',
      actualResult: 'Chart heading read "South African Gini coefficient over time", '
        + 'the line chart drew with axes, grid, the 1993-2022 year labels and the '
        + '"2022: 0.54" end label. #overview hidden, #chart-view visible, '
        + 'gallery.selectedVisual.id was "za-gini-trend", the sidebar highlighted '
        + '"National inequality", and the source note read "Source: World Bank PIP '
        + 'via Our World in Data, 1993-2022".',
      status: 'Pass',
      notes: 'describeLoadState() at this point reported isReady true, '
        + 'loadProgress 1, loadError null, rowCount 7.'
    },
    {
      id: 'ST-03',
      feature: 'Minimum and maximum boundary behaviour of the census-year control',
      preconditions: 'The archived "Population by census year" chart is open.',
      steps: [
        'Open Archived: Earlier Drafts > Population by census year.',
        'Set the "Census year" dropdown to its first option, 1996.',
        'Set the dropdown to its last option, 2022.',
        'Compare the legend percentages in each case.'
      ],
      expectedResult: 'The dropdown offers exactly 1996, 2001, 2011 and 2022. Both '
        + 'the lowest (1996) and highest (2022) options redraw the pie chart with '
        + 'that year\'s population-group shares, the legend percentages change '
        + 'between the two, and every slice stays visible.',
      actualResult: 'The dropdown offered exactly ["1996","2001","2011","2022"]. '
        + 'Minimum option 1996 gave shares [77.4, 9, 2.6, 11, 0]; maximum option '
        + '2022 gave [81.4, 8.2, 2.7, 7.3, 0.4]. Both summed to 100, the pie and '
        + 'legend redrew for each, and the 2022 legend listed all five groups '
        + 'including "Other (0.4%)".',
      status: 'Pass',
      notes: 'The 1996 column contains a genuine zero for "Other". It still '
        + 'renders a legend entry, because PieChart.draw() adds a 0.001 radian '
        + 'nudge so a zero-value category is not silently dropped.'
    },
    {
      id: 'ST-04',
      feature: 'Unavailable-data behaviour and user-friendly messaging',
      preconditions: 'The app can be opened with the ?failData=1 flag, which points '
        + 'data requests at a file that does not exist.',
      steps: [
        'Open index.html?failData=1.',
        'Click "National inequality" in the sidebar.',
        'Read what is drawn on the chart canvas.'
      ],
      expectedResult: 'The chart area shows "This chart is unavailable" followed by '
        + 'a plain-English sentence telling the user to check their connection and '
        + 'refresh. No stack trace, status code, or raw error object is shown to the '
        + 'user, and the rest of the page stays usable.',
      actualResult: 'The canvas showed "This chart is unavailable" in red, followed '
        + 'by "This chart could not load its data. Check your connection and refresh '
        + 'the page." No status code, stack trace, or error object appeared on the '
        + 'canvas. The sidebar kept all 20 buttons and stayed clickable, and the '
        + 'info panel still showed the chart description and source.',
      status: 'Pass',
      notes: 'describeLoadState() reported isLoading false, isReady false, '
        + 'loadProgress 0, rowCount null, and loadError set to the user-facing '
        + 'sentence. The underlying 404 is only written to the console, and only '
        + 'when ?debug=1 is also set.'
    },
    {
      id: 'ST-05',
      feature: 'Switching between visualisations keeps state consistent',
      preconditions: 'The app is open with no chart selected.',
      steps: [
        'Open "Population by census year" and change the dropdown to 2011.',
        'Switch to "National inequality".',
        'Switch to "Pressure index".',
        'Return to the Overview.'
      ],
      expectedResult: 'Each switch replaces the previous chart cleanly. The census '
        + 'dropdown is removed from the controls bar when its chart is left, so no '
        + 'stale control is carried over. Each chart shows its own title, info panel, '
        + 'and source note, and returning to Overview clears the canvas and restores '
        + 'the dataset cards.',
      actualResult: 'On the census chart the controls bar held 1 element (the '
        + 'dropdown). After switching to "National inequality" it held 0, and 0 '
        + 'again on "Pressure index", so the dropdown was destroyed rather than '
        + 'carried over. gallery.selectedVisual.id tracked each switch '
        + '(sa-population-group-census -> za-gini-trend -> survey-pressure-index '
        + '-> null), the sidebar highlight followed it, and returning to Overview '
        + 'restored the 19 dataset cards.',
      status: 'Pass',
      notes: 'Observed: #chart-title keeps the last chart\'s text after returning '
        + 'to Overview. Not user-visible, because #chart-view is hidden at that '
        + 'point, so it is recorded as an observation rather than a defect.'
    },
    {
      id: 'ST-06',
      feature: 'Asynchronous loading: success and failure of a data request',
      preconditions: 'The CSV files are served from the data/ directory.',
      steps: [
        'Open the app normally and select "National inequality" immediately.',
        'Observe the chart area while the CSV request is in flight.',
        'Reload with ?failData=1 and select the same chart.',
        'Observe the chart area again.'
      ],
      expectedResult: 'On success the chart area shows "Loading inequality data..." '
        + 'with a progress bar, then transitions to the finished line chart. On '
        + 'failure it shows the unavailable message instead and never draws a '
        + 'partial or empty chart.',
      actualResult: 'Success path: with DevTools network throttling set to Slow 3G '
        + 'and preload() re-issued, describeLoadState() reported isLoading true, '
        + 'isReady false, loadProgress 0, loadError null while the request was in '
        + 'flight; the canvas showed "Loading inequality data..." above a progress '
        + 'bar, and then transitioned to the finished line chart with isReady true '
        + 'and loadProgress 1. Failure path: under ?failData=1 the same chart went '
        + 'straight to the unavailable message and never drew axes or a partial '
        + 'line.',
      status: 'Pass',
      notes: 'Over localhost the CSV returns too quickly to photograph the loading '
        + 'frame by racing it, so the loading branch was also held open by setting '
        + 'the chart\'s own isLoading/isReady/loadProgress fields to their in-flight '
        + 'values and letting p5\'s draw loop render that branch. No delay was added '
        + 'to the application itself.'
    }
  ];

  // Public API

  function runAll() {
    if (typeof gallery === 'undefined' || gallery === null) {
      console.warn('cm1010Testing: the gallery is not built yet -- '
          + 'run this after setup() has finished.');
      return null;
    }

    var t = new TestRunner();

    // Both suites are run before anything is reported or corrected, so one failure never hides the results of the tests after it.
    runUnitTests(t);
    runIntegrationTests(t);

    t.report();

    return {
      total: t.total,
      passed: t.passed,
      failed: t.failed,
      results: t.results,
      failures: t.results.filter(function(r) { return !r.passed; })
    };
  }

  // Snapshot of the asynchronous load state, used as evidence that the loading, ready, and error states are real and observable.
  function describeLoadState() {
    if (typeof gallery === 'undefined' || gallery === null) {
      return null;
    }

    var visIndex = gallery.findVisIndex('za-gini-trend');
    if (visIndex === null) {
      return null;
    }

    var chart = gallery.visuals[visIndex];

    return {
      id: chart.id,
      dataPath: chart.dataPath,
      isLoading: chart.isLoading,
      isReady: chart.isReady,
      loadProgress: chart.loadProgress,
      loadError: chart.loadError,
      rowCount: chart.data ? chart.data.getRowCount() : null
    };
  }

  function describeRenderState() {
    var selected = typeof gallery !== 'undefined' && gallery ? gallery.selectedVisual : null;
    return {
      selectedId: selected ? selected.id : null,
      looping: typeof isLooping === 'function' ? isLooping() : null,
      animating: selected ? chartNeedsMoreFrames(selected) : false
    };
  }

  global.cm1010Testing = {
    runAll: runAll,
    describeLoadState: describeLoadState,
    describeRenderState: describeRenderState,
    systemTestCases: systemTestCases,
    TestRunner: TestRunner
  };

  // Only ever runs when ?test=1 is in the URL.
  if (typeof hasQueryFlag === 'function' && hasQueryFlag('test')) {
    global.addEventListener('load', function() {
      global.cm1010TestResults = runAll();
    });
  }

}(window));
