'use strict';

/**
 * Main application file entry
 * Notice that the application loading order is important
 */

var mongoose = require('mongoose');

// Init system variables
var config = require('./config/configuration.js');
mongoose.connect(config.mongo_url);

// Bootstrap Models, Dependencies, Routes and the app as an express app
var app = require('./config/bootstrap.js')();

// Init server in the right mode
// With HTTPS in development, Heroku manage HTTPS in production
var server;
if (config.env === 'development') {
  server = require('https').createServer(config.certificates, app);
} else {
  server = require('http').createServer(app);
}

// Boot the server
server.listen(config.port, function() {
  console.log("Server [" + config.env + "] listening on " + config.port);
});

module.exports = server;
