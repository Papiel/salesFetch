'use strict';

/**
 * @file Generate a fake context and give the user a URL with valid `data` parameters.
 * Useful when developping on localhost.
 */
// TODO: if no user or company is available, create one from AnyFetch credentials
// TODO: make env (desktop/tablet/mobile) customizable
// TODO: make context customizable

var async = require('async');
var rarity = require('rarity');
var crypto = require('crypto');
var qs = require('querystring');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var config = require('../../../config/configuration.js');

module.exports = function(req, res, next) {
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
    }
  };

  async.waterfall([
    function user(cb) {
      User.findOne({}, cb);
    },
    function org(user, cb) {
      Organization.findOne({ _id: user.organization }, rarity.carry(user, cb));
    }
  ], function writeResults(err, user, org) {
    if(err) {
      res.write(data);
      return res.end();
    }

    data.user = {
      id: user.SFDCId,
      name: user.name,
      email: user.email
    };
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
    var url = '/app/documents?' + qs.stringify(params);
    return res.render('app/context-creator.html', {
      json: data,
      url: url
    });
  });
};
