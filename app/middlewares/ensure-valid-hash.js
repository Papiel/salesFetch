'use strict';

var restify = require('restify');
var async = require('async');

var mongoose = require('mongoose');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../helpers/get-secure-hash.js');

/**
 * Check the secured hash
 */
module.exports = function ensureValidHashMiddleware(req, res, next) {
  async.waterfall([
    function retrieveCompany(cb) {
      Organization.findOne({SFDCId: req.data.organization.id}, cb);
    },
    function checkRequestValidity(org, cb) {
      req.organization = org;
      if(!org) {
        // No organization: return generic message (we don't want to disclose if someone is part of Salesfetch)
        return cb(new restify.InvalidCredentialsError('Please check your salesFetch Master Key!'));
      }

      var secureHash = getSecureHash(req.data, org.masterKey);
      if(secureHash !== req.data.hash) {
        return cb(new restify.InvalidCredentialsError('Please check your salesFetch Master Key!'));
      }

      cb(null);
    }
  ], next);
};
