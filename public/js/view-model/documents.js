'use strict';

var Document = require('../models/Document.js');

/**
 * @file
 */

module.exports.addDocument = function(json) {
    var client = this;

    var doc = new Document(json);

    client.documents.push(doc);

    if(!(doc.provider in client.connectedProviders())) {
        client.connectedProviders.push(doc.provider);
    }

    if(!(doc.type in client.types())) {
        client.types.push(doc.type);
    }
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
