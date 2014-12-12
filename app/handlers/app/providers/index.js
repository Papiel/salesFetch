"use strict";

var async = require('async');
var qs = require('querystring');

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
 * Send the redirect URL to the client
 */
module.exports.post = function(req, res, next) {
  var returnTo = config.salesFetchUrl + '/oauth-callback.html';
  var query = {
    bearer: req.user.anyfetchToken,
    return_to: returnTo
  };

  var id = req.params.id;
  var connectUrl = config.managerUrl + '/connect/' + id + '?' + qs.stringify(query);
  res.send({url: connectUrl});
  next();
};
