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
      title: 'Tech Diversity',
      items: [
        { id: 'tech-diversity-race', name: 'Race' },
        { id: 'tech-diversity-gender', name: 'Gender' }
      ]
    },
    {
      title: 'Pay Gap',
      items: [
        { id: 'pay-gap-by-job-2017', name: 'By job: 2017' },
        { id: 'pay-gap-timeseries', name: '1997-2017' }
      ]
    },
    {
      title: 'Climate',
      items: [{ id: 'climate-change', name: 'Climate Change' }]
    }
  ];

  this.metadata = {
    'tech-diversity-race': {
      title: 'Racial diversity by company',
      shows: 'Proportional racial composition for the selected technology company.',
      finding: 'Representation varies substantially by company, so comparison is useful.',
      source: 'Tech diversity race dataset, 2018.'
    },
    'tech-diversity-gender': {
      title: 'Gender representation by company',
      shows: 'Female and male employee proportions across technology companies.',
      finding: 'Several companies show a visible imbalance between female and male employees.',
      source: 'Tech diversity gender dataset, 2018.'
    },
    'pay-gap-by-job-2017': {
      title: 'Gender composition and hourly pay gap, 2017',
      shows: 'Occupation categories by proportion of female employees and hourly pay gap.',
      finding: 'Occupations differ in both gender composition and pay gap, with larger categories shown as larger points.',
      source: 'Occupation hourly pay by gender dataset, 2017.'
    },
    'pay-gap-timeseries': {
      title: 'Gender pay gap trend, 1997-2017',
      shows: 'Long-term trend in the reported gender hourly pay gap.',
      finding: 'The pay gap changes over time and should be read as a trend, not a single-year result.',
      source: 'Gender pay gap time-series dataset, 1997-2017.'
    },
    'climate-change': {
      title: 'Surface temperature change over time',
      shows: 'Long-term surface temperature change across years.',
      finding: 'The chart shows the direction and scale of long-term temperature change.',
      source: 'Surface temperature dataset.'
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
