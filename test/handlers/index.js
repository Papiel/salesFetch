'use strict';

require("should");

var request = require('supertest');
var app = require('../../app.js');


describe('/ endpoint', function() {
  var endpoint = '/';

  it('should redirect to http://salesfetch.anyfetch.com', function(done) {
    request(app)
      .get(endpoint)
      .expect(function(res) {
        res.header.location.should.equal('http://salesfetch.anyfetch.com');
      })
      .end(done);
  });
});
