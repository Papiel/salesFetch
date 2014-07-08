'use strict';

var UAParser = require('ua-parser-js');

/**
 * User-agent parser
 * Determine the device type of the request
 */
module.exports = function(req, res, next) {

  // Check if use the salesforce desktop version
  if (req.reqParams && req.reqParams.env && req.reqParams.env.env === 'desktop') {
    req.deviceType = 'desktop';
    return next();
  }

  // Handle Salesforce1 request based on User-Agent
  var parser = new UAParser();
  var ua = req.headers['user-agent'];
  req.deviceType = parser.setUA(ua).getResult().device.type || 'mobile';

  next();
};
