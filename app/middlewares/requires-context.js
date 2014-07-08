'use strict';

var restify = require('restify');

module.exports = function requiresContext(req, res, next) {
  if(!req.params || !req.params.data || !req.params.data.context || !req.params.data.context.recordId) {
    return next(new restify.MissingParameterError('Missing or incomplete `context` argument in querystring'));
  }

  next();
};
