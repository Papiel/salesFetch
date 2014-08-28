/**
 * Administration controller
 */
'use strict';

var restify = require('restify');
var async = require('async');
var anyFetchHelper = require('../../helpers/anyfetch');

/**
 * Create a subcompany and add an admin user
 * Called one time at package installation
 */
module.exports.post = function(req, res, next) {
  async.waterfall([
    function checkParams(cb) {
      var data = req.body;
      if(!data.user || !data.organization) {
        return cb(new restify.MissingParameterError('The init account should provide user and org informations'));
      }

      cb(null, data);
    },
    function initAccount(data, cb) {
      anyFetchHelper.initAccount(data, cb);
    },
    function sendResponse(createdOrg, cb) {
      res.send(200, createdOrg.masterKey);
      cb();
    }
  ], next);
};
