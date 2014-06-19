'use strict';

var request = require('supertest');
var Mustache = require('mustache');
var async = require('async');
var querystring = require('querystring');
var rarity = require('rarity');

var mongoose =require('mongoose');
var Pin = mongoose.model('Pin');

var anyfetchHelpers = require('../helpers/anyfetch.js');
var config = require('../../config/configuration.js');
var fetchApiUrl = config.fetchApiUrl;

module.exports.findPins = function(SFDCId, user, finalCb) {
  // Retrieve documents pinned to that context
  async.waterfall([
    function findPin(cb) {
      Pin.find({ SFDCId: SFDCId }, cb);
    },
    // Fetch all snippets in one call
    function fetchDocumentsAndDocumentTypes(pins, cb) {
      // Fetch all snippets in one call
      var ids = pins.map(function(pin) {
        return pin.anyFetchId;
      });

      // Batch call: /documents and /document_types
      var pages = [
        '/documents?' + querystring.encode({ id: ids}),
        '/document_types'
      ];
      request(fetchApiUrl).get('/batch')
        .query({ pages: pages })
        .set('Authorization', 'Bearer ' + user.anyFetchToken)
        .expect(200)
        .end(rarity.carry([ pages ], cb));
    },
    function extractRes(pages, batchRes, cb) {
      var documents = batchRes.body[pages[0]].data;
      var documentTypes = batchRes.body[pages[1]];
      cb(null, documents, documentTypes);
    },
    function(docs, documentTypes, cb) {
      docs = docs.map(function(doc) {
        var template;
        // TODO: refactor (also used in `findDocuments`)
        var overridedTemplates = anyfetchHelpers.getOverridedTemplates();
        if (overridedTemplates[doc.document_type]) {
          template = overridedTemplates[doc.document_type].templates.full;
        } else {
          template = documentTypes[doc.document_type].templates.full;
        }

        doc.snippet_rendered = Mustache.render(template, doc.data);
        return doc;
      });
      cb(null, docs);
    }
  ], finalCb);
};

/**
 * @param {Object} sfdcId The context's ID
 * @param {Object} anyFetchId The document's ID
 * @param cb(err, pin) The callback will be called with the pin associated to this object in this context, or null if none exists
 */
module.exports.getPin = function(sfdcId, anyFetchId, cb) {
  Pin.findOne({
    SFDCId: sfdcId,
    anyFetchId: anyFetchId
  }, cb);
};

/**
 * Add a new pin
 */
module.exports.addPin = function(sfdcId, anyFetchId, user, cb) {
  var pin = new Pin({
    createdBy: user.id,
    SFDCId: sfdcId,
    anyFetchId: anyFetchId
  });

  pin.save(cb);
};

/**
 * Remove an existing pin
 */
module.exports.removePin = function(sfdcId, anyFetchId, user, finalCb) {
  var hash = {
    SFDCId: sfdcId,
    anyFetchId: anyFetchId
  };

  async.waterfall([
    function findPin(cb) {
      Pin.findOne(hash)
         .populate('createdBy')
         .exec(cb);
    },
    function checkPin(pin, cb) {
      var e;
      if(!pin) {
        e = new Error('The object ' + anyFetchId + ' was not pinned in the context ' + sfdcId);
        //e.status = 404;
        return cb(e);
      }
      if(!pin.createdBy || !pin.createdBy.organization.equals(user.organization)) {
        e = new Error('You cannot delete a pin from another organization');
        //e.status = 403;
        return cb(e);
      }

      cb(null, pin);
    },
    function removePin(pin, cb) {
      pin.remove(cb);
    }
  ], finalCb);
};
