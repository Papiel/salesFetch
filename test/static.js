'use strict';

require('should');
var request = require('supertest');

var app = require('../app.js');
var cleaner = require('./hooks/cleaner');

describe('<Static content>', function() {
  beforeEach(cleaner);

  it('should serve HTML', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect(/<head>/i)
      .expect(/<body>/i)
      .end(done);
  });

  it('should serve JS', function(done) {
    request(app)
      .get('/js/client.js')
      .expect(200)
      .expect('Content-type', 'application/javascript')
      .end(done);
  });
});


