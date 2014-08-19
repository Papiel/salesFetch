'use strict';

var call = require('../helpers/call.js');
var filters = require('./filters.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

/**
 * @file Handle communication with the server
 */

module.exports.checkAllDocumentsLoaded = function(tab, response) {
  var querycount = response.documents.count;
  var frontCount = Object.keys(tab.documents()).length;

  tab.allDocumentsLoaded(frontCount >= querycount);
};

module.exports.fetchDocuments = function(updateFacets) {
  var tab = this;
  updateFacets = updateFacets || false;

  var options = {};
  if (tab.client.filterByProvider() || tab.client.filterByType()) {
    options.data = filters.paramsForFilter(tab.client);
  }

  // Show big spinner only if we reload the facets
  tab.shouldDisplayDocumentsSpinner(updateFacets);
  call('/app/documents', options, function success(data) {

    if (updateFacets) {
      tab.client.setConnectedProviders(data.documents.facets.providers);
      tab.client.setTypes(data.documents.facets.document_types);
    }

    var docs = tab.documentsWithJson(data.documents);
    tab.setDocuments(docs);
    tab.shouldDisplayDocumentsSpinner(false);

    // update loadMore spinner
    module.exports.checkAllDocumentsLoaded(tab, data);

  }, function error(res) {
    tab.shouldDisplayDocumentsSpinner(false);
    tab.documentListError(getErrorMessage(res));
  });
};

module.exports.fetchMoreDocuments = function() {
  var tab = this;

  if(!tab.allDocumentsLoaded()) {

    // prepare request params
    // start
    var options = {
      data: {
        start: Object.keys(tab.documents()).length
      }
    };
    // filters
    if (tab.client.filterByProvider() || tab.client.filterByType()) {
      $.extend(options.data, options.data, filters.paramsForFilter(tab.client));
    }

    call('/app/documents', options, function success(data) {

      if(data.documents.data && data.documents.data.length > 0) {
        var docs = tab.documentsWithJson(data.documents);
        tab.addDocuments(docs);
      }

      // update loadMore spinner
      module.exports.checkAllDocumentsLoaded(tab, data);

    }, function error(res) {
      tab.loadMoreError(getErrorMessage(res));
    });
  }
};

module.exports.fetchFullDocument = function(document, cb) {
  var client = this;

  client.shouldDisplayViewerSpinner(true);

  call('/app' + document.url, {}, function success(data) {
      client.shouldDisplayViewerSpinner(false);
      document.title(data.rendered.title);
      document.full(data.rendered.full);
      cb(data.rendered.full);
    }, function error(res) {
      client.shouldDisplayViewerSpinner(false);
      client.documentViewerError(getErrorMessage(res));
    }
  );
};

module.exports.fetchAvailableProviders = function() {
  var client = this;

  call('/app/providers', function success(data) {
    client.setAvailableProviders(data.providers);
    client.updateConnectedProviders(data.connectedProviders);
  });
};
