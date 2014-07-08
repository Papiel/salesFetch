'use strict';

var mochaMongoose = require('mocha-mongoose');
var config = require('../../config/configuration.js');

module.exports = mochaMongoose(config.mongo_url, {noClear: true});