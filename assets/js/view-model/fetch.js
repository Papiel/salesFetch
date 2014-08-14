'use strict';

var call = require('../helpers/call.js');
var filters = require('./filters.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

/**
 * @file Handle communication with the server
 */

module.exports.checkAllDocumentsLoaded = function(client, response) {
  var querycount = response.documents.count;
  var frontCount = Object.keys(client.documents()).length;

  client.allDocumentsLoaded(frontCount >= querycount);
};

module.exports.fetchDocuments = function(updateFacets) {
  var client = this;
  updateFacets = updateFacets || false;

  var options = {};
  if (client.filterByProvider() || client.filterByType()) {
    options.data = filters.paramsForFilter(client);
  }

  // Show big spinner only if we reload the facets
  client.shouldDisplayDocumentsSpinner(updateFacets);
  call('/app/documents', options, function success(data) {

    if (updateFacets) {
      client.setConnectedProviders(data.documents.facets.providers);
      client.setTypes(data.documents.facets.document_types);
    }
    var docs = client.documentsWithJson(data.documents);
    client.setDocuments(docs);
    client.shouldDisplayDocumentsSpinner(false);

    // update loadMore spinner
    module.exports.checkAllDocumentsLoaded(client, data);

  }, function error(res) {
    client.shouldDisplayDocumentsSpinner(false);
    client.documentListError(getErrorMessage(res));
  });
};

module.exports.fetchMoreDocuments = function() {
  var client = this;

  if(!client.allDocumentsLoaded()) {

    // prepare request params
    // start
    var options = {
      data: {
        start: Object.keys(client.documents()).length
      }
    };
    // filters
    if (client.filterByProvider() || client.filterByType()) {
      $.extend(options.data, options.data, filters.paramsForFilter(client));
    }

    call('/app/documents', options, function success(data) {

      if(data.documents.data && data.documents.data.length > 0) {
        var docs = client.documentsWithJson(data.documents);
        client.addDocuments(docs);
      }

      // update loadMore spinner
      module.exports.checkAllDocumentsLoaded(client, data);

    }, function error(res) {
      client.loadMoreError(getErrorMessage(res));
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
