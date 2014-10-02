'use strict';

var restify = require('restify');
var autoLoad = require('auto-load');
var url = require('url');
var AnyFetch = require('anyfetch');

var config = require('./configuration.js');
var logger = require('../app/middlewares/logger.js');
var logError = require('./services.js').logError;
var addRoutes = require(__dirname + '/../app/routes.js');


module.exports = function(server) {
  // Check if fetchApi token is set before continuing!
  if(config.env !== 'test' && !config.fetchApiCreds) {
    console.log('Please provide a FetchApi token before launching the server.');
    process.exit(1);
  }

  if(config.code === undefined) {
    console.log("For security reasons, you need to explicitly provide a `CODE` environment var. You may leave it empty for development.");
    process.exit(1);
  }

  // Configure anyfetch.js access URLs
  AnyFetch.setApiUrl(config.fetchApiUrl);
  AnyFetch.setManagerUrl(config.managerUrl);

  // Models
  autoLoad(__dirname + '/../app/models');

  // Simplified logger for dev and production
  if(config.env !== 'test') {
    server.use(logger);
  }

  // Common middlewares
  server.use(restify.queryParser());
  server.use(restify.bodyParser());
  server.use(require('../app/middlewares/cors.js'));

  // Routes
  addRoutes(server);

  // Prefer 404 over 405
  server.on('MethodNotAllowed', function(req, res) {
    var parsed = url.parse(req.url);
    var path = parsed.pathname.replace(/%/g, '%%');
    return res.send(new restify.NotFoundError('Not found: ' + path + ' does not exist'));
  });

  // Error handling
  server.on('uncaughtException', function(req, res, route, err) {
    logError(err, {
      uncaughtRestifyException: true,
      path: true,
      headers: req.headers.join(', '),
      statusCode: req.statusCode,
      query: JSON.stringify(req.query),
      body: JSON.stringify(req.body),
      authorization: req.authorization,
    });

    // Generic error
    if(!res._headerSent) {
      res.send(new restify.InternalServerError(err, err.message || 'unexpected error'));
      return true;
    }

    return false;
  });

  return server;
};
