'use strict';

var express = require('express');

module.exports = function requiresContext(req, res, next) {
  if(!req.reqParams || !req.reqParams.context || !req.reqParams.context.recordId) {
    return next(new express.errors.MissingArgument('Missing or incomplete `context` argument in querystring'));
  }

  next();
};