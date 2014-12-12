'use strict';

var async = require('async');
var rarity = require('rarity');
var restify = require('restify');

var anyfetchHelpers = require('../../../helpers/anyfetch.js');


// Create an account in the name of the user if he doesn't exist
// Return no data
// This handler is protected by ensureValidHash (elsewise anyone would be able to add a user on any organization)
module.exports.post = function createAccount(req, res, next) {
  async.waterfall([
    function addNewUser(cb) {
      anyfetchHelpers.addNewUser(req.data.user, req.organization, rarity.slice(2, cb));
    },
    function sendData(user, cb) {
      res.send(204);
      cb();
    }
  ], function(err) {
    if(err && err.toString().match(/duplicate key error/i)) {
      err = null;
      res.send(new restify.ForbiddenError("This user was already init"));
    }

    return next(err);
  });
};
