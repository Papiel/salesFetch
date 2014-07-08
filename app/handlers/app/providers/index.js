"use strict";

var async = require("async");
var restify = require("restify");

var config = require('../../../../config/configuration.js');
var anyfetchHelpers = require('../../../helpers/anyfetch.js');

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
 * Produce the url to which the user should get redirected
 * in order to grant access
 */
module.exports.post = function(req, res, next) {
  if (!req.query.app_id) {
    return next(new restify.MissingParameterError('Missing app_id query string.'));
  }

  var connectUrl = config.managerUrl + '/connect/' + req.query.app_id + '?bearer=' + req.user.anyFetchToken;
  res.send({ connectUrl: connectUrl });
  next();
};
