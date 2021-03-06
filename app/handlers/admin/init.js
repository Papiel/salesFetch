/**
 * Administration controller
 */
'use strict';

var restify = require('restify');
var async = require('async');
var anyfetchHelper = require('../../helpers/anyfetch');
var config = require('../../../config/configuration');

/**
 * Create a subcompany and add an admin user
 * Called one time at package installation
 */
module.exports.post = function(req, res, next) {
  async.waterfall([
    function checkKey(cb) {
      if(req.params.secret_key !== config.secretKey) {
        return cb(new restify.UnauthorizedError('Unknown secret key.'));
      }

      cb();
    },
    function checkParams(cb) {
      var data = req.body;
      if(!data.user || !data.organization) {
        return cb(new restify.MissingParameterError('The init account should provide user and org informations'));
      }

      cb(null, data);
    },
    function initAccount(data, cb) {
      anyfetchHelper.initAccount(data, cb);
    },
    function sendResponse(createdOrg, cb) {
      res.send(200, createdOrg.masterKey);
      cb();
    }
  ], next);
};
