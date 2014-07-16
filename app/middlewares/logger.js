'use strict';

var morgan = require('morgan');

var customLogger = function(tokens, req, res) {
  // Don't log OPTIONS call, CORS.
  if(req.method === "OPTIONS") {
    return;
  }

  var status = res.statusCode;
  var color = 32;
  var error = "";
  if (status >= 500) {
    color = 31;
    error = res._body;
  }
  else if (status >= 400){
    color = 33;
    error = res._body;
  }
  else if (status >= 300) {
    color = 36;
  }

  return '\x1b[90m' + req.method + ' ' + req.route.path + ' ' + '\x1b[' + color + 'm' + res.statusCode + ' \x1b[90m' + (new Date() - req._startTime) + 'ms' + '\x1b[0m' + ' ' + error;
};

module.exports = morgan(customLogger);
// Used to test the logging function
module.exports.customLogger = customLogger;
