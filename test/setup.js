'use strict';

var AnyFetch = require('anyfetch');

var config = require('../config/configuration.js');

var server;

/**
 * Before running any test: start the mock server
 * and point all AnyFetch API calls towards it
 */
before(function(done) {
  var port = config.port + 1;
  var mockUrl = 'http://localhost:' + port;

  server = AnyFetch.createMockServer();

  server.listen(port, function() {
    console.log('AnyFetch API mock server listening on', mockUrl);

    AnyFetch.server = server;
    AnyFetch.setApiUrl(mockUrl);
    AnyFetch.setManagerUrl(mockUrl);
    config.managerUrl = mockUrl;

    done();
  });
});

/**
 * Close down mock server
 */
after(function() {
  AnyFetch.server.close();
});
