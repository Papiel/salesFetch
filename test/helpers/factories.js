"use strict";

var async = require('async');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

module.exports.initAccount = function(cb) {
  var createdOrg;

  async.waterfall([
    function createCompany(cb) {
      var org = new Organization({
        name: "anyfetch",
        SFDCId: '1234',
      });

      org.save(cb);
    },
    function createAdminUser(org, _, cb) {
      createdOrg = org;

      var user = new User({
        SFDCId: '5678',
        organization: org,
      });

      user.save(cb);
    },
  ], function(err, user) {
    cb(err, user, createdOrg);
  });
};
