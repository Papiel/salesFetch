'use strict';

// Application routes use administration controller
var admin = require('../controllers/admin');

module.exports = function(app) {
  app.post('/admin/init', admin.init);
};
