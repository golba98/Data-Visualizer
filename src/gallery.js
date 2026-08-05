function Gallery() {

  // ---- State ----

  this.visuals = [];
  this.selectedVisual = null;
  this.activeSectionId = 'overview';
  this.isAboutOpen = false;

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
          shows: 'The Gini coefficient in South Africa from 1993 to 2022, measuring overall income inequality.',
          finding: 'National inequality has remained consistently high over the past three decades.',
          source: 'World Bank Poverty and Inequality Platform via Our World in Data, 1993-2022.',
          chartSource: 'Source: World Bank PIP via Our World in Data, 1993-2022'
        },
        {
          id: 'za-population-group-earnings',
          name: 'Population earnings',
          title: 'Population share compared with mean earnings',
          shows: 'Population-group size is compared with average monthly earnings.',
          finding: 'Average earnings differ greatly between population groups.',
          source: 'Stats SA Census 2022 and Stats SA earnings data, 2011–2015.',
          chartSource: 'Sources: Stats SA population table, 2022; Stats SA earnings article, 2011-2015'
        },
        {
          id: 'za-dwelling-ownership-by-group',
          name: 'Dwelling ownership',
          title: 'Dwelling tenure by population group',
          shows: 'Household dwelling tenure split into owned, rented, and rent-free housing by population group.',
          finding: 'Housing tenure rates vary across population groups.',
          source: 'Stats SA General Household Survey 2024.',
          chartSource: 'Source: Stats SA General Household Survey 2024, Table 8.6'
        },
        {
          id: 'za-land-ownership-by-group',
          name: 'Land ownership',
          title: 'Agricultural land ownership by population group',
          shows: 'Individual ownership shares of farms and agricultural land by population group.',
          finding: 'Individual agricultural land ownership is concentrated within specific population groups.',
          source: 'Department of Rural Development and Land Reform Land Audit Report 2017.',
          chartSource: 'Source: Land Audit Report 2017, farms and agricultural holdings owned by individuals'
        },
        {
          id: 'za-income-share-trend',
          name: 'Top income share',
          title: 'Top 10 percent share of before-tax income',
          shows: 'The share of total before-tax national income received by the top 10 percent of income earners.',
          finding: 'The top 10 percent consistently receives more than half of all national income.',
          source: 'WID.world via Our World in Data, 1993-2014.',
          chartSource: 'Source: WID.world via Our World in Data, 1993-2014'
        },
        {
          id: 'za-ownership-comparison',
          name: 'Top 10 concentration',
          title: 'Top 10 percent population share versus income and wealth share',
          shows: 'A 10 percent population reference group compared with its share of national income and wealth.',
          finding: 'A small percentage of the population holds a disproportionately large share of income and wealth.',
          source: 'WID.world via Our World in Data.',
          chartSource: 'Source: WID.world via Our World in Data'
        },
        {
          id: 'za-poverty-context',
          name: 'Poverty indicators',
          title: 'Poverty indicators as financial-pressure context',
          shows: 'Different poverty measures tracking relative and absolute poverty levels over time.',
          finding: 'Poverty rates vary depending on the specific poverty line applied.',
          source: 'World Bank PIP via OWID and Stats SA Poverty Trends, 1993-2023.',
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
          shows: 'A combined 0-100 financial pressure score calculated from survey response categories.',
          finding: 'Demonstrates how multiple financial pressures can be combined into a single score.',
          source: 'Project survey responses (synthetic placeholder data).',
          chartSource: 'Placeholder demo data.'
        },
        {
          id: 'survey-pressure-waffle',
          name: 'Cost pressure mix',
          title: 'What people worry about most (demo)',
          shows: 'A 100-square grid showing the distribution of primary cost pressures reported by respondents.',
          finding: 'Displays the relative proportion of main cost concerns across respondents.',
          source: 'Project survey responses (synthetic placeholder data).',
          chartSource: 'Placeholder demo data.'
        },
        {
          id: 'survey-food-transport-burden',
          name: 'Food & transport',
          title: 'Food cost against transport cost (demo)',
          shows: 'A cross-tabulation grid comparing monthly food cost bands against transport cost bands.',
          finding: 'Shows the combined weight of essential food and transport costs on household budgets.',
          source: 'Project survey responses (synthetic placeholder data).',
          chartSource: 'Placeholder demo data.'
        },
        {
          id: 'survey-cutback-heatmap',
          name: 'What gets cut',
          title: 'What people say they cut back on (demo)',
          shows: 'A heatmap showing expenditure cutback categories across different employment status groups.',
          finding: 'Highlights which spending categories households reduce first under financial pressure.',
          source: 'Project survey responses (synthetic placeholder data).',
          chartSource: 'Placeholder demo data.'
        },
        {
          id: 'survey-income-reality-gap',
          name: 'Worry vs. income',
          title: 'Does income keep up with the worry? (demo)',
          shows: 'A comparison between work worry ratings and income adequacy ratings across status groups.',
          finding: 'Shows the gap between financial worry levels and income adequacy across employment statuses.',
          source: 'Project survey responses (synthetic placeholder data).',
          chartSource: 'Placeholder demo data.'
        },
        {
          id: 'survey-status-pressure',
          name: 'Pressure by status',
          title: 'Who feels which pressure most? (demo)',
          shows: 'Stacked bars showing primary cost pressures by student, employed, unemployed, and working student groups.',
          finding: 'Displays how primary financial stressors differ across employment and study statuses.',
          source: 'Project survey responses (synthetic placeholder data).',
          chartSource: 'Placeholder demo data.'
        }
      ]
    },
    {
      title: 'Archived: Earlier Drafts',
      items: [
        {
          id: 'sa-population-group-census',
          name: 'Population by census',
          title: 'South African population by group, census 1996-2022',
          shows: 'Population group shares across the 1996, 2001, 2011, and 2022 censuses.',
          finding: 'Demographic group proportions have remained relatively stable across census years.',
          source: 'Stats SA census data, 1996-2022.',
          chartSource: 'Source: Stats SA census data, 1996-2022'
        },
        {
          id: 'sa-sex-age-2022',
          name: 'Population by sex & age',
          title: 'South African population by sex and age group, census 2022',
          shows: 'Female and male population shares across age groups in the 2022 census.',
          finding: 'Population distribution by sex remains balanced across most age groups.',
          source: 'Stats SA Census 2022.',
          chartSource: 'Source: Stats SA Census 2022'
        },
        {
          id: 'sa-age-sex-bubble-2022',
          name: 'Age group & female share',
          title: 'Age group size versus female share, census 2022',
          shows: 'Each circle represents an age group, positioned by female share and sized by total population.',
          finding: 'Women make up a larger share of the population in older age groups.',
          source: 'Stats SA Census 2022.',
          chartSource: 'Source: Stats SA Census 2022'
        },
        {
          id: 'sa-youth-unemployment',
          name: 'Youth unemployment',
          title: 'South African youth unemployment, 1991-2025',
          shows: 'The youth unemployment rate in South Africa from 1991 to 2025.',
          finding: 'Youth unemployment has followed a long-term upward trend over past decades.',
          source: 'World Bank / ILO estimates, 1991-2025.',
          chartSource: 'Source: World Bank / ILO, 1991-2025'
        },
        {
          id: 'sa-life-expectancy',
          name: 'Life expectancy',
          title: 'South African life expectancy at birth, 1960-2024',
          shows: 'Female, male, and overall life expectancy at birth from 1960 to 2024.',
          finding: 'Life expectancy has recovered in recent decades following historical declines.',
          source: 'World Bank indicators, 1960-2024.',
          chartSource: 'Source: World Bank, 1960-2024'
        },
        {
          id: 'climate-change',
          name: 'Global temperature',
          title: 'Global surface temperature anomaly, 1880-2025',
          shows: 'Annual global surface temperature anomalies relative to the long-term average.',
          finding: 'Global temperatures show a clear warming trend over the past century.',
          source: 'NASA GISTEMP v4, 1880-2025.',
          chartSource: 'Source: NASA GISTEMP v4, 1880-2025'
        }
      ]
    }
  ];

  // ---- Menu & navigation ----

  this.getSectionGroups = function() {
    return [
      {
        id: 'overview',
        title: 'Overview',
        heading: 'Overview',
        items: [{ id: 'overview', name: 'Overview' }]
      },
      {
        id: 'inequality',
        title: 'Inequality',
        heading: 'Inequality Charts',
        items: this.catalogue[0].items
      },
      {
        id: 'survey',
        title: 'Survey',
        heading: 'Survey Charts',
        items: this.catalogue[1].items
      },
      {
        id: 'archive',
        title: 'Archive',
        heading: 'Archived Drafts',
        items: this.catalogue[2].items
      }
    ];
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
    var groups = this.getSectionGroups();

    // 1. Four short section selector tabs
    var tabsNav = document.createElement('div');
    tabsNav.className = 'section-tabs';
    tabsNav.setAttribute('role', 'tablist');
    tabsNav.setAttribute('aria-label', 'Story Sections');

    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      var tabBtn = document.createElement('button');
      tabBtn.type = 'button';
      tabBtn.className = 'section-tab-btn' + (group.id === self.activeSectionId ? ' active' : '');
      tabBtn.id = 'tab-' + group.id;
      tabBtn.setAttribute('role', 'tab');
      tabBtn.setAttribute('aria-selected', group.id === self.activeSectionId ? 'true' : 'false');
      tabBtn.setAttribute('aria-controls', 'section-links-container');
      tabBtn.textContent = group.title;
      tabBtn.dataset.sectionId = group.id;

      tabBtn.addEventListener('click', function() {
        var secId = this.dataset.sectionId;
        self.selectSection(secId);
      });

      tabsNav.appendChild(tabBtn);
    }

    menu.appendChild(tabsNav);

    // 2. Links container for the selected section only
    var linksContainer = document.createElement('div');
    linksContainer.id = 'section-links-container';
    linksContainer.className = 'section-links-container';
    linksContainer.setAttribute('role', 'tabpanel');
    linksContainer.setAttribute('aria-labelledby', 'tab-' + self.activeSectionId);
    menu.appendChild(linksContainer);

    this.renderSectionLinks(this.activeSectionId);
    this.initMobileMenu();
    this.initAboutPanel();
  };

  this.selectSection = function(sectionId) {
    this.activeSectionId = sectionId;
    var groups = this.getSectionGroups();

    for (var i = 0; i < groups.length; i++) {
      var tabBtn = document.getElementById('tab-' + groups[i].id);
      if (tabBtn) {
        var isSel = groups[i].id === sectionId;
        tabBtn.setAttribute('aria-selected', isSel ? 'true' : 'false');
        tabBtn.classList.toggle('active', isSel);
      }
    }

    var linksContainer = document.getElementById('section-links-container');
    if (linksContainer) {
      linksContainer.setAttribute('aria-labelledby', 'tab-' + sectionId);
    }

    this.renderSectionLinks(sectionId);

    if (sectionId === 'overview') {
      this.showOverview();
    }
  };

  this.renderSectionLinks = function(sectionId) {
    var container = document.getElementById('section-links-container');
    if (!container) return;
    container.innerHTML = '';

    var groups = this.getSectionGroups();
    var currentGroup = null;

    for (var i = 0; i < groups.length; i++) {
      if (groups[i].id === sectionId) {
        currentGroup = groups[i];
        break;
      }
    }

    if (!currentGroup) return;

    if (currentGroup.id !== 'overview') {
      var heading = document.createElement('h3');
      heading.className = 'section-heading-title';
      heading.textContent = currentGroup.heading.toUpperCase();
      container.appendChild(heading);
    }

    var list = document.createElement('ul');
    list.className = 'menu-list';

    for (var j = 0; j < currentGroup.items.length; j++) {
      var item = currentGroup.items[j];
      var listItem = document.createElement('li');
      listItem.className = 'menu-item';

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-button';
      button.dataset.visualId = item.id;
      button.textContent = item.name;

      if (this.selectedVisual && this.selectedVisual.id === item.id) {
        button.classList.add('selected');
        button.setAttribute('aria-current', 'page');
      }

      button.addEventListener('click', function() {
        var visualId = this.dataset.visualId;
        if (visualId === 'overview') {
          self.showOverview();
        } else {
          self.selectVisual(visualId);
        }
        self.closeMobileMenu();
      });

      listItem.appendChild(button);
      list.appendChild(listItem);
    }

    container.appendChild(list);
  };

  this.closeMobileMenu = function() {
    var sidebar = document.querySelector('.sidebar');
    var toggleBtn = document.getElementById('mobile-menu-toggle');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      document.body.classList.remove('mobile-menu-open');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
      }
    }
  };

  this.initMobileMenu = function() {
    var toggleBtn = document.getElementById('mobile-menu-toggle');
    var closeBtn = document.getElementById('mobile-menu-close');
    var sidebar = document.querySelector('.sidebar');

    if (toggleBtn && !toggleBtn.dataset.bound) {
      toggleBtn.dataset.bound = 'true';
      toggleBtn.addEventListener('click', function() {
        var isOpen = sidebar.classList.contains('open');
        if (isOpen) {
          sidebar.classList.remove('open');
          document.body.classList.remove('mobile-menu-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
          sidebar.classList.add('open');
          document.body.classList.add('mobile-menu-open');
          toggleBtn.setAttribute('aria-expanded', 'true');
          if (closeBtn) closeBtn.focus();
        }
      });
    }

    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = 'true';
      closeBtn.addEventListener('click', function() {
        self.closeMobileMenu();
      });
    }

    if (!document.datasetMobileBound) {
      document.datasetMobileBound = true;
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
          self.closeMobileMenu();
        }
      });
    }
  };

  // ---- About this chart panel logic ----

  this.initAboutPanel = function() {
    var toggleBtn = document.getElementById('about-chart-toggle');
    var closeBtn = document.getElementById('info-panel-close');

    if (toggleBtn && !toggleBtn.dataset.bound) {
      toggleBtn.dataset.bound = 'true';
      toggleBtn.addEventListener('click', function() {
        self.toggleAboutPanel();
      });
    }

    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = 'true';
      closeBtn.addEventListener('click', function() {
        self.toggleAboutPanel(false);
      });
    }

    if (!document.datasetAboutBound) {
      document.datasetAboutBound = true;
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && self.isAboutOpen) {
          self.toggleAboutPanel(false);
        }
      });
    }
  };

  this.toggleAboutPanel = function(openState) {
    var toggleBtn = document.getElementById('about-chart-toggle');
    var infoPanel = document.getElementById('info-panel');
    var chartLayout = document.querySelector('.chart-layout');

    this.isAboutOpen = typeof openState === 'boolean' ? openState : !this.isAboutOpen;

    if (infoPanel) {
      infoPanel.hidden = !this.isAboutOpen;
      infoPanel.classList.toggle('open', this.isAboutOpen);
    }

    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', this.isAboutOpen ? 'true' : 'false');
      toggleBtn.classList.toggle('active', this.isAboutOpen);
    }

    if (chartLayout) {
      chartLayout.classList.toggle('about-open', this.isAboutOpen);
    }

    if (typeof resizeChartCanvas === 'function') {
      setTimeout(function() {
        resizeChartCanvas();
      }, 50);
    }
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
    var parentSectionId = 'overview';
    var groups = this.getSectionGroups();

    for (var g = 0; g < groups.length; g++) {
      for (var itemIdx = 0; itemIdx < groups[g].items.length; itemIdx++) {
        if (groups[g].items[itemIdx].id === visId) {
          parentSectionId = groups[g].id;
          break;
        }
      }
    }

    if (this.activeSectionId !== parentSectionId) {
      this.activeSectionId = parentSectionId;
      for (var i = 0; i < groups.length; i++) {
        var tabBtn = document.getElementById('tab-' + groups[i].id);
        if (tabBtn) {
          var isSel = groups[i].id === parentSectionId;
          tabBtn.setAttribute('aria-selected', isSel ? 'true' : 'false');
          tabBtn.classList.toggle('active', isSel);
        }
      }
      this.renderSectionLinks(parentSectionId);
    } else {
      var buttons = document.querySelectorAll('.menu-button');
      for (var b = 0; b < buttons.length; b++) {
        var isSelected = buttons[b].dataset.visualId == visId;
        buttons[b].classList.toggle('selected', isSelected);
        if (isSelected) {
          buttons[b].setAttribute('aria-current', 'page');
        } else {
          buttons[b].removeAttribute('aria-current');
        }
      }
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
    document.getElementById('info-title').textContent = 'About this chart';
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
