'use strict';

var call = require('../helpers/call.js');
var providers = require('./providers.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

/**
 * @file Handle communication with the server
 */

module.exports.fetchDocuments = function() {
  var client = this;

  client.shouldDisplayDocumentsSpinner(true);
  call('/app/documents', {}, function success(data) {
    client.addDocuments(data.documents);
    client.shouldDisplayDocumentsSpinner(false);
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
    providers.setAvailableProviders(client, data.providers);
    providers.setConnectedProviders(client, data.connectedProviders);
  });
};
