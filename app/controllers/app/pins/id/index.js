"use strict";
var restify = require("restify");

var salesfetchHelpers = require('../../../../helpers/salesfetch.js');

/**
 * Pin a document
 */
module.exports.post = function(req, res, next) {
  var sfdcId = req.reqParams.context.recordId;
  var anyFetchId = req.params.id;
  salesfetchHelpers.addPin(sfdcId, anyFetchId, req.user, function(err) {
    if(err) {
      if (err.name && err.name === 'MongoError' && err.code === 11000) {
        return next(new restify.InvalidArgumentError('The AnyFetch object ' + anyFetchId + ' is already pinned to the context ' + sfdcId));
      }

      return next(err);
    }

    res.send(204);
  });
};

/**
 * Unpin a document
 */
module.exports.del = function(req, res, next) {
  var sfdcId = req.reqParams.context.recordId;
  var anyFetchId = req.params.id;
  salesfetchHelpers.removePin(sfdcId, anyFetchId, req.user, function(err) {
    if(err) {
      return next(err);
    }

    res.send(202);
  });
};
