'use strict';

var Document = require('../models/Document.js');
var Type = require('../models/Type.js');
var Provider = require('../models/Provider.js');

module.exports.addDocument = function(json) {
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

  client.documents.push(doc);
};

module.exports.addDocuments = function(array) {
  var client = this;

  array.forEach(function(json) {
    client.addDocument(json);
  });
};

module.exports.resetDocumentFullView = function() {
  var iframe = $('#full-iframe')[0];
  iframe.contentDocument.close();
  iframe.contentDocument.write('<html><head></head><body></body></html>');
};