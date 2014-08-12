'use strict';

var filters = require('./filters.js');
var sliceInTime = require('../helpers/sliceInTime.js');
var getTabs = require('./tabs.js').getTabs;
var navigation = require('./navigation.js');
var fetch = require('./fetch.js');
var documents = require('./documents.js');

var getUrlParameter = require('../helpers/getUrlParameter.js');

module.exports = function SalesfetchViewModel() {
  var client = this;

  // ----- Client device detection
  client.isMobile = device.mobile();
  client.isTablet = device.tablet();
  client.isDesktop = device.desktop();

  // ----- Editable data
  client.documents = ko.observableArray([]);
  client.connectedProviders = ko.observableArray([]);
  client.types = ko.observableArray([]);
  client.availableProviders = ko.observableArray([]);

  client.filterByProvider = ko.observable(false);
  client.filterByType = ko.observable(false);

  client.documentListError = ko.observable();
  client.documentViewerError = ko.observable();

  if (client.isTablet) {
    client.shouldDisplayDocumentViewerDefaultMessage = ko.observable(true);
  }

  client.activeTab = ko.observable();
  client.activeDocument = ko.observable();

  // ----- Documents
  client.timeSlices = ko.computed(function() {
    if(!client.activeTab()) {
      return [];
    }

    var docs = client.activeTab().filter ? client.documents().filter(client.activeTab().filter) : client.documents();
    return sliceInTime(docs);
  });

  // ----- Filters
  client.filteredProviders = ko.computed(filters.activeProviders(client));
  client.filteredTypes = ko.computed(filters.activeTypes(client));

  // ----- Documents management
  client.addDocument = documents.addDocument;
  client.addDocuments = documents.addDocuments;

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
  client.tabs = getTabs(client);
  // The first tab is shown by default
  client.goToTab(client.tabs[0]);

  // ----- Requests to the backend
  client.fetchDocuments = fetch.fetchDocuments;
  client.fetchFullDocument = fetch.fetchFullDocument;
  client.fetchAvailableProviders = fetch.fetchAvailableProviders;

  // ----- UI (conditional views)
  // Avoid using ko.computed when not needed (for better performance)
  client.shouldDisplayDocumentList = ko.computed(function() {
    return (client.activeTab().hasDocumentList) && (!client.activeDocument() || !client.isMobile);
  });

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
  // Extract the search query from the GET parameters
  var data = getUrlParameter('data');
  if(data) {
    try {
      var json = JSON.parse(decodeURIComponent(data));
      client.searchQuery = json.context.templatedQuery;
    } catch(e) {
      console.log('Unable to parse `data` JSON argument');
    }
  }

  // Spinners
  client.shouldDisplayDocumentsSpinner = ko.observable(false);
  client.shouldDisplayViewerSpinner = ko.observable(false);
};
