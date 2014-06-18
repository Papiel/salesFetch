'use strict';

/**
 * Require the `req.params.id` to exist and look like a Mongo ObjectId
 */
module.exports.idIsObjectId = function(req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next({
      status: 409,
      message: 'Missing `id` parameter in URL'
    });
  }
  if(!id.toString().match(/^[0-9a-f]{24}$/i)) {
    return next({
      status: 409,
      message: id + ' is not a valid MongoDB ObjectId'
    });
  }

  next();
};

module.exports.requiresContext = function(req, res, next) {
  if(!req.reqParams || !req.reqParams.context || !req.reqParams.context.recordId) {
    return next({
      status: 409,
      message: 'Missing or incomplete `context` argument in querystring'
    });
  }

  next();
};