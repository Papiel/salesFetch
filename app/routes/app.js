'use strict';

// Application routes use applications controller
var appControllers = require('../controllers/app');
var authorization = require('../middlewares/authorization');
var uaParser = require('../middlewares/ua-parser');
var idIsObjectId = require('../middlewares/id-is-object-id.js');
var requiresContext = require('../middlewares/requires-context.js');

module.exports = function(app) {
  app.get('/app/context-search',
    authorization.requiresLogin,
    uaParser,
    requiresContext,
    appControllers.contextSearch);

  app.get('/app/pinned',
    authorization.requiresLogin,
    uaParser,
    requiresContext,
    appControllers.pinned);
  app.get('/app/add-pin/:id',
    authorization.requiresLogin,
    uaParser,
    idIsObjectId,
    requiresContext,
    appControllers.addPin);
  app.get('/app/remove-pin/:id',
    authorization.requiresLogin,
    uaParser,
    idIsObjectId,
    requiresContext,
    appControllers.removePin);

  app.get('/app/documents/:id',
    authorization.requiresLogin,
    uaParser,
    idIsObjectId,
    requiresContext,
    appControllers.documentDisplay);
  app.get('/app/providers',
    authorization.requiresLogin,
    uaParser,
    appControllers.listProviders);
  app.get('/app/providers/connect',
    authorization.requiresLogin,
    appControllers.connectProvider);
};
