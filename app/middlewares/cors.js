'use strict';

var forceRegexp = new RegExp("^https://[^/?]+\\.(sales|visual\\.)force\\.com");

module.exports = function(req, res, next) {
  var allowHeaders = ['Accept', 'Accept-Version', 'Authorization', 'Content-Type', 'Api-Version', 'X-Requested-With'];

  res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  // Send CORS headers only for valid Salesforce host
  if(forceRegexp.test(req.headers.origin)) {
    // For optimum results, we would like to reply with Access-Control-Allow-Origin: req.headers.origin
    // However Salesforce mix servers in the same request and the browser may cache pre-flight request independantly of Cache options for the real answer.
    // this results in a fail in pre-flight request (browser keeps an outdated Allow-Origin value in cache)
    // Never happens on US servers, but often fail on eu server with the following
    // XMLHttpRequest cannot load https://salesfetch.herokuapp.com/app.html. The 'Access-Control-Allow-Origin' header has a value 'https://c.eu0.visual.force.com' that is not equal to the supplied origin. Origin 'https://c.eu5.visual.force.com' is therefore not allowed access.
    // Therefore we need to reply with "*" (but we do so only when coming from a valid SF host).
    // (note this is a hacky hack -- and also the reason why browsers implemented preflight-cache invalidation, to avoid cache poisoning attack)
    // @see http://monsur.hossa.in/2012/09/07/thoughts-on-the-cors-preflight-cache.html
    res.header('Access-Control-Allow-Origin', '*');
  }

  return next();
};
