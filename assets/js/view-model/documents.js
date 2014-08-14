'use strict';

var Document = require('../models/Document.js');
var Type = require('../models/Type.js');
var Provider = require('../models/Provider.js');

require('../helpers/string.js');
var call = require('../helpers/call.js');
var getErrorMessage = require('../helpers/errors.js').getErrorMessage;

module.exports.documentWithJson = function(json) {
  var client = this;
  // console.log('json:', json);
  // console.log('client.documents()', client.documents());
  var doc = client.documents()[json.id];
  // console.log('document before:', doc);
  if (!doc) {
     doc = new Document(json);
  }
  // console.log('document after:', doc);

  // Instantiate a new Provider model only when needed
  var provider;
  client.connectedProviders().forEach(function(p) {
    if(p.id === json.provider.id) {
      provider = p;
    }
  });
  if(!provider) {
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
    type = new Type(json.document_type, this);
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

  // console.log(docs);
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

  console.log(Object.keys(this.documents()).length);
};

module.exports.resetDocumentFullView = function() {
  var iframe = $('#full-iframe')[0];
  iframe.contentDocument.close();
  iframe.contentDocument.write('<html><head></head><body></body></html>');
};
