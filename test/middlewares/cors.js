'use strict';

require('should');

var request = require('supertest');

var app = require('../../app.js');

describe('CORS', function() {
  it('should return nice headers for OPTION calls', function(done) {
    request(app)
      .options('/app/documents')
      .expect(204)
      .expect('Access-Control-Allow-Headers', 'Accept, Accept-Version, Authorization, Content-Type, Api-Version, X-Requested-With')
      .expect('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      .expect(function(res) {
        // This header is only sent for valid force.com hosts
        res.headers.should.not.have.property('Access-Control-Allow-Origin');
      })
      .end(done);
  });
});
