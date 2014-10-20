'use strict';

var restify = require('restify');
var async = require('async');
var rarity = require('rarity');

var mongoose = require('mongoose');
var Organization = mongoose.model('Organization');
var User = mongoose.model('User');

var config = require('../../config/configuration.js');
var anyFetchHelpers = require('../helpers/anyfetch.js');
var getSecureHash = require('../helpers/get-secure-hash.js');

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
 * - Authenticate the request using the secure hash
 * - Trigger a company update (i.e. fetch new documents on the
 *   various providers) on the AnyFetch API if
 *   it wasn't updated for a while.
 */
module.exports = function(req, res, next) {
  var organization;
  var data = req.data;

  async.waterfall([
    function retrieveCompany(cb) {
      Organization.findOne({SFDCId: data.organization.id}, cb);
    },
    function checkRequestValidity(org, cb) {
      organization = org;
      if(!org) {
        return next(new restify.InvalidCredentialsError('No company matching this id has been found'));
      }

      var check = getSecureHash(data, org.masterKey);
      if(check !== data.hash) {
        return next(new restify.InvalidCredentialsError('Please check your salesFetch Master Key!'));
      }
      cb(null, data);
    },
    authenticateUser,
    function updateCompanyIfNecessary(user, cb) {
      // If no one in the company had logged-in for a while
      // triger an update of the providers
      if((Date.now() - organization.lastUpdated) < config.companyUpdateDelay) {
        return cb(null, user);
      }

      anyFetchHelpers.updateAccount(user, function() {
        organization.lastUpdated = Date.now();
        organization.save(rarity.carryAndSlice([user], 2, cb));
      });
    },
    function writeRes(user, cb) {
      req.user = user;
      req.organization = organization;
      cb();
    }
  ], next);
};
