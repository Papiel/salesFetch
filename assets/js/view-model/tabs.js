'use strict';

var Tab = require('../models/Tab.js');
var DocumentTab = require('../models/DocumentTab.js');

var filters = require('./filters.js');
var documents = require('./documents.js');
var fetch = require('./fetch.js');

/**
 * @file Tabs
 */

/**
 * @return {Array} The visible tabs. First tab of the list should be the default tab.
 */
module.exports.setTabs = function(client) {
  var timelineTab = new DocumentTab(client, 'Timeline', 'fa-list', false,
                                    filters.providerAndType(client), '/app/documents');

  // ----- Documents management
  timelineTab.documentWithJson = documents.documentWithJson;
  timelineTab.setDocuments = documents.setDocuments;
  timelineTab.addDocuments = documents.addDocuments;
  timelineTab.documentsWithJson = documents.documentsWithJson;
  // Flag which indicates when all possible documents have been loaded
  timelineTab.allDocumentsLoaded = ko.observable(false);

  // ----- Requests to the backend
  timelineTab.fetchDocuments = fetch.fetchDocuments;
  timelineTab.fetchMoreDocuments = fetch.fetchMoreDocuments;

  var starredTab = new DocumentTab(client, 'Starred', 'fa-star-o', false,
                                  filters.starredFilter(client), '/app/pins');

  // ----- Documents management
  starredTab.documentWithJson = documents.documentWithJson;
  starredTab.setDocuments = documents.setDocuments;
  starredTab.addDocuments = documents.addDocuments;
  starredTab.documentsWithJson = documents.documentsWithJson;
  // Flag which indicates when all possible documents have been loaded
  starredTab.allDocumentsLoaded = ko.observable(false);

  // ----- Starred management
  starredTab.starredUpdate = function(document) {
    if (document.isStarred()) {
      starredTab.documents()[document.id] = document;
    } else {
      delete starredTab.documents()[document.id];
    }
  };

  starredTab.starredUpdateFailed = function(document) {
    document.isStarred(!document.isStarred());
    if (document.isStarred()) {
      starredTab.documents()[document.id] = document;
    } else {
      delete starredTab.documents()[document.id];
    }
  };

  // ----- Requests to the backend
  starredTab.fetchDocuments = fetch.fetchDocuments;
  starredTab.fetchMoreDocuments = fetch.fetchMoreDocuments;


  var providerTab = new Tab('Providers', 'fa-link');

  // TODO: re-enable when feature exists
  //var searchTab = new Tab('Search', 'fa-search', true);

  client.tabs = [timelineTab, starredTab]; // and `searchTab`
  client.starredTab = starredTab;

  // Desktop has an additional 'Providers' tab
  if(client.isDesktop) {
    client.tabs.push(providerTab);
  }
};
