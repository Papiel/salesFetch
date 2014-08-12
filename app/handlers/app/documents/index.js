'use strict';

var restify = require("restify");
var async = require("async");
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

  var params = {
    sort: '-creationDate',
    search: req.data.context.templatedQuery
  };

  var filters = {};
  if (req.query.filters) {
    filters = req.query.filters;
    params = _.merge(params, filters);
  }

  if(req.query.start) {
    params.start = req.query.start;
  }

  async.waterfall([
    function retrieveDocuments(cb) {
      anyfetchHelpers.findDocuments(params, req.user, cb);
    },
    function markPinned(documents, cb) {
      salesfetchHelpers.markIfPinned(req.data.context.recordId, documents, cb);
    },
    function sendResponse(documents, cb) {
      // If load more results
      // TODO: make sure that format is adapted
      if (req.query.start) {
        res.send(documents);
      }
      else {
        res.send({ documents: documents, filters: filters });
      }
      cb();
    }
  ], next);
};
