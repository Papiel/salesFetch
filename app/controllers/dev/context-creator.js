'use strict';

/**
 * @file Generate a fake context and give the user a URL with valid `data` parameters.
 * Useful when developping on localhost.
 */
// TODO: if no user or company is available, create one from AnyFetch credentials
// TODO: how to update hash after user has changed values?

var async = require('async');
var crypto = require('crypto');
var qs = require('querystring');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var config = require('../../../config/configuration.js');

module.exports = function(req, res) {
  // Basic dummy data
  var data = {
    sessionId: 'fake_session_id',
    salesFetchURL: 'https://staging-salesfetch.herokuapp.com',
    instanceURL: 'https://eu0.salesforce.com',
    env: {
      'width': 1084,
      'height': 400,
      'env': 'desktop'
    },
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
    var prefix = '/app/documents';
    var url = prefix;

    if(err) {
      var error = 'Error trying to generate context: ' + err + '. ';
      error += 'Make sure to create a valid user and organization in your local MongoDB `salesfetch-dev` database.';
      return res.render('app/context-creator.html', {
        json: data,
        prefix: prefix,
        url: url,
        errorMessage: error
      });
    }

    data.organization = {
      id: org.SFDCId,
      name: org.name
    };

    // Compute secure hash
    var hash = data.organization.id +
               data.user.id +
               org.masterKey +
               config.secureKey;
    data.hash = crypto.createHash('sha1').update(hash).digest("base64");

    var params = {
      data: JSON.stringify(data)
    };
    url += '?' + qs.stringify(params);
    return res.render('app/context-creator.html', {
      json: data,
      prefix: prefix,
      url: url
    });
  });
};
