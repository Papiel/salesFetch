'use strict';

var restify = require('restify');
var async = require('async');
var rarity = require('rarity');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var config = require('../../config/configuration.js');
var anyfetchHelpers = require('../helpers/anyfetch.js');

/**
 * Authenticate the user based on the request's user
 * @return {Object} the user
 */
var authenticateUser = function(data, done) {
  async.waterfall([
    function(cb) {
      // Find an existing user
      User.findOne({SFDCId: data.user.id}, cb);
    },
    function(user, cb) {
      if(user) {
        return cb(null, user);
      }
      // we'll return custom message to redirect the user to the init page
      cb(new restify.InvalidCredentialsError('User not created'));
    }
  ], done);
};

/**
 * Generic require login routing middleware.
 * - Checks that the received `data` object contains every necessary key
 * - Retrieve the user and its company
 * - Trigger a company update (i.e. fetch new documents on the
 *   various providers) on the AnyFetch API if
 *   it wasn't updated for a while.
 */
module.exports = function authorizationMiddleware(req, res, next) {
  var data = req.data;

  async.waterfall([
    function checkOrganization(cb) {
      if(!req.organization) {
        return cb(new restify.InvalidCredentialsError('No company matching this id has been found'));
      }

      cb(null, data);
    },
    authenticateUser,
    function updateCompanyIfNecessary(user, cb) {
      // If no one in the company had logged-in for a while
      // triger an update of the providers
      if((Date.now() - req.organization.lastUpdated) < config.companyUpdateDelay) {
        return cb(null, user);
      }

      anyfetchHelpers.updateAccount(user, function() {
        req.organization.lastUpdated = Date.now();
        req.organization.save(rarity.carryAndSlice([user], 2, cb));
      });
    },
    function writeRes(user, cb) {
      req.user = user;
      cb();
    }
  ], next);
};
