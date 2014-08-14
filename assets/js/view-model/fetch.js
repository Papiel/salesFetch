'use strict';

var call = require('../helpers/call.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

/**
 * @file Handle communication with the server
 */

module.exports.fetchDocuments = function(params) {
  var client = this;
  params = params || {};

  client.shouldDisplayDocumentsSpinner(true);
  call('/app/documents', params, function success(data) {
    client.setConnectedProviders(data.documents.facets.providers);
    client.setTypes(data.documents.facets.document_types);
    client.addDocuments(data.documents);
    client.shouldDisplayDocumentsSpinner(false);
  }, function error(res) {
    client.shouldDisplayDocumentsSpinner(false);
    client.documentListError(getErrorMessage(res));
  });
};

module.exports.fetchTempDocuments = function(filters) {
  var client = this;
  filters = filters || {};

  var options = {
    data: filters
  };

  client.shouldDisplayDocumentsSpinner(true);
  call('/app/documents', options, function success(data) {
    client.tempDocuments(data.documents.data);
    client.shouldDisplayDocumentsSpinner(false);

    if (client.isDesktop) {
      client.fetchAvailableProviders();
    }
  }, function error(res) {
    client.shouldDisplayDocumentsSpinner(false);
    client.documentListError(getErrorMessage(res));
  });
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
