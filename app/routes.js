'use strict';

var autoLoad = require('auto-load');

module.exports = function(app) {
  var lib = autoLoad(__dirname);

  var middlewares = lib.middlewares;
  var controllers = lib.controllers;

  app.post('/admin/init', controllers.admin.index.get);

  app.get('/app/context-search',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.requiresContext,
    controllers.app.contextSearch);

  app.get('/app/pinned',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.requiresContext,
    controllers.app.pinned);

  app.get('/app/add-pin/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    controllers.app.addPin);

  app.get('/app/remove-pin/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    controllers.app.removePin);

  app.get('/app/documents/:id',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    middlewares.idIsObjectId,
    middlewares.requiresContext,
    controllers.app.documentDisplay);

  app.get('/app/providers',
    middlewares.authorization.requiresLogin,
    middlewares.uaParser,
    controllers.app.listProviders);

  app.get('/app/providers/connect',
    middlewares.authorization.requiresLogin,
    controllers.app.connectProvider);

};
