"use strict";

var async = require('async');
var restify = require('restify');
var qs = require('querystring');

var config = require('../../../../config/configuration.js');
var anyfetchHelpers = require('../../../helpers/anyfetch.js');
var isMongoId = require('../../../helpers/is-mongo-id.js');

/**
 * Display list of all providers
 */
module.exports.get = function(req, res, next) {
  async.waterfall([
    function retrieveInfo(cb) {
      async.parallel({
        providersInformation: function(cb) {
          anyfetchHelpers.getProviders(cb);
        },
        connectedProviders: function(cb) {
          anyfetchHelpers.getConnectedProviders(req.user, cb);
        }
      }, cb);
    },
    function sendResponse(results, cb) {
      res.send({
        providers: results.providersInformation,
        connectedProviders: results.connectedProviders.body
      });
      cb();
    }
  ], next);
};

/**
 * Send the redirect URL to the client
 */
module.exports.post = function(req, res, next) {
  if(!req.params.id || !isMongoId(req.params.id)) {
    return next(new restify.MissingParameterError('Missing provider id'));
  }

  var returnTo = config.salesFetchUrl + '/oauth-callback.html';
  var query = {
    bearer: req.user.anyFetchToken,
    return_to: returnTo
  };

  var id = req.params.id;
  var connectUrl = config.managerUrl + '/connect/' + id + '?' + qs.stringify(query);
  res.send({ url: connectUrl });
  next();
};
