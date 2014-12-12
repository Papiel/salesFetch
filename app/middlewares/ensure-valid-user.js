'use strict';

var restify = require('restify');
var async = require('async');
var rarity = require('rarity');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var config = require('../../config/configuration.js');
var anyfetchHelpers = require('../helpers/anyfetch.js');


/**
 * Check the user exists, and send an update if necessary
 */
module.exports = function ensureValidUserMiddleware(req, res, next) {
  var data = req.data;

  async.waterfall([
    function(cb) {
      // Find an existing user
      User.findOne({SFDCId: data.user.id}, cb);
    },
    function(user, cb) {
      if(!user) {
        // Return custom message (the frontend will redirect the user to the init page)
        return cb(new restify.InvalidCredentialsError('User not created'));
      }
      return cb(null, user);
    },
    function updateCompanyIfNecessary(user, cb) {
      // If no one in the company had logged-in for a while
      // triger a company update.
      if((Date.now() - req.organization.lastUpdated) < config.companyUpdateDelay) {
        return cb(null, user);
      }

      anyfetchHelpers.updateAccount(user, function() {
        req.organization.lastUpdated = Date.now();
        req.organization.save(rarity.carryAndSlice([user], 2, cb));
      });
    },
    function writeReq(user, cb) {
      req.user = user;
      cb();
    }
  ], next);
};
