'use strict';

var restify = require('restify');
var errorsStack = require('errorhandler');
var autoLoad = require('auto-load');

var config = require('./configuration.js');

// TODO: reinstate less compile middleware?
// TODO: reinstate some sort of basic static folder to serve the app's client?

// TODO: not needed anymore?
var errorsHandlers = function(server) {
  // This middleware is used to provide a next
  server.use(function(err, req, res, next) {
    if (config.env !== 'test') {
      console.error(err.stack);
    }

    // Error page
    err.statusCode = err.statusCode || err.code || err.status || 500;
    return next(err);
  });

  // Default error: 404 (no other middleware responded)
  server.use(function(req, res, next) {
    return next(new restify.NotFoundError('Not found'));
  });

  if (config.env === 'development') {
    server.use(errorsStack());
  }
};

module.exports = function(server) {
  // Check if fetchApi token is set before continuing!
  if (config.env !== 'test' && !config.fetchApiCreds) {
    console.log('Please provide a FetchApi token before launching the server.');
    process.exit(1);
  }

  // Models
  autoLoad(__dirname + '/../app/models');

  // Simplified logger for dev and production
  if (config.env !== 'test') {
    server.use(require('../app/middlewares/logger.js'));
  }

  // Common middlewares
  server.use(restify.queryParser());
  server.use(restify.bodyParser());
  server.use(require('../app/middlewares/CORS.js'));

  // Routes
  require(__dirname + '/../app/routes.js')(server);

  // Apply errors if routing fails or doesn't match
  errorsHandlers(server);

  return server;
};
