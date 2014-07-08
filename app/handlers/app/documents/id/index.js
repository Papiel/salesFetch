'use strict';

var async = require('async');

var anyfetchHelpers = require('../../../../helpers/anyfetch.js');

/**
 * Show full document
 */
module.exports.get = function(req, res, next) {
  async.waterfall([
    function findDocument(cb) {
      anyfetchHelpers.findDocument(req.params.id, req.user, req.data.context, cb);
    },
    function sendResponse(document, cb) {
      res.send(document);
      cb();
    }
  ], next);
};
