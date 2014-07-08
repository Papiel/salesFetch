"use strict";


var anyfetchHelpers = require('../../../helpers/anyfetch.js');
var async = require("async");
var express = require("express");


/**
 * Display list of all providers
 */
module.exports.get = function(req, res, next) {
  var reqParams = req.reqParams;
  async.parallel({
    providersInformation: function(cb) {
      anyfetchHelpers.getProviders(cb);
    },
    connectedProviders: function(cb) {
      anyfetchHelpers.getConnectedProviders(req.user, cb);
    }
  }, function(err, data) {
    if (err) {
      return next(err);
    }

    res.render('app/providers.html', {
      data: reqParams,
      providers: data.providersInformation,
      connectProviders: data.connectedProviders.body
    });
  });
};

/**
 * Redirect the user to the connection page
 */
module.exports.post = function(req, res, next) {
  if (!req.query.app_id) {
    return next(new express.errors.MissingArgument('Missing app_id query string.'));
  }

  var connectUrl = 'https://manager.anyfetch.com/connect/' + req.query.app_id + '?bearer=' + req.user.anyFetchToken;
  res.redirect(connectUrl);
};
