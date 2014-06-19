'use strict';

var isMongoId = require('../helpers/is-mongo-id.js');

/**
 * Require the `req.params.id` to exist and look like a Mongo ObjectId
 */
module.exports = function idIsObjectId(req, res, next) {
  var id = req.params.id;
  var e;
  if (!id) {
    e = new Error('Missing `id` parameter in URL');
    e.status = 409;
    return next(e);
  }
  if(!isMongoId(id)) {
    e = new Error(id + ' is not a valid MongoDB ObjectId');
    e.status = 409;
    return next(e);
  }

  next();
};