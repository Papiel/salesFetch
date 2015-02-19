'use strict';

var restify = require('restify');
var async = require('async');

var mongoose = require('mongoose');
var User = mongoose.model('User');


/**
 * Check the user exists
 */
module.exports = function ensureValidUserMiddleware(req, res, next) {
  var data = req.data;

  async.waterfall([
    function(cb) {
      // Find an existing user
      User.findOne({SFDCId: data.user.id}, cb);
    },
    function(user, cb) {
      if(!user) {
        // Return custom message (the frontend will redirect the user to the init page)
        return cb(new restify.InvalidCredentialsError('User not created'));
      }
      return cb(null, user);
    },
    function writeReq(user, cb) {
      req.user = user;
      cb();
    }
  ], next);
};
