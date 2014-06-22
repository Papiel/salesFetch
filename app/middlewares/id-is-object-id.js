'use strict';

var express = require('express');

var isMongoId = require('../helpers/is-mongo-id.js');

/**
 * Require the `req.params.id` to exist and look like a Mongo ObjectId
 */
module.exports = function idIsObjectId(req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next(new express.errors.MissingArgument('Missing `id` parameter in URL'));
  }
  if(!isMongoId(id)) {
    return next(new express.errors.InvalidArgument(id + ' is not a valid MongoDB ObjectId'));
  }

  next();
};