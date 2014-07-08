'use strict';

var async = require('async');

var salesfetchHelpers = require('../../../helpers/salesfetch.js');

/**
 * Show pinned documents (only the pins, not the surrounding interface)
 */
module.exports.get = function(req, res, next) {
  var sfdcId = req.data.context.recordId;

  async.waterfall([
    function findPins(cb) {
      salesfetchHelpers.findPins(sfdcId, req.user, cb);
    },
    function sendResponse(pins, cb) {
      res.send({ pins: pins });
      cb();
    }
  ], next);
};
