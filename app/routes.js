'use strict';

var restify = require('restify');
var autoLoad = require('auto-load');

module.exports = function(server) {
  var lib = autoLoad(__dirname);

  var middlewares = lib.middlewares;
  var handlers = lib.handlers;

  // Redirect `/` to the main website
  server.get('/', handlers.index.get);

  server.post('/admin/init', handlers.admin.init.post);

  server.get('/app/documents',
    middlewares.checkParams,
    middlewares.ensureValidHash,
    middlewares.authorization,
    middlewares.requiresContext,
    handlers.app.documents.index.get);

  server.get('/app/documents/:id',
    middlewares.checkParams,
    middlewares.ensureValidHash,
    middlewares.authorization,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.documents.id.index.get);

  server.get('/app/pins',
    middlewares.checkParams,
    middlewares.ensureValidHash,
    middlewares.authorization,
    middlewares.requiresContext,
    handlers.app.pins.index.get);

  server.post('/app/pins/:id',
    middlewares.checkParams,
    middlewares.ensureValidHash,
    middlewares.authorization,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.pins.id.index.post);

  server.del('/app/pins/:id',
    middlewares.checkParams,
    middlewares.ensureValidHash,
    middlewares.authorization,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    handlers.app.pins.id.index.del);

  server.get('/app/providers',
    middlewares.checkParams,
    middlewares.ensureValidHash,
    middlewares.authorization,
    handlers.app.providers.index.get);

  server.post('/app/providers/:id',
    middlewares.checkParams,
    middlewares.ensureValidHash,
    middlewares.authorization,
    handlers.app.providers.index.post);

  server.post('/app/init',
    middlewares.checkParams,
    middlewares.ensureValidHash,
    handlers.app.init.index.post);

  // Dev endpoints, for testing out of SF1
  server.get('/dev/context-creator', middlewares.requireAuthCode, handlers.dev.contextCreator.get);
  server.post('/dev/context-creator', middlewares.requireAuthCode,  handlers.dev.contextCreator.post);


  /**
   * Allow cross-origin OPTION requests
   */
  server.opts(/.*/i, function(req, res, next) {
    res.send(204);
    next();
  });

  /**
   * Allow static resources to be served directly
   * We assume that static files have an extension
   * (presence of a `.`), but backend routes don't
   */
  server.get(/^\/$|\./i, restify.serveStatic({
    directory: 'public',
    default: 'app.html'
  }));
};
