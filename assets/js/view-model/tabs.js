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
  client.timelineTab = new DocumentTab(client,
                                    'Timeline',
                                    'fa-list',
                                    false,
                                    filters.providerAndType(client),
                                    '/app/documents');

  // ----- Documents management
  client.timelineTab.documentWithJson = documents.documentWithJson;
  client.timelineTab.setDocuments = documents.setDocuments;
  client.timelineTab.addDocuments = documents.addDocuments;
  client.timelineTab.documentsWithJson = documents.documentsWithJson;
  // Flag which indicates when all possible documents have been loaded
  client.timelineTab.allDocumentsLoaded = ko.observable(false);

  // ----- Requests to the backend
  client.timelineTab.fetchDocuments = fetch.fetchDocuments;
  client.timelineTab.fetchMoreDocuments = fetch.fetchMoreDocuments;

  client.starredTab = new DocumentTab(client,
                                  'Starred',
                                  'fa-star-o',
                                  false,
                                  filters.starredFilter(client),
                                  '/app/pins');

  // ----- Documents management
  client.starredTab.documentWithJson = documents.documentWithJson;
  client.starredTab.setDocuments = documents.setDocuments;
  client.starredTab.addDocuments = documents.addDocuments;
  client.starredTab.documentsWithJson = documents.documentsWithJson;
  // Flag which indicates when all possible documents have been loaded
  client.starredTab.allDocumentsLoaded = ko.observable(false);

  // ----- Starred management
  client.starredTab.starredUpdate = function(document) {
    if (document.isStarred()) {
      client.starredTab.documents()[document.id] = document;
    } else {
      delete client.starredTab.documents()[document.id];
    }
  };

  client.starredTab.starredUpdateFailed = function(document) {
    document.isStarred(!document.isStarred());
    if (document.isStarred()) {
      client.starredTab.documents()[document.id] = document;
    } else {
      delete client.starredTab.documents()[document.id];
    }
  };

  // ----- Requests to the backend
  client.starredTab.fetchDocuments = fetch.fetchDocuments;
  client.starredTab.fetchMoreDocuments = fetch.fetchMoreDocuments;


  var providerTab = new Tab('Providers', 'fa-link');

  // TODO: re-enable when feature exists
  //var searchTab = new Tab('Search', 'fa-search', true);

  client.tabs = [client.timelineTab, client.starredTab]; // and `searchTab`

  // Desktop has an additional 'Providers' tab
  if(client.isDesktop) {
    client.tabs.push(providerTab);
  }
};
