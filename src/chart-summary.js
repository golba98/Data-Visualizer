/* Start - own code */


// Turns a visualisation's own data into accessible HTML:
// a key-insight line, a how-to-read note, a provenance list, and a data table.
// Summary models come from ChartInsights; this file only renders them.
(function(global) {
  'use strict';

  var MAX_TABLE_ROWS = 60;
  var MANIFEST_PATH = 'data/inequality/za_dashboard_sources.csv';

  function byId(id) {
    return typeof document === 'undefined' ? null : document.getElementById(id);
  }

  function setSectionText(sectionId, textId, value) {
    var section = byId(sectionId);
    var target = byId(textId);
    var hasValue = typeof value === 'string' && value.length > 0;

    if (target) {
      target.textContent = hasValue ? value : '';
    }
    if (section) {
      section.hidden = !hasValue;
    }

    return hasValue;
  }

  function clearChildren(node) {
    if (!node) return;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }


  // Reads the shared dataset manifest so provenance is looked up, not hard-coded.
  var DataProvenance = {
    status: 'idle',
    entries: {},

    load: function() {
      if (this.status !== 'idle') return;
      if (typeof loadTable !== 'function') return;

      var self = this;
      this.status = 'loading';

      try {
        loadTable(
          typeof resolveDataPath === 'function' ? resolveDataPath(MANIFEST_PATH) : MANIFEST_PATH,
          'csv',
          'header',
          function(table) {
            self.absorb(table);
          },
          function() {
            self.status = 'error';
          });
      } catch (error) {
        this.status = 'error';
      }
    },

    absorb: function(table) {
      if (!table || typeof table.getRowCount !== 'function') {
        this.status = 'error';
        return;
      }

      for (var r = 0; r < table.getRowCount(); r++) {
        var filename = table.getString(r, 'filename');
        if (!filename) continue;

        this.entries[filename] = {
          source: table.getString(r, 'source_name'),
          url: table.getString(r, 'source_url'),
          period: table.getString(r, 'time_period'),
          status: table.getString(r, 'data_status'),
          limitation: table.getString(r, 'limitations')
        };
      }

      this.status = 'ready';

      if (typeof gallery !== 'undefined' && gallery && gallery.selectedVisual) {
        ChartSummary.render(gallery.selectedVisual);
      }
    },

    // Accepts a full path or a bare filename.
    get: function(path) {
      if (!path) return null;
      var name = String(path).split('/').pop();
      return this.entries[name] || null;
    }
  };


  // Non-finite-safe formatting so a summary can never print NaN.
  var SummaryStats = {
    isNumber: function(value) {
      return typeof value === 'number' && isFinite(value);
    },

    format: function(value, decimals) {
      if (!SummaryStats.isNumber(value)) return '—';
      var places = decimals === undefined ? 2 : decimals;
      return value.toFixed(places);
    },

    formatCount: function(value) {
      if (!SummaryStats.isNumber(value)) return '—';
      return typeof formatThousands === 'function'
        ? formatThousands(value)
        : String(Math.round(value));
    },

    percent: function(part, whole, decimals) {
      if (!SummaryStats.isNumber(part) || !SummaryStats.isNumber(whole) || whole === 0) {
        return '—';
      }
      return SummaryStats.format((part / whole) * 100, decimals === undefined ? 1 : decimals);
    },

    // Returns the entry with the largest numeric value, or null when none is usable.
    extreme: function(items, valueOf, wantLargest) {
      var best = null;
      var bestValue = null;

      for (var i = 0; i < (items || []).length; i++) {
        var value = valueOf(items[i], i);
        if (!SummaryStats.isNumber(value)) continue;

        if (bestValue === null
            || (wantLargest ? value > bestValue : value < bestValue)) {
          bestValue = value;
          best = { item: items[i], index: i, value: value };
        }
      }

      return best;
    },

    highest: function(items, valueOf) {
      return SummaryStats.extreme(items, valueOf, true);
    },

    lowest: function(items, valueOf) {
      return SummaryStats.extreme(items, valueOf, false);
    },

    // Describes a change without implying a cause.
    describeChange: function(from, to, decimals, unit) {
      if (!SummaryStats.isNumber(from) || !SummaryStats.isNumber(to)) return '—';
      var delta = to - from;
      if (delta === 0) return 'unchanged';
      var direction = delta > 0 ? 'higher' : 'lower';
      return SummaryStats.format(Math.abs(delta), decimals)
        + (unit ? ' ' + unit : '') + ' ' + direction;
    },

    // Converts a p5 Table column into finite numbers, dropping unusable cells.
    numericColumn: function(table, column) {
      var values = [];
      if (!table || typeof table.getRowCount !== 'function') return values;

      for (var r = 0; r < table.getRowCount(); r++) {
        var value = Number(table.getString(r, column));
        if (isFinite(value)) values.push(value);
      }
      return values;
    }
  };


  // Builds a real table with a caption, column headers and row headers.
  function renderDataTable(vis, model) {
    var details = byId('chart-data-details');
    var table = byId('chart-data-table');
    if (!details || !table) return false;

    var data = (model && model.table) || null;
    if (!data && typeof getVisualExportData === 'function' && vis && vis.loaded) {
      var exported = getVisualExportData(vis);
      if (exported && exported.columns && exported.rows && exported.rows.length) {
        data = {
          caption: 'Underlying data for ' + (vis.name || 'this chart') + '.',
          columns: exported.columns.map(function(name) {
            return { key: name, label: name.replace(/_/g, ' ') };
          }),
          rows: exported.rows
        };
      }
    }

    clearChildren(table);

    if (!data || !data.columns || !data.columns.length || !data.rows || !data.rows.length) {
      var emptyCaption = byId('chart-data-caption');
      if (emptyCaption) emptyCaption.textContent = '';
      details.hidden = true;
      details.open = false;
      return false;
    }

    var shown = data.rows.slice(0, MAX_TABLE_ROWS);
    var captionText = data.caption || 'Data shown in this chart.';
    if (data.rows.length > shown.length) {
      captionText += ' Showing the first ' + shown.length + ' of '
        + data.rows.length + ' rows; use Download CSV for the full dataset.';
    }

    var caption = document.createElement('caption');
    caption.className = 'visually-hidden';
    caption.textContent = captionText;
    table.appendChild(caption);

    var visibleCaption = byId('chart-data-caption');
    if (visibleCaption) visibleCaption.textContent = captionText;

    var head = document.createElement('thead');
    var headRow = document.createElement('tr');
    data.columns.forEach(function(column) {
      var cell = document.createElement('th');
      cell.setAttribute('scope', 'col');
      cell.textContent = column.label || column.key;
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    table.appendChild(head);

    var body = document.createElement('tbody');
    shown.forEach(function(row) {
      var bodyRow = document.createElement('tr');

      data.columns.forEach(function(column, columnIndex) {
        var value = row[column.key];
        var text = (value === null || value === undefined || value === '')
          ? '—'
          : String(value);

        // The first column identifies the row, so it is a row header.
        var cell = document.createElement(columnIndex === 0 ? 'th' : 'td');
        if (columnIndex === 0) cell.setAttribute('scope', 'row');
        cell.textContent = text;
        bodyRow.appendChild(cell);
      });

      body.appendChild(bodyRow);
    });
    table.appendChild(body);

    details.hidden = false;
    return true;
  }


  function renderProvenance(model) {
    var section = byId('info-data-section');
    var list = byId('info-data-details');
    if (!section || !list) return false;

    clearChildren(list);

    var provenance = (model && model.provenance) || null;
    var keys = provenance ? Object.keys(provenance) : [];
    var written = 0;

    for (var i = 0; i < keys.length; i++) {
      var value = provenance[keys[i]];
      if (value === null || value === undefined || value === '') continue;

      var term = document.createElement('dt');
      term.textContent = keys[i];

      var definition = document.createElement('dd');
      definition.textContent = String(value);

      list.appendChild(term);
      list.appendChild(definition);
      written++;
    }

    section.hidden = written === 0;
    return written > 0;
  }


  var ChartSummary = {
    lastKey: null,

    // Cheap signature so draw() can call sync() every frame without rebuilding.
    keyFor: function(vis) {
      if (!vis) return 'none';
      var status = vis.loadState ? vis.loadState.status : (vis.loaded ? 'ready' : 'idle');
      var controlState = typeof vis.summaryKey === 'function' ? vis.summaryKey() : '';
      return vis.id + '|' + status + '|' + DataProvenance.status + '|' + controlState;
    },

    clear: function() {
      setSectionText('chart-insight', 'chart-insight-text', '');
      setSectionText('chart-insight', 'chart-insight-caveat', '');
      setSectionText('info-how-section', 'info-how', '');

      var caveat = byId('chart-insight-caveat');
      if (caveat) caveat.hidden = true;

      renderProvenance(null);
      renderDataTable(null, null);

      this.lastKey = null;
    },

    render: function(vis) {
      if (!vis) {
        this.clear();
        return null;
      }

      var model = null;
      if (typeof ChartInsights !== 'undefined' && ChartInsights) {
        model = ChartInsights.build(vis);
      }

      var hasInsight = setSectionText('chart-insight', 'chart-insight-text',
                                      model ? model.insight : '');

      var caveat = byId('chart-insight-caveat');
      if (caveat) {
        var caveatText = (model && hasInsight && model.caveat) ? model.caveat : '';
        caveat.textContent = caveatText;
        caveat.hidden = caveatText.length === 0;
      }

      setSectionText('info-how-section', 'info-how', model ? model.howToRead : '');
      renderProvenance(model);
      renderDataTable(vis, model);

      // A chart may be 'ready' before draw() has computed its aggregates, so only
      // cache the key once a model actually came back.
      this.lastKey = model ? this.keyFor(vis) : null;
      return model;
    },

    // Called from draw(); rebuilds only when the visualisation's state changed.
    sync: function(vis) {
      var key = this.keyFor(vis);
      if (key === this.lastKey) return;
      this.render(vis);
    }
  };


  global.ChartSummary = ChartSummary;
  global.SummaryStats = SummaryStats;
  global.DataProvenance = DataProvenance;
  global.renderChartSummary = function(vis) { return ChartSummary.render(vis); };
  global.clearChartSummary = function() { ChartSummary.clear(); };
}(window));

/* End - own code */
