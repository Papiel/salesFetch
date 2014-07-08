"use strict";

var anyfetchHelpers = require('../../../../helpers/anyfetch.js');


/**
 * Show full document
 */
module.exports.get = function(req, res, next) {
  anyfetchHelpers.findDocument(req.params.id, req.user, req.data.context, function(err, document) {
    if(err) {
      return next(err);
    }

    res.render('app/full/' + req.deviceType + '.html', {
      data: reqParams,
      document: document
    });
  });
};
