'use strict';

var restify = require('restify');

module.exports = function requiresContext(req, res, next) {
  if(!req.data || !req.data.context || !req.data.context.recordId) {
    return next(new restify.MissingParameterError('Missing or incomplete `context` argument in querystring'));
  }

  next();
};
