function Gallery() {

  // ---- State ----

  this.visuals = [];
  this.selectedVisual = null;

  var self = this;

  // ---- Catalogue (menu + overview metadata for every visualisation) ----

  this.catalogue = [
    {
      title: 'South Africa Census',
      items: [
        {
          id: 'sa-population-group-census',
          name: 'Population group',
          title: 'South African population group distribution by census year',
          shows: 'Population group percentages for the selected census year.',
          finding: 'The pie chart shows how each population group contributes to the total population in that year.',
          source: 'Statistics South Africa census population group data, 1996-2022.',
          chartSource: 'Source: Stats SA Census 2022'
        },
        {
          id: 'sa-sex-age-2022',
          name: 'Sex and age',
          title: 'South African population by sex and age group, Census 2022',
          shows: 'Female and male percentages for each age group in Census 2022.',
          finding: 'The 50% line makes it easy to compare age groups where one sex is slightly larger.',
          source: 'Statistics South Africa Census 2022 sex by age data.',
          chartSource: 'Source: Stats SA Census 2022'
        },
        {
          id: 'sa-age-sex-bubble-2022',
          name: 'Age group size',
          title: 'Age group size and female share, Census 2022',
          shows: 'Each bubble is one age group. The x-axis is age midpoint, the y-axis is female percentage, and the bubble size is total population.',
          finding: 'The chart shows both the size of age groups and how the female share changes at older ages.',
          source: 'Statistics South Africa Census 2022 age and sex data.',
          chartSource: 'Source: Stats SA Census 2022'
        }
      ]
    },
    {
      title: 'Employment',
      items: [
        {
          id: 'sa-youth-unemployment',
          name: 'Youth unemployment',
          title: 'South African youth unemployment trend, 1991-2025',
          shows: 'Annual youth unemployment rate as a percentage.',
          finding: 'The line chart makes the long-term pattern easier to see than reading the table year by year.',
          source: 'World Bank / ILO South African youth unemployment data, 1991-2025.',
          chartSource: 'Source: World Bank / ILO'
        }
      ]
    },
    {
      title: 'Health',
      items: [
        {
          id: 'sa-life-expectancy',
          name: 'Life expectancy',
          title: 'South African life expectancy at birth by sex, 1960-2024',
          shows: 'Female, male, and total life expectancy at birth in years across the full time range.',
          finding: 'The 2000s dip and later recovery stand out clearly, and the end labels make it easy to compare the latest values.',
          source: 'World Bank life expectancy at birth indicators for South Africa, updated July 1, 2026, with data through 2024.',
          chartSource: 'Source: World Bank'
        }
      ]
    },
    {
      title: 'Climate',
      items: [
        {
          id: 'climate-change',
          name: 'Climate Change',
          title: 'Global surface temperature anomaly, 1880-2025',
          shows: 'Global annual surface temperature anomaly in degrees Celsius.',
          finding: 'The slider can focus on shorter periods while the full range shows the long-term warming pattern.',
          source: 'NASA GISTEMP v4 global temperature anomaly data, 1880-2025.',
          chartSource: 'Source: NASA GISTEMP v4'
        }
      ]
    },
    {
      title: 'Survey',
      items: [
        {
          id: 'survey-pressure-index',
          name: 'Pressure index',
          title: 'Mzansi Monthly Pressure Index',
          shows: 'A single survey pressure score built from main pressure, work worry, income reality, food cost, and transport cost.',
          finding: 'The index gives a quick overall view of how heavy the cost-of-living pressure feels across the survey responses.',
          source: 'Cleaned local survey response data. The dataset has no month column, so this is a survey-based current index.',
          chartSource: 'Source: local survey CSV'
        },
        {
          id: 'survey-cutback-heatmap',
          name: 'Cutback heatmap',
          title: 'Cutback Heatmap',
          shows: 'A heatmap of what respondents cut back on, split by student and work status.',
          finding: 'The darkest cells show where everyday sacrifices are most common, such as eating out, data, transport, subscriptions, or meat.',
          source: 'Raw local survey response data in data/south-africa/survey_responses.csv.',
          chartSource: 'Source: local survey CSV'
        },
        {
          id: 'survey-food-transport-burden',
          name: 'Food vs transport',
          title: 'Food vs Transport Burden Chart',
          shows: 'A burden grid comparing food-cost bands with transport-cost bands.',
          finding: 'Food and transport stand out together because they are daily survival costs, not optional spending.',
          source: 'Cleaned local survey response data in data/south-africa/survey_pressure_cleaned.csv.',
          chartSource: 'Source: local survey CSV'
        },
        {
          id: 'survey-income-reality-gap',
          name: 'Income reality gap',
          title: 'Income Reality Gap',
          shows: 'Average work-worry rating compared with average income-keeps-up rating for each status group.',
          finding: 'The gap shows where people feel high worry while also saying income is not keeping up.',
          source: 'Cleaned local survey response data in data/south-africa/survey_pressure_cleaned.csv.',
          chartSource: 'Source: local survey CSV'
        },
        {
          id: 'survey-status-pressure',
          name: 'Student vs worker',
          title: 'Student vs Worker Pressure Chart',
          shows: 'A status comparison for students, employed people, unemployed people, and people studying while working.',
          finding: 'The stacked bars make it easier to compare which pressure categories matter most in each group.',
          source: 'Cleaned local survey response data in data/south-africa/survey_pressure_cleaned.csv.',
          chartSource: 'Source: local survey CSV'
        },
        {
          id: 'survey-pressure-waffle',
          name: 'Survey waffle',
          title: 'Main cost pressure from survey responses',
          shows: 'A waffle chart showing the distribution of the real main cost-pressure question in the cleaned survey CSV.',
          finding: 'Food, transport, and data are the most common pressure categories in the survey responses.',
          source: 'Cleaned local survey response data in data/south-africa/survey_pressure_cleaned.csv, derived from data/south-africa/survey_responses.csv.',
          chartSource: 'Source: local survey CSV'
        }
      ]
    }
  ];

  // ---- Menu & navigation ----

  this.getMenuGroups = function() {
    return [{
      title: 'Overview',
      items: [{ id: 'overview', name: 'Overview' }]
    }].concat(this.catalogue);
  };

  this.getCatalogueItem = function(visId) {
    for (var i = 0; i < this.catalogue.length; i++) {
      var group = this.catalogue[i];

      for (var j = 0; j < group.items.length; j++) {
        if (group.items[j].id == visId) {
          return group.items[j];
        }
      }
    }

    return null;
  };

  this.buildMenu = function() {
    var menu = document.getElementById('visuals-menu');
    menu.innerHTML = '';
    var groups = this.getMenuGroups();

    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
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

  // ---- Overview cards ----

  this.buildOverviewCards = function() {
    var cards = document.getElementById('overview-cards');
    cards.innerHTML = '';

    for (var i = 0; i < this.catalogue.length; i++) {
      var group = this.catalogue[i];
      var groupEl = document.createElement('section');
      groupEl.className = 'overview-group';

      var heading = document.createElement('h3');
      heading.className = 'overview-group-title';
      heading.textContent = group.title;
      groupEl.appendChild(heading);

      var groupCards = document.createElement('div');
      groupCards.className = 'card-grid';

      for (var j = 0; j < group.items.length; j++) {
        var item = group.items[j];

        if (this.findVisIndex(item.id) == null) {
          continue;
        }

        var card = document.createElement('article');
        card.className = 'dataset-card';

        var title = document.createElement('h4');
        title.textContent = item.name;

        var summary = document.createElement('p');
        summary.textContent = item.shows;

        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Open visualisation';
        button.dataset.visualId = item.id;
        button.addEventListener('click', function() {
          self.selectVisual(this.dataset.visualId);
        });

        card.appendChild(title);
        card.appendChild(summary);
        card.appendChild(button);
        groupCards.appendChild(card);
      }

      if (groupCards.children.length > 0) {
        groupEl.appendChild(groupCards);
        cards.appendChild(groupEl);
      }
    }
  };

  this.updateSelectedMenu = function(visId) {
    var buttons = document.querySelectorAll('.menu-button');

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('selected', buttons[i].dataset.visualId == visId);
    }
  };

  // ---- View switching (overview <-> chart) ----

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
    var metadata = this.getCatalogueItem(vis.id);

    if (metadata == null) {
      metadata = {
        title: vis.name,
        shows: '',
        finding: '',
        source: '',
        chartSource: ''
      };
    }

    document.getElementById('overview').classList.add('hidden');
    document.getElementById('chart-view').classList.remove('hidden');
    document.getElementById('chart-title').textContent = metadata.title;
    document.getElementById('info-title').textContent = metadata.title;
    document.getElementById('info-shows').textContent = 'Still working on this.';
    document.getElementById('info-finding').textContent = 'Still working on this.';
    document.getElementById('info-source').textContent = 'Still working on this.';
    document.getElementById('chart-source').textContent = metadata.chartSource;
    this.updateSelectedMenu(vis.id);
  };

  // ---- Visualisation registry ----

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
