function Gallery() {

  // ---- State ----

  this.visuals = [];
  this.selectedVisual = null;
  this.activeSectionId = 'overview';
  this.isAboutOpen = false;
  this.isEmbedded = typeof URLSearchParams !== 'undefined'
      && new URLSearchParams(window.location.search).get('embedded') === '1';
  this.isComparison = false;
  this.isTourActive = false;
  this.isTourTransitioning = false;
  this.tourResizeFrame = null;
  this.tourIndex = 0;
  this.annotationsEnabled = true;

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

  this.tourSteps = [
    {
      id: 'national-context',
      visualId: 'za-gini-trend',
      title: 'Start with the national inequality picture',
      narrative: 'The Gini series stays high across the available observations. It reaches its highest point in this dataset in 2005 at about 0.65, then ends at about 0.54 in 2022. The estimates are useful context, but the source warns that survey methods can differ across years.',
      source: 'World Bank Poverty and Inequality Platform via Our World in Data, 1993-2022.'
    },
    {
      id: 'income-concentration',
      visualId: 'za-income-share-trend',
      title: 'Follow the concentration of before-tax income',
      narrative: 'The top 10 percent receives 46.35% of before-tax income in 1993 and 65.41% in 2014. The 50% line makes the concentration easy to compare without suggesting that this measure is disposable income.',
      source: 'WID.world via Our World in Data, 1993-2014.'
    },
    {
      id: 'population-earnings',
      visualId: 'za-population-group-earnings',
      title: 'Compare population size with earnings',
      narrative: 'Population share and mean monthly earnings do not move together. In the cleaned Stats SA data, the displayed mean ranges from R6,899 for Black African workers to R24,646 for White workers. Earnings are not the same thing as wealth.',
      source: 'Stats SA Census 2022 and Stats SA earnings data, 2011-2015.'
    },
    {
      id: 'dwelling-tenure',
      visualId: 'za-dwelling-ownership-by-group',
      title: 'See inequality in everyday housing conditions',
      narrative: 'Dwelling tenure adds a practical living-conditions layer to the story. Ownership, renting, rent-free occupation, and other categories vary by population group, but this chart is not a measure of total property wealth.',
      source: 'Stats SA General Household Survey 2024, Table 8.6.'
    },
    {
      id: 'land-concentration',
      visualId: 'za-land-ownership-by-group',
      title: 'Look at concentration in the land audit',
      narrative: 'The 2017 land-audit measure shows individually owned farms and agricultural holdings, not all land or all wealth. The White category accounts for 72% of the displayed share, well above the 50% reference line.',
      source: 'Department of Rural Development and Land Reform Land Audit Report 2017.'
    },
    {
      id: 'top-ten-concentration',
      visualId: 'za-ownership-comparison',
      title: 'Put the top 10 percent side by side',
      narrative: 'The same 10% reference group is compared with its latest available income and wealth shares. The visual gap between population size and resource share is the central concentration pattern in this project.',
      source: 'WID.world via Our World in Data.'
    },
    {
      id: 'poverty-context',
      visualId: 'za-poverty-context',
      title: 'End with poverty measures in context',
      narrative: 'Poverty depends on the definition used. In 2023, the upper-bound poverty-line series is 66.7% while the food-poverty-line series is 17.6%. They must remain separate measures rather than being combined into one score.',
      source: 'World Bank PIP via OWID and Statistics South Africa Poverty Trends.'
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

  this.getTourStep = function(stepId) {
    for (var i = 0; i < this.tourSteps.length; i++) {
      if (this.tourSteps[i].id === stepId) return this.tourSteps[i];
    }
    return null;
  };

  this.setTourLayoutActive = function(active) {
    var main = document.querySelector('.main-content');
    if (main) main.classList.toggle('tour-active', active);
  };

  this.updateTourUI = function() {
    var step = this.tourSteps[this.tourIndex];
    var progress = document.getElementById('tour-progress');
    var title = document.getElementById('tour-title');
    var narrative = document.getElementById('tour-narrative');
    var source = document.getElementById('tour-source');
    var previous = document.getElementById('tour-previous');
    var next = document.getElementById('tour-next');
    var annotationButton = document.getElementById('tour-annotations');

    if (!step) return;
    progress.textContent = 'Story step ' + (this.tourIndex + 1) + ' of ' + this.tourSteps.length;
    title.textContent = step.title;
    narrative.textContent = step.narrative;
    source.textContent = 'Source: ' + step.source;
    previous.disabled = this.isTourTransitioning || this.tourIndex === 0;
    next.disabled = this.isTourTransitioning;
    next.textContent = this.tourIndex === this.tourSteps.length - 1 ? 'Finish story' : 'Next';
    annotationButton.textContent = this.annotationsEnabled ? 'Hide annotations' : 'Show annotations';
    annotationButton.setAttribute('aria-pressed', this.annotationsEnabled ? 'true' : 'false');
  };

  this.showTourStep = function(index, fromHash) {
    if (this.isTourTransitioning || index < 0 || index >= this.tourSteps.length) return;
    var step = this.tourSteps[index];
    this.isTourTransitioning = true;
    this.isTourActive = true;
    this.tourIndex = index;
    this.setTourLayoutActive(true);

    document.getElementById('overview').classList.add('hidden');
    document.getElementById('chart-view').classList.remove('hidden');
    document.getElementById('comparison-view').classList.add('hidden');
    document.getElementById('tour-view').classList.remove('hidden');
    this.selectVisual(step.visualId, true, true);
    this.updateAnnotationButtons();
    this.updateTourUI();

    if (!fromHash && !this.isEmbedded) this.updateHash('tour/' + step.id);
    if (this.tourResizeFrame != null) cancelAnimationFrame(this.tourResizeFrame);
    this.tourResizeFrame = requestAnimationFrame(function() {
      if (typeof resizeChartCanvas === 'function') resizeChartCanvas();
      self.tourResizeFrame = null;
      self.isTourTransitioning = false;
      self.updateTourUI();
      var narrative = document.getElementById('tour-narrative');
      if (narrative) narrative.focus({ preventScroll: true });
    });
  };

  this.startTour = function() {
    this.annotationsEnabled = true;
    this.showTourStep(0, false);
  };

  this.nextTourStep = function() {
    if (this.tourIndex === this.tourSteps.length - 1) {
      this.exitTour();
      return;
    }
    this.showTourStep(this.tourIndex + 1, false);
  };

  this.previousTourStep = function() {
    if (this.tourIndex > 0) this.showTourStep(this.tourIndex - 1, false);
  };

  this.exitTour = function() {
    if (this.tourResizeFrame != null) cancelAnimationFrame(this.tourResizeFrame);
    this.tourResizeFrame = null;
    this.isTourTransitioning = false;
    this.isTourActive = false;
    document.getElementById('tour-view').classList.add('hidden');
    this.showOverview();
  };

  this.initTour = function() {
    var start = document.getElementById('start-tour-button');
    var previous = document.getElementById('tour-previous');
    var next = document.getElementById('tour-next');
    var exit = document.getElementById('tour-exit');
    var annotations = document.getElementById('tour-annotations');

    if (start && !start.dataset.bound) {
      start.dataset.bound = 'true';
      start.addEventListener('click', function() { self.startTour(); });
    }
    if (previous && !previous.dataset.bound) {
      previous.dataset.bound = 'true';
      previous.addEventListener('click', function() { self.previousTourStep(); });
    }
    if (next && !next.dataset.bound) {
      next.dataset.bound = 'true';
      next.addEventListener('click', function() { self.nextTourStep(); });
    }
    if (exit && !exit.dataset.bound) {
      exit.dataset.bound = 'true';
      exit.addEventListener('click', function() { self.exitTour(); });
    }
    if (annotations && !annotations.dataset.bound) {
      annotations.dataset.bound = 'true';
      annotations.addEventListener('click', function() {
        self.annotationsEnabled = !self.annotationsEnabled;
        self.updateAnnotationButtons();
        self.updateTourUI();
      });
    }
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
    var comparison = document.getElementById('comparison-view');
    if (comparison) comparison.classList.add('hidden');
    var tour = document.getElementById('tour-view');
    if (tour) tour.classList.add('hidden');
    this.isTourActive = false;
    this.setTourLayoutActive(false);
    this.updateSelectedMenu('overview');
    if (!this.isEmbedded) this.updateHash('overview');
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
    var comparison = document.getElementById('comparison-view');
    if (comparison) comparison.classList.add('hidden');
    document.getElementById('chart-title').textContent = metadata.title;
    document.getElementById('info-title').textContent = 'About this chart';
    document.getElementById('info-shows').textContent = metadata.shows;
    document.getElementById('info-finding').textContent = metadata.finding;
    document.getElementById('info-source').textContent = metadata.source;
    document.getElementById('chart-source').textContent = metadata.chartSource;
    var controls = document.getElementById('chart-controls');
    var saveButton = this.makeActionButton('Save high-res PNG', 'Export this chart as a 3x PNG image', function() {
      exportHighResolutionPNG(vis);
    });
    var csvButton = this.makeActionButton('Download CSV', 'Download the chart-ready data as CSV', function() {
      exportDataCSV(vis);
    });
    var compareButton = this.makeActionButton('Compare', 'Open this chart in comparison mode', function() {
      self.openComparison(vis.id, self.getDefaultComparisonId(vis.id));
    });
    var annotationButton = this.makeActionButton(
      this.annotationsEnabled ? 'Hide annotations' : 'Show annotations',
      'Show or hide contextual chart annotations',
      function() {
        self.annotationsEnabled = !self.annotationsEnabled;
        self.updateAnnotationButtons();
      });
    annotationButton.dataset.annotationButton = 'true';
    controls.appendChild(saveButton);
    controls.appendChild(csvButton);
    if (!this.isTourActive) controls.appendChild(annotationButton);
    if (!this.isEmbedded) controls.appendChild(compareButton);
    this.updateAnnotationButtons();
    this.updateSelectedMenu(vis.id);
  };

  this.makeActionButton = function(label, title, callback) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'chart-action-button';
    button.textContent = label;
    button.title = title;
    button.addEventListener('click', callback);
    return button;
  };

  this.updateAnnotationButtons = function() {
    var buttons = document.querySelectorAll('[data-annotation-button="true"]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].textContent = this.annotationsEnabled ? 'Hide annotations' : 'Show annotations';
      buttons[i].setAttribute('aria-pressed', this.annotationsEnabled ? 'true' : 'false');
    }
    var tourButton = document.getElementById('tour-annotations');
    if (tourButton) {
      tourButton.textContent = this.annotationsEnabled ? 'Hide annotations' : 'Show annotations';
      tourButton.setAttribute('aria-pressed', this.annotationsEnabled ? 'true' : 'false');
    }
  };

  this.getDefaultComparisonId = function(visId) {
    var preferred = visId === 'za-dwelling-ownership-by-group'
      ? 'za-population-group-earnings'
      : 'za-dwelling-ownership-by-group';
    return this.findVisIndex(preferred) != null ? preferred : this.visuals[0].id;
  };

  this.updateHash = function(value) {
    if (window.location.hash === '#' + value) return;
    window.history.replaceState(null, '', window.location.pathname + window.location.search + '#' + value);
  };

  this.parseHash = function() {
    var hash = window.location.hash.replace(/^#/, '');
    if (!hash || hash === 'overview') return { type: 'overview' };
    if (hash.indexOf('tour/') === 0) {
      var tourStep = this.getTourStep(hash.slice(5));
      return tourStep ? { type: 'tour', stepId: tourStep.id } : null;
    }
    if (hash.indexOf('compare/') === 0) {
      var ids = hash.slice(8).split('/').filter(Boolean);
      return ids.length === 2 ? { type: 'compare', left: ids[0], right: ids[1] } : null;
    }
    return this.findVisIndex(hash) != null ? { type: 'visual', id: hash } : null;
  };

  this.openComparison = function(leftId, rightId, fromHash) {
    if (this.isEmbedded) return;
    if (this.findVisIndex(leftId) == null || this.findVisIndex(rightId) == null) return;

    this.isComparison = true;
    this.isTourActive = false;
    this.setTourLayoutActive(false);
    document.getElementById('overview').classList.add('hidden');
    document.getElementById('chart-view').classList.add('hidden');
    document.getElementById('tour-view').classList.add('hidden');
    document.getElementById('comparison-view').classList.remove('hidden');
    this.renderComparisonControls(leftId, rightId);
    this.renderComparisonPanes(leftId, rightId);
    if (!fromHash) this.updateHash('compare/' + leftId + '/' + rightId);
  };

  this.renderComparisonControls = function(leftId, rightId) {
    var controls = document.getElementById('comparison-controls');
    controls.innerHTML = '';
    var selfGallery = this;
    [
      { label: 'Left chart', value: leftId },
      { label: 'Right chart', value: rightId }
    ].forEach(function(item) {
      var label = document.createElement('label');
      label.textContent = item.label;
      var select = document.createElement('select');
      select.className = 'comparison-select';
      selfGallery.visuals.forEach(function(vis) {
        if (selfGallery.getCatalogueItem(vis.id) && selfGallery.getCatalogueItem(vis.id).id === vis.id
            && ['sa-population-group-census','sa-sex-age-2022','sa-age-sex-bubble-2022','sa-youth-unemployment','sa-life-expectancy','climate-change'].indexOf(vis.id) === -1) {
          var option = document.createElement('option');
          option.value = vis.id;
          option.textContent = selfGallery.getCatalogueItem(vis.id).name;
          option.selected = vis.id === item.value;
          select.appendChild(option);
        }
      });
      select.addEventListener('change', function() {
        var nextLeft = controls.querySelectorAll('select')[0].value;
        var nextRight = controls.querySelectorAll('select')[1].value;
        selfGallery.openComparison(nextLeft, nextRight);
      });
      label.appendChild(select);
      controls.appendChild(label);
    });
  };

  this.renderComparisonPanes = function(leftId, rightId) {
    var panes = document.getElementById('comparison-panes');
    panes.innerHTML = '';
    [leftId, rightId].forEach(function(id, index) {
      var pane = document.createElement('article');
      pane.className = 'comparison-pane';
      var title = document.createElement('h3');
      title.textContent = index === 0 ? 'Left visualisation' : 'Right visualisation';
      var frame = document.createElement('iframe');
      frame.title = 'Live ' + (index === 0 ? 'left' : 'right') + ' comparison chart';
      frame.src = window.location.pathname + '?embedded=1&vis=' + encodeURIComponent(id);
      frame.loading = 'eager';
      pane.appendChild(title);
      pane.appendChild(frame);
      panes.appendChild(pane);
    });
  };

  this.initComparison = function() {
    var closeButton = document.getElementById('comparison-close');
    if (closeButton && !closeButton.dataset.bound) {
      closeButton.dataset.bound = 'true';
      closeButton.addEventListener('click', function() {
        self.isComparison = false;
        self.showOverview();
      });
    }
    window.addEventListener('hashchange', function() {
      var route = self.parseHash();
      if (!route) return;
      if (route.type === 'overview') self.showOverview();
      else if (route.type === 'tour') self.showTourStep(self.tourSteps.findIndex(function(step) {
        return step.id === route.stepId;
      }), true);
      else if (route.type === 'compare') self.openComparison(route.left, route.right, true);
      else self.selectVisual(route.id, true);
    });
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

  this.selectVisual = function(visId, fromHash, keepTour) {
    var visIndex = this.findVisIndex(visId);

    if (visIndex != null) {
      if (!keepTour) {
        this.isTourActive = false;
        this.setTourLayoutActive(false);
        var tour = document.getElementById('tour-view');
        if (tour) tour.classList.add('hidden');
      }
      // If the current visualisation has a deselect method run it.
      if (this.selectedVisual != null
          && this.selectedVisual.hasOwnProperty('destroy')) {
        this.selectedVisual.destroy();
      }
      this.clearChartControls();

      // Select the visualisation in the gallery.
      this.selectedVisual = this.visuals[visIndex];
      this.showChartDetails(this.selectedVisual);

      if (!keepTour && typeof resizeChartCanvas == 'function') {
        resizeChartCanvas();
      }

      // Initialise visualisation if necessary.
      if (this.selectedVisual.hasOwnProperty('setup')) {
        this.selectedVisual.setup();
      }

      // Enable animation in case it has been paused by the current
      // visualisation.
      loop();
      if (!this.isEmbedded && !fromHash) this.updateHash(visId);
    }
  };

  this.buildMenu();
  this.initComparison();
  this.initTour();
}
