'use strict';

var autoLoad = require('auto-load');
var config = require('../config/configuration.js');

module.exports = function(app) {
  var lib = autoLoad(__dirname);

  var middlewares = lib.middlewares;
  var controllers = lib.controllers;

  app.post('/admin/init', controllers.admin.index.post);

  app.get('/app/documents',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.requiresContext,
    controllers.app.documents.index.get);

  app.get('/app/documents/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    controllers.app.documents.id.index.get);

  app.get('/app/pins',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.requiresContext,
    controllers.app.pins.index.get);

  app.post('/app/pins/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    controllers.app.pins.id.index.post);

  app.del('/app/pins/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    controllers.app.pins.id.index.del);

  app.get('/app/providers',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    controllers.app.providers.index.get);

  app.post('/app/providers',
    middlewares.authorization.requiresLogin,
    controllers.app.providers.index.post);

  // render knockout at /index.html
  app.get(/(.*.html)/i, function(req, res, next) {
    var filename = '../..' + req.params[0];
    res.render(filename);
  });

  if(config.env === 'development') {
    app.get('/', controllers.dev.contextCreator);
  }
};
