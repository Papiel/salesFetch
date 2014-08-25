'use strict';

var filters = require('./filters.js');
var setTabs = require('./tabs.js').setTabs;
var navigation = require('./navigation.js');
var fetch = require('./fetch.js');
var documents = require('./documents.js');
var providers = require('./providers.js');
var types = require('./types.js');

module.exports = function SalesfetchViewModel() {
  var client = this;

  // ----- Client device detection
  client.isMobile = device.mobile();
  client.isTablet = device.tablet();
  client.isDesktop = device.desktop();

  // ----- Editable data
  client.connectedProviders = ko.observableArray([]);
  client.types = ko.observableArray([]);
  client.availableProviders = ko.observableArray([]);

  client.filterByProvider = ko.observable(false);
  client.filterByType = ko.observable(false);

  client.documentViewerError = ko.observable();

  if (client.isTablet) {
    client.shouldDisplayDocumentViewerDefaultMessage = ko.observable(true);
  }

  client.activeTab = ko.observable();
  client.activeDocument = ko.observable();

  // ----- Filters
  client.filteredProviders = ko.computed(filters.activeProviders(client));
  client.filteredTypes = ko.computed(filters.activeTypes(client));
  client.updateFilter = filters.updateFilter;

  // ----- Types
  client.setTypes = types.setTypes;

  // ----- Providers
  client.getConnectedProviderById = providers.getConnectedProviderById;
  client.setAvailableProviders = providers.setAvailableProviders;
  client.setConnectedProviders = providers.setConnectedProviders;
  client.updateConnectedProviders = providers.updateConnectedProviders;

  // Each time the content of the curerent document's full view changes
  // reset the content of the viewer
  if(!client.isDesktop) {
    client.autoResetDocumentFullView = ko.computed(function() {
      // The following is only useful to let Knockout know
      // that we're dependent on the value of `activeDocument` and `activeDocument().full()`
      if(client.activeDocument()) {
        client.activeDocument().full();
      }
      documents.resetDocumentFullView();
    });
  }

  // ----- Navigation
  client.goToTab = navigation.goToTab;
  client.goToDocument = navigation.goToDocument;
  client.goBack = navigation.goBack;

  // ----- Tabs
  // Set visible tabs
  setTabs(client);
  // The first tab is shown by default
  client.goToTab(client.tabs[0]);

  // ----- Requests to the backend
  client.fetchFullDocument = fetch.fetchFullDocument;
  client.fetchAvailableProviders = fetch.fetchAvailableProviders;

  client.fetchDocuments = function(updateFacets) {
    client.tabs.forEach(function(tab) {
      if (tab.fetchDocuments) {
        tab.fetchDocuments(updateFacets);
        updateFacets = false;
      }
    });
  };

  // ----- UI (conditional views)
  // Avoid using ko.computed when not needed (for better performance)

  client.shouldDisplayFilterToolbar = ko.computed(function() {
    return (!client.activeDocument()) || client.isTablet;
  });

  client.shouldDisplayTabsNavbar = function() {
    return (client.activeDocument() === null) || client.isDesktop || client.isTablet;
  };

  client.shouldDisplayDocumentNavbar = function() {
    return client.activeDocument && !client.isDesktop;
  };

  // ----- Zero state
  // Extract the search (context) from client data
  if($.clientData) {
    try {
      client.searchQuery = $.clientData.context.templatedQuery;
    } catch(e) {
      console.log('Unable to retrieve context from `data` argument');
    }
  }

  // Spinners
  client.shouldDisplayViewerSpinner = ko.observable(false);
};
