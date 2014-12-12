'use strict';

var async = require('async');
var rarity = require('rarity');
var restify = require('restify');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var anyfetchHelpers = require('../../../helpers/anyfetch.js');

// create an account in the name of the user if he doesn't exist
module.exports.post = function createAccount(req, res, next) {
  async.waterfall([
    function getUser(cb) {
      // Find an existing user
      User.findOne({SFDCId: req.data.user.id}, cb);
    },
    function getOrg(user, cb) {
      // Find an existing company
      Organization.findOne({SFDCId: req.data.organization.id}, rarity.carry([user], cb));
    },
    function addNewUser(user, org, cb) {
      if(!org) {
        return cb(new restify.InvalidCredentialsError('No company matching this id has been found'));
      }
      if(user) {
        return cb(null, user);
      }
      anyfetchHelpers.addNewUser(req.data.user, org, rarity.slice(2, cb));
    },
    function sendData(user, cb) {
      res.send(204);
      cb();
    }
  ], next);
};
