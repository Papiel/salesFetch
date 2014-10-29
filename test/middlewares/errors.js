'use strict';

require("should");
var request = require('supertest');

var app = require('../../app.js');

describe('<Errors>', function() {
  it('should respond with 404 when not found', function(done) {
    request(app).get('/unknown_route')
      .expect(404)
      .expect(/unknown_route/i)
      .expect(/does not exist/i)
      .end(done);
  });

  it('should not crash on 404 with unsafe characters', function(done) {
    request(app).get('/dangereous_$*`£%ùàé"_route')
      .expect(404)
      .expect(/dangereous_.*_route/i)
      .expect(/does not exist/i)
      .end(done);
  });

  it('should err (but not crash) on badly formatted `data` argument', function(done) {
    request(app).get('/app/documents')
      .query({data: 'this is not JSON'})
      .expect(422)
      .expect(/malformed JSON/i)
      .end(done);
  });
});
