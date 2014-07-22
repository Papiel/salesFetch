'use strict';

/**
 * @file Generate a fake context and give the user a URL with valid `data` parameters.
 * Useful when developping on localhost.
 */
// TODO: if no user or company is available, create one from AnyFetch credentials
// TODO: how to update hash after user has changed values?

var async = require('async');
var qs = require('querystring');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../../helpers/get-secure-hash.js');

module.exports = function(req, res) {
  // Basic dummy data
  var data = {
    sessionId: 'fake_session_id',
    salesFetchURL: 'https://salesfetch-staging.herokuapp.com',
    instanceURL: 'https://eu0.salesforce.com',
    context: {
      templatedDisplay: 'Matthieu Bacconnier',
      templatedQuery: 'Matthieu Bacconnier',
      recordId: '0032000001DoV22AAF',
      recordType: 'Contact'
    },
    user: {
      id: '',
      name: '',
      email: ''
    },
    organization: {
      id: '',
      name: ''
    }
  };

  async.waterfall([
    function findUser(cb) {
      User.findOne({}, cb);
    },
    function findOrg(user, cb) {
      data.user = {
        id: user.SFDCId,
        name: user.name,
        email: user.email
      };
      Organization.findOne({ _id: user.organization }, cb);
    }
  ], function writeResults(err, org) {
    var prefix = '/index.html';
    var url = prefix;

    if(err) {
      var error = 'Error trying to generate context: ' + err + '. ';
      error += 'Make sure to create a valid user and organization in your local MongoDB `salesfetch-dev` database.';
      return res.send({
        error: error,
        json: data
      });
    }

    data.organization = {
      id: org.SFDCId,
      name: org.name
    };

    // Compute secure hash
    data.hash = getSecureHash(data, org.masterKey);

    // TODO: move that nice view client-side
    // app/context-creator.html
    var params = {
      data: JSON.stringify(data)
    };
    data.url = 'https://' + req.headers.host + url + '?' + qs.stringify(params);
    return res.send(data);
  });
};
