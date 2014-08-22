'use strict';

var async = require('async');

var salesfetchHelpers = require('../../../helpers/salesfetch.js');

/**
 * Show pinned documents (only the pins, not the surrounding interface)
 */
module.exports.get = function(req, res, next) {
  var sfdcId = req.data.context.recordId;
  var params = {};
  if(req.query.start) {
    params.start = req.query.start;
  }
  if(req.query.document_type) {
    params.document_type = req.query.document_type;
  }
  if(req.query.provider) {
    params.provider = req.query.provider;
  }

  async.waterfall([
    function findPins(cb) {
      salesfetchHelpers.findPins(sfdcId, params, req.user, cb);
    },
    function sendResponse(pins, cb) {
      res.send(pins);
      cb();
    }
  ], next);
};
