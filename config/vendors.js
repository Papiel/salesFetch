'use strict';

/**
 * @file Load and init external services
 */

var config = require('../config/configuration.js');

var opbeat = require('opbeat');
module.exports.opbeat = opbeat.createClient(config.services.opbeat);
