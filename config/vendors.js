'use strict';

/**
 * @file Load and init external services
 */

var config = require('../config/configuration.js');

if(process.env.NODE_ENV !== "test") {
  var opbeat = require('opbeat');
  module.exports.opbeat = opbeat(config.services.opbeat);
}
