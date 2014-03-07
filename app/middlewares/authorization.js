'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
  if (!req.session.user) {
    return res.send(401, 'User is not authorized');
  }

  User.loadAndPopulate(req.session.user._id, function(err, user) {
    if (err) {
      return res.send(401, 'User is not authorized');
    }

    req.user = user;
    next();
  });
};
