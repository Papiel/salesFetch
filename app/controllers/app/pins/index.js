"use strict";

var salesfetchHelpers = require('../../../helpers/salesfetch.js');


/**
 * Show pinned documents (only the pins, not the surrounding interface)
 */
module.exports.get = function(req, res, next) {
  var sfdcId = req.reqParams.context.recordId;

  salesfetchHelpers.findPins(sfdcId, req.user, function(err, pins) {
    if(err) {
      next(err);
    }

    res.render('components/_pinned-list.html', { pins: pins });
  });
};
