'use strict';

var request = require('supertest');
var Mustache = require('mustache');
var async = require('async');

var mongoose =require('mongoose');
var Pin = mongoose.model('Pin');

var anyfetchHelpers = require('../helpers/anyfetch.js');
var config = require('../../config/configuration.js');
var fetchApiUrl = config.fetchApiUrl;

module.exports.findPins = function(SFDCId, user, next) {
  // Retrieve documents pinned to that context
  async.waterfall([
    function(cb) {
      Pin.find({ SFDCId: SFDCId }, cb);
    },
    // Fetch all snippets in one call
    function(pins, cb) {
      // Fetch all snippets in one call
      var ids = pins.map(function(pin) {
        return pin.anyFetchId;
      });

      request(fetchApiUrl).get('/documents')
        .query({ id: ids })
        .set('Authorization', 'Bearer ' + user.anyFetchToken)
        .expect(200)
        .end(cb);
    },
    // Fetch document types in order to get the templates
    // TODO: use batch call and / or `anyfetch.js`
    function(documentsRes, cb) {
      request(fetchApiUrl).get('/document_types')
        .set('Authorization', 'Bearer ' + user.anyFetchToken)
        .expect(200)
        .end(function(err, res) {
          cb(err, documentsRes.body.data, res.body);
        });
    },
    function(docs, documentTypes, cb) {
      docs = docs.map(function(doc) {
        var template;
        // TODO: refactor (also used in `findDocuments`)
        var overidedTemplates = anyfetchHelpers.getOverridedTemplates();
        if (overidedTemplates[doc.document_type]) {
          template = overidedTemplates[doc.document_type].templates.full;
        } else {
          template = documentTypes[doc.document_type].templates.full;
        }

        doc.snippet_rendered = Mustache.render(template, doc.data);
        return doc;
      });
      cb(null, docs);
    }
  ],
  function(err, docs) {
    next(err, docs);
  });
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
module.exports.removePin = function(sfdcId, anyFetchId, user, cb) {
  var hash = {
    SFDCId: sfdcId,
    anyFetchId: anyFetchId
  };
  Pin.findOne(hash)
     .populate('createdBy')
     .exec(function(err, pin) {
        if(err) {
          return cb(err);
        }
        if(!pin) {
          err = {
            message: 'The object ' + anyFetchId + ' was not pinned in the context ' + sfdcId,
            status: 404
          };
          return cb(err);      
        }

        if(!pin.createdBy.organization.equals(user.organization)) {
          err = {
            message: 'You cannot delete a pin from another organization',
            status: 403
          };
          return cb(err);
        }

        Pin.findOne(hash).remove(cb);
      });
};
