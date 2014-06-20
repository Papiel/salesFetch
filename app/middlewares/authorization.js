'use strict';

var crypto = require('crypto');
var async = require('async');
var mongoose =require('mongoose');
var Organization = mongoose.model('Organization');
var User = mongoose.model('User');

var anyFetchHelper = require('../helpers/anyfetch.js');
var secureKey = require('../../config/configuration.js').secureKey;

/**
 * Authenticate the user based on the request's context
 * return the user
 */
var authenticateUser = function(context, org, done) {
  var userContext = context.user;
  async.waterfall([
    function(cb) {
      // Find an existing user
      User.findOne({SFDCId: userContext.id}, cb);
    }, function(user, cb) {
      if (user) {
        return done(null, user);
      }

      anyFetchHelper.addNewUser(userContext, org, cb);
    }
  ], done);
};

/**
 * Generic require login routing middleware
 */
module.exports.requiresLogin = function(req, res, next) {
  var organization;

  if (!req.query.data) {
    return next({message: "Bad Request", status: 401});
  }
  var data = JSON.parse(req.query.data);

  async.waterfall([
    function retrieveCompany(cb) {
      if (!data.organization.id) {
        return next({message: "Bad Request", status: 401});
      }

      Organization.findOne({SFDCId: data.organization.id}, cb);
      console.log(data.organization.id);
    },
    function checkRequestValidity(org, cb){
      console.log(org);
      organization = org;
      if (!org) {
        return next({message: "No matching company has been found", status: 401});
      }

      var hash = data.organization.id + data.user.id + org.masterKey + secureKey;
      var check = crypto.createHash('sha1').update(hash).digest("base64");

      if (check !== data.hash) {
        return next({message: "Please check your salesFetch Master Key!", status: 401});
      }
      cb(null, data);
    },
    function loadUser(envelope, cb){
      authenticateUser(envelope, organization, cb);
    }
  ], function (err, user) {
    if (err) {
      return next({status: 401});
    }

    req.user = user;
    req.organization = organization;
    req.reqParams = data;

    next();
  });
};
