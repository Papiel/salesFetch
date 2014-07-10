'use strict';

var autoLoad = require('auto-load');
var config = require('../config/configuration.js');

module.exports = function(app) {
  var lib = autoLoad(__dirname);

  var middlewares = lib.middlewares;
  var handlers = lib.handlers;

  app.post('/admin/init', handlers.admin.index.post);

  app.get('/app/documents',
    middlewares.authorization.requiresLogin,
    middlewares.requiresContext,
    handlers.app.documents.index.get);

  app.get('/app/documents/:id',
    middlewares.authorization.requiresLogin,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.documents.id.index.get);

  app.get('/app/pins',
    middlewares.authorization.requiresLogin,
    middlewares.requiresContext,
    handlers.app.pins.index.get);

  app.post('/app/pins/:id',
    middlewares.authorization.requiresLogin,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.pins.id.index.post);

  app.del('/app/pins/:id',
    middlewares.authorization.requiresLogin,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.pins.id.index.del);

  app.get('/app/providers',
    middlewares.authorization.requiresLogin,
    handlers.app.providers.index.get);

  app.post('/app/providers',
    middlewares.authorization.requiresLogin,
    handlers.app.providers.index.post);

  if(config.env === 'development') {
    app.get('/', handlers.dev.contextCreator);
  }
};
