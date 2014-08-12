'use strict';

var Document = require('../models/Document.js');
var Type = require('../models/Type.js');
var Provider = require('../models/Provider.js');

var call = require('../helpers/call.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

module.exports.documentWithJson = function(json) {
  var client = this;

  var doc = new Document(json);

  // Instantiate a new Provider model only when needed
  var provider;
  client.connectedProviders().forEach(function(p) {
    if(p.id === json.provider.id) {
      provider = p;
    }
  });
  if(!provider) {
    provider = new Provider(json.provider);
    client.connectedProviders().push(provider);
  }
  doc.provider = provider;

  // Instantiate a new Type model only when needed
  var type;
  client.types().forEach(function(t) {
    if(t.id === json.document_type.id) {
      provider = t;
    }
  });
  if(!type) {
    type = new Type(json.document_type);
    client.types().push(type);
  }
  doc.type = type;

  return doc;
};

module.exports.addDocuments = function(documentsJson) {
  var client = this;
  var docs = [];
  documentsJson.data.forEach(function(json) {
    docs.push(client.documentWithJson(json));
  });

  client.documents(client.documents().concat(docs));

  if(client.documents().length <= 0) {
    client.documentListError(getErrorMessage('no documents'));
  }
  else if (client.documents().length >= documentsJson.count) {
    client.allDocumentsLoaded(true);
  }
};

module.exports.loadMoreDocuments = function() {
  var client = this;

  if(!client.allDocumentsLoaded()) {
    var options = {
      data: { start: client.documents().length }
    };
    call('/app/documents', options, function success(data) {

      if(data.documents.data && data.documents.data.length > 0) {
        client.addDocuments(data.documents);
      }
      else {
        client.allDocumentsLoaded(true);
      }
    }, function error(res) {
      client.loadMoreError(getErrorMessage(res));
    });
  }
};

module.exports.resetDocumentFullView = function() {
  var iframe = $('#full-iframe')[0];
  iframe.contentDocument.close();
  iframe.contentDocument.write('<html><head></head><body></body></html>');
};
