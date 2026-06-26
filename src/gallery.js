function Gallery() {

  this.visuals = [];
  this.selectedVisual = null;

  var self = this;

  this.groups = [
    {
      title: 'Overview',
      items: [{ id: 'overview', name: 'Overview' }]
    },
    {
      title: 'South Africa Census',
      items: [
        { id: 'sa-population-group-census', name: 'Population group' },
        { id: 'sa-sex-age-2022', name: 'Sex and age' },
        { id: 'sa-age-sex-bubble-2022', name: 'Age group size' }
      ]
    },
    {
      title: 'Employment',
      items: [
        { id: 'sa-youth-unemployment', name: 'Youth unemployment' }
      ]
    },
    {
      title: 'Climate',
      items: [{ id: 'climate-change', name: 'Climate Change' }]
    }
  ];

  this.metadata = {
    'sa-population-group-census': {
      title: 'South African population group distribution by census year',
      shows: 'Population group percentages for the selected census year.',
      finding: 'The pie chart shows how each population group contributes to the total population in that year.',
      source: 'Statistics South Africa census population group data, 1996-2022.',
      chartSource: 'Source: Stats SA Census 2022'
    },
    'sa-sex-age-2022': {
      title: 'South African population by sex and age group, Census 2022',
      shows: 'Female and male percentages for each age group in Census 2022.',
      finding: 'The 50% line makes it easy to compare age groups where one sex is slightly larger.',
      source: 'Statistics South Africa Census 2022 sex by age data.',
      chartSource: 'Source: Stats SA Census 2022'
    },
    'sa-age-sex-bubble-2022': {
      title: 'Age group size and female share, Census 2022',
      shows: 'Each bubble is one age group. The x-axis is age midpoint, the y-axis is female percentage, and the bubble size is total population.',
      finding: 'The chart shows both the size of age groups and how the female share changes at older ages.',
      source: 'Statistics South Africa Census 2022 age and sex data.',
      chartSource: 'Source: Stats SA Census 2022'
    },
    'sa-youth-unemployment': {
      title: 'South African youth unemployment trend, 1991-2025',
      shows: 'Annual youth unemployment rate as a percentage.',
      finding: 'The line chart makes the long-term pattern easier to see than reading the table year by year.',
      source: 'World Bank / ILO South African youth unemployment data, 1991-2025.',
      chartSource: 'Source: World Bank / ILO'
    },
    'climate-change': {
      title: 'Global surface temperature anomaly, 1880-2025',
      shows: 'Global annual surface temperature anomaly in degrees Celsius.',
      finding: 'The slider can focus on shorter periods while the full range shows the long-term warming pattern.',
      source: 'NASA GISTEMP v4 global temperature anomaly data, 1880-2025.',
      chartSource: 'Source: NASA GISTEMP v4'
    }
  };

  this.buildMenu = function() {
    var menu = document.getElementById('visuals-menu');
    menu.innerHTML = '';

    for (var i = 0; i < this.groups.length; i++) {
      var group = this.groups[i];
      var groupEl = document.createElement('section');
      groupEl.className = 'menu-group';

      var heading = document.createElement('h3');
      heading.className = 'menu-group-title';
      heading.textContent = group.title;
      groupEl.appendChild(heading);

      var list = document.createElement('ul');
      list.className = 'menu-list';

      for (var j = 0; j < group.items.length; j++) {
        var item = group.items[j];
        var listItem = document.createElement('li');
        listItem.className = 'menu-item';

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu-button';
        button.dataset.visualId = item.id;
        button.textContent = item.name;
        button.addEventListener('click', function() {
          var visualId = this.dataset.visualId;

          if (visualId == 'overview') {
            self.showOverview();
          } else {
            self.selectVisual(visualId);
          }
        });

        listItem.appendChild(button);
        list.appendChild(listItem);
      }

      groupEl.appendChild(list);
      menu.appendChild(groupEl);
    }

    this.updateSelectedMenu('overview');
  };

  this.buildOverviewCards = function() {
    var cards = document.getElementById('overview-cards');
    cards.innerHTML = '';

    for (var i = 0; i < this.visuals.length; i++) {
      var vis = this.visuals[i];
      var metadata = this.metadata[vis.id];
      var card = document.createElement('article');
      card.className = 'dataset-card';

      var title = document.createElement('h3');
      title.textContent = vis.name;

      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Open visualisation';
      button.dataset.visualId = vis.id;
      button.addEventListener('click', function() {
        self.selectVisual(this.dataset.visualId);
      });

      card.appendChild(title);
      card.appendChild(button);
      cards.appendChild(card);
    }
  };

  this.updateSelectedMenu = function(visId) {
    var buttons = document.querySelectorAll('.menu-button');

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('selected', buttons[i].dataset.visualId == visId);
    }
  };

  this.showOverview = function() {
    if (this.selectedVisual != null
        && this.selectedVisual.hasOwnProperty('destroy')) {
      this.selectedVisual.destroy();
    }

    this.selectedVisual = null;
    this.clearChartControls();
    clear();
    noLoop();

    document.getElementById('overview').classList.remove('hidden');
    document.getElementById('chart-view').classList.add('hidden');
    this.updateSelectedMenu('overview');
  };

  this.clearChartControls = function() {
    var controls = document.getElementById('chart-controls');
    controls.innerHTML = '';
  };

  this.showChartDetails = function(vis) {
    var metadata = this.metadata[vis.id];

    document.getElementById('overview').classList.add('hidden');
    document.getElementById('chart-view').classList.remove('hidden');
    document.getElementById('chart-title').textContent = metadata.title;
    document.getElementById('info-title').textContent = metadata.title;
    document.getElementById('info-shows').textContent = metadata.shows;
    document.getElementById('info-finding').textContent = metadata.finding;
    document.getElementById('info-source').textContent = metadata.source;
    document.getElementById('chart-source').textContent = metadata.chartSource;
    this.updateSelectedMenu(vis.id);
  };

  // Add a new visualisation to the gallery.
  this.addVisual = function(vis) {

    // Check that the vis object has an id and name.
    if (!vis.hasOwnProperty('id')
        || !vis.hasOwnProperty('name')) {
      alert('Make sure your visualisation has an id and name!');
    }

    // Check that the vis object has a unique id.
    if (this.findVisIndex(vis.id) != null) {
      alert(`Vis '${vis.name}' has a duplicate id: '${vis.id}'`);
    }

    this.visuals.push(vis);

    // Preload data if necessary.
    if (vis.hasOwnProperty('preload')) {
      vis.preload();
    }
  };

  this.findVisIndex = function(visId) {
    // Search through the visualisations looking for one with the id
    // matching visId.
    for (var i = 0; i < this.visuals.length; i++) {
      if (this.visuals[i].id == visId) {
        return i;
      }
    }

    // Visualisation not found.
    return null;
  };

  this.selectVisual = function(visId) {
    var visIndex = this.findVisIndex(visId);

    if (visIndex != null) {
      // If the current visualisation has a deselect method run it.
      if (this.selectedVisual != null
          && this.selectedVisual.hasOwnProperty('destroy')) {
        this.selectedVisual.destroy();
      }
      this.clearChartControls();

      // Select the visualisation in the gallery.
      this.selectedVisual = this.visuals[visIndex];
      this.showChartDetails(this.selectedVisual);

      if (typeof resizeChartCanvas == 'function') {
        resizeChartCanvas();
      }

      // Initialise visualisation if necessary.
      if (this.selectedVisual.hasOwnProperty('setup')) {
        this.selectedVisual.setup();
      }

      // Enable animation in case it has been paused by the current
      // visualisation.
      loop();
    }
  };

  this.buildMenu();
}
