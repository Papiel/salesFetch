'use strict';

require("should");
var request = require('supertest');

var app = require('../../app.js');

describe('<Errors middleware>', function() {
  it('should respond with 404 when not found', function(done) {
    request(app).get('/unknown_route')
      .expect(404)
      .expect(/unknown_route/i)
      .expect(/does not exist/i)
      .end(done);
  });
});
