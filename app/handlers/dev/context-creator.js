'use strict';

/**
 * @file Generate a fake context and give the user a URL with valid `data` parameters.
 * Useful when developping on localhost.
 */
// TODO: if no user or company is available, create one from AnyFetch credentials

var restify = require('restify');
var async = require('async');
var qs = require('querystring');
var _ = require('lodash');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var config = require('../../../config/configuration.js');
var getSecureHash = require('../../helpers/get-secure-hash.js');
var isString = require('../../helpers/is-string.js');

// Basic dummy data
var defaultDummyContext = {
  sessionId: 'fake_session_id',
  salesFetchURL: config.salesFetchUrl,
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
var defaultPrefix = '/';

var sendRes = function(res, data, org, prefix) {
  data.organization = {
    id: org.SFDCId,
    name: org.name
  };

  // Compute secure hash
  data.hash = getSecureHash(data, org.masterKey);

  var params = {
    data: JSON.stringify(data)
  };
  var url = config.salesFetchUrl + prefix + '?' + qs.stringify(params);
  res.send({
    prefix: prefix,
    url: url,
    json: data
  });
};

/**
 * Obtain an initial dummy context
 */
module.exports.get = function getDummyContext(req, res, next) {
  var data = _.merge({}, defaultDummyContext);

  async.waterfall([
    function findUser(cb) {
      User.findOne({}, cb);
    },
    function findOrg(user, cb) {
      if(!user) {
        return cb('No user found');
      }

      data.user = {
        id: user.SFDCId,
        name: user.name,
        email: user.email
      };
      Organization.findOne({ _id: user.organization }, cb);
    }
  ], function writeResults(err, org) {
    if(err) {
      res.send(new restify.NotFoundError(err + ', make sure to create a valid user and organization in your local MongoDB `salesfetch-dev` database.'));
      return next();
    }

    sendRes(res, data, org, defaultPrefix);
    next();
  });
};

/**
 * Sign a dummy context by client request
 */
module.exports.post = function computeHash(req, res, next) {
  if(!req.params || !req.params.data) {
    res.send(new restify.MissingParameterError('Missing `data` key'));
    return next();
  }
  var data = req.params.data;
  if(isString(data)) {
    try {
      data = JSON.parse(data);
    } catch(e) {
      res.send(new restify.UnprocessableEntityError('Invalid JSON'));
      return next();
    }
  }

  if(!data.organization || !data.organization.id) {
    res.send(new restify.MissingParameterError('Missing `data.organization` key'));
    return next();
  }

  var prefix = req.params.prefix;
  var organization = data.organization;

  async.waterfall([
    function findOrg(cb) {
      Organization.findOne({ SFDCId: organization.id }, cb);
    },
  ], function writeResponse(err, org) {
    if(err || !org) {
      res.send(new restify.NotFoundError('No org with SFDCId ' + organization.id + ' was found'));
      return next();
    }

    sendRes(res, data, org, prefix);
    next();
  });
};
