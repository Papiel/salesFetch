'use strict';

var async = require('async');
var rarity = require('rarity');
var restify = require('restify');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var anyFetchHelpers = require('../../../helpers/anyfetch.js');

// create an account inthe name of the user if he doesn't exist
module.exports.post = function(req, res, next) {
  async.waterfall([
    function(cb) {
      // Find an existing user
      User.findOne({SFDCId: req.data.user.id}, cb);
    },
    function(user, cb) {
      // Find an existing company
      Organization.findOne({SFDCId: req.data.organization.id}, rarity.carry([user], cb));
    },
    function(user, org, cb) {
      if(!org) {
        return cb(new restify.InvalidCredentialsError('No company matching this id has been found'));
      }
      if(user) {
        return cb(null, user);
      }
      anyFetchHelpers.addNewUser(req.data.user, org, cb);
    }
  ], function(err, user) {
    if(err) {
      return next(err);
    }
    res.send(user);
  });
};
