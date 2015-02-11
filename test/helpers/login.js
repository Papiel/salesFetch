'use strict';

/**
 * Login helpers
 */

var async = require('async');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../../app/helpers/get-secure-hash.js');

var userInfo = {
  SFDCId: 'SFDCId',
  SFDCData: {
    name: 'walter.white@breaking-bad.com',
    email: 'walter.white@breaking-bad.com',
  },
  anyfetchId: 'anyfetchId',
  anyfetchToken: 'anyfetchToken',
  anyfetchEmail: '1413306427601@anyfetch.com',
  isAdmin: true
};

var orgInfo = {
  SFDCData: {
    name: 'Breaking Bad',
  },
  anyfetchId: 'anyfetchId',
  SFDCId: 'SFDCId',
};

module.exports.requestBuilder = function(endpoint, context, cb) {
  var createdOrg;

  async.waterfall([
    function createCompany(cb) {
      var org = new Organization(orgInfo);

      org.save(cb);
    }, function createUser(org, _, cb) {
      createdOrg = org;
      userInfo.organization = org._id;
      var user = new User(userInfo);
      user.save(cb);
    }
  ], function(err, user) {
    if(err) {
      return cb(err);
    }

    var data = {
      organization: {
        id: createdOrg.SFDCId
      },
      user: {
        id: user.SFDCId
      },
      context: context,
      anyfetchURL: 'http://api.anyfetch.com',
      instanceURL: 'https://eu2.salesforce.com',
      timestamp: Date.now()
    };
    var hash = getSecureHash(data, createdOrg.masterKey);
    data.hash = hash;

    var separator = endpoint.indexOf('?') !== -1 ? '&' : '?';
    var url = endpoint + separator + 'data=' + encodeURIComponent(JSON.stringify(data));
    cb(null, url);
  });
};

module.exports.getUser = function(cb) {
  User.findOne({anyfetchId: userInfo.anyfetchId}, cb);
};

module.exports.getOrganization = function(cb) {
  Organization.findOne(orgInfo, cb);
};
