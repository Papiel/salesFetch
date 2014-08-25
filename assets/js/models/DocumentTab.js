'use strict';

var sliceInTime = require('../helpers/sliceInTime.js');

var noopFilter = function() {
  return true;
};

/**
 * @param {String} name
 * @param {String} display The font-awesome CSS class corresponding to the icon of this tab
 * @param {Boolean} pullRight If true the tab will align right in horizontal menu
 * @param {Function} filter A function to use to filter the documents to be shown in this tab
 */
module.exports = function DocumentTab(client, name, display, pullRight, filter, endpoint) {
  var self = this;

  self.client = client;

  self.name = name;
  self.display = display;
  self.pullRight = pullRight || false;
  self.filter = filter || noopFilter;
  self.endpoint = endpoint || '/app/documents';
  self.emptyStateMessage = 'No documents';

  self.shouldDisplayDocumentsSpinner = ko.observable(true);
  self.shouldDisplayLoadMoreSpinner = ko.observable(true);
  self.documentListError = ko.observable();
  self.loadMoreError = ko.observable();
  self.allDocumentsLoaded = ko.observable(false);


  self.documents = ko.observable({});
  self.documents.extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });

  self.shouldDisplayDocumentList = ko.computed(function() {
    return (!self.client.isMobile || !client.activeDocument());
  });

  self.shouldDisplayDocumentListError = ko.computed(function() {
    var docCount = Object.keys(self.documents()).length;
    return self.documentListError() && (!self.documents() || docCount <= 0);
  });

  // ----- Documents
  self.timeSlices = ko.computed(function() {
    if(!self.client.activeTab()) {
      return [];
    }

    var docList = [];
    for (var id in self.documents()) {
      docList.push(self.documents()[id]);
    }

    var docs = self.filter ? docList.filter(self.filter) : docList;
    return sliceInTime(docs);
  });
};
