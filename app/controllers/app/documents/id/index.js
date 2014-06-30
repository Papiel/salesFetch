"use strict";

var anyfetchHelpers = require('../../../../helpers/anyfetch.js');


/**
 * Show full document
 */
module.exports.get = function(req, res, next) {
  var reqParams = req.reqParams;

  anyfetchHelpers.findDocument(req.params.id, req.user, reqParams.context, function(err, document) {
    if(err) {
      return next(err);
    }

    res.render('app/full/' + req.deviceType + '.html', {
      data: reqParams,
      document: document
    });
  });
};
