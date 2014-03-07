'use strict';

require("should");

var request = require('supertest');
var app = require('../../app.js');
var login = require('../helpers/login').authenticateCall;
var checkUnauthenticated = require('../helpers/access').checkUnauthenticated;
var fetchAPI = require('../helpers/fetchAPI');

describe('<Application controller>', function() {
  var agent;
  beforeEach(function(done) {
    login(request(app), function(loginAgent) {
      agent = loginAgent;
      fetchAPI.mount(done);
    });
  });


  describe('/context-search page', function() {
    var endpoint = '/app/context-search';

    checkUnauthenticated(app, 'get', endpoint);

    it("should return contextual datas", function(done) {
      var req = request(app).get(endpoint);
      agent.attachCookies(req);
      req
        .expect(200)
        .expect(function(res) {
          res.text.should.containDeep("Albert Einstein");
          res.text.should.containDeep("/app/documents/5309c5913a59fda826adc1d8");
        })
        .end(done);
    });
  });

  describe('/documents/:id page', function() {
    var endpoint = '/app/documents/5309c57d9ba7daaa265ffdc9';
    checkUnauthenticated(app, 'get', endpoint);

    it("should return document datas", function(done) {
      var req = request(app).get(endpoint);
      agent.attachCookies(req);
      req
        .expect(200)
        .expect(function(res) {
          res.text.should.containDeep("pdf2htmlEX");
          res.text.should.containDeep("mehdi.bouheddi@papiel.fr");
        })
        .end(done);
    });
  });

});
