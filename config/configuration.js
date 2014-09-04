"use strict";

var _ = require('lodash');
var path = require('path');

// Load environment variables from .env file
var dotenv = require('dotenv');
dotenv.load();

// Load configurations
// Set the node environment variable if not set before
var nodeEnv = process.env.NODE_ENV || 'development';

var rootPath = path.normalize(__dirname + '/../..');
var errorsPath = rootPath + '/app/views/errors';

// Third party services
var services = {};
services.opbeat = {
  organization_id: process.env.OPBEAT_ORG_ID,
  app_id: process.env.OPBEAT_APP_ID,
  secret_token: process.env.OPBEAT_TOKEN,
  silent: true,
};

var baseConfig = {
  env: nodeEnv,

  root: rootPath,
  port: process.env.PORT || 3000,
  salesFetchUrl: process.env.SALESFETCH_URL,

  // List of the available error files
  errorsPath: errorsPath,
  errorFiles: {
    401: '401.html',
    403: '403.html',
    405: '405.html'
  },

  fetchApiUrl: process.env.API_URL || "https://api.anyfetch.com",
  managerUrl: process.env.MANAGER_URL || "https://manager.anyfetch.com",
  fetchApiCreds: process.env.API_CREDENTIALS,

  // Minimum delay between two calls to `POST /company/update`
  // for a single company (in milliseconds)
  companyUpdateDelay: 30 * 60 * 1000,

  secretKey: process.env.SALESFETCH_SECRET_KEY || "SalesFetch4TheWin",

  services: services
};

// Extend the base configuration in all.js with environment
// specific configuration
module.exports = _.extend(
    baseConfig,
    require('./env/' + nodeEnv) || {}
);
