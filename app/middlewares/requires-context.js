'use strict';

var restify = require('restify');

module.exports = function requiresContext(req, res, next) {
  if(!req.reqParams || !req.reqParams.context || !req.reqParams.context.recordId) {
    return next(new restify.MissingArgumentError('Missing or incomplete `context` argument in querystring'));
  }

  next();
};
