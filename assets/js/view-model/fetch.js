'use strict';

var call = require('../helpers/call.js');
var filters = require('./filters.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

/**
 * @file Handle communication with the server
 */

module.exports.fetchDocuments = function(updateFacets) {
  var client = this;
  updateFacets = updateFacets || false;

  var params = {};
  if (client.filterByProvider() || client.filterByType()) {
    params.data = filters.paramsForFilter(client);
  }

  console.log(params);

  client.shouldDisplayDocumentsSpinner(true);
  call('/app/documents', params, function success(data) {
    console.log(data);
    if (updateFacets) {
      client.setConnectedProviders(data.documents.facets.providers);
      client.setTypes(data.documents.facets.document_types);
    }
    var docs = client.documentsWithJson(data.documents);
    client.setDocuments(docs);
    client.shouldDisplayDocumentsSpinner(false);

    if (client.documents().length >= data.documents.count) {
      client.allDocumentsLoaded(true);
    }
  }, function error(res) {
    client.shouldDisplayDocumentsSpinner(false);
    client.documentListError(getErrorMessage(res));
  });
};

module.exports.fetchMoreDocuments = function() {
  var client = this;

  if(!client.allDocumentsLoaded()) {
    var options = {
      data: { start: Object.keys(client.documents()).length }
    };
    call('/app/documents', options, function success(data) {

      if(data.documents.data && data.documents.data.length > 0) {
        var docs = client.documentsWithJson(data.documents);
        client.addDocuments(docs);
        client.allDocumentsLoaded(false);
      }
      else {
        client.allDocumentsLoaded(true);
      }
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
