'use strict';

var Type = require('../models/Type.js');
var Provider = require('../models/Provider.js');

require('../helpers/string.js');


module.exports.documentWithJson = function(json) {
  var tab = this;

  // Find a document
  // This is aimed to keep every documents unique.
  var doc = null;
  tab.client.tabs.every(function(t) {
    if(t.documents) {
      doc = t.documents()[json.id];
    }
    return (doc !== null); // break if doc found
  });
  // Or create it if it does not exist yet
  if(!doc) {
    doc = new require('../models/Document.js')(json, tab.client.starredTab);
  }

  // Instantiate a new Provider model only when needed
  var provider;
  tab.client.facetsProviders().forEach(function(p) {
    if(p.id === json.provider.id) {
      provider = p;
    }
  });

  if(!provider) {
    console.log('Provider not found:', json.provider);
    provider = new Provider(json.provider);
    tab.client.facetsProviders.push(provider);
  }
  doc.provider = provider;

  // Instantiate a new Type model only when needed
  var type;
  tab.client.types().forEach(function(t) {
    if(t.id === json.document_type.id) {
      type = t;
    }
  });
  if(!type) {
    console.log('Type not found:', json.type);
    type = new Type(json.document_type);
    tab.client.types.push(type);
  }
  doc.type = type;

  return doc;
};

module.exports.documentsWithJson = function(documentsJson) {
  var tab = this;
  var docs = {};
  documentsJson.data.forEach(function(json) {
    docs[json.id] = tab.documentWithJson(json);
  });
  return docs;
};

module.exports.setDocuments = function(docs) {
  var tab = this;
  tab.documents(docs);
  if(Object.keys(tab.documents()).length <= 0) {
    var errorMessage = tab.emptyStateMessage.format(tab.client.searchQuery);
    tab.documentListError(errorMessage);
    tab.allDocumentsLoaded(true);
  }
  else {
    tab.documentListError(null);
  }
};

module.exports.addDocuments = function(docs) {
  var tab = this;
  var newDocList = {};
  $.extend(newDocList, tab.documents(), docs);
  tab.documents(newDocList);
};

module.exports.resetDocumentFullView = function() {
  var iframe = $('#full-iframe')[0];
  iframe.contentDocument.close();
  iframe.contentDocument.write('<html><head></head><body></body></html>');
};
