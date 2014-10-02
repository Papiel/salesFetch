'use strict';

/**
 * Main application file entry
 * Notice that the application loading order is important
 */

var restify = require('restify');

// Init system variables
var config = require('./config/configuration.js');
var bootstrap = require('./config/bootstrap.js');

var mongoose = require('mongoose');
mongoose.connect(config.mongo_url);

// Init server in the right mode
// With HTTPS in development, Heroku manages HTTPS in production
var serverOptions = {
  name: "SalesFetch"
};


if(config.env === 'development') {
  serverOptions.certificate = config.certificates.cert;
  serverOptions.key = config.certificates.key;
}


var server = restify.createServer(serverOptions);
// Bootstrap Models, Dependencies, Routes, Middlewares
server = bootstrap(server);
module.exports = server;
