'use strict';

var autoLoad = require('auto-load');
var config = require('../config/configuration.js');

module.exports = function(server) {
  var lib = autoLoad(__dirname);

  var middlewares = lib.middlewares;
  var handlers = lib.handlers;

  server.post('/admin/init', handlers.admin.index.post);

  server.get('/app/documents',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.requiresContext,
    handlers.app.documents.index.get);

  server.get('/app/documents/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.documents.id.index.get);

  server.get('/app/pins',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.requiresContext,
    handlers.app.pins.index.get);

  server.post('/app/pins/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.pins.id.index.post);

  server.del('/app/pins/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.pins.id.index.del);

  server.get('/app/providers',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    handlers.app.providers.index.get);

  server.post('/app/providers',
    middlewares.authorization.requiresLogin,
    handlers.app.providers.index.post);

  if(config.env === 'development' || config.env === 'test') {
    server.get('/', handlers.dev.contextCreator);
  }

  /**
   * Allow cross-origin OPTION requests
   */
  server.opts(/\.*/, function(req, res, next) {
    res.send(204);
    next();
  });
};
