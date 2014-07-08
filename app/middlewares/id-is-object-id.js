'use strict';

var restify = require('restify');

var isMongoId = require('../helpers/is-mongo-id.js');

/**
 * Require the `req.params.id` to exist and look like a Mongo ObjectId
 */
module.exports = function idIsObjectId(req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next(new restify.MissingParameterError('Missing `id` parameter in URL'));
  }
  if(!isMongoId(id)) {
    return next(new restify.InvalidArgumentError(id + ' is not a valid MongoDB ObjectId'));
  }

  next();
};
