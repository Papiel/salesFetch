'use strict';

module.exports.requiresContext = function(req, res, next) {
  if(!req.reqParams || !req.reqParams.context || !req.reqParams.context.recordId) {
    return next({
      status: 409,
      message: 'Missing or incomplete `context` argument in querystring'
    });
  }

  next();
};