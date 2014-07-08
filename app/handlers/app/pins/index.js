"use strict";

var salesfetchHelpers = require('../../../helpers/salesfetch.js');


/**
 * Show pinned documents (only the pins, not the surrounding interface)
 */
module.exports.get = function(req, res, next) {
  var sfdcId = req.data.context.recordId;

  salesfetchHelpers.findPins(sfdcId, req.user, function(err, pins) {
    if(err) {
      next(err);
    }

    res.send({ pins: pins });
  });
};
