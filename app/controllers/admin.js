/**
 * Administration controller
 */
'use strict';

var express = require('express');
var async = require('async');
var anyFetchHelper = require('../helpers/anyfetch');

/**
 * Create a subcompany and add an admin user
 * Called one time at package installation
 */
module.exports.init = function(req, res, next) {
  async.waterfall([
    function checkParams(cb) {
      var data = req.body;
      if (!data.user || !data.organization) {
        return cb(new express.errors.MissingArgument('The init account should provide user and org informations'));
      }

      cb(null, data);
    },
    function initAccount(data, cb) {
      anyFetchHelper.initAccount(data, cb);
    }
  ], function(err, createdOrg) {
    if (err) {
      return next(err);
    }

    res.send(200, createdOrg.masterKey);
  });
};