'use strict';

var AnyFetch = require('anyfetch');

module.exports.dir = __dirname + '/anyfetch-mock';

module.exports.restore = function() {
  AnyFetch.server.restore();
};
