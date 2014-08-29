'use strict';

var call = require('../helpers/call.js');
var filters = require('./filters.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

/**
 * @file Handle communication with the server
 */

module.exports.checkAllDocumentsLoaded = function(tab, response) {
  var querycount = response.count || 0;
  var frontCount = Object.keys(tab.documents()).length;

  tab.allDocumentsLoaded(frontCount >= querycount);
};


/**
 * @param {Object} updateFacets Whether or not the providers and types should be updated
 */
module.exports.fetchDocuments = function(updateFacets) {
  var tab = this;
  updateFacets = updateFacets || false;

  var options = {};
  if(tab.client.filterByProvider() || tab.client.filterByType()) {
    options.data = filters.paramsForFilter(tab.client);
  }

  // Show big spinner only if we reload the facets
  tab.shouldDisplayDocumentsSpinner(updateFacets);
  call(tab.endpoint, options, function success(response) {
    response = response.documents ? response.documents : response;

    if(updateFacets && !tab.starred) {
      tab.client.setConnectedProviders(response.facets.providers);
      tab.client.setTypes(response.facets.document_types);
    }

    var docs = tab.documentsWithJson(response);
    tab.setDocuments(docs);
    tab.shouldDisplayDocumentsSpinner(false);

    // Update loadMore spinner
    module.exports.checkAllDocumentsLoaded(tab, response);

  }, function error(res) {
    tab.shouldDisplayDocumentsSpinner(false);
    tab.documentListError(getErrorMessage(res));
    tab.allDocumentsLoaded(true);
  });
};

module.exports.fetchMoreDocuments = function() {
  var tab = this;
  if(!tab.allDocumentsLoaded()) {

    // Prepare request params:
    // Start offset
    var options = {
      data: {
        start: Object.keys(tab.documents()).length
      }
    };
    // Filters
    if(tab.client.filterByProvider() || tab.client.filterByType()) {
      $.extend(options.data, options.data, filters.paramsForFilter(tab.client));
    }

    call(tab.endpoint, options, function success(response) {
    response = response.documents ? response.documents : response;

      if(response.data && response.data.length > 0) {
        var docs = tab.documentsWithJson(response);
        tab.addDocuments(docs);
      }

      // update loadMore spinner
      module.exports.checkAllDocumentsLoaded(tab, response);

    }, function error(res) {
      tab.loadMoreError(getErrorMessage(res));
      tab.allDocumentsLoaded(true);
    });
  }
};

module.exports.fetchFullDocument = function(document, cb) {
  var client = this;

  client.shouldDisplayViewerSpinner(true);

  call('/app/documents/' + document.id, {}, function success(data) {
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
