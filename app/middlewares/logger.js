'use strict';

var morgan = require('morgan');
var url = require('url');

var customLogger = function(tokens, req, res) {
  // Don't log OPTIONS call, CORS.
  if(req.method === "OPTIONS") {
    return;
  }

  var status = res.statusCode;
  var color = 32;
  var error = "";
  if(status >= 500) {
    color = 31;
    error = res._body;
  }
  else if(status >= 400) {
    color = 33;
    error = res._body;
  }
  else if(status >= 300) {
    color = 36;
  }

  var parsed = url.parse(req.url);
  var path = parsed.pathname;
  if(path && path.indexOf('/app/') !== -1) {
    path = '\x1b[37m' + path;
  }

  return '\x1b[90m' + req.method + ' ' + path + ' ' + '\x1b[' + color + 'm' + res.statusCode + ' \x1b[90m' + (new Date() - req._startTime) + 'ms' + '\x1b[0m' + ' ' + error;
};

module.exports = morgan(customLogger);
// Used to test the logging function
module.exports.customLogger = customLogger;
