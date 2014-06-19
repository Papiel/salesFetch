'use strict';

module.exports = function requiresContext(req, res, next) {
  if(!req.reqParams || !req.reqParams.context || !req.reqParams.context.recordId) {
    var e = new Error('Missing or incomplete `context` argument in querystring');
    //e.status = 409;
    return next(e);
  }

  next();
};