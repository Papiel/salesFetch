'use strict';

var async = require('async');
var rarity = require('rarity');
var restify = require('restify');

var mongoose = require('mongoose');
var Organization = mongoose.model('Organization');

var anyfetchHelpers = require('../../../helpers/anyfetch.js');

// create an account in the name of the user if he doesn't exist
module.exports.post = function createAccount(req, res, next) {
  async.waterfall([
    function getOrg(cb) {
      // Find an existing company
      Organization.findOne({SFDCId: req.data.organization.id}, cb);
    },
    function addNewUser(org, cb) {
      if(!org) {
        return cb(new restify.InvalidCredentialsError('No company matching this id has been found'));
      }

      anyfetchHelpers.addNewUser(req.data.user, org, rarity.slice(2, cb));
    },
    function sendData(user, cb) {
      res.send(204);
      cb();
    }
  ], function(err) {
    if(err && err.toString().match(/duplicate key error/i)) {
      err = null;
      res.send(204);
    }

    return next(err);
  });
};
