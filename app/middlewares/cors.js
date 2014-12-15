'use strict';

var forceRegexp = new RegExp("^https://[^/?]+\\.(sales|visual\\.)force\\.com");

module.exports = function(req, res, next) {
  var allowHeaders = ['Accept', 'Accept-Version', 'Authorization', 'Content-Type', 'Api-Version', 'X-Requested-With'];

  res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  // Send CORS headers only for valid Salesforce host
  if(forceRegexp.test(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }

  return next();
};
