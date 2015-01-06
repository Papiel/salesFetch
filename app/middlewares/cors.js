'use strict';

var forceRegexp = new RegExp("^https://[^/?]+\\.(sales|visual\\.)force\\.com");

module.exports = function(req, res, next) {
  var allowHeaders = ['Accept', 'Accept-Version', 'Authorization', 'Content-Type', 'Api-Version', 'X-Requested-With'];

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  // Send CORS headers only for valid Salesforce host
  console.log(req.headers.origin, forceRegexp.test(req.headers.origin));
  if(forceRegexp.test(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);

    // For optimum results, we would like to reply with Access-Control-Allow-Origin: req.headers.origin
    // Salesforce mix servers in the same request and the browser may cache pre-flight request independantly of Cache options for the real answer.
    // this results in a fail in pre-flight request (browser keeps an outdated Allow-Origin value in cache)
    // Never happens on US servers, but often fail on eu server with the following
    // XMLHttpRequest cannot load https://salesfetch.herokuapp.com/app.html. The 'Access-Control-Allow-Origin' header has a value 'https://c.eu0.visual.force.com' that is not equal to the supplied origin. Origin 'https://c.eu5.visual.force.com' is therefore not allowed access.
    // Therefore we need to add a Vary: Origin to indicate we want the browser to renegotiate a CORS session every time :(
    // @see http://monsur.hossa.in/2012/09/07/thoughts-on-the-cors-preflight-cache.html
    // @see http://stackoverflow.com/questions/25329405/why-isnt-vary-origin-response-set-on-a-cors-miss
  }

  return next();
};
