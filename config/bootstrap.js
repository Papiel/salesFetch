'use strict';

var restify = require('restify');
var logger = require('../app/middlewares/logger.js');
var autoLoad = require('auto-load');

var config = require('./configuration.js');
var addRoutes = require(__dirname + '/../app/routes.js');

// TODO: reinstate less compile middleware?
// TODO: reinstate some sort of basic static folder to serve the app's client?

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
    server.use(logger);
  }

  // Common middlewares
  server.use(restify.queryParser());
  server.use(restify.bodyParser());
  server.use(require('../app/middlewares/CORS.js'));

  // Routes
  addRoutes(server);

  // Prefer 404 over 405
  server.on('MethodNotAllowed', function(req, res) {
    return res.send(new restify.NotFoundError('Not found: ' + req.url + ' does not exist'));
  });

  // Error handling
  server.on('uncaughtException', function(req, res, route, err) {
    if (config.env !== 'test') {
      console.error(err.stack);
    }

    // Generic error
    if(!res._headerSent) {
      res.send(new restify.InternalServerError(err, err.message || 'unexpected error'));
      return true;
    }

    return false;
  });

  return server;
};
