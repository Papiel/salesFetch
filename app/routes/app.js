'use strict';

// Application routes use applications controller
var appControllers = require('../controllers/app');
var authorization = require('../middlewares/authorization');
var uaParser = require('../middlewares/ua-parser');

module.exports = function(app) {
  app.get('/app/context-search', authorization.requiresLogin, uaParser, appControllers.contextSearch);
  app.get('/app/pinned', authorization.requiresLogin, uaParser, appControllers.pinned);
  app.get('/app/documents/:id', authorization.requiresLogin, uaParser, appControllers.documentDisplay);
  app.get('/app/providers', authorization.requiresLogin, uaParser, appControllers.listProviders);
  app.get('/app/providers/connect', authorization.requiresLogin, appControllers.connectProvider);
};
