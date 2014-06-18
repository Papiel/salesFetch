'use strict';

/**
 * Require the `req.params.id` to exist and look like a Mongo ObjectId
 */
module.exports.idIsObjectId = function(req, res, next) {
  var id = req.params.id;
  var e;
  if (!id) {
    e = new Error('Missing `id` parameter in URL');
    e.status = 409;
    return next(e);
  }
  if(!id.toString().match(/^[0-9a-f]{24}$/i)) {
    e = new Error(id + ' is not a valid MongoDB ObjectId');
    e.status = 409;
    return next(e);
  }

  next();
};

module.exports.requiresContext = function(req, res, next) {
  if(!req.reqParams || !req.reqParams.context || !req.reqParams.context.recordId) {
    var e = new Error('Missing or incomplete `context` argument in querystring');
    e.status = 409;
    return next(e);
  }

  next();
};