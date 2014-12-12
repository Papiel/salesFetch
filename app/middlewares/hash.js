'use strict';

var restify = require('restify');
var async = require('async');

var mongoose = require('mongoose');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../helpers/get-secure-hash.js');

/**
 * Check the secured hash
 */
module.exports = function(req, res, next) {
  async.waterfall([
    function retrieveCompany(cb) {
      Organization.findOne({SFDCId: req.data.organization.id}, cb);
    },
    function checkRequestValidity(org, cb) {
      req.organization = org;
      if(!org) {
        return next(new restify.InvalidCredentialsError('No company matching this id has been found'));
      }

      var check = getSecureHash(req.data, org.masterKey);
      if(check !== req.data.hash) {
        return next(new restify.InvalidCredentialsError('Please check your salesFetch Master Key!'));
      }

      cb(null);
    }
  ], next);
};
