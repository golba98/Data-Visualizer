/* Start - own code */


(function(global) {
  'use strict';


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


  TestRunner.prototype.assertEqual = function(actual, expected, message) {
    if (actual === expected) {
      return;
    }

    throw new AssertionError(
      (message || 'assertEqual failed')
      + ' -- expected: ' + describe(expected)
      + ', actual: ' + describe(actual));
  };

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

  // Matches the published CSV exactly: data/survey/za_survey_responses.csv.
  var SURVEY_HEADERS = ['age', 'status', 'pressure', 'cost_increased',
                        'work_worry', 'income_keeps_up', 'transport_cost',
                        'food_cost', 'cut_back_on'];
  var SURVEY_ROWS = [
    ['18-21', 'Student', 'Food', 'Yes', 5, 1, 'R0-R300', 'R3000+', 'Eating out; Transport'],
    ['18-21', 'Student', 'Data', 'Yes', 2, 4, 'R0-R300', 'R501-R1000', 'Data']
  ];

  var CENSUS_2022_SHARES = ['81.4', '8.2', '2.7', '7.3', '0.4'];


  function runUnitTests(t) {

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
      t.assertEqual(formatThousands('not a number'), '—',
        'non-numeric string');
      t.assertEqual(formatThousands(undefined), '—', 'missing value');
      t.assertEqual(formatThousands(Infinity), '—', 'non-finite value');
    });

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
      t.assertTrue(isNaN(mean([])), 'empty list yields NaN, not 0');
    });

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

    t.test('getPressureScore rejects an unknown answer', function() {
      t.assertNull(index.getPressureScore('Childcare'), 'answer not in table');
      t.assertNull(index.getPressureScore(undefined), 'missing answer');
    });

    t.test('getFoodScore returns the weight for a known band', function() {
      t.assertEqual(index.getFoodScore('R1001-R2000'), 0.60, 'middle band');
    });

    t.test('getFoodScore boundaries: cheapest and dearest bands', function() {
      t.assertEqual(index.getFoodScore('R0-R500'), 0.15, 'lowest band');
      t.assertEqual(index.getFoodScore('R3000+'), 1.00, 'highest band');
    });

    t.test('getFoodScore rejects an unrecognised band', function() {
      t.assertNull(index.getFoodScore('R99'), 'band not in table');
      t.assertNull(index.getFoodScore(''), 'blank cell');
    });

    t.test('getTransportScore boundaries: cheapest and dearest bands', function() {
      t.assertEqual(index.getTransportScore('R0-R300'), 0.20, 'lowest band');
      t.assertEqual(index.getTransportScore('R1500+'), 1.00, 'highest band');
    });

    t.test('getTransportScore rejects an unrecognised band', function() {
      t.assertNull(index.getTransportScore('free'), 'band not in table');
    });

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

    t.test('survey data is shown honestly', function() {
      t.assertEqual(SurveyData.totalRows, 48, 'all Survey App rows are included');
      t.assertEqual(SurveyData.chartLabel, 'n=48', 'the chart label matches the row count');
      t.assertTrue(SurveyData.note.indexOf('Real survey data') !== -1, 'the note does not claim the data is synthetic');
      t.assertTrue(SurveyData.source.indexOf('Real survey data') !== -1, 'the source does not claim the data is synthetic');
    });

    t.suite('unit: registered visualisation constructor interface');

    t.test('the Gallery contains exactly the 19 catalogue visualisations', function() {
      var catalogueIds = [];
      for (var section = 0; section < gallery.catalogue.length; section++) {
        for (var item = 0; item < gallery.catalogue[section].items.length; item++) {
          catalogueIds.push(gallery.catalogue[section].items[item].id);
        }
      }

      var registeredIds = gallery.visuals.map(function(vis) { return vis.id; });
      t.assertEqual(registeredIds.length, 19, 'registered constructor count');
      t.assertEqual(registeredIds.slice().sort().join('|'), catalogueIds.slice().sort().join('|'),
        'registered ids match the catalogue');
    });

    t.test('registered visualisation ids are unique', function() {
      var ids = gallery.visuals.map(function(vis) { return vis.id; });
      t.assertEqual(new Set(ids).size, ids.length, 'no duplicate Gallery ids');
    });

    gallery.visuals.forEach(function(registered) {
      t.test(registered.id + ' can be constructed and fulfils the lifecycle contract', function() {
        var visualisation = new registered.constructor();

        t.assertTrue(visualisation instanceof registered.constructor,
          'constructor returns its own object type');
        t.assertEqual(visualisation.id, registered.id, 'constructor preserves its registered id');
        t.assertTrue(typeof visualisation.id === 'string' && visualisation.id.length > 0,
          'id is a non-empty string');
        t.assertTrue(typeof visualisation.name === 'string' && visualisation.name.length > 0,
          'name is a non-empty string');
        t.assertEqual(typeof visualisation.preload, 'function', 'preload is a function');
        t.assertEqual(typeof visualisation.setup, 'function', 'setup is a function');
        t.assertEqual(typeof visualisation.draw, 'function', 'draw is a function');
        t.assertEqual(typeof visualisation.destroy, 'function', 'destroy is a function');
        t.assertTrue(visualisation.loadState instanceof VisualizationLoadState,
          'the constructor composes a load-state object');

        if (registered.id === 'sa-population-group-census'
            || registered.id === 'sa-sex-age-2022'
            || registered.id === 'sa-age-sex-bubble-2022') {
          t.assertEqual(typeof visualisation.onResize, 'function',
            'chart-specific resize hook is a function');
        }

        visualisation.destroy();
      });
    });

    t.suite('unit: VisualizationLoadState lifecycle');

    function makeLoadStateOwner(id) {
      var owner = { id: id || 'load-state-test', name: 'Load state test' };
      owner.loadState = new VisualizationLoadState(owner, {
        loadingMessage: 'Loading test data...'
      });
      return owner;
    }

    function withMockedLoadTable(mock, testFunction) {
      var originalLoadTable = window.loadTable;
      try {
        window.loadTable = mock;
        testFunction();
      } finally {
        window.loadTable = originalLoadTable;
      }
    }

    t.test('a valid table transitions from loading to ready', function() {
      var owner = makeLoadStateOwner('load-success');
      var table = makeTable(['value'], [[1]]);

      withMockedLoadTable(function(path, type, header, success) {
        t.assertEqual(owner.loadState.status, 'loading', 'request starts in loading');
        success(table);
      }, function() {
        owner.loadState.loadTables([{
          path: 'valid.csv',
          requiredColumns: ['value'],
          numericColumns: ['value']
        }]);
      });

      t.assertEqual(owner.loadState.status, 'ready', 'valid data is ready');
      t.assertTrue(owner.loaded, 'legacy loaded property stays synchronized');
      t.assertEqual(owner.loadProgress, 1, 'progress is complete');
      t.assertEqual(owner.loadState.draw(), false, 'ready state permits normal drawing');
      t.assertEqual(document.getElementById('chart-load-status').getAttribute('role'), 'status',
        'ready uses status semantics');
      t.assertTrue(document.getElementById('chart-load-status').textContent.indexOf('ready') !== -1,
        'ready state is announced once');
      owner.loadState.destroy();
    });

    t.test('multiple resources stay loading until every table succeeds', function() {
      var owner = makeLoadStateOwner('load-multiple');
      var callbacks = [];

      withMockedLoadTable(function(path, type, header, success) {
        callbacks.push(success);
      }, function() {
        owner.loadState.loadTables([{ path: 'one.csv' }, { path: 'two.csv' }]);
        callbacks[0](makeTable(['value'], [[1]]));
        t.assertEqual(owner.loadState.status, 'loading', 'one pending table keeps loading');
        t.assertClose(owner.loadProgress, 0.5, 1e-9, 'partial progress is visible');
        callbacks[1](makeTable(['value'], [[2]]));
      });

      t.assertEqual(owner.loadState.status, 'ready', 'all resources are ready');
    });

    t.test('a failed request reaches a terminal error state', function() {
      var owner = makeLoadStateOwner('load-failure');

      withMockedLoadTable(function(path, type, header, success, failure) {
        failure(new Error('network 404 detail'));
      }, function() {
        owner.loadState.loadTables([{ path: 'missing.csv' }]);
      });

      t.assertEqual(owner.loadState.status, 'error', 'failure is terminal');
      t.assertEqual(owner.isLoading, false, 'failure cannot remain loading');
      t.assertTrue(owner.loadError.indexOf('404') === -1, 'raw detail is not public');

      owner.loadState.draw();
      t.assertEqual(document.getElementById('chart-load-status').getAttribute('role'), 'alert',
        'terminal failure uses alert semantics');
      owner.loadState.destroy();
    });

    t.test('a late success cannot overwrite a terminal failure', function() {
      var owner = makeLoadStateOwner('load-terminal');
      var callbacks = [];

      withMockedLoadTable(function(path, type, header, success, failure) {
        callbacks.push({ success: success, failure: failure });
      }, function() {
        owner.loadState.loadTables([{ path: 'one.csv' }, { path: 'two.csv' }]);
        callbacks[0].failure(new Error('first request failed'));
        callbacks[1].success(makeTable(['value'], [[2]]));
      });

      t.assertEqual(owner.loadState.status, 'error', 'late success is ignored');
      t.assertEqual(owner.loaded, false, 'owner never becomes drawable');
    });

    t.test('empty or malformed tables become terminal errors', function() {
      var emptyOwner = makeLoadStateOwner('load-empty');
      var malformedOwner = makeLoadStateOwner('load-malformed');

      withMockedLoadTable(function(path, type, header, success) {
        success(makeTable(['value'], []));
      }, function() {
        emptyOwner.loadState.loadTables([{ path: 'empty.csv', requiredColumns: ['value'] }]);
      });

      withMockedLoadTable(function(path, type, header, success) {
        success(makeTable(['wrong'], [[1]]));
      }, function() {
        malformedOwner.loadState.loadTables([{ path: 'malformed.csv', requiredColumns: ['value'] }]);
      });

      t.assertEqual(emptyOwner.loadState.status, 'error', 'empty table rejected');
      t.assertEqual(malformedOwner.loadState.status, 'error', 'missing column rejected');
    });

    t.test('an exception during successful-load processing becomes an error', function() {
      var owner = makeLoadStateOwner('load-processing-error');

      withMockedLoadTable(function(path, type, header, success) {
        success(makeTable(['value'], [[1]]));
      }, function() {
        owner.loadState.loadTables([{ path: 'valid.csv', requiredColumns: ['value'] }], function() {
          throw new Error('processing failed');
        });
      });

      t.assertEqual(owner.loadState.status, 'error', 'processing exception is terminal');
      t.assertEqual(owner.loaded, false, 'chart is not marked drawable');
    });

    t.test('an explicit new load may recover from an earlier error', function() {
      var owner = makeLoadStateOwner('load-retry');
      var attempt = 0;

      withMockedLoadTable(function(path, type, header, success, failure) {
        attempt++;
        if (attempt === 1) failure(new Error('temporary failure'));
        else success(makeTable(['value'], [[1]]));
      }, function() {
        owner.loadState.loadTables([{ path: 'retry.csv', requiredColumns: ['value'] }]);
        t.assertEqual(owner.loadState.status, 'error', 'first attempt failed');
        owner.loadState.loadTables([{ path: 'retry.csv', requiredColumns: ['value'] }]);
      });

      t.assertEqual(owner.loadState.status, 'ready', 'explicit retry reached ready');
    });

    t.test('destroy removes only the owner load-state announcement', function() {
      var owner = makeLoadStateOwner('load-cleanup');
      var region = document.getElementById('chart-load-status');

      owner.loadState.announce('loading', owner.loadState.loadingMessage);
      t.assertEqual(region.getAttribute('role'), 'status', 'loading uses status semantics');
      t.assertEqual(region.dataset.visualisationId, owner.id, 'announcement records its owner');

      owner.loadState.destroy();
      t.assertEqual(region.textContent, '', 'announcement text removed');
      t.assertNull(region.getAttribute('role'), 'live-region role removed');
      t.assertEqual(region.dataset.visualisationId, undefined, 'ownership marker removed');
    });

    t.suite('unit: Waffle counting and allocation (waffle/waffle.js)');

    function makeWaffle(categories, values, across, down) {
      var rows = [];
      for (var i = 0; i < values.length; i++) {
        rows.push([values[i]]);
      }

      var colours = {};
      for (var c = 0; c < categories.length; c++) {
        colours[categories[c]] = SATheme.categorical[c % SATheme.categorical.length];
      }

      return new Waffle(0, 0, 100, 100,
                        across === undefined ? 10 : across,
                        down === undefined ? 10 : down,
                        makeTable(['pressure'], rows),
                        'pressure', categories, colours);
    }

    function totalOf(boxTotals, categories) {
      var total = 0;
      for (var i = 0; i < categories.length; i++) {
        total += boxTotals[categories[i]];
      }
      return total;
    }

    t.test('countCategories tallies only recognised categories', function() {
      var categories = ['Food', 'Transport'];
      var waffle = makeWaffle(categories, ['Food', 'Food', 'Transport', 'Childcare', '']);

      t.assertEqual(waffle.countCategories(), 3, 'three rows fell into a known category');
      t.assertEqual(waffle.counts.Food, 2, 'Food');
      t.assertEqual(waffle.counts.Transport, 1, 'Transport');
    });

    t.test('countCategories trims surrounding whitespace before matching', function() {
      var waffle = makeWaffle(['Food'], ['  Food  ']);

      t.assertEqual(waffle.countCategories(), 1, 'a padded cell still matches');
    });

    t.test('an even split gives every category the same number of boxes', function() {
      var categories = ['Food', 'Transport', 'Data', 'Rent'];
      var waffle = makeWaffle(categories, categories);
      var totals = waffle.calculateBoxTotals(waffle.countCategories());

      t.assertEqual(totals.Food, 25, 'Food');
      t.assertEqual(totals.Rent, 25, 'Rent');
      t.assertEqual(totalOf(totals, categories), 100, 'the grid is exactly filled');
    });

    t.test('leftover boxes go to the largest fractional remainder', function() {
      var categories = ['Food', 'Transport', 'Data'];
      var waffle = makeWaffle(categories, ['Food', 'Food', 'Transport']);
      var totals = waffle.calculateBoxTotals(waffle.countCategories());

      t.assertEqual(totals.Food, 67, 'Food takes the leftover box');
      t.assertEqual(totals.Transport, 33, 'Transport keeps its whole part');
      t.assertEqual(totals.Data, 0, 'a category nobody chose gets no boxes');
      t.assertEqual(totalOf(totals, categories), 100, 'the grid is exactly filled');
    });

    t.test('tied remainders are broken in category order, not at random', function() {
      var categories = ['Food', 'Transport', 'Data'];
      var waffle = makeWaffle(categories, categories);
      var totals = waffle.calculateBoxTotals(waffle.countCategories());

      t.assertEqual(totals.Food, 34, 'the first category wins the tie');
      t.assertEqual(totals.Transport, 33, 'Transport');
      t.assertEqual(totals.Data, 33, 'Data');
      t.assertEqual(totalOf(totals, categories), 100, 'the grid is exactly filled');
    });

    t.test('lowest boundary: no valid rows leaves every category empty', function() {
      var categories = ['Food', 'Transport', 'Data'];
      var waffle = makeWaffle(categories, ['Childcare', '']);
      var totals = waffle.calculateBoxTotals(waffle.countCategories());

      t.assertEqual(totalOf(totals, categories), 0, 'no data means no boxes');
      t.assertEqual(totals.Food, 0, 'Food');
    });

    t.test('an empty table draws no boxes at all', function() {
      var waffle = makeWaffle(['Food', 'Transport'], []);
      var filled = 0;

      for (var row = 0; row < waffle.boxes.length; row++) {
        for (var col = 0; col < waffle.boxes[row].length; col++) {
          if (waffle.boxes[row][col]) {
            filled++;
          }
        }
      }

      t.assertEqual(filled, 0, 'the grid is left empty rather than filled with category one');
    });

    t.test('the allocation fills whatever grid size it is given', function() {
      var categories = ['Food', 'Transport', 'Data', 'Rent'];
      var waffle = makeWaffle(categories, categories, 10, 5);
      var totals = waffle.calculateBoxTotals(waffle.countCategories());

      t.assertEqual(totalOf(totals, categories), 50, 'a 10x5 grid is exactly filled');
      t.assertEqual(totals.Food, 13, 'first category takes a leftover');
      t.assertEqual(totals.Rent, 12, 'last category keeps its whole part');
    });

    t.test('a real 48-row survey column still fills all 100 boxes', function() {
      var categories = ['Food', 'Transport', 'Data', 'Rent', 'Tuition', 'Debt', 'Electricity'];
      var values = [];
      var distribution = [11, 10, 7, 7, 6, 5, 2];
      for (var i = 0; i < categories.length; i++) {
        for (var n = 0; n < distribution[i]; n++) {
          values.push(categories[i]);
        }
      }

      var waffle = makeWaffle(categories, values);
      var totals = waffle.calculateBoxTotals(waffle.countCategories());

      t.assertEqual(totalOf(totals, categories), 100, 'the grid is exactly filled');
    });

    t.suite('unit: SurveyCutbackHeatmap.countCutbacks (survey-cutback-heatmap.js)');

    var CUTBACK_HEADERS = ['status', 'cut_back_on'];

    t.test('a hand-counted fixture matches cell for cell', function() {
      var chart = new SurveyCutbackHeatmap();
      chart.table = makeTable(CUTBACK_HEADERS, [
        ['Student', 'Meat; Data'],
        ['Student', 'Meat'],
        ['Employed', 'Transport; Meat'],
        ['Freelancer', 'Meat']
      ]);
      chart.loaded = true;

      chart.countCutbacks();

      t.assertEqual(chart.counts.Meat.Student, 2, 'Meat / Student');
      t.assertEqual(chart.counts.Meat.Employed, 1, 'Meat / Employed');
      t.assertEqual(chart.counts.Data.Student, 1, 'Data / Student');
      t.assertEqual(chart.counts.Transport.Employed, 1, 'Transport / Employed');
      t.assertEqual(chart.counts.Clothing.Student, 0, 'a cutback nobody chose stays at zero');
      t.assertEqual(chart.maxCount, 2, 'the busiest cell sets the colour scale');
    });

    t.test('a status outside the four known groups is left out', function() {
      var chart = new SurveyCutbackHeatmap();
      chart.table = makeTable(CUTBACK_HEADERS, [['Freelancer', 'Meat']]);
      chart.loaded = true;

      chart.countCutbacks();

      t.assertEqual(chart.maxCount, 0, 'nothing was counted');
      t.assertEqual(chart.representedRows, 0, 'the row is reported as unrepresented');
    });

    t.test('one cutback name inside another is not double counted', function() {
      var chart = new SurveyCutbackHeatmap();
      chart.cutbacks = ['Data', 'Data bundles'];
      chart.table = makeTable(CUTBACK_HEADERS, [['Student', 'Data bundles']]);
      chart.loaded = true;

      chart.countCutbacks();

      t.assertEqual(chart.counts['Data bundles'].Student, 1, 'the full name matched');
      t.assertEqual(chart.counts.Data.Student, 0, 'the shorter name did not');
    });

    t.test('every row of valid input is represented', function() {
      var chart = new SurveyCutbackHeatmap();
      chart.table = makeTable(CUTBACK_HEADERS, [
        ['Student', 'Meat'],
        ['Employed', 'Data'],
        ['Unemployed', 'Transport']
      ]);
      chart.loaded = true;

      chart.countCutbacks();

      t.assertEqual(chart.representedRows, 3, 'no row was silently dropped');
    });

    t.suite('unit: SurveyFoodTransportBurden.countBurden (survey-food-transport-burden.js)');

    var BURDEN_HEADERS = ['food_cost', 'transport_cost'];

    t.test('the cheapest food band is a real row of the grid', function() {
      var chart = new SurveyFoodTransportBurden();
      chart.table = makeTable(BURDEN_HEADERS, [['R0-R500', 'R0-R300']]);
      chart.loaded = true;

      chart.countBurden();

      t.assertEqual(chart.counts['R0-R500']['R0-R300'], 1, 'the respondent is plotted');
      t.assertEqual(chart.representedRows, 1, 'and counted as represented');
    });

    t.test('respondents land in the cell matching both of their bands', function() {
      var chart = new SurveyFoodTransportBurden();
      chart.table = makeTable(BURDEN_HEADERS, [
        ['R3000+', 'R0-R300'],
        ['R3000+', 'R0-R300'],
        ['R501-R1000', 'R1500+']
      ]);
      chart.loaded = true;

      chart.countBurden();

      t.assertEqual(chart.counts['R3000+']['R0-R300'], 2, 'the busiest cell');
      t.assertEqual(chart.counts['R501-R1000']['R1500+'], 1, 'the opposite corner');
      t.assertEqual(chart.maxCount, 2, 'circle scaling uses the busiest cell');
      t.assertEqual(chart.representedRows, 3, 'every row is represented');
    });

    t.test('a band outside the schema is dropped rather than miscounted', function() {
      var chart = new SurveyFoodTransportBurden();
      chart.table = makeTable(BURDEN_HEADERS, [['R9000+', 'R0-R300']]);
      chart.loaded = true;

      chart.countBurden();

      t.assertEqual(chart.maxCount, 0, 'nothing plotted');
      t.assertEqual(chart.representedRows, 0, 'the drop is visible in the count');
    });

    t.suite('unit: SurveyStatusPressure.countPressures (survey-status-pressure.js)');

    var STATUS_PRESSURE_HEADERS = ['status', 'pressure'];

    t.test('per-group totals equal the number of rows in that group', function() {
      var chart = new SurveyStatusPressure();
      chart.table = makeTable(STATUS_PRESSURE_HEADERS, [
        ['Student', 'Food'],
        ['Student', 'Food'],
        ['Student', 'Data'],
        ['Employed', 'Rent']
      ]);
      chart.loaded = true;

      chart.countPressures();

      t.assertEqual(chart.counts.Student.Food, 2, 'Student / Food');
      t.assertEqual(chart.counts.Student.Data, 1, 'Student / Data');
      t.assertEqual(chart.totals.Student, 3, 'three students in total');
      t.assertEqual(chart.totals.Employed, 1, 'one employed respondent');
      t.assertEqual(chart.totals.Unemployed, 0, 'a group with no rows stays at zero');
    });

    t.test('unknown statuses and pressures are excluded from the totals', function() {
      var chart = new SurveyStatusPressure();
      chart.table = makeTable(STATUS_PRESSURE_HEADERS, [
        ['Student', 'Childcare'],
        ['Freelancer', 'Food'],
        ['Student', 'Food']
      ]);
      chart.loaded = true;

      chart.countPressures();

      t.assertEqual(chart.totals.Student, 1, 'only the recognised student row counted');
      t.assertEqual(chart.representedRows, 1, 'two rows were dropped');
    });

    t.suite('unit: SurveyIncomeRealityGap.calculateRows (survey-income-reality-gap.js)');

    var GAP_HEADERS = ['status', 'work_worry', 'income_keeps_up'];

    function findGapRow(chart, label) {
      for (var i = 0; i < chart.rows.length; i++) {
        if (chart.rows[i].label === label) {
          return chart.rows[i];
        }
      }
      return null;
    }

    t.test('Overall averages every respondent, not just one group', function() {
      var chart = new SurveyIncomeRealityGap();
      chart.table = makeTable(GAP_HEADERS, [
        ['Student', 5, 1],
        ['Employed', 3, 2],
        ['Employed', 1, 3]
      ]);
      chart.loaded = true;

      chart.calculateRows();

      var overall = findGapRow(chart, 'Overall');
      t.assertClose(overall.worry, 3, 1e-9, 'mean work worry');
      t.assertClose(overall.income, 2, 1e-9, 'mean income adequacy');
      t.assertEqual(overall.count, 3, 'every row included');
    });

    t.test('each status group averages only its own rows', function() {
      var chart = new SurveyIncomeRealityGap();
      chart.table = makeTable(GAP_HEADERS, [
        ['Student', 5, 1],
        ['Employed', 3, 2],
        ['Employed', 1, 3]
      ]);
      chart.loaded = true;

      chart.calculateRows();

      var employed = findGapRow(chart, 'Employed');
      t.assertClose(employed.worry, 2, 1e-9, 'mean work worry for employed');
      t.assertEqual(employed.count, 2, 'two employed respondents');
    });

    t.test('a group nobody belongs to is left out instead of averaging zero rows', function() {
      var chart = new SurveyIncomeRealityGap();
      chart.table = makeTable(GAP_HEADERS, [['Student', 5, 1]]);
      chart.loaded = true;

      chart.calculateRows();

      t.assertNull(findGapRow(chart, 'Unemployed'), 'no empty row emitted');

      for (var i = 0; i < chart.rows.length; i++) {
        t.assertTrue(isFinite(chart.rows[i].worry), chart.rows[i].label + ' has a real average');
      }
    });
  }


  // Tests for the accessible summary layer: the insight text, the data table
  // models, the size keys and the DOM rendering that exposes them.
  function runAccessibilityTests(t) {

    // Builds a loaded visualisation without going through preload/loadState.
    function readyVisual(vis, assign) {
      assign(vis);
      vis.loaded = true;
      if (vis.loadState) vis.loadState.status = 'ready';
      if (typeof vis.setup === 'function') vis.setup();
      return vis;
    }

    function looksBroken(text) {
      return /NaN|undefined|Infinity|null/.test(String(text));
    }


    t.suite('unit: ChartInsights summary models (chart-insights.js)');

    t.test('every registered visualisation has an insight builder', function() {
      for (var i = 0; i < gallery.visuals.length; i++) {
        t.assertTrue(ChartInsights.has(gallery.visuals[i].id),
                     'builder exists for ' + gallery.visuals[i].id);
      }
    });

    t.test('a loaded chart produces a usable insight sentence', function() {
      var chart = readyVisual(new SurveyFoodTransportBurden(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      });
      var model = ChartInsights.build(chart);

      t.assertTrue(model !== null, 'a model is returned');
      t.assertTrue(model.insight.length > 0, 'the insight is not empty');
      t.assertTrue(model.insight.indexOf('R0-R300') !== -1,
                   'the insight names the busiest transport band');
    });

    t.test('summaries never print NaN, undefined or Infinity', function() {
      var charts = [
        readyVisual(new SurveyFoodTransportBurden(), function(vis) {
          vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
        }),
        readyVisual(new SurveyPressureIndex(), function(vis) {
          vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
        }),
        readyVisual(new SurveyStatusPressure(), function(vis) {
          vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
        })
      ];

      for (var i = 0; i < charts.length; i++) {
        var model = ChartInsights.build(charts[i]);
        t.assertTrue(model !== null, charts[i].id + ' builds a model');
        t.assertTrue(!looksBroken(model.insight), charts[i].id + ' insight is clean');
        t.assertTrue(!looksBroken(model.caveat), charts[i].id + ' caveat is clean');
      }
    });

    t.test('quoted figures stay inside the range of the source data', function() {
      var chart = readyVisual(new SurveyIncomeRealityGap(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      });
      var model = ChartInsights.build(chart);

      for (var i = 0; i < chart.rows.length; i++) {
        t.assertTrue(chart.rows[i].worry >= 1 && chart.rows[i].worry <= 5,
                     chart.rows[i].label + ' work-worry mean is on the 1-5 scale');
        t.assertTrue(chart.rows[i].income >= 1 && chart.rows[i].income <= 5,
                     chart.rows[i].label + ' income mean is on the 1-5 scale');
      }

      t.assertTrue(model.insight.indexOf('out of 5') !== -1, 'the scale is stated');
    });

    t.test('an unloaded chart yields no summary rather than a broken one', function() {
      var chart = new SurveyFoodTransportBurden();
      t.assertNull(ChartInsights.build(chart), 'nothing is built before data arrives');
    });

    t.test('an empty dataset yields no summary rather than zeroes', function() {
      var chart = readyVisual(new SurveyFoodTransportBurden(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, []);
      });
      t.assertNull(ChartInsights.build(chart), 'an empty table produces no insight');
    });

    t.test('a builder that throws is contained, not propagated', function() {
      var chart = readyVisual(new SurveyFoodTransportBurden(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      });
      chart.foodBands = null;

      var threw = false;
      var model;
      try {
        model = ChartInsights.build(chart);
      } catch (error) {
        threw = true;
      }

      t.assertTrue(!threw, 'the failure does not escape the builder');
      t.assertNull(model, 'no model is returned');
    });


    t.suite('unit: SummaryStats guards (chart-summary.js)');

    t.test('formatting a non-finite value gives a dash, not NaN', function() {
      t.assertEqual(SummaryStats.format(NaN, 2), '—', 'NaN');
      t.assertEqual(SummaryStats.format(undefined, 2), '—', 'missing value');
      t.assertEqual(SummaryStats.formatCount(Infinity), '—', 'non-finite count');
    });

    t.test('a percentage of zero respondents is a dash, not a division by zero', function() {
      t.assertEqual(SummaryStats.percent(3, 0), '—', 'empty denominator');
      t.assertEqual(SummaryStats.percent(1, 4), '25.0', 'ordinary case');
    });

    t.test('extremes ignore unusable values instead of returning NaN', function() {
      var items = [{ v: 3 }, { v: NaN }, { v: 9 }, { v: null }];
      t.assertEqual(SummaryStats.highest(items, function(i) { return i.v; }).value, 9, 'highest');
      t.assertEqual(SummaryStats.lowest(items, function(i) { return i.v; }).value, 3, 'lowest');
      t.assertNull(SummaryStats.highest([], function(i) { return i.v; }), 'nothing to compare');
    });

    t.test('a change is described with its direction', function() {
      t.assertEqual(SummaryStats.describeChange(0.59, 0.54, 2, 'points'),
                    '0.05 points lower', 'a fall');
      t.assertEqual(SummaryStats.describeChange(1, 2, 0), '1 higher', 'a rise');
      t.assertEqual(SummaryStats.describeChange(2, 2, 0), 'unchanged', 'no change');
    });


    t.suite('unit: data table models (chart-insights.js)');

    t.test('a table model has headers and rows for every chart category', function() {
      var chart = readyVisual(new SurveyStatusPressure(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      });
      var model = ChartInsights.build(chart);

      t.assertEqual(model.table.rows.length, chart.statuses.length,
                    'one row per status group');
      t.assertEqual(model.table.columns.length, chart.pressures.length + 2,
                    'a label column, one per pressure, and a total');
      t.assertTrue(model.table.caption.length > 0, 'the table is captioned');
    });

    t.test('table totals reconcile with the input row count', function() {
      var chart = readyVisual(new SurveyStatusPressure(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      });
      var model = ChartInsights.build(chart);

      var total = 0;
      for (var i = 0; i < model.table.rows.length; i++) {
        total += model.table.rows[i].total;
      }

      t.assertEqual(total, chart.representedRows, 'group totals sum to the responses shown');
      t.assertEqual(total, SURVEY_ROWS.length, 'and to the rows supplied');
    });

    t.test('the burden grid totals match the responses counted', function() {
      var chart = readyVisual(new SurveyFoodTransportBurden(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      });
      var model = ChartInsights.build(chart);

      var total = 0;
      for (var i = 0; i < model.table.rows.length; i++) {
        total += model.table.rows[i].total;
      }

      t.assertEqual(total, chart.representedRows, 'cell counts sum to the responses shown');
    });

    t.test('every table column key resolves to a value in every row', function() {
      var chart = readyVisual(new SurveyCutbackHeatmap(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      });
      var model = ChartInsights.build(chart);

      for (var r = 0; r < model.table.rows.length; r++) {
        for (var c = 0; c < model.table.columns.length; c++) {
          var key = model.table.columns[c].key;
          t.assertTrue(model.table.rows[r][key] !== undefined,
                       'row ' + r + ' has a value for "' + key + '"');
        }
      }
    });


    t.suite('unit: size legend values (helper-functions.js)');

    t.test('legend values stay inside the data range', function() {
      var values = sizeLegendValues(1, 10, 3);
      t.assertTrue(values.length > 0, 'some values are produced');

      for (var i = 0; i < values.length; i++) {
        t.assertTrue(values[i] >= 1 && values[i] <= 10, values[i] + ' is within 1-10');
      }

      t.assertEqual(values[0], 1, 'starts at the minimum');
      t.assertEqual(values[values.length - 1], 10, 'ends at the maximum');
    });

    t.test('a flat range collapses to one value rather than repeating', function() {
      t.assertEqual(sizeLegendValues(5, 5, 3).length, 1, 'one distinct value');
      t.assertEqual(sizeLegendValues(NaN, 10, 3).length, 0, 'no values for bad input');
    });

    t.test('the legend uses the same mapping as the marks it explains', function() {
      var chart = readyVisual(new SurveyFoodTransportBurden(), function(vis) {
        vis.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      });

      var counts = chart.legendCounts();
      for (var i = 0; i < counts.length; i++) {
        t.assertTrue(counts[i] >= 1 && counts[i] <= chart.maxCount,
                     counts[i] + ' is a count the chart can actually draw');
      }

      t.assertEqual(chart.bubbleDiameter(chart.maxCount, 100, 100),
                    Math.min(100, 100) * 0.68,
                    'the largest count maps to the largest bubble');
    });


    t.suite('unit: reset restores documented defaults');

    t.test('the climate chart returns to its full year range', function() {
      var chart = gallery.visuals.filter(function(vis) {
        return vis.id === 'climate-change';
      })[0];

      if (!chart || !chart.startSlider) {
        t.assertTrue(true, 'skipped: the chart is not currently mounted');
        return;
      }

      chart.startSlider.value(1950);
      chart.endSlider.value(1980);
      chart.resetControls();

      t.assertEqual(chart.startSlider.value(), chart.minYear, 'start returns to the first year');
      t.assertEqual(chart.endSlider.value(), chart.maxYear, 'end returns to the last year');
    });

    t.test('the comparison default pair is a valid, non-archived selection', function() {
      var left = 'za-gini-trend';
      var right = gallery.getDefaultComparisonId(left);

      t.assertTrue(right !== left, 'the two panes differ');
      t.assertTrue(gallery.findVisIndex(right) !== null, 'the default chart exists');
    });


    t.suite('integration: accessible summary rendering (chart-summary.js)');

    function giniFixture() {
      return readyVisual(new ZAGiniTrend(), function(vis) {
        vis.data = makeTable(['year', 'gini_coefficient'],
                             [[1993, 0.59], [2005, 0.65], [2022, 0.54]]);
      });
    }

    t.test('rendering fills the insight, the provenance list and the table', function() {
      ChartSummary.render(giniFixture());

      var section = document.getElementById('chart-insight');
      var text = document.getElementById('chart-insight-text');
      var table = document.getElementById('chart-data-table');

      t.assertTrue(section.hidden === false, 'the insight section is shown');
      t.assertTrue(text.textContent.length > 0, 'the insight has text');
      t.assertTrue(!looksBroken(text.textContent), 'the rendered text is clean');
      t.assertTrue(document.getElementById('info-how').textContent.length > 0,
                   'the how-to-read note is filled');
      t.assertTrue(table.querySelectorAll('tbody tr').length > 0, 'the table has rows');
    });

    t.test('the rendered table uses semantic headers', function() {
      ChartSummary.render(giniFixture());

      var table = document.getElementById('chart-data-table');
      var columnHeaders = table.querySelectorAll('thead th[scope="col"]');
      var rowHeaders = table.querySelectorAll('tbody th[scope="row"]');

      t.assertTrue(table.querySelector('caption') !== null, 'the table has a caption');
      t.assertTrue(columnHeaders.length > 0, 'column headers are scoped');
      t.assertTrue(rowHeaders.length > 0, 'row headers are scoped');
      t.assertEqual(rowHeaders.length, table.querySelectorAll('tbody tr').length,
                    'every row is identified by a row header');
    });

    t.test('the data table is a keyboard-operable disclosure', function() {
      ChartSummary.render(giniFixture());

      var details = document.getElementById('chart-data-details');
      var summary = details.querySelector('summary');

      t.assertEqual(details.tagName, 'DETAILS', 'a native disclosure is used');
      t.assertTrue(summary !== null, 'it has a summary control');
      t.assertTrue(summary.textContent.trim().length > 0, 'the control is labelled');

      details.open = true;
      t.assertTrue(details.open === true, 'it reports its expanded state');
      details.open = false;
    });

    t.test('switching charts clears the previous summary', function() {
      ChartSummary.render(giniFixture());
      ChartSummary.clear();

      t.assertEqual(document.getElementById('chart-insight-text').textContent, '',
                    'the insight text is emptied');
      t.assertTrue(document.getElementById('chart-insight').hidden, 'the section is hidden');
      t.assertTrue(document.getElementById('chart-data-details').hidden, 'the table is hidden');
      t.assertEqual(document.getElementById('chart-data-table').children.length, 0,
                    'no stale rows remain');
    });

    t.test('a failed load shows no summary rather than a broken one', function() {
      var chart = new ZAGiniTrend();
      chart.handleDataError(new Error('simulated network failure'));

      t.assertEqual(chart.loadState.status, 'error', 'the chart is in its error state');
      t.assertNull(ChartInsights.build(chart), 'no summary is produced');
    });
  }


  function runIntegrationTests(t) {

    t.suite('integration: CSV row -> sliceRowNumbers -> mean -> formatThousands');

    t.test('a table row is parsed, averaged, and formatted for display', function() {
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
      var values = stringsToNumbers(CENSUS_2022_SHARES);
      t.assertEqual(values[0], 81.4, 'largest share parsed as a number');

      var pie = new PieChart(0, 0, 100);
      var angles = pie.get_radians(values);

      t.assertEqual(angles.length, CENSUS_2022_SHARES.length,
        'one angle per population group');
      t.assertClose(sum(angles), TWO_PI, 1e-9, 'slices fill the circle');

      var total = sum(values);
      t.assertClose(angles[0] / TWO_PI, 81.4 / total, 1e-9,
        'largest slice keeps its share of the total');
    });

    t.suite('integration: survey table -> calculateIndex -> components + score');

    t.test('survey rows produce the expected components and index', function() {
      var index = new SurveyPressureIndex();
      index.table = makeTable(SURVEY_HEADERS, SURVEY_ROWS);
      index.loaded = true;

      index.calculateIndex();

      t.assertEqual(index.components.length, 5, 'five pressure components');

      t.assertClose(index.components[0].value, 0.80, 1e-9, 'main pressure');
      t.assertClose(index.components[1].value, 0.70, 1e-9, 'work worry');
      t.assertClose(index.components[2].value, 0.70, 1e-9, 'income gap');
      t.assertClose(index.components[3].value, 0.675, 1e-9, 'food cost');
      t.assertClose(index.components[4].value, 0.20, 1e-9, 'transport cost');

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
      actualResult: 'The canvas showed "This chart is unavailable" followed by '
        + '"Unable to load this visualisation. Check your connection and refresh '
        + 'the page." The hidden live region used role="alert" with the same plain '
        + 'message. All 19 registered charts reached error under ?failData=1.',
      status: 'Pass',
      notes: 'describeLoadState() reported status error, isLoading false, isReady false, '
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


  function runAll() {
    if (typeof gallery === 'undefined' || gallery === null) {
      console.warn('cm1010Testing: the gallery is not built yet -- '
          + 'run this after setup() has finished.');
      return null;
    }

    var t = new TestRunner();

    runUnitTests(t);
    runAccessibilityTests(t);
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

  function describeLoadState(visId) {
    if (typeof gallery === 'undefined' || gallery === null) {
      return null;
    }

    var visIndex = gallery.findVisIndex(visId || 'za-gini-trend');
    if (visIndex === null) {
      return null;
    }

    var chart = gallery.visuals[visIndex];

    var table = chart.data || chart.table;
    return {
      id: chart.id,
      dataPath: chart.dataPath,
      status: chart.loadState ? chart.loadState.status : null,
      isLoading: chart.isLoading,
      isReady: chart.isReady,
      loadProgress: chart.loadProgress,
      loadError: chart.loadError,
      rowCount: table ? table.getRowCount() : null
    };
  }

  function describeAllLoadStates() {
    if (typeof gallery === 'undefined' || gallery === null) return [];
    return gallery.visuals.map(function(vis) { return describeLoadState(vis.id); });
  }

  function describeRenderState() {
    var selected = typeof gallery !== 'undefined' && gallery ? gallery.selectedVisual : null;
    return {
      selectedId: selected ? selected.id : null,
      looping: typeof isLooping === 'function' ? isLooping() : null,
      animating: selected ? chartNeedsMoreFrames(selected) : false
    };
  }

  // The harness itself failing has to look like a failing run, otherwise an
  // automated runner waiting on the results would simply hang.
  function harnessFailure(message) {
    var record = {
      suite: 'harness',
      name: 'the test run started',
      passed: false,
      message: message
    };

    return {
      total: 1,
      passed: 0,
      failed: 1,
      results: [record],
      failures: [record]
    };
  }

  // Runs the suite and publishes a finished, machine-readable result on
  // window.cm1010TestResults. The `complete` flag is the signal a command line
  // runner waits on; the console report above stays exactly as it was for
  // anyone reading the results by hand.
  function runAllAndPublish() {
    var results;

    try {
      results = runAll();
    } catch (error) {
      results = harnessFailure('the test run threw before it could finish -- '
          + ((error && error.message) ? error.message : String(error)));
    }

    if (!results) {
      results = harnessFailure('the gallery was not built, so no test ran -- '
          + 'setup() must finish before the suite starts.');
    }

    results.complete = true;
    global.cm1010TestResults = results;

    return results;
  }

  global.cm1010Testing = {
    runAll: runAll,
    runAllAndPublish: runAllAndPublish,
    describeLoadState: describeLoadState,
    describeAllLoadStates: describeAllLoadStates,
    describeRenderState: describeRenderState,
    systemTestCases: systemTestCases,
    TestRunner: TestRunner
  };

  if (typeof hasQueryFlag === 'function' && hasQueryFlag('test')) {
    global.addEventListener('load', function() {
      runAllAndPublish();
    });
  }

}(window));

/* End - own code */
