'use strict';

var restify = require("restify");
var async = require("async");
var rarity = require("rarity");

var salesfetchHelpers = require('../../../../helpers/salesfetch.js');

/**
 * Pin a document
 */
module.exports.post = function(req, res, next) {
  var sfdcId = req.data.context.recordId;
  var anyFetchId = req.params.id;

  async.waterfall([
    function addPin(cb) {
      salesfetchHelpers.addPin(sfdcId, anyFetchId, req.user, rarity.slice(1, cb));
    },
    function sendResponse(cb) {
      res.send(204);
      cb();
    }
  ], function handleMongoError(err) {
    // Error post processing
    if (err && err.name === 'MongoError' && err.code === 11000) {
      err = new restify.InvalidArgumentError('The AnyFetch object ' + anyFetchId + ' is already pinned to the context ' + sfdcId);
    }

    return next(err);
  });
};

/**
 * Unpin a document
 */
module.exports.del = function(req, res, next) {
  var sfdcId = req.data.context.recordId;
  var anyFetchId = req.params.id;

  async.waterfall([
    function removePin(cb) {
      salesfetchHelpers.removePin(sfdcId, anyFetchId, req.user, rarity.slice(1, cb));
    },
    function sendResponse(cb) {
      res.send(202);
      cb();
    }
  ], next);
};
