'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var swig = require('swig');
var lessMiddleware = require('less-middleware');
var errorsStack = require('errorhandler');
var autoLoad = require('auto-load');

var config = require('./configuration.js');

var expressConfig = function(app) {

  // Simplified logger for dev and production
  if (config.env !== 'test') {
    app.use(require('../app/middlewares/logger.js'));
  }

  // Other middlewares
  app.use(bodyParser());
  app.use(require('../app/middlewares/CORS.js'));

  // Less middleware
  var lessPath = config.root + '/assets/less';
  var publicPath = config.root + '/public';
  var bootstrapPath = config.root + '/public/lib/bootstrap/less';
  app.use(lessMiddleware(lessPath, {
    dest: publicPath,
    force: !config.less.cache || false,
    preprocess: {
      path: function(pathname) {
        return pathname.replace('/stylesheets', '');
      }
    },
    parser: {
      paths: [bootstrapPath],
    }
  }));

  // Views engine
  swig.setDefaults({
    cache: config.swig.cache
  });
  app.engine('html', swig.renderFile);

  // View directory
  app.set('view engine', 'html');
  app.set('views', config.root + '/app/views');

  // Static files
  app.use('/img', express.static(config.root + '/public/lib/bootstrap/img'));
  app.use(express.static(config.root + '/public'));
};

var errorsHandlers = function(app) {
  // This middleware is used to provide a next
  app.use(function(err, req, res, next) {

    if (config.env !== 'test') {
      console.error(err.stack);
    }

    // Error page
    var code = err.statusCode || err.status || err.code || 500;
    // Use specific error page template (if available)
    var page = config.errorsPath + '/error';
    if (code in config.errorFiles) {
      page = config.errorsPath + '/' + config.errorFiles[code];
    }
    return res.status(code).render(page, {
      error: err.stack,
      message: err.message,
      url: req.originalUrl // Used in 404 error
    });
  });

  // Default error: 404 (no other middleware responded)
  app.use(function(req, res) {
    return res.status(404).render('errors/404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });

  if (config.env === 'development') {
    app.use(errorsStack());
  }
};

module.exports = function() {
  // Check if fetchApi token is set before continuing!
  if (config.env !== 'test' && !config.fetchApiCreds) {
    console.log('Please provide a FetchApi token before launching the server.');
    process.exit(1);
  }

  // Require models
  autoLoad(__dirname + '/../app/models');

  // Configure express
  var app = express();
  expressConfig(app);

  // Require routes
  var routesPath = __dirname + '/../app/routes';
  var routes = autoLoad(routesPath);
  Object.keys(routes).forEach(function(route) {
    require(routesPath + '/' + route)(app);
  });

  // Require errors
  autoLoad(__dirname + '/../app/errors');

  // Apply errors if routing fails or doesn't match
  errorsHandlers(app);

  return app;
};