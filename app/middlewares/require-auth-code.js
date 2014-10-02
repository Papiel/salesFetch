'use strict';

var restify = require("restify");
var config = require('../../config/configuration');


module.exports = function(req, res, next) {
  if(!req.params.code && config.code !== '') {
    next(new restify.MissingParameterError("Code unspecified."));
  }

  if(config.code !== '' && req.params.code !== config.code) {
    next(new restify.ForbiddenError("Invalid code."));
  }

  next();
};
