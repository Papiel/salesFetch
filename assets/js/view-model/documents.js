'use strict';

var Document = require('../models/Document.js');
var Type = require('../models/Type.js');
var Provider = require('../models/Provider.js');

require('../helpers/string.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

module.exports.documentWithJson = function(json) {
  var client = this;

  var doc = client.documents()[json.id];
  if (!doc) {
     doc = new Document(json);
  }

  // Instantiate a new Provider model only when needed
  var provider;
  client.connectedProviders().forEach(function(p) {
    if(p.id === json.provider.id) {
      provider = p;
    }
  });
  if(!provider) {
    console.log('Provider not found:', json.provider);
    provider = new Provider(json.provider, this);
    client.connectedProviders.push(provider);
  }
  doc.provider = provider;

  // Instantiate a new Type model only when needed
  var type;
  client.types().forEach(function(t) {
    if(t.id === json.document_type.id) {
      type = t;
    }
  });
  if(!type) {
    console.log('Type not found:', json.type);
    type = new Type(json.document_type, client);
    client.types.push(type);
  }
  doc.type = type;

  return doc;
};

module.exports.documentsWithJson = function(documentsJson) {
  var client = this;
  var docs = {};
  documentsJson.data.forEach(function(json) {
    docs[json.id] = client.documentWithJson(json);
  });
  return docs;
};

module.exports.setDocuments = function(docs) {
  var client = this;
  client.documents(docs);
  if(client.documents().length <= 0) {
    var errorMessage = getErrorMessage('no documents').format(client.searchQuery);
    client.documentListError(errorMessage);
  }
};

module.exports.addDocuments = function(docs) {
  var newDocList = {};
  $.extend(newDocList, docs, this.documents());
  this.documents(newDocList);
};

module.exports.resetDocumentFullView = function() {
  var iframe = $('#full-iframe')[0];
  iframe.contentDocument.close();
  iframe.contentDocument.write('<html><head></head><body></body></html>');
};
