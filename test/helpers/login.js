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
  anyFetchId: 'anyFetchId',
  SFDCId: 'SFDCId',
  name: 'Walter White',
  email: 'walter.white@breaking-bad.com',
  anyFetchToken: 'anyFetchToken',
  isAdmin: true
};

module.exports.requestBuilder = function(endpoint, context, cb) {
  var createdOrg;

  async.waterfall([
    function createCompany(cb) {
      var org = new Organization({
        name: 'Breaking Bad',
        anyFetchId: 'anyFetchId',
        SFDCId: 'SFDCId',
      });

      org.save(cb);
    }, function createUser(org, _, cb) {
      createdOrg = org;
      userInfo.organization = org._id;
      var user = new User(userInfo);
      user.save(cb);
    }
  ], function(err, user) {
    if (err) {
      return cb(err);
    }

    // TODO: soon, we'll probably need more info to indentify a request
    var hash = getSecureHash({
      organization: { id: createdOrg.SFDCId },
      user: { id: user.SFDCId }
    }, createdOrg.masterKey);

    var authObj = {
      hash: hash,
      organization: {id: createdOrg.SFDCId},
      user: {id: user.SFDCId},
      context: context,
      anyFetchURL: 'http://api.anyfetch.com',
      instanceURL: 'https://eu2.salesforce.com'
    };

    var separator = endpoint.indexOf('?') !== -1 ? '&' : '?';

    var ret = endpoint + separator + 'data=' + encodeURIComponent(JSON.stringify(authObj));

    cb(null, ret);
  });
};

module.exports.getUser = function(cb) {
  User.findOne( { email: userInfo.email }, cb);
};
