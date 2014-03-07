'use strict';
var request = require('supertest');


module.exports.checkUnauthenticated = function checkUnauthenticated(app, verb, endpoint) {
  it('should reject unauthentified user', function(done) {
    request(app)
      [verb](endpoint)
      .expect(401)
      .end(done);
  });
};
