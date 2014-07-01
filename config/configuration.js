"use strict";

var _ = require('lodash');

// Load environment variables from .env file
var dotenv = require('dotenv');
dotenv.load();

// Load configurations
// Set the node environment variable if not set before
var nodeEnv = process.env.NODE_ENV || 'development';

// Extend the base configuration in all.js with environment
// specific configuration
module.exports = _.extend(
    {env: nodeEnv},
    require('./env/all'),
    require('./env/' + nodeEnv) || {}
);
