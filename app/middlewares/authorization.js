'use strict';

var restify = require('restify');
var async = require('async');
var rarity = require('rarity');

var mongoose =require('mongoose');
var Organization = mongoose.model('Organization');
var User = mongoose.model('User');

var anyFetchHelper = require('../helpers/anyfetch.js');
var getSecureHash = require('../helpers/get-secure-hash.js');

/**
 * Authenticate the user based on the request's context
 * @return {Object} the user
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
    return next(new restify.InvalidCredentialsError('Bad Request: missing `data` query parameter'));
  }
  var data;
  try {
    data = JSON.parse(req.query.data);
  } catch(e) {
    return next(new restify.UnprocessableEntityError('Bad Request: malformed JSON in `data` query parameter'));
  }

  async.waterfall([
    function retrieveCompany(cb) {
      if (!data.organization || !data.organization.id) {
        return next(new restify.InvalidCredentialsError('Bad Request: missing organization id'));
      }

      Organization.findOne({SFDCId: data.organization.id}, cb);
    },
    function checkRequestValidity(org, cb){
      organization = org;
      if (!org) {
        return next(new restify.InvalidCredentialsError('No company matching this id has been found'));
      }

      var check = getSecureHash(data, org.masterKey);
      if (check !== data.hash) {
        return next(new restify.InvalidCredentialsError('Please check your salesFetch Master Key!'));
      }
      cb(null, data);
    },
    function loadUser(envelope, cb){
      authenticateUser(envelope, organization, rarity.slice(2, cb));
    },
    function writeRes(user, cb) {
      req.user = user;
      req.organization = organization;
      req.data = data;
      cb();
    }
  ], next);
};
