'use strict';

var restify = require("restify");
var async = require("async");
var mongoose = require('mongoose');
var _ = require("lodash");

var anyfetchHelpers = require('../../../helpers/anyfetch.js');
var salesfetchHelpers = require('../../../helpers/salesfetch.js');

/**
 * Context-related documents
 */
module.exports.get = function(req, res, next) {
  if(!req.data.context || !req.data.context.templatedQuery || !req.data.context.templatedDisplay) {
    return next(new restify.MissingParameterError('Check your VisualForce page configuration, a template parameter is missing (`templatedQuery` or `templatedDisplay`).'));
  }

  var params = {};

  var filters = {};
  if(req.query.filters) {
    filters = req.query.filters;
    params = _.merge(params, filters);
  }

  if(req.query.start) {
    params.start = req.query.start;
  }

  if(req.query.document_type) {
    params.document_type = req.query.document_type;
  }

  if(req.query.provider) {
    params.provider = req.query.provider;
  }

  params.sort = '-modificationDate';
  params.search = req.data.context.templatedQuery;
  params.snippet_size = 100;

  async.waterfall([
    function retrieveDocuments(cb) {
      anyfetchHelpers.findDocuments(params, req.user, cb);
    },
    function markPinned(documents, cb) {
      salesfetchHelpers.markIfPinned(req.data.context.recordId, documents, cb);
    },
    function sendResponse(documents, cb) {
      var response = {
        documents: documents,
        filters: filters
      };

      // When loading documents for infinite scroll, a lot of info is useless
      if(req.query.start) {
        delete response.filters;
        delete response.documents.document_types;
        delete response.documents.providers;
      }

      res.send(response);
      cb();
    },
    function registerLog(cb) {
      var Log = mongoose.model('Log');
      var log = new Log();
      log.organization = req.organization;
      log.user = req.user;
      log.recordType = req.data.context.recordType;
      log.recordId = req.data.context.recordId;

      log.save(cb);
    }
  ], next);
};
