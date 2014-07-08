'use strict';

require("should");
var request = require('supertest');
var app = require('../../app.js');


describe('<Errors middleware>', function() {

  it('should render 404 page if not found', function(done) {

    request(app).get('/it/does/not/exist')
      .expect(404)
      .expect(function(res) {
        res.text.should.containDeep('Page not found');
      })
      .end(done);
  });
});
