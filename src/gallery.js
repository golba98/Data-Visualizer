function Gallery() {

  // ---- State ----

  this.visuals = [];
  this.selectedVisual = null;

  var self = this;

  // ---- Catalogue (menu + overview metadata for every visualisation) ----

  this.catalogue = [
    {
      title: 'South African Inequality, Explained',
      items: [
        {
          id: 'za-gini-trend',
          name: 'National inequality',
          title: 'South African Gini coefficient over time',
          shows: 'How the Gini coefficient, a common way to measure inequality, has moved in South Africa over time.',
          finding: 'I started with this chart to set the scene before getting into who owns what.',
          source: 'data/inequality/za_gini_trend.csv, from the World Bank Poverty and Inequality Platform via Our World in Data.',
          chartSource: 'Source: World Bank PIP via Our World in Data, 1993-2022'
        },
        {
          id: 'za-population-group-earnings',
          name: 'Population group earnings',
          title: 'Population share compared with mean earnings',
          shows: 'How big each population group is compared with how much people in that group earn on average, per Stats SA.',
          finding: "Population size and average earnings don't line up: the White population group is a small share of the population but earns a lot more on average in the Stats SA data I used.",
          source: 'data/inequality/za_population_group_shares.csv and data/inequality/za_population_group_earnings.csv, from Stats SA.',
          chartSource: 'Sources: Stats SA population group table, 2022; Stats SA earnings article, 2011-2015'
        },
        {
          id: 'za-dwelling-ownership-by-group',
          name: 'Dwelling ownership',
          title: 'Dwelling tenure by population group',
          shows: 'Who owns, rents, or lives rent-free, broken down by the population group of the household head.',
          finding: 'White, Indian/Asian, and Coloured household heads own their homes at higher rates than Black African household heads in this survey. This is about tenure, not total wealth.',
          source: 'data/inequality/za_dwelling_ownership_by_group.csv, from the Stats SA General Household Survey 2024.',
          chartSource: 'Source: Stats SA General Household Survey 2024, Table 8.6'
        },
        {
          id: 'za-land-ownership-by-group',
          name: 'Land ownership',
          title: 'Agricultural land ownership by population group',
          shows: 'Who individually owns farms and agricultural land, by population group, according to the 2017 Land Audit.',
          finding: 'White individual landowners held the biggest share of individually owned farms and agricultural land in this audit.',
          source: 'data/inequality/za_land_ownership_by_group.csv, from the Department of Rural Development and Land Reform Land Audit Report 2017.',
          chartSource: 'Source: Land Audit Report 2017, farms and agricultural holdings owned by individuals'
        },
        {
          id: 'za-income-share-trend',
          name: 'Top income share',
          title: 'Top 10 percent share of before-tax income',
          shows: 'How much of all before-tax income goes to the richest 10 percent, based on WID estimates.',
          finding: 'This shows income concentration pretty clearly: one small group holds a large chunk of total income.',
          source: 'data/inequality/za_income_distribution.csv, from WID.world via Our World in Data.',
          chartSource: 'Source: WID.world via Our World in Data, 1993-2014'
        },
        {
          id: 'za-ownership-comparison',
          name: 'Top 10 concentration',
          title: 'Top 10 percent population share versus income and wealth share',
          shows: 'The top 10 percent by population, compared with what share of income and wealth that same top 10 percent actually holds.',
          finding: 'This is the key comparison for me: a group that makes up 10 percent of the population holds a much bigger share of income and wealth.',
          source: 'data/inequality/za_population_groups.csv, data/inequality/za_income_distribution.csv, and data/inequality/za_wealth_distribution.csv, from WID.world via Our World in Data.',
          chartSource: 'Source: WID.world via Our World in Data; population share is a derived reference group'
        },
        {
          id: 'za-poverty-context',
          name: 'Poverty indicators',
          title: 'Poverty indicators as financial-pressure context',
          shows: "A few different poverty measures, kept separate because they don't all mean the same thing.",
          finding: "I added this for context on financial pressure, but I've kept the different poverty definitions apart rather than treating them as one number.",
          source: 'data/inequality/za_poverty_indicators.csv, from World Bank PIP via Our World in Data and Stats SA.',
          chartSource: 'Sources: World Bank PIP via OWID and Stats SA Poverty Trends, 1993-2023'
        }
      ]
    },
    {
      title: 'Survey App: Everyday Financial Pressure',
      items: [
        {
          id: 'survey-pressure-index',
          name: 'Pressure index',
          title: 'How pressured are people feeling? (demo)',
          shows: 'A single 0-100 score built by combining placeholder answers on pressure, work worry, income, food, and transport costs.',
          finding: "This is the shape I want the final index to take — right now it's running on invented numbers standing in for real answers.",
          source: 'data/survey/za_survey_demo.csv — a made-up dataset I put together to build the app before real responses exist.',
          chartSource: 'Placeholder data, not real responses. Swapping this out is on my to-do list.'
        },
        {
          id: 'survey-pressure-waffle',
          name: 'Cost pressure mix',
          title: 'What people worry about most (demo)',
          shows: "A 100-square waffle chart splitting invented respondents by their main cost pressure — mostly to see if the layout works.",
          finding: "This is the structure I'm planning for the real survey; the counts themselves don't mean anything yet.",
          source: 'data/survey/za_survey_demo.csv, a stand-in dataset while I wait on actual responses.',
          chartSource: "Mock data — update once collection is done."
        },
        {
          id: 'survey-food-transport-burden',
          name: 'Food & transport',
          title: 'Food cost against transport cost (demo)',
          shows: 'A grid crossing made-up food-cost bands against transport-cost bands, sized by how many fake respondents land in each cell.',
          finding: "Food and transport are the two costs I most want to dig into once real survey data comes in.",
          source: 'data/survey/za_survey_demo.csv, rows I invented just to test this chart.',
          chartSource: 'Test data only, not from real respondents.'
        },
        {
          id: 'survey-cutback-heatmap',
          name: 'What gets cut',
          title: 'What people say they cut back on (demo)',
          shows: 'A heatmap crossing invented cutback answers against status group, darker where more fake rows land.',
          finding: "The goal is to connect financial pressure to actual behaviour — but every row here is made up for now.",
          source: 'data/survey/za_survey_demo.csv, placeholder rows standing in for the real survey.',
          chartSource: 'Demo only — needs replacing once responses are collected.'
        },
        {
          id: 'survey-income-reality-gap',
          name: 'Worry vs. income',
          title: 'Does income keep up with the worry? (demo)',
          shows: 'A dumbbell chart lining up average work-worry ratings against average income-keeps-up ratings for each status group.',
          finding: "I want this to show how worry and income adequacy pull apart across groups — but it's all invented numbers until real responses land.",
          source: 'data/survey/za_survey_demo.csv, fabricated for development purposes only.',
          chartSource: 'Not evidence — placeholder responses.'
        },
        {
          id: 'survey-status-pressure',
          name: 'Pressure by status',
          title: 'Who feels which pressure most? (demo)',
          shows: 'Stacked bars breaking down invented main-pressure answers by student, employed, unemployed, and studying-and-working groups.',
          finding: "This is roughly how I want to compare groups once the placeholder rows are gone.",
          source: 'data/survey/za_survey_demo.csv, made-up rows used to shape the chart ahead of real data.',
          chartSource: 'Draft data — to be replaced with real survey responses.'
        }
      ]
    },
    {
      title: 'Archived: Earlier Drafts',
      items: [
        {
          id: 'sa-population-group-census',
          name: 'Population by census year',
          title: 'South African population by group, census 1996-2022',
          shows: 'A pie chart of population-group shares, with a dropdown to switch between census years.',
          finding: "An early version of the population-group story, from before I switched to comparing group size against earnings and ownership.",
          source: 'data/archive/population_group_census_1996_2022.csv, from Stats SA census figures.',
          chartSource: 'Source: Stats SA census data, 1996-2022'
        },
        {
          id: 'sa-sex-age-2022',
          name: 'Population by sex and age',
          title: 'South African population by sex and age group, census 2022',
          shows: 'Female and male population share for each age band in the 2022 census, split at the 50% line.',
          finding: 'Left over from when this project was more of a general census dashboard.',
          source: 'data/archive/sex_by_age_2022.csv, from Stats SA Census 2022.',
          chartSource: 'Source: Stats SA Census 2022'
        },
        {
          id: 'sa-age-sex-bubble-2022',
          name: 'Age group size and female share',
          title: 'Age group size versus female share, census 2022',
          shows: 'Each bubble is an age group: position marks female share, size marks how many people are in that group.',
          finding: "Another piece of the original census dashboard, kept here once the project's focus moved to inequality.",
          source: 'data/archive/age_sex_bubble_2022.csv, from Stats SA Census 2022.',
          chartSource: 'Source: Stats SA Census 2022'
        },
        {
          id: 'sa-youth-unemployment',
          name: 'Youth unemployment trend',
          title: 'South African youth unemployment, 1991-2025',
          shows: 'The youth unemployment rate across more than three decades.',
          finding: 'Part of the project before I narrowed the scope down to income, wealth, and ownership.',
          source: 'data/archive/sa_youth_unemployment_1991_2025.csv, from World Bank/ILO estimates.',
          chartSource: 'Source: World Bank / ILO, 1991-2025'
        },
        {
          id: 'sa-life-expectancy',
          name: 'Life expectancy by sex',
          title: 'South African life expectancy at birth, 1960-2024',
          shows: 'Female, male, and overall life expectancy at birth across more than 60 years.',
          finding: "One of the first charts I built for this project, kept here even though it fell outside the final inequality story.",
          source: 'data/archive/sa_life_expectancy_1960_2024.csv, from World Bank indicators.',
          chartSource: 'Source: World Bank, 1960-2024'
        },
        {
          id: 'climate-change',
          name: 'Global temperature anomaly',
          title: 'Global surface temperature anomaly, 1880-2025',
          shows: 'How much warmer or cooler each year has been compared with the long-term global average.',
          finding: "Not related to South African inequality at all — an early experiment from before I settled on this topic.",
          source: 'data/archive/global_temperature_anomaly_1880_2025.csv, from NASA GISTEMP v4.',
          chartSource: 'Source: NASA GISTEMP v4, 1880-2025'
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
    document.getElementById('info-shows').textContent = metadata.shows;
    document.getElementById('info-finding').textContent = metadata.finding;
    document.getElementById('info-source').textContent = metadata.source;
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
