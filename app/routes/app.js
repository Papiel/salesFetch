'use strict';

// Application routes use applications controller
var appControllers = require('../controllers/app');
var authorization = require('../middlewares/authorization');
var uaParser = require('../middlewares/ua-parser');
var validation = require('../middlewares/validation');

module.exports = function(app) {
  app.get('/app/context-search',
          authorization.requiresLogin,
          uaParser,
          appControllers.contextSearch);

  app.get('/app/pinned',
          authorization.requiresLogin,
          uaParser,
          validation.requiresContext,
          appControllers.pinned);
  app.get('/app/add-pin/:anyFetchId',
          authorization.requiresLogin,
          uaParser,
          validation.requiresContext,
          appControllers.addPin);
  app.get('/app/remove-pin/:anyFetchId',
          authorization.requiresLogin,
          uaParser,
          validation.requiresContext,
          appControllers.removePin);

  app.get('/app/documents/:id',
          authorization.requiresLogin,
          uaParser,
          appControllers.documentDisplay);
  app.get('/app/providers',
          authorization.requiresLogin,
          uaParser,
          appControllers.listProviders);
  app.get('/app/providers/connect',
          authorization.requiresLogin,
          appControllers.connectProvider);
};
