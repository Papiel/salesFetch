'use strict';

var restify = require('restify');
var async = require('async');

var mongoose = require('mongoose');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../helpers/get-secure-hash.js');

/**
 * Ensure the `data` was properly hashed, using Salesfetch private key and the organization key.
 */
module.exports = function ensureValidHashMiddleware(req, res, next) {
  async.waterfall([
    function retrieveCompany(cb) {
      // Retrieve the organization (we need to uses its masterKey)
      Organization.findOne({SFDCId: req.data.organization.id}, cb);
    },
    function checkRequestValidity(org, cb) {
      req.organization = org;
      if(!org) {
        // No organization: return generic message (we don't want to disclose if someone is part of Salesfetch, saying "no organization" would be an information by itself)
        return cb(new restify.InvalidCredentialsError('Please check your salesFetch Master Key!'));
      }

      // Compute a valid hash for the data, and compare with the specified hash
      var secureHash = getSecureHash(req.data, org.masterKey);
      if(secureHash !== req.data.hash) {
        return cb(new restify.InvalidCredentialsError('Please check your salesFetch Master Key!'));
      }

      // Data is properly signed, keep going.
      cb(null);
    }
  ], next);
};
