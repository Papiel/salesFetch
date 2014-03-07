'use strict';

var crypto = require('crypto');
var async = require('async');
var mongoose =require('mongoose');
var Organization = mongoose.model('Organization');
var User = mongoose.model('User');
var config = require('../../config');


/**
 * Authenticate the user based on the request's context
 * return the user
 */
var authenticateUser = function(context, done) {
  var userContext = context.user;
  var orgContext = context.organization;
  async.waterfall([
    function(cb) {
      // Find an existing user
      User.findOne({userId: userContext.userId}, cb);
    }, function(user, cb) {
      if (user) {
        return done(null, user);
      }
      // Find the a mathcing company
      Organization.findOne({organizationId: context.organization.organizationId}, cb);
    }, function(org, cb) {
      if (org) {
        return cb(null, org);
      }

      // Create a company if no one matching
      var  newOrg = new Organization({
        name: orgContext.name,
        organizationId: orgContext.organizationId,
        currency: orgContext.currencyIsoCode
      });
      newOrg.save(cb);
    }, function(org, count, cb) {
      // Create create a user in the company
      var user = new User({
        name: userContext.fullName,
        userId: userContext.userId,
        email: userContext.email,
        organization: org._id
      });
      user.save(cb);
    }
  ], done);
};


/**
 * Called by Salesforce with SF user credentials and current context.
 * We'll use this to find our user / create an user.
 */
module.exports.authenticate = function(req, res) {
  var envelope;
  async.waterfall([
    function checkRequestValidity(cb){
      if (!req.body.signed_request) {
        return cb(new Error('bad request'));
      }

      // Extract request parts
      var bodyArray = req.body.signed_request.split(".");
      var consumerSecret = bodyArray[0];
      var encodedEnvelope = bodyArray[1];

      // Check the request validity
      var check = crypto.createHmac("sha256", config.consumer_secret).update(encodedEnvelope).digest("base64");
      if (check !== consumerSecret) {
        return cb(new Error("bad request"));
      }

      envelope = JSON.parse(new Buffer(encodedEnvelope, "base64"));
      cb(null, envelope);
    },
    function loadUser(envelope, cb){
      // Get the user
      authenticateUser(envelope.context, cb);
    }
  ], function (err, user) {
    if (err) {
      return res.send(401);
    }

    var redirectUrl = envelope.context.environment.parameters.url;

    req.session.user = user;
    req.session.context = {
      params: envelope.context.environment.parameters.parameters,
      dimensions: envelope.context.environment.dimensions,
      instance_url: envelope.client.instanceUrl,
      oauth_token: envelope.client.oauthToken
    };

    return res.redirect(302, redirectUrl);
  });
};
