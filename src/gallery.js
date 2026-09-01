function Gallery() {

  // Store the current view and controls.

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

  // Keep the menu and chart text together.

  this.catalogue = [
    {
      title: 'South African Inequality, Explained',
      items: [
        {
          id: 'za-gini-trend',
          name: 'National inequality',
          title: 'South African Gini coefficient over time',
          shows: 'South Africa’s Gini coefficient from 1993 to 2022.',
          finding: 'Income inequality stayed high across the period.',
          source: 'World Bank Poverty and Inequality Platform via Our World in Data, 1993-2022.',
          chartSource: 'Source: World Bank PIP via Our World in Data, 1993-2022'
        },
        {
          id: 'za-population-group-earnings',
          name: 'Population earnings',
          title: 'Population share compared with mean earnings',
          shows: 'Population share compared with average monthly earnings.',
          finding: 'Average earnings differ across population groups.',
          source: 'Stats SA Census 2022 and Stats SA earnings data, 2011–2015.',
          chartSource: 'Sources: Stats SA population table, 2022; Stats SA earnings article, 2011-2015'
        },
        {
          id: 'za-dwelling-ownership-by-group',
          name: 'Dwelling ownership',
          title: 'Dwelling tenure by population group',
          shows: 'Owned, rented, and rent-free homes by population group.',
          finding: 'Housing tenure differs across population groups.',
          source: 'Stats SA General Household Survey 2024.',
          chartSource: 'Source: Stats SA General Household Survey 2024, Table 8.6'
        },
        {
          id: 'za-land-ownership-by-group',
          name: 'Land ownership',
          title: 'Agricultural land ownership by population group',
          shows: 'Farm and agricultural land ownership by population group.',
          finding: 'Agricultural land ownership is highly concentrated.',
          source: 'Department of Rural Development and Land Reform Land Audit Report 2017.',
          chartSource: 'Source: Land Audit Report 2017, farms and agricultural holdings owned by individuals'
        },
        {
          id: 'za-income-share-trend',
          name: 'Top income share',
          title: 'Top 10 percent share of before-tax income',
          shows: 'The top 10 percent share of before-tax income.',
          finding: 'The top 10 percent receives over half of national income.',
          source: 'WID.world via Our World in Data, 1993-2014.',
          chartSource: 'Source: WID.world via Our World in Data, 1993-2014'
        },
        {
          id: 'za-ownership-comparison',
          name: 'Top 10 concentration',
          title: 'Top 10 percent population share versus income and wealth share',
          shows: 'A 10 percent population share compared with income and wealth.',
          finding: 'Income and wealth are concentrated at the top.',
          source: 'WID.world via Our World in Data.',
          chartSource: 'Source: WID.world via Our World in Data'
        },
        {
          id: 'za-poverty-context',
          name: 'Poverty indicators',
          title: 'Poverty indicators as financial-pressure context',
          shows: 'Several South African poverty measures over time.',
          finding: 'The result changes with the poverty line used.',
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
          title: 'How pressured are people feeling?',
          shows: 'A 0–100 score built from the Survey App dataset.',
          finding: SurveyData.note,
          source: SurveyData.source,
          chartSource: SurveyData.note
        },
        {
          id: 'survey-pressure-waffle',
          name: 'Cost pressure mix',
          title: 'What people worry about most',
          shows: 'A 100-square view of the main cost pressures.',
          finding: SurveyData.note,
          source: SurveyData.source,
          chartSource: SurveyData.note
        },
        {
          id: 'survey-food-transport-burden',
          name: 'Food & transport',
          title: 'Food cost against transport cost',
          shows: 'Food-cost bands compared with transport-cost bands.',
          finding: SurveyData.note,
          source: SurveyData.source,
          chartSource: SurveyData.note
        },
        {
          id: 'survey-cutback-heatmap',
          name: 'What gets cut',
          title: 'What people say they cut back on',
          shows: 'Cutback choices compared across status groups.',
          finding: SurveyData.note,
          source: SurveyData.source,
          chartSource: SurveyData.note
        },
        {
          id: 'survey-income-reality-gap',
          name: 'Worry vs. income',
          title: 'Does income keep up with the worry?',
          shows: 'Work worry compared with income adequacy.',
          finding: SurveyData.note,
          source: SurveyData.source,
          chartSource: SurveyData.note
        },
        {
          id: 'survey-status-pressure',
          name: 'Pressure by status',
          title: 'Who feels which pressure most?',
          shows: 'Main cost pressures compared across status groups.',
          finding: SurveyData.note,
          source: SurveyData.source,
          chartSource: SurveyData.note
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
      narrative: 'The Gini coefficient peaks at about 0.65 in 2005 and remains high across the available years.',
      source: 'World Bank Poverty and Inequality Platform via Our World in Data, 1993-2022.'
    },
    {
      id: 'income-concentration',
      visualId: 'za-income-share-trend',
      title: 'Follow the concentration of before-tax income',
      narrative: 'The top 10% income share rises from 46.35% in 1993 to 65.41% in 2014.',
      source: 'WID.world via Our World in Data, 1993-2014.'
    },
    {
      id: 'population-earnings',
      visualId: 'za-population-group-earnings',
      title: 'Compare population size with earnings',
      narrative: 'Displayed mean monthly earnings range from R6,899 for Black African workers to R24,646 for White workers.',
      source: 'Stats SA Census 2022 and Stats SA earnings data, 2011-2015.'
    },
    {
      id: 'dwelling-tenure',
      visualId: 'za-dwelling-ownership-by-group',
      title: 'See inequality in everyday housing conditions',
      narrative: 'Dwelling tenure differs across population groups, adding a housing-conditions view of inequality.',
      source: 'Stats SA General Household Survey 2024, Table 8.6.'
    },
    {
      id: 'land-concentration',
      visualId: 'za-land-ownership-by-group',
      title: 'Look at concentration in the land audit',
      narrative: 'White individuals account for 72% of the farms and agricultural holdings shown in the 2017 land audit.',
      source: 'Department of Rural Development and Land Reform Land Audit Report 2017.'
    },
    {
      id: 'top-ten-concentration',
      visualId: 'za-ownership-comparison',
      title: 'Put the top 10 percent side by side',
      narrative: 'The top 10% holds a much larger share of income and wealth than its population share.',
      source: 'WID.world via Our World in Data.'
    },
    {
      id: 'poverty-context',
      visualId: 'za-poverty-context',
      title: 'End with poverty measures in context',
      narrative: 'In 2023, 66.7% were below the upper-bound poverty line and 17.6% below the food poverty line.',
      source: 'World Bank PIP via OWID and Statistics South Africa Poverty Trends.'
    }
  ];

  // Menu & navigation

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
    var app = document.getElementById('app');

    if (main) main.classList.toggle('tour-active', active);
    if (app) app.classList.toggle('story-mode', active);
    document.body.classList.toggle('story-mode', active);

    if (active) {
      this.closeMobileMenu(false);
      if (this.isAboutOpen) this.toggleAboutPanel(false);
    }
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

    if (!document.datasetTourKeyboardBound) {
      document.datasetTourKeyboardBound = true;
      document.addEventListener('keydown', function(e) {
        if (!self.isTourActive || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

        var target = e.target;
        var isEditable = target && (target.isContentEditable
          || target.tagName === 'INPUT'
          || target.tagName === 'SELECT'
          || target.tagName === 'TEXTAREA');
        if (isEditable) return;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          self.previousTourStep();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          self.nextTourStep();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          self.exitTour();
        }
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

    // 1.
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

    // 2.
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
        self.closeMobileMenu(false);
      });

      listItem.appendChild(button);
      list.appendChild(listItem);
    }

    container.appendChild(list);
  };

  this.isMobileViewport = function() {
    return !!window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
  };

  this.mobileMenuIsOpen = function() {
    var sidebar = document.getElementById('sidebar');
    return !!sidebar && sidebar.classList.contains('open');
  };

  this.openMobileMenu = function() {
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('mobile-menu-toggle');
    var closeBtn = document.getElementById('mobile-menu-close');
    var backdrop = document.getElementById('sidebar-backdrop');
    var main = document.querySelector('.main-content');
    if (!sidebar || sidebar.classList.contains('open')) return;

    sidebar.classList.add('open');
    document.body.classList.add('mobile-menu-open');
    if (backdrop) backdrop.hidden = false;
    if (main) main.setAttribute('aria-hidden', 'true');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Close navigation menu');
    }
    if (closeBtn) closeBtn.focus();
  };

  // returnFocus is false when the drawer closes because a chart was picked -- moving
  // focus back to the toggle would scroll the phone away from the chart.
  this.closeMobileMenu = function(returnFocus) {
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('mobile-menu-toggle');
    var backdrop = document.getElementById('sidebar-backdrop');
    var main = document.querySelector('.main-content');
    if (!sidebar || !sidebar.classList.contains('open')) return;

    sidebar.classList.remove('open');
    document.body.classList.remove('mobile-menu-open');
    if (backdrop) backdrop.hidden = true;
    if (main) main.removeAttribute('aria-hidden');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Open navigation menu');
      if (returnFocus !== false) toggleBtn.focus();
    }
  };

  // Keep Tab inside the open drawer -- it covers the page, so tabbing to what is
  // behind it strands keyboard and screen-reader users on hidden controls.
  this.trapDrawerFocus = function(e) {
    if (e.key !== 'Tab' || !this.mobileMenuIsOpen()) return;

    var sidebar = document.getElementById('sidebar');
    var focusable = sidebar.querySelectorAll('button, [href], select, input, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  this.initMobileMenu = function() {
    var toggleBtn = document.getElementById('mobile-menu-toggle');
    var closeBtn = document.getElementById('mobile-menu-close');
    var backdrop = document.getElementById('sidebar-backdrop');

    if (toggleBtn && !toggleBtn.dataset.bound) {
      toggleBtn.dataset.bound = 'true';
      toggleBtn.addEventListener('click', function() {
        if (self.mobileMenuIsOpen()) {
          self.closeMobileMenu();
        } else {
          self.openMobileMenu();
        }
      });
    }

    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = 'true';
      closeBtn.addEventListener('click', function() {
        self.closeMobileMenu();
      });
    }

    if (backdrop && !backdrop.dataset.bound) {
      backdrop.dataset.bound = 'true';
      backdrop.addEventListener('click', function() {
        self.closeMobileMenu();
      });
    }

    if (!document.mobileMenuKeysBound) {
      document.mobileMenuKeysBound = true;
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && self.mobileMenuIsOpen()) {
          self.closeMobileMenu();
        }
        self.trapDrawerFocus(e);
      });
    }
  };

  // Open or close the chart notes.

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

    if (typeof queueChartResize === 'function') {
      queueChartResize();
    }

    // On a phone the panel stacks below the chart, off screen, so opening it looks
    // like nothing happened unless we scroll to it.
    if (this.isAboutOpen && infoPanel && this.isMobileViewport()) {
      infoPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var infoTitle = document.getElementById('info-title');
      if (infoTitle) infoTitle.setAttribute('tabindex', '-1');
      if (infoTitle) infoTitle.focus({ preventScroll: true });
    }
  };

  // Overview cards

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
          self.scrollMobileViewToTop();
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
    }

    // Mark from the requested id instead of relying on selectedVisual.
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
  };

  this.scrollMobileViewToTop = function() {
    if (this.isMobileViewport()) {
      window.scrollTo(0, 0);
    }
  };

  // View switching (overview <-> chart)

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
    this.scrollMobileViewToTop();
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
    this.scrollMobileViewToTop();
  };

  this.renderComparisonControls = function(leftId, rightId) {
    var controls = document.getElementById('comparison-controls');
    controls.innerHTML = '';
    var selfGallery = this;
    // Archived charts stay out of the comparison selectors.
    var archiveIds = [
      'sa-population-group-census',
      'sa-sex-age-2022',
      'sa-age-sex-bubble-2022',
      'sa-youth-unemployment',
      'sa-life-expectancy',
      'climate-change'
    ];
    [
      { label: 'Chart 1', value: leftId },
      { label: 'Chart 2', value: rightId }
    ].forEach(function(item) {
      var label = document.createElement('label');
      label.textContent = item.label;
      var select = document.createElement('select');
      select.className = 'comparison-select';
      selfGallery.visuals.forEach(function(vis) {
        var catalogueItem = selfGallery.getCatalogueItem(vis.id);
        if (catalogueItem && catalogueItem.id === vis.id && archiveIds.indexOf(vis.id) === -1) {
          var option = document.createElement('option');
          option.value = vis.id;
          option.textContent = catalogueItem.name;
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

  // Each pane is a full copy of the app in an iframe. On a phone the panes stack, so
  // the second one is loaded lazily rather than running a second p5 sketch off screen.
  this.renderComparisonPanes = function(leftId, rightId) {
    var panes = document.getElementById('comparison-panes');
    var lazy = this.isMobileViewport();
    panes.innerHTML = '';

    [leftId, rightId].forEach(function(id, index) {
      var pane = document.createElement('article');
      pane.className = 'comparison-pane';
      var title = document.createElement('h3');
      title.textContent = index === 0 ? 'Chart 1' : 'Chart 2';
      var frame = document.createElement('iframe');
      frame.title = 'Live ' + (index === 0 ? 'left' : 'right') + ' comparison chart';
      frame.src = window.location.pathname + '?embedded=1&vis=' + encodeURIComponent(id);
      frame.loading = (lazy && index === 1) ? 'lazy' : 'eager';
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

  // Visualisation registry

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
    // Search through the visualisations looking for one with the id matching visId.
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

      if (!keepTour && typeof queueChartResize == 'function') {
        queueChartResize();
      }

      // Initialise visualisation if necessary.
      if (this.selectedVisual.hasOwnProperty('setup')) {
        this.selectedVisual.setup();
      }

      requestChartRender(true);
      if (!this.isEmbedded && !fromHash) this.updateHash(visId);
      if (!keepTour) this.scrollMobileViewToTop();
    }
  };

  this.buildMenu();
  this.initComparison();
  this.initTour();
}
